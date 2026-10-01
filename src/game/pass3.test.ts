import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPAWNS, spawnActor } from "./catalog";
import { CONVOS } from "./dialogue";
import { WORLD_EDGES } from "./network";
import { MOUTHS, MAPS, tileAt, WALKABLE } from "./maps";
import { allSkills, maxFocus, maxHp } from "./formulas";
import {
  actorFate,
  applyEffects,
  applyHp,
  armorCount,
  askHistory,
  becoming,
  boardIntents,
  buildEpilogue,
  endPlayerTurn,
  forecast,
  freezeIntents,
  freshMachines,
  gait,
  hasEncounter,
  mendNode,
  memoryConvo,
  nodeLive,
  noteEscape,
  openAudit,
  pathTo,
  lensReads,
  practiceBand,
  reconcileWorld,
  regionOpen,
  refuseWalk,
  replyVisible,
  runSpecial,
  slipEncounter,
  standDown,
  startCombat,
  strike,
  unmendNode,
  useItem,
  walkable,
  arrive,
  depart,
  movePlayer,
  dist,
  wasBaselineLost,
  wasSevered,
  didDie,
  didEscape,
  didStandDown,
  weaponOf,
  weaponsDark,
  addItem,
  companionAp,
  pinOnHit,
} from "./logic";
import { companyLines, equipCompanion } from "./companions";
import type { Actor, Data, GNode } from "./types";

function player(): Actor {
  const attrs = { body: 4, finesse: 5, mind: 8, will: 6, presence: 5, perception: 8 };
  const skills = allSkills(attrs, ["audit", "engineering", "speech"]);
  skills.audit = 95;
  const hp = maxHp(attrs.body, 1);
  return {
    id: "player",
    template: "player",
    name: "Silas",
    title: "Patch",
    portrait: "",
    sprite: "",
    scale: 1,
    mapId: "sinks",
    x: 7,
    y: 13,
    home: { mapId: "sinks", x: 7, y: 13 },
    hp,
    maxHp: hp,
    ap: 20,
    maxAp: 8,
    attrs,
    skills,
    tags: ["audit", "engineering", "speech"],
    nodes: [
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
        confidence: "confident",
        gx: 20,
        gy: 20,
      },
    ],
    faction: "unbound",
    hostile: false,
    aggro: false,
    alive: true,
    companion: false,
    convo: "",
    weapon: "prybar",
    stunned: false,
    polymorphic: false,
    tier: 0,
    vision: 0,
  };
}

function world(): Data {
  const actors: Record<string, Actor> = {};
  for (const s of SPAWNS) actors[s.id] = spawnActor(s);
  return {
    phase: "play",
    ironman: false,
    name: "Silas",
    mapId: "sinks",
    player: player(),
    actors,
    machines: freshMachines(),
    flags: { checkpointSpoke: true },
    journal: [],
    pinned: "",
    inventory: [{ id: "prybar", qty: 1, condition: 88 }],
    equipped: { weapon: "prybar", armor: null },
    scrip: 0,
    xp: 0,
    level: 1,
    skillPoints: 0,
    focus: maxFocus(6),
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
    zoom: 1,
    draft: { name: "Silas", attrs: { body: 4, finesse: 5, mind: 8, will: 6, presence: 5, perception: 8 }, pool: 0, tags: [] },
  };
}

function node(a: Actor, id: string): GNode {
  const n = a.nodes.find((x) => x.id === id);
  if (!n) throw new Error(`missing ${id}`);
  return n;
}

function added(d: Data, mark: number) {
  return d.log.slice(0, d.log.length - mark);
}

function cut(d: Data, id: string, nodeId: string) {
  for (let i = 0; i < 15; i++) {
    d.player.ap = 20;
    d.focus = 40;
    d.player.stunned = false;
    d.phase = "play";
    const host = id === "player" ? d.player : d.actors[id];
    if (!host) throw new Error(id);
    if (host.nodes.find((n) => n.id === nodeId)?.severed) return;
    unmendNode(d, { kind: "actor", id }, nodeId);
    if (host.nodes.find((n) => n.id === nodeId)?.severed) return;
  }
  throw new Error(`could not sever ${nodeId}`);
}

describe("dependency combat", () => {
  it("runs the Varr, crane, Kael, and save matrix", () => {
    const d = world();
    const varr = d.actors.varr;
    startCombat(d, ["varr"]);
    d.combat = { order: ["player", "varr"], index: 0, round: 2, audited: [] };
    d.player.ap = 20;
    d.player.hp = d.player.maxHp;
    d.player.x = 7;
    d.player.y = 13;
    varr.x = 6;
    varr.y = 13;
    varr.hp = varr.maxHp;
    varr.alive = true;

    const beforeHp = varr.hp;
    let swings = 0;
    while (varr.hp === beforeHp && swings++ < 8) strike(d, d.player, varr);
    assert.ok(varr.hp < beforeHp);
    assert.match(d.log.join("\n"), /hits/);
    varr.hp = varr.maxHp;

    assert.equal(weaponOf(varr).id, "rifle");
    openAudit(d, { kind: "actor", id: "varr" });
    const chamber = node(varr, "chamber");
    assert.equal(chamber.revealed, true);
    assert.equal(chamber.confidence, "observed");
    assert.match(forecast(varr.nodes, chamber), /still a guess/);
    assert.doesNotMatch(forecast(varr.nodes, chamber), /Rifle/);
    openAudit(d, { kind: "actor", id: "varr" });
    assert.equal(chamber.confidence, "understood");
    assert.match(forecast(varr.nodes, chamber), /Rifle/);
    chamber.confidence = "confident";

    cut(d, "varr", "chamber");
    const mount = node(varr, "mount");
    const rifle = node(varr, "rifle");
    assert.equal(chamber.severed, true);
    assert.equal(rifle.severed, false);
    assert.equal(rifle.integrity, 100);
    assert.equal(nodeLive(varr.nodes, rifle), false);
    assert.equal(nodeLive(varr.nodes, mount), false);
    assert.equal(weaponOf(varr).id, "fist");
    assert.ok(d.log.some((line) => line.includes("Pressure chamber") && line.includes("severed")));
    assert.ok(d.log.some((line) => line.includes("Rifle mount") && line.includes("disabled")));
    assert.ok(d.log.some((line) => line.includes("Rifle") && line.includes("unavailable")));
    const reading = d.journal.find((j) => j.id === "read:varr");
    assert.ok(reading);
    assert.match(reading.text, /Pressure chamber → Rifle mount/);
    assert.match(reading!.text, /Known failure:.*Pressure chamber severed/i);
    assert.match(reading!.text, /Rifle unavailable/i);

    rifle.severed = true;
    rifle.integrity = 0;
    chamber.severed = true;
    d.focus = 40;
    d.player.ap = 20;
    for (let i = 0; i < 8 && chamber.severed; i++) {
      d.focus = 40;
      d.player.ap = 20;
      mendNode(d, { kind: "actor", id: "varr" }, "chamber");
    }
    assert.equal(chamber.severed, false);
    assert.equal(nodeLive(varr.nodes, mount), true);
    assert.equal(rifle.severed, true);
    assert.equal(nodeLive(varr.nodes, rifle), false);
    rifle.severed = false;
    rifle.integrity = 100;
    chamber.severed = true;
    chamber.integrity = 0;
    assert.equal(nodeLive(varr.nodes, rifle), false);
    assert.equal(weaponOf(varr).id, "fist");

    d.player.ap = 0;
    d.path = [{ x: 8, y: 13 }, { x: 9, y: 13 }];
    refuseWalk(d);
    refuseWalk(d);
    refuseWalk(d);
    assert.deepEqual(d.path, []);
    assert.equal(d.log.filter((line) => line === "No action left. End the turn.").length, 1);
    d.player.ap = 20;

    d.player.x = 7;
    d.player.y = 13;
    varr.x = 6;
    varr.y = 13;
    d.combat = { order: ["player", "varr"], index: 0, round: 3, audited: ["varr"] };
    const markRifle = d.log.length;
    endPlayerTurn(d);
    const rifleLines = added(d, markRifle).join("\n");
    assert.match(rifleLines, /cannot bring the mounted weapon/);
    assert.doesNotMatch(rifleLines, /steam rifle/);
    assert.equal(varr.alive, true);

    d.combat = { order: ["player", "varr"], index: 0, round: 4, audited: ["varr"] };
    d.phase = "play";
    openAudit(d, { kind: "actor", id: "varr" });
    node(varr, "coupling").confidence = "confident";
    cut(d, "varr", "coupling");
    assert.equal(gait(varr), "dead");
    assert.equal(nodeLive(varr.nodes, node(varr, "servos")), false);
    assert.equal(node(varr, "servos").integrity, 100);

    d.player.x = 6;
    d.player.y = 3;
    d.player.ap = 11;
    varr.x = 6;
    varr.y = 13;
    varr.skills.mechanics = 40;
    d.combat = { order: ["player", "varr"], index: 0, round: 5, audited: ["varr"] };
    d.phase = "play";
    const saved = structuredClone(d);
    const loaded = structuredClone(saved);
    loaded.panel = "none";
    loaded.path = [];
    loaded.intent = null;
    saved.player.ap = 1;
    saved.player.x = 2;
    saved.actors.varr.nodes.find((n) => n.id === "rifle")!.integrity = 5;
    assert.equal(node(loaded.actors.varr, "chamber").severed, true);
    assert.equal(node(loaded.actors.varr, "coupling").severed, true);
    assert.equal(nodeLive(loaded.actors.varr.nodes, node(loaded.actors.varr, "rifle")), false);
    assert.equal(node(loaded.actors.varr, "rifle").integrity, 100);
    assert.equal(loaded.player.ap, 11);
    assert.equal(loaded.player.x, 6);
    assert.equal(loaded.player.y, 3);
    assert.equal(loaded.actors.varr.x, 6);
    assert.equal(loaded.actors.varr.y, 13);
    assert.equal(loaded.combat?.round, 5);
    assert.equal(loaded.combat?.index, 0);
    assert.equal(loaded.combat?.order.join(","), "player,varr");
    assert.equal(JSON.stringify(loaded.inventory), JSON.stringify([{ id: "prybar", qty: 1, condition: 88 }]));
    assert.equal(loaded.flags.checkpointSpoke, true);
    const markMove = d.log.length;
    endPlayerTurn(d);
    assert.equal(varr.x, 6);
    assert.equal(varr.y, 13);
    assert.match(added(d, markMove).join("\n"), /attempting repair|braces in place/);

    d.phase = "play";
    d.mapId = "sinks";
    d.player.mapId = "sinks";
    d.player.x = 3;
    d.player.y = 3;
    varr.mapId = "sinks";
    varr.x = 10;
    varr.y = 13;
    varr.hp = varr.maxHp;
    varr.alive = true;
    const engine = d.machines.yard.nodes.find((n) => n.id === "engine");
    const cable = d.machines.yard.nodes.find((n) => n.id === "cable");
    assert.ok(engine && cable);
    cable.revealed = true;
    cable.confidence = "confident";
    d.player.ap = 20;
    d.focus = 40;
    d.combat = { order: ["player", "varr"], index: 0, round: 6, audited: [] };
    for (let i = 0; i < 12 && !cable.severed; i++) {
      d.player.ap = 20;
      d.focus = 40;
      unmendNode(d, { kind: "machine", id: "yard" }, "cable");
    }
    assert.equal(cable.severed, true);
    assert.equal(engine.spent, true);
    assert.equal(d.flags["yard:dropped"], true);
    assert.ok(varr.hp < varr.maxHp);
    assert.ok(varr.hp > 0);
    assert.equal(varr.alive, true);

    const kael = d.actors.kael;
    for (const n of kael.nodes) {
      const outer = n.id === "clasp" || n.id === "ceramic" || n.id === "rivets" || n.id === "frame";
      n.revealed = outer;
      if (outer) n.confidence = "confident";
    }
    d.audit = { kind: "actor", id: "kael" };
    d.combat = { order: ["player", "kael"], index: 0, round: 1, audited: ["kael"] };
    d.phase = "play";
    const beforeArmor = armorCount(kael);
    assert.ok(beforeArmor >= 3);
    cut(d, "kael", "clasp");
    assert.equal(nodeLive(kael.nodes, node(kael, "ceramic")), false);
    assert.equal(node(kael, "ceramic").severed, false);
    assert.equal(nodeLive(kael.nodes, node(kael, "frame")), true);
    assert.equal(nodeLive(kael.nodes, node(kael, "mesh")), true);
    assert.equal(armorCount(kael), beforeArmor - 1);
    assert.equal(node(kael, "mesh").revealed, true);
    assert.equal(node(kael, "mesh").confidence, "observed");

    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 2;
    d.player.y = 2;
    kael.mapId = "quarry";
    kael.x = 13;
    kael.y = 5;
    kael.alive = true;
    kael.hostile = true;
    d.phase = "play";
    d.combat = { order: ["player", "kael"], index: 0, round: 2, audited: ["kael"] };
    const markKael = d.log.length;
    endPlayerTurn(d);
    assert.equal(kael.x, 13);
    assert.equal(kael.y, 5);
    assert.match(added(d, markKael).join("\n"), /attempting repair|reseats/);

    kael.hp = kael.maxHp;
    kael.x = 13;
    kael.y = 5;
    kael.mapId = "quarry";
    const brake = d.machines.crane.nodes.find((n) => n.id === "brake");
    const slab = d.machines.crane.nodes.find((n) => n.id === "slab");
    assert.ok(brake && slab);
    brake.revealed = true;
    brake.confidence = "confident";
    d.player.x = 3;
    d.player.y = 3;
    d.player.mapId = "sinks";
    for (let i = 0; i < 12 && !brake.severed; i++) {
      d.focus = 40;
      d.player.ap = 20;
      unmendNode(d, { kind: "machine", id: "crane" }, "brake");
    }
    assert.equal(brake.severed, true);
    assert.equal(slab.spent, true);
    assert.ok(kael.hp < kael.maxHp);
    assert.ok(kael.alive);
    assert.ok(kael.hp > kael.maxHp * 0.4);
    assert.ok(kael.nodes.filter((n) => n.effect === "armor" && !n.severed).length >= 2);

    const legacyNodes = structuredClone(varr.nodes).filter((n) => n.id !== "mount");
    const oldRifle = legacyNodes.find((n) => n.id === "rifle");
    const oldChamber = legacyNodes.find((n) => n.id === "chamber");
    assert.ok(oldRifle && oldChamber);
    oldRifle.dependsOn = ["chamber"];
    oldRifle.effect = "weapon";
    oldRifle.severed = false;
    oldRifle.integrity = 100;
    oldRifle.revealed = true;
    oldChamber.severed = false;
    oldChamber.integrity = 100;
    oldChamber.revealed = true;
    oldChamber.confidence = "confident";
    d.actors.legacy = {
      ...structuredClone(varr),
      id: "legacy",
      name: "Old plate",
      nodes: legacyNodes,
      alive: true,
      hostile: true,
    };
    d.phase = "play";
    d.combat = { order: ["player", "legacy"], index: 0, round: 1, audited: ["legacy"] };
    for (let i = 0; i < 12 && !oldChamber.severed; i++) {
      d.player.ap = 20;
      d.focus = 40;
      unmendNode(d, { kind: "actor", id: "legacy" }, "chamber");
    }
    assert.equal(oldChamber.severed, true);
    assert.equal(oldRifle.severed, false);
    assert.equal(oldRifle.integrity, 100);
    assert.equal(nodeLive(legacyNodes, oldRifle), false);
    assert.equal(legacyNodes.some((n) => n.id === "mount"), false);
    const kept = structuredClone(legacyNodes);
    oldRifle.integrity = 3;
    const loadedLegacy = structuredClone(kept);
    assert.equal(loadedLegacy.find((n) => n.id === "rifle")?.integrity, 100);
    assert.equal(loadedLegacy.find((n) => n.id === "chamber")?.severed, true);

    d.phase = "play";
    d.combat = { order: ["player", "varr"], index: 0, round: 7, audited: [] };
    varr.hp = 4;
    varr.hostile = true;
    varr.alive = true;
    applyHp(d, "varr", 40, false);
    assert.equal(d.combat, null);
    assert.equal(varr.hp, 1);
    assert.equal(varr.hostile, false);
    assert.equal(d.dialogue?.convo, "varr-down");

    d.flags["down:varr"] = true;
    d.dialogue = null;
    d.phase = "play";
    varr.hp = 8;
    varr.alive = true;
    varr.hostile = true;
    d.combat = { order: ["player", "varr"], index: 0, round: 8, audited: [] };
    applyHp(d, "varr", 40, false);
    assert.equal(varr.alive, false);
    assert.equal(d.combat, null);

    d.phase = "play";
    d.player.hp = 10;
    d.combat = { order: ["player"], index: 0, round: 1, audited: [] };
    applyHp(d, "player", 80, false);
    assert.equal(d.phase, "dead");
    assert.equal(d.combat, null);
    assert.equal(d.player.hp, 0);
  });
});

