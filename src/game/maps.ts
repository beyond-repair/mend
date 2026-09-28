import type { GameMap } from "./types";

function grid(w: number, h: number, fill = "."): string[][] {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  for (let x = 0; x < w; x++) {
    g[0][x] = "#";
    g[h - 1][x] = "#";
  }
  for (let y = 0; y < h; y++) {
    g[y][0] = "#";
    g[y][w - 1] = "#";
  }
  return g;
}

function fill(g: string[][], x0: number, y0: number, x1: number, y1: number, ch: string) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch;
}

function vwall(g: string[][], x: number, y0: number, y1: number) {
  for (let y = y0; y <= y1; y++) g[y][x] = "#";
}

function hwall(g: string[][], y: number, x0: number, x1: number) {
  for (let x = x0; x <= x1; x++) g[y][x] = "#";
}

function finish(id: string, name: string, act: string, g: string[][], entry: { x: number; y: number }, theme: GameMap["theme"]): GameMap {
  return {
    id,
    name,
    act,
    width: g[0].length,
    height: g.length,
    rows: g.map((r) => r.join("")),
    entry,
    theme,
  };
}

function grow(base: string[][], w: number, h: number): string[][] {
  const g = grid(w, h, "#");
  for (let y = 0; y < base.length; y++) for (let x = 0; x < base[0].length; x++) g[y][x] = base[y][x];
  for (let x = 0; x < w; x++) {
    g[0][x] = "#";
    g[h - 1][x] = "#";
  }
  for (let y = 0; y < h; y++) {
    g[y][0] = "#";
    g[y][w - 1] = "#";
  }
  return g;
}

function sinks(): GameMap {
  const g = grid(22, 16);
  vwall(g, 9, 1, 9);
  g[5][9] = "+";
  hwall(g, 11, 1, 20);
  g[11][14] = "+";
  g[11][5] = "+";
  fill(g, 15, 6, 19, 9, "~");
  g[7][16] = "=";
  g[8][16] = "=";
  g[8][4] = "^";
  g[13][16] = "%";
  g[3][13] = "%";
  g[6][19] = "+";
  g[5][20] = "#";
  g[9][20] = "#";
  const wide = grow(g, 32, 16);
  fill(wide, 22, 2, 30, 7, ".");
  wide[3][21] = ".";
  wide[4][21] = ".";
  wide[5][21] = ".";
  wide[6][24] = "^";
  wide[6][28] = "%";
  const deep = grow(wide, 32, 24);
  deep[15][16] = ".";
  deep[15][17] = ".";
  deep[15][18] = ".";
  fill(deep, 14, 16, 22, 21, ".");
  deep[18][23] = ".";
  deep[18][24] = ".";
  deep[18][25] = ".";
  deep[19][16] = "^";
  deep[20][20] = "%";
  return finish("sinks", "The Sinks", "Act I", deep, { x: 3, y: 3 }, "sinks");
}

function quarry(): GameMap {
  const g = grid(20, 14);
  fill(g, 2, 2, 5, 4, "%");
  g[3][4] = ".";
  fill(g, 14, 9, 17, 11, "%");
  g[2][8] = "^";
  g[3][10] = "^";
  g[6][6] = "!";
  g[12][6] = "!";
  g[10][2] = "^";
  const wide = grow(g, 32, 14);
  fill(wide, 20, 3, 30, 10, ".");
  wide[5][19] = ".";
  wide[6][19] = ".";
  wide[7][19] = ".";
  wide[8][23] = "^";
  wide[4][24] = "%";
  const tall = grow(wide, 32, 22);
  tall[13][9] = ".";
  tall[13][10] = ".";
  tall[13][11] = ".";
  fill(tall, 4, 14, 24, 20, ".");
  tall[16][6] = "%";
  tall[18][18] = "^";
  tall[15][16] = "=";
  const east = grow(tall, 36, 22);
  east[8][31] = ".";
  east[8][32] = ".";
  east[8][33] = ".";
  east[7][32] = "%";
  return finish("quarry", "Abandoned Quarry", "Act III", east, { x: 10, y: 12 }, "quarry");
}

