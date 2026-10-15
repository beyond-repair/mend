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
});
