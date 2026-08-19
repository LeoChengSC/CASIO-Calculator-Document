#!/usr/bin/env node
// Content authoring for fx-82AU PLUS II. Run: node tools/write-fx82-content.js
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = path.join(ROOT, "data", "models", "fx-82au-plus-ii");

function w(rel, obj) {
  const file = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

const nav = [
  { id: "index", label: "Overview" },
  { id: "hardware", label: "Hardware" },
  {
    id: "modes",
    label: "Calculation Modes",
    children: [
      { id: "modes/comp", label: "COMP" },
      {
        id: "modes/stat",
        label: "STAT",
        children: [
          { id: "modes/stat/1-var", label: "1-VAR" },
          { id: "modes/stat/a-bx", label: "A+BX" },
          { id: "modes/stat/quad", label: "_+CX²" },
          { id: "modes/stat/ln", label: "ln X" },
          { id: "modes/stat/ex", label: "e^X" },
          { id: "modes/stat/abx", label: "A·B^X" },
          { id: "modes/stat/axb", label: "A·X^B" },
          { id: "modes/stat/inv", label: "1/X" },
        ],
      },
      { id: "modes/verif", label: "VERIF" },
    ],
  },
  { id: "setup", label: "SET UP" },
  {
    id: "functions",
    label: "Function Suite",
    children: [
      { id: "functions/fact", label: "FACT" },
      { id: "functions/gcd-lcm", label: "GCD / LCM" },
      { id: "functions/sd", label: "S⇔D" },
      { id: "functions/dms", label: "° ′ ″" },
      { id: "functions/pol-rec", label: "Pol / Rec" },
      { id: "functions/combinatorics", label: "nPr / nCr / n!" },
      { id: "functions/random", label: "Ran# / RanInt#" },
      { id: "functions/abs", label: "Abs" },
      { id: "functions/log-exp", label: "Log / Exp" },
      { id: "functions/trig-hyp", label: "Trig / Hyp" },
      { id: "functions/eng", label: "ENG" },
    ],
  },
  { id: "statistics", label: "Statistics Editor" },
  { id: "memory", label: "Memory & Variables" },
  { id: "exam", label: "Exam Compliance" },
  { id: "compare", label: "vs fx-50FH II" },
];

w("model.json", {
  id: "fx-82au-plus-ii",
  name: "CASIO fx-82AU PLUS II",
  shortName: "fx-82AU PLUS II",
  aliases: ["fx82au", "82AU PLUS II", "Natural-VPAM", "fx-82AU PLUS II 2nd Edition"],
  nav,
});

w("sections/overview.json", {
  id: "index",
  title: "fx-82AU PLUS II Overview",
  shortTitle: "Overview",
  parent: "root",
  order: 0,
  aliases: ["introduction", "about", "Natural-V.P.A.M.", "2nd Edition"],
  keywords: ["NESA", "VCAA", "NCEA", "non-programmable", "textbook display", "VPAM"],
  formulas: [],
  keySequence: [],
  summary:
    "Non-programmable Natural-V.P.A.M. scientific calculator for Australian and New Zealand secondary curricula: exact surds/fractions, STAT with quartiles, VERIF mode, and exam-board approval.",
  body: [
    {
      type: "p",
      text: "The CASIO fx-82AU PLUS II (2nd Edition, Natural-V.P.A.M.) is a non-programmable scientific calculator for secondary and tertiary education. A single AAA battery (R03) typically lasts about two years in classroom use. It intentionally omits programmable RAM, CAS, and graphing so it remains legal in major Oceania exam settings.",
    },
    {
      type: "p",
      text: "Natural Textbook Display shows fractions, surds, exponents, and logs as in print. The engine uses ~15-digit internal precision with a 10+2 digit result display. Core strengths vs programmable models: exact surd arithmetic, FACT/GCD/LCM, quartile statistics, seven regression models, and VERIF (TRUE/FALSE) checking.",
    },
    {
      type: "children",
      title: "Start here",
      ids: ["hardware", "modes", "setup", "functions", "statistics", "memory", "exam", "compare"],
    },
  ],
  related: ["hardware", "exam", "compare"],
});

w("sections/hardware.json", {
  id: "hardware",
  title: "Hardware and Specifications",
  shortTitle: "Hardware",
  parent: "index",
  order: 1,
  aliases: ["specs", "display", "battery", "AAA", "drop-resistant"],
  keywords: ["Natural-VPAM", "16-digit", "cursor keys", "hard case"],
  formulas: [],
  keySequence: [],
  summary: "Natural-V.P.A.M. LCD, single AAA power, drop-resistant shell, and multi-jurisdiction exam compliance.",
  body: [
    {
      type: "table",
      headers: ["Parameter", "Specification", "Notes"],
      rows: [
        ["Display", "Natural-V.P.A.M. two-line LCD", "Textbook fractions/surds; 10+2 result digits"],
        ["Engine", "Infix / Natural textbook", "~15-digit internal precision"],
        ["Memory", "A–F, X, Y, M + Ans + STAT RAM", "No user program slots"],
        ["Power", "Single AAA (R03 UM-4) × 1", "No solar; ~2-year life (1 hr/day)"],
        ["Case", "Drop-resistant + slide-on cover", "Cover attaches top or bottom"],
        ["Cursor", "Separate 4-way keys", "Replaces rocker pad"],
        ["Exam", "NESA, VCAA, QCAA, SACE, WACE, NCEA…", "Non-programmable / non-CAS"],
      ],
    },
    {
      type: "note",
      text: "Unlike the fx-50FH II, there is no FMLA/CONST ROM library and no PRGM mode. Use COMP for exact arithmetic and VERIF for identity checks.",
    },
  ],
  related: ["exam", "compare"],
});

w("sections/modes/_index.json", {
  id: "modes",
  title: "Calculation Modes (MODE)",
  shortTitle: "Modes",
  parent: "index",
  order: 2,
  aliases: ["MODE key", "COMP", "STAT", "VERIF"],
  keywords: ["MODE 1", "MODE 2", "MODE 3"],
  formulas: [],
  keySequence: ["MODE"],
  summary: "Three primary modes: COMP, STAT (eight sub-types), and VERIF.",
  body: [
    {
      type: "p",
      text: "Press MODE to choose the calculation environment. STAT opens a model picker (1-VAR plus seven regressions). VERIF evaluates equality/inequality statements as TRUE or FALSE.",
    },
    {
      type: "table",
      headers: ["Key", "Mode", "Purpose"],
      rows: [
        ["1", "COMP", "General arithmetic, surds, fractions, transforms"],
        ["2", "STAT", "1-VAR + seven bivariate regressions"],
        ["3", "VERIF", "TRUE/FALSE verification of relations"],
      ],
    },
    {
      type: "children",
      title: "Mode pages",
      ids: ["modes/comp", "modes/stat", "modes/verif"],
    },
  ],
  related: ["setup"],
});

w("sections/modes/comp.json", {
  id: "modes/comp",
  title: "MODE 1: COMP (General Computation)",
  shortTitle: "COMP",
  parent: "modes",
  order: 1,
  aliases: ["computation", "MODE 1", "surd", "fraction"],
  keywords: ["S⇔D", "√", "Natural Display", "FACT"],
  formulas: ["√48 + √27"],
  keySequence: ["MODE", "1"],
  summary: "Default mode for arithmetic, trig, logs, fractions, sexagesimal, Pol/Rec, FACT, and exact surds.",
  body: [
    {
      type: "p",
      text: "COMP is everyday work. With MthIO, results often stay as exact fractions or surds until you press S⇔D for a decimal.",
    },
    { type: "h2", text: "Example: exact surd then decimal" },
    {
      type: "ol",
      items: [
        "MODE → 1 (COMP)",
        "√ 48 ▶ + √ 27 =  → exact combined surd form",
        "S⇔D → decimal approximation",
      ],
    },
    {
      type: "note",
      text: "Angle unit (Deg/Rad/Gra) and MthIO vs LineIO are SET UP options—wrong angle unit is a common exam trap.",
    },
  ],
  related: ["setup", "functions/sd", "functions/fact"],
});

w("sections/modes/stat.json", {
  id: "modes/stat",
  title: "MODE 2: STAT (Statistics)",
  shortTitle: "STAT",
  parent: "modes",
  order: 2,
  aliases: ["statistics", "MODE 2", "regression", "1-VAR"],
  keywords: ["quartile", "median", "A+BX", "FREQ"],
  formulas: ["y = A + Bx"],
  keySequence: ["MODE", "2"],
  summary: "Statistics editor with 1-VAR (including quartiles) and seven paired regression models.",
  body: [
    {
      type: "p",
      text: "MODE 2 opens a type menu. After you pick a model, the Statistics Editor appears. Use SHIFT 1 (STAT) menus for Sum, Var, Reg, and MinMax after AC exits the editor.",
    },
    { type: "h2", text: "Example: 1-VAR mean and sx" },
    {
      type: "ol",
      items: [
        "MODE → 2 → 1 (1-VAR)",
        "Enter 15 = 18 = 22 = 25 =",
        "AC → SHIFT 1 (STAT) → 4 (Var) → 2 (x̄) =",
        "SHIFT 1 → 4 (Var) → 4 (sx) =",
      ],
    },
    {
      type: "children",
      title: "STAT types",
      ids: [
        "modes/stat/1-var",
        "modes/stat/a-bx",
        "modes/stat/quad",
        "modes/stat/ln",
        "modes/stat/ex",
        "modes/stat/abx",
        "modes/stat/axb",
        "modes/stat/inv",
      ],
    },
  ],
  related: ["statistics", "setup"],
});

const statKids = [
  {
    slug: "1-var",
    num: "1",
    name: "1-VAR",
    eq: "univariate summaries",
    aliases: ["single-variable", "MODE 2 1", "quartile", "median"],
    keywords: ["n", "x̄", "sx", "σx", "Q1", "Q3", "med"],
    summary: "Single-variable stats including n, mean, σx/sx, min/max, Q1, median, Q3.",
    use: "Use for lists, test scores, and any one-column frequency analysis. Enable FREQ in SET UP when values repeat.",
  },
  {
    slug: "a-bx",
    num: "2",
    name: "A+BX",
    eq: "y = A + Bx",
    aliases: ["linear regression", "MODE 2 2", "A+BX"],
    keywords: ["A", "B", "r", "x̂", "ŷ"],
    summary: "Linear regression y = A + Bx with correlation r and estimators x̂, ŷ.",
    use: "Straight-line trends and calibration curves.",
  },
  {
    slug: "quad",
    num: "3",
    name: "_+CX²",
    eq: "y = A + Bx + Cx²",
    aliases: ["quadratic regression", "MODE 2 3", "CX2"],
    keywords: ["A", "B", "C", "parabola"],
    summary: "Quadratic regression with coefficients A, B, C and dual x̂ estimators.",
    use: "Parabolic / second-order experimental fits.",
  },
  {
    slug: "ln",
    num: "4",
    name: "ln X",
    eq: "y = A + B ln x",
    aliases: ["logarithmic regression", "MODE 2 4"],
    keywords: ["ln", "saturation"],
    summary: "Logarithmic regression y = A + B ln x.",
    use: "Diminishing-return / log-x relationships (x > 0).",
  },
  {
    slug: "ex",
    num: "5",
    name: "e^X",
    eq: "y = A e^(Bx)",
    aliases: ["exponential regression", "MODE 2 5", "e^X"],
    keywords: ["growth", "decay"],
    summary: "Natural exponential regression y = A e^(Bx).",
    use: "Continuous growth/decay models.",
  },
  {
    slug: "abx",
    num: "6",
    name: "A·B^X",
    eq: "y = A · B^x",
    aliases: ["ab exponential", "MODE 2 6"],
    keywords: ["base", "discrete growth"],
    summary: "Base-B exponential regression y = A·B^x.",
    use: "Discrete compound / geometric growth.",
  },
  {
    slug: "axb",
    num: "7",
    name: "A·X^B",
    eq: "y = A · x^B",
    aliases: ["power regression", "MODE 2 7"],
    keywords: ["power law", "scaling"],
    summary: "Power regression y = A·x^B.",
    use: "Positive-data scaling laws (log-log linear).",
  },
  {
    slug: "inv",
    num: "8",
    name: "1/X",
    eq: "y = A + B/x",
    aliases: ["inverse regression", "MODE 2 8", "1/X"],
    keywords: ["reciprocal", "Boyle"],
    summary: "Inverse regression y = A + B/x.",
    use: "Reciprocal physical relationships.",
  },
];

statKids.forEach((r, i) => {
  w(`sections/modes/stat/${r.slug}.json`, {
    id: `modes/stat/${r.slug}`,
    title: `MODE 2-${r.num}: ${r.name}`,
    shortTitle: r.name,
    parent: "modes/stat",
    order: i + 1,
    aliases: r.aliases,
    keywords: r.keywords,
    formulas: [r.eq],
    keySequence: ["MODE", "2", r.num],
    summary: r.summary,
    body: [
      { type: "p", text: r.use },
      { type: "formula", plain: r.eq },
      {
        type: "steps",
        title: "Open this type",
        items: [
          `MODE → 2 → ${r.num}`,
          "Clear or edit data in the Statistics Editor as needed",
          "AC, then SHIFT 1 (STAT) for Var / MinMax recalls",
        ],
      },
    ],
    related: ["statistics", "modes/stat"],
  });
});

w("sections/modes/verif.json", {
  id: "modes/verif",
  title: "MODE 3: VERIF (Verify)",
  shortTitle: "VERIF",
  parent: "modes",
  order: 3,
  aliases: ["VERIFY", "MODE 3", "TRUE", "FALSE", "inequality"],
  keywords: ["=", "≠", ">", "<", "≥", "≤", "identity"],
  formulas: ["sin²θ + cos²θ = 1"],
  keySequence: ["MODE", "3"],
  summary: "Test equalities and inequalities; result is TRUE or FALSE.",
  body: [
    {
      type: "p",
      text: "Build left expression, insert a relation from SHIFT 3 (VERIFY), then the right expression. One relation per statement. Missing terms or multiple relations cause Syntax ERROR.",
    },
    { type: "h2", text: "Example: sin²30 + cos²30 = 1" },
    {
      type: "ol",
      items: [
        "MODE → 3",
        "Enter (sin 30)² + (cos 30)²",
        "SHIFT 3 (VERIFY) → 1 (=)",
        "Enter 1, then = → TRUE",
      ],
    },
    { type: "h2", text: "Example: inequality" },
    {
      type: "ol",
      items: [
        "2^4  then SHIFT 3 → 4 (<)  then 3^3  then = → TRUE (16 < 27)",
      ],
    },
    {
      type: "note",
      text: "Confirm Deg/Rad before trig identities. VERIF checks numerical/logical truth under current settings, not algebraic proof steps for markers.",
    },
  ],
  related: ["modes/comp", "setup"],
});

w("sections/setup.json", {
  id: "setup",
  title: "System SET UP",
  shortTitle: "SET UP",
  parent: "index",
  order: 3,
  aliases: ["SHIFT MODE", "SETUP", "MthIO", "LineIO", "Fix", "Norm", "FREQ"],
  keywords: ["MathO", "LineO", "Deg", "ab/c", "Dot", "Comma", "CONT"],
  formulas: [],
  keySequence: ["SHIFT", "MODE"],
  summary: "Display IO style, angle unit, number format, fractions, STAT FREQ column, decimal separator, contrast.",
  body: [
    {
      type: "p",
      text: "Open with SHIFT MODE (SETUP). Scroll pages with the cursor. Defaults commonly favour MthIO MathO, Deg, Norm 2, d/c, STAT FREQ OFF, and Dot.",
    },
    {
      type: "table",
      headers: ["Area", "Options", "Typical default"],
      rows: [
        ["Display", "MthIO MathO / MthIO LineO / LineIO", "MthIO MathO"],
        ["Angle", "Deg / Rad / Gra", "Deg"],
        ["Digits", "Fix / Sci / Norm 1 / Norm 2", "Norm 2"],
        ["Fractions", "ab/c / d/c", "d/c"],
        ["STAT", "FREQ ON / OFF", "OFF"],
        ["Disp", "Dot / Comma", "Dot"],
        ["Other", "CONT contrast; CLR All reset", "—"],
      ],
    },
    {
      type: "ul",
      items: [
        "MthIO MathO: textbook input and textbook exact output.",
        "MthIO LineO: textbook input, linear decimal-style results.",
        "LineIO: classic single-line entry (e.g. 1┘3).",
        "Norm 1 uses a wider small-value exponential threshold than Norm 2.",
        "Contrast: SETUP → CONT; full reset: SHIFT 9 (CLR) → All.",
      ],
    },
  ],
  related: ["modes/comp", "statistics"],
});

const funcs = [
  {
    slug: "fact",
    title: "Prime Factorization (FACT)",
    short: "FACT",
    aliases: ["FACT", "prime factors", "factorise"],
    keywords: ["SHIFT", "°′″", "integer"],
    keys: ["SHIFT", "°′″"],
    summary: "Factor a positive integer (up to 10 digits) into primes after evaluating it.",
    body: [
      { type: "p", text: "Evaluate an integer, then SHIFT °′″ (FACT) to show its prime factorization." },
      {
        type: "ol",
        title: "Example: 2016",
        items: ["2016 =", "SHIFT °′″ (FACT) → prime-power product"],
      },
    ],
  },
  {
    slug: "gcd-lcm",
    title: "GCD and LCM",
    short: "GCD / LCM",
    aliases: ["GCD", "LCM", "greatest common divisor", "least common multiple"],
    keywords: ["ALPHA", "×", "÷"],
    keys: ["ALPHA", "×"],
    summary: "Greatest common divisor and least common multiple of two positive integers.",
    body: [
      {
        type: "p",
        text: "GCD is ALPHA ×; LCM is ALPHA ÷. Arguments are comma-separated inside parentheses.",
      },
      {
        type: "lines",
        items: ["GCD(28, 35) = 7", "LCM(12, 18) = 36"],
      },
    ],
  },
  {
    slug: "sd",
    title: "Exact ↔ Decimal (S⇔D)",
    short: "S⇔D",
    aliases: ["S⇔D", "SD", "fraction toggle", "surd toggle"],
    keywords: ["exact", "decimal", "mixed", "improper"],
    keys: ["S⇔D"],
    summary: "Toggle between exact forms (fractions, surds, π multiples) and decimal approximations.",
    body: [
      {
        type: "ol",
        title: "Example",
        items: ["√48 =  exact surd form", "S⇔D → decimal"],
      },
      {
        type: "note",
        text: "Fraction style (ab/c vs d/c) is controlled in SET UP and affects how fractional exact results present.",
      },
    ],
  },
  {
    slug: "dms",
    title: "Sexagesimal (° ′ ″)",
    short: "° ′ ″",
    aliases: ["DMS", "degrees minutes seconds", "sexagesimal"],
    keywords: ["°′″", "navigation", "bearing"],
    keys: ["°′″"],
    summary: "Convert between decimal degrees and degrees-minutes-seconds.",
    body: [
      {
        type: "ol",
        title: "Example",
        items: ["2.325 =", "°′″ → DMS display"],
      },
    ],
  },
  {
    slug: "pol-rec",
    title: "Coordinate Transforms (Pol / Rec)",
    short: "Pol / Rec",
    aliases: ["Pol", "Rec", "polar", "rectangular"],
    keywords: ["r", "θ", "X", "Y"],
    keys: ["SHIFT", "+"],
    summary: "Rectangular ↔ polar conversion; results also populate X/Y (and related) registers.",
    body: [
      {
        type: "lines",
        items: ["x = 3", "y = 4", "r = 5", "θ ≈ 53.13°"],
      },
    ],
  },
  {
    slug: "combinatorics",
    title: "Permutations, Combinations, Factorials",
    short: "nPr / nCr / n!",
    aliases: ["nPr", "nCr", "factorial", "permutation", "combination"],
    keywords: ["8C3", "5!", "counting"],
    keys: ["SHIFT", "÷"],
    summary: "nPr, nCr, and n! for counting problems.",
    body: [
      {
        type: "lines",
        items: ["8 C 3 = 56", "5! = 120"],
      },
    ],
  },
  {
    slug: "random",
    title: "Random Numbers (Ran# / RanInt#)",
    short: "Ran# / RanInt#",
    aliases: ["RanInt#", "Ran#", "random integer", "dice"],
    keywords: ["ALPHA", ".", "uniform"],
    keys: ["ALPHA", "."],
    summary: "Pseudo-random fraction Ran# or integer RanInt#(a,b) on a closed interval.",
    body: [
      {
        type: "ol",
        title: "Dice roll 1–6",
        items: ["ALPHA . (RanInt#) 1 , 6 ) ="],
      },
    ],
  },
  {
    slug: "abs",
    title: "Absolute Value (Abs)",
    short: "Abs",
    aliases: ["Abs", "absolute value", "|x|"],
    keywords: ["magnitude"],
    keys: ["Abs"],
    summary: "Absolute magnitude of a value or sub-expression.",
    body: [
      {
        type: "lines",
        items: ["Abs(−5.5) = 5.5", "Abs(3 − 8) = 5", "5.5 + 5 = 10.5"],
      },
    ],
  },
  {
    slug: "log-exp",
    title: "Logarithms and Exponentials",
    short: "Log / Exp",
    aliases: ["log", "ln", "e^x", "10^x", "log base"],
    keywords: ["log□□", "natural log"],
    keys: ["log"],
    summary: "log with arbitrary base, log10, ln, 10^x, and e^x.",
    body: [
      {
        type: "lines",
        items: ["log₂ 32 = 5", "e^2.5  (SHIFT ln)"],
      },
    ],
  },
  {
    slug: "trig-hyp",
    title: "Trigonometric and Hyperbolic",
    short: "Trig / Hyp",
    aliases: ["sin", "cos", "tan", "hyp", "sinh", "inverse"],
    keywords: ["hyp", "sin⁻¹", "Deg"],
    keys: ["hyp"],
    summary: "sin/cos/tan, inverses, and hyperbolic functions via hyp.",
    body: [
      {
        type: "lines",
        items: ["sinh 1.2", "cos⁻¹ 0.5 = 60°"],
      },
    ],
  },
  {
    slug: "eng",
    title: "Engineering Notation (ENG)",
    short: "ENG",
    aliases: ["ENG", "SI prefix", "micro", "kilo"],
    keywords: ["×10³", "engineering"],
    keys: ["ENG"],
    summary: "Shift displayed exponent in multiples of 3 for SI-style magnitudes.",
    body: [
      {
        type: "ol",
        title: "Example",
        items: ["0.000045 =", "ENG → 45×10⁻⁶ style display"],
      },
    ],
  },
];

w("sections/functions/_index.json", {
  id: "functions",
  title: "Comprehensive Function Suite",
  shortTitle: "Function Suite",
  parent: "index",
  order: 4,
  aliases: ["features", "special functions", "catalog"],
  keywords: ["FACT", "GCD", "S⇔D", "Pol", "RanInt"],
  formulas: [],
  keySequence: [],
  summary: "Prime factors, GCD/LCM, exact toggles, transforms, combinatorics, random, Abs, logs, trig/hyp, ENG.",
  body: [
    {
      type: "p",
      text: "These COMP-mode tools replace the need for a formula ROM library on this model. Prefer Natural Display for surds and fractions, then S⇔D when a decimal is required.",
    },
    {
      type: "children",
      title: "Functions",
      ids: funcs.map((f) => `functions/${f.slug}`),
    },
  ],
  related: ["modes/comp"],
});

funcs.forEach((f, i) => {
  const body = (f.body || []).flatMap((b) => {
    if (b.type === "ol" && b.title) {
      return [{ type: "h2", text: b.title }, { type: "ol", items: b.items }];
    }
    return [b];
  });
  w(`sections/functions/${f.slug}.json`, {
    id: `functions/${f.slug}`,
    title: f.title,
    shortTitle: f.short,
    parent: "functions",
    order: i + 1,
    aliases: f.aliases,
    keywords: f.keywords,
    formulas: [],
    keySequence: f.keys,
    summary: f.summary,
    body,
    related: ["functions", "modes/comp"],
  });
});

w("sections/statistics.json", {
  id: "statistics",
  title: "Statistics Editor and Menus",
  shortTitle: "Statistics Editor",
  parent: "index",
  order: 5,
  aliases: ["STAT editor", "FREQ", "MinMax", "Reg", "data rows"],
  keywords: ["40 rows", "Ins", "Del-A", "Sum", "Var"],
  formulas: ["ŷ", "x̂"],
  keySequence: ["SHIFT", "1"],
  summary: "Editor capacity, edit commands, and SHIFT 1 (STAT) Sum / Var / Reg / MinMax menus.",
  body: [
    {
      type: "h2",
      text: "Capacity",
    },
    {
      type: "ul",
      items: [
        "40 rows: 1-VAR without FREQ, or paired regression without FREQ",
        "20 rows: 1-VAR with FREQ ON",
        "26 rows: paired data with FREQ ON",
      ],
    },
    {
      type: "h2",
      text: "Editor commands",
    },
    {
      type: "ul",
      items: [
        "Edit cell: type new value, =",
        "Delete row: DEL",
        "Insert row: SHIFT 1 → Edit → Ins",
        "Clear all: SHIFT 1 → Edit → Del-A",
      ],
    },
    {
      type: "table",
      headers: ["Menu", "Role"],
      rows: [
        ["1 Type", "Return to STAT model picker"],
        ["2 Data", "Re-open editor"],
        ["3 Sum", "∑x², ∑x, ∑y… power sums"],
        ["4 Var", "n, means, σ / s"],
        ["5 Reg", "A, B, r, x̂, ŷ (model-dependent)"],
        ["6 MinMax", "min/max, Q1, med, Q3"],
      ],
    },
    { type: "h2", text: "Linear fit + estimate ŷ at x=15" },
    {
      type: "ol",
      items: [
        "SETUP → STAT FREQ OFF",
        "MODE 2 2 (A+BX); enter x: 10,20,30 and y: 25,45,68",
        "AC → SHIFT 1 → Reg → r",
        "15 SHIFT 1 → Reg → ŷ =",
      ],
    },
  ],
  related: ["modes/stat", "modes/stat/a-bx", "setup"],
});

w("sections/memory.json", {
  id: "memory",
  title: "Memory and Variables",
  shortTitle: "Memory",
  parent: "index",
  order: 6,
  aliases: ["STO", "RCL", "Ans", "M+", "variables"],
  keywords: ["A", "B", "C", "D", "E", "F", "X", "Y", "M"],
  formulas: [],
  keySequence: ["SHIFT", "RCL"],
  summary: "Nine variables (A–F, X, Y, M), Ans chaining, and independent M+/M− memory.",
  body: [
    {
      type: "p",
      text: "Store with SHIFT RCL (STO) then a variable key. Recall with RCL or embed with ALPHA + variable.",
    },
    {
      type: "steps",
      title: "Store and reuse A",
      items: [
        "15 × 4 = → 60",
        "SHIFT RCL (STO) A",
        "AC → 3 ALPHA A + 10 = → 190",
      ],
    },
    {
      type: "h2",
      text: "Independent M",
    },
    {
      type: "p",
      text: "M+ adds display to M; SHIFT M+ (M−) subtracts. Indicator M shows when M ≠ 0.",
    },
    {
      type: "h2",
      text: "Ans",
    },
    {
      type: "p",
      text: "Last result is Ans. Starting the next line with an operator continues from Ans automatically.",
    },
  ],
  related: ["modes/comp"],
});

w("sections/exam.json", {
  id: "exam",
  title: "Examination Compliance",
  shortTitle: "Exam",
  parent: "index",
  order: 7,
  aliases: ["NESA", "VCAA", "QCAA", "SACE", "WACE", "NCEA", "HSC", "VCE"],
  keywords: ["non-programmable", "non-CAS", "no graphing"],
  formulas: [],
  keySequence: [],
  summary: "Built for non-programmable, non-CAS, non-graphing rules across Australian states and NCEA (NZ).",
  body: [
    {
      type: "p",
      text: "No user program memory, no CAS, and no function graphing keep the fx-82AU PLUS II inside common Oceania exam policies. Always confirm the current year’s approved list for your board.",
    },
    {
      type: "ul",
      items: [
        "NESA (NSW) — HSC",
        "VCAA (VIC) — VCE",
        "QCAA (QLD)",
        "SACE (SA)",
        "WACE (WA)",
        "TASC (TAS)",
        "NCEA (New Zealand)",
      ],
    },
    {
      type: "note",
      text: "VERIF and exact surds help checking work; written method is still required where the syllabus demands it.",
    },
  ],
  related: ["hardware", "compare"],
});

w("sections/compare.json", {
  id: "compare",
  title: "Compared with fx-50FH II",
  shortTitle: "vs fx-50FH II",
  parent: "index",
  order: 8,
  aliases: ["comparison", "fx-50FH II", "programmable vs non-programmable"],
  keywords: ["FMLA", "PRGM", "VERIF", "quartiles", "HKEAA"],
  formulas: [],
  keySequence: [],
  summary: "Side-by-side: Natural Display and VERIF vs programmable RAM, FMLA/CONST, and HKEAA focus.",
  body: [
    {
      type: "table",
      headers: ["Feature", "fx-82AU PLUS II", "fx-50FH II"],
      rows: [
        ["Display engine", "Natural-V.P.A.M. textbook", "Classic two-line algebraic"],
        ["Programs", "None", "680 bytes, P1–P4"],
        ["Formula / CONST ROM", "None", "23 formulas / 40 constants"],
        ["Verify", "VERIF TRUE/FALSE", "Manual comparison"],
        ["Model extras", "FACT, GCD, LCM, exact surds", "CMPLX, BASE, PRGM"],
        ["Statistics", "1-VAR + quartiles, 7 regs", "SD/REG (7 regressions)"],
        ["Power", "Single AAA (R03)", "Solar + LR44"],
        ["Typical exams", "AU/NZ boards", "HKEAA SUPER-FX PLUS"],
      ],
    },
    {
      type: "p",
      text: "Choose fx-82AU PLUS II for Natural Display classroom/exam work in Oceania. Choose fx-50FH II when approved programmable slots and built-in FMLA/CONST matter (e.g. Hong Kong DSE contexts).",
    },
  ],
  related: ["exam", "hardware"],
});

console.log("Wrote fx-82AU PLUS II content under", BASE);
