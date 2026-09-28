import { ITEMS } from "./catalog";
import { play } from "./audio";
import type { Actor, CompanionBond, CompanionKit, Data, Habit } from "./types";

/** Starting loadout. Filled once. A later equip is the player's, and reconcile will not take it back. */
const PROFILES: Record<string, { habit: Habit; kit: CompanionKit }> = {
  tobin: { habit: "brace", kit: { weapon: "prybar", armor: "wrap", accessory: "strap" } },
  wren: { habit: "pin", kit: { weapon: "hook", armor: null, accessory: "glass" } },
  sera: { habit: "cover", kit: { weapon: "fist", armor: "vest", accessory: null } },
  mara: { habit: "read", kit: { weapon: "prybar", armor: "wrap", accessory: "glass" } },
  cinder: { habit: "press", kit: { weapon: "bite", armor: null, accessory: null } },
};

const BOND = (): CompanionBond => ({ trust: 40, respect: 40, fear: 10, accord: 50, loyalty: 35 });

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function say(d: Data, text: string) {
  d.log.unshift(text);
  if (d.log.length > 40) d.log.length = 40;
}

function nearPlayer(d: Data, a: Actor) {
  if (a.mapId !== d.mapId) return false;
  return Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 5;
}

function remember(a: Actor, id: string, delta: Partial<CompanionBond>, line: string, d: Data) {
  if (!a.memories) a.memories = [];
  if (!a.bond) a.bond = BOND();
  if (a.memories.includes(id)) return;
  a.memories.push(id);
  const b = a.bond;
  if (delta.trust) b.trust = clamp(b.trust + delta.trust);
  if (delta.respect) b.respect = clamp(b.respect + delta.respect);
  if (delta.fear) b.fear = clamp(b.fear + delta.fear);
  if (delta.accord) b.accord = clamp(b.accord + delta.accord);
  if (delta.loyalty) b.loyalty = clamp(b.loyalty + delta.loyalty);
  if (!a.companion || d.phase !== "play" || !nearPlayer(d, a)) return;
  say(d, line);
}

function facts(d: Data, a: Actor) {
  if (a.id === "tobin") {
    if (d.flags.foodLive) {
      remember(a, "plots-fed", { trust: 6, respect: 4, accord: 8 }, "Tobin counts the plots. Food has a parent. So does the levy.", d);
    }
    if (d.flags.bellowsLive === false) {
      remember(
        a,
        "lung-cut",
        { accord: -8, fear: 4 },
        "Tobin looks at the stopped bellows and does not agree. He stays.",
        d,
      );
    }
    if (d.flags.varrFate === "dead") {
      remember(a, "varr-dead", { fear: 6, loyalty: 4 }, "Tobin hears that Varr is gone. He keeps the step he already had.", d);
    }
    if (d.flags.citadelFate === "seize") {
      remember(
        a,
        "standard-kept",
        { accord: -10, fear: 6 },
        "Tobin hears the standard is yours now. He walks, and he does not agree.",
        d,
      );
    }
  }
  if (a.id === "sera") {
    if (d.flags.stockRefused) {
      remember(a, "stock-refused", { accord: 10, respect: 4 }, "Sera notes the stock that was refused. The parents are still standing.", d);
    }
    if (d.flags.gearLive) {
      remember(a, "gear-live", { accord: -6, respect: 2 }, "Sera hears the forge turning stock. She does not leave.", d);
    }
    if (d.flags.citadelFate === "seize") {
      remember(
        a,
        "citadel-seize",
        { fear: 15, accord: -12, loyalty: -4 },
        "Sera hears you took the standard. She is afraid, and she is still here.",
        d,
      );
    }
  }
  if (a.id === "wren") {
    if (d.flags.toldWren) {
      remember(a, "told-wren", { trust: 8, respect: 6 }, "Wren has the diagram. She will carry it.", d);
    }
    if (d.flags.workerHurt) {
      remember(a, "worker-hurt", { respect: -6, accord: -4 }, "Wren counts the rigger the stone took.", d);
    }
    if (d.flags.roadDark) {
      remember(a, "dark-road", { respect: 4 }, "Wren says the lamps were a child. The dark is not a new city.", d);
    }
  }
  if (a.id === "cinder") {
    if (d.flags.cinderFed) {
      remember(a, "fed", { trust: 12, loyalty: 8 }, "The moth counted the scrap. Hunger was the parent she was waiting on.", d);
    }
    if (d.flags.foodLive) {
      remember(a, "plots-range", { trust: 6, accord: 6 }, "The moth ranges. The plots are feeding, and she treats that as weather.", d);
    }
    if (d.flags.bellowsLive === false) {
      remember(a, "lung-restless", { fear: 8, accord: -4 }, "The moth will not settle. The reed she nested on is stopped.", d);
    }
    if (d.flags.roadDark) {
      remember(a, "dark-hesitate", { fear: 8 }, "The moth stops at the dark. She does not call the stopping courage.", d);
    }
  }
  if (a.id === "mara") {
    if (d.flags.gearLive) {
      remember(a, "gear-hum", { accord: -4, fear: 2 }, "Mara hears the forge. The hum she keeps is not the same hum.", d);
    }
    if (d.flags.stockRefused) {
      remember(a, "stock-quiet", { trust: 4, accord: 6 }, "Mara notes the stock that was refused. The hall is quieter.", d);
    }
  }
}

