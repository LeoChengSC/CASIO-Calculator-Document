#!/usr/bin/env node
/** Themed SVGs unique to fx-82AU PLUS II. Run: node tools/make-fx82-graphs.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "assets", "img", "fx82");

const A = "var(--accent)";
const AS = "var(--accent-soft)";
const TM = "var(--text-muted)";
const TX = "var(--text)";
const BG = "var(--bg)";

function writeSvg(name, xml) {
  fs.mkdirSync(IMG, { recursive: true });
  fs.writeFileSync(path.join(IMG, name), xml.replace(/\n{3,}/g, "\n"), "utf8");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function svg(id, title, desc, inner, h = 340) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${h}" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${esc(title)}</title>
  <desc id="${id}-desc">${esc(desc)}</desc>
  ${inner}
</svg>
`;
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

function make1varMean() {
  const LEFT = 80;
  const RIGHT = 640;
  const Y = 170;
  const x0 = 10;
  const x1 = 30;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const pts = [15, 18, 22, 25];
  const mean = 20;
  const ticks = [10, 15, 18, 20, 22, 25, 30]
    .map((v) => {
      const xv = X(v);
      const isMean = v === mean;
      return `<line x1="${xv.toFixed(1)}" y1="${Y}" x2="${xv.toFixed(1)}" y2="${Y + (isMean ? 10 : 6)}" stroke="${isMean ? A : TM}" stroke-width="${isMean ? 1.6 : 1}"/>
  <text x="${xv.toFixed(1)}" y="${Y + 24}" text-anchor="middle" fill="${isMean ? A : TX}">${v}</text>`;
    })
    .join("\n  ");
  const dots = pts
    .map((v) => `<circle cx="${X(v).toFixed(1)}" cy="${Y}" r="6" fill="${A}" stroke="${BG}" stroke-width="1.8"/>`)
    .join("\n  ");
  const mx = X(mean);
  return svg(
    "fx82-1var-mean",
    "Mean of 15, 18, 22, 25 on a number line",
    "Four scores sit at 15, 18, 22 and 25. Their arithmetic mean is 20.",
    `
  <line x1="${LEFT}" y1="${Y}" x2="${RIGHT}" y2="${Y}" stroke="${TM}" stroke-width="1.4"/>
  ${ticks}
  ${dots}
  <line x1="${mx.toFixed(1)}" y1="${Y - 52}" x2="${mx.toFixed(1)}" y2="${Y + 10}" stroke="${A}" stroke-width="1.8"/>
  <polygon points="${mx.toFixed(1)},${Y - 62} ${mx - 8},${Y - 48} ${mx + 8},${Y - 48}" fill="${A}"/>
  <text x="${mx.toFixed(1)}" y="${Y - 72}" text-anchor="middle" fill="${TX}">x̄ = 20</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">1-VAR example: 15, 18, 22, 25</text>
  <text x="360" y="292" text-anchor="middle" fill="${AS}">Sum = 80, n = 4, mean = 80 ÷ 4 = 20</text>
`,
    320
  );
}

function make1varBox() {
  const LEFT = 80;
  const RIGHT = 640;
  const Y = 170;
  const x0 = 12;
  const x1 = 28;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const min = 15;
  const q1 = 16.5;
  const med = 20;
  const q3 = 23.5;
  const max = 25;
  const top = Y - 36;
  const bot = Y + 36;
  const ticks = [15, 16.5, 20, 23.5, 25]
    .map((v) => {
      const xv = X(v);
      const label = v === 16.5 ? "Q1" : v === 23.5 ? "Q3" : v === 20 ? "med" : String(v);
      return `<line x1="${xv.toFixed(1)}" y1="${bot + 8}" x2="${xv.toFixed(1)}" y2="${bot + 14}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv.toFixed(1)}" y="${bot + 32}" text-anchor="middle" fill="${TX}">${esc(label)}</text>`;
    })
    .join("\n  ");
  return svg(
    "fx82-1var-box",
    "Box plot of 15, 18, 22, 25 with quartiles",
    "Min 15, Q1 16.5, median 20, Q3 23.5, max 25. 1-VAR MinMax recalls these five numbers.",
    `
  <line x1="${LEFT}" y1="${Y}" x2="${RIGHT}" y2="${Y}" stroke="${TM}" stroke-width="1"/>
  <line x1="${X(min).toFixed(1)}" y1="${Y}" x2="${X(q1).toFixed(1)}" y2="${Y}" stroke="${A}" stroke-width="2"/>
  <line x1="${X(q3).toFixed(1)}" y1="${Y}" x2="${X(max).toFixed(1)}" y2="${Y}" stroke="${A}" stroke-width="2"/>
  <rect x="${X(q1).toFixed(1)}" y="${top}" width="${(X(q3) - X(q1)).toFixed(1)}" height="${bot - top}" fill="${A}" fill-opacity="0.18" stroke="${A}" stroke-width="2"/>
  <line x1="${X(med).toFixed(1)}" y1="${top}" x2="${X(med).toFixed(1)}" y2="${bot}" stroke="${A}" stroke-width="2.4"/>
  <line x1="${X(min).toFixed(1)}" y1="${Y - 14}" x2="${X(min).toFixed(1)}" y2="${Y + 14}" stroke="${A}" stroke-width="2"/>
  <line x1="${X(max).toFixed(1)}" y1="${Y - 14}" x2="${X(max).toFixed(1)}" y2="${Y + 14}" stroke="${A}" stroke-width="2"/>
  ${ticks}
  <text x="360" y="36" text-anchor="middle" fill="${TX}">1-VAR MinMax: min, Q1, med, Q3, max</text>
  <text x="360" y="300" text-anchor="middle" fill="${AS}">This model reports quartiles; the fx-50FH II SD mode does not</text>
`
  );
}

function makeAbx() {
  const LEFT = 64;
  const RIGHT = 696;
  const TOP = 40;
  const BASE = 250;
  const x0 = -0.2;
  const x1 = 3.4;
  const y0 = 0;
  const y1 = 8;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  const fn = (x) => 2 * Math.pow(1.5, x);
  const curve = plot(fn, x0, x1, X, Y, 200);
  const pts = [
    [0, 2],
    [1, 3],
    [2, 4.5],
    [3, 6.75],
  ];
  const dots = pts
    .map(
      ([x, y]) =>
        `<circle cx="${X(x).toFixed(2)}" cy="${Y(y).toFixed(2)}" r="5.2" fill="${A}" stroke="${BG}" stroke-width="1.6"/>`
    )
    .join("\n  ");
  const ticks = [0, 1, 2, 3]
    .map((v) => {
      const xv = X(v);
      return `<line x1="${xv.toFixed(1)}" y1="${BASE}" x2="${xv.toFixed(1)}" y2="${BASE + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv.toFixed(1)}" y="${BASE + 20}" text-anchor="middle" fill="${TX}">${v}</text>`;
    })
    .join("\n  ");
  return svg(
    "fx82-abx",
    "A·B^X exponential y = 2 × 1.5^x",
    "Sample geometric growth: each step in x multiplies y by B = 1.5. This is the A·B^X STAT model, not the e^X model.",
    `
  <line x1="${LEFT}" y1="${BASE}" x2="${RIGHT}" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${LEFT}" y1="${TOP}" x2="${LEFT}" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4" stroke-linejoin="round"/>
  ${dots}
  ${ticks}
  <text x="88" y="56" fill="${AS}">y</text>
  <text x="${RIGHT - 8}" y="${BASE + 36}" text-anchor="end" fill="${TX}">x</text>
  <text x="360" y="28" text-anchor="middle" fill="${TX}">y = A · B^x  →  y = 2 × 1.5^x</text>
  <text x="360" y="${BASE + 52}" text-anchor="middle" fill="${AS}">Each equal step in x multiplies y by B (here 1.5)</text>
`
  );
}

function makeAbs() {
  const LEFT = 64;
  const RIGHT = 696;
  const TOP = 40;
  const BASE = 250;
  const x0 = -6;
  const x1 = 6;
  const y0 = -0.4;
  const y1 = 6.2;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  const ox = X(0);
  const oy = Y(0);
  return svg(
    "fx82-abs",
    "Absolute value y = |x| with Abs(−5.5) = 5.5",
    "The V-shaped graph of y = |x|. The example Abs(−5.5) maps to the point (5.5, 5.5) on the right arm.",
    `
  <line x1="${LEFT}" y1="${oy}" x2="${RIGHT}" y2="${oy}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${ox}" y1="${TOP}" x2="${ox}" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  <path d="M${X(-6).toFixed(1)},${Y(6).toFixed(1)} L${ox.toFixed(1)},${oy.toFixed(1)} L${X(6).toFixed(1)},${Y(6).toFixed(1)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  <line x1="${X(-5.5).toFixed(1)}" y1="${oy}" x2="${X(-5.5).toFixed(1)}" y2="${Y(5.5).toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="4 3"/>
  <line x1="${X(-5.5).toFixed(1)}" y1="${Y(5.5).toFixed(1)}" x2="${X(5.5).toFixed(1)}" y2="${Y(5.5).toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="4 3"/>
  <circle cx="${X(-5.5).toFixed(1)}" cy="${oy}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <circle cx="${X(5.5).toFixed(1)}" cy="${Y(5.5).toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${X(-5.5).toFixed(1)}" y="${oy + 22}" text-anchor="middle" fill="${TX}">−5.5</text>
  <text x="${X(5.5).toFixed(1) + 8}" y="${Y(5.5).toFixed(1) - 10}" fill="${A}">Abs(−5.5) = 5.5</text>
  <text x="${RIGHT - 8}" y="${oy + 22}" text-anchor="end" fill="${TX}">x</text>
  <text x="${ox + 10}" y="${TOP + 16}" fill="${AS}">y</text>
  <text x="360" y="24" text-anchor="middle" fill="${TX}">y = |x|</text>
`
  );
}

function makeUnitCircle(id, title, desc, extra, heading) {
  const CX = 280;
  const CY = 175;
  const R = 118;
  const X = (x) => CX + x * R;
  const Y = (y) => CY - y * R;
  return svg(
    id,
    title,
    desc,
    `
  <line x1="${X(-1.25).toFixed(1)}" y1="${CY}" x2="${X(1.45).toFixed(1)}" y2="${CY}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${CX}" y1="${Y(-1.25).toFixed(1)}" x2="${CX}" y2="${Y(1.25).toFixed(1)}" stroke="${TM}" stroke-width="1.2"/>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${TM}" stroke-width="1.4"/>
  ${extra(X, Y, CX, CY, R)}
  <text x="${X(1.42).toFixed(1)}" y="${CY + 22}" text-anchor="end" fill="${TX}">cos</text>
  <text x="${CX + 10}" y="${Y(1.2).toFixed(1)}" fill="${AS}">sin</text>
  <text x="520" y="28" text-anchor="middle" fill="${TX}">${esc(heading)}</text>
`
  );
}

function makeVerif() {
  const ang = Math.PI / 6;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return makeUnitCircle(
    "fx82-verif",
    "Unit circle identity sin²30 + cos²30 = 1",
    "At 30 degrees the right triangle on the unit circle has legs cos 30 and sin 30. Their squares add to the hypotenuse squared, which is 1.",
    (X, Y, CX, CY) => {
      const px = X(c);
      const py = Y(s);
      return `
  <path d="M${CX},${CY} L${px.toFixed(1)},${CY} L${px.toFixed(1)},${py.toFixed(1)} Z" fill="${A}" fill-opacity="0.18"/>
  <line x1="${CX}" y1="${CY}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${A}" stroke-width="2.4"/>
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${((CX + px) / 2).toFixed(1)}" y="${CY + 20}" text-anchor="middle" fill="${TX}">cos 30</text>
  <text x="${px + 10}" y="${((CY + py) / 2).toFixed(1)}" fill="${TX}">sin 30</text>
  <text x="520" y="160" fill="${TX}">sin²30 + cos²30</text>
  <text x="520" y="184" fill="${A}">= 1  →  TRUE</text>
  <text x="520" y="220" fill="${AS}">Deg mode</text>`;
    },
    "VERIF: identity on the unit circle"
  );
}

function makeTrig() {
  const ang = Math.PI / 3;
  const c = 0.5;
  const s = Math.sin(ang);
  return makeUnitCircle(
    "fx82-trig",
    "cos⁻¹ 0.5 = 60° on the unit circle",
    "The point with cosine 0.5 (x-coordinate) sits at 60 degrees from the positive x-axis, so inverse cosine of 0.5 is 60 degrees in Deg mode.",
    (X, Y, CX, CY) => {
      const px = X(c);
      const py = Y(s);
      const n = 18;
      const arc = [];
      for (let i = 0; i <= n; i++) {
        const t = (ang * i) / n;
        arc.push((i ? "L" : "M") + X(0.28 * Math.cos(t)).toFixed(1) + "," + Y(0.28 * Math.sin(t)).toFixed(1));
      }
      return `
  <line x1="${CX}" y1="${CY}" x2="${px.toFixed(1)}" y2="${CY}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="${px.toFixed(1)}" y1="${CY}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="${CX}" y1="${CY}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${A}" stroke-width="2.4"/>
  <path d="${arc.join(" ")}" fill="none" stroke="${A}" stroke-width="1.8"/>
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${((CX + px) / 2).toFixed(1)}" y="${CY + 20}" text-anchor="middle" fill="${TX}">0.5</text>
  <text x="${X(0.42).toFixed(1)}" y="${Y(0.18).toFixed(1)}" fill="${A}">60°</text>
  <text x="520" y="160" fill="${TX}">cos⁻¹ 0.5</text>
  <text x="520" y="184" fill="${A}">= 60°  (Deg)</text>`;
    },
    "Inverse cosine in Deg mode"
  );
}

writeSvg("1var-mean.svg", make1varMean());
writeSvg("1var-box.svg", make1varBox());
writeSvg("abx.svg", makeAbx());
writeSvg("abs.svg", makeAbs());
writeSvg("verif.svg", makeVerif());
writeSvg("trig.svg", makeTrig());

console.log("Wrote fx-82AU PLUS II graphs under", IMG);
