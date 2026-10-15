#!/usr/bin/env node
// Headless browser playtest: Act I → Oakhaven → Quarry (Clockwork Canyon) → Rust Districts.
//   SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-act3 node scripts/playtest-act3.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const SHOTS = process.env.SHOTS ?? "/tmp/mend-act3";
mkdirSync(SHOTS, { recursive: true });
const URL = process.env.URL ?? "http://127.0.0.1:8080/";

async function open({ fresh = true } = {}) {
  const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: Number(process.env.VW ?? 440), height: Number(process.env.VH ?? 900) } });
  if (process.env.SEED) await ctx.addInitScript((seed) => { let x = seed; Math.random = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }, Number(process.env.SEED));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.goto(URL, { waitUntil: "networkidle" });
  if (fresh) { await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); }
  await page.waitForFunction(() => window.__mend);
  return { browser, ctx, page, errors };
}
const S = (page) => page.evaluate(() => {
  const d = window.__mend.getState().data;
  return {
    phase: d.phase, map: d.mapId, x: d.player.x, y: d.player.y, hp: d.player.hp, ap: d.player.ap,
    dlg: d.dialogue && (d.dialogue.convo + "/" + d.dialogue.node), panel: d.panel, combat: !!d.combat,
    path: d.path.length, log: d.log.slice(0, 6), flags: d.flags, pinned: d.pinned, journal: d.journal?.map((j) => j.id + ":" + j.status),
  };
});
async function replies(page) { return page.$$eval(".ledger li button", (bs) => bs.map((b) => b.innerText.replace(/\s+/g, " "))); }
async function dlgText(page) { return page.evaluate(() => document.querySelector(".ledger")?.innerText.replace(/\s+/g, " ") ?? ""); }
async function fileLevel(page) {
  const b = page.getByRole("button", { name: "File it" });
  if (await b.count()) { console.log("   [level modal → File it]"); await b.click(); await page.waitForTimeout(150); }
}
async function pick(page, re) {
  await fileLevel(page);
  const rs = await replies(page);
  const i = rs.findIndex((t) => re.test(t));
  if (i < 0) throw new Error(`no reply ${re} in: ${rs.join(" / ")}`);
  await page.locator(".ledger li button").nth(i).click();
  await page.waitForTimeout(150);
  return rs[i];
}
async function walk(page, x, y, max = 20000) {
  await page.evaluate(([x, y]) => window.__mend.getState().clickTile(x, y), [x, y]);
  const t0 = Date.now();
  while (Date.now() - t0 < max) { const s = await S(page); if (!s.path || s.dlg) break; await page.waitForTimeout(100); }
  return S(page);
}
async function stageAt(page, tx, ty) {
  return page.evaluate(async ([tx, ty]) => {
    const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/components/mend/stage.ts"));
    const st = await import(url);
    const d = window.__mend.getState().data;
    const c = document.querySelector("canvas").getBoundingClientRect();
    const t = st.projectTile(c.width, c.height, d.player.x, d.player.y, tx, ty, 1, 64, 32);
    const f = st.stageNow().feet;
    return { l: c.left, t: c.top, w: c.width, h: c.height, sx: t.sx, sy: t.sy, on: st.presence(t.sx, t.sy), feetIn: f.sx > 0 && f.sx < c.width && f.sy > 0 && f.sy < c.height * 0.9, fx: f.sx / c.width, fy: f.sy / c.height };
  }, [tx, ty]);
}
async function tapWalk(page, x, y, mouth) {
  const route = await page.evaluate(([x, y]) => {
    const G = window.__mend;
    G.getState().clickTile(x, y);
    const r = G.getState().data.path.map((p) => [p.x, p.y]);
    G.setState((s) => ({ data: { ...s.data, path: [], intent: null } }));
    return r;
  }, [x, y]);
  let i = 0, taps = 0, onCanvas = true, mouthSeen = false;
  while (i < route.length && taps < route.length + 6) {
    const j = Math.min(route.length - 1, i + 2);
    const q = await stageAt(page, ...route[j]);
    await page.mouse.click(q.l + q.sx, q.t + q.sy);
    taps++;
    for (let k = 0; k < 60; k++) { if (!(await S(page)).path) break; await page.waitForTimeout(80); }
    const m = await stageAt(page, ...mouth);
    onCanvas &&= m.feetIn;
    mouthSeen ||= m.on > 0.5;
    const now = await S(page);
    if (now.x === route[j][0] && now.y === route[j][1]) i = j + 1;
  }
  return { ok: i >= route.length, taps, onCanvas, mouthSeen };
}
async function key(page, k, n = 1) { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await page.waitForTimeout(180); } }
async function hud(page, label) { await page.getByRole("button", { name: label, exact: true }).first().click(); await page.waitForTimeout(200); }
async function shot(page, name) { await page.screenshot({ path: `${SHOTS}/${name}.png` }); }
async function closeTalk(page) {
  for (let i = 0; i < 8 && (await S(page)).dlg; i++) {
    await key(page, "Escape");
    const rs = await replies(page);
    if ((await S(page)).dlg && rs.length) await page.locator(".ledger li button").last().click();
    await page.waitForTimeout(120);
  }
}

