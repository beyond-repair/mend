import { create } from "zustand";
import { play } from "./audio";
import { equipCompanion } from "./companions";
import { allSkills, maxFocus, maxHp } from "./formulas";
import {
  actorAt,
  addLog,
  applyEffects,
  arrive,
  checkVision,
  comp,
  currentNode,
  dist,
  endPlayerTurn,
  depart,
  freshActors,
  freshMachines,
  grantXp,
  isExit,
  machineAt,
  mendNode,
  movePlayer,
  openAudit,
  pathNear,
  pathTo,
  regionOpen,
  replyVisible,
  refuseWalk,
  runSpecial,
  startCombat,
  strike,
  unmendNode,
  useItem,
  walkable,
  spendSkill,
  brace,
  dismantle,
  gait,
  weaponOf,
  noteVerb,
  standDown,
  freezeIntents,
  memoryConvo,
  noteField,
  reconcileWorld,
} from "./logic";
import { LOCKED_DOORS, MAPS } from "./maps";
import type { Actor, Attr, AuditTarget, Data, GNode, Panel, SkillId } from "./types";

const SAVE_PREFIX = "mend-save-v1-";

function blankActor(): Actor {
  const attrs = { body: 4, finesse: 4, mind: 4, will: 4, presence: 4, perception: 4 };
  return {
    id: "player",
    template: "player",
    name: "Silas Vance",
    title: "Patch",
    portrait: "/game/portraits/silas.jpg",
    sprite: "/game/sprites/silas.png",
    scale: 1,
    mapId: "sinks",
    x: 3,
    y: 3,
    home: { mapId: "sinks", x: 3, y: 3 },
    hp: 30,
    maxHp: 30,
    ap: 0,
    maxAp: 8,
    attrs,
    skills: allSkills(attrs, []),
    tags: [],
    nodes: [],
    faction: "unbound",
    hostile: false,
    aggro: false,
    alive: true,
    companion: false,
    convo: "",
    weapon: "prybar",
    stunned: false,
    guarding: false,
    polymorphic: false,
    tier: 0,
    vision: 0,
  };
}

function initialData(): Data {
  return {
    phase: "title",
    ironman: false,
    name: "Silas Vance",
    mapId: "sinks",
    player: blankActor(),
    actors: {},
    machines: {},
    flags: {},
    journal: [],
    deeds: [],
    pinned: "",
    inventory: [],
    equipped: { weapon: "prybar", armor: null },
    scrip: 0,
    xp: 0,
    level: 1,
    skillPoints: 0,
    focus: 10,
    disciplines: ["matter"],
    reputation: { bureau: 0, unbound: 0, relsec: 0, ash: 0, engineers: 0 },
    log: [],
    dialogue: null,
    panel: "none",
    combat: null,
    path: [],
    intent: null,
    audit: null,
    uiNode: null,
    pendingMap: null,
    pendingLevel: false,
    ending: null,
    epilogue: [],
    deathText: "",
    hasSave: false,
    zoom: 1.25,
    verbs: {},
    draft: {
      name: "Silas Vance",
      attrs: { body: 4, finesse: 4, mind: 4, will: 4, presence: 4, perception: 4 },
      pool: 12,
      tags: [],
    },
  };
}

function playerNodes(): GNode[] {
  return [
    {
      id: "haft",
      name: "Tool haft",
      domain: "matter",
      tier: "bond",
      integrity: 100,
      density: 2,
      baseline: 92,
      dependsOn: [],
      effect: "weapon",
      severed: false,
      revealed: true,
      gx: 28,
      gy: 40,
    },
    {
      id: "knees",
      name: "Tendon line",
      domain: "biology",
      tier: "bond",
      integrity: 100,
      density: 3,
      baseline: 84,
      dependsOn: [],
      effect: "motive",
      severed: false,
      revealed: false,
      gx: 70,
      gy: 62,
    },
    {
      id: "lens",
      name: "Audit lens",
      domain: "matter",
      tier: "anchor",
      integrity: 100,
      density: 3,
      baseline: 96,
      dependsOn: [],
      effect: "none",
      severed: false,
      revealed: true,
      gx: 48,
      gy: 22,
    },
  ];
}

