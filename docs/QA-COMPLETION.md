# MEND (public `mend`) — QA completion note

**Status:** **COMPLETE — PLAYTEST VERIFIED** (first-act loop). **IN PROGRESS** for beyond-Oakhaven (latest pass 2026-10-22 ~1:27–2:00 AM ET: Kael kill ending, Cinder leave/return, and Seize now harness-played to the epilogue — see the last section): Act II–VI critical paths and side branches (incl. Vane ceremony, Sarn toll/stores via `NETWORK=varr`, Sovereign fight→Leave, Sever/impose, iceCut, lamp cut) are harness-played in headless Chromium; see sections below. Hand re-play on `c82cd73` (live browser, real taps, no Map jumps) passed the first-act loop. On this tip the headless SEED=4 Act I loop, Act II, Act III, and Act IV harnesses all pass.
Scope of the first-act verdict: New ledger → Sinks → pump → Moll → Stack Road → Ward stair → Oakhaven → Save/Continue. Act III Quarry + Rust and the Act IV–VI critical path are harness-played (see "Beyond Oakhaven — Act III" and "Beyond Oakhaven — Acts IV–VI").
**Branch:** `fix/mend-playtest-rc`
**Base:** `main` @ `8cfbd1e`
**Date:** 2026-10-15, about 1:30–2:00 AM ET (first pass); hand playtest 1 and its fixes about 2:20–2:45 AM ET; hand re-play + Stack Road camera about 2:50–3:10 AM ET; look-ahead / Ward fade / Brick soft about 3:30–3:50 AM ET; pan lock + LogChip remount about 4:00–4:20 AM ET; hand re-playtest 6 (COMPLETE) on `c82cd73` about 4:20–4:35 AM ET
**Runtime:** Node 22.12.0 (`.nvmrc`), Chromium (system Google Chrome) through Playwright 1.63, `npm run dev` on `:8080`, plus a production `npm run build` and `npm run preview` on `:4180`

## Scope

This pass is the first one for the public `mend` export. It is a separate codebase from `mendthegame`, which has its own record.
The goal is a fully playable, polished, stable RC of the first-act loop.
Identity stays the same: Silas Vance, Oakhaven, a maintenance mage who mends relationships.
No new systems, operators, or content. The only fixes are bugs found by playing.

## How it was played

`scripts/playtest-loop.mjs` drives the real dev build in headless Chromium:

- It clicks the real title, create, dialogue, HUD, Menu, and Save/Load buttons in the DOM.
- It presses real arrow keys and Esc.
- For walking to a named tile, it uses the dev-only store handle `window.__mend.clickTile(x, y)`. That is the same call a canvas tap makes.
- Separately, real canvas taps were checked. A tap moved Silas, and a tap on Tobin opened his talk.
- `SEED=n` pins `Math.random` in the page so a run can be replayed.

```bash
npm run dev    # terminal 1
SEED=4 CHROME_PATH=/usr/bin/google-chrome SHOTS=/tmp/mend-shots node scripts/playtest-loop.mjs   # terminal 2
```

## Bugs found by play and fixed on this branch

| # | Found in play | Fix | Regression test |
| --- | --- | --- | --- |
| 1 | Right after Tobin says "I'll audit it.", pressing **Audit** from the shop walked Silas past the pump to the south plate. Moll's guard line fired at (14,12), not the pump audit. Cause: Audit picked the "nearest broken machine" by straight-line distance, and the plate bar and yard are closer as the crow flies. | `auditNearest` ranks machines by walk length. It never picks a machine whose route crosses the unanswered checkpoint (`crossesCheckpoint`). Ported in spirit from the proven `mendthegame` fix and re-verified here. | `playtest.test.ts`: "Audit from the shop walks to the pump…" |
| 2 | Clicking the **Stack mouth** from the tile next to it, or pressing an arrow key onto it, opened the **Map** panel instead of leaving the Sinks. `depart()` reads the player's own tile, and Silas was not standing on the mouth yet. The same happened at the Ward stair. | `clickTile` departs only when Silas is standing on the mouth. A click on an adjacent mouth now walks onto it, and `step()` departs as usual. | "clicking or arrowing onto an adjacent mouth…" |
| 3 | After the pump was mended, the header pin still read **THE BROKEN PUMP**, all the way to Oakhaven. A closed job never released `d.pinned`. | `journal()` clears the pin when the job it names closes. `focusLine` also ignores a pin whose job is already closed, so older saves read correctly. After a flood the header still says "The broken pump", which is correct because the pump is still broken. | "the header pin lets go…" |
| 4 | **Esc** did nothing in a conversation. For example, Tobin's after-talk could only be left by clicking "Back to the iron." | Esc takes a reply only when it is a plain leave line: `end`, with no check, no effects, no goto, and no jump (`leaveIndex`). Real choices stay on the board. Moll's checkpoint choice is not dismissed. | "Esc leaves a talk only through a plain leave line…" |
| 5 | A failed mend logged a bare roll, "(63)", while other checks log "(41 vs 59)". | The log now reads "(rolled vs chance)". | covered by play |

## Hand playtest 1 (2026-10-15, real browser, real taps) — found and fixed

Played by hand on 6387550 in a desktop Chrome window (the game column is 440 px wide by design; the world frame was a short strip under the header with the HUD below).
The first act went fine through Moll's Engineering talk-past. Then Silas was stuck south of the checkpoint in The Sinks.
Evidence: `/tmp/mend-hand-shots/07-south-of-plate-no-mouth-visible.png`, `08-stuck-bottom-edge-final.png`.

| # | Found by hand | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 6 | **HIGH — camera stuck.** South of the plate the view stopped scrolling; Silas sat on the bottom edge over the foreground pipes, and the south of the map never came into view. | `layoutStage` (stage.ts) pans the painted plate with Silas but clamps it to the picture's own edge. Past that edge it moved Silas's *feet* instead, by the whole overshoot. The Sinks plate runs out just south of the checkpoint, so at (14,12) the feet were already at y≈362 in a 250 px world frame (1024×640 window), y≈454 in 323 px (1280×713): off the canvas. Reproduced in headless Chrome at both sizes. | `keepOnDeck`: feet are held inside a safe band (18–82% across, 30–62% down). The backdrop rests at its edge and the board (actors, mouths, path dots) keeps scrolling under Silas. Where the plate still has picture (the shop, the pump) nothing changes. | "the plate camera keeps Silas on the canvas…" (fails on 6387550: `feet 225,362`), "…the band only catches feet leaving the canvas"; loop step L8b checks the feet every tap |
| 7 | **HIGH — taps stopped moving Silas** (about 10 taps did nothing; no overlay). Arrow keys/WASD "did nothing" too. | Same cause. The canvas tap test only considers tiles within 9 of Silas that are on deck (`presence ≥ 0.25`, i.e. above 78% of the frame). With his feet below the frame, almost no reachable tile was on deck, so taps hit nothing; a tap that did land on a figure could send him back north. Arrow/WASD steps did move him in the store, but off-screen with a frozen backdrop, so nothing visible changed. The store's `clickTile` itself was fine after the talk-past (unit-tested). | Fixed by #6: real taps 2 tiles ahead along the route walk the plate to the mouth in 6 taps at 1024×640, 1280×713 and 440×900. On 6387550 the same script misses every tap. Arrows and `d` verified moving in the browser after the fix. WASD/arrows are intentional (Game.tsx keymap), not click-only. | "after Moll's Engineering talk-past (and filing the level), a tap toward the Stack mouth walks onto the road"; loop L8b (real canvas taps) |
| 8 | **HIGH — Stack mouth unfindable.** On the plate the mouths were a small white chevron drawn only within 4 tiles, with no name. | Plate mode skipped the brass diamond and every label. | Ported the proven `mendthegame` fix (playtest 7/7b, 34f2975): `label` on every `Mouth` in maps.ts, `usableMouths(mapId, open)`, and WorldCanvas tags each usable mouth with its name in the machine-label brass (`#d4b483`). On a plate a usable mouth is now drawn as the brass diamond at any distance, faded at the frame edge; shut doors and sealed mouths keep the near-only chevron. Labels for public mend's extra mouths follow their shut lines: Brick stair (Kiln), Yard stair (Switch), Glass stair (Pane), plus Stack mouth / Sinks mouth / Ward stair / Quarry road / Rust cut / Tundra walk / Ranking stair / Tundra stair / Spire mouth as in mendthegame. Map panel: the two brass notes mendthegame added (playtest 7 and 11) — on the Sinks once the checkpoint is answered and the road unseen, "Stack mouth is the labeled brass diamond at the far south-east…"; on the road until the ward is seen, "Ward stair is … east along this road, then north on the spur". Public mend has no Ledger `nextStep`, so that copy was not ported. | "every mouth carries a board label…" |
| 9 | Medium — **Esc did not leave Moll's checkpoint dialogue.** | Intentional on the opening line and on "No. And now I have written the attempt down": every way off them is a real choice ("Fine." and "I'll take the north streets." walk you back north; the others are checks or the fight). `leaveIndex` (bug 4) never makes a choice for the player. After the talk-past, "I'm already walking." is a plain leave line and Esc takes it. | No change to `leaveIndex`; documented. | "Moll's opening checkpoint line has no Esc leave on purpose…" |
| 10 | Low — the **level-up modal** ("Comprehension deepens") opened over the talk-past dialogue and blocked its buttons until "File it". | The XP from the check set `pendingLevel` mid-talk, and `LevelModal` rendered at once over the dialogue. | `LevelModal` waits until no talk is open. Esc files it (it is the top layer), and walk keys are held while it is up, the same as taps. | browser check (modal hidden while talking; Esc files it; arrows move after) |

## Hand re-playtest 2 (2026-10-15, ~2:50 AM ET on 51790a9) — Sinks FIXED; Stack Road still broken, fixed next

Hand re-play verified bugs 6–8: south of Moll, Silas stays in frame, taps and WASD/arrows move him, Stack mouth diamond + label come into view, Save/Continue after a Map jump PASS.
Still broken on 51790a9 (and fixed on this tip):

| # | Found by hand | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 11 | **HIGH — Stack Road camera/controls.** Walking east toward the east tower pinned Silas near the right edge; taps and WASD/arrows appeared to do nothing (or only labels "drifted"). Could not walk to the Ward stair; used Map jump to Oakhaven. | Same class as bug 6, other axis. When the plate clamp fired (`x !== rawX` or `y !== rawY`), feet became `keepOnDeck(ax + (x-rawX), …)` and pinned Silas to `DECK.right` (0.82). Iso: walking **north** (decreasing y) increases screen-x further right, so the local path and mouths project off the canvas; `presence` culls taps (`< 0.25`) and mouth labels vanish. | Once the plate is clamped on either axis, pin feet to the home aim `(ax, ay)` (already inside DECK) so the board scrolls under a centred Silas. `keepOnDeck` stays as the safety net. WorldCanvas: a labelled usable mouth answers a tap at any distance (still presence-culled); diamond draws with the same fade as its label. | "the plate camera keeps the Ward stair on deck…" (fails on 51790a9: `Silas is not pinned to the right edge (361)`); loop L9a / L9a' / L9b |
| 12 | **Ward stair findability.** Map note correct, but the player first finds "Brick stair" (16,11) — correct data, wrong direction (lower gantry). Ward stair is road (20,1). When stuck at the east edge the Ward stair never appears. An unlabelled diamond over the rails did nothing. | Consequence of #11 (mouth projected off-canvas / presence culled) plus diamond drawn without its fade/label match. | Fixed by #11. Diamond and label now share the same cull and fade. | loop L9a' asserts Ward stair on deck from 16,5; L9b walks onto it by taps + ArrowUp (no Map) |
| 13 | Low — mid-road second toast **"You arrive at The Stack Road."** | Every `commit` clones `data`, so `LogChip`'s `useEffect` saw a new `log` array reference on every step and re-raised the chip even when the text had not changed. | `LogChip` only re-raises when the log *contents* change. | loop L9c (fails on 51790a9: chip still shows the arrive line mid-road) |

Zoom (no visible effect) and dim labels left alone (low; not trivial / optional). Esc / Moll behaviour unchanged.

## Headless browser playtest results (dev build, final code)

Loop: **New ledger → Recommended file → Enter the Sinks → Tobin → Audit → pump → Moll → Stack mouth → Stack Road → Ward stair → Oakhaven Lower Ward → Talk → Save → reload → Continue → Load**

