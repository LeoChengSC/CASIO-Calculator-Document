#!/usr/bin/env node
/** Themed SVG graphs for fx-50FH II REG (MODE 5) child pages. Run: node tools/make-reg-graphs.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "assets", "img", "reg");
const REG = path.join(ROOT, "data", "models", "fx-50fh-ii", "sections", "modes", "reg");
const MARK = "reg-graph";

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

function regressionPlot(id, title, desc, points, fn, x0, x1, y0, y1, formulaLabel, callout) {
  const BASE = 250;
  const LEFT = 64;
  const RIGHT = 696;
  const TOP = 40;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  const curve = plot(fn, x0, x1, X, Y, 200);
  const dots = points
    .map(
      ([x, y]) =>
        `<circle cx="${X(x).toFixed(2)}" cy="${Y(y).toFixed(2)}" r="5.2" fill="${A}" stroke="${BG}" stroke-width="1.6"/>`
    )
    .join("\n  ");
  const xTicks = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      const v = x0 + t * (x1 - x0);
      const xv = X(v).toFixed(2);
      const label = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "");
      return `<line x1="${xv}" y1="${BASE}" x2="${xv}" y2="${BASE + 6}" stroke="${TM}" stroke-width="1"/>
  <text x="${xv}" y="${BASE + 20}" text-anchor="middle" fill="${TX}">${esc(label)}</text>`;
    })
    .join("\n  ");
  return svg(
    id,
    title,
    desc,
    `
  ${axisX(LEFT, RIGHT, BASE)}
  ${axisY(LEFT, TOP, BASE)}
  <path d="${curve}" fill="none" stroke="${A}" stroke-width="2.4" stroke-linejoin="round"/>
  ${dots}
  ${xTicks}
  <text x="88" y="56" fill="${AS}">y</text>
  <text x="${RIGHT - 8}" y="${BASE + 36}" text-anchor="end" fill="${TX}">x</text>
  <text x="360" y="28" text-anchor="middle" fill="${TX}">${esc(formulaLabel)}</text>
  <text x="360" y="${BASE + 52}" text-anchor="middle" fill="${AS}">${esc(callout)}</text>
`
  );
}

function makeLin() {
  const fn = (x) => 2 * x;
  const pts = [
    [1, 2],
    [2, 4],
    [3, 6],
  ];
  return regressionPlot(
    "reg-lin",
    "Linear regression on three collinear points",
    "Sample points (1, 2), (2, 4), and (3, 6) with fitted line y = 2x (A = 0, B = 2). Correlation r = 1.",
    pts,
    fn,
    0,
    4,
    0,
    8,
    "y = A + Bx  →  y = 2x",
    "Dots are your (x, y) pairs; the line is the calculator fit (A = 0, B = 2, r = 1)"
  );
}

function makeLog() {
  const fn = (x) => 2 + 3 * Math.log(x);
  const pts = [
    [1, 2],
    [2, 4.08],
    [3, 5.3],
    [5, 6.82],
  ];
  return regressionPlot(
    "reg-log",
    "Logarithmic regression curve flattening as x grows",
    "Fitted curve y = 2 + 3 ln x through sample points. y rises quickly for small x then levels off.",
    pts,
    fn,
    0.5,
    6,
    0,
    8,
    "y = A + B ln x",
    "Rises fast at first, then flattens — typical log-shaped growth"
  );
}

function makeExp() {
  const fn = (x) => 2 * Math.exp(0.5 * x);
  const pts = [
    [0, 2],
    [1, 3.3],
    [2, 5.44],
    [3, 8.96],
  ];
  return regressionPlot(
    "reg-exp",
    "Exponential regression with increasing slope",
    "Fitted curve y = 2 e^(0.5x) through sample points showing compound growth.",
    pts,
    fn,
    0,
    3.5,
    0,
    10,
    "y = A e^(Bx)",
    "Each step up in x multiplies y by about e^B — compound growth or decay"
  );
}

function makePwr() {
  const fn = (x) => 0.5 * Math.pow(x, 1.5);
  const pts = [
    [1, 0.5],
    [2, 1.41],
    [3, 2.6],
    [4, 4],
  ];
  return regressionPlot(
    "reg-pwr",
    "Power regression scaling curve",
    "Fitted curve y = 0.5 x^1.5 through sample points — a power-law shape on ordinary axes.",
    pts,
    fn,
    0,
    4.5,
    0,
    4.5,
    "y = A x^B",
    "Both axes must be positive; on log-log paper this would look like a straight line"
  );
}

function makeInv() {
  const fn = (x) => 2 + 10 / x;
  const pts = [
    [1, 12],
    [2, 7],
    [5, 4],
    [10, 3],
  ];
  return regressionPlot(
    "reg-inv",
    "Inverse regression hyperbola",
    "Fitted curve y = 2 + 10/x through sample points — y drops sharply then approaches a horizontal asymptote.",
    pts,
    fn,
    0.5,
    11,
    0,
    13,
    "y = A + B/x",
    "Large y when x is small; y settles toward A = 2 as x grows"
  );
}

function makeQuad() {
  const fn = (x) => x * x - 2 * x + 3;
  const pts = [
    [0, 3],
    [1, 2],
    [2, 3],
    [3, 6],
    [4, 11],
  ];
  return regressionPlot(
    "reg-quad",
    "Quadratic regression parabola through five points",
    "Fitted parabola y = x² − 2x + 3 through sample points with a minimum near x = 1.",
    pts,
    fn,
    -0.3,
    4.5,
    0,
    12,
    "y = A + Bx + Cx²",
    "U-shaped trend — the calculator also recalls C alongside A and B"
  );
}

function makeAbExp() {
  const fn = (x) => 2 * Math.pow(1.5, x);
  const pts = [
    [0, 2],
    [1, 3],
    [2, 4.5],
    [3, 6.75],
  ];
  return regressionPlot(
    "reg-ab-exp",
    "AB-Exp geometric growth y = 2 × 1.5^x",
    "Fitted curve y = 2 × 1.5^x through sample points. Each step in x multiplies y by the base B = 1.5.",
    pts,
    fn,
    -0.2,
    3.4,
    0,
    8,
    "y = A B^x  →  y = 2 × 1.5^x",
    "Each equal step in x multiplies y by B itself — not e^B as in Exp"
  );
}

writeSvg("lin.svg", makeLin());
writeSvg("log.svg", makeLog());
writeSvg("exp.svg", makeExp());
writeSvg("pwr.svg", makePwr());
writeSvg("inv.svg", makeInv());
writeSvg("quad.svg", makeQuad());
writeSvg("ab-exp.svg", makeAbExp());

const figures = {
  lin: {
    explain:
      "Each dot is an (x, y) pair you entered with DT. The calculator finds the straight line that best matches them. Here the points lie perfectly on y = 2x, so A = 0, B = 2, and r = 1.",
    caption:
      "Example points (1, 2), (2, 4), (3, 6) on y = 2x. Perfect collinearity gives intercept A = 0, slope B = 2, and correlation r = 1.",
  },
  log: {
    explain:
      "Log regression fits y = A + B ln x. The curve rises quickly for small x, then bends and flattens — useful when extra units of x matter less and less (diminishing returns). All x values must be positive.",
    caption:
      "Sample fit y = 2 + 3 ln x. Notice how the slope eases off as x increases — that is the hallmark log shape.",
  },
  exp: {
    explain:
      "Exponential regression fits y = A e^(Bx). Positive B gives growth that speeds up; negative B gives decay toward zero. On semi-log paper (ln y vs x) the same data would look straight.",
    caption:
      "Sample fit y = 2 e^(0.5x). Each equal step in x multiplies y by about e^0.5 ≈ 1.65.",
  },
  pwr: {
    explain:
      "Power regression fits y = A x^B. Both x and y must be positive. B = 1 is proportional; B = 2 is quadratic scaling; fractional B gives slower growth than a straight line.",
    caption:
      "Sample fit y = 0.5 x^1.5. A power law looks curved on ordinary axes but becomes a line when both axes are logged.",
  },
  inv: {
    explain:
      "Inverse regression fits y = A + B/x — a hyperbola. When x is small, the B/x term dominates; as x grows, y approaches the horizontal level A. Boyle-type P vs V relationships often fit this shape after rearranging.",
    caption:
      "Sample fit y = 2 + 10/x. The curve drops quickly at first, then levels off toward A = 2.",
  },
  quad: {
    explain:
      "Quadratic regression fits y = A + Bx + Cx² — a parabola. Use it when the trend bends once (a single peak or valley). The calculator recalls A, B, and C (item 3 is C, not r).",
    caption:
      "Sample fit y = x² − 2x + 3 through five points. The curve has a minimum near x = 1.",
  },
  "ab-exp": {
    explain:
      "AB-Exp fits y = A B^x. Each equal step in x multiplies y by the same base B — geometric growth. This is not the same recall as Exp (y = A e^(Bx)): here B is the multiplier itself. Same curve family: AB-Exp’s B equals e^b if Exp’s coefficient is b.",
    caption:
      "Sample fit y = 2 × 1.5^x. Compare with Exp: here the multiplier is B itself, not e^B.",
  },
};

function stripMarked(body) {
  return (body || []).filter((b) => b.mark !== MARK);
}

function patchPage(slug, spec) {
  const file = path.join(REG, `${slug}.json`);
  const page = JSON.parse(fs.readFileSync(file, "utf8"));
  page.body = stripMarked(page.body);

  const idx = page.body.findIndex((b) => b.type === "formula");
  const fig = [
    { type: "p", mark: MARK, text: spec.explain },
    {
      type: "figure",
      mark: MARK,
      svg: `img/reg/${slug}.svg`,
      caption: spec.caption,
    },
  ];
  page.body.splice(idx + 1, 0, ...fig);

  fs.writeFileSync(file, JSON.stringify(page, null, 2) + "\n", "utf8");
}

for (const [slug, spec] of Object.entries(figures)) {
  patchPage(slug, spec);
}

console.log("Wrote 7 REG graphs under", IMG);
