/**
 * Custom Header Drawer — Mobile menu
 * Opens/closes the slide-in drawer with overlay.
 */
(function () {
  'use strict';

  const OPEN_CLASS = 'is-open';
  const BODY_OPEN_CLASS = 'custom-drawer-open';

  function init() {
    const trigger = document.querySelector('.custom-drawer-trigger');
    const drawer = document.querySelector('.custom-drawer');
    const overlay = document.querySelector('.custom-drawer-overlay');
    const closeBtn = document.querySelector('.custom-drawer__close-btn');

    if (!trigger || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add(OPEN_CLASS);
      overlay.classList.add(OPEN_CLASS);
      document.body.classList.add(BODY_OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'false');
      // Move focus to close button
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      drawer.classList.remove(OPEN_CLASS);
      overlay.classList.remove(OPEN_CLASS);
      document.body.classList.remove(BODY_OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'true');
      trigger.focus();
    }

    trigger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains(OPEN_CLASS)) {
        closeDrawer();
      }
    });

    // Trap focus inside drawer while open
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
