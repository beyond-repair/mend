import type { Data } from "./types";

interface Bark {
  id: string;
  who: string;
  line: string;
  when: (d: Data) => boolean;
}

const BARKS: Bark[] = [
  { id: "tobin-pump", who: "tobin", line: "The pump is still a parent. Don't start with the plaque.", when: (d) => d.mapId === "sinks" && !d.flags.pumpFate },
  { id: "tobin-lung", who: "tobin", line: "That reed is the lung. The ward is just where the dryness learns a name.", when: (d) => d.mapId === "sinks" && Boolean(d.flags.reedRead) },
  { id: "tobin-dry", who: "tobin", line: "The plots are quiet. I told you the lung was the parent.", when: (d) => d.mapId === "haven" && !d.flags.foodLive && Boolean(d.flags.pumpFate) },
  { id: "tobin-fed", who: "tobin", line: "Food has a parent. So does the bill. I can live with both. I won't pretend they're one kindness.", when: (d) => d.mapId === "haven" && Boolean(d.flags.foodLive) },
  { id: "tobin-stone", who: "tobin", line: "The cable is a parent. Whoever stands under the boom is the child.", when: (d) => d.mapId === "quarry" && d.flags.quarryStone !== "clear" && d.flags.quarryStone !== "scarred" },
  { id: "wren-line", who: "wren", line: "This is the same machine. They just gave the next room a different name.", when: (d) => d.mapId === "road" },
  { id: "wren-dark", who: "wren", line: "The lamps went out. Ask what they were drinking, not who to blame for the dark.", when: (d) => d.mapId === "road" && Boolean(d.flags.roadDark) },
  { id: "wren-quiet-lung", who: "wren", line: "You stopped the lung once. You know what happens when it goes quiet.", when: (d) => d.flags.bellowsLive === false && Boolean(d.flags.reedRead) && d.mapId !== "sinks" },
  { id: "wren-pit", who: "wren", line: "If they heard the diagram, the pit already knows the lung. If they didn't, the pit is still guessing.", when: (d) => d.mapId === "quarry" && Boolean(d.flags.workersKnow) },
  { id: "wren-count", who: "wren", line: "Pim is back on the count. Fear stood down when the slab missed. Don't file that as courage.", when: (d) => d.mapId === "quarry" && Boolean(d.flags.pimCount) },
  { id: "tobin-hook", who: "tobin", line: "That pin hook still in the pack? The cable remembers the last time someone trusted a single parent.", when: (d) => d.mapId === "quarry" && d.inventory.some((i) => i.id === "hook" && i.qty > 0) },
  { id: "tobin-doss", who: "tobin", line: "Doss left the reed. Weather moved. A person followed. That's the report.", when: (d) => Boolean(d.flags.dossShift) },
  { id: "sera-stock", who: "sera", line: "Stock on the bench is not a virtue. Look at which parent you meant.", when: (d) => d.mapId === "rust" && Boolean(d.flags.gearLive) },
  { id: "sera-refused", who: "sera", line: "You left the parents standing and refused the stock. I saw it. I'm still here.", when: (d) => d.mapId === "rust" && Boolean(d.flags.stockRefused) },
  { id: "sera-seize", who: "sera", line: "Don't replace the engine with your face and call the walk maintenance.", when: (d) => Boolean(d.flags.citadelFate === "seize") },
  { id: "sera-toll", who: "sera", line: "If the plate upstairs is hungry, the doorway is not a law.", when: (d) => d.mapId === "citadel" && Boolean(d.flags.guardToll) },
  { id: "mara-hall", who: "mara", line: "The hall is warm. That doesn't mean the beds are.", when: (d) => d.mapId === "rust" && Boolean(d.flags.guildWarm) && !d.flags.tenementWarm },
  { id: "mara-quiet", who: "mara", line: "I keep the nights. You don't have to take them to keep walking with me.", when: (d) => d.mapId === "rust" && Boolean(d.flags.maraFate) },
  { id: "mara-hollow", who: "mara", line: "Drift sleeps where the weather is sent. I know that instinct. I won't call it a cure.", when: (d) => d.mapId === "tundra" && Boolean(d.flags.driftBed) },
  { id: "any-return-haven", who: "any", line: "We've been here. It isn't the room I remember. The pipes moved.", when: (d) => d.mapId === "haven" && Number(d.flags["visits:haven"] ?? 0) > 1 },
  { id: "any-return-sinks", who: "any", line: "Back under the stacks. Whatever we did downstream is still a child of this room.", when: (d) => d.mapId === "sinks" && Number(d.flags["visits:sinks"] ?? 0) > 1 },
  { id: "any-ice", who: "any", line: "The north edge of the walk is ice. The south edge isn't. The citadel doesn't care which you pick.", when: (d) => d.mapId === "tundra" },
  { id: "any-spire", who: "any", line: "If you came to put it back the way it was, say so out loud. I don't think it was.", when: (d) => d.mapId === "spire" },
  { id: "cinder-reed", who: "cinder", line: "clicks, once, at the bellows.", when: (d) => d.mapId === "sinks" && d.flags.bellowsLive !== false && !d.flags.dossShift },
  { id: "cinder-restless", who: "cinder", line: "will not settle. The reed is stopped.", when: (d) => d.flags.bellowsLive === false },
  { id: "cinder-doss", who: "cinder", line: "avoids the empty reed. The sleeper already left.", when: (d) => d.mapId === "sinks" && Boolean(d.flags.dossShift) },
  { id: "cinder-plots", who: "cinder", line: "ranges ahead, then comes back. The plots smell like a parent.", when: (d) => d.mapId === "haven" && Boolean(d.flags.foodLive) },
  { id: "cinder-dark", who: "cinder", line: "stops. The dark road is a no, until it isn't.", when: (d) => Boolean(d.flags.roadDark) && (d.mapId === "road" || d.mapId === "tundra") },
  { id: "cinder-forge", who: "cinder", line: "flinches at the forge. The noise is a parent she doesn't want.", when: (d) => d.mapId === "rust" && Boolean(d.flags.gearLive) },
  { id: "cinder-hollow-cold", who: "cinder", line: "circles the hollow and does not go in.", when: (d) => d.mapId === "tundra" && d.flags.hollowWarm === false && Boolean(d.flags.tundraWalked) },
  { id: "cinder-quiet", who: "cinder", line: "hunts the edge of the lantern and comes back without being called.", when: (d) => d.mapId === "citadel" && !d.flags.roadDark },
];

/** Occasional, once each. Silence is allowed. */
export function barkLine(d: Data): string | null {
  const steps = Number(d.flags.quietSteps ?? 0) + 1;
  d.flags.quietSteps = steps;
  if (d.combat || d.dialogue || d.phase !== "play") return null;
  if (steps < 7) return null;
  const mate = Object.values(d.actors).find((a) => a.companion && a.alive && a.mapId === d.mapId && a.template !== "cinder");
  const moth = d.actors.cinder?.companion && d.actors.cinder.alive && d.actors.cinder.mapId === d.mapId;
  for (const b of BARKS) {
    if (d.flags[`bark:${b.id}`]) continue;
    if (b.who === "cinder" && !moth) continue;
    if (b.who !== "cinder" && b.who !== "any" && mate?.id !== b.who) continue;
    if (b.who === "any" && !mate) continue;
    if (!b.when(d)) continue;
    d.flags[`bark:${b.id}`] = true;
    d.flags.quietSteps = 0;
    if (b.who === "cinder") return `The moth ${b.line}`;
    return `${mate?.name ?? "Someone"}: ${b.line}`;
  }
  d.flags.quietSteps = 0;
  return null;
}
