import { MAPS } from "@/game/maps";

export type Point = { sx: number; sy: number };
export type Step = { x: number; y: number };

export type Stage = {
  plate: boolean;
  feet: Point;
  step: Step;
  w: number;
  h: number;
};

type Shot = { src: string; zoom: number; fx: number; fy: number };

const V = "?v=8";

const PLATES: Record<string, Shot> = {
  quarry: { src: `/game/plates/canyon.jpg${V}`, zoom: 1.22, fx: 0.46, fy: 0.62 },
  tundra: { src: `/game/plates/tundra.jpg${V}`, zoom: 1.28, fx: 0.5, fy: 0.7 },
  citadel: { src: `/game/plates/citadel.jpg${V}`, zoom: 1.2, fx: 0.48, fy: 0.66 },
  spire: { src: `/game/plates/spire.jpg${V}`, zoom: 1.24, fx: 0.5, fy: 0.58 },
  pane: { src: `/game/plates/pane.jpg${V}`, zoom: 1.18, fx: 0.5, fy: 0.64 },
  haven: { src: `/game/plates/haven.jpg${V}`, zoom: 1.16, fx: 0.46, fy: 0.62 },
  kiln: { src: `/game/plates/kiln.jpg${V}`, zoom: 1.16, fx: 0.5, fy: 0.64 },
  rust: { src: `/game/plates/streets.jpg${V}`, zoom: 1.14, fx: 0.5, fy: 0.62 },
  road: { src: `/game/plates/road.jpg${V}`, zoom: 1.16, fx: 0.5, fy: 0.6 },
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

const empty: Stage = { plate: false, feet: { sx: 0, sy: 0 }, step: { x: 32, y: 16 }, w: 1, h: 1 };
let current: Stage = empty;

export function stageNow() {
  return current;
}

/**
 * When the painted plate has run out of picture, shift Silas toward the *trailing* edge of the
 * frame (look-ahead) instead of pinning him dead-centre or carrying him to the leading edge.
 * That keeps walk motion visible and leaves room on the leading side for the next mouth
 * (Ward stair east/north, Stack mouth south-east). Cap the drift so he never parks on DECK.
 */
export const LOOK = { carry: 0.22, cap: 0.14 };

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
  const ax = w * 0.46;
  const ay = h * 0.56;
  const rawX = ax - dw * shot.fx - panX;
  const rawY = ay - dh * shot.fy - panY;
  const minX = Math.min(0, w - dw);
  const minY = Math.min(0, h - dh);
  const x = Math.max(minX, Math.min(0, rawX));
  const y = Math.max(minY, Math.min(0, rawY));
  // overshoot is zero while the plate still pans; past the edge it grows as Silas keeps walking.
  // Negate it so feet drift toward the trailing side (look-ahead), not the leading DECK edge.
  const overX = x - rawX;
  const overY = y - rawY;
  const driftX = Math.max(-w * LOOK.cap, Math.min(w * LOOK.cap, -overX * LOOK.carry));
  const driftY = Math.max(-h * LOOK.cap, Math.min(h * LOOK.cap, -overY * LOOK.carry));
  current = {
    plate: true,
    feet: keepOnDeck(ax + driftX, ay + driftY, w, h),
    step,
    w,
    h,
  };
  ctx.drawImage(image, x, y, dw, dh);
  return current;
}

/**
 * Safety net for where Silas stands on screen on a plate.
 * The plate pans with him until it hits its own edge; past that, `layoutStage` look-ahead drifts
 * his feet inside a capped band so the board still scrolls and the way ahead stays in frame.
 * This clamp only guarantees the feet can never leave the canvas.
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

export function onDeck(sx: number, sy: number) {
  return presence(sx, sy) > 0.35;
}
