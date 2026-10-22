/* Real rendered motion, explicit playback, and a quiet reduced-motion state. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var section = document.querySelector('[data-experience]');
  if (!section) return;
  var video = section.querySelector('[data-film-video]');
  var screen = section.querySelector('.studio-screen');
  var poster = section.querySelector('.studio-poster');
  var toggle = section.querySelector('[data-film-toggle]');
  var sound = section.querySelector('[data-film-sound]');
  var chapterButtons = Array.from(section.querySelectorAll('[data-film-chapter]'));
  var visible = false;
  var manual = null;
  var pendingTime = 0;
  var filmFrame = 0;
  function playbackIcon(paused) {
    return '<span class="icon i-' + (paused ? 'play' : 'pause') + '" aria-hidden="true"></span>';
  }

  function syncButton() {
    toggle.querySelector('[data-play-label]').textContent = video.error ? 'Retry film' : video.paused ? 'Play film' : 'Pause film';
    toggle.querySelector('[data-play-icon]').innerHTML = playbackIcon(video.paused);
    toggle.setAttribute('aria-label', video.error ? 'Retry Librox film' : video.paused ? 'Play Librox film' : 'Pause Librox film');
    sound.innerHTML = '<span class="icon i-' + (video.muted ? 'speaker-slash' : 'speaker-high') + '" aria-hidden="true"></span>';
    sound.setAttribute('aria-pressed', String(!video.muted));
    sound.setAttribute('aria-label', video.muted ? 'Turn on film sound' : 'Turn off film sound');
  }
  function syncPlayback() {
    var play = visible && !document.hidden && (manual === true || (manual === null && !reduce.matches));
    if (play) video.play().catch(syncButton);
    else video.pause();
    syncButton();
  }
  function syncSource() {
    var usePortrait = screen.clientWidth / screen.clientHeight < 1.45;
    var src = usePortrait ? video.dataset.portrait : video.dataset.wide;
    if (video.getAttribute('src') === src) return;
    pendingTime = video.currentTime || 0;
    video.pause();
    video.classList.remove('is-ready');
    poster.hidden = false;
    video.preload = pendingTime ? 'auto' : 'metadata';
    var posterURL = usePortrait ? video.dataset.portraitPoster : video.dataset.widePoster;
    video.poster = posterURL;
    poster.querySelector('img').src = posterURL;
    video.src = src;
    video.load();
    syncPlayback();
  }
  function renderFilmProgress() {
    var t = video.currentTime;
    var mode = t >= 12 && t < 18 ? 'listening' : t >= 4 && t < 12 ? 'reading' : 'library';
    section.dataset.chapter = mode;
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
  toggle.addEventListener('click', function () { manual = video.paused; if (video.error) video.load(); syncPlayback(); });
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
      video.preload = 'auto';
      if (video.readyState >= 1) video.currentTime = time;
      else { pendingTime = time; video.load(); }
      syncPlayback();
    });
  });
  var observe = function (element, callback, threshold) {
    threshold = threshold || .1;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { callback(entries[0].isIntersecting && entries[0].intersectionRatio >= threshold); }, { threshold:[0, threshold] }).observe(element);
    } else callback(true);
  };
  observe(screen, function (value) { visible = value; syncPlayback(); });
  if ('ResizeObserver' in window) new ResizeObserver(syncSource).observe(screen);
  else window.addEventListener('resize', syncSource);
  reduce.addEventListener('change', function () { manual = null; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  syncSource();

  var native = document.querySelector('[data-native-story]');
  if (!native) return;
  var buttons = Array.from(native.querySelectorAll('[data-native-mode]'));
  var family = native.querySelector('[data-family-video]');
  var familyPoster = native.querySelector('.family-poster');
  var familyCaption = native.querySelector('[data-family-caption]');
  var nativeToggle = native.querySelector('[data-native-toggle]');
  var familyPortrait = matchMedia('(max-width:700px)');
  var nativeVisible = false;
  var nativeManual = null;
  var nativeFrame = 0;
  var familyPendingTime = 0;
  var familyLoaded = false;
  // Independent timeline: the approved Duo hero keeps its own choreography.
  var beats = [
    {start:0, end:5.7, mode:'reading', caption:'Reading on iPad'},
    {start:5.7, end:11, mode:'listening', caption:'Listening on iPad'},
    {start:11, end:17.7, mode:'mac', caption:'Reading on Mac'},
    {start:17.7, end:23, mode:'listening', caption:'Listening on Mac'},
    {start:23, end:24, mode:'reading', caption:'Reading on iPad'}
  ];
  function shouldRun() { return nativeVisible && !document.hidden && (nativeManual === true || (nativeManual === null && !reduce.matches)); }
  function paintFamilyProgress(t) {
    var beat = beats.find(function (item) { return t >= item.start && t < item.end; }) || beats[0];
    native.dataset.active = beat.mode;
    if (familyCaption.textContent !== beat.caption) familyCaption.textContent = beat.caption;
    buttons.forEach(function (button) {
      var active = button.dataset.nativeMode === beat.mode;
      if (button.getAttribute('aria-pressed') !== String(active)) button.setAttribute('aria-pressed', String(active));
      button.style.setProperty('--progress', active ? Math.min(1, Math.max(0, (t - beat.start) / (beat.end - beat.start))) : 0);
    });
  }
  function familyProgress() {
    paintFamilyProgress(family.currentTime);
    if (!family.paused) nativeFrame = requestAnimationFrame(familyProgress);
  }
  function familyButton() {
    var paused = family.paused;
    nativeToggle.innerHTML = playbackIcon(paused) + '<span>' + (family.error ? 'Retry film' : paused ? 'Play film' : 'Pause film') + '</span>';
    nativeToggle.setAttribute('aria-label', family.error ? 'Retry app demonstrations' : paused ? 'Play app demonstrations' : 'Pause app demonstrations');
  }
  function syncNative() {
    if (shouldRun()) family.play().catch(familyButton);
    else family.pause();
    familyButton();
  }
  function familySource() {
    if (!familyLoaded) return;
    var src = familyPortrait.matches ? family.dataset.portrait : family.dataset.wide;
    if (family.getAttribute('src') === src) return;
    familyPendingTime = family.currentTime || familyPendingTime;
    family.pause(); family.classList.remove('is-ready'); familyPoster.hidden = false;
    family.preload = familyPendingTime ? 'auto' : 'metadata';
    family.poster = familyPortrait.matches ? familyPoster.querySelector('source').srcset : familyPoster.querySelector('img').src;
    family.src = src; family.load(); syncNative();
  }
  family.addEventListener('loadedmetadata', function () {
    if (familyPendingTime) family.currentTime = Math.min(familyPendingTime, family.duration - .05);
    familyPendingTime = 0;
  });
  family.addEventListener('playing', function () {
    familyPoster.hidden = true; family.classList.add('is-ready');
    cancelAnimationFrame(nativeFrame); familyProgress(); familyButton();
  });
  family.addEventListener('pause', function () { cancelAnimationFrame(nativeFrame); familyButton(); });
  family.addEventListener('seeked', function () {
    cancelAnimationFrame(nativeFrame); familyProgress();
    if (family.readyState >= 2) { familyPoster.hidden = true; family.classList.add('is-ready'); }
  });
  family.addEventListener('error', function () {
    family.pause(); cancelAnimationFrame(nativeFrame);
    familyPendingTime = 0;
    familyPoster.hidden = false; family.classList.remove('is-ready');
    paintFamilyProgress(0); familyButton();
  });
  buttons.forEach(function (button) { button.addEventListener('click', function () {
    familyLoaded = true; familySource();
    var time = Number(button.dataset.familySeek);
    family.preload = 'auto';
    if (family.readyState >= 1) family.currentTime = time;
    else { familyPendingTime = time; family.load(); }
    syncNative();
  }); });
  nativeToggle.addEventListener('click', function () {
    nativeManual = family.paused;
    familyLoaded = true;
    if (family.error) family.load();
    familySource(); syncNative();
  });
  nativeToggle.addEventListener('keydown', function (event) {
    if ((event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') || family.readyState < 1) return;
    event.preventDefault();
    family.currentTime = Math.max(0, Math.min(family.duration - .05, family.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
  });
  observe(native.querySelector('.native-stage'), function (value) {
    nativeVisible = value;
    if (value) { familyLoaded = true; familySource(); }
    syncNative();
  }, .15);
  familyPortrait.addEventListener('change', familySource);
  reduce.addEventListener('change', function () { nativeManual = null; syncNative(); });
  document.addEventListener('visibilitychange', syncNative);
})();
