import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as BookOpen, t as X } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B80ivbWP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
function unlockAudio() {
	if (typeof window === "undefined") return;
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") ctx.resume();
}
function beep(freq, dur, type, gain, slide = 0) {
	if (!ctx) return;
	const t = ctx.currentTime;
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, t);
	if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(.001, t + dur);
	o.connect(g);
	g.connect(ctx.destination);
	o.start(t);
	o.stop(t + dur + .02);
}
function play(kind, tone) {
	unlockAudio();
	if (!ctx) return;
	if (kind === "ui") beep(420, .05, "square", .03);
	if (kind === "step") beep(tone === "ice" ? 640 : tone === "metal" ? 96 : tone === "timber" ? 240 : 180, tone === "ice" ? .03 : .045, tone === "ice" ? "sine" : "triangle", .016, tone === "metal" ? -30 : 0);
	if (kind === "talk") beep(320, .06, "triangle", .02);
	if (kind === "mend") {
		beep(392, .16, "sine", .035);
		beep(494, .2, "sine", .028);
		beep(587, .26, "triangle", .02);
	}
	if (kind === "unmend") {
		beep(196, .05, "square", .03);
		beep(110, .22, "sawtooth", .045, -70);
		beep(70, .28, "square", .02);
	}
	if (kind === "hit") beep(220, .08, "square", .04, -60);
	if (kind === "hurt") beep(110, .2, "sawtooth", .05, -40);
	if (kind === "over") {
		beep(80, .3, "sawtooth", .05);
		beep(160, .2, "square", .03, 40);
	}
	if (kind === "level") {
		beep(440, .12, "sine", .04);
		beep(554, .16, "sine", .04);
		beep(659, .22, "sine", .04);
	}
	if (kind === "steam") {
		beep(90, .22, "sawtooth", .03, -30);
		beep(180, .12, "triangle", .02, 40);
	}
	if (kind === "moth") {
		beep(880, .05, "sine", .018);
		beep(1320, .08, "triangle", .012, 180);
	}
}
var bed = null;
var bedFilter = null;
var bedGain = null;
var airFilter = null;
var airGain = null;
var wrong = null;
var wrongGain = null;
function startBed() {
	unlockAudio();
	if (!ctx || bed) return;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	const filter = ctx.createBiquadFilter();
	osc.type = "sawtooth";
	osc.frequency.value = 48;
	filter.type = "lowpass";
	filter.frequency.value = 140;
	gain.gain.value = .012;
	osc.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	bed = osc;
	bedFilter = filter;
	bedGain = gain;
	const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) {
		const drip = i % 2200 < 28;
		data[i] = (Math.random() * 2 - 1) * (drip ? 1 : .08);
	}
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.loop = true;
	const aFilter = ctx.createBiquadFilter();
	aFilter.type = "bandpass";
	aFilter.frequency.value = 480;
	aFilter.Q.value = 3;
	const aGain = ctx.createGain();
	aGain.gain.value = .012;
	src.connect(aFilter);
	aFilter.connect(aGain);
	aGain.connect(ctx.destination);
	src.start();
	airFilter = aFilter;
	airGain = aGain;
	const drift = ctx.createOscillator();
	const driftGain = ctx.createGain();
	drift.type = "sine";
	drift.frequency.value = 73.5;
	driftGain.gain.value = 0;
	drift.connect(driftGain);
	driftGain.connect(ctx.destination);
	drift.start();
	wrong = drift;
	wrongGain = driftGain;
}
function setAtmosphere(mode) {
	unlockAudio();
	if (!ctx) return;
	if (!bed) startBed();
	if (!bedFilter || !bedGain || !airFilter || !airGain || !wrong || !wrongGain) return;
	const tone = {
		sinks: {
			f: 140,
			g: .012,
			air: 620,
			ag: .02,
			q: 6,
			wrong: 0
		},
		pump: {
			f: 240,
			g: .018,
			air: 280,
			ag: .016,
			q: 2,
			wrong: 0
		},
		strain: {
			f: 88,
			g: .016,
			air: 160,
			ag: .014,
			q: 1.2,
			wrong: 0
		},
		vacant: {
			f: 64,
			g: .008,
			air: 90,
			ag: .01,
			q: .7,
			wrong: 0
		},
		fight: {
			f: 190,
			g: .02,
			air: 240,
			ag: .012,
			q: 1,
			wrong: 0
		},
		haven: {
			f: 210,
			g: .013,
			air: 340,
			ag: .012,
			q: 1.4,
			wrong: 0
		},
		citadel: {
			f: 320,
			g: .008,
			air: 880,
			ag: .008,
			q: 4,
			wrong: 0
		},
		quarry: {
			f: 96,
			g: .016,
			air: 140,
			ag: .02,
			q: .8,
			wrong: 0
		},
		rust: {
			f: 150,
			g: .016,
			air: 190,
			ag: .018,
			q: 1.1,
			wrong: 0
		},
		road: {
			f: 120,
			g: .012,
			air: 260,
			ag: .01,
			q: .9,
			wrong: 0
		},
		dark: {
			f: 58,
			g: .018,
			air: 70,
			ag: .02,
			q: .6,
			wrong: .004
		},
		spire: {
			f: 66,
			g: .011,
			air: 90,
			ag: .022,
			q: 8,
			wrong: .012
		}
	}[mode];
	const t = ctx.currentTime;
	bedFilter.frequency.linearRampToValueAtTime(tone.f, t + .4);
	bedGain.gain.linearRampToValueAtTime(tone.g, t + .4);
	airFilter.frequency.linearRampToValueAtTime(Math.max(40, tone.air), t + .4);
	airFilter.Q.linearRampToValueAtTime(tone.q, t + .4);
	airGain.gain.linearRampToValueAtTime(tone.ag, t + .4);
	wrong.frequency.linearRampToValueAtTime(mode === "spire" ? 77.1 : 70, t + .6);
	wrongGain.gain.linearRampToValueAtTime(tone.wrong, t + .5);
}
var ATTR_LIST = [
	{
		id: "body",
		name: "Body",
		blurb: "Force, blood, and how much iron you can haul."
	},
	{
		id: "finesse",
		name: "Finesse",
		blurb: "Hands, aim, and the step that does not ring."
	},
	{
		id: "mind",
		name: "Mind",
		blurb: "How much structure you can hold at once."
	},
	{
		id: "will",
		name: "Will",
		blurb: "Focus when the diagram starts to burn."
	},
	{
		id: "presence",
		name: "Presence",
		blurb: "Whether a room decides to believe you."
	},
	{
		id: "perception",
		name: "Perception",
		blurb: "The crack before the wall admits it."
	}
];
var SKILL_LIST = [
	{
		id: "engineering",
		name: "Engineering",
		blurb: "Boilers, valves, and load paths."
	},
	{
		id: "medicine",
		name: "Medicine",
		blurb: "Bodies as systems that can be relinked."
	},
	{
		id: "science",
		name: "Science",
		blurb: "The Bureau's diagrams, and the older ones."
	},
	{
		id: "audit",
		name: "Audit",
		blurb: "Reading a thing as the relationships that hold it."
	},
	{
		id: "survival",
		name: "Survival",
		blurb: "Smoke, slag, weather, and empty districts."
	},
	{
		id: "mechanics",
		name: "Mechanics",
		blurb: "Weapons, locks of gear, and scavenged frames."
	},
	{
		id: "speech",
		name: "Speech",
		blurb: "Saying the sentence that moves a person."
	},
	{
		id: "barter",
		name: "Barter",
		blurb: "Prices, debts, and what a part is really worth."
	},
	{
		id: "sneak",
		name: "Sneak",
		blurb: "Being misread as part of the machinery."
	},
	{
		id: "lockwork",
		name: "Lockwork",
		blurb: "Latches, cadences, and sealed doors."
	},
	{
		id: "history",
		name: "History",
		blurb: "What a machine was before the Bureau renamed it."
	},
	{
		id: "psychology",
		name: "Psychology",
		blurb: "Memory, fear, and the scars that learned a job."
	}
];
var FORMULA = {
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
	psychology: (a) => a.will * 2 + a.presence * 2 + a.mind
};
function clamp$1(n, lo, hi) {
	return Math.max(lo, Math.min(hi, Math.round(n)));
}
function initialSkill(attrs, tags, id) {
	let v = 10 + FORMULA[id](attrs);
	if (tags.includes(id)) v += 20;
	return clamp$1(v, 5, 95);
}
function allSkills(attrs, tags) {
	const out = {};
	for (const s of SKILL_LIST) out[s.id] = initialSkill(attrs, tags, s.id);
	return out;
}
function comprehension(attrs, audit, level) {
	return 1 + Math.floor(attrs.mind / 3) + Math.floor(audit / 40) + (level - 1);
}
function maxFocus(will) {
	return 10 + will * 2;
}
function maxHp(body, level) {
	return 22 + body * 4 + (level - 1) * 8;
}
function maxAp(finesse) {
	return 7 + Math.floor(finesse / 4);
}
function xpForLevel(level) {
	if (level <= 1) return 0;
	let xp = 0;
	for (let i = 2; i <= level; i++) xp += 50 + (i - 1) * 30;
	return xp;
}
function checkChance(skill, dc) {
	return clamp$1(50 + skill - dc, 5, 95);
}
function rollD100() {
	return 1 + Math.floor(Math.random() * 100);
}
var FACTION_NAME = {
	bureau: "The Bureau",
	unbound: "The Unbound",
	relsec: "RelSec",
	ash: "The Ash Cult",
	engineers: "Old Engineers"
};
var DOMAIN_NAME = {
	matter: "Matter",
	biology: "Biology",
	mind: "Mind",
	causal: "Causality",
	continuity: "Continuity"
};
/** A way of working. Not a larger number. */
var PERKS = [
	{
		id: "steady-mend",
		name: "Steady mend",
		blurb: "A mend spends two less focus. The baseline does not get easier. Your hands do."
	},
	{
		id: "counter-price",
		name: "Counter price",
		blurb: "A kiln price comes down. Scarcity stays. The stamp does not."
	},
	{
		id: "thick-sleep",
		name: "Thick sleep",
		blurb: "A real bed puts you back to full. A doorway does not."
	},
	{
		id: "soft-step",
		name: "Soft step",
		blurb: "Locks and crawls you were not invited through give more easily. A bad miss is still heard."
	},
	{
		id: "parent-ear",
		name: "Parent ear",
		blurb: "The first time you audit a machine, one quiet parent is named before the surface admits it."
	}
];
function grid(w, h, fill = ".") {
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
function fill(g, x0, y0, x1, y1, ch) {
	for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch;
}
function vwall(g, x, y0, y1) {
	for (let y = y0; y <= y1; y++) g[y][x] = "#";
}
function hwall(g, y, x0, x1) {
	for (let x = x0; x <= x1; x++) g[y][x] = "#";
}
function finish(id, name, act, g, entry, theme) {
	return {
		id,
		name,
		act,
		width: g[0].length,
		height: g.length,
		rows: g.map((r) => r.join("")),
		entry,
		theme
	};
}
function grow(base, w, h) {
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
function sinks() {
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
	fill(deep, 2, 17, 8, 21, ".");
	deep[18][9] = ".";
	deep[18][10] = ".";
	deep[18][11] = ".";
	deep[18][12] = ".";
	deep[18][13] = ".";
	return finish("sinks", "The Sinks", "Act I", deep, {
		x: 3,
		y: 3
	}, "sinks");
}
function quarry() {
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
	return finish("quarry", "The Clockwork Canyon", "Act III", east, {
		x: 10,
		y: 12
	}, "quarry");
}
function rust() {
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
	return finish("rust", "Rust Districts", "Act III", wide, {
		x: 4,
		y: 12
	}, "rust");
}
function citadel() {
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
	return finish("citadel", "High Citadel", "Act V", east, {
		x: 18,
		y: 13
	}, "citadel");
}
function spire() {
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
	return finish("spire", "The Void Spire", "Act VI", wide, {
		x: 8,
		y: 11
	}, "spire");
}
function road() {
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
	fill(wide, 26, 1, 28, 2, ".");
	return finish("road", "The Stack Road", "Act II", wide, {
		x: 3,
		y: 4
	}, "road");
}
function haven() {
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
	return finish("haven", "Oakhaven Lower Ward", "Act I", wide, {
		x: 10,
		y: 12
	}, "haven");
}
function kiln() {
	const g = grid(34, 22);
	fill(g, 14, 1, 18, 6, ".");
	vwall(g, 9, 3, 11);
	g[6][9] = ".";
	g[7][9] = ".";
	vwall(g, 25, 3, 12);
	g[6][25] = ".";
	g[7][25] = ".";
	hwall(g, 16, 2, 13);
	vwall(g, 2, 16, 20);
	vwall(g, 13, 16, 20);
	g[16][6] = "+";
	g[5][4] = "%";
	g[8][4] = "%";
	g[9][30] = "^";
	g[17][22] = "%";
	g[14][8] = "^";
	g[18][5] = "%";
	return finish("kiln", "The Kiln", "Act II", g, {
		x: 16,
		y: 3
	}, "rust");
}
function switchyard() {
	const g = grid(30, 18);
	fill(g, 12, 1, 16, 5, ".");
	fill(g, 4, 5, 26, 14, ".");
	vwall(g, 8, 4, 10);
	g[6][8] = ".";
	g[7][8] = ".";
	hwall(g, 13, 3, 12);
	vwall(g, 3, 13, 16);
	vwall(g, 12, 13, 16);
	g[13][6] = "+";
	g[5][4] = "%";
	g[10][24] = "^";
	g[15][9] = "%";
	return finish("switch", "The Switch", "Act II", g, {
		x: 14,
		y: 3
	}, "road");
}
function pane() {
	const g = grid(32, 20);
	fill(g, 14, 14, 18, 18, ".");
	fill(g, 3, 3, 29, 13, ".");
	vwall(g, 20, 3, 12);
	g[7][20] = ".";
	g[8][20] = ".";
	hwall(g, 15, 3, 12);
	vwall(g, 3, 15, 18);
	vwall(g, 12, 15, 18);
	g[15][6] = "+";
	fill(g, 4, 16, 11, 18, ".");
	g[5][5] = "%";
	g[4][12] = "^";
	g[18][10] = "%";
	return finish("pane", "The Pane", "Act II", g, {
		x: 16,
		y: 16
	}, "citadel");
}
function tundra() {
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
	return finish("tundra", "The Brass Tundra", "Act IV", tall, {
		x: 4,
		y: 5
	}, "citadel");
}
var MAPS = {
	sinks: sinks(),
	haven: haven(),
	kiln: kiln(),
	switch: switchyard(),
	pane: pane(),
	quarry: quarry(),
	rust: rust(),
	road: road(),
	tundra: tundra(),
	citadel: citadel(),
	spire: spire()
};
var MOUTHS = [
	{
		map: "sinks",
		x: 25,
		y: 18,
		to: "road",
		tx: 5,
		ty: 5,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 2,
		y: 7,
		to: "sinks",
		tx: 24,
		ty: 18,
		need: null,
		deny: "The Sinks mouth is shut."
	},
	{
		map: "road",
		x: 16,
		y: 11,
		to: "kiln",
		tx: 16,
		ty: 3,
		need: null,
		deny: "The brick stair is shut."
	},
	{
		map: "kiln",
		x: 16,
		y: 1,
		to: "road",
		tx: 16,
		ty: 11,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 22,
		y: 14,
		to: "switch",
		tx: 14,
		ty: 3,
		need: null,
		deny: "The yard stair is shut."
	},
	{
		map: "switch",
		x: 14,
		y: 1,
		to: "road",
		tx: 22,
		ty: 13,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 27,
		y: 1,
		to: "pane",
		tx: 16,
		ty: 17,
		need: null,
		deny: "The glass stair is shut."
	},
	{
		map: "pane",
		x: 16,
		y: 18,
		to: "road",
		tx: 27,
		ty: 2,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 20,
		y: 1,
		to: "haven",
		tx: 33,
		ty: 6,
		need: null,
		deny: "The ward stair is shut."
	},
	{
		map: "haven",
		x: 34,
		y: 6,
		to: "road",
		tx: 20,
		ty: 3,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 34,
		y: 4,
		to: "quarry",
		tx: 32,
		ty: 8,
		need: "act1",
		deny: "The quarry road wants a signed stair, or a crawl you already used."
	},
	{
		map: "quarry",
		x: 33,
		y: 8,
		to: "road",
		tx: 33,
		ty: 4,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 34,
		y: 6,
		to: "rust",
		tx: 33,
		ty: 8,
		need: "act1",
		deny: "Rust is past the same signature the quarry wanted."
	},
	{
		map: "rust",
		x: 34,
		y: 8,
		to: "road",
		tx: 33,
		ty: 6,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "road",
		x: 8,
		y: 15,
		to: "tundra",
		tx: 4,
		ty: 5,
		need: "citadelOpen",
		dark: true,
		deny: "The tundra walk stays sealed until the citadel is actually in play."
	},
	{
		map: "tundra",
		x: 2,
		y: 5,
		to: "road",
		tx: 8,
		ty: 14,
		need: null,
		deny: "The stack mouth is shut."
	},
	{
		map: "tundra",
		x: 26,
		y: 5,
		to: "citadel",
		tx: 32,
		ty: 18,
		need: null,
		deny: "The ranking stair is shut."
	},
	{
		map: "citadel",
		x: 33,
		y: 18,
		to: "tundra",
		tx: 24,
		ty: 5,
		need: null,
		deny: "The tundra stair is shut."
	},
	{
		map: "road",
		x: 28,
		y: 15,
		to: "spire",
		tx: 24,
		ty: 8,
		need: "spireOpen",
		dark: true,
		deny: "The Spire has no mouth until the citadel has been answered."
	},
	{
		map: "spire",
		x: 26,
		y: 8,
		to: "road",
		tx: 28,
		ty: 14,
		need: null,
		deny: "The stack mouth is shut."
	}
];
function mouthAt(mapId, x, y) {
	return MOUTHS.find((m) => m.map === mapId && m.x === x && m.y === y) ?? null;
}
var EXITS = MOUTHS.map((m) => ({
	map: m.map,
	x: m.x,
	y: m.y
}));
var LOCKED_DOORS = [
	{
		map: "sinks",
		x: 5,
		y: 11,
		flag: "plateStair",
		convo: "plate-stair"
	},
	{
		map: "sinks",
		x: 19,
		y: 6,
		flag: "sumpOpen",
		convo: "sump-door"
	},
	{
		map: "citadel",
		x: 6,
		y: 8,
		flag: "shaftOpen",
		convo: "shaft-door"
	},
	{
		map: "haven",
		x: 8,
		y: 16,
		flag: "ashAccess",
		convo: "ash-cut"
	},
	{
		map: "kiln",
		x: 6,
		y: 16,
		flag: "kilnCellar",
		convo: "kiln-cellar"
	},
	{
		map: "switch",
		x: 6,
		y: 13,
		flag: "switchBay",
		convo: "switch-bay"
	},
	{
		map: "pane",
		x: 6,
		y: 15,
		flag: "paneVault",
		convo: "pane-vault"
	}
];
for (const m of Object.values(MAPS)) {
	if (m.rows.length !== m.height) throw new Error(`${m.id} height`);
	for (const row of m.rows) if (row.length !== m.width) throw new Error(`${m.id} width ${row.length}`);
}
function tileAt(map, x, y) {
	if (x < 0 || y < 0 || y >= map.height || x >= map.width) return "#";
	return map.rows[y][x];
}
var WALKABLE = /* @__PURE__ */ new Set([
	".",
	",",
	"+",
	"=",
	"^",
	"!",
	"p",
	"v"
]);
var REGIONS = [
	{
		id: "sinks",
		name: "The Sinks",
		act: "Act I",
		blurb: "Reclamation under the stacks. The south cut is a mouth onto the road, not a menu.",
		need: null
	},
	{
		id: "haven",
		name: "Oakhaven Lower Ward",
		act: "Act I",
		blurb: "Stalls, a clinic, and plots that drink from the Sinks. Come back. The pipes will have changed.",
		need: null
	},
	{
		id: "road",
		name: "The Stack Road",
		act: "Act II",
		blurb: "Gantries between the districts. The mouths are on the road. The ledger only jumps a throat you have already stood in.",
		need: "seen:road"
	},
	{
		id: "kiln",
		name: "The Kiln",
		act: "Act II",
		blurb: "A brick yard under the stack road. Clay is local. Water, heat, and a stamp are not.",
		need: "seen:kiln"
	},
	{
		id: "switch",
		name: "The Switch",
		act: "Act II",
		blurb: "A freight table under the same road. Grease is local. The haul, and the bill on it, are not.",
		need: "seen:switch"
	},
	{
		id: "pane",
		name: "The Pane",
		act: "Act II",
		blurb: "A glasshouse off the high walk. Sand is local. Heat, a stamp, and a lamp that needs glass are not.",
		need: "seen:pane"
	},
	{
		id: "quarry",
		name: "The Clockwork Canyon",
		act: "Act III",
		blurb: "Stone, a crane, a colossus, and a rigger the count lost. The east cut returns to the road.",
		need: "act1"
	},
	{
		id: "rust",
		name: "Rust Districts",
		act: "Act III",
		blurb: "Forge, tenements, guild heat. Stock is a grandchild of the quarry and the Sinks.",
		need: "act1"
	},
	{
		id: "tundra",
		name: "The Brass Tundra",
		act: "Act IV",
		blurb: "Ice, the hollow, and the walk to the ranking stair.",
		need: "seen:tundra"
	},
	{
		id: "citadel",
		name: "High Citadel",
		act: "Act V",
		blurb: "Reached on foot across the tundra. Lamps, siphon, orrery, rank. Not merely a taller room.",
		need: "citadelOpen"
	},
	{
		id: "spire",
		name: "Void Spire",
		act: "Act VI",
		blurb: "No recoverable baseline. The question is whether holding the city together is the problem.",
		need: "spireOpen"
	}
];
var ITEMS = {
	prybar: {
		id: "prybar",
		name: "Maintainer's prybar",
		kind: "weapon",
		desc: "A short iron bar with a brass bite. Honest work, close in.",
		melee: true,
		range: 1,
		damage: 6,
		weight: 3,
		value: 12,
		parts: [
			"Bite",
			"Haft",
			"Pin"
		]
	},
	rivet: {
		id: "rivet",
		name: "Rivet gun",
		kind: "weapon",
		desc: "A Bureau sidearm rebuilt from plate scrap. It argues at a distance.",
		melee: false,
		range: 5,
		damage: 7,
		weight: 4,
		value: 40,
		condition: 80,
		parts: [
			"Barrel stub",
			"Spring",
			"Hopper"
		]
	},
	baton: {
		id: "baton",
		name: "Officer's baton",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 7,
		weight: 2,
		value: 18,
		desc: "Weighted, polite, and meant for other people's bones.",
		parts: ["Core", "Wrap"]
	},
	rifle: {
		id: "rifle",
		name: "Steam rifle",
		kind: "weapon",
		melee: false,
		range: 5,
		damage: 8,
		weight: 5,
		value: 55,
		condition: 58,
		desc: "A pressurized Bureau longarm. The chamber, not the barrel, is what makes it a rifle.",
		parts: [
			"Barrel",
			"Pressure chamber",
			"Firing pawl"
		]
	},
	fist: {
		id: "fist",
		name: "Bare hands",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 4,
		weight: 0,
		value: 0,
		desc: "When the weapon's relationship has already been severed."
	},
	bite: {
		id: "bite",
		name: "Moth bite",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 5,
		weight: 0,
		value: 0,
		desc: "Not a tool. A small animal's answer when the graph gets loud."
	},
	piston: {
		id: "piston",
		name: "Piston arm",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 8,
		weight: 6,
		value: 20,
		desc: "An automaton's idea of a handshake."
	},
	coat: {
		id: "coat",
		name: "Bureau worker's coat",
		kind: "armor",
		resist: .78,
		weight: 4,
		value: 30,
		condition: 70,
		desc: "Canvas, a lining, and plate that used to be someone else's job. Worn, it turns a rifle tap into a bruise.",
		parts: [
			"Canvas",
			"Reinforcement",
			"Lining"
		]
	},
	bandage: {
		id: "bandage",
		name: "Brass bandage",
		kind: "consumable",
		heal: 12,
		weight: 1,
		value: 8,
		desc: "Cloth, solvent, and a clip. The slice's honest medicine: it closes what it can see."
	},
	phial: {
		id: "phial",
		name: "Focus phial",
		kind: "consumable",
		focus: 10,
		weight: 1,
		value: 14,
		desc: "Bitter iron tonic. The lens steadies."
	},
	valve: {
		id: "valve",
		name: "Pressure valve",
		kind: "quest",
		weight: 2,
		value: 22,
		desc: "A matched valve for the Sinks pump. It remembers the correct seat."
	},
	scrap: {
		id: "scrap",
		name: "Plate scrap",
		kind: "part",
		weight: 2,
		value: 6,
		desc: "Charcoal-dusted iron from a coupling that no longer believes in itself."
	},
	gears: {
		id: "gears",
		name: "Seized gearset",
		kind: "junk",
		weight: 3,
		value: 4,
		yield: ["scrap"],
		desc: "Junk until it isn't. The teeth are dead. The metal is not. Dismantle it."
	},
	shard: {
		id: "shard",
		name: "Composite shard",
		kind: "part",
		weight: 1,
		value: 18,
		desc: "Silk-lattice and cold iron that were never married. RelSec's handwriting."
	},
	chalk: {
		id: "chalk",
		name: "Audit chalk",
		kind: "consumable",
		weight: 0,
		value: 5,
		desc: "Marks a baseline so an illegible bond can be read once."
	},
	hook: {
		id: "hook",
		name: "Pin hook",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 5,
		weight: 2,
		value: 16,
		pin: true,
		parts: ["Hook", "Lanyard"],
		desc: "A short hook for a seam you can already see. It holds the part. It does not win the room."
	},
	span: {
		id: "span",
		name: "Long iron",
		kind: "weapon",
		melee: true,
		range: 2,
		damage: 5,
		weight: 4,
		value: 22,
		parts: ["Shaft", "Collar"],
		desc: "Reaches a body you are not standing on. Less bite than a prybar. More room."
	},
	wrap: {
		id: "wrap",
		name: "Cloth wrap",
		kind: "armor",
		resist: .9,
		weight: 1,
		value: 8,
		desc: "It will not stop a rifle. It keeps a brace from slipping."
	},
	vest: {
		id: "vest",
		name: "Plate vest",
		kind: "armor",
		resist: .62,
		weight: 6,
		value: 28,
		heavy: true,
		parts: ["Plate", "Buckle"],
		desc: "Harder to open. Harder to move. The buckle is the parent of both facts."
	},
	strap: {
		id: "strap",
		name: "Shoulder strap",
		kind: "accessory",
		weight: 1,
		value: 10,
		desc: "Worn by someone else. They spend a turn putting their shoulder on yours."
	},
	glass: {
		id: "glass",
		name: "Reading glass",
		kind: "accessory",
		weight: 0,
		value: 18,
		desc: "Names one seam the fight has not admitted yet. It does not make the seam true."
	},
	cleat: {
		id: "cleat",
		name: "Edge cleats",
		kind: "armor",
		resist: .95,
		weight: 2,
		value: 12,
		ice: true,
		desc: "The brass ice is a floor with an opinion. These keep the middle from billing you. They will not stop a rifle."
	},
	coupler: {
		id: "coupler",
		name: "Brake coupler",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 4,
		weight: 3,
		value: 14,
		pin: true,
		parts: ["Collar", "Pin"],
		desc: "Taken off a waystation brake. Worse in a fight than a prybar. On a hit, it holds one seam the body already admitted."
	},
	listener: {
		id: "listener",
		name: "Seam listener",
		kind: "consumable",
		weight: 1,
		value: 20,
		desc: "A coil against the ear. It names one seam you have not admitted yet. It does not make the seam true, and it does not survive the telling."
	},
	dog: {
		id: "dog",
		name: "Cable dog",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 4,
		weight: 3,
		value: 18,
		pin: true,
		parts: ["Jaw", "Lanyard"],
		desc: "Clamps a seam the fight has already admitted. Less bite than a prybar. The jaw is the point."
	},
	chisel: {
		id: "chisel",
		name: "Firing chisel",
		kind: "weapon",
		melee: true,
		range: 1,
		damage: 5,
		weight: 2,
		value: 16,
		pin: true,
		parts: ["Edge", "Haft"],
		desc: "A kiln tool. In a fight it holds a seam you can already see. It does not make a brick."
	},
	kilncoat: {
		id: "kilncoat",
		name: "Kiln coat",
		kind: "armor",
		resist: .7,
		weight: 5,
		value: 26,
		condition: 80,
		parts: ["Hide", "Ash cloth"],
		desc: "Hide and ash cloth. It turns heat and a glancing hit. It will not parent a flue."
	},
	tin: {
		id: "tin",
		name: "Kiln tin",
		kind: "consumable",
		heal: 8,
		weight: 1,
		value: 6,
		desc: "Salt, fat, and something that used to be a vegetable. Food. Not a well."
	},
	brick: {
		id: "brick",
		name: "Set brick",
		kind: "part",
		weight: 2,
		value: 4,
		desc: "A brick that held. Worth more where a board is allowed to buy it, and less where it has to be quiet."
	},
	sootglass: {
		id: "sootglass",
		name: "Soot glass",
		kind: "consumable",
		weight: 1,
		value: 40,
		desc: "Lifted from a flue that was not supposed to have a lens. It names one seam the surface called illegible. It does not survive the naming."
	},
	waybill: {
		id: "waybill",
		name: "Held waybill",
		kind: "quest",
		weight: 0,
		value: 0,
		desc: "Paper that puts Bram's cart and the Switch table in the same sentence. It does not move the cart by itself."
	},
	grease: {
		id: "grease",
		name: "Axle grease",
		kind: "part",
		weight: 1,
		value: 3,
		desc: "Scrap rendered mean. A parent for a slick plate. Not a boot."
	},
	slickboot: {
		id: "slickboot",
		name: "Yard boots",
		kind: "armor",
		resist: .92,
		weight: 2,
		value: 14,
		slick: true,
		desc: "The yard plates stop billing your step. They do not grease the axle, and they do not keep anyone else's feet."
	},
	clearpane: {
		id: "clearpane",
		name: "Clear pane",
		kind: "part",
		weight: 1,
		value: 8,
		desc: "A pane that held. It can be sold where a bench is allowed to buy it, or sat into a lamp that lost its glass. It does not replace the light's other parent."
	},
	anneallens: {
		id: "anneallens",
		name: "Anneal lens",
		kind: "part",
		weight: 1,
		value: 28,
		desc: "Carry it and the first audit of a machine names one quiet parent. The vault and the bench are two ways to the same lens. It does not survive being a slogan."
	},
	panemitt: {
		id: "panemitt",
		name: "Furnace mitts",
		kind: "armor",
		resist: .9,
		weight: 2,
		value: 16,
		heat: true,
		desc: "The furnace floor stops billing your step. They do not seat the flue, and they do not keep anyone else's hands."
	}
};
var zeroSkills = () => ({
	engineering: 25,
	medicine: 15,
	science: 20,
	audit: 20,
	survival: 30,
	mechanics: 25,
	speech: 20,
	barter: 15,
	sneak: 15,
	lockwork: 15,
	history: 15,
	psychology: 15
});
function node(partial) {
	return partial;
}
var ATTR = (p) => ({
	body: 5,
	finesse: 5,
	mind: 5,
	will: 5,
	presence: 5,
	perception: 5,
	...p
});
function skills(over) {
	return {
		...zeroSkills(),
		...over
	};
}
var TEMPLATES = {
	tobin: {
		template: "tobin",
		name: "Tobin",
		title: "Reclamation keeper",
		portrait: "/game/portraits/tobin.jpg?v=3",
		sprite: "/game/sprites/tobin.png?v=3",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 7,
		attrs: ATTR({
			body: 7,
			mind: 6,
			will: 6,
			perception: 6,
			presence: 5,
			finesse: 4
		}),
		skills: skills({
			engineering: 72,
			mechanics: 64,
			medicine: 28,
			speech: 40
		}),
		nodes: [node({
			id: "ribs",
			name: "Rib lattice",
			domain: "biology",
			tier: "stress",
			integrity: 100,
			density: 4,
			baseline: 78,
			dependsOn: [],
			effect: "life",
			severed: false,
			revealed: false,
			gx: 30,
			gy: 40
		}), node({
			id: "hands",
			name: "Workshop hands",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 80,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 55
		})],
		convo: "tobin-intro",
		weapon: "prybar",
		tier: 1,
		vision: 0
	},
	pell: {
		template: "pell",
		name: "Pell",
		title: "Alley scavenger",
		portrait: "/game/portraits/pell.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			finesse: 7,
			perception: 7,
			presence: 4,
			mind: 4
		}),
		skills: skills({
			barter: 60,
			sneak: 55,
			mechanics: 48,
			speech: 30
		}),
		nodes: [],
		convo: "pell",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	wren: {
		template: "wren",
		name: "Wren",
		title: "Line worker",
		portrait: "/game/portraits/wren.jpg?v=3",
		sprite: "/game/sprites/wren.png?v=3",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			body: 5,
			finesse: 6,
			mind: 6,
			perception: 7,
			will: 5,
			presence: 4
		}),
		skills: skills({
			engineering: 58,
			mechanics: 52,
			sneak: 40,
			speech: 34
		}),
		nodes: [node({
			id: "hands",
			name: "Worked hands",
			domain: "matter",
			tier: "bond",
			integrity: 90,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 46,
			gy: 48
		})],
		convo: "wren",
		weapon: "prybar",
		tier: 0,
		vision: 0
	},
	varr: {
		template: "varr",
		name: "Captain Varr",
		title: "Bureau enforcer",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: 1.08,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 8,
		attrs: ATTR({
			body: 8,
			will: 6,
			finesse: 4,
			mind: 3,
			perception: 4,
			presence: 5
		}),
		skills: skills({
			mechanics: 40,
			speech: 28
		}),
		nodes: [
			node({
				id: "rivets",
				name: "Rivet line",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 90,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 16,
				gy: 78
			}),
			node({
				id: "plate",
				name: "Chest plate",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 88,
				dependsOn: ["rivets"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 40,
				gy: 22
			}),
			node({
				id: "coupling",
				name: "Power coupling",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 86,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 18,
				gy: 36
			}),
			node({
				id: "servos",
				name: "Knee servos",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 80,
				dependsOn: ["coupling"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 42,
				gy: 78
			}),
			node({
				id: "chamber",
				name: "Pressure chamber",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 84,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				pattern: "pressure-feed",
				gx: 72,
				gy: 16
			}),
			node({
				id: "mount",
				name: "Rifle mount",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 82,
				dependsOn: ["chamber"],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 86,
				gy: 40
			}),
			node({
				id: "rifle",
				name: "Rifle",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 80,
				dependsOn: ["mount"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 74,
				gy: 64
			})
		],
		convo: "varr-gate",
		downConvo: "varr-down",
		weapon: "rifle",
		tier: 1,
		vision: 4
	},
	enforcer: {
		template: "enforcer",
		name: "Enforcer",
		title: "Bureau plate",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: .92,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			finesse: 4,
			mind: 3,
			perception: 4
		}),
		skills: skills({ mechanics: 30 }),
		nodes: [
			node({
				id: "coupling",
				name: "Power coupling",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 80,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 18,
				gy: 28
			}),
			node({
				id: "servos",
				name: "Knee servos",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 76,
				dependsOn: ["coupling"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 22,
				gy: 72
			}),
			node({
				id: "plate",
				name: "Plate coupling",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 3,
				baseline: 80,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 48,
				gy: 18
			}),
			node({
				id: "chamber",
				name: "Pressure chamber",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 3,
				baseline: 78,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				pattern: "pressure-feed",
				gx: 74,
				gy: 20
			}),
			node({
				id: "mount",
				name: "Rifle mount",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 76,
				dependsOn: ["chamber"],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 88,
				gy: 46
			}),
			node({
				id: "rifle",
				name: "Rifle",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 74,
				dependsOn: ["mount"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 70,
				gy: 74
			})
		],
		convo: "guard-line",
		weapon: "rifle",
		tier: 1,
		vision: 4
	},
	hask: {
		template: "hask",
		name: "Hask",
		title: "Quarry rigger",
		portrait: "/game/portraits/hask.jpg?v=5",
		sprite: "/game/sprites/hask.png?v=5",
		scale: .96,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			perception: 6
		}),
		skills: skills({
			engineering: 40,
			speech: 30
		}),
		nodes: [],
		convo: "workers",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	lin: {
		template: "lin",
		name: "Lin",
		title: "Stone clerk",
		portrait: "/game/portraits/lin.jpg?v=5",
		sprite: "/game/sprites/lin.png?v=5",
		scale: .94,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			mind: 5,
			presence: 5
		}),
		skills: skills({
			speech: 36,
			history: 28
		}),
		nodes: [],
		convo: "workers",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	kael: {
		template: "kael",
		name: "Magistrate Kael",
		title: "RelSec patron",
		portrait: "/game/portraits/kael.jpg?v=4",
		sprite: "/game/sprites/kael.png?v=4",
		scale: 1.05,
		faction: "relsec",
		hostile: false,
		aggro: false,
		body: 7,
		attrs: ATTR({
			body: 6,
			mind: 7,
			will: 7,
			presence: 8,
			finesse: 6,
			perception: 6
		}),
		skills: skills({
			speech: 70,
			science: 62,
			history: 55,
			mechanics: 55
		}),
		nodes: [
			node({
				id: "clasp",
				name: "Outer clasp",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 72,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 14,
				gy: 18
			}),
			node({
				id: "ceramic",
				name: "Ceramic shell",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 64,
				dependsOn: ["clasp"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 38,
				gy: 16
			}),
			node({
				id: "rivets",
				name: "Frame rivets",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 5,
				baseline: 70,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 14,
				gy: 52
			}),
			node({
				id: "frame",
				name: "Steel frame",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 5,
				baseline: 74,
				dependsOn: ["rivets"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 42,
				gy: 48
			}),
			node({
				id: "weave",
				name: "Mesh weave",
				domain: "matter",
				tier: "obfuscated",
				integrity: 100,
				density: 7,
				baseline: 36,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 64,
				gy: 82
			}),
			node({
				id: "mesh",
				name: "Inner mesh",
				domain: "matter",
				tier: "anchor",
				integrity: 100,
				density: 7,
				baseline: 44,
				dependsOn: ["weave"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 84,
				gy: 58
			}),
			node({
				id: "matrix",
				name: "Rune matrix",
				domain: "causal",
				tier: "obfuscated",
				integrity: 100,
				density: 7,
				baseline: 30,
				dependsOn: [],
				effect: "spell",
				severed: false,
				revealed: false,
				gx: 80,
				gy: 16
			})
		],
		convo: "kael-pre",
		downConvo: "kael-down",
		weapon: "baton",
		tier: 2,
		vision: 5
	},
	relsec: {
		template: "relsec",
		name: "RelSec striker",
		title: "Layered kit",
		portrait: "/game/portraits/kael.jpg?v=4",
		sprite: "/game/sprites/kael.png?v=4",
		scale: .9,
		faction: "relsec",
		hostile: true,
		aggro: true,
		body: 6,
		attrs: ATTR({
			body: 6,
			finesse: 6,
			mind: 5,
			perception: 6
		}),
		skills: skills({
			mechanics: 48,
			science: 40
		}),
		nodes: [
			node({
				id: "clasp",
				name: "Outer clasp",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 50,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 22,
				gy: 24
			}),
			node({
				id: "ceramic",
				name: "Ceramic shell",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 48,
				dependsOn: ["clasp"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 48,
				gy: 20
			}),
			node({
				id: "weave",
				name: "Mesh weave",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 6,
				baseline: 40,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 70
			}),
			node({
				id: "mesh",
				name: "Inner mesh",
				domain: "matter",
				tier: "anchor",
				integrity: 100,
				density: 6,
				baseline: 42,
				dependsOn: ["weave"],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 70,
				gy: 62
			})
		],
		convo: "kael-pre",
		weapon: "baton",
		tier: 2,
		vision: 4
	},
	ives: {
		template: "ives",
		name: "Guildmaster Ives",
		title: "Unbound",
		portrait: "/game/portraits/ives.jpg?v=5",
		sprite: "/game/sprites/ives.png?v=5",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			presence: 8,
			mind: 6,
			will: 7,
			body: 6
		}),
		skills: skills({
			speech: 74,
			engineering: 55,
			psychology: 48,
			history: 40
		}),
		nodes: [],
		convo: "ives",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	mara: {
		template: "mara",
		name: "Mara",
		title: "Wiped prodigy",
		portrait: "/game/portraits/mara.jpg?v=4",
		sprite: "/game/sprites/mara.png?v=4",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			finesse: 8,
			mind: 7,
			will: 5,
			perception: 7,
			presence: 4,
			body: 4
		}),
		skills: skills({
			sneak: 62,
			lockwork: 58,
			psychology: 44,
			mechanics: 50,
			medicine: 20
		}),
		nodes: [node({
			id: "memory",
			name: "Memory lattice",
			domain: "mind",
			tier: "stress",
			integrity: 40,
			density: 6,
			baseline: 48,
			dependsOn: [],
			effect: "life",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 36
		}), node({
			id: "hands",
			name: "Trained hands",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 72,
			gy: 64
		})],
		convo: "mara",
		weapon: "prybar",
		tier: 1,
		vision: 0
	},
	sera: {
		template: "sera",
		name: "Sera",
		title: "Ash speaker",
		portrait: "/game/portraits/sera.jpg?v=4",
		sprite: "/game/sprites/sera.png?v=4",
		scale: 1,
		faction: "ash",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			will: 8,
			presence: 6,
			mind: 6
		}),
		skills: skills({
			psychology: 60,
			history: 55,
			speech: 58
		}),
		nodes: [],
		convo: "sera",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	vane: {
		template: "vane",
		name: "Evaluator Vane",
		title: "High Bureau",
		portrait: "/game/portraits/vane.jpg?v=5",
		sprite: "/game/sprites/vane.png?v=5",
		scale: 1,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			mind: 8,
			presence: 7,
			will: 8,
			perception: 6
		}),
		skills: skills({
			speech: 72,
			science: 70,
			history: 66,
			psychology: 50
		}),
		nodes: [],
		convo: "vane",
		weapon: "fist",
		tier: 3,
		vision: 3
	},
	sentry: {
		template: "sentry",
		name: "Sentry Quill",
		title: "Shaft watch",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: .95,
		faction: "bureau",
		hostile: true,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			perception: 5,
			finesse: 4
		}),
		skills: skills({ mechanics: 36 }),
		nodes: [node({
			id: "plate",
			name: "Plate coupling",
			domain: "matter",
			tier: "stress",
			integrity: 100,
			density: 4,
			baseline: 80,
			dependsOn: [],
			effect: "armor",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 40
		}), node({
			id: "rifle",
			name: "Rifle mount",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 72,
			gy: 60
		})],
		convo: "sentry",
		weapon: "rifle",
		tier: 1,
		vision: 3
	},
	guard: {
		template: "guard",
		name: "Citadel guard",
		title: "Bureau plate",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: .94,
		faction: "bureau",
		hostile: true,
		aggro: true,
		body: 6,
		attrs: ATTR({
			body: 6,
			finesse: 5,
			perception: 5
		}),
		skills: skills({ mechanics: 34 }),
		nodes: [
			node({
				id: "orders",
				name: "Standing order",
				domain: "mind",
				tier: "bond",
				integrity: 100,
				density: 2,
				baseline: 70,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 24
			}),
			node({
				id: "step",
				name: "Advance",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 2,
				baseline: 74,
				dependsOn: ["orders"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 70
			}),
			node({
				id: "plate",
				name: "Plate coupling",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 82,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 36,
				gy: 40
			}),
			node({
				id: "rifle",
				name: "Rifle mount",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 70,
				dependsOn: [],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 70,
				gy: 58
			})
		],
		convo: "sentry",
		weapon: "rifle",
		tier: 1,
		vision: 3
	},
	sovereign: {
		template: "sovereign",
		name: "The Epistemic Sovereign",
		title: "No baseline",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/sovereign.png?v=4",
		scale: 1.12,
		faction: "relsec",
		hostile: false,
		aggro: false,
		body: 9,
		attrs: ATTR({
			body: 7,
			mind: 9,
			will: 9,
			finesse: 7,
			perception: 8,
			presence: 6
		}),
		skills: skills({
			science: 80,
			psychology: 70,
			audit: 40
		}),
		nodes: [
			node({
				id: "mask",
				name: "Mask hinge",
				domain: "continuity",
				tier: "obfuscated",
				integrity: 100,
				density: 11,
				baseline: 8,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 22,
				gy: 30
			}),
			node({
				id: "liturgy",
				name: "Liturgy thread",
				domain: "continuity",
				tier: "obfuscated",
				integrity: 100,
				density: 12,
				baseline: 5,
				dependsOn: [],
				effect: "spell",
				severed: false,
				revealed: false,
				gx: 48,
				gy: 62
			}),
			node({
				id: "hinge",
				name: "Shifting hinge",
				domain: "continuity",
				tier: "obfuscated",
				integrity: 100,
				density: 12,
				baseline: 6,
				dependsOn: [],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 74,
				gy: 28
			}),
			node({
				id: "void",
				name: "Void clasp",
				domain: "continuity",
				tier: "obfuscated",
				integrity: 100,
				density: 13,
				baseline: 4,
				dependsOn: [],
				effect: "core",
				severed: false,
				revealed: false,
				gx: 50,
				gy: 18
			})
		],
		convo: "sovereign-pre",
		downConvo: "sovereign-down",
		weapon: "baton",
		polymorphic: true,
		tier: 5,
		vision: 6
	},
	echo: {
		template: "echo",
		name: "Echo construct",
		title: "Borrowed joints",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/automaton.png?v=4",
		scale: .95,
		faction: "relsec",
		hostile: true,
		aggro: true,
		body: 6,
		attrs: ATTR({
			body: 6,
			finesse: 4,
			mind: 3
		}),
		skills: skills({ mechanics: 20 }),
		nodes: [node({
			id: "coupling",
			name: "Power coupling",
			domain: "matter",
			tier: "stress",
			integrity: 100,
			density: 5,
			baseline: 20,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 40
		}), node({
			id: "mount",
			name: "Arm mount",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 4,
			baseline: 25,
			dependsOn: ["coupling"],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 72,
			gy: 60
		})],
		convo: "sovereign-pre",
		weapon: "piston",
		tier: 2,
		vision: 4
	},
	automaton: {
		template: "automaton",
		name: "Rogue automaton",
		title: "Unlicensed labor",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/automaton.png?v=4",
		scale: 1,
		faction: "engineers",
		hostile: true,
		aggro: true,
		body: 7,
		attrs: ATTR({
			body: 7,
			finesse: 3,
			mind: 2,
			perception: 3
		}),
		skills: skills({ mechanics: 10 }),
		nodes: [node({
			id: "coupling",
			name: "Power coupling",
			domain: "matter",
			tier: "stress",
			integrity: 100,
			density: 4,
			baseline: 50,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 36,
			gy: 36
		}), node({
			id: "mount",
			name: "Tool mount",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 55,
			dependsOn: ["coupling"],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 62
		})],
		convo: "enc-auto",
		weapon: "piston",
		tier: 1,
		vision: 3
	},
	nessa: {
		template: "nessa",
		name: "Nessa",
		title: "Stall keeper",
		portrait: "/game/portraits/nessa.jpg?v=5",
		sprite: "/game/sprites/nessa.png?v=5",
		scale: .96,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			presence: 6,
			mind: 5,
			perception: 6,
			finesse: 5
		}),
		skills: skills({
			barter: 62,
			speech: 40,
			mechanics: 22
		}),
		nodes: [node({
			id: "scale",
			name: "Stall scale",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 2,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 40,
			gy: 48
		})],
		convo: "nessa",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	bram: {
		template: "bram",
		name: "Bram",
		title: "Hauler",
		portrait: "/game/portraits/bram.jpg?v=5",
		sprite: "/game/sprites/bram.png?v=5",
		scale: 1.04,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 7,
		attrs: ATTR({
			body: 7,
			will: 6,
			presence: 4,
			finesse: 4
		}),
		skills: skills({
			mechanics: 36,
			speech: 28
		}),
		nodes: [node({
			id: "shoulder",
			name: "Haul shoulder",
			domain: "biology",
			tier: "bond",
			integrity: 70,
			density: 2,
			baseline: 66,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 44,
			gy: 50
		})],
		convo: "bram",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	odell: {
		template: "odell",
		name: "Odell",
		title: "Ward stitcher",
		portrait: "/game/portraits/odell.jpg?v=5",
		sprite: "/game/sprites/odell.png?v=5",
		scale: .98,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			mind: 7,
			will: 7,
			perception: 6,
			presence: 5,
			body: 4
		}),
		skills: skills({
			medicine: 70,
			psychology: 36,
			speech: 32
		}),
		nodes: [node({
			id: "hands",
			name: "Stitching hands",
			domain: "biology",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 48,
			gy: 46
		})],
		convo: "odell",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	quill: {
		template: "quill",
		name: "Clerk Quill",
		title: "Bureau pricing",
		portrait: "/game/portraits/vane.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: .9,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			mind: 7,
			will: 5,
			presence: 5,
			perception: 6,
			body: 4
		}),
		skills: skills({
			speech: 48,
			history: 40,
			engineering: 22
		}),
		nodes: [node({
			id: "stamp",
			name: "Price stamp",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 46,
			gy: 40
		})],
		convo: "quill",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	bruiser: {
		template: "bruiser",
		name: "Rubble",
		title: "Melee",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: 1,
		faction: "unbound",
		hostile: true,
		aggro: true,
		body: 7,
		attrs: ATTR({
			body: 7,
			finesse: 4,
			will: 5,
			perception: 4
		}),
		skills: skills({ mechanics: 18 }),
		nodes: [node({
			id: "hip",
			name: "Hip drive",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 70,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 30,
			gy: 70
		}), node({
			id: "bar",
			name: "Iron bar",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 68,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 40
		})],
		convo: "enc-auto",
		weapon: "prybar",
		tier: 1,
		vision: 3
	},
	warden: {
		template: "warden",
		name: "Plate warden",
		title: "Defender",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: 1.02,
		faction: "bureau",
		hostile: true,
		aggro: true,
		body: 7,
		attrs: ATTR({
			body: 7,
			will: 6,
			finesse: 3,
			perception: 4
		}),
		skills: skills({ mechanics: 26 }),
		nodes: [
			node({
				id: "orders",
				name: "Gallery order",
				domain: "mind",
				tier: "bond",
				integrity: 100,
				density: 2,
				baseline: 74,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 22
			}),
			node({
				id: "step",
				name: "Hold the step",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 2,
				baseline: 76,
				dependsOn: ["orders"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 70
			}),
			node({
				id: "plate",
				name: "Tower plate",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 84,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 50,
				gy: 36
			}),
			node({
				id: "maul",
				name: "Short maul",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 70,
				dependsOn: ["plate"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 78,
				gy: 64
			})
		],
		convo: "sentry",
		weapon: "baton",
		tier: 2,
		vision: 3
	},
	chanter: {
		template: "chanter",
		name: "Line caller",
		title: "Support",
		portrait: "/game/portraits/odell.jpg?v=5",
		sprite: "/game/sprites/odell.png?v=5",
		scale: .96,
		faction: "bureau",
		hostile: true,
		aggro: true,
		body: 4,
		attrs: ATTR({
			mind: 6,
			presence: 6,
			will: 5,
			finesse: 4,
			body: 4
		}),
		skills: skills({
			speech: 40,
			medicine: 22
		}),
		nodes: [node({
			id: "hymn",
			name: "Cadence hymn",
			domain: "mind",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 70,
			dependsOn: [],
			effect: "spell",
			severed: false,
			revealed: false,
			gx: 36,
			gy: 30
		}), node({
			id: "voice",
			name: "Carried voice",
			domain: "mind",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 66,
			dependsOn: ["hymn"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 58
		})],
		convo: "sentry",
		weapon: "fist",
		tier: 1,
		vision: 2
	},
	lurker: {
		template: "lurker",
		name: "Ash cutter",
		title: "Ambusher",
		portrait: "/game/portraits/sera.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: .94,
		faction: "ash",
		hostile: true,
		aggro: true,
		body: 5,
		attrs: ATTR({
			finesse: 7,
			perception: 6,
			body: 5
		}),
		skills: skills({
			sneak: 48,
			mechanics: 16
		}),
		nodes: [node({
			id: "cover",
			name: "Pipe cover",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 64,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 28,
			gy: 28
		}), node({
			id: "knife",
			name: "Seam knife",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 70,
			dependsOn: ["cover"],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 60
		})],
		convo: "enc-auto",
		weapon: "hook",
		tier: 1,
		vision: 2
	},
	mill: {
		template: "mill",
		name: "Unlicensed mill",
		title: "Machine",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/mill.png?v=3",
		scale: 1.05,
		faction: "engineers",
		hostile: true,
		aggro: true,
		body: 8,
		attrs: ATTR({
			body: 8,
			finesse: 3,
			mind: 2,
			perception: 3
		}),
		skills: skills({ mechanics: 12 }),
		nodes: [
			node({
				id: "power",
				name: "Mill power",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 3,
				baseline: 70,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 24
			}),
			node({
				id: "walk",
				name: "Track walk",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 72,
				dependsOn: ["power"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 24,
				gy: 70
			}),
			node({
				id: "coolant",
				name: "Coolant jacket",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 68,
				dependsOn: ["power"],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 55,
				gy: 40
			}),
			node({
				id: "bit",
				name: "Cutting bit",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 74,
				dependsOn: ["coolant"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 78,
				gy: 64
			}),
			node({
				id: "governor",
				name: "Governor",
				domain: "mind",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 60,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 70,
				gy: 18
			})
		],
		convo: "enc-auto",
		weapon: "piston",
		tier: 2,
		vision: 3
	},
	surge: {
		template: "surge",
		name: "Pressure surge",
		title: "The pump, answering",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/pump.png",
		scale: 1.1,
		faction: "bureau",
		hostile: true,
		aggro: true,
		body: 8,
		attrs: ATTR({
			body: 6,
			finesse: 4,
			will: 5,
			perception: 3
		}),
		skills: skills({ mechanics: 20 }),
		nodes: [
			node({
				id: "boiler",
				name: "Surge boiler",
				domain: "matter",
				tier: "anchor",
				integrity: 100,
				density: 3,
				baseline: 80,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				pattern: "pressure-feed",
				gx: 28,
				gy: 24
			}),
			node({
				id: "pipe",
				name: "Live pipe",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 76,
				dependsOn: ["boiler"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 28,
				gy: 68
			}),
			node({
				id: "jet",
				name: "Jet",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 72,
				dependsOn: ["pipe"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 74,
				gy: 46
			})
		],
		convo: "enc-auto",
		weapon: "piston",
		tier: 2,
		vision: 4
	},
	gearhulk: {
		template: "gearhulk",
		name: "Throat gear",
		title: "The colossus, answering",
		portrait: "/game/portraits/sovereign.jpg?v=4",
		sprite: "/game/sprites/automaton.png?v=4",
		scale: 1.16,
		faction: "engineers",
		hostile: true,
		aggro: true,
		body: 9,
		attrs: ATTR({
			body: 8,
			finesse: 3,
			will: 6,
			perception: 3
		}),
		skills: skills({ mechanics: 22 }),
		nodes: [
			node({
				id: "mask",
				name: "Limestone mask",
				domain: "matter",
				tier: "anchor",
				integrity: 100,
				density: 4,
				baseline: 70,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				pattern: "load-chain",
				gx: 30,
				gy: 22
			}),
			node({
				id: "throat",
				name: "Turbine throat",
				domain: "matter",
				tier: "stress",
				integrity: 100,
				density: 4,
				baseline: 74,
				dependsOn: ["mask"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 30,
				gy: 70
			}),
			node({
				id: "bite",
				name: "Gear bite",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 70,
				dependsOn: ["throat"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 74,
				gy: 48
			})
		],
		convo: "enc-auto",
		weapon: "piston",
		tier: 3,
		vision: 4
	},
	engineward: {
		template: "engineward",
		name: "Rank warden",
		title: "The engine, answering",
		portrait: "/game/portraits/vane.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: 1.08,
		faction: "bureau",
		hostile: true,
		aggro: true,
		body: 8,
		attrs: ATTR({
			body: 6,
			mind: 6,
			will: 7,
			finesse: 4,
			perception: 5
		}),
		skills: skills({ mechanics: 30 }),
		nodes: [
			node({
				id: "orders",
				name: "Rank order",
				domain: "continuity",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 50,
				dependsOn: [],
				effect: "none",
				severed: false,
				revealed: false,
				gx: 22,
				gy: 24
			}),
			node({
				id: "step",
				name: "Enforced step",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 3,
				baseline: 74,
				dependsOn: ["orders"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 22,
				gy: 72
			}),
			node({
				id: "siphon",
				name: "Siphon child",
				domain: "causal",
				tier: "stress",
				integrity: 100,
				density: 5,
				baseline: 60,
				dependsOn: [],
				effect: "flow",
				severed: false,
				revealed: false,
				gx: 55,
				gy: 30
			}),
			node({
				id: "lash",
				name: "Rank lash",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 66,
				dependsOn: ["siphon"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 78,
				gy: 62
			}),
			node({
				id: "plate",
				name: "Ceremony plate",
				domain: "matter",
				tier: "bond",
				integrity: 100,
				density: 4,
				baseline: 80,
				dependsOn: [],
				effect: "armor",
				severed: false,
				revealed: false,
				gx: 48,
				gy: 48
			})
		],
		convo: "sentry",
		weapon: "baton",
		tier: 3,
		vision: 4
	},
	cinder: {
		template: "cinder",
		name: "Cinder",
		title: "Reed moth",
		portrait: "/game/portraits/cinder.jpg?v=5",
		sprite: "/game/sprites/cinder.png?v=5",
		scale: .55,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 3,
		attrs: ATTR({
			body: 3,
			finesse: 8,
			perception: 8,
			will: 4,
			mind: 2,
			presence: 3
		}),
		skills: skills({
			survival: 40,
			sneak: 55
		}),
		nodes: [
			node({
				id: "hunger",
				name: "Hunger",
				domain: "biology",
				tier: "stress",
				integrity: 70,
				density: 2,
				baseline: 60,
				dependsOn: [],
				effect: "life",
				severed: false,
				revealed: false,
				gx: 28,
				gy: 30
			}),
			node({
				id: "latch",
				name: "Latch",
				domain: "biology",
				tier: "bond",
				integrity: 80,
				density: 2,
				baseline: 70,
				dependsOn: ["hunger"],
				effect: "motive",
				severed: false,
				revealed: false,
				gx: 28,
				gy: 68
			}),
			node({
				id: "bite",
				name: "Bite",
				domain: "biology",
				tier: "bond",
				integrity: 90,
				density: 2,
				baseline: 74,
				dependsOn: ["latch"],
				effect: "weapon",
				severed: false,
				revealed: false,
				gx: 70,
				gy: 48
			})
		],
		convo: "cinder",
		weapon: "bite",
		tier: 0,
		vision: 0
	},
	lark: {
		template: "lark",
		name: "Lark",
		title: "Stack runner",
		portrait: "/game/portraits/lark.jpg?v=5",
		sprite: "/game/sprites/lark.png?v=5",
		scale: .96,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			finesse: 6,
			perception: 6,
			presence: 5,
			body: 5
		}),
		skills: skills({
			survival: 48,
			speech: 30
		}),
		nodes: [],
		convo: "lark",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	harl: {
		template: "harl",
		name: "Harl",
		title: "Kiln master",
		portrait: "/game/portraits/harl.jpg?v=5",
		sprite: "/game/sprites/harl.png?v=5",
		scale: 1,
		faction: "engineers",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			mind: 6,
			will: 6,
			perception: 5,
			finesse: 4,
			presence: 4
		}),
		skills: skills({
			engineering: 64,
			mechanics: 58,
			speech: 28
		}),
		nodes: [],
		convo: "harl",
		weapon: "prybar",
		tier: 1,
		vision: 0
	},
	cress: {
		template: "cress",
		name: "Cress",
		title: "Stamp clerk",
		portrait: "/game/portraits/cress.jpg?v=5",
		sprite: "/game/sprites/cress.png?v=5",
		scale: 1,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			presence: 7,
			mind: 6,
			will: 5,
			body: 4,
			finesse: 4,
			perception: 5
		}),
		skills: skills({
			speech: 62,
			barter: 48,
			history: 40
		}),
		nodes: [node({
			id: "writ",
			name: "Stamp writ",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 46
		})],
		convo: "cress",
		weapon: "baton",
		tier: 1,
		vision: 0
	},
	jun: {
		template: "jun",
		name: "Jun",
		title: "Board keeper",
		portrait: "/game/portraits/jun.jpg?v=5",
		sprite: "/game/sprites/jun.png?v=5",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			presence: 6,
			mind: 5,
			finesse: 5,
			perception: 6,
			body: 4,
			will: 5
		}),
		skills: skills({
			barter: 66,
			speech: 44,
			medicine: 22
		}),
		nodes: [],
		convo: "jun",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	teb: {
		template: "teb",
		name: "Teb",
		title: "Brick sleeper",
		portrait: "/game/portraits/pell.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			body: 5,
			will: 6,
			perception: 5,
			presence: 3,
			finesse: 4,
			mind: 4
		}),
		skills: skills({
			survival: 50,
			speech: 22
		}),
		nodes: [],
		convo: "teb",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	nim: {
		template: "nim",
		name: "Nim",
		title: "Cellar",
		portrait: "/game/portraits/pell.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: .82,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			finesse: 7,
			perception: 7,
			mind: 5,
			presence: 4,
			body: 3,
			will: 4
		}),
		skills: skills({
			lockwork: 58,
			sneak: 52,
			audit: 24
		}),
		nodes: [],
		convo: "nim",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	voss: {
		template: "voss",
		name: "Voss",
		title: "Unbound runner",
		portrait: "/game/portraits/kael.jpg?v=4",
		sprite: "/game/sprites/kael.png?v=4",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			finesse: 6,
			will: 5,
			presence: 4,
			mind: 4,
			perception: 5
		}),
		skills: skills({
			speech: 30,
			mechanics: 34
		}),
		nodes: [node({
			id: "arm",
			name: "Baton arm",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 74,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: false,
			gx: 48,
			gy: 48
		})],
		convo: "voss",
		weapon: "baton",
		tier: 1,
		vision: 0
	},
	hale: {
		template: "hale",
		name: "Hale",
		title: "Table keeper",
		portrait: "/game/portraits/hale.jpg?v=5",
		sprite: "/game/sprites/hale.png?v=5",
		scale: 1,
		faction: "engineers",
		hostile: false,
		aggro: false,
		body: 6,
		attrs: ATTR({
			body: 6,
			mind: 5,
			will: 6,
			perception: 5,
			finesse: 4,
			presence: 4
		}),
		skills: skills({
			engineering: 60,
			mechanics: 55,
			speech: 26
		}),
		nodes: [],
		convo: "hale",
		weapon: "prybar",
		tier: 1,
		vision: 0
	},
	rue: {
		template: "rue",
		name: "Rue",
		title: "Yard stamp",
		portrait: "/game/portraits/varr.jpg",
		sprite: "/game/sprites/enforcer.png?v=3",
		scale: 1,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			presence: 6,
			mind: 6,
			will: 5,
			body: 4,
			finesse: 4,
			perception: 6
		}),
		skills: skills({
			speech: 58,
			barter: 44,
			history: 36
		}),
		nodes: [node({
			id: "writ",
			name: "Yard writ",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 46
		})],
		convo: "rue",
		weapon: "baton",
		tier: 1,
		vision: 0
	},
	ske: {
		template: "ske",
		name: "Ske",
		title: "Bay",
		portrait: "/game/portraits/ske.jpg?v=5",
		sprite: "/game/sprites/ske.png?v=5",
		scale: .84,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			finesse: 7,
			perception: 7,
			mind: 5,
			presence: 4,
			body: 3,
			will: 4
		}),
		skills: skills({
			lockwork: 54,
			sneak: 48,
			audit: 20
		}),
		nodes: [],
		convo: "ske",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	wick: {
		template: "wick",
		name: "Wick",
		title: "Plate sleeper",
		portrait: "/game/portraits/pell.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			body: 5,
			will: 5,
			perception: 5,
			presence: 3,
			finesse: 4,
			mind: 3
		}),
		skills: skills({
			survival: 46,
			speech: 18
		}),
		nodes: [],
		convo: "wick",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	orla: {
		template: "orla",
		name: "Orla",
		title: "Glass",
		portrait: "/game/portraits/orla.jpg?v=5",
		sprite: "/game/sprites/orla.png?v=5",
		scale: 1,
		faction: "engineers",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			body: 5,
			mind: 6,
			will: 6,
			perception: 5,
			finesse: 4,
			presence: 4
		}),
		skills: skills({
			engineering: 62,
			mechanics: 48,
			speech: 24
		}),
		nodes: [],
		convo: "orla",
		weapon: "prybar",
		tier: 1,
		vision: 0
	},
	ness: {
		template: "ness",
		name: "Ness",
		title: "Glass stamp",
		portrait: "/game/portraits/ness.jpg?v=5",
		sprite: "/game/sprites/ness.png?v=5",
		scale: 1,
		faction: "bureau",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			presence: 6,
			mind: 6,
			will: 5,
			body: 4,
			finesse: 4,
			perception: 6
		}),
		skills: skills({
			speech: 56,
			barter: 42,
			history: 34
		}),
		nodes: [node({
			id: "writ",
			name: "Glass writ",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 40,
			gy: 46
		})],
		convo: "ness",
		weapon: "baton",
		tier: 1,
		vision: 0
	},
	fen: {
		template: "fen",
		name: "Fen",
		title: "Cullet",
		portrait: "/game/portraits/pell.jpg?v=4",
		sprite: "/game/sprites/pell.png?v=4",
		scale: .86,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 4,
		attrs: ATTR({
			finesse: 6,
			perception: 6,
			mind: 5,
			presence: 4,
			body: 3,
			will: 4
		}),
		skills: skills({
			lockwork: 50,
			sneak: 40,
			mechanics: 36
		}),
		nodes: [],
		convo: "fen",
		weapon: "fist",
		tier: 0,
		vision: 0
	},
	sol: {
		template: "sol",
		name: "Sol",
		title: "Cullet runner",
		portrait: "/game/portraits/ske.jpg?v=5",
		sprite: "/game/sprites/ske.png?v=5",
		scale: 1,
		faction: "unbound",
		hostile: false,
		aggro: false,
		body: 5,
		attrs: ATTR({
			finesse: 6,
			body: 5,
			perception: 5,
			presence: 4,
			mind: 4,
			will: 4
		}),
		skills: skills({
			survival: 48,
			speech: 30,
			engineering: 22
		}),
		nodes: [],
		convo: "sol",
		weapon: "fist",
		tier: 0,
		vision: 0
	}
};
var SPAWNS = [
	{
		id: "tobin",
		template: "tobin",
		map: "sinks",
		x: 5,
		y: 3
	},
	{
		id: "wren",
		template: "wren",
		map: "sinks",
		x: 3,
		y: 7
	},
	{
		id: "pell",
		template: "pell",
		map: "sinks",
		x: 17,
		y: 3
	},
	{
		id: "varr",
		template: "varr",
		map: "sinks",
		x: 6,
		y: 13
	},
	{
		id: "en1",
		template: "enforcer",
		map: "sinks",
		x: 4,
		y: 13,
		name: "Enforcer Moll"
	},
	{
		id: "en2",
		template: "enforcer",
		map: "sinks",
		x: 8,
		y: 14,
		name: "Enforcer Hess"
	},
	{
		id: "hask",
		template: "hask",
		map: "quarry",
		x: 7,
		y: 10
	},
	{
		id: "lin",
		template: "lin",
		map: "quarry",
		x: 9,
		y: 9
	},
	{
		id: "kael",
		template: "kael",
		map: "quarry",
		x: 13,
		y: 5
	},
	{
		id: "rel1",
		template: "relsec",
		map: "quarry",
		x: 16,
		y: 7,
		name: "Striker Pye",
		aggro: false,
		hostile: false
	},
	{
		id: "ives",
		template: "ives",
		map: "rust",
		x: 4,
		y: 3
	},
	{
		id: "mara",
		template: "mara",
		map: "rust",
		x: 14,
		y: 6
	},
	{
		id: "sera",
		template: "sera",
		map: "rust",
		x: 6,
		y: 11
	},
	{
		id: "vane",
		template: "vane",
		map: "citadel",
		x: 12,
		y: 4
	},
	{
		id: "sentry",
		template: "sentry",
		map: "citadel",
		x: 8,
		y: 8
	},
	{
		id: "guard1",
		template: "guard",
		map: "citadel",
		x: 19,
		y: 5,
		name: "Guard Senn"
	},
	{
		id: "guard2",
		template: "guard",
		map: "citadel",
		x: 16,
		y: 4,
		name: "Guard Oll"
	},
	{
		id: "sovereign",
		template: "sovereign",
		map: "spire",
		x: 8,
		y: 6
	},
	{
		id: "echo",
		template: "echo",
		map: "spire",
		x: 11,
		y: 8,
		aggro: false,
		hostile: false
	},
	{
		id: "nessa",
		template: "nessa",
		map: "haven",
		x: 7,
		y: 3
	},
	{
		id: "bram",
		template: "bram",
		map: "haven",
		x: 8,
		y: 8
	},
	{
		id: "odell",
		template: "odell",
		map: "haven",
		x: 6,
		y: 9
	},
	{
		id: "quill",
		template: "quill",
		map: "haven",
		x: 15,
		y: 10
	},
	{
		id: "lark",
		template: "lark",
		map: "road",
		x: 22,
		y: 4
	},
	{
		id: "cinder",
		template: "cinder",
		map: "sinks",
		x: 30,
		y: 3
	},
	{
		id: "jot",
		template: "lark",
		map: "sinks",
		x: 16,
		y: 19,
		name: "Jot",
		convo: "porter"
	},
	{
		id: "sela",
		template: "pell",
		map: "haven",
		x: 31,
		y: 8,
		name: "Sela",
		convo: "sela"
	},
	{
		id: "rill",
		template: "hask",
		map: "quarry",
		x: 22,
		y: 16,
		name: "Rill",
		convo: "rill"
	},
	{
		id: "nell",
		template: "pell",
		map: "rust",
		x: 12,
		y: 17,
		name: "Nell",
		convo: "nell"
	},
	{
		id: "kel",
		template: "lark",
		map: "tundra",
		x: 14,
		y: 6,
		name: "Kel",
		convo: "kel"
	},
	{
		id: "pip",
		template: "pell",
		map: "haven",
		x: 14,
		y: 11,
		name: "Pip",
		convo: "pip"
	},
	{
		id: "shade",
		template: "lurker",
		map: "road",
		x: 30,
		y: 12,
		name: "Lamp shade",
		convo: "shade",
		hostile: false,
		aggro: false
	},
	{
		id: "rubble",
		template: "bruiser",
		map: "quarry",
		x: 28,
		y: 8
	},
	{
		id: "mill1",
		template: "mill",
		map: "quarry",
		x: 22,
		y: 18,
		name: "Unlicensed mill"
	},
	{
		id: "warden1",
		template: "warden",
		map: "citadel",
		x: 28,
		y: 19,
		name: "Plate warden"
	},
	{
		id: "caller1",
		template: "chanter",
		map: "citadel",
		x: 3,
		y: 4,
		name: "Line caller"
	},
	{
		id: "cutter1",
		template: "lurker",
		map: "rust",
		x: 10,
		y: 17,
		name: "Ash cutter"
	},
	{
		id: "doss",
		template: "pell",
		map: "sinks",
		x: 24,
		y: 5,
		name: "Doss",
		convo: "doss"
	},
	{
		id: "ada",
		template: "pell",
		map: "haven",
		x: 27,
		y: 7,
		name: "Ada",
		convo: "ada"
	},
	{
		id: "pim",
		template: "hask",
		map: "quarry",
		x: 18,
		y: 16,
		name: "Pim",
		convo: "pim"
	},
	{
		id: "sarn",
		template: "pell",
		map: "citadel",
		x: 14,
		y: 8,
		name: "Sarn",
		convo: "sarn"
	},
	{
		id: "drift",
		template: "lark",
		map: "tundra",
		x: 8,
		y: 15,
		name: "Drift",
		convo: "drift"
	},
	{
		id: "moss",
		template: "lark",
		map: "road",
		x: 17,
		y: 12,
		name: "Moss",
		convo: "moss"
	},
	{
		id: "brin",
		template: "pell",
		map: "sinks",
		x: 6,
		y: 18,
		name: "Brin",
		convo: "brin"
	},
	{
		id: "servo",
		template: "mill",
		map: "sinks",
		x: 3,
		y: 20,
		name: "Drowned servo",
		convo: "enc-auto",
		hostile: false,
		aggro: false
	},
	{
		id: "vetch",
		template: "pell",
		map: "haven",
		x: 8,
		y: 15,
		name: "Vetch",
		convo: "vetch"
	},
	{
		id: "holt",
		template: "hask",
		map: "quarry",
		x: 6,
		y: 17,
		name: "Holt",
		convo: "holt"
	},
	{
		id: "crew1",
		template: "mill",
		map: "quarry",
		x: 5,
		y: 19,
		name: "Night mill",
		convo: "enc-auto",
		hostile: false,
		aggro: false
	},
	{
		id: "crew2",
		template: "mill",
		map: "quarry",
		x: 8,
		y: 19,
		name: "Night mill",
		convo: "enc-auto",
		hostile: false,
		aggro: false
	},
	{
		id: "ime",
		template: "pell",
		map: "citadel",
		x: 21,
		y: 18,
		name: "Ime",
		convo: "ime"
	},
	{
		id: "harl",
		template: "harl",
		map: "kiln",
		x: 4,
		y: 6
	},
	{
		id: "cress",
		template: "cress",
		map: "kiln",
		x: 22,
		y: 16
	},
	{
		id: "jun",
		template: "jun",
		map: "kiln",
		x: 30,
		y: 7
	},
	{
		id: "teb",
		template: "teb",
		map: "kiln",
		x: 8,
		y: 14
	},
	{
		id: "nim",
		template: "nim",
		map: "kiln",
		x: 6,
		y: 15
	},
	{
		id: "voss",
		template: "voss",
		map: "kiln",
		x: 14,
		y: 9
	},
	{
		id: "mite",
		template: "mill",
		map: "kiln",
		x: 10,
		y: 19,
		name: "Kiln mite",
		convo: "mite",
		hostile: false,
		aggro: false
	},
	{
		id: "hale",
		template: "hale",
		map: "switch",
		x: 18,
		y: 9
	},
	{
		id: "rue",
		template: "rue",
		map: "switch",
		x: 5,
		y: 6
	},
	{
		id: "ske",
		template: "ske",
		map: "switch",
		x: 6,
		y: 12
	},
	{
		id: "wick",
		template: "wick",
		map: "switch",
		x: 20,
		y: 12
	},
	{
		id: "yardrat",
		template: "mill",
		map: "switch",
		x: 8,
		y: 15,
		name: "Yard rat",
		convo: "yard-rat",
		hostile: false,
		aggro: false
	},
	{
		id: "orla",
		template: "orla",
		map: "pane",
		x: 6,
		y: 8
	},
	{
		id: "ness",
		template: "ness",
		map: "pane",
		x: 23,
		y: 7
	},
	{
		id: "fen",
		template: "fen",
		map: "pane",
		x: 12,
		y: 12
	},
	{
		id: "sol",
		template: "sol",
		map: "road",
		x: 26,
		y: 4
	},
	{
		id: "panemoth",
		template: "mill",
		map: "pane",
		x: 10,
		y: 17,
		name: "Glass moth",
		convo: "pane-moth",
		hostile: false,
		aggro: false
	}
];
function machine(id, template, name, mapId, x, y, nodes, specials, baseline = 70) {
	return {
		id,
		template,
		name,
		mapId,
		x,
		y,
		sprite: "/game/sprites/pump.png",
		nodes,
		specials,
		baseline
	};
}
var MACHINES = [
	machine("workbench", "bench", "Reclamation bench", "sinks", 6, 8, [node({
		id: "vise",
		name: "Vise screw",
		domain: "matter",
		tier: "bond",
		integrity: 80,
		density: 2,
		baseline: 90,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 40,
		gy: 40
	})], [
		{
			id: "rest",
			label: "Rest and sort the ledger",
			text: "Sleep in shifts beside the boiler. Wounds close. Focus returns."
		},
		{
			id: "bind",
			label: "Field binding",
			text: "Medicine, cloth, and ten minutes. A biological mend that does not pretend to be magic."
		},
		{
			id: "service",
			label: "Reseat the equipped weapon",
			text: "Mechanics and focus. Worn gear hits like it means it again."
		},
		{
			id: "gun",
			label: "Build a rivet gun",
			text: "Needs plate scrap and a steady hand. Mechanics decides if it chambers."
		}
	]),
	machine("pump", "pump", "District pump", "sinks", 14, 7, [
		node({
			id: "boiler",
			name: "Boiler",
			domain: "matter",
			tier: "anchor",
			integrity: 100,
			density: 3,
			baseline: 86,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 20,
			gy: 30
		}),
		node({
			id: "pipe",
			name: "Pressure pipe",
			domain: "matter",
			tier: "bond",
			integrity: 70,
			density: 3,
			baseline: 75,
			dependsOn: ["boiler"],
			effect: "none",
			severed: false,
			revealed: false,
			pattern: "pressure-feed",
			gx: 42,
			gy: 55
		}),
		node({
			id: "valve",
			name: "Seated valve",
			domain: "matter",
			tier: "stress",
			integrity: 12,
			density: 4,
			baseline: 24,
			dependsOn: ["pipe"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 68,
			gy: 22
		}),
		node({
			id: "bypass",
			name: "Bleed bypass",
			domain: "matter",
			tier: "bond",
			integrity: 90,
			density: 3,
			baseline: 70,
			dependsOn: ["pipe"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 82,
			gy: 58
		}),
		node({
			id: "lockout",
			name: "Bureau lockout",
			domain: "matter",
			tier: "obfuscated",
			integrity: 100,
			density: 4,
			baseline: 40,
			dependsOn: ["pipe"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 28,
			gy: 74
		})
	], [{
		id: "face-surge",
		label: "Let the pressure answer",
		text: "The pump can be read, or it can be made to stand up. Boiler parents the pipe. The pipe parents the jet. Cutting the parent is a fight."
	}]),
	machine("grate", "grate", "Sludge grate", "sinks", 18, 4, [node({
		id: "hinge",
		name: "Seized hinge",
		domain: "matter",
		tier: "bond",
		integrity: 40,
		density: 2,
		baseline: 55,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 48,
		gy: 46
	})], [{
		id: "slip",
		label: "Drop through the crawl",
		text: "Wren's route, or a sneak that fits a maintenance body. You come up behind the checkpoint."
	}]),
	machine("yard", "crane", "Yard crane", "sinks", 11, 13, [
		node({
			id: "winch",
			name: "Winch brake",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 22,
			gy: 28
		}),
		node({
			id: "cable",
			name: "Load cable",
			domain: "matter",
			tier: "stress",
			integrity: 100,
			density: 3,
			baseline: 74,
			dependsOn: ["winch"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 48,
			gy: 48
		}),
		node({
			id: "engine",
			name: "Suspended engine",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 70,
			dependsOn: ["cable"],
			effect: "none",
			severed: false,
			revealed: false,
			fail: "crush",
			gx: 78,
			gy: 72
		})
	], [{
		id: "release",
		label: "Kick the winch",
		text: "The cable is a parent. Cut it, and the engine becomes a fact about the ground."
	}]),
	machine("head", "head", "Sump head", "sinks", 19, 4, [node({
		id: "feed",
		name: "Gallery feed",
		domain: "matter",
		tier: "bond",
		integrity: 0,
		density: 3,
		baseline: 70,
		dependsOn: [],
		effect: "none",
		severed: true,
		revealed: false,
		pattern: "pressure-feed",
		gx: 28,
		gy: 36
	}), node({
		id: "leaf",
		name: "Sump door",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 80,
		dependsOn: ["feed"],
		effect: "flow",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 58
	})], []),
	machine("bar", "bar", "Plate bar", "sinks", 4, 12, [node({
		id: "sign",
		name: "Bureau signature",
		domain: "matter",
		tier: "bond",
		integrity: 0,
		density: 2,
		baseline: 80,
		dependsOn: [],
		effect: "none",
		severed: true,
		revealed: false,
		gx: 30,
		gy: 40
	}), node({
		id: "stair",
		name: "Plate stair",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 84,
		dependsOn: ["sign"],
		effect: "flow",
		severed: false,
		revealed: false,
		gx: 68,
		gy: 48
	})], []),
	machine("jack", "jack", "Settling crown", "sinks", 20, 7, [node({
		id: "footing",
		name: "Gallery footing",
		domain: "matter",
		tier: "stress",
		integrity: 22,
		density: 3,
		baseline: 64,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: false,
		gx: 34,
		gy: 62
	}), node({
		id: "crown",
		name: "Crown",
		domain: "matter",
		tier: "bond",
		integrity: 90,
		density: 3,
		baseline: 70,
		dependsOn: ["footing"],
		effect: "none",
		severed: false,
		revealed: false,
		gx: 66,
		gy: 28
	})], [{
		id: "brace",
		label: "Brace the crown",
		text: "Set your weight under the load. The footing is held. It is not healed."
	}]),
	machine("cistern", "cistern", "Ward cistern", "haven", 16, 4, [
		node({
			id: "main",
			name: "Cistern main",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 72,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			pattern: "pressure-feed",
			gx: 24,
			gy: 30
		}),
		node({
			id: "market",
			name: "Stall leg",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 2,
			baseline: 74,
			dependsOn: ["main"],
			effect: "flow",
			severed: true,
			revealed: false,
			gx: 72,
			gy: 24
		}),
		node({
			id: "clinic",
			name: "Clinic leg",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 2,
			baseline: 74,
			dependsOn: ["main"],
			effect: "flow",
			severed: true,
			revealed: false,
			gx: 72,
			gy: 70
		})
	], [
		{
			id: "to-market",
			label: "Send the feed to the stall",
			text: "The clinic tap goes dry. The stall takes whatever the Sinks are sending."
		},
		{
			id: "to-clinic",
			label: "Send the feed to the clinic",
			text: "The stall goes dry. The stitcher takes the feed."
		},
		{
			id: "seat-both",
			label: "Seat a shared split",
			text: "Both legs drink, if the main has anything. This is a mend, not a favor."
		}
	]),
	machine("crane", "crane", "Quarry crane", "quarry", 12, 4, [
		node({
			id: "boom",
			name: "Boom cable",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 4,
			baseline: 60,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 24,
			gy: 24
		}),
		node({
			id: "brake",
			name: "Brake pawl",
			domain: "matter",
			tier: "stress",
			integrity: 100,
			density: 4,
			baseline: 77,
			dependsOn: ["boom"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 50,
			gy: 42
		}),
		node({
			id: "slab",
			name: "Suspended slab",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 4,
			baseline: 66,
			dependsOn: ["brake"],
			effect: "none",
			severed: false,
			revealed: false,
			fail: "crush",
			pattern: "load-chain",
			gx: 78,
			gy: 70
		})
	], [{
		id: "drop",
		label: "Cut the brake",
		text: "The slab hangs on the pawl. Sever that parent and the load falls on whoever is standing under the boom."
	}]),
	machine("guildbench", "bench", "Guild bench", "rust", 6, 6, [node({
		id: "lamp",
		name: "Bench lamp",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 80,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 40,
		gy: 40
	})], [{
		id: "rest",
		label: "Rest and sort the ledger",
		text: "The guild will not charge you for the floor."
	}]),
	machine("hearth", "hearth", "Tenement hearth", "rust", 8, 7, [
		node({
			id: "haul",
			name: "Stone haul",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			pattern: "load-chain",
			gx: 22,
			gy: 34
		}),
		node({
			id: "bed",
			name: "Fire bed",
			domain: "matter",
			tier: "stress",
			integrity: 18,
			density: 3,
			baseline: 60,
			dependsOn: ["haul"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 48,
			gy: 58
		}),
		node({
			id: "beds",
			name: "Sleeper flues",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 2,
			baseline: 74,
			dependsOn: ["bed"],
			effect: "flow",
			severed: true,
			revealed: false,
			gx: 78,
			gy: 22
		}),
		node({
			id: "hall",
			name: "Guild flue",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 2,
			baseline: 74,
			dependsOn: ["bed"],
			effect: "flow",
			severed: true,
			revealed: false,
			gx: 78,
			gy: 76
		})
	], [
		{
			id: "bank",
			label: "Bank the fire",
			text: "Hold the bed with your weight. Heat stays. It does not invent a quarry."
		},
		{
			id: "to-beds",
			label: "Send the heat to the sleepers",
			text: "The guild hall goes cold. The tenement keeps the night."
		},
		{
			id: "to-hall",
			label: "Send the heat to the hall",
			text: "The benches stay warm. The sleepers do not."
		},
		{
			id: "seat-heat",
			label: "Seat both flues",
			text: "Hall and tenement drink from the same bed, if the bed has a parent."
		}
	]),
	machine("crucible", "crucible", "Crucible core", "citadel", 12, 7, [
		node({
			id: "conduits",
			name: "Ley conduits",
			domain: "causal",
			tier: "bond",
			integrity: 100,
			density: 6,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 22,
			gy: 60
		}),
		node({
			id: "siphon",
			name: "Worker siphon",
			domain: "causal",
			tier: "stress",
			integrity: 100,
			density: 8,
			baseline: 62,
			dependsOn: ["conduits"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 48,
			gy: 32
		}),
		node({
			id: "lifts",
			name: "Spire lifts",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 5,
			baseline: 80,
			dependsOn: ["siphon"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 78,
			gy: 24
		}),
		node({
			id: "rank",
			name: "Rank engine",
			domain: "continuity",
			tier: "anchor",
			integrity: 100,
			density: 9,
			baseline: 50,
			dependsOn: ["siphon"],
			effect: "core",
			severed: false,
			revealed: false,
			gx: 74,
			gy: 68
		})
	], [
		{
			id: "sever",
			label: "Sever the siphon",
			text: "The spires go dark. Hospitals too. No blood on the floor."
		},
		{
			id: "redirect",
			label: "Splice toward the Sinks",
			text: "Feed the undercity. The lifts will fail where the rich sleep."
		},
		{
			id: "seize",
			label: "Seize the rank engine",
			text: "Write yourself in as the baseline. The city keeps its shape. You own the shape."
		},
		{
			id: "face-engine",
			label: "Make the rank answer",
			text: "Orders parent the step. The siphon parents the lash. Plate is its own fact. This is a fight you can also refuse by using the machine itself."
		}
	], 60),
	machine("bellows", "bellows", "Sinks bellows", "sinks", 27, 4, [node({
		id: "lung",
		name: "Bellows lung",
		domain: "matter",
		tier: "anchor",
		integrity: 100,
		density: 3,
		baseline: 84,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 30,
		gy: 40
	}), node({
		id: "reed",
		name: "Throat reed",
		domain: "matter",
		tier: "stress",
		integrity: 100,
		density: 3,
		baseline: 78,
		dependsOn: ["lung"],
		effect: "flow",
		severed: false,
		revealed: false,
		pattern: "pressure-feed",
		gx: 62,
		gy: 28
	})], [
		{
			id: "seat-reed",
			label: "Seat the reed",
			text: "The pump drinks from this lung. Seat it and the district can take pressure again."
		},
		{
			id: "stop-lung",
			label: "Stop the lung",
			text: "Cut the reed. The pump can be perfect and the city still goes dry."
		},
		{
			id: "leave-drip",
			label: "Leave a drip on the reed",
			text: "The moth nests here. A little condensate is a meal. It is not a recruitment."
		}
	]),
	machine("colossus", "colossus", "Canyon colossus", "quarry", 26, 6, [node({
		id: "mask",
		name: "Limestone mask",
		domain: "matter",
		tier: "anchor",
		integrity: 100,
		density: 5,
		baseline: 70,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 28,
		gy: 30
	}), node({
		id: "throat",
		name: "Turbine throat",
		domain: "matter",
		tier: "stress",
		integrity: 100,
		density: 4,
		baseline: 74,
		dependsOn: ["mask"],
		effect: "flow",
		severed: false,
		revealed: false,
		pattern: "load-chain",
		gx: 68,
		gy: 55
	})], [
		{
			id: "wake-throat",
			label: "Wake the throat",
			text: "The crane cable is a child of this gear. Give it air."
		},
		{
			id: "still-throat",
			label: "Still the throat",
			text: "Stop the turbine. The crane keeps its cable and loses its parent."
		},
		{
			id: "face-gear",
			label: "Make the throat stand",
			text: "The mask parents the throat. The throat parents the bite. You can hit the body, or you can take the parent."
		}
	]),
	machine("orrery", "orrery", "Frost orrery", "citadel", 26, 8, [node({
		id: "drive",
		name: "Siphon drive",
		domain: "causal",
		tier: "bond",
		integrity: 0,
		density: 4,
		baseline: 70,
		dependsOn: [],
		effect: "flow",
		severed: true,
		revealed: true,
		gx: 36,
		gy: 40
	}), node({
		id: "rings",
		name: "Ice rings",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 3,
		baseline: 80,
		dependsOn: ["drive"],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 70,
		gy: 28
	})], [{
		id: "read-orrery",
		label: "Read the drive",
		text: "The rings only turn if the citadel siphon still has a child."
	}]),
	machine("plots", "plots", "Ward plots", "haven", 28, 5, [
		node({
			id: "inlet",
			name: "Plot inlet",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			pattern: "pressure-feed",
			gx: 24,
			gy: 36
		}),
		node({
			id: "bed",
			name: "Plot bed",
			domain: "matter",
			tier: "stress",
			integrity: 84,
			density: 3,
			baseline: 76,
			dependsOn: ["inlet"],
			effect: "none",
			severed: false,
			revealed: false,
			gx: 52,
			gy: 58
		}),
		node({
			id: "yield",
			name: "Yield",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 2,
			baseline: 74,
			dependsOn: ["bed"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 78,
			gy: 28
		})
	], [{
		id: "seat-bed",
		label: "Seat the bed",
		text: "Let the plots drink, if the inlet has seated water. A levy can ride the same pipe. This is a mend, not a kindness."
	}, {
		id: "let-lie",
		label: "Let the bed lie",
		text: "Refuse the plots. The ward goes hungry. The levy has nothing to invoice. Neither sentence cancels the other."
	}]),
	machine("forge", "forge", "Rust forge", "rust", 26, 6, [
		node({
			id: "ore",
			name: "Sound ore",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			pattern: "load-chain",
			gx: 22,
			gy: 30
		}),
		node({
			id: "quench",
			name: "Quench leg",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 68,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			pattern: "pressure-feed",
			gx: 22,
			gy: 68
		}),
		node({
			id: "fire",
			name: "Forge fire",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 72,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: false,
			gx: 50,
			gy: 24
		}),
		node({
			id: "stock",
			name: "Stock",
			domain: "matter",
			tier: "stress",
			integrity: 90,
			density: 3,
			baseline: 70,
			dependsOn: [
				"ore",
				"quench",
				"fire"
			],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 78,
			gy: 56
		})
	], [{
		id: "seat-stock",
		label: "Seat the stock",
		text: "If ore, quench, and fire all have parents, the forge can make gear. Gear is not a virtue."
	}, {
		id: "refuse-stock",
		label: "Refuse the stock",
		text: "Cut the stock and leave the parents. The hall gets no new rifles. The parents do not become innocent."
	}]),
	machine("chute", "chute", "Ore chute", "quarry", 16, 18, [node({
		id: "lip",
		name: "Chute lip",
		domain: "matter",
		tier: "bond",
		integrity: 0,
		density: 3,
		baseline: 70,
		dependsOn: [],
		effect: "none",
		severed: true,
		revealed: false,
		pattern: "load-chain",
		gx: 30,
		gy: 34
	}), node({
		id: "grade",
		name: "Grade gate",
		domain: "matter",
		tier: "stress",
		integrity: 90,
		density: 3,
		baseline: 74,
		dependsOn: ["lip"],
		effect: "flow",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 58
	})], [{
		id: "spill-grade",
		label: "Spill the grade",
		text: "Cut the gate. Stone can still leave the pit. It will not arrive at the forge as ore."
	}, {
		id: "seat-grade",
		label: "Seat the grade",
		text: "Close the spill. If the lip has stone, the forge can have a parent again."
	}]),
	machine("lamps", "lamps", "Road lamp glass", "citadel", 24, 18, [node({
		id: "feed",
		name: "Orrery feed",
		domain: "causal",
		tier: "bond",
		integrity: 0,
		density: 3,
		baseline: 70,
		dependsOn: [],
		effect: "none",
		severed: true,
		revealed: true,
		gx: 28,
		gy: 40
	}), node({
		id: "glass",
		name: "Lamp glass",
		domain: "matter",
		tier: "stress",
		integrity: 90,
		density: 2,
		baseline: 80,
		dependsOn: ["feed"],
		effect: "flow",
		severed: false,
		revealed: true,
		gx: 70,
		gy: 36
	})], [{
		id: "break-glass",
		label: "Break the glass",
		text: "The orrery can keep turning. The road lamps are a child. Break the child and the stack road goes dark."
	}, {
		id: "seat-glass",
		label: "Seat the glass",
		text: "Give the lamps their glass back. They still die if the orrery is not their parent."
	}]),
	machine("spireheart", "heart", "Unissued baseline", "spire", 8, 16, [node({
		id: "held",
		name: "What is being held",
		domain: "continuity",
		tier: "anchor",
		integrity: 100,
		density: 6,
		baseline: 40,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 30,
		gy: 36
	}), node({
		id: "baseline",
		name: "Issued baseline",
		domain: "continuity",
		tier: "stress",
		integrity: 8,
		density: 8,
		baseline: 12,
		dependsOn: ["held"],
		effect: "core",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 58
	})], [
		{
			id: "read-heart",
			label: "Read what is holding",
			text: "The city has been asking what holds. This seam asks whether the holding is the problem."
		},
		{
			id: "impose",
			label: "Issue a baseline",
			text: "Write a shape over the holes. The city keeps a silhouette. The silhouette is yours."
		},
		{
			id: "release",
			label: "Leave the holes",
			text: "Do not restore a baseline that was never yours to issue. The holes keep their names."
		}
	], 20),
	machine("hollow", "hollow", "Brass hollow", "tundra", 12, 14, [node({
		id: "feed",
		name: "Orrery weather",
		domain: "causal",
		tier: "bond",
		integrity: 0,
		density: 2,
		baseline: 60,
		dependsOn: [],
		effect: "flow",
		severed: true,
		revealed: true,
		gx: 40,
		gy: 46
	})], [{
		id: "read-hollow",
		label: "Read the hollow",
		text: "The ice is a floor. This bowl is a child of a clock you may not have stood under yet."
	}]),
	machine("relay", "jack", "Waystation brake", "road", 16, 12, [
		node({
			id: "axle",
			name: "Cart axle",
			domain: "matter",
			tier: "bond",
			integrity: 88,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 24,
			gy: 62
		}),
		node({
			id: "brake",
			name: "Seized brake",
			domain: "matter",
			tier: "stress",
			integrity: 16,
			density: 3,
			baseline: 70,
			dependsOn: ["axle"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 50,
			gy: 34
		}),
		node({
			id: "load",
			name: "Held load",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 2,
			baseline: 74,
			dependsOn: ["brake"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 78,
			gy: 58
		})
	], [{
		id: "ease-brake",
		label: "Ease the brake",
		text: "The cart can leave. Rust feels the weight before anyone finishes a sentence. The pit does not become innocent."
	}, {
		id: "pin-load",
		label: "Pin the load",
		text: "Stone can still leave the pit. It will not become ore. The forge goes hungry while the quarry looks finished."
	}]),
	machine("stake", "jack", "Glaze stake", "tundra", 18, 14, [
		node({
			id: "post",
			name: "Stake post",
			domain: "matter",
			tier: "anchor",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 28,
			gy: 64
		}),
		node({
			id: "guy",
			name: "Guy wire",
			domain: "matter",
			tier: "stress",
			integrity: 22,
			density: 3,
			baseline: 68,
			dependsOn: ["post"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 52,
			gy: 32
		}),
		node({
			id: "span",
			name: "Ice span",
			domain: "matter",
			tier: "bond",
			integrity: 70,
			density: 2,
			baseline: 74,
			dependsOn: ["guy"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 80,
			gy: 60
		})
	], [{
		id: "seat-span",
		label: "Seat the span",
		text: "The middle of the ice stops billing your steps. The hollow's weather is left alone. Cleats are not required, and they are not a substitute for the wire."
	}, {
		id: "cut-span",
		label: "Cut the span",
		text: "The hollow goes cold even if a clock elsewhere is still sending. The ice bills harder. The citadel does not notice."
	}]),
	machine("wash", "cistern", "Tenement wash", "rust", 6, 16, [
		node({
			id: "gallery",
			name: "Gallery quench",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 3,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			pattern: "pressure-feed",
			gx: 22,
			gy: 36
		}),
		node({
			id: "valve",
			name: "Seized wash valve",
			domain: "matter",
			tier: "stress",
			integrity: 14,
			density: 3,
			baseline: 64,
			dependsOn: ["gallery"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 50,
			gy: 62
		}),
		node({
			id: "sleepers",
			name: "Sleeper pipe",
			domain: "matter",
			tier: "bond",
			integrity: 40,
			density: 2,
			baseline: 70,
			dependsOn: ["valve"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 78,
			gy: 24
		}),
		node({
			id: "forgeleg",
			name: "Forge leg",
			domain: "matter",
			tier: "bond",
			integrity: 70,
			density: 2,
			baseline: 72,
			dependsOn: ["valve"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 78,
			gy: 78
		})
	], [
		{
			id: "to-sleepers",
			label: "Send the quench to the sleepers",
			text: "The tenement drinks. The forge loses its quench. Both sentences stay true."
		},
		{
			id: "to-forge",
			label: "Send the quench back to the forge",
			text: "The forge leg drinks again, if the gallery still has pressure. The sleeper pipe goes dry."
		},
		{
			id: "seat-wash",
			label: "Seat a shared wash",
			text: "Sleepers and forge both drink, if the gallery has pressure. It costs more focus. It is a mend, not a kindness."
		}
	]),
	machine("gauge", "head", "False gauge", "sinks", 4, 19, [
		node({
			id: "face",
			name: "Gauge face",
			domain: "matter",
			tier: "stress",
			integrity: 8,
			density: 2,
			baseline: 20,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			decoy: true,
			gx: 30,
			gy: 28
		}),
		node({
			id: "feed",
			name: "Pocket feed",
			domain: "matter",
			tier: "bond",
			integrity: 84,
			density: 3,
			baseline: 76,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: false,
			pattern: "pressure-feed",
			gx: 28,
			gy: 68
		}),
		node({
			id: "pocket",
			name: "West pocket",
			domain: "matter",
			tier: "bond",
			integrity: 70,
			density: 2,
			baseline: 70,
			dependsOn: ["feed"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 74,
			gy: 48
		})
	], [{
		id: "read-face",
		label: "Read past the face",
		text: "The face is the obvious failure. It is not the parent. Naming that does not fix the pocket. Cutting the face is a costume, and it bites."
	}, {
		id: "cut-feed",
		label: "Cut the real feed",
		text: "The pocket goes dry for a local reason. A drowned servo was using that parent. It will answer. The district pump will not."
	}]),
	machine("still", "cistern", "Ash still", "haven", 7, 18, [
		node({
			id: "tap",
			name: "Clinic drip",
			domain: "matter",
			tier: "bond",
			integrity: 40,
			density: 2,
			baseline: 60,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 24,
			gy: 30
		}),
		node({
			id: "coil",
			name: "Bootleg coil",
			domain: "matter",
			tier: "stress",
			integrity: 18,
			density: 3,
			baseline: 55,
			dependsOn: ["tap"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 52,
			gy: 58
		}),
		node({
			id: "cup",
			name: "Alley cup",
			domain: "matter",
			tier: "bond",
			integrity: 50,
			density: 2,
			baseline: 64,
			dependsOn: ["coil"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 78,
			gy: 28
		})
	], [{
		id: "break-still",
		label: "Break the still",
		text: "The cup goes. The clinic keeps whatever it had. Someone in the alley was drinking the difference."
	}, {
		id: "license-still",
		label: "License the trickle",
		text: "Write the cup down. It stays a trickle, not a well. The alley can pay for a parent that is not a raid."
	}]),
	machine("winchhouse", "jack", "Night winch", "quarry", 6, 18, [
		node({
			id: "cable",
			name: "Shade cable",
			domain: "matter",
			tier: "bond",
			integrity: 70,
			density: 3,
			baseline: 68,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			pattern: "load-chain",
			gx: 26,
			gy: 36
		}),
		node({
			id: "dog",
			name: "Winch dog",
			domain: "matter",
			tier: "stress",
			integrity: 20,
			density: 3,
			baseline: 64,
			dependsOn: ["cable"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 54,
			gy: 62
		}),
		node({
			id: "cover",
			name: "Crew cover",
			domain: "matter",
			tier: "bond",
			integrity: 80,
			density: 2,
			baseline: 70,
			dependsOn: ["dog"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 80,
			gy: 30
		})
	], [{
		id: "brace-winch",
		label: "Brace the winch",
		text: "If the colossus throat is still a parent, the crew can hear it and stand down. If the throat is already still, a brace is a lie."
	}, {
		id: "cut-winch",
		label: "Cut the winch",
		text: "Take their cover. A live throat makes them leave. A dead throat makes them fight. The pit does not become innocent either way."
	}]),
	machine("buffer", "orrery", "Infirmary buffer", "citadel", 20, 18, [
		node({
			id: "parent",
			name: "Siphon child",
			domain: "causal",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 60,
			dependsOn: [],
			effect: "flow",
			severed: true,
			revealed: true,
			gx: 28,
			gy: 40
		}),
		node({
			id: "cell",
			name: "Buffer cell",
			domain: "matter",
			tier: "stress",
			integrity: 16,
			density: 4,
			baseline: 50,
			dependsOn: ["parent"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 58,
			gy: 62
		}),
		node({
			id: "ward",
			name: "One ward",
			domain: "matter",
			tier: "bond",
			integrity: 40,
			density: 2,
			baseline: 70,
			dependsOn: ["cell"],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 80,
			gy: 28
		})
	], [{
		id: "charge-cell",
		label: "Charge the cell",
		text: "One infirmary can keep a night if the siphon is still sending. After you answer the crucible, the cell cannot rewrite the dark."
	}]),
	machine("kilnfire", "kiln", "Kiln flue", "kiln", 6, 8, [
		node({
			id: "clay",
			name: "Yard clay",
			domain: "matter",
			tier: "bond",
			integrity: 86,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 22,
			gy: 62
		}),
		node({
			id: "flue",
			name: "Kiln flue",
			domain: "matter",
			tier: "stress",
			integrity: 16,
			density: 3,
			baseline: 70,
			dependsOn: ["clay"],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 48,
			gy: 36
		}),
		node({
			id: "bed",
			name: "Local bed",
			domain: "matter",
			tier: "bond",
			integrity: 88,
			density: 2,
			baseline: 76,
			dependsOn: ["flue"],
			effect: "flow",
			severed: false,
			revealed: false,
			gx: 74,
			gy: 24
		}),
		node({
			id: "borrow",
			name: "Borrowed heat",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 60,
			dependsOn: [],
			effect: "flow",
			severed: true,
			revealed: false,
			pattern: "load-chain",
			gx: 74,
			gy: 70
		})
	], [
		{
			id: "seat-flue",
			label: "Seat the flue",
			text: "Local. The clay parents the flue, the flue parents the bed. The set still wants water, or a field-dry, or it cracks."
		},
		{
			id: "stop-flue",
			label: "Stop the flue",
			text: "Cut the local fire. A borrowed heat can still be a parent. A stopped flue is not a refusal until you say so."
		},
		{
			id: "borrow-heat",
			label: "Borrow Rust heat",
			text: "If the Rust fire bed is actually live, this yard can drink it. The flue can stay down. It is not the same brick."
		},
		{
			id: "field-dry",
			label: "Field-dry the set",
			text: "Scrap and a mean bake. The gallery can stay dry. The brick will be worse, and it will still be a brick."
		},
		{
			id: "spill-clay",
			label: "Spill the clay",
			text: "Cut the only local parent. Water and heat will have nothing to set."
		},
		{
			id: "refuse-yard",
			label: "Refuse the yard",
			text: "Leave the beds down on purpose. The levy has nothing to invoice. The houses have nothing to hold."
		}
	]),
	machine("kilnstamp", "stamp", "Stamp desk", "kiln", 20, 17, [node({
		id: "claim",
		name: "Stamp claim",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 84,
		dependsOn: [],
		effect: "flow",
		severed: false,
		revealed: true,
		gx: 46,
		gy: 48
	})], [{
		id: "license-stamp",
		label: "License the stamp",
		text: "Pay, or speak like the Bureau already believes you. The levy stays. Jun's board may open. Voss will not call it a favor."
	}, {
		id: "cut-stamp",
		label: "Cut the stamp",
		text: "The levy dies. The board can sell if the brick is real. Cress will answer the hole in person."
	}]),
	machine("kilnbench", "bench", "Inn bench", "kiln", 28, 9, [node({
		id: "board",
		name: "Price board",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 1,
		baseline: 80,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 40,
		gy: 40
	})], [
		{
			id: "rest",
			label: "Sleep upstairs",
			text: "A bed. Wounds close. Focus returns. It does not fix a parent."
		},
		{
			id: "draw-brick",
			label: "Draw a set brick",
			text: "Only while the set is actually holding. The pack does not need a dozen."
		},
		{
			id: "sell-brick",
			label: "Sell a brick",
			text: "A legal board pays properly. A quiet sale pays worse, and the stamp hears it."
		},
		{
			id: "buy-tin",
			label: "Buy a kiln tin",
			text: "Food. The stamp does not parent a tin."
		},
		{
			id: "buy-bandage",
			label: "Buy a bandage",
			text: "Cloth. Not a civic good."
		},
		{
			id: "buy-chisel",
			label: "Buy a firing chisel",
			text: "Jun sells tools when brick is real, even if she cannot sell the brick."
		},
		{
			id: "buy-coat",
			label: "Buy a kiln coat",
			text: "The coat is a finished good. It waits on a board that is allowed to sell."
		}
	]),
	machine("kilncache", "cache", "Old flue", "kiln", 9, 18, [node({
		id: "nest",
		name: "Nest flue",
		domain: "matter",
		tier: "bond",
		integrity: 70,
		density: 2,
		baseline: 60,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 28,
		gy: 40
	}), node({
		id: "glass",
		name: "Soot glass",
		domain: "matter",
		tier: "obfuscated",
		integrity: 80,
		density: 3,
		baseline: 40,
		dependsOn: ["nest"],
		effect: "none",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 48
	})], [
		{
			id: "read-cache",
			label: "Read the nest",
			text: "The glass is the thing that looks dead. It is a parent the mite is using. Naming it is not the same as taking it."
		},
		{
			id: "lift-glass",
			label: "Lift the glass",
			text: "Once it has been read, it can leave. The mite stays nested."
		},
		{
			id: "smash-cache",
			label: "Smash the glass",
			text: "Take it ugly. The nest loses a parent and stands up."
		}
	]),
	machine("turntable", "jack", "Yard table", "switch", 16, 9, [
		node({
			id: "axle",
			name: "Table axle",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "flow",
			severed: false,
			revealed: true,
			gx: 24,
			gy: 62
		}),
		node({
			id: "grease",
			name: "Axle grease",
			domain: "matter",
			tier: "stress",
			integrity: 0,
			density: 2,
			baseline: 70,
			dependsOn: [],
			effect: "none",
			severed: true,
			revealed: true,
			gx: 48,
			gy: 36
		}),
		node({
			id: "shunt",
			name: "Off-book shunt",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 60,
			dependsOn: [],
			effect: "flow",
			severed: true,
			revealed: false,
			pattern: "load-chain",
			gx: 74,
			gy: 48
		})
	], [
		{
			id: "grease-axle",
			label: "Grease the axle",
			text: "Scrap, rendered onto the plates. Wick can sleep in a shed. Your boots are not this parent."
		},
		{
			id: "jam-table",
			label: "Jam the table",
			text: "The haul stops. A busy pit can still send nothing onward. Rue has nothing to invoice. The plates stay slick unless you also grease them."
		},
		{
			id: "seat-table",
			label: "Seat the table",
			text: "The jam comes up. If the stamp is intact and you did not leave a shunt, the books can see the haul again."
		},
		{
			id: "shunt-haul",
			label: "Shunt the haul",
			text: "Weight still leaves. It does not leave on her books. A jammed table can still feed the road this way."
		},
		{
			id: "pull-shunt",
			label: "Pull the shunt",
			text: "The off-book line comes out. The table, jammed or seated, is the only parent left."
		}
	]),
	machine("switchdesk", "stamp", "Yard desk", "switch", 5, 7, [node({
		id: "claim",
		name: "Yard stamp",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 84,
		dependsOn: [],
		effect: "flow",
		severed: false,
		revealed: true,
		gx: 46,
		gy: 48
	})], [
		{
			id: "license-yard",
			label: "License the stamp",
			text: "Pay, or speak like the Bureau already believes you. The bill stays on any haul the books can see. The shed may sell if the axle is greased and the table is passing weight."
		},
		{
			id: "cut-yard",
			label: "Cut the stamp",
			text: "The yard bill dies. The haul can still leave. Rue will answer the hole in person."
		},
		{
			id: "seat-claim",
			label: "Seat the stamp again",
			text: "A hole can be written back. The bill returns if a haul is on the books. It does not forgive a till she watched you lift."
		},
		{
			id: "lift-till",
			label: "Lift the till",
			text: "The scrip is in the drawer. Rue at the desk will see it. At a distance, a quiet hand might not be filed."
		}
	]),
	machine("switchbench", "bench", "Shed bench", "switch", 22, 7, [node({
		id: "board",
		name: "Shed board",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 1,
		baseline: 80,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 40,
		gy: 40
	})], [
		{
			id: "rest",
			label: "Sleep in the shed",
			text: "A bench. Wounds close. Focus returns. Grease decides whether Wick is here. It does not fix the citadel."
		},
		{
			id: "buy-bandage",
			label: "Buy a bandage",
			text: "Cloth. The stamp does not parent a bandage."
		},
		{
			id: "buy-boots",
			label: "Buy yard boots",
			text: "They keep your step off the slick plates. They are cheaper when the shed is allowed to sell. They are not grease."
		}
	]),
	machine("waycrate", "cache", "Waybill crate", "switch", 6, 15, [node({
		id: "nest",
		name: "Crate nest",
		domain: "matter",
		tier: "bond",
		integrity: 70,
		density: 2,
		baseline: 60,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 28,
		gy: 40
	}), node({
		id: "paper",
		name: "Held waybill",
		domain: "matter",
		tier: "obfuscated",
		integrity: 80,
		density: 3,
		baseline: 40,
		dependsOn: ["nest"],
		effect: "none",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 48
	})], [
		{
			id: "read-bill",
			label: "Read the waybill",
			text: "Name the paper. It ties a held cart to this table. Naming it is not the same as taking it."
		},
		{
			id: "lift-bill",
			label: "Lift the waybill",
			text: "Once it has been read, it can leave. The rat stays nested."
		},
		{
			id: "smash-bill",
			label: "Smash the crate",
			text: "Take it ugly. The nest loses a parent and stands up."
		}
	]),
	machine("panefire", "kiln", "Pane furnace", "pane", 8, 8, [
		node({
			id: "sand",
			name: "Yard sand",
			domain: "matter",
			tier: "bond",
			integrity: 86,
			density: 2,
			baseline: 80,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 22,
			gy: 62
		}),
		node({
			id: "flue",
			name: "Glass flue",
			domain: "matter",
			tier: "stress",
			integrity: 16,
			density: 3,
			baseline: 70,
			dependsOn: ["sand"],
			effect: "none",
			severed: true,
			revealed: true,
			gx: 48,
			gy: 36
		}),
		node({
			id: "bed",
			name: "Local bed",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 2,
			baseline: 76,
			dependsOn: ["flue"],
			effect: "flow",
			severed: true,
			revealed: false,
			gx: 74,
			gy: 24
		}),
		node({
			id: "borrow",
			name: "Borrowed kiln heat",
			domain: "matter",
			tier: "bond",
			integrity: 0,
			density: 3,
			baseline: 60,
			dependsOn: [],
			effect: "flow",
			severed: true,
			revealed: false,
			pattern: "load-chain",
			gx: 74,
			gy: 70
		})
	], [
		{
			id: "seat-flue",
			label: "Seat the flue",
			text: "Local, if the sand is still sand. The melt can stand. Ness can still invoice it."
		},
		{
			id: "stop-flue",
			label: "Stop the flue",
			text: "Cut the local fire. Borrowed kiln heat can still be a parent. A stopped flue is not a refusal until you say so."
		},
		{
			id: "borrow-heat",
			label: "Borrow kiln heat",
			text: "If a kiln bed is actually live, this house can drink it. The local flue can stay down. Sand, or cullet, still has to be a parent."
		},
		{
			id: "cullet",
			label: "Melt cullet",
			text: "Scrap, melted mean. A spilled pit does not have to be the end of the house. Sol can show the trick. An engineering hand can already know it."
		},
		{
			id: "spill-sand",
			label: "Spill the sand",
			text: "Cut the only local parent. Heat will have nothing of the pit to melt until you seat the pit again, or melt cullet."
		},
		{
			id: "seat-sand",
			label: "Seat the pit",
			text: "Put the sand back. A spill was a fact. It does not have to stay the parent of a dark house."
		},
		{
			id: "refuse-house",
			label: "Refuse the house",
			text: "Leave the beds down on purpose. The levy has nothing to invoice. The glass has nothing to hold."
		}
	]),
	machine("panestamp", "stamp", "Glass desk", "pane", 22, 8, [node({
		id: "claim",
		name: "Glass stamp",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 2,
		baseline: 84,
		dependsOn: [],
		effect: "flow",
		severed: false,
		revealed: true,
		gx: 46,
		gy: 48
	})], [
		{
			id: "license-pane",
			label: "License the stamp",
			text: "Pay, or speak like the Bureau already believes you. The levy stays. The bench may sell a lens. Ness will not call it a favor."
		},
		{
			id: "cut-pane",
			label: "Cut the stamp",
			text: "The levy dies. The bench can sell if the melt is real. Ness will answer the hole in person."
		},
		{
			id: "seat-claim",
			label: "Seat the stamp again",
			text: "A hole can be written back. The bill returns if the melt is real. It does not forgive a till she watched you lift."
		},
		{
			id: "lift-till",
			label: "Lift the till",
			text: "The scrip is in the drawer. Ness at the desk will see it. At a distance, a quiet hand might not be filed."
		}
	]),
	machine("panebench", "bench", "Glass bench", "pane", 26, 6, [node({
		id: "board",
		name: "Price board",
		domain: "matter",
		tier: "bond",
		integrity: 100,
		density: 1,
		baseline: 80,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 40,
		gy: 40
	})], [
		{
			id: "rest",
			label: "Sleep by the anneal",
			text: "A bench. Wounds close. Focus returns. It does not fix a parent."
		},
		{
			id: "draw-pane",
			label: "Draw a clear pane",
			text: "Only while the melt is actually holding. The pack does not need a stack of them."
		},
		{
			id: "sell-pane",
			label: "Sell a pane",
			text: "A legal bench pays properly. A quiet sale pays worse, and the stamp hears it."
		},
		{
			id: "buy-lens",
			label: "Buy an anneal lens",
			text: "The bench sells one when it is allowed to. Carrying it names a quiet parent the first time you audit a machine. The vault has another."
		},
		{
			id: "buy-mitts",
			label: "Buy furnace mitts",
			text: "They keep your step off the hot floor. They are not the flue."
		}
	]),
	machine("anneal", "cache", "Anneal vault", "pane", 8, 17, [node({
		id: "nest",
		name: "Anneal nest",
		domain: "matter",
		tier: "bond",
		integrity: 70,
		density: 2,
		baseline: 60,
		dependsOn: [],
		effect: "none",
		severed: false,
		revealed: true,
		gx: 28,
		gy: 40
	}), node({
		id: "lens",
		name: "Nested lens",
		domain: "matter",
		tier: "obfuscated",
		integrity: 80,
		density: 3,
		baseline: 40,
		dependsOn: ["nest"],
		effect: "none",
		severed: false,
		revealed: false,
		gx: 70,
		gy: 48
	})], [
		{
			id: "read-anneal",
			label: "Read the anneal",
			text: "The lens is the thing that looks dead. It is a parent the moth is using. Naming it is not the same as taking it."
		},
		{
			id: "lift-anneal",
			label: "Lift the lens",
			text: "Once it has been read, it can leave. The moth stays nested."
		},
		{
			id: "smash-anneal",
			label: "Smash the anneal",
			text: "Take it ugly. The nest loses a parent and stands up."
		}
	])
];
function spawnActor(spawn) {
	const t = TEMPLATES[spawn.template];
	const hp = maxHp(t.body, 1);
	return {
		id: spawn.id,
		template: t.template,
		name: spawn.name ?? t.name,
		title: t.title,
		portrait: t.portrait,
		sprite: t.sprite,
		scale: t.scale,
		mapId: spawn.map,
		x: spawn.x,
		y: spawn.y,
		home: {
			mapId: spawn.map,
			x: spawn.x,
			y: spawn.y
		},
		hp,
		maxHp: hp,
		ap: 0,
		maxAp: maxAp(t.attrs.finesse),
		attrs: { ...t.attrs },
		skills: { ...t.skills },
		tags: [],
		nodes: structuredClone(t.nodes),
		faction: t.faction,
		hostile: spawn.hostile ?? t.hostile,
		aggro: spawn.aggro ?? t.aggro,
		alive: true,
		companion: false,
		convo: spawn.convo ?? t.convo,
		downConvo: t.downConvo,
		weapon: t.weapon,
		stunned: false,
		polymorphic: Boolean(t.polymorphic),
		tier: t.tier,
		vision: t.vision
	};
}
var log$4 = (text) => ({
	op: "log",
	text
});
var flag$4 = (key, value) => ({
	op: "flag",
	key,
	value
});
function end$4(text, effects, extra) {
	return {
		text,
		effects,
		end: true,
		...extra
	};
}
var CAMPAIGN = {
	cinder: {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "A reed moth, brass-dusted, no bigger than a valve wheel. She is not a person and not a part. She watches the lung the way a living thing watches weather. Hunger is visible if you bother to read her. Trust is not a lever.",
				replies: [
					{
						text: "Hold still.",
						requires: [{
							flag: "cinderFed",
							is: true
						}, { missing: "cinderChose" }],
						effects: [
							flag$4("cinderChose", true),
							{
								op: "recruit",
								id: "cinder"
							},
							{
								op: "xp",
								n: 14
							},
							log$4("She steps onto your shadow. The company was not assigned. She picked it.")
						],
						end: true
					},
					{
						text: "Leave the plate scrap where she can take it.",
						requires: [{ item: "scrap" }, { missing: "cinderFed" }],
						goto: "fed",
						effects: [
							{
								op: "take",
								id: "scrap",
								n: 1
							},
							flag$4("cinderSeen", true),
							flag$4("cinderFed", true),
							{
								op: "xp",
								n: 8
							},
							log$4("You leave the scrap. She does not thank you. She eats. Hunger was the parent.")
						]
					},
					{
						text: "Just watch.",
						effects: [flag$4("cinderSeen", true), log$4("You don't reach. She stays. Observation is an action.")],
						end: true
					},
					end$4("Leave her the reed.")
				]
			},
			fed: {
				speaker: "narrator",
				text: "She cleans a whisker of iron off her mouth and looks at your shadow like it might be a perch. She has not chosen it. Choosing is hers.",
				replies: [{
					text: "Hold still.",
					requires: [{ missing: "cinderChose" }],
					effects: [
						flag$4("cinderChose", true),
						{
							op: "recruit",
							id: "cinder"
						},
						{
							op: "xp",
							n: 14
						},
						log$4("She steps onto your shadow. The company was not assigned. She picked it.")
					],
					end: true
				}, end$4("Not yet. Let her keep the reed.")]
			}
		}
	},
	"cinder-dark": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "The moth stops at the mouth. The lamps are out, or this walk drinks from a parent that failed. She will cross if you wait with her. She will also cross if you go and she decides the shadow matters more than the dark. Dragging is not one of the options she understands.",
			replies: [end$4("Wait until she steps.", [flag$4("cinderDarkOk", true), log$4("You wait. She hates it, and then she crosses. The dark did not become safe. She chose anyway.")]), end$4("Take another way.", [log$4("You stay off that mouth. The south walk, or a later hour, is still a path.")])]
		} }
	},
	porter: {
		start: "start",
		nodes: {
			start: {
				speaker: "jot",
				text: "Jot. I haul what the stair will sign, and I sleep in the cut when it won't. The stack road starts at that notch in the wall. Nobody is going to menu you a city. You walk it, or you don't.",
				replies: [
					{
						text: "What does the road actually carry?",
						goto: "carry"
					},
					{
						text: "The ward says the water stopped.",
						goto: "dry",
						requires: [{
							flag: "nessaRefuses",
							is: true
						}]
					},
					end$4("I'll walk it.")
				]
			},
			carry: {
				speaker: "jot",
				text: "Water one way, stone the other, heat after the stone, light if the citadel still has a child to spare. Break one and don't be surprised when a room you haven't stood in yet goes quiet.",
				replies: [end$4("That's the job, then.")]
			},
			dry: {
				speaker: "jot",
				text: "Nessa won't front a debt against a parent that stopped. I don't sell water. I just stop getting paid to move it. Look at the lung, not at her temper.",
				replies: [end$4("The lung, then.")]
			}
		}
	},
	sela: {
		start: "start",
		nodes: {
			start: {
				speaker: "sela",
				text: "We haven't had water. Not a sermon. The cistern coughs, the plots crack, and Quill will not price a rumor. I don't know the machine. I know the cup.",
				replies: [
					{
						text: "The plots are drinking.",
						goto: "drinking",
						requires: [{
							flag: "foodLive",
							is: true
						}]
					},
					{
						text: "The bed was refused.",
						goto: "refused",
						requires: [{
							flag: "plotsRefused",
							is: true
						}]
					},
					{
						text: "The stall is dark.",
						goto: "dark",
						requires: [{
							flag: "nessaRefuses",
							is: true
						}]
					},
					end$4("I'll find what the cup is a child of.")
				]
			},
			drinking: {
				speaker: "sela",
				text: "Then the cup is a cup again. Don't expect me to thank the levy that came with it. Quill eats off the same pipe. I eat off the other end.",
				replies: [end$4("Both are on the pipe.")]
			},
			refused: {
				speaker: "sela",
				text: "You left the beds down. I won't call it cruelty and I won't call it wisdom. The alley gets louder when we don't eat. That's a fact about a door.",
				replies: [end$4("I heard the door.")]
			},
			dark: {
				speaker: "sela",
				text: "Nessa's shutter is a symptom. If you fix her and not the parent, the shutter closes again. I've watched that play.",
				replies: [end$4("Then not the shutter.")]
			}
		}
	},
	rill: {
		start: "start",
		nodes: {
			start: {
				speaker: "rill",
				text: "Rill. I was on the count under the boom until the count got theoretical. The grade dumped me in the pit instead of on the slab. You can call that a rescue. I call it the chute doing a sloppy job of being a parent.",
				replies: [
					{
						text: "The slab came down clear.",
						goto: "clear",
						requires: [{
							flag: "quarryStone",
							is: "clear"
						}]
					},
					{
						text: "The stone took someone.",
						goto: "scar",
						requires: [{
							flag: "workerHurt",
							is: true
						}]
					},
					{
						text: "You're the missing name. I'll say so.",
						goto: "name",
						effects: [
							flag$4("rillSpoken", true),
							{
								op: "xp",
								n: 10
							},
							log$4("Rill is on the count again. The boom did not have to be the whole sentence.")
						]
					},
					end$4("I'll read the crane before I promise anything.")
				]
			},
			clear: {
				speaker: "rill",
				text: "Clear is a good word for stone and a bad word for people. I was already off the grade. You didn't save me. You saved whoever was still under it. I'll take the distinction.",
				replies: [end$4("Keep the distinction.")]
			},
			scar: {
				speaker: "rill",
				text: "Then the crane has a name that isn't mine. Don't sand it off to make the walk easier. The stone was still stone.",
				replies: [end$4("The name stays.")]
			},
			name: {
				speaker: "rill",
				text: "Say it to Hask, not to a plaque. Plaques are how a district forgets which parent actually moved.",
				replies: [end$4("Hask, then.")]
			}
		}
	},
	nell: {
		start: "start",
		nodes: {
			start: {
				speaker: "nell",
				text: "Nell. I sleep when the flue sleeps. The guild will tell you heat is a policy. It's a child of a haul. If the quarry stops, I stop pretending the blanket is a machine.",
				replies: [
					{
						text: "The tenement has the night.",
						goto: "warm",
						requires: [{
							flag: "tenementWarm",
							is: true
						}]
					},
					{
						text: "The hall took the heat.",
						goto: "hall",
						requires: [{
							flag: "guildWarm",
							is: true
						}, {
							flag: "tenementWarm",
							is: false
						}]
					},
					{
						text: "The forge is turning stock.",
						goto: "stock",
						requires: [{
							flag: "gearLive",
							is: true
						}]
					},
					end$4("I'll read the hearth.")
				]
			},
			warm: {
				speaker: "nell",
				text: "Then I sleep. Don't dress it up. A flue with a parent is a flue. I don't owe the quarry a song.",
				replies: [end$4("Sleep, then.")]
			},
			hall: {
				speaker: "nell",
				text: "The benches are warm and the blankets aren't. That's not a villain. That's a split. Seat both, or live with who you left in the cold.",
				replies: [end$4("I know who the split leaves.")]
			},
			stock: {
				speaker: "nell",
				text: "Stock means ore, water, and fire all showed up. My blanket doesn't care about the rifles. It cares that the fire had somewhere else to be.",
				replies: [end$4("The fire had parents.")]
			}
		}
	},
	kel: {
		start: "start",
		nodes: {
			start: {
				speaker: "kel",
				text: "Kel. The brass ice bites the middle of the walk and ignores the edges. North of the glaze you're fine. South of it you're fine. The citadel is uphill either way. I don't work for the lamps.",
				replies: [
					{
						text: "The lamps are out.",
						goto: "dark",
						requires: [{
							flag: "roadDark",
							is: true
						}]
					},
					{
						text: "The south road doesn't need them.",
						goto: "south",
						requires: [{
							flag: "roadBypass",
							is: true
						}]
					},
					end$4("I'll take an edge."),
					{
						text: "The hollow is warm. I need the middle of the walk.",
						goto: "cleat",
						requires: [{
							flag: "hollowRead",
							is: true
						}, { missing: "cleatGiven" }]
					}
				]
			},
			dark: {
				speaker: "kel",
				text: "Then the stack road is a rumor with teeth. The shade down there stops being scenery when the glass fails. Fix the parent, break the child, or walk around. I'm not a quest marker. I'm cold.",
				replies: [end$4("Cold is enough.")]
			},
			south: {
				speaker: "kel",
				text: "Lark's cut. It works. It also means you decided the lamps were optional. The citadel may disagree without being right.",
				replies: [end$4("Optional is still a decision.")]
			},
			cleat: {
				speaker: "kel",
				text: "The middle bites because the glaze has no parent you can argue with. These keep a foot from paying it. They are not a rank.",
				replies: [end$4("I'll take the edge with me.", [
					flag$4("cleatGiven", true),
					{
						op: "item",
						id: "cleat",
						n: 1
					},
					log$4("Kel hands over edge cleats. The ice is still ice. Your feet are no longer the child it bills.")
				])]
			}
		}
	},
	shade: {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "Something patient lives in the lamp shadow. While the glass holds, it is only a shape. It does not owe you a fight, and you do not owe it a moral.",
				replies: [{
					text: "The glass is broken.",
					goto: "broken",
					requires: [{
						flag: "roadDark",
						is: true
					}]
				}, end$4("Leave the shape alone.")]
			},
			broken: {
				speaker: "narrator",
				text: "The shape is thicker now. It is not evil. It is what the road does when its parent stops. You can still leave it by giving the lamps a parent, or by not using this stretch.",
				replies: [end$4("Then the lamps are the argument.")]
			}
		}
	},
	"tobin-road": {
		start: "start",
		nodes: {
			start: {
				speaker: "tobin",
				text: "I keep the step. I don't keep score. If the lung is seated, say so. If you stopped it, don't ask me to call the dryness a clever trick.",
				replies: [
					{
						text: "The lung is seated. You should hear it from me.",
						goto: "heard",
						requires: [
							{
								flag: "bellowsLive",
								is: true
							},
							{
								flag: "reedRead",
								is: true
							},
							{ missing: "tobinHeardLung" }
						],
						effects: [flag$4("tobinHeardLung", true), log$4("Tobin hears the lung as maintenance. He nods like a man checking a bolt.")]
					},
					{
						text: "I stopped the bellows.",
						goto: "stopped",
						requires: [{
							flag: "bellowsLive",
							is: false
						}, { missing: "tobinHeardLung" }],
						effects: [flag$4("tobinHeardLung", true), log$4("You say the lung is stopped. He counts it. He does not leave.")]
					},
					end$4("Keep the step.")
				]
			},
			heard: {
				speaker: "tobin",
				text: "Maintenance. That's the word I'll use. The ward can use a different one when the levy shows up.",
				replies: [end$4("Let them.")]
			},
			stopped: {
				speaker: "tobin",
				text: "Then everything downstream of that reed is your sentence, including the people who never saw you cut it. I'm still walking.",
				replies: [end$4("Keep walking.")]
			}
		}
	},
	"wren-road": {
		start: "start",
		nodes: {
			start: {
				speaker: "wren",
				text: "Roads are pipes with boots. If you want the pit to know what the lung is, we already have a way to say it. If you want company without the diagram, that is also a kind of line.",
				replies: [
					end$4("The company is the point.", [flag$4("wrenWalked", true), log$4("Wren walks the pit's direction without making the diagram the toll.")]),
					{
						text: "The carts toward the ward are heavier.",
						goto: "carts",
						requires: [{
							flag: "foodLive",
							is: true
						}]
					},
					end$4("Hold the diagram until I ask.")
				]
			},
			carts: {
				speaker: "wren",
				text: "Someone is eating. I haven't stood in the room. The weight is on the road before the diagram is. That's the part I used to miss.",
				replies: [end$4("Then we walk toward the weight.")]
			}
		}
	},
	"sera-road": {
		start: "start",
		nodes: {
			start: {
				speaker: "sera",
				text: "I came to watch what you do with a standard, a forge, and a bill. Not to clap. If you want me gone, say gone. If you want an argument, the road is long enough.",
				replies: [{
					text: "Look at the stock with me.",
					goto: "gear",
					requires: [{
						flag: "gearLive",
						is: true
					}, { missing: "seraSawGear" }],
					effects: [flag$4("seraSawGear", true), log$4("Sera looks at live stock. She disagrees. She stays.")]
				}, end$4("Argue while we walk.")]
			},
			gear: {
				speaker: "sera",
				text: "I looked. Rifles are a child of ore and water and fire. You can be proud of the seating and still hate the use. I won't pick your sentence.",
				replies: [end$4("I didn't ask you to.")]
			}
		}
	},
	"mara-road": {
		start: "start",
		nodes: { start: {
			speaker: "mara",
			text: "Ives thinks a song is a fault if it keeps you alive. I think a fault that keeps you alive is a parent. You don't have to mend me to let me walk.",
			replies: [end$4("Walk. I won't sand the nights off you.", [log$4("Mara keeps the cadence. The road does not require a cleaner version of her.")]), end$4("Tell me if the hall gets loud.")]
		} }
	},
	pip: {
		start: "start",
		nodes: {
			start: {
				speaker: "pip",
				text: "Pip. I sleep where the door forgets to ask. Adults call the cut a shortcut. I call it a bed that still has a wall.",
				replies: [
					{
						text: "The plots are drinking. You don't have to sleep in the cut.",
						goto: "home",
						requires: [{
							flag: "foodLive",
							is: true
						}]
					},
					{
						text: "The alley is the bed because the ward isn't.",
						goto: "cut",
						requires: [{
							flag: "ashAccess",
							is: true
						}, {
							flag: "foodLive",
							is: false
						}]
					},
					{
						text: "A moth showed you a pipe.",
						goto: "moth",
						requires: [{ companion: "cinder" }]
					},
					{
						text: "The reed sleeper says you follow wings, not maps.",
						goto: "doss-drip",
						requires: [
							{
								flag: "dossMet",
								is: true
							},
							{ companion: "cinder" },
							{ missing: "pipShown" }
						]
					},
					end$4("I'll read the parent before I move your bed.")
				]
			},
			home: {
				speaker: "pip",
				text: "Then the cut can be a cut again. Don't thank me. The meal is a child of a pipe. I just stopped needing the wall.",
				replies: [end$4("The wall can be a wall.")]
			},
			cut: {
				speaker: "pip",
				text: "If you seat the bed, I leave. If you refuse it, I stay. Neither of those is a favor you did for a child. They're what the pipe did.",
				replies: [end$4("I'll remember which one I meant.")]
			},
			moth: {
				speaker: "pip",
				text: "She wouldn't cross the dark stall. She went along the old drip instead, the one the grate still remembers. I followed the wings, not a map. Your audit doesn't have wings.",
				replies: [end$4("Wings aren't a diagram. That's why I missed it.", [flag$4("pipShown", true), log$4("Pip followed the moth along a drip the grate still remembers. The route was never a secret door. It was a living thing refusing a dead one.")])]
			},
			"doss-drip": {
				speaker: "pip",
				text: "Doss sleeps on weather. The moth doesn't. She walks the drip the grate still has, the one adults paved over because it wasn't straight. I can show you the wet, not the diagram.",
				replies: [end$4("Show me the wet.", [flag$4("pipShown", true), log$4("Pip takes the drip the moth already preferred. The grate remembers it. A straight line would have missed it.")])]
			}
		}
	},
	"cinder-heat": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "The moth stops at the rust mouth. Something here is still burning, and the reed she nested on is not. Heat is a predator to her. You can ask her to stay. You cannot make the asking into an order she understands.",
			replies: [
				end$4("Stay if you want. The heat is weather, not an order.", [flag$4("cinderKept", true), log$4("You don't drag her. She stays. The forge is still loud. The staying was hers.")]),
				end$4("I won't take you into that noise.", [flag$4("cinderLeft", true), log$4("You stop at the mouth. The shadow is no longer a requirement.")]),
				end$4("I'm going in.", [flag$4("cinderRisk", true), log$4("You go in. She has not agreed. She may decide the shadow is finished.")])
			]
		} }
	},
	doss: {
		start: "start",
		nodes: {
			start: {
				speaker: "doss",
				text: "Doss. I sleep where the reed sweats. It isn't a room. It's weather. If the lung stops, I stop pretending the plate is a bed.",
				replies: [
					{
						text: "The lung is still making weather.",
						goto: "weather",
						requires: [{
							flag: "bellowsLive",
							is: true
						}, {
							flag: "reedRead",
							is: true
						}]
					},
					{
						text: "The lung stopped.",
						goto: "stopped",
						requires: [{
							flag: "bellowsLive",
							is: false
						}]
					},
					{
						text: "A moth eats here.",
						goto: "moth",
						requires: [{
							flag: "cinderFed",
							is: true
						}]
					},
					end$4("Sleep. I won't move your weather.", [flag$4("dossMet", true)])
				]
			},
			weather: {
				speaker: "doss",
				text: "Then I stay. There's a long iron under the drip. Too much reach for a sleeper, too honest to be a wage. Take it or leave it. The reed doesn't invoice.",
				replies: [
					end$4("I'll take the iron.", [
						flag$4("dossMet", true),
						flag$4("dossSpan", true),
						{
							op: "item",
							id: "span",
							n: 1
						},
						log$4("Doss slides a long iron out from under the reed. It reaches. It is not a promotion.")
					], { requires: [{ missing: "dossSpan" }] }),
					end$4("Leave it. The bed is the point.", [flag$4("dossMet", true), log$4("You leave the iron under the reed. Doss keeps the weather.")], { requires: [{ missing: "dossSpan" }] }),
					end$4("You still have the bed. I still have the reach.", [flag$4("dossMet", true)], { requires: [{
						flag: "dossSpan",
						is: true
					}] })
				]
			},
			stopped: {
				speaker: "doss",
				text: "The lung quit. I moved. The iron stays under a reed that isn't sweating. The bench is a floor. That's enough until the weather comes back. Don't ask me to call the dryness clever.",
				replies: [end$4("I won't.", [flag$4("dossMet", true), log$4("Doss is done sleeping on the reed. The weather left first.")])]
			},
			moth: {
				speaker: "doss",
				text: "She eats the drip. She doesn't pay and she doesn't snore, which is more than I can say for the stacks. If she follows a shadow, that's a perch she picked. I don't own her, and you shouldn't try.",
				replies: [end$4("I won't put a collar on weather.", [flag$4("dossMet", true)])]
			}
		}
	},
	ada: {
		start: "start",
		nodes: {
			start: {
				speaker: "ada",
				text: "Ada. I eat what the bed gives. If the bed is a rumor, I carry an empty plate so nobody can call hunger a mood. I don't need a speech. I need a parent, or the honesty of not having one.",
				replies: [
					{
						text: "The plots are drinking.",
						goto: "eating",
						requires: [{
							flag: "foodLive",
							is: true
						}]
					},
					{
						text: "The bed was left down.",
						goto: "empty",
						requires: [{
							flag: "plotsRefused",
							is: true
						}]
					},
					{
						text: "The clinic took the feed.",
						goto: "clinic",
						requires: [{
							flag: "wardSplit",
							is: "clinic"
						}]
					},
					{
						text: "The stall took the feed.",
						goto: "stall",
						requires: [{
							flag: "wardSplit",
							is: "market"
						}]
					},
					{
						text: "Nessa's shutter is down.",
						goto: "shutter",
						requires: [{
							flag: "nessaRefuses",
							is: true
						}, {
							flag: "foodLive",
							is: false
						}]
					},
					end$4("The plate is yours to carry.", [flag$4("adaMet", true)])
				]
			},
			eating: {
				speaker: "ada",
				text: "Then I eat. The levy eats the same pipe and calls it governance. I call it a bill riding a meal. The child isn't in the cut anymore. I didn't fetch her. A meal is a door. Don't ask me to thank the bill for the door.",
				replies: [end$4("The meal and the bill are not the same kindness.", [flag$4("adaMet", true), log$4("Ada eats. She does not thank the levy for sharing a parent.")])]
			},
			empty: {
				speaker: "ada",
				text: "The bed is down. I won't dress that up and I won't hate you for it. The plate stays empty. The levy has nothing to write on. I can live beside one of those facts. I won't live beside a lie that says I ate.",
				replies: [end$4("The plate stays empty.", [flag$4("adaMet", true), log$4("Ada keeps the empty plate. The refusal is still in the room.")])]
			},
			clinic: {
				speaker: "ada",
				text: "The clinic has the water. I don't begrudge a stitch. I also don't eat stitches. That's a split. Seat both if you can. If you can't, know whose plate you left dry.",
				replies: [end$4("I know whose plate.", [flag$4("adaMet", true)])]
			},
			stall: {
				speaker: "ada",
				text: "Quill will price a cup before I see a plate. Nessa will sell it. I'm not their villain and they're not mine. A split is a split.",
				replies: [end$4("A split, then.", [flag$4("adaMet", true)])]
			},
			shutter: {
				speaker: "ada",
				text: "Nessa's shutter is the stall telling the truth. My plate is the other end of the same sentence. Fix her and not the parent, and the shutter closes again. I've watched that.",
				replies: [end$4("Then not the shutter.", [flag$4("adaMet", true)])]
			}
		}
	},
	pim: {
		start: "start",
		nodes: {
			start: {
				speaker: "pim",
				text: "Pim. I work the grade until the boom starts thinking. Then I don't. A cable with a parent I can't see is not a workplace. It's a sentence waiting on a name.",
				replies: [
					{
						text: "The slab came down clear.",
						goto: "clear",
						requires: [{
							flag: "quarryStone",
							is: "clear"
						}]
					},
					{
						text: "The stone took someone.",
						goto: "scar",
						requires: [{
							flag: "quarryStone",
							is: "scarred"
						}]
					},
					{
						text: "Rill was off the grade.",
						goto: "rill",
						requires: [{
							flag: "rillSpoken",
							is: true
						}]
					},
					{
						text: "The colossus stopped.",
						goto: "throat",
						requires: [{
							flag: "colossusBreath",
							is: false
						}]
					},
					end$4("I won't ask you to stand under it.", [flag$4("pimMet", true)])
				]
			},
			clear: {
				speaker: "pim",
				text: "It's down, and it missed. I'll stand the count. Don't call it brave. Bravery is what they write when they need a plaque. The parent stopped being a threat. That's all. The colossus is still that parent. Missing us once is not a retirement.",
				replies: [end$4("Missing once is not a retirement.", [flag$4("pimMet", true), log$4("Pim steps toward the count. The fear stood down with the slab.")])]
			},
			scar: {
				speaker: "pim",
				text: "A name is on the stone. I already knew the boom could write. I won't stand there to make the second name cheaper. Leave the name. Sanding it off doesn't put a rigger back.",
				replies: [end$4("The name stays.", [flag$4("pimMet", true), log$4("Pim stays off the grade. The stone already has a name.")])]
			},
			rill: {
				speaker: "pim",
				text: "Then the board has a person and the crane isn't the only record. Say it to Hask if you haven't. I don't do plaques.",
				replies: [end$4("Hask can have the name.", [flag$4("pimMet", true)])]
			},
			throat: {
				speaker: "pim",
				text: "The throat stopped. The cable is carrying the pit alone. That's louder, not safer. I stay south of the boom until somebody is holding that parent again, or until the slab is a fact on the ground.",
				replies: [end$4("South of the boom, then.", [flag$4("pimMet", true)])]
			}
		}
	},
	sarn: {
		start: "start",
		nodes: {
			start: {
				speaker: "sarn",
				text: "Sarn. Kitchen. The pots don't know rank. They know whether a haul arrived. If the plate upstairs is hungry, they'll invent a law. It will still be hunger. If rank could be eaten, the upstairs would be fatter.",
				replies: [
					{
						text: "The plate is unfed.",
						goto: "toll",
						requires: [{
							flag: "guardToll",
							is: true
						}]
					},
					{
						text: "Stone reached the stores.",
						goto: "stores",
						requires: [{
							flag: "citadelSupplied",
							is: true
						}]
					},
					{
						text: "The siphon was cut.",
						goto: "dark",
						requires: [{
							flag: "citadelFate",
							is: "sever"
						}]
					},
					{
						text: "Someone wrote a hand on the shape.",
						goto: "hand",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					{
						text: "The light went downhill.",
						goto: "downhill",
						requires: [{
							flag: "citadelFate",
							is: "redirect"
						}]
					},
					{
						text: "The clock stopped.",
						goto: "clock",
						requires: [{
							flag: "orreryTurn",
							is: false
						}, {
							flag: "seenCitadel",
							is: true
						}]
					},
					end$4("Cook. The pots have their own parents.", [flag$4("sarnMet", true)])
				]
			},
			toll: {
				speaker: "sarn",
				text: "They're unfed. They stand in a doorway and call it a toll. Feed the stores or live with the doorway. I won't pretend the ladle is a policy.",
				replies: [end$4("A missing meal, not a new law.", [flag$4("sarnMet", true), log$4("Sarn calls the toll a meal. The doorway does not get a better name.")])]
			},
			stores: {
				speaker: "sarn",
				text: "Stone got here. I can cook. That doesn't make the road a kindness. It makes the pot a child of a haul. I'll feed who is in the room. I won't thank the rank for the road.",
				replies: [end$4("Feed the room.", [flag$4("sarnMet", true), log$4("Sarn cooks from stone that crossed the road. She does not thank the rank.")])]
			},
			dark: {
				speaker: "sarn",
				text: "The lifts died. The infirmaries went with them. My kitchen is still a kitchen. It is not a consolation, and I won't let you use the soup as one.",
				replies: [end$4("Not a consolation.", [flag$4("sarnMet", true)])]
			},
			hand: {
				speaker: "sarn",
				text: "Someone put a hand on the shape. The soup tastes the same. The room got smaller. If that was you, eat standing up. There's less space to sit.",
				replies: [end$4("I'll eat standing.", [flag$4("sarnMet", true)])]
			},
			downhill: {
				speaker: "sarn",
				text: "Light went downhill. We still eat if the stores do. The balconies can learn cold without my comment. I have onions.",
				replies: [end$4("Onions, then.", [flag$4("sarnMet", true)])]
			},
			clock: {
				speaker: "sarn",
				text: "The orrery stopped. I still cook. I just don't know which hour the plate thinks it is. Meals don't need a clock. Guards do. That's why they're irritable.",
				replies: [end$4("The pots don't need the hour.", [flag$4("sarnMet", true)])]
			}
		}
	},
	drift: {
		start: "start",
		nodes: {
			start: {
				speaker: "drift",
				text: "Drift. I keep the edge. The middle of this walk bites, and the hollow only sleeps when a clock uphill remembers to send weather. I don't guide. I stand where my feet still belong to me.",
				replies: [
					{
						text: "The hollow is warm.",
						goto: "warm",
						requires: [{
							flag: "hollowWarm",
							is: true
						}]
					},
					{
						text: "The hollow has no weather.",
						goto: "cold",
						requires: [{
							flag: "hollowWarm",
							is: false
						}, {
							flag: "tundraWalked",
							is: true
						}]
					},
					{
						text: "The lamps are out.",
						goto: "dark",
						requires: [{
							flag: "roadDark",
							is: true
						}]
					},
					{
						text: "The moth won't take the dark mouth.",
						goto: "moth",
						requires: [{ companion: "cinder" }, { missing: "cinderDarkOk" }]
					},
					{
						text: "The south walk doesn't need the lamps.",
						goto: "south",
						requires: [{
							flag: "roadBypass",
							is: true
						}]
					},
					end$4("The edge is a decision.", [flag$4("driftMet", true)])
				]
			},
			warm: {
				speaker: "drift",
				text: "The bowl is warm. I'll sleep in it. That's not a blessing. It's a child arriving from a clock you may have stood under, or may still be pretending is the sky.",
				replies: [end$4("Sleep where it was sent.", [flag$4("driftMet", true), log$4("Drift takes the hollow. The weather arrived before any speech about it.")])]
			},
			cold: {
				speaker: "drift",
				text: "The hollow's empty. I stay on the edge. The middle is still a bill, cleats or no cleats. Kel has iron for people who want to pay it standing up. I like my feet where the glaze isn't.",
				replies: [end$4("The edge, then.", [flag$4("driftMet", true), log$4("Drift stays on the edge. The hollow has no weather to sleep in.")])]
			},
			dark: {
				speaker: "drift",
				text: "The lamps died. The ice did not take a side. The shade on the glass stretch stops being scenery. The south edge doesn't ask the lamps for permission.",
				replies: [end$4("The ice didn't take a side.", [flag$4("driftMet", true)])]
			},
			moth: {
				speaker: "drift",
				text: "She won't take a mouth that failed. She's reading a parent, not disobeying you. Walk the edge with her, or wait until she decides the shadow matters more than the dark. Dragging is how you lose a weather.",
				replies: [end$4("I won't drag her.", [flag$4("driftMet", true), log$4("Drift names the moth's refusal. It is not a command she failed.")])]
			},
			south: {
				speaker: "drift",
				text: "Lark's cut. It works. It also means the lamps were optional. Optional is still a decision. I won't put a sign on it. Signs turn a shortcut into a toll.",
				replies: [end$4("No sign.", [flag$4("driftMet", true)])]
			}
		}
	},
	"cinder-spire": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "The moth stops at the mouth. Whatever is ahead does not sound like weather. It sounds like a room missing a parent and unwilling to say so. She will come if you wait. She will also stay on the road, which is the last sound she wants. You do not get to carry her.",
			replies: [end$4("Wait until she steps.", [flag$4("cinderSpireOk", true), log$4("You wait. She hates the sound, and then she comes. The Spire does not become weather.")]), end$4("Stay on the road. I'll go in.", [
				flag$4("cinderSpireStay", true),
				{
					op: "dismiss",
					id: "cinder"
				},
				log$4("She stays at the mouth. The road is the weather she chose. The Spire is not.")
			])]
		} }
	},
	"tobin-late": {
		start: "start",
		nodes: {
			start: {
				speaker: "tobin",
				text: "We've walked far enough that the bench is a rumor and the city is the job. I still don't have to like the last cut. I do have to know whether you sat in the shape or left the holes.",
				replies: [
					{
						text: "I put a hand on the rank.",
						goto: "hand",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					{
						text: "I cut the siphon.",
						goto: "cut",
						requires: [{
							flag: "citadelFate",
							is: "sever"
						}]
					},
					{
						text: "The ward is eating. So is the bill.",
						goto: "bill",
						requires: [{
							flag: "foodLive",
							is: true
						}, {
							flag: "levyLive",
							is: true
						}]
					},
					end$4("Keep the step.", [flag$4("tobinLate", true), log$4("Tobin keeps walking. Agreement was never the price.")])
				]
			},
			hand: {
				speaker: "tobin",
				text: "Then don't call it maintenance. Maintenance doesn't own the drawing. I'll still walk. I won't sand that word for you.",
				replies: [end$4("Don't sand it.", [flag$4("tobinLate", true)])]
			},
			cut: {
				speaker: "tobin",
				text: "The dark is honest. The infirmaries are in it. I can hold both of those without calling you a villain. Don't ask me to pick a cleaner sentence.",
				replies: [end$4("Both, then.", [flag$4("tobinLate", true)])]
			},
			bill: {
				speaker: "tobin",
				text: "Food and a levy on one pipe. I knew that in the Sinks and I know it here. The meal is still a meal. The bill is still a bill. I'm glad I didn't have to pretend they were one kindness.",
				replies: [end$4("They stayed two things.", [flag$4("tobinLate", true)])]
			}
		}
	},
	"wren-late": {
		start: "start",
		nodes: {
			start: {
				speaker: "wren",
				text: "If the line heard the lung, the pit already knows. If it didn't, the diagram stayed in my pocket, and that was also a walk. I didn't come to be right at the end. I came to see whether you'd sit in the standard.",
				replies: [
					{
						text: "The line heard you.",
						goto: "heard",
						requires: [{
							flag: "workersKnow",
							is: true
						}]
					},
					{
						text: "I sat in the rank.",
						goto: "sat",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					end$4("The pocket was a choice.", [flag$4("wrenLate", true), log$4("Wren keeps the diagram unsent. The company was the line.")])
				]
			},
			heard: {
				speaker: "wren",
				text: "Then I don't need to repeat it. A diagram that arrives is not a leash. If you want me gone before the Spire, say gone. I'd rather see the question.",
				replies: [end$4("See it with me.", [flag$4("wrenLate", true)])]
			},
			sat: {
				speaker: "wren",
				text: "You sat in it. I watched. I am still here, which is not forgiveness. It's the reason I walked: so the room would have a person who didn't want that chair.",
				replies: [end$4("Stay in the room.", [flag$4("wrenLate", true)])]
			}
		}
	},
	"sera-late": {
		start: "start",
		nodes: {
			start: {
				speaker: "sera",
				text: "I stayed to watch what you did with a standard. Not to clap, and not to leave the moment it got ugly. Say which child you meant. I'll tell you if I can live next to it.",
				replies: [
					{
						text: "I wrote my hand onto the shape.",
						goto: "face",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					{
						text: "I cut it and left the holes.",
						goto: "holes",
						requires: [{
							flag: "citadelFate",
							is: "sever"
						}]
					},
					{
						text: "The stock was refused. The parents stayed.",
						goto: "stock",
						requires: [{
							flag: "stockRefused",
							is: true
						}]
					},
					end$4("Walk the rest. Argue if you have to.", [flag$4("seraLate", true)])
				]
			},
			face: {
				speaker: "sera",
				text: "Then I was right to be afraid, and wrong if I leave now. A face on the engine is not maintenance. I'll stay where you can hear that. I will not help you enjoy it.",
				replies: [end$4("Hear it.", [flag$4("seraLate", true), log$4("Sera stays beside a standard she will not bless.")])]
			},
			holes: {
				speaker: "sera",
				text: "You didn't put your face on it. The dark still has the infirmaries. I can live next to the refusal. I can't call the dark kind.",
				replies: [end$4("Don't call it kind.", [flag$4("seraLate", true)])]
			},
			stock: {
				speaker: "sera",
				text: "I saw the refusal. The forge can be healthy and still not be a rifle. That's the sentence I came to hear. The rest of the city can be a mess and that sentence can still be true.",
				replies: [end$4("The sentence stands.", [flag$4("seraLate", true)])]
			}
		}
	},
	"mara-late": {
		start: "start",
		nodes: {
			start: {
				speaker: "mara",
				text: "If you're about to sand the nights off me so the last room is simpler, don't. I walked this far with the song. The Spire doesn't get a cleaner version.",
				replies: [
					{
						text: "Nell is sleeping. The flue has a parent.",
						goto: "nell",
						requires: [{
							flag: "tenementWarm",
							is: true
						}]
					},
					{
						text: "I left the lattice alone.",
						goto: "alone",
						requires: [{
							flag: "maraFate",
							is: "intact"
						}]
					},
					{
						text: "I tried to mend the lattice.",
						goto: "mend",
						requires: [{
							flag: "maraFate",
							is: "restored"
						}]
					},
					end$4("The nights come with you.", [flag$4("maraLate", true), log$4("Mara keeps the nights. The last room does not get to edit her.")])
				]
			},
			nell: {
				speaker: "mara",
				text: "Good. A night with a parent is still a night. Don't ask her to sing about it. I won't either. Warm is not a cure. It's a bed.",
				replies: [end$4("A bed.", [flag$4("maraLate", true)])]
			},
			alone: {
				speaker: "mara",
				text: "Then you left the thing that kept me alive. Ives will have a word for that. I don't. I just sleep the way I sleep, and I'm still walking.",
				replies: [end$4("Keep walking.", [flag$4("maraLate", true)])]
			},
			mend: {
				speaker: "mara",
				text: "I remember a kitchen. I don't remember the door-song the same way. That's easier, and easier is not the same as mine. I didn't ask you to stop. I am telling you what it cost.",
				replies: [end$4("I hear the cost.", [flag$4("maraLate", true)])]
			}
		}
	},
	moss: {
		start: "start",
		nodes: {
			start: {
				speaker: "moss",
				text: "The brake seized on a cart that already decided to be heavy. I am not a sign. I am the person who has been standing here while the weight argued with the iron.",
				replies: [
					{
						text: "The cart left.",
						goto: "left",
						requires: [{
							flag: "cartEase",
							is: true
						}]
					},
					{
						text: "I pinned the load.",
						goto: "pinned",
						requires: [{
							flag: "cartPinned",
							is: true
						}]
					},
					end$4("I'll read the brake.", [flag$4("mossMet", true), log$4("Moss stays on the brake. The cart is the sentence. She is not.")])
				]
			},
			left: {
				speaker: "moss",
				text: "Then Rust has the weight and does not have the speech yet. Don't ask me to be glad. A cart is not a kindness. It is a parent arriving early.",
				replies: [end$4("Let it arrive.", [flag$4("mossMet", true)])]
			},
			pinned: {
				speaker: "moss",
				text: "Then the pit can look finished and the forge can go hungry. I will stay on the pin. If you ease it later, the hunger was still true for as long as you meant it.",
				replies: [end$4("Leave the pin.", [flag$4("mossMet", true), log$4("Moss stays with the pin. Downstream will meet the absence.")])]
			}
		}
	},
	"tobin-mid": {
		start: "start",
		nodes: { start: {
			speaker: "tobin",
			text: "The ward is not a second city. It drinks from a room we already stood in. If the cups are full, a bill is drinking with them. If they are empty, the parent is the thing to name, not the thirst.",
			replies: [end$4("Name the parent.", [flag$4("tobinMid", true), log$4("Tobin counts the ward as a child of the Sinks. He does not grade the child.")])]
		} }
	},
	"wren-mid": {
		start: "start",
		nodes: { start: {
			speaker: "wren",
			text: "The slab is a cable with a throat somewhere else. I can draw that without making the rigger a symbol. If you want the line to hear the lung, that is a different sentence from standing here.",
			replies: [end$4("Stand here.", [flag$4("wrenMid", true), log$4("Wren keeps the diagram in her hands. The pit does not have to hear it for the company to be real.")])]
		} }
	},
	"sera-mid": {
		start: "start",
		nodes: { start: {
			speaker: "sera",
			text: "I came to watch what you do with a forge that can be made to work. Working is not the same as permitted. If the stock is live, I disagree and I am still here. If you refused it, I heard you.",
			replies: [end$4("Keep watching.", [flag$4("seraMid", true), log$4("Sera stays. The disagreement was not a resignation.")])]
		} }
	},
	"mara-mid": {
		start: "start",
		nodes: { start: {
			speaker: "mara",
			text: "The nights came with me. If the flues are warm, that is a bed, not a cure. If you sanded the song so I would be easier, say so later. Not while the road is still a road.",
			replies: [end$4("The nights stay.", [flag$4("maraMid", true), log$4("Mara keeps the nights on the road. The walk does not get a cleaner version.")])]
		} }
	},
	brin: {
		start: "start",
		nodes: {
			start: {
				speaker: "brin",
				text: "The face reads dead. The pocket is not dry. I have been auditing the face because it is the thing that looks broken. If you have a better parent, say it. If you cut the face, it will bite you and the district will not notice.",
				replies: [
					{
						text: "The face is a costume. The feed behind it is holding.",
						goto: "named",
						requires: [{
							flag: "gaugeRead",
							is: true
						}]
					},
					{
						text: "I cut the real feed.",
						goto: "cut",
						requires: [{
							flag: "gaugeCut",
							is: true
						}]
					},
					end$4("The face can wait.")
				]
			},
			named: {
				speaker: "brin",
				text: "Then I was reading a costume. The listener on the housing names one seam you have not admitted. It does not make the seam true, and it does not survive the telling. I am staying off the servo.",
				replies: [end$4("Stay off it.")]
			},
			cut: {
				speaker: "brin",
				text: "The pocket is dry and the pump is not. You cut a local parent. The drowned thing in the corner was drinking it. I am not going back in until it forgets.",
				replies: [end$4("Leave her the corridor.")]
			}
		}
	},
	vetch: {
		start: "start",
		nodes: {
			start: {
				speaker: "vetch",
				text: "The ward is dry, so the alley drinks what the clinic is not using. That still is a cup, not a well. Break it and we go thirsty. License it and I can live with a parent that is not a raid. Leave it and I will still be here.",
				replies: [
					{
						text: "The trickle is written down.",
						goto: "licensed",
						requires: [{
							flag: "stillLicensed",
							is: true
						}]
					},
					{
						text: "The cup is broken.",
						goto: "broken",
						requires: [{
							flag: "stillBroken",
							is: true
						}]
					},
					end$4("Leave the cup.")
				]
			},
			licensed: {
				speaker: "vetch",
				text: "You wrote it down. I can pay a trickle. I will not pretend the cup made the ward.",
				replies: [end$4("Keep the trickle.", [
					flag$4("vetchPaid", true),
					{
						op: "scrip",
						n: 14
					},
					log$4("Vetch pays for a cup that stayed a cup. The scrip is the license, not a thanks.")
				], { requires: [{ missing: "vetchPaid" }] }), end$4("That's the room.")]
			},
			broken: {
				speaker: "vetch",
				text: "You broke the cup while we were thirsty. The clinic did not become a well. I will not call it order.",
				replies: [end$4("It was a cut.")]
			}
		}
	},
	holt: {
		start: "start",
		nodes: {
			start: {
				speaker: "holt",
				text: "They are not mining. They are standing under a winch that is not the crane. If the canyon throat is still breathing, they can hear a parent and they will stand down or leave. If the throat is already still, that winch is the only parent they have.",
				replies: [
					{
						text: "They stood down.",
						goto: "down",
						requires: [{
							flag: "crewStood",
							is: true
						}]
					},
					{
						text: "They left.",
						goto: "left",
						requires: [{
							flag: "crewFled",
							is: true
						}]
					},
					end$4("The winch can wait.")
				]
			},
			down: {
				speaker: "holt",
				text: "A live throat is a sentence they understand. The dog I kicked you holds a seam. It is not a wage.",
				replies: [end$4("The throat was the reason.")]
			},
			left: {
				speaker: "holt",
				text: "They left because the cable above them was still alive. I won't call that cowardice. I won't call it loyalty either.",
				replies: [end$4("Let them go.")]
			}
		}
	},
	ime: {
		start: "start",
		nodes: {
			start: {
				speaker: "ime",
				text: "This cell can keep one infirmary. It is not a siphon and it is not a pardon. Charge it while the parent is still sending. After you answer the crucible, it is a story about a night you did not store.",
				replies: [
					{
						text: "The cell is holding.",
						goto: "holding",
						requires: [{
							flag: "bufferCharged",
							is: true
						}, { missing: "citadelFate" }]
					},
					{
						text: "One ward kept the night.",
						goto: "kept",
						requires: [{
							flag: "bufferHeld",
							is: true
						}]
					},
					{
						text: "The cell was empty.",
						goto: "empty",
						requires: [{
							flag: "citadelFate",
							is: "sever"
						}, { missing: "bufferCharged" }]
					},
					end$4("Leave the cell.")
				]
			},
			holding: {
				speaker: "ime",
				text: "One night, if you cut the parent. The other wards will still go dark. I will not let you call the cell a solution.",
				replies: [end$4("One night.")]
			},
			kept: {
				speaker: "ime",
				text: "One ward kept the night. I will not thank you for the others. The dark is still the dark.",
				replies: [end$4("The others stayed dark.")]
			},
			empty: {
				speaker: "ime",
				text: "The wards went with the siphon. There was a cell. It was empty. That is also a decision.",
				replies: [end$4("It was empty.")]
			}
		}
	}
};
var LATE = [
	{
		convo: "tobin-after",
		text: "Talk while we walk.",
		requires: [{
			flag: "onRoad",
			is: true
		}],
		goto: "road-talk",
		node: {
			speaker: "tobin",
			text: "The road is a pipe. If you're about to ask whether I agree with the last cut, I don't have to. I have to know which parent you touched."
		}
	},
	{
		convo: "wren",
		text: "The districts are one line.",
		requires: [{
			flag: "onRoad",
			is: true
		}],
		goto: "one-line",
		node: {
			speaker: "wren",
			text: "Sinks, ward, pit, hall, citadel. You can still get lost. You cannot honestly call them separate machines anymore."
		}
	},
	{
		convo: "sera",
		text: "Say what you're afraid I'm becoming.",
		requires: [{ companion: "sera" }],
		goto: "afraid",
		node: {
			speaker: "sera",
			text: "A person who can see a standard and sit in it. I stayed so I would be in the room when you decide whether that's maintenance."
		}
	},
	{
		convo: "mara",
		text: "The nights, again.",
		requires: [{ companion: "mara" }],
		goto: "nights",
		node: {
			speaker: "mara",
			text: "They're still mine. If the forge is loud, I hear it as a neighbor, not as a cure. Don't cure me to make the walk simpler."
		}
	},
	{
		convo: "workers",
		text: "A rigger was off the count.",
		requires: [{
			flag: "rillSpoken",
			is: true
		}],
		goto: "rill-back",
		node: {
			speaker: "hask",
			text: "Rill. Off the grade, not under the slab. I'll put the name back on the board. The crane doesn't get to be the only record."
		}
	},
	{
		convo: "kael-pre",
		text: "The city is one machine. Your armor is a room of it.",
		requires: [{
			flag: "workersKnow",
			is: true
		}],
		goto: "one-machine",
		node: {
			speaker: "kael",
			text: "A diagram from a line worker. How embarrassing for a magistrate. The pit and the pump are one sentence, and my shell is not outside that sentence. Read it anyway. I will still be armed."
		}
	},
	{
		convo: "vane",
		text: "The road is dark because of this floor.",
		requires: [{
			flag: "roadDark",
			is: true
		}],
		goto: "dark-floor",
		node: {
			speaker: "vane",
			text: "The lamps are a child. If you break the glass, you chose the dark and left the siphon. If the siphon is already cut, the dark is honest and the infirmaries are in it. I will not pick your sentence."
		}
	},
	{
		convo: "ives",
		text: "The forge's parents are not in this room.",
		requires: [{
			flag: "oreSound",
			is: false
		}],
		goto: "no-parent",
		node: {
			speaker: "ives",
			text: "Then I don't have stock, and I don't have a speech. Ore is a child of the colossus and the chute. Water is a child of the Sinks. Fix a parent or refuse the stock. Don't ask the bench to invent a quarry."
		}
	},
	{
		convo: "ives",
		text: "The stock has parents.",
		requires: [{
			flag: "gearLive",
			is: true
		}],
		goto: "stock-parents",
		close: "None of them is a virtue.",
		node: {
			speaker: "ives",
			text: "Ore, quench, fire. I can make a thing. I can't make the thing innocent. If you wanted innocence, the stock was the thing to refuse."
		}
	},
	{
		convo: "pell",
		text: "The ward is eating.",
		requires: [{
			flag: "foodLive",
			is: true
		}],
		goto: "ward-eats",
		close: "A parent is enough.",
		node: {
			speaker: "pell",
			text: "Then the stall has something to sell that isn't a rumor. Don't wait for Nessa to thank a pipe. She'll reopen. That's the thanks."
		}
	},
	{
		convo: "pell",
		text: "The lung stopped.",
		requires: [{
			flag: "bellowsLive",
			is: false
		}],
		goto: "lung-quit",
		close: "I can hear it from here.",
		node: {
			speaker: "pell",
			text: "A district is one machine when you can hear it fail from the alley. The grate still drips. The drip is a lie if the lung is down."
		}
	},
	{
		convo: "nessa",
		text: "Ada has a plate.",
		requires: [{
			flag: "foodLive",
			is: true
		}],
		goto: "ada-plate",
		close: "A parent, not a sermon.",
		node: {
			speaker: "nessa",
			text: "She eats. I sell. The levy will try to be a third person in the room. I can live with a parent. I will not live with a speech about it."
		}
	},
	{
		convo: "bram",
		text: "The stone is moving.",
		requires: [{
			flag: "stoneMoving",
			is: true
		}],
		goto: "stone-moves",
		close: "The road is the parent.",
		node: {
			speaker: "bram",
			text: "Then the cart has a job. Say if you want it held in the ward. Say if you want it uphill. Don't ask my conscience to be the haul."
		}
	},
	{
		convo: "lark",
		text: "The south walk.",
		requires: [{
			flag: "roadBypass",
			is: true
		}],
		goto: "south-walk",
		close: "No sign.",
		node: {
			speaker: "lark",
			text: "You found the cut. It stays a cut. I won't put a sign on it. Signs are how a shortcut becomes a toll."
		}
	},
	{
		convo: "lark",
		text: "The lamps are out.",
		requires: [{
			flag: "roadDark",
			is: true
		}],
		goto: "lamps-out",
		close: "The south walk doesn't ask.",
		node: {
			speaker: "lark",
			text: "Then the shade on the glass stretch is no longer scenery. The south walk doesn't ask the lamps for permission."
		}
	},
	{
		convo: "quill",
		text: "The levy has something to write.",
		requires: [{
			flag: "levyLive",
			is: true
		}],
		goto: "levy-writes",
		close: "The bill is not the parent.",
		node: {
			speaker: "quill",
			text: "A meal arrived and a bill arrived on it. I price what is real. I don't pretend the bill made the meal."
		}
	},
	{
		convo: "workers",
		text: "Pim came back to the count.",
		requires: [{
			flag: "pimCount",
			is: true
		}],
		goto: "pim-count",
		close: "Fear is an audit.",
		node: {
			speaker: "hask",
			text: "Fear is a kind of audit. The slab missed, so the fear stood down. I won't call that loyalty, and I won't put it on a plaque."
		}
	},
	{
		convo: "tobin-after",
		text: "Doss moved off the reed.",
		requires: [{
			flag: "dossShift",
			is: true
		}],
		goto: "doss-moved",
		close: "Weather, not gossip.",
		node: {
			speaker: "tobin",
			text: "A sleeper doesn't relocate for drama. The weather stopped. That's the whole report."
		}
	},
	{
		convo: "wren",
		text: "The moth and the child found the same drip.",
		requires: [{
			flag: "pipShown",
			is: true
		}],
		goto: "same-drip",
		close: "Wings first.",
		node: {
			speaker: "wren",
			text: "I had the grate. I didn't have wings. Next time I'll ask what refuses to cross before I draw the straight line."
		}
	},
	{
		convo: "mara",
		text: "Nell is sleeping on the flue.",
		requires: [{
			flag: "tenementWarm",
			is: true
		}],
		goto: "nell-sleeps",
		close: "A night is enough.",
		node: {
			speaker: "mara",
			text: "Good. A night with a parent is still a night. Don't ask her to sing about it. I won't either."
		}
	},
	{
		convo: "sera",
		text: "The doorway upstairs is a meal.",
		requires: [{
			flag: "guardToll",
			is: true
		}, {
			flag: "sarnMet",
			is: true
		}],
		goto: "toll-meal",
		close: "Hunger in a doorway.",
		node: {
			speaker: "sera",
			text: "Then it isn't order. It's hunger wearing a door. Feed it, cut it, or walk past it. All three write the ledger. Don't let them rename it first."
		}
	},
	{
		convo: "nell",
		text: "The flue and the stock are different fires.",
		requires: [{
			flag: "gearLive",
			is: true
		}, {
			flag: "tenementWarm",
			is: true
		}],
		goto: "two-fires",
		close: "Both can be true.",
		node: {
			speaker: "nell",
			text: "The stock is loud. My blanket is quiet. I don't owe the rifles a thank-you for the night. They drank from the same haul. That's all."
		}
	},
	{
		convo: "vane",
		text: "The kitchen is still cooking.",
		requires: [{
			flag: "sarnMet",
			is: true
		}, {
			flag: "citadelSupplied",
			is: true
		}],
		goto: "kitchen-cooks",
		close: "The citadel is not a stomach.",
		node: {
			speaker: "vane",
			text: "Stores arrived. Sarn will not thank the rank for a haul. I won't ask her to. Eating is not a rank, even when the rank eats."
		}
	},
	{
		convo: "ives",
		text: "The cart never arrived.",
		requires: [{
			flag: "cartPinned",
			is: true
		}, {
			flag: "stoneMoving",
			is: true
		}],
		goto: "cart-held",
		close: "The pit is not the forge.",
		node: {
			speaker: "ives",
			text: "Stone left the quarry. It is not on my floor. Whatever is holding the road is the parent I don't have. I can still refuse the stock. I can't invent the ore."
		}
	},
	{
		convo: "ives",
		text: "The cart beat the speech.",
		requires: [{
			flag: "cartEase",
			is: true
		}, {
			flag: "stoneMoving",
			is: true
		}],
		goto: "cart-early",
		close: "Weight first.",
		node: {
			speaker: "ives",
			text: "It's already in the yard. Don't tell me what it means until I know whether you want it to become a rifle. The arrival is not the permission."
		}
	},
	{
		convo: "nell",
		text: "The wash is drinking.",
		requires: [{
			flag: "washLive",
			is: true
		}],
		goto: "wash-drinks",
		close: "A pipe, not a song.",
		node: {
			speaker: "nell",
			text: "There's water that isn't the flue. If the forge went dry for it, I know. I will drink it. I will not thank a rifle for the thirst I didn't have."
		}
	},
	{
		convo: "drift",
		text: "The glaze was cut.",
		requires: [{
			flag: "iceCut",
			is: true
		}],
		goto: "glaze-cut",
		close: "The edge is enough.",
		node: {
			speaker: "drift",
			text: "The hollow went cold and the clock might still be turning. I stay on the edge. You billed the middle. I don't have to agree to feel the bill."
		}
	},
	{
		convo: "drift",
		text: "The span is seated.",
		requires: [{
			flag: "iceSpan",
			is: true
		}],
		goto: "glaze-span",
		close: "A floor.",
		node: {
			speaker: "drift",
			text: "The middle stopped taking a bite. I still sleep where the weather is. A floor is not a reason to stand in the bowl."
		}
	},
	{
		convo: "lark",
		text: "Moss pinned the cart.",
		requires: [{
			flag: "cartPinned",
			is: true
		}],
		goto: "moss-pin",
		close: "The road kept it.",
		node: {
			speaker: "lark",
			text: "Then the high walk is carrying a refusal. I won't call it down. Rust can be hungry with the pit looking busy. That's a true sentence. I just run."
		}
	},
	{
		convo: "lark",
		text: "The brick yard.",
		requires: [{
			flag: "seen:road",
			is: true
		}, { missing: "seen:kiln" }],
		goto: "kiln-mouth",
		close: "South of this walk.",
		node: {
			speaker: "lark",
			text: "Before Rust, south of this walk, a kiln is waiting on parents it will not name. Clay is in the yard. Water is not. The stamp is a third parent, and it is a person."
		}
	},
	{
		convo: "lark",
		text: "The kiln took.",
		requires: [{
			flag: "brickLive",
			is: true
		}],
		goto: "kiln-took",
		close: "Smoke is a receipt.",
		node: {
			speaker: "lark",
			text: "I can smell the set from the road. If Cress is still standing, the smell has a bill. I run. I don't invoice."
		}
	},
	{
		convo: "lark",
		text: "The freight table.",
		requires: [{
			flag: "seen:road",
			is: true
		}, { missing: "seen:switch" }],
		goto: "switch-mouth",
		close: "South of the brick stair.",
		node: {
			speaker: "lark",
			text: "Past the kiln mouth, the road drops into a yard. Hale's plates are slick. Rue invoices whatever the table agrees to pass. I run over it. I don't grease it."
		}
	},
	{
		convo: "lark",
		text: "The glass stair.",
		requires: [{
			flag: "seen:road",
			is: true
		}, { missing: "seen:pane" }],
		goto: "pane-mouth",
		close: "North of the high walk.",
		node: {
			speaker: "lark",
			text: "North off this walk, before the ward stair, a glasshouse is waiting on parents it will not name. Sand is in the pit. Heat is not. The stamp is a third parent, and it is a person. Sol runs cullet. I run messages."
		}
	},
	{
		convo: "bram",
		text: "I read a waybill with your cart on it.",
		requires: [{
			flag: "waybillRead",
			is: true
		}],
		goto: "waybill",
		close: "The paper is not the cart.",
		node: {
			speaker: "bram",
			text: "Then you already know the table and this cart have been refusing the same load. The paper does not make me send it. A seated road might. A speech will not."
		}
	}
];
function extendCampaign(convos) {
	for (const [id, convo] of Object.entries(CAMPAIGN)) convos[id] = convo;
	for (const late of LATE) {
		const convo = convos[late.convo];
		const start = convo?.nodes.start;
		if (!convo || !start) continue;
		if (start.replies.some((r) => r.goto === late.goto)) continue;
		start.replies.push({
			text: late.text,
			goto: late.goto,
			requires: late.requires
		});
		convo.nodes[late.goto] = {
			speaker: late.node.speaker,
			text: late.node.text,
			replies: [end$4(late.close ?? "That's the room.")]
		};
	}
}
var log$3 = (text) => ({
	op: "log",
	text
});
var flag$3 = (key, value) => ({
	op: "flag",
	key,
	value
});
var journal$4 = (id, title, text, status = "open") => ({
	op: "journal",
	id,
	title,
	text,
	status
});
function end$3(text, effects, extra) {
	return {
		text,
		effects,
		end: true,
		...extra
	};
}
/** People of the brick yard. The machines are the verbs. These lines only say which parent is missing. */
var KILN_CONVOS = {
	harl: {
		start: "start",
		nodes: {
			start: {
				speaker: "harl",
				text: "Harl. I fire brick. Clay is the only parent this yard actually owns. The flue is sulking, the set wants water that is not here, and Cress will invoice whatever stands up.",
				replies: [
					{
						text: "What would make a brick that doesn't crack?",
						goto: "parents"
					},
					{
						text: "Who is Cress to the fire?",
						goto: "cress"
					},
					{
						text: "The houses are warm.",
						goto: "warm",
						requires: [{
							flag: "kilnHouses",
							is: true
						}]
					},
					{
						text: "You refused the yard.",
						goto: "refused",
						requires: [{
							flag: "kilnRefused",
							is: true
						}]
					},
					end$3("I'll read the flue.")
				]
			},
			parents: {
				speaker: "harl",
				text: "Seat the flue if the clay is still clay. That is local. The set still wants gallery water, or a field-dry if you have scrap and the nerve to bake it mean. If Rust's fire bed is actually live, the yard can borrow that heat and leave my flue alone. Those are three sentences. They are not the same brick.",
				replies: [end$3("Then the flue is a machine, not a favor.", [journal$4("kiln-parents", "What the brick is waiting on", "Clay is local. The flue can be seated, stopped, or refused. The set still wants gallery water, or a field-dry. A live Rust fire can be borrowed. The stamp is a person, and it is also a parent.")])]
			},
			cress: {
				speaker: "harl",
				text: "She prices a finished brick the way a clerk prices a meal. License her and the board can sell. Cut the stamp and the levy dies with it. Leave her and she will invoice the houses even if Jun cannot sell. I will not pick your sentence. I live in the heat.",
				replies: [end$3("The stamp is not the flue.")]
			},
			warm: {
				speaker: "harl",
				text: "The houses took it. Don't thank the clay. Thank whichever parent you actually seated, and remember Cress can still read the smoke.",
				replies: [end$3("Smoke is a receipt.")]
			},
			refused: {
				speaker: "harl",
				text: "You left the bed down. The levy has nothing to eat. Neither do the houses. I am at the inn because the flue is not a place to stand. You can still seat it. Refusal was a fact, not a vow.",
				replies: [end$3("A fact can be seated later.")]
			}
		}
	},
	cress: {
		start: "start",
		nodes: {
			start: {
				speaker: "cress",
				text: "Cress, stamp office. A brick that stands up is a civic good. Civic goods have a levy. I did not invent the clay. I invented the price.",
				replies: [
					{
						text: "What does the stamp actually parent?",
						goto: "parent"
					},
					{
						text: "The houses are already being invoiced.",
						goto: "bill",
						requires: [{
							flag: "kilnLevy",
							is: true
						}]
					},
					{
						text: "Jun's board is open.",
						goto: "open",
						requires: [{
							flag: "kilnShop",
							is: true
						}]
					},
					{
						text: "There is no brick to price.",
						goto: "dry",
						requires: [{
							flag: "brickLive",
							is: false
						}]
					},
					end$3("The stamp can wait.")
				]
			},
			parent: {
				speaker: "cress",
				text: "The stamp parents the legal sale, and the levy. It does not parent the fire. License it on the desk — pay, or talk like someone the Bureau already believes — and Jun may sell. Cut it and you will be believed in a different room. Smuggle a brick for less and I hear about it anyway.",
				replies: [end$3("Then the desk is the machine.")]
			},
			bill: {
				speaker: "cress",
				text: "The houses took brick. The levy took the houses. That is the same pipe. If you wanted a shop without a bill, you needed a hole where my stamp is.",
				replies: [end$3("I can still make the hole.")]
			},
			open: {
				speaker: "cress",
				text: "The board is selling. If my stamp is intact, the levy is intact. Do not describe that as a kindness I did you.",
				replies: [end$3("I won't.")]
			},
			dry: {
				speaker: "cress",
				text: "I cannot invoice a crack. Seat something that holds, or stop wasting the desk.",
				replies: [end$3("The fire is not your desk.")]
			}
		}
	},
	jun: {
		start: "start",
		nodes: {
			start: {
				speaker: "jun",
				text: "Jun. I keep the board and the beds. I do not keep the fire. Prices are on the bench, and they move when the parents move. A tin is food. It is not a well.",
				replies: [
					{
						text: "What is the board waiting on?",
						goto: "board"
					},
					{
						text: "The board can sell.",
						goto: "selling",
						requires: [{
							flag: "kilnShop",
							is: true
						}]
					},
					{
						text: "Brick is up and you still won't sell.",
						goto: "held",
						requires: [{
							flag: "brickLive",
							is: true
						}, {
							flag: "kilnShop",
							is: false
						}]
					},
					{
						text: "People are sleeping warm.",
						goto: "sleep",
						requires: [{
							flag: "kilnHouses",
							is: true
						}]
					},
					end$3("I'll read the bench.")
				]
			},
			board: {
				speaker: "jun",
				text: "Draw a brick only when the set is actually holding. Sell it here for a real price if I am allowed to buy, or for a worse price if you are willing to be the other parent. Bandages do not care about the stamp. The coat and the chisel do. Rest is upstairs. A bed is not a speech.",
				replies: [end$3("The bench, then.", [journal$4("kiln-board", "Jun's board", "The inn bench draws brick only while the set holds, sells it dear if the stamp allows and cheap if it doesn't, and keeps bandages either way. Rest is a bed, not a favor.")])]
			},
			selling: {
				speaker: "jun",
				text: "I can pay. Don't tell me the stamp was your idea of mercy if it is still on the wall.",
				replies: [end$3("The price is the price.")]
			},
			held: {
				speaker: "jun",
				text: "The brick is real and I am not allowed to be its shop. Cress is the parent of that sentence. You can still sell me one quietly. I will pay worse, and she will hear.",
				replies: [end$3("Quiet has a price too.")]
			},
			sleep: {
				speaker: "jun",
				text: "Teb went to a warm wall. I did not give him that. Whoever seated the set did. The bed upstairs is still just a bed.",
				replies: [end$3("I'll use it if I need it.")]
			}
		}
	},
	teb: {
		start: "start",
		nodes: {
			start: {
				speaker: "teb",
				text: "Teb. I sleep where the wall is least cruel. Today that is a fact about brick, not about me.",
				replies: [
					{
						text: "The wall is holding.",
						goto: "warm",
						requires: [{
							flag: "kilnHouses",
							is: true
						}]
					},
					{
						text: "The wall is cold.",
						goto: "cold",
						requires: [{
							flag: "kilnHouses",
							is: false
						}]
					},
					{
						text: "Is there another way through this yard?",
						goto: "cellar"
					},
					end$3("Sleep, then.")
				]
			},
			warm: {
				speaker: "teb",
				text: "It holds. If a bill came with it, the bill is not the heat. I can hate one and stand in the other.",
				replies: [end$3("Then stand.")]
			},
			cold: {
				speaker: "teb",
				text: "Clay is here and the set is not. I am not going to pretend a story about Harl fixes a parent. Water, heat, or a dry you bake yourself. I don't do those. I count nights.",
				replies: [end$3("Count them. I'll count the parents.")]
			},
			cellar: {
				speaker: "teb",
				text: "Nim sits on the cellar cut. She says the old flue has a glass that lies about being dead. I say don't smash a thing that is using you as weather. She knows the lock better than I do.",
				replies: [end$3("I'll ask Nim.")]
			}
		}
	},
	nim: {
		start: "start",
		nodes: {
			start: {
				speaker: "nim",
				text: "Nim. The cellar cut is a lock, not a wall. Something under it drinks a flue the yard forgot. It is not attacking. It is nested.",
				replies: [
					{
						text: "How does the lock actually open?",
						goto: "lock"
					},
					{
						text: "I have the glass.",
						goto: "glass",
						requires: [{ item: "sootglass" }]
					},
					{
						text: "The mite woke up.",
						goto: "woke",
						requires: [{
							flag: "miteAwake",
							is: true
						}]
					},
					end$3("Leave the nest.")
				]
			},
			lock: {
				speaker: "nim",
				text: "Work the lock if your hands know locks. Or I can tell you the give in the hinge, and then it is just a door. Smashing the glass inside wakes what is nested on it. Lifting the glass, once you can read it, does not.",
				replies: [end$3("Show me the give.", [
					flag$3("kilnTold", true),
					journal$4("kiln-cellar", "The cellar cut", "Nim knows the hinge. A lockwork hand can open it without her. Under it, a soot glass can be lifted if it has been read. Smashing it wakes the mite that was using it as a parent."),
					log$3("The hinge has a give. The door will listen now.")
				]), end$3("I'll try the lock myself.")]
			},
			glass: {
				speaker: "nim",
				text: "You lifted it. The mite is still nested, which means you did not take its parent by force. That glass names a seam other people call illegible. Use it on a lie, not on a person.",
				replies: [end$3("On a lie, then.")]
			},
			woke: {
				speaker: "nim",
				text: "You smashed the parent. It answered. I told you it was nested, not dead.",
				replies: [end$3("It answered.")]
			}
		}
	},
	voss: {
		start: "start",
		nodes: {
			start: {
				speaker: "voss",
				text: "Voss. The stamp is a person charging rent on fire. I don't want the houses cold. I want Cress unable to invoice them.",
				replies: [
					{
						text: "What do you actually want done?",
						goto: "want"
					},
					{
						text: "The stamp is already a hole.",
						goto: "hole",
						requires: [{
							flag: "stampCut",
							is: true
						}]
					},
					{
						text: "I licensed her.",
						goto: "licensed",
						requires: [{
							flag: "kilnLicensed",
							is: true
						}, {
							flag: "stampCut",
							is: false
						}]
					},
					{
						text: "There is no brick. There is no bill.",
						goto: "nobill",
						requires: [{
							flag: "brickLive",
							is: false
						}]
					},
					end$3("Not your yard.")
				]
			},
			want: {
				speaker: "voss",
				text: "Cut the stamp on her desk. The levy dies. Jun can sell if the brick is real. If you pay Cress instead, the houses get a bill with their heat. I will leave if you can say that to my face like a person. I will not help you do it.",
				replies: [end$3("I'll decide at the desk."), {
					text: "Step aside or I move you.",
					goto: "fight",
					effects: [{
						op: "combat",
						ids: ["voss"]
					}, log$3("Voss answers with a baton, not a theory.")]
				}]
			},
			hole: {
				speaker: "voss",
				text: "Good. The houses can keep the heat without her number. Don't expect me to call you kind. You made a hole. The hole was the point.",
				replies: [end$3("The hole was the point.", [
					{
						op: "scrip",
						n: 8
					},
					{
						op: "rep",
						faction: "unbound",
						n: 4
					},
					flag$3("vossPaid", true),
					log$3("He pays like a man settling a tool, not a debt of friendship.")
				], { requires: [{ missing: "vossPaid" }] }), end$3("That's enough.")]
			},
			licensed: {
				speaker: "voss",
				text: "Then the heat has a landlord. Say it plainly or don't talk to me.",
				replies: [{
					text: "The bill is the price of a legal board. I chose it.",
					check: {
						skill: "speech",
						dc: 46
					},
					goto: "left",
					failGoto: "stay",
					effects: [flag$3("vossLeft", true), log$3("He leaves the yard. He does not forgive the sentence. He stops blocking it.")]
				}, end$3("Then stay angry.")]
			},
			left: {
				speaker: "voss",
				text: "Fine. I'll be on the road. Don't wave.",
				replies: [end$3("I won't.")]
			},
			stay: {
				speaker: "voss",
				text: "That was a speech looking for a plaque. I'm still here.",
				replies: [end$3("Then be here.")]
			},
			nobill: {
				speaker: "voss",
				text: "No brick, no bill. Also no walls worth sleeping in. You solved her and you solved the houses in the same direction. I don't cheer for that.",
				replies: [end$3("I wasn't asking for a cheer.")]
			},
			fight: {
				speaker: "voss",
				text: "Then we do it this way.",
				replies: [end$3("Move.")]
			}
		}
	},
	mite: {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "A small mill nested in the old flue. It is not hostile. The soot glass is in its weather. Take the glass cleanly and the nest stays a nest. Smash the glass and the nest has to stand up.",
			replies: [end$3("Leave it nested.")]
		} }
	},
	"kiln-cellar": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "A cellar cut under the houses. The hinge is tired. The lock is not a moral problem. It is a lock.",
				replies: [
					{
						text: "Use the give Nim showed you.",
						requires: [{
							flag: "kilnTold",
							is: true
						}],
						goto: "open",
						effects: [flag$3("kilnCellar", true), log$3("The hinge gives. The cellar is a room.")]
					},
					{
						text: "Work the lock.",
						check: {
							skill: "lockwork",
							dc: 48
						},
						goto: "open",
						failGoto: "stuck",
						effects: [flag$3("kilnCellar", true), log$3("The lock turns. You were not invited. The door does not care.")],
						failEffects: [log$3("The lock holds. A better hand, or Nim's give, would not have to fight it.")]
					},
					end$3("Leave it shut.")
				]
			},
			open: {
				speaker: "narrator",
				text: "The cut opens on a dry flue and a nested mill. The glass is a machine, not a treasure pile.",
				replies: [end$3("Go down.")]
			},
			stuck: {
				speaker: "narrator",
				text: "Still shut.",
				replies: [end$3("Still shut.")]
			}
		}
	},
	"tobin-kiln": {
		start: "start",
		nodes: { start: {
			speaker: "tobin",
			text: "This flue is a cousin of the lung, not a child of it. If the bricks crack, don't blame Harl until you have looked at the gallery. Water is a parent even in a yard that thinks it only owns clay.",
			replies: [end$3("I'll look upstream.", [flag$3("tobinKilnSpoke", true), log$3("Tobin counts the kiln the way he counts a pump: local hands, distant parents.")])]
		} }
	},
	"wren-kiln": {
		start: "start",
		nodes: { start: {
			speaker: "wren",
			text: "The set is a line. Clay, water, heat, stamp. If you only fix the one in front of you, the line will still fail somewhere you are not standing.",
			replies: [end$3("Then I walk the line.", [flag$3("wrenKilnSpoke", true), log$3("Wren will not let the kiln be a single machine.")])]
		} }
	}
};
var log$2 = (text) => ({
	op: "log",
	text
});
var flag$2 = (key, value) => ({
	op: "flag",
	key,
	value
});
var journal$3 = (id, title, text, status = "open") => ({
	op: "journal",
	id,
	title,
	text,
	status
});
function end$2(text, effects, extra) {
	return {
		text,
		effects,
		end: true,
		...extra
	};
}
/** The freight yard under the stack road. The table is the verb. These lines only name which parent is missing. */
var SWITCH_CONVOS = {
	hale: {
		start: "start",
		nodes: {
			start: {
				speaker: "hale",
				text: "Hale. I keep the table turning. Grease is local if you have scrap and a mean hand. The haul is not local. It is whatever the pit and the kiln managed to stand up, and Rue will invoice it if the stamp is still a stamp.",
				replies: [
					{
						text: "What is the floor actually doing to people?",
						goto: "floor"
					},
					{
						text: "What happens if the table stops?",
						goto: "jam"
					},
					{
						text: "The floor stopped billing.",
						goto: "greased",
						requires: [{
							flag: "switchGreased",
							is: true
						}]
					},
					{
						text: "You jammed the haul.",
						goto: "jammed",
						requires: [{
							flag: "switchJam",
							is: true
						}, { missing: "switchShunt" }]
					},
					end$2("I'll read the table.")
				]
			},
			floor: {
				speaker: "hale",
				text: "South of the table the plates are slick. Wick sleeps there because the shed is a story we tell when the axle is greased. Boots will keep your feet. They will not keep his. Grease is the parent of the shed. A jam is a different sentence. It stops the haul. It does not grease a plate.",
				replies: [end$2("Grease is not a boot.", [journal$3("switch-floor", "What the yard floor is waiting on", "The slick plates bill a step. Edge boots keep your feet and do not keep Wick's. Grease wants scrap. Jamming the table stops the haul upstream of the citadel. It is not grease.")])]
			},
			jam: {
				speaker: "hale",
				text: "Jam it and the citadel stops receiving this road, even if the pit is still proud of itself. Shunt it and the haul still moves, off her books. Seat it again and the books come back if the stamp is intact. I live on the plates. I will not pick your parent.",
				replies: [end$2("The table is not a favor.")]
			},
			greased: {
				speaker: "hale",
				text: "Wick can stand in the shed. Don't thank me. Thank the scrap. Rue can still read a haul that is moving.",
				replies: [end$2("The floor was the local parent.")]
			},
			jammed: {
				speaker: "hale",
				text: "The table is down. Downstream will notice before they get a speech about it. A shunt would let the weight leave without inviting her bill. I have not built it. You might.",
				replies: [end$2("A shunt is still a parent.")]
			}
		}
	},
	rue: {
		start: "start",
		nodes: {
			start: {
				speaker: "rue",
				text: "Rue, yard stamp. A haul that moves is a civic good. I did not invent the pit. I invented the line that notices the pit.",
				replies: [
					{
						text: "What does the stamp parent, exactly?",
						goto: "parent"
					},
					{
						text: "The haul is already on your books.",
						goto: "toll",
						requires: [{
							flag: "switchToll",
							is: true
						}]
					},
					{
						text: "The table is jammed.",
						goto: "jammed",
						requires: [{
							flag: "switchJam",
							is: true
						}, { missing: "switchShunt" }]
					},
					{
						text: "You are short a till.",
						goto: "till",
						requires: [{
							flag: "switchCaught",
							is: true
						}]
					},
					end$2("I'll read the desk.")
				]
			},
			parent: {
				speaker: "rue",
				text: "License me and the shed can sell if Hale's grease is real and the table is passing weight. Cut the stamp and the bill dies. The haul can still leave. Jam the table and I have nothing to invoice, because nothing is leaving. A shunt is a haul I am not allowed to see. I dislike it. The graph does not.",
				replies: [end$2("The bill is not the axle.")]
			},
			toll: {
				speaker: "rue",
				text: "Yes. Stone or brick, I don't mind which child it was. If it crossed this table on the books, it owes. Cut me and the owing stops. Do not expect me to call the hole maintenance.",
				replies: [end$2("A bill rode a parent that was already moving.")]
			},
			jammed: {
				speaker: "rue",
				text: "Then the citadel can starve with a busy pit. I will not pretend the table is still a road. Seat it if you want the books back.",
				replies: [end$2("The pit can look finished and still send nothing.")]
			},
			till: {
				speaker: "rue",
				text: "I saw the hands. The scrip can stay in your pack. The seeing stays here. Do not call it a fee you negotiated.",
				replies: [end$2("Then the seeing is the cost.")]
			}
		}
	},
	ske: {
		start: "start",
		nodes: {
			start: {
				speaker: "ske",
				text: "Ske. I sleep where the waybills are, when the door lets me. Rue thinks the bay is a closet. It is a parent she does not audit.",
				replies: [
					{
						text: "What is in the bay?",
						goto: "bay"
					},
					{
						text: "Show me the give.",
						goto: "give",
						requires: [{ missing: "switchTold" }]
					},
					end$2("Leave the door.")
				]
			},
			bay: {
				speaker: "ske",
				text: "Paper that says Bram's held cart and this table have been the same refusal on different days. Read it and you can say that to him without me. Smash it and the rat under the crate has to stand up. Those are not the same theft.",
				replies: [end$2("A paper can be a parent.")]
			},
			give: {
				speaker: "ske",
				text: "Left, then up, then don't force the hinge. The lock likes being asked. It does not like a stranger's pride.",
				replies: [end$2("I'll ask it that way.", [flag$2("switchTold", true), log$2("Ske gives the hinge. The bay is still a door until you use it.")])]
			}
		}
	},
	wick: {
		start: "start",
		nodes: {
			start: {
				speaker: "wick",
				text: "Wick. I sleep on the plates because the shed is a rumor. The plates take a little blood and call it weather.",
				replies: [
					{
						text: "What would make the shed true?",
						goto: "shed"
					},
					{
						text: "The plates stopped.",
						goto: "dry",
						requires: [{
							flag: "switchGreased",
							is: true
						}]
					},
					end$2("Stay low.")
				]
			},
			shed: {
				speaker: "wick",
				text: "Grease on the axle. Not your boots. Your boots are a private parent. I don't wear your feet.",
				replies: [end$2("Then the axle is the bed.")]
			},
			dry: {
				speaker: "wick",
				text: "I'll take the shed. Don't make a speech out of a plate that finally shut up.",
				replies: [end$2("Sleep.")]
			}
		}
	},
	"yard-rat": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "A small mill under the waybill crate. It is not hostile. The paper is in its weather. Lift the paper after you have read it and the nest stays a nest. Smash the crate and the nest has to stand up.",
			replies: [end$2("Leave it nested.")]
		} }
	},
	"switch-bay": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "A bay door under the yard office. The hinge is tired. The lock is not a moral problem. It is a lock.",
				replies: [
					{
						text: "Use the give Ske showed you.",
						requires: [{
							flag: "switchTold",
							is: true
						}],
						goto: "open",
						effects: [flag$2("switchBay", true), log$2("The hinge gives. The bay is a room.")]
					},
					{
						text: "Work the lock.",
						check: {
							skill: "lockwork",
							dc: 46
						},
						goto: "open",
						failGoto: "stuck",
						effects: [flag$2("switchBay", true), log$2("The lock turns. You were not invited. The door does not care.")],
						failEffects: [log$2("The lock holds. A better hand, or Ske's give, would not have to fight it.")]
					},
					end$2("Leave it shut.")
				]
			},
			open: {
				speaker: "narrator",
				text: "The bay opens on a crate and a nested mill. The waybill is a machine, not a treasure pile.",
				replies: [end$2("Go in.")]
			},
			stuck: {
				speaker: "narrator",
				text: "Still shut.",
				replies: [end$2("Still shut.")]
			}
		}
	},
	"tobin-switch": {
		start: "start",
		nodes: { start: {
			speaker: "tobin",
			text: "This table is not a pump, but it parents who gets the stone after the pit is done being proud. Grease is local. The citadel's meal is not. If you jam it, don't tell me the pit is still sending.",
			replies: [end$2("I'll count the table, not the speech.", [flag$2("tobinSwitchSpoke", true), log$2("Tobin counts the yard the way he counts a reed: a local hand, a distant child.")])]
		} }
	},
	"wren-switch": {
		start: "start",
		nodes: { start: {
			speaker: "wren",
			text: "A shunt is a line that does not ask the stamp's permission. It is still a line. If the paper in the bay is true, Bram's cart and this table have been refusing the same load.",
			replies: [end$2("Then I want the paper and the axle, not a slogan.", [flag$2("wrenSwitchSpoke", true), log$2("Wren will not let the yard be one machine with one door.")])]
		} }
	}
};
var log$1 = (text) => ({
	op: "log",
	text
});
var flag$1 = (key, value) => ({
	op: "flag",
	key,
	value
});
var take = (id, n = 1) => ({
	op: "take",
	id,
	n
});
var journal$2 = (id, title, text, status = "open") => ({
	op: "journal",
	id,
	title,
	text,
	status
});
function end$1(text, effects, extra) {
	return {
		text,
		effects,
		end: true,
		...extra
	};
}
/** People of the glasshouse. The furnace is the verb. These lines only say which parent is missing. */
var PANE_CONVOS = {
	orla: {
		start: "start",
		nodes: {
			start: {
				speaker: "orla",
				text: "Orla. I melt. Sand is the only parent this house owns. The flue is down, a live kiln can be borrowed if one is actually hot, and Ness will invoice whatever stands up clear.",
				replies: [
					{
						text: "What would make a pane that doesn't craze?",
						goto: "parents"
					},
					{
						text: "Who is Ness to the melt?",
						goto: "ness"
					},
					{
						text: "The house is holding.",
						goto: "hold",
						requires: [{
							flag: "paneHouses",
							is: true
						}]
					},
					{
						text: "You refused the melt.",
						goto: "refused",
						requires: [{
							flag: "paneRefused",
							is: true
						}]
					},
					end$1("I'll read the furnace.")
				]
			},
			parents: {
				speaker: "orla",
				text: "Seat the flue if the sand is still sand. That is local. If you spill the pit, cullet and scrap can stand in for it, or you can seat the pit again. Heat can be this flue, or a kiln bed that is actually live. Those are not the same pane. A clear one can also be sat into a lamp that lost its glass. The orrery does not have to be the parent of the pane. It still has to be the parent of the light.",
				replies: [end$1("Then the furnace is a machine, not a favor.", [journal$2("pane-parents", "What the melt is waiting on", "Sand is local, and it can be spilled or seated again. Cullet can stand in for a spilled pit. Heat is this flue, or a kiln bed that is actually live. The stamp is a person. A finished pane can be sat into a broken lamp, and it does not replace the orrery.")])]
			},
			ness: {
				speaker: "orla",
				text: "She prices a clear pane the way a clerk prices a meal. License her and the bench can sell a lens. Cut the stamp and the levy dies with it. Leave her and she will invoice the house even if you never sell. I will not pick your sentence. I live in the heat.",
				replies: [end$1("The stamp is not the flue.")]
			},
			hold: {
				speaker: "orla",
				text: "The house took the melt. Don't thank the sand. Thank whichever parent you actually seated, and remember Ness can still read the smoke. The moth came for the heat. I did not hire it.",
				replies: [end$1("Smoke is a receipt.")]
			},
			refused: {
				speaker: "orla",
				text: "You left the bed down. The levy has nothing to eat. Neither does the house. I am by the bench because the furnace is not a place to stand. You can still seat it. Refusal was a fact, not a vow.",
				replies: [end$1("A fact can be seated later.")]
			}
		}
	},
	ness: {
		start: "start",
		nodes: {
			start: {
				speaker: "ness",
				text: "Ness, stamp office. A pane that stands clear is a civic good. Civic goods have a levy. I did not invent the sand. I invented the price.",
				replies: [
					{
						text: "What does the stamp actually parent?",
						goto: "parent"
					},
					{
						text: "The house is already being invoiced.",
						goto: "bill",
						requires: [{
							flag: "paneLevy",
							is: true
						}]
					},
					{
						text: "The bench is selling.",
						goto: "open",
						requires: [{
							flag: "paneShop",
							is: true
						}]
					},
					{
						text: "There is no melt to price.",
						goto: "dry",
						requires: [{
							flag: "paneCharge",
							is: false
						}]
					},
					end$1("The stamp can wait.")
				]
			},
			parent: {
				speaker: "ness",
				text: "The stamp parents the legal sale, and the levy. It does not parent the fire. License it on the desk — pay, or talk like someone the Bureau already believes — and the bench may sell a lens. Cut it and you will be believed in a different room.",
				replies: [end$1("Then the desk is the machine.")]
			},
			bill: {
				speaker: "ness",
				text: "The house took the melt. The levy took the house. That is the same pipe. If you wanted a bench without a bill, you needed a hole where my stamp is.",
				replies: [end$1("I can still make the hole.")]
			},
			open: {
				speaker: "ness",
				text: "The bench is selling. If my stamp is intact, the levy is intact. Do not describe that as a kindness I did you.",
				replies: [end$1("I won't.")]
			},
			dry: {
				speaker: "ness",
				text: "I cannot invoice a craze. Seat something that holds, or stop wasting the desk.",
				replies: [end$1("The fire is not your desk.")]
			}
		}
	},
	fen: {
		start: "start",
		nodes: {
			start: {
				speaker: "fen",
				text: "Fen. I sweep cullet and I don't sweep the vault. There's a lens in the anneal that the bench will also sell you, if Ness ever allows a sale. The vault is a lock. I know the give. The moth nests on it when the house is cold.",
				replies: [
					{
						text: "Show me the give.",
						goto: "give"
					},
					{
						text: "The moth left the vault.",
						goto: "moth",
						requires: [{
							flag: "paneCharge",
							is: true
						}]
					},
					end$1("Sweep.")
				]
			},
			give: {
				speaker: "fen",
				text: "Up, then left, then don't rush the last pin. A lockwork hand can do it without me. Smashing the anneal is a third way, and the moth will stand up if you take its parent ugly.",
				replies: [end$1("The give is enough.", [flag$1("paneTold", true), journal$2("pane-vault", "The anneal give", "Fen's give opens the vault under the glasshouse. Lockwork can do it without him. The lens in the anneal is the same kind the bench sells once a permit exists. Smashing the nest makes the moth stand up.")])]
			},
			moth: {
				speaker: "fen",
				text: "It wanted the heat. It is not a guard and it is not a pet. Leave the anneal and it stays a moth.",
				replies: [end$1("Then I won't hire it either.")]
			}
		}
	},
	sol: {
		start: "start",
		nodes: {
			start: {
				speaker: "sol",
				text: "Sol. I run cullet up the north stair. Orla's pit is the only sand on this road. If someone spills it, scrap melted mean will stand in, and I will show the trick for a pocket of scrap. I don't invoice. Ness does, if the melt ever stands clear.",
				replies: [
					{
						text: "Where is the house?",
						goto: "where"
					},
					{
						text: "Take the scrap. Show the melt.",
						goto: "taught",
						requires: [{ item: "scrap" }],
						effects: [
							take("scrap", 1),
							flag$1("solCullet", true),
							log$1("Sol takes the scrap and talks the melt until it is a trick you can do without him.")
						]
					},
					{
						text: "The house is holding.",
						goto: "hold",
						requires: [{
							flag: "paneCharge",
							is: true
						}]
					},
					end$1("Run.")
				]
			},
			where: {
				speaker: "sol",
				text: "North off the high walk, before the ward stair gets proud. Sand, a flue, and a woman with a stamp. A finished pane will also sit in a lamp that lost its glass. I have carried both sentences and I have not fixed either.",
				replies: [end$1("Then the stair is the mouth.", [journal$2("pane-mouth", "A glasshouse off the high walk", "Sol runs cullet to a house north of the stack road. Sand is local. A spilled pit can take a mean melt. Ness prices whatever stands clear. A finished pane can be sat into a lamp, and it does not replace the light's other parent.")])]
			},
			taught: {
				speaker: "sol",
				text: "You have the trick. The furnace still has to be the one that takes it. I don't work for the stamp.",
				replies: [end$1("The trick is not the flue.")]
			},
			hold: {
				speaker: "sol",
				text: "Then somebody seated a parent. If Ness is still standing, the smoke has a bill. I run. I don't price.",
				replies: [end$1("Run.")]
			}
		}
	},
	"pane-moth": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "A glass moth. It is not hostile. Cold, it nests on the anneal. Heat, it comes into the yard and does not ask to be hired. Read the lens and lift it, and the nest stays a nest. Smash the anneal and the nest has to stand up.",
			replies: [end$1("Leave it nested.")]
		} }
	},
	"pane-vault": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "An anneal door under the glasshouse. The hinge is tired. The lock is not a moral problem. It is a lock.",
				replies: [
					{
						text: "Use the give Fen showed you.",
						requires: [{
							flag: "paneTold",
							is: true
						}],
						goto: "open",
						effects: [flag$1("paneVault", true), log$1("The hinge gives. The anneal is a room.")]
					},
					{
						text: "Work the lock.",
						check: {
							skill: "lockwork",
							dc: 44
						},
						goto: "open",
						failGoto: "stuck",
						effects: [flag$1("paneVault", true), log$1("The lock turns. You were not invited. The door does not care.")],
						failEffects: [log$1("The lock holds. A better hand, or Fen's give, would not have to fight it.")]
					},
					end$1("Leave it shut.")
				]
			},
			open: {
				speaker: "narrator",
				text: "The vault opens on an anneal and a nested moth, if the house is still cold. The lens is a machine, not a treasure pile. The bench will sell the same kind of lens once a permit exists.",
				replies: [end$1("Go in.")]
			},
			stuck: {
				speaker: "narrator",
				text: "Still shut.",
				replies: [end$1("Still shut.")]
			}
		}
	},
	"tobin-pane": {
		start: "start",
		nodes: { start: {
			speaker: "tobin",
			text: "This is not a pump, but a melt is still a parent. Sand is local. If the kiln is actually hot you can borrow it, and if you spill the pit you can melt scrap or seat the pit again. Don't tell me a clear house is innocent while Ness is still holding a stamp.",
			replies: [end$1("I'll count the furnace, not the speech.", [flag$1("tobinPaneSpoke", true), log$1("Tobin counts the glasshouse the way he counts a reed: a local hand, a distant child.")])]
		} }
	},
	"wren-pane": {
		start: "start",
		nodes: { start: {
			speaker: "wren",
			text: "A pane sat into a lamp is a child you made, not a child the orrery made. The lamp still dies if the clock is not sending. Cullet is a line that does not ask the pit's permission. It is still a line. The lens, vault or bench, names a parent the surface had not.",
			replies: [end$1("Then I want the parents, not a slogan.", [flag$1("wrenPaneSpoke", true), log$1("Wren will not let the glasshouse be one machine with one door.")])]
		} }
	}
};
var log = (text) => ({
	op: "log",
	text
});
var flag = (key, value) => ({
	op: "flag",
	key,
	value
});
var journal$1 = (id, title, text, status = "open") => ({
	op: "journal",
	id,
	title,
	text,
	status
});
function end(text, effects, extra) {
	return {
		text,
		effects,
		end: true,
		...extra
	};
}
var CONVOS = {
	"tobin-intro": {
		start: "start",
		nodes: {
			start: {
				speaker: "tobin",
				text: "You're late, Patch. The chamber spat you out with a zero on the dial, and the Sinks took the rest. Don't look at me like I have a rank to hand you. I have a bench, a dead pump, and a city that prefers both.",
				replies: [{
					text: "What did the chamber actually measure?",
					goto: "measure"
				}, {
					text: "Then show me the pump.",
					goto: "pump",
					effects: [journal$1("pump", "The broken pump", "The Sinks pump is dead. Tobin says the Bureau will not send a tech for a D-rank shop. Water, or the lack of it, is the whole district."), log("The pump sits east of the shop, beside the sludge cut.")]
				}]
			},
			measure: {
				speaker: "tobin",
				text: "Output. Fire, force, light — anything a clerk can put on a card. You gave them nothing they have a needle for. I watched you stare at my boiler like you could see the arguments inside the iron. That is not nothing. It is also not a rank. Ranks are how they decide who gets to be warm.",
				replies: [{
					text: "Then the pump. I'll read it.",
					goto: "pump",
					effects: [journal$1("pump", "The broken pump", "The Sinks pump is dead. A reading will tell you more than the Bureau's card ever did.")]
				}, end("I'll walk the shop first.")]
			},
			pump: {
				speaker: "tobin",
				text: "East side, past the door, before the sludge. Boiler, pipe, valve, bypass. The valve lost its seat. If you mend it blind, you may teach the water a new shape. The lower ward has no well of its own. If its cistern is dry, that dryness is this pump. Pell in the upper street sells parts and lies. Captain Varr holds the south checkpoint. He likes zeros. They don't talk back.",
				replies: [end("I'll audit it.", [log("Audit is on your bar. Stand next to a machine and read it.")])]
			}
		}
	},
	"tobin-after": {
		start: "start",
		nodes: {
			start: {
				speaker: "tobin",
				text: "You keep looking at the walls like they owe you a diagram. Speak.",
				replies: [
					{
						text: "How do you want the pump handled?",
						goto: "advice",
						requires: [{ missing: "pumpFate" }]
					},
					{
						text: "Come with me when I leave the Sinks.",
						goto: "join",
						requires: [{
							flag: "act1",
							is: true
						}, { noCompanion: true }]
					},
					{
						text: "Stay with the bench. I'll go alone.",
						requires: [{
							flag: "act1",
							is: true
						}, { companion: "tobin" }],
						effects: [{
							op: "dismiss",
							id: "tobin"
						}, log("Tobin stays with the boiler. He says the shop still needs a keeper.")],
						end: true
					},
					{
						text: "What did the full mend take from you?",
						goto: "whole",
						requires: [{
							flag: "tobinFate",
							is: "intact"
						}]
					},
					{
						text: "Does the scar still pull?",
						goto: "scar",
						requires: [{
							flag: "tobinFate",
							is: "scarred"
						}]
					},
					{
						text: "The bellows is stopped.",
						goto: "lung",
						requires: [{
							flag: "bellowsLive",
							is: false
						}]
					},
					{
						text: "Keep the pin hook. I'll hand it back when you should hold a seam.",
						requires: [{ missing: "hookGiven" }, { companion: "tobin" }],
						effects: [
							flag("hookGiven", true),
							{
								op: "item",
								id: "hook",
								n: 1
							},
							log("Tobin presses a pin hook into the pack. It holds a seam. It does not win a room.")
						],
						end: true
					},
					end("Back to the iron.")
				]
			},
			advice: {
				speaker: "tobin",
				text: "If you have a true valve, seat it. If you don't, the bypass will move dirty water and the cellars will remember you. There is also a clerk Pell can reach, if your mouth is better than your hands. None of these are clean. Clean is a Bureau word.",
				replies: [end("Understood.")]
			},
			join: {
				speaker: "tobin",
				text: "The bench will keep. If you're going where the plate is thicker, you'll want someone who has already hated it professionally. I won't call you Patch where they can hear.",
				replies: [end("Walk with me.", [
					{
						op: "recruit",
						id: "tobin"
					},
					log("Tobin slings a roll of tools and falls in a step behind."),
					journal$1("tobin", "Tobin on the road", "He left the bench. He still calls the work maintenance, not magic.", "done")
				]), end("Not yet.")]
			},
			whole: {
				speaker: "tobin",
				text: "I remember the shop. I don't remember wanting to bite. That's new, or that's gone. The pain used to keep my books honest. Be careful whose baseline you trust. Especially your own.",
				replies: [end("I'll remember that.")]
			},
			scar: {
				speaker: "tobin",
				text: "It pulls when the weather drops. Good. I can still tell a lie from a courtesy. You left me the part of the beating that teaches. Don't apologize unless you mean to do it again.",
				replies: [end("I won't.")]
			},
			lung: {
				speaker: "tobin",
				text: "Then the pump can be perfect and the ward can still be dry. You found the lung. Do not let anyone file that as an accident. A stopped bellows is a decision about every tap that drinks from it.",
				replies: [end("That's the decision.", [flag("tobinHeardLung", true)])]
			}
		}
	},
	pell: {
		start: "start",
		nodes: {
			start: {
				speaker: "pell",
				text: "Don't step on the sack. That's not junk, that's Tuesday. You have the look of a man the Bureau filed under furniture. What do you want out of the alley?",
				replies: [
					{
						text: "A valve that still remembers its seat.",
						goto: "valve",
						requires: [{ missing: "pumpFate" }]
					},
					{
						text: "The street clerk. Tell them the pump is a flood rating.",
						goto: "speech",
						requires: [{ missing: "pumpFate" }],
						check: {
							skill: "speech",
							dc: 55
						},
						effects: [
							flag("pumpFate", "speech"),
							flag("actReady", true),
							{
								op: "xp",
								n: 40
							},
							{
								op: "rep",
								faction: "bureau",
								n: 5
							},
							journal$1("pump", "The broken pump", "A clerk retagged the pump as a flood hazard. Water will move because paperwork is afraid of water. The Bureau will take the credit.", "done"),
							log("By evening the pump has a Bureau ribbon on it and water in the pipes. The ribbon is the loudest part."),
							{
								op: "pin",
								text: "Varr will have felt the paperwork."
							}
						],
						failEffects: [log("Pell laughs once. The clerk does not take messages from furniture.")],
						failGoto: "start"
					},
					{
						text: "Buy a focus phial. (12 scrip)",
						requires: [{ scrip: 12 }],
						effects: [
							{
								op: "scrip",
								n: -12
							},
							{
								op: "item",
								id: "phial"
							},
							log("The phial tastes like a licked coin. You keep it anyway.")
						],
						end: true
					},
					end("Keep your Tuesday.")
				]
			},
			valve: {
				speaker: "pell",
				text: "I have one that came off a Bureau practice boiler. They teach recruits to fail on purpose. Twenty-five scrip. Or impress me. Or try to lift it while I'm looking, which I am.",
				replies: [
					{
						text: "Twenty-five. Here.",
						requires: [{ scrip: 25 }],
						effects: [
							{
								op: "scrip",
								n: -25
							},
							{
								op: "item",
								id: "valve"
							},
							log("The valve is heavier than it looks. It has been loved by a machinist and then abandoned.")
						],
						end: true
					},
					{
						text: "The district floods, your sack floats, and Varr fines the alley. Think.",
						check: {
							skill: "speech",
							dc: 50
						},
						effects: [
							{
								op: "item",
								id: "valve"
							},
							{
								op: "xp",
								n: 15
							},
							log("Pell swears, then hands it over. 'If my stock drowns I will invoice your ghost.'")
						],
						failEffects: [log("He doesn't blink. The price remains a price.")],
						failGoto: "valve",
						end: true
					},
					{
						text: "Distract the eye that still works.",
						check: {
							skill: "sneak",
							dc: 58
						},
						effects: [
							{
								op: "item",
								id: "valve"
							},
							{
								op: "rep",
								faction: "unbound",
								n: -8
							},
							log("The valve leaves the sack. Pell will notice at dusk, and he will know the shape of the theft.")
						],
						failEffects: [{
							op: "rep",
							faction: "unbound",
							n: -5
						}, log("His bad eye is not the one he uses for thieves. The alley closes.")],
						failGoto: "caught",
						end: true
					},
					end("Another time.")
				]
			},
			caught: {
				speaker: "pell",
				text: "We're done talking prices. Tell Tobin his stray picks pockets.",
				replies: [end("Noted.")]
			}
		}
	},
	"varr-gate": {
		start: "start",
		nodes: {
			start: {
				speaker: "varr",
				text: "D-rank. The checkpoint is not a promenade. If you are here to look at armor, look at the ground instead. It is where your sort ends up.",
				replies: [
					{
						text: "The pump is handled. You'll have a report either way.",
						goto: "after",
						requires: [{
							flag: "pumpFate",
							is: "mend"
						}]
					},
					{
						text: "The pump is handled. You'll have a report either way.",
						goto: "after",
						requires: [{
							flag: "pumpFate",
							is: "speech"
						}]
					},
					{
						text: "The pump is handled. You'll have a report either way.",
						goto: "dirty",
						requires: [{
							flag: "pumpFate",
							is: "bleed"
						}]
					},
					{
						text: "The pump is handled. You'll have a report either way.",
						goto: "flood",
						requires: [{
							flag: "pumpFate",
							is: "flood"
						}]
					},
					{
						text: "I'm done being furniture.",
						goto: "force"
					},
					end("I'll go back to the bench.")
				]
			},
			after: {
				speaker: "varr",
				text: "Unauthorized maintenance is theft of civic function. The old man signed the bench. He pays for the signature. Hold still, keeper — this is a correction, not a murder. Murders require paperwork.",
				replies: [tobinScene("He nods at his squad. The prybar is already in his hand.")]
			},
			dirty: {
				speaker: "varr",
				text: "You bled the bypass. The water is brown and the report will be uglier than a beating. Still. The old man signed the bench.",
				replies: [tobinScene("The squad steps in.")]
			},
			flood: {
				speaker: "varr",
				text: "You taught the pump a new prayer and it answered by filling cellars. Impressive. Stupid. The keeper answers for his stray.",
				replies: [tobinScene("Varr is almost pleased.")]
			},
			force: {
				speaker: "varr",
				text: "Then we skip the lecture. The keeper still signed for you.",
				replies: [tobinScene("No one in the squad looks surprised.")]
			}
		}
	},
	"tobin-down": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "Tobin is on the plate, breathing like a bellows with a split seam. You can see the rib lattice trying to remember its old shape. Varr waits, curious, the way a man waits on a machine he does not believe in. Baseline is still there. It will not be, if you stand and argue.",
				replies: [
					{
						text: "Restore him completely. No scar. No memory of the blow.",
						check: {
							skill: "medicine",
							dc: 48
						},
						effects: [
							flag("tobinFate", "intact"),
							{
								op: "discipline",
								id: "biology"
							},
							{
								op: "heal",
								id: "tobin",
								n: 40
							},
							{
								op: "xp",
								n: 30
							},
							log("The ribs seat without a ridge. Tobin's eyes clear — and something cynical leaves with the pain. Biology opens."),
							journal$1("tobin", "What wholeness costs", "You erased the beating. Tobin is unscarred. He is also lighter, and less armed against the world.", "done")
						],
						failEffects: [
							flag("tobinFate", "distorted"),
							{
								op: "discipline",
								id: "biology"
							},
							{
								op: "heal",
								id: "tobin",
								n: 10
							},
							log("You force a shape the body does not quite own. He lives. The smile arrives a half-second late. Biology opens anyway, bloody.")
						],
						goto: "fight",
						failGoto: "fight"
					},
					{
						text: "Stop the bleeding. Leave the lesson in the bone.",
						check: {
							skill: "medicine",
							dc: 32
						},
						effects: [
							flag("tobinFate", "scarred"),
							{
								op: "discipline",
								id: "biology"
							},
							{
								op: "heal",
								id: "tobin",
								n: 22
							},
							{
								op: "xp",
								n: 25
							},
							log("You close the vessels and leave the bruise. He will walk. He will also remember the angle of the prybar. Biology opens.")
						],
						failEffects: [
							flag("tobinFate", "scarred"),
							{
								op: "discipline",
								id: "biology"
							},
							{
								op: "hurt",
								id: "player",
								n: 6
							},
							log("You stop the worst of it and take a backlash through the lens. He is scarred, alive, and furious on your behalf.")
						],
						goto: "fight",
						failGoto: "fight"
					},
					{
						text: "I won't touch a body I might misread.",
						effects: [flag("tobinFate", "scarred"), log("You bind him with cloth like anyone else. It is slower. It is also honest. He glares at Varr over your shoulder.")],
						goto: "fight"
					}
				]
			},
			fight: {
				speaker: "varr",
				text: "Cute. Now the plate. Show me the trick before I have you tagged as a weapon.",
				replies: [end("Read the armor.", [
					{
						op: "hostile",
						id: "varr",
						on: true
					},
					{
						op: "aggro",
						ids: [
							"varr",
							"en1",
							"en2"
						],
						on: true
					},
					{
						op: "combat",
						ids: [
							"varr",
							"en1",
							"en2"
						]
					},
					log("Structural engagement. His chest coupling is a single relationship. Audit it.")
				])]
			}
		}
	},
	"varr-down": {
		start: "start",
		nodes: {
			start: {
				speaker: "varr",
				text: "The plate is arguing with itself. I can hear it. Say your piece before the squad remembers they have rifles.",
				replies: [
					{
						text: "Crawl home. Tell RelSec their first design failed.",
						check: {
							skill: "speech",
							dc: 52
						},
						effects: [
							flag("varrFate", "stood"),
							flag("act1", true),
							{
								op: "xp",
								n: 50
							},
							{
								op: "rep",
								faction: "relsec",
								n: 8
							},
							{
								op: "rep",
								faction: "bureau",
								n: -6
							},
							{
								op: "item",
								id: "scrap"
							},
							journal$1("act1", "The checkpoint", "Varr left on his own feet, carrying a story RelSec will hate. The road south is open.", "done"),
							log("He goes. The squad looks at the place where his certainty was."),
							{
								op: "pin",
								text: "The Quarry and the Rust Districts are on the ledger."
							}
						],
						failGoto: "refuse",
						goto: "done"
					},
					{
						text: "Strip the coupling and let him crawl.",
						effects: [
							flag("varrFate", "spared"),
							flag("act1", true),
							{
								op: "xp",
								n: 45
							},
							{
								op: "rep",
								faction: "bureau",
								n: -8
							},
							{
								op: "rep",
								faction: "unbound",
								n: 6
							},
							{
								op: "item",
								id: "scrap"
							},
							journal$1("act1", "The checkpoint", "You unmade the armor and left the man. Travel is signed, more or less.", "done"),
							log("Iron silt sloughs off the cuirass. He will not wear that plate again.")
						],
						goto: "done"
					},
					{
						text: "Finish it.",
						effects: [
							flag("varrFate", "dead"),
							flag("act1", true),
							{
								op: "kill",
								id: "varr"
							},
							{
								op: "xp",
								n: 40
							},
							{
								op: "rep",
								faction: "bureau",
								n: -18
							},
							{
								op: "rep",
								faction: "unbound",
								n: 10
							},
							{
								op: "item",
								id: "scrap"
							},
							journal$1("act1", "The checkpoint", "Varr is dead. The Bureau will not file this as maintenance.", "done"),
							log("The squad does not rush you. They file the picture away.")
						],
						goto: "done"
					}
				]
			},
			refuse: {
				speaker: "varr",
				text: "RelSec doesn't take notes from patches.",
				replies: [{
					text: "Then crawl anyway.",
					effects: [
						flag("varrFate", "spared"),
						flag("act1", true),
						{
							op: "xp",
							n: 40
						},
						{
							op: "item",
							id: "scrap"
						},
						{
							op: "rep",
							faction: "bureau",
							n: -10
						},
						journal$1("act1", "The checkpoint", "Varr lives, humiliated. The south road is yours.", "done")
					],
					goto: "done"
				}]
			},
			done: {
				speaker: "narrator",
				text: "The checkpoint is a room with the argument taken out of it. Tobin, whatever you left of him, can walk. Beyond the stacks: the Quarry, where the Bureau cuts stone, and the Rust Districts, where the people who keep the machines have started keeping each other.",
				replies: [end("File it.", [log("The world map is on your bar.")])]
			}
		}
	},
	workers: {
		start: "start",
		nodes: {
			start: {
				speaker: "hask",
				text: "Don't stand under the boom unless you want the slab as a hat. Magistrate Kael is up-pit in layered kit. Ceramic on a clasp, steel on its own rivets, mesh on a weave he does not want you to read. None of them is the root of the others. He says that's the point.",
				replies: [
					{
						text: "The slab is down, and your people were not under it.",
						requires: [{
							flag: "quarryStone",
							is: "clear"
						}],
						goto: "after-clear"
					},
					{
						text: "The slab is down. Someone was still on the hook.",
						requires: [{
							flag: "quarryStone",
							is: "scarred"
						}],
						goto: "after-scar"
					},
					{
						text: "Get your people off the stone. I'll deal with him.",
						effects: [
							flag("workersClear", true),
							{
								op: "xp",
								n: 10
							},
							log("Hask whistles. The riggers drain off the marked slabs like water off a grate."),
							journal$1("quarry", "Geometry of the pit", "The riggers are clear. The crane is a tool again, not a crowd.", "open")
						],
						goto: "more"
					},
					{
						text: "The line has the bellows diagram.",
						goto: "diagram",
						requires: [{
							flag: "workersKnow",
							is: true
						}]
					},
					{
						text: "Tell me about the armor.",
						goto: "armor"
					},
					end("I'll watch my feet.")
				]
			},
			armor: {
				speaker: "lin",
				text: "Three arguments. The silk doesn't know the iron is there. The iron doesn't know the matrix is there. If you cut one, the other two keep their jobs. He brought a striker. The striker is a smaller version of the same insult.",
				replies: [{
					text: "Clear the stone anyway.",
					requires: [{ missing: "workersClear" }],
					effects: [flag("workersClear", true), log("They move. Nobody argues with a Patch who is already looking at the crane.")],
					goto: "more"
				}, end("That's enough.")]
			},
			more: {
				speaker: "hask",
				text: "Kael wants a conversation first. He likes those. He thinks conversations are where other people kneel. The crane's brake is a pawl, if you're the sort who reads pawls.",
				replies: [end("I'll go hear him.")]
			},
			"after-clear": {
				speaker: "hask",
				text: "Stone on the ground, and nobody wearing it. If the plate stair is signed and the squad is not sitting on the road mouth, that load can reach the Rust Districts. A hearth there is waiting on a parent. I am not the parent. The road is.",
				replies: [end("Then the road is the next seam.")]
			},
			"after-scar": {
				speaker: "hask",
				text: "You dropped a hill on a person who was still a person. The stone does not become innocent because the tenement needs it. If the stair is open, it will still move. Do not ask me to call that a mend.",
				replies: [end("I won't call it that.")]
			},
			diagram: {
				speaker: "lin",
				text: "Wren sent the lung. The pump is not the parent. The bellows is. If that reed stops, our stone can still move and the forge in Rust will still go thirsty, because quench is a child of the gallery. Tell that to anyone who calls a district a room.",
				replies: [end("Then the lung is in the pit too.")]
			}
		}
	},
	"kael-pre": {
		start: "start",
		nodes: {
			start: {
				speaker: "kael",
				text: "The Patch who unstitched a captain. RelSec dressed me in three materials that refuse to be one object. Find a seam. I will be changing the other two while you congratulate yourself.",
				replies: [
					{
						text: "Silk doesn't bear iron. You're wearing a costume and calling it a doctrine.",
						check: {
							skill: "history",
							dc: 62
						},
						effects: [
							flag("matrixKnown", true),
							{
								op: "xp",
								n: 15
							},
							log("Kael's mouth thins. The matrix flickers, embarrassed to have been named.")
						],
						goto: "duel",
						failGoto: "duel",
						failEffects: [log("He smiles as if you have recited a hymn incorrectly.")]
					},
					{
						text: "The riggers walk. You and I finish this.",
						requires: [{
							flag: "workersClear",
							is: true
						}],
						effects: [flag("duel", true), log("He waves the striker back. 'A private geometry, then.'")],
						goto: "fight"
					},
					{
						text: "Then show me the layers.",
						goto: "fight"
					},
					end("Not this minute.")
				]
			},
			duel: {
				speaker: "kael",
				text: "History. How provincial. Do you want the striker in the proof, or shall we keep this intimate?",
				replies: [{
					text: "Just you.",
					effects: [flag("duel", true)],
					goto: "fight"
				}, {
					text: "Bring whoever you trust. You shouldn't.",
					goto: "fight"
				}]
			},
			fight: {
				speaker: "kael",
				text: "Audit quickly. I do not remain a diagram.",
				replies: [end("Engage.", [
					{
						op: "hostile",
						id: "kael",
						on: true
					},
					{
						op: "aggro",
						ids: ["kael", "rel1"],
						on: true
					},
					{
						op: "combat",
						ids: ["kael", "rel1"]
					}
				])]
			}
		}
	},
	"kael-down": {
		start: "start",
		nodes: {
			start: {
				speaker: "kael",
				text: "Enough. The silk has divorced the iron. You understand the trick, which means the Citadel will already be building a worse one. There is a siphon under the spires. It drinks the lower city and calls the meal 'standardization.'",
				replies: [{
					text: "Live. Take that sentence to someone who prints things.",
					effects: [
						flag("kaelFate", "spared"),
						flag("knowsSiphon", true),
						flag("citadelOpen", true),
						{
							op: "xp",
							n: 70
						},
						{
							op: "rep",
							faction: "relsec",
							n: -8
						},
						{
							op: "item",
							id: "shard"
						},
						journal$1("siphon", "The siphon", "Kael, alive and bitter, named the engine under the Citadel: it drains the lower city to keep the spires lifted.", "open"),
						log("He leaves the pit without his doctrine. The shard of it stays in your pocket.")
					],
					goto: "end"
				}, {
					text: "The doctrine dies with the man.",
					effects: [
						flag("kaelFate", "dead"),
						flag("knowsSiphon", true),
						flag("citadelOpen", true),
						{
							op: "kill",
							id: "kael"
						},
						{
							op: "xp",
							n: 60
						},
						{
							op: "rep",
							faction: "relsec",
							n: -20
						},
						{
							op: "rep",
							faction: "unbound",
							n: 8
						},
						{
							op: "item",
							id: "shard"
						},
						journal$1("siphon", "The siphon", "You killed Kael. On his body, notes: Oakhaven's lifts drink the lower wards.", "open"),
						log("The pit is quieter by one magistrate.")
					],
					goto: "end"
				}]
			},
			end: {
				speaker: "narrator",
				text: "The Quarry keeps the mark of the boom and the argument. The High Citadel is no longer a rumor. If the Unbound in the Rust Districts have a say, they have not said it yet.",
				replies: [end("Onward.")]
			}
		}
	},
	ives: {
		start: "start",
		nodes: {
			start: {
				speaker: "ives",
				text: "Guildmaster Ives. If you're the Patch from the Sinks, sit before you pace a hole in my floor. We keep machines running for people who are not allowed to own them. The Bureau calls that theft. I call it Tuesday.",
				replies: [
					{
						text: "The tenement has a night. Stone is the parent.",
						requires: [{
							flag: "tenementWarm",
							is: true
						}, {
							flag: "stoneMoving",
							is: true
						}],
						goto: "stone-warm"
					},
					{
						text: "The hall is warm. The sleepers are not.",
						requires: [{
							flag: "guildWarm",
							is: true
						}, {
							flag: "tenementWarm",
							is: false
						}],
						goto: "stone-hall"
					},
					{
						text: "The fire is banked. The quarry is not feeding it.",
						requires: [{
							flag: "hearthHeld",
							is: true
						}, {
							flag: "stoneMoving",
							is: false
						}],
						goto: "stone-bank"
					},
					{
						text: "Kael is finished. He talked about a siphon.",
						goto: "siphon",
						requires: [{
							flag: "knowsSiphon",
							is: true
						}]
					},
					{
						text: "I'm looking for the people who maintain the maintainers.",
						goto: "welcome"
					},
					{
						text: "There's a woman in your back room who looks unfinished.",
						goto: "mara",
						requires: [{ missing: "maraFate" }]
					},
					{
						text: "The stone is moving and the forge still has no stock.",
						goto: "no-stock",
						requires: [
							{
								flag: "stoneMoving",
								is: true
							},
							{
								flag: "gearLive",
								is: false
							},
							{
								flag: "stockRefused",
								is: false
							}
						]
					},
					{
						text: "The stock was refused. The parents were not.",
						goto: "refused-stock",
						requires: [{
							flag: "stockRefused",
							is: true
						}]
					},
					{
						text: "The quarry line is saying the bellows is a lung.",
						goto: "lung-heard",
						requires: [{
							flag: "ivesHeardLung",
							is: true
						}]
					},
					{
						text: "Buy plate off the live stock. (18 scrip)",
						requires: [{
							flag: "gearLive",
							is: true
						}, { scrip: 18 }],
						effects: [
							{
								op: "scrip",
								n: -18
							},
							{
								op: "item",
								id: "scrap"
							},
							log("Ives hands you plate from a stock that had three parents. She does not name them like virtues.")
						],
						end: true
					},
					end("Just passing the stacks.")
				]
			},
			welcome: {
				speaker: "ives",
				text: "Then you found a room, not an army. Mara is in the side bay. The state wiped her and kept the skills that made her useful. I won't order you to touch a mind. I will tell you the Citadel's crucible is real, and that someone has to decide what a city is allowed to drink.",
				replies: [{
					text: "I'll speak to Mara before I decide anything about a city.",
					effects: [
						flag("guildBriefed", true),
						flag("citadelOpen", true),
						journal$1("guild", "The Unbound", "Ives will not call it a rebellion. She will call it maintenance. The Citadel is open to you.", "open")
					],
					end: true
				}, end("I'll think in the street.")]
			},
			siphon: {
				speaker: "ives",
				text: "Good. A magistrate's confession is still a confession. The crucible sits under the ranking floor. You can darken it, move it, expose it, or — if you are the sort of fool I fear you are — sit in it. None of those are innocent. Go. And talk to Mara if you have not. She is a person, not a tool you found.",
				replies: [end("The Citadel, then.", [
					flag("guildBriefed", true),
					flag("citadelOpen", true),
					{
						op: "xp",
						n: 20
					},
					journal$1("guild", "The Unbound", "Ives confirmed the siphon. The choice of what to do with it is yours, and she will live with it.", "open")
				])]
			},
			mara: {
				speaker: "ives",
				text: "She remembers a procedure number and the taste of copper. She does not remember why she flinches at lullabies. If you 'fix' her, do it where I can hear the reason.",
				replies: [end("I'll hear her first.")]
			},
			"stone-warm": {
				speaker: "ives",
				text: "Then the pit, the stair, and this room are one machine. Do not file it as a kindness. File it as a parent. The crucible under the spires invoices populations that stay warm. You just gave it a better meal, and you also gave my people a night. Both sentences are true.",
				replies: [end("Both stay in the ledger.")]
			},
			"stone-hall": {
				speaker: "ives",
				text: "A hall without sleepers is a workshop counting down. The benches will lie and say the district is fine. It is not. Throw the flue back, or tell me you meant the cold.",
				replies: [end("I know which flue I threw.")]
			},
			"stone-bank": {
				speaker: "ives",
				text: "Your weight is not a quarry. When you leave, ask what the bed is hanging on. If the answer is only you, the night ends when you do.",
				replies: [end("Then it needs a parent that is not my shoulder.")]
			},
			"no-stock": {
				speaker: "ives",
				text: "The forge is not a wish. It wants sound ore, quench from the gallery, and a fire that has a parent. Miss one and I have a bench, not a wage. Do not ask me to call the missing one a moral.",
				replies: [end("I'll find which parent is down.")]
			},
			"refused-stock": {
				speaker: "ives",
				text: "You cut the child and left the parents standing. The hall gets no new rifles from that stock. The pit does not become kind because the stock is dark. Tell me you meant the child.",
				replies: [end("I meant the child.")]
			},
			"lung-heard": {
				speaker: "ives",
				text: "Then the hall's heat and the ward's water are not two cities. If that lung stops, do not bring me a story about a local fault. Bring me the reed.",
				replies: [end("That's the diagram they have.")]
			}
		}
	},
	mara: {
		start: "start",
		nodes: {
			start: {
				speaker: "mara",
				text: "If Ives sent you, say so. If the Bureau sent you, leave the way the steam does. I am Mara. I have a number where a childhood should be. People keep offering to return things I cannot inspect.",
				replies: [
					{
						text: "What did the procedure leave you for protection?",
						check: {
							skill: "psychology",
							dc: 42
						},
						goto: "protect",
						failGoto: "flat",
						effects: [{
							op: "xp",
							n: 10
						}],
						failEffects: [log("She watches your mouth, not your eyes. The question does not land.")]
					},
					{
						text: "I can see the cut. I want to talk about putting memory back.",
						goto: "offer"
					},
					end("I won't touch what I haven't heard.")
				]
			},
			flat: {
				speaker: "mara",
				text: "Try a smaller question. I am not a pump.",
				replies: [{
					text: "All right. The cut, then.",
					goto: "offer"
				}, end("Another time.")]
			},
			protect: {
				speaker: "mara",
				text: "It left me a flinch that knows badges. A cadence for service doors. Nights I don't enjoy and don't waste. If those are symptoms, they are also how I am still in this room and not in a drawer.",
				replies: [{
					text: "Then the choice should be said plainly.",
					goto: "offer"
				}]
			},
			offer: {
				speaker: "narrator",
				text: "The lattice is visible if you are willing to call a person a system. Restoring the historical baseline would sand the trauma flat. She would suffer less. She might also lose the flinch, the cadence, and the particular hardness that keeps her alive. Leaving it is not neutral either. You would be choosing her pain because it is useful.",
				replies: [
					{
						text: "Restore the baseline. Take the pain and what it taught.",
						check: {
							skill: "psychology",
							dc: 46
						},
						effects: [
							flag("maraFate", "restored"),
							{
								op: "discipline",
								id: "mind"
							},
							{
								op: "xp",
								n: 40
							},
							{
								op: "rep",
								faction: "unbound",
								n: 4
							},
							log("Memory returns like warm water. The flinch does not. She laughs, startled by it, and looks suddenly young. Mind opens. The service cadence is gone with the scar."),
							journal$1("mara", "Mara's baseline", "You restored her. She is lighter, and she no longer remembers the door-cadence that would have opened the Citadel shaft.", "done")
						],
						failEffects: [flag("maraFate", "untouched"), log("The lattice squirms out of your grip. You stop before you invent a stranger. She is pale, and still herself.")],
						goto: "after-restored",
						failGoto: "start"
					},
					{
						text: "I see the cut. I won't take the scar tissue. It grew into you.",
						effects: [
							flag("maraFate", "intact"),
							{
								op: "discipline",
								id: "mind"
							},
							{
								op: "xp",
								n: 35
							},
							log("You close nothing. She exhales as if a hand left her throat. The cadence stays. So do the nights. Mind opens — as a refusal."),
							journal$1("mara", "Mara's baseline", "You left the trauma intact. She keeps the shaft cadence and the cost of it.", "done")
						],
						goto: "after-intact"
					},
					end("I don't have the right. Not today.", [flag("maraFate", "untouched"), log("She nods, once, like a lock seating.")])
				]
			},
			"after-restored": {
				speaker: "mara",
				text: "I can remember a kitchen. I can't remember the door-song. Don't look so proud and so sorry at the same time. If you're walking at the Citadel, I'll come. I will be bad at ambushes and good at not wanting them.",
				replies: [end("Come on.", [{
					op: "recruit",
					id: "mara"
				}, log("Mara joins you. She hums, then stops, embarrassed by happiness.")]), end("Stay. Learn the kitchen again.")]
			},
			"after-intact": {
				speaker: "mara",
				text: "Then we understand each other. I still have the song they use on the shaft door. It is not a gift. It is a tool with blood on the handle. I'll walk with you if you can stand the nights.",
				replies: [end("Bring the song. And yourself.", [{
					op: "recruit",
					id: "mara"
				}, log("Mara falls in. She does not hum.")]), end("Keep the song here, where it's safer.")]
			}
		}
	},
	sera: {
		start: "start",
		nodes: {
			start: {
				speaker: "sera",
				text: "You will mend this city until nothing in it is allowed to end. Endings are how iron becomes soil. The Ash is not a bomb. It is a permission.",
				replies: [
					{
						text: "Name one thing that should stay broken.",
						effects: [
							flag("ashCounsel", true),
							{
								op: "rep",
								faction: "ash",
								n: 8
							},
							log("She says: the crucible. Not the people. The appetite."),
							journal$1("ash", "Ash counsel", "Sera says the crucible should stay broken. She did not ask you to break the people attached to it.", "open")
						],
						goto: "name"
					},
					{
						text: "A city that cannot repair its water is just a slower death.",
						check: {
							skill: "history",
							dc: 50
						},
						effects: [{
							op: "xp",
							n: 10
						}, log("She considers the Sinks, and does not sneer. 'Water, then. Not thrones.'")],
						end: true,
						failEffects: [log("She has heard the Bureau use longer words for the same idea.")]
					},
					{
						text: "The forge is making gear.",
						goto: "gear",
						requires: [{
							flag: "gearLive",
							is: true
						}]
					},
					{
						text: "The stock was refused.",
						goto: "refused",
						requires: [{
							flag: "stockRefused",
							is: true
						}]
					},
					{
						text: "Come and watch what I cut.",
						goto: "join",
						requires: [{
							flag: "ashCounsel",
							is: true
						}, { noCompanion: true }]
					},
					{
						text: "Stay with the ash. I'll go alone.",
						requires: [{ companion: "sera" }],
						effects: [{
							op: "dismiss",
							id: "sera"
						}, log("Sera stays. She says the watching can be done from here.")],
						end: true
					},
					end("I didn't come to be preached at.")
				]
			},
			name: {
				speaker: "sera",
				text: "If you darken the siphon, do not replace it with your own face. A hole is honest. A new god in work boots is how the Bureau started, probably, on a Tuesday.",
				replies: [end("I'll remember the warning.")]
			},
			gear: {
				speaker: "sera",
				text: "Three parents. None of them is a virtue. If the hall turns that stock into rifles, you do not get to be surprised. You can still refuse the child and leave the parents standing.",
				replies: [end("I know which seam I meant.", [flag("seraSawGear", true)])]
			},
			refused: {
				speaker: "sera",
				text: "You cut the child and left the parents. That is a choice. A dead quarry would have been a different choice. I will not thank you. I will also not call the rifles that did not get made a tragedy.",
				replies: [end("That's the choice.")]
			},
			join: {
				speaker: "sera",
				text: "I will walk. I will not call a cut a kindness, and I will not leave because we disagree. If you take a throne, I will be afraid and I will still be there to say so.",
				replies: [end("Walk.", [
					{
						op: "recruit",
						id: "sera"
					},
					log("Sera falls in. She does not promise to agree."),
					journal$1("sera-road", "Sera on the road", "She came to watch the cuts. Disagreement is not a departure.", "done")
				]), end("Not yet.")]
			}
		}
	},
	"shaft-door": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "A maintenance door in the Citadel's throat. The sentry on the far side is listening for a cadence, not a speech. The lock is a relationship between a pin, a spring, and a habit.",
				replies: [
					{
						text: "Use Mara's service cadence.",
						requires: [{
							flag: "maraFate",
							is: "intact"
						}],
						check: {
							skill: "lockwork",
							dc: 34
						},
						effects: [
							flag("shaftOpen", true),
							{
								op: "hostile",
								id: "sentry",
								on: false
							},
							log("The pin turns. Sentry Quill hears a tech's song and studies the wall.")
						],
						failEffects: [log("The cadence slips. Quill's rifle lifts.")],
						end: true,
						failGoto: "force"
					},
					{
						text: "Pick it like any other arrogant lock.",
						check: {
							skill: "lockwork",
							dc: 58
						},
						effects: [
							flag("shaftOpen", true),
							{
								op: "xp",
								n: 15
							},
							log("The lock gives. You are through before the sentry finishes deciding you exist.")
						],
						failEffects: [log("The pick sings. That was the wrong song.")],
						end: true,
						failGoto: "force"
					},
					{
						text: "The hinge is tired. Persuade the metal.",
						check: {
							skill: "engineering",
							dc: 52
						},
						effects: [flag("shaftOpen", true), log("You ease the hinge's load. The door admits it was never a wall.")],
						end: true,
						failGoto: "force",
						failEffects: [log("The hinge screams in a small metal voice.")]
					},
					end("Leave it shut.")
				]
			},
			force: {
				speaker: "sentry",
				text: "That's not a cadence. That's a Patch. Down on the plate.",
				replies: [end("Fine.", [{
					op: "aggro",
					ids: ["sentry"],
					on: true
				}, {
					op: "combat",
					ids: ["sentry"]
				}])]
			}
		}
	},
	sentry: {
		start: "start",
		nodes: {
			start: {
				speaker: "sentry",
				text: "Maintenance window is dawn. You are not dawn.",
				replies: [
					{
						text: "I'm on the crucible job. Ask Vane if you like stairs.",
						check: {
							skill: "speech",
							dc: 60
						},
						effects: [{
							op: "hostile",
							id: "sentry",
							on: false
						}, log("He hates the sentence and lets it pass.")],
						end: true,
						failGoto: "fight"
					},
					{
						text: "Then we do this your way.",
						goto: "fight"
					},
					end("Dawn it is.")
				]
			},
			fight: {
				speaker: "sentry",
				text: "Squad call.",
				replies: [end("Engage.", [{
					op: "aggro",
					ids: ["sentry"],
					on: true
				}, {
					op: "combat",
					ids: ["sentry"]
				}])]
			}
		}
	},
	vane: {
		start: "start",
		nodes: {
			start: {
				speaker: "vane",
				text: "Evaluator Vane. You are the zero that learned to read. The crucible is not a villain. It is how the spires stay in the air and how the lower wards stay in their rank. Standardization is a kindness if you have never had a standard.",
				replies: [
					{
						text: "The tenement kept its heat. The lower city still has a night.",
						requires: [{
							flag: "tenementWarm",
							is: true
						}, {
							flag: "stoneMoving",
							is: true
						}],
						goto: "labor"
					},
					{
						text: "The road is feeding your stores.",
						goto: "fed",
						requires: [{
							flag: "citadelSupplied",
							is: true
						}]
					},
					{
						text: "Your plate is unfed.",
						goto: "toll",
						requires: [{
							flag: "guardToll",
							is: true
						}]
					},
					{
						text: "The guild is warm. The sleepers left the flue.",
						requires: [{
							flag: "guildWarm",
							is: true
						}, {
							flag: "tenementWarm",
							is: false
						}],
						goto: "labor-thin"
					},
					{
						text: "It's a siphon. Kindness doesn't invoice a person's pulse.",
						goto: "choice",
						requires: [{
							flag: "knowsSiphon",
							is: true
						}]
					},
					{
						text: "Let me look at the engine before I borrow your words.",
						goto: "look"
					},
					{
						text: "I've already touched it.",
						goto: "already",
						requires: [{
							flag: "citadelFate",
							is: "sever"
						}]
					},
					{
						text: "I've already touched it.",
						goto: "already-r",
						requires: [{
							flag: "citadelFate",
							is: "redirect"
						}]
					},
					{
						text: "I've already touched it.",
						goto: "already-s",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					end("I'm still walking the floor.")
				]
			},
			look: {
				speaker: "vane",
				text: "Look, then. The conduits feed the siphon. The siphon feeds the lifts and the rank engine. If you are a child you will break the brightest part. If you are a tyrant you will sit in the engine and call it rescue.",
				replies: [{
					text: "And if I tell the city, in the ceremony, with your pins on?",
					goto: "choice"
				}]
			},
			labor: {
				speaker: "vane",
				text: "Then the siphon still has a meal. A warm tenement is a pulse the rank engine can invoice. Do not confuse a repaired hearth with a city that has stopped being eaten.",
				replies: [{
					text: "Then show me the engine.",
					goto: "look"
				}]
			},
			fed: {
				speaker: "vane",
				text: "Stone from the pit, across a signed stair, into my stores. You keep treating districts like rooms. The plate ate because the quarry allowed it. That is not gratitude. That is a parent.",
				replies: [{
					text: "Then show me the engine.",
					goto: "look"
				}]
			},
			toll: {
				speaker: "vane",
				text: "Unfed plate prices a door. Do not call it cruelty and do not call it policy. The cargo did not arrive, or someone held it. The guards are a child of that absence.",
				replies: [{
					text: "Then show me the engine.",
					goto: "look"
				}]
			},
			"labor-thin": {
				speaker: "vane",
				text: "A hall without sleepers is a workshop counting down. The crucible prefers populations that stay. You have already begun to thin its meal. That is not a victory. It is a smaller invoice.",
				replies: [{
					text: "Then show me the engine.",
					goto: "look"
				}]
			},
			choice: {
				speaker: "vane",
				text: "The ranking ceremony is in an hour. I can put your reading on the horns, or I can have the floor cleaned. Choose in language, or choose on the machine. I will not pretend they are different acts.",
				replies: [
					{
						text: "Put it on the horns. Let them hear what the lifts eat.",
						check: {
							skill: "speech",
							dc: 58
						},
						effects: [
							flag("citadelFate", "expose"),
							flag("spireOpen", true),
							{
								op: "xp",
								n: 80
							},
							{
								op: "rep",
								faction: "bureau",
								n: -12
							},
							{
								op: "rep",
								faction: "unbound",
								n: 14
							},
							{
								op: "discipline",
								id: "causal"
							},
							journal$1("siphon", "The siphon", "You exposed the crucible at the ceremony. The city heard. Causal sight opens. The Void Spire is no longer theoretical.", "done"),
							log("The horns carry the diagram. Somewhere a clerk drops a stamp. Causality opens.")
						],
						end: true,
						failGoto: "fail",
						failEffects: [log("The ceremony does not take your voice. Vane's pins were never going to.")]
					},
					{
						text: "History, then. Read the old name of the engine into the record.",
						check: {
							skill: "history",
							dc: 60
						},
						effects: [
							flag("citadelFate", "expose"),
							flag("spireOpen", true),
							{
								op: "xp",
								n: 80
							},
							{
								op: "rep",
								faction: "engineers",
								n: 10
							},
							{
								op: "rep",
								faction: "unbound",
								n: 8
							},
							{
								op: "discipline",
								id: "causal"
							},
							journal$1("siphon", "The siphon", "You named the engine by its older name. The record flinched. The Spire is waiting.", "done"),
							log("An older word hits the horns and the rank pins click like insects.")
						],
						end: true,
						failGoto: "fail"
					},
					end("I'll answer on the machine itself.")
				]
			},
			fail: {
				speaker: "vane",
				text: "Then the floor will be cleaned.",
				replies: [end("No.", [{
					op: "aggro",
					ids: ["guard1", "guard2"],
					on: true
				}, {
					op: "combat",
					ids: ["guard1", "guard2"]
				}])]
			},
			already: {
				speaker: "vane",
				text: "The lifts are failing and you want a conversation. Very well. You have made a dark city. Do not be shocked when it grows teeth. The Spire under the old works has started to move. Someone with no baseline is signing orders in RelSec's ruin.",
				replies: [end("Then that's next.", [flag("spireOpen", true), {
					op: "discipline",
					id: "causal"
				}])]
			},
			"already-r": {
				speaker: "vane",
				text: "You fed the Sinks and starved the balconies. The Unbound will kiss you until the pressure drops. The Spire is awake. Go look at what a system does when its author leaves.",
				replies: [end("I'm going.", [flag("spireOpen", true), {
					op: "discipline",
					id: "causal"
				}])]
			},
			"already-s": {
				speaker: "vane",
				text: "You sat in the engine. Do not ask me to bless the crown because it was forged in a maintenance bay. The Spire will test whether you are a baseline or a thief.",
				replies: [end("Let it test.", [flag("spireOpen", true), {
					op: "discipline",
					id: "causal"
				}])]
			}
		}
	},
	"sovereign-pre": {
		start: "start",
		nodes: {
			start: {
				speaker: "sovereign",
				text: "You kept a ledger of other people's parts. I burned my baseline. There is no correct Silas-shaped answer for me, and you will hate that more than the claws. Mend me. I dare you. The graph will not be where you left it.",
				replies: [
					{
						text: "I already sat in the engine.",
						goto: "sat",
						requires: [{
							flag: "citadelFate",
							is: "seize"
						}]
					},
					{
						text: "Then I'll read you while you move.",
						effects: [
							{
								op: "hostile",
								id: "sovereign",
								on: true
							},
							{
								op: "aggro",
								ids: ["sovereign", "echo"],
								on: true
							},
							{
								op: "combat",
								ids: ["sovereign", "echo"]
							},
							{
								op: "discipline",
								id: "continuity"
							},
							log("Continuity opens. The live seam will move. Audit every round. Decoys bite back.")
						],
						end: true
					},
					end("Not while the graph is a lie. I'll circle.")
				]
			},
			sat: {
				speaker: "sovereign",
				text: "You already wrote a baseline and called it maintenance. Do not pretend mine is the first theft. The graph will still move. A throne does not make a reading true.",
				replies: [{
					text: "Then I'll read you while you move.",
					effects: [
						{
							op: "hostile",
							id: "sovereign",
							on: true
						},
						{
							op: "aggro",
							ids: ["sovereign", "echo"],
							on: true
						},
						{
							op: "combat",
							ids: ["sovereign", "echo"]
						},
						{
							op: "discipline",
							id: "continuity"
						},
						log("Continuity opens. The live seam will move. Audit every round. Decoys bite back.")
					],
					end: true
				}, end("Not while the graph is a lie. I'll circle.")]
			}
		}
	},
	"sovereign-down": {
		start: "start",
		nodes: { start: {
			speaker: "sovereign",
			text: "There. You can break a thing that refuses to be known. You still have not answered the only question the city cares about. It is full of holes. Will you write the shape — your baseline, over the city — or will you leave the holes and let them keep their names?",
			replies: [{
				text: "Write the shape.",
				effects: [
					{
						op: "epilogue",
						ending: "impose"
					},
					{
						op: "xp",
						n: 100
					},
					flag("ending", "impose")
				],
				end: true
			}, {
				text: "Leave the holes.",
				effects: [
					{
						op: "epilogue",
						ending: "release"
					},
					{
						op: "xp",
						n: 100
					},
					flag("ending", "release")
				],
				end: true
			}]
		} }
	},
	"enc-patrol": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "A Bureau pair steps out of the stack-shadow. Their lenses are the cheap kind. One of them has your description and is trying not to look proud of it.",
				replies: [
					{
						text: "Pay the toll. (15 scrip)",
						requires: [{ scrip: 15 }],
						effects: [
							{
								op: "scrip",
								n: -15
							},
							{
								op: "rep",
								faction: "bureau",
								n: 2
							},
							log("The chit is ugly and sufficient."),
							{ op: "arrive" }
						],
						end: true
					},
					{
						text: "Wrong district. Your sergeant is already angry.",
						check: {
							skill: "speech",
							dc: 52
						},
						effects: [
							{
								op: "xp",
								n: 12
							},
							log("They peel off toward a sergeant who will not thank them."),
							{ op: "arrive" }
						],
						failEffects: [log("The cheap lens flares. They want the road.")],
						end: true,
						failGoto: "fight"
					},
					{
						text: "Be steam.",
						check: {
							skill: "sneak",
							dc: 55
						},
						effects: [log("You are a flange. They walk past a flange."), { op: "arrive" }],
						failGoto: "fight",
						end: true
					},
					{
						text: "Break them.",
						goto: "fight"
					}
				]
			},
			fight: {
				speaker: "narrator",
				text: "The road widens into a fight.",
				replies: [end("Take the ground.", [
					{
						op: "goto",
						map: "road",
						x: 3,
						y: 4
					},
					{
						op: "spawn",
						template: "enforcer",
						id: "roadA",
						x: 7,
						y: 3
					},
					{
						op: "spawn",
						template: "enforcer",
						id: "roadB",
						x: 8,
						y: 4
					},
					{
						op: "combat",
						ids: ["roadA", "roadB"]
					}
				])]
			}
		}
	},
	"enc-refugees": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "A handcart of people from a darkened stair. A child holds a pressure gauge like a saint's token. They are not asking for a doctrine. They are asking whether the next ward has water.",
			replies: [
				{
					text: "Give a bandage and the truth you have.",
					requires: [{ item: "bandage" }],
					effects: [
						{
							op: "take",
							id: "bandage",
							n: 1
						},
						flag("refugeeMet", true),
						flag("knowsSiphon", true),
						{
							op: "rep",
							faction: "unbound",
							n: 6
						},
						log("They tell you the spires drink in pulses. You can feel it in the fillings if you live low enough."),
						{ op: "arrive" }
					],
					end: true
				},
				{
					text: "Point them at the Sinks and keep walking.",
					effects: [
						flag("refugeeMet", true),
						log("You give a direction. It is not nothing. It is not a bandage."),
						{ op: "arrive" }
					],
					end: true
				},
				end("Say nothing. Arrive anyway.", [{ op: "arrive" }])
			]
		} }
	},
	"enc-trader": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "A licensed tinker with an unlicensed smile. Phials, bandages, and a coat that used to be a door. The stacks hiss overhead like a audience.",
			replies: [
				{
					text: "Phial, 12 scrip.",
					requires: [{ scrip: 12 }],
					effects: [
						{
							op: "scrip",
							n: -12
						},
						{
							op: "item",
							id: "phial"
						},
						log("You pocket the phial."),
						{ op: "arrive" }
					],
					end: true
				},
				{
					text: "Bandage, 8 scrip.",
					requires: [{ scrip: 8 }],
					effects: [
						{
							op: "scrip",
							n: -8
						},
						{
							op: "item",
							id: "bandage"
						},
						{ op: "arrive" }
					],
					end: true
				},
				{
					text: "Haggle the coat-of-plate down. (20)",
					requires: [{ scrip: 20 }],
					check: {
						skill: "barter",
						dc: 48
					},
					effects: [
						{
							op: "scrip",
							n: -20
						},
						{
							op: "item",
							id: "coat"
						},
						log("The plate-coat settles on your shoulders like a decision."),
						{ op: "arrive" }
					],
					failEffects: [
						{
							op: "scrip",
							n: -28
						},
						{
							op: "item",
							id: "coat"
						},
						log("You pay the proud price. The coat is still good."),
						{ op: "arrive" }
					],
					end: true
				},
				end("No trade.", [{ op: "arrive" }])
			]
		} }
	},
	"enc-auto": {
		start: "start",
		nodes: {
			start: {
				speaker: "narrator",
				text: "An automaton is walking the road with no work order. Its eye is a patient amber. The tool mount twitches toward anything that looks like a bolt, including knees.",
				replies: [
					{
						text: "Talk to the coupling before it talks to you.",
						check: {
							skill: "mechanics",
							dc: 50
						},
						effects: [
							{
								op: "xp",
								n: 18
							},
							log("You unseat the work-order latch with a phrase older than the Bureau. It sits down in the road like a tired horse."),
							{ op: "arrive" }
						],
						failGoto: "fight",
						end: true,
						failEffects: [log("It does not recognize your accent.")]
					},
					{
						text: "Take it apart on purpose.",
						goto: "fight"
					},
					end("Give it the road.", [{ op: "arrive" }, log("You take the ditch. It takes the crown of the lane.")])
				]
			},
			fight: {
				speaker: "narrator",
				text: "The mount locks.",
				replies: [end("Engage.", [
					{
						op: "goto",
						map: "road",
						x: 3,
						y: 4
					},
					{
						op: "spawn",
						template: "automaton",
						id: "roadM",
						x: 7,
						y: 3
					},
					{
						op: "combat",
						ids: ["roadM"]
					}
				])]
			}
		}
	},
	"road-after": {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "The road remembers the fight only as scattered fasteners. Your destination is still ahead, and the stacks have not paused for you.",
			replies: [end("Continue.", [{ op: "arrive" }])]
		} }
	},
	workbench: {
		start: "start",
		nodes: { start: {
			speaker: "narrator",
			text: "The bench smells of solvent and honest failure. You can sleep in the lee of it, or you can make something ruder than a prybar.",
			replies: [
				{
					text: "Rest.",
					effects: [{ op: "rest" }, log("You sleep like a tool put back in the drawer. It helps.")],
					end: true
				},
				{
					text: "Turn plate scrap into a rivet gun.",
					requires: [{ item: "scrap" }],
					check: {
						skill: "mechanics",
						dc: 42
					},
					effects: [
						{
							op: "take",
							id: "scrap",
							n: 1
						},
						{
							op: "item",
							id: "rivet"
						},
						log("The gun chambers on the second try. It will do.")
					],
					failEffects: [log("The scrap sulks. Your hands are not there yet.")],
					end: true
				},
				end("Leave the bench be.")
			]
		} }
	}
};
function tobinScene(lead) {
	return {
		text: "Step between them.",
		effects: [
			{
				op: "hurt",
				id: "tobin",
				n: 18
			},
			log(lead + " Tobin goes down. The lattice is still readable."),
			flag("tobinDown", true)
		],
		goto: "ignored"
	};
}
for (const key of [
	"after",
	"dirty",
	"flood",
	"force"
]) {
	const node = CONVOS["varr-gate"].nodes[key];
	node.replies = [{
		text: "Get away from him.",
		effects: [{
			op: "hurt",
			id: "tobin",
			n: 16
		}, log("The prybar finds Tobin's ribs. He drops. You can still see the shape he is supposed to be.")],
		goto: "handoff"
	}];
}
CONVOS["varr-gate"].nodes.handoff = {
	speaker: "narrator",
	text: "There is time for one decision before Varr's curiosity becomes a squad action.",
	replies: [{
		text: "Open the ledger on Tobin.",
		jump: {
			convo: "tobin-down",
			node: "start"
		}
	}]
};
CONVOS.wren = {
	start: "start",
	nodes: {
		start: {
			speaker: "wren",
			text: "Don't mind the soot. I'm Wren. I keep the lines the Bureau forgets, which is most of them. You're the zero they spat out. Tobin is already telling that story like it was his idea.",
			replies: [
				{
					text: "The checkpoint.",
					goto: "checkpoint",
					requires: [{ history: {
						ask: "now",
						id: "varr",
						fate: "stood-down"
					} }]
				},
				{
					text: "The checkpoint.",
					goto: "checkpoint-open",
					requires: [{ history: {
						ask: "now",
						id: "varr",
						fate: "broken-open"
					} }]
				},
				{
					text: "The checkpoint.",
					goto: "checkpoint-gone",
					requires: [{ history: {
						ask: "now",
						id: "varr",
						fate: "dead"
					} }]
				},
				{
					text: "The checkpoint.",
					goto: "checkpoint-left",
					requires: [{ history: {
						ask: "now",
						id: "varr",
						fate: "escaped"
					} }]
				},
				{
					text: "The pump is dead. What actually stopped it?",
					goto: "lock"
				},
				{
					text: "I need a way past the checkpoint that isn't a speech.",
					goto: "crawl",
					requires: [{ missing: "knowsCrawl" }]
				},
				{
					text: "Seat this valve. I don't trust my own hands.",
					goto: "hands",
					requires: [{ item: "valve" }, { missing: "pumpFate" }]
				},
				{
					text: "The door by the sludge won't move.",
					goto: "dry-door",
					requires: [{
						flag: "sumpOpen",
						is: false
					}]
				},
				{
					text: "The gallery took pressure.",
					goto: "gallery",
					requires: [{
						flag: "sumpOpen",
						is: true
					}, { missing: "jackHeld" }]
				},
				{
					text: "The crown.",
					goto: "gallery-held",
					requires: [{
						flag: "jackHeld",
						is: true
					}]
				},
				{
					text: "The bellows is the pump's lung. Tell the line.",
					goto: "lung",
					requires: [{
						flag: "reedRead",
						is: true
					}, { missing: "toldWren" }]
				},
				{
					text: "Walk the lines with me.",
					goto: "join",
					requires: [{
						flag: "act1",
						is: true
					}, { noCompanion: true }]
				},
				{
					text: "Stay on the lines. I'll go alone.",
					requires: [{ companion: "wren" }],
					effects: [{
						op: "dismiss",
						id: "wren"
					}, log("Wren stays with the lines she already keeps.")],
					end: true
				},
				{
					text: "Walk the pit with me. The diagram can wait.",
					requires: [{ companion: "wren" }, { missing: "wrenWalked" }],
					effects: [flag("wrenWalked", true), log("Wren comes off the bench. The pit is the same city, walked.")],
					end: true
				},
				end("Back to the iron.")
			]
		},
		lock: {
			speaker: "wren",
			text: "The valve lost its seat. There is also a Bureau lockout welded on the feed, under the gauge glass. It is not broken. It is obedient. Cut it and the water moves, and the checkpoint will call that sabotage. Mend the valve if you have a true one. Open the bypass if you can live with brown water. Or hand me the part and I will do the honest version.",
			replies: [end("I'll read the lockout.", [
				flag("knowsLockout", true),
				log("Wren names the Bureau lockout. It will show on the pump's graph."),
				journal$1("pump", "The broken pump", "The valve is unseated, and a Bureau lockout is holding the feed shut. Mend it, bleed the bypass, cut the lockout, buy a true valve, or give the work to Wren.")
			])]
		},
		crawl: {
			speaker: "wren",
			text: "North of the sludge, past Pell, a grate still remembers it was a crawl. Drop through and you come up on the blind side of Varr's squad, near the stack road. Do not start a lecture down there.",
			replies: [end("I'll remember the grate.", [flag("knowsCrawl", true), log("A grate north of the sludge drops behind the checkpoint.")])]
		},
		hands: {
			speaker: "wren",
			text: "Give it here. I have seated worse, for less thanks.",
			replies: [end("It's yours.", [
				{
					op: "take",
					id: "valve",
					n: 1
				},
				flag("pumpFate", "wren"),
				flag("actReady", true),
				{
					op: "xp",
					n: 40
				},
				{
					op: "rep",
					faction: "unbound",
					n: 6
				},
				log("Wren seats the valve. The pump takes a true breath that is not yours."),
				journal$1("pump", "The broken pump", "Wren seated the valve. The water is clean. The credit is not yours, and that is the point.", "done")
			]), end("I'll keep it.")]
		},
		checkpoint: {
			speaker: "wren",
			text: "You let Varr walk. The checkpoint is still his. He unbarred the plate stair. I can't spend that. It is just what the room is now.",
			replies: [end("That's the room.")]
		},
		"checkpoint-open": {
			speaker: "wren",
			text: "Varr came apart and stayed. The checkpoint is still his. The stair is unbarred. The plate isn't.",
			replies: [end("That's the room.")]
		},
		"checkpoint-gone": {
			speaker: "wren",
			text: "Varr is dead. The checkpoint is a vacancy. That is a fact, not a verdict. The stair stayed barred. Moll and Hess moved to the road.",
			replies: [end("That's the room.")]
		},
		"checkpoint-left": {
			speaker: "wren",
			text: "Varr left the plate. Nobody inherited it. The stair stayed barred.",
			replies: [end("That's the room.")]
		},
		"dry-door": {
			speaker: "wren",
			text: "That's the gallery head. It drinks from the pump, not from a key. Seat the valve, or throw the bypass toward the sump, and the door stops being a wall. The crown inside is a different problem. You don't mend a person. You hold the load.",
			replies: [end("I'll read the pump.")]
		},
		gallery: {
			speaker: "wren",
			text: "The door took pressure. The footing under that crown is still failing. Brace it if you want the room to stay a room. Mend the footing if you want it to be itself again.",
			replies: [end("I'll go back in.")]
		},
		"gallery-held": {
			speaker: "wren",
			text: "The gallery is open, and the crown isn't coming down. The alley can use the room. That wasn't a fight. That was a parent.",
			replies: [end("That's the room.")]
		},
		lung: {
			speaker: "wren",
			text: "I know the shape. The reed seats the lung, the lung seats the pump, the pump seats the ward. I will carry that to the pit. They have been treating the quarry like a different city. It is a later room of this one.",
			replies: [end("Carry it.", [
				flag("toldWren", true),
				{
					op: "xp",
					n: 16
				},
				log("Wren takes the diagram. The quarry line will be able to ask what the lung is parent to."),
				journal$1("lung-line", "The lung, carried", "Wren has the bellows diagram. The quarry is not a different machine. It is downstream, and upstream, of the same city.", "open")
			])]
		},
		join: {
			speaker: "wren",
			text: "The lines don't end at the Sinks. If you're going where the plate is thicker, I can name what the pipe is parent to. I won't pretend that naming is the same as fixing.",
			replies: [end("Come on.", [
				{
					op: "recruit",
					id: "wren"
				},
				log("Wren slings a coil of line and matches your step."),
				journal$1("wren-road", "Wren on the road", "She left the bench. The diagram is still hers to carry or to withhold.", "done")
			]), end("Not yet.")]
		}
	}
};
CONVOS.lark = {
	start: "start",
	nodes: {
		start: {
			speaker: "lark",
			text: "Stack road. If the lamps are up, the carts use the high walk. If the glass is out, the carts still have a south cut. I run both. I don't file either as a favor.",
			replies: [
				{
					text: "Show me the south cut.",
					effects: [flag("roadBypass", true), log("Lark points at the lower walk. The lamps are not a parent of that path.")],
					end: true
				},
				{
					text: "The lamps are dark.",
					goto: "dark",
					requires: [{
						flag: "roadDark",
						is: true
					}]
				},
				{
					text: "The lamps are taking power.",
					goto: "lit",
					requires: [{
						flag: "roadLamps",
						is: true
					}]
				},
				{
					text: "Stone is moving on this road.",
					goto: "stone",
					requires: [{
						flag: "stoneMoving",
						is: true
					}]
				},
				{
					text: "The carts toward the ward got heavier.",
					goto: "eats",
					requires: [{
						flag: "foodLive",
						is: true
					}]
				},
				end("I'll walk it myself.")
			]
		},
		dark: {
			speaker: "lark",
			text: "Then the orrery is not sending, or somebody cut the glass and left the clock turning. Cargo will argue. The south cut does not. Use it if you want the dark to stay a choice instead of a stop.",
			replies: [end("The south cut, then.", [flag("roadBypass", true)])]
		},
		lit: {
			speaker: "lark",
			text: "Light on the high walk. That light is a child. If the parent stops, do not be surprised that the argument starts here and not in the citadel.",
			replies: [end("I know what it's a child of.")]
		},
		stone: {
			speaker: "lark",
			text: "The pit is sending weight. I don't need to know who you spared under the boom. The road knows the stone is coming, and Rust will know it before anyone makes a speech.",
			replies: [end("Then the road is the message.")]
		},
		eats: {
			speaker: "lark",
			text: "Somebody in the ward is eating. The carts got heavier before I saw a plate. If you want the room, it's up the stair. I'm just the part that felt the change.",
			replies: [end("The weight arrived first.")]
		}
	}
};
CONVOS["guard-line"] = {
	start: "start",
	nodes: {
		start: {
			speaker: "en1",
			text: "Checkpoint. Nobody walks the south plate without a chit, a rank, or a very convincing noise. You have a zero on you. I can read it from here.",
			replies: [
				{
					text: "I have authorization.",
					check: {
						skill: "speech",
						dc: 54
					},
					goto: "pass",
					failGoto: "no",
					effects: [
						flag("checkpointSpoke", true),
						log("The sentence lands. They hate it and they let it stand."),
						{
							op: "xp",
							n: 20
						},
						{
							op: "rep",
							faction: "bureau",
							n: 4
						}
					]
				},
				{
					text: "Your pressure regulator is about to rupture.",
					check: {
						skill: "engineering",
						dc: 46
					},
					goto: "pass",
					failGoto: "no",
					effects: [
						flag("checkpointSpoke", true),
						log("Moll looks at a gauge she forgot she was wearing. The squad steps aside to listen to their own iron."),
						{
							op: "xp",
							n: 20
						}
					]
				},
				{
					text: "The pump's lockout is already failing. Go look.",
					goto: "pass",
					requires: [{
						flag: "knowsLockout",
						is: true
					}],
					effects: [
						flag("checkpointSpoke", true),
						log("You name a failure they were paid not to notice. They go look at the pump instead of you."),
						{
							op: "xp",
							n: 16
						},
						{
							op: "rep",
							faction: "bureau",
							n: -2
						}
					]
				},
				{
					text: "Move.",
					goto: "fight"
				},
				{
					text: "Fine.",
					goto: "back"
				},
				{
					text: "The plate is empty. You're holding the road mouth.",
					goto: "mouth",
					requires: [{
						flag: "roadWatch",
						is: true
					}]
				}
			]
		},
		pass: {
			speaker: "en1",
			text: "Go. If Varr asks, you were steam.",
			replies: [end("I'm already walking.")]
		},
		mouth: {
			speaker: "en1",
			text: "Varr is not on the plate. Hess and I held the mouth because nobody signed the stair. The road is the job now. That is a posting, not a verdict.",
			replies: [end("Hold it, then.")]
		},
		no: {
			speaker: "en1",
			text: "No. And now I have written the attempt down, which is worse for both of us.",
			replies: [{
				text: "Then we do this with iron.",
				goto: "fight"
			}, {
				text: "I'll take the north streets.",
				goto: "back"
			}]
		},
		fight: {
			speaker: "en1",
			text: "Squad. The zero wants a lesson.",
			replies: [end("Read them.", [
				{
					op: "hostile",
					id: "varr",
					on: true
				},
				{
					op: "aggro",
					ids: [
						"varr",
						"en1",
						"en2"
					],
					on: true
				},
				{
					op: "combat",
					ids: [
						"varr",
						"en1",
						"en2"
					]
				},
				flag("checkpointSpoke", true),
				log("The checkpoint becomes a diagram with three bodies in it.")
			])]
		},
		back: {
			speaker: "narrator",
			text: "You step back through the door. The plate does not follow. Yet.",
			replies: [end("North, then.", [{
				op: "goto",
				map: "sinks",
				x: 14,
				y: 10
			}])]
		}
	}
};
CONVOS["varr-memory"] = {
	start: "start",
	nodes: { start: {
		speaker: "varr",
		text: "The weapons went quiet. The checkpoint did not. Say what you came to say. I am not raising that shape again.",
		replies: [end("I'll walk.")]
	} }
};
CONVOS["varr-memory-cut"] = {
	start: "start",
	nodes: {
		start: {
			speaker: "varr",
			text: "You took the pressure out of the rifle, and then you talked. The checkpoint is still mine. Leave the rifle a rumor.",
			replies: [end("I'll walk."), {
				text: "The stair.",
				goto: "stair"
			}]
		},
		stair: {
			speaker: "varr",
			text: "I unbarred it. The checkpoint is still mine. Don't make it a tour.",
			replies: [end("I'll walk.")]
		}
	}
};
CONVOS["varr-memory-open"] = {
	start: "start",
	nodes: { start: {
		speaker: "varr",
		text: "The plate is off me. I am still the checkpoint. You already heard the piece.",
		replies: [end("I'll walk.")]
	} }
};
for (const id of ["en1", "en2"]) {
	CONVOS[`checkpoint-held-${id}`] = {
		start: "start",
		nodes: { start: {
			speaker: id,
			text: "Captain's on the plate. The stair behind the shop is his. He doesn't want the speech again.",
			replies: [end("I'll walk.")]
		} }
	};
	CONVOS[`checkpoint-vacant-${id}`] = {
		start: "start",
		nodes: { start: {
			speaker: id,
			text: "There's no captain. I am not taking the job. We're on the road mouth. The stair stays barred.",
			replies: [end("I'll walk.")]
		} }
	};
}
CONVOS["plate-stair"] = {
	start: "start",
	nodes: { start: {
		speaker: "narrator",
		text: "A bar sits in the plate stair. It wants a Bureau signature. The iron does not care what you think of the man who can give it.",
		replies: [end("Leave it.")]
	} }
};
CONVOS["sump-door"] = {
	start: "start",
	nodes: { start: {
		speaker: "narrator",
		text: "The gallery door is shut. The head behind the gauge is dry. Pressure has to come from the pump — a seated valve, or a bypass thrown toward the sump.",
		replies: [end("Leave it.")]
	} }
};
CONVOS.nessa = {
	start: "start",
	nodes: {
		start: {
			speaker: "nessa",
			text: "Nessa. I sell what the cistern allows, which today might be nothing. The stall leg is a child. I am not the parent.",
			replies: [
				{
					text: "Buy a bandage. Eight scrip.",
					requires: [{
						flag: "wardGoods",
						is: "clean"
					}, { scrip: 8 }],
					check: {
						skill: "barter",
						dc: 28
					},
					effects: [
						{
							op: "scrip",
							n: -8
						},
						{
							op: "item",
							id: "bandage"
						},
						log("Clean water, clean cloth. The stall can afford to be a shop.")
					],
					end: true
				},
				{
					text: "Buy the stamped wash. Twelve scrip.",
					requires: [{
						flag: "wardGoods",
						is: "stamped"
					}, { scrip: 12 }],
					check: {
						skill: "barter",
						dc: 36
					},
					effects: [
						{
							op: "scrip",
							n: -12
						},
						{
							op: "item",
							id: "bandage"
						},
						log("Quill's stamp is on the jar. The water is still brown. The cloth is real.")
					],
					end: true
				},
				{
					text: "The water is brown.",
					goto: "brown",
					requires: [{
						flag: "wardGoods",
						is: "brown"
					}]
				},
				{
					text: "The stall is dry.",
					goto: "dry",
					requires: [{
						flag: "wardGoods",
						is: "none"
					}]
				},
				{
					text: "Buy a meal off the plots. (6 scrip)",
					requires: [{
						flag: "foodLive",
						is: true
					}, { scrip: 6 }],
					effects: [
						{
							op: "scrip",
							n: -6
						},
						{
							op: "heal",
							id: "player",
							n: 8
						},
						log("The meal is a child of the plots, which are a child of the Sinks. Nessa prices it like a fact.")
					],
					end: true
				},
				{
					text: "Front me a bandage. I'll bring the scrip.",
					goto: "front",
					requires: [{
						flag: "nessaSells",
						is: true
					}, { missing: "nessaFront" }]
				},
				{
					text: "You had a wage.",
					goto: "refuses",
					requires: [{
						flag: "nessaRefuses",
						is: true
					}]
				},
				end("I'll look at the cistern.")
			]
		},
		brown: {
			speaker: "nessa",
			text: "Brown is not a price I will call drinking water. If a clerk stamps it provisional, I can sell the wash. I will not invent the stamp.",
			replies: [end("I'll find the clerk.")]
		},
		dry: {
			speaker: "nessa",
			text: "Dry. Either the Sinks are not sending, or someone threw the split at the clinic. Read the cistern. The main is the same shape as a pressure feed, if you have already understood one.",
			replies: [end("I'll read it.")]
		},
		front: {
			speaker: "nessa",
			text: "The stall is a wage today. One bandage on trust. If the parent stops, do not come back and call the trust a debt I still owe.",
			replies: [end("I'll remember which pipe it hangs on.", [
				flag("nessaFront", true),
				{
					op: "item",
					id: "bandage"
				},
				log("Nessa fronts a bandage. The trust is a child of a stall that is currently a child of the Sinks.")
			])]
		},
		refuses: {
			speaker: "nessa",
			text: "I had a wage. I do not have one. The stall was not a well and I am not a parent. I will not front a bandage against a pipe that stopped. Read the cistern, or read whatever is upstream of it.",
			replies: [end("I'll read the parent.")]
		}
	}
};
CONVOS.bram = {
	start: "start",
	nodes: {
		start: {
			speaker: "bram",
			text: "Bram. The cart does not care about speeches. It cares whether the plate stair is signed, and whether a squad is standing in the mouth.",
			replies: [
				{
					text: "The squad is on the mouth.",
					goto: "stuck",
					requires: [{
						flag: "roadWatch",
						is: true
					}]
				},
				{
					text: "The stair is signed. Move the freight.",
					goto: "run",
					requires: [
						{
							flag: "plateStair",
							is: true
						},
						{
							flag: "roadWatch",
							is: false
						},
						{ missing: "bramRan" }
					]
				},
				{
					text: "Use the dry corner under the crown.",
					goto: "cache",
					requires: [{
						flag: "jackHeld",
						is: true
					}, { missing: "bramBarrel" }]
				},
				{
					text: "The stair.",
					goto: "waiting",
					requires: [{
						flag: "plateStair",
						is: false
					}, {
						flag: "roadWatch",
						is: false
					}]
				},
				{
					text: "Hold the cart. The ward is hungry.",
					goto: "hoard",
					requires: [
						{
							flag: "stoneMoving",
							is: true
						},
						{
							flag: "foodLive",
							is: false
						},
						{ missing: "bramHoard" }
					]
				},
				{
					text: "Let the cart go upstairs.",
					goto: "release",
					requires: [{
						flag: "bramHoard",
						is: true
					}]
				},
				end("I'll walk.")
			]
		},
		stuck: {
			speaker: "bram",
			text: "Moll and Hess left the plate and took the mouth. I am not driving a cart through a vacancy that still has rifles. That is not fear. That is a parent.",
			replies: [end("Then the cart stays.")]
		},
		run: {
			speaker: "bram",
			text: "Signed, and the mouth is empty of them. I can take a load up. You don't get a medal. You get what the load was worth.",
			replies: [end("Take it.", [
				flag("bramRan", true),
				{
					op: "scrip",
					n: 14
				},
				{
					op: "xp",
					n: 12
				},
				log("Bram's cart leaves. Freight moves because the stair was signed and the mouth was not a squad.")
			])]
		},
		cache: {
			speaker: "bram",
			text: "You held that crown. The dry corner under it will take a barrel that the alley can use. Plate scrap was already in it. This is the second use.",
			replies: [end("Leave the barrel.", [
				flag("bramBarrel", true),
				{
					op: "item",
					id: "scrap"
				},
				log("Bram stashes a barrel in the held gallery. You take the plate scrap that was under it.")
			])]
		},
		waiting: {
			speaker: "bram",
			text: "The stair is still barred. Nobody signed it. I don't pull a bar that belongs to the checkpoint. When the plate has a captain, or when it doesn't and the squad moves, come back and tell me which one happened.",
			replies: [end("I'll learn which one it is.")]
		},
		hoard: {
			speaker: "bram",
			text: "The ward is not eating, and the road is carrying stone toward people who already have stores. I can hold this cart. The citadel does not get the load. The ward does not become fed. Both of those stay true.",
			replies: [end("Hold it.", [
				flag("bramHoard", true),
				{
					op: "xp",
					n: 10
				},
				log("Bram holds the cart. Citadel supply loses a parent. The ward is still hungry.")
			])]
		},
		release: {
			speaker: "bram",
			text: "Then the load goes upstairs. I am not calling that a feeding. I am calling it a road that is allowed to finish.",
			replies: [end("Let it finish.", [flag("bramHoard", false), log("Bram lets the cart go. The citadel can take the road again, if the road is still carrying.")])]
		}
	}
};
CONVOS.odell = {
	start: "start",
	nodes: {
		start: {
			speaker: "odell",
			text: "Odell. I stitch what cloth can see. The tap behind me is not a well. It is a leg of the ward cistern.",
			replies: [
				{
					text: "Use the tap. Close what you can.",
					requires: [{
						flag: "wardClinic",
						is: true
					}],
					check: {
						skill: "medicine",
						dc: 34
					},
					effects: [{
						op: "heal",
						id: "player",
						n: 14
					}, log("The clinic tap is live. Odell closes what cloth can close. It is medicine.")],
					end: true
				},
				{
					text: "The tap is dry.",
					goto: "dry",
					requires: [{
						flag: "wardClinic",
						is: false
					}]
				},
				end("I'll leave the clinic.")
			]
		},
		dry: {
			speaker: "odell",
			text: "Dry. If the split was thrown to the stall, throw it back, or seat both legs. If the Sinks are not sending, I cannot invent water. Cellars and rumors are not a baseline.",
			replies: [end("I'll read the cistern.")]
		}
	}
};
CONVOS.quill = {
	start: "start",
	nodes: {
		start: {
			speaker: "quill",
			text: "Clerk Quill. Pricing, not punishment. I file what the district is actually sending. A dry rumor does not get a civic price. Brown water does not get the word drinking.",
			replies: [
				{
					text: "Stamp the brown water as provisional.",
					goto: "stamp",
					requires: [{
						flag: "pumpFate",
						is: "bleed"
					}, { missing: "provisionalStamp" }],
					check: {
						skill: "speech",
						dc: 46
					},
					effects: [
						flag("provisionalStamp", true),
						{
							op: "xp",
							n: 18
						},
						log("Quill stamps the brown water provisional. The stall can sell the wash under that name. It is not clean.")
					],
					failEffects: [log("Quill will not invent a cleaner word than the water.")]
				},
				{
					text: "The water is seated.",
					goto: "seated",
					requires: [{
						flag: "pumpFate",
						is: "mend"
					}]
				},
				{
					text: "Wren seated it.",
					goto: "wren",
					requires: [{
						flag: "pumpFate",
						is: "wren"
					}]
				},
				{
					text: "You are still calling it dry.",
					goto: "dryprice",
					requires: [{
						flag: "pumpFate",
						is: "lockout"
					}]
				},
				{
					text: "The plots are feeding a levy.",
					goto: "levy",
					requires: [{
						flag: "levyLive",
						is: true
					}]
				},
				end("File nothing, then.")
			]
		},
		stamp: {
			speaker: "quill",
			text: "Provisional. Not clean. Nessa can sell the wash if she is willing to say the word I wrote, which is not the word she wanted.",
			replies: [end("That's the filing.")]
		},
		seated: {
			speaker: "quill",
			text: "Seated water gets a civic price. The plaque upstairs will forget your hands. I will not argue with a plaque. I also will not pretend the seal did the work.",
			replies: [end("Leave the plaque.")]
		},
		wren: {
			speaker: "quill",
			text: "A line worker seated it. That is a better sentence than most of my forms. The price will still say Bureau. The form is not the pipe.",
			replies: [end("The form is not the pipe.")]
		},
		dryprice: {
			speaker: "quill",
			text: "The veto is gone and the valve is still unseated. I cannot price a district that is not actually sending a drinkable parent. Cut a seal and you have a story. Seat the valve and I have a number.",
			replies: [end("Then the number waits.")]
		},
		levy: {
			speaker: "quill",
			text: "Restored food is a civic parent. I can invoice it. If you wanted hunger to be the thing that died, you also woke a bill. I will not pretend those are different pipes. Refuse the bed and the bill dies. So does the meal.",
			replies: [end("Both stay on the filing.")]
		}
	}
};
CONVOS["ash-cut"] = {
	start: "start",
	nodes: { start: {
		speaker: "narrator",
		text: "A service cut behind the stalls. It is a way through only while the ward is unfed. Feed the stall and the plots, and this door stops owing anyone a path.",
		replies: [end("Leave it.")]
	} }
};
extendCampaign(CONVOS);
Object.assign(CONVOS, KILN_CONVOS, SWITCH_CONVOS, PANE_CONVOS);
var floaters = [];
var bursts = [];
var shake = 0;
function floatText(x, y, text, color = "#f3ead7") {
	floaters.push({
		x,
		y,
		text,
		color,
		life: 1
	});
	if (floaters.length > 24) floaters.shift();
}
function burst(x, y, kind) {
	bursts.push({
		x,
		y,
		kind,
		life: 1,
		seed: Math.random() * Math.PI * 2
	});
	if (bursts.length > 18) bursts.shift();
}
function bump(n = 7) {
	shake = Math.max(shake, n);
}
function decayFx(dt) {
	shake = Math.max(0, shake - dt * 18);
	for (const f of floaters) f.life -= dt;
	for (let i = floaters.length - 1; i >= 0; i--) if (floaters[i].life <= 0) floaters.splice(i, 1);
	for (const b of bursts) b.life -= dt * .85;
	for (let i = bursts.length - 1; i >= 0; i--) if (bursts[i].life <= 0) bursts.splice(i, 1);
}
var WORLD_NODES = [
	{
		id: "bellows",
		name: "Sinks bellows",
		district: "sinks",
		kind: "machine",
		root: true,
		about: "The lung the pump drinks."
	},
	{
		id: "pressure",
		name: "Gallery pressure",
		district: "sinks",
		kind: "machine",
		root: true,
		about: "What the pump can send while the lung is seated."
	},
	{
		id: "clean",
		name: "Seated water",
		district: "sinks",
		kind: "service",
		root: true,
		about: "Water a stall will call a drink."
	},
	{
		id: "stamped",
		name: "Provisional stamp",
		district: "haven",
		kind: "service",
		root: true,
		about: "A clerk's word for brown water."
	},
	{
		id: "stall",
		name: "Stall leg",
		district: "haven",
		kind: "service",
		root: true,
		about: "The market side of the cistern."
	},
	{
		id: "clinic",
		name: "Clinic leg",
		district: "haven",
		kind: "service",
		root: true,
		about: "The stitcher's tap."
	},
	{
		id: "bed-open",
		name: "Plot bed",
		district: "haven",
		kind: "machine",
		root: true,
		about: "The local bed. Water is not enough if this is refused."
	},
	{
		id: "watch",
		name: "Road watch",
		district: "sinks",
		kind: "faction",
		root: true,
		about: "A squad in the road mouth."
	},
	{
		id: "moving",
		name: "Stone on the road",
		district: "road",
		kind: "route",
		root: true,
		about: "Quarry stone that has a stair and no squad."
	},
	{
		id: "colossus",
		name: "Colossus breath",
		district: "quarry",
		kind: "machine",
		root: true,
		about: "The turbine that parents the crane cable."
	},
	{
		id: "heat",
		name: "Fire bed",
		district: "rust",
		kind: "machine",
		root: true,
		about: "The hearth's bed, whoever parents it."
	},
	{
		id: "guild",
		name: "Guild flue",
		district: "rust",
		kind: "service",
		root: true,
		about: "Heat in the hall."
	},
	{
		id: "sleepers",
		name: "Sleeper flues",
		district: "rust",
		kind: "service",
		root: true,
		about: "Heat in the tenement."
	},
	{
		id: "siphon",
		name: "Worker siphon",
		district: "citadel",
		kind: "machine",
		root: true,
		about: "What the orrery drinks."
	},
	{
		id: "orrery",
		name: "Orrery drive",
		district: "citadel",
		kind: "machine",
		root: true,
		about: "The citadel clock."
	},
	{
		id: "citadel-open",
		name: "Citadel reached",
		district: "citadel",
		kind: "event",
		root: true,
		about: "The ranking floor is in play."
	},
	{
		id: "told",
		name: "Wren's diagram",
		district: "sinks",
		kind: "person",
		root: true,
		about: "Whether the line was told about the lung."
	},
	{
		id: "plots-refused",
		name: "Refused plots",
		district: "haven",
		kind: "event",
		root: true,
		about: "Silas left the beds down on purpose."
	},
	{
		id: "stock-refused",
		name: "Refused stock",
		district: "rust",
		kind: "event",
		root: true,
		about: "Silas would not let the forge finish gear."
	},
	{
		id: "wash-spill",
		name: "Wash taking the quench",
		district: "rust",
		kind: "machine",
		root: true,
		about: "The tenement pipe drinking what the forge needed."
	},
	{
		id: "chute-spill",
		name: "Chute spill",
		district: "quarry",
		kind: "machine",
		root: true,
		about: "A local grade cut. Ore leaves the road and not the forge."
	},
	{
		id: "lamp-dark",
		name: "Broken lamp glass",
		district: "citadel",
		kind: "machine",
		root: true,
		about: "A local cut on a child of the orrery."
	},
	{
		id: "hoard",
		name: "Held cart",
		district: "haven",
		kind: "person",
		root: true,
		about: "Bram held the load for the ward."
	},
	{
		id: "cart-pin",
		name: "Pinned waystation",
		district: "road",
		kind: "machine",
		root: true,
		about: "A brake held so stone does not become ore."
	},
	{
		id: "shop",
		name: "Stall shop",
		district: "haven",
		kind: "store",
		about: "Nessa can sell."
	},
	{
		id: "income",
		name: "Nessa's income",
		district: "haven",
		kind: "person",
		about: "What the shop pays her."
	},
	{
		id: "care",
		name: "Clinic care",
		district: "haven",
		kind: "service",
		about: "Odell has a live tap."
	},
	{
		id: "inlet",
		name: "Plot inlet",
		district: "haven",
		kind: "machine",
		about: "Clean water arriving at the beds."
	},
	{
		id: "food",
		name: "Ward food",
		district: "haven",
		kind: "service",
		about: "What the plots yield, if the bed was allowed to."
	},
	{
		id: "levy",
		name: "Plot levy",
		district: "haven",
		kind: "faction",
		about: "A bill that rides on restored food."
	},
	{
		id: "ash",
		name: "Alley access",
		district: "haven",
		kind: "faction",
		about: "Who uses the ward when it is not fed."
	},
	{
		id: "ore",
		name: "Sound ore",
		district: "quarry",
		kind: "route",
		about: "Stone the colossus is still helping to carry, and the chute has not spilled."
	},
	{
		id: "quench",
		name: "Forge quench",
		district: "rust",
		kind: "machine",
		about: "Gallery water the forge can drink."
	},
	{
		id: "stock",
		name: "Forge stock",
		district: "rust",
		kind: "machine",
		about: "Gear, if ore, quench, and fire all hold, and Silas did not refuse it."
	},
	{
		id: "gear",
		name: "Gear on the bench",
		district: "rust",
		kind: "store",
		about: "What Ives can actually hand over."
	},
	{
		id: "ration",
		name: "Rust ration",
		district: "rust",
		kind: "service",
		about: "Hall heat baking because the ward is hungry."
	},
	{
		id: "supply",
		name: "Citadel supply",
		district: "citadel",
		kind: "route",
		about: "Cargo that was not held back in the ward."
	},
	{
		id: "fed",
		name: "Guard meal",
		district: "citadel",
		kind: "service",
		about: "Plate that has food or cargo."
	},
	{
		id: "toll",
		name: "Guard toll",
		district: "citadel",
		kind: "faction",
		about: "A price that appears when the plate is unfed."
	},
	{
		id: "power",
		name: "Citadel power",
		district: "citadel",
		kind: "machine",
		about: "Siphon and orrery together."
	},
	{
		id: "lamps",
		name: "Road lamps",
		district: "road",
		kind: "service",
		about: "Light on the stack road."
	},
	{
		id: "dark",
		name: "Dark road",
		district: "road",
		kind: "event",
		about: "The lamps' absence, once the citadel is in play."
	},
	{
		id: "loose",
		name: "Loose sentry",
		district: "citadel",
		kind: "faction",
		about: "A clock that stopped, so the watch has no hour."
	},
	{
		id: "workers",
		name: "Line diagram",
		district: "quarry",
		kind: "person",
		about: "Wren's reading of the lung, carried to the pit."
	},
	{
		id: "clay",
		name: "Yard clay",
		district: "kiln",
		kind: "machine",
		root: true,
		about: "The only parent the brick yard owns outright."
	},
	{
		id: "kiln-bed",
		name: "Kiln bed",
		district: "kiln",
		kind: "machine",
		root: true,
		about: "Local flue or borrowed Rust heat. Not both required."
	},
	{
		id: "kiln-refused",
		name: "Refused yard",
		district: "kiln",
		kind: "event",
		root: true,
		about: "Silas left the beds down on purpose."
	},
	{
		id: "field-dry",
		name: "Field-dry",
		district: "kiln",
		kind: "machine",
		root: true,
		about: "A mean bake that does not need gallery water."
	},
	{
		id: "kiln-stamp",
		name: "Stamp claim",
		district: "kiln",
		kind: "faction",
		root: true,
		about: "Cress's price, still intact."
	},
	{
		id: "licensed",
		name: "Licensed board",
		district: "kiln",
		kind: "event",
		root: true,
		about: "The stamp was paid or talked into allowing a sale."
	},
	{
		id: "stamp-gone",
		name: "Cut stamp",
		district: "kiln",
		kind: "event",
		root: true,
		about: "The claim is a hole."
	},
	{
		id: "brick",
		name: "Set brick",
		district: "kiln",
		kind: "service",
		about: "Clay, a bed, and water or a field-dry. Refusal blocks it."
	},
	{
		id: "houses",
		name: "Kiln houses",
		district: "kiln",
		kind: "service",
		about: "Walls that hold because brick holds."
	},
	{
		id: "kiln-shop",
		name: "Jun's board",
		district: "kiln",
		kind: "store",
		about: "A legal sale. Brick, plus a license or a hole."
	},
	{
		id: "kiln-levy",
		name: "Brick levy",
		district: "kiln",
		kind: "faction",
		about: "A bill that rides on brick while the stamp still exists."
	},
	{
		id: "switch-open",
		name: "Table passing",
		district: "switch",
		kind: "route",
		root: true,
		about: "The haul can leave. A jam blocks it unless a shunt is seated."
	},
	{
		id: "on-books",
		name: "Haul on the books",
		district: "switch",
		kind: "faction",
		root: true,
		about: "Weight the stamp is allowed to see. A shunt takes it off the books."
	},
	{
		id: "grease",
		name: "Axle grease",
		district: "switch",
		kind: "machine",
		root: true,
		about: "The local parent of a floor that stops billing."
	},
	{
		id: "yard-stamp",
		name: "Yard stamp",
		district: "switch",
		kind: "faction",
		root: true,
		about: "Rue's price, still intact."
	},
	{
		id: "yard-licensed",
		name: "Licensed yard",
		district: "switch",
		kind: "event",
		root: true,
		about: "The stamp was paid or talked into allowing a shed sale."
	},
	{
		id: "yard-cut",
		name: "Cut yard stamp",
		district: "switch",
		kind: "event",
		root: true,
		about: "The yard claim is a hole."
	},
	{
		id: "shed",
		name: "Yard shed",
		district: "switch",
		kind: "service",
		about: "A sleeper's floor, once the axle is greased."
	},
	{
		id: "yard-toll",
		name: "Haul levy",
		district: "switch",
		kind: "faction",
		about: "A bill that rides a haul the books can see."
	},
	{
		id: "yard-shop",
		name: "Shed board",
		district: "switch",
		kind: "store",
		about: "A legal sale. Grease, a passing table, and a license or a hole."
	},
	{
		id: "sand",
		name: "House sand",
		district: "pane",
		kind: "machine",
		root: true,
		about: "The only parent the glasshouse owns outright. A spill can be seated again."
	},
	{
		id: "pane-bed",
		name: "Glass bed",
		district: "pane",
		kind: "machine",
		root: true,
		about: "Local flue or borrowed kiln heat. Not both required."
	},
	{
		id: "pane-refused",
		name: "Refused house",
		district: "pane",
		kind: "event",
		root: true,
		about: "Silas left the beds down on purpose."
	},
	{
		id: "cullet",
		name: "Cullet melt",
		district: "pane",
		kind: "machine",
		root: true,
		about: "Scrap melted mean. It can stand in for a spilled pit."
	},
	{
		id: "pane-stamp",
		name: "Glass stamp",
		district: "pane",
		kind: "faction",
		root: true,
		about: "Ness's price, still intact."
	},
	{
		id: "pane-licensed",
		name: "Licensed bench",
		district: "pane",
		kind: "event",
		root: true,
		about: "The stamp was paid or talked into allowing a sale."
	},
	{
		id: "pane-cut",
		name: "Cut glass stamp",
		district: "pane",
		kind: "event",
		root: true,
		about: "The glass claim is a hole."
	},
	{
		id: "charge",
		name: "Clear melt",
		district: "pane",
		kind: "service",
		about: "Sand or cullet, and a bed. Refusal blocks it."
	},
	{
		id: "pane-houses",
		name: "Glass house",
		district: "pane",
		kind: "service",
		about: "Walls that hold because the melt holds."
	},
	{
		id: "pane-shop",
		name: "Glass bench",
		district: "pane",
		kind: "store",
		about: "A legal sale. A melt, plus a license or a hole."
	},
	{
		id: "pane-levy",
		name: "Glass levy",
		district: "pane",
		kind: "faction",
		about: "A bill that rides a melt while the stamp still exists."
	}
];
var WORLD_EDGES = [
	{
		id: "bellows-pressure",
		rel: "supplies",
		from: "bellows",
		to: "pressure",
		gate: "note"
	},
	{
		id: "colossus-crane",
		rel: "supports",
		from: "colossus",
		to: "moving",
		gate: "note"
	},
	{
		id: "siphon-orrery",
		rel: "powers",
		from: "siphon",
		to: "orrery",
		gate: "note"
	},
	{
		id: "heat-stone",
		rel: "supplies",
		from: "moving",
		to: "heat",
		gate: "note"
	},
	{
		id: "stall-shop",
		rel: "supplies",
		from: "stall",
		to: "shop",
		gate: "require"
	},
	{
		id: "clean-shop",
		rel: "regulates",
		from: "clean",
		to: "shop",
		gate: "alt",
		altGroup: "potable"
	},
	{
		id: "stamp-shop",
		rel: "regulates",
		from: "stamped",
		to: "shop",
		gate: "alt",
		altGroup: "potable"
	},
	{
		id: "shop-income",
		rel: "supplies",
		from: "shop",
		to: "income",
		gate: "require"
	},
	{
		id: "clinic-care",
		rel: "supplies",
		from: "clinic",
		to: "care",
		gate: "require"
	},
	{
		id: "pressure-inlet",
		rel: "supplies",
		from: "pressure",
		to: "inlet",
		gate: "require"
	},
	{
		id: "clean-inlet",
		rel: "regulates",
		from: "clean",
		to: "inlet",
		gate: "require"
	},
	{
		id: "refuse-inlet",
		rel: "blocks",
		from: "plots-refused",
		to: "inlet",
		gate: "block"
	},
	{
		id: "inlet-food",
		rel: "supplies",
		from: "inlet",
		to: "food",
		gate: "require"
	},
	{
		id: "bed-food",
		rel: "supports",
		from: "bed-open",
		to: "food",
		gate: "require"
	},
	{
		id: "food-levy",
		rel: "exposes",
		from: "food",
		to: "levy",
		gate: "require"
	},
	{
		id: "lack-shop-ash",
		rel: "exposes",
		from: "shop",
		to: "ash",
		gate: "lack"
	},
	{
		id: "lack-food-ash",
		rel: "exposes",
		from: "food",
		to: "ash",
		gate: "lack"
	},
	{
		id: "watch-ash",
		rel: "blocks",
		from: "watch",
		to: "ash",
		gate: "block"
	},
	{
		id: "move-ore",
		rel: "transports",
		from: "moving",
		to: "ore",
		gate: "require"
	},
	{
		id: "colossus-ore",
		rel: "supports",
		from: "colossus",
		to: "ore",
		gate: "require"
	},
	{
		id: "spill-ore",
		rel: "blocks",
		from: "chute-spill",
		to: "ore",
		gate: "block"
	},
	{
		id: "pin-ore",
		rel: "blocks",
		from: "cart-pin",
		to: "ore",
		gate: "block"
	},
	{
		id: "pressure-quench",
		rel: "supplies",
		from: "pressure",
		to: "quench",
		gate: "require"
	},
	{
		id: "ore-stock",
		rel: "supplies",
		from: "ore",
		to: "stock",
		gate: "require"
	},
	{
		id: "quench-stock",
		rel: "consumes",
		from: "quench",
		to: "stock",
		gate: "require"
	},
	{
		id: "heat-stock",
		rel: "powers",
		from: "heat",
		to: "stock",
		gate: "require"
	},
	{
		id: "refuse-stock",
		rel: "blocks",
		from: "stock-refused",
		to: "stock",
		gate: "block"
	},
	{
		id: "wash-quench",
		rel: "blocks",
		from: "wash-spill",
		to: "quench",
		gate: "block"
	},
	{
		id: "stock-gear",
		rel: "supplies",
		from: "stock",
		to: "gear",
		gate: "require"
	},
	{
		id: "guild-ration",
		rel: "supplies",
		from: "guild",
		to: "ration",
		gate: "require"
	},
	{
		id: "food-ration",
		rel: "stabilizes",
		from: "food",
		to: "ration",
		gate: "lack"
	},
	{
		id: "move-supply",
		rel: "transports",
		from: "moving",
		to: "supply",
		gate: "require"
	},
	{
		id: "hoard-supply",
		rel: "blocks",
		from: "hoard",
		to: "supply",
		gate: "block"
	},
	{
		id: "supply-fed",
		rel: "supplies",
		from: "supply",
		to: "fed",
		gate: "alt",
		altGroup: "meal"
	},
	{
		id: "food-fed",
		rel: "supplies",
		from: "food",
		to: "fed",
		gate: "alt",
		altGroup: "meal"
	},
	{
		id: "open-toll",
		rel: "depends",
		from: "citadel-open",
		to: "toll",
		gate: "require"
	},
	{
		id: "fed-toll",
		rel: "stabilizes",
		from: "fed",
		to: "toll",
		gate: "lack"
	},
	{
		id: "siphon-power",
		rel: "powers",
		from: "siphon",
		to: "power",
		gate: "require"
	},
	{
		id: "orrery-power",
		rel: "powers",
		from: "orrery",
		to: "power",
		gate: "require"
	},
	{
		id: "power-lamps",
		rel: "powers",
		from: "power",
		to: "lamps",
		gate: "require"
	},
	{
		id: "glass-lamps",
		rel: "blocks",
		from: "lamp-dark",
		to: "lamps",
		gate: "block"
	},
	{
		id: "lamps-dark",
		rel: "destabilizes",
		from: "lamps",
		to: "dark",
		gate: "lack"
	},
	{
		id: "open-dark",
		rel: "depends",
		from: "citadel-open",
		to: "dark",
		gate: "require"
	},
	{
		id: "power-loose",
		rel: "controls",
		from: "power",
		to: "loose",
		gate: "lack"
	},
	{
		id: "open-loose",
		rel: "depends",
		from: "citadel-open",
		to: "loose",
		gate: "require"
	},
	{
		id: "told-workers",
		rel: "communicates",
		from: "told",
		to: "workers",
		gate: "require"
	},
	{
		id: "clay-brick",
		rel: "supplies",
		from: "clay",
		to: "brick",
		gate: "require"
	},
	{
		id: "bed-brick",
		rel: "powers",
		from: "kiln-bed",
		to: "brick",
		gate: "require"
	},
	{
		id: "pressure-brick",
		rel: "supplies",
		from: "pressure",
		to: "brick",
		gate: "alt",
		altGroup: "set"
	},
	{
		id: "dry-brick",
		rel: "supplies",
		from: "field-dry",
		to: "brick",
		gate: "alt",
		altGroup: "set"
	},
	{
		id: "refuse-brick",
		rel: "blocks",
		from: "kiln-refused",
		to: "brick",
		gate: "block"
	},
	{
		id: "brick-houses",
		rel: "supports",
		from: "brick",
		to: "houses",
		gate: "require"
	},
	{
		id: "brick-shop",
		rel: "supplies",
		from: "brick",
		to: "kiln-shop",
		gate: "require"
	},
	{
		id: "license-shop",
		rel: "regulates",
		from: "licensed",
		to: "kiln-shop",
		gate: "alt",
		altGroup: "permit"
	},
	{
		id: "hole-shop",
		rel: "regulates",
		from: "stamp-gone",
		to: "kiln-shop",
		gate: "alt",
		altGroup: "permit"
	},
	{
		id: "brick-levy",
		rel: "exposes",
		from: "brick",
		to: "kiln-levy",
		gate: "require"
	},
	{
		id: "stamp-levy",
		rel: "regulates",
		from: "kiln-stamp",
		to: "kiln-levy",
		gate: "require"
	},
	{
		id: "open-supply",
		rel: "transports",
		from: "switch-open",
		to: "supply",
		gate: "require"
	},
	{
		id: "grease-shed",
		rel: "supports",
		from: "grease",
		to: "shed",
		gate: "require"
	},
	{
		id: "books-toll",
		rel: "exposes",
		from: "on-books",
		to: "yard-toll",
		gate: "require"
	},
	{
		id: "move-toll",
		rel: "transports",
		from: "moving",
		to: "yard-toll",
		gate: "require"
	},
	{
		id: "stamp-toll",
		rel: "regulates",
		from: "yard-stamp",
		to: "yard-toll",
		gate: "require"
	},
	{
		id: "grease-shop",
		rel: "supports",
		from: "grease",
		to: "yard-shop",
		gate: "require"
	},
	{
		id: "open-shop",
		rel: "transports",
		from: "switch-open",
		to: "yard-shop",
		gate: "require"
	},
	{
		id: "license-yard",
		rel: "regulates",
		from: "yard-licensed",
		to: "yard-shop",
		gate: "alt",
		altGroup: "yard-permit"
	},
	{
		id: "hole-yard",
		rel: "regulates",
		from: "yard-cut",
		to: "yard-shop",
		gate: "alt",
		altGroup: "yard-permit"
	},
	{
		id: "sand-charge",
		rel: "supplies",
		from: "sand",
		to: "charge",
		gate: "alt",
		altGroup: "melt"
	},
	{
		id: "cullet-charge",
		rel: "supplies",
		from: "cullet",
		to: "charge",
		gate: "alt",
		altGroup: "melt"
	},
	{
		id: "bed-charge",
		rel: "powers",
		from: "pane-bed",
		to: "charge",
		gate: "require"
	},
	{
		id: "refuse-charge",
		rel: "blocks",
		from: "pane-refused",
		to: "charge",
		gate: "block"
	},
	{
		id: "charge-houses",
		rel: "supports",
		from: "charge",
		to: "pane-houses",
		gate: "require"
	},
	{
		id: "charge-shop",
		rel: "supplies",
		from: "charge",
		to: "pane-shop",
		gate: "require"
	},
	{
		id: "license-pane",
		rel: "regulates",
		from: "pane-licensed",
		to: "pane-shop",
		gate: "alt",
		altGroup: "pane-permit"
	},
	{
		id: "hole-pane",
		rel: "regulates",
		from: "pane-cut",
		to: "pane-shop",
		gate: "alt",
		altGroup: "pane-permit"
	},
	{
		id: "charge-levy",
		rel: "exposes",
		from: "charge",
		to: "pane-levy",
		gate: "require"
	},
	{
		id: "stamp-pane",
		rel: "regulates",
		from: "pane-stamp",
		to: "pane-levy",
		gate: "require"
	}
];
var BEATS = [
	{
		id: "food",
		district: "haven",
		open: "The ward plots take the water. Food has a parent that is not a local well.",
		close: "The ward plots dry. Food was a child of that water, and the child is gone.",
		voice: {
			who: "tobin",
			open: "Tobin hears the plots take. He calls it maintenance. He does not call it enough.",
			close: "Tobin says the lung is the parent. The plots are just where the dryness became a person."
		}
	},
	{
		id: "shop",
		district: "haven",
		open: "Nessa's stall can sell. The wage is a child of the stall leg and water she will name.",
		close: "Nessa's stall goes dark. She will not front a debt against a parent that stopped.",
		voice: {
			who: "wren",
			open: "Wren says the stall was never the parent. It is drinking. Ask what it is drinking from.",
			close: "Wren says the stall was never the parent. Look at the lung."
		}
	},
	{
		id: "levy",
		district: "haven",
		open: "Quill can file a levy on the plots. Restoring food also restored a bill.",
		close: "The levy has nothing to invoice. The plots are not a civic parent right now.",
		voice: {
			who: "sera",
			open: "Sera says you restored a bill. Food and a levy arrived on the same pipe.",
			close: "Sera says the bill died with the plots. Hunger came with it. She will not pick your sentence."
		}
	},
	{
		id: "ash",
		district: "haven",
		open: "The stall is dark and the plots are dead. An unbound cut is using the service alley.",
		close: "The service alley loses its unbound traffic. The ward is feeding something again."
	},
	{
		id: "gear",
		district: "rust",
		open: "The Rust forge takes ore, quench, and fire. Stock is a grandchild of the quarry and the Sinks.",
		close: "The Rust forge loses a parent. Stock stops. The bench will notice before anyone makes a speech about it.",
		voice: {
			who: "sera",
			open: "Sera watches the stock come up. She does not pick a rifle up.",
			close: "Sera says a forge without stock is not a tragedy until you know which parent you meant to kill."
		}
	},
	{
		id: "ration",
		district: "rust",
		open: "The guild hall is warm and the ward is hungry. Rust can bake a ration. It is not a well.",
		close: "The ration stops. Either the hall cooled, or the ward can feed itself."
	},
	{
		id: "supply",
		district: "citadel",
		open: "Stone on the road is feeding the citadel's stores. A quarry decision arrived upstairs.",
		close: "Citadel stores stop taking the road. Something between the pit and the spire was cut, or held back."
	},
	{
		id: "toll",
		district: "citadel",
		open: "Citadel plate is unfed. The guards will price a door the cargo road is not feeding.",
		close: "Citadel plate has a meal again. The toll was a missing parent, not a law."
	},
	{
		id: "dark",
		district: "road",
		open: "The road lamps are dark. They were a child of the orrery, not of the sky.",
		close: "The road lamps take the orrery again. The stack road has a clock."
	},
	{
		id: "workers",
		district: "quarry",
		open: "The line has Wren's diagram of the bellows. The quarry can ask what the lung is parent to.",
		close: "The diagram leaves the line."
	},
	{
		id: "ore",
		district: "rust",
		open: "Sound ore is reaching the forge. The road let the cart through.",
		close: "Sound ore stopped. The pit can still look finished. Something between the pit and the forge is holding the load.",
		voice: {
			who: "sera",
			open: "Sera says the forge has a parent. She does not call the parent good.",
			close: "Sera says the forge lost a parent the pit may still think it sent. Look at the road before you blame the fire."
		}
	},
	{
		id: "brick",
		district: "kiln",
		open: "The kiln is setting brick. Clay was local. The water or the dry was not.",
		close: "The kiln stops setting. A flue can look finished and still have no parent for the set.",
		voice: {
			who: "tobin",
			open: "Tobin hears the set take. He calls the flue local and the water a gallery problem.",
			close: "Tobin says the yard went quiet. Look at the parent you actually removed."
		}
	},
	{
		id: "houses",
		district: "kiln",
		open: "The kiln houses take the brick. Sleep has a parent that is not a blanket.",
		close: "The kiln houses go cold. Brick was the wall."
	},
	{
		id: "kiln-shop",
		district: "kiln",
		open: "Jun's board can buy. A license or a hole was the permit. Brick was the stock.",
		close: "Jun's board stops. Either the brick failed, or the stamp is still the parent of a legal sale."
	},
	{
		id: "kiln-levy",
		district: "kiln",
		open: "Cress can invoice the brick. Restoring the set also restored a bill.",
		close: "The brick levy has nothing to invoice. The stamp is a hole, or the set is.",
		voice: {
			who: "sera",
			open: "Sera says you restored a bill in a yard that only wanted heat.",
			close: "Sera says the bill died. She will not tell you whether the houses were worth it."
		}
	},
	{
		id: "shed",
		district: "switch",
		open: "The yard shed is a floor. Grease was the parent. Wick can stop sleeping on the plates.",
		close: "The shed goes back to being a rumor. The plates are the bed again.",
		voice: {
			who: "tobin",
			open: "Tobin says the slick was a missing parent, not weather.",
			close: "Tobin says the plates are billing again. Look at the axle, not the speech."
		}
	},
	{
		id: "yard-toll",
		district: "switch",
		open: "Rue can invoice the haul. Something is leaving, and the stamp can see it.",
		close: "The haul levy has nothing to invoice. The table is jammed, the shunt is off-book, or the stamp is a hole."
	},
	{
		id: "yard-shop",
		district: "switch",
		open: "The shed board can sell. Grease, a passing table, and a license or a hole.",
		close: "The shed board stops. Grease, the table, or the permit failed.",
		voice: {
			who: "wren",
			open: "Wren says the board is a child of the axle and the stamp, not a kindness.",
			close: "Wren says the board went dark. Count which parent you actually removed."
		}
	},
	{
		id: "charge",
		district: "pane",
		open: "The glasshouse is melting clear. Sand or cullet was one parent. Heat was the other.",
		close: "The melt stops. A flue can look finished and still have no parent for the glass.",
		voice: {
			who: "tobin",
			open: "Tobin hears the melt take. He calls the sand local and the heat a thing you had to borrow or seat.",
			close: "Tobin says the house went quiet. Look at the parent you actually removed."
		}
	},
	{
		id: "pane-houses",
		district: "pane",
		open: "The glass house takes the melt. Sleep has a parent that is not a blanket.",
		close: "The glass house goes cold. The melt was the wall."
	},
	{
		id: "pane-shop",
		district: "pane",
		open: "The glass bench can sell. A license or a hole was the permit. The melt was the stock.",
		close: "The glass bench stops. Either the melt failed, or the stamp is still the parent of a legal sale.",
		voice: {
			who: "wren",
			open: "Wren says the lens on that bench names a parent. It does not replace the one it names.",
			close: "Wren says the bench went dark. Count which parent you actually removed."
		}
	},
	{
		id: "pane-levy",
		district: "pane",
		open: "Ness can invoice the melt. Restoring the house also restored a bill.",
		close: "The glass levy has nothing to invoice. The stamp is a hole, or the melt is.",
		voice: {
			who: "sera",
			open: "Sera says you restored a bill in a house that only wanted to be clear.",
			close: "Sera says the bill died. She will not tell you whether the glass was worth it."
		}
	}
];
function seam$1(nodes, id) {
	return nodes?.find((n) => n.id === id);
}
function nodeLive$1(nodes, n, seen = /* @__PURE__ */ new Set()) {
	if (n.severed || n.integrity < 40 || n.decoy) return false;
	if (seen.has(n.id)) return true;
	seen.add(n.id);
	for (const id of n.dependsOn) {
		const parent = nodes.find((p) => p.id === id);
		if (!parent || !nodeLive$1(nodes, parent, seen)) return false;
	}
	return true;
}
function setDerived$1(n, live) {
	if (!n) return;
	n.severed = !live;
	n.integrity = live ? Math.max(n.integrity, 80) : 0;
}
function say$1(d, text) {
	d.log.unshift(text);
	if (d.log.length > 40) d.log.length = 40;
}
function holds(id, live) {
	const inc = WORLD_EDGES.filter((e) => e.to === id && e.gate !== "note");
	if (!inc.length) return false;
	if (inc.some((e) => e.gate === "block" && live[e.from])) return false;
	if (inc.some((e) => e.gate === "require" && !live[e.from])) return false;
	if (inc.some((e) => e.gate === "lack" && live[e.from])) return false;
	const alts = inc.filter((e) => e.gate === "alt");
	if (alts.length) {
		const groups = new Set(alts.map((e) => e.altGroup ?? e.id));
		for (const g of groups) if (!alts.filter((e) => (e.altGroup ?? e.id) === g).some((e) => live[e.from])) return false;
	}
	return true;
}
function derive(roots) {
	const live = { ...roots };
	const pending = new Set(WORLD_NODES.filter((n) => !n.root).map((n) => n.id));
	let guard = 0;
	while (pending.size && guard++ < 48) for (const id of [...pending]) {
		if (WORLD_EDGES.filter((e) => e.to === id && e.gate !== "note").map((e) => e.from).some((p) => live[p] === void 0)) continue;
		live[id] = holds(id, live);
		pending.delete(id);
	}
	for (const id of pending) live[id] = false;
	return live;
}
function queue(d, beat, live) {
	const line = live ? beat.open : beat.close;
	const key = `net:${beat.id}`;
	const prev = d.flags[key];
	d.flags[key] = live;
	if (d.phase !== "play") return;
	if (prev === void 0) {
		d.flags[`netBoot:${beat.id}`] = live;
		return;
	}
	if (prev === live) return;
	if (d.flags[`netSaid:${beat.id}`] === line) return;
	if (d.mapId !== beat.district) {
		d.flags[`netPend:${beat.id}`] = line;
		return;
	}
	d.flags[`netSaid:${beat.id}`] = line;
	delete d.flags[`netPend:${beat.id}`];
	say$1(d, line);
	voice(d, beat, line);
}
function flush(d) {
	if (d.phase !== "play") return;
	for (const beat of BEATS) {
		if (d.mapId !== beat.district) continue;
		const pend = d.flags[`netPend:${beat.id}`];
		if (typeof pend !== "string") continue;
		if (d.flags[`netSaid:${beat.id}`] === pend) {
			delete d.flags[`netPend:${beat.id}`];
			continue;
		}
		d.flags[`netSaid:${beat.id}`] = pend;
		delete d.flags[`netPend:${beat.id}`];
		say$1(d, pend);
		voice(d, beat, pend);
	}
}
function voice(d, beat, line) {
	const who = beat.voice;
	if (!who) return;
	const actor = d.actors[who.who];
	if (!actor?.alive || !actor.companion) return;
	const heard = line === beat.open ? who.open : line === beat.close ? who.close : "";
	if (!heard) return;
	const mark = `netVoice:${beat.id}:${line === beat.open ? "open" : "close"}`;
	if (d.flags[mark]) return;
	d.flags[mark] = true;
	say$1(d, heard);
}
function ejectAsh(d) {
	if (d.flags.ashAccess !== false || d.mapId !== "haven") return;
	const inside = (x, y) => y >= 17 && x >= 5 && x <= 11;
	if (inside(d.player.x, d.player.y) && !d.combat) {
		d.player.x = 8;
		d.player.y = 15;
		if (d.phase === "play") say$1(d, "The alley stops being a way. You step back into the ward.");
	}
	for (const a of Object.values(d.actors)) if (a.mapId === "haven" && inside(a.x, a.y)) {
		a.x = 9;
		a.y = 15;
	}
}
function blank() {
	return {
		water: 0,
		heat: 0,
		power: 0,
		food: 0,
		security: 0,
		commerce: 0,
		transport: 0,
		danger: 0
	};
}
function readings(live, d) {
	const sinks = blank();
	sinks.water = live.pressure ? live.clean ? 100 : live.stamped ? 55 : 30 : 0;
	sinks.security = live.watch ? 70 : live.bellows ? 45 : 25;
	sinks.transport = d.flags.plateStair ? live.watch ? 20 : 70 : 10;
	sinks.danger = live.bellows ? 15 : 40;
	const haven = blank();
	haven.water = sinks.water && live.stall ? Math.min(100, sinks.water) : live.pressure ? 20 : 0;
	if (!live.stall && live.clinic) haven.water = live.clean ? 70 : sinks.water ? 35 : 0;
	haven.food = live.food ? 100 : live.ration ? 35 : 0;
	haven.commerce = live.shop ? 80 : 10;
	haven.security = live.watch ? 55 : live.ash ? 25 : 60;
	haven.transport = live.moving ? 50 : 15;
	haven.danger = live.ash ? 50 : 15;
	const quarry = blank();
	quarry.transport = live.moving ? 80 : live.colossus ? 40 : 15;
	quarry.danger = live["chute-spill"] ? 60 : d.flags.quarryStone === "hung" ? 45 : 20;
	quarry.commerce = live.ore ? 60 : 10;
	quarry.power = live.colossus ? 50 : 0;
	const rust = blank();
	rust.water = live.quench ? 60 : 0;
	rust.heat = live.heat ? live.guild && live.sleepers ? 100 : 55 : 0;
	rust.food = live.ration ? 45 : 0;
	rust.commerce = live.gear ? 85 : 15;
	rust.transport = live.moving ? 75 : 10;
	rust.danger = live.heat ? 15 : 40;
	const citadel = blank();
	citadel.power = live.power ? 100 : live.siphon || live.orrery ? 30 : 0;
	citadel.food = live.fed ? 70 : 10;
	citadel.security = live.toll ? 35 : live.loose ? 30 : 75;
	citadel.transport = live.supply ? 70 : 15;
	citadel.danger = live.loose ? 55 : live.power ? 20 : 40;
	const road = blank();
	road.power = live.lamps ? 80 : 0;
	road.transport = live.moving ? live.dark ? 25 : 80 : live.dark ? 10 : 40;
	road.danger = live.dark ? 70 : live.watch ? 50 : 20;
	road.food = live.supply ? 30 : 0;
	const kiln = blank();
	kiln.water = live.pressure ? 60 : live["field-dry"] ? 25 : 0;
	kiln.heat = live["kiln-bed"] ? 80 : 0;
	kiln.food = live.houses ? 40 : 10;
	kiln.commerce = live["kiln-shop"] ? 80 : live.brick ? 25 : 8;
	kiln.security = live["kiln-levy"] ? 40 : 55;
	kiln.transport = live.brick ? 50 : 15;
	kiln.danger = live["stamp-gone"] ? 35 : 12;
	const yard = blank();
	yard.transport = live["switch-open"] ? live.moving ? 80 : 40 : 10;
	yard.commerce = live["yard-shop"] ? 75 : live["yard-toll"] ? 30 : 8;
	yard.security = live["yard-toll"] ? 45 : 20;
	yard.danger = live["switch-open"] ? 12 : 35;
	yard.food = live.shed ? 30 : 8;
	const pane = blank();
	pane.heat = live["pane-bed"] ? 80 : 0;
	pane.commerce = live["pane-shop"] ? 75 : live.charge ? 25 : 8;
	pane.security = live["pane-levy"] ? 40 : 55;
	pane.food = live["pane-houses"] ? 30 : 8;
	pane.danger = live["pane-cut"] ? 35 : live["pane-bed"] ? 18 : 10;
	return {
		sinks,
		haven,
		quarry,
		rust,
		citadel,
		road,
		kiln,
		switch: yard,
		pane
	};
}
function observe(d, live) {
	if (!Boolean(d.flags.pumpFate || d.flags.seenWard || d.flags.seenQuarry || d.flags.citadelFate || d.flags.citadelOpen || d.flags.toldWren || d.flags.plotsRefused || d.flags.stockRefused || d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred" || d.flags.bellowsLive === false)) return;
	const bits = [];
	if (d.flags.bellowsLive === false) bits.push("The bellows is stopped. Pressure downstream is a child of that lung.");
	else if (d.flags.reedRead) bits.push("The bellows is a parent of gallery pressure. A seated pump can still be dry without it.");
	if (d.flags.pumpFate || d.flags.seenWard) {
		if (live.food) bits.push("The plots are drinking seated water. Food has a parent.");
		else if (live.pressure && !live.clean) bits.push("Pressure is up. The plots will not take water that is not seated.");
		else bits.push("The plots have no seated parent.");
		if (live.levy) bits.push("A levy can ride that food. Restoring the beds restored a bill.");
		if (d.flags.plotsRefused) bits.push("The bed was refused. The water can be clean and the plots still lie.");
		if (!live.income) bits.push("Nessa has no wage from the stall.");
		else bits.push("Nessa's wage is a child of the stall leg.");
		if (live.ash) bits.push("The service alley is open. It closes when the ward is fed.");
		if (!live.care) bits.push("The clinic tap is not a parent of care right now.");
	}
	if (d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred" || d.flags.seenQuarry) {
		if (live.ore) bits.push("Sound ore is moving. The colossus is still in the cable, and the chute is holding.");
		else if (live.moving && !live.colossus) bits.push("Stone is on the road. The colossus is not breathing, so the forge will not call the ore sound.");
		else if (live["chute-spill"]) bits.push("The chute grade is cut. Ore spills before it can parent a forge.");
		else bits.push("Ore is not leaving the pit.");
	}
	if (live.gear) bits.push("Rust stock is live. It consumes quench from the gallery, ore from the pit, and fire from the bed.");
	else if (d.flags.stockRefused) bits.push("The forge parents can be healthy. The stock was refused.");
	else if (live.quench && live.heat && !live.ore) bits.push("The forge has fire and quench, and no sound ore.");
	if (live.ration) bits.push("Rust is baking a ration because the ward is hungry and the hall is warm.");
	if (live.supply) bits.push("Citadel stores are taking the road.");
	else if (live.hoard && live.moving) bits.push("Bram is holding the cart. The citadel does not get that load.");
	if (live.toll) bits.push("Citadel plate is unfed. The toll is a missing meal.");
	if (live.dark) bits.push("The road lamps are dark. They drink from the orrery.");
	else if (live.lamps && (d.flags.citadelFate || d.flags.seenCitadel)) bits.push("The road lamps are a child of the orrery.");
	if (live.loose) bits.push("The sentry has no hour. The clock stopped.");
	if (live.workers) bits.push("The quarry line has the bellows diagram.");
	if (d.flags["seen:kiln"] || d.flags.kilnRefused || d.flags.fieldDry) {
		if (live.brick) bits.push("The kiln is setting brick. Clay was local. The set had water or a field-dry.");
		else if (d.flags.kilnRefused) bits.push("The kiln bed was refused. A levy cannot invoice a bed that was left down.");
		else if (live["kiln-bed"] && !live.pressure && !live["field-dry"]) bits.push("The kiln has a bed and no set. Gallery water is still a parent, or a field-dry is.");
		else bits.push("The kiln is not setting. Look at clay, the bed, and what the set drinks.");
		if (live["kiln-levy"]) bits.push("A brick levy is riding that set. The stamp is still intact.");
		if (live["kiln-shop"]) bits.push("Jun's board can buy. The permit was a license or a hole.");
		else if (live.brick) bits.push("Brick is real and the board is not. The stamp is still parenting the sale.");
	}
	if (d.flags["seen:switch"] || d.flags.switchJam || d.flags.switchGreased || d.flags.switchShunt) {
		if (!live["switch-open"]) bits.push("The Switch table is jammed. A busy pit is not a parent of the citadel.");
		else if (d.flags.switchShunt) bits.push("The haul is leaving on a shunt. The stamp is not allowed to see it.");
		else bits.push("The Switch table is passing weight. Jam, shunt, and stamp are different parents.");
		if (live["yard-toll"]) bits.push("A haul levy is riding the books. The stamp can see the weight.");
		if (live.shed) bits.push("The yard shed is a floor. Grease was the parent.");
		else if (d.flags["seen:switch"]) bits.push("The yard plates are still slick. Grease is local. Boots are not the shed.");
		if (live["yard-shop"]) bits.push("The shed board can sell. The permit was a license or a hole.");
	}
	if (d.flags["seen:pane"] || d.flags.paneRefused || d.flags.paneCullet || d.flags.paneBorrowed) {
		if (live.charge) bits.push("The glasshouse is melting clear. Sand or cullet was one parent. Heat was the other.");
		else if (d.flags.paneRefused) bits.push("The glass bed was refused. A levy cannot invoice a bed that was left down.");
		else if (live["pane-bed"] && !live.sand && !live.cullet) bits.push("The glasshouse has a bed and nothing to melt. The pit can be seated again, or cullet can stand in.");
		else bits.push("The glasshouse is not melting. Look at sand, cullet, and which heat you actually seated.");
		if (live["pane-levy"]) bits.push("A glass levy is riding that melt. The stamp is still intact.");
		if (live["pane-shop"]) bits.push("The glass bench can sell. The permit was a license or a hole.");
		else if (live.charge) bits.push("The melt is real and the bench is not. The stamp is still parenting the sale.");
	}
	const text = bits.join(" ");
	const hit = d.journal.find((j) => j.id === "network");
	if (hit) {
		hit.title = "The city is one machine";
		hit.text = text;
		hit.status = "open";
	} else d.journal.push({
		id: "network",
		title: "The city is one machine",
		text,
		status: "open"
	});
}
function syncMachines(d, live) {
	const plots = d.machines.plots;
	if (plots) {
		setDerived$1(seam$1(plots.nodes, "inlet"), live.inlet);
		const bed = seam$1(plots.nodes, "bed");
		if (d.flags.plotsRefused && bed) {
			bed.severed = true;
			bed.integrity = 0;
		}
	}
	const forge = d.machines.forge;
	if (forge) {
		setDerived$1(seam$1(forge.nodes, "ore"), live.ore);
		setDerived$1(seam$1(forge.nodes, "quench"), live.quench);
		setDerived$1(seam$1(forge.nodes, "fire"), live.heat);
		const stock = seam$1(forge.nodes, "stock");
		if (d.flags.stockRefused && stock) {
			stock.severed = true;
			stock.integrity = 0;
		}
	}
	const chute = d.machines.chute;
	if (chute) setDerived$1(seam$1(chute.nodes, "lip"), Boolean(live.moving));
	const lamps = d.machines.lamps;
	if (lamps) setDerived$1(seam$1(lamps.nodes, "feed"), Boolean(live.power));
}
/** Facts already reconciled, then the city-sized graph. Same history, same network. */
function reconcileNetwork(d) {
	if (d.mapId) d.flags[`seen:${d.mapId}`] = true;
	const reed = seam$1(d.machines.bellows?.nodes, "reed");
	if (reed?.revealed) d.flags.reedRead = true;
	const feed = seam$1(d.machines.head?.nodes, "feed");
	const bed = seam$1(d.machines.plots?.nodes, "bed");
	const grade = seam$1(d.machines.chute?.nodes, "grade");
	const glass = seam$1(d.machines.lamps?.nodes, "glass");
	const siphon = seam$1(d.machines.crucible?.nodes, "siphon");
	const drive = seam$1(d.machines.orrery?.nodes, "drive");
	const throat = seam$1(d.machines.colossus?.nodes, "throat");
	const firebed = seam$1(d.machines.hearth?.nodes, "bed");
	const fire = d.machines.kilnfire;
	const clay = seam$1(fire?.nodes, "clay");
	const local = seam$1(fire?.nodes, "bed");
	const borrowNode = seam$1(fire?.nodes, "borrow");
	const heatUp = firebed ? nodeLive$1(d.machines.hearth.nodes, firebed) : false;
	if (borrowNode && d.flags.kilnBorrowed) {
		borrowNode.severed = !heatUp || d.flags.kilnRefused === true;
		borrowNode.integrity = borrowNode.severed ? 0 : 100;
		if (!borrowNode.severed) borrowNode.revealed = true;
	}
	if (d.flags.kilnRefused === true && local) {
		local.severed = true;
		local.integrity = 0;
	}
	const stamp = seam$1(d.machines.kilnstamp?.nodes, "claim");
	const yardDesk = d.machines.switchdesk;
	const yardClaim = seam$1(yardDesk?.nodes, "claim");
	const yardTable = d.machines.turntable;
	const yardAxle = seam$1(yardTable?.nodes, "axle");
	const yardGrease = seam$1(yardTable?.nodes, "grease");
	const yardShunt = seam$1(yardTable?.nodes, "shunt");
	if (yardAxle) {
		const seated = d.flags.switchJam !== true || d.flags.switchShunt === true;
		yardAxle.severed = d.flags.switchJam === true && d.flags.switchShunt !== true;
		yardAxle.integrity = yardAxle.severed ? 0 : 100;
		if (seated) yardAxle.revealed = true;
	}
	if (yardGrease) {
		yardGrease.severed = d.flags.switchGreased !== true;
		yardGrease.integrity = yardGrease.severed ? 0 : 100;
	}
	if (yardShunt) {
		yardShunt.severed = d.flags.switchShunt !== true;
		yardShunt.integrity = yardShunt.severed ? 0 : 100;
		if (!yardShunt.severed) yardShunt.revealed = true;
	}
	const paneFire = d.machines.panefire;
	const paneSand = seam$1(paneFire?.nodes, "sand");
	const paneLocal = seam$1(paneFire?.nodes, "bed");
	const paneBorrow = seam$1(paneFire?.nodes, "borrow");
	const paneClaim = seam$1(d.machines.panestamp?.nodes, "claim");
	if (paneSand && d.flags.paneSpilled === true) {
		paneSand.severed = true;
		paneSand.integrity = 0;
	}
	const localBed = Boolean(local && fire && nodeLive$1(fire.nodes, local));
	const borrowed = Boolean(borrowNode && fire && nodeLive$1(fire.nodes, borrowNode));
	const kilnHeat = Boolean((localBed || borrowed) && d.flags.kilnRefused !== true);
	if (paneBorrow && d.flags.paneBorrowed) {
		paneBorrow.severed = !kilnHeat || d.flags.paneRefused === true;
		paneBorrow.integrity = paneBorrow.severed ? 0 : 100;
		if (!paneBorrow.severed) paneBorrow.revealed = true;
	}
	if (d.flags.paneRefused === true && paneLocal) {
		paneLocal.severed = true;
		paneLocal.integrity = 0;
	}
	const paneBedLive = Boolean(paneLocal && paneFire && nodeLive$1(paneFire.nodes, paneLocal) && d.flags.paneRefused !== true);
	const paneBorrowLive = Boolean(paneBorrow && paneFire && nodeLive$1(paneFire.nodes, paneBorrow) && d.flags.paneRefused !== true);
	const goods = String(d.flags.wardGoods ?? "none");
	const live = derive({
		bellows: reed ? nodeLive$1(d.machines.bellows.nodes, reed) : true,
		pressure: feed ? nodeLive$1(d.machines.head.nodes, feed) : false,
		clean: goods === "clean",
		stamped: goods === "stamped",
		stall: d.flags.wardMarket === true,
		clinic: d.flags.wardClinic === true,
		"bed-open": Boolean(bed && !bed.severed && d.flags.plotsRefused !== true),
		watch: d.flags.roadWatch === true,
		moving: d.flags.stoneMoving === true,
		colossus: throat ? nodeLive$1(d.machines.colossus.nodes, throat) : true,
		heat: firebed ? nodeLive$1(d.machines.hearth.nodes, firebed) : false,
		guild: d.flags.guildWarm === true,
		sleepers: d.flags.tenementWarm === true,
		siphon: Boolean(siphon && d.machines.crucible && nodeLive$1(d.machines.crucible.nodes, siphon) && d.flags.citadelFate !== "sever"),
		orrery: drive ? nodeLive$1(d.machines.orrery.nodes, drive) : false,
		"citadel-open": Boolean(d.flags.citadelOpen || d.flags.citadelFate || d.flags.seenCitadel),
		told: d.flags.toldWren === true,
		"plots-refused": d.flags.plotsRefused === true,
		"stock-refused": d.flags.stockRefused === true,
		"wash-spill": d.flags.washSpill === true,
		"chute-spill": Boolean(grade?.severed),
		"lamp-dark": Boolean(glass?.severed),
		hoard: d.flags.bramHoard === true,
		"cart-pin": d.flags.cartPinned === true,
		clay: clay ? nodeLive$1(d.machines.kilnfire.nodes, clay) : false,
		"kiln-bed": Boolean(localBed && d.flags.kilnRefused !== true || borrowed && d.flags.kilnRefused !== true),
		"kiln-refused": d.flags.kilnRefused === true,
		"field-dry": d.flags.fieldDry === true,
		"kiln-stamp": stamp ? nodeLive$1(d.machines.kilnstamp.nodes, stamp) : false,
		licensed: d.flags.kilnLicensed === true,
		"stamp-gone": Boolean(stamp?.severed),
		"switch-open": d.flags.switchJam !== true || d.flags.switchShunt === true,
		"on-books": d.flags.switchJam !== true && d.flags.switchShunt !== true,
		grease: d.flags.switchGreased === true,
		"yard-stamp": Boolean(yardClaim && yardDesk && nodeLive$1(yardDesk.nodes, yardClaim)),
		"yard-licensed": d.flags.switchLicensed === true,
		"yard-cut": Boolean(yardClaim?.severed),
		sand: Boolean(paneSand && paneFire && nodeLive$1(paneFire.nodes, paneSand)),
		"pane-bed": Boolean(paneBedLive || paneBorrowLive),
		"pane-refused": d.flags.paneRefused === true,
		cullet: d.flags.paneCullet === true,
		"pane-stamp": Boolean(paneClaim && d.machines.panestamp && nodeLive$1(d.machines.panestamp.nodes, paneClaim)),
		"pane-licensed": d.flags.paneLicensed === true,
		"pane-cut": Boolean(paneClaim?.severed)
	});
	syncMachines(d, live);
	if (live.shop) d.flags.shopEver = true;
	d.flags.foodLive = live.food;
	d.flags.levyLive = live.levy;
	d.flags.ashAccess = live.ash;
	d.flags.nessaSells = live.shop;
	d.flags.nessaRefuses = !live.shop && d.flags.shopEver === true;
	d.flags.clinicCare = live.care;
	d.flags.oreSound = live.ore;
	d.flags.quenchLive = live.quench;
	d.flags.gearLive = live.gear;
	d.flags.rustRation = live.ration;
	d.flags.citadelSupplied = live.supply;
	d.flags.guardFed = live.fed;
	d.flags.guardToll = live.toll;
	d.flags.citadelPower = live.power;
	d.flags.roadLamps = live.lamps;
	d.flags.roadDark = live.dark;
	d.flags.sentryLoose = live.loose;
	d.flags.workersKnow = live.workers;
	d.flags.brickLive = live.brick;
	d.flags.kilnHouses = live.houses;
	d.flags.kilnShop = live["kiln-shop"];
	d.flags.kilnLevy = live["kiln-levy"];
	d.flags.stampCut = Boolean(stamp?.severed);
	d.flags.switchShed = live.shed;
	d.flags.switchToll = live["yard-toll"];
	d.flags.switchShop = live["yard-shop"];
	d.flags.switchCut = Boolean(yardClaim?.severed);
	d.flags.paneCharge = live.charge;
	d.flags.paneHouses = live["pane-houses"];
	d.flags.paneShop = live["pane-shop"];
	d.flags.paneLevy = live["pane-levy"];
	d.flags.paneCut = Boolean(paneClaim?.severed);
	d.flags.paneBed = live["pane-bed"];
	d.flags.foodPrice = live.food ? 6 : live.ration ? 9 : 0;
	d.flags.gearPrice = live.gear ? 18 : 0;
	for (const beat of BEATS) queue(d, beat, Boolean(live[beat.id]));
	flush(d);
	ejectAsh(d);
	d.world = {
		live,
		districts: readings(live, d)
	};
	observe(d, live);
}
/** Starting loadout. Filled once. A later equip is the player's, and reconcile will not take it back. */
var PROFILES = {
	tobin: {
		habit: "brace",
		kit: {
			weapon: "prybar",
			armor: "wrap",
			accessory: "strap"
		}
	},
	wren: {
		habit: "pin",
		kit: {
			weapon: "hook",
			armor: null,
			accessory: "glass"
		}
	},
	sera: {
		habit: "cover",
		kit: {
			weapon: "fist",
			armor: "vest",
			accessory: null
		}
	},
	mara: {
		habit: "read",
		kit: {
			weapon: "prybar",
			armor: "wrap",
			accessory: "glass"
		}
	},
	cinder: {
		habit: "press",
		kit: {
			weapon: "bite",
			armor: null,
			accessory: null
		}
	}
};
var BOND = () => ({
	trust: 40,
	respect: 40,
	fear: 10,
	accord: 50,
	loyalty: 35
});
function clamp(n) {
	return Math.max(0, Math.min(100, Math.round(n)));
}
function say(d, text) {
	d.log.unshift(text);
	if (d.log.length > 40) d.log.length = 40;
}
function nearPlayer(d, a) {
	if (a.mapId !== d.mapId) return false;
	return Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 5;
}
function remember(a, id, delta, line, d) {
	if (!a.memories) a.memories = [];
	if (!a.bond) a.bond = BOND();
	if (a.memories.includes(id)) return;
	a.memories.push(id);
	const b = a.bond;
	if (delta.trust) b.trust = clamp(b.trust + delta.trust);
	if (delta.respect) b.respect = clamp(b.respect + delta.respect);
	if (delta.fear) b.fear = clamp(b.fear + delta.fear);
	if (delta.accord) b.accord = clamp(b.accord + delta.accord);
	if (delta.loyalty) b.loyalty = clamp(b.loyalty + delta.loyalty);
	if (!a.companion || d.phase !== "play" || !nearPlayer(d, a)) return;
	say(d, line);
}
function facts(d, a) {
	if (a.id === "tobin") {
		if (d.flags.foodLive) remember(a, "plots-fed", {
			trust: 6,
			respect: 4,
			accord: 8
		}, "Tobin counts the plots. Food has a parent. So does the levy.", d);
		if (d.flags.bellowsLive === false) remember(a, "lung-cut", {
			accord: -8,
			fear: 4
		}, "Tobin looks at the stopped bellows and does not agree. He stays.", d);
		if (d.flags.varrFate === "dead") remember(a, "varr-dead", {
			fear: 6,
			loyalty: 4
		}, "Tobin hears that Varr is gone. He keeps the step he already had.", d);
		if (d.flags.citadelFate === "seize") remember(a, "standard-kept", {
			accord: -10,
			fear: 6
		}, "Tobin hears the standard is yours now. He walks, and he does not agree.", d);
		if (d.flags.brickLive) remember(a, "brick-set", {
			respect: 4,
			accord: 4
		}, "Tobin counts the kiln. The set has a parent that was not the clay.", d);
		if (d.flags.kilnRefused) remember(a, "kiln-refused", { accord: -4 }, "Tobin looks at the refused yard and does not call the quiet a fix.", d);
		if (d.flags.switchJam && !d.flags.switchShunt) remember(a, "switch-jam", {
			respect: 4,
			accord: -4
		}, "Tobin says the pit can look busy and still send nothing. He stays.", d);
		if (d.flags.paneCharge) remember(a, "pane-melt", {
			respect: 4,
			accord: 4
		}, "Tobin counts the glasshouse. The melt has a parent that was not the sand alone.", d);
		if (d.flags.paneRefused) remember(a, "pane-refused", { accord: -4 }, "Tobin looks at the refused house and does not call the quiet a fix.", d);
	}
	if (a.id === "sera") {
		if (d.flags.stockRefused) remember(a, "stock-refused", {
			accord: 10,
			respect: 4
		}, "Sera notes the stock that was refused. The parents are still standing.", d);
		if (d.flags.gearLive) remember(a, "gear-live", {
			accord: -6,
			respect: 2
		}, "Sera hears the forge turning stock. She does not leave.", d);
		if (d.flags.citadelFate === "seize") remember(a, "citadel-seize", {
			fear: 15,
			accord: -12,
			loyalty: -4
		}, "Sera hears you took the standard. She is afraid, and she is still here.", d);
	}
	if (a.id === "wren") {
		if (d.flags.toldWren) remember(a, "told-wren", {
			trust: 8,
			respect: 6
		}, "Wren has the diagram. She will carry it.", d);
		if (d.flags.workerHurt) remember(a, "worker-hurt", {
			respect: -6,
			accord: -4
		}, "Wren counts the rigger the stone took.", d);
		if (d.flags.roadDark) remember(a, "dark-road", { respect: 4 }, "Wren says the lamps were a child. The dark is not a new city.", d);
		if (d.flags.switchShunt) remember(a, "switch-shunt", {
			respect: 6,
			accord: 4
		}, "Wren counts the shunt. The haul left without asking the stamp.", d);
		if (d.flags.switchGreased) remember(a, "switch-grease", { trust: 4 }, "Wren says the slick was an axle, not weather.", d);
		if (d.flags.waybillRead) remember(a, "waybill", { respect: 4 }, "Wren has the waybill in the sentence. The cart and the table were one refusal.", d);
		if (d.flags.paneCullet) remember(a, "pane-cullet", {
			respect: 6,
			accord: 4
		}, "Wren counts the cullet. The pit was not asked.", d);
		if (d.flags.paneGlass) remember(a, "pane-glass", { respect: 6 }, "Wren says the lamp glass was made in a house, not issued by the clock.", d);
	}
	if (a.id === "cinder") {
		if (d.flags.cinderFed) remember(a, "fed", {
			trust: 12,
			loyalty: 8
		}, "The moth counted the scrap. Hunger was the parent she was waiting on.", d);
		if (d.flags.foodLive) remember(a, "plots-range", {
			trust: 6,
			accord: 6
		}, "The moth ranges. The plots are feeding, and she treats that as weather.", d);
		if (d.flags.bellowsLive === false) remember(a, "lung-restless", {
			fear: 8,
			accord: -4
		}, "The moth will not settle. The reed she nested on is stopped.", d);
		if (d.flags.roadDark) remember(a, "dark-hesitate", { fear: 8 }, "The moth stops at the dark. She does not call the stopping courage.", d);
	}
	if (a.id === "mara") {
		if (d.flags.gearLive) remember(a, "gear-hum", {
			accord: -4,
			fear: 2
		}, "Mara hears the forge. The hum she keeps is not the same hum.", d);
		if (d.flags.stockRefused) remember(a, "stock-quiet", {
			trust: 4,
			accord: 6
		}, "Mara notes the stock that was refused. The hall is quieter.", d);
	}
}
var TOBIN_MEMORY = {
	"plots-fed": "He still counts the plots before he counts the levy.",
	"lung-cut": "He will not touch a stopped lung as if the work were finished.",
	"varr-dead": "He heard Varr is gone. He kept the step he already had.",
	"standard-kept": "He walks. He does not agree about the standard.",
	"brick-set": "He still counts which parent the kiln actually seated.",
	"kiln-refused": "He will not call a refused yard a finished quiet.",
	"switch-jam": "He says a busy pit can still send nothing.",
	"pane-melt": "He still counts which parent the glasshouse actually seated.",
	"pane-refused": "He will not call a refused house a finished quiet."
};
var WREN_MEMORY = {
	"told-wren": "She is still carrying the diagram. It is not a leash.",
	"worker-hurt": "She counts the rigger the stone took. She does not sand the name.",
	"dark-road": "She says the lamps were a child. The dark is not a new city.",
	"switch-shunt": "She counts the shunt. The stamp did not get a vote.",
	"switch-grease": "She says the slick was an axle.",
	waybill: "She keeps the cart and the table in one sentence.",
	"pane-cullet": "She counts the cullet. The pit did not get a vote.",
	"pane-glass": "She says the lamp glass was made, not issued."
};
var SERA_MEMORY = {
	"stock-refused": "She saw the stock refused and the parents left standing.",
	"gear-live": "She hears the forge turning stock. She has not left.",
	"citadel-seize": "She is afraid of the standard in your hand. She is still here."
};
var MARA_MEMORY = {
	"gear-hum": "The forge is not the hum she keeps.",
	"stock-quiet": "The hall is quieter when the stock is refused."
};
/** What they are doing. Not a grade, and not a friendship meter. */
function companyLines(d, a) {
	if (a.id === "cinder") return cinderLines(d, a);
	const book = a.id === "tobin" ? TOBIN_MEMORY : a.id === "wren" ? WREN_MEMORY : a.id === "sera" ? SERA_MEMORY : a.id === "mara" ? MARA_MEMORY : {};
	const lines = (a.memories ?? []).map((id) => book[id]).filter((line) => Boolean(line));
	if (a.id === "tobin" && d.flags.reedRead && d.flags.bellowsLive !== false) lines.push("He pauses beside a seated lung before he speaks.");
	if (a.id === "tobin" && d.flags.dossShift) lines.push("He noticed Doss left the reed. He has not turned it into a speech.");
	if (a.id === "wren" && d.flags.bellowsLive === false) lines.push("You stopped the lung once. She knows what quiet does downstream.");
	if (a.id === "wren" && d.flags.pipShown) lines.push("She watches drips the way the child did.");
	if (a.id === "sera" && d.flags.stockRefused && d.mapId === "rust") lines.push("She stops at the forge and does not put a hand on the stock.");
	if (a.id === "sera" && d.flags.guardToll && d.flags.sarnMet) lines.push("She will not let you call the citadel doorway a law. She heard it called a meal.");
	if (a.id === "mara" && d.flags.tenementWarm && !d.flags.guildWarm) lines.push("She keeps the nights where the beds are, not where the hall is.");
	if (!lines.length) {
		if (a.id === "tobin") lines.push("He walks like the bench is still his.");
		else if (a.id === "wren") lines.push("She walks the lines. She has not been made to perform them.");
		else if (a.id === "sera") lines.push("She is watching which child you mean.");
		else if (a.id === "mara") lines.push("She keeps the nights. She did not ask to be saved from them.");
		else lines.push(`${a.name} is walking. That is the fact.`);
	}
	return lines.slice(0, 4);
}
function cinderLines(d, a) {
	const lines = [];
	if (d.flags.cinderLeft && !a.companion) lines.push("Cinder left the shadow. She is on the reed.");
	else if (d.flags.cinderBack && a.companion) lines.push("Cinder came back.");
	else if (a.companion) lines.push("Cinder chose a shadow. Nobody assigned it.");
	else if (d.flags.cinderFed) lines.push("Cinder ate. She has not chosen a perch.");
	else lines.push("Cinder watches the lung. Hunger is visible. A leash is not.");
	if (d.flags.roadDark && !d.flags.cinderDarkOk) lines.push("Cinder will not cross the dark road.");
	else if (d.flags.cinderDarkOk && d.flags.roadDark) lines.push("Cinder crossed the dark. She did not call it safe.");
	if (d.flags.bellowsLive === false) lines.push("Cinder will not call the stopped reed a nest.");
	else lines.push("Cinder follows the reed water.");
	if (d.flags.dossShift) lines.push("Cinder does not visit the empty reed.");
	if (d.flags.foodLive) lines.push("Cinder ranges where the plots are feeding.");
	if (d.flags.gearLive) lines.push("Cinder flinches at the forge.");
	if (d.flags.hollowWarm && d.flags.tundraWalked) lines.push("Cinder slept near the warm hollow.");
	else if (d.flags.tundraWalked && d.flags.hollowWarm === false) lines.push("Cinder will not enter the cold hollow.");
	return lines.slice(0, 4);
}
function ensureCompanions(d) {
	for (const id of Object.keys(PROFILES)) {
		const a = d.actors[id];
		const profile = PROFILES[id];
		if (!a || !profile) continue;
		if (!a.habit) a.habit = profile.habit;
		if (!a.kit) a.kit = { ...profile.kit };
		if (!a.bond) a.bond = BOND();
		if (!a.memories) a.memories = [];
		facts(d, a);
	}
}
/** Where the moth lives when she has not chosen a shadow. She can leave. She can come back. The choosing stays hers. */
function placeCreature(d) {
	const c = d.actors.cinder;
	if (!c || !c.alive || d.combat) return;
	if (c.companion && !d.flags.cinderLeft && d.flags.cinderRisk && !d.flags.cinderKept && rustHeat(d) && d.flags.bellowsLive === false && (c.bond?.fear ?? 0) >= 16) d.flags.cinderLeft = true;
	if (d.flags.cinderLeft) {
		c.companion = false;
		c.mapId = "sinks";
		c.x = 30;
		c.y = 3;
		c.home = {
			mapId: "sinks",
			x: 30,
			y: 3
		};
		if (d.phase === "play" && !d.flags.cinderLeftSaid) {
			d.flags.cinderLeftSaid = true;
			say(d, "The moth leaves the shadow. The forge is a predator and the reed is stopped. She does not ask you to agree.");
			play("moth");
		}
		const lung = d.flags.bellowsLive !== false;
		const near = d.mapId === "sinks" && Math.abs(d.player.x - 30) + Math.abs(d.player.y - 3) <= 2;
		if (lung && d.flags.cinderFed && near && !d.dialogue) {
			c.companion = true;
			d.flags.cinderLeft = false;
			d.flags.cinderBack = true;
			if (d.phase === "play") {
				say(d, "The reed is breathing. She steps onto the shadow again. You did not assign the second choosing.");
				play("moth");
			}
			mothWeather(d, c);
		}
		return;
	}
	if (c.companion) {
		if (d.phase === "play" && !d.dialogue && d.mapId === "rust" && rustHeat(d) && d.flags.bellowsLive === false && !d.flags.cinderHeatAsked && !d.flags.cinderKept && (c.bond?.fear ?? 0) >= 16) {
			d.flags.cinderHeatAsked = true;
			d.dialogue = {
				convo: "cinder-heat",
				node: "start"
			};
			d.panel = "none";
			d.path = [];
		}
		mothWeather(d, c);
		return;
	}
	if (d.flags.cinderSpireStay) {
		c.companion = false;
		c.mapId = "road";
		c.x = 20;
		c.y = 12;
		c.home = {
			mapId: "road",
			x: 20,
			y: 12
		};
		return;
	}
	const want = d.flags.foodLive && d.flags.cinderFed ? "haven" : "sinks";
	if (d.flags.cinderWhere === want && c.mapId === want) return;
	const prev = d.flags.cinderWhere;
	d.flags.cinderWhere = want;
	c.mapId = want;
	c.home = want === "haven" ? {
		mapId: "haven",
		x: 31,
		y: 3
	} : {
		mapId: "sinks",
		x: 30,
		y: 3
	};
	c.x = c.home.x;
	c.y = c.home.y;
	if (prev && prev !== want && d.phase === "play") {
		say(d, want === "haven" ? "The moth is gone from the reed. The plots are feeding, and she went where the food is." : "The moth is back on the reed. The plots are not a place she will sleep.");
		play("moth");
	}
}
function rustHeat(d) {
	return Boolean(d.flags.gearLive || d.flags.tenementWarm || d.flags.guildWarm);
}
function mothWeather(d, c) {
	if (!c.companion) return;
	const bits = [];
	if (d.flags.bellowsLive === false) bits.push("The reed is stopped. A pump can still look seated. She will not call the nest seated.");
	else bits.push("She lands on the reed, not the valve. The child can fail while the home is still breathing.");
	if (d.flags.foodLive) bits.push("The plots are a meal. The levy on the same pipe is invisible to her.");
	else if (d.flags.pumpFate || d.flags.plotsRefused) bits.push("She will not settle on a dry bed. The hunger is a child of something upstream.");
	if (d.flags.roadDark) bits.push("Dark is territory. The glass is only the reason the territory opened.");
	if (d.flags.gearLive) bits.push("The forge is predator-noise. Working is not the same word as safe.");
	if (d.flags.hollowWarm && d.mapId === "tundra") bits.push("The hollow is warm because a clock elsewhere is still a parent.");
	const text = bits.join(" ");
	const hit = d.journal.find((j) => j.id === "moth-weather");
	if (!hit) d.journal.push({
		id: "moth-weather",
		title: "What the moth knows",
		text,
		status: "open"
	});
	else if (hit.text !== text) {
		hit.text = text;
		hit.status = "open";
	}
	const here = d.mapId === "sinks" ? "moth:reed" : d.mapId === "haven" ? "moth:plots" : d.mapId === "road" && d.flags.roadDark ? "moth:dark" : d.mapId === "rust" && d.flags.gearLive ? "moth:heat" : d.mapId === "tundra" ? "moth:hollow" : "";
	if (!here || d.flags[here] || d.phase !== "play" || d.dialogue) return;
	d.flags[here] = true;
	say(d, here === "moth:reed" ? "The moth settles on the reed, not the valve. Audit can name a pipe. She is naming a home." : here === "moth:plots" ? d.flags.foodLive ? "The moth ranges over the plots. She does not look at the levy." : "The moth will not land on the plots. The bed is not the parent she wants." : here === "moth:dark" ? "The moth stops. The dark is a territory. The missing glass is only why." : here === "moth:heat" ? "The moth flinches at the forge. The noise is a predator, not a product." : d.flags.hollowWarm ? "The moth circles the hollow. Warmth here is a child of a clock, not of the ice." : "The moth will not go into the hollow. Its parent stopped sending weather.");
	play("moth");
}
function rowQty(d, id) {
	return d.inventory.find((i) => i.id === id)?.qty ?? 0;
}
function put(d, id) {
	const row = d.inventory.find((i) => i.id === id);
	if (row) row.qty += 1;
	else d.inventory.push({
		id,
		qty: 1,
		condition: ITEMS[id]?.condition ?? 100
	});
}
function pull(d, id) {
	const row = d.inventory.find((i) => i.id === id);
	if (!row) return;
	row.qty -= 1;
	if (row.qty <= 0) d.inventory = d.inventory.filter((i) => i.id !== id);
}
function equipCompanion(d, id, slot, itemId) {
	const a = d.actors[id];
	if (!a?.companion || !a.kit) return false;
	const kind = slot === "weapon" ? "weapon" : slot === "armor" ? "armor" : "accessory";
	const prev = slot === "weapon" ? a.kit.weapon : slot === "armor" ? a.kit.armor : a.kit.accessory;
	if (itemId === null) {
		if (!prev) return false;
		if (slot === "weapon") a.kit.weapon = a.weapon;
		else if (slot === "armor") a.kit.armor = null;
		else a.kit.accessory = null;
		if (!(slot === "weapon" && prev === a.weapon)) put(d, prev);
		say(d, `${a.name} hands back the ${ITEMS[prev]?.name ?? prev}.`);
		return true;
	}
	const def = ITEMS[itemId];
	if (!def || def.kind !== kind) return false;
	if (d.equipped.weapon === itemId || d.equipped.armor === itemId) return false;
	if (rowQty(d, itemId) < 1) return false;
	pull(d, itemId);
	if (slot === "weapon") a.kit.weapon = itemId;
	else if (slot === "armor") a.kit.armor = itemId;
	else a.kit.accessory = itemId;
	if (prev && !(slot === "weapon" && prev === a.weapon)) put(d, prev);
	say(d, `${a.name} takes the ${def.name}.`);
	return true;
}
function severed(d, machineId, nodeId) {
	return Boolean(d.machines[machineId]?.nodes.find((n) => n.id === nodeId)?.severed);
}
var QUESTS = [
	{
		id: "dry-ward",
		title: "The dry ward",
		open: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard || d.flags.pumpFate),
		met: (d) => Boolean(d.flags.foodLive) || Boolean(d.flags.plotsRefused) || Boolean(d.flags.pumpFate === "bleed" && d.flags.provisionalStamp) || Boolean(d.flags.bellowsLive === false && d.flags.reedRead),
		waiting: "The lower ward is waiting on a parent. A meal, a refused bed, a stamped wash, or a stopped lung would each be an answer. They are not the same answer.",
		resolve: (d) => {
			if (d.flags.foodLive) return "The plots are drinking. Food has a parent. A levy has the same parent.";
			if (d.flags.plotsRefused) return "The bed was refused. The levy has nothing to invoice. The ward has less to eat.";
			if (d.flags.bellowsLive === false && d.flags.reedRead) return "The lung was stopped. A seated pump can still leave the ward dry.";
			return "Brown water was stamped provisional. The stall can sell it under that name.";
		},
		xp: 12
	},
	{
		id: "empty-forge",
		title: "The empty forge",
		open: (d) => Boolean(d.flags["seen:quarry"] || d.flags["seen:rust"] || d.flags.seenQuarry),
		met: (d) => Boolean(d.flags.gearLive) || Boolean(d.flags.stockRefused) || severed(d, "chute", "grade"),
		waiting: "The forge can be a child of ore, quench, and fire. It can also be refused. The chute grade is another parent. None of these is the only door.",
		resolve: (d) => {
			if (d.flags.stockRefused) return "The stock was refused. Ore, quench, and fire were left where they were.";
			if (severed(d, "chute", "grade")) return "The chute grade is cut. The pit can still move stone. The forge will not call it ore.";
			return "Stock is live. Ore, quench, and fire are its parents. None of them is a virtue.";
		},
		xp: 12
	},
	{
		id: "dark-road",
		title: "The dark road",
		open: (d) => Boolean(d.flags.citadelOpen || d.flags.seenCitadel || d.flags.citadelFate),
		met: (d) => Boolean(d.flags.citadelFate) || severed(d, "lamps", "glass") || Boolean(d.flags.roadDark && d.flags["seen:road"]) || Boolean(d.flags.roadBypass),
		waiting: "The stack road is a child of the lamps, and the lamps are a child of the orrery. Glass, power, a walked dark, or a south bypass would each change who uses it.",
		resolve: (d) => {
			if (severed(d, "lamps", "glass")) return "The lamp glass was cut. Power can still be true. The road is dark because the glass is not.";
			if (d.flags.roadBypass) return "The south walk is known. The lamps were left as they were. Travel does not require them.";
			if (d.flags.roadDark && d.flags["seen:road"]) return "The road was walked dark. The lamps had been a child of the orrery.";
			if (d.flags.citadelFate === "sever") return "The citadel's siphon was cut. The road lost that parent.";
			return "The citadel was decided. The road is whatever that decision still feeds.";
		},
		xp: 12
	},
	{
		id: "line-word",
		title: "The lung, said aloud",
		open: (d) => Boolean(d.flags.reedRead),
		met: (d) => Boolean(d.flags.workersKnow),
		waiting: "The bellows can be named. Whether the quarry line hears the name is a separate choice.",
		resolve: () => "The quarry line has the diagram. Information moved. It did not become a different machine.",
		xp: 12
	},
	{
		id: "tobin-lung",
		title: "Tobin's lung",
		open: (d) => Boolean(d.actors.tobin?.companion),
		met: (d) => Boolean(d.flags.bellowsLive && d.flags.reedRead || d.flags.tobinHeardLung),
		waiting: "Tobin is walking. The bellows is still a fact he has not been made to count out loud.",
		resolve: (d) => d.flags.bellowsLive && d.flags.reedRead ? "The lung is seated and named. Tobin heard it as maintenance." : "The stopped bellows was said to him. He counted it. He did not leave.",
		xp: 12
	},
	{
		id: "sera-choice",
		title: "Sera's stock",
		open: (d) => Boolean(d.actors.sera?.companion),
		met: (d) => Boolean(d.flags.stockRefused || d.flags.gearLive && d.flags.seraSawGear || d.flags.citadelFate),
		waiting: "Sera is watching the forge and the standard. She has not been shown which child you mean.",
		resolve: (d) => {
			if (d.flags.stockRefused) return "She saw the stock refused and the parents left standing.";
			if (d.flags.gearLive && d.flags.seraSawGear) return "She looked at live stock. She disagreed. She stayed.";
			return "The citadel was answered while she was walking. The answer is in the ledger, not in a grade of her.";
		},
		xp: 12
	},
	{
		id: "wren-walk",
		title: "Wren's line",
		open: (d) => Boolean(d.actors.wren?.companion),
		met: (d) => Boolean(d.flags.workersKnow || d.flags.wrenWalked),
		waiting: "Wren walks with the lines. The quarry has not been made to hear her, unless you already sent the diagram.",
		resolve: (d) => d.flags.workersKnow ? "The line heard her diagram. The pit and the pump are one sentence now." : "She walked the pit beside you. The diagram was not required for the company.",
		xp: 12
	},
	{
		id: "ward-child",
		title: "The pump's child",
		open: (d) => Boolean(d.flags.pumpFate),
		met: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard),
		waiting: "The Sinks pump has a child that is not in the Sinks. The lower ward drinks it, or fails to.",
		resolve: () => "Oakhaven was stood in. The cistern did not grow a well. It remained a child of the pump.",
		xp: 12
	},
	{
		id: "pit-line",
		title: "The pit",
		open: (d) => Boolean(d.flags["seen:haven"] || d.flags.seenWard),
		met: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry || d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred"),
		waiting: "Stone is still hanging somewhere the ward does not own. The quarry is the next room of this machine, not a new city.",
		resolve: () => "The quarry was stood in. The slab is a fact about a cable, a throat, and whoever was under the boom.",
		xp: 12
	},
	{
		id: "heat-room",
		title: "Where the stone goes",
		open: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry),
		met: (d) => Boolean(d.flags["seen:rust"]),
		waiting: "If the stone moves, someone downstream is warm or not warm. The Rust Districts are that room.",
		resolve: () => "Rust was stood in. Heat there is a child of haul, hearth, and whoever was allowed to drink it.",
		xp: 12
	},
	{
		id: "rank-floor",
		title: "The rank floor",
		open: (d) => Boolean(d.flags["seen:rust"] || d.flags.guildBriefed || d.flags.citadelOpen),
		met: (d) => Boolean(d.flags["seen:citadel"] || d.flags.seenCitadel || d.flags.citadelFate),
		waiting: "The guild named a crucible. It is not a rumor until you have stood where the siphon is.",
		resolve: () => "The citadel was reached. The siphon, the lifts, and the rank engine are one graph with more than one answer.",
		xp: 12
	},
	{
		id: "no-baseline",
		title: "No correct baseline",
		open: (d) => Boolean(d.flags.citadelFate || d.flags.spireOpen),
		met: (d) => Boolean(d.flags["seen:spire"] || d.flags.ending),
		waiting: "Something under the old works has no recoverable baseline. The Spire is that question, not a bigger door.",
		resolve: () => "The Spire was stood in. The question is not which baseline is correct. It is whether a correct one is yours to issue.",
		xp: 16
	},
	{
		id: "lost-rigger",
		title: "The lost rigger",
		open: (d) => Boolean(d.flags["seen:quarry"] || d.flags.seenQuarry),
		met: (d) => Boolean(d.flags.rillSpoken || d.flags.workerHurt || d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred"),
		waiting: "Someone is off the count under the boom. A name, a clear drop, or a scar would each be an answer. They are not the same answer.",
		resolve: (d) => {
			if (d.flags.rillSpoken && d.flags.quarryStone !== "scarred" && !d.flags.workerHurt) return "Rill was off the grade. The boom did not have to be the whole sentence. Hask can put the name back.";
			if (d.flags.quarryStone === "clear" && !d.flags.workerHurt) return "The slab came down clear. Whoever was still under the boom was not the one the stone took.";
			return "The stone took a rigger. The name stays on the crane. Leaving it unsaid does not put the body back.";
		},
		xp: 12
	},
	{
		id: "reed-moth",
		title: "The reed moth",
		open: (d) => Boolean(d.flags.cinderSeen || d.actors.cinder?.companion),
		met: (d) => Boolean(d.flags.cinderFed || d.actors.cinder?.companion),
		waiting: "Something nests on the bellows reed. It eats. It is not a valve, and it is not a rank.",
		resolve: () => "Scrap was left where the moth could take it. Hunger was a parent. She counted the gift and did not perform gratitude.",
		xp: 8
	},
	{
		id: "moth-chooses",
		title: "The choosing",
		open: (d) => Boolean(d.flags.cinderFed),
		met: (d) => Boolean(d.actors.cinder?.companion),
		waiting: "The moth has eaten. She has not stepped onto a shadow. The choosing is hers.",
		resolve: (d) => d.flags.bellowsLive === false ? "She chose a shadow while the lung was stopped. She is restless. She came anyway." : "She stepped onto a shadow. The company was not assigned.",
		xp: 10
	},
	{
		id: "moth-return",
		title: "The second choosing",
		open: (d) => Boolean(d.flags.cinderLeft || d.flags.cinderBack),
		met: (d) => Boolean(d.flags.cinderBack && d.actors.cinder?.companion),
		waiting: "She left the shadow. A seated reed is weather, not a command. The second choosing is still hers.",
		resolve: () => "The reed was breathing again. She stepped back onto the shadow. Nobody assigned it.",
		xp: 10
	},
	{
		id: "alley-child",
		title: "The cut that was a bed",
		open: (d) => Boolean(d.flags.ashAccess && (d.flags["seen:haven"] || d.flags.seenWard) || d.flags.pipHome || d.flags.pipShown),
		met: (d) => Boolean(d.flags.pipHome || d.flags.pipShown || d.flags.foodLive && d.flags["seen:haven"]),
		waiting: "Someone is sleeping in the service cut because the ward's meal has no parent. Seating the bed, refusing it, or listening to what a moth avoids would each be a different fact.",
		resolve: (d) => {
			if (d.flags.pipHome) return "The plots drank. The child left the cut. The wall went back to being a wall.";
			if (d.flags.pipShown) return "Pip followed the moth along a drip. The route was a living refusal, not a door you unlocked.";
			return "The ward was stood in while the plots had a parent. The cut did not have to stay a bed.";
		},
		xp: 8
	},
	{
		id: "waystation",
		title: "The seized brake",
		open: (d) => Boolean(d.flags["seen:road"] || d.flags.onRoad),
		met: (d) => Boolean(d.flags.cartEase || d.flags.cartPinned),
		waiting: "A cart is heavier than its brake. Easing it sends the weight on. Pinning it keeps the weight, and the forge will meet the absence.",
		resolve: (d) => d.flags.cartPinned ? "The load stayed pinned. Stone can leave the pit and still not become ore." : "The brake was eased. The cart did not wait for a speech.",
		xp: 10
	},
	{
		id: "glaze",
		title: "The glaze stake",
		open: (d) => Boolean(d.flags.tundraWalked || d.flags["seen:tundra"]),
		met: (d) => Boolean(d.flags.iceSpan || d.flags.iceCut),
		waiting: "The middle of the ice is a bill. Seating the span stops the bill. Cutting it makes the hollow cold even if a clock elsewhere is still sending.",
		resolve: (d) => d.flags.iceCut ? "The span was cut. The hollow went cold. The ice kept a harder bill." : "The span was seated. The middle of the ice stopped billing the walk.",
		xp: 10
	},
	{
		id: "tenement-wash",
		title: "The tenement wash",
		open: (d) => Boolean(d.flags["seen:rust"]),
		met: (d) => Boolean(d.flags.washChosen),
		waiting: "A seized valve sits between the gallery and two children: the sleepers, and the forge. Sending the drink one way dries the other. Sharing costs more and still needs a parent.",
		resolve: (d) => {
			if (d.flags.washSpill) return "The quench went to the sleepers. The forge was the child that went dry.";
			if (d.flags.washShared) return "The wash was shared. Both drank only while the gallery had something to send.";
			return "The quench was sent back toward the forge. The sleeper pipe went dry.";
		},
		xp: 10
	},
	{
		id: "costume-gauge",
		title: "The costume gauge",
		open: (d) => Boolean(d.flags.gaugeSeen),
		met: (d) => Boolean(d.flags.gaugeRead || d.flags.gaugeCut),
		waiting: "A gauge in the west pocket looks dead. The pocket is not. The face may not be the parent.",
		resolve: (d) => d.flags.gaugeCut ? "The real feed was cut. The district pump was not that parent. A drowned servo answered the pocket." : "The gauge face was a costume. The pocket feed behind it was holding.",
		xp: 10
	},
	{
		id: "ash-cup",
		title: "The alley cup",
		open: (d) => Boolean(d.flags.stillSeen),
		met: (d) => Boolean(d.flags.stillBroken || d.flags.stillLicensed),
		waiting: "While the ward is dry, a still in the service cut is drinking the difference. Break it, license it, or leave it.",
		resolve: (d) => d.flags.stillLicensed ? "The trickle was written down. It stayed a cup. The alley had a parent that was not a raid." : "The still was broken. The cup went. The clinic kept whatever parent it had.",
		xp: 10
	},
	{
		id: "night-winch",
		title: "The night winch",
		open: (d) => Boolean(d.flags.winchSeen),
		met: (d) => Boolean(d.flags.crewStood || d.flags.crewFled || d.flags.winchCut),
		waiting: "A crew is under a winch that is not the crane. A live throat is a parent they can hear. A dead throat is the reason they fight.",
		resolve: (d) => {
			if (d.flags.crewStood) return "The winch was braced. The crew stood down because the colossus was still breathing.";
			if (d.flags.crewFled) return "The winch was cut. The crew left. They would not stand under a live throat.";
			return "The winch was cut after the throat had stopped. The crew answered.";
		},
		xp: 12
	},
	{
		id: "one-night",
		title: "One night in the ward",
		open: (d) => Boolean(d.flags.bufferSeen),
		met: (d) => Boolean(d.flags.citadelFate),
		waiting: "A cell under the ranking floor can keep one infirmary, if it is charged while the siphon is still sending.",
		resolve: (d) => d.flags.bufferHeld ? "The siphon was cut. One ward kept the night. The rest of the dark was not spared." : d.flags.bufferCharged ? "The cell was charged. The crucible was answered another way, and the cell was not asked." : "The crucible was answered. The buffer cell had been empty.",
		xp: 12
	},
	{
		id: "kiln-set",
		title: "The set",
		open: (d) => Boolean(d.flags["seen:kiln"]),
		met: (d) => Boolean(d.flags.brickLive || d.flags.kilnRefused),
		waiting: "The kiln can set brick if clay, a bed, and either gallery water or a field-dry are all true. Seating the flue is not the water. Borrowing Rust heat is not the clay. Refusing the yard is also an answer.",
		resolve: (d) => {
			if (d.flags.kilnRefused) return "The yard was refused. The levy has nothing to invoice. The houses have nothing to hold.";
			if (d.flags.fieldDry && !d.flags.quenchLive) return "The set took a field-dry. The gallery did not have to be the parent.";
			if (d.flags.kilnBorrowed) return "The bed is drinking Rust heat. The local flue did not have to be the whole sentence.";
			return "The set is holding. Clay was local. Something else had to parent the water or the heat.";
		},
		xp: 14
	},
	{
		id: "kiln-stamp",
		title: "The stamp",
		open: (d) => Boolean(d.flags.brickLive || d.flags.kilnLevy || d.flags.stampCut || d.flags.kilnLicensed),
		met: (d) => Boolean(d.flags.kilnLicensed || d.flags.stampCut || d.flags.kilnRefused && d.flags["seen:kiln"]),
		waiting: "Brick that stands up can be licensed, cut free of the stamp, or never made. A quiet sale is a fourth sentence and it does not close the levy.",
		resolve: (d) => {
			if (d.flags.kilnRefused && !d.flags.brickLive) return "There is no brick. The stamp has nothing to ride.";
			if (d.flags.stampCut) return "The stamp is a hole. The levy died with it. Cress did not agree to be a hole.";
			return "The stamp was licensed. The board can sell. The levy stayed on the same pipe.";
		},
		xp: 12
	},
	{
		id: "kiln-nest",
		title: "The nested flue",
		open: (d) => Boolean(d.flags.kilnTold || d.flags.kilnCellar || d.flags.glassLifted),
		met: (d) => Boolean(d.flags.glassLifted || d.flags.glassSmashed),
		waiting: "Under the houses, a glass is parenting a nest. It can be read and lifted, or smashed. Those are not the same theft.",
		resolve: (d) => d.flags.glassSmashed ? "The glass was smashed. The mite had to stand up because its parent was taken ugly." : "The glass was lifted after it was read. The nest stayed a nest.",
		xp: 10
	},
	{
		id: "switch-floor",
		title: "The slick plates",
		open: (d) => Boolean(d.flags["seen:switch"]),
		met: (d) => Boolean(d.flags.switchGreased),
		waiting: "The yard plates bill a step. Boots keep your feet and do not keep Wick's. Grease wants scrap on the axle. Jamming the table is a different parent and does not make a shed.",
		resolve: () => "The axle was greased. The shed is a floor. The haul, if it is still moving, was not the thing that changed.",
		xp: 12
	},
	{
		id: "switch-haul",
		title: "The table",
		open: (d) => Boolean(d.flags["seen:switch"]),
		met: (d) => Boolean(d.flags.switchJam || d.flags.switchShunt || d.flags.switchLicensed || d.flags.switchCut),
		waiting: "The table can keep passing weight on Rue's books, be jammed so the citadel loses this parent, be shunted off the books, or be licensed or cut. Those are not the same haul.",
		resolve: (d) => {
			if (d.flags.switchJam && !d.flags.switchShunt) return "The table was jammed. A busy pit stopped being a parent of the citadel.";
			if (d.flags.switchShunt) return "A shunt is carrying the haul off the books. The weight still leaves.";
			if (d.flags.switchCut) return "The yard stamp is a hole. A haul can leave without that bill.";
			return "The stamp was licensed. The bill stayed on any haul the books can see.";
		},
		xp: 14
	},
	{
		id: "switch-bill",
		title: "The held waybill",
		open: (d) => Boolean(d.flags.switchTold || d.flags.switchBay || d.flags.waybillRead),
		met: (d) => Boolean(d.flags.waybillRead),
		waiting: "Under the office, a paper parents a nest. It can be read and lifted, or smashed. It names a cart that was held.",
		resolve: (d) => d.flags.waybillSmashed ? "The crate was smashed. The rat had to stand up. The paper still names Bram's cart and this table as one refusal." : "The waybill was read. Bram's held cart and the Switch table are the same sentence.",
		xp: 10
	},
	{
		id: "pane-melt",
		title: "The melt",
		open: (d) => Boolean(d.flags["seen:pane"] || d.flags.solCullet),
		met: (d) => Boolean(d.flags.paneCharge || d.flags.paneRefused),
		waiting: "The glasshouse can melt clear if sand or cullet, and a bed, are both true. The bed is a local flue or a kiln that is actually hot. Spilling the pit is not the end of it. Refusing the house is also an answer.",
		resolve: (d) => {
			if (d.flags.paneRefused) return "The house was refused. The levy has nothing to invoice. The glass has nothing to hold.";
			if (d.flags.paneCullet && d.flags.paneSpilled) return "The melt took cullet. The pit did not have to stay the parent.";
			if (d.flags.paneBorrowed) return "The bed is drinking a kiln. The local flue did not have to be the whole sentence.";
			return "The melt is holding. Sand was local. Heat had to be seated or borrowed.";
		},
		xp: 14
	},
	{
		id: "pane-stamp",
		title: "The glass stamp",
		open: (d) => Boolean(d.flags.paneCharge || d.flags.paneLevy || d.flags.paneCut || d.flags.paneLicensed),
		met: (d) => Boolean(d.flags.paneLicensed || d.flags.paneCut || d.flags.paneRefused && d.flags["seen:pane"]),
		waiting: "A clear melt can be licensed, cut free of the stamp, or never made. A quiet sale is a third sentence and it does not close the levy.",
		resolve: (d) => {
			if (d.flags.paneRefused && !d.flags.paneCharge) return "There is no melt. The stamp has nothing to ride.";
			if (d.flags.paneCut) return "The stamp is a hole. The levy died with it. Ness did not agree to be a hole.";
			return "The stamp was licensed. The bench can sell. The levy stayed on the same pipe.";
		},
		xp: 12
	},
	{
		id: "pane-lens",
		title: "The anneal lens",
		open: (d) => Boolean(d.flags.paneTold || d.flags.paneVault || d.flags.annealRead || d.flags.lensBought),
		met: (d) => Boolean(d.flags.annealRead || d.flags.annealSmashed || d.flags.lensBought),
		waiting: "A lens that names a quiet parent can come off the bench, once the bench is allowed to sell, or out of the vault. The vault can be given, picked, or smashed. Those are not the same taking.",
		resolve: (d) => d.flags.annealSmashed ? "The anneal was smashed. The moth had to stand up because its parent was taken ugly. The lens still names a seam." : d.flags.lensBought && !d.flags.annealRead ? "The lens was bought. The vault did not have to be the parent." : "The lens was read and lifted. The nest stayed a nest.",
		xp: 10
	}
];
function write(d, entry) {
	const hit = d.journal.find((j) => j.id === entry.id);
	if (!hit) {
		d.journal.push(entry);
		return;
	}
	if (hit.status === entry.status && hit.text === entry.text) return;
	hit.title = entry.title;
	hit.text = entry.text;
	hit.status = entry.status;
}
function grant(d, n) {
	if (n <= 0) return;
	d.xp += n;
	while (d.level < 8 && d.xp >= xpForLevel(d.level + 1)) {
		d.level += 1;
		d.skillPoints += 4;
		d.perkPoints = (d.perkPoints ?? 0) + 1;
		d.player.maxHp += 8;
		d.player.hp = Math.min(d.player.maxHp, d.player.hp + 8);
		d.pendingLevel = true;
		d.log.unshift(`Comprehension deepens. You are level ${d.level}.`);
		if (d.log.length > 40) d.log.length = 40;
		play("level");
	}
}
function silas(d) {
	const fin = Boolean(d.flags["seen:spire"] || d.flags.ending);
	const late = Boolean(d.flags.citadelFate || d.flags.spireOpen);
	const mid = Boolean(d.flags.pumpFate && (d.flags.foodLive || d.flags.plotsRefused || d.flags.gearLive || d.flags.stockRefused || d.flags["seen:quarry"] || d.flags["seen:rust"]));
	const cost = d.flags.foodLive ? " The ward eats off the same pipe that invoices a levy." : d.flags.plotsRefused ? " The bed was refused. Hunger is what that refusal cost." : d.flags.bellowsLive === false ? " A stopped lung can leave a seated pump dry." : "";
	write(d, {
		id: "silas-now",
		title: "What you are doing",
		text: fin ? `The Spire has no baseline you can issue and still tell the truth. The question is who is allowed to decide what fixed means.${cost}` : late ? `Someone already decided the baseline. Restoring it would invent a shape. Leaving the holes would leave their names in place.${cost}` : mid ? `Repairing one thing can break another. The meal, the bill, the forge, and the road are rooms of one machine.${cost}` : "You repair what is broken. The Sinks are the first sentence, not the whole machine.",
		status: "open"
	});
}
/** Listens to flags the city graph already wrote. An unexpected fix still counts. */
function reconcileQuests(d) {
	if (d.flags.workersKnow && d.flags["seen:rust"] && !d.flags.ivesHeardLung) d.flags.ivesHeardLung = true;
	silas(d);
	for (const q of QUESTS) {
		const key = `quest:${q.id}`;
		const prev = d.flags[key];
		if (prev === "done") continue;
		const met = q.met(d);
		const open = q.open(d);
		if (!met && !open) continue;
		if (met) {
			d.flags[key] = "done";
			write(d, {
				id: q.id,
				title: q.title,
				text: q.resolve(d),
				status: "done"
			});
			const reward = `questReward:${q.id}`;
			if (!d.flags[reward]) {
				d.flags[reward] = true;
				grant(d, q.xp);
			}
			continue;
		}
		if (prev !== "open") {
			d.flags[key] = "open";
			write(d, {
				id: q.id,
				title: q.title,
				text: q.waiting,
				status: "open"
			});
		}
	}
}
var BARKS = [
	{
		id: "tobin-pump",
		who: "tobin",
		line: "The pump is still a parent. Don't start with the plaque.",
		when: (d) => d.mapId === "sinks" && !d.flags.pumpFate
	},
	{
		id: "tobin-lung",
		who: "tobin",
		line: "That reed is the lung. The ward is just where the dryness learns a name.",
		when: (d) => d.mapId === "sinks" && Boolean(d.flags.reedRead)
	},
	{
		id: "tobin-dry",
		who: "tobin",
		line: "The plots are quiet. I told you the lung was the parent.",
		when: (d) => d.mapId === "haven" && !d.flags.foodLive && Boolean(d.flags.pumpFate)
	},
	{
		id: "tobin-fed",
		who: "tobin",
		line: "Food has a parent. So does the bill. I can live with both. I won't pretend they're one kindness.",
		when: (d) => d.mapId === "haven" && Boolean(d.flags.foodLive)
	},
	{
		id: "tobin-stone",
		who: "tobin",
		line: "The cable is a parent. Whoever stands under the boom is the child.",
		when: (d) => d.mapId === "quarry" && d.flags.quarryStone !== "clear" && d.flags.quarryStone !== "scarred"
	},
	{
		id: "wren-line",
		who: "wren",
		line: "This is the same machine. They just gave the next room a different name.",
		when: (d) => d.mapId === "road"
	},
	{
		id: "wren-dark",
		who: "wren",
		line: "The lamps went out. Ask what they were drinking, not who to blame for the dark.",
		when: (d) => d.mapId === "road" && Boolean(d.flags.roadDark)
	},
	{
		id: "wren-quiet-lung",
		who: "wren",
		line: "You stopped the lung once. You know what happens when it goes quiet.",
		when: (d) => d.flags.bellowsLive === false && Boolean(d.flags.reedRead) && d.mapId !== "sinks"
	},
	{
		id: "wren-pit",
		who: "wren",
		line: "If they heard the diagram, the pit already knows the lung. If they didn't, the pit is still guessing.",
		when: (d) => d.mapId === "quarry" && Boolean(d.flags.workersKnow)
	},
	{
		id: "wren-count",
		who: "wren",
		line: "Pim is back on the count. Fear stood down when the slab missed. Don't file that as courage.",
		when: (d) => d.mapId === "quarry" && Boolean(d.flags.pimCount)
	},
	{
		id: "tobin-hook",
		who: "tobin",
		line: "That pin hook still in the pack? The cable remembers the last time someone trusted a single parent.",
		when: (d) => d.mapId === "quarry" && d.inventory.some((i) => i.id === "hook" && i.qty > 0)
	},
	{
		id: "tobin-doss",
		who: "tobin",
		line: "Doss left the reed. Weather moved. A person followed. That's the report.",
		when: (d) => Boolean(d.flags.dossShift)
	},
	{
		id: "sera-stock",
		who: "sera",
		line: "Stock on the bench is not a virtue. Look at which parent you meant.",
		when: (d) => d.mapId === "rust" && Boolean(d.flags.gearLive)
	},
	{
		id: "sera-refused",
		who: "sera",
		line: "You left the parents standing and refused the stock. I saw it. I'm still here.",
		when: (d) => d.mapId === "rust" && Boolean(d.flags.stockRefused)
	},
	{
		id: "sera-seize",
		who: "sera",
		line: "Don't replace the engine with your face and call the walk maintenance.",
		when: (d) => Boolean(d.flags.citadelFate === "seize")
	},
	{
		id: "sera-toll",
		who: "sera",
		line: "If the plate upstairs is hungry, the doorway is not a law.",
		when: (d) => d.mapId === "citadel" && Boolean(d.flags.guardToll)
	},
	{
		id: "mara-hall",
		who: "mara",
		line: "The hall is warm. That doesn't mean the beds are.",
		when: (d) => d.mapId === "rust" && Boolean(d.flags.guildWarm) && !d.flags.tenementWarm
	},
	{
		id: "mara-quiet",
		who: "mara",
		line: "I keep the nights. You don't have to take them to keep walking with me.",
		when: (d) => d.mapId === "rust" && Boolean(d.flags.maraFate)
	},
	{
		id: "mara-hollow",
		who: "mara",
		line: "Drift sleeps where the weather is sent. I know that instinct. I won't call it a cure.",
		when: (d) => d.mapId === "tundra" && Boolean(d.flags.driftBed)
	},
	{
		id: "any-return-haven",
		who: "any",
		line: "We've been here. It isn't the room I remember. The pipes moved.",
		when: (d) => d.mapId === "haven" && Number(d.flags["visits:haven"] ?? 0) > 1
	},
	{
		id: "any-return-sinks",
		who: "any",
		line: "Back under the stacks. Whatever we did downstream is still a child of this room.",
		when: (d) => d.mapId === "sinks" && Number(d.flags["visits:sinks"] ?? 0) > 1
	},
	{
		id: "any-ice",
		who: "any",
		line: "The north edge of the walk is ice. The south edge isn't. The citadel doesn't care which you pick.",
		when: (d) => d.mapId === "tundra"
	},
	{
		id: "any-spire",
		who: "any",
		line: "If you came to put it back the way it was, say so out loud. I don't think it was.",
		when: (d) => d.mapId === "spire"
	},
	{
		id: "cinder-reed",
		who: "cinder",
		line: "clicks, once, at the bellows.",
		when: (d) => d.mapId === "sinks" && d.flags.bellowsLive !== false && !d.flags.dossShift
	},
	{
		id: "cinder-restless",
		who: "cinder",
		line: "will not settle. The reed is stopped.",
		when: (d) => d.flags.bellowsLive === false
	},
	{
		id: "cinder-doss",
		who: "cinder",
		line: "avoids the empty reed. The sleeper already left.",
		when: (d) => d.mapId === "sinks" && Boolean(d.flags.dossShift)
	},
	{
		id: "cinder-plots",
		who: "cinder",
		line: "ranges ahead, then comes back. The plots smell like a parent.",
		when: (d) => d.mapId === "haven" && Boolean(d.flags.foodLive)
	},
	{
		id: "cinder-dark",
		who: "cinder",
		line: "stops. The dark road is a no, until it isn't.",
		when: (d) => Boolean(d.flags.roadDark) && (d.mapId === "road" || d.mapId === "tundra")
	},
	{
		id: "cinder-forge",
		who: "cinder",
		line: "flinches at the forge. The noise is a parent she doesn't want.",
		when: (d) => d.mapId === "rust" && Boolean(d.flags.gearLive)
	},
	{
		id: "cinder-hollow-cold",
		who: "cinder",
		line: "circles the hollow and does not go in.",
		when: (d) => d.mapId === "tundra" && d.flags.hollowWarm === false && Boolean(d.flags.tundraWalked)
	},
	{
		id: "cinder-quiet",
		who: "cinder",
		line: "hunts the edge of the lantern and comes back without being called.",
		when: (d) => d.mapId === "citadel" && !d.flags.roadDark
	}
];
/** Occasional, once each. Silence is allowed. */
function barkLine(d) {
	const steps = Number(d.flags.quietSteps ?? 0) + 1;
	d.flags.quietSteps = steps;
	if (d.combat || d.dialogue || d.phase !== "play") return null;
	if (steps < 7) return null;
	const mate = Object.values(d.actors).find((a) => a.companion && a.alive && a.mapId === d.mapId && a.template !== "cinder");
	const moth = d.actors.cinder?.companion && d.actors.cinder.alive && d.actors.cinder.mapId === d.mapId;
	for (const b of BARKS) {
		if (d.flags[`bark:${b.id}`]) continue;
		if (b.who === "cinder" && !moth) continue;
		if (b.who !== "cinder" && b.who !== "any" && mate?.id !== b.who) continue;
		if (b.who === "any" && !mate) continue;
		if (!b.when(d)) continue;
		d.flags[`bark:${b.id}`] = true;
		d.flags.quietSteps = 0;
		if (b.who === "cinder") return `The moth ${b.line}`;
		return `${mate?.name ?? "Someone"}: ${b.line}`;
	}
	d.flags.quietSteps = 0;
	return null;
}
function keyOf(x, y) {
	return `${x},${y}`;
}
function dist(a, b) {
	return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
function actorById(d, id) {
	if (id === "player") return d.player;
	return d.actors[id] ?? null;
}
function addLog(d, text) {
	d.log.unshift(text);
	if (d.log.length > 40) d.log.length = 40;
}
function noteOnce(d, text) {
	if (d.log[0] === text) return;
	addLog(d, text);
}
function refuseWalk(d) {
	if (!d.combat) return false;
	if (gait(d.player) === "dead") {
		noteOnce(d, "Your legs will not take the order.");
		d.path = [];
		return true;
	}
	const cost = gait(d.player) === "slow" ? 2 : 1;
	if (d.player.ap < cost) {
		noteOnce(d, "No action left. End the turn.");
		d.path = [];
		return true;
	}
	return false;
}
function comp(d) {
	return comprehension(d.player.attrs, d.player.skills.audit, d.level);
}
function focusMax(d) {
	return maxFocus(d.player.attrs.will);
}
function seamMark(nodes) {
	if (!nodes.some((n) => n.revealed)) return "unread";
	if (nodes.some((n) => n.revealed && n.spent)) return "spent";
	if (nodes.some((n) => n.revealed && n.pinned)) return "held";
	if (nodes.some((n) => n.revealed && n.severed && (n.effect === "flow" || n.effect === "weapon" || n.effect === "core" || n.effect === "life" || n.effect === "motive"))) return "severed";
	if (nodes.some((n) => n.revealed && (n.severed || n.integrity < 40))) return "stressed";
	if (nodes.some((n) => n.revealed && n.effect === "flow" && nodeLive(nodes, n))) return "live";
	return "live";
}
function nodeLive(nodes, n, seen = /* @__PURE__ */ new Set()) {
	if (n.severed || n.integrity < 40 || n.decoy) return false;
	if (seen.has(n.id)) return true;
	seen.add(n.id);
	for (const id of n.dependsOn) {
		const parent = nodes.find((p) => p.id === id);
		if (!parent || !nodeLive(nodes, parent, seen)) return false;
	}
	return true;
}
function confidenceOf(n) {
	if (!n.revealed) return "unknown";
	return n.confidence ?? "observed";
}
function seamState(nodes, n) {
	if (!n.revealed) return "Unknown";
	if (n.severed) return "Severed";
	if (!nodeLive(nodes, n)) {
		if (n.effect === "weapon") return "Unavailable";
		if (n.effect === "motive") return "Movement disabled";
		if (n.effect === "armor") return "Compromised";
		return "Disabled";
	}
	if (n.integrity < 70) return "Strained";
	return "Functional";
}
function confidenceBonus(n) {
	const c = confidenceOf(n);
	if (c === "confident") return 22;
	if (c === "understood") return 12;
	return 0;
}
function liveMap(nodes) {
	const m = /* @__PURE__ */ new Map();
	for (const n of nodes) m.set(n.id, nodeLive(nodes, n));
	return m;
}
function depthOf(nodes, id, seen = /* @__PURE__ */ new Set()) {
	if (seen.has(id)) return 0;
	seen.add(id);
	const n = nodes.find((x) => x.id === id);
	if (!n?.dependsOn.length) return 0;
	let depth = 0;
	for (const dep of n.dependsOn) depth = Math.max(depth, 1 + depthOf(nodes, dep, seen));
	return depth;
}
function lossLine(n) {
	if (n.severed) return `${n.name} severed.`;
	if (n.effect === "weapon") return `${n.name} unavailable.`;
	if (n.effect === "motive") return "Movement disabled.";
	if (n.effect === "armor") return `${n.name} compromised.`;
	return `${n.name} disabled.`;
}
function lossToken(n) {
	if (n.severed) return "severed";
	if (n.effect === "weapon") return "unavailable";
	if (n.effect === "motive") return "still";
	if (n.effect === "armor") return "compromised";
	return "disabled";
}
function graphOwner(d, nodes) {
	if (d.player.nodes === nodes) return {
		kind: "actor",
		id: "player",
		x: d.player.x,
		y: d.player.y,
		name: d.name,
		mapId: d.player.mapId
	};
	for (const a of Object.values(d.actors)) if (a.nodes === nodes) return {
		kind: "actor",
		id: a.id,
		x: a.x,
		y: a.y,
		name: a.name,
		mapId: a.mapId
	};
	for (const m of Object.values(d.machines)) if (m.nodes === nodes) return {
		kind: "machine",
		id: m.id,
		x: m.x,
		y: m.y,
		name: m.name,
		mapId: m.mapId
	};
	return null;
}
function flash(d, nodes, kind) {
	const owner = graphOwner(d, nodes);
	if (!owner || owner.mapId !== d.mapId) return;
	burst(owner.x, owner.y, kind);
}
function exposeUnderArmor(nodes) {
	if (!nodes.some((n) => n.effect === "armor" && !nodeLive(nodes, n))) return;
	for (const other of nodes) {
		if (other.effect !== "armor") continue;
		if (!other.revealed) {
			other.revealed = true;
			if (!other.confidence || other.confidence === "unknown") other.confidence = "observed";
		}
		for (const pid of other.dependsOn) {
			const parent = nodes.find((x) => x.id === pid);
			if (parent && !parent.revealed) {
				parent.revealed = true;
				if (!parent.confidence || parent.confidence === "unknown") parent.confidence = "observed";
			}
		}
	}
}
function crushAround(d, x, y, mapId, power) {
	const victims = [];
	if (d.player.mapId === mapId && dist(d.player, {
		x,
		y
	}) <= 1) victims.push(d.player);
	for (const a of Object.values(d.actors)) {
		if (!a.alive || a.mapId !== mapId) continue;
		if (dist(a, {
			x,
			y
		}) <= 1) victims.push(a);
	}
	if (!victims.length) {
		addLog(d, "The load hammers empty ground.");
		return;
	}
	for (const a of victims) {
		if (d.phase !== "play") return;
		addLog(d, `${a.name} is under the load.`);
		const before = liveMap(a.nodes);
		for (const n of a.nodes) if (n.effect === "armor" && nodeLive(a.nodes, n)) n.integrity = Math.max(1, n.integrity - 28);
		applyHp(d, a.id, power, true);
		if (d.phase !== "play") return;
		publish(d, a.nodes, before);
	}
}
function publish(d, nodes, before, quiet, clean = false) {
	const owner = graphOwner(d, nodes);
	const flipped = nodes.filter((n) => before.get(n.id) === true && !nodeLive(nodes, n)).sort((a, b) => depthOf(nodes, a.id) - depthOf(nodes, b.id));
	const restored = nodes.filter((n) => before.get(n.id) === false && nodeLive(nodes, n)).sort((a, b) => depthOf(nodes, a.id) - depthOf(nodes, b.id));
	for (const n of flipped) {
		addLog(d, lossLine(n));
		if (n.effect === "armor") exposeUnderArmor(nodes);
		if (n.effect === "weapon" && owner && d.phase === "play") {
			if (clean) {
				addLog(d, "Steam stays in the seam. The cut did not walk.");
				play("steam");
				flash(d, nodes, "steam");
			} else {
				addLog(d, "Steam kicks out of the dead mount.");
				play("steam");
				flash(d, nodes, "steam");
				for (const o of Object.values(d.actors)) {
					if (!o.alive || o.mapId !== owner.mapId || o.id === owner.id) continue;
					if (dist(o, owner) <= 1) applyHp(d, o.id, 4, false);
				}
				if (owner.id !== "player" && d.player.mapId === owner.mapId && dist(d.player, owner) <= 1) applyHp(d, "player", 3, true);
			}
			if (d.phase !== "play") return;
		}
		if (n.fail === "crush" && !n.spent && owner) {
			n.spent = true;
			d.flags[`${owner.id}:dropped`] = true;
			addLog(d, `${n.name} leaves the cable.`);
			crushAround(d, owner.x, owner.y, owner.mapId, 16);
			if (d.phase !== "play") return;
		}
	}
	if (owner && flipped.length) floatText(owner.x, owner.y, lossToken(flipped[flipped.length - 1]), "#c45c26");
	if (flipped.filter((n) => !n.severed).length && d.phase === "play") noteTrace(d, "cascade");
	for (const n of restored) {
		if (n.id === quiet) continue;
		addLog(d, `${n.name} restored.`);
	}
	rememberGraph(d, nodes);
}
function fallenFrom(nodes, rootId) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const walk = (id) => {
		for (const child of nodes) {
			if (!child.dependsOn.includes(id) || seen.has(child.id)) continue;
			if (nodeLive(nodes, child)) continue;
			seen.add(child.id);
			out.push(child);
			walk(child.id);
		}
	};
	walk(rootId);
	return out;
}
function noteGraphChange(d, nodes, n, verb, by) {
	if (!d.combat || d.phase !== "play") return;
	const owner = graphOwner(d, nodes);
	if (!owner) return;
	const fallen = verb === "cut" ? fallenFrom(nodes, n.id) : [];
	const risen = verb === "cut" ? [] : nodes.filter((child) => child.dependsOn.includes(n.id) && nodeLive(nodes, child) && child.id !== n.id);
	const weapon = (verb === "cut" ? fallen : risen).find((child) => child.effect === "weapon");
	const motive = (verb === "cut" ? fallen : risen).find((child) => child.effect === "motive");
	const other = (verb === "cut" ? fallen : risen)[0];
	const far = weapon ?? motive ?? other;
	const edge = far ? `${n.name} \u2192 ${far.name}` : n.name;
	let immediate = `${n.name} severed`;
	let downstream;
	if (verb === "cut") {
		if (weapon) immediate = `${weapon.name} unavailable`;
		else if (far) immediate = `${far.name} disabled`;
		if (weapon && owner.kind === "actor") downstream = `${owner.name} lost the ranged attack.`;
		else if (motive && owner.kind === "actor") downstream = `${owner.name} lost the step.`;
	} else {
		immediate = `${n.name} restored`;
		if (weapon) downstream = `${weapon.name} can fire again.`;
		else if (motive && owner.kind === "actor") downstream = `${owner.name} can walk again.`;
	}
	if (!d.combat.changes) d.combat.changes = [];
	d.combat.changes.push({
		ownerId: owner.id,
		ownerName: owner.name,
		verb,
		by: by ?? "player",
		nodeId: n.id,
		nodeName: n.name,
		edge,
		immediate,
		downstream
	});
}
function sever(d, nodes, n, by) {
	if (n.severed) {
		addLog(d, "Already severed.");
		return;
	}
	const before = liveMap(nodes);
	n.severed = true;
	n.integrity = 0;
	if (by) addLog(d, `${by} cuts ${n.name}.`);
	publish(d, nodes, before, void 0, !by && (d.verbs?.cut ?? 0) >= 4);
	noteGraphChange(d, nodes, n, "cut", by);
	play("unmend");
	flash(d, nodes, "snap");
	bump(7);
}
function deepen(d, n, fresh) {
	if (!n.revealed) {
		n.confidence = "unknown";
		return;
	}
	if (fresh) {
		n.confidence = d.flags.chalked && n.tier === "obfuscated" ? "understood" : "observed";
		return;
	}
	const cur = n.confidence ?? "observed";
	if (cur === "confident") return;
	const skill = d.player.skills.audit + Math.floor(d.player.attrs.perception / 2);
	const ease = (d.verbs?.audit ?? 0) >= 4 ? 10 : 0;
	const bar = 30 + n.density * 8 - ease;
	if (d.flags.chalked && skill >= bar - 10) {
		n.confidence = cur === "observed" ? "understood" : "confident";
		return;
	}
	if (cur === "understood" && skill >= bar - 8) {
		n.confidence = "confident";
		return;
	}
	if (cur === "observed" && skill >= bar) {
		n.confidence = "understood";
		return;
	}
	if (!n.confidence) n.confidence = "observed";
}
function armorCount(a) {
	return a.nodes.filter((n) => n.effect === "armor" && nodeLive(a.nodes, n)).length;
}
function hasItem(d, id) {
	return (d.inventory.find((i) => i.id === id)?.qty ?? 0) > 0;
}
function addItem(d, id, n = 1, condition = NaN) {
	const row = d.inventory.find((i) => i.id === id);
	const worn = Number.isNaN(condition) ? void 0 : condition;
	if (row) row.qty += n;
	else d.inventory.push({
		id,
		qty: n,
		condition: worn ?? ITEMS[id]?.condition ?? 100
	});
}
function carryWeight(d) {
	return d.inventory.reduce((sum, row) => sum + (ITEMS[row.id]?.weight ?? 1) * row.qty, 0);
}
function carryMax(d) {
	return 12 + d.player.attrs.body * 6;
}
function dismantle(d, id) {
	const def = ITEMS[id];
	if (!def?.yield?.length || !hasItem(d, id)) {
		addLog(d, "Nothing in that to recover.");
		return;
	}
	if (d.equipped.weapon === id || d.equipped.armor === id) {
		addLog(d, "Unequip it before you break it down.");
		return;
	}
	takeItem(d, id, 1);
	for (const part of def.yield) addItem(d, part, 1);
	addLog(d, `${def.name} comes apart into ${def.yield.map((p) => ITEMS[p]?.name ?? p).join(", ")}.`);
	play("unmend");
}
function forecast(nodes, n) {
	const conf = confidenceOf(n);
	if (conf === "unknown" || conf === "observed") return "You can see the seam. What it feeds is still a guess. Read it again before you trust a cut.";
	const kids = nodes.filter((o) => o.dependsOn.includes(n.id));
	const bits = [];
	if (n.effect === "weapon") bits.push("The weapon mount fails. What is left is hands, and only if they can reach.");
	if (n.effect === "armor") bits.push("That plate stops counting. Hits land closer to the body. Other layers, if any, stay until their own parents die.");
	if (n.effect === "motive") bits.push("Locomotion loses its drive. If nothing else still lives, they hold the ground.");
	if (n.effect === "flow") bits.push("The line stops moving what it was moving, or it finds a worse path.");
	if (n.effect === "life") bits.push("A living baseline comes apart. This is a wound.");
	if (n.effect === "core") bits.push("A core relationship. The rest of the graph will feel the absence.");
	if (n.effect === "none" && kids.length) bits.push("This bond does not hit anyone. It holds up the things that do.");
	if (n.fail === "crush") bits.push("If this loses its parent, the load leaves the cable.");
	if (kids.length) {
		const names = kids.map((k) => k.revealed || conf === "confident" ? k.name : "an unread bond").join(", ");
		bits.push(`If this parent dies, these lose function even if their integrity stays whole: ${names}.`);
	}
	if (n.id === "bypass" && (conf === "understood" || conf === "confident")) bits.push("Thrown, this bypass sends brown pressure along the gallery feed. The sump door can drink. The district will taste it.");
	if (n.pattern === "pressure-feed" && (conf === "understood" || conf === "confident")) bits.push("This is a pressure feed. What depends on it fails with the parent, even if the child is never cut.");
	if (n.pattern === "load-chain" && (conf === "understood" || conf === "confident")) bits.push("This is a suspended load. If the parent dies, the weight leaves. A later hearth can recognize the same shape.");
	if (!bits.length) bits.push("Structural load. What hangs on it will sag.");
	if (conf === "confident") bits.push("You can hold this cut.");
	return bits.join(" ");
}
function takeItem(d, id, n = 1) {
	const row = d.inventory.find((i) => i.id === id);
	if (!row) return;
	row.qty -= n;
	if (row.qty <= 0) d.inventory = d.inventory.filter((i) => i.id !== id);
	if (d.equipped.weapon === id && !hasItem(d, id)) d.equipped.weapon = "prybar";
	if (d.equipped.armor === id && !hasItem(d, id)) d.equipped.armor = null;
}
function condOk(d, c) {
	if ("history" in c) return askHistory(d, c.history);
	if ("flag" in c && "is" in c) return d.flags[c.flag] === c.is;
	if ("flag" in c && "truthy" in c) return Boolean(d.flags[c.flag]);
	if ("missing" in c) return d.flags[c.missing] === void 0;
	if ("skill" in c) return d.player.skills[c.skill] >= c.gte;
	if ("discipline" in c) return d.disciplines.includes(c.discipline);
	if ("item" in c) return hasItem(d, c.item);
	if ("scrip" in c) return d.scrip >= c.scrip;
	if ("companion" in c) return Boolean(d.actors[c.companion]?.companion);
	if ("noCompanion" in c) return !Object.values(d.actors).some((a) => a.companion && a.alive);
	return true;
}
function replyVisible(d, requires) {
	if (!requires) return true;
	return requires.every((c) => condOk(d, c));
}
function grantXp(d, n) {
	if (n <= 0) return;
	d.xp += n;
	addLog(d, `+${n} experience.`);
	while (d.level < 8 && d.xp >= xpForLevel(d.level + 1)) {
		d.level += 1;
		d.skillPoints += 4;
		d.perkPoints = (d.perkPoints ?? 0) + 1;
		d.player.maxHp += 8;
		d.player.hp = Math.min(d.player.maxHp, d.player.hp + 8);
		d.pendingLevel = true;
		addLog(d, `Comprehension deepens. You are level ${d.level}.`);
		play("level");
	}
}
function walkable(d, x, y, ignore = String()) {
	const map = MAPS[d.mapId];
	if (!map) return false;
	const ch = tileAt(map, x, y);
	if (!WALKABLE.has(ch)) return false;
	const door = LOCKED_DOORS.find((door2) => door2.map === d.mapId && door2.x === x && door2.y === y);
	if (door && !d.flags[door.flag]) return false;
	if (Object.values(d.machines).some((m) => m.mapId === d.mapId && m.x === x && m.y === y)) return false;
	for (const a of Object.values(d.actors)) {
		if (!a.alive || a.mapId !== d.mapId) continue;
		if (a.id === ignore) continue;
		if (a.x === x && a.y === y) return false;
	}
	if (d.player.x === x && d.player.y === y && ignore !== "player") return false;
	return true;
}
function bfs(d, start, goal, ignore) {
	const q = [start];
	const prev = /* @__PURE__ */ new Map();
	prev.set(keyOf(start.x, start.y), null);
	const dirs = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	];
	while (q.length) {
		const cur = q.shift();
		if (!(cur.x === start.x && cur.y === start.y) && goal(cur.x, cur.y)) {
			const path = [];
			let k = keyOf(cur.x, cur.y);
			while (k) {
				const [xs, ys] = k.split(",").map(Number);
				path.push({
					x: xs,
					y: ys
				});
				k = prev.get(k) ?? null;
			}
			path.reverse();
			return path.slice(1);
		}
		for (const [dx, dy] of dirs) {
			const nx = cur.x + dx;
			const ny = cur.y + dy;
			const kk = keyOf(nx, ny);
			if (prev.has(kk)) continue;
			if (!walkable(d, nx, ny, ignore)) continue;
			prev.set(kk, keyOf(cur.x, cur.y));
			q.push({
				x: nx,
				y: ny
			});
		}
	}
	return null;
}
function pathTo(d, x, y) {
	if (!walkable(d, x, y, "player")) return null;
	return bfs(d, d.player, (px, py) => px === x && py === y, "player");
}
function pathNear(d, x, y) {
	if (dist(d.player, {
		x,
		y
	}) <= 1) return [];
	return bfs(d, d.player, (px, py) => Math.max(Math.abs(px - x), Math.abs(py - y)) <= 1, "player");
}
function machineAt(d, x, y) {
	return Object.values(d.machines).find((m) => m.mapId === d.mapId && m.x === x && m.y === y) ?? null;
}
function actorAt(d, x, y) {
	return Object.values(d.actors).find((a) => a.alive && a.mapId === d.mapId && a.x === x && a.y === y) ?? null;
}
function isExit(mapId, x, y) {
	return EXITS.some((e) => e.map === mapId && e.x === x && e.y === y);
}
function gait(a) {
	const motives = a.nodes.filter((n) => n.effect === "motive");
	if (!motives.length) return "ok";
	if (motives.every((n) => !nodeLive(a.nodes, n))) return "dead";
	if (motives.some((n) => n.integrity < 80 || !nodeLive(a.nodes, n))) return "slow";
	return "ok";
}
function slow(a) {
	return gait(a) === "slow";
}
function weaponOf(a) {
	const broken = a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n));
	const carried = a.companion && a.kit?.weapon ? a.kit.weapon : a.weapon;
	return ITEMS[broken ? "fist" : carried] ?? ITEMS.fist;
}
function companionAp(a) {
	const base = gait(a) === "slow" ? 4 : 6;
	return Boolean(a.kit?.armor && ITEMS[a.kit.armor]?.heavy) ? Math.max(3, base - 1) : base;
}
function pinOnHit(nodes) {
	const hit = nodes.find((n) => n.revealed && !n.decoy && (n.effect === "flow" || n.effect === "weapon" || n.effect === "motive") && nodeLive(nodes, n));
	if (!hit) return null;
	hit.pinned = true;
	return hit;
}
function gearWear(d, a) {
	if (a.id !== "player") return 1;
	const condition = d.inventory.find((i) => i.id === a.weapon)?.condition ?? 100;
	return .45 + .55 * (Math.max(0, Math.min(100, condition)) / 100);
}
function brokenMount(a) {
	return a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n));
}
function currentNode(d) {
	if (!d.dialogue) return null;
	return CONVOS[d.dialogue.convo]?.nodes[d.dialogue.node] ?? null;
}
function journal(d, id, title, text, status) {
	const hit = d.journal.find((j) => j.id === id);
	if (hit) {
		hit.title = title;
		hit.text = text;
		hit.status = status;
	} else d.journal.unshift({
		id,
		title,
		text,
		status
	});
	if (status === "open") d.pinned = title;
}
function rememberGraph(d, nodes) {
	const owner = graphOwner(d, nodes);
	if (!owner) return;
	const known = nodes.filter((n) => n.revealed);
	if (!known.length) return;
	const chains = [];
	for (const n of known) {
		const parents = n.dependsOn.map((id2) => known.find((p) => p.id === id2)?.name).filter((name) => Boolean(name));
		if (parents.length) chains.push(`${parents.join(" + ")} \u2192 ${n.name}`);
	}
	const failed = known.filter((n) => n.severed || !nodeLive(nodes, n));
	const failure = failed.length ? `Known failure: ${failed.slice(0, 3).map((n) => `${n.name} ${n.severed ? "severed" : seamState(nodes, n).toLowerCase()}`).join("; ")}.` : "No failure is settled yet.";
	const text = `${chains.length ? `${chains.join(". ")}.` : known.map((n) => n.name).join(", ") + "."} ${failure}`;
	const id = `read:${owner.id}`;
	const title = `${owner.name}`;
	const hit = d.journal.find((j) => j.id === id);
	if (hit) {
		hit.title = title;
		hit.text = text;
		hit.status = "open";
	} else d.journal.push({
		id,
		title,
		text,
		status: "open"
	});
}
function placeCompanion(d) {
	const mates = Object.values(d.actors).filter((a) => a.companion && a.alive);
	if (!mates.length || d.combat) return;
	const spots = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
		[1, 1],
		[-1, 1],
		[1, -1],
		[-1, -1]
	];
	let used = 0;
	for (const mate of mates) {
		mate.mapId = d.mapId;
		let placed = false;
		for (let i = used; i < spots.length; i++) {
			const [dx, dy] = spots[i];
			const x = d.player.x + dx;
			const y = d.player.y + dy;
			if (walkable(d, x, y, mate.id)) {
				mate.x = x;
				mate.y = y;
				used = i + 1;
				placed = true;
				break;
			}
		}
		if (!placed) {
			mate.x = d.player.x;
			mate.y = d.player.y;
		}
	}
}
function movePlayer(d, x, y) {
	const mates = Object.values(d.actors).filter((a) => a.companion && a.alive && a.mapId === d.mapId).sort((a, b) => Number(a.template === "cinder") - Number(b.template === "cinder"));
	const ox = d.player.x;
	const oy = d.player.y;
	d.player.x = x;
	d.player.y = y;
	if (!d.combat && mates.length) {
		const [first, second] = mates;
		if (first) {
			first.x = ox;
			first.y = oy;
		}
		if (second) {
			const spots = [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			];
			let placed = false;
			for (const [dx, dy] of spots) {
				const sx = ox + dx;
				const sy = oy + dy;
				if (sx === x && sy === y) continue;
				if (walkable(d, sx, sy, second.id)) {
					second.x = sx;
					second.y = sy;
					placed = true;
					break;
				}
			}
			if (!placed) {
				second.x = ox;
				second.y = oy;
			}
		}
	}
	const ch = tileAt(MAPS[d.mapId], x, y);
	const iced = ITEMS[d.equipped.armor ?? ""]?.ice || d.mapId === "tundra" && d.flags.iceSpan === true;
	if (ch === "!" && d.player.hp > 8 && !iced) {
		applyHp(d, "player", d.flags.iceCut ? 2 : 1, false);
		if (!d.flags.iceNoted) {
			d.flags.iceNoted = true;
			addLog(d, d.flags.iceCut ? "The cut glaze bills the middle twice. The edges of the walk do not." : "The brass ice takes a bite. The edges of the walk do not.");
		}
	}
	const slick = ITEMS[d.equipped.armor ?? ""]?.slick;
	if (d.mapId === "switch" && !d.flags.switchGreased && !slick && x >= 18 && x <= 24 && y >= 10 && y <= 13 && !d.flags.switchSlipped && d.player.hp > 6) {
		d.flags.switchSlipped = true;
		applyHp(d, "player", 1, false);
		addLog(d, "The plates take a little blood. Boots would keep your feet. Grease would keep the yard.");
	}
	const mitt = ITEMS[d.equipped.armor ?? ""]?.heat;
	if (d.mapId === "pane" && d.flags.paneBed && !mitt && x >= 5 && x <= 11 && y >= 6 && y <= 10 && !d.flags.paneScorched && d.player.hp > 6) {
		d.flags.paneScorched = true;
		applyHp(d, "player", 1, false);
		addLog(d, "The furnace floor takes a little blood. Mitts would keep your hands. They would not seat the flue.");
	}
	if (d.mapId === "road" && y >= 9 && !d.flags.roadBypass && (d.flags.citadelOpen || d.flags.roadDark || d.flags.citadelFate)) {
		d.flags.roadBypass = true;
		addLog(d, "The south walk holds. The lamps are not required for this footing.");
	}
	if (d.mapId === "sinks" && y >= 16 && !d.flags.seenMouth) {
		d.flags.seenMouth = true;
		addLog(d, "The south cut opens onto the stack mouth. The city continues on foot.");
	}
	const moth = d.actors.cinder;
	if (moth && moth.mapId === d.mapId && !d.flags.cinderSeen && dist(d.player, moth) <= 2) {
		d.flags.cinderSeen = true;
		addLog(d, "Something small is nested on the reed. It is watching the lung, not you.");
	}
	if (!d.combat && !d.dialogue) {
		const line = barkLine(d);
		if (line) addLog(d, line);
	}
	const walked = Number(d.flags.steps ?? 0) + 1;
	d.flags.steps = walked;
	if (walked % 12 === 0) d.flags.hour = (Number(d.flags.hour ?? 0) + 1) % 4;
	nudgeCreature(d, ox, oy);
	if (d.mapId === "sinks" && y >= 12 && oy < 12 && !d.combat && !d.dialogue && !d.flags.checkpointSpoke && !d.flags.act1 && !d.flags.usedCrawl) {
		d.dialogue = {
			convo: "guard-line",
			node: "start"
		};
		d.panel = "none";
		d.path = [];
		play("talk");
	}
}
function fateOf(d, a, escapes, override) {
	if (override) return override;
	if (!a.alive) return "dead";
	if (escapes?.includes(a.id)) return "escaped";
	if (d.flags[`down:${a.id}`]) return "broken-open";
	if (!a.hostile) return "stood-down";
	return "unresolved";
}
function fatePhrase(fate) {
	if (fate === "dead") return "died";
	if (fate === "escaped") return "left the engagement";
	if (fate === "broken-open") return "came apart, and stayed";
	if (fate === "stood-down") return "stood down";
	return "still armed";
}
function baselineOf(people) {
	if (people.some((p) => p.fate === "dead")) return "lost";
	if (people.some((p) => p.fate === "broken-open" || p.fate === "escaped")) return "altered";
	return "preserved";
}
function roomVerbs(d, verbMark) {
	const used = {};
	if (!verbMark) return used;
	for (const id of Object.keys(VERB_VOICE)) {
		const delta = (d.verbs?.[id] ?? 0) - (verbMark[id] ?? 0);
		if (delta > 0) used[id] = delta;
	}
	return used;
}
function titleFor(people) {
	const allDown = people.every((p) => p.fate === "stood-down");
	const allDead = people.every((p) => p.fate === "dead");
	if (allDown) return people.length === 1 ? `${people[0].name} stood down` : "They stood down";
	if (allDead) return people.length === 1 ? `${people[0].name} unraveled` : "The room emptied";
	if (people.some((p) => p.fate === "escaped") && people.every((p) => p.fate === "escaped" || p.fate === "dead")) return "They left the engagement";
	return "The engagement let go";
}
function worldNotes(people) {
	const notes = [];
	const varr = people.find((p) => p.id === "varr");
	if (!varr) return notes;
	if (varr.fate === "dead" || varr.fate === "escaped") notes.push("Checkpoint leadership is vacant.");
	else if (varr.fate === "stood-down" || varr.fate === "broken-open") notes.push("Checkpoint remained under Captain Varr.");
	return notes;
}
function placeName(mapId, ids) {
	if (mapId === "sinks" && ids.some((id) => id === "varr" || id === "en1" || id === "en2")) return "The Bureau checkpoint";
	return MAPS[mapId]?.name ?? mapId;
}
function stampFacts(d, people, changes, encounterId, baseline) {
	for (const p of people) {
		d.flags[`fact:stood-down:${p.id}`] = p.fate === "stood-down";
		d.flags[`fact:dead:${p.id}`] = p.fate === "dead";
		d.flags[`fact:escaped:${p.id}`] = p.fate === "escaped";
	}
	for (const c of changes) {
		if (c.verb === "cut") d.flags[`fact:severed:${c.ownerId}:${c.nodeId}`] = true;
		if (c.verb === "mend" || c.verb === "repair") d.flags[`fact:severed:${c.ownerId}:${c.nodeId}`] = false;
	}
	d.flags[`fact:baseline:${encounterId}`] = baseline;
	const varr = people.find((p) => p.id === "varr");
	if (varr?.fate === "stood-down" || varr?.fate === "broken-open") d.flags.checkpointLead = "varr";
	if (varr?.fate === "dead" || varr?.fate === "escaped") d.flags.checkpointLead = "vacant";
	reconcileWorld(d);
}
function fileDeed(d, snap, closing, override) {
	const present = snap.roster.map((id) => d.actors[id]).filter((a) => Boolean(a));
	if (!present.length) return;
	const people = present.map((a) => {
		const fate = fateOf(d, a, snap.escapes, override?.[a.id]);
		return {
			id: a.id,
			name: a.name,
			fate,
			weaponAtStart: snap.weaponsAtStart[a.id] ?? a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n)),
			weaponAtEnd: fate !== "dead" && a.alive && a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n))
		};
	});
	const baseline = baselineOf(people);
	const world = worldNotes(people);
	const changes = snap.changes;
	const lines = [
		...people.map((p) => `${p.name}: ${fatePhrase(p.fate)}.`),
		...changes.map((c) => `${c.verb}. ${c.edge}. ${c.immediate}.${c.downstream ? ` ${c.downstream}` : ""}`),
		...world,
		closing ?? ""
	].filter(Boolean);
	const approach = tendencies(d).join(" · ") || "No habit settled.";
	const seq = Number(d.flags.deedCount ?? 0) + 1;
	d.flags.deedCount = seq;
	const ids = [...present.map((a) => a.id)].sort();
	const encounterId = `${snap.mapId}:${ids.join("+")}`;
	if (!d.deeds) d.deeds = [];
	d.deeds.unshift({
		id: `deed-${seq}`,
		seq,
		title: titleFor(people),
		place: placeName(snap.mapId, ids),
		mapId: snap.mapId,
		encounterId,
		text: lines.join(" "),
		approach,
		participants: people,
		changes,
		baseline,
		used: roomVerbs(d, snap.verbMark),
		resolved: true,
		world: world.length ? world : void 0
	});
	if (d.deeds.length > 40) d.deeds.length = 40;
	stampFacts(d, people, changes, encounterId, baseline);
}
function seam(nodes, id) {
	return nodes.find((n) => n.id === id);
}
function ensureMachines(d) {
	for (const m of MACHINES) if (!d.machines[m.id]) d.machines[m.id] = structuredClone(m);
}
function bellowsFeeding(d) {
	const lung = d.machines.bellows;
	if (!lung) return true;
	const reed = seam(lung.nodes, "reed");
	if (!reed) return true;
	return nodeLive(lung.nodes, reed);
}
function pressureToGallery(d) {
	if (!bellowsFeeding(d)) return false;
	const fate = String(d.flags.pumpFate ?? "");
	if (fate === "mend" || fate === "wren" || fate === "speech" || fate === "bleed") return true;
	const pump = d.machines.pump;
	if (!pump) return false;
	const valve = seam(pump.nodes, "valve");
	const bypass = seam(pump.nodes, "bypass");
	const pipe = seam(pump.nodes, "pipe");
	if (valve && nodeLive(pump.nodes, valve)) return true;
	if (bypass?.severed && pipe && nodeLive(pump.nodes, pipe)) return true;
	return false;
}
function setDerived(n, live) {
	if (!n) return;
	n.severed = !live;
	n.integrity = live ? 100 : 0;
}
function accessFlag(d, key, open, opened, closed) {
	const prev = d.flags[key];
	d.flags[key] = open;
	if (prev === open || d.phase !== "play") return;
	if (open) addLog(d, opened);
	else if (prev === true) addLog(d, closed);
}
function tileFree(d, x, y, self) {
	const map = MAPS["sinks"];
	if (!map) return false;
	const ch = tileAt(map, x, y);
	if (!WALKABLE.has(ch)) return false;
	const door = LOCKED_DOORS.find((row) => row.map === "sinks" && row.x === x && row.y === y);
	if (door && !d.flags[door.flag]) return false;
	if (Object.values(d.machines).some((m) => m.mapId === "sinks" && m.x === x && m.y === y)) return false;
	if (d.player.mapId === "sinks" && d.player.x === x && d.player.y === y) return false;
	for (const a of Object.values(d.actors)) {
		if (!a.alive || a.id === self || a.mapId !== "sinks") continue;
		if (a.x === x && a.y === y) return false;
	}
	return true;
}
function park(d, id, x, y) {
	const a = d.actors[id];
	if (!a || !a.alive || a.companion || a.hostile || d.combat) return;
	const spots = [
		[x, y],
		[x + 1, y],
		[x - 1, y],
		[x, y + 1],
		[x, y - 1]
	];
	for (const [sx, sy] of spots) {
		if (a.mapId === "sinks" && a.x === sx && a.y === sy) return;
		if (!tileFree(d, sx, sy, id)) continue;
		a.mapId = "sinks";
		a.x = sx;
		a.y = sy;
		return;
	}
}
function observeSinks(d) {
	if (!d.flags.checkpointLead && !d.flags.pumpFate && !d.flags.sumpOpen && !d.flags.jackHeld && !d.flags.gaugeRead) return;
	const bits = [];
	if (d.flags.checkpointLead === "varr") bits.push("Bureau control is live. The plate stair answers to Varr.");
	if (d.flags.checkpointLead === "vacant") bits.push("Bureau control is vacant. The plate stair has no signature. The squad holds the road mouth.");
	if (d.flags.pumpFate === "mend" || d.flags.pumpFate === "wren" || d.flags.pumpFate === "speech") bits.push("Pressure is seated. The gallery feed can drink.");
	else if (d.flags.pumpFate === "bleed") bits.push("The bypass is thrown. Brown pressure reaches the gallery feed.");
	else if (d.flags.pumpFate === "flood") bits.push("The pump floods the cellars. The gallery head stays dry.");
	else if (d.flags.pumpFate === "lockout") bits.push("The lockout is gone. The gallery head is still unfed.");
	if (d.flags.sumpOpen) bits.push("The sump door is open.");
	else if (d.flags.pumpFate || d.flags.checkpointLead) bits.push("The sump door is shut.");
	if (d.flags.jackMended) bits.push("The gallery footing is itself again.");
	else if (d.flags.jackHeld) bits.push("The gallery crown is held, not healed.");
	if (d.flags.gaugeCut) bits.push("The west pocket's real feed was cut. The gauge face was never the parent.");
	else if (d.flags.gaugeRead) bits.push("A gauge in the west pocket was a costume. The parent sits behind the face.");
	const pump = d.journal.find((j) => j.id === "pump");
	if (pump && d.flags.pumpFate && pump.status === "open") pump.status = "done";
	const text = bits.join(" ");
	const hit = d.journal.find((j) => j.id === "sinks-now");
	if (hit) {
		hit.title = "The Sinks, as they are";
		hit.text = text;
		hit.status = "open";
	} else d.journal.push({
		id: "sinks-now",
		title: "The Sinks, as they are",
		text,
		status: "open"
	});
}
function reconcileWorld(d) {
	ensureMachines(d);
	ensureCast(d);
	const lead = d.flags.checkpointLead;
	const bar = d.machines.bar;
	if (bar) {
		setDerived(seam(bar.nodes, "sign"), lead === "varr");
		const stair = seam(bar.nodes, "stair");
		accessFlag(d, "plateStair", stair ? nodeLive(bar.nodes, stair) : false, "The plate stair's bar comes up. The checkpoint still has a signature.", "The plate stair drops. Nobody is signed to lift it.");
	}
	const watch = lead === "vacant";
	if (watch && d.flags.roadWatch !== true && d.phase === "play") addLog(d, "Moll and Hess leave the plate. They hold the road mouth.");
	if (!watch && d.flags.roadWatch === true && d.phase === "play") addLog(d, "The squad is back on the plate.");
	d.flags.roadWatch = watch;
	if (!d.combat && (lead === "varr" || lead === "vacant")) {
		if (watch) {
			park(d, "en1", 17, 13);
			park(d, "en2", 16, 12);
		} else {
			park(d, "en1", 4, 13);
			park(d, "en2", 8, 14);
		}
	}
	const head = d.machines.head;
	if (head && head.x === 19 && head.y === 5) {
		head.x = 19;
		head.y = 4;
	}
	if (head) {
		setDerived(seam(head.nodes, "feed"), pressureToGallery(d));
		const leaf = seam(head.nodes, "leaf");
		accessFlag(d, "sumpOpen", leaf ? nodeLive(head.nodes, leaf) : false, "The gallery door takes pressure. The dry bar lets go.", "The gallery door goes dry again.");
	}
	const jack = d.machines.jack;
	const footing = jack ? seam(jack.nodes, "footing") : void 0;
	if (footing && jack && nodeLive(jack.nodes, footing)) {
		const was = d.flags.jackHeld === true;
		d.flags.jackHeld = true;
		if (footing.integrity >= 100) d.flags.jackMended = true;
		if (!was && d.flags.galleryCache !== true && d.phase === "play") {
			d.flags.galleryCache = true;
			addItem(d, "scrap", 1);
			addLog(d, "Under the crown: plate scrap, and a dry corner the alley can use.");
		}
	}
	observeSinks(d);
	reconcileLandmarks(d);
	reconcileWard(d);
	reconcileCity(d);
	reconcileNetwork(d);
	ensureCompanions(d);
	placeCreature(d);
	syncShade(d);
	cityRoutines(d);
	d.flags.onRoad = d.mapId === "road";
	if (d.phase === "play") {
		const nearMachine = (id) => {
			const machine = d.machines[id];
			return Boolean(machine && machine.mapId === d.mapId && Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y) <= 2);
		};
		if (nearMachine("gauge")) d.flags.gaugeSeen = true;
		if (nearMachine("still")) d.flags.stillSeen = true;
		if (nearMachine("winchhouse")) d.flags.winchSeen = true;
		if (nearMachine("buffer")) d.flags.bufferSeen = true;
	}
	reconcileQuests(d);
}
function ensureCast(d) {
	for (const spawn of SPAWNS) if (!d.actors[spawn.id]) d.actors[spawn.id] = spawnActor(spawn);
}
function syncShade(d) {
	const shade = d.actors.shade;
	if (!shade || !shade.alive || d.combat) return;
	const dark = Boolean(d.flags.roadDark);
	shade.hostile = dark;
	shade.aggro = dark;
	shade.vision = dark && d.flags.cartPinned ? 6 : dark ? 4 : 0;
	if (dark && d.flags.cartPinned && d.mapId === "road" && !d.flags.cartCover && d.phase === "play") {
		d.flags.cartCover = true;
		addLog(d, "The pinned cart is cover. The shade is using it.");
	}
}
function standAt(d, id, mapId, x, y) {
	const a = d.actors[id];
	if (!a || !a.alive || a.companion || a.hostile || d.combat) return;
	if (a.mapId === mapId && a.x === x && a.y === y) return;
	const map = MAPS[mapId];
	if (!map) return;
	if (!WALKABLE.has(tileAt(map, x, y))) return;
	const door = LOCKED_DOORS.find((row) => row.map === mapId && row.x === x && row.y === y);
	if (door && !d.flags[door.flag]) return;
	if (Object.values(d.machines).some((m) => m.mapId === mapId && m.x === x && m.y === y)) return;
	for (const o of Object.values(d.actors)) {
		if (o.id === id || !o.alive || o.mapId !== mapId) continue;
		if (o.x === x && o.y === y) return;
	}
	if (d.player.mapId === mapId && d.player.x === x && d.player.y === y) return;
	a.mapId = mapId;
	a.x = x;
	a.y = y;
}
function cityRoutines(d) {
	if (d.combat) return;
	const hour = Number(d.flags.hour ?? 0) % 4;
	if (d.flags.nessaRefuses) standAt(d, "nessa", "haven", 5, 3);
	else if (hour === 2) standAt(d, "nessa", "haven", 8, 3);
	else standAt(d, "nessa", "haven", 7, 3);
	if (d.flags.foodLive) standAt(d, "sela", "haven", hour === 1 ? 30 : 29, 6);
	else standAt(d, "sela", "haven", 31, 8);
	if (d.actors.pip) {
		if (d.flags.foodLive) standAt(d, "pip", "haven", hour === 2 ? 29 : hour === 3 ? 31 : 30, hour === 3 ? 6 : 7);
		else if (d.flags.ashAccess) standAt(d, "pip", "haven", 9, 18);
		else standAt(d, "pip", "haven", 14, 11);
	}
	if (d.flags.tenementWarm) standAt(d, "nell", "rust", hour === 3 ? 10 : 9, 8);
	else if (d.flags.washLive) standAt(d, "nell", "rust", 7, 16);
	else if (d.flags.guildWarm && !d.flags.tenementWarm) standAt(d, "nell", "rust", 5, 7);
	if (d.flags.rillSpoken) standAt(d, "rill", "quarry", 8, 11);
	if (d.flags.hollowWarm) standAt(d, "kel", "tundra", hour === 3 ? 13 : 14, 14);
	else if (d.flags.tundraWalked) standAt(d, "kel", "tundra", 14, 6);
	if (d.flags.roadDark) standAt(d, "lark", "road", 12, 12);
	else if (d.flags.stoneMoving) standAt(d, "lark", "road", 30, 4);
	else standAt(d, "lark", "road", 22, 4);
	if (d.flags.cartEase) standAt(d, "moss", "road", 32, 5);
	else standAt(d, "moss", "road", 17, 12);
	if (d.flags.bellowsLive === false) standAt(d, "doss", "sinks", 6, 4);
	else standAt(d, "doss", "sinks", 24, 5);
	if (d.flags.foodLive) standAt(d, "ada", "haven", 27, 6);
	else if (d.flags.plotsRefused) standAt(d, "ada", "haven", 30, 8);
	else standAt(d, "ada", "haven", 27, 7);
	if (d.flags.quarryStone === "clear") standAt(d, "pim", "quarry", 11, 11);
	else if (d.flags.quarryStone === "scarred") standAt(d, "pim", "quarry", 18, 19);
	else standAt(d, "pim", "quarry", 18, 16);
	if (d.flags.citadelFate === "sever") standAt(d, "sarn", "citadel", 30, 10);
	else if (d.flags.guardToll) standAt(d, "sarn", "citadel", 18, 6);
	else standAt(d, "sarn", "citadel", 14, 8);
	if (d.flags.hollowWarm) standAt(d, "drift", "tundra", 13, 15);
	else standAt(d, "drift", "tundra", 8, 15);
	if (d.flags.foodLive && d.mapId === "haven" && !d.flags.pipHome && d.phase === "play") {
		d.flags.pipHome = true;
		addLog(d, "The child is not in the cut. The plots are drinking, and the alley kept the night without her.");
	}
	if (d.flags.bellowsLive === false && d.mapId === "sinks" && !d.flags.dossShift && d.phase === "play") {
		d.flags.dossShift = true;
		addLog(d, "Doss is not on the reed. The lung stopped making weather, and the sleeper moved.");
	}
	if (d.flags.quarryStone === "clear" && d.mapId === "quarry" && !d.flags.pimCount && d.phase === "play") {
		d.flags.pimCount = true;
		addLog(d, "Pim is on the count. The slab missed, and the fear went with it.");
	}
	if (d.flags.hollowWarm && d.mapId === "tundra" && !d.flags.driftBed && d.phase === "play") {
		d.flags.driftBed = true;
		addLog(d, "Drift is in the hollow. The weather arrived before any speech about it.");
	}
	if (d.flags.foodLive && d.mapId === "haven" && !d.flags.adaPlate && d.phase === "play") {
		d.flags.adaPlate = true;
		addLog(d, "Ada is at the plots with a plate. The bed is the parent. The thanks is not.");
	}
	if (d.flags.roadDark && d.mapId === "road" && !d.flags.larkSouth && d.phase === "play") {
		d.flags.larkSouth = true;
		addLog(d, "Lark is not on the high walk. The lamps are out, and the runner took the cut the glass does not own.");
	}
	if (d.flags.ashAccess && d.flags.stillBroken !== true && d.flags.stillLicensed !== true) standAt(d, "vetch", "haven", 8, 18);
	else standAt(d, "vetch", "haven", 8, 15);
	if (d.flags.gaugeCut) standAt(d, "brin", "sinks", 7, 18);
	if (d.flags.crewFled) {
		standAt(d, "crew1", "quarry", 21, 20);
		standAt(d, "crew2", "quarry", 23, 20);
	}
	const servo = d.actors.servo;
	if (servo?.alive && d.flags.gaugeCut && !servo.hostile) {
		servo.hostile = true;
		servo.aggro = true;
		servo.vision = 4;
	}
	if (d.flags.cartPinned && d.flags.stoneMoving && d.mapId === "rust" && !d.flags.rustHeldCart && d.phase === "play") {
		d.flags.rustHeldCart = true;
		addLog(d, "Stone left the pit. It is not in this yard. The waystation is still holding the cart.");
	}
	if (d.flags.cartEase && d.flags.stoneMoving && d.mapId === "rust" && !d.flags.rustEarlyCart && d.phase === "play") {
		d.flags.rustEarlyCart = true;
		addLog(d, "A cart is already in the yard. The speech about the haul has not caught up to the weight.");
	}
	if (d.flags.washSpill && d.mapId === "rust" && !d.flags.washNoted && d.phase === "play") {
		d.flags.washNoted = true;
		addLog(d, "The tenement pipe is drinking. The forge leg is the one that went dry.");
	}
	const claim = d.machines.kilnstamp?.nodes.find((n) => n.id === "claim");
	const clerk = d.actors.cress;
	if (clerk?.alive && claim?.severed && !clerk.hostile) {
		clerk.hostile = true;
		clerk.aggro = true;
		clerk.vision = 5;
	}
	if (clerk?.alive && claim && !claim.severed && clerk.hostile) {
		clerk.hostile = false;
		clerk.aggro = false;
		clerk.vision = 0;
	}
	if (d.flags.kilnRefused) standAt(d, "harl", "kiln", 28, 6);
	else standAt(d, "harl", "kiln", 4, 6);
	if (d.flags.kilnHouses && hour !== 3) standAt(d, "teb", "kiln", 14, 8);
	else standAt(d, "teb", "kiln", 8, 14);
	standAt(d, "jun", "kiln", hour === 2 ? 27 : 30, hour === 2 ? 6 : 7);
	if (d.flags.kilnCellar) standAt(d, "nim", "kiln", 7, 18);
	else standAt(d, "nim", "kiln", 6, 15);
	if (d.flags.vossLeft) standAt(d, "voss", "road", 18, 11);
	else if (d.flags.stampCut) standAt(d, "voss", "kiln", 18, 16);
	else standAt(d, "voss", "kiln", 14, 9);
	const yardClaim = d.machines.switchdesk?.nodes.find((n) => n.id === "claim");
	const rue = d.actors.rue;
	if (rue?.alive && (yardClaim?.severed || d.flags.switchCaught) && !rue.hostile) {
		rue.hostile = true;
		rue.aggro = true;
		rue.vision = 5;
	}
	if (rue?.alive && yardClaim && !yardClaim.severed && !d.flags.switchCaught && rue.hostile) {
		rue.hostile = false;
		rue.aggro = false;
		rue.vision = 0;
	}
	if (d.flags.switchJam && !d.flags.switchShunt) standAt(d, "hale", "switch", 22, 12);
	else if (hour === 3) standAt(d, "hale", "switch", 24, 8);
	else standAt(d, "hale", "switch", 18, 9);
	if (d.flags.switchShed) standAt(d, "wick", "switch", 23, 7);
	else standAt(d, "wick", "switch", 20, 12);
	if (hour === 3) standAt(d, "rue", "switch", 6, 4);
	else standAt(d, "rue", "switch", 5, 6);
	if (d.flags.switchBay) standAt(d, "ske", "switch", 7, 15);
	else standAt(d, "ske", "switch", 6, 12);
	const glassClaim = d.machines.panestamp?.nodes.find((n) => n.id === "claim");
	const ness = d.actors.ness;
	if (ness?.alive && (glassClaim?.severed || d.flags.paneCaught) && !ness.hostile) {
		ness.hostile = true;
		ness.aggro = true;
		ness.vision = 5;
	}
	if (ness?.alive && glassClaim && !glassClaim.severed && !d.flags.paneCaught && ness.hostile) {
		ness.hostile = false;
		ness.aggro = false;
		ness.vision = 0;
	}
	if (d.flags.paneRefused) standAt(d, "orla", "pane", 26, 10);
	else if (hour === 3) standAt(d, "orla", "pane", 14, 6);
	else standAt(d, "orla", "pane", 6, 8);
	if (d.flags.paneVault) standAt(d, "fen", "pane", 10, 16);
	else standAt(d, "fen", "pane", 12, 12);
	if (hour === 3) standAt(d, "ness", "pane", 26, 12);
	else standAt(d, "ness", "pane", 23, 7);
	if (d.flags.paneCharge) standAt(d, "panemoth", "pane", 14, 10);
	else standAt(d, "panemoth", "pane", 10, 17);
	if (d.flags.paneCharge) standAt(d, "sol", "road", 27, 2);
	else standAt(d, "sol", "road", 26, 4);
	if (d.flags.paneCharge && d.mapId === "pane" && !d.flags.paneMothOut && d.phase === "play") {
		d.flags.paneMothOut = true;
		addLog(d, "A moth is on the yard heat. Nobody hired it. The melt is the parent it came for.");
	}
	if (d.flags.heardHour === hour || d.phase !== "play" || d.dialogue) return;
	d.flags.heardHour = hour;
	if (hour === 1 && d.mapId === "haven" && !d.flags.foodLive) addLog(d, "Midday. The cups are still empty. People walk them anyway.");
	if (hour === 2 && d.mapId === "haven" && d.flags.foodLive) addLog(d, "The ward takes a meal. The plots are still the parent of it.");
	if (hour === 3 && d.mapId === "rust" && d.flags.tenementWarm) addLog(d, "The sleepers go to the flues. The hall is not their bed.");
	if (hour === 3 && d.mapId === "rust" && !d.flags.tenementWarm && d.flags.guildWarm) addLog(d, "Night, and the beds are cold. People drift toward the hall that has heat.");
	if (hour === 1 && d.mapId === "kiln" && !d.flags.brickLive && d.flags["seen:kiln"]) addLog(d, "The yard is up. The set is not. People walk the clay anyway.");
	if (hour === 2 && d.mapId === "kiln" && d.flags.kilnHouses) addLog(d, "The houses take the heat they were given. The bill, if there is one, is a different parent.");
	if (hour === 1 && d.mapId === "switch" && !d.flags.switchGreased) addLog(d, "The plates are up. They still take a little blood and call it weather.");
	if (hour === 2 && d.mapId === "switch" && d.flags.switchToll) addLog(d, "Rue can see the haul. The seeing is a bill.");
	if (hour === 1 && d.mapId === "pane" && !d.flags.paneCharge && d.flags["seen:pane"]) addLog(d, "The glasshouse is up. The melt is not. People walk the sand anyway.");
	if (hour === 2 && d.mapId === "pane" && d.flags.paneLevy) addLog(d, "Ness can see the melt. The seeing is a bill.");
}
function nudgeCreature(d, ox, oy) {
	const moth = d.actors.cinder;
	if (!moth?.companion || !moth.alive || moth.mapId !== d.mapId || d.combat) return;
	const step = Number(d.flags.mothStep ?? 0) + 1;
	d.flags.mothStep = step;
	const toward = "toward";
	if ((d.mapId === "road" || d.mapId === "tundra") && d.flags.roadDark && !d.flags.cinderDarkOk) {
		if (walkable(d, ox, oy, moth.id)) {
			moth.x = ox;
			moth.y = oy;
		}
		return;
	}
	const perch = d.mapId === "sinks" && d.flags.bellowsLive !== false ? d.machines.bellows : d.mapId === "haven" && d.flags.foodLive ? d.machines.plots : d.mapId === "tundra" && d.flags.hollowWarm ? d.machines.hollow : null;
	if (perch && Math.abs(d.player.x - perch.x) + Math.abs(d.player.y - perch.y) <= 5 && step % 2 === 0) {
		toward(perch.x, perch.y);
		return;
	}
	const gap = Math.abs(moth.x - d.player.x) + Math.abs(moth.y - d.player.y);
	if (step % 3 === 0 && gap <= 2 && walkable(d, ox, oy, moth.id)) {
		moth.x = ox;
		moth.y = oy;
		return;
	}
	if (gap > 3) toward(d.player.x, d.player.y);
}
function wardSplit(d) {
	const split = d.flags.wardSplit;
	if (split === "market" || split === "clinic" || split === "shared") return split;
	return "shared";
}
function edgeFlag(d, key, open, opened, closed) {
	const prev = d.flags[key];
	d.flags[key] = open;
	if (prev === void 0 || prev === open || d.phase !== "play") return;
	addLog(d, open ? opened : closed);
}
function reconcileLandmarks(d) {
	const lung = d.machines.bellows;
	const reed = lung ? seam(lung.nodes, "reed") : void 0;
	edgeFlag(d, "bellowsLive", reed ? nodeLive(lung.nodes, reed) : true, "The bellows reed seats. The pump has a lung again.", "The bellows stops. A mended pump can still leave the city dry.");
	const col = d.machines.colossus;
	const throat = col ? seam(col.nodes, "throat") : void 0;
	const breath = throat ? nodeLive(col.nodes, throat) : true;
	const boom = d.machines.crane ? seam(d.machines.crane.nodes, "boom") : void 0;
	if (boom && !boom.severed) {
		if (!breath) boom.integrity = Math.min(boom.integrity, 34);
		else if (d.flags.colossusMended) boom.integrity = Math.max(boom.integrity, 80);
	}
	if (d.mapId === "quarry" && !d.flags.seenQuarry && breath && d.phase === "play") addLog(d, "The colossus is breathing. The crane cable is not holding the pit alone.");
	if (d.mapId === "quarry") d.flags.seenQuarry = true;
	if (d.flags.seenQuarry) edgeFlag(d, "colossusBreath", breath, "The colossus throat takes air. The crane cable is no longer alone.", "The colossus throat stops. The crane cable is carrying the pit by itself.");
	const orr = d.machines.orrery;
	const core = d.machines.crucible;
	const siphon = core ? seam(core.nodes, "siphon") : void 0;
	const turning = Boolean(siphon && core && nodeLive(core.nodes, siphon) && d.flags.citadelFate !== "sever");
	if (orr) setDerived(seam(orr.nodes, "drive"), turning);
	if (d.mapId === "citadel" && !d.flags.seenCitadel && turning && d.phase === "play") addLog(d, "The orrery is turning. It is drinking from the siphon, not from the sky.");
	if (d.mapId === "citadel") d.flags.seenCitadel = true;
	if (d.flags.seenCitadel || d.flags.citadelFate) edgeFlag(d, "orreryTurn", turning, "The orrery takes the siphon. The citadel still has a clock.", "The orrery stops. The siphon is not sending a child.");
	const hollow = d.machines.hollow;
	const drive = orr ? seam(orr.nodes, "drive") : void 0;
	const weather = Boolean(drive && orr && nodeLive(orr.nodes, drive)) && d.flags.iceCut !== true;
	if (hollow) setDerived(seam(hollow.nodes, "feed"), weather);
	if (d.flags.tundraWalked) edgeFlag(d, "hollowWarm", weather, "The tundra hollow takes the orrery's weather. Kel can sleep off the ice.", d.flags.iceCut ? "The tundra hollow goes cold. The glaze was cut. A clock can still be sending." : "The tundra hollow goes cold. The orrery stopped sending a child downhill.");
	else d.flags.hollowWarm = weather;
}
function reconcileWard(d) {
	const cistern = d.machines.cistern;
	if (!cistern) return;
	const fed = pressureToGallery(d);
	setDerived(seam(cistern.nodes, "main"), fed);
	const split = wardSplit(d);
	const marketOn = fed && split !== "clinic";
	const clinicOn = fed && split !== "market";
	setDerived(seam(cistern.nodes, "market"), marketOn);
	setDerived(seam(cistern.nodes, "clinic"), clinicOn);
	accessFlag(d, "wardMarket", marketOn, "The stall leg takes water.", "The stall leg goes dry.");
	accessFlag(d, "wardClinic", clinicOn, "The clinic leg takes water.", "The clinic leg goes dry.");
	const fate = String(d.flags.pumpFate ?? "");
	const goods = !marketOn ? "none" : fate === "mend" || fate === "wren" || fate === "speech" ? "clean" : fate === "bleed" && d.flags.provisionalStamp ? "stamped" : fate === "bleed" ? "brown" : "none";
	d.flags.wardGoods = goods;
	observeWard(d);
}
function observeWard(d) {
	const fate = String(d.flags.pumpFate ?? "");
	if (!fate && !d.flags.seenWard && !d.flags.checkpointLead) return;
	const bits = [];
	if (d.flags.wardMarket && d.flags.wardClinic) bits.push("The ward split feeds the stall and the clinic.");
	else if (d.flags.wardMarket) bits.push("The stall has the feed. The clinic tap is dry.");
	else if (d.flags.wardClinic) bits.push("The clinic has the feed. The stall is dry.");
	else bits.push("The cistern main is dry. It drinks from the Sinks pump, not from a local well.");
	if (fate === "bleed") bits.push(d.flags.provisionalStamp ? "The Bureau stamped the brown water as provisional." : "The water is brown. The stall will not call it drinking water.");
	else if (fate === "mend" || fate === "wren" || fate === "speech") bits.push("The water upstream is seated.");
	else if (fate === "flood") bits.push("The ward hears the cellars. The tap does not.");
	else if (fate === "lockout") bits.push("The Bureau still prices the district as dry. The valve was never seated.");
	if (d.flags.roadWatch) bits.push("Haulage is stopped. The squad is on the road mouth.");
	else if (d.flags.plateStair) bits.push("The plate stair is signed. Freight can move.");
	const text = bits.join(" ");
	const hit = d.journal.find((j) => j.id === "oakhaven");
	if (hit) {
		hit.title = "The lower ward, as it drinks";
		hit.text = text;
		hit.status = "open";
	} else d.journal.push({
		id: "oakhaven",
		title: "The lower ward, as it drinks",
		text,
		status: "open"
	});
}
function slabDown(d) {
	if (d.flags["crane:dropped"] === true) return true;
	const slab = d.machines.crane ? seam(d.machines.crane.nodes, "slab") : void 0;
	return Boolean(slab?.spent);
}
function quarryMark(d) {
	if (!slabDown(d)) return "hung";
	if (d.flags.workersClear && !d.flags.workerHurt) return "clear";
	return "scarred";
}
function hearthSplit(d) {
	const split = d.flags.hearthSplit;
	if (split === "beds" || split === "hall" || split === "shared") return split;
	return "shared";
}
function reconcileCity(d) {
	const stone = quarryMark(d);
	const prev = d.flags.quarryStone;
	d.flags.quarryStone = stone;
	if (prev !== stone && stone !== "hung" && d.phase === "play") addLog(d, stone === "clear" ? "The slab is down, and the riggers were not under it. Stone can leave the pit." : "The slab is down. A rigger's name is on it. The stone can still leave.");
	const arrives = stone !== "hung" && Boolean(d.flags.plateStair) && d.flags.roadWatch !== true;
	d.flags.stoneMoving = arrives;
	const hearth = d.machines.hearth;
	if (hearth) {
		setDerived(seam(hearth.nodes, "haul"), arrives);
		const bed = seam(hearth.nodes, "bed");
		if (bed && !bed.severed) {
			if (d.flags.hearthHeld && !arrives) {
				bed.dependsOn = [];
				bed.integrity = Math.max(bed.integrity, 62);
			} else {
				bed.dependsOn = ["haul"];
				if (arrives && bed.integrity < 40) bed.integrity = 100;
				else if (!arrives) bed.integrity = Math.min(bed.integrity, 18);
			}
		}
		const split = hearthSplit(d);
		const hot = Boolean(bed && nodeLive(hearth.nodes, bed));
		setDerived(seam(hearth.nodes, "beds"), hot && split !== "hall");
		setDerived(seam(hearth.nodes, "hall"), hot && split !== "beds");
		accessFlag(d, "tenementWarm", hot && split !== "hall", "The sleeper flues take heat.", "The sleeper flues go cold.");
		accessFlag(d, "guildWarm", hot && split !== "beds", "The guild flue takes heat.", "The guild flue goes cold.");
	}
	syncWash(d);
	observeCity(d);
}
function syncWash(d) {
	if (d.flags.washChosen !== true) return;
	const wash = d.machines.wash;
	if (!wash) return;
	const head = d.machines.head;
	const feed = head ? seam(head.nodes, "feed") : void 0;
	const wet = Boolean(feed && head && nodeLive(head.nodes, feed));
	setDerived(seam(wash.nodes, "gallery"), wet);
	const shared = d.flags.washShared === true;
	const toSleepers = d.flags.washSpill === true || shared;
	const toForge = d.flags.washSpill !== true || shared;
	setDerived(seam(wash.nodes, "sleepers"), wet && toSleepers);
	setDerived(seam(wash.nodes, "forgeleg"), wet && toForge);
	const valve = seam(wash.nodes, "valve");
	if (valve) {
		valve.severed = false;
		valve.integrity = 84;
		valve.revealed = true;
	}
	d.flags.washLive = Boolean(wet && toSleepers);
}
function observeCity(d) {
	const stone = String(d.flags.quarryStone ?? "hung");
	if (stone === "hung" && !d.flags.hearthHeld && !d.flags.tenementWarm && !d.flags.guildWarm && !d.flags.washChosen && !d.flags.cartPinned && !d.flags.cartEase) return;
	const bits = [];
	if (stone === "clear") bits.push("The quarry slab is down. The riggers were clear.");
	else if (stone === "scarred") bits.push("The quarry slab is down. A rigger was under it.");
	if (d.flags.stoneMoving) bits.push("Stone is on the road. The plate stair is carrying it.");
	else if (stone !== "hung" && d.flags.roadWatch) bits.push("Stone is sitting because the squad holds the road mouth.");
	else if (stone !== "hung") bits.push("Stone is sitting because the plate stair has no signature.");
	if (d.flags.cartPinned) bits.push("The waystation brake is pinned. Stone that leaves the pit does not become ore.");
	else if (d.flags.cartEase) bits.push("The waystation brake was eased. The cart does not wait for a speech.");
	if (d.flags.washSpill) bits.push("The tenement wash is drinking the quench. The forge is the child that goes dry.");
	else if (d.flags.washShared) bits.push("The wash is shared. Sleepers and forge both drink, if the gallery does.");
	if (d.flags.hearthHeld && !d.flags.stoneMoving) bits.push("The fire is banked by hand. The quarry is not its parent.");
	if (d.flags.tenementWarm && d.flags.guildWarm) bits.push("The tenement and the guild hall both have heat.");
	else if (d.flags.tenementWarm) bits.push("The sleeper flues are warm. The hall is not.");
	else if (d.flags.guildWarm) bits.push("The guild hall is warm. The sleepers are not.");
	else bits.push("The tenement hearth is cold.");
	const text = bits.join(" ");
	const hit = d.journal.find((j) => j.id === "city-now");
	if (hit) {
		hit.title = "The city, as it holds";
		hit.text = text;
		hit.status = "open";
	} else d.journal.push({
		id: "city-now",
		title: "The city, as it holds",
		text,
		status: "open"
	});
}
function takeSnap(d) {
	if (!d.combat) return null;
	const roster = d.combat.roster ?? d.combat.order.filter((id) => id !== "player");
	return {
		mapId: d.mapId,
		roster,
		changes: d.combat.changes ?? [],
		escapes: d.combat.escapes ?? [],
		verbMark: d.combat.verbMark,
		weaponsAtStart: d.combat.weaponsAtStart ?? {},
		closing: void 0
	};
}
function releasePending(d, varrFate) {
	const snap = d.pendingEncounter;
	if (!snap) return;
	d.pendingEncounter = null;
	const override = {};
	if (varrFate === "dead") override.varr = "dead";
	else if (varrFate === "stood") override.varr = "stood-down";
	else if (varrFate === "spared") override.varr = "broken-open";
	fileDeed(d, snap, snap.closing, override);
}
function endCombat(d, closing, hold) {
	const tally = d.combat?.tally ?? {
		strikes: 0,
		cuts: 0,
		mends: 0,
		kills: 0
	};
	const fought = Boolean(tally.strikes + tally.cuts + tally.mends + tally.kills > 0);
	const snap = takeSnap(d);
	if (hold && snap && d.player.hp > 0) d.pendingEncounter = {
		...snap,
		closing
	};
	else {
		d.pendingEncounter = null;
		if (d.player.hp > 0 && snap) fileDeed(d, snap, closing);
	}
	d.combat = null;
	d.path = [];
	d.intent = null;
	for (const a of [d.player, ...Object.values(d.actors)]) a.ap = 0;
	if (d.player.hp <= 0) return;
	if (d.mapId === "road") {
		d.dialogue = {
			convo: "road-after",
			node: "start"
		};
		return;
	}
	if (closing) addLog(d, closing);
	else if (fought && tally) addLog(d, evaluate(tally));
	else addLog(d, "The engagement releases. The structure holds, or it doesn't.");
}
function hasEncounter(d, encounterId) {
	return (d.deeds ?? []).some((row) => row.encounterId === encounterId && row.resolved !== false);
}
function actorFate(d, id) {
	for (const row of d.deeds ?? []) {
		const person = row.participants?.find((p) => p.id === id);
		if (person) return person.fate;
	}
	return null;
}
function didStandDown(d, id) {
	return recordedFate(d, id, "stood-down");
}
function didDie(d, id) {
	return recordedFate(d, id, "dead");
}
function didEscape(d, id) {
	return recordedFate(d, id, "escaped");
}
function recordedFate(d, id, fate) {
	return (d.deeds ?? []).some((row) => row.resolved !== false && row.participants?.some((p) => p.id === id && p.fate === fate));
}
function wasSevered(d, ownerId, nodeId) {
	let severed = false;
	const records = [...d.deeds ?? []].reverse();
	for (const row of records) for (const change of row.changes ?? []) {
		if (change.ownerId !== ownerId || change.nodeId !== nodeId) continue;
		if (change.verb === "cut") severed = true;
		if (change.verb === "mend" || change.verb === "repair") severed = false;
	}
	return severed;
}
function wasBaselineLost(d, encounterId) {
	return (d.deeds ?? []).some((row) => row.baseline === "lost" && (!encounterId || row.encounterId === encounterId));
}
function didPreserve(d, encounterId) {
	return (d.deeds ?? []).some((row) => row.encounterId === encounterId && row.baseline === "preserved");
}
function didUseVerb(d, verb, encounterId) {
	if (!encounterId) return (d.verbs?.[verb] ?? 0) > 0;
	return (d.deeds ?? []).some((row) => row.encounterId === encounterId && (row.used?.[verb] ?? 0) > 0);
}
function askHistory(d, q) {
	switch (q.ask) {
		case "encounter": return hasEncounter(d, q.id);
		case "stood-down": return didStandDown(d, q.id);
		case "died": return didDie(d, q.id);
		case "escaped": return didEscape(d, q.id);
		case "severed": return wasSevered(d, q.owner, q.node);
		case "baseline-lost": return wasBaselineLost(d, q.id);
		case "preserved": return didPreserve(d, q.id);
		case "verb": return didUseVerb(d, q.verb, q.id);
		case "now": return actorFate(d, q.id) === q.fate;
		case "checkpoint": return d.flags.checkpointLead === q.lead;
	}
}
function memoryConvo(d, id) {
	if (id === "varr") {
		if (d.flags.varrFate === "dead" || actorFate(d, "varr") === "dead") return null;
		const fate = actorFate(d, "varr");
		const open = fate === "broken-open" || d.flags.varrFate === "spared";
		const quiet = fate === "stood-down" || fate === "escaped" || d.flags.varrFate === "stood";
		if (!open && !quiet) return null;
		if (open) return "varr-memory-open";
		return wasSevered(d, "varr", "chamber") || wasSevered(d, "varr", "mount") || wasSevered(d, "varr", "rifle") ? "varr-memory-cut" : "varr-memory";
	}
	if (id === "en1" || id === "en2") {
		if (d.flags.checkpointLead === "vacant") return `checkpoint-vacant-${id}`;
		if (d.flags.checkpointLead === "varr") return `checkpoint-held-${id}`;
	}
	return null;
}
function evaluate(t) {
	if (t.kills === 0 && t.cuts > 0 && t.strikes === 0) return "Precision. The room changed shape. Nobody had to leave it.";
	if (t.kills === 0 && t.cuts > 0) return "You cut the encounter down and left the people standing in it.";
	if (t.kills === 0 && t.mends > 0 && t.strikes === 0) return "Preservation. The fight was mostly putting load back where it belongs.";
	if (t.kills > 0 && t.cuts === 0) return "Ruthlessness. The graphs stayed shut. The bodies did not.";
	if (t.kills > 0 && t.cuts > 0) return "Hybrid. You opened the seams you needed, then finished what was left.";
	if (t.strikes > 0 && t.kills === 0) return "Survival. Blows were traded. The engagement let go anyway.";
	return "The engagement releases. The structure holds, or it doesn't.";
}
function removeFromOrder(d, id) {
	if (!d.combat) return;
	const idx = d.combat.order.indexOf(id);
	if (idx >= 0) d.combat.order.splice(idx, 1);
	if (d.combat.index >= d.combat.order.length) d.combat.index = 0;
}
function onZero(d, a) {
	if (a.id === "player") {
		d.player.hp = 0;
		d.phase = "dead";
		d.combat = null;
		d.dialogue = null;
		d.panel = "none";
		d.deathText = d.ironman ? "The lens cracks. Ironman does not offer a second reading. The Sinks keep their steam without you." : "The lens cracks. The baseline you were holding comes apart. A previous ledger may still exist.";
		d.pendingEncounter = null;
		play("hurt");
		return;
	}
	if (a.downConvo && !d.flags[`down:${a.id}`]) {
		d.flags[`down:${a.id}`] = true;
		a.hp = 1;
		a.hostile = false;
		a.aggro = false;
		a.stunned = false;
		if (d.combat) for (const id of [...d.combat.order]) {
			const o = d.actors[id];
			if (o?.hostile) {
				o.hostile = false;
				o.aggro = false;
			}
		}
		endCombat(d, void 0, true);
		d.dialogue = {
			convo: a.downConvo,
			node: "start"
		};
		addLog(d, `${a.name} is broken open, not gone.`);
		return;
	}
	a.hp = 0;
	a.alive = false;
	a.companion = false;
	if (d.combat?.tally) d.combat.tally.kills += 1;
	addLog(d, `${a.name} loses the last readable baseline.`);
	if (a.template === "enforcer" || a.template === "guard") {
		addItem(d, "scrap", 1);
		d.scrip += 6;
		if (!d.flags.foundRifle) {
			d.flags.foundRifle = true;
			addItem(d, "rifle", 1, 58);
			addItem(d, "coat", 1, 64);
			addLog(d, "You take the steam rifle and the worker's coat. Both are tired.");
		} else addLog(d, "Plate scrap, and a few scrip still in the lining.");
	}
	floatText(a.x, a.y, "unraveled", "#c45c26");
	removeFromOrder(d, a.id);
	if (d.combat && !d.combat.order.some((id) => d.actors[id]?.alive && d.actors[id]?.hostile)) endCombat(d);
}
function applyHp(d, id, dmg, armored = false) {
	const a = actorById(d, id);
	if (!a || !a.alive) return;
	let n = dmg;
	if (armored) n = Math.max(1, Math.round(n * Math.pow(.72, armorCount(a))));
	if (id === "player" && d.equipped.armor && ITEMS[d.equipped.armor]?.resist) {
		const wear = (d.inventory.find((i) => i.id === d.equipped.armor)?.condition ?? 100) / 100;
		const eased = 1 - (1 - (ITEMS[d.equipped.armor].resist ?? 1)) * wear;
		n = Math.max(1, Math.round(n * eased));
	}
	if (a.companion && a.kit?.armor && ITEMS[a.kit.armor]?.resist) n = Math.max(1, Math.round(n * (ITEMS[a.kit.armor].resist ?? 1)));
	if (a.guarding) {
		n = Math.max(1, Math.round(n * .55));
		a.guarding = false;
		addLog(d, id === "player" ? "The brace takes the blow and spends itself." : `${a.name}'s brace takes the blow and spends itself.`);
	}
	a.hp -= n;
	floatText(a.x, a.y, `-${n}`, id === "player" ? "#c45c26" : "#f3ead7");
	if (a.hp <= 0) onZero(d, a);
	else play(id === "player" ? "hurt" : "hit");
}
function healActor(d, id, n) {
	const a = actorById(d, id);
	if (!a || !a.alive) return;
	a.hp = Math.min(a.maxHp, a.hp + n);
	floatText(a.x, a.y, `+${n}`, "#d4b483");
	play("mend");
}
function livingHostiles(d) {
	if (!d.combat) return [];
	return d.combat.order.filter((id) => d.actors[id]?.alive && d.actors[id]?.hostile);
}
function startCombat(d, ids) {
	if (d.phase !== "play") return;
	d.pendingEncounter = null;
	let list = ids.filter((id) => d.actors[id]?.alive);
	if (d.flags.duel) list = list.filter((id) => id !== "rel1");
	if (!list.length) return;
	for (const id of list) {
		const a = d.actors[id];
		if (!a) continue;
		a.hostile = true;
		a.aggro = true;
	}
	const parts = [
		"player",
		...Object.values(d.actors).filter((a) => a.companion && a.alive).map((a) => a.id),
		...list
	];
	const scored = [...new Set(parts)].map((id) => {
		const a = actorById(d, id);
		return {
			id,
			score: a.attrs.perception + a.attrs.finesse + Math.random() * 4
		};
	});
	scored.sort((a, b) => b.score - a.score);
	const weaponsAtStart = {};
	for (const id of list) {
		const a = d.actors[id];
		if (a) weaponsAtStart[id] = a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n));
	}
	d.combat = {
		order: scored.map((s) => s.id),
		index: 0,
		round: 1,
		audited: [],
		plans: {},
		tally: {
			strikes: 0,
			cuts: 0,
			mends: 0,
			kills: 0
		},
		roster: list,
		changes: [],
		escapes: [],
		verbMark: { ...d.verbs ?? {} },
		weaponsAtStart
	};
	d.path = [];
	d.intent = null;
	d.panel = "none";
	d.dialogue = null;
	addLog(d, "Structural engagement.");
	play("unmend");
	beginTurn(d);
}
function currentId(d) {
	if (!d.combat) return null;
	return d.combat.order[d.combat.index] ?? null;
}
function refreshTurn(d, a) {
	if (a.id === "player") {
		a.maxAp = 7 + Math.floor(a.attrs.finesse / 4);
		const legs = gait(a);
		a.ap = legs === "dead" ? Math.max(2, a.maxAp - 4) : legs === "slow" ? Math.max(3, a.maxAp - 2) : a.maxAp;
		if (carryWeight(d) > carryMax(d)) {
			a.ap = Math.max(2, a.ap - 2);
			addLog(d, "The pack argues with your knees.");
		}
		d.focus = Math.min(focusMax(d), d.focus + 2);
		freezeIntents(d);
		return;
	}
	if (a.companion) {
		a.ap = companionAp(a);
		return;
	}
	a.ap = a.polymorphic ? 6 : 4;
}
function advance(d) {
	if (!d.combat) return;
	if (!livingHostiles(d).length) {
		endCombat(d);
		return;
	}
	const order = d.combat.order;
	for (let n = 0; n < order.length; n++) {
		d.combat.index = (d.combat.index + 1) % order.length;
		if (d.combat.index === 0) d.combat.round += 1;
		const id = order[d.combat.index];
		const a = actorById(d, id);
		if (a?.alive && (id === "player" || a.companion || a.hostile)) return;
	}
}
function beginTurn(d) {
	if (!d.combat || d.phase !== "play") return;
	if (!livingHostiles(d).length) {
		endCombat(d);
		return;
	}
	const id = currentId(d);
	const a = id ? actorById(d, id) : null;
	if (!a || !a.alive) {
		advance(d);
		beginTurn(d);
		return;
	}
	if (a.polymorphic) polymorph(d, a, d.combat.round);
	if (a.stunned) {
		a.stunned = false;
		addLog(d, `${a.name} is still inside the overload.`);
		advance(d);
		beginTurn(d);
		return;
	}
	refreshTurn(d, a);
	if (id === "player") return;
	if (a.companion) companionAct(d, a);
	else enemyAct(d, a);
	if (!d.combat || d.phase !== "play") return;
	advance(d);
	beginTurn(d);
}
function polymorph(d, a, round) {
	if (a.nodes.some((n) => n.pinned)) {
		for (const n of a.nodes) n.pinned = false;
		addLog(d, "A pinned seam holds for a breath, then forgets.");
		return;
	}
	const live = a.nodes.length ? round % a.nodes.length : 0;
	a.nodes.forEach((n, i) => {
		n.decoy = i !== live;
		n.revealed = false;
		n.severed = false;
		n.integrity = 100;
		n.tier = "obfuscated";
		n.pinned = false;
		n.confidence = "unknown";
		n.spent = false;
	});
	addLog(d, `${a.name} rearranges the graph.`);
}
function stepToward(d, a, target) {
	if (gait(a) === "dead") return false;
	const opts = [
		{
			x: a.x + 1,
			y: a.y
		},
		{
			x: a.x - 1,
			y: a.y
		},
		{
			x: a.x,
			y: a.y + 1
		},
		{
			x: a.x,
			y: a.y - 1
		}
	].filter((p) => walkable(d, p.x, p.y, a.id));
	opts.sort((p, q) => dist(p, target) - dist(q, target));
	const pick = opts[0];
	if (!pick) return false;
	const cost = slow(a) ? 2 : 1;
	if (a.ap < cost) return false;
	a.ap -= cost;
	a.x = pick.x;
	a.y = pick.y;
	return true;
}
function strike(d, attacker, defender) {
	const weapon = weaponOf(attacker);
	const range = weapon.range ?? 1;
	if (dist(attacker, defender) > range) {
		addLog(d, "Out of reach.");
		return false;
	}
	if (attacker.ap < 3) {
		if (attacker.id === "player") noteOnce(d, "No action left. End the turn.");
		else addLog(d, "Not enough action.");
		return false;
	}
	attacker.ap -= 3;
	if (attacker.id === "player") {
		noteVerb(d, "fight");
		if (d.combat?.tally) d.combat.tally.strikes += 1;
	}
	const chance = clamp$1(56 + attacker.attrs.finesse * 3 - defender.attrs.finesse * 2, 18, 93);
	const rolled = rollD100();
	if (rolled > chance) {
		addLog(d, `${attacker.name} misses ${defender.name}. (${rolled} vs ${chance})`);
		floatText(defender.x, defender.y, "miss", "#a89880");
		return true;
	}
	const stat = weapon.melee ? attacker.attrs.body : attacker.attrs.finesse;
	let dmg = (weapon.damage ?? 4) + Math.floor(stat / 2) + rolled % 3 - 1;
	if (attacker.id === "mara" && d.flags.maraFate === "intact") dmg += 2;
	if (attacker.nodes.some((n) => n.effect === "spell" && nodeLive(attacker.nodes, n)) && Math.random() < .45) {
		dmg += 4;
		addLog(d, "A matrix discharges.");
	}
	const broken = brokenMount(attacker);
	dmg = Math.max(1, Math.round(dmg * (broken ? 1 : gearWear(d, attacker))));
	if (attacker.id === "player" && habit(d, "fight")) dmg += 2;
	if (defender.id === "player" && d.flags.strain === "story") dmg = Math.max(1, Math.round(dmg * .7));
	if (defender.id === "player" && d.flags.strain === "hard") dmg = Math.max(1, Math.round(dmg * 1.25));
	addLog(d, broken ? `${attacker.name} hits ${defender.name} with bare hands. The mount will not fire.` : `${attacker.name} hits ${defender.name} with the ${weapon.name.toLowerCase()}.`);
	applyHp(d, defender.id, dmg, true);
	if (weapon.pin) {
		const held = pinOnHit(defender.nodes);
		if (held) addLog(d, `The hook holds ${held.name}.`);
	}
	bump(4);
	return true;
}
var VERB_VOICE = {
	fight: "You settle arguments with the body.",
	audit: "You read before you trust a surface.",
	cut: "You trust a severed parent more than a speech.",
	mend: "You put load back on things that can carry it.",
	repair: "You reseat what other people abandon.",
	sneak: "You leave rooms without asking them.",
	negotiate: "You spend a sentence where others spend blood.",
	threaten: "You let fear do the walking.",
	barter: "You move scarcity by hand.",
	sabotage: "You make the room into the weapon.",
	craft: "You turn scrap into a new verb.",
	brace: "You spend a turn becoming harder to erase.",
	rescue: "You keep people in the ledger.",
	redirect: "You change where a system is allowed to flow."
};
var VERB_MARK = {
	fight: "The hands remember fighting. A habit, not a class.",
	audit: "The hands remember reading. A habit, not a class.",
	cut: "The hands remember cutting. A habit, not a class.",
	mend: "The hands remember mending. A habit, not a class.",
	repair: "The hands remember reseating. A habit, not a class.",
	sneak: "The hands remember leaving quietly. A habit, not a class.",
	negotiate: "The hands remember talking a room down. A habit, not a class.",
	threaten: "The hands remember a threat that landed. A habit, not a class.",
	barter: "The hands remember a trade. A habit, not a class.",
	sabotage: "The hands remember making the room do the work. A habit, not a class.",
	craft: "The hands remember building a tool. A habit, not a class.",
	brace: "The hands remember setting weight. A habit, not a class.",
	rescue: "The hands remember keeping someone. A habit, not a class.",
	redirect: "The hands remember changing a flow. A habit, not a class."
};
function noteVerb(d, verb) {
	if (!d.verbs) d.verbs = {};
	const n = (d.verbs[verb] ?? 0) + 1;
	d.verbs[verb] = n;
	if (n === 4) addLog(d, VERB_MARK[verb]);
	awaken(d);
}
function habit(d, verb, at = 4) {
	return (d.verbs?.[verb] ?? 0) >= at;
}
function noteTrace(d, key) {
	if (!d.traces) d.traces = {};
	d.traces[key] = (d.traces[key] ?? 0) + 1;
	awaken(d);
}
function noteField(d, key) {
	noteTrace(d, key);
}
function touchSeam(d, n) {
	if (n.effect === "flow") noteTrace(d, "flow");
	if (n.domain === "biology" || n.effect === "life") noteTrace(d, "biology");
	if (n.domain === "mind") noteTrace(d, "mind");
	if (n.domain === "continuity" || n.effect === "core") noteTrace(d, "continuity");
}
var LENS_NAME = {
	structure: "Structure",
	flow: "Flow",
	biology: "Biology",
	mind: "Mind",
	social: "Social",
	intent: "Intent",
	causality: "Causality",
	continuity: "Continuity"
};
var LENS_TENDENCY = {
	structure: "STRUCTURAL",
	flow: "FLUID",
	biology: "BIOLOGICAL",
	mind: "COGNITIVE",
	social: "SOCIAL",
	intent: "INTENT",
	causality: "CAUSAL",
	continuity: "CONTINUOUS"
};
var LENS_OPEN = {
	flow: "Flow is in the ledger now. You changed where something was allowed to move.",
	biology: "Biology is in the ledger now. A body is a graph. A missing baseline cannot be invented.",
	mind: "Mind is in the ledger now. You can read a cognitive seam. You do not get to decide who they are.",
	social: "Social is in the ledger now. People are held by obligations, not only by bolts.",
	intent: "Intent is in the ledger now. Read them again. The next action will name what it still needs.",
	causality: "The cut did not stop at the seam. A child lost function without being cut.",
	continuity: "Continuity is in the ledger now. The question is what is still itself."
};
function verbCount(d, verb) {
	return d.verbs?.[verb] ?? 0;
}
function traceCount(d, key) {
	return d.traces?.[key] ?? 0;
}
function lensReads(d) {
	return [
		{
			id: "structure",
			perception: verbCount(d, "audit"),
			precision: verbCount(d, "cut") + verbCount(d, "brace"),
			reach: verbCount(d, "mend") + verbCount(d, "repair") + verbCount(d, "craft")
		},
		{
			id: "flow",
			perception: verbCount(d, "redirect") + traceCount(d, "flow"),
			precision: verbCount(d, "redirect"),
			reach: verbCount(d, "sabotage") + traceCount(d, "flow")
		},
		{
			id: "biology",
			perception: traceCount(d, "biology"),
			precision: verbCount(d, "rescue") + traceCount(d, "biology"),
			reach: verbCount(d, "rescue")
		},
		{
			id: "mind",
			perception: traceCount(d, "mind"),
			precision: traceCount(d, "mind"),
			reach: 0
		},
		{
			id: "social",
			perception: verbCount(d, "negotiate"),
			precision: verbCount(d, "threaten"),
			reach: verbCount(d, "barter")
		},
		{
			id: "intent",
			perception: traceCount(d, "intent"),
			precision: 0,
			reach: 0
		},
		{
			id: "causality",
			perception: traceCount(d, "cascade"),
			precision: Math.min(verbCount(d, "cut"), traceCount(d, "cascade")),
			reach: traceCount(d, "cascade") + verbCount(d, "sabotage")
		},
		{
			id: "continuity",
			perception: traceCount(d, "continuity"),
			precision: traceCount(d, "continuity"),
			reach: traceCount(d, "continuity")
		}
	].filter((row) => row.perception + row.precision + row.reach > 0);
}
function awaken(d) {
	for (const row of lensReads(d)) {
		if (row.id === "structure") continue;
		const key = `lens:${row.id}`;
		if (d.flags[key]) continue;
		d.flags[key] = true;
		const line = LENS_OPEN[row.id];
		if (line) addLog(d, line);
	}
}
function tendencies(d) {
	const rows = lensReads(d);
	if (!rows.length) return [];
	const weight = (row) => row.perception + row.precision + row.reach;
	let top = [...rows].sort((a, b) => weight(b) - weight(a) || a.id.localeCompare(b.id))[0];
	const structure = rows.find((row) => row.id === "structure");
	if (structure && top.id !== "structure" && weight(top) <= weight(structure)) top = structure;
	const words = [LENS_TENDENCY[top.id]];
	const perception = rows.reduce((sum, row) => sum + row.perception, 0);
	const precision = rows.reduce((sum, row) => sum + row.precision, 0);
	const reach = rows.reduce((sum, row) => sum + row.reach, 0);
	if (precision >= 2 && precision >= perception && precision >= reach) words.push("PRECISE");
	else if (perception >= 2 && perception >= precision && perception >= reach) words.push("PERCEPTIVE");
	else if (reach >= 2) words.push("FAR-REACHING");
	const kept = verbCount(d, "mend") + verbCount(d, "repair") + verbCount(d, "rescue");
	const cut = verbCount(d, "cut") + verbCount(d, "sabotage");
	if (kept >= 2 && kept > cut) words.push("PRESERVATIVE");
	else if (cut >= 2 && cut > kept) words.push("SEVERING");
	if (verbCount(d, "sneak") >= 2) words.push("QUIET");
	return words.slice(0, 3);
}
function habitLine(d) {
	const ranked = Object.keys(VERB_VOICE).map((id) => ({
		id,
		n: d.verbs?.[id] ?? 0
	})).filter((row) => row.n > 0).sort((a, b) => b.n - a.n || a.id.localeCompare(b.id));
	if (!ranked.length) return "No habit yet. There is no class to file. The city learns the verbs you repeat.";
	const [first, second] = ranked;
	if (second && second.n >= 2) return `${VERB_VOICE[first.id]} ${VERB_VOICE[second.id]}`;
	return VERB_VOICE[first.id];
}
var BECOMING_ALONE = {
	structure: "a structural patch",
	flow: "a hand on the pressure",
	biology: "a field surgeon",
	mind: "a reader of other people's seams",
	social: "a fixer of obligations",
	intent: "an investigator",
	causality: "a causal strategist",
	continuity: "a preservationist"
};
var BECOMING_WITH = {
	structure: "keeps the bolts honest",
	flow: "decides where a flow is allowed to go",
	biology: "treats a body as a graph",
	mind: "will not invent who someone is",
	social: "works the obligations, not only the bolts",
	intent: "reads what an action still needs",
	causality: "follows a cut past the seam that was touched",
	continuity: "asks what is still itself"
};
function becoming(d) {
	const weight = (row) => row.perception + row.precision + row.reach;
	const ranked = lensReads(d).filter((row) => weight(row) > 0).sort((a, b) => weight(b) - weight(a) || a.id.localeCompare(b.id));
	if (!ranked.length) return "Silas is not a class. The city has not learned him yet.";
	const top = ranked[0];
	const rest = ranked.filter((row) => row.id !== top.id && weight(row) >= 2);
	if (!rest.length) return `Silas is becoming ${BECOMING_ALONE[top.id]}.`;
	const tails = rest.slice(0, 2).map((row) => BECOMING_WITH[row.id]);
	return `Silas is becoming ${BECOMING_ALONE[top.id]} who ${tails.join(", and who ")}.`;
}
function cityLaborLine(d) {
	if (d.flags.stoneMoving && d.flags.tenementWarm && d.flags.guildWarm) return "Stone is moving. The tenement and the hall both have a night.";
	if (d.flags.tenementWarm && !d.flags.guildWarm) return "The sleepers have the heat. The guild hall does not.";
	if (d.flags.guildWarm && !d.flags.tenementWarm) return "The guild hall has the heat. The sleepers do not.";
	if (d.flags.hearthHeld && !d.flags.stoneMoving) return "A fire is banked in the Rust Districts. The quarry is not feeding it.";
	if (d.flags.quarryStone === "clear" || d.flags.quarryStone === "scarred") return "Stone is down in the pit. It has not reached a hearth.";
	if (d.flags.wardSeated) return "A shared split was seated in the lower ward.";
	return "No ward machine has been filed in their name.";
}
function factionFacts(d) {
	const bureauLead = d.flags.checkpointLead === "varr" ? "Checkpoint leadership remains with Captain Varr." : d.flags.checkpointLead === "vacant" ? "Checkpoint leadership is vacant." : "The south plate is still a Bureau door.";
	const priced = d.flags.provisionalStamp ? "Brown water carries a provisional stamp." : d.flags.pumpFate === "lockout" ? "Pricing still calls the district dry." : d.flags.pumpFate === "mend" || d.flags.pumpFate === "wren" || d.flags.pumpFate === "speech" ? "They will price seated water as if the seal had done it." : "No civic price has been filed for the Sinks.";
	const haul = d.flags.roadWatch ? "The road mouth is a squad. Freight is stopped." : d.flags.bramRan ? "A hauler moved freight because the stair was signed." : d.flags.plateStair ? "The plate stair is signed. Haulage can leave." : "Haulage is waiting on the plate.";
	return [
		{
			id: "bureau",
			line: `${bureauLead} ${priced}`
		},
		{
			id: "unbound",
			line: haul
		},
		{
			id: "engineers",
			line: cityLaborLine(d)
		},
		{
			id: "relsec",
			line: d.flags.varrFate === "dead" ? "RelSec has a closed file with Varr's name." : d.flags.varrFate === "stood" ? "RelSec heard Varr's grammar and did not like it." : "RelSec has not been given this ledger."
		},
		{
			id: "ash",
			line: d.flags.ashCounsel ? "Sera's warning is still in the margin." : "The Ash have not been spoken to."
		}
	];
}
var PRACTICE_VERBS = [
	"audit",
	"cut",
	"mend",
	"repair",
	"brace",
	"redirect",
	"negotiate",
	"threaten",
	"rescue"
];
function practiceBand(n) {
	if (n <= 0) return "—";
	if (n === 1) return "Basic";
	if (n < 4) return "Emerging";
	if (n < 8) return "Practiced";
	return "Deep";
}
function districtYield(d) {
	if (d.mapId === "kiln") {
		if (d.flags.kilnRefused) return "Kiln yield: a refused bed. No brick, no levy, and walls that do not hold.";
		if (d.flags.brickLive && d.flags.kilnLevy && d.flags.kilnShop) return "Kiln yield: brick, a legal board, and a levy on the same set.";
		if (d.flags.brickLive && d.flags.stampCut) return "Kiln yield: brick without a stamp. The board can buy. The bill cannot.";
		if (d.flags.brickLive) return "Kiln yield: brick the board is not allowed to sell. The stamp is still a parent.";
		if (d.flags.fieldDry) return "Kiln yield: a field-dry waiting on clay and a bed. The gallery was not required.";
		return "Kiln yield: clay, and nothing set. Water, heat, and a stamp are somewhere else.";
	}
	if (d.mapId === "switch") {
		if (d.flags.switchJam && !d.flags.switchShunt) return "Switch yield: a jammed table. The pit can look busy. The citadel is not receiving this parent.";
		if (d.flags.switchShunt && d.flags.switchGreased) return "Switch yield: an off-book haul, and a shed that is actually a floor.";
		if (d.flags.switchShunt) return "Switch yield: weight leaving off the books. The plates are still their own problem.";
		if (d.flags.switchToll && d.flags.switchShop) return "Switch yield: a haul on the books, a bill on that haul, and a shed allowed to sell.";
		if (d.flags.switchToll) return "Switch yield: a haul the stamp can see. The bill rode the same table.";
		if (d.flags.switchGreased) return "Switch yield: grease. The shed is a floor. The haul has not been answered.";
		return "Switch yield: a table that still passes, and plates that still bill a step.";
	}
	if (d.mapId === "pane") {
		if (d.flags.paneRefused) return "Pane yield: a refused bed. No melt, no levy, and glass that does not hold.";
		if (d.flags.paneCharge && d.flags.paneLevy && d.flags.paneShop) return "Pane yield: a clear melt, a legal bench, and a levy on the same heat.";
		if (d.flags.paneCharge && d.flags.paneCut) return "Pane yield: glass without a stamp. The bench can buy. The bill cannot.";
		if (d.flags.paneCharge && d.flags.paneCullet) return "Pane yield: cullet standing in for the pit. The stamp is still its own parent.";
		if (d.flags.paneCharge) return "Pane yield: a melt the bench is not allowed to sell. The stamp is still a parent.";
		if (d.flags.paneSpilled) return "Pane yield: a spilled pit. Cullet or a seated sand can still be a parent. Heat is the other.";
		return "Pane yield: sand, and nothing melted. Heat and a stamp are somewhere else.";
	}
	const fate = d.flags.pumpFate;
	if (fate === "mend") return "Sinks yield: water, food, labor. A seated valve lets the district make more than scrap.";
	if (fate === "bleed") return "Sinks yield: brown water, chemicals, resentment. Finished goods stay scarce.";
	if (fate === "flood") return "Sinks yield: salvage from the cellars. Food and labor have stopped.";
	if (fate === "lockout") return "Sinks yield: unauthorized water. The Bureau still prices the district as dry.";
	return "Sinks yield: dust, a little scrap, favors nobody can cash. The pump is the parent of the rest.";
}
function actorNamed(d, id) {
	if (id === "player") return d.name;
	return d.actors[id]?.name ?? "someone";
}
function decideOpening(d, a) {
	const prey = pickPrey(d, a);
	const weapon = weaponOf(a);
	const range = weapon.range ?? 1;
	const legs = gait(a);
	const weaponDown = a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n));
	const inRange = dist(a, prey) <= range;
	const seam2 = d.player.nodes.find((n) => n.effect === "weapon" && nodeLive(d.player.nodes, n));
	if (a.tier >= 2 && dist(a, d.player) <= 1 && seam2) return {
		kind: "cut",
		target: "player",
		weaponId: weapon.id,
		nodeName: seam2.name,
		thenStrike: false
	};
	const broken = repairCandidate(a);
	if ((legs === "dead" || weaponDown || !inRange) && broken && (a.skills.mechanics ?? 0) >= 28 && !broken.decoy) return {
		kind: "repair",
		target: a.id,
		weaponId: weapon.id,
		nodeName: broken.name,
		thenStrike: false
	};
	if (inRange) return {
		kind: "strike",
		target: prey.id,
		weaponId: weapon.id,
		nodeName: "",
		thenStrike: false
	};
	if (legs === "dead") return {
		kind: "brace",
		target: a.id,
		weaponId: weapon.id,
		nodeName: "",
		thenStrike: false
	};
	const step = [
		{
			x: a.x + 1,
			y: a.y
		},
		{
			x: a.x - 1,
			y: a.y
		},
		{
			x: a.x,
			y: a.y + 1
		},
		{
			x: a.x,
			y: a.y - 1
		}
	].some((p) => walkable(d, p.x, p.y, a.id) && dist(p, prey) <= range);
	return {
		kind: "close",
		target: prey.id,
		weaponId: weapon.id,
		nodeName: "",
		thenStrike: step
	};
}
function freezeIntents(d) {
	if (!d.combat) return;
	const plans = {};
	for (const id of d.combat.order) {
		const a = d.actors[id];
		if (!a?.alive || !a.hostile) continue;
		plans[id] = decideOpening(d, a);
	}
	d.combat.plans = plans;
}
function supportName(d, a, plan) {
	if (plan.weaponId === "fist") return null;
	if (plan.kind !== "strike" && !(plan.kind === "close" && plan.thenStrike)) return null;
	const weapon = a.nodes.find((n) => n.effect === "weapon" && !n.decoy) ?? a.nodes.find((n) => n.effect === "weapon");
	if (!weapon) return null;
	const chain = [];
	const walk = (n, seen) => {
		if (seen.has(n.id)) return;
		seen.add(n.id);
		for (const id of n.dependsOn) {
			const parent = a.nodes.find((x) => x.id === id);
			if (!parent) continue;
			chain.push(parent);
			walk(parent, seen);
		}
	};
	walk(weapon, /* @__PURE__ */ new Set());
	const eye = (d.traces?.intent ?? 0) >= 2 || (d.verbs?.audit ?? 0) >= 4;
	const known = chain.filter((n) => {
		if (!n.revealed) return false;
		const confidence = confidenceOf(n);
		if (confidence === "understood" || confidence === "confident") return true;
		return eye && confidence === "observed";
	});
	if (!known.length) return null;
	known.sort((x, y) => depthOf(a.nodes, x.id) - depthOf(a.nodes, y.id));
	return known[0].name;
}
function openingLine(d, a, plan) {
	const who = plan.target === "player" ? "you" : actorNamed(d, plan.target);
	const hold = supportName(d, a, plan);
	const needs = hold ? ` \xB7 needs ${hold}` : "";
	if (plan.kind === "strike") return `${plan.weaponId === "fist" ? "Bare hands" : ITEMS[plan.weaponId]?.name ?? "Weapon"} \u2192 ${who}${needs}`;
	if (plan.kind === "close") {
		const hands = plan.weaponId === "fist" ? "bare hands" : ITEMS[plan.weaponId]?.name ?? "a weapon";
		return `${plan.thenStrike ? `Movement \u2192 ${who}, then ${hands}` : `Movement \u2192 ${who}`}${needs}`;
	}
	if (plan.kind === "repair") return `Repair \u2192 ${plan.nodeName}`;
	if (plan.kind === "brace") return "Brace in place";
	return `Cut \u2192 ${plan.nodeName}`;
}
function planFits(d, a, plan) {
	if (!a.alive) return false;
	if (plan.kind === "cut") {
		const seam2 = d.player.nodes.find((n) => n.name === plan.nodeName);
		return Boolean(seam2 && nodeLive(d.player.nodes, seam2) && dist(a, d.player) <= 1);
	}
	if (plan.kind === "repair") {
		const n = repairCandidate(a);
		return Boolean(n && n.name === plan.nodeName && !n.decoy);
	}
	if (plan.kind === "brace") return gait(a) === "dead";
	const prey = plan.target === "player" ? d.player : d.actors[plan.target];
	if (!prey?.alive) return false;
	if (plan.kind === "strike") return weaponOf(a).id === plan.weaponId && dist(a, prey) <= (weaponOf(a).range ?? 1);
	return gait(a) !== "dead";
}
function boardIntents(d) {
	if (!d.combat?.plans) return [];
	const rows = [];
	for (const id of d.combat.order) {
		const plan = d.combat.plans[id];
		const a = d.actors[id];
		if (!plan || !a?.alive || !a.hostile) continue;
		rows.push({
			id,
			name: a.name,
			line: openingLine(d, a, plan),
			live: planFits(d, a, plan)
		});
	}
	return rows;
}
function followPlan(d, a, plan) {
	if (!planFits(d, a, plan)) {
		addLog(d, `${a.name} loses the action they had committed to. The board is a different shape.`);
		return;
	}
	if (plan.kind === "cut") {
		const seam2 = d.player.nodes.find((n) => n.name === plan.nodeName && nodeLive(d.player.nodes, n));
		if (!seam2 || a.ap < 4) return;
		a.ap -= 4;
		sever(d, d.player.nodes, seam2, a.name);
		return;
	}
	if (plan.kind === "repair") {
		tryRepair(d, a);
		return;
	}
	if (plan.kind === "brace") {
		a.guarding = true;
		a.ap = 0;
		addLog(d, `${a.name} braces, as they meant to.`);
		return;
	}
	const prey = plan.target === "player" ? d.player : d.actors[plan.target];
	if (!prey) return;
	if (plan.kind === "strike") {
		strike(d, a, prey);
		return;
	}
	stepToward(d, a, prey);
	if (plan.thenStrike && d.combat && d.phase === "play" && a.alive && dist(a, prey) <= (weaponOf(a).range ?? 1) && a.ap >= 3) strike(d, a, prey);
}
function weaponsDark(d) {
	if (!d.combat) return false;
	const hostiles = d.combat.order.map((id) => d.actors[id]).filter((a) => a?.alive && a.hostile);
	if (!hostiles.length) return false;
	return hostiles.every((a) => !a.nodes.some((n) => n.effect === "weapon" && nodeLive(a.nodes, n)));
}
function standDown(d) {
	if (!d.combat || currentId(d) !== "player") return;
	if (!weaponsDark(d)) {
		addLog(d, "Someone still has a live weapon. A sentence will not cover it.");
		return;
	}
	if (d.player.ap < 2) {
		addLog(d, "Not enough action to make them hear you.");
		return;
	}
	d.player.ap -= 2;
	noteVerb(d, "negotiate");
	let chance = checkChance(d.player.skills.speech, 46);
	if (habit(d, "cut")) chance += 8;
	if (habit(d, "negotiate")) chance += 6;
	if (habit(d, "threaten", 2)) chance += 6;
	chance = clamp$1(chance, 12, 94);
	const rolled = rollD100();
	if (rolled > chance) {
		addLog(d, `They keep their weight forward anyway. (${rolled} vs ${chance})`);
		return;
	}
	for (const id of d.combat.order) {
		const a = d.actors[id];
		if (a?.hostile) {
			a.hostile = false;
			a.aggro = false;
		}
	}
	d.reputation.bureau = clamp$1(d.reputation.bureau - 4, -100, 100);
	grantXp(d, 28);
	endCombat(d, "The weapons were already a rumor. They step out of the engagement. You did not have to empty the room.");
}
function enemyAct(d, a) {
	if (a.id === "rel1") {
		const kael = d.actors.kael;
		if (!Boolean(kael?.alive && kael.hostile && d.flags.kaelFate !== "dead" && d.flags.kaelFate !== "spared")) {
			a.hostile = false;
			a.aggro = false;
			addLog(d, "Pye steps out. The order was Kael's, and Kael is not holding it.");
			return;
		}
	}
	const hymn = a.nodes.find((n) => n.id === "hymn");
	if (hymn && nodeLive(a.nodes, hymn) && a.ap >= 3) {
		const ally = Object.values(d.actors).find((o) => o.id !== a.id && o.alive && o.hostile && o.mapId === a.mapId && o.hp < o.maxHp && dist(a, o) <= 2);
		if (ally) {
			a.ap -= 3;
			healActor(d, ally.id, 8);
			addLog(d, `${a.name} spends the hymn on ${ally.name}. The seam is support, not a speech.`);
			return;
		}
	}
	const governor = a.nodes.find((n) => n.id === "governor");
	if (governor && !nodeLive(a.nodes, governor)) {
		a.guarding = true;
		a.ap = 0;
		addLog(d, `${a.name} has no governor. The weapon does not choose a body.`);
		return;
	}
	const plan = d.combat?.plans?.[a.id];
	if (plan && d.combat?.plans) {
		delete d.combat.plans[a.id];
		followPlan(d, a, plan);
		if (!d.combat || d.phase !== "play" || !a.alive || a.ap <= 0) return;
	}
	let guard = 0;
	let saidWeapon = false;
	while (a.alive && a.ap > 0 && d.combat && guard++ < 8 && d.phase === "play") {
		const target = pickPrey(d, a);
		const weapon = weaponOf(a);
		const legs = gait(a);
		const weaponDown = a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n));
		const armorDown = a.nodes.some((n) => n.effect === "armor" && !nodeLive(a.nodes, n));
		if (weaponDown && !saidWeapon) {
			saidWeapon = true;
			addLog(d, `${a.name} cannot bring the mounted weapon to bear.`);
		}
		const range = weapon.range ?? 1;
		if (dist(a, target) <= range && a.ap >= 3) {
			strike(d, a, target);
			if (d.phase !== "play" || !d.combat) return;
			continue;
		}
		if (legs === "dead") {
			if (tryRepair(d, a)) continue;
			a.guarding = true;
			a.ap = 0;
			const orders = a.nodes.find((n) => n.id === "orders");
			addLog(d, orders && !nodeLive(a.nodes, orders) ? `${a.name} has no order left. The advance does not happen.` : `${a.name} braces in place. The legs refuse the step.`);
			return;
		}
		if (a.template === "warden") {
			const plate = a.nodes.find((n) => n.id === "plate");
			if (plate && nodeLive(a.nodes, plate) && dist(a, target) <= 1 && !a.guarding && a.ap >= 1) {
				a.ap -= 1;
				a.guarding = true;
				addLog(d, `${a.name} sets the plate between the blow and the order behind it.`);
			}
		}
		if (armorDown && dist(a, target) > range && tryRepair(d, a)) continue;
		if (stepToward(d, a, target)) continue;
		if (tryRepair(d, a)) continue;
		if (armorDown && a.ap >= 1) {
			a.guarding = true;
			a.ap = 0;
			addLog(d, `${a.name} covers the opened plate.`);
			return;
		}
		return;
	}
}
function rootCause(nodes, n, seen = /* @__PURE__ */ new Set()) {
	if (seen.has(n.id)) return n;
	seen.add(n.id);
	for (const id of n.dependsOn) {
		const parent = nodes.find((p) => p.id === id);
		if (parent && !nodeLive(nodes, parent)) return rootCause(nodes, parent, seen);
	}
	return n;
}
function repairCandidate(a) {
	const broken = (effect) => a.nodes.find((n) => n.effect === effect && !nodeLive(a.nodes, n));
	const child = (gait(a) === "dead" ? broken("motive") : null) ?? broken("weapon") ?? broken("armor") ?? a.nodes.find((n) => n.severed) ?? null;
	if (!child) return null;
	return rootCause(a.nodes, child);
}
function tryRepair(d, a) {
	if ((a.skills.mechanics ?? 0) < 28 || a.ap < 4) return false;
	const n = repairCandidate(a);
	if (!n || n.decoy) return false;
	a.ap -= 4;
	addLog(d, `${a.name} is attempting repair.`);
	const chance = clamp$1(18 + a.skills.mechanics - n.density * 5, 8, 72);
	if (rollD100() > chance) {
		addLog(d, `${n.name} will not seat.`);
		return true;
	}
	const before = liveMap(a.nodes);
	n.severed = false;
	n.integrity = Math.max(n.integrity, 78);
	n.decoy = false;
	addLog(d, `${a.name} reseats ${n.name}.`);
	publish(d, a.nodes, before);
	noteGraphChange(d, a.nodes, n, "repair", a.name);
	play("mend");
	return true;
}
function pickPrey(d, a) {
	const mate = Object.values(d.actors).find((x) => x.companion && x.alive && x.mapId === a.mapId);
	if (mate && dist(a, mate) + .15 < dist(a, d.player)) return mate;
	return d.player;
}
function pickFoe(d, from) {
	let best = null;
	let bestD = 99;
	for (const o of Object.values(d.actors)) {
		if (!o.alive || !o.hostile || o.mapId !== from.mapId) continue;
		const dd = dist(from, o);
		if (dd < bestD) {
			best = o;
			bestD = dd;
		}
	}
	return best;
}
function companionAct(d, a) {
	const foe = pickFoe(d, a);
	if (!foe) return;
	if (a.template === "cinder") {
		const hidden = foe.nodes.find((n) => !n.revealed && (n.effect === "flow" || n.effect === "motive") && n.tier !== "obfuscated");
		if (hidden && a.ap >= 1) {
			a.ap -= 1;
			hidden.revealed = true;
			if (!hidden.confidence) hidden.confidence = "observed";
			addLog(d, `The moth lands on ${hidden.name}. You had not admitted that parent yet.`);
			play("moth");
			return;
		}
	}
	if (a.id === "sera") {
		if (foe.nodes.some((n) => n.effect === "weapon" && n.revealed && !nodeLive(foe.nodes, n))) {
			addLog(d, "Sera will not hit a weapon that is already dark.");
			if (dist(a, d.player) > 1) stepToward(d, a, d.player);
			return;
		}
	}
	if (a.id === "mara" && d.flags.maraFate === "restored" && d.player.hp < d.player.maxHp * .7 && dist(a, d.player) <= 1 && a.ap >= 3) {
		a.ap -= 3;
		healActor(d, "player", 10);
		addLog(d, "Mara steadies your pulse. The kindness is a little frightening.");
		return;
	}
	if ((a.habit === "brace" || a.kit?.accessory === "strap") && d.player.hp < d.player.maxHp * .6 && dist(a, d.player) <= 1 && !d.player.guarding && a.ap >= 1) {
		a.ap -= 1;
		d.player.guarding = true;
		addLog(d, `${a.name} sets a shoulder against yours. The next blow has to go through both of you.`);
		return;
	}
	if (a.habit === "cover" && dist(foe, d.player) < dist(a, d.player) && dist(a, d.player) > 1) stepToward(d, a, d.player);
	if ((a.habit === "read" || a.kit?.accessory === "glass") && a.ap >= 1) {
		const hidden = foe.nodes.find((n) => !n.revealed && n.tier !== "obfuscated" && !n.decoy);
		if (hidden) {
			a.ap -= 1;
			hidden.revealed = true;
			if (!hidden.confidence) hidden.confidence = "observed";
			addLog(d, `${a.name} names ${hidden.name}. It was already in the graph.`);
		}
	}
	const pinGear = Boolean(weaponOf(a).pin);
	if ((a.habit === "pin" || pinGear) && a.ap >= 2 && dist(a, foe) <= (weaponOf(a).range ?? 1)) {
		const held = pinOnHit(foe.nodes);
		if (held) {
			a.ap -= 2;
			addLog(d, `${a.name} pins ${held.name}.`);
			return;
		}
	}
	const prey = a.habit === "press" ? pickPressed(d, a) ?? foe : foe;
	let guard = 0;
	while (a.alive && a.ap >= 1 && guard++ < 8 && prey.alive) {
		const weapon = weaponOf(a);
		if (dist(a, prey) <= (weapon.range ?? 1) && a.ap >= 3) {
			strike(d, a, prey);
			return;
		}
		if (!stepToward(d, a, prey)) return;
	}
}
function pickPressed(d, from) {
	let best = null;
	let hp = 1e9;
	for (const o of Object.values(d.actors)) {
		if (!o.alive || !o.hostile || o.mapId !== from.mapId) continue;
		if (o.hp < hp) {
			best = o;
			hp = o.hp;
		}
	}
	return best;
}
function auditTargetNodes(d, target) {
	if (!target) return [];
	if (target.kind === "actor") return actorById(d, target.id)?.nodes ?? [];
	return d.machines[target.id]?.nodes ?? [];
}
function taughtPatterns(d) {
	const taught = /* @__PURE__ */ new Set();
	const take = (nodes) => {
		for (const n of nodes) {
			if (!n.pattern || !n.revealed) continue;
			const c = n.confidence ?? "observed";
			if (c === "understood" || c === "confident") taught.add(n.pattern);
		}
	};
	take(d.player.nodes);
	for (const a of Object.values(d.actors)) take(a.nodes);
	for (const m of Object.values(d.machines)) take(m.nodes);
	return taught;
}
function liftKnown(d, n, before, taught, ownerId) {
	if (before === "understood" || before === "confident") return;
	const feed = Boolean(n.pattern && taught.has(n.pattern));
	const veto = n.id === "lockout" && taught.has("pressure-feed");
	if (!feed && !veto) return;
	n.revealed = true;
	if (confidenceOf(n) === "unknown" || confidenceOf(n) === "observed") n.confidence = "understood";
	const key = `saw:${feed ? n.pattern : "pressure-veto"}:${ownerId}:${n.id}`;
	if (d.flags[key]) return;
	d.flags[key] = true;
	addLog(d, feed ? n.pattern === "load-chain" ? `Same shape as a suspended load you already understood. ${n.name} fails the way the last one did.` : `Same shape as a pressure feed you already understood. ${n.name} fails the way the last one did.` : "The lockout is the veto these feeds hide. You have seen a pressure system keep one.");
}
function openAudit(d, target) {
	if (!target) return;
	const actor = target.kind === "actor" ? actorById(d, target.id) : null;
	const nodes = auditTargetNodes(d, target);
	if (d.combat && currentId(d) === "player" && actor && actor.id !== "player") {
		if (!d.combat.audited.includes(actor.id)) {
			if (!habit(d, "audit")) {
				if (d.player.ap < 1) {
					noteOnce(d, "No action left. End the turn.");
					return;
				}
				d.player.ap -= 1;
			}
			d.combat.audited.push(actor.id);
		}
	}
	if (!(target.kind === "actor" && target.id === "player")) noteVerb(d, "audit");
	if (d.combat && actor?.hostile && actor.id !== "player") noteTrace(d, "intent");
	const taught = taughtPatterns(d);
	if (actor?.polymorphic) {
		const chance = checkChance(d.player.skills.audit, 62);
		const rolled = rollD100();
		if (rolled <= chance) {
			for (const n of nodes) n.revealed = true;
			addLog(d, `The live seam shows itself. (${rolled} vs ${chance})`);
		} else {
			const decoy = nodes[Math.floor(Math.random() * nodes.length)];
			if (decoy) {
				decoy.revealed = true;
				decoy.decoy = false;
			}
			addLog(d, `The graph lies to you. (${rolled} vs ${chance})`);
		}
	} else if (target.kind === "machine") {
		if (d.perks?.includes("parent-ear") && !d.flags[`ear:${target.id}`]) {
			const hidden = nodes.filter((n) => !n.revealed && !n.decoy && n.tier !== "obfuscated");
			const parent = hidden.find((n) => nodes.some((child) => child.dependsOn.includes(n.id))) ?? hidden[0];
			if (parent) {
				parent.revealed = true;
				if (!parent.confidence) parent.confidence = "observed";
				d.flags[`ear:${target.id}`] = true;
				addLog(d, `You hear a parent before the surface admits it: ${parent.name}.`);
			}
		}
		if (hasItem(d, "anneallens") && !d.flags[`lens:${target.id}`]) {
			const hidden = nodes.filter((n) => !n.revealed && !n.decoy && n.tier !== "obfuscated");
			const named = hidden.find((n) => nodes.some((child) => child.dependsOn.includes(n.id))) ?? hidden[0];
			d.flags[`lens:${target.id}`] = true;
			if (named) {
				named.revealed = true;
				if (!named.confidence) named.confidence = "observed";
				addLog(d, `The anneal lens names a parent the surface had not: ${named.name}.`);
			}
		}
		for (const n of nodes) {
			const was = n.revealed;
			const before = confidenceOf(n);
			if ((Boolean(n.pattern && taught.has(n.pattern)) || n.id === "lockout" && taught.has("pressure-feed")) && before !== "understood" && before !== "confident") n.revealed = true;
			if (n.tier === "obfuscated") {
				if (Boolean(d.flags.chalked) || n.id === "matrix" && d.flags.matrixKnown === true || rollD100() <= checkChance(d.player.skills.audit, 58)) n.revealed = true;
			} else if (n.domain === "matter" || d.disciplines.includes(n.domain)) n.revealed = true;
			if (n.id === "lockout" && d.flags.knowsLockout) n.revealed = true;
			deepen(d, n, !was && n.revealed);
			if (n.id === "lockout" && d.flags.knowsLockout && n.revealed && confidenceOf(n) === "observed") n.confidence = "understood";
			liftKnown(d, n, before, taught, target.id);
		}
		if (d.flags.chalked) {
			d.flags.chalked = false;
			addLog(d, "The chalk burns off. The illegible lines stay legible for this reading.");
		}
	} else {
		const seen = d.verbs?.audit ?? 0;
		const ceiling = Math.max(4, comp(d) + 1 + (seen >= 4 ? 1 : 0) + (seen >= 8 ? 1 : 0));
		for (const n of nodes) {
			const was = n.revealed;
			const before = confidenceOf(n);
			const familiar = Boolean(n.pattern && taught.has(n.pattern)) && before !== "understood" && before !== "confident";
			const knownMatrix = n.id === "matrix" && d.flags.matrixKnown === true;
			if (!n.revealed || familiar) {
				if (familiar) n.revealed = true;
				else if (n.tier === "obfuscated") {
					if (Boolean(d.flags.chalked) || knownMatrix || rollD100() <= checkChance(d.player.skills.audit, 48 + n.density * 3)) n.revealed = true;
				} else if ((n.domain === "matter" || d.disciplines.includes(n.domain)) && (n.density <= ceiling || d.player.skills.audit >= 36 + n.density * 6)) n.revealed = true;
			}
			deepen(d, n, !was && n.revealed);
			liftKnown(d, n, before, taught, target.id);
		}
		if (d.flags.chalked) {
			d.flags.chalked = false;
			addLog(d, "The chalk burns off. The illegible lines stay legible for this reading.");
		}
	}
	d.audit = target;
	d.uiNode = [...nodes.filter((n) => n.revealed)].sort((a, b) => {
		const score = (n) => n.severed ? -1e3 : !nodeLive(nodes, n) ? -500 : n.integrity;
		return score(a) - score(b);
	})[0]?.id ?? nodes[0]?.id ?? null;
	d.panel = "audit";
	rememberGraph(d, nodes);
	if (actor) noteHolding(d, actor);
	play("talk");
}
function noteHolding(d, a) {
	if (a.id === "player" || !a.hostile) return;
	const key = `brief:${a.id}`;
	if (d.flags[key]) return;
	const chain = (n) => {
		const parents = n.dependsOn.map((id) => a.nodes.find((p) => p.id === id)).filter((p) => Boolean(p?.revealed));
		return parents.length ? `${parents.map((p) => p.name).join(" + ")} → ${n.name}` : n.name;
	};
	const bits = [];
	const armor = a.nodes.find((n) => n.revealed && !n.decoy && n.effect === "armor");
	const weapon = a.nodes.find((n) => n.revealed && !n.decoy && n.effect === "weapon");
	const motive = a.nodes.find((n) => n.revealed && !n.decoy && n.effect === "motive");
	if (armor) bits.push(`armor ${chain(armor)}`);
	if (weapon) bits.push(`weapon ${chain(weapon)}`);
	if (motive) bits.push(`movement ${chain(motive)}`);
	if (!bits.length) return;
	d.flags[key] = true;
	addLog(d, `What is holding ${a.name}: ${bits.join("; ")}.`);
}
function domainOk(d, n) {
	if (n.domain === "matter") return true;
	return d.disciplines.includes(n.domain);
}
function mendNode(d, target, nodeId) {
	const nodes = auditTargetNodes(d, target);
	const n = nodes.find((x) => x.id === nodeId);
	if (!n || !target) return;
	if (!n.revealed) {
		addLog(d, "You cannot mend what you have not read.");
		return;
	}
	if (!domainOk(d, n)) {
		addLog(d, `You have no ${n.domain} baseline for this.`);
		return;
	}
	const inFight = Boolean(d.combat && currentId(d) === "player");
	if (inFight && d.player.ap < 3) {
		addLog(d, "Not enough action.");
		return;
	}
	const cost = Math.max(2, 4 + n.density - (d.perks?.includes("steady-mend") ? 2 : 0));
	const over = n.density > comp(d);
	if (d.focus < cost && !over) {
		addLog(d, "Focus is too thin.");
		return;
	}
	if (inFight) d.player.ap -= 3;
	const skill = n.domain === "biology" ? "medicine" : n.domain === "mind" ? "psychology" : "engineering";
	let chance = checkChance(d.player.skills[skill], 36 + n.density * 4);
	if (habit(d, "mend")) chance += 8;
	if (target.kind === "machine" && target.id === "pump" && n.id === "valve" && hasItem(d, "valve")) {
		chance = 92;
		takeItem(d, "valve", 1);
		addLog(d, "The true valve seats. Baseline snaps back.");
	} else if (n.baseline < 45 && !d.disciplines.includes("continuity")) chance -= 25;
	if (over) {
		chance -= 20;
		d.focus = 0;
		applyHp(d, "player", (n.density - comp(d)) * 5);
		d.player.stunned = true;
		addLog(d, "Density exceeds comprehension. The reading burns.");
		play("over");
		bump(8);
		if (d.phase !== "play") return;
	} else d.focus = Math.max(0, d.focus - cost);
	const rolled = rollD100();
	if (rolled > clamp$1(chance, 8, 95)) {
		n.integrity = Math.max(n.integrity, 20);
		addLog(d, `Misreconstruction. ${n.name} returns wrong. (${rolled})`);
		if (target.kind === "machine" && target.id === "pump") {
			d.flags.pumpFate = "flood";
			d.flags.actReady = true;
			journal(d, "pump", "The broken pump", "The mend took, and it took wrong. Cellars are filling. The district will remember the shape of your confidence.", "done");
		}
		play("over");
		reconcileWorld(d);
		return;
	}
	const before = liveMap(nodes);
	n.severed = false;
	n.integrity = 100;
	n.decoy = false;
	addLog(d, `${n.name} is restored toward its baseline.`);
	if (d.combat?.tally) d.combat.tally.mends += 1;
	noteVerb(d, "mend");
	if ((d.verbs?.mend ?? 0) + (d.verbs?.repair ?? 0) >= 4) {
		let reached = false;
		for (const child of nodes) {
			if (!child.dependsOn.includes(n.id) || child.severed || child.integrity >= 100) continue;
			child.integrity = Math.min(100, child.integrity + 12);
			reached = true;
		}
		if (reached) addLog(d, "The mend reaches the next bond. It does not invent a severed one.");
	}
	touchSeam(d, n);
	publish(d, nodes, before, n.id);
	noteGraphChange(d, nodes, n, "mend");
	play("mend");
	flash(d, nodes, "mend");
	if (n.effect === "life") healActor(d, target.kind === "actor" ? target.id : "player", 8 + Math.floor(d.player.skills.medicine / 8));
	if (target.kind === "machine" && target.id === "pump" && n.id === "valve") {
		d.flags.pumpFate = "mend";
		d.flags.actReady = true;
		grantXp(d, 45);
		journal(d, "pump", "The broken pump", "You seated the valve. Clean water moves. The Bureau will call it theft of civic function.", "done");
		addLog(d, "The district pump takes a true breath.");
	}
	if (target.kind === "machine" && target.id === "cistern" && (n.id === "market" || n.id === "clinic")) {
		d.flags.wardSplit = "shared";
		addLog(d, "You reseat the split. Both legs can drink, if the Sinks are sending anything.");
	}
	bump(3);
	reconcileWorld(d);
}
function unmendNode(d, target, nodeId) {
	const nodes = auditTargetNodes(d, target);
	const n = nodes.find((x) => x.id === nodeId);
	if (!n || !target) return;
	if (!n.revealed) {
		addLog(d, "You cannot cut a seam you haven't read.");
		return;
	}
	if (target.kind === "machine" && target.id === "cistern" && n.id === "main") {
		addLog(d, "The cistern main is a child of the Sinks. Change the pump, or change the split.");
		return;
	}
	if (!domainOk(d, n)) {
		addLog(d, `That relationship is outside your disciplines.`);
		return;
	}
	if (n.severed) {
		addLog(d, "Already severed.");
		return;
	}
	const inFight = Boolean(d.combat && currentId(d) === "player");
	if (inFight && d.player.ap < 4) {
		addLog(d, "Not enough action.");
		return;
	}
	const conf = confidenceOf(n);
	const over = (conf === "confident" ? Math.max(1, n.density - 1) : n.density) > comp(d);
	const cost = 6 + n.density;
	if (d.focus < Math.min(cost, focusMax(d)) && !over && d.focus < 4) {
		addLog(d, "Focus is too thin.");
		return;
	}
	if (inFight) d.player.ap -= 4;
	if (n.decoy) {
		d.focus = Math.max(0, d.focus - 4);
		addLog(d, "That seam was a costume. The backlash finds your teeth.");
		applyHp(d, "player", 8);
		play("over");
		return;
	}
	let chance = checkChance(d.player.skills.audit, 34 + n.density * 5);
	if (habit(d, "cut")) chance += 8;
	if (d.disciplines.includes("causal")) chance += 8;
	chance += confidenceBonus(n);
	if (target.kind === "machine" && target.id === "pump" && n.id === "lockout" && d.flags.knowsLockout) chance += 10;
	if (over) {
		chance -= 18;
		d.focus = 0;
		applyHp(d, "player", (n.density - comp(d)) * 4);
		d.player.stunned = true;
		addLog(d, "You cut past your depth.");
		play("over");
		if (d.phase !== "play") return;
	} else d.focus = Math.max(0, d.focus - cost);
	const rolled = rollD100();
	const shown = clamp$1(chance, 10, 94);
	if (rolled > shown) {
		addLog(d, `${conf === "observed" ? "You were still guessing. The bond holds." : conf === "confident" ? "You knew the seam. The angle still slipped." : "The bond holds."} (${rolled})`);
		if (conf !== "confident" && rolled > shown + 28) {
			d.player.stunned = true;
			addLog(d, "The failed cut rings back through the lens.");
		}
		return;
	}
	sever(d, nodes, n);
	if (d.combat?.tally) d.combat.tally.cuts += 1;
	noteVerb(d, "cut");
	touchSeam(d, n);
	if (d.phase !== "play") return;
	if (target.kind === "actor") {
		const a = actorById(d, target.id);
		if (a && n.effect === "life") applyHp(d, a.id, 14, false);
		if (a && n.effect === "core") applyHp(d, a.id, 22, false);
	}
	if (target.kind === "machine" && target.id === "pump" && n.id === "bypass") {
		d.flags.pumpFate = "bleed";
		d.flags.actReady = true;
		noteTrace(d, "flow");
		noteVerb(d, "redirect");
		grantXp(d, 35);
		journal(d, "pump", "The broken pump", "You opened the bypass. Brown water moves. Cellars will taste it. The district is not grateful and not dry.", "done");
	}
	if (target.kind === "machine" && target.id === "pump" && n.id === "lockout" && !d.flags.pumpFate) {
		d.flags.pumpFate = "lockout";
		d.flags.actReady = true;
		d.reputation.bureau = clamp$1(d.reputation.bureau - 8, -100, 100);
		grantXp(d, 40);
		journal(d, "pump", "The broken pump", "You cut the Bureau lockout. Water moves because the veto is gone. They will call it sabotage. The valve is still unseated, but the district is no longer dry.", "done");
		addLog(d, "The lockout lets go. The pump obeys a city that did not sign the order.");
	}
	if (target.kind === "machine" && target.id === "cistern" && (n.id === "market" || n.id === "clinic")) {
		d.flags.wardSplit = n.id === "market" ? "clinic" : "market";
		noteVerb(d, "redirect");
		addLog(d, n.id === "market" ? "The stall leg is cut. What still comes goes to the clinic." : "The clinic leg is cut. What still comes goes to the stall.");
	}
	if (target.kind === "machine" && target.id === "hearth" && (n.id === "beds" || n.id === "hall")) {
		d.flags.hearthSplit = n.id === "beds" ? "hall" : "beds";
		noteVerb(d, "redirect");
		addLog(d, n.id === "beds" ? "The sleeper flues are cut. What heat remains goes to the hall." : "The guild flue is cut. What heat remains goes to the sleepers.");
	}
	if (target.kind === "machine" && target.id === "hearth" && n.id === "bed") {
		d.flags.hearthHeld = false;
		addLog(d, "The fire bed is cut. Banking will not invent it back from a severed seam.");
	}
	if (target.kind === "machine" && target.id === "plots" && n.id === "inlet") addLog(d, "The inlet is a child of the Sinks. Cutting it on the bed does not give the plots a well.");
	if (target.kind === "machine" && target.id === "forge" && (n.id === "ore" || n.id === "quench" || n.id === "fire")) addLog(d, "That seam is a parent from another district. The forge takes it back if the parent is still alive.");
	if (target.kind === "machine" && target.id === "lamps" && n.id === "feed") addLog(d, "The lamp feed is a child of the orrery. Breaking the glass is the local cut. This one grows back.");
	if (target.kind === "machine" && target.id === "chute" && n.id === "lip") addLog(d, "The lip is a child of the road. Spill the grade if you want the ore to miss the forge.");
	reconcileWorld(d);
}
function faceMachine(d, m, specialId) {
	const spec = specialId === "face-surge" ? {
		id: "surge",
		template: "surge",
		flag: "surgeFaced"
	} : specialId === "face-gear" ? {
		id: "gearhulk",
		template: "gearhulk",
		flag: "gearFaced"
	} : {
		id: "engineward",
		template: "engineward",
		flag: "engineFaced"
	};
	const owner = specialId === "face-surge" ? "pump" : specialId === "face-gear" ? "colossus" : "crucible";
	if (m.id !== owner) return;
	if (dist(d.player, m) > 2) {
		addLog(d, "You are not on the machine.");
		return;
	}
	if (d.flags[spec.flag]) {
		addLog(d, "That shape has already answered. The machine is still the machine.");
		return;
	}
	if (d.combat) return;
	d.flags[spec.flag] = true;
	const base = spawnActor({
		id: spec.id,
		template: spec.template,
		map: d.mapId,
		x: m.x + 1,
		y: m.y
	});
	base.hostile = true;
	base.aggro = true;
	d.actors[spec.id] = base;
	addLog(d, `${base.name} answers the machine. The graph is the fight.`);
	startCombat(d, [spec.id]);
}
function kilnPrice(d, n) {
	let value = n;
	if (d.perks?.includes("counter-price")) value -= 4;
	if ((d.player.skills.barter ?? 0) >= 55) value -= 2;
	return Math.max(1, value);
}
function payKiln(d, n) {
	const cost = kilnPrice(d, n);
	if (d.scrip < cost) {
		addLog(d, `That is ${cost} scrip. You don't have it.`);
		return false;
	}
	d.scrip -= cost;
	return true;
}
function yardWitness(d) {
	const eyes = Object.values(d.actors).filter((a) => a.alive && !a.companion && a.mapId === d.mapId && a.faction === "bureau" && dist(d.player, a) <= 5);
	if (!eyes.length) return null;
	const close = eyes.some((a) => dist(d.player, a) <= 1);
	const sneak = d.player.skills.sneak ?? 0;
	if (!close && (sneak >= 55 || d.perks?.includes("soft-step"))) return null;
	return eyes[0];
}
function runSwitchSpecial(d, m, specialId) {
	if (!(/* @__PURE__ */ new Set([
		"turntable",
		"switchdesk",
		"switchbench",
		"waycrate"
	])).has(m.id)) return false;
	if (m.id === "switchbench" && specialId === "rest") return false;
	if (dist(d.player, m) > 1) {
		addLog(d, "You are not at the machine.");
		return true;
	}
	d.machines.turntable;
	const claim = d.machines.switchdesk?.nodes.find((n) => n.id === "claim");
	if (m.id === "turntable" && specialId === "grease-axle") {
		if (d.flags.switchGreased) {
			addLog(d, "The axle is already greased. The plates will not become a different parent by being greased twice.");
			return true;
		}
		if (!hasItem(d, "scrap")) {
			addLog(d, "Grease wants scrap. Boots are a different parent, and they are not this one.");
			return true;
		}
		const sure = d.player.skills.engineering >= 70;
		const chance = checkChance(d.player.skills.engineering, 40);
		const rolled = sure ? chance : rollD100();
		if (!sure && rolled > chance) {
			addLog(d, `The render goes slick in the wrong direction. (${rolled} vs ${chance})`);
			return true;
		}
		takeItem(d, "scrap", 1);
		d.flags.switchGreased = true;
		noteVerb(d, "craft");
		addLog(d, sure ? "You know this render. The plates stop billing. Wick's shed has a parent." : `The grease holds. (${rolled} vs ${chance}) The shed can be a floor.`);
		play("mend");
		d.reputation.engineers = clamp$1(d.reputation.engineers + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "turntable" && specialId === "jam-table") {
		if (d.flags.switchJam && !d.flags.switchShunt) {
			addLog(d, "The table is already jammed.");
			return true;
		}
		d.flags.switchJam = true;
		noteVerb(d, "sabotage");
		addLog(d, "You jam the table. A busy pit can still send nothing. Rue has nothing to invoice unless a shunt is already carrying the weight off her books.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "turntable" && specialId === "seat-table") {
		if (d.flags.switchJam !== true) {
			addLog(d, "The table is already seated.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to seat the axle.");
			return true;
		}
		d.focus -= 3;
		d.flags.switchJam = false;
		noteVerb(d, "mend");
		addLog(d, "You seat the table. If the stamp is intact and the shunt is out, the books can see the haul again.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "turntable" && specialId === "shunt-haul") {
		if (d.flags.switchShunt) {
			addLog(d, "The shunt is already carrying weight off the books.");
			return true;
		}
		if (!hasItem(d, "scrap") && d.player.skills.engineering < 50) {
			addLog(d, "A shunt wants scrap, or an engineering hand that already knows the bypass.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to seat a shunt.");
			return true;
		}
		if (hasItem(d, "scrap") && d.player.skills.engineering < 50) takeItem(d, "scrap", 1);
		d.focus -= 3;
		d.flags.switchShunt = true;
		noteVerb(d, "redirect");
		addLog(d, "You shunt the haul. Weight can leave even if the table is jammed. Rue is not allowed to see it.");
		play("mend");
		d.reputation.unbound = clamp$1(d.reputation.unbound + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "turntable" && specialId === "pull-shunt") {
		if (!d.flags.switchShunt) {
			addLog(d, "There is no shunt to pull.");
			return true;
		}
		d.flags.switchShunt = false;
		noteVerb(d, "sabotage");
		addLog(d, "You pull the shunt. The table, jammed or seated, is the parent that remains.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "switchdesk" && specialId === "license-yard") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
			return true;
		}
		if (d.flags.switchLicensed) {
			addLog(d, "The shed is already licensed. The bill did not leave.");
			return true;
		}
		const believed = d.player.skills.speech >= 60;
		if (!believed && d.scrip < 10) {
			addLog(d, "Rue wants 10 scrip, or a voice the Bureau already believes.");
			return true;
		}
		if (!believed) d.scrip -= 10;
		d.flags.switchLicensed = true;
		noteVerb(d, believed ? "negotiate" : "barter");
		d.reputation.bureau = clamp$1(d.reputation.bureau + 3, -100, 100);
		addLog(d, believed ? "You speak the yard into a permit. The bill stays on any haul the books can see." : "You pay the stamp. The bill stays. The shed may sell if grease and the table agree.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "switchdesk" && specialId === "cut-yard") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is already a hole.");
			return true;
		}
		claim.severed = true;
		claim.integrity = 0;
		claim.revealed = true;
		noteVerb(d, "sabotage");
		d.reputation.bureau = clamp$1(d.reputation.bureau - 6, -100, 100);
		addLog(d, "You cut the yard stamp. The bill dies. The haul can still leave. Rue will not agree to be a hole.");
		play("unmend");
		const clerk = d.actors.rue;
		if (clerk?.alive) {
			clerk.hostile = true;
			clerk.aggro = true;
			clerk.vision = 5;
			if (dist(d.player, clerk) <= 6) startCombat(d, ["rue"]);
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "switchdesk" && specialId === "seat-claim") {
		if (!claim || !claim.severed) {
			addLog(d, "The stamp is already a stamp.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to write the claim back.");
			return true;
		}
		d.focus -= 3;
		claim.severed = false;
		claim.integrity = 100;
		claim.revealed = true;
		noteVerb(d, "mend");
		const clerk = d.actors.rue;
		if (clerk?.alive && !d.flags.switchCaught) {
			clerk.hostile = false;
			clerk.aggro = false;
			clerk.vision = 0;
		}
		addLog(d, d.flags.switchCaught ? "You seat the stamp. The till she watched you lift is still a seeing." : "You seat the stamp. The bill can ride a haul the books can see.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "switchdesk" && specialId === "lift-till") {
		if (d.flags.switchTill) {
			addLog(d, "The till is already empty.");
			return true;
		}
		d.flags.switchTill = true;
		d.scrip += 14;
		noteVerb(d, "sabotage");
		const seen = yardWitness(d);
		if (seen) {
			d.flags.switchCaught = true;
			d.flags.bountyScrip = Number(d.flags.bountyScrip ?? 0) + 14;
			d.reputation.bureau = clamp$1(d.reputation.bureau - 8, -100, 100);
			seen.hostile = true;
			seen.aggro = true;
			seen.vision = 5;
			addLog(d, `${seen.name} saw the hands. The scrip is yours. The seeing is not.`);
			play("unmend");
			if (dist(d.player, seen) <= 5) startCombat(d, [seen.id]);
		} else {
			addLog(d, "The till leaves quietly. Nobody in the room was close enough to file it.");
			play("ui");
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "switchbench" && specialId === "buy-bandage") {
		const cost = 8;
		if (d.scrip < cost) {
			addLog(d, `A bandage is ${cost} scrip.`);
			return true;
		}
		d.scrip -= cost;
		addItem(d, "bandage", 1);
		noteVerb(d, "barter");
		addLog(d, "You buy a bandage. Cloth. Not a civic good.");
		play("ui");
		return true;
	}
	if (m.id === "switchbench" && specialId === "buy-boots") {
		const cost = d.flags.switchShop ? 8 : 14;
		if (hasItem(d, "slickboot")) {
			addLog(d, "You already have a pair. They still will not grease the axle.");
			return true;
		}
		if (d.scrip < cost) {
			addLog(d, `Yard boots are ${cost} scrip${d.flags.switchShop ? ". The shed is allowed to sell." : ". The shed is not a shop yet, so the price is the quiet one."}`);
			return true;
		}
		d.scrip -= cost;
		addItem(d, "slickboot", 1);
		noteVerb(d, "barter");
		addLog(d, "You buy yard boots. Your step is covered. Wick's is not.");
		play("ui");
		return true;
	}
	if (m.id === "waycrate" && specialId === "read-bill") {
		const paper = m.nodes.find((n) => n.id === "paper");
		if (paper) {
			paper.revealed = true;
			paper.integrity = 100;
		}
		d.flags.waybillRead = true;
		if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
		noteVerb(d, "audit");
		addLog(d, "The waybill names Bram's held cart and this table as one refusal. Reading it did not move the cart.");
		play("ui");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "waycrate" && specialId === "lift-bill") {
		if (!d.flags.waybillRead) {
			addLog(d, "You have not named the paper. Lifting a thing you have not read is how a nest stands up.");
			return true;
		}
		if (d.flags.waybillSmashed) {
			addLog(d, "The crate is already wreckage.");
			return true;
		}
		d.flags.waybillLifted = true;
		if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
		noteVerb(d, "sneak");
		addLog(d, "You lift the paper. The rat stays nested. The sentence leaves with you.");
		play("ui");
		return true;
	}
	if (m.id === "waycrate" && specialId === "smash-bill") {
		if (d.flags.waybillSmashed) {
			addLog(d, "The crate is already smashed.");
			return true;
		}
		const nest = m.nodes.find((n) => n.id === "nest");
		const paper = m.nodes.find((n) => n.id === "paper");
		if (nest) {
			nest.severed = true;
			nest.integrity = 0;
		}
		if (paper) paper.revealed = true;
		d.flags.waybillRead = true;
		d.flags.waybillSmashed = true;
		if (!hasItem(d, "waybill")) addItem(d, "waybill", 1);
		noteVerb(d, "sabotage");
		addLog(d, "You smash the parent out of the nest. The rat has to stand up. The paper still names the cart.");
		play("unmend");
		const rat = d.actors.yardrat;
		if (rat?.alive) {
			rat.hostile = true;
			rat.aggro = true;
			rat.vision = 4;
			if (dist(d.player, rat) <= 6) startCombat(d, ["yardrat"]);
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	return false;
}
function runPaneSpecial(d, m, specialId) {
	if (!(/* @__PURE__ */ new Set([
		"panefire",
		"panestamp",
		"panebench",
		"anneal"
	])).has(m.id)) return false;
	if (m.id === "panebench" && specialId === "rest") return false;
	if (dist(d.player, m) > 1) {
		addLog(d, "You are not at the machine.");
		return true;
	}
	const fire = d.machines.panefire;
	const sand = fire?.nodes.find((n) => n.id === "sand");
	const flue = fire?.nodes.find((n) => n.id === "flue");
	const bed = fire?.nodes.find((n) => n.id === "bed");
	const borrow = fire?.nodes.find((n) => n.id === "borrow");
	const claim = d.machines.panestamp?.nodes.find((n) => n.id === "claim");
	const kilnLive = () => {
		const kiln = d.machines.kilnfire;
		const local = kiln?.nodes.find((n) => n.id === "bed");
		const hearth = d.machines.hearth?.nodes.find((n) => n.id === "bed");
		const rust = Boolean(hearth && d.machines.hearth && nodeLive(d.machines.hearth.nodes, hearth));
		return Boolean(local && kiln && nodeLive(kiln.nodes, local) && d.flags.kilnRefused !== true) || d.flags.kilnBorrowed === true && rust && d.flags.kilnRefused !== true || Boolean(d.world?.live?.["kiln-bed"]);
	};
	if (m.id === "panefire" && specialId === "seat-flue") {
		if (!flue || !sand || !bed || !fire) return true;
		if (sand.severed || d.flags.paneSpilled || !nodeLive(fire.nodes, sand)) {
			addLog(d, "The sand is gone. A flue cannot parent itself. Seat the pit, or melt cullet and borrow a heat that does not drink this pit.");
			return true;
		}
		if (nodeLive(fire.nodes, flue) && d.flags.paneRefused !== true) {
			addLog(d, "The flue is already seated.");
			return true;
		}
		const cost = d.perks?.includes("steady-mend") ? 2 : 4;
		if (d.focus < cost) {
			addLog(d, "Focus is too thin to seat the flue.");
			return true;
		}
		d.focus -= cost;
		d.flags.paneRefused = false;
		flue.severed = false;
		flue.integrity = 100;
		flue.revealed = true;
		bed.severed = false;
		bed.integrity = 100;
		bed.revealed = true;
		noteVerb(d, "mend");
		addLog(d, "You seat the flue. The local bed has a parent. The melt still wants sand, or cullet if the pit is already gone.");
		play("mend");
		d.reputation.engineers = clamp$1(d.reputation.engineers + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "stop-flue") {
		if (!flue || !fire || !nodeLive(fire.nodes, flue)) {
			addLog(d, "The flue is already down.");
			return true;
		}
		flue.severed = true;
		flue.integrity = 0;
		flue.revealed = true;
		noteVerb(d, "sabotage");
		addLog(d, "You stop the flue. Borrowed kiln heat can still be a parent. This was not yet a refusal.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "borrow-heat") {
		if (!borrow) return true;
		if (!kilnLive()) {
			addLog(d, "No kiln bed is a parent right now. There is nothing to borrow.");
			return true;
		}
		if (d.flags.paneBorrowed && !borrow.severed) {
			addLog(d, "The house is already drinking a kiln.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to splice the heat.");
			return true;
		}
		d.focus -= 3;
		d.flags.paneBorrowed = true;
		d.flags.paneRefused = false;
		borrow.severed = false;
		borrow.integrity = 100;
		borrow.revealed = true;
		noteVerb(d, "redirect");
		addLog(d, "You splice the house onto a live kiln. The local flue can stay down. Sand, or cullet, still has to be a parent.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "cullet") {
		if (d.flags.paneCullet) {
			addLog(d, "The cullet is already in the melt. It will not become sand by being melted twice.");
			return true;
		}
		if (!hasItem(d, "scrap")) {
			addLog(d, "Cullet wants scrap. The pit is a different parent.");
			return true;
		}
		const sure = d.player.skills.engineering >= 70 || d.flags.solCullet === true;
		const chance = checkChance(d.player.skills.engineering, 42);
		const rolled = sure ? chance : rollD100();
		if (!sure && rolled > chance) {
			addLog(d, `The melt goes mean in the wrong direction. (${rolled} vs ${chance})`);
			return true;
		}
		takeItem(d, "scrap", 1);
		d.flags.paneCullet = true;
		noteVerb(d, "craft");
		addLog(d, sure ? "You know this melt. The pit does not have to be the parent." : `The cullet holds. (${rolled} vs ${chance}) The pit can stay spilled.`);
		play("mend");
		d.reputation.unbound = clamp$1(d.reputation.unbound + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "spill-sand") {
		if (!sand || sand.severed || d.flags.paneSpilled) {
			addLog(d, "The sand is already spilled.");
			return true;
		}
		sand.severed = true;
		sand.integrity = 0;
		d.flags.paneSpilled = true;
		noteVerb(d, "sabotage");
		addLog(d, "You spill the sand. Heat has nothing of the pit to melt until you seat it again, or melt cullet.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "seat-sand") {
		if (!sand || !fire) return true;
		if (!d.flags.paneSpilled && !sand.severed) {
			addLog(d, "The pit is already seated.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to seat the pit.");
			return true;
		}
		d.focus -= 3;
		d.flags.paneSpilled = false;
		sand.severed = false;
		sand.integrity = 100;
		sand.revealed = true;
		noteVerb(d, "mend");
		addLog(d, "You seat the pit. Sand is a parent again. The flue still has to be seated if you want this heat.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panefire" && specialId === "refuse-house") {
		if (d.flags.paneRefused) {
			addLog(d, "The house is already refused.");
			return true;
		}
		d.flags.paneRefused = true;
		d.flags.paneBorrowed = false;
		if (bed) {
			bed.severed = true;
			bed.integrity = 0;
			bed.revealed = true;
		}
		if (borrow) {
			borrow.severed = true;
			borrow.integrity = 0;
		}
		noteVerb(d, "sabotage");
		addLog(d, "You leave the beds down. The levy will have nothing to invoice. The glass will have nothing to hold.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panestamp" && specialId === "license-pane") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
			return true;
		}
		if (d.flags.paneLicensed) {
			addLog(d, "The bench is already licensed. The bill did not leave.");
			return true;
		}
		const believed = d.player.skills.speech >= 60;
		if (!believed && !payKiln(d, 10)) return true;
		d.flags.paneLicensed = true;
		noteVerb(d, "barter");
		addLog(d, believed ? "She already believes the voice. The levy stays. The bench may sell." : "You pay the stamp. The levy stays. The bench may sell.");
		play("ui");
		d.reputation.bureau = clamp$1(d.reputation.bureau + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panestamp" && specialId === "cut-pane") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is already a hole.");
			return true;
		}
		claim.severed = true;
		claim.integrity = 0;
		claim.revealed = true;
		noteVerb(d, "sabotage");
		d.reputation.bureau = clamp$1(d.reputation.bureau - 6, -100, 100);
		const clerk = d.actors.ness;
		if (clerk?.alive) {
			clerk.hostile = true;
			clerk.aggro = true;
			clerk.vision = 5;
			if (dist(d.player, clerk) <= 6) startCombat(d, ["ness"]);
		}
		addLog(d, "You cut the stamp. The levy dies with it. Ness answers the hole.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panestamp" && specialId === "seat-claim") {
		if (!claim || !claim.severed) {
			addLog(d, "The stamp is already a stamp.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to write the claim back.");
			return true;
		}
		d.focus -= 3;
		claim.severed = false;
		claim.integrity = 100;
		claim.revealed = true;
		noteVerb(d, "mend");
		const clerk = d.actors.ness;
		if (clerk?.alive && !d.flags.paneCaught) {
			clerk.hostile = false;
			clerk.aggro = false;
			clerk.vision = 0;
		}
		addLog(d, d.flags.paneCaught ? "You seat the stamp. The till she watched you lift is still a seeing." : "You seat the stamp. The bill can ride a melt that is real.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panestamp" && specialId === "lift-till") {
		if (d.flags.paneTill) {
			addLog(d, "The till is already empty.");
			return true;
		}
		d.flags.paneTill = true;
		d.scrip += 12;
		noteVerb(d, "sabotage");
		const seen = yardWitness(d);
		if (seen) {
			d.flags.paneCaught = true;
			d.flags.bountyScrip = Number(d.flags.bountyScrip ?? 0) + 12;
			d.reputation.bureau = clamp$1(d.reputation.bureau - 8, -100, 100);
			seen.hostile = true;
			seen.aggro = true;
			seen.vision = 5;
			addLog(d, `${seen.name} saw the hands. The scrip is yours. The seeing is not.`);
			play("unmend");
			if (dist(d.player, seen) <= 5) startCombat(d, [seen.id]);
		} else {
			addLog(d, "The till leaves quietly. Nobody in the room was close enough to file it.");
			play("ui");
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "panebench" && specialId === "draw-pane") {
		if (!d.flags.paneCharge) {
			addLog(d, "There is no clear melt to draw. A bench does not invent a parent.");
			return true;
		}
		if ((d.inventory.find((i) => i.id === "clearpane")?.qty ?? 0) >= 3) {
			addLog(d, "Three panes is a stack. The house is not a crate.");
			return true;
		}
		addItem(d, "clearpane", 1);
		noteVerb(d, "craft");
		addLog(d, "You draw a clear pane. It can be sold, or sat into a lamp that lost its glass. It is not the light.");
		play("mend");
		return true;
	}
	if (m.id === "panebench" && specialId === "sell-pane") {
		if (!hasItem(d, "clearpane")) {
			addLog(d, "You have no clear pane to sell.");
			return true;
		}
		takeItem(d, "clearpane", 1);
		const legal = Boolean(d.flags.paneShop);
		const gain = legal ? kilnPrice(d, 12) + 4 : kilnPrice(d, 4);
		d.scrip += gain;
		noteVerb(d, "barter");
		if (!legal && d.flags.paneLevy) {
			d.reputation.bureau = clamp$1(d.reputation.bureau - 2, -100, 100);
			addLog(d, `The bench pays ${gain} under the board. Ness will hear. The levy was the legal parent.`);
		} else addLog(d, legal ? `The bench pays ${gain}. It was allowed to.` : `The bench pays ${gain}. There is no levy to offend, and no permit to do it properly.`);
		return true;
	}
	if (m.id === "panebench" && specialId === "buy-lens") {
		if (!d.flags.paneShop) {
			addLog(d, "The lens is a finished good. The bench is not allowed to sell it. The vault is a different parent.");
			return true;
		}
		if (hasItem(d, "anneallens")) {
			addLog(d, "You already carry a lens. A second one does not name a second parent.");
			return true;
		}
		if (!payKiln(d, 14)) return true;
		addItem(d, "anneallens", 1);
		d.flags.lensBought = true;
		noteVerb(d, "barter");
		addLog(d, "You buy the anneal lens. The first audit of a machine will name a quiet parent. It does not replace that parent.");
		play("ui");
		return true;
	}
	if (m.id === "panebench" && specialId === "buy-mitts") {
		if (!d.flags.paneShop) {
			addLog(d, "The mitts are a finished good. The bench is not allowed to sell them.");
			return true;
		}
		if (hasItem(d, "panemitt")) {
			addLog(d, "You already have mitts. They still will not seat the flue.");
			return true;
		}
		if (!payKiln(d, 12)) return true;
		addItem(d, "panemitt", 1);
		noteVerb(d, "barter");
		addLog(d, "You buy furnace mitts. Your step on the hot floor is covered. The flue is not.");
		play("ui");
		return true;
	}
	if (m.id === "anneal" && specialId === "read-anneal") {
		const lens = m.nodes.find((n) => n.id === "lens");
		if (!lens) return true;
		if (lens.revealed || d.flags.annealRead) {
			addLog(d, "The lens is already named. It can be lifted. Smashing it is a different verb.");
			return true;
		}
		const chance = checkChance(d.player.skills.audit, 44);
		const rolled = rollD100();
		if (rolled > chance && !d.perks?.includes("parent-ear") && !hasItem(d, "anneallens")) {
			addLog(d, `The anneal shows you the nest and calls it the whole story. (${rolled} vs ${chance})`);
			return true;
		}
		lens.revealed = true;
		if (!lens.confidence) lens.confidence = "observed";
		d.flags.annealRead = true;
		noteVerb(d, "audit");
		addLog(d, "The nested lens is the parent the moth is using. The dead face was a costume.");
		d.audit = {
			kind: "machine",
			id: m.id
		};
		d.panel = "audit";
		return true;
	}
	if (m.id === "anneal" && specialId === "lift-anneal") {
		const lens = m.nodes.find((n) => n.id === "lens");
		if (d.flags.annealLifted || d.flags.annealSmashed) {
			addLog(d, "The lens is already gone.");
			return true;
		}
		if (!lens?.revealed && !d.flags.annealRead) {
			addLog(d, "You can see a dead face. You have not read the parent. Lifting blind would be a smash.");
			return true;
		}
		if (lens) {
			lens.severed = true;
			lens.integrity = 0;
		}
		d.flags.annealLifted = true;
		d.flags.annealRead = true;
		if (!hasItem(d, "anneallens")) addItem(d, "anneallens", 1);
		noteVerb(d, "mend");
		addLog(d, "You lift the lens. The moth stays nested. Carrying it names one quiet parent the next time you audit.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "anneal" && specialId === "smash-anneal") {
		if (d.flags.annealLifted || d.flags.annealSmashed) {
			addLog(d, "The lens is already gone.");
			return true;
		}
		const lens = m.nodes.find((n) => n.id === "lens");
		if (lens) {
			lens.severed = true;
			lens.integrity = 0;
			lens.revealed = true;
		}
		d.flags.annealSmashed = true;
		d.flags.annealRead = true;
		if (!hasItem(d, "anneallens")) addItem(d, "anneallens", 1);
		noteVerb(d, "sabotage");
		addLog(d, "You smash the parent out of the nest. The moth has to stand up.");
		play("unmend");
		const moth = d.actors.panemoth;
		if (moth?.alive) {
			moth.hostile = true;
			moth.aggro = true;
			moth.vision = 4;
			if (dist(d.player, moth) <= 6) startCombat(d, ["panemoth"]);
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	return false;
}
function runKilnSpecial(d, m, specialId) {
	if (!(/* @__PURE__ */ new Set([
		"kilnfire",
		"kilnstamp",
		"kilnbench",
		"kilncache"
	])).has(m.id)) return false;
	if (m.id === "kilnbench" && specialId === "rest") return false;
	if (dist(d.player, m) > 1) {
		addLog(d, "You are not at the machine.");
		return true;
	}
	const fire = d.machines.kilnfire;
	const flue = fire?.nodes.find((n) => n.id === "flue");
	const clay = fire?.nodes.find((n) => n.id === "clay");
	const bed = fire?.nodes.find((n) => n.id === "bed");
	const borrow = fire?.nodes.find((n) => n.id === "borrow");
	const claim = d.machines.kilnstamp?.nodes.find((n) => n.id === "claim");
	if (m.id === "kilnfire" && specialId === "seat-flue") {
		if (!flue || !clay || !bed || !fire) return true;
		if (clay.severed || !nodeLive(fire.nodes, clay)) {
			addLog(d, "The clay is gone. A flue cannot parent itself.");
			return true;
		}
		if (nodeLive(fire.nodes, flue) && d.flags.kilnRefused !== true) {
			addLog(d, "The flue is already seated.");
			return true;
		}
		const cost = d.perks?.includes("steady-mend") ? 2 : 4;
		if (d.focus < cost) {
			addLog(d, "Focus is too thin to seat the flue.");
			return true;
		}
		d.focus -= cost;
		d.flags.kilnRefused = false;
		flue.severed = false;
		flue.integrity = 100;
		flue.revealed = true;
		bed.severed = false;
		bed.integrity = 100;
		bed.revealed = true;
		noteVerb(d, "mend");
		addLog(d, "You seat the flue. The local bed has a parent. The set still wants water, or a field-dry, or it will crack.");
		play("mend");
		d.reputation.engineers = clamp$1(d.reputation.engineers + 2, -100, 100);
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnfire" && specialId === "stop-flue") {
		if (!flue || !fire || !nodeLive(fire.nodes, flue)) {
			addLog(d, "The flue is already down.");
			return true;
		}
		flue.severed = true;
		flue.integrity = 0;
		flue.revealed = true;
		noteVerb(d, "sabotage");
		addLog(d, "You stop the flue. Borrowed heat can still be a parent. This was not yet a refusal.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnfire" && specialId === "borrow-heat") {
		const heat = d.machines.hearth?.nodes.find((n) => n.id === "bed");
		if (!Boolean(heat && d.machines.hearth && nodeLive(d.machines.hearth.nodes, heat)) || !borrow) {
			addLog(d, "Rust's fire bed is not a parent right now. There is nothing to borrow.");
			return true;
		}
		if (d.flags.kilnBorrowed && !borrow.severed) {
			addLog(d, "The yard is already drinking Rust heat.");
			return true;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to splice the heat.");
			return true;
		}
		d.focus -= 3;
		d.flags.kilnBorrowed = true;
		d.flags.kilnRefused = false;
		borrow.severed = false;
		borrow.integrity = 100;
		borrow.revealed = true;
		noteVerb(d, "redirect");
		addLog(d, "You splice the yard onto Rust's fire. The local flue can stay down. The brick will still need clay, and water or a field-dry.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnfire" && specialId === "field-dry") {
		if (d.flags.fieldDry) {
			addLog(d, "The set is already field-dried. It will not become gallery water by being dried twice.");
			return true;
		}
		if (!hasItem(d, "scrap")) {
			addLog(d, "Field-dry wants plate scrap. The gallery is a different parent.");
			return true;
		}
		const sure = d.player.skills.engineering >= 70;
		const chance = checkChance(d.player.skills.engineering, 42);
		const rolled = sure ? chance : rollD100();
		if (!sure && rolled > chance) {
			addLog(d, `The bake goes mean in the wrong direction. (${rolled} vs ${chance})`);
			return true;
		}
		takeItem(d, "scrap", 1);
		d.flags.fieldDry = true;
		noteVerb(d, "craft");
		addLog(d, sure ? "You know this bake. The set no longer needs the gallery." : `The field-dry holds. (${rolled} vs ${chance}) The gallery can stay dry.`);
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnfire" && specialId === "spill-clay") {
		if (!clay || clay.severed) {
			addLog(d, "The clay is already spilled.");
			return true;
		}
		clay.severed = true;
		clay.integrity = 0;
		noteVerb(d, "sabotage");
		addLog(d, "You spill the clay. Water and heat have nothing local to set.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnfire" && specialId === "refuse-yard") {
		if (d.flags.kilnRefused) {
			addLog(d, "The yard is already refused.");
			return true;
		}
		d.flags.kilnRefused = true;
		d.flags.kilnBorrowed = false;
		if (bed) {
			bed.severed = true;
			bed.integrity = 0;
			bed.revealed = true;
		}
		if (borrow) {
			borrow.severed = true;
			borrow.integrity = 0;
		}
		noteVerb(d, "sabotage");
		addLog(d, "You leave the beds down. The levy will have nothing to invoice. The houses will have nothing to hold.");
		play("unmend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnstamp" && specialId === "license-stamp") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is a hole. A license cannot parent a claim that is gone.");
			return true;
		}
		if (d.flags.kilnLicensed) {
			addLog(d, "The board is already licensed. The levy did not leave.");
			return true;
		}
		const believed = d.player.skills.speech >= 60;
		const cost = kilnPrice(d, 12);
		if (!believed && d.scrip < cost) {
			addLog(d, `Cress wants ${cost} scrip, or a voice the Bureau already believes.`);
			return true;
		}
		if (!believed) d.scrip -= cost;
		d.flags.kilnLicensed = true;
		noteVerb(d, believed ? "negotiate" : "barter");
		d.reputation.bureau = clamp$1(d.reputation.bureau + 4, -100, 100);
		addLog(d, believed ? "You speak the stamp into a permit. The levy stays. The board can open." : "You pay the stamp. The levy stays. Jun is allowed to buy.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnstamp" && specialId === "cut-stamp") {
		if (!claim || claim.severed) {
			addLog(d, "The stamp is already a hole.");
			return true;
		}
		claim.severed = true;
		claim.integrity = 0;
		claim.revealed = true;
		d.flags.stampCut = true;
		noteVerb(d, "sabotage");
		d.reputation.bureau = clamp$1(d.reputation.bureau - 8, -100, 100);
		d.reputation.unbound = clamp$1(d.reputation.unbound + 6, -100, 100);
		addLog(d, "You cut the stamp. The levy dies. If the brick is real, the board no longer needs her permission.");
		play("unmend");
		const clerk = d.actors.cress;
		if (clerk?.alive) {
			clerk.hostile = true;
			clerk.aggro = true;
			clerk.vision = 5;
			if (dist(d.player, clerk) <= 6) startCombat(d, ["cress"]);
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilnbench" && specialId === "draw-brick") {
		if (!d.flags.brickLive) {
			addLog(d, "The set is not holding. A drawn brick would be a crack with a name.");
			return true;
		}
		if ((d.inventory.find((row) => row.id === "brick")?.qty ?? 0) >= 4) {
			addLog(d, "Four bricks is a pack, not a cart. Sell one before you draw another.");
			return true;
		}
		addItem(d, "brick", 1);
		noteVerb(d, "craft");
		addLog(d, "You draw a brick that held. It is a trade good, not a trophy.");
		return true;
	}
	if (m.id === "kilnbench" && specialId === "sell-brick") {
		if (!hasItem(d, "brick")) {
			addLog(d, "You have no set brick to sell.");
			return true;
		}
		takeItem(d, "brick", 1);
		const legal = Boolean(d.flags.kilnShop);
		const gain = legal ? kilnPrice(d, 11) + 4 : kilnPrice(d, 4);
		d.scrip += gain;
		noteVerb(d, "barter");
		if (!legal && d.flags.kilnLevy) {
			d.reputation.bureau = clamp$1(d.reputation.bureau - 2, -100, 100);
			addLog(d, `Jun pays ${gain} under the board. Cress will hear. The levy was the legal parent.`);
		} else addLog(d, legal ? `Jun pays ${gain}. The board was allowed to.` : `Jun pays ${gain}. There is no levy to offend, and no board to do it properly.`);
		return true;
	}
	if (m.id === "kilnbench" && (specialId === "buy-tin" || specialId === "buy-bandage" || specialId === "buy-chisel" || specialId === "buy-coat")) {
		if (specialId === "buy-chisel" && !d.flags.brickLive) {
			addLog(d, "Jun will not sell a firing tool while the set is a rumor.");
			return true;
		}
		if (specialId === "buy-coat" && !d.flags.kilnShop) {
			addLog(d, "The coat is a finished good. The board is not allowed to sell it.");
			return true;
		}
		const row = specialId === "buy-tin" ? {
			id: "tin",
			n: 6
		} : specialId === "buy-bandage" ? {
			id: "bandage",
			n: 8
		} : specialId === "buy-chisel" ? {
			id: "chisel",
			n: 16
		} : {
			id: "kilncoat",
			n: 22
		};
		if (!payKiln(d, row.n)) return true;
		addItem(d, row.id, 1);
		noteVerb(d, "barter");
		addLog(d, `You buy ${ITEMS[row.id]?.name ?? "the good"}.`);
		return true;
	}
	if (m.id === "kilncache" && specialId === "read-cache") {
		const glass = m.nodes.find((n) => n.id === "glass");
		if (!glass) return true;
		if (glass.revealed) {
			addLog(d, "The glass is already named. It can be lifted. Smashing it is a different verb.");
			return true;
		}
		const chance = checkChance(d.player.skills.audit, 44);
		const rolled = rollD100();
		if (rolled > chance && !d.perks?.includes("parent-ear")) {
			addLog(d, `The nest shows you the flue and calls it the whole story. (${rolled} vs ${chance})`);
			return true;
		}
		glass.revealed = true;
		if (!glass.confidence) glass.confidence = "observed";
		noteVerb(d, "audit");
		addLog(d, "The soot glass is the parent the mite is using. The dead face was a costume.");
		d.audit = {
			kind: "machine",
			id: m.id
		};
		d.panel = "audit";
		return true;
	}
	if (m.id === "kilncache" && specialId === "lift-glass") {
		const glass = m.nodes.find((n) => n.id === "glass");
		if (d.flags.glassLifted || d.flags.glassSmashed) {
			addLog(d, "The glass is already gone.");
			return true;
		}
		if (!glass?.revealed) {
			addLog(d, "You can see a dead face. You have not read the parent. Lifting blind would be a smash.");
			return true;
		}
		glass.severed = true;
		glass.integrity = 0;
		d.flags.glassLifted = true;
		addItem(d, "sootglass", 1);
		noteVerb(d, "mend");
		addLog(d, "You lift the glass. The mite stays nested. The lens will name one seam other people call illegible.");
		play("mend");
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	if (m.id === "kilncache" && specialId === "smash-cache") {
		if (d.flags.glassLifted || d.flags.glassSmashed) {
			addLog(d, "The glass is already gone.");
			return true;
		}
		const glass = m.nodes.find((n) => n.id === "glass");
		if (glass) {
			glass.severed = true;
			glass.integrity = 0;
			glass.revealed = true;
		}
		d.flags.glassSmashed = true;
		d.flags.miteAwake = true;
		addItem(d, "sootglass", 1);
		noteVerb(d, "sabotage");
		addLog(d, "You smash the parent out of the nest. The mite has to stand up.");
		play("unmend");
		const mite = d.actors.mite;
		if (mite?.alive) {
			mite.hostile = true;
			mite.aggro = true;
			mite.vision = 4;
			if (dist(d.player, mite) <= 6) startCombat(d, ["mite"]);
		}
		reconcileWorld(d);
		d.panel = "none";
		return true;
	}
	return false;
}
function runSpecial(d, machineId, specialId) {
	const m = d.machines[machineId];
	if (!m) return;
	if (runKilnSpecial(d, m, specialId)) return;
	if (runSwitchSpecial(d, m, specialId)) return;
	if (runPaneSpecial(d, m, specialId)) return;
	if (m.id === "spireheart") {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the unissued baseline.");
			return;
		}
		const held = m.nodes.find((n) => n.id === "held");
		const baseline = m.nodes.find((n) => n.id === "baseline");
		if (specialId === "read-heart") {
			if (held) held.revealed = true;
			if (baseline) baseline.revealed = true;
			noteVerb(d, "audit");
			const heldBits = [];
			if (d.flags.foodLive) heldBits.push("a ward that eats");
			if (d.flags.plotsRefused) heldBits.push("a bed that was refused");
			if (d.flags.bellowsLive === false) heldBits.push("a stopped lung");
			if (d.flags.gearLive) heldBits.push("stock with parents");
			if (d.flags.stockRefused) heldBits.push("a forge that was refused");
			if (d.flags.roadDark) heldBits.push("a dark road");
			if (d.flags.stoneMoving) heldBits.push("stone still moving");
			if (d.flags["seen:rust"] && d.flags.tenementWarm === false && d.flags.guildWarm === false) heldBits.push("sleepers without heat");
			if (d.flags.tundraWalked && d.flags.hollowWarm === false) heldBits.push("a hollow with no weather");
			if (d.actors.cinder?.companion) heldBits.push("a moth that chose a shadow");
			else if (d.flags.cinderLeft) heldBits.push("a moth that left");
			if (d.flags.dossShift) heldBits.push("a sleeper off the reed");
			if (d.flags.adaPlate) heldBits.push("a plate at the plots");
			if (d.flags.pimCount) heldBits.push("a rigger back on the count");
			if (d.flags.driftBed) heldBits.push("someone sleeping in the hollow");
			if (d.flags.citadelFate) heldBits.push(`a citadel already marked ${d.flags.citadelFate}`);
			if (d.flags.cartPinned) heldBits.push("a cart held on the road");
			if (d.flags.brickLive) heldBits.push("a kiln that set");
			if (d.flags.kilnRefused) heldBits.push("a yard that was refused");
			if (d.flags.kilnLevy) heldBits.push("a brick bill");
			if (d.flags.paneCharge) heldBits.push("a glasshouse that melted");
			if (d.flags.paneRefused) heldBits.push("a house that was refused");
			if (d.flags.paneGlass) heldBits.push("lamp glass that was made, not issued");
			if (d.flags.washSpill) heldBits.push("a wash drinking the quench");
			if (d.flags.iceCut) heldBits.push("a hollow cut at the glaze");
			addLog(d, `What is being held is intact: ${heldBits.length ? heldBits.join(", ") : "the city as you left the rooms"}. The issued baseline under it is almost empty. Restoring it would be an invention. Writing a new shape would still be yours.`);
			d.panel = "none";
			return;
		}
		if (specialId === "impose" || specialId === "release") {
			const ending = specialId;
			if (baseline && ending === "impose") {
				baseline.severed = false;
				baseline.integrity = 100;
				baseline.revealed = true;
			}
			if (baseline && ending === "release") {
				sever(d, m.nodes, baseline);
				baseline.revealed = true;
			}
			noteVerb(d, ending === "impose" ? "mend" : "cut");
			d.flags.ending = ending;
			d.ending = ending;
			d.epilogue = buildEpilogue(d, ending);
			d.phase = "epilogue";
			d.combat = null;
			d.dialogue = null;
			d.panel = "none";
			addLog(d, ending === "impose" ? "You write the shape. The city keeps it." : "You leave the holes. No baseline gets your name.");
			return;
		}
	}
	if (m.id === "hollow" && specialId === "read-hollow") {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not in the hollow.");
			return;
		}
		const feed = m.nodes.find((n) => n.id === "feed");
		if (feed) feed.revealed = true;
		d.flags.hollowRead = true;
		noteVerb(d, "audit");
		addLog(d, nodeLive(m.nodes, feed) ? "The hollow is warm. The warmth is a child of the orrery, not of the ice." : "The hollow is only brass. Its parent stopped sending weather.");
		d.panel = "none";
		reconcileWorld(d);
		return;
	}
	if (specialId === "face-surge" || specialId === "face-gear" || specialId === "face-engine") {
		faceMachine(d, m, specialId);
		return;
	}
	if (specialId === "brace" && m.id === "jack") {
		const footing = m.nodes.find((n) => n.id === "footing");
		const crown = m.nodes.find((n) => n.id === "crown");
		if (!footing || !crown) return;
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not under the crown.");
			return;
		}
		if (nodeLive(m.nodes, footing) && d.flags.jackHeld) {
			addLog(d, footing.integrity >= 100 ? "The footing is already itself." : "The crown is already held.");
			return;
		}
		if (d.focus < 3) {
			addLog(d, "Focus is too thin to set your weight.");
			return;
		}
		d.focus -= 3;
		const practiced = habit(d, "brace");
		const withTobin = Boolean(d.actors.tobin?.companion && dist(d.player, d.actors.tobin) <= 5);
		footing.severed = false;
		footing.integrity = Math.max(footing.integrity, withTobin ? 90 : practiced ? 78 : 62);
		noteVerb(d, "brace");
		if (withTobin && !d.flags.tobinJack) {
			d.flags.tobinJack = true;
			addLog(d, "Tobin sets his shoulder under yours. The brace reaches because he has done this before.");
		}
		addLog(d, practiced || withTobin ? "The brace reaches. The crown stops moving." : "You set your weight under the crown. The footing is held, not healed.");
		play("ui");
		burst(m.x, m.y, "brace");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "cistern" && (specialId === "to-market" || specialId === "to-clinic" || specialId === "seat-both")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the cistern.");
			return;
		}
		const next = specialId === "to-market" ? "market" : specialId === "to-clinic" ? "clinic" : "shared";
		if (wardSplit(d) === next) {
			addLog(d, next === "shared" ? "The split is already shared." : "The feed is already sent that way.");
			return;
		}
		if (specialId === "seat-both") {
			if (d.focus < 5) {
				addLog(d, "Focus is too thin to seat the split.");
				return;
			}
			if (d.player.skills.engineering < 40 && rollD100() > checkChance(d.player.skills.engineering, 46)) {
				d.focus = Math.max(0, d.focus - 3);
				addLog(d, "The split will not seat. The legs stay as they are.");
				return;
			}
			d.focus -= 5;
			d.flags.wardSplit = "shared";
			d.flags.wardSeated = true;
			noteVerb(d, "mend");
			addLog(d, "You seat the split. Both legs can drink from whatever the Sinks send.");
			play("mend");
		} else {
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to throw the split.");
				return;
			}
			d.focus -= 3;
			d.flags.wardSplit = next;
			noteVerb(d, "redirect");
			addLog(d, next === "market" ? "You send the feed to the stall. The clinic tap will go dry." : "You send the feed to the clinic. The stall will go dry.");
			play("steam");
		}
		const mark = `splitXp:${next}`;
		if (!d.flags[mark]) {
			d.flags[mark] = true;
			grantXp(d, 16);
		}
		burst(m.x, m.y, "mend");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "hearth" && (specialId === "bank" || specialId === "to-beds" || specialId === "to-hall" || specialId === "seat-heat")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the hearth.");
			return;
		}
		const bed = m.nodes.find((n) => n.id === "bed");
		if (!bed) return;
		if (specialId === "bank") {
			if (bed.severed) {
				addLog(d, "The bed is severed. A brace is not a weld.");
				return;
			}
			if (d.flags.hearthHeld && nodeLive(m.nodes, bed)) {
				addLog(d, "The fire is already banked.");
				return;
			}
			if (d.flags.stoneMoving && nodeLive(m.nodes, bed)) {
				addLog(d, "The quarry is already the parent. The bed does not need your weight.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to bank the fire.");
				return;
			}
			d.focus -= 3;
			const practiced = habit(d, "brace");
			bed.severed = false;
			bed.integrity = Math.max(bed.integrity, practiced ? 78 : 62);
			bed.dependsOn = d.flags.stoneMoving ? ["haul"] : [];
			d.flags.hearthHeld = true;
			noteVerb(d, "brace");
			addLog(d, practiced ? "The bank reaches. The bed holds without a quarry." : "You bank the fire. It is held, not fed.");
			play("ui");
			burst(m.x, m.y, "brace");
		} else {
			const next = specialId === "to-beds" ? "beds" : specialId === "to-hall" ? "hall" : "shared";
			if (hearthSplit(d) === next) {
				addLog(d, next === "shared" ? "Both flues are already seated." : "The heat is already sent that way.");
				return;
			}
			if (specialId === "seat-heat") {
				if (d.focus < 5) {
					addLog(d, "Focus is too thin to seat both flues.");
					return;
				}
				if (d.player.skills.engineering < 40 && rollD100() > checkChance(d.player.skills.engineering, 46)) {
					d.focus = Math.max(0, d.focus - 3);
					addLog(d, "The flues will not seat. The split stays as it is.");
					return;
				}
				d.focus -= 5;
				d.flags.hearthSplit = "shared";
				d.flags.hearthSeated = true;
				noteVerb(d, "mend");
				addLog(d, "You seat both flues. Hall and tenement can drink from the same bed.");
				play("mend");
			} else {
				if (d.focus < 3) {
					addLog(d, "Focus is too thin to throw the flues.");
					return;
				}
				d.focus -= 3;
				d.flags.hearthSplit = next;
				noteVerb(d, "redirect");
				addLog(d, next === "beds" ? "You send the heat to the sleepers. The hall will go cold." : "You send the heat to the hall. The sleepers will go cold.");
				play("steam");
			}
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (specialId === "rest") {
		const full = d.perks?.includes("thick-sleep");
		d.player.hp = full ? d.player.maxHp : Math.min(d.player.maxHp, d.player.hp + Math.ceil(d.player.maxHp * .45));
		d.focus = focusMax(d);
		addLog(d, full ? "You sleep the bed out. The morning is a full pulse, not a speech." : "You sleep like a tool put back in the right drawer.");
		play("mend");
		d.panel = "none";
		return;
	}
	if (specialId === "bind") {
		if (d.focus < 4) {
			addLog(d, "Focus is too thin to bind a body.");
			return;
		}
		const chance = checkChance(d.player.skills.medicine, 36);
		const rolled = rollD100();
		d.focus -= 4;
		if (rolled > chance) {
			addLog(d, `The binding slips. (${rolled} vs ${chance})`);
			play("hurt");
			return;
		}
		healActor(d, "player", 10 + Math.floor(d.player.skills.medicine / 10));
		noteVerb(d, "mend");
		noteField(d, "biology");
		addLog(d, "You close what cloth can close. It is medicine, not a miracle.");
		grantXp(d, 8);
		return;
	}
	if (specialId === "service") {
		const id = d.equipped.weapon;
		const row = d.inventory.find((i) => i.id === id);
		if (!row || id === "fist") {
			addLog(d, "Nothing in your hands wants a bench.");
			return;
		}
		if ((row.condition ?? 100) >= 98) {
			addLog(d, "That weapon is already telling the truth.");
			return;
		}
		if (d.focus < 6) {
			addLog(d, "Focus is too thin to reseat it.");
			return;
		}
		const chance = checkChance(d.player.skills.mechanics, 40);
		const rolled = rollD100();
		d.focus -= 6;
		if (rolled > chance) {
			addLog(d, `The fit is wrong. (${rolled} vs ${chance})`);
			return;
		}
		row.condition = 100;
		noteVerb(d, "repair");
		addLog(d, `${ITEMS[id]?.name ?? "The weapon"} seats again. It will hit like it means it.`);
		play("mend");
		grantXp(d, 10);
		return;
	}
	if (specialId === "slip") {
		if (!Boolean(d.flags.knowsCrawl)) {
			const chance = checkChance(d.player.skills.sneak, d.perks?.includes("soft-step") ? 40 : 52);
			const rolled = rollD100();
			if (rolled > chance) {
				addLog(d, `The grate will not take your shoulders. (${rolled} vs ${chance})`);
				return;
			}
			addLog(d, "You were not told about the crawl. You fit anyway.");
		}
		d.player.x = 16;
		d.player.y = 12;
		d.player.mapId = "sinks";
		d.flags.usedCrawl = true;
		d.path = [];
		d.panel = "none";
		noteVerb(d, "sneak");
		addLog(d, "You drop through and come up on the blind side of the checkpoint, near the stack road.");
		play("steam");
		return;
	}
	if (specialId === "gun") {
		if (!hasItem(d, "scrap")) {
			addLog(d, "You need plate scrap.");
			return;
		}
		const chance = checkChance(d.player.skills.mechanics, 42);
		const rolled = rollD100();
		if (rolled > chance) {
			addLog(d, `The scrap sulks. (${rolled} vs ${chance})`);
			return;
		}
		takeItem(d, "scrap", 1);
		addItem(d, "rivet", 1);
		d.equipped.weapon = "rivet";
		noteVerb(d, "craft");
		addLog(d, "The rivet gun chambers. It will argue at range.");
		grantXp(d, 15);
		return;
	}
	if (specialId === "drop" || specialId === "release") {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the machine.");
			return;
		}
		if (d.combat && currentId(d) !== "player") {
			addLog(d, "Not your action.");
			return;
		}
		if (m.nodes.some((n) => n.fail === "crush" && n.spent) || Boolean(d.flags[`${m.id}:dropped`])) {
			addLog(d, "The brake is already a rumor.");
			return;
		}
		const cable = m.nodes.find((n) => n.id === "cable" || n.id === "brake");
		if (!cable || cable.severed) {
			addLog(d, "The cable is already cut.");
			return;
		}
		if (d.combat) {
			if (d.player.ap < 3) {
				addLog(d, "Not enough action to kick the brake.");
				return;
			}
			d.player.ap -= 3;
		}
		if (m.id === "crane" && !d.flags.workersClear && !d.flags.workerHurt) {
			d.flags.workerHurt = true;
			d.reputation.unbound = clamp$1(d.reputation.unbound - 12, -100, 100);
			addLog(d, "A rigger was still on the hook. The stone does not choose carefully.");
		} else if (m.id === "crane" && d.flags.workersClear) {
			d.reputation.unbound = clamp$1(d.reputation.unbound + 6, -100, 100);
			addLog(d, "The slab comes down clear of the riggers.");
		}
		sever(d, m.nodes, cable);
		noteVerb(d, "sabotage");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "bellows" && (specialId === "seat-reed" || specialId === "stop-lung" || specialId === "leave-drip")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the bellows.");
			return;
		}
		const reed = seam(m.nodes, "reed");
		const lung = seam(m.nodes, "lung");
		if (!reed || !lung) return;
		if (specialId === "leave-drip") {
			if (d.flags.cinderFed) {
				addLog(d, "She already ate. More drip will not make the choosing yours.");
				return;
			}
			d.flags.cinderSeen = true;
			d.flags.cinderFed = true;
			noteVerb(d, "mend");
			addLog(d, "You leave condensate on the reed. The moth drinks. Hunger was the parent. The shadow is still hers to choose.");
			play("mend");
			reconcileWorld(d);
			d.panel = "none";
			return;
		}
		if (specialId === "seat-reed") {
			if (nodeLive(m.nodes, reed)) {
				addLog(d, "The reed is already seated.");
				return;
			}
			if (d.focus < 4) {
				addLog(d, "Focus is too thin to seat the reed.");
				return;
			}
			d.focus -= 4;
			reed.severed = false;
			reed.integrity = 100;
			lung.severed = false;
			lung.integrity = 100;
			noteVerb(d, "mend");
			addLog(d, "You seat the reed. The pump has a lung. The city can take pressure again.");
			play("mend");
		} else {
			if (!nodeLive(m.nodes, reed)) {
				addLog(d, "The lung is already stopped.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to stop the lung.");
				return;
			}
			d.focus -= 3;
			sever(d, m.nodes, reed);
			reed.revealed = true;
			noteVerb(d, "sabotage");
			addLog(d, "You stop the reed. Downstream, a perfect pump is still a dry city.");
			play("unmend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "colossus" && (specialId === "wake-throat" || specialId === "still-throat")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not under the mask.");
			return;
		}
		const throat = seam(m.nodes, "throat");
		if (!throat) return;
		if (specialId === "wake-throat") {
			if (nodeLive(m.nodes, throat) && d.flags.colossusMended) {
				addLog(d, "The throat is already awake.");
				return;
			}
			if (d.focus < 4) {
				addLog(d, "Focus is too thin to wake the throat.");
				return;
			}
			d.focus -= 4;
			throat.severed = false;
			throat.integrity = 100;
			d.flags.colossusMended = true;
			noteVerb(d, "mend");
			addLog(d, "The turbine takes air. The crane cable upstairs has a parent again.");
			play("mend");
		} else {
			if (!nodeLive(m.nodes, throat)) {
				addLog(d, "The throat is already still.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to still the throat.");
				return;
			}
			d.focus -= 3;
			sever(d, m.nodes, throat);
			throat.revealed = true;
			noteVerb(d, "sabotage");
			addLog(d, "You still the turbine. The crane keeps its cable and loses the thing that was helping it hold.");
			play("unmend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "plots" && (specialId === "seat-bed" || specialId === "let-lie")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the plots.");
			return;
		}
		const bed = seam(m.nodes, "bed");
		if (!bed) return;
		if (specialId === "let-lie") {
			if (d.flags.plotsRefused && bed.severed) {
				addLog(d, "The bed is already lying. The levy has nothing, and so does the ward.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to refuse the bed.");
				return;
			}
			d.focus -= 2;
			bed.severed = true;
			bed.integrity = 0;
			bed.revealed = true;
			d.flags.plotsRefused = true;
			noteVerb(d, "sabotage");
			addLog(d, "You leave the bed. Clean water can still arrive. The plots will not take it. A levy cannot invoice a refusal.");
			play("unmend");
		} else {
			if (!d.flags.plotsRefused && !bed.severed) {
				addLog(d, "The bed is already seated. It still needs seated water.");
				return;
			}
			if (d.focus < 4) {
				addLog(d, "Focus is too thin to seat the bed.");
				return;
			}
			d.focus -= 4;
			bed.severed = false;
			bed.integrity = 100;
			bed.revealed = true;
			d.flags.plotsRefused = false;
			noteVerb(d, "mend");
			addLog(d, "You seat the bed. If the inlet has clean water, the ward eats. Quill can bill that meal.");
			play("mend");
		}
		burst(m.x, m.y, specialId === "let-lie" ? "snap" : "mend");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "forge" && (specialId === "seat-stock" || specialId === "refuse-stock")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the forge.");
			return;
		}
		const stock = seam(m.nodes, "stock");
		if (!stock) return;
		if (specialId === "refuse-stock") {
			if (d.flags.stockRefused && stock.severed) {
				addLog(d, "The stock is already refused. The parents are still whatever they were.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to refuse the stock.");
				return;
			}
			d.focus -= 2;
			stock.severed = true;
			stock.integrity = 0;
			stock.revealed = true;
			d.flags.stockRefused = true;
			noteVerb(d, "sabotage");
			addLog(d, "You refuse the stock. Ore, quench, and fire can all be healthy. The hall still gets no new gear.");
			play("unmend");
		} else {
			if (!d.flags.stockRefused && !stock.severed) {
				addLog(d, "The stock is already seated. It still needs its three parents.");
				return;
			}
			if (d.focus < 4) {
				addLog(d, "Focus is too thin to seat the stock.");
				return;
			}
			d.focus -= 4;
			stock.severed = false;
			stock.integrity = 100;
			stock.revealed = true;
			d.flags.stockRefused = false;
			noteVerb(d, "mend");
			addLog(d, "You seat the stock. It will make gear only if the pit, the gallery, and the fire all still hold.");
			play("mend");
		}
		burst(m.x, m.y, specialId === "refuse-stock" ? "snap" : "mend");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "chute" && (specialId === "spill-grade" || specialId === "seat-grade")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the chute.");
			return;
		}
		const grade = seam(m.nodes, "grade");
		if (!grade) return;
		if (specialId === "spill-grade") {
			if (grade.severed) {
				addLog(d, "The grade is already spilling.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to spill the grade.");
				return;
			}
			d.focus -= 2;
			sever(d, m.nodes, grade);
			grade.revealed = true;
			noteVerb(d, "sabotage");
			addLog(d, "You spill the grade. Stone can still leave the pit. The forge will not call it ore.");
			play("unmend");
		} else {
			if (!grade.severed) {
				addLog(d, "The grade is already seated.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to seat the grade.");
				return;
			}
			d.focus -= 3;
			grade.severed = false;
			grade.integrity = 100;
			grade.revealed = true;
			noteVerb(d, "mend");
			addLog(d, "You seat the grade. The chute can parent the forge again, if the road is actually carrying stone.");
			play("mend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "lamps" && (specialId === "break-glass" || specialId === "seat-glass")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the lamp glass.");
			return;
		}
		const glass = seam(m.nodes, "glass");
		if (!glass) return;
		if (specialId === "break-glass") {
			if (glass.severed) {
				addLog(d, "The glass is already broken. The orrery was not the thing you cut.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to break the glass.");
				return;
			}
			d.focus -= 2;
			sever(d, m.nodes, glass);
			glass.revealed = true;
			noteVerb(d, "sabotage");
			addLog(d, "You break the lamp glass. The orrery can keep turning. The stack road will not have that child.");
			play("unmend");
		} else {
			if (!glass.severed) {
				addLog(d, "The glass is already seated.");
				return;
			}
			const fromYard = hasItem(d, "clearpane");
			const cost = fromYard ? 1 : 3;
			if (d.focus < cost) {
				addLog(d, fromYard ? "Focus is too thin to seat the pane." : "Focus is too thin to seat the glass.");
				return;
			}
			d.focus -= cost;
			if (fromYard) {
				takeItem(d, "clearpane", 1);
				d.flags.paneGlass = true;
			}
			glass.severed = false;
			glass.integrity = 100;
			noteVerb(d, "mend");
			addLog(d, fromYard ? "You seat a pane from the glasshouse. The orrery did not have to make the glass. The lamps still die if the orrery is not sending." : "You seat the glass. The lamps still die if the orrery is not sending.");
			play("mend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "orrery" && specialId === "read-orrery") {
		const drive = seam(m.nodes, "drive");
		const live = drive ? nodeLive(m.nodes, drive) : false;
		if (drive) drive.revealed = true;
		noteVerb(d, "audit");
		addLog(d, live ? "The rings are taking the siphon. The citadel still has a clock." : "The rings are stopped. The siphon is not sending a child.");
		d.panel = "none";
		return;
	}
	if (m.id === "relay" && (specialId === "ease-brake" || specialId === "pin-load")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the waystation brake.");
			return;
		}
		const brake = seam(m.nodes, "brake");
		const load = seam(m.nodes, "load");
		if (!brake || !load) return;
		if (specialId === "pin-load") {
			if (d.flags.cartPinned) {
				addLog(d, "The load is already pinned. The forge is already missing that parent.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to pin the load.");
				return;
			}
			d.focus -= 2;
			brake.revealed = true;
			load.revealed = true;
			sever(d, m.nodes, brake);
			d.flags.cartPinned = true;
			d.flags.cartEase = false;
			noteVerb(d, "sabotage");
			addLog(d, "You pin the load. Stone can leave the pit and still not become ore. Rust will meet the absence, not a speech.");
			play("unmend");
			burst(m.x, m.y, "snap");
		} else {
			if (d.flags.cartEase && !d.flags.cartPinned && !brake.severed) {
				addLog(d, "The brake is already eased. The cart does not need you again.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to ease the brake.");
				return;
			}
			d.focus -= 3;
			brake.severed = false;
			brake.integrity = 84;
			brake.revealed = true;
			load.severed = false;
			load.integrity = 80;
			load.revealed = true;
			d.flags.cartPinned = false;
			d.flags.cartEase = true;
			if (!d.flags.couplerGiven) {
				d.flags.couplerGiven = true;
				addItem(d, "coupler", 1);
				addLog(d, "The collar comes off in your hand. It holds a seam. It is a worse argument than a prybar.");
			}
			noteVerb(d, "mend");
			addLog(d, "You ease the brake. The cart can leave. Rust will feel the weight before anyone finishes the sentence.");
			play("mend");
			burst(m.x, m.y, "mend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "stake" && (specialId === "seat-span" || specialId === "cut-span")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the glaze stake.");
			return;
		}
		const guy = seam(m.nodes, "guy");
		const span = seam(m.nodes, "span");
		if (!guy || !span) return;
		if (specialId === "cut-span") {
			if (d.flags.iceCut) {
				addLog(d, "The span is already cut. The hollow is already paying for it.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to cut the span.");
				return;
			}
			d.focus -= 2;
			sever(d, m.nodes, guy);
			guy.revealed = true;
			span.revealed = true;
			d.flags.iceCut = true;
			d.flags.iceSpan = false;
			noteVerb(d, "cut");
			addLog(d, "You cut the span. The hollow goes cold even if a clock elsewhere is still sending. The ice will bill the middle harder.");
			play("unmend");
			burst(m.x, m.y, "snap");
		} else {
			if (d.flags.iceSpan && !guy.severed) {
				addLog(d, "The span is already seated. The ice has a floor.");
				return;
			}
			const cost = hasItem(d, "cleat") ? 2 : 4;
			if (d.focus < cost) {
				addLog(d, "Focus is too thin to seat the span.");
				return;
			}
			d.focus -= cost;
			guy.severed = false;
			guy.integrity = 86;
			guy.revealed = true;
			span.severed = false;
			span.integrity = 80;
			span.revealed = true;
			d.flags.iceSpan = true;
			d.flags.iceCut = false;
			noteVerb(d, "mend");
			addLog(d, hasItem(d, "cleat") ? "The cleats find the wire. The span seats. The middle stops billing you. The hollow's weather is left alone." : "You seat the span with your weight. The middle stops billing you. It is a floor, not a favor to the hollow.");
			play("mend");
			burst(m.x, m.y, "mend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "wash" && (specialId === "to-sleepers" || specialId === "to-forge" || specialId === "seat-wash")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the tenement wash.");
			return;
		}
		const mode = specialId === "to-sleepers" ? "sleepers" : specialId === "to-forge" ? "forge" : "shared";
		if (mode === "sleepers" && d.flags.washSpill === true && d.flags.washShared !== true || mode === "forge" && d.flags.washChosen === true && d.flags.washSpill !== true && d.flags.washShared !== true || mode === "shared" && d.flags.washShared === true) {
			addLog(d, "The wash is already sent that way.");
			return;
		}
		if (mode === "shared") {
			if (d.focus < 5) {
				addLog(d, "Focus is too thin to seat the shared wash.");
				return;
			}
			const maraHears = Boolean(d.actors.mara?.companion && d.flags.maraFate !== "restored" && dist(d.player, d.actors.mara) <= 5);
			if (!maraHears && d.player.skills.engineering < 36 && rollD100() > checkChance(d.player.skills.engineering, 44)) {
				d.focus = Math.max(0, d.focus - 3);
				addLog(d, "The split will not seat. The pipe stays as it is.");
				return;
			}
			if (maraHears && !d.flags.maraFlue) {
				d.flags.maraFlue = true;
				addLog(d, "Mara hums the flue until the split agrees. She knew the pipe before the diagram did.");
			}
			d.focus -= 5;
			d.flags.washSpill = false;
			d.flags.washShared = true;
			noteVerb(d, "mend");
			addLog(d, "You seat the split. Sleepers and forge can both drink, if the gallery has anything to send. Neither drink is a kindness.");
			play("mend");
		} else if (mode === "sleepers") {
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to throw the wash.");
				return;
			}
			d.focus -= 3;
			d.flags.washSpill = true;
			d.flags.washShared = false;
			noteVerb(d, "redirect");
			addLog(d, "You send the quench to the sleepers. The forge leg goes dry. Both sentences stay true.");
			play("steam");
		} else {
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to send it back.");
				return;
			}
			d.focus -= 2;
			d.flags.washSpill = false;
			d.flags.washShared = false;
			noteVerb(d, "redirect");
			addLog(d, "You send the quench back toward the forge. The sleeper pipe goes dry.");
			play("steam");
		}
		d.flags.washChosen = true;
		burst(m.x, m.y, mode === "sleepers" ? "snap" : "mend");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "gauge" && (specialId === "read-face" || specialId === "cut-feed")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the gauge.");
			return;
		}
		const face = seam(m.nodes, "face");
		const feed = seam(m.nodes, "feed");
		const pocket = seam(m.nodes, "pocket");
		if (!face || !feed || !pocket) return;
		if (specialId === "read-face") {
			if (d.flags.gaugeRead && feed.revealed) {
				addLog(d, "The face is already a costume. The feed is the parent.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to read past the face.");
				return;
			}
			d.focus -= 2;
			face.decoy = true;
			face.revealed = true;
			feed.revealed = true;
			pocket.revealed = true;
			if (!feed.confidence) feed.confidence = "understood";
			d.flags.gaugeRead = true;
			noteVerb(d, "audit");
			const wren = d.actors.wren;
			if (wren?.companion && dist(d.player, wren) <= 5 && !d.flags.wrenGauge) {
				d.flags.wrenGauge = true;
				addLog(d, "Wren names the feed before you finish the sentence. The face was never the failure.");
			}
			if (!d.flags.listenerGiven) {
				d.flags.listenerGiven = true;
				addItem(d, "listener", 1);
				addLog(d, "A coil comes off the gauge housing. It will name one seam you have not admitted. Once.");
			}
			addLog(d, "The face is a costume. The pocket feed behind it is holding. Cutting the face will bite, and it will not dry the district.");
			play("ui");
		} else {
			if (d.flags.gaugeCut) {
				addLog(d, "The pocket feed is already cut. The district pump was not this parent.");
				return;
			}
			if (!feed.revealed) {
				addLog(d, "You have not named the parent yet. The face is still the only thing the gauge admits.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to cut the feed.");
				return;
			}
			d.focus -= 3;
			sever(d, m.nodes, feed);
			feed.revealed = true;
			pocket.revealed = true;
			d.flags.gaugeCut = true;
			noteVerb(d, "cut");
			addLog(d, "You cut the pocket feed. The west pocket goes dry. The district pump does not. Something in the water was using that parent.");
			play("unmend");
		}
		burst(m.x, m.y, specialId === "cut-feed" ? "snap" : "mend");
		reconcileWorld(d);
		d.panel = "none";
		if (d.flags.gaugeCut && d.actors.servo?.alive && !d.combat) startCombat(d, ["servo"]);
		return;
	}
	if (m.id === "still" && (specialId === "break-still" || specialId === "license-still")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the still.");
			return;
		}
		const coil = seam(m.nodes, "coil");
		const cup = seam(m.nodes, "cup");
		if (!coil || !cup) return;
		if (specialId === "break-still") {
			if (d.flags.stillBroken) {
				addLog(d, "The still is already broken.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to break the coil.");
				return;
			}
			d.focus -= 2;
			sever(d, m.nodes, coil);
			cup.severed = true;
			cup.integrity = 0;
			d.flags.stillBroken = true;
			d.flags.stillLicensed = false;
			noteVerb(d, "sabotage");
			addLog(d, "You break the still. The cup goes. The clinic keeps whatever parent it had. The alley loses the difference.");
			play("unmend");
		} else {
			if (d.flags.stillLicensed) {
				addLog(d, "The trickle is already written down.");
				return;
			}
			const seraNear = Boolean(d.actors.sera?.companion && dist(d.player, d.actors.sera) <= 5);
			const cost = seraNear ? 2 : 4;
			if (d.focus < cost) {
				addLog(d, "Focus is too thin to license the cup.");
				return;
			}
			d.focus -= cost;
			coil.severed = false;
			coil.integrity = 70;
			coil.revealed = true;
			cup.severed = false;
			cup.integrity = 70;
			d.flags.stillBroken = false;
			d.flags.stillLicensed = true;
			noteVerb(d, "redirect");
			if (seraNear && !d.flags.seraStill) {
				d.flags.seraStill = true;
				addLog(d, "Sera says a licensed trickle is not a standard. She stays while you write it anyway.");
			}
			addLog(d, "You license the trickle. It stays a cup, not a well. The alley has a parent that is not a raid.");
			play("mend");
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "winchhouse" && (specialId === "brace-winch" || specialId === "cut-winch")) {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the night winch.");
			return;
		}
		const dog = seam(m.nodes, "dog");
		const cover = seam(m.nodes, "cover");
		const throat = d.machines.colossus ? seam(d.machines.colossus.nodes, "throat") : void 0;
		const breath = throat && d.machines.colossus ? nodeLive(d.machines.colossus.nodes, throat) : true;
		if (!dog || !cover) return;
		if (specialId === "brace-winch") {
			if (!breath) {
				addLog(d, "The throat is already still. Bracing this winch would pretend a parent is in the canyon. It is not.");
				return;
			}
			if (d.flags.crewStood) {
				addLog(d, "The crew already stood down. The throat is still the reason.");
				return;
			}
			if (d.focus < 3) {
				addLog(d, "Focus is too thin to brace the winch.");
				return;
			}
			d.focus -= 3;
			dog.severed = false;
			dog.integrity = 78;
			dog.revealed = true;
			d.flags.crewStood = true;
			noteVerb(d, "brace");
			if (!d.flags.dogGiven) {
				d.flags.dogGiven = true;
				addItem(d, "dog", 1);
				addLog(d, "Holt kicks a cable dog across the plate. It holds a seam. It is not a promotion.");
			}
			addLog(d, "You brace the winch. The crew can hear the throat. They stand down. The shade was never the stone.");
			play("ui");
		} else {
			if (d.flags.winchCut) {
				addLog(d, "The winch is already cut.");
				return;
			}
			if (d.focus < 2) {
				addLog(d, "Focus is too thin to cut the winch.");
				return;
			}
			d.focus -= 2;
			sever(d, m.nodes, dog);
			cover.revealed = true;
			d.flags.winchCut = true;
			noteVerb(d, "cut");
			if (breath) {
				d.flags.crewFled = true;
				addLog(d, "You cut the winch. The throat is still a parent. The crew will not stand under a live cable. They leave.");
				play("unmend");
			} else {
				addLog(d, "You cut the winch. The throat is already still. The crew has no other parent. They answer.");
				play("unmend");
				reconcileWorld(d);
				d.panel = "none";
				const ids = ["crew1", "crew2"].filter((id) => d.actors[id]?.alive);
				if (ids.length && !d.combat) startCombat(d, ids);
				return;
			}
		}
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (m.id === "buffer" && specialId === "charge-cell") {
		if (dist(d.player, m) > 1) {
			addLog(d, "You are not at the buffer.");
			return;
		}
		if (d.flags.citadelFate) {
			addLog(d, "The crucible has already been answered. The cell cannot rewrite that dark.");
			return;
		}
		if (d.flags.bufferCharged) {
			addLog(d, "The cell is already holding one night.");
			return;
		}
		const sip = d.machines.crucible ? seam(d.machines.crucible.nodes, "siphon") : void 0;
		if (!Boolean(sip && d.machines.crucible && nodeLive(d.machines.crucible.nodes, sip))) {
			addLog(d, "The siphon is not sending. A cell cannot charge from a parent that is already dark.");
			return;
		}
		if (d.focus < 4) {
			addLog(d, "Focus is too thin to charge the cell.");
			return;
		}
		d.focus -= 4;
		const cell = seam(m.nodes, "cell");
		const ward = seam(m.nodes, "ward");
		if (cell) {
			cell.severed = false;
			cell.integrity = 80;
			cell.revealed = true;
		}
		if (ward) {
			ward.severed = false;
			ward.integrity = 80;
			ward.revealed = true;
		}
		d.flags.bufferCharged = true;
		noteVerb(d, "mend");
		addLog(d, "You charge the cell. One infirmary can keep a night if you cut the siphon. The rest of the dark will still be honest.");
		play("mend");
		burst(m.x, m.y, "mend");
		reconcileWorld(d);
		d.panel = "none";
		return;
	}
	if (d.flags.citadelFate && specialId !== "rest") {
		addLog(d, "The crucible has already been answered.");
		return;
	}
	if (specialId === "sever") {
		const siphon = m.nodes.find((n) => n.id === "siphon");
		if (siphon) sever(d, m.nodes, siphon);
		noteVerb(d, "sabotage");
		finishCitadel(d, "sever");
		return;
	}
	if (specialId === "redirect") {
		if (d.player.skills.engineering < 45 && rollD100() > checkChance(d.player.skills.engineering, 48)) {
			addLog(d, "The splice will not seat. Your hands know it.");
			return;
		}
		const lifts = m.nodes.find((n) => n.id === "lifts");
		if (lifts) lifts.integrity = 25;
		noteVerb(d, "redirect");
		finishCitadel(d, "redirect");
		return;
	}
	if (specialId === "seize") {
		if (comp(d) < 8 && !d.disciplines.includes("continuity")) {
			addLog(d, "The rank engine does not accept handwriting this small.");
			applyHp(d, "player", 6);
			return;
		}
		finishCitadel(d, "seize");
	}
}
function finishCitadel(d, fate) {
	d.flags.citadelFate = fate;
	d.flags.spireOpen = true;
	if (!d.disciplines.includes("causal")) d.disciplines.push("causal");
	grantXp(d, 80);
	const text = {
		sever: "You severed the siphon. The spires sag. Hospitals go dark with the ballrooms. No blood on the ranking floor.",
		redirect: "You spliced the feed toward the Sinks. The undercity lights. The balconies will learn what cold is.",
		seize: "You sat in the rank engine. The city keeps its shape. The shape now answers to a maintenance key."
	};
	journal(d, "siphon", "The siphon", text[fate], "done");
	addLog(d, text[fate]);
	if (fate === "sever" && d.flags.bufferCharged) {
		d.flags.bufferHeld = true;
		addLog(d, "One infirmary keeps the night. The cell was already charged. The rest of the dark is honest.");
	} else if (d.flags.bufferCharged && fate !== "sever") addLog(d, "The buffer cell stays charged. Nothing asked it to keep a ward.");
	d.reputation.bureau = clamp$1(d.reputation.bureau - (fate === "seize" ? 6 : 16), -100, 100);
	d.reputation.unbound = clamp$1(d.reputation.unbound + (fate === "seize" ? 2 : fate === "redirect" ? 18 : 10), -100, 100);
	play("unmend");
	d.panel = "none";
	if (fate === "sever" && !d.flags.shaftOpen) {
		const ids = ["guard1", "guard2"].filter((id) => d.actors[id]?.alive);
		if (ids.length) {
			addLog(d, "The floor notices the dark.");
			startCombat(d, ids);
		}
	} else addLog(d, "The Void Spire is on the map now. Something there has no baseline.");
}
function checkVision(d) {
	if (d.combat || d.dialogue || d.phase !== "play") return;
	const seen = Object.values(d.actors).filter((a) => a.alive && a.hostile && a.aggro && a.mapId === d.mapId && dist(a, d.player) <= a.vision && a.vision > 0);
	if (seen.length) startCombat(d, seen.map((a) => a.id));
}
function spendSkill(d, id) {
	if (d.skillPoints <= 0) return;
	if (d.player.skills[id] >= 95) return;
	d.skillPoints -= 1;
	d.player.skills[id] = clamp$1(d.player.skills[id] + 4, 1, 95);
}
function takePerk(d, id) {
	if (!d.perks) d.perks = [];
	if ((d.perkPoints ?? 0) <= 0) return;
	if (d.perks.includes(id)) return;
	if (!PERKS.some((perk) => perk.id === id)) return;
	d.perkPoints = (d.perkPoints ?? 0) - 1;
	d.perks.push(id);
	d.flags[`perk:${id}`] = true;
	addLog(d, `${PERKS.find((perk) => perk.id === id)?.name ?? "The perk"} is how the hands will work. It is not a larger number.`);
}
function useItem(d, id) {
	const def = ITEMS[id];
	if (!def || !hasItem(d, id)) return;
	const inFight = Boolean(d.combat && currentId(d) === "player");
	if (def.kind === "weapon") {
		d.equipped.weapon = id;
		d.player.weapon = id;
		addLog(d, `Equipped ${def.name}.`);
		return;
	}
	if (def.kind === "armor") {
		d.equipped.armor = id;
		addLog(d, `You pull on ${def.name}.`);
		return;
	}
	if (def.kind === "accessory") {
		addLog(d, `${def.name} is for someone walking with you.`);
		return;
	}
	if (def.kind === "consumable") {
		if (inFight && d.player.ap < 2) {
			addLog(d, "Not enough action.");
			return;
		}
		if (inFight) d.player.ap -= 2;
		if (id === "chalk") {
			d.flags.chalked = true;
			takeItem(d, id, 1);
			addLog(d, "You chalk the next reading.");
			return;
		}
		if (id === "sootglass") {
			let nodes = d.audit?.kind === "machine" ? d.machines[d.audit.id]?.nodes : d.audit?.kind === "actor" ? d.audit.id === "player" ? d.player.nodes : d.actors[d.audit.id]?.nodes : void 0;
			if (!nodes) {
				let best = null;
				let bestD = 99;
				for (const machine of Object.values(d.machines)) {
					if (machine.mapId !== d.mapId) continue;
					const gap = Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y);
					if (gap < bestD) {
						best = machine;
						bestD = gap;
					}
				}
				nodes = best?.nodes;
				if (best && !d.audit) d.audit = {
					kind: "machine",
					id: best.id
				};
			}
			const hidden = (nodes ?? []).filter((n) => !n.revealed && n.tier === "obfuscated");
			if (!hidden.length) {
				addLog(d, "The soot glass has no illegible seam left on this graph.");
				return;
			}
			const pick = hidden[0];
			pick.revealed = true;
			if (!pick.confidence) pick.confidence = "observed";
			d.uiNode = pick.id;
			takeItem(d, id, 1);
			noteVerb(d, "audit");
			addLog(d, `The soot glass names ${pick.name}. The surface had called it illegible.`);
			d.panel = "audit";
			return;
		}
		if (id === "listener") {
			let nodes = d.audit?.kind === "machine" ? d.machines[d.audit.id]?.nodes : d.audit?.kind === "actor" ? d.audit.id === "player" ? d.player.nodes : d.actors[d.audit.id]?.nodes : void 0;
			if (!nodes) {
				let best = null;
				let bestD = 99;
				for (const machine of Object.values(d.machines)) {
					if (machine.mapId !== d.mapId) continue;
					const gap = Math.abs(machine.x - d.player.x) + Math.abs(machine.y - d.player.y);
					if (gap < bestD) {
						best = machine;
						bestD = gap;
					}
				}
				nodes = best?.nodes;
				if (best && !d.audit) d.audit = {
					kind: "machine",
					id: best.id
				};
			}
			const hidden = (nodes ?? []).filter((n) => !n.revealed && !n.decoy && n.tier !== "obfuscated");
			if (!hidden.length) {
				addLog(d, "The listener has nothing left to name on this graph.");
				return;
			}
			hidden.sort((a, b) => a.integrity - b.integrity);
			const pick = hidden[0];
			pick.revealed = true;
			if (!pick.confidence) pick.confidence = "observed";
			d.uiNode = pick.id;
			takeItem(d, id, 1);
			noteVerb(d, "audit");
			addLog(d, `The listener names ${pick.name}. It was already in the graph.`);
			d.panel = "audit";
			return;
		}
		if (def.heal) healActor(d, "player", def.heal);
		if (def.focus) d.focus = Math.min(focusMax(d), d.focus + def.focus);
		takeItem(d, id, 1);
		addLog(d, `Used ${def.name}.`);
	}
}
function buildEpilogue(d, ending) {
	const lines = [];
	if (ending === "impose") lines.push("You wrote the shape. The city keeps a silhouette, and the silhouette has your hand on it. People fit the drawing. Some of them thank you. Some of them cannot remember the version of themselves that would have refused.");
	else lines.push("You left the holes. No baseline got your name. The city stays unfinished. That is not kindness and it is not cruelty. It is weather with room for names that are not yours.");
	const pump = d.flags.pumpFate;
	if (pump === "mend") lines.push("The Sinks run clean. A ribbon on the pump still lies about who fixed it.");
	if (pump === "bleed") lines.push("The Sinks run brown. Nobody died of thirst. Plenty learned the taste of your shortcut.");
	if (pump === "speech") lines.push("The pump moves because a clerk was afraid. The Bureau framed the plaque.");
	if (pump === "flood") lines.push("Cellars remember the mend that came back wrong.");
	if (pump === "lockout") lines.push("The Sinks run because you cut a Bureau veto. The plaque calls it vandalism.");
	if (pump === "wren") lines.push("Wren seated the valve. Your name is not on the ribbon, which is why the ribbon is honest.");
	if (d.flags.bellowsLive === false) lines.push("The Sinks bellows was stopped. A seated pump still had no lung, and the city knew the difference.");
	const tob = d.flags.tobinFate;
	if (tob === "intact") lines.push("Tobin is unscarred and oddly gentle. He trusts diagrams more than he trusts pain. You did that.");
	if (tob === "scarred") lines.push("Tobin keeps the scar and the judgment that grew on it. He does not thank you. He stays.");
	if (tob === "distorted") lines.push("Tobin lives at a half-second delay. Wholeness, forced, invented someone adjacent to him.");
	if (!d.actors.tobin?.alive) lines.push("Tobin's baseline is gone. The bench has a new oil stain and no keeper.");
	if (d.flags.varrFate === "dead") lines.push("Varr is a file marked closed. RelSec read it as a declaration.");
	if (d.flags.varrFate === "stood") lines.push("Varr carried your sentence back to RelSec. They hated the grammar and believed it.");
	if (d.flags.varrFate === "spared") lines.push("Varr crawls through other people's stories without his plate.");
	if (d.flags.kaelFate === "spared") lines.push("Kael lives, divorced from his armor, repeating the word siphon like a man who bit it.");
	if (d.flags.kaelFate === "dead") lines.push("The quarry tells Kael's death as a fall of stone, which is only half a lie.");
	if (d.flags.workerHurt) lines.push("A rigger's name is on the crane. You did not clear the stone.");
	const mara = d.flags.maraFate;
	if (mara === "restored") lines.push("Mara remembers a kitchen and not the door-song. She sleeps. She is easier to hurt.");
	if (mara === "intact") lines.push("Mara keeps the nights and the cadence. She did not ask to be saved from the thing that saved her.");
	if (mara === "untouched") lines.push("You left Mara's lattice alone. Ives notices, and does not call it cowardice out loud.");
	const cit = d.flags.citadelFate;
	if (cit === "sever") lines.push("The spires sit lower. The dark is honest and it does not spare the infirmaries.");
	if (cit === "redirect") lines.push("Light pools in the Sinks. The balconies learn a new temperature.");
	if (cit === "expose") lines.push("The ceremony heard the diagram. The city has to pretend it did not, or change.");
	if (cit === "seize") lines.push("You are the standard now. Maintenance became a throne without changing its boots.");
	if (d.flags.bufferHeld) lines.push("One citadel infirmary kept a night on a charged cell. The rest of the dark was not spared.");
	else if (d.flags.bufferCharged && cit && cit !== "sever") lines.push("A buffer cell was charged and never asked to keep a ward.");
	else if (d.flags["seen:citadel"] && cit === "sever" && !d.flags.bufferCharged) lines.push("The wards went with the siphon. The buffer cell had been empty.");
	if (d.flags.ashCounsel) lines.push("Sera's warning remains in the margin: do not replace a broken god with your own face.");
	const split = d.flags.wardSplit;
	if (split === "clinic") lines.push("The lower ward's water went to the clinic. The stall learned a dry season.");
	else if (split === "market") lines.push("The lower ward's water went to the stall. The clinic tap stayed a rumor.");
	else if (d.flags.wardMarket && d.flags.wardClinic) lines.push("The lower ward drank on a shared split. Stall and clinic both had a parent.");
	else if (d.flags.seenWard || d.flags.pumpFate) lines.push("The lower ward cistern stayed a child of the Sinks. It did not grow a well.");
	if (d.flags.provisionalStamp) lines.push("A pricing clerk stamped brown water as provisional. The stall sold it under that name.");
	if (d.flags.bramRan) lines.push("Freight moved, because the plate stair was signed and the road mouth was not a squad.");
	const stone = d.flags.quarryStone;
	if (stone === "clear") lines.push("The quarry slab came down clear of the riggers.");
	if (stone === "scarred") lines.push("The quarry slab came down on a rigger. The stone was still stone.");
	if (d.flags.seenQuarry && d.flags.colossusBreath === false) lines.push("The canyon colossus stopped breathing. The crane cable carried the pit alone.");
	if (d.flags.seenCitadel && d.flags.citadelFate !== "sever" && d.flags.orreryTurn) lines.push("The frost orrery kept the citadel's time, because the siphon still had a child.");
	if (d.flags.seenCitadel && d.flags.orreryTurn === false) lines.push("The frost orrery stopped. The citadel had no clock left to lie with.");
	if (d.flags.stoneMoving && d.flags.tenementWarm && d.flags.guildWarm) lines.push("That stone reached the Rust Districts. Tenement and hall both had heat.");
	else if (d.flags.stoneMoving && d.flags.tenementWarm) lines.push("Quarry stone kept the tenement night. The guild hall did not drink.");
	else if (d.flags.stoneMoving && d.flags.guildWarm) lines.push("Quarry stone kept the guild hall. The sleepers did not.");
	else if (stone === "clear" || stone === "scarred") lines.push("Stone sat in the pit. The road would not carry it, or the hearth would not take it.");
	if (d.flags.hearthHeld && !d.flags.stoneMoving) lines.push("A fire in the Rust Districts was banked by hand. The quarry was not its parent.");
	if (d.flags.hearthSeated) lines.push("Both flues were seated. The split was a mend, not a favor.");
	if (d.flags.foodLive) lines.push("The ward plots were drinking. Food had a parent, and so did a levy.");
	if (d.flags.brickLive && d.flags.kilnLevy) lines.push("The kiln set brick. A levy rode the same smoke.");
	else if (d.flags.brickLive && d.flags.stampCut) lines.push("The kiln set brick after the stamp was cut. The houses held. The bill did not.");
	else if (d.flags.kilnRefused) lines.push("The kiln yard was refused. Nothing was invoiced. Nothing held the night.");
	else if (d.flags.fieldDry && d.flags.brickLive) lines.push("A field-dry set the kiln. The gallery did not have to be the parent.");
	if (d.flags.switchJam && !d.flags.switchShunt) lines.push("The Switch was jammed. The pit could still look finished. The citadel did not receive that parent.");
	else if (d.flags.switchShunt) lines.push("A shunt carried the haul off the books. The weight left. The stamp did not get to see it.");
	else if (d.flags.switchToll) lines.push("The Switch passed a haul the stamp could see. A bill rode the same table.");
	if (d.flags.switchGreased) lines.push("The yard plates were greased. A shed became a floor.");
	if (d.flags.paneCharge && d.flags.paneLevy) lines.push("The glasshouse melted clear. A levy rode the same smoke.");
	else if (d.flags.paneCharge && d.flags.paneCut) lines.push("The glasshouse melted after the stamp was cut. The house held. The bill did not.");
	else if (d.flags.paneRefused) lines.push("The glasshouse was refused. Nothing was invoiced. Nothing held the night.");
	else if (d.flags.paneCullet && d.flags.paneCharge) lines.push("Cullet melted the glasshouse. The pit did not have to stay the parent.");
	if (d.flags.paneGlass) lines.push("A pane from the glasshouse was sat into the lamps. The orrery did not have to make the glass.");
	if (d.flags.plotsRefused) lines.push("The plot bed was refused. The levy had nothing to invoice. The ward had less to eat.");
	else if (d.flags.pumpFate && d.flags.seenWard) lines.push("The ward plots never took a seated parent.");
	if (d.flags.nessaRefuses) lines.push("Nessa's wage stopped when the stall did. She would not front a debt against it.");
	if (d.flags.ashAccess && (d.flags.pumpFate || d.flags.seenWard)) lines.push("An unbound cut kept the service alley while the ward was unfed.");
	if (d.flags.gearLive) lines.push("Rust stock was a child of ore, quench, and fire. None of those parents was a virtue.");
	else if (d.flags.stockRefused) lines.push("The forge's parents were left in place. The stock was the thing that was refused.");
	if (d.flags.rustRation && !d.flags.foodLive) lines.push("Rust baked a ration because the hall was warm and the ward was not.");
	if (d.flags.bramHoard) lines.push("Bram held a cart in the ward. The citadel did not get that load.");
	else if (d.flags.citadelSupplied) lines.push("Quarry stone reached the citadel's stores. The road was a parent, not a rumor.");
	if (d.flags.roadDark) lines.push("The road lamps were dark. They had been a child of the orrery.");
	if (d.flags.workersKnow) lines.push("Wren's diagram of the bellows reached the quarry line.");
	if (d.flags.guardToll) lines.push("Citadel plate was unfed. The toll was the missing meal, not a new law.");
	const walker = d.actors.tobin;
	if (walker?.companion && (walker.bond?.accord ?? 50) < 40) lines.push("Tobin walked the whole way. He did not agree. He did not leave.");
	const ash = d.actors.sera;
	if (ash?.companion && (ash.bond?.fear ?? 0) >= 20 && (ash.bond?.loyalty ?? 0) > 0) lines.push("Sera stayed beside a choice she was afraid of. The fear was filed. The walking continued.");
	const moth = d.actors.cinder;
	if (moth?.companion && d.flags.cinderBack) lines.push("The reed moth left once. The reed was seated again, and she chose the shadow a second time.");
	else if (moth?.companion) {
		if (d.flags.bellowsLive === false) lines.push("The reed moth traveled with a stopped lung. She stayed restless. She stayed.");
		else if (d.flags.foodLive) lines.push("The reed moth learned the plots. When the ward ate, she ranged farther.");
		else lines.push("The reed moth chose a shadow and kept it. The choosing was hers.");
	} else if (d.flags.cinderLeft) lines.push("The reed moth left a shadow she had chosen. The lung, or the heat, was a fact she would not be dragged through.");
	else if (moth && d.flags.cinderFed) lines.push("Scrap was left at the reed. The moth ate. She did not leave her weather.");
	if (d.flags.cinderDarkOk && moth?.companion) lines.push("The moth crossed a dark road because she chose to. The dark did not become safe.");
	if (d.flags.cinderSpireOk && moth?.companion) lines.push("The moth heard the Spire and came anyway. She did not call the sound weather.");
	else if (d.flags.cinderSpireStay) lines.push("The moth stayed at the Spire mouth. The road was the last weather she wanted.");
	if (d.flags.larkSouth) lines.push("Lark left the high walk when the lamps failed. The south cut kept a runner.");
	if (d.flags.pipHome) lines.push("A child slept in the service cut while the ward was unfed, and was gone from it when the plots drank.");
	if (d.flags.pipShown) lines.push("Pip followed the moth along a drip the grate still remembered. The route was a refusal, not a door.");
	if (d.flags.dossShift) lines.push("Doss stopped sleeping on the reed. The lung had stopped making weather.");
	else if (d.flags.dossSpan) lines.push("Doss left a long iron under the reed. It was a reach, not a wage.");
	else if (d.flags.dossMet && d.flags.bellowsLive !== false) lines.push("Doss kept the reed. The weather was still a bed.");
	if (d.flags.gaugeCut) lines.push("A pocket feed in the Sinks was cut. The gauge face had been a costume. A drowned servo answered.");
	else if (d.flags.gaugeRead) lines.push("A gauge in the Sinks was a costume. The parent sat behind the face.");
	if (d.flags.stillLicensed) lines.push("An ash still was licensed. The cup stayed a trickle, and the alley had a parent that was not a raid.");
	else if (d.flags.stillBroken) lines.push("An ash still was broken while the ward was dry. The alley lost its cup.");
	if (d.flags.crewStood) lines.push("The night crew stood down. The colossus throat was still a parent of the cable.");
	else if (d.flags.crewFled) lines.push("The night crew left the winch. They would not stand under a live throat.");
	else if (d.flags.winchCut && (!d.actors.crew1?.alive || !d.actors.crew2?.alive)) lines.push("The night crew fought. The throat was already still, and the winch was the parent they had left.");
	if (d.flags.adaPlate || d.flags.adaMet && d.flags.foodLive) lines.push("Ada ate because the plots drank. She did not call the levy a gift.");
	else if (d.flags.adaMet && d.flags.plotsRefused) lines.push("Ada kept an empty plate. The refusal was still in the room.");
	if (d.flags.pimCount || d.flags.pimMet && d.flags.quarryStone === "clear") lines.push("Pim stood on the count after the slab missed. The fear had stood down with it.");
	else if (d.flags.pimMet && d.flags.quarryStone === "scarred") lines.push("Pim stayed off the grade. A name was already on the stone.");
	if (d.flags.sarnMet && d.flags.guardToll && d.flags.citadelFate !== "sever") lines.push("Sarn's kitchen was unfed. The toll was the missing meal.");
	if (d.flags.sarnMet && d.flags.citadelSupplied) lines.push("Sarn cooked from stone that had crossed the road. She did not thank the rank.");
	if (d.flags.sarnMet && d.flags.citadelFate === "sever") lines.push("Sarn kept the kitchen after the lifts died. The soup was not a consolation.");
	if (d.flags.driftBed || d.flags.driftMet && d.flags.hollowWarm) lines.push("Drift slept in the hollow. The weather was still being sent.");
	else if (d.flags.driftMet && d.flags.tundraWalked && d.flags.hollowWarm === false) lines.push("Drift stayed on the edge. The hollow had no weather.");
	if (d.flags.tundraWalked && d.flags.iceCut) lines.push("The glaze was cut. The hollow went cold even if the orrery was still sending. The ice kept a harder bill.");
	else if (d.flags.tundraWalked && d.flags.hollowWarm === false) lines.push("The tundra hollow went cold with the orrery. The ice kept the middle of the walk.");
	else if (d.flags.tundraWalked && d.flags.hollowWarm) lines.push("The brass hollow stayed warm. The orrery was still sending weather downhill.");
	if (d.flags.iceSpan) lines.push("The ice span was seated. The middle of the tundra stopped billing every step.");
	if (d.flags.cartPinned) lines.push("The waystation brake stayed pinned. Stone could leave the pit and still not become ore.");
	else if (d.flags.cartEase) lines.push("The waystation brake was eased. The cart did not wait for a speech.");
	if (d.flags.washSpill) lines.push("The tenement wash drank the quench. The forge was the child that went dry.");
	else if (d.flags.washShared) lines.push("The wash was shared. Sleepers and forge both drank, when the gallery had anything to send.");
	if (d.flags.mossMet && d.flags.cartPinned) lines.push("Moss stayed on the pinned brake. She did not call the hunger downstream a virtue.");
	else if (d.flags.mossMet && d.flags.cartEase) lines.push("Moss watched the cart leave. She did not go with the speech.");
	if (d.actors.tobin?.alive && !d.actors.tobin.companion && d.flags.metTobin) lines.push("Tobin was not on the last walk. The bench in the Sinks still had a keeper.");
	if (d.actors.wren?.alive && !d.actors.wren.companion && (d.flags["seen:sinks"] || d.flags.workersKnow)) lines.push(d.flags.workersKnow ? "Wren sent the diagram and stayed. The line moved without her feet." : "Wren kept the lines where she found them. The company was not required.");
	if (d.flags["seen:rust"] && d.actors.sera?.alive && !d.actors.sera.companion) lines.push("Sera stayed in the hall. The standard was watched from there, not from the road.");
	if (d.flags["seen:rust"] && d.actors.mara?.alive && !d.actors.mara.companion) lines.push("Mara kept the nights in Rust. They were not edited for the walk.");
	const names = [
		"tobin",
		"wren",
		"sera",
		"mara"
	].filter((id) => d.actors[id]?.companion).map((id) => d.actors[id].name);
	if (names.length) lines.push(`${names.join(", ")} ${names.length === 1 ? "was" : "were"} still walking when the baseline was answered. Agreement was not the price of the company.`);
	if (Number(d.flags["visits:haven"] ?? 0) > 1) lines.push("Oakhaven was walked more than once. The second visit was not the same pipe.");
	if (Number(d.flags["visits:quarry"] ?? 0) > 1) lines.push("The quarry was stood in again. The cable's children had already moved.");
	if (d.flags.roadBypass) lines.push("A south walk was known. The lamps were not required for every foot.");
	if (d.flags.rillSpoken) lines.push("Rill was named off the grade. The crane was not the only record.");
	const wren = d.actors.wren;
	if (wren?.companion && (wren.bond?.trust ?? 0) >= 48) lines.push("Wren carried the line the whole way. The diagram was not a leash.");
	lines.push("The ledger does not say you were right. It says what held, and what you decided was yours to cut.");
	return lines;
}
function applyEffects(d, effects) {
	if (!effects) return;
	for (const e of effects) {
		if (d.phase !== "play" && e.op !== "epilogue") continue;
		if (e.op === "flag") {
			d.flags[e.key] = e.value;
			if (e.key === "varrFate") releasePending(d, String(e.value));
		} else if (e.op === "xp") grantXp(d, e.n);
		else if (e.op === "scrip") d.scrip = Math.max(0, d.scrip + e.n);
		else if (e.op === "item") addItem(d, e.id, e.n ?? 1);
		else if (e.op === "take") takeItem(d, e.id, e.n ?? 1);
		else if (e.op === "journal") journal(d, e.id, e.title, e.text, e.status);
		else if (e.op === "log") addLog(d, e.text);
		else if (e.op === "heal") healActor(d, e.id, e.n);
		else if (e.op === "hurt") applyHp(d, e.id, e.n, false);
		else if (e.op === "discipline") {
			if (!d.disciplines.includes(e.id)) {
				d.disciplines.push(e.id);
				addLog(d, `Discipline opens: ${e.id}.`);
				if (e.id === "continuity") noteTrace(d, "continuity");
			}
		} else if (e.op === "rep") d.reputation[e.faction] = clamp$1(d.reputation[e.faction] + e.n, -100, 100);
		else if (e.op === "aggro") for (const id of e.ids) {
			if (d.flags.duel && id === "rel1") continue;
			const a = d.actors[id];
			if (a) a.aggro = e.on;
		}
		else if (e.op === "hostile") {
			const a = d.actors[e.id];
			if (a) a.hostile = e.on;
		} else if (e.op === "kill") {
			const a = d.actors[e.id];
			if (a) {
				a.alive = false;
				a.hp = 0;
				a.companion = false;
			}
		} else if (e.op === "recruit") {
			const a = d.actors[e.id];
			if (!a) continue;
			const creature = a.template === "cinder";
			for (const o of Object.values(d.actors)) {
				if (o.id === a.id) continue;
				if (creature && o.template !== "cinder") continue;
				if (!creature && o.template === "cinder") continue;
				o.companion = false;
			}
			a.companion = true;
			a.alive = true;
			noteVerb(d, "rescue");
			placeCompanion(d);
		} else if (e.op === "dismiss") {
			const a = d.actors[e.id];
			if (!a) continue;
			a.companion = false;
			a.mapId = a.home.mapId;
			a.x = a.home.x;
			a.y = a.home.y;
		} else if (e.op === "pin") d.pinned = e.text;
		else if (e.op === "rest") {
			d.player.hp = Math.min(d.player.maxHp, d.player.hp + Math.ceil(d.player.maxHp * .4));
			d.focus = focusMax(d);
		} else if (e.op === "goto") {
			d.mapId = e.map;
			d.player.mapId = e.map;
			d.player.x = e.x;
			d.player.y = e.y;
			placeCompanion(d);
			d.path = [];
		} else if (e.op === "spawn") {
			const base = spawnActor({
				id: e.id,
				template: e.template,
				map: d.mapId,
				x: e.x,
				y: e.y
			});
			base.hostile = true;
			base.aggro = true;
			base.nodes = structuredClone(TEMPLATES[e.template].nodes);
			d.actors[e.id] = base;
		} else if (e.op === "combat") startCombat(d, e.ids);
		else if (e.op === "arrive") arrive(d);
		else if (e.op === "epilogue") {
			d.ending = e.ending;
			d.epilogue = buildEpilogue(d, e.ending);
			d.phase = "epilogue";
			d.combat = null;
			d.dialogue = null;
			d.panel = "none";
		}
	}
	if (d.phase === "play") reconcileWorld(d);
}
function arrive(d) {
	const id = d.pendingMap;
	if (!id || !MAPS[id]) return;
	const lx = d.flags.landX;
	const ly = d.flags.landY;
	delete d.flags.landX;
	delete d.flags.landY;
	d.mapId = id;
	d.player.mapId = id;
	d.player.x = typeof lx === "number" ? lx : MAPS[id].entry.x;
	d.player.y = typeof ly === "number" ? ly : MAPS[id].entry.y;
	d.pendingMap = null;
	d.path = [];
	d.intent = null;
	d.dialogue = null;
	d.panel = "none";
	placeCompanion(d);
	if (id === "haven") d.flags.seenWard = true;
	const visits = Number(d.flags[`visits:${id}`] ?? 0) + 1;
	d.flags[`visits:${id}`] = visits;
	if (visits > 1) {
		const back = returnLine(d, id);
		if (back) addLog(d, back);
	}
	addLog(d, `You arrive at ${MAPS[id].name}.`);
	if (id === "kiln" && visits === 1) addLog(d, "Clay underfoot. The flue is quiet. Water, if it comes, will not come from this yard.");
	if (id === "switch" && visits === 1) addLog(d, "Plates underfoot. The table is still passing. Grease is not. A stamp is watching the weight.");
	if (id === "pane" && visits === 1) addLog(d, "Sand underfoot. The flue is quiet. Heat, if it comes, will not have to come from this pit. A stamp is watching the smoke.");
	if (id === "tundra" && !d.flags.tundraWalked) {
		d.flags.tundraWalked = true;
		addLog(d, "The brass ice is a floor with an opinion. The edges of the walk are quieter than the middle.");
	}
}
function returnLine(d, id) {
	if (id === "haven") {
		if (d.flags.foodLive && d.flags.levyLive) {
			const plate = d.flags.adaPlate ? " Ada is at the plots with a plate." : "";
			return d.flags.pipHome ? `Oakhaven again. The plots are drinking, the levy is drinking with them, and the child is not in the cut.${plate}` : `Oakhaven again. The plots are drinking, and the levy is drinking with them.${plate}`;
		}
		if (d.flags.plotsRefused) return d.flags.adaMet ? "Oakhaven again. The beds were refused. Ada still carries the empty plate." : "Oakhaven again. The beds were refused. Hunger and a dead bill arrived together.";
		if (d.flags.nessaRefuses) return "Oakhaven again. Nessa's stall is dark. The parent is not in this ward.";
		if (d.flags.ashAccess) return "Oakhaven again. The service cut is in use. The ward is still unfed.";
		if (d.flags.stillLicensed) return "Oakhaven again. Vetch is outside the alley. The license outlived the dryness.";
		if (d.flags.stillBroken) return "Oakhaven again. The still is broken. The cup did not come back.";
		return "Oakhaven again. The cistern is still a child. Look upstream.";
	}
	if (id === "sinks") {
		if (d.flags.bellowsLive === false) return d.flags.dossShift ? "The Sinks again. The lung is stopped, and Doss is not on the reed." : "The Sinks again. The lung is stopped. Downstream already knows.";
		if (d.flags.pumpFate) return "The Sinks again. The pump's answer is still in pipes that are not in this room.";
		if (d.flags.gaugeCut) return "The Sinks again. The west pocket is dry. The gauge face was never the parent.";
		if (d.flags.gaugeRead) return "The Sinks again. The gauge in the west pocket is still a costume.";
		return "The Sinks again. The bench kept your place.";
	}
	if (id === "quarry") {
		if (d.flags.cartPinned) return "The quarry again. Stone can leave the pit. The waystation is holding it, so the forge will not call it ore.";
		if (d.flags.crewStood) return "The quarry again. Holt's crew is down. The throat was the reason, not a speech.";
		if (d.flags.crewFled) return "The quarry again. The night crew left. They would not stand under a live throat.";
		if (d.flags.winchCut && (!d.actors.crew1?.alive || !d.actors.crew2?.alive)) return "The quarry again. The winch is cut. The crew answered because the throat was already still.";
		if (d.flags.oreSound === false) return "The quarry again. Sound ore is gone. The forge will notice before the pit makes a speech.";
		if (d.flags.quarryStone === "clear") return d.flags.pimCount ? "The quarry again. The slab is down, it missed the count, and Pim is standing on it." : "The quarry again. The slab is down, and it missed the count.";
		if (d.flags.quarryStone === "scarred" || d.flags.workerHurt) return "The quarry again. The slab is down. A name stayed with it.";
		return "The quarry again. The cable still has a parent, or it doesn't.";
	}
	if (id === "rust") {
		if (d.flags.cartPinned && d.flags.stoneMoving) return "Rust again. The pit sent stone. The yard does not have it. The brake on the road is still holding the cart.";
		if (d.flags.washSpill) return "Rust again. The wash is drinking the quench. The forge is the child that went dry.";
		if (d.flags.washShared && d.flags.washLive) return "Rust again. Sleepers and forge both have a drink. Neither one is a favor.";
		if (d.flags.gearLive) return "Rust again. Stock is live. Ore, quench, and fire are all still parents.";
		if (d.flags.stockRefused) return "Rust again. The stock was refused. The parents were left standing.";
		if (d.flags.rustRation && !d.flags.foodLive) return "Rust again. The hall is baking because the ward is not.";
		return "Rust again. Heat here is still a child of the haul.";
	}
	if (id === "road") {
		if (d.flags.cartPinned) return "The stack road again. Moss is on the pinned brake. Rust is missing a parent the pit thinks it sent.";
		if (d.flags.cartEase) return "The stack road again. The brake was eased. The weight left before the speech.";
		if (d.flags.larkSouth) return "The stack road again. Lark is on the south cut. The high walk belongs to the dark.";
		if (d.flags.roadDark) return "The stack road again. The lamps are dark. They were a child of the orrery.";
		if (d.flags.roadBypass) return "The stack road again. The south walk is still a path the lamps do not own.";
		return "The stack road again. The districts are rooms of one machine.";
	}
	if (id === "tundra") {
		if (d.flags.iceCut) return "The tundra again. The glaze is cut. The hollow is cold even if a clock elsewhere is still turning.";
		if (d.flags.iceSpan) return "The tundra again. The span is seated. The middle of the ice stopped billing the walk.";
		if (d.flags.driftBed) return "The tundra again. Drift is in the hollow. The weather is still being sent.";
		if (d.flags.hollowWarm === false && d.flags.driftMet) return "The tundra again. Drift is on the edge. The hollow has no weather.";
		if (d.flags.roadDark) return "The tundra again. The ice does not care that the lamps failed.";
		return "The tundra again. The citadel is still uphill of the same siphon.";
	}
	if (id === "citadel") {
		if (d.flags.citadelFate === "sever") return d.flags.bufferHeld ? "The citadel again. The siphon is cut. One ward kept the night. The rest did not." : "The citadel again. The siphon is cut. The road lost that parent.";
		if (d.flags.citadelFate === "seize") return "The citadel again. The rank engine has a hand on it. The shape did not become innocent.";
		if (d.flags.guardToll) return d.flags.sarnMet ? "The citadel again. Sarn's kitchen is unfed. The toll is still the missing meal." : "The citadel again. The plate is unfed. The toll is the missing meal.";
		return "The citadel again. The orrery, the lamps, and the rank are still one graph.";
	}
	if (id === "spire") return "The Spire again. The question did not grow a baseline while you were gone.";
	if (id === "kiln") {
		if (d.flags.kilnRefused) return "The kiln again. The beds were refused. The levy has nothing, and neither do the walls.";
		if (d.flags.brickLive && d.flags.kilnLevy && !d.flags.kilnShop) return "The kiln again. Brick is up. Cress is invoicing it. Jun still cannot sell.";
		if (d.flags.brickLive && d.flags.stampCut) return "The kiln again. The stamp is a hole. The set, if it holds, does not owe her.";
		if (d.flags.brickLive && d.flags.kilnShop) return "The kiln again. The board can buy. Look at whether the levy stayed.";
		if (d.flags.fieldDry && !d.flags.brickLive) return "The kiln again. The field-dry is in. The set still wants clay and a bed.";
		return "The kiln again. Clay is local. The set is still waiting on a parent that is not.";
	}
	if (id === "switch") {
		if (d.flags.switchJam && !d.flags.switchShunt) return "The Switch again. The table is jammed. Downstream already lost this parent.";
		if (d.flags.switchShunt && d.flags.switchGreased) return "The Switch again. The haul is off the books, and Wick is not on the plates.";
		if (d.flags.switchShunt) return "The Switch again. Weight is leaving where Rue cannot invoice it.";
		if (d.flags.switchToll && !d.flags.switchShop) return "The Switch again. The haul is on the books. The shed is not allowed to sell.";
		if (d.flags.switchShop) return "The Switch again. The shed can sell. Look at whether the bill stayed.";
		if (d.flags.switchGreased) return "The Switch again. The plates are quiet. The haul has not been answered.";
		return "The Switch again. The table still passes. The plates still bill a step.";
	}
	if (id === "pane") {
		if (d.flags.paneRefused) return "The Pane again. The beds were refused. The levy has nothing, and neither does the glass.";
		if (d.flags.paneCharge && d.flags.paneLevy && !d.flags.paneShop) return "The Pane again. The melt is up. Ness is invoicing it. The bench still cannot sell.";
		if (d.flags.paneCharge && d.flags.paneCut) return "The Pane again. The stamp is a hole. The melt, if it holds, does not owe her.";
		if (d.flags.paneCharge && d.flags.paneShop) return "The Pane again. The bench can sell. Look at whether the levy stayed.";
		if (d.flags.paneSpilled && !d.flags.paneCharge) return "The Pane again. The pit is spilled. Cullet, or a seated pit, is still a parent you have not used.";
		return "The Pane again. Sand is local. The melt is still waiting on a parent that is not.";
	}
	return null;
}
function depart(d) {
	const mouth = mouthAt(d.mapId, d.player.x, d.player.y);
	if (!mouth) {
		d.panel = "map";
		return;
	}
	if (mouth.need && !regionOpen(d, mouth.need)) {
		addLog(d, mouth.deny);
		d.path = [];
		return;
	}
	if (Boolean(d.flags.roadDark) && (mouth.dark || mouth.to === "road") && d.actors.cinder?.companion && !d.flags.cinderDarkOk) {
		d.dialogue = {
			convo: "cinder-dark",
			node: "start"
		};
		d.panel = "none";
		d.path = [];
		play("talk");
		return;
	}
	if (mouth.to === "spire" && d.actors.cinder?.companion && !d.flags.cinderSpireOk && !d.flags.cinderSpireStay) {
		d.dialogue = {
			convo: "cinder-spire",
			node: "start"
		};
		d.panel = "none";
		d.path = [];
		play("talk");
		return;
	}
	d.pendingMap = mouth.to;
	d.flags.landX = mouth.tx;
	d.flags.landY = mouth.ty;
	d.panel = "none";
	d.path = [];
	d.flags.traveled = true;
	arrive(d);
}
function freshActors() {
	const actors = {};
	for (const s of SPAWNS) actors[s.id] = spawnActor(s);
	return actors;
}
function freshMachines() {
	const machines = {};
	for (const m of MACHINES) machines[m.id] = structuredClone(m);
	return machines;
}
function regionOpen(d, need) {
	if (!need) return true;
	if (need === "act1") {
		const slipped = Boolean(d.flags.pumpFate && (d.flags.checkpointSpoke || d.flags.usedCrawl));
		return Boolean(d.flags.act1 || slipped);
	}
	return Boolean(d.flags[need]);
}
function brace(d) {
	if (!d.combat || currentId(d) !== "player") return;
	if (d.player.ap < 1) {
		addLog(d, "Not enough action to set your weight.");
		return;
	}
	d.player.ap = 0;
	d.player.guarding = true;
	noteVerb(d, "brace");
	addLog(d, "You set your weight over the lens. The next blow will find iron, not skin.");
	play("ui");
	burst(d.player.x, d.player.y, "brace");
	endPlayerTurn(d);
}
function endPlayerTurn(d) {
	if (!d.combat || currentId(d) !== "player") return;
	advance(d);
	beginTurn(d);
}
var SAVE_PREFIX = "mend-save-v1-";
function blankActor() {
	const attrs = {
		body: 4,
		finesse: 4,
		mind: 4,
		will: 4,
		presence: 4,
		perception: 4
	};
	return {
		id: "player",
		template: "player",
		name: "Silas Vance",
		title: "Patch",
		portrait: "/game/portraits/silas.jpg?v=3",
		sprite: "/game/sprites/silas.png?v=3",
		scale: 1,
		mapId: "sinks",
		x: 3,
		y: 3,
		home: {
			mapId: "sinks",
			x: 3,
			y: 3
		},
		hp: 30,
		maxHp: 30,
		ap: 0,
		maxAp: 8,
		attrs,
		skills: allSkills(attrs, []),
		tags: [],
		nodes: [],
		faction: "unbound",
		hostile: false,
		aggro: false,
		alive: true,
		companion: false,
		convo: "",
		weapon: "prybar",
		stunned: false,
		guarding: false,
		polymorphic: false,
		tier: 0,
		vision: 0
	};
}
function initialData() {
	return {
		phase: "title",
		ironman: false,
		name: "Silas Vance",
		mapId: "sinks",
		player: blankActor(),
		actors: {},
		machines: {},
		flags: {},
		journal: [],
		deeds: [],
		pinned: "",
		inventory: [],
		equipped: {
			weapon: "prybar",
			armor: null
		},
		scrip: 0,
		xp: 0,
		level: 1,
		skillPoints: 0,
		focus: 10,
		disciplines: ["matter"],
		reputation: {
			bureau: 0,
			unbound: 0,
			relsec: 0,
			ash: 0,
			engineers: 0
		},
		log: [],
		dialogue: null,
		panel: "none",
		combat: null,
		path: [],
		intent: null,
		audit: null,
		uiNode: null,
		pendingMap: null,
		pendingLevel: false,
		ending: null,
		epilogue: [],
		deathText: "",
		hasSave: false,
		zoom: .85,
		verbs: {},
		draft: {
			name: "Silas Vance",
			attrs: {
				body: 4,
				finesse: 4,
				mind: 4,
				will: 4,
				presence: 4,
				perception: 4
			},
			pool: 12,
			tags: []
		}
	};
}
function playerNodes() {
	return [
		{
			id: "haft",
			name: "Tool haft",
			domain: "matter",
			tier: "bond",
			integrity: 100,
			density: 2,
			baseline: 92,
			dependsOn: [],
			effect: "weapon",
			severed: false,
			revealed: true,
			gx: 28,
			gy: 40
		},
		{
			id: "knees",
			name: "Tendon line",
			domain: "biology",
			tier: "bond",
			integrity: 100,
			density: 3,
			baseline: 84,
			dependsOn: [],
			effect: "motive",
			severed: false,
			revealed: false,
			gx: 70,
			gy: 62
		},
		{
			id: "lens",
			name: "Audit lens",
			domain: "matter",
			tier: "anchor",
			integrity: 100,
			density: 3,
			baseline: 96,
			dependsOn: [],
			effect: "none",
			severed: false,
			revealed: true,
			gx: 48,
			gy: 22
		}
	];
}
function readSlot(id) {
	if (typeof localStorage === "undefined") return null;
	const raw = localStorage.getItem(SAVE_PREFIX + id);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (parsed.version !== 1 || !parsed.data) return null;
		return {
			label: parsed.label,
			when: parsed.savedAt,
			data: parsed.data
		};
	} catch {
		return null;
	}
}
function writeSlot(id, data) {
	if (typeof localStorage === "undefined") return;
	const label = `${data.name} · ${MAPS[data.mapId]?.name ?? "road"} · L${data.level}${data.combat ? ` · round ${data.combat.round}` : ""}`;
	localStorage.setItem(SAVE_PREFIX + id, JSON.stringify({
		version: 1,
		label,
		savedAt: Date.now(),
		data
	}));
}
function commit(set, fn, saveMode = "auto") {
	set((s) => {
		const data = structuredClone(s.data);
		fn(data);
		if (data.phase === "play" || data.phase === "epilogue") reconcileWorld(data);
		if (data.phase === "dead" && data.ironman) localStorage.removeItem(SAVE_PREFIX + "auto");
		else if (saveMode === "auto" && (data.phase === "play" || data.phase === "epilogue")) writeSlot("auto", data);
		data.hasSave = Boolean(readSlot("auto"));
		return { data };
	});
}
function midScene(d, a) {
	if (!a.companion || d.flags[`${a.id}Mid`]) return null;
	if (a.id === "tobin" && (d.flags["seen:haven"] || d.flags.seenWard) && (d.mapId === "haven" || d.mapId === "road")) return "tobin-mid";
	if (a.id === "wren" && (d.flags["seen:quarry"] || d.flags.seenQuarry) && (d.mapId === "quarry" || d.mapId === "road")) return "wren-mid";
	if (a.id === "sera" && (d.flags.gearLive || d.flags.stockRefused || d.flags["seen:rust"]) && (d.mapId === "road" || d.mapId === "tundra")) return "sera-mid";
	if (a.id === "mara" && d.flags["seen:rust"] && (d.mapId === "road" || d.mapId === "tundra")) return "mara-mid";
	return null;
}
function convoFor(d, a) {
	const late = Boolean(d.flags.citadelFate || d.flags.spireOpen || d.mapId === "spire");
	if (a.companion && late && !d.flags[`${a.id}Late`] && (a.id === "tobin" || a.id === "wren" || a.id === "sera" || a.id === "mara")) return `${a.id}-late`;
	const mid = midScene(d, a);
	if (mid) return mid;
	if (a.companion && d.mapId === "road") {
		if (a.id === "tobin" || a.id === "wren" || a.id === "sera" || a.id === "mara") return `${a.id}-road`;
	}
	if (a.id === "tobin" && d.flags.metTobin) return "tobin-after";
	if (a.companion && a.id === "tobin" && d.mapId === "kiln" && !d.flags.tobinKilnSpoke) return "tobin-kiln";
	if (a.companion && a.id === "wren" && d.mapId === "kiln" && !d.flags.wrenKilnSpoke) return "wren-kiln";
	if (a.companion && a.id === "tobin" && d.mapId === "switch" && !d.flags.tobinSwitchSpoke) return "tobin-switch";
	if (a.companion && a.id === "wren" && d.mapId === "switch" && !d.flags.wrenSwitchSpoke) return "wren-switch";
	if (a.companion && a.id === "tobin" && d.mapId === "pane" && !d.flags.tobinPaneSpoke) return "tobin-pane";
	if (a.companion && a.id === "wren" && d.mapId === "pane" && !d.flags.wrenPaneSpoke) return "wren-pane";
	return memoryConvo(d, a.id) ?? a.convo;
}
function openTalk(d, a) {
	if (!a.alive) return;
	if (d.combat) {
		if (a.hostile) strike(d, d.player, a);
		return;
	}
	if (a.hostile && a.aggro) {
		startCombat(d, [a.id]);
		return;
	}
	d.dialogue = {
		convo: convoFor(d, a),
		node: "start"
	};
	d.panel = "none";
	play("talk");
}
function myTurn(d) {
	if (!d.combat) return true;
	return d.combat.order[d.combat.index] === "player";
}
var useGame = create((set, get) => ({
	data: initialData(),
	boot: () => {
		const has = Boolean(readSlot("auto") || readSlot("slot1") || readSlot("slot2"));
		set((s) => ({ data: {
			...s.data,
			hasSave: has
		} }));
	},
	setIronman: (v) => set((s) => ({ data: {
		...s.data,
		ironman: v
	} })),
	openCreate: () => set((s) => ({ data: {
		...s.data,
		phase: "create"
	} })),
	setDraftName: (name) => set((s) => ({ data: {
		...s.data,
		draft: {
			...s.data.draft,
			name: name.slice(0, 24)
		}
	} })),
	draftAttr: (id, dir) => set((s) => {
		const draft = {
			...s.data.draft,
			attrs: { ...s.data.draft.attrs }
		};
		const next = draft.attrs[id] + dir;
		if (dir > 0 && (draft.pool <= 0 || next > 9)) return {};
		if (dir < 0 && next < 3) return {};
		draft.attrs[id] = next;
		draft.pool -= dir;
		return { data: {
			...s.data,
			draft
		} };
	}),
	toggleTag: (id) => set((s) => {
		const tags = [...s.data.draft.tags];
		const i = tags.indexOf(id);
		if (i >= 0) tags.splice(i, 1);
		else if (tags.length < 3) tags.push(id);
		return { data: {
			...s.data,
			draft: {
				...s.data.draft,
				tags
			}
		} };
	}),
	recommend: () => set((s) => ({ data: {
		...s.data,
		draft: {
			name: s.data.draft.name || "Silas Vance",
			attrs: {
				body: 4,
				finesse: 5,
				mind: 8,
				will: 6,
				presence: 5,
				perception: 8
			},
			pool: 0,
			tags: [
				"audit",
				"engineering",
				"speech"
			]
		}
	} })),
	startNew: () => commit(set, (d) => {
		const { attrs, tags, name } = d.draft;
		const skills = allSkills(attrs, tags);
		const hp = maxHp(attrs.body, 1);
		d.name = name.trim() || "Silas Vance";
		d.phase = "play";
		d.ironman = d.ironman;
		d.mapId = "sinks";
		d.player = {
			...blankActor(),
			name: d.name,
			attrs: { ...attrs },
			skills,
			tags: [...tags],
			hp,
			maxHp: hp,
			maxAp: 7 + Math.floor(attrs.finesse / 4),
			nodes: playerNodes(),
			mapId: "sinks",
			x: MAPS.sinks.entry.x,
			y: MAPS.sinks.entry.y
		};
		d.actors = freshActors();
		d.machines = freshMachines();
		d.flags = {};
		d.journal = [];
		d.deeds = [];
		d.verbs = {};
		d.traces = {};
		d.pendingEncounter = null;
		d.pinned = "The broken pump";
		d.inventory = [
			{
				id: "prybar",
				qty: 1,
				condition: 88
			},
			{
				id: "bandage",
				qty: 2
			},
			{
				id: "chalk",
				qty: 1
			},
			{
				id: "gears",
				qty: 1
			}
		];
		d.equipped = {
			weapon: "prybar",
			armor: null
		};
		d.scrip = 18;
		d.xp = 0;
		d.level = 1;
		d.skillPoints = 4 + attrs.mind;
		d.focus = maxFocus(attrs.will);
		d.disciplines = ["matter"];
		d.reputation = {
			bureau: 0,
			unbound: 0,
			relsec: 0,
			ash: 0,
			engineers: 0
		};
		d.log = ["Wet iron. Coal smoke. Tobin is at the bench, and the Bureau's zero is still on you."];
		d.dialogue = {
			convo: "tobin-intro",
			node: "start"
		};
		d.panel = "none";
		d.combat = null;
		d.path = [];
		d.intent = null;
		d.audit = null;
		d.ending = null;
		d.epilogue = [];
		d.pendingLevel = false;
		d.pendingMap = null;
		play("talk");
	}),
	listSaves: () => {
		return [
			"auto",
			"slot1",
			"slot2",
			"slot3"
		].map((id) => {
			const row = readSlot(id);
			return row ? {
				id,
				label: row.label,
				when: row.when
			} : null;
		}).filter((x) => Boolean(x));
	},
	save: (slot) => {
		const data = get().data;
		if (data.phase !== "play" && data.phase !== "epilogue") return;
		if (data.ironman && slot !== "auto") return;
		writeSlot(slot, structuredClone(data));
		set((s) => ({ data: {
			...s.data,
			hasSave: true,
			log: [`Ledger filed (${slot}).`, ...s.data.log].slice(0, 40)
		} }));
		play("ui");
	},
	load: (slot) => {
		const row = readSlot(slot);
		if (!row) return;
		row.data.hasSave = true;
		row.data.panel = "none";
		row.data.path = [];
		row.data.intent = null;
		if (!row.data.verbs) row.data.verbs = {};
		if (!row.data.traces) row.data.traces = {};
		if (!row.data.perks) row.data.perks = [];
		if (row.data.perkPoints == null) row.data.perkPoints = Math.max(0, (row.data.level ?? 1) - 1);
		if (row.data.combat && row.data.phase === "play") {
			if (!row.data.combat.tally) row.data.combat.tally = {
				strikes: 0,
				cuts: 0,
				mends: 0,
				kills: 0
			};
			freezeIntents(row.data);
			row.data.log = [`Engagement resumes on round ${row.data.combat.round}. Cuts stay cut.`, ...row.data.log].slice(0, 40);
		}
		reconcileWorld(row.data);
		set({ data: row.data });
		play("talk");
	},
	quit: () => set((s) => ({ data: {
		...initialData(),
		ironman: false,
		hasSave: Boolean(readSlot("auto") || readSlot("slot1"))
	} })),
	closePanel: () => set((s) => ({ data: {
		...s.data,
		panel: "none"
	} })),
	openPanel: (p) => set((s) => ({ data: {
		...s.data,
		panel: s.data.panel === p ? "none" : p
	} })),
	clickTile: (x, y) => commit(set, (d) => {
		if (d.phase !== "play" || d.dialogue) return;
		if (d.panel !== "none" && d.panel !== "audit") return;
		if (!myTurn(d)) return;
		const person = actorAt(d, x, y);
		const gear = machineAt(d, x, y);
		const door = LOCKED_DOORS.find((door) => door.map === d.mapId && door.x === x && door.y === y && !d.flags[door.flag]);
		if (person) {
			if (dist(d.player, person) <= 1) openTalk(d, person);
			else if (!refuseWalk(d)) {
				d.path = pathNear(d, person.x, person.y) ?? [];
				d.intent = d.combat && person.hostile ? {
					type: "strike",
					id: person.id
				} : {
					type: "talk",
					id: person.id
				};
			}
			return;
		}
		if (gear) {
			if (dist(d.player, gear) <= 1) openAudit(d, {
				kind: "machine",
				id: gear.id
			});
			else if (!refuseWalk(d)) {
				d.path = pathNear(d, gear.x, gear.y) ?? [];
				d.intent = {
					type: "audit",
					id: gear.id,
					kind: "machine"
				};
			}
			return;
		}
		if (door) {
			if (dist(d.player, door) <= 1) {
				d.dialogue = {
					convo: door.convo,
					node: "start"
				};
				d.panel = "none";
			} else if (!refuseWalk(d)) {
				d.path = pathNear(d, door.x, door.y) ?? [];
				d.intent = {
					type: "door",
					convo: door.convo,
					x: door.x,
					y: door.y
				};
			}
			return;
		}
		if (isExit(d.mapId, x, y) && dist(d.player, {
			x,
			y
		}) <= 1 && !d.combat) {
			depart(d);
			return;
		}
		const path = pathTo(d, x, y);
		if (!path) {
			if (dist(d.player, {
				x,
				y
			}) > 1) addLog(d, "No clear path.");
			return;
		}
		if (refuseWalk(d)) return;
		d.path = path;
		d.intent = null;
	}, "none"),
	step: () => commit(set, (d) => {
		if (d.phase !== "play" || !d.path.length || d.dialogue) return;
		if (!myTurn(d)) return;
		if (refuseWalk(d)) return;
		const next = d.path[0];
		if (d.combat) d.player.ap -= gait(d.player) === "slow" ? 2 : 1;
		if (!walkable(d, next.x, next.y, "player")) {
			d.path = [];
			return;
		}
		movePlayer(d, next.x, next.y);
		d.path = d.path.slice(1);
		play("step", d.mapId === "tundra" ? "ice" : d.mapId === "rust" || d.mapId === "quarry" ? "metal" : d.mapId === "haven" ? "timber" : "sinks");
		if (!d.path.length && d.intent) {
			const intent = d.intent;
			d.intent = null;
			if (intent.type === "talk") {
				const a = d.actors[intent.id];
				if (a && dist(d.player, a) <= 1) openTalk(d, a);
			} else if (intent.type === "audit") {
				const target = {
					kind: intent.kind,
					id: intent.id
				};
				const pos = intent.kind === "machine" ? d.machines[intent.id] : d.actors[intent.id];
				if (pos && dist(d.player, pos) <= 1) openAudit(d, target);
			} else if (intent.type === "strike") {
				const a = d.actors[intent.id];
				if (a && a.alive) {
					if (!d.combat) startCombat(d, [a.id]);
					else if (dist(d.player, a) <= (weaponOf(d.player).range ?? 1)) strike(d, d.player, a);
				}
			} else if (intent.type === "door" && dist(d.player, intent) <= 1) d.dialogue = {
				convo: intent.convo,
				node: "start"
			};
		}
		if (d.phase === "play" && !d.combat && isExit(d.mapId, d.player.x, d.player.y)) depart(d);
		checkVision(d);
		if (!d.path.length) writeSlot("auto", d);
	}, "none"),
	choose: (index) => commit(set, (d) => {
		const node = currentNode(d);
		if (!node) return;
		const reply = node.replies.filter((r) => replyVisible(d, r.requires))[index];
		if (!reply) return;
		const from = d.dialogue?.convo;
		let effects = reply.effects;
		let goto = reply.goto;
		if (reply.check) {
			const skill = reply.check.skill;
			if (skill === "sneak" || skill === "lockwork") noteVerb(d, "sneak");
			else if (skill === "barter") noteVerb(d, "barter");
			else if (skill === "speech") noteVerb(d, /threat|intimidat|fear|yield|kneel|back down/i.test(reply.text) ? "threaten" : "negotiate");
			else if (skill === "mechanics" || skill === "engineering") noteVerb(d, "repair");
			else if (skill === "medicine") {
				noteVerb(d, "mend");
				noteField(d, "biology");
			} else if (skill === "psychology") noteField(d, "mind");
			const skillValue = d.player.skills[reply.check.skill];
			let chance = Math.max(5, Math.min(95, 50 + skillValue - reply.check.dc));
			if (d.perks?.includes("soft-step") && (skill === "lockwork" || skill === "sneak")) chance = Math.min(95, chance + 12);
			const rolled = 1 + Math.floor(Math.random() * 100);
			const ok = rolled <= chance;
			addLog(d, ok ? `${reply.check.skill} holds. (${rolled} vs ${chance})` : `${reply.check.skill} fails. (${rolled} vs ${chance})`);
			if (ok) grantXp(d, 8);
			else {
				effects = reply.failEffects;
				goto = reply.failGoto;
			}
		}
		applyEffects(d, effects);
		if (d.phase !== "play") return;
		if (from === "tobin-intro") d.flags.metTobin = true;
		if (reply.jump) {
			d.dialogue = {
				convo: reply.jump.convo,
				node: reply.jump.node
			};
			return;
		}
		if (goto && d.dialogue) d.dialogue.node = goto;
		else if (reply.end || !goto) d.dialogue = null;
	}),
	endTurn: () => commit(set, (d) => endPlayerTurn(d)),
	brace: () => commit(set, (d) => brace(d)),
	standDown: () => commit(set, (d) => standDown(d)),
	dismantle: (id) => commit(set, (d) => dismantle(d, id)),
	auditSelf: () => commit(set, (d) => openAudit(d, {
		kind: "actor",
		id: "player"
	})),
	setZoom: (dir) => set((s) => {
		const steps = [
			.7,
			.85,
			1.15
		];
		const cur = s.data.zoom ?? 1;
		let i = steps.findIndex((n) => Math.abs(n - cur) < .05);
		if (i < 0) i = 1;
		i = Math.max(0, Math.min(steps.length - 1, i + dir));
		return { data: {
			...s.data,
			zoom: steps[i]
		} };
	}),
	setPref: (key, value) => set((s) => {
		const data = structuredClone(s.data);
		data.flags[key] = value;
		if (!data.ironman && (data.phase === "play" || data.phase === "epilogue")) writeSlot("auto", data);
		return { data };
	}),
	dev: (cmd) => commit(set, (d) => {
		if (cmd === "focus") {
			d.focus = 10 + d.player.attrs.will * 2;
			addLog(d, "Focus topped off. Field tools, not a blessing.");
		} else if (cmd === "heal") {
			d.player.hp = d.player.maxHp;
			addLog(d, "You write your pulse back to baseline.");
		} else if (cmd === "reveal") {
			for (const a of Object.values(d.actors)) {
				if (a.mapId !== d.mapId) continue;
				for (const n of a.nodes) n.revealed = true;
			}
			for (const m of Object.values(d.machines)) {
				if (m.mapId !== d.mapId) continue;
				for (const n of m.nodes) n.revealed = true;
			}
			addLog(d, "Every seam on this floor is legible.");
			return;
		} else if (cmd === "pump") {
			d.player.x = 13;
			d.player.y = 7;
			d.path = [];
			d.panel = "none";
		} else if (cmd === "gate") {
			d.player.x = 14;
			d.player.y = 10;
			d.path = [];
			d.panel = "none";
		} else if (cmd === "crack") {
			const n = d.player.nodes.find((node) => node.effect === "weapon");
			if (n) {
				n.integrity = 15;
				addLog(d, "The tool haft cracks under a test blow.");
			}
		} else if (cmd === "sign") {
			d.flags.pumpFate = d.flags.pumpFate || "mend";
			d.flags.actReady = true;
			d.flags.act1 = true;
			d.flags.checkpointSpoke = true;
			addLog(d, "The Sinks chit is signed by the field tools. The later roads open.");
		} else if (cmd === "rifle") {
			d.inventory.push({
				id: "rifle",
				qty: 1,
				condition: 58
			});
			addLog(d, "A tired steam rifle is in the pack.");
		} else if (cmd === "brawl") {
			d.mapId = "sinks";
			d.player.mapId = "sinks";
			d.player.x = 7;
			d.player.y = 13;
			d.dialogue = null;
			d.panel = "none";
			d.path = [];
			d.flags.checkpointSpoke = true;
			if (d.actors.varr?.alive) startCombat(d, ["varr"]);
			else addLog(d, "Varr is not standing.");
		} else if (cmd === "kael") {
			d.flags.act1 = true;
			d.flags.pumpFate = d.flags.pumpFate || "lockout";
			d.flags.checkpointSpoke = true;
			d.mapId = "quarry";
			d.player.mapId = "quarry";
			d.player.x = 13;
			d.player.y = 6;
			d.dialogue = null;
			d.panel = "none";
			d.path = [];
			if (d.actors.kael) d.actors.kael.mapId = "quarry";
			if (d.actors.kael?.alive) startCombat(d, ["kael"]);
			else addLog(d, "Kael is not standing.");
		}
	}),
	strikeNearest: () => commit(set, (d) => {
		if (!d.combat || !myTurn(d)) return;
		const range = weaponOf(d.player).range ?? 1;
		const foes = Object.values(d.actors).filter((a) => a.alive && a.hostile && a.mapId === d.mapId).sort((a, b) => dist(d.player, a) - dist(d.player, b));
		const hit = foes.find((a) => dist(d.player, a) <= range);
		if (hit) strike(d, d.player, hit);
		else if (foes[0] && !refuseWalk(d)) {
			d.path = pathNear(d, foes[0].x, foes[0].y) ?? [];
			d.intent = {
				type: "strike",
				id: foes[0].id
			};
		} else if (!foes[0]) addLog(d, "Nothing hostile in the room.");
	}, "none"),
	talkNearest: () => commit(set, (d) => {
		if (d.combat || d.dialogue) return;
		const people = Object.values(d.actors).filter((a) => a.alive && a.mapId === d.mapId && !a.companion).sort((a, b) => dist(d.player, a) - dist(d.player, b));
		const near = people.find((a) => dist(d.player, a) <= 1);
		if (near) openTalk(d, near);
		else if (people[0]) {
			d.path = pathNear(d, people[0].x, people[0].y) ?? [];
			d.intent = {
				type: "talk",
				id: people[0].id
			};
		}
	}, "none"),
	auditNearest: () => commit(set, (d) => {
		if (d.dialogue || !myTurn(d)) return;
		const machines = Object.values(d.machines).filter((m) => m.mapId === d.mapId);
		const broken = machines.filter((m) => m.nodes.some((n) => n.integrity < 50 || n.severed));
		const machine = (broken.length ? broken : machines).sort((a, b) => dist(d.player, a) - dist(d.player, b))[0];
		const person = Object.values(d.actors).filter((a) => a.alive && a.mapId === d.mapId && (d.combat ? a.hostile : true)).sort((a, b) => dist(d.player, a) - dist(d.player, b))[0];
		if (machine && dist(d.player, machine) <= 1) openAudit(d, {
			kind: "machine",
			id: machine.id
		});
		else if (person && person.hostile && dist(d.player, person) <= 1) openAudit(d, {
			kind: "actor",
			id: person.id
		});
		else if (d.combat && person) {
			d.path = pathNear(d, person.x, person.y) ?? [];
			d.intent = {
				type: "audit",
				id: person.id,
				kind: "actor"
			};
		} else if (machine) {
			d.path = pathNear(d, machine.x, machine.y) ?? [];
			d.intent = {
				type: "audit",
				id: machine.id,
				kind: "machine"
			};
			if (!d.path.length) addLog(d, "No clear path to a machine.");
		} else if (person && dist(d.player, person) <= 1) openAudit(d, {
			kind: "actor",
			id: person.id
		});
		else if (person) {
			d.path = pathNear(d, person.x, person.y) ?? [];
			d.intent = {
				type: "audit",
				id: person.id,
				kind: "actor"
			};
		} else openAudit(d, {
			kind: "actor",
			id: "player"
		});
	}),
	selectNode: (id) => set((s) => ({ data: {
		...s.data,
		uiNode: id
	} })),
	mend: () => commit(set, (d) => {
		if (!d.audit || !d.uiNode) return;
		mendNode(d, d.audit, d.uiNode);
	}),
	unmend: () => commit(set, (d) => {
		if (!d.audit || !d.uiNode) return;
		unmendNode(d, d.audit, d.uiNode);
	}),
	pinSeam: () => commit(set, (d) => {
		if (!d.disciplines.includes("continuity") || !d.audit || !d.uiNode) return;
		const n = (d.audit.kind === "actor" ? d.audit.id === "player" ? d.player.nodes : d.actors[d.audit.id]?.nodes ?? [] : d.machines[d.audit.id]?.nodes ?? []).find((x) => x.id === d.uiNode);
		if (!n?.revealed || n.decoy) {
			addLog(d, "Nothing true to pin.");
			return;
		}
		if (d.focus < 8) {
			addLog(d, "Not enough focus to pin a seam.");
			return;
		}
		if (d.combat && d.combat.order[d.combat.index] === "player") {
			if (d.player.ap < 2) {
				addLog(d, "Not enough action.");
				return;
			}
			d.player.ap -= 2;
		}
		d.focus -= 8;
		n.pinned = true;
		addLog(d, `You pin ${n.name}. It will not migrate this breath.`);
		play("mend");
	}),
	special: (id) => commit(set, (d) => {
		if (d.audit?.kind === "machine") runSpecial(d, d.audit.id, id);
	}),
	equipOrUse: (id) => commit(set, (d) => useItem(d, id)),
	giveKit: (id, slot, itemId) => commit(set, (d) => equipCompanion(d, id, slot, itemId)),
	spend: (id) => commit(set, (d) => spendSkill(d, id), "none"),
	takePerk: (id) => commit(set, (d) => takePerk(d, id), "none"),
	travel: (mapId) => commit(set, (d) => {
		const region = REGIONS.find((r) => r.id === mapId);
		if (!region || !regionOpen(d, region.need) || region.id === d.mapId) {
			if (region && region.id !== d.mapId && !regionOpen(d, region.need)) addLog(d, "You have not stood there.");
			if (region?.id === d.mapId) d.panel = "none";
			return;
		}
		d.pendingMap = region.id;
		d.panel = "none";
		if (!d.flags.traveled) {
			d.flags.traveled = true;
			arrive(d);
			return;
		}
		if (Math.random() < .38) {
			const roll = Math.random();
			d.dialogue = {
				convo: !d.flags.refugeeMet && roll < .28 ? "enc-refugees" : roll < .55 ? "enc-patrol" : roll < .78 ? "enc-trader" : "enc-auto",
				node: "start"
			};
			addLog(d, "The road does not stay empty.");
		} else arrive(d);
	}),
	ackLevel: () => set((s) => ({ data: {
		...s.data,
		pendingLevel: false
	} }))
}));
function visibleReplies(d) {
	const node = currentNode(d);
	if (!node) return [];
	return node.replies.filter((r) => replyVisible(d, r.requires));
}
function Close({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "min-h-11 min-w-11 border border-brass-dim px-3 text-brass",
		"aria-label": "Close",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
	});
}
function Shell({ title, children, dock = false }) {
	const close = useGame((s) => s.closePanel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: dock ? "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center" : "fixed inset-0 z-30 flex items-end justify-center bg-soot/80 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: `ledger rivet pointer-events-auto w-full max-w-[440px] overflow-y-auto p-4 sm:p-6 ${dock ? "max-h-[72dvh] border-t border-brass-dim" : "max-h-[92dvh]"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl tracking-wide text-brass",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close, { onClick: close })]
			}), children]
		})
	});
}
function nodesOf(d) {
	if (!d.audit) return [];
	if (d.audit.kind === "machine") return d.machines[d.audit.id]?.nodes ?? [];
	if (d.audit.id === "player") return d.player.nodes;
	return d.actors[d.audit.id]?.nodes ?? [];
}
function targetName(d) {
	if (!d.audit) return "";
	if (d.audit.kind === "machine") return d.machines[d.audit.id]?.name ?? "Machine";
	if (d.audit.id === "player") return d.name;
	return d.actors[d.audit.id]?.name ?? "Unknown";
}
function AuditPanel() {
	const d = useGame((s) => s.data);
	const selectNode = useGame((s) => s.selectNode);
	const mend = useGame((s) => s.mend);
	const unmend = useGame((s) => s.unmend);
	const pinSeam = useGame((s) => s.pinSeam);
	const special = useGame((s) => s.special);
	const nodes = nodesOf(d);
	const selected = nodes.find((n) => n.id === d.uiNode) ?? null;
	const machine = d.audit?.kind === "machine" ? d.machines[d.audit.id] : null;
	const c = comp(d);
	const [armed, setArmed] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: `Audit · ${targetName(d)}`,
		dock: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm text-mist",
				children: "What is holding, and what is not. A seam heavier than you can read will burn if you cut it anyway."
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeamRead, {
				nodes,
				n: selected,
				c,
				fighting: Boolean(d.combat)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-brass px-4 font-semibold text-soot",
						onClick: mend,
						children: "Mend"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-rust px-4 text-rust",
						onClick: () => {
							if (!selected) return;
							if (armed !== selected.id) {
								setArmed(selected.id);
								return;
							}
							unmend();
							setArmed(null);
						},
						children: armed === selected?.id ? "Confirm unmend" : selected && selected.density > c ? "Reckless unmend" : "Unmend"
					}),
					d.disciplines.includes("continuity") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-4 text-brass",
						onClick: pinSeam,
						children: "Pin seam"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-2 h-52 border border-brass-dim bg-soot sm:h-60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "absolute inset-0 h-full w-full",
					viewBox: "0 0 100 100",
					"aria-hidden": true,
					children: nodes.map((n) => n.dependsOn.map((dep) => {
						const parent = nodes.find((p) => p.id === dep);
						if (!parent) return null;
						const know = (node) => {
							const c = confidenceOf(node);
							return c === "understood" || c === "confident";
						};
						const broken = (node) => node.revealed && (!nodeLive(nodes, node) || node.severed);
						const cut = broken(n) || broken(parent);
						const flow = n.effect === "flow" && !cut;
						if (!know(n) && !know(parent) && !broken(n) && !broken(parent)) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: parent.gx,
							y1: parent.gy,
							x2: n.gx,
							y2: n.gy,
							className: flow ? "flow-line" : void 0,
							stroke: cut ? "#c45c26" : "#d4b483",
							strokeWidth: cut ? .7 : .85,
							strokeDasharray: cut ? "2 1.6" : flow ? "1.4 1.2" : void 0
						}, `${n.id}-${dep}`);
					}))
				}), nodes.map((n) => {
					const hidden = !n.revealed;
					const dead = n.revealed && (n.severed || !nodeLive(nodes, n));
					const mark = !n.revealed ? "?" : n.severed ? "×" : !nodeLive(nodes, n) ? "—" : n.integrity < 70 ? "○" : "●";
					const tone = dead ? "border-rust text-rust seam-fail" : n.decoy && n.revealed ? "border-mist text-mist" : n.tier === "stress" ? "border-rust text-rust" : "border-brass text-brass";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => selectNode(n.id),
						"aria-pressed": d.uiNode === n.id,
						className: `absolute min-h-11 max-w-36 -translate-x-1/2 -translate-y-1/2 border bg-iron px-2 py-1 text-left text-xs ${tone} ${d.uiNode === n.id ? "ring-2 ring-brass" : ""}`,
						style: {
							left: `${n.gx}%`,
							top: `${n.gy}%`
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "mr-1",
								children: mark
							}), hidden ? "Illegible" : n.name]
						}), !hidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-mist",
							children: seamState(nodes, n)
						})]
					}, n.id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-[10px] uppercase tracking-[0.16em] text-mist",
				children: "● holding · ○ strained · — dark · × severed · ? unread"
			}),
			machine && machine.specials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: machine.specials.map((sp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-h-11 w-full border border-brass-dim px-3 py-2 text-left",
					onClick: () => special(sp.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-brass",
						children: sp.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-mist",
						children: sp.text
					})]
				}) }, sp.id))
			})
		]
	});
}
function confidenceWord(n) {
	const c = confidenceOf(n);
	if (c === "confident") return "Confident";
	if (c === "understood") return "Understood";
	if (c === "observed") return "Observed";
	return "Unread";
}
function SeamRead({ nodes, n, c, fighting }) {
	if (!n.revealed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-3 text-sm",
		children: "Unread. The relationship is still scrambled. Chalk, or another reading, can name it. A cut cannot."
	});
	const conf = confidenceOf(n);
	const parents = n.dependsOn.map((id) => {
		const parent = nodes.find((p) => p.id === id);
		if (!parent) return "a missing parent";
		if (!parent.revealed && conf !== "confident") return "an unread parent";
		return parent.severed || !nodeLive(nodes, parent) ? `${parent.name} (not holding)` : parent.name;
	});
	const kids = nodes.filter((o) => o.dependsOn.includes(n.id));
	const children = conf === "observed" ? "Not settled." : kids.length ? kids.map((k) => k.revealed || conf === "confident" ? k.name : "an unread bond").join(", ") : "Nothing in this graph hangs on it.";
	conf === "observed" || n.effect === "none" || n.effect === "flow" && !kids.length || n.effect === "flow" || n.effect === "weapon" || n.effect === "motive" || n.effect === "life" || n.effect === "core" || `${n.effect}`;
	const doubt = conf === "confident" ? "You can hold a cut." : conf === "understood" ? "You know the consequence. The angle can still slip." : "Partial. Do not trust a cut yet.";
	const reach = n.density <= c ? "Within reach." : "Heavier than you. A reckless cut will burn.";
	const state = n.decoy ? "This looks like the failure. It is a costume. Cutting it bites, and nothing downstream moves." : n.severed ? "Cut. What hung on this is already failing." : !nodeLive(nodes, n) ? "This is the failure. It is dark, or a parent already shut it off." : n.integrity < 70 ? "Holding, and strained. It can still be the thing that breaks." : "Holding.";
	const rows = [
		["This", `${n.name}. ${seamState(nodes, n)}.`],
		["Parent", parents.length ? parents.join(", ") : "No parent in this graph."],
		["Holds up", children],
		["If you cut", forecast(nodes, n)],
		["Reach", `${confidenceWord(n)}. ${doubt} ${reach}`]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 border border-brass-dim bg-soot px-3 py-2 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `font-semibold ${n.decoy ? "text-mist" : n.severed || !nodeLive(nodes, n) ? "text-rust" : "text-brass"}`,
				children: state
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2",
				children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[6.5rem_1fr] gap-2 border-b border-brass-dim/40 py-1 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-[0.16em] text-mist",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v })]
				}, k))
			}),
			n.integrity >= 40 && !nodeLive(nodes, n) && !n.severed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-mist",
				children: "Whole, and still dark. A dead parent already shut this off."
			}),
			fighting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-mist",
				children: "Unmend spends 4 action. Mend spends 3."
			}) : null
		]
	});
}
function Meter({ label, n }) {
	const width = Math.min(100, n * 16);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex items-center gap-2 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-14 text-mist",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "h-1.5 flex-1 bg-soot",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block h-1.5 bg-brass",
				style: { width: `${width}%` }
			})
		})]
	});
}
function CharSheet() {
	const d = useGame((s) => s.data);
	const spend = useGame((s) => s.spend);
	const takePerk = useGame((s) => s.takePerk);
	const auditSelf = useGame((s) => s.auditSelf);
	const c = comp(d);
	const next = xpForLevel(d.level + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: d.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-mist",
				children: [
					"Level ",
					d.level,
					" · ",
					d.xp,
					"/",
					next,
					" xp · Comprehension ",
					c,
					" · Focus ",
					d.focus,
					" · Skill points ",
					d.skillPoints,
					" · Ways ",
					d.perkPoints ?? 0
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed",
				children: becoming(d)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm",
				children: [
					"HP ",
					d.player.hp,
					"/",
					d.player.maxHp,
					" · Scrip ",
					d.scrip
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "What the hands remember"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-relaxed",
				children: habitLine(d)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Practice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mist",
				children: "What the hands repeat. Not a class, and not a verdict."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2",
				children: PRACTICE_VERBS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-3 border-b border-brass-dim/40 py-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "uppercase tracking-[0.14em] text-mist",
						children: id
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-brass",
						children: practiceBand(d.verbs?.[id] ?? 0)
					})]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Observed"
			}),
			tendencies(d).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm tracking-wide text-brass",
				children: tendencies(d).join(" · ")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mist",
				children: "Structure opens when you audit. Other lenses stay dark until a graph asks for them."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-3",
				children: lensReads(d).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-wider text-brass",
						children: LENS_NAME[row.id]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "See",
						n: row.perception
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Precise",
						n: row.precision
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Reach",
						n: row.reach
					})
				] }, row.id))
			}),
			lensReads(d).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-mist",
				children: "See, precision, and reach come from what you repeat. A severed bond still cannot be invented back."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-3 min-h-11 border border-brass px-3 text-brass",
				onClick: auditSelf,
				children: "Audit your own graph"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Attributes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: Object.entries(d.player.attrs).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border border-brass-dim px-2 py-2 text-sm capitalize",
					children: [
						k,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "float-right text-brass",
							children: v
						})
					]
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Disciplines"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm",
				children: d.disciplines.map((id) => DOMAIN_NAME[id]).join(" · ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Skills"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: SKILL_LIST.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 border border-brass-dim/60 px-2 py-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-28",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-brass",
							children: [d.player.skills[s.id], "%"]
						}),
						d.player.tags.includes(s.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-mist",
							children: "tagged"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ml-auto min-h-11 min-w-11 border border-brass text-brass",
							onClick: () => spend(s.id),
							disabled: d.skillPoints <= 0 || d.player.skills[s.id] >= 95,
							"aria-label": `Improve ${s.name}`,
							children: "+"
						})
					]
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "Ways of working"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mist",
				children: "A way changes what the hands can do. It is not a larger knife."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-2",
				children: PERKS.map((perk) => {
					const held = d.perks?.includes(perk.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border border-brass-dim/60 px-2 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-brass",
								children: perk.name
							}), held ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs uppercase tracking-wider text-mist",
								children: "held"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-2 text-brass",
								disabled: (d.perkPoints ?? 0) <= 0,
								onClick: () => takePerk(perk.id),
								children: "Take"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-mist",
							children: perk.blurb
						})]
					}, perk.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "With you"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mist",
				children: "What they are doing. Not a grade."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithYou, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-brass",
				children: "What is filed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mist",
				children: "Facts the city can ask. Not a grade of you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-2 text-sm",
				children: factionFacts(d).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-b border-brass-dim/40 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-brass",
						children: FACTION_NAME[row.id]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-mist",
						children: row.line
					})]
				}, row.id))
			})
		]
	});
}
function WithYou() {
	const d = useGame((s) => s.data);
	const giveKit = useGame((s) => s.giveKit);
	const mates = Object.values(d.actors).filter((a) => a.companion && a.alive);
	if (!mates.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-mist",
		children: "Nobody is walking with you."
	});
	const pack = (kind) => d.inventory.filter((row) => {
		const def = ITEMS[row.id];
		if (!def || def.kind !== kind || row.qty < 1) return false;
		if (kind === "weapon" && d.equipped.weapon === row.id) return false;
		if (kind === "armor" && d.equipped.armor === row.id) return false;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-3",
		children: mates.map((a) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "border border-brass-dim p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display text-brass",
						children: [
							a.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs uppercase tracking-wider text-mist",
								children: a.habit ?? "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-mist",
						children: [
							ITEMS[a.kit?.weapon ?? a.weapon]?.name ?? "Hands",
							" · ",
							a.kit?.armor ? ITEMS[a.kit.armor]?.name : "No armor",
							" · ",
							a.kit?.accessory ? ITEMS[a.kit.accessory]?.name : "No accessory"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-mist",
						children: companyLines(d, a).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							pack("weapon").map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-2 text-brass",
								onClick: () => giveKit(a.id, "weapon", row.id),
								children: ["Give ", ITEMS[row.id]?.name]
							}, `w-${row.id}`)),
							pack("armor").map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-2 text-brass",
								onClick: () => giveKit(a.id, "armor", row.id),
								children: ["Give ", ITEMS[row.id]?.name]
							}, `a-${row.id}`)),
							pack("accessory").map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-2 text-brass",
								onClick: () => giveKit(a.id, "accessory", row.id),
								children: ["Give ", ITEMS[row.id]?.name]
							}, `c-${row.id}`)),
							a.kit?.weapon && a.kit.weapon !== a.weapon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass-dim px-2",
								onClick: () => giveKit(a.id, "weapon", null),
								children: "Take the weapon"
							}),
							a.kit?.armor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass-dim px-2",
								onClick: () => giveKit(a.id, "armor", null),
								children: "Take the armor"
							}),
							a.kit?.accessory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass-dim px-2",
								onClick: () => giveKit(a.id, "accessory", null),
								children: "Take the accessory"
							})
						]
					})
				]
			}, a.id);
		})
	});
}
function districtSentence(id, row) {
	const water = row.water >= 70 ? "Water is seated." : row.water >= 25 ? "Water is moving, and it is not clean." : row.water > 0 ? "A little water is getting through." : "Water is not moving.";
	const heat = row.heat >= 70 ? "Heat reaches more than one room." : row.heat >= 25 ? "Heat is partial." : "Heat is out.";
	const food = row.food >= 70 ? "Food has a parent." : row.food >= 25 ? "Food is a ration, not a harvest." : "Food is not arriving.";
	const road = row.transport >= 60 ? "The road is carrying." : row.transport >= 25 ? "The road is hesitant." : "The road is not carrying.";
	const danger = row.danger >= 45 ? "The room is strained." : "The room is quiet.";
	if (id === "sinks") return `${water} ${road} ${danger}`;
	if (id === "haven") return `${water} ${food} ${row.commerce >= 50 ? "The stall is open." : "The stall is dark."} ${danger}`;
	if (id === "quarry") return `${road} ${row.power >= 40 ? "The colossus is still a parent." : "The colossus is not helping."} ${danger}`;
	if (id === "rust") return `${heat} ${row.water >= 40 ? "Quench is live." : "Quench is dry."} ${food}`;
	if (id === "citadel" || id === "tundra") return `${row.power >= 50 ? "Power is leaving the siphon." : "The siphon is not sending."} ${road}`;
	if (id === "road") return `${row.power >= 40 ? "The lamps have a parent." : "The lamps are dark."} ${road}`;
	if (id === "kiln") return `${water} ${heat} ${row.commerce >= 50 ? "The board can buy." : "The board is shut."} ${danger}`;
	if (id === "switch") return `${road} ${row.commerce >= 50 ? "The shed can sell." : "The shed is not a shop."} ${danger}`;
	if (id === "pane") return `${heat} ${row.commerce >= 50 ? "The bench can sell." : "The bench is shut."} ${danger}`;
	return `${water} ${heat} ${food} ${road}`;
}
function JournalPanel() {
	const d = useGame((s) => s.data);
	const deeds = d.deeds ?? [];
	const readings = d.journal.filter((j) => j.id.startsWith("read:"));
	const work = d.journal.filter((j) => !j.id.startsWith("read:"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Ledger",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-brass",
				children: "What happened"
			}),
			deeds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mist",
				children: "No room has been filed yet. The ledger will say what changed. It will not grade you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-3",
				children: deeds.map((deed) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeedCard, { deed }, deed.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 font-display text-brass",
				children: "Notes"
			}),
			work.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mist",
				children: "Nothing else is waiting."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-3",
				children: work.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border border-brass-dim p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-brass",
							children: j.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs uppercase tracking-wider text-mist",
							children: j.status === "done" ? "noted" : j.status === "open" ? "still moving" : j.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed",
						children: j.text
					})]
				}, j.id))
			}),
			d.world && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-5 font-display text-brass",
					children: "What the districts are holding"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mist",
					children: "From the rooms you have already walked."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: Object.entries(d.world.districts).map(([id, row]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border border-brass-dim/60 px-2 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-brass capitalize",
							children: id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-mist",
							children: districtSentence(id, row)
						})]
					}, id))
				})
			] }),
			readings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-5 font-display text-brass",
					children: "Readings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mist",
					children: "What you have learned about a graph. Not a finished job."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-3",
					children: readings.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border border-brass-dim p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-brass",
							children: j.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-mist",
							children: j.text
						})]
					}, j.id))
				})
			] })
		]
	});
}
function fateLine(fate) {
	if (fate === "dead") return "died";
	if (fate === "escaped") return "left the engagement";
	if (fate === "broken-open") return "came apart, and stayed";
	if (fate === "stood-down") return "stood down";
	return "still armed";
}
function baselineLine(mark) {
	if (mark === "lost") return "Lost";
	if (mark === "altered") return "Altered";
	return "Preserved";
}
function DeedCard({ deed }) {
	const people = deed.participants ?? [];
	const changes = deed.changes ?? [];
	const used = Object.entries(deed.used ?? {}).filter(([, n]) => (n ?? 0) > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "sheet p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] uppercase tracking-[0.22em] text-mist",
				children: deed.place
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg text-brass",
				children: deed.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[10px] uppercase tracking-[0.18em] text-mist",
				children: "What happened"
			}),
			people.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-relaxed",
				children: deed.text
			}),
			people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm",
				children: [
					person.name,
					" ",
					fateLine(person.fate),
					"."
				]
			}, person.id)),
			changes.map((change, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-mist",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "uppercase tracking-[0.14em] text-brass",
						children: change.verb
					}),
					". ",
					change.edge,
					". ",
					change.immediate,
					".",
					change.downstream ? ` ${change.downstream}` : ""
				]
			}, `${change.nodeId}-${change.verb}-${index}`)),
			(deed.world ?? []).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm",
				children: line
			}, line)),
			deed.baseline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[10px] uppercase tracking-[0.18em] text-mist",
				children: "Baseline"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `stamp ${deed.baseline === "lost" ? "text-rust" : deed.baseline === "altered" ? "text-mist" : "text-brass"}`,
				children: baselineLine(deed.baseline)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[10px] uppercase tracking-[0.18em] text-mist",
				children: "Your hands"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-brass",
				children: deed.approach || "No habit settled."
			}),
			used.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-mist",
				children: [
					"In this room: ",
					used.map(([id]) => id).join(", "),
					"."
				]
			})
		]
	});
}
function InventoryPanel() {
	const d = useGame((s) => s.data);
	const use = useGame((s) => s.equipOrUse);
	const dismantle = useGame((s) => s.dismantle);
	const worn = carryWeight(d);
	const cap = carryMax(d);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Pack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-3 text-sm text-mist",
			children: [
				ITEMS[d.equipped.weapon]?.name ?? "Hands",
				" · ",
				d.equipped.armor ? ITEMS[d.equipped.armor]?.name : "no coat",
				" · ",
				d.scrip,
				" scrip ·",
				" ",
				worn,
				"/",
				cap,
				" weight",
				worn > cap ? " · overburdened" : ""
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-2",
			children: d.inventory.map((row) => {
				const def = ITEMS[row.id];
				if (!def) return null;
				const condition = row.condition ?? 100;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border border-brass-dim p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-brass",
								children: [def.name, row.qty > 1 ? ` ×${row.qty}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs uppercase tracking-wider text-mist",
								children: [
									def.kind,
									" · ",
									def.weight ?? 1,
									" wt · ",
									def.value ?? 0,
									" scrip",
									def.kind === "weapon" || def.kind === "armor" ? ` · condition ${condition}` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-mist",
								children: def.desc
							}),
							def.parts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-brass",
								children: ["Parts: ", def.parts.join(" · ")]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 flex-col gap-1",
							children: [def.kind !== "quest" && def.kind !== "part" && def.kind !== "junk" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-3 text-sm text-brass",
								onClick: () => use(row.id),
								children: def.kind === "consumable" ? "Use" : "Equip"
							}), def.yield && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-rust px-3 text-sm text-rust",
								onClick: () => dismantle(row.id),
								children: "Dismantle"
							})]
						})]
					})
				}, row.id);
			})
		})]
	});
}
var PLATES = {
	sinks: "/game/plates/sinks.jpg?v=5",
	haven: "/game/plates/haven.jpg?v=5",
	road: "/game/plates/road.jpg?v=5",
	kiln: "/game/plates/kiln.jpg?v=5",
	switch: "/game/plates/switch.jpg?v=5",
	pane: "/game/plates/pane.jpg?v=5",
	quarry: "/game/plates/canyon.jpg?v=5",
	rust: "/game/plates/streets.jpg?v=5",
	tundra: "/game/plates/tundra.jpg?v=5",
	citadel: "/game/plates/citadel.jpg?v=5",
	spire: "/game/plates/spire.jpg?v=5"
};
function MapPanel() {
	const d = useGame((s) => s.data);
	const travel = useGame((s) => s.travel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Stack roads",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-sm text-mist",
				children: [
					"You are in ",
					MAPS[d.mapId]?.name,
					". The ledger can jump a throat you already know. The campaign is the walk between mouths."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 border border-brass-dim px-3 py-2 text-sm leading-relaxed",
				children: districtYield(d)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: REGIONS.map((r) => {
					const open = regionOpen(d, r.need);
					const here = r.id === d.mapId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !open || here,
						onClick: () => travel(r.id),
						className: "flex min-h-11 w-full gap-3 border border-brass-dim px-2 py-2 text-left disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: PLATES[r.id] ?? PLATES.sinks,
							alt: "",
							className: "h-16 w-24 shrink-0 object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block font-display text-brass",
								children: [
									r.name,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-mist",
										children: r.act
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm text-mist",
								children: here ? "You are here." : open ? r.blurb : r.need?.startsWith("seen:") ? "You have not stood there. The mouth is on the road." : "Sealed. The chit is not signed."
							})]
						})]
					}) }, r.id);
				})
			})
		]
	});
}
function MenuPanel() {
	const d = useGame((s) => s.data);
	const save = useGame((s) => s.save);
	const load = useGame((s) => s.load);
	const list = useGame((s) => s.listSaves);
	const quit = useGame((s) => s.quit);
	const open = useGame((s) => s.openPanel);
	const setPref = useGame((s) => s.setPref);
	const slots = list();
	const text = d.flags.uiText === "lg" ? "large" : d.flags.uiText === "sm" ? "small" : "field";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Field notes",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-3 text-brass",
						onClick: () => open("help"),
						children: "How to read"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-3 text-brass",
						onClick: () => open("char"),
						children: "Character"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-3 text-brass",
						onClick: () => open("journal"),
						children: "Ledger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 border border-brass-dim px-3 text-mist",
						onClick: () => setPref("uiText", d.flags.uiText === "md" || !d.flags.uiText ? "lg" : d.flags.uiText === "lg" ? "sm" : "md"),
						children: ["Text ", text]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 border border-brass-dim px-3 text-mist",
						onClick: () => setPref("reduceMotion", !d.flags.reduceMotion),
						children: ["Motion ", d.flags.reduceMotion ? "reduced" : "full"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 border border-brass-dim px-3 text-mist",
						onClick: () => setPref("strain", "story"),
						children: ["Strain ", d.flags.strain === "story" ? "story · on" : "story"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 border border-brass-dim px-3 text-mist",
						onClick: () => setPref("strain", "field"),
						children: ["Strain ", !d.flags.strain || d.flags.strain === "field" ? "field · on" : "field"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 border border-brass-dim px-3 text-mist",
						onClick: () => setPref("strain", "hard"),
						children: ["Strain ", d.flags.strain === "hard" ? "hard · on" : "hard"]
					})
				]
			}),
			!d.ironman && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-brass px-3 font-semibold text-soot",
						onClick: () => save("slot1"),
						children: "Save slot 1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-brass px-3 font-semibold text-soot",
						onClick: () => save("slot2"),
						children: "Save slot 2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-brass px-3 font-semibold text-soot",
						onClick: () => save("slot3"),
						children: "Save slot 3"
					})
				]
			}),
			d.ironman && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-sm text-rust",
				children: "Ironman. The auto-ledger is the only one, and death closes it."
			}),
			d.combat && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-3 text-sm text-brass",
				children: [
					"Round ",
					d.combat.round,
					", ",
					d.player.ap,
					" action left. Filing now keeps the graph, the cuts, and where everyone stands."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: slots.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-h-11 w-full border border-brass-dim px-3 text-left",
					onClick: () => load(s.id),
					disabled: d.ironman && s.id !== "auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-brass",
							children: s.id
						}),
						" · ",
						s.label
					]
				}) }, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-4 min-h-11 border border-rust px-3 text-rust",
				onClick: quit,
				children: "Close the ledger"
			})
		]
	});
}
function HelpPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		title: "How to read a city",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 text-sm leading-relaxed",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Tap the ground to walk. Tap a person to speak. Tap a machine to read it. Near and Far change how much of the district you can see. Arrow keys still step, if you have them." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "On the floor, a machine wears a mark. A hollow square is unread. A brass dot is live. A triangle is stressed. A cross is severed. A pale square is pinned. A dash is spent. The shape is the fact. The color is only a second telling." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A machine can be whole and still dark, because its parent is somewhere else. The parent is not always in the same room. Change something, then walk back. The room will have changed without a speech about it." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Brass diamonds on the floor are mouths. Step onto one and the district continues on foot. The ledger can still jump a throat you already know. Coming back is not the same room. Anything alive out here is not assigned to you." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Audit shows relationships, not hit points. A parent that dies takes function from its children even when their integrity stays whole. Observed means you have a name. Understood means you know the consequence. Confident means the cut is as safe as a cut gets." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "text-brass",
					children: "Mend"
				}), " restores a thing toward a known baseline and spends focus. A thin baseline can come back wrong. Bandages and the bench binding are medicine. The bench can also reseat a worn weapon."] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "text-rust",
					children: "Unmend"
				}), " asks you to confirm, then cuts one relationship. The ledger names the cascade. A failed cut still spends focus and action, and a bad miss can ring the lens."] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Brace spends your action to blunt the next hit. Junk in the pack can be dismantled into scrap. You can file the ledger in the middle of a fight. The engagement comes back as you left it." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fights and machines can be the same graph: a cable, a feed, a parent you have not named yet. One cut does not peel a layered suit. When every mounted weapon in the engagement is dark, you can ask them to stand down." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "If a system's density is higher than your comprehension, the attempt burns you. Leveling and the Audit skill raise what you can hold." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "In a fight you have action points. End the turn when you are finished looking. The line under a name is what they mean to do next if you leave the board alone. Cut the parent, step out of reach, or break the leg they were counting on, and the line goes dull." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "What you repeat becomes a habit, not a class. Four times at a verb and the hands get better at that kind of work, and the habits mix. Self shows only the lenses you have actually used. See, precision, and reach change what you can perceive and how far a mend travels. They are not a damage ladder." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A level also leaves a way of working on the character sheet. It changes how focus, sleep, locks, a kiln price, or a first audit behaves. It does not add a percent to a knife. Strain, in the field notes, changes how hard the city hits you. It does not change what is true." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Districts drink from parents that are not local wells. People will say which parent they still have. They will not grade you." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The ledger will not grade you. When an engagement ends it files who stood down, which relationship changed, and whether that baseline is still recoverable. Leaving a fight unfinished writes nothing. Readings are what you learned, separate from the jobs. People who were there can be asked. They remember the fact, not a score." })
			]
		})
	});
}
function ToolsPanel() {
	const dev = useGame((s) => s.dev);
	const row = (cmd, label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "min-h-11 w-full border border-brass-dim px-3 text-left text-sm",
		onClick: () => dev(cmd),
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Field tools",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-mist",
			children: "Maintainer overrides. They write the ledger. They are not a story."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [
				row("focus", "Fill cognitive focus"),
				row("heal", "Restore your pulse"),
				row("reveal", "Make every seam on this floor legible"),
				row("crack", "Crack your tool haft"),
				row("pump", "Stand beside the district pump"),
				row("gate", "Stand at the checkpoint door"),
				row("rifle", "Put a tired steam rifle in the pack"),
				row("sign", "Sign the Sinks chit and open the roads"),
				row("brawl", "Call Varr alone on the south plate"),
				row("kael", "Open the quarry beside Kael")
			]
		})]
	});
}
function LevelModal() {
	const d = useGame((s) => s.data);
	const ack = useGame((s) => s.ackLevel);
	if (!d.pendingLevel) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-center justify-center bg-soot/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ledger w-full max-w-md p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-brass",
					children: "Comprehension deepens"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm",
					children: [
						"Level ",
						d.level,
						". You can hold a denser diagram. Skill points are waiting on your character sheet. A way of working is waiting there too. Current comprehension ",
						comprehension(d.player.attrs, d.player.skills.audit, d.level),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-4 min-h-11 bg-brass px-4 font-semibold text-soot",
					onClick: ack,
					children: "File it"
				})
			]
		})
	});
}
function DialogueBox() {
	const d = useGame((s) => s.data);
	const choose = useGame((s) => s.choose);
	if (!d.dialogue) return null;
	const replies = visibleReplies(d);
	if (!(replies && d.dialogue)) return null;
	const convo = d.dialogue;
	const speakerId = speakerOf(d, convo.convo, convo.node);
	const remembered = convo.convo.startsWith("varr-memory") || convo.convo.startsWith("checkpoint-") || convo.node.startsWith("checkpoint");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-x-2 bottom-1 z-40 max-h-[46%] overflow-y-auto overscroll-contain",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ledger rivet mx-auto flex max-w-[440px] gap-2 p-2",
			children: [speakerId.portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: speakerId.portrait,
				alt: "",
				className: "h-16 w-14 shrink-0 border border-brass object-cover object-top"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-16 w-14 shrink-0 items-center justify-center border border-brass-dim",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5 text-brass" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-brass",
						children: speakerId.name
					}),
					remembered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] uppercase tracking-[0.18em] text-brass",
						children: "Filed. The room still holds it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13px] leading-snug",
						children: speakerId.text
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1.5",
						children: replies.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-h-10 w-full border border-brass-dim px-3 py-1.5 text-left text-sm hover:border-brass",
							onClick: () => choose(i),
							children: [r.text, r.check && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block text-xs text-brass",
								children: [
									r.check.skill,
									" ",
									d.player.skills[r.check.skill],
									"% · chance ",
									checkChance(d.player.skills[r.check.skill], r.check.dc)
								]
							})]
						}) }, i))
					})
				]
			})]
		})
	});
}
function speakerOf(d, convo, nodeId) {
	const node = CONVOS[convo]?.nodes[nodeId];
	const speaker = node?.speaker ?? "narrator";
	const actor = speaker === "player" ? d.player : d.actors[speaker];
	return {
		name: speaker === "narrator" ? "Ledger" : actor?.name ?? speaker,
		portrait: speaker === "narrator" ? null : actor?.portrait ?? null,
		text: (node?.text ?? "").replaceAll("{name}", d.name)
	};
}
var TW = 78;
var TH = 39;
var cache = /* @__PURE__ */ new Map();
var keyed = /* @__PURE__ */ new Map();
function sprite(src) {
	let image = cache.get(src);
	if (!image) {
		image = new Image();
		image.src = src;
		cache.set(src, image);
	}
	return image;
}
function keyedSprite(src) {
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
		const already = clear > p.length / 4 * .02;
		for (let i = 0; i < p.length; i += 4) {
			const r = p[i];
			const g = p[i + 1];
			const b = p[i + 2];
			if (already) {
				if (r > 180 && b > 150 && g < 100 && Math.abs(r - b) < 70) p[i + 3] = 0;
				continue;
			}
			const magenta = r > 200 && b > 200 && g < 70 && Math.abs(r - b) < 45;
			const jpeg = r > 100 && g < 70 && b > 48 && b < 190 && r - g > 85 && b - g > 20 && r - b > 15 && r - b < 150;
			const fringe = !magenta && !jpeg && (r > 165 && b > 145 && g < 95 && Math.abs(r - b) < 55 && r + b > g * 4 || r > 150 && g < 80 && b > 45 && b < 190 && r - g > 90 && r - b > 15 && r - b < 130);
			if (magenta || jpeg) p[i + 3] = 0;
			else if (fringe) p[i + 3] = Math.min(p[i + 3], 70);
		}
		c.putImageData(img, 0, 0);
		keyed.set(src, plate);
	}
	return plate;
}
var deck = {
	w: 20,
	h: 14
};
function floorKey(theme) {
	if (theme === "quarry") return "canyon";
	if (theme === "citadel" || theme === "spire") return "tundra";
	if (theme === "haven") return "haven";
	if (theme === "rust" || theme === "road") return "rust";
	return "sinks";
}
function vistaKey(theme) {
	return floorKey(theme);
}
var usingPlate = false;
var plateFeet = {
	sx: 0,
	sy: 0
};
function plateFor(mapId) {
	const v = "?v=5";
	if (mapId === "quarry") return `/game/plates/canyon.jpg${v}`;
	if (mapId === "tundra") return `/game/plates/tundra.jpg${v}`;
	if (mapId === "citadel") return `/game/plates/citadel.jpg${v}`;
	if (mapId === "spire") return `/game/plates/spire.jpg${v}`;
	if (mapId === "pane") return `/game/plates/pane.jpg${v}`;
	if (mapId === "haven") return `/game/plates/haven.jpg${v}`;
	if (mapId === "kiln") return `/game/plates/kiln.jpg${v}`;
	if (mapId === "rust") return `/game/plates/streets.jpg${v}`;
	if (mapId === "road") return `/game/plates/road.jpg${v}`;
	if (mapId === "switch") return `/game/plates/switch.jpg${v}`;
	return `/game/plates/sinks.jpg${v}`;
}
function plateShot(mapId) {
	if (mapId === "quarry") return {
		zoom: 1.42,
		fx: .52,
		fy: .58
	};
	if (mapId === "tundra") return {
		zoom: 1.48,
		fx: .42,
		fy: .5
	};
	if (mapId === "citadel") return {
		zoom: 1.22,
		fx: .48,
		fy: .68
	};
	if (mapId === "spire") return {
		zoom: 1.35,
		fx: .5,
		fy: .46
	};
	if (mapId === "pane") return {
		zoom: 1.2,
		fx: .5,
		fy: .68
	};
	if (mapId === "haven") return {
		zoom: 1.28,
		fx: .46,
		fy: .6
	};
	if (mapId === "kiln") return {
		zoom: 1.18,
		fx: .5,
		fy: .66
	};
	if (mapId === "rust") return {
		zoom: 1.18,
		fx: .5,
		fy: .62
	};
	if (mapId === "road") return {
		zoom: 1.28,
		fx: .5,
		fy: .52
	};
	if (mapId === "switch") return {
		zoom: 1.16,
		fx: .46,
		fy: .52
	};
	return {
		zoom: 1.22,
		fx: .5,
		fy: .72
	};
}
function projectTile(w, h, px, py, x, y, zoom, plate, mapId) {
	const dx = x - px;
	const dy = y - py;
	if (plate) {
		const z = Math.max(.85, zoom);
		const stepX = Math.min(72, w * .16) * z;
		const stepY = Math.min(34, h * .072) * z;
		return {
			sx: plateFeet.sx + (dx - dy) * stepX,
			sy: plateFeet.sy + (dx + dy) * stepY
		};
	}
	return {
		sx: w / 2 + (dx - dy) * (TW / 2) * zoom,
		sy: h * .44 + (dx + dy) * (TH / 2) * zoom
	};
}
function drawChevron(ctx, sx, sy, shut) {
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
function drawVista(ctx, theme, w, h, px, py, mapId) {
	const plate = plateFor(mapId);
	const image = sprite(plate ?? `/game/backdrops/${vistaKey(theme)}.jpg`);
	usingPlate = Boolean(plate && image.complete && image.naturalWidth > 0);
	if (!image.complete || image.naturalWidth === 0) {
		usingPlate = false;
		return;
	}
	if (usingPlate) {
		const shot = plateShot(mapId);
		const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight) * shot.zoom;
		const dw = image.naturalWidth * scale;
		const dh = image.naturalHeight * scale;
		let x = w * .5 - dw * shot.fx;
		let y = h * .6 - dh * shot.fy;
		if (dw >= w) x = Math.min(0, Math.max(w - dw, x));
		if (dh >= h) y = Math.min(0, Math.max(h - dh, y));
		plateFeet = {
			sx: x + dw * shot.fx,
			sy: y + dh * shot.fy
		};
		ctx.drawImage(image, x, y, dw, dh);
		const shade = ctx.createLinearGradient(0, 0, 0, h);
		shade.addColorStop(0, "rgba(5,4,3,0.02)");
		shade.addColorStop(.16, "rgba(5,4,3,0)");
		shade.addColorStop(.86, "rgba(5,4,3,0)");
		shade.addColorStop(1, "rgba(5,4,3,0.16)");
		ctx.fillStyle = shade;
		ctx.fillRect(0, 0, w, h);
		if (mapId === "spire") ctx.fillStyle = "rgba(4, 12, 22, 0.28)";
		else if (mapId === "haven") ctx.fillStyle = "rgba(20, 48, 28, 0.08)";
		else ctx.fillStyle = "rgba(0,0,0,0)";
		ctx.fillRect(0, 0, w, h);
		return;
	}
	const scale = w * 1.14 / image.naturalWidth;
	const dw = image.naturalWidth * scale;
	const dh = image.naturalHeight * scale;
	const x = (w - dw) / 2 - (px - deck.w / 2) * 2.2;
	const y = h * .04 - (py - deck.h / 2) * 1.4;
	ctx.drawImage(image, x, y, dw, dh);
	const shade = ctx.createLinearGradient(0, 0, 0, h);
	shade.addColorStop(0, "rgba(5,4,3,0.02)");
	shade.addColorStop(.45, "rgba(5,4,3,0.08)");
	shade.addColorStop(1, "rgba(5,4,3,0.42)");
	ctx.fillStyle = shade;
	ctx.fillRect(0, 0, w, h);
	if (theme === "spire") {
		ctx.fillStyle = "rgba(6,14,22,0.4)";
		ctx.fillRect(0, 0, w, h);
	}
}
function paintFloor(ctx, sx, sy, x, y, theme) {
	const image = sprite(`/game/floors/${floorKey(theme)}.jpg`);
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
	const rim = ctx.createRadialGradient(sx, sy - 2, 8, sx, sy, TH * .78);
	rim.addColorStop(0, "rgba(0,0,0,0)");
	rim.addColorStop(1, "rgba(10,7,5,0.3)");
	ctx.fillStyle = rim;
	ctx.fillRect(sx - TW, sy - TH, 156, 78);
	ctx.restore();
	return true;
}
function hash(x, y) {
	return Math.abs(x * 73856093 ^ y * 19349663) % 997;
}
function diamond(ctx, sx, sy) {
	ctx.beginPath();
	ctx.moveTo(sx, sy - TH / 2);
	ctx.lineTo(sx + TW / 2, sy);
	ctx.lineTo(sx, sy + TH / 2);
	ctx.lineTo(sx - TW / 2, sy);
	ctx.closePath();
}
function isPlate(ch) {
	return ch === "." || ch === ",";
}
function drawTile(ctx, sx, sy, ch, x, y, now, theme, vacant, fade = false, shut = false, zoom = 1, rimR = false, rimD = false) {
	if (ch === "#") return;
	ctx.save();
	ctx.translate(sx, sy);
	ctx.scale(zoom, zoom);
	ctx.translate(-sx, -sy);
	if (fade) ctx.globalAlpha = .4;
	if (usingPlate && ch !== "~" && ch !== "!" && ch !== "^") {
		ctx.restore();
		return;
	}
	const tone = (x * 3 + y * 5) % 3;
	const floors = theme === "haven" ? [
		"#6a5340",
		"#5c4636",
		"#745844"
	] : theme === "quarry" ? [
		"#5c5850",
		"#504c46",
		"#676258"
	] : theme === "rust" ? [
		"#5c3c30",
		"#4c342c",
		"#6a4638"
	] : [
		"#4a4036",
		"#433a32",
		"#514638"
	];
	const h = hash(x, y);
	diamond(ctx, sx, sy);
	if (ch === "~") {
		ctx.fillStyle = "#1c1612";
		ctx.fill();
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = "rgba(90,70,48,0.55)";
		ctx.lineWidth = 1;
		for (let i = -2; i <= 2; i++) {
			const wobble = Math.sin(now / 420 + x + i) * 2;
			ctx.beginPath();
			ctx.moveTo(sx - 22, sy + i * 4 + wobble);
			ctx.lineTo(sx + 22, sy + i * 3);
			ctx.stroke();
		}
		ctx.restore();
	} else if (ch === "=") {
		ctx.fillStyle = "#6d573f";
		ctx.fill();
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = "rgba(27,23,20,0.55)";
		for (let i = -2; i <= 2; i++) {
			ctx.beginPath();
			ctx.moveTo(sx - 24, sy + i * 5);
			ctx.lineTo(sx + 24, sy + i * 3);
			ctx.stroke();
		}
		ctx.restore();
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
		ctx.globalAlpha = .35 + Math.sin(now / 180 + x) * .15;
		ctx.beginPath();
		ctx.ellipse(sx, sy - 6, 5, 10, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = fade ? .4 : 1;
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
	} else if (ch === "." || ch === ",") drawDeck(ctx, sx, sy, x, y, now, theme, vacant, rimR, rimD);
	else {
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
function skirt(ctx, ax, ay, bx, by, depth, face, pipe) {
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
	ctx.moveTo(ax, ay + depth * .38);
	ctx.lineTo(bx, by + depth * .38);
	ctx.stroke();
	ctx.strokeStyle = pipe;
	ctx.lineWidth = 2.6;
	ctx.beginPath();
	ctx.moveTo(ax, ay + depth * .7);
	ctx.lineTo(bx, by + depth * .7);
	ctx.stroke();
	ctx.strokeStyle = "rgba(243,214,160,0.35)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(ax, ay + depth * .62);
	ctx.lineTo(bx, by + depth * .62);
	ctx.stroke();
	ctx.lineWidth = 1;
}
function etchPlate(ctx, sx, sy, h, now, theme) {
	const ice = theme === "citadel" || theme === "spire";
	const sand = theme === "quarry";
	ctx.save();
	diamond(ctx, sx, sy);
	ctx.clip();
	ctx.strokeStyle = ice ? "rgba(150,220,230,0.72)" : sand ? "rgba(120,78,42,0.75)" : "rgba(255,214,150,0.62)";
	ctx.lineWidth = 1;
	if (h % 2 === 0) {
		const pts = [
			[sx - 18, sy + 2],
			[sx - 6, sy - 8],
			[sx + 2, sy - 1],
			[sx + 14, sy - 7],
			[sx + 10, sy + 6],
			[sx - 4, sy + 8]
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
		const cx = sx + (h % 5 - 2) * 3;
		const cy = sy + (h % 3 - 1) * 2;
		ctx.beginPath();
		ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
		ctx.stroke();
		const spin = now / 900 + h;
		for (let i = 0; i < 6; i++) {
			const a = spin + i * Math.PI / 3;
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
function drawDeck(ctx, sx, sy, x, y, now, theme, vacant, rimR, rimD) {
	const h = hash(x, y);
	const ember = theme === "sinks" && y >= 12 && vacant;
	const depth = 44;
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
	const lift = h % 5 * 4;
	ctx.fillStyle = theme === "quarry" ? "#5a564c" : theme === "haven" ? "#5c4636" : theme === "rust" ? "#5a3830" : schematic ? `rgb(${62 + lift},${52 + lift},40)` : `rgb(${42 + lift},36,28)`;
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
		const glow = .72 + Math.sin(now / 520 + x * .7 + y) * .16;
		const gold = ember ? `rgba(255,150,70,${glow})` : `rgba(255,214,130,${glow})`;
		const pts = [
			[sx - 16, sy + 1],
			[sx - 6, sy - 8],
			[sx + 4, sy - 2],
			[sx + 14, sy - 6],
			[sx + 12, sy + 5],
			[sx - 2, sy + 7],
			[sx - 12, sy + 4]
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
		[0, -16.5],
		[TW / 2 - 5, 0],
		[0, TH / 2 - 3],
		[-34, 0]
	]) {
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
function diamondInset(ctx, sx, sy, inset) {
	const tw = TW - inset * 2.4;
	const th = TH - inset * 1.15;
	ctx.beginPath();
	ctx.moveTo(sx, sy - th / 2);
	ctx.lineTo(sx + tw / 2, sy);
	ctx.lineTo(sx, sy + th / 2);
	ctx.lineTo(sx - tw / 2, sy);
	ctx.closePath();
}
function drawClutter(ctx, sx, sy, h, now, south, vacant, theme = "") {
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
		ctx.fillStyle = `rgba(212,168,90,${.35 + Math.sin(now / 280 + h) * .2})`;
		ctx.beginPath();
		ctx.arc(sx - 2, sy - 8, 2.1, 0, Math.PI * 2);
		ctx.fill();
	}
	if (south && h % 4 === 0) {
		const glow = vacant ? .15 + Math.sin(now / 90) * .12 : .55;
		ctx.fillStyle = vacant ? `rgba(196,92,38,${glow})` : `rgba(212,180,131,${glow})`;
		ctx.beginPath();
		ctx.arc(sx, sy - 8, 2.2, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function sourceSize(image) {
	if (image instanceof HTMLCanvasElement) return {
		w: image.width,
		h: image.height
	};
	if (image instanceof HTMLImageElement) return {
		w: image.naturalWidth,
		h: image.naturalHeight
	};
	return {
		w: 1,
		h: 2
	};
}
function drawSprite(ctx, src, sx, sy, height, slump = 0) {
	const image = keyedSprite(src);
	ctx.save();
	ctx.translate(sx, sy);
	if (slump) ctx.rotate(slump);
	if (!image) {
		ctx.fillStyle = "#d4b483";
		ctx.beginPath();
		ctx.ellipse(0, -height * .45, height * .12, height * .42, 0, 0, Math.PI * 2);
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
function drawCast(ctx, src, sx, sy, height, slump = 0) {
	shadow(ctx, sx, sy + 4, Math.max(22, height * .22));
	drawSprite(ctx, src, sx, sy, height, slump);
}
function label(ctx, sx, sy, text, color) {
	ctx.font = "600 11px 'Source Sans 3', sans-serif";
	ctx.textAlign = "center";
	ctx.lineWidth = 3;
	ctx.strokeStyle = "rgba(16,14,12,0.85)";
	ctx.strokeText(text, sx, sy);
	ctx.fillStyle = color;
	ctx.fillText(text, sx, sy);
}
function shadow(ctx, sx, sy, wide = 16) {
	ctx.fillStyle = "rgba(8,6,5,0.45)";
	ctx.beginPath();
	ctx.ellipse(sx, sy + 6, wide, 6, 0, 0, Math.PI * 2);
	ctx.fill();
}
function drawRig(ctx, kind, sx, sy, now, dropped = false, zoom = 1) {
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
		ctx.globalAlpha = .85;
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
			ctx.fillStyle = `rgba(196,92,38,${.35 + Math.sin(now / 180) * .2})`;
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
			ctx.fillStyle = `rgba(196,92,38,${.45 + Math.sin(now / 160) * .25})`;
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
		ctx.fillStyle = dropped ? "#1b1714" : `rgba(212,180,131,${.35 + Math.sin(now / 260) * .15})`;
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
function drawSeamMark(ctx, sx, sy, mark, now) {
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
		ctx.fillStyle = `rgba(212,180,131,${.65 + Math.sin(now / 420) * .3})`;
		ctx.beginPath();
		ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function drawMouth(ctx, sx, sy, now) {
	ctx.save();
	ctx.translate(sx, sy);
	ctx.strokeStyle = `rgba(212,180,131,${.45 + Math.sin(now / 380) * .35})`;
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
function drawCinder(ctx, sx, sy, zoom, now, calm) {
	ctx.save();
	ctx.translate(sx, sy);
	ctx.scale(zoom, zoom);
	const flap = calm ? 0 : Math.sin(now / 140) * .5;
	ctx.fillStyle = "rgba(16,14,12,0.45)";
	ctx.beginPath();
	ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#d4b483";
	ctx.fillStyle = "rgba(212,180,131,0.35)";
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	ctx.ellipse(-7, -6 + flap * 4, 8, 3.5, -.6 + flap, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.ellipse(7, -6 - flap * 4, 8, 3.5, .6 - flap, 0, Math.PI * 2);
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
function steamPuff(ctx, sx, sy, now, tint, n = 3) {
	ctx.save();
	for (let i = 0; i < n; i++) {
		const t = (now / 700 + i * .37) % 1;
		ctx.globalAlpha = (1 - t) * .55;
		ctx.fillStyle = tint;
		ctx.beginPath();
		ctx.ellipse(sx + Math.sin(now / 300 + i) * 4, sy - t * 28 - i * 4, 4 + t * 6, 3 + t * 4, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function drawRemains(ctx, sx, sy) {
	ctx.fillStyle = "rgba(16,14,12,0.7)";
	ctx.beginPath();
	ctx.ellipse(sx, sy + 4, 16, 6, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#8c7049";
	ctx.stroke();
}
function weaponDark(a) {
	return a.nodes.some((n) => n.effect === "weapon" && !nodeLive(a.nodes, n) && (n.revealed || n.severed));
}
function fieldMark(a) {
	if (!a.alive) return "";
	if (gait(a) === "dead") return "held";
	if (weaponDark(a)) return "dark";
	return "";
}
function drawFeed(ctx, project, d, now) {
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
function drawSignature(ctx, project, d, now) {
	if (!d.flags.checkpointLead) return;
	const p = project(5, 11);
	ctx.save();
	ctx.strokeStyle = d.flags.plateStair ? "rgba(212,180,131,0.9)" : "rgba(196,92,38,0.75)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(p.sx - 18, p.sy);
	ctx.lineTo(p.sx + 18, p.sy - (d.flags.plateStair ? 10 : 0));
	ctx.stroke();
	ctx.globalAlpha = .4 + Math.sin(now / 300) * .15;
	ctx.fillStyle = d.flags.plateStair ? "#d4b483" : "#c45c26";
	ctx.beginPath();
	ctx.arc(p.sx, p.sy - 14, 2.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawWard(ctx, project, d, now) {
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
function drawBurst(ctx, sx, sy, kind, life, seed) {
	ctx.save();
	ctx.globalAlpha = Math.max(0, life);
	if (kind === "mend") {
		const r = 6 + life * 22;
		ctx.strokeStyle = "#d4b483";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.ellipse(sx, sy - 16, r, r * .42, 0, 0, Math.PI * 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(sx, sy - 16, Math.max(2, r * .35), r * .16, 0, 0, Math.PI * 2);
		ctx.stroke();
	} else if (kind === "snap") {
		ctx.strokeStyle = "#c45c26";
		ctx.lineWidth = 2;
		const span = 18 * (1 - life * .35);
		ctx.beginPath();
		ctx.moveTo(sx - span, sy - 26);
		ctx.lineTo(sx + span, sy - 6);
		ctx.moveTo(sx + span * .4, sy - 28);
		ctx.lineTo(sx - span * .7, sy - 8);
		ctx.stroke();
		for (let i = 0; i < 5; i++) {
			const a = seed + i * 1.2;
			const dist = (1 - life) * 32;
			ctx.fillStyle = i % 2 ? "#c45c26" : "#f3ead7";
			ctx.fillRect(sx + Math.cos(a) * dist, sy - 16 + Math.sin(a) * dist * .45, 3, 2);
		}
	} else {
		const n = kind === "brace" ? 5 : 6;
		for (let i = 0; i < n; i++) {
			const a = seed + i / n * Math.PI * 2;
			const dist = (1 - life) * (kind === "brace" ? 18 : 28);
			ctx.fillStyle = kind === "steam" ? "#f3ead7" : "#d4b483";
			ctx.beginPath();
			ctx.arc(sx + Math.cos(a) * dist, sy - 20 + Math.sin(a) * dist * .6, 2.2, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	ctx.restore();
}
function drawIntent(ctx, d, project, now) {
	const plans = d.combat?.plans;
	if (!plans) return;
	for (const [id, plan] of Object.entries(plans)) {
		const a = d.actors[id];
		if (!a?.alive || a.mapId !== d.mapId) continue;
		const prey = plan.target === "player" ? d.player : d.actors[plan.target];
		if (!prey) continue;
		const from = project(a.x, a.y);
		const to = project(prey.x, prey.y);
		const armed = plan.kind === "strike" || plan.kind === "close" || plan.kind === "cut" && plan.thenStrike;
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
function drawSeen(ctx, d, project, now) {
	if (d.panel !== "audit" || !d.audit) return;
	const target = d.audit.kind === "actor" ? d.audit.id === "player" ? d.player : d.actors[d.audit.id] : d.machines[d.audit.id];
	if (!target || "mapId" in target && target.mapId !== d.mapId) return;
	const nodes = target.nodes;
	const selected = nodes.find((n) => n.id === d.uiNode);
	const dead = Boolean(selected?.revealed && !nodeLive(nodes, selected));
	const flow = Boolean(selected && selected.effect === "flow" && selected.revealed && !dead);
	const p = project(target.x, target.y);
	const beat = .55 + Math.sin(now / (dead ? 160 : flow ? 420 : 700)) * .35;
	ctx.save();
	ctx.setLineDash(dead ? [4, 4] : []);
	ctx.strokeStyle = dead ? `rgba(196,92,38,${beat})` : flow ? `rgba(212,180,131,${beat})` : "rgba(243,234,215,0.9)";
	ctx.lineWidth = dead ? 2 : 1.5;
	ctx.beginPath();
	ctx.ellipse(p.sx, p.sy + 8, 26, 9, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
function WorldCanvas() {
	const canvasRef = (0, import_react.useRef)(null);
	const data = useGame((s) => s.data);
	const dataRef = (0, import_react.useRef)(data);
	dataRef.current = data;
	const clickTile = useGame((s) => s.clickTile);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const parent = canvas?.parentElement;
		if (!canvas || !parent) return;
		let raf = 0;
		const motes = Array.from({ length: 18 }, (_, i) => ({
			x: Math.random(),
			y: Math.random(),
			s: .3 + Math.random(),
			kind: i % 5 === 0 ? "drip" : "ash"
		}));
		const frame = (now) => {
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
			drawVista(ctx, map.theme, w, h, d.player.x, d.player.y, d.mapId);
			const pumpFate = String(d.flags.pumpFate ?? "");
			const pumpLit = pumpFate === "mend" || pumpFate === "wren" || pumpFate === "speech" || pumpFate === "flood";
			if (usingPlate && d.mapId === "sinks" && pumpLit) {
				ctx.fillStyle = "rgba(210,140,60,0.08)";
				ctx.fillRect(0, 0, w, h);
			}
			const vacant = d.mapId === "sinks" && d.flags.checkpointLead === "vacant";
			const calm = Boolean(d.flags.reduceMotion);
			const jx = calm ? 0 : (Math.random() - .5) * shake;
			const jy = calm ? 0 : (Math.random() - .5) * shake;
			ctx.save();
			ctx.translate(jx, jy);
			const zoom = d.zoom ?? .85;
			const project = (x, y) => projectTile(w, h, d.player.x, d.player.y, x, y, zoom, usingPlate, d.mapId);
			const stageH = Math.min(h, w * 1.15);
			const playerH = usingPlate ? Math.max(112, Math.min(156, stageH * .34)) : 156 * zoom;
			const jobs = [];
			const tags = [];
			for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
				const p = project(x, y);
				if (p.sx < -78 * zoom || p.sx > w + TW * zoom || p.sy < -72 || p.sy > h + TH * zoom) continue;
				const ch = tileAt(map, x, y);
				if (ch === "#") continue;
				const shut = ch === "+" && LOCKED_DOORS.some((door) => door.map === d.mapId && door.x === x && door.y === y && !d.flags[door.flag]);
				const mouth = MOUTHS.some((m) => m.map === d.mapId && m.x === x && m.y === y);
				if (usingPlate) {
					if (Math.abs(x - d.player.x) + Math.abs(y - d.player.y) <= 4 && (mouth || shut)) jobs.push({
						z: (x + y) * 10,
						run: () => drawChevron(ctx, p.sx, p.sy, shut)
					});
				} else {
					const rimR = isPlate(ch) && !isPlate(tileAt(map, x + 1, y));
					const rimD = isPlate(ch) && !isPlate(tileAt(map, x, y + 1));
					jobs.push({
						z: (x + y) * 10,
						run: () => drawTile(ctx, p.sx, p.sy, ch, x, y, now, map.theme, vacant, false, shut, zoom, rimR, rimD)
					});
					if (mouth) jobs.push({
						z: (x + y) * 10 + 1,
						run: () => drawMouth(ctx, p.sx, p.sy - 8, now)
					});
					if (ch === "~") jobs.push({
						z: (x + y) * 10 + 3,
						run: () => steamPuff(ctx, p.sx, p.sy, now + x * 40, "rgba(168,152,128,0.7)", 2)
					});
				}
			}
			if (!usingPlate && d.mapId === "sinks") {
				jobs.push({
					z: 241,
					run: () => drawFeed(ctx, project, d, now)
				});
				jobs.push({
					z: 161,
					run: () => drawSignature(ctx, project, d, now)
				});
			}
			if (!usingPlate && d.mapId === "haven") jobs.push({
				z: 201,
				run: () => drawWard(ctx, project, d, now)
			});
			for (const m of Object.values(d.machines)) {
				if (m.mapId !== d.mapId) continue;
				const p = project(m.x, m.y);
				const footing = m.nodes.find((n) => n.id === "footing" || n.id === "sign" || n.id === "feed" || n.id === "main" || n.id === "haul" || n.id === "inlet" || n.id === "ore" || n.id === "lip");
				const structural = footing ? !nodeLive(m.nodes, footing) : false;
				const down = m.nodes.some((n) => n.spent) || m.id === "pump" && (pumpFate === "lockout" || pumpFate === "bleed") || structural;
				const running = m.id === "pump" && (pumpFate === "mend" || pumpFate === "wren" || pumpFate === "speech" || pumpFate === "flood");
				const nearMachine = Math.abs(m.x - d.player.x) + Math.abs(m.y - d.player.y);
				jobs.push({
					z: (m.x + m.y) * 10 + 4,
					run: () => {
						if (usingPlate) {
							if (m.id === "pump" && running) steamPuff(ctx, p.sx + 8, p.sy - 28, now, pumpFate === "flood" ? "rgba(196,92,38,0.55)" : "rgba(243,234,215,0.75)", 3);
							if (m.id === "pump" && pumpFate === "bleed") steamPuff(ctx, p.sx, p.sy - 8, now, "rgba(90,60,36,0.7)", 2);
							if (nearMachine <= 1) tags.push({
								z: (m.x + m.y) * 10 + 8,
								run: () => label(ctx, p.sx, p.sy + 14, m.name, down ? "#c45c26" : "#d4b483")
							});
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
						tags.push({
							z: (m.x + m.y) * 10 + 8,
							run: () => label(ctx, p.sx, p.sy + 26, m.name, down ? "#c45c26" : "#d4b483")
						});
					}
				});
			}
			for (const a of Object.values(d.actors)) {
				if (a.mapId !== d.mapId) continue;
				const p = project(a.x, a.y);
				if (!a.alive) {
					const nearDead = Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 5;
					if (!usingPlate || nearDead) jobs.push({
						z: (a.x + a.y) * 10 + 2,
						run: () => drawRemains(ctx, p.sx, p.sy)
					});
					continue;
				}
				const dist = Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y);
				if (usingPlate && dist > (d.combat && a.hostile ? 9 : 6)) continue;
				const body = usingPlate ? playerH * (a.scale || 1) * .92 : 128 * a.scale * zoom;
				jobs.push({
					z: (a.x + a.y) * 10 + 5,
					run: () => {
						const still = gait(a) === "dead";
						const dark = weaponDark(a);
						const bob = still || dark || Boolean(d.flags.reduceMotion) ? 0 : Math.sin(now / 420 + a.x) * 1.4;
						if (usingPlate) drawCast(ctx, a.sprite, p.sx, p.sy + bob, body, dark ? .04 : 0);
						else {
							shadow(ctx, p.sx, p.sy, 18 * zoom);
							if (a.template === "cinder") {
								const restless = d.flags.bellowsLive === false || Boolean(d.flags.roadDark && !d.flags.cinderDarkOk);
								const calmBeast = Boolean(d.flags.reduceMotion) || !restless && Boolean(d.flags.foodLive);
								drawCinder(ctx, p.sx, p.sy + bob, zoom, now, calmBeast);
							} else drawSprite(ctx, a.sprite, p.sx, p.sy + bob, body, dark ? .04 : 0);
						}
						if (!usingPlate && a.nodes.some((n) => n.revealed)) drawSeamMark(ctx, p.sx + 14 * zoom, p.sy - body + 10, seamMark(a.nodes), now);
						if (dark) steamPuff(ctx, p.sx + 10, p.sy - body * .45, now, "rgba(168,152,128,0.65)", 2);
						const mark = fieldMark(a);
						if (mark && d.combat) tags.push({
							z: (a.x + a.y) * 10 + 9,
							run: () => label(ctx, p.sx, p.sy - body + 6, mark, "#c45c26")
						});
						if (!usingPlate || a.hostile || dist <= 1) tags.push({
							z: (a.x + a.y) * 10 + 9,
							run: () => label(ctx, p.sx, usingPlate ? p.sy - body - 4 : p.sy + 18, a.name, a.hostile ? "#c45c26" : "#f3ead7")
						});
					}
				});
			}
			const pp = project(d.player.x, d.player.y);
			const playerBody = usingPlate ? playerH : 156 * zoom;
			jobs.push({
				z: (d.player.x + d.player.y) * 10 + 6,
				run: () => {
					const still = gait(d.player) === "dead";
					const dark = weaponDark(d.player);
					const walking = d.path.length > 0 && !still && !d.flags.reduceMotion;
					const bob = walking ? Math.sin(now / 160) * 2.4 : still || d.flags.reduceMotion ? 0 : Math.sin(now / 380) * 1.6;
					const lean = walking ? Math.sin(now / 160) * 2.2 : 0;
					if (usingPlate) drawCast(ctx, d.player.sprite, pp.sx + lean, pp.sy + bob, playerBody, dark ? .03 : 0);
					else {
						shadow(ctx, pp.sx, pp.sy, 20 * zoom);
						drawSprite(ctx, d.player.sprite, pp.sx + lean, pp.sy + bob, playerBody, dark ? .03 : 0);
					}
					if (d.player.guarding) {
						ctx.strokeStyle = "rgba(212,180,131,0.8)";
						ctx.strokeRect(pp.sx - 22 * zoom, pp.sy - playerBody * .72, 44 * zoom, playerBody * .5);
					}
					const mark = fieldMark(d.player);
					if (mark && d.combat) tags.push({
						z: 9990,
						run: () => label(ctx, pp.sx, pp.sy - playerBody + 8, mark, "#c45c26")
					});
					if (!usingPlate) tags.push({
						z: 9991,
						run: () => label(ctx, pp.sx, pp.sy + 20, d.name.split(" ")[0] || "Silas", "#d4b483")
					});
				}
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
				ctx.globalAlpha = Math.max(0, f.life) * .9;
				ctx.fillStyle = f.color;
				ctx.font = "700 13px 'Source Sans 3', sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(f.text, p.sx, p.sy - playerBody * .55 - (1 - f.life) * 18);
				ctx.globalAlpha = 1;
			}
			if (d.mapId === "road" && d.flags.roadDark) {
				ctx.fillStyle = "rgba(0,0,0,0.45)";
				ctx.fillRect(-40, -40, w + 80, h + 80);
			}
			const vignette = ctx.createRadialGradient(w / 2, h * .5, h * .2, w / 2, h * .48, Math.max(w, h) * .72);
			vignette.addColorStop(0, "rgba(0,0,0,0)");
			vignette.addColorStop(1, usingPlate ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.22)");
			ctx.fillStyle = vignette;
			ctx.fillRect(-20, -20, w + 40, h + 40);
			ctx.restore();
			if (!d.flags.reduceMotion) {
				const weather = d.mapId === "sinks" ? "drip" : d.mapId === "tundra" ? "ice" : d.mapId === "rust" ? d.flags.tenementWarm || d.flags.guildWarm ? "spark" : "ash" : d.mapId === "spire" ? "wrong" : d.mapId === "quarry" ? "grit" : d.mapId === "haven" ? d.flags.foodLive ? "seed" : "dust" : d.mapId === "road" && d.flags.roadDark ? "none" : "ash";
				if (weather !== "none") for (const mote of motes) {
					if (weather === "ice") {
						mote.x += 55e-5 * mote.s;
						if (mote.x > 1) mote.x = 0;
					} else {
						mote.y -= (weather === "wrong" ? 25e-5 : 8e-4) * mote.s;
						if (mote.y < 0) mote.y = 1;
					}
					const tint = weather === "drip" ? "#8c7049" : weather === "ice" ? "#d7e6ea" : weather === "spark" ? "#c45c26" : weather === "seed" ? "#8a9a62" : weather === "wrong" ? "#c45c26" : "#d4b483";
					ctx.globalAlpha = usingPlate ? .16 : weather === "wrong" ? .22 : .35;
					ctx.fillStyle = tint;
					const tall = weather === "drip" || weather === "grit";
					ctx.fillRect(mote.x * w, mote.y * h, weather === "spark" ? 2.2 : 1.3, tall ? 7 : weather === "ice" ? 1.4 : 4);
					ctx.globalAlpha = 1;
				}
			}
			decayFx(1 / 60);
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		const onPointer = (ev) => {
			const d = dataRef.current;
			if (!d) return;
			const rect = canvas.getBoundingClientRect();
			const mx = ev.clientX - rect.left;
			const my = ev.clientY - rect.top;
			const map = MAPS[d.mapId];
			if (!map) return;
			const zoom = d.zoom ?? .85;
			let best = null;
			let floor = null;
			for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
				const dx = x - d.player.x;
				const dy = y - d.player.y;
				if (usingPlate && Math.abs(dx) + Math.abs(dy) > 6) continue;
				const p = projectTile(rect.width, rect.height, d.player.x, d.player.y, x, y, zoom, usingPlate, d.mapId);
				const dd = (p.sx - mx) ** 2 + (p.sy - my) ** 2 * (usingPlate ? 1.4 : 2.2);
				if (!best || dd < best.dd) best = {
					x,
					y,
					dd
				};
				if (walkable(d, x, y, "player") && (!floor || dd < floor.dd)) floor = {
					x,
					y,
					dd
				};
			}
			const pick = floor && floor.dd < 9e3 ? floor : best;
			if (pick && pick.dd < 9e3) clickTile(pick.x, pick.y);
		};
		canvas.addEventListener("pointerdown", onPointer);
		return () => {
			cancelAnimationFrame(raf);
			canvas.removeEventListener("pointerdown", onPointer);
		};
	}, [clickTile]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "h-full w-full touch-none",
		"aria-label": "The city, isometric"
	});
}
function Game() {
	const phase = useGame((s) => s.data.phase);
	const uiText = useGame((s) => s.data.flags.uiText);
	const boot = useGame((s) => s.boot);
	(0, import_react.useEffect)(() => {
		boot();
		const unlock = () => {
			unlockAudio();
			startBed();
		};
		window.addEventListener("pointerdown", unlock);
		return () => window.removeEventListener("pointerdown", unlock);
	}, [boot]);
	const fontSize = uiText === "lg" ? "1.125rem" : uiText === "sm" ? "0.9rem" : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-dvh bg-soot text-parchment",
		style: fontSize ? { fontSize } : void 0,
		children: [
			phase === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {}),
			phase === "create" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateScreen, {}),
			phase === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayScreen, {}),
			phase === "epilogue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EpilogueScreen, {}),
			phase === "dead" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeadScreen, {})
		]
	});
}
function TitleScreen() {
	const ironman = useGame((s) => s.data.ironman);
	const hasSave = useGame((s) => s.data.hasSave);
	const setIronman = useGame((s) => s.setIronman);
	const openCreate = useGame((s) => s.openCreate);
	const load = useGame((s) => s.load);
	const openPanel = useGame((s) => s.openPanel);
	const panel = useGame((s) => s.data.panel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/game/plates/sinks.jpg?v=5",
				alt: "",
				className: "pointer-events-none absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative m-3 mt-10 border border-brass bg-soot/80 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.35em] text-brass-dim",
						children: "Oakhaven maintenance ledger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-6xl text-brass",
						children: "MEND"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-base leading-snug text-parchment",
						children: "You do not spend power. You spend understanding. Silas Vance reads the relationships that hold the city together, and decides which ones deserve to hold."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/game/portraits/silas.jpg?v=3",
						alt: "Silas Vance, maintenance mage",
						className: "mt-5 h-40 w-32 border border-brass object-cover object-top"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex max-w-sm flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 bg-brass px-4 font-display text-lg text-soot",
								onClick: openCreate,
								children: "New ledger"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 border border-brass px-4 text-brass",
								disabled: !hasSave,
								onClick: () => load("auto"),
								children: "Continue"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-2 flex min-h-11 items-center gap-3 text-sm text-mist",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: ironman,
									onChange: (e) => setIronman(e.target.checked)
								}), "Ironman — one ledger, and death closes it"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 text-left text-sm text-brass",
								onClick: () => openPanel("help"),
								children: "How to read a city"
							})
						]
					})
				]
			}),
			panel === "help" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, {})
		]
	});
}
function CreateScreen() {
	const draft = useGame((s) => s.data.draft);
	const setName = useGame((s) => s.setDraftName);
	const draftAttr = useGame((s) => s.draftAttr);
	const toggleTag = useGame((s) => s.toggleTag);
	const recommend = useGame((s) => s.recommend);
	const start = useGame((s) => s.startNew);
	const skills = allSkills(draft.attrs, draft.tags);
	const c = comprehension(draft.attrs, skills.audit, 1);
	const hp = maxHp(draft.attrs.body, 1);
	const ready = draft.pool === 0 && draft.tags.length === 3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto h-dvh w-full max-w-[440px] overflow-y-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/game/plates/haven.jpg?v=5",
			alt: "",
			className: "pointer-events-none absolute inset-0 h-full w-full object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative m-3 mt-6 mb-8 border border-brass bg-soot/85 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-brass-dim",
					children: "Bureau diagnostic · zero output"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl text-brass",
					children: "File the Patch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-mist",
					children: "The chamber cannot measure you. Spend the remaining points, tag three skills, and step into the Sinks. You are not filing a class. The city will learn you from the verbs you repeat."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: ["Name on the card", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: draft.name,
						onChange: (e) => setName(e.target.value),
						className: "mt-1 w-full border border-brass-dim bg-iron px-3 py-3 text-parchment"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-3 text-brass",
						onClick: recommend,
						children: "Recommended file"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "self-center text-sm text-mist",
						children: ["Points left: ", draft.pool]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2",
					children: ATTR_LIST.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 border border-brass-dim px-2 py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-brass",
									children: a.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-mist",
									children: a.blurb
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 min-w-11 border border-brass-dim",
								onClick: () => draftAttr(a.id, -1),
								"aria-label": `Decrease ${a.name}`,
								children: "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-center font-display text-xl",
								children: draft.attrs[a.id]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 min-w-11 border border-brass-dim",
								onClick: () => draftAttr(a.id, 1),
								"aria-label": `Increase ${a.name}`,
								children: "+"
							})
						]
					}, a.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-6 font-display text-brass",
					children: "Tag three skills"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-2 sm:grid-cols-2",
					children: SKILL_LIST.map((s) => {
						const on = draft.tags.includes(s.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggleTag(s.id),
							className: `min-h-11 w-full border px-3 py-2 text-left text-sm ${on ? "border-brass bg-plate text-brass" : "border-brass-dim"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [skills[s.id], "%"] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-mist",
								children: s.blurb
							})]
						}) }, s.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm",
					children: [
						"Comprehension ",
						c,
						" · HP ",
						hp,
						" · Tags ",
						draft.tags.length,
						"/3"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: !ready,
					className: "mt-4 mb-4 min-h-11 bg-brass px-4 font-display text-lg text-soot",
					onClick: start,
					children: "Enter the Sinks"
				})
			]
		})]
	});
}
function focusLine(d) {
	if (d.pinned) return d.pinned;
	const pump = String(d.flags.pumpFate ?? "");
	if (d.mapId === "sinks") {
		if (pump === "mend" || pump === "wren" || pump === "speech") return "The pump holds";
		return "The broken pump";
	}
	if (d.mapId === "quarry") return "The buried gears";
	if (d.mapId === "tundra") return "Activate the main bellows";
	if (d.mapId === "citadel" || d.mapId === "spire" || d.mapId === "pane") return "The frozen span";
	if (d.mapId === "road" || d.mapId === "switch") return "The stacked road";
	if (d.mapId === "kiln" || d.mapId === "rust") return "The cold stacks";
	if (d.mapId === "haven") return "The quiet ward";
	return "The city";
}
function PlayScreen() {
	const d = useGame((s) => s.data);
	const open = useGame((s) => s.openPanel);
	const step = useGame((s) => s.step);
	const click = useGame((s) => s.clickTile);
	const talk = useGame((s) => s.talkNearest);
	const audit = useGame((s) => s.auditNearest);
	const strike = useGame((s) => s.strikeNearest);
	const endTurn = useGame((s) => s.endTurn);
	const stand = useGame((s) => s.standDown);
	const brace = useGame((s) => s.brace);
	const zoom = useGame((s) => s.setZoom);
	const close = useGame((s) => s.closePanel);
	(0, import_react.useEffect)(() => {
		const pump = String(d.flags.pumpFate ?? "");
		const south = d.mapId === "sinks" && d.player.y >= 12;
		const gallery = d.mapId === "sinks" && d.player.x >= 19 && d.player.y >= 6 && d.player.y <= 8 && d.flags.sumpOpen && !d.flags.jackHeld;
		setAtmosphere(d.combat ? "fight" : d.mapId === "haven" ? d.flags.wardMarket || d.flags.wardClinic ? "haven" : "strain" : d.mapId === "quarry" ? d.flags.quarryStone && d.flags.quarryStone !== "hung" ? "quarry" : "strain" : d.mapId === "rust" ? d.flags.tenementWarm || d.flags.guildWarm ? "rust" : "strain" : d.mapId === "road" ? d.flags.roadDark ? "dark" : "road" : d.mapId === "tundra" ? d.flags.roadDark ? "dark" : d.flags.hollowWarm === false ? "strain" : "citadel" : d.mapId === "citadel" ? d.flags.citadelFate === "sever" || d.flags.roadDark ? "strain" : "citadel" : d.mapId === "spire" ? "spire" : south && d.flags.checkpointLead === "vacant" ? "vacant" : gallery ? "strain" : pump === "mend" || pump === "wren" || pump === "speech" || pump === "flood" ? "pump" : pump === "bleed" || pump === "lockout" ? "strain" : "sinks");
	}, [
		d.combat,
		d.flags.checkpointLead,
		d.flags.citadelFate,
		d.flags.guildWarm,
		d.flags.hollowWarm,
		d.flags.jackHeld,
		d.flags.pumpFate,
		d.flags.quarryStone,
		d.flags.roadDark,
		d.flags.sumpOpen,
		d.flags.tenementWarm,
		d.flags.wardClinic,
		d.flags.wardMarket,
		d.mapId,
		d.player.x,
		d.player.y
	]);
	(0, import_react.useEffect)(() => {
		let acc = 0;
		let last = performance.now();
		let raf = 0;
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			acc += dt;
			if (acc >= .16) {
				acc = 0;
				if (useGame.getState().data.path.length) step();
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [step]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const s = useGame.getState().data;
			if (e.key === "Escape") {
				close();
				return;
			}
			if (s.dialogue || s.panel !== "none" && s.panel !== "audit") return;
			const target = e.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
			const x = s.player.x;
			const y = s.player.y;
			if (e.key === "ArrowUp" || e.key === "w") click(x, y - 1);
			if (e.key === "ArrowDown" || e.key === "s") click(x, y + 1);
			if (e.key === "ArrowLeft" || e.key === "a") click(x - 1, y);
			if (e.key === "ArrowRight" || e.key === "d") click(x + 1, y);
			if (e.key === "e") talk();
			if (e.key === "q") audit();
			if (e.key === "f") strike();
			if (e.key === " ") {
				e.preventDefault();
				if (s.combat) endTurn();
			}
			if (e.key === "c") open("char");
			if (e.key === "j") open("journal");
			if (e.key === "i") open("inventory");
			if (e.key === "m") open("map");
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		audit,
		click,
		close,
		endTurn,
		open,
		strike,
		talk
	]);
	const talking = Boolean(d.dialogue);
	const fighting = Boolean(d.combat);
	const myTurn = !d.combat || d.combat.order[d.combat.index] === "player";
	const map = MAPS[d.mapId];
	const noStrike = fighting && (!myTurn || d.player.ap < 3);
	const noBrace = fighting && (!myTurn || d.player.ap < 1);
	const faultLine = fighting ? knownFaults(d) : "";
	const intents = fighting && myTurn ? boardIntents(d) : [];
	const canYield = fighting && myTurn && weaponsDark(d);
	const nearFaces = Object.values(d.actors).filter((a) => a.alive && a.mapId === d.mapId && Math.abs(a.x - d.player.x) + Math.abs(a.y - d.player.y) <= 8).slice(0, 3);
	const turnFaces = fighting && d.combat ? d.combat.order.map((id, i) => ({
		id: `${id}-${i}`,
		name: id === "player" ? "You" : d.actors[id]?.name ?? id,
		portrait: id === "player" ? d.player.portrait : d.actors[id]?.portrait,
		on: i === d.combat.index
	})) : [{
		id: "you",
		name: "You",
		portrait: d.player.portrait,
		on: true
	}, ...nearFaces.map((a) => ({
		id: a.id,
		name: a.name,
		portrait: a.portrait,
		on: false
	}))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex h-dvh w-full max-w-[440px] flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "plate-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "head-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "head-gear",
							onClick: () => open("menu"),
							"aria-label": "Menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/game/ui/head-dots.jpg",
								alt: ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "head-gear",
							onClick: () => open("map"),
							"aria-label": "Map",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/game/ui/head-check.jpg",
								alt: ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "head-knot",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/game/ui/head-knot.jpg",
								alt: ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "head-gear lion",
							onClick: () => open("char"),
							"aria-label": "Self",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/game/ui/head-lion.jpg",
								alt: ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "head-gear",
							onClick: () => zoom((d.zoom ?? 1) < 1 ? 1 : -1),
							"aria-label": "Zoom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/game/ui/head-close.jpg",
								alt: ""
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "head-plaque",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "head-title truncate",
							children: map?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "head-sub",
							children: [
								map?.act,
								fighting ? ` · round ${d.combat?.round}` : "",
								" · C ",
								comp(d)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "head-title",
							children: ["Focus ", d.focus]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "head-sub head-pin",
							children: focusLine(d)
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "world-frame relative min-h-0 flex-1 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldCanvas, {}),
					!talking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute left-3 top-3 z-10 flex max-w-[min(78%,20rem)] flex-col gap-1.5",
						children: d.log.slice(0, 3).map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "scrap",
							children: line
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogueBox, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "instrument px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: d.player.portrait,
							alt: "",
							className: "bezel h-[4.75rem] w-[3.7rem] shrink-0 object-cover object-[center_15%] bg-soot"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "truncate font-display text-sm tracking-wide text-parchment",
									children: [
										d.name,
										d.player.guarding ? " · braced" : "",
										d.player.stunned ? " · overloaded" : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "face-row mt-1",
									children: turnFaces.map((face) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: face.on ? "face-tab on" : "face-tab",
										children: [face.portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: face.portrait,
											alt: ""
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bezel inline-block h-9 w-7 bg-soot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "max-w-16 truncate",
											children: face.name
										})]
									}, face.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hp-track mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hp-fill",
										style: { width: `${Math.max(0, d.player.hp / d.player.maxHp * 100)}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `mt-1 text-xs ${fighting && myTurn && d.player.ap < 1 ? "text-rust" : "text-mist"}`,
									children: [
										"HP ",
										d.player.hp,
										"/",
										d.player.maxHp,
										" · Focus ",
										d.focus,
										fighting ? myTurn ? ` · your action · AP ${d.player.ap}${d.player.ap < 1 ? " · end the turn" : ""}` : " · their action" : "",
										fighting ? ` · ${weaponOf(d.player).name}` : ""
									]
								}),
								fighting && faultLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-xs text-rust",
									children: faultLine
								}),
								intents.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `truncate text-xs ${row.live ? "text-brass" : "text-mist"}`,
									children: [
										row.name,
										": ",
										row.line,
										row.live ? "" : " — no longer that shape"
									]
								}, row.id))
							]
						})]
					}),
					canYield && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mb-1 min-h-11 w-full border border-brass text-xs text-brass",
						onClick: stand,
						children: "Stand down — their weapons are already dark"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-4 gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "audit",
								label: "Audit",
								onClick: audit,
								dim: fighting && !myTurn
							}),
							fighting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "strike",
								label: "Strike",
								onClick: strike,
								dim: noStrike
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "talk",
								label: "Talk",
								onClick: talk
							}),
							fighting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "brace",
								label: "Brace",
								onClick: brace,
								dim: noBrace
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "map",
								label: "Map",
								onClick: () => open("map")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: fighting ? "end" : "menu",
								label: fighting ? "End" : "Menu",
								onClick: fighting ? endTurn : () => open("menu")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 grid grid-cols-4 gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "quests",
								label: "Quests",
								onClick: () => open("journal")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "pack",
								label: "Pack",
								onClick: () => open("inventory")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "self",
								label: "Self",
								onClick: () => open("char")
							}),
							fighting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "menu",
								label: "Menu",
								onClick: () => open("menu")
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudButton, {
								kind: "lens",
								label: "Lens",
								onClick: () => zoom((d.zoom ?? 1) < 1 ? 1 : -1)
							})
						]
					})
				]
			}),
			d.panel === "audit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditPanel, {}),
			d.panel === "char" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharSheet, {}),
			d.panel === "journal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalPanel, {}),
			d.panel === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryPanel, {}),
			d.panel === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPanel, {}),
			d.panel === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPanel, {}),
			d.panel === "tools" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolsPanel, {}),
			d.panel === "help" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelModal, {})
		]
	});
}
function seamWord(n) {
	if (n.effect === "weapon") return "unavailable";
	if (n.effect === "motive") return "still";
	if (n.effect === "armor") return "compromised";
	return "disabled";
}
function knownFaults(d) {
	if (!d.combat) return "";
	const bits = [];
	const note = (a, who) => {
		const dark = a.nodes.filter((n) => n.revealed && !nodeLive(a.nodes, n) && (n.severed || n.effect === "weapon" || n.effect === "motive" || n.effect === "armor"));
		if (dark.length) bits.push(`${who}: ${dark.map((n) => `${n.name} ${n.severed ? "severed" : seamWord(n)}`).slice(0, 2).join(", ")}`);
	};
	note(d.player, "You");
	for (const id of d.combat.order) {
		if (id === "player") continue;
		const a = d.actors[id];
		if (a?.alive) note(a, a.name);
	}
	return bits.join(" · ");
}
var HUD_ART = {
	audit: "/game/ui/audit.jpg",
	strike: "/game/ui/strike.jpg",
	talk: "/game/ui/talk.jpg",
	brace: "/game/ui/brace.jpg",
	map: "/game/ui/map.jpg",
	end: "/game/ui/end.jpg",
	menu: "/game/ui/menu.jpg",
	quests: "/game/ui/quests.jpg",
	pack: "/game/ui/pack.jpg",
	self: "/game/ui/self.jpg",
	lens: "/game/ui/lens.jpg"
};
function HudButton({ kind, label, onClick, dim }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-label": label,
		"aria-disabled": dim || void 0,
		className: `hud-key ${dim ? "opacity-40" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: HUD_ART[kind] ?? HUD_ART.menu,
			alt: "",
			className: "hud-art"
		})
	});
}
function EpilogueScreen() {
	const lines = useGame((s) => s.data.epilogue);
	const ending = useGame((s) => s.data.ending);
	const quit = useGame((s) => s.quit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto h-dvh max-w-[440px] overflow-y-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/game/plates/spire.jpg?v=5",
			alt: "",
			className: "pointer-events-none absolute inset-0 h-full w-full object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative m-3 mt-8 border border-brass bg-soot/85 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.3em] text-brass-dim",
					children: ending === "impose" ? "Baseline imposed" : "Baseline refused"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl text-brass",
					children: "The ledger closes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-4 text-sm leading-relaxed",
					children: lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-6 mb-4 min-h-11 bg-brass px-4 font-semibold text-soot",
					onClick: quit,
					children: "Return to the title"
				})
			]
		})]
	});
}
function DeadScreen() {
	const text = useGame((s) => s.data.deathText);
	const ironman = useGame((s) => s.data.ironman);
	const load = useGame((s) => s.load);
	const quit = useGame((s) => s.quit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto flex h-dvh max-w-[440px] flex-col justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/game/plates/canyon.jpg?v=5",
			alt: "",
			className: "pointer-events-none absolute inset-0 h-full w-full object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative m-4 border border-rust bg-soot/88 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl text-rust",
					children: "Baseline lost"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed",
					children: text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [!ironman && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-brass px-4 font-semibold text-soot",
						onClick: () => load("auto"),
						children: "Open the last ledger"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-brass px-4 text-brass",
						onClick: quit,
						children: "Title"
					})]
				})
			]
		})]
	});
}
var SplitComponent = Game;
//#endregion
export { SplitComponent as component };
