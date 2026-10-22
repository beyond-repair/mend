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

const { useGame, visibleReplies, crossesCheckpoint, leaveIndex, hasStoredLedger } = await import("./store.ts");
const { MAPS, MOUTHS, mouthAt, usableMouths, REGIONS, LOCKED_DOORS, tileAt, WALKABLE } = await import("./maps.ts");
const { regionOpen, openAudit, reconcileWorld, depart, pathTo, checkVision, dist, startCombat, weaponsDark, freezeIntents, boardIntents, unmendNode } = await import("./logic.ts");
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
const { HUD_LABELS, HUD_ART_HAS_WORD, hudShowsCaption, MENU_QUIT_LABEL } = await import("../components/mend/hud.ts");

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

  it("Esc takes Doss's sole leave line even though it notes a met-flag, and still refuses sole fights and travel", () => {
    const doss = D().actors.doss;
    assert.ok(doss?.alive && doss.mapId === "sinks", "Doss sleeps on the Sinks plate");
    useGame.setState((s) => ({ data: { ...s.data, player: { ...s.data.player, x: doss.x - 1, y: doss.y } } }));
    G().clickTile(doss.x, doss.y); // the tap/bump that opens his talk
    walkOut();
    assert.equal(D().dialogue?.convo, "doss", "tapping Doss from beside him opens his talk");
    const replies = visibleReplies(D());
    assert.equal(replies.length, 1, "on a fresh ledger his only line is the leave");
    assert.match(replies[0].text, /Sleep\. I won't move your weather\./);
    const leave = leaveIndex(D());
    assert.equal(leave, 0, "Esc must take the only way out instead of soft-locking the walk keys");
    G().choose(leave); // what Esc does in Game.tsx
    assert.equal(D().dialogue, null);
    assert.equal(D().flags.dossMet, true, "the leave still notes that Silas met him");
    // Once a real choice joins it, the flagged leave is no longer Esc's to take.
    useGame.setState((s) => ({ data: { ...s.data, flags: { ...s.data.flags, bellowsLive: false }, dialogue: { convo: "doss", node: "start" } } }));
    assert.ok(visibleReplies(D()).length > 1);
    assert.equal(leaveIndex(D()), -1, "with 'The lung stopped.' on the board Esc stays out of it");
    // A sole line that fights or travels is a choice, not a leave.
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "guard-line", node: "fight" } } }));
    assert.equal(leaveIndex(D()), -1, "'Read them.' starts a fight; Esc must not");
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "road-after", node: "start" } } }));
    assert.equal(leaveIndex(D()), -1, "'Continue.' travels; Esc must not");
  });

  it("every follower talk on a fresh ledger has an Esc way out at its opening", () => {
    for (const convo of ["tobin-after", "sera", "wren", "mara", "cinder"]) {
      useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo, node: "start" } } }));
      const i = leaveIndex(D());
      assert.ok(i >= 0, `${convo} opening needs an Esc leave so a corridor bump cannot soft-lock`);
      const r = visibleReplies(D())[i];
      assert.ok(r.end && !r.goto && !r.jump && !r.check, `${convo}: Esc only takes a plain leave`);
    }
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
    assert.equal(mouthAt("road", 16, 11)?.nearOnly, true, "Brick stair is near-only so it does not pull the eye off the Ward path");
    assert.equal(mouthAt("road", 20, 1)?.nearOnly, undefined, "Ward stair stays a landmark brass diamond");
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
          // Hand re-play on 2fc0d6f: hard-centred feet put the Ward diamond at the right rim (~0.93w) until close.
          assert.ok(p.sx < w * 0.88, `${w}x${h} at ${x},${y}: Ward stair is not clipped at the right edge (${Math.round(p.sx)} / ${w})`);
          assert.ok(stage.mouthPresence(p.sx, p.sy) >= 0.5, `${w}x${h} at ${x},${y}: Ward mouth fade stays readable (${stage.mouthPresence(p.sx, p.sy).toFixed(2)})`);
        }
      }
      // The old feet (carrying the clamp, held at DECK.right) put the Ward stair off the canvas from 20,5.
      stage.layoutStage(ctx, w, h, 20, 5, "road");
      const s = stage.stageNow();
      const oldSx = w * stage.DECK.right + (ward.x - 20 - (ward.y - 5)) * s.step.x;
      assert.ok(stage.presence(oldSx, s.feet.sy + (ward.x - 20 + ward.y - 5) * s.step.y) < 0.25, `${w}x${h}: sanity, the edge-pinned camera loses the Ward stair`);
    }
  });

  it("Stack Road east walk pans the plate before clamp, and markers stay plate-aligned (no floating mouths)", () => {
    const ctx = { drawImage() {} } as unknown as CanvasRenderingContext2D;
    const w = 440;
    const h = 250;
    // Hand re-play on 5b4c48b: first ~4 ArrowRight pans, then look-ahead scrolled the board under a frozen
    // plate so Ward/Quarry/Rust brass floated into empty void. Widened road pan must keep moving the
    // painted offset for several east steps; while it moves, mouth screen delta matches plate delta.
    const ox: number[] = [];
    const wardSx: number[] = [];
    for (const x of [5, 6, 7, 8, 9]) {
      stage.layoutStage(ctx, w, h, x, 5, "road");
      const s = stage.stageNow();
      ox.push(s.ox);
      wardSx.push(stage.projectTile(w, h, x, 5, 20, 1, 1, 64, 32).sx);
      assert.ok(s.feet.sx < w * stage.DECK.right - 1, `at ${x},5 Silas is not pinned to DECK.right (${Math.round(s.feet.sx)})`);
    }
    assert.ok(ox[4]! < ox[0]! - 40, `after 4 east steps plate offset must change (${ox[0]!.toFixed(0)} → ${ox[4]!.toFixed(0)})`);
    for (let i = 1; i < ox.length; i++) {
      const plateDelta = ox[i]! - ox[i - 1]!;
      const wardDelta = wardSx[i]! - wardSx[i - 1]!;
      assert.ok(Math.abs(plateDelta - wardDelta) < 2, `east step ${i}: mouth stays plate-aligned (plateΔ ${plateDelta.toFixed(1)}, wardΔ ${wardDelta.toFixed(1)})`);
    }
    // Widened pan + leftish road aim: Ward readable from 16,5 without look-ahead rim-clip.
    stage.layoutStage(ctx, w, h, 16, 5, "road");
    const ward = stage.projectTile(w, h, 16, 5, 20, 1, 1, 64, 32);
    assert.ok(stage.onDeck(ward.sx, ward.sy), `from 16,5 Ward is on deck (${Math.round(ward.sx)},${Math.round(ward.sy)})`);
    assert.ok(ward.sx < w * 0.88, `from 16,5 Ward is not rim-clipped (${Math.round(ward.sx)} / ${w})`);
  });

  it("closing Lark mid-road does not push a second arrive log line", () => {
    // LogChip remount-after-talk is covered by playtest-loop L9c'. Here: store must not re-run arrive.
    useGame.setState((s) => ({
      data: {
        ...s.data,
        flags: { ...s.data.flags, checkpointSpoke: true },
        player: { ...s.data.player, x: 24, y: 18 },
      },
    }));
    G().clickTile(25, 18);
    walkOut();
    assert.equal(D().mapId, "road");
    assert.match(D().log[0] ?? "", /You arrive at The Stack Road/);
    const before = D().log.slice();
    useGame.setState((s) => ({ data: { ...s.data, dialogue: { convo: "lark", node: "start" } } }));
    const leave = leaveIndex(D());
    assert.ok(leave >= 0, `Lark opening has an Esc leave (got ${leave})`);
    G().choose(leave);
    assert.equal(D().dialogue, null);
    assert.deepEqual(D().log, before, "closing Lark must not re-push arrive or other log lines");
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

  it("Oakhaven stays Act I and Stack Road Act II: the header is map.act, not visit order", () => {
    // Hand leftover: returning via Ward stair "felt" like Act II. Data is district-scoped.
    assert.equal(MAPS.haven.act, "Act I");
    assert.equal(MAPS.road.act, "Act II");
    assert.equal(MAPS.sinks.act, "Act I");
    assert.equal(REGIONS.find((r) => r.id === "haven")?.act, "Act I");
    useGame.setState((s) => ({
      data: {
        ...s.data,
        flags: { ...s.data.flags, checkpointSpoke: true, "seen:road": true },
        mapId: "haven",
        player: { ...s.data.player, x: 10, y: 12 },
      },
    }));
    assert.equal(MAPS[D().mapId].act, "Act I", "header subline uses MAPS[mapId].act — Oakhaven is Act I after the road");
  });

  it("a tap on a mouth's brass label hits the same exit tile as the diamond", () => {
    const ctx = { drawImage() {} } as unknown as CanvasRenderingContext2D;
    const w = 440;
    const h = 250;
    stage.layoutStage(ctx, w, h, 24, 18, "sinks");
    const mouth = mouthAt("sinks", 25, 18)!;
    assert.equal(mouth.label, "Stack mouth");
    const p = stage.projectTile(w, h, 24, 18, mouth.x, mouth.y, 1, 64, 32);
    const box = stage.mouthLabelBox(p.sx, p.sy, mouth.label, true);
    // Centre of the label text is a hit; a point well below the diamond but on the tag.
    assert.equal(stage.hitMouthLabel((box.left + box.right) / 2, (box.top + box.bottom) / 2, p.sx, p.sy, mouth.label, true), true);
    // Far off to the side of the tag is not a hit (no dead-area expansion).
    assert.equal(stage.hitMouthLabel(box.right + 30, (box.top + box.bottom) / 2, p.sx, p.sy, mouth.label, true), false);
    // Diamond centre (tile sy - 8) is outside the label box — tile hit still covers it separately.
    assert.equal(stage.hitMouthLabel(p.sx, p.sy - 8, p.sx, p.sy, mouth.label, true), false);
  });

  it("combat HUD keys expose accessible names matching their actions", () => {
    assert.equal(HUD_LABELS.strike, "Strike");
    assert.equal(HUD_LABELS.brace, "Brace");
    assert.equal(HUD_LABELS.end, "End turn");
    assert.equal(HUD_LABELS.audit, "Audit");
    for (const [kind, label] of Object.entries(HUD_LABELS)) {
      assert.ok(label.trim().length > 0, `${kind} needs a name`);
    }
  });

  it("HUD visible captions only where the art has no baked word (no double labels)", () => {
    // Hand check on eb7b0f9: every key showed the JPG word plus a .hud-label on top.
    for (const kind of Object.keys(HUD_LABELS) as (keyof typeof HUD_LABELS)[]) {
      assert.equal(HUD_ART_HAS_WORD.has(kind), true, `${kind} art already names the key`);
      assert.equal(hudShowsCaption(kind), false, `${kind} must not paint a second caption`);
    }
    assert.equal(hudShowsCaption("unknown-future-key"), true, "a key without art-word still gets a caption");
  });

  it("Wren's Back to the iron leave closes the talk (click index, same as the button)", () => {
    const wren = D().actors.wren;
    assert.ok(wren?.alive && wren.mapId === "sinks");
    useGame.setState((s) => ({ data: { ...s.data, player: { ...s.data.player, x: wren.x - 1, y: wren.y } } }));
    G().clickTile(wren.x, wren.y);
    walkOut();
    assert.equal(D().dialogue?.convo, "wren");
    const replies = visibleReplies(D());
    const i = replies.findIndex((r) => /Back to the iron/.test(r.text));
    assert.ok(i >= 0, "leave is on the board");
    assert.equal(leaveIndex(D()), i, "Esc targets the same leave a click takes");
    G().choose(i);
    assert.equal(D().dialogue, null, "choosing the leave must clear the talk");
  });

  it("checkpoint fight from a fresh ledger: step onto y>=12, Move, Read them", () => {
    // Live testers who only walked near Moll/Varr saw them in the party strip (near faces ≤8)
    // and never crossed the plate line — no guard-line, no fight. Tobin's opening has no leave
    // on purpose (Esc does nothing there). Reliable path:
    assert.equal(D().player.y < 12, true);
    useGame.setState((s) => ({ data: { ...s.data, player: { ...s.data.player, x: 14, y: 10 } } }));
    G().clickTile(14, 12);
    walkOut();
    assert.equal(D().dialogue?.convo, "guard-line");
    assert.equal(D().dialogue?.node, "start");
    pick(/^Move\.$/);
    assert.equal(D().dialogue?.node, "fight");
    pick(/Read them/);
    assert.ok(D().combat, "Read them starts the three-guard fight");
    assert.deepEqual(D().combat?.order.slice().sort(), ["en1", "en2", "player", "varr"].sort());
    assert.equal(D().dialogue, null);
  });

  it("immediate re-bump into Wren after Leave does not reopen; step away does", () => {
    // Spawn lane: Wren stands south of (3,3). Down into her after Leave used to reopen forever.
    const wren = D().actors.wren;
    assert.ok(wren);
    useGame.setState((s) => ({
      data: { ...s.data, player: { ...s.data.player, x: wren.x, y: wren.y - 1 }, path: [], intent: null, dialogue: null },
    }));
    G().clickTile(wren.x, wren.y);
    assert.equal(D().dialogue?.convo, "wren");
    pick(/Back to the iron/);
    assert.equal(D().dialogue, null);
    G().clickTile(wren.x, wren.y);
    assert.equal(D().dialogue, null, "same-tile bump after Leave must stay quiet");
    // Talk HUD still works (force).
    G().talkNearest();
    assert.equal(D().dialogue?.convo, "wren");
    pick(/Back to the iron/);
    // Step aside, then bump again — talk is allowed.
    G().clickTile(wren.x + 1, wren.y - 1);
    walkOut();
    assert.equal(D().dialogue, null);
    assert.equal(D().player.x, wren.x + 1);
    G().clickTile(wren.x, wren.y);
    walkOut();
    assert.equal(D().dialogue?.convo, "wren");
  });

  it("plate-stair Ledger sign does not re-open on every Down after Leave it", () => {
    // Door at (5,11). Standing at (5,10) and pressing Down used to loop "A bar sits in the plate stair…".
    useGame.setState((s) => ({
      data: { ...s.data, player: { ...s.data.player, x: 5, y: 10 }, path: [], intent: null, dialogue: null },
    }));
    G().clickTile(5, 11);
    assert.equal(D().dialogue?.convo, "plate-stair");
    pick(/Leave it/);
    assert.equal(D().dialogue, null);
    G().clickTile(5, 11);
    assert.equal(D().dialogue, null, "same-tile door after Leave it must stay quiet");
    G().clickTile(6, 10);
    walkOut();
    G().clickTile(5, 11);
    assert.equal(D().dialogue?.convo, "plate-stair", "after stepping away the sign can be read again");
  });

  it("Recommended Engineering/Audit/Speech tags do not skip the guard-line", () => {
    // Fresh ledger uses recommend() → audit+engineering+speech. Crossing y=12 still opens Moll.
    assert.ok((D().player.skills.speech ?? 0) >= 40);
    assert.ok((D().player.skills.engineering ?? 0) >= 40);
    assert.ok((D().player.skills.audit ?? 0) >= 40);
    assert.equal(Boolean(D().flags.checkpointSpoke), false);
    useGame.setState((s) => ({ data: { ...s.data, player: { ...s.data.player, x: 14, y: 10 } } }));
    G().clickTile(14, 12);
    walkOut();
    assert.equal(D().dialogue?.convo, "guard-line");
  });

  it("Menu quit label names the title return; quit() restores the title phase", () => {
    // "Close the ledger" read like dismissing the panel; the X already closes. Wording matches epilogue.
    assert.equal(MENU_QUIT_LABEL, "Return to the title");
    assert.equal(D().phase, "play");
    G().quit();
    assert.equal(D().phase, "title");
  });

  it("title Continue reads disk before paint (hasStoredLedger / boot, not a stale false)", () => {
    // Hand check: first page load showed Continue greyed even with auto+slot1; click still worked
    // after a late boot. Store side: initialData().hasSave was hard-false until boot. SSR side:
    // disabled={!hasSave} on the server HTML is not patched on hydrate when the client has a save
    // (TitleScreen now gates disabled until mount).
    mem.clear();
    assert.equal(hasStoredLedger(), false);
    G().boot();
    assert.equal(D().hasSave, false);

    freshLedger();
    G().save("slot1");
    assert.equal(hasStoredLedger(), true, "auto from play commits plus slot1");

    // Cold title the old way: phase title, hasSave left false while storage is full.
    useGame.setState((s) => ({ data: { ...s.data, phase: "title", hasSave: false } }));
    assert.equal(D().hasSave, false);
    // boot (and store seed / useLayoutEffect) re-reads disk before paint.
    G().boot();
    assert.equal(D().hasSave, true);
    assert.equal(D().hasSave, hasStoredLedger());

    // quit() must also seed from the same scan so a menu return looks enabled immediately.
    G().quit();
    assert.equal(D().phase, "title");
    assert.equal(D().hasSave, true);
    assert.equal(D().hasSave, hasStoredLedger());
  });

  it("Kiln flue audit selects the dark flue, not the unused Borrowed heat leaf", () => {
    // Browser act2: Audit · Kiln flue opened on severed optional Borrowed heat, so Mend misreconstructed
    // and Seat the flue sat below the fold unread. Unused severed leaves must not outrank a dark required seam.
    useGame.setState((s) => ({
      data: {
        ...s.data,
        mapId: "kiln",
        player: { ...s.data.player, mapId: "kiln", x: 6, y: 7 },
        flags: { ...s.data.flags, "seen:kiln": true, checkpointSpoke: true },
        panel: "none",
        dialogue: null,
        path: [],
        audit: null,
        uiNode: null,
      },
    }));
    const fire = D().machines.kilnfire;
    assert.ok(fire, "kilnfire machine exists");
    assert.equal(fire.nodes.find((n) => n.id === "borrow")?.severed, true, "Borrowed heat starts severed");
    assert.equal(
      fire.nodes.some((c) => c.dependsOn.includes("borrow")),
      false,
      "Borrowed heat feeds nobody until spliced",
    );
    openAudit(D(), { kind: "machine", id: "kilnfire" });
    assert.equal(D().panel, "audit");
    assert.equal(D().audit?.id, "kilnfire");
    assert.equal(D().uiNode, "flue", `expected flue, got ${D().uiNode}`);
    assert.notEqual(D().uiNode, "borrow");
    // Pump still prefers the failing valve (severed-or-live main seam).
    useGame.setState((s) => ({
      data: {
        ...s.data,
        mapId: "sinks",
        player: { ...s.data.player, mapId: "sinks", x: 13, y: 6 },
        panel: "none",
        audit: null,
        uiNode: null,
      },
    }));
    openAudit(D(), { kind: "machine", id: "pump" });
    assert.equal(D().uiNode, "valve");
  });
  it("every shut locked door has free orthogonal approaches on both sides (Nim no longer blocks the Kiln cellar cut)", () => {
    // act2 K28: Nim stood on (6,15), the only orthogonal tile north of the Kiln cellar door (6,16).
    // Arrow keys step orthogonally, so a keyboard player could never bump the door open.
    const d = D();
    const blocked: string[] = [];
    for (const door of LOCKED_DOORS) {
      const map = MAPS[door.map];
      const free = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].filter(([dx, dy]) => {
        const x = door.x + dx;
        const y = door.y + dy;
        if (!WALKABLE.has(tileAt(map, x, y))) return false;
        if (Object.values(d.machines).some((m) => m.mapId === door.map && m.x === x && m.y === y)) return false;
        return !Object.values(d.actors).some((a) => a.alive && a.mapId === door.map && a.x === x && a.y === y);
      });
      if (free.length < 2) blocked.push(`${door.map} ${door.x},${door.y} (${door.convo}): ${free.length} free`);
    }
    assert.deepEqual(blocked, []);
    const nim = d.actors.nim;
    assert.ok(!(nim.mapId === "kiln" && nim.x === 6 && nim.y === 15), "Nim is beside the cut, not in front of it");
  });

  it("Kiln cellar cut opens by arrow keys from the north (step down, bump the door)", () => {
    useGame.setState((s) => ({
      data: {
        ...s.data,
        mapId: "kiln",
        player: { ...s.data.player, mapId: "kiln", x: 6, y: 14 },
        flags: { ...s.data.flags, "seen:kiln": true, checkpointSpoke: true, kilnTold: true },
        panel: "none",
        dialogue: null,
        path: [],
      },
    }));
    G().clickTile(6, 15); // ArrowDown
    walkOut();
    assert.deepEqual([D().player.x, D().player.y], [6, 15]);
    G().clickTile(6, 16); // ArrowDown into the door
    assert.equal(D().dialogue?.convo, "kiln-cellar");
    pick(/Use the give/);
    assert.equal(D().flags.kilnCellar, true);
    pick(/Go down/);
    G().clickTile(6, 16);
    walkOut();
    G().clickTile(6, 17);
    walkOut();
    assert.deepEqual([D().player.x, D().player.y], [6, 17]);
  });

  it("a plate tap inside a shut door's tile diamond takes the door, not the nearest standable tile", () => {
    const doors = [{ x: 6, y: 16, sx: 200, sy: 300 }];
    assert.deepEqual(stage.hitShutDoor(200, 300, doors, 32, 16), { x: 6, y: 16 });
    assert.deepEqual(stage.hitShutDoor(215, 306, doors, 32, 16), { x: 6, y: 16 });
    assert.equal(stage.hitShutDoor(240, 300, doors, 32, 16), null, "a tap on the neighbour's centre still walks");
    assert.equal(stage.hitShutDoor(200, 320, doors, 32, 16), null);
  });
  it("no routine parks an actor on a stair's landing tile (Sol on the Glass stair landing, act2 P8)", () => {
    const landings = new Set(MOUTHS.map((m) => `${m.to}:${m.tx},${m.ty}`));
    const flagSets: Record<string, unknown>[] = [
      {},
      { paneCharge: true, kilnHouses: true, kilnCellar: true, switchBay: true, paneVault: true, switchShed: true },
      { kilnRefused: true, paneRefused: true, stampCut: true },
      { vossLeft: true },
    ];
    const hits: string[] = [];
    for (const extra of flagSets) {
      for (let hour = 0; hour < 4; hour++) {
        freshLedger();
        const d = D();
        // Keep Silas off the road so routines are free to place people there.
        d.mapId = "kiln";
        d.player.mapId = "kiln";
        d.player.x = 16;
        d.player.y = 3;
        Object.assign(d.flags, extra, { hour });
        if (extra.paneCharge) {
          // Derived flags are recomputed from the machines: seat the Pane flue and bed so the melt holds.
          for (const n of d.machines.panefire.nodes) if (n.id === "flue" || n.id === "bed") Object.assign(n, { severed: false, integrity: 100 });
          for (const n of d.machines.kilnfire.nodes) if (n.id === "flue" || n.id === "bed") Object.assign(n, { severed: false, integrity: 100 });
          d.flags.fieldDry = true;
        }
        reconcileWorld(d);
        if (extra.paneCharge) assert.equal(d.flags.paneCharge, true, "melt holds for the sweep");
        for (const a of Object.values(d.actors)) {
          if (a.alive && !a.companion && landings.has(`${a.mapId}:${a.x},${a.y}`)) hits.push(`${a.id} ${a.mapId} ${a.x},${a.y} (hour ${hour}, ${Object.keys(extra).join("+") || "fresh"})`);
        }
      }
    }
    assert.deepEqual([...new Set(hits)], []);
  });

  it("arriving on a landing someone is standing on steps Silas beside them, not on top", () => {
    const d = D();
    d.mapId = "pane";
    d.player.mapId = "pane";
    d.player.x = 16;
    d.player.y = 18;
    d.dialogue = null;
    d.panel = "none";
    d.flags["seen:pane"] = true;
    // Park Sol on the road landing of the Pane Stack mouth (27,2) the way the old routine did.
    const sol = d.actors.sol;
    sol.mapId = "road";
    sol.x = 27;
    sol.y = 2;
    depart(d);
    assert.equal(d.mapId, "road");
    assert.notDeepEqual([d.player.x, d.player.y], [27, 2], "Silas is not stacked on Sol");
    assert.ok(Math.max(Math.abs(d.player.x - 27), Math.abs(d.player.y - 2)) <= 1, "Silas lands beside the stair");
    assert.ok(!MOUTHS.some((m) => m.map === "road" && m.x === d.player.x && m.y === d.player.y), "not on a mouth");
  });

  it("Audit beside the Quarry crane opens the crane, not the distant severed chute (bug 24)", () => {
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.mapId = "quarry";
    d.player.mapId = "quarry";
    d.player.x = 11;
    d.player.y = 4;
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.path = [];
    d.intent = null;
    reconcileWorld(d);
    assert.ok(dist(d.player, d.machines.crane) <= 1, "fixture stands beside the crane");
    assert.ok(dist(d.player, d.machines.chute) > 1, "chute is not beside Silas");
    assert.ok(d.machines.chute.nodes.some((n) => n.severed || n.integrity < 50), "chute still reads as broken bait");
    G().auditNearest();
    assert.equal(D().panel, "audit");
    assert.equal(D().audit?.id, "crane", `Audit must not walk off to the chute (got ${D().audit?.id})`);
  });

  it("Act III primary paths (Quarry mouth→Hask→Rill, crane→Stack mouth, Rust mouth→Nell) stay outside hostile vision", () => {
    // Bug 23: rubble on the east corridor and mill beside Rill / cutter beside Nell forced combat
    // before the primary talks. Same class as Nim/Ske/Sol clearance — optional fights stay, off-path.
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    reconcileWorld(d);

    const rubble = d.actors.rubble;
    const mill = d.actors.mill1;
    const cutter = d.actors.cutter1;
    assert.ok(rubble?.alive && mill?.alive && cutter?.alive);
    assert.ok(rubble.hostile && rubble.aggro && rubble.vision > 0);
    assert.ok(mill.hostile && mill.aggro && mill.vision > 0);
    assert.ok(cutter.hostile && cutter.aggro && cutter.vision > 0);

    function assertRouteClear(mapId: string, sx: number, sy: number, tx: number, ty: number, hostiles: typeof rubble[]) {
      d.mapId = mapId;
      d.player.mapId = mapId;
      d.player.x = sx;
      d.player.y = sy;
      d.combat = null;
      const route = pathTo(d, tx, ty);
      assert.ok(route && route.length > 0, `${mapId} ${sx},${sy} → ${tx},${ty} must path`);
      for (const p of [{ x: sx, y: sy }, ...route]) {
        for (const a of hostiles) {
          if (a.mapId !== mapId || !a.alive) continue;
          assert.ok(dist(a, p) > a.vision, `${a.id}@${a.x},${a.y} vision ${a.vision} must not cover ${mapId} ${p.x},${p.y} on ${sx},${sy}→${tx},${ty}`);
        }
      }
      // And a live step along the route must not start combat.
      d.player.x = sx;
      d.player.y = sy;
      d.combat = null;
      checkVision(d);
      assert.equal(d.combat, null, `${mapId} spawn ${sx},${sy} is not already in vision`);
    }

    // pathTo refuses occupied tiles — walk beside NPCs / machines (where Talk/Audit stand).
    assertRouteClear("quarry", 32, 8, 6, 10, [rubble, mill]); // beside Hask
    assertRouteClear("quarry", 6, 10, 21, 16, [rubble, mill]); // beside Rill
    assertRouteClear("quarry", 6, 10, 11, 4, [rubble, mill]); // beside crane
    assertRouteClear("quarry", 21, 16, 17, 16, [rubble, mill]); // Rill → beside Pim
    // Bug 33: after Cut the brake the natural walk is crane → Stack mouth (row 6); rubble at (20,3) saw it.
    assertRouteClear("quarry", 11, 4, 32, 8, [rubble, mill]); // beside crane → Stack mouth
    assertRouteClear("quarry", 6, 10, 32, 8, [rubble, mill]); // beside Hask → Stack mouth
    assertRouteClear("quarry", 17, 16, 32, 8, [rubble, mill]); // beside Pim → Stack mouth
    assertRouteClear("quarry", 32, 8, 11, 4, [rubble, mill]); // Stack mouth → beside crane
    assertRouteClear("rust", 33, 8, 12, 16, [cutter]); // beside Nell
    assertRouteClear("rust", 33, 8, 4, 4, [cutter]); // beside Ives
    assertRouteClear("rust", 33, 8, 8, 8, [cutter]); // beside hearth
  });
  it("High Citadel: the tundra stair landing walks to the ranking floor (bug 25)", () => {
    // The south throat (22–24,15) opened onto rock at rows 13–14, so the only on-foot way in
    // (Tundra → Ranking stair → 32,18) could reach lamps / buffer / Ime and nothing else.
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.flags.citadelOpen = true;
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "tundra";
    d.player.mapId = "tundra";
    d.player.x = 26;
    d.player.y = 5;
    depart(d);
    assert.equal(d.mapId, "citadel");
    assert.deepEqual([d.player.x, d.player.y], [32, 18], "Ranking stair lands on the tundra stair landing");
    reconcileWorld(d);
    for (const [x, y, what] of [[13, 8, "beside crucible"], [13, 5, "beside Vane"], [25, 9, "beside orrery"], [17, 7, "beside Sarn"], [9, 13, "west wing walk"]] as const) {
      d.player.x = 32;
      d.player.y = 18;
      const route = pathTo(d, x, y);
      assert.ok(route && route.length > 0, `citadel 32,18 → ${x},${y} (${what}) must path on foot`);
    }
  });

  it("High Citadel primary routes from the tundra stair stay outside hostile vision (bug 26)", () => {
    // Warden on the landing corridor (28,19) and both guards beside Vane/Sarn/crucible started
    // combat on arrival or before the first Act V talk. Optional fights stay, off the routes.
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.flags.citadelOpen = true;
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    reconcileWorld(d);
    const hostiles = Object.values(d.actors).filter((a) => a.alive && a.mapId === "citadel" && a.hostile && a.aggro && a.vision > 0);
    assert.ok(["warden1", "guard1", "guard2"].every((id) => hostiles.some((a) => a.id === id)), "the citadel fights still exist");
    const sarnSpots: [number, number][] = [[14, 8], [18, 6], [30, 10]]; // default, guardToll, sever
    const goals: [number, number, string][] = [
      [25, 18, "beside lamps"], [21, 19, "beside buffer"], [22, 19, "beside Ime"],
      [25, 9, "beside orrery"], [13, 8, "beside crucible"], [13, 5, "beside Vane"],
      ...sarnSpots.map(([x, y]) => [x, y + 1, `beside Sarn@${x},${y}`] as [number, number, string]),
    ];
    for (const [tx, ty, what] of goals) {
      d.player.x = 32;
      d.player.y = 18;
      d.combat = null;
      const route = pathTo(d, tx, ty);
      assert.ok(route && route.length > 0, `32,18 → ${tx},${ty} (${what}) must path`);
      for (const p of [{ x: 32, y: 18 }, ...route]) {
        for (const a of hostiles) {
          assert.ok(dist(a, p) > a.vision, `${a.id}@${a.x},${a.y} vision ${a.vision} covers ${p.x},${p.y} on the way to ${what}`);
        }
      }
    }
    d.player.x = 32;
    d.player.y = 18;
    checkVision(d);
    assert.equal(d.combat, null, "arriving on the tundra stair landing does not start a fight");
  });
  it("a long road walk that crosses another mouth does not depart through it (bug 27)", () => {
    // Tundra walk (8,14) → beside Spire mouth (28,14): the shortest route runs over the Yard stair
    // (22,14). step() departed on any mouth tile, so Silas landed in The Switch mid-walk.
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.flags.citadelOpen = true;
    d.flags.spireOpen = true;
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "road";
    d.player.mapId = "road";
    d.player.x = 8;
    d.player.y = 14;
    d.path = [];
    d.intent = null;
    reconcileWorld(d);
    G().clickTile(28, 14);
    const route = D().path.map((p) => `${p.x},${p.y}`);
    assert.ok(route.length > 0, "road 8,14 → 28,14 paths");
    const crossed = MOUTHS.filter((m) => m.map === "road" && route.slice(0, -1).includes(`${m.x},${m.y}`));
    assert.ok(crossed.length > 0, `fixture route crosses a mouth mid-walk (${route.join(" ")})`);
    walkOut();
    assert.equal(D().mapId, "road", `walk stays on the road (crossed ${crossed.map((m) => m.label).join(", ")})`);
    assert.deepEqual([D().player.x, D().player.y], [28, 14]);
    // The last step onto a mouth still departs: arrow onto the Spire mouth.
    G().clickTile(28, 15);
    walkOut();
    assert.equal(D().mapId, "spire", "stepping onto the Spire mouth at the end of a route still leaves");
  });

  it("in a fight, Audit reads the foe in reach, not the machine Silas is beside; Strike/Audit stay on the roster (bugs 28–29)", () => {
    // Citadel Sever starts the guard fight at the crucible. Audit is the only way to read a foe in a
    // fight (a tap on a hostile strikes), and it reopened the crucible every turn. Strike / Audit also
    // aimed at Sentry Quill, who is hostile on the map but not in the engagement's turn order.
    const d = D();
    d.flags.act1 = true;
    d.flags.checkpointSpoke = true;
    d.flags.citadelOpen = true;
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    reconcileWorld(d);
    const crucible = d.machines.crucible;
    d.player.x = 13;
    d.player.y = 8;
    assert.ok(dist(d.player, crucible) <= 1, "fixture: Silas beside the crucible");
    startCombat(d, ["guard1"]);
    const fight = D().combat;
    assert.ok(fight, "guard fight started");
    const g = d.actors.guard1;
    const sentry = d.actors.sentry;
    g.x = 14; g.y = 9; g.hp = g.maxHp;
    sentry.x = 12; sentry.y = 9; sentry.hostile = true; sentry.aggro = true;
    assert.ok(!fight.order.includes("sentry"), "fixture: the sentry is not in this engagement");
    d.player.hp = d.player.maxHp;
    fight.index = fight.order.indexOf("player");
    d.player.ap = 8;
    d.panel = "none";
    d.audit = null;
    G().auditNearest();
    assert.equal(D().panel, "audit");
    assert.deepEqual(D().audit, { kind: "actor", id: "guard1" }, "Audit opens the guard in reach, not the crucible or the sentry");
    G().closePanel();
    const sentryHp = D().actors.sentry.hp;
    const guardHp = D().actors.guard1.hp;
    const ap = D().player.ap;
    G().strikeNearest();
    assert.equal(D().actors.sentry.hp, sentryHp, "Strike does not spend the turn on the off-roster sentry");
    assert.ok(D().player.ap < ap, "Strike swung");
    assert.ok(D().actors.guard1.hp <= guardHp, "the swing went at the guard");
    // Out of a fight the machine beside Silas still wins Audit (bug 24 order unchanged).
    const e = D();
    e.combat = null;
    e.panel = "none";
    e.audit = null;
    for (const a of Object.values(e.actors)) { a.hostile = false; a.aggro = false; }
    G().auditNearest();
    assert.deepEqual(D().audit, { kind: "machine", id: "crucible" });
  });

  it("a stood-down Lamp shade stays down on the dark road; the Spire mouth is reachable without a kill (bug 30)", () => {
    // Sever (or a cut lamp glass) darkens the road. syncShade re-armed the shade on every reconcile,
    // so after "They step out of the engagement" the next step started the same fight again.
    const d = D();
    Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, spireOpen: true, roadDark: true, citadelFate: "sever" });
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "road";
    d.player.mapId = "road";
    d.player.x = 8;
    d.player.y = 14;
    d.path = [];
    d.intent = null;
    reconcileWorld(d);
    assert.ok(d.actors.shade.hostile, "the dark road arms the shade");
    G().clickTile(28, 14);
    walkOut();
    assert.ok(D().combat?.order.includes("shade"), "walking to the Spire mouth meets the shade");
    const e = D();
    e.actors.shade.nodes.find((n) => n.effect === "weapon")!.severed = true;
    e.player.skills.speech = 95;
    e.combat!.index = e.combat!.order.indexOf("player");
    for (let k = 0; k < 6 && D().combat; k++) {
      D().player.ap = 8;
      G().standDown();
    }
    assert.equal(D().combat, null, "the shade stands down once its knife is cut");
    while (D().dialogue) G().choose(0);
    assert.equal(D().actors.shade.alive, true);
    assert.equal(D().actors.shade.hostile, false, "stood-down shade is not re-armed by the next reconcile");
    G().clickTile(28, 14);
    walkOut();
    assert.equal(D().combat, null, "no second engagement on the way to the mouth");
    assert.deepEqual([D().player.x, D().player.y], [28, 14]);
  });

  it("the Sovereign's down choice records the ending like the Spire heart does (bug 31)", () => {
    const d = D();
    d.phase = "play";
    d.combat = null;
    d.panel = "none";
    d.dialogue = { convo: "sovereign-down", node: "start" };
    pick(/Write the shape/);
    assert.equal(D().phase, "epilogue");
    assert.equal(D().ending, "impose");
    assert.equal(D().flags.ending, "impose", "flags.ending set on the fight route too");
    assert.match(D().epilogue[0], /You wrote the shape/);
  });

  it("sovereign-down Leave the holes records the release ending (fight-leave)", () => {
    const d = D();
    d.phase = "play";
    d.combat = null;
    d.panel = "none";
    d.dialogue = { convo: "sovereign-down", node: "start" };
    pick(/Leave the holes/);
    assert.equal(D().phase, "epilogue");
    assert.equal(D().ending, "release");
    assert.equal(D().flags.ending, "release");
    assert.match(D().epilogue[0], /left the holes|You left/i);
  });

  it("Cut the span sets iceCut, colds the hollow, and bills the ice middle harder (TUNDRA=cut)", () => {
    const d = D();
    Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, tundraWalked: true });
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "tundra";
    d.player.mapId = "tundra";
    d.player.x = 18;
    d.player.y = 14;
    d.player.hp = d.player.maxHp;
    d.path = [];
    d.intent = null;
    reconcileWorld(d);
    openAudit(d, { kind: "machine", id: "stake" });
    assert.equal(D().panel, "audit");
    assert.equal(D().audit?.id, "stake");
    G().special("cut-span");
    assert.equal(D().flags.iceCut, true);
    assert.equal(D().flags.iceSpan, false);
    assert.equal(D().flags.hollowWarm, false, "cutting the glaze colds the hollow even if the orrery still sends");
    // Step a brass-ice `!` tile: (16,5). Cleats in pack are not equipped, so the middle still bills.
    const hp = D().player.hp;
    D().flags.iceNoted = false;
    D().panel = "none";
    G().clickTile(16, 5);
    walkOut();
    assert.deepEqual([D().player.x, D().player.y], [16, 5]);
    assert.ok(D().player.hp <= hp - 2, `iceCut bills 2 (hp ${hp}→${D().player.hp})`);
    assert.match(D().log[0] ?? "", /cut glaze bills the middle twice/);
  });

  it("Kel hands Edge cleats after the hollow is read", () => {
    const d = D();
    Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, tundraWalked: true, hollowRead: true });
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "tundra";
    d.player.mapId = "tundra";
    reconcileWorld(d);
    const kel = d.actors.kel;
    d.player.x = kel.x;
    d.player.y = kel.y;
    // Bump talk
    d.dialogue = { convo: "kel", node: "start" };
    pick(/hollow is warm|middle of the walk/i);
    pick(/take the edge/i);
    assert.equal(D().flags.cleatGiven, true);
    assert.ok((D().inventory.find((i) => i.id === "cleat")?.qty ?? 0) >= 1);
  });

  it("Break the lamp glass darkens the stack road without Sever (LAMP=break)", () => {
    const d = D();
    Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, seenCitadel: true });
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    d.focus = 10;
    d.path = [];
    reconcileWorld(d);
    const lamps = d.machines.lamps;
    d.player.x = lamps.x;
    d.player.y = lamps.y + 1; // beside the glass (24,18)
    assert.ok(dist(d.player, lamps) <= 1);
    assert.equal(D().flags.roadDark, false);
    openAudit(d, { kind: "machine", id: "lamps" });
    G().special("break-glass");
    reconcileWorld(D());
    assert.equal(D().flags.roadDark, true, "severing the lamp glass child darkens the road");
    assert.equal(D().flags.roadLamps, false);
    assert.ok(D().machines.lamps.nodes.some((n) => n.id === "glass" && n.severed));
  });

  it("Sever with shaftOpen skips the guard fight; without it the floor notices the dark", () => {
    const boot = () => {
      const d = D();
      Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, seenCitadel: true });
      d.phase = "play";
      d.dialogue = null;
      d.panel = "none";
      d.combat = null;
      d.mapId = "citadel";
      d.player.mapId = "citadel";
      d.player.x = 13;
      d.player.y = 8;
      d.focus = 12;
      d.path = [];
      reconcileWorld(d);
      return d;
    };
    // Without shaftOpen: guard fight.
    {
      const d = boot();
      d.flags.shaftOpen = false;
      openAudit(d, { kind: "machine", id: "crucible" });
      G().special("sever");
      assert.equal(D().flags.citadelFate, "sever");
      assert.ok(D().combat, "floor notices the dark");
      assert.ok(D().combat!.order.includes("guard1"));
      assert.ok(D().combat!.order.includes("guard2"));
    }
    // With shaftOpen: no fight.
    {
      mem.clear();
      G().openCreate();
      G().recommend();
      G().startNew();
      pick(/show me the pump/);
      pick(/audit it/);
      const d = boot();
      d.flags.shaftOpen = true;
      for (const id of ["guard1", "guard2"]) {
        d.actors[id].hostile = false;
        d.actors[id].aggro = false;
      }
      openAudit(d, { kind: "machine", id: "crucible" });
      G().special("sever");
      assert.equal(D().flags.citadelFate, "sever");
      assert.equal(D().flags.spireOpen, true);
      assert.equal(D().combat, null, "shaftOpen means the floor does not notice");
      assert.match(D().log.join(" | "), /Void Spire is on the map|Something there has no baseline/);
    }
  });

  it("a dismissed shaft door reopens after Silas steps away (Sever-with-shaft harness)", () => {
    // Same dismiss rule as plate-stair / locked doors: Leave or a failed check that ends the talk
    // marks dismissAt; a second bump from the same tile is swallowed until a step clears it.
    const d = D();
    Object.assign(d.flags, { act1: true, checkpointSpoke: true, citadelOpen: true, seenCitadel: true });
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.combat = null;
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    d.player.x = 7;
    d.player.y = 7;
    d.path = [];
    reconcileWorld(d);
    G().clickTile(6, 8);
    assert.equal(D().dialogue?.convo, "shaft-door");
    // Leave it shut.
    pick(/Leave it shut/);
    assert.equal(D().dialogue, null);
    assert.ok(D().flags.dismissAt, "dismiss marked");
    G().clickTile(6, 8);
    assert.equal(D().dialogue, null, "same-tile bump stays dismissed");
    G().clickTile(10, 10);
    walkOut();
    assert.equal(D().flags.dismissAt, undefined, "a step clears dismissAt");
    G().clickTile(6, 8);
    walkOut();
    if (!D().dialogue) {
      D().player.x = 7; D().player.y = 7;
      G().clickTile(6, 8);
    }
    assert.equal(D().dialogue?.convo, "shaft-door", "door talk is available again after moving");
  });

  it("Vane's ceremony checks are not offered again once the crucible is answered (bug 32)", () => {
    // Played: VANE=fail → guards stood down → Splice (redirect) → Vane → look → the ceremony still offered
    // horns / history. A pass would overwrite citadelFate; a fail would set the guards on a settled floor.
    for (const fate of [undefined, "redirect", "sever", "seize", "expose"]) {
      const d = D();
      d.phase = "play";
      d.combat = null;
      d.panel = "none";
      if (fate) d.flags.citadelFate = fate;
      else delete d.flags.citadelFate;
      d.dialogue = { convo: "vane", node: "choice" };
      const texts = visibleReplies(D()).map((r) => r.text);
      if (!fate) {
        assert.ok(texts.some((t) => /on the horns/.test(t)) && texts.some((t) => /History, then/.test(t)), "both checks before the answer");
      } else {
        assert.ok(!texts.some((t) => /on the horns|History, then/.test(t)), `no ceremony check after ${fate}: ${texts.join(" / ")}`);
        assert.ok(texts.some((t) => /answer on the machine/.test(t)), "a plain leave remains");
      }
    }
    // A pass before the answer still exposes the crucible (the branch itself is unchanged).
    const d = D();
    delete d.flags.citadelFate;
    d.player.skills.speech = 95;
    d.dialogue = { convo: "vane", node: "choice" };
    const real = Math.random;
    Math.random = () => 0;
    try { pick(/on the horns/); } finally { Math.random = real; }
    assert.equal(D().flags.citadelFate, "expose");
    assert.equal(D().flags.spireOpen, true);
    assert.equal(D().dialogue, null);
  });

  it("a recruited Cinder can walk with Silas past her perch (bug 34)", () => {
    // Played: CINDER=1 — feed the moth plate scrap at the bellows, "Hold still." → she chose the shadow,
    // then every walk out of the upper Sinks threw "toward is not a function" (nudgeCreature) and Silas froze.
    const d = D();
    d.inventory.push({ id: "scrap", qty: 1 });
    d.flags.act1 = true; // the plate line is answered (the scrap came from Varr's coupling)
    d.flags.checkpointSpoke = true;
    d.player.x = 29;
    d.player.y = 3;
    d.dialogue = { convo: "cinder", node: "start" };
    pick(/plate scrap/);
    pick(/Hold still/);
    assert.equal(D().actors.cinder.companion, true);
    G().clickTile(24, 18);
    assert.ok(D().path.length > 0, "a path out of the upper Sinks");
    for (let n = 0; n < 300 && D().path.length && !D().dialogue; n++) G().step();
    assert.deepEqual([D().player.x, D().player.y], [24, 18]);
    const moth = D().actors.cinder;
    assert.ok(moth.companion && moth.mapId === "sinks" && dist(moth, D().player) <= 3, `moth kept up (${moth.x},${moth.y})`);
  });

  it("'I'll circle' at the Sovereign points at the unissued baseline (bug 35)", () => {
    // Hand pass: after declining the fight the tester kept re-talking to the Sovereign, decided the fight
    // was mandatory and died four times. The release ending runs through the Unissued baseline (spireheart).
    for (const node of ["start", "sat"]) {
      const d = D();
      d.phase = "play";
      d.combat = null;
      d.panel = "none";
      d.flags.citadelFate = "seize";
      d.dialogue = { convo: "sovereign-pre", node };
      pick(/I'll circle/);
      assert.equal(D().dialogue, null);
      assert.equal(D().combat, null, "circling starts no fight");
      assert.match(D().log[0], /unissued baseline/);
      assert.match(D().log[0], /without a fight/);
    }
  });

  it("Audit in the High Citadel walks to the unread crucible, not back to the read buffer (bug 36)", () => {
    // Hand pass: HUD Audit / Q kept walking to the Infirmary buffer by Ime after it was read and charged.
    // Its siphon child is cut by design, so it always looked "broken" and outranked the intact crucible.
    const d = D();
    d.phase = "play";
    d.dialogue = null;
    d.combat = null;
    d.panel = "none";
    d.mapId = "citadel";
    d.player.mapId = "citadel";
    d.player.x = 13;
    d.player.y = 5;
    for (const id of ["buffer", "lamps", "orrery"])
      for (const n of d.machines[id].nodes) n.confidence = "understood";
    assert.ok(d.machines.buffer.nodes.some((n) => n.severed), "the buffer's parent is cut by design");
    G().auditNearest();
    const aim = D().intent;
    assert.ok(aim?.type === "audit" && aim.id === "crucible", `Audit aimed at ${JSON.stringify(aim)}`);
    walkOut();
    assert.equal(D().panel, "audit");
    assert.equal(D().audit?.id, "crucible");
    // Beside the crucible, Audit opens it directly.
    G().closePanel();
    G().auditNearest();
    assert.equal(D().audit?.id, "crucible");
  });

  it("dismissing the level-up reaches the autosave, so Continue does not show it again (bug 37)", () => {
    const d = D();
    d.phase = "play";
    d.dialogue = null;
    d.pendingLevel = true;
    G().auditNearest(); // any committed action writes the autosave with the modal still pending
    assert.equal(JSON.parse(mem.get("mend-save-v1-auto")!).data.pendingLevel, true);
    G().ackLevel();
    assert.equal(D().pendingLevel, false);
    assert.equal(JSON.parse(mem.get("mend-save-v1-auto")!).data.pendingLevel, false, "the autosave heard the dismissal");
    G().quit();
    G().load("auto");
    assert.equal(D().pendingLevel, false, "Continue does not re-open Comprehension deepens");
  });

  it("Stand down is not offered while the Sovereign's baton is live (bug 38)", () => {
    // Hand pass: cutting only the Echo's Power coupling showed "Stand down — their weapons are already dark",
    // and a pass ended the fight with the Sovereign undefeated. Her baton has no weapon seam on the graph.
    const d = D();
    d.phase = "play";
    d.dialogue = null;
    d.mapId = "spire";
    d.player.mapId = "spire";
    d.player.x = 8;
    d.player.y = 8;
    const sov = d.actors.sovereign;
    const echo = d.actors.echo;
    assert.ok(sov && echo);
    sov.hostile = true;
    sov.aggro = true;
    echo.hostile = true;
    startCombat(d, ["sovereign", "echo"]);
    assert.ok(d.combat);
    echo.nodes.find((n) => n.id === "coupling")!.severed = true;
    assert.equal(weaponsDark(d), false, "the Sovereign still carries a live baton");
    // A foe whose weapon seam is cut (the Echo alone) is still dark, as before.
    sov.hostile = false;
    assert.equal(weaponsDark(d), true, "the Echo's arm mount is dark once its coupling is cut");
  });

  function spireFight() {
    const d = D();
    d.phase = "play";
    d.dialogue = null;
    d.panel = "none";
    d.audit = null;
    d.path = [];
    d.intent = null;
    d.mapId = "spire";
    d.player.mapId = "spire";
    d.player.x = 8;
    d.player.y = 7;
    const sov = d.actors.sovereign;
    const echo = d.actors.echo;
    sov.hostile = true;
    sov.aggro = true;
    echo.hostile = true;
    echo.aggro = true;
    sov.x = 8; sov.y = 6;
    echo.x = 11; echo.y = 8;
    startCombat(d, ["sovereign", "echo"]);
    assert.ok(d.combat, "Spire fight started");
    d.combat.index = d.combat.order.indexOf("player");
    d.player.ap = 9;
    d.player.hp = d.player.maxHp;
    return d;
  }

  it("a face in the turn order aims Audit at that hostile (H7)", () => {
    // Hand pass: in the Sovereign + Echo fight, Audit always opened the adjacent Sovereign. A tap on the Echo
    // struck it for 3 AP and the initiative portraits did nothing, so the Echo could only be read from beside it.
    const d = spireFight();
    assert.ok(dist(d.player, d.actors.sovereign) <= 1 && dist(d.player, d.actors.echo) > 1, "fixture: Sovereign beside, Echo across");
    G().auditNearest();
    assert.deepEqual(D().audit, { kind: "actor", id: "sovereign" }, "unaimed, Audit still reads the foe in reach");
    assert.ok(D().log.includes("Touch a face in the turn order to choose who Audit reads."), "the hint names the turn order");
    G().closePanel();
    const ap = D().player.ap;
    G().aimAudit("echo");
    assert.equal(D().combat?.aim, "echo");
    assert.equal(D().log[0], "Audit will read Echo construct.");
    assert.equal(D().player.ap, ap, "aiming is free");
    G().auditNearest();
    assert.notEqual(D().panel, "audit", "the Echo is not in reach yet: Silas walks first");
    assert.deepEqual(D().intent, { type: "audit", id: "echo", kind: "actor" });
    assert.ok(D().path.length > 0, "a walk toward the Echo");
    walkOut();
    assert.equal(D().panel, "audit");
    assert.deepEqual(D().audit, { kind: "actor", id: "echo" }, "Audit opened on the aimed Echo, not the Sovereign");
    G().closePanel();
    // Beside both, the aim still wins over whoever is nearest.
    D().actors.sovereign.x = D().player.x;
    D().actors.sovereign.y = D().player.y - 1;
    D().player.ap = 9;
    G().auditNearest();
    assert.deepEqual(D().audit, { kind: "actor", id: "echo" });
    G().closePanel();
    // Touching the same face again clears the aim; non-hostiles and strangers cannot be aimed.
    G().aimAudit("echo");
    assert.equal(D().combat?.aim, undefined);
    G().aimAudit("tobin");
    assert.equal(D().combat?.aim, undefined);
    G().aimAudit("player");
    assert.equal(D().combat?.aim, undefined);
  });

  it("an aimed foe that falls lets Audit fall back to the nearest (H7)", () => {
    spireFight();
    G().aimAudit("echo");
    D().actors.echo.alive = false;
    G().auditNearest();
    assert.deepEqual(D().audit, { kind: "actor", id: "sovereign" });
  });

  it("cutting the Echo's Power coupling re-reads its intent at once (H8)", () => {
    // Hand pass: after the cut the line kept "Piston arm → you · needs Power coupling — no longer that shape"
    // for a full round before it said "Bare hands → you".
    const d = spireFight();
    const echo = d.actors.echo;
    echo.x = d.player.x + 1;
    echo.y = d.player.y;
    // Round 3 of the hand pass: the Tool haft was already gone, so the Echo swings instead of cutting.
    for (const n of d.player.nodes) if (n.effect === "weapon") n.severed = true;
    for (const n of echo.nodes) { n.revealed = true; n.confidence = "confident"; }
    freezeIntents(d);
    const before = boardIntents(d).find((r) => r.id === "echo");
    assert.match(before?.line ?? "", /^Piston arm → you/);
    assert.match(before?.line ?? "", /needs Power coupling/);
    assert.equal(before?.live, true);
    for (let i = 0; i < 15 && !echo.nodes.find((n) => n.id === "coupling")!.severed; i++) {
      d.player.ap = 20;
      d.focus = 40;
      d.player.stunned = false;
      d.phase = "play";
      unmendNode(d, { kind: "actor", id: "echo" }, "coupling");
    }
    assert.ok(echo.nodes.find((n) => n.id === "coupling")!.severed, "coupling cut");
    const after = boardIntents(d).find((r) => r.id === "echo");
    assert.equal(after?.line, "Bare hands → you", "same turn, the line names what the Echo will actually swing");
    assert.equal(after?.live, true);
    // The Sovereign's opening is untouched by a cut on someone else.
    const sov = boardIntents(d).find((r) => r.id === "sovereign");
    assert.ok(sov && !/Bare hands/.test(sov.line));
  });

  it("a committed cut Silas steps away from says out of reach, not a lost part (H9)", () => {
    // Hand pass: after walking to the Echo and cutting its coupling, the Sovereign's line read
    // "Cut → Tool haft — no longer that shape" though the haft was whole. The step had taken Silas out of its reach.
    const d = spireFight();
    const sov = d.actors.sovereign;
    const echo = d.actors.echo;
    const haft = d.player.nodes.find((n) => n.effect === "weapon")!;
    d.player.x = 9; d.player.y = 7;
    sov.x = 8; sov.y = 6;
    echo.x = 11; echo.y = 8;
    for (const n of echo.nodes) { n.revealed = true; n.confidence = "confident"; }
    freezeIntents(d);
    const before = boardIntents(d).find((r) => r.id === "sovereign");
    assert.equal(before?.line, `Cut → your ${haft.name}`);
    assert.equal(before?.live, true);
    assert.equal(before?.why, "");
    // The aimed-Audit walk: one step east, beside the Echo, two from the Sovereign.
    d.player.x = 10;
    assert.equal(dist(d.player, sov), 2);
    for (let i = 0; i < 15 && !echo.nodes.find((n) => n.id === "coupling")!.severed; i++) {
      d.player.ap = 20;
      d.focus = 40;
      d.player.stunned = false;
      d.phase = "play";
      unmendNode(d, { kind: "actor", id: "echo" }, "coupling");
    }
    assert.ok(echo.nodes.find((n) => n.id === "coupling")!.severed, "coupling cut");
    assert.ok(!haft.severed, "nobody touched the haft");
    const rows = boardIntents(d);
    const s = rows.find((r) => r.id === "sovereign");
    assert.equal(s?.line, `Cut → your ${haft.name}`, "the Sovereign keeps its committed cut: no re-plan for a cut on someone else");
    assert.equal(s?.live, false);
    assert.equal(s?.why, "out of reach", "the line says why, and does not imply the haft was lost");
    const e = rows.find((r) => r.id === "echo");
    assert.equal(e?.line, `Cut → your ${haft.name}`, "the Echo, now beside Silas, re-read its opening (H8)");
    assert.equal(e?.live, true);
    // Once the haft really is gone, the line says that instead.
    haft.severed = true;
    assert.equal(boardIntents(d).find((r) => r.id === "sovereign")?.why, `your ${haft.name} is gone`);
  });

  it("a foe's cut names Silas's part as yours, and the coupling steam names its scald (H10)", () => {
    // Hand pass: "Cut → Tool haft" read like the foe's own haft, and Silas lost 3 HP with no line
    // when the coupling cut emptied Focus. The 3 HP is the steam from the Echo's dead weapon mount.
    const d = spireFight();
    const sov = d.actors.sovereign;
    const echo = d.actors.echo;
    const haft = d.player.nodes.find((n) => n.effect === "weapon")!;
    d.player.x = 9; d.player.y = 7;
    sov.x = 8; sov.y = 6;
    echo.x = 10; echo.y = 8;
    for (const n of echo.nodes) { n.revealed = true; n.confidence = "confident"; }
    d.verbs = { ...(d.verbs ?? {}), cut: 0 };
    freezeIntents(d);
    const line = boardIntents(d).find((r) => r.id === "sovereign")?.line ?? "";
    assert.equal(line, `Cut → your ${haft.name}`);
    assert.ok(!/→ (?!your )Tool haft/.test(line));
    let hpBefore = 0;
    for (let i = 0; i < 15 && !echo.nodes.find((n) => n.id === "coupling")!.severed; i++) {
      d.player.ap = 20;
      d.focus = 40;
      d.player.hp = d.player.maxHp;
      d.player.stunned = false;
      d.player.guarding = false;
      d.phase = "play";
      hpBefore = d.player.hp;
      d.log = [];
      unmendNode(d, { kind: "actor", id: "echo" }, "coupling");
    }
    assert.ok(echo.nodes.find((n) => n.id === "coupling")!.severed, "coupling cut");
    const lost = hpBefore - d.player.hp;
    assert.equal(lost, 3, "the dead mount's steam takes 3 from an unarmoured Silas beside it");
    const text = d.log.join(" | ");
    assert.match(text, /Steam kicks out of the dead mount\./);
    assert.match(text, /The steam scalds you too\. \(-3\)/, "the HP loss is named in the log");
  });
});
