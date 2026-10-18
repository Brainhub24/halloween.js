// Header behaviour shared by every page: theme toggle and the mobile menu.
// Loaded synchronously in <head> so the saved theme is applied before first paint.
(() => {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'theme';

  function readTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  root.setAttribute('data-theme', readTheme());

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Storage can be blocked; the choice then lasts for this page view only.
        }
      });
    }

    const menuButton = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('site-nav');
    if (menuButton && nav) {
      menuButton.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });
      nav.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) {
          nav.classList.remove('is-open');
          menuButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
})();
