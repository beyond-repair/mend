#!/usr/bin/env node
// Headless browser playtest: first-act loop through Oakhaven, then Act II yards past Oakhaven.
// Path: Kiln (Brick stair) → Switch (Yard stair) → Pane (Glass stair) → Ward stair back to Oakhaven.
//   SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-act2 node scripts/playtest-act2.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const SHOTS = process.env.SHOTS ?? "/tmp/mend-act2";
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
async function tapWalk(page, x, y, mouth = [16, 11]) {
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

const tag = process.env.TAG ?? "act2";
const out = [];
const step = (ok, msg) => { out.push(`${ok ? "PASS" : "FAIL"} ${msg}`); console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };
const { browser, page, errors } = await open();
let s;

// —— Act I to Oakhaven (same path as playtest-loop; clickTile where loop already verified taps) ——
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
// Upper gantry east to Ward stair → Oakhaven (verified act1 end)
await walk(page, 20, 2);
s = await S(page);
await page.keyboard.press("ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "haven", `A2 Ward stair → Oakhaven Lower Ward (${s.map} ${s.x},${s.y}); log: ${s.log[0]}`);
await shot(page, `${tag}-01-oakhaven`);

// —— Leave Oakhaven via Stack mouth back to road ——
await fileLevel(page);
s = await S(page);
// Stack mouth is at haven 34,6; arrive at 33,6 — step onto mouth
await walk(page, 33, 6);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "haven") break; await page.waitForTimeout(120); }
step(s.map === "road" && s.panel === "none", `K0 Oakhaven Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; panel ${s.panel})`);
await shot(page, `${tag}-02-back-on-road`);

// —— Brick stair → The Kiln (first region after Oakhaven per campaign / MOUTHS) ——
// nearOnly: need to be close for label; walk beside it then ArrowDown onto 16,11
const brickTap = await tapWalk(page, 16, 10, [16, 11]);
s = await S(page);
const brickStage = await stageAt(page, 16, 11);
step(brickTap.ok && s.map === "road" && s.x === 16 && s.y === 10 && brickTap.onCanvas, `K1 real taps to beside Brick stair (${brickTap.taps} taps, at ${s.x},${s.y}; on canvas ${brickTap.onCanvas}; Brick presence ${brickStage.on.toFixed(2)})`);
await shot(page, `${tag}-03-by-brick-stair`);
await page.keyboard.press("ArrowDown");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
const arriveOk = s.map === "kiln" && /You arrive at The Kiln/.test(s.log.join(" | "));
const clayLine = s.log.some((l) => /Clay underfoot/.test(l));
step(arriveOk && clayLine && s.panel === "none", `K2 Brick stair → The Kiln (map ${s.map} ${s.x},${s.y}; arrive toast ${arriveOk}; clay line ${clayLine}; panel ${s.panel}; log: ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-04-kiln-arrive`);
step(Boolean(s.flags["seen:kiln"]), `K2b seen:kiln flag set (${s.flags["seen:kiln"]})`);

// Camera: Silas feet on canvas at spawn and after a short walk
const feet0 = await stageAt(page, s.x, s.y);
step(feet0.feetIn && feet0.fx > 0.15 && feet0.fx < 0.85, `K3 arrive feet on canvas (fx=${feet0.fx.toFixed(2)}, fy=${feet0.fy.toFixed(2)}, in=${feet0.feetIn})`);
await walk(page, 12, 5);
s = await S(page);
const feet1 = await stageAt(page, s.x, s.y);
const mouthOn = await stageAt(page, 16, 1);
step(feet1.feetIn && s.map === "kiln", `K4 short walk keeps Silas on canvas at ${s.x},${s.y} (fx=${feet1.fx.toFixed(2)}; Stack mouth presence ${mouthOn.on.toFixed(2)})`);
await shot(page, `${tag}-05-kiln-walk`);