describe("systems, not classes", () => {
  it("telegraphs the rifle and lets a dark weapon end the fight without a corpse", () => {
    const d = world();
    d.player.skills.speech = 95;
    d.player.x = 7;
    d.player.y = 13;
    const varr = d.actors.varr;
    varr.x = 6;
    varr.y = 13;
    varr.hostile = true;
    varr.alive = true;
    d.combat = {
      order: ["player", "varr"],
      index: 0,
      round: 1,
      audited: [],
      tally: { strikes: 0, cuts: 0, mends: 0, kills: 0 },
    };
    freezeIntents(d);
    const row = boardIntents(d).find((r) => r.id === "varr");
    assert.ok(row);
    assert.match(row!.line, /Steam rifle → you/);
    assert.doesNotMatch(row!.line, /needs/);
    assert.equal(row!.live, true);
    assert.equal(weaponsDark(d), false);

    openAudit(d, { kind: "actor", id: "varr" });
    openAudit(d, { kind: "actor", id: "varr" });
    const read = boardIntents(d).find((r) => r.id === "varr");
    assert.match(read?.line ?? "", /needs Pressure chamber/);
    cut(d, "varr", "chamber");
    const after = boardIntents(d).find((r) => r.id === "varr");
    assert.match(after?.line ?? "", /Steam rifle → you/);
    assert.match(after?.line ?? "", /needs Pressure chamber/);
    assert.equal(after?.live, false);
    assert.equal(weaponsDark(d), true);
    assert.equal(varr.alive, true);
    const lenses = lensReads(d).map((row) => row.id);
    assert.ok(lenses.includes("structure"));
    assert.ok(lenses.includes("intent"));
    assert.ok(lenses.includes("causality"));
    assert.equal(lenses.includes("mind"), false);
    assert.equal(lenses.includes("continuity"), false);

    let n = 0;
    while (d.combat && n++ < 12) {
      d.player.ap = 8;
      d.phase = "play";
      standDown(d);
    }
    assert.equal(d.combat, null);
    assert.equal(varr.alive, true);
    assert.equal(varr.hostile, false);
    assert.match(d.log.join("\n"), /did not have to empty the room/);
    const deed = d.deeds?.[0];
    assert.ok(deed);
    assert.match(deed!.title, /Varr stood down/);
    assert.match(deed!.text, /stood down/);
    assert.match(deed!.text, /Pressure chamber → Rifle/);
    assert.match(deed!.text, /Rifle unavailable/);
    assert.match(deed!.text, /lost the ranged attack/);
    assert.equal(deed!.baseline, "preserved");
    assert.equal(deed!.resolved, true);
    assert.doesNotMatch(`${deed!.title} ${deed!.text} ${deed!.approach}`, /good|evil|morality|rank|perfect/i);
    assert.match(deed!.approach, /STRUCTURAL|PRECISE|PERCEPTIVE|SEVERING|PRESERVATIVE/);
  });

  it("a practiced mend reinforces the next bond and does not reseat a severed child", () => {
    const d = world();
    d.player.skills.engineering = 95;
    d.verbs = { mend: 3 };
    const pump = d.machines.pump;
    const boiler = pump.nodes.find((n) => n.id === "boiler");
    const pipe = pump.nodes.find((n) => n.id === "pipe");
    const valve = pump.nodes.find((n) => n.id === "valve");
    assert.ok(boiler && pipe && valve);
    boiler.revealed = true;
    boiler.confidence = "confident";
    boiler.severed = true;
    boiler.integrity = 0;
    pipe.integrity = 50;
    pipe.severed = false;
    valve.revealed = true;
    valve.confidence = "confident";
    let n = 0;
    while (boiler.severed && n++ < 8) {
      d.focus = 40;
      mendNode(d, { kind: "machine", id: "pump" }, "boiler");
    }
    assert.equal(boiler.severed, false);
    assert.equal(pipe.severed, false);
    assert.ok(pipe.integrity > 50);
    assert.match(d.log.join("\n"), /next bond/);
    n = 0;
    while (!valve.severed && n++ < 8) {
      d.focus = 40;
      unmendNode(d, { kind: "machine", id: "pump" }, "valve");
    }
    assert.equal(valve.severed, true);
    assert.ok(lensReads(d).some((row) => row.id === "flow"));
    assert.equal(lensReads(d).some((row) => row.id === "mind"), false);
  });
});

