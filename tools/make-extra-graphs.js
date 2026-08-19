#!/usr/bin/env node
/** Extra themed SVGs: Keys Pol/Rec, CMPLX add, SD mean, PRGM quadratic. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "assets", "img");

const A = "var(--accent)";
const AS = "var(--accent-soft)";
const TM = "var(--text-muted)";
const TX = "var(--text)";
const BG = "var(--bg)";

function writeSvg(rel, xml) {
  const file = path.join(IMG, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, xml.replace(/\n{3,}/g, "\n"), "utf8");
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

function arrowHead(x1, y1, x2, y2, size = 9) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a1 = ang + Math.PI * 0.82;
  const a2 = ang - Math.PI * 0.82;
  const p1x = (x2 + size * Math.cos(a1)).toFixed(1);
  const p1y = (y2 + size * Math.sin(a1)).toFixed(1);
  const p2x = (x2 + size * Math.cos(a2)).toFixed(1);
  const p2y = (y2 + size * Math.sin(a2)).toFixed(1);
  return `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p1x},${p1y} ${p2x},${p2y}" fill="${A}"/>`;
}

function makePolRec() {
  const LEFT = 96;
  const RIGHT = 640;
  const TOP = 36;
  const BASE = 268;
  const x0 = 0;
  const x1 = 5.4;
  const y0 = 0;
  const y1 = 5.4;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  const ox = X(0);
  const oy = Y(0);
  const px = X(3);
  const py = Y(4);
  const r = 5;
  const theta = Math.atan2(4, 3);
  const arc = [];
  const n = 22;
  const arcR = 1.15;
  for (let i = 0; i <= n; i++) {
    const t = (theta * i) / n;
    const ax = X(arcR * Math.cos(t));
    const ay = Y(arcR * Math.sin(t));
    arc.push((i ? "L" : "M") + ax.toFixed(2) + "," + ay.toFixed(2));
  }
  const ticks = [1, 2, 3, 4, 5]
    .map((v) => {
      const xv = X(v);
      const yv = Y(v);
      return `<line x1="${xv.toFixed(1)}" y1="${oy}" x2="${xv.toFixed(1)}" y2="${oy + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv.toFixed(1)}" y="${oy + 20}" text-anchor="middle" fill="${TX}">${v}</text>
  <line x1="${ox}" y1="${yv.toFixed(1)}" x2="${ox - 6}" y2="${yv.toFixed(1)}" stroke="${TM}" stroke-width="1"/>
  <text x="${ox - 14}" y="${yv.toFixed(1) + 4}" text-anchor="end" fill="${TX}">${v}</text>`;
    })
    .join("\n  ");
  return svg(
    "keys-pol",
    "Pol(3, 4) as a 3–4–5 triangle",
    "Rectangular point (x, y) = (3, 4) with polar radius r = 5 and angle θ about 53.13 degrees from the positive x-axis.",
    `
  <line x1="${ox}" y1="${oy}" x2="${RIGHT}" y2="${oy}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${TOP}" stroke="${TM}" stroke-width="1.2"/>
  ${ticks}
  <line x1="${ox}" y1="${oy}" x2="${px.toFixed(1)}" y2="${oy}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="${px.toFixed(1)}" y1="${oy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <path d="${arc.join(" ")}" fill="none" stroke="${A}" stroke-width="1.6"/>
  <line x1="${ox}" y1="${oy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${A}" stroke-width="2.4"/>
  ${arrowHead(ox, oy, px, py)}
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${((ox + px) / 2).toFixed(1)}" y="${oy - 12}" text-anchor="middle" fill="${TX}">x = 3</text>
  <text x="${px + 18}" y="${((oy + py) / 2).toFixed(1)}" fill="${TX}">y = 4</text>
  <text x="${((ox + px) / 2 - 18).toFixed(1)}" y="${((oy + py) / 2 - 8).toFixed(1)}" fill="${A}">r = 5</text>
  <text x="${X(1.55).toFixed(1)}" y="${Y(0.55).toFixed(1)}" fill="${A}">θ ≈ 53.13°</text>
  <text x="${RIGHT - 8}" y="${oy + 36}" text-anchor="end" fill="${TX}">x</text>
  <text x="${ox + 12}" y="${TOP + 16}" fill="${AS}">y</text>
  <text x="360" y="24" text-anchor="middle" fill="${TX}">Pol(3, 4) → r = 5, θ ≈ 53.13°</text>
`
  );
}

function makeCmplx() {
  const OX = 250;
  const OY = 138;
  const S = 40;
  const X = (x) => OX + x * S;
  const Y = (y) => OY - y * S;
  const a = [3, 2];
  const b = [1, -4];
  const s = [4, -2];
  const ax = X(a[0]);
  const ay = Y(a[1]);
  const bx = X(b[0]);
  const by = Y(b[1]);
  const sx = X(s[0]);
  const sy = Y(s[1]);
  const xTicks = [-1, 1, 2, 3, 4, 5]
    .map((v) => {
      const xv = X(v);
      return `<line x1="${xv.toFixed(1)}" y1="${OY}" x2="${xv.toFixed(1)}" y2="${OY + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv.toFixed(1)}" y="${OY + 20}" text-anchor="middle" fill="${TX}">${v}</text>`;
    })
    .join("\n  ");
  const yTicks = [-4, -3, -2, -1, 1, 2]
    .map((v) => {
      const yv = Y(v);
      return `<line x1="${OX}" y1="${yv.toFixed(1)}" x2="${OX - 6}" y2="${yv.toFixed(1)}" stroke="${TM}" stroke-width="1"/>
  <text x="${OX - 12}" y="${yv.toFixed(1) + 4}" text-anchor="end" fill="${TX}">${v}</text>`;
    })
    .join("\n  ");
  return svg(
    "cmplx-add",
    "Adding 3+2i and 1−4i on the complex plane",
    "Two complex numbers drawn as arrows from the origin. Their parallelogram sum is the resultant 4−2i.",
    `
  <line x1="${X(-1.4).toFixed(1)}" y1="${OY}" x2="${X(5.8).toFixed(1)}" y2="${OY}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${OX}" y1="${Y(-4.4).toFixed(1)}" x2="${OX}" y2="${Y(2.5).toFixed(1)}" stroke="${TM}" stroke-width="1.2"/>
  ${xTicks}
  ${yTicks}
  <line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${AS}" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="${OX}" y1="${OY}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="${AS}" stroke-width="2"/>
  ${arrowHead(OX, OY, ax, ay, 8)}
  <line x1="${OX}" y1="${OY}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${AS}" stroke-width="2"/>
  ${arrowHead(OX, OY, bx, by, 8)}
  <line x1="${OX}" y1="${OY}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${A}" stroke-width="2.6"/>
  ${arrowHead(OX, OY, sx, sy, 10)}
  <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${ax + 10}" y="${ay - 8}" fill="${TX}">3 + 2i</text>
  <text x="${bx + 12}" y="${by + 18}" fill="${TX}">1 − 4i</text>
  <text x="${sx + 14}" y="${sy + 6}" fill="${A}">4 − 2i</text>
  <text x="${X(5.7).toFixed(1)}" y="${OY + 22}" text-anchor="end" fill="${TX}">Re</text>
  <text x="${OX + 12}" y="${Y(2.45).toFixed(1) + 4}" fill="${AS}">Im</text>
  <text x="360" y="22" text-anchor="middle" fill="${TX}">(3 + 2i) + (1 − 4i) = 4 − 2i</text>
`
  );
}

function makeSdMean() {
  const LEFT = 80;
  const RIGHT = 640;
  const Y = 170;
  const x0 = 0;
  const x1 = 10;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const pts = [2, 4, 6, 8];
  const mean = 5;
  const ticks = [0, 2, 4, 5, 6, 8, 10]
    .map((v) => {
      const xv = X(v);
      const isMean = v === mean;
      return `<line x1="${xv.toFixed(1)}" y1="${Y}" x2="${xv.toFixed(1)}" y2="${Y + (isMean ? 10 : 6)}" stroke="${isMean ? A : TM}" stroke-width="${isMean ? 1.6 : 1}"/>
  <text x="${xv.toFixed(1)}" y="${Y + 24}" text-anchor="middle" fill="${isMean ? A : TX}">${v}</text>`;
    })
    .join("\n  ");
  const dots = pts
    .map((v) => {
      const xv = X(v);
      return `<circle cx="${xv.toFixed(1)}" cy="${Y}" r="6" fill="${A}" stroke="${BG}" stroke-width="1.8"/>`;
    })
    .join("\n  ");
  const mx = X(mean);
  return svg(
    "sd-mean",
    "Mean of 2, 4, 6, 8 on a number line",
    "Four data values sit at 2, 4, 6 and 8. Their balance point, the arithmetic mean, is at 5.",
    `
  <line x1="${LEFT}" y1="${Y}" x2="${RIGHT}" y2="${Y}" stroke="${TM}" stroke-width="1.4"/>
  ${ticks}
  ${dots}
  <line x1="${mx.toFixed(1)}" y1="${Y - 52}" x2="${mx.toFixed(1)}" y2="${Y + 10}" stroke="${A}" stroke-width="1.8"/>
  <polygon points="${mx.toFixed(1)},${Y - 62} ${mx - 8},${Y - 48} ${mx + 8},${Y - 48}" fill="${A}"/>
  <text x="${mx.toFixed(1)}" y="${Y - 72}" text-anchor="middle" fill="${TX}">x̄ = 5</text>
  <text x="360" y="36" text-anchor="middle" fill="${TX}">Data 2, 4, 6, 8 balance at the mean</text>
  <text x="360" y="292" text-anchor="middle" fill="${AS}">Each pair 2 with 8, and 4 with 6, averages to 5</text>
`,
    320
  );
}

function makeSdFreq() {
  const LEFT = 120;
  const BASE = 250;
  const TOP = 64;
  const rows = [
    [75, 1],
    [80, 2],
    [85, 4],
  ];
  const maxF = 4;
  const gap = 150;
  const barW = 72;
  const start = 160;
  const bars = rows
    .map(([x, f], i) => {
      const bx = start + i * gap;
      const h = (f / maxF) * (BASE - TOP);
      const by = BASE - h;
      return `<rect x="${bx}" y="${by.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" fill="${A}" fill-opacity="0.78"/>
  <text x="${bx + barW / 2}" y="${by - 8}" text-anchor="middle" fill="${TX}">f = ${f}</text>
  <text x="${bx + barW / 2}" y="${BASE + 22}" text-anchor="middle" fill="${TX}">${x}</text>`;
    })
    .join("\n  ");
  return svg(
    "sd-freq",
    "Frequency bars for scores 75, 80, 85",
    "Three classes: 75 appears once, 80 twice, 85 four times. The mean is pulled toward 85 because that class has the largest frequency.",
    `
  <line x1="${LEFT}" y1="${BASE}" x2="640" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${LEFT}" y1="${TOP}" x2="${LEFT}" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  ${bars}
  <line x1="${LEFT}" y1="${BASE - (BASE - TOP) * (4 / 4)}" x2="640" y2="${BASE - (BASE - TOP) * (4 / 4)}" stroke="${TM}" stroke-width="0.8" stroke-dasharray="3 4" opacity="0.5"/>
  <text x="${LEFT - 10}" y="${BASE + 4}" text-anchor="end" fill="${TX}">0</text>
  <text x="${LEFT - 10}" y="${TOP + 4}" text-anchor="end" fill="${TX}">4</text>
  <text x="360" y="28" text-anchor="middle" fill="${TX}">FreqOn: 75 once, 80 twice, 85 four times</text>
  <text x="360" y="${BASE + 52}" text-anchor="middle" fill="${AS}">n = 7; mean pulled toward the tallest bar (85)</text>
`
  );
}

function makePrgmQuad() {
  const LEFT = 64;
  const RIGHT = 696;
  const TOP = 40;
  const BASE = 250;
  const x0 = -0.4;
  const x1 = 4.4;
  const y0 = -2.2;
  const y1 = 4.2;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  const fn = (x) => x * x - 4 * x + 3;
  const curve = plot(fn, x0, x1, X, Y, 200);
  const axisY = Y(0);
  const ticks = [0, 1, 2, 3, 4]
    .map((v) => {
      const xv = X(v);
      return `<line x1="${xv.toFixed(1)}" y1="${axisY}" x2="${xv.toFixed(1)}" y2="${axisY + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv.toFixed(1)}" y="${axisY + 20}" text-anchor="middle" fill="${TX}">${v}</text>`;
    })
    .join("\n  ");
  const vx = X(2);
  const vy = Y(-1);
  return svg(
    "prgm-quad",
    "Sample run A=1, B=−4, C=3: roots 1 and 3, vertex (2, −1)",
    "Parabola y = x² − 4x + 3 crosses the x-axis at the real roots 1 and 3. The vertex is at (2, −1), which the program prints after the roots.",
    `
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4" stroke-linejoin="round"/>
  <line x1="${LEFT}" y1="${axisY}" x2="${RIGHT}" y2="${axisY}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${X(0)}" y1="${TOP}" x2="${X(0)}" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  ${ticks}
  <line x1="${vx.toFixed(1)}" y1="${vy.toFixed(1)}" x2="${vx.toFixed(1)}" y2="${axisY}" stroke="${AS}" stroke-width="1.1" stroke-dasharray="4 3"/>
  <circle cx="${X(1).toFixed(1)}" cy="${axisY}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <circle cx="${X(3).toFixed(1)}" cy="${axisY}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.6"/>
  <text x="${X(1).toFixed(1)}" y="${axisY - 14}" text-anchor="middle" fill="${TX}">x = 1</text>
  <text x="${X(3).toFixed(1)}" y="${axisY - 14}" text-anchor="middle" fill="${TX}">x = 3</text>
  <text x="${vx.toFixed(1) + 16}" y="${vy + 22}" fill="${TX}">vertex (2, −1)</text>
  <text x="96" y="56" fill="${AS}">y = x² − 4x + 3</text>
  <text x="${RIGHT - 8}" y="${axisY + 36}" text-anchor="end" fill="${TX}">x</text>
  <text x="360" y="24" text-anchor="middle" fill="${TX}">A = 1, B = −4, C = 3</text>
`
  );
}

writeSvg("keys/pol-rec.svg", makePolRec());
writeSvg("cmplx/add.svg", makeCmplx());
writeSvg("sd/mean.svg", makeSdMean());
writeSvg("sd/freq.svg", makeSdFreq());
writeSvg("prgm/quadratic.svg", makePrgmQuad());

console.log("Wrote Keys, CMPLX, SD, and PRGM graphs under", IMG);
