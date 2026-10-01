import { useEffect, useRef } from "react";
import { bursts, decayFx, floaters, shake } from "@/game/fx";
import { gait, nodeLive, seamMark, walkable } from "@/game/logic";
import { LOCKED_DOORS, MAPS, MOUTHS, tileAt } from "@/game/maps";
import { useGame } from "@/game/store";
import { layoutStage, presence, projectTile, stageNow } from "@/components/mend/stage";
import type { Actor, Data } from "@/game/types";

const TW = 78;
const TH = 39;
const WALL = 36;

const cache = new Map<string, HTMLImageElement>();
const keyed = new Map<string, HTMLCanvasElement>();

function sprite(src: string) {
  let image = cache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    cache.set(src, image);
  }
  return image;
}

function keyedSprite(src: string): CanvasImageSource | null {
  const image = sprite(src);
  if (!image.complete || image.naturalWidth === 0) return null;
  let plate = keyed.get(src);
  if (!plate) {
    plate = document.createElement("canvas");
    plate.width = image.naturalWidth;
    plate.height = image.naturalHeight;
    const c = plate.getContext("2d", { willReadFrequently: true });
    if (!c) return image;
    c.drawImage(image, 0, 0);
    const img = c.getImageData(0, 0, plate.width, plate.height);
    const p = img.data;
    let clear = 0;
    for (let i = 3; i < p.length; i += 4) if (p[i] < 16) clear++;
    const already = clear > (p.length / 4) * 0.02;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i];
      const g = p[i + 1];
      const b = p[i + 2];
      if (already) {
        const magenta = r > 180 && b > 150 && g < 100 && Math.abs(r - b) < 70;
        if (magenta) p[i + 3] = 0;
        continue;
      }
      const magenta = r > 200 && b > 200 && g < 70 && Math.abs(r - b) < 45;
      // JPEG turns #FF00FF into a cluster near rgb(230, 12, 130), plus a darker rim.
      const jpeg = r > 100 && g < 70 && b > 48 && b < 190 && r - g > 85 && b - g > 20 && r - b > 15 && r - b < 150;
      const fringe =
        !magenta &&
        !jpeg &&
        ((r > 165 && b > 145 && g < 95 && Math.abs(r - b) < 55 && r + b > g * 4) ||
          (r > 150 && g < 80 && b > 45 && b < 190 && r - g > 90 && r - b > 15 && r - b < 130));
      if (magenta || jpeg) p[i + 3] = 0;
      else if (fringe) p[i + 3] = Math.min(p[i + 3], 70);
    }
    c.putImageData(img, 0, 0);
    keyed.set(src, plate);
  }
  return plate;
}

const deck = { w: 20, h: 14 };

function floorKey(theme: string) {
  if (theme === "quarry") return "canyon";
  if (theme === "citadel" || theme === "spire") return "tundra";
  if (theme === "haven") return "haven";
  if (theme === "rust" || theme === "road") return "rust";
  return "sinks";
}

type FigureKind = "armor" | "mill" | "tall" | "slight" | "coat";

function figureKind(spritePath: string, template: string): FigureKind {
  const s = `${spritePath} ${template}`.toLowerCase();
  if (s.includes("enforcer") || s.includes("kael") || template === "varr") return "armor";
  if (s.includes("automaton") || s.includes("pump") || template === "cinder" || template === "mill") return "mill";
  if (s.includes("sovereign")) return "tall";
  if (s.includes("pell") || s.includes("mara") || s.includes("sera") || template === "wren") return "slight";
  return "coat";
}

function drawChevron(ctx: CanvasRenderingContext2D, sx: number, sy: number, shut: boolean) {
  ctx.save();
  ctx.strokeStyle = shut ? "#e07040" : "#f3ead7";
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(sx - 6, sy - 2);
  ctx.lineTo(sx, sy + 5);
  ctx.lineTo(sx + 6, sy - 2);
  ctx.stroke();
  ctx.restore();
}