describe("history is facts, not a score", () => {
  it("files the relationship that changed, and leaves an unfinished cut unfiled", () => {
    const d = world();
    d.player.skills.speech = 95;
    d.player.x = 7;
    d.player.y = 13;
    const varr = d.actors.varr;
    varr.x = 6;
    varr.y = 13;
    startCombat(d, ["varr"]);
    openAudit(d, { kind: "actor", id: "varr" });
    openAudit(d, { kind: "actor", id: "varr" });
    let cuts = 0;
    while (!d.combat?.changes?.some((c) => c.nodeId === "chamber" && c.verb === "cut") && cuts++ < 8) {
      d.player.ap = 8;
      d.focus = 40;
      unmendNode(d, { kind: "actor", id: "varr" }, "chamber");
    }
    assert.equal(d.deeds?.length ?? 0, 0);
    assert.equal(d.combat?.changes?.some((c) => c.nodeId === "chamber" && c.verb === "cut"), true);

    slipEncounter(d);
    assert.equal(d.combat, null);
    assert.equal(d.deeds?.length ?? 0, 0);

    const chamber = varr.nodes.find((n) => n.id === "chamber");
    assert.ok(chamber);
    chamber.severed = false;
    chamber.integrity = 100;
    startCombat(d, ["varr"]);
    openAudit(d, { kind: "actor", id: "varr" });
    let again = 0;
    while (!chamber.severed && again++ < 8) {
      d.player.ap = 8;
      d.focus = 40;
      d.phase = "play";
      unmendNode(d, { kind: "actor", id: "varr" }, "chamber");
    }
    assert.equal(chamber.severed, true);
    let n = 0;
    while (d.combat && n++ < 12) {
      d.player.ap = 8;
      d.phase = "play";
      standDown(d);
    }
    assert.equal(d.combat, null);
    const deed = d.deeds?.[0];
    assert.equal(d.deeds?.length, 1);
    assert.equal(deed?.encounterId, "sinks:varr");
    assert.equal(deed?.participants?.[0]?.id, "varr");
    assert.equal(deed?.participants?.[0]?.fate, "stood-down");
    assert.equal(deed?.baseline, "preserved");
    assert.equal(deed?.changes?.[0]?.edge.includes("Pressure chamber"), true);
    assert.equal(deed?.place, "The Bureau checkpoint");
    assert.match(deed?.world?.[0] ?? "", /Checkpoint remained under Captain Varr/);
    assert.match(deed?.text ?? "", /cut\. Pressure chamber → Rifle/);
    assert.equal(memoryConvo(d, "varr"), "varr-memory-cut");
    assert.equal(memoryConvo(d, "en1"), "checkpoint-held-en1");
    assert.equal(replyVisible(d, [{ history: { ask: "now", id: "varr", fate: "stood-down" } }]), true);
    assert.equal(askHistory(d, { ask: "checkpoint", lead: "varr" }), true);
    assert.equal(askHistory(d, { ask: "verb", verb: "cut", id: "sinks:varr" }), true);
    assert.match(CONVOS["varr-memory-cut"].nodes.start.text, /checkpoint is still mine/);
    assert.doesNotMatch(CONVOS["varr-memory-cut"].nodes.start.text, /good|evil|hero|rank/i);
    assert.equal(didStandDown(d, "varr"), true);
    assert.equal(didDie(d, "varr"), false);
    assert.equal(wasSevered(d, "varr", "chamber"), true);
    assert.equal(hasEncounter(d, "sinks:varr"), true);
    assert.equal(d.flags.checkpointLead, "varr");
    assert.match(d.log.join("\n"), /did not have to empty the room/);

    const saved = structuredClone(d);
    assert.equal(saved.deeds?.[0]?.text, d.deeds?.[0]?.text);
    assert.equal(didStandDown(saved, "varr"), true);

    const moll = d.actors.en1;
    moll.x = 8;
    moll.y = 13;
    moll.mapId = "sinks";
    startCombat(d, ["en1"]);
    noteEscape(d, "en1");
    assert.equal(d.combat, null);
    assert.equal(d.deeds?.length, 2);
    assert.equal(d.deeds?.[0]?.participants?.[0]?.fate, "escaped");
    assert.equal(d.deeds?.[1]?.participants?.[0]?.id, "varr");
    assert.equal(didEscape(d, "en1"), true);
    assert.equal(didStandDown(d, "varr"), true);
    assert.equal(wasBaselineLost(d, "sinks:en1"), false);

    moll.alive = true;
    moll.hp = moll.maxHp;
    moll.hostile = true;
    startCombat(d, ["en1"]);
    applyHp(d, "en1", 400, false);
    assert.equal(moll.alive, false);
    assert.equal(didDie(d, "en1"), true);
    assert.equal(didEscape(d, "en1"), true);
    assert.equal(actorFate(d, "en1"), "dead");
    assert.equal(d.deeds?.[0]?.baseline, "lost");
    assert.equal(d.deeds?.[0]?.participants?.[0]?.id, "en1");
    assert.equal(didStandDown(d, "varr"), true);
    assert.equal(d.flags.checkpointLead, "varr");
    assert.equal(d.deeds?.filter((row) => row.participants?.some((p) => p.id === "en1")).length, 2);
    assert.equal(d.deeds?.filter((row) => row.participants?.some((p) => p.id === "varr")).length, 1);
  });

  it("holds a broken-open captain until the choice, then appends a later death", () => {
    const d = world();
    d.player.skills.speech = 95;
    d.player.x = 7;
    d.player.y = 13;
    const varr = d.actors.varr;
    startCombat(d, ["varr"]);
    openAudit(d, { kind: "actor", id: "varr" });
    let cuts = 0;
    while (!varr.nodes.find((node) => node.id === "chamber")?.severed && cuts++ < 8) {
      d.player.ap = 8;
      d.focus = 40;
      unmendNode(d, { kind: "actor", id: "varr" }, "chamber");
    }
    varr.hp = 1;
    applyHp(d, "varr", 40, false);
    assert.equal(d.dialogue?.convo, "varr-down");
    assert.equal(d.deeds?.length ?? 0, 0);
    assert.equal(d.pendingEncounter?.changes?.some((c) => c.verb === "cut" && c.nodeId === "chamber"), true);
    assert.equal(hasEncounter(d, "sinks:varr"), false);
    assert.match(d.log.join("\n"), /broken open/);

    applyEffects(d, [{ op: "flag", key: "varrFate", value: "stood" }]);
    assert.equal(d.pendingEncounter ?? null, null);
    const deed = d.deeds?.[0];
    assert.equal(d.deeds?.length, 1);
    assert.equal(deed?.participants?.[0]?.fate, "stood-down");
    assert.equal(deed?.baseline, "preserved");
    assert.equal(deed?.changes?.[0]?.verb, "cut");
    assert.match(deed?.changes?.[0]?.immediate ?? "", /unavailable/);
    assert.match(deed?.world?.[0] ?? "", /Captain Varr/);
    assert.equal(d.flags.checkpointLead, "varr");
    assert.equal(memoryConvo(d, "varr"), "varr-memory-cut");
    const saved = structuredClone(d);
    assert.equal(saved.deeds?.[0]?.text, deed?.text);
    assert.equal(askHistory(saved, { ask: "stood-down", id: "varr" }), true);
    assert.equal(replyVisible(saved, [{ history: { ask: "now", id: "varr", fate: "stood-down" } }]), true);

    d.flags["down:varr"] = true;
    varr.alive = true;
    varr.hp = varr.maxHp;
    varr.hostile = true;
    startCombat(d, ["varr"]);
    applyHp(d, "varr", 500, false);
    assert.equal(varr.alive, false);
    assert.equal(d.deeds?.length, 2);
    assert.equal(actorFate(d, "varr"), "dead");
    assert.equal(didStandDown(d, "varr"), true);
    assert.equal(didDie(d, "varr"), true);
    assert.equal(d.deeds?.[1]?.participants?.[0]?.fate, "stood-down");
    assert.equal(d.deeds?.[0]?.baseline, "lost");
    assert.equal(d.flags.checkpointLead, "vacant");
    assert.equal(memoryConvo(d, "varr"), null);
    assert.equal(memoryConvo(d, "en2"), "checkpoint-vacant-en2");
    assert.equal(replyVisible(d, [{ history: { ask: "now", id: "varr", fate: "dead" } }]), true);
    assert.equal(replyVisible(d, [{ history: { ask: "now", id: "varr", fate: "stood-down" } }]), false);
    assert.doesNotMatch(`${d.deeds?.[0]?.text} ${d.deeds?.[1]?.text}`, /good|evil|morality|rank|perfect/i);
  });
});

describe("sinks world", () => {
  it("turns history into the plate, the gallery, and a reading", () => {
    const d = world();
    reconcileWorld(d);
    assert.equal(d.flags.plateStair, false);
    assert.equal(d.flags.sumpOpen, false);
    assert.equal(walkable(d, 5, 11), false);
    assert.equal(walkable(d, 19, 6), false);
    assert.equal(d.actors.en1.x, 4);
    assert.equal(d.journal.find((j) => j.id === "sinks-now"), undefined);
    assert.equal(practiceBand(0), "—");
    assert.equal(practiceBand(1), "Basic");
    assert.equal(practiceBand(3), "Emerging");
    assert.equal(practiceBand(4), "Practiced");
    assert.equal(practiceBand(8), "Deep");

    d.flags.checkpointLead = "varr";
    reconcileWorld(d);
    assert.equal(d.flags.plateStair, true);
    assert.equal(walkable(d, 5, 11), true);
    assert.equal(d.actors.en1.x, 4);
    assert.equal(d.actors.en2.x, 8);
    assert.match(d.journal.find((j) => j.id === "sinks-now")?.text ?? "", /plate stair answers to Varr/);
    assert.equal(replyVisible(d, [{ flag: "sumpOpen", is: false }]), true);
    const again = structuredClone(d);
    reconcileWorld(again);
    assert.equal(again.flags.plateStair, true);
    assert.equal(again.actors.en1.x, d.actors.en1.x);
    assert.equal(again.actors.en2.y, d.actors.en2.y);
    assert.equal(again.journal.filter((j) => j.id === "sinks-now").length, 1);

    d.flags.checkpointLead = "vacant";
    reconcileWorld(d);
    assert.equal(d.flags.plateStair, false);
    assert.equal(walkable(d, 5, 11), false);
    assert.equal(d.flags.roadWatch, true);
    assert.equal(d.actors.en1.x, 17);
    assert.equal(d.actors.en1.y, 13);
    assert.equal(d.actors.en2.x, 16);
    assert.equal(d.actors.en2.y, 12);
    assert.match(d.journal.find((j) => j.id === "sinks-now")?.text ?? "", /road mouth/);
    assert.match(d.log.join("\n"), /leave the plate/);

    d.flags.pumpFate = "lockout";
    reconcileWorld(d);
    assert.equal(d.flags.sumpOpen, false);
    d.flags.pumpFate = "flood";
    reconcileWorld(d);
    assert.equal(d.flags.sumpOpen, false);
    d.journal.push({ id: "pump", title: "The broken pump", text: "Still open work.", status: "open" });
    d.flags.pumpFate = "bleed";
    const bypass = d.machines.pump.nodes.find((n) => n.id === "bypass");
    if (!bypass) throw new Error("bypass");
    bypass.severed = true;
    bypass.integrity = 0;
    reconcileWorld(d);
    assert.equal(d.flags.sumpOpen, true);
    assert.equal(d.flags.plateStair, false);
    assert.equal(d.actors.en1.x, 17);
    assert.equal(walkable(d, 19, 6), true);
    assert.equal(nodeLive(d.machines.head.nodes, d.machines.head.nodes.find((n) => n.id === "leaf")!), true);
    assert.equal(d.journal.find((j) => j.id === "pump")?.status, "done");
    assert.match(d.journal.find((j) => j.id === "sinks-now")?.text ?? "", /sump door is open/);
    assert.match(d.log.join("\n"), /gallery door takes pressure/);

    const leaf = d.machines.head.nodes.find((n) => n.id === "leaf");
    if (!leaf) throw new Error("leaf");
    leaf.severed = true;
    reconcileWorld(d);
    assert.equal(d.flags.sumpOpen, false);
    leaf.severed = false;
    leaf.integrity = 100;
    reconcileWorld(d);
    assert.equal(d.flags.sumpOpen, true);

    const saved = structuredClone(d);
    reconcileWorld(saved);
    assert.equal(saved.flags.sumpOpen, true);
    assert.equal(saved.flags.pumpFate, "bleed");
    assert.equal(nodeLive(saved.machines.head.nodes, saved.machines.head.nodes.find((n) => n.id === "feed")!), true);

    d.player.x = 20;
    d.player.y = 6;
    d.focus = 20;
    runSpecial(d, "jack", "brace");
    const footing = d.machines.jack.nodes.find((n) => n.id === "footing");
    if (!footing) throw new Error("footing");
    assert.equal(nodeLive(d.machines.jack.nodes, footing), true);
    assert.ok(footing.integrity < 100);
    assert.equal(d.flags.jackHeld, true);
    assert.equal(d.flags.jackMended, undefined);
    assert.equal(d.verbs?.brace, 1);
    assert.equal(practiceBand(d.verbs?.brace ?? 0), "Basic");
    assert.match(d.journal.find((j) => j.id === "sinks-now")?.text ?? "", /held, not healed/);
    assert.equal(d.flags.galleryCache, true);
    runSpecial(d, "jack", "brace");
    assert.equal(d.verbs?.brace, 1);

    d.player.skills.engineering = 95;
    d.player.skills.audit = 95;
    d.focus = 40;
    openAudit(d, { kind: "actor", id: "varr" });
    openAudit(d, { kind: "actor", id: "varr" });
    const chamber = d.actors.varr.nodes.find((n) => n.id === "chamber");
    assert.equal(chamber?.confidence, "understood");
    openAudit(d, { kind: "machine", id: "pump" });
    const pipe = d.machines.pump.nodes.find((n) => n.id === "pipe");
    const lockout = d.machines.pump.nodes.find((n) => n.id === "lockout");
    assert.equal(pipe?.confidence, "understood");
    assert.equal(lockout?.revealed, true);
    assert.equal(lockout?.confidence, "understood");
    assert.match(d.log.join("\n"), /Same shape as a pressure feed/);
    assert.match(forecast(d.machines.pump.nodes, pipe!), /pressure feed/);
    const bypassNode = d.machines.pump.nodes.find((n) => n.id === "bypass");
    if (!bypassNode) throw new Error("bypass node");
    bypassNode.revealed = true;
    bypassNode.confidence = "understood";
    assert.match(forecast(d.machines.pump.nodes, bypassNode), /gallery feed/);
    d.player.x = 3;
    d.player.y = 3;
    d.flags.sumpOpen = false;
    assert.equal(pathTo(d, 19, 6), null);
    d.flags.sumpOpen = true;
    const into = pathTo(d, 19, 6);
    assert.ok(into && into.length > 2);
    d.player.x = 19;
    d.player.y = 6;
    assert.equal(walkable(d, 20, 6), true);
    assert.ok(dist(d.player, d.machines.jack) <= 2);
    assert.doesNotMatch(d.journal.find((j) => j.id === "sinks-now")?.text ?? "", /good|evil|hero|villain/i);
  });
});

