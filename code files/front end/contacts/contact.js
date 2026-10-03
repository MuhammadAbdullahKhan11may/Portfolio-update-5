/* ============================================================
   CONTACT — EMAIL POPOVER BEHAVIOR ONLY
   ============================================================ */

(function () {
  "use strict";

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