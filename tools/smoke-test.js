#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "..", "dist");

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, a);
    else if (e.name.endsWith(".html")) a.push(f);
  }
  return a;
}

function existsFrom(pageFile, relHref) {
  if (!relHref || relHref === "#") return true;
  const cleaned = relHref.split("#")[0];
  if (!cleaned) return true;
  const target = path.normalize(path.join(path.dirname(pageFile), cleaned));
  return fs.existsSync(target);
}

const pages = walk(DIST);
let broken = 0;
const hrefRe = /href="([^"]+)"/g;

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  let m;
  while ((m = hrefRe.exec(html))) {
    const href = m[1];
    if (href.startsWith("http") || href.startsWith("mailto:")) continue;
    if (!existsFrom(page, href)) {
      console.log("BROKEN", path.relative(DIST, page), "->", href);
      broken++;
    }
  }
  // asset checks
  const css = html.match(/href="([^"]*assets\/css\/site\.css)"/);
  if (css && !existsFrom(page, css[1])) {
    console.log("BROKEN CSS", path.relative(DIST, page));
    broken++;
  }
}

const searchSrc = fs.readFileSync(path.join(DIST, "search-index.js"), "utf8");
const CASIO_SEARCH = Function(`${searchSrc}; return CASIO_SEARCH;`)();

function normFormula(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[×·⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/→/g, "->")
    .replace(/²/g, "^2")
    .replace(/\s+/g, "");
}

function score(entry, qRaw) {
  const q = qRaw.toLowerCase().trim();
  let s = 0;
  if ((entry.title || "").toLowerCase().includes(q)) s += 80;
  (entry.keywords || []).forEach((k) => {
    const nk = k.toLowerCase();
    if (nk === q) s += 40;
    else if (nk.includes(q)) s += 20;
    else if (nk.length >= 3 && q.includes(nk)) s += 20;
  });
  (entry.aliases || []).forEach((a) => {
    const na = a.toLowerCase();
    if (na === q || na.includes(q)) s += 50;
    else if (na.length >= 3 && q.includes(na)) s += 50;
  });
  const qk = q.replace(/[→\->/_|,]+/g, " ").replace(/\s+/g, " ").trim();
  const kj = (entry.keySequence || []).join(" ").toLowerCase();
  if (qk && kj && (kj.includes(qk) || qk.includes(kj))) s += 55;
  const qf = normFormula(qRaw);
  (entry.formulas || []).forEach((f) => {
    const nf = normFormula(f);
    if (nf && qf && (nf === qf || nf.includes(qf) || qf.includes(nf))) s += 65;
  });
  return s;
}

const tests = ["quadratic", "MODE 5 1", "y=A+Bx", "Goto", "FMLA 01"];
console.log("pages:", pages.length);
console.log("search entries:", CASIO_SEARCH.length);
for (const t of tests) {
  const hits = CASIO_SEARCH.map((e) => ({ t: e.title, s: score(e, t) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  console.log(t, "=>", hits.map((h) => `${h.t}(${h.s})`).join(" | ") || "(none)");
}
console.log("broken links:", broken);
if (broken) process.exit(1);