const TOBIN_MEMORY: Record<string, string> = {
  "plots-fed": "He still counts the plots before he counts the levy.",
  "lung-cut": "He will not touch a stopped lung as if the work were finished.",
  "varr-dead": "He heard Varr is gone. He kept the step he already had.",
  "standard-kept": "He walks. He does not agree about the standard.",
};

const WREN_MEMORY: Record<string, string> = {
  "told-wren": "She is still carrying the diagram. It is not a leash.",
  "worker-hurt": "She counts the rigger the stone took. She does not sand the name.",
  "dark-road": "She says the lamps were a child. The dark is not a new city.",
};

const SERA_MEMORY: Record<string, string> = {
  "stock-refused": "She saw the stock refused and the parents left standing.",
  "gear-live": "She hears the forge turning stock. She has not left.",
  "citadel-seize": "She is afraid of the standard in your hand. She is still here.",
};

const MARA_MEMORY: Record<string, string> = {
  "gear-hum": "The forge is not the hum she keeps.",
  "stock-quiet": "The hall is quieter when the stock is refused.",
};

/** What they are doing. Not a grade, and not a friendship meter. */
export function companyLines(d: Data, a: Actor): string[] {
  if (a.id === "cinder") return cinderLines(d, a);
  const book =
    a.id === "tobin" ? TOBIN_MEMORY : a.id === "wren" ? WREN_MEMORY : a.id === "sera" ? SERA_MEMORY : a.id === "mara" ? MARA_MEMORY : {};
  const lines = (a.memories ?? []).map((id) => book[id]).filter((line): line is string => Boolean(line));
  if (a.id === "tobin" && d.flags.reedRead && d.flags.bellowsLive !== false) lines.push("He pauses beside a seated lung before he speaks.");
  if (a.id === "tobin" && d.flags.dossShift) lines.push("He noticed Doss left the reed. He has not turned it into a speech.");
  if (a.id === "wren" && d.flags.bellowsLive === false) lines.push("You stopped the lung once. She knows what quiet does downstream.");
  if (a.id === "wren" && d.flags.pipShown) lines.push("She watches drips the way the child did.");
  if (a.id === "sera" && d.flags.stockRefused && d.mapId === "rust") lines.push("She stops at the forge and does not put a hand on the stock.");
  if (a.id === "sera" && d.flags.guardToll && d.flags.sarnMet) lines.push("She will not let you call the citadel doorway a law. She heard it called a meal.");
  if (a.id === "mara" && d.flags.tenementWarm && !d.flags.guildWarm) lines.push("She keeps the nights where the beds are, not where the hall is.");
  if (!lines.length) {
    if (a.id === "tobin") lines.push("He walks like the bench is still his.");
    else if (a.id === "wren") lines.push("She walks the lines. She has not been made to perform them.");
    else if (a.id === "sera") lines.push("She is watching which child you mean.");
    else if (a.id === "mara") lines.push("She keeps the nights. She did not ask to be saved from them.");
    else lines.push(`${a.name} is walking. That is the fact.`);
  }
  return lines.slice(0, 4);
}

