let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

function beep(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function play(
  kind: "ui" | "step" | "mend" | "unmend" | "hit" | "hurt" | "over" | "level" | "talk" | "steam" | "moth",
  tone?: "sinks" | "ice" | "metal" | "timber",
) {
  unlockAudio();
  if (!ctx) return;
  if (kind === "ui") beep(420, 0.05, "square", 0.03);
  if (kind === "step") {
    const freq = tone === "ice" ? 640 : tone === "metal" ? 96 : tone === "timber" ? 240 : 180;
    beep(freq, tone === "ice" ? 0.03 : 0.045, tone === "ice" ? "sine" : "triangle", 0.016, tone === "metal" ? -30 : 0);
  }
  if (kind === "talk") beep(320, 0.06, "triangle", 0.02);
  if (kind === "mend") {
    beep(392, 0.16, "sine", 0.035);
    beep(494, 0.2, "sine", 0.028);
    beep(587, 0.26, "triangle", 0.02);
  }
  if (kind === "unmend") {
    beep(196, 0.05, "square", 0.03);
    beep(110, 0.22, "sawtooth", 0.045, -70);
    beep(70, 0.28, "square", 0.02);
  }
  if (kind === "hit") beep(220, 0.08, "square", 0.04, -60);
  if (kind === "hurt") beep(110, 0.2, "sawtooth", 0.05, -40);
  if (kind === "over") {
    beep(80, 0.3, "sawtooth", 0.05);
    beep(160, 0.2, "square", 0.03, 40);
  }
  if (kind === "level") {
    beep(440, 0.12, "sine", 0.04);
    beep(554, 0.16, "sine", 0.04);
    beep(659, 0.22, "sine", 0.04);
  }
  if (kind === "steam") {
    beep(90, 0.22, "sawtooth", 0.03, -30);
    beep(180, 0.12, "triangle", 0.02, 40);
  }
  if (kind === "moth") {
    beep(880, 0.05, "sine", 0.018);
    beep(1320, 0.08, "triangle", 0.012, 180);
  }
}

let bed: OscillatorNode | null = null;
let bedFilter: BiquadFilterNode | null = null;
let bedGain: GainNode | null = null;
let airFilter: BiquadFilterNode | null = null;
let airGain: GainNode | null = null;
let wrong: OscillatorNode | null = null;
let wrongGain: GainNode | null = null;

export function startBed() {
  unlockAudio();
  if (!ctx || bed) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.value = 48;
  filter.type = "lowpass";
  filter.frequency.value = 140;
  gain.gain.value = 0.012;
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
    data[i] = (Math.random() * 2 - 1) * (drip ? 1 : 0.08);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const aFilter = ctx.createBiquadFilter();
  aFilter.type = "bandpass";
  aFilter.frequency.value = 480;
  aFilter.Q.value = 3;
  const aGain = ctx.createGain();
  aGain.gain.value = 0.012;
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

export function setAtmosphere(mode: "sinks" | "pump" | "strain" | "vacant" | "fight" | "haven" | "citadel" | "quarry" | "rust" | "road" | "dark" | "spire") {
  unlockAudio();
  if (!ctx) return;
  if (!bed) startBed();
  if (!bedFilter || !bedGain || !airFilter || !airGain || !wrong || !wrongGain) return;
  const tone = {
    sinks: { f: 140, g: 0.012, air: 620, ag: 0.02, q: 6, wrong: 0 },
    pump: { f: 240, g: 0.018, air: 280, ag: 0.016, q: 2, wrong: 0 },
    strain: { f: 88, g: 0.016, air: 160, ag: 0.014, q: 1.2, wrong: 0 },
    vacant: { f: 64, g: 0.008, air: 90, ag: 0.01, q: 0.7, wrong: 0 },
    fight: { f: 190, g: 0.02, air: 240, ag: 0.012, q: 1, wrong: 0 },
    haven: { f: 210, g: 0.013, air: 340, ag: 0.012, q: 1.4, wrong: 0 },
    citadel: { f: 320, g: 0.008, air: 880, ag: 0.008, q: 4, wrong: 0 },
    quarry: { f: 96, g: 0.016, air: 140, ag: 0.02, q: 0.8, wrong: 0 },
    rust: { f: 150, g: 0.016, air: 190, ag: 0.018, q: 1.1, wrong: 0 },
    road: { f: 120, g: 0.012, air: 260, ag: 0.01, q: 0.9, wrong: 0 },
    dark: { f: 58, g: 0.018, air: 70, ag: 0.02, q: 0.6, wrong: 0.004 },
    spire: { f: 66, g: 0.011, air: 90, ag: 0.022, q: 8, wrong: 0.012 },
  }[mode];
  const t = ctx.currentTime;
  bedFilter.frequency.linearRampToValueAtTime(tone.f, t + 0.4);
  bedGain.gain.linearRampToValueAtTime(tone.g, t + 0.4);
  airFilter.frequency.linearRampToValueAtTime(Math.max(40, tone.air), t + 0.4);
  airFilter.Q.linearRampToValueAtTime(tone.q, t + 0.4);
  airGain.gain.linearRampToValueAtTime(tone.ag, t + 0.4);
  wrong.frequency.linearRampToValueAtTime(mode === "spire" ? 77.1 : 70, t + 0.6);
  wrongGain.gain.linearRampToValueAtTime(tone.wrong, t + 0.5);
}
