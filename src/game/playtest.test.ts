// Regressions found by the 2026-10-15 headless browser playtest (docs/QA-COMPLETION.md).
// They drive the real store, the same calls the HUD buttons, canvas taps, and arrow keys make.
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;

const { useGame, visibleReplies, crossesCheckpoint, leaveIndex } = await import("./store.ts");
const { MOUTHS, mouthAt, usableMouths } = await import("./maps.ts");
const { regionOpen } = await import("./logic.ts");
// The plate camera loads a painted backdrop; a stub image with the real plate's size is enough to lay it out.
const PLATE_SIZE: Record<string, [number, number]> = { sinks: [1792, 1008], road: [1408, 1408] };
(globalThis as unknown as { Image: unknown }).Image = class {
  complete = true;
  naturalWidth = 1408;
  naturalHeight = 1408;
  set src(v: string) {
    const hit = Object.entries(PLATE_SIZE).find(([k]) => v.includes(k === "sinks" ? "sinks" : k));
    if (hit) [this.naturalWidth, this.naturalHeight] = hit[1];
  }
};
const stage = await import("../components/mend/stage.ts");

const G = () => useGame.getState();
const D = () => G().data;

function pick(re: RegExp) {
  const replies = visibleReplies(D());
  const i = replies.findIndex((r) => re.test(r.text));
  assert.ok(i >= 0, `no reply ${re} in ${replies.map((r) => r.text).join(" / ")}`);
  G().choose(i);
}

function walkOut(limit = 200) {
  let n = 0;
  while (D().path.length && !D().dialogue && n++ < limit) G().step();
}

function freshLedger() {
  mem.clear();
  G().openCreate();
  G().recommend();
  G().startNew();
  pick(/show me the pump/);
  pick(/audit it/);
}

