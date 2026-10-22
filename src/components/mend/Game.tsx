import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { unlockAudio, setAtmosphere, startBed } from "@/game/audio";
import { ATTR_LIST, allSkills, comprehension, maxHp, SKILL_LIST } from "@/game/formulas";
import { MAPS } from "@/game/maps";
import { nodeLive, weaponOf, boardIntents, weaponsDark } from "@/game/logic";
import { comp, leaveIndex, useGame } from "@/game/store";
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
import { HUD_LABELS, hudShowsCaption } from "./hud";

export function Game() {
  const phase = useGame((s) => s.data.phase);
  const uiText = useGame((s) => s.data.flags.uiText);
  const boot = useGame((s) => s.boot);
  // Before paint: seed hasSave from localStorage so Continue is not grey on first load.
  useLayoutEffect(() => {
    boot();
  }, [boot]);
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as { __mend?: typeof useGame }).__mend = useGame;
    }
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
  const boot = useGame((s) => s.boot);
  const setIronman = useGame((s) => s.setIronman);
  const openCreate = useGame((s) => s.openCreate);
  const load = useGame((s) => s.load);
  const openPanel = useGame((s) => s.openPanel);
  const panel = useGame((s) => s.data.panel);
  // SSR has no localStorage, so hasSave is false on the server HTML. If we render
  // disabled={!hasSave} there, React hydration will not patch the attribute when the
  // client has a real save — Continue stays grey forever. Gate disabled until mount.
  const [titleReady, setTitleReady] = useState(false);
  useLayoutEffect(() => {
    boot();
    setTitleReady(true);
  }, [boot]);
  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-y-auto">
      <img src="/game/plates/sinks.jpg?v=5" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="relative m-3 mt-10 border border-brass bg-soot/80 p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-brass-dim">Oakhaven maintenance ledger</p>
      <h1 className="mt-3 font-display text-6xl text-brass">MEND</h1>
      <p className="mt-3 text-base leading-snug text-parchment">
        You do not spend power. You spend understanding. Silas Vance reads the relationships that hold the city together, and decides which ones deserve to hold.
      </p>
      <img
        src="/game/portraits/silas.jpg?v=3"
        alt="Silas Vance, maintenance mage"
        className="mt-5 h-40 w-32 border border-brass object-cover object-top"
      />
      <div className="mt-6 flex max-w-sm flex-col gap-2">
        <button type="button" className="min-h-11 bg-brass px-4 font-display text-lg text-soot" onClick={openCreate}>
          New ledger
        </button>
        <button
          type="button"
          className="min-h-11 border border-brass px-4 text-brass"
          disabled={titleReady && !hasSave}
          onClick={() => load("auto")}
        >
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
    <main className="relative mx-auto h-dvh w-full max-w-[440px] overflow-y-auto">
      <img src="/game/plates/haven.jpg?v=5" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="relative m-3 mt-6 mb-8 border border-brass bg-soot/85 p-4">
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
      <button type="button" disabled={!ready} className="mt-4 mb-4 min-h-11 bg-brass px-4 font-display text-lg text-soot" onClick={start}>
        Enter the Sinks
      </button>
      </div>
    </main>
  );
}

function focusLine(d: Data) {
  // A pin names an open job. Once that job is closed in the ledger, fall back to the room's own line.
  if (d.pinned && !d.journal.some((j) => j.title === d.pinned && j.status !== "open")) return d.pinned;
  const pump = String(d.flags.pumpFate ?? "");
  if (d.mapId === "sinks") {
    if (pump === "mend" || pump === "wren" || pump === "speech") return "The pump holds";
    return "The broken pump";
  }
  if (d.mapId === "quarry") return "The buried gears";
  if (d.mapId === "tundra") return "Activate the main bellows";
  if (d.mapId === "citadel" || d.mapId === "spire" || d.mapId === "pane") return "The frozen span";
  if (d.mapId === "road" || d.mapId === "switch") return "The stacked road";
  if (d.mapId === "kiln" || d.mapId === "rust") return "The cold stacks";
  if (d.mapId === "haven") return "The quiet ward";
  return "The city";
}

