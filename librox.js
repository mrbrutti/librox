/* Shared navigation, App Store routing and reading themes. Catalog behavior
   is loaded only on books.html; the cinematic players have their own bundle. */
(function () {
  "use strict";

  document.addEventListener('keydown', function (event) {
    if (!event.metaKey && !event.ctrlKey && !event.altKey) document.documentElement.dataset.input = 'keyboard';
  }, {passive:true});
  document.addEventListener('pointerdown', function () {
    delete document.documentElement.dataset.input;
  }, {passive:true});

  /* One App Store product ID serves the public listing. Tailor the wording,
     but keep the country-neutral HTTPS link so Apple resolves the storefront. */
  var storeURL = "https://apps.apple.com/app/id6796746657";
  var platform = navigator.platform || "";
  var userAgent = navigator.userAgent || "";
  var isIPad = /iPad/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isIPhone = /iPhone|iPod/.test(userAgent);
  var isMac = !isIPad && /Mac/.test(platform);
  document.querySelectorAll("[data-store-link]").forEach(function (link) {
    link.href = storeURL;
  });
  var storeLabel = document.querySelector("[data-store-label]");
  if (storeLabel) {
    storeLabel.textContent = isIPhone
      ? "Get Librox for iPhone"
      : isIPad
        ? "Get Librox for iPad"
        : isMac
          ? "View Librox on the App Store"
          : "Get Librox on the App Store";
  }
  var storeAvailability = document.querySelector("[data-store-availability]");
  if (isMac && storeAvailability) {
    storeAvailability.textContent = "See supported devices and system requirements on the App Store.";
    storeAvailability.hidden = false;
  }

  /* Compact navigation is enhanced only after its controls are connected. */
  var menu = document.querySelector('[data-menu-toggle]');
  var header = document.querySelector('.site-header');
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.querySelector('.icon').className = 'icon i-' + (open ? 'x' : 'list');
  }
  if (menu && header) {
    menu.hidden = false;
    document.documentElement.classList.add('js');
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    header.querySelectorAll('.site-links a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    });
    document.addEventListener('click', function (event) { if (!header.contains(event.target)) setMenu(false); });
    matchMedia('(min-width:761px)').addEventListener('change', function () { setMenu(false); });
  }

  /* Follow system appearance until a visitor chooses a theme for this page. */
  var THEMES = ['eink', 'paper', 'dark'];
  var systemDark = matchMedia('(prefers-color-scheme: dark)');
  function syncThemeControls(name) {
    document.querySelectorAll('.theme-chip').forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.dataset.theme === name)); });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.body).getPropertyValue('--bg').trim();
  }
  document.querySelectorAll('.theme-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (THEMES.indexOf(chip.dataset.theme) === -1) return;
      document.documentElement.setAttribute('data-theme', chip.dataset.theme);
      syncThemeControls(chip.dataset.theme);
    });
  });
  function followSystem() {
    var selected = document.documentElement.getAttribute('data-theme');
    syncThemeControls(selected || (systemDark.matches ? 'dark' : 'paper'));
  }
  followSystem();
  systemDark.addEventListener('change', followSystem);

})();
