import type { Data, DistrictReading, GNode, WorldSnapshot } from "./types";

/** Relationships the city is allowed to have. A new chain is new rows, not a new reconciler. */
export type Rel =
  | "supplies"
  | "powers"
  | "supports"
  | "depends"
  | "regulates"
  | "protects"
  | "transports"
  | "communicates"
  | "controls"
  | "consumes"
  | "blocks"
  | "exposes"
  | "stabilizes"
  | "destabilizes";

export type Gate = "require" | "alt" | "block" | "lack" | "note";

export interface WorldNode {
  id: string;
  name: string;
  district: string;
  kind: "machine" | "service" | "person" | "route" | "faction" | "store" | "event";
  /** Roots are read from the ledger. Everything else is derived from edges. */
  root?: boolean;
  about: string;
}

export interface WorldEdge {
  id: string;
  rel: Rel;
  from: string;
  to: string;
  /** note: documented, not a gate. The bellows → pressure link is one of these, because pressure is already decided upstream. */
  gate: Gate;
  altGroup?: string;
}

export const WORLD_NODES: WorldNode[] = [
  { id: "bellows", name: "Sinks bellows", district: "sinks", kind: "machine", root: true, about: "The lung the pump drinks." },
  { id: "pressure", name: "Gallery pressure", district: "sinks", kind: "machine", root: true, about: "What the pump can send while the lung is seated." },
  { id: "clean", name: "Seated water", district: "sinks", kind: "service", root: true, about: "Water a stall will call a drink." },
  { id: "stamped", name: "Provisional stamp", district: "haven", kind: "service", root: true, about: "A clerk's word for brown water." },
  { id: "stall", name: "Stall leg", district: "haven", kind: "service", root: true, about: "The market side of the cistern." },
  { id: "clinic", name: "Clinic leg", district: "haven", kind: "service", root: true, about: "The stitcher's tap." },
  { id: "bed-open", name: "Plot bed", district: "haven", kind: "machine", root: true, about: "The local bed. Water is not enough if this is refused." },
  { id: "watch", name: "Road watch", district: "sinks", kind: "faction", root: true, about: "A squad in the road mouth." },
  { id: "moving", name: "Stone on the road", district: "road", kind: "route", root: true, about: "Quarry stone that has a stair and no squad." },
  { id: "colossus", name: "Colossus breath", district: "quarry", kind: "machine", root: true, about: "The turbine that parents the crane cable." },
  { id: "heat", name: "Fire bed", district: "rust", kind: "machine", root: true, about: "The hearth's bed, whoever parents it." },
  { id: "guild", name: "Guild flue", district: "rust", kind: "service", root: true, about: "Heat in the hall." },
  { id: "sleepers", name: "Sleeper flues", district: "rust", kind: "service", root: true, about: "Heat in the tenement." },
  { id: "siphon", name: "Worker siphon", district: "citadel", kind: "machine", root: true, about: "What the orrery drinks." },
  { id: "orrery", name: "Orrery drive", district: "citadel", kind: "machine", root: true, about: "The citadel clock." },
  { id: "citadel-open", name: "Citadel reached", district: "citadel", kind: "event", root: true, about: "The ranking floor is in play." },
  { id: "told", name: "Wren's diagram", district: "sinks", kind: "person", root: true, about: "Whether the line was told about the lung." },
  { id: "plots-refused", name: "Refused plots", district: "haven", kind: "event", root: true, about: "Silas left the beds down on purpose." },
  { id: "stock-refused", name: "Refused stock", district: "rust", kind: "event", root: true, about: "Silas would not let the forge finish gear." },
  { id: "chute-spill", name: "Chute spill", district: "quarry", kind: "machine", root: true, about: "A local grade cut. Ore leaves the road and not the forge." },
  { id: "lamp-dark", name: "Broken lamp glass", district: "citadel", kind: "machine", root: true, about: "A local cut on a child of the orrery." },
  { id: "hoard", name: "Held cart", district: "haven", kind: "person", root: true, about: "Bram held the load for the ward." },
  { id: "shop", name: "Stall shop", district: "haven", kind: "store", about: "Nessa can sell." },
  { id: "income", name: "Nessa's income", district: "haven", kind: "person", about: "What the shop pays her." },
  { id: "care", name: "Clinic care", district: "haven", kind: "service", about: "Odell has a live tap." },
  { id: "inlet", name: "Plot inlet", district: "haven", kind: "machine", about: "Clean water arriving at the beds." },
  { id: "food", name: "Ward food", district: "haven", kind: "service", about: "What the plots yield, if the bed was allowed to." },
  { id: "levy", name: "Plot levy", district: "haven", kind: "faction", about: "A bill that rides on restored food." },
  { id: "ash", name: "Alley access", district: "haven", kind: "faction", about: "Who uses the ward when it is not fed." },
  { id: "ore", name: "Sound ore", district: "quarry", kind: "route", about: "Stone the colossus is still helping to carry, and the chute has not spilled." },
  { id: "quench", name: "Forge quench", district: "rust", kind: "machine", about: "Gallery water the forge can drink." },
  { id: "stock", name: "Forge stock", district: "rust", kind: "machine", about: "Gear, if ore, quench, and fire all hold, and Silas did not refuse it." },
  { id: "gear", name: "Gear on the bench", district: "rust", kind: "store", about: "What Ives can actually hand over." },
  { id: "ration", name: "Rust ration", district: "rust", kind: "service", about: "Hall heat baking because the ward is hungry." },
  { id: "supply", name: "Citadel supply", district: "citadel", kind: "route", about: "Cargo that was not held back in the ward." },
  { id: "fed", name: "Guard meal", district: "citadel", kind: "service", about: "Plate that has food or cargo." },
  { id: "toll", name: "Guard toll", district: "citadel", kind: "faction", about: "A price that appears when the plate is unfed." },
  { id: "power", name: "Citadel power", district: "citadel", kind: "machine", about: "Siphon and orrery together." },
  { id: "lamps", name: "Road lamps", district: "road", kind: "service", about: "Light on the stack road." },
  { id: "dark", name: "Dark road", district: "road", kind: "event", about: "The lamps' absence, once the citadel is in play." },
  { id: "loose", name: "Loose sentry", district: "citadel", kind: "faction", about: "A clock that stopped, so the watch has no hour." },
  { id: "workers", name: "Line diagram", district: "quarry", kind: "person", about: "Wren's reading of the lung, carried to the pit." },
];

