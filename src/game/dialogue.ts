import type { Convo, Effect, Reply } from "./types";
import { extendCampaign } from "./campaign";
import { KILN_CONVOS } from "./kiln";
import { SWITCH_CONVOS } from "./switchyard";
import { PANE_CONVOS } from "./pane";

const log = (text: string): Effect => ({ op: "log", text });
const flag = (key: string, value: string | number | boolean): Effect => ({ op: "flag", key, value });
const journal = (
  id: string,
  title: string,
  text: string,
  status: "open" | "done" | "failed" = "open",
): Effect => ({ op: "journal", id, title, text, status });

function end(text: string, effects?: Effect[], extra?: Partial<Reply>): Reply {
  return { text, effects, end: true, ...extra };
}

export const CONVOS: Record<string, Convo> = {
  "tobin-intro": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "You're late, Patch. The chamber spat you out with a zero on the dial, and the Sinks took the rest. Don't look at me like I have a rank to hand you. I have a bench, a dead pump, and a city that prefers both.",
        replies: [
          { text: "What did the chamber actually measure?", goto: "measure" },
          {
            text: "Then show me the pump.",
            goto: "pump",
            effects: [
              journal(
                "pump",
                "The broken pump",
                "The Sinks pump is dead. Tobin says the Bureau will not send a tech for a D-rank shop. Water, or the lack of it, is the whole district.",
              ),
              log("The pump sits east of the shop, beside the sludge cut."),
            ],
          },
        ],
      },
      measure: {
        speaker: "tobin",
        text: "Output. Fire, force, light — anything a clerk can put on a card. You gave them nothing they have a needle for. I watched you stare at my boiler like you could see the arguments inside the iron. That is not nothing. It is also not a rank. Ranks are how they decide who gets to be warm.",
        replies: [
          {
            text: "Then the pump. I'll read it.",
            goto: "pump",
            effects: [
              journal(
                "pump",
                "The broken pump",
                "The Sinks pump is dead. A reading will tell you more than the Bureau's card ever did.",
              ),
            ],
          },
          end("I'll walk the shop first."),
        ],
      },
      pump: {
        speaker: "tobin",
        text: "East side, past the door, before the sludge. Boiler, pipe, valve, bypass. The valve lost its seat. If you mend it blind, you may teach the water a new shape. The lower ward has no well of its own. If its cistern is dry, that dryness is this pump. Pell in the upper street sells parts and lies. Captain Varr holds the south checkpoint. He likes zeros. They don't talk back.",
        replies: [
          end("I'll audit it.", [log("Audit is on your bar. Stand next to a machine and read it.")]),
        ],
      },
    },
  },
  "tobin-after": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "You keep looking at the walls like they owe you a diagram. Speak.",
        replies: [
          {
            text: "How do you want the pump handled?",
            goto: "advice",
            requires: [{ missing: "pumpFate" }],
          },
          {
            text: "Come with me when I leave the Sinks.",
            goto: "join",
            requires: [{ flag: "act1", is: true }, { noCompanion: true }],
          },
          {
            text: "Stay with the bench. I'll go alone.",
            requires: [{ flag: "act1", is: true }, { companion: "tobin" }],
            effects: [{ op: "dismiss", id: "tobin" }, log("Tobin stays with the boiler. He says the shop still needs a keeper.")],
            end: true,
          },
          {
            text: "What did the full mend take from you?",
            goto: "whole",
            requires: [{ flag: "tobinFate", is: "intact" }],
          },
          {
            text: "Does the scar still pull?",
            goto: "scar",
            requires: [{ flag: "tobinFate", is: "scarred" }],
          },
          {
            text: "The bellows is stopped.",
            goto: "lung",
            requires: [{ flag: "bellowsLive", is: false }],
          },
          {
            text: "Keep the pin hook. I'll hand it back when you should hold a seam.",
            requires: [{ missing: "hookGiven" }, { companion: "tobin" }],
            effects: [
              flag("hookGiven", true),
              { op: "item", id: "hook", n: 1 },
              log("Tobin presses a pin hook into the pack. It holds a seam. It does not win a room."),
            ],
            end: true,
          },
          end("Back to the iron."),
        ],
      },
      advice: {
        speaker: "tobin",
        text: "If you have a true valve, seat it. If you don't, the bypass will move dirty water and the cellars will remember you. There is also a clerk Pell can reach, if your mouth is better than your hands. None of these are clean. Clean is a Bureau word.",
        replies: [end("Understood.")],
      },
      join: {
        speaker: "tobin",
        text: "The bench will keep. If you're going where the plate is thicker, you'll want someone who has already hated it professionally. I won't call you Patch where they can hear.",
        replies: [
          end("Walk with me.", [
            { op: "recruit", id: "tobin" },
            log("Tobin slings a roll of tools and falls in a step behind."),
            journal("tobin", "Tobin on the road", "He left the bench. He still calls the work maintenance, not magic.", "done"),
          ]),
          end("Not yet."),
        ],
      },
      whole: {
        speaker: "tobin",
        text: "I remember the shop. I don't remember wanting to bite. That's new, or that's gone. The pain used to keep my books honest. Be careful whose baseline you trust. Especially your own.",
        replies: [end("I'll remember that.")],
      },
      scar: {
        speaker: "tobin",
        text: "It pulls when the weather drops. Good. I can still tell a lie from a courtesy. You left me the part of the beating that teaches. Don't apologize unless you mean to do it again.",
        replies: [end("I won't.")],
      },
      lung: {
        speaker: "tobin",
        text: "Then the pump can be perfect and the ward can still be dry. You found the lung. Do not let anyone file that as an accident. A stopped bellows is a decision about every tap that drinks from it.",
        replies: [end("That's the decision.", [flag("tobinHeardLung", true)])],
      },
    },
  },
  pell: {
    start: "start",
    nodes: {
      start: {
        speaker: "pell",
        text: "Don't step on the sack. That's not junk, that's Tuesday. You have the look of a man the Bureau filed under furniture. What do you want out of the alley?",
        replies: [
          {
            text: "A valve that still remembers its seat.",
            goto: "valve",
            requires: [{ missing: "pumpFate" }],
          },
          {
            text: "The street clerk. Tell them the pump is a flood rating.",
            goto: "speech",
            requires: [{ missing: "pumpFate" }],
            check: { skill: "speech", dc: 55 },
            effects: [
              flag("pumpFate", "speech"),
              flag("actReady", true),
              { op: "xp", n: 40 },
              { op: "rep", faction: "bureau", n: 5 },
              journal(
                "pump",
                "The broken pump",
                "A clerk retagged the pump as a flood hazard. Water will move because paperwork is afraid of water. The Bureau will take the credit.",
                "done",
              ),
              log("By evening the pump has a Bureau ribbon on it and water in the pipes. The ribbon is the loudest part."),
              { op: "pin", text: "Varr will have felt the paperwork." },
            ],
            failEffects: [log("Pell laughs once. The clerk does not take messages from furniture.")],
            failGoto: "start",
          },
          {
            text: "Buy a focus phial. (12 scrip)",
            requires: [{ scrip: 12 }],
            effects: [
              { op: "scrip", n: -12 },
              { op: "item", id: "phial" },
              log("The phial tastes like a licked coin. You keep it anyway."),
            ],
            end: true,
          },
          end("Keep your Tuesday."),
        ],
      },
      valve: {
        speaker: "pell",
        text: "I have one that came off a Bureau practice boiler. They teach recruits to fail on purpose. Twenty-five scrip. Or impress me. Or try to lift it while I'm looking, which I am.",
        replies: [
          {
            text: "Twenty-five. Here.",
            requires: [{ scrip: 25 }],
            effects: [
              { op: "scrip", n: -25 },
              { op: "item", id: "valve" },
              log("The valve is heavier than it looks. It has been loved by a machinist and then abandoned."),
            ],
            end: true,
          },
          {
            text: "The district floods, your sack floats, and Varr fines the alley. Think.",
            check: { skill: "speech", dc: 50 },
            effects: [
              { op: "item", id: "valve" },
              { op: "xp", n: 15 },
              log("Pell swears, then hands it over. 'If my stock drowns I will invoice your ghost.'"),
            ],
            failEffects: [log("He doesn't blink. The price remains a price.")],
            failGoto: "valve",
            end: true,
          },
          {
            text: "Distract the eye that still works.",
            check: { skill: "sneak", dc: 58 },
            effects: [
              { op: "item", id: "valve" },
              { op: "rep", faction: "unbound", n: -8 },
              log("The valve leaves the sack. Pell will notice at dusk, and he will know the shape of the theft."),
            ],
            failEffects: [
              { op: "rep", faction: "unbound", n: -5 },
              log("His bad eye is not the one he uses for thieves. The alley closes."),
            ],
            failGoto: "caught",
            end: true,
          },
          end("Another time."),
        ],
      },
      caught: {
        speaker: "pell",
        text: "We're done talking prices. Tell Tobin his stray picks pockets.",
        replies: [end("Noted.")],
      },
    },
  },
  "varr-gate": {
    start: "start",
    nodes: {
      start: {
        speaker: "varr",
        text: "D-rank. The checkpoint is not a promenade. If you are here to look at armor, look at the ground instead. It is where your sort ends up.",
        replies: [
          {
            text: "The pump is handled. You'll have a report either way.",
            goto: "after",
            requires: [{ flag: "pumpFate", is: "mend" }],
          },
          {
            text: "The pump is handled. You'll have a report either way.",
            goto: "after",
            requires: [{ flag: "pumpFate", is: "speech" }],
          },
          {
            text: "The pump is handled. You'll have a report either way.",
            goto: "dirty",
            requires: [{ flag: "pumpFate", is: "bleed" }],
          },
          {
            text: "The pump is handled. You'll have a report either way.",
            goto: "flood",
            requires: [{ flag: "pumpFate", is: "flood" }],
          },
          {
            text: "I'm done being furniture.",
            goto: "force",
          },
          end("I'll go back to the bench."),
        ],
      },
      after: {
        speaker: "varr",
        text: "Unauthorized maintenance is theft of civic function. The old man signed the bench. He pays for the signature. Hold still, keeper — this is a correction, not a murder. Murders require paperwork.",
        replies: [tobinScene("He nods at his squad. The prybar is already in his hand.")],
      },
      dirty: {
        speaker: "varr",
        text: "You bled the bypass. The water is brown and the report will be uglier than a beating. Still. The old man signed the bench.",
        replies: [tobinScene("The squad steps in.")],
      },
      flood: {
        speaker: "varr",
        text: "You taught the pump a new prayer and it answered by filling cellars. Impressive. Stupid. The keeper answers for his stray.",
        replies: [tobinScene("Varr is almost pleased.")],
      },
      force: {
        speaker: "varr",
        text: "Then we skip the lecture. The keeper still signed for you.",
        replies: [tobinScene("No one in the squad looks surprised.")],
      },
    },
  },
  "tobin-down": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "Tobin is on the plate, breathing like a bellows with a split seam. You can see the rib lattice trying to remember its old shape. Varr waits, curious, the way a man waits on a machine he does not believe in. Baseline is still there. It will not be, if you stand and argue.",
        replies: [
          {
            text: "Restore him completely. No scar. No memory of the blow.",
            check: { skill: "medicine", dc: 48 },
            effects: [
              flag("tobinFate", "intact"),
              { op: "discipline", id: "biology" },
              { op: "heal", id: "tobin", n: 40 },
              { op: "xp", n: 30 },
              log("The ribs seat without a ridge. Tobin's eyes clear — and something cynical leaves with the pain. Biology opens."),
              journal("tobin", "What wholeness costs", "You erased the beating. Tobin is unscarred. He is also lighter, and less armed against the world.", "done"),
            ],
            failEffects: [
              flag("tobinFate", "distorted"),
              { op: "discipline", id: "biology" },
              { op: "heal", id: "tobin", n: 10 },
              log("You force a shape the body does not quite own. He lives. The smile arrives a half-second late. Biology opens anyway, bloody."),
            ],
            goto: "fight",
            failGoto: "fight",
          },
          {
            text: "Stop the bleeding. Leave the lesson in the bone.",
            check: { skill: "medicine", dc: 32 },
            effects: [
              flag("tobinFate", "scarred"),
              { op: "discipline", id: "biology" },
              { op: "heal", id: "tobin", n: 22 },
              { op: "xp", n: 25 },
              log("You close the vessels and leave the bruise. He will walk. He will also remember the angle of the prybar. Biology opens."),
            ],
            failEffects: [
              flag("tobinFate", "scarred"),
              { op: "discipline", id: "biology" },
              { op: "hurt", id: "player", n: 6 },
              log("You stop the worst of it and take a backlash through the lens. He is scarred, alive, and furious on your behalf."),
            ],
            goto: "fight",
            failGoto: "fight",
          },
          {
            text: "I won't touch a body I might misread.",
            effects: [
              flag("tobinFate", "scarred"),
              log("You bind him with cloth like anyone else. It is slower. It is also honest. He glares at Varr over your shoulder."),
            ],
            goto: "fight",
          },
        ],
      },
      fight: {
        speaker: "varr",
        text: "Cute. Now the plate. Show me the trick before I have you tagged as a weapon.",
        replies: [
          end("Read the armor.", [
            { op: "hostile", id: "varr", on: true },
            { op: "aggro", ids: ["varr", "en1", "en2"], on: true },
            { op: "combat", ids: ["varr", "en1", "en2"] },
            log("Structural engagement. His chest coupling is a single relationship. Audit it."),
          ]),
        ],
      },
    },
  },
  "varr-down": {
    start: "start",
    nodes: {
      start: {
        speaker: "varr",
        text: "The plate is arguing with itself. I can hear it. Say your piece before the squad remembers they have rifles.",
        replies: [
          {
            text: "Crawl home. Tell RelSec their first design failed.",
            check: { skill: "speech", dc: 52 },
            effects: [
              flag("varrFate", "stood"),
              flag("act1", true),
              { op: "xp", n: 50 },
              { op: "rep", faction: "relsec", n: 8 },
              { op: "rep", faction: "bureau", n: -6 },
              { op: "item", id: "scrap" },
              journal("act1", "The checkpoint", "Varr left on his own feet, carrying a story RelSec will hate. The road south is open.", "done"),
              log("He goes. The squad looks at the place where his certainty was."),
              { op: "pin", text: "The Quarry and the Rust Districts are on the ledger." },
            ],
            failGoto: "refuse",
            goto: "done",
          },
          {
            text: "Strip the coupling and let him crawl.",
            effects: [
              flag("varrFate", "spared"),
              flag("act1", true),
              { op: "xp", n: 45 },
              { op: "rep", faction: "bureau", n: -8 },
              { op: "rep", faction: "unbound", n: 6 },
              { op: "item", id: "scrap" },
              journal("act1", "The checkpoint", "You unmade the armor and left the man. Travel is signed, more or less.", "done"),
              log("Iron silt sloughs off the cuirass. He will not wear that plate again."),
            ],
            goto: "done",
          },
          {
            text: "Finish it.",
            effects: [
              flag("varrFate", "dead"),
              flag("act1", true),
              { op: "kill", id: "varr" },
              { op: "xp", n: 40 },
              { op: "rep", faction: "bureau", n: -18 },
              { op: "rep", faction: "unbound", n: 10 },
              { op: "item", id: "scrap" },
              journal("act1", "The checkpoint", "Varr is dead. The Bureau will not file this as maintenance.", "done"),
              log("The squad does not rush you. They file the picture away."),
            ],
            goto: "done",
          },
        ],
      },
      refuse: {
        speaker: "varr",
        text: "RelSec doesn't take notes from patches.",
        replies: [
          {
            text: "Then crawl anyway.",
            effects: [
              flag("varrFate", "spared"),
              flag("act1", true),
              { op: "xp", n: 40 },
              { op: "item", id: "scrap" },
              { op: "rep", faction: "bureau", n: -10 },
              journal("act1", "The checkpoint", "Varr lives, humiliated. The south road is yours.", "done"),
            ],
            goto: "done",
          },
        ],
      },
      done: {
        speaker: "narrator",
        text: "The checkpoint is a room with the argument taken out of it. Tobin, whatever you left of him, can walk. Beyond the stacks: the Quarry, where the Bureau cuts stone, and the Rust Districts, where the people who keep the machines have started keeping each other.",
        replies: [end("File it.", [log("The world map is on your bar.")])],
      },
    },
  },
  workers: {
    start: "start",
    nodes: {
      start: {
        speaker: "hask",
        text: "Don't stand under the boom unless you want the slab as a hat. Magistrate Kael is up-pit in layered kit. Ceramic on a clasp, steel on its own rivets, mesh on a weave he does not want you to read. None of them is the root of the others. He says that's the point.",
        replies: [
          {
            text: "The slab is down, and your people were not under it.",
            requires: [{ flag: "quarryStone", is: "clear" }],
            goto: "after-clear",
          },
          {
            text: "The slab is down. Someone was still on the hook.",
            requires: [{ flag: "quarryStone", is: "scarred" }],
            goto: "after-scar",
          },
          {
            text: "Get your people off the stone. I'll deal with him.",
            effects: [
              flag("workersClear", true),
              { op: "xp", n: 10 },
              log("Hask whistles. The riggers drain off the marked slabs like water off a grate."),
              journal("quarry", "Geometry of the pit", "The riggers are clear. The crane is a tool again, not a crowd.", "open"),
            ],
            goto: "more",
          },
          {
            text: "The line has the bellows diagram.",
            goto: "diagram",
            requires: [{ flag: "workersKnow", is: true }],
          },
          { text: "Tell me about the armor.", goto: "armor" },
          end("I'll watch my feet."),
        ],
      },
      armor: {
        speaker: "lin",
        text: "Three arguments. The silk doesn't know the iron is there. The iron doesn't know the matrix is there. If you cut one, the other two keep their jobs. He brought a striker. The striker is a smaller version of the same insult.",
        replies: [
          {
            text: "Clear the stone anyway.",
            requires: [{ missing: "workersClear" }],
            effects: [flag("workersClear", true), log("They move. Nobody argues with a Patch who is already looking at the crane.")],
            goto: "more",
          },
          end("That's enough."),
        ],
      },
      more: {
        speaker: "hask",
        text: "Kael wants a conversation first. He likes those. He thinks conversations are where other people kneel. The crane's brake is a pawl, if you're the sort who reads pawls.",
        replies: [end("I'll go hear him.")],
      },
      "after-clear": {
        speaker: "hask",
        text: "Stone on the ground, and nobody wearing it. If the plate stair is signed and the squad is not sitting on the road mouth, that load can reach the Rust Districts. A hearth there is waiting on a parent. I am not the parent. The road is.",
        replies: [end("Then the road is the next seam.")],
      },
      "after-scar": {
        speaker: "hask",
        text: "You dropped a hill on a person who was still a person. The stone does not become innocent because the tenement needs it. If the stair is open, it will still move. Do not ask me to call that a mend.",
        replies: [end("I won't call it that.")],
      },
      diagram: {
        speaker: "lin",
        text: "Wren sent the lung. The pump is not the parent. The bellows is. If that reed stops, our stone can still move and the forge in Rust will still go thirsty, because quench is a child of the gallery. Tell that to anyone who calls a district a room.",
        replies: [end("Then the lung is in the pit too.")],
      },
    },
  },
  "kael-pre": {
    start: "start",
    nodes: {
      start: {
        speaker: "kael",
        text: "The Patch who unstitched a captain. RelSec dressed me in three materials that refuse to be one object. Find a seam. I will be changing the other two while you congratulate yourself.",
        replies: [
          {
            text: "Silk doesn't bear iron. You're wearing a costume and calling it a doctrine.",
            check: { skill: "history", dc: 62 },
            effects: [
              flag("matrixKnown", true),
              { op: "xp", n: 15 },
              log("Kael's mouth thins. The matrix flickers, embarrassed to have been named."),
            ],
            goto: "duel",
            failGoto: "duel",
            failEffects: [log("He smiles as if you have recited a hymn incorrectly.")],
          },
          {
            text: "The riggers walk. You and I finish this.",
            requires: [{ flag: "workersClear", is: true }],
            effects: [flag("duel", true), log("He waves the striker back. 'A private geometry, then.'")],
            goto: "fight",
          },
          { text: "Then show me the layers.", goto: "fight" },
          end("Not this minute."),
        ],
      },
      duel: {
        speaker: "kael",
        text: "History. How provincial. Do you want the striker in the proof, or shall we keep this intimate?",
        replies: [
          {
            text: "Just you.",
            effects: [flag("duel", true)],
            goto: "fight",
          },
          { text: "Bring whoever you trust. You shouldn't.", goto: "fight" },
        ],
      },
      fight: {
        speaker: "kael",
        text: "Audit quickly. I do not remain a diagram.",
        replies: [
          end("Engage.", [
            { op: "hostile", id: "kael", on: true },
            { op: "aggro", ids: ["kael", "rel1"], on: true },
            { op: "combat", ids: ["kael", "rel1"] },
          ]),
        ],
      },
    },
  },
  "kael-down": {
    start: "start",
    nodes: {
      start: {
        speaker: "kael",
        text: "Enough. The silk has divorced the iron. You understand the trick, which means the Citadel will already be building a worse one. There is a siphon under the spires. It drinks the lower city and calls the meal 'standardization.'",
        replies: [
          {
            text: "Live. Take that sentence to someone who prints things.",
            effects: [
              flag("kaelFate", "spared"),
              flag("knowsSiphon", true),
              flag("citadelOpen", true),
              { op: "xp", n: 70 },
              { op: "rep", faction: "relsec", n: -8 },
              { op: "item", id: "shard" },
              journal("siphon", "The siphon", "Kael, alive and bitter, named the engine under the Citadel: it drains the lower city to keep the spires lifted.", "open"),
              log("He leaves the pit without his doctrine. The shard of it stays in your pocket."),
            ],
            goto: "end",
          },
          {
            text: "The doctrine dies with the man.",
            effects: [
              flag("kaelFate", "dead"),
              flag("knowsSiphon", true),
              flag("citadelOpen", true),
              { op: "kill", id: "kael" },
              { op: "xp", n: 60 },
              { op: "rep", faction: "relsec", n: -20 },
              { op: "rep", faction: "unbound", n: 8 },
              { op: "item", id: "shard" },
              journal("siphon", "The siphon", "You killed Kael. On his body, notes: Oakhaven's lifts drink the lower wards.", "open"),
              log("The pit is quieter by one magistrate."),
            ],
            goto: "end",
          },
        ],
      },
      end: {
        speaker: "narrator",
        text: "The Quarry keeps the mark of the boom and the argument. The High Citadel is no longer a rumor. If the Unbound in the Rust Districts have a say, they have not said it yet.",
        replies: [end("Onward.")],
      },
    },
  },
  ives: {
    start: "start",
    nodes: {
      start: {
        speaker: "ives",
        text: "Guildmaster Ives. If you're the Patch from the Sinks, sit before you pace a hole in my floor. We keep machines running for people who are not allowed to own them. The Bureau calls that theft. I call it Tuesday.",
        replies: [
          {
            text: "The tenement has a night. Stone is the parent.",
            requires: [{ flag: "tenementWarm", is: true }, { flag: "stoneMoving", is: true }],
            goto: "stone-warm",
          },
          {
            text: "The hall is warm. The sleepers are not.",
            requires: [{ flag: "guildWarm", is: true }, { flag: "tenementWarm", is: false }],
            goto: "stone-hall",
          },
          {
            text: "The fire is banked. The quarry is not feeding it.",
            requires: [{ flag: "hearthHeld", is: true }, { flag: "stoneMoving", is: false }],
            goto: "stone-bank",
          },
          {
            text: "Kael is finished. He talked about a siphon.",
            goto: "siphon",
            requires: [{ flag: "knowsSiphon", is: true }],
          },
          { text: "I'm looking for the people who maintain the maintainers.", goto: "welcome" },
          {
            text: "There's a woman in your back room who looks unfinished.",
            goto: "mara",
            requires: [{ missing: "maraFate" }],
          },
          {
            text: "The stone is moving and the forge still has no stock.",
            goto: "no-stock",
            requires: [{ flag: "stoneMoving", is: true }, { flag: "gearLive", is: false }, { flag: "stockRefused", is: false }],
          },
          {
            text: "The stock was refused. The parents were not.",
            goto: "refused-stock",
            requires: [{ flag: "stockRefused", is: true }],
          },
          {
            text: "The quarry line is saying the bellows is a lung.",
            goto: "lung-heard",
            requires: [{ flag: "ivesHeardLung", is: true }],
          },
          {
            text: "Buy plate off the live stock. (18 scrip)",
            requires: [{ flag: "gearLive", is: true }, { scrip: 18 }],
            effects: [
              { op: "scrip", n: -18 },
              { op: "item", id: "scrap" },
              log("Ives hands you plate from a stock that had three parents. She does not name them like virtues."),
            ],
            end: true,
          },
          end("Just passing the stacks."),
        ],
      },
      welcome: {
        speaker: "ives",
        text: "Then you found a room, not an army. Mara is in the side bay. The state wiped her and kept the skills that made her useful. I won't order you to touch a mind. I will tell you the Citadel's crucible is real, and that someone has to decide what a city is allowed to drink.",
        replies: [
          {
            text: "I'll speak to Mara before I decide anything about a city.",
            effects: [
              flag("guildBriefed", true),
              flag("citadelOpen", true),
              journal("guild", "The Unbound", "Ives will not call it a rebellion. She will call it maintenance. The Citadel is open to you.", "open"),
            ],
            end: true,
          },
          end("I'll think in the street."),
        ],
      },
      siphon: {
        speaker: "ives",
        text: "Good. A magistrate's confession is still a confession. The crucible sits under the ranking floor. You can darken it, move it, expose it, or — if you are the sort of fool I fear you are — sit in it. None of those are innocent. Go. And talk to Mara if you have not. She is a person, not a tool you found.",
        replies: [
          end("The Citadel, then.", [
            flag("guildBriefed", true),
            flag("citadelOpen", true),
            { op: "xp", n: 20 },
            journal("guild", "The Unbound", "Ives confirmed the siphon. The choice of what to do with it is yours, and she will live with it.", "open"),
          ]),
        ],
      },
      mara: {
        speaker: "ives",
        text: "She remembers a procedure number and the taste of copper. She does not remember why she flinches at lullabies. If you 'fix' her, do it where I can hear the reason.",
        replies: [end("I'll hear her first.")],
      },
      "stone-warm": {
        speaker: "ives",
        text: "Then the pit, the stair, and this room are one machine. Do not file it as a kindness. File it as a parent. The crucible under the spires invoices populations that stay warm. You just gave it a better meal, and you also gave my people a night. Both sentences are true.",
        replies: [end("Both stay in the ledger.")],
      },
      "stone-hall": {
        speaker: "ives",
        text: "A hall without sleepers is a workshop counting down. The benches will lie and say the district is fine. It is not. Throw the flue back, or tell me you meant the cold.",
        replies: [end("I know which flue I threw.")],
      },
      "stone-bank": {
        speaker: "ives",
        text: "Your weight is not a quarry. When you leave, ask what the bed is hanging on. If the answer is only you, the night ends when you do.",
        replies: [end("Then it needs a parent that is not my shoulder.")],
      },
      "no-stock": {
        speaker: "ives",
        text: "The forge is not a wish. It wants sound ore, quench from the gallery, and a fire that has a parent. Miss one and I have a bench, not a wage. Do not ask me to call the missing one a moral.",
        replies: [end("I'll find which parent is down.")],
      },
      "refused-stock": {
        speaker: "ives",
        text: "You cut the child and left the parents standing. The hall gets no new rifles from that stock. The pit does not become kind because the stock is dark. Tell me you meant the child.",
        replies: [end("I meant the child.")],
      },
      "lung-heard": {
        speaker: "ives",
        text: "Then the hall's heat and the ward's water are not two cities. If that lung stops, do not bring me a story about a local fault. Bring me the reed.",
        replies: [end("That's the diagram they have.")],
      },
    },
  },
  mara: {
    start: "start",
    nodes: {
      start: {
        speaker: "mara",
        text: "If Ives sent you, say so. If the Bureau sent you, leave the way the steam does. I am Mara. I have a number where a childhood should be. People keep offering to return things I cannot inspect.",
        replies: [
          {
            text: "What did the procedure leave you for protection?",
            check: { skill: "psychology", dc: 42 },
            goto: "protect",
            failGoto: "flat",
            effects: [{ op: "xp", n: 10 }],
            failEffects: [log("She watches your mouth, not your eyes. The question does not land.")],
          },
          { text: "I can see the cut. I want to talk about putting memory back.", goto: "offer" },
          end("I won't touch what I haven't heard."),
        ],
      },
      flat: {
        speaker: "mara",
        text: "Try a smaller question. I am not a pump.",
        replies: [{ text: "All right. The cut, then.", goto: "offer" }, end("Another time.")],
      },
      protect: {
        speaker: "mara",
        text: "It left me a flinch that knows badges. A cadence for service doors. Nights I don't enjoy and don't waste. If those are symptoms, they are also how I am still in this room and not in a drawer.",
        replies: [{ text: "Then the choice should be said plainly.", goto: "offer" }],
      },
      offer: {
        speaker: "narrator",
        text: "The lattice is visible if you are willing to call a person a system. Restoring the historical baseline would sand the trauma flat. She would suffer less. She might also lose the flinch, the cadence, and the particular hardness that keeps her alive. Leaving it is not neutral either. You would be choosing her pain because it is useful.",
        replies: [
          {
            text: "Restore the baseline. Take the pain and what it taught.",
            check: { skill: "psychology", dc: 46 },
            effects: [
              flag("maraFate", "restored"),
              { op: "discipline", id: "mind" },
              { op: "xp", n: 40 },
              { op: "rep", faction: "unbound", n: 4 },
              log("Memory returns like warm water. The flinch does not. She laughs, startled by it, and looks suddenly young. Mind opens. The service cadence is gone with the scar."),
              journal(
                "mara",
                "Mara's baseline",
                "You restored her. She is lighter, and she no longer remembers the door-cadence that would have opened the Citadel shaft.",
                "done",
              ),
            ],
            failEffects: [
              flag("maraFate", "untouched"),
              log("The lattice squirms out of your grip. You stop before you invent a stranger. She is pale, and still herself."),
            ],
            goto: "after-restored",
            failGoto: "start",
          },
          {
            text: "I see the cut. I won't take the scar tissue. It grew into you.",
            effects: [
              flag("maraFate", "intact"),
              { op: "discipline", id: "mind" },
              { op: "xp", n: 35 },
              log("You close nothing. She exhales as if a hand left her throat. The cadence stays. So do the nights. Mind opens — as a refusal."),
              journal(
                "mara",
                "Mara's baseline",
                "You left the trauma intact. She keeps the shaft cadence and the cost of it.",
                "done",
              ),
            ],
            goto: "after-intact",
          },
          end("I don't have the right. Not today.", [flag("maraFate", "untouched"), log("She nods, once, like a lock seating.")]),
        ],
      },
      "after-restored": {
        speaker: "mara",
        text: "I can remember a kitchen. I can't remember the door-song. Don't look so proud and so sorry at the same time. If you're walking at the Citadel, I'll come. I will be bad at ambushes and good at not wanting them.",
        replies: [
          end("Come on.", [{ op: "recruit", id: "mara" }, log("Mara joins you. She hums, then stops, embarrassed by happiness.")]),
          end("Stay. Learn the kitchen again."),
        ],
      },
      "after-intact": {
        speaker: "mara",
        text: "Then we understand each other. I still have the song they use on the shaft door. It is not a gift. It is a tool with blood on the handle. I'll walk with you if you can stand the nights.",
        replies: [
          end("Bring the song. And yourself.", [{ op: "recruit", id: "mara" }, log("Mara falls in. She does not hum.")]),
          end("Keep the song here, where it's safer."),
        ],
      },
    },
  },
  sera: {
    start: "start",
    nodes: {
      start: {
        speaker: "sera",
        text: "You will mend this city until nothing in it is allowed to end. Endings are how iron becomes soil. The Ash is not a bomb. It is a permission.",
        replies: [
          {
            text: "Name one thing that should stay broken.",
            effects: [
              flag("ashCounsel", true),
              { op: "rep", faction: "ash", n: 8 },
              log("She says: the crucible. Not the people. The appetite."),
              journal("ash", "Ash counsel", "Sera says the crucible should stay broken. She did not ask you to break the people attached to it.", "open"),
            ],
            goto: "name",
          },
          {
            text: "A city that cannot repair its water is just a slower death.",
            check: { skill: "history", dc: 50 },
            effects: [{ op: "xp", n: 10 }, log("She considers the Sinks, and does not sneer. 'Water, then. Not thrones.'")],
            end: true,
            failEffects: [log("She has heard the Bureau use longer words for the same idea.")],
          },
          {
            text: "The forge is making gear.",
            goto: "gear",
            requires: [{ flag: "gearLive", is: true }],
          },
          {
            text: "The stock was refused.",
            goto: "refused",
            requires: [{ flag: "stockRefused", is: true }],
          },
          {
            text: "Come and watch what I cut.",
            goto: "join",
            requires: [{ flag: "ashCounsel", is: true }, { noCompanion: true }],
          },
          {
            text: "Stay with the ash. I'll go alone.",
            requires: [{ companion: "sera" }],
            effects: [{ op: "dismiss", id: "sera" }, log("Sera stays. She says the watching can be done from here.")],
            end: true,
          },
          end("I didn't come to be preached at."),
        ],
      },
      name: {
        speaker: "sera",
        text: "If you darken the siphon, do not replace it with your own face. A hole is honest. A new god in work boots is how the Bureau started, probably, on a Tuesday.",
        replies: [end("I'll remember the warning.")],
      },
      gear: {
        speaker: "sera",
        text: "Three parents. None of them is a virtue. If the hall turns that stock into rifles, you do not get to be surprised. You can still refuse the child and leave the parents standing.",
        replies: [end("I know which seam I meant.", [flag("seraSawGear", true)])],
      },
      refused: {
        speaker: "sera",
        text: "You cut the child and left the parents. That is a choice. A dead quarry would have been a different choice. I will not thank you. I will also not call the rifles that did not get made a tragedy.",
        replies: [end("That's the choice.")],
      },
      join: {
        speaker: "sera",
        text: "I will walk. I will not call a cut a kindness, and I will not leave because we disagree. If you take a throne, I will be afraid and I will still be there to say so.",
        replies: [
          end("Walk.", [
            { op: "recruit", id: "sera" },
            log("Sera falls in. She does not promise to agree."),
            journal("sera-road", "Sera on the road", "She came to watch the cuts. Disagreement is not a departure.", "done"),
          ]),
          end("Not yet."),
        ],
      },
    },
  },
  "shaft-door": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A maintenance door in the Citadel's throat. The sentry on the far side is listening for a cadence, not a speech. The lock is a relationship between a pin, a spring, and a habit.",
        replies: [
          {
            text: "Use Mara's service cadence.",
            requires: [{ flag: "maraFate", is: "intact" }],
            check: { skill: "lockwork", dc: 34 },
            effects: [flag("shaftOpen", true), { op: "hostile", id: "sentry", on: false }, log("The pin turns. Sentry Quill hears a tech's song and studies the wall.")],
            failEffects: [log("The cadence slips. Quill's rifle lifts.")],
            end: true,
            failGoto: "force",
          },
          {
            text: "Pick it like any other arrogant lock.",
            check: { skill: "lockwork", dc: 58 },
            effects: [flag("shaftOpen", true), { op: "xp", n: 15 }, log("The lock gives. You are through before the sentry finishes deciding you exist.")],
            failEffects: [log("The pick sings. That was the wrong song.")],
            end: true,
            failGoto: "force",
          },
          {
            text: "The hinge is tired. Persuade the metal.",
            check: { skill: "engineering", dc: 52 },
            effects: [flag("shaftOpen", true), log("You ease the hinge's load. The door admits it was never a wall.")],
            end: true,
            failGoto: "force",
            failEffects: [log("The hinge screams in a small metal voice.")],
          },
          end("Leave it shut."),
        ],
      },
      force: {
        speaker: "sentry",
        text: "That's not a cadence. That's a Patch. Down on the plate.",
        replies: [
          end("Fine.", [
            { op: "aggro", ids: ["sentry"], on: true },
            { op: "combat", ids: ["sentry"] },
          ]),
        ],
      },
    },
  },
  sentry: {
    start: "start",
    nodes: {
      start: {
        speaker: "sentry",
        text: "Maintenance window is dawn. You are not dawn.",
        replies: [
          {
            text: "I'm on the crucible job. Ask Vane if you like stairs.",
            check: { skill: "speech", dc: 60 },
            effects: [{ op: "hostile", id: "sentry", on: false }, log("He hates the sentence and lets it pass.")],
            end: true,
            failGoto: "fight",
          },
          { text: "Then we do this your way.", goto: "fight" },
          end("Dawn it is."),
        ],
      },
      fight: {
        speaker: "sentry",
        text: "Squad call.",
        replies: [end("Engage.", [{ op: "aggro", ids: ["sentry"], on: true }, { op: "combat", ids: ["sentry"] }])],
      },
    },
  },
  vane: {
    start: "start",
    nodes: {
      start: {
        speaker: "vane",
        text: "Evaluator Vane. You are the zero that learned to read. The crucible is not a villain. It is how the spires stay in the air and how the lower wards stay in their rank. Standardization is a kindness if you have never had a standard.",
        replies: [
          {
            text: "The tenement kept its heat. The lower city still has a night.",
            requires: [{ flag: "tenementWarm", is: true }, { flag: "stoneMoving", is: true }],
            goto: "labor",
          },
          {
            text: "The road is feeding your stores.",
            goto: "fed",
            requires: [{ flag: "citadelSupplied", is: true }],
          },
          {
            text: "Your plate is unfed.",
            goto: "toll",
            requires: [{ flag: "guardToll", is: true }],
          },
          {
            text: "The guild is warm. The sleepers left the flue.",
            requires: [{ flag: "guildWarm", is: true }, { flag: "tenementWarm", is: false }],
            goto: "labor-thin",
          },
          {
            text: "It's a siphon. Kindness doesn't invoice a person's pulse.",
            goto: "choice",
            requires: [{ flag: "knowsSiphon", is: true }],
          },
          { text: "Let me look at the engine before I borrow your words.", goto: "look" },
          { text: "I've already touched it.", goto: "already", requires: [{ flag: "citadelFate", is: "sever" }] },
          { text: "I've already touched it.", goto: "already-r", requires: [{ flag: "citadelFate", is: "redirect" }] },
          { text: "I've already touched it.", goto: "already-s", requires: [{ flag: "citadelFate", is: "seize" }] },
          end("I'm still walking the floor."),
        ],
      },
      look: {
        speaker: "vane",
        text: "Look, then. The conduits feed the siphon. The siphon feeds the lifts and the rank engine. If you are a child you will break the brightest part. If you are a tyrant you will sit in the engine and call it rescue.",
        replies: [{ text: "And if I tell the city, in the ceremony, with your pins on?", goto: "choice" }],
      },
      labor: {
        speaker: "vane",
        text: "Then the siphon still has a meal. A warm tenement is a pulse the rank engine can invoice. Do not confuse a repaired hearth with a city that has stopped being eaten.",
        replies: [{ text: "Then show me the engine.", goto: "look" }],
      },
      fed: {
        speaker: "vane",
        text: "Stone from the pit, across a signed stair, into my stores. You keep treating districts like rooms. The plate ate because the quarry allowed it. That is not gratitude. That is a parent.",
        replies: [{ text: "Then show me the engine.", goto: "look" }],
      },
      toll: {
        speaker: "vane",
        text: "Unfed plate prices a door. Do not call it cruelty and do not call it policy. The cargo did not arrive, or someone held it. The guards are a child of that absence.",
        replies: [{ text: "Then show me the engine.", goto: "look" }],
      },
      "labor-thin": {
        speaker: "vane",
        text: "A hall without sleepers is a workshop counting down. The crucible prefers populations that stay. You have already begun to thin its meal. That is not a victory. It is a smaller invoice.",
        replies: [{ text: "Then show me the engine.", goto: "look" }],
      },
      choice: {
        speaker: "vane",
        text: "The ranking ceremony is in an hour. I can put your reading on the horns, or I can have the floor cleaned. Choose in language, or choose on the machine. I will not pretend they are different acts.",
        replies: [
          {
            text: "Put it on the horns. Let them hear what the lifts eat.",
            check: { skill: "speech", dc: 58 },
            effects: [
              flag("citadelFate", "expose"),
              flag("spireOpen", true),
              { op: "xp", n: 80 },
              { op: "rep", faction: "bureau", n: -12 },
              { op: "rep", faction: "unbound", n: 14 },
              { op: "discipline", id: "causal" },
              journal("siphon", "The siphon", "You exposed the crucible at the ceremony. The city heard. Causal sight opens. The Void Spire is no longer theoretical.", "done"),
              log("The horns carry the diagram. Somewhere a clerk drops a stamp. Causality opens."),
            ],
            end: true,
            failGoto: "fail",
            failEffects: [log("The ceremony does not take your voice. Vane's pins were never going to.")],
          },
          {
            text: "History, then. Read the old name of the engine into the record.",
            check: { skill: "history", dc: 60 },
            effects: [
              flag("citadelFate", "expose"),
              flag("spireOpen", true),
              { op: "xp", n: 80 },
              { op: "rep", faction: "engineers", n: 10 },
              { op: "rep", faction: "unbound", n: 8 },
              { op: "discipline", id: "causal" },
              journal("siphon", "The siphon", "You named the engine by its older name. The record flinched. The Spire is waiting.", "done"),
              log("An older word hits the horns and the rank pins click like insects."),
            ],
            end: true,
            failGoto: "fail",
          },
          end("I'll answer on the machine itself."),
        ],
      },
      fail: {
        speaker: "vane",
        text: "Then the floor will be cleaned.",
        replies: [
          end("No.", [
            { op: "aggro", ids: ["guard1", "guard2"], on: true },
            { op: "combat", ids: ["guard1", "guard2"] },
          ]),
        ],
      },
      already: {
        speaker: "vane",
        text: "The lifts are failing and you want a conversation. Very well. You have made a dark city. Do not be shocked when it grows teeth. The Spire under the old works has started to move. Someone with no baseline is signing orders in RelSec's ruin.",
        replies: [end("Then that's next.", [flag("spireOpen", true), { op: "discipline", id: "causal" }])],
      },
      "already-r": {
        speaker: "vane",
        text: "You fed the Sinks and starved the balconies. The Unbound will kiss you until the pressure drops. The Spire is awake. Go look at what a system does when its author leaves.",
        replies: [end("I'm going.", [flag("spireOpen", true), { op: "discipline", id: "causal" }])],
      },
      "already-s": {
        speaker: "vane",
        text: "You sat in the engine. Do not ask me to bless the crown because it was forged in a maintenance bay. The Spire will test whether you are a baseline or a thief.",
        replies: [end("Let it test.", [flag("spireOpen", true), { op: "discipline", id: "causal" }])],
      },
    },
  },
  "sovereign-pre": {
    start: "start",
    nodes: {
      start: {
        speaker: "sovereign",
        text: "You kept a ledger of other people's parts. I burned my baseline. There is no correct Silas-shaped answer for me, and you will hate that more than the claws. Mend me. I dare you. The graph will not be where you left it.",
        replies: [
          {
            text: "I already sat in the engine.",
            goto: "sat",
            requires: [{ flag: "citadelFate", is: "seize" }],
          },
          {
            text: "Then I'll read you while you move.",
            effects: [
              { op: "hostile", id: "sovereign", on: true },
              { op: "aggro", ids: ["sovereign", "echo"], on: true },
              { op: "combat", ids: ["sovereign", "echo"] },
              { op: "discipline", id: "continuity" },
              log("Continuity opens. The live seam will move. Audit every round. Decoys bite back."),
            ],
            end: true,
          },
          end("Not while the graph is a lie. I'll circle."),
        ],
      },
      sat: {
        speaker: "sovereign",
        text: "You already wrote a baseline and called it maintenance. Do not pretend mine is the first theft. The graph will still move. A throne does not make a reading true.",
        replies: [
          {
            text: "Then I'll read you while you move.",
            effects: [
              { op: "hostile", id: "sovereign", on: true },
              { op: "aggro", ids: ["sovereign", "echo"], on: true },
              { op: "combat", ids: ["sovereign", "echo"] },
              { op: "discipline", id: "continuity" },
              log("Continuity opens. The live seam will move. Audit every round. Decoys bite back."),
            ],
            end: true,
          },
          end("Not while the graph is a lie. I'll circle."),
        ],
      },
    },
  },
  "sovereign-down": {
    start: "start",
    nodes: {
      start: {
        speaker: "sovereign",
        text: "There. You can break a thing that refuses to be known. You still have not answered the only question the city cares about. It is full of holes. Will you write the shape — your baseline, over the city — or will you leave the holes and let them keep their names?",
        replies: [
          {
            text: "Write the shape.",
            effects: [
              { op: "epilogue", ending: "impose" },
              { op: "xp", n: 100 },
              flag("ending", "impose"),
            ],
            end: true,
          },
          {
            text: "Leave the holes.",
            effects: [
              { op: "epilogue", ending: "release" },
              { op: "xp", n: 100 },
              flag("ending", "release"),
            ],
            end: true,
          },
        ],
      },
    },
  },
  "enc-patrol": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A Bureau pair steps out of the stack-shadow. Their lenses are the cheap kind. One of them has your description and is trying not to look proud of it.",
        replies: [
          {
            text: "Pay the toll. (15 scrip)",
            requires: [{ scrip: 15 }],
            effects: [{ op: "scrip", n: -15 }, { op: "rep", faction: "bureau", n: 2 }, log("The chit is ugly and sufficient."), { op: "arrive" }],
            end: true,
          },
          {
            text: "Wrong district. Your sergeant is already angry.",
            check: { skill: "speech", dc: 52 },
            effects: [{ op: "xp", n: 12 }, log("They peel off toward a sergeant who will not thank them."), { op: "arrive" }],
            failEffects: [log("The cheap lens flares. They want the road.")],
            end: true,
            failGoto: "fight",
          },
          {
            text: "Be steam.",
            check: { skill: "sneak", dc: 55 },
            effects: [log("You are a flange. They walk past a flange."), { op: "arrive" }],
            failGoto: "fight",
            end: true,
          },
          { text: "Break them.", goto: "fight" },
        ],
      },
      fight: {
        speaker: "narrator",
        text: "The road widens into a fight.",
        replies: [
          end("Take the ground.", [
            { op: "goto", map: "road", x: 3, y: 4 },
            { op: "spawn", template: "enforcer", id: "roadA", x: 7, y: 3 },
            { op: "spawn", template: "enforcer", id: "roadB", x: 8, y: 4 },
            { op: "combat", ids: ["roadA", "roadB"] },
          ]),
        ],
      },
    },
  },
  "enc-refugees": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A handcart of people from a darkened stair. A child holds a pressure gauge like a saint's token. They are not asking for a doctrine. They are asking whether the next ward has water.",
        replies: [
          {
            text: "Give a bandage and the truth you have.",
            requires: [{ item: "bandage" }],
            effects: [
              { op: "take", id: "bandage", n: 1 },
              flag("refugeeMet", true),
              flag("knowsSiphon", true),
              { op: "rep", faction: "unbound", n: 6 },
              log("They tell you the spires drink in pulses. You can feel it in the fillings if you live low enough."),
              { op: "arrive" },
            ],
            end: true,
          },
          {
            text: "Point them at the Sinks and keep walking.",
            effects: [flag("refugeeMet", true), log("You give a direction. It is not nothing. It is not a bandage."), { op: "arrive" }],
            end: true,
          },
          end("Say nothing. Arrive anyway.", [{ op: "arrive" }]),
        ],
      },
    },
  },
  "enc-trader": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A licensed tinker with an unlicensed smile. Phials, bandages, and a coat that used to be a door. The stacks hiss overhead like a audience.",
        replies: [
          {
            text: "Phial, 12 scrip.",
            requires: [{ scrip: 12 }],
            effects: [{ op: "scrip", n: -12 }, { op: "item", id: "phial" }, log("You pocket the phial."), { op: "arrive" }],
            end: true,
          },
          {
            text: "Bandage, 8 scrip.",
            requires: [{ scrip: 8 }],
            effects: [{ op: "scrip", n: -8 }, { op: "item", id: "bandage" }, { op: "arrive" }],
            end: true,
          },
          {
            text: "Haggle the coat-of-plate down. (20)",
            requires: [{ scrip: 20 }],
            check: { skill: "barter", dc: 48 },
            effects: [{ op: "scrip", n: -20 }, { op: "item", id: "coat" }, log("The plate-coat settles on your shoulders like a decision."), { op: "arrive" }],
            failEffects: [{ op: "scrip", n: -28 }, { op: "item", id: "coat" }, log("You pay the proud price. The coat is still good."), { op: "arrive" }],
            end: true,
          },
          end("No trade.", [{ op: "arrive" }]),
        ],
      },
    },
  },
  "enc-auto": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "An automaton is walking the road with no work order. Its eye is a patient amber. The tool mount twitches toward anything that looks like a bolt, including knees.",
        replies: [
          {
            text: "Talk to the coupling before it talks to you.",
            check: { skill: "mechanics", dc: 50 },
            effects: [
              { op: "xp", n: 18 },
              log("You unseat the work-order latch with a phrase older than the Bureau. It sits down in the road like a tired horse."),
              { op: "arrive" },
            ],
            failGoto: "fight",
            end: true,
            failEffects: [log("It does not recognize your accent.")],
          },
          { text: "Take it apart on purpose.", goto: "fight" },
          end("Give it the road.", [{ op: "arrive" }, log("You take the ditch. It takes the crown of the lane.")]),
        ],
      },
      fight: {
        speaker: "narrator",
        text: "The mount locks.",
        replies: [
          end("Engage.", [
            { op: "goto", map: "road", x: 3, y: 4 },
            { op: "spawn", template: "automaton", id: "roadM", x: 7, y: 3 },
            { op: "combat", ids: ["roadM"] },
          ]),
        ],
      },
    },
  },
  "road-after": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "The road remembers the fight only as scattered fasteners. Your destination is still ahead, and the stacks have not paused for you.",
        replies: [end("Continue.", [{ op: "arrive" }])],
      },
    },
  },
  workbench: {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "The bench smells of solvent and honest failure. You can sleep in the lee of it, or you can make something ruder than a prybar.",
        replies: [
          {
            text: "Rest.",
            effects: [{ op: "rest" }, log("You sleep like a tool put back in the drawer. It helps.")],
            end: true,
          },
          {
            text: "Turn plate scrap into a rivet gun.",
            requires: [{ item: "scrap" }],
            check: { skill: "mechanics", dc: 42 },
            effects: [
              { op: "take", id: "scrap", n: 1 },
              { op: "item", id: "rivet" },
              log("The gun chambers on the second try. It will do."),
            ],
            failEffects: [log("The scrap sulks. Your hands are not there yet.")],
            end: true,
          },
          end("Leave the bench be."),
        ],
      },
    },
  },
};

