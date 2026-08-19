(function () {
  var STORAGE_KEY = "casio-toc-collapsed";
  var SCROLL_KEY = "casio-toc-scroll";
  var PANEL_KEY = "casio-mobile-panel";
  var MQ = window.matchMedia ? window.matchMedia("(max-width: 800px)") : null;

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function setExpanded(item, expanded) {
    item.classList.toggle("is-expanded", expanded);
    item.classList.toggle("is-collapsed", !expanded);
    var btn = item.querySelector(":scope > .toc-row > .toc-toggle");
    if (btn) btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  var sidebar = document.querySelector(".site-sidebar");
  var state = loadState();
  var branches = document.querySelectorAll(".toc-item--branch");

  branches.forEach(function (item) {
    var id = item.getAttribute("data-toc-id");
    var onPath =
      !!item.querySelector(":scope > .toc-row > a.is-current") ||
      !!item.querySelector(".toc-item a.is-current");

    if (onPath) {
      setExpanded(item, true);
    } else if (id && Object.prototype.hasOwnProperty.call(state, id)) {
      setExpanded(item, !state[id]);
    }

    var btn = item.querySelector(":scope > .toc-row > .toc-toggle");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = !item.classList.contains("is-expanded");
      setExpanded(item, open);
      if (id) {
        state[id] = !open;
        if (open) delete state[id];
        saveState(state);
      }
    });
  });

  function saveScroll() {
    if (!sidebar) return;
    try {
      sessionStorage.setItem(SCROLL_KEY, String(sidebar.scrollTop));
    } catch (e) {}
  }

  function restoreScroll() {
    if (!sidebar) return false;
    var raw = null;
    try {
      raw = sessionStorage.getItem(SCROLL_KEY);
    } catch (e) {}
    if (raw === null || raw === "") return false;
    var top = parseInt(raw, 10);
    if (isNaN(top)) return false;
    sidebar.scrollTop = top;
    return true;
  }

  function ensureCurrentVisible() {
    var current = document.querySelector(".toc a.is-current");
    if (!current || !sidebar) return;
    var sideRect = sidebar.getBoundingClientRect();
    var curRect = current.getBoundingClientRect();
    var fullyVisible =
      curRect.top >= sideRect.top && curRect.bottom <= sideRect.bottom;
    if (fullyVisible) return;
    try {
      current.scrollIntoView({ block: "nearest" });
    } catch (e) {
      current.scrollIntoView(false);
    }
  }

  function isMobile() {
    return MQ ? MQ.matches : window.innerWidth <= 800;
  }

  function getPanel() {
    try {
      return sessionStorage.getItem(PANEL_KEY) || "content";
    } catch (e) {
      return "content";
    }
  }

  function setPanel(panel) {
    try {
      sessionStorage.setItem(PANEL_KEY, panel);
    } catch (e) {}
    applyPanel(panel);
  }

  function applyPanel(panel) {
    var body = document.body;
    if (!body.classList.contains("layout-docs")) return;
    body.classList.remove("mobile-panel-toc", "mobile-panel-content");
    closeSectionsPanel();
    if (!isMobile()) return;
    body.classList.add(panel === "toc" ? "mobile-panel-toc" : "mobile-panel-content");
    if (panel === "toc") {
      restoreScroll();
      ensureCurrentVisible();
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  function setSectionsPanelOpen(open) {
    var body = document.body;
    if (!body.classList.contains("layout-docs") || !isMobile()) {
      body.classList.remove("mobile-sections-open");
      return;
    }
    body.classList.toggle("mobile-sections-open", open);
    var host = document.getElementById("page-sections-host");
    var btn = document.getElementById("mobile-nav-sections");
    if (host) host.setAttribute("aria-hidden", open ? "false" : "true");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeSectionsPanel() {
    setSectionsPanelOpen(false);
  }

  function initSectionsPanel() {
    var host = document.getElementById("page-sections-host");
    var btn = document.getElementById("mobile-nav-sections");
    var backdrop = document.getElementById("page-sections-backdrop");
    if (!host || !host.querySelector(".page-sections")) {
      if (btn) btn.hidden = true;
      if (host) host.hidden = true;
      return;
    }
    if (btn) btn.hidden = false;

    if (btn) {
      btn.addEventListener("click", function () {
        setSectionsPanelOpen(!document.body.classList.contains("mobile-sections-open"));
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeSectionsPanel);
    }

    host.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest(".page-sections__link");
      if (!link) return;
      closeSectionsPanel();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSectionsPanel();
    });
  }

  if (sidebar) {
    restoreScroll();
    ensureCurrentVisible();

    var scrollTimer = null;
    sidebar.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(saveScroll, 50);
    });

    sidebar.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("a[href]");
      if (!link) return;
      saveScroll();
      try {
        sessionStorage.setItem(PANEL_KEY, "content");
      } catch (err) {}
    });
  }

  var backBtn = document.getElementById("mobile-nav-back");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      closeSectionsPanel();
      setPanel("toc");
    });
  }

  initSectionsPanel();

  // Search results should open content panel on mobile.
  document.addEventListener(
    "click",
    function (e) {
      var link = e.target.closest && e.target.closest("#search-results a[href]");
      if (!link) return;
      try {
        sessionStorage.setItem(PANEL_KEY, "content");
      } catch (err) {}
    },
    true
  );

  applyPanel(getPanel());

  if (MQ && typeof MQ.addEventListener === "function") {
    MQ.addEventListener("change", function () {
      closeSectionsPanel();
      applyPanel(getPanel());
    });
  } else if (MQ && typeof MQ.addListener === "function") {
    MQ.addListener(function () {
      closeSectionsPanel();
      applyPanel(getPanel());
    });
  }

  window.addEventListener("pagehide", saveScroll);
  window.addEventListener("beforeunload", saveScroll);
})();
