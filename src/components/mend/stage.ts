import { MAPS } from "@/game/maps";

export type Point = { sx: number; sy: number };
export type Step = { x: number; y: number };

export type Stage = {
  plate: boolean;
  feet: Point;
  step: Step;
  w: number;
  h: number;
  /** Painted plate draw offset (canvas px). Used to assert pan motion / plate↔board lock. */
  ox: number;
  oy: number;
};

type Shot = { src: string; zoom: number; fx: number; fy: number; ax?: number; ay?: number };

const V = "?v=8";

const PLATES: Record<string, Shot> = {
  quarry: { src: `/game/plates/canyon.jpg${V}`, zoom: 1.22, fx: 0.46, fy: 0.62 },
  tundra: { src: `/game/plates/tundra.jpg${V}`, zoom: 1.28, fx: 0.5, fy: 0.7 },
  // Like the road: at zoom 1.2 the square plate had ~86px X / ~16px Y slack, so the backdrop sat still
  // while Silas walked Vane's hall to the tundra stair and the screen gave no sign he moved (H15).
  citadel: { src: `/game/plates/citadel.jpg${V}`, zoom: 2, fx: 0.4, fy: 0.56 },
  spire: { src: `/game/plates/spire.jpg${V}`, zoom: 1.24, fx: 0.5, fy: 0.58 },
  pane: { src: `/game/plates/pane.jpg${V}`, zoom: 1.18, fx: 0.5, fy: 0.64 },
  haven: { src: `/game/plates/haven.jpg${V}`, zoom: 1.16, fx: 0.46, fy: 0.62 },
  kiln: { src: `/game/plates/kiln.jpg${V}`, zoom: 1.16, fx: 0.5, fy: 0.64 },
  rust: { src: `/game/plates/streets.jpg${V}`, zoom: 1.14, fx: 0.5, fy: 0.62 },
  // Square road plate at cover≈1 had ~0 X slack, so east walks clamped immediately; look-ahead then
  // scrolled the board under a frozen plate and floated brass mouths into the void. Widen zoom and
  // bias fx west so the walk toward Ward (20,1) still pans the picture; slight left aim leaves the
  // Ward on-deck without trailing-edge look-ahead drift.
  road: { src: `/game/plates/road.jpg${V}`, zoom: 2.4, fx: 0.28, fy: 0.54, ax: 0.4 },
  switch: { src: `/game/plates/switch.jpg${V}`, zoom: 1.14, fx: 0.48, fy: 0.6 },
  sinks: { src: `/game/plates/sinks.jpg${V}`, zoom: 1.2, fx: 0.42, fy: 0.58 },
};

const images = new Map<string, HTMLImageElement>();

function imageOf(src: string) {
  let image = images.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    images.set(src, image);
  }
  return image;
}

const empty: Stage = { plate: false, feet: { sx: 0, sy: 0 }, step: { x: 32, y: 16 }, w: 1, h: 1, ox: 0, oy: 0 };
let current: Stage = empty;

export function stageNow() {
  return current;
}

export function layoutStage(ctx: CanvasRenderingContext2D, w: number, h: number, px: number, py: number, mapId: string) {
  const shot = PLATES[mapId] ?? PLATES.sinks;
  const image = imageOf(shot.src);
  const ready = image.complete && image.naturalWidth > 0;
  if (!ready) {
    current = { ...empty, w, h };
    return current;
  }
  const cover = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const scale = cover * Math.max(1, shot.zoom * 0.86);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  const step = {
    x: Math.max(20, Math.min(26, w * 0.058)),
    y: Math.max(11, Math.min(14, h * 0.042)),
  };
  const home = MAPS[mapId]?.entry ?? { x: px, y: py };
  const panX = ((px - home.x) - (py - home.y)) * step.x;
  const panY = ((px - home.x) + (py - home.y)) * step.y;
  const ax = w * (shot.ax ?? 0.46);
  const ay = h * (shot.ay ?? 0.56);
  const rawX = ax - dw * shot.fx - panX;
  const rawY = ay - dh * shot.fy - panY;
  const minX = Math.min(0, w - dw);
  const minY = Math.min(0, h - dh);
  const x = Math.max(minX, Math.min(0, rawX));
  const y = Math.max(minY, Math.min(0, rawY));
  // Once the backdrop has run out of picture it rests at its edge. Feet stay on the home aim so the
  // board does not scroll under a frozen plate (look-ahead drift floated mouths into empty void).
  // Carrying the overshoot onto DECK.right is also avoided — that pinned Silas and lost the Ward.
  // Road pan room is widened above so the Ward walk still moves the plate before this clamp fires.
  current = {
    plate: true,
    feet: keepOnDeck(ax, ay, w, h),
    step,
    w,
    h,
    ox: x,
    oy: y,
  };
  ctx.drawImage(image, x, y, dw, dh);
  return current;
}