describe("oakhaven drinks the sinks", () => {
  it("turns a pump fact into a stall, a clinic, and a sentence that is not a class", () => {
    const d = world();
    reconcileWorld(d);
    assert.equal(regionOpen(d, null), true);
    assert.equal(d.flags.wardMarket, false);
    assert.equal(d.flags.wardClinic, false);
    assert.equal(d.actors.nessa?.mapId, "haven");
    assert.equal(d.journal.find((j) => j.id === "oakhaven"), undefined);
    assert.match(becoming(d), /not a class/);

    d.flags.pumpFate = "mend";
    reconcileWorld(d);
    const cistern = d.machines.cistern;
    const main = cistern.nodes.find((n) => n.id === "main");
    const market = cistern.nodes.find((n) => n.id === "market");
    const clinic = cistern.nodes.find((n) => n.id === "clinic");
    if (!main || !market || !clinic) throw new Error("cistern");
    assert.equal(nodeLive(cistern.nodes, main), true);
    assert.equal(nodeLive(cistern.nodes, market), true);
    assert.equal(nodeLive(cistern.nodes, clinic), true);
    assert.equal(d.flags.wardGoods, "clean");
    assert.match(d.journal.find((j) => j.id === "oakhaven")?.text ?? "", /stall and the clinic/);
    const saved = structuredClone(d);
    reconcileWorld(saved);
    assert.equal(saved.flags.wardGoods, "clean");
    assert.equal(saved.flags.wardSplit ?? "shared", d.flags.wardSplit ?? "shared");
    assert.equal(nodeLive(saved.machines.cistern.nodes, saved.machines.cistern.nodes.find((n) => n.id === "market")!), true);

    d.mapId = "haven";
    d.player.mapId = "haven";
    d.player.x = 10;
    d.player.y = 12;
    const approach = pathTo(d, 15, 4);
    assert.ok(approach && approach.length > 2);
    assert.equal(walkable(d, 16, 4), false);
    d.player.x = 15;
    d.player.y = 4;
    d.focus = 20;
    runSpecial(d, "cistern", "to-clinic");
    assert.equal(d.flags.wardSplit, "clinic");
    assert.equal(d.flags.wardMarket, false);
    assert.equal(d.flags.wardClinic, true);
    assert.equal(d.verbs?.redirect, 1);
    assert.match(d.journal.find((j) => j.id === "oakhaven")?.text ?? "", /clinic has the feed/);
    assert.equal(replyVisible(d, [{ flag: "wardGoods", is: "none" }]), true);
    assert.equal(replyVisible(d, [{ flag: "wardClinic", is: true }]), true);

    d.player.skills.engineering = 95;
    d.focus = 30;
    runSpecial(d, "cistern", "seat-both");
    assert.equal(d.flags.wardSplit, "shared");
    assert.equal(d.flags.wardSeated, true);
    assert.equal(d.flags.wardMarket, true);
    assert.equal(d.flags.wardClinic, true);
    assert.ok((d.verbs?.mend ?? 0) >= 1);

    market.revealed = true;
    market.confidence = "confident";
    d.player.skills.audit = 95;
    d.focus = 40;
    let cuts = 0;
    while (d.flags.wardSplit !== "clinic" && cuts++ < 8) {
      d.focus = 40;
      d.phase = "play";
      unmendNode(d, { kind: "machine", id: "cistern" }, "market");
    }
    assert.equal(d.flags.wardSplit, "clinic");
    assert.equal(d.flags.wardMarket, false);
    const before = d.flags.wardSplit;
    main.revealed = true;
    unmendNode(d, { kind: "machine", id: "cistern" }, "main");
    assert.equal(d.flags.wardSplit, before);
    assert.match(d.log.join("\n"), /child of the Sinks/);

    d.flags.pumpFate = "bleed";
    d.flags.wardSplit = "shared";
    reconcileWorld(d);
    assert.equal(d.flags.wardGoods, "brown");
    d.flags.provisionalStamp = true;
    reconcileWorld(d);
    assert.equal(d.flags.wardGoods, "stamped");
    assert.equal(replyVisible(d, [{ flag: "wardGoods", is: "stamped" }, { scrip: 12 }]), false);
    d.scrip = 20;
    assert.equal(replyVisible(d, [{ flag: "wardGoods", is: "stamped" }, { scrip: 12 }]), true);

    delete d.actors.nessa;
    reconcileWorld(d);
    assert.equal(d.actors.nessa?.name, "Nessa");
    assert.equal(d.actors.nessa?.mapId, "haven");

    d.verbs = { audit: 4, mend: 3, redirect: 3 };
    const line = becoming(d);
    assert.match(line, /Silas is becoming/);
    assert.doesNotMatch(line, /class|good|evil|rank/i);
    const facts = buildEpilogue(d, "release").join("\n");
    assert.match(facts, /lower ward|provisional|clinic|stall/i);
    assert.doesNotMatch(facts, /good ending|bad ending|morality/i);
    assert.match(CONVOS.nessa.nodes.start.text, /cistern/);
    assert.match(CONVOS.quill.nodes.start.text, /Pricing, not punishment/);
    assert.equal(CONVOS.bram.nodes.run.replies[0]?.effects?.some((e) => e.op === "flag" && e.key === "bramRan"), true);
  });
});

describe("the city is one machine", () => {
  it("moves quarry stone only when the stair and the road agree, then the hearth remembers", () => {
    const d = world();
    reconcileWorld(d);
    assert.equal(d.flags.quarryStone, "hung");
    assert.equal(d.flags.stoneMoving, false);
    assert.equal(d.journal.find((j) => j.id === "city-now"), undefined);
    assert.equal(d.machines.hearth?.mapId, "rust");
    assert.equal(d.machines.hearth?.x, 8);
    assert.equal(d.machines.hearth?.y, 7);

    d.flags.workersClear = true;
    d.flags.checkpointLead = "varr";
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 12;
    d.player.y = 4;
    runSpecial(d, "crane", "drop");
    assert.equal(d.flags["crane:dropped"], true);
    assert.equal(d.flags.quarryStone, "clear");
    assert.equal(d.flags.plateStair, true);
    assert.equal(d.flags.roadWatch, false);
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.tenementWarm, true);
    assert.equal(d.flags.guildWarm, true);
    const haul = d.machines.hearth.nodes.find((n) => n.id === "haul");
    const bed = d.machines.hearth.nodes.find((n) => n.id === "bed");
    if (!haul || !bed) throw new Error("hearth");
    assert.equal(nodeLive(d.machines.hearth.nodes, haul), true);
    assert.equal(nodeLive(d.machines.hearth.nodes, bed), true);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /both have heat/);
    assert.match(d.log.join("\n"), /riggers were not under it/);

    const saved = structuredClone(d);
    reconcileWorld(saved);
    assert.equal(saved.flags.quarryStone, "clear");
    assert.equal(saved.flags.stoneMoving, true);
    assert.equal(saved.flags.tenementWarm, true);
    assert.equal(saved.journal.filter((j) => j.id === "city-now").length, 1);

    d.flags.workerHurt = true;
    reconcileWorld(d);
    assert.equal(d.flags.quarryStone, "scarred");
    assert.equal(d.flags.stoneMoving, true);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /rigger was under it/);

    d.flags.checkpointLead = "vacant";
    reconcileWorld(d);
    assert.equal(d.flags.plateStair, false);
    assert.equal(d.flags.roadWatch, true);
    assert.equal(d.flags.stoneMoving, false);
    assert.equal(d.flags.tenementWarm, false);
    assert.equal(d.flags.guildWarm, false);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /road mouth/);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /hearth is cold/);

    d.flags.checkpointLead = "varr";
    reconcileWorld(d);
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.tenementWarm, true);

    d.mapId = "rust";
    d.player.mapId = "rust";
    d.player.x = 8;
    d.player.y = 7;
    d.focus = 30;
    runSpecial(d, "hearth", "to-hall");
    assert.equal(d.flags.hearthSplit, "hall");
    assert.equal(d.flags.tenementWarm, false);
    assert.equal(d.flags.guildWarm, true);
    assert.equal(d.verbs?.redirect, 1);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /sleepers are not/);

    d.flags.checkpointLead = "vacant";
    reconcileWorld(d);
    assert.equal(d.flags.stoneMoving, false);
    assert.equal(d.flags.guildWarm, false);
    d.focus = 30;
    runSpecial(d, "hearth", "bank");
    assert.equal(d.flags.hearthHeld, true);
    assert.equal(d.verbs?.brace, 1);
    assert.equal(d.flags.stoneMoving, false);
    assert.equal(d.flags.guildWarm, true);
    assert.equal(d.flags.tenementWarm, false);
    assert.match(d.journal.find((j) => j.id === "city-now")?.text ?? "", /banked by hand/);
    assert.equal(bed.dependsOn.length, 0);
    assert.equal(nodeLive(d.machines.hearth.nodes, bed), true);

    d.player.skills.engineering = 95;
    d.focus = 30;
    runSpecial(d, "hearth", "seat-heat");
    assert.equal(d.flags.hearthSplit, "shared");
    assert.equal(d.flags.hearthSeated, true);
    assert.equal(d.flags.tenementWarm, true);
    assert.equal(d.flags.guildWarm, true);
    assert.ok((d.verbs?.mend ?? 0) >= 1);
    assert.equal(replyVisible(d, [{ flag: "hearthHeld", is: true }, { flag: "stoneMoving", is: false }]), true);
    assert.equal(replyVisible(d, [{ flag: "tenementWarm", is: true }, { flag: "stoneMoving", is: true }]), false);

    const slab = d.machines.crane.nodes.find((n) => n.id === "slab");
    if (!slab) throw new Error("slab");
    slab.revealed = true;
    slab.confidence = "understood";
    openAudit(d, { kind: "machine", id: "hearth" });
    assert.match(d.log.join("\n"), /suspended load/);
    assert.match(forecast(d.machines.crane.nodes, slab), /suspended load/);

    const facts = buildEpilogue(d, "release").join("\n");
    assert.match(facts, /quarry slab came down on a rigger/);
    assert.match(facts, /banked by hand/);
    assert.match(facts, /Both flues were seated/);
    assert.doesNotMatch(facts, /good ending|bad ending|morality/i);
    assert.doesNotMatch(d.journal.find((j) => j.id === "city-now")?.text ?? "", /good|evil|hero|villain/i);
    assert.match(CONVOS.workers.nodes["after-scar"].text, /does not become innocent/);
    assert.match(CONVOS.ives.nodes["stone-bank"].text, /not a quarry/);
    assert.match(CONVOS.vane.nodes.labor.text, /warm tenement/);

    const again = structuredClone(d);
    reconcileWorld(again);
    assert.equal(again.flags.hearthHeld, true);
    assert.equal(again.flags.tenementWarm, true);
    assert.equal(again.flags.quarryStone, "scarred");
    assert.equal(again.flags.stoneMoving, false);
  });
});