export const WORLD_EDGES: WorldEdge[] = [
  { id: "bellows-pressure", rel: "supplies", from: "bellows", to: "pressure", gate: "note" },
  { id: "colossus-crane", rel: "supports", from: "colossus", to: "moving", gate: "note" },
  { id: "siphon-orrery", rel: "powers", from: "siphon", to: "orrery", gate: "note" },
  { id: "heat-stone", rel: "supplies", from: "moving", to: "heat", gate: "note" },
  { id: "stall-shop", rel: "supplies", from: "stall", to: "shop", gate: "require" },
  { id: "clean-shop", rel: "regulates", from: "clean", to: "shop", gate: "alt", altGroup: "potable" },
  { id: "stamp-shop", rel: "regulates", from: "stamped", to: "shop", gate: "alt", altGroup: "potable" },
  { id: "shop-income", rel: "supplies", from: "shop", to: "income", gate: "require" },
  { id: "clinic-care", rel: "supplies", from: "clinic", to: "care", gate: "require" },
  { id: "pressure-inlet", rel: "supplies", from: "pressure", to: "inlet", gate: "require" },
  { id: "clean-inlet", rel: "regulates", from: "clean", to: "inlet", gate: "require" },
  { id: "refuse-inlet", rel: "blocks", from: "plots-refused", to: "inlet", gate: "block" },
  { id: "inlet-food", rel: "supplies", from: "inlet", to: "food", gate: "require" },
  { id: "bed-food", rel: "supports", from: "bed-open", to: "food", gate: "require" },
  { id: "food-levy", rel: "exposes", from: "food", to: "levy", gate: "require" },
  { id: "lack-shop-ash", rel: "exposes", from: "shop", to: "ash", gate: "lack" },
  { id: "lack-food-ash", rel: "exposes", from: "food", to: "ash", gate: "lack" },
  { id: "watch-ash", rel: "blocks", from: "watch", to: "ash", gate: "block" },
  { id: "move-ore", rel: "transports", from: "moving", to: "ore", gate: "require" },
  { id: "colossus-ore", rel: "supports", from: "colossus", to: "ore", gate: "require" },
  { id: "spill-ore", rel: "blocks", from: "chute-spill", to: "ore", gate: "block" },
  { id: "pressure-quench", rel: "supplies", from: "pressure", to: "quench", gate: "require" },
  { id: "ore-stock", rel: "supplies", from: "ore", to: "stock", gate: "require" },
  { id: "quench-stock", rel: "consumes", from: "quench", to: "stock", gate: "require" },
  { id: "heat-stock", rel: "powers", from: "heat", to: "stock", gate: "require" },
  { id: "refuse-stock", rel: "blocks", from: "stock-refused", to: "stock", gate: "block" },
  { id: "stock-gear", rel: "supplies", from: "stock", to: "gear", gate: "require" },
  { id: "guild-ration", rel: "supplies", from: "guild", to: "ration", gate: "require" },
  { id: "food-ration", rel: "stabilizes", from: "food", to: "ration", gate: "lack" },
  { id: "move-supply", rel: "transports", from: "moving", to: "supply", gate: "require" },
  { id: "hoard-supply", rel: "blocks", from: "hoard", to: "supply", gate: "block" },
  { id: "supply-fed", rel: "supplies", from: "supply", to: "fed", gate: "alt", altGroup: "meal" },
  { id: "food-fed", rel: "supplies", from: "food", to: "fed", gate: "alt", altGroup: "meal" },
  { id: "open-toll", rel: "depends", from: "citadel-open", to: "toll", gate: "require" },
  { id: "fed-toll", rel: "stabilizes", from: "fed", to: "toll", gate: "lack" },
  { id: "siphon-power", rel: "powers", from: "siphon", to: "power", gate: "require" },
  { id: "orrery-power", rel: "powers", from: "orrery", to: "power", gate: "require" },
  { id: "power-lamps", rel: "powers", from: "power", to: "lamps", gate: "require" },
  { id: "glass-lamps", rel: "blocks", from: "lamp-dark", to: "lamps", gate: "block" },
  { id: "lamps-dark", rel: "destabilizes", from: "lamps", to: "dark", gate: "lack" },
  { id: "open-dark", rel: "depends", from: "citadel-open", to: "dark", gate: "require" },
  { id: "power-loose", rel: "controls", from: "power", to: "loose", gate: "lack" },
  { id: "open-loose", rel: "depends", from: "citadel-open", to: "loose", gate: "require" },
  { id: "told-workers", rel: "communicates", from: "told", to: "workers", gate: "require" },
];