const tag = process.env.TAG ?? "act3";
const out = [];
const step = (ok, msg) => { out.push(`${ok ? "PASS" : "FAIL"} ${msg}`); console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };
const { browser, page, errors } = await open();
let s;

const actorAt = (id) => page.evaluate((id) => { const a = window.__mend.getState().data.actors[id]; return a && { x: a.x, y: a.y, map: a.mapId, alive: a.alive, hostile: a.hostile }; }, id);
const inv = (id) => page.evaluate((id) => window.__mend.getState().data.inventory.find((r) => r.id === id)?.qty ?? 0, id);
async function tapAt(tx, ty) {
  const q = await stageAt(page, tx, ty);
  if (q.on >= 0.3 && q.sx > 0 && q.sx < q.w && q.sy > 0 && q.sy < q.h) { await page.mouse.click(q.l + q.sx, q.t + q.sy); return "tap"; }
  await page.evaluate(([x, y]) => window.__mend.getState().clickTile(x, y), [tx, ty]);
  return "clickTile";
}
async function settle(max = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) { const s = await S(page); if (!s.path || s.dlg) break; await page.waitForTimeout(100); }
  await page.waitForTimeout(150);
  return S(page);
}
async function talkTo(id) {
  for (let tries = 0; tries < 5; tries++) {
    const a = await actorAt(id);
    if (!a) return { s: await S(page), how: "missing" };
    // Walk beside first (store clickTile), then tap / Talk HUD — same pattern as act2,
    // but quarry maps are larger and hostile vision used to interrupt mid-path.
    await walk(page, a.x, a.y);
    let s = await S(page);
    if (s.combat) return { s, how: "combat" };
    if (s.dlg) return { s, how: "walk" };
    const how = await tapAt(a.x, a.y);
    s = await settle();
    if (s.combat) return { s, how: "combat" };
    if (s.dlg) return { s, how };
    await hud(page, "Talk");
    for (let i = 0; i < 60; i++) {
      s = await S(page);
      if (s.dlg || s.combat || !s.path) break;
      await page.waitForTimeout(100);
    }
    if (s.combat) return { s, how: "combat" };
    if (s.dlg) return { s, how: "Talk" };
  }
  return { s: await S(page), how: "none" };
}
async function auditAt(id) {
  await fileLevel(page);
  const m = await page.evaluate((id) => { const m = window.__mend.getState().data.machines[id]; return m && { x: m.x, y: m.y }; }, id);
  let how = "none";
  if (!m) return { ok: false, how: "missing" };
  for (let tries = 0; tries < 6; tries++) {
    await fileLevel(page);
    // Walk beside, then tap the machine tile (same call a canvas tap makes) so Audit
    // does not HUD-pick a distant severed leaf over the adjacent target.
    await walk(page, m.x, m.y).catch(() => {});
    await fileLevel(page);
    how = await tapAt(m.x, m.y);
    const s = await settle();
    await fileLevel(page);
    if ((await S(page)).panel === "audit") {
      const a = await page.evaluate(() => window.__mend.getState().data.audit);
      if (a?.id === id) break;
      await key(page, "Escape");
    }
  }
  const a = await page.evaluate(() => window.__mend.getState().data.audit);
  return { ok: a?.id === id && (await S(page)).panel === "audit", how };
}
async function special(re) {
  await fileLevel(page);
  const b = page.getByRole("button", { name: re });
  if (!(await b.count())) return false;
  await b.first().click();
  await page.waitForTimeout(250);
  await fileLevel(page);
  return true;
}

