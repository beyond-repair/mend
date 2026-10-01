# CLAIM_STATUS — mend

**Classification:** RESEARCH
**Claim ceiling:** 1
**Review:** Sweep-170 / PASS-2026-10-01-170 (2026-10-01)
**Pre-sweep head:** `e71f56d4f62a23c90043e641b75c807a75341379`

## What the tree actually contains

- Browser game scaffold (TanStack Start / React / Vite) under `src/`, including `src/game/formulas.ts`.
- Node tests already wired in `package.json` for auth/app-data scripts. Those tests do not cover game balance.
- Committed `.vercel/output` build artifacts. Presence of a build output is not a verified production deploy.
- No README, no LICENSE, no `.github/workflows` observed at pre-sweep head.
- Sibling `mendthegame` is private and was not read this pass. No SUPERSEDES relation is claimed.

## Capability states

| Capability | State |
|---|---|
| Game client source | IMPLEMENTED (files present). Not TESTED as a playable product this pass. Not VERIFIED. Not INTEGRATED. |
| Balance formulas in `src/game/formulas.ts` | IMPLEMENTED. Local node witness added in `scripts/mend-formulas.test.mjs`. Not CI-verified. |
| Auth/app-data scripts | CLAIMED tested by existing `npm test` script. Not re-run this pass (dependency install out of scope). |

## Not claimed

Shipped commercial game, live multiplayer, therapeutic or clinical effect, AEGIS integrity product, or identity collapse with `mendthegame`.