function rust(): GameMap {
  const g = grid(20, 14);
  hwall(g, 4, 11, 18);
  hwall(g, 9, 11, 18);
  vwall(g, 11, 4, 9);
  vwall(g, 18, 4, 9);
  g[6][11] = "+";
  g[7][3] = "^";
  g[12][11] = "%";
  const wide = grow(g, 36, 22);
  wide[6][18] = ".";
  wide[6][19] = ".";
  fill(wide, 20, 4, 33, 11, ".");
  wide[8][24] = "=";
  wide[10][30] = "^";
  wide[13][6] = ".";
  wide[13][7] = ".";
  fill(wide, 3, 14, 14, 19, ".");
  wide[16][8] = "%";
  wide[18][5] = "^";
  wide[8][34] = ".";
  return finish("rust", "Rust Districts", "Act III", wide, { x: 4, y: 12 }, "rust");
}

function citadel(): GameMap {
  const g = grid(22, 16, "p");
  for (let x = 0; x < 22; x++) {
    g[0][x] = "#";
    g[15][x] = "#";
  }
  for (let y = 0; y < 16; y++) {
    g[y][0] = "#";
    g[y][21] = "#";
  }
  vwall(g, 6, 1, 13);
  g[8][6] = "+";
  fill(g, 10, 6, 13, 9, "p");
  g[4][16] = "^";
  g[12][18] = "^";
  const wide = grow(g, 32, 16);
  fill(wide, 22, 5, 30, 12, "p");
  wide[7][21] = "p";
  wide[8][21] = "p";
  wide[9][21] = "p";
  wide[6][24] = "^";
  const tall = grow(wide, 32, 22);
  tall[15][22] = "p";
  tall[15][23] = "p";
  tall[15][24] = "p";
  fill(tall, 18, 16, 30, 20, "p");
  tall[18][20] = "^";
  const east = grow(tall, 36, 22);
  east[18][31] = "p";
  east[18][32] = "p";
  east[18][33] = "p";
  return finish("citadel", "High Citadel", "Act V", east, { x: 18, y: 13 }, "citadel");
}

function spire(): GameMap {
  const g = grid(16, 14, "v");
  for (let x = 0; x < 16; x++) {
    g[0][x] = "#";
    g[13][x] = "#";
  }
  for (let y = 0; y < 14; y++) {
    g[y][0] = "#";
    g[y][15] = "#";
  }
  g[3][3] = "#";
  g[3][12] = "#";
  g[9][3] = "#";
  g[9][12] = "#";
  g[5][8] = "^";
  g[7][5] = "^";
  const wide = grow(g, 28, 22);
  wide[7][15] = "v";
  fill(wide, 16, 4, 24, 12, "v");
  wide[8][25] = "v";
  wide[8][26] = "v";
  wide[6][20] = "^";
  wide[13][8] = "v";
  fill(wide, 5, 14, 14, 20, "v");
  wide[16][8] = "^";
  wide[18][11] = "^";
  return finish("spire", "The Void Spire", "Act VI", wide, { x: 8, y: 11 }, "spire");
}

function road(): GameMap {
  const g = grid(12, 8);
  g[3][2] = "%";
  g[4][9] = "%";
  g[2][6] = "^";
  const wide = grow(g, 36, 18);
  wide[3][11] = ".";
  wide[4][11] = ".";
  wide[5][11] = ".";
  fill(wide, 12, 3, 33, 6, ".");
  wide[4][16] = "^";
  wide[4][24] = "^";
  wide[5][30] = "%";
  wide[7][6] = ".";
  wide[8][6] = ".";
  fill(wide, 4, 9, 33, 14, ".");
  wide[11][8] = "%";
  wide[12][20] = "^";
  wide[10][28] = "=";
  fill(wide, 18, 1, 22, 2, ".");
  wide[3][20] = ".";
  wide[4][34] = ".";
  wide[6][34] = ".";
  wide[7][2] = ".";
  wide[7][3] = ".";
  wide[15][8] = ".";
  wide[15][28] = ".";
  return finish("road", "The Stack Road", "Act II", wide, { x: 3, y: 4 }, "road");
}