function tobinScene(lead: string): Reply {
  return {
    text: "Step between them.",
    effects: [
      { op: "hurt", id: "tobin", n: 18 },
      log(lead + " Tobin goes down. The lattice is still readable."),
      flag("tobinDown", true),
    ],
    goto: "ignored",
  };
}

// The tobin-down convo is entered by the effect chain from varr via a dedicated goto.
// Wire varr replies to open tobin-down by replacing the helper's goto with an explicit end+flag
// and let the store notice tobinDown. Simpler: make the reply end into tobin-down by using goto
// on a node that doesn't exist in varr-gate. Fix below by editing the replies to jump convos.
void tobinScene;

// Re-bind the confrontation replies so they hand off cleanly.
for (const key of ["after", "dirty", "flood", "force"] as const) {
  const node = CONVOS["varr-gate"].nodes[key];
  node.replies = [
    {
      text: "Get away from him.",
      effects: [
        { op: "hurt", id: "tobin", n: 16 },
        log("The prybar finds Tobin's ribs. He drops. You can still see the shape he is supposed to be."),
      ],
      goto: "handoff",
    },
  ];
}
CONVOS["varr-gate"].nodes.handoff = {
  speaker: "narrator",
  text: "There is time for one decision before Varr's curiosity becomes a squad action.",
  replies: [
    {
      text: "Open the ledger on Tobin.",
      jump: { convo: "tobin-down", node: "start" },
    },
  ],
};