function LogChip({ quiet = false }: { quiet?: boolean }) {
  const log = useGame((s) => s.data.log);
  const line = log[0] ?? "";
  const [on, setOn] = useState(false);
  // Every store commit clones `data`, so `log` is a new array on each step even when nothing was written.
  // Only a real new entry (contents changed) re-raises the chip; otherwise the last line, e.g.
  // "You arrive at The Stack Road.", popped up again mid-walk.
  // Stay mounted while talking (`quiet`) so `seen` survives talk open/close — unmounting remounted
  // with an empty `seen` and re-toasted the arrive line after closing Lark mid-road.
  const seen = useRef<string[]>([]);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const prev = seen.current;
    seen.current = log;
    const fresh = log.length !== prev.length || log.some((l, i) => l !== prev[i]);
    if (!line || !fresh) return;
    setOn(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), 3800);
  }, [log, line]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (quiet || !on || !line) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[min(72%,18rem)]">
      <p className="scrap">{line}</p>
    </div>
  );
}

function PlayScreen() {
  const d = useGame((s) => s.data);
  const open = useGame((s) => s.openPanel);
  const step = useGame((s) => s.step);
  const click = useGame((s) => s.clickTile);
  const talk = useGame((s) => s.talkNearest);
  const audit = useGame((s) => s.auditNearest);
  const aimAudit = useGame((s) => s.aimAudit);
  const strike = useGame((s) => s.strikeNearest);
  const endTurn = useGame((s) => s.endTurn);
  const stand = useGame((s) => s.standDown);
  const brace = useGame((s) => s.brace);
  const zoom = useGame((s) => s.setZoom);
  const close = useGame((s) => s.closePanel);
  const choose = useGame((s) => s.choose);
  const ackLevel = useGame((s) => s.ackLevel);

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

  const playRef = useRef<HTMLDivElement>(null);
  const focusPlay = () => {
    const el = playRef.current;
    if (!el) return;
    // Keep OS arrow keys on the play shell after talk/HUD clicks (button focus swallows them in some hosts).
    if (document.activeElement !== el) el.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!d.dialogue) focusPlay();
  }, [d.dialogue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState().data;
      // The level modal (shown once no talk is open) is the top layer: Esc files it, and it holds the walk keys like it holds taps.
      const levelUp = s.pendingLevel && !s.dialogue;
      if (e.key === "Escape") {
        if (levelUp) ackLevel();
        else if (s.panel !== "none") close();
        else if (s.dialogue) {
          const leave = leaveIndex(s);
          if (leave >= 0) choose(leave);
        }
        return;
      }
      if (levelUp || s.dialogue || (s.panel !== "none" && s.panel !== "audit")) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const walk =
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "w" ||
        e.key === "a" ||
        e.key === "s" ||
        e.key === "d";
      if (walk) e.preventDefault();
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
  }, [ackLevel, audit, choose, click, close, endTurn, open, strike, talk]);

  const talking = Boolean(d.dialogue);
  const fighting = Boolean(d.combat);
  const myTurn = !d.combat || d.combat.order[d.combat.index] === "player";
  const map = MAPS[d.mapId];
  const noStrike = fighting && (!myTurn || d.player.ap < 3);
  const noBrace = fighting && (!myTurn || d.player.ap < 1);
  const faultLine = fighting ? knownFaults(d) : "";
  const intents = fighting && myTurn ? boardIntents(d) : [];
  const canYield = fighting && myTurn && weaponsDark(d);
  const nearFaces = Object.values(d.actors)
    .filter((a) => a.alive && a.mapId === d.mapId && Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 8)
    .slice(0, 3);
  const turnFaces = fighting && d.combat
    ? d.combat.order.map((id, i) => ({
        id: `${id}-${i}`,
        actorId: id,
        name: id === "player" ? "You" : (d.actors[id]?.name ?? id),
        portrait: id === "player" ? d.player.portrait : d.actors[id]?.portrait,
        on: i === d.combat!.index,
        foe: Boolean(d.actors[id]?.alive && d.actors[id]?.hostile),
        aim: d.combat!.aim === id,
      }))
    : [
        { id: "you", actorId: "player", name: "You", portrait: d.player.portrait, on: true, foe: false, aim: false },
        ...nearFaces.map((a) => ({ id: a.id, actorId: a.id, name: a.name, portrait: a.portrait, on: false, foe: false, aim: false })),
      ];

  return (
    <div
      ref={playRef}
      tabIndex={-1}
      className="relative mx-auto flex h-dvh w-full max-w-[440px] flex-col outline-none"
      onMouseDown={(e) => {
        // Clicks on non-interactive chrome keep the shell focused for OS arrow keys.
        const t = e.target as HTMLElement | null;
        if (t?.closest("button, a, input, textarea, select, [role='button']")) return;
        focusPlay();
      }}
    >
      <header className="plate-head">
        <div className="head-row">
          <button type="button" className="head-gear" onClick={() => open("menu")} aria-label="Menu">
            <img src="/game/ui/head-dots.jpg" alt="" />
          </button>
          <button type="button" className="head-gear" onClick={() => open("map")} aria-label="Map">
            <img src="/game/ui/head-check.jpg" alt="" />
          </button>
          <div className="head-knot" aria-hidden>
            <img src="/game/ui/head-knot.jpg" alt="" />
          </div>
          <button type="button" className="head-gear lion" onClick={() => open("char")} aria-label="Self">
            <img src="/game/ui/head-lion.jpg" alt="" />
          </button>
          <button type="button" className="head-gear" onClick={() => zoom((d.zoom ?? 1) < 1 ? 1 : -1)} aria-label="Zoom">
            <img src="/game/ui/head-close.jpg" alt="" />
          </button>
        </div>
        <div className="head-plaque">
          <div className="min-w-0">
            <div className="head-title truncate">{map?.name}</div>
            <div className="head-sub">
              {map?.act}
              {fighting ? ` · round ${d.combat?.round}` : ""} · C {comp(d)}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="head-title">Focus {d.focus}</div>
            <div className="head-sub head-pin">{focusLine(d)}</div>
          </div>
        </div>
      </header>
      <div className="world-frame relative min-h-0 flex-1 overflow-hidden">
        <WorldCanvas />
        <LogChip quiet={talking} />
      </div>
      {/* Outside world-frame overflow: last replies used to sit under the party strip and eat clicks. */}
      <DialogueBox />
      <footer className="instrument px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className={`mb-2 flex items-center gap-2${talking ? " pointer-events-none" : ""}`}>
          <img src={d.player.portrait} alt="" className="bezel h-[4.75rem] w-[3.7rem] shrink-0 object-cover object-[center_15%] bg-soot" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm tracking-wide text-parchment">
              {d.name}
              {d.player.guarding ? " · braced" : ""}
              {d.player.stunned ? " · overloaded" : ""}
            </div>
            <div className="face-row mt-1">
              {turnFaces.map((face) => {
                const cls = `face-tab${face.on ? " on" : ""}${face.aim ? " aim" : ""}`;
                const inner = (
                  <>
                    {face.portrait ? <img src={face.portrait} alt="" /> : <span className="bezel inline-block h-9 w-7 bg-soot" />}
                    <span className="max-w-16 truncate">{face.name}</span>
                  </>
                );
                // In a fight a hostile's face is where you aim Audit; a tap on the body itself strikes (H7).
                return fighting && face.foe ? (
                  <button
                    key={face.id}
                    type="button"
                    className={`${cls} face-pick`}
                    aria-pressed={face.aim}
                    aria-label={face.aim ? `${face.name}, Audit reads this one` : `Aim Audit at ${face.name}`}
                    title={face.aim ? "Audit reads this one" : "Audit this one"}
                    onClick={() => aimAudit(face.actorId)}
                  >
                    {inner}
                  </button>
                ) : (
                  <span key={face.id} className={cls}>
                    {inner}
                  </span>
                );
              })}
            </div>
            <div className="hp-track mt-1">
              <div className="hp-fill" style={{ width: `${Math.max(0, (d.player.hp / d.player.maxHp) * 100)}%` }} />
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
                {row.live ? "" : ` — ${row.why}`}
              </div>
            ))}
          </div>
        </div>
        {canYield && (
          <button type="button" className="mb-1 min-h-11 w-full border border-brass text-xs text-brass" onClick={stand}>
            Stand down — their weapons are already dark
          </button>
        )}
        <div className="grid grid-cols-4 gap-1.5">
          <HudButton kind="audit" label={HUD_LABELS.audit} onClick={audit} dim={fighting && !myTurn} />
          {fighting ? (
            <HudButton kind="strike" label={HUD_LABELS.strike} onClick={strike} dim={noStrike} />
          ) : (
            <HudButton kind="talk" label={HUD_LABELS.talk} onClick={talk} />
          )}
          {fighting ? (
            <HudButton kind="brace" label={HUD_LABELS.brace} onClick={brace} dim={noBrace} />
          ) : (
            <HudButton kind="map" label={HUD_LABELS.map} onClick={() => open("map")} />
          )}
          <HudButton kind={fighting ? "end" : "menu"} label={fighting ? HUD_LABELS.end : HUD_LABELS.menu} onClick={fighting ? endTurn : () => open("menu")} />
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          <HudButton kind="quests" label={HUD_LABELS.quests} onClick={() => open("journal")} />
          <HudButton kind="pack" label={HUD_LABELS.pack} onClick={() => open("inventory")} />
          <HudButton kind="self" label={HUD_LABELS.self} onClick={() => open("char")} />
          {fighting ? (
            <HudButton kind="menu" label={HUD_LABELS.menu} onClick={() => open("menu")} />
          ) : (
            <HudButton kind="lens" label={HUD_LABELS.lens} onClick={() => zoom((d.zoom ?? 1) < 1 ? 1 : -1)} />
          )}
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

