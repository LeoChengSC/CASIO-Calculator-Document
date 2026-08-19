#!/usr/bin/env node
/** HK DSE example programs: JSON pages + SVGs. Run: node tools/make-prgm-examples.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = path.join(ROOT, "data", "models", "fx-50fh-ii");
const IMG = path.join(ROOT, "assets", "img", "prgm");

const A = "var(--accent)";
const AS = "var(--accent-soft)";
const TM = "var(--text-muted)";
const TX = "var(--text)";
const BG = "var(--bg)";

function w(rel, obj) {
  const file = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function writeSvg(name, xml) {
  fs.mkdirSync(IMG, { recursive: true });
  fs.writeFileSync(path.join(IMG, name), xml.replace(/\n{3,}/g, "\n"), "utf8");
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

function axes(X, Y, x0, x1, y0, y1) {
  return `<line x1="${X(x0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(0)}" stroke="${TM}" stroke-width="1.2"/>
  <line x1="${X(0)}" y1="${Y(y0)}" x2="${X(0)}" y2="${Y(y1)}" stroke="${TM}" stroke-width="1.2"/>`;
}

function dot(X, Y, x, y, label, dy = -12) {
  return `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="${A}" stroke="${BG}" stroke-width="1.5"/>
  <text x="${X(x)}" y="${Y(y) + dy}" text-anchor="middle" fill="${TX}">${esc(label)}</text>`;
}

function lineFn(x1, y1, x2, y2, X, Y) {
  return `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${A}" stroke-width="2.2"/>`;
}

function page(p) {
  w(`sections/${p.id}.json`, p);
}

function memoryNote(bytes, mode) {
  return {
    type: "note",
    label: "Memory / run mode",
    text: `${bytes} of the shared 680-byte pool. Create the slot in ${mode}. Type ? → : ◢ Goto Lbl If Then from SHIFT 3 (P-CMD).`,
  };
}

function examples(blocks) {
  const out = [];
  blocks.forEach((ex, i) => {
    out.push({ type: "h2", text: `Example ${i + 1}${ex.edge ? " (edge)" : ""}: ${ex.title}` });
    const q = ex.question || `Use this program to solve the case: ${ex.title}.`;
    const g = ex.given || ex.lead;
    out.push({ type: "p", text: `Question: ${q}` });
    out.push({ type: "p", text: `Given: ${g}` });
    if (ex.givenLines?.length) out.push({ type: "lines", items: ex.givenLines });
    if (!g || String(ex.lead || "").trim() !== String(g).trim()) {
      out.push({ type: "p", text: ex.lead });
    }
    if (ex.graph) {
      out.push({
        type: "figure",
        svg: `img/prgm/${ex.graph}`,
        caption: ex.caption || ex.title,
      });
    }
    out.push({ type: "ol", items: ex.steps });
  });
  return out;
}

function keycapEXE(text) {
  // Normalize once: avoid nested/double boxing like 【【EXE】】.
  const raw = String(text || "").replace(/【\s*EXE\s*】/g, "EXE");
  return raw.replace(/\bEXE\b/g, "【EXE】");
}

function normalizeExamples() {
  for (const p of programs) {
    for (const ex of p.examples || []) {
      ex.lead = ex.lead || "Use the listing with the given inputs and report the result.";
      ex.steps = (ex.steps || []).map((s) => keycapEXE(s));
    }
  }
}

const programs = [
  {
    slug: "simultaneous-2",
    title: "Simultaneous Linear Equations (2 Unknowns)",
    short: "Simultaneous 2",
    bytes: "53 bytes",
    mode: "COMP (use CMPLX if coefficients are complex)",
    aliases: ["聯立二元一次方程", "simultaneous equations", "Cramer 2x2"],
    keywords: ["Cramer", "Ax+By+C", "two unknowns"],
    formulas: ["Ax + By = C", "Dx + Ey = F"],
    summary: "The DSE ‘must-enter’ solver for two linear equations. 53 bytes.",
    desc: "Hong Kong papers almost always include a 2×2 linear system. Rearrange each equation to Ax + By = C (right-hand side is the constant, not Ax+By+C=0). Prompts are A, B, C then D, X, Y for the second row Dx + Xy = Y. Displays x, then y. RCL M is the determinant AY−BX after a run of this listing.",
    code: "?→A:?→B:?→C:?→D:?→X:?→Y:AY−BX→M:M⁻¹(CX−YB→X◢M⁻¹(AY−DC→Y",
    graph: "simultaneous-2.svg",
    caption: "x + y = 7 and x − y = 1 meet at (4, 3).",
    examples: [
      {
        title: "x + y = 7, x − y = 1",
        question: "Find the unknowns x and y that satisfy both equations x + y = 7 and x − y = 1.",
        given: "Two straight lines intersect at point M(x, y).",
        givenLines: [
          "Line 1: x + y = 7",
          "Line 2: x − y = 1",
          "For Ax + By = C input format:",
          "Row 1 (A, B, C) = (1, 1, 7)",
          "Row 2 (D, X, Y) = (1, −1, 1)",
        ],
        lead: "Exam-style flow: convert each line to Ax + By = C, key in coefficients, read x then y, then verify by substitution.",
        graph: "simultaneous-2-example-1.svg",
        caption: "M(x, y) is unknown before calculation; calculator gives M(4, 3).",
        customGraph: true,
        steps: [
          "Enter Row 1 then Row 2 in order using the key sequence above.",
          "Key sequence: MODE → 6 → 2 → slot, then 1 【EXE】 1 【EXE】 7 【EXE】 1 【EXE】 −1 【EXE】 1 【EXE】.",
          "Read outputs: first pause x = 4, EXE gives y = 3, so M = (4, 3).",
          "Exam check: 4 + 3 = 7 and 4 − 3 = 1, both true.",
        ],
      },
      {
        title: "2x − y = 1, x + 3y = 11",
        question: "Find x and y from the simultaneous equations 2x − y = 1 and x + 3y = 11.",
        given: "Two straight lines intersect at point M(x, y).",
        givenLines: [
          "Line 1: 2x − y = 1",
          "Line 2: x + 3y = 11",
          "For Ax + By = C input format:",
          "Row 1 (A, B, C) = (2, −1, 1)",
          "Row 2 (D, X, Y) = (1, 3, 11)",
        ],
        lead: "Follow the same DSE flow: identify rows, key in values, read M, and verify in both lines.",
        graph: "simultaneous-2-example-2.svg",
        caption: "Unknown point M is solved as M(2, 3).",
        customGraph: true,
        steps: [
          "Enter Row 1 then Row 2 in order.",
          "Key sequence: 2 EXE −1 EXE 1 EXE 1 EXE 3 EXE 11 EXE.",
          "Outputs: x = 2, then y = 3, so M = (2, 3).",
          "Check: 2(2) − 3 = 1 and 2 + 3(3) = 11.",
        ],
      },
      {
        title: "Parallel lines (no unique solution)",
        edge: true,
        question: "Does a single pair (x, y) satisfy both x + y = 1 and 2x + 2y = 5?",
        given: "Two lines are given. Test whether a common point M(x, y) exists.",
        givenLines: [
          "Line 1: x + y = 1",
          "Line 2: 2x + 2y = 5",
          "For Ax + By = C input format:",
          "Row 1 (A, B, C) = (1, 1, 1)",
          "Row 2 (D, X, Y) = (2, 2, 5)",
        ],
        lead: "This is an exam edge case: same slope, different intercept, so no intersection point exists.",
        graph: "simultaneous-2-example-3.svg",
        caption: "No single (?, ?) pair exists because both lines are parallel.",
        customGraph: true,
        steps: [
          "Enter Row 1 then Row 2 in order.",
          "Key sequence: 1 EXE 1 EXE 1 EXE 2 EXE 2 EXE 5 EXE.",
          "Math ERROR because determinant AY − BX = 1·2 − 1·2 = 0.",
          "Conclusion for script: no unique M(x, y); the lines are parallel (or coincident in other AY−BX=0 cases).",
        ],
      },
    ],
    note: "This is Cramer’s rule with the second y-coefficient stored in X (there is no variable E). If the first y-coefficient B is 0, swap the two equations before typing.",
  },
  {
    slug: "quadratic",
    title: "Quadratic Equation",
    short: "Quadratic",
    bytes: "42 bytes",
    mode: "COMP; use CMPLX when the discriminant is negative",
    aliases: ["一元二次方程", "vertex", "enhanced quadratic"],
    keywords: ["discriminant", "roots", "vertex", "FMLA 01"],
    formulas: ["Ax² + Bx + C = 0"],
    summary: "Compact HK quadratic: both roots and the vertex. 42 bytes.",
    desc: "FMLA 01 already solves real roots, so the stored program is the one that also keeps the vertex and works for complex roots in CMPLX. Prompts A, B, C. Displays the two roots. After the run, RCL C is vertex x = −B/(2A) and RCL M is vertex y.",
    code: "?→A:?→B:?→M:−B÷(2A→C:AC²M−:C+√(−M÷A→A◢2C−Ans→B",
    graph: "quadratic.svg",
    caption: "x² − 7x + 12 = 0 crosses at 4 and 3. Vertex (3.5, −0.25).",
    examples: [
      {
        title: "x² − 7x + 12 = 0",
        lead: "A = 1, B = −7, C = 12.",
        steps: [
          "1 EXE  −7 EXE  12 EXE",
          "Display 4. EXE → 3",
          "RCL C → 3.5 (vertex x). RCL M → −0.25 (vertex y)",
        ],
      },
      {
        title: "x² + 6x + 25 = 0 (complex)",
        lead: "Create the slot in CMPLX. Discriminant 36 − 100 = −64.",
        steps: [
          "MODE → 6 → 1 → unused slot → 2 (CMPLX), paste the line, then Run",
          "1 EXE  6 EXE  25 EXE",
          "R<=>I appears. Display −3; SHIFT EXE (Re⇔Im) → 4i. EXE → −3; SHIFT EXE → −4i",
          "Roots −3 ± 4i. Vertex still RCL C = −3, RCL M = 16",
        ],
      },
      {
        title: "Double root (x − 3)² = 0",
        edge: true,
        lead: "A = 1, B = −6, C = 9. Both pauses show 3.",
        steps: [
          "1 EXE  −6 EXE  9 EXE",
          "Display 3. EXE → 3. Vertex is the same point (3, 0)",
        ],
      },
    ],
    note: "M− is SHIFT M+ (subtract from independent memory). Set d/c (SHIFT MODE ▶ ▶ 2) if you want improper fractions.",
  },
  {
    slug: "four-centres",
    title: "Triangle Four Centres",
    short: "Four Centres",
    bytes: "~90 bytes",
    mode: "COMP, Deg",
    aliases: ["四心", "incenter", "circumcenter", "orthocenter", "centroid"],
    keywords: ["triangle", "G", "O", "H", "I"],
    formulas: ["G = (A+B+C)/3", "H = 3G − 2O"],
    summary: "Centroid and circumcentre from three vertices; orthocentre from Euler’s line. ~90 bytes.",
    desc: "AfterSchool lists this as the other DSE must-enter program next to 2×2 linear systems. Enter vertices (A,B), (C,D), (X,Y). Four pauses: centroid Gx, Gy, then circumcentre Ox, Oy. Orthocentre is H = 3G − 2O (Euler: G divides OH in 2 : 1). Incentre is the side-length weighted average of the vertices.",
    code: "?→A:?→B:?→C:?→D:?→X:?→Y:(A+C+X)÷3◢(B+D+Y)÷3◢2((C−A)(Y−B)−(X−A)(D−B→M:((C²+D²−A²−B²)(Y−B)−(X²+Y²−A²−B²)(D−B))÷M→M◢((X²+Y²−A²−B²)(C−A)−(C²+D²−A²−B²)(X−A))÷(2((C−A)(Y−B)−(X−A)(D−B)))",
    graph: "four-centres.svg",
    caption: "Right triangle (4,3), (0,0), (4,0): G (8/3, 1), H (4, 0), O (2, 3/2), I (3, 1).",
    examples: [
      {
        title: "Vertices (4, 3), (0, 0), (4, 0)",
        lead: "Right-angled at (4, 0). Hypotenuse from (0, 0) to (4, 3).",
        steps: [
          "4 EXE  3 EXE  0 EXE  0 EXE  4 EXE  0 EXE",
          "Gx = 8/3. EXE → Gy = 1  (centroid)",
          "EXE → Ox = 2. EXE → Oy = 3/2  (circumcentre, midpoint of the hypotenuse)",
          "Orthocentre H = 3G − 2O = (4, 0), the right-angle vertex. Incentre I = (3, 1)",
        ],
      },
      {
        title: "Vertices (0, 0), (4, 0), (0, 3)",
        lead: "Right-angled at the origin.",
        steps: [
          "0 EXE  0 EXE  4 EXE  0 EXE  0 EXE  3 EXE",
          "G = (4/3, 1). O = (2, 3/2). H = 3G − 2O = (0, 0)",
        ],
      },
      {
        title: "Collinear points",
        edge: true,
        lead: "(0, 0), (2, 0), (5, 0) are not a triangle.",
        steps: [
          "0 EXE  0 EXE  2 EXE  0 EXE  5 EXE  0 EXE",
          "G still prints (the average). Circumcentre hits Math ERROR (denominator 0). That is the ‘not a triangle’ signal",
        ],
      },
    ],
    note: "If two points share a y-coordinate the circumcentre formula can hit Math ERROR — enter a point with a distinct y first. Long published listings (~227 bytes) also print incentre, circumradius, and the circumcircle equation using SD memories.",
  },
  {
    slug: "circle-centre",
    title: "Circle Centre and Radius",
    short: "Circle Centre",
    bytes: "42 bytes",
    mode: "COMP",
    aliases: ["圓心半徑", "general circle equation"],
    keywords: ["Ax²+Ay²", "h", "k", "r"],
    formulas: ["A(x² + y²) + Dx + Ey + F = 0"],
    summary: "Centre and radius from the general circle equation. 42 bytes.",
    desc: "Prompts A (the common x² and y² coefficient), then D, E, F in Ax² + Ay² + Dx + Ey + F = 0. Pauses: h, k, r where centre is (−D/2A, −E/2A).",
    code: "?→A:?→B:?→C:?→D:−B÷(2A→B◢−C÷(2A◢√(B²+Ans²−D÷A",
    graph: "circle-centre.svg",
    caption: "x² + y² − 4x + 6y − 12 = 0 is the circle centre (2, −3), radius 5.",
    examples: [
      {
        title: "x² + y² − 4x + 6y − 12 = 0",
        lead: "A = 1, D = −4, E = 6, F = −12.",
        steps: [
          "1 EXE  −4 EXE  6 EXE  −12 EXE",
          "Display 2. EXE → −3  (centre (2, −3))",
          "EXE → 5  (radius)",
        ],
      },
      {
        title: "2x² + 2y² − 8x + 0y − 8 = 0",
        lead: "Same circle as (x−2)² + y² = 6, scaled by 2.",
        steps: [
          "2 EXE  −8 EXE  0 EXE  −8 EXE",
          "Centre (2, 0). Radius √6 ≈ 2.449",
        ],
      },
      {
        title: "Point ‘circle’ (radius 0)",
        edge: true,
        lead: "(x−1)² + (y−2)² = 0 → x² + y² − 2x − 4y + 5 = 0.",
        steps: [
          "1 EXE  −2 EXE  −4 EXE  5 EXE",
          "Centre (1, 2). Radius 0 — a single point, not a curve",
        ],
      },
    ],
    note: "If A = 0 this is a line, not a circle (Math ERROR on the last pause). Complete the square by hand to check.",
  },
  {
    slug: "circle-3pt",
    title: "Circle from Three Points",
    short: "Circle 3 Points",
    bytes: "131 bytes",
    mode: "COMP; d/c fractions recommended",
    aliases: ["三點求圓", "circumcircle"],
    keywords: ["three points", "D", "E", "F"],
    formulas: ["x² + y² + Dx + Ey + F = 0"],
    summary: "Circumcircle of three points: centre, radius, then D, E, F. 131 bytes.",
    desc: "Enter (x1,y1), (x2,y2), (x3,y3). Pauses: h, k, r, then D, E, F for x² + y² + Dx + Ey + F = 0. Uses Pol so the first radius pause is r on the display; skip it if you only need the equation coefficients from the later pauses.",
    code: "?→A:?→B:?→C:?→D:(C−A)÷(B−D→Y:B+D−YA−YC→X:?→C:?→D:(C−A)÷(B−D→M:B+D−MA−MC→B:(B−X)÷(2Y−2M→A◢M Ans+B÷2→B◢√((A−C)²+(B−D)²→X◢−2A◢−2B◢A²+B²−X²",
    graph: "circle-3pt.svg",
    caption: "Points (2,0), (0,1), (0,4) lie on x² + y² − 4x − 5y + 4 = 0. Centre (2, 5/2), radius 5/2.",
    examples: [
      {
        title: "Points (2, 0), (0, 1), (0, 4)",
        lead: "Standard IceCreamTutor check.",
        steps: [
          "SHIFT MODE ▶ ▶ 2 (d/c), then Run",
          "2 EXE  0 EXE  0 EXE  1 EXE  0 EXE  4 EXE",
          "h = 2. EXE → k = 5/2. EXE → r = 5/2",
          "EXE → D = −4. EXE → E = −5. EXE → F = 4",
          "Equation x² + y² − 4x − 5y + 4 = 0",
        ],
      },
      {
        title: "Right triangle (0, 0), (6, 0), (0, 8)",
        lead: "Hypotenuse from (6, 0) to (0, 8); centre is the midpoint (3, 4), radius 5.",
        steps: [
          "0 EXE  0 EXE  6 EXE  0 EXE  0 EXE  8 EXE",
          "If Math ERROR, swap so two points do not share a y-value as the first pair — enter (0, 8) first: 0 EXE 8 EXE 0 EXE 0 EXE 6 EXE 0 EXE",
          "Centre (3, 4), radius 5. x² + y² − 6x − 8y = 0",
        ],
      },
      {
        title: "Collinear points",
        edge: true,
        lead: "(0, 0), (1, 1), (2, 2) have no finite circumcircle.",
        steps: [
          "0 EXE  0 EXE  1 EXE  1 EXE  2 EXE  2 EXE",
          "Math ERROR — the three points are collinear",
        ],
      },
    ],
    note: "If two points share the same y, the first slope is undefined. Put a point with a different y in the first pair. After the run, RCL A and RCL B are the centre.",
  },
  {
    slug: "cubic",
    title: "Cubic Equation",
    short: "Cubic",
    bytes: "~70 bytes",
    mode: "COMP; CMPLX if the quadratic factor has complex roots",
    aliases: ["一元三次方程", "Newton deflation"],
    keywords: ["cubic", "Newton", "synthetic division"],
    formulas: ["Ax³ + Bx² + Cx + D = 0"],
    summary: "Newton for one real root, then the quadratic factor. ~70 bytes.",
    desc: "HK listings of a full Cardano cubic are ~126 bytes and need CMPLX. This compact exam version asks for A, B, C, D and an initial guess M, Newton-iterates to a real root, then deflates to a quadratic and prints the other two roots. Stop Newton when |f| drops below 10⁻⁷.",
    code: "?→A:?→B:?→C:?→D:?→M:Lbl 0:((AM+B)M+C)M+D→Y:(3AM+2B)M+C:M−Y÷Ans→M:Abs(Y)≥10^(−7)⇒Goto 0:M◢B+AM→Y:AM²+BM+C→X:(√(Y²−4AX)−Y)÷(2A◢(−Y−√(Y²−4AX))÷(2A",
    graph: "cubic.svg",
    caption: "x³ − 6x² + 11x − 6 = (x−1)(x−2)(x−3). Guess M = 0 walks to the root 1, then 2 and 3.",
    examples: [
      {
        title: "x³ − 6x² + 11x − 6 = 0",
        lead: "A,B,C,D = 1, −6, 11, −6. Guess M = 0.",
        steps: [
          "1 EXE  −6 EXE  11 EXE  −6 EXE  0 EXE",
          "First pause: 1 (Newton root). EXE → 2. EXE → 3",
        ],
      },
      {
        title: "Guess near a different root",
        lead: "Same polynomial, guess M = 5 walks to 3 first.",
        steps: [
          "1 EXE  −6 EXE  11 EXE  −6 EXE  5 EXE",
          "Pauses 3, then 1 and 2 (order of the last two follows the quadratic formula)",
        ],
      },
      {
        title: "x³ + x = 0 → 0, ±i",
        edge: true,
        lead: "A,B,C,D = 1, 0, 1, 0. Guess 0. The quadratic is x² + 1. Run the slot in CMPLX to print ±i.",
        steps: [
          "CMPLX slot. 1 EXE  0 EXE  1 EXE  0 EXE  0 EXE",
          "First root 0. Next pauses: i and −i (R<=>I). In COMP you get Math ERROR on √(−1)",
        ],
      },
    ],
    note: "10^(−7) is the Newton stop. If f′(M) = 0 Newton hits Math ERROR — try another guess. A published Cardano listing (~126 bytes, CMPLX) prints all three roots without a guess.",
  },
  {
    slug: "sequences",
    title: "Arithmetic and Geometric Sequences",
    short: "AP / GP",
    bytes: "64 bytes",
    mode: "COMP",
    aliases: ["等差等比數列", "AP", "GP", "infinite series"],
    keywords: ["nth term", "partial sum", "infinite GP"],
    formulas: ["Tn = A + (C−1)B", "Sn = C(A+Tn)/2", "Tn = A B^(C−1)"],
    summary: "AP or GP nth term and sum; infinite GP when |r| < 1. 64 bytes.",
    desc: "First prompt Y selects the family: 0 = arithmetic, 1 = geometric. Then A (first term), B (common difference or ratio), C (n). AP pauses: Tn, Sn. GP pauses: Tn, Sn, then S∞ = A/(1−B). tanh⁻¹(B) is a gate: if |B| ≥ 1 the infinite-sum step throws Math ERROR, which is the correct ‘no S∞’ signal.",
    code: "?→Y:?→A:?→B:?→C:If Y:Then AB^(C−1◢(A−B Ans)÷(1−B◢tanh⁻¹(B:A÷(1−B:Else A+BC−B◢C÷2(A+Ans",
    graph: "sequences.svg",
    caption: "AP 2, 5, 8, … (d = 3). T₂₀ = 59 and S₂₀ = 610.",
    examples: [
      {
        title: "AP first term 2, difference 3, n = 20",
        lead: "Y = 0.",
        steps: [
          "0 EXE  2 EXE  3 EXE  20 EXE",
          "T₂₀ = 59. EXE → S₂₀ = 610",
          "AC — do not EXE into the GP branch",
        ],
      },
      {
        title: "GP first term 1024, ratio 1/2, n = 10",
        lead: "Y = 1.",
        steps: [
          "1 EXE  1024 EXE  0.5 EXE  10 EXE",
          "T₁₀ = 2. EXE → S₁₀ = 2046. EXE → S∞ = 2048",
        ],
      },
      {
        title: "GP with |r| ≥ 1 (no infinite sum)",
        edge: true,
        lead: "A = 3, B = 2, C = 5. T₅ = 48, S₅ = 93, then Math ERROR on S∞.",
        steps: [
          "1 EXE  3 EXE  2 EXE  5 EXE",
          "48, then 93, then Math ERROR on tanh⁻¹(2). That error means S∞ does not exist",
        ],
      },
    ],
    note: "tanh⁻¹ is SHIFT hyp tan. For AP, AC after the two pauses. Sn for GP uses A(1−rⁿ)/(1−r); r = 1 is a separate Math ERROR (division by 0) — handle T = A, S = nA by hand.",
  },
  {
    slug: "line",
    title: "Two-Point Line",
    short: "Two-Point Line",
    bytes: "49 bytes",
    mode: "COMP",
    aliases: ["直線方程", "slope intercept", "two point form"],
    keywords: ["distance", "slope", "y-intercept"],
    formulas: ["y = mx + c", "d = √((x1−x2)²+(y1−y2)²)"],
    summary: "Distance, slope, and y-intercept from two points. 49 bytes.",
    desc: "Enter A,B = (x1,y1) and X,Y = (x2,y2). Pauses: distance, slope m, intercept c so the line is y = mx + c. After the run RCL D, RCL M, RCL C keep those three numbers.",
    code: "?→A:?→B:?→X:?→Y:A−X→X:B−Y→Y:√(X²+Y²→D◢Y÷X→M◢B−MA→C",
    graph: "line.svg",
    caption: "(3, −2) and (4, 1) determine y = 3x − 11. Distance √10 ≈ 3.162.",
    examples: [
      {
        title: "A(3, −2), B(4, 1)",
        lead: "WebCal check example.",
        steps: [
          "3 EXE  −2 EXE  4 EXE  1 EXE",
          "Distance ≈ 3.162. EXE → slope 3. EXE → intercept −11",
          "Line y = 3x − 11",
        ],
      },
      {
        title: "Horizontal line (1, 5) and (4, 5)",
        lead: "Slope 0, intercept 5, distance 3.",
        steps: [
          "1 EXE  5 EXE  4 EXE  5 EXE",
          "3, then 0, then 5. Equation y = 5",
        ],
      },
      {
        title: "Vertical line (2, 1) and (2, 4)",
        edge: true,
        lead: "Δx = 0 so slope is undefined.",
        steps: [
          "2 EXE  1 EXE  2 EXE  4 EXE",
          "Distance 3, then Math ERROR on Y÷X. The line is x = 2; this program cannot print a y = mx + c form",
        ],
      },
    ],
    note: "Last assignment uses original B (y1) and A (x1); X and Y have already become Δx and Δy. For a perpendicular bisector, slope is −1/M and the line passes through the midpoint.",
  },
  {
    slug: "polar",
    title: "Polar ↔ Rectangular",
    short: "Pol / Rec",
    bytes: "~40 bytes",
    mode: "COMP, Deg (or Rad to match SET UP)",
    aliases: ["極座標", "Pol Rec program"],
    keywords: ["Pol", "Rec", "r", "θ"],
    formulas: ["Pol(x, y)", "Rec(r, θ)"],
    summary: "Looping Pol/Rec with θ (or y) in Y. ~40 bytes.",
    desc: "M1/M2 students store this so they do not forget that θ lives in Y. First prompt M: 0 = Rec, anything else = Pol. Then two numbers. First pause is r or x; EXE then RCL Y is not needed because the program already pauses Y (θ or y).",
    code: "?→M:?→A:?→B:If M:Then Pol(A,B◢RCL Y:Else Rec(A,B◢RCL Y:IfEnd",
    graph: "polar.svg",
    caption: "Pol(3, 4) → r = 5, θ ≈ 53.13° in Deg.",
    examples: [
      {
        title: "Pol(3, 4) in Deg",
        lead: "M ≠ 0 selects Pol.",
        steps: [
          "SHIFT MODE 1 (Deg) if needed",
          "1 EXE  3 EXE  4 EXE",
          "r = 5. EXE → θ ≈ 53.13°",
        ],
      },
      {
        title: "Rec(5, 53.13°)",
        lead: "M = 0 selects Rec.",
        steps: [
          "0 EXE  5 EXE  53.13 EXE",
          "x ≈ 3. EXE → y ≈ 4",
        ],
      },
      {
        title: "Point on the negative x-axis",
        edge: true,
        lead: "Pol(−2, 0) should give r = 2, θ = 180° (or −180° depending on range).",
        steps: [
          "1 EXE  −2 EXE  0 EXE",
          "r = 2. EXE → 180 (or −180). Rec of that pair returns (−2, 0)",
        ],
      },
    ],
    note: "Pol/Rec also exist as SHIFT + and SHIFT − without a program; the stored line is for repeated conversion in one Run. θ range is −180° < θ ≤ 180°.",
  },
  {
    slug: "freq-sd",
    title: "Frequency Table → SD",
    short: "Freq → SD",
    bytes: "85 bytes",
    mode: "SD, FreqOn",
    aliases: ["方差標準差", "frequency table", "S-VAR"],
    keywords: ["DT", "FreqOn", "mean", "σx"],
    formulas: ["x̄ = Σx / n", "variance = σx²"],
    summary: "SD-mode loop: enter (value, frequency) pairs, then S-VAR. 85 bytes.",
    desc: "dse.best lists a frequency-entry helper because MODE 4 plus ; is easy to mistype under exam pressure. Create the slot in SD. The program turns FreqOn, clears old STAT data, then loops ? → X, ? → Y, X ; Y DT. AC when the table is finished, then SHIFT 2 (S-VAR) for x̄, σx, sx. Variance is σx² (population) or sx² (sample).",
    code: "FreqOn:ClrStat:Lbl 0:?→X:?→Y:X ; Y DT:Goto 0",
    graph: "freq-sd.svg",
    caption: "Classes 75×1, 80×2, 85×4. n = 7, mean pulled toward 85.",
    examples: [
      {
        title: "75 once, 80 twice, 85 four times",
        lead: "Same table as the SD page on this site.",
        steps: [
          "MODE → 6 → 2 → slot (program was created in SD)",
          "75 EXE  1 EXE  80 EXE  2 EXE  85 EXE  4 EXE",
          "AC to leave the loop",
          "SHIFT 2 → 1 EXE → x̄ ≈ 82.143. SHIFT 2 → 2 or 3 for σx / sx. Square it for variance",
        ],
      },
      {
        title: "Five equal scores of 10",
        lead: "One row: 10 ; 5.",
        steps: [
          "10 EXE  5 EXE, AC",
          "n = 5, x̄ = 10, σx = 0, variance 0",
        ],
      },
      {
        title: "FreqOff leftover",
        edge: true,
        lead: "If you created the program in SD but FreqOff is still on, X ; Y DT is Syntax ERROR.",
        steps: [
          "The first statement FreqOn in the listing forces frequency on each run",
          "If you still see Syntax ERROR, enter SD with MODE 4, SHIFT MODE ◀ ◀ 1, then run again",
        ],
      },
    ],
    note: "ClrStat is SHIFT 9 1 while editing. DT is the M+ key in SD. Maximum 40 FreqOn records. This program does not print σ itself — it only loads the list.",
  },
  {
    slug: "line-quad",
    title: "Line ∩ Quadratic",
    short: "Line ∩ Quad",
    bytes: "219 bytes (205 without storing both solution pairs)",
    mode: "COMP; CMPLX if you need complex intersection points",
    aliases: ["聯立二元一為一次及一為二次方程", "line circle intersection", "simultaneous5a"],
    keywords: ["line", "circle", "parabola", "substitution"],
    formulas: ["Dx + Yy = C", "M x² + B xy + A y² + X x + Y y = K"],
    summary: "Compulsory DSE listing: intersections of a line with a circle or other conic. 219 bytes.",
    desc: "FMLA 01 only solves the quadratic after you have already substituted. This WebCal / IceCreamTutor version II listing (no zero-coefficient trap) takes the line Dx + Yy = C, then the conic M x² + B xy + A y² + X x + Y y = K. It prints (x₁, y₁) then (x₂, y₂). The same run also solves a 2×2 linear system if you enter zeros for the quadratic terms. ┘ is the a b/c key, not ÷, so rational answers stay as fractions.",
    code: "?→D:?→Y:?→C:?→M:?→B:?→A:?→X:If Y:Then D┘Y→D:C┘Y→C:AD²-DBM+:?→Y:YD-CB+2CDA-X→B:?→X:AC²+YC-X→A:2M⇒(√(B²-4MA)+B)┘Ans→X◢M=0⇒A┘B→X◢C-DX→Y◢B┘M-X→A◢C-DAns→B:Else C┘D→D:?→Y:?→C:D²M+XD-C→M:-Y-DB→B:D→X◢A=0⇒M┘B→Y◢2A⇒(√(B²-4MA)+B)┘Ans→Y◢B┘A-Ans→B:D→A◢B",
    graph: "line-quad.svg",
    caption: "Vertical line x = 2 cuts x² + y² + 3x + 7y + 2 = 0 at (2, −3) and (2, −4).",
    examples: [
      {
        title: "3x + 5y = 8 and 3x² + 4xy + 5y² + 3x + 5y = 20",
        lead: "Line 3, 5, 8 then conic 3, 4, 5, 3, 5, 20.",
        steps: [
          "3 EXE  5 EXE  8 EXE  3 EXE  4 EXE  5 EXE  3 EXE  5 EXE  20 EXE",
          "First point (1, 1). EXE EXE → second point (1/3, 7/5)",
          "RCL X, RCL Y = first point. RCL A, RCL B = second point",
        ],
      },
      {
        title: "x = 2 and x² + y² + 3x + 7y + 2 = 0",
        lead: "Rewrite as x + 0y = 2 and x² + y² + 3x + 7y = −2. Version I died on the 0; this listing does not.",
        steps: [
          "1 EXE  0 EXE  2 EXE  1 EXE  0 EXE  1 EXE  3 EXE  7 EXE  −2 EXE",
          "Display (2, −3). EXE EXE → (2, −4)",
        ],
      },
      {
        title: "Falls back to 2×2 linear",
        edge: true,
        lead: "x + y = 7 and x − y = 1. Quadratic coefficients all 0.",
        steps: [
          "1 EXE  1 EXE  7 EXE  0 EXE  0 EXE  0 EXE  1 EXE  −1 EXE  1 EXE",
          "Display x = 4. EXE → y = 3. Equal pair ⇒ a ‘tangent’ with only one point",
        ],
      },
    ],
    note: "If the two printed points coincide, the line is tangent. Math ERROR on the second point (and the points are not equal) means only one real intersection. SHIFT MODE → → 2 (improper d/c) keeps the fractions. Source: WebCal simultaneous5a / IceCreamTutor simultaneous5a.",
  },
  {
    slug: "simultaneous-3",
    title: "Simultaneous Linear (3 Unknowns) / Det / Inverse",
    short: "Simultaneous 3",
    bytes: "153 bytes (Cramer) or 112 bytes (adjoint)",
    mode: "REG Lin (MODE 6 → 1 → slot → 5 → 1)",
    aliases: ["聯立三元一次", "3x3 determinant", "adjoint inverse"],
    keywords: ["Cramer", "3x3", "maxX", "FreqOn", "adjoint"],
    formulas: ["a₁x + b₁y + c₁z = d₁", "det A", "A⁻¹ = (1/det A) adj A"],
    summary: "3×3 linear system and determinant, plus a 112-byte adjoint for the inverse. REG Lin.",
    desc: "No FMLA does a 3×3 system. WebCal version II is full Cramer’s rule in REG Lin (no b₁c₂ ≠ b₂c₁ trap). Prompts are row-wise a, b, c, d. First pause is det; then x, y, z. Skip each d with EXE to get only the determinant. Inverse: either solve three times with right-hand sides (1,0,0), (0,1,0), (0,0,1), or type the 112-byte adjoint listing and divide by det. ┘ is a b/c. maxX / maxY / n are S-VAR / S-SUM tokens, not letters.",
    code: "FreqOn:?→A:?→B:?→C:?→D:?→X:?→Y:?→M:A:?→A:AnsY−BX,AnsA−XD;AnsM−XC DT:BM−YC→X:BA−YD→Y:CA−MD→M:?→A:?→B:?→C:?→D:AX+CmaxX−Bn◢(DX−CY+BM)┘Ans◢AX+CmaxX−Bn→X:(CmaxY−AM−Dn)┘X◢(AY+DmaxX−BmaxY)┘X",
    listings: [
      {
        title: "Adjoint / inverse (112 bytes, REG Lin)",
        lead: "Row-major a11…a33. Pauses are adj entries, last pause is det. Inverse = each adjoint entry ÷ det.",
        code: "ClrStat:?→A:?→B:?→C:?→D:?→X:?→Y:?→M:A,X DT:?→A:?→X:XΣy−YA◢CA−BX◢BY−CΣy◢YM−DX◢ΣxX−CM◢CD−ΣxY◢DA−ΣyM◢AnsC→C:BM−ΣxA◢YAns→Y:Σxy−BD◢AnsX+C+Y",
      },
    ],
    graph: "simultaneous-3.svg",
    caption: "x + y + z = 6, x − y + 2z = 5, x + 3y + z = 10 meet at (1, 2, 3).",
    examples: [
      {
        title: "x + y + z = 6, x − y + 2z = 5, x + 3y + z = 10",
        lead: "Cramer listing. Rows (1,1,1,6), (1,−1,2,5), (1,3,1,10).",
        steps: [
          "MODE → 6 → 2 → slot (created in REG Lin, FreqOn)",
          "1 EXE  1 EXE  1 EXE  6 EXE  1 EXE  −1 EXE  2 EXE  5 EXE  1 EXE  3 EXE  1 EXE  10 EXE",
          "det = −2. EXE → x = 1. EXE → y = 2. EXE → z = 3",
        ],
      },
      {
        title: "Determinant only",
        lead: "|1 2 3 ; 7 8 9 ; 6 5 2| = 12. EXE through each right-hand side.",
        steps: [
          "1 EXE  2 EXE  3 EXE  EXE  7 EXE  8 EXE  9 EXE  EXE  6 EXE  5 EXE  2 EXE  EXE",
          "Display 12. AC. det is also in X",
        ],
      },
      {
        title: "Inverse via adjoint",
        edge: true,
        lead: "[[2,1,3],[7,4,6],[8,9,7]], det = 40. Use the 112-byte listing.",
        steps: [
          "2 EXE  1 EXE  3 EXE  7 EXE  4 EXE  6 EXE  8 EXE  9 EXE  7 EXE",
          "Adjoint row-major: −26, 20, −6, −1, −10, 9, 31, −10, 1, then det 40",
          "Each inverse entry is adjoint ÷ 40. MODE 1 when finished with REG",
        ],
      },
    ],
    note: "FreqOn is SHIFT MODE ◀ ◀ 1. n is SHIFT 1 3. maxX is SHIFT 2 2 2. maxY is SHIFT 2 2 → 2. Σx / Σy / Σxy are SHIFT 1 2, SHIFT 1 → 2, SHIFT 1 → 3. Comma between paired DT values. Math ERROR on Cramer means det = 0. Source: WebCal simultaneous8 and Abjont_1.",
  },
  {
    slug: "newton",
    title: "Newton’s Method",
    short: "Newton",
    bytes: "51 bytes plus the function",
    mode: "COMP",
    aliases: ["牛頓法", "Newton-Raphson", "numerical root"],
    keywords: ["iteration", "f(M)", "numerical derivative"],
    formulas: ["xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)"],
    summary: "General real root of f(x) = 0. Edit the green f(M). 51 bytes plus the function.",
    desc: "No solver key. This WebCal Newton I listing approximates f′ with a 10⁻⁷ step, so you do not type a derivative. The green M³ − 2M − 1 is f(M); change only that expression (variable must stay M). Prompt is the first guess. Each EXE is the next iterate. AC when the digits freeze. E is EXP, so E−7 is 10⁻⁷.",
    code: "ClrMemory:?→M:Lbl 0:C→A:M³−2M−1→C:B=0→B:Ans⇒E−7M+⇒Goto 0:E−7(1+A÷(C−A)M−:M◢Goto 0",
    graph: "newton.svg",
    caption: "y = x³ − 2x − 1. Guess 1; the first Newton step lands at 3, then walks to ≈ 1.618.",
    examples: [
      {
        title: "x³ − 2x − 1 = 0, guess 1",
        lead: "Leave the listing as shipped. The unique real root is the golden-ratio value 2 cos(π/5) ≈ 1.618034.",
        steps: [
          "1 EXE → 3",
          "EXE → 2.2",
          "Keep EXE. By the sixth pause the display is 1.618034049",
        ],
      },
      {
        title: "Same polynomial, guess 0",
        lead: "A worse start still converges, just with more steps.",
        steps: [
          "0 EXE, then EXE until the digits stop changing",
          "Same limit ≈ 1.618034",
        ],
      },
      {
        title: "Change f — here x² − 2 = 0",
        edge: true,
        lead: "While editing, replace M³−2M−1 with M²−2. Guess 1 for √2.",
        steps: [
          "Edit the green expression only. Variable stays M",
          "1 EXE, then EXE until 1.414213562",
          "Guess −1 if you want the negative root",
        ],
      },
    ],
    note: "First iterate can jump (1 → 3 on the shipped f). If f′ is nearly 0 you get Math ERROR or a wild jump — try another guess. ClrMemory wipes A–D, X, Y, M; swap it for 0→B if you must keep a constant in another letter. Source: WebCal newton.htm.",
  },
  {
    slug: "simpson",
    title: "Simpson’s Rule",
    short: "Simpson",
    bytes: "61 bytes plus the integrand",
    mode: "COMP, Rad if the integrand uses sin/cos/tan",
    aliases: ["辛卜生", "森遜", "definite integral", "numerical integration"],
    keywords: ["even n", "For Next", "ln X"],
    formulas: ["∫ₐᵇ f(x) dx ≈ (h/3)(y₀ + 4y₁ + 2y₂ + … + yₙ)"],
    summary: "Definite integral. No ∫ key. Edit ln(X). Even number of strips.",
    desc: "The fx-50FH II has no definite-integral button. This WebCal Simpson listing asks for lower X, upper Y, then even strip count A. The green ln(X) is f(X); change only that (variable must stay X). πr forces cosine into radians so the 4–2–4 Simpson weights work even if SET UP is Deg. For 0→B To A and Next come from SHIFT 3 (P-CMD).",
    code: "ClrMemory:?→X:?→Y:?→A:A⁻¹(Y−X→Y:For 0→B To A:ln(X:Ans(3−cos(πrB)−(B²=BA)M+:X+Y→X:Next:YM÷3",
    graph: "simpson.svg",
    caption: "Simpson strips under y = ln x from 1 to 2. n = 10 gives ≈ 0.386293.",
    examples: [
      {
        title: "∫₁² ln x dx, 10 strips",
        lead: "Exact value is 2 ln 2 − 1 ≈ 0.386294361.",
        steps: [
          "1 EXE  2 EXE  10 EXE",
          "Display ≈ 0.386293403",
        ],
      },
      {
        title: "Same integral, 2 strips (coarse)",
        lead: "Even n is required. Two strips is the coarsest legal run.",
        steps: [
          "1 EXE  2 EXE  2 EXE",
          "A rougher approximation — use this only to check the listing, not for marks",
        ],
      },
      {
        title: "Change f — here ∫₀¹ e^X dX",
        edge: true,
        lead: "Replace ln(X) with e^(X. Lower 0, upper 1, n = 10. Exact e − 1 ≈ 1.718281828.",
        steps: [
          "Edit only the green integrand. Variable stays X",
          "0 EXE  1 EXE  10 EXE",
          "Odd n is illegal for Simpson: the weights 4-2-4 break",
        ],
      },
    ],
    note: "πr is π (SHIFT EXP) then the r suffix (SHIFT Ans 2). A⁻¹ is the x⁻¹ key after A. Trigonometric integrands: SET UP Rad. Source: WebCal simpson.htm (61-byte For/Next version).",
  },
  {
    slug: "inverse-normal",
    title: "Inverse Standard Normal",
    short: "Inverse Normal",
    bytes: "156 bytes",
    mode: "COMP",
    aliases: ["反查標準常態", "inverse Φ", "z from p"],
    keywords: ["linear interpolation", "DSE table", "Fix", "Rnd"],
    formulas: ["P(0 ≤ Z ≤ x) = p", "x = Φ⁻¹(0.5 + p)"],
    summary: "z from a central probability. FMLA 04/05 only go the other way. 156 bytes.",
    desc: "FMLA 04/05 map z → probability. This WebCal DSE-accurate inverse listing maps p = P(0 ≤ Z ≤ x) → x using the exam table plus linear interpolation, so the digits match the HKEAA book. Prompt is p with 0 < p < 0.5. Table hits (two decimal z) print as a terminating two-decimal x. In-between values print the interpolated z; RCL A, B are the two table probabilities and RCL Y, M are the two z-grid points for the written working.",
    code: "?→C:ln(1−4C²:Fix 2:Rnd(√(−Ans−8+√(Ans²−9Ans+64→M:M→Y:Fix 4:Lbl 0:B→A:2÷(2+.4633M:Rnd(.5−E−4e^(−.5M²)Ans(1274−1422Ans+Ans²(7107−7266Ans+5307Ans²→B:(M=Y)+(A=B⇒.01−.02(B>C)M+⇒Goto 0:Norm 1:Y+(Y−M)(C−A)÷(A−B",
    related: ["fmla/04-normal-p", "fmla/05-normal-r"],
    graph: "inverse-normal.svg",
    caption: "P(0 ≤ Z ≤ 1.23) = 0.3907. Inverse of 0.3907 returns 1.23.",
    examples: [
      {
        title: "P(0 ≤ Z ≤ x) = 0.3907",
        lead: "This p sits on the printed table, so x is exactly two decimals.",
        steps: [
          "0.3907 EXE",
          "Display 1.23",
        ],
      },
      {
        title: "P(0 ≤ Z ≤ x) = 0.3 (needs interpolation)",
        lead: "After the run, RCL A ≈ 0.2995, RCL B ≈ 0.3023, RCL Y = 0.84, RCL M = 0.85.",
        steps: [
          "0.3 EXE",
          "Display ≈ 0.841785714",
          "Those four recalls are the interpolation lines you write in the script",
        ],
      },
      {
        title: "p outside (0, 0.5)",
        edge: true,
        lead: "Left tail, two-tail, or p ≥ 0.5 must be rewritten first.",
        steps: [
          "P(Z ≤ a) = 0.9 → central slab is 0.4, then run 0.4; the printed x is a",
          "P(Z ≥ a) = 0.1 is the same 0.4 slab",
          "p = 0 or p ≥ 0.5 → Math ERROR or a stuck loop. Do not enter 0.5",
        ],
      },
    ],
    note: "Fix 2, Fix 4, Norm 1 and Rnd( are the display-format commands — enter them from SET UP (SHIFT MODE) while editing. E is EXP, so E−4 is 10⁻⁴. e^( is SHIFT eˣ. p > 0.4973 can hit a multi-z table clash; AC then RCL M is the fallback. Source: WebCal standardnormal_6 program I.",
  },
  {
    slug: "binomial-poisson",
    title: "Binomial / Poisson Cumulative",
    short: "Bin / Poisson",
    bytes: "110 bytes (109 on fx-50FH II)",
    mode: "COMP",
    aliases: ["二項分佈", "泊松分佈", "P(X=k)", "P(a≤X≤b)"],
    keywords: ["nCr", "e^", "factorial", "M1"],
    formulas: ["P(X=k) = C(n,k) p^k (1−p)^{n−k}", "P(X=k) = e^{−λ} λ^k / k!"],
    summary: "Single-term and range probabilities for Bin(n,p) and Po(λ). 110 bytes.",
    desc: "nCr types one binomial term; a CDF is a loop. This WebCal version II listing auto-detects the law: if the second input is a probability in (0,1) it is Binomial (then n, p, k); otherwise it is Poisson (λ, k). Enter an upper index at the next prompt for P(k ≤ X ≤ m). EXE through extra terms, then 0 EXE to print the sum. AC after a one-term run. nCr is SHIFT ÷. On the fx-50FH II the × after nCr may be omitted (109 bytes) and A^(B)÷B!e^(A needs no extra brackets.",
    code: "ClrMemory:?→A:?→B:B⇒1>B⇒B→Y:Ans⇒?→B:Lbl 0:Y⇒A nCr B Y^(B)(1-Y)^(A-B→C:Y=0⇒A^(B)÷B!e^(A→C:CM+:X=0⇒?→C:C≧1⇒C→X:1+B→B:X≧B⇒Goto 0:C⇒X=0⇒Goto 0:M",
    graph: "binomial-poisson.svg",
    caption: "Bin(9, 0.5). Shaded bars k = 4, 5, 6 sum to 0.65625.",
    examples: [
      {
        title: "X ~ Bin(9, 0.5), P(X = 4)",
        lead: "Second input 0.5 is in (0,1), so the third prompt is k.",
        steps: [
          "9 EXE  0.5 EXE  4 EXE",
          "Display ≈ 0.24609. AC to leave",
        ],
      },
      {
        title: "Same X, P(4 ≤ X ≤ 6)",
        lead: "After k = 4, enter the upper index 6.",
        steps: [
          "9 EXE  0.5 EXE  4 EXE  6 EXE",
          "Display 0.65625",
          "Or 4 EXE, EXE, EXE to see 0.24609, 0.24609, 0.16406, then 0 EXE for the sum",
        ],
      },
      {
        title: "X ~ Po(5), P(X = 4) and P(4 ≤ X ≤ 6)",
        edge: true,
        lead: "Second input 4 is not a probability, so A is λ.",
        steps: [
          "5 EXE  4 EXE → P(X=4) ≈ 0.17547, then AC",
          "5 EXE  4 EXE  6 EXE → P(4≤X≤6) ≈ 0.49716",
        ],
      },
    ],
    note: "Do not enter p = 0 or p = 1 as the second input — those look like Poisson. P(X=0) for Poisson: λ EXE 0 EXE. The running sum lives in M. Source: WebCal binomial_PoissonDist2.htm.",
  },
];

function makePage(p, i) {
  return {
    id: `modes/prgm/example/${p.slug}`,
    title: p.title,
    shortTitle: p.short,
    parent: "modes/prgm/example",
    order: i + 1,
    aliases: p.aliases,
    keywords: p.keywords,
    formulas: p.formulas,
    keySequence: ["MODE", "6", "2"],
    summary: p.summary,
    body: [
      { type: "p", text: p.desc },
      memoryNote(p.bytes, p.mode),
      { type: "formula", plain: p.formulas[0] },
      {
        type: "figure",
        svg: `img/prgm/${p.graph}`,
        caption: p.caption,
      },
      { type: "h2", text: "Program (one line)" },
      { type: "program", code: p.code },
      ...(p.listings || []).flatMap((L) => [
        { type: "h2", text: L.title },
        ...(L.lead ? [{ type: "p", text: L.lead }] : []),
        { type: "program", code: L.code },
      ]),
      ...examples(p.examples),
      { type: "note", label: "Pitfalls", text: p.note },
    ],
    related: [
      "modes/prgm/example",
      "modes/prgm/commands",
      "modes/prgm/edit",
      ...(p.related || []),
    ],
  };
}

w("sections/modes/prgm/example.json", {
  id: "modes/prgm/example",
  title: "Example Programs (Hong Kong DSE)",
  shortTitle: "Example Programs",
  parent: "modes/prgm",
  order: 6,
  aliases: [
    "HK programs",
    "DSE programs",
    "P1 P2 P3 P4",
    "must-enter programs",
  ],
  keywords: ["680 bytes", "four slots", "DSE", "必入"],
  formulas: [],
  keySequence: ["MODE", "6"],
  summary:
    "Listings that fill a real ROM gap: 2×2 and line∩quadratic, triangle centres, 3-point circle, cubic, then M1/M2 Newton, Simpson, inverse normal, binomial/Poisson, and 3×3.",
  body: [
    {
      type: "p",
      text: "The fx-50FH II has four slots (P1–P4) sharing 680 bytes. Store what FMLA and the keys cannot do. FMLA 01–05 already cover real quadratic roots, cosine (third side), Heron, and forward standard normal; Pol/Rec, SD frequencies, and REG Lin cover polar, tables, and a two-point line. The pages below are the ones that still earn a slot.",
    },
    {
      type: "p",
      text: "Pick four that match the paper. Core: 2×2 linear, line∩quadratic, four centres or 3-point circle, cubic. M1: drop a geometry program for Simpson or inverse normal. M2: Newton or 3×3. Type each listing as one line. Confirm with the worked cases before an exam sitting.",
    },
    {
      type: "children",
      title: "Compulsory (no FMLA equivalent)",
      ids: [
        "modes/prgm/example/simultaneous-2",
        "modes/prgm/example/line-quad",
        "modes/prgm/example/four-centres",
        "modes/prgm/example/circle-3pt",
        "modes/prgm/example/cubic",
      ],
    },
    {
      type: "children",
      title: "Worth a slot (M1 / M2)",
      ids: [
        "modes/prgm/example/simultaneous-3",
        "modes/prgm/example/newton",
        "modes/prgm/example/simpson",
        "modes/prgm/example/inverse-normal",
        "modes/prgm/example/binomial-poisson",
      ],
    },
    {
      type: "children",
      title: "Convenience (ROM or a short COMP line can replace these)",
      ids: [
        "modes/prgm/example/quadratic",
        "modes/prgm/example/circle-centre",
        "modes/prgm/example/sequences",
        "modes/prgm/example/line",
        "modes/prgm/example/polar",
        "modes/prgm/example/freq-sd",
      ],
    },
    {
      type: "note",
      label: "Slots",
      text: "MODE 6 → 1 → unused slot, choose COMP / CMPLX / SD / REG as the page says, then paste the line. Run with MODE 6 → 2 → slot. AC aborts a loop. Green fragments (Newton f(M), Simpson f(X)) must be edited for the function in the question.",
    },
  ],
  related: ["modes/prgm/commands", "modes/prgm/edit", "exam", "fmla"],
});

normalizeExamples();
programs.forEach((p, i) => page(makePage(p, i)));

function plane(x0, x1, y0, y1) {
  const LEFT = 64;
  const RIGHT = 680;
  const TOP = 36;
  const BASE = 280;
  const X = (x) => LEFT + ((x - x0) / (x1 - x0)) * (RIGHT - LEFT);
  const Y = (y) => BASE - ((y - y0) / (y1 - y0)) * (BASE - TOP);
  return { X, Y, LEFT, RIGHT, TOP, BASE };
}

function makeSim2() {
  const { X, Y } = plane(-1, 8, -2, 8);
  return svg(
    "prgm-sim2",
    "x+y=7 and x−y=1 meet at (4,3)",
    "Two lines intersecting at the unique solution (4, 3).",
    `
  ${axes(X, Y, -1, 8, -2, 8)}
  ${lineFn(-1, 8, 8, -1, X, Y)}
  ${lineFn(-1, -2, 8, 7, X, Y)}
  ${dot(X, Y, 4, 3, "(4, 3)")}
  <text x="${X(6.2)}" y="${Y(1.2)}" fill="${TX}">x + y = 7</text>
  <text x="${X(5.2)}" y="${Y(5.6)}" fill="${TX}">x − y = 1</text>
`
  );
}

function makeSim2Ex1() {
  const { X, Y } = plane(-1, 8, -2, 8);
  return svg(
    "prgm-sim2-ex1",
    "Solve x+y=7 and x−y=1",
    "Unknown point (x,y) at the intersection, then solved as (4,3).",
    `
  ${axes(X, Y, -1, 8, -2, 8)}
  ${lineFn(-1, 8, 8, -1, X, Y)}
  ${lineFn(-1, -2, 8, 7, X, Y)}
  ${dot(X, Y, 4, 3, "M(x, y) = ?", -16)}
  <text x="${X(4)}" y="${Y(3) + 24}" text-anchor="middle" fill="${A}">solution: M(4, 3)</text>
  <text x="${X(6.2)}" y="${Y(1.2)}" fill="${TX}">x + y = 7</text>
  <text x="${X(5.2)}" y="${Y(5.6)}" fill="${TX}">x − y = 1</text>
`
  );
}

function makeSim2Ex2() {
  const { X, Y } = plane(-1, 7, -2, 6);
  return svg(
    "prgm-sim2-ex2",
    "2x−y=1 and x+3y=11",
    "Second worked example with unique solution (2,3).",
    `
  ${axes(X, Y, -1, 7, -2, 6)}
  ${lineFn(-0.5, -2, 6.5, 12, X, Y)}
  ${lineFn(-1, 4, 7, 4/3, X, Y)}
  ${dot(X, Y, 2, 3, "(x, y) = (2, 3)")}
  <text x="${X(4.9)}" y="${Y(3.6)}" fill="${TX}">2x − y = 1</text>
  <text x="${X(4.8)}" y="${Y(1.9)}" fill="${TX}">x + 3y = 11</text>
`
  );
}

function makeSim2Ex3() {
  const { X, Y } = plane(-1, 6, -1, 6);
  return svg(
    "prgm-sim2-ex3",
    "Parallel case: x+y=1 and 2x+2y=5",
    "Edge case where determinant is zero and there is no unique (x,y).",
    `
  ${axes(X, Y, -1, 6, -1, 6)}
  ${lineFn(-1, 2, 6, -5, X, Y)}
  ${lineFn(-1, 6, 6, -1, X, Y)}
  <text x="${X(4.8)}" y="${Y(-0.1)}" fill="${TX}">x + y = 1</text>
  <text x="${X(4.2)}" y="${Y(3.8)}" fill="${TX}">2x + 2y = 5</text>
  <text x="${X(0.4)}" y="${Y(5.4)}" fill="${A}">No unique (?, ?)</text>
`
  );
}

function makeQuad() {
  const { X, Y } = plane(-0.5, 8, -2, 8);
  const fn = (x) => x * x - 7 * x + 12;
  return svg(
    "prgm-quad2",
    "x²−7x+12 with roots 3 and 4",
    "Parabola crossing at 3 and 4 with vertex (3.5, −0.25).",
    `
  <path d="${plot(fn, -0.2, 7.4, X, Y, 200)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axes(X, Y, -0.5, 8, -2, 8)}
  ${dot(X, Y, 3, 0, "3")}
  ${dot(X, Y, 4, 0, "4")}
  ${dot(X, Y, 3.5, -0.25, "vertex", 18)}
`
  );
}

function makeFour() {
  const { X, Y } = plane(-0.6, 5.2, -0.6, 4.2);
  return svg(
    "prgm-four",
    "Four centres of the (4,3)-(0,0)-(4,0) triangle",
    "Centroid, orthocentre, circumcentre and incentre marked on the right triangle.",
    `
  <polygon points="${X(4)},${Y(3)} ${X(0)},${Y(0)} ${X(4)},${Y(0)}" fill="${A}" fill-opacity="0.08" stroke="${A}" stroke-width="2"/>
  ${axes(X, Y, -0.6, 5.2, -0.6, 4.2)}
  ${dot(X, Y, 8 / 3, 1, "G")}
  ${dot(X, Y, 4, 0, "H", 16)}
  ${dot(X, Y, 2, 1.5, "O")}
  ${dot(X, Y, 3, 1, "I", 16)}
  <text x="${X(4.15)}" y="${Y(3.15)}" fill="${TX}">(4, 3)</text>
`
  );
}

function makeCircleCentre() {
  const { X, Y } = plane(-6, 8, -9, 4);
  const cx = X(2);
  const cy = Y(-3);
  const r = Math.abs(X(7) - X(2));
  return svg(
    "prgm-cc",
    "Circle centre (2,−3) radius 5",
    "Completed-square circle from x²+y²−4x+6y−12=0.",
    `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${A}" fill-opacity="0.08" stroke="${A}" stroke-width="2.2"/>
  ${axes(X, Y, -6, 8, -9, 4)}
  ${dot(X, Y, 2, -3, "(2, −3)")}
  <line x1="${cx}" y1="${cy}" x2="${X(7)}" y2="${cy}" stroke="${AS}" stroke-width="1.4"/>
  <text x="${X(4.6)}" y="${Y(-3.5)}" fill="${TX}">r = 5</text>
`
  );
}

function makeCircle3() {
  const { X, Y } = plane(-1.2, 5.2, -0.6, 5.2);
  const cx = X(2);
  const cy = Y(2.5);
  const r = Math.abs(X(4.5) - X(2));
  return svg(
    "prgm-c3",
    "Circumcircle of (2,0), (0,1), (0,4)",
    "Three points on a circle centre (2, 2.5) radius 2.5.",
    `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${A}" fill-opacity="0.08" stroke="${A}" stroke-width="2.2"/>
  ${axes(X, Y, -1.2, 5.2, -0.6, 5.2)}
  ${dot(X, Y, 2, 0, "(2, 0)", 16)}
  ${dot(X, Y, 0, 1, "(0, 1)")}
  ${dot(X, Y, 0, 4, "(0, 4)")}
  ${dot(X, Y, 2, 2.5, "centre")}
`
  );
}

function makeCubic() {
  const { X, Y } = plane(-0.4, 4.4, -2.5, 3.5);
  const fn = (x) => x ** 3 - 6 * x ** 2 + 11 * x - 6;
  return svg(
    "prgm-cubic",
    "Cubic with roots 1, 2, 3",
    "y = x³−6x²+11x−6 crosses the axis at 1, 2 and 3.",
    `
  <path d="${plot(fn, -0.2, 4.2, X, Y, 240)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axes(X, Y, -0.4, 4.4, -2.5, 3.5)}
  ${dot(X, Y, 1, 0, "1")}
  ${dot(X, Y, 2, 0, "2")}
  ${dot(X, Y, 3, 0, "3")}
`
  );
}

function makeSeq() {
  const { X, Y } = plane(-1, 22, -40, 80);
  const dots = [];
  for (let n = 1; n <= 20; n++) {
    const t = 2 + (n - 1) * 3;
    dots.push(`<circle cx="${X(n)}" cy="${Y(t)}" r="3.2" fill="${A}"/>`);
  }
  return svg(
    "prgm-seq",
    "AP 2,5,8,… up to n=20",
    "Arithmetic sequence with first term 2 and difference 3.",
    `
  ${axes(X, Y, -1, 22, -40, 80)}
  ${dots.join("\n  ")}
  <text x="${X(20)}" y="${Y(59) - 12}" text-anchor="middle" fill="${TX}">T₂₀ = 59</text>
  <text x="360" y="24" text-anchor="middle" fill="${TX}">A = 2, d = 3</text>
`
  );
}

function makeLine() {
  const { X, Y } = plane(-1, 6, -13, 4);
  return svg(
    "prgm-line",
    "Line through (3,−2) and (4,1)",
    "y = 3x − 11 with the two given points marked.",
    `
  ${axes(X, Y, -1, 6, -13, 4)}
  ${lineFn(-0.5, -12.5, 5.5, 5.5, X, Y)}
  ${dot(X, Y, 3, -2, "(3, −2)")}
  ${dot(X, Y, 4, 1, "(4, 1)")}
  <text x="${X(4.6)}" y="${Y(-8)}" fill="${TX}">y = 3x − 11</text>
`
  );
}

function makePolar() {
  const { X, Y } = plane(-0.4, 5.6, -0.4, 5.6);
  const arc = [];
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * Math.atan2(4, 3);
    const px = X(1.15 * Math.cos(t));
    const py = Y(1.15 * Math.sin(t));
    arc.push((i ? "L" : "M") + px.toFixed(1) + "," + py.toFixed(1));
  }
  return svg(
    "prgm-polar",
    "Pol(3,4) to r=5",
    "Rectangular (3,4) and its polar pair r=5, θ≈53.13°.",
    `
  ${axes(X, Y, -0.4, 5.6, -0.4, 5.6)}
  <line x1="${X(0)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(4)}" stroke="${A}" stroke-width="2.2"/>
  ${dot(X, Y, 3, 4, "(3, 4)")}
  <path d="${arc.join(" ")}" fill="none" stroke="${AS}" stroke-width="1.6"/>
  <text x="${X(1.4)}" y="${Y(0.55)}" fill="${TX}">θ</text>
  <text x="${X(1.6)}" y="${Y(2.4)}" fill="${TX}">r = 5</text>
`
  );
}

function makeFreq() {
  const LEFT = 96;
  const BASE = 268;
  const TOP = 40;
  const cols = [
    [75, 1],
    [80, 2],
    [85, 4],
  ];
  const maxF = 4;
  const bars = cols
    .map(([x, f], i) => {
      const bx = LEFT + 80 + i * 150;
      const h = ((BASE - TOP - 20) * f) / maxF;
      return `<rect x="${bx}" y="${BASE - h}" width="90" height="${h}" fill="${A}" fill-opacity="0.35" stroke="${A}" stroke-width="1.6"/>
  <text x="${bx + 45}" y="${BASE + 22}" text-anchor="middle" fill="${TX}">${x}</text>
  <text x="${bx + 45}" y="${BASE - h - 8}" text-anchor="middle" fill="${TX}">f = ${f}</text>`;
    })
    .join("\n  ");
  return svg(
    "prgm-freq",
    "Frequency table 75, 80, 85",
    "Bar heights 1, 2, 4 for scores 75, 80, 85.",
    `
  <line x1="${LEFT}" y1="${BASE}" x2="640" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  ${bars}
  <text x="360" y="24" text-anchor="middle" fill="${TX}">n = 7 after 75 ; 1, 80 ; 2, 85 ; 4</text>
`
  );
}

function makeLineQuad() {
  const { X, Y } = plane(-6, 5, -8, 2);
  const cx = X(-1.5);
  const cy = Y(-3.5);
  const r = Math.abs(X(-1.5 + Math.sqrt(12.5)) - X(-1.5));
  return svg(
    "prgm-lq",
    "x=2 cuts the circle at (2,−3) and (2,−4)",
    "Vertical line x = 2 intersecting the circle x²+y²+3x+7y+2=0.",
    `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${A}" fill-opacity="0.08" stroke="${A}" stroke-width="2.2"/>
  ${axes(X, Y, -6, 5, -8, 2)}
  ${lineFn(2, -7.6, 2, 1.4, X, Y)}
  ${dot(X, Y, 2, -3, "(2, −3)")}
  ${dot(X, Y, 2, -4, "(2, −4)", 16)}
  ${dot(X, Y, -1.5, -3.5, "centre")}
`
  );
}

function makeSim3() {
  const { X, Y } = plane(-1, 6, -1, 6);
  const p = (x, y) => `${X(x)},${Y(y)}`;
  return svg(
    "prgm-sim3",
    "Three planes meet at (1,2,3)",
    "The unique solution of the 3×3 example system is the point (1, 2, 3).",
    `
  ${axes(X, Y, -1, 6, -1, 6)}
  <polygon points="${p(0.5, 0.7)} ${p(4.4, 1.1)} ${p(3.2, 4.8)} ${p(-0.2, 4.2)}"
    fill="${A}" fill-opacity="0.11" stroke="${A}" stroke-width="1.2"/>
  <polygon points="${p(1.6, 0.2)} ${p(5.1, 2.2)} ${p(2.7, 5.2)} ${p(-0.5, 2.9)}"
    fill="${AS}" fill-opacity="0.18" stroke="${AS}" stroke-width="1.2"/>
  <polygon points="${p(0.2, 1.0)} ${p(5.4, 0.8)} ${p(4.3, 4.0)} ${p(-0.4, 4.5)}"
    fill="${A}" fill-opacity="0.08" stroke="${TM}" stroke-width="1.1"/>
  ${dot(X, Y, 1.8, 2.6, "(x,y,z) = (1,2,3)", 18)}
  <text x="${X(3.6)}" y="${Y(5.2)}" fill="${TX}">plane 1</text>
  <text x="${X(5.0)}" y="${Y(2.4)}" fill="${TX}">plane 2</text>
  <text x="${X(3.8)}" y="${Y(0.4)}" fill="${TX}">plane 3</text>
  <text x="${X(0.2)}" y="${Y(5.7)}" fill="${TM}">det ≠ 0 → unique intersection</text>
`,
    320
  );
}

function makeExampleCard(title, lines) {
  const safe = lines.slice(0, 4).map((t, i) => {
    const y = 118 + i * 30;
    return `<text x="46" y="${y}" fill="${TX}" font-size="20">${esc(t)}</text>`;
  });
  return svg(
    "prgm-example-card",
    title,
    "Case sketch for this worked example.",
    `
  <rect x="28" y="34" width="664" height="254" rx="14" fill="${A}" fill-opacity="0.06" stroke="${A}" stroke-width="1.2"/>
  <text x="46" y="80" fill="${A}" font-size="24">${esc(title)}</text>
  ${safe.join("\n  ")}
`,
    320
  );
}

function enrichExampleFigures() {
  for (const p of programs) {
    p.examples.forEach((ex, i) => {
      if (!ex.graph) ex.graph = `${p.slug}-example-${i + 1}.svg`;
      if (!ex.caption) ex.caption = ex.title;
      if (ex.customGraph) return;
      const lines = [ex.lead, ...(ex.steps || []).slice(0, 2)];
      writeSvg(ex.graph, makeExampleCard(ex.title, lines));
    });
  }
}

function makeNewton() {
  const { X, Y } = plane(-0.6, 3.4, -3.2, 8);
  const fn = (x) => x ** 3 - 2 * x - 1;
  const tan = (x) => x - 3;
  return svg(
    "prgm-newton",
    "Newton for x³−2x−1=0 starting at 1",
    "Curve y=x³−2x−1, tangent at x=1 hitting the axis at 3, root near 1.618.",
    `
  <path d="${plot(fn, -0.4, 3.2, X, Y, 240)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axes(X, Y, -0.6, 3.4, -3.2, 8)}
  <path d="${plot(tan, 1, 3.05, X, Y, 40)}" fill="none" stroke="${AS}" stroke-width="1.8"/>
  ${dot(X, Y, 1, -2, "guess 1")}
  ${dot(X, Y, 3, 0, "3", 16)}
  ${dot(X, Y, 1.618, 0, "≈1.618")}
`
  );
}

function makeSimpson() {
  const { X, Y } = plane(0.6, 2.4, -0.15, 0.85);
  const fn = (x) => Math.log(x);
  const n = 6;
  const a = 1;
  const b = 2;
  const h = (b - a) / n;
  let strips = "";
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    const x1 = x0 + h;
    const y0 = fn(x0);
    const y1 = fn(x1);
    strips += `<polygon points="${X(x0)},${Y(0)} ${X(x0)},${Y(y0)} ${X(x1)},${Y(y1)} ${X(x1)},${Y(0)}" fill="${A}" fill-opacity="${i % 2 ? 0.12 : 0.22}" stroke="${A}" stroke-width="0.8"/>\n  `;
  }
  return svg(
    "prgm-simpson",
    "Simpson strips under ln x from 1 to 2",
    "Trapezoid-looking Simpson panels approximating the area under y = ln x.",
    `
  ${strips}<path d="${plot(fn, 1, 2, X, Y, 160)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axes(X, Y, 0.6, 2.4, -0.15, 0.85)}
  ${dot(X, Y, 1, 0, "1", 16)}
  ${dot(X, Y, 2, Math.log(2), "2")}
`
  );
}

function makeInvNorm() {
  const { X, Y } = plane(-3.2, 3.2, -0.05, 0.48);
  const phi = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const z1 = 1.23;
  const shade = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const z = (z1 * i) / steps;
    shade.push((i ? "L" : "M") + X(z).toFixed(2) + "," + Y(phi(z)).toFixed(2));
  }
  shade.push("L" + X(z1).toFixed(2) + "," + Y(0).toFixed(2));
  shade.push("L" + X(0).toFixed(2) + "," + Y(0).toFixed(2) + "Z");
  return svg(
    "prgm-invn",
    "Inverse normal: slab 0 to 1.23 equals 0.3907",
    "Standard normal density with the region from 0 to 1.23 shaded.",
    `
  <path d="${shade.join(" ")}" fill="${A}" fill-opacity="0.22"/>
  <path d="${plot(phi, -3.1, 3.1, X, Y, 240)}" fill="none" stroke="${A}" stroke-width="2.4"/>
  ${axes(X, Y, -3.2, 3.2, -0.05, 0.48)}
  ${dot(X, Y, 1.23, 0, "1.23", 16)}
  <text x="${X(0.62)}" y="${Y(0.12)}" text-anchor="middle" fill="${TX}">0.3907</text>
`
  );
}

function makeBinPois() {
  const LEFT = 70;
  const BASE = 268;
  const TOP = 36;
  const p = 0.5;
  const n = 9;
  function nCr(nn, k) {
    let v = 1;
    for (let i = 1; i <= k; i++) v *= (nn - k + i) / i;
    return v;
  }
  const probs = [];
  for (let k = 0; k <= n; k++) probs.push(nCr(n, k) * p ** k * (1 - p) ** (n - k));
  const maxP = Math.max(...probs);
  const bars = probs
    .map((pk, k) => {
      const bx = LEFT + 18 + k * 58;
      const h = ((BASE - TOP - 28) * pk) / maxP;
      const hi = k >= 4 && k <= 6;
      return `<rect x="${bx}" y="${BASE - h}" width="46" height="${h}" fill="${A}" fill-opacity="${hi ? 0.55 : 0.18}" stroke="${A}" stroke-width="1.2"/>
  <text x="${bx + 23}" y="${BASE + 20}" text-anchor="middle" fill="${TX}">${k}</text>`;
    })
    .join("\n  ");
  return svg(
    "prgm-bin",
    "Bin(9,0.5) with k=4,5,6 shaded",
    "Binomial probabilities for n=9, p=0.5. Bars 4 to 6 are the cumulative range.",
    `
  <line x1="${LEFT}" y1="${BASE}" x2="680" y2="${BASE}" stroke="${TM}" stroke-width="1.2"/>
  ${bars}
  <text x="360" y="24" text-anchor="middle" fill="${TX}">P(4 ≤ X ≤ 6) = 0.65625</text>
`
  );
}

writeSvg("simultaneous-2.svg", makeSim2());
writeSvg("simultaneous-2-example-1.svg", makeSim2Ex1());
writeSvg("simultaneous-2-example-2.svg", makeSim2Ex2());
writeSvg("simultaneous-2-example-3.svg", makeSim2Ex3());
writeSvg("quadratic.svg", makeQuad());
writeSvg("four-centres.svg", makeFour());
writeSvg("circle-centre.svg", makeCircleCentre());
writeSvg("circle-3pt.svg", makeCircle3());
writeSvg("cubic.svg", makeCubic());
writeSvg("sequences.svg", makeSeq());
writeSvg("line.svg", makeLine());
writeSvg("polar.svg", makePolar());
writeSvg("freq-sd.svg", makeFreq());
writeSvg("line-quad.svg", makeLineQuad());
writeSvg("simultaneous-3.svg", makeSim3());
writeSvg("newton.svg", makeNewton());
writeSvg("simpson.svg", makeSimpson());
writeSvg("inverse-normal.svg", makeInvNorm());
writeSvg("binomial-poisson.svg", makeBinPois());
enrichExampleFigures();

console.log("Wrote HK example-program pages and SVGs");