describe("the city is one dependency network", () => {
  it("carries a sinks cut into food, a levy, an alley, and a forge the player has not stood in yet", () => {
    const d = world();
    reconcileWorld(d);
    assert.equal(d.flags.foodLive, false);
    assert.equal(d.flags.ashAccess, true);
    assert.equal(d.flags.gearLive, false);
    assert.equal(d.flags.nessaRefuses, false);
    assert.equal(d.journal.find((j) => j.id === "network"), undefined);
    assert.equal(WORLD_EDGES.some((e) => e.rel === "supplies" && e.from === "bellows" && e.to === "pressure"), true);
    assert.ok(WORLD_EDGES.filter((e) => e.gate !== "note").length > 20);

    d.mapId = "haven";
    d.player.mapId = "haven";
    d.player.x = 10;
    d.player.y = 12;
    const toPlots = pathTo(d, 27, 5);
    assert.ok(toPlots && toPlots.length > 4);
    assert.equal(walkable(d, 28, 5), false);
    assert.equal(walkable(d, 8, 16), true);
    d.player.x = 8;
    d.player.y = 18;
    assert.ok(pathTo(d, 10, 12));
    d.mapId = "sinks";
    d.player.mapId = "sinks";
    d.player.x = 7;
    d.player.y = 13;

    d.flags.pumpFate = "mend";
    reconcileWorld(d);
    assert.equal(d.flags.foodLive, true);
    assert.equal(d.flags.levyLive, true);
    assert.equal(d.flags.ashAccess, false);
    assert.equal(d.flags.nessaSells, true);
    assert.equal(d.flags.foodPrice, 6);
    assert.equal(d.flags.quenchLive, true);
    assert.match(d.journal.find((j) => j.id === "network")?.text ?? "", /levy/);
    assert.doesNotMatch(d.log.join("\n"), /ward plots take/);

    d.mapId = "haven";
    reconcileWorld(d);
    assert.match(d.log.join("\n"), /ward plots take/);
    assert.equal(walkable(d, 8, 16), false);
    d.player.mapId = "haven";
    d.player.x = 8;
    d.player.y = 18;
    assert.equal(pathTo(d, 10, 12), null);
    const saved = structuredClone(d);
    reconcileWorld(saved);
    assert.equal(saved.flags.foodLive, true);
    assert.equal(saved.flags.ashAccess, false);
    assert.equal(saved.flags.levyLive, true);
    assert.equal(saved.journal.filter((j) => j.id === "network").length, 1);

    const reed = d.machines.bellows.nodes.find((n) => n.id === "reed");
    if (!reed) throw new Error("reed");
    reed.severed = true;
    reed.integrity = 0;
    d.mapId = "sinks";
    reconcileWorld(d);
    assert.equal(d.flags.bellowsLive, false);
    assert.equal(d.flags.foodLive, false);
    assert.equal(d.flags.quenchLive, false);
    assert.equal(d.flags.ashAccess, true);
    assert.equal(d.flags.nessaRefuses, true);
    assert.doesNotMatch(d.log.join("\n"), /ward plots dry/);
    d.mapId = "haven";
    reconcileWorld(d);
    assert.match(d.log.join("\n"), /ward plots dry/);
    assert.equal(replyVisible(d, [{ flag: "nessaRefuses", is: true }]), true);

    reed.severed = false;
    reed.integrity = 100;
    d.flags.workersClear = true;
    d.flags.checkpointLead = "varr";
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 12;
    d.player.y = 4;
    d.focus = 40;
    runSpecial(d, "crane", "drop");
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.oreSound, true);
    assert.equal(d.flags.gearLive, true);
    assert.equal(d.flags.foodLive, true);
    d.mapId = "rust";
    d.player.mapId = "rust";
    d.player.x = 4;
    d.player.y = 12;
    assert.ok(pathTo(d, 25, 6));
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 10;
    d.player.y = 12;
    assert.ok(pathTo(d, 16, 17));
    d.mapId = "rust";
    reconcileWorld(d);
    assert.match(d.log.join("\n"), /Rust forge/);

    const throat = d.machines.colossus.nodes.find((n) => n.id === "throat");
    if (!throat) throw new Error("throat");
    throat.severed = true;
    throat.integrity = 0;
    reconcileWorld(d);
    assert.equal(d.flags.oreSound, false);
    assert.equal(d.flags.gearLive, false);
    assert.equal(d.flags.stoneMoving, true);

    throat.severed = false;
    throat.integrity = 100;
    d.flags.colossusMended = true;
    reconcileWorld(d);
    assert.equal(d.flags.gearLive, true);

    d.player.mapId = "rust";
    d.player.x = 26;
    d.player.y = 6;
    d.focus = 30;
    runSpecial(d, "forge", "refuse-stock");
    assert.equal(d.flags.stockRefused, true);
    assert.equal(d.flags.gearLive, false);
    assert.equal(d.flags.oreSound, true);

    d.mapId = "haven";
    d.player.mapId = "haven";
    d.player.x = 28;
    d.player.y = 5;
    d.focus = 30;
    runSpecial(d, "plots", "let-lie");
    assert.equal(d.flags.plotsRefused, true);
    assert.equal(d.flags.foodLive, false);
    assert.equal(d.flags.levyLive, false);
    assert.equal(d.flags.wardGoods, "clean");
    assert.equal(d.flags.ashAccess, false);

    d.flags.bramHoard = true;
    reconcileWorld(d);
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.citadelSupplied, false);

    d.flags.toldWren = true;
    reconcileWorld(d);
    assert.equal(d.flags.workersKnow, true);
    assert.equal(replyVisible(d, [{ flag: "workersKnow", is: true }]), true);

    d.flags.citadelOpen = true;
    const glass = d.machines.lamps.nodes.find((n) => n.id === "glass");
    if (!glass) throw new Error("glass");
    glass.severed = true;
    glass.integrity = 0;
    reconcileWorld(d);
    assert.equal(d.flags.citadelPower, true);
    assert.equal(d.flags.roadDark, true);
    assert.doesNotMatch(d.log.join("\n"), /road lamps are dark/);
    d.mapId = "road";
    reconcileWorld(d);
    assert.match(d.log.join("\n"), /road lamps are dark/);

    const siphon = d.machines.crucible.nodes.find((n) => n.id === "siphon");
    if (!siphon) throw new Error("siphon");
    siphon.severed = true;
    siphon.integrity = 0;
    d.flags.citadelFate = "sever";
    reconcileWorld(d);
    assert.equal(d.flags.citadelPower, false);
    assert.equal(d.flags.sentryLoose, true);

    const text = d.journal.find((j) => j.id === "network")?.text ?? "";
    assert.doesNotMatch(text, /good|evil|hero|villain|morality/i);
    const facts = buildEpilogue(d, "release").join("\n");
    assert.match(facts, /levy|refused/);
    assert.doesNotMatch(facts, /good ending|bad ending|morality/i);
    assert.match(CONVOS.quill.nodes.levy.text, /same pipe|different pipes/);
    assert.match(CONVOS.wren.nodes.lung.text, /lung/);
    assert.equal(CONVOS["ash-cut"].nodes.start.replies[0]?.end, true);
  });
});

describe("companions, gear, quests, and the fights that read them", () => {
  it("keeps a kit, a bond, and a quest on the same facts after a save", () => {
    const d = world();
    reconcileWorld(d);
    const tobin = d.actors.tobin;
    assert.equal(tobin.habit, "brace");
    assert.equal(tobin.kit?.weapon, "prybar");
    assert.equal(tobin.kit?.armor, "wrap");
    assert.equal(tobin.kit?.accessory, "strap");
    assert.equal(tobin.bond?.trust, 40);
    assert.equal(tobin.bond?.accord, 50);
    assert.equal(tobin.bond?.fear, 10);

    d.phase = "play";
    d.actors.kael.hostile = false;
    startCombat(d, ["rel1"]);
    if (d.combat) endPlayerTurn(d);
    assert.match(d.log.join("\n"), /Pye steps out/);
    assert.equal(d.actors.rel1.hostile, false);
    d.combat = null;

    applyEffects(d, [{ op: "recruit", id: "tobin" }]);
    assert.equal(tobin.companion, true);
    addItem(d, "hook", 1);
    assert.equal(equipCompanion(d, "tobin", "weapon", "hook"), true);
    assert.equal(weaponOf(tobin).id, "hook");
    assert.equal(weaponOf(tobin).pin, true);
    assert.equal(d.inventory.find((i) => i.id === "hook"), undefined);
    const hands = tobin.nodes.find((n) => n.id === "hands");
    if (!hands) throw new Error("hands");
    hands.severed = true;
    assert.equal(weaponOf(tobin).id, "fist");
    hands.severed = false;
    hands.integrity = 100;
    assert.equal(weaponOf(tobin).id, "hook");
    const saved = structuredClone(d);
    assert.equal(saved.actors.tobin.kit?.weapon, "hook");
    assert.equal(saved.actors.tobin.habit, "brace");

    d.flags.pumpFate = "mend";
    d.mapId = "sinks";
    reconcileWorld(d);
    assert.ok(tobin.memories?.includes("plots-fed"));
    assert.ok((tobin.bond?.accord ?? 0) > 50);
    assert.equal(d.flags["quest:dry-ward"], "done");
    assert.match(d.journal.find((j) => j.id === "dry-ward")?.text ?? "", /levy/);
    assert.doesNotMatch(d.journal.find((j) => j.id === "dry-ward")?.text ?? "", /good|evil|hero|villain|morality/i);

    const reed = d.machines.bellows.nodes.find((n) => n.id === "reed");
    if (!reed) throw new Error("reed");
    reed.severed = true;
    reed.integrity = 0;
    reconcileWorld(d);
    assert.ok(tobin.memories?.includes("lung-cut"));
    assert.ok((tobin.bond?.fear ?? 0) > 10);
    assert.equal(tobin.kit?.weapon, "hook");
    reconcileWorld(d);
    assert.equal(d.flags["quest:dry-ward"], "done");
    assert.equal(d.journal.filter((j) => j.id === "dry-ward").length, 1);
    assert.equal(tobin.kit?.weapon, "hook");

    d.flags.stockRefused = true;
    d.mapId = "rust";
    reconcileWorld(d);
    assert.equal(d.flags["quest:empty-forge"], "done");
    assert.match(d.journal.find((j) => j.id === "empty-forge")?.text ?? "", /refused/);

    const guard = d.actors.guard1;
    const orders = guard.nodes.find((n) => n.id === "orders");
    if (!orders) throw new Error("orders");
    orders.severed = true;
    orders.integrity = 0;
    assert.equal(gait(guard), "dead");
    guard.skills.mechanics = 0;
    guard.hostile = true;
    guard.mapId = "citadel";
    guard.x = 19;
    guard.y = 13;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    d.player.x = 18;
    d.player.y = 13;
    d.phase = "play";
    d.combat = { order: ["player", "guard1"], index: 0, round: 1, audited: [] };
    endPlayerTurn(d);
    assert.match(d.log.join("\n"), /no order left/);

    tobin.kit!.armor = "vest";
    assert.equal(companionAp(tobin), 5);
    tobin.kit!.armor = "wrap";
    assert.equal(companionAp(tobin), 6);

    const varr = d.actors.varr;
    const rifle = varr.nodes.find((n) => n.id === "rifle");
    if (!rifle) throw new Error("rifle");
    rifle.revealed = true;
    rifle.severed = false;
    rifle.integrity = 100;
    const pinned = pinOnHit(varr.nodes);
    assert.equal(pinned?.id, "rifle");
    assert.equal(rifle.pinned, true);

    d.actors.sera.companion = false;
    tobin.companion = true;
    if (tobin.bond) tobin.bond.accord = 32;
    const low = buildEpilogue(d, "release").join("\n");
    assert.match(low, /did not agree/);
    assert.match(low, /did not leave/);
    assert.doesNotMatch(low, /good ending|bad ending|morality/i);

    d.mapId = "road";
    d.player.mapId = "road";
    d.player.x = 3;
    d.player.y = 4;
    assert.ok(pathTo(d, 21, 4));
    assert.ok(pathTo(d, 20, 12));
    assert.equal(d.actors.lark?.mapId, "road");
    d.flags.act1 = true;
    assert.equal(replyVisible(d, [{ flag: "act1", is: true }, { noCompanion: true }]), false);
  });

  it("keeps a mended ledger, a severed ledger, and a mixed ledger distinct after save", () => {
    const boot = () => {
      const d = world();
      reconcileWorld(d);
      return d;
    };
    const mend = boot();
    mend.flags.pumpFate = "mend";
    mend.flags.reedRead = true;
    mend.mapId = "haven";
    reconcileWorld(mend);
    assert.equal(mend.flags.foodLive, true);
    assert.equal(mend.flags.ashAccess, false);
    assert.equal(mend.flags["quest:dry-ward"], "done");
    assert.equal(mend.actors.tobin.memories?.includes("plots-fed"), true);
    const mendSave = structuredClone(mend);
    reconcileWorld(mendSave);
    assert.equal(mendSave.flags.foodLive, true);
    assert.equal(mendSave.flags["quest:dry-ward"], "done");
    assert.equal(mendSave.actors.tobin.kit?.weapon, "prybar");

    const cut = boot();
    const reed = cut.machines.bellows.nodes.find((n) => n.id === "reed");
    const glass = cut.machines.lamps.nodes.find((n) => n.id === "glass");
    if (!reed || !glass) throw new Error("seam");
    reed.severed = true;
    reed.integrity = 0;
    reed.revealed = true;
    glass.severed = true;
    glass.integrity = 0;
    cut.flags.stockRefused = true;
    cut.flags.citadelOpen = true;
    cut.mapId = "rust";
    reconcileWorld(cut);
    assert.equal(cut.flags.foodLive, false);
    assert.equal(cut.flags.ashAccess, true);
    assert.equal(cut.flags.gearLive, false);
    assert.equal(cut.flags.roadDark, true);
    assert.equal(cut.flags["quest:empty-forge"], "done");
    assert.equal(cut.flags["quest:dark-road"], "done");
    assert.ok(cut.actors.tobin.memories?.includes("lung-cut"));
    const cutSave = structuredClone(cut);
    reconcileWorld(cutSave);
    assert.equal(cutSave.flags.foodLive, false);
    assert.equal(cutSave.flags.roadDark, true);
    assert.equal(cutSave.flags["quest:dark-road"], "done");

    const mix = boot();
    mix.flags.pumpFate = "mend";
    mix.flags.stockRefused = true;
    mix.flags.citadelOpen = true;
    mix.flags.roadBypass = true;
    mix.mapId = "haven";
    reconcileWorld(mix);
    assert.equal(mix.flags.foodLive, true);
    assert.equal(mix.flags.gearLive, false);
    assert.equal(mix.flags["quest:dry-ward"], "done");
    assert.equal(mix.flags["quest:empty-forge"], "done");
    assert.equal(mix.flags["quest:dark-road"], "done");
    assert.notEqual(mix.flags.foodLive, cut.flags.foodLive);
    assert.equal(mix.flags.ashAccess, false);
    assert.equal(cut.flags.ashAccess, true);
    assert.notEqual(Boolean(mix.flags.roadDark), true);
    for (const ledger of [mend, cut, mix]) {
      const facts = buildEpilogue(ledger, "release").join("\n");
      assert.doesNotMatch(facts, /good ending|bad ending|morality/i);
    }
  });
});