| Step | Result |
| --- | --- |
| L1 New ledger → Recommended file → Enter the Sinks | PASS |
| L2 Tobin intro → "The broken pump" job pinned | PASS |
| L3 Audit HUD from the shop walks to the pump and opens "Audit · District pump" | PASS (FAIL on `main`, bug 1) |
| L4 Mend the Seated valve | PASS. Both outcomes were seen: `mend` ("The district pump takes a true breath") and `flood`. A blind valve mend is about 28% for the recommended build. This is by design: the valve's baseline is under 45. Pell's true valve, Wren, or a Speech path are the safer answers. |
| L5 Header pin after the pump is answered | PASS. "THE PUMP HOLDS" after a mend, "THE BROKEN PUMP" after a flood (FAIL on `main`, bug 3) |
| L6 Esc closes the Audit panel | PASS |
| L7 Stepping onto the south plate raises Moll's guard line | PASS |
| L8 Moll Engineering talk-past ("Go. If Varr asks, you were steam.") | PASS (59%). A failed roll gives "North, then.", and walking back re-raises the line so you can try again. Seen up to 7 attempts. |
| L8b **Real canvas taps** walk from the plate to beside the Stack mouth; Silas's feet stay on the canvas every tap; the Stack mouth comes on deck | PASS (added after hand playtest 1; the same taps all miss on 6387550) |
| L9 ArrowRight onto the adjacent Stack mouth → The Stack Road (Act II) | PASS (FAIL on `main`, bug 2) |
| L9a Real canvas taps walk the Stack Road to beside the Brick stair (lower gantry) | PASS (added after hand re-play 2) |
| L9a' Taps back to the upper gantry, ArrowRight east; Ward stair on deck; Silas not right-edge-pinned | PASS (FAIL on 51790a9) |
| L9b Real canvas taps walk east and north to beside the Ward stair; ArrowUp onto it (no Map) | PASS (FAIL on 51790a9) |
| L9c Arrival toast does not come back mid-road | PASS (FAIL on 51790a9) |
| L9c' After closing mid-road Lark talk, arrive toast stays down | PASS |
| L10 ArrowUp onto the Ward stair at road (20,1) → Oakhaven Lower Ward | PASS |
| L11 Talk in the ward (Sela, or Pip after a clean mend) | PASS |
| L12 Leave the conversation | PASS |
| L13 Menu → Save slot 1 ("Ledger filed (slot1).") | PASS |
| L14 Reload → Continue is enabled | PASS |
| L15 Continue resumes the same ward tile, pump fate, and checkpoint state | PASS |
| L16 Menu → load slot 1 | PASS |
| L17 No page errors or console errors | PASS |

