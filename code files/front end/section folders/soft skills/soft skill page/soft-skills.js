/* ============================================================
   FILE: soft-skills.js
   Path: code files/front end/section folders/soft skills/soft skill page/soft-skills.js
   ============================================================ */
(function () {
  "use strict";

  window.NAVBAR_CONFIG = {
    mode: "external",
    homeUrl: "../../../homepage/index/index.html",
    experienceUrl: "../../../homepage/experience/experience.html"
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
        if (!target) return;

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

  function markSkillsActive() {
    var experienceLink = document.querySelector('.navbar__link[data-nav="experience"]');
    if (experienceLink) {
      experienceLink.removeAttribute("aria-current");
    }
    var link = document.querySelector('.navbar__link[data-nav="skills"]');
    if (!link) return;
    link.setAttribute("href", "#");
    link.setAttribute("aria-current", "page");
  }

  function scrollToContactIfHashed() {
    if (window.location.hash === "#contact") {
      var target = document.getElementById("contact");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
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
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadComponent("../../../navbar/navbar.html", "#navbar-root", markSkillsActive);
    loadComponent("../../../contacts/contact.html", "#contact-root", scrollToContactIfHashed);
    initReveal();
  });
})();