function cinderLines(d: Data, a: Actor): string[] {
  const lines: string[] = [];
  if (d.flags.cinderLeft && !a.companion) lines.push("Cinder left the shadow. She is on the reed.");
  else if (d.flags.cinderBack && a.companion) lines.push("Cinder came back.");
  else if (a.companion) lines.push("Cinder chose a shadow. Nobody assigned it.");
  else if (d.flags.cinderFed) lines.push("Cinder ate. She has not chosen a perch.");
  else lines.push("Cinder watches the lung. Hunger is visible. A leash is not.");
  if (d.flags.roadDark && !d.flags.cinderDarkOk) lines.push("Cinder will not cross the dark road.");
  else if (d.flags.cinderDarkOk && d.flags.roadDark) lines.push("Cinder crossed the dark. She did not call it safe.");
  if (d.flags.bellowsLive === false) lines.push("Cinder will not call the stopped reed a nest.");
  else lines.push("Cinder follows the reed water.");
  if (d.flags.dossShift) lines.push("Cinder does not visit the empty reed.");
  if (d.flags.foodLive) lines.push("Cinder ranges where the plots are feeding.");
  if (d.flags.gearLive) lines.push("Cinder flinches at the forge.");
  if (d.flags.hollowWarm && d.flags.tundraWalked) lines.push("Cinder slept near the warm hollow.");
  else if (d.flags.tundraWalked && d.flags.hollowWarm === false) lines.push("Cinder will not enter the cold hollow.");
  return lines.slice(0, 4);
}

export function ensureCompanions(d: Data) {
  for (const id of Object.keys(PROFILES)) {
    const a = d.actors[id];
    const profile = PROFILES[id];
    if (!a || !profile) continue;
    if (!a.habit) a.habit = profile.habit;
    if (!a.kit) a.kit = { ...profile.kit };
    if (!a.bond) a.bond = BOND();
    if (!a.memories) a.memories = [];
    facts(d, a);
  }
}

/** Where the moth lives when she has not chosen a shadow. She can leave. She can come back. The choosing stays hers. */
export function placeCreature(d: Data) {
  const c = d.actors.cinder;
  if (!c || !c.alive || d.combat) return;

  if (
    c.companion &&
    !d.flags.cinderLeft &&
    d.flags.cinderRisk &&
    !d.flags.cinderKept &&
    rustHeat(d) &&
    d.flags.bellowsLive === false &&
    (c.bond?.fear ?? 0) >= 16
  ) {
    d.flags.cinderLeft = true;
  }

  if (d.flags.cinderLeft) {
    c.companion = false;
    c.mapId = "sinks";
    c.x = 30;
    c.y = 3;
    c.home = { mapId: "sinks", x: 30, y: 3 };
    if (d.phase === "play" && !d.flags.cinderLeftSaid) {
      d.flags.cinderLeftSaid = true;
      say(d, "The moth leaves the shadow. The forge is a predator and the reed is stopped. She does not ask you to agree.");
      play("moth");
    }
    const lung = d.flags.bellowsLive !== false;
    const near = d.mapId === "sinks" && Math.abs(d.player.x - 30) + Math.abs(d.player.y - 3) <= 2;
    if (lung && d.flags.cinderFed && near && !d.dialogue) {
      c.companion = true;
      d.flags.cinderLeft = false;
      d.flags.cinderBack = true;
      if (d.phase === "play") {
        say(d, "The reed is breathing. She steps onto the shadow again. You did not assign the second choosing.");
        play("moth");
      }
      mothWeather(d, c);
    }
    return;
  }

  if (c.companion) {
    const heat =
      d.phase === "play" &&
      !d.dialogue &&
      d.mapId === "rust" &&
      rustHeat(d) &&
      d.flags.bellowsLive === false &&
      !d.flags.cinderHeatAsked &&
      !d.flags.cinderKept &&
      (c.bond?.fear ?? 0) >= 16;
    if (heat) {
      d.flags.cinderHeatAsked = true;
      d.dialogue = { convo: "cinder-heat", node: "start" };
      d.panel = "none";
      d.path = [];
    }
    mothWeather(d, c);
    return;
  }

  const want = d.flags.foodLive && d.flags.cinderFed ? "haven" : "sinks";
  if (d.flags.cinderWhere === want && c.mapId === want) return;
  const prev = d.flags.cinderWhere;
  d.flags.cinderWhere = want;
  c.mapId = want;
  c.home = want === "haven" ? { mapId: "haven", x: 31, y: 3 } : { mapId: "sinks", x: 30, y: 3 };
  c.x = c.home.x;
  c.y = c.home.y;
  if (prev && prev !== want && d.phase === "play") {
    say(
      d,
      want === "haven"
        ? "The moth is gone from the reed. The plots are feeding, and she went where the food is."
        : "The moth is back on the reed. The plots are not a place she will sleep.",
    );
    play("moth");
  }
}

function rustHeat(d: Data) {
  return Boolean(d.flags.gearLive || d.flags.tenementWarm || d.flags.guildWarm);
}

