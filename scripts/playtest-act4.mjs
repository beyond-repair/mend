#!/usr/bin/env node
// Headless browser playtest: Act I → Rust (Ives opens the Citadel) → Brass Tundra → High Citadel → Void Spire → epilogue.
//   SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-act4 node scripts/playtest-act4.mjs
// Side branches (same run, different answers):
//   CRUCIBLE=seize                      — Seize needs comprehension 8 (1 + mind/3 + audit/40 + level-1). Before the
//     crucible, spend the file's unspent skill points on Audit (Self → Improve Audit; +4 each) until comprehension
//     reads 8, then Seize the rank engine. BUILD=mind9 makes the file at creation: Recommended, then Presence −1,
//     Mind +1 (the create screen's own buttons). The Recommended file (mind 8) tops out at 7 at level 3.
//   CRUCIBLE=splice (default) | sever   — Sever with shaftOpen unset forces the guard fight ("The floor notices the dark.")
//   SHAFT=1                             — before Sever, open the shaft door (engineering hinge) so Sever skips the guard fight
//   TUNDRA=seat (default) | cut         — Seat the span, or Cut the span (iceCut) + Kel cleats after hollowRead
//   LAMP=audit (default) | break        — audit Road lamp glass only, or Break the glass (roadDark without Sever)
//   SARN=skip (default) | toll          — close Sarn, or take "The plate is unfed." when guardToll
//   VANE=machine (default) | horns | history | fail
//     horns / history: spend the file's unspent skill points on Speech / History (Self → Improve), then take
//       Vane's ceremony check (speech 58 / history 60). A failed roll is reloaded from slot 1, as a player would.
//     fail: no points spent; take the History check (26%) and keep the failure → "Then the floor will be cleaned."
//       → Guard Senn + Guard Oll; fight to resolution, then answer on the machine (CRUCIBLE).
//   NETWORK=talk (default) | varr
//     varr: at Moll's line take "Move." → "Read them." (checkpoint fight, Varr + Moll + Hess) instead of the
//       Engineering talk-past; resolve it (cut rifles → Stand down) so Varr keeps the plate stair
//       (checkpointLead=varr → plateStair). Then detour to the Quarry: Hask clears the riggers, Cut the brake
//       (quarryStone clear) → stoneMoving → citadelSupplied, so Sarn has the "Stone reached the stores." beat.
//   KAEL=0 (default) | duel | both   — requires NETWORK=varr (Quarry detour). After Hask clears the riggers,
//     talk to Kael at (13,5) before Cut the brake.
//     duel (or KAEL=1): "The riggers walk. You and I finish this." → private geometry (duel flag filters rel1)
//       → Engage → peel armor → prybar → kael-down → spare ("Live. Take that sentence…").
//     KAEL_FATE=spare (default) | dead — at kael-down take "Live. Take that sentence…" (spared) or
//       "The doctrine dies with the man." (kaelFate=dead; Kael killed; epilogue tells the quarry's fall of stone).
//     both: "Then show me the layers." → Kael + Striker Pye together → same down/spare. Tactic stands on Kael
//       (Pye has no weapon seam; downConvo ends the fight, and Pye steps out once Kael is not holding).
//   SPIRE=decline | impose | fight | fight-leave
//     fight: Sovereign + Echo → sovereign-down → Write the shape (impose)
//     fight-leave: same fight → Leave the holes (release)
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
async function hud(page, label) { await fileLevel(page); await page.getByRole("button", { name: label, exact: true }).first().click(); await page.waitForTimeout(200); }
async function shot(page, name) { await page.screenshot({ path: `${SHOTS}/${name}.png` }); }
async function closeTalk(page) {
  for (let i = 0; i < 8 && (await S(page)).dlg; i++) {
    await key(page, "Escape");
    const rs = await replies(page);
    if ((await S(page)).dlg && rs.length) await page.locator(".ledger li button").last().click();
    await page.waitForTimeout(120);
  }
}

const CRUCIBLE = process.env.CRUCIBLE ?? "splice";
const SPIRE = process.env.SPIRE ?? "decline";
const TUNDRA = process.env.TUNDRA ?? "seat";
const LAMP = process.env.LAMP ?? "audit";
const SARN = process.env.SARN ?? "skip";
const SHAFT = process.env.SHAFT === "1" || process.env.SHAFT === "open";
const VANE = process.env.VANE ?? "machine";
const NETWORK = process.env.NETWORK ?? "talk";
const _kaelRaw = (process.env.KAEL ?? "0").toLowerCase();
const KAEL = _kaelRaw === "1" || _kaelRaw === "true" ? "duel" : (_kaelRaw === "duel" || _kaelRaw === "both" ? _kaelRaw : "0");
const KAEL_FATE = (process.env.KAEL_FATE ?? "spare").toLowerCase() === "dead" ? "dead" : "spare";
if (KAEL !== "0" && NETWORK !== "varr") {
  console.error("KAEL requires NETWORK=varr (Quarry detour after the checkpoint fight)");
  process.exit(2);
}
// CINDER=1 (requires NETWORK=varr): Varr's "Strip the coupling" leaves plate scrap; feed the reed moth at the
// Sinks bellows (30,3) and let her choose the shadow. Her mouth refusals (cinder-dark / cinder-spire) are answered
// "Wait until she steps." wherever a mouth raises them.
// CINDER=leave | risk (implies CINDER=1): after she chooses the shadow, Stop the lung at the bellows (fear 10+8 ≥ 16).
//   The Varr stair warms the Rust flues once the brake is cut (rustHeat), so the Rust cut raises cinder-heat.
//   leave: "I won't take you into that noise." (cinderLeft). risk: "I'm going in." (cinderRisk → she leaves on her own).
//   Either way she flies back to the Sinks reed. After Ives, rest at the guild bench, walk back to the Sinks,
//   Seat the reed and stand by her perch: she steps back on (cinderBack, "The second choosing").
const CINDER_LEAVE = ["leave", "risk"].includes((process.env.CINDER ?? "").toLowerCase()) ? process.env.CINDER.toLowerCase() : "";
const CINDER = process.env.CINDER === "1" || Boolean(CINDER_LEAVE);
if (CINDER && NETWORK !== "varr") {
  console.error("CINDER requires NETWORK=varr (plate scrap from the checkpoint)");
  process.exit(2);
}
const cinderBeats = [];
const tagBits = [];
if (NETWORK !== "talk") tagBits.push(`net-${NETWORK}`);
if (KAEL !== "0") tagBits.push(`kael-${KAEL}${KAEL_FATE === "dead" ? "-dead" : ""}`);
if (CINDER) tagBits.push(CINDER_LEAVE ? `cinder-${CINDER_LEAVE}` : "cinder");
if (VANE !== "machine") tagBits.push(`vane-${VANE}`);
if (CRUCIBLE !== "splice") tagBits.push(CRUCIBLE);
if (SHAFT) tagBits.push("shaft");
if (TUNDRA !== "seat") tagBits.push(`tundra-${TUNDRA}`);
if (LAMP !== "audit") tagBits.push(`lamp-${LAMP}`);
if (SARN !== "skip") tagBits.push(`sarn-${SARN}`);
if (SPIRE !== "decline") tagBits.push(SPIRE);
const tag = process.env.TAG ?? (tagBits.length ? `act4-${tagBits.join("-")}` : "act4");
console.log(`act4 env NETWORK=${NETWORK} KAEL=${KAEL} KAEL_FATE=${KAEL_FATE} CINDER=${CINDER} VANE=${VANE} CRUCIBLE=${CRUCIBLE} SHAFT=${SHAFT} TUNDRA=${TUNDRA} LAMP=${LAMP} SARN=${SARN} SPIRE=${SPIRE} tag=${tag}`);
const out = [];
const step = (ok, msg) => { out.push(`${ok ? "PASS" : "FAIL"} ${msg}`); console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };
const { browser, page, errors } = await open();
let s;

const regionOk = (st) => Boolean(st.flags.act1 || (st.flags.pumpFate && (st.flags.checkpointSpoke || st.flags.usedCrawl)));
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

