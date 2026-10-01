import type { Convo, Effect, Reply } from "./types";

const log = (text: string): Effect => ({ op: "log", text });
const flag = (key: string, value: string | number | boolean): Effect => ({ op: "flag", key, value });

function end(text: string, effects?: Effect[], extra?: Partial<Reply>): Reply {
  return { text, effects, end: true, ...extra };
}

export const CAMPAIGN: Record<string, Convo> = {
  cinder: {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "A reed moth, brass-dusted, no bigger than a valve wheel. She is not a person and not a part. She watches the lung the way a living thing watches weather. Hunger is visible if you bother to read her. Trust is not a lever.",
        replies: [
          {
            text: "Hold still.",
            requires: [{ flag: "cinderFed", is: true }, { missing: "cinderChose" }],
            effects: [
              flag("cinderChose", true),
              { op: "recruit", id: "cinder" },
              { op: "xp", n: 14 },
              log("She steps onto your shadow. The company was not assigned. She picked it."),
            ],
            end: true,
          },
          {
            text: "Leave the plate scrap where she can take it.",
            requires: [{ item: "scrap" }, { missing: "cinderFed" }],
            goto: "fed",
            effects: [
              { op: "take", id: "scrap", n: 1 },
              flag("cinderSeen", true),
              flag("cinderFed", true),
              { op: "xp", n: 8 },
              log("You leave the scrap. She does not thank you. She eats. Hunger was the parent."),
            ],
          },
          {
            text: "Just watch.",
            effects: [flag("cinderSeen", true), log("You don't reach. She stays. Observation is an action.")],
            end: true,
          },
          end("Leave her the reed."),
        ],
      },
      fed: {
        speaker: "narrator",
        text: "She cleans a whisker of iron off her mouth and looks at your shadow like it might be a perch. She has not chosen it. Choosing is hers.",
        replies: [
          {
            text: "Hold still.",
            requires: [{ missing: "cinderChose" }],
            effects: [
              flag("cinderChose", true),
              { op: "recruit", id: "cinder" },
              { op: "xp", n: 14 },
              log("She steps onto your shadow. The company was not assigned. She picked it."),
            ],
            end: true,
          },
          end("Not yet. Let her keep the reed."),
        ],
      },
    },
  },
  "cinder-dark": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "The moth stops at the mouth. The lamps are out, or this walk drinks from a parent that failed. She will cross if you wait with her. She will also cross if you go and she decides the shadow matters more than the dark. Dragging is not one of the options she understands.",
        replies: [
          end("Wait until she steps.", [
            flag("cinderDarkOk", true),
            log("You wait. She hates it, and then she crosses. The dark did not become safe. She chose anyway."),
          ]),
          end("Take another way.", [log("You stay off that mouth. The south walk, or a later hour, is still a path.")]),
        ],
      },
    },
  },
  porter: {
    start: "start",
    nodes: {
      start: {
        speaker: "jot",
        text: "Jot. I haul what the stair will sign, and I sleep in the cut when it won't. The stack road starts at that notch in the wall. Nobody is going to menu you a city. You walk it, or you don't.",
        replies: [
          { text: "What does the road actually carry?", goto: "carry" },
          {
            text: "The ward says the water stopped.",
            goto: "dry",
            requires: [{ flag: "nessaRefuses", is: true }],
          },
          end("I'll walk it."),
        ],
      },
      carry: {
        speaker: "jot",
        text: "Water one way, stone the other, heat after the stone, light if the citadel still has a child to spare. Break one and don't be surprised when a room you haven't stood in yet goes quiet.",
        replies: [end("That's the job, then.")],
      },
      dry: {
        speaker: "jot",
        text: "Nessa won't front a debt against a parent that stopped. I don't sell water. I just stop getting paid to move it. Look at the lung, not at her temper.",
        replies: [end("The lung, then.")],
      },
    },
  },
  sela: {
    start: "start",
    nodes: {
      start: {
        speaker: "sela",
        text: "We haven't had water. Not a sermon. The cistern coughs, the plots crack, and Quill will not price a rumor. I don't know the machine. I know the cup.",
        replies: [
          {
            text: "The plots are drinking.",
            goto: "drinking",
            requires: [{ flag: "foodLive", is: true }],
          },
          {
            text: "The bed was refused.",
            goto: "refused",
            requires: [{ flag: "plotsRefused", is: true }],
          },
          {
            text: "The stall is dark.",
            goto: "dark",
            requires: [{ flag: "nessaRefuses", is: true }],
          },
          end("I'll find what the cup is a child of."),
        ],
      },
      drinking: {
        speaker: "sela",
        text: "Then the cup is a cup again. Don't expect me to thank the levy that came with it. Quill eats off the same pipe. I eat off the other end.",
        replies: [end("Both are on the pipe.")],
      },
      refused: {
        speaker: "sela",
        text: "You left the beds down. I won't call it cruelty and I won't call it wisdom. The alley gets louder when we don't eat. That's a fact about a door.",
        replies: [end("I heard the door.")],
      },
      dark: {
        speaker: "sela",
        text: "Nessa's shutter is a symptom. If you fix her and not the parent, the shutter closes again. I've watched that play.",
        replies: [end("Then not the shutter.")],
      },
    },
  },
  rill: {
    start: "start",
    nodes: {
      start: {
        speaker: "rill",
        text: "Rill. I was on the count under the boom until the count got theoretical. The grade dumped me in the pit instead of on the slab. You can call that a rescue. I call it the chute doing a sloppy job of being a parent.",
        replies: [
          {
            text: "The slab came down clear.",
            goto: "clear",
            requires: [{ flag: "quarryStone", is: "clear" }],
          },
          {
            text: "The stone took someone.",
            goto: "scar",
            requires: [{ flag: "workerHurt", is: true }],
          },
          {
            text: "You're the missing name. I'll say so.",
            goto: "name",
            effects: [flag("rillSpoken", true), { op: "xp", n: 10 }, log("Rill is on the count again. The boom did not have to be the whole sentence.")],
          },
          end("I'll read the crane before I promise anything."),
        ],
      },
      clear: {
        speaker: "rill",
        text: "Clear is a good word for stone and a bad word for people. I was already off the grade. You didn't save me. You saved whoever was still under it. I'll take the distinction.",
        replies: [end("Keep the distinction.")],
      },
      scar: {
        speaker: "rill",
        text: "Then the crane has a name that isn't mine. Don't sand it off to make the walk easier. The stone was still stone.",
        replies: [end("The name stays.")],
      },
      name: {
        speaker: "rill",
        text: "Say it to Hask, not to a plaque. Plaques are how a district forgets which parent actually moved.",
        replies: [end("Hask, then.")],
      },
    },
  },
  nell: {
    start: "start",
    nodes: {
      start: {
        speaker: "nell",
        text: "Nell. I sleep when the flue sleeps. The guild will tell you heat is a policy. It's a child of a haul. If the quarry stops, I stop pretending the blanket is a machine.",
        replies: [
          {
            text: "The tenement has the night.",
            goto: "warm",
            requires: [{ flag: "tenementWarm", is: true }],
          },
          {
            text: "The hall took the heat.",
            goto: "hall",
            requires: [{ flag: "guildWarm", is: true }, { flag: "tenementWarm", is: false }],
          },
          {
            text: "The forge is turning stock.",
            goto: "stock",
            requires: [{ flag: "gearLive", is: true }],
          },
          end("I'll read the hearth."),
        ],
      },
      warm: {
        speaker: "nell",
        text: "Then I sleep. Don't dress it up. A flue with a parent is a flue. I don't owe the quarry a song.",
        replies: [end("Sleep, then.")],
      },
      hall: {
        speaker: "nell",
        text: "The benches are warm and the blankets aren't. That's not a villain. That's a split. Seat both, or live with who you left in the cold.",
        replies: [end("I know who the split leaves.")],
      },
      stock: {
        speaker: "nell",
        text: "Stock means ore, water, and fire all showed up. My blanket doesn't care about the rifles. It cares that the fire had somewhere else to be.",
        replies: [end("The fire had parents.")],
      },
    },
  },
  kel: {
    start: "start",
    nodes: {
      start: {
        speaker: "kel",
        text: "Kel. The brass ice bites the middle of the walk and ignores the edges. North of the glaze you're fine. South of it you're fine. The citadel is uphill either way. I don't work for the lamps.",
        replies: [
          {
            text: "The lamps are out.",
            goto: "dark",
            requires: [{ flag: "roadDark", is: true }],
          },
          {
            text: "The south road doesn't need them.",
            goto: "south",
            requires: [{ flag: "roadBypass", is: true }],
          },
          end("I'll take an edge."),
          {
            text: "The hollow is warm. I need the middle of the walk.",
            goto: "cleat",
            requires: [{ flag: "hollowRead", is: true }, { missing: "cleatGiven" }],
          },
        ],
      },
      dark: {
        speaker: "kel",
        text: "Then the stack road is a rumor with teeth. The shade down there stops being scenery when the glass fails. Fix the parent, break the child, or walk around. I'm not a quest marker. I'm cold.",
        replies: [end("Cold is enough.")],
      },
      south: {
        speaker: "kel",
        text: "Lark's cut. It works. It also means you decided the lamps were optional. The citadel may disagree without being right.",
        replies: [end("Optional is still a decision.")],
      },
      cleat: {
        speaker: "kel",
        text: "The middle bites because the glaze has no parent you can argue with. These keep a foot from paying it. They are not a rank.",
        replies: [
          end("I'll take the edge with me.", [
            flag("cleatGiven", true),
            { op: "item", id: "cleat", n: 1 },
            log("Kel hands over edge cleats. The ice is still ice. Your feet are no longer the child it bills."),
          ]),
        ],
      },
    },
  },
  shade: {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "Something patient lives in the lamp shadow. While the glass holds, it is only a shape. It does not owe you a fight, and you do not owe it a moral.",
        replies: [
          {
            text: "The glass is broken.",
            goto: "broken",
            requires: [{ flag: "roadDark", is: true }],
          },
          end("Leave the shape alone."),
        ],
      },
      broken: {
        speaker: "narrator",
        text: "The shape is thicker now. It is not evil. It is what the road does when its parent stops. You can still leave it by giving the lamps a parent, or by not using this stretch.",
        replies: [end("Then the lamps are the argument.")],
      },
    },
  },
  "tobin-road": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "I keep the step. I don't keep score. If the lung is seated, say so. If you stopped it, don't ask me to call the dryness a clever trick.",
        replies: [
          {
            text: "The lung is seated. You should hear it from me.",
            goto: "heard",
            requires: [{ flag: "bellowsLive", is: true }, { flag: "reedRead", is: true }, { missing: "tobinHeardLung" }],
            effects: [flag("tobinHeardLung", true), log("Tobin hears the lung as maintenance. He nods like a man checking a bolt.")],
          },
          {
            text: "I stopped the bellows.",
            goto: "stopped",
            requires: [{ flag: "bellowsLive", is: false }, { missing: "tobinHeardLung" }],
            effects: [flag("tobinHeardLung", true), log("You say the lung is stopped. He counts it. He does not leave.")],
          },
          end("Keep the step."),
        ],
      },
      heard: {
        speaker: "tobin",
        text: "Maintenance. That's the word I'll use. The ward can use a different one when the levy shows up.",
        replies: [end("Let them.")],
      },
      stopped: {
        speaker: "tobin",
        text: "Then everything downstream of that reed is your sentence, including the people who never saw you cut it. I'm still walking.",
        replies: [end("Keep walking.")],
      },
    },
  },
  "wren-road": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "Roads are pipes with boots. If you want the pit to know what the lung is, we already have a way to say it. If you want company without the diagram, that is also a kind of line.",
        replies: [
          end("The company is the point.", [flag("wrenWalked", true), log("Wren walks the pit's direction without making the diagram the toll.")]),
          {
            text: "The carts toward the ward are heavier.",
            goto: "carts",
            requires: [{ flag: "foodLive", is: true }],
          },
          end("Hold the diagram until I ask."),
        ],
      },
      carts: {
        speaker: "wren",
        text: "Someone is eating. I haven't stood in the room. The weight is on the road before the diagram is. That's the part I used to miss.",
        replies: [end("Then we walk toward the weight.")],
      },
    },
  },
  "sera-road": {
    start: "start",
    nodes: {
      start: {
        speaker: "sera",
        text: "I came to watch what you do with a standard, a forge, and a bill. Not to clap. If you want me gone, say gone. If you want an argument, the road is long enough.",
        replies: [
          {
            text: "Look at the stock with me.",
            goto: "gear",
            requires: [{ flag: "gearLive", is: true }, { missing: "seraSawGear" }],
            effects: [flag("seraSawGear", true), log("Sera looks at live stock. She disagrees. She stays.")],
          },
          end("Argue while we walk."),
        ],
      },
      gear: {
        speaker: "sera",
        text: "I looked. Rifles are a child of ore and water and fire. You can be proud of the seating and still hate the use. I won't pick your sentence.",
        replies: [end("I didn't ask you to.")],
      },
    },
  },
  "mara-road": {
    start: "start",
    nodes: {
      start: {
        speaker: "mara",
        text: "Ives thinks a song is a fault if it keeps you alive. I think a fault that keeps you alive is a parent. You don't have to mend me to let me walk.",
        replies: [
          end("Walk. I won't sand the nights off you.", [log("Mara keeps the cadence. The road does not require a cleaner version of her.")]),
          end("Tell me if the hall gets loud."),
        ],
      },
    },
  },
  pip: {
    start: "start",
    nodes: {
      start: {
        speaker: "pip",
        text: "Pip. I sleep where the door forgets to ask. Adults call the cut a shortcut. I call it a bed that still has a wall.",
        replies: [
          {
            text: "The plots are drinking. You don't have to sleep in the cut.",
            goto: "home",
            requires: [{ flag: "foodLive", is: true }],
          },
          {
            text: "The alley is the bed because the ward isn't.",
            goto: "cut",
            requires: [{ flag: "ashAccess", is: true }, { flag: "foodLive", is: false }],
          },
          {
            text: "A moth showed you a pipe.",
            goto: "moth",
            requires: [{ companion: "cinder" }],
          },
          {
            text: "The reed sleeper says you follow wings, not maps.",
            goto: "doss-drip",
            requires: [{ flag: "dossMet", is: true }, { companion: "cinder" }, { missing: "pipShown" }],
          },
          end("I'll read the parent before I move your bed."),
        ],
      },
      home: {
        speaker: "pip",
        text: "Then the cut can be a cut again. Don't thank me. The meal is a child of a pipe. I just stopped needing the wall.",
        replies: [end("The wall can be a wall.")],
      },
      cut: {
        speaker: "pip",
        text: "If you seat the bed, I leave. If you refuse it, I stay. Neither of those is a favor you did for a child. They're what the pipe did.",
        replies: [end("I'll remember which one I meant.")],
      },
      moth: {
        speaker: "pip",
        text: "She wouldn't cross the dark stall. She went along the old drip instead, the one the grate still remembers. I followed the wings, not a map. Your audit doesn't have wings.",
        replies: [end("Wings aren't a diagram. That's why I missed it.", [flag("pipShown", true), log("Pip followed the moth along a drip the grate still remembers. The route was never a secret door. It was a living thing refusing a dead one.")])],
      },
      "doss-drip": {
        speaker: "pip",
        text: "Doss sleeps on weather. The moth doesn't. She walks the drip the grate still has, the one adults paved over because it wasn't straight. I can show you the wet, not the diagram.",
        replies: [end("Show me the wet.", [flag("pipShown", true), log("Pip takes the drip the moth already preferred. The grate remembers it. A straight line would have missed it.")])],
      },
    },
  },
  "cinder-heat": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "The moth stops at the rust mouth. Something here is still burning, and the reed she nested on is not. Heat is a predator to her. You can ask her to stay. You cannot make the asking into an order she understands.",
        replies: [
          end("Stay if you want. The heat is weather, not an order.", [
            flag("cinderKept", true),
            log("You don't drag her. She stays. The forge is still loud. The staying was hers."),
          ]),
          end("I won't take you into that noise.", [
            flag("cinderLeft", true),
            log("You stop at the mouth. The shadow is no longer a requirement."),
          ]),
          end("I'm going in.", [
            flag("cinderRisk", true),
            log("You go in. She has not agreed. She may decide the shadow is finished."),
          ]),
        ],
      },
    },
  },
  doss: {
    start: "start",
    nodes: {
      start: {
        speaker: "doss",
        text: "Doss. I sleep where the reed sweats. It isn't a room. It's weather. If the lung stops, I stop pretending the plate is a bed.",
        replies: [
          {
            text: "The lung is still making weather.",
            goto: "weather",
            requires: [{ flag: "bellowsLive", is: true }, { flag: "reedRead", is: true }],
          },
          {
            text: "The lung stopped.",
            goto: "stopped",
            requires: [{ flag: "bellowsLive", is: false }],
          },
          {
            text: "A moth eats here.",
            goto: "moth",
            requires: [{ flag: "cinderFed", is: true }],
          },
          end("Sleep. I won't move your weather.", [flag("dossMet", true)]),
        ],
      },
      weather: {
        speaker: "doss",
        text: "Then I stay. There's a long iron under the drip. Too much reach for a sleeper, too honest to be a wage. Take it or leave it. The reed doesn't invoice.",
        replies: [
          end(
            "I'll take the iron.",
            [
              flag("dossMet", true),
              flag("dossSpan", true),
              { op: "item", id: "span", n: 1 },
              log("Doss slides a long iron out from under the reed. It reaches. It is not a promotion."),
            ],
            { requires: [{ missing: "dossSpan" }] },
          ),
          end("Leave it. The bed is the point.", [flag("dossMet", true), log("You leave the iron under the reed. Doss keeps the weather.")], {
            requires: [{ missing: "dossSpan" }],
          }),
          end("You still have the bed. I still have the reach.", [flag("dossMet", true)], { requires: [{ flag: "dossSpan", is: true }] }),
        ],
      },
      stopped: {
        speaker: "doss",
        text: "The lung quit. I moved. The iron stays under a reed that isn't sweating. The bench is a floor. That's enough until the weather comes back. Don't ask me to call the dryness clever.",
        replies: [end("I won't.", [flag("dossMet", true), log("Doss is done sleeping on the reed. The weather left first.")])],
      },
      moth: {
        speaker: "doss",
        text: "She eats the drip. She doesn't pay and she doesn't snore, which is more than I can say for the stacks. If she follows a shadow, that's a perch she picked. I don't own her, and you shouldn't try.",
        replies: [end("I won't put a collar on weather.", [flag("dossMet", true)])],
      },
    },
  },
  ada: {
    start: "start",
    nodes: {
      start: {
        speaker: "ada",
        text: "Ada. I eat what the bed gives. If the bed is a rumor, I carry an empty plate so nobody can call hunger a mood. I don't need a speech. I need a parent, or the honesty of not having one.",
        replies: [
          {
            text: "The plots are drinking.",
            goto: "eating",
            requires: [{ flag: "foodLive", is: true }],
          },
          {
            text: "The bed was left down.",
            goto: "empty",
            requires: [{ flag: "plotsRefused", is: true }],
          },
          {
            text: "The clinic took the feed.",
            goto: "clinic",
            requires: [{ flag: "wardSplit", is: "clinic" }],
          },
          {
            text: "The stall took the feed.",
            goto: "stall",
            requires: [{ flag: "wardSplit", is: "market" }],
          },
          {
            text: "Nessa's shutter is down.",
            goto: "shutter",
            requires: [{ flag: "nessaRefuses", is: true }, { flag: "foodLive", is: false }],
          },
          end("The plate is yours to carry.", [flag("adaMet", true)]),
        ],
      },
      eating: {
        speaker: "ada",
        text: "Then I eat. The levy eats the same pipe and calls it governance. I call it a bill riding a meal. The child isn't in the cut anymore. I didn't fetch her. A meal is a door. Don't ask me to thank the bill for the door.",
        replies: [end("The meal and the bill are not the same kindness.", [flag("adaMet", true), log("Ada eats. She does not thank the levy for sharing a parent.")])],
      },
      empty: {
        speaker: "ada",
        text: "The bed is down. I won't dress that up and I won't hate you for it. The plate stays empty. The levy has nothing to write on. I can live beside one of those facts. I won't live beside a lie that says I ate.",
        replies: [end("The plate stays empty.", [flag("adaMet", true), log("Ada keeps the empty plate. The refusal is still in the room.")])],
      },
      clinic: {
        speaker: "ada",
        text: "The clinic has the water. I don't begrudge a stitch. I also don't eat stitches. That's a split. Seat both if you can. If you can't, know whose plate you left dry.",
        replies: [end("I know whose plate.", [flag("adaMet", true)])],
      },
      stall: {
        speaker: "ada",
        text: "Quill will price a cup before I see a plate. Nessa will sell it. I'm not their villain and they're not mine. A split is a split.",
        replies: [end("A split, then.", [flag("adaMet", true)])],
      },
      shutter: {
        speaker: "ada",
        text: "Nessa's shutter is the stall telling the truth. My plate is the other end of the same sentence. Fix her and not the parent, and the shutter closes again. I've watched that.",
        replies: [end("Then not the shutter.", [flag("adaMet", true)])],
      },
    },
  },
  pim: {
    start: "start",
    nodes: {
      start: {
        speaker: "pim",
        text: "Pim. I work the grade until the boom starts thinking. Then I don't. A cable with a parent I can't see is not a workplace. It's a sentence waiting on a name.",
        replies: [
          {
            text: "The slab came down clear.",
            goto: "clear",
            requires: [{ flag: "quarryStone", is: "clear" }],
          },
          {
            text: "The stone took someone.",
            goto: "scar",
            requires: [{ flag: "quarryStone", is: "scarred" }],
          },
          {
            text: "Rill was off the grade.",
            goto: "rill",
            requires: [{ flag: "rillSpoken", is: true }],
          },
          {
            text: "The colossus stopped.",
            goto: "throat",
            requires: [{ flag: "colossusBreath", is: false }],
          },
          end("I won't ask you to stand under it.", [flag("pimMet", true)]),
        ],
      },
      clear: {
        speaker: "pim",
        text: "It's down, and it missed. I'll stand the count. Don't call it brave. Bravery is what they write when they need a plaque. The parent stopped being a threat. That's all. The colossus is still that parent. Missing us once is not a retirement.",
        replies: [end("Missing once is not a retirement.", [flag("pimMet", true), log("Pim steps toward the count. The fear stood down with the slab.")])],
      },
      scar: {
        speaker: "pim",
        text: "A name is on the stone. I already knew the boom could write. I won't stand there to make the second name cheaper. Leave the name. Sanding it off doesn't put a rigger back.",
        replies: [end("The name stays.", [flag("pimMet", true), log("Pim stays off the grade. The stone already has a name.")])],
      },
      rill: {
        speaker: "pim",
        text: "Then the board has a person and the crane isn't the only record. Say it to Hask if you haven't. I don't do plaques.",
        replies: [end("Hask can have the name.", [flag("pimMet", true)])],
      },
      throat: {
        speaker: "pim",
        text: "The throat stopped. The cable is carrying the pit alone. That's louder, not safer. I stay south of the boom until somebody is holding that parent again, or until the slab is a fact on the ground.",
        replies: [end("South of the boom, then.", [flag("pimMet", true)])],
      },
    },
  },
  sarn: {
    start: "start",
    nodes: {
      start: {
        speaker: "sarn",
        text: "Sarn. Kitchen. The pots don't know rank. They know whether a haul arrived. If the plate upstairs is hungry, they'll invent a law. It will still be hunger. If rank could be eaten, the upstairs would be fatter.",
        replies: [
          {
            text: "The plate is unfed.",
            goto: "toll",
            requires: [{ flag: "guardToll", is: true }],
          },
          {
            text: "Stone reached the stores.",
            goto: "stores",
            requires: [{ flag: "citadelSupplied", is: true }],
          },
          {
            text: "The siphon was cut.",
            goto: "dark",
            requires: [{ flag: "citadelFate", is: "sever" }],
          },
          {
            text: "Someone wrote a hand on the shape.",
            goto: "hand",
            requires: [{ flag: "citadelFate", is: "seize" }],
          },
          {
            text: "The light went downhill.",
            goto: "downhill",
            requires: [{ flag: "citadelFate", is: "redirect" }],
          },
          {
            text: "The clock stopped.",
            goto: "clock",
            requires: [{ flag: "orreryTurn", is: false }, { flag: "seenCitadel", is: true }],
          },
          end("Cook. The pots have their own parents.", [flag("sarnMet", true)]),
        ],
      },
      toll: {
        speaker: "sarn",
        text: "They're unfed. They stand in a doorway and call it a toll. Feed the stores or live with the doorway. I won't pretend the ladle is a policy.",
        replies: [end("A missing meal, not a new law.", [flag("sarnMet", true), log("Sarn calls the toll a meal. The doorway does not get a better name.")])],
      },
      stores: {
        speaker: "sarn",
        text: "Stone got here. I can cook. That doesn't make the road a kindness. It makes the pot a child of a haul. I'll feed who is in the room. I won't thank the rank for the road.",
        replies: [end("Feed the room.", [flag("sarnMet", true), log("Sarn cooks from stone that crossed the road. She does not thank the rank.")])],
      },
      dark: {
        speaker: "sarn",
        text: "The lifts died. The infirmaries went with them. My kitchen is still a kitchen. It is not a consolation, and I won't let you use the soup as one.",
        replies: [end("Not a consolation.", [flag("sarnMet", true)])],
      },
      hand: {
        speaker: "sarn",
        text: "Someone put a hand on the shape. The soup tastes the same. The room got smaller. If that was you, eat standing up. There's less space to sit.",
        replies: [end("I'll eat standing.", [flag("sarnMet", true)])],
      },
      downhill: {
        speaker: "sarn",
        text: "Light went downhill. We still eat if the stores do. The balconies can learn cold without my comment. I have onions.",
        replies: [end("Onions, then.", [flag("sarnMet", true)])],
      },
      clock: {
        speaker: "sarn",
        text: "The orrery stopped. I still cook. I just don't know which hour the plate thinks it is. Meals don't need a clock. Guards do. That's why they're irritable.",
        replies: [end("The pots don't need the hour.", [flag("sarnMet", true)])],
      },
    },
  },
  drift: {
    start: "start",
    nodes: {
      start: {
        speaker: "drift",
        text: "Drift. I keep the edge. The middle of this walk bites, and the hollow only sleeps when a clock uphill remembers to send weather. I don't guide. I stand where my feet still belong to me.",
        replies: [
          {
            text: "The hollow is warm.",
            goto: "warm",
            requires: [{ flag: "hollowWarm", is: true }],
          },
          {
            text: "The hollow has no weather.",
            goto: "cold",
            requires: [{ flag: "hollowWarm", is: false }, { flag: "tundraWalked", is: true }],
          },
          {
            text: "The lamps are out.",
            goto: "dark",
            requires: [{ flag: "roadDark", is: true }],
          },
          {
            text: "The moth won't take the dark mouth.",
            goto: "moth",
            requires: [{ companion: "cinder" }, { missing: "cinderDarkOk" }],
          },
          {
            text: "The south walk doesn't need the lamps.",
            goto: "south",
            requires: [{ flag: "roadBypass", is: true }],
          },
          end("The edge is a decision.", [flag("driftMet", true)]),
        ],
      },
      warm: {
        speaker: "drift",
        text: "The bowl is warm. I'll sleep in it. That's not a blessing. It's a child arriving from a clock you may have stood under, or may still be pretending is the sky.",
        replies: [end("Sleep where it was sent.", [flag("driftMet", true), log("Drift takes the hollow. The weather arrived before any speech about it.")])],
      },
      cold: {
        speaker: "drift",
        text: "The hollow's empty. I stay on the edge. The middle is still a bill, cleats or no cleats. Kel has iron for people who want to pay it standing up. I like my feet where the glaze isn't.",
        replies: [end("The edge, then.", [flag("driftMet", true), log("Drift stays on the edge. The hollow has no weather to sleep in.")])],
      },
      dark: {
        speaker: "drift",
        text: "The lamps died. The ice did not take a side. The shade on the glass stretch stops being scenery. The south edge doesn't ask the lamps for permission.",
        replies: [end("The ice didn't take a side.", [flag("driftMet", true)])],
      },
      moth: {
        speaker: "drift",
        text: "She won't take a mouth that failed. She's reading a parent, not disobeying you. Walk the edge with her, or wait until she decides the shadow matters more than the dark. Dragging is how you lose a weather.",
        replies: [end("I won't drag her.", [flag("driftMet", true), log("Drift names the moth's refusal. It is not a command she failed.")])],
      },
      south: {
        speaker: "drift",
        text: "Lark's cut. It works. It also means the lamps were optional. Optional is still a decision. I won't put a sign on it. Signs turn a shortcut into a toll.",
        replies: [end("No sign.", [flag("driftMet", true)])],
      },
    },
  },
  "cinder-spire": {
    start: "start",
    nodes: {
      start: {
        speaker: "narrator",
        text: "The moth stops at the mouth. Whatever is ahead does not sound like weather. It sounds like a room missing a parent and unwilling to say so. She will come if you wait. She will also stay on the road, which is the last sound she wants. You do not get to carry her.",
        replies: [
          end("Wait until she steps.", [
            flag("cinderSpireOk", true),
            log("You wait. She hates the sound, and then she comes. The Spire does not become weather."),
          ]),
          end("Stay on the road. I'll go in.", [
            flag("cinderSpireStay", true),
            { op: "dismiss", id: "cinder" },
            log("She stays at the mouth. The road is the weather she chose. The Spire is not."),
          ]),
        ],
      },
    },
  },
  "tobin-late": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "We've walked far enough that the bench is a rumor and the city is the job. I still don't have to like the last cut. I do have to know whether you sat in the shape or left the holes.",
        replies: [
          {
            text: "I put a hand on the rank.",
            goto: "hand",
            requires: [{ flag: "citadelFate", is: "seize" }],
          },
          {
            text: "I cut the siphon.",
            goto: "cut",
            requires: [{ flag: "citadelFate", is: "sever" }],
          },
          {
            text: "The ward is eating. So is the bill.",
            goto: "bill",
            requires: [{ flag: "foodLive", is: true }, { flag: "levyLive", is: true }],
          },
          end("Keep the step.", [flag("tobinLate", true), log("Tobin keeps walking. Agreement was never the price.")]),
        ],
      },
      hand: {
        speaker: "tobin",
        text: "Then don't call it maintenance. Maintenance doesn't own the drawing. I'll still walk. I won't sand that word for you.",
        replies: [end("Don't sand it.", [flag("tobinLate", true)])],
      },
      cut: {
        speaker: "tobin",
        text: "The dark is honest. The infirmaries are in it. I can hold both of those without calling you a villain. Don't ask me to pick a cleaner sentence.",
        replies: [end("Both, then.", [flag("tobinLate", true)])],
      },
      bill: {
        speaker: "tobin",
        text: "Food and a levy on one pipe. I knew that in the Sinks and I know it here. The meal is still a meal. The bill is still a bill. I'm glad I didn't have to pretend they were one kindness.",
        replies: [end("They stayed two things.", [flag("tobinLate", true)])],
      },
    },
  },
  "wren-late": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "If the line heard the lung, the pit already knows. If it didn't, the diagram stayed in my pocket, and that was also a walk. I didn't come to be right at the end. I came to see whether you'd sit in the standard.",
        replies: [
          {
            text: "The line heard you.",
            goto: "heard",
            requires: [{ flag: "workersKnow", is: true }],
          },
          {
            text: "I sat in the rank.",
            goto: "sat",
            requires: [{ flag: "citadelFate", is: "seize" }],
          },
          end("The pocket was a choice.", [flag("wrenLate", true), log("Wren keeps the diagram unsent. The company was the line.")]),
        ],
      },
      heard: {
        speaker: "wren",
        text: "Then I don't need to repeat it. A diagram that arrives is not a leash. If you want me gone before the Spire, say gone. I'd rather see the question.",
        replies: [end("See it with me.", [flag("wrenLate", true)])],
      },
      sat: {
        speaker: "wren",
        text: "You sat in it. I watched. I am still here, which is not forgiveness. It's the reason I walked: so the room would have a person who didn't want that chair.",
        replies: [end("Stay in the room.", [flag("wrenLate", true)])],
      },
    },
  },
  "sera-late": {
    start: "start",
    nodes: {
      start: {
        speaker: "sera",
        text: "I stayed to watch what you did with a standard. Not to clap, and not to leave the moment it got ugly. Say which child you meant. I'll tell you if I can live next to it.",
        replies: [
          {
            text: "I wrote my hand onto the shape.",
            goto: "face",
            requires: [{ flag: "citadelFate", is: "seize" }],
          },
          {
            text: "I cut it and left the holes.",
            goto: "holes",
            requires: [{ flag: "citadelFate", is: "sever" }],
          },
          {
            text: "The stock was refused. The parents stayed.",
            goto: "stock",
            requires: [{ flag: "stockRefused", is: true }],
          },
          end("Walk the rest. Argue if you have to.", [flag("seraLate", true)]),
        ],
      },
      face: {
        speaker: "sera",
        text: "Then I was right to be afraid, and wrong if I leave now. A face on the engine is not maintenance. I'll stay where you can hear that. I will not help you enjoy it.",
        replies: [end("Hear it.", [flag("seraLate", true), log("Sera stays beside a standard she will not bless.")])],
      },
      holes: {
        speaker: "sera",
        text: "You didn't put your face on it. The dark still has the infirmaries. I can live next to the refusal. I can't call the dark kind.",
        replies: [end("Don't call it kind.", [flag("seraLate", true)])],
      },
      stock: {
        speaker: "sera",
        text: "I saw the refusal. The forge can be healthy and still not be a rifle. That's the sentence I came to hear. The rest of the city can be a mess and that sentence can still be true.",
        replies: [end("The sentence stands.", [flag("seraLate", true)])],
      },
    },
  },
  "mara-late": {
    start: "start",
    nodes: {
      start: {
        speaker: "mara",
        text: "If you're about to sand the nights off me so the last room is simpler, don't. I walked this far with the song. The Spire doesn't get a cleaner version.",
        replies: [
          {
            text: "Nell is sleeping. The flue has a parent.",
            goto: "nell",
            requires: [{ flag: "tenementWarm", is: true }],
          },
          {
            text: "I left the lattice alone.",
            goto: "alone",
            requires: [{ flag: "maraFate", is: "intact" }],
          },
          {
            text: "I tried to mend the lattice.",
            goto: "mend",
            requires: [{ flag: "maraFate", is: "restored" }],
          },
          end("The nights come with you.", [flag("maraLate", true), log("Mara keeps the nights. The last room does not get to edit her.")]),
        ],
      },
      nell: {
        speaker: "mara",
        text: "Good. A night with a parent is still a night. Don't ask her to sing about it. I won't either. Warm is not a cure. It's a bed.",
        replies: [end("A bed.", [flag("maraLate", true)])],
      },
      alone: {
        speaker: "mara",
        text: "Then you left the thing that kept me alive. Ives will have a word for that. I don't. I just sleep the way I sleep, and I'm still walking.",
        replies: [end("Keep walking.", [flag("maraLate", true)])],
      },
      mend: {
        speaker: "mara",
        text: "I remember a kitchen. I don't remember the door-song the same way. That's easier, and easier is not the same as mine. I didn't ask you to stop. I am telling you what it cost.",
        replies: [end("I hear the cost.", [flag("maraLate", true)])],
      },
    },
  },
  moss: {
    start: "start",
    nodes: {
      start: {
        speaker: "moss",
        text: "The brake seized on a cart that already decided to be heavy. I am not a sign. I am the person who has been standing here while the weight argued with the iron.",
        replies: [
          {
            text: "The cart left.",
            goto: "left",
            requires: [{ flag: "cartEase", is: true }],
          },
          {
            text: "I pinned the load.",
            goto: "pinned",
            requires: [{ flag: "cartPinned", is: true }],
          },
          end("I'll read the brake.", [flag("mossMet", true), log("Moss stays on the brake. The cart is the sentence. She is not.")]),
        ],
      },
      left: {
        speaker: "moss",
        text: "Then Rust has the weight and does not have the speech yet. Don't ask me to be glad. A cart is not a kindness. It is a parent arriving early.",
        replies: [end("Let it arrive.", [flag("mossMet", true)])],
      },
      pinned: {
        speaker: "moss",
        text: "Then the pit can look finished and the forge can go hungry. I will stay on the pin. If you ease it later, the hunger was still true for as long as you meant it.",
        replies: [end("Leave the pin.", [flag("mossMet", true), log("Moss stays with the pin. Downstream will meet the absence.")])],
      },
    },
  },
  "tobin-mid": {
    start: "start",
    nodes: {
      start: {
        speaker: "tobin",
        text: "The ward is not a second city. It drinks from a room we already stood in. If the cups are full, a bill is drinking with them. If they are empty, the parent is the thing to name, not the thirst.",
        replies: [
          end("Name the parent.", [
            flag("tobinMid", true),
            log("Tobin counts the ward as a child of the Sinks. He does not grade the child."),
          ]),
        ],
      },
    },
  },
  "wren-mid": {
    start: "start",
    nodes: {
      start: {
        speaker: "wren",
        text: "The slab is a cable with a throat somewhere else. I can draw that without making the rigger a symbol. If you want the line to hear the lung, that is a different sentence from standing here.",
        replies: [
          end("Stand here.", [flag("wrenMid", true), log("Wren keeps the diagram in her hands. The pit does not have to hear it for the company to be real.")]),
        ],
      },
    },
  },
  "sera-mid": {
    start: "start",
    nodes: {
      start: {
        speaker: "sera",
        text: "I came to watch what you do with a forge that can be made to work. Working is not the same as permitted. If the stock is live, I disagree and I am still here. If you refused it, I heard you.",
        replies: [
          end("Keep watching.", [flag("seraMid", true), log("Sera stays. The disagreement was not a resignation.")]),
        ],
      },
    },
  },
  "mara-mid": {
    start: "start",
    nodes: {
      start: {
        speaker: "mara",
        text: "The nights came with me. If the flues are warm, that is a bed, not a cure. If you sanded the song so I would be easier, say so later. Not while the road is still a road.",
        replies: [
          end("The nights stay.", [flag("maraMid", true), log("Mara keeps the nights on the road. The walk does not get a cleaner version.")]),
        ],
      },
    },
  },
  brin: {
    start: "start",
    nodes: {
      start: {
        speaker: "brin",
        text: "The face reads dead. The pocket is not dry. I have been auditing the face because it is the thing that looks broken. If you have a better parent, say it. If you cut the face, it will bite you and the district will not notice.",
        replies: [
          {
            text: "The face is a costume. The feed behind it is holding.",
            goto: "named",
            requires: [{ flag: "gaugeRead", is: true }],
          },
          {
            text: "I cut the real feed.",
            goto: "cut",
            requires: [{ flag: "gaugeCut", is: true }],
          },
          end("The face can wait."),
        ],
      },
      named: {
        speaker: "brin",
        text: "Then I was reading a costume. The listener on the housing names one seam you have not admitted. It does not make the seam true, and it does not survive the telling. I am staying off the servo.",
        replies: [end("Stay off it.")],
      },
      cut: {
        speaker: "brin",
        text: "The pocket is dry and the pump is not. You cut a local parent. The drowned thing in the corner was drinking it. I am not going back in until it forgets.",
        replies: [end("Leave her the corridor.")],
      },
    },
  },
  vetch: {
    start: "start",
    nodes: {
      start: {
        speaker: "vetch",
        text: "The ward is dry, so the alley drinks what the clinic is not using. That still is a cup, not a well. Break it and we go thirsty. License it and I can live with a parent that is not a raid. Leave it and I will still be here.",
        replies: [
          {
            text: "The trickle is written down.",
            goto: "licensed",
            requires: [{ flag: "stillLicensed", is: true }],
          },
          {
            text: "The cup is broken.",
            goto: "broken",
            requires: [{ flag: "stillBroken", is: true }],
          },
          end("Leave the cup."),
        ],
      },
      licensed: {
        speaker: "vetch",
        text: "You wrote it down. I can pay a trickle. I will not pretend the cup made the ward.",
        replies: [
          end("Keep the trickle.", [
            flag("vetchPaid", true),
            { op: "scrip", n: 14 },
            log("Vetch pays for a cup that stayed a cup. The scrip is the license, not a thanks."),
          ], { requires: [{ missing: "vetchPaid" }] }),
          end("That's the room."),
        ],
      },
      broken: {
        speaker: "vetch",
        text: "You broke the cup while we were thirsty. The clinic did not become a well. I will not call it order.",
        replies: [end("It was a cut.")],
      },
    },
  },
  holt: {
    start: "start",
    nodes: {
      start: {
        speaker: "holt",
        text: "They are not mining. They are standing under a winch that is not the crane. If the canyon throat is still breathing, they can hear a parent and they will stand down or leave. If the throat is already still, that winch is the only parent they have.",
        replies: [
          {
            text: "They stood down.",
            goto: "down",
            requires: [{ flag: "crewStood", is: true }],
          },
          {
            text: "They left.",
            goto: "left",
            requires: [{ flag: "crewFled", is: true }],
          },
          end("The winch can wait."),
        ],
      },
      down: {
        speaker: "holt",
        text: "A live throat is a sentence they understand. The dog I kicked you holds a seam. It is not a wage.",
        replies: [end("The throat was the reason.")],
      },
      left: {
        speaker: "holt",
        text: "They left because the cable above them was still alive. I won't call that cowardice. I won't call it loyalty either.",
        replies: [end("Let them go.")],
      },
    },
  },
  ime: {
    start: "start",
    nodes: {
      start: {
        speaker: "ime",
        text: "This cell can keep one infirmary. It is not a siphon and it is not a pardon. Charge it while the parent is still sending. After you answer the crucible, it is a story about a night you did not store.",
        replies: [
          {
            text: "The cell is holding.",
            goto: "holding",
            requires: [{ flag: "bufferCharged", is: true }, { missing: "citadelFate" }],
          },
          {
            text: "One ward kept the night.",
            goto: "kept",
            requires: [{ flag: "bufferHeld", is: true }],
          },
          {
            text: "The cell was empty.",
            goto: "empty",
            requires: [{ flag: "citadelFate", is: "sever" }, { missing: "bufferCharged" }],
          },
          end("Leave the cell."),
        ],
      },
      holding: {
        speaker: "ime",
        text: "One night, if you cut the parent. The other wards will still go dark. I will not let you call the cell a solution.",
        replies: [end("One night.")],
      },
      kept: {
        speaker: "ime",
        text: "One ward kept the night. I will not thank you for the others. The dark is still the dark.",
        replies: [end("The others stayed dark.")],
      },
      empty: {
        speaker: "ime",
        text: "The wards went with the siphon. There was a cell. It was empty. That is also a decision.",
        replies: [end("It was empty.")],
      },
    },
  },
};

