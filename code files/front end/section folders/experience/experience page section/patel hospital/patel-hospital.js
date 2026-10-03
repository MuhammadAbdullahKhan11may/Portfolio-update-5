(function () {
  "use strict";

  window.NAVBAR_CONFIG = {
    mode: "external",
    homeUrl: "../../../../homepage/index/index.html",
    experienceUrl: "../../experience%20page/experience-page.html"
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

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".detail-tab"));
    if (!tabs.length) return;
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute("aria-controls"));
    });

    function activate(index, moveFocus) {
      tabs.forEach(function (t, i) {
        var selected = i === index;
        t.classList.toggle("is-active", selected);
        t.setAttribute("aria-selected", String(selected));
        t.setAttribute("tabindex", selected ? "0" : "-1");
        if (panels[i]) panels[i].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(i, false); });
    });

    document.querySelector(".detail-tabs").addEventListener("keydown", function (e) {
      var currentIndex = tabs.findIndex(function (t) { return t.getAttribute("tabindex") === "0"; });
      var next;
      if (e.key === "ArrowRight") next = (currentIndex + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (currentIndex - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      activate(next, true);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadComponent("../../../../navbar/navbar.html", "#navbar-root");
    loadComponent("../../../../contacts/contact.html", "#contact-root");
    initTabs();
  });
})();