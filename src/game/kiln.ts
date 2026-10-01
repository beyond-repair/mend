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

/** People of the brick yard. The machines are the verbs. These lines only say which parent is missing. */
export const KILN_CONVOS: Record<string, Convo> = {
  harl: {
    start: "start",
    nodes: {
      start: {
        speaker: "harl",
        text: "Harl. I fire brick. Clay is the only parent this yard actually owns. The flue is sulking, the set wants water that is not here, and Cress will invoice whatever stands up.",
        replies: [
          { text: "What would make a brick that doesn't crack?", goto: "parents" },
          { text: "Who is Cress to the fire?", goto: "cress" },
          {
            text: "The houses are warm.",
            goto: "warm",
            requires: [{ flag: "kilnHouses", is: true }],
          },
          {
            text: "You refused the yard.",
            goto: "refused",
            requires: [{ flag: "kilnRefused", is: true }],
          },
          end("I'll read the flue."),
        ],
      },
      parents: {
        speaker: "harl",
        text: "Seat the flue if the clay is still clay. That is local. The set still wants gallery water, or a field-dry if you have scrap and the nerve to bake it mean. If Rust's fire bed is actually live, the yard can borrow that heat and leave my flue alone. Those are three sentences. They are not the same brick.",
        replies: [
          end("Then the flue is a machine, not a favor.", [
            journal(
              "kiln-parents",
              "What the brick is waiting on",
              "Clay is local. The flue can be seated, stopped, or refused. The set still wants gallery water, or a field-dry. A live Rust fire can be borrowed. The stamp is a person, and it is also a parent.",
            ),
          ]),
        ],
      },
      cress: {
        speaker: "harl",
        text: "She prices a finished brick the way a clerk prices a meal. License her and the board can sell. Cut the stamp and the levy dies with it. Leave her and she will invoice the houses even if Jun cannot sell. I will not pick your sentence. I live in the heat.",
        replies: [end("The stamp is not the flue.")],
      },
      warm: {
        speaker: "harl",
        text: "The houses took it. Don't thank the clay. Thank whichever parent you actually seated, and remember Cress can still read the smoke.",
        replies: [end("Smoke is a receipt.")],
      },
      refused: {
        speaker: "harl",
        text: "You left the bed down. The levy has nothing to eat. Neither do the houses. I am at the inn because the flue is not a place to stand. You can still seat it. Refusal was a fact, not a vow.",
        replies: [end("A fact can be seated later.")],
      },
    },
  },
  cress: {
    start: "start",
    nodes: {
      start: {
        speaker: "cress",
        text: "Cress, stamp office. A brick that stands up is a civic good. Civic goods have a levy. I did not invent the clay. I invented the price.",
        replies: [
          { text: "What does the stamp actually parent?", goto: "parent" },
          {
            text: "The houses are already being invoiced.",
            goto: "bill",
            requires: [{ flag: "kilnLevy", is: true }],
          },
          {
            text: "Jun's board is open.",
            goto: "open",
            requires: [{ flag: "kilnShop", is: true }],
          },
          {
            text: "There is no brick to price.",
            goto: "dry",
            requires: [{ flag: "brickLive", is: false }],
          },
          end("The stamp can wait."),
        ],
      },
      parent: {
        speaker: "cress",
        text: "The stamp parents the legal sale, and the levy. It does not parent the fire. License it on the desk — pay, or talk like someone the Bureau already believes — and Jun may sell. Cut it and you will be believed in a different room. Smuggle a brick for less and I hear about it anyway.",
        replies: [end("Then the desk is the machine.")],
      },
      bill: {
        speaker: "cress",
        text: "The houses took brick. The levy took the houses. That is the same pipe. If you wanted a shop without a bill, you needed a hole where my stamp is.",
        replies: [end("I can still make the hole.")],
      },
      open: {
        speaker: "cress",
        text: "The board is selling. If my stamp is intact, the levy is intact. Do not describe that as a kindness I did you.",
        replies: [end("I won't.")],
      },
      dry: {
        speaker: "cress",
        text: "I cannot invoice a crack. Seat something that holds, or stop wasting the desk.",
        replies: [end("The fire is not your desk.")],
      },
    },
  },
  jun: {
    start: "start",
    nodes: {
      start: {
        speaker: "jun",
        text: "Jun. I keep the board and the beds. I do not keep the fire. Prices are on the bench, and they move when the parents move. A tin is food. It is not a well.",
        replies: [
          { text: "What is the board waiting on?", goto: "board" },
          {
            text: "The board can sell.",
            goto: "selling",
            requires: [{ flag: "kilnShop", is: true }],
          },
          {
            text: "Brick is up and you still won't sell.",
            goto: "held",
            requires: [{ flag: "brickLive", is: true }, { flag: "kilnShop", is: false }],
          },
          {
            text: "People are sleeping warm.",
            goto: "sleep",
            requires: [{ flag: "kilnHouses", is: true }],
          },
          end("I'll read the bench."),
        ],
      },
      board: {
        speaker: "jun",
        text: "Draw a brick only when the set is actually holding. Sell it here for a real price if I am allowed to buy, or for a worse price if you are willing to be the other parent. Bandages do not care about the stamp. The coat and the chisel do. Rest is upstairs. A bed is not a speech.",
        replies: [
          end("The bench, then.", [
            journal(
              "kiln-board",
              "Jun's board",
              "The inn bench draws brick only while the set holds, sells it dear if the stamp allows and cheap if it doesn't, and keeps bandages either way. Rest is a bed, not a favor.",
            ),
          ]),
        ],
      },
      selling: {
        speaker: "jun",
        text: "I can pay. Don't tell me the stamp was your idea of mercy if it is still on the wall.",
        replies: [end("The price is the price.")],
      },
      held: {
        speaker: "jun",
        text: "The brick is real and I am not allowed to be its shop. Cress is the parent of that sentence. You can still sell me one quietly. I will pay worse, and she will hear.",
        replies: [end("Quiet has a price too.")],
      },
      sleep: {
        speaker: "jun",
        text: "Teb went to a warm wall. I did not give him that. Whoever seated the set did. The bed upstairs is still just a bed.",
        replies: [end("I'll use it if I need it.")],
      },
    },
  },
  teb: {
    start: "start",
    nodes: {
      start: {
        speaker: "teb",
        text: "Teb. I sleep where the wall is least cruel. Today that is a fact about brick, not about me.",
        replies: [
          {
            text: "The wall is holding.",
            goto: "warm",
            requires: [{ flag: "kilnHouses", is: true }],
          },
          {
            text: "The wall is cold.",
            goto: "cold",
            requires: [{ flag: "kilnHouses", is: false }],
          },
          { text: "Is there another way through this yard?", goto: "cellar" },
          end("Sleep, then."),
        ],
      },
      warm: {
        speaker: "teb",
        text: "It holds. If a bill came with it, the bill is not the heat. I can hate one and stand in the other.",
        replies: [end("Then stand.")],
      },
      cold: {
        speaker: "teb",
        text: "Clay is here and the set is not. I am not going to pretend a story about Harl fixes a parent. Water, heat, or a dry you bake yourself. I don't do those. I count nights.",
        replies: [end("Count them. I'll count the parents.")],
      },
      cellar: {
        speaker: "teb",
        text: "Nim sits on the cellar cut. She says the old flue has a glass that lies about being dead. I say don't smash a thing that is using you as weather. She knows the lock better than I do.",
        replies: [end("I'll ask Nim.")],
      },
    },
  },
  nim: {
    start: "start",
    nodes: {
      start: {
        speaker: "nim",
        text: "Nim. The cellar cut is a lock, not a wall. Something under it drinks a flue the yard forgot. It is not attacking. It is nested.",
        replies: [
          { text: "How does the lock actually open?", goto: "lock" },
          {
            text: "I have the glass.",
            goto: "glass",
            requires: [{ item: "sootglass" }],
          },
          {
            text: "The mite woke up.",
            goto: "woke",
            requires: [{ flag: "miteAwake", is: true }],
          },
          end("Leave the nest."),
        ],
      },
      lock: {
        speaker: "nim",
        text: "Work the lock if your hands know locks. Or I can tell you the give in the hinge, and then it is just a door. Smashing the glass inside wakes what is nested on it. Lifting the glass, once you can read it, does not.",
        replies: [
          end("Show me the give.", [
            flag("kilnTold", true),
            journal(
              "kiln-cellar",
              "The cellar cut",
              "Nim knows the hinge. A lockwork hand can open it without her. Under it, a soot glass can be lifted if it has been read. Smashing it wakes the mite that was using it as a parent.",
            ),
            log("The hinge has a give. The door will listen now."),
          ]),
          end("I'll try the lock myself."),
        ],
      },
      glass: {
        speaker: "nim",
        text: "You lifted it. The mite is still nested, which means you did not take its parent by force. That glass names a seam other people call illegible. Use it on a lie, not on a person.",
        replies: [end("On a lie, then.")],
      },
      woke: {
        speaker: "nim",
        text: "You smashed the parent. It answered. I told you it was nested, not dead.",
        replies: [end("It answered.")],
      },
    },
  },
  voss: {
    start: "start",
    nodes: {
      start: {
        speaker: "voss",
        text: "Voss. The stamp is a person charging rent on fire. I don't want the houses cold. I want Cress unable to invoice them.",
        replies: [
          { text: "What do you actually want done?", goto: "want" },
          {
            text: "The stamp is already a hole.",
            goto: "hole",
            requires: [{ flag: "stampCut", is: true }],
          },
          {
            text: "I licensed her.",
            goto: "licensed",
            requires: [{ flag: "kilnLicensed", is: true }, { flag: "stampCut", is: false }],
          },
          {
            text: "There is no brick. There is no bill.",
            goto: "nobill",
            requires: [{ flag: "brickLive", is: false }],
          },
          end("Not your yard."),
        ],
      },
      want: {
        speaker: "voss",
        text: "Cut the stamp on her desk. The levy dies. Jun can sell if the brick is real. If you pay Cress instead, the houses get a bill with their heat. I will leave if you can say that to my face like a person. I will not help you do it.",
        replies: [
          end("I'll decide at the desk."),
          {
            text: "Step aside or I move you.",
            goto: "fight",
            effects: [{ op: "combat", ids: ["voss"] }, log("Voss answers with a baton, not a theory.")],
          },
        ],
      },
      hole: {
        speaker: "voss",
        text: "Good. The houses can keep the heat without her number. Don't expect me to call you kind. You made a hole. The hole was the point.",
        replies: [
          end(
            "The hole was the point.",
            [
              { op: "scrip", n: 8 },
              { op: "rep", faction: "unbound", n: 4 },
              flag("vossPaid", true),
              log("He pays like a man settling a tool, not a debt of friendship."),
            ],
            { requires: [{ missing: "vossPaid" }] },
          ),
          end("That's enough."),
        ],
      },
      licensed: {
        speaker: "voss",
        text: "Then the heat has a landlord. Say it plainly or don't talk to me.",
        replies: [
          {
            text: "The bill is the price of a legal board. I chose it.",
            check: { skill: "speech", dc: 46 },
            goto: "left",
            failGoto: "stay",
            effects: [flag("vossLeft", true), log("He leaves the yard. He does not forgive the sentence. He stops blocking it.")],
          },
          end("Then stay angry."),
        ],
      },
      left: {
        speaker: "voss",
        text: "Fine. I'll be on the road. Don't wave.",
        replies: [end("I won't.")],
      },
      stay: {
        speaker: "voss",
        text: "That was a speech looking for a plaque. I'm still here.",
        replies: [end("Then be here.")],
      },
      nobill: {
        speaker: "voss",
        text: "No brick, no bill. Also no walls worth sleeping in. You solved her and you solved the houses in the same direction. I don't cheer for that.",
        replies: [end("I wasn't asking for a cheer.")],
      },
      fight: {
        speaker: "voss",
        text: "Then we do it this way.",
        replies: [end("Move.")],
      },
    },
  },
  mite: {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A small mill nested in the old flue. It is not hostile. The soot glass is in its weather. Take the glass cleanly and the nest stays a nest. Smash the glass and the nest has to stand up.",
        replies: [end("Leave it nested.")],
      },
    },
  },
  "kiln-cellar": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A cellar cut under the houses. The hinge is tired. The lock is not a moral problem. It is a lock.",
        replies: [
          {
            text: "Use the give Nim showed you.",
            requires: [{ flag: "kilnTold", is: true }],
            goto: "open",
            effects: [flag("kilnCellar", true), log("The hinge gives. The cellar is a room.")],
          },
          {
            text: "Work the lock.",
            check: { skill: "lockwork", dc: 48 },
            goto: "open",
            failGoto: "stuck",
            effects: [flag("kilnCellar", true), log("The lock turns. You were not invited. The door does not care.")],
            failEffects: [log("The lock holds. A better hand, or Nim's give, would not have to fight it.")],
          },
          end("Leave it shut."),
        ],
      },
      open: {
        speaker: "narrator",
        text: "The cut opens on a dry flue and a nested mill. The glass is a machine, not a treasure pile.",
        replies: [end("Go down.")],
      },
      stuck: {
        speaker: "narrator",
        text: "Still shut.",
        replies: [end("Still shut.")],
      },
    },
  },
  "tobin-kiln": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "This flue is a cousin of the lung, not a child of it. If the bricks crack, don't blame Harl until you have looked at the gallery. Water is a parent even in a yard that thinks it only owns clay.",
        replies: [
          end("I'll look upstream.", [
            flag("tobinKilnSpoke", true),
            log("Tobin counts the kiln the way he counts a pump: local hands, distant parents."),
          ]),
        ],
      },
    },
  },
  "wren-kiln": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "The set is a line. Clay, water, heat, stamp. If you only fix the one in front of you, the line will still fail somewhere you are not standing.",
        replies: [
          end("Then I walk the line.", [flag("wrenKilnSpoke", true), log("Wren will not let the kiln be a single machine.")]),
        ],
      },
    },
  },
};
