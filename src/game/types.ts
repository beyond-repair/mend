export type Attr = "body" | "finesse" | "mind" | "will" | "presence" | "perception";

export type SkillId =
  | "engineering"
  | "medicine"
  | "science"
  | "audit"
  | "survival"
  | "mechanics"
  | "speech"
  | "barter"
  | "sneak"
  | "lockwork"
  | "history"
  | "psychology";

export type Domain = "matter" | "biology" | "mind" | "causal" | "continuity";

export type Faction = "bureau" | "unbound" | "relsec" | "ash" | "engineers";

export type EffectKey =
  | "none"
  | "armor"
  | "weapon"
  | "motive"
  | "spell"
  | "life"
  | "flow"
  | "core";

export interface Attrs {
  body: number;
  finesse: number;
  mind: number;
  will: number;
  presence: number;
  perception: number;
}

export type Confidence = "unknown" | "observed" | "understood" | "confident";

export interface GNode {
  id: string;
  name: string;
  domain: Domain;
  tier: "bond" | "anchor" | "stress" | "obfuscated";
  integrity: number;
  density: number;
  baseline: number;
  dependsOn: string[];
  effect: EffectKey;
  severed: boolean;
  revealed: boolean;
  decoy?: boolean;
  pinned?: boolean;
  /** How well Silas has read this seam. Missing on old ledgers means observed if revealed. */
  confidence?: Confidence;
  /** When this node loses function, the world reacts. Not a boss script. */
  fail?: "crush";
  /** A one-shot failure (a dropped load) has already happened. */
  spent?: boolean;
  /** Shared shape. A later audit can recognize it. Not a skill. */
  pattern?: string;
  gx: number;
  gy: number;
}

export interface Actor {
  id: string;
  template: string;
  name: string;
  title: string;
  portrait: string;
  sprite: string;
  scale: number;
  mapId: string;
  x: number;
  y: number;
  home: { mapId: string; x: number; y: number };
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  attrs: Attrs;
  skills: Record<SkillId, number>;
  tags: SkillId[];
  nodes: GNode[];
  faction: Faction;
  hostile: boolean;
  aggro: boolean;
  alive: boolean;
  companion: boolean;
  convo: string;
  downConvo?: string;
  weapon: string;
  stunned: boolean;
  /** Set when the player spends the turn bracing. The next hit is blunted, then this clears. */
  guarding?: boolean;
  polymorphic: boolean;
  tier: number;
  vision: number;
  /** How this person fights when they walk with Silas. Missing on old ledgers until the next reconcile. */
  habit?: Habit;
  /** Their own loadout. Not the player's pack. */
  kit?: CompanionKit;
  /** Not a moral grade. Five facts about the relationship. */
  bond?: CompanionBond;
  /** Facts they have already counted. Ids, not prose. */
  memories?: string[];
}

export type Habit = "brace" | "pin" | "read" | "cover" | "press";

export interface CompanionKit {
  weapon: string;
  armor: string | null;
  accessory: string | null;
}

export interface CompanionBond {
  trust: number;
  respect: number;
  fear: number;
  accord: number;
  loyalty: number;
}

export type ItemKind = "weapon" | "armor" | "consumable" | "quest" | "part" | "junk" | "accessory";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  desc: string;
  melee?: boolean;
  range?: number;
  damage?: number;
  heal?: number;
  focus?: number;
  resist?: number;
  weight?: number;
  value?: number;
  condition?: number;
  /** Named sub-assemblies. Severing a parent in a graph is separate; these are the readable parts of gear. */
  parts?: string[];
  /** What dismantle returns, one each. */
  yield?: string[];
  /** On a hit, pin one revealed live weapon, flow, or motive seam instead of only dealing harm. */
  pin?: boolean;
  /** Costs a step of action. A choice, not a bigger number. */
  heavy?: boolean;
  /** The brass ice stops billing the walk. Not a thicker plate. */
  ice?: boolean;
}

export interface InvItem {
  id: string;
  qty: number;
  /** 0–100. Missing means pristine. Worn gear hits softer. */
  condition?: number;
}

export interface Machine {
  id: string;
  template: string;
  name: string;
  mapId: string;
  x: number;
  y: number;
  sprite: string;
  nodes: GNode[];
  specials: { id: string; label: string; text: string }[];
  baseline: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  status: "open" | "done" | "failed";
}

/** What a room became. A history, not a score. Old ledgers may only have the display fields. */
export type Fate = "stood-down" | "dead" | "broken-open" | "escaped" | "unresolved";

