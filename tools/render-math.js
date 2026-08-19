"use strict";

const fs = require("fs");
const path = require("path");
const katex = require("katex");

function matchingCloser(s, openIdx, openCh, closeCh) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === openCh) depth += 1;
    else if (s[i] === closeCh) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitOnceTop(s, sep) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{") depth += 1;
    else if (s[i] === "}") depth -= 1;
    else if (s[i] === sep && depth === 0) {
      return [s.slice(0, i), s.slice(i + 1)];
    }
  }
  return null;
}

function unicodeToTex(s) {
  return String(s)
    .replace(/x̄/g, "\\bar{x}")
    .replace(/v₀/g, "v_{0}")
    .replace(/q₁/g, "q_{1}")
    .replace(/q₂/g, "q_{2}")
    .replace(/ε₀/g, "\\varepsilon_{0}")
    .replace(/log₁₀/g, "\\log_{10}")
    .replace(/cos²/g, "\\cos^{2}")
    .replace(/sin²/g, "\\sin^{2}")
    .replace(/≈/g, "\\approx ")
    .replace(/±/g, "\\pm ")
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ")
    .replace(/·/g, "\\cdot ")
    .replace(/∞/g, "\\infty ")
    .replace(/∫/g, "\\int ")
    .replace(/π/g, "\\pi ")
    .replace(/θ/g, "\\theta ")
    .replace(/ω/g, "\\omega ")
    .replace(/ρ/g, "\\rho ")
    .replace(/ε/g, "\\varepsilon ")
    .replace(/μ/g, "\\mu ")
    .replace(/λ/g, "\\lambda ")
    .replace(/Σ/g, "\\Sigma ")
    .replace(/σ/g, "\\sigma ")
    .replace(/²/g, "^{2}")
    .replace(/³/g, "^{3}")
    .replace(/₁/g, "_{1}")
    .replace(/₂/g, "_{2}")
    .replace(/…/g, "\\ldots ")
    .replace(/−/g, "-")
    .replace(/–/g, "-");
}