/**
 * Safety net for where Silas stands on screen on a plate.
 * The plate pans with him until it hits its own edge; past that his feet stay on the home aim so
 * markers stay plate-aligned (no independent board scroll under a frozen backdrop). This band only
 * guarantees the feet can never leave the canvas.
 */
export function keepOnDeck(sx: number, sy: number, w: number, h: number): Point {
  return {
    sx: Math.max(w * DECK.left, Math.min(w * DECK.right, sx)),
    sy: Math.max(h * DECK.top, Math.min(h * DECK.bottom, sy)),
  };
}

/** The band Silas's feet stay inside on a plate, as fractions of the canvas. */
export const DECK = { left: 0.18, right: 0.82, top: 0.3, bottom: 0.62 };

export function projectTile(
  w: number,
  h: number,
  px: number,
  py: number,
  x: number,
  y: number,
  zoom: number,
  tileW: number,
  tileH: number,
): Point {
  const dx = x - px;
  const dy = y - py;
  if (current.plate) {
    return {
      sx: current.feet.sx + (dx - dy) * current.step.x,
      sy: current.feet.sy + (dx + dy) * current.step.y,
    };
  }
  return {
    sx: w / 2 + (dx - dy) * (tileW / 2) * zoom,
    sy: h * 0.5 + (dx + dy) * (tileH / 2) * zoom,
  };
}

export function presence(sx: number, sy: number) {
  if (!current.plate) return 1;
  const { w, h } = current;
  const left = sx / (w * 0.07);
  const right = (w - sx) / (w * 0.07);
  const top = (sy - h * 0.02) / (h * 0.08);
  const bottom = (h * 0.9 - sy) / (h * 0.12);
  return Math.max(0, Math.min(1, left, right, top, bottom));
}

/**
 * Softer edge fade for mouth diamonds and brass labels so a stair near the frame edge
 * stays readable further out than an actor tag would.
 */
export function mouthPresence(sx: number, sy: number) {
  if (!current.plate) return 1;
  const { w, h } = current;
  const left = sx / (w * 0.12);
  const right = (w - sx) / (w * 0.12);
  const top = (sy - h * 0.01) / (h * 0.1);
  const bottom = (h * 0.92 - sy) / (h * 0.14);
  return Math.max(0, Math.min(1, left, right, top, bottom));
}

/** Inset box (fractions of the canvas) an off-screen mouth's edge pin is held inside; mouthPresence is 1 there. */
export const PIN = { left: 0.1, right: 0.9, top: 0.1, bottom: 0.86 };

/**
 * Below this own-frame presence a usable mouth is held as an edge pin instead of a fading tag. A tag
 * in the edge fade used to sit dimmed under the pins on the same edge (Stack Road, Yard stair vs the
 * Tundra walk / Spire mouth pins, hand walk 2026-10-22, H15c).
 */
export const PIN_BELOW = 0.5;

/**
 * A usable mouth that is off the frame on a plate used to have no hint at all: the High Citadel
 * tundra stair (33,18) sits ~240px below a 510px stage from Vane's floor, so a hand walk could not
 * tell which way the exit lay (H15). Return where the same brass diamond + tag should sit instead:
 * on the line from Silas's feet toward the mouth, pulled in to the PIN box. Null when the mouth
 * itself is clearly on the frame (its own diamond shows).
 */