CONVOS.wren = {
  start: "start",
  nodes: {
    start: {
      speaker: "wren",
      text: "Don't mind the soot. I'm Wren. I keep the lines the Bureau forgets, which is most of them. You're the zero they spat out. Tobin is already telling that story like it was his idea.",
      replies: [
        {
          text: "The checkpoint.",
          goto: "checkpoint",
          requires: [{ history: { ask: "now", id: "varr", fate: "stood-down" } }],
        },
        {
          text: "The checkpoint.",
          goto: "checkpoint-open",
          requires: [{ history: { ask: "now", id: "varr", fate: "broken-open" } }],
        },
        {
          text: "The checkpoint.",
          goto: "checkpoint-gone",
          requires: [{ history: { ask: "now", id: "varr", fate: "dead" } }],
        },
        {
          text: "The checkpoint.",
          goto: "checkpoint-left",
          requires: [{ history: { ask: "now", id: "varr", fate: "escaped" } }],
        },
        { text: "The pump is dead. What actually stopped it?", goto: "lock" },
        {
          text: "I need a way past the checkpoint that isn't a speech.",
          goto: "crawl",
          requires: [{ missing: "knowsCrawl" }],
        },
        {
          text: "Seat this valve. I don't trust my own hands.",
          goto: "hands",
          requires: [{ item: "valve" }, { missing: "pumpFate" }],
        },
        {
          text: "The door by the sludge won't move.",
          goto: "dry-door",
          requires: [{ flag: "sumpOpen", is: false }],
        },
        {
          text: "The gallery took pressure.",
          goto: "gallery",
          requires: [{ flag: "sumpOpen", is: true }, { missing: "jackHeld" }],
        },
        {
          text: "The crown.",
          goto: "gallery-held",
          requires: [{ flag: "jackHeld", is: true }],
        },
        {
          text: "The bellows is the pump's lung. Tell the line.",
          goto: "lung",
          requires: [{ flag: "reedRead", is: true }, { missing: "toldWren" }],
        },
        {
          text: "Walk the lines with me.",
          goto: "join",
          requires: [{ flag: "act1", is: true }, { noCompanion: true }],
        },
        {
          text: "Stay on the lines. I'll go alone.",
          requires: [{ companion: "wren" }],
          effects: [{ op: "dismiss", id: "wren" }, log("Wren stays with the lines she already keeps.")],
          end: true,
        },
        {
          text: "Walk the pit with me. The diagram can wait.",
          requires: [{ companion: "wren" }, { missing: "wrenWalked" }],
          effects: [flag("wrenWalked", true), log("Wren comes off the bench. The pit is the same city, walked.")],
          end: true,
        },
        end("Back to the iron."),
      ],
    },
    lock: {
      speaker: "wren",
      text: "The valve lost its seat. There is also a Bureau lockout welded on the feed, under the gauge glass. It is not broken. It is obedient. Cut it and the water moves, and the checkpoint will call that sabotage. Mend the valve if you have a true one. Open the bypass if you can live with brown water. Or hand me the part and I will do the honest version.",
      replies: [
        end("I'll read the lockout.", [
          flag("knowsLockout", true),
          log("Wren names the Bureau lockout. It will show on the pump's graph."),
          journal(
            "pump",
            "The broken pump",
            "The valve is unseated, and a Bureau lockout is holding the feed shut. Mend it, bleed the bypass, cut the lockout, buy a true valve, or give the work to Wren.",
          ),
        ]),
      ],
    },
    crawl: {
      speaker: "wren",
      text: "North of the sludge, past Pell, a grate still remembers it was a crawl. Drop through and you come up on the blind side of Varr's squad, near the stack road. Do not start a lecture down there.",
      replies: [
        end("I'll remember the grate.", [
          flag("knowsCrawl", true),
          log("A grate north of the sludge drops behind the checkpoint."),
        ]),
      ],
    },
    hands: {
      speaker: "wren",
      text: "Give it here. I have seated worse, for less thanks.",
      replies: [
        end("It's yours.", [
          { op: "take", id: "valve", n: 1 },
          flag("pumpFate", "wren"),
          flag("actReady", true),
          { op: "xp", n: 40 },
          { op: "rep", faction: "unbound", n: 6 },
          log("Wren seats the valve. The pump takes a true breath that is not yours."),
          journal(
            "pump",
            "The broken pump",
            "Wren seated the valve. The water is clean. The credit is not yours, and that is the point.",
            "done",
          ),
        ]),
        end("I'll keep it."),
      ],
    },
    checkpoint: {
      speaker: "wren",
      text: "You let Varr walk. The checkpoint is still his. He unbarred the plate stair. I can't spend that. It is just what the room is now.",
      replies: [end("That's the room.")],
    },
    "checkpoint-open": {
      speaker: "wren",
      text: "Varr came apart and stayed. The checkpoint is still his. The stair is unbarred. The plate isn't.",
      replies: [end("That's the room.")],
    },
    "checkpoint-gone": {
      speaker: "wren",
      text: "Varr is dead. The checkpoint is a vacancy. That is a fact, not a verdict. The stair stayed barred. Moll and Hess moved to the road.",
      replies: [end("That's the room.")],
    },
    "checkpoint-left": {
      speaker: "wren",
      text: "Varr left the plate. Nobody inherited it. The stair stayed barred.",
      replies: [end("That's the room.")],
    },
    "dry-door": {
      speaker: "wren",
      text: "That's the gallery head. It drinks from the pump, not from a key. Seat the valve, or throw the bypass toward the sump, and the door stops being a wall. The crown inside is a different problem. You don't mend a person. You hold the load.",
      replies: [end("I'll read the pump.")],
    },
    gallery: {
      speaker: "wren",
      text: "The door took pressure. The footing under that crown is still failing. Brace it if you want the room to stay a room. Mend the footing if you want it to be itself again.",
      replies: [end("I'll go back in.")],
    },
    "gallery-held": {
      speaker: "wren",
      text: "The gallery is open, and the crown isn't coming down. The alley can use the room. That wasn't a fight. That was a parent.",
      replies: [end("That's the room.")],
    },
    lung: {
      speaker: "wren",
      text: "I know the shape. The reed seats the lung, the lung seats the pump, the pump seats the ward. I will carry that to the pit. They have been treating the quarry like a different city. It is a later room of this one.",
      replies: [
        end("Carry it.", [
          flag("toldWren", true),
          { op: "xp", n: 16 },
          log("Wren takes the diagram. The quarry line will be able to ask what the lung is parent to."),
          journal(
            "lung-line",
            "The lung, carried",
            "Wren has the bellows diagram. The quarry is not a different machine. It is downstream, and upstream, of the same city.",
            "open",
          ),
        ]),
      ],
    },
    join: {
      speaker: "wren",
      text: "The lines don't end at the Sinks. If you're going where the plate is thicker, I can name what the pipe is parent to. I won't pretend that naming is the same as fixing.",
      replies: [
        end("Come on.", [
          { op: "recruit", id: "wren" },
          log("Wren slings a coil of line and matches your step."),
          journal("wren-road", "Wren on the road", "She left the bench. The diagram is still hers to carry or to withhold.", "done"),
        ]),
        end("Not yet."),
      ],
    },
  },
};

