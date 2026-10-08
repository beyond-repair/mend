# mend

**MEND** is a single-player browser RPG exported from Grok app-builder (React 19, TanStack Start, Vite 8, Nitro). You play Silas Vance, a maintenance auditor in the city of Oakhaven, who reads and mends the relationships that hold the city together instead of spending power. It has character creation, dialogue, quests, companions, dependency-based turn-based combat, several regions (including the Kiln, the Switchyard, and the Pane added in this export), and autosave to `localStorage` with an optional ironman mode. Everything runs in the browser; no account or server data is needed.

This repository is a later, larger export of the same game as the private sibling `mendthegame`. It runs locally as a playable game. It is not a published or shipped game. See `CLAIM_STATUS.md` for the claim ceiling.

## Run it locally

Requires **Node.js 22.12 or newer** (see `.nvmrc`); `npm test` uses Node's built-in TypeScript stripping.

```bash
git clone https://github.com/beyond-repair/mend.git
cd mend
npm ci
npm run dev        # http://localhost:8080
```

Click **New ledger**, press **Recommended file** (or spend the points yourself), then **Enter the Sinks** to start.

Other commands:

```bash
npm test           # template/script tests + balance formula witness + app-data/auth tests + game logic tests (src/game/pass3.test.ts)
npm run typecheck  # tsc --noEmit
npm run build      # production build into .vercel/output (git-ignored)
npm run preview    # serve the production build
```

No environment variables are required. Sign-in is off (`VITE_AUTH_ENABLED=false` in `.grok/app-env.json`), and without `DATABASE_URL` the build's migrate step is skipped. `npm run lint` currently reports 4 pre-existing errors in game and template code; it is not part of the run path.

## Not claimed

- Shipped or published game
- Multiplayer service
- Therapeutic or clinical effect
- Identity with `mendthegame` (same game lineage, separate repository and code)