interface Beat {
  id: string;
  district: string;
  open: string;
  close: string;
  voice?: { who: string; open: string; close: string };
}

const BEATS: Beat[] = [
  {
    id: "food",
    district: "haven",
    open: "The ward plots take the water. Food has a parent that is not a local well.",
    close: "The ward plots dry. Food was a child of that water, and the child is gone.",
    voice: {
      who: "tobin",
      open: "Tobin hears the plots take. He calls it maintenance. He does not call it enough.",
      close: "Tobin says the lung is the parent. The plots are just where the dryness became a person.",
    },
  },
  {
    id: "shop",
    district: "haven",
    open: "Nessa's stall can sell. The wage is a child of the stall leg and water she will name.",
    close: "Nessa's stall goes dark. She will not front a debt against a parent that stopped.",
    voice: {
      who: "wren",
      open: "Wren says the stall was never the parent. It is drinking. Ask what it is drinking from.",
      close: "Wren says the stall was never the parent. Look at the lung.",
    },
  },
  {
    id: "levy",
    district: "haven",
    open: "Quill can file a levy on the plots. Restoring food also restored a bill.",
    close: "The levy has nothing to invoice. The plots are not a civic parent right now.",
    voice: {
      who: "sera",
      open: "Sera says you restored a bill. Food and a levy arrived on the same pipe.",
      close: "Sera says the bill died with the plots. Hunger came with it. She will not pick your sentence.",
    },
  },
  {
    id: "ash",
    district: "haven",
    open: "The stall is dark and the plots are dead. An unbound cut is using the service alley.",
    close: "The service alley loses its unbound traffic. The ward is feeding something again.",
  },
  {
    id: "gear",
    district: "rust",
    open: "The Rust forge takes ore, quench, and fire. Stock is a grandchild of the quarry and the Sinks.",
    close: "The Rust forge loses a parent. Stock stops. The bench will notice before anyone makes a speech about it.",
    voice: {
      who: "sera",
      open: "Sera watches the stock come up. She does not pick a rifle up.",
      close: "Sera says a forge without stock is not a tragedy until you know which parent you meant to kill.",
    },
  },
  {
    id: "ration",
    district: "rust",
    open: "The guild hall is warm and the ward is hungry. Rust can bake a ration. It is not a well.",
    close: "The ration stops. Either the hall cooled, or the ward can feed itself.",
  },
  {
    id: "supply",
    district: "citadel",
    open: "Stone on the road is feeding the citadel's stores. A quarry decision arrived upstairs.",
    close: "Citadel stores stop taking the road. Something between the pit and the spire was cut, or held back.",
  },
  {
    id: "toll",
    district: "citadel",
    open: "Citadel plate is unfed. The guards will price a door the cargo road is not feeding.",
    close: "Citadel plate has a meal again. The toll was a missing parent, not a law.",
  },
  {
    id: "dark",
    district: "road",
    open: "The road lamps are dark. They were a child of the orrery, not of the sky.",
    close: "The road lamps take the orrery again. The stack road has a clock.",
  },
  {
    id: "workers",
    district: "quarry",
    open: "The line has Wren's diagram of the bellows. The quarry can ask what the lung is parent to.",
    close: "The diagram leaves the line.",
  },
];