CONVOS.lark = {
  start: "start",
  nodes: {
    start: {
      speaker: "lark",
      text: "Stack road. If the lamps are up, the carts use the high walk. If the glass is out, the carts still have a south cut. I run both. I don't file either as a favor.",
      replies: [
        {
          text: "Show me the south cut.",
          effects: [
            flag("roadBypass", true),
            log("Lark points at the lower walk. The lamps are not a parent of that path."),
          ],
          end: true,
        },
        {
          text: "The lamps are dark.",
          goto: "dark",
          requires: [{ flag: "roadDark", is: true }],
        },
        {
          text: "The lamps are taking power.",
          goto: "lit",
          requires: [{ flag: "roadLamps", is: true }],
        },
        {
          text: "Stone is moving on this road.",
          goto: "stone",
          requires: [{ flag: "stoneMoving", is: true }],
        },
        {
          text: "The carts toward the ward got heavier.",
          goto: "eats",
          requires: [{ flag: "foodLive", is: true }],
        },
        end("I'll walk it myself."),
      ],
    },
    dark: {
      speaker: "lark",
      text: "Then the orrery is not sending, or somebody cut the glass and left the clock turning. Cargo will argue. The south cut does not. Use it if you want the dark to stay a choice instead of a stop.",
      replies: [end("The south cut, then.", [flag("roadBypass", true)])],
    },
    lit: {
      speaker: "lark",
      text: "Light on the high walk. That light is a child. If the parent stops, do not be surprised that the argument starts here and not in the citadel.",
      replies: [end("I know what it's a child of.")],
    },
    stone: {
      speaker: "lark",
      text: "The pit is sending weight. I don't need to know who you spared under the boom. The road knows the stone is coming, and Rust will know it before anyone makes a speech.",
      replies: [end("Then the road is the message.")],
    },
    eats: {
      speaker: "lark",
      text: "Somebody in the ward is eating. The carts got heavier before I saw a plate. If you want the room, it's up the stair. I'm just the part that felt the change.",
      replies: [end("The weight arrived first.")],
    },
  },
};