// —— real-UI combat (the player's verbs: canvas tap strikes a hostile, HUD Audit reads the foe in reach,
// seam button + Unmend/Confirm cuts, Pack → Use a bandage, Brace / End turn / Stand down) ——
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const myTurn = () => page.evaluate(() => { const d = window.__mend.getState().data; return Boolean(d.combat && d.phase === "play" && d.combat.order[d.combat.index] === "player" && !d.dialogue); });
// armed = a weapon seam is live (not severed, integrity ≥ 40, and every parent live) — same rule as weaponsDark.
const foes = () => page.evaluate(() => {
  const d = window.__mend.getState().data;
  if (!d.combat) return [];
  const live = (nodes, n, seen = new Set()) => { if (n.severed || n.integrity < 40 || n.decoy) return false; if (seen.has(n.id)) return true; seen.add(n.id); return n.dependsOn.every((p) => { const q = nodes.find((x) => x.id === p); return q && live(nodes, q, seen); }); };
  return d.combat.order.map((id) => d.actors[id]).filter((a) => a && a.alive && a.hostile).map((a) => { const w = a.nodes.find((n) => n.effect === "weapon" && live(a.nodes, n)); return { id: a.id, x: a.x, y: a.y, hp: a.hp, armed: Boolean(w), weapon: w?.name }; });
});
async function untilMyTurnOrDone(max = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    const st = await S(page);
    if (st.phase !== "play" || !st.combat || st.dlg) return st;
    await fileLevel(page);
    if (await myTurn() && !st.path) return st;
    await page.waitForTimeout(80);
  }
  return S(page);
}
async function bandageIfLow(frac = 0.45) {
  const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, n: d.inventory.find((r) => r.id === "bandage")?.qty ?? 0 }; });
  if (st.hp >= st.max * frac || st.n < 1) return false;
  await hud(page, "Pack");
  const row = page.locator("li", { hasText: "Brass bandage" }).getByRole("button", { name: "Use" });
  if (await row.count()) await row.first().click();
  await page.waitForTimeout(150);
  await key(page, "Escape");
  return true;
}
async function tapFoe(id) {
  const a = await actorAt(id);
  const ap0 = (await S(page)).ap;
  await tapAt(a.x, a.y);
  await settle(6000);
  return (await S(page)).ap !== ap0;
}
async function endOrBrace() {
  if (!(await myTurn())) return;
  const before = await page.evaluate(() => { const d = window.__mend.getState().data; return { ap: d.player.ap, round: d.combat?.round }; });
  if (before.ap < 1) { await hud(page, "End turn"); return; }
  await hud(page, "Brace");
  // Brace ends the turn itself, and the foes act synchronously, so it is usually Silas's turn
  // again by the time the click returns. Only press End turn if the Brace did not take
  // (same round, AP unspent). Pressing it unconditionally threw away every other turn.
  const after = await page.evaluate(() => { const d = window.__mend.getState().data; return { ap: d.player.ap, round: d.combat?.round, guarding: d.player.guarding }; });
  if ((await myTurn()) && after.round === before.round && after.ap === before.ap && !after.guarding) await hud(page, "End turn");
}
// The seams that keep a foe's weapon (or armor) live: the effect node and every parent it depends on
// (Rifle ← Rifle mount ← Pressure chamber; Chest plate ← Rivet line). Cutting any one darkens it.
// Empty once that effect is already dark, so a dark chain is not cut again.
const effectSeams = (id, effect = "weapon") => page.evaluate(([id, effect]) => {
  const a = window.__mend.getState().data.actors[id];
  if (!a) return [];
  const byId = new Map(a.nodes.map((n) => [n.id, n]));
  const live = (n, seen = new Set()) => { if (n.severed || n.integrity < 40 || n.decoy) return false; if (seen.has(n.id)) return true; seen.add(n.id); return n.dependsOn.every((p) => byId.get(p) && live(byId.get(p), seen)); };
  const out = new Set();
  const up = (n) => { if (!n || out.has(n.id)) return; out.add(n.id); for (const p of n.dependsOn) up(byId.get(p)); };
  for (const n of a.nodes) if (n.effect === effect && live(n)) up(n);
  const conf = (n) => (n.revealed ? n.confidence ?? "observed" : "unknown");
  const rank = (n) => (conf(n) === "confident" ? 0 : conf(n) === "understood" ? 10 : 20) + n.density;
  return [...out].map((k) => byId.get(k)).filter((n) => n.revealed && !n.severed && n.domain === "matter")
    .map((n) => ({ id: n.id, name: n.name, density: n.density, confidence: conf(n), rank: rank(n) })).sort((x, y) => x.rank - y.rank);
}, [id, effect]);
const weaponSeams = (id) => effectSeams(id, "weapon");
async function openFoeAudit() {
  await hud(page, "Audit");
  await fileLevel(page);
  return page.evaluate(() => { const d = window.__mend.getState().data; return d.panel === "audit" && d.audit ? d.audit : null; });
}
async function cutWeaponInReach(effects = ["weapon"]) {
  // HUD Audit opens the foe in reach (bug 28: not the machine Silas is beside).
  let au = await openFoeAudit();
  if (!au || au.kind !== "actor") { if ((await S(page)).panel === "audit") await key(page, "Escape"); return { ok: false, why: `audit ${au?.kind}:${au?.id}` }; }
  const bestSeam = async (id) => { for (const e of effects) { const r = (await effectSeams(id, e))[0]; if (r) return r; } return null; };
  // Read again until the seam is known. Only the first read of a foe in a fight costs AP;
  // each re-read deepens observed → understood → confident (+12 / +22 to the cut, no ring-back stun).
  let reads = 1;
  for (; reads < 4; reads++) {
    const best = await bestSeam(au.id);
    if (!best || best.confidence === "confident") break;
    await key(page, "Escape");
    au = await openFoeAudit();
    if (!au || au.kind !== "actor") return { ok: false, why: `re-read ${au?.kind}:${au?.id}` };
  }
  const best = await bestSeam(au.id);
  if (!best) { await key(page, "Escape"); return { ok: false, read: true, why: `no live ${effects.join("/")} seam on ${au.id}` }; }
  const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { ap: d.player.ap, focus: d.focus }; });
  // unmendNode: 4 AP in a fight; Focus only refuses below 4 (it drains to 0 rather than blocking).
  if (st.ap < 4 || st.focus < 4) { await key(page, "Escape"); return { ok: false, read: true, why: `read ${au.id} ${best.name} ${best.confidence} (${reads} reads; ap ${st.ap}; focus ${st.focus})` }; }
  const esc = best.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Seam buttons read "<mark> <name>" + state; match the name line exactly so "Rifle" does not pick "Rifle mount".
  await page.locator("button", { has: page.locator("span.font-semibold", { hasText: new RegExp(`^[^A-Za-z]*${esc}$`) }) }).first().click();
  await page.getByRole("button", { name: /^(Reckless )?unmend$/i }).click();
  await page.getByRole("button", { name: /Confirm unmend/i }).click();
  await page.waitForTimeout(150);
  const log = (await S(page)).log[0];
  if ((await S(page)).panel === "audit") await key(page, "Escape");
  return { ok: true, id: au.id, why: `${au.id} ${best.name} ${best.confidence}: ${log}` };
}
// Existing difficulty setting (Menu → Strain story: hits on Silas land at 0.7). It lives in the
// ledger flags, so loading slot 1 resets it; set it again after each load once field strain has lost twice.
async function strainStory() {
  await hud(page, "Menu");
  await page.getByRole("button", { name: /^Strain story/ }).click();
  await page.waitForTimeout(150);
  await key(page, "Escape");
  return (await S(page)).flags.strain;
}
async function deathReload(label) {
  const st = await S(page);
  if (st.phase !== "dead") return false;
  const deathTxt = await page.evaluate(() => document.body.innerText);
  console.log(`   [${label}] Baseline lost → Open the last ledger (${/Baseline lost/.test(deathTxt)})`);
  await page.getByRole("button", { name: "Open the last ledger" }).click();
  await page.waitForTimeout(400);
  const back = await S(page);
  console.log(`   [${label}] last ledger → phase ${back.phase}; combat ${back.combat}; hp ${back.hp}; ap ${back.ap}`);
  return true;
}
async function guardFight(reload = null, { reloadAfter = 2, maxDeaths = 30, strainAfter = 2 } = {}) {
  const notes = []; let deaths = 0, cuts = 0, rounds = 0, how = "none", auditOk = null, sinceLoad = 0, loads = 0, yields = 0;
  for (let turn = 0; turn < 400; turn++) {
    let st = await untilMyTurnOrDone();
    if (st.phase === "dead") {
      deaths++; sinceLoad++;
      if (deaths > maxDeaths) { how = "too many deaths"; break; }
      await deathReload(reload ? "fight" : "guards");
      if (reload && sinceLoad >= reloadAfter) {
        await reload(); loads++; sinceLoad = 0;
        const strain = loads > strainAfter ? await strainStory() : (await S(page)).flags.strain ?? "field";
        notes.push(`slot1 → again (strain ${strain ?? "field"})`);
      }
      continue;
    }
    // Varr at zero opens "varr-down" (he is broken open, not gone). "Strip the coupling and let him
    // crawl" needs no check and files him broken-open, so he keeps the plate stair (checkpointLead=varr).
    if (st.dlg === "varr-down/start") { await pick(page, /Strip the coupling/); how = "varr broken open"; break; }
    if (!st.combat) { how = /rumor|step out|hear you/.test(st.log.join(" ")) ? "stood down" : "ended"; break; }
    rounds = (await page.evaluate(() => window.__mend.getState().data.combat?.round)) ?? rounds;
    if (process.env.FIGHT_TRACE) {
      const t = await page.evaluate(() => { const d = window.__mend.getState().data; return { r: d.combat?.round, hp: d.player.hp, ap: d.player.ap, focus: d.focus, at: `${d.player.x},${d.player.y}`, log: d.log.slice(0, 8).reverse() }; });
      console.log(`   [trace] r${t.r} hp ${t.hp} ap ${t.ap} focus ${t.focus} at ${t.at} armed ${(await foes()).filter((f) => f.armed).map((f) => `${f.id}@${f.x},${f.y}`).join(" ")}\n      ${t.log.join("\n      ")}`);
    }
    await bandageIfLow(0.6);
    for (let k = 0; k < 3 && (await myTurn()); k++) {
      const p = await S(page);
      const T = (await foes()).filter((f) => f.armed).sort((a, b) => cheb(a, p) - cheb(b, p))[0];
      if (!T) break;
      if (cheb(T, p) > 1) {
        const spots = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].map(([dx, dy]) => ({ x: T.x + dx, y: T.y + dy })).sort((a, b) => cheb(a, p) - cheb(b, p));
        for (const q of spots) { await tapAt(q.x, q.y); if ((await S(page)).path) break; }
        await settle(8000);
        if (!(await myTurn())) break;
        if (cheb((await actorAt(T.id)), await S(page)) > 1) break;
      }
      if ((await S(page)).ap < 1) break;
      const c = await cutWeaponInReach();
      if (auditOk === null) auditOk = c.ok || c.read || !/machine/.test(c.why);
      if (c.ok) { cuts++; notes.push(`cut ${c.id}: ${c.why}`); } else { if (!c.read) notes.push(c.why); break; }
    }
    const yieldBtn = page.getByRole("button", { name: /Stand down/ });
    if ((await myTurn()) && (await yieldBtn.count())) { yields++; await yieldBtn.click(); await page.waitForTimeout(200); if (!(await S(page)).combat) { how = "stood down"; break; } }
    for (let k = 0; k < 2 && (await myTurn()) && (await S(page)).ap >= 3; k++) {
      const p = await S(page);
      const near = (await foes()).sort((a, b) => cheb(a, p) - cheb(b, p))[0];
      if (!near || cheb(near, p) > 1) break;
      await tapFoe(near.id);
      if ((await S(page)).dlg) break;
    }
    if ((await S(page)).dlg) continue;
    await endOrBrace();
  }
  const st = await S(page);
  return { won: !st.combat && st.phase === "play", how, deaths, loads, cuts, rounds, notes, auditOk, yields };
}
// Checkpoint fight played for the man who holds the stair. Varr at zero is "broken open, not gone":
// the whole squad stands down and varr-down offers "Strip the coupling and let him crawl" (no check),
// which files him broken-open → checkpointLead=varr. So: stand on Varr, darken his rifle (he falls back to
// bare hands), darken his chest plate (strikes stop landing at ×0.72), then work him down with the prybar,
// brace with what is left, bandage at 60%. Moll and Hess keep shooting; that is the fight.
async function checkpointFight(reload, { maxDeaths = 40 } = {}) {
  const notes = []; let deaths = 0, loads = 0, cuts = 0, strikes = 0, rounds = 0, how = "none", yields = 0;
  for (let turn = 0; turn < 600; turn++) {
    const st = await untilMyTurnOrDone();
    if (st.phase === "dead") {
      deaths++;
      if (deaths > maxDeaths) { how = "too many deaths"; break; }
      await deathReload("checkpoint");
      // The last ledger resumes mid-fight at whatever HP was left; a player who means it reloads slot 1.
      await reload(); loads++;
      notes.push(`death ${deaths} → slot1 (strain ${(await S(page)).flags.strain ?? "field"})`);
      continue;
    }
    if (st.dlg === "varr-down/start") { await pick(page, /Strip the coupling/); how = "varr broken open"; break; }
    if (!st.combat) { how = "ended"; break; }
    rounds = (await page.evaluate(() => window.__mend.getState().data.combat?.round)) ?? rounds;
    if (process.env.FIGHT_TRACE) {
      const t = await page.evaluate(() => { const d = window.__mend.getState().data; const v = d.actors.varr; return { r: d.combat?.round, hp: d.player.hp, ap: d.player.ap, focus: d.focus, at: `${d.player.x},${d.player.y}`, varr: `${v.x},${v.y} hp ${v.hp}`, log: d.log.slice(0, 6).reverse() }; });
      console.log(`   [trace] r${t.r} hp ${t.hp} ap ${t.ap} focus ${t.focus} at ${t.at} varr ${t.varr}\n      ${t.log.join("\n      ")}`);
    }
    await bandageIfLow(0.6);
    const v = await actorAt("varr");
    let p = await S(page);
    if (v?.hostile && cheb(v, p) > 1) {
      const spots = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].map(([dx, dy]) => ({ x: v.x + dx, y: v.y + dy })).sort((a, b) => cheb(a, p) - cheb(b, p));
      for (const q of spots) { await tapAt(q.x, q.y); if ((await S(page)).path) break; }
      await settle(8000);
    }
    p = await S(page);
    const vv = await actorAt("varr");
    if ((await myTurn()) && vv?.hostile && cheb(vv, p) <= 1 && p.ap >= 1) {
      const c = await cutWeaponInReach(["weapon", "armor"]);
      if (c.ok) { cuts++; notes.push(`cut ${c.why}`); }
      else if (!c.read) notes.push(c.why);
    }
    if ((await S(page)).dlg) continue;
    const yieldBtn = page.getByRole("button", { name: /Stand down/ });
    if ((await myTurn()) && (await yieldBtn.count())) { yields++; await yieldBtn.click(); await page.waitForTimeout(200); if (!(await S(page)).combat) { how = "stood down"; break; } }
    for (let k = 0; k < 3 && (await myTurn()) && (await S(page)).ap >= 3; k++) {
      const a = await actorAt("varr");
      p = await S(page);
      const near = a?.hostile && cheb(a, p) <= 1 ? { id: "varr" } : (await foes()).sort((x, y) => cheb(x, p) - cheb(y, p)).find((f) => cheb(f, p) <= 1);
      if (!near) break;
      if (await tapFoe(near.id)) strikes++; else break;
      if ((await S(page)).dlg) break;
    }
    if ((await S(page)).dlg) continue;
    await endOrBrace();
  }
  const st = await S(page);
  return { won: !st.combat && st.phase === "play", how, deaths, loads, cuts, strikes, rounds, notes, yields };
}
async function kaelFight(reload, { maxDeaths = 40 } = {}) {
  // Peel Kael's layered armor (ceramic / frame / mesh) then prybar him to kael-down.
  // He reseats opened plates; keep cutting. Matrix (spell) is optional once matrixKnown / audit reveals it.
  // KAEL=both: drop Striker Pye first (his kit has no weapon seam — bash through armor), then peel Kael alone.
  // Pye leaves on his turn once Kael is not holding (downConvo / fate); do not wait on that while he is still hitting.
  const notes = []; let deaths = 0, loads = 0, cuts = 0, strikes = 0, rounds = 0, how = "none";
  let rosterAtStart = null;
  for (let turn = 0; turn < 500; turn++) {
    const st = await untilMyTurnOrDone();
    if (st.phase === "dead") {
      deaths++;
      if (deaths > maxDeaths) { how = "too many deaths"; break; }
      await deathReload("kael");
      await reload(); loads++;
      if (loads > 2) {
        const strain = await strainStory();
        notes.push(`death ${deaths} → slot1 (strain ${strain ?? "field"})`);
      } else {
        notes.push(`death ${deaths} → slot1`);
      }
      continue;
    }
    if (st.dlg === "kael-down/start") { how = "kael broken open"; break; }
    if (!st.combat) { how = /broken open|rumor|step out/.test(st.log.join(" ")) ? "ended-soft" : "ended"; break; }
    rounds = (await page.evaluate(() => window.__mend.getState().data.combat?.round)) ?? rounds;
    if (rosterAtStart === null) {
      rosterAtStart = (await foes()).map((f) => f.id).sort().join(",");
      notes.push(`roster ${rosterAtStart || "(none yet)"}`);
    }
    if (process.env.FIGHT_TRACE) {
      const t = await page.evaluate(() => {
        const d = window.__mend.getState().data;
        const k = d.actors.kael;
        const armor = k.nodes.filter((n) => n.effect === "armor").map((n) => `${n.id}:${n.severed ? "sev" : n.integrity}${n.revealed ? "" : "?"}`).join(",");
        return { r: d.combat?.round, hp: d.player.hp, ap: d.player.ap, focus: d.focus, khp: k.hp, armor, order: d.combat?.order?.join(","), log: d.log.slice(0, 5).reverse() };
      });
      console.log(`   [kael] r${t.r} hp ${t.hp} ap ${t.ap} focus ${t.focus} kael ${t.khp} armor[${t.armor}] order ${t.order}\n      ${t.log.join("\n      ")}`);
    }
    await bandageIfLow(KAEL === "both" ? 0.7 : 0.55);
    const k = await actorAt("kael");
    const pye = await actorAt("rel1");
    let p = await S(page);
    // Stand on Kael in both modes: Pye's kit has no weapon seam, and once Kael is down (downConvo) or not
    // holding, Pye steps out on his own turn. KAEL_PYE=1 tries clearing Pye first (loses far more often).
    const prioritizePye = process.env.KAEL_PYE === "1" && KAEL === "both" && pye?.hostile && pye?.alive;
    const target = prioritizePye ? pye : ((k?.hostile && k?.alive) ? k : (await foes()).sort((a, b) => cheb(a, p) - cheb(b, p))[0]);
    if (target && cheb(target, p) > 1) {
      const spots = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].map(([dx, dy]) => ({ x: target.x + dx, y: target.y + dy })).sort((a, b) => cheb(a, p) - cheb(b, p));
      for (const q of spots) { await tapAt(q.x, q.y); if ((await S(page)).path) break; }
      await settle(8000);
    }
    p = await S(page);
    // Cut armor (and spell if revealed) while in reach of the priority target.
    if ((await myTurn()) && p.ap >= 1) {
      const wantId = prioritizePye ? "rel1" : (k?.hostile && k?.alive ? "kael" : null);
      const foeNear = wantId
        ? (await foes()).find((f) => f.id === wantId && cheb(f, p) <= 1)
        : (await foes()).sort((a, b) => cheb(a, p) - cheb(b, p)).find((f) => cheb(f, p) <= 1);
      if (foeNear) {
        const c = await cutWeaponInReach(["armor", "spell", "weapon"]);
        if (c.ok) { cuts++; notes.push(`cut ${c.why}`); }
        else if (!c.read) notes.push(c.why);
      }
    }
    if ((await S(page)).dlg) continue;
    // Strike: Pye first when both; else Kael; else anyone in reach.
    for (let hit = 0; hit < 3 && (await myTurn()) && (await S(page)).ap >= 3; hit++) {
      p = await S(page);
      const kk = await actorAt("kael");
      const py = await actorAt("rel1");
      let id = null;
      if (process.env.KAEL_PYE === "1" && KAEL === "both" && py?.hostile && py?.alive && cheb(py, p) <= 1) id = "rel1";
      else if (kk?.hostile && kk?.alive && cheb(kk, p) <= 1) id = "kael";
      else {
        const f = (await foes()).sort((a, b) => cheb(a, p) - cheb(b, p)).find((x) => cheb(x, p) <= 1);
        if (f) id = f.id;
      }
      if (!id) break;
      if (await tapFoe(id)) strikes++; else break;
      if ((await S(page)).dlg) break;
    }
    if ((await S(page)).dlg) continue;
    await endOrBrace();
  }
  const st = await S(page);
  return { won: st.dlg === "kael-down/start" || (!st.combat && st.phase === "play" && (st.flags.kaelFate || how === "kael broken open")), how, deaths, loads, cuts, strikes, rounds, notes, rosterAtStart };
}
async function engageSovereign() {
  const sv = await actorAt("sovereign");
  await walk(page, sv.x + 1, sv.y + 1);
  await hud(page, "Talk");
  for (let i = 0; i < 40 && !(await S(page)).dlg; i++) await page.waitForTimeout(100);
  const rs = await replies(page);
  if (!rs.some((x) => /read you while you move/.test(x))) return { ok: false, rs };
  await pick(page, /read you while you move/);
  await page.waitForTimeout(200);
  return { ok: (await S(page)).combat, rs };
}
// H14: the red fault line under HP was one truncated line, so the foe's part status was cut off with "…" at 440px.
// Each fault row must show all of its text: no ellipsis, no nowrap, nothing wider than its box.
const faultSeen = { rows: 0, clipped: [], texts: new Set() };
async function faultLineSample() {
  const rows = await page.evaluate(() => [...document.querySelectorAll(".fault-line, .intent-line")].map((el) => {
    const cs = getComputedStyle(el);
    return { text: el.textContent, clipped: el.scrollWidth > el.clientWidth + 1 || cs.textOverflow === "ellipsis" || cs.whiteSpace === "nowrap" };
  }));
  for (const r of rows) { faultSeen.rows++; faultSeen.texts.add(r.text); if (r.clipped) faultSeen.clipped.push(r.text); }
  // Turn-order chips: a name wraps beside its portrait; it is never cut to "THE EPISTE…" and never spills.
  const chips = await page.evaluate(() => [...document.querySelectorAll(".face-row .face-name")].map((el) => {
    const cs = getComputedStyle(el);
    return { text: el.textContent, clipped: el.scrollWidth > el.clientWidth + 1 || cs.textOverflow === "ellipsis" || cs.whiteSpace === "nowrap" };
  }));
  for (const c of chips) { chipSeen.names.add(c.text); if (c.clipped) chipSeen.clipped.add(c.text); }
}
const chipSeen = { names: new Set(), clipped: new Set() };
async function sovereignFight() {
  const notes = []; let deaths = 0, loads = 0, strikes = 0, rounds = 0, sinceLoad = 0, auditId = null, pinBtn = false;
  const e = await engageSovereign();
  notes.push(`engage ${e.ok} (${e.rs.join(" / ")})`);
  const continuity = (await page.evaluate(() => window.__mend.getState().data.disciplines)).includes("continuity");
  for (let turn = 0; turn < 120; turn++) {
    let st = await untilMyTurnOrDone();
    if (st.dlg === "sovereign-down/start") break;
    if (st.phase === "dead") {
      deaths++; sinceLoad++;
      if (deaths > 40) { notes.push("too many deaths"); break; }
      await deathReload("sovereign");
      if (sinceLoad >= 3) {
        // The last ledger is mid-fight and nearly empty. Do what a player does: Menu → slot 1 (saved before the fight) → back in.
        await hud(page, "Menu");
        await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
        await page.waitForTimeout(400);
        if ((await S(page)).panel !== "none") await key(page, "Escape");
        loads++; sinceLoad = 0;
        const strain = loads >= 1 ? await strainStory() : "field";
        const again = await engageSovereign();
        notes.push(`slot1 → re-engage ${again.ok} (strain ${strain ?? "field"})`);
      }
      continue;
    }
    if (!st.combat) { notes.push(`combat ended without down (${st.log[0]})`); break; }
    rounds++;
    await faultLineSample();
    await bandageIfLow();
    const p = await S(page);
    const sv = await actorAt("sovereign");
    if (!auditId && cheb(sv, p) <= 1 && p.ap >= 7) {
      await hud(page, "Audit");
      auditId = await page.evaluate(() => { const d = window.__mend.getState().data; return d.panel === "audit" ? d.audit?.id : null; });
      pinBtn = (await page.getByRole("button", { name: "Pin seam" }).count()) > 0;
      await shot(page, `${tag}-11a-sovereign-audit`);
      if ((await S(page)).panel === "audit") await key(page, "Escape");
    }
    for (let k = 0; k < 3 && (await myTurn()) && (await S(page)).ap >= 3; k++) {
      if (await tapFoe("sovereign")) strikes++;
      else break;
      if ((await S(page)).dlg) break;
    }
    if ((await S(page)).dlg) continue;
    await endOrBrace();
  }
  const st = await S(page);
  return { down: st.dlg === "sovereign-down/start", deaths, loads, strikes, rounds, notes, continuity, auditId, pinBtn };
}
const noCombat = async (label) => { const c = await S(page); step(!c.combat, `${label} no forced combat (combat ${c.combat}; ${c.log[0]})`); return !c.combat; };

