import { useEffect, type ReactNode } from "react";
import { unlockAudio, setAtmosphere, startBed } from "@/game/audio";
import { ATTR_LIST, allSkills, comprehension, maxHp, SKILL_LIST } from "@/game/formulas";
import { MAPS } from "@/game/maps";
import { gait, nodeLive, weaponOf, boardIntents, weaponsDark } from "@/game/logic";
import { comp, useGame } from "@/game/store";
import type { Actor, Attr, Data, SkillId } from "@/game/types";
import {
  AuditPanel,
  CharSheet,
  DialogueBox,
  HelpPanel,
  InventoryPanel,
  JournalPanel,
  LevelModal,
  MapPanel,
  MenuPanel,
  ToolsPanel,
} from "./Panels";
import { WorldCanvas } from "./WorldCanvas";

export function Game() {
  const phase = useGame((s) => s.data.phase);
  const uiText = useGame((s) => s.data.flags.uiText);
  const boot = useGame((s) => s.boot);
  useEffect(() => {
    boot();
    const unlock = () => {
      unlockAudio();
      startBed();
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, [boot]);

  const fontSize = uiText === "lg" ? "1.125rem" : uiText === "sm" ? "0.9rem" : undefined;
  return (
    <div className="h-dvh bg-soot text-parchment" style={fontSize ? { fontSize } : undefined}>
      {phase === "title" && <TitleScreen />}
      {phase === "create" && <CreateScreen />}
      {phase === "play" && <PlayScreen />}
      {phase === "epilogue" && <EpilogueScreen />}
      {phase === "dead" && <DeadScreen />}
    </div>
  );
}

function TitleScreen() {
  const ironman = useGame((s) => s.data.ironman);
  const hasSave = useGame((s) => s.data.hasSave);
  const setIronman = useGame((s) => s.setIronman);
  const openCreate = useGame((s) => s.openCreate);
  const load = useGame((s) => s.load);
  const openPanel = useGame((s) => s.openPanel);
  const panel = useGame((s) => s.data.panel);
  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col overflow-y-auto px-5 py-8">
      <p className="text-xs uppercase tracking-[0.35em] text-brass-dim">Oakhaven maintenance ledger</p>
      <h1 className="mt-3 font-display text-6xl text-brass sm:text-7xl">MEND</h1>
      <p className="mt-3 max-w-xl text-lg leading-snug text-parchment">
        You do not spend power. You spend understanding. Silas Vance reads the relationships that hold the city together, and decides which ones deserve to hold.
      </p>
      <img
        src="/game/portraits/silas.jpg"
        alt="Silas Vance, maintenance mage"
        className="mt-6 h-52 w-40 border border-brass-dim object-cover"
      />
      <div className="mt-6 flex max-w-sm flex-col gap-2">
        <button type="button" className="min-h-11 bg-brass px-4 font-display text-lg text-soot" onClick={openCreate}>
          New ledger
        </button>
        <button type="button" className="min-h-11 border border-brass px-4 text-brass" disabled={!hasSave} onClick={() => load("auto")}>
          Continue
        </button>
        <label className="mt-2 flex min-h-11 items-center gap-3 text-sm text-mist">
          <input type="checkbox" checked={ironman} onChange={(e) => setIronman(e.target.checked)} />
          Ironman — one ledger, and death closes it
        </label>
        <button type="button" className="min-h-11 text-left text-sm text-brass" onClick={() => openPanel("help")}>
          How to read a city
        </button>
      </div>
      {panel === "help" && <HelpPanel />}
    </main>
  );
}

function CreateScreen() {
  const draft = useGame((s) => s.data.draft);
  const setName = useGame((s) => s.setDraftName);
  const draftAttr = useGame((s) => s.draftAttr);
  const toggleTag = useGame((s) => s.toggleTag);
  const recommend = useGame((s) => s.recommend);
  const start = useGame((s) => s.startNew);
  const skills = allSkills(draft.attrs, draft.tags);
  const c = comprehension(draft.attrs, skills.audit, 1);
  const hp = maxHp(draft.attrs.body, 1);
  const ready = draft.pool === 0 && draft.tags.length === 3;
  return (
    <main className="mx-auto h-dvh max-w-3xl overflow-y-auto px-4 py-6">
      <p className="text-xs uppercase tracking-[0.28em] text-brass-dim">Bureau diagnostic · zero output</p>
      <h1 className="mt-1 font-display text-3xl text-brass">File the Patch</h1>
      <p className="mt-2 max-w-xl text-sm text-mist">
        The chamber cannot measure you. Spend the remaining points, tag three skills, and step into the Sinks. You are not filing a class. The city will learn you from the verbs you repeat.
      </p>
      <label className="mt-4 block text-sm">
        Name on the card
        <input
          value={draft.name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border border-brass-dim bg-iron px-3 py-3 text-parchment"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 border border-brass px-3 text-brass" onClick={recommend}>
          Recommended file
        </button>
        <span className="self-center text-sm text-mist">Points left: {draft.pool}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {ATTR_LIST.map((a) => (
          <li key={a.id} className="flex items-center gap-2 border border-brass-dim px-2 py-1">
            <div className="min-w-0 flex-1">
              <div className="text-sm text-brass">{a.name}</div>
              <div className="text-xs text-mist">{a.blurb}</div>
            </div>
            <button type="button" className="min-h-11 min-w-11 border border-brass-dim" onClick={() => draftAttr(a.id as Attr, -1)} aria-label={`Decrease ${a.name}`}>
              −
            </button>
            <span className="w-6 text-center font-display text-xl">{draft.attrs[a.id as Attr]}</span>
            <button type="button" className="min-h-11 min-w-11 border border-brass-dim" onClick={() => draftAttr(a.id as Attr, 1)} aria-label={`Increase ${a.name}`}>
              +
            </button>
          </li>
        ))}
      </ul>
      <h2 className="mt-6 font-display text-brass">Tag three skills</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {SKILL_LIST.map((s) => {
          const on = draft.tags.includes(s.id as SkillId);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggleTag(s.id as SkillId)}
                className={`min-h-11 w-full border px-3 py-2 text-left text-sm ${on ? "border-brass bg-plate text-brass" : "border-brass-dim"}`}
              >
                <span className="flex justify-between">
                  <span>{s.name}</span>
                  <span>{skills[s.id as SkillId]}%</span>
                </span>
                <span className="block text-xs text-mist">{s.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm">
        Comprehension {c} · HP {hp} · Tags {draft.tags.length}/3
      </p>
      <button type="button" disabled={!ready} className="mt-4 mb-8 min-h-11 bg-brass px-4 font-display text-lg text-soot" onClick={start}>
        Enter the Sinks
      </button>
    </main>
  );
}

function PlayScreen() {
  const d = useGame((s) => s.data);
  const open = useGame((s) => s.openPanel);
  const step = useGame((s) => s.step);
  const click = useGame((s) => s.clickTile);
  const talk = useGame((s) => s.talkNearest);
  const audit = useGame((s) => s.auditNearest);
  const strike = useGame((s) => s.strikeNearest);
  const endTurn = useGame((s) => s.endTurn);
  const stand = useGame((s) => s.standDown);
  const brace = useGame((s) => s.brace);
  const zoom = useGame((s) => s.setZoom);
  const close = useGame((s) => s.closePanel);

  useEffect(() => {
    const pump = String(d.flags.pumpFate ?? "");
    const south = d.mapId === "sinks" && d.player.y >= 12;
    const gallery = d.mapId === "sinks" && d.player.x >= 19 && d.player.y >= 6 && d.player.y <= 8 && d.flags.sumpOpen && !d.flags.jackHeld;
    const mode = d.combat
      ? "fight"
      : d.mapId === "haven"
        ? d.flags.wardMarket || d.flags.wardClinic
          ? "haven"
          : "strain"
        : d.mapId === "quarry"
          ? d.flags.quarryStone && d.flags.quarryStone !== "hung"
            ? "quarry"
            : "strain"
          : d.mapId === "rust"
            ? d.flags.tenementWarm || d.flags.guildWarm
              ? "rust"
              : "strain"
            : d.mapId === "road"
              ? d.flags.roadDark
                ? "dark"
                : "road"
              : d.mapId === "tundra"
                ? d.flags.roadDark
                  ? "dark"
                  : d.flags.hollowWarm === false
                    ? "strain"
                    : "citadel"
                : d.mapId === "citadel"
                  ? d.flags.citadelFate === "sever" || d.flags.roadDark
                    ? "strain"
                    : "citadel"
                  : d.mapId === "spire"
                    ? "spire"
                    : south && d.flags.checkpointLead === "vacant"
                  ? "vacant"
                  : gallery
                    ? "strain"
                    : pump === "mend" || pump === "wren" || pump === "speech" || pump === "flood"
                      ? "pump"
                      : pump === "bleed" || pump === "lockout"
                        ? "strain"
                        : "sinks";
    setAtmosphere(mode);
  }, [d.combat, d.flags.checkpointLead, d.flags.citadelFate, d.flags.guildWarm, d.flags.hollowWarm, d.flags.jackHeld, d.flags.pumpFate, d.flags.quarryStone, d.flags.roadDark, d.flags.sumpOpen, d.flags.tenementWarm, d.flags.wardClinic, d.flags.wardMarket, d.mapId, d.player.x, d.player.y]);

  useEffect(() => {
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      if (acc >= 0.16) {
        acc = 0;
        if (useGame.getState().data.path.length) step();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState().data;
      if (e.key === "Escape") {
        close();
        return;
      }
      if (s.dialogue || (s.panel !== "none" && s.panel !== "audit")) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const x = s.player.x;
      const y = s.player.y;
      if (e.key === "ArrowUp" || e.key === "w") click(x, y - 1);
      if (e.key === "ArrowDown" || e.key === "s") click(x, y + 1);
      if (e.key === "ArrowLeft" || e.key === "a") click(x - 1, y);
      if (e.key === "ArrowRight" || e.key === "d") click(x + 1, y);
      if (e.key === "e") talk();
      if (e.key === "q") audit();
      if (e.key === "f") strike();
      if (e.key === " ") {
        e.preventDefault();
        if (s.combat) endTurn();
      }
      if (e.key === "c") open("char");
      if (e.key === "j") open("journal");
      if (e.key === "i") open("inventory");
      if (e.key === "m") open("map");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [audit, click, close, endTurn, open, strike, talk]);

  const talking = Boolean(d.dialogue);
  const fighting = Boolean(d.combat);
  const myTurn = !d.combat || d.combat.order[d.combat.index] === "player";
  const map = MAPS[d.mapId];
  const noWalk = fighting && (!myTurn || d.player.ap < 1 || gait(d.player) === "dead");
  const noStrike = fighting && (!myTurn || d.player.ap < 3);
  const noBrace = fighting && (!myTurn || d.player.ap < 1);
  const faultLine = fighting ? knownFaults(d) : "";
  const intents = fighting && myTurn ? boardIntents(d) : [];
  const canYield = fighting && myTurn && weaponsDark(d);

  return (
    <div className="flex h-dvh flex-col">
      <header className="plate-head flex items-end justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate font-display text-sm tracking-[0.18em] text-brass">{map?.name.toUpperCase()}</div>
          <div className="text-xs text-mist">
            {map?.act}
            {fighting ? ` · round ${d.combat?.round}` : ""} · C {comp(d)}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-display tracking-wide text-brass">Focus {d.focus}</div>
          <div className="max-w-[46vw] truncate text-mist">{d.pinned || "No pinned entry"}</div>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <WorldCanvas />
        {!talking && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[min(78%,20rem)] flex-col gap-1.5">
            {d.log.slice(0, 3).map((line, i) => (
              <p key={i} className="scrap">
                {line}
              </p>
            ))}
          </div>
        )}
        {!talking && (
          <div className="gear-pad" aria-hidden={false}>
            <span className="gear-hub" />
            <Pad className="gear-n" label="N" dim={noWalk} onClick={() => click(d.player.x, d.player.y - 1)} />
            <Pad className="gear-w" label="W" dim={noWalk} onClick={() => click(d.player.x - 1, d.player.y)} />
            <Pad className="gear-e" label="E" dim={noWalk} onClick={() => click(d.player.x + 1, d.player.y)} />
            <Pad className="gear-s" label="S" dim={noWalk} onClick={() => click(d.player.x, d.player.y + 1)} />
          </div>
        )}
        {!talking && (
          <div className="absolute right-2 top-3 z-10 flex flex-col gap-1">
            <button type="button" className="zoom-key" onClick={() => zoom(1)} aria-label="Zoom in">
              Near
            </button>
            <button type="button" className="zoom-key" onClick={() => zoom(-1)} aria-label="Zoom out">
              Far
            </button>
          </div>
        )}
        <DialogueBox />
      </div>
      <footer className="instrument px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-2 flex items-center gap-2">
          <img src={d.player.portrait} alt="" className="bezel h-16 w-14 shrink-0 bg-soot" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm tracking-wide text-parchment">
              {d.name}
              {d.player.guarding ? " · braced" : ""}
              {d.player.stunned ? " · overloaded" : ""}
            </div>
            {fighting && d.combat && (
              <div className="mt-1 flex gap-1 overflow-x-auto text-[10px] uppercase tracking-[0.14em]">
                {d.combat.order.map((id, i) => {
                  const name = id === "player" ? "You" : (d.actors[id]?.name ?? id);
                  const on = i === d.combat!.index;
                  return (
                    <span key={`${id}-${i}`} className={on ? "border border-brass px-1.5 py-0.5 text-brass" : "px-1.5 py-0.5 text-mist"}>
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-1 h-1.5 bg-soot">
              <div className="h-1.5 bg-brass" style={{ width: `${Math.max(0, (d.player.hp / d.player.maxHp) * 100)}%` }} />
            </div>
            <div className={`mt-1 text-xs ${fighting && myTurn && d.player.ap < 1 ? "text-rust" : "text-mist"}`}>
              HP {d.player.hp}/{d.player.maxHp} · Focus {d.focus}
              {fighting ? (myTurn ? ` · your action · AP ${d.player.ap}${d.player.ap < 1 ? " · end the turn" : ""}` : " · their action") : ""}
              {fighting ? ` · ${weaponOf(d.player).name}` : ""}
            </div>
            {fighting && faultLine && <div className="truncate text-xs text-rust">{faultLine}</div>}
            {intents.map((row) => (
              <div key={row.id} className={`truncate text-xs ${row.live ? "text-brass" : "text-mist"}`}>
                {row.name}: {row.line}
                {row.live ? "" : " — no longer that shape"}
              </div>
            ))}
          </div>
        </div>
        {canYield && (
          <button type="button" className="mb-1 min-h-11 w-full border border-brass text-xs text-brass" onClick={stand}>
            Stand down — their weapons are already dark
          </button>
        )}
        <div className="grid grid-cols-4 gap-1">
          <HudButton icon={<Mark kind="audit" />} label="Audit" onClick={audit} dim={fighting && !myTurn} />
          {fighting ? (
            <HudButton icon={<Mark kind="strike" />} label="Strike" onClick={strike} dim={noStrike} />
          ) : (
            <HudButton icon={<Mark kind="talk" />} label="Talk" onClick={talk} />
          )}
          {fighting ? (
            <HudButton icon={<Mark kind="brace" />} label="Set Brace" onClick={brace} dim={noBrace} />
          ) : (
            <HudButton icon={<Mark kind="map" />} label="Map" onClick={() => open("map")} />
          )}
          <HudButton icon={<Mark kind={fighting ? "end" : "menu"} />} label={fighting ? "End" : "Menu"} onClick={fighting ? endTurn : () => open("menu")} />
        </div>
        <div className={`mt-1 grid gap-1 ${fighting ? "grid-cols-4" : "grid-cols-3"}`}>
          <HudButton icon={<Mark kind="quests" />} label="Quests" onClick={() => open("journal")} />
          <HudButton icon={<Mark kind="pack" />} label="Pack" onClick={() => open("inventory")} />
          <HudButton icon={<Mark kind="self" />} label="Self" onClick={() => open("char")} />
          {fighting && <HudButton icon={<Mark kind="menu" />} label="Menu" onClick={() => open("menu")} />}
        </div>
      </footer>
      {d.panel === "audit" && <AuditPanel />}
      {d.panel === "char" && <CharSheet />}
      {d.panel === "journal" && <JournalPanel />}
      {d.panel === "inventory" && <InventoryPanel />}
      {d.panel === "map" && <MapPanel />}
      {d.panel === "menu" && <MenuPanel />}
      {d.panel === "tools" && <ToolsPanel />}
      {d.panel === "help" && <HelpPanel />}
      <LevelModal />
    </div>
  );
}

function seamWord(n: { effect: string }) {
  if (n.effect === "weapon") return "unavailable";
  if (n.effect === "motive") return "still";
  if (n.effect === "armor") return "compromised";
  return "disabled";
}

function knownFaults(d: Data) {
  if (!d.combat) return "";
  const bits: string[] = [];
  const note = (a: Actor, who: string) => {
    const dark = a.nodes.filter(
      (n) => n.revealed && !nodeLive(a.nodes, n) && (n.severed || n.effect === "weapon" || n.effect === "motive" || n.effect === "armor"),
    );
    if (dark.length) bits.push(`${who}: ${dark.map((n) => `${n.name} ${n.severed ? "severed" : seamWord(n)}`).slice(0, 2).join(", ")}`);
  };
  note(d.player, "You");
  for (const id of d.combat.order) {
    if (id === "player") continue;
    const a = d.actors[id];
    if (a?.alive) note(a, a.name);
  }
  return bits.join(" · ");
}

function Pad({ label, dim, onClick, className }: { label: string; dim?: boolean; onClick: () => void; className: string }) {
  return (
    <button
      type="button"
      className={`gear-btn ${className} ${dim ? "opacity-35" : ""}`}
      onClick={onClick}
      aria-label={`Move ${label}`}
      aria-disabled={dim || undefined}
    >
      {label}
    </button>
  );
}

function Mark({ kind }: { kind: "audit" | "strike" | "talk" | "brace" | "map" | "end" | "menu" | "quests" | "pack" | "self" }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true as const };
  if (kind === "audit") {
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="5" />
        <path d="M14 14l6 6" />
        <path d="M8 10h4M10 8v4" />
      </svg>
    );
  }
  if (kind === "strike") {
    return (
      <svg {...common}>
        <path d="M4 18l8-14 2 3-5 9h6l-3 4" />
      </svg>
    );
  }
  if (kind === "talk") {
    return (
      <svg {...common}>
        <path d="M5 6h14v9H9l-4 3z" />
      </svg>
    );
  }
  if (kind === "brace") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6z" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  if (kind === "map") {
    return (
      <svg {...common}>
        <path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    );
  }
  if (kind === "end") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 12l4-2" />
      </svg>
    );
  }
  if (kind === "quests") {
    return (
      <svg {...common}>
        <path d="M7 4h10v16l-5-2-5 2z" />
      </svg>
    );
  }
  if (kind === "pack") {
    return (
      <svg {...common}>
        <path d="M8 8h8v12H8z" />
        <path d="M10 8V6h4v2" />
      </svg>
    );
  }
  if (kind === "self") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path d="M6 19c1.5-3 3.5-4 6-4s4.5 1 6 4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="12" r="3" />
      <circle cx="16" cy="12" r="3" />
      <path d="M11 12h2" />
    </svg>
  );
}

function HudButton({ icon, label, onClick, dim }: { icon: ReactNode; label: string; onClick: () => void; dim?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-disabled={dim || undefined} className={`hud-key flex flex-col items-center justify-center gap-0.5 px-1 text-[10px] tracking-wide ${dim ? "opacity-35" : ""}`}>
      {icon}
      {label}
    </button>
  );
}

function EpilogueScreen() {
  const lines = useGame((s) => s.data.epilogue);
  const ending = useGame((s) => s.data.ending);
  const quit = useGame((s) => s.quit);
  return (
    <main className="mx-auto h-dvh max-w-2xl overflow-y-auto px-5 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-brass-dim">{ending === "impose" ? "Baseline imposed" : "Baseline refused"}</p>
      <h1 className="mt-2 font-display text-4xl text-brass">The ledger closes</h1>
      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <button type="button" className="mt-6 mb-10 min-h-11 bg-brass px-4 font-semibold text-soot" onClick={quit}>
        Return to the title
      </button>
    </main>
  );
}

function DeadScreen() {
  const text = useGame((s) => s.data.deathText);
  const ironman = useGame((s) => s.data.ironman);
  const load = useGame((s) => s.load);
  const quit = useGame((s) => s.quit);
  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col justify-center px-5">
      <h1 className="font-display text-4xl text-rust">Baseline lost</h1>
      <p className="mt-3 text-sm leading-relaxed">{text}</p>
      <div className="mt-6 flex flex-col gap-2">
        {!ironman && (
          <button type="button" className="min-h-11 bg-brass px-4 font-semibold text-soot" onClick={() => load("auto")}>
            Open the last ledger
          </button>
        )}
        <button type="button" className="min-h-11 border border-brass px-4 text-brass" onClick={quit}>
          Title
        </button>
      </div>
    </main>
  );
}