describe("playtest 2026-10-15", () => {
  beforeEach(() => freshLedger());

  it("Audit from the shop walks to the pump Tobin named, not into the guard line", () => {
    assert.equal(D().mapId, "sinks");
    assert.equal(D().dialogue, null);
    G().auditNearest();
    assert.equal(D().intent?.type, "audit");
    assert.equal(D().intent && "id" in D().intent! ? (D().intent as { id: string }).id : "", "pump");
    assert.equal(crossesCheckpoint(D(), D().path), false);
    walkOut();
    assert.equal(D().dialogue, null, "the walk must not stop at the checkpoint");
    assert.ok(D().player.y < 12);
    assert.equal(D().panel, "audit");
    assert.equal(D().audit?.id, "pump");
  });

  it("crossesCheckpoint only fences the plate before the checkpoint is answered", () => {
    assert.equal(crossesCheckpoint(D(), [{ x: 14, y: 12 }]), true);
    assert.equal(crossesCheckpoint(D(), [{ x: 14, y: 11 }]), false);
    useGame.setState((s) => ({ data: { ...s.data, flags: { ...s.data.flags, checkpointSpoke: true } } }));
    assert.equal(crossesCheckpoint(D(), [{ x: 14, y: 12 }]), false);
  });

  it("clicking or arrowing onto an adjacent mouth walks through it instead of opening the Map", () => {
    useGame.setState((s) => ({
      data: {
        ...s.data,
        flags: { ...s.data.flags, checkpointSpoke: true },
        player: { ...s.data.player, x: 24, y: 18 },
      },
    }));
    G().clickTile(25, 18);
    assert.notEqual(D().panel, "map");
    walkOut();
    assert.equal(D().mapId, "road");
    assert.equal(D().panel, "none");
    // and back again from the road's Sinks mouth, one step at a time
    const { x, y } = D().player;
    assert.deepEqual({ x, y }, { x: 5, y: 5 });
  });

  it("the header pin lets go of a pump job once the ledger closes it", () => {
    assert.equal(D().pinned, "The broken pump");
    const real = Math.random;
    Math.random = () => 0.01; // the valve holds
    try {
      G().clickTile(13, 7);
      walkOut();
      G().auditNearest();
      assert.equal(D().audit?.id, "pump");
      G().selectNode("valve");
      G().mend();
    } finally {
      Math.random = real;
    }
    assert.ok(D().flags.pumpFate, "the pump is answered");
    assert.notEqual(D().journal.find((j) => j.id === "pump")?.status, "open");
    assert.notEqual(D().pinned, "The broken pump");
  });

  it("Esc leaves a talk only through a plain leave line, never through a real choice", () => {
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "tobin-intro", node: "start" } } }));
    assert.equal(leaveIndex(D()), -1, "Tobin's opening has no leave line");
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "guard-line", node: "start" } } }));
    const guard = leaveIndex(D());
    if (guard >= 0) {
      const r = visibleReplies(D())[guard];
      assert.ok(r.end && !r.check && !(r.effects && r.effects.length), "only a plain leave");
    }
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "tobin-after", node: "start" } } }));
    const i = leaveIndex(D());
    assert.ok(i >= 0, "Tobin's after-talk can be left");
    G().choose(i);
    assert.equal(D().dialogue, null);
  });

  it("after Moll's Engineering talk-past (and filing the level), a tap toward the Stack mouth walks onto the road", () => {
    useGame.setState((s) => ({ data: { ...s.data, player: { ...s.data.player, x: 14, y: 10 } } }));
    G().clickTile(14, 12);
    walkOut();
    assert.equal(D().dialogue?.convo, "guard-line");
    const real = Math.random;
    Math.random = () => 0.01; // the regulator line lands
    try {
      pick(/pressure regulator/);
    } finally {
      Math.random = real;
    }
    assert.equal(D().dialogue?.node, "pass");
    assert.ok(D().flags.checkpointSpoke);
    const leave = leaveIndex(D());
    assert.ok(leave >= 0, "Moll's 'I'm already walking.' is a plain leave line Esc can take");
    G().choose(leave);
    assert.equal(D().dialogue, null);
    if (D().pendingLevel) G().ackLevel();
    assert.equal(D().panel, "none");
    G().clickTile(25, 18);
    assert.ok(D().path.length > 0, "the tap after the talk-past must move Silas");
    walkOut();
    assert.equal(D().mapId, "road");
  });

  it("Moll's opening checkpoint line has no Esc leave on purpose: every way off it is a choice", () => {
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "guard-line", node: "start" } } }));
    assert.equal(leaveIndex(D()), -1, "'Fine.' walks you back north, so Esc does not pick it for you");
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "guard-line", node: "no" } } }));
    assert.equal(leaveIndex(D()), -1);
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "guard-line", node: "pass" } } }));
    assert.ok(leaveIndex(D()) >= 0, "after the talk-past, Esc leaves");
  });

  it("every mouth carries a board label; the Sinks shows its Stack mouth and the road its Ward stair", () => {
    assert.ok(MOUTHS.every((m) => typeof m.label === "string" && m.label.length > 0), "every mouth has a label");
    assert.equal(mouthAt("sinks", 25, 18)?.label, "Stack mouth");
    assert.equal(mouthAt("road", 20, 1)?.label, "Ward stair");
    assert.equal(mouthAt("road", 16, 11)?.label, "Brick stair");
    assert.equal(mouthAt("road", 22, 14)?.label, "Yard stair");
    assert.equal(mouthAt("road", 27, 1)?.label, "Glass stair");
    // A labeled stair names the same thing its shut line does.
    for (const m of MOUTHS) {
      const word = m.label.toLowerCase().split(" ").pop()!;
      if (/stair|mouth/.test(word)) assert.ok(m.deny.toLowerCase().includes(word) || m.deny.toLowerCase().includes("mouth"), `${m.map} ${m.label} vs "${m.deny}"`);
    }
    const sinks = usableMouths("sinks", (need) => regionOpen(D(), need)).map((m) => m.label);
    assert.deepEqual(sinks, ["Stack mouth"]);
    const road = usableMouths("road", (need) => regionOpen(D(), need)).map((m) => m.label);
    for (const want of ["Sinks mouth", "Ward stair", "Brick stair", "Yard stair", "Glass stair"]) assert.ok(road.includes(want), `road shows ${want}: ${road}`);
    for (const sealed of ["Quarry road", "Rust cut", "Tundra walk", "Spire mouth"]) assert.ok(!road.includes(sealed), `${sealed} stays sealed on a fresh ledger`);
  });

  it("the plate camera keeps Silas on the canvas south of the checkpoint, and the Stack mouth comes into view", () => {
    const ctx = { drawImage() {} } as unknown as CanvasRenderingContext2D;
    // 440x250 is the world frame in a 1024x640 window; 440x323 in 1280x713; 440x510 in 440x900.
    for (const [w, h] of [[440, 250], [440, 323], [440, 510]]) {
      const route = [[14, 12], [18, 12], [18, 16], [22, 16], [22, 18], [24, 18]];
      for (const [x, y] of route) {
        stage.layoutStage(ctx, w, h, x, y, "sinks");
        const s = stage.stageNow();
        assert.ok(s.plate, "the plate is drawn");
        assert.ok(s.feet.sx >= 0 && s.feet.sx <= w && s.feet.sy >= 0 && s.feet.sy <= h * 0.78, `${w}x${h} at ${x},${y}: feet ${Math.round(s.feet.sx)},${Math.round(s.feet.sy)} must stay on the canvas`);
        assert.equal(stage.presence(s.feet.sx, s.feet.sy), 1, `${w}x${h} at ${x},${y}: Silas is fully drawn`);
      }
      const mouth = stage.projectTile(w, h, 24, 18, 25, 18, 1, 64, 32);
      assert.ok(stage.onDeck(mouth.sx, mouth.sy), `${w}x${h}: the Stack mouth beside Silas is on deck (${Math.round(mouth.sx)},${Math.round(mouth.sy)})`);
    }
  });

  it("the plate camera keeps the Ward stair on deck when Silas walks the Stack Road east and north (hand re-playtest on 51790a9)", () => {
    const ctx = { drawImage() {} } as unknown as CanvasRenderingContext2D;
    const ward = MOUTHS.find((m) => m.map === "road" && m.label === "Ward stair")!;
    assert.deepEqual([ward.x, ward.y], [20, 1]);
    for (const [w, h] of [[440, 250], [440, 323], [440, 510]]) {
      // Arrive from the Sinks at 5,5; detour down the x=6 stair to beside the Brick stair (16,11) on the lower
      // gantry, back up, then east along the upper gantry and north to beside the Ward stair.
      const route = [[5, 5], [6, 8], [10, 10], [16, 10], [6, 9], [6, 6], [8, 5], [12, 5], [16, 5], [18, 5], [20, 5], [20, 4], [20, 3], [20, 2]];
      for (const [x, y] of route) {
        stage.layoutStage(ctx, w, h, x, y, "road");
        const s = stage.stageNow();
        assert.ok(s.plate, "the plate is drawn");
        const { DECK } = stage;
        assert.ok(s.feet.sx >= w * DECK.left && s.feet.sx <= w * DECK.right && s.feet.sy >= h * DECK.top && s.feet.sy <= h * DECK.bottom, `${w}x${h} at ${x},${y}: feet ${Math.round(s.feet.sx)},${Math.round(s.feet.sy)} stay inside the deck band`);
        assert.ok(s.feet.sx < w * DECK.right - 1, `${w}x${h} at ${x},${y}: Silas is not pinned to the right edge (${Math.round(s.feet.sx)})`);
        for (const [nx, ny, what] of [[x, y - 1, "step north"], [x + 1, y, "step east"], [x, y - 2, "two north"], [x + 2, y, "two east"]] as const) {
          const p = stage.projectTile(w, h, x, y, nx, ny, 1, 64, 32);
          assert.ok(stage.presence(p.sx, p.sy) > 0.25, `${w}x${h} at ${x},${y}: the ${what} tile ${nx},${ny} is tappable (${Math.round(p.sx)},${Math.round(p.sy)})`);
        }
        if (y <= 5 && x >= 16) {
          const p = stage.projectTile(w, h, x, y, ward.x, ward.y, 1, 64, 32);
          assert.ok(stage.onDeck(p.sx, p.sy), `${w}x${h} at ${x},${y}: the Ward stair is on deck (${Math.round(p.sx)},${Math.round(p.sy)})`);
        }
      }
      // The old feet (carrying the clamp, held at DECK.right) put the Ward stair off the canvas from 20,5.
      stage.layoutStage(ctx, w, h, 20, 5, "road");
      const s = stage.stageNow();
      const oldSx = w * stage.DECK.right + (ward.x - 20 - (ward.y - 5)) * s.step.x;
      assert.ok(stage.presence(oldSx, s.feet.sy + (ward.x - 20 + ward.y - 5) * s.step.y) < 0.25, `${w}x${h}: sanity, the edge-pinned camera loses the Ward stair`);
    }
  });

  it("the plate camera is unchanged where the backdrop still has picture: the band only catches feet leaving the canvas", () => {
    const { keepOnDeck, DECK } = stage;
    const w = 440;
    const h = 510;
    const inside = { sx: w * 0.46, sy: h * 0.58 };
    assert.deepEqual(keepOnDeck(inside.sx, inside.sy, w, h), inside, "feet inside the band are left alone");
    assert.deepEqual(keepOnDeck(w * 0.5, h * 1.4, w, h), { sx: w * 0.5, sy: h * DECK.bottom }, "feet pushed off the bottom are held at the band");
    assert.deepEqual(keepOnDeck(-40, h * 0.5, w, h), { sx: w * DECK.left, sy: h * 0.5 });
    const ctx = { drawImage() {} } as unknown as CanvasRenderingContext2D;
    stage.layoutStage(ctx, w, h, 3, 3, "sinks");
    const s = stage.stageNow();
    assert.ok(s.feet.sy > h * DECK.top && s.feet.sy < h * DECK.bottom && s.feet.sx > w * DECK.left && s.feet.sx < w * DECK.right, "the shop entry is inside the band, so it frames as before");
  });
});