CONVOS["guard-line"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "en1",
      text: "Checkpoint. Nobody walks the south plate without a chit, a rank, or a very convincing noise. You have a zero on you. I can read it from here.",
      replies: [
        {
          text: "I have authorization.",
          check: { skill: "speech", dc: 54 },
          goto: "pass",
          failGoto: "no",
          effects: [
            flag("checkpointSpoke", true),
            log("The sentence lands. They hate it and they let it stand."),
            { op: "xp", n: 20 },
            { op: "rep", faction: "bureau", n: 4 },
          ],
        },
        {
          text: "Your pressure regulator is about to rupture.",
          check: { skill: "engineering", dc: 46 },
          goto: "pass",
          failGoto: "no",
          effects: [
            flag("checkpointSpoke", true),
            log("Moll looks at a gauge she forgot she was wearing. The squad steps aside to listen to their own iron."),
            { op: "xp", n: 20 },
          ],
        },
        {
          text: "The pump's lockout is already failing. Go look.",
          goto: "pass",
          requires: [{ flag: "knowsLockout", is: true }],
          effects: [
            flag("checkpointSpoke", true),
            log("You name a failure they were paid not to notice. They go look at the pump instead of you."),
            { op: "xp", n: 16 },
            { op: "rep", faction: "bureau", n: -2 },
          ],
        },
        { text: "Move.", goto: "fight" },
        { text: "Fine.", goto: "back" },
        {
          text: "The plate is empty. You're holding the road mouth.",
          goto: "mouth",
          requires: [{ flag: "roadWatch", is: true }],
        },
      ],
    },
    pass: {
      speaker: "en1",
      text: "Go. If Varr asks, you were steam.",
      replies: [end("I'm already walking.")],
    },
    mouth: {
      speaker: "en1",
      text: "Varr is not on the plate. Hess and I held the mouth because nobody signed the stair. The road is the job now. That is a posting, not a verdict.",
      replies: [end("Hold it, then.")],
    },
    no: {
      speaker: "en1",
      text: "No. And now I have written the attempt down, which is worse for both of us.",
      replies: [
        { text: "Then we do this with iron.", goto: "fight" },
        { text: "I'll take the north streets.", goto: "back" },
      ],
    },
    fight: {
      speaker: "en1",
      text: "Squad. The zero wants a lesson.",
      replies: [
        end("Read them.", [
          { op: "hostile", id: "varr", on: true },
          { op: "aggro", ids: ["varr", "en1", "en2"], on: true },
          { op: "combat", ids: ["varr", "en1", "en2"] },
          flag("checkpointSpoke", true),
          log("The checkpoint becomes a diagram with three bodies in it."),
        ]),
      ],
    },
    back: {
      speaker: "narrator",
      text: "You step back through the door. The plate does not follow. Yet.",
      replies: [end("North, then.", [{ op: "goto", map: "sinks", x: 14, y: 10 }])],
    },
  },
};

