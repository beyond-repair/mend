import type { Attr, Attrs, SkillId } from "./types";

export const ATTR_LIST: { id: Attr; name: string; blurb: string }[] = [
  { id: "body", name: "Body", blurb: "Force, blood, and how much iron you can haul." },
  { id: "finesse", name: "Finesse", blurb: "Hands, aim, and the step that does not ring." },
  { id: "mind", name: "Mind", blurb: "How much structure you can hold at once." },
  { id: "will", name: "Will", blurb: "Focus when the diagram starts to burn." },
  { id: "presence", name: "Presence", blurb: "Whether a room decides to believe you." },
  { id: "perception", name: "Perception", blurb: "The crack before the wall admits it." },
];

export const SKILL_LIST: { id: SkillId; name: string; blurb: string }[] = [
  { id: "engineering", name: "Engineering", blurb: "Boilers, valves, and load paths." },
  { id: "medicine", name: "Medicine", blurb: "Bodies as systems that can be relinked." },
  { id: "science", name: "Science", blurb: "The Bureau's diagrams, and the older ones." },
  { id: "audit", name: "Audit", blurb: "Reading a thing as the relationships that hold it." },
  { id: "survival", name: "Survival", blurb: "Smoke, slag, weather, and empty districts." },
  { id: "mechanics", name: "Mechanics", blurb: "Weapons, locks of gear, and scavenged frames." },
  { id: "speech", name: "Speech", blurb: "Saying the sentence that moves a person." },
  { id: "barter", name: "Barter", blurb: "Prices, debts, and what a part is really worth." },
  { id: "sneak", name: "Sneak", blurb: "Being misread as part of the machinery." },
  { id: "lockwork", name: "Lockwork", blurb: "Latches, cadences, and sealed doors." },
  { id: "history", name: "History", blurb: "What a machine was before the Bureau renamed it." },
  { id: "psychology", name: "Psychology", blurb: "Memory, fear, and the scars that learned a job." },
];

const FORMULA: Record<SkillId, (a: Attrs) => number> = {
  engineering: (a) => a.mind * 2 + a.finesse + a.body,
  medicine: (a) => a.mind * 2 + a.perception + a.will,
  science: (a) => a.mind * 3 + a.will,
  audit: (a) => a.perception * 3 + a.mind,
  survival: (a) => a.body * 2 + a.perception + a.will,
  mechanics: (a) => a.finesse * 2 + a.mind + a.perception,
  speech: (a) => a.presence * 3 + a.will,
  barter: (a) => a.presence * 2 + a.mind + a.finesse,
  sneak: (a) => a.finesse * 2 + a.perception * 2,
  lockwork: (a) => a.finesse * 2 + a.perception + a.mind,
  history: (a) => a.mind * 2 + a.presence * 2,
  psychology: (a) => a.will * 2 + a.presence * 2 + a.mind,
};

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function initialSkill(attrs: Attrs, tags: SkillId[], id: SkillId) {
  let v = 10 + FORMULA[id](attrs);
  if (tags.includes(id)) v += 20;
  return clamp(v, 5, 95);
}

export function allSkills(attrs: Attrs, tags: SkillId[]): Record<SkillId, number> {
  const out = {} as Record<SkillId, number>;
  for (const s of SKILL_LIST) out[s.id] = initialSkill(attrs, tags, s.id);
  return out;
}

export function comprehension(attrs: Attrs, audit: number, level: number) {
  return 1 + Math.floor(attrs.mind / 3) + Math.floor(audit / 40) + (level - 1);
}

export function maxFocus(will: number) {
  return 10 + will * 2;
}

export function maxHp(body: number, level: number) {
  return 22 + body * 4 + (level - 1) * 8;
}

export function maxAp(finesse: number) {
  return 7 + Math.floor(finesse / 4);
}

export function xpForLevel(level: number) {
  if (level <= 1) return 0;
  let xp = 0;
  for (let i = 2; i <= level; i++) xp += 50 + (i - 1) * 30;
  return xp;
}

export function checkChance(skill: number, dc: number) {
  return clamp(50 + skill - dc, 5, 95);
}

export function rollD100() {
  return 1 + Math.floor(Math.random() * 100);
}

export const FACTION_NAME: Record<string, string> = {
  bureau: "The Bureau",
  unbound: "The Unbound",
  relsec: "RelSec",
  ash: "The Ash Cult",
  engineers: "Old Engineers",
};

export const DOMAIN_NAME: Record<string, string> = {
  matter: "Matter",
  biology: "Biology",
  mind: "Mind",
  causal: "Causality",
  continuity: "Continuity",
};
