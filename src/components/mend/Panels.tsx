import { useState, type ReactNode } from "react";
import { BookOpen, X } from "lucide-react";
import { ITEMS } from "@/game/catalog";
import { CONVOS } from "@/game/dialogue";
import { checkChance, comprehension, DOMAIN_NAME, FACTION_NAME, SKILL_LIST, xpForLevel } from "@/game/formulas";
import { becoming, carryMax, carryWeight, confidenceOf, districtYield, factionFacts, forecast, habitLine, LENS_NAME, lensReads, nodeLive, PRACTICE_VERBS, practiceBand, seamState, tendencies } from "@/game/logic";
import { companyLines } from "@/game/companions";
import { MAPS, REGIONS } from "@/game/maps";
import { comp, regionOpen, useGame, visibleReplies } from "@/game/store";
import type { BaselineMark, Data, Deed, DistrictReading, Fate, GNode } from "@/game/types";

function Close({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 min-w-11 border border-brass-dim px-3 text-brass" aria-label="Close">
      <X className="size-4" />
    </button>
  );
}

function Shell({ title, children, dock = false }: { title: string; children: ReactNode; dock?: boolean }) {
  const close = useGame((s) => s.closePanel);
  return (
    <div className={dock ? "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center" : "fixed inset-0 z-30 flex items-end justify-center bg-soot/80 sm:items-center"}>
      <section className={`ledger rivet pointer-events-auto w-full max-w-3xl overflow-y-auto p-4 sm:p-6 ${dock ? "max-h-[72dvh] border-t border-brass-dim" : "max-h-[92dvh]"}`}>
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl tracking-wide text-brass">{title}</h2>
          <Close onClick={close} />
        </header>
        {children}
      </section>
    </div>
  );
}

function nodesOf(d: Data): GNode[] {
  if (!d.audit) return [];
  if (d.audit.kind === "machine") return d.machines[d.audit.id]?.nodes ?? [];
  if (d.audit.id === "player") return d.player.nodes;
  return d.actors[d.audit.id]?.nodes ?? [];
}

function targetName(d: Data) {
  if (!d.audit) return "";
  if (d.audit.kind === "machine") return d.machines[d.audit.id]?.name ?? "Machine";
  if (d.audit.id === "player") return d.name;
  return d.actors[d.audit.id]?.name ?? "Unknown";
}

