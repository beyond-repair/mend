#!/usr/bin/env node
// Headless browser playtest: Act I → Rust (Ives opens the Citadel) → Brass Tundra → High Citadel → Void Spire → epilogue.
//   SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-act4 node scripts/playtest-act4.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const SHOTS = process.env.SHOTS ?? "/tmp/mend-act4";
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

const tag = process.env.TAG ?? "act4";
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

// —— helpers for long legs ——
async function mouthStep(fromMap, arrow) {
  await page.keyboard.press(arrow);
  for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== fromMap || s.dlg) break; await page.waitForTimeout(120); }
  return s;
}
async function saveContinue(label, keep) {
  await hud(page, "Menu");
  await page.getByRole("button", { name: /slot ?1/i }).first().click();
  await page.waitForTimeout(200);
  await key(page, "Escape");
  const before = await S(page);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__mend);
  await page.waitForTimeout(300);
  const cont = page.getByRole("button", { name: "Continue" });
  const enabled = !(await cont.isDisabled());
  await cont.click(); await page.waitForTimeout(400);
  const after = await S(page);
  const lost = keep.filter((k) => after.flags[k] !== before.flags[k]);
  step(enabled && after.phase === "play" && after.map === before.map && after.x === before.x && after.y === before.y && lost.length === 0 && !after.combat,
    `${label} Save → reload → Continue (${after.map} ${after.x},${after.y}; was ${before.map} ${before.x},${before.y}; lost [${lost.join(",")}]; combat ${after.combat})`);
  return after;
}
async function useSpecial(re) {
  const b = page.getByRole("button", { name: re });
  if (!(await b.count())) return false;
  await b.first().click(); await page.waitForTimeout(300); await fileLevel(page);
  return true;
}
const noCombat = async (label) => { const c = await S(page); step(!c.combat, `${label} no forced combat (combat ${c.combat}; ${c.log[0]})`); return !c.combat; };

// —— Stack Road → Rust cut → Rust Districts (act1 signed by the talk-past) ——
await fileLevel(page);
const rustTap = await tapWalk(page, 33, 6, [34, 6]);
s = await S(page);
step(rustTap.ok && s.x === 33 && s.y === 6, `B1 real taps along the road to beside Rust cut (${rustTap.taps} taps; ${s.x},${s.y})`);
s = await mouthStep("road", "ArrowRight");
step(s.map === "rust" && s.panel === "none", `B2 Rust cut → Rust Districts (${s.map} ${s.x},${s.y}; panel ${s.panel})`);

// B3 Ives briefing opens the Citadel (dialogue.ts ives/welcome → citadelOpen). No Kael fight needed.
let t = await talkTo("ives");
step(/ives/.test(t.s.dlg || ""), `B3 Talk Ives (${t.how}; ${t.s.dlg})`);
await pick(page, /maintain the maintainers/);
await pick(page, /speak to Mara before I decide/);
await closeTalk(page);
s = await S(page);
step(s.flags.citadelOpen === true && s.flags.guildBriefed === true && !s.dlg, `B3b Ives welcome → citadelOpen (${s.flags.citadelOpen}; guildBriefed ${s.flags.guildBriefed}; journal ${s.journal?.filter((j) => /guild/.test(j)).join(",")})`);
await shot(page, `${tag}-01-ives-citadel-open`);

// B4 Back to the road via the Rust Stack mouth (34,8)
await walk(page, 33, 8);
s = await mouthStep("rust", "ArrowRight");
step(s.map === "road" && s.panel === "none", `B4 Rust Stack mouth → Stack Road (${s.map} ${s.x},${s.y})`);

