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
  citadel: { src: `/game/plates/citadel.jpg${V}`, zoom: 1.2, fx: 0.48, fy: 0.66 },
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

export function onDeck(sx: number, sy: number) {
  return presence(sx, sy) > 0.35;
}