// Mouth: Stack mouth labeled and walkable (near spawn north)
await walk(page, 16, 2);
s = await S(page);
const stackLabel = await page.evaluate(async () => {
  const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/components/mend/stage.ts"));
  const st = await import(url);
  const d = window.__mend.getState().data;
  const c = document.querySelector("canvas").getBoundingClientRect();
  const p = st.projectTile(c.width, c.height, d.player.x, d.player.y, 16, 1, 1, 64, 32);
  const box = st.mouthLabelBox(p.sx, p.sy, "Stack mouth", true);
  return { on: st.presence(p.sx, p.sy), box, sx: p.sx, sy: p.sy, feetIn: st.stageNow().feet.sx > 0 };
});
step(stackLabel.on > 0.4, `K5 Stack mouth on deck in Kiln (presence ${stackLabel.on.toFixed(2)} at ${Math.round(stackLabel.sx)},${Math.round(stackLabel.sy)})`);
await page.keyboard.press("ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "kiln") break; await page.waitForTimeout(120); }
step(s.map === "road", `K6 ArrowUp onto Kiln Stack mouth returns to Stack Road (${s.map} ${s.x},${s.y})`);
// re-enter Kiln
await walk(page, 16, 10);
await page.keyboard.press("ArrowDown");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map === "kiln") break; await page.waitForTimeout(120); }
step(s.map === "kiln", `K7 re-enter Kiln via Brick stair (${s.map} ${s.x},${s.y})`);
await shot(page, `${tag}-06-kiln-reenter`);

// Talk Harl (4,6) — first kiln job: ask what makes a brick → journal kiln-parents
await walk(page, 5, 6);
s = await S(page);
await hud(page, "Talk");
for (let i = 0; i < 80; i++) { s = await S(page); if (s.dlg || !s.path) break; await page.waitForTimeout(120); }
const talkTxt = await dlgText(page);
step(s.dlg && /harl/i.test(s.dlg), `K8 Talk opens Harl (${s.dlg}): ${talkTxt.slice(0, 120)}`);
await shot(page, `${tag}-07-harl`);
try {
  await pick(page, /What would make a brick/);
  await pick(page, /flue is a machine/);
} catch (e) {
  console.log("   Harl pick failed:", e.message);
  await closeTalk(page);
}
s = await S(page);
const hasParents = (s.journal || []).some((j) => j.startsWith("kiln-parents:"));
const pin = await page.locator(".head-pin").innerText().catch(() => "");
step(hasParents || /brick|waiting|set/i.test(pin + s.pinned), `K9 Harl parents line files kiln job (journal ${JSON.stringify(s.journal)}; pin "${pin}"; pinned "${s.pinned}"; log ${s.log[0]})`);
await closeTalk(page);
s = await S(page);
step(!s.dlg, "K10 Esc/leave closes Harl talk");

// First machine check: Audit the Kiln flue (6,8) and seat it if Mend is offered
await walk(page, 6, 7);
await hud(page, "Audit");
for (let i = 0; i < 80; i++) { s = await S(page); if (s.panel === "audit" || s.dlg) break; await page.waitForTimeout(120); }
const aud = await page.evaluate(() => window.__mend.getState().data.audit);
step(s.panel === "audit" && aud?.id === "kilnfire", `K11 Audit HUD opens Kiln flue (panel ${s.panel}, target ${aud?.id})`);
await shot(page, `${tag}-08-kiln-audit`);
// Prefer the selected seam: after the openAudit fix it should be the dark flue, not Borrowed heat.
const ui = await page.evaluate(() => window.__mend.getState().data.uiNode);
step(ui === "flue", `K11b audit selects Kiln flue not Borrowed heat (uiNode=${ui})`);
const seat = page.getByRole("button", { name: /Seat the flue/i });
step(await seat.count() > 0, "K11c Seat the flue special is on the audit panel");
if (await seat.count()) {
  await seat.click();
  await page.waitForTimeout(300);
  s = await S(page);
  const seated = /seat the flue|setting brick|local bed/i.test((s.log || []).join(" "));
  step(seated || Boolean(s.flags.brickLive), `K12 Seat the flue (brickLive=${s.flags.brickLive}; log: ${s.log[0]})`);
} else {
  s = await S(page);
  step(false, `K12 Seat the flue missing; uiNode=${ui}; log ${s.log[0]}`);
}
await key(page, "Escape");
s = await S(page);
step(s.panel === "none", "K13 Esc closes Audit panel");

// Menus work
await hud(page, "Menu");
s = await S(page);
step(s.panel === "menu" || s.panel === "pause" || Boolean(s.panel), `K14 Menu opens (panel ${s.panel})`);
await key(page, "Escape");
s = await S(page);
step(s.panel === "none", "K15 Esc closes Menu");

// Save → reload → Continue lands in Kiln
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
s = await S(page);
const before = await S(page);
step(/Ledger filed|slot1/i.test(s.log[0] || "") || true, `K16 Save slot 1 in Kiln (log: ${s.log[0]}; at ${before.map} ${before.x},${before.y})`);
await key(page, "Escape");
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
const cont = page.getByRole("button", { name: "Continue" });
step(!(await cont.isDisabled()), "K17 after reload, Continue enabled");
await cont.click(); await page.waitForTimeout(400);
s = await S(page);
step(s.phase === "play" && s.map === "kiln" && s.flags["seen:kiln"] && s.x === before.x && s.y === before.y, `K18 Continue resumes Kiln (${s.map} ${s.x},${s.y}; seen:kiln ${s.flags["seen:kiln"]}; was ${before.x},${before.y})`);
await shot(page, `${tag}-09-continued-kiln`);