// —— Tundra walk (road 8,15) → The Brass Tundra ——
await walk(page, 8, 14);
s = await S(page);
step(s.map === "road" && s.x === 8 && s.y === 14 && !s.combat, `T0 walk the road west to beside Tundra walk (${s.x},${s.y}; combat ${s.combat}; dlg ${s.dlg})`);
const tw = await stageAt(page, 8, 15);
step(tw.on > 0.3, `T0b Tundra walk mouth on deck from beside it (presence ${tw.on.toFixed(2)})`);
s = await mouthStep("road", "ArrowDown");
const tArrive = /You arrive at The Brass Tundra/.test(s.log.join(" | "));
step(s.map === "tundra" && tArrive && s.flags.tundraWalked && s.panel === "none", `T1 Tundra walk → The Brass Tundra (${s.map} ${s.x},${s.y}; arrive ${tArrive}; tundraWalked ${s.flags.tundraWalked}; panel ${s.panel}; log ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-02-tundra-arrive`);
const tFeet = await stageAt(page, s.x, s.y);
step(tFeet.feetIn, `T1b arrive feet on canvas (fx=${tFeet.fx.toFixed(2)}, fy=${tFeet.fy.toFixed(2)})`);
await noCombat("T1c");

// T2 Kel
t = await talkTo("kel");
step(/kel/.test(t.s.dlg || ""), `T2 Talk Kel (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
await closeTalk(page);
step(!(await S(page)).dlg, "T2b Kel talk closes");

// T3 Audit the Brass hollow → Read the hollow
let r = await auditAt("hollow");
step(r.ok, `T3 Audit Brass hollow opens (${r.how})`);
await shot(page, `${tag}-03-hollow-audit`);
const readH = await useSpecial(/Read the hollow/i);
s = await S(page);
step(readH && s.flags.hollowRead === true, `T3b Read the hollow (hollowRead ${s.flags.hollowRead}; hollowWarm ${s.flags.hollowWarm}; log ${s.log[0]})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");

// T4 Drift
t = await talkTo("drift");
const driftRs = await replies(page);
step(/drift/.test(t.s.dlg || "") && driftRs.length > 0, `T4 Talk Drift (${t.how}; ${t.s.dlg}; ${driftRs.join(" / ")})`);
await page.locator(".ledger li button").first().click(); await page.waitForTimeout(150);
await closeTalk(page);
s = await S(page);
step(!s.dlg && s.flags.driftMet === true, `T4b Drift talk closes (driftMet ${s.flags.driftMet})`);

// T5 Glaze stake → Seat the span (needs a mend; any outcome is a real answer)
r = await auditAt("stake");
step(r.ok, `T5 Audit Glaze stake opens (${r.how})`);
const seatSpan = await useSpecial(/Seat the span/i);
s = await S(page);
step(seatSpan, `T5b Seat the span tried (iceSpan ${s.flags.iceSpan}; log ${s.log.slice(0, 2).join(" / ")})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await noCombat("T5c");

// T6 Save/Continue on the tundra
await saveContinue("T6", ["tundraWalked", "citadelOpen", "hollowRead", "driftMet", "iceSpan", "guildBriefed"]);
await shot(page, `${tag}-04-tundra-continued`);

// —— Ranking stair (26,5) → High Citadel ——
await walk(page, 25, 5);
s = await S(page);
step(s.x === 25 && s.y === 5 && !s.combat, `C0 walk to beside Ranking stair (${s.x},${s.y})`);
s = await mouthStep("tundra", "ArrowRight");
const cArrive = /You arrive at High Citadel/.test(s.log.join(" | "));
step(s.map === "citadel" && cArrive && s.flags.seenCitadel && s.panel === "none", `C1 Ranking stair → High Citadel (${s.map} ${s.x},${s.y}; arrive ${cArrive}; seenCitadel ${s.flags.seenCitadel}; log ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-05-citadel-arrive`);
await page.waitForTimeout(400);
await noCombat("C1b (tundra stair landing)");

// C2 Ime + Infirmary buffer (charge before answering the crucible)
t = await talkTo("ime");
step(/ime/.test(t.s.dlg || ""), `C2 Talk Ime (${t.how}; ${t.s.dlg})`);
await closeTalk(page);
r = await auditAt("buffer");
step(r.ok, `C2b Audit Infirmary buffer opens (${r.how})`);
const charged = await useSpecial(/Charge the cell/i);
s = await S(page);
step(charged && s.flags.bufferCharged === true, `C2c Charge the cell (bufferCharged ${s.flags.bufferCharged}; log ${s.log[0]})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await noCombat("C2d");

// C3 Road lamp glass (audit only — cutting it is an optional answer)
r = await auditAt("lamps");
step(r.ok, `C3 Audit Road lamp glass opens (${r.how})`);
await key(page, "Escape");

// C4 Walk up the south throat to the orrery hall → Read the drive
r = await auditAt("orrery");
s = await S(page);
step(r.ok && !s.combat, `C4 walk up to the Frost orrery and Audit (${r.how}; at ${s.x},${s.y}; combat ${s.combat})`);
const readO = await useSpecial(/Read the drive/i);
s = await S(page);
step(readO && /rings/.test(s.log[0] ?? ""), `C4b Read the drive (${s.log[0]})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await shot(page, `${tag}-06-orrery`);

// C5 Sarn (kitchen)
t = await talkTo("sarn");
step(/sarn/.test(t.s.dlg || "") && !t.s.combat, `C5 Talk Sarn (${t.how}; ${t.s.dlg}; combat ${t.s.combat}; guardToll ${(await S(page)).flags.guardToll})`);
await closeTalk(page);
await noCombat("C5b");

// C6 Vane → look → choice → answer on the machine
t = await talkTo("vane");
step(/vane/.test(t.s.dlg || "") && !t.s.combat, `C6 Talk Vane (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
await shot(page, `${tag}-07-vane`);
await pick(page, /look at the engine|show me the engine/i);
await pick(page, /ceremony, with your pins/);
const choiceRs = await replies(page);
step(choiceRs.some((x) => /answer on the machine/.test(x)), `C6b Vane choice offers horns / history / machine (${choiceRs.join(" / ")})`);
await pick(page, /answer on the machine/);
await closeTalk(page);
await noCombat("C6c");

// C7 Crucible: prefer Splice toward the Sinks (no fight), else Seize, else Sever
r = await auditAt("crucible");
step(r.ok, `C7 Audit Crucible core opens (${r.how})`);
await shot(page, `${tag}-08-crucible-audit`);
const specials = await page.$$eval("button", (bs) => bs.map((b) => b.innerText.replace(/\s+/g, " ")).filter((x) => /Sever|Splice|Seize|rank answer/.test(x)));
console.log("   crucible specials:", specials);
let fate = null;
for (const re of [/Splice toward the Sinks/i, /Seize the rank engine/i]) {
  for (let tries = 0; tries < 3 && !fate; tries++) {
    if ((await S(page)).panel !== "audit") { await auditAt("crucible"); }
    await useSpecial(re);
    fate = (await S(page)).flags.citadelFate ?? null;
    if (!fate) console.log("   crucible:", (await S(page)).log[0]);
  }
  if (fate) break;
}
s = await S(page);
step(Boolean(fate) && s.flags.spireOpen === true && !s.combat, `C7b crucible answered (citadelFate ${fate}; spireOpen ${s.flags.spireOpen}; combat ${s.combat}; log ${s.log.slice(0, 2).join(" / ")})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await fileLevel(page);

// C8 Vane after the answer
t = await talkTo("vane");
const vaneAfter = await replies(page);
step(/vane/.test(t.s.dlg || "") && vaneAfter.some((x) => /already touched it/.test(x)), `C8 Vane after the crucible (${vaneAfter.join(" / ")})`);
if (vaneAfter.some((x) => /already touched it/.test(x))) { await pick(page, /already touched it/); await page.locator(".ledger li button").first().click().catch(() => {}); }
await closeTalk(page);

// C9 Map lists the late regions; Save/Continue in the Citadel
await hud(page, "Map");
const mapTxt = await page.evaluate(() => document.body.innerText);
step(/Brass Tundra/i.test(mapTxt) && /High Citadel/i.test(mapTxt) && /Void Spire/i.test(mapTxt), "C9 Map lists Tundra, Citadel, Spire");
await key(page, "Escape");
await saveContinue("C10", ["citadelFate", "spireOpen", "bufferCharged", "seenCitadel", "citadelOpen", "tundraWalked"]);
await shot(page, `${tag}-09-citadel-continued`);

// —— Back down: Tundra stair → tundra → Stack mouth → road → Spire mouth ——
await walk(page, 32, 18);
s = await mouthStep("citadel", "ArrowRight");
step(s.map === "tundra" && !s.combat && s.panel === "none", `C11 Tundra stair → Brass Tundra (${s.map} ${s.x},${s.y}; combat ${s.combat})`);
await walk(page, 3, 5);
s = await mouthStep("tundra", "ArrowLeft");
step(s.map === "road" && s.panel === "none", `C12 Tundra Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; dlg ${s.dlg})`);

await walk(page, 28, 14);
s = await S(page);
step(s.x === 28 && s.y === 14 && !s.combat, `V0 walk the road to beside Spire mouth (${s.x},${s.y}; combat ${s.combat}; dlg ${s.dlg})`);
s = await mouthStep("road", "ArrowDown");
const vArrive = /You arrive at The Void Spire/.test(s.log.join(" | "));
step(s.map === "spire" && vArrive && s.panel === "none", `V1 Spire mouth → The Void Spire (${s.map} ${s.x},${s.y}; arrive ${vArrive}; panel ${s.panel}; log ${s.log.slice(0, 3).join(" / ")})`);
await shot(page, `${tag}-10-spire-arrive`);
await noCombat("V1b");

// V2 Sovereign (decline the fight: "I'll circle")
t = await talkTo("sovereign");
const sovRs = await replies(page);
step(/sovereign/.test(t.s.dlg || "") && sovRs.some((x) => /circle/.test(x)), `V2 Talk the Sovereign (${t.how}; ${t.s.dlg}; ${sovRs.join(" / ")})`);
if (sovRs.some((x) => /circle/.test(x))) await pick(page, /circle/);
await closeTalk(page);
await noCombat("V2b decline");

// V3 Save/Continue in the Spire
await saveContinue("V3", ["citadelFate", "spireOpen", "seen:spire"]);

// V4 Unissued baseline → Read what is holding → Leave the holes → epilogue
r = await auditAt("spireheart");
s = await S(page);
step(r.ok && !s.combat, `V4 walk to Unissued baseline and Audit (${r.how}; at ${s.x},${s.y}; combat ${s.combat})`);
await shot(page, `${tag}-11-heart-audit`);
const readHeart = await useSpecial(/Read what is holding/i);
s = await S(page);
step(readHeart && /What is being held/.test(s.log[0] ?? ""), `V4b Read what is holding (${(s.log[0] ?? "").slice(0, 120)})`);
if ((await S(page)).panel !== "audit") await auditAt("spireheart");
await useSpecial(/Leave the holes/i);
await page.waitForTimeout(400);
s = await S(page);
const epiTxt = await page.evaluate(() => document.body.innerText);
step(s.phase === "epilogue" && /The ledger closes/.test(epiTxt) && /Baseline refused/i.test(epiTxt), `E1 epilogue screen (phase ${s.phase}; ending ${s.flags.ending})`);
await shot(page, `${tag}-12-epilogue`);
const epiLines = await page.evaluate(() => window.__mend.getState().data.epilogue ?? []);
step(epiLines.length >= 3, `E2 epilogue carries the ledger (${epiLines.length} lines): ${epiLines.slice(0, 3).join(" | ").slice(0, 240)}`);
await page.getByRole("button", { name: "Return to the title" }).click();
await page.waitForTimeout(300);
const titleTxt = await page.evaluate(() => document.body.innerText);
step(/New ledger/.test(titleTxt), "E3 Return to the title");

step(errors.length === 0, `Z0 no page/console errors (${errors.length}) ${errors.slice(0, 3).join(" | ")}`);
await browser.close();
writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
const failed = out.filter((x) => x.startsWith("FAIL"));
console.log(`\n${out.length - failed.length}/${out.length} PASS`);
process.exit(failed.length ? 1 : 0);
