/* ============================================================
   CONTACT — EMAIL POPOVER BEHAVIOR ONLY
   ============================================================ */

(function () {
  "use strict";

    // Resolve the CV link from this script's own location so it works
  // on every page, whatever folder depth the page is in.
  var thisScript = document.currentScript;
  var cvLink = document.getElementById("cvLink");
  if (cvLink && thisScript && thisScript.src) {
    cvLink.href = new URL("../section%20folders/CV/cv.html", thisScript.src).href;
  }

  var emailBtn = document.getElementById("emailBtn");
  var emailPopover = document.getElementById("emailPopover");

  if (!emailBtn || !emailPopover) return;

  function isOpen() {
    return emailPopover.classList.contains("is-open");
  }

  function setOpen(open) {
    emailPopover.classList.toggle("is-open", open);
    emailBtn.setAttribute("aria-expanded", String(open));
  }

  emailBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!isOpen());
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      emailBtn.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (isOpen() && !emailPopover.contains(e.target) && e.target !== emailBtn) {
      setOpen(false);
    }
  });
})();