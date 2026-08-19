#!/usr/bin/env node
/** Themed SVG graphs for fx-50FH II FMLA pages. Run: node tools/make-fmla-graphs.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "assets", "img", "fmla");
const FMLA = path.join(ROOT, "data", "models", "fx-50fh-ii", "sections", "fmla");
const MARK = "fmla-graph";

function writeSvg(name, xml) {
  fs.mkdirSync(IMG, { recursive: true });
  fs.writeFileSync(path.join(IMG, name), xml.replace(/\n{3,}/g, "\n"), "utf8");
}

function svg(id, title, desc, inner, h = 340) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${h}" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${esc(title)}</title>
  <desc id="${id}-desc">${esc(desc)}</desc>
  ${inner}
</svg>
`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function plot(fn, x0, x1, X, Y, n = 180) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    pts.push((pts.length ? "L" : "M") + X(x).toFixed(2) + "," + Y(y).toFixed(2));
  }
  return pts.join(" ");
}

function shadeUnder(fn, x0, x1, X, Y, base, n = 80) {
  let d = "M" + X(x0).toFixed(2) + "," + base;
  d += " L" + X(x0).toFixed(2) + "," + Y(fn(x0)).toFixed(2);
  for (let i = 1; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    d += " L" + X(x).toFixed(2) + "," + Y(fn(x)).toFixed(2);
  }
  d += " L" + X(x1).toFixed(2) + "," + base + " Z";
  return d;
}

const A = "var(--accent)";
const AS = "var(--accent-soft)";
const TM = "var(--text-muted)";
const TX = "var(--text)";
const BG = "var(--bg)";

function axisX(x1, x2, y) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${TM}" stroke-width="1.2"/>`;
}
function axisY(x, y1, y2) {
  return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${TM}" stroke-width="1.2"/>`;
}
function tick(x, y, label, dy = 18) {
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${x}" y="${y + dy}" text-anchor="middle">${esc(label)}</text>`;
}

function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function makeNormal(kind) {
  const t = 1;
  const x0 = -3.6;
  const x1 = 3.6;
  const ymax = normalPdf(0);
  const BASE = 250;
  const X = (x) => 64 + ((x - x0) / (x1 - x0)) * 632;
  const Y = (y) => 40 + (1 - y / ymax) * 210;
  const curve = plot(normalPdf, x0, x1, X, Y, 220);
  const left = kind === "p" ? x0 : 0;
  const right = t;
  const band = shadeUnder(normalPdf, left, right, X, Y, BASE, 100);
  const label = kind === "p" ? "P(1) ≈ 0.8413" : "Q(1) ≈ 0.3413";
  const ticks = [-2, -1, 0, 1, 2]
    .map((v) => tick(X(v).toFixed(2), BASE, String(v)))
    .join("\n  ");
  return svg(
    kind === "p" ? "fmla04" : "fmla05",
    kind === "p"
      ? "Standard normal curve with CDF P(1) shaded"
      : "Standard normal curve with Q(1) shaded from 0 to x",
    kind === "p"
      ? "Bell curve centred at 0. The shaded area from the left up to x = 1 is P(1), about 0.8413."
      : "Bell curve centred at 0. The shaded area from 0 to x = 1 is Q(1), about 0.3413.",
    `
  <path d="${band}" fill="${A}" fill-opacity="0.18"/>
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4" stroke-linejoin="round"/>
  ${axisX(64, 696, BASE)}
  <line x1="${X(0).toFixed(2)}" y1="40" x2="${X(0).toFixed(2)}" y2="${BASE}" stroke="${A}" stroke-width="1.3"/>
  <line x1="${X(t).toFixed(2)}" y1="${Y(normalPdf(t)).toFixed(2)}" x2="${X(t).toFixed(2)}" y2="${BASE}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="4 3"/>
  ${ticks}
  <text x="${X(0).toFixed(2)}" y="28" text-anchor="middle" fill="${TX}">0</text>
  <text x="${X(t).toFixed(2)}" y="${(Y(normalPdf(t)) - 10).toFixed(2)}" text-anchor="middle">x = 1</text>
  <text x="${((X(left) + X(right)) / 2).toFixed(2)}" y="175" text-anchor="middle" fill="${AS}">${esc(label)}</text>
`
  );
}

function makeQuadratic() {
  const fn = (x) => x * x - 7 * x + 12;
  const x0 = 1.4;
  const x1 = 5.6;
  const ymin = -1.4;
  const ymax = 6.2;
  const BASE = 250;
  const X = (x) => 64 + ((x - x0) / (x1 - x0)) * 632;
  const Y = (y) => 40 + (1 - (y - ymin) / (ymax - ymin)) * 210;
  const y0 = Y(0);
  const curve = plot(fn, x0, x1, X, Y, 200);
  const r3 = X(3);
  const r4 = X(4);
  return svg(
    "fmla01",
    "Parabola y = x² − 7x + 12 crossing the x-axis at 3 and 4",
    "The curve is the graph of the example x² − 7x + 12 = 0. It crosses the axis at the two real roots 3 and 4.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4" stroke-linejoin="round"/>
  ${axisX(64, 696, y0)}
  ${axisY(X(1.5), 40, BASE)}
  ${tick(r3.toFixed(2), y0, "3")}
  ${tick(r4.toFixed(2), y0, "4")}
  ${tick(X(2).toFixed(2), y0, "2")}
  ${tick(X(5).toFixed(2), y0, "5")}
  <circle cx="${r3.toFixed(2)}" cy="${y0.toFixed(2)}" r="4.2" fill="${A}" stroke="${BG}" stroke-width="1.5"/>
  <circle cx="${r4.toFixed(2)}" cy="${y0.toFixed(2)}" r="4.2" fill="${A}" stroke="${BG}" stroke-width="1.5"/>
  <text x="${r3.toFixed(2)}" y="${(y0 - 14).toFixed(2)}" text-anchor="middle" fill="${TX}">x = 3</text>
  <text x="${r4.toFixed(2)}" y="${(y0 - 14).toFixed(2)}" text-anchor="middle" fill="${TX}">x = 4</text>
  <text x="96" y="56" fill="${AS}">y = x² − 7x + 12</text>
`
  );
}

function makeCosine() {
  const A0 = [150, 292];
  const B = [150 + 7 * 42, 292];
  const C = [150 + 5 * 42 * 0.5, 292 - 5 * 42 * Math.sin(Math.PI / 3)];
  const poly = `${A0[0]},${A0[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`;
  const midAB = [(A0[0] + B[0]) / 2, (A0[1] + B[1]) / 2 + 22];
  const midAC = [(A0[0] + C[0]) / 2 - 18, (A0[1] + C[1]) / 2];
  const midBC = [(B[0] + C[0]) / 2 + 16, (B[1] + C[1]) / 2];
  return svg(
    "fmla02",
    "Triangle with included angle A = 60° and sides b = 5, c = 7",
    "Law of cosines: side a opposite angle A is found from sides b and c and the included angle 60 degrees.",
    `
  <polygon points="${poly}" fill="${A}" fill-opacity="0.12" stroke="${A}" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="${A0[0] - 18}" y="${A0[1] + 6}" fill="${TX}">A</text>
  <text x="${B[0] + 10}" y="${B[1] + 6}" fill="${TX}">B</text>
  <text x="${C[0] - 6}" y="${C[1] - 10}" fill="${TX}">C</text>
  <text x="${midAB[0]}" y="${midAB[1]}" text-anchor="middle">c = 7</text>
  <text x="${midAC[0]}" y="${midAC[1]}" text-anchor="end">b = 5</text>
  <text x="${midBC[0]}" y="${midBC[1]}" >a ≈ 6.24</text>
  <text x="${A0[0] + 38}" y="${A0[1] - 14}" fill="${AS}">60°</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">Find side a opposite A</text>
`,
    360
  );
}

function makeHeron() {
  const A0 = [200, 292];
  const B = [200 + 4 * 55, 292];
  const C = [200, 292 - 3 * 55];
  return svg(
    "fmla03",
    "3-4-5 right triangle with area 6",
    "Heron's formula on sides 3, 4, 5 gives semi-perimeter 6 and area 6. The shaded interior is that area.",
    `
  <polygon points="${A0[0]},${A0[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" fill="${A}" fill-opacity="0.18" stroke="${A}" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="${(A0[0] + B[0]) / 2}" y="${A0[1] + 24}" text-anchor="middle">4</text>
  <text x="${A0[0] - 18}" y="${(A0[1] + C[1]) / 2}" text-anchor="end">3</text>
  <text x="${(B[0] + C[0]) / 2 + 14}" y="${(B[1] + C[1]) / 2}">5</text>
  <text x="${A0[0] + 70}" y="${A0[1] - 70}" fill="${AS}">area = 6</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">Sides 3, 4, 5</text>
`,
    360
  );
}

function makeCoulomb() {
  return svg(
    "fmla06",
    "Two positive point charges pushing apart",
    "Coulomb's law: like charges repel. The force on each charge is equal in size and opposite in direction, and it gets smaller as r grows.",
    `
  <circle cx="220" cy="170" r="28" fill="${A}" fill-opacity="0.15" stroke="${A}" stroke-width="2"/>
  <circle cx="500" cy="170" r="28" fill="${A}" fill-opacity="0.15" stroke="${A}" stroke-width="2"/>
  <text x="220" y="176" text-anchor="middle" fill="${TX}">q₁</text>
  <text x="500" y="176" text-anchor="middle" fill="${TX}">q₂</text>
  <line x1="260" y1="170" x2="460" y2="170" stroke="${TM}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="360" y="156" text-anchor="middle">r</text>
  <path d="M160 170 L120 170" stroke="${AS}" stroke-width="2.2" marker-end="url(#arr)"/>
  <path d="M560 170 L600 170" stroke="${AS}" stroke-width="2.2"/>
  <polygon points="600,164 616,170 600,176" fill="${AS}"/>
  <polygon points="120,164 104,170 120,176" fill="${AS}"/>
  <text x="110" y="150" fill="${AS}">F</text>
  <text x="610" y="150" fill="${AS}">F</text>
  <text x="360" y="250" text-anchor="middle">Like charges push apart. Bigger r → smaller F.</text>
  <defs></defs>
`
  );
}

function makeResistance() {
  return svg(
    "fmla07",
    "A conductor of length ℓ and cross-section S",
    "Resistance grows with length ℓ and shrinks when the cross-section S is wider. Resistivity ρ is a property of the material.",
    `
  <rect x="160" y="140" width="400" height="56" fill="${A}" fill-opacity="0.12" stroke="${A}" stroke-width="2"/>
  <line x1="160" y1="214" x2="560" y2="214" stroke="${TM}" stroke-width="1.2"/>
  <line x1="160" y1="208" x2="160" y2="220" stroke="${TM}"/>
  <line x1="560" y1="208" x2="560" y2="220" stroke="${TM}"/>
  <text x="360" y="238" text-anchor="middle">ℓ</text>
  <rect x="574" y="148" width="36" height="40" fill="none" stroke="${AS}" stroke-width="1.6"/>
  <text x="592" y="130" text-anchor="middle">S</text>
  <text x="360" y="88" text-anchor="middle" fill="${TX}">Longer wire → more R. Thicker wire → less R.</text>
`
  );
}

function makeMagnetic() {
  const xs = [];
  for (let x = 180; x <= 540; x += 36) {
    for (let y = 90; y <= 210; y += 36) {
      xs.push(`<text x="${x}" y="${y}" text-anchor="middle" fill="${TM}" font-size="14">×</text>`);
    }
  }
  return svg(
    "fmla08",
    "Current-carrying wire in a magnetic field pointing into the page",
    "B into the page (crosses), current I along the wire, force F perpendicular to both.",
    `
  ${xs.join("\n  ")}
  <line x1="140" y1="240" x2="580" y2="240" stroke="${A}" stroke-width="3.2"/>
  <polygon points="580,234 598,240 580,246" fill="${A}"/>
  <text x="360" y="268" text-anchor="middle">I</text>
  <path d="M360 240 L360 180" stroke="${AS}" stroke-width="2.2"/>
  <polygon points="354,180 360,164 366,180" fill="${AS}"/>
  <text x="378" y="188" fill="${AS}">F</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">×  means B into the page</text>
  <text x="360" y="328" text-anchor="middle">F is largest when the wire is perpendicular to B (sin θ = 1)</text>
`
  );
}

function makeRc() {
  const V = 1;
  const RC = 1;
  const fn = (t) => V * Math.exp(-t / RC);
  const x0 = 0;
  const x1 = 5;
  const BASE = 250;
  const X = (t) => 64 + (t / x1) * 632;
  const Y = (v) => 40 + (1 - v / 1.05) * 210;
  const curve = plot(fn, x0, x1, X, Y, 160);
  const tRC = X(1);
  const vRC = Y(fn(1));
  return svg(
    "fmla09",
    "Resistor voltage decaying from V in an RC series circuit",
    "VR starts at the applied voltage V and falls toward 0. After one time constant RC it has reached about 37% of V.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axisX(64, 696, BASE)}
  ${axisY(64, 40, BASE)}
  <line x1="64" y1="${Y(V)}" x2="696" y2="${Y(V)}" stroke="${AS}" stroke-width="1.1" stroke-dasharray="4 3"/>
  <line x1="${tRC.toFixed(2)}" y1="${vRC.toFixed(2)}" x2="${tRC.toFixed(2)}" y2="${BASE}" stroke="${AS}" stroke-width="1.1" stroke-dasharray="4 3"/>
  ${tick(X(0).toFixed(2), BASE, "0")}
  ${tick(X(1).toFixed(2), BASE, "RC")}
  ${tick(X(2).toFixed(2), BASE, "2 RC")}
  ${tick(X(5).toFixed(2), BASE, "5 RC")}
  <text x="80" y="${Y(V) - 8}" fill="${AS}">V</text>
  <circle cx="${tRC.toFixed(2)}" cy="${vRC.toFixed(2)}" r="4" fill="${A}" stroke="${BG}" stroke-width="1.5"/>
  <text x="${tRC + 10}" y="${vRC - 8}" fill="${TX}">≈ 0.37 V</text>
  <text x="120" y="56" fill="${AS}">VR</text>
  <text x="690" y="272" text-anchor="end">t</text>
`
  );
}

function makeGain() {
  return svg(
    "fmla10",
    "Voltage gain of 20 dB when Vout is ten times Vin",
    "Example: Vin = 0.1 V and Vout = 1 V. The ratio is 10, so G = 20 log10(10) = 20 dB.",
    `
  <rect x="160" y="150" width="70" height="100" fill="${A}" fill-opacity="0.15" stroke="${A}" stroke-width="2"/>
  <rect x="490" y="50" width="70" height="200" fill="${A}" fill-opacity="0.22" stroke="${A}" stroke-width="2"/>
  <text x="195" y="270" text-anchor="middle">Vin</text>
  <text x="195" y="140" text-anchor="middle">0.1 V</text>
  <text x="525" y="270" text-anchor="middle">Vout</text>
  <text x="525" y="40" text-anchor="middle">1 V</text>
  <path d="M250 200 L470 140" stroke="${AS}" stroke-width="1.6"/>
  <text x="360" y="150" text-anchor="middle" fill="${AS}">× 10  →  20 dB</text>
`
  );
}

function makeZvsF(kind) {
  const R = 10;
  const L = 0.1;
  const C = 1e-6;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const zSeries = (f) => {
    const w = 2 * Math.PI * f;
    const x = w * L - 1 / (w * C);
    return Math.sqrt(R * R + x * x);
  };
  const zPar = (f) => {
    const w = 2 * Math.PI * f;
    const g = 1 / R;
    const b = w * C - 1 / (w * L);
    return 1 / Math.sqrt(g * g + b * b);
  };
  const fn = kind === "series" ? zSeries : zPar;
  const fMin = 80;
  const fMax = 2000;
  const samples = [];
  for (let i = 0; i <= 200; i++) {
    const f = fMin + ((fMax - fMin) * i) / 200;
    samples.push(fn(f));
  }
  const zMax = Math.max(...samples) * 1.05;
  const BASE = 250;
  const X = (f) => 64 + ((f - fMin) / (fMax - fMin)) * 632;
  const Y = (z) => 40 + (1 - z / zMax) * 210;
  const curve = plot(fn, fMin, fMax, X, Y, 220);
  const title =
    kind === "series"
      ? "Series RLC impedance vs frequency, dip at resonance"
      : "Parallel RLC impedance vs frequency, peak at resonance";
  const call = kind === "series" ? "Z is smallest at f₀ (≈ R)" : "Z is largest at f₀";
  return svg(
    kind === "series" ? "fmla11" : "fmla12",
    title,
    title + ". Example R = 10 Ω, L = 0.1 H, C = 1 µF, so f0 is about 503 Hz.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axisX(64, 696, BASE)}
  ${axisY(64, 40, BASE)}
  <line x1="${X(f0).toFixed(2)}" y1="40" x2="${X(f0).toFixed(2)}" y2="${BASE}" stroke="${AS}" stroke-width="1.1" stroke-dasharray="4 3"/>
  ${tick(X(fMin).toFixed(2), BASE, "80 Hz")}
  ${tick(X(f0).toFixed(2), BASE, "f₀")}
  ${tick(X(fMax).toFixed(2), BASE, "2 kHz")}
  <text x="88" y="56" fill="${AS}">Z</text>
  <text x="${X(f0).toFixed(2)}" y="28" text-anchor="middle" fill="${TX}">${esc(call)}</text>
`
  );
}

function makeOscillation() {
  const fn = (t) => Math.sin(2 * Math.PI * t);
  const BASE = 250;
  const mid = 145;
  const X = (t) => 64 + (t / 2) * 632;
  const Y = (y) => mid - y * 90;
  const curve = plot(fn, 0, 2, X, Y, 200);
  return svg(
    "fmla13",
    "One full oscillation of an LC tank",
    "The current (or voltage) repeats every T = 2π√(LC). Two periods are shown.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axisX(64, 696, mid)}
  ${axisY(64, 40, BASE)}
  ${tick(X(0).toFixed(2), mid, "0")}
  ${tick(X(1).toFixed(2), mid, "T")}
  ${tick(X(2).toFixed(2), mid, "2T")}
  <text x="690" y="272" text-anchor="end">t</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">One cycle every T = 2π √(LC)</text>
`
  );
}

function makeDrop() {
  const g = 9.80665;
  const fn = (t) => 0.5 * g * t * t;
  const x1 = 2;
  const ymax = fn(x1);
  const BASE = 250;
  const X = (t) => 64 + (t / x1) * 632;
  const Y = (s) => 40 + (s / ymax) * 210;
  const curve = plot(fn, 0, x1, X, Y, 120);
  return svg(
    "fmla14",
    "Drop distance vs time from rest, ROM g = 9.80665",
    "Starting from rest (v0 = 0), distance fallen grows with t squared. At t = 2 s, s ≈ 19.61 m.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axisX(64, 696, 40)}
  ${axisY(64, 40, BASE)}
  <line x1="${X(0).toFixed(2)}" y1="34" x2="${X(0).toFixed(2)}" y2="46" stroke="${TM}" stroke-width="1"/>
  <text x="${X(0).toFixed(2)}" y="28" text-anchor="middle">0</text>
  <line x1="${X(1).toFixed(2)}" y1="34" x2="${X(1).toFixed(2)}" y2="46" stroke="${TM}" stroke-width="1"/>
  <text x="${X(1).toFixed(2)}" y="28" text-anchor="middle">1 s</text>
  <line x1="${X(2).toFixed(2)}" y1="34" x2="${X(2).toFixed(2)}" y2="46" stroke="${TM}" stroke-width="1"/>
  <text x="${X(2).toFixed(2)}" y="28" text-anchor="middle">2 s</text>
  <circle cx="${X(2).toFixed(2)}" cy="${Y(ymax).toFixed(2)}" r="4" fill="${A}" stroke="${BG}" stroke-width="1.5"/>
  <text x="${X(2) - 8}" y="${Y(ymax) - 10}" text-anchor="end" fill="${TX}">s ≈ 19.61 m</text>
  <text x="88" y="270" fill="${AS}">s down</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">v₀ = 0  (dropped, not thrown)</text>
`
  );
}

function makePendulum() {
  return svg(
    "fmla15",
    "Simple pendulum of length L",
    "A small bob on a string of length L. For small swings the period depends only on L and g.",
    `
  <circle cx="360" cy="48" r="5" fill="${A}"/>
  <line x1="360" y1="48" x2="360" y2="250" stroke="${A}" stroke-width="2"/>
  <line x1="360" y1="48" x2="248" y2="230" stroke="${AS}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <line x1="360" y1="48" x2="472" y2="230" stroke="${AS}" stroke-width="1.6" stroke-dasharray="4 3"/>
  <path d="M248 230 A160 160 0 0 0 472 230" fill="none" stroke="${TM}" stroke-width="1.1"/>
  <circle cx="360" cy="250" r="16" fill="${A}" fill-opacity="0.2" stroke="${A}" stroke-width="2"/>
  <text x="378" y="150">L</text>
  <text x="360" y="300" text-anchor="middle">small angle → T = 2π √(L/g)</text>
`,
    360
  );
}

function makeSpring() {
  const coils = [];
  let x = 200;
  for (let i = 0; i < 8; i++) {
    coils.push(`${x},150 ${x + 12},120 ${x + 24},180 ${x + 36},150`);
    x += 36;
  }
  return svg(
    "fmla16",
    "Mass on a spring",
    "A mass m on a spring of stiffness k oscillates. Stiffer k or smaller m means a shorter period.",
    `
  <rect x="120" y="90" width="80" height="140" fill="${TM}" fill-opacity="0.15" stroke="${TM}" stroke-width="1.4"/>
  <polyline points="200,150 ${coils.join(" ")}" fill="none" stroke="${A}" stroke-width="2.2"/>
  <rect x="488" y="122" width="70" height="56" fill="${A}" fill-opacity="0.18" stroke="${A}" stroke-width="2"/>
  <text x="523" y="156" text-anchor="middle" fill="${TX}">m</text>
  <text x="340" y="108" fill="${AS}">k</text>
  <text x="360" y="250" text-anchor="middle">Heavier m → slower. Stiffer k → faster.</text>
`
  );
}

function makeDoppler() {
  const rings = [40, 70, 100, 130]
    .map((r, i) => {
      const cx = 280 + i * 18;
      return `<circle cx="${cx}" cy="160" r="${r}" fill="none" stroke="${A}" stroke-width="1.6" opacity="${0.9 - i * 0.12}"/>`;
    })
    .join("\n  ");
  return svg(
    "fmla17",
    "Moving source bunches wavefronts ahead of it",
    "Source moving to the right. Wavefronts crowd in front (higher pitch) and spread behind (lower pitch).",
    `
  ${rings}
  <circle cx="352" cy="160" r="8" fill="${A}"/>
  <polygon points="368,160 396,150 396,170" fill="${AS}"/>
  <text x="420" y="164" fill="${AS}">source →</text>
  <text x="520" y="90">closer crests → higher f′</text>
  <text x="80" y="90">wider crests → lower f′</text>
  <text x="360" y="300" text-anchor="middle">Observer still, source moving right</text>
`
  );
}

function makeGas() {
  return svg(
    "fmla18",
    "Gas in a piston: P, V, T, n",
    "Ideal gas law: squeeze the volume, raise the temperature, or add moles, and the pressure changes to keep PV = nRT.",
    `
  <rect x="220" y="80" width="280" height="180" fill="none" stroke="${A}" stroke-width="2.2"/>
  <rect x="220" y="80" width="280" height="36" fill="${AS}" fill-opacity="0.25" stroke="${AS}" stroke-width="2"/>
  <line x1="360" y1="80" x2="360" y2="40" stroke="${TM}" stroke-width="1.6"/>
  <text x="360" y="32" text-anchor="middle">piston</text>
  <text x="360" y="175" text-anchor="middle" fill="${TX}">n moles, T</text>
  <text x="360" y="198" text-anchor="middle">V</text>
  <text x="520" y="175">P</text>
  <text x="360" y="300" text-anchor="middle">PV = nRT  (R from CONST)</text>
`
  );
}

function makeCentrifugal() {
  return svg(
    "fmla19",
    "Mass moving in a circle of radius r",
    "The force toward the centre has size m v² / r. Faster v or smaller r means a larger force.",
    `
  <circle cx="360" cy="160" r="110" fill="none" stroke="${A}" stroke-width="2"/>
  <circle cx="360" cy="50" r="12" fill="${A}" fill-opacity="0.2" stroke="${A}" stroke-width="2"/>
  <line x1="360" y1="160" x2="360" y2="50" stroke="${TM}" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="372" y="112">r</text>
  <text x="360" y="38" text-anchor="middle">m</text>
  <polygon points="384,48 410,42 400,62" fill="${AS}"/>
  <text x="418" y="50" fill="${AS}">v</text>
  <path d="M360 50 L360 96" stroke="${A}" stroke-width="2"/>
  <polygon points="354,96 360,110 366,96" fill="${A}"/>
  <text x="372" y="90" fill="${TX}">F</text>
  <text x="360" y="310" text-anchor="middle">F = m v² / r</text>
`,
    340
  );
}

function makeElastic() {
  const k = 1;
  const fn = (x) => 0.5 * k * x * x;
  const x0 = -2;
  const x1 = 2;
  const ymax = fn(2);
  const BASE = 250;
  const X = (x) => 64 + ((x - x0) / (x1 - x0)) * 632;
  const Y = (e) => 40 + (1 - e / ymax) * 210;
  const curve = plot(fn, x0, x1, X, Y, 140);
  return svg(
    "fmla20",
    "Elastic energy versus stretch x",
    "Energy stored in a spring is a U-shape: twice the stretch stores four times the energy. Example k = 1, so E = x²/2.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axisX(64, 696, BASE)}
  ${axisY(X(0).toFixed(2), 40, BASE)}
  ${tick(X(-2).toFixed(2), BASE, "−2")}
  ${tick(X(0).toFixed(2), BASE, "0")}
  ${tick(X(2).toFixed(2), BASE, "+2")}
  <text x="96" y="56" fill="${AS}">E</text>
  <text x="690" y="272" text-anchor="end">x</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">E = ½ k x²</text>
`
  );
}

function makeBernoulli() {
  return svg(
    "fmla21",
    "Fluid speeding up as a pipe narrows and drops",
    "Bernoulli: where the pipe is lower and narrower, speed is higher and pressure is lower. The calculator reports C = v²/2 + gz + P/ρ.",
    `
  <path d="M80 90 L300 90 L300 110 L640 180 L640 230 L300 160 L300 180 L80 180 Z" fill="${A}" fill-opacity="0.12" stroke="${A}" stroke-width="2"/>
  <polygon points="160,125 200,135 160,145" fill="${AS}"/>
  <polygon points="500,185 548,198 500,211" fill="${AS}"/>
  <text x="180" y="76">slow, high P</text>
  <text x="500" y="168">fast, lower P</text>
  <text x="110" y="204">z₁</text>
  <text x="660" y="220">z₂</text>
  <text x="360" y="300" text-anchor="middle">C = v²/2 + gz + P/ρ is constant</text>
`
  );
}

function makeStadia(kind) {
  const isH = kind === "h";
  return svg(
    isH ? "fmla22" : "fmla23",
    isH ? "Stadia elevation difference to a staff" : "Stadia horizontal distance to a staff",
    isH
      ? "A sight at angle θ to a staff of interval s. The formula turns s and θ into elevation difference h."
      : "A sight at angle θ to a staff of interval s. The formula turns s and θ into a horizontal distance D.",
    `
  <line x1="120" y1="280" x2="620" y2="280" stroke="${TM}" stroke-width="1.4"/>
  <rect x="140" y="200" width="70" height="28" fill="${A}" fill-opacity="0.15" stroke="${A}" stroke-width="1.8"/>
  <line x1="210" y1="214" x2="520" y2="120" stroke="${A}" stroke-width="2"/>
  <line x1="520" y1="70" x2="520" y2="280" stroke="${AS}" stroke-width="2.2"/>
  <line x1="508" y1="110" x2="532" y2="110" stroke="${TX}" stroke-width="1.4"/>
  <line x1="508" y1="150" x2="532" y2="150" stroke="${TX}" stroke-width="1.4"/>
  <text x="544" y="134">s</text>
  <text x="300" y="150">θ</text>
  ${
    isH
      ? `<line x1="210" y1="214" x2="520" y2="214" stroke="${TM}" stroke-dasharray="3 3"/>
  <line x1="520" y1="214" x2="520" y2="120" stroke="${TM}" stroke-dasharray="3 3"/>
  <text x="536" y="176">h</text>`
      : `<line x1="210" y1="280" x2="520" y2="280" stroke="${TM}" stroke-dasharray="3 3"/>
  <text x="360" y="300">D</text>`
  }
  <text x="360" y="40" text-anchor="middle" fill="${TX}">${isH ? "Elevation difference h from staff interval s" : "Distance D from staff interval s"}</text>
`,
    360
  );
}

writeSvg("01-quadratic.svg", makeQuadratic());
writeSvg("02-cosine.svg", makeCosine());
writeSvg("03-heron.svg", makeHeron());
writeSvg("04-normal-p.svg", makeNormal("p"));
writeSvg("05-normal-r.svg", makeNormal("q"));
writeSvg("06-coulomb.svg", makeCoulomb());
writeSvg("07-resistance.svg", makeResistance());
writeSvg("08-magnetic.svg", makeMagnetic());
writeSvg("09-rc-voltage.svg", makeRc());
writeSvg("10-voltage-gain.svg", makeGain());
writeSvg("11-lrc-series.svg", makeZvsF("series"));
writeSvg("12-lrc-parallel.svg", makeZvsF("parallel"));
writeSvg("13-oscillation.svg", makeOscillation());
writeSvg("14-drop.svg", makeDrop());
writeSvg("15-pendulum.svg", makePendulum());
writeSvg("16-spring.svg", makeSpring());
writeSvg("17-doppler.svg", makeDoppler());
writeSvg("18-gas.svg", makeGas());
writeSvg("19-centrifugal.svg", makeCentrifugal());
writeSvg("20-elastic.svg", makeElastic());
writeSvg("21-bernoulli.svg", makeBernoulli());
writeSvg("22-stadia-h.svg", makeStadia("h"));
writeSvg("23-stadia-d.svg", makeStadia("d"));

const figures = {
  "01-quadratic": {
    after: "first-example-lines",
    blocks: [
      {
        type: "figure",
        mark: MARK,
        svg: "img/fmla/01-quadratic.svg",
        caption:
          "Same example: y = x² − 7x + 12. The curve hits the axis at the two roots the calculator prints, x = 3 and x = 4.",
      },
    ],
  },
  "02-cosine": {
    caption:
      "Example: b = 5, c = 7, included angle A = 60°. Side a opposite A is about 6.24.",
    explain:
      "You already know two sides and the angle between them. The cosine theorem finds the third side — the one sitting opposite that angle.",
    example: [
      "b = 5, c = 7, A = 60°",
      "a² = 25 + 49 − 2·5·7·cos 60°",
      "a² = 74 − 35 = 39",
      "a = {sqrt:39} ≈ 6.245",
    ],
  },
  "03-heron": {
    caption:
      "Example: sides 3, 4, 5. Semi-perimeter s = 6, so the shaded area is 6 — the well-known right triangle.",
    explain:
      "If you only have the three side lengths (no angle), Heron still gives the area. The picture is that filled-in triangle.",
    example: [
      "a = 3, b = 4, c = 5",
      "s = (3+4+5)/2 = 6",
      "Area = {sqrt:6(6−3)(6−4)(6−5)} = {sqrt:36} = 6",
    ],
  },
  "04-normal-p": {
    caption:
      "Standard bell (mean 0, spread 1). P(x) is the shaded area from the far left up to x. Here x = 1, so P(1) ≈ 0.8413 — about 84% of the hill sits to the left of 1.",
    explain:
      "Picture a hill centred at 0. P(x) answers: “starting from the far left, how much of the hill have I covered when I stop at x?” A larger x covers more of the hill, so P(x) is closer to 1.",
    example: ["x = 1", "P(1) ≈ 0.8413"],
  },
  "05-normal-r": {
    caption:
      "Same bell as NormalP. Q(x) is the shaded area from 0 to x. Here x = 1, so Q(1) ≈ 0.3413 = P(0 ≤ Z ≤ 1).",
    explain:
      "Q(x) is the slab between the mean (0) and x. For x = 1 that slab is about 0.3413. NormalP is the whole left side including this slab: P(1) = 0.5 + Q(1) ≈ 0.8413.",
    example: [
      "x = 1",
      "Q(1) ≈ 0.3413",
      "check: P(1) − 0.5 = 0.8413 − 0.5 = 0.3413",
    ],
  },
  "06-coulomb": {
    caption:
      "Two like charges. Each feels a force F along the line joining them. Double the gap r and F falls to one quarter.",
    explain:
      "Point charges push or pull along the line between them. Same sign → push apart (as drawn). Opposite signs → pull together. The force shrinks quickly as they move apart because of r² in the denominator.",
  },
  "07-resistance": {
    caption:
      "A wire of length ℓ and end-area S. Longer ℓ raises R; a fatter S lowers R. ρ is “how reluctant this metal is.”",
    explain:
      "Think of a corridor: a long thin corridor is harder to walk through than a short wide one. That is R = ρ ℓ / S.",
  },
  "08-magnetic": {
    caption:
      "Crosses are B into the page. Current I runs along the wire. Force F is at right angles to both. F is largest when sin θ = 1.",
    explain:
      "A current in a magnetic field feels a sideways shove. The sin θ factor is 1 when the wire is perpendicular to B, and 0 when it runs parallel to B (no shove).",
  },
  "09-rc-voltage": {
    caption:
      "Resistor voltage decaying from V. At t = RC, VR has fallen to about 37% of V. Capacitor voltage would be the complementary curve V(1 − e^(−t/RC)).",
    explain:
      "At the instant the switch closes, all of V is across R. Current then dies away as the capacitor fills, so VR falls toward 0. The time unit is RC (resistance × capacitance).",
    example: [
      "At t = 0, VR = V",
      "At t = RC, VR ≈ 0.37 V",
      "At t = 5 RC, VR ≈ 0.007 V",
    ],
  },
  "10-voltage-gain": {
    caption:
      "Example: Vin = 0.1 V, Vout = 1 V. The output is 10 times the input, which is 20 dB.",
    explain:
      "Voltage gain in decibels is a compressed way to write a ratio. A ratio of 10 is 20 dB; a ratio of 100 is 40 dB. If Vout is smaller than Vin, G is negative (a loss).",
    example: [
      "Output E′ = 30 V, input E = 12 V",
      "30 EXE 12 EXE → G = 7.9588 dB",
    ],
  },
  "11-lrc-series": {
    caption:
      "Example R = 10 Ω, L = 0.1 H, C = 1 µF. Series impedance Z is smallest at the resonant frequency f₀ ≈ 503 Hz, where Z ≈ R.",
    explain:
      "R, L, and C sit in one line. At most frequencies they fight each other and Z is large. At one special frequency (resonance) the L and C parts cancel, and only R remains.",
  },
  "12-lrc-parallel": {
    caption:
      "Same R, L, C as the series page, but in parallel. Now Z is largest at f₀ — the opposite dip/peak from series.",
    explain:
      "In parallel the three parts share the same voltage. At resonance the L and C branches cancel, so very little current flows and Z looks large.",
  },
  "13-oscillation": {
    caption:
      "The LC circuit rings: current (or voltage) repeats every T = 2π √(LC). Two full cycles are drawn.",
    explain:
      "Energy sloshes between the inductor and the capacitor. The time for one slosh is T. A larger L or C makes a slower ring (lower frequency f = 1/T).",
  },
  "14-drop": {
    caption:
      "Dropped from rest (v₀ = 0), ROM g = 9.80665. Distance down grows with t². At 2 s the drop is about 19.61 m.",
    explain:
      "If you let go (no throw), v₀ is 0 and the formula collapses to s = ½ g t². Time has more effect than it first looks: double the time, four times the distance.",
    example: [
      "v₁ = 2 m/s, t = 4 s (ROM g = 9.80665)",
      "S = 2×4 + ½×9.80665×16 = 86.4532 m",
    ],
  },
  "15-pendulum": {
    caption:
      "A bob on a string of length L. For small swings, only L and g set the period — the mass does not appear.",
    explain:
      "A longer playground swing takes longer to come back. That is T = 2π √(L/g). The dashed positions are the ends of a small arc.",
  },
  "16-spring": {
    caption:
      "Mass m on a spring of stiffness k. Heavier mass → slower bobbing. Stiffer spring → faster bobbing.",
    explain:
      "Same idea as the pendulum, but the “restoring” piece is the spring. T = 2π √(m/k).",
  },
  "17-doppler": {
    caption:
      "Source moving right. Wavefronts bunch in front (higher pitch) and spread behind (lower pitch).",
    explain:
      "If the source runs toward you, more waves hit your ear each second (higher f). If it runs away, fewer waves arrive (lower f).",
  },
  "18-gas": {
    caption:
      "Gas trapped under a piston. Push the piston (smaller V), heat it (larger T), or add moles n, and P changes so that PV = nRT.",
    explain:
      "Four numbers describe the trapped gas: pressure, volume, amount, temperature. Fix three and the fourth is determined. R is the gas constant from CONST.",
  },
  "19-centrifugal": {
    caption:
      "Mass m on a circle of radius r at speed v. The inward force is m v² / r — faster or tighter means a harder pull.",
    explain:
      "To stay on a circle the mass must be pulled toward the centre. Double the speed and that pull becomes four times as large.",
  },
  "20-elastic": {
    caption:
      "Energy stored versus stretch x (example K = 1). The U-shape means twice the stretch stores four times the energy.",
    explain:
      "A stretched or compressed spring holds energy you can get back. U = ½ K x². x = 0 (unstretched) holds nothing.",
  },
  "21-bernoulli": {
    caption:
      "The pipe drops and narrows. Fluid speeds up and pressure falls. The calculator reports C = v²/2 + gz + P/ρ, which stays the same along the flow.",
    explain:
      "For a steady incompressible flow, height, speed, and pressure trade off. Low and narrow → fast and lower P.",
  },
  "22-stadia-h": {
    caption:
      "Sight onto a staff. The interval s between the two stadia hairs, with elevation angle θ, is turned into elevation difference h = Ks sinθ cosθ + C sinθ.",
    explain:
      "Surveying: look through the instrument at a vertical staff. K and C are instrument constants; s and θ are what you read.",
  },
  "23-stadia-d": {
    caption:
      "Same sight as the height formula, but the result is the horizontal distance D to the staff.",
    explain:
      "Same reading s and θ, different combination of sin/cos, so you get distance along the ground instead of height.",
  },
};

function stripMarked(body) {
  return (body || []).filter((b) => b.mark !== MARK);
}

function figureBlock(slug, cap) {
  return {
    type: "figure",
    mark: MARK,
    svg: `img/fmla/${slug}.svg`,
    caption: cap,
  };
}

function patchPage(slug, spec) {
  const file = path.join(FMLA, `${slug}.json`);
  const page = JSON.parse(fs.readFileSync(file, "utf8"));
  page.body = stripMarked(page.body);

  const fig = spec.blocks
    ? spec.blocks
    : [
        spec.explain ? { type: "p", mark: MARK, text: spec.explain } : null,
        figureBlock(slug, spec.caption),
      ].filter(Boolean);

  if (spec.after === "first-example-lines") {
    const idx = page.body.findIndex(
      (b) => b.type === "lines" && String(b.lead || "").includes("x² − 7x + 12")
    );
    page.body.splice(idx + 1, 0, ...fig);
  } else {
    const idx = page.body.findIndex((b) => b.type === "formula");
    page.body.splice(idx + 1, 0, ...fig);
  }

  if (spec.example) {
    const h2 = page.body.findIndex((b) => b.type === "h2" && /example/i.test(b.text || ""));
    if (h2 >= 0) {
      const exampleBlock = {
        type: "lines",
        mark: MARK,
        items: spec.example,
      };
      const next = page.body[h2 + 1];
      if (next && (next.type === "ol" || next.type === "lines")) {
        page.body.splice(h2 + 1, 1, exampleBlock);
      } else {
        page.body.splice(h2 + 1, 0, exampleBlock);
      }
    }
  }

  if (slug === "04-normal-p" && !page.related.includes("fmla/05-normal-r")) {
    page.related = ["fmla/05-normal-r", "fmla"];
  }
  if (slug === "05-normal-r" && !page.related.includes("fmla/04-normal-p")) {
    page.related = ["fmla/04-normal-p", "fmla"];
  }
  if (slug === "11-lrc-series" && !page.related.includes("fmla/12-lrc-parallel")) {
    page.related = ["fmla/12-lrc-parallel", "fmla/13-oscillation", "fmla"];
  }
  if (slug === "12-lrc-parallel" && !page.related.includes("fmla/11-lrc-series")) {
    page.related = ["fmla/11-lrc-series", "fmla/13-oscillation", "fmla"];
  }

  fs.writeFileSync(file, JSON.stringify(page, null, 2) + "\n", "utf8");
}

for (const [slug, spec] of Object.entries(figures)) {
  patchPage(slug, spec);
}

console.log("Wrote 23 FMLA graphs under", IMG);
