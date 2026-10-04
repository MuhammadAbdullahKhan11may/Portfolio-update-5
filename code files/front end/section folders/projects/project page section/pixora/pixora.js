/* ============================================================
   FILE: pixora.js
   Path: code files/front end/section folders/projects/project page section/pixora/pixora.js
   ============================================================ */
(function () {
  "use strict";

  window.NAVBAR_CONFIG = {
    mode: "external",
    homeUrl: "../../../../../../index.html",
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

  function markProjectsActive() {
    document.querySelectorAll(".navbar__link[data-nav]").forEach(function (link) {
      link.removeAttribute("aria-current");
    });

    var link = document.querySelector('.navbar__link[data-nav="projects"]');
    if (!link) return;
    link.setAttribute("href", "../../project%20page/project-page.html");
    link.setAttribute("aria-current", "page");
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadComponent("../../../../navbar/navbar.html", "#navbar-root", markProjectsActive);
    loadComponent("../../../../contacts/contact.html", "#contact-root");
  });
})();