function seam(nodes: GNode[] | undefined, id: string) {
  return nodes?.find((n) => n.id === id);
}

function nodeLive(nodes: GNode[], n: GNode, seen = new Set<string>()): boolean {
  if (n.severed || n.integrity < 40 || n.decoy) return false;
  if (seen.has(n.id)) return true;
  seen.add(n.id);
  for (const id of n.dependsOn) {
    const parent = nodes.find((p) => p.id === id);
    if (!parent || !nodeLive(nodes, parent, seen)) return false;
  }
  return true;
}

function setDerived(n: GNode | undefined, live: boolean) {
  if (!n) return;
  n.severed = !live;
  n.integrity = live ? Math.max(n.integrity, 80) : 0;
}

function say(d: Data, text: string) {
  d.log.unshift(text);
  if (d.log.length > 40) d.log.length = 40;
}

function holds(id: string, live: Record<string, boolean>): boolean {
  const inc = WORLD_EDGES.filter((e) => e.to === id && e.gate !== "note");
  if (!inc.length) return false;
  if (inc.some((e) => e.gate === "block" && live[e.from])) return false;
  if (inc.some((e) => e.gate === "require" && !live[e.from])) return false;
  if (inc.some((e) => e.gate === "lack" && live[e.from])) return false;
  const alts = inc.filter((e) => e.gate === "alt");
  if (alts.length) {
    const groups = new Set(alts.map((e) => e.altGroup ?? e.id));
    for (const g of groups) {
      if (!alts.filter((e) => (e.altGroup ?? e.id) === g).some((e) => live[e.from])) return false;
    }
  }
  return true;
}

function derive(roots: Record<string, boolean>): Record<string, boolean> {
  const live: Record<string, boolean> = { ...roots };
  const pending = new Set(WORLD_NODES.filter((n) => !n.root).map((n) => n.id));
  let guard = 0;
  while (pending.size && guard++ < 48) {
    for (const id of [...pending]) {
      const parents = WORLD_EDGES.filter((e) => e.to === id && e.gate !== "note").map((e) => e.from);
      if (parents.some((p) => live[p] === undefined)) continue;
      live[id] = holds(id, live);
      pending.delete(id);
    }
  }
  for (const id of pending) live[id] = false;
  return live;
}

function queue(d: Data, beat: Beat, live: boolean) {
  const line = live ? beat.open : beat.close;
  const key = `net:${beat.id}`;
  const prev = d.flags[key];
  d.flags[key] = live;
  if (d.phase !== "play") return;
  if (prev === undefined) {
    d.flags[`netBoot:${beat.id}`] = live;
    return;
  }
  if (prev === live) return;
  if (d.flags[`netSaid:${beat.id}`] === line) return;
  if (d.mapId !== beat.district) {
    d.flags[`netPend:${beat.id}`] = line;
    return;
  }
  d.flags[`netSaid:${beat.id}`] = line;
  delete d.flags[`netPend:${beat.id}`];
  say(d, line);
  voice(d, beat, line);
}

