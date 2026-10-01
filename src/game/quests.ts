import { play } from "./audio";
import { xpForLevel } from "./formulas";
import type { Data, JournalEntry } from "./types";

interface QuestDef {
  id: string;
  title: string;
  open: (d: Data) => boolean;
  met: (d: Data) => boolean;
  waiting: string;
  resolve: (d: Data) => string;
  xp: number;
}

function severed(d: Data, machineId: string, nodeId: string) {
  return Boolean(d.machines[machineId]?.nodes.find((n) => n.id === nodeId)?.severed);
}

const QUESTS: QuestDef[] = [
  {
    id: "dry-ward",
    title: "The dry ward",
    open: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard || d.flags.pumpFate),
    met: (d) =>
      Boolean(d.flags.foodLive) ||
      Boolean(d.flags.plotsRefused) ||
      Boolean(d.flags.pumpFate === "bleed" && d.flags.provisionalStamp) ||
      Boolean(d.flags.bellowsLive === false && d.flags.reedRead),
    waiting: "The lower ward is waiting on a parent. A meal, a refused bed, a stamped wash, or a stopped lung would each be an answer. They are not the same answer.",
    resolve: (d) => {
      if (d.flags.foodLive) return "The plots are drinking. Food has a parent. A levy has the same parent.";
      if (d.flags.plotsRefused) return "The bed was refused. The levy has nothing to invoice. The ward has less to eat.";
      if (d.flags.bellowsLive === false && d.flags.reedRead) return "The lung was stopped. A seated pump can still leave the ward dry.";
      return "Brown water was stamped provisional. The stall can sell it under that name.";
    },
    xp: 12,
  },
  {
    id: "empty-forge",
    title: "The empty forge",
    open: (d) => Boolean(d.flags["seen:quarry"] || d.flags["seen:rust"] || d.flags.seenQuarry),
    met: (d) => Boolean(d.flags.gearLive) || Boolean(d.flags.stockRefused) || severed(d, "chute", "grade"),
    waiting: "The forge can be a child of ore, quench, and fire. It can also be refused. The chute grade is another parent. None of these is the only door.",
    resolve: (d) => {
      if (d.flags.stockRefused) return "The stock was refused. Ore, quench, and fire were left where they were.";
      if (severed(d, "chute", "grade")) return "The chute grade is cut. The pit can still move stone. The forge will not call it ore.";
      return "Stock is live. Ore, quench, and fire are its parents. None of them is a virtue.";
    },
    xp: 12,
  },
  {
    id: "dark-road",
    title: "The dark road",
    open: (d) => Boolean(d.flags.citadelOpen || d.flags.seenCitadel || d.flags.citadelFate),
    met: (d) =>
      Boolean(d.flags.citadelFate) ||
      severed(d, "lamps", "glass") ||
      Boolean(d.flags.roadDark && d.flags["seen:road"]) ||
      Boolean(d.flags.roadBypass),
    waiting: "The stack road is a child of the lamps, and the lamps are a child of the orrery. Glass, power, a walked dark, or a south bypass would each change who uses it.",
    resolve: (d) => {
      if (severed(d, "lamps", "glass")) return "The lamp glass was cut. Power can still be true. The road is dark because the glass is not.";
      if (d.flags.roadBypass) return "The south walk is known. The lamps were left as they were. Travel does not require them.";
      if (d.flags.roadDark && d.flags["seen:road"]) return "The road was walked dark. The lamps had been a child of the orrery.";
      if (d.flags.citadelFate === "sever") return "The citadel's siphon was cut. The road lost that parent.";
      return "The citadel was decided. The road is whatever that decision still feeds.";
    },
    xp: 12,
  },
  {
    id: "line-word",
    title: "The lung, said aloud",
    open: (d) => Boolean(d.flags.reedRead),
    met: (d) => Boolean(d.flags.workersKnow),
    waiting: "The bellows can be named. Whether the quarry line hears the name is a separate choice.",
    resolve: () => "The quarry line has the diagram. Information moved. It did not become a different machine.",
    xp: 12,
  },
  {
    id: "tobin-lung",
    title: "Tobin's lung",
    open: (d) => Boolean(d.actors.tobin?.companion),
    met: (d) => Boolean((d.flags.bellowsLive && d.flags.reedRead) || d.flags.tobinHeardLung),
    waiting: "Tobin is walking. The bellows is still a fact he has not been made to count out loud.",
    resolve: (d) =>
      d.flags.bellowsLive && d.flags.reedRead
        ? "The lung is seated and named. Tobin heard it as maintenance."
        : "The stopped bellows was said to him. He counted it. He did not leave.",
    xp: 12,
  },
  {
    id: "sera-choice",
    title: "Sera's stock",
    open: (d) => Boolean(d.actors.sera?.companion),
    met: (d) => Boolean(d.flags.stockRefused || (d.flags.gearLive && d.flags.seraSawGear) || d.flags.citadelFate),
    waiting: "Sera is watching the forge and the standard. She has not been shown which child you mean.",
    resolve: (d) => {
      if (d.flags.stockRefused) return "She saw the stock refused and the parents left standing.";
      if (d.flags.gearLive && d.flags.seraSawGear) return "She looked at live stock. She disagreed. She stayed.";
      return "The citadel was answered while she was walking. The answer is in the ledger, not in a grade of her.";
    },
    xp: 12,
  },
  {
    id: "wren-walk",
    title: "Wren's line",
    open: (d) => Boolean(d.actors.wren?.companion),
    met: (d) => Boolean(d.flags.workersKnow || d.flags.wrenWalked),
    waiting: "Wren walks with the lines. The quarry has not been made to hear her, unless you already sent the diagram.",
    resolve: (d) =>
      d.flags.workersKnow
        ? "The line heard her diagram. The pit and the pump are one sentence now."
        : "She walked the pit beside you. The diagram was not required for the company.",
    xp: 12,
  },
  {
    id: "ward-child",
    title: "The pump's child",
    open: (d) => Boolean(d.flags.pumpFate),
    met: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard),
    waiting: "The Sinks pump has a child that is not in the Sinks. The lower ward drinks it, or fails to.",
    resolve: () => "Oakhaven was stood in. The cistern did not grow a well. It remained a child of the pump.",
    xp: 12,
  },
  {
    id: "pit-line",
    title: "The pit",
    open: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard),
    met: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry || d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred"),
    waiting: "Stone is still hanging somewhere the ward does not own. The quarry is the next room of this machine, not a new city.",
    resolve: () => "The quarry was stood in. The slab is a fact about a cable, a throat, and whoever was under the boom.",
    xp: 12,
  },
  {
    id: "heat-room",
    title: "Where the stone goes",
    open: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry),
    met: (d) => Boolean(d.flags["seen:rust"]),
    waiting: "If the stone moves, someone downstream is warm or not warm. The Rust Districts are that room.",
    resolve: () => "Rust was stood in. Heat there is a child of haul, hearth, and whoever was allowed to drink it.",
    xp: 12,
  },
  {
    id: "rank-floor",
    title: "The rank floor",
    open: (d) => Boolean(d.flags["seen:rust"] || d.flags.guildBriefed || d.flags.citadelOpen),
    met: (d) => Boolean(d.flags["seen:citadel"] || d.flags.seenCitadel || d.flags.citadelFate),
    waiting: "The guild named a crucible. It is not a rumor until you have stood where the siphon is.",
    resolve: () => "The citadel was reached. The siphon, the lifts, and the rank engine are one graph with more than one answer.",
    xp: 12,
  },
  {
    id: "no-baseline",
    title: "No correct baseline",
    open: (d) => Boolean(d.flags.citadelFate || d.flags.spireOpen),
    met: (d) => Boolean(d.flags["seen:spire"] || d.flags.ending),
    waiting: "Something under the old works has no recoverable baseline. The Spire is that question, not a bigger door.",
    resolve: () => "The Spire was stood in. The question is not which baseline is correct. It is whether a correct one is yours to issue.",
    xp: 16,
  },
  {
    id: "lost-rigger",
    title: "The lost rigger",
    open: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry),
    met: (d) => Boolean(d.flags.rillSpoken || d.flags.workerHurt || d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred"),
    waiting: "Someone is off the count under the boom. A name, a clear drop, or a scar would each be an answer. They are not the same answer.",
    resolve: (d) => {
      if (d.flags.rillSpoken && d.flags.quarryStone !== "scarred" && !d.flags.workerHurt) {
        return "Rill was off the grade. The boom did not have to be the whole sentence. Hask can put the name back.";
      }
      if (d.flags.quarryStone === "clear" && !d.flags.workerHurt) return "The slab came down clear. Whoever was still under the boom was not the one the stone took.";
      return "The stone took a rigger. The name stays on the crane. Leaving it unsaid does not put the body back.";
    },
    xp: 12,
  },
  {
    id: "reed-moth",
    title: "The reed moth",
    open: (d) => Boolean(d.flags.cinderSeen || d.actors.cinder?.companion),
    met: (d) => Boolean(d.flags.cinderFed || d.actors.cinder?.companion),
    waiting: "Something nests on the bellows reed. It eats. It is not a valve, and it is not a rank.",
    resolve: () => "Scrap was left where the moth could take it. Hunger was a parent. She counted the gift and did not perform gratitude.",
    xp: 8,
  },
  {
    id: "moth-chooses",
    title: "The choosing",
    open: (d) => Boolean(d.flags.cinderFed),
    met: (d) => Boolean(d.actors.cinder?.companion),
    waiting: "The moth has eaten. She has not stepped onto a shadow. The choosing is hers.",
    resolve: (d) =>
      d.flags.bellowsLive === false
        ? "She chose a shadow while the lung was stopped. She is restless. She came anyway."
        : "She stepped onto a shadow. The company was not assigned.",
    xp: 10,
  },
  {
    id: "moth-return",
    title: "The second choosing",
    open: (d) => Boolean(d.flags.cinderLeft || d.flags.cinderBack),
    met: (d) => Boolean(d.flags.cinderBack && d.actors.cinder?.companion),
    waiting: "She left the shadow. A seated reed is weather, not a command. The second choosing is still hers.",
    resolve: () => "The reed was breathing again. She stepped back onto the shadow. Nobody assigned it.",
    xp: 10,
  },
  {
    id: "alley-child",
    title: "The cut that was a bed",
    open: (d) => Boolean((d.flags.ashAccess && (d.flags["seen:haven"] || d.flags.seenWard)) || d.flags.pipHome || d.flags.pipShown),
    met: (d) => Boolean(d.flags.pipHome || d.flags.pipShown || (d.flags.foodLive && d.flags["seen:haven"])),
    waiting: "Someone is sleeping in the service cut because the ward's meal has no parent. Seating the bed, refusing it, or listening to what a moth avoids would each be a different fact.",
    resolve: (d) => {
      if (d.flags.pipHome) return "The plots drank. The child left the cut. The wall went back to being a wall.";
      if (d.flags.pipShown) return "Pip followed the moth along a drip. The route was a living refusal, not a door you unlocked.";
      return "The ward was stood in while the plots had a parent. The cut did not have to stay a bed.";
    },
    xp: 8,
  },
  {
    id: "waystation",
    title: "The seized brake",
    open: (d) => Boolean(d.flags["seen:road"] || d.flags.onRoad),
    met: (d) => Boolean(d.flags.cartEase || d.flags.cartPinned),
    waiting: "A cart is heavier than its brake. Easing it sends the weight on. Pinning it keeps the weight, and the forge will meet the absence.",
    resolve: (d) =>
      d.flags.cartPinned
        ? "The load stayed pinned. Stone can leave the pit and still not become ore."
        : "The brake was eased. The cart did not wait for a speech.",
    xp: 10,
  },
  {
    id: "glaze",
    title: "The glaze stake",
    open: (d) => Boolean(d.flags.tundraWalked || d.flags["seen:tundra"]),
    met: (d) => Boolean(d.flags.iceSpan || d.flags.iceCut),
    waiting: "The middle of the ice is a bill. Seating the span stops the bill. Cutting it makes the hollow cold even if a clock elsewhere is still sending.",
    resolve: (d) =>
      d.flags.iceCut
        ? "The span was cut. The hollow went cold. The ice kept a harder bill."
        : "The span was seated. The middle of the ice stopped billing the walk.",
    xp: 10,
  },
  {
    id: "tenement-wash",
    title: "The tenement wash",
    open: (d) => Boolean(d.flags["seen:rust"]),
    met: (d) => Boolean(d.flags.washChosen),
    waiting: "A seized valve sits between the gallery and two children: the sleepers, and the forge. Sending the drink one way dries the other. Sharing costs more and still needs a parent.",
    resolve: (d) => {
      if (d.flags.washSpill) return "The quench went to the sleepers. The forge was the child that went dry.";
      if (d.flags.washShared) return "The wash was shared. Both drank only while the gallery had something to send.";
      return "The quench was sent back toward the forge. The sleeper pipe went dry.";
    },
    xp: 10,
  },
  {
    id: "costume-gauge",
    title: "The costume gauge",
    open: (d) => Boolean(d.flags.gaugeSeen),
    met: (d) => Boolean(d.flags.gaugeRead || d.flags.gaugeCut),
    waiting: "A gauge in the west pocket looks dead. The pocket is not. The face may not be the parent.",
    resolve: (d) =>
      d.flags.gaugeCut
        ? "The real feed was cut. The district pump was not that parent. A drowned servo answered the pocket."
        : "The gauge face was a costume. The pocket feed behind it was holding.",
    xp: 10,
  },
  {
    id: "ash-cup",
    title: "The alley cup",
    open: (d) => Boolean(d.flags.stillSeen),
    met: (d) => Boolean(d.flags.stillBroken || d.flags.stillLicensed),
    waiting: "While the ward is dry, a still in the service cut is drinking the difference. Break it, license it, or leave it.",
    resolve: (d) =>
      d.flags.stillLicensed
        ? "The trickle was written down. It stayed a cup. The alley had a parent that was not a raid."
        : "The still was broken. The cup went. The clinic kept whatever parent it had.",
    xp: 10,
  },
  {
    id: "night-winch",
    title: "The night winch",
    open: (d) => Boolean(d.flags.winchSeen),
    met: (d) => Boolean(d.flags.crewStood || d.flags.crewFled || d.flags.winchCut),
    waiting: "A crew is under a winch that is not the crane. A live throat is a parent they can hear. A dead throat is the reason they fight.",
    resolve: (d) => {
      if (d.flags.crewStood) return "The winch was braced. The crew stood down because the colossus was still breathing.";
      if (d.flags.crewFled) return "The winch was cut. The crew left. They would not stand under a live throat.";
      return "The winch was cut after the throat had stopped. The crew answered.";
    },
    xp: 12,
  },
  {
    id: "one-night",
    title: "One night in the ward",
    open: (d) => Boolean(d.flags.bufferSeen),
    met: (d) => Boolean(d.flags.citadelFate),
    waiting: "A cell under the ranking floor can keep one infirmary, if it is charged while the siphon is still sending.",
    resolve: (d) =>
      d.flags.bufferHeld
        ? "The siphon was cut. One ward kept the night. The rest of the dark was not spared."
        : d.flags.bufferCharged
          ? "The cell was charged. The crucible was answered another way, and the cell was not asked."
          : "The crucible was answered. The buffer cell had been empty.",
    xp: 12,
  },
  {
    id: "kiln-set",
    title: "The set",
    open: (d) => Boolean(d.flags["seen:kiln"]),
    met: (d) => Boolean(d.flags.brickLive || d.flags.kilnRefused),
    waiting:
      "The kiln can set brick if clay, a bed, and either gallery water or a field-dry are all true. Seating the flue is not the water. Borrowing Rust heat is not the clay. Refusing the yard is also an answer.",
    resolve: (d) => {
      if (d.flags.kilnRefused) return "The yard was refused. The levy has nothing to invoice. The houses have nothing to hold.";
      if (d.flags.fieldDry && !d.flags.quenchLive) return "The set took a field-dry. The gallery did not have to be the parent.";
      if (d.flags.kilnBorrowed) return "The bed is drinking Rust heat. The local flue did not have to be the whole sentence.";
      return "The set is holding. Clay was local. Something else had to parent the water or the heat.";
    },
    xp: 14,
  },
  {
    id: "kiln-stamp",
    title: "The stamp",
    open: (d) => Boolean(d.flags.brickLive || d.flags.kilnLevy || d.flags.stampCut || d.flags.kilnLicensed),
    met: (d) => Boolean(d.flags.kilnLicensed || d.flags.stampCut || (d.flags.kilnRefused && d.flags["seen:kiln"])),
    waiting: "Brick that stands up can be licensed, cut free of the stamp, or never made. A quiet sale is a fourth sentence and it does not close the levy.",
    resolve: (d) => {
      if (d.flags.kilnRefused && !d.flags.brickLive) return "There is no brick. The stamp has nothing to ride.";
      if (d.flags.stampCut) return "The stamp is a hole. The levy died with it. Cress did not agree to be a hole.";
      return "The stamp was licensed. The board can sell. The levy stayed on the same pipe.";
    },
    xp: 12,
  },
  {
    id: "kiln-nest",
    title: "The nested flue",
    open: (d) => Boolean(d.flags.kilnTold || d.flags.kilnCellar || d.flags.glassLifted),
    met: (d) => Boolean(d.flags.glassLifted || d.flags.glassSmashed),
    waiting: "Under the houses, a glass is parenting a nest. It can be read and lifted, or smashed. Those are not the same theft.",
    resolve: (d) =>
      d.flags.glassSmashed
        ? "The glass was smashed. The mite had to stand up because its parent was taken ugly."
        : "The glass was lifted after it was read. The nest stayed a nest.",
    xp: 10,
  },
  {
    id: "switch-floor",
    title: "The slick plates",
    open: (d) => Boolean(d.flags["seen:switch"]),
    met: (d) => Boolean(d.flags.switchGreased),
    waiting:
      "The yard plates bill a step. Boots keep your feet and do not keep Wick's. Grease wants scrap on the axle. Jamming the table is a different parent and does not make a shed.",
    resolve: () => "The axle was greased. The shed is a floor. The haul, if it is still moving, was not the thing that changed.",
    xp: 12,
  },
  {
    id: "switch-haul",
    title: "The table",
    open: (d) => Boolean(d.flags["seen:switch"]),
    met: (d) => Boolean(d.flags.switchJam || d.flags.switchShunt || d.flags.switchLicensed || d.flags.switchCut),
    waiting:
      "The table can keep passing weight on Rue's books, be jammed so the citadel loses this parent, be shunted off the books, or be licensed or cut. Those are not the same haul.",
    resolve: (d) => {
      if (d.flags.switchJam && !d.flags.switchShunt) return "The table was jammed. A busy pit stopped being a parent of the citadel.";
      if (d.flags.switchShunt) return "A shunt is carrying the haul off the books. The weight still leaves.";
      if (d.flags.switchCut) return "The yard stamp is a hole. A haul can leave without that bill.";
      return "The stamp was licensed. The bill stayed on any haul the books can see.";
    },
    xp: 14,
  },
  {
    id: "switch-bill",
    title: "The held waybill",
    open: (d) => Boolean(d.flags.switchTold || d.flags.switchBay || d.flags.waybillRead),
    met: (d) => Boolean(d.flags.waybillRead),
    waiting: "Under the office, a paper parents a nest. It can be read and lifted, or smashed. It names a cart that was held.",
    resolve: (d) =>
      d.flags.waybillSmashed
        ? "The crate was smashed. The rat had to stand up. The paper still names Bram's cart and this table as one refusal."
        : "The waybill was read. Bram's held cart and the Switch table are the same sentence.",
    xp: 10,
  },
  {
    id: "pane-melt",
    title: "The melt",
    open: (d) => Boolean(d.flags["seen:pane"] || d.flags.solCullet),
    met: (d) => Boolean(d.flags.paneCharge || d.flags.paneRefused),
    waiting:
      "The glasshouse can melt clear if sand or cullet, and a bed, are both true. The bed is a local flue or a kiln that is actually hot. Spilling the pit is not the end of it. Refusing the house is also an answer.",
    resolve: (d) => {
      if (d.flags.paneRefused) return "The house was refused. The levy has nothing to invoice. The glass has nothing to hold.";
      if (d.flags.paneCullet && d.flags.paneSpilled) return "The melt took cullet. The pit did not have to stay the parent.";
      if (d.flags.paneBorrowed) return "The bed is drinking a kiln. The local flue did not have to be the whole sentence.";
      return "The melt is holding. Sand was local. Heat had to be seated or borrowed.";
    },
    xp: 14,
  },
  {
    id: "pane-stamp",
    title: "The glass stamp",
    open: (d) => Boolean(d.flags.paneCharge || d.flags.paneLevy || d.flags.paneCut || d.flags.paneLicensed),
    met: (d) => Boolean(d.flags.paneLicensed || d.flags.paneCut || (d.flags.paneRefused && d.flags["seen:pane"])),
    waiting: "A clear melt can be licensed, cut free of the stamp, or never made. A quiet sale is a third sentence and it does not close the levy.",
    resolve: (d) => {
      if (d.flags.paneRefused && !d.flags.paneCharge) return "There is no melt. The stamp has nothing to ride.";
      if (d.flags.paneCut) return "The stamp is a hole. The levy died with it. Ness did not agree to be a hole.";
      return "The stamp was licensed. The bench can sell. The levy stayed on the same pipe.";
    },
    xp: 12,
  },
  {
    id: "pane-lens",
    title: "The anneal lens",
    open: (d) => Boolean(d.flags.paneTold || d.flags.paneVault || d.flags.annealRead || d.flags.lensBought),
    met: (d) => Boolean(d.flags.annealRead || d.flags.annealSmashed || d.flags.lensBought),
    waiting:
      "A lens that names a quiet parent can come off the bench, once the bench is allowed to sell, or out of the vault. The vault can be given, picked, or smashed. Those are not the same taking.",
    resolve: (d) =>
      d.flags.annealSmashed
        ? "The anneal was smashed. The moth had to stand up because its parent was taken ugly. The lens still names a seam."
        : d.flags.lensBought && !d.flags.annealRead
          ? "The lens was bought. The vault did not have to be the parent."
          : "The lens was read and lifted. The nest stayed a nest.",
    xp: 10,
  },
];