export interface SaveSlot {
  id: string;
  label: string;
  when: number;
}

interface Store {
  data: Data;
  boot: () => void;
  setIronman: (v: boolean) => void;
  openCreate: () => void;
  setDraftName: (name: string) => void;
  draftAttr: (id: Attr, dir: 1 | -1) => void;
  toggleTag: (id: SkillId) => void;
  recommend: () => void;
  startNew: () => void;
  listSaves: () => SaveSlot[];
  save: (slot: string) => void;
  load: (slot: string) => void;
  quit: () => void;
  closePanel: () => void;
  openPanel: (p: Panel) => void;
  clickTile: (x: number, y: number) => void;
  step: () => void;
  choose: (index: number) => void;
  endTurn: () => void;
  strikeNearest: () => void;
  talkNearest: () => void;
  auditNearest: () => void;
  selectNode: (id: string) => void;
  mend: () => void;
  unmend: () => void;
  pinSeam: () => void;
  special: (id: string) => void;
  equipOrUse: (id: string) => void;
  giveKit: (id: string, slot: "weapon" | "armor" | "accessory", itemId: string | null) => void;
  spend: (id: SkillId) => void;
  travel: (mapId: string) => void;
  ackLevel: () => void;
  brace: () => void;
  dismantle: (id: string) => void;
  standDown: () => void;
  auditSelf: () => void;
  setZoom: (dir: 1 | -1) => void;
  setPref: (key: "uiText" | "reduceMotion", value: string | boolean) => void;
  dev: (cmd: string) => void;
}

function readSlot(id: string): { label: string; when: number; data: Data } | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(SAVE_PREFIX + id);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { version: number; label: string; savedAt: number; data: Data };
    if (parsed.version !== 1 || !parsed.data) return null;
    return { label: parsed.label, when: parsed.savedAt, data: parsed.data };
  } catch {
    return null;
  }
}

function writeSlot(id: string, data: Data) {
  if (typeof localStorage === "undefined") return;
  const label = `${data.name} · ${MAPS[data.mapId]?.name ?? "road"} · L${data.level}${data.combat ? ` · round ${data.combat.round}` : ""}`;
  localStorage.setItem(
    SAVE_PREFIX + id,
    JSON.stringify({ version: 1, label, savedAt: Date.now(), data }),
  );
}

function commit(
  set: (fn: (s: Store) => Partial<Store>) => void,
  fn: (d: Data) => void,
  saveMode: "auto" | "none" = "auto",
) {
  set((s) => {
    const data = structuredClone(s.data);
    fn(data);
    if (data.phase === "play" || data.phase === "epilogue") reconcileWorld(data);
    if (data.phase === "dead" && data.ironman) localStorage.removeItem(SAVE_PREFIX + "auto");
    else if (saveMode === "auto" && (data.phase === "play" || data.phase === "epilogue")) writeSlot("auto", data);
    data.hasSave = Boolean(readSlot("auto"));
    return { data };
  });
}

function convoFor(d: Data, a: Actor) {
  if (a.companion && d.mapId === "road") {
    if (a.id === "tobin" || a.id === "wren" || a.id === "sera" || a.id === "mara") return `${a.id}-road`;
  }
  if (a.id === "tobin" && d.flags.metTobin) return "tobin-after";
  return memoryConvo(d, a.id) ?? a.convo;
}

function openTalk(d: Data, a: Actor) {
  if (!a.alive) return;
  if (d.combat) {
    if (a.hostile) strike(d, d.player, a);
    return;
  }
  if (a.hostile && a.aggro) {
    startCombat(d, [a.id]);
    return;
  }
  d.dialogue = { convo: convoFor(d, a), node: "start" };
  d.panel = "none";
  play("talk");
}

function myTurn(d: Data) {
  if (!d.combat) return true;
  return d.combat.order[d.combat.index] === "player";
}

