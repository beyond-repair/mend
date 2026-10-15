# MEND (public `mend`) — QA completion note

**Status:** IN PROGRESS. Headless-browser loop PASS (21/21 with L9a/L9a'/L9b/L9c). Hand re-play on 51790a9 verified the Sinks camera/taps/Stack-mouth labels (bugs 6–8). The Stack Road east camera and walk-to-Ward were still broken on that build; they are fixed on this tip and covered by tests, but **not yet re-verified by hand**.
Do **not** mark COMPLETE — PLAYTEST VERIFIED until someone has re-played Stack Road → Ward stair → Oakhaven by hand (no Map jump) on this build.
**Branch:** `fix/mend-playtest-rc`
**Base:** `main` @ `8cfbd1e`
**Date:** 2026-10-15, about 1:30–2:00 AM ET (first pass); hand playtest 1 and its fixes about 2:20–2:45 AM ET; hand re-play + Stack Road camera about 2:50–3:10 AM ET
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

- `npm test`: 196 (scripts) + 55 (app-data/auth) + **39** (game: 28 `pass3` + 11 `playtest`), all passing (Node 22.12)
- After hand playtest 1, 5 `playtest` tests were added. The camera tests fail on 6387550's `stage.ts` (`440x250 at 14,12: feet 225,362 must stay on the canvas`). The talk-past→tap test passes on 6387550 too: the store's `clickTile` was never the problem, the canvas hit test and camera were.
- After hand re-play 2, 1 more `playtest` test: Ward stair on deck walking the Stack Road east/north. It fails on 51790a9 (`Silas is not pinned to the right edge (361)`).
- `scripts/ts-resolve-hook.mjs` now also maps the `@/` alias, so a test can load `src/components/mend/stage.ts`.
- `npm run typecheck`: clean
- `npm run lint`: 4 errors and 7 warnings, the same as `main`. These are the pre-existing ones named in the README. No new problems.
- `npm run build`: OK. The migrate step is skipped because `DATABASE_URL` is not set.
- The new `playtest.test.ts` tests were run against `main`'s game code: 3 of the 4 behaviour tests fail there and pass on this branch.

## Remaining before COMPLETE — PLAYTEST VERIFIED

1. **Human hand re-playtest** of the same loop on this build, with real canvas taps and visual feel: `npm run dev`, then open `http://localhost:8080/`.
   Steps: New ledger → Recommended file → Enter the Sinks → "Then show me the pump." → "I'll audit it." → **Audit** (it must walk to the pump, not the checkpoint) → Mend → Esc → walk south through the gap at (14,11) → Moll → Engineering → (File the level once the talk closes) → walk to the SE Stack mouth by tapping → step on it → on The Stack Road, walk east (Brick stair is on the *lower* gantry at 16,11 — correct but wrong direction for Oakhaven), go back up the x=6 stair, walk east along the upper gantry, then north onto the **Ward stair** at (20,1) — **no Map jump** → Oakhaven → talk to someone → Menu → Save slot 1 → reload → Continue.
   Check by hand:
   - (Verified on 51790a9) South of the plate, Silas stays in the frame and every tap moves him; arrows/WASD move him too; Stack mouth diamond + label come into view.
   - **Must re-verify on this tip:** on The Stack Road, walking east does **not** pin Silas to the right edge; taps and WASD/arrows keep moving him; the **Ward stair** diamond + label come into view without a Map jump; ArrowUp / tap onto it lands in Oakhaven.
   - Feel: past the plate's edge the painted backdrop rests while the board scrolls under a centred Silas.
   - Esc: leaves Tobin's after-talk and Moll's "I'm already walking."; deliberately does nothing on Moll's opening and "No" lines.
   - The arrival toast ("You arrive at The Stack Road.") does not pop again mid-road.
2. **Death reload design call:** the autosave is written on every combat commit. After a lost fight, "Open the last ledger" can drop you back into the same fight at 1–8 HP and 0–1 AP. You can quit to the title, or load a manual slot if you made one. Not changed: deciding whether to keep a pre-fight checkpoint is a design question.
3. **Beyond Oakhaven** (Quarry, Rust, Kiln, Switch, Pane, Tundra, Citadel, Spire, epilogue): covered only by the `pass3` logic tests. These areas have not been played in a browser in this pass.
