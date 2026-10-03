/* ============================================================
   NAVBAR BEHAVIOR
   Mobile menu, theme dropdown, System/Dark/Light theme logic.
   Kept isolated so theme code can later be extracted into
   its own theme.js file.
   ============================================================ */

(function () {
  "use strict";

    var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var themeToggle = document.getElementById("themeToggle");
  var themeMenu = document.getElementById("themeMenu");
  var themeControl = document.getElementById("themeControl");
  var themeOptions = themeMenu ? themeMenu.querySelectorAll("[data-theme-value]") : [];
    var navbarEl = document.getElementById("siteNavbar");

  /* ---------------- LINK ROUTING (multi-context Navbar) ----------------
     This Navbar markup is shared between the homepage and standalone
     pages (e.g. the Experience page) via fetch-based injection, so
     static #section hrefs can't serve both contexts. The host page
     sets window.NAVBAR_CONFIG before navbar.js runs. On the homepage
     (no config set) the original hrefs are left untouched. */

  (function configureNavLinks() {
    var config = window.NAVBAR_CONFIG;
    if (!config || config.mode !== "external") return;

    var homeSections = ["about", "education","experience", "projects", "certificates", "skills"];

    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var section = link.getAttribute("data-nav");

      if (section === "home") {
        link.setAttribute("href", config.homeUrl);
      } else if (homeSections.indexOf(section) !== -1) {
        link.setAttribute("href", config.homeUrl + "#" + section);
            } else if (section === "experience") {
        if (config.experienceUrl) {
          link.setAttribute("href", config.experienceUrl);
        } else {
          link.setAttribute("href", "#");
          link.setAttribute("aria-current", "page");
        }
      } else if (section === "contact") {
        link.setAttribute("href", "#contact");
      }
    });
  })();

  /* ---------------- THEME SYNC ----------------
     All theme STATE (preference, effective theme, storage,
     OS media query, background) lives in theme.js. Navbar.js
     only re-syncs the dropdown's aria-checked state now that
     its markup exists in the DOM, via theme.js's exposed API. */

  if (window.themeController) {
    window.themeController.setPreference(window.themeController.getPreference());
  }

  /* ---------------- THEME DROPDOWN ---------------- */

  function isThemeMenuOpen() {
    return themeMenu.classList.contains("is-open");
  }

  function setThemeMenuOpen(open) {
    themeMenu.classList.toggle("is-open", open);
    themeToggle.setAttribute("aria-expanded", String(open));
  }

  themeToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setThemeMenuOpen(!isThemeMenuOpen());
  });

    themeOptions.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Preference is applied by theme.js's own delegated click
      // listener on [data-theme-value]; this only closes the UI.
      setThemeMenuOpen(false);
      themeToggle.focus();
    });
  });

  /* ---------------- MOBILE MENU ---------------- */

  function isNavMenuOpen() {
    return navMenu.classList.contains("is-open");
  }

  function setNavMenuOpen(open) {
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setNavMenuOpen(!isNavMenuOpen());
  });

  navMenu.addEventListener("click", function (e) {
    if (e.target.classList.contains("navbar__link")) {
      setNavMenuOpen(false);
      navToggle.focus();
    }
  });

    /* ---------------- ACTIVE SECTION INDICATOR ---------------- */

  (function activeSectionIndicator() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".navbar__link[data-nav]"));
    var ticking = false;

    function update() {
      ticking = false;
      var offset = (navbarEl ? navbarEl.offsetHeight : 76) + 90;
      var current = null;
      links.forEach(function (link) {
        var id = link.getAttribute("data-nav");
        var target = document.getElementById(id);
        if (!target) return;
        var rect = target.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) current = id;
      });
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-nav") === current);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  })();

  /* ---------------- SHARED: ESCAPE + OUTSIDE CLICK ---------------- */

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;

    if (isThemeMenuOpen()) {
      setThemeMenuOpen(false);
      themeToggle.focus();
      return;
    }
    if (isNavMenuOpen()) {
      setNavMenuOpen(false);
      navToggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (isThemeMenuOpen() && !themeControl.contains(e.target)) {
      setThemeMenuOpen(false);
    }
    if (isNavMenuOpen() && navbarEl && !navbarEl.contains(e.target)) {
      setNavMenuOpen(false);
    }
  });
})();