function mothWeather(d: Data, c: Actor) {
  if (!c.companion) return;
  const bits: string[] = [];
  if (d.flags.bellowsLive === false) bits.push("The reed is stopped. A pump can still look seated. She will not call the nest seated.");
  else bits.push("She lands on the reed, not the valve. The child can fail while the home is still breathing.");
  if (d.flags.foodLive) bits.push("The plots are a meal. The levy on the same pipe is invisible to her.");
  else if (d.flags.pumpFate || d.flags.plotsRefused) bits.push("She will not settle on a dry bed. The hunger is a child of something upstream.");
  if (d.flags.roadDark) bits.push("Dark is territory. The glass is only the reason the territory opened.");
  if (d.flags.gearLive) bits.push("The forge is predator-noise. Working is not the same word as safe.");
  if (d.flags.hollowWarm && d.mapId === "tundra") bits.push("The hollow is warm because a clock elsewhere is still a parent.");
  const text = bits.join(" ");
  const hit = d.journal.find((j) => j.id === "moth-weather");
  if (!hit) d.journal.push({ id: "moth-weather", title: "What the moth knows", text, status: "open" });
  else if (hit.text !== text) {
    hit.text = text;
    hit.status = "open";
  }
  const here =
    d.mapId === "sinks"
      ? "moth:reed"
      : d.mapId === "haven"
        ? "moth:plots"
        : d.mapId === "road" && d.flags.roadDark
          ? "moth:dark"
          : d.mapId === "rust" && d.flags.gearLive
            ? "moth:heat"
            : d.mapId === "tundra"
              ? "moth:hollow"
              : "";
  if (!here || d.flags[here] || d.phase !== "play" || d.dialogue) return;
  d.flags[here] = true;
  const line =
    here === "moth:reed"
      ? "The moth settles on the reed, not the valve. Audit can name a pipe. She is naming a home."
      : here === "moth:plots"
        ? d.flags.foodLive
          ? "The moth ranges over the plots. She does not look at the levy."
          : "The moth will not land on the plots. The bed is not the parent she wants."
        : here === "moth:dark"
          ? "The moth stops. The dark is a territory. The missing glass is only why."
          : here === "moth:heat"
            ? "The moth flinches at the forge. The noise is a predator, not a product."
            : d.flags.hollowWarm
              ? "The moth circles the hollow. Warmth here is a child of a clock, not of the ice."
              : "The moth will not go into the hollow. Its parent stopped sending weather.";
  say(d, line);
  play("moth");
}

function rowQty(d: Data, id: string) {
  return d.inventory.find((i) => i.id === id)?.qty ?? 0;
}

function put(d: Data, id: string) {
  const row = d.inventory.find((i) => i.id === id);
  if (row) row.qty += 1;
  else d.inventory.push({ id, qty: 1, condition: ITEMS[id]?.condition ?? 100 });
}

function pull(d: Data, id: string) {
  const row = d.inventory.find((i) => i.id === id);
  if (!row) return;
  row.qty -= 1;
  if (row.qty <= 0) d.inventory = d.inventory.filter((i) => i.id !== id);
}

export function equipCompanion(
  d: Data,
  id: string,
  slot: "weapon" | "armor" | "accessory",
  itemId: string | null,
): boolean {
  const a = d.actors[id];
  if (!a?.companion || !a.kit) return false;
  const kind = slot === "weapon" ? "weapon" : slot === "armor" ? "armor" : "accessory";
  const prev = slot === "weapon" ? a.kit.weapon : slot === "armor" ? a.kit.armor : a.kit.accessory;
  if (itemId === null) {
    if (!prev) return false;
    if (slot === "weapon") a.kit.weapon = a.weapon;
    else if (slot === "armor") a.kit.armor = null;
    else a.kit.accessory = null;
    if (!(slot === "weapon" && prev === a.weapon)) put(d, prev);
    say(d, `${a.name} hands back the ${ITEMS[prev]?.name ?? prev}.`);
    return true;
  }
  const def = ITEMS[itemId];
  if (!def || def.kind !== kind) return false;
  if (d.equipped.weapon === itemId || d.equipped.armor === itemId) return false;
  if (rowQty(d, itemId) < 1) return false;
  pull(d, itemId);
  if (slot === "weapon") a.kit.weapon = itemId;
  else if (slot === "armor") a.kit.armor = itemId;
  else a.kit.accessory = itemId;
  if (prev && !(slot === "weapon" && prev === a.weapon)) put(d, prev);
  say(d, `${a.name} takes the ${def.name}.`);
  return true;
}