export function edgePin(feet: Point, sx: number, sy: number, w: number, h: number): Point | null {
  if (mouthPresence(sx, sy) >= PIN_BELOW) return null;
  const left = w * PIN.left;
  const right = w * PIN.right;
  const top = h * PIN.top;
  const bottom = h * PIN.bottom;
  const fx = Math.max(left, Math.min(right, feet.sx));
  const fy = Math.max(top, Math.min(bottom, feet.sy));
  const dx = sx - fx;
  const dy = sy - fy;
  let t = 1;
  if (dx > 0) t = Math.min(t, (right - fx) / dx);
  if (dx < 0) t = Math.min(t, (left - fx) / dx);
  if (dy > 0) t = Math.min(t, (bottom - fy) / dy);
  if (dy < 0) t = Math.min(t, (top - fy) / dy);
  return { sx: fx + dx * t, sy: fy + dy * t };
}

/** Screen box of a mouth's brass diamond + tag (diamond at sy-8, tag at sy+16), shared by pins and on-frame tags. */
export function tagBox(sx: number, sy: number, text: string) {
  const half = Math.max(22, text.length * 3.2);
  return { left: sx - half, right: sx + half, top: sy - 18, bottom: sy + 19 };
}

type Box = { left: number; right: number; top: number; bottom: number };
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Several off-frame mouths can pin to the same stretch of edge (the Stack Road has six exits east of the
 * Tundra walk). Nudge later pins along the edge so each diamond + tag stays readable, clear of the pins
 * already placed and of the on-frame tags in `taken`. Pins are placed in the order given (nearest mouth
 * first). When a whole edge column is full the pin steps one tag-width in toward the centre.
 */
export function spreadPins<T extends Point & { label: string }>(pins: T[], w: number, h: number, taken: (Point & { label: string })[] = []): T[] {
  const placed: Box[] = taken.map((t) => tagBox(t.sx, t.sy, t.label));
  const step = 38;
  const ks = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8];
  return pins.map((pin) => {
    const inward = pin.sx > w / 2 ? -1 : 1;
    const wide = tagBox(0, 0, pin.label).right * 2 + 6;
    for (let col = 0; col < 4; col++) {
      const sx = pin.sx + inward * col * wide;
      for (const k of ks) {
        const sy = pin.sy + k * step;
        if (sy < h * PIN.top || sy > h * PIN.bottom) continue;
        const box = tagBox(sx, sy, pin.label);
        if (placed.some((o) => overlaps(box, o))) continue;
        placed.push(box);
        return { ...pin, sx, sy };
      }
    }
    placed.push(tagBox(pin.sx, pin.sy, pin.label));
    return pin;
  });
}

/**
 * Edge pins for every usable, off-frame mouth: edgePin each, nearest first, then spreadPins. Shared by
 * the draw and the tap so a tap on a pinned tag takes the mouth it names. `mouths` are projected
 * (sx, sy) with their Manhattan distance from Silas; nearOnly side stairs should be left out by the caller.
 * `taken` are the on-frame tags the pins must stay clear of.
 */
export function offFramePins<T extends { sx: number; sy: number; label: string; dist: number }>(
  feet: Point,
  mouths: T[],
  w: number,
  h: number,
  taken: (Point & { label: string })[] = [],
) {
  const pins: (T & { at: Point })[] = [];
  for (const m of [...mouths].sort((a, b) => a.dist - b.dist)) {
    const at = edgePin(feet, m.sx, m.sy, w, h);
    if (at) pins.push({ ...m, at });
  }
  // The tag points the way (screen direction from Silas) so a pin on painted stairs is not read as the stair itself.
  const way = (m: T) => {
    const dx = m.sx - feet.sx;
    const dy = m.sy - feet.sy;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? `${m.label} →` : `← ${m.label}`;
    return dy > 0 ? `${m.label} ↓` : `${m.label} ↑`;
  };
  return spreadPins(pins.map((m) => ({ ...m, sx: m.at.sx, sy: m.at.sy, label: way(m) })), w, h, taken);
}

