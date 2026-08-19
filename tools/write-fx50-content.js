#!/usr/bin/env node
/** One-shot content authoring for fx-50FH II. Run: node tools/write-fx50-content.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = path.join(ROOT, "data", "models", "fx-50fh-ii");

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
      { id: "modes/cmplx", label: "CMPLX" },
      { id: "modes/base-n", label: "BASE" },
      {
        id: "modes/sd",
        label: "SD",
        children: [
          { id: "modes/sd/n", label: "Number of data points (n)" },
          { id: "modes/sd/sum", label: "Sum of values (Σx)" },
          { id: "modes/sd/sumsq", label: "Sum of squares (Σx²)" },
          { id: "modes/sd/mean", label: "Arithmetic mean (x̄)" },
          { id: "modes/sd/stdev", label: "Standard deviation (σx / sx)" },
        ],
      },
      {
        id: "modes/reg",
        label: "REG",
        children: [
          { id: "modes/reg/lin", label: "Lin" },
          { id: "modes/reg/log", label: "Log" },
          { id: "modes/reg/exp", label: "Exp" },
          { id: "modes/reg/pwr", label: "Pwr" },
          { id: "modes/reg/inv", label: "Inv" },
          { id: "modes/reg/quad", label: "Quad" },
        ],
      },
      {
        id: "modes/prgm",
        label: "PRGM",
        children: [
          { id: "modes/prgm/edit", label: "Edit" },
          { id: "modes/prgm/run", label: "Run" },
          { id: "modes/prgm/clear", label: "Clear" },
          { id: "modes/prgm/commands", label: "Commands" },
          {
            id: "modes/prgm/example",
            label: "Example Programs",
            children: [
              { id: "modes/prgm/example/simultaneous-2", label: "Simultaneous 2" },
              { id: "modes/prgm/example/line-quad", label: "Line ∩ Quad" },
              { id: "modes/prgm/example/four-centres", label: "Four Centres" },
              { id: "modes/prgm/example/circle-3pt", label: "Circle 3 Points" },
              { id: "modes/prgm/example/cubic", label: "Cubic" },
              { id: "modes/prgm/example/simultaneous-3", label: "Simultaneous 3" },
              { id: "modes/prgm/example/newton", label: "Newton" },
              { id: "modes/prgm/example/simpson", label: "Simpson" },
              { id: "modes/prgm/example/inverse-normal", label: "Inverse Normal" },
              { id: "modes/prgm/example/binomial-poisson", label: "Bin / Poisson" },
              { id: "modes/prgm/example/quadratic", label: "Quadratic" },
              { id: "modes/prgm/example/circle-centre", label: "Circle Centre" },
              { id: "modes/prgm/example/sequences", label: "AP / GP" },
              { id: "modes/prgm/example/line", label: "Two-Point Line" },
              { id: "modes/prgm/example/polar", label: "Pol / Rec" },
              { id: "modes/prgm/example/freq-sd", label: "Freq → SD" },
            ],
          },
        ],
      },
    ],
  },
  { id: "setup", label: "SET UP" },
  {
    id: "fmla",
    label: "Built-in Formulas",
    children: [],
  },
  { id: "memory", label: "Memory & Variables" },
  { id: "constants", label: "Scientific Constants" },
  { id: "keys", label: "Key Shortcuts" },
  { id: "exam", label: "Exam Compliance" },
];

const fmlaMeta = [
  ["01", "01-quadratic", "Quadratic Equation Solution", "QuadEquation", "x = (-b ± √(b² - 4ac)) / (2a)", ["a", "b", "c"], "Solve ax² + bx + c = 0 for real roots when discriminant ≥ 0."],
  ["02", "02-cosine", "Cosine Theorem", "CosineTheorem", "a² = b² + c² - 2bc cos A", ["b", "c", "A"], "Find a side opposite angle A in a triangle (law of cosines)."],
  ["03", "03-heron", "Heron's Formula", "HeronFormula", "Area = √(s(s-a)(s-b)(s-c)), s = (a+b+c)/2", ["a", "b", "c"], "Triangle area from three side lengths."],
  ["04", "04-normal-p", "Normal Probability P(x)", "NormalP", "P(x) = ∫₋∞ˣ (1/√(2π)) e^(-t²/2) dt", ["x"], "Standard normal CDF up to x (Hastings approximation). Prompt is x; range 0 ≤ x < 10⁵⁰."],
  ["05", "05-normal-r", "Normal Probability Q(x)", "NormalQ", "Q(x) = ∫₀^|x| (1/√(2π)) e^(-t²/2) dt", ["x"], "Standard normal probability from 0 to x (Casio Q). Prompt is x; range 0 ≤ x < 10⁵⁰."],
  ["06", "06-coulomb", "Coulomb's Law", "CoulombLaw", "F = (1/(4πε₀)) · (Q q / r²)", ["Q", "q", "r"], "Electrostatic force between two point charges."],
  ["07", "07-resistance", "Resistance of a Conductor", "Resistance", "R = ρ · ℓ / S", ["ρ", "ℓ", "S"], "Ohmic resistance from resistivity, length, and cross-section."],
  ["08", "08-magnetic", "Magnetic Force", "MagneticForce", "F = I ℓ B sin θ", ["I", "B", "ℓ", "θ"], "Force on a current-carrying conductor in a magnetic field."],
  ["09", "09-rc-voltage", "RC Series Terminal Voltage of R", "RCVoltage", "VR = V · e^(-t/(CR))", ["V", "R", "C", "t"], "Resistor terminal voltage in an RC series circuit (exponential decay)."],
  ["10", "10-voltage-gain", "Voltage Gain", "VoltageGain", "G = 20 log₁₀ (E′ / E)", ["E′", "E"], "Decibel voltage gain; prompts are output E′ then input E."],
  ["11", "11-lrc-series", "Impedance LRC Series", "SeriesLRC", "Z = √(R² + (2πf L - 1/(2πf C))²)", ["f", "R", "L", "C"], "Series RLC impedance at frequency f. Type f in Hz; the ROM uses 2πf, not a separate ω prompt."],
  ["12", "12-lrc-parallel", "Impedance LRC Parallel", "ParallelLRC", "1/Z = √((1/R)² + (2πf C - 1/(2πf L))²)", ["f", "R", "L", "C"], "Parallel RLC impedance at frequency f. Type f in Hz; the ROM uses 2πf, not a separate ω prompt."],
  ["13", "13-oscillation", "Frequency of Electric Oscillation", "Oscillation", "f = 1 / (2π √(LC))", ["L", "C"], "LC tank resonant frequency."],
  ["14", "14-drop", "Distance of Drop", "DropDistance", "s = v₀ t + (1/2) g t²", ["v1", "t"], "Vertical displacement under constant g from ROM (CONST 9-3 = 9.80665)."],
  ["15", "15-pendulum", "Cycle of Simple Pendulum", "SimpPendulum", "T = 2π √(L / g)", ["L"], "Period of a simple pendulum for small angles."],
  ["16", "16-spring", "Cycle of Spring Pendulum", "SprgPendulum", "T = 2π √(m / k)", ["m", "k"], "Period of a mass-spring oscillator."],
  ["17", "17-doppler", "Doppler Effect", "Doppler", "f = f1 · (v − u) / (v − v1)", ["f1", "v", "u", "v1"], "Observed frequency; prompts f₁, v, u, v₁. Source approaching → v₁ positive."],
  ["18", "18-gas", "Ideal Gas Law", "IdealGas", "PV = nRT", ["n", "T", "V"], "State equation; uses gas constant R from ROM."],
  ["19", "19-centrifugal", "Centrifugal Force", "Centrifugal", "F = m v² / r", ["m", "v", "r"], "Centripetal/centrifugal magnitude for circular motion."],
  ["20", "20-elastic", "Elastic Energy", "ElasticEnergy", "U = (1/2) K x²", ["K", "x"], "Potential energy stored in a stretched/compressed spring."],
  ["21", "21-bernoulli", "Bernoulli's Theorem", "Bernoulli", "C = v²/2 + g z + P/ρ", ["v", "z", "ρ", "P"], "Calculator prints energy per unit mass, not the pressure-form constant."],
  ["22", "22-stadia-h", "Stadia Calculations (Height)", "StadiaHeight", "H = K s sinθ cosθ + C sinθ", ["K", "s", "C", "θ"], "Surveying stadia height with constants K, C (use Deg)."],
  ["23", "23-stadia-d", "Stadia Calculations (Distance)", "StadiaDist", "D = K · s · cos² θ + C · cos θ", ["K", "s", "C", "θ"], "Surveying stadia horizontal distance (ROM prints S)."],
];

nav.find((n) => n.id === "fmla").children = fmlaMeta.map(([num, slug, , calcName]) => ({
  id: `fmla/${slug}`,
  label: `[FMLA ${num}] ${calcName}`,
}));

w("model.json", {
  id: "fx-50fh-ii",
  name: "CASIO fx-50FH II",
  shortName: "fx-50FH II",
  aliases: ["fx50fhii", "50FH II", "SUPER-FX PLUS"],
  nav,
});

w("sections/overview.json", {
  id: "index",
  title: "fx-50FH II Overview",
  shortTitle: "Overview",
  parent: "root",
  order: 0,
  aliases: ["introduction", "about", "home", "fx-50FH II"],
  keywords: ["HKEAA", "programmable", "scientific", "SUPER-FX PLUS", "680 bytes"],
  formulas: [],
  keySequence: [],
  summary:
    "Architectural overview of the CASIO fx-50FH II: exam-approved programmable scientific calculator with six modes, 23 formulas, 40 constants, and 680-byte program memory.",
  body: [
    {
      type: "p",
      text: "The CASIO fx-50FH II (HKEAA designation SUPER-FX PLUS) is a programmable scientific calculator aimed at advanced secondary and tertiary mathematics, engineering, and physical sciences. It combines a photovoltaic cell with an LR44 battery so memory and operation remain stable in low light.",
    },
    {
      type: "p",
      text: "The display is two-line: an upper 12-character dot-matrix line for expressions and prompts, and a lower 10+2 digit numeric line for results. The calculator intentionally omits symbolic CAS and dedicated numerical calculus keys, which helps keep it exam-legal while still offering four program slots (P1–P4), 23 ROM formulas, 40 scientific constants, complex numbers, statistics, and Base-n logic.",
    },
    {
      type: "h2",
      text: "What you can do with this reference",
    },
    {
      type: "ul",
      items: [
        "Walk every MODE and its sub-menus (REG regressions, PRGM actions).",
        "Configure SET UP (angles, display, fractions, separators).",
        "Run each of the 23 FMLA algorithms with inputs and examples.",
        "Use variables, CONST, and common key shortcuts.",
        "Write BASIC-like programs with the full command suite.",
      ],
    },
    {
      type: "children",
      title: "Start here",
      ids: ["hardware", "modes", "setup", "fmla", "memory", "constants", "keys", "modes/prgm", "exam"],
    },
  ],
  related: ["hardware", "exam"],
});

w("sections/hardware.json", {
  id: "hardware",
  title: "Hardware and Specifications",
  shortTitle: "Hardware",
  parent: "index",
  order: 1,
  aliases: ["specs", "display", "memory capacity", "power", "LR44"],
  keywords: ["10+2", "two-line", "680 bytes", "solar", "battery", "variables"],
  formulas: [],
  keySequence: [],
  summary: "Display, program RAM, registers, power, and exam certification specifications.",
  body: [
    {
      type: "p",
      text: "Hardware choices on the fx-50FH II balance exam rules with practical scientific work: dual power, non-volatile user RAM for programs, and a hybrid two-line LCD suited to algebraic entry without graphing.",
    },
    {
      type: "table",
      headers: ["Parameter", "Specification", "Notes"],
      rows: [
        ["Display", "Two-line hybrid LCD", "Upper 12-char dot-matrix; lower 10+2 numeric"],
        ["Program capacity", "680 bytes user RAM", "Shared dynamically across P1–P4"],
        ["Memory registers", "7 variables: A, B, C, D, X, Y, M", "Plus Ans (auto) and independent M+/M−"],
        ["Built-in formulas", "23 algorithms", "FMLA key, indices 01–23"],
        ["Scientific constants", "40 values", "CONST key, 10 pages × keys 1–4"],
        ["Power", "Solar + LR44", "Continuous retention in low light"],
        ["Exam mark", "HKEAA SUPER-FX PLUS", "Approved for designated HK exams"],
        ["Size / weight (typical)", "≈ 11.1 × 80 × 162 mm / 95 g", "Without hard case; with case ≈ 12.2 mm / 105 g"],
      ],
    },
    {
      type: "note",
      label: "Tip",
      text: "Program bytes are shared. A large program in P1 reduces space left for P2–P4. Clear unused slots (MODE 6 → Clear) when you need room.",
    },
  ],
  related: ["memory", "modes/prgm", "exam"],
});

w("sections/modes/_index.json", {
  id: "modes",
  title: "Calculation Modes (MODE)",
  shortTitle: "Modes",
  parent: "index",
  order: 2,
  aliases: ["MODE key", "mode menu", "execution environments"],
  keywords: ["COMP", "CMPLX", "BASE", "SD", "REG", "PRGM"],
  formulas: [],
  keySequence: ["MODE"],
  summary:
    "Six primary modes reconfigure evaluation logic, keyboard shortcuts, and memory behaviour. REG and PRGM open nested sub-menus.",
  body: [
    {
      type: "p",
      text: "Press MODE to open the mode list. Choosing a mode changes how expressions and data buffers are processed. Always confirm the mode indicator before entering statistics data or programs.",
    },
    {
      type: "table",
      headers: ["Key", "Mode", "Purpose"],
      rows: [
        ["1", "COMP", "General arithmetic, trig, logs, fractions, transforms"],
        ["2", "CMPLX", "Rectangular / polar complex arithmetic"],
        ["3", "BASE", "BIN/OCT/DEC/HEX and bitwise logic"],
        ["4", "SD", "One-variable statistics"],
        ["5", "REG", "Paired-variable regression (7 models)"],
        ["6", "PRGM", "Edit, run, or delete programs"],
      ],
    },
    {
      type: "children",
      title: "Mode pages",
      ids: ["modes/comp", "modes/cmplx", "modes/base-n", "modes/sd", "modes/reg", "modes/prgm"],
    },
  ],
  related: ["setup"],
});

function modePage(id, title, short, order, aliases, keywords, formulas, keys, summary, body, related) {
  w(`sections/${id}.json`.replace("modes/", "modes/").replace(/^sections\/modes\//, "sections/modes/"), {
    id,
    title,
    shortTitle: short,
    parent: id.includes("/") && id.split("/").length > 2 ? id.split("/").slice(0, -1).join("/") : "modes",
    order,
    aliases,
    keywords,
    formulas,
    keySequence: keys,
    summary,
    body,
    related: related || [],
  });
}

// Fix path helper
function modeFile(id) {
  return "sections/" + id + ".json";
}

w(modeFile("modes/comp"), {
  id: "modes/comp",
  title: "MODE 1: COMP (General Computation)",
  shortTitle: "COMP",
  parent: "modes",
  order: 1,
  aliases: ["computation", "MODE 1", "normal mode", "arithmetic"],
  keywords: ["trigonometry", "logarithm", "fraction", "coordinate", "Ans"],
  formulas: [],
  keySequence: ["MODE", "1"],
  summary:
    "Default environment for arithmetic, trigonometry, logarithms, exponentials, fractions, and coordinate transformations.",
  body: [
    {
      type: "p",
      text: "COMP is the everyday mode. It supports continuous calculations, variable store/recall, CONST, FMLA, and multi-statement work with Ans chaining. Angle results follow the current Deg/Rad/Gra SET UP.",
    },
    {
      type: "h2",
      text: "Worked example",
    },
    {
      type: "p",
      text: "Evaluate 2 × (3 + 4²) after confirming COMP mode.",
    },
    {
      type: "steps",
      title: "Key strokes",
      items: [
        "MODE → 1 (COMP)",
        "Enter: 2 × ( 3 + 4 x² ) EXE",
        "Expected result: 38",
      ],
    },
    {
      type: "note",
      label: "When to leave COMP",
      text: "Switch to CMPLX for i, BASE for hex/bin logic, SD/REG for statistics buffers, or PRGM to edit code. Mixing statistic DT entry in COMP will not fill the SD/REG buffers.",
    },
  ],
  related: ["setup", "memory", "keys"],
});

w(modeFile("modes/cmplx"), {
  id: "modes/cmplx",
  title: "MODE 2: CMPLX (Complex Numbers)",
  shortTitle: "CMPLX",
  parent: "modes",
  order: 2,
  aliases: ["complex", "MODE 2", "imaginary", "polar", "rectangular"],
  keywords: ["i", "Arg", "Abs", "ENG key", "a+bi", "r∠θ"],
  formulas: ["a + bi", "r∠θ"],
  keySequence: ["MODE", "2"],
  summary: "Rectangular (a+bi) and polar (r∠θ) arithmetic on complex numbers.",
  body: [
    {
      type: "p",
      text: "In CMPLX, the imaginary unit i is the ENG key unshifted. Use this mode for AC circuit phasors, polynomial roots with imaginaries, and polar conversions. SHIFT EXE (Re⇔Im) toggles the real and imaginary parts of a result.",
    },
    {
      type: "formula",
      plain: "(a + bi) + (c + di) = (a+c) + (b+d)i",
    },
    { type: "h2", text: "Example: add 3+2i and 1−4i" },
    {
      type: "ol",
      items: [
        "MODE → 2",
        "Enter: 3 + 2i + 1 − 4i EXE",
        "Result: 4 − 2i",
      ],
    },
    {
      type: "note",
      label: "Display form",
      text: "Polar vs rectangular presentation depends on calculator settings and conversion functions (Pol/Rec). Confirm angle unit before interpreting θ.",
    },
  ],
  related: ["keys", "modes/comp"],
});

w(modeFile("modes/base-n"), {
  id: "modes/base-n",
  title: "MODE 3: BASE (Bases and Logic)",
  shortTitle: "BASE",
  parent: "modes",
  order: 3,
  aliases: ["binary", "hex", "octal", "MODE 3", "bitwise", "AND OR XOR", "BASE-N"],
  keywords: ["BIN", "OCT", "DEC", "HEX", "NOT", "XNOR", "LOGIC", "computer science"],
  formulas: [],
  keySequence: ["MODE", "3"],
  summary: "Convert among BIN, OCT, DEC, HEX and apply bitwise logical operators on integers.",
  body: [
    {
      type: "p",
      text: "MODE 3 is BASE (the mode menu prints BASE, not BASE-N). Use the green DEC, HEX, BIN, and OCT keys to set the working base. Values are integers; binary logic is 10-bit.",
    },
    { type: "h2", text: "Hex digits A–F" },
    {
      type: "p",
      text: "In BASE, hex A–F are the green letters on (-) = A, °′″ = B, hyp = C, sin = D, cos = E, tan = F. Press those keys unshifted. ALPHA A is variable A and will not type hex A.",
    },
    { type: "h2", text: "Example: decimal 45 to binary" },
    {
      type: "ol",
      items: ["MODE → 3", "DEC, enter 45 EXE", "BIN", "Read 101101"],
    },
    { type: "h2", text: "Example: hex 1F + 1" },
    {
      type: "ol",
      items: ["HEX", "1 tan (F) + 1 EXE", "Result 20₁₆"],
    },
    { type: "h2", text: "LOGIC menu" },
    {
      type: "p",
      text: "In BASE the X key opens LOGIC (and, or, xor, xnor, Not, Neg, and d/h/o/b prefixes). Binary Not and Neg use a 10-bit word.",
    },
    {
      type: "note",
      label: "Pitfall",
      text: "Fractions, EXP, and most scientific functions are not valid in BASE. Return to COMP for floating-point work.",
    },
  ],
  related: ["modes/comp"],
});

// SD mode: keep the detailed page in sections/modes/sd.json (do not overwrite here).

w(modeFile("modes/reg"), {
  id: "modes/reg",
  title: "MODE 5: REG (Paired-Variable Regression)",
  shortTitle: "REG",
  parent: "modes",
  order: 5,
  aliases: ["regression", "MODE 5", "bivariate", "correlation"],
  keywords: ["Lin", "Log", "Exp", "Pwr", "Inv", "Quad", "r"],
  formulas: ["y = A + Bx"],
  keySequence: ["MODE", "5"],
  summary: "Enter (x, y) pairs and fit one of six regression models; obtain coefficients and correlation where applicable.",
  body: [
    {
      type: "p",
      text: "After MODE 5, choose a regression type. Enter data as x,y DT (or the model’s paired entry pattern). Incorrect model choice (e.g. Lin for curved data) yields a poor fit even when r looks moderate—plot or residual-check when possible.",
    },
    {
      type: "children",
      title: "Regression models",
      ids: [
        "modes/reg/lin",
        "modes/reg/log",
        "modes/reg/exp",
        "modes/reg/pwr",
        "modes/reg/inv",
        "modes/reg/quad",
      ],
    },
  ],
  related: ["modes/sd"],
});

const regs = [
  {
    slug: "lin",
    num: "1",
    name: "Lin (Linear Regression)",
    eq: "y = A + Bx",
    aliases: ["linear regression", "y=A+Bx", "MODE 5 1", "correlation r"],
    keywords: ["slope", "intercept", "r", "bivariate"],
    example: "For points (1,2) and (2,4), expect slope B = 2, intercept A = 0, r = 1.",
    exampleLines: {
      lead: "Points (1, 2) and (2, 4):",
      items: ["slope B = 2", "intercept A = 0", "r = 1"],
    },
    use: "Straight-line trends, calibration curves, constant rate of change.",
  },
  {
    slug: "log",
    num: "2",
    name: "Log (Logarithmic Regression)",
    eq: "y = A + B ln x",
    aliases: ["logarithmic regression", "MODE 5 2", "y=A+B ln x"],
    keywords: ["ln", "diminishing returns"],
    example: "Use when y grows quickly for small x then flattens (logarithmic growth).",
    use: "Sensory response, some learning curves, log-scaled x relationships.",
  },
  {
    slug: "exp",
    num: "3",
    name: "Exp (Exponential Regression)",
    eq: "y = A e^(Bx)",
    aliases: ["exponential regression", "MODE 5 3", "y=Ae^(Bx)"],
    keywords: ["growth", "decay", "radioactive"],
    example: "Model population growth or radioactive decay datasets with roughly constant percentage change.",
    use: "Compound growth/decay when linear fit on ln y vs x is appropriate.",
  },
  {
    slug: "pwr",
    num: "4",
    name: "Pwr (Power Regression)",
    eq: "y = A x^B",
    aliases: ["power regression", "MODE 5 4", "y=Ax^B"],
    keywords: ["scaling", "allometry", "power law"],
    example: "Empirical scaling laws in physics (e.g. intensity vs distance approximations).",
    use: "When both axes are positive and log-log looks linear.",
  },
  {
    slug: "inv",
    screen: 2,
    num: "1",
    modeNum: "5",
    name: "Inv (Inverse Regression)",
    eq: "y = A + B/x",
    aliases: ["inverse regression", "MODE 5 Inv", "REG Inv", "y=A+B/x", "Boyle"],
    keywords: ["reciprocal", "hyperbola"],
    example: "Boyle-type relationships (pressure vs 1/volume style) after rearranging.",
    use: "Reciprocal physical relationships.",
  },
  {
    slug: "quad",
    screen: 2,
    num: "2",
    modeNum: "6",
    name: "Quad (Quadratic Regression)",
    eq: "y = A + Bx + Cx²",
    aliases: ["quadratic regression", "MODE 5 Quad", "REG Quad", "parabola"],
    keywords: ["parabola", "trajectory", "second-order"],
    example: "Fit parabolic trajectories from experimental (x, y) samples.",
    use: "Symmetric curved trends needing a second-degree polynomial.",
  },
];

regs.forEach((r, i) => {
  const openKeys = r.screen === 2 ? ["MODE", "5", "▶", r.num] : ["MODE", "5", r.num];
  const openLabel = r.screen === 2
    ? `MODE 5-${r.modeNum}: ${r.name.split(" (")[0]} (${r.name.match(/\(([^)]+)\)/)[1]})`
    : `MODE 5-${r.num}: ${r.name}`;
  w(modeFile(`modes/reg/${r.slug}`), {
    id: `modes/reg/${r.slug}`,
    title: openLabel,
    shortTitle: r.name.split(" ")[0],
    parent: "modes/reg",
    order: i + 1,
    aliases: r.aliases,
    keywords: r.keywords,
    formulas: [r.eq],
    keySequence: openKeys,
    summary: `Fits paired data to ${r.eq}.`,
    body: [
      { type: "p", text: r.use },
      { type: "formula", plain: r.eq },
      {
        type: "steps",
        title: "How to open",
        items: [
          r.screen === 2 ? `MODE → 5 → ▼ → ${r.num}` : `MODE → 5 → ${r.num}`,
          "Clear old STAT data if switching datasets",
          "Enter x,y pairs with DT",
          "Recall A, B (and C for Quad) and r when available",
        ],
      },
      ...(r.exampleLines
        ? [
            { type: "h2", text: "Example" },
            { type: "lines", lead: r.exampleLines.lead, items: r.exampleLines.items },
          ]
        : [{ type: "note", label: "Example / guidance", text: r.example }]),
    ],
    related: regs.filter((x) => x.slug !== r.slug).slice(0, 2).map((x) => `modes/reg/${x.slug}`),
  });
});

w(modeFile("modes/prgm"), {
  id: "modes/prgm",
  title: "MODE 6: PRGM (Programming)",
  shortTitle: "PRGM",
  parent: "modes",
  order: 6,
  aliases: ["program", "MODE 6", "P1", "P2", "BASIC"],
  keywords: ["Edit", "Run", "Clear", "680 bytes", "program areas"],
  formulas: [],
  keySequence: ["MODE", "6"],
  summary: "Manage four program slots: edit, run, or delete (DEL).",
  body: [
    {
      type: "p",
      text: "PRGM opens a three-item menu over slots P1–P4 sharing 680 bytes: 1 EDIT, 2 RUN, 3 DEL. Programs use a BASIC-like language with input prompts, display pauses, branches, and loops. Formulas in ROM do not consume this RAM.",
    },
    {
      type: "children",
      title: "PRGM actions",
      ids: [
        "modes/prgm/edit",
        "modes/prgm/run",
        "modes/prgm/clear",
        "modes/prgm/commands",
        "modes/prgm/example",
      ],
    },
  ],
  related: ["modes/prgm/commands", "exam"],
});

const prgmActions = [
  {
    slug: "edit",
    num: "1",
    title: "Edit",
    summary: "Open a program slot (P1–P4) to author or modify commands. A new unused slot also asks for the program’s run mode.",
    body: "Press MODE 6 → 1, then select slot 1–4. Enter statements from the keypad and SHIFT 3 (P-CMD). An unused slot first asks for run mode (1 COMP, 2 CMPLX; ▶ then 3 BASE, 4 SD, 5 REG). That mode cannot be changed later. AC exits editing.",
    example: "MODE → 6 → 1 → unused slot → 1 (COMP) starts a new COMP program in that slot.",
  },
  {
    slug: "run",
    num: "2",
    title: "Run",
    summary: "Execute the program stored in a selected slot.",
    body: "MODE 6 → 2 → slot. Respond to ? prompts with values then EXE. Display pauses (◢) wait for EXE to continue.",
    example: "MODE → 6 → 2 → 1 runs P1.",
  },
  {
    slug: "clear",
    num: "3",
    title: "Clear",
    summary: "Erase a program slot and free its bytes.",
    body: "MODE 6 → 3 → slot → confirm with EXE. Irreversible for that slot’s source.",
    example: "MODE → 6 → 3 → 1 → EXE clears P1.",
  },
];

prgmActions.forEach((a, i) => {
  w(modeFile(`modes/prgm/${a.slug}`), {
    id: `modes/prgm/${a.slug}`,
    title: `MODE 6-${a.num}: ${a.title}`,
    shortTitle: a.title,
    parent: "modes/prgm",
    order: i + 1,
    aliases: [`MODE 6 ${a.num}`, a.title, `PRGM ${a.title}`],
    keywords: ["program", a.title.toLowerCase()],
    formulas: [],
    keySequence: ["MODE", "6", a.num],
    summary: a.summary,
    body: [
      { type: "p", text: a.body },
      { type: "h2", text: "Example" },
      { type: "ol", items: [a.example] },
    ],
    related: ["modes/prgm/commands"],
  });
});

w(modeFile("modes/prgm/commands"), {
  id: "modes/prgm/commands",
  title: "Programming Command Suite",
  shortTitle: "Commands",
  parent: "modes/prgm",
  order: 5,
  aliases: ["Goto", "Lbl", "If Then", "For Next", "ClrMemory", "input prompt", "◢"],
  keywords: ["syntax", "branch", "loop", "assignment", "multi-statement"],
  formulas: ["? → Var", "Expr → Var", "Goto N", "Lbl N", "Cond ⇒ Cmd"],
  keySequence: ["MODE", "6", "1"],
  summary: "Core PRGM language: input, assignment, display pause, jumps, structured If, For loops, Break, and memory clear. Type commands from SHIFT 3 (P-CMD).",
  body: [
    {
      type: "p",
      text: "While editing, open the command menu with SHIFT 3 (P-CMD), or the Prog key. There is no Stop command. End a branch with Goto / Lbl, IfEnd, WhileEnd, or Break (Break only exits For / While).",
    },
    {
      type: "table",
      headers: ["Command", "Syntax", "Effect"],
      rows: [
        ["Input", "? → Var", "Pause and store user value into Var"],
        ["Assignment", "Expr → Var", "Evaluate Expr; store in Var"],
        ["Multi-statement", "Cmd1 : Cmd2", "Run commands in sequence"],
        ["Display pause", "Expr ◢", "Show value; wait for EXE"],
        ["Label", "Lbl N", "Destination marker (N typically 0–9)"],
        ["Goto", "Goto N", "Jump to Lbl N"],
        ["Conditional jump", "Cond ⇒ Cmd", "Run Cmd only if Cond is true"],
        ["If block", "If Cond : Then … Else … IfEnd", "Structured branching"],
        ["For loop", "For Start → Var To End Step Δ : … : Next", "Counted iteration"],
        ["Break", "Break", "Leave the enclosing For or While loop"],
        ["ClrMemory", "ClrMemory", "Zero A–D, X, Y, M"],
      ],
    },
    {
      type: "note",
      label: "Byte budget",
      text: "Each command consumes program memory. Prefer compact expressions and reuse Ans/variables. Clear unused slots before writing long solvers.",
    },
  ],
  related: ["modes/prgm/example"],
});

// Example programs: owned by tools/make-prgm-examples.js (do not overwrite here).

// SETUP
w("sections/setup.json", {
  id: "setup",
  title: "System SET UP",
  shortTitle: "SET UP",
  parent: "index",
  order: 3,
  aliases: ["SHIFT MODE", "SETUP", "Fix", "Sci", "Norm", "Deg", "Rad", "ab/c"],
  keywords: ["angle", "display", "fraction", "FreqOn", "contrast"],
  formulas: [],
  keySequence: ["SHIFT", "MODE"],
  summary: "Angle unit, display digits, fractions, complex form, STAT frequency, and contrast/reset.",
  body: [
    {
      type: "p",
      text: "Open SET UP with SHIFT MODE (SETUP) only. Use ◀ / ▶ to move between the six SET UP screens. MODE itself picks COMP / CMPLX / BASE / SD / REG / PRGM and does not open SET UP. Wrong angle unit is the most common source of trig errors in exams.",
    },
    {
      type: "table",
      headers: ["Group", "Options", "Default / notes"],
      rows: [
        ["Angle", "1 Deg / 2 Rad / 3 Gra", "Deg typical for secondary exams"],
        ["Display digits", "Fix 0–9 / Sci 1–10 / Norm 1 / Norm 2", "Norm 1 often default"],
        ["Fractions", "ab/c mixed / d/c improper", "ab/c common default"],
        ["Complex form", "a+bi / r∠θ", "a+bi default"],
        ["Statistics frequency", "1 FreqOn / 2 FreqOff", "SHIFT MODE ◀ ◀ then 1 or 2. FreqOn default; used in SD and REG"],
        ["Contrast / CLR", "Cursor adjust / SHIFT 9 CLR", "Reset setup via CLR menu"],
      ],
    },
    { type: "h2", text: "Angle units" },
    {
      type: "p",
      text: "Deg: full turn 360°. Rad: full turn 2π. Gra: full turn 400ᵍ. Example: sin 30° = 0.5 only in Deg; in Rad, sin(π/6) = 0.5.",
    },
    { type: "h2", text: "Fix / Sci / Norm" },
    {
      type: "ul",
      items: [
        "Fix n: show n decimal places (internal precision retained).",
        "Sci n: scientific notation with n significant digits.",
        "Norm 1: exponential when |x| < 10⁻² or large magnitude thresholds per manual.",
        "Norm 2: exponential when |x| < 10⁻⁹ (stricter small-value threshold).",
      ],
    },
    { type: "h2", text: "Fractions" },
    {
      type: "p",
      text: "ab/c shows mixed numbers (e.g. 1⅗ style); d/c keeps improper fractions.",
    },
    {
      type: "note",
      label: "ENG key",
      text: "Engineering notation is not a SETUP item. Press ENG (ENG/) or SHIFT ENG (ENG,) to shift the exponent to ×10⁰, ×10³, ×10⁶, … matching SI prefixes (k, M, m, μ).",
    },
  ],
  related: ["modes/comp", "keys"],
});

// FMLA index + each formula
w("sections/fmla/_index.json", {
  id: "fmla",
  title: "Built-in Formula Library (FMLA)",
  shortTitle: "FMLA",
  parent: "index",
  order: 4,
  aliases: ["formulas", "FMLA key", "01-23", "ROM algorithms"],
  keywords: ["quadratic", "Heron", "normal", "physics", "23 formulas"],
  formulas: [],
  keySequence: ["FMLA"],
  summary: "Twenty-three factory algorithms in ROM. Press FMLA, enter 01–23, then supply prompted parameters.",
  body: [
    {
      type: "p",
      text: "Built-in formulas live in ROM and do not use the 680-byte program pool. HKEAA SUPER-FX PLUS sittings still allow student programs in P1–P4; FMLA is a verified factory routine, not a substitute for writing your own solver.",
    },
    {
      type: "steps",
      title: "General procedure",
      items: [
        "Press FMLA",
        "Enter two-digit index (01–23)",
        "Enter each prompted variable, confirming with EXE",
        "Read the computed result",
      ],
    },
    {
      type: "children",
      title: "Formula catalog",
      ids: fmlaMeta.map(([, slug]) => `fmla/${slug}`),
    },
  ],
  related: ["modes/prgm/example", "constants"],
});

const fmlaExamples = {
  "01": ["FMLA → 0 → 1", "Enter a=1, b=-3, c=2", "Roots related to (x-1)(x-2)=0 → x=1, x=2"],
  "02": ["FMLA → 0 → 2", "Enter sides b,c and included angle A", "Obtain opposite side a via cosine law"],
  "03": ["FMLA → 0 → 3", "Enter a,b,c of a triangle", "Receive area via semi-perimeter s"],
  "04": ["FMLA → 0 → 4", "Enter standardized x (x ≥ 0)", "Read lower-tail normal probability P(x)"],
  "05": ["FMLA → 0 → 5", "Enter standardized x ≥ 0", "Read Q(x) = P(0 ≤ Z ≤ x)"],
  "06": ["FMLA → 0 → 6", "4 EXP (−) 5 EXE  1 EXP (−) 5 EXE  0.8 EXE", "F = 5.6172 N"],
  "07": ["FMLA → 0 → 7", "Enter ρ, ℓ, S", "Resistance R = ρℓ/S"],
  "08": ["FMLA → 0 → 8", "3 EXE  0.7 EXE  1 EXE  30 EXE", "F = 1.05 N"],
  "09": ["FMLA → 0 → 9", "Enter V, R, C, t", "Resistor voltage VR = V e^(−t/CR)"],
  "10": ["FMLA → 1 → 0", "Enter E′ (output), then E (input)", "30 EXE 12 EXE → 7.9588 dB"],
  "11": ["FMLA → 1 → 1", "50 EXE  2 EXE  0.07 EXE  25 EXP (−) 6 EXE", "Z = 105.3518 Ω"],
  "12": ["FMLA → 1 → 2", "50 EXE  2 EXE  0.07 EXE  25 EXP (−) 6 EXE", "Z = 1.99436 Ω"],
  "13": ["FMLA → 1 → 3", "Enter L, C", "Resonant frequency"],
  "14": ["FMLA → 1 → 4", "Enter v₁, t", "2 EXE 4 EXE → 86.4532 m (ROM g)"],
  "15": ["FMLA → 1 → 5", "Enter length L", "Pendulum period"],
  "16": ["FMLA → 1 → 6", "Enter m, k", "Spring-mass period"],
  "17": ["FMLA → 1 → 7", "Enter f₁, v, u, v₁", "256 EXE 330 EXE 0 EXE 25 EXE → 276.9836 Hz"],
  "18": ["FMLA → 1 → 8", "Enter n, T, V", "Uses R from constants"],
  "19": ["FMLA → 1 → 9", "Enter m, v, r", "F = mv²/r"],
  "20": ["FMLA → 2 → 0", "Enter K, x", "Elastic energy U"],
  "21": ["FMLA → 2 → 1", "Enter v, z, ρ, P", "Display is C = v²/2 + gz + P/ρ"],
  "22": ["FMLA → 2 → 2", "Enter K, s, C, θ", "Height H = Ks sinθ cosθ + C sinθ"],
  "23": ["FMLA → 2 → 3", "Enter K, s, C, θ", "100 EXE 0.865 EXE 0 EXE 4 EXE → S = 86.07909397"],
};

fmlaMeta.forEach(([num, slug, title, calcName, eq, params, blurb], i) => {
  if (num === "01") return; // written with full examples below
  const navLabel = `[FMLA ${num}] ${calcName}`;
  w(`sections/fmla/${slug}.json`, {
    id: `fmla/${slug}`,
    title: `${navLabel} — ${title}`,
    shortTitle: navLabel,
    parent: "fmla",
    order: i + 1,
    aliases: [title, calcName, `FMLA ${num}`, `formula ${num}`, num, navLabel],
    keywords: params.concat([title.split(" ")[0].toLowerCase(), calcName, "built-in"]),
    formulas: [eq],
    keySequence: ["FMLA", num[0], num[1]],
    summary: blurb,
    body: [
      {
        type: "p",
        text: `Calculator scroll name: ${calcName}. ${blurb}`,
      },
      { type: "formula", plain: eq },
      {
        type: "keys",
        keys: ["FMLA", num[0], num[1]],
      },
      {
        type: "p",
        text: "Primary inputs: " + params.join(", ") + ".",
      },
      {
        type: "steps",
        title: "How to run",
        items: [
          `Press FMLA, then ${num[0]}, then ${num[1]} (or scroll to the name and EXE)`,
          "Enter each prompted value",
          "Read the result",
        ],
      },
      { type: "h2", text: "Example" },
      {
        type: "ol",
        items: fmlaExamples[num],
      },
      {
        type: "note",
        label: "Beyond the manual",
        text:
          num === "04" || num === "05"
            ? "Hastings-style approximation. The routine expects t ≥ 0 (official range 0 ≤ t < 1×10⁵⁰)."
            : num === "02" || num === "08" || num === "22" || num === "23"
              ? "Run in Deg. Wrong SET UP angle unit is a common source of a mismatch with a textbook answer."
              : num === "17"
                ? "The ROM evaluates f = f₁ (v − u) / (v − v₁). Map approach/recede onto the signs of u and v₁; do not type textbook ±."
                : num === "06" || num === "14" || num === "15" || num === "18" || num === "21"
                  ? "This routine uses a ROM constant (ε₀, g, or R). Keep inputs in SI units."
                  : "Use SI units before comparing with textbook answers.",
      },
    ],
    related: ["fmla"],
  });
});

// FMLA 01 — enriched with discriminant cases and MATH ERROR meaning
w("sections/fmla/01-quadratic.json", {
  id: "fmla/01-quadratic",
  title: "[FMLA 01] QuadEquation — Quadratic Equation Solution",
  shortTitle: "[FMLA 01] QuadEquation",
  parent: "fmla",
  order: 1,
  aliases: [
    "Quadratic Equation Solution",
    "QuadEquation",
    "FMLA 01",
    "formula 01",
    "01",
    "[FMLA 01] QuadEquation",
    "MATH ERROR",
    "discriminant",
    "real roots",
  ],
  keywords: [
    "a",
    "b",
    "c",
    "quadratic",
    "QuadEquation",
    "built-in",
    "MATH ERROR",
    "discriminant",
    "double root",
    "repeated root",
  ],
  formulas: [
    "x = (-b ± √(b² - 4ac)) / (2a)",
    "D = b² - 4ac",
    "ax² + bx + c = 0",
  ],
  keySequence: ["FMLA", "0", "1"],
  summary:
    "Solve ax² + bx + c = 0 for real roots. Two distinct roots, one repeated root, or MATH ERROR when there are no real roots.",
  body: [
    {
      type: "p",
      text: "Calculator scroll name: QuadEquation. Solves the quadratic equation ax² + bx + c = 0 for real roots. Enter coefficients a, b, and c when prompted (a ≠ 0).",
    },
    {
      type: "formula",
      plain: "x = (-b ± √(b² - 4ac)) / (2a)",
    },
    {
      type: "keys",
      keys: ["FMLA", "0", "1"],
    },
    {
      type: "p",
      text: "The calculator uses the discriminant D = b² − 4ac internally. How many real roots you get depends on D:",
    },
    {
      type: "ul",
      items: [
        "D > 0 — two distinct real roots (shown one after another; press EXE to see the second)",
        "D = 0 — one real root (a repeated / double root); both displays are the same value",
        "D < 0 — no real roots; the calculator shows MATH ERROR",
      ],
    },
    {
      type: "note",
      text: "MATH ERROR on FMLA 01 means there are no real roots (complex conjugate roots exist, but this built-in formula does not display them). For complex-style output, use a custom PRGM such as the sample quadratic solver under Programming.",
    },
    { type: "h2", text: "How to run" },
    {
      type: "steps",
      title: "Open QuadEquation",
      items: [
        "Press FMLA, then 0, then 1 (or scroll to QuadEquation and EXE)",
        "Enter a, then b, then c at each prompt",
        "Read the first root; press EXE again for the second root when two are shown",
      ],
    },
    { type: "h2", text: "Example: two distinct real roots" },
    {
      type: "lines",
      lead: "Solve x² − 7x + 12 = 0",
      items: [
        "a = 1",
        "b = −7",
        "c = 12",
        "D = 49 − 48 = 1 > 0",
        "two real roots: x = 4 and x = 3",
      ],
    },
    {
      type: "steps",
      title: "Key strokes",
      items: [
        "FMLA → 0 → 1",
        "Enter a: 1 EXE",
        "Enter b: −7 EXE",
        "Enter c: 12 EXE",
        "First display: 4 — press EXE",
        "Second display: 3",
      ],
    },
    { type: "h2", text: "Example: one real root (repeated)" },
    {
      type: "lines",
      lead: "Solve x² − 6x + 9 = 0, which is (x − 3)² = 0",
      items: [
        "a = 1",
        "b = −6",
        "c = 9",
        "D = 36 − 36 = 0",
        "one real root: x = 3 (shown twice)",
      ],
    },
    {
      type: "steps",
      title: "Key strokes",
      items: [
        "FMLA → 0 → 1",
        "Enter a: 1 EXE",
        "Enter b: −6 EXE",
        "Enter c: 9 EXE",
        "Display: 3 (and again 3 on the next EXE)",
      ],
    },
    { type: "h2", text: "Example: no real roots (MATH ERROR)" },
    {
      type: "lines",
      lead: "Solve x² + 6x + 25 = 0",
      items: [
        "a = 1",
        "b = 6",
        "c = 25",
        "D = 36 − 100 = −64 < 0",
        "no real roots — FMLA 01 shows MATH ERROR",
      ],
    },
    {
      type: "steps",
      title: "Key strokes",
      items: [
        "FMLA → 0 → 1",
        "Enter a: 1 EXE",
        "Enter b: 6 EXE",
        "Enter c: 25 EXE",
        "Display: MATH ERROR — means no real roots for this equation",
      ],
    },
    {
      type: "note",
      text: "Always confirm a ≠ 0. If a = 0 the equation is not quadratic and the routine is not valid. For complex roots or vertex output in one program, see the sample quadratic PRGM on this site.",
    },
  ],
  related: ["modes/prgm/example", "fmla"],
});

w("sections/memory.json", {
  id: "memory",
  title: "Memory Architecture and Variables",
  shortTitle: "Memory",
  parent: "index",
  order: 5,
  aliases: ["STO", "RCL", "Ans", "M+", "variables A B C D X Y"],
  keywords: ["independent memory", "registers", "ALPHA"],
  formulas: [],
  keySequence: ["SHIFT", "RCL"],
  summary: "Seven user variables (A–D, X, Y, M), plus automatic Ans and the statistical buffer.",
  body: [
    {
      type: "p",
      text: "Standard variables A, B, C, D, X, Y store temporaries. There is no STO key: store with SHIFT RCL (STO) then the letter key (A–D, X, Y, M). Recall with RCL then the letter, or type ALPHA + letter inside an expression.",
    },
    {
      type: "steps",
      title: "Store and reuse",
      items: [
        "Enter 5 EXE, then SHIFT RCL (STO) A",
        "Enter ALPHA A × 3 EXE → 15",
      ],
    },
    {
      type: "h2",
      text: "Independent memory M",
    },
    {
      type: "p",
      text: "M+ adds the display to M; SHIFT M+ (M−) subtracts. Useful for running totals without overwriting A–D.",
    },
    {
      type: "h2",
      text: "Ans",
    },
    {
      type: "p",
      text: "Ans holds the last evaluated result automatically. Start the next expression with an operator to chain (e.g. compute 15×3, then ÷2 to continue from Ans).",
    },
    {
      type: "note",
      label: "Statistics modes",
      text: "Independent memory behaviour can differ in SD/REG; prefer dedicated STAT recalls while analyzing datasets.",
    },
  ],
  related: ["constants", "modes/prgm/commands"],
});

w("sections/constants.json", {
  id: "constants",
  title: "Scientific Constants (CONST)",
  shortTitle: "Constants",
  parent: "index",
  order: 6,
  aliases: ["CONST", "Planck", "Avogadro", "speed of light", "physical constants", "SHIFT 7"],
  keywords: ["SHIFT 7", "40 constants", "proton mass", "elementary charge", "g"],
  formulas: ["E = hc / λ"],
  keySequence: ["SHIFT", "7"],
  summary: "Forty fundamental constants in ROM, recalled with SHIFT 7 (CONST), then page ◀/▶ and a key 1–4.",
  body: [
    {
      type: "p",
      text: "Press SHIFT 7 (CONST) to open page 1 of the constant menu (10 pages, four symbols each). Use ◀ / ▶ to reach the page you need, then press 1–4. Constants work in every mode except BASE.",
    },
    {
      type: "table",
      headers: ["Page-key", "Symbol / name", "Typical use"],
      rows: [
        ["1-1", "mp proton mass", "Nuclear / particle estimates"],
        ["2-2", "h Planck constant", "Quantum energy E = hf"],
        ["6-3", "e elementary charge", "Electrostatics, electrolysis"],
        ["6-4", "NA Avogadro constant", "Mole conversions"],
        ["7-4", "c speed of light", "EM / relativity scale"],
        ["9-3", "g = 9.80665 m/s²", "FMLA 14 / 15 / 21 (injected automatically)"],
      ],
    },
    { type: "h2", text: "Example: recall g" },
    {
      type: "ol",
      items: [
        "SHIFT 7 (CONST)",
        "◀ ◀ 3 EXE → g = 9.80665 (page 9, key 3)",
        "In COMP you can also combine h (2-2) and c (7-4) as E = hc/λ; keep λ in metres",
      ],
    },
    {
      type: "note",
      label: "Full table",
      text: "The official fx-50FH / fx-50F family manuals list all 40 entries as page-key pairs (1-1 through 10-4). Treat ROM values as authoritative over printed approximations when checking calculator output.",
    },
  ],
  related: ["fmla", "memory"],
});

w("sections/keys.json", {
  id: "keys",
  title: "Primary Keyboard Shortcuts",
  shortTitle: "Keys",
  parent: "index",
  order: 7,
  aliases: ["Pol", "Rec", "hyp", "sexagesimal", "DMS", "hyperbolic"],
  keywords: ["coordinate", "sinh", "degrees minutes seconds", "ENG"],
  formulas: ["Pol(x,y)", "Rec(r,θ)"],
  keySequence: [],
  summary: "Coordinate transforms, hyperbolic functions, and sexagesimal conversions used across COMP/CMPLX.",
  body: [
    {
      type: "h2",
      text: "Pol / Rec",
    },
    {
      type: "p",
      text: "Pol converts rectangular (x, y) to polar (r, θ). Rec converts polar to rectangular. Pol is SHIFT +; Rec is SHIFT −. Angle unit SET UP affects θ. After Pol, r is on the display (and in X); θ is in Y. After Rec, x is on the display (and in X); y is in Y. Press RCL Y for the second value.",
    },
    { type: "h2", text: "Example" },
    {
      type: "ol",
      items: [
        "In Deg: SHIFT + (Pol) 3 , 4 EXE → r = 5",
        "RCL Y → θ ≈ 53.13°",
      ],
    },
    {
      type: "h2",
      text: "Hyperbolic (hyp)",
    },
    {
      type: "p",
      text: "hyp then sin/cos/tan yields sinh, cosh, tanh. Inverse hyperbolics are SHIFT hyp, then sin/cos/tan (sinh⁻¹, cosh⁻¹, tanh⁻¹) — not hyp then SHIFT sin.",
    },
    {
      type: "h2",
      text: "Sexagesimal (° ′ ″)",
    },
    {
      type: "p",
      text: "Convert decimal degrees to DMS and back with the ° ′ ″ key. Essential for surveying and navigation-style exam questions.",
    },
  ],
  related: ["setup", "modes/cmplx"],
});

w("sections/exam.json", {
  id: "exam",
  title: "Examination Compliance and Study Use",
  shortTitle: "Exam",
  parent: "index",
  order: 8,
  aliases: ["HKEAA", "SUPER-FX PLUS", "DSE", "exam approved"],
  keywords: ["no CAS", "no graphing", "programmable", "Simpson", "Newton-Raphson"],
  formulas: [],
  keySequence: [],
  summary: "Why the fx-50FH II is exam-legal in designated HKEAA contexts, and how programming still supports advanced coursework.",
  body: [
    {
      type: "p",
      text: "Exam boards often ban graphing displays, CAS, and one-press numerical calculus. By omitting those, CASIO kept HKEAA SUPER-FX PLUS approval while retaining programmable RAM for student-written numerical methods (Simpson’s rule, Newton–Raphson, etc.).",
    },
    {
      type: "p",
      text: "The 23 FMLA routines and 40 CONST values live in ROM, so custom programs can use the full 680 bytes. Always verify the current year’s permitted calculator list before an exam sitting.",
    },
    {
      type: "note",
      label: "Pedagogy",
      text: "Prefer understanding the formula before relying on FMLA or a stored program—markers may still require written method. Use the calculator to check arithmetic and explore parameters.",
    },
  ],
  related: ["hardware", "modes/prgm", "fmla"],
});

console.log("Wrote fx-50FH II content under", BASE);
