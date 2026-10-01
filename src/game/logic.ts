// @ts-nocheck
// Recovered after an overwrite. Types live in the callsites.
import { ITEMS, MACHINES, SPAWNS, spawnActor, TEMPLATES } from "./catalog";
import { CONVOS } from "./dialogue";
import { play } from "./audio";
import { bump, burst, floatText } from "./fx";
import {
  PERKS,
  checkChance,
  clamp,
  comprehension,
  maxFocus,
  rollD100,
  xpForLevel,
} from "./formulas";
import { EXITS, LOCKED_DOORS, MAPS, mouthAt, tileAt, WALKABLE } from "./maps";
import { reconcileNetwork } from "./network";
import { ensureCompanions, placeCreature } from "./companions";
import { reconcileQuests } from "./quests";
import { barkLine } from "./barks";
function keyOf(x, y) {
  return `${x},${y}`;
}
function dist(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
function actorById(d, id) {
  if (id === "player") return d.player;
  return d.actors[id] ?? null;
}
function addLog(d, text) {
  d.log.unshift(text);
  if (d.log.length > 40) d.log.length = 40;
}
function noteOnce(d, text) {
  if (d.log[0] === text) return;
  addLog(d, text);
}
function refuseWalk(d) {
  if (!d.combat) return false;
  if (gait(d.player) === "dead") {
    noteOnce(d, "Your legs will not take the order.");
    d.path = [];
    return true;
  }
  const cost = gait(d.player) === "slow" ? 2 : 1;
  if (d.player.ap < cost) {
    noteOnce(d, "No action left. End the turn.");
    d.path = [];
    return true;
  }
  return false;
}
function comp(d) {
  return comprehension(d.player.attrs, d.player.skills.audit, d.level);
}
function focusMax(d) {
  return maxFocus(d.player.attrs.will);
}
function seamMark(nodes) {
  if (!nodes.some((n) => n.revealed)) return "unread";
  if (nodes.some((n) => n.revealed && n.spent)) return "spent";
  if (nodes.some((n) => n.revealed && n.pinned)) return "held";
  if (
    nodes.some(
      (n) =>
        n.revealed &&
        n.severed &&
        (n.effect === "flow" ||
          n.effect === "weapon" ||
          n.effect === "core" ||
          n.effect === "life" ||
          n.effect === "motive"),
    )
  )
    return "severed";
  if (nodes.some((n) => n.revealed && (n.severed || n.integrity < 40)))
    return "stressed";
  if (
    nodes.some((n) => n.revealed && n.effect === "flow" && nodeLive(nodes, n))
  )
    return "live";
  return "live";
}
function nodeLive(nodes, n, seen = new Set()) {
  if (n.severed || n.integrity < 40 || n.decoy) return false;
  if (seen.has(n.id)) return true;
  seen.add(n.id);
  for (const id of n.dependsOn) {
    const parent = nodes.find((p) => p.id === id);
    if (!parent || !nodeLive(nodes, parent, seen)) return false;
  }
  return true;
}
function nodeActive(n, nodes) {
  if (nodes) return nodeLive(nodes, n);
  return !n.severed && n.integrity >= 40 && !n.decoy;
}
function confidenceOf(n) {
  if (!n.revealed) return "unknown";
  return n.confidence ?? "observed";
}
function seamState(nodes, n) {
  if (!n.revealed) return "Unknown";
  if (n.severed) return "Severed";
  if (!nodeLive(nodes, n)) {
    if (n.effect === "weapon") return "Unavailable";
    if (n.effect === "motive") return "Movement disabled";
    if (n.effect === "armor") return "Compromised";
    return "Disabled";
  }
  if (n.integrity < 70) return "Strained";
  return "Functional";
}
function confidenceBonus(n) {
  const c = confidenceOf(n);
  if (c === "confident") return 22;
  if (c === "understood") return 12;
  return 0;
}
function liveMap(nodes) {
  const m = new Map();
  for (const n of nodes) m.set(n.id, nodeLive(nodes, n));
  return m;
}
function depthOf(nodes, id, seen = new Set()) {
  if (seen.has(id)) return 0;
  seen.add(id);
  const n = nodes.find((x) => x.id === id);
  if (!n?.dependsOn.length) return 0;
  let depth = 0;
  for (const dep of n.dependsOn)
    depth = Math.max(depth, 1 + depthOf(nodes, dep, seen));
  return depth;
}
function lossLine(n) {
  if (n.severed) return `${n.name} severed.`;
  if (n.effect === "weapon") return `${n.name} unavailable.`;
  if (n.effect === "motive") return "Movement disabled.";
  if (n.effect === "armor") return `${n.name} compromised.`;
  return `${n.name} disabled.`;
}
function lossToken(n) {
  if (n.severed) return "severed";
  if (n.effect === "weapon") return "unavailable";
  if (n.effect === "motive") return "still";
  if (n.effect === "armor") return "compromised";
  return "disabled";
}
function graphOwner(d, nodes) {
  if (d.player.nodes === nodes) {
    return {
      kind: "actor",
      id: "player",
      x: d.player.x,
      y: d.player.y,
      name: d.name,
      mapId: d.player.mapId,
    };
  }
  for (const a of Object.values(d.actors)) {
    if (a.nodes === nodes)
      return {
        kind: "actor",
        id: a.id,
        x: a.x,
        y: a.y,
        name: a.name,
        mapId: a.mapId,
      };
  }
  for (const m of Object.values(d.machines)) {
    if (m.nodes === nodes)
      return {
        kind: "machine",
        id: m.id,
        x: m.x,
        y: m.y,
        name: m.name,
        mapId: m.mapId,
      };
  }
  return null;
}
function flash(d, nodes, kind) {
  const owner = graphOwner(d, nodes);
  if (!owner || owner.mapId !== d.mapId) return;
  burst(owner.x, owner.y, kind);
}
function exposeUnderArmor(nodes) {
  if (!nodes.some((n) => n.effect === "armor" && !nodeLive(nodes, n))) return;
  for (const other of nodes) {
    if (other.effect !== "armor") continue;
    if (!other.revealed) {
      other.revealed = true;
      if (!other.confidence || other.confidence === "unknown")
        other.confidence = "observed";
    }
    for (const pid of other.dependsOn) {
      const parent = nodes.find((x) => x.id === pid);
      if (parent && !parent.revealed) {
        parent.revealed = true;
        if (!parent.confidence || parent.confidence === "unknown")
          parent.confidence = "observed";
      }
    }
  }
}
function crushAround(d, x, y, mapId, power) {
  const victims = [];
  if (d.player.mapId === mapId && dist(d.player, { x, y }) <= 1)
    victims.push(d.player);
  for (const a of Object.values(d.actors)) {
    if (!a.alive || a.mapId !== mapId) continue;
    if (dist(a, { x, y }) <= 1) victims.push(a);
  }
  if (!victims.length) {
    addLog(d, "The load hammers empty ground.");
    return;
  }
  for (const a of victims) {
    if (d.phase !== "play") return;
    addLog(d, `${a.name} is under the load.`);
    const before = liveMap(a.nodes);
    for (const n of a.nodes) {
      if (n.effect === "armor" && nodeLive(a.nodes, n))
        n.integrity = Math.max(1, n.integrity - 28);
    }
    applyHp(d, a.id, power, true);
    if (d.phase !== "play") return;
    publish(d, a.nodes, before);
  }
}
function publish(d, nodes, before, quiet, clean = false) {
  const owner = graphOwner(d, nodes);
  const flipped = nodes
    .filter((n) => before.get(n.id) === true && !nodeLive(nodes, n))
    .sort((a, b) => depthOf(nodes, a.id) - depthOf(nodes, b.id));
  const restored = nodes
    .filter((n) => before.get(n.id) === false && nodeLive(nodes, n))
    .sort((a, b) => depthOf(nodes, a.id) - depthOf(nodes, b.id));
  for (const n of flipped) {
    addLog(d, lossLine(n));
    if (n.effect === "armor") exposeUnderArmor(nodes);
    if (n.effect === "weapon" && owner && d.phase === "play") {
      if (clean) {
        addLog(d, "Steam stays in the seam. The cut did not walk.");
        play("steam");
        flash(d, nodes, "steam");
      } else {
        addLog(d, "Steam kicks out of the dead mount.");
        play("steam");
        flash(d, nodes, "steam");
        for (const o of Object.values(d.actors)) {
          if (!o.alive || o.mapId !== owner.mapId || o.id === owner.id)
            continue;
          if (dist(o, owner) <= 1) applyHp(d, o.id, 4, false);
        }
        if (
          owner.id !== "player" &&
          d.player.mapId === owner.mapId &&
          dist(d.player, owner) <= 1
        )
          applyHp(d, "player", 3, true);
      }
      if (d.phase !== "play") return;
    }
    if (n.fail === "crush" && !n.spent && owner) {
      n.spent = true;
      d.flags[`${owner.id}:dropped`] = true;
      addLog(d, `${n.name} leaves the cable.`);
      crushAround(d, owner.x, owner.y, owner.mapId, 16);
      if (d.phase !== "play") return;
    }
  }
  if (owner && flipped.length)
    floatText(
      owner.x,
      owner.y,
      lossToken(flipped[flipped.length - 1]),
      "#c45c26",
    );
  const downstream = flipped.filter((n) => !n.severed);
  if (downstream.length && d.phase === "play") noteTrace(d, "cascade");
  for (const n of restored) {
    if (n.id === quiet) continue;
    addLog(d, `${n.name} restored.`);
  }
  rememberGraph(d, nodes);
}
function fallenFrom(nodes, rootId) {
  const out = [];
  const seen = new Set();
  const walk = (id) => {
    for (const child of nodes) {
      if (!child.dependsOn.includes(id) || seen.has(child.id)) continue;
      if (nodeLive(nodes, child)) continue;
      seen.add(child.id);
      out.push(child);
      walk(child.id);
    }
  };
  walk(rootId);
  return out;
}
function noteGraphChange(d, nodes, n, verb, by) {
  if (!d.combat || d.phase !== "play") return;
  const owner = graphOwner(d, nodes);
  if (!owner) return;
  const fallen = verb === "cut" ? fallenFrom(nodes, n.id) : [];
  const risen =
    verb === "cut"
      ? []
      : nodes.filter(
          (child) =>
            child.dependsOn.includes(n.id) &&
            nodeLive(nodes, child) &&
            child.id !== n.id,
        );
  const weapon = (verb === "cut" ? fallen : risen).find(
    (child) => child.effect === "weapon",
  );
  const motive = (verb === "cut" ? fallen : risen).find(
    (child) => child.effect === "motive",
  );
  const other = (verb === "cut" ? fallen : risen)[0];
  const far = weapon ?? motive ?? other;
  const edge = far ? `${n.name} \u2192 ${far.name}` : n.name;
  let immediate = `${n.name} severed`;
  let downstream;
  if (verb === "cut") {
    if (weapon) immediate = `${weapon.name} unavailable`;
    else if (far) immediate = `${far.name} disabled`;
    if (weapon && owner.kind === "actor")
      downstream = `${owner.name} lost the ranged attack.`;
    else if (motive && owner.kind === "actor")
      downstream = `${owner.name} lost the step.`;
  } else {
    immediate = `${n.name} restored`;
    if (weapon) downstream = `${weapon.name} can fire again.`;
    else if (motive && owner.kind === "actor")
      downstream = `${owner.name} can walk again.`;
  }
  if (!d.combat.changes) d.combat.changes = [];
  d.combat.changes.push({
    ownerId: owner.id,
    ownerName: owner.name,
    verb,
    by: by ?? "player",
    nodeId: n.id,
    nodeName: n.name,
    edge,
    immediate,
    downstream,
  });
}
function sever(d, nodes, n, by) {
  if (n.severed) {
    addLog(d, "Already severed.");
    return;
  }
  const before = liveMap(nodes);
  n.severed = true;
  n.integrity = 0;
  if (by) addLog(d, `${by} cuts ${n.name}.`);
  const clean = !by && (d.verbs?.cut ?? 0) >= 4;
  publish(d, nodes, before, void 0, clean);
  noteGraphChange(d, nodes, n, "cut", by);
  play("unmend");
  flash(d, nodes, "snap");
  bump(7);
}
function deepen(d, n, fresh) {
  if (!n.revealed) {
    n.confidence = "unknown";
    return;
  }
  if (fresh) {
    n.confidence =
      d.flags.chalked && n.tier === "obfuscated" ? "understood" : "observed";
    return;
  }
  const cur = n.confidence ?? "observed";
  if (cur === "confident") return;
  const skill =
    d.player.skills.audit + Math.floor(d.player.attrs.perception / 2);
  const ease = (d.verbs?.audit ?? 0) >= 4 ? 10 : 0;
  const bar = 30 + n.density * 8 - ease;
  if (d.flags.chalked && skill >= bar - 10) {
    n.confidence = cur === "observed" ? "understood" : "confident";
    return;
  }
  if (cur === "understood" && skill >= bar - 8) {
    n.confidence = "confident";
    return;
  }
  if (cur === "observed" && skill >= bar) {
    n.confidence = "understood";
    return;
  }
  if (!n.confidence) n.confidence = "observed";
}
function armorCount(a) {
  return a.nodes.filter((n) => n.effect === "armor" && nodeLive(a.nodes, n))
    .length;
}
function hasItem(d, id) {
  return (d.inventory.find((i) => i.id === id)?.qty ?? 0) > 0;
}
function addItem(d, id, n = 1, condition = Number.NaN) {
  const row = d.inventory.find((i) => i.id === id);
  const worn = Number.isNaN(condition) ? undefined : condition;
  if (row) row.qty += n;
  else
    d.inventory.push({
      id,
      qty: n,
      condition: worn ?? ITEMS[id]?.condition ?? 100,
    });
}
function carryWeight(d) {
  return d.inventory.reduce(
    (sum, row) => sum + (ITEMS[row.id]?.weight ?? 1) * row.qty,
    0,
  );
}
function carryMax(d) {
  return 12 + d.player.attrs.body * 6;
}
function dismantle(d, id) {
  const def = ITEMS[id];
  if (!def?.yield?.length || !hasItem(d, id)) {
    addLog(d, "Nothing in that to recover.");
    return;
  }
  if (d.equipped.weapon === id || d.equipped.armor === id) {
    addLog(d, "Unequip it before you break it down.");
    return;
  }
  takeItem(d, id, 1);
  for (const part of def.yield) addItem(d, part, 1);
  addLog(
    d,
    `${def.name} comes apart into ${def.yield.map((p) => ITEMS[p]?.name ?? p).join(", ")}.`,
  );
  play("unmend");
}
function forecast(nodes, n) {
  const conf = confidenceOf(n);
  if (conf === "unknown" || conf === "observed") {
    return "You can see the seam. What it feeds is still a guess. Read it again before you trust a cut.";
  }
  const kids = nodes.filter((o) => o.dependsOn.includes(n.id));
  const bits = [];
  if (n.effect === "weapon")
    bits.push(
      "The weapon mount fails. What is left is hands, and only if they can reach.",
    );
  if (n.effect === "armor")
    bits.push(
      "That plate stops counting. Hits land closer to the body. Other layers, if any, stay until their own parents die.",
    );
  if (n.effect === "motive")
    bits.push(
      "Locomotion loses its drive. If nothing else still lives, they hold the ground.",
    );
  if (n.effect === "flow")
    bits.push(
      "The line stops moving what it was moving, or it finds a worse path.",
    );
  if (n.effect === "life")
    bits.push("A living baseline comes apart. This is a wound.");
  if (n.effect === "core")
    bits.push(
      "A core relationship. The rest of the graph will feel the absence.",
    );
  if (n.effect === "none" && kids.length)
    bits.push("This bond does not hit anyone. It holds up the things that do.");
  if (n.fail === "crush")
    bits.push("If this loses its parent, the load leaves the cable.");
  if (kids.length) {
    const names = kids
      .map((k) =>
        k.revealed || conf === "confident" ? k.name : "an unread bond",
      )
      .join(", ");
    bits.push(
      `If this parent dies, these lose function even if their integrity stays whole: ${names}.`,
    );
  }
  if (n.id === "bypass" && (conf === "understood" || conf === "confident")) {
    bits.push(
      "Thrown, this bypass sends brown pressure along the gallery feed. The sump door can drink. The district will taste it.",
    );
  }
  if (
    n.pattern === "pressure-feed" &&
    (conf === "understood" || conf === "confident")
  ) {
    bits.push(
      "This is a pressure feed. What depends on it fails with the parent, even if the child is never cut.",
    );
  }
  if (
    n.pattern === "load-chain" &&
    (conf === "understood" || conf === "confident")
  ) {
    bits.push(
      "This is a suspended load. If the parent dies, the weight leaves. A later hearth can recognize the same shape.",
    );
  }
  if (!bits.length) bits.push("Structural load. What hangs on it will sag.");
  if (conf === "confident") bits.push("You can hold this cut.");
  return bits.join(" ");
}
function takeItem(d, id, n = 1) {
  const row = d.inventory.find((i) => i.id === id);
  if (!row) return;
  row.qty -= n;
  if (row.qty <= 0) d.inventory = d.inventory.filter((i) => i.id !== id);
  if (d.equipped.weapon === id && !hasItem(d, id)) d.equipped.weapon = "prybar";
  if (d.equipped.armor === id && !hasItem(d, id)) d.equipped.armor = null;
}
function condOk(d, c) {
  if ("history" in c) return askHistory(d, c.history);
  if ("flag" in c && "is" in c) return d.flags[c.flag] === c.is;
  if ("flag" in c && "truthy" in c) return Boolean(d.flags[c.flag]);
  if ("missing" in c) return d.flags[c.missing] === void 0;
  if ("skill" in c) return d.player.skills[c.skill] >= c.gte;
  if ("discipline" in c) return d.disciplines.includes(c.discipline);
  if ("item" in c) return hasItem(d, c.item);
  if ("scrip" in c) return d.scrip >= c.scrip;
  if ("companion" in c) return Boolean(d.actors[c.companion]?.companion);
  if ("noCompanion" in c)
    return !Object.values(d.actors).some((a) => a.companion && a.alive);
  return true;
}
function replyVisible(d, requires) {
  if (!requires) return true;
  return requires.every((c) => condOk(d, c));
}
function grantXp(d, n) {
  if (n <= 0) return;
  d.xp += n;
  addLog(d, `+${n} experience.`);
  while (d.level < 8 && d.xp >= xpForLevel(d.level + 1)) {
    d.level += 1;
    d.skillPoints += 4;
    d.perkPoints = (d.perkPoints ?? 0) + 1;
    d.player.maxHp += 8;
    d.player.hp = Math.min(d.player.maxHp, d.player.hp + 8);
    d.pendingLevel = true;
    addLog(d, `Comprehension deepens. You are level ${d.level}.`);
    play("level");
  }
}
function walkable(d, x, y, ignore = String()) {
  const map = MAPS[d.mapId];
  if (!map) return false;
  const ch = tileAt(map, x, y);
  if (!WALKABLE.has(ch)) return false;
  const door = LOCKED_DOORS.find(
    (door2) => door2.map === d.mapId && door2.x === x && door2.y === y,
  );
  if (door && !d.flags[door.flag]) return false;
  if (
    Object.values(d.machines).some(
      (m) => m.mapId === d.mapId && m.x === x && m.y === y,
    )
  )
    return false;
  for (const a of Object.values(d.actors)) {
    if (!a.alive || a.mapId !== d.mapId) continue;
    if (a.id === ignore) continue;
    if (a.x === x && a.y === y) return false;
  }
  if (d.player.x === x && d.player.y === y && ignore !== "player") return false;
  return true;
}
function bfs(d, start, goal, ignore) {
  const q = [start];
  const prev = new Map();
  prev.set(keyOf(start.x, start.y), null);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (q.length) {
    const cur = q.shift();
    if (!(cur.x === start.x && cur.y === start.y) && goal(cur.x, cur.y)) {
      const path = [];
      let k = keyOf(cur.x, cur.y);
      while (k) {
        const [xs, ys] = k.split(",").map(Number);
        path.push({ x: xs, y: ys });
        k = prev.get(k) ?? null;
      }
      path.reverse();
      return path.slice(1);
    }
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const kk = keyOf(nx, ny);
      if (prev.has(kk)) continue;
      if (!walkable(d, nx, ny, ignore)) continue;
      prev.set(kk, keyOf(cur.x, cur.y));
      q.push({ x: nx, y: ny });
    }
  }
  return null;
}
function pathTo(d, x, y) {
  if (!walkable(d, x, y, "player")) return null;
  return bfs(d, d.player, (px, py) => px === x && py === y, "player");
}
function pathNear(d, x, y) {
  if (dist(d.player, { x, y }) <= 1) return [];
  return bfs(
    d,
    d.player,
    (px, py) => Math.max(Math.abs(px - x), Math.abs(py - y)) <= 1,
    "player",
  );
}
function machineAt(d, x, y) {
  return (
    Object.values(d.machines).find(
      (m) => m.mapId === d.mapId && m.x === x && m.y === y,
    ) ?? null
  );
}
function actorAt(d, x, y) {
  return (
    Object.values(d.actors).find(
      (a) => a.alive && a.mapId === d.mapId && a.x === x && a.y === y,
    ) ?? null
  );
}
function isExit(mapId, x, y) {
  return EXITS.some((e) => e.map === mapId && e.x === x && e.y === y);
}
function gait(a) {
  const motives = a.nodes.filter((n) => n.effect === "motive");
  if (!motives.length) return "ok";
  if (motives.every((n) => !nodeLive(a.nodes, n))) return "dead";
  if (motives.some((n) => n.integrity < 80 || !nodeLive(a.nodes, n)))
    return "slow";
  return "ok";
}
function slow(a) {
  return gait(a) === "slow";
}
function weaponOf(a) {
  const broken = a.nodes.some(
    (n) => n.effect === "weapon" && !nodeLive(a.nodes, n),
  );
  const carried = a.companion && a.kit?.weapon ? a.kit.weapon : a.weapon;
  const id = broken ? "fist" : carried;
  return ITEMS[id] ?? ITEMS.fist;
}
function companionAp(a) {
  const base = gait(a) === "slow" ? 4 : 6;
  const heavy = Boolean(a.kit?.armor && ITEMS[a.kit.armor]?.heavy);
  return heavy ? Math.max(3, base - 1) : base;
}
function pinOnHit(nodes) {
  const hit = nodes.find(
    (n) =>
      n.revealed &&
      !n.decoy &&
      (n.effect === "flow" || n.effect === "weapon" || n.effect === "motive") &&
      nodeLive(nodes, n),
  );
  if (!hit) return null;
  hit.pinned = true;
  return hit;
}
function gearWear(d, a) {
  if (a.id !== "player") return 1;
  const row = d.inventory.find((i) => i.id === a.weapon);
  const condition = row?.condition ?? 100;
  return 0.45 + 0.55 * (Math.max(0, Math.min(100, condition)) / 100);
}
function brokenMount(a) {
  return a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n));
}
function fillText(d, text) {
  return text.replaceAll("{name}", d.name);
}
function currentNode(d) {
  if (!d.dialogue) return null;
  const c = CONVOS[d.dialogue.convo];
  return c?.nodes[d.dialogue.node] ?? null;
}
function journal(d, id, title, text, status) {
  const hit = d.journal.find((j) => j.id === id);
  if (hit) {
    hit.title = title;
    hit.text = text;
    hit.status = status;
  } else d.journal.unshift({ id, title, text, status });
  if (status === "open") d.pinned = title;
}
function rememberGraph(d, nodes) {
  const owner = graphOwner(d, nodes);
  if (!owner) return;
  const known = nodes.filter((n) => n.revealed);
  if (!known.length) return;
  const chains = [];
  for (const n of known) {
    const parents = n.dependsOn
      .map((id2) => known.find((p) => p.id === id2)?.name)
      .filter((name) => Boolean(name));
    if (parents.length) chains.push(`${parents.join(" + ")} \u2192 ${n.name}`);
  }
  const failed = known.filter((n) => n.severed || !nodeLive(nodes, n));
  const failure = failed.length
    ? `Known failure: ${failed
        .slice(0, 3)
        .map(
          (n) =>
            `${n.name} ${n.severed ? "severed" : seamState(nodes, n).toLowerCase()}`,
        )
        .join("; ")}.`
    : "No failure is settled yet.";
  const body = chains.length
    ? `${chains.join(". ")}.`
    : known.map((n) => n.name).join(", ") + ".";
  const text = `${body} ${failure}`;
  const id = `read:${owner.id}`;
  const title = `${owner.name}`;
  const hit = d.journal.find((j) => j.id === id);
  if (hit) {
    hit.title = title;
    hit.text = text;
    hit.status = "open";
  } else d.journal.push({ id, title, text, status: "open" });
}
function placeCompanion(d) {
  const mates = Object.values(d.actors).filter((a) => a.companion && a.alive);
  if (!mates.length || d.combat) return;
  const spots = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  let used = 0;
  for (const mate of mates) {
    mate.mapId = d.mapId;
    let placed = false;
    for (let i = used; i < spots.length; i++) {
      const [dx, dy] = spots[i];
      const x = d.player.x + dx;
      const y = d.player.y + dy;
      if (walkable(d, x, y, mate.id)) {
        mate.x = x;
        mate.y = y;
        used = i + 1;
        placed = true;
        break;
      }
    }
    if (!placed) {
      mate.x = d.player.x;
      mate.y = d.player.y;
    }
  }
}
function movePlayer(d, x, y) {
  const mates = Object.values(d.actors)
    .filter((a) => a.companion && a.alive && a.mapId === d.mapId)
    .sort(
      (a, b) =>
        Number(a.template === "cinder") - Number(b.template === "cinder"),
    );
  const ox = d.player.x;
  const oy = d.player.y;
  d.player.x = x;
  d.player.y = y;
  if (!d.combat && mates.length) {
    const [first, second] = mates;
    if (first) {
      first.x = ox;
      first.y = oy;
    }
    if (second) {
      const spots = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      let placed = false;
      for (const [dx, dy] of spots) {
        const sx = ox + dx;
        const sy = oy + dy;
        if (sx === x && sy === y) continue;
        if (walkable(d, sx, sy, second.id)) {
          second.x = sx;
          second.y = sy;
          placed = true;
          break;
        }
      }
      if (!placed) {
        second.x = ox;
        second.y = oy;
      }
    }
  }
  const ch = tileAt(MAPS[d.mapId], x, y);
  const iced =
    ITEMS[d.equipped.armor ?? ""]?.ice ||
    (d.mapId === "tundra" && d.flags.iceSpan === true);
  if (ch === "!" && d.player.hp > 8 && !iced) {
    applyHp(d, "player", d.flags.iceCut ? 2 : 1, false);
    if (!d.flags.iceNoted) {
      d.flags.iceNoted = true;
      addLog(
        d,
        d.flags.iceCut
          ? "The cut glaze bills the middle twice. The edges of the walk do not."
          : "The brass ice takes a bite. The edges of the walk do not.",
      );
    }
  }
  const slick = ITEMS[d.equipped.armor ?? ""]?.slick;
  if (
    d.mapId === "switch" &&
    !d.flags.switchGreased &&
    !slick &&
    x >= 18 &&
    x <= 24 &&
    y >= 10 &&
    y <= 13 &&
    !d.flags.switchSlipped &&
    d.player.hp > 6
  ) {
    d.flags.switchSlipped = true;
    applyHp(d, "player", 1, false);
    addLog(d, "The plates take a little blood. Boots would keep your feet. Grease would keep the yard.");
  }
  const mitt = ITEMS[d.equipped.armor ?? ""]?.heat;
  if (
    d.mapId === "pane" &&
    d.flags.paneBed &&
    !mitt &&
    x >= 5 &&
    x <= 11 &&
    y >= 6 &&
    y <= 10 &&
    !d.flags.paneScorched &&
    d.player.hp > 6
  ) {
    d.flags.paneScorched = true;
    applyHp(d, "player", 1, false);
    addLog(d, "The furnace floor takes a little blood. Mitts would keep your hands. They would not seat the flue.");
  }
  if (
    d.mapId === "road" &&
    y >= 9 &&
    !d.flags.roadBypass &&
    (d.flags.citadelOpen || d.flags.roadDark || d.flags.citadelFate)
  ) {
    d.flags.roadBypass = true;
    addLog(
      d,
      "The south walk holds. The lamps are not required for this footing.",
    );
  }
  if (d.mapId === "sinks" && y >= 16 && !d.flags.seenMouth) {
    d.flags.seenMouth = true;
    addLog(
      d,
      "The south cut opens onto the stack mouth. The city continues on foot.",
    );
  }
  const moth = d.actors.cinder;
  if (
    moth &&
    moth.mapId === d.mapId &&
    !d.flags.cinderSeen &&
    dist(d.player, moth) <= 2
  ) {
    d.flags.cinderSeen = true;
    addLog(
      d,
      "Something small is nested on the reed. It is watching the lung, not you.",
    );
  }
  if (!d.combat && !d.dialogue) {
    const line = barkLine(d);
    if (line) addLog(d, line);
  }
  const walked = Number(d.flags.steps ?? 0) + 1;
  d.flags.steps = walked;
  if (walked % 12 === 0) d.flags.hour = (Number(d.flags.hour ?? 0) + 1) % 4;
  nudgeCreature(d, ox, oy);
  if (
    d.mapId === "sinks" &&
    y >= 12 &&
    oy < 12 &&
    !d.combat &&
    !d.dialogue &&
    !d.flags.checkpointSpoke &&
    !d.flags.act1 &&
    !d.flags.usedCrawl
  ) {
    d.dialogue = { convo: "guard-line", node: "start" };
    d.panel = "none";
    d.path = [];
    play("talk");
  }
}
function fateOf(d, a, escapes, override) {
  if (override) return override;
  if (!a.alive) return "dead";
  if (escapes?.includes(a.id)) return "escaped";
  if (d.flags[`down:${a.id}`]) return "broken-open";
  if (!a.hostile) return "stood-down";
  return "unresolved";
}
function fatePhrase(fate) {
  if (fate === "dead") return "died";
  if (fate === "escaped") return "left the engagement";
  if (fate === "broken-open") return "came apart, and stayed";
  if (fate === "stood-down") return "stood down";
  return "still armed";
}
function baselineOf(people) {
  if (people.some((p) => p.fate === "dead")) return "lost";
  if (people.some((p) => p.fate === "broken-open" || p.fate === "escaped"))
    return "altered";
  return "preserved";
}
function roomVerbs(d, verbMark) {
  const used = {};
  if (!verbMark) return used;
  for (const id of Object.keys(VERB_VOICE)) {
    const delta = (d.verbs?.[id] ?? 0) - (verbMark[id] ?? 0);
    if (delta > 0) used[id] = delta;
  }
  return used;
}
function titleFor(people) {
  const allDown = people.every((p) => p.fate === "stood-down");
  const allDead = people.every((p) => p.fate === "dead");
  if (allDown)
    return people.length === 1
      ? `${people[0].name} stood down`
      : "They stood down";
  if (allDead)
    return people.length === 1
      ? `${people[0].name} unraveled`
      : "The room emptied";
  if (
    people.some((p) => p.fate === "escaped") &&
    people.every((p) => p.fate === "escaped" || p.fate === "dead")
  ) {
    return "They left the engagement";
  }
  return "The engagement let go";
}
function worldNotes(people) {
  const notes = [];
  const varr = people.find((p) => p.id === "varr");
  if (!varr) return notes;
  if (varr.fate === "dead" || varr.fate === "escaped")
    notes.push("Checkpoint leadership is vacant.");
  else if (varr.fate === "stood-down" || varr.fate === "broken-open")
    notes.push("Checkpoint remained under Captain Varr.");
  return notes;
}
function placeName(mapId, ids) {
  if (
    mapId === "sinks" &&
    ids.some((id) => id === "varr" || id === "en1" || id === "en2")
  )
    return "The Bureau checkpoint";
  return MAPS[mapId]?.name ?? mapId;
}
function stampFacts(d, people, changes, encounterId, baseline) {
  for (const p of people) {
    d.flags[`fact:stood-down:${p.id}`] = p.fate === "stood-down";
    d.flags[`fact:dead:${p.id}`] = p.fate === "dead";
    d.flags[`fact:escaped:${p.id}`] = p.fate === "escaped";
  }
  for (const c of changes) {
    if (c.verb === "cut")
      d.flags[`fact:severed:${c.ownerId}:${c.nodeId}`] = true;
    if (c.verb === "mend" || c.verb === "repair")
      d.flags[`fact:severed:${c.ownerId}:${c.nodeId}`] = false;
  }
  d.flags[`fact:baseline:${encounterId}`] = baseline;
  const varr = people.find((p) => p.id === "varr");
  if (varr?.fate === "stood-down" || varr?.fate === "broken-open")
    d.flags.checkpointLead = "varr";
  if (varr?.fate === "dead" || varr?.fate === "escaped")
    d.flags.checkpointLead = "vacant";
  reconcileWorld(d);
}
function fileDeed(d, snap, closing, override) {
  const present = snap.roster
    .map((id) => d.actors[id])
    .filter((a) => Boolean(a));
  if (!present.length) return;
  const people = present.map((a) => {
    const fate = fateOf(d, a, snap.escapes, override?.[a.id]);
    return {
      id: a.id,
      name: a.name,
      fate,
      weaponAtStart:
        snap.weaponsAtStart[a.id] ??
        a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n)),
      weaponAtEnd:
        fate !== "dead" &&
        a.alive &&
        a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n)),
    };
  });
  const baseline = baselineOf(people);
  const world = worldNotes(people);
  const changes = snap.changes;
  const lines = [
    ...people.map((p) => `${p.name}: ${fatePhrase(p.fate)}.`),
    ...changes.map(
      (c) =>
        `${c.verb}. ${c.edge}. ${c.immediate}.${c.downstream ? ` ${c.downstream}` : ""}`,
    ),
    ...world,
    closing ?? "",
  ].filter(Boolean);
  const approach = tendencies(d).join(" \xB7 ") || "No habit settled.";
  const seq = Number(d.flags.deedCount ?? 0) + 1;
  d.flags.deedCount = seq;
  const ids = [...present.map((a) => a.id)].sort();
  const encounterId = `${snap.mapId}:${ids.join("+")}`;
  if (!d.deeds) d.deeds = [];
  d.deeds.unshift({
    id: `deed-${seq}`,
    seq,
    title: titleFor(people),
    place: placeName(snap.mapId, ids),
    mapId: snap.mapId,
    encounterId,
    text: lines.join(" "),
    approach,
    participants: people,
    changes,
    baseline,
    used: roomVerbs(d, snap.verbMark),
    resolved: true,
    world: world.length ? world : void 0,
  });
  if (d.deeds.length > 40) d.deeds.length = 40;
  stampFacts(d, people, changes, encounterId, baseline);
}
function seam(nodes, id) {
  return nodes.find((n) => n.id === id);
}
function ensureMachines(d) {
  for (const m of MACHINES) {
    if (!d.machines[m.id]) d.machines[m.id] = structuredClone(m);
  }
}
function bellowsFeeding(d) {
  const lung = d.machines.bellows;
  if (!lung) return true;
  const reed = seam(lung.nodes, "reed");
  if (!reed) return true;
  return nodeLive(lung.nodes, reed);
}
function pressureToGallery(d) {
  if (!bellowsFeeding(d)) return false;
  const fate = String(d.flags.pumpFate ?? "");
  if (
    fate === "mend" ||
    fate === "wren" ||
    fate === "speech" ||
    fate === "bleed"
  )
    return true;
  const pump = d.machines.pump;
  if (!pump) return false;
  const valve = seam(pump.nodes, "valve");
  const bypass = seam(pump.nodes, "bypass");
  const pipe = seam(pump.nodes, "pipe");
  if (valve && nodeLive(pump.nodes, valve)) return true;
  if (bypass?.severed && pipe && nodeLive(pump.nodes, pipe)) return true;
  return false;
}
function setDerived(n, live) {
  if (!n) return;
  n.severed = !live;
  n.integrity = live ? 100 : 0;
}
function accessFlag(d, key, open, opened, closed) {
  const prev = d.flags[key];
  d.flags[key] = open;
  if (prev === open || d.phase !== "play") return;
  if (open) addLog(d, opened);
  else if (prev === true) addLog(d, closed);
}
function tileFree(d, x, y, self) {
  const map = MAPS["sinks"];
  if (!map) return false;
  const ch = tileAt(map, x, y);
  if (!WALKABLE.has(ch)) return false;
  const door = LOCKED_DOORS.find(
    (row) => row.map === "sinks" && row.x === x && row.y === y,
  );
  if (door && !d.flags[door.flag]) return false;
  if (
    Object.values(d.machines).some(
      (m) => m.mapId === "sinks" && m.x === x && m.y === y,
    )
  )
    return false;
  if (d.player.mapId === "sinks" && d.player.x === x && d.player.y === y)
    return false;
  for (const a of Object.values(d.actors)) {
    if (!a.alive || a.id === self || a.mapId !== "sinks") continue;
    if (a.x === x && a.y === y) return false;
  }
  return true;
}
function park(d, id, x, y) {
  const a = d.actors[id];
  if (!a || !a.alive || a.companion || a.hostile || d.combat) return;
  const spots = [
    [x, y],
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
  for (const [sx, sy] of spots) {
    if (a.mapId === "sinks" && a.x === sx && a.y === sy) return;
    if (!tileFree(d, sx, sy, id)) continue;
    a.mapId = "sinks";
    a.x = sx;
    a.y = sy;
    return;
  }
}
function observeSinks(d) {
  if (
    !d.flags.checkpointLead &&
    !d.flags.pumpFate &&
    !d.flags.sumpOpen &&
    !d.flags.jackHeld &&
    !d.flags.gaugeRead
  )
    return;
  const bits = [];
  if (d.flags.checkpointLead === "varr")
    bits.push("Bureau control is live. The plate stair answers to Varr.");
  if (d.flags.checkpointLead === "vacant")
    bits.push(
      "Bureau control is vacant. The plate stair has no signature. The squad holds the road mouth.",
    );
  if (
    d.flags.pumpFate === "mend" ||
    d.flags.pumpFate === "wren" ||
    d.flags.pumpFate === "speech"
  )
    bits.push("Pressure is seated. The gallery feed can drink.");
  else if (d.flags.pumpFate === "bleed")
    bits.push("The bypass is thrown. Brown pressure reaches the gallery feed.");
  else if (d.flags.pumpFate === "flood")
    bits.push("The pump floods the cellars. The gallery head stays dry.");
  else if (d.flags.pumpFate === "lockout")
    bits.push("The lockout is gone. The gallery head is still unfed.");
  if (d.flags.sumpOpen) bits.push("The sump door is open.");
  else if (d.flags.pumpFate || d.flags.checkpointLead)
    bits.push("The sump door is shut.");
  if (d.flags.jackMended) bits.push("The gallery footing is itself again.");
  else if (d.flags.jackHeld)
    bits.push("The gallery crown is held, not healed.");
  if (d.flags.gaugeCut)
    bits.push(
      "The west pocket's real feed was cut. The gauge face was never the parent.",
    );
  else if (d.flags.gaugeRead)
    bits.push(
      "A gauge in the west pocket was a costume. The parent sits behind the face.",
    );
  const pump = d.journal.find((j) => j.id === "pump");
  if (pump && d.flags.pumpFate && pump.status === "open") pump.status = "done";
  const text = bits.join(" ");
  const hit = d.journal.find((j) => j.id === "sinks-now");
  if (hit) {
    hit.title = "The Sinks, as they are";
    hit.text = text;
    hit.status = "open";
  } else
    d.journal.push({
      id: "sinks-now",
      title: "The Sinks, as they are",
      text,
      status: "open",
    });
}
function reconcileWorld(d) {
  ensureMachines(d);
  ensureCast(d);
  const lead = d.flags.checkpointLead;
  const bar = d.machines.bar;
  if (bar) {
    setDerived(seam(bar.nodes, "sign"), lead === "varr");
    const stair = seam(bar.nodes, "stair");
    const open = stair ? nodeLive(bar.nodes, stair) : false;
    accessFlag(
      d,
      "plateStair",
      open,
      "The plate stair's bar comes up. The checkpoint still has a signature.",
      "The plate stair drops. Nobody is signed to lift it.",
    );
  }
  const watch = lead === "vacant";
  if (watch && d.flags.roadWatch !== true && d.phase === "play")
    addLog(d, "Moll and Hess leave the plate. They hold the road mouth.");
  if (!watch && d.flags.roadWatch === true && d.phase === "play")
    addLog(d, "The squad is back on the plate.");
  d.flags.roadWatch = watch;
  if (!d.combat && (lead === "varr" || lead === "vacant")) {
    if (watch) {
      park(d, "en1", 17, 13);
      park(d, "en2", 16, 12);
    } else {
      park(d, "en1", 4, 13);
      park(d, "en2", 8, 14);
    }
  }
  const head = d.machines.head;
  if (head && head.x === 19 && head.y === 5) {
    head.x = 19;
    head.y = 4;
  }
  if (head) {
    setDerived(seam(head.nodes, "feed"), pressureToGallery(d));
    const leaf = seam(head.nodes, "leaf");
    const open = leaf ? nodeLive(head.nodes, leaf) : false;
    accessFlag(
      d,
      "sumpOpen",
      open,
      "The gallery door takes pressure. The dry bar lets go.",
      "The gallery door goes dry again.",
    );
  }
  const jack = d.machines.jack;
  const footing = jack ? seam(jack.nodes, "footing") : void 0;
  if (footing && jack && nodeLive(jack.nodes, footing)) {
    const was = d.flags.jackHeld === true;
    d.flags.jackHeld = true;
    if (footing.integrity >= 100) d.flags.jackMended = true;
    if (!was && d.flags.galleryCache !== true && d.phase === "play") {
      d.flags.galleryCache = true;
      addItem(d, "scrap", 1);
      addLog(
        d,
        "Under the crown: plate scrap, and a dry corner the alley can use.",
      );
    }
  }
  observeSinks(d);
  reconcileLandmarks(d);
  reconcileWard(d);
  reconcileCity(d);
  reconcileNetwork(d);
  ensureCompanions(d);
  placeCreature(d);
  syncShade(d);
  cityRoutines(d);
  d.flags.onRoad = d.mapId === "road";
  if (d.phase === "play") {
    const nearMachine = (id) => {
      const machine = d.machines[id];
      return Boolean(
        machine &&
          machine.mapId === d.mapId &&
          Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y) <= 2,
      );
    };
    if (nearMachine("gauge")) d.flags.gaugeSeen = true;
    if (nearMachine("still")) d.flags.stillSeen = true;
    if (nearMachine("winchhouse")) d.flags.winchSeen = true;
    if (nearMachine("buffer")) d.flags.bufferSeen = true;
  }
  reconcileQuests(d);
}
function ensureCast(d) {
  for (const spawn of SPAWNS) {
    if (!d.actors[spawn.id]) d.actors[spawn.id] = spawnActor(spawn);
  }
}
function syncShade(d) {
  const shade = d.actors.shade;
  if (!shade || !shade.alive || d.combat) return;
  const dark = Boolean(d.flags.roadDark);
  shade.hostile = dark;
  shade.aggro = dark;
  shade.vision = dark && d.flags.cartPinned ? 6 : dark ? 4 : 0;
  if (
    dark &&
    d.flags.cartPinned &&
    d.mapId === "road" &&
    !d.flags.cartCover &&
    d.phase === "play"
  ) {
    d.flags.cartCover = true;
    addLog(d, "The pinned cart is cover. The shade is using it.");
  }
}
function standAt(d, id, mapId, x, y) {
  const a = d.actors[id];
  if (!a || !a.alive || a.companion || a.hostile || d.combat) return;
  if (a.mapId === mapId && a.x === x && a.y === y) return;
  const map = MAPS[mapId];
  if (!map) return;
  if (!WALKABLE.has(tileAt(map, x, y))) return;
  const door = LOCKED_DOORS.find(
    (row) => row.map === mapId && row.x === x && row.y === y,
  );
  if (door && !d.flags[door.flag]) return;
  if (
    Object.values(d.machines).some(
      (m) => m.mapId === mapId && m.x === x && m.y === y,
    )
  )
    return;
  for (const o of Object.values(d.actors)) {
    if (o.id === id || !o.alive || o.mapId !== mapId) continue;
    if (o.x === x && o.y === y) return;
  }
  if (d.player.mapId === mapId && d.player.x === x && d.player.y === y) return;
  a.mapId = mapId;
  a.x = x;
  a.y = y;
}
function cityRoutines(d) {
  if (d.combat) return;
  const hour = Number(d.flags.hour ?? 0) % 4;
  if (d.flags.nessaRefuses) standAt(d, "nessa", "haven", 5, 3);
  else if (hour === 2) standAt(d, "nessa", "haven", 8, 3);
  else standAt(d, "nessa", "haven", 7, 3);
  if (d.flags.foodLive) standAt(d, "sela", "haven", hour === 1 ? 30 : 29, 6);
  else standAt(d, "sela", "haven", 31, 8);
  if (d.actors.pip) {
    if (d.flags.foodLive)
      standAt(
        d,
        "pip",
        "haven",
        hour === 2 ? 29 : hour === 3 ? 31 : 30,
        hour === 3 ? 6 : 7,
      );
    else if (d.flags.ashAccess) standAt(d, "pip", "haven", 9, 18);
    else standAt(d, "pip", "haven", 14, 11);
  }
  if (d.flags.tenementWarm) standAt(d, "nell", "rust", hour === 3 ? 10 : 9, 8);
  else if (d.flags.washLive) standAt(d, "nell", "rust", 7, 16);
  else if (d.flags.guildWarm && !d.flags.tenementWarm)
    standAt(d, "nell", "rust", 5, 7);
  if (d.flags.rillSpoken) standAt(d, "rill", "quarry", 8, 11);
  if (d.flags.hollowWarm) standAt(d, "kel", "tundra", hour === 3 ? 13 : 14, 14);
  else if (d.flags.tundraWalked) standAt(d, "kel", "tundra", 14, 6);
  if (d.flags.roadDark) standAt(d, "lark", "road", 12, 12);
  else if (d.flags.stoneMoving) standAt(d, "lark", "road", 30, 4);
  else standAt(d, "lark", "road", 22, 4);
  if (d.flags.cartEase) standAt(d, "moss", "road", 32, 5);
  else standAt(d, "moss", "road", 17, 12);
  if (d.flags.bellowsLive === false) standAt(d, "doss", "sinks", 6, 4);
  else standAt(d, "doss", "sinks", 24, 5);
  if (d.flags.foodLive) standAt(d, "ada", "haven", 27, 6);
  else if (d.flags.plotsRefused) standAt(d, "ada", "haven", 30, 8);
  else standAt(d, "ada", "haven", 27, 7);
  if (d.flags.quarryStone === "clear") standAt(d, "pim", "quarry", 11, 11);
  else if (d.flags.quarryStone === "scarred")
    standAt(d, "pim", "quarry", 18, 19);
  else standAt(d, "pim", "quarry", 18, 16);
  if (d.flags.citadelFate === "sever") standAt(d, "sarn", "citadel", 30, 10);
  else if (d.flags.guardToll) standAt(d, "sarn", "citadel", 18, 6);
  else standAt(d, "sarn", "citadel", 14, 8);
  if (d.flags.hollowWarm) standAt(d, "drift", "tundra", 13, 15);
  else standAt(d, "drift", "tundra", 8, 15);
  if (
    d.flags.foodLive &&
    d.mapId === "haven" &&
    !d.flags.pipHome &&
    d.phase === "play"
  ) {
    d.flags.pipHome = true;
    addLog(
      d,
      "The child is not in the cut. The plots are drinking, and the alley kept the night without her.",
    );
  }
  if (
    d.flags.bellowsLive === false &&
    d.mapId === "sinks" &&
    !d.flags.dossShift &&
    d.phase === "play"
  ) {
    d.flags.dossShift = true;
    addLog(
      d,
      "Doss is not on the reed. The lung stopped making weather, and the sleeper moved.",
    );
  }
  if (
    d.flags.quarryStone === "clear" &&
    d.mapId === "quarry" &&
    !d.flags.pimCount &&
    d.phase === "play"
  ) {
    d.flags.pimCount = true;
    addLog(
      d,
      "Pim is on the count. The slab missed, and the fear went with it.",
    );
  }
  if (
    d.flags.hollowWarm &&
    d.mapId === "tundra" &&
    !d.flags.driftBed &&
    d.phase === "play"
  ) {
    d.flags.driftBed = true;
    addLog(
      d,
      "Drift is in the hollow. The weather arrived before any speech about it.",
    );
  }
  if (
    d.flags.foodLive &&
    d.mapId === "haven" &&
    !d.flags.adaPlate &&
    d.phase === "play"
  ) {
    d.flags.adaPlate = true;
    addLog(
      d,
      "Ada is at the plots with a plate. The bed is the parent. The thanks is not.",
    );
  }
  if (
    d.flags.roadDark &&
    d.mapId === "road" &&
    !d.flags.larkSouth &&
    d.phase === "play"
  ) {
    d.flags.larkSouth = true;
    addLog(
      d,
      "Lark is not on the high walk. The lamps are out, and the runner took the cut the glass does not own.",
    );
  }
  if (
    d.flags.ashAccess &&
    d.flags.stillBroken !== true &&
    d.flags.stillLicensed !== true
  )
    standAt(d, "vetch", "haven", 8, 18);
  else standAt(d, "vetch", "haven", 8, 15);
  if (d.flags.gaugeCut) standAt(d, "brin", "sinks", 7, 18);
  if (d.flags.crewFled) {
    standAt(d, "crew1", "quarry", 21, 20);
    standAt(d, "crew2", "quarry", 23, 20);
  }
  const servo = d.actors.servo;
  if (servo?.alive && d.flags.gaugeCut && !servo.hostile) {
    servo.hostile = true;
    servo.aggro = true;
    servo.vision = 4;
  }
  if (
    d.flags.cartPinned &&
    d.flags.stoneMoving &&
    d.mapId === "rust" &&
    !d.flags.rustHeldCart &&
    d.phase === "play"
  ) {
    d.flags.rustHeldCart = true;
    addLog(
      d,
      "Stone left the pit. It is not in this yard. The waystation is still holding the cart.",
    );
  }
  if (
    d.flags.cartEase &&
    d.flags.stoneMoving &&
    d.mapId === "rust" &&
    !d.flags.rustEarlyCart &&
    d.phase === "play"
  ) {
    d.flags.rustEarlyCart = true;
    addLog(
      d,
      "A cart is already in the yard. The speech about the haul has not caught up to the weight.",
    );
  }
  if (
    d.flags.washSpill &&
    d.mapId === "rust" &&
    !d.flags.washNoted &&
    d.phase === "play"
  ) {
    d.flags.washNoted = true;
    addLog(
      d,
      "The tenement pipe is drinking. The forge leg is the one that went dry.",
    );
  }
  const claim = d.machines.kilnstamp?.nodes.find((n) => n.id === "claim");
  const clerk = d.actors.cress;
  if (clerk?.alive && claim?.severed && !clerk.hostile) {
    clerk.hostile = true;
    clerk.aggro = true;
    clerk.vision = 5;
  }
  if (clerk?.alive && claim && !claim.severed && clerk.hostile) {
    clerk.hostile = false;
    clerk.aggro = false;
    clerk.vision = 0;
  }
  if (d.flags.kilnRefused) standAt(d, "harl", "kiln", 28, 6);
  else standAt(d, "harl", "kiln", 4, 6);
  if (d.flags.kilnHouses && hour !== 3) standAt(d, "teb", "kiln", 14, 8);
  else standAt(d, "teb", "kiln", 8, 14);
  standAt(d, "jun", "kiln", hour === 2 ? 27 : 30, hour === 2 ? 6 : 7);
  if (d.flags.kilnCellar) standAt(d, "nim", "kiln", 7, 18);
  else standAt(d, "nim", "kiln", 6, 15);
  if (d.flags.vossLeft) standAt(d, "voss", "road", 18, 11);
  else if (d.flags.stampCut) standAt(d, "voss", "kiln", 18, 16);
  else standAt(d, "voss", "kiln", 14, 9);
  const yardClaim = d.machines.switchdesk?.nodes.find((n) => n.id === "claim");
  const rue = d.actors.rue;
  if (rue?.alive && (yardClaim?.severed || d.flags.switchCaught) && !rue.hostile) {
    rue.hostile = true;
    rue.aggro = true;
    rue.vision = 5;
  }
  if (rue?.alive && yardClaim && !yardClaim.severed && !d.flags.switchCaught && rue.hostile) {
    rue.hostile = false;
    rue.aggro = false;
    rue.vision = 0;
  }
  if (d.flags.switchJam && !d.flags.switchShunt) standAt(d, "hale", "switch", 22, 12);
  else if (hour === 3) standAt(d, "hale", "switch", 24, 8);
  else standAt(d, "hale", "switch", 18, 9);
  if (d.flags.switchShed) standAt(d, "wick", "switch", 23, 7);
  else standAt(d, "wick", "switch", 20, 12);
  if (hour === 3) standAt(d, "rue", "switch", 6, 4);
  else standAt(d, "rue", "switch", 5, 6);
  if (d.flags.switchBay) standAt(d, "ske", "switch", 7, 15);
  else standAt(d, "ske", "switch", 6, 12);
  const glassClaim = d.machines.panestamp?.nodes.find((n) => n.id === "claim");
  const ness = d.actors.ness;
  if (ness?.alive && (glassClaim?.severed || d.flags.paneCaught) && !ness.hostile) {
    ness.hostile = true;
    ness.aggro = true;
    ness.vision = 5;
  }
  if (ness?.alive && glassClaim && !glassClaim.severed && !d.flags.paneCaught && ness.hostile) {
    ness.hostile = false;
    ness.aggro = false;
    ness.vision = 0;
  }
  if (d.flags.paneRefused) standAt(d, "orla", "pane", 26, 10);
  else if (hour === 3) standAt(d, "orla", "pane", 14, 6);
  else standAt(d, "orla", "pane", 6, 8);
  if (d.flags.paneVault) standAt(d, "fen", "pane", 10, 16);
  else standAt(d, "fen", "pane", 12, 12);
  if (hour === 3) standAt(d, "ness", "pane", 26, 12);
  else standAt(d, "ness", "pane", 23, 7);
  if (d.flags.paneCharge) standAt(d, "panemoth", "pane", 14, 10);
  else standAt(d, "panemoth", "pane", 10, 17);
  if (d.flags.paneCharge) standAt(d, "sol", "road", 27, 2);
  else standAt(d, "sol", "road", 26, 4);
  if (d.flags.paneCharge && d.mapId === "pane" && !d.flags.paneMothOut && d.phase === "play") {
    d.flags.paneMothOut = true;
    addLog(d, "A moth is on the yard heat. Nobody hired it. The melt is the parent it came for.");
  }
  if (d.flags.heardHour === hour || d.phase !== "play" || d.dialogue) return;
  d.flags.heardHour = hour;
  if (hour === 1 && d.mapId === "haven" && !d.flags.foodLive)
    addLog(d, "Midday. The cups are still empty. People walk them anyway.");
  if (hour === 2 && d.mapId === "haven" && d.flags.foodLive)
    addLog(d, "The ward takes a meal. The plots are still the parent of it.");
  if (hour === 3 && d.mapId === "rust" && d.flags.tenementWarm)
    addLog(d, "The sleepers go to the flues. The hall is not their bed.");
  if (
    hour === 3 &&
    d.mapId === "rust" &&
    !d.flags.tenementWarm &&
    d.flags.guildWarm
  ) {
    addLog(
      d,
      "Night, and the beds are cold. People drift toward the hall that has heat.",
    );
  }
  if (hour === 1 && d.mapId === "kiln" && !d.flags.brickLive && d.flags["seen:kiln"]) {
    addLog(d, "The yard is up. The set is not. People walk the clay anyway.");
  }
  if (hour === 2 && d.mapId === "kiln" && d.flags.kilnHouses) {
    addLog(d, "The houses take the heat they were given. The bill, if there is one, is a different parent.");
  }
  if (hour === 1 && d.mapId === "switch" && !d.flags.switchGreased) {
    addLog(d, "The plates are up. They still take a little blood and call it weather.");
  }
  if (hour === 2 && d.mapId === "switch" && d.flags.switchToll) {
    addLog(d, "Rue can see the haul. The seeing is a bill.");
  }
  if (hour === 1 && d.mapId === "pane" && !d.flags.paneCharge && d.flags["seen:pane"]) {
    addLog(d, "The glasshouse is up. The melt is not. People walk the sand anyway.");
  }
  if (hour === 2 && d.mapId === "pane" && d.flags.paneLevy) {
    addLog(d, "Ness can see the melt. The seeing is a bill.");
  }
}
function nudgeCreature(d, ox, oy) {
  const moth = d.actors.cinder;
  if (!moth?.companion || !moth.alive || moth.mapId !== d.mapId || d.combat)
    return;
  const step = Number(d.flags.mothStep ?? 0) + 1;
  d.flags.mothStep = step;
  const toward =
    ((tx, ty) => {
      const dx = Math.sign(tx - moth.x);
      const dy = Math.sign(ty - moth.y);
      const opts = [
        [moth.x + dx, moth.y + dy],
        [moth.x + dx, moth.y],
        [moth.x, moth.y + dy],
      ];
      for (const [x, y] of opts) {
        if (x === d.player.x && y === d.player.y) continue;
        if (walkable(d, x, y, moth.id)) {
          moth.x = x;
          moth.y = y;
          return;
        }
      }
    },
    "toward");
  if (
    (d.mapId === "road" || d.mapId === "tundra") &&
    d.flags.roadDark &&
    !d.flags.cinderDarkOk
  ) {
    if (walkable(d, ox, oy, moth.id)) {
      moth.x = ox;
      moth.y = oy;
    }
    return;
  }
  const perch =
    d.mapId === "sinks" && d.flags.bellowsLive !== false
      ? d.machines.bellows
      : d.mapId === "haven" && d.flags.foodLive
        ? d.machines.plots
        : d.mapId === "tundra" && d.flags.hollowWarm
          ? d.machines.hollow
          : null;
  if (
    perch &&
    Math.abs(d.player.x - perch.x) + Math.abs(d.player.y - perch.y) <= 5 &&
    step % 2 === 0
  ) {
    toward(perch.x, perch.y);
    return;
  }
  const gap = Math.abs(moth.x - d.player.x) + Math.abs(moth.y - d.player.y);
  if (step % 3 === 0 && gap <= 2 && walkable(d, ox, oy, moth.id)) {
    moth.x = ox;
    moth.y = oy;
    return;
  }
  if (gap > 3) toward(d.player.x, d.player.y);
}
function wardSplit(d) {
  const split = d.flags.wardSplit;
  if (split === "market" || split === "clinic" || split === "shared")
    return split;
  return "shared";
}
function edgeFlag(d, key, open, opened, closed) {
  const prev = d.flags[key];
  d.flags[key] = open;
  if (prev === void 0 || prev === open || d.phase !== "play") return;
  addLog(d, open ? opened : closed);
}
function reconcileLandmarks(d) {
  const lung = d.machines.bellows;
  const reed = lung ? seam(lung.nodes, "reed") : void 0;
  const feeding = reed ? nodeLive(lung.nodes, reed) : true;
  edgeFlag(
    d,
    "bellowsLive",
    feeding,
    "The bellows reed seats. The pump has a lung again.",
    "The bellows stops. A mended pump can still leave the city dry.",
  );
  const col = d.machines.colossus;
  const throat = col ? seam(col.nodes, "throat") : void 0;
  const breath = throat ? nodeLive(col.nodes, throat) : true;
  const boom = d.machines.crane ? seam(d.machines.crane.nodes, "boom") : void 0;
  if (boom && !boom.severed) {
    if (!breath) boom.integrity = Math.min(boom.integrity, 34);
    else if (d.flags.colossusMended)
      boom.integrity = Math.max(boom.integrity, 80);
  }
  if (
    d.mapId === "quarry" &&
    !d.flags.seenQuarry &&
    breath &&
    d.phase === "play"
  ) {
    addLog(
      d,
      "The colossus is breathing. The crane cable is not holding the pit alone.",
    );
  }
  if (d.mapId === "quarry") d.flags.seenQuarry = true;
  if (d.flags.seenQuarry) {
    edgeFlag(
      d,
      "colossusBreath",
      breath,
      "The colossus throat takes air. The crane cable is no longer alone.",
      "The colossus throat stops. The crane cable is carrying the pit by itself.",
    );
  }
  const orr = d.machines.orrery;
  const core = d.machines.crucible;
  const siphon = core ? seam(core.nodes, "siphon") : void 0;
  const turning = Boolean(
    siphon &&
    core &&
    nodeLive(core.nodes, siphon) &&
    d.flags.citadelFate !== "sever",
  );
  if (orr) setDerived(seam(orr.nodes, "drive"), turning);
  if (
    d.mapId === "citadel" &&
    !d.flags.seenCitadel &&
    turning &&
    d.phase === "play"
  ) {
    addLog(
      d,
      "The orrery is turning. It is drinking from the siphon, not from the sky.",
    );
  }
  if (d.mapId === "citadel") d.flags.seenCitadel = true;
  if (d.flags.seenCitadel || d.flags.citadelFate) {
    edgeFlag(
      d,
      "orreryTurn",
      turning,
      "The orrery takes the siphon. The citadel still has a clock.",
      "The orrery stops. The siphon is not sending a child.",
    );
  }
  const hollow = d.machines.hollow;
  const drive = orr ? seam(orr.nodes, "drive") : void 0;
  const sent = Boolean(drive && orr && nodeLive(orr.nodes, drive));
  const weather = sent && d.flags.iceCut !== true;
  if (hollow) setDerived(seam(hollow.nodes, "feed"), weather);
  if (d.flags.tundraWalked) {
    edgeFlag(
      d,
      "hollowWarm",
      weather,
      "The tundra hollow takes the orrery's weather. Kel can sleep off the ice.",
      d.flags.iceCut
        ? "The tundra hollow goes cold. The glaze was cut. A clock can still be sending."
        : "The tundra hollow goes cold. The orrery stopped sending a child downhill.",
    );
  } else d.flags.hollowWarm = weather;
}
function reconcileWard(d) {
  const cistern = d.machines.cistern;
  if (!cistern) return;
  const fed = pressureToGallery(d);
  setDerived(seam(cistern.nodes, "main"), fed);
  const split = wardSplit(d);
  const marketOn = fed && split !== "clinic";
  const clinicOn = fed && split !== "market";
  setDerived(seam(cistern.nodes, "market"), marketOn);
  setDerived(seam(cistern.nodes, "clinic"), clinicOn);
  accessFlag(
    d,
    "wardMarket",
    marketOn,
    "The stall leg takes water.",
    "The stall leg goes dry.",
  );
  accessFlag(
    d,
    "wardClinic",
    clinicOn,
    "The clinic leg takes water.",
    "The clinic leg goes dry.",
  );
  const fate = String(d.flags.pumpFate ?? "");
  const clean = fate === "mend" || fate === "wren" || fate === "speech";
  const goods = !marketOn
    ? "none"
    : clean
      ? "clean"
      : fate === "bleed" && d.flags.provisionalStamp
        ? "stamped"
        : fate === "bleed"
          ? "brown"
          : "none";
  d.flags.wardGoods = goods;
  observeWard(d);
}
function observeWard(d) {
  const fate = String(d.flags.pumpFate ?? "");
  if (!fate && !d.flags.seenWard && !d.flags.checkpointLead) return;
  const bits = [];
  if (d.flags.wardMarket && d.flags.wardClinic)
    bits.push("The ward split feeds the stall and the clinic.");
  else if (d.flags.wardMarket)
    bits.push("The stall has the feed. The clinic tap is dry.");
  else if (d.flags.wardClinic)
    bits.push("The clinic has the feed. The stall is dry.");
  else
    bits.push(
      "The cistern main is dry. It drinks from the Sinks pump, not from a local well.",
    );
  if (fate === "bleed") {
    bits.push(
      d.flags.provisionalStamp
        ? "The Bureau stamped the brown water as provisional."
        : "The water is brown. The stall will not call it drinking water.",
    );
  } else if (fate === "mend" || fate === "wren" || fate === "speech")
    bits.push("The water upstream is seated.");
  else if (fate === "flood")
    bits.push("The ward hears the cellars. The tap does not.");
  else if (fate === "lockout")
    bits.push(
      "The Bureau still prices the district as dry. The valve was never seated.",
    );
  if (d.flags.roadWatch)
    bits.push("Haulage is stopped. The squad is on the road mouth.");
  else if (d.flags.plateStair)
    bits.push("The plate stair is signed. Freight can move.");
  const text = bits.join(" ");
  const hit = d.journal.find((j) => j.id === "oakhaven");
  if (hit) {
    hit.title = "The lower ward, as it drinks";
    hit.text = text;
    hit.status = "open";
  } else
    d.journal.push({
      id: "oakhaven",
      title: "The lower ward, as it drinks",
      text,
      status: "open",
    });
}
function slabDown(d) {
  if (d.flags["crane:dropped"] === true) return true;
  const slab = d.machines.crane ? seam(d.machines.crane.nodes, "slab") : void 0;
  return Boolean(slab?.spent);
}
function quarryMark(d) {
  if (!slabDown(d)) return "hung";
  if (d.flags.workersClear && !d.flags.workerHurt) return "clear";
  return "scarred";
}
function hearthSplit(d) {
  const split = d.flags.hearthSplit;
  if (split === "beds" || split === "hall" || split === "shared") return split;
  return "shared";
}
function reconcileCity(d) {
  const stone = quarryMark(d);
  const prev = d.flags.quarryStone;
  d.flags.quarryStone = stone;
  if (prev !== stone && stone !== "hung" && d.phase === "play") {
    addLog(
      d,
      stone === "clear"
        ? "The slab is down, and the riggers were not under it. Stone can leave the pit."
        : "The slab is down. A rigger's name is on it. The stone can still leave.",
    );
  }
  const arrives =
    stone !== "hung" &&
    Boolean(d.flags.plateStair) &&
    d.flags.roadWatch !== true;
  d.flags.stoneMoving = arrives;
  const hearth = d.machines.hearth;
  if (hearth) {
    setDerived(seam(hearth.nodes, "haul"), arrives);
    const bed = seam(hearth.nodes, "bed");
    if (bed && !bed.severed) {
      if (d.flags.hearthHeld && !arrives) {
        bed.dependsOn = [];
        bed.integrity = Math.max(bed.integrity, 62);
      } else {
        bed.dependsOn = ["haul"];
        if (arrives && bed.integrity < 40) bed.integrity = 100;
        else if (!arrives) bed.integrity = Math.min(bed.integrity, 18);
      }
    }
    const split = hearthSplit(d);
    const hot = Boolean(bed && nodeLive(hearth.nodes, bed));
    setDerived(seam(hearth.nodes, "beds"), hot && split !== "hall");
    setDerived(seam(hearth.nodes, "hall"), hot && split !== "beds");
    accessFlag(
      d,
      "tenementWarm",
      hot && split !== "hall",
      "The sleeper flues take heat.",
      "The sleeper flues go cold.",
    );
    accessFlag(
      d,
      "guildWarm",
      hot && split !== "beds",
      "The guild flue takes heat.",
      "The guild flue goes cold.",
    );
  }
  syncWash(d);
  observeCity(d);
}
function syncWash(d) {
  if (d.flags.washChosen !== true) return;
  const wash = d.machines.wash;
  if (!wash) return;
  const head = d.machines.head;
  const feed = head ? seam(head.nodes, "feed") : void 0;
  const wet = Boolean(feed && head && nodeLive(head.nodes, feed));
  setDerived(seam(wash.nodes, "gallery"), wet);
  const shared = d.flags.washShared === true;
  const toSleepers = d.flags.washSpill === true || shared;
  const toForge = d.flags.washSpill !== true || shared;
  setDerived(seam(wash.nodes, "sleepers"), wet && toSleepers);
  setDerived(seam(wash.nodes, "forgeleg"), wet && toForge);
  const valve = seam(wash.nodes, "valve");
  if (valve) {
    valve.severed = false;
    valve.integrity = 84;
    valve.revealed = true;
  }
  d.flags.washLive = Boolean(wet && toSleepers);
}
function observeCity(d) {
  const stone = String(d.flags.quarryStone ?? "hung");
  if (
    stone === "hung" &&
    !d.flags.hearthHeld &&
    !d.flags.tenementWarm &&
    !d.flags.guildWarm &&
    !d.flags.washChosen &&
    !d.flags.cartPinned &&
    !d.flags.cartEase
  )
    return;
  const bits = [];
  if (stone === "clear")
    bits.push("The quarry slab is down. The riggers were clear.");
  else if (stone === "scarred")
    bits.push("The quarry slab is down. A rigger was under it.");
  if (d.flags.stoneMoving)
    bits.push("Stone is on the road. The plate stair is carrying it.");
  else if (stone !== "hung" && d.flags.roadWatch)
    bits.push("Stone is sitting because the squad holds the road mouth.");
  else if (stone !== "hung")
    bits.push("Stone is sitting because the plate stair has no signature.");
  if (d.flags.cartPinned)
    bits.push(
      "The waystation brake is pinned. Stone that leaves the pit does not become ore.",
    );
  else if (d.flags.cartEase)
    bits.push(
      "The waystation brake was eased. The cart does not wait for a speech.",
    );
  if (d.flags.washSpill)
    bits.push(
      "The tenement wash is drinking the quench. The forge is the child that goes dry.",
    );
  else if (d.flags.washShared)
    bits.push(
      "The wash is shared. Sleepers and forge both drink, if the gallery does.",
    );
  if (d.flags.hearthHeld && !d.flags.stoneMoving)
    bits.push("The fire is banked by hand. The quarry is not its parent.");
  if (d.flags.tenementWarm && d.flags.guildWarm)
    bits.push("The tenement and the guild hall both have heat.");
  else if (d.flags.tenementWarm)
    bits.push("The sleeper flues are warm. The hall is not.");
  else if (d.flags.guildWarm)
    bits.push("The guild hall is warm. The sleepers are not.");
  else bits.push("The tenement hearth is cold.");
  const text = bits.join(" ");
  const hit = d.journal.find((j) => j.id === "city-now");
  if (hit) {
    hit.title = "The city, as it holds";
    hit.text = text;
    hit.status = "open";
  } else
    d.journal.push({
      id: "city-now",
      title: "The city, as it holds",
      text,
      status: "open",
    });
}
function takeSnap(d) {
  if (!d.combat) return null;
  const roster =
    d.combat.roster ?? d.combat.order.filter((id) => id !== "player");
  return {
    mapId: d.mapId,
    roster,
    changes: d.combat.changes ?? [],
    escapes: d.combat.escapes ?? [],
    verbMark: d.combat.verbMark,
    weaponsAtStart: d.combat.weaponsAtStart ?? {},
    closing: void 0,
  };
}
function releasePending(d, varrFate) {
  const snap = d.pendingEncounter;
  if (!snap) return;
  d.pendingEncounter = null;
  const override = {};
  if (varrFate === "dead") override.varr = "dead";
  else if (varrFate === "stood") override.varr = "stood-down";
  else if (varrFate === "spared") override.varr = "broken-open";
  fileDeed(d, snap, snap.closing, override);
}
function endCombat(d, closing, hold) {
  const tally = d.combat?.tally ?? { strikes: 0, cuts: 0, mends: 0, kills: 0 };
  const fought = Boolean(
    tally.strikes + tally.cuts + tally.mends + tally.kills > 0,
  );
  const snap = takeSnap(d);
  if (hold && snap && d.player.hp > 0) {
    d.pendingEncounter = { ...snap, closing };
  } else {
    d.pendingEncounter = null;
    if (d.player.hp > 0 && snap) fileDeed(d, snap, closing);
  }
  d.combat = null;
  d.path = [];
  d.intent = null;
  for (const a of [d.player, ...Object.values(d.actors)]) a.ap = 0;
  if (d.player.hp <= 0) return;
  if (d.mapId === "road") {
    d.dialogue = { convo: "road-after", node: "start" };
    return;
  }
  if (closing) addLog(d, closing);
  else if (fought && tally) addLog(d, evaluate(tally));
  else
    addLog(d, "The engagement releases. The structure holds, or it doesn't.");
}
function slipEncounter(d) {
  if (!d.combat || currentId(d) !== "player") return;
  d.combat = null;
  d.path = [];
  d.intent = null;
  addLog(d, "You leave the shape of the fight. It is not finished.");
}
function noteEscape(d, id) {
  const a = d.actors[id];
  if (!d.combat || !a?.alive) return;
  if (!d.combat.escapes) d.combat.escapes = [];
  if (!d.combat.escapes.includes(id)) d.combat.escapes.push(id);
  a.hostile = false;
  a.aggro = false;
  addLog(d, `${a.name} leaves the engagement.`);
  if (!livingHostiles(d).length) endCombat(d);
}
function hasEncounter(d, encounterId) {
  return (d.deeds ?? []).some(
    (row) => row.encounterId === encounterId && row.resolved !== false,
  );
}
function actorFate(d, id) {
  for (const row of d.deeds ?? []) {
    const person = row.participants?.find((p) => p.id === id);
    if (person) return person.fate;
  }
  return null;
}
function didStandDown(d, id) {
  return recordedFate(d, id, "stood-down");
}
function didDie(d, id) {
  return recordedFate(d, id, "dead");
}
function didEscape(d, id) {
  return recordedFate(d, id, "escaped");
}
function recordedFate(d, id, fate) {
  return (d.deeds ?? []).some(
    (row) =>
      row.resolved !== false &&
      row.participants?.some((p) => p.id === id && p.fate === fate),
  );
}
function wasSevered(d, ownerId, nodeId) {
  let severed = false;
  const records = [...(d.deeds ?? [])].reverse();
  for (const row of records) {
    for (const change of row.changes ?? []) {
      if (change.ownerId !== ownerId || change.nodeId !== nodeId) continue;
      if (change.verb === "cut") severed = true;
      if (change.verb === "mend" || change.verb === "repair") severed = false;
    }
  }
  return severed;
}
function wasBaselineLost(d, encounterId) {
  return (d.deeds ?? []).some(
    (row) =>
      row.baseline === "lost" &&
      (!encounterId || row.encounterId === encounterId),
  );
}
function didPreserve(d, encounterId) {
  return (d.deeds ?? []).some(
    (row) => row.encounterId === encounterId && row.baseline === "preserved",
  );
}
function didUseVerb(d, verb, encounterId) {
  if (!encounterId) return (d.verbs?.[verb] ?? 0) > 0;
  return (d.deeds ?? []).some(
    (row) => row.encounterId === encounterId && (row.used?.[verb] ?? 0) > 0,
  );
}
function askHistory(d, q) {
  switch (q.ask) {
    case "encounter":
      return hasEncounter(d, q.id);
    case "stood-down":
      return didStandDown(d, q.id);
    case "died":
      return didDie(d, q.id);
    case "escaped":
      return didEscape(d, q.id);
    case "severed":
      return wasSevered(d, q.owner, q.node);
    case "baseline-lost":
      return wasBaselineLost(d, q.id);
    case "preserved":
      return didPreserve(d, q.id);
    case "verb":
      return didUseVerb(d, q.verb, q.id);
    case "now":
      return actorFate(d, q.id) === q.fate;
    case "checkpoint":
      return d.flags.checkpointLead === q.lead;
  }
}
function memoryConvo(d, id) {
  if (id === "varr") {
    if (d.flags.varrFate === "dead" || actorFate(d, "varr") === "dead")
      return null;
    const fate = actorFate(d, "varr");
    const open = fate === "broken-open" || d.flags.varrFate === "spared";
    const quiet =
      fate === "stood-down" ||
      fate === "escaped" ||
      d.flags.varrFate === "stood";
    if (!open && !quiet) return null;
    if (open) return "varr-memory-open";
    const cut =
      wasSevered(d, "varr", "chamber") ||
      wasSevered(d, "varr", "mount") ||
      wasSevered(d, "varr", "rifle");
    return cut ? "varr-memory-cut" : "varr-memory";
  }
  if (id === "en1" || id === "en2") {
    if (d.flags.checkpointLead === "vacant") return `checkpoint-vacant-${id}`;
    if (d.flags.checkpointLead === "varr") return `checkpoint-held-${id}`;
  }
  return null;
}
const VERB_LENS = {
  audit: ["structure", "intent"],
  cut: ["structure", "causality"],
  mend: ["structure"],
  repair: ["structure"],
  brace: ["structure"],
  craft: ["structure"],
  fight: ["structure"],
  redirect: ["flow"],
  sabotage: ["flow", "causality"],
  rescue: ["biology", "social"],
  negotiate: ["social"],
  threaten: ["social"],
  barter: ["social"],
  sneak: ["intent"],
};
function evaluate(t) {
  if (t.kills === 0 && t.cuts > 0 && t.strikes === 0)
    return "Precision. The room changed shape. Nobody had to leave it.";
  if (t.kills === 0 && t.cuts > 0)
    return "You cut the encounter down and left the people standing in it.";
  if (t.kills === 0 && t.mends > 0 && t.strikes === 0)
    return "Preservation. The fight was mostly putting load back where it belongs.";
  if (t.kills > 0 && t.cuts === 0)
    return "Ruthlessness. The graphs stayed shut. The bodies did not.";
  if (t.kills > 0 && t.cuts > 0)
    return "Hybrid. You opened the seams you needed, then finished what was left.";
  if (t.strikes > 0 && t.kills === 0)
    return "Survival. Blows were traded. The engagement let go anyway.";
  return "The engagement releases. The structure holds, or it doesn't.";
}
function removeFromOrder(d, id) {
  if (!d.combat) return;
  const idx = d.combat.order.indexOf(id);
  if (idx >= 0) d.combat.order.splice(idx, 1);
  if (d.combat.index >= d.combat.order.length) d.combat.index = 0;
}
function onZero(d, a) {
  if (a.id === "player") {
    d.player.hp = 0;
    d.phase = "dead";
    d.combat = null;
    d.dialogue = null;
    d.panel = "none";
    d.deathText = d.ironman
      ? "The lens cracks. Ironman does not offer a second reading. The Sinks keep their steam without you."
      : "The lens cracks. The baseline you were holding comes apart. A previous ledger may still exist.";
    d.pendingEncounter = null;
    play("hurt");
    return;
  }
  if (a.downConvo && !d.flags[`down:${a.id}`]) {
    d.flags[`down:${a.id}`] = true;
    a.hp = 1;
    a.hostile = false;
    a.aggro = false;
    a.stunned = false;
    if (d.combat) {
      for (const id of [...d.combat.order]) {
        const o = d.actors[id];
        if (o?.hostile) {
          o.hostile = false;
          o.aggro = false;
        }
      }
    }
    endCombat(d, void 0, true);
    d.dialogue = { convo: a.downConvo, node: "start" };
    addLog(d, `${a.name} is broken open, not gone.`);
    return;
  }
  a.hp = 0;
  a.alive = false;
  a.companion = false;
  if (d.combat?.tally) d.combat.tally.kills += 1;
  addLog(d, `${a.name} loses the last readable baseline.`);
  if (a.template === "enforcer" || a.template === "guard") {
    addItem(d, "scrap", 1);
    d.scrip += 6;
    if (!d.flags.foundRifle) {
      d.flags.foundRifle = true;
      addItem(d, "rifle", 1, 58);
      addItem(d, "coat", 1, 64);
      addLog(
        d,
        "You take the steam rifle and the worker's coat. Both are tired.",
      );
    } else addLog(d, "Plate scrap, and a few scrip still in the lining.");
  }
  floatText(a.x, a.y, "unraveled", "#c45c26");
  removeFromOrder(d, a.id);
  if (
    d.combat &&
    !d.combat.order.some((id) => d.actors[id]?.alive && d.actors[id]?.hostile)
  ) {
    endCombat(d);
  }
}
function applyHp(d, id, dmg, armored = false) {
  const a = actorById(d, id);
  if (!a || !a.alive) return;
  let n = dmg;
  if (armored) n = Math.max(1, Math.round(n * Math.pow(0.72, armorCount(a))));
  if (id === "player" && d.equipped.armor && ITEMS[d.equipped.armor]?.resist) {
    const wear =
      (d.inventory.find((i) => i.id === d.equipped.armor)?.condition ?? 100) /
      100;
    const resist = ITEMS[d.equipped.armor].resist ?? 1;
    const eased = 1 - (1 - resist) * wear;
    n = Math.max(1, Math.round(n * eased));
  }
  if (a.companion && a.kit?.armor && ITEMS[a.kit.armor]?.resist) {
    n = Math.max(1, Math.round(n * (ITEMS[a.kit.armor].resist ?? 1)));
  }
  if (a.guarding) {
    n = Math.max(1, Math.round(n * 0.55));
    a.guarding = false;
    addLog(
      d,
      id === "player"
        ? "The brace takes the blow and spends itself."
        : `${a.name}'s brace takes the blow and spends itself.`,
    );
  }
  a.hp -= n;
  floatText(a.x, a.y, `-${n}`, id === "player" ? "#c45c26" : "#f3ead7");
  if (a.hp <= 0) onZero(d, a);
  else play(id === "player" ? "hurt" : "hit");
}
function healActor(d, id, n) {
  const a = actorById(d, id);
  if (!a || !a.alive) return;
  a.hp = Math.min(a.maxHp, a.hp + n);
  floatText(a.x, a.y, `+${n}`, "#d4b483");
  play("mend");
}
function livingHostiles(d) {
  if (!d.combat) return [];
  return d.combat.order.filter(
    (id) => d.actors[id]?.alive && d.actors[id]?.hostile,
  );
}
function startCombat(d, ids) {
  if (d.phase !== "play") return;
  d.pendingEncounter = null;
  let list = ids.filter((id) => d.actors[id]?.alive);
  if (d.flags.duel) list = list.filter((id) => id !== "rel1");
  if (!list.length) return;
  for (const id of list) {
    const a = d.actors[id];
    if (!a) continue;
    a.hostile = true;
    a.aggro = true;
  }
  const parts = [
    "player",
    ...Object.values(d.actors)
      .filter((a) => a.companion && a.alive)
      .map((a) => a.id),
    ...list,
  ];
  const unique = [...new Set(parts)];
  const scored = unique.map((id) => {
    const a = actorById(d, id);
    return {
      id,
      score: a.attrs.perception + a.attrs.finesse + Math.random() * 4,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  const weaponsAtStart = {};
  for (const id of list) {
    const a = d.actors[id];
    if (a)
      weaponsAtStart[id] = a.nodes.some(
        (n) => n.effect === "weapon" && nodeLive(a.nodes, n),
      );
  }
  d.combat = {
    order: scored.map((s) => s.id),
    index: 0,
    round: 1,
    audited: [],
    plans: {},
    tally: { strikes: 0, cuts: 0, mends: 0, kills: 0 },
    roster: list,
    changes: [],
    escapes: [],
    verbMark: { ...(d.verbs ?? {}) },
    weaponsAtStart,
  };
  d.path = [];
  d.intent = null;
  d.panel = "none";
  d.dialogue = null;
  addLog(d, "Structural engagement.");
  play("unmend");
  beginTurn(d);
}
function currentId(d) {
  if (!d.combat) return null;
  return d.combat.order[d.combat.index] ?? null;
}
function refreshTurn(d, a) {
  if (a.id === "player") {
    a.maxAp = 7 + Math.floor(a.attrs.finesse / 4);
    const legs = gait(a);
    a.ap =
      legs === "dead"
        ? Math.max(2, a.maxAp - 4)
        : legs === "slow"
          ? Math.max(3, a.maxAp - 2)
          : a.maxAp;
    if (carryWeight(d) > carryMax(d)) {
      a.ap = Math.max(2, a.ap - 2);
      addLog(d, "The pack argues with your knees.");
    }
    d.focus = Math.min(focusMax(d), d.focus + 2);
    freezeIntents(d);
    return;
  }
  if (a.companion) {
    a.ap = companionAp(a);
    return;
  }
  a.ap = a.polymorphic ? 6 : 4;
}
function advance(d) {
  if (!d.combat) return;
  if (!livingHostiles(d).length) {
    endCombat(d);
    return;
  }
  const order = d.combat.order;
  for (let n = 0; n < order.length; n++) {
    d.combat.index = (d.combat.index + 1) % order.length;
    if (d.combat.index === 0) d.combat.round += 1;
    const id = order[d.combat.index];
    const a = actorById(d, id);
    if (a?.alive && (id === "player" || a.companion || a.hostile)) return;
  }
}
function beginTurn(d) {
  if (!d.combat || d.phase !== "play") return;
  if (!livingHostiles(d).length) {
    endCombat(d);
    return;
  }
  const id = currentId(d);
  const a = id ? actorById(d, id) : null;
  if (!a || !a.alive) {
    advance(d);
    beginTurn(d);
    return;
  }
  if (a.polymorphic) polymorph(d, a, d.combat.round);
  if (a.stunned) {
    a.stunned = false;
    addLog(d, `${a.name} is still inside the overload.`);
    advance(d);
    beginTurn(d);
    return;
  }
  refreshTurn(d, a);
  if (id === "player") return;
  if (a.companion) companionAct(d, a);
  else enemyAct(d, a);
  if (!d.combat || d.phase !== "play") return;
  advance(d);
  beginTurn(d);
}
function polymorph(d, a, round) {
  if (a.nodes.some((n) => n.pinned)) {
    for (const n of a.nodes) n.pinned = false;
    addLog(d, "A pinned seam holds for a breath, then forgets.");
    return;
  }
  const live = a.nodes.length ? round % a.nodes.length : 0;
  a.nodes.forEach((n, i) => {
    n.decoy = i !== live;
    n.revealed = false;
    n.severed = false;
    n.integrity = 100;
    n.tier = "obfuscated";
    n.pinned = false;
    n.confidence = "unknown";
    n.spent = false;
  });
  addLog(d, `${a.name} rearranges the graph.`);
}
function stepToward(d, a, target) {
  if (gait(a) === "dead") return false;
  const opts = [
    { x: a.x + 1, y: a.y },
    { x: a.x - 1, y: a.y },
    { x: a.x, y: a.y + 1 },
    { x: a.x, y: a.y - 1 },
  ].filter((p) => walkable(d, p.x, p.y, a.id));
  opts.sort((p, q) => dist(p, target) - dist(q, target));
  const pick = opts[0];
  if (!pick) return false;
  const cost = slow(a) ? 2 : 1;
  if (a.ap < cost) return false;
  a.ap -= cost;
  a.x = pick.x;
  a.y = pick.y;
  return true;
}
function strike(d, attacker, defender) {
  const weapon = weaponOf(attacker);
  const range = weapon.range ?? 1;
  if (dist(attacker, defender) > range) {
    addLog(d, "Out of reach.");
    return false;
  }
  if (attacker.ap < 3) {
    if (attacker.id === "player") noteOnce(d, "No action left. End the turn.");
    else addLog(d, "Not enough action.");
    return false;
  }
  attacker.ap -= 3;
  if (attacker.id === "player") {
    noteVerb(d, "fight");
    if (d.combat?.tally) d.combat.tally.strikes += 1;
  }
  const chance = clamp(
    56 + attacker.attrs.finesse * 3 - defender.attrs.finesse * 2,
    18,
    93,
  );
  const rolled = rollD100();
  if (rolled > chance) {
    addLog(
      d,
      `${attacker.name} misses ${defender.name}. (${rolled} vs ${chance})`,
    );
    floatText(defender.x, defender.y, "miss", "#a89880");
    return true;
  }
  const stat = weapon.melee ? attacker.attrs.body : attacker.attrs.finesse;
  let dmg = (weapon.damage ?? 4) + Math.floor(stat / 2) + (rolled % 3) - 1;
  if (attacker.id === "mara" && d.flags.maraFate === "intact") dmg += 2;
  if (
    attacker.nodes.some(
      (n) => n.effect === "spell" && nodeLive(attacker.nodes, n),
    ) &&
    Math.random() < 0.45
  ) {
    dmg += 4;
    addLog(d, "A matrix discharges.");
  }
  const broken = brokenMount(attacker);
  dmg = Math.max(1, Math.round(dmg * (broken ? 1 : gearWear(d, attacker))));
  if (attacker.id === "player" && habit(d, "fight")) dmg += 2;
  if (defender.id === "player" && d.flags.strain === "story") dmg = Math.max(1, Math.round(dmg * 0.7));
  if (defender.id === "player" && d.flags.strain === "hard") dmg = Math.max(1, Math.round(dmg * 1.25));
  addLog(
    d,
    broken
      ? `${attacker.name} hits ${defender.name} with bare hands. The mount will not fire.`
      : `${attacker.name} hits ${defender.name} with the ${weapon.name.toLowerCase()}.`,
  );
  applyHp(d, defender.id, dmg, true);
  if (weapon.pin) {
    const held = pinOnHit(defender.nodes);
    if (held) addLog(d, `The hook holds ${held.name}.`);
  }
  bump(4);
  return true;
}
const VERB_VOICE = {
  fight: "You settle arguments with the body.",
  audit: "You read before you trust a surface.",
  cut: "You trust a severed parent more than a speech.",
  mend: "You put load back on things that can carry it.",
  repair: "You reseat what other people abandon.",
  sneak: "You leave rooms without asking them.",
  negotiate: "You spend a sentence where others spend blood.",
  threaten: "You let fear do the walking.",
  barter: "You move scarcity by hand.",
  sabotage: "You make the room into the weapon.",
  craft: "You turn scrap into a new verb.",
  brace: "You spend a turn becoming harder to erase.",
  rescue: "You keep people in the ledger.",
  redirect: "You change where a system is allowed to flow.",
};
const VERB_MARK = {
  fight: "The hands remember fighting. A habit, not a class.",
  audit: "The hands remember reading. A habit, not a class.",
  cut: "The hands remember cutting. A habit, not a class.",
  mend: "The hands remember mending. A habit, not a class.",
  repair: "The hands remember reseating. A habit, not a class.",
  sneak: "The hands remember leaving quietly. A habit, not a class.",
  negotiate: "The hands remember talking a room down. A habit, not a class.",
  threaten: "The hands remember a threat that landed. A habit, not a class.",
  barter: "The hands remember a trade. A habit, not a class.",
  sabotage:
    "The hands remember making the room do the work. A habit, not a class.",
  craft: "The hands remember building a tool. A habit, not a class.",
  brace: "The hands remember setting weight. A habit, not a class.",
  rescue: "The hands remember keeping someone. A habit, not a class.",
  redirect: "The hands remember changing a flow. A habit, not a class.",
};
function noteVerb(d, verb) {
  if (!d.verbs) d.verbs = {};
  const n = (d.verbs[verb] ?? 0) + 1;
  d.verbs[verb] = n;
  if (n === 4) addLog(d, VERB_MARK[verb]);
  awaken(d);
}
function habit(d, verb, at = 4) {
  return (d.verbs?.[verb] ?? 0) >= at;
}
function noteTrace(d, key) {
  if (!d.traces) d.traces = {};
  d.traces[key] = (d.traces[key] ?? 0) + 1;
  awaken(d);
}
function noteField(d, key) {
  noteTrace(d, key);
}
function touchSeam(d, n) {
  if (n.effect === "flow") noteTrace(d, "flow");
  if (n.domain === "biology" || n.effect === "life") noteTrace(d, "biology");
  if (n.domain === "mind") noteTrace(d, "mind");
  if (n.domain === "continuity" || n.effect === "core")
    noteTrace(d, "continuity");
}
const LENS_NAME = {
  structure: "Structure",
  flow: "Flow",
  biology: "Biology",
  mind: "Mind",
  social: "Social",
  intent: "Intent",
  causality: "Causality",
  continuity: "Continuity",
};
const LENS_TENDENCY = {
  structure: "STRUCTURAL",
  flow: "FLUID",
  biology: "BIOLOGICAL",
  mind: "COGNITIVE",
  social: "SOCIAL",
  intent: "INTENT",
  causality: "CAUSAL",
  continuity: "CONTINUOUS",
};
const LENS_OPEN = {
  flow: "Flow is in the ledger now. You changed where something was allowed to move.",
  biology:
    "Biology is in the ledger now. A body is a graph. A missing baseline cannot be invented.",
  mind: "Mind is in the ledger now. You can read a cognitive seam. You do not get to decide who they are.",
  social:
    "Social is in the ledger now. People are held by obligations, not only by bolts.",
  intent:
    "Intent is in the ledger now. Read them again. The next action will name what it still needs.",
  causality:
    "The cut did not stop at the seam. A child lost function without being cut.",
  continuity:
    "Continuity is in the ledger now. The question is what is still itself.",
};
function verbCount(d, verb) {
  return d.verbs?.[verb] ?? 0;
}
function traceCount(d, key) {
  return d.traces?.[key] ?? 0;
}
function lensReads(d) {
  const rows = [
    {
      id: "structure",
      perception: verbCount(d, "audit"),
      precision: verbCount(d, "cut") + verbCount(d, "brace"),
      reach:
        verbCount(d, "mend") + verbCount(d, "repair") + verbCount(d, "craft"),
    },
    {
      id: "flow",
      perception: verbCount(d, "redirect") + traceCount(d, "flow"),
      precision: verbCount(d, "redirect"),
      reach: verbCount(d, "sabotage") + traceCount(d, "flow"),
    },
    {
      id: "biology",
      perception: traceCount(d, "biology"),
      precision: verbCount(d, "rescue") + traceCount(d, "biology"),
      reach: verbCount(d, "rescue"),
    },
    {
      id: "mind",
      perception: traceCount(d, "mind"),
      precision: traceCount(d, "mind"),
      reach: 0,
    },
    {
      id: "social",
      perception: verbCount(d, "negotiate"),
      precision: verbCount(d, "threaten"),
      reach: verbCount(d, "barter"),
    },
    {
      id: "intent",
      perception: traceCount(d, "intent"),
      precision: 0,
      reach: 0,
    },
    {
      id: "causality",
      perception: traceCount(d, "cascade"),
      precision: Math.min(verbCount(d, "cut"), traceCount(d, "cascade")),
      reach: traceCount(d, "cascade") + verbCount(d, "sabotage"),
    },
    {
      id: "continuity",
      perception: traceCount(d, "continuity"),
      precision: traceCount(d, "continuity"),
      reach: traceCount(d, "continuity"),
    },
  ];
  return rows.filter((row) => row.perception + row.precision + row.reach > 0);
}
function awaken(d) {
  for (const row of lensReads(d)) {
    if (row.id === "structure") continue;
    const key = `lens:${row.id}`;
    if (d.flags[key]) continue;
    d.flags[key] = true;
    const line = LENS_OPEN[row.id];
    if (line) addLog(d, line);
  }
}
function tendencies(d) {
  const rows = lensReads(d);
  if (!rows.length) return [];
  const weight = (row) => row.perception + row.precision + row.reach;
  let top = [...rows].sort(
    (a, b) => weight(b) - weight(a) || a.id.localeCompare(b.id),
  )[0];
  const structure = rows.find((row) => row.id === "structure");
  if (structure && top.id !== "structure" && weight(top) <= weight(structure))
    top = structure;
  const words = [LENS_TENDENCY[top.id]];
  const perception = rows.reduce((sum, row) => sum + row.perception, 0);
  const precision = rows.reduce((sum, row) => sum + row.precision, 0);
  const reach = rows.reduce((sum, row) => sum + row.reach, 0);
  if (precision >= 2 && precision >= perception && precision >= reach)
    words.push("PRECISE");
  else if (perception >= 2 && perception >= precision && perception >= reach)
    words.push("PERCEPTIVE");
  else if (reach >= 2) words.push("FAR-REACHING");
  const kept =
    verbCount(d, "mend") + verbCount(d, "repair") + verbCount(d, "rescue");
  const cut = verbCount(d, "cut") + verbCount(d, "sabotage");
  if (kept >= 2 && kept > cut) words.push("PRESERVATIVE");
  else if (cut >= 2 && cut > kept) words.push("SEVERING");
  if (verbCount(d, "sneak") >= 2) words.push("QUIET");
  return words.slice(0, 3);
}
function habitLine(d) {
  const ranked = Object.keys(VERB_VOICE)
    .map((id) => ({ id, n: d.verbs?.[id] ?? 0 }))
    .filter((row) => row.n > 0)
    .sort((a, b) => b.n - a.n || a.id.localeCompare(b.id));
  if (!ranked.length)
    return "No habit yet. There is no class to file. The city learns the verbs you repeat.";
  const [first, second] = ranked;
  if (second && second.n >= 2)
    return `${VERB_VOICE[first.id]} ${VERB_VOICE[second.id]}`;
  return VERB_VOICE[first.id];
}
const BECOMING_ALONE = {
  structure: "a structural patch",
  flow: "a hand on the pressure",
  biology: "a field surgeon",
  mind: "a reader of other people's seams",
  social: "a fixer of obligations",
  intent: "an investigator",
  causality: "a causal strategist",
  continuity: "a preservationist",
};
const BECOMING_WITH = {
  structure: "keeps the bolts honest",
  flow: "decides where a flow is allowed to go",
  biology: "treats a body as a graph",
  mind: "will not invent who someone is",
  social: "works the obligations, not only the bolts",
  intent: "reads what an action still needs",
  causality: "follows a cut past the seam that was touched",
  continuity: "asks what is still itself",
};
function becoming(d) {
  const weight = (row) => row.perception + row.precision + row.reach;
  const ranked = lensReads(d)
    .filter((row) => weight(row) > 0)
    .sort((a, b) => weight(b) - weight(a) || a.id.localeCompare(b.id));
  if (!ranked.length)
    return "Silas is not a class. The city has not learned him yet.";
  const top = ranked[0];
  const rest = ranked.filter((row) => row.id !== top.id && weight(row) >= 2);
  if (!rest.length) return `Silas is becoming ${BECOMING_ALONE[top.id]}.`;
  const tails = rest.slice(0, 2).map((row) => BECOMING_WITH[row.id]);
  return `Silas is becoming ${BECOMING_ALONE[top.id]} who ${tails.join(", and who ")}.`;
}
function cityLaborLine(d) {
  if (d.flags.stoneMoving && d.flags.tenementWarm && d.flags.guildWarm)
    return "Stone is moving. The tenement and the hall both have a night.";
  if (d.flags.tenementWarm && !d.flags.guildWarm)
    return "The sleepers have the heat. The guild hall does not.";
  if (d.flags.guildWarm && !d.flags.tenementWarm)
    return "The guild hall has the heat. The sleepers do not.";
  if (d.flags.hearthHeld && !d.flags.stoneMoving)
    return "A fire is banked in the Rust Districts. The quarry is not feeding it.";
  if (d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred")
    return "Stone is down in the pit. It has not reached a hearth.";
  if (d.flags.wardSeated) return "A shared split was seated in the lower ward.";
  return "No ward machine has been filed in their name.";
}
function factionFacts(d) {
  const bureauLead =
    d.flags.checkpointLead === "varr"
      ? "Checkpoint leadership remains with Captain Varr."
      : d.flags.checkpointLead === "vacant"
        ? "Checkpoint leadership is vacant."
        : "The south plate is still a Bureau door.";
  const priced = d.flags.provisionalStamp
    ? "Brown water carries a provisional stamp."
    : d.flags.pumpFate === "lockout"
      ? "Pricing still calls the district dry."
      : d.flags.pumpFate === "mend" ||
          d.flags.pumpFate === "wren" ||
          d.flags.pumpFate === "speech"
        ? "They will price seated water as if the seal had done it."
        : "No civic price has been filed for the Sinks.";
  const haul = d.flags.roadWatch
    ? "The road mouth is a squad. Freight is stopped."
    : d.flags.bramRan
      ? "A hauler moved freight because the stair was signed."
      : d.flags.plateStair
        ? "The plate stair is signed. Haulage can leave."
        : "Haulage is waiting on the plate.";
  return [
    { id: "bureau", line: `${bureauLead} ${priced}` },
    { id: "unbound", line: haul },
    { id: "engineers", line: cityLaborLine(d) },
    {
      id: "relsec",
      line:
        d.flags.varrFate === "dead"
          ? "RelSec has a closed file with Varr's name."
          : d.flags.varrFate === "stood"
            ? "RelSec heard Varr's grammar and did not like it."
            : "RelSec has not been given this ledger.",
    },
    {
      id: "ash",
      line: d.flags.ashCounsel
        ? "Sera's warning is still in the margin."
        : "The Ash have not been spoken to.",
    },
  ];
}
const PRACTICE_VERBS = [
  "audit",
  "cut",
  "mend",
  "repair",
  "brace",
  "redirect",
  "negotiate",
  "threaten",
  "rescue",
];
function practiceBand(n) {
  if (n <= 0) return "\u2014";
  if (n === 1) return "Basic";
  if (n < 4) return "Emerging";
  if (n < 8) return "Practiced";
  return "Deep";
}
function districtYield(d) {
  if (d.mapId === "kiln") {
    if (d.flags.kilnRefused) return "Kiln yield: a refused bed. No brick, no levy, and walls that do not hold.";
    if (d.flags.brickLive && d.flags.kilnLevy && d.flags.kilnShop)
      return "Kiln yield: brick, a legal board, and a levy on the same set.";
    if (d.flags.brickLive && d.flags.stampCut) return "Kiln yield: brick without a stamp. The board can buy. The bill cannot.";
    if (d.flags.brickLive) return "Kiln yield: brick the board is not allowed to sell. The stamp is still a parent.";
    if (d.flags.fieldDry) return "Kiln yield: a field-dry waiting on clay and a bed. The gallery was not required.";
    return "Kiln yield: clay, and nothing set. Water, heat, and a stamp are somewhere else.";
  }
  if (d.mapId === "switch") {
    if (d.flags.switchJam && !d.flags.switchShunt) return "Switch yield: a jammed table. The pit can look busy. The citadel is not receiving this parent.";
    if (d.flags.switchShunt && d.flags.switchGreased) return "Switch yield: an off-book haul, and a shed that is actually a floor.";
    if (d.flags.switchShunt) return "Switch yield: weight leaving off the books. The plates are still their own problem.";
    if (d.flags.switchToll && d.flags.switchShop) return "Switch yield: a haul on the books, a bill on that haul, and a shed allowed to sell.";
    if (d.flags.switchToll) return "Switch yield: a haul the stamp can see. The bill rode the same table.";
    if (d.flags.switchGreased) return "Switch yield: grease. The shed is a floor. The haul has not been answered.";
    return "Switch yield: a table that still passes, and plates that still bill a step.";
  }
  if (d.mapId === "pane") {
    if (d.flags.paneRefused) return "Pane yield: a refused bed. No melt, no levy, and glass that does not hold.";
    if (d.flags.paneCharge && d.flags.paneLevy && d.flags.paneShop)
      return "Pane yield: a clear melt, a legal bench, and a levy on the same heat.";
    if (d.flags.paneCharge && d.flags.paneCut) return "Pane yield: glass without a stamp. The bench can buy. The bill cannot.";
    if (d.flags.paneCharge && d.flags.paneCullet) return "Pane yield: cullet standing in for the pit. The stamp is still its own parent.";
    if (d.flags.paneCharge) return "Pane yield: a melt the bench is not allowed to sell. The stamp is still a parent.";
    if (d.flags.paneSpilled) return "Pane yield: a spilled pit. Cullet or a seated sand can still be a parent. Heat is the other.";
    return "Pane yield: sand, and nothing melted. Heat and a stamp are somewhere else.";
  }
  const fate = d.flags.pumpFate;
  if (fate === "mend")
    return "Sinks yield: water, food, labor. A seated valve lets the district make more than scrap.";
  if (fate === "bleed")
    return "Sinks yield: brown water, chemicals, resentment. Finished goods stay scarce.";
  if (fate === "flood")
    return "Sinks yield: salvage from the cellars. Food and labor have stopped.";
  if (fate === "lockout")
    return "Sinks yield: unauthorized water. The Bureau still prices the district as dry.";
  return "Sinks yield: dust, a little scrap, favors nobody can cash. The pump is the parent of the rest.";
}
function actorNamed(d, id) {
  if (id === "player") return d.name;
  return d.actors[id]?.name ?? "someone";
}
function decideOpening(d, a) {
  const prey = pickPrey(d, a);
  const weapon = weaponOf(a);
  const range = weapon.range ?? 1;
  const legs = gait(a);
  const weaponDown = a.nodes.some(
    (n) => n.effect === "weapon" && !nodeLive(a.nodes, n),
  );
  const inRange = dist(a, prey) <= range;
  const seam2 = d.player.nodes.find(
    (n) => n.effect === "weapon" && nodeLive(d.player.nodes, n),
  );
  if (a.tier >= 2 && dist(a, d.player) <= 1 && seam2) {
    return {
      kind: "cut",
      target: "player",
      weaponId: weapon.id,
      nodeName: seam2.name,
      thenStrike: false,
    };
  }
  const broken = repairCandidate(a);
  if (
    (legs === "dead" || weaponDown || !inRange) &&
    broken &&
    (a.skills.mechanics ?? 0) >= 28 &&
    !broken.decoy
  ) {
    return {
      kind: "repair",
      target: a.id,
      weaponId: weapon.id,
      nodeName: broken.name,
      thenStrike: false,
    };
  }
  if (inRange) {
    return {
      kind: "strike",
      target: prey.id,
      weaponId: weapon.id,
      nodeName: "",
      thenStrike: false,
    };
  }
  if (legs === "dead") {
    return {
      kind: "brace",
      target: a.id,
      weaponId: weapon.id,
      nodeName: "",
      thenStrike: false,
    };
  }
  const step = [
    { x: a.x + 1, y: a.y },
    { x: a.x - 1, y: a.y },
    { x: a.x, y: a.y + 1 },
    { x: a.x, y: a.y - 1 },
  ].some((p) => walkable(d, p.x, p.y, a.id) && dist(p, prey) <= range);
  return {
    kind: "close",
    target: prey.id,
    weaponId: weapon.id,
    nodeName: "",
    thenStrike: step,
  };
}
function freezeIntents(d) {
  if (!d.combat) return;
  const plans = {};
  for (const id of d.combat.order) {
    const a = d.actors[id];
    if (!a?.alive || !a.hostile) continue;
    plans[id] = decideOpening(d, a);
  }
  d.combat.plans = plans;
}
function supportName(d, a, plan) {
  if (plan.weaponId === "fist") return null;
  if (plan.kind !== "strike" && !(plan.kind === "close" && plan.thenStrike))
    return null;
  const weapon =
    a.nodes.find((n) => n.effect === "weapon" && !n.decoy) ??
    a.nodes.find((n) => n.effect === "weapon");
  if (!weapon) return null;
  const chain = [];
  const walk = (n, seen) => {
    if (seen.has(n.id)) return;
    seen.add(n.id);
    for (const id of n.dependsOn) {
      const parent = a.nodes.find((x) => x.id === id);
      if (!parent) continue;
      chain.push(parent);
      walk(parent, seen);
    }
  };
  walk(weapon, new Set());
  const eye = (d.traces?.intent ?? 0) >= 2 || (d.verbs?.audit ?? 0) >= 4;
  const known = chain.filter((n) => {
    if (!n.revealed) return false;
    const confidence = confidenceOf(n);
    if (confidence === "understood" || confidence === "confident") return true;
    return eye && confidence === "observed";
  });
  if (!known.length) return null;
  known.sort((x, y) => depthOf(a.nodes, x.id) - depthOf(a.nodes, y.id));
  return known[0].name;
}
function openingLine(d, a, plan) {
  const who = plan.target === "player" ? "you" : actorNamed(d, plan.target);
  const hold = supportName(d, a, plan);
  const needs = hold ? ` \xB7 needs ${hold}` : "";
  if (plan.kind === "strike") {
    const hands =
      plan.weaponId === "fist"
        ? "Bare hands"
        : (ITEMS[plan.weaponId]?.name ?? "Weapon");
    return `${hands} \u2192 ${who}${needs}`;
  }
  if (plan.kind === "close") {
    const hands =
      plan.weaponId === "fist"
        ? "bare hands"
        : (ITEMS[plan.weaponId]?.name ?? "a weapon");
    const base = plan.thenStrike
      ? `Movement \u2192 ${who}, then ${hands}`
      : `Movement \u2192 ${who}`;
    return `${base}${needs}`;
  }
  if (plan.kind === "repair") return `Repair \u2192 ${plan.nodeName}`;
  if (plan.kind === "brace") return "Brace in place";
  return `Cut \u2192 ${plan.nodeName}`;
}
function planFits(d, a, plan) {
  if (!a.alive) return false;
  if (plan.kind === "cut") {
    const seam2 = d.player.nodes.find((n) => n.name === plan.nodeName);
    return Boolean(
      seam2 && nodeLive(d.player.nodes, seam2) && dist(a, d.player) <= 1,
    );
  }
  if (plan.kind === "repair") {
    const n = repairCandidate(a);
    return Boolean(n && n.name === plan.nodeName && !n.decoy);
  }
  if (plan.kind === "brace") return gait(a) === "dead";
  const prey = plan.target === "player" ? d.player : d.actors[plan.target];
  if (!prey?.alive) return false;
  if (plan.kind === "strike") {
    return (
      weaponOf(a).id === plan.weaponId &&
      dist(a, prey) <= (weaponOf(a).range ?? 1)
    );
  }
  return gait(a) !== "dead";
}
function boardIntents(d) {
  if (!d.combat?.plans) return [];
  const rows = [];
  for (const id of d.combat.order) {
    const plan = d.combat.plans[id];
    const a = d.actors[id];
    if (!plan || !a?.alive || !a.hostile) continue;
    rows.push({
      id,
      name: a.name,
      line: openingLine(d, a, plan),
      live: planFits(d, a, plan),
    });
  }
  return rows;
}
function followPlan(d, a, plan) {
  if (!planFits(d, a, plan)) {
    addLog(
      d,
      `${a.name} loses the action they had committed to. The board is a different shape.`,
    );
    return;
  }
  if (plan.kind === "cut") {
    const seam2 = d.player.nodes.find(
      (n) => n.name === plan.nodeName && nodeLive(d.player.nodes, n),
    );
    if (!seam2 || a.ap < 4) return;
    a.ap -= 4;
    sever(d, d.player.nodes, seam2, a.name);
    return;
  }
  if (plan.kind === "repair") {
    tryRepair(d, a);
    return;
  }
  if (plan.kind === "brace") {
    a.guarding = true;
    a.ap = 0;
    addLog(d, `${a.name} braces, as they meant to.`);
    return;
  }
  const prey = plan.target === "player" ? d.player : d.actors[plan.target];
  if (!prey) return;
  if (plan.kind === "strike") {
    strike(d, a, prey);
    return;
  }
  stepToward(d, a, prey);
  if (
    plan.thenStrike &&
    d.combat &&
    d.phase === "play" &&
    a.alive &&
    dist(a, prey) <= (weaponOf(a).range ?? 1) &&
    a.ap >= 3
  ) {
    strike(d, a, prey);
  }
}
function weaponsDark(d) {
  if (!d.combat) return false;
  const hostiles = d.combat.order
    .map((id) => d.actors[id])
    .filter((a) => a?.alive && a.hostile);
  if (!hostiles.length) return false;
  return hostiles.every(
    (a) => !a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n)),
  );
}
function standDown(d) {
  if (!d.combat || currentId(d) !== "player") return;
  if (!weaponsDark(d)) {
    addLog(d, "Someone still has a live weapon. A sentence will not cover it.");
    return;
  }
  if (d.player.ap < 2) {
    addLog(d, "Not enough action to make them hear you.");
    return;
  }
  d.player.ap -= 2;
  noteVerb(d, "negotiate");
  let chance = checkChance(d.player.skills.speech, 46);
  if (habit(d, "cut")) chance += 8;
  if (habit(d, "negotiate")) chance += 6;
  if (habit(d, "threaten", 2)) chance += 6;
  chance = clamp(chance, 12, 94);
  const rolled = rollD100();
  if (rolled > chance) {
    addLog(
      d,
      `They keep their weight forward anyway. (${rolled} vs ${chance})`,
    );
    return;
  }
  for (const id of d.combat.order) {
    const a = d.actors[id];
    if (a?.hostile) {
      a.hostile = false;
      a.aggro = false;
    }
  }
  d.reputation.bureau = clamp(d.reputation.bureau - 4, -100, 100);
  grantXp(d, 28);
  endCombat(
    d,
    "The weapons were already a rumor. They step out of the engagement. You did not have to empty the room.",
  );
}
function enemyAct(d, a) {
  if (a.id === "rel1") {
    const kael = d.actors.kael;
    const kaelHolding = Boolean(
      kael?.alive &&
      kael.hostile &&
      d.flags.kaelFate !== "dead" &&
      d.flags.kaelFate !== "spared",
    );
    if (!kaelHolding) {
      a.hostile = false;
      a.aggro = false;
      addLog(
        d,
        "Pye steps out. The order was Kael's, and Kael is not holding it.",
      );
      return;
    }
  }
  const hymn = a.nodes.find((n) => n.id === "hymn");
  if (hymn && nodeLive(a.nodes, hymn) && a.ap >= 3) {
    const ally = Object.values(d.actors).find(
      (o) =>
        o.id !== a.id &&
        o.alive &&
        o.hostile &&
        o.mapId === a.mapId &&
        o.hp < o.maxHp &&
        dist(a, o) <= 2,
    );
    if (ally) {
      a.ap -= 3;
      healActor(d, ally.id, 8);
      addLog(
        d,
        `${a.name} spends the hymn on ${ally.name}. The seam is support, not a speech.`,
      );
      return;
    }
  }
  const governor = a.nodes.find((n) => n.id === "governor");
  if (governor && !nodeLive(a.nodes, governor)) {
    a.guarding = true;
    a.ap = 0;
    addLog(d, `${a.name} has no governor. The weapon does not choose a body.`);
    return;
  }
  const plan = d.combat?.plans?.[a.id];
  if (plan && d.combat?.plans) {
    delete d.combat.plans[a.id];
    followPlan(d, a, plan);
    if (!d.combat || d.phase !== "play" || !a.alive || a.ap <= 0) return;
  }
  let guard = 0;
  let saidWeapon = false;
  while (a.alive && a.ap > 0 && d.combat && guard++ < 8 && d.phase === "play") {
    const target = pickPrey(d, a);
    const weapon = weaponOf(a);
    const legs = gait(a);
    const weaponDown = a.nodes.some(
      (n) => n.effect === "weapon" && !nodeLive(a.nodes, n),
    );
    const armorDown = a.nodes.some(
      (n) => n.effect === "armor" && !nodeLive(a.nodes, n),
    );
    if (weaponDown && !saidWeapon) {
      saidWeapon = true;
      addLog(d, `${a.name} cannot bring the mounted weapon to bear.`);
    }
    const range = weapon.range ?? 1;
    if (dist(a, target) <= range && a.ap >= 3) {
      strike(d, a, target);
      if (d.phase !== "play" || !d.combat) return;
      continue;
    }
    if (legs === "dead") {
      if (tryRepair(d, a)) continue;
      a.guarding = true;
      a.ap = 0;
      const orders = a.nodes.find((n) => n.id === "orders");
      addLog(
        d,
        orders && !nodeLive(a.nodes, orders)
          ? `${a.name} has no order left. The advance does not happen.`
          : `${a.name} braces in place. The legs refuse the step.`,
      );
      return;
    }
    if (a.template === "warden") {
      const plate = a.nodes.find((n) => n.id === "plate");
      if (
        plate &&
        nodeLive(a.nodes, plate) &&
        dist(a, target) <= 1 &&
        !a.guarding &&
        a.ap >= 1
      ) {
        a.ap -= 1;
        a.guarding = true;
        addLog(
          d,
          `${a.name} sets the plate between the blow and the order behind it.`,
        );
      }
    }
    if (armorDown && dist(a, target) > range && tryRepair(d, a)) continue;
    if (stepToward(d, a, target)) continue;
    if (tryRepair(d, a)) continue;
    if (armorDown && a.ap >= 1) {
      a.guarding = true;
      a.ap = 0;
      addLog(d, `${a.name} covers the opened plate.`);
      return;
    }
    return;
  }
}
function rootCause(nodes, n, seen = new Set()) {
  if (seen.has(n.id)) return n;
  seen.add(n.id);
  for (const id of n.dependsOn) {
    const parent = nodes.find((p) => p.id === id);
    if (parent && !nodeLive(nodes, parent))
      return rootCause(nodes, parent, seen);
  }
  return n;
}
function repairCandidate(a) {
  const broken = (effect) =>
    a.nodes.find((n) => n.effect === effect && !nodeLive(a.nodes, n));
  const child =
    (gait(a) === "dead" ? broken("motive") : null) ??
    broken("weapon") ??
    broken("armor") ??
    a.nodes.find((n) => n.severed) ??
    null;
  if (!child) return null;
  return rootCause(a.nodes, child);
}
function tryRepair(d, a) {
  if ((a.skills.mechanics ?? 0) < 28 || a.ap < 4) return false;
  const n = repairCandidate(a);
  if (!n || n.decoy) return false;
  a.ap -= 4;
  addLog(d, `${a.name} is attempting repair.`);
  const chance = clamp(18 + a.skills.mechanics - n.density * 5, 8, 72);
  const rolled = rollD100();
  if (rolled > chance) {
    addLog(d, `${n.name} will not seat.`);
    return true;
  }
  const before = liveMap(a.nodes);
  n.severed = false;
  n.integrity = Math.max(n.integrity, 78);
  n.decoy = false;
  addLog(d, `${a.name} reseats ${n.name}.`);
  publish(d, a.nodes, before);
  noteGraphChange(d, a.nodes, n, "repair", a.name);
  play("mend");
  return true;
}
function pickPrey(d, a) {
  const mate = Object.values(d.actors).find(
    (x) => x.companion && x.alive && x.mapId === a.mapId,
  );
  if (mate && dist(a, mate) + 0.15 < dist(a, d.player)) return mate;
  return d.player;
}
function pickFoe(d, from) {
  let best = null;
  let bestD = 99;
  for (const o of Object.values(d.actors)) {
    if (!o.alive || !o.hostile || o.mapId !== from.mapId) continue;
    const dd = dist(from, o);
    if (dd < bestD) {
      best = o;
      bestD = dd;
    }
  }
  return best;
}
function nearestMate(d, from) {
  return (
    Object.values(d.actors).find(
      (a) => a.companion && a.alive && a.mapId === from.mapId,
    ) ?? null
  );
}
function companionAct(d, a) {
  const foe = pickFoe(d, a);
  if (!foe) return;
  if (a.template === "cinder") {
    const hidden = foe.nodes.find(
      (n) =>
        !n.revealed &&
        (n.effect === "flow" || n.effect === "motive") &&
        n.tier !== "obfuscated",
    );
    if (hidden && a.ap >= 1) {
      a.ap -= 1;
      hidden.revealed = true;
      if (!hidden.confidence) hidden.confidence = "observed";
      addLog(
        d,
        `The moth lands on ${hidden.name}. You had not admitted that parent yet.`,
      );
      play("moth");
      return;
    }
  }
  if (a.id === "sera") {
    const dark = foe.nodes.some(
      (n) => n.effect === "weapon" && n.revealed && !nodeLive(foe.nodes, n),
    );
    if (dark) {
      addLog(d, "Sera will not hit a weapon that is already dark.");
      if (dist(a, d.player) > 1) stepToward(d, a, d.player);
      return;
    }
  }
  if (
    a.id === "mara" &&
    d.flags.maraFate === "restored" &&
    d.player.hp < d.player.maxHp * 0.7 &&
    dist(a, d.player) <= 1 &&
    a.ap >= 3
  ) {
    a.ap -= 3;
    healActor(d, "player", 10);
    addLog(
      d,
      "Mara steadies your pulse. The kindness is a little frightening.",
    );
    return;
  }
  const wantsBrace = a.habit === "brace" || a.kit?.accessory === "strap";
  if (
    wantsBrace &&
    d.player.hp < d.player.maxHp * 0.6 &&
    dist(a, d.player) <= 1 &&
    !d.player.guarding &&
    a.ap >= 1
  ) {
    a.ap -= 1;
    d.player.guarding = true;
    addLog(
      d,
      `${a.name} sets a shoulder against yours. The next blow has to go through both of you.`,
    );
    return;
  }
  if (
    a.habit === "cover" &&
    dist(foe, d.player) < dist(a, d.player) &&
    dist(a, d.player) > 1
  ) {
    stepToward(d, a, d.player);
  }
  if ((a.habit === "read" || a.kit?.accessory === "glass") && a.ap >= 1) {
    const hidden = foe.nodes.find(
      (n) => !n.revealed && n.tier !== "obfuscated" && !n.decoy,
    );
    if (hidden) {
      a.ap -= 1;
      hidden.revealed = true;
      if (!hidden.confidence) hidden.confidence = "observed";
      addLog(d, `${a.name} names ${hidden.name}. It was already in the graph.`);
    }
  }
  const pinGear = Boolean(weaponOf(a).pin);
  if (
    (a.habit === "pin" || pinGear) &&
    a.ap >= 2 &&
    dist(a, foe) <= (weaponOf(a).range ?? 1)
  ) {
    const held = pinOnHit(foe.nodes);
    if (held) {
      a.ap -= 2;
      addLog(d, `${a.name} pins ${held.name}.`);
      return;
    }
  }
  const prey = a.habit === "press" ? (pickPressed(d, a) ?? foe) : foe;
  let guard = 0;
  while (a.alive && a.ap >= 1 && guard++ < 8 && prey.alive) {
    const weapon = weaponOf(a);
    if (dist(a, prey) <= (weapon.range ?? 1) && a.ap >= 3) {
      strike(d, a, prey);
      return;
    }
    if (!stepToward(d, a, prey)) return;
  }
}
function pickPressed(d, from) {
  let best = null;
  let hp = 1e9;
  for (const o of Object.values(d.actors)) {
    if (!o.alive || !o.hostile || o.mapId !== from.mapId) continue;
    if (o.hp < hp) {
      best = o;
      hp = o.hp;
    }
  }
  return best;
}
function auditTargetNodes(d, target) {
  if (!target) return [];
  if (target.kind === "actor") return actorById(d, target.id)?.nodes ?? [];
  return d.machines[target.id]?.nodes ?? [];
}
function taughtPatterns(d) {
  const taught = new Set();
  const take = (nodes) => {
    for (const n of nodes) {
      if (!n.pattern || !n.revealed) continue;
      const c = n.confidence ?? "observed";
      if (c === "understood" || c === "confident") taught.add(n.pattern);
    }
  };
  take(d.player.nodes);
  for (const a of Object.values(d.actors)) take(a.nodes);
  for (const m of Object.values(d.machines)) take(m.nodes);
  return taught;
}
function liftKnown(d, n, before, taught, ownerId) {
  if (before === "understood" || before === "confident") return;
  const feed = Boolean(n.pattern && taught.has(n.pattern));
  const veto = n.id === "lockout" && taught.has("pressure-feed");
  if (!feed && !veto) return;
  n.revealed = true;
  if (confidenceOf(n) === "unknown" || confidenceOf(n) === "observed")
    n.confidence = "understood";
  const key = `saw:${feed ? n.pattern : "pressure-veto"}:${ownerId}:${n.id}`;
  if (d.flags[key]) return;
  d.flags[key] = true;
  addLog(
    d,
    feed
      ? n.pattern === "load-chain"
        ? `Same shape as a suspended load you already understood. ${n.name} fails the way the last one did.`
        : `Same shape as a pressure feed you already understood. ${n.name} fails the way the last one did.`
      : "The lockout is the veto these feeds hide. You have seen a pressure system keep one.",
  );
}
function openAudit(d, target) {
  if (!target) return;
  const actor = target.kind === "actor" ? actorById(d, target.id) : null;
  const nodes = auditTargetNodes(d, target);
  if (d.combat && currentId(d) === "player" && actor && actor.id !== "player") {
    if (!d.combat.audited.includes(actor.id)) {
      if (!habit(d, "audit")) {
        if (d.player.ap < 1) {
          noteOnce(d, "No action left. End the turn.");
          return;
        }
        d.player.ap -= 1;
      }
      d.combat.audited.push(actor.id);
    }
  }
  if (!(target.kind === "actor" && target.id === "player"))
    noteVerb(d, "audit");
  if (d.combat && actor?.hostile && actor.id !== "player")
    noteTrace(d, "intent");
  const taught = taughtPatterns(d);
  if (actor?.polymorphic) {
    const chance = checkChance(d.player.skills.audit, 62);
    const rolled = rollD100();
    const ok = rolled <= chance;
    if (ok) {
      for (const n of nodes) n.revealed = true;
      addLog(d, `The live seam shows itself. (${rolled} vs ${chance})`);
    } else {
      const decoy = nodes[Math.floor(Math.random() * nodes.length)];
      if (decoy) {
        decoy.revealed = true;
        decoy.decoy = false;
      }
      addLog(d, `The graph lies to you. (${rolled} vs ${chance})`);
    }
  } else if (target.kind === "machine") {
    if (d.perks?.includes("parent-ear") && !d.flags[`ear:${target.id}`]) {
      const hidden = nodes.filter((n) => !n.revealed && !n.decoy && n.tier !== "obfuscated");
      const parent = hidden.find((n) => nodes.some((child) => child.dependsOn.includes(n.id))) ?? hidden[0];
      if (parent) {
        parent.revealed = true;
        if (!parent.confidence) parent.confidence = "observed";
        d.flags[`ear:${target.id}`] = true;
        addLog(d, `You hear a parent before the surface admits it: ${parent.name}.`);
      }
    }
    if (hasItem(d, "anneallens") && !d.flags[`lens:${target.id}`]) {
      const hidden = nodes.filter((n) => !n.revealed && !n.decoy && n.tier !== "obfuscated");
      const named = hidden.find((n) => nodes.some((child) => child.dependsOn.includes(n.id))) ?? hidden[0];
      d.flags[`lens:${target.id}`] = true;
      if (named) {
        named.revealed = true;
        if (!named.confidence) named.confidence = "observed";
        addLog(d, `The anneal lens names a parent the surface had not: ${named.name}.`);
      }
    }
    for (const n of nodes) {
      const was = n.revealed;
      const before = confidenceOf(n);
      const familiar =
        (Boolean(n.pattern && taught.has(n.pattern)) ||
          (n.id === "lockout" && taught.has("pressure-feed"))) &&
        before !== "understood" &&
        before !== "confident";
      if (familiar) n.revealed = true;
      if (n.tier === "obfuscated") {
        const known =
          Boolean(d.flags.chalked) ||
          (n.id === "matrix" && d.flags.matrixKnown === true);
        if (known || rollD100() <= checkChance(d.player.skills.audit, 58))
          n.revealed = true;
      } else if (n.domain === "matter" || d.disciplines.includes(n.domain))
        n.revealed = true;
      if (n.id === "lockout" && d.flags.knowsLockout) n.revealed = true;
      deepen(d, n, !was && n.revealed);
      if (
        n.id === "lockout" &&
        d.flags.knowsLockout &&
        n.revealed &&
        confidenceOf(n) === "observed"
      )
        n.confidence = "understood";
      liftKnown(d, n, before, taught, target.id);
    }
    if (d.flags.chalked) {
      d.flags.chalked = false;
      addLog(
        d,
        "The chalk burns off. The illegible lines stay legible for this reading.",
      );
    }
  } else {
    const seen = d.verbs?.audit ?? 0;
    const ceiling = Math.max(
      4,
      comp(d) + 1 + (seen >= 4 ? 1 : 0) + (seen >= 8 ? 1 : 0),
    );
    for (const n of nodes) {
      const was = n.revealed;
      const before = confidenceOf(n);
      const familiar =
        Boolean(n.pattern && taught.has(n.pattern)) &&
        before !== "understood" &&
        before !== "confident";
      const knownMatrix = n.id === "matrix" && d.flags.matrixKnown === true;
      if (!n.revealed || familiar) {
        if (familiar) n.revealed = true;
        else if (n.tier === "obfuscated") {
          if (
            Boolean(d.flags.chalked) ||
            knownMatrix ||
            rollD100() <= checkChance(d.player.skills.audit, 48 + n.density * 3)
          )
            n.revealed = true;
        } else if (
          (n.domain === "matter" || d.disciplines.includes(n.domain)) &&
          (n.density <= ceiling || d.player.skills.audit >= 36 + n.density * 6)
        ) {
          n.revealed = true;
        }
      }
      deepen(d, n, !was && n.revealed);
      liftKnown(d, n, before, taught, target.id);
    }
    if (d.flags.chalked) {
      d.flags.chalked = false;
      addLog(
        d,
        "The chalk burns off. The illegible lines stay legible for this reading.",
      );
    }
  }
  d.audit = target;
  const revealed = nodes.filter((n) => n.revealed);
  const worst = [...revealed].sort((a, b) => {
    const score = (n) => (n.severed ? -1e3 : !nodeLive(nodes, n) ? -500 : n.integrity);
    return score(a) - score(b);
  })[0];
  d.uiNode = worst?.id ?? nodes[0]?.id ?? null;
  d.panel = "audit";
  rememberGraph(d, nodes);
  if (actor) noteHolding(d, actor);
  play("talk");
}
function noteHolding(d, a) {
  if (a.id === "player" || !a.hostile) return;
  const key = `brief:${a.id}`;
  if (d.flags[key]) return;
  const chain = (n) => {
    const parents = n.dependsOn
      .map((id) => a.nodes.find((p) => p.id === id))
      .filter((p) => Boolean(p?.revealed));
    return parents.length ? `${parents.map((p) => p.name).join(" + ")} → ${n.name}` : n.name;
  };
  const bits = [];
  const armor = a.nodes.find(
    (n) => n.revealed && !n.decoy && n.effect === "armor",
  );
  const weapon = a.nodes.find(
    (n) => n.revealed && !n.decoy && n.effect === "weapon",
  );
  const motive = a.nodes.find(
    (n) => n.revealed && !n.decoy && n.effect === "motive",
  );
  if (armor) bits.push(`armor ${chain(armor)}`);
  if (weapon) bits.push(`weapon ${chain(weapon)}`);
  if (motive) bits.push(`movement ${chain(motive)}`);
  if (!bits.length) return;
  d.flags[key] = true;
  addLog(d, `What is holding ${a.name}: ${bits.join("; ")}.`);
}
function domainOk(d, n) {
  if (n.domain === "matter") return true;
  return d.disciplines.includes(n.domain);
}
function mendNode(d, target, nodeId) {
  const nodes = auditTargetNodes(d, target);
  const n = nodes.find((x) => x.id === nodeId);
  if (!n || !target) return;
  if (!n.revealed) {
    addLog(d, "You cannot mend what you have not read.");
    return;
  }
  if (!domainOk(d, n)) {
    addLog(d, `You have no ${n.domain} baseline for this.`);
    return;
  }
  const inFight = Boolean(d.combat && currentId(d) === "player");
  if (inFight && d.player.ap < 3) {
    addLog(d, "Not enough action.");
    return;
  }
  const cost = Math.max(2, 4 + n.density - (d.perks?.includes("steady-mend") ? 2 : 0));
  const over = n.density > comp(d);
  if (d.focus < cost && !over) {
    addLog(d, "Focus is too thin.");
    return;
  }
  if (inFight) d.player.ap -= 3;
  const skill =
    n.domain === "biology"
      ? "medicine"
      : n.domain === "mind"
        ? "psychology"
        : "engineering";
  let chance = checkChance(d.player.skills[skill], 36 + n.density * 4);
  if (habit(d, "mend")) chance += 8;
  if (
    target.kind === "machine" &&
    target.id === "pump" &&
    n.id === "valve" &&
    hasItem(d, "valve")
  ) {
    chance = 92;
    takeItem(d, "valve", 1);
    addLog(d, "The true valve seats. Baseline snaps back.");
  } else if (n.baseline < 45 && !d.disciplines.includes("continuity")) {
    chance -= 25;
  }
  if (over) {
    chance -= 20;
    d.focus = 0;
    applyHp(d, "player", (n.density - comp(d)) * 5);
    d.player.stunned = true;
    addLog(d, "Density exceeds comprehension. The reading burns.");
    play("over");
    bump(8);
    if (d.phase !== "play") return;
  } else d.focus = Math.max(0, d.focus - cost);
  const rolled = rollD100();
  if (rolled > clamp(chance, 8, 95)) {
    n.integrity = Math.max(n.integrity, 20);
    addLog(d, `Misreconstruction. ${n.name} returns wrong. (${rolled})`);
    if (target.kind === "machine" && target.id === "pump") {
      d.flags.pumpFate = "flood";
      d.flags.actReady = true;
      journal(
        d,
        "pump",
        "The broken pump",
        "The mend took, and it took wrong. Cellars are filling. The district will remember the shape of your confidence.",
        "done",
      );
    }
    play("over");
    reconcileWorld(d);
    return;
  }
  const before = liveMap(nodes);
  n.severed = false;
  n.integrity = 100;
  n.decoy = false;
  addLog(d, `${n.name} is restored toward its baseline.`);
  if (d.combat?.tally) d.combat.tally.mends += 1;
  noteVerb(d, "mend");
  if ((d.verbs?.mend ?? 0) + (d.verbs?.repair ?? 0) >= 4) {
    let reached = false;
    for (const child of nodes) {
      if (
        !child.dependsOn.includes(n.id) ||
        child.severed ||
        child.integrity >= 100
      )
        continue;
      child.integrity = Math.min(100, child.integrity + 12);
      reached = true;
    }
    if (reached)
      addLog(
        d,
        "The mend reaches the next bond. It does not invent a severed one.",
      );
  }
  touchSeam(d, n);
  publish(d, nodes, before, n.id);
  noteGraphChange(d, nodes, n, "mend");
  play("mend");
  flash(d, nodes, "mend");
  if (n.effect === "life") {
    const who = target.kind === "actor" ? target.id : "player";
    healActor(d, who, 8 + Math.floor(d.player.skills.medicine / 8));
  }
  if (target.kind === "machine" && target.id === "pump" && n.id === "valve") {
    d.flags.pumpFate = "mend";
    d.flags.actReady = true;
    grantXp(d, 45);
    journal(
      d,
      "pump",
      "The broken pump",
      "You seated the valve. Clean water moves. The Bureau will call it theft of civic function.",
      "done",
    );
    addLog(d, "The district pump takes a true breath.");
  }
  if (
    target.kind === "machine" &&
    target.id === "cistern" &&
    (n.id === "market" || n.id === "clinic")
  ) {
    d.flags.wardSplit = "shared";
    addLog(
      d,
      "You reseat the split. Both legs can drink, if the Sinks are sending anything.",
    );
  }
  bump(3);
  reconcileWorld(d);
}
function unmendNode(d, target, nodeId) {
  const nodes = auditTargetNodes(d, target);
  const n = nodes.find((x) => x.id === nodeId);
  if (!n || !target) return;
  if (!n.revealed) {
    addLog(d, "You cannot cut a seam you haven't read.");
    return;
  }
  if (target.kind === "machine" && target.id === "cistern" && n.id === "main") {
    addLog(
      d,
      "The cistern main is a child of the Sinks. Change the pump, or change the split.",
    );
    return;
  }
  if (!domainOk(d, n)) {
    addLog(d, `That relationship is outside your disciplines.`);
    return;
  }
  if (n.severed) {
    addLog(d, "Already severed.");
    return;
  }
  const inFight = Boolean(d.combat && currentId(d) === "player");
  if (inFight && d.player.ap < 4) {
    addLog(d, "Not enough action.");
    return;
  }
  const conf = confidenceOf(n);
  const felt = conf === "confident" ? Math.max(1, n.density - 1) : n.density;
  const over = felt > comp(d);
  const cost = 6 + n.density;
  if (d.focus < Math.min(cost, focusMax(d)) && !over && d.focus < 4) {
    addLog(d, "Focus is too thin.");
    return;
  }
  if (inFight) d.player.ap -= 4;
  if (n.decoy) {
    d.focus = Math.max(0, d.focus - 4);
    addLog(d, "That seam was a costume. The backlash finds your teeth.");
    applyHp(d, "player", 8);
    play("over");
    return;
  }
  let chance = checkChance(d.player.skills.audit, 34 + n.density * 5);
  if (habit(d, "cut")) chance += 8;
  if (d.disciplines.includes("causal")) chance += 8;
  chance += confidenceBonus(n);
  if (
    target.kind === "machine" &&
    target.id === "pump" &&
    n.id === "lockout" &&
    d.flags.knowsLockout
  )
    chance += 10;
  if (over) {
    chance -= 18;
    d.focus = 0;
    applyHp(d, "player", (n.density - comp(d)) * 4);
    d.player.stunned = true;
    addLog(d, "You cut past your depth.");
    play("over");
    if (d.phase !== "play") return;
  } else d.focus = Math.max(0, d.focus - cost);
  const rolled = rollD100();
  const shown = clamp(chance, 10, 94);
  if (rolled > shown) {
    const note =
      conf === "observed"
        ? "You were still guessing. The bond holds."
        : conf === "confident"
          ? "You knew the seam. The angle still slipped."
          : "The bond holds.";
    addLog(d, `${note} (${rolled})`);
    if (conf !== "confident" && rolled > shown + 28) {
      d.player.stunned = true;
      addLog(d, "The failed cut rings back through the lens.");
    }
    return;
  }
  sever(d, nodes, n);
  if (d.combat?.tally) d.combat.tally.cuts += 1;
  noteVerb(d, "cut");
  touchSeam(d, n);
  if (d.phase !== "play") return;
  if (target.kind === "actor") {
    const a = actorById(d, target.id);
    if (a && n.effect === "life") applyHp(d, a.id, 14, false);
    if (a && n.effect === "core") applyHp(d, a.id, 22, false);
  }
  if (target.kind === "machine" && target.id === "pump" && n.id === "bypass") {
    d.flags.pumpFate = "bleed";
    d.flags.actReady = true;
    noteTrace(d, "flow");
    noteVerb(d, "redirect");
    grantXp(d, 35);
    journal(
      d,
      "pump",
      "The broken pump",
      "You opened the bypass. Brown water moves. Cellars will taste it. The district is not grateful and not dry.",
      "done",
    );
  }
  if (
    target.kind === "machine" &&
    target.id === "pump" &&
    n.id === "lockout" &&
    !d.flags.pumpFate
  ) {
    d.flags.pumpFate = "lockout";
    d.flags.actReady = true;
    d.reputation.bureau = clamp(d.reputation.bureau - 8, -100, 100);
    grantXp(d, 40);
    journal(
      d,
      "pump",
      "The broken pump",
      "You cut the Bureau lockout. Water moves because the veto is gone. They will call it sabotage. The valve is still unseated, but the district is no longer dry.",
      "done",
    );
    addLog(
      d,
      "The lockout lets go. The pump obeys a city that did not sign the order.",
    );
  }
  if (
    target.kind === "machine" &&
    target.id === "cistern" &&
    (n.id === "market" || n.id === "clinic")
  ) {
    d.flags.wardSplit = n.id === "market" ? "clinic" : "market";
    noteVerb(d, "redirect");
    addLog(
      d,
      n.id === "market"
        ? "The stall leg is cut. What still comes goes to the clinic."
        : "The clinic leg is cut. What still comes goes to the stall.",
    );
  }
  if (
    target.kind === "machine" &&
    target.id === "hearth" &&
    (n.id === "beds" || n.id === "hall")
  ) {
    d.flags.hearthSplit = n.id === "beds" ? "hall" : "beds";
    noteVerb(d, "redirect");
    addLog(
      d,
      n.id === "beds"
        ? "The sleeper flues are cut. What heat remains goes to the hall."
        : "The guild flue is cut. What heat remains goes to the sleepers.",
    );
  }
  if (target.kind === "machine" && target.id === "hearth" && n.id === "bed") {
    d.flags.hearthHeld = false;
    addLog(
      d,
      "The fire bed is cut. Banking will not invent it back from a severed seam.",
    );
  }
  if (target.kind === "machine" && target.id === "plots" && n.id === "inlet") {
    addLog(
      d,
      "The inlet is a child of the Sinks. Cutting it on the bed does not give the plots a well.",
    );
  }
  if (
    target.kind === "machine" &&
    target.id === "forge" &&
    (n.id === "ore" || n.id === "quench" || n.id === "fire")
  ) {
    addLog(
      d,
      "That seam is a parent from another district. The forge takes it back if the parent is still alive.",
    );
  }
  if (target.kind === "machine" && target.id === "lamps" && n.id === "feed") {
    addLog(
      d,
      "The lamp feed is a child of the orrery. Breaking the glass is the local cut. This one grows back.",
    );
  }
  if (target.kind === "machine" && target.id === "chute" && n.id === "lip") {
    addLog(
      d,
      "The lip is a child of the road. Spill the grade if you want the ore to miss the forge.",
    );
  }
  reconcileWorld(d);
}
function faceMachine(d, m, specialId) {
  const spec =
    specialId === "face-surge"
      ? { id: "surge", template: "surge", flag: "surgeFaced" }
      : specialId === "face-gear"
        ? { id: "gearhulk", template: "gearhulk", flag: "gearFaced" }
        : { id: "engineward", template: "engineward", flag: "engineFaced" };
  const owner =
    specialId === "face-surge"
      ? "pump"
      : specialId === "face-gear"
        ? "colossus"
        : "crucible";
  if (m.id !== owner) return;
  if (dist(d.player, m) > 2) {
    addLog(d, "You are not on the machine.");
    return;
  }
  if (d.flags[spec.flag]) {
    addLog(
      d,
      "That shape has already answered. The machine is still the machine.",
    );
    return;
  }
  if (d.combat) return;
  d.flags[spec.flag] = true;
  const base = spawnActor({
    id: spec.id,
    template: spec.template,
    map: d.mapId,
    x: m.x + 1,
    y: m.y,
  });
  base.hostile = true;
  base.aggro = true;
  d.actors[spec.id] = base;
  addLog(d, `${base.name} answers the machine. The graph is the fight.`);
  startCombat(d, [spec.id]);
}
function kilnPrice(d, n) {
  let value = n;
  if (d.perks?.includes("counter-price")) value -= 4;
  if ((d.player.skills.barter ?? 0) >= 55) value -= 2;
  return Math.max(1, value);
}
function payKiln(d, n) {
  const cost = kilnPrice(d, n);
  if (d.scrip < cost) {
    addLog(d, `That is ${cost} scrip. You don't have it.`);
    return false;
  }
  d.scrip -= cost;
  return true;
}
function yardWitness(d) {
  const eyes = Object.values(d.actors).filter(
    (a) => a.alive && !a.companion && a.mapId === d.mapId && a.faction === "bureau" && dist(d.player, a) <= 5,
  );
  if (!eyes.length) return null;
  const close = eyes.some((a) => dist(d.player, a) <= 1);
  const sneak = d.player.skills.sneak ?? 0;
  if (!close && (sneak >= 55 || d.perks?.includes("soft-step"))) return null;
  return eyes[0];
}
function runSwitchSpecial(d, m, specialId) {
  const ids = new Set(["turntable", "switchdesk", "switchbench", "waycrate"]);
  if (!ids.has(m.id)) return false;
  if (m.id === "switchbench" && specialId === "rest") return false;
  if (dist(d.player, m) > 1) {
    addLog(d, "You are not at the machine.");
    return true;
  }
  const table = d.machines.turntable;
  const claim = d.machines.switchdesk?.nodes.find((n) => n.id === "claim");
  if (m.id === "turntable" && specialId === "grease-axle") {
    if (d.flags.switchGreased) {
      addLog(d, "The axle is already greased. The plates will not become a different parent by being greased twice.");
      return true;
    }
    if (!hasItem(d, "scrap")) {
      addLog(d, "Grease wants scrap. Boots are a different parent, and they are not this one.");
      return true;
    }
    const sure = d.player.skills.engineering >= 70;
    const chance = checkChance(d.player.skills.engineering, 40);
    const rolled = sure ? chance : rollD100();
    if (!sure && rolled > chance) {
      addLog(d, `The render goes slick in the wrong direction. (${rolled} vs ${chance})`);
      return true;
    }
    takeItem(d, "scrap", 1);
    d.flags.switchGreased = true;
    noteVerb(d, "craft");
    addLog(d, sure ? "You know this render. The plates stop billing. Wick's shed has a parent." : `The grease holds. (${rolled} vs ${chance}) The shed can be a floor.`);
    play("mend");
    d.reputation.engineers = clamp(d.reputation.engineers + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "turntable" && specialId === "jam-table") {
    if (d.flags.switchJam && !d.flags.switchShunt) {
      addLog(d, "The table is already jammed.");
      return true;
    }
    d.flags.switchJam = true;
    noteVerb(d, "sabotage");
    addLog(d, "You jam the table. A busy pit can still send nothing. Rue has nothing to invoice unless a shunt is already carrying the weight off her books.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "turntable" && specialId === "seat-table") {
    if (d.flags.switchJam !== true) {
      addLog(d, "The table is already seated.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to seat the axle.");
      return true;
    }
    d.focus -= 3;
    d.flags.switchJam = false;
    noteVerb(d, "mend");
    addLog(d, "You seat the table. If the stamp is intact and the shunt is out, the books can see the haul again.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "turntable" && specialId === "shunt-haul") {
    if (d.flags.switchShunt) {
      addLog(d, "The shunt is already carrying weight off the books.");
      return true;
    }
    if (!hasItem(d, "scrap") && d.player.skills.engineering < 50) {
      addLog(d, "A shunt wants scrap, or an engineering hand that already knows the bypass.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to seat a shunt.");
      return true;
    }
    if (hasItem(d, "scrap") && d.player.skills.engineering < 50) takeItem(d, "scrap", 1);
    d.focus -= 3;
    d.flags.switchShunt = true;
    noteVerb(d, "redirect");
    addLog(d, "You shunt the haul. Weight can leave even if the table is jammed. Rue is not allowed to see it.");
    play("mend");
    d.reputation.unbound = clamp(d.reputation.unbound + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "turntable" && specialId === "pull-shunt") {
    if (!d.flags.switchShunt) {
      addLog(d, "There is no shunt to pull.");
      return true;
    }
    d.flags.switchShunt = false;
    noteVerb(d, "sabotage");
    addLog(d, "You pull the shunt. The table, jammed or seated, is the parent that remains.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "switchdesk" && specialId === "license-yard") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
      return true;
    }
    if (d.flags.switchLicensed) {
      addLog(d, "The shed is already licensed. The bill did not leave.");
      return true;
    }
    const believed = d.player.skills.speech >= 60;
    if (!believed && d.scrip < 10) {
      addLog(d, "Rue wants 10 scrip, or a voice the Bureau already believes.");
      return true;
    }
    if (!believed) d.scrip -= 10;
    d.flags.switchLicensed = true;
    noteVerb(d, believed ? "negotiate" : "barter");
    d.reputation.bureau = clamp(d.reputation.bureau + 3, -100, 100);
    addLog(d, believed ? "You speak the yard into a permit. The bill stays on any haul the books can see." : "You pay the stamp. The bill stays. The shed may sell if grease and the table agree.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "switchdesk" && specialId === "cut-yard") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is already a hole.");
      return true;
    }
    claim.severed = true;
    claim.integrity = 0;
    claim.revealed = true;
    noteVerb(d, "sabotage");
    d.reputation.bureau = clamp(d.reputation.bureau - 6, -100, 100);
    addLog(d, "You cut the yard stamp. The bill dies. The haul can still leave. Rue will not agree to be a hole.");
    play("unmend");
    const clerk = d.actors.rue;
    if (clerk?.alive) {
      clerk.hostile = true;
      clerk.aggro = true;
      clerk.vision = 5;
      if (dist(d.player, clerk) <= 6) startCombat(d, ["rue"]);
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "switchdesk" && specialId === "seat-claim") {
    if (!claim || !claim.severed) {
      addLog(d, "The stamp is already a stamp.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to write the claim back.");
      return true;
    }
    d.focus -= 3;
    claim.severed = false;
    claim.integrity = 100;
    claim.revealed = true;
    noteVerb(d, "mend");
    const clerk = d.actors.rue;
    if (clerk?.alive && !d.flags.switchCaught) {
      clerk.hostile = false;
      clerk.aggro = false;
      clerk.vision = 0;
    }
    addLog(d, d.flags.switchCaught ? "You seat the stamp. The till she watched you lift is still a seeing." : "You seat the stamp. The bill can ride a haul the books can see.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "switchdesk" && specialId === "lift-till") {
    if (d.flags.switchTill) {
      addLog(d, "The till is already empty.");
      return true;
    }
    d.flags.switchTill = true;
    d.scrip += 14;
    noteVerb(d, "sabotage");
    const seen = yardWitness(d);
    if (seen) {
      d.flags.switchCaught = true;
      d.flags.bountyScrip = Number(d.flags.bountyScrip ?? 0) + 14;
      d.reputation.bureau = clamp(d.reputation.bureau - 8, -100, 100);
      seen.hostile = true;
      seen.aggro = true;
      seen.vision = 5;
      addLog(d, `${seen.name} saw the hands. The scrip is yours. The seeing is not.`);
      play("unmend");
      if (dist(d.player, seen) <= 5) startCombat(d, [seen.id]);
    } else {
      addLog(d, "The till leaves quietly. Nobody in the room was close enough to file it.");
      play("ui");
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "switchbench" && specialId === "buy-bandage") {
    const cost = 8;
    if (d.scrip < cost) {
      addLog(d, `A bandage is ${cost} scrip.`);
      return true;
    }
    d.scrip -= cost;
    addItem(d, "bandage", 1);
    noteVerb(d, "barter");
    addLog(d, "You buy a bandage. Cloth. Not a civic good.");
    play("ui");
    return true;
  }
  if (m.id === "switchbench" && specialId === "buy-boots") {
    const cost = d.flags.switchShop ? 8 : 14;
    if (hasItem(d, "slickboot")) {
      addLog(d, "You already have a pair. They still will not grease the axle.");
      return true;
    }
    if (d.scrip < cost) {
      addLog(d, `Yard boots are ${cost} scrip${d.flags.switchShop ? ". The shed is allowed to sell." : ". The shed is not a shop yet, so the price is the quiet one."}`);
      return true;
    }
    d.scrip -= cost;
    addItem(d, "slickboot", 1);
    noteVerb(d, "barter");
    addLog(d, "You buy yard boots. Your step is covered. Wick's is not.");
    play("ui");
    return true;
  }
  if (m.id === "waycrate" && specialId === "read-bill") {
    const paper = m.nodes.find((n) => n.id === "paper");
    if (paper) {
      paper.revealed = true;
      paper.integrity = 100;
    }
    d.flags.waybillRead = true;
    if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
    noteVerb(d, "audit");
    addLog(d, "The waybill names Bram's held cart and this table as one refusal. Reading it did not move the cart.");
    play("ui");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "waycrate" && specialId === "lift-bill") {
    if (!d.flags.waybillRead) {
      addLog(d, "You have not named the paper. Lifting a thing you have not read is how a nest stands up.");
      return true;
    }
    if (d.flags.waybillSmashed) {
      addLog(d, "The crate is already wreckage.");
      return true;
    }
    d.flags.waybillLifted = true;
    if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
    noteVerb(d, "sneak");
    addLog(d, "You lift the paper. The rat stays nested. The sentence leaves with you.");
    play("ui");
    return true;
  }
  if (m.id === "waycrate" && specialId === "smash-bill") {
    if (d.flags.waybillSmashed) {
      addLog(d, "The crate is already smashed.");
      return true;
    }
    const nest = m.nodes.find((n) => n.id === "nest");
    const paper = m.nodes.find((n) => n.id === "paper");
    if (nest) {
      nest.severed = true;
      nest.integrity = 0;
    }
    if (paper) paper.revealed = true;
    d.flags.waybillRead = true;
    d.flags.waybillSmashed = true;
    if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
    noteVerb(d, "sabotage");
    addLog(d, "You smash the parent out of the nest. The rat has to stand up. The paper still names the cart.");
    play("unmend");
    const rat = d.actors.yardrat;
    if (rat?.alive) {
      rat.hostile = true;
      rat.aggro = true;
      rat.vision = 4;
      if (dist(d.player, rat) <= 6) startCombat(d, ["yardrat"]);
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  return false;
}
function runPaneSpecial(d, m, specialId) {
  const ids = new Set(["panefire", "panestamp", "panebench", "anneal"]);
  if (!ids.has(m.id)) return false;
  if (m.id === "panebench" && specialId === "rest") return false;
  if (dist(d.player, m) > 1) {
    addLog(d, "You are not at the machine.");
    return true;
  }
  const fire = d.machines.panefire;
  const sand = fire?.nodes.find((n) => n.id === "sand");
  const flue = fire?.nodes.find((n) => n.id === "flue");
  const bed = fire?.nodes.find((n) => n.id === "bed");
  const borrow = fire?.nodes.find((n) => n.id === "borrow");
  const claim = d.machines.panestamp?.nodes.find((n) => n.id === "claim");
  const kilnLive = () => {
    const kiln = d.machines.kilnfire;
    const local = kiln?.nodes.find((n) => n.id === "bed");
    const hearth = d.machines.hearth?.nodes.find((n) => n.id === "bed");
    const rust = Boolean(hearth && d.machines.hearth && nodeLive(d.machines.hearth.nodes, hearth));
    const localUp = Boolean(local && kiln && nodeLive(kiln.nodes, local) && d.flags.kilnRefused !== true);
    return localUp || (d.flags.kilnBorrowed === true && rust && d.flags.kilnRefused !== true) || Boolean(d.world?.live?.["kiln-bed"]);
  };
  if (m.id === "panefire" && specialId === "seat-flue") {
    if (!flue || !sand || !bed || !fire) return true;
    if (sand.severed || d.flags.paneSpilled || !nodeLive(fire.nodes, sand)) {
      addLog(d, "The sand is gone. A flue cannot parent itself. Seat the pit, or melt cullet and borrow a heat that does not drink this pit.");
      return true;
    }
    if (nodeLive(fire.nodes, flue) && d.flags.paneRefused !== true) {
      addLog(d, "The flue is already seated.");
      return true;
    }
    const cost = d.perks?.includes("steady-mend") ? 2 : 4;
    if (d.focus < cost) {
      addLog(d, "Focus is too thin to seat the flue.");
      return true;
    }
    d.focus -= cost;
    d.flags.paneRefused = false;
    flue.severed = false;
    flue.integrity = 100;
    flue.revealed = true;
    bed.severed = false;
    bed.integrity = 100;
    bed.revealed = true;
    noteVerb(d, "mend");
    addLog(d, "You seat the flue. The local bed has a parent. The melt still wants sand, or cullet if the pit is already gone.");
    play("mend");
    d.reputation.engineers = clamp(d.reputation.engineers + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "stop-flue") {
    if (!flue || !fire || !nodeLive(fire.nodes, flue)) {
      addLog(d, "The flue is already down.");
      return true;
    }
    flue.severed = true;
    flue.integrity = 0;
    flue.revealed = true;
    noteVerb(d, "sabotage");
    addLog(d, "You stop the flue. Borrowed kiln heat can still be a parent. This was not yet a refusal.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "borrow-heat") {
    if (!borrow) return true;
    if (!kilnLive()) {
      addLog(d, "No kiln bed is a parent right now. There is nothing to borrow.");
      return true;
    }
    if (d.flags.paneBorrowed && !borrow.severed) {
      addLog(d, "The house is already drinking a kiln.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to splice the heat.");
      return true;
    }
    d.focus -= 3;
    d.flags.paneBorrowed = true;
    d.flags.paneRefused = false;
    borrow.severed = false;
    borrow.integrity = 100;
    borrow.revealed = true;
    noteVerb(d, "redirect");
    addLog(d, "You splice the house onto a live kiln. The local flue can stay down. Sand, or cullet, still has to be a parent.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "cullet") {
    if (d.flags.paneCullet) {
      addLog(d, "The cullet is already in the melt. It will not become sand by being melted twice.");
      return true;
    }
    if (!hasItem(d, "scrap")) {
      addLog(d, "Cullet wants scrap. The pit is a different parent.");
      return true;
    }
    const sure = d.player.skills.engineering >= 70 || d.flags.solCullet === true;
    const chance = checkChance(d.player.skills.engineering, 42);
    const rolled = sure ? chance : rollD100();
    if (!sure && rolled > chance) {
      addLog(d, `The melt goes mean in the wrong direction. (${rolled} vs ${chance})`);
      return true;
    }
    takeItem(d, "scrap", 1);
    d.flags.paneCullet = true;
    noteVerb(d, "craft");
    addLog(d, sure ? "You know this melt. The pit does not have to be the parent." : `The cullet holds. (${rolled} vs ${chance}) The pit can stay spilled.`);
    play("mend");
    d.reputation.unbound = clamp(d.reputation.unbound + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "spill-sand") {
    if (!sand || sand.severed || d.flags.paneSpilled) {
      addLog(d, "The sand is already spilled.");
      return true;
    }
    sand.severed = true;
    sand.integrity = 0;
    d.flags.paneSpilled = true;
    noteVerb(d, "sabotage");
    addLog(d, "You spill the sand. Heat has nothing of the pit to melt until you seat it again, or melt cullet.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "seat-sand") {
    if (!sand || !fire) return true;
    if (!d.flags.paneSpilled && !sand.severed) {
      addLog(d, "The pit is already seated.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to seat the pit.");
      return true;
    }
    d.focus -= 3;
    d.flags.paneSpilled = false;
    sand.severed = false;
    sand.integrity = 100;
    sand.revealed = true;
    noteVerb(d, "mend");
    addLog(d, "You seat the pit. Sand is a parent again. The flue still has to be seated if you want this heat.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panefire" && specialId === "refuse-house") {
    if (d.flags.paneRefused) {
      addLog(d, "The house is already refused.");
      return true;
    }
    d.flags.paneRefused = true;
    d.flags.paneBorrowed = false;
    if (bed) {
      bed.severed = true;
      bed.integrity = 0;
      bed.revealed = true;
    }
    if (borrow) {
      borrow.severed = true;
      borrow.integrity = 0;
    }
    noteVerb(d, "sabotage");
    addLog(d, "You leave the beds down. The levy will have nothing to invoice. The glass will have nothing to hold.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panestamp" && specialId === "license-pane") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
      return true;
    }
    if (d.flags.paneLicensed) {
      addLog(d, "The bench is already licensed. The bill did not leave.");
      return true;
    }
    const believed = d.player.skills.speech >= 60;
    if (!believed && !payKiln(d, 10)) return true;
    d.flags.paneLicensed = true;
    noteVerb(d, "barter");
    addLog(d, believed ? "She already believes the voice. The levy stays. The bench may sell." : "You pay the stamp. The levy stays. The bench may sell.");
    play("ui");
    d.reputation.bureau = clamp(d.reputation.bureau + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panestamp" && specialId === "cut-pane") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is already a hole.");
      return true;
    }
    claim.severed = true;
    claim.integrity = 0;
    claim.revealed = true;
    noteVerb(d, "sabotage");
    d.reputation.bureau = clamp(d.reputation.bureau - 6, -100, 100);
    const clerk = d.actors.ness;
    if (clerk?.alive) {
      clerk.hostile = true;
      clerk.aggro = true;
      clerk.vision = 5;
      if (dist(d.player, clerk) <= 6) startCombat(d, ["ness"]);
    }
    addLog(d, "You cut the stamp. The levy dies with it. Ness answers the hole.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panestamp" && specialId === "seat-claim") {
    if (!claim || !claim.severed) {
      addLog(d, "The stamp is already a stamp.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to write the claim back.");
      return true;
    }
    d.focus -= 3;
    claim.severed = false;
    claim.integrity = 100;
    claim.revealed = true;
    noteVerb(d, "mend");
    const clerk = d.actors.ness;
    if (clerk?.alive && !d.flags.paneCaught) {
      clerk.hostile = false;
      clerk.aggro = false;
      clerk.vision = 0;
    }
    addLog(d, d.flags.paneCaught ? "You seat the stamp. The till she watched you lift is still a seeing." : "You seat the stamp. The bill can ride a melt that is real.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panestamp" && specialId === "lift-till") {
    if (d.flags.paneTill) {
      addLog(d, "The till is already empty.");
      return true;
    }
    d.flags.paneTill = true;
    d.scrip += 12;
    noteVerb(d, "sabotage");
    const seen = yardWitness(d);
    if (seen) {
      d.flags.paneCaught = true;
      d.flags.bountyScrip = Number(d.flags.bountyScrip ?? 0) + 12;
      d.reputation.bureau = clamp(d.reputation.bureau - 8, -100, 100);
      seen.hostile = true;
      seen.aggro = true;
      seen.vision = 5;
      addLog(d, `${seen.name} saw the hands. The scrip is yours. The seeing is not.`);
      play("unmend");
      if (dist(d.player, seen) <= 5) startCombat(d, [seen.id]);
    } else {
      addLog(d, "The till leaves quietly. Nobody in the room was close enough to file it.");
      play("ui");
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "panebench" && specialId === "draw-pane") {
    if (!d.flags.paneCharge) {
      addLog(d, "There is no clear melt to draw. A bench does not invent a parent.");
      return true;
    }
    const held = d.inventory.find((i) => i.id === "clearpane")?.qty ?? 0;
    if (held >= 3) {
      addLog(d, "Three panes is a stack. The house is not a crate.");
      return true;
    }
    addItem(d, "clearpane", 1);
    noteVerb(d, "craft");
    addLog(d, "You draw a clear pane. It can be sold, or sat into a lamp that lost its glass. It is not the light.");
    play("mend");
    return true;
  }
  if (m.id === "panebench" && specialId === "sell-pane") {
    if (!hasItem(d, "clearpane")) {
      addLog(d, "You have no clear pane to sell.");
      return true;
    }
    takeItem(d, "clearpane", 1);
    const legal = Boolean(d.flags.paneShop);
    const gain = legal ? kilnPrice(d, 12) + 4 : kilnPrice(d, 4);
    d.scrip += gain;
    noteVerb(d, "barter");
    if (!legal && d.flags.paneLevy) {
      d.reputation.bureau = clamp(d.reputation.bureau - 2, -100, 100);
      addLog(d, `The bench pays ${gain} under the board. Ness will hear. The levy was the legal parent.`);
    } else addLog(d, legal ? `The bench pays ${gain}. It was allowed to.` : `The bench pays ${gain}. There is no levy to offend, and no permit to do it properly.`);
    return true;
  }
  if (m.id === "panebench" && specialId === "buy-lens") {
    if (!d.flags.paneShop) {
      addLog(d, "The lens is a finished good. The bench is not allowed to sell it. The vault is a different parent.");
      return true;
    }
    if (hasItem(d, "anneallens")) {
      addLog(d, "You already carry a lens. A second one does not name a second parent.");
      return true;
    }
    if (!payKiln(d, 14)) return true;
    addItem(d, "anneallens", 1);
    d.flags.lensBought = true;
    noteVerb(d, "barter");
    addLog(d, "You buy the anneal lens. The first audit of a machine will name a quiet parent. It does not replace that parent.");
    play("ui");
    return true;
  }
  if (m.id === "panebench" && specialId === "buy-mitts") {
    if (!d.flags.paneShop) {
      addLog(d, "The mitts are a finished good. The bench is not allowed to sell them.");
      return true;
    }
    if (hasItem(d, "panemitt")) {
      addLog(d, "You already have mitts. They still will not seat the flue.");
      return true;
    }
    if (!payKiln(d, 12)) return true;
    addItem(d, "panemitt", 1);
    noteVerb(d, "barter");
    addLog(d, "You buy furnace mitts. Your step on the hot floor is covered. The flue is not.");
    play("ui");
    return true;
  }
  if (m.id === "anneal" && specialId === "read-anneal") {
    const lens = m.nodes.find((n) => n.id === "lens");
    if (!lens) return true;
    if (lens.revealed || d.flags.annealRead) {
      addLog(d, "The lens is already named. It can be lifted. Smashing it is a different verb.");
      return true;
    }
    const chance = checkChance(d.player.skills.audit, 44);
    const rolled = rollD100();
    if (rolled > chance && !d.perks?.includes("parent-ear") && !hasItem(d, "anneallens")) {
      addLog(d, `The anneal shows you the nest and calls it the whole story. (${rolled} vs ${chance})`);
      return true;
    }
    lens.revealed = true;
    if (!lens.confidence) lens.confidence = "observed";
    d.flags.annealRead = true;
    noteVerb(d, "audit");
    addLog(d, "The nested lens is the parent the moth is using. The dead face was a costume.");
    d.audit = { kind: "machine", id: m.id };
    d.panel = "audit";
    return true;
  }
  if (m.id === "anneal" && specialId === "lift-anneal") {
    const lens = m.nodes.find((n) => n.id === "lens");
    if (d.flags.annealLifted || d.flags.annealSmashed) {
      addLog(d, "The lens is already gone.");
      return true;
    }
    if (!lens?.revealed && !d.flags.annealRead) {
      addLog(d, "You can see a dead face. You have not read the parent. Lifting blind would be a smash.");
      return true;
    }
    if (lens) {
      lens.severed = true;
      lens.integrity = 0;
    }
    d.flags.annealLifted = true;
    d.flags.annealRead = true;
    if (!hasItem(d, "anneallens")) addItem(d, "anneallens", 1);
    noteVerb(d, "mend");
    addLog(d, "You lift the lens. The moth stays nested. Carrying it names one quiet parent the next time you audit.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "anneal" && specialId === "smash-anneal") {
    if (d.flags.annealLifted || d.flags.annealSmashed) {
      addLog(d, "The lens is already gone.");
      return true;
    }
    const lens = m.nodes.find((n) => n.id === "lens");
    if (lens) {
      lens.severed = true;
      lens.integrity = 0;
      lens.revealed = true;
    }
    d.flags.annealSmashed = true;
    d.flags.annealRead = true;
    if (!hasItem(d, "anneallens")) addItem(d, "anneallens", 1);
    noteVerb(d, "sabotage");
    addLog(d, "You smash the parent out of the nest. The moth has to stand up.");
    play("unmend");
    const moth = d.actors.panemoth;
    if (moth?.alive) {
      moth.hostile = true;
      moth.aggro = true;
      moth.vision = 4;
      if (dist(d.player, moth) <= 6) startCombat(d, ["panemoth"]);
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  return false;
}
function runKilnSpecial(d, m, specialId) {
  const kilnIds = new Set(["kilnfire", "kilnstamp", "kilnbench", "kilncache"]);
  if (!kilnIds.has(m.id)) return false;
  if (m.id === "kilnbench" && specialId === "rest") return false;
  if (dist(d.player, m) > 1) {
    addLog(d, "You are not at the machine.");
    return true;
  }
  const fire = d.machines.kilnfire;
  const flue = fire?.nodes.find((n) => n.id === "flue");
  const clay = fire?.nodes.find((n) => n.id === "clay");
  const bed = fire?.nodes.find((n) => n.id === "bed");
  const borrow = fire?.nodes.find((n) => n.id === "borrow");
  const claim = d.machines.kilnstamp?.nodes.find((n) => n.id === "claim");
  if (m.id === "kilnfire" && specialId === "seat-flue") {
    if (!flue || !clay || !bed || !fire) return true;
    if (clay.severed || !nodeLive(fire.nodes, clay)) {
      addLog(d, "The clay is gone. A flue cannot parent itself.");
      return true;
    }
    if (nodeLive(fire.nodes, flue) && d.flags.kilnRefused !== true) {
      addLog(d, "The flue is already seated.");
      return true;
    }
    const cost = d.perks?.includes("steady-mend") ? 2 : 4;
    if (d.focus < cost) {
      addLog(d, "Focus is too thin to seat the flue.");
      return true;
    }
    d.focus -= cost;
    d.flags.kilnRefused = false;
    flue.severed = false;
    flue.integrity = 100;
    flue.revealed = true;
    bed.severed = false;
    bed.integrity = 100;
    bed.revealed = true;
    noteVerb(d, "mend");
    addLog(d, "You seat the flue. The local bed has a parent. The set still wants water, or a field-dry, or it will crack.");
    play("mend");
    d.reputation.engineers = clamp(d.reputation.engineers + 2, -100, 100);
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnfire" && specialId === "stop-flue") {
    if (!flue || !fire || !nodeLive(fire.nodes, flue)) {
      addLog(d, "The flue is already down.");
      return true;
    }
    flue.severed = true;
    flue.integrity = 0;
    flue.revealed = true;
    noteVerb(d, "sabotage");
    addLog(d, "You stop the flue. Borrowed heat can still be a parent. This was not yet a refusal.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnfire" && specialId === "borrow-heat") {
    const heat = d.machines.hearth?.nodes.find((n) => n.id === "bed");
    const liveHeat = Boolean(heat && d.machines.hearth && nodeLive(d.machines.hearth.nodes, heat));
    if (!liveHeat || !borrow) {
      addLog(d, "Rust's fire bed is not a parent right now. There is nothing to borrow.");
      return true;
    }
    if (d.flags.kilnBorrowed && !borrow.severed) {
      addLog(d, "The yard is already drinking Rust heat.");
      return true;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to splice the heat.");
      return true;
    }
    d.focus -= 3;
    d.flags.kilnBorrowed = true;
    d.flags.kilnRefused = false;
    borrow.severed = false;
    borrow.integrity = 100;
    borrow.revealed = true;
    noteVerb(d, "redirect");
    addLog(d, "You splice the yard onto Rust's fire. The local flue can stay down. The brick will still need clay, and water or a field-dry.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnfire" && specialId === "field-dry") {
    if (d.flags.fieldDry) {
      addLog(d, "The set is already field-dried. It will not become gallery water by being dried twice.");
      return true;
    }
    if (!hasItem(d, "scrap")) {
      addLog(d, "Field-dry wants plate scrap. The gallery is a different parent.");
      return true;
    }
    const sure = d.player.skills.engineering >= 70;
    const chance = checkChance(d.player.skills.engineering, 42);
    const rolled = sure ? chance : rollD100();
    if (!sure && rolled > chance) {
      addLog(d, `The bake goes mean in the wrong direction. (${rolled} vs ${chance})`);
      return true;
    }
    takeItem(d, "scrap", 1);
    d.flags.fieldDry = true;
    noteVerb(d, "craft");
    addLog(d, sure ? "You know this bake. The set no longer needs the gallery." : `The field-dry holds. (${rolled} vs ${chance}) The gallery can stay dry.`);
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnfire" && specialId === "spill-clay") {
    if (!clay || clay.severed) {
      addLog(d, "The clay is already spilled.");
      return true;
    }
    clay.severed = true;
    clay.integrity = 0;
    noteVerb(d, "sabotage");
    addLog(d, "You spill the clay. Water and heat have nothing local to set.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnfire" && specialId === "refuse-yard") {
    if (d.flags.kilnRefused) {
      addLog(d, "The yard is already refused.");
      return true;
    }
    d.flags.kilnRefused = true;
    d.flags.kilnBorrowed = false;
    if (bed) {
      bed.severed = true;
      bed.integrity = 0;
      bed.revealed = true;
    }
    if (borrow) {
      borrow.severed = true;
      borrow.integrity = 0;
    }
    noteVerb(d, "sabotage");
    addLog(d, "You leave the beds down. The levy will have nothing to invoice. The houses will have nothing to hold.");
    play("unmend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnstamp" && specialId === "license-stamp") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
      return true;
    }
    if (d.flags.kilnLicensed) {
      addLog(d, "The board is already licensed. The levy did not leave.");
      return true;
    }
    const believed = d.player.skills.speech >= 60;
    const cost = kilnPrice(d, 12);
    if (!believed && d.scrip < cost) {
      addLog(d, `Cress wants ${cost} scrip, or a voice the Bureau already believes.`);
      return true;
    }
    if (!believed) d.scrip -= cost;
    d.flags.kilnLicensed = true;
    noteVerb(d, believed ? "negotiate" : "barter");
    d.reputation.bureau = clamp(d.reputation.bureau + 4, -100, 100);
    addLog(d, believed ? "You speak the stamp into a permit. The levy stays. The board can open." : "You pay the stamp. The levy stays. Jun is allowed to buy.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnstamp" && specialId === "cut-stamp") {
    if (!claim || claim.severed) {
      addLog(d, "The stamp is already a hole.");
      return true;
    }
    claim.severed = true;
    claim.integrity = 0;
    claim.revealed = true;
    d.flags.stampCut = true;
    noteVerb(d, "sabotage");
    d.reputation.bureau = clamp(d.reputation.bureau - 8, -100, 100);
    d.reputation.unbound = clamp(d.reputation.unbound + 6, -100, 100);
    addLog(d, "You cut the stamp. The levy dies. If the brick is real, the board no longer needs her permission.");
    play("unmend");
    const clerk = d.actors.cress;
    if (clerk?.alive) {
      clerk.hostile = true;
      clerk.aggro = true;
      clerk.vision = 5;
      if (dist(d.player, clerk) <= 6) startCombat(d, ["cress"]);
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilnbench" && specialId === "draw-brick") {
    if (!d.flags.brickLive) {
      addLog(d, "The set is not holding. A drawn brick would be a crack with a name.");
      return true;
    }
    const have = d.inventory.find((row) => row.id === "brick")?.qty ?? 0;
    if (have >= 4) {
      addLog(d, "Four bricks is a pack, not a cart. Sell one before you draw another.");
      return true;
    }
    addItem(d, "brick", 1);
    noteVerb(d, "craft");
    addLog(d, "You draw a brick that held. It is a trade good, not a trophy.");
    return true;
  }
  if (m.id === "kilnbench" && specialId === "sell-brick") {
    if (!hasItem(d, "brick")) {
      addLog(d, "You have no set brick to sell.");
      return true;
    }
    takeItem(d, "brick", 1);
    const legal = Boolean(d.flags.kilnShop);
    const gain = legal ? kilnPrice(d, 11) + 4 : kilnPrice(d, 4);
    d.scrip += gain;
    noteVerb(d, "barter");
    if (!legal && d.flags.kilnLevy) {
      d.reputation.bureau = clamp(d.reputation.bureau - 2, -100, 100);
      addLog(d, `Jun pays ${gain} under the board. Cress will hear. The levy was the legal parent.`);
    } else addLog(d, legal ? `Jun pays ${gain}. The board was allowed to.` : `Jun pays ${gain}. There is no levy to offend, and no board to do it properly.`);
    return true;
  }
  if (m.id === "kilnbench" && (specialId === "buy-tin" || specialId === "buy-bandage" || specialId === "buy-chisel" || specialId === "buy-coat")) {
    if (specialId === "buy-chisel" && !d.flags.brickLive) {
      addLog(d, "Jun will not sell a firing tool while the set is a rumor.");
      return true;
    }
    if (specialId === "buy-coat" && !d.flags.kilnShop) {
      addLog(d, "The coat is a finished good. The board is not allowed to sell it.");
      return true;
    }
    const row = specialId === "buy-tin" ? { id: "tin", n: 6 } : specialId === "buy-bandage" ? { id: "bandage", n: 8 } : specialId === "buy-chisel" ? { id: "chisel", n: 16 } : { id: "kilncoat", n: 22 };
    if (!payKiln(d, row.n)) return true;
    addItem(d, row.id, 1);
    noteVerb(d, "barter");
    addLog(d, `You buy ${ITEMS[row.id]?.name ?? "the good"}.`);
    return true;
  }
  if (m.id === "kilncache" && specialId === "read-cache") {
    const glass = m.nodes.find((n) => n.id === "glass");
    if (!glass) return true;
    if (glass.revealed) {
      addLog(d, "The glass is already named. It can be lifted. Smashing it is a different verb.");
      return true;
    }
    const chance = checkChance(d.player.skills.audit, 44);
    const rolled = rollD100();
    if (rolled > chance && !d.perks?.includes("parent-ear")) {
      addLog(d, `The nest shows you the flue and calls it the whole story. (${rolled} vs ${chance})`);
      return true;
    }
    glass.revealed = true;
    if (!glass.confidence) glass.confidence = "observed";
    noteVerb(d, "audit");
    addLog(d, "The soot glass is the parent the mite is using. The dead face was a costume.");
    d.audit = { kind: "machine", id: m.id };
    d.panel = "audit";
    return true;
  }
  if (m.id === "kilncache" && specialId === "lift-glass") {
    const glass = m.nodes.find((n) => n.id === "glass");
    if (d.flags.glassLifted || d.flags.glassSmashed) {
      addLog(d, "The glass is already gone.");
      return true;
    }
    if (!glass?.revealed) {
      addLog(d, "You can see a dead face. You have not read the parent. Lifting blind would be a smash.");
      return true;
    }
    glass.severed = true;
    glass.integrity = 0;
    d.flags.glassLifted = true;
    addItem(d, "sootglass", 1);
    noteVerb(d, "mend");
    addLog(d, "You lift the glass. The mite stays nested. The lens will name one seam other people call illegible.");
    play("mend");
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  if (m.id === "kilncache" && specialId === "smash-cache") {
    if (d.flags.glassLifted || d.flags.glassSmashed) {
      addLog(d, "The glass is already gone.");
      return true;
    }
    const glass = m.nodes.find((n) => n.id === "glass");
    if (glass) {
      glass.severed = true;
      glass.integrity = 0;
      glass.revealed = true;
    }
    d.flags.glassSmashed = true;
    d.flags.miteAwake = true;
    addItem(d, "sootglass", 1);
    noteVerb(d, "sabotage");
    addLog(d, "You smash the parent out of the nest. The mite has to stand up.");
    play("unmend");
    const mite = d.actors.mite;
    if (mite?.alive) {
      mite.hostile = true;
      mite.aggro = true;
      mite.vision = 4;
      if (dist(d.player, mite) <= 6) startCombat(d, ["mite"]);
    }
    reconcileWorld(d);
    d.panel = "none";
    return true;
  }
  return false;
}

function runSpecial(d, machineId, specialId) {
  const m = d.machines[machineId];
  if (!m) return;
  if (runKilnSpecial(d, m, specialId)) return;
  if (runSwitchSpecial(d, m, specialId)) return;
  if (runPaneSpecial(d, m, specialId)) return;
  if (m.id === "spireheart") {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the unissued baseline.");
      return;
    }
    const held = m.nodes.find((n) => n.id === "held");
    const baseline = m.nodes.find((n) => n.id === "baseline");
    if (specialId === "read-heart") {
      if (held) held.revealed = true;
      if (baseline) baseline.revealed = true;
      noteVerb(d, "audit");
      const heldBits = [];
      if (d.flags.foodLive) heldBits.push("a ward that eats");
      if (d.flags.plotsRefused) heldBits.push("a bed that was refused");
      if (d.flags.bellowsLive === false) heldBits.push("a stopped lung");
      if (d.flags.gearLive) heldBits.push("stock with parents");
      if (d.flags.stockRefused) heldBits.push("a forge that was refused");
      if (d.flags.roadDark) heldBits.push("a dark road");
      if (d.flags.stoneMoving) heldBits.push("stone still moving");
      if (
        d.flags["seen:rust"] &&
        d.flags.tenementWarm === false &&
        d.flags.guildWarm === false
      )
        heldBits.push("sleepers without heat");
      if (d.flags.tundraWalked && d.flags.hollowWarm === false)
        heldBits.push("a hollow with no weather");
      if (d.actors.cinder?.companion)
        heldBits.push("a moth that chose a shadow");
      else if (d.flags.cinderLeft) heldBits.push("a moth that left");
      if (d.flags.dossShift) heldBits.push("a sleeper off the reed");
      if (d.flags.adaPlate) heldBits.push("a plate at the plots");
      if (d.flags.pimCount) heldBits.push("a rigger back on the count");
      if (d.flags.driftBed) heldBits.push("someone sleeping in the hollow");
      if (d.flags.citadelFate)
        heldBits.push(`a citadel already marked ${d.flags.citadelFate}`);
      if (d.flags.cartPinned) heldBits.push("a cart held on the road");
      if (d.flags.brickLive) heldBits.push("a kiln that set");
      if (d.flags.kilnRefused) heldBits.push("a yard that was refused");
      if (d.flags.kilnLevy) heldBits.push("a brick bill");
      if (d.flags.paneCharge) heldBits.push("a glasshouse that melted");
      if (d.flags.paneRefused) heldBits.push("a house that was refused");
      if (d.flags.paneGlass) heldBits.push("lamp glass that was made, not issued");
      if (d.flags.washSpill) heldBits.push("a wash drinking the quench");
      if (d.flags.iceCut) heldBits.push("a hollow cut at the glaze");
      const list = heldBits.length
        ? heldBits.join(", ")
        : "the city as you left the rooms";
      addLog(
        d,
        `What is being held is intact: ${list}. The issued baseline under it is almost empty. Restoring it would be an invention. Writing a new shape would still be yours.`,
      );
      d.panel = "none";
      return;
    }
    if (specialId === "impose" || specialId === "release") {
      const ending = specialId;
      if (baseline && ending === "impose") {
        baseline.severed = false;
        baseline.integrity = 100;
        baseline.revealed = true;
      }
      if (baseline && ending === "release") {
        sever(d, m.nodes, baseline);
        baseline.revealed = true;
      }
      noteVerb(d, ending === "impose" ? "mend" : "cut");
      d.flags.ending = ending;
      d.ending = ending;
      d.epilogue = buildEpilogue(d, ending);
      d.phase = "epilogue";
      d.combat = null;
      d.dialogue = null;
      d.panel = "none";
      addLog(
        d,
        ending === "impose"
          ? "You write the shape. The city keeps it."
          : "You leave the holes. No baseline gets your name.",
      );
      return;
    }
  }
  if (m.id === "hollow" && specialId === "read-hollow") {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not in the hollow.");
      return;
    }
    const feed = m.nodes.find((n) => n.id === "feed");
    if (feed) feed.revealed = true;
    d.flags.hollowRead = true;
    noteVerb(d, "audit");
    addLog(
      d,
      nodeLive(m.nodes, feed)
        ? "The hollow is warm. The warmth is a child of the orrery, not of the ice."
        : "The hollow is only brass. Its parent stopped sending weather.",
    );
    d.panel = "none";
    reconcileWorld(d);
    return;
  }
  if (
    specialId === "face-surge" ||
    specialId === "face-gear" ||
    specialId === "face-engine"
  ) {
    faceMachine(d, m, specialId);
    return;
  }
  if (specialId === "brace" && m.id === "jack") {
    const footing = m.nodes.find((n) => n.id === "footing");
    const crown = m.nodes.find((n) => n.id === "crown");
    if (!footing || !crown) return;
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not under the crown.");
      return;
    }
    if (nodeLive(m.nodes, footing) && d.flags.jackHeld) {
      addLog(
        d,
        footing.integrity >= 100
          ? "The footing is already itself."
          : "The crown is already held.",
      );
      return;
    }
    if (d.focus < 3) {
      addLog(d, "Focus is too thin to set your weight.");
      return;
    }
    d.focus -= 3;
    const practiced = habit(d, "brace");
    const withTobin = Boolean(
      d.actors.tobin?.companion && dist(d.player, d.actors.tobin) <= 5,
    );
    footing.severed = false;
    footing.integrity = Math.max(
      footing.integrity,
      withTobin ? 90 : practiced ? 78 : 62,
    );
    noteVerb(d, "brace");
    if (withTobin && !d.flags.tobinJack) {
      d.flags.tobinJack = true;
      addLog(
        d,
        "Tobin sets his shoulder under yours. The brace reaches because he has done this before.",
      );
    }
    addLog(
      d,
      practiced || withTobin
        ? "The brace reaches. The crown stops moving."
        : "You set your weight under the crown. The footing is held, not healed.",
    );
    play("ui");
    burst(m.x, m.y, "brace");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "cistern" &&
    (specialId === "to-market" ||
      specialId === "to-clinic" ||
      specialId === "seat-both")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the cistern.");
      return;
    }
    const next =
      specialId === "to-market"
        ? "market"
        : specialId === "to-clinic"
          ? "clinic"
          : "shared";
    if (wardSplit(d) === next) {
      addLog(
        d,
        next === "shared"
          ? "The split is already shared."
          : "The feed is already sent that way.",
      );
      return;
    }
    if (specialId === "seat-both") {
      if (d.focus < 5) {
        addLog(d, "Focus is too thin to seat the split.");
        return;
      }
      if (
        d.player.skills.engineering < 40 &&
        rollD100() > checkChance(d.player.skills.engineering, 46)
      ) {
        d.focus = Math.max(0, d.focus - 3);
        addLog(d, "The split will not seat. The legs stay as they are.");
        return;
      }
      d.focus -= 5;
      d.flags.wardSplit = "shared";
      d.flags.wardSeated = true;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the split. Both legs can drink from whatever the Sinks send.",
      );
      play("mend");
    } else {
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to throw the split.");
        return;
      }
      d.focus -= 3;
      d.flags.wardSplit = next;
      noteVerb(d, "redirect");
      addLog(
        d,
        next === "market"
          ? "You send the feed to the stall. The clinic tap will go dry."
          : "You send the feed to the clinic. The stall will go dry.",
      );
      play("steam");
    }
    const mark = `splitXp:${next}`;
    if (!d.flags[mark]) {
      d.flags[mark] = true;
      grantXp(d, 16);
    }
    burst(m.x, m.y, "mend");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "hearth" &&
    (specialId === "bank" ||
      specialId === "to-beds" ||
      specialId === "to-hall" ||
      specialId === "seat-heat")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the hearth.");
      return;
    }
    const bed = m.nodes.find((n) => n.id === "bed");
    if (!bed) return;
    if (specialId === "bank") {
      if (bed.severed) {
        addLog(d, "The bed is severed. A brace is not a weld.");
        return;
      }
      if (d.flags.hearthHeld && nodeLive(m.nodes, bed)) {
        addLog(d, "The fire is already banked.");
        return;
      }
      if (d.flags.stoneMoving && nodeLive(m.nodes, bed)) {
        addLog(
          d,
          "The quarry is already the parent. The bed does not need your weight.",
        );
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to bank the fire.");
        return;
      }
      d.focus -= 3;
      const practiced = habit(d, "brace");
      bed.severed = false;
      bed.integrity = Math.max(bed.integrity, practiced ? 78 : 62);
      bed.dependsOn = d.flags.stoneMoving ? ["haul"] : [];
      d.flags.hearthHeld = true;
      noteVerb(d, "brace");
      addLog(
        d,
        practiced
          ? "The bank reaches. The bed holds without a quarry."
          : "You bank the fire. It is held, not fed.",
      );
      play("ui");
      burst(m.x, m.y, "brace");
    } else {
      const next =
        specialId === "to-beds"
          ? "beds"
          : specialId === "to-hall"
            ? "hall"
            : "shared";
      if (hearthSplit(d) === next) {
        addLog(
          d,
          next === "shared"
            ? "Both flues are already seated."
            : "The heat is already sent that way.",
        );
        return;
      }
      if (specialId === "seat-heat") {
        if (d.focus < 5) {
          addLog(d, "Focus is too thin to seat both flues.");
          return;
        }
        if (
          d.player.skills.engineering < 40 &&
          rollD100() > checkChance(d.player.skills.engineering, 46)
        ) {
          d.focus = Math.max(0, d.focus - 3);
          addLog(d, "The flues will not seat. The split stays as it is.");
          return;
        }
        d.focus -= 5;
        d.flags.hearthSplit = "shared";
        d.flags.hearthSeated = true;
        noteVerb(d, "mend");
        addLog(
          d,
          "You seat both flues. Hall and tenement can drink from the same bed.",
        );
        play("mend");
      } else {
        if (d.focus < 3) {
          addLog(d, "Focus is too thin to throw the flues.");
          return;
        }
        d.focus -= 3;
        d.flags.hearthSplit = next;
        noteVerb(d, "redirect");
        addLog(
          d,
          next === "beds"
            ? "You send the heat to the sleepers. The hall will go cold."
            : "You send the heat to the hall. The sleepers will go cold.",
        );
        play("steam");
      }
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (specialId === "rest") {
    const full = d.perks?.includes("thick-sleep");
    d.player.hp = full
      ? d.player.maxHp
      : Math.min(d.player.maxHp, d.player.hp + Math.ceil(d.player.maxHp * 0.45));
    d.focus = focusMax(d);
    addLog(
      d,
      full
        ? "You sleep the bed out. The morning is a full pulse, not a speech."
        : "You sleep like a tool put back in the right drawer.",
    );
    play("mend");
    d.panel = "none";
    return;
  }
  if (specialId === "bind") {
    if (d.focus < 4) {
      addLog(d, "Focus is too thin to bind a body.");
      return;
    }
    const chance = checkChance(d.player.skills.medicine, 36);
    const rolled = rollD100();
    d.focus -= 4;
    if (rolled > chance) {
      addLog(d, `The binding slips. (${rolled} vs ${chance})`);
      play("hurt");
      return;
    }
    healActor(d, "player", 10 + Math.floor(d.player.skills.medicine / 10));
    noteVerb(d, "mend");
    noteField(d, "biology");
    addLog(d, "You close what cloth can close. It is medicine, not a miracle.");
    grantXp(d, 8);
    return;
  }
  if (specialId === "service") {
    const id = d.equipped.weapon;
    const row = d.inventory.find((i) => i.id === id);
    if (!row || id === "fist") {
      addLog(d, "Nothing in your hands wants a bench.");
      return;
    }
    if ((row.condition ?? 100) >= 98) {
      addLog(d, "That weapon is already telling the truth.");
      return;
    }
    if (d.focus < 6) {
      addLog(d, "Focus is too thin to reseat it.");
      return;
    }
    const chance = checkChance(d.player.skills.mechanics, 40);
    const rolled = rollD100();
    d.focus -= 6;
    if (rolled > chance) {
      addLog(d, `The fit is wrong. (${rolled} vs ${chance})`);
      return;
    }
    row.condition = 100;
    noteVerb(d, "repair");
    addLog(
      d,
      `${ITEMS[id]?.name ?? "The weapon"} seats again. It will hit like it means it.`,
    );
    play("mend");
    grantXp(d, 10);
    return;
  }
  if (specialId === "slip") {
    const known = Boolean(d.flags.knowsCrawl);
    if (!known) {
      const chance = checkChance(d.player.skills.sneak, d.perks?.includes("soft-step") ? 40 : 52);
      const rolled = rollD100();
      if (rolled > chance) {
        addLog(
          d,
          `The grate will not take your shoulders. (${rolled} vs ${chance})`,
        );
        return;
      }
      addLog(d, "You were not told about the crawl. You fit anyway.");
    }
    d.player.x = 16;
    d.player.y = 12;
    d.player.mapId = "sinks";
    d.flags.usedCrawl = true;
    d.path = [];
    d.panel = "none";
    noteVerb(d, "sneak");
    addLog(
      d,
      "You drop through and come up on the blind side of the checkpoint, near the stack road.",
    );
    play("steam");
    return;
  }
  if (specialId === "gun") {
    if (!hasItem(d, "scrap")) {
      addLog(d, "You need plate scrap.");
      return;
    }
    const chance = checkChance(d.player.skills.mechanics, 42);
    const rolled = rollD100();
    if (rolled > chance) {
      addLog(d, `The scrap sulks. (${rolled} vs ${chance})`);
      return;
    }
    takeItem(d, "scrap", 1);
    addItem(d, "rivet", 1);
    d.equipped.weapon = "rivet";
    noteVerb(d, "craft");
    addLog(d, "The rivet gun chambers. It will argue at range.");
    grantXp(d, 15);
    return;
  }
  if (specialId === "drop" || specialId === "release") {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the machine.");
      return;
    }
    if (d.combat && currentId(d) !== "player") {
      addLog(d, "Not your action.");
      return;
    }
    const spent =
      m.nodes.some((n) => n.fail === "crush" && n.spent) ||
      Boolean(d.flags[`${m.id}:dropped`]);
    if (spent) {
      addLog(d, "The brake is already a rumor.");
      return;
    }
    const cable = m.nodes.find((n) => n.id === "cable" || n.id === "brake");
    if (!cable || cable.severed) {
      addLog(d, "The cable is already cut.");
      return;
    }
    if (d.combat) {
      if (d.player.ap < 3) {
        addLog(d, "Not enough action to kick the brake.");
        return;
      }
      d.player.ap -= 3;
    }
    if (m.id === "crane" && !d.flags.workersClear && !d.flags.workerHurt) {
      d.flags.workerHurt = true;
      d.reputation.unbound = clamp(d.reputation.unbound - 12, -100, 100);
      addLog(
        d,
        "A rigger was still on the hook. The stone does not choose carefully.",
      );
    } else if (m.id === "crane" && d.flags.workersClear) {
      d.reputation.unbound = clamp(d.reputation.unbound + 6, -100, 100);
      addLog(d, "The slab comes down clear of the riggers.");
    }
    sever(d, m.nodes, cable);
    noteVerb(d, "sabotage");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "bellows" &&
    (specialId === "seat-reed" ||
      specialId === "stop-lung" ||
      specialId === "leave-drip")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the bellows.");
      return;
    }
    const reed = seam(m.nodes, "reed");
    const lung = seam(m.nodes, "lung");
    if (!reed || !lung) return;
    if (specialId === "leave-drip") {
      if (d.flags.cinderFed) {
        addLog(
          d,
          "She already ate. More drip will not make the choosing yours.",
        );
        return;
      }
      d.flags.cinderSeen = true;
      d.flags.cinderFed = true;
      noteVerb(d, "mend");
      addLog(
        d,
        "You leave condensate on the reed. The moth drinks. Hunger was the parent. The shadow is still hers to choose.",
      );
      play("mend");
      reconcileWorld(d);
      d.panel = "none";
      return;
    }
    if (specialId === "seat-reed") {
      if (nodeLive(m.nodes, reed)) {
        addLog(d, "The reed is already seated.");
        return;
      }
      if (d.focus < 4) {
        addLog(d, "Focus is too thin to seat the reed.");
        return;
      }
      d.focus -= 4;
      reed.severed = false;
      reed.integrity = 100;
      lung.severed = false;
      lung.integrity = 100;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the reed. The pump has a lung. The city can take pressure again.",
      );
      play("mend");
    } else {
      if (!nodeLive(m.nodes, reed)) {
        addLog(d, "The lung is already stopped.");
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to stop the lung.");
        return;
      }
      d.focus -= 3;
      sever(d, m.nodes, reed);
      reed.revealed = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You stop the reed. Downstream, a perfect pump is still a dry city.",
      );
      play("unmend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "colossus" &&
    (specialId === "wake-throat" || specialId === "still-throat")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not under the mask.");
      return;
    }
    const throat = seam(m.nodes, "throat");
    if (!throat) return;
    if (specialId === "wake-throat") {
      if (nodeLive(m.nodes, throat) && d.flags.colossusMended) {
        addLog(d, "The throat is already awake.");
        return;
      }
      if (d.focus < 4) {
        addLog(d, "Focus is too thin to wake the throat.");
        return;
      }
      d.focus -= 4;
      throat.severed = false;
      throat.integrity = 100;
      d.flags.colossusMended = true;
      noteVerb(d, "mend");
      addLog(
        d,
        "The turbine takes air. The crane cable upstairs has a parent again.",
      );
      play("mend");
    } else {
      if (!nodeLive(m.nodes, throat)) {
        addLog(d, "The throat is already still.");
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to still the throat.");
        return;
      }
      d.focus -= 3;
      sever(d, m.nodes, throat);
      throat.revealed = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You still the turbine. The crane keeps its cable and loses the thing that was helping it hold.",
      );
      play("unmend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "plots" &&
    (specialId === "seat-bed" || specialId === "let-lie")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the plots.");
      return;
    }
    const bed = seam(m.nodes, "bed");
    if (!bed) return;
    if (specialId === "let-lie") {
      if (d.flags.plotsRefused && bed.severed) {
        addLog(
          d,
          "The bed is already lying. The levy has nothing, and so does the ward.",
        );
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to refuse the bed.");
        return;
      }
      d.focus -= 2;
      bed.severed = true;
      bed.integrity = 0;
      bed.revealed = true;
      d.flags.plotsRefused = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You leave the bed. Clean water can still arrive. The plots will not take it. A levy cannot invoice a refusal.",
      );
      play("unmend");
    } else {
      if (!d.flags.plotsRefused && !bed.severed) {
        addLog(d, "The bed is already seated. It still needs seated water.");
        return;
      }
      if (d.focus < 4) {
        addLog(d, "Focus is too thin to seat the bed.");
        return;
      }
      d.focus -= 4;
      bed.severed = false;
      bed.integrity = 100;
      bed.revealed = true;
      d.flags.plotsRefused = false;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the bed. If the inlet has clean water, the ward eats. Quill can bill that meal.",
      );
      play("mend");
    }
    burst(m.x, m.y, specialId === "let-lie" ? "snap" : "mend");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "forge" &&
    (specialId === "seat-stock" || specialId === "refuse-stock")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the forge.");
      return;
    }
    const stock = seam(m.nodes, "stock");
    if (!stock) return;
    if (specialId === "refuse-stock") {
      if (d.flags.stockRefused && stock.severed) {
        addLog(
          d,
          "The stock is already refused. The parents are still whatever they were.",
        );
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to refuse the stock.");
        return;
      }
      d.focus -= 2;
      stock.severed = true;
      stock.integrity = 0;
      stock.revealed = true;
      d.flags.stockRefused = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You refuse the stock. Ore, quench, and fire can all be healthy. The hall still gets no new gear.",
      );
      play("unmend");
    } else {
      if (!d.flags.stockRefused && !stock.severed) {
        addLog(
          d,
          "The stock is already seated. It still needs its three parents.",
        );
        return;
      }
      if (d.focus < 4) {
        addLog(d, "Focus is too thin to seat the stock.");
        return;
      }
      d.focus -= 4;
      stock.severed = false;
      stock.integrity = 100;
      stock.revealed = true;
      d.flags.stockRefused = false;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the stock. It will make gear only if the pit, the gallery, and the fire all still hold.",
      );
      play("mend");
    }
    burst(m.x, m.y, specialId === "refuse-stock" ? "snap" : "mend");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "chute" &&
    (specialId === "spill-grade" || specialId === "seat-grade")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the chute.");
      return;
    }
    const grade = seam(m.nodes, "grade");
    if (!grade) return;
    if (specialId === "spill-grade") {
      if (grade.severed) {
        addLog(d, "The grade is already spilling.");
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to spill the grade.");
        return;
      }
      d.focus -= 2;
      sever(d, m.nodes, grade);
      grade.revealed = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You spill the grade. Stone can still leave the pit. The forge will not call it ore.",
      );
      play("unmend");
    } else {
      if (!grade.severed) {
        addLog(d, "The grade is already seated.");
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to seat the grade.");
        return;
      }
      d.focus -= 3;
      grade.severed = false;
      grade.integrity = 100;
      grade.revealed = true;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the grade. The chute can parent the forge again, if the road is actually carrying stone.",
      );
      play("mend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "lamps" &&
    (specialId === "break-glass" || specialId === "seat-glass")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the lamp glass.");
      return;
    }
    const glass = seam(m.nodes, "glass");
    if (!glass) return;
    if (specialId === "break-glass") {
      if (glass.severed) {
        addLog(
          d,
          "The glass is already broken. The orrery was not the thing you cut.",
        );
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to break the glass.");
        return;
      }
      d.focus -= 2;
      sever(d, m.nodes, glass);
      glass.revealed = true;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You break the lamp glass. The orrery can keep turning. The stack road will not have that child.",
      );
      play("unmend");
    } else {
      if (!glass.severed) {
        addLog(d, "The glass is already seated.");
        return;
      }
      const fromYard = hasItem(d, "clearpane");
      const cost = fromYard ? 1 : 3;
      if (d.focus < cost) {
        addLog(d, fromYard ? "Focus is too thin to seat the pane." : "Focus is too thin to seat the glass.");
        return;
      }
      d.focus -= cost;
      if (fromYard) {
        takeItem(d, "clearpane", 1);
        d.flags.paneGlass = true;
      }
      glass.severed = false;
      glass.integrity = 100;
      noteVerb(d, "mend");
      addLog(
        d,
        fromYard
          ? "You seat a pane from the glasshouse. The orrery did not have to make the glass. The lamps still die if the orrery is not sending."
          : "You seat the glass. The lamps still die if the orrery is not sending.",
      );
      play("mend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (m.id === "orrery" && specialId === "read-orrery") {
    const drive = seam(m.nodes, "drive");
    const live = drive ? nodeLive(m.nodes, drive) : false;
    if (drive) drive.revealed = true;
    noteVerb(d, "audit");
    addLog(
      d,
      live
        ? "The rings are taking the siphon. The citadel still has a clock."
        : "The rings are stopped. The siphon is not sending a child.",
    );
    d.panel = "none";
    return;
  }
  if (
    m.id === "relay" &&
    (specialId === "ease-brake" || specialId === "pin-load")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the waystation brake.");
      return;
    }
    const brake = seam(m.nodes, "brake");
    const load = seam(m.nodes, "load");
    if (!brake || !load) return;
    if (specialId === "pin-load") {
      if (d.flags.cartPinned) {
        addLog(
          d,
          "The load is already pinned. The forge is already missing that parent.",
        );
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to pin the load.");
        return;
      }
      d.focus -= 2;
      brake.revealed = true;
      load.revealed = true;
      sever(d, m.nodes, brake);
      d.flags.cartPinned = true;
      d.flags.cartEase = false;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You pin the load. Stone can leave the pit and still not become ore. Rust will meet the absence, not a speech.",
      );
      play("unmend");
      burst(m.x, m.y, "snap");
    } else {
      if (d.flags.cartEase && !d.flags.cartPinned && !brake.severed) {
        addLog(
          d,
          "The brake is already eased. The cart does not need you again.",
        );
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to ease the brake.");
        return;
      }
      d.focus -= 3;
      brake.severed = false;
      brake.integrity = 84;
      brake.revealed = true;
      load.severed = false;
      load.integrity = 80;
      load.revealed = true;
      d.flags.cartPinned = false;
      d.flags.cartEase = true;
      if (!d.flags.couplerGiven) {
        d.flags.couplerGiven = true;
        addItem(d, "coupler", 1);
        addLog(
          d,
          "The collar comes off in your hand. It holds a seam. It is a worse argument than a prybar.",
        );
      }
      noteVerb(d, "mend");
      addLog(
        d,
        "You ease the brake. The cart can leave. Rust will feel the weight before anyone finishes the sentence.",
      );
      play("mend");
      burst(m.x, m.y, "mend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "stake" &&
    (specialId === "seat-span" || specialId === "cut-span")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the glaze stake.");
      return;
    }
    const guy = seam(m.nodes, "guy");
    const span = seam(m.nodes, "span");
    if (!guy || !span) return;
    if (specialId === "cut-span") {
      if (d.flags.iceCut) {
        addLog(
          d,
          "The span is already cut. The hollow is already paying for it.",
        );
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to cut the span.");
        return;
      }
      d.focus -= 2;
      sever(d, m.nodes, guy);
      guy.revealed = true;
      span.revealed = true;
      d.flags.iceCut = true;
      d.flags.iceSpan = false;
      noteVerb(d, "cut");
      addLog(
        d,
        "You cut the span. The hollow goes cold even if a clock elsewhere is still sending. The ice will bill the middle harder.",
      );
      play("unmend");
      burst(m.x, m.y, "snap");
    } else {
      if (d.flags.iceSpan && !guy.severed) {
        addLog(d, "The span is already seated. The ice has a floor.");
        return;
      }
      const cost = hasItem(d, "cleat") ? 2 : 4;
      if (d.focus < cost) {
        addLog(d, "Focus is too thin to seat the span.");
        return;
      }
      d.focus -= cost;
      guy.severed = false;
      guy.integrity = 86;
      guy.revealed = true;
      span.severed = false;
      span.integrity = 80;
      span.revealed = true;
      d.flags.iceSpan = true;
      d.flags.iceCut = false;
      noteVerb(d, "mend");
      addLog(
        d,
        hasItem(d, "cleat")
          ? "The cleats find the wire. The span seats. The middle stops billing you. The hollow's weather is left alone."
          : "You seat the span with your weight. The middle stops billing you. It is a floor, not a favor to the hollow.",
      );
      play("mend");
      burst(m.x, m.y, "mend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "wash" &&
    (specialId === "to-sleepers" ||
      specialId === "to-forge" ||
      specialId === "seat-wash")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the tenement wash.");
      return;
    }
    const mode =
      specialId === "to-sleepers"
        ? "sleepers"
        : specialId === "to-forge"
          ? "forge"
          : "shared";
    const same =
      (mode === "sleepers" &&
        d.flags.washSpill === true &&
        d.flags.washShared !== true) ||
      (mode === "forge" &&
        d.flags.washChosen === true &&
        d.flags.washSpill !== true &&
        d.flags.washShared !== true) ||
      (mode === "shared" && d.flags.washShared === true);
    if (same) {
      addLog(d, "The wash is already sent that way.");
      return;
    }
    if (mode === "shared") {
      if (d.focus < 5) {
        addLog(d, "Focus is too thin to seat the shared wash.");
        return;
      }
      const maraHears = Boolean(
        d.actors.mara?.companion &&
        d.flags.maraFate !== "restored" &&
        dist(d.player, d.actors.mara) <= 5,
      );
      if (
        !maraHears &&
        d.player.skills.engineering < 36 &&
        rollD100() > checkChance(d.player.skills.engineering, 44)
      ) {
        d.focus = Math.max(0, d.focus - 3);
        addLog(d, "The split will not seat. The pipe stays as it is.");
        return;
      }
      if (maraHears && !d.flags.maraFlue) {
        d.flags.maraFlue = true;
        addLog(
          d,
          "Mara hums the flue until the split agrees. She knew the pipe before the diagram did.",
        );
      }
      d.focus -= 5;
      d.flags.washSpill = false;
      d.flags.washShared = true;
      noteVerb(d, "mend");
      addLog(
        d,
        "You seat the split. Sleepers and forge can both drink, if the gallery has anything to send. Neither drink is a kindness.",
      );
      play("mend");
    } else if (mode === "sleepers") {
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to throw the wash.");
        return;
      }
      d.focus -= 3;
      d.flags.washSpill = true;
      d.flags.washShared = false;
      noteVerb(d, "redirect");
      addLog(
        d,
        "You send the quench to the sleepers. The forge leg goes dry. Both sentences stay true.",
      );
      play("steam");
    } else {
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to send it back.");
        return;
      }
      d.focus -= 2;
      d.flags.washSpill = false;
      d.flags.washShared = false;
      noteVerb(d, "redirect");
      addLog(
        d,
        "You send the quench back toward the forge. The sleeper pipe goes dry.",
      );
      play("steam");
    }
    d.flags.washChosen = true;
    burst(m.x, m.y, mode === "sleepers" ? "snap" : "mend");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "gauge" &&
    (specialId === "read-face" || specialId === "cut-feed")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the gauge.");
      return;
    }
    const face = seam(m.nodes, "face");
    const feed = seam(m.nodes, "feed");
    const pocket = seam(m.nodes, "pocket");
    if (!face || !feed || !pocket) return;
    if (specialId === "read-face") {
      if (d.flags.gaugeRead && feed.revealed) {
        addLog(d, "The face is already a costume. The feed is the parent.");
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to read past the face.");
        return;
      }
      d.focus -= 2;
      face.decoy = true;
      face.revealed = true;
      feed.revealed = true;
      pocket.revealed = true;
      if (!feed.confidence) feed.confidence = "understood";
      d.flags.gaugeRead = true;
      noteVerb(d, "audit");
      const wren = d.actors.wren;
      if (wren?.companion && dist(d.player, wren) <= 5 && !d.flags.wrenGauge) {
        d.flags.wrenGauge = true;
        addLog(
          d,
          "Wren names the feed before you finish the sentence. The face was never the failure.",
        );
      }
      if (!d.flags.listenerGiven) {
        d.flags.listenerGiven = true;
        addItem(d, "listener", 1);
        addLog(
          d,
          "A coil comes off the gauge housing. It will name one seam you have not admitted. Once.",
        );
      }
      addLog(
        d,
        "The face is a costume. The pocket feed behind it is holding. Cutting the face will bite, and it will not dry the district.",
      );
      play("ui");
    } else {
      if (d.flags.gaugeCut) {
        addLog(
          d,
          "The pocket feed is already cut. The district pump was not this parent.",
        );
        return;
      }
      if (!feed.revealed) {
        addLog(
          d,
          "You have not named the parent yet. The face is still the only thing the gauge admits.",
        );
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to cut the feed.");
        return;
      }
      d.focus -= 3;
      sever(d, m.nodes, feed);
      feed.revealed = true;
      pocket.revealed = true;
      d.flags.gaugeCut = true;
      noteVerb(d, "cut");
      addLog(
        d,
        "You cut the pocket feed. The west pocket goes dry. The district pump does not. Something in the water was using that parent.",
      );
      play("unmend");
    }
    burst(m.x, m.y, specialId === "cut-feed" ? "snap" : "mend");
    reconcileWorld(d);
    d.panel = "none";
    if (d.flags.gaugeCut && d.actors.servo?.alive && !d.combat)
      startCombat(d, ["servo"]);
    return;
  }
  if (
    m.id === "still" &&
    (specialId === "break-still" || specialId === "license-still")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the still.");
      return;
    }
    const coil = seam(m.nodes, "coil");
    const cup = seam(m.nodes, "cup");
    if (!coil || !cup) return;
    if (specialId === "break-still") {
      if (d.flags.stillBroken) {
        addLog(d, "The still is already broken.");
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to break the coil.");
        return;
      }
      d.focus -= 2;
      sever(d, m.nodes, coil);
      cup.severed = true;
      cup.integrity = 0;
      d.flags.stillBroken = true;
      d.flags.stillLicensed = false;
      noteVerb(d, "sabotage");
      addLog(
        d,
        "You break the still. The cup goes. The clinic keeps whatever parent it had. The alley loses the difference.",
      );
      play("unmend");
    } else {
      if (d.flags.stillLicensed) {
        addLog(d, "The trickle is already written down.");
        return;
      }
      const seraNear = Boolean(
        d.actors.sera?.companion && dist(d.player, d.actors.sera) <= 5,
      );
      const cost = seraNear ? 2 : 4;
      if (d.focus < cost) {
        addLog(d, "Focus is too thin to license the cup.");
        return;
      }
      d.focus -= cost;
      coil.severed = false;
      coil.integrity = 70;
      coil.revealed = true;
      cup.severed = false;
      cup.integrity = 70;
      d.flags.stillBroken = false;
      d.flags.stillLicensed = true;
      noteVerb(d, "redirect");
      if (seraNear && !d.flags.seraStill) {
        d.flags.seraStill = true;
        addLog(
          d,
          "Sera says a licensed trickle is not a standard. She stays while you write it anyway.",
        );
      }
      addLog(
        d,
        "You license the trickle. It stays a cup, not a well. The alley has a parent that is not a raid.",
      );
      play("mend");
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (
    m.id === "winchhouse" &&
    (specialId === "brace-winch" || specialId === "cut-winch")
  ) {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the night winch.");
      return;
    }
    const dog = seam(m.nodes, "dog");
    const cover = seam(m.nodes, "cover");
    const throat = d.machines.colossus
      ? seam(d.machines.colossus.nodes, "throat")
      : void 0;
    const breath =
      throat && d.machines.colossus
        ? nodeLive(d.machines.colossus.nodes, throat)
        : true;
    if (!dog || !cover) return;
    if (specialId === "brace-winch") {
      if (!breath) {
        addLog(
          d,
          "The throat is already still. Bracing this winch would pretend a parent is in the canyon. It is not.",
        );
        return;
      }
      if (d.flags.crewStood) {
        addLog(
          d,
          "The crew already stood down. The throat is still the reason.",
        );
        return;
      }
      if (d.focus < 3) {
        addLog(d, "Focus is too thin to brace the winch.");
        return;
      }
      d.focus -= 3;
      dog.severed = false;
      dog.integrity = 78;
      dog.revealed = true;
      d.flags.crewStood = true;
      noteVerb(d, "brace");
      if (!d.flags.dogGiven) {
        d.flags.dogGiven = true;
        addItem(d, "dog", 1);
        addLog(
          d,
          "Holt kicks a cable dog across the plate. It holds a seam. It is not a promotion.",
        );
      }
      addLog(
        d,
        "You brace the winch. The crew can hear the throat. They stand down. The shade was never the stone.",
      );
      play("ui");
    } else {
      if (d.flags.winchCut) {
        addLog(d, "The winch is already cut.");
        return;
      }
      if (d.focus < 2) {
        addLog(d, "Focus is too thin to cut the winch.");
        return;
      }
      d.focus -= 2;
      sever(d, m.nodes, dog);
      cover.revealed = true;
      d.flags.winchCut = true;
      noteVerb(d, "cut");
      if (breath) {
        d.flags.crewFled = true;
        addLog(
          d,
          "You cut the winch. The throat is still a parent. The crew will not stand under a live cable. They leave.",
        );
        play("unmend");
      } else {
        addLog(
          d,
          "You cut the winch. The throat is already still. The crew has no other parent. They answer.",
        );
        play("unmend");
        reconcileWorld(d);
        d.panel = "none";
        const ids = ["crew1", "crew2"].filter((id) => d.actors[id]?.alive);
        if (ids.length && !d.combat) startCombat(d, ids);
        return;
      }
    }
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (m.id === "buffer" && specialId === "charge-cell") {
    if (dist(d.player, m) > 1) {
      addLog(d, "You are not at the buffer.");
      return;
    }
    if (d.flags.citadelFate) {
      addLog(
        d,
        "The crucible has already been answered. The cell cannot rewrite that dark.",
      );
      return;
    }
    if (d.flags.bufferCharged) {
      addLog(d, "The cell is already holding one night.");
      return;
    }
    const sip = d.machines.crucible
      ? seam(d.machines.crucible.nodes, "siphon")
      : void 0;
    const sending = Boolean(
      sip && d.machines.crucible && nodeLive(d.machines.crucible.nodes, sip),
    );
    if (!sending) {
      addLog(
        d,
        "The siphon is not sending. A cell cannot charge from a parent that is already dark.",
      );
      return;
    }
    if (d.focus < 4) {
      addLog(d, "Focus is too thin to charge the cell.");
      return;
    }
    d.focus -= 4;
    const cell = seam(m.nodes, "cell");
    const ward = seam(m.nodes, "ward");
    if (cell) {
      cell.severed = false;
      cell.integrity = 80;
      cell.revealed = true;
    }
    if (ward) {
      ward.severed = false;
      ward.integrity = 80;
      ward.revealed = true;
    }
    d.flags.bufferCharged = true;
    noteVerb(d, "mend");
    addLog(
      d,
      "You charge the cell. One infirmary can keep a night if you cut the siphon. The rest of the dark will still be honest.",
    );
    play("mend");
    burst(m.x, m.y, "mend");
    reconcileWorld(d);
    d.panel = "none";
    return;
  }
  if (d.flags.citadelFate && specialId !== "rest") {
    addLog(d, "The crucible has already been answered.");
    return;
  }
  if (specialId === "sever") {
    const siphon = m.nodes.find((n) => n.id === "siphon");
    if (siphon) sever(d, m.nodes, siphon);
    noteVerb(d, "sabotage");
    finishCitadel(d, "sever");
    return;
  }
  if (specialId === "redirect") {
    if (
      d.player.skills.engineering < 45 &&
      rollD100() > checkChance(d.player.skills.engineering, 48)
    ) {
      addLog(d, "The splice will not seat. Your hands know it.");
      return;
    }
    const lifts = m.nodes.find((n) => n.id === "lifts");
    if (lifts) lifts.integrity = 25;
    noteVerb(d, "redirect");
    finishCitadel(d, "redirect");
    return;
  }
  if (specialId === "seize") {
    if (comp(d) < 8 && !d.disciplines.includes("continuity")) {
      addLog(d, "The rank engine does not accept handwriting this small.");
      applyHp(d, "player", 6);
      return;
    }
    finishCitadel(d, "seize");
  }
}
function finishCitadel(d, fate) {
  d.flags.citadelFate = fate;
  d.flags.spireOpen = true;
  if (!d.disciplines.includes("causal")) d.disciplines.push("causal");
  grantXp(d, 80);
  const text = {
    sever:
      "You severed the siphon. The spires sag. Hospitals go dark with the ballrooms. No blood on the ranking floor.",
    redirect:
      "You spliced the feed toward the Sinks. The undercity lights. The balconies will learn what cold is.",
    seize:
      "You sat in the rank engine. The city keeps its shape. The shape now answers to a maintenance key.",
  };
  journal(d, "siphon", "The siphon", text[fate], "done");
  addLog(d, text[fate]);
  if (fate === "sever" && d.flags.bufferCharged) {
    d.flags.bufferHeld = true;
    addLog(
      d,
      "One infirmary keeps the night. The cell was already charged. The rest of the dark is honest.",
    );
  } else if (d.flags.bufferCharged && fate !== "sever") {
    addLog(
      d,
      "The buffer cell stays charged. Nothing asked it to keep a ward.",
    );
  }
  d.reputation.bureau = clamp(
    d.reputation.bureau - (fate === "seize" ? 6 : 16),
    -100,
    100,
  );
  d.reputation.unbound = clamp(
    d.reputation.unbound +
      (fate === "seize" ? 2 : fate === "redirect" ? 18 : 10),
    -100,
    100,
  );
  play("unmend");
  d.panel = "none";
  if (fate === "sever" && !d.flags.shaftOpen) {
    const ids = ["guard1", "guard2"].filter((id) => d.actors[id]?.alive);
    if (ids.length) {
      addLog(d, "The floor notices the dark.");
      startCombat(d, ids);
    }
  } else
    addLog(
      d,
      "The Void Spire is on the map now. Something there has no baseline.",
    );
}
function checkVision(d) {
  if (d.combat || d.dialogue || d.phase !== "play") return;
  const seen = Object.values(d.actors).filter(
    (a) =>
      a.alive &&
      a.hostile &&
      a.aggro &&
      a.mapId === d.mapId &&
      dist(a, d.player) <= a.vision &&
      a.vision > 0,
  );
  if (seen.length)
    startCombat(
      d,
      seen.map((a) => a.id),
    );
}
function spendSkill(d, id) {
  if (d.skillPoints <= 0) return;
  if (d.player.skills[id] >= 95) return;
  d.skillPoints -= 1;
  d.player.skills[id] = clamp(d.player.skills[id] + 4, 1, 95);
}
function takePerk(d, id) {
  if (!d.perks) d.perks = [];
  if ((d.perkPoints ?? 0) <= 0) return;
  if (d.perks.includes(id)) return;
  if (!PERKS.some((perk) => perk.id === id)) return;
  d.perkPoints = (d.perkPoints ?? 0) - 1;
  d.perks.push(id);
  d.flags[`perk:${id}`] = true;
  const named = PERKS.find((perk) => perk.id === id);
  addLog(d, `${named?.name ?? "The perk"} is how the hands will work. It is not a larger number.`);
}
function useItem(d, id) {
  const def = ITEMS[id];
  if (!def || !hasItem(d, id)) return;
  const inFight = Boolean(d.combat && currentId(d) === "player");
  if (def.kind === "weapon") {
    d.equipped.weapon = id;
    d.player.weapon = id;
    addLog(d, `Equipped ${def.name}.`);
    return;
  }
  if (def.kind === "armor") {
    d.equipped.armor = id;
    addLog(d, `You pull on ${def.name}.`);
    return;
  }
  if (def.kind === "accessory") {
    addLog(d, `${def.name} is for someone walking with you.`);
    return;
  }
  if (def.kind === "consumable") {
    if (inFight && d.player.ap < 2) {
      addLog(d, "Not enough action.");
      return;
    }
    if (inFight) d.player.ap -= 2;
    if (id === "chalk") {
      d.flags.chalked = true;
      takeItem(d, id, 1);
      addLog(d, "You chalk the next reading.");
      return;
    }
    if (id === "sootglass") {
      const fromAudit =
        d.audit?.kind === "machine"
          ? d.machines[d.audit.id]?.nodes
          : d.audit?.kind === "actor"
            ? d.audit.id === "player"
              ? d.player.nodes
              : d.actors[d.audit.id]?.nodes
            : void 0;
      let nodes = fromAudit;
      if (!nodes) {
        let best = null;
        let bestD = 99;
        for (const machine of Object.values(d.machines)) {
          if (machine.mapId !== d.mapId) continue;
          const gap = Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y);
          if (gap < bestD) {
            best = machine;
            bestD = gap;
          }
        }
        nodes = best?.nodes;
        if (best && !d.audit) d.audit = { kind: "machine", id: best.id };
      }
      const hidden = (nodes ?? []).filter((n) => !n.revealed && n.tier === "obfuscated");
      if (!hidden.length) {
        addLog(d, "The soot glass has no illegible seam left on this graph.");
        return;
      }
      const pick = hidden[0];
      pick.revealed = true;
      if (!pick.confidence) pick.confidence = "observed";
      d.uiNode = pick.id;
      takeItem(d, id, 1);
      noteVerb(d, "audit");
      addLog(d, `The soot glass names ${pick.name}. The surface had called it illegible.`);
      d.panel = "audit";
      return;
    }
    if (id === "listener") {
      const fromAudit =
        d.audit?.kind === "machine"
          ? d.machines[d.audit.id]?.nodes
          : d.audit?.kind === "actor"
            ? d.audit.id === "player"
              ? d.player.nodes
              : d.actors[d.audit.id]?.nodes
            : void 0;
      let nodes = fromAudit;
      if (!nodes) {
        let best = null;
        let bestD = 99;
        for (const machine of Object.values(d.machines)) {
          if (machine.mapId !== d.mapId) continue;
          const gap =
            Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y);
          if (gap < bestD) {
            best = machine;
            bestD = gap;
          }
        }
        nodes = best?.nodes;
        if (best && !d.audit) d.audit = { kind: "machine", id: best.id };
      }
      const hidden = (nodes ?? []).filter(
        (n) => !n.revealed && !n.decoy && n.tier !== "obfuscated",
      );
      if (!hidden.length) {
        addLog(d, "The listener has nothing left to name on this graph.");
        return;
      }
      hidden.sort((a, b) => a.integrity - b.integrity);
      const pick = hidden[0];
      pick.revealed = true;
      if (!pick.confidence) pick.confidence = "observed";
      d.uiNode = pick.id;
      takeItem(d, id, 1);
      noteVerb(d, "audit");
      addLog(
        d,
        `The listener names ${pick.name}. It was already in the graph.`,
      );
      d.panel = "audit";
      return;
    }
    if (def.heal) healActor(d, "player", def.heal);
    if (def.focus) d.focus = Math.min(focusMax(d), d.focus + def.focus);
    takeItem(d, id, 1);
    addLog(d, `Used ${def.name}.`);
  }
}
function buildEpilogue(d, ending) {
  const lines = [];
  if (ending === "impose") {
    lines.push(
      "You wrote the shape. The city keeps a silhouette, and the silhouette has your hand on it. People fit the drawing. Some of them thank you. Some of them cannot remember the version of themselves that would have refused.",
    );
  } else {
    lines.push(
      "You left the holes. No baseline got your name. The city stays unfinished. That is not kindness and it is not cruelty. It is weather with room for names that are not yours.",
    );
  }
  const pump = d.flags.pumpFate;
  if (pump === "mend")
    lines.push(
      "The Sinks run clean. A ribbon on the pump still lies about who fixed it.",
    );
  if (pump === "bleed")
    lines.push(
      "The Sinks run brown. Nobody died of thirst. Plenty learned the taste of your shortcut.",
    );
  if (pump === "speech")
    lines.push(
      "The pump moves because a clerk was afraid. The Bureau framed the plaque.",
    );
  if (pump === "flood")
    lines.push("Cellars remember the mend that came back wrong.");
  if (pump === "lockout")
    lines.push(
      "The Sinks run because you cut a Bureau veto. The plaque calls it vandalism.",
    );
  if (pump === "wren")
    lines.push(
      "Wren seated the valve. Your name is not on the ribbon, which is why the ribbon is honest.",
    );
  if (d.flags.bellowsLive === false)
    lines.push(
      "The Sinks bellows was stopped. A seated pump still had no lung, and the city knew the difference.",
    );
  const tob = d.flags.tobinFate;
  if (tob === "intact")
    lines.push(
      "Tobin is unscarred and oddly gentle. He trusts diagrams more than he trusts pain. You did that.",
    );
  if (tob === "scarred")
    lines.push(
      "Tobin keeps the scar and the judgment that grew on it. He does not thank you. He stays.",
    );
  if (tob === "distorted")
    lines.push(
      "Tobin lives at a half-second delay. Wholeness, forced, invented someone adjacent to him.",
    );
  if (!d.actors.tobin?.alive)
    lines.push(
      "Tobin's baseline is gone. The bench has a new oil stain and no keeper.",
    );
  if (d.flags.varrFate === "dead")
    lines.push(
      "Varr is a file marked closed. RelSec read it as a declaration.",
    );
  if (d.flags.varrFate === "stood")
    lines.push(
      "Varr carried your sentence back to RelSec. They hated the grammar and believed it.",
    );
  if (d.flags.varrFate === "spared")
    lines.push("Varr crawls through other people's stories without his plate.");
  if (d.flags.kaelFate === "spared")
    lines.push(
      "Kael lives, divorced from his armor, repeating the word siphon like a man who bit it.",
    );
  if (d.flags.kaelFate === "dead")
    lines.push(
      "The quarry tells Kael's death as a fall of stone, which is only half a lie.",
    );
  if (d.flags.workerHurt)
    lines.push("A rigger's name is on the crane. You did not clear the stone.");
  const mara = d.flags.maraFate;
  if (mara === "restored")
    lines.push(
      "Mara remembers a kitchen and not the door-song. She sleeps. She is easier to hurt.",
    );
  if (mara === "intact")
    lines.push(
      "Mara keeps the nights and the cadence. She did not ask to be saved from the thing that saved her.",
    );
  if (mara === "untouched")
    lines.push(
      "You left Mara's lattice alone. Ives notices, and does not call it cowardice out loud.",
    );
  const cit = d.flags.citadelFate;
  if (cit === "sever")
    lines.push(
      "The spires sit lower. The dark is honest and it does not spare the infirmaries.",
    );
  if (cit === "redirect")
    lines.push(
      "Light pools in the Sinks. The balconies learn a new temperature.",
    );
  if (cit === "expose")
    lines.push(
      "The ceremony heard the diagram. The city has to pretend it did not, or change.",
    );
  if (cit === "seize")
    lines.push(
      "You are the standard now. Maintenance became a throne without changing its boots.",
    );
  if (d.flags.bufferHeld)
    lines.push(
      "One citadel infirmary kept a night on a charged cell. The rest of the dark was not spared.",
    );
  else if (d.flags.bufferCharged && cit && cit !== "sever")
    lines.push("A buffer cell was charged and never asked to keep a ward.");
  else if (d.flags["seen:citadel"] && cit === "sever" && !d.flags.bufferCharged)
    lines.push(
      "The wards went with the siphon. The buffer cell had been empty.",
    );
  if (d.flags.ashCounsel)
    lines.push(
      "Sera's warning remains in the margin: do not replace a broken god with your own face.",
    );
  const split = d.flags.wardSplit;
  if (split === "clinic")
    lines.push(
      "The lower ward's water went to the clinic. The stall learned a dry season.",
    );
  else if (split === "market")
    lines.push(
      "The lower ward's water went to the stall. The clinic tap stayed a rumor.",
    );
  else if (d.flags.wardMarket && d.flags.wardClinic)
    lines.push(
      "The lower ward drank on a shared split. Stall and clinic both had a parent.",
    );
  else if (d.flags.seenWard || d.flags.pumpFate)
    lines.push(
      "The lower ward cistern stayed a child of the Sinks. It did not grow a well.",
    );
  if (d.flags.provisionalStamp)
    lines.push(
      "A pricing clerk stamped brown water as provisional. The stall sold it under that name.",
    );
  if (d.flags.bramRan)
    lines.push(
      "Freight moved, because the plate stair was signed and the road mouth was not a squad.",
    );
  const stone = d.flags.quarryStone;
  if (stone === "clear")
    lines.push("The quarry slab came down clear of the riggers.");
  if (stone === "scarred")
    lines.push(
      "The quarry slab came down on a rigger. The stone was still stone.",
    );
  if (d.flags.seenQuarry && d.flags.colossusBreath === false)
    lines.push(
      "The canyon colossus stopped breathing. The crane cable carried the pit alone.",
    );
  if (
    d.flags.seenCitadel &&
    d.flags.citadelFate !== "sever" &&
    d.flags.orreryTurn
  )
    lines.push(
      "The frost orrery kept the citadel's time, because the siphon still had a child.",
    );
  if (d.flags.seenCitadel && d.flags.orreryTurn === false)
    lines.push(
      "The frost orrery stopped. The citadel had no clock left to lie with.",
    );
  if (d.flags.stoneMoving && d.flags.tenementWarm && d.flags.guildWarm)
    lines.push(
      "That stone reached the Rust Districts. Tenement and hall both had heat.",
    );
  else if (d.flags.stoneMoving && d.flags.tenementWarm)
    lines.push(
      "Quarry stone kept the tenement night. The guild hall did not drink.",
    );
  else if (d.flags.stoneMoving && d.flags.guildWarm)
    lines.push("Quarry stone kept the guild hall. The sleepers did not.");
  else if (stone === "clear" || stone === "scarred")
    lines.push(
      "Stone sat in the pit. The road would not carry it, or the hearth would not take it.",
    );
  if (d.flags.hearthHeld && !d.flags.stoneMoving)
    lines.push(
      "A fire in the Rust Districts was banked by hand. The quarry was not its parent.",
    );
  if (d.flags.hearthSeated)
    lines.push("Both flues were seated. The split was a mend, not a favor.");
  if (d.flags.foodLive)
    lines.push(
      "The ward plots were drinking. Food had a parent, and so did a levy.",
    );
  if (d.flags.brickLive && d.flags.kilnLevy)
    lines.push("The kiln set brick. A levy rode the same smoke.");
  else if (d.flags.brickLive && d.flags.stampCut)
    lines.push("The kiln set brick after the stamp was cut. The houses held. The bill did not.");
  else if (d.flags.kilnRefused)
    lines.push("The kiln yard was refused. Nothing was invoiced. Nothing held the night.");
  else if (d.flags.fieldDry && d.flags.brickLive)
    lines.push("A field-dry set the kiln. The gallery did not have to be the parent.");
  if (d.flags.switchJam && !d.flags.switchShunt)
    lines.push("The Switch was jammed. The pit could still look finished. The citadel did not receive that parent.");
  else if (d.flags.switchShunt)
    lines.push("A shunt carried the haul off the books. The weight left. The stamp did not get to see it.");
  else if (d.flags.switchToll)
    lines.push("The Switch passed a haul the stamp could see. A bill rode the same table.");
  if (d.flags.switchGreased) lines.push("The yard plates were greased. A shed became a floor.");
  if (d.flags.paneCharge && d.flags.paneLevy)
    lines.push("The glasshouse melted clear. A levy rode the same smoke.");
  else if (d.flags.paneCharge && d.flags.paneCut)
    lines.push("The glasshouse melted after the stamp was cut. The house held. The bill did not.");
  else if (d.flags.paneRefused)
    lines.push("The glasshouse was refused. Nothing was invoiced. Nothing held the night.");
  else if (d.flags.paneCullet && d.flags.paneCharge)
    lines.push("Cullet melted the glasshouse. The pit did not have to stay the parent.");
  if (d.flags.paneGlass)
    lines.push("A pane from the glasshouse was sat into the lamps. The orrery did not have to make the glass.");
  if (d.flags.plotsRefused)
    lines.push(
      "The plot bed was refused. The levy had nothing to invoice. The ward had less to eat.",
    );
  else if (d.flags.pumpFate && d.flags.seenWard)
    lines.push("The ward plots never took a seated parent.");
  if (d.flags.nessaRefuses)
    lines.push(
      "Nessa's wage stopped when the stall did. She would not front a debt against it.",
    );
  if (d.flags.ashAccess && (d.flags.pumpFate || d.flags.seenWard))
    lines.push(
      "An unbound cut kept the service alley while the ward was unfed.",
    );
  if (d.flags.gearLive)
    lines.push(
      "Rust stock was a child of ore, quench, and fire. None of those parents was a virtue.",
    );
  else if (d.flags.stockRefused)
    lines.push(
      "The forge's parents were left in place. The stock was the thing that was refused.",
    );
  if (d.flags.rustRation && !d.flags.foodLive)
    lines.push(
      "Rust baked a ration because the hall was warm and the ward was not.",
    );
  if (d.flags.bramHoard)
    lines.push(
      "Bram held a cart in the ward. The citadel did not get that load.",
    );
  else if (d.flags.citadelSupplied)
    lines.push(
      "Quarry stone reached the citadel's stores. The road was a parent, not a rumor.",
    );
  if (d.flags.roadDark)
    lines.push(
      "The road lamps were dark. They had been a child of the orrery.",
    );
  if (d.flags.workersKnow)
    lines.push("Wren's diagram of the bellows reached the quarry line.");
  if (d.flags.guardToll)
    lines.push(
      "Citadel plate was unfed. The toll was the missing meal, not a new law.",
    );
  const walker = d.actors.tobin;
  if (walker?.companion && (walker.bond?.accord ?? 50) < 40) {
    lines.push(
      "Tobin walked the whole way. He did not agree. He did not leave.",
    );
  }
  const ash = d.actors.sera;
  if (
    ash?.companion &&
    (ash.bond?.fear ?? 0) >= 20 &&
    (ash.bond?.loyalty ?? 0) > 0
  ) {
    lines.push(
      "Sera stayed beside a choice she was afraid of. The fear was filed. The walking continued.",
    );
  }
  const moth = d.actors.cinder;
  if (moth?.companion && d.flags.cinderBack) {
    lines.push(
      "The reed moth left once. The reed was seated again, and she chose the shadow a second time.",
    );
  } else if (moth?.companion) {
    if (d.flags.bellowsLive === false)
      lines.push(
        "The reed moth traveled with a stopped lung. She stayed restless. She stayed.",
      );
    else if (d.flags.foodLive)
      lines.push(
        "The reed moth learned the plots. When the ward ate, she ranged farther.",
      );
    else
      lines.push(
        "The reed moth chose a shadow and kept it. The choosing was hers.",
      );
  } else if (d.flags.cinderLeft) {
    lines.push(
      "The reed moth left a shadow she had chosen. The lung, or the heat, was a fact she would not be dragged through.",
    );
  } else if (moth && d.flags.cinderFed) {
    lines.push(
      "Scrap was left at the reed. The moth ate. She did not leave her weather.",
    );
  }
  if (d.flags.cinderDarkOk && moth?.companion) {
    lines.push(
      "The moth crossed a dark road because she chose to. The dark did not become safe.",
    );
  }
  if (d.flags.cinderSpireOk && moth?.companion) {
    lines.push(
      "The moth heard the Spire and came anyway. She did not call the sound weather.",
    );
  } else if (d.flags.cinderSpireStay) {
    lines.push(
      "The moth stayed at the Spire mouth. The road was the last weather she wanted.",
    );
  }
  if (d.flags.larkSouth)
    lines.push(
      "Lark left the high walk when the lamps failed. The south cut kept a runner.",
    );
  if (d.flags.pipHome)
    lines.push(
      "A child slept in the service cut while the ward was unfed, and was gone from it when the plots drank.",
    );
  if (d.flags.pipShown)
    lines.push(
      "Pip followed the moth along a drip the grate still remembered. The route was a refusal, not a door.",
    );
  if (d.flags.dossShift)
    lines.push(
      "Doss stopped sleeping on the reed. The lung had stopped making weather.",
    );
  else if (d.flags.dossSpan)
    lines.push(
      "Doss left a long iron under the reed. It was a reach, not a wage.",
    );
  else if (d.flags.dossMet && d.flags.bellowsLive !== false)
    lines.push("Doss kept the reed. The weather was still a bed.");
  if (d.flags.gaugeCut)
    lines.push(
      "A pocket feed in the Sinks was cut. The gauge face had been a costume. A drowned servo answered.",
    );
  else if (d.flags.gaugeRead)
    lines.push(
      "A gauge in the Sinks was a costume. The parent sat behind the face.",
    );
  if (d.flags.stillLicensed)
    lines.push(
      "An ash still was licensed. The cup stayed a trickle, and the alley had a parent that was not a raid.",
    );
  else if (d.flags.stillBroken)
    lines.push(
      "An ash still was broken while the ward was dry. The alley lost its cup.",
    );
  if (d.flags.crewStood)
    lines.push(
      "The night crew stood down. The colossus throat was still a parent of the cable.",
    );
  else if (d.flags.crewFled)
    lines.push(
      "The night crew left the winch. They would not stand under a live throat.",
    );
  else if (
    d.flags.winchCut &&
    (!d.actors.crew1?.alive || !d.actors.crew2?.alive)
  ) {
    lines.push(
      "The night crew fought. The throat was already still, and the winch was the parent they had left.",
    );
  }
  if (d.flags.adaPlate || (d.flags.adaMet && d.flags.foodLive))
    lines.push(
      "Ada ate because the plots drank. She did not call the levy a gift.",
    );
  else if (d.flags.adaMet && d.flags.plotsRefused)
    lines.push("Ada kept an empty plate. The refusal was still in the room.");
  if (d.flags.pimCount || (d.flags.pimMet && d.flags.quarryStone === "clear"))
    lines.push(
      "Pim stood on the count after the slab missed. The fear had stood down with it.",
    );
  else if (d.flags.pimMet && d.flags.quarryStone === "scarred")
    lines.push("Pim stayed off the grade. A name was already on the stone.");
  if (d.flags.sarnMet && d.flags.guardToll && d.flags.citadelFate !== "sever")
    lines.push("Sarn's kitchen was unfed. The toll was the missing meal.");
  if (d.flags.sarnMet && d.flags.citadelSupplied)
    lines.push(
      "Sarn cooked from stone that had crossed the road. She did not thank the rank.",
    );
  if (d.flags.sarnMet && d.flags.citadelFate === "sever")
    lines.push(
      "Sarn kept the kitchen after the lifts died. The soup was not a consolation.",
    );
  if (d.flags.driftBed || (d.flags.driftMet && d.flags.hollowWarm))
    lines.push("Drift slept in the hollow. The weather was still being sent.");
  else if (
    d.flags.driftMet &&
    d.flags.tundraWalked &&
    d.flags.hollowWarm === false
  )
    lines.push("Drift stayed on the edge. The hollow had no weather.");
  if (d.flags.tundraWalked && d.flags.iceCut)
    lines.push(
      "The glaze was cut. The hollow went cold even if the orrery was still sending. The ice kept a harder bill.",
    );
  else if (d.flags.tundraWalked && d.flags.hollowWarm === false)
    lines.push(
      "The tundra hollow went cold with the orrery. The ice kept the middle of the walk.",
    );
  else if (d.flags.tundraWalked && d.flags.hollowWarm)
    lines.push(
      "The brass hollow stayed warm. The orrery was still sending weather downhill.",
    );
  if (d.flags.iceSpan)
    lines.push(
      "The ice span was seated. The middle of the tundra stopped billing every step.",
    );
  if (d.flags.cartPinned)
    lines.push(
      "The waystation brake stayed pinned. Stone could leave the pit and still not become ore.",
    );
  else if (d.flags.cartEase)
    lines.push(
      "The waystation brake was eased. The cart did not wait for a speech.",
    );
  if (d.flags.washSpill)
    lines.push(
      "The tenement wash drank the quench. The forge was the child that went dry.",
    );
  else if (d.flags.washShared)
    lines.push(
      "The wash was shared. Sleepers and forge both drank, when the gallery had anything to send.",
    );
  if (d.flags.mossMet && d.flags.cartPinned)
    lines.push(
      "Moss stayed on the pinned brake. She did not call the hunger downstream a virtue.",
    );
  else if (d.flags.mossMet && d.flags.cartEase)
    lines.push("Moss watched the cart leave. She did not go with the speech.");
  if (d.actors.tobin?.alive && !d.actors.tobin.companion && d.flags.metTobin) {
    lines.push(
      "Tobin was not on the last walk. The bench in the Sinks still had a keeper.",
    );
  }
  if (
    d.actors.wren?.alive &&
    !d.actors.wren.companion &&
    (d.flags["seen:sinks"] || d.flags.workersKnow)
  ) {
    lines.push(
      d.flags.workersKnow
        ? "Wren sent the diagram and stayed. The line moved without her feet."
        : "Wren kept the lines where she found them. The company was not required.",
    );
  }
  if (
    d.flags["seen:rust"] &&
    d.actors.sera?.alive &&
    !d.actors.sera.companion
  ) {
    lines.push(
      "Sera stayed in the hall. The standard was watched from there, not from the road.",
    );
  }
  if (
    d.flags["seen:rust"] &&
    d.actors.mara?.alive &&
    !d.actors.mara.companion
  ) {
    lines.push(
      "Mara kept the nights in Rust. They were not edited for the walk.",
    );
  }
  const names = ["tobin", "wren", "sera", "mara"]
    .filter((id) => d.actors[id]?.companion)
    .map((id) => d.actors[id].name);
  if (names.length) {
    lines.push(
      `${names.join(", ")} ${names.length === 1 ? "was" : "were"} still walking when the baseline was answered. Agreement was not the price of the company.`,
    );
  }
  if (Number(d.flags["visits:haven"] ?? 0) > 1)
    lines.push(
      "Oakhaven was walked more than once. The second visit was not the same pipe.",
    );
  if (Number(d.flags["visits:quarry"] ?? 0) > 1)
    lines.push(
      "The quarry was stood in again. The cable's children had already moved.",
    );
  if (d.flags.roadBypass)
    lines.push(
      "A south walk was known. The lamps were not required for every foot.",
    );
  if (d.flags.rillSpoken)
    lines.push(
      "Rill was named off the grade. The crane was not the only record.",
    );
  const wren = d.actors.wren;
  if (wren?.companion && (wren.bond?.trust ?? 0) >= 48)
    lines.push(
      "Wren carried the line the whole way. The diagram was not a leash.",
    );
  lines.push(
    "The ledger does not say you were right. It says what held, and what you decided was yours to cut.",
  );
  return lines;
}
function applyEffects(d, effects) {
  if (!effects) return;
  for (const e of effects) {
    if (d.phase !== "play" && e.op !== "epilogue") continue;
    if (e.op === "flag") {
      d.flags[e.key] = e.value;
      if (e.key === "varrFate") releasePending(d, String(e.value));
    } else if (e.op === "xp") grantXp(d, e.n);
    else if (e.op === "scrip") d.scrip = Math.max(0, d.scrip + e.n);
    else if (e.op === "item") addItem(d, e.id, e.n ?? 1);
    else if (e.op === "take") takeItem(d, e.id, e.n ?? 1);
    else if (e.op === "journal") journal(d, e.id, e.title, e.text, e.status);
    else if (e.op === "log") addLog(d, e.text);
    else if (e.op === "heal") healActor(d, e.id, e.n);
    else if (e.op === "hurt") applyHp(d, e.id, e.n, false);
    else if (e.op === "discipline") {
      if (!d.disciplines.includes(e.id)) {
        d.disciplines.push(e.id);
        addLog(d, `Discipline opens: ${e.id}.`);
        if (e.id === "continuity") noteTrace(d, "continuity");
      }
    } else if (e.op === "rep")
      d.reputation[e.faction] = clamp(d.reputation[e.faction] + e.n, -100, 100);
    else if (e.op === "aggro") {
      for (const id of e.ids) {
        if (d.flags.duel && id === "rel1") continue;
        const a = d.actors[id];
        if (a) a.aggro = e.on;
      }
    } else if (e.op === "hostile") {
      const a = d.actors[e.id];
      if (a) a.hostile = e.on;
    } else if (e.op === "kill") {
      const a = d.actors[e.id];
      if (a) {
        a.alive = false;
        a.hp = 0;
        a.companion = false;
      }
    } else if (e.op === "recruit") {
      const a = d.actors[e.id];
      if (!a) continue;
      const creature = a.template === "cinder";
      for (const o of Object.values(d.actors)) {
        if (o.id === a.id) continue;
        if (creature && o.template !== "cinder") continue;
        if (!creature && o.template === "cinder") continue;
        o.companion = false;
      }
      a.companion = true;
      a.alive = true;
      noteVerb(d, "rescue");
      placeCompanion(d);
    } else if (e.op === "dismiss") {
      const a = d.actors[e.id];
      if (!a) continue;
      a.companion = false;
      a.mapId = a.home.mapId;
      a.x = a.home.x;
      a.y = a.home.y;
    } else if (e.op === "pin") d.pinned = e.text;
    else if (e.op === "rest") {
      d.player.hp = Math.min(
        d.player.maxHp,
        d.player.hp + Math.ceil(d.player.maxHp * 0.4),
      );
      d.focus = focusMax(d);
    } else if (e.op === "goto") {
      d.mapId = e.map;
      d.player.mapId = e.map;
      d.player.x = e.x;
      d.player.y = e.y;
      placeCompanion(d);
      d.path = [];
    } else if (e.op === "spawn") {
      const base = spawnActor({
        id: e.id,
        template: e.template,
        map: d.mapId,
        x: e.x,
        y: e.y,
      });
      base.hostile = true;
      base.aggro = true;
      base.nodes = structuredClone(TEMPLATES[e.template].nodes);
      d.actors[e.id] = base;
    } else if (e.op === "combat") startCombat(d, e.ids);
    else if (e.op === "arrive") arrive(d);
    else if (e.op === "epilogue") {
      d.ending = e.ending;
      d.epilogue = buildEpilogue(d, e.ending);
      d.phase = "epilogue";
      d.combat = null;
      d.dialogue = null;
      d.panel = "none";
    }
  }
  if (d.phase === "play") reconcileWorld(d);
}
function arrive(d) {
  const id = d.pendingMap;
  if (!id || !MAPS[id]) return;
  const lx = d.flags.landX;
  const ly = d.flags.landY;
  delete d.flags.landX;
  delete d.flags.landY;
  d.mapId = id;
  d.player.mapId = id;
  d.player.x = typeof lx === "number" ? lx : MAPS[id].entry.x;
  d.player.y = typeof ly === "number" ? ly : MAPS[id].entry.y;
  d.pendingMap = null;
  d.path = [];
  d.intent = null;
  d.dialogue = null;
  d.panel = "none";
  placeCompanion(d);
  if (id === "haven") d.flags.seenWard = true;
  const visits = Number(d.flags[`visits:${id}`] ?? 0) + 1;
  d.flags[`visits:${id}`] = visits;
  if (visits > 1) {
    const back = returnLine(d, id);
    if (back) addLog(d, back);
  }
  addLog(d, `You arrive at ${MAPS[id].name}.`);
  if (id === "kiln" && visits === 1) {
    addLog(d, "Clay underfoot. The flue is quiet. Water, if it comes, will not come from this yard.");
  }
  if (id === "switch" && visits === 1) {
    addLog(d, "Plates underfoot. The table is still passing. Grease is not. A stamp is watching the weight.");
  }
  if (id === "pane" && visits === 1) {
    addLog(d, "Sand underfoot. The flue is quiet. Heat, if it comes, will not have to come from this pit. A stamp is watching the smoke.");
  }
  if (id === "tundra" && !d.flags.tundraWalked) {
    d.flags.tundraWalked = true;
    addLog(
      d,
      "The brass ice is a floor with an opinion. The edges of the walk are quieter than the middle.",
    );
  }
}
function returnLine(d, id) {
  if (id === "haven") {
    if (d.flags.foodLive && d.flags.levyLive) {
      const plate = d.flags.adaPlate
        ? " Ada is at the plots with a plate."
        : "";
      return d.flags.pipHome
        ? `Oakhaven again. The plots are drinking, the levy is drinking with them, and the child is not in the cut.${plate}`
        : `Oakhaven again. The plots are drinking, and the levy is drinking with them.${plate}`;
    }
    if (d.flags.plotsRefused)
      return d.flags.adaMet
        ? "Oakhaven again. The beds were refused. Ada still carries the empty plate."
        : "Oakhaven again. The beds were refused. Hunger and a dead bill arrived together.";
    if (d.flags.nessaRefuses)
      return "Oakhaven again. Nessa's stall is dark. The parent is not in this ward.";
    if (d.flags.ashAccess)
      return "Oakhaven again. The service cut is in use. The ward is still unfed.";
    if (d.flags.stillLicensed)
      return "Oakhaven again. Vetch is outside the alley. The license outlived the dryness.";
    if (d.flags.stillBroken)
      return "Oakhaven again. The still is broken. The cup did not come back.";
    return "Oakhaven again. The cistern is still a child. Look upstream.";
  }
  if (id === "sinks") {
    if (d.flags.bellowsLive === false) {
      return d.flags.dossShift
        ? "The Sinks again. The lung is stopped, and Doss is not on the reed."
        : "The Sinks again. The lung is stopped. Downstream already knows.";
    }
    if (d.flags.pumpFate)
      return "The Sinks again. The pump's answer is still in pipes that are not in this room.";
    if (d.flags.gaugeCut)
      return "The Sinks again. The west pocket is dry. The gauge face was never the parent.";
    if (d.flags.gaugeRead)
      return "The Sinks again. The gauge in the west pocket is still a costume.";
    return "The Sinks again. The bench kept your place.";
  }
  if (id === "quarry") {
    if (d.flags.cartPinned)
      return "The quarry again. Stone can leave the pit. The waystation is holding it, so the forge will not call it ore.";
    if (d.flags.crewStood)
      return "The quarry again. Holt's crew is down. The throat was the reason, not a speech.";
    if (d.flags.crewFled)
      return "The quarry again. The night crew left. They would not stand under a live throat.";
    if (d.flags.winchCut && (!d.actors.crew1?.alive || !d.actors.crew2?.alive))
      return "The quarry again. The winch is cut. The crew answered because the throat was already still.";
    if (d.flags.oreSound === false)
      return "The quarry again. Sound ore is gone. The forge will notice before the pit makes a speech.";
    if (d.flags.quarryStone === "clear") {
      return d.flags.pimCount
        ? "The quarry again. The slab is down, it missed the count, and Pim is standing on it."
        : "The quarry again. The slab is down, and it missed the count.";
    }
    if (d.flags.quarryStone === "scarred" || d.flags.workerHurt)
      return "The quarry again. The slab is down. A name stayed with it.";
    return "The quarry again. The cable still has a parent, or it doesn't.";
  }
  if (id === "rust") {
    if (d.flags.cartPinned && d.flags.stoneMoving)
      return "Rust again. The pit sent stone. The yard does not have it. The brake on the road is still holding the cart.";
    if (d.flags.washSpill)
      return "Rust again. The wash is drinking the quench. The forge is the child that went dry.";
    if (d.flags.washShared && d.flags.washLive)
      return "Rust again. Sleepers and forge both have a drink. Neither one is a favor.";
    if (d.flags.gearLive)
      return "Rust again. Stock is live. Ore, quench, and fire are all still parents.";
    if (d.flags.stockRefused)
      return "Rust again. The stock was refused. The parents were left standing.";
    if (d.flags.rustRation && !d.flags.foodLive)
      return "Rust again. The hall is baking because the ward is not.";
    return "Rust again. Heat here is still a child of the haul.";
  }
  if (id === "road") {
    if (d.flags.cartPinned)
      return "The stack road again. Moss is on the pinned brake. Rust is missing a parent the pit thinks it sent.";
    if (d.flags.cartEase)
      return "The stack road again. The brake was eased. The weight left before the speech.";
    if (d.flags.larkSouth)
      return "The stack road again. Lark is on the south cut. The high walk belongs to the dark.";
    if (d.flags.roadDark)
      return "The stack road again. The lamps are dark. They were a child of the orrery.";
    if (d.flags.roadBypass)
      return "The stack road again. The south walk is still a path the lamps do not own.";
    return "The stack road again. The districts are rooms of one machine.";
  }
  if (id === "tundra") {
    if (d.flags.iceCut)
      return "The tundra again. The glaze is cut. The hollow is cold even if a clock elsewhere is still turning.";
    if (d.flags.iceSpan)
      return "The tundra again. The span is seated. The middle of the ice stopped billing the walk.";
    if (d.flags.driftBed)
      return "The tundra again. Drift is in the hollow. The weather is still being sent.";
    if (d.flags.hollowWarm === false && d.flags.driftMet)
      return "The tundra again. Drift is on the edge. The hollow has no weather.";
    if (d.flags.roadDark)
      return "The tundra again. The ice does not care that the lamps failed.";
    return "The tundra again. The citadel is still uphill of the same siphon.";
  }
  if (id === "citadel") {
    if (d.flags.citadelFate === "sever")
      return d.flags.bufferHeld
        ? "The citadel again. The siphon is cut. One ward kept the night. The rest did not."
        : "The citadel again. The siphon is cut. The road lost that parent.";
    if (d.flags.citadelFate === "seize")
      return "The citadel again. The rank engine has a hand on it. The shape did not become innocent.";
    if (d.flags.guardToll)
      return d.flags.sarnMet
        ? "The citadel again. Sarn's kitchen is unfed. The toll is still the missing meal."
        : "The citadel again. The plate is unfed. The toll is the missing meal.";
    return "The citadel again. The orrery, the lamps, and the rank are still one graph.";
  }
  if (id === "spire")
    return "The Spire again. The question did not grow a baseline while you were gone.";
  if (id === "kiln") {
    if (d.flags.kilnRefused) return "The kiln again. The beds were refused. The levy has nothing, and neither do the walls.";
    if (d.flags.brickLive && d.flags.kilnLevy && !d.flags.kilnShop)
      return "The kiln again. Brick is up. Cress is invoicing it. Jun still cannot sell.";
    if (d.flags.brickLive && d.flags.stampCut) return "The kiln again. The stamp is a hole. The set, if it holds, does not owe her.";
    if (d.flags.brickLive && d.flags.kilnShop) return "The kiln again. The board can buy. Look at whether the levy stayed.";
    if (d.flags.fieldDry && !d.flags.brickLive) return "The kiln again. The field-dry is in. The set still wants clay and a bed.";
    return "The kiln again. Clay is local. The set is still waiting on a parent that is not.";
  }
  if (id === "switch") {
    if (d.flags.switchJam && !d.flags.switchShunt) return "The Switch again. The table is jammed. Downstream already lost this parent.";
    if (d.flags.switchShunt && d.flags.switchGreased) return "The Switch again. The haul is off the books, and Wick is not on the plates.";
    if (d.flags.switchShunt) return "The Switch again. Weight is leaving where Rue cannot invoice it.";
    if (d.flags.switchToll && !d.flags.switchShop) return "The Switch again. The haul is on the books. The shed is not allowed to sell.";
    if (d.flags.switchShop) return "The Switch again. The shed can sell. Look at whether the bill stayed.";
    if (d.flags.switchGreased) return "The Switch again. The plates are quiet. The haul has not been answered.";
    return "The Switch again. The table still passes. The plates still bill a step.";
  }
  if (id === "pane") {
    if (d.flags.paneRefused) return "The Pane again. The beds were refused. The levy has nothing, and neither does the glass.";
    if (d.flags.paneCharge && d.flags.paneLevy && !d.flags.paneShop)
      return "The Pane again. The melt is up. Ness is invoicing it. The bench still cannot sell.";
    if (d.flags.paneCharge && d.flags.paneCut) return "The Pane again. The stamp is a hole. The melt, if it holds, does not owe her.";
    if (d.flags.paneCharge && d.flags.paneShop) return "The Pane again. The bench can sell. Look at whether the levy stayed.";
    if (d.flags.paneSpilled && !d.flags.paneCharge) return "The Pane again. The pit is spilled. Cullet, or a seated pit, is still a parent you have not used.";
    return "The Pane again. Sand is local. The melt is still waiting on a parent that is not.";
  }
  return null;
}
function depart(d) {
  const mouth = mouthAt(d.mapId, d.player.x, d.player.y);
  if (!mouth) {
    d.panel = "map";
    return;
  }
  if (mouth.need && !regionOpen(d, mouth.need)) {
    addLog(d, mouth.deny);
    d.path = [];
    return;
  }
  const intoDark =
    Boolean(d.flags.roadDark) && (mouth.dark || mouth.to === "road");
  if (intoDark && d.actors.cinder?.companion && !d.flags.cinderDarkOk) {
    d.dialogue = { convo: "cinder-dark", node: "start" };
    d.panel = "none";
    d.path = [];
    play("talk");
    return;
  }
  if (
    mouth.to === "spire" &&
    d.actors.cinder?.companion &&
    !d.flags.cinderSpireOk &&
    !d.flags.cinderSpireStay
  ) {
    d.dialogue = { convo: "cinder-spire", node: "start" };
    d.panel = "none";
    d.path = [];
    play("talk");
    return;
  }
  d.pendingMap = mouth.to;
  d.flags.landX = mouth.tx;
  d.flags.landY = mouth.ty;
  d.panel = "none";
  d.path = [];
  d.flags.traveled = true;
  arrive(d);
}
function freshActors() {
  const actors = {};
  for (const s of SPAWNS) actors[s.id] = spawnActor(s);
  return actors;
}
function freshMachines() {
  const machines = {};
  for (const m of MACHINES) machines[m.id] = structuredClone(m);
  return machines;
}
function regionOpen(d, need) {
  if (!need) return true;
  if (need === "act1") {
    const slipped = Boolean(
      d.flags.pumpFate && (d.flags.checkpointSpoke || d.flags.usedCrawl),
    );
    return Boolean(d.flags.act1 || slipped);
  }
  return Boolean(d.flags[need]);
}
function brace(d) {
  if (!d.combat || currentId(d) !== "player") return;
  if (d.player.ap < 1) {
    addLog(d, "Not enough action to set your weight.");
    return;
  }
  d.player.ap = 0;
  d.player.guarding = true;
  noteVerb(d, "brace");
  addLog(
    d,
    "You set your weight over the lens. The next blow will find iron, not skin.",
  );
  play("ui");
  burst(d.player.x, d.player.y, "brace");
  endPlayerTurn(d);
}
function endPlayerTurn(d) {
  if (!d.combat || currentId(d) !== "player") return;
  advance(d);
  beginTurn(d);
}
export {
  LENS_NAME,
  PRACTICE_VERBS,
  VERB_LENS,
  actorAt,
  actorById,
  actorFate,
  addItem,
  addLog,
  applyEffects,
  applyHp,
  armorCount,
  arrive,
  askHistory,
  auditTargetNodes,
  becoming,
  beginTurn,
  bfs,
  boardIntents,
  brace,
  buildEpilogue,
  carryMax,
  carryWeight,
  checkVision,
  comp,
  companionAp,
  confidenceOf,
  currentNode,
  depart,
  didDie,
  didEscape,
  didPreserve,
  didStandDown,
  didUseVerb,
  dismantle,
  dist,
  districtYield,
  endPlayerTurn,
  ensureMachines,
  factionFacts,
  fillText,
  focusMax,
  forecast,
  freezeIntents,
  freshActors,
  freshMachines,
  gait,
  grantXp,
  habitLine,
  hasEncounter,
  hasItem,
  healActor,
  isExit,
  keyOf,
  lensReads,
  machineAt,
  memoryConvo,
  mendNode,
  movePlayer,
  nodeActive,
  nodeLive,
  noteEscape,
  noteField,
  noteOnce,
  noteVerb,
  openAudit,
  openingLine,
  pathNear,
  pathTo,
  pinOnHit,
  planFits,
  polymorph,
  practiceBand,
  reconcileWorld,
  refreshTurn,
  refuseWalk,
  regionOpen,
  replyVisible,
  runSpecial,
  seamMark,
  seamState,
  slipEncounter,
  spendSkill,
  takePerk,
  standDown,
  startCombat,
  strike,
  takeItem,
  tendencies,
  unmendNode,
  useItem,
  walkable,
  wasBaselineLost,
  wasSevered,
  weaponOf,
  weaponsDark,
};
