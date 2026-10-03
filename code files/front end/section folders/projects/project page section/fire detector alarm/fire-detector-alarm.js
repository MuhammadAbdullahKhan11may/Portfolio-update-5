/* ============================================================
   FILE: fire-detector-alarm.js
   Path: code files/front end/section folders/projects/project page section/fire detector alarm/fire-detector-alarm.js
   ============================================================ */
(function () {
  "use strict";

  window.NAVBAR_CONFIG = {
    mode: "external",
    homeUrl: "../../../../homepage/index/index.html",
    experienceUrl: "../../../../homepage/experience/experience.html"
  };

  function loadComponent(url, targetSelector, callback) {
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + url);
        return res.text();
      })
      .then(function (html) {
        var absoluteUrl = new URL(url, document.baseURI).href;
        var tpl = document.createElement("template");
        tpl.innerHTML = html;
        var target = document.querySelector(targetSelector);

        tpl.content.querySelectorAll("link").forEach(function (link) {
          var resolved = new URL(link.getAttribute("href"), absoluteUrl).href;
          var exists = Array.prototype.some.call(
            document.head.querySelectorAll("link"),
            function (l) { return l.href === resolved; }
          );
          if (!exists) {
            var newLink = document.createElement("link");
            newLink.rel = link.rel;
            newLink.href = resolved;
            document.head.appendChild(newLink);
          }
          link.remove();
        });

        var scripts = Array.prototype.slice.call(tpl.content.querySelectorAll("script"));
        scripts.forEach(function (s) { s.remove(); });

        target.innerHTML = "";
        target.appendChild(tpl.content);

        (function runScripts(i) {
          if (i >= scripts.length) { if (callback) callback(); return; }
          var old = scripts[i];
          var s = document.createElement("script");
          if (old.src) {
            s.src = new URL(old.src, absoluteUrl).href;
            s.onload = function () { runScripts(i + 1); };
            s.onerror = function () { runScripts(i + 1); };
            document.body.appendChild(s);
          } else {
            s.textContent = old.textContent;
            document.body.appendChild(s);
            runScripts(i + 1);
          }
        })(0);
      })
      .catch(function (err) { console.error(err); });
  }

  function markProjectsActive() {
    document.querySelectorAll(".navbar__link[data-nav]").forEach(function (link) {
      link.removeAttribute("aria-current");
    });

    var link = document.querySelector('.navbar__link[data-nav="projects"]');
    if (!link) return;
    link.setAttribute("href", "../../project%20page/project-page.html");
    link.setAttribute("aria-current", "page");
  }

  /* ---------------- CIRCUIT LIGHTBOX ---------------- */

  function initLightbox() {
  var trigger = document.getElementById("circuitTrigger");
  var modal = document.getElementById("circuitLightbox");
  var closeBtn = document.getElementById("lightboxClose");
  var backdrop = document.getElementById("lightboxBackdrop");
  var img = document.getElementById("lightboxImg");

  if (!trigger || !modal || !closeBtn || !backdrop) return;

  var lastFocused = null;

  // Force correct initial state.
  modal.hidden = true;
  modal.classList.remove("lightbox--open");

  function openModal() {
    lastFocused = document.activeElement;

    modal.hidden = false;
    modal.classList.add("lightbox--open");

    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("lightbox--open");
    modal.hidden = true;

    document.body.style.overflow = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      trigger.focus();
    }
  }

  trigger.addEventListener("click", openModal);

  closeBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeModal();
  });

  backdrop.addEventListener("click", function (event) {
    event.preventDefault();
    closeModal();
  });

  if (img) {
    img.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

  document.addEventListener("DOMContentLoaded", function () {
    loadComponent("../../../../navbar/navbar.html", "#navbar-root", markProjectsActive);
    loadComponent("../../../../contacts/contact.html", "#contact-root");
    initLightbox();
  });
})();