export type MouthTag<M> = { m: M; sx: number; sy: number; label: string; alpha: number; pinned: boolean };

/**
 * Every brass mouth tag the frame shows, for the draw and the tap alike: on-frame mouths at their own
 * tile (fading in the edge band), and mouths under PIN_BELOW as full-strength edge pins spread clear of
 * each other and of the on-frame tags. nearOnly side stairs show only within 2 tiles and are never pinned.
 */
export function mouthTags<M extends { x: number; y: number; label: string; nearOnly?: boolean }>(
  mouths: M[],
  px: number,
  py: number,
  project: (x: number, y: number) => Point,
): MouthTag<M>[] {
  const on: MouthTag<M>[] = [];
  const off: (Point & { m: M; label: string; dist: number })[] = [];
  for (const m of mouths) {
    const dist = Math.abs(m.x - px) + Math.abs(m.y - py);
    if (m.nearOnly && dist > 2) continue;
    const p = project(m.x, m.y);
    if (!current.plate) {
      on.push({ m, sx: p.sx, sy: p.sy, label: m.label, alpha: 1, pinned: false });
      continue;
    }
    const seen = mouthPresence(p.sx, p.sy);
    if (m.nearOnly ? seen > 0.04 : seen >= PIN_BELOW) on.push({ m, sx: p.sx, sy: p.sy, label: m.label, alpha: seen, pinned: false });
    else if (!m.nearOnly) off.push({ m, sx: p.sx, sy: p.sy, label: m.label, dist });
  }
  if (!current.plate) return on;
  const pins = offFramePins(current.feet, off, current.w, current.h, on);
  return [...on, ...pins.map((p) => ({ m: p.m, sx: p.sx, sy: p.sy, label: p.label, alpha: 1, pinned: true }))];
}

export function onDeck(sx: number, sy: number) {
  return presence(sx, sy) > 0.35;
}

/**
 * Screen box for a mouth's brass name tag. Matches WorldCanvas label placement
 * (11px Source Sans, centered, plate offset +16 / board +26 under the tile centre).
 * Used so a tap on the label takes the same exit as a tap on the diamond.
 */
export function mouthLabelBox(sx: number, sy: number, text: string, plate: boolean) {
  const ly = sy + (plate ? 16 : 26);
  // ~6.4px advance at 11px "600 Source Sans 3" for the label alphabet (measured against strokeText).
  const halfW = Math.max(22, text.length * 3.2);
  return { left: sx - halfW, right: sx + halfW, top: ly - 11, bottom: ly + 3 };
}

export function hitMouthLabel(mx: number, my: number, sx: number, sy: number, text: string, plate: boolean) {
  const b = mouthLabelBox(sx, sy, text, plate);
  return mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom;
}

/**
 * Plate taps skip tiles Silas cannot stand on, and a shut locked door is not standable, so a tap
 * on the door itself used to walk to the nearest neighbour instead (Kiln cellar cut, act2 K28).
 * A tap inside a shut door's own tile diamond takes the door; clickTile then walks beside it and
 * opens its sign. `doors` are already projected and presence-culled by the caller.
 */
export function hitShutDoor(mx: number, my: number, doors: { x: number; y: number; sx: number; sy: number }[], hitX: number, hitY: number) {
  let hit: { x: number; y: number; dd: number } | null = null;
  for (const door of doors) {
    const nx = Math.abs(mx - door.sx) / hitX;
    const ny = Math.abs(my - door.sy) / hitY;
    if (nx + ny > 1) continue;
    const dd = (mx - door.sx) ** 2 + (my - door.sy) ** 2;
    if (!hit || dd < hit.dd) hit = { x: door.x, y: door.y, dd };
  }
  return hit && { x: hit.x, y: hit.y };
}