export function AuditPanel() {
  const d = useGame((s) => s.data);
  const selectNode = useGame((s) => s.selectNode);
  const mend = useGame((s) => s.mend);
  const unmend = useGame((s) => s.unmend);
  const pinSeam = useGame((s) => s.pinSeam);
  const special = useGame((s) => s.special);
  const nodes = nodesOf(d);
  const selected = nodes.find((n) => n.id === d.uiNode) ?? null;
  const machine = d.audit?.kind === "machine" ? d.machines[d.audit.id] : null;
  const c = comp(d);
  const [armed, setArmed] = useState<string | null>(null);

  return (
    <Shell title={`Audit · ${targetName(d)}`} dock>
      <p className="mb-2 text-sm text-mist">
        Comprehension {c}. Focus {d.focus}/{10 + d.player.attrs.will * 2}. A seam you cannot hold will burn.
      </p>
      {selected && <SeamRead nodes={nodes} n={selected} c={c} fighting={Boolean(d.combat)} />}
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 bg-brass px-4 font-semibold text-soot" onClick={mend}>
          Mend
        </button>
        <button
          type="button"
          className="min-h-11 border border-rust px-4 text-rust"
          onClick={() => {
            if (!selected) return;
            if (armed !== selected.id) {
              setArmed(selected.id);
              return;
            }
            unmend();
            setArmed(null);
          }}
        >
          {armed === selected?.id ? "Confirm unmend" : selected && selected.density > c ? "Reckless unmend" : "Unmend"}
        </button>
        {d.disciplines.includes("continuity") && (
          <button type="button" className="min-h-11 border border-brass px-4 text-brass" onClick={pinSeam}>
            Pin seam
          </button>
        )}
      </div>
      <div className="relative mb-2 h-44 border border-brass-dim bg-soot">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          {nodes.map((n) =>
            n.dependsOn.map((dep) => {
              const parent = nodes.find((p) => p.id === dep);
              if (!parent) return null;
              const know = (node: GNode) => {
                const c = confidenceOf(node);
                return c === "understood" || c === "confident";
              };
              const broken = (node: GNode) => node.revealed && (!nodeLive(nodes, node) || node.severed);
              const cut = broken(n) || broken(parent);
              const flow = n.effect === "flow" && !cut;
              if (!know(n) && !know(parent) && !broken(n) && !broken(parent)) return null;
              return (
                <line
                  key={`${n.id}-${dep}`}
                  x1={parent.gx}
                  y1={parent.gy}
                  x2={n.gx}
                  y2={n.gy}
                  className={flow ? "flow-line" : undefined}
                  stroke={cut ? "#c45c26" : "#d4b483"}
                  strokeWidth={cut ? 0.7 : 0.85}
                  strokeDasharray={cut ? "2 1.6" : flow ? "1.4 1.2" : undefined}
                />
              );
            }),
          )}
        </svg>
        {nodes.map((n) => {
          const hidden = !n.revealed;
          const dead = n.revealed && (n.severed || !nodeLive(nodes, n));
          const mark = !n.revealed ? "?" : n.severed ? "×" : !nodeLive(nodes, n) ? "—" : n.integrity < 70 ? "○" : "●";
          const tone = dead ? "border-mist text-mist" : n.decoy && n.revealed ? "border-mist text-mist" : n.tier === "stress" ? "border-rust text-rust" : "border-brass text-brass";
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => selectNode(n.id)}
              className={`absolute min-h-11 max-w-36 -translate-x-1/2 -translate-y-1/2 border bg-iron px-2 py-1 text-left text-xs ${tone} ${d.uiNode === n.id ? "ring-2 ring-brass" : ""}`}
              style={{ left: `${n.gx}%`, top: `${n.gy}%` }}
            >
              <span className="block font-semibold">
                <span aria-hidden className="mr-1">{mark}</span>
                {hidden ? "Illegible" : n.name}
              </span>
              {!hidden && (
                <span className="block text-mist">{seamState(nodes, n)}</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-mist">● holding · ○ strained · — dark · × severed · ? unread</p>
      {machine && machine.specials.length > 0 && (
        <ul className="mt-4 space-y-2">
          {machine.specials.map((sp) => (
            <li key={sp.id}>
              <button type="button" className="min-h-11 w-full border border-brass-dim px-3 py-2 text-left" onClick={() => special(sp.id)}>
                <span className="block text-brass">{sp.label}</span>
                <span className="block text-sm text-mist">{sp.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function confidenceWord(n: GNode) {
  const c = confidenceOf(n);
  if (c === "confident") return "Confident";
  if (c === "understood") return "Understood";
  if (c === "observed") return "Observed";
  return "Unread";
}

function SeamRead({ nodes, n, c, fighting }: { nodes: GNode[]; n: GNode; c: number; fighting: boolean }) {
  if (!n.revealed) {
    return <p className="mb-3 text-sm">Unread. The relationship is still scrambled. Chalk, or another reading, can name it. A cut cannot.</p>;
  }
  const conf = confidenceOf(n);
  const parents = n.dependsOn.map((id) => {
    const parent = nodes.find((p) => p.id === id);
    if (!parent) return "a missing parent";
    if (!parent.revealed && conf !== "confident") return "an unread parent";
    const dead = parent.severed || !nodeLive(nodes, parent);
    return dead ? `${parent.name} (not holding)` : parent.name;
  });
  const kids = nodes.filter((o) => o.dependsOn.includes(n.id));
  const children =
    conf === "observed"
      ? "Not settled."
      : kids.length
        ? kids.map((k) => (k.revealed || conf === "confident" ? k.name : "an unread bond")).join(", ")
        : "Nothing in this graph hangs on it.";
  const load =
    conf === "observed"
      ? "Not settled."
      : n.effect === "none"
        ? "Load. It holds. It does not itself strike."
        : n.effect === "flow" && !kids.length
          ? "A flow. What it feeds is outside this drawing."
          : n.effect === "flow"
            ? "A flow. What hangs on it fails with it."
            : n.effect === "weapon"
              ? "A weapon mount."
              : n.effect === "motive"
                ? "The step."
                : n.effect === "life" || n.effect === "core"
                  ? "A living relationship."
                  : `It carries ${n.effect}.`;
  const doubt =
    conf === "confident"
      ? "You can hold a cut."
      : conf === "understood"
        ? "You know the consequence. The angle can still slip."
        : "Partial. Do not trust a cut yet.";
  const reach = n.density <= c ? "Within reach." : "Heavier than you. A reckless cut will burn.";
  const rows: [string, string][] = [
    ["Holds", `${n.name}. ${seamState(nodes, n)}.`],
    ["Parent", parents.length ? parents.join(", ") : "No parent in this graph."],
    ["Holds up", children],
    ["Load", load],
    ["Uncertainty", `${confidenceWord(n)}. ${doubt} ${reach}`],
  ];
  return (
    <div className="mb-3 border border-brass-dim bg-soot px-3 py-2 text-sm">
      <ul>
        {rows.map(([k, v]) => (
          <li key={k} className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-brass-dim/40 py-1 last:border-0">
            <span className="text-[10px] uppercase tracking-[0.16em] text-mist">{k}</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
      {n.integrity >= 40 && !nodeLive(nodes, n) && !n.severed && (
        <p className="mt-2 text-mist">Whole, and still dark. A dead parent already shut this off.</p>
      )}
      <p className="mt-2">{forecast(nodes, n)}{fighting ? " Unmend spends 4 action. Mend spends 3." : ""}</p>
    </div>
  );
}

function Meter({ label, n }: { label: string; n: number }) {
  const width = Math.min(100, n * 16);
  return (
    <div className="mt-1 flex items-center gap-2 text-xs">
      <span className="w-14 text-mist">{label}</span>
      <span className="h-1.5 flex-1 bg-soot">
        <span className="block h-1.5 bg-brass" style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}

export function CharSheet() {
  const d = useGame((s) => s.data);
  const spend = useGame((s) => s.spend);
  const auditSelf = useGame((s) => s.auditSelf);
  const c = comp(d);
  const next = xpForLevel(d.level + 1);
  return (
    <Shell title={d.name}>
      <p className="text-sm text-mist">
        Level {d.level} · {d.xp}/{next} xp · Comprehension {c} · Focus {d.focus} · Skill points {d.skillPoints}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{becoming(d)}</p>
      <p className="mt-1 text-sm">
        HP {d.player.hp}/{d.player.maxHp} · Scrip {d.scrip}
      </p>
      <h3 className="mt-4 font-display text-brass">What the hands remember</h3>
      <p className="mt-1 text-sm leading-relaxed">{habitLine(d)}</p>
      <h3 className="mt-4 font-display text-brass">Practice</h3>
      <p className="mt-1 text-xs text-mist">What the hands repeat. Not a class, and not a verdict.</p>
      <ul className="mt-2">
        {PRACTICE_VERBS.map((id) => (
          <li key={id} className="flex items-baseline justify-between gap-3 border-b border-brass-dim/40 py-1 text-sm">
            <span className="uppercase tracking-[0.14em] text-mist">{id}</span>
            <span className="text-brass">{practiceBand(d.verbs?.[id] ?? 0)}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 font-display text-brass">Observed</h3>
      {tendencies(d).length > 0 ? (
        <p className="mt-1 text-sm tracking-wide text-brass">{tendencies(d).join(" · ")}</p>
      ) : (
        <p className="mt-1 text-sm text-mist">Structure opens when you audit. Other lenses stay dark until a graph asks for them.</p>
      )}
      <ul className="mt-2 space-y-3">
        {lensReads(d).map((row) => (
          <li key={row.id}>
            <div className="text-xs uppercase tracking-wider text-brass">{LENS_NAME[row.id]}</div>
            <Meter label="See" n={row.perception} />
            <Meter label="Precise" n={row.precision} />
            <Meter label="Reach" n={row.reach} />
          </li>
        ))}
      </ul>
      {lensReads(d).length > 0 && (
        <p className="mt-2 text-xs text-mist">See, precision, and reach come from what you repeat. A severed bond still cannot be invented back.</p>
      )}
      <button type="button" className="mt-3 min-h-11 border border-brass px-3 text-brass" onClick={auditSelf}>
        Audit your own graph
      </button>
      <h3 className="mt-4 font-display text-brass">Attributes</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(d.player.attrs).map(([k, v]) => (
          <li key={k} className="border border-brass-dim px-2 py-2 text-sm capitalize">
            {k} <span className="float-right text-brass">{v}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 font-display text-brass">Disciplines</h3>
      <p className="mt-1 text-sm">{d.disciplines.map((id) => DOMAIN_NAME[id]).join(" · ")}</p>
      <h3 className="mt-4 font-display text-brass">Skills</h3>
      <ul className="mt-2 space-y-1">
        {SKILL_LIST.map((s) => (
          <li key={s.id} className="flex items-center gap-2 border border-brass-dim/60 px-2 py-1 text-sm">
            <span className="w-28">{s.name}</span>
            <span className="text-brass">{d.player.skills[s.id]}%</span>
            {d.player.tags.includes(s.id) && <span className="text-xs text-mist">tagged</span>}
            <button
              type="button"
              className="ml-auto min-h-11 min-w-11 border border-brass text-brass"
              onClick={() => spend(s.id)}
              disabled={d.skillPoints <= 0 || d.player.skills[s.id] >= 95}
              aria-label={`Improve ${s.name}`}
            >
              +
            </button>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 font-display text-brass">With you</h3>
      <p className="mt-1 text-xs text-mist">What they are doing. Not a grade.</p>
      <WithYou />
      <h3 className="mt-4 font-display text-brass">What is filed</h3>
      <p className="mt-1 text-xs text-mist">Facts the city can ask. Not a grade of you.</p>
      <ul className="mt-2 space-y-2 text-sm">
        {factionFacts(d).map((row) => (
          <li key={row.id} className="border-b border-brass-dim/40 py-1">
            <span className="text-brass">{FACTION_NAME[row.id]}</span>
            <p className="text-mist">{row.line}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function WithYou() {
  const d = useGame((s) => s.data);
  const giveKit = useGame((s) => s.giveKit);
  const mates = Object.values(d.actors).filter((a) => a.companion && a.alive);
  if (!mates.length) return <p className="mt-1 text-sm text-mist">Nobody is walking with you.</p>;
  const pack = (kind: "weapon" | "armor" | "accessory") =>
    d.inventory.filter((row) => {
      const def = ITEMS[row.id];
      if (!def || def.kind !== kind || row.qty < 1) return false;
      if (kind === "weapon" && d.equipped.weapon === row.id) return false;
      if (kind === "armor" && d.equipped.armor === row.id) return false;
      return true;
    });
  return (
    <ul className="mt-2 space-y-3">
      {mates.map((a) => {
        return (
          <li key={a.id} className="border border-brass-dim p-3 text-sm">
            <div className="font-display text-brass">
              {a.name} <span className="text-xs uppercase tracking-wider text-mist">{a.habit ?? "—"}</span>
            </div>
            <p className="mt-1 text-mist">
              {ITEMS[a.kit?.weapon ?? a.weapon]?.name ?? "Hands"}
              {" · "}
              {a.kit?.armor ? ITEMS[a.kit.armor]?.name : "No armor"}
              {" · "}
              {a.kit?.accessory ? ITEMS[a.kit.accessory]?.name : "No accessory"}
            </p>
            <ul className="mt-2 space-y-1 text-mist">
              {companyLines(d, a).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-2">
              {pack("weapon").map((row) => (
                <button key={`w-${row.id}`} type="button" className="min-h-11 border border-brass px-2 text-brass" onClick={() => giveKit(a.id, "weapon", row.id)}>
                  Give {ITEMS[row.id]?.name}
                </button>
              ))}
              {pack("armor").map((row) => (
                <button key={`a-${row.id}`} type="button" className="min-h-11 border border-brass px-2 text-brass" onClick={() => giveKit(a.id, "armor", row.id)}>
                  Give {ITEMS[row.id]?.name}
                </button>
              ))}
              {pack("accessory").map((row) => (
                <button key={`c-${row.id}`} type="button" className="min-h-11 border border-brass px-2 text-brass" onClick={() => giveKit(a.id, "accessory", row.id)}>
                  Give {ITEMS[row.id]?.name}
                </button>
              ))}
              {a.kit?.weapon && a.kit.weapon !== a.weapon && (
                <button type="button" className="min-h-11 border border-brass-dim px-2" onClick={() => giveKit(a.id, "weapon", null)}>
                  Take the weapon
                </button>
              )}
              {a.kit?.armor && (
                <button type="button" className="min-h-11 border border-brass-dim px-2" onClick={() => giveKit(a.id, "armor", null)}>
                  Take the armor
                </button>
              )}
              {a.kit?.accessory && (
                <button type="button" className="min-h-11 border border-brass-dim px-2" onClick={() => giveKit(a.id, "accessory", null)}>
                  Take the accessory
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function districtSentence(id: string, row: DistrictReading) {
  const water = row.water >= 70 ? "Water is seated." : row.water >= 25 ? "Water is moving, and it is not clean." : row.water > 0 ? "A little water is getting through." : "Water is not moving.";
  const heat = row.heat >= 70 ? "Heat reaches more than one room." : row.heat >= 25 ? "Heat is partial." : "Heat is out.";
  const food = row.food >= 70 ? "Food has a parent." : row.food >= 25 ? "Food is a ration, not a harvest." : "Food is not arriving.";
  const road = row.transport >= 60 ? "The road is carrying." : row.transport >= 25 ? "The road is hesitant." : "The road is not carrying.";
  const danger = row.danger >= 45 ? "The room is strained." : "The room is quiet.";
  if (id === "sinks") return `${water} ${road} ${danger}`;
  if (id === "haven") return `${water} ${food} ${row.commerce >= 50 ? "The stall is open." : "The stall is dark."} ${danger}`;
  if (id === "quarry") return `${road} ${row.power >= 40 ? "The colossus is still a parent." : "The colossus is not helping."} ${danger}`;
  if (id === "rust") return `${heat} ${row.water >= 40 ? "Quench is live." : "Quench is dry."} ${food}`;
  if (id === "citadel" || id === "tundra") return `${row.power >= 50 ? "Power is leaving the siphon." : "The siphon is not sending."} ${road}`;
  if (id === "road") return `${row.power >= 40 ? "The lamps have a parent." : "The lamps are dark."} ${road}`;
  return `${water} ${heat} ${food} ${road}`;
}

export function JournalPanel() {
  const d = useGame((s) => s.data);
  const deeds = d.deeds ?? [];
  const readings = d.journal.filter((j) => j.id.startsWith("read:"));
  const work = d.journal.filter((j) => !j.id.startsWith("read:"));
  return (
    <Shell title="Ledger">
      <h3 className="font-display text-brass">What happened</h3>
      {deeds.length === 0 && <p className="mt-1 text-sm text-mist">No room has been filed yet. The ledger will say what changed. It will not grade you.</p>}
      <ul className="mt-2 space-y-3">
        {deeds.map((deed) => (
          <DeedCard key={deed.id} deed={deed} />
        ))}
      </ul>
      <h3 className="mt-5 font-display text-brass">Open work</h3>
      {work.length === 0 && <p className="mt-1 text-sm text-mist">Nothing else is waiting.</p>}
      <ul className="mt-2 space-y-3">
        {work.map((j) => (
          <li key={j.id} className="border border-brass-dim p-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-brass">{j.title}</h3>
              <span className="text-xs uppercase tracking-wider text-mist">{j.status === "done" ? "noted" : j.status === "open" ? "still moving" : j.status}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{j.text}</p>
          </li>
        ))}
      </ul>
      {d.world && (
        <>
          <h3 className="mt-5 font-display text-brass">What the districts are holding</h3>
          <p className="mt-1 text-xs text-mist">Derived from the city graph. Not a score of you.</p>
          <ul className="mt-2 space-y-2">
            {Object.entries(d.world.districts).map(([id, row]) => (
              <li key={id} className="border border-brass-dim/60 px-2 py-2 text-sm">
                <span className="text-brass capitalize">{id}</span>
                <p className="text-mist">{districtSentence(id, row)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      {readings.length > 0 && (
        <>
          <h3 className="mt-5 font-display text-brass">Readings</h3>
          <p className="mt-1 text-xs text-mist">What you have learned about a graph. Not a finished job.</p>
          <ul className="mt-2 space-y-3">
            {readings.map((j) => (
              <li key={j.id} className="border border-brass-dim p-3">
                <h3 className="font-display text-brass">{j.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mist">{j.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Shell>
  );
}

function fateLine(fate: Fate) {
  if (fate === "dead") return "died";
  if (fate === "escaped") return "left the engagement";
  if (fate === "broken-open") return "came apart, and stayed";
  if (fate === "stood-down") return "stood down";
  return "still armed";
}

function baselineLine(mark: BaselineMark) {
  if (mark === "lost") return "Lost";
  if (mark === "altered") return "Altered";
  return "Preserved";
}

function DeedCard({ deed }: { deed: Deed }) {
  const people = deed.participants ?? [];
  const changes = deed.changes ?? [];
  const used = Object.entries(deed.used ?? {}).filter(([, n]) => (n ?? 0) > 0);
  return (
    <li className="sheet p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-mist">{deed.place}</p>
      <h3 className="font-display text-lg text-brass">{deed.title}</h3>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-mist">What happened</p>
      {people.length === 0 && <p className="mt-1 text-sm leading-relaxed">{deed.text}</p>}
      {people.map((person) => (
        <p key={person.id} className="mt-1 text-sm">
          {person.name} {fateLine(person.fate)}.
        </p>
      ))}
      {changes.map((change, index) => (
        <p key={`${change.nodeId}-${change.verb}-${index}`} className="mt-1 text-sm text-mist">
          <span className="uppercase tracking-[0.14em] text-brass">{change.verb}</span>. {change.edge}. {change.immediate}.
          {change.downstream ? ` ${change.downstream}` : ""}
        </p>
      ))}
      {(deed.world ?? []).map((line) => (
        <p key={line} className="mt-1 text-sm">
          {line}
        </p>
      ))}
      {deed.baseline && (
        <>
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-mist">Baseline</p>
          <p className={`stamp ${deed.baseline === "lost" ? "text-rust" : deed.baseline === "altered" ? "text-mist" : "text-brass"}`}>{baselineLine(deed.baseline)}</p>
        </>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-mist">Your hands</p>
      <p className="text-xs tracking-wide text-brass">{deed.approach || "No habit settled."}</p>
      {used.length > 0 && (
        <p className="mt-1 text-xs text-mist">In this room: {used.map(([id]) => id).join(", ")}.</p>
      )}
    </li>
  );
}

export function InventoryPanel() {
  const d = useGame((s) => s.data);
  const use = useGame((s) => s.equipOrUse);
  const dismantle = useGame((s) => s.dismantle);
  const worn = carryWeight(d);
  const cap = carryMax(d);
  return (
    <Shell title="Pack">
      <p className="mb-3 text-sm text-mist">
        {ITEMS[d.equipped.weapon]?.name ?? "Hands"} · {d.equipped.armor ? ITEMS[d.equipped.armor]?.name : "no coat"} · {d.scrip} scrip ·{" "}
        {worn}/{cap} weight
        {worn > cap ? " · overburdened" : ""}
      </p>
      <ul className="space-y-2">
        {d.inventory.map((row) => {
          const def = ITEMS[row.id];
          if (!def) return null;
          const condition = row.condition ?? 100;
          return (
            <li key={row.id} className="border border-brass-dim p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-brass">
                    {def.name}
                    {row.qty > 1 ? ` ×${row.qty}` : ""}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-mist">
                    {def.kind} · {def.weight ?? 1} wt · {def.value ?? 0} scrip
                    {def.kind === "weapon" || def.kind === "armor" ? ` · condition ${condition}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-mist">{def.desc}</p>
                  {def.parts && <p className="mt-1 text-xs text-brass">Parts: {def.parts.join(" · ")}</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {def.kind !== "quest" && def.kind !== "part" && def.kind !== "junk" && (
                    <button type="button" className="min-h-11 border border-brass px-3 text-sm text-brass" onClick={() => use(row.id)}>
                      {def.kind === "consumable" ? "Use" : "Equip"}
                    </button>
                  )}
                  {def.yield && (
                    <button type="button" className="min-h-11 border border-rust px-3 text-sm text-rust" onClick={() => dismantle(row.id)}>
                      Dismantle
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

export function MapPanel() {
  const d = useGame((s) => s.data);
  const travel = useGame((s) => s.travel);
  return (
    <Shell title="Stack roads">
      <p className="mb-3 text-sm text-mist">You are in {MAPS[d.mapId]?.name}. The ledger can jump a throat you already know. The campaign is the walk between mouths.</p>
      <p className="mb-3 border border-brass-dim px-3 py-2 text-sm leading-relaxed">{districtYield(d)}</p>
      <ul className="space-y-2">
        {REGIONS.map((r) => {
          const open = regionOpen(d, r.need);
          const here = r.id === d.mapId;
          return (
            <li key={r.id}>
              <button
                type="button"
                disabled={!open || here}
                onClick={() => travel(r.id)}
                className="min-h-11 w-full border border-brass-dim px-3 py-2 text-left disabled:opacity-50"
              >
                <span className="block font-display text-brass">
                  {r.name} <span className="text-xs text-mist">{r.act}</span>
                </span>
                <span className="block text-sm text-mist">
                  {here ? "You are here." : open ? r.blurb : "Sealed. The chit is not signed."}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

export function MenuPanel() {
  const d = useGame((s) => s.data);
  const save = useGame((s) => s.save);
  const load = useGame((s) => s.load);
  const list = useGame((s) => s.listSaves);
  const quit = useGame((s) => s.quit);
  const open = useGame((s) => s.openPanel);
  const setPref = useGame((s) => s.setPref);
  const slots = list();
  const text = d.flags.uiText === "lg" ? "large" : d.flags.uiText === "sm" ? "small" : "field";
  return (
    <Shell title="Field notes">
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 border border-brass px-3 text-brass" onClick={() => open("help")}>
          How to read
        </button>
        <button type="button" className="min-h-11 border border-brass px-3 text-brass" onClick={() => open("char")}>
          Character
        </button>
        <button type="button" className="min-h-11 border border-brass px-3 text-brass" onClick={() => open("journal")}>
          Quests
        </button>
        <button type="button" className="min-h-11 border border-brass-dim px-3 text-mist" onClick={() => open("tools")}>
          Field tools
        </button>
        <button
          type="button"
          className="min-h-11 border border-brass-dim px-3 text-mist"
          onClick={() => setPref("uiText", d.flags.uiText === "md" || !d.flags.uiText ? "lg" : d.flags.uiText === "lg" ? "sm" : "md")}
        >
          Text {text}
        </button>
        <button type="button" className="min-h-11 border border-brass-dim px-3 text-mist" onClick={() => setPref("reduceMotion", !d.flags.reduceMotion)}>
          Motion {d.flags.reduceMotion ? "reduced" : "full"}
        </button>
      </div>
      {!d.ironman && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 bg-brass px-3 font-semibold text-soot" onClick={() => save("slot1")}>
            Save slot 1
          </button>
          <button type="button" className="min-h-11 bg-brass px-3 font-semibold text-soot" onClick={() => save("slot2")}>
            Save slot 2
          </button>
          <button type="button" className="min-h-11 bg-brass px-3 font-semibold text-soot" onClick={() => save("slot3")}>
            Save slot 3
          </button>
        </div>
      )}
      {d.ironman && <p className="mb-3 text-sm text-rust">Ironman. The auto-ledger is the only one, and death closes it.</p>}
      {d.combat && (
        <p className="mb-3 text-sm text-brass">
          Round {d.combat.round}, {d.player.ap} action left. Filing now keeps the graph, the cuts, and where everyone stands.
        </p>
      )}
      <ul className="space-y-2">
        {slots.map((s) => (
          <li key={s.id}>
            <button type="button" className="min-h-11 w-full border border-brass-dim px-3 text-left" onClick={() => load(s.id)} disabled={d.ironman && s.id !== "auto"}>
              <span className="text-brass">{s.id}</span> · {s.label}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-4 min-h-11 border border-rust px-3 text-rust" onClick={quit}>
        Close the ledger
      </button>
    </Shell>
  );
}

export function HelpPanel() {
  return (
    <Shell title="How to read a city">
      <div className="space-y-3 text-sm leading-relaxed">
        <p>Tap the ground to walk. Tap a person to speak. Tap a machine to audit it. Near and Far change how much of the district you hold in view.</p>
        <p>On the floor, a machine wears a mark. A hollow square is unread. A brass dot is live. A triangle is stressed. A cross is severed. A pale square is pinned. A dash is spent. The shape is the fact. The color is only a second telling.</p>
        <p>The Sinks bellows is a parent of the pump. Stop the lung and a perfect valve still leaves Oakhaven dry. In the quarry the colossus throat parents the crane cable. In the citadel the orrery is a child of the siphon: if the engine stops sending, the rings stop.</p>
        <p>Brass diamonds on the floor are mouths. Step onto one and you walk: Sinks to the stack road, the road to the ward, the quarry, Rust, the tundra, the citadel, the Spire. The ledger can still jump a throat you already know. Coming back is not the same room. A reed moth nests on the bellows. She is not assigned. Feed her, then hold still.</p>
        <p>Audit shows relationships, not hit points. A parent that dies takes function from its children even when their integrity stays whole: a pressure chamber is why a rifle fires, a power coupling is why a servo walks. Observed means you have a name. Understood means you know the consequence. Confident means the cut is as safe as a cut gets.</p>
        <p>
          <strong className="text-brass">Mend</strong> restores a thing toward a known baseline and spends focus. A thin baseline can come back wrong. Bandages and the bench binding are medicine. The bench can also reseat a worn weapon.
        </p>
        <p>
          <strong className="text-rust">Unmend</strong> asks you to confirm, then cuts one relationship. The ledger names the cascade. Steam leaves a weapon that loses its feed. A failed cut still spends focus and action, and a bad miss can ring the lens.
        </p>
        <p>Brace spends your action to blunt the next hit. Junk in the pack can be dismantled into scrap. You can file the ledger in the middle of a fight. The engagement comes back as you left it.</p>
        <p>The Sinks pump can be mended, bled, bought around, handed to Wren, or unlocked by cutting the Bureau seal. The south plate can be talked past, walked around through the grate, or fought. The yard crane above that fight hangs an engine on a cable. The quarry crane hangs a slab the same way. One cut does not peel a layered suit.</p>
        <p>If a system's density is higher than your comprehension, the attempt burns you. Leveling and the Audit skill raise what you can hold.</p>
        <p>In a fight you have action points. End the turn when you are finished looking. The line under your name is what they mean to do next if you leave the board alone. Cut the parent, step out of reach, or break the leg they were counting on, and the line goes dull. When every mounted weapon in the engagement is dark, you can ask them to stand down.</p>
        <p>What you repeat becomes a habit, not a class. Four times at a verb and the hands get better at that kind of work, and the habits mix. Self shows only the lenses you have actually used: structure from reading and cutting, then flow, intent, and the rest when a graph asks. See, precision, and reach change what you can perceive and how far a mend travels. They are not a damage ladder.</p>
        <p>The Sinks pump is a parent of the district. Mend it, bleed it, flood it, or cut the Bureau lockout, and what the district can produce changes. The map names the yield. Oakhaven's lower ward has no well. Its cistern drinks from that pump. You can send the feed to the stall, to the clinic, or seat both. People up there will say which parent they still have. A pricing clerk can stamp brown water. He cannot invent clean.</p>
        <p>The ledger will not grade you. When an engagement ends it files who stood down, which relationship changed, and whether that baseline is still recoverable. Leaving a fight unfinished writes nothing. A captain who is only broken open is not filed until you choose. Readings are what you learned, separate from the jobs. People who were there can be asked. They remember the fact, not a score.</p>
      </div>
    </Shell>
  );
}

export function ToolsPanel() {
  const dev = useGame((s) => s.dev);
  const row = (cmd: string, label: string) => (
    <button type="button" className="min-h-11 w-full border border-brass-dim px-3 text-left text-sm" onClick={() => dev(cmd)}>
      {label}
    </button>
  );
  return (
    <Shell title="Field tools">
      <p className="mb-3 text-sm text-mist">Maintainer overrides. They write the ledger. They are not a story.</p>
      <div className="grid gap-2">
        {row("focus", "Fill cognitive focus")}
        {row("heal", "Restore your pulse")}
        {row("reveal", "Make every seam on this floor legible")}
        {row("crack", "Crack your tool haft")}
        {row("pump", "Stand beside the district pump")}
        {row("gate", "Stand at the checkpoint door")}
        {row("rifle", "Put a tired steam rifle in the pack")}
        {row("sign", "Sign the Sinks chit and open the roads")}
        {row("brawl", "Call Varr alone on the south plate")}
        {row("kael", "Open the quarry beside Kael")}
      </div>
    </Shell>
  );
}

export function LevelModal() {
  const d = useGame((s) => s.data);
  const ack = useGame((s) => s.ackLevel);
  if (!d.pendingLevel) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-soot/70 p-4">
      <div className="ledger w-full max-w-md p-5">
        <h2 className="font-display text-2xl text-brass">Comprehension deepens</h2>
        <p className="mt-2 text-sm">
          Level {d.level}. You can hold a denser diagram. Skill points are waiting on your character sheet. Current comprehension {comprehension(d.player.attrs, d.player.skills.audit, d.level)}.
        </p>
        <button type="button" className="mt-4 min-h-11 bg-brass px-4 font-semibold text-soot" onClick={ack}>
          File it
        </button>
      </div>
    </div>
  );
}

export function DialogueBox() {
  const d = useGame((s) => s.data);
  const choose = useGame((s) => s.choose);
  if (!d.dialogue) return null;
  const replies = visibleReplies(d);
  const node = replies && d.dialogue;
  if (!node) return null;
  const convo = d.dialogue;
  const speakerId = speakerOf(d, convo.convo, convo.node);
  const remembered =
    convo.convo.startsWith("varr-memory") ||
    convo.convo.startsWith("checkpoint-") ||
    convo.node.startsWith("checkpoint");
  return (
    <div className="pointer-events-auto absolute inset-x-2 bottom-2 z-40 max-h-[calc(100%-0.5rem)] overflow-y-auto overscroll-contain">
      <div className="ledger rivet mx-auto flex max-w-3xl gap-3 p-3">
        {speakerId.portrait ? (
          <img src={speakerId.portrait} alt="" className="hidden h-24 w-24 shrink-0 border border-brass-dim object-cover object-top sm:block" />
        ) : (
          <div className="hidden h-24 w-24 shrink-0 items-center justify-center border border-brass-dim sm:flex">
            <BookOpen className="size-6 text-brass" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-brass">{speakerId.name}</h3>
          {remembered && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brass">Filed. The room still holds it.</p>}
          <p className="mt-1 text-sm leading-relaxed">{speakerId.text}</p>
          <ul className="mt-3 space-y-2">
            {replies.map((r, i) => (
              <li key={i}>
                <button type="button" className="min-h-11 w-full border border-brass-dim px-3 py-2 text-left text-sm hover:border-brass" onClick={() => choose(i)}>
                  {r.text}
                  {r.check && (
                    <span className="mt-1 block text-xs text-brass">
                      {r.check.skill} {d.player.skills[r.check.skill]}% · chance {checkChance(d.player.skills[r.check.skill], r.check.dc)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function speakerOf(d: Data, convo: string, nodeId: string) {
  const node = CONVOS[convo]?.nodes[nodeId];
  const speaker = node?.speaker ?? "narrator";
  const actor = speaker === "player" ? d.player : d.actors[speaker];
  return {
    name: speaker === "narrator" ? "Ledger" : actor?.name ?? speaker,
    portrait: speaker === "narrator" ? null : actor?.portrait ?? null,
    text: (node?.text ?? "").replaceAll("{name}", d.name),
  };
}