export const useGame = create<Store>((set, get) => ({
  data: initialData(),
  boot: () => {
    const has = Boolean(readSlot("auto") || readSlot("slot1") || readSlot("slot2"));
    set((s) => ({ data: { ...s.data, hasSave: has } }));
  },
  setIronman: (v) => set((s) => ({ data: { ...s.data, ironman: v } })),
  openCreate: () => set((s) => ({ data: { ...s.data, phase: "create" } })),
  setDraftName: (name) =>
    set((s) => ({ data: { ...s.data, draft: { ...s.data.draft, name: name.slice(0, 24) } } })),
  draftAttr: (id, dir) =>
    set((s) => {
      const draft = { ...s.data.draft, attrs: { ...s.data.draft.attrs } };
      const next = draft.attrs[id] + dir;
      if (dir > 0 && (draft.pool <= 0 || next > 9)) return {};
      if (dir < 0 && next < 3) return {};
      draft.attrs[id] = next;
      draft.pool -= dir;
      return { data: { ...s.data, draft } };
    }),
  toggleTag: (id) =>
    set((s) => {
      const tags = [...s.data.draft.tags];
      const i = tags.indexOf(id);
      if (i >= 0) tags.splice(i, 1);
      else if (tags.length < 3) tags.push(id);
      return { data: { ...s.data, draft: { ...s.data.draft, tags } } };
    }),
  recommend: () =>
    set((s) => ({
      data: {
        ...s.data,
        draft: {
          name: s.data.draft.name || "Silas Vance",
          attrs: { body: 4, finesse: 5, mind: 8, will: 6, presence: 5, perception: 8 },
          pool: 0,
          tags: ["audit", "engineering", "speech"],
        },
      },
    })),
  startNew: () =>
    commit(set, (d) => {
      const { attrs, tags, name } = d.draft;
      const skills = allSkills(attrs, tags);
      const hp = maxHp(attrs.body, 1);
      d.name = name.trim() || "Silas Vance";
      d.phase = "play";
      d.ironman = d.ironman;
      d.mapId = "sinks";
      d.player = {
        ...blankActor(),
        name: d.name,
        attrs: { ...attrs },
        skills,
        tags: [...tags],
        hp,
        maxHp: hp,
        maxAp: 7 + Math.floor(attrs.finesse / 4),
        nodes: playerNodes(),
        mapId: "sinks",
        x: MAPS.sinks.entry.x,
        y: MAPS.sinks.entry.y,
      };
      d.actors = freshActors();
      d.machines = freshMachines();
      d.flags = {};
      d.journal = [];
      d.deeds = [];
      d.verbs = {};
      d.traces = {};
      d.pendingEncounter = null;
      d.pinned = "The Sinks";
      d.inventory = [
        { id: "prybar", qty: 1, condition: 88 },
        { id: "bandage", qty: 2 },
        { id: "chalk", qty: 1 },
        { id: "gears", qty: 1 },
      ];
      d.equipped = { weapon: "prybar", armor: null };
      d.scrip = 18;
      d.xp = 0;
      d.level = 1;
      d.skillPoints = 4 + attrs.mind;
      d.focus = maxFocus(attrs.will);
      d.disciplines = ["matter"];
      d.reputation = { bureau: 0, unbound: 0, relsec: 0, ash: 0, engineers: 0 };
      d.log = ["Wet iron. Coal smoke. Tobin is at the bench, and the Bureau's zero is still on you."];
      d.dialogue = { convo: "tobin-intro", node: "start" };
      d.panel = "none";
      d.combat = null;
      d.path = [];
      d.intent = null;
      d.audit = null;
      d.ending = null;
      d.epilogue = [];
      d.pendingLevel = false;
      d.pendingMap = null;
      play("talk");
    }),
  listSaves: () => {
    const ids = ["auto", "slot1", "slot2", "slot3"];
    return ids
      .map((id) => {
        const row = readSlot(id);
        return row ? { id, label: row.label, when: row.when } : null;
      })
      .filter((x): x is SaveSlot => Boolean(x));
  },
  save: (slot) => {
    const data = get().data;
    if (data.phase !== "play" && data.phase !== "epilogue") return;
    if (data.ironman && slot !== "auto") return;
    writeSlot(slot, structuredClone(data));
    set((s) => ({ data: { ...s.data, hasSave: true, log: [`Ledger filed (${slot}).`, ...s.data.log].slice(0, 40) } }));
    play("ui");
  },
  load: (slot) => {
    const row = readSlot(slot);
    if (!row) return;
    row.data.hasSave = true;
    row.data.panel = "none";
    row.data.path = [];
    row.data.intent = null;
    if (!row.data.verbs) row.data.verbs = {};
    if (!row.data.traces) row.data.traces = {};
    if (!row.data.deeds) row.data.deeds = [];
    if (row.data.combat && row.data.phase === "play") {
      if (!row.data.combat.tally) row.data.combat.tally = { strikes: 0, cuts: 0, mends: 0, kills: 0 };
      freezeIntents(row.data);
      row.data.log = [`Engagement resumes on round ${row.data.combat.round}. Cuts stay cut.`, ...row.data.log].slice(0, 40);
    }
    reconcileWorld(row.data);
    set({ data: row.data });
    play("talk");
  },
  quit: () =>
    set((s) => ({
      data: { ...initialData(), ironman: false, hasSave: Boolean(readSlot("auto") || readSlot("slot1")) },
    })),
  closePanel: () => set((s) => ({ data: { ...s.data, panel: "none" } })),
  openPanel: (p) =>
    set((s) => ({ data: { ...s.data, panel: s.data.panel === p ? "none" : p } })),
  clickTile: (x, y) =>
    commit(
      set,
      (d) => {
        if (d.phase !== "play" || d.dialogue) return;
        if (d.panel !== "none" && d.panel !== "audit") return;
        if (!myTurn(d)) return;
        const person = actorAt(d, x, y);
        const gear = machineAt(d, x, y);
        const door = LOCKED_DOORS.find((door) => door.map === d.mapId && door.x === x && door.y === y && !d.flags[door.flag]);
        if (person) {
          if (dist(d.player, person) <= 1) openTalk(d, person);
          else if (!refuseWalk(d)) {
            d.path = pathNear(d, person.x, person.y) ?? [];
            d.intent = d.combat && person.hostile ? { type: "strike", id: person.id } : { type: "talk", id: person.id };
          }
          return;
        }
        if (gear) {
          if (dist(d.player, gear) <= 1) openAudit(d, { kind: "machine", id: gear.id });
          else if (!refuseWalk(d)) {
            d.path = pathNear(d, gear.x, gear.y) ?? [];
            d.intent = { type: "audit", id: gear.id, kind: "machine" };
          }
          return;
        }
        if (door) {
          if (dist(d.player, door) <= 1) {
            d.dialogue = { convo: door.convo, node: "start" };
            d.panel = "none";
          } else if (!refuseWalk(d)) {
            d.path = pathNear(d, door.x, door.y) ?? [];
            d.intent = { type: "door", convo: door.convo, x: door.x, y: door.y };
          }
          return;
        }
        if (isExit(d.mapId, x, y) && dist(d.player, { x, y }) <= 1 && !d.combat) {
          depart(d);
          return;
        }
        const path = pathTo(d, x, y);
        if (!path) {
          if (dist(d.player, { x, y }) > 1) addLog(d, "No clear path.");
          return;
        }
        if (refuseWalk(d)) return;
        d.path = path;
        d.intent = null;
      },
      "none",
    ),
  step: () =>
    commit(
      set,
      (d) => {
        if (d.phase !== "play" || !d.path.length || d.dialogue) return;
        if (!myTurn(d)) return;
        if (refuseWalk(d)) return;
        const next = d.path[0];
        if (d.combat) d.player.ap -= gait(d.player) === "slow" ? 2 : 1;
        if (!walkable(d, next.x, next.y, "player")) {
          d.path = [];
          return;
        }
        movePlayer(d, next.x, next.y);
        d.path = d.path.slice(1);
        const tone = d.mapId === "tundra" ? "ice" : d.mapId === "rust" || d.mapId === "quarry" ? "metal" : d.mapId === "haven" ? "timber" : "sinks";
        play("step", tone);
        if (!d.path.length && d.intent) {
          const intent = d.intent;
          d.intent = null;
          if (intent.type === "talk") {
            const a = d.actors[intent.id];
            if (a && dist(d.player, a) <= 1) openTalk(d, a);
          } else if (intent.type === "audit") {
            const target: AuditTarget = { kind: intent.kind, id: intent.id };
            const pos =
              intent.kind === "machine" ? d.machines[intent.id] : d.actors[intent.id];
            if (pos && dist(d.player, pos) <= 1) openAudit(d, target);
          } else if (intent.type === "strike") {
            const a = d.actors[intent.id];
            if (a && a.alive) {
              if (!d.combat) startCombat(d, [a.id]);
              else if (dist(d.player, a) <= (weaponOf(d.player).range ?? 1)) strike(d, d.player, a);
            }
          } else if (intent.type === "door" && dist(d.player, intent) <= 1) {
            d.dialogue = { convo: intent.convo, node: "start" };
          }
        }
        if (d.phase === "play" && !d.combat && isExit(d.mapId, d.player.x, d.player.y)) depart(d);
        checkVision(d);
        if (!d.path.length) writeSlot("auto", d);
      },
      "none",
    ),
  choose: (index) =>
    commit(set, (d) => {
      const node = currentNode(d);
      if (!node) return;
      const visible = node.replies.filter((r) => replyVisible(d, r.requires));
      const reply = visible[index];
      if (!reply) return;
      const from = d.dialogue?.convo;
      let effects = reply.effects;
      let goto = reply.goto;
      if (reply.check) {
        const skill = reply.check.skill;
        if (skill === "sneak" || skill === "lockwork") noteVerb(d, "sneak");
        else if (skill === "barter") noteVerb(d, "barter");
        else if (skill === "speech") {
          noteVerb(d, /threat|intimidat|fear|yield|kneel|back down/i.test(reply.text) ? "threaten" : "negotiate");
        } else if (skill === "mechanics" || skill === "engineering") noteVerb(d, "repair");
        else if (skill === "medicine") {
          noteVerb(d, "mend");
          noteField(d, "biology");
        } else if (skill === "psychology") noteField(d, "mind");
        const skillValue = d.player.skills[reply.check.skill];
        const chance = Math.max(5, Math.min(95, 50 + skillValue - reply.check.dc));
        const rolled = 1 + Math.floor(Math.random() * 100);
        const ok = rolled <= chance;
        addLog(
          d,
          ok
            ? `${reply.check.skill} holds. (${rolled} vs ${chance})`
            : `${reply.check.skill} fails. (${rolled} vs ${chance})`,
        );
        if (ok) grantXp(d, 8);
        else {
          effects = reply.failEffects;
          goto = reply.failGoto;
        }
      }
      applyEffects(d, effects);
      if (d.phase !== "play") return;
      if (from === "tobin-intro") d.flags.metTobin = true;
      if (reply.jump) {
        d.dialogue = { convo: reply.jump.convo, node: reply.jump.node };
        return;
      }
      if (goto && d.dialogue) d.dialogue.node = goto;
      else if (reply.end || !goto) d.dialogue = null;
    }),
  endTurn: () => commit(set, (d) => endPlayerTurn(d)),
  brace: () => commit(set, (d) => brace(d)),
  standDown: () => commit(set, (d) => standDown(d)),
  dismantle: (id) => commit(set, (d) => dismantle(d, id)),
  auditSelf: () => commit(set, (d) => openAudit(d, { kind: "actor", id: "player" })),
  setZoom: (dir) =>
    set((s) => {
      const steps = [0.8, 1, 1.25];
      const cur = s.data.zoom ?? 1;
      let i = steps.findIndex((n) => Math.abs(n - cur) < 0.05);
      if (i < 0) i = 1;
      i = Math.max(0, Math.min(steps.length - 1, i + dir));
      return { data: { ...s.data, zoom: steps[i] } };
    }),
  setPref: (key, value) =>
    set((s) => ({
      data: { ...s.data, flags: { ...s.data.flags, [key]: value } },
    })),
  dev: (cmd) =>
    commit(set, (d) => {
      if (cmd === "focus") {
        d.focus = 10 + d.player.attrs.will * 2;
        addLog(d, "Focus topped off. Field tools, not a blessing.");
      } else if (cmd === "heal") {
        d.player.hp = d.player.maxHp;
        addLog(d, "You write your pulse back to baseline.");
      } else if (cmd === "reveal") {
        for (const a of Object.values(d.actors)) {
          if (a.mapId !== d.mapId) continue;
          for (const n of a.nodes) n.revealed = true;
        }
        for (const m of Object.values(d.machines)) {
          if (m.mapId !== d.mapId) continue;
          for (const n of m.nodes) n.revealed = true;
        }
        addLog(d, "Every seam on this floor is legible.");
        return;
      } else if (cmd === "pump") {
        d.player.x = 13;
        d.player.y = 7;
        d.path = [];
        d.panel = "none";
      } else if (cmd === "gate") {
        d.player.x = 14;
        d.player.y = 10;
        d.path = [];
        d.panel = "none";
      } else if (cmd === "crack") {
        const n = d.player.nodes.find((node) => node.effect === "weapon");
        if (n) {
          n.integrity = 15;
          addLog(d, "The tool haft cracks under a test blow.");
        }
      } else if (cmd === "sign") {
        d.flags.pumpFate = d.flags.pumpFate || "mend";
        d.flags.actReady = true;
        d.flags.act1 = true;
        d.flags.checkpointSpoke = true;
        addLog(d, "The Sinks chit is signed by the field tools. The later roads open.");
      } else if (cmd === "rifle") {
        d.inventory.push({ id: "rifle", qty: 1, condition: 58 });
        addLog(d, "A tired steam rifle is in the pack.");
      } else if (cmd === "brawl") {
        d.mapId = "sinks";
        d.player.mapId = "sinks";
        d.player.x = 7;
        d.player.y = 13;
        d.dialogue = null;
        d.panel = "none";
        d.path = [];
        d.flags.checkpointSpoke = true;
        if (d.actors.varr?.alive) startCombat(d, ["varr"]);
        else addLog(d, "Varr is not standing.");
      } else if (cmd === "kael") {
        d.flags.act1 = true;
        d.flags.pumpFate = d.flags.pumpFate || "lockout";
        d.flags.checkpointSpoke = true;
        d.mapId = "quarry";
        d.player.mapId = "quarry";
        d.player.x = 13;
        d.player.y = 6;
        d.dialogue = null;
        d.panel = "none";
        d.path = [];
        if (d.actors.kael) d.actors.kael.mapId = "quarry";
        if (d.actors.kael?.alive) startCombat(d, ["kael"]);
        else addLog(d, "Kael is not standing.");
      }
    }),
  strikeNearest: () =>
    commit(set, (d) => {
      if (!d.combat || !myTurn(d)) return;
      const range = weaponOf(d.player).range ?? 1;
      const foes = Object.values(d.actors)
        .filter((a) => a.alive && a.hostile && a.mapId === d.mapId)
        .sort((a, b) => dist(d.player, a) - dist(d.player, b));
      const hit = foes.find((a) => dist(d.player, a) <= range);
      if (hit) strike(d, d.player, hit);
      else if (foes[0] && !refuseWalk(d)) {
        d.path = pathNear(d, foes[0].x, foes[0].y) ?? [];
        d.intent = { type: "strike", id: foes[0].id };
      } else if (!foes[0]) addLog(d, "Nothing hostile in the room.");
    }, "none"),
  talkNearest: () =>
    commit(set, (d) => {
      if (d.combat || d.dialogue) return;
      const people = Object.values(d.actors)
        .filter((a) => a.alive && a.mapId === d.mapId && !a.companion)
        .sort((a, b) => dist(d.player, a) - dist(d.player, b));
      const near = people.find((a) => dist(d.player, a) <= 1);
      if (near) openTalk(d, near);
      else if (people[0]) {
        d.path = pathNear(d, people[0].x, people[0].y) ?? [];
        d.intent = { type: "talk", id: people[0].id };
      }
    }, "none"),
  auditNearest: () =>
    commit(set, (d) => {
      if (d.dialogue || !myTurn(d)) return;
      const machines = Object.values(d.machines).filter((m) => m.mapId === d.mapId);
      const broken = machines.filter((m) => m.nodes.some((n) => n.integrity < 50 || n.severed));
      const machine = (broken.length ? broken : machines).sort((a, b) => dist(d.player, a) - dist(d.player, b))[0];
      const person = Object.values(d.actors)
        .filter((a) => a.alive && a.mapId === d.mapId && (d.combat ? a.hostile : true))
        .sort((a, b) => dist(d.player, a) - dist(d.player, b))[0];
      if (machine && dist(d.player, machine) <= 1) openAudit(d, { kind: "machine", id: machine.id });
      else if (person && person.hostile && dist(d.player, person) <= 1) openAudit(d, { kind: "actor", id: person.id });
      else if (d.combat && person) {
        d.path = pathNear(d, person.x, person.y) ?? [];
        d.intent = { type: "audit", id: person.id, kind: "actor" };
      } else if (machine) {
        d.path = pathNear(d, machine.x, machine.y) ?? [];
        d.intent = { type: "audit", id: machine.id, kind: "machine" };
        if (!d.path.length) addLog(d, "No clear path to a machine.");
      } else if (person && dist(d.player, person) <= 1) openAudit(d, { kind: "actor", id: person.id });
      else if (person) {
        d.path = pathNear(d, person.x, person.y) ?? [];
        d.intent = { type: "audit", id: person.id, kind: "actor" };
      } else openAudit(d, { kind: "actor", id: "player" });
    }),
  selectNode: (id) => set((s) => ({ data: { ...s.data, uiNode: id } })),
  mend: () =>
    commit(set, (d) => {
      if (!d.audit || !d.uiNode) return;
      mendNode(d, d.audit, d.uiNode);
    }),
  unmend: () =>
    commit(set, (d) => {
      if (!d.audit || !d.uiNode) return;
      unmendNode(d, d.audit, d.uiNode);
    }),
  pinSeam: () =>
    commit(set, (d) => {
      if (!d.disciplines.includes("continuity") || !d.audit || !d.uiNode) return;
      const nodes =
        d.audit.kind === "actor"
          ? d.audit.id === "player"
            ? d.player.nodes
            : d.actors[d.audit.id]?.nodes ?? []
          : d.machines[d.audit.id]?.nodes ?? [];
      const n = nodes.find((x) => x.id === d.uiNode);
      if (!n?.revealed || n.decoy) {
        addLog(d, "Nothing true to pin.");
        return;
      }
      if (d.focus < 8) {
        addLog(d, "Not enough focus to pin a seam.");
        return;
      }
      if (d.combat && d.combat.order[d.combat.index] === "player") {
        if (d.player.ap < 2) {
          addLog(d, "Not enough action.");
          return;
        }
        d.player.ap -= 2;
      }
      d.focus -= 8;
      n.pinned = true;
      addLog(d, `You pin ${n.name}. It will not migrate this breath.`);
      play("mend");
    }),
  special: (id) =>
    commit(set, (d) => {
      if (d.audit?.kind === "machine") runSpecial(d, d.audit.id, id);
    }),
  equipOrUse: (id) => commit(set, (d) => useItem(d, id)),
  giveKit: (id, slot, itemId) => commit(set, (d) => equipCompanion(d, id, slot, itemId)),
  spend: (id) => commit(set, (d) => spendSkill(d, id), "none"),
  travel: (mapId) =>
    commit(set, (d) => {
      const region = mapId;
      if (region === d.mapId) {
        d.panel = "none";
        return;
      }
      d.pendingMap = region;
      d.panel = "none";
      if (!d.flags.traveled) {
        d.flags.traveled = true;
        arrive(d);
        return;
      }
      if (Math.random() < 0.38) {
        const roll = Math.random();
        const convo =
          !d.flags.refugeeMet && roll < 0.28 ? "enc-refugees" : roll < 0.55 ? "enc-patrol" : roll < 0.78 ? "enc-trader" : "enc-auto";
        d.dialogue = { convo, node: "start" };
        addLog(d, "The road does not stay empty.");
      } else arrive(d);
    }),
  ackLevel: () => set((s) => ({ data: { ...s.data, pendingLevel: false } })),
}));

export function visibleReplies(d: Data) {
  const node = currentNode(d);
  if (!node) return [];
  return node.replies.filter((r) => replyVisible(d, r.requires));
}

export { comp, regionOpen };