CONVOS["varr-memory"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "varr",
      text: "The weapons went quiet. The checkpoint did not. Say what you came to say. I am not raising that shape again.",
      replies: [end("I'll walk.")],
    },
  },
};

CONVOS["varr-memory-cut"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "varr",
      text: "You took the pressure out of the rifle, and then you talked. The checkpoint is still mine. Leave the rifle a rumor.",
      replies: [
        end("I'll walk."),
        {
          text: "The stair.",
          goto: "stair",
        },
      ],
    },
    stair: {
      speaker: "varr",
      text: "I unbarred it. The checkpoint is still mine. Don't make it a tour.",
      replies: [end("I'll walk.")],
    },
  },
};

CONVOS["varr-memory-open"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "varr",
      text: "The plate is off me. I am still the checkpoint. You already heard the piece.",
      replies: [end("I'll walk.")],
    },
  },
};

for (const id of ["en1", "en2"] as const) {
  CONVOS[`checkpoint-held-${id}`] = {
    start: "start",
    nodes: {
      start: {
        speaker: id,
        text: "Captain's on the plate. The stair behind the shop is his. He doesn't want the speech again.",
        replies: [end("I'll walk.")],
      },
    },
  };
  CONVOS[`checkpoint-vacant-${id}`] = {
    start: "start",
    nodes: {
      start: {
        speaker: id,
        text: "There's no captain. I am not taking the job. We're on the road mouth. The stair stays barred.",
        replies: [end("I'll walk.")],
      },
    },
  };
}