describe("the walked campaign", () => {
  it("leaves the Sinks on foot, returns to a changed ward, and keeps the moth beside a person", () => {
    const d = world();
    reconcileWorld(d);
    assert.equal(d.actors.cinder?.mapId, "sinks");
    assert.equal(d.actors.cinder?.template, "cinder");
    assert.match(d.journal.find((j) => j.id === "silas-now")?.text ?? "", /repair what is broken/i);
    assert.doesNotMatch(d.journal.find((j) => j.id === "silas-now")?.text ?? "", /good|evil|hero|villain|morality/i);

    d.player.x = 24;
    d.player.y = 18;
    d.player.mapId = "sinks";
    assert.ok(pathTo(d, 25, 18));
    d.player.x = 25;
    d.player.y = 18;
    depart(d);
    assert.equal(d.mapId, "road");
    assert.equal(d.player.x, 5);
    assert.equal(d.player.y, 5);
    assert.equal(MOUTHS.some((m) => m.map === "road" && m.x === 5 && m.y === 5), false);
    assert.ok(pathTo(d, 20, 3));
    assert.ok(pathTo(d, 33, 4));

    d.player.x = 20;
    d.player.y = 1;
    depart(d);
    assert.equal(d.mapId, "haven");
    assert.equal(d.player.x, 33);
    assert.equal(d.player.y, 6);
    assert.ok(pathTo(d, 27, 5));

    d.pendingMap = "haven";
    delete d.flags.landX;
    delete d.flags.landY;
    arrive(d);
    assert.match(d.log.join("\n"), /Oakhaven again/);

    d.flags.pumpFate = "mend";
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 12;
    d.player.y = 4;
    d.flags.workersClear = true;
    d.focus = 40;
    reconcileWorld(d);
    assert.equal(d.flags["quest:lost-rigger"], "open");
    runSpecial(d, "crane", "drop");
    assert.equal(d.flags.quarryStone, "clear");
    assert.equal(d.flags["quest:lost-rigger"], "done");
    assert.match(d.journal.find((j) => j.id === "lost-rigger")?.text ?? "", /clear/);
    assert.doesNotMatch(d.journal.find((j) => j.id === "lost-rigger")?.text ?? "", /good|evil|hero|villain|morality/i);

    applyEffects(d, [{ op: "recruit", id: "tobin" }]);
    d.flags.cinderFed = true;
    applyEffects(d, [{ op: "recruit", id: "cinder" }]);
    assert.equal(d.actors.tobin.companion, true);
    assert.equal(d.actors.cinder.companion, true);
    assert.equal(d.flags["quest:moth-chooses"], "done");

    d.mapId = "haven";
    d.player.mapId = "haven";
    reconcileWorld(d);
    assert.equal(d.flags.foodLive, true);
    assert.ok(d.actors.cinder.memories?.includes("plots-range"));
    const before = d.player.x;
    movePlayer(d, before === 33 ? 32 : 33, 6);
    assert.equal(d.actors.tobin.x === d.player.x && d.actors.tobin.y === d.player.y, false);

    d.player.x = 8;
    d.player.y = 16;
    d.mapId = "spire";
    d.player.mapId = "spire";
    d.machines.spireheart && (d.player.x = 8);
    d.player.y = 16;
    d.focus = 20;
    runSpecial(d, "spireheart", "read-heart");
    assert.match(d.log.join("\n"), /issued baseline/);
    runSpecial(d, "spireheart", "release");
    assert.equal(d.phase, "epilogue");
    assert.equal(d.ending, "release");
    const facts = d.epilogue.join("\n");
    assert.match(facts, /reed moth|moth/i);
    assert.doesNotMatch(facts, /good ending|bad ending|morality/i);
  });
});

describe("a second ledger is not the same city", () => {
  it("lets the moth leave and return, moves a child when the plots drink, and keeps both endings factual", () => {
    const d = world();
    reconcileWorld(d);
    d.flags.cinderFed = true;
    d.flags.cinderChose = true;
    applyEffects(d, [{ op: "recruit", id: "cinder" }, { op: "recruit", id: "tobin" }]);
    assert.equal(d.actors.cinder.companion, true);
    assert.equal(d.actors.tobin.companion, true);
    d.mapId = "haven";
    d.player.mapId = "haven";
    reconcileWorld(d);
    assert.equal(d.journal.find((j) => j.id === "moth-weather")?.title, "What the moth knows");
    assert.match(d.journal.find((j) => j.id === "moth-weather")?.text ?? "", /reed|bed|parent/i);

    const reed = d.machines.bellows.nodes.find((n) => n.id === "reed");
    if (!reed) throw new Error("reed");
    reed.severed = true;
    reed.integrity = 0;
    d.flags.hearthHeld = true;
    d.mapId = "rust";
    d.player.mapId = "rust";
    d.player.x = 4;
    d.player.y = 12;
    d.dialogue = null;
    reconcileWorld(d);
    assert.equal((d.dialogue as { convo: string } | null)?.convo, "cinder-heat");
    applyEffects(d, [{ op: "flag", key: "cinderLeft", value: true }]);
    assert.equal(d.actors.cinder.companion, false);
    assert.equal(d.actors.cinder.mapId, "sinks");
    assert.equal(d.actors.tobin.companion, true);
    const saved = structuredClone(d);
    reconcileWorld(saved);
    assert.equal(saved.flags.cinderLeft, true);
    assert.equal(saved.actors.cinder.companion, false);
    assert.equal(saved.actors.cinder.mapId, "sinks");

    reed.severed = false;
    reed.integrity = 100;
    d.mapId = "sinks";
    d.player.mapId = "sinks";
    d.player.x = 29;
    d.player.y = 3;
    d.dialogue = null;
    reconcileWorld(d);
    assert.equal(d.flags.bellowsLive, true);
    assert.equal(d.actors.cinder.companion, true);
    assert.equal(d.flags.cinderBack, true);
    assert.equal(d.flags["quest:moth-return"], "done");

    d.flags.pumpFate = "mend";
    d.mapId = "haven";
    d.player.mapId = "haven";
    d.player.x = 10;
    d.player.y = 12;
    reconcileWorld(d);
    assert.equal(d.flags.foodLive, true);
    assert.equal(d.flags.pipHome, true);
    assert.equal(d.actors.pip?.mapId, "haven");
    assert.equal(d.actors.pip?.x, 30);
    assert.equal(d.actors.pip?.y, 7);
    assert.equal(d.actors.sela?.x, 29);
    assert.match(d.journal.find((j) => j.id === "silas-now")?.text ?? "", /levy/);
    assert.doesNotMatch(d.journal.find((j) => j.id === "silas-now")?.text ?? "", /good|evil|hero|villain|morality/);

    d.equipped.armor = "cleat";
    d.mapId = "tundra";
    d.player.mapId = "tundra";
    d.player.x = 10;
    d.player.y = 4;
    const hp = d.player.hp;
    movePlayer(d, 10, 5);
    assert.equal(d.player.hp, hp);

    d.player.x = 8;
    d.player.y = 16;
    d.mapId = "spire";
    d.player.mapId = "spire";
    d.focus = 20;
    runSpecial(d, "spireheart", "read-heart");
    assert.match(d.log.join("\n"), /issued baseline/);
    assert.match(d.log.join("\n"), /ward that eats/);
    const shape = buildEpilogue(d, "impose").join("\n");
    const holes = buildEpilogue(d, "release").join("\n");
    assert.match(shape, /wrote the shape/i);
    assert.match(holes, /left the holes/i);
    assert.match(shape, /child slept in the service cut/);
    assert.match(holes, /second time|reed moth/i);
    assert.notEqual(shape.split("\n")[0], holes.split("\n")[0]);
    assert.doesNotMatch(shape + holes, /good ending|bad ending|morality/i);
  });
});