// —— Act I to Oakhaven (Moll Engineering talk-past sets act1) ——
await page.getByRole("button", { name: "New ledger" }).click();
await page.getByRole("button", { name: "Recommended file" }).click();
if (process.env.BUILD === "mind9") {
  await page.getByRole("button", { name: "Decrease Presence" }).click();
  await page.getByRole("button", { name: "Increase Mind" }).click();
  const a = await page.evaluate(() => window.__mend.getState().data.draft);
  step(a.attrs.mind === 9 && a.attrs.presence === 4 && a.pool === 0, `A-b BUILD=mind9 on the create screen (mind ${a.attrs.mind}; presence ${a.attrs.presence}; pool ${a.pool}; tags ${a.tags.join(",")})`);
}
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
if (NETWORK === "varr") {
  // A player who means to fight files the ledger first: step back ("Fine." → "North, then."), file slot 1, come back.
  await fileLevel(page);
  await pick(page, /^Fine\./);
  await pick(page, /North, then/);
  if (process.env.NET_STRAIN === "story") await strainStory();
  // Focus only comes back in a fight (+2 a turn) or by resting; the pump mend left it short. A player
  // who means to fight sleeps at Tobin's bench first ("Rest and sort the ledger": focus full, HP +45%).
  const rest = async (label) => {
    const r = await auditAt("workbench");
    const ok = r.ok && (await useSpecial(/Rest and sort the ledger/));
    if ((await S(page)).panel !== "none") await key(page, "Escape");
    const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, focus: d.focus }; });
    step(ok, `${label} rest at the Reclamation bench (hp ${st.hp}/${st.max}; focus ${st.focus})`);
    return st;
  };
  if (process.env.NET_REST !== "0") await rest("A0r");
  await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
  const toPlate = async () => {
    await walk(page, 14, 10); await walk(page, 14, 12);
    let st = await S(page);
    if (!st.dlg) { await hud(page, "Talk"); for (let i = 0; i < 40; i++) { st = await S(page); if (st.dlg || !st.path) break; await page.waitForTimeout(150); } }
    await pick(page, /^Move\./);
    await pick(page, /Read them/);
  };
  await toPlate();
  s = await S(page);
  const roster = (await foes()).map((f) => f.id).sort().join(",");
  step(s.combat && /varr/.test(roster), `A0v "Move." → "Read them." starts the checkpoint fight (combat ${s.combat}; foes ${roster})`);
  const reloadPlate = async () => {
    await hud(page, "Menu");
    await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
    await page.waitForTimeout(400);
    if ((await S(page)).panel !== "none") await key(page, "Escape");
    await toPlate();
  };
  // NET_TACTIC=varr (default): play for Varr (broken open). squad: darken all three rifles → Stand down.
  const g = (process.env.NET_TACTIC ?? "varr") === "squad"
    ? await guardFight(reloadPlate, { reloadAfter: 1, maxDeaths: Number(process.env.NET_DEATHS ?? 40), strainAfter: process.env.NET_STRAIN === "story" ? 0 : 2 })
    : await checkpointFight(reloadPlate, { maxDeaths: Number(process.env.NET_DEATHS ?? 40) });
  console.log(`   [checkpoint] ${g.how}; deaths ${g.deaths}; loads ${g.loads}; cuts ${g.cuts}; strikes ${g.strikes ?? "-"}; yields ${g.yields}; last notes ${g.notes.slice(-5).join(" / ")}`);
  await closeTalk(page);
  s = await S(page);
  const v = await actorAt("varr");
  step(g.won && !s.combat && s.phase === "play", `A0w checkpoint fight resolved (${g.how}; rounds ${g.rounds}; deaths ${g.deaths}; loads ${g.loads}; cuts ${g.cuts}; yields ${g.yields}; hp ${s.hp}; varr alive ${v?.alive} hostile ${v?.hostile}; ${g.notes.slice(0, 3).join(" / ")})`);
  step(s.flags.checkpointLead === "varr" && s.flags.plateStair === true && regionOk(s), `A0x Varr keeps the plate stair (checkpointLead ${s.flags.checkpointLead}; plateStair ${s.flags.plateStair}; act1 ${s.flags.act1}; checkpointSpoke ${s.flags.checkpointSpoke}; log ${s.log.slice(0, 2).join(" / ")})`);
  passed = g.won;
  // The fight leaves Silas thin, and Cut the brake drops the slab on whoever is beside the crane
  // (always Silas: the special needs him beside it). Sleep it off before leaving the Sinks.
  if (passed && process.env.NET_REST !== "0") { await rest("A0y"); await rest("A0y'"); }
  if (passed && CINDER) {
    const scrap = await page.evaluate(() => window.__mend.getState().data.inventory.find((r) => r.id === "scrap")?.qty ?? 0);
    const tc = await talkTo("cinder");
    s = await S(page);
    const crs = await replies(page);
    step(/^cinder\//.test(s.dlg || "") && scrap >= 1 && crs.some((x) => /plate scrap/.test(x)), `A0c Talk Cinder at the bellows with plate scrap (${tc.how}; ${s.dlg}; scrap ${scrap}; ${crs.join(" / ")})`);
    await pick(page, /plate scrap/);
    await pick(page, /Hold still/);
    await closeTalk(page);
    s = await S(page);
    const moth = await page.evaluate(() => { const c = window.__mend.getState().data.actors.cinder; return c && { companion: c.companion, map: c.mapId }; });
    step(s.flags.cinderFed === true && s.flags.cinderChose === true && moth?.companion === true && !s.combat, `A0c' Cinder fed and chose the shadow (cinderFed ${s.flags.cinderFed}; cinderChose ${s.flags.cinderChose}; companion ${moth?.companion}; log ${s.log[0]})`);
    if (CINDER_LEAVE) {
      const rb = await auditAt("bellows");
      const stopped = rb.ok && (await useSpecial(/Stop the lung/));
      if ((await S(page)).panel !== "none") await key(page, "Escape");
      s = await S(page);
      const c = await page.evaluate(() => { const a = window.__mend.getState().data.actors.cinder; return { companion: a.companion, fear: a.bond?.fear, focus: window.__mend.getState().data.focus }; });
      step(stopped && s.flags.bellowsLive === false && c.companion && c.fear >= 16 && !s.flags.cinderLeft, `A0c'' Stop the lung with Cinder in the shadow (bellowsLive ${s.flags.bellowsLive}; companion ${c.companion}; fear ${c.fear}; focus ${c.focus}; log ${s.log[0]})`);
    }
  }
}
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
  // pendingLevel holds walk keys the same way it holds taps (Game.tsx); File it first or Arrow never departs.
  await fileLevel(page);
  if ((await S(page)).panel !== "none") await key(page, "Escape");
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press(arrow);
    for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== fromMap || s.dlg) break; await page.waitForTimeout(120); }
    if (/^cinder-(dark|spire)\//.test(s.dlg || "")) {
      const convo = s.dlg.split("/")[0];
      await pick(page, /Wait until she steps/);
      await closeTalk(page);
      const f = (await S(page)).flags;
      cinderBeats.push(`${convo}@${fromMap}→${convo === "cinder-dark" ? f.cinderDarkOk : f.cinderSpireOk}`);
      await fileLevel(page);
      // Silas is still standing on the mouth. Another Arrow walks off it; a tap on the mouth tile he stands on
      // departs (store clickTile → depart), which is what a player does after she steps.
      await page.evaluate(() => { const G = window.__mend.getState(); G.clickTile(G.data.player.x, G.data.player.y); });
      for (let i = 0; i < 25; i++) { s = await S(page); if (s.map !== fromMap || s.dlg) break; await page.waitForTimeout(120); }
      if (s.map !== fromMap || s.dlg) return s;
      continue;
    }
    if (s.map !== fromMap || s.dlg) return s;
    await fileLevel(page);
  }
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
// DUMP=/tmp/x DUMP_AT=C7|C10|V3 writes localStorage (slot 1 + auto) for scratch probes of side branches.
async function dumpAt(label) {
  if (!process.env.DUMP || (process.env.DUMP_AT ?? "V3") !== label) return;
  if (label !== "V3") { await hud(page, "Menu"); await page.getByRole("button", { name: /slot ?1/i }).first().click(); await page.waitForTimeout(200); await key(page, "Escape"); }
  writeFileSync(process.env.DUMP, JSON.stringify(await page.evaluate(() => ({ ...localStorage }))));
}