CONVOS["plate-stair"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "narrator",
      text: "A bar sits in the plate stair. It wants a Bureau signature. The iron does not care what you think of the man who can give it.",
      replies: [end("Leave it.")],
    },
  },
};

CONVOS["sump-door"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "narrator",
      text: "The gallery door is shut. The head behind the gauge is dry. Pressure has to come from the pump — a seated valve, or a bypass thrown toward the sump.",
      replies: [end("Leave it.")],
    },
  },
};

CONVOS.nessa = {
  start: "start",
  nodes: {
    start: {
      speaker: "nessa",
      text: "Nessa. I sell what the cistern allows, which today might be nothing. The stall leg is a child. I am not the parent.",
      replies: [
        {
          text: "Buy a bandage. Eight scrip.",
          requires: [{ flag: "wardGoods", is: "clean" }, { scrip: 8 }],
          check: { skill: "barter", dc: 28 },
          effects: [
            { op: "scrip", n: -8 },
            { op: "item", id: "bandage" },
            log("Clean water, clean cloth. The stall can afford to be a shop."),
          ],
          end: true,
        },
        {
          text: "Buy the stamped wash. Twelve scrip.",
          requires: [{ flag: "wardGoods", is: "stamped" }, { scrip: 12 }],
          check: { skill: "barter", dc: 36 },
          effects: [
            { op: "scrip", n: -12 },
            { op: "item", id: "bandage" },
            log("Quill's stamp is on the jar. The water is still brown. The cloth is real."),
          ],
          end: true,
        },
        {
          text: "The water is brown.",
          goto: "brown",
          requires: [{ flag: "wardGoods", is: "brown" }],
        },
        {
          text: "The stall is dry.",
          goto: "dry",
          requires: [{ flag: "wardGoods", is: "none" }],
        },
        {
          text: "Buy a meal off the plots. (6 scrip)",
          requires: [{ flag: "foodLive", is: true }, { scrip: 6 }],
          effects: [
            { op: "scrip", n: -6 },
            { op: "heal", id: "player", n: 8 },
            log("The meal is a child of the plots, which are a child of the Sinks. Nessa prices it like a fact."),
          ],
          end: true,
        },
        {
          text: "Front me a bandage. I'll bring the scrip.",
          goto: "front",
          requires: [{ flag: "nessaSells", is: true }, { missing: "nessaFront" }],
        },
        {
          text: "You had a wage.",
          goto: "refuses",
          requires: [{ flag: "nessaRefuses", is: true }],
        },
        end("I'll look at the cistern."),
      ],
    },
    brown: {
      speaker: "nessa",
      text: "Brown is not a price I will call drinking water. If a clerk stamps it provisional, I can sell the wash. I will not invent the stamp.",
      replies: [end("I'll find the clerk.")],
    },
    dry: {
      speaker: "nessa",
      text: "Dry. Either the Sinks are not sending, or someone threw the split at the clinic. Read the cistern. The main is the same shape as a pressure feed, if you have already understood one.",
      replies: [end("I'll read it.")],
    },
    front: {
      speaker: "nessa",
      text: "The stall is a wage today. One bandage on trust. If the parent stops, do not come back and call the trust a debt I still owe.",
      replies: [
        end("I'll remember which pipe it hangs on.", [
          flag("nessaFront", true),
          { op: "item", id: "bandage" },
          log("Nessa fronts a bandage. The trust is a child of a stall that is currently a child of the Sinks."),
        ]),
      ],
    },
    refuses: {
      speaker: "nessa",
      text: "I had a wage. I do not have one. The stall was not a well and I am not a parent. I will not front a bandage against a pipe that stopped. Read the cistern, or read whatever is upstream of it.",
      replies: [end("I'll read the parent.")],
    },
  },
};

