export interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export type BurstKind = "snap" | "mend" | "steam" | "brace";

export interface Burst {
  x: number;
  y: number;
  kind: BurstKind;
  life: number;
  seed: number;
}

export const floaters: Floater[] = [];
export const bursts: Burst[] = [];
export let shake = 0;

export function floatText(x: number, y: number, text: string, color = "#f3ead7") {
  floaters.push({ x, y, text, color, life: 1 });
  if (floaters.length > 24) floaters.shift();
}

export function burst(x: number, y: number, kind: BurstKind) {
  bursts.push({ x, y, kind, life: 1, seed: Math.random() * Math.PI * 2 });
  if (bursts.length > 18) bursts.shift();
}

export function bump(n = 7) {
  shake = Math.max(shake, n);
}

export function decayFx(dt: number) {
  shake = Math.max(0, shake - dt * 18);
  for (const f of floaters) f.life -= dt;
  for (let i = floaters.length - 1; i >= 0; i--) if (floaters[i].life <= 0) floaters.splice(i, 1);
  for (const b of bursts) b.life -= dt * 0.85;
  for (let i = bursts.length - 1; i >= 0; i--) if (bursts[i].life <= 0) bursts.splice(i, 1);
}