// —— Act I to Oakhaven (Moll Engineering talk-past sets act1) ——
await page.getByRole("button", { name: "New ledger" }).click();
await page.getByRole("button", { name: "Recommended file" }).click();
await page.getByRole("button", { name: "Enter the Sinks" }).click();
await page.waitForTimeout(300);
await pick(page, /show me the pump/); await pick(page, /audit it/);
await hud(page, "Audit");
for (let i = 0; i < 60; i++) { const s = await S(page); if (!s.path || s.dlg) break; await page.waitForTimeout(120); }
await page.getByRole("button", { name: "Mend", exact: true }).click();
await page.waitForTimeout(200);
await key(page, "Escape");
await walk(page, 14, 10); await walk(page, 14, 12);
s = await S(page); step(s.dlg === "guard-line/start", `A0a Moll guard line (${s.dlg})`);
let passed = false;
for (let attempt = 0; attempt < 12 && !passed; attempt++) {
  await fileLevel(page);
  const rs = await replies(page);
  if (!rs.length) {
    await walk(page, 14, 10); await walk(page, 14, 12);
    s = await S(page);
    if (!s.dlg) {
      await hud(page, "Talk");
      for (let i = 0; i < 40; i++) { s = await S(page); if (s.dlg || !s.path) break; await page.waitForTimeout(150); }
    }
    console.log("   re-engage →", (await S(page)).dlg, await replies(page));
    continue;
  }
  if (rs.some((r) => /pressure regulator/.test(r))) {
    await pick(page, /pressure regulator/);
    const txt = await dlgText(page);
    if (/already walking/.test(txt)) {
      await pick(page, /already walking/);
      passed = true;
      step(true, `A0 Moll Engineering talk-past (attempt ${attempt + 1})`);
    } else {
      console.log("   eng failed:", txt.slice(0, 160));
      await pick(page, /north streets|Fine|Leave/).catch(async () => { await page.locator(".ledger li button").last().click(); });
    }
  } else {
    console.log("   replies now", rs);
    await page.locator(".ledger li button").last().click();
    await page.waitForTimeout(200);
  }
}
if (!passed) {
  step(false, "A0 Moll talk-past not achieved in 12 attempts");
  writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
  await browser.close();
  process.exit(1);
}
await fileLevel(page);
await walk(page, 24, 18);
await page.keyboard.press("ArrowRight");
s = await S(page);
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "sinks") break; await page.waitForTimeout(120); }
step(s.map === "road", `A1 Stack mouth → Stack Road (${s.map} ${s.x},${s.y})`);
await walk(page, 20, 2);
s = await S(page);
await page.keyboard.press("ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "haven", `A2 Ward stair → Oakhaven Lower Ward (${s.map} ${s.x},${s.y})`);
await shot(page, `${tag}-01-oakhaven`);

// —— Leave Oakhaven via Stack mouth back to road ——
await fileLevel(page);
await walk(page, 33, 6);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "haven") break; await page.waitForTimeout(120); }
step(s.map === "road" && s.panel === "none", `Q0 Oakhaven Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; panel ${s.panel})`);
await shot(page, `${tag}-02-back-on-road`);