CONVOS.bram = {
  start: "start",
  nodes: {
    start: {
      speaker: "bram",
      text: "Bram. The cart does not care about speeches. It cares whether the plate stair is signed, and whether a squad is standing in the mouth.",
      replies: [
        {
          text: "The squad is on the mouth.",
          goto: "stuck",
          requires: [{ flag: "roadWatch", is: true }],
        },
        {
          text: "The stair is signed. Move the freight.",
          goto: "run",
          requires: [{ flag: "plateStair", is: true }, { flag: "roadWatch", is: false }, { missing: "bramRan" }],
        },
        {
          text: "Use the dry corner under the crown.",
          goto: "cache",
          requires: [{ flag: "jackHeld", is: true }, { missing: "bramBarrel" }],
        },
        {
          text: "The stair.",
          goto: "waiting",
          requires: [{ flag: "plateStair", is: false }, { flag: "roadWatch", is: false }],
        },
        {
          text: "Hold the cart. The ward is hungry.",
          goto: "hoard",
          requires: [{ flag: "stoneMoving", is: true }, { flag: "foodLive", is: false }, { missing: "bramHoard" }],
        },
        {
          text: "Let the cart go upstairs.",
          goto: "release",
          requires: [{ flag: "bramHoard", is: true }],
        },
        end("I'll walk."),
      ],
    },
    stuck: {
      speaker: "bram",
      text: "Moll and Hess left the plate and took the mouth. I am not driving a cart through a vacancy that still has rifles. That is not fear. That is a parent.",
      replies: [end("Then the cart stays.")],
    },
    run: {
      speaker: "bram",
      text: "Signed, and the mouth is empty of them. I can take a load up. You don't get a medal. You get what the load was worth.",
      replies: [
        end("Take it.", [
          flag("bramRan", true),
          { op: "scrip", n: 14 },
          { op: "xp", n: 12 },
          log("Bram's cart leaves. Freight moves because the stair was signed and the mouth was not a squad."),
        ]),
      ],
    },
    cache: {
      speaker: "bram",
      text: "You held that crown. The dry corner under it will take a barrel that the alley can use. Plate scrap was already in it. This is the second use.",
      replies: [
        end("Leave the barrel.", [
          flag("bramBarrel", true),
          { op: "item", id: "scrap" },
          log("Bram stashes a barrel in the held gallery. You take the plate scrap that was under it."),
        ]),
      ],
    },
    waiting: {
      speaker: "bram",
      text: "The stair is still barred. Nobody signed it. I don't pull a bar that belongs to the checkpoint. When the plate has a captain, or when it doesn't and the squad moves, come back and tell me which one happened.",
      replies: [end("I'll learn which one it is.")],
    },
    hoard: {
      speaker: "bram",
      text: "The ward is not eating, and the road is carrying stone toward people who already have stores. I can hold this cart. The citadel does not get the load. The ward does not become fed. Both of those stay true.",
      replies: [
        end("Hold it.", [
          flag("bramHoard", true),
          { op: "xp", n: 10 },
          log("Bram holds the cart. Citadel supply loses a parent. The ward is still hungry."),
        ]),
      ],
    },
    release: {
      speaker: "bram",
      text: "Then the load goes upstairs. I am not calling that a feeding. I am calling it a road that is allowed to finish.",
      replies: [
        end("Let it finish.", [
          flag("bramHoard", false),
          log("Bram lets the cart go. The citadel can take the road again, if the road is still carrying."),
        ]),
      ],
    },
  },
};

CONVOS.odell = {
  start: "start",
  nodes: {
    start: {
      speaker: "odell",
      text: "Odell. I stitch what cloth can see. The tap behind me is not a well. It is a leg of the ward cistern.",
      replies: [
        {
          text: "Use the tap. Close what you can.",
          requires: [{ flag: "wardClinic", is: true }],
          check: { skill: "medicine", dc: 34 },
          effects: [
            { op: "heal", id: "player", n: 14 },
            log("The clinic tap is live. Odell closes what cloth can close. It is medicine."),
          ],
          end: true,
        },
        {
          text: "The tap is dry.",
          goto: "dry",
          requires: [{ flag: "wardClinic", is: false }],
        },
        end("I'll leave the clinic."),
      ],
    },
    dry: {
      speaker: "odell",
      text: "Dry. If the split was thrown to the stall, throw it back, or seat both legs. If the Sinks are not sending, I cannot invent water. Cellars and rumors are not a baseline.",
      replies: [end("I'll read the cistern.")],
    },
  },
};

CONVOS.quill = {
  start: "start",
  nodes: {
    start: {
      speaker: "quill",
      text: "Clerk Quill. Pricing, not punishment. I file what the district is actually sending. A dry rumor does not get a civic price. Brown water does not get the word drinking.",
      replies: [
        {
          text: "Stamp the brown water as provisional.",
          goto: "stamp",
          requires: [{ flag: "pumpFate", is: "bleed" }, { missing: "provisionalStamp" }],
          check: { skill: "speech", dc: 46 },
          effects: [
            flag("provisionalStamp", true),
            { op: "xp", n: 18 },
            log("Quill stamps the brown water provisional. The stall can sell the wash under that name. It is not clean."),
          ],
          failEffects: [log("Quill will not invent a cleaner word than the water.")],
        },
        {
          text: "The water is seated.",
          goto: "seated",
          requires: [{ flag: "pumpFate", is: "mend" }],
        },
        {
          text: "Wren seated it.",
          goto: "wren",
          requires: [{ flag: "pumpFate", is: "wren" }],
        },
        {
          text: "You are still calling it dry.",
          goto: "dryprice",
          requires: [{ flag: "pumpFate", is: "lockout" }],
        },
        {
          text: "The plots are feeding a levy.",
          goto: "levy",
          requires: [{ flag: "levyLive", is: true }],
        },
        end("File nothing, then."),
      ],
    },
    stamp: {
      speaker: "quill",
      text: "Provisional. Not clean. Nessa can sell the wash if she is willing to say the word I wrote, which is not the word she wanted.",
      replies: [end("That's the filing.")],
    },
    seated: {
      speaker: "quill",
      text: "Seated water gets a civic price. The plaque upstairs will forget your hands. I will not argue with a plaque. I also will not pretend the seal did the work.",
      replies: [end("Leave the plaque.")],
    },
    wren: {
      speaker: "quill",
      text: "A line worker seated it. That is a better sentence than most of my forms. The price will still say Bureau. The form is not the pipe.",
      replies: [end("The form is not the pipe.")],
    },
    dryprice: {
      speaker: "quill",
      text: "The veto is gone and the valve is still unseated. I cannot price a district that is not actually sending a drinkable parent. Cut a seal and you have a story. Seat the valve and I have a number.",
      replies: [end("Then the number waits.")],
    },
    levy: {
      speaker: "quill",
      text: "Restored food is a civic parent. I can invoice it. If you wanted hunger to be the thing that died, you also woke a bill. I will not pretend those are different pipes. Refuse the bed and the bill dies. So does the meal.",
      replies: [end("Both stay on the filing.")],
    },
  },
};

CONVOS["ash-cut"] = {
  start: "start",
  nodes: {
    start: {
      speaker: "narrator",
      text: "A service cut behind the stalls. It is a way through only while the ward is unfed. Feed the stall and the plots, and this door stops owing anyone a path.",
      replies: [end("Leave it.")],
    },
  },
};

extendCampaign(CONVOS);
Object.assign(CONVOS, KILN_CONVOS, SWITCH_CONVOS, PANE_CONVOS);