const LATE: { convo: string; text: string; requires: Reply["requires"]; goto: string; close?: string; node: { speaker: string; text: string } }[] = [
  {
    convo: "tobin-after",
    text: "Talk while we walk.",
    requires: [{ flag: "onRoad", is: true }],
    goto: "road-talk",
    node: {
      speaker: "tobin",
      text: "The road is a pipe. If you're about to ask whether I agree with the last cut, I don't have to. I have to know which parent you touched.",
    },
  },
  {
    convo: "wren",
    text: "The districts are one line.",
    requires: [{ flag: "onRoad", is: true }],
    goto: "one-line",
    node: {
      speaker: "wren",
      text: "Sinks, ward, pit, hall, citadel. You can still get lost. You cannot honestly call them separate machines anymore.",
    },
  },
  {
    convo: "sera",
    text: "Say what you're afraid I'm becoming.",
    requires: [{ companion: "sera" }],
    goto: "afraid",
    node: {
      speaker: "sera",
      text: "A person who can see a standard and sit in it. I stayed so I would be in the room when you decide whether that's maintenance.",
    },
  },
  {
    convo: "mara",
    text: "The nights, again.",
    requires: [{ companion: "mara" }],
    goto: "nights",
    node: {
      speaker: "mara",
      text: "They're still mine. If the forge is loud, I hear it as a neighbor, not as a cure. Don't cure me to make the walk simpler.",
    },
  },
  {
    convo: "workers",
    text: "A rigger was off the count.",
    requires: [{ flag: "rillSpoken", is: true }],
    goto: "rill-back",
    node: {
      speaker: "hask",
      text: "Rill. Off the grade, not under the slab. I'll put the name back on the board. The crane doesn't get to be the only record.",
    },
  },
  {
    convo: "kael-pre",
    text: "The city is one machine. Your armor is a room of it.",
    requires: [{ flag: "workersKnow", is: true }],
    goto: "one-machine",
    node: {
      speaker: "kael",
      text: "A diagram from a line worker. How embarrassing for a magistrate. The pit and the pump are one sentence, and my shell is not outside that sentence. Read it anyway. I will still be armed.",
    },
  },
  {
    convo: "vane",
    text: "The road is dark because of this floor.",
    requires: [{ flag: "roadDark", is: true }],
    goto: "dark-floor",
    node: {
      speaker: "vane",
      text: "The lamps are a child. If you break the glass, you chose the dark and left the siphon. If the siphon is already cut, the dark is honest and the infirmaries are in it. I will not pick your sentence.",
    },
  },
  {
    convo: "ives",
    text: "The forge's parents are not in this room.",
    requires: [{ flag: "oreSound", is: false }],
    goto: "no-parent",
    node: {
      speaker: "ives",
      text: "Then I don't have stock, and I don't have a speech. Ore is a child of the colossus and the chute. Water is a child of the Sinks. Fix a parent or refuse the stock. Don't ask the bench to invent a quarry.",
    },
  },
  {
    convo: "ives",
    text: "The stock has parents.",
    requires: [{ flag: "gearLive", is: true }],
    goto: "stock-parents",
    close: "None of them is a virtue.",
    node: {
      speaker: "ives",
      text: "Ore, quench, fire. I can make a thing. I can't make the thing innocent. If you wanted innocence, the stock was the thing to refuse.",
    },
  },
  {
    convo: "pell",
    text: "The ward is eating.",
    requires: [{ flag: "foodLive", is: true }],
    goto: "ward-eats",
    close: "A parent is enough.",
    node: {
      speaker: "pell",
      text: "Then the stall has something to sell that isn't a rumor. Don't wait for Nessa to thank a pipe. She'll reopen. That's the thanks.",
    },
  },
  {
    convo: "pell",
    text: "The lung stopped.",
    requires: [{ flag: "bellowsLive", is: false }],
    goto: "lung-quit",
    close: "I can hear it from here.",
    node: {
      speaker: "pell",
      text: "A district is one machine when you can hear it fail from the alley. The grate still drips. The drip is a lie if the lung is down.",
    },
  },
  {
    convo: "nessa",
    text: "Ada has a plate.",
    requires: [{ flag: "foodLive", is: true }],
    goto: "ada-plate",
    close: "A parent, not a sermon.",
    node: {
      speaker: "nessa",
      text: "She eats. I sell. The levy will try to be a third person in the room. I can live with a parent. I will not live with a speech about it.",
    },
  },
  {
    convo: "bram",
    text: "The stone is moving.",
    requires: [{ flag: "stoneMoving", is: true }],
    goto: "stone-moves",
    close: "The road is the parent.",
    node: {
      speaker: "bram",
      text: "Then the cart has a job. Say if you want it held in the ward. Say if you want it uphill. Don't ask my conscience to be the haul.",
    },
  },
  {
    convo: "lark",
    text: "The south walk.",
    requires: [{ flag: "roadBypass", is: true }],
    goto: "south-walk",
    close: "No sign.",
    node: {
      speaker: "lark",
      text: "You found the cut. It stays a cut. I won't put a sign on it. Signs are how a shortcut becomes a toll.",
    },
  },
  {
    convo: "lark",
    text: "The lamps are out.",
    requires: [{ flag: "roadDark", is: true }],
    goto: "lamps-out",
    close: "The south walk doesn't ask.",
    node: {
      speaker: "lark",
      text: "Then the shade on the glass stretch is no longer scenery. The south walk doesn't ask the lamps for permission.",
    },
  },
  {
    convo: "quill",
    text: "The levy has something to write.",
    requires: [{ flag: "levyLive", is: true }],
    goto: "levy-writes",
    close: "The bill is not the parent.",
    node: {
      speaker: "quill",
      text: "A meal arrived and a bill arrived on it. I price what is real. I don't pretend the bill made the meal.",
    },
  },
  {
    convo: "workers",
    text: "Pim came back to the count.",
    requires: [{ flag: "pimCount", is: true }],
    goto: "pim-count",
    close: "Fear is an audit.",
    node: {
      speaker: "hask",
      text: "Fear is a kind of audit. The slab missed, so the fear stood down. I won't call that loyalty, and I won't put it on a plaque.",
    },
  },
  {
    convo: "tobin-after",
    text: "Doss moved off the reed.",
    requires: [{ flag: "dossShift", is: true }],
    goto: "doss-moved",
    close: "Weather, not gossip.",
    node: {
      speaker: "tobin",
      text: "A sleeper doesn't relocate for drama. The weather stopped. That's the whole report.",
    },
  },
  {
    convo: "wren",
    text: "The moth and the child found the same drip.",
    requires: [{ flag: "pipShown", is: true }],
    goto: "same-drip",
    close: "Wings first.",
    node: {
      speaker: "wren",
      text: "I had the grate. I didn't have wings. Next time I'll ask what refuses to cross before I draw the straight line.",
    },
  },
  {
    convo: "mara",
    text: "Nell is sleeping on the flue.",
    requires: [{ flag: "tenementWarm", is: true }],
    goto: "nell-sleeps",
    close: "A night is enough.",
    node: {
      speaker: "mara",
      text: "Good. A night with a parent is still a night. Don't ask her to sing about it. I won't either.",
    },
  },
  {
    convo: "sera",
    text: "The doorway upstairs is a meal.",
    requires: [{ flag: "guardToll", is: true }, { flag: "sarnMet", is: true }],
    goto: "toll-meal",
    close: "Hunger in a doorway.",
    node: {
      speaker: "sera",
      text: "Then it isn't order. It's hunger wearing a door. Feed it, cut it, or walk past it. All three write the ledger. Don't let them rename it first.",
    },
  },
  {
    convo: "nell",
    text: "The flue and the stock are different fires.",
    requires: [{ flag: "gearLive", is: true }, { flag: "tenementWarm", is: true }],
    goto: "two-fires",
    close: "Both can be true.",
    node: {
      speaker: "nell",
      text: "The stock is loud. My blanket is quiet. I don't owe the rifles a thank-you for the night. They drank from the same haul. That's all.",
    },
  },
  {
    convo: "vane",
    text: "The kitchen is still cooking.",
    requires: [{ flag: "sarnMet", is: true }, { flag: "citadelSupplied", is: true }],
    goto: "kitchen-cooks",
    close: "The citadel is not a stomach.",
    node: {
      speaker: "vane",
      text: "Stores arrived. Sarn will not thank the rank for a haul. I won't ask her to. Eating is not a rank, even when the rank eats.",
    },
  },
  {
    convo: "ives",
    text: "The cart never arrived.",
    requires: [{ flag: "cartPinned", is: true }, { flag: "stoneMoving", is: true }],
    goto: "cart-held",
    close: "The pit is not the forge.",
    node: {
      speaker: "ives",
      text: "Stone left the quarry. It is not on my floor. Whatever is holding the road is the parent I don't have. I can still refuse the stock. I can't invent the ore.",
    },
  },
  {
    convo: "ives",
    text: "The cart beat the speech.",
    requires: [{ flag: "cartEase", is: true }, { flag: "stoneMoving", is: true }],
    goto: "cart-early",
    close: "Weight first.",
    node: {
      speaker: "ives",
      text: "It's already in the yard. Don't tell me what it means until I know whether you want it to become a rifle. The arrival is not the permission.",
    },
  },
  {
    convo: "nell",
    text: "The wash is drinking.",
    requires: [{ flag: "washLive", is: true }],
    goto: "wash-drinks",
    close: "A pipe, not a song.",
    node: {
      speaker: "nell",
      text: "There's water that isn't the flue. If the forge went dry for it, I know. I will drink it. I will not thank a rifle for the thirst I didn't have.",
    },
  },
  {
    convo: "drift",
    text: "The glaze was cut.",
    requires: [{ flag: "iceCut", is: true }],
    goto: "glaze-cut",
    close: "The edge is enough.",
    node: {
      speaker: "drift",
      text: "The hollow went cold and the clock might still be turning. I stay on the edge. You billed the middle. I don't have to agree to feel the bill.",
    },
  },
  {
    convo: "drift",
    text: "The span is seated.",
    requires: [{ flag: "iceSpan", is: true }],
    goto: "glaze-span",
    close: "A floor.",
    node: {
      speaker: "drift",
      text: "The middle stopped taking a bite. I still sleep where the weather is. A floor is not a reason to stand in the bowl.",
    },
  },
  {
    convo: "lark",
    text: "Moss pinned the cart.",
    requires: [{ flag: "cartPinned", is: true }],
    goto: "moss-pin",
    close: "The road kept it.",
    node: {
      speaker: "lark",
      text: "Then the high walk is carrying a refusal. I won't call it down. Rust can be hungry with the pit looking busy. That's a true sentence. I just run.",
    },
  },
  {
    convo: "lark",
    text: "The brick yard.",
    requires: [{ flag: "seen:road", is: true }, { missing: "seen:kiln" }],
    goto: "kiln-mouth",
    close: "South of this walk.",
    node: {
      speaker: "lark",
      text: "Before Rust, south of this walk, a kiln is waiting on parents it will not name. Clay is in the yard. Water is not. The stamp is a third parent, and it is a person.",
    },
  },
  {
    convo: "lark",
    text: "The kiln took.",
    requires: [{ flag: "brickLive", is: true }],
    goto: "kiln-took",
    close: "Smoke is a receipt.",
    node: {
      speaker: "lark",
      text: "I can smell the set from the road. If Cress is still standing, the smell has a bill. I run. I don't invoice.",
    },
  },
  {
    convo: "lark",
    text: "The freight table.",
    requires: [{ flag: "seen:road", is: true }, { missing: "seen:switch" }],
    goto: "switch-mouth",
    close: "South of the brick stair.",
    node: {
      speaker: "lark",
      text: "Past the kiln mouth, the road drops into a yard. Hale's plates are slick. Rue invoices whatever the table agrees to pass. I run over it. I don't grease it.",
    },
  },
  {
    convo: "lark",
    text: "The glass stair.",
    requires: [{ flag: "seen:road", is: true }, { missing: "seen:pane" }],
    goto: "pane-mouth",
    close: "North of the high walk.",
    node: {
      speaker: "lark",
      text: "North off this walk, before the ward stair, a glasshouse is waiting on parents it will not name. Sand is in the pit. Heat is not. The stamp is a third parent, and it is a person. Sol runs cullet. I run messages.",
    },
  },
  {
    convo: "bram",
    text: "I read a waybill with your cart on it.",
    requires: [{ flag: "waybillRead", is: true }],
    goto: "waybill",
    close: "The paper is not the cart.",
    node: {
      speaker: "bram",
      text: "Then you already know the table and this cart have been refusing the same load. The paper does not make me send it. A seated road might. A speech will not.",
    },
  },
];

export function extendCampaign(convos: Record<string, Convo>) {
  for (const [id, convo] of Object.entries(CAMPAIGN)) convos[id] = convo;
  for (const late of LATE) {
    const convo = convos[late.convo];
    const start = convo?.nodes.start;
    if (!convo || !start) continue;
    if (start.replies.some((r) => r.goto === late.goto)) continue;
    start.replies.push({ text: late.text, goto: late.goto, requires: late.requires });
    convo.nodes[late.goto] = {
      speaker: late.node.speaker,
      text: late.node.text,
      replies: [end(late.close ?? "That's the room.")],
    };
  }
}