function haven(): GameMap {
  const g = grid(20, 14);
  fill(g, 2, 2, 5, 3, "%");
  g[2][8] = "^";
  g[2][12] = "^";
  g[6][3] = "^";
  fill(g, 2, 8, 4, 9, "%");
  g[8][9] = "%";
  g[9][16] = "%";
  g[10][16] = "%";
  g[4][14] = "=";
  g[4][15] = "=";
  g[5][16] = "=";
  g[11][6] = "^";
  const wide = grow(g, 36, 22);
  wide[4][19] = ".";
  wide[5][19] = ".";
  fill(wide, 20, 2, 33, 9, ".");
  wide[4][24] = "=";
  wide[4][25] = "=";
  wide[6][30] = "^";
  fill(wide, 26, 3, 31, 7, ",");
  wide[13][10] = ".";
  wide[13][11] = ".";
  fill(wide, 6, 14, 20, 15, ".");
  hwall(wide, 16, 4, 14);
  vwall(wide, 4, 16, 19);
  vwall(wide, 12, 16, 19);
  wide[16][8] = "+";
  fill(wide, 5, 17, 11, 19, ".");
  wide[18][7] = "%";
  wide[6][34] = ".";
  return finish("haven", "Oakhaven Lower Ward", "Act I", wide, { x: 10, y: 12 }, "haven");
}

function tundra(): GameMap {
  const g = grid(28, 12);
  vwall(g, 1, 1, 10);
  vwall(g, 2, 1, 10);
  g[5][2] = ".";
  vwall(g, 26, 1, 10);
  g[5][26] = ".";
  g[5][10] = "!";
  g[5][11] = "!";
  g[5][16] = "!";
  g[5][17] = "!";
  g[4][14] = "^";
  g[7][20] = "%";
  g[6][8] = "^";
  const tall = grow(g, 28, 18);
  tall[11][10] = ".";
  tall[11][11] = ".";
  tall[11][14] = ".";
  fill(tall, 6, 12, 22, 16, ".");
  tall[14][16] = "%";
  return finish("tundra", "The Brass Tundra", "Act IV", tall, { x: 4, y: 5 }, "citadel");
}

export const MAPS: Record<string, GameMap> = {
  sinks: sinks(),
  haven: haven(),
  quarry: quarry(),
  rust: rust(),
  road: road(),
  tundra: tundra(),
  citadel: citadel(),
  spire: spire(),
};

export interface Mouth {
  map: string;
  x: number;
  y: number;
  to: string;
  tx: number;
  ty: number;
  need: string | null;
  /** This step enters a road the lamps can darken. */
  dark?: boolean;
  deny: string;
}

