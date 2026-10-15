# MEND (public `mend`) — QA completion note

**Status:** IN PROGRESS. Headless-browser loop PASS. A human hand playtest has not been done yet.
Do **not** mark COMPLETE — PLAYTEST VERIFIED until someone has played the loop by hand.
**Branch:** `fix/mend-playtest-rc`
**Base:** `main` @ `8cfbd1e`
**Date:** 2026-10-15, about 1:30–2:00 AM ET
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
| L9 ArrowRight onto the adjacent Stack mouth → The Stack Road (Act II) | PASS (FAIL on `main`, bug 2) |
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
Esc in the browser: E1 left Tobin's after-talk (PASS). E2 kept Moll's checkpoint choice open (PASS).

### Production build smoke (`npm run build` + `npm run preview`, :4180)

P1 title renders · P2 `window.__mend` is not exposed · P3 Tobin intro · P4 Audit walks to the pump, not the guard line · P5 Esc closes the audit · P6 Map opens · P7 no page or console errors. **All PASS.**

### Combat (checkpoint fight, "Move." → "Read them.")

The mechanics were verified by play:

- Turn order runs.
- Audit walks you next to a foe and reads them. The first read in a round costs 1 AP.
- Unmend asks you to confirm.
- Cutting Hess's or Varr's **Rifle mount** darkens the rifle ("A child lost function without being cut"). The foe loses the action it had committed to, and Varr falls back to "bare hands".
- Death shows "Baseline lost". **Open the last ledger** resumes the fight ("Engagement resumes on round N. Cuts stay cut.").

A scripted fighter with the recommended build lost the three-guard fight on every seed tried (3–8). The fight is optional: the Engineering/Speech talk-past and Wren's crawl avoid it.

## Automated checks

- `npm test`: 196 (scripts) + 55 (app-data/auth) + **33** (game: 28 `pass3` + 5 new `playtest`), all passing
- `npm run typecheck`: clean
- `npm run lint`: 4 errors and 7 warnings, the same as `main`. These are the pre-existing ones named in the README. No new problems.
- `npm run build`: OK. The migrate step is skipped because `DATABASE_URL` is not set.
- The new `playtest.test.ts` tests were run against `main`'s game code: 3 of the 4 behaviour tests fail there and pass on this branch.

## Remaining before COMPLETE — PLAYTEST VERIFIED

1. **Human hand playtest** of the same loop in a real browser, with real canvas taps and visual feel: `npm run dev`, then open `http://localhost:8080/`.
   Steps: New ledger → Recommended file → Enter the Sinks → "Then show me the pump." → "I'll audit it." → **Audit** (it must walk to the pump, not the checkpoint) → Mend → Esc → walk south through the gap at (14,11) → Moll → Engineering → walk to the SE Stack mouth → step on it → on The Stack Road, walk east, then north onto the Ward stair → Oakhaven → talk to someone → Menu → Save slot 1 → reload → Continue.
   Also check:
   - Can a first-time player **find** the Stack mouth and the Ward stair? Mouths are unlabeled brass diamonds, drawn only when near. `mendthegame` needed labels after its playtest 7. This was not changed here without hand evidence.
   - Does Esc feel right in talk?
2. **Death reload design call:** the autosave is written on every combat commit. After a lost fight, "Open the last ledger" can drop you back into the same fight at 1–8 HP and 0–1 AP. You can quit to the title, or load a manual slot if you made one. Not changed: deciding whether to keep a pre-fight checkpoint is a design question.
3. **Beyond Oakhaven** (Quarry, Rust, Kiln, Switch, Pane, Tundra, Citadel, Spire, epilogue): covered only by the `pass3` logic tests. These areas have not been played in a browser in this pass.