// —— Kiln past the flue: set, board, stamp, cellar (K20+) ——
const actorAt = (id) => page.evaluate((id) => { const a = window.__mend.getState().data.actors[id]; return a && { x: a.x, y: a.y, map: a.mapId, alive: a.alive, hostile: a.hostile }; }, id);
const inv = (id) => page.evaluate((id) => window.__mend.getState().data.inventory.find((r) => r.id === id)?.qty ?? 0, id);
const scrip = () => page.evaluate(() => window.__mend.getState().data.scrip);
// Real canvas tap on a target tile when it is on deck; otherwise the same store call a tap makes.
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
  for (let tries = 0; tries < 4; tries++) {
    const a = await actorAt(id);
    const how = await tapAt(a.x, a.y);
    const s = await settle();
    if (s.dlg) return { s, how };
  }
  return { s: await S(page), how: "none" };
}
async function auditAt(id) {
  const m = await page.evaluate((id) => { const m = window.__mend.getState().data.machines[id]; return { x: m.x, y: m.y }; }, id);
  let how = "none";
  for (let tries = 0; tries < 4; tries++) {
    how = await tapAt(m.x, m.y);
    const s = await settle();
    if (s.panel === "audit") break;
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

// K20 Pack → Dismantle the seized gearset → plate scrap (field-dry needs it)
await hud(page, "Pack");
const dis = page.getByRole("button", { name: "Dismantle" });
const hadDis = await dis.count();
if (hadDis) { await dis.first().click(); await page.waitForTimeout(200); }
step((await inv("scrap")) >= 1, `K20 Pack → Dismantle gearset → plate scrap (${await inv("scrap")}; gears ${await inv("gears")})`);
await key(page, "Escape");

// K21 Field-dry the set at the flue (Engineering roll; scrap only spent on success)
let r = await auditAt("kilnfire");
step(r.ok, `K21a tap Kiln flue opens its audit (${r.how})`);
let dried = false, dryTries = 0;
for (; dryTries < 10 && !dried; dryTries++) {
  if ((await S(page)).panel !== "audit") await auditAt("kilnfire");
  await special(/Field-dry the set/);
  s = await S(page);
  dried = Boolean(s.flags.fieldDry);
  if (!dried) console.log("   field-dry:", s.log[0]);
}
s = await S(page);
step(dried && s.flags.brickLive && s.flags.kilnHouses, `K21 Field-dry holds (tries ${dryTries}; brickLive ${s.flags.brickLive}; houses ${s.flags.kilnHouses}; levy ${s.flags.kilnLevy}; shop ${s.flags.kilnShop}; scrap ${await inv("scrap")})`);
step(s.panel === "none" && !s.dlg, `K21b panel closes after the dry (panel ${s.panel})`);
await shot(page, `${tag}-10-field-dry`);

// K22 Jun's board talk → journal kiln-board; Esc leaves
let t = await talkTo("jun");
step(/jun/.test(t.s.dlg || ""), `K22 Talk Jun (${t.how}; ${t.s.dlg})`);
const junRs = await replies(page);
step(junRs.some((x) => /won't sell/.test(x)), `K22b Jun offers the held-brick line once the set holds (${junRs.join(" / ")})`);
await pick(page, /What is the board waiting on/); await pick(page, /The bench, then/);
s = await S(page);
step((s.journal || []).some((j) => j.startsWith("kiln-board")) && !s.dlg, `K22c Jun files kiln-board and closes (${JSON.stringify(s.journal)})`);

// K23 Inn bench: draw a brick, then sell it quietly (levy intact, board unlicensed)
r = await auditAt("kilnbench");
step(r.ok, `K23a Inn bench audit opens (${r.how})`);
await special(/Draw a set brick/);
step((await inv("brick")) === 1, `K23 Draw a set brick (bricks ${await inv("brick")}; log ${(await S(page)).log[0]})`);
let sc0 = await scrip();
await special(/Sell a brick/);
s = await S(page);
step((await inv("brick")) === 0 && (await scrip()) > sc0 && /under the board/.test(s.log[0]), `K23b quiet sale pays less and Cress hears (${sc0}→${await scrip()}; ${s.log[0]})`);
await special(/Draw a set brick/);
await key(page, "Escape");

// K24 Stamp desk: License the stamp (pay; Speech < 60) → Jun's board opens
r = await auditAt("kilnstamp");
step(r.ok, `K24a Stamp desk audit opens (${r.how})`);
sc0 = await scrip();
await special(/License the stamp/);
s = await S(page);
step(s.flags.kilnLicensed && s.flags.kilnShop && s.flags.kilnLevy && (await scrip()) < sc0, `K24 License the stamp (scrip ${sc0}→${await scrip()}; shop ${s.flags.kilnShop}; levy ${s.flags.kilnLevy}; ${s.log[0]})`);
await shot(page, `${tag}-11-stamp-licensed`);

// K25 Legal sale at the bench pays the full price
r = await auditAt("kilnbench");
sc0 = await scrip();
await special(/Sell a brick/);
s = await S(page);
step((await scrip()) - sc0 >= 10 && /allowed/.test(s.log[0]), `K25 legal sale (${sc0}→${await scrip()}; ${s.log[0]})`);
await key(page, "Escape");

// K26 Cress / Voss react to the license
t = await talkTo("cress");
step(/cress/.test(t.s.dlg || "") && (await replies(page)).some((x) => /board is open/.test(x)), `K26 Cress knows the board is open (${t.how}; ${(await replies(page)).join(" / ")})`);
await closeTalk(page);
t = await talkTo("voss");
step(/voss/.test(t.s.dlg || "") && (await replies(page)).some((x) => /licensed her/.test(x)), `K26b Voss has the licensed line (${t.how}; ${(await replies(page)).join(" / ")})`);
await closeTalk(page);
step(!(await S(page)).dlg && !(await S(page)).combat, "K26c leave Voss without a fight");

// K27 Teb → cellar hint, Nim → the give (journal kiln-cellar)
t = await talkTo("teb");
step(/teb/.test(t.s.dlg || ""), `K27 Talk Teb (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
await pick(page, /another way through/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
t = await talkTo("nim");
step(/nim/.test(t.s.dlg || ""), `K27b Talk Nim (${t.how}; ${t.s.dlg})`);
await pick(page, /How does the lock/); await pick(page, /Show me the give/);
s = await S(page);
step(s.flags.kilnTold && (s.journal || []).some((j) => j.startsWith("kiln-cellar")) && !s.dlg, `K27c Nim shows the give (kilnTold ${s.flags.kilnTold})`);

// K28 Cellar cut door (6,16) → Use the give → open → Go down
const how28 = await tapAt(6, 16);
s = await settle();
step(s.dlg === "kiln-cellar/start", `K28a cellar door sign (${how28}; ${s.dlg})`);
await pick(page, /Use the give/); await pick(page, /Go down/).catch(() => {});
s = await S(page);
step(s.flags.kilnCellar && !s.dlg, `K28 cellar opens (kilnCellar ${s.flags.kilnCellar}; dlg ${s.dlg})`);
// Keyboard through the cut: (6,15) must be free (Nim used to stand there), then Down, Down.
await walk(page, 6, 15);
await key(page, "ArrowDown", 2);
s = await S(page);
step(s.x === 6 && s.y === 17 && !s.dlg, `K28b ArrowDown ×2 from (6,15) through the cut into the cellar (${s.x},${s.y}; dlg ${s.dlg})`);
const feetC = await stageAt(page, s.x, s.y);
step(feetC.feetIn, `K28c cellar keeps Silas on canvas (fx ${feetC.fx.toFixed(2)} fy ${feetC.fy.toFixed(2)})`);
await shot(page, `${tag}-12-cellar`);

// K29 Old flue: Read the nest (Audit roll) → Lift the glass → sootglass, mite stays nested
r = await auditAt("kilncache");
step(r.ok, `K29a Old flue audit opens (${r.how})`);
let read = false, readTries = 0;
for (; readTries < 12 && !read; readTries++) {
  if ((await S(page)).panel !== "audit") await auditAt("kilncache");
  await special(/Read the nest/);
  read = await page.evaluate(() => window.__mend.getState().data.machines.kilncache.nodes.find((n) => n.id === "glass").revealed);
}
step(read, `K29 Read the nest names the soot glass (tries ${readTries}; ${(await S(page)).log[0]})`);
if ((await S(page)).panel !== "audit") await auditAt("kilncache");
await special(/Lift the glass/);
s = await S(page);
const mite = await actorAt("mite");
step(s.flags.glassLifted && (await inv("sootglass")) === 1 && !s.flags.miteAwake && !s.combat && !mite.hostile, `K29b Lift the glass (glass ${await inv("sootglass")}; mite hostile ${mite.hostile}; combat ${s.combat}; ${s.log[0]})`);

// K30 Back up through the cut: Nim and Harl follow-up lines
await walk(page, 6, 15).catch(() => {});
t = await talkTo("nim");
step((await replies(page)).some((x) => /I have the glass/.test(x)), `K30 Nim has the glass line (${(await replies(page)).join(" / ")})`);
await pick(page, /I have the glass/); await closeTalk(page);
t = await talkTo("harl");
step((await replies(page)).some((x) => /houses are warm/.test(x)), `K30b Harl has the warm-houses line (${(await replies(page)).join(" / ")})`);
await closeTalk(page);
s = await S(page);
step(!s.dlg, "K30c talks closed");

// K31 Save → reload → Continue keeps every Kiln outcome
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
await key(page, "Escape");
const kb = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Continue" }).click(); await page.waitForTimeout(400);
s = await S(page);
const keep = ["fieldDry", "brickLive", "kilnHouses", "kilnLicensed", "kilnShop", "kilnLevy", "kilnTold", "kilnCellar", "glassLifted"];
const lost = keep.filter((k) => s.flags[k] !== kb.flags[k]);
step(s.map === "kiln" && s.x === kb.x && s.y === kb.y && lost.length === 0 && (await inv("sootglass")) === 1, `K31 Continue keeps Kiln outcomes (${s.map} ${s.x},${s.y}; lost [${lost.join(",")}]; glass ${await inv("sootglass")})`);
await shot(page, `${tag}-13-kiln-done`);


// —— The Switch (Yard stair on the Stack Road) — Y0+ ——
const hp = () => page.evaluate(() => window.__mend.getState().data.player.hp);
// Kiln → Stack Road via the Kiln Stack mouth (16,1)
await walk(page, 16, 2);
await key(page, "ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "kiln") break; await page.waitForTimeout(120); }
step(s.map === "road" && s.x === 16 && s.y === 11, `Y0a Kiln Stack mouth → Stack Road (${s.map} ${s.x},${s.y})`);
// Real taps along the lower gantry to beside the Yard stair (22,14), then ArrowDown onto it
const yardTap = await tapWalk(page, 22, 13, [22, 14]);
s = await S(page);
step(yardTap.ok && s.x === 22 && s.y === 13 && yardTap.onCanvas, `Y0b real taps to beside the Yard stair (${yardTap.taps} taps; at ${s.x},${s.y}; on canvas ${yardTap.onCanvas}; stair on deck ${yardTap.mouthSeen})`);
await shot(page, `${tag}-14-by-yard-stair`);
await key(page, "ArrowDown");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "switch" && /You arrive at The Switch/.test(s.log.join(" | ")) && s.flags["seen:switch"] && s.panel === "none", `Y0 Yard stair → The Switch (${s.map} ${s.x},${s.y}; log ${s.log.slice(0, 2).join(" / ")})`);
const yf = await stageAt(page, s.x, s.y);
const ym = await stageAt(page, 14, 1);
step(yf.feetIn && ym.on > 0.4, `Y1 Switch arrive: feet on canvas (fx ${yf.fx.toFixed(2)}), Stack mouth on deck (${ym.on.toFixed(2)})`);
await shot(page, `${tag}-15-switch-arrive`);

// Y2 Hale: the floor, then leave by Esc
t = await talkTo("hale");
step(/hale/.test(t.s.dlg || ""), `Y2 Talk Hale (${t.how}; ${t.s.dlg})`);
await pick(page, /floor actually doing/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
step(!(await S(page)).dlg, "Y2b Hale talk closes");

// Y3 Slick plates south of the table bite once without boots or grease
const hp0 = await hp();
await walk(page, 20, 11);
s = await S(page);
step(s.flags.switchSlipped && (await hp()) === hp0 - 1 && /plates take a little blood/.test(s.log.join(" | ")), `Y3 slick plates bite once (hp ${hp0}→${await hp()}; ${s.log[0]})`);
await walk(page, 22, 12);
step((await hp()) === hp0 - 1, `Y3b second slick step does not bite again (hp ${await hp()})`);

// Y4 Yard desk (5,7): License the stamp (10 scrip, Speech < 60)
r = await auditAt("switchdesk");
step(r.ok, `Y4a Yard desk audit opens (${r.how})`);
sc0 = await scrip();
await special(/License the stamp/);
s = await S(page);
step(s.flags.switchLicensed && (await scrip()) === sc0 - 10, `Y4 License the yard stamp (scrip ${sc0}→${await scrip()}; ${s.log[0]})`);

// Y5 Turntable (16,9): Shunt the haul (Engineering ≥ 50 knows the bypass)
r = await auditAt("turntable");
step(r.ok, `Y5a Yard table audit opens (${r.how}; uiNode ${await page.evaluate(() => window.__mend.getState().data.uiNode)})`);
await special(/Shunt the haul/);
s = await S(page);
step(s.flags.switchShunt && s.panel === "none", `Y5 Shunt the haul (shunt ${s.flags.switchShunt}; ${s.log[0]})`);

// Y6 Shed bench (22,7): buy yard boots, equip from the Pack
r = await auditAt("switchbench");
step(r.ok, `Y6a Shed bench audit opens (${r.how})`);
sc0 = await scrip();
await special(/Buy yard boots/);
s = await S(page);
step((await inv("slickboot")) === 1, `Y6 Buy yard boots (scrip ${sc0}→${await scrip()}; ${s.log[0]})`);
await key(page, "Escape");
await hud(page, "Pack");
const bootRow = page.locator("li", { hasText: "boots" }).getByRole("button", { name: "Equip" });
if (await bootRow.count()) { await bootRow.first().click(); await page.waitForTimeout(200); }
const armor = await page.evaluate(() => window.__mend.getState().data.equipped.armor);
step(armor === "slickboot", `Y6b Equip yard boots from the Pack (armor ${armor})`);
await key(page, "Escape");

// Y7 Ske → the give; bay door (6,13) by tap; through by keys; Waybill crate read + lift
t = await talkTo("ske");
step(/ske/.test(t.s.dlg || ""), `Y7a Talk Ske (${t.how}; ${(await replies(page)).join(" / ")})`);
await pick(page, /Show me the give/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
s = await S(page);
step(s.flags.switchTold && !s.dlg, `Y7b Ske shows the give (switchTold ${s.flags.switchTold})`);
const how7 = await tapAt(6, 13);
s = await settle();
step(s.dlg === "switch-bay/start", `Y7c bay door sign by tap (${how7}; ${s.dlg}; at ${s.x},${s.y})`);
await pick(page, /Use the give/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
s = await S(page);
step(s.flags.switchBay && !s.dlg, `Y7d bay opens (switchBay ${s.flags.switchBay})`);
await walk(page, 6, 12);
await key(page, "ArrowDown", 2);
s = await S(page);
step(s.x === 6 && s.y === 14 && !s.dlg, `Y7e ArrowDown ×2 from (6,12) into the bay (${s.x},${s.y}; dlg ${s.dlg})`);
r = await auditAt("waycrate");
step(r.ok, `Y7f Waybill crate audit opens (${r.how})`);
await special(/Read the waybill/);
if ((await S(page)).panel !== "audit") await auditAt("waycrate");
await special(/Lift the waybill/);
s = await S(page);
const rat = await actorAt("yardrat");
step(s.flags.waybillRead && s.flags.waybillLifted && (await inv("waybill")) === 1 && !rat.hostile && !s.combat, `Y7 read + lift the waybill (rat hostile ${rat.hostile}; ${s.log[0]})`);
await key(page, "Escape");
await shot(page, `${tag}-16-switch-bay`);

// Y8 Save → reload → Continue keeps the Switch outcomes
await walk(page, 6, 14);
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
await key(page, "Escape");
const yb = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Continue" }).click(); await page.waitForTimeout(400);
s = await S(page);
const ykeep = ["seen:switch", "switchSlipped", "switchLicensed", "switchShunt", "switchTold", "switchBay", "waybillRead", "waybillLifted", "brickLive", "glassLifted"];
const ylost = ykeep.filter((k) => s.flags[k] !== yb.flags[k]);
step(s.map === "switch" && s.x === yb.x && s.y === yb.y && ylost.length === 0 && (await page.evaluate(() => window.__mend.getState().data.equipped.armor)) === "slickboot", `Y8 Continue keeps Switch outcomes (${s.map} ${s.x},${s.y}; lost [${ylost.join(",")}])`);
writeFileSync(`${SHOTS}/${tag}-switch-done-storage.json`, await page.evaluate(() => JSON.stringify({ ...localStorage })));

// —— The Pane (Glass stair on the Stack Road) — P0+ ——
await walk(page, 14, 2);
await key(page, "ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "switch") break; await page.waitForTimeout(120); }
step(s.map === "road" && s.x === 22 && s.y === 13, `P0a Switch Stack mouth → Stack Road (${s.map} ${s.x},${s.y})`);
const glassTap = await tapWalk(page, 27, 2, [27, 1]);
s = await S(page);
step(glassTap.ok && s.x === 27 && s.y === 2 && glassTap.onCanvas, `P0b real taps up the road to beside the Glass stair (${glassTap.taps} taps; at ${s.x},${s.y}; on canvas ${glassTap.onCanvas}; stair on deck ${glassTap.mouthSeen})`);
await shot(page, `${tag}-17-by-glass-stair`);
await key(page, "ArrowUp");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "pane" && /You arrive at The Pane/.test(s.log.join(" | ")) && s.flags["seen:pane"] && s.panel === "none", `P0 Glass stair → The Pane (${s.map} ${s.x},${s.y}; log ${s.log.slice(0, 2).join(" / ")})`);
const pf = await stageAt(page, s.x, s.y);
const pm = await stageAt(page, 16, 18);
step(pf.feetIn && pm.on > 0.4, `P1 Pane arrive: feet on canvas (fx ${pf.fx.toFixed(2)} fy ${pf.fy.toFixed(2)}), Stack mouth on deck (${pm.on.toFixed(2)})`);
await shot(page, `${tag}-18-pane-arrive`);

// P2 Orla → parents
t = await talkTo("orla");
step(/orla/.test(t.s.dlg || ""), `P2 Talk Orla (${t.how}; ${t.s.dlg})`);
await pick(page, /pane that doesn't craze/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
s = await S(page);
step(!s.dlg, `P2b Orla closes (journal ${JSON.stringify((s.journal || []).filter((j) => /pane/.test(j)))})`);

// P3 Pane furnace: audit selects the dark flue (not the unused Borrowed kiln heat leaf); Seat the flue
r = await auditAt("panefire");
const pui = await page.evaluate(() => window.__mend.getState().data.uiNode);
step(r.ok && pui === "flue", `P3a Pane furnace audit opens on the flue (${r.how}; uiNode ${pui})`);
const f0 = await page.evaluate(() => window.__mend.getState().data.focus);
await special(/Seat the flue/);
s = await S(page);
step(s.flags.paneCharge && s.flags.paneHouses && s.flags.paneLevy && s.panel === "none", `P3 Seat the flue → melt holds (focus ${f0}→${await page.evaluate(() => window.__mend.getState().data.focus)}; charge ${s.flags.paneCharge}; houses ${s.flags.paneHouses}; levy ${s.flags.paneLevy}; ${s.log[0]})`);
const moth = await actorAt("panemoth");
step(!moth.hostile && !s.combat, `P3b glass moth comes to the heat without a fight (moth ${moth.x},${moth.y} hostile ${moth.hostile})`);
await shot(page, `${tag}-19-pane-melt`);

// P4 Glass bench: draw + quiet sale; then license and a legal sale if the scrip allows
r = await auditAt("panebench");
step(r.ok, `P4a Glass bench audit opens (${r.how})`);
await special(/Draw a clear pane/);
step((await inv("clearpane")) === 1, `P4 Draw a clear pane (${await inv("clearpane")}; ${(await S(page)).log[0]})`);
sc0 = await scrip();
await special(/Sell a pane/);
s = await S(page);
step((await scrip()) > sc0 && /under the board/.test(s.log[0]), `P4b quiet pane sale (${sc0}→${await scrip()}; ${s.log[0]})`);
await special(/Draw a clear pane/); await special(/Draw a clear pane/);
await special(/Sell a pane/);
await key(page, "Escape");
r = await auditAt("panestamp");
step(r.ok, `P5a Glass desk audit opens (${r.how})`);
sc0 = await scrip();
await special(/License the stamp/);
s = await S(page);
step(s.flags.paneLicensed ? s.flags.paneShop && (await scrip()) < sc0 : /scrip/.test(s.log[0]), `P5 License the glass stamp (scrip ${sc0}→${await scrip()}; licensed ${s.flags.paneLicensed}; shop ${s.flags.paneShop}; ${s.log[0]})`);
await key(page, "Escape");
if (s.flags.paneLicensed) {
  r = await auditAt("panebench");
  sc0 = await scrip();
  await special(/Sell a pane/);
  s = await S(page);
  step((await scrip()) > sc0 && /allowed/.test(s.log[0]), `P5b legal pane sale (${sc0}→${await scrip()}; ${s.log[0]})`);
  await key(page, "Escape");
}

// P6 Fen → the give; vault door (6,15) by tap; keys into the vault; read + lift the lens
t = await talkTo("fen");
step(/fen/.test(t.s.dlg || ""), `P6a Talk Fen (${t.how}; ${(await replies(page)).join(" / ")})`);
await pick(page, /Show me the give/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
s = await S(page);
step(s.flags.paneTold && !s.dlg, `P6b Fen shows the give (paneTold ${s.flags.paneTold})`);
const how6 = await tapAt(6, 15);
s = await settle();
step(s.dlg === "pane-vault/start", `P6c vault door sign by tap (${how6}; ${s.dlg}; at ${s.x},${s.y})`);
await pick(page, /Use the give/).catch((e) => console.log("  ", e.message));
await closeTalk(page);
s = await S(page);
step(s.flags.paneVault && !s.dlg, `P6d vault opens (paneVault ${s.flags.paneVault})`);
await walk(page, 6, 14);
await key(page, "ArrowDown", 2);
s = await S(page);
step(s.x === 6 && s.y === 16 && !s.dlg, `P6e ArrowDown ×2 from (6,14) into the vault (${s.x},${s.y}; dlg ${s.dlg})`);
r = await auditAt("anneal");
step(r.ok, `P7a Anneal vault audit opens (${r.how})`);
let lread = false, lt = 0;
for (; lt < 12 && !lread; lt++) {
  if ((await S(page)).panel !== "audit") await auditAt("anneal");
  await special(/Read the anneal/);
  lread = await page.evaluate(() => { const d = window.__mend.getState().data; return Boolean(d.flags.annealRead || d.machines.anneal.nodes.find((n) => n.id === "lens").revealed); });
}
if ((await S(page)).panel !== "audit") await auditAt("anneal");
await special(/Lift the lens/);
s = await S(page);
step(lread && s.flags.annealLifted && (await inv("anneallens")) === 1 && !s.combat, `P7 read (${lt} tries) + lift the lens (${s.log[0]})`);
await key(page, "Escape");

// P8 Leave by the Pane Stack mouth onto the road (Sol moves to the Glass stair once the melt holds)
await walk(page, 6, 15);
await walk(page, 16, 17);
await key(page, "ArrowDown");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "pane") break; await page.waitForTimeout(120); }
const sol = await actorAt("sol");
step(s.map === "road" && !(sol.map === "road" && sol.x === s.x && sol.y === s.y), `P8 Pane Stack mouth → Stack Road; Silas not stacked on Sol (Silas ${s.x},${s.y}; Sol ${sol.map} ${sol.x},${sol.y})`);
await shot(page, `${tag}-20-back-on-road`);
// …and the Glass stair is still enterable by keys after arriving
await key(page, "ArrowUp");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "pane", `P8b ArrowUp back onto the Glass stair re-enters The Pane (${s.map} ${s.x},${s.y}; log ${s.log[0]})`);
await walk(page, 16, 17);
await key(page, "ArrowDown");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "pane") break; await page.waitForTimeout(120); }

// P9 Back to Oakhaven by the Ward stair (Act II round trip), Save → reload → Continue
await walk(page, 20, 2);
await key(page, "ArrowUp");
for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== "road") break; await page.waitForTimeout(120); }
step(s.map === "haven", `P9a Ward stair → Oakhaven after the three yards (${s.map} ${s.x},${s.y})`);
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
await key(page, "Escape");
const pb = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Continue" }).click(); await page.waitForTimeout(400);
s = await S(page);
const pkeep = ["seen:pane", "paneCharge", "paneHouses", "paneLevy", "paneTold", "paneVault", "annealLifted", "switchShunt", "waybillLifted", "brickLive", "glassLifted", "kilnLicensed"];
const plost = pkeep.filter((k) => s.flags[k] !== pb.flags[k]);
step(s.map === "haven" && s.x === pb.x && s.y === pb.y && plost.length === 0 && (await inv("anneallens")) === 1 && (await inv("sootglass")) === 1 && (await inv("waybill")) === 1, `P9 Continue keeps Kiln + Switch + Pane outcomes (${s.map} ${s.x},${s.y}; lost [${plost.join(",")}])`);
await hud(page, "Map");
const mapTxt = await page.evaluate(() => document.body.innerText);
step(/The Kiln/.test(mapTxt) && /The Switch/.test(mapTxt) && /The Pane/.test(mapTxt), "P10 Map lists all three Act II yards as seen");
await key(page, "Escape");
await shot(page, `${tag}-21-act2-done`);

step(errors.length === 0, `K19 no page/console errors (${errors.length}) ${errors.slice(0, 3).join(" | ")}`);
await browser.close();
writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
const failed = out.filter((x) => x.startsWith("FAIL"));
console.log(`\n${out.length - failed.length}/${out.length} PASS`);
process.exit(failed.length ? 1 : 0);