describe("the city stays legible without announcing itself", () => {
  it("records a meal in the ledger and does not shout the quest", () => {
    const d = world();
    d.flags.pumpFate = "mend";
    d.flags["seen:haven"] = true;
    const before = d.log.length;
    reconcileWorld(d);
    const fresh = d.log.slice(0, d.log.length - before).join("\n");
    assert.equal(d.journal.find((j) => j.id === "dry-ward")?.status, "done");
    assert.doesNotMatch(fresh, /experience|QUEST/i);
    assert.equal(d.actors.pip?.x, 30);
    assert.equal(d.actors.pip?.y, 7);
    d.flags.hour = 2;
    d.flags.heardHour = 2;
    reconcileWorld(d);
    assert.equal(d.actors.pip?.x === 30 && d.actors.pip?.y === 7, false);
    assert.equal(d.actors.pip?.mapId, "haven");
  });

  it("describes Cinder as an animal and keeps two ledgers from telling one story", () => {
    const mend = world();
    mend.flags.pumpFate = "mend";
    mend.flags.cinderFed = true;
    applyEffects(mend, [{ op: "recruit", id: "cinder" }]);
    mend.mapId = "haven";
    mend.player.mapId = "haven";
    reconcileWorld(mend);
    const lines = companyLines(mend, mend.actors.cinder).join(" ");
    assert.match(lines, /Cinder/);
    assert.match(lines, /reed|plots|shadow/);
    assert.doesNotMatch(lines, /Trust|Loyalty|Respect|Accord|\+\d/);
    const mendText = buildEpilogue(mend, "impose").join("\n");

    const cut = world();
    const reed = cut.machines.bellows.nodes.find((n) => n.id === "reed");
    if (!reed) throw new Error("reed");
    reed.revealed = true;
    reed.severed = true;
    reed.integrity = 0;
    cut.flags.stockRefused = true;
    cut.flags.plotsRefused = true;
    cut.flags.cinderFed = true;
    cut.flags.cinderLeft = true;
    reconcileWorld(cut);
    const known = companyLines(cut, cut.actors.cinder).join(" ");
    assert.match(known, /left the shadow|stopped reed/);
    assert.doesNotMatch(known, /Trust|Loyalty/);
    const cutText = buildEpilogue(cut, "release").join("\n");
    assert.match(mendText, /plots were drinking/);
    assert.match(cutText, /bellows was stopped|stopped lung|reed moth left/i);
    assert.match(cutText, /refused/);
    assert.notEqual(mendText, cutText);
    assert.doesNotMatch(mendText + cutText, /good ending|bad ending|morality/i);
  });

  it("lets the districts move when a parent moves, and keeps the two walks apart", () => {
    const fresh = world();
    reconcileWorld(fresh);
    assert.equal(fresh.actors.doss?.x, 24);
    assert.equal(fresh.actors.doss?.y, 5);
    assert.equal(fresh.actors.ada?.mapId, "haven");
    assert.equal(fresh.actors.pim?.x, 18);
    assert.equal(fresh.actors.pim?.y, 16);
    assert.equal(fresh.actors.sarn?.x, 14);
    assert.equal(fresh.actors.sarn?.y, 8);
    if (fresh.flags.hollowWarm) {
      assert.equal(fresh.actors.drift?.x, 13);
      assert.equal(fresh.actors.drift?.y, 15);
    } else {
      assert.equal(fresh.actors.drift?.x, 8);
      assert.equal(fresh.actors.drift?.y, 15);
    }
    assert.equal(replyVisible(fresh, CONVOS.doss.nodes.start.replies.find((r) => r.goto === "stopped")?.requires), false);

    const fed = world();
    fed.flags.pumpFate = "mend";
    fed.flags["seen:haven"] = true;
    reconcileWorld(fed);
    assert.equal(fed.actors.pip?.x, 30);
    assert.equal(fed.actors.pip?.y, 7);
    assert.equal(fed.actors.ada?.x, 27);
    assert.equal(fed.actors.ada?.y, 6);
    assert.equal(fed.flags.hour ?? 0, 0);

    const quiet = world();
    const reed = quiet.machines.bellows.nodes.find((n) => n.id === "reed");
    if (!reed) throw new Error("reed");
    reed.revealed = true;
    reed.severed = true;
    reed.integrity = 0;
    quiet.flags["crane:dropped"] = true;
    quiet.flags.workerHurt = true;
    quiet.flags.plotsRefused = true;
    quiet.mapId = "sinks";
    reconcileWorld(quiet);
    assert.equal(quiet.flags.bellowsLive, false);
    assert.equal(quiet.actors.doss?.x, 6);
    assert.equal(quiet.actors.doss?.y, 4);
    assert.equal(quiet.flags.dossShift, true);
    assert.equal(quiet.flags.quarryStone, "scarred");
    assert.equal(quiet.actors.pim?.x, 18);
    assert.equal(quiet.actors.pim?.y, 19);
    assert.equal(quiet.flags.foodLive, false);
    assert.equal(quiet.actors.ada?.x, 30);
    assert.equal(quiet.actors.ada?.y, 8);
    assert.equal(replyVisible(quiet, CONVOS.doss.nodes.start.replies.find((r) => r.goto === "stopped")?.requires), true);
    assert.equal(replyVisible(quiet, CONVOS.doss.nodes.start.replies.find((r) => r.goto === "weather")?.requires), false);

    const clear = world();
    clear.flags["crane:dropped"] = true;
    clear.flags.workersClear = true;
    clear.mapId = "quarry";
    clear.player.mapId = "quarry";
    reconcileWorld(clear);
    assert.equal(clear.flags.quarryStone, "clear");
    assert.equal(clear.actors.pim?.x, 11);
    assert.equal(clear.actors.pim?.y, 11);
    assert.equal(clear.flags.pimCount, true);

    const upstairs = world();
    upstairs.mapId = "citadel";
    upstairs.player.mapId = "citadel";
    reconcileWorld(upstairs);
    if (upstairs.flags.guardToll) {
      assert.equal(upstairs.actors.sarn?.x, 18);
      assert.equal(upstairs.actors.sarn?.y, 6);
    }

    const dark = world();
    const sip = dark.machines.crucible.nodes.find((n) => n.id === "siphon");
    if (!sip) throw new Error("siphon");
    sip.severed = true;
    sip.integrity = 0;
    dark.flags.citadelFate = "sever";
    dark.flags.tundraWalked = true;
    reconcileWorld(dark);
    assert.equal(dark.flags.hollowWarm, false);
    assert.equal(dark.actors.drift?.x, 8);
    assert.equal(dark.actors.drift?.y, 15);
    assert.equal(dark.actors.sarn?.x, 30);
    assert.equal(dark.actors.sarn?.y, 10);

    const heard = world();
    heard.flags.reedRead = true;
    heard.flags.bellowsLive = true;
    const take = CONVOS.doss.nodes.weather.replies.find((r) => r.text.startsWith("I'll take"));
    assert.equal(replyVisible(heard, take?.requires), true);
    applyEffects(heard, take?.effects);
    assert.equal(heard.flags.dossSpan, true);
    assert.equal(heard.inventory.some((i) => i.id === "span"), true);
    assert.equal(replyVisible(heard, take?.requires), false);
    const sheet = companyLines(heard, heard.actors.tobin).join(" ");
    assert.doesNotMatch(sheet, /Trust|Loyalty|relationship/i);

    const voices = ["doss", "ada", "pim", "sarn", "drift"]
      .flatMap((id) => Object.values(CONVOS[id].nodes).map((n) => n.text))
      .join("\n");
    assert.doesNotMatch(voices, /Trust|QUEST|relationship value|\+\d/i);

    fed.flags.adaPlate = true;
    fed.flags.dossMet = true;
    fed.flags.pimCount = true;
    fed.flags.driftBed = true;
    fed.flags.sarnMet = true;
    fed.flags.citadelSupplied = true;
    const kept = buildEpilogue(fed, "impose").join("\n");
    const cut = buildEpilogue(quiet, "release").join("\n");
    assert.match(kept, /Ada/);
    assert.match(cut, /Doss/);
    assert.match(cut, /Pim|stone/);
    assert.notEqual(kept, cut);
    assert.doesNotMatch(kept + cut, /good ending|bad ending|you were right to/i);
  });

  it("opens an audit on the seam that is already failing, and lets the moth keep the road", () => {
    const d = world();
    d.player.x = 14;
    d.player.y = 8;
    openAudit(d, { kind: "machine", id: "pump" });
    assert.equal(d.uiNode, "valve");
    d.flags.cinderFed = true;
    applyEffects(d, [
      { op: "recruit", id: "cinder" },
      { op: "flag", key: "cinderSpireStay", value: true },
      { op: "dismiss", id: "cinder" },
    ]);
    assert.equal(d.actors.cinder.companion, false);
    assert.equal(d.actors.cinder.mapId, "road");
    assert.equal(d.actors.cinder.x, 20);
    assert.doesNotMatch(CONVOS["cinder-spire"].nodes.start.text, /Trust|command menu/i);
    assert.ok(CONVOS["tobin-late"]);
  });

  it("lets a pinned cart, a cut glaze, and a stolen quench change rooms the player is not standing in", () => {
    const d = world();
    d.flags.workersClear = true;
    d.flags.checkpointLead = "varr";
    d.flags["crane:dropped"] = true;
    d.player.x = 16;
    d.player.y = 11;
    d.player.mapId = "road";
    d.mapId = "road";
    d.focus = 20;
    reconcileWorld(d);
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.oreSound, true);
    runSpecial(d, "relay", "pin-load");
    assert.equal(d.flags.cartPinned, true);
    assert.equal(d.flags.oreSound, false);
    assert.equal(d.actors.moss?.x, 17);
    assert.equal(d.actors.moss?.mapId, "road");
    runSpecial(d, "relay", "ease-brake");
    assert.equal(d.flags.cartPinned, false);
    assert.equal(d.flags.cartEase, true);
    assert.equal(d.flags.oreSound, true);
    assert.equal(d.inventory.some((i) => i.id === "coupler"), true);

    const ice = world();
    ice.flags.tundraWalked = true;
    ice.player.x = 18;
    ice.player.y = 13;
    ice.player.mapId = "tundra";
    ice.mapId = "tundra";
    ice.focus = 12;
    reconcileWorld(ice);
    assert.equal(ice.flags.hollowWarm, true);
    const drive = ice.machines.orrery.nodes.find((n) => n.id === "drive");
    if (!drive) throw new Error("drive");
    runSpecial(ice, "stake", "cut-span");
    assert.equal(ice.flags.iceCut, true);
    assert.equal(ice.flags.hollowWarm, false);
    assert.equal(nodeLive(ice.machines.orrery.nodes, drive), true);
    assert.match(buildEpilogue(ice, "release").join("\n"), /glaze was cut/);
    assert.doesNotMatch(buildEpilogue(ice, "release").join("\n"), /good ending|bad ending|you were right to/i);

    const rust = world();
    rust.flags.pumpFate = "mend";
    rust.player.x = 6;
    rust.player.y = 15;
    rust.player.mapId = "rust";
    rust.mapId = "rust";
    rust.focus = 20;
    rust.player.skills.engineering = 80;
    reconcileWorld(rust);
    assert.equal(rust.flags.quenchLive, true);
    runSpecial(rust, "wash", "to-sleepers");
    assert.equal(rust.flags.washSpill, true);
    assert.equal(rust.flags.quenchLive, false);
    assert.equal(rust.flags.washLive, true);
    assert.ok(CONVOS.moss);
    assert.ok(CONVOS["tobin-mid"]);
    assert.doesNotMatch(CONVOS.moss.nodes.start.text, /Trust|QUEST|command menu/i);
  });

  it("lets a costume gauge, a licensed cup, a live throat, and a stored night change later rooms", () => {
    const gauge = world();
    gauge.player.x = 4;
    gauge.player.y = 18;
    gauge.mapId = "sinks";
    gauge.player.mapId = "sinks";
    gauge.focus = 20;
    reconcileWorld(gauge);
    assert.equal(gauge.flags.gaugeSeen, true);
    gauge.inventory.push({ id: "listener", qty: 1 });
    useItem(gauge, "listener");
    assert.equal(gauge.machines.gauge.nodes.find((n) => n.id === "pocket")?.revealed, true);
    assert.equal(gauge.machines.gauge.nodes.find((n) => n.id === "feed")?.revealed, false);
    assert.equal(gauge.inventory.some((i) => i.id === "listener"), false);
    openAudit(gauge, { kind: "machine", id: "gauge" });
    assert.equal(gauge.uiNode, "face");
    assert.equal(gauge.machines.gauge.nodes.find((n) => n.id === "face")?.decoy, true);
    runSpecial(gauge, "gauge", "read-face");
    assert.equal(gauge.flags.gaugeRead, true);
    assert.equal(gauge.machines.gauge.nodes.find((n) => n.id === "feed")?.revealed, true);
    assert.equal(gauge.inventory.some((i) => i.id === "listener"), true);
    runSpecial(gauge, "gauge", "cut-feed");
    assert.equal(gauge.flags.gaugeCut, true);
    assert.equal(gauge.actors.servo.hostile, true);
    assert.ok(gauge.combat);

    const heard = world();
    applyEffects(heard, [{ op: "recruit", id: "wren" }]);
    heard.player.x = 4;
    heard.player.y = 18;
    heard.mapId = "sinks";
    heard.player.mapId = "sinks";
    heard.actors.wren.mapId = "sinks";
    heard.actors.wren.x = 5;
    heard.actors.wren.y = 18;
    heard.focus = 20;
    runSpecial(heard, "gauge", "read-face");
    assert.equal(heard.flags.wrenGauge, true);

    const cup = world();
    cup.mapId = "haven";
    cup.player.mapId = "haven";
    cup.player.x = 7;
    cup.player.y = 17;
    cup.focus = 20;
    reconcileWorld(cup);
    assert.equal(cup.flags.ashAccess, true);
    assert.equal(cup.player.y, 17);
    assert.equal(cup.flags.stillSeen, true);
    runSpecial(cup, "still", "license-still");
    assert.equal(cup.flags.stillLicensed, true);
    assert.match(buildEpilogue(cup, "release").join("\n"), /ash still was licensed/i);

    const pit = world();
    pit.mapId = "quarry";
    pit.player.mapId = "quarry";
    pit.player.x = 7;
    pit.player.y = 18;
    pit.focus = 20;
    reconcileWorld(pit);
    assert.equal(pit.flags.winchSeen, true);
    runSpecial(pit, "winchhouse", "brace-winch");
    assert.equal(pit.flags.crewStood, true);
    assert.equal(pit.combat, null);
    assert.equal(pit.inventory.some((i) => i.id === "dog"), true);

    const stillThroat = world();
    const throat = stillThroat.machines.colossus.nodes.find((n) => n.id === "throat");
    if (!throat) throw new Error("throat");
    throat.severed = true;
    throat.integrity = 0;
    stillThroat.mapId = "quarry";
    stillThroat.player.mapId = "quarry";
    stillThroat.player.x = 7;
    stillThroat.player.y = 18;
    stillThroat.focus = 20;
    reconcileWorld(stillThroat);
    assert.equal(stillThroat.flags.colossusBreath, false);
    runSpecial(stillThroat, "winchhouse", "cut-winch");
    assert.equal(stillThroat.flags.winchCut, true);
    assert.ok(stillThroat.combat);

    const night = world();
    night.mapId = "citadel";
    night.player.mapId = "citadel";
    night.player.x = 20;
    night.player.y = 17;
    night.focus = 30;
    reconcileWorld(night);
    assert.equal(night.flags.bufferSeen, true);
    assert.equal(night.combat, null);
    runSpecial(night, "buffer", "charge-cell");
    assert.equal(night.flags.bufferCharged, true);
    runSpecial(night, "crucible", "sever");
    assert.equal(night.flags.bufferHeld, true);
    const told = buildEpilogue(night, "release").join("\n");
    assert.match(told, /One citadel infirmary/);
    assert.doesNotMatch(told, /good ending|bad ending|you were right to/i);
    assert.ok(CONVOS.brin && CONVOS.vetch && CONVOS.holt && CONVOS.ime);
    assert.doesNotMatch(
      [CONVOS.brin, CONVOS.vetch, CONVOS.holt, CONVOS.ime].flatMap((c) => Object.values(c.nodes).map((n) => n.text)).join("\n"),
      /Trust|QUEST|command menu/i,
    );
  });
});

