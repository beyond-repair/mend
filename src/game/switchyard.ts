import type { Convo, Effect, Reply } from "./types";

const log = (text: string): Effect => ({ op: "log", text });
const flag = (key: string, value: string | number | boolean): Effect => ({ op: "flag", key, value });
const journal = (id: string, title: string, text: string, status: "open" | "done" | "failed" = "open"): Effect => ({
  op: "journal",
  id,
  title,
  text,
  status,
});

function end(text: string, effects?: Effect[], extra?: Partial<Reply>): Reply {
  return { text, effects, end: true, ...extra };
}

/** The freight yard under the stack road. The table is the verb. These lines only name which parent is missing. */
export const SWITCH_CONVOS: Record<string, Convo> = {
  hale: {
    start: "start",
    nodes: {
      start: {
        speaker: "hale",
        text: "Hale. I keep the table turning. Grease is local if you have scrap and a mean hand. The haul is not local. It is whatever the pit and the kiln managed to stand up, and Rue will invoice it if the stamp is still a stamp.",
        replies: [
          { text: "What is the floor actually doing to people?", goto: "floor" },
          { text: "What happens if the table stops?", goto: "jam" },
          {
            text: "The floor stopped billing.",
            goto: "greased",
            requires: [{ flag: "switchGreased", is: true }],
          },
          {
            text: "You jammed the haul.",
            goto: "jammed",
            requires: [{ flag: "switchJam", is: true }, { missing: "switchShunt" }],
          },
          end("I'll read the table."),
        ],
      },
      floor: {
        speaker: "hale",
        text: "South of the table the plates are slick. Wick sleeps there because the shed is a story we tell when the axle is greased. Boots will keep your feet. They will not keep his. Grease is the parent of the shed. A jam is a different sentence. It stops the haul. It does not grease a plate.",
        replies: [
          end("Grease is not a boot.", [
            journal(
              "switch-floor",
              "What the yard floor is waiting on",
              "The slick plates bill a step. Edge boots keep your feet and do not keep Wick's. Grease wants scrap. Jamming the table stops the haul upstream of the citadel. It is not grease.",
            ),
          ]),
        ],
      },
      jam: {
        speaker: "hale",
        text: "Jam it and the citadel stops receiving this road, even if the pit is still proud of itself. Shunt it and the haul still moves, off her books. Seat it again and the books come back if the stamp is intact. I live on the plates. I will not pick your parent.",
        replies: [end("The table is not a favor.")],
      },
      greased: {
        speaker: "hale",
        text: "Wick can stand in the shed. Don't thank me. Thank the scrap. Rue can still read a haul that is moving.",
        replies: [end("The floor was the local parent.")],
      },
      jammed: {
        speaker: "hale",
        text: "The table is down. Downstream will notice before they get a speech about it. A shunt would let the weight leave without inviting her bill. I have not built it. You might.",
        replies: [end("A shunt is still a parent.")],
      },
    },
  },
  rue: {
    start: "start",
    nodes: {
      start: {
        speaker: "rue",
        text: "Rue, yard stamp. A haul that moves is a civic good. I did not invent the pit. I invented the line that notices the pit.",
        replies: [
          { text: "What does the stamp parent, exactly?", goto: "parent" },
          {
            text: "The haul is already on your books.",
            goto: "toll",
            requires: [{ flag: "switchToll", is: true }],
          },
          {
            text: "The table is jammed.",
            goto: "jammed",
            requires: [{ flag: "switchJam", is: true }, { missing: "switchShunt" }],
          },
          {
            text: "You are short a till.",
            goto: "till",
            requires: [{ flag: "switchCaught", is: true }],
          },
          end("I'll read the desk."),
        ],
      },
      parent: {
        speaker: "rue",
        text: "License me and the shed can sell if Hale's grease is real and the table is passing weight. Cut the stamp and the bill dies. The haul can still leave. Jam the table and I have nothing to invoice, because nothing is leaving. A shunt is a haul I am not allowed to see. I dislike it. The graph does not.",
        replies: [end("The bill is not the axle.")],
      },
      toll: {
        speaker: "rue",
        text: "Yes. Stone or brick, I don't mind which child it was. If it crossed this table on the books, it owes. Cut me and the owing stops. Do not expect me to call the hole maintenance.",
        replies: [end("A bill rode a parent that was already moving.")],
      },
      jammed: {
        speaker: "rue",
        text: "Then the citadel can starve with a busy pit. I will not pretend the table is still a road. Seat it if you want the books back.",
        replies: [end("The pit can look finished and still send nothing.")],
      },
      till: {
        speaker: "rue",
        text: "I saw the hands. The scrip can stay in your pack. The seeing stays here. Do not call it a fee you negotiated.",
        replies: [end("Then the seeing is the cost.")],
      },
    },
  },
  ske: {
    start: "start",
    nodes: {
      start: {
        speaker: "ske",
        text: "Ske. I sleep where the waybills are, when the door lets me. Rue thinks the bay is a closet. It is a parent she does not audit.",
        replies: [
          { text: "What is in the bay?", goto: "bay" },
          {
            text: "Show me the give.",
            goto: "give",
            requires: [{ missing: "switchTold" }],
          },
          end("Leave the door."),
        ],
      },
      bay: {
        speaker: "ske",
        text: "Paper that says Bram's held cart and this table have been the same refusal on different days. Read it and you can say that to him without me. Smash it and the rat under the crate has to stand up. Those are not the same theft.",
        replies: [end("A paper can be a parent.")],
      },
      give: {
        speaker: "ske",
        text: "Left, then up, then don't force the hinge. The lock likes being asked. It does not like a stranger's pride.",
        replies: [
          end("I'll ask it that way.", [
            flag("switchTold", true),
            log("Ske gives the hinge. The bay is still a door until you use it."),
          ]),
        ],
      },
    },
  },
  wick: {
    start: "start",
    nodes: {
      start: {
        speaker: "wick",
        text: "Wick. I sleep on the plates because the shed is a rumor. The plates take a little blood and call it weather.",
        replies: [
          { text: "What would make the shed true?", goto: "shed" },
          {
            text: "The plates stopped.",
            goto: "dry",
            requires: [{ flag: "switchGreased", is: true }],
          },
          end("Stay low."),
        ],
      },
      shed: {
        speaker: "wick",
        text: "Grease on the axle. Not your boots. Your boots are a private parent. I don't wear your feet.",
        replies: [end("Then the axle is the bed.")],
      },
      dry: {
        speaker: "wick",
        text: "I'll take the shed. Don't make a speech out of a plate that finally shut up.",
        replies: [end("Sleep.")],
      },
    },
  },
  "yard-rat": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A small mill under the waybill crate. It is not hostile. The paper is in its weather. Lift the paper after you have read it and the nest stays a nest. Smash the crate and the nest has to stand up.",
        replies: [end("Leave it nested.")],
      },
    },
  },
  "switch-bay": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A bay door under the yard office. The hinge is tired. The lock is not a moral problem. It is a lock.",
        replies: [
          {
            text: "Use the give Ske showed you.",
            requires: [{ flag: "switchTold", is: true }],
            goto: "open",
            effects: [flag("switchBay", true), log("The hinge gives. The bay is a room.")],
          },
          {
            text: "Work the lock.",
            check: { skill: "lockwork", dc: 46 },
            goto: "open",
            failGoto: "stuck",
            effects: [flag("switchBay", true), log("The lock turns. You were not invited. The door does not care.")],
            failEffects: [log("The lock holds. A better hand, or Ske's give, would not have to fight it.")],
          },
          end("Leave it shut."),
        ],
      },
      open: {
        speaker: "narrator",
        text: "The bay opens on a crate and a nested mill. The waybill is a machine, not a treasure pile.",
        replies: [end("Go in.")],
      },
      stuck: {
        speaker: "narrator",
        text: "Still shut.",
        replies: [end("Still shut.")],
      },
    },
  },
  "tobin-switch": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "This table is not a pump, but it parents who gets the stone after the pit is done being proud. Grease is local. The citadel's meal is not. If you jam it, don't tell me the pit is still sending.",
        replies: [
          end("I'll count the table, not the speech.", [
            flag("tobinSwitchSpoke", true),
            log("Tobin counts the yard the way he counts a reed: a local hand, a distant child."),
          ]),
        ],
      },
    },
  },
  "wren-switch": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "A shunt is a line that does not ask the stamp's permission. It is still a line. If the paper in the bay is true, Bram's cart and this table have been refusing the same load.",
        replies: [
          end("Then I want the paper and the axle, not a slogan.", [
            flag("wrenSwitchSpoke", true),
            log("Wren will not let the yard be one machine with one door."),
          ]),
        ],
      },
    },
  },
};
