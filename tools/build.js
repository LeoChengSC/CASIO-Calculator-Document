"use strict";

const fs = require("fs");
const path = require("path");

const katex = require("./render-math");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");
const TEMPLATE = path.join(ROOT, "template");
const ASSETS = path.join(ROOT, "assets");
const DIST = path.join(ROOT, "dist");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relBetween(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

function assetRootFor(outFile) {
  const rel = path.relative(path.dirname(outFile), DIST).replace(/\\/g, "/");
  if (!rel || rel === "") return "./";
  return rel.endsWith("/") ? rel : rel + "/";
}

function walkSectionFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSectionFiles(full, acc);
    else if (ent.name.endsWith(".json")) acc.push(full);
  }
  return acc;
}

function pageOutPath(modelId, pageId) {
  if (!pageId || pageId === "index") {
    return path.join(DIST, "models", modelId, "index.html");
  }
  return path.join(DIST, "models", modelId, ...pageId.split("/")) + ".html";
}

function pageHref(ctx, pageId) {
  return relBetween(ctx.outFile, pageOutPath(ctx.modelId, pageId));
}

function pageLabel(page) {
  return page.shortTitle || page.title;
}

function withBreaks(s) {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

function formatMarkup(text, ctx) {
  const parts = String(text || "").split(/\[\[([^\]]+)\]\]/g);
  let html = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      html += katex.renderMathSegment(parts[i], withBreaks);
      continue;
    }
    const page = ctx && ctx.pagesById && ctx.pagesById[parts[i]];
    if (!page) {
      html += katex.renderMathSegment(parts[i], withBreaks);
      continue;
    }
    html += `<a href="${pageHref(ctx, page.id)}">${escapeHtml(pageLabel(page))}</a>`;
  }
  return html;
}

function injectInlineKeycaps(html) {
  // Inline keycap shorthand inside normal text, e.g. "1 【EXE】 2"
  return String(html || "").replace(/【([^】]+)】/g, (_, key) => {
    return `<kbd class="keycap">${escapeHtml(String(key || "").trim())}</kbd>`;
  });
}

function rich(text, ctx) {
  return injectInlineKeycaps(formatMarkup(text, ctx));
}

function plainText(text, ctx) {
  return String(text || "")
    .replace(/\[\[([^\]]+)\]\]/g, (_, id) => {
      const page = ctx && ctx.pagesById && ctx.pagesById[id];
      return page ? pageLabel(page) : id;
    })
    .replace(/\$[^$]+\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(text, ctx, used) {
  let base =
    plainText(text, ctx)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}

function addPageSection(ctx, level, text) {
  if (!ctx.sections) return "";
  const id = slugifyHeading(text, ctx, ctx.usedSlugs);
  ctx.sections.push({ level, id, label: plainText(text, ctx) });
  return id;
}

function renderPageSectionsNav(sections) {
  if (!sections || !sections.length) return "";
  const items = sections
    .map((s) => {
      const sub = s.level === 3 ? " page-sections__item--sub" : "";
      return `<li class="page-sections__item${sub}"><a class="page-sections__link" href="#${escapeHtml(
        s.id
      )}">${escapeHtml(s.label)}</a></li>`;
    })
    .join("");
  return `<nav class="page-sections" aria-label="On this page"><p class="page-sections__title">On this page</p><ul class="page-sections__list">${items}</ul></nav>`;
}

const KEY_TOKEN =
  /^(MODE|SHIFT|AC|DT|EXE|[▶◀▼▲]|,|\d+(?:\.\d+)?)$/;

function tokenizeKeyPart(part) {
  return String(part || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function isResultSegment(seg) {
  const s = String(seg || "").trim();
  if (!s) return false;
  if (KEY_TOKEN.test(s)) return false;
  if (/^(SHIFT|MODE|AC|DT|\d|[▶◀])/.test(s)) return false;
  if (/=/.test(s)) return true;
  if (/^r close to/i.test(s)) return true;
  return false;
}

function parseStepKeysString(raw) {
  let str = String(raw || "").trim();
  if (!str) return null;

  let note = "";
  const paren = str.match(/^(.+?)\s+\(([^)]+)\)\s*$/);
  if (paren && (paren[1].includes("→") || KEY_TOKEN.test(paren[1]) || /^[\d.]/.test(paren[1]))) {
    str = paren[1].trim();
    note = paren[2].trim();
  }

  if (!str.includes("→")) {
    const tokens = tokenizeKeyPart(str);
    if (!tokens.length || !tokens.every((t) => KEY_TOKEN.test(t))) return null;
    return { keys: tokens, text: note || undefined };
  }

  const parts = str.split(/\s*→\s*/);
  let result = null;
  const last = parts[parts.length - 1].trim();
  if (parts.length > 1 && isResultSegment(last)) {
    result = last;
    parts.pop();
  }

  const keys = [];
  let text = note;
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i].trim();
    const tokens = tokenizeKeyPart(seg);
    const keyTokens = [];
    const tail = [];
    for (const t of tokens) {
      if (!tail.length && KEY_TOKEN.test(t)) keyTokens.push(t);
      else tail.push(t);
    }
    if (!keyTokens.length) return null;
    keys.push(...keyTokens);
    if (tail.length) {
      const extra = tail.join(" ");
      text = text ? `${text} ${extra}` : extra;
    }
  }

  if (!keys.length) return null;
  return { keys, result: result || undefined, text: text || undefined };
}