function flush(d: Data) {
  if (d.phase !== "play") return;
  for (const beat of BEATS) {
    if (d.mapId !== beat.district) continue;
    const pend = d.flags[`netPend:${beat.id}`];
    if (typeof pend !== "string") continue;
    if (d.flags[`netSaid:${beat.id}`] === pend) {
      delete d.flags[`netPend:${beat.id}`];
      continue;
    }
    d.flags[`netSaid:${beat.id}`] = pend;
    delete d.flags[`netPend:${beat.id}`];
    say(d, pend);
    voice(d, beat, pend);
  }
}

function voice(d: Data, beat: Beat, line: string) {
  const who = beat.voice;
  if (!who) return;
  const actor = d.actors[who.who];
  if (!actor?.alive || !actor.companion) return;
  const heard = line === beat.open ? who.open : line === beat.close ? who.close : "";
  if (!heard) return;
  const mark = `netVoice:${beat.id}:${line === beat.open ? "open" : "close"}`;
  if (d.flags[mark]) return;
  d.flags[mark] = true;
  say(d, heard);
}

function ejectAsh(d: Data) {
  if (d.flags.ashAccess !== false || d.mapId !== "haven") return;
  const inside = (x: number, y: number) => y >= 17 && x >= 5 && x <= 11;
  if (inside(d.player.x, d.player.y) && !d.combat) {
    d.player.x = 8;
    d.player.y = 15;
    if (d.phase === "play") say(d, "The alley stops being a way. You step back into the ward.");
  }
  for (const a of Object.values(d.actors)) {
    if (a.mapId === "haven" && inside(a.x, a.y)) {
      a.x = 9;
      a.y = 15;
    }
  }
}

function blank(): DistrictReading {
  return { water: 0, heat: 0, power: 0, food: 0, security: 0, commerce: 0, transport: 0, danger: 0 };
}

function readings(live: Record<string, boolean>, d: Data): Record<string, DistrictReading> {
  const sinks = blank();
  sinks.water = live.pressure ? (live.clean ? 100 : live.stamped ? 55 : 30) : 0;
  sinks.security = live.watch ? 70 : live.bellows ? 45 : 25;
  sinks.transport = d.flags.plateStair ? (live.watch ? 20 : 70) : 10;
  sinks.danger = live.bellows ? 15 : 40;

  const haven = blank();
  haven.water = sinks.water && live.stall ? Math.min(100, sinks.water) : live.pressure ? 20 : 0;
  if (!live.stall && live.clinic) haven.water = live.clean ? 70 : sinks.water ? 35 : 0;
  haven.food = live.food ? 100 : live.ration ? 35 : 0;
  haven.commerce = live.shop ? 80 : 10;
  haven.security = live.watch ? 55 : live.ash ? 25 : 60;
  haven.transport = live.moving ? 50 : 15;
  haven.danger = live.ash ? 50 : 15;

  const quarry = blank();
  quarry.transport = live.moving ? 80 : live.colossus ? 40 : 15;
  quarry.danger = live["chute-spill"] ? 60 : d.flags.quarryStone === "hung" ? 45 : 20;
  quarry.commerce = live.ore ? 60 : 10;
  quarry.power = live.colossus ? 50 : 0;

  const rust = blank();
  rust.water = live.quench ? 60 : 0;
  rust.heat = live.heat ? (live.guild && live.sleepers ? 100 : 55) : 0;
  rust.food = live.ration ? 45 : 0;
  rust.commerce = live.gear ? 85 : 15;
  rust.transport = live.moving ? 75 : 10;
  rust.danger = live.heat ? 15 : 40;

  const citadel = blank();
  citadel.power = live.power ? 100 : live.siphon || live.orrery ? 30 : 0;
  citadel.food = live.fed ? 70 : 10;
  citadel.security = live.toll ? 35 : live.loose ? 30 : 75;
  citadel.transport = live.supply ? 70 : 15;
  citadel.danger = live.loose ? 55 : live.power ? 20 : 40;

  const road = blank();
  road.power = live.lamps ? 80 : 0;
  road.transport = live.moving ? (live.dark ? 25 : 80) : live.dark ? 10 : 40;
  road.danger = live.dark ? 70 : live.watch ? 50 : 20;
  road.food = live.supply ? 30 : 0;

  return { sinks, haven, quarry, rust, citadel, road };
}