/** Whether the previous coherent configuration can still be returned to. Not a moral grade. */
export type BaselineMark = "preserved" | "altered" | "lost";

export interface GraphChange {
  ownerId: string;
  ownerName: string;
  verb: "cut" | "mend" | "repair";
  /** Who did it. "player" or an actor name. */
  by: string;
  nodeId: string;
  nodeName: string;
  /** The relationship that moved, e.g. "Pressure chamber → Rifle". */
  edge: string;
  immediate: string;
  downstream?: string;
}

export interface EncounterPerson {
  id: string;
  name: string;
  fate: Fate;
  weaponAtStart: boolean;
  weaponAtEnd: boolean;
}

export interface Deed {
  id: string;
  seq: number;
  title: string;
  place: string;
  text: string;
  approach: string;
  mapId?: string;
  /** Stable room identity, e.g. sinks:varr. A later meeting of the same person reuses their id. */
  encounterId?: string;
  participants?: EncounterPerson[];
  changes?: GraphChange[];
  baseline?: BaselineMark;
  /** Verbs used in this room, not lifetime practice. */
  used?: Partial<Record<Verb, number>>;
  resolved?: boolean;
  /** What the map is allowed to remember. Facts, not a grade. */
  world?: string[];
}

/** A room that has changed shape but has not been chosen yet. */
export interface PendingEncounter {
  mapId: string;
  roster: string[];
  changes: GraphChange[];
  escapes: string[];
  verbMark?: Partial<Record<Verb, number>>;
  weaponsAtStart: Record<string, boolean>;
  closing?: string;
}

export interface GameMap {
  id: string;
  name: string;
  act: string;
  width: number;
  height: number;
  rows: string[];
  entry: { x: number; y: number };
  theme: "sinks" | "quarry" | "rust" | "citadel" | "spire" | "road" | "haven";
}

export type Panel =
  | "none"
  | "char"
  | "journal"
  | "inventory"
  | "map"
  | "audit"
  | "menu"
  | "help"
  | "level"
  | "tools";

export interface DialogueState {
  convo: string;
  node: string;
}

export type Verb =
  | "fight"
  | "audit"
  | "cut"
  | "mend"
  | "repair"
  | "sneak"
  | "negotiate"
  | "threaten"
  | "barter"
  | "sabotage"
  | "craft"
  | "brace"
  | "rescue"
  | "redirect";

/** What Silas has learned to perceive. Not a class, and not the same thing as a seam's domain. */
export type Lens =
  | "structure"
  | "flow"
  | "biology"
  | "mind"
  | "social"
  | "intent"
  | "causality"
  | "continuity";

/** Graph events a verb tally cannot name by itself. Old ledgers omit this. */
export type TraceKey = "flow" | "biology" | "mind" | "intent" | "cascade" | "continuity";

export interface Opening {
  kind: "strike" | "close" | "repair" | "brace" | "cut";
  target: string;
  weaponId: string;
  nodeName: string;
  thenStrike: boolean;
}

export interface CombatState {
  order: string[];
  index: number;
  round: number;
  audited: string[];
  /** Frozen when your turn starts. Their next action if the board stays this shape. */
  plans?: Record<string, Opening>;
  tally?: { strikes: number; cuts: number; mends: number; kills: number };
  /** Everyone the engagement started with. Order drops the dead; this does not. */
  roster?: string[];
  /** Relationship changes during this engagement. Not a completed history until the room resolves. */
  changes?: GraphChange[];
  escapes?: string[];
  /** Verb counts at the moment the engagement opened. */
  verbMark?: Partial<Record<Verb, number>>;
  /** Whether each roster weapon was live when the engagement opened. */
  weaponsAtStart?: Record<string, boolean>;
}

export type Intent =
  | { type: "talk"; id: string }
  | { type: "audit"; id: string; kind: "actor" | "machine" }
  | { type: "strike"; id: string }
  | { type: "door"; convo: string; x: number; y: number }
  | null;

export type AuditTarget =
  | { kind: "actor"; id: string }
  | { kind: "machine"; id: string }
  | null;

