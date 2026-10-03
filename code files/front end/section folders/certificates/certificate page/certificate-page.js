/* ============================================================
   CERTIFICATE PAGE — page-specific logic only.
   Loads shared navbar + contact components, marks Certificates
   as the active nav item, wires Contact to local scroll,
   handles category filtering, the certificate modal, and
   restrained entrance animations. Theme state stays owned by
   theme.js.
   ============================================================ */
(function () {
  "use strict";

  var NAV_HTML = "../../../navbar/navbar.html";
  var NAV_JS = "../../../navbar/navbar.js";
  var CONTACT_HTML = "../../../contacts/contact.html";
  var CONTACT_JS = "../../../contacts/contact.js";

  window.NAVBAR_CONFIG = {
    mode: "external",
    homeUrl: "../../../homepage/index/index.html",
    experienceUrl: "../../experience/experience%20page/experience-page.html"
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function fetchFragment(url, selector) {
    return fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var el = doc.querySelector(selector);
        return el ? el.outerHTML : "";
      })
      .catch(function () { return ""; });
  }

  function markCertificatesActive() {
    var link = document.querySelector('[data-nav="certificates"]');
    if (!link) return;
    link.setAttribute("href", "#");
    link.setAttribute("aria-current", "page");
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initNavbar() {
    var root = document.getElementById("navbar-root");
    if (!root) return Promise.resolve();
    return fetchFragment(NAV_HTML, "nav.navbar")
      .then(function (markup) {
        if (!markup) return;
        root.innerHTML = markup;
        return loadScript(NAV_JS).then(markCertificatesActive);
      })
      .catch(function () {});
  }

  function initContact() {
    var root = document.getElementById("contact-root");
    if (!root) return Promise.resolve();
    return fetchFragment(CONTACT_HTML, "section.contact")
      .then(function (markup) {
        if (!markup) return;
        root.innerHTML = markup;
        return loadScript(CONTACT_JS).then(function () {
          if (window.location.hash === "#contact") {
            var el = document.getElementById("contact");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      })
      .catch(function () {});
  }

  /* ---------------- CATEGORY FILTERS ---------------- */
  
  function initFilters() {
    var buttons = document.querySelectorAll(".cert-filters__btn");
    var cards = document.querySelectorAll("#allCertificatesGrid .certificate-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");

        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });

        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-category") || "").split(" ");
          var match = filter === "all" || cats.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* ---------------- MOBILE FILTER MENU ---------------- */
  function initFilterMenu() {
    var toggle = document.getElementById("certFiltersToggle");
    var list = document.getElementById("certFiltersList");
    var current = document.getElementById("certFiltersCurrent");
    if (!toggle || !list) return;

    function setOpen(open) {
      list.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!list.classList.contains("is-open"));
    });

    list.querySelectorAll(".cert-filters__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (current) current.textContent = btn.textContent;
        setOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (!list.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------------- MODAL ---------------- */
  function initModal() {
    var modal = document.getElementById("certModal");
    var modalImg = document.getElementById("certModalImg");
    var closeBtn = document.getElementById("certModalClose");
    var cards = document.querySelectorAll(".js-cert-card");
    if (!modal || !modalImg || !closeBtn || !cards.length) return;

    var lastFocused = null;

    function openModal(card) {
      var src = card.getAttribute("data-img");
      if (!src) return;
      lastFocused = card;
      modalImg.src = src;
      modalImg.alt = card.getAttribute("data-alt") || "";
      modal.classList.add("is-open");
      document.body.classList.add("cert-modal-open");
      closeBtn.focus();
    }

    function closeModal() {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      document.body.classList.remove("cert-modal-open");
      modalImg.src = "";
      if (lastFocused) lastFocused.focus();
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () { openModal(card); });
    });

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------------- ENTRANCE ANIMATION ---------------- */
  function initReveal() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = document.querySelectorAll(".js-reveal, .certificate-card");

    if (!items.length) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavbar();
    initContact();
    initFilters();
    initFilterMenu();
    initModal();
    initReveal();
  });
})();