function observe(d: Data, live: Record<string, boolean>) {
  const touched = Boolean(
    d.flags.pumpFate ||
      d.flags.seenWard ||
      d.flags.seenQuarry ||
      d.flags.citadelFate ||
      d.flags.citadelOpen ||
      d.flags.toldWren ||
      d.flags.plotsRefused ||
      d.flags.stockRefused ||
      d.flags.quarryStone === "clear" ||
      d.flags.quarryStone === "scarred" ||
      d.flags.bellowsLive === false,
  );
  if (!touched) return;
  const bits: string[] = [];
  if (d.flags.bellowsLive === false) bits.push("The bellows is stopped. Pressure downstream is a child of that lung.");
  else if (d.flags.reedRead) bits.push("The bellows is a parent of gallery pressure. A seated pump can still be dry without it.");
  if (d.flags.pumpFate || d.flags.seenWard) {
    if (live.food) bits.push("The plots are drinking seated water. Food has a parent.");
    else if (live.pressure && !live.clean) bits.push("Pressure is up. The plots will not take water that is not seated.");
    else bits.push("The plots have no seated parent.");
    if (live.levy) bits.push("A levy can ride that food. Restoring the beds restored a bill.");
    if (d.flags.plotsRefused) bits.push("The bed was refused. The water can be clean and the plots still lie.");
    if (!live.income) bits.push("Nessa has no wage from the stall.");
    else bits.push("Nessa's wage is a child of the stall leg.");
    if (live.ash) bits.push("The service alley is open. It closes when the ward is fed.");
    if (!live.care) bits.push("The clinic tap is not a parent of care right now.");
  }
  if (d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred" || d.flags.seenQuarry) {
    if (live.ore) bits.push("Sound ore is moving. The colossus is still in the cable, and the chute is holding.");
    else if (live.moving && !live.colossus) bits.push("Stone is on the road. The colossus is not breathing, so the forge will not call the ore sound.");
    else if (live["chute-spill"]) bits.push("The chute grade is cut. Ore spills before it can parent a forge.");
    else bits.push("Ore is not leaving the pit.");
  }
  if (live.gear) bits.push("Rust stock is live. It consumes quench from the gallery, ore from the pit, and fire from the bed.");
  else if (d.flags.stockRefused) bits.push("The forge parents can be healthy. The stock was refused.");
  else if (live.quench && live.heat && !live.ore) bits.push("The forge has fire and quench, and no sound ore.");
  if (live.ration) bits.push("Rust is baking a ration because the ward is hungry and the hall is warm.");
  if (live.supply) bits.push("Citadel stores are taking the road.");
  else if (live.hoard && live.moving) bits.push("Bram is holding the cart. The citadel does not get that load.");
  if (live.toll) bits.push("Citadel plate is unfed. The toll is a missing meal.");
  if (live.dark) bits.push("The road lamps are dark. They drink from the orrery.");
  else if (live.lamps && (d.flags.citadelFate || d.flags.seenCitadel)) bits.push("The road lamps are a child of the orrery.");
  if (live.loose) bits.push("The sentry has no hour. The clock stopped.");
  if (live.workers) bits.push("The quarry line has the bellows diagram.");
  const text = bits.join(" ");
  const hit = d.journal.find((j) => j.id === "network");
  if (hit) {
    hit.title = "The city is one machine";
    hit.text = text;
    hit.status = "open";
  } else d.journal.push({ id: "network", title: "The city is one machine", text, status: "open" });
}

function syncMachines(d: Data, live: Record<string, boolean>) {
  const plots = d.machines.plots;
  if (plots) {
    setDerived(seam(plots.nodes, "inlet"), live.inlet);
    const bed = seam(plots.nodes, "bed");
    if (d.flags.plotsRefused && bed) {
      bed.severed = true;
      bed.integrity = 0;
    }
  }
  const forge = d.machines.forge;
  if (forge) {
    setDerived(seam(forge.nodes, "ore"), live.ore);
    setDerived(seam(forge.nodes, "quench"), live.quench);
    setDerived(seam(forge.nodes, "fire"), live.heat);
    const stock = seam(forge.nodes, "stock");
    if (d.flags.stockRefused && stock) {
      stock.severed = true;
      stock.integrity = 0;
    }
  }
  const chute = d.machines.chute;
  if (chute) setDerived(seam(chute.nodes, "lip"), Boolean(live.moving));
  const lamps = d.machines.lamps;
  if (lamps) setDerived(seam(lamps.nodes, "feed"), Boolean(live.power));
}