The full 17/17 loop passed on seeds 4, 7, 11, 12, and 13, and on unseeded runs (including a clean-mend run).
On seeds 1, 3, and 9 it passed once the retry budget for Moll's roll was raised.
After the hand-playtest-1 fixes the 18-step loop (with L8b) passed on seeds 4, 7, 11 at 440×900 and seeds 4, 12 at 1280×713 (`VW=1280 VH=713`).
After the Stack Road camera fix the 21-step loop (L9a/L9a'/L9b/L9c) passed on seeds 4 and 7 at both 440×900 and 1280×713.
After the look-ahead / Ward-fade / Brick-soft fix the same 21-step loop passed on seed 4 (feet at 0.32w on L9a'; Ward at 345/440, not rim-clipped).
After the pan-align + LogChip remount fix the loop (with L9c') passed on seed 4 (plate pan 5→9 Δ=-102; feet at 0.40w; Ward on deck; toast stayed down after in-place Lark leave).
`SEED` is only a partial replay: the canvas also draws from `Math.random` every frame, so one seed-4 run met twelve failed Moll rolls in a row (L8 FAIL, the rest cascading). The next seed-4 run passed on attempt 1.
Esc in the browser: E1 left Tobin's after-talk (PASS). E2 kept Moll's checkpoint choice open (PASS).

### Production build smoke (`npm run build` + `npm run preview`, :4180)

P1 title renders · P2 `window.__mend` is not exposed · P3 Tobin intro · P4 Audit walks to the pump, not the guard line · P5 Esc closes the audit · P6 Map opens · P7 no page or console errors. **All PASS.**
Re-run after the hand-playtest-1 fixes (1280×713): P1, P2, P3, an arrow-key step, and P7 **PASS**.

### Combat (checkpoint fight, "Move." → "Read them.")

The mechanics were verified by play:

- Turn order runs.
- Audit walks you next to a foe and reads them. The first read in a round costs 1 AP.
- Unmend asks you to confirm.
- Cutting Hess's or Varr's **Rifle mount** darkens the rifle ("A child lost function without being cut"). The foe loses the action it had committed to, and Varr falls back to "bare hands".
- Death shows "Baseline lost". **Open the last ledger** resumes the fight ("Engagement resumes on round N. Cuts stay cut.").

A scripted fighter with the recommended build lost the three-guard fight on every seed tried (3–8). The fight is optional: the Engineering/Speech talk-past and Wren's crawl avoid it.

## Automated checks

- `npm test`: 196 (scripts) + 55 (app-data/auth) + **43** (game: 28 `pass3` + 15 `playtest`), all passing (Node 22.12) — as of the pan-align + LogChip remount fix
- After hand playtest 1, 5 `playtest` tests were added. The camera tests fail on 6387550's `stage.ts` (`440x250 at 14,12: feet 225,362 must stay on the canvas`). The talk-past→tap test passes on 6387550 too: the store's `clickTile` was never the problem, the canvas hit test and camera were.
- After hand re-play 2, 1 more `playtest` test: Ward stair on deck walking the Stack Road east/north. It fails on 51790a9 (`Silas is not pinned to the right edge (361)`).
- After hand re-play 3, 1 more `playtest` test: look-ahead feet drift (later replaced — see bugs 18–19).
- After hand re-play 5, look-ahead test replaced by plate-pan + plate↔mouth alignment; plus closing-Lark-does-not-re-arrive. Loop L9a' requires plate Δ on 5→9 east steps and Ward `sx < 0.88w`; L9c' closes mid-road talk and asserts the arrive chip stays down.
- `scripts/ts-resolve-hook.mjs` now also maps the `@/` alias, so a test can load `src/components/mend/stage.ts`.
- `npm run typecheck`: clean
- `npm run lint`: 4 errors and 7 warnings, the same as `main`. These are the pre-existing ones named in the README. No new problems.
- `npm run build`: OK. The migrate step is skipped because `DATABASE_URL` is not set.
- The new `playtest.test.ts` tests were run against `main`'s game code: 3 of the 4 behaviour tests fail there and pass on this branch.


## Hand re-playtest 3 (2026-10-15, ~3:10 AM ET on 2fc0d6f) — Stack Road feel still broken, fixed next

Hand notes on 2fc0d6f: Sinks still good; walking east on The Stack Road felt frozen (feet hard-pinned to the home aim once the square road plate clamped on X, so little/no visual motion); the Ward stair diamond sat on the right rim until close; the Brick stair on the lower gantry (16,11 → Kiln) pulled the eye off the Ward path.

| # | Found by hand | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 14 | **HIGH — Stack Road east walk feels frozen.** After 2fc0d6f pinned feet to `(ax, ay)` whenever the plate clamped, the painted backdrop rested and Silas did not drift, so walking east looked like standing still. | Hard-centre was the right fix for the DECK.right pin (bug 11) but removed the only remaining motion cue on a sparse road plate. Carrying the overshoot *onto* the leading edge (51790a9) loses the Ward stair. | `layoutStage` look-ahead: when clamped, drift feet toward the *trailing* edge by `LOOK.carry` of the overshoot, capped at `LOOK.cap` of the frame. Silas slides, the board scrolls, and the leading side (Ward / Stack mouth) opens up. `keepOnDeck` stays the safety net. | "the plate camera look-ahead drifts feet while walking east…"; loop L9a' requires `feet.fx < 0.5` |
| 15 | **Ward stair clipped at the right edge until close.** Diamond + label hard to read until near. | Hard-centre put the Ward at ~0.93w from 16,5; actor-sized `presence` margins faded it. | Look-ahead #14 pulls the Ward inward (on deck from 14,5). `mouthPresence` uses wider edge margins than actor `presence` for diamond + brass label fade. | Ward-on-deck check now also asserts `sx < 0.88w` and `mouthPresence ≥ 0.5`; loop L9a' asserts not rim-clipped |
| 16 | **Brick stair is misleading.** Lower-gantry Kiln mouth (16,11) looks like the way to Oakhaven. | Every usable mouth got a distant brass diamond + label (bug 8). Correct data, wrong first-act prominence. | `nearOnly` on the Brick stair Mouth: near chevron only (no distant brass). Map note names the upper-gantry Ward path and says the Brick stair goes to the Kiln. Mouth is not removed. | "Brick stair is near-only…"; Ward stair stays a landmark |

## Hand play friction 4 (2026-10-15, ~3:45 AM ET on 5b4c48b) — Esc on single-option leave talks

Hand notes: talking to Doss (Sinks, 24,5), or bumping a follower in a 1–3 tile corridor, opened a talk whose only reply was a leave line; Esc did nothing and the arrow keys stay locked while talking (by design), so the only way out was clicking the line.

| # | Found by hand | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 17 | **Esc did nothing on Doss's "Sleep. I won't move your weather."** (his only reply on a fresh ledger). | `leaveIndex` (bug 4) refused any leave line with effects, and this one notes `dossMet`. | `leaveIndex`: when the board holds exactly **one** visible reply and it is `end` with no check/goto/jump, Esc takes it if its effects are quiet bookkeeping only (`flag`, `log`, `journal`, `pin`, `xp`, `item`, `scrip`) — the same line a click would take. Sole lines that fight, travel (`arrive`/`goto`), spawn, recruit, or teach a discipline still return -1. With more than one reply the old plain-leave rule is unchanged (Moll's lines, bug 9, unchanged). Companion blocking and pathing untouched. | "Esc takes Doss's sole leave line…" (fails on 5b4c48b: `expected 0, actual -1`); "every follower talk on a fresh ledger has an Esc way out at its opening" |

A static sweep over every convo node at fresh-ledger flags: 79 sole leave lines with quiet effects are now Esc-able; the only sole end lines Esc still refuses are fights (`guard-line/fight`, `tobin-down/fight`, `kael-pre/fight`, `sentry/fight`, `shaft-door/force`, `vane/fail`, `enc-*/fight`), travel (`road-after/start`, `enc-trader/start`, `guard-line/back`), and Vane's discipline lines.
Not yet re-played by hand in the browser.


## Hand re-playtest 5 (2026-10-15, ~3:55 AM ET on 5b4c48b snap) — east pan desync + mid-road arrive toast

Hand path PASS to Oakhaven (Wren crawl → Stack mouth → Stack Road → Ward stair → Lower Ward; Ward readable; Brick soft). Two FAIL/regressions on the road:

| # | Found by hand | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 18 | **HIGH — east walk frozen / brass labels float.** First ~4 ArrowRight presses pan the plate; further east leaves the painted road identical while sprites and brass (Ward mid-air, Quarry/Rust over the drop) keep sliding. Silas stays on screen. | Square `road` plate at cover≈1 had ~0 X slack, so clamp fired almost immediately. Look-ahead (bug 14) then drifted feet toward the trailing edge while the plate stayed put, so `projectTile` scrolled the board under a frozen backdrop and mouths left the painted structure. | Widen road pan (`zoom` 2.4, `fx` 0.28 west bias, `ax` 0.4) so the walk toward Ward (20,1) still moves the plate; drop look-ahead and keep feet on the home aim when clamped (no independent board scroll; still not DECK.right). `mouthPresence` unchanged. | "Stack Road east walk pans the plate… markers stay plate-aligned"; loop L9a' requires plate Δ 5→9 and Ward not rim-clipped |
| 19 | **Regression — mid-road arrive toast** after closing Lark: "You arrive at The Stack Road." again. | `LogChip` only mounted when `!talking`. Closing talk remounted it with empty `seen`, so the still-current arrive line looked "fresh" and re-raised. Contents-change fix from 2fc0d6f was fine for steps; remount was the hole. | Keep `LogChip` mounted; pass `quiet={talking}` so it hides during talk without resetting `seen`. | "closing Lark mid-road does not push a second arrive…"; loop L9c + L9c' (talk then leave, chip stays down) |

## Hand re-playtest 6 (COMPLETE) (2026-10-15, ~4:20–4:35 AM ET on c82cd73)

Played by hand in a live browser on `c82cd73` (`npm run dev`, `http://localhost:8080/`), real canvas taps and keys, **no Map jumps**. The checks left open after hand re-playtest 5 all passed:

| Check | Result |
| --- | --- |
| Stack Road walking east pans the painted plate (bug 18); Silas stays about centred, not right-edge-pinned | PASS |
| No floating brass labels: mouths stay on the road picture (no Ward mid-air / Quarry-over-void) | PASS |
| Arrive toast "You arrive at The Stack Road." shows once on enter and stays down mid-road, including after closing Lark (bugs 13, 19) | PASS |
| Ward stair walk-enter → Oakhaven Lower Ward (also left via the Stack mouth and walked back onto the Ward stair by tap) | PASS |
| Talk in the ward (Sela) | PASS |
| Menu → Save slot 1 → reload → Continue | PASS |

Same tip, automated: headless `SEED=4` loop 17 steps plus substeps (L8b, L9a, L9a', L9b, L9c, L9c') **PASS**; `npm test` 196 + 55 + 43 **PASS** (Node 22, `PATH=/workspace/tools/node-v22/bin:$PATH`).

Non-blocking polish leftovers from this pass were addressed in **Polish pass 1** (below), except death-reload (design call, unchanged).


## Polish pass 1 (2026-10-15)

Play tip for this round: **`a6d0ded`** (dismiss/focus/fight-reach; prior HUD/Wren-leave tip `2c9d817`, ~5:31–5:34 AM ET live recheck). Branch `fix/mend-playtest-rc`. First-act **COMPLETE — PLAYTEST VERIFIED** verdict is unchanged. Death → "Open the last ledger" mid-fight design call is unchanged.

| Finding | Root cause | Fix | Regression test |
| --- | --- | --- | --- |
| Act I vs Act II header on return to Oakhaven | Not a bug. Header subline is `MAPS[mapId].act`. Oakhaven Lower Ward and The Sinks are **Act I**; The Stack Road is **Act II**. Returning via the Ward stair correctly flips the plaque back to Act I. | None (documented). | `playtest`: "Oakhaven stays Act I and Stack Road Act II…" |
| Mouth tap target is only the brass diamond | Label is drawn below the tile centre (`sy+16` plate / `sy+26` board); pointer hit tested the tile centre diamond only, so taps on the brass name often walked a neighbour tile instead. | `hitMouthLabel` / `mouthLabelBox` in `stage.ts`; WorldCanvas takes a drawn usable mouth when the tap is on its label. Walkable neighbour tile centres win over the label when equally close (label sits on the tile south of a stair — without that gate, Stack Road east taps stole the Ward exit). Same nearOnly / presence rules as drawing. | `playtest`: "a tap on a mouth's brass label…"; headless loop L9b/L9c' |
| Combat / HUD names | Image keys need accessible names. An earlier polish painted `.hud-label` on every key; the JPGs already bake the word (Audit / Talk / Strike / Brace / End / …), so the hand check saw **two overlapping captions**. | `HUD_LABELS` still set `aria-label` (combat End → **End turn**). `HUD_ART_HAS_WORD` + `hudShowsCaption`: visible span only when the art has no word (none of the current keys). | `playtest`: "combat HUD keys expose accessible names…"; "HUD visible captions only where the art has no baked word…" |
| Menu "Close the ledger" returns to the title | Intended quit (`quit()` → `phase: "title"`), but the wording sounded like dismissing the panel. The panel **X** already closes via `closePanel`. | Renamed control to **Return to the title** (`MENU_QUIT_LABEL`), matching the epilogue. Behaviour unchanged. | `playtest`: "Menu quit label names the title return…" |
| Title **Continue** looks greyed on first page load even when auto + slot1 exist; click still works; after Menu → title it looks enabled | Two layers: (1) `hasSave` started `false` until `boot()` after paint; (2) SSR renders `disabled` with no `localStorage`, client has a save → React hydration **does not patch** the `disabled` attribute, so Continue can stay grey forever after reload. Menu quit remounted with client-only state, so it looked fine. | Seed `hasSave` via `hasStoredLedger()`; `boot()`/`quit()` share that scan; title gates `disabled={titleReady && !hasSave}` so SSR and first client paint both omit disabled, then mount+boot set the real state before paint. | `playtest`: "title Continue reads disk before paint…" |
| Wren **"Back to the iron."** click leaves the option list open; Esc closes it | `choose` was fine. Dialogue lived inside `.world-frame` (`overflow: hidden`). The leave line sat below the frame edge under the party strip (`Silas Vance` / near-face row), so real mouse hits landed on the footer, not the button. Esc has no pointer target. | Move `DialogueBox` out of the world frame onto the play column; `bottom-[10.5rem]` so it overlays the party strip above the HUD keys; party strip `pointer-events-none` while talking. | `playtest`: "Wren's Back to the iron leave closes…"; browser mouse click on :8080 |
| Fight-reach / near-face ≠ fight | Walking near Moll/Varr only fills the **near-face** strip (actors within 8 tiles) — it does **not** start a fight. Guard-line fires only when a step crosses **y &lt; 12 → y ≥ 12** in the Sinks with no crawl/act1/checkpoint yet. Tobin's opening has **no leave line** on purpose (Esc does nothing; bug 4). Recommended Engineering/Audit/Speech tags do **not** auto-pass. | Documented by-sight recipe below; store + :8080 real-key drive → combat HUD screenshot `.playtest/combat-hud.png`. | `playtest`: "checkpoint fight from a fresh ledger…"; "Recommended Engineering/Audit/Speech tags do not skip the guard-line" |
| Wren bump re-opens talk on every Down after Leave | Wren stands on the spawn's south lane. `clickTile` into her tile while adjacent always `openTalk`s — so Down right after **"Back to the iron."** reopens forever and blocks the walk south. | On Leave, set `flags.dismissAt` to `convo@x,y`. Bump/door open skips while still on that tile; cleared on the next step. Talk HUD uses `force` and still opens. | `playtest`: "immediate re-bump into Wren after Leave…" |
| Ledger sign ("A bar sits in the plate stair…") loops while walking south | Locked plate-stair door at the mid plate. Arrow Down into that door tile re-opens the narrator **"Ledger"** sign after every **"Leave it."** | Same `dismissAt` gate on locked-door open (and door intent arrival). | `playtest`: "plate-stair Ledger sign does not re-open…" |
| OS arrow keys dead after clicking a talk line / HUD; browser-dispatched keys still move | Click focused the reply/HUD `<button>`. When dialogue unmounted (or in some hosts), focus left the play surface so trusted OS key events never reached the window listener; CDP/dispatched events still did. | Play shell `tabIndex={-1}` + refocus when talk closes; `onMouseDown preventDefault` on dialogue replies and HUD keys so they do not steal focus; `preventDefault` on walk keys. | Live :8080: focus stays `DIV.relative` after Leave / Audit; ArrowDown still steps |

### Fight-reach by sight (checkpoint combat)

Fresh **New ledger** → **Recommended file** → **Enter the Sinks**:

1. Tobin: **"Then show me the pump."** → **"I'll audit it."** (only those two lines — **no leave**; Esc does nothing here by design).
2. Optional: Audit the pump, or skip. After Tobin you stand near the north shop floor; **Wren** is the soot-stained figure straight south of spawn — step **around** her (one tile east or west) rather than mashing Down into her.
3. Walk **south** toward the open metal plate where the Bureau squad stands (Captain Varr + two enforcers). Landmarks: past the glowing floor grates / yard crane area, onto the wide plate itself — **not** merely when their faces appear in the party strip (that strip lights up from several tiles away).
4. Avoid the mid-plate **barred stair** tile if a **"Ledger"** sign ("A bar sits in the plate stair…") pops — step one tile aside and keep south. The fight cue is Moll's line: **"Checkpoint. Nobody walks the south plate…"**
5. Choose **"Move."** → **"Read them."** → combat vs **Varr, Moll, Hess**. HUD shows Strike / Brace / End (art words). Screenshot: `.playtest/combat-hud.png`.
6. Do **not** take Engineering/Speech talk-past first if you want this fight (`checkpointSpoke` closes the line). Wren's crawl also bypasses it.

Rough key budget from spawn if you go east around Wren then south onto the east side of the plate: about **2 Right, then ~8–10 Down** until Moll speaks (exact count varies if you stop for Audit or bump Tobin). If faces show in the strip but no dialogue, you are still north of the plate line — keep walking south.

**Verification (automated):** `npm test` **196 + 55 + 54 PASS** (playtest +3: Wren dismiss, plate-stair dismiss, Recommended≠skip); `npm run typecheck` clean; headless `SEED=4 node scripts/playtest-loop.mjs` **PASS**; :8080 real `keydown` New ledger → … → **Move.** → **Read them.** combat HUD captured.

**Live hand re-check (2026-10-15 ~5:06–5:08 AM ET on `1167c2f` play / `1b6cbea` docs):** real mouse clicks, no Map.

| Check | Result |
| --- | --- |
| Oakhaven Lower Ward header **ACT I · C 5**; Stack Road **ACT II · C 5** | PASS |
| Tap **Stack mouth** label text in Oakhaven → The Stack Road (arrive toast once); tap **Ward stair** text → Oakhaven; plain ground near the label does not take an exit (walk under that tap not clearly seen) | PASS |
| Menu **Field notes** → **Return to the title** → title; **X** only closes panel; Continue returns to Oakhaven | PASS |
| Combat captions (Strike / Brace / End turn) | NOT checked live on that tip (no fight); re-checked after fight-reach fix — art words only, no double `.hud-label` |
| New: title Continue greyed on first load with autosave + slot1; click still works; after Menu → title looks normally enabled | FOUND → fixed on `eb7b0f9`; live ~5:17–5:21 AM ET Continue enabled after hard reload + loads Oakhaven **PASS** |

**Live hand re-check (2026-10-15 ~5:17–5:21 AM ET on play tip `eb7b0f9`):** Continue PASS; double HUD captions FOUND; Wren leave click FOUND; fight-reach steps insufficient FOUND. Fixes in the table above (`2c9d817`).

**Live hand re-check (2026-10-15 ~5:31–5:34 AM ET on play tip `2c9d817`):** HUD single captions PASS; Wren leave click 3/3 PASS; combat FAIL (never crossed plate line — near-face only; Wren re-bump + Ledger sign + OS key focus blocked the walk). Fixes in the four new table rows; combat re-verified on :8080 with real keys → `.playtest/combat-hud.png`.

## Before COMPLETE — PLAYTEST VERIFIED: record (all done on c82cd73)

1. **Human hand re-playtest of the first-act loop: DONE, PASS** (hand re-playtest 6, ~4:20–4:35 AM ET on `c82cd73`). Path: New ledger → Recommended file → Enter the Sinks → Tobin → Audit → pump → Moll → Stack mouth by tapping → The Stack Road east → **Ward stair** → Oakhaven Lower Ward → talk → Menu → Save slot 1 → reload → Continue, with no Map jump.
   - (Verified on 51790a9) South of the plate, Silas stays in the frame and every tap moves him; arrows/WASD move him too; Stack mouth diamond + label come into view.
   - (Verified by hand on c82cd73) On The Stack Road, walking east pans the painted plate; brass mouths stay on the road picture; Silas stays about centred and is not pinned to the right edge; the Ward stair walk-enter lands in Oakhaven Lower Ward.
   - (Verified by hand on c82cd73) The arrival toast shows once on enter and does not return mid-road or after closing Lark.
   - (Verified by hand on c82cd73) Talk (Sela) and Save slot 1 → reload → Continue.
   - Esc behaviour (Tobin's after-talk, Moll's "I'm already walking.", Doss's sole leave line from bug 17, and Moll's opening/"No" lines kept open) is covered by the unit tests and browser checks E1/E2. It was not called out separately in hand re-playtest 6.
2. **Death reload design call (unchanged, non-blocking):** the autosave is written on every combat commit. After a lost fight, "Open the last ledger" can drop you back into the same fight at 1–8 HP and 0–1 AP. You can quit to the title, or load a manual slot if you made one. Not changed: deciding whether to keep a pre-fight checkpoint is a design question.
3. **Beyond Oakhaven (out of scope for this verdict):** Quarry, Rust, Kiln, Switch, Pane, Tundra, Citadel, Spire, and the epilogue are covered only by the `pass3` logic tests. These areas have not been played in a browser in this pass.

## Beyond Oakhaven — Act II yards (IN PROGRESS) (2026-10-15, ~10:55–11:15 AM ET)

**Status:** **IN PROGRESS** for the beyond-Oakhaven scope. First-act **COMPLETE — PLAYTEST VERIFIED** verdict is unchanged. The three Act II yards off The Stack Road — **The Kiln**, **The Switch**, **The Pane** — were played end-to-end in a real headless browser (Playwright / Chromium against `npm run dev`, SEED=4). Quarry + Rust are covered in the Act III section below; Tundra, Citadel, Spire, and the epilogue remain unplayed in a browser. A full hand pass without the harness is still open.

**Path played (act2):** New ledger → … → Oakhaven → Brick stair → **Kiln** (Harl, flue, field-dry, Jun board, stamp, cellar, sootglass) → Yard stair → **Switch** (Hale, slick plates, yard stamp, shunt, boots, bay, waybill) → Glass stair → **Pane** (Orla, seat flue, quiet/legal sales, Fen vault, anneal lens) → Ward stair → Oakhaven → Save/reload/Continue. Real canvas taps on the road stairs; arrow keys through the three locked cuts.

**Harness:** `scripts/playtest-act2.mjs` (SEED=4). Baseline `scripts/playtest-loop.mjs` still covers Act I.

### Results (act2, tip of this note)

| Slice | Result |
| --- | --- |
| A0–A2 / K0–K19 (prior Kiln arrive + Harl + Seat flue + Save/Continue) | PASS |
| K20–K31 Kiln past the flue (dismantle → field-dry → Jun → draw/sell → license → Cress/Voss → Teb/Nim → cellar by tap+keys → Read nest / Lift glass → Continue) | PASS |
| Y0–Y8 The Switch (Yard stair taps → Hale → slick bite → license → shunt → boots → Ske give → bay by tap+keys → waybill → Continue) | PASS |
| P0–P10 The Pane (Glass stair taps → Orla → Seat flue → draw/sell → Fen give → vault by tap+keys → Read anneal / Lift lens → Stack mouth out → Ward stair → Oakhaven Continue; Map lists Kiln/Switch/Pane) | PASS |

`npm test` **196 + 55 + 58 PASS** (playtest +5: door sweep, Kiln cellar keys, door tap hit, landing sweep, landing clear). `npm run typecheck` clean.

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 20 | (prior) Kiln Audit opened on unused Borrowed heat | `openAudit` ranked any severed node worst, including optional leaves | Prefer required seams; unused severed leaves score as non-urgent | `playtest`: Kiln flue…; act2 K11b |
| 21 | **HIGH — Kiln cellar cut unreachable.** After Nim showed the give, no real input opened the door at (6,16). Plate taps walked to a neighbour; arrow keys never bumped the door. | (1) Plate hit-test skips non-standable tiles, and a shut locked door is not standable, so a tap on the door itself walked to the nearest neighbour. (2) Nim stood on (6,15), the only orthogonal approach north of the cut, so ArrowDown into the door was impossible. Same pattern: Ske on (6,12) blocked the Switch bay door (6,13). | WorldCanvas: a plate tap inside a shut locked door's tile diamond takes the door (`hitShutDoor` in stage.ts). Nim stands beside the cut at (5,15); Ske beside the bay at (5,12). | `playtest`: door sweep; Kiln cellar by ArrowDown; door tap hit; act2 K28 / Y7 / P6 |
| 22 | **HIGH — Pane Stack mouth stacked Silas on Sol.** Leaving The Pane after the melt held landed Silas on Sol at the Glass stair's road landing (27,2). | Sol's routine moved to (27,2) once `paneCharge` — the mouth's `tx,ty`. `arrive` placed the player on that tile with no clearance. | Sol stands beside the stair at (28,2). `arrive` also runs `clearLanding`: if someone is on the land tile, step Silas to the nearest free non-mouth neighbour. | `playtest`: no routine parks on a landing; arrive clears a stacked landing; act2 P8 |

### Still unplayed (browser) after Act II yards

Brass Tundra, High Citadel, Void Spire, epilogue (Quarry + Rust moved to Act III section below). Also unplayed inside the three yards: refuse / cut-stamp / jam-table / smash-glass branches, combat vs Cress/Voss/Rue/Ness, and a full hand pass without the harness. Death → "Open the last ledger" mid-fight design call unchanged.

## Beyond Oakhaven — Act III Quarry + Rust (IN PROGRESS) (2026-10-15, ~11:20 AM–12:00 PM ET)

**Status:** **IN PROGRESS** for Act III. First-act **COMPLETE — PLAYTEST VERIFIED** and Act II yards harness results are unchanged. **The Clockwork Canyon (Quarry)** and **Rust Districts** were played end-to-end in headless Chromium (`scripts/playtest-act3.mjs` SEED=4 against `npm run dev`). Tundra, Citadel, Spire, and the epilogue remain unplayed in a browser. City-network heat (`stoneMoving` → `tenementWarm`) still needs `checkpointLead=varr` (combat deed); the Engineering talk-past path clears the slab without signing the plate stair — by design.

**Path played (act3):** New ledger → … → Oakhaven → Quarry road taps → **Quarry** (Hask clear-the-stone → Rill named → Pim → Audit crane → Cut the brake clear → Save/Continue) → Stack mouth out → Rust cut taps → **Rust** (Nell → Ives → Audit hearth → Audit forge → Map lists Quarry+Rust → Save/Continue). Real canvas taps on Quarry road / Rust cut mouths; store `clickTile` for long walks.

**Harness:** `scripts/playtest-act3.mjs` (SEED=4). Baseline `scripts/playtest-loop.mjs` still covers Act I; `scripts/playtest-act2.mjs` still covers Act II yards.

### Results (act3, tip of this note)

| Slice | Result |
| --- | --- |
| A0–A2 Act I → Oakhaven (Moll Engineering talk-past) | PASS |
| Q0–Q3 Quarry road taps → Clockwork Canyon arrive + feet on canvas | PASS |
| Q4–Q6 Hask workersClear → Rill named → Pim met | PASS |
| Q7–Q8 Audit crane → Cut the brake clear (`quarryStone=clear`, no workerHurt) | PASS |
| Q8b stoneMoving only when Varr holds the stair (Engineering path: lead unset → stoneMoving false) | PASS |
| Q9–Q11 after-clear talks → Save/Continue in Quarry → Stack mouth out | PASS |
| R1–R3 Rust cut taps → Rust Districts arrive | PASS |
| R4–R7 Nell / Ives / hearth audit / forge audit (haul cold without stoneMoving) | PASS |
| R8–R9 Map lists Quarry+Rust; Save/Continue in Rust | PASS |

`npm test` **196 + 55 + 62 PASS** (playtest +2: Act III hostile-path clearance; Audit beside crane ≠ chute). `npm run typecheck` clean. Act I loop SEED=4 **PASS**.

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 23 | **HIGH — Quarry/Rust primary path forced combat.** Entering via Quarry road and walking to Hask/Rill (or Rust mouth → Nell) started "Structural engagement" before any talk. | `rubble` (28,8, vision 3) sat on the east mouth corridor; `mill1` (22,18) sat beside Rill; `cutter1` (10,17) sat beside Nell. `checkVision` uses Chebyshev `dist`. Same class as Nim/Ske/Sol clearance. | Reposition optional hostiles off the primary routes: rubble (20,3), mill1 (10,20), cutter1 (4,19). Fights remain if you walk into them. | `playtest`: Act III primary paths stay outside hostile vision; act3 Q4–Q6 / R4 |
| 24 | **HIGH — Audit beside the Quarry crane opened the distant ore chute.** HUD Audit from (11,4) selected the severed chute `lip` instead of the adjacent crane, so Cut the brake never appeared. | `auditNearest` preferred any reachable "broken" machine over an intact machine Silas was already beside. Chute starts severed. Same class as bug 20 (wrong Audit target). | Prefer beside (and beside-broken) before remote broken/intact. | `playtest`: Audit beside the Quarry crane…; act3 Q7 |

### Still unplayed (browser)

Brass Tundra, High Citadel, Void Spire, epilogue. Also unplayed: Kael duel / RelSec fight, scarred-drop branch, Varr-held stair → stoneMoving → tenementWarm / Seat stock with live ore, refuse-stock, combat vs rubble/mill/cutter, and a full hand pass without the harness. Death → "Open the last ledger" mid-fight design call unchanged.

## Beyond Oakhaven — Acts IV–VI Tundra, Citadel, Spire, epilogue (IN PROGRESS) (2026-10-15, ~11:52 AM–12:30 PM ET)

**Status:** **IN PROGRESS.** The first-act **COMPLETE — PLAYTEST VERIFIED** verdict and the Act II / Act III harness results do not change. One critical path through Acts IV–VI was played end-to-end in headless Chromium: `scripts/playtest-act4.mjs` with SEED=4 against `npm run dev`. It runs from New ledger through **The Brass Tundra**, the **High Citadel**, and the **Void Spire** to the **epilogue** ("Leave the holes") and back to the title. Save/Continue was checked on all three maps. This was a harness play, not a hand play.

**How the late gates open (existing content, nothing invented):**
- `citadelOpen` is set by Ives in Rust. The path is "I'm looking for the people who maintain the maintainers." → "I'll speak to Mara before I decide anything about a city." (`ives/welcome`). It is also set by Kael's down lines and by Ives's `siphon` node.
- `spireOpen` is set by `finishCitadel` (crucible: Sever, Splice, or Seize), by Vane's ceremony checks (horns or history), or by Vane's "already touched it" lines.
- Mouths: road (8,15) Tundra walk needs `citadelOpen`. Tundra (26,5) Ranking stair leads to citadel (32,18). Road (28,15) Spire mouth needs `spireOpen`.

**Path played (act4):** New ledger → Moll Engineering talk-past → Stack mouth → real taps to the Rust cut → **Rust**: Ives welcome sets `citadelOpen` → Stack mouth → road west → ArrowDown onto the Tundra walk → **Tundra**: Kel → Audit Brass hollow → Read the hollow → Drift → Audit Glaze stake → Seat the span → Save/Continue → ArrowRight onto the Ranking stair → **Citadel**: Ime → Audit Infirmary buffer → Charge the cell → Audit lamp glass → up the south throat to the Frost orrery → Read the drive → Sarn → Vane (look → choice → "I'll answer on the machine itself.") → Audit Crucible core → **Splice toward the Sinks** (`citadelFate=redirect`, `spireOpen`, no fight) → Vane "already touched it" → Map lists all three regions → Save/Continue → Tundra stair → Tundra Stack mouth → road east → ArrowDown onto the Spire mouth → **Spire**: Sovereign "I'll circle" (fight declined) → Save/Continue → Audit Unissued baseline → Read what is holding → **Leave the holes** → epilogue screen → Return to the title. Long walks use the store `clickTile`, the same call a canvas tap makes. Mouths are stepped onto with real arrow keys, and machine and NPC targets are hit with real canvas taps where they are on deck.

### Results (act4, tip of this note)

| Slice | Result |
| --- | --- |
| A0–A1 Act I talk-past → Stack Road | PASS |
| B1–B4 taps to the Rust cut → Rust → Ives welcome (`citadelOpen`, `guildBriefed`) → back to the road | PASS |
| T0–T1c beside the Tundra walk (mouth on deck) → ArrowDown → Brass Tundra arrive, feet on canvas, no combat | PASS |
| T2–T5c Kel → hollow read (`hollowRead`, `hollowWarm`) → Drift (`driftMet`) → Seat the span (`iceSpan`) | PASS |
| T6 Save → reload → Continue on the Tundra | PASS |
| C0–C1b Ranking stair → High Citadel arrive (`seenCitadel`), no combat on the landing | PASS (FAIL before bug 26) |
| C2–C3 Ime → Charge the cell (`bufferCharged`) → lamp glass audit | PASS (FAIL before bug 26) |
| C4–C4b walk up the south throat → Frost orrery → Read the drive | PASS (FAIL before bug 25: no path) |
| C5–C6c Sarn → Vane look/choice → "answer on the machine", no combat | PASS (FAIL before bugs 25/26) |
| C7–C8 Crucible → Splice toward the Sinks (`citadelFate=redirect`, `spireOpen`) → Vane after | PASS |
| C9–C10 Map lists Tundra/Citadel/Spire; Save → reload → Continue in the Citadel | PASS |
| C11–C12 Tundra stair → Tundra → Stack mouth → road | PASS |
| V0–V1b road east to beside the Spire mouth → ArrowDown → Void Spire, no combat | PASS (FAIL before bug 27: landed in The Switch) |
| V2–V3 Sovereign "I'll circle" (no fight) → Save/Continue in the Spire | PASS |
| V4–E3 Unissued baseline → Read what is holding → Leave the holes → epilogue (16 lines) → title | PASS |
| Z0 page and console errors | 0 |

**57/57 PASS.** Also on this tip: `npm test` **196 + 55 + 65 PASS** (playtest +3: bugs 25, 26, 27), `npm run typecheck` clean, Act I loop SEED=4 **PASS** (0 FAIL), act2 **106/106**, act3 **47/47**.

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 25 | **HIGH — the High Citadel could not be walked into.** The Ranking stair landed Silas at (32,18). From there only the south annex could be reached: lamps, buffer, and Ime. The crucible, Vane, Sarn, and the orrery had no path ("No clear path"), so Act V could not be finished on foot. A flood fill from the landing reached 71 tiles. | `citadel()` in maps.ts opens a 3-wide throat at (22–24,15), but rows 13–14 above it were still solid rock left by `grow`. The orrery hall fill stopped at row 12. Present on `main` since the export. | `fill(wide, 22, 13, 24, 14, "p")`: the throat now joins the orrery hall. No new room or content. | `playtest`: "High Citadel: the tundra stair landing walks to the ranking floor" (fails on 29aee5b: no path to beside the crucible); act4 C4 |
| 26 | **HIGH — forced combat on the Act V primary path.** With the throat open, stepping off the landing into the annex started a fight with the Plate warden. Walking to Vane or to Sarn (who stands at (18,6) when the plate is unfed) pulled in Guard Senn and Guard Oll. | The warden at (28,19), vision 3, covered the landing corridor (25–31,18–19). The guards at (19,5) and (16,4) covered the tiles beside Vane and Sarn. Same class as bugs 21 and 23. | Optional hostiles moved off the primary routes: warden1 to (30,5), the north-east corner of the orrery hall; guard1 to (17,13) and guard2 to (12,13), the south line of the ranking floor. The scripted fights still call them by id: a failed ceremony, and sever without `shaftOpen`. | `playtest`: "High Citadel primary routes from the tundra stair stay outside hostile vision" (covers lamps, buffer, Ime, orrery, crucible, Vane, and Sarn at all three spots); act4 C1b–C6c |
| 27 | **HIGH — a long road walk departed through a mouth it was only passing over.** Walking from the Tundra walk (8,14) to beside the Spire mouth (28,14) dropped Silas into **The Switch**. The shortest route crosses the Yard stair (22,14). | `step()` called `depart()` whenever Silas stood on any exit tile, including mid-route. | `step()` departs only on the last step of a route (`arrived`). Arrowing or tapping onto a mouth still leaves, because that is a one-step route or a route that ends on the mouth. | `playtest`: "a long road walk that crosses another mouth does not depart through it" (fails on 29aee5b); act4 V0–V1 |

**Seen and left alone (low):** on a first visit the painted plate takes about 1 s to load. The very first frame of a map shows only the tile board on black; act4 shot `05-citadel-arrive`. It fills in without input. The Act I talk-past harness step is timing-sensitive to `Math.random` draws from rendering. One cold run right after a Vite dependency re-optimize failed it 12 times; every later run passed on attempt 1. This is a harness artefact, not a game bug.

### Still unplayed (browser)

- The other Act V answers:
  - **Sever**: forces the guard fight when `shaftOpen` is not set. This is by design: "The floor notices the dark."
  - **Seize**: needs comprehension 8 or Continuity.
  - Vane's **horns** (speech 58) and **history** (60) checks, and the failed-ceremony fight.
  - Shaft door and sentry, lamp glass **cut** (`roadDark`, dark-road and shade beats), and Sarn toll and stores beats with `citadelSupplied`.
- The **Sovereign fight**: "Then I'll read you while you move" → Sovereign + Echo → `sovereign-down` → Write the shape / Leave the holes.
- The **impose** ending.
- Tundra branches: cut the span (`iceCut`) and Kel's cleats.
- Cinder companion dark-mouth and Spire refusals.
- A full hand pass of Acts IV–VI without the harness.

## Beyond Oakhaven — Acts V–VI side branches: Sever, Sovereign fight, impose (IN PROGRESS) (2026-10-15, ~12:29–1:15 PM ET)

**Status:** **IN PROGRESS.** Three more Act V/VI branches were played end-to-end in headless Chromium from New ledger to the epilogue. `scripts/playtest-act4.mjs` now takes `CRUCIBLE=splice|sever` and `SPIRE=decline|impose|fight`. The default run (Splice → "I'll circle" → Leave the holes) is unchanged and still passes. These are harness plays with the same patterns as before. Real DOM buttons are used for Talk, Audit, Strike, Brace, End turn, Stand down, Pack → Use, Menu → Save/Load/Strain, seam buttons, and Unmend → Confirm unmend. Canvas taps strike a hostile on deck and walk beside it, and the store `clickTile` is used for long walks. They are not hand plays.

**How the branches are reached (existing content only):**
- **Sever:** Audit Crucible core → **Sever the siphon**. Without `shaftOpen`, this starts Guard Senn + Guard Oll ("The floor notices the dark."). The harness files slot 1 at the crucible first, as a player would. Severing also darkens the road lamps (`roadDark`), which arms the **Lamp shade** at (30,12), inside vision 4 of the Spire mouth.
- **Sovereign fight:** after "I'll circle" and a save, the Talk key re-opens `sovereign-pre` (a bump on the same tile is dismissed by design). "Then I'll read you while you move." opens Continuity and starts Sovereign + Echo. The Sovereign is brought to 0 → `sovereign-down` → **Write the shape.** → impose epilogue.
- **Impose (heart):** Unissued baseline → Read what is holding → **Issue a baseline** → "Baseline imposed" epilogue.

### Results (tip of this note)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4` default | Splice → decline → Leave the holes (regression) | **57/57 PASS** |
| `SEED=4 SPIRE=fight` | Splice → "I'll circle" → save → Talk → **Sovereign + Echo fight** → `sovereign-down` → Write the shape → **Baseline imposed** | **59/59 PASS** |
| `SEED=4 CRUCIBLE=sever SPIRE=impose` | **Sever** → guard fight → stood down → Vane "already touched it" → dark road → **Lamp shade** stood down → no re-engagement → Spire → Issue a baseline → **Baseline imposed** (epilogue remembers the siphon) | **63/63 PASS** |
| `SEED=7 CRUCIBLE=sever SPIRE=impose` | same; guards stood down on field strain, shade killed | **63/63 PASS** |
| Act I loop `SEED=4` | regression | **23 PASS / 0 FAIL** |

New steps: C7s/C7t (Sever → guard fight resolved), V0s/V0t (dark-road shade fight → walk on with no re-engagement), V5 (Sovereign fight → `sovereign-down`), V5b (Continuity opened; HUD Audit on the Sovereign opens its graph with **Pin seam**), V6 (Write the shape / Leave the holes offered), E1 (ending flag + "Baseline imposed" label), E1b (impose epilogue line), and E1c (epilogue remembers the siphon). Z0 page/console errors: 0 in all runs.

**How hard the fights were (level 3, the harness character: comprehension 6, 52/54 HP, prybar, 2 bandages):**
- **Sovereign + Echo:** the Sovereign has initiative and does about 25 damage before Silas's first turn. Store-level sweep, 10 RNG seeds per cell:

  | Strategy | Field | Story |
  | --- | --- | --- |
  | strike only | 0/10 | 0/10 |
  | strike + brace | 0/10 | 0/10 |
  | bandage under 45% + strike + brace | **2/10** | **5/10** |

  The `SPIRE=fight` browser run won on **Strain story** (Menu, an existing setting) after 11 deaths and 3 loads of slot 1. An earlier run of the same harness won on field strain after 2 deaths. It is winnable, but a level-3 critical-path character is underpowered for it. The fight is optional: declining reaches both endings.
- **Sever guard fight:** cutting both rifle mounts and then using Stand down is the working line. The guards reseat rifles. Store sweep: 3/8 wins on field strain. Browser runs: one won with 0 deaths; `SEED=4` won after 13 deaths and 6 slot loads (story strain); `SEED=7` won after 5 deaths and 2 slot loads (field strain). It is not a soft-lock, but it is punishing.
- **"Open the last ledger" inside a fight** (same design question as before, now with evidence). The auto ledger is written on every commit, so after a death it reopens the same fight on Silas's last turn, usually with **1–7 HP**. In these runs it returned to 1–3 HP up to 6 times in a row. A player with no manual save can loop there. Not changed. This needs a design call (for example, an auto ledger at engagement start).

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 28 | **HIGH — the guards could not be read in the Sever fight.** HUD Audit (or Q) reopened the **Crucible core** every turn, because Sever starts the fight with Silas standing beside it. In a fight Audit is the only way to read a foe, since a tap on a hostile strikes. | `auditNearest` checked "machine beside Silas" before "hostile in reach". | In a fight, a foe in reach wins Audit. The beside-machine fallback and the out-of-fight order (bug 24) are unchanged. | `playtest`: "in a fight, Audit reads the foe in reach, not the machine… (bugs 28–29)" (fails on 390085c); act4 C7t |
| 29 | **MED — Strike/Audit spent turns on someone outside the fight.** During the guard fight, Strike and Audit went to **Sentry Quill**. The sentry is hostile on the map but not in the turn order, so swings at it never got an answer, and Audit kept opening its graph. | `strikeNearest` / `auditNearest` picked any hostile on the map. | New `engagedFoes()`: in a fight, prefer the engagement roster (`combat.order`), and fall back to map hostiles only if the roster has none. | same test |
| 30 | **HIGH — the Lamp shade on the dark road could not be stood down.** After "They step out of the engagement", the very next step started the same fight again. The Spire mouth could only be reached by killing it, and each stand-down paid out +28 XP again. | `syncShade` re-armed the shade (`hostile = roadDark`) on every reconcile and ignored its recorded fate. | A shade recorded as stood-down or escaped stays settled. | `playtest`: "a stood-down Lamp shade stays down on the dark road… (bug 30)" (fails on 390085c); act4 V0s/V0t |
| 31 | **LOW — the fight route to the impose ending left no ending flag.** `sovereign-down` → Write the shape set `d.ending`, but not `flags.ending` or the +100 XP. | The reply's effects list `epilogue` first, and `applyEffects` skips ops once the phase leaves play. | The `epilogue` op also records `flags.ending`, the same as the Spire heart special. No content change. | `playtest`: "the Sovereign's down choice records the ending… (bug 31)"; act4 E1 on `SPIRE=fight` |

Also on this tip: `npm test` **196 + 55 + 68 PASS** (playtest +3), `npm run typecheck` clean.

**Not a bug (noted):** after "I'll circle", bumping the Sovereign from the same tile does not reopen the talk. That is the dismiss rule; the Talk key (force) reopens it.

### Still unplayed (browser) — superseded by the next section for items played there

- **Seize**: needs comprehension 8 or Continuity. Continuity is only opened by accepting the Sovereign fight, which comes after the Citadel, so a critical-path character needs comprehension 8 (this one has 6). See next section.
- Vane's **horns** / **history**, failed-ceremony fight, Cinder companion, Sarn toll/stores (network), hand pass — see next section.

## Beyond Oakhaven — Acts V–VI side branches: fight-leave, iceCut, lamp cut, shaftOpen Sever (IN PROGRESS) (2026-10-15, ~1:29–1:53 PM ET)

**Status:** **IN PROGRESS.** More Act V/VI side branches were played end-to-end in headless Chromium. `scripts/playtest-act4.mjs` now also takes `SPIRE=fight-leave`, `TUNDRA=cut`, `LAMP=break`, `SARN=toll`, and `SHAFT=1`. No new game bugs were found this pass (numbering stays at 31). Harness-only: shaft-door retry must step away first (dismiss rule), and the optional Sovereign fight arms Strain story before engage. These are harness plays, not hand plays.

**How the new branches are reached (existing content only):**
- **fight-leave:** same Sovereign + Echo fight as `SPIRE=fight`, then **Leave the holes** from `sovereign-down` (release epilogue).
- **iceCut + cleats:** after Read the hollow, Kel → "The hollow is warm. I need the middle of the walk." → Edge cleats; Audit Glaze stake → **Cut the span** (`iceCut`, hollow goes cold). Brass ice `!` tiles at (16–17,5) bill 2 HP (cleats in pack do not auto-equip).
- **Lamp glass cut:** Audit Road lamp glass → **Break the glass** → `roadDark` without Sever; Lamp shade on the road (bug 30 still holds).
- **Sever with `shaftOpen`:** before the crucible, open the shaft door at citadel (6,8) (engineering hinge, DC 52). Then **Sever the siphon** skips the guard fight ("The floor notices the dark." only when shaft is shut).
- **Sarn toll / stores:** on the Engineering talk-past path, live Sinks food still feeds the plate (`food-fed`), so `guardToll` stays false and `citadelSupplied` needs `stoneMoving`. Toll/stores replies are unavailable without changing the city network; recorded as played-unavailable, not a soft-lock.

### Results (tip of this note)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4` default | Splice → decline → Leave the holes (regression) | **57/57 PASS** |
| `SEED=4 SPIRE=fight-leave` | Splice → Sovereign fight → **Leave the holes** (release) | **59/59 PASS** (14 deaths / 4 slot loads on Strain story) |
| `SEED=4 TUNDRA=cut LAMP=break SARN=toll` | Kel cleats → **Cut the span** → Break the glass → shade stood down → decline epilogue (remembers iceCut) | **67/67 PASS** |
| `SEED=4 CRUCIBLE=sever SHAFT=1 SPIRE=decline` | shaft door open → **Sever with shaftOpen** (no guard fight) → shade → decline | **64/64 PASS** |
| Act I loop `SEED=4` | regression | **23 PASS / 0 FAIL** |
| Act II / Act III | regression | **106/106** / **47/47** |

Z0 page/console errors: 0 in all runs.

**Evidence kept (not changed):** mid-fight auto-ledger still returns to 1–few HP; Sovereign fight still punishing on a level-3 critical-path file (this fight-leave run needed Strain story). Design calls unchanged.

### Bugs found / fixed this pass

None in game code. Harness and regression coverage only:

| # | Note | Detail |
| --- | --- | --- |
| — | Harness | Shaft-door retry after a failed check must step away first (`dismissAt` clears on move). Same locked-door dismiss rule as Act II cellars. |
| — | Harness | `SPIRE=fight` / `fight-leave` arms Menu → Strain story before engage and re-saves slot 1. |
| — | Tests | playtest +6: fight-leave ending, iceCut billing, Kel cleats, Break the glass → roadDark, Sever±shaftOpen, shaft-door dismiss reopen. |

Also on this tip: `npm test` **196 + 55 + 74 PASS** (playtest +6), `npm run typecheck` clean.

### Still unplayed (browser)

- **Seize**: needs comprehension 8 or Continuity. Continuity opens only by accepting the Sovereign fight (after the Citadel). Critical-path Recommended file has comprehension 6 at level 3 — not attempted without cheating state.
- Vane's **horns** (speech 58) and **history** (60) checks, and the failed-ceremony fight.
- Sarn **toll** / **stores** beats (need unfed plate or `citadelSupplied` / `stoneMoving` — not on this Engineering talk-past network).
- Cinder companion dark-mouth and Spire refusals (needs scrap feed + recruit earlier).
- A design call on the mid-fight auto ledger, and on the Sovereign / Sever balance for a level-3 critical-path character.
- A full hand pass of Acts IV–VI without the harness.

## Beyond Oakhaven — Act V: Vane's ceremony (horns, history, failed), Sarn toll, Varr network attempt (IN PROGRESS) (2026-10-15, ~2:00–2:50 PM ET)

**Status:** **IN PROGRESS.** Vane's three ceremony outcomes were played end-to-end in headless Chromium from New ledger to the epilogue. `scripts/playtest-act4.mjs` now takes `VANE=machine|horns|history|fail` and `NETWORK=talk|varr`. One game bug was found (32) and fixed. These are harness plays, not hand plays.

**How the branches are reached (legitimate character only, no state edits):**
- **horns / history:** the Recommended file reaches the Citadel with **12–16 unspent skill points** (12 at New ledger, +4 a level). The harness opens **Self**, clicks **Improve Speech** (51→95, 11 points) or **Improve History** (36→84, 12 points), files slot 1, and then asks Vane → look → "ceremony, with your pins" → the check. The odds shown are speech 87% and history 74%. Both held on the first roll.
- **fail:** no points are spent. Silas takes **History** (36%, chance 26). The first roll held (≤26), so the harness loaded slot 1 and asked again, as a player would; the second roll failed (27 vs 26) → **"Then the floor will be cleaned."** → **No.** → Guard Senn + Guard Oll. The fight was resolved with cut rifles → **Stand down**. Afterwards Vane still talks, and Silas answers on the machine (Splice) → Spire → epilogue.
- **Sarn toll:** `guardToll` depends on whether Sinks food is live after Act I, and the outcome of the Act I pump varies by run. On this tip the default and Vane runs reached Sarn with **guardToll true** ("The plate is unfed." was offered). The combo run reached her with guardToll false (played-unavailable). The earlier note said toll was "never on this network"; that is corrected here.

### Results (tip of this note)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4 VANE=horns` | Speech 95 → **horns holds** (3 vs 87) → `citadelFate=expose`, `spireOpen`, Causality → crucible refuses a second answer → Vane: no second ceremony → Spire → decline → epilogue ("The ceremony heard the diagram") | **64/64 PASS** |
| `SEED=4 VANE=history` | History 84 → **history holds** → expose → same as above | **64/64 PASS** |
| `SEED=4 VANE=fail` | History 36 → **fails** → "Then the floor will be cleaned." → **No.** → guard fight → stood down (8 rounds; 25 deaths, 12 slot loads, won on Strain story) → Vane talks → answer on the machine → Splice → Spire → epilogue | **65/65 PASS** (64/65 before bug 32) |
| `SEED=4 NETWORK=varr SARN=toll` | earlier tip: checkpoint fight not won (31 deaths). **Superseded** — see next section (won + stores). | superseded |
| `SEED=4 SARN=toll` | Sarn with `guardToll` → **"The plate is unfed."** → toll line → "A missing meal, not a new law." (`sarnMet`) → no combat → Splice → decline → epilogue | **61/61 PASS** |
| `SEED=4` default | regression (now +C8b/C8c) | **59/59 PASS** |
| `SEED=4 CRUCIBLE=sever SPIRE=impose` | regression | **65/65 PASS** |
| `SEED=4 SPIRE=fight-leave` | regression | **61/61 PASS** |
| `SEED=4 TUNDRA=cut LAMP=break SARN=toll SHAFT=1 CRUCIBLE=sever` | regression; Sarn had guardToll false this run (played-unavailable) | **74/74 PASS** |
| Act II / Act III | regression | **106/106** / **47/47** |
| Act I loop `SEED=4` | regression | **23 PASS / 0 FAIL**. The first run, made while 9 browsers were running at once, failed L8 because the Moll talk-past did not land in 12 attempts. This is the known timing-sensitive harness step; the clean re-run passed on attempt 1. |

Also on this tip: `npm test` **196 + 55 + 75 PASS** (playtest +1: bug 32), `npm run typecheck` clean.

New act4 steps:
- C6v–C6z2: ceremony prep, the check, the fail node, the guard fight, and Vane after it.
- C7e: the crucible refuses a second answer after expose.
- C8b: no second ceremony check once `citadelFate` is set.
- C8c: `citadelFate` is unchanged after Vane.
- E1f: the expose epilogue line.
- A0v–A0x and Q1v–Q4v: the `NETWORK=varr` checkpoint fight and quarry detour.

Z0 page/console errors: 0 in all runs that finished.

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 32 | **MED — Vane offered the ceremony again after the crucible was answered.** `VANE=fail` → guards stood down → Splice (`redirect`) → Vane → look → the choice still listed **horns** and **history**. After a horns pass (`expose`) the same two checks came back. A pass would overwrite `citadelFate` (for example sever → expose, plus another +80 XP and rep). A fail would set the guards on a floor that was already settled. | The `vane/choice` check replies had no condition; `look` is always reachable from `vane/start`. | Both check replies now require `{ missing: "citadelFate" }`. "I'll answer on the machine itself." stays. No new lines. | `playtest`: "Vane's ceremony checks are not offered again once the crucible is answered (bug 32)" (fails on 2610970); act4 C8b on every run |

**Not a bug (harness):** two runs landed on the title partway through because files were edited while they were running, which made Vite do a full reload. The first `VANE=horns`/`history` runs were hit by the `dialogue.ts` edit, and the first `SARN=toll` run by the doc edit. All three were re-run clean.

**Evidence kept (design calls, unchanged):** the mid-fight auto ledger again returned 1–23 HP over and over, in the Act I checkpoint fight and in the ceremony guard fight. The level-1 checkpoint fight and the level-3 ceremony guard fight are both punishing for the harness's cut-and-stand-down line.

### Still unplayed (browser) — superseded by next section

See **Beyond Oakhaven — Act I Varr network + Sarn stores** below. Sarn stores and the quarry detour are now harness-played. Seize / Cinder / Kael / hand pass remain open there.

## Beyond Oakhaven — Act I Varr network + Sarn stores + bug 33 (IN PROGRESS) (2026-10-15, ~3:30–3:45 PM ET)

**Status:** **IN PROGRESS.** The Act I **checkpoint fight** (Varr + Moll + Hess) is now harness-winnable without nerfing combat or cheating state. Winning with **"Strip the coupling and let him crawl"** sets `checkpointLead=varr` / `plateStair`, the Quarry detour (Hask → Cut the brake) sets `stoneMoving` → `citadelSupplied`, and Sarn's **"Stone reached the stores."** beat is played through to the epilogue. One game bug was found (33) and fixed. These are harness plays, not hand plays.

**How the Varr network is reached (legitimate character only, no state edits):**
- At Moll's plate line take **"Move."** → **"Read them."** (not the Engineering talk-past).
- Rest at Tobin's Reclamation bench first (`NET_REST` default on): focus full, HP topped — the pump mend leaves focus short for Unmend.
- File slot 1, walk onto the plate, fight. `NET_TACTIC=varr` (default) plays for Varr: stand on him, re-read until confident, cut live weapon/armor seams (Rifle / Rivet line with `dependsOn`), prybar strikes, Brace (not a wasted End turn), bandage under 60%. When Varr hits zero the squad stands down and **varr-down** offers **"Strip the coupling and let him crawl"** (no check) → `checkpointLead=varr`.
- Deaths reload slot 1 and re-enter the plate. Variance is high (0–25 deaths observed on SEED=4 field Strain). Mid-fight **"Open the last ledger"** still returns thin HP — design call, unchanged; the harness reloads slot 1 after each death rather than fighting from 1–23 HP.
- Quarry: Hask clears the riggers → **Cut the brake** → `quarryStone=clear`, `stoneMoving`, `citadelSupplied`. Leave via Stack mouth (bug 33: rubble must stay off the crane→mouth walk).
- Citadel: Sarn offers **"Stone reached the stores."** when `citadelSupplied` (and `guardToll` may still be false on a fed-plate Act I).

### Results (this tip)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4 NETWORK=varr SARN=toll` | Move → Read them → checkpoint (varr broken open; 9 deaths / 9 loads / 25 cuts) → rest → Quarry Hask → Cut the brake (`stoneMoving`, `citadelSupplied`) → Rust Ives → Tundra seat → Citadel → **Sarn stores** → Splice → Spire decline → epilogue | **69/69 PASS** |
| `SEED=4` default | regression | **59/59 PASS** |
| Act III `SEED=4` | regression | **47/47 PASS** |
| Act I loop `SEED=4` | regression | **PASS** (0 FAIL) |

Also on this tip: `npm test` **196 + 55 + 75 PASS**, `npm run typecheck` clean. (Bug 33 adds route asserts inside the existing Act III hostile-path test; suite count stays 75.)

Z0 page/console errors: 0.

Harness-only (not a game bug): `mouthStep` now files a pending level before Arrow keys. `Game.tsx` holds walk keys while `pendingLevel` is set; after the long Ives walk the level modal could block Rust Stack-mouth departure (B4 flake on an earlier varr run).

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 33 | **MED — Cut the brake, then leave Quarry = forced rubble fight.** After Hask → Cut the brake the natural walk is crane → Stack mouth along row 6. Rubble at (20,3) still saw that corridor (bug 23 had moved him off the east mouth / Rill grade, not far enough north). | Spawn too close to the post-brake exit walk. | Move rubble `(20,3)` → `(18,1)` (same north pit, five tiles off every primary leg; optional fight stays if you walk up). | `playtest`: Act III primary paths now assert crane/Hask/Pim ↔ Stack mouth routes clear of rubble/mill; act4 `NETWORK=varr` Q4v |

### Still unplayed (browser)

- **Kael duel / RelSec** (`kael` + `rel1` on Quarry): Kael stands at quarry (13,5) with `kael-pre`; reachable on the Varr quarry detour without cheating, but not harnessed this pass (Hask → brake → leave does not talk to him).
- **Seize**: needs comprehension 8 or Continuity. At the crucible on this path: level 3, mind 8, audit 62 → comprehension **6**, no Continuity. Max ~7 on critical path before Spire. Leave documented; do not cheat.
- **Cinder** companion dark-mouth / Spire refusals: needs scrap feed + recruit earlier; not on this network's critical path.
- Design calls (unchanged): mid-fight auto ledger thin HP; balance of the level-1 checkpoint fight (winnable but punishing), Sovereign, Sever, and ceremony guards for a critical-path character.
- A full hand pass of Acts IV–VI without the harness.

**BLACKSITE PR #5** remains **BLOCKED** on human held-key — not worked this run.

## Beyond Oakhaven — Act III Kael duel / RelSec, Cinder companion, bug 34 (IN PROGRESS) (2026-10-22, ~12:25–1:10 AM ET)

**Status:** **IN PROGRESS.** Kael's **duel** and the **Cinder** companion are now harness-played through to the epilogue on the Act I Varr network (`SEED=4`). Kael + Striker Pye together (**KAEL=both**) was not won. One game bug was found by play (34) and fixed. These are harness plays, not hand plays.

**How these branches are reached (legitimate character only, no state edits):**
- **Kael** (`NETWORK=varr KAEL=duel|both`): on the Quarry detour, after Hask clears the riggers (`workersClear`), file slot 1 and talk to Kael at (13,5) before Cut the brake. `duel`: **"The riggers walk. You and I finish this."** (needs `workersClear`) → Engage (roster Kael only) → peel Outer clasp / Steel frame / Inner mesh → prybar → **kael-down** → **"Live. Take that sentence…"** (`kaelFate=spared`, `knowsSiphon`, siphon journal). `both`: **"Then show me the layers."** → Kael + Pye. The harness stands on Kael (Pye has no weapon seam; he steps out once Kael is not holding).
- **Cinder** (`NETWORK=varr CINDER=1`): Varr's **"Strip the coupling and let him crawl"** leaves plate scrap. Rest, then feed the moth at the bellows (30,3): **"Leave the plate scrap where she can take it."** → **"Hold still."** (`cinderFed`, `cinderChose`, companion). She walks the whole run. At the Spire mouth **cinder-spire** → **"Wait until she steps."** (`cinderSpireOk`). With `LAMP=break` the dark road also raises **cinder-dark** at the Tundra mouth → Wait (`cinderDarkOk`).
- After a "Wait until she steps." answer Silas is still on the mouth tile. Tapping that tile departs; the harness does the same. Another Arrow press walks off the mouth instead (LOW UX note, not changed: fixing it needs a new effect).

### Results (this tip)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4 NETWORK=varr SARN=toll KAEL=duel` | checkpoint (varr broken open; 31 deaths) → Quarry Hask → **Kael duel** (0 deaths, 3 armor cuts, 10 strikes) → spare → Cut the brake → Rust → Tundra → Citadel Sarn stores → Splice → Spire decline → epilogue | **77/77 PASS** |
| `SEED=4 NETWORK=varr SARN=toll KAEL=both` | … → Engage Kael + Pye | **NOT WON**: 40 losses with a Pye-first tactic (cap reached), then 54 losses with Kael-first, after which the page lost `window.__mend` mid-fight (harness crash, not chased). Store sim at the same file (level 2, 46 HP): ~0–7% of attempts win; the duel at the same file wins ~40%. |
| `SEED=4 NETWORK=varr SARN=toll CINDER=1` | checkpoint → **feed + recruit Cinder** → Quarry → … → Spire mouth **cinder-spire Wait** → Spire decline → epilogue | **72/72 PASS** (after bug 34) |
| `SEED=4 NETWORK=varr SARN=toll CINDER=1 LAMP=break` | same + Break the glass → dark road → **cinder-dark Wait** (Tundra mouth) + cinder-spire Wait | **77/77 PASS** |
| `SEED=4` default | regression | **59/59 PASS** |
| Act III `SEED=4` | regression | **47/47 PASS** |
| Act I loop `SEED=4` | regression | **23/23 PASS** |

Also on this tip: `npm test` **196 + 55 + 76 PASS** (one new bug-34 test), `npm run typecheck` clean. Z0 page/console errors: 0 on every completed run.

Checkpoint fight variance stays high (3–31 deaths per run on this pass; the harness reloads slot 1 after each death). Design call, unchanged.

### Bugs found / fixed this pass

| # | Found by play | Root cause | Fix | Regression test |
| --- | --- | --- | --- | --- |
| 34 | **HIGH — a recruited Cinder freezes Silas near her perch.** `CINDER=1`: after "Hold still." at the bellows, the next walk out of the upper Sinks stopped at (28,3) and the Stack mouth could not be reached. The store threw `toward is not a function` on every step within 5 tiles of a perch (Sinks bellows, fed Haven plots, warm Tundra hollow). | `nudgeCreature` built `toward` as a comma expression `((tx, ty) => …, "toward")`, so it held the string `"toward"`. | Make `toward` a plain arrow function (no behaviour change otherwise). | `playtest`: "a recruited Cinder can walk with Silas past her perch (bug 34)" (fails without the fix with the same TypeError) |

### Still unplayed / open

- **KAEL=both** (Kael + Pye at level 2): optional, off the critical path (Ives opens the Citadel; "Not this minute." walks away). Near-unwinnable at the file this path reaches (~0–7% per attempt), while the duel is about 40%. **Balance is a user design call** and was not changed. The spare ending is verified through the duel.
- **"The doctrine dies with the man."** (kaelFate dead) was not taken. Its effects differ only in flags, rep and journal text.
- **Seize**: unchanged. It needs comprehension 8 or Continuity, which the critical path does not reach (see above).
- **Cinder leaving** (`cinderRisk` from Doss + Rust heat + stopped bellows + fear ≥ 16) and her return were not played.
- Design calls (unchanged): mid-fight auto ledger thin HP; checkpoint fight variance; Sovereign / Sever / ceremony guard balance; Kael + Pye balance.
- A full hand pass of Acts IV–VI without the harness.

## Beyond Oakhaven — Kael kill ending, Cinder's second choosing, Seize (IN PROGRESS) (2026-10-22, ~1:27–2:00 AM ET)

**Status:** **IN PROGRESS.** Three more branches are harness-played to the epilogue in headless Chromium (dev build, `SEED=4`). No new game bugs were found (bug count stays at 34). These are harness plays, not hand plays. Open design calls are unchanged.

**New harness switches (`scripts/playtest-act4.mjs`, commit `260aee2`):**
- `KAEL_FATE=dead` (with `NETWORK=varr KAEL=duel`): at **kael-down** take **"The doctrine dies with the man."** instead of the spare line.
- `CINDER=leave|risk` (implies `CINDER=1`): after she chooses the shadow, **Stop the lung** at the Sinks bellows. Her fear goes from 10 to 18 ("lung-restless"). Once the brake is cut, the Varr stair warms the Rust flues (`stoneMoving` → `tenementWarm`/`guildWarm`, i.e. `rustHeat`), so the **Rust cut** raises **cinder-heat**. `leave` answers **"I won't take you into that noise."**. `risk` answers **"I'm going in."** (`cinderRisk`), and she leaves on her own on the next tick. Then: talk to Ives, rest at the guild bench, walk back road → **Sinks mouth**, **Seat the reed**, and stand by her perch (28,3).
- `CRUCIBLE=seize`: before the crucible, spend unspent skill points on **Audit** (Self → Improve Audit, +4 each) until comprehension reads 8, file slot 1, then **Seize the rank engine**. `BUILD=mind9`: Recommended file, then Presence −1 and Mind +1 on the create screen, using the screen's own buttons.
- `NET_DEATHS` (already present) was raised to 80–100 for these runs. With the default cap of 40, two runs ran out of retries in the Act I checkpoint fight (41 deaths each). That is the known checkpoint variance, not a new bug.

### Results (this tip)

| Run | Path | Result |
| --- | --- | --- |
| `SEED=4 NETWORK=varr SARN=toll KAEL=duel KAEL_FATE=dead` | checkpoint (16 deaths) → Hask → **Kael duel** (1 death, 9 cuts, 27 strikes) → **"The doctrine dies with the man."** (`kaelFate=dead`, Kael `alive=false`, siphon journal "You killed Kael…", `citadelOpen`; Pye stays waved off) → guild rest → Cut the brake → Rust → Tundra → Citadel Sarn stores → Splice → Spire decline → epilogue. The epilogue says **"The quarry tells Kael's death as a fall of stone…"** and has no "Kael lives" line. | **82/82 PASS** |
| `SEED=4 NET_DEATHS=80 NETWORK=varr SARN=toll CINDER=leave` | checkpoint (18 deaths) → feed + recruit Cinder → **Stop the lung** (fear 18) → Quarry → brake → **Rust cut: cinder-heat → "I won't take you into that noise."**. She leaves: `cinderLeft`, companion false, back at Sinks (30,3), line "The moth leaves the shadow…", quest **The second choosing** open. Then Ives → guild rest → **Sinks → Seat the reed → she steps back on** (`cinderBack`, companion true, "The reed is breathing. She steps onto the shadow again…", quest done) → Tundra → Citadel → Splice → Spire mouth **cinder-spire Wait** (she comes in) → epilogue | **79/79 PASS** |
| `SEED=4 NET_DEATHS=80 NETWORK=varr SARN=toll CINDER=risk` | same, but **"I'm going in."**: `cinderRisk`, and she leaves on her own once in Rust. Return and Spire are the same. | **79/79 PASS** |
| `SEED=4 CRUCIBLE=seize BUILD=mind9` (default talk network) | Crucible at **level 2** (xp 131). Audit 63→95 by 8 points still gives comprehension **7**. Seize refuses ("does not accept handwriting this small", −6 HP) and the run fails downstream. | **FAIL (expected): not reachable on the talk-past path** |
| `SEED=4 NET_DEATHS=100 NETWORK=varr SARN=toll CRUCIBLE=seize BUILD=mind9` | checkpoint (25 deaths) → … → crucible at **level 3** (mind 9). **5 points on Audit (63→83)** take comprehension 7→**8** → **Seize** (`citadelFate=seize`, no HP cost, `spireOpen`) → Spire decline → epilogue, which says "You are the standard now…" | **73/73 PASS** |
| `SEED=4` default | regression | **59/59 PASS** |
| Act III `SEED=4` | regression | **47/47 PASS** |
| Act I loop `SEED=4` | regression | **23/23 PASS** |

Also on this tip: `npm test` **196 + 55 + 76 PASS**, `npm run typecheck` clean. Z0 page/console errors: 0 on every completed run.

### Seize: reachable, but only off the default path

Comprehension = 1 + ⌊mind/3⌋ + ⌊audit/40⌋ + (level − 1). The earlier note said "not legitimately reachable". That was measured on a file that had never spent its skill points. Corrected finding:
- **Recommended file (mind 8)** at level 3 tops out at **7**, even with Audit at 95, so Seize needs level 4. Neither path played so far reaches level 4 before the crucible.
- **A mind-9 file** (one point moved from Presence on the create screen) reaches **8** at level 3 by spending 5 of its banked skill points on Audit. The **Varr network** (checkpoint fight + Quarry detour) reaches level 3 before the Citadel. The talk-past path reaches only level 2, which gives 7.
- So Seize is a legitimate, build-dependent ending, played above. Continuity is still only granted by the Sovereign fight after the Citadel. No balance was changed.

### Bugs found / fixed this pass

None. No game code changed. One harness label was fixed: B3c now says why it rests.

LOW note, not changed and not played: after the second choosing, `cinderLeftSaid` stays set. If she ever left a second time (it needs `cinderRisk` + the lung stopped again in Rust heat), her departure line would not repeat. Fixing that is a design question about whether a second leave should speak, not a bug found in play.

### Still open

- **KAEL=both** (Kael + Pye) balance: user design call, unchanged (about 0–7% at the file this path reaches).
- Design calls unchanged: mid-fight auto ledger thin HP; **checkpoint fight variance** (16–41 deaths per run this pass; two runs hit the 40 cap); Sovereign / Sever / ceremony guard balance; Kael + Pye balance; whether Seize should be reachable from the Recommended file.
- A full hand pass of Acts IV–VI without the harness.

## Hand pass — Citadel crucible → Spire → epilogue — 2026-10-22 ~2:00 AM ET (re-check ~3:00 AM ET: release ending PASS)

**Status: IN PROGRESS. The release ending has not yet been hand-played to the epilogue.** A person played (not the harness) from a High Citadel save made just before the crucible: a Recommended (mind 8) file going from level 2 to 3. The run went crucible (Splice) → Spire → Sovereign decline → Sovereign + Echo fight attempts. The fixes below are on `700521c`. Harness and unit regression is green, but nobody has replayed this stretch by hand since the fixes.

### Hand findings and verdicts

| # | Finding | Verdict | Why |
| --- | --- | --- | --- |
| H1 | After "Not while the graph is a lie. I'll circle." the tester did not find the non-fight ending. They kept re-talking to the Sovereign, decided the fight was mandatory, and died 4 times. | **Fixed (bug 35)** | Nothing in the game pointed at the Unissued baseline (spireheart). The circle reply wrote no log line, the Spire had no first-arrival line, the `no-baseline` quest text named no place, and plates draw no machine tags. |
| H2 | HUD Audit / Q in the High Citadel kept walking to the **Infirmary buffer** by Ime instead of the crucible. Tapping the crucible art or the stair graphic did nothing. | **Fixed (bug 36)** | Targeting bug plus a missing plate tag. See below. |
| H3 | Menu → Return to the title → Continue showed "Comprehension deepens" (level 3) again. | **Fixed (bug 37)** | A genuine re-fire. Dismissing the modal never reached the autosave. |
| H4 | "Stand down — their weapons are already dark" appeared once only the Echo's Power coupling was cut, while the Sovereign's baton was still live. A 55% roll failed and the next one passed. The fight ended with the Sovereign undefeated, back in `sovereign-pre`. | **Fixed (bug 38)** | The offer should need every hostile's hand empty. The Sovereign has no weapon seam, so she counted as "dark" by default. |
| H5 | The save had 20 unspent skill points and 2 Ways. | **Noted, not changed** | The HUD does not signal unspent points. They show only in the Self panel header ("Skill points N · Ways N") and the level-up modal. No badge was added because the rules forbid a new system. |
| H6 | The Sovereign fight at level 3 is very hard: 11–32 HP per round, and a tool severed every round. | **Design call (open)** | Already an open user call (Sovereign balance). Not rebalanced. |

### Bugs fixed (commit `700521c`)

| # | Bug | Cause | Fix | Test |
| --- | --- | --- | --- | --- |
| 35 | **MED: the release ending was undiscoverable after declining the Sovereign.** | "I'll circle" was a bare `end()` that logged nothing. The only route to "Leave the holes" without the fight is Audit Unissued baseline → Read what is holding → Leave the holes (harness V4). | Both "I'll circle" replies (`start`, `sat`) now log: *"The Sovereign lets you go. South, down the drop, the unissued baseline is still holding. It can be read without a fight."* The line is in the same voice as other direction hints (e.g. "A grate north of the sludge drops behind the checkpoint."). | `playtest`: "'I'll circle' at the Sovereign points at the unissued baseline (bug 35)"; act4 V2b now shows the line |
| 36 | **HIGH: Audit / Q in the High Citadel never chose the crucible.** From the save tile (13,5), which is two tiles from the crucible, Audit walked 22 steps to the buffer. | `auditNearest` prefers a remote "broken" machine. The buffer's `parent` (Siphon child) is severed by design and stays severed after Charge the cell, so it outranked the intact, unread crucible forever. Lamps and orrery behave the same way. Separately, the citadel is a painted plate: it paints the crucible up the stair, but the machine tile is the floor at (12,7). Plates drew no tag for machines, so no visible thing marked the real tile. | (1) Among remote machines, Audit now ranks unread-broken, then unread, then read-broken, then the rest. A machine is "read" once its seams carry a confidence. The beside-first rules from bugs 24 and 28 are unchanged. (2) On plate maps a machine within 2 tiles gets the same brass name tag that drawn maps and mouths already get. The crucible tile now reads **Crucible core**, and a tap there walks to it and audits it (that `clickTile` path already worked). | `playtest`: "Audit in the High Citadel walks to the unread crucible…(bug 36)". Store check on the hand save: Audit from (13,5), (16,8), and (32,18) now targets `crucible`. Browser screenshot shows the tag. |
| 37 | **LOW: level-up modal re-fired after Continue.** | `ackLevel` cleared `pendingLevel` in memory only. The autosave written at the level-up kept `pendingLevel: true`, so Continue → `load("auto")` reopened it. | `ackLevel` goes through `commit`, so the dismissal is autosaved. | `playtest`: "dismissing the level-up reaches the autosave…(bug 37)" |
| 38 | **MED: Stand down was offered with the Sovereign's baton live.** | `weaponsDark` only looked for a live `effect: "weapon"` seam. The Sovereign (and Kael) carry a baton with no weapon seam, so they passed by default. | A hostile counts as dark only if `weaponOf(a)` is fists, meaning its weapon seam is cut or it carries nothing. Fights with seams (checkpoint rifles, lamp shade knife, Echo arm mount) behave as before. | `playtest`: "Stand down is not offered while the Sovereign's baton is live (bug 38)" |

### Regression (tip after `700521c`, own dev server on :8090)

| Run | Result |
| --- | --- |
| `npm test` | **196 + 55 + 80 PASS** (+4 new playtest tests). `npm run typecheck` is clean. |
| act4 `SEED=4` default (decline → Unissued baseline → Leave the holes) | **59/59 PASS** |
| act4 `SEED=4 SPIRE=fight-leave` | **61/61 PASS** (V2b shows the new circle hint; fight → sovereign-down in 7 rounds) |
| Act III `SEED=4` (`playtest-act3.mjs`) | **47/47 PASS** |
| Act I loop `SEED=4` (`playtest-loop.mjs`) | **23/23 PASS** |

Z0 page/console errors: 0 on every run.

### Still open

- ~~Hand-play the release ending to the epilogue~~ — **done, PASS** (see re-check below).
- Hand re-check of bug 38 (Stand down with the Sovereign's baton live). The re-check below never entered the fight; the fix is covered by the unit test and act4 fight-leave only.
- Hand walk Citadel → Tundra stair → Stack road east → Spire mouth on this build. The re-check used Map travel.
- Sovereign fight balance at level 3 (H6), plus the earlier design calls (KAEL=both, checkpoint variance, mid-fight auto-ledger HP, Seize from the Recommended file).
- Unspent-points HUD signal (H5): a design question, not changed.

### Hand re-check on `1e671df` — release ending (2026-10-22 ~2:59–3:00 AM ET)

A person played on the fixed tip (dev server on :8080 from this branch), loading the same pre-crucible High Citadel save, mouse and keyboard only, with no harness. Path: Continue → HUD Audit → Splice toward the Sinks → File it (level-up) → Menu → Save slot 1 → reload → Continue → Map → Void Spire → Talk → "Not while the graph is a lie. I'll circle." → Audit → Read what is holding → Audit → Leave the holes → epilogue → Return to the title. 0 deaths; no soft-locks or visual glitches seen.

| Check | Result | Evidence |
| --- | --- | --- |
| Bug 36: Audit targets the crucible | **PASS** | First Audit opened "Audit · Crucible core" ("Spire lifts. Functional."), Splice offered. Brass tags "Crucible core" (Citadel) and "Unissued baseline" (Spire) visible once panels closed. |
| Bug 37: level-up does not re-fire | **PASS** | "Comprehension deepens: Level 3" → File it → save, reload, Continue: no modal. |
| Bug 35: circle hint | **PASS** | Log: "The Sovereign lets you go. South, down the drop, the unissued baseline is still holding. It can be read without a fight." |
| Release ending | **PASS** | Audit · Unissued baseline → Read what is holding → Leave the holes → "The ledger closes / BASELINE REFUSED" epilogue → MEND title. |
| Bug 38: Stand down | **not hand-tested** | No fight was entered. |

Notes (not changed): the Audit panel covers the map, so the target is only visible by name in the panel title; the level-up modal follows Splice with no beat between; the epilogue scrolls and its button is at the end of the text (reading order, by design).

**Status: IN PROGRESS** for Acts IV–VI. The release (no-fight) ending is now hand-verified. Remaining: hand check of bug 38 in the Sovereign fight, a hand walk Citadel → Spire without Map travel, and the open design calls above.


### Hand check — bug 38 inside the Sovereign fight (on `5627f34`)

A person played from a Spire save (harness `DUMP_AT=V3`, `SEED=4 SPIRE=fight-leave`), mouse and keyboard only. Path: Continue → Talk to the Sovereign → "Then I'll read you while you move." → fight. The only seam cut was the Echo's **Power coupling** (round 4; log "Echo construct: Power coupling severed, Arm mount unavailable"). The Sovereign was never touched.

| Check | Result | Evidence |
| --- | --- | --- |
| Bug 38: no Stand down while the Sovereign's baton is live | **PASS** | Rounds 4–5 after the cut: action bar was Audit / Strike / Brace / End turn only; "Stand down" absent from the page while the Sovereign showed "Officer's baton → you". |
| Fight outcome | died (1) | HP 52 → 31 before first control, then ~9–11 per round; Tool haft severed by round 3. No difficulty change tried. Win path not reached by hand (covered by act4 fight-leave 61/61, re-run this pass). |

New friction found (not yet fixed):
- **H7 (MED):** in a two-enemy fight, Audit opens on the adjacent/nearest hostile with no way to pick the target. Clicking the Echo on the map is a Strike (3 AP), and initiative-bar portraits do nothing when clicked. The tester could only Audit the Echo after moving next to it.
- **H8 (LOW):** the Echo's intent line kept reading "Piston arm → you · needs Power coupling — no longer that shape" for one round after the coupling was cut, then switched to "Bare hands → you". Stale intent text for a round.
- H6 (Sovereign fight difficulty at level 3) observed again; still a design call.

**Status: IN PROGRESS** for Acts IV–VI. Bug 38 is now hand-verified. Remaining: H7 Audit target choice, H8 stale intent line, a hand walk Citadel → Tundra → Spire without Map travel, and the open design calls.


### Fixes — H7 Audit target choice, H8 stale intent line (pending hand verification)

| ID | Fix | Regression |
| --- | --- | --- |
| **H7 (MED)** — **FIXED, pending hand verification** | In a fight, each hostile's face in the turn-order strip is now a button. Touch it to aim Audit at that foe: log "Audit will read Echo construct.", and the portrait gets a bright brass ring (`aria-pressed`, label "Echo construct, Audit reads this one"). The next Audit opens on the aimed foe; if it is not in reach, Silas walks to it first (same walk as before) and the panel opens on arrival. Touch the same face again to clear the aim ("Audit reads whoever is nearest again."). If the aimed foe falls, Audit goes back to the nearest. The first unaimed Audit in a fight with more than one hostile logs once: "Touch a face in the turn order to choose who Audit reads." Aiming costs no AP. A tap on a body on the map still strikes, as before. Stored as `combat.aim`; it ends with the fight. | `playtest.test.ts`: "a face in the turn order aims Audit at that hostile (H7)", "an aimed foe that falls lets Audit fall back to the nearest (H7)". Browser check on :8090 from the V3 Spire save: two face buttons (Sovereign, Echo); Echo face → aim set → HUD Audit → walk → "Audit · Echo construct", 0 console errors. |
| **H8 (LOW)** — **FIXED, pending hand verification** | A cut now re-reads the owner's frozen opening at once (`replanOwner` in `sever`). After the Power coupling is cut, the Echo's line reads "Bare hands → you" in the same turn instead of "Piston arm → you · needs Power coupling — no longer that shape". Only the cut body's opening is re-read. The others stay frozen, and "no longer that shape" still shows when the board changes another way (e.g. you step out of reach). | `playtest.test.ts`: "cutting the Echo's Power coupling re-reads its intent at once (H8)". `pass3.test.ts` rifle test updated: after the chamber cut Varr's line is "Repair → Pressure chamber" (live) instead of the stale rifle line. |

Regression on this change (dev server :8090, headless Chromium, `SEED=4`):

| Run | Result |
| --- | --- |
| `npm test` | 196 + 55 + 83 PASS (game suite 80 → 83) |
| `npm run typecheck` | clean |
| `npm run lint` | 24 errors / 13 warnings, same as before the change (old, none in the new code) |
| act4 `SEED=4` default | **59/59 PASS** |
| act4 `SEED=4 SPIRE=fight-leave` | **61/61 PASS** (V5 fight → sovereign-down in 5 rounds, 0 deaths. Was 7 rounds: a foe whose seam is cut now follows its re-read opening instead of losing the committed action) |
| Act III `SEED=4` | **47/47 PASS** |
| Act I loop `SEED=4` | **23/23 PASS** |

**Status: IN PROGRESS** for Acts IV–VI. Remaining: hand check of H7 (aim the Echo from its face, then Audit) and H8 (intent line right after the coupling cut) in the Sovereign fight, a hand walk Citadel → Tundra → Spire without Map travel, and the open design calls.


### Hand check — H7, H8 on 2d6f2b5 (:8080, V3 Spire save, 2026-10-22 ~4:29 AM ET)

The V3 loader lands in explore mode after the Sovereign's offer ("The Sovereign lets you go…"). The tester opened the fight with Talk → "Then I'll read you while you move." (Round 1, 8 AP).

| Check | Result |
| --- | --- |
| **H7** Echo face → aim | **PASS.** Log "Audit will read Echo construct.", face highlighted. |
| **H7** HUD Audit opens on aimed foe | **PASS.** Panel "Audit · Echo construct" (Power coupling → Arm mount). Echo was already in reach, so the walk-to was not seen by hand (covered by the :8090 browser check). |
| **H7** same face again clears | **PASS.** Log "Audit reads whoever is nearest again.", highlight dims. |
| **H7** map tap still strikes | **PASS.** "Silas Vance hits The Epistemic Sovereign with bare hands", AP 8 → 5. |
| **H8** no stale line after cut | **PASS.** Before the cut the Echo's line read "Movement → you" (this save's opening, not Piston arm). After Unmend Power coupling, in the same turn, the Echo line read "Cut → Tool haft" with no "no longer that shape". Round 2 read "Bare hands → you". |

New notes from this pass:
- **H9 (LOW, triaged below: fixed, needs hand check):** right after the Echo's coupling cut, the Sovereign's line read "Cut → Tool haft — no longer that shape", though none of its parts were cut. Possibly correct (both foes had committed the same cut on Silas's Tool haft, and the board changed), but the wording reads oddly. Needs a look at whether a sibling re-plan should mark the other foe stale.
- **Balance note:** Silas went 40 → 11 HP in one enemy round in Round 3 after losing the Tool haft, then died after Set Brace + End ("Baseline lost", "Open the last ledger" / "Title" shown, no freeze). Feeds the open design call on Sovereign difficulty; not changed here.

**Status: IN PROGRESS** for Acts IV–VI. H7 and H8 are hand-verified. Remaining: triage H9, a hand walk Citadel → Tundra → Spire without Map travel, and the open design calls (including Sovereign damage).


### H9 triage — "Cut → Tool haft — no longer that shape" on the Sovereign (2026-10-22 ~5:10 AM ET)

**Finding: the stale mark was correct, the wording was wrong.** Replayed in the node store from the V3 save (`/tmp/mend-v3.json`, Talk → "Then I'll read you while you move."): round 1 starts with Silas at (9,7), Sovereign at (8,6) (adjacent), Echo at (11,8) (two away). Intents freeze at the start of Silas's turn: Sovereign "Cut → Tool haft" (tier ≥ 2, adjacent, haft live), Echo "Movement → you, then Piston arm". Aiming Audit at the Echo walks Silas one step to (10,7), beside the Echo but **two tiles from the Sovereign**. From that step on, `planFits` fails the Sovereign's committed cut on distance (`dist(a, player) <= 1`), not on the haft, which stays whole. The coupling cut then re-reads only the Echo (`replanOwner`, H8) to "Cut → Tool haft", and the hand tester noticed the Sovereign's stale line at that moment. It was already stale since the step.

The mechanic is existing design: a committed opening that no longer fits is lost when the foe acts (`followPlan`: "loses the action they had committed to"), so stepping out of reach of a telegraphed cut is a real dodge. A sibling re-plan would erase that dodge, so the Sovereign is **not** re-planned (`replanOwner` stays scoped to the body that was cut). The only defect was the generic suffix "no longer that shape", which read as if the haft had changed.

**Fix:** `planMiss` in `src/game/logic.ts` gives `boardIntents` rows a `why` (same tests as `planFits`): a cut whose part is intact but out of reach reads "— out of reach"; a cut whose part is gone reads "— Tool haft is gone"; a strike or close whose target is down reads "— the target is down"; a strike with the same weapon but out of range reads "— out of reach"; anything else keeps "— no longer that shape". `Game.tsx` prints `row.why`. Display only: no AI or rules change.

Test: `playtest.test.ts` "a committed cut Silas steps away from says out of reach, not a lost part (H9)" replays the step + coupling cut (Sovereign line live false, why "out of reach", haft intact, Echo "Cut → Tool haft" live), then severs the haft and expects "Tool haft is gone".

| Run (dev server :8090, headless Chrome, `SEED=4`) | Result |
| --- | --- |
| `npm test` | 196 + 55 + 84 PASS (game suite 83 → 84) |
| `npm run typecheck` | clean |
| act4 default | **59/59 PASS** |
| act4 `SPIRE=fight-leave` | **61/61 PASS** (twice: sovereign-down in 6 rounds / 0 deaths, then 22 rounds / 6 deaths). Baseline on cb0038c without this change also varied (14 rounds / 4 deaths, 7 / 0): the fight length is not deterministic under `SEED=4`, and the harness does not read intent lines. |
| Act III | **47/47 PASS** |
| Act I loop | **23/23 PASS** |

**Balance numbers behind "40 → 11 in one round" (not changed):** Sovereign is polymorphic, 6 AP a turn; baton 7 + floor(body 7 / 2) + roll(−1..+1) = 9–11, +4 on "A matrix discharges" (45% while the Liturgy thread is live) = 13–15; to-hit 56 + 3×7 − 2×5 = 67% against Silas (finesse 5). Echo has 4 AP: Piston arm 8 + 3 ± 1 = 10–12, or bare hands 4 + 3 ± 1 = 6–8 once the Power coupling is cut; to-hit 58%. Silas has no armor node and no armor equipped, so no reduction (normal strain). While the haft is live and both foes are adjacent, both openings are a 4-AP cut, which leaves the Sovereign 2 AP (a strike costs 3) and the Echo 0: **a round of cuts deals no HP damage**. Once the haft is gone neither can open with a cut, so the Sovereign swings twice and the Echo once. That is 0 → about 20 expected per round, with a ceiling of 30 + 8 = 38 (Echo bare hands) or 42 (piston). 29 (40 → 11) is e.g. 10 + 13 from the baton plus 6 from the Echo's hands. Brace (×0.55) spends itself on the first blow only, so at 11 HP Set Brace + End still loses to a second baton hit. This is input for the open Sovereign difficulty design call.

**Hand check needed (H9):** load the V3 save via `http://localhost:8080/__hand-load-v3.html` → Talk → "Then I'll read you while you move." On round 1 the Sovereign line reads "Cut → Tool haft" (brass). Touch the Echo's face in the turn order, then Audit: Silas walks one step beside the Echo. The Sovereign line should now read "Cut → Tool haft — out of reach" (grey) before any cut. Unmend Power coupling: the Echo line reads "Cut → Tool haft" (brass) and the Sovereign line still "— out of reach". (The cut can miss; retry while AP ≥ 4.) End the turn. The Echo acts first and may cut the haft. When the Sovereign opens round 2, it logs "The Epistemic Sovereign loses the action they had committed to." Node replays of this exact path matched in 3 of 3 runs.

**Status: IN PROGRESS** for Acts IV–VI. H9 is fixed and needs a hand check. Remaining: a hand walk Citadel → Tundra → Spire without Map travel, and the open design calls (including Sovereign damage).
