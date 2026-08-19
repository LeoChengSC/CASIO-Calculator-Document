(function () {
  var KEY = "casio-theme";
  var root = document.documentElement;
  var select = document.getElementById("theme-select");

  function apply(theme) {
    if (theme !== "light" && theme !== "dark" && theme !== "reading") {
      theme = "light";
    }
    root.setAttribute("data-theme", theme);
    if (select) select.value = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
  }

  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {}
  apply(saved || root.getAttribute("data-theme") || "light");

  if (select) {
    select.addEventListener("change", function () {
      apply(select.value);
    });
  }
})();
