#!/usr/bin/env node
// Headless browser playtest of the first-act loop (docs/QA-COMPLETION.md).
// Drives the real dev build in Chromium: real clicks on title/create/dialogue/HUD/Menu buttons and real
// arrow keys onto mouths. Walking to a named tile uses the dev-only store handle (window.__mend.clickTile),
// the same call a canvas tap makes. Run against `npm run dev`:
//   node scripts/playtest-loop.mjs            # URL defaults to http://127.0.0.1:8080/
//   SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-shots node scripts/playtest-loop.mjs
//   VW=1280 VH=713 SEED=4 ... node scripts/playtest-loop.mjs   # short desktop window (hand-playtest size); default 440x900
// SEED pins Math.random in the page so a run can be replayed. Exit code 1 if any step FAILs.
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const SHOTS = process.env.SHOTS ?? "/tmp/mend-playtest";
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
const S = (page) => page.evaluate(() => { const d = window.__mend.getState().data; return { phase: d.phase, map: d.mapId, x: d.player.x, y: d.player.y, hp: d.player.hp, ap: d.player.ap, focus: d.focus, dlg: d.dialogue && (d.dialogue.convo + "/" + d.dialogue.node), panel: d.panel, combat: !!d.combat, path: d.path.length, log: d.log.slice(0, 4), flags: d.flags, pinned: d.pinned }; });
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
async function walk(page, x, y, max = 15000) {
  await page.evaluate(([x, y]) => window.__mend.getState().clickTile(x, y), [x, y]);
  const t0 = Date.now();
  while (Date.now() - t0 < max) { const s = await S(page); if (!s.path || s.dlg) break; await page.waitForTimeout(120); }
  return S(page);
}
/** Screen point of a tile and of Silas's feet, read from the live stage module (dev build). */
async function stageAt(page, tx, ty) {
  return page.evaluate(async ([tx, ty]) => {
    const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/components/mend/stage.ts"));
    const st = await import(url);
    const d = window.__mend.getState().data;
    const c = document.querySelector("canvas").getBoundingClientRect();
    const t = st.projectTile(c.width, c.height, d.player.x, d.player.y, tx, ty, 1, 64, 32);
    const f = st.stageNow().feet;
    return { l: c.left, t: c.top, w: c.width, h: c.height, sx: t.sx, sy: t.sy, on: st.presence(t.sx, t.sy), feetIn: f.sx > 0 && f.sx < c.width && f.sy > 0 && f.sy < c.height * 0.9 };
  }, [tx, ty]);
}
async function tapWalk(page, x, y, mouth = [25, 18]) {
  const route = await page.evaluate(([x, y]) => {
    const G = window.__mend;
    G.getState().clickTile(x, y);
    const r = G.getState().data.path.map((p) => [p.x, p.y]);
    G.setState((s) => ({ data: { ...s.data, path: [], intent: null } }));
    return r;
  }, [x, y]);
  let i = 0, taps = 0, onCanvas = true, mouthSeen = false;
  while (i < route.length && taps < route.length + 4) {
    const j = Math.min(route.length - 1, i + 2);
    const q = await stageAt(page, ...route[j]);
    await page.mouse.click(q.l + q.sx, q.t + q.sy);
    taps++;
    for (let k = 0; k < 60; k++) { if (!(await S(page)).path) break; await page.waitForTimeout(100); }
    const m = await stageAt(page, ...mouth);
    onCanvas &&= m.feetIn;
    mouthSeen ||= m.on > 0.5;
    const now = await S(page);
    if (now.x === route[j][0] && now.y === route[j][1]) i = j + 1;
  }
  return { ok: i >= route.length, taps, onCanvas, mouthSeen };
}
async function key(page, k, n = 1) { for (let i = 0; i < n; i++) { await page.keyboard.press(k); await page.waitForTimeout(200); } }
async function hud(page, label) { await page.getByRole("button", { name: label, exact: true }).first().click(); await page.waitForTimeout(200); }
async function shot(page, name) { await page.screenshot({ path: `${SHOTS}/${name}.png` }); }

const tag = process.env.TAG ?? "loop";
const out = [];
const step = (ok, msg) => { out.push(`${ok ? "PASS" : "FAIL"} ${msg}`); console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };
const { browser, page, errors } = await open();
await page.getByRole("button", { name: "New ledger" }).click();
await page.getByRole("button", { name: "Recommended file" }).click();
await page.getByRole("button", { name: "Enter the Sinks" }).click();
await page.waitForTimeout(300);
let s = await S(page);
step(s.phase === "play" && s.dlg === "tobin-intro/start", `L1 New ledger → Recommended → Enter the Sinks (phase ${s.phase}, ${s.dlg})`);
await pick(page, /show me the pump/); await pick(page, /audit it/);
s = await S(page); step(!s.dlg && s.pinned === "The broken pump", "L2 Tobin intro → pump job pinned");
await shot(page, `${tag}-01-tobin-done`);
await hud(page, "Audit");
for (let i = 0; i < 60; i++) { s = await S(page); if (!s.path || s.dlg) break; await page.waitForTimeout(150); }
const aud = await page.evaluate(() => window.__mend.getState().data.audit);
step(s.panel === "audit" && aud?.id === "pump" && !s.dlg, `L3 Audit HUD from the shop walks to the pump and opens it (panel ${s.panel}, target ${aud?.id}, dlg ${s.dlg}, at ${s.x},${s.y})`);
await shot(page, `${tag}-02-pump-audit`);
await page.getByRole("button", { name: "Mend", exact: true }).click();
await page.waitForTimeout(200);
s = await S(page);
step(Boolean(s.flags.pumpFate), `L4 Mend the Seated valve → pumpFate=${s.flags.pumpFate}; log: ${s.log[0]}`);
const head = await page.locator(".head-pin").innerText();
step(s.flags.pumpFate === "flood" ? /broken pump/i.test(head) : !/broken pump/i.test(head), `L5 header pin after the pump is answered (${s.flags.pumpFate}) reads "${head}"`);
await key(page, "Escape");
s = await S(page); step(s.panel === "none", "L6 Esc closes the Audit panel");
// checkpoint
await walk(page, 14, 10); await walk(page, 14, 12);
s = await S(page); step(s.dlg === "guard-line/start", `L7 stepping onto the south plate raises Moll's guard line (${s.dlg})`);
await shot(page, `${tag}-03-moll`);
let passed = false;
for (let attempt = 0; attempt < 12 && !passed; attempt++) {
  await fileLevel(page);
  const rs = await replies(page);
  if (!rs.length) { // re-engage Moll
    await walk(page, 14, 10); await walk(page, 14, 12);
    s = await S(page);
    if (!s.dlg) { await hud(page, "Talk"); for (let i=0;i<40;i++){ s=await S(page); if (s.dlg||!s.path) break; await page.waitForTimeout(150);} }
    console.log("   re-engage →", (await S(page)).dlg, await replies(page));
    continue;
  }
  if (rs.some(r => /pressure regulator/.test(r))) {
    await pick(page, /pressure regulator/);
    const t = await dlgText(page);
    if (/already walking/.test(t)) { await pick(page, /already walking/); passed = true; step(true, `L8 Moll Engineering talk-past (attempt ${attempt + 1}): ${(await S(page)).log.find(l => /engineering/.test(l))}`); }
    else { console.log("   eng failed:", t.slice(0, 160)); await pick(page, /north streets|Fine|Leave/).catch(async () => { await page.locator(".ledger li button").last().click(); }); }
  } else { console.log("   replies now", rs); await page.locator(".ledger li button").last().click(); await page.waitForTimeout(200); }
}
if (!passed) step(false, "L8 Moll talk-past not achieved in 12 attempts");
s = await S(page);
// walk to beside the stack mouth by REAL canvas taps (2 tiles ahead on the planned route), checking that Silas
// stays on the canvas and the labeled Stack mouth comes into view; then ARROW KEY onto it (real keyboard).
// Hand playtest 2026-10-15: on 6387550 the plate camera clamped and pushed Silas off the bottom of the canvas,
// so taps south of the checkpoint landed on nothing and the mouth never came into view.
await fileLevel(page);
const tap = await tapWalk(page, 24, 18);
s = await S(page);
step(tap.ok && s.x === 24 && s.y === 18, `L8b real canvas taps walk the plate to beside the Stack mouth (${tap.taps} taps, at ${s.x},${s.y}; Silas on canvas every step: ${tap.onCanvas}; mouth on deck: ${tap.mouthSeen})`);
await shot(page, `${tag}-04-by-stack-mouth`);
await page.keyboard.press("ArrowRight");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "sinks" || s.panel === "map") break; await page.waitForTimeout(150); }
step(s.map === "road" && s.panel === "none", `L9 ArrowRight onto the adjacent Stack mouth departs to The Stack Road (map ${s.map}, panel ${s.panel}, at ${s.x},${s.y})`);
await shot(page, `${tag}-05-road`);
// to the ward stair WITHOUT the Map: real canvas taps east along the gantry and north to beside the Ward stair,
// with Silas on the canvas and the labelled Ward stair on deck; then ARROW KEY up onto it.
// Hand re-playtest on 51790a9: the clamped plate pinned Silas to the right edge, the north half of the road
// projected off the canvas, taps there were culled and the Ward stair never appeared.
// The hand path: down the x=6 stair to the lower gantry and east to beside the Brick stair (16,11) first (the
// lower gantry has no way north; the Ward stair is on the upper one), then back up by taps, then east by ARROW
// KEYS along the upper gantry until the Ward stair is on deck, then taps to beside it.
const brickTap = await tapWalk(page, 16, 10, [16, 11]);
s = await S(page);
step(brickTap.ok && s.map === "road" && s.x === 16 && s.y === 10 && brickTap.onCanvas && brickTap.mouthSeen, `L9a real canvas taps walk the Stack Road to beside the Brick stair (${brickTap.taps} taps, at ${s.x},${s.y}; Silas on canvas every step: ${brickTap.onCanvas}; Brick stair on deck: ${brickTap.mouthSeen})`);
const upTap = await tapWalk(page, 12, 5, [20, 1]);
for (let i = 0; i < 4; i++) { await page.keyboard.press("ArrowRight"); for (let k = 0; k < 20; k++) { if (!(await S(page)).path) break; await page.waitForTimeout(80); } await page.waitForTimeout(160); }
s = await S(page);
const wardFromGantry = await stageAt(page, 20, 1);
const cam = await page.evaluate(async () => {
  const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/components/mend/stage.ts"));
  const st = await import(url);
  const c = document.querySelector("canvas").getBoundingClientRect();
  const w = c.width, h = c.height;
  const at = (x, y) => { st.layoutStage({ drawImage() {} }, w, h, x, y, "road"); return { ox: st.stageNow().ox, fx: st.stageNow().feet.sx / w }; };
  const a = at(5, 5), b = at(9, 5), now = at(16, 5);
  return { fx: now.fx, plateDelta: b.ox - a.ox, ox5: a.ox, ox9: b.ox };
});
// Widened road pan: east walk moves the painted plate; feet stay off DECK.right; Ward not rim-clipped.
step(upTap.ok && s.map === "road" && s.x === 16 && s.y === 5 && wardFromGantry.on > 0.5 && cam.fx < 0.5 && cam.plateDelta < -40 && wardFromGantry.sx < wardFromGantry.w * 0.88, `L9a' taps back up to the upper gantry (${upTap.taps} taps), then ArrowRight x4 walks east to ${s.x},${s.y}; feet at ${cam.fx.toFixed(2)}w; plate pan 5→9 Δ=${cam.plateDelta.toFixed(0)} (${cam.ox5.toFixed(0)}→${cam.ox9.toFixed(0)}); Ward stair on deck ${wardFromGantry.on.toFixed(2)} at ${Math.round(wardFromGantry.sx)},${Math.round(wardFromGantry.sy)} (not rim-clipped)`);
const roadTap = await tapWalk(page, 20, 2, [20, 1]);
s = await S(page);
const wardOn = await stageAt(page, 20, 1);
step(roadTap.ok && s.map === "road" && s.x === 20 && s.y === 2 && roadTap.onCanvas && wardOn.on > 0.5, `L9b real canvas taps walk the Stack Road east and north to beside the Ward stair (${roadTap.taps} taps, at ${s.x},${s.y}; Silas on canvas every step: ${roadTap.onCanvas}; Ward stair on deck: ${roadTap.mouthSeen}, now ${wardOn.on.toFixed(2)} at ${Math.round(wardOn.sx)},${Math.round(wardOn.sy)})`);
await shot(page, `${tag}-05b-by-ward-stair`);
// Hand re-playtest: arrive toast came back mid-road (commit re-raise, and again after closing Lark — LogChip remount).
const chip = await page.locator(".scrap").allInnerTexts();
step(!chip.some((t) => /You arrive at The Stack Road/.test(t)), `L9c the arrival toast does not come back mid-road (log[0] "${s.log[0]}"; chip now ${JSON.stringify(chip)})`);
// Open Lark in place (no HUD Talk walk — that leaves the Ward stair tile) then Esc/leave; chip must stay dark.
const atWard = { x: s.x, y: s.y };
await page.evaluate(() => {
  const g = window.__mend;
  g.setState((st) => ({ data: { ...st.data, dialogue: { convo: "lark", node: "start" }, panel: "none" } }));
});
for (let i = 0; i < 20; i++) { s = await S(page); if (s.dlg) break; await page.waitForTimeout(50); }
for (let i = 0; i < 6 && (await S(page)).dlg; i++) {
  await key(page, "Escape");
  const rs = await replies(page);
  if ((await S(page)).dlg && rs.length) await page.locator(".ledger li button").last().click();
  await page.waitForTimeout(120);
}
s = await S(page);
const chipAfterTalk = await page.locator(".scrap").allInnerTexts();
step(s.map === "road" && !s.dlg && s.x === atWard.x && s.y === atWard.y && !chipAfterTalk.some((t) => /You arrive at The Stack Road/.test(t)), `L9c' after closing mid-road Lark talk the arrive toast stays down (still at ${s.x},${s.y}; dlg ${s.dlg}; log[0] "${s.log[0]}"; chip ${JSON.stringify(chipAfterTalk)})`);
await page.keyboard.press("ArrowUp");
for (let i = 0; i < 20; i++) { s = await S(page); if (s.map !== "road" || s.panel === "map") break; await page.waitForTimeout(150); }
step(s.map === "haven" && s.panel === "none", `L10 ArrowUp onto the Ward stair arrives in Oakhaven Lower Ward (map ${s.map}, at ${s.x},${s.y}); log: ${s.log[0]}`);
await shot(page, `${tag}-06-ward`);
const wardHead = await page.locator(".head-pin").innerText();
console.log("   ward header pin:", wardHead);
// talk to someone in the ward
await hud(page, "Talk");
for (let i = 0; i < 80; i++) { s = await S(page); if (s.dlg || !s.path) break; await page.waitForTimeout(150); }
const wtalk = await dlgText(page);
step(Boolean(s.dlg), `L11 Talk in the ward opens a conversation (${s.dlg}): ${wtalk.slice(0, 140)}`);
await shot(page, `${tag}-07-ward-talk`);
for (let i = 0; i < 6 && (await S(page)).dlg; i++) { await key(page, "Escape"); const rs = await replies(page); if ((await S(page)).dlg && rs.length) await page.locator(".ledger li button").last().click(); await page.waitForTimeout(150); }
s = await S(page); step(!s.dlg, "L12 conversation can be closed");
// Save slot 1
await hud(page, "Menu");
await page.getByRole("button", { name: /slot ?1/i }).first().click();
await page.waitForTimeout(200);
const saved = await page.evaluate(() => Object.keys(localStorage).filter(k => /slot1|auto/.test(k)));
s = await S(page);
step(saved.length >= 2, `L13 Menu → Save slot 1 (keys ${saved.join(",")}; log: ${s.log[0]})`);
await key(page, "Escape");
const before = await S(page);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mend);
await page.waitForTimeout(300);
const cont = page.getByRole("button", { name: "Continue" });
step(!(await cont.isDisabled()), "L14 after reload, Continue is enabled on the title");
await cont.click(); await page.waitForTimeout(400);
s = await S(page);
step(s.phase === "play" && s.map === before.map && s.x === before.x && s.y === before.y && s.flags.pumpFate === before.flags.pumpFate && s.flags.checkpointSpoke, `L15 Continue resumes the same ward spot (${s.map} ${s.x},${s.y}, pump ${s.flags.pumpFate}, checkpoint answered)`);
await shot(page, `${tag}-08-continued`);
// Load slot 1 from Menu
await hud(page, "Menu");
const loadBtns = await page.$$eval("button", bs => bs.map(b => b.innerText.replace(/\s+/g, " ")).filter(t => /·/.test(t)));
console.log("   load list:", loadBtns);
await page.getByRole("button", { name: /slot1/ }).first().click().catch(async () => { await page.locator("button", { hasText: "Oakhaven" }).last().click(); });
await page.waitForTimeout(300);
s = await S(page);
step(s.phase === "play" && s.map === "haven", `L16 Menu → load slot 1 → ${s.map} ${s.x},${s.y}`);
step(errors.length === 0, `L17 no page errors / console errors (${errors.length}) ${errors.slice(0,3).join(" | ")}`);
await browser.close();
writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
process.exit(out.some((x) => x.startsWith("FAIL")) ? 1 : 0);
