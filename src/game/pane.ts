import type { Convo, Effect, Reply } from "./types";

const log = (text: string): Effect => ({ op: "log", text });
const flag = (key: string, value: string | number | boolean): Effect => ({ op: "flag", key, value });
const take = (id: string, n = 1): Effect => ({ op: "take", id, n });
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

/** People of the glasshouse. The furnace is the verb. These lines only say which parent is missing. */
export const PANE_CONVOS: Record<string, Convo> = {
  orla: {
    start: "start",
    nodes: {
      start: {
        speaker: "orla",
        text: "Orla. I melt. Sand is the only parent this house owns. The flue is down, a live kiln can be borrowed if one is actually hot, and Ness will invoice whatever stands up clear.",
        replies: [
          { text: "What would make a pane that doesn't craze?", goto: "parents" },
          { text: "Who is Ness to the melt?", goto: "ness" },
          {
            text: "The house is holding.",
            goto: "hold",
            requires: [{ flag: "paneHouses", is: true }],
          },
          {
            text: "You refused the melt.",
            goto: "refused",
            requires: [{ flag: "paneRefused", is: true }],
          },
          end("I'll read the furnace."),
        ],
      },
      parents: {
        speaker: "orla",
        text: "Seat the flue if the sand is still sand. That is local. If you spill the pit, cullet and scrap can stand in for it, or you can seat the pit again. Heat can be this flue, or a kiln bed that is actually live. Those are not the same pane. A clear one can also be sat into a lamp that lost its glass. The orrery does not have to be the parent of the pane. It still has to be the parent of the light.",
        replies: [
          end("Then the furnace is a machine, not a favor.", [
            journal(
              "pane-parents",
              "What the melt is waiting on",
              "Sand is local, and it can be spilled or seated again. Cullet can stand in for a spilled pit. Heat is this flue, or a kiln bed that is actually live. The stamp is a person. A finished pane can be sat into a broken lamp, and it does not replace the orrery.",
            ),
          ]),
        ],
      },
      ness: {
        speaker: "orla",
        text: "She prices a clear pane the way a clerk prices a meal. License her and the bench can sell a lens. Cut the stamp and the levy dies with it. Leave her and she will invoice the house even if you never sell. I will not pick your sentence. I live in the heat.",
        replies: [end("The stamp is not the flue.")],
      },
      hold: {
        speaker: "orla",
        text: "The house took the melt. Don't thank the sand. Thank whichever parent you actually seated, and remember Ness can still read the smoke. The moth came for the heat. I did not hire it.",
        replies: [end("Smoke is a receipt.")],
      },
      refused: {
        speaker: "orla",
        text: "You left the bed down. The levy has nothing to eat. Neither does the house. I am by the bench because the furnace is not a place to stand. You can still seat it. Refusal was a fact, not a vow.",
        replies: [end("A fact can be seated later.")],
      },
    },
  },
  ness: {
    start: "start",
    nodes: {
      start: {
        speaker: "ness",
        text: "Ness, stamp office. A pane that stands clear is a civic good. Civic goods have a levy. I did not invent the sand. I invented the price.",
        replies: [
          { text: "What does the stamp actually parent?", goto: "parent" },
          {
            text: "The house is already being invoiced.",
            goto: "bill",
            requires: [{ flag: "paneLevy", is: true }],
          },
          {
            text: "The bench is selling.",
            goto: "open",
            requires: [{ flag: "paneShop", is: true }],
          },
          {
            text: "There is no melt to price.",
            goto: "dry",
            requires: [{ flag: "paneCharge", is: false }],
          },
          end("The stamp can wait."),
        ],
      },
      parent: {
        speaker: "ness",
        text: "The stamp parents the legal sale, and the levy. It does not parent the fire. License it on the desk — pay, or talk like someone the Bureau already believes — and the bench may sell a lens. Cut it and you will be believed in a different room.",
        replies: [end("Then the desk is the machine.")],
      },
      bill: {
        speaker: "ness",
        text: "The house took the melt. The levy took the house. That is the same pipe. If you wanted a bench without a bill, you needed a hole where my stamp is.",
        replies: [end("I can still make the hole.")],
      },
      open: {
        speaker: "ness",
        text: "The bench is selling. If my stamp is intact, the levy is intact. Do not describe that as a kindness I did you.",
        replies: [end("I won't.")],
      },
      dry: {
        speaker: "ness",
        text: "I cannot invoice a craze. Seat something that holds, or stop wasting the desk.",
        replies: [end("The fire is not your desk.")],
      },
    },
  },
  fen: {
    start: "start",
    nodes: {
      start: {
        speaker: "fen",
        text: "Fen. I sweep cullet and I don't sweep the vault. There's a lens in the anneal that the bench will also sell you, if Ness ever allows a sale. The vault is a lock. I know the give. The moth nests on it when the house is cold.",
        replies: [
          { text: "Show me the give.", goto: "give" },
          {
            text: "The moth left the vault.",
            goto: "moth",
            requires: [{ flag: "paneCharge", is: true }],
          },
          end("Sweep."),
        ],
      },
      give: {
        speaker: "fen",
        text: "Up, then left, then don't rush the last pin. A lockwork hand can do it without me. Smashing the anneal is a third way, and the moth will stand up if you take its parent ugly.",
        replies: [
          end("The give is enough.", [
            flag("paneTold", true),
            journal(
              "pane-vault",
              "The anneal give",
              "Fen's give opens the vault under the glasshouse. Lockwork can do it without him. The lens in the anneal is the same kind the bench sells once a permit exists. Smashing the nest makes the moth stand up.",
            ),
          ]),
        ],
      },
      moth: {
        speaker: "fen",
        text: "It wanted the heat. It is not a guard and it is not a pet. Leave the anneal and it stays a moth.",
        replies: [end("Then I won't hire it either.")],
      },
    },
  },
  sol: {
    start: "start",
    nodes: {
      start: {
        speaker: "sol",
        text: "Sol. I run cullet up the north stair. Orla's pit is the only sand on this road. If someone spills it, scrap melted mean will stand in, and I will show the trick for a pocket of scrap. I don't invoice. Ness does, if the melt ever stands clear.",
        replies: [
          { text: "Where is the house?", goto: "where" },
          {
            text: "Take the scrap. Show the melt.",
            goto: "taught",
            requires: [{ item: "scrap" }],
            effects: [
              take("scrap", 1),
              flag("solCullet", true),
              log("Sol takes the scrap and talks the melt until it is a trick you can do without him."),
            ],
          },
          {
            text: "The house is holding.",
            goto: "hold",
            requires: [{ flag: "paneCharge", is: true }],
          },
          end("Run."),
        ],
      },
      where: {
        speaker: "sol",
        text: "North off the high walk, before the ward stair gets proud. Sand, a flue, and a woman with a stamp. A finished pane will also sit in a lamp that lost its glass. I have carried both sentences and I have not fixed either.",
        replies: [
          end("Then the stair is the mouth.", [
            journal(
              "pane-mouth",
              "A glasshouse off the high walk",
              "Sol runs cullet to a house north of the stack road. Sand is local. A spilled pit can take a mean melt. Ness prices whatever stands clear. A finished pane can be sat into a lamp, and it does not replace the light's other parent.",
            ),
          ]),
        ],
      },
      taught: {
        speaker: "sol",
        text: "You have the trick. The furnace still has to be the one that takes it. I don't work for the stamp.",
        replies: [end("The trick is not the flue.")],
      },
      hold: {
        speaker: "sol",
        text: "Then somebody seated a parent. If Ness is still standing, the smoke has a bill. I run. I don't price.",
        replies: [end("Run.")],
      },
    },
  },
  "pane-moth": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A glass moth. It is not hostile. Cold, it nests on the anneal. Heat, it comes into the yard and does not ask to be hired. Read the lens and lift it, and the nest stays a nest. Smash the anneal and the nest has to stand up.",
        replies: [end("Leave it nested.")],
      },
    },
  },
  "pane-vault": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "An anneal door under the glasshouse. The hinge is tired. The lock is not a moral problem. It is a lock.",
        replies: [
          {
            text: "Use the give Fen showed you.",
            requires: [{ flag: "paneTold", is: true }],
            goto: "open",
            effects: [flag("paneVault", true), log("The hinge gives. The anneal is a room.")],
          },
          {
            text: "Work the lock.",
            check: { skill: "lockwork", dc: 44 },
            goto: "open",
            failGoto: "stuck",
            effects: [flag("paneVault", true), log("The lock turns. You were not invited. The door does not care.")],
            failEffects: [log("The lock holds. A better hand, or Fen's give, would not have to fight it.")],
          },
          end("Leave it shut."),
        ],
      },
      open: {
        speaker: "narrator",
        text: "The vault opens on an anneal and a nested moth, if the house is still cold. The lens is a machine, not a treasure pile. The bench will sell the same kind of lens once a permit exists.",
        replies: [end("Go in.")],
      },
      stuck: {
        speaker: "narrator",
        text: "Still shut.",
        replies: [end("Still shut.")],
      },
    },
  },
  "tobin-pane": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "This is not a pump, but a melt is still a parent. Sand is local. If the kiln is actually hot you can borrow it, and if you spill the pit you can melt scrap or seat the pit again. Don't tell me a clear house is innocent while Ness is still holding a stamp.",
        replies: [
          end("I'll count the furnace, not the speech.", [
            flag("tobinPaneSpoke", true),
            log("Tobin counts the glasshouse the way he counts a reed: a local hand, a distant child."),
          ]),
        ],
      },
    },
  },
  "wren-pane": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "A pane sat into a lamp is a child you made, not a child the orrery made. The lamp still dies if the clock is not sending. Cullet is a line that does not ask the pit's permission. It is still a line. The lens, vault or bench, names a parent the surface had not.",
        replies: [
          end("Then I want the parents, not a slogan.", [
            flag("wrenPaneSpoke", true),
            log("Wren will not let the glasshouse be one machine with one door."),
          ]),
        ],
      },
    },
  },
};
