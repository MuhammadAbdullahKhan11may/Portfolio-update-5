/* ============================================================
   THEME.JS — single source of truth for theme state.
   Owns: preference storage, effective-theme resolution, OS
   color-scheme detection/reaction, data-theme / data-theme-
   preference attributes, dropdown aria-checked sync, and the
   signature circular reveal transition between effective themes.
   Loaded ONCE from index.html. Section/Navbar JS never
   duplicates this logic — they read window.themeController.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
    var THEME_KEY = "theme"; // 'system' | 'light' | 'evergreen'
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var TRANSITION_DURATION = 1400;
  var TRANSITION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  var transitionInProgress = false;

  function getStoredPreference() {
    var stored = localStorage.getItem(THEME_KEY);
        return stored === "light" || stored === "system" || stored === "evergreen" ? stored : "system";
  }

  function effectiveTheme(preference) {
        if (preference === "light") return "light";
    if (preference === "evergreen") return "evergreen";
    return mediaQuery.matches ? "dark" : "light";
  }

  function syncThemeOptionsUI(preference) {
    document.querySelectorAll("[data-theme-value]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-theme-value") === preference;
      btn.setAttribute("aria-checked", String(isActive));
    });
  }

  function applyTheme(preference) {
    var effective = effectiveTheme(preference);
    root.setAttribute("data-theme", effective);
    root.setAttribute("data-theme-preference", preference);
    syncThemeOptionsUI(preference);
  }

  function getRevealOrigin() {
    var btn = document.getElementById("themeToggle");
    if (btn) {
      var rect = btn.getBoundingClientRect();
      if (rect.width || rect.height) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }
    // Fallback origin (top-right-ish) if the Navbar hasn't loaded yet.
    return { x: window.innerWidth - 40, y: 40 };
  }

  function runCircularReveal(commit) {
    var origin = getRevealOrigin();
    var endRadius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y)
    );

    var transition;
    try {
      transition = document.startViewTransition(commit);
    } catch (err) {
      transitionInProgress = false;
      commit();
      return;
    }

    transition.ready
      .then(function () {
        try {
          root.animate(
            {
              clipPath: [
                "circle(0px at " + origin.x + "px " + origin.y + "px)",
                "circle(" + endRadius + "px at " + origin.x + "px " + origin.y + "px)"
              ]
            },
            {
              duration: TRANSITION_DURATION,
              easing: TRANSITION_EASING,
              pseudoElement: "::view-transition-new(root)"
            }
          );
        } catch (err) {
          /* Pseudo-element animation target unsupported — the state
             change already committed; the theme still switches, just
             without the circular geometry on this browser. */
        }
      })
      .catch(function () {});

    transition.finished
      .then(function () { transitionInProgress = false; })
      .catch(function () { transitionInProgress = false; });
  }

  function applyThemeChange(preference, persist) {
    var oldEffective = effectiveTheme(getStoredPreference());
    var newEffective = effectiveTheme(preference);

    function commit() {
      if (persist) localStorage.setItem(THEME_KEY, preference);
      applyTheme(preference);
    }

    var effectiveChanged = oldEffective !== newEffective;
    var canAnimate =
      effectiveChanged &&
      !transitionInProgress &&
      !reducedMotionQuery.matches &&
      typeof document.startViewTransition === "function";

    if (!canAnimate) {
      commit();
      return;
    }

    transitionInProgress = true;
    runCircularReveal(commit);
  }

  function setThemePreference(preference) {
        var normalized = (preference === "light" || preference === "evergreen") ? preference : "system";
    applyThemeChange(normalized, true);
  }

  mediaQuery.addEventListener("change", function () {
    if (getStoredPreference() === "system") {
      applyThemeChange("system", false);
    }
  });

  // Apply as early as possible (this script runs before the CSS
  // links below it in <head>) to minimize a flash of the wrong theme.
  applyTheme(getStoredPreference());

  // Delegated listener: works even for the Navbar, which is loaded
  // into the DOM later by index.js's component loader. No need to
  // wait for the Navbar or re-run init once it exists.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-theme-value]") : null;
    if (!btn) return;
    setThemePreference(btn.getAttribute("data-theme-value"));
  });

  window.themeController = {
    getPreference: getStoredPreference,
    getEffectiveTheme: function () { return effectiveTheme(getStoredPreference()); },
    setPreference: setThemePreference
  };
})();