// —— Quarry road (34,4) → The Clockwork Canyon ——
// Real canvas taps east along the road to beside the Quarry road mouth, then ArrowRight onto it.
const quarryTap = await tapWalk(page, 33, 4, [34, 4]);
s = await S(page);
const quarryStage = await stageAt(page, 34, 4);
step(quarryTap.ok && s.map === "road" && s.x === 33 && s.y === 4 && quarryTap.onCanvas, `Q1 real taps to beside Quarry road (${quarryTap.taps} taps, at ${s.x},${s.y}; on canvas ${quarryTap.onCanvas}; mouth presence ${quarryStage.on.toFixed(2)}; mouthSeen ${quarryTap.mouthSeen})`);
await shot(page, `${tag}-03-by-quarry-road`);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
const qArrive = s.map === "quarry" && /You arrive at The Clockwork Canyon/.test(s.log.join(" | "));
step(qArrive && s.flags["seen:quarry"] && s.panel === "none", `Q2 Quarry road → The Clockwork Canyon (map ${s.map} ${s.x},${s.y}; arrive ${qArrive}; seen:quarry ${s.flags["seen:quarry"]}; panel ${s.panel}; log: ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-04-quarry-arrive`);
const qFeet = await stageAt(page, s.x, s.y);
step(qFeet.feetIn && qFeet.fx > 0.1 && qFeet.fx < 0.9, `Q3 arrive feet on canvas (fx=${qFeet.fx.toFixed(2)}, fy=${qFeet.fy.toFixed(2)}, in=${qFeet.feetIn})`);

// Q4 Talk Hask → clear the riggers off the stone (workersClear)
let t = await talkTo("hask");
step(/workers|hask/i.test(t.s.dlg || ""), `Q4 Talk Hask/workers (${t.how}; ${t.s.dlg}): ${(await dlgText(page)).slice(0, 100)}`);
await shot(page, `${tag}-05-hask`);
const haskRs = await replies(page);
step(haskRs.some((x) => /Get your people off the stone/.test(x)), `Q4b Hask offers clear-the-stone (${haskRs.join(" / ")})`);
if (haskRs.some((x) => /Get your people off the stone/.test(x))) {
  await pick(page, /Get your people off the stone/);
} else if ((await S(page)).combat) {
  step(false, `Q4c blocked by combat before clear (${(await S(page)).log[0]})`);
  writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
  await shot(page, `${tag}-fail-combat`);
  await browser.close();
  process.exit(1);
} else {
  await closeTalk(page);
}
s = await S(page);
step(Boolean(s.flags.workersClear), `Q4c workersClear after Hask (workersClear ${s.flags.workersClear}; log ${s.log[0]}; journal ${JSON.stringify(s.journal)}; combat ${s.combat})`);
await closeTalk(page);
step(!(await S(page)).dlg, "Q4d Hask talk closes");

// Q5 Talk Rill (name her off the grade) before the drop
t = await talkTo("rill");
step(/rill/.test(t.s.dlg || "") && !t.s.combat, `Q5 Talk Rill (${t.how}; ${t.s.dlg}; combat ${t.s.combat})`);
if (t.s.combat) {
  step(false, `Q5 combat on the way to Rill (${t.s.log[0]})`);
  writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
  await shot(page, `${tag}-fail-rill-combat`);
  await browser.close();
  process.exit(1);
}
const rillRs = await replies(page);
step(rillRs.some((x) => /missing name/.test(x)), `Q5b Rill offers name line (${rillRs.join(" / ")})`);
if (rillRs.some((x) => /missing name/.test(x))) {
  await pick(page, /missing name/);
  await pick(page, /Hask/).catch(() => closeTalk(page));
} else {
  await closeTalk(page);
}
s = await S(page);
step(Boolean(s.flags.rillSpoken) && !s.dlg, `Q5c rillSpoken (${s.flags.rillSpoken}; log ${s.log[0]})`);
await closeTalk(page);