export const MOUTHS: Mouth[] = [
  { map: "sinks", x: 25, y: 18, to: "road", tx: 5, ty: 5, need: null, deny: "The stack mouth is shut." },
  { map: "road", x: 2, y: 7, to: "sinks", tx: 24, ty: 18, need: null, deny: "The Sinks mouth is shut." },
  { map: "road", x: 20, y: 1, to: "haven", tx: 33, ty: 6, need: null, deny: "The ward stair is shut." },
  { map: "haven", x: 34, y: 6, to: "road", tx: 20, ty: 3, need: null, deny: "The stack mouth is shut." },
  { map: "road", x: 34, y: 4, to: "quarry", tx: 32, ty: 8, need: "act1", deny: "The quarry road wants a signed stair, or a crawl you already used." },
  { map: "quarry", x: 33, y: 8, to: "road", tx: 33, ty: 4, need: null, deny: "The stack mouth is shut." },
  { map: "road", x: 34, y: 6, to: "rust", tx: 33, ty: 8, need: "act1", deny: "Rust is past the same signature the quarry wanted." },
  { map: "rust", x: 34, y: 8, to: "road", tx: 33, ty: 6, need: null, deny: "The stack mouth is shut." },
  { map: "road", x: 8, y: 15, to: "tundra", tx: 4, ty: 5, need: "citadelOpen", dark: true, deny: "The tundra walk stays sealed until the citadel is actually in play." },
  { map: "tundra", x: 2, y: 5, to: "road", tx: 8, ty: 14, need: null, deny: "The stack mouth is shut." },
  { map: "tundra", x: 26, y: 5, to: "citadel", tx: 32, ty: 18, need: null, deny: "The ranking stair is shut." },
  { map: "citadel", x: 33, y: 18, to: "tundra", tx: 24, ty: 5, need: null, deny: "The tundra stair is shut." },
  { map: "road", x: 28, y: 15, to: "spire", tx: 24, ty: 8, need: "spireOpen", dark: true, deny: "The Spire has no mouth until the citadel has been answered." },
  { map: "spire", x: 26, y: 8, to: "road", tx: 28, ty: 14, need: null, deny: "The stack mouth is shut." },
];

export function mouthAt(mapId: string, x: number, y: number) {
  return MOUTHS.find((m) => m.map === mapId && m.x === x && m.y === y) ?? null;
}

export const EXITS: { map: string; x: number; y: number }[] = MOUTHS.map((m) => ({ map: m.map, x: m.x, y: m.y }));

export const LOCKED_DOORS: { map: string; x: number; y: number; flag: string; convo: string }[] = [
  { map: "sinks", x: 5, y: 11, flag: "plateStair", convo: "plate-stair" },
  { map: "sinks", x: 19, y: 6, flag: "sumpOpen", convo: "sump-door" },
  { map: "citadel", x: 6, y: 8, flag: "shaftOpen", convo: "shaft-door" },
  { map: "haven", x: 8, y: 16, flag: "ashAccess", convo: "ash-cut" },
];

for (const m of Object.values(MAPS)) {
  if (m.rows.length !== m.height) throw new Error(`${m.id} height`);
  for (const row of m.rows) {
    if (row.length !== m.width) throw new Error(`${m.id} width ${row.length}`);
  }
}

export function tileAt(map: GameMap, x: number, y: number) {
  if (x < 0 || y < 0 || y >= map.height || x >= map.width) return "#";
  return map.rows[y][x];
}

export const WALKABLE = new Set([".", ",", "+", "=", "^", "!", "p", "v"]);

export const REGIONS: { id: string; name: string; act: string; blurb: string; need: string | null }[] = [
  { id: "sinks", name: "The Sinks", act: "Act I", blurb: "Reclamation under the stacks. The south cut is a mouth onto the road, not a menu.", need: null },
  { id: "haven", name: "Oakhaven Lower Ward", act: "Act I", blurb: "Stalls, a clinic, and plots that drink from the Sinks. Come back. The pipes will have changed.", need: null },
  { id: "quarry", name: "Abandoned Quarry", act: "Act III", blurb: "Stone, a crane, a colossus, and a rigger the count lost. The east cut returns to the road.", need: "act1" },
  { id: "rust", name: "Rust Districts", act: "Act III", blurb: "Forge, tenements, guild heat. Stock is a grandchild of the quarry and the Sinks.", need: "act1" },
  { id: "citadel", name: "High Citadel", act: "Act V", blurb: "Reached on foot across the tundra. Lamps, siphon, orrery, rank. Not merely a taller room.", need: "citadelOpen" },
  { id: "spire", name: "Void Spire", act: "Act VI", blurb: "No recoverable baseline. The question is whether holding the city together is the problem.", need: "spireOpen" },
];
