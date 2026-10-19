/* The film is one continuous product story. Static official device artwork stays inside the rendered footage. */
(function () {
  'use strict';
  var section = document.querySelector('[data-experience]');
  if (!section) return;
  var video = section.querySelector('[data-film-video]');
  var poster = section.querySelector('.film-landing-poster');
  var toggle = section.querySelector('[data-film-toggle]');
  var sound = section.querySelector('[data-film-sound]');
  var portrait = matchMedia('(max-width: 700px)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var visible = false;
  var manual = null;

  function syncSource() {
    var next = portrait.matches ? video.dataset.portrait : video.dataset.wide;
    if (!next || video.getAttribute('src') === next) return;
    video.pause();
    video.classList.remove('is-ready');
    poster.style.visibility = 'visible';
    poster.setAttribute('aria-hidden', 'false');
    video.poster = portrait.matches ? 'assets/librox-film-poster-portrait.webp' : 'assets/librox-film-poster.webp';
    video.src = next;
    video.load();
    syncPlayback();
  }
  function syncButton() {
    toggle.textContent = video.paused ? 'Play film' : 'Pause';
    toggle.setAttribute('aria-label', video.paused ? 'Play Librox film' : 'Pause Librox film');
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    sound.setAttribute('aria-label', video.muted ? 'Turn on film sound' : 'Turn off film sound');
  }
  function syncPlayback() {
    var shouldPlay = visible && document.visibilityState === 'visible' && (manual === true || (manual === null && !reduce.matches));
    if (shouldPlay) video.play().catch(syncButton);
    else video.pause();
    syncButton();
  }
  toggle.addEventListener('click', function () {
    manual = video.paused;
    syncPlayback();
  });
  sound.addEventListener('click', function () {
    video.muted = !video.muted;
    if (!video.muted && video.paused) { manual = true; syncPlayback(); }
    syncButton();
  });
  video.addEventListener('playing', function () {
    video.classList.add('is-ready');
    poster.setAttribute('aria-hidden', 'true');
    poster.style.visibility = 'hidden';
    syncButton();
  });
  video.addEventListener('pause', syncButton);
  video.addEventListener('error', function () { video.classList.remove('is-ready'); poster.style.visibility = 'visible'; poster.setAttribute('aria-hidden', 'false'); syncButton(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncPlayback(); }, {threshold: .08}).observe(section);
  } else { visible = true; }
  portrait.addEventListener('change', syncSource);
  reduce.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  syncSource();
})();
