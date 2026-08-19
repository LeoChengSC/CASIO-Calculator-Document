(function () {
  var input = document.getElementById("site-search");
  var panel = document.getElementById("search-results");
  if (!input || !panel || !window.CASIO_SEARCH) return;

  var index = window.CASIO_SEARCH;
  var assetRoot = input.getAttribute("data-asset-root") || "";
  var active = -1;
  var lastHits = [];

  function normText(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normFormula(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2212\u2013\u2014]/g, "-")
      .replace(/[×·⋅]/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "sqrt")
      .replace(/π/g, "pi")
      .replace(/→/g, "->")
      .replace(/⇒/g, "=>")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .replace(/₀/g, "0")
      .replace(/₁/g, "1")
      .replace(/₂/g, "2")
      .replace(/₃/g, "3")
      .replace(/₄/g, "4")
      .replace(/\s+/g, "")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
  }

  function normKeys(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[→\->–—_/|,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreEntry(entry, qRaw) {
    var q = normText(qRaw);
    if (!q) return 0;
    var qForm = normFormula(qRaw);
    var qKeys = normKeys(qRaw);
    var score = 0;

    var title = normText(entry.title);
    var shortTitle = normText(entry.shortTitle);
    if (title === q) score += 120;
    else if (title.indexOf(q) !== -1) score += 80;
    if (shortTitle === q) score += 100;
    else if (shortTitle && shortTitle.indexOf(q) !== -1) score += 60;

    (entry.aliases || []).forEach(function (a) {
      var na = normText(a);
      if (!na) return;
      if (na === q) score += 90;
      else if (na.indexOf(q) !== -1) score += 50;
      else if (na.length >= 3 && q.indexOf(na) !== -1) score += 50;
    });

    (entry.keywords || []).forEach(function (k) {
      var nk = normText(k);
      if (!nk) return;
      if (nk === q) score += 40;
      else if (nk.indexOf(q) !== -1) score += 20;
      else if (nk.length >= 3 && q.indexOf(nk) !== -1) score += 20;
    });

    if (entry.summary && normText(entry.summary).indexOf(q) !== -1) score += 10;

    var keyJoined = normKeys((entry.keySequence || []).join(" "));
    if (qKeys && keyJoined) {
      if (keyJoined === qKeys) score += 95;
      else if (keyJoined.indexOf(qKeys) !== -1 || qKeys.indexOf(keyJoined) !== -1) score += 55;
    }

    (entry.formulas || []).forEach(function (f) {
      var nf = normFormula(f);
      if (!qForm || !nf) return;
      if (nf === qForm) score += 100;
      else if (nf.indexOf(qForm) !== -1 || qForm.indexOf(nf) !== -1) score += 65;
    });

    var tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length > 1) {
      var hay = [title, shortTitle]
        .concat(entry.aliases || [])
        .concat(entry.keywords || [])
        .join(" ");
      hay = normText(hay);
      var all = tokens.every(function (t) {
        return hay.indexOf(t) !== -1;
      });
      if (all) score += 25;
    }

    return score;
  }

  function resolveHref(entry) {
    if (entry.href) {
      if (entry.href.indexOf("http") === 0 || entry.href.indexOf("/") === 0) return entry.href;
      return assetRoot + entry.href;
    }
    return "#";
  }

  function render(hits) {
    lastHits = hits;
    active = -1;
    if (!hits.length) {
      panel.innerHTML = '<div class="search-results__empty">No matches.</div>';
      panel.hidden = false;
      panel.classList.add("is-open");
      return;
    }

    var groups = {};
    hits.forEach(function (h) {
      var g = h.modelName || h.modelId || "Docs";
      if (!groups[g]) groups[g] = [];
      groups[g].push(h);
    });

    var html = "";
    Object.keys(groups).forEach(function (name) {
      html += '<div class="search-results__group">';
      html += '<p class="search-results__group-title">' + escapeHtml(name) + "</p>";
      groups[name].forEach(function (h, i) {
        var globalIdx = hits.indexOf(h);
        html +=
          '<a href="' +
          escapeAttr(resolveHref(h)) +
          '" data-idx="' +
          globalIdx +
          '">' +
          '<div class="search-results__title">' +
          escapeHtml(h.title) +
          "</div>" +
          '<div class="search-results__meta">' +
          escapeHtml(h.pathLabel || h.id || "") +
          "</div></a>";
      });
      html += "</div>";
    });
    panel.innerHTML = html;
    panel.hidden = false;
    panel.classList.add("is-open");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function runSearch() {
    var q = input.value;
    if (!normText(q)) {
      close();
      return;
    }
    var scored = index
      .map(function (entry) {
        return { entry: entry, score: scoreEntry(entry, q) };
      })
      .filter(function (x) {
        return x.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 25)
      .map(function (x) {
        return x.entry;
      });
    render(scored);
  }

  function close() {
    panel.innerHTML = "";
    panel.hidden = true;
    panel.classList.remove("is-open");
    active = -1;
    lastHits = [];
  }

  function setActive(n) {
    var links = panel.querySelectorAll("a");
    if (!links.length) return;
    if (active >= 0 && links[active]) links[active].classList.remove("is-active");
    active = (n + links.length) % links.length;
    links[active].classList.add("is-active");
    links[active].scrollIntoView({ block: "nearest" });
  }

  var timer = null;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 80);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      close();
      input.blur();
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      setActive(active + 1);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActive(active - 1);
      e.preventDefault();
    } else if (e.key === "Enter" && active >= 0) {
      var links = panel.querySelectorAll("a");
      if (links[active]) {
        window.location.href = links[active].href;
        e.preventDefault();
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== input) close();
  });

  // Resolve relative asset root from a known script if needed
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src || "";
    if (src.indexOf("search-index.js") !== -1) {
      assetRoot = src.replace(/search-index\.js.*$/, "");
      // Convert absolute file URL directory to relative path from page is hard;
      // pages set CASIO_ASSET_ROOT via inline when needed.
      break;
    }
  }
  if (window.CASIO_ASSET_ROOT) assetRoot = window.CASIO_ASSET_ROOT;
})();