/** Facts already reconciled, then the city-sized graph. Same history, same network. */
export function reconcileNetwork(d: Data) {
  if (d.mapId) d.flags[`seen:${d.mapId}`] = true;
  const reed = seam(d.machines.bellows?.nodes, "reed");
  if (reed?.revealed) d.flags.reedRead = true;
  const feed = seam(d.machines.head?.nodes, "feed");
  const bed = seam(d.machines.plots?.nodes, "bed");
  const grade = seam(d.machines.chute?.nodes, "grade");
  const glass = seam(d.machines.lamps?.nodes, "glass");
  const siphon = seam(d.machines.crucible?.nodes, "siphon");
  const drive = seam(d.machines.orrery?.nodes, "drive");
  const throat = seam(d.machines.colossus?.nodes, "throat");
  const firebed = seam(d.machines.hearth?.nodes, "bed");
  const goods = String(d.flags.wardGoods ?? "none");
  const roots: Record<string, boolean> = {
    bellows: reed ? nodeLive(d.machines.bellows.nodes, reed) : true,
    pressure: feed ? nodeLive(d.machines.head.nodes, feed) : false,
    clean: goods === "clean",
    stamped: goods === "stamped",
    stall: d.flags.wardMarket === true,
    clinic: d.flags.wardClinic === true,
    "bed-open": Boolean(bed && !bed.severed && d.flags.plotsRefused !== true),
    watch: d.flags.roadWatch === true,
    moving: d.flags.stoneMoving === true,
    colossus: throat ? nodeLive(d.machines.colossus.nodes, throat) : true,
    heat: firebed ? nodeLive(d.machines.hearth.nodes, firebed) : false,
    guild: d.flags.guildWarm === true,
    sleepers: d.flags.tenementWarm === true,
    siphon: Boolean(siphon && d.machines.crucible && nodeLive(d.machines.crucible.nodes, siphon) && d.flags.citadelFate !== "sever"),
    orrery: drive ? nodeLive(d.machines.orrery.nodes, drive) : false,
    "citadel-open": Boolean(d.flags.citadelOpen || d.flags.citadelFate || d.flags.seenCitadel),
    told: d.flags.toldWren === true,
    "plots-refused": d.flags.plotsRefused === true,
    "stock-refused": d.flags.stockRefused === true,
    "chute-spill": Boolean(grade?.severed),
    "lamp-dark": Boolean(glass?.severed),
    hoard: d.flags.bramHoard === true,
  };
  const live = derive(roots);
  syncMachines(d, live);
  if (live.shop) d.flags.shopEver = true;
  d.flags.foodLive = live.food;
  d.flags.levyLive = live.levy;
  d.flags.ashAccess = live.ash;
  d.flags.nessaSells = live.shop;
  d.flags.nessaRefuses = !live.shop && d.flags.shopEver === true;
  d.flags.clinicCare = live.care;
  d.flags.oreSound = live.ore;
  d.flags.quenchLive = live.quench;
  d.flags.gearLive = live.gear;
  d.flags.rustRation = live.ration;
  d.flags.citadelSupplied = live.supply;
  d.flags.guardFed = live.fed;
  d.flags.guardToll = live.toll;
  d.flags.citadelPower = live.power;
  d.flags.roadLamps = live.lamps;
  d.flags.roadDark = live.dark;
  d.flags.sentryLoose = live.loose;
  d.flags.workersKnow = live.workers;
  d.flags.foodPrice = live.food ? 6 : live.ration ? 9 : 0;
  d.flags.gearPrice = live.gear ? 18 : 0;
  for (const beat of BEATS) queue(d, beat, Boolean(live[beat.id]));
  flush(d);
  ejectAsh(d);
  const districts = readings(live, d);
  const world: WorldSnapshot = { live, districts };
  d.world = world;
  observe(d, live);
}