export type Effect =
  | { op: "flag"; key: string; value: string | number | boolean }
  | { op: "xp"; n: number }
  | { op: "scrip"; n: number }
  | { op: "item"; id: string; n?: number }
  | { op: "take"; id: string; n?: number }
  | { op: "journal"; id: string; title: string; text: string; status: "open" | "done" | "failed" }
  | { op: "log"; text: string }
  | { op: "combat"; ids: string[] }
  | { op: "heal"; id: string; n: number }
  | { op: "hurt"; id: string; n: number }
  | { op: "recruit"; id: string }
  | { op: "dismiss"; id: string }
  | { op: "discipline"; id: Domain }
  | { op: "rep"; faction: Faction; n: number }
  | { op: "aggro"; ids: string[]; on: boolean }
  | { op: "hostile"; id: string; on: boolean }
  | { op: "kill"; id: string }
  | { op: "arrive" }
  | { op: "rest" }
  | { op: "goto"; map: string; x: number; y: number }
  | { op: "spawn"; template: string; id: string; x: number; y: number }
  | { op: "epilogue"; ending: "impose" | "release" }
  | { op: "pin"; text: string };

/** Facts a later system can ask. Not a score. */
export type HistoryQuery =
  | { ask: "encounter"; id: string }
  | { ask: "stood-down"; id: string }
  | { ask: "died"; id: string }
  | { ask: "escaped"; id: string }
  | { ask: "severed"; owner: string; node: string }
  | { ask: "baseline-lost"; id?: string }
  | { ask: "preserved"; id: string }
  | { ask: "verb"; verb: Verb; id?: string }
  /** Latest fate of this person. Present tense. Earlier fates stay in the deeds. */
  | { ask: "now"; id: string; fate: Fate }
  /** Who holds the checkpoint after a filed room. Vacant is a vacancy, not a verdict. */
  | { ask: "checkpoint"; lead: "varr" | "vacant" };

export type Cond =
  | { flag: string; is: string | number | boolean }
  | { flag: string; truthy: true }
  | { missing: string }
  | { skill: SkillId; gte: number }
  | { discipline: Domain }
  | { item: string }
  | { scrip: number }
  | { companion: string }
  | { noCompanion: true }
  | { history: HistoryQuery };

export interface Reply {
  text: string;
  requires?: Cond[];
  check?: { skill: SkillId; dc: number };
  goto?: string;
  failGoto?: string;
  effects?: Effect[];
  failEffects?: Effect[];
  end?: boolean;
  jump?: { convo: string; node: string };
}

export interface DNode {
  speaker: string;
  text: string;
  replies: Reply[];
}

export interface Convo {
  start: string;
  nodes: Record<string, DNode>;
}

/** A district, as the world graph currently holds it. Numbers are derived, not a score. */
export interface DistrictReading {
  water: number;
  heat: number;
  power: number;
  food: number;
  security: number;
  commerce: number;
  transport: number;
  danger: number;
}

/** Derived every reconcile from machines, deeds, and choices. Old ledgers omit it until the next reconcile. */
export interface WorldSnapshot {
  live: Record<string, boolean>;
  districts: Record<string, DistrictReading>;
}

export interface Data {
  phase: "title" | "create" | "play" | "epilogue" | "dead";
  ironman: boolean;
  name: string;
  mapId: string;
  player: Actor;
  actors: Record<string, Actor>;
  machines: Record<string, Machine>;
  flags: Record<string, string | number | boolean>;
  journal: JournalEntry[];
  /** Rooms that have already changed. Missing on old ledgers. */
  deeds?: Deed[];
  pinned: string;
  inventory: InvItem[];
  equipped: { weapon: string; armor: string | null };
  scrip: number;
  xp: number;
  level: number;
  skillPoints: number;
  focus: number;
  disciplines: Domain[];
  reputation: Record<Faction, number>;
  log: string[];
  dialogue: DialogueState | null;
  panel: Panel;
  combat: CombatState | null;
  /** Relationship changes held until a downed person chooses. Not a completed history. */
  pendingEncounter?: PendingEncounter | null;
  path: { x: number; y: number }[];
  intent: Intent;
  audit: AuditTarget;
  uiNode: string | null;
  pendingMap: string | null;
  pendingLevel: boolean;
  ending: "impose" | "release" | null;
  epilogue: string[];
  deathText: string;
  hasSave: boolean;
  /** Isometric scale. 0.8 far, 1 field, 1.25 near. */
  zoom?: number;
  /** What Silas actually repeats. A habit, not a class. Old ledgers may omit it. */
  verbs?: Partial<Record<Verb, number>>;
  /** Downstream and off-verb practice. Derived lenses read this. Old ledgers may omit it. */
  traces?: Partial<Record<TraceKey, number>>;
  /** The city as one machine. Filled by reconcile. Missing on old ledgers until the next load. */
  world?: WorldSnapshot;
  draft: {
    name: string;
    attrs: Attrs;
    pool: number;
    tags: SkillId[];
  };
}
