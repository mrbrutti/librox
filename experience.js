/* Real rendered motion, explicit playback, and a quiet reduced-motion state. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var portrait = matchMedia('(max-aspect-ratio: 6/5), (max-width: 700px)');
  var section = document.querySelector('[data-experience]');
  if (!section) return;
  var video = section.querySelector('[data-film-video]');
  var poster = section.querySelector('.studio-poster');
  var toggle = section.querySelector('[data-film-toggle]');
  var sound = section.querySelector('[data-film-sound]');
  var chapterButtons = Array.from(section.querySelectorAll('[data-film-chapter]'));
  var visible = false;
  var manual = null;
  var pendingTime = 0;
  var filmFrame = 0;
  function playbackIcon(paused) {
    return '<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">' + (paused ? '<path d="M4 2.5 13 8l-9 5.5z"/>' : '<path d="M4 3h3v10H4zm5 0h3v10H9z"/>') + '</svg>';
  }

  function syncButton() {
    toggle.querySelector('[data-play-label]').textContent = video.paused ? 'Play film' : 'Pause film';
    toggle.querySelector('[data-play-icon]').innerHTML = playbackIcon(video.paused);
    toggle.setAttribute('aria-label', video.paused ? 'Play Librox film' : 'Pause Librox film');
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    sound.setAttribute('aria-label', video.muted ? 'Turn on film sound' : 'Turn off film sound');
  }
  function syncPlayback() {
    var play = visible && !document.hidden && (manual === true || (manual === null && !reduce.matches));
    if (play) video.play().catch(syncButton);
    else video.pause();
    syncButton();
  }
  function syncSource() {
    var src = portrait.matches ? video.dataset.portrait : video.dataset.wide;
    if (video.getAttribute('src') === src) return;
    pendingTime = video.currentTime || 0;
    video.pause();
    video.classList.remove('is-ready');
    poster.hidden = false;
    video.poster = portrait.matches ? poster.querySelector('source').srcset : poster.querySelector('img').src;
    video.src = src;
    video.load();
    syncPlayback();
  }
  function renderFilmProgress() {
    var t = video.currentTime;
    var mode = t >= 12 && t < 18 ? 'listening' : t >= 4 && t < 12 ? 'reading' : 'library';
    section.dataset.chapter = mode;
    section.classList.toggle('is-detail', (t > .7 && t < 3.45) || (t > 5.5 && t < 12.8) || (t > 15.35 && t < 17.75));
    section.classList.toggle('is-macro', t > 7.6 && t < 12.5);
    section.querySelector('.studio-detail-title').textContent = mode === 'reading' ? 'The feeling of a book.' : 'A reading space, unfolded.';
    chapterButtons.forEach(function (button) {
      var active = button.dataset.filmChapter === mode;
      var start = mode === 'reading' ? 4 : mode === 'listening' ? 12 : t >= 18 ? 18 : 0;
      var end = mode === 'reading' ? 12 : mode === 'listening' ? 18 : t >= 18 ? 22 : 4;
      if (button.getAttribute('aria-pressed') !== String(active)) button.setAttribute('aria-pressed', String(active));
      button.style.setProperty('--progress', active ? Math.min(1, Math.max(0, (t - start) / (end - start))) : 0);
    });
    if (!video.paused) filmFrame = requestAnimationFrame(renderFilmProgress);
  }
  video.addEventListener('loadedmetadata', function () {
    if (pendingTime && Number.isFinite(video.duration)) video.currentTime = Math.min(pendingTime, video.duration - .05);
    pendingTime = 0;
  });
  video.addEventListener('playing', function () {
    poster.hidden = true;
    video.classList.add('is-ready');
    cancelAnimationFrame(filmFrame);
    renderFilmProgress();
    syncButton();
  });
  video.addEventListener('pause', function () { cancelAnimationFrame(filmFrame); syncButton(); });
  video.addEventListener('seeked', function () {
    cancelAnimationFrame(filmFrame);
    renderFilmProgress();
    if (video.readyState >= 2) { poster.hidden = true; video.classList.add('is-ready'); }
  });
  video.addEventListener('error', function () { poster.hidden = false; video.classList.remove('is-ready'); syncButton(); });
  toggle.addEventListener('click', function () { manual = video.paused; syncPlayback(); });
  toggle.addEventListener('keydown', function (event) {
    if ((event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') || video.readyState < 1) return;
    event.preventDefault();
    video.currentTime = Math.max(0, Math.min(video.duration - .05, video.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
  });
  sound.addEventListener('click', function () {
    video.muted = !video.muted;
    if (!video.muted) { manual = true; syncPlayback(); }
    syncButton();
  });
  chapterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var time = Number(button.dataset.seek);
      if (video.readyState >= 1) video.currentTime = time;
      else pendingTime = time;
      manual = !reduce.matches;
      syncPlayback();
    });
  });
  var observe = function (element, callback, threshold) {
    threshold = threshold || .1;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { callback(entries[0].isIntersecting && entries[0].intersectionRatio >= threshold); }, { threshold:[0, threshold] }).observe(element);
    } else callback(true);
  };
  observe(section, function (value) { visible = value; syncPlayback(); });
  portrait.addEventListener('change', syncSource);
  reduce.addEventListener('change', function () { manual = null; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  syncSource();

  var native = document.querySelector('[data-native-story]');
  if (!native) return;
  var buttons = Array.from(native.querySelectorAll('[data-native-mode]'));
  var panels = Array.from(native.querySelectorAll('[data-native-panel]'));
  var nativeToggle = native.querySelector('[data-native-toggle]');
  var modes = ['reading', 'listening', 'mac'];
  var durations = [13500, 8000, 10000];
  var index = 0;
  var elapsed = 0;
  var last = 0;
  var nativeVisible = false;
  var nativeManual = null;
  var nativeFrame = 0;

  function shouldRun() { return nativeVisible && !document.hidden && (nativeManual === true || (nativeManual === null && !reduce.matches)); }
  function syncNativeVideos() {
    panels.forEach(function (panel, i) {
      var media = panel.querySelector('video');
      if (!media) return;
      if (i === index && shouldRun()) media.play().catch(function () {
        if (i === index && shouldRun()) { nativeManual = false; syncNative(); }
      });
      else media.pause();
    });
  }
  function selectNative(next) {
    index = next;
    elapsed = 0;
    native.dataset.active = modes[index];
    buttons.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === index)); button.style.setProperty('--progress', 0); });
    panels.forEach(function (panel, i) {
      panel.classList.toggle('is-active', i === index);
      panel.setAttribute('aria-hidden', String(i !== index));
      panel.inert = i !== index;
      var media = panel.querySelector('video');
      if (media && i === index) media.currentTime = 0;
    });
    syncNativeVideos();
  }
  function tick(now) {
    if (!shouldRun()) return;
    var activeVideo = panels[index].querySelector('video');
    if (activeVideo && !activeVideo.error) elapsed = activeVideo.currentTime * 1000;
    else if (last) elapsed += Math.min(now - last, 100);
    last = now;
    if (elapsed >= durations[index]) selectNative((index + 1) % modes.length);
    buttons[index].style.setProperty('--progress', elapsed / durations[index]);
    nativeFrame = requestAnimationFrame(tick);
  }
  function syncNative() {
    cancelAnimationFrame(nativeFrame);
    last = 0;
    var running = shouldRun();
    nativeToggle.innerHTML = (running ? 'Pause previews ' : 'Play previews ') + playbackIcon(!running);
    nativeToggle.setAttribute('aria-label', running ? 'Pause app demonstrations' : 'Play app demonstrations');
    syncNativeVideos();
    if (running) nativeFrame = requestAnimationFrame(tick);
  }
  panels.forEach(function (panel, i) {
    var media = panel.querySelector('video');
    if (!media) return;
    media.addEventListener('loadedmetadata', function () {
      if (Number.isFinite(media.duration) && media.duration > 0) durations[i] = media.duration * 1000;
    });
    media.addEventListener('ended', function () {
      if (index === i && shouldRun()) { selectNative((index + 1) % modes.length); syncNative(); }
    });
  });
  buttons.forEach(function (button, i) { button.addEventListener('click', function () { selectNative(i); syncNative(); }); });
  nativeToggle.addEventListener('click', function () { nativeManual = !shouldRun(); syncNative(); });
  observe(native.querySelector('.native-stage'), function (value) { nativeVisible = value; syncNative(); }, .35);
  reduce.addEventListener('change', function () { nativeManual = null; syncNative(); });
  document.addEventListener('visibilitychange', syncNative);
})();