const HUD_ART: Record<string, string> = {
  audit: "/game/ui/audit.jpg",
  strike: "/game/ui/strike.jpg",
  talk: "/game/ui/talk.jpg",
  brace: "/game/ui/brace.jpg",
  map: "/game/ui/map.jpg",
  end: "/game/ui/end.jpg",
  menu: "/game/ui/menu.jpg",
  quests: "/game/ui/quests.jpg",
  pack: "/game/ui/pack.jpg",
  self: "/game/ui/self.jpg",
  lens: "/game/ui/lens.jpg",
};

function HudButton({ kind, label, onClick, dim }: { kind: string; label: string; onClick: () => void; dim?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-disabled={dim || undefined}
      className={`hud-key ${dim ? "opacity-40" : ""}`}
    >
      <img src={HUD_ART[kind] ?? HUD_ART.menu} alt="" className="hud-art" />
      {hudShowsCaption(kind) ? <span className="hud-label">{label}</span> : null}
    </button>
  );
}

function EpilogueScreen() {
  const lines = useGame((s) => s.data.epilogue);
  const ending = useGame((s) => s.data.ending);
  const quit = useGame((s) => s.quit);
  return (
    <main className="relative mx-auto h-dvh max-w-[440px] overflow-y-auto">
      <img src="/game/plates/spire.jpg?v=5" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="relative m-3 mt-8 border border-brass bg-soot/85 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-brass-dim">{ending === "impose" ? "Baseline imposed" : "Baseline refused"}</p>
      <h1 className="mt-2 font-display text-4xl text-brass">The ledger closes</h1>
      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <button type="button" className="mt-6 mb-4 min-h-11 bg-brass px-4 font-semibold text-soot" onClick={quit}>
        Return to the title
      </button>
      </div>
    </main>
  );
}

function DeadScreen() {
  const text = useGame((s) => s.data.deathText);
  const ironman = useGame((s) => s.data.ironman);
  const load = useGame((s) => s.load);
  const quit = useGame((s) => s.quit);
  return (
    <main className="relative mx-auto flex h-dvh max-w-[440px] flex-col justify-center">
      <img src="/game/plates/canyon.jpg?v=5" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="relative m-4 border border-rust bg-soot/88 p-5">
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
      </div>
    </main>
  );
}