function renderInlineKeyseq(keys) {
  if (!keys || !keys.length) return "";
  const parts = [];
  keys.forEach((k, i) => {
    if (i) {
      const prev = keys[i - 1];
      if (k === "," || prev === ",") {
        /* comma sits tight against x or y digits */
      } else {
        parts.push('<span class="keyseq__sep">→</span>');
      }
    }
    if (k === ",") {
      parts.push('<span class="keyseq__comma">,</span>');
    } else {
      parts.push(`<kbd class="keycap">${escapeHtml(k)}</kbd>`);
    }
  });
  return `<span class="keyseq keyseq--inline">${parts.join("")}</span>`;
}

function renderStepItem(item, ctx) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    let html = "";
    if (item.keys && item.keys.length) html += renderInlineKeyseq(item.keys);
    if (item.result) {
      if (html) html += '<span class="keyseq__sep">→</span>';
      html += rich(item.result, ctx);
    }
    if (item.text) {
      if (html) html += " ";
      html += rich(item.text, ctx);
    }
    return html || rich(item.text || "", ctx);
  }

  const parsed = parseStepKeysString(item);
  if (parsed) {
    let html = renderInlineKeyseq(parsed.keys);
    if (parsed.result) {
      html += '<span class="keyseq__sep">→</span>';
      html += rich(parsed.result, ctx);
    }
    if (parsed.text) {
      html += ` <span class="steps-item__note">(${escapeHtml(parsed.text)})</span>`;
    }
    return html;
  }

  return rich(item, ctx);
}

function renderKeys(keys) {
  if (!keys || !keys.length) return "";
  return `<div class="doc-block keyseq-block" role="group" aria-label="Key sequence"><div class="doc-block__tag">keys</div><div class="doc-block__body">${renderInlineKeyseq(keys)}</div></div>`;
}

