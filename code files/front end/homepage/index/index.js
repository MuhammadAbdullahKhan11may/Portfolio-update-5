(function () {
  "use strict";

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

        // Move <link> tags into <head>, deduped by resolved href
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

        // Scripts injected via innerHTML never execute — pull them out,
        // inject markup first, then recreate the scripts in order.
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

  function initHeroTyping() {
    var el = document.getElementById("heroRole");
    if (!el) return;

    var roles = ["Full Stack Developer", "AI Builder", "Backend Engineer", "Product Creator", "Tech Educator"];
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      el.textContent = roles[0];
      return;
    }

    var roleIndex = 0, charIndex = 0, deleting = false;
    var TYPE_SPEED = 70, DELETE_SPEED = 40, HOLD = 1400, GAP = 400;

    function tick() {
      var current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, HOLD);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, GAP);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }
    setTimeout(tick, TYPE_SPEED);
  }

      function scrollToHashTarget() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }

  document.addEventListener("DOMContentLoaded", function () {
        var componentLoads = [
      ["code%20files/front%20end/navbar/navbar.html", "#navbar-root"],
      ["code%20files/front%20end/homepage/about%20me/about-me.html", "#about-root"],
      ["code%20files/front%20end/homepage/education/education.html", "#education-root"],
      ["code%20files/front%20end/homepage/experience/experience.html", "#experience-root"],
      ["code%20files/front%20end/homepage/projects/projects.html", "#projects-root"],
      ["code%20files/front%20end/homepage/certificates/certificates.html", "#certificates-root"],
      ["code%20files/front%20end/homepage/technical%20skills/technical-skills.html", "#technical-skills-root"],
      ["code%20files/front%20end/homepage/soft%20skills/soft-skills.html", "#soft-skills-root"],
      ["code%20files/front%20end/contacts/contact.html", "#contact-root"]
    ];

    var pending = componentLoads.length;
    function onComponentLoaded() {
      pending--;
      if (pending === 0) scrollToHashTarget();
    }

    componentLoads.forEach(function (c) {
      loadComponent(c[0], c[1], onComponentLoaded);
    });

    initHeroTyping();
  });
})();