// —— NETWORK=varr: Quarry detour so stone can move (Hask clears the riggers → Cut the brake) ——
if (NETWORK === "varr") {
  await fileLevel(page);
  const qTap = await tapWalk(page, 33, 4, [34, 4]);
  s = await mouthStep("road", "ArrowRight");
  step(s.map === "quarry", `Q1v Quarry road → The Clockwork Canyon (${qTap.taps} taps; ${s.map} ${s.x},${s.y})`);
  const th = await talkTo("hask");
  const hr = await replies(page);
  if (hr.some((x) => /Get your people off the stone/.test(x))) await pick(page, /Get your people off the stone/);
  await closeTalk(page);
  s = await S(page);
  step(Boolean(s.flags.workersClear) && !s.combat, `Q2v Hask clears the riggers (workersClear ${s.flags.workersClear}; ${th.how}; ${hr.join(" / ")})`);
  await dumpAt("Q2v");
  if (KAEL !== "0") {
    // Rest + file so a death reloads a full ledger beside the pit, not the thin mid-fight auto.
    if (process.env.NET_REST !== "0") {
      // Tobin's bench is back in the Sinks; on the Quarry there is no rest machine. Bandages + focus from
      // the post-checkpoint rests are what we have. File slot 1 here as the Kael save.
    }
    await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
    const tk = await talkTo("kael");
    s = await S(page);
    step(/kael-pre/.test(s.dlg || ""), `Q2k Talk Kael (${tk.how}; ${s.dlg}; at ${s.x},${s.y})`);
    if (KAEL === "duel") {
      await pick(page, /riggers walk/);
      {
        const st = await S(page);
        const waved = /private geometry|waves the striker/i.test(st.log.join(" "));
        step(st.flags.duel === true, `Q2k' duel line (duel ${st.flags.duel}; waved ${waved}; log ${st.log[0]}; dlg ${st.dlg})`);
      }
    } else {
      await pick(page, /show me the layers/);
    }
    // fight node → Engage
    const beforeEngage = await S(page);
    if (/kael-pre\/fight/.test(beforeEngage.dlg || "")) await pick(page, /Engage/);
    else if ((await replies(page)).some((x) => /Engage/.test(x))) await pick(page, /Engage/);
    s = await S(page);
    const roster = (await foes()).map((f) => f.id).sort().join(",");
    const duelOk = KAEL === "duel" ? (s.flags.duel === true && !/rel1/.test(roster)) : true;
    const bothOk = KAEL === "both" ? /kael/.test(roster) && /rel1/.test(roster) : true;
    step(s.combat && /kael/.test(roster) && duelOk && bothOk, `Q2k'' Engage Kael (combat ${s.combat}; roster ${roster}; duel ${s.flags.duel}; mode ${KAEL})`);
    const reloadKael = async () => {
      await hud(page, "Menu");
      await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
      await page.waitForTimeout(400);
      if ((await S(page)).panel !== "none") await key(page, "Escape");
      const t2 = await talkTo("kael");
      if (!/kael-pre/.test((await S(page)).dlg || "")) throw new Error(`reload Kael talk failed (${t2.how}; ${(await S(page)).dlg})`);
      if (KAEL === "duel") await pick(page, /riggers walk/);
      else await pick(page, /show me the layers/);
      if ((await replies(page)).some((x) => /Engage/.test(x))) await pick(page, /Engage/);
      else if (/kael-pre\/fight/.test((await S(page)).dlg || "")) await pick(page, /Engage/);
    };
    const g = await kaelFight(reloadKael, { maxDeaths: Number(process.env.KAEL_DEATHS ?? 40) });
    console.log(`   [kael] ${g.how}; deaths ${g.deaths}; loads ${g.loads}; cuts ${g.cuts}; strikes ${g.strikes}; roster ${g.rosterAtStart}; notes ${g.notes.slice(-4).join(" / ")}`);
    s = await S(page);
    step(g.how === "kael broken open" || s.dlg === "kael-down/start", `Q2kd Kael broken open (${g.how}; dlg ${s.dlg}; deaths ${g.deaths}; cuts ${g.cuts}; strikes ${g.strikes})`);
    if (s.dlg === "kael-down/start") {
      await pick(page, KAEL_FATE === "dead" ? /doctrine dies with the man/ : /Live\. Take that sentence/);
      await closeTalk(page);
    }
    s = await S(page);
    const pye = await actorAt("rel1");
    const siphon = (s.journal || []).some((j) => /^siphon:/.test(j));
    if (KAEL_FATE === "dead") {
      const kk = await actorAt("kael");
      const sj = await page.evaluate(() => window.__mend.getState().data.journal?.find((j) => j.id === "siphon")?.text ?? "");
      step(s.flags.kaelFate === "dead" && kk && kk.alive === false && /You killed Kael/.test(sj), `Q2ke† kill Kael (kaelFate ${s.flags.kaelFate}; kael alive ${kk?.alive}; siphon "${sj.slice(0, 60)}")`);
    }
    step(s.flags.kaelFate === (KAEL_FATE === "dead" ? "dead" : "spared") && s.flags.knowsSiphon === true && s.flags.citadelOpen === true && siphon && !s.combat,
      `Q2ke ${KAEL_FATE} Kael → siphon / citadelOpen (kaelFate ${s.flags.kaelFate}; knowsSiphon ${s.flags.knowsSiphon}; citadelOpen ${s.flags.citadelOpen}; siphonJ ${siphon}; duel ${s.flags.duel}; rel1 hostile ${pye?.hostile}; combat ${s.combat})`);
    if (KAEL === "duel") {
      step(s.flags.duel === true && g.rosterAtStart === "kael", `Q2kf RelSec waved off (duel ${s.flags.duel}; fight roster ${g.rosterAtStart}; rel1 alive ${pye?.alive})`);
    }
    if (KAEL === "both") {
      step(/kael/.test(g.rosterAtStart || "") && /rel1/.test(g.rosterAtStart || ""), `Q2kf' both opened with RelSec (fight roster ${g.rosterAtStart})`);
    }
    if (!(g.how === "kael broken open" || s.flags.kaelFate)) {
      // Failed fight: do not walk the brake/rest path on a dead or mid-combat ledger (stage null crash).
      step(false, `Q2kg abort post-Kael path (${g.how}; phase ${s.phase}; hp ${s.hp}; combat ${s.combat})`);
      await shot(page, `${tag}-00-kael-fail`);
      await dumpAt("Q2ke-fail");
      const fails = out.filter((l) => l.startsWith("FAIL")).length;
      step(false, `Z0 Kael path aborted (${out.length} checks; ${fails} FAIL; ${g.how})`);
      if (errors.length) console.log(errors.slice(0, 8).join("\n"));
      writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
      await browser.close();
      process.exit(1);
    } else {
    // Cut the brake drops the slab on Silas. Bandage what we have; if still thin, detour to
    // Rust guild bench (legitimate rest), then return to the Quarry for the brake.
    for (let i = 0; i < 6; i++) {
      const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, n: d.inventory.find((r) => r.id === "bandage")?.qty ?? 0 }; });
      if (st.hp >= st.max * 0.85 || st.n < 1) break;
      await hud(page, "Pack");
      const row = page.locator("li", { hasText: "Brass bandage" }).getByRole("button", { name: "Use" });
      if (await row.count()) await row.first().click();
      await page.waitForTimeout(150);
      await key(page, "Escape");
    }
    let preBrake = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, n: d.inventory.find((r) => r.id === "bandage")?.qty ?? 0, focus: d.focus }; });
    if (preBrake.hp <= 16 && process.env.NET_REST !== "0") {
      await walk(page, 32, 8);
      s = await mouthStep("quarry", "ArrowRight");
      step(s.map === "road", `Q2kg' thin after Kael → Stack mouth to road (hp ${preBrake.hp}; ${s.map} ${s.x},${s.y})`);
      const rustTapPre = await tapWalk(page, 33, 6, [34, 6]);
      s = await mouthStep("road", "ArrowRight");
      step(s.map === "rust", `Q2kg'' Rust cut for guild rest (${rustTapPre.taps} taps; ${s.map})`);
      const rb = await auditAt("guildbench");
      const rested = rb.ok && (await useSpecial(/Rest and sort the ledger/));
      if ((await S(page)).panel !== "none") await key(page, "Escape");
      preBrake = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, n: d.inventory.find((r) => r.id === "bandage")?.qty ?? 0, focus: d.focus }; });
      step(rested && preBrake.hp > 16, `Q2kg3 Guild bench rest before brake (hp ${preBrake.hp}/${preBrake.max}; focus ${preBrake.focus})`);
      await walk(page, 33, 8);
      s = await mouthStep("rust", "ArrowRight");
      await walk(page, 33, 4);
      s = await mouthStep("road", "ArrowRight");
      step(s.map === "quarry", `Q2kg4 back to Quarry for the brake (${s.map} ${s.x},${s.y})`);
    } else {
      step(true, `Q2kg HP before Cut the brake (hp ${preBrake.hp}/${preBrake.max}; bandages ${preBrake.n}; focus ${preBrake.focus})`);
    }
    await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
    await shot(page, `${tag}-00-kael-down`);
    await dumpAt("Q2ke");
    if (process.env.STOP_AFTER === "kael" || process.env.STOP_AFTER === "Q2ke") {
      const fails = out.filter((l) => l.startsWith("FAIL")).length;
      step(errors.length === 0 && fails === 0, `Z0 STOP_AFTER=kael (${out.length} checks; ${fails} FAIL; page/console errors ${errors.length})`);
      if (errors.length) console.log(errors.slice(0, 8).join("\n"));
      writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
      await browser.close();
      process.exit(fails || errors.length ? 1 : 0);
    }
    } // end else: Kael broken open
  }
  await walk(page, 11, 4);
  const rc = await auditAt("crane");
  const cut = await useSpecial(/Cut the brake/i);
  if ((await S(page)).panel === "audit") await key(page, "Escape");
  s = await S(page);
  step(rc.ok && cut && s.flags.quarryStone === "clear" && s.flags.stoneMoving === true && !s.combat, `Q3v Cut the brake → stone moves on the Varr-held stair (quarryStone ${s.flags.quarryStone}; stoneMoving ${s.flags.stoneMoving}; citadelSupplied ${s.flags.citadelSupplied}; log ${s.log[0]})`);
  await dumpAt("Q3v");
  // Slab crush can floor Silas if the Kael duel left him thin. Reload the post-Kael slot and re-cut.
  if ((await S(page)).phase === "dead") {
    console.log("   [brake] slab floored Silas → slot1 → re-cut");
    await hud(page, "Menu");
    await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
    await page.waitForTimeout(400);
    if ((await S(page)).panel !== "none") await key(page, "Escape");
    for (let i = 0; i < 6; i++) {
      const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, n: d.inventory.find((r) => r.id === "bandage")?.qty ?? 0 }; });
      if (st.hp >= st.max * 0.85 || st.n < 1) break;
      await hud(page, "Pack");
      const row = page.locator("li", { hasText: "Brass bandage" }).getByRole("button", { name: "Use" });
      if (await row.count()) await row.first().click();
      await page.waitForTimeout(150);
      await key(page, "Escape");
    }
    await walk(page, 11, 4);
    const rc2 = await auditAt("crane");
    const cut2 = await useSpecial(/Cut the brake/i);
    if ((await S(page)).panel === "audit") await key(page, "Escape");
    s = await S(page);
    step(rc2.ok && cut2 && s.flags.quarryStone === "clear" && s.phase === "play", `Q3v' re-cut after slab death (phase ${s.phase}; hp ${s.hp}; stoneMoving ${s.flags.stoneMoving})`);
  }
  await fileLevel(page);
  await walk(page, 32, 8);
  s = await mouthStep("quarry", "ArrowRight");
  const q4 = await page.evaluate(() => { const d = window.__mend.getState().data; return { combat: d.combat?.order?.join(","), dlg: d.dialogue && `${d.dialogue.convo}/${d.dialogue.node}`, log: d.log.slice(0, 3).join(" / ") }; });
  step(s.map === "road", `Q4v Quarry Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; combat ${q4.combat}; dlg ${q4.dlg}; log ${q4.log})`);
}
// —— Stack Road → Rust cut → Rust Districts (act1 signed by the talk-past) ——
await fileLevel(page);
const rustTap = await tapWalk(page, 33, 6, [34, 6]);
s = await S(page);
step(rustTap.ok && s.x === 33 && s.y === 6, `B1 real taps along the road to beside Rust cut (${rustTap.taps} taps; ${s.x},${s.y})`);
s = await mouthStep("road", "ArrowRight");
step(s.map === "rust" && s.panel === "none", `B2 Rust cut → Rust Districts (${s.map} ${s.x},${s.y}; panel ${s.panel})`);