function write(d: Data, entry: JournalEntry) {
  const hit = d.journal.find((j) => j.id === entry.id);
  if (!hit) {
    d.journal.push(entry);
    return;
  }
  if (hit.status === entry.status && hit.text === entry.text) return;
  hit.title = entry.title;
  hit.text = entry.text;
  hit.status = entry.status;
}

function grant(d: Data, n: number) {
  if (n <= 0) return;
  d.xp += n;
  while (d.level < 8 && d.xp >= xpForLevel(d.level + 1)) {
    d.level += 1;
    d.skillPoints += 4;
    d.perkPoints = (d.perkPoints ?? 0) + 1;
    d.player.maxHp += 8;
    d.player.hp = Math.min(d.player.maxHp, d.player.hp + 8);
    d.pendingLevel = true;
    d.log.unshift(`Comprehension deepens. You are level ${d.level}.`);
    if (d.log.length > 40) d.log.length = 40;
    play("level");
  }
}

function silas(d: Data) {
  const fin = Boolean(d.flags["seen:spire"] || d.flags.ending);
  const late = Boolean(d.flags.citadelFate || d.flags.spireOpen);
  const mid = Boolean(
    d.flags.pumpFate &&
      (d.flags.foodLive || d.flags.plotsRefused || d.flags.gearLive || d.flags.stockRefused || d.flags["seen:quarry"] || d.flags["seen:rust"]),
  );
  const cost = d.flags.foodLive
    ? " The ward eats off the same pipe that invoices a levy."
    : d.flags.plotsRefused
      ? " The bed was refused. Hunger is what that refusal cost."
      : d.flags.bellowsLive === false
        ? " A stopped lung can leave a seated pump dry."
        : "";
  const text = fin
    ? `The Spire has no baseline you can issue and still tell the truth. The question is who is allowed to decide what fixed means.${cost}`
    : late
      ? `Someone already decided the baseline. Restoring it would invent a shape. Leaving the holes would leave their names in place.${cost}`
      : mid
        ? `Repairing one thing can break another. The meal, the bill, the forge, and the road are rooms of one machine.${cost}`
        : "You repair what is broken. The Sinks are the first sentence, not the whole machine.";
  write(d, { id: "silas-now", title: "What you are doing", text, status: "open" });
}

/** Listens to flags the city graph already wrote. An unexpected fix still counts. */
export function reconcileQuests(d: Data) {
  if (d.flags.workersKnow && d.flags["seen:rust"] && !d.flags.ivesHeardLung) d.flags.ivesHeardLung = true;
  silas(d);
  for (const q of QUESTS) {
    const key = `quest:${q.id}`;
    const prev = d.flags[key];
    if (prev === "done") continue;
    const met = q.met(d);
    const open = q.open(d);
    if (!met && !open) continue;
    if (met) {
      d.flags[key] = "done";
      write(d, { id: q.id, title: q.title, text: q.resolve(d), status: "done" });
      const reward = `questReward:${q.id}`;
      if (!d.flags[reward]) {
        d.flags[reward] = true;
        grant(d, q.xp);
      }
      continue;
    }
    if (prev !== "open") {
      d.flags[key] = "open";
      write(d, { id: q.id, title: q.title, text: q.waiting, status: "open" });
    }
  }
}