function taggedToTex(s) {
  let out = "";
  let i = 0;
  const str = String(s || "");
  while (i < str.length) {
    if (str[i] === "{") {
      const m = str.slice(i).match(/^\{(sqrt|frac|sup|sub|abs):/);
      if (m) {
        const close = matchingCloser(str, i, "{", "}");
        if (close >= 0) {
          const body = str.slice(i + m[0].length, close);
          const name = m[1];
          let tex = "";
          if (name === "frac") {
            const parts = splitOnceTop(body, "|");
            if (parts) {
              tex = `\\frac{${taggedToTex(parts[0].trim())}}{${taggedToTex(parts[1].trim())}}`;
            } else {
              tex = taggedToTex(body.trim());
            }
          } else if (name === "sqrt") tex = `\\sqrt{${taggedToTex(body.trim())}}`;
          else if (name === "abs") tex = `\\left|${taggedToTex(body.trim())}\\right|`;
          else if (name === "sup") tex = `^{${taggedToTex(body.trim())}}`;
          else if (name === "sub") tex = `_{${taggedToTex(body.trim())}}`;
          out += tex;
          i = close + 1;
          continue;
        }
      }
    }
    if (str[i] === "√") {
      if (str[i + 1] === "(") {
        const close = matchingCloser(str, i + 1, "(", ")");
        if (close >= 0) {
          out += `\\sqrt{${taggedToTex(str.slice(i + 2, close))}}`;
          i = close + 1;
          continue;
        }
      }
      const rest = str.slice(i + 1);
      const num = rest.match(/^[0-9]+(?:\.[0-9]+)?/);
      if (num) {
        out += `\\sqrt{${num[0]}}`;
        i += 1 + num[0].length;
        continue;
      }
      const ch = rest.match(/^[A-Za-zπ]/);
      if (ch) {
        out += `\\sqrt{${unicodeToTex(ch[0])}}`;
        i += 1 + ch[0].length;
        continue;
      }
      out += "\\sqrt{}";
      i += 1;
      continue;
    }
    let j = i + 1;
    while (j < str.length && str[j] !== "{" && str[j] !== "√") j += 1;
    out += unicodeToTex(str.slice(i, j));
    i = j;
  }
  return out;
}

function looksLikeLatex(s) {
  return /\\[a-zA-Z]+/.test(s);
}

function toTex(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  if (looksLikeLatex(t)) return t;
  return taggedToTex(t);
}

function renderKatex(tex, display) {
  const cleaned = String(tex || "").trim();
  if (!cleaned) return "";
  try {
    return katex.renderToString(cleaned, {
      displayMode: !!display,
      throwOnError: false,
      strict: false,
      output: "html",
      trust: true,
    });
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    return `<span class="katex-error" title="${msg.replace(/"/g, "&quot;")}">${cleaned
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</span>`;
  }
}

function unwrapDollars(s) {
  let t = String(s || "").trim();
  if (t.startsWith("$$") && t.endsWith("$$") && t.length >= 4) return { tex: t.slice(2, -2), display: true };
  if (t.startsWith("$") && t.endsWith("$") && t.length >= 2) return { tex: t.slice(1, -1), display: false };
  return null;
}

function renderFormula(src) {
  return String(src || "")
    .split("\n")
    .map((line) => {
      const raw = line.trim();
      if (!raw) return "";
      const wrapped = unwrapDollars(raw);
      const tex = wrapped ? wrapped.tex : toTex(raw);
      return `<div class="formula-line">${renderKatex(tex, true)}</div>`;
    })
    .join("");
}

function renderMathSegment(s, escapeHtml) {
  const str = String(s || "");
  let out = "";
  let i = 0;
  while (i < str.length) {
    if (str.startsWith("$$", i)) {
      const end = str.indexOf("$$", i + 2);
      if (end >= 0) {
        out += renderKatex(str.slice(i + 2, end), true);
        i = end + 2;
        continue;
      }
    }
    if (str[i] === "$" && str[i + 1] !== "$") {
      const end = str.indexOf("$", i + 1);
      if (end > i) {
        out += renderKatex(str.slice(i + 1, end), false);
        i = end + 1;
        continue;
      }
    }
    if (str[i] === "{") {
      const m = str.slice(i).match(/^\{(sqrt|frac|sup|sub|abs):/);
      if (m) {
        const close = matchingCloser(str, i, "{", "}");
        if (close >= 0) {
          out += renderKatex(taggedToTex(str.slice(i, close + 1)), false);
          i = close + 1;
          continue;
        }
      }
    }
    if (str[i] === "√") {
      if (str[i + 1] === "(") {
        const close = matchingCloser(str, i + 1, "(", ")");
        if (close >= 0) {
          out += renderKatex(`\\sqrt{${taggedToTex(str.slice(i + 2, close))}}`, false);
          i = close + 1;
          continue;
        }
      }
      const rest = str.slice(i + 1);
      const num = rest.match(/^[0-9]+(?:\.[0-9]+)?/);
      if (num) {
        out += renderKatex(`\\sqrt{${num[0]}}`, false);
        i += 1 + num[0].length;
        continue;
      }
      const ch = rest.match(/^[A-Za-zπ]/);
      if (ch) {
        out += renderKatex(`\\sqrt{${unicodeToTex(ch[0])}}`, false);
        i += 1 + ch[0].length;
        continue;
      }
    }
    let j = i + 1;
    while (
      j < str.length &&
      str[j] !== "$" &&
      str[j] !== "√" &&
      !(str[j] === "{" && /^\{(sqrt|frac|sup|sub|abs):/.test(str.slice(j)))
    ) {
      j += 1;
    }
    out += escapeHtml(str.slice(i, j));
    i = j;
  }
  return out;
}

function copyKatex(destDir) {
  const src = path.join(__dirname, "..", "node_modules", "katex", "dist");
  if (!fs.existsSync(src)) {
    throw new Error("KaTeX is missing. Run npm install in the project root.");
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(path.join(src, "katex.min.css"), path.join(destDir, "katex.min.css"));
  const fontSrc = path.join(src, "fonts");
  const fontDest = path.join(destDir, "fonts");
  fs.mkdirSync(fontDest, { recursive: true });
  for (const name of fs.readdirSync(fontSrc)) {
    fs.copyFileSync(path.join(fontSrc, name), path.join(fontDest, name));
  }
}

module.exports = {
  renderFormula,
  renderMathSegment,
  renderKatex,
  toTex,
  copyKatex,
};