function drawFigure(ctx: CanvasRenderingContext2D, sx: number, sy: number, height: number, kind: FigureKind, hostile: boolean) {
  const h = height;
  const bulky = kind === "armor" || kind === "mill";
  const w = h * (kind === "slight" ? 0.3 : bulky ? 0.42 : kind === "tall" ? 0.32 : 0.36);
  const coat = hostile ? "#5a3328" : kind === "armor" ? "#8ea0ac" : kind === "mill" ? "#a07848" : kind === "slight" ? "#4a382e" : "#2a221c";
  const skin = kind === "armor" || kind === "mill" ? "#b7c2c8" : "#d2b08a";
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 1, w * 0.62, Math.max(2.5, h * 0.045), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14110e";
  ctx.fillRect(sx - w * 0.22, sy - h * 0.36, w * 0.16, h * 0.36);
  ctx.fillRect(sx + w * 0.06, sy - h * 0.36, w * 0.16, h * 0.36);
  const g = ctx.createLinearGradient(sx, sy - h, sx, sy);
  g.addColorStop(0, coat);
  g.addColorStop(1, "#100e0c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(sx - w * 0.46, sy - h * 0.72);
  ctx.lineTo(sx - w * 0.16, sy - h * 0.86);
  ctx.lineTo(sx + w * 0.16, sy - h * 0.86);
  ctx.lineTo(sx + w * 0.46, sy - h * 0.72);
  ctx.lineTo(sx + w * 0.4, sy - h * 0.3);
  ctx.lineTo(sx - w * 0.4, sy - h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hostile ? "#c45c26" : "rgba(212,180,131,0.75)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = "rgba(212,180,131,0.45)";
  ctx.beginPath();
  ctx.moveTo(sx, sy - h * 0.82);
  ctx.lineTo(sx, sy - h * 0.36);
  ctx.stroke();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(sx, sy - h * 0.94, w * 0.2, h * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = kind === "mill" ? "#d4b483" : kind === "armor" ? "#5e6c76" : "#1a1410";
  ctx.beginPath();
  ctx.ellipse(sx, sy - h * 0.98, w * 0.22, h * 0.05, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  if (kind === "armor") {
    ctx.strokeStyle = "#e4ecef";
    ctx.strokeRect(sx - w * 0.22, sy - h * 0.7, w * 0.44, h * 0.22);
  }
  if (kind === "mill") {
    ctx.strokeStyle = "#d4b483";
    ctx.beginPath();
    ctx.arc(sx, sy - h * 0.92, h * 0.09, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function paintFloor(ctx: CanvasRenderingContext2D, sx: number, sy: number, x: number, y: number, theme: string) {
  const image = sprite(`/game/floors/${floorKey(theme)}.jpg?v=7`);
  if (!image.complete || image.naturalWidth === 0) return false;
  const cx = (deck.w - 1) / 2;
  const cy = (deck.h - 1) / 2;
  const wx = (x - cx - (y - cy)) * (TW / 2);
  const wy = (x - cx + (y - cy)) * (TH / 2);
  const cover = Math.max(1560, (deck.w + deck.h) * (TW / 2) + 480);
  const dw = cover;
  const dh = cover * (image.naturalHeight / image.naturalWidth);
  ctx.save();
  diamond(ctx, sx, sy);
  ctx.clip();
  ctx.drawImage(image, sx - wx - dw / 2, sy - wy - dh / 2, dw, dh);
  const rim = ctx.createRadialGradient(sx, sy - 2, 8, sx, sy, TH * 0.78);
  rim.addColorStop(0, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(10,7,5,0.12)");
  ctx.fillStyle = rim;
  ctx.fillRect(sx - TW, sy - TH, TW * 2, TH * 2);
  ctx.restore();
  return true;
}

function hash(x: number, y: number) {
  return Math.abs((x * 73856093) ^ (y * 19349663)) % 997;
}

function diamond(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.beginPath();
  ctx.moveTo(sx, sy - TH / 2);
  ctx.lineTo(sx + TW / 2, sy);
  ctx.lineTo(sx, sy + TH / 2);
  ctx.lineTo(sx - TW / 2, sy);
  ctx.closePath();
}

function isPlate(ch: string) {
  return ch === "." || ch === ",";
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  ch: string,
  x: number,
  y: number,
  now: number,
  theme: string,
  vacant: boolean,
  fade = false,
  shut = false,
  zoom = 1,
  rimR = false,
  rimD = false,
) {
  if (ch === "#") return;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(zoom, zoom);
  ctx.translate(-sx, -sy);
  if (fade) ctx.globalAlpha = 0.4;
  if (stageNow().plate && ch !== "~" && ch !== "!" && ch !== "^") {
    ctx.restore();
    return;
  }
  const tone = (x * 3 + y * 5) % 3;
  const floors =
    theme === "haven"
      ? ["#6a5340", "#5c4636", "#745844"]
      : theme === "quarry"
        ? ["#5c5850", "#504c46", "#676258"]
        : theme === "rust"
          ? ["#5c3c30", "#4c342c", "#6a4638"]
          : ["#4a4036", "#433a32", "#514638"];
  const h = hash(x, y);
  diamond(ctx, sx, sy);
  if (ch === "~") {
    ctx.fillStyle = "#100e0c";
    ctx.fill();
    ctx.save();
    ctx.clip();
    const oil = ctx.createLinearGradient(sx - 28, sy - 10, sx + 24, sy + 12);
    oil.addColorStop(0, "rgba(28,22,16,0.2)");
    oil.addColorStop(0.45, "rgba(196,148,72,0.22)");
    oil.addColorStop(1, "rgba(12,10,8,0.15)");
    ctx.fillStyle = oil;
    ctx.fillRect(sx - TW, sy - TH, TW * 2, TH * 2);
    ctx.strokeStyle = "rgba(90,70,48,0.45)";
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const wobble = Math.sin(now / 520 + x * 0.4 + i) * 1.6;
      ctx.beginPath();
      ctx.moveTo(sx - 26, sy + i * 4 + wobble);
      ctx.lineTo(sx + 26, sy + i * 2.4);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(168,132,84,0.7)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  } else if (ch === "=") {
    ctx.fillStyle = "#3a3128";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(196,160,96,0.45)";
    ctx.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - 28, sy + i * 3.2);
      ctx.lineTo(sx + 28, sy + i * 1.6);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(212,180,131,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (ch === "%") {
    ctx.fillStyle = "#2a241c";
    ctx.fill();
    ctx.strokeStyle = "rgba(140,112,73,0.35)";
    ctx.strokeRect(sx - 10, sy - 4, 20, 8);
  } else if (ch === "p") {
    ctx.fillStyle = tone === 0 ? "#4a433a" : "#433c34";
    ctx.fill();
  } else if (ch === "v") {
    ctx.fillStyle = tone === 0 ? "#161310" : "#1c1814";
    ctx.fill();
  } else if (ch === "^") {
    ctx.fillStyle = "#3a2a22";
    ctx.fill();
    ctx.fillStyle = "#c45c26";
    ctx.globalAlpha = 0.35 + Math.sin(now / 180 + x) * 0.15;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 6, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = fade ? 0.4 : 1;
  } else if (ch === "!") {
    ctx.fillStyle = "#4a3b2a";
    ctx.fill();
    ctx.strokeStyle = "rgba(196,92,38,0.8)";
    ctx.stroke();
  } else if (ch === "+") {
    ctx.fillStyle = shut ? "#3a2a22" : "#5a4632";
    ctx.fill();
    ctx.strokeStyle = shut ? "#c45c26" : "#d4b483";
    ctx.strokeRect(sx - 8, sy - 6, 16, 12);
    if (shut) {
      ctx.strokeStyle = "#c45c26";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 10, sy);
      ctx.lineTo(sx + 10, sy);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  } else if (ch === "." || ch === ",") {
    drawDeck(ctx, sx, sy, x, y, now, theme, vacant, rimR, rimD);
  } else {
    ctx.fillStyle = floors[tone];
    ctx.fill();
  }
  if (ch !== "." && ch !== ",") {
    ctx.strokeStyle = "rgba(16,14,12,0.55)";
    ctx.stroke();
  }
  if (ch === "p") drawClutter(ctx, sx, sy, h, now, false, vacant, theme);
  ctx.restore();
}

function skirt(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, depth: number, face: string, pipe: string) {
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx, by + depth);
  ctx.lineTo(ax, ay + depth);
  ctx.closePath();
  ctx.fillStyle = face;
  ctx.fill();
  ctx.strokeStyle = "rgba(12,9,7,0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = "rgba(140,112,73,0.45)";
  ctx.beginPath();
  ctx.moveTo(ax, ay + depth * 0.38);
  ctx.lineTo(bx, by + depth * 0.38);
  ctx.stroke();
  ctx.strokeStyle = pipe;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(ax, ay + depth * 0.7);
  ctx.lineTo(bx, by + depth * 0.7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(243,214,160,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ax, ay + depth * 0.62);
  ctx.lineTo(bx, by + depth * 0.62);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function etchPlate(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number, now: number, theme: string) {
  const ice = theme === "citadel" || theme === "spire";
  const sand = theme === "quarry";
  ctx.save();
  diamond(ctx, sx, sy);
  ctx.clip();
  const ink = ice ? "rgba(150,220,230,0.72)" : sand ? "rgba(120,78,42,0.75)" : "rgba(255,214,150,0.62)";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  if (h % 2 === 0) {
    const pts: [number, number][] = [
      [sx - 18, sy + 2],
      [sx - 6, sy - 8],
      [sx + 2, sy - 1],
      [sx + 14, sy - 7],
      [sx + 10, sy + 6],
      [sx - 4, sy + 8],
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    for (const [px, py] of pts) {
      ctx.beginPath();
      ctx.arc(px, py, 1.1, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    const cx = sx + ((h % 5) - 2) * 3;
    const cy = sy + ((h % 3) - 1) * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    const spin = now / 900 + h;
    for (let i = 0; i < 6; i++) {
      const a = spin + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 3.2);
      ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 5.2);
      ctx.stroke();
    }
  }
  if (ice) {
    ctx.strokeStyle = "rgba(190,236,244,0.4)";
    ctx.beginPath();
    ctx.moveTo(sx - 22, sy + 2);
    ctx.lineTo(sx - 2, sy - 6);
    ctx.lineTo(sx + 18, sy + 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDeck(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  x: number,
  y: number,
  now: number,
  theme: string,
  vacant: boolean,
  rimR: boolean,
  rimD: boolean,
) {
  const h = hash(x, y);
  const south = theme === "sinks" && y >= 12;
  const ember = south && vacant;
  const depth = 10;
  const face = theme === "quarry" ? "#6a4530" : theme === "citadel" || theme === "spire" ? "#24343c" : "#3a2c20";
  const pipe = theme === "citadel" || theme === "spire" ? "#7ec8d0" : ember ? "#c45c26" : "#c4844a";
  if (rimD) skirt(ctx, sx - TW / 2, sy, sx, sy + TH / 2, depth, face, pipe);
  if (rimR) skirt(ctx, sx + TW / 2, sy, sx, sy + TH / 2, depth, face, pipe);
  if (rimR && rimD) {
    ctx.fillStyle = face;
    ctx.fillRect(sx - 3, sy + TH / 2, 6, depth);
  }
  const schematic = theme !== "quarry" && h % 2 === 0;
  diamond(ctx, sx, sy);
  const lift = (h % 5) * 4;
  ctx.fillStyle =
    theme === "quarry"
      ? "#5a564c"
      : theme === "haven"
        ? "#5c4636"
        : theme === "rust"
          ? "#5a3830"
          : schematic
            ? `rgb(${62 + lift},${52 + lift},${40})`
            : `rgb(${42 + lift},${36},${28})`;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const plated = paintFloor(ctx, sx, sy, x, y, theme);
  if (!plated && schematic) {
    const wash = ctx.createRadialGradient(sx, sy - 2, 2, sx, sy, 30);
    wash.addColorStop(0, ember ? "rgba(196,92,38,0.45)" : "rgba(210,150,60,0.42)");
    wash.addColorStop(1, "rgba(210,150,60,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(sx - TW / 2, sy - TH / 2, TW, TH);
  }
  if (!plated && (!schematic || theme === "quarry")) {
    ctx.strokeStyle = "rgba(8,6,5,0.55)";
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(sx - TW / 2, sy + i * 4);
      ctx.lineTo(sx + TW / 2, sy + i * 2.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + i * 8, sy - TH / 2);
      ctx.lineTo(sx + i * 4.6, sy + TH / 2);
      ctx.stroke();
    }
  }
  if (!plated && schematic) {
    const glow = 0.72 + Math.sin(now / 520 + x * 0.7 + y) * 0.16;
    const gold = ember ? `rgba(255,150,70,${glow})` : `rgba(255,214,130,${glow})`;
    const pts: [number, number][] = [
      [sx - 16, sy + 1],
      [sx - 6, sy - 8],
      [sx + 4, sy - 2],
      [sx + 14, sy - 6],
      [sx + 12, sy + 5],
      [sx - 2, sy + 7],
      [sx - 12, sy + 4],
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (h % 4 === 0) ctx.closePath();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
  ctx.restore();
  if (plated) {
    diamond(ctx, sx, sy);
    ctx.strokeStyle = "rgba(18,14,10,0.85)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    return;
  }
  etchPlate(ctx, sx, sy, h, now, theme);
  ctx.beginPath();
  ctx.moveTo(sx - TW / 2, sy);
  ctx.lineTo(sx, sy - TH / 2);
  ctx.lineTo(sx + TW / 2, sy);
  ctx.strokeStyle = "rgba(232,204,156,0.7)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  diamond(ctx, sx, sy);
  ctx.strokeStyle = ember ? "#a86840" : "#8c6844";
  ctx.lineWidth = 2.4;
  ctx.stroke();
  diamondInset(ctx, sx, sy, 4.5);
  ctx.strokeStyle = "rgba(28,20,12,0.85)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#c4a574";
  for (const [px, py] of [
    [0, -TH / 2 + 3],
    [TW / 2 - 5, 0],
    [0, TH / 2 - 3],
    [-TW / 2 + 5, 0],
  ] as const) {
    ctx.beginPath();
    ctx.arc(sx + px, sy + py, 1.35, 0, Math.PI * 2);
    ctx.fill();
  }
  if ((rimR || rimD) && h % 4 === 0) {
    const lx = rimR && !rimD ? sx + TW / 2 - 8 : sx - TW / 2 + 8;
    const ly = sy - 1;
    ctx.fillStyle = ember ? "rgba(255,140,60,0.95)" : "rgba(255,214,150,0.95)";
    ctx.beginPath();
    ctx.arc(lx, ly, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ember ? "rgba(196,92,38,0.22)" : "rgba(255,190,90,0.2)";
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = 1;
}

function diamondInset(ctx: CanvasRenderingContext2D, sx: number, sy: number, inset: number) {
  const tw = TW - inset * 2.4;
  const th = TH - inset * 1.15;
  ctx.beginPath();
  ctx.moveTo(sx, sy - th / 2);
  ctx.lineTo(sx + tw / 2, sy);
  ctx.lineTo(sx, sy + th / 2);
  ctx.lineTo(sx - tw / 2, sy);
  ctx.closePath();
}

function drawClutter(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number, now: number, south: boolean, vacant: boolean, theme = "") {
  ctx.save();
  ctx.lineWidth = 1.5;
  if (h % 7 === 0) {
    ctx.strokeStyle = "#5c5144";
    ctx.beginPath();
    ctx.moveTo(sx - 18, sy + 2);
    ctx.lineTo(sx + 16, sy - 4);
    ctx.stroke();
    ctx.fillStyle = "#8c7049";
    ctx.fillRect(sx + 12, sy - 7, 5, 5);
  } else if (h % 11 === 0) {
    ctx.fillStyle = "#2a241e";
    ctx.fillRect(sx - 8, sy - 3, 12, 7);
    ctx.strokeStyle = "#8c7049";
    ctx.strokeRect(sx - 8, sy - 3, 12, 7);
  } else if (theme === "haven" && h % 6 === 0) {
    ctx.fillStyle = "#3a2e24";
    ctx.fillRect(sx - 8, sy - 2, 14, 5);
    ctx.fillStyle = `rgba(212,168,90,${0.35 + Math.sin(now / 280 + h) * 0.2})`;
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 8, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  if (south && h % 4 === 0) {
    const glow = vacant ? 0.15 + Math.sin(now / 90) * 0.12 : 0.55;
    ctx.fillStyle = vacant ? `rgba(196,92,38,${glow})` : `rgba(212,180,131,${glow})`;
    ctx.beginPath();
    ctx.arc(sx, sy - 8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function sourceSize(image: CanvasImageSource) {
  if (image instanceof HTMLCanvasElement) return { w: image.width, h: image.height };
  if (image instanceof HTMLImageElement) return { w: image.naturalWidth, h: image.naturalHeight };
  return { w: 1, h: 2 };
}

function drawSprite(ctx: CanvasRenderingContext2D, src: string, sx: number, sy: number, height: number, slump = 0) {
  const image = keyedSprite(src);
  ctx.save();
  ctx.translate(sx, sy);
  if (slump) ctx.rotate(slump);
  if (!image) {
    ctx.fillStyle = "#d4b483";
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.45, height * 0.12, height * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const size = sourceSize(image);
  const ratio = size.w / Math.max(1, size.h);
  const dh = height;
  const dw = dh * ratio;
  ctx.drawImage(image, -dw / 2, -dh + 8, dw, dh);
  ctx.restore();
}

function drawCast(ctx: CanvasRenderingContext2D, src: string, sx: number, sy: number, height: number, slump = 0) {
  shadow(ctx, sx, sy + 2, Math.max(7, height * 0.22));
  drawSprite(ctx, src, sx, sy, height, slump);
}

function label(ctx: CanvasRenderingContext2D, sx: number, sy: number, text: string, color: string) {
  ctx.font = "600 11px 'Source Sans 3', sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(16,14,12,0.85)";
  ctx.strokeText(text, sx, sy);
  ctx.fillStyle = color;
  ctx.fillText(text, sx, sy);
}

function shadow(ctx: CanvasRenderingContext2D, sx: number, sy: number, wide = 16) {
  ctx.fillStyle = "rgba(8,6,5,0.45)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 6, wide, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRig(ctx: CanvasRenderingContext2D, kind: string, sx: number, sy: number, now: number, dropped = false, zoom = 1) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(zoom, zoom);
  ctx.lineJoin = "round";
  if (kind === "crane") {
    ctx.strokeStyle = "#8c7049";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-26, 6);
    ctx.lineTo(-18, -52);
    ctx.lineTo(28, -52);
    ctx.lineTo(28, 6);
    ctx.stroke();
    const drop = dropped ? 6 : -18 + Math.sin(now / 500) * 5;
    ctx.strokeStyle = "#c45c26";
    ctx.beginPath();
    ctx.moveTo(10, -52);
    ctx.lineTo(10, drop);
    ctx.stroke();
    ctx.fillStyle = "#2a241e";
    ctx.fillRect(4, drop, 12, 8);
  } else if (kind === "crucible") {
    ctx.fillStyle = "#1b1714";
    ctx.beginPath();
    ctx.moveTo(-18, -8);
    ctx.lineTo(-10, 8);
    ctx.lineTo(10, 8);
    ctx.lineTo(18, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d4b483";
    ctx.stroke();
    ctx.fillStyle = "#c45c26";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, -22, 7, 16 + Math.sin(now / 280) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "grate") {
    ctx.strokeStyle = "#8c7049";
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -8, 36, 16);
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i, 8);
      ctx.stroke();
    }
  } else if (kind === "head" || kind === "hearth") {
    ctx.fillStyle = "#2a241e";
    ctx.fillRect(-16, -10, 32, 18);
    ctx.strokeStyle = "#8c7049";
    ctx.strokeRect(-16, -10, 32, 18);
    ctx.beginPath();
    ctx.arc(0, -1, 6, 0, Math.PI * 2);
    ctx.strokeStyle = dropped ? "#c45c26" : "#d4b483";
    ctx.stroke();
    if (!dropped) {
      ctx.fillStyle = `rgba(196,92,38,${0.35 + Math.sin(now / 180) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(0, -16, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "bar") {
    ctx.strokeStyle = dropped ? "#c45c26" : "#d4b483";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, dropped ? 4 : -8);
    ctx.lineTo(20, dropped ? 4 : -8);
    ctx.stroke();
    ctx.fillStyle = "#5c5144";
    ctx.fillRect(-18, -2, 6, 12);
    ctx.fillRect(12, -2, 6, 12);
  } else if (kind === "jack") {
    const sag = dropped ? 8 + Math.sin(now / 280) * 3 : -6;
    ctx.strokeStyle = "#8c7049";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-14, 10);
    ctx.lineTo(0, sag);
    ctx.lineTo(14, 10);
    ctx.stroke();
    ctx.fillStyle = dropped ? "#c45c26" : "#d4b483";
    ctx.fillRect(-10, sag - 6, 20, 6);
  } else if (kind === "cistern") {
    ctx.fillStyle = "#2a241e";
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8c7049";
    ctx.stroke();
    ctx.fillStyle = "#1b1714";
    ctx.fillRect(-12, -22, 24, 20);
    ctx.strokeRect(-12, -22, 24, 20);
    ctx.fillStyle = dropped ? "#1a1612" : "#6a5340";
    ctx.fillRect(-8, -16, 16, 10);
  } else if (kind === "bellows") {
    ctx.strokeStyle = "#8c7049";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(-8, dropped ? 2 : -16);
    ctx.lineTo(8, 8);
    ctx.lineTo(18, dropped ? 2 : -12);
    ctx.stroke();
    ctx.fillStyle = dropped ? "#c45c26" : "#d4b483";
    ctx.beginPath();
    ctx.arc(0, -20, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "colossus") {
    ctx.scale(1.7, 1.7);
    ctx.fillStyle = "#8a6a48";
    ctx.beginPath();
    ctx.ellipse(0, -16, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c4632";
    ctx.beginPath();
    ctx.moveTo(-14, -28);
    ctx.lineTo(0, -40);
    ctx.lineTo(14, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c4844a";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, -34, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#1b1714";
    ctx.fillRect(-12, -18, 7, 3);
    ctx.fillRect(5, -18, 7, 3);
    ctx.strokeStyle = dropped ? "#c45c26" : "#d4b483";
    ctx.beginPath();
    ctx.arc(0, -2, 8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "orrery") {
    ctx.strokeStyle = dropped ? "#7ec8d0" : "#d4b483";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -14, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -14, 16, 6, now / 800, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#7ec8d0";
    ctx.beginPath();
    ctx.arc(0, -14, 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "plots") {
    ctx.fillStyle = dropped ? "#3a3228" : "#4a5a32";
    ctx.fillRect(-18, -4, 36, 14);
    ctx.strokeStyle = "#8c7049";
    ctx.strokeRect(-18, -4, 36, 14);
    ctx.strokeStyle = dropped ? "#5c5144" : "#d4b483";
    for (let i = -12; i <= 12; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i, 8);
      ctx.stroke();
    }
  } else if (kind === "forge") {
    ctx.fillStyle = "#2a241e";
    ctx.fillRect(-16, -8, 32, 18);
    ctx.strokeStyle = "#8c7049";
    ctx.strokeRect(-16, -8, 32, 18);
    if (!dropped) {
      ctx.fillStyle = `rgba(196,92,38,${0.45 + Math.sin(now / 160) * 0.25})`;
      ctx.fillRect(-6, -18, 12, 12);
    }
  } else if (kind === "chute") {
    ctx.strokeStyle = dropped ? "#c45c26" : "#8c7049";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(0, 8);
    ctx.lineTo(16, -8);
    ctx.stroke();
  } else if (kind === "lamps") {
    ctx.strokeStyle = "#8c7049";
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -16);
    ctx.stroke();
    ctx.fillStyle = dropped ? "#1b1714" : "#d4b483";
    ctx.beginPath();
    ctx.arc(0, -18, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "heart") {
    ctx.strokeStyle = "#d4b483";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -6, 16 + Math.sin(now / 500) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = dropped ? "rgba(196,92,38,0.35)" : "rgba(212,180,131,0.2)";
    ctx.beginPath();
    ctx.arc(0, -6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3ead7";
    ctx.fillRect(-1, -22, 2, 10);
  } else if (kind === "hollow") {
    ctx.strokeStyle = "#8c7049";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = dropped ? "#1b1714" : `rgba(212,180,131,${0.35 + Math.sin(now / 260) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#5c5144";
    ctx.fillRect(-24, -6, 48, 8);
    ctx.fillStyle = "#1b1714";
    ctx.fillRect(-20, 2, 5, 12);
    ctx.fillRect(15, 2, 5, 12);
    ctx.fillStyle = "#d4b483";
    ctx.fillRect(-8, -20, 18, 10);
    ctx.fillStyle = "#c45c26";
    ctx.fillRect(12, -16, 4, 4);
  }
  ctx.restore();
}

function drawSeamMark(ctx: CanvasRenderingContext2D, sx: number, sy: number, mark: ReturnType<typeof seamMark>, now: number) {
  ctx.save();
  ctx.lineWidth = 1.6;
  ctx.translate(sx, sy);
  if (mark === "unread") {
    ctx.strokeStyle = "rgba(212,180,131,0.55)";
    ctx.strokeRect(-3, -3, 6, 6);
  } else if (mark === "stressed") {
    ctx.fillStyle = "#c45c26";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(5, 4);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
  } else if (mark === "severed") {
    ctx.strokeStyle = "#c45c26";
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(4, 4);
    ctx.moveTo(4, -4);
    ctx.lineTo(-4, 4);
    ctx.stroke();
  } else if (mark === "held") {
    ctx.strokeStyle = "#f3ead7";
    ctx.strokeRect(-4, -4, 8, 8);
  } else if (mark === "spent") {
    ctx.strokeStyle = "#c45c26";
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = `rgba(212,180,131,${0.65 + Math.sin(now / 420) * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, sx: number, sy: number, now: number) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.strokeStyle = `rgba(212,180,131,${0.45 + Math.sin(now / 380) * 0.35})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCinder(ctx: CanvasRenderingContext2D, sx: number, sy: number, zoom: number, now: number, calm: boolean) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(zoom, zoom);
  const flap = calm ? 0 : Math.sin(now / 140) * 0.5;
  ctx.fillStyle = "rgba(16,14,12,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d4b483";
  ctx.fillStyle = "rgba(212,180,131,0.35)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-7, -6 + flap * 4, 8, 3.5, -0.6 + flap, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(7, -6 - flap * 4, 8, 3.5, 0.6 - flap, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#8c7049";
  ctx.beginPath();
  ctx.ellipse(0, -2, 3.2, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3ead7";
  ctx.fillRect(-1, -4, 1, 1);
  ctx.fillRect(1, -4, 1, 1);
  ctx.restore();
}

function steamPuff(ctx: CanvasRenderingContext2D, sx: number, sy: number, now: number, tint: string, n = 3) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const t = (now / 700 + i * 0.37) % 1;
    ctx.globalAlpha = (1 - t) * 0.55;
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.ellipse(sx + Math.sin(now / 300 + i) * 4, sy - t * 28 - i * 4, 4 + t * 6, 3 + t * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRemains(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.fillStyle = "rgba(16,14,12,0.7)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + 4, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8c7049";
  ctx.stroke();
}

function weaponDark(a: Actor) {
  return a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n) && (n.revealed || n.severed));
}

function fieldMark(a: Actor) {
  if (!a.alive) return "";
  if (gait(a) === "dead") return "held";
  if (weaponDark(a)) return "dark";
  return "";
}

function drawFeed(ctx: CanvasRenderingContext2D, project: (x: number, y: number) => { sx: number; sy: number }, d: Data, now: number) {
  const live = Boolean(d.flags.sumpOpen || d.flags.pumpFate === "mend" || d.flags.pumpFate === "wren" || d.flags.pumpFate === "speech" || d.flags.pumpFate === "bleed");
  if (!live && !d.flags.pumpFate) return;
  const a = project(14, 7);
  const b = project(19, 4);
  ctx.save();
  ctx.strokeStyle = d.flags.pumpFate === "bleed" ? "rgba(120,72,40,0.8)" : live ? "rgba(212,180,131,0.75)" : "rgba(90,70,48,0.4)";
  ctx.lineWidth = 3;
  ctx.setLineDash(live ? [] : [4, 4]);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy - 10);
  ctx.lineTo(b.sx, b.sy - 8);
  ctx.stroke();
  if (live) steamPuff(ctx, (a.sx + b.sx) / 2, (a.sy + b.sy) / 2, now, "rgba(243,234,215,0.45)", 2);
  ctx.restore();
}

function drawSignature(ctx: CanvasRenderingContext2D, project: (x: number, y: number) => { sx: number; sy: number }, d: Data, now: number) {
  if (!d.flags.checkpointLead) return;
  const p = project(5, 11);
  ctx.save();
  ctx.strokeStyle = d.flags.plateStair ? "rgba(212,180,131,0.9)" : "rgba(196,92,38,0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.sx - 18, p.sy);
  ctx.lineTo(p.sx + 18, p.sy - (d.flags.plateStair ? 10 : 0));
  ctx.stroke();
  ctx.globalAlpha = 0.4 + Math.sin(now / 300) * 0.15;
  ctx.fillStyle = d.flags.plateStair ? "#d4b483" : "#c45c26";
  ctx.beginPath();
  ctx.arc(p.sx, p.sy - 14, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWard(ctx: CanvasRenderingContext2D, project: (x: number, y: number) => { sx: number; sy: number }, d: Data, now: number) {
  const p = project(16, 4);
  const wet = Boolean(d.flags.wardMarket || d.flags.wardClinic);
  ctx.save();
  ctx.strokeStyle = wet ? "rgba(212,180,131,0.7)" : "rgba(90,70,48,0.45)";
  ctx.setLineDash(wet ? [] : [3, 4]);
  ctx.beginPath();
  ctx.moveTo(p.sx, p.sy - 20);
  ctx.lineTo(p.sx - 28, p.sy + 8);
  ctx.moveTo(p.sx, p.sy - 20);
  ctx.lineTo(p.sx + 28, p.sy + 8);
  ctx.stroke();
  if (wet) steamPuff(ctx, p.sx, p.sy - 24, now, d.flags.wardGoods === "brown" ? "rgba(110,72,40,0.6)" : "rgba(243,234,215,0.5)", 2);
  ctx.restore();
}

function drawBurst(ctx: CanvasRenderingContext2D, sx: number, sy: number, kind: string, life: number, seed: number) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, life);
  if (kind === "mend") {
    const r = 6 + life * 22;
    ctx.strokeStyle = "#d4b483";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 16, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(sx, sy - 16, Math.max(2, r * 0.35), r * 0.16, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "snap") {
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 2;
    const span = 18 * (1 - life * 0.35);
    ctx.beginPath();
    ctx.moveTo(sx - span, sy - 26);
    ctx.lineTo(sx + span, sy - 6);
    ctx.moveTo(sx + span * 0.4, sy - 28);
    ctx.lineTo(sx - span * 0.7, sy - 8);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = seed + i * 1.2;
      const dist = (1 - life) * 32;
      ctx.fillStyle = i % 2 ? "#c45c26" : "#f3ead7";
      ctx.fillRect(sx + Math.cos(a) * dist, sy - 16 + Math.sin(a) * dist * 0.45, 3, 2);
    }
  } else {
    const n = kind === "brace" ? 5 : 6;
    for (let i = 0; i < n; i++) {
      const a = seed + (i / n) * Math.PI * 2;
      const dist = (1 - life) * (kind === "brace" ? 18 : 28);
      ctx.fillStyle = kind === "steam" ? "#f3ead7" : "#d4b483";
      ctx.beginPath();
      ctx.arc(sx + Math.cos(a) * dist, sy - 20 + Math.sin(a) * dist * 0.6, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawIntent(ctx: CanvasRenderingContext2D, d: Data, project: (x: number, y: number) => { sx: number; sy: number }, now: number) {
  const plans = d.combat?.plans;
  if (!plans) return;
  for (const [id, plan] of Object.entries(plans)) {
    const a = d.actors[id];
    if (!a?.alive || a.mapId !== d.mapId) continue;
    const prey = plan.target === "player" ? d.player : d.actors[plan.target];
    if (!prey) continue;
    const from = project(a.x, a.y);
    const to = project(prey.x, prey.y);
    const armed = plan.kind === "strike" || plan.kind === "close" || (plan.kind === "cut" && plan.thenStrike);
    ctx.save();
    ctx.setLineDash(armed ? [] : [5, 5]);
    ctx.strokeStyle = armed ? "rgba(212,180,131,0.75)" : "rgba(168,152,128,0.35)";
    ctx.lineWidth = armed ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(from.sx, from.sy - 48);
    ctx.lineTo(to.sx + Math.sin(now / 200) * 0, to.sy - 24);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSeen(ctx: CanvasRenderingContext2D, d: Data, project: (x: number, y: number) => { sx: number; sy: number }, now: number) {
  if (d.panel !== "audit" || !d.audit) return;
  const target = d.audit.kind === "actor" ? (d.audit.id === "player" ? d.player : d.actors[d.audit.id]) : d.machines[d.audit.id];
  if (!target || ("mapId" in target && target.mapId !== d.mapId)) return;
  const nodes = target.nodes;
  const selected = nodes.find((n) => n.id === d.uiNode);
  const dead = Boolean(selected?.revealed && !nodeLive(nodes, selected));
  const flow = Boolean(selected && selected.effect === "flow" && selected.revealed && !dead);
  const p = project(target.x, target.y);
  const beat = 0.55 + Math.sin(now / (dead ? 160 : flow ? 420 : 700)) * 0.35;
  ctx.save();
  ctx.setLineDash(dead ? [4, 4] : []);
  ctx.strokeStyle = dead ? `rgba(196,92,38,${beat})` : flow ? `rgba(212,180,131,${beat})` : "rgba(243,234,215,0.9)";
  ctx.lineWidth = dead ? 2 : 1.5;
  ctx.beginPath();
  ctx.ellipse(p.sx, p.sy + 8, 26, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = useGame((s) => s.data);
  const dataRef = useRef(data);
  dataRef.current = data;
  const clickTile = useGame((s) => s.clickTile);
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    let raf = 0;
    const motes = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.3 + Math.random(),
      kind: i % 5 === 0 ? "drip" : "ash",
    }));
    const frame = (now: number) => {
      const d = dataRef.current;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const bw = Math.floor(w * dpr);
      const bh = Math.floor(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || !d) {
        raf = requestAnimationFrame(frame);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#0c0a08");
      sky.addColorStop(1, "#050403");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const map = MAPS[d.mapId];
      if (!map) {
        raf = requestAnimationFrame(frame);
        return;
      }
      deck.w = map.width;
      deck.h = map.height;
      layoutStage(ctx, w, h, d.player.x, d.player.y, d.mapId);
      const pumpFate = String(d.flags.pumpFate ?? "");
      const pumpLit = pumpFate === "mend" || pumpFate === "wren" || pumpFate === "speech" || pumpFate === "flood";
      if (stageNow().plate && d.mapId === "sinks" && pumpLit) {
        ctx.fillStyle = "rgba(210,140,60,0.08)";
        ctx.fillRect(0, 0, w, h);
      }
      const vacant = d.mapId === "sinks" && d.flags.checkpointLead === "vacant";
      const calm = Boolean(d.flags.reduceMotion);
      const jx = calm ? 0 : (Math.random() - 0.5) * shake;
      const jy = calm ? 0 : (Math.random() - 0.5) * shake;
      ctx.save();
      ctx.translate(jx, jy);
      const zoom = Math.max(1, d.zoom ?? 1);
      const project = (x: number, y: number) => projectTile(w, h, d.player.x, d.player.y, x, y, zoom, TW, TH);
      const playerH = stageNow().plate ? Math.max(30, Math.min(40, h * 0.12)) : Math.max(84, Math.min(118, TH * 2.7 * zoom));
      const jobs: { z: number; run: () => void }[] = [];
      const tags: { z: number; run: () => void }[] = [];
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const p = project(x, y);
          if (p.sx < -TW * zoom || p.sx > w + TW * zoom || p.sy < -WALL * 2 || p.sy > h + TH * zoom) continue;
          const ch = tileAt(map, x, y);
          if (ch === "#") continue;
          const shut = ch === "+" && LOCKED_DOORS.some((door) => door.map === d.mapId && door.x === x && door.y === y && !d.flags[door.flag]);
          const mouth = MOUTHS.some((m) => m.map === d.mapId && m.x === x && m.y === y);
          if (stageNow().plate) {
            const near = Math.abs(x - d.player.x) + Math.abs(y - d.player.y) <= 4;
            if (near && (mouth || shut)) {
              jobs.push({
                z: (x + y) * 10,
                run: () => drawChevron(ctx, p.sx, p.sy, shut),
              });
            }
          } else {
            const rimR = isPlate(ch) && !isPlate(tileAt(map, x + 1, y));
            const rimD = isPlate(ch) && !isPlate(tileAt(map, x, y + 1));
            jobs.push({ z: (x + y) * 10, run: () => drawTile(ctx, p.sx, p.sy, ch, x, y, now, map.theme, vacant, false, shut, zoom, rimR, rimD) });
            if (mouth) jobs.push({ z: (x + y) * 10 + 1, run: () => drawMouth(ctx, p.sx, p.sy - 8, now) });
            if (ch === "~") {
              jobs.push({
                z: (x + y) * 10 + 3,
                run: () => steamPuff(ctx, p.sx, p.sy, now + x * 40, "rgba(168,152,128,0.7)", 2),
              });
            }
          }
        }
      }
      if (!stageNow().plate && d.mapId === "sinks") {
        jobs.push({ z: (17 + 7) * 10 + 1, run: () => drawFeed(ctx, project, d, now) });
        jobs.push({ z: (5 + 11) * 10 + 1, run: () => drawSignature(ctx, project, d, now) });
      }
      if (!stageNow().plate && d.mapId === "haven") {
        jobs.push({ z: (16 + 4) * 10 + 1, run: () => drawWard(ctx, project, d, now) });
      }
      for (const m of Object.values(d.machines)) {
        if (m.mapId !== d.mapId) continue;
        const p = project(m.x, m.y);
        const footing = m.nodes.find((n) => n.id === "footing" || n.id === "sign" || n.id === "feed" || n.id === "main" || n.id === "haul" || n.id === "inlet" || n.id === "ore" || n.id === "lip");
        const structural = footing ? !nodeLive(m.nodes, footing) : false;
        const down = m.nodes.some((n) => n.spent) || (m.id === "pump" && (pumpFate === "lockout" || pumpFate === "bleed")) || structural;
        const running = m.id === "pump" && (pumpFate === "mend" || pumpFate === "wren" || pumpFate === "speech" || pumpFate === "flood");
        const nearMachine = Math.abs(m.x - d.player.x) + Math.abs(m.y - d.player.y);
        jobs.push({
          z: (m.x + m.y) * 10 + 4,
          run: () => {
            if (stageNow().plate) {
              if (m.id === "pump" && running) steamPuff(ctx, p.sx + 8, p.sy - 28, now, pumpFate === "flood" ? "rgba(196,92,38,0.55)" : "rgba(243,234,215,0.75)", 3);
              if (m.id === "pump" && pumpFate === "bleed") steamPuff(ctx, p.sx, p.sy - 8, now, "rgba(90,60,36,0.7)", 2);
              return;
            }
            shadow(ctx, p.sx, p.sy, 22 * zoom);
            if (m.template === "pump") drawSprite(ctx, m.sprite, p.sx, p.sy, 108 * zoom);
            else drawRig(ctx, m.template, p.sx, p.sy, now, down, zoom);
            drawSeamMark(ctx, p.sx + 16 * zoom, p.sy - 46 * zoom, seamMark(m.nodes), now);
            if (m.id === "pump" && running) steamPuff(ctx, p.sx + 8, p.sy - 20, now, pumpFate === "flood" ? "rgba(196,92,38,0.55)" : "rgba(243,234,215,0.75)", 3);
            if (m.id === "pump" && pumpFate === "bleed") steamPuff(ctx, p.sx, p.sy + 4, now, "rgba(90,60,36,0.7)", 2);
            if (m.id === "cistern" && !down) steamPuff(ctx, p.sx, p.sy - 18, now, pumpFate === "bleed" ? "rgba(110,72,40,0.65)" : "rgba(243,234,215,0.55)", 2);
            if ((m.id === "head" || m.id === "hearth") && !down) steamPuff(ctx, p.sx, p.sy - 16, now, "rgba(243,234,215,0.7)", 2);
            if (m.id === "hollow" && !down) steamPuff(ctx, p.sx, p.sy - 10, now, "rgba(212,180,131,0.45)", 2);
            if (nearMachine <= 2 || (m.id === "pump" && !pumpFate)) {
              tags.push({
                z: (m.x + m.y) * 10 + 8,
                run: () => label(ctx, p.sx, p.sy + 26, m.name, down ? "#c45c26" : "#d4b483"),
              });
            }
          },
        });
      }
      for (const a of Object.values(d.actors)) {
        if (a.mapId !== d.mapId) continue;
        const p = project(a.x, a.y);
        if (!a.alive) {
          const nearDead = Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 5;
          if (!stageNow().plate || nearDead) jobs.push({ z: (a.x + a.y) * 10 + 2, run: () => drawRemains(ctx, p.sx, p.sy) });
          continue;
        }
        const dist = Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y);
        const fade = presence(p.sx, p.sy);
        if (stageNow().plate && fade <= 0.04) continue;
        const body = playerH * (a.scale || 1) * 0.92;
        jobs.push({
          z: (a.x + a.y) * 10 + 5,
          run: () => {
            const still = gait(a) === "dead";
            const dark = weaponDark(a);
            const bob = still || dark || Boolean(d.flags.reduceMotion) ? 0 : Math.sin(now / 420 + a.x) * 1.4;
            ctx.save();
            ctx.globalAlpha = fade;
            if (stageNow().plate) {
              drawCast(ctx, a.sprite, p.sx, p.sy + bob, body, dark ? 0.04 : 0);
            } else {
              shadow(ctx, p.sx, p.sy, 18 * zoom);
              if (a.template === "cinder") {
                const restless = d.flags.bellowsLive === false || Boolean(d.flags.roadDark && !d.flags.cinderDarkOk);
                const calmBeast = Boolean(d.flags.reduceMotion) || (!restless && Boolean(d.flags.foodLive));
                drawCinder(ctx, p.sx, p.sy + bob, zoom, now, calmBeast);
              } else drawSprite(ctx, a.sprite, p.sx, p.sy + bob, body, dark ? 0.04 : 0);
            }
            if (!stageNow().plate && a.nodes.some((n) => n.revealed)) drawSeamMark(ctx, p.sx + 14 * zoom, p.sy - body + 10, seamMark(a.nodes), now);
            if (dark) steamPuff(ctx, p.sx + 10, p.sy - body * 0.45, now, "rgba(168,152,128,0.65)", 2);
            const mark = fieldMark(a);
            if (mark && d.combat) tags.push({ z: (a.x + a.y) * 10 + 9, run: () => label(ctx, p.sx, p.sy - body + 6, mark, "#c45c26") });
            if (!stageNow().plate && (a.hostile || dist <= 2)) {
              tags.push({
                z: (a.x + a.y) * 10 + 9,
                run: () => label(ctx, p.sx, stageNow().plate ? p.sy - body - 4 : p.sy + 18, a.name, a.hostile ? "#c45c26" : "#f3ead7"),
              });
            }
            ctx.restore();
          },
        });
      }
      const pp = project(d.player.x, d.player.y);
      const playerBody = stageNow().plate ? playerH : 156 * zoom;
      jobs.push({
        z: (d.player.x + d.player.y) * 10 + 6,
        run: () => {
          const still = gait(d.player) === "dead";
          const dark = weaponDark(d.player);
          const walking = d.path.length > 0 && !still && !d.flags.reduceMotion;
          const bob = walking ? Math.sin(now / 160) * 2.4 : still || d.flags.reduceMotion ? 0 : Math.sin(now / 380) * 1.6;
          const lean = walking ? Math.sin(now / 160) * 2.2 : 0;
          if (stageNow().plate) drawCast(ctx, d.player.sprite, pp.sx + lean, pp.sy + bob, playerBody, dark ? 0.03 : 0);
          else {
            shadow(ctx, pp.sx, pp.sy, 20 * zoom);
            drawSprite(ctx, d.player.sprite, pp.sx + lean, pp.sy + bob, playerBody, dark ? 0.03 : 0);
          }
          if (d.player.guarding) {
            ctx.strokeStyle = "rgba(212,180,131,0.8)";
            ctx.strokeRect(pp.sx - 22 * zoom, pp.sy - playerBody * 0.72, 44 * zoom, playerBody * 0.5);
          }
          const mark = fieldMark(d.player);
          if (mark && d.combat) tags.push({ z: 9990, run: () => label(ctx, pp.sx, pp.sy - playerBody + 8, mark, "#c45c26") });
        },
      });
      jobs.sort((a, b) => a.z - b.z);
      for (const job of jobs) job.run();
      tags.sort((a, b) => a.z - b.z);
      for (const tag of tags) tag.run();
      drawIntent(ctx, d, project, now);
      drawSeen(ctx, d, project, now);
      ctx.fillStyle = "rgba(212,180,131,0.9)";
      for (const step of d.path) {
        const p = project(step.x, step.y);
        ctx.beginPath();
        ctx.ellipse(p.sx, p.sy, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const spark of bursts) {
        const p = project(spark.x, spark.y);
        drawBurst(ctx, p.sx, p.sy, spark.kind, spark.life, spark.seed);
      }
      for (const f of floaters) {
        const p = project(f.x, f.y);
        ctx.globalAlpha = Math.max(0, f.life) * 0.9;
        ctx.fillStyle = f.color;
        ctx.font = "700 13px 'Source Sans 3', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(f.text, p.sx, p.sy - playerBody * 0.55 - (1 - f.life) * 18);
        ctx.globalAlpha = 1;
      }
      if (d.mapId === "road" && d.flags.roadDark) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(-40, -40, w + 80, h + 80);
      }
      const vignette = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.2, w / 2, h * 0.48, Math.max(w, h) * 0.72);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, stageNow().plate ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.22)");
      ctx.fillStyle = vignette;
      ctx.fillRect(-20, -20, w + 40, h + 40);
      ctx.restore();
      if (!d.flags.reduceMotion) {
        const weather =
          d.mapId === "sinks"
            ? "drip"
            : d.mapId === "tundra"
              ? "ice"
              : d.mapId === "rust"
                ? d.flags.tenementWarm || d.flags.guildWarm
                  ? "spark"
                  : "ash"
                : d.mapId === "spire"
                  ? "wrong"
                  : d.mapId === "quarry"
                    ? "grit"
                    : d.mapId === "haven"
                      ? d.flags.foodLive
                        ? "seed"
                        : "dust"
                      : d.mapId === "road" && d.flags.roadDark
                        ? "none"
                        : "ash";
        if (weather !== "none") {
          for (const mote of motes) {
            if (weather === "ice") {
              mote.x += 0.00055 * mote.s;
              if (mote.x > 1) mote.x = 0;
            } else {
              mote.y -= (weather === "wrong" ? 0.00025 : 0.0008) * mote.s;
              if (mote.y < 0) mote.y = 1;
            }
            const tint =
              weather === "drip"
                ? "#8c7049"
                : weather === "ice"
                  ? "#d7e6ea"
                  : weather === "spark"
                    ? "#c45c26"
                    : weather === "seed"
                      ? "#8a9a62"
                      : weather === "wrong"
                        ? "#c45c26"
                        : "#d4b483";
            ctx.globalAlpha = stageNow().plate ? 0.16 : weather === "wrong" ? 0.22 : 0.35;
            ctx.fillStyle = tint;
            const tall = weather === "drip" || weather === "grit";
            ctx.fillRect(mote.x * w, mote.y * h, weather === "spark" ? 2.2 : 1.3, tall ? 7 : weather === "ice" ? 1.4 : 4);
            ctx.globalAlpha = 1;
          }
        }
      }
      decayFx(1 / 60);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onPointer = (ev: PointerEvent) => {
      const d = dataRef.current;
      if (!d) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      const map = MAPS[d.mapId];
      if (!map) return;
      const zoom = Math.max(1, d.zoom ?? 1);
      const plate = stageNow().plate;
      const hitX = plate ? Math.max(12, stageNow().step.x) : (TW / 2) * zoom;
      const hitY = plate ? Math.max(7, stageNow().step.y) : (TH / 2) * zoom;
      if (plate) {
        const body: { hit: { x: number; y: number; dd: number } | null } = { hit: null };
        const consider = (x: number, y: number, tall: number) => {
          const p = projectTile(rect.width, rect.height, d.player.x, d.player.y, x, y, zoom, TW, TH);
          if (presence(p.sx, p.sy) < 0.2) return;
          const dx = (mx - p.sx) / (hitX * 0.85);
          const dy = (my - (p.sy - tall * 0.42)) / (tall * 0.48);
          if (dx * dx + dy * dy > 1) return;
          const dd = (mx - p.sx) ** 2 + (my - p.sy) ** 2;
          if (!body.hit || dd < body.hit.dd) body.hit = { x, y, dd };
        };
        for (const a of Object.values(d.actors)) {
          if (!a.alive || a.mapId !== d.mapId) continue;
          consider(a.x, a.y, 40);
        }
        for (const m of Object.values(d.machines)) {
          if (m.mapId !== d.mapId) continue;
          consider(m.x, m.y, 36);
        }
        if (body.hit) {
          clickTile(body.hit.x, body.hit.y);
          return;
        }
      }
      let best: { x: number; y: number; dd: number; stand: boolean } | null = null;
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const p = projectTile(rect.width, rect.height, d.player.x, d.player.y, x, y, zoom, TW, TH);
          const near = Math.max(Math.abs(x - d.player.x), Math.abs(y - d.player.y));
          if (plate && (near > 9 || presence(p.sx, p.sy) < 0.25)) continue;
          const stand = walkable(d, x, y, "player");
          if (plate && !stand) continue;
          const nx = Math.abs(mx - p.sx) / hitX;
          const ny = Math.abs(my - p.sy) / hitY;
          if (nx + ny > (plate ? 2.2 : 1.15)) continue;
          const dd = (p.sx - mx) ** 2 + (p.sy - my) ** 2;
          if (!best || (stand && !best.stand) || (stand === best.stand && dd < best.dd)) best = { x, y, dd, stand };
        }
      }
      if (best) clickTile(best.x, best.y);
    };
    canvas.addEventListener("pointerdown", onPointer);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, [clickTile]);
  return <canvas ref={canvasRef} className="h-full w-full touch-none" aria-label="The city, isometric" />;
}