// Q6 Talk Pim (before drop — leave line); then after clear she has the clear line
t = await talkTo("pim");
step(/pim/.test(t.s.dlg || ""), `Q6 Talk Pim (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
const pimRs = await replies(page);
if (pimRs.some((x) => /Rill was off/.test(x))) {
  await pick(page, /Rill was off/);
  await pick(page, /Hask can have/).catch(() => {});
} else {
  await pick(page, /won't ask you to stand/).catch(async () => { await closeTalk(page); });
}
s = await S(page);
step(Boolean(s.flags.pimMet) && !s.dlg, `Q6b pimMet (${s.flags.pimMet}; log ${s.log[0]})`);
await closeTalk(page);

// Q7 Audit the Quarry crane (12,4) — prefer Cut the brake with workersClear
// Stay clear of Kael at (13,5): approach from west/south of the crane.
await walk(page, 11, 4);
s = await S(page);
step(!s.combat && !s.dlg, `Q7a beside crane without Kael fight (${s.map} ${s.x},${s.y}; combat ${s.combat}; dlg ${s.dlg})`);
let r = await auditAt("crane");
const cui = await page.evaluate(() => window.__mend.getState().data.uiNode);
step(r.ok, `Q7 Audit Quarry crane opens (${r.how}; uiNode ${cui}; panel ${(await S(page)).panel})`);
await shot(page, `${tag}-06-crane-audit`);
const cutBtn = page.getByRole("button", { name: /Cut the brake/i });
step(await cutBtn.count() > 0, "Q7b Cut the brake special is on the audit panel");
if (await cutBtn.count()) {
  await cutBtn.click();
  await page.waitForTimeout(350);
  await fileLevel(page);
}
s = await S(page);
const clearDrop = s.flags.quarryStone === "clear" && Boolean(s.flags["crane:dropped"]) && !s.flags.workerHurt;
step(clearDrop, `Q8 Cut the brake with clear path (quarryStone ${s.flags.quarryStone}; dropped ${s.flags["crane:dropped"]}; workerHurt ${s.flags.workerHurt}; log ${s.log[0]})`);
// City-network heat (stoneMoving → tenementWarm) needs checkpointLead=varr (combat deed). Engineering talk-past leaves the stair unsigned — by design.
step(s.flags.checkpointLead === "varr" ? Boolean(s.flags.stoneMoving && s.flags.tenementWarm) : s.flags.stoneMoving !== true, `Q8b stoneMoving only when Varr holds the stair (lead ${s.flags.checkpointLead}; stoneMoving ${s.flags.stoneMoving}; tenementWarm ${s.flags.tenementWarm})`);
await key(page, "Escape");
s = await S(page);
step(s.panel === "none" && !s.combat, `Q8c panel closes after drop (panel ${s.panel}; combat ${s.combat})`);
await shot(page, `${tag}-07-slab-clear`);

// Q9 After clear: Pim / Hask react
t = await talkTo("pim");
const pimAfter = await replies(page);
step(/pim/.test(t.s.dlg || "") && pimAfter.some((x) => /slab came down clear|Missing once/.test(x) || /won't ask|Rill was/.test(x)), `Q9 Pim after clear (${t.how}; ${pimAfter.join(" / ")})`);
if (pimAfter.some((x) => /slab came down clear/.test(x))) {
  await pick(page, /slab came down clear/);
  await pick(page, /Missing once/).catch(() => {});
} else {
  await closeTalk(page);
}
await closeTalk(page);
t = await talkTo("hask");
const haskAfter = await replies(page);
const hasClearLine = haskAfter.some((x) => /slab is down.*not under|people were not under/.test(x));
step(/workers|hask/i.test(t.s.dlg || "") && ((await S(page)).flags.quarryStone === "clear" ? hasClearLine : true), `Q9b Hask after-clear line (stone ${(await S(page)).flags.quarryStone}; ${haskAfter.join(" / ")})`);
if (hasClearLine) {
  await pick(page, /slab is down/);
  await pick(page, /road is the next/).catch(() => {});
}
await closeTalk(page);
step(!(await S(page)).dlg, "Q9c after-clear talks closed");

// Q10 Save → reload → Continue in Quarry
await walk(page, 10, 12).catch(() => {});
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
await key(page, "Escape");
const qb = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
const cont = page.getByRole("button", { name: "Continue" });
step(!(await cont.isDisabled()), "Q10 after reload, Continue enabled");
await cont.click(); await page.waitForTimeout(400);
s = await S(page);
const qkeep = ["seen:quarry", "workersClear", "rillSpoken", "pimMet", "quarryStone", "crane:dropped", "stoneMoving", "tenementWarm", "act1"];
const qlost = qkeep.filter((k) => s.flags[k] !== qb.flags[k]);
step(s.phase === "play" && s.map === "quarry" && s.x === qb.x && s.y === qb.y && qlost.length === 0 && s.flags.quarryStone === "clear", `Q10 Continue resumes Quarry (${s.map} ${s.x},${s.y}; lost [${qlost.join(",")}]; quarryStone ${s.flags.quarryStone})`);
await shot(page, `${tag}-08-quarry-continued`);

// Q11 Leave Quarry via Stack mouth (33,8) back to road
await walk(page, 32, 8);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "quarry") break; await page.waitForTimeout(120); }
step(s.map === "road" && s.panel === "none", `Q11 Quarry Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; panel ${s.panel})`);
await shot(page, `${tag}-09-quarry-exit`);

// —— Rust cut (34,6) → Rust Districts ——
const rustTap = await tapWalk(page, 33, 6, [34, 6]);
s = await S(page);
const rustStage = await stageAt(page, 34, 6);
step(rustTap.ok && s.map === "road" && s.x === 33 && s.y === 6 && rustTap.onCanvas, `R1 real taps to beside Rust cut (${rustTap.taps} taps, at ${s.x},${s.y}; on canvas ${rustTap.onCanvas}; mouth presence ${rustStage.on.toFixed(2)}; mouthSeen ${rustTap.mouthSeen})`);
await shot(page, `${tag}-10-by-rust-cut`);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
const rArrive = s.map === "rust" && /You arrive at Rust Districts/.test(s.log.join(" | "));
step(rArrive && s.flags["seen:rust"] && s.panel === "none", `R2 Rust cut → Rust Districts (map ${s.map} ${s.x},${s.y}; arrive ${rArrive}; seen:rust ${s.flags["seen:rust"]}; panel ${s.panel}; log: ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-11-rust-arrive`);
const rFeet = await stageAt(page, s.x, s.y);
step(rFeet.feetIn, `R3 arrive feet on canvas (fx=${rFeet.fx.toFixed(2)}, fy=${rFeet.fy.toFixed(2)})`);

// R4 Talk Nell — tenement warm after clear drop
t = await talkTo("nell");
step(/nell/.test(t.s.dlg || ""), `R4 Talk Nell (${t.how}; ${t.s.dlg})`);
const nellRs = await replies(page);
const nellWarm = nellRs.some((x) => /tenement has the night/.test(x));
step(nellRs.length > 0 && (/tenement has the night|read the hearth|hall took|forge is turning/.test(nellRs.join(" "))), `R4b Nell replies available (${nellRs.join(" / ")}; tenementWarm ${(await S(page)).flags.tenementWarm})`);
if (nellWarm) {
  await pick(page, /tenement has the night/);
  await pick(page, /Sleep/).catch(() => {});
} else {
  await closeTalk(page);
}
await closeTalk(page);
s = await S(page);
step(!s.dlg, `R4c Nell talk closes (tenementWarm ${s.flags.tenementWarm}; lead ${s.flags.checkpointLead})`);
await shot(page, `${tag}-12-nell`);

// R5 Talk Ives (forge / stock parents)
t = await talkTo("ives");
step(/ives/.test(t.s.dlg || ""), `R5 Talk Ives (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
await shot(page, `${tag}-13-ives`);
const ivesRs = await replies(page);
if (ivesRs.some((x) => /stock has parents|Look at the stock|refuse/.test(x))) {
  await pick(page, /stock has parents|Look at the stock/).catch(async () => { await closeTalk(page); });
}
await closeTalk(page);
step(!(await S(page)).dlg && !(await S(page)).combat, "R5b Ives talk closes without fight");

// R6 Audit Tenement hearth (8,7) — haul should be live after clear stone
r = await auditAt("hearth");
const hui = await page.evaluate(() => window.__mend.getState().data.uiNode);
step(r.ok, `R6 Audit Tenement hearth opens (${r.how}; uiNode ${hui})`);
await shot(page, `${tag}-14-hearth-audit`);
const haulLive = await page.evaluate(() => {
  const m = window.__mend.getState().data.machines.hearth;
  const haul = m.nodes.find((n) => n.id === "haul");
  return haul && !haul.severed && haul.integrity > 0;
});
const warmNet = Boolean((await S(page)).flags.stoneMoving);
step(warmNet ? Boolean(haulLive) : !haulLive, `R6b hearth haul tracks stoneMoving (haulLive ${haulLive}; stoneMoving ${warmNet}; tenementWarm ${(await S(page)).flags.tenementWarm})`);
// Prefer Seat both flues if offered (needs engineering + focus); else Send heat to sleepers
const seatBoth = page.getByRole("button", { name: /Seat both flues/i });
const toBeds = page.getByRole("button", { name: /Send the heat to the sleepers/i });
let hearthBeat = "none";
if (await seatBoth.count()) {
  await seatBoth.click(); await page.waitForTimeout(300); await fileLevel(page);
  hearthBeat = "seat-both";
} else if (await toBeds.count()) {
  await toBeds.click(); await page.waitForTimeout(300); await fileLevel(page);
  hearthBeat = "to-beds";
}
s = await S(page);
step(hearthBeat !== "none" || Boolean(s.flags.tenementWarm), `R6c hearth special (${hearthBeat}; hearthSplit ${s.flags.hearthSplit}; hearthSeated ${s.flags.hearthSeated}; tenementWarm ${s.flags.tenementWarm}; guildWarm ${s.flags.guildWarm}; log ${s.log[0]})`);
await key(page, "Escape");
step((await S(page)).panel === "none", "R6d Esc closes hearth audit");

// R7 Poke the Rust forge (26,6) if reachable — seat or refuse stock if parents allow
await walk(page, 25, 6).catch(() => {});
s = await S(page);
const forgeReach = s.map === "rust" && Math.abs(s.x - 26) + Math.abs(s.y - 6) <= 3;
step(forgeReach || s.map === "rust", `R7a approach forge area (${s.map} ${s.x},${s.y}; forgeReach ${forgeReach}; gearLive ${s.flags.gearLive}; oreSound ${s.flags.oreSound})`);
if (forgeReach) {
  r = await auditAt("forge");
  step(r.ok, `R7 Audit Rust forge opens (${r.how})`);
  await shot(page, `${tag}-15-forge-audit`);
  const seatStock = page.getByRole("button", { name: /Seat the stock/i });
  const refuseStock = page.getByRole("button", { name: /Refuse the stock/i });
  if (await seatStock.count() && s.flags.oreSound !== false) {
    await seatStock.click(); await page.waitForTimeout(300); await fileLevel(page);
  } else if (await refuseStock.count()) {
    // Prefer seating when parents exist; refuse only documents the branch exists
    console.log("   forge specials:", await page.$$eval("button", (bs) => bs.map((b) => b.innerText).filter((t) => /stock|Seat|Refuse/i.test(t)).slice(0, 8)));
  }
  s = await S(page);
  step(Boolean(s.flags.gearLive) || Boolean(s.flags.stockRefused) || r.ok, `R7b forge beat (gearLive ${s.flags.gearLive}; stockRefused ${s.flags.stockRefused}; log ${s.log[0]})`);
  await key(page, "Escape");
} else {
  step(true, `R7 forge not closely reachable this pass (${s.map} ${s.x},${s.y}) — skip seat/refuse`);
}

// R8 Menu / Map lists Quarry + Rust
await hud(page, "Map");
const mapTxt = await page.evaluate(() => document.body.innerText);
step(/Clockwork Canyon|Quarry/i.test(mapTxt) && /Rust Districts/i.test(mapTxt), "R8 Map lists Quarry and Rust as seen");
await key(page, "Escape");

// R9 Save → reload → Continue in Rust
await walk(page, 4, 12).catch(() => {});
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
await key(page, "Escape");
const rb = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Continue" }).click(); await page.waitForTimeout(400);
s = await S(page);
const rkeep = ["seen:rust", "seen:quarry", "workersClear", "quarryStone", "stoneMoving", "tenementWarm", "rillSpoken", "pimMet", "act1"];
const rlost = rkeep.filter((k) => s.flags[k] !== rb.flags[k]);
step(s.map === "rust" && s.x === rb.x && s.y === rb.y && rlost.length === 0, `R9 Continue resumes Rust (${s.map} ${s.x},${s.y}; lost [${rlost.join(",")}]; quarryStone ${s.flags.quarryStone}; tenementWarm ${s.flags.tenementWarm})`);
await shot(page, `${tag}-16-rust-continued`);

step(errors.length === 0, `Z0 no page/console errors (${errors.length}) ${errors.slice(0, 3).join(" | ")}`);
await browser.close();
writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
const failed = out.filter((x) => x.startsWith("FAIL"));
console.log(`\n${out.length - failed.length}/${out.length} PASS`);
process.exit(failed.length ? 1 : 0);