if (CINDER_LEAVE) {
  s = await S(page);
  const hc = await page.evaluate(() => { const d = window.__mend.getState().data; return { heat: Boolean(d.flags.gearLive || d.flags.tenementWarm || d.flags.guildWarm), fear: d.actors.cinder?.bond?.fear }; });
  step(/^cinder-heat\//.test(s.dlg || ""), `B2c Rust cut raises cinder-heat (dlg ${s.dlg}; rustHeat ${hc.heat}; bellowsLive ${s.flags.bellowsLive}; fear ${hc.fear})`);
  if (/^cinder-heat\//.test(s.dlg || "")) await pick(page, CINDER_LEAVE === "leave" ? /won't take you into that noise/ : /I'm going in/);
  await closeTalk(page);
  await walk(page, 32, 8);
  await page.waitForTimeout(300);
  s = await S(page);
  const c = await page.evaluate(() => { const d = window.__mend.getState().data; const a = d.actors.cinder; return { companion: a.companion, map: a.mapId, x: a.x, y: a.y, q: d.journal?.find((j) => j.id === "moth-return")?.status ?? null, said: d.flags.cinderLeftSaid }; });
  step(s.flags.cinderLeft === true && c.companion === false && c.map === "sinks" && c.x === 30 && c.y === 3 && (CINDER_LEAVE === "leave" || s.flags.cinderRisk === true),
    `B2d Cinder leaves the shadow (${CINDER_LEAVE}; cinderLeft ${s.flags.cinderLeft}; cinderRisk ${s.flags.cinderRisk}; companion ${c.companion}; at ${c.map} ${c.x},${c.y}; said ${c.said}; journal moth-return ${c.q}; log ${s.log.slice(0, 2).join(" / ")})`);
}
// B3 Ives briefing opens the Citadel (dialogue.ts ives/welcome → citadelOpen). No Kael fight needed.
let t = await talkTo("ives");
step(/ives/.test(t.s.dlg || ""), `B3 Talk Ives (${t.how}; ${t.s.dlg})`);
await pick(page, /maintain the maintainers/);
await pick(page, /speak to Mara before I decide/);
await closeTalk(page);
s = await S(page);
step(s.flags.citadelOpen === true && s.flags.guildBriefed === true && !s.dlg, `B3b Ives welcome → citadelOpen (${s.flags.citadelOpen}; guildBriefed ${s.flags.guildBriefed}; journal ${s.journal?.filter((j) => /guild/.test(j)).join(",")})`);
await shot(page, `${tag}-01-ives-citadel-open`);
// Kael duel spends Focus on Unmend. The guild bench is the natural rest before the Citadel cell.
if ((KAEL !== "0" || CINDER_LEAVE) && process.env.NET_REST !== "0") {
  const r = await auditAt("guildbench");
  const ok = r.ok && (await useSpecial(/Rest and sort the ledger/));
  if ((await S(page)).panel !== "none") await key(page, "Escape");
  const st = await page.evaluate(() => { const d = window.__mend.getState().data; return { hp: d.player.hp, max: d.player.maxHp, focus: d.focus }; });
  step(ok && st.focus >= 4, `B3c rest at the Guild bench (${KAEL !== "0" ? "after Kael" : "focus for Seat the reed"}; hp ${st.hp}/${st.max}; focus ${st.focus})`);
}

// B4 Back to the road via the Rust Stack mouth (34,8)
await walk(page, 33, 8);
s = await mouthStep("rust", "ArrowRight");
step(s.map === "road" && s.panel === "none", `B4 Rust Stack mouth → Stack Road (${s.map} ${s.x},${s.y})`);

if (CINDER_LEAVE) {
  // The second choosing: back to the Sinks, seat the reed, stand by her perch.
  await walk(page, 3, 7);
  s = await mouthStep("road", "ArrowLeft");
  step(s.map === "sinks", `B4c Sinks mouth → The Sinks (${s.map} ${s.x},${s.y}; dlg ${s.dlg})`);
  await closeTalk(page);
  const rb = await auditAt("bellows");
  const seated = rb.ok && (await useSpecial(/Seat the reed/));
  if ((await S(page)).panel !== "none") await key(page, "Escape");
  await walk(page, 28, 3);
  await page.waitForTimeout(400);
  s = await S(page);
  const c = await page.evaluate(() => { const d = window.__mend.getState().data; const a = d.actors.cinder; return { companion: a.companion, map: a.mapId, focus: d.focus, q: d.journal?.find((j) => j.id === "moth-return")?.status ?? null, p: `${d.player.x},${d.player.y}` }; });
  step(seated && s.flags.bellowsLive !== false && s.flags.cinderBack === true && !s.flags.cinderLeft && c.companion === true,
    `B4d Seat the reed → Cinder steps back on (bellowsLive ${s.flags.bellowsLive}; cinderBack ${s.flags.cinderBack}; cinderLeft ${s.flags.cinderLeft}; companion ${c.companion}; at ${c.p}; focus ${c.focus}; journal moth-return ${c.q}; log ${s.log.slice(0, 3).join(" / ")})`);
  await walk(page, 24, 18);
  s = await mouthStep("sinks", "ArrowRight");
  step(s.map === "road", `B4e Stack mouth → Stack Road with Cinder (${s.map} ${s.x},${s.y}; dlg ${s.dlg})`);
}
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

// T3c Kel cleats (after hollowRead): "The hollow is warm. I need the middle of the walk."
if (TUNDRA === "cut" || process.env.CLEATS === "1") {
  t = await talkTo("kel");
  const kelRs = await replies(page);
  step(/kel/.test(t.s.dlg || "") && kelRs.some((x) => /hollow is warm|middle of the walk/i.test(x)), `T3c Kel offers cleats after hollowRead (${kelRs.join(" / ")})`);
  if (kelRs.some((x) => /hollow is warm|middle of the walk/i.test(x))) {
    await pick(page, /hollow is warm|middle of the walk/i);
    const cleatRs = await replies(page);
    if (cleatRs.some((x) => /take the edge/i.test(x))) await pick(page, /take the edge/i);
  }
  await closeTalk(page);
  s = await S(page);
  const cleatQty = await inv("cleat");
  step(s.flags.cleatGiven === true && cleatQty >= 1, `T3d Kel hands Edge cleats (cleatGiven ${s.flags.cleatGiven}; qty ${cleatQty}; log ${s.log[0]})`);
}

// T4 Drift
t = await talkTo("drift");
const driftRs = await replies(page);
step(/drift/.test(t.s.dlg || "") && driftRs.length > 0, `T4 Talk Drift (${t.how}; ${t.s.dlg}; ${driftRs.join(" / ")})`);
await page.locator(".ledger li button").first().click(); await page.waitForTimeout(150);
await closeTalk(page);
s = await S(page);
step(!s.dlg && s.flags.driftMet === true, `T4b Drift talk closes (driftMet ${s.flags.driftMet})`);

// T5 Glaze stake → Seat the span (default) or Cut the span (TUNDRA=cut)
r = await auditAt("stake");
step(r.ok, `T5 Audit Glaze stake opens (${r.how})`);
if (TUNDRA === "cut") {
  const cutSpan = await useSpecial(/Cut the span/i);
  s = await S(page);
  step(cutSpan && s.flags.iceCut === true && s.flags.iceSpan !== true, `T5b Cut the span (iceCut ${s.flags.iceCut}; iceSpan ${s.flags.iceSpan}; log ${s.log.slice(0, 2).join(" / ")})`);
  // Brass ice `!` tiles on the tundra are at (10–11,5) and (16–17,5). Cleats in pack do not auto-equip;
  // equipped cleats (armor.ice) would cancel the bill. Step the middle after the cut to take the harder bite.
  const hpBefore = s.hp;
  const notedBefore = s.flags.iceNoted === true;
  await walk(page, 16, 5);
  s = await S(page);
  const billed = s.hp <= hpBefore - 2 || (s.hp < hpBefore && /cut glaze bills|bills the middle twice/i.test(s.log.join(" | ")));
  step(billed || (s.x === 16 && s.y === 5 && s.flags.iceCut), `T5c iceCut walk on ! (16,5) (hp ${hpBefore}→${s.hp}; iceNoted was ${notedBefore}; log ${s.log[0]})`);
} else {
  const seatSpan = await useSpecial(/Seat the span/i);
  s = await S(page);
  step(seatSpan, `T5b Seat the span tried (iceSpan ${s.flags.iceSpan}; log ${s.log.slice(0, 2).join(" / ")})`);
}
if ((await S(page)).panel === "audit") await key(page, "Escape");
await noCombat("T5d");

// T6 Save/Continue on the tundra
await saveContinue("T6", ["tundraWalked", "citadelOpen", "hollowRead", "driftMet", "iceSpan", "iceCut", "cleatGiven", "guildBriefed"]);
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

// C3 Road lamp glass (audit only by default; LAMP=break takes Break the glass)
r = await auditAt("lamps");
step(r.ok, `C3 Audit Road lamp glass opens (${r.how})`);
if (LAMP === "break") {
  const broke = await useSpecial(/Break the glass/i);
  s = await S(page);
  step(broke && /break the lamp glass|stack road will not have that child/i.test(s.log.join(" | ")), `C3b Break the glass (roadDark ${s.flags.roadDark}; roadLamps ${s.flags.roadLamps}; log ${s.log[0]})`);
  // roadDark may settle on reconcile after leaving the panel
  if ((await S(page)).panel === "audit") await key(page, "Escape");
  s = await S(page);
  step(s.flags.roadDark === true || s.flags.roadLamps === false, `C3c lamp glass cut darkens the road (roadDark ${s.flags.roadDark}; roadLamps ${s.flags.roadLamps})`);
} else {
  await key(page, "Escape");
}

// C4 Walk up the south throat to the orrery hall → Read the drive
r = await auditAt("orrery");
s = await S(page);
step(r.ok && !s.combat, `C4 walk up to the Frost orrery and Audit (${r.how}; at ${s.x},${s.y}; combat ${s.combat})`);
const readO = await useSpecial(/Read the drive/i);
s = await S(page);
step(readO && /rings/.test(s.log[0] ?? ""), `C4b Read the drive (${s.log[0]})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await shot(page, `${tag}-06-orrery`);

// C5 Sarn (kitchen) — SARN=toll takes "The plate is unfed." when guardToll
t = await talkTo("sarn");
const sarnFlags = (await S(page)).flags;
const sarnRs = await replies(page);
step(/sarn/.test(t.s.dlg || "") && !t.s.combat, `C5 Talk Sarn (${t.how}; ${t.s.dlg}; combat ${t.s.combat}; guardToll ${sarnFlags.guardToll}; citadelSupplied ${sarnFlags.citadelSupplied}; replies ${sarnRs.join(" / ")})`);
if (SARN === "toll" && sarnRs.some((x) => /plate is unfed/i.test(x))) {
  await pick(page, /plate is unfed/i);
  const tollRs = await replies(page);
  step(/missing meal|not a new law|unfed/i.test(await dlgText(page)) || tollRs.some((x) => /missing meal|not a new law/i.test(x)), `C5t Sarn toll beat (${(await dlgText(page)).slice(0, 120)}; ${tollRs.join(" / ")})`);
  if (tollRs.some((x) => /missing meal|not a new law/i.test(x))) await pick(page, /missing meal|not a new law/i);
  s = await S(page);
  step(s.flags.sarnMet === true, `C5u Sarn toll closes (sarnMet ${s.flags.sarnMet}; log ${s.log[0]})`);
} else if (SARN === "toll" && sarnRs.some((x) => /Stone reached the stores/i.test(x))) {
  await pick(page, /Stone reached the stores/i);
  const storeRs = await replies(page);
  if (storeRs.some((x) => /Feed the room/i.test(x))) await pick(page, /Feed the room/i);
  else if (storeRs.length) await page.locator(".ledger li button").first().click();
  s = await S(page);
  step(s.flags.sarnMet === true, `C5s Sarn stores beat (sarnMet ${s.flags.sarnMet}; log ${s.log[0]})`);
} else {
  if (SARN === "toll") {
    // Not a soft-lock: on the Engineering talk-past path, live Sinks food still feeds the plate (food-fed),
    // so guardToll stays false and citadelSupplied needs stoneMoving. Recorded as played-unavailable.
    step(true, `C5t Sarn toll/stores unavailable on this network (guardToll ${sarnFlags.guardToll}; citadelSupplied ${sarnFlags.citadelSupplied}; replies ${sarnRs.join(" / ")})`);
  }
  await closeTalk(page);
}
await noCombat("C5b");

// C6 Vane → look → choice → answer on the machine
t = await talkTo("vane");
step(/vane/.test(t.s.dlg || "") && !t.s.combat, `C6 Talk Vane (${t.how}; ${t.s.dlg}; ${(await replies(page)).join(" / ")})`);
await shot(page, `${tag}-07-vane`);
await pick(page, /look at the engine|show me the engine/i);
await pick(page, /ceremony, with your pins/);
const choiceRs = await replies(page);
step(choiceRs.some((x) => /answer on the machine/.test(x)), `C6b Vane choice offers horns / history / machine (${choiceRs.join(" / ")})`);
let exposed = false;
if (VANE === "machine") {
  await pick(page, /answer on the machine/);
  await closeTalk(page);
  await noCombat("C6c");
} else {
  // Vane's ceremony. Leave the talk, spend points on the character sheet if the branch needs a skill, file slot 1, then ask.
  await closeTalk(page);
  const want = VANE === "horns" ? "Speech" : "History";
  const skillId = want.toLowerCase();
  const sk0 = await page.evaluate((id) => { const d = window.__mend.getState().data; return { v: d.player.skills[id], pts: d.skillPoints }; }, skillId);
  let spent = 0;
  if (VANE !== "fail") {
    await hud(page, "Self");
    const plus = page.getByRole("button", { name: `Improve ${want}` });
    for (let i = 0; i < 30 && (await plus.isEnabled().catch(() => false)); i++) { await plus.click(); spent++; await page.waitForTimeout(40); }
    await key(page, "Escape");
  }
  const sk1 = await page.evaluate((id) => { const d = window.__mend.getState().data; return { v: d.player.skills[id], pts: d.skillPoints }; }, skillId);
  step(VANE === "fail" ? sk1.v === sk0.v : sk1.v > sk0.v && sk1.pts < sk0.pts,
    `C6v ${want} on the sheet before the ceremony (${sk0.v}→${sk1.v}; points ${sk0.pts}→${sk1.pts}; clicks ${spent})`);
  await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
  const checkRe = VANE === "history" || VANE === "fail" ? /History, then/ : /Put it on the horns/;
  const askCeremony = async () => {
    const tv = await talkTo("vane");
    if (!/vane/.test(tv.s.dlg || "")) return { ok: false, why: `talk ${tv.how} ${tv.s.dlg}` };
    await pick(page, /look at the engine|show me the engine/i);
    await pick(page, /ceremony, with your pins/);
    const rs = await replies(page);
    const shown = rs.find((x) => checkRe.test(x)) ?? "";
    await pick(page, checkRe);
    const st = await S(page);
    return { ok: true, shown, st, roll: st.log.find((l) => /(speech|history) (holds|fails)/.test(l)) ?? "" };
  };
  let res = null, tries = 0, reloads = 0;
  for (; tries < 8; tries++) {
    res = await askCeremony();
    if (!res.ok) break;
    const passedCheck = res.st.flags.citadelFate === "expose";
    if (VANE === "fail" ? !passedCheck : passedCheck) break;
    console.log(`   ceremony try ${tries + 1}: ${res.roll} — not this branch; Menu → slot 1`);
    if (res.st.dlg === "vane/fail") await shot(page, `${tag}-07f-vane-fail-node`);
    await closeTalk(page);
    // A pass on VANE=fail, or a failed roll (→ guard fight) on horns/history: load the file filed at Vane.
    await hud(page, "Menu");
    await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
    await page.waitForTimeout(400);
    if ((await S(page)).panel !== "none") await key(page, "Escape");
    reloads++;
  }
  step(res?.ok, `C6w ceremony check offered with its odds (${res?.shown}; tries ${tries + 1}; slot reloads ${reloads}; ${res?.roll})`);
  s = await S(page);
  if (VANE === "fail") {
    step(s.dlg === "vane/fail" && /floor will be cleaned/.test(await dlgText(page)) && !s.flags.citadelFate && !s.flags.spireOpen,
      `C6x failed ceremony → "Then the floor will be cleaned." (dlg ${s.dlg}; fate ${s.flags.citadelFate}; spireOpen ${s.flags.spireOpen}; ${res?.roll})`);
    await shot(page, `${tag}-07f-vane-fail`);
    await pick(page, /^No\./);
    s = await S(page);
    const roster = (await foes()).map((f) => f.id).sort().join(",");
    step(s.combat && roster === "guard1,guard2", `C6y "No." starts the ceremony guard fight (combat ${s.combat}; foes ${roster})`);
    const g = await guardFight(async () => {
      await hud(page, "Menu");
      await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
      await page.waitForTimeout(400);
      if ((await S(page)).panel !== "none") await key(page, "Escape");
      for (let k = 0; k < 8; k++) {
        const again = await askCeremony();
        if ((await S(page)).dlg === "vane/fail") { await pick(page, /^No\./); return; }
        await closeTalk(page);
        if (again.st?.flags?.citadelFate) {
          await hud(page, "Menu"); await page.getByRole("button", { name: /^slot1 ·/ }).first().click(); await page.waitForTimeout(400);
          if ((await S(page)).panel !== "none") await key(page, "Escape");
        }
      }
    });
    await closeTalk(page);
    s = await S(page);
    step(g.won && !s.combat && s.phase === "play", `C6z ceremony guard fight resolved, no soft-lock (${g.how}; rounds ${g.rounds}; deaths ${g.deaths}; slot loads ${g.loads}; strain ${s.flags.strain ?? "field"}; cuts ${g.cuts}; hp ${s.hp}; ${g.notes.slice(0, 3).join(" / ")})`);
    // The story goes on: Vane still talks, and the machine answer is still there.
    const tv = await talkTo("vane");
    const rsAfter = await replies(page);
    step(/vane/.test(tv.s.dlg || "") && !tv.s.combat, `C6z2 Vane talks after the failed ceremony (${tv.how}; ${tv.s.dlg}; ${rsAfter.join(" / ")})`);
    await pick(page, /look at the engine|show me the engine/i);
    await pick(page, /ceremony, with your pins/);
    await pick(page, /answer on the machine/);
    await closeTalk(page);
    await noCombat("C6c");
  } else {
    exposed = s.flags.citadelFate === "expose";
    const causal = (await page.evaluate(() => window.__mend.getState().data.disciplines)).includes("causal");
    step(exposed && s.flags.spireOpen === true && !s.combat && !s.dlg && causal,
      `C6x ${VANE} check holds → citadelFate expose, spireOpen, Causality (fate ${s.flags.citadelFate}; spireOpen ${s.flags.spireOpen}; causal ${causal}; combat ${s.combat}; ${res?.roll}; log ${s.log.slice(0, 2).join(" / ")})`);
    await shot(page, `${tag}-07x-vane-${VANE}`);
    await closeTalk(page);
    await noCombat("C6c");
  }
}

await dumpAt("C7");
// C6d Shaft door (citadel 6,8) — SHAFT=1 opens it before Sever so the floor does not notice the dark
if (SHAFT) {
  await walk(page, 6, 7);
  s = await S(page);
  // Tap / bump the locked door tile the same way Act II opens a shut cellar cut.
  const howDoor = await tapAt(6, 8);
  s = await settle();
  if (!s.dlg) {
    await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 20; i++) { s = await S(page); if (s.dlg) break; await page.waitForTimeout(80); }
  }
  step(/shaft-door/.test(s.dlg || ""), `C6d shaft door talk opens (${howDoor}; dlg ${s.dlg}; at ${s.x},${s.y})`);
  if (/shaft-door/.test(s.dlg || "")) {
    // Prefer the engineering hinge (Recommended file tags Engineering ~55 vs DC 52).
    // A failed check starts the sentry; resolving that fight advances RNG so the next door attempt can pass.
    let opened = false;
    for (let attempt = 0; attempt < 8 && !opened; attempt++) {
      if (!(await S(page)).dlg) {
        // Dismiss rule: same tile + same convo will not re-open until Silas steps away (logic clears dismissAt on move).
        await walk(page, 10, 10).catch(() => {});
        await walk(page, 7, 7).catch(() => {});
        await tapAt(6, 8);
        s = await settle();
        if (!s.dlg) { await page.keyboard.press("ArrowLeft"); for (let i = 0; i < 15; i++) { s = await S(page); if (s.dlg) break; await page.waitForTimeout(80); } }
        if (!s.dlg) {
          // Bump the shut door tile with an arrow from an orthogonal neighbour (Act II cellar pattern).
          await walk(page, 6, 9).catch(() => {});
          await page.keyboard.press("ArrowUp");
          for (let i = 0; i < 15; i++) { s = await S(page); if (s.dlg) break; await page.waitForTimeout(80); }
        }
      }
      s = await S(page);
      if (s.combat) {
        const g = await guardFight();
        console.log(`   shaft attempt ${attempt + 1}: in combat before door (${g.how})`);
        await closeTalk(page);
        continue;
      }
      if (!s.dlg) { console.log(`   shaft attempt ${attempt + 1}: no dlg`); break; }
      const doorRs = await replies(page);
      const eng = doorRs.findIndex((x) => /hinge is tired|Persuade the metal/i.test(x));
      const pickLock = doorRs.findIndex((x) => /Pick it like any other/i.test(x));
      const mara = doorRs.findIndex((x) => /Mara's service cadence/i.test(x));
      const i = eng >= 0 ? eng : mara >= 0 ? mara : pickLock;
      if (i < 0) { console.log("   shaft replies:", doorRs); await closeTalk(page); break; }
      console.log(`   shaft attempt ${attempt + 1}: ${doorRs[i]}`);
      await page.locator(".ledger li button").nth(i).click();
      await page.waitForTimeout(300);
      s = await S(page);
      if (s.flags.shaftOpen) { opened = true; break; }
      if (s.dlg === "shaft-door/force" || /force/.test(s.dlg || "")) {
        const fr = await replies(page);
        if (fr.length) await page.locator(".ledger li button").first().click();
        await page.waitForTimeout(200);
      }
      s = await S(page);
      if (s.combat) {
        const g = await guardFight();
        console.log(`   shaft fail → sentry (${g.how}; deaths ${g.deaths}; rounds ${g.rounds})`);
        await closeTalk(page);
        // Sentry may be dead/stood-down; door can still be opened on a later pass.
        continue;
      }
      await closeTalk(page);
    }
    s = await S(page);
    const sent = await actorAt("sentry");
    step(s.flags.shaftOpen === true, `C6e shaftOpen after door check (shaftOpen ${s.flags.shaftOpen}; sentry alive ${sent?.alive}; hostile ${sent?.hostile}; log ${s.log[0]})`);
  }
  await noCombat("C6f");
}
// C7 Crucible: prefer Splice toward the Sinks (no fight), else Seize, else Sever
let fate = null;
if (exposed) {
  // The ceremony already answered the crucible; the machine refuses a second answer.
  r = await auditAt("crucible");
  step(r.ok, `C7 Audit Crucible core opens after the ceremony (${r.how})`);
  await useSpecial(/Splice toward the Sinks/i);
  s = await S(page);
  step(s.flags.citadelFate === "expose" && /already been answered/.test(s.log[0] ?? ""), `C7e crucible refuses a second answer after the ceremony (fate ${s.flags.citadelFate}; log ${s.log[0]})`);
  fate = s.flags.citadelFate;
  if ((await S(page)).panel === "audit") await key(page, "Escape");
}
if (!exposed) {
r = await auditAt("crucible");
step(r.ok, `C7 Audit Crucible core opens (${r.how})`);
await shot(page, `${tag}-08-crucible-audit`);
const specials = await page.$$eval("button", (bs) => bs.map((b) => b.innerText.replace(/\s+/g, " ")).filter((x) => /Sever|Splice|Seize|rank answer/.test(x)));
console.log("   crucible specials:", specials);
// Seize needs comprehension 8 (or Continuity, which only the Sovereign fight after the Citadel grants).
console.log("   at the crucible:", JSON.stringify(await page.evaluate(() => { const d = window.__mend.getState().data; return { level: d.level, xp: d.xp, mind: d.player.attrs.mind, audit: d.player.skills.audit, comp: 1 + Math.floor(d.player.attrs.mind / 3) + Math.floor(d.player.skills.audit / 40) + (d.level - 1), continuity: d.disciplines.includes("continuity"), skillPoints: d.skillPoints }; })));
const compNow = () => page.evaluate(() => { const d = window.__mend.getState().data; return { level: d.level, mind: d.player.attrs.mind, audit: d.player.skills.audit, comp: 1 + Math.floor(d.player.attrs.mind / 3) + Math.floor(d.player.skills.audit / 40) + (d.level - 1), pts: d.skillPoints, continuity: d.disciplines.includes("continuity") }; });
if (CRUCIBLE === "seize") {
  await key(page, "Escape");
  const c0 = await compNow();
  let clicks = 0;
  if (c0.comp < 8 && c0.pts > 0) {
    await hud(page, "Self");
    const plus = page.getByRole("button", { name: "Improve Audit" });
    for (let i = 0; i < 30 && (await compNow()).comp < 8 && (await plus.isEnabled().catch(() => false)); i++) { await plus.click(); clicks++; await page.waitForTimeout(40); }
    await key(page, "Escape");
  }
  const c1 = await compNow();
  step(c1.comp >= 8 || c1.continuity, `C7z comprehension 8 on the sheet before the crucible (level ${c1.level}; mind ${c1.mind}; audit ${c0.audit}→${c1.audit}; comp ${c0.comp}→${c1.comp}; points ${c0.pts}→${c1.pts}; clicks ${clicks})`);
  await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
  await auditAt("crucible");
  const hp0 = (await S(page)).hp;
  await useSpecial(/Seize the rank engine/i);
  s = await S(page);
  fate = s.flags.citadelFate ?? null;
  step(fate === "seize" && !s.combat && s.flags.spireOpen === true && s.hp === hp0 && !/handwriting this small/.test(s.log.join(" ")), `C7q Seize the rank engine (fate ${fate}; hp ${hp0}→${s.hp}; spireOpen ${s.flags.spireOpen}; log ${s.log.slice(0, 2).join(" / ")})`);
  await shot(page, `${tag}-08q-seize`);
} else if (CRUCIBLE === "sever") {
  // Sever with shaftOpen unset: "The floor notices the dark." → Guard Senn + Guard Oll.
  // Sever with shaftOpen: no guard fight; Spire opens quietly.
  const shaft = (await S(page)).flags.shaftOpen;
  // A player files the ledger before an answer that wakes the floor.
  await key(page, "Escape");
  await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
  await auditAt("crucible");
  await useSpecial(/Sever the siphon/i);
  s = await S(page);
  fate = s.flags.citadelFate ?? null;
  const roster = await foes();
  if (shaft) {
    step(fate === "sever" && !s.combat && s.flags.spireOpen === true && !/floor notices the dark/.test(s.log.join(" | ")), `C7s Sever the siphon with shaftOpen → no guard fight (shaftOpen ${shaft}; fate ${fate}; combat ${s.combat}; spireOpen ${s.flags.spireOpen}; log ${s.log.slice(0, 2).join(" / ")})`);
    await shot(page, `${tag}-08s-sever-shaft`);
  } else {
    step(fate === "sever" && s.combat && roster.length === 2 && /floor notices the dark/.test(s.log.join(" | ")), `C7s Sever the siphon → guard fight (shaftOpen ${shaft}; fate ${fate}; combat ${s.combat}; foes ${roster.map((f) => f.id).join(",")})`);
    await shot(page, `${tag}-08s-sever-fight`);
    const g = await guardFight(async () => {
      // The last ledger is mid-fight; slot 1 was filed at the crucible. Load it and answer again.
      await hud(page, "Menu");
      await page.getByRole("button", { name: /^slot1 ·/ }).first().click();
      await page.waitForTimeout(400);
      if ((await S(page)).panel !== "none") await key(page, "Escape");
      await auditAt("crucible");
      await useSpecial(/Sever the siphon/i);
    });
    s = await S(page);
    step(g.won && !s.combat && s.phase === "play", `C7t guard fight resolved (${g.how}; rounds ${g.rounds}; deaths ${g.deaths}; slot loads ${g.loads}; strain ${s.flags.strain ?? "field"}; cuts ${g.cuts}; hp ${s.hp}; ${g.notes.slice(0, 4).join(" / ")})`);
  }
} else {
  for (const re of [/Splice toward the Sinks/i, /Seize the rank engine/i]) {
    for (let tries = 0; tries < 3 && !fate; tries++) {
      if ((await S(page)).panel !== "audit") { await auditAt("crucible"); }
      await useSpecial(re);
      fate = (await S(page)).flags.citadelFate ?? null;
      if (!fate) console.log("   crucible:", (await S(page)).log[0]);
    }
    if (fate) break;
  }
}
}
s = await S(page);
step(Boolean(fate) && s.flags.spireOpen === true && !s.combat, `C7b crucible answered (citadelFate ${fate}; spireOpen ${s.flags.spireOpen}; combat ${s.combat}; log ${s.log.slice(0, 2).join(" / ")})`);
if ((await S(page)).panel === "audit") await key(page, "Escape");
await fileLevel(page);

// C8 Vane after the answer
t = await talkTo("vane");
const vaneAfter = await replies(page);
if (exposed) {
  step(/vane/.test(t.s.dlg || ""), `C8 Vane after the ceremony (${vaneAfter.join(" / ")})`);
} else {
  step(/vane/.test(t.s.dlg || "") && vaneAfter.some((x) => /already touched it/.test(x)), `C8 Vane after the crucible (${vaneAfter.join(" / ")})`);
}
// C8b Once the crucible is answered (machine or ceremony), the ceremony must not be offered again:
// a second horns/history roll would overwrite citadelFate, or a failed one would set the guards on a settled floor.
if (vaneAfter.some((x) => /look at the engine/.test(x))) {
  await pick(page, /look at the engine/);
  await pick(page, /ceremony, with your pins/);
  const again = await replies(page);
  step(!again.some((x) => /horns|History, then/.test(x)), `C8b no second ceremony check after citadelFate ${(await S(page)).flags.citadelFate} (${again.join(" / ")})`);
  await closeTalk(page);
  t = await talkTo("vane");
}
const vaneAfter2 = await replies(page);
if (vaneAfter2.some((x) => /already touched it/.test(x))) { await pick(page, /already touched it/); await page.locator(".ledger li button").first().click().catch(() => {}); }
await closeTalk(page);
s = await S(page);
step(s.flags.spireOpen === true && s.flags.citadelFate === fate, `C8c citadelFate unchanged after Vane (${s.flags.citadelFate}; was ${fate}; spireOpen ${s.flags.spireOpen})`);

// C9 Map lists the late regions; Save/Continue in the Citadel
await hud(page, "Map");
const mapTxt = await page.evaluate(() => document.body.innerText);
step(/Brass Tundra/i.test(mapTxt) && /High Citadel/i.test(mapTxt) && /Void Spire/i.test(mapTxt), "C9 Map lists Tundra, Citadel, Spire");
await key(page, "Escape");
await saveContinue("C10", ["citadelFate", "spireOpen", "bufferCharged", "seenCitadel", "citadelOpen", "tundraWalked"]);
await shot(page, `${tag}-09-citadel-continued`);
// C10 hand save: Citadel answered, saved and continued, standing before the walk down (no fight, no panel).
await dumpAt("C10");

await fileLevel(page);
// C10p (H15) From the continued Citadel spot the Tundra stair is off the 440px frame. Its brass diamond + tag must
// still be on the canvas (edge pin pointing the way), and a tap on that tag walks Silas down to the stair on foot.
const pinProbe = () => page.evaluate(async () => {
  const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/components/mend/stage.ts"));
  const st = await import(url);
  const d = window.__mend.getState().data;
  const c = document.querySelector("canvas").getBoundingClientRect();
  const p = st.projectTile(c.width, c.height, d.player.x, d.player.y, 33, 18, 1, 64, 32);
  const seen = st.mouthPresence(p.sx, p.sy);
  // The same tag list the draw and the tap use (mouthTags), not a re-derivation.
  const stair = { x: 33, y: 18, label: "Tundra stair" };
  const pin = st.mouthTags([stair], d.player.x, d.player.y, (x, y) => st.projectTile(c.width, c.height, d.player.x, d.player.y, x, y, 1, 64, 32)).find((t) => t.pinned);
  return { l: c.left, t: c.top, w: c.width, h: c.height, seen, pin: pin && { sx: pin.sx, sy: pin.sy, label: pin.label }, at: `${d.player.x},${d.player.y}` };
});
{
  const pp = await pinProbe();
  const onCanvas = pp.pin ? pp.pin.sx > 0 && pp.pin.sx < pp.w && pp.pin.sy > 0 && pp.pin.sy + 19 < pp.h : pp.seen > 0.5;
  step(onCanvas, `C10p Tundra stair marked from ${pp.at} (own diamond seen ${pp.seen.toFixed(2)}; edge pin ${pp.pin ? `${pp.pin.label} at ${Math.round(pp.pin.sx)},${Math.round(pp.pin.sy)}` : "none"} on ${Math.round(pp.w)}x${Math.round(pp.h)})`);
  if (pp.pin) {
    await page.mouse.click(pp.l + pp.pin.sx, pp.t + pp.pin.sy + 11);
    for (let i = 0; i < 200; i++) { s = await S(page); if (s.map !== "citadel" || s.combat || s.dlg || (!s.path && i > 3)) break; await page.waitForTimeout(100); }
    step(s.map === "tundra" && !s.combat, `C10q tap the pinned "Tundra stair" tag → walks down and takes the stair on foot (${s.map} ${s.x},${s.y}; combat ${s.combat}; dlg ${s.dlg})`);
  }
}

// —— Back down: Tundra stair → tundra → Stack mouth → road → Spire mouth ——
s = await S(page);
if (s.map === "citadel") {
  await walk(page, 32, 18);
  s = await mouthStep("citadel", "ArrowRight");
}
step(s.map === "tundra" && !s.combat && s.panel === "none", `C11 Tundra stair → Brass Tundra (${s.map} ${s.x},${s.y}; combat ${s.combat})`);
await walk(page, 3, 5);
s = await mouthStep("tundra", "ArrowLeft");
step(s.map === "road" && s.panel === "none", `C12 Tundra Stack mouth → Stack Road (${s.map} ${s.x},${s.y}; dlg ${s.dlg})`);

await walk(page, 28, 14);
s = await S(page);
if (s.combat && (CRUCIBLE === "sever" || LAMP === "break" || (await S(page)).flags.roadDark)) {
  // Severing the siphon or Break the glass darkens the road lamps (roadDark): the Lamp shade at (30,12) watches the Spire mouth.
  const roster = (await foes()).map((f) => f.id).join(",");
  const g = await guardFight();
  await closeTalk(page);
  s = await S(page);
  step(g.won && /shade/.test(roster), `V0s dark road: Lamp shade fight resolved (foes ${roster}; ${g.how}; rounds ${g.rounds}; deaths ${g.deaths}; hp ${s.hp}; shade hostile ${(await actorAt("shade")).hostile})`);
  await walk(page, 28, 14);
  s = await S(page);
  step(!s.combat, `V0t walk on past the stood-down shade, no re-engagement (combat ${s.combat}; ${s.log[0]})`);
}
step(s.x === 28 && s.y === 14 && !s.combat, `V0 walk the road to beside Spire mouth (${s.x},${s.y}; combat ${s.combat}; dlg ${s.dlg})`);
s = await mouthStep("road", "ArrowDown");
const vArrive = /You arrive at The Void Spire/.test(s.log.join(" | "));
step(s.map === "spire" && vArrive && s.panel === "none", `V1 Spire mouth → The Void Spire (${s.map} ${s.x},${s.y}; arrive ${vArrive}; panel ${s.panel}; log ${s.log.slice(0, 3).join(" / ")})`);
if (CINDER) {
  const moth = await page.evaluate(() => { const c = window.__mend.getState().data.actors.cinder; return c && { companion: c.companion, map: c.mapId, alive: c.alive }; });
  step(s.flags.cinderSpireOk === true && moth?.companion === true && moth?.map === "spire" && cinderBeats.some((b) => /^cinder-spire@road→true/.test(b)), `V1c Cinder waited at the Spire mouth and came in (cinderSpireOk ${s.flags.cinderSpireOk}; companion ${moth?.companion}; map ${moth?.map}; beats ${cinderBeats.join(",") || "none"})`);
}
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
await dumpAt("V3");

let endingWant = (SPIRE === "decline" || SPIRE === "fight-leave") ? "release" : "impose";
if (SPIRE === "fight" || SPIRE === "fight-leave") {
  // Optional fight: arm Strain story (existing Menu setting) before engaging — level-3 critical-path is underpowered on field.
  await strainStory();
  // Re-save slot 1 so mid-fight loads keep story strain.
  await hud(page, "Menu"); await page.getByRole("button", { name: /Save slot 1/ }).click(); await page.waitForTimeout(200); await key(page, "Escape");
  // V5 Back to the Sovereign with the Talk key (bump after "I'll circle" is dismissed on this tile).
  let sovFight = await sovereignFight();
  s = await S(page);
  step(sovFight.down && s.dlg === "sovereign-down/start", `V5 Sovereign + Echo fight → sovereign-down (rounds ${sovFight.rounds}; deaths ${sovFight.deaths}; slot loads ${sovFight.loads}; strikes ${sovFight.strikes}; strain ${s.flags.strain ?? "field"}; dlg ${s.dlg}; ${sovFight.notes.slice(-2).join(" / ")})`);
  step(sovFight.continuity && sovFight.pinBtn, `V5b Continuity opened by the fight; Audit on the Sovereign offers Pin seam (continuity ${sovFight.continuity}; audit ${sovFight.auditId}; pin ${sovFight.pinBtn})`);
  step(faultSeen.clipped.length === 0, `V5c H14 fault and intent lines under HP wrap, none cut off (rows sampled ${faultSeen.rows}; clipped ${faultSeen.clipped.length}; ${[...faultSeen.texts].slice(-3).join(" | ") || "none shown"})`);
  step(chipSeen.names.size > 1 && chipSeen.clipped.size === 0, `V5d turn-order names read whole, none truncated (${[...chipSeen.names].join(", ")}; clipped ${[...chipSeen.clipped].join(", ") || "none"})`);
  await shot(page, `${tag}-11f-sovereign-down`);
  const downRs = await replies(page);
  step(downRs.some((x) => /Write the shape/.test(x)) && downRs.some((x) => /Leave the holes/.test(x)), `V6 sovereign-down offers Write the shape / Leave the holes (${downRs.join(" / ")})`);
  if (SPIRE === "fight-leave") {
    if (downRs.some((x) => /Leave the holes/.test(x))) await pick(page, /Leave the holes/);
  } else {
    if (downRs.some((x) => /Write the shape/.test(x))) await pick(page, /Write the shape/);
  }
  await page.waitForTimeout(400);
} else {
  // V4 Unissued baseline → Read what is holding → Leave the holes / Issue a baseline → epilogue
  r = await auditAt("spireheart");
  s = await S(page);
  step(r.ok && !s.combat, `V4 walk to Unissued baseline and Audit (${r.how}; at ${s.x},${s.y}; combat ${s.combat})`);
  await shot(page, `${tag}-11-heart-audit`);
  const readHeart = await useSpecial(/Read what is holding/i);
  s = await S(page);
  step(readHeart && /What is being held/.test(s.log[0] ?? ""), `V4b Read what is holding (${(s.log[0] ?? "").slice(0, 120)})`);
  if ((await S(page)).panel !== "audit") await auditAt("spireheart");
  await useSpecial(SPIRE === "impose" ? /Issue a baseline/i : /Leave the holes/i);
  await page.waitForTimeout(400);
}
s = await S(page);
const epiTxt = await page.evaluate(() => document.body.innerText);
const endLabel = endingWant === "impose" ? /Baseline imposed/i : /Baseline refused/i;
step(s.phase === "epilogue" && s.flags.ending === endingWant && /The ledger closes/.test(epiTxt) && endLabel.test(epiTxt), `E1 epilogue screen (phase ${s.phase}; ending ${s.flags.ending}; want ${endingWant}; label ${endLabel.test(epiTxt)})`);
await shot(page, `${tag}-12-epilogue`);
const epiLines = await page.evaluate(() => window.__mend.getState().data.epilogue ?? []);
if (endingWant === "impose") step(/You wrote the shape/.test(epiLines[0] ?? ""), `E1b impose epilogue opens with the written shape (${(epiLines[0] ?? "").slice(0, 80)})`);
if (SPIRE === "fight-leave") step(/holes|refused|left|baseline/i.test(epiLines.join(" ")), `E1b-leave fight→Leave the holes epilogue (${(epiLines[0] ?? "").slice(0, 100)})`);
if (CRUCIBLE === "seize") step(epiLines.some((l) => /You are the standard now/.test(l)), `E1q epilogue remembers the seized rank engine`);
if (CRUCIBLE === "sever") step(epiLines.some((l) => /sever|siphon|dark/i.test(l)), `E1c epilogue remembers the severed siphon`);
if (exposed) step(epiLines.some((l) => /ceremony heard the diagram/.test(l)), `E1f epilogue remembers the ceremony (expose)`);
if (TUNDRA === "cut") step(epiLines.some((l) => /glaze was cut|hollow went cold|harder bill/i.test(l)), `E1d epilogue remembers iceCut`);
if (LAMP === "break") step(true, `E1e lamp-break path reached epilogue`);
if (KAEL !== "0") step(KAEL_FATE === "dead" ? epiLines.some((l) => /Kael's death as a fall of stone/.test(l)) && !epiLines.some((l) => /Kael lives/.test(l)) : epiLines.some((l) => /Kael lives/.test(l)), `E1k epilogue remembers Kael ${KAEL_FATE}`);
step(epiLines.length >= 3, `E2 epilogue carries the ledger (${epiLines.length} lines): ${epiLines.slice(0, 3).join(" | ").slice(0, 240)}`);
if (s.phase === "epilogue") {
  await page.getByRole("button", { name: "Return to the title" }).click();
  await page.waitForTimeout(300);
  const titleTxt = await page.evaluate(() => document.body.innerText);
  step(/New ledger/.test(titleTxt), "E3 Return to the title");
} else {
  step(false, `E3 skipped — not on epilogue (phase ${s.phase})`);
}

step(errors.length === 0, `Z0 no page/console errors (${errors.length}) ${errors.slice(0, 3).join(" | ")}`);
await browser.close();
writeFileSync(`${SHOTS}/${tag}.txt`, out.join("\n") + "\n");
const failed = out.filter((x) => x.startsWith("FAIL"));
console.log(`\n${out.length - failed.length}/${out.length} PASS`);
process.exit(failed.length ? 1 : 0);