function renderTable(block, ctx) {
  const headers = block.headers || [];
  const rows = block.rows || [];
  let html = "<table><thead><tr>";
  headers.forEach((h) => {
    html += `<th>${rich(h, ctx)}</th>`;
  });
  html += "</tr></thead><tbody>";
  rows.forEach((row) => {
    html += "<tr>";
    (Array.isArray(row) ? row : []).forEach((cell) => {
      html += `<td>${rich(cell, ctx)}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

function renderBody(body, ctx) {
  if (!body || !body.length) return "";
  return body
    .map((block) => {
      switch (block.type) {
        case "p":
          return `<p>${rich(block.text, ctx)}</p>`;
        case "lines": {
          const rows = (block.items || [])
            .map((it) => `<div class="work-lines__row">${rich(it, ctx)}</div>`)
            .join("");
          const lead = block.lead
            ? `<p class="work-lines__lead">${rich(block.lead, ctx)}</p>`
            : "";
          return `${lead}<div class="work-lines">${rows}</div>`;
        }
        case "h2": {
          const id = addPageSection(ctx, 2, block.text);
          const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
          return `<h2${idAttr}>${rich(block.text, ctx)}</h2>`;
        }
        case "h3": {
          const id = addPageSection(ctx, 3, block.text);
          const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
          return `<h3${idAttr}>${rich(block.text, ctx)}</h3>`;
        }
        case "formula":
          return `<div class="doc-block formula-block" role="math"><div class="doc-block__tag">formula</div><div class="doc-block__body"><div class="formula-block__text">${katex.renderFormula(
            block.plain || block.latex || block.latexish || ""
          )}</div></div></div>`;
        case "keys":
          return renderKeys(block.keys);
        case "note":
          return `<aside class="doc-block note-block"><div class="doc-block__tag">note</div><div class="doc-block__body"><p>${rich(
            block.text,
            ctx
          )}</p></div></aside>`;
        case "steps": {
          const items = (block.items || [])
            .map((it) => `<li>${renderStepItem(it, ctx)}</li>`)
            .join("");
          const title = block.title
            ? `<p class="steps-block__title">${rich(block.title, ctx)}</p>`
            : "";
          return `<div class="doc-block steps-block"><div class="doc-block__tag">steps</div><div class="doc-block__body">${title}<ol>${items}</ol></div></div>`;
        }
        case "table":
          return renderTable(block, ctx);
        case "program":
          return `<div class="doc-block program-block"><div class="doc-block__tag">basic</div><div class="doc-block__body"><pre class="program">${escapeHtml(
            block.code || ""
          )}</pre></div></div>`;
        case "ul": {
          const items = (block.items || [])
            .map((it) => `<li>${rich(it, ctx)}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
        case "ol": {
          const items = (block.items || [])
            .map((it) => `<li>${rich(it, ctx)}</li>`)
            .join("");
          let title = "";
          if (block.title) {
            const id = addPageSection(ctx, 3, block.title);
            const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
            title = `<h3${idAttr}>${rich(block.title, ctx)}</h3>`;
          }
          return `${title}<ol>${items}</ol>`;
        }
        case "figure": {
          const cap = block.caption
            ? `<figcaption>${rich(block.caption, ctx)}</figcaption>`
            : "";
          let inner = "";
          if (block.svg) {
            const svgPath = path.join(ASSETS, block.svg);
            if (!fs.existsSync(svgPath)) {
              return `<p class="page-summary">Missing figure: ${escapeHtml(block.svg)}</p>`;
            }
            inner = read(svgPath);
          } else if (block.src) {
            const href = assetRootFor(ctx.outFile) + String(block.src).replace(/^\//, "");
            inner = `<img src="${escapeHtml(href)}" alt="${escapeHtml(block.alt || "")}">`;
          }
          return `<figure class="doc-figure">${inner}${cap}</figure>`;
        }
        case "children": {
          const ids = block.ids || [];
          if (!ids.length) return "";
          const lis = ids
            .map((id) => {
              const page = ctx.pagesById[id];
              if (!page) return "";
              const href = relBetween(ctx.outFile, pageOutPath(ctx.modelId, page.id));
              const sum = page.summary
                ? `<span class="child-list__summary">${rich(page.summary, ctx)}</span>`
                : "";
              return `<li><a href="${href}"><span class="child-list__title">${escapeHtml(
                page.shortTitle || page.title
              )}</span>${sum}</a></li>`;
            })
            .filter(Boolean)
            .join("");
          const titleText = block.title || "In this section";
          const id = addPageSection(ctx, 2, titleText);
          const title = escapeHtml(titleText);
          return `<h2 id="${escapeHtml(id)}">${title}</h2><ul class="child-list">${lis}</ul>`;
        }
        default:
          return "";
      }
    })
    .join("\n");
}

function renderRelated(related, ctx) {
  if (!related || !related.length) return "";
  const lis = related
    .map((id) => {
      const page = ctx.pagesById[id];
      if (!page) return "";
      const href = relBetween(ctx.outFile, pageOutPath(ctx.modelId, page.id));
      return `<li><a href="${href}">${escapeHtml(pageLabel(page))}</a></li>`;
    })
    .filter(Boolean)
    .join("");
  if (!lis) return "";
  const id = addPageSection(ctx, 2, "Related");
  return `<h2 id="${escapeHtml(id)}">Related</h2><ul class="related-list">${lis}</ul>`;
}

function flattenNav(nodes, acc = []) {
  for (const n of nodes || []) {
    acc.push(n);
    if (n.children) flattenNav(n.children, acc);
  }
  return acc;
}

function navContainsId(node, targetId) {
  if (!node) return false;
  if (node.id === targetId) return true;
  return (node.children || []).some((c) => navContainsId(c, targetId));
}

function buildTocHtml(nodes, ctx, depth = 0) {
  if (!nodes || !nodes.length) return "";
  let html =
    depth === 0
      ? '<ul class="toc" data-toc-root="1">'
      : '<ul class="toc-children">';
  for (const n of nodes) {
    const page = ctx.pagesById[n.id];
    if (!page) continue;
    const href = relBetween(ctx.outFile, pageOutPath(ctx.modelId, page.id));
    const isCurrent = page.id === ctx.pageId;
    const cur = isCurrent ? " is-current" : "";
    const label = escapeHtml(n.label || page.shortTitle || page.title);
    const hasKids = !!(n.children && n.children.length);
    const onPath = hasKids && navContainsId(n, ctx.pageId);
    if (hasKids) {
      const expanded = onPath || isCurrent;
      const expClass = expanded ? " is-expanded" : " is-collapsed";
      const aria = expanded ? "true" : "false";
      html += `<li class="toc-item toc-item--branch${expClass}" data-toc-id="${escapeHtml(
        n.id
      )}">`;
      html += `<div class="toc-row">`;
      html += `<button type="button" class="toc-toggle" aria-expanded="${aria}" title="Expand or collapse"><span class="toc-toggle__icon" aria-hidden="true"></span></button>`;
      html += `<a class="${cur.trim()}" href="${href}">${label}</a>`;
      html += `</div>`;
      html += buildTocHtml(n.children, ctx, depth + 1);
      html += `</li>`;
    } else {
      html += `<li class="toc-item">`;
      html += `<div class="toc-row">`;
      html += `<span class="toc-toggle-spacer" aria-hidden="true"></span>`;
      html += `<a class="${cur.trim()}" href="${href}">${label}</a>`;
      html += `</div></li>`;
    }
  }
  html += "</ul>";
  return html;
}

function breadcrumbHtml(trail, ctx) {
  const items = trail
    .map((t, i) => {
      const last = i === trail.length - 1;
      if (last || !t.href) {
        return `<li><span aria-current="page">${escapeHtml(t.label)}</span></li>`;
      }
      return `<li><a href="${t.href}">${escapeHtml(t.label)}</a></li>`;
    })
    .join("\n");
  return `<nav aria-label="Breadcrumb"><ol class="breadcrumb">\n${items}\n</ol></nav>`;
}

function pagerHtml(prev, next, ctx) {
  let html = '<nav class="pager" aria-label="Page">';
  if (prev) {
    const href = relBetween(ctx.outFile, pageOutPath(ctx.modelId, prev.id));
    html += `<a class="pager__prev" href="${href}"><span class="pager__label">Previous</span>${escapeHtml(
      prev.shortTitle || prev.title
    )}</a>`;
  } else {
    html += "<div></div>";
  }
  if (next) {
    const href = relBetween(ctx.outFile, pageOutPath(ctx.modelId, next.id));
    html += `<a class="pager__next" href="${href}"><span class="pager__label">Next</span>${escapeHtml(
      next.shortTitle || next.title
    )}</a>`;
  }
  html += "</nav>";
  return html;
}

function findTrail(nav, targetId, stack = []) {
  for (const n of nav || []) {
    const next = stack.concat([n]);
    if (n.id === targetId) return next;
    const found = findTrail(n.children, targetId, next);
    if (found) return found;
  }
  return null;
}

function loadModelPages(modelId) {
  const modelDir = path.join(DATA, "models", modelId);
  const model = readJson(path.join(modelDir, "model.json"));
  const files = walkSectionFiles(path.join(modelDir, "sections"));
  const pages = [];
  const pagesById = Object.create(null);

  for (const file of files) {
    const page = readJson(file);
    if (!page.id) throw new Error(`Missing id in ${file}`);
    if (pagesById[page.id]) throw new Error(`Duplicate page id: ${page.id}`);
    pagesById[page.id] = page;
    pages.push(page);
  }

  if (!pagesById.index) {
    throw new Error(`Model ${modelId} missing sections page with id "index"`);
  }

  return { model, pages, pagesById };
}

function buildModel(modelMeta, searchEntries, warnings) {
  const { model, pages, pagesById } = loadModelPages(modelMeta.id);
  const layout = read(path.join(TEMPLATE, "layout.html"));
  const nav = model.nav || [];
  const flat = flattenNav(nav);
  const orderIds = flat.map((n) => n.id);

  // Validate the nav ids
  for (const n of flat) {
    if (!pagesById[n.id]) warnings.push(`Nav references missing page: ${modelMeta.id}/${n.id}`);
  }
  for (const p of pages) {
    if (p.parent && p.parent !== "root" && !pagesById[p.parent] && p.parent !== "index") {
      if (p.parent !== "index" && !pagesById[p.parent]) {
        warnings.push(`Page ${p.id} parent missing: ${p.parent}`);
      }
    }
    (p.related || []).forEach((rid) => {
      if (!pagesById[rid]) warnings.push(`Related missing ${p.id} -> ${rid}`);
    });
  }

  for (const page of pages) {
    const outFile = pageOutPath(modelMeta.id, page.id);
    const ctx = {
      modelId: modelMeta.id,
      pageId: page.id,
      pagesById,
      outFile,
      sections: [],
      usedSlugs: new Set(),
    };

    const hubHref = relBetween(outFile, path.join(DIST, "index.html"));
    const modelHome = relBetween(outFile, pageOutPath(modelMeta.id, "index"));
    const assetRoot = assetRootFor(outFile);

    const trailNodes = findTrail(nav, page.id) || [];
    const trail = [{ label: "Models", href: hubHref }];
    trail.push({
      label: model.shortName || model.name,
      href: page.id === "index" ? null : modelHome,
    });
    trailNodes.forEach((n, i) => {
      if (n.id === "index") return;
      const last = i === trailNodes.length - 1;
      const href = last
        ? null
        : relBetween(outFile, pageOutPath(modelMeta.id, n.id));
      trail.push({ label: n.label || pagesById[n.id].shortTitle, href });
    });

    const tocPartial = read(path.join(TEMPLATE, "partials", "toc.html"))
      .replace(/\{\{MODEL_HOME\}\}/g, modelHome)
      .replace(/\{\{MODEL_NAME\}\}/g, escapeHtml(model.shortName || model.name))
      .replace(/\{\{TOC_HTML\}\}/g, buildTocHtml(nav, ctx));

    const bodyHasKeys = (page.body || []).some((b) => b.type === "keys");
    const keyBlock =
      !bodyHasKeys && page.keySequence && page.keySequence.length
        ? renderKeys(page.keySequence)
        : "";

    const content =
      keyBlock +
      renderBody(page.body, ctx) +
      renderRelated(page.related, ctx);

    const idx = orderIds.indexOf(page.id);
    const prev = idx > 0 ? pagesById[orderIds[idx - 1]] : null;
    const next =
      idx >= 0 && idx < orderIds.length - 1 ? pagesById[orderIds[idx + 1]] : null;

    const summary = page.summary
      ? `<p class="page-summary">${rich(page.summary, ctx)}</p>`
      : "";

    const pageSections = renderPageSectionsNav(ctx.sections);

    const html = layout
      .replace(/\{\{PAGE_TITLE\}\}/g, escapeHtml(`${page.title} — ${model.shortName || model.name}`))
      .replace(/\{\{BODY_CLASS\}\}/g, "layout-docs")
      .replace(/\{\{ASSET_ROOT\}\}/g, assetRoot)
      .replace(/\{\{HUB_HREF\}\}/g, hubHref)
      .replace(/\{\{SIDEBAR\}\}/g, tocPartial)
      .replace(/\{\{BREADCRUMB\}\}/g, breadcrumbHtml(trail, ctx))
      .replace(/\{\{H1\}\}/g, escapeHtml(page.title))
      .replace(/\{\{SUMMARY\}\}/g, summary)
      .replace(/\{\{PAGE_SECTIONS\}\}/g, pageSections)
      .replace(/\{\{CONTENT\}\}/g, content)
      .replace(/\{\{PAGER\}\}/g, pagerHtml(prev, next, ctx));

    // Inject asset root for search
    const withRoot = html.replace(
      "</head>",
      `<script>window.CASIO_ASSET_ROOT=${JSON.stringify(assetRoot)};</script>\n</head>`
    );

    write(outFile, withRoot);

    for (const fromId of page.redirects || []) {
      const fromFile = pageOutPath(modelMeta.id, fromId);
      const href = relBetween(fromFile, outFile);
      write(
        fromFile,
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(href)}">
  <link rel="canonical" href="${escapeHtml(href)}">
  <title>Moved</title>
</head>
<body>
  <p>This page moved to <a href="${escapeHtml(href)}">${escapeHtml(page.shortTitle || page.title)}</a>.</p>
</body>
</html>
`
      );
    }

    searchEntries.push({
      id: page.id,
      modelId: modelMeta.id,
      modelName: model.shortName || model.name,
      title: page.title,
      shortTitle: page.shortTitle || "",
      aliases: page.aliases || [],
      keywords: page.keywords || [],
      formulas: page.formulas || [],
      keySequence: page.keySequence || [],
      summary: page.summary || "",
      pathLabel: `${model.shortName || model.name} / ${page.title}`,
      href: path
        .relative(DIST, outFile)
        .replace(/\\/g, "/"),
    });
  }

  return pages.length;
}

function buildHub(models) {
  const layout = read(path.join(TEMPLATE, "layout.html"));
  const outFile = path.join(DIST, "index.html");
  const assetRoot = "./";

  const cards = models
    .map((m) => {
      const live = m.status === "live";
      const href = live
        ? relBetween(outFile, pageOutPath(m.id, "index"))
        : "#";
      const btn = live
        ? `<a class="btn" href="${href}">Open documentation</a>`
        : `<span class="btn btn--disabled">Coming later</span>`;
      return `<article class="model-card">
  <h2>${escapeHtml(m.name)}</h2>
  <p>${escapeHtml(m.description || "")}</p>
  ${btn}
</article>`;
    })
    .join("\n");

  const content = `
<p>Select a calculator model. Documentation is generated from structured data so new models can be added without new HTML templates.</p>
<div class="model-grid">
${cards}
</div>
<h2 id="how-this-site-works">How this site works</h2>
<ul>
<li>Browse by model, then by mode, setup option, formula, or programming topic.</li>
<li>Use the search bar for names, key sequences (e.g. MODE 5 1), or formulas (e.g. y=A+Bx).</li>
<li>Switch Light, Dark, or Reading theme from the header. Preference is stored locally.</li>
<li>Everything works offline from the <code>dist/</code> folder.</li>
</ul>`;

  const hubSections = renderPageSectionsNav([
    { level: 2, id: "how-this-site-works", label: "How this site works" },
  ]);

  const html = layout
    .replace(/\{\{PAGE_TITLE\}\}/g, "CASIO Calculator Documentation")
    .replace(/\{\{BODY_CLASS\}\}/g, "layout-hub")
    .replace(/\{\{ASSET_ROOT\}\}/g, assetRoot)
    .replace(/\{\{HUB_HREF\}\}/g, "./index.html")
    .replace(/\{\{SIDEBAR\}\}/g, "")
    .replace(/\{\{BREADCRUMB\}\}/g, "")
    .replace(/\{\{H1\}\}/g, "CASIO Calculator Documentation")
    .replace(
      /\{\{SUMMARY\}\}/g,
      '<p class="page-summary">Offline reference manuals for Casio scientific calculators.</p>'
    )
    .replace(/\{\{PAGE_SECTIONS\}\}/g, hubSections)
    .replace(/\{\{CONTENT\}\}/g, content)
    .replace(/\{\{PAGER\}\}/g, "");

  const withRoot = html.replace(
    "</head>",
    `<script>window.CASIO_ASSET_ROOT=${JSON.stringify(assetRoot)};</script>\n</head>`
  );
  write(outFile, withRoot);
}

function main() {
  console.log("Building Casio docs…");
  const models = readJson(path.join(DATA, "models.json"));
  rimraf(DIST);
  fs.mkdirSync(DIST, { recursive: true });
  copyDir(ASSETS, path.join(DIST, "assets"));
  katex.copyKatex(path.join(DIST, "assets", "vendor", "katex"));

  const searchEntries = [];
  const warnings = [];
  let pageCount = 0;

  for (const m of models) {
    if (m.status !== "live") {
      console.log(`  skip (reserved): ${m.id}`);
      continue;
    }
    const n = buildModel(m, searchEntries, warnings);
    pageCount += n;
    console.log(`  built ${m.id}: ${n} pages`);
  }

  buildHub(models);
  write(
    path.join(DIST, "search-index.js"),
    "var CASIO_SEARCH = " +
      JSON.stringify(searchEntries, null, 0) +
      ";\nif (typeof window !== 'undefined') { window.CASIO_SEARCH = CASIO_SEARCH; }\n"
  );

  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log("  - " + w));
  }

  console.log(`\nDone. ${pageCount} pages, ${searchEntries.length} search entries → dist/`);
}

main();
