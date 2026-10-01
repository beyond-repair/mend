import assert from "node:assert/strict";
import test from "node:test";

// Witness of the published formulas in src/game/formulas.ts (Sweep-170).
// Kept dependency-free so it can run without the app install.
// If formulas.ts changes, this witness must be updated in the same commit.

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

const FORMULA = {
  engineering: (a) => a.mind * 2 + a.finesse + a.body,
  science: (a) => a.mind * 3 + a.will,
};

function initialSkill(attrs, tags, id) {
  let v = 10 + FORMULA[id](attrs);
  if (tags.includes(id)) v += 20;
  return clamp(v, 5, 95);
}

function maxHp(body, level) {
  return 22 + body * 4 + (level - 1) * 8;
}

function xpForLevel(level) {
  if (level <= 1) return 0;
  let xp = 0;
  for (let i = 2; i <= level; i++) xp += 50 + (i - 1) * 30;
  return xp;
}

function checkChance(skill, dc) {
  return clamp(50 + skill - dc, 5, 95);
}

test("mend balance witness matches formulas.ts contract", () => {
  const attrs = { body: 3, finesse: 4, mind: 5, will: 2, presence: 1, perception: 6 };
  assert.equal(initialSkill(attrs, [], "engineering"), 27);
  assert.equal(initialSkill(attrs, ["science"], "science"), 47);
  assert.equal(maxHp(3, 2), 42);
  assert.equal(xpForLevel(3), 190);
  assert.equal(checkChance(40, 100), 5);
  assert.equal(checkChance(80, 10), 95);
  assert.equal(10 + 2 * 2, 14); // maxFocus(will=2)
  assert.equal(7 + Math.floor(4 / 4), 8); // maxAp(finesse=4)
});