describe("kiln and switch", () => {
  it("keeps new mouths and feet on walkable ground", () => {
    for (const mouth of MOUTHS.filter((m) => m.map === "kiln" || m.to === "kiln" || m.map === "switch" || m.to === "switch")) {
      assert.ok(WALKABLE.has(tileAt(MAPS[mouth.map], mouth.x, mouth.y)), `${mouth.map} ${mouth.x},${mouth.y}`);
      assert.ok(WALKABLE.has(tileAt(MAPS[mouth.to], mouth.tx, mouth.ty)), `${mouth.to} ${mouth.tx},${mouth.ty}`);
    }
    const d = world();
    for (const id of ["harl", "cress", "jun", "teb", "nim", "voss", "hale", "rue", "ske", "wick"]) {
      const a = d.actors[id];
      assert.ok(a, id);
      assert.ok(WALKABLE.has(tileAt(MAPS[a.mapId], a.x, a.y)), id);
    }
  });

  it("does not set brick until water or a field-dry, and a license is not a cut", () => {
    const d = world();
    assert.equal(regionOpen(d, "seen:kiln"), false);
    d.mapId = "kiln";
    d.player.mapId = "kiln";
    d.player.x = 6;
    d.player.y = 7;
    d.focus = 20;
    reconcileWorld(d);
    assert.equal(regionOpen(d, "seen:kiln"), true);
    assert.equal(d.flags.brickLive, false);
    runSpecial(d, "kilnfire", "seat-flue");
    assert.equal(d.flags.brickLive, false);
    assert.equal(d.flags.kilnLevy, false);
    addItem(d, "scrap", 1);
    d.player.skills.engineering = 80;
    runSpecial(d, "kilnfire", "field-dry");
    assert.equal(d.flags.brickLive, true);
    assert.equal(d.flags.kilnLevy, true);
    assert.equal(d.flags.kilnShop, false);
    d.player.x = 20;
    d.player.y = 16;
    d.player.skills.speech = 10;
    d.scrip = 30;
    runSpecial(d, "kilnstamp", "license-stamp");
    assert.equal(d.flags.kilnLicensed, true);
    assert.equal(d.flags.kilnShop, true);
    assert.equal(d.flags.kilnLevy, true);
    assert.equal(d.actors.cress.hostile, false);
  });

  it("opens the kiln board by cutting the stamp and makes Cress answer", () => {
    const d = world();
    d.mapId = "kiln";
    d.player.mapId = "kiln";
    d.player.x = 6;
    d.player.y = 7;
    d.focus = 20;
    d.player.skills.engineering = 80;
    addItem(d, "scrap", 1);
    reconcileWorld(d);
    runSpecial(d, "kilnfire", "seat-flue");
    runSpecial(d, "kilnfire", "field-dry");
    d.player.x = 20;
    d.player.y = 16;
    runSpecial(d, "kilnstamp", "cut-stamp");
    assert.equal(d.flags.kilnShop, true);
    assert.equal(d.flags.kilnLevy, false);
    assert.equal(d.actors.cress.hostile, true);
  });

  it("lets a jammed switch starve a moving pit until a shunt", () => {
    const d = world();
    assert.equal(regionOpen(d, "seen:switch"), false);
    d.flags.workersClear = true;
    d.flags.checkpointLead = "varr";
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 12;
    d.player.y = 4;
    runSpecial(d, "crane", "drop");
    assert.equal(d.flags.stoneMoving, true);
    assert.equal(d.flags.citadelSupplied, true);
    assert.equal(d.flags.switchToll, true);
    d.flags.switchJam = true;
    reconcileWorld(d);
    assert.equal(d.flags.citadelSupplied, false);
    assert.equal(d.flags.switchToll, false);
    d.flags.switchShunt = true;
    reconcileWorld(d);
    assert.equal(d.flags.citadelSupplied, true);
    assert.equal(d.flags.switchToll, false);
    d.mapId = "switch";
    d.player.mapId = "switch";
    d.player.x = 16;
    d.player.y = 8;
    d.focus = 20;
    d.player.skills.engineering = 80;
    addItem(d, "scrap", 1);
    runSpecial(d, "turntable", "grease-axle");
    assert.equal(d.flags.switchGreased, true);
    assert.equal(d.flags.switchShed, true);
    assert.equal(regionOpen(d, "seen:switch"), true);
  });

  it("files a till lifted in front of Rue and misses one lifted at a distance", () => {
    const seen = world();
    seen.mapId = "switch";
    seen.player.mapId = "switch";
    seen.player.x = 4;
    seen.player.y = 7;
    seen.player.skills.sneak = 90;
    reconcileWorld(seen);
    runSpecial(seen, "switchdesk", "lift-till");
    assert.equal(seen.flags.switchCaught, true);
    assert.equal(seen.actors.rue.hostile, true);
    assert.equal(seen.scrip, 14);

    const quiet = world();
    quiet.mapId = "switch";
    quiet.player.mapId = "switch";
    quiet.player.x = 5;
    quiet.player.y = 8;
    quiet.player.skills.sneak = 80;
    quiet.actors.rue.x = 6;
    quiet.actors.rue.y = 4;
    reconcileWorld(quiet);
    assert.equal(quiet.actors.rue.y, 6);
    quiet.actors.rue.x = 6;
    quiet.actors.rue.y = 4;
    runSpecial(quiet, "switchdesk", "lift-till");
    assert.equal(quiet.flags.switchCaught, undefined);
    assert.equal(quiet.scrip, 14);
    assert.equal(quiet.actors.rue.hostile, false);
  });
});

describe("the pane", () => {
  it("keeps the glass stair and the people on walkable ground", () => {
    for (const mouth of MOUTHS.filter((m) => m.map === "pane" || m.to === "pane")) {
      assert.ok(WALKABLE.has(tileAt(MAPS[mouth.map], mouth.x, mouth.y)), `${mouth.map} ${mouth.x},${mouth.y}`);
      assert.ok(WALKABLE.has(tileAt(MAPS[mouth.to], mouth.tx, mouth.ty)), `${mouth.to} ${mouth.tx},${mouth.ty}`);
    }
    const d = world();
    reconcileWorld(d);
    assert.equal(d.flags.paneCharge, false);
    for (const id of ["orla", "ness", "fen", "sol", "panemoth"]) {
      const a = d.actors[id];
      assert.ok(a, id);
      assert.ok(WALKABLE.has(tileAt(MAPS[a.mapId], a.x, a.y)), `${id} ${a.x},${a.y}`);
    }
  });

  it("melts on local sand and heat, and a license is not a cut", () => {
    const d = world();
    assert.equal(regionOpen(d, "seen:pane"), false);
    d.mapId = "pane";
    d.player.mapId = "pane";
    d.player.x = 8;
    d.player.y = 7;
    d.focus = 20;
    reconcileWorld(d);
    assert.equal(regionOpen(d, "seen:pane"), true);
    assert.equal(d.flags.paneCharge, false);
    runSpecial(d, "panefire", "seat-flue");
    assert.equal(d.flags.paneCharge, true);
    assert.equal(d.flags.paneLevy, true);
    assert.equal(d.flags.paneShop, false);
    d.player.x = 22;
    d.player.y = 7;
    d.player.skills.speech = 10;
    d.scrip = 30;
    runSpecial(d, "panestamp", "license-pane");
    assert.equal(d.flags.paneLicensed, true);
    assert.equal(d.flags.paneShop, true);
    assert.equal(d.flags.paneLevy, true);
    assert.equal(d.actors.ness.hostile, false);
    runSpecial(d, "panebench", "draw-pane");
    assert.equal(d.inventory.some((i) => i.id === "clearpane"), false);
    d.player.x = 26;
    d.player.y = 7;
    runSpecial(d, "panebench", "draw-pane");
    assert.equal(d.inventory.find((i) => i.id === "clearpane")?.qty, 1);
    addItem(d, "anneallens", 1);
    openAudit(d, { kind: "machine", id: "panefire" });
    assert.equal(d.flags["lens:panefire"], true);
  });

  it("opens the bench by cutting the stamp and lets cullet replace a spilled pit", () => {
    const cut = world();
    cut.mapId = "pane";
    cut.player.mapId = "pane";
    cut.player.x = 8;
    cut.player.y = 7;
    cut.focus = 20;
    reconcileWorld(cut);
    runSpecial(cut, "panefire", "seat-flue");
    cut.player.x = 21;
    cut.player.y = 8;
    runSpecial(cut, "panestamp", "cut-pane");
    assert.equal(cut.flags.paneShop, true);
    assert.equal(cut.flags.paneLevy, false);
    assert.equal(cut.actors.ness.hostile, true);

    const spilled = world();
    spilled.flags.workersClear = true;
    spilled.flags.checkpointLead = "varr";
    spilled.mapId = "quarry";
    spilled.player.mapId = "quarry";
    spilled.player.x = 12;
    spilled.player.y = 4;
    spilled.focus = 30;
    spilled.player.skills.engineering = 80;
    runSpecial(spilled, "crane", "drop");
    spilled.mapId = "kiln";
    spilled.player.mapId = "kiln";
    spilled.player.x = 6;
    spilled.player.y = 7;
    addItem(spilled, "scrap", 2);
    runSpecial(spilled, "kilnfire", "seat-flue");
    runSpecial(spilled, "kilnfire", "field-dry");
    assert.equal(spilled.flags.brickLive, true);
    spilled.mapId = "pane";
    spilled.player.mapId = "pane";
    spilled.player.x = 8;
    spilled.player.y = 7;
    reconcileWorld(spilled);
    runSpecial(spilled, "panefire", "spill-sand");
    runSpecial(spilled, "panefire", "seat-flue");
    assert.equal(spilled.flags.paneCharge, false);
    runSpecial(spilled, "panefire", "cullet");
    runSpecial(spilled, "panefire", "borrow-heat");
    assert.equal(spilled.flags.paneCullet, true);
    assert.equal(spilled.flags.paneBorrowed, true);
    assert.equal(spilled.flags.paneCharge, true);
    assert.equal(spilled.flags.citadelSupplied, true);
  });

  it("lets a drawn pane become lamp glass the orrery did not make", () => {
    const d = world();
    d.mapId = "pane";
    d.player.mapId = "pane";
    d.player.x = 8;
    d.player.y = 7;
    d.focus = 20;
    reconcileWorld(d);
    runSpecial(d, "panefire", "seat-flue");
    d.player.x = 26;
    d.player.y = 7;
    runSpecial(d, "panebench", "draw-pane");
    const glass = d.machines.lamps.nodes.find((n) => n.id === "glass");
    if (!glass) throw new Error("glass");
    glass.severed = true;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    d.player.x = 24;
    d.player.y = 17;
    d.focus = 10;
    runSpecial(d, "lamps", "seat-glass");
    assert.equal(glass.severed, false);
    assert.equal(d.flags.paneGlass, true);
    assert.equal(d.inventory.some((i) => i.id === "clearpane"), false);
    assert.match(d.log.join("\n"), /glasshouse/);
  });
});
