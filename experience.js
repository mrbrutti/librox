/* A two-chapter reading film. Page scroll changes the setting and the recorded
   app scene; the official Apple bezel never moves or changes shape. */
(function () {
  "use strict";

  var experience = document.querySelector("[data-experience]");
  if (!experience) return;

  var videos = {
    opening: experience.querySelector('[data-experience-video="opening"]'),
    reading: experience.querySelector('[data-experience-video="reading"]'),
  };
  var panels = {
    opening: experience.querySelector('[data-experience-panel="opening"]'),
    reading: experience.querySelector('[data-experience-panel="reading"]'),
  };
  var toggle = experience.querySelector("[data-experience-toggle]");
  var replay = experience.querySelector("[data-experience-replay]");
  var caption = experience.querySelector("[data-experience-caption]");
  var number = experience.querySelector("[data-experience-number]");
  var next = experience.querySelector("[data-experience-next]");
  var motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  var manualChoice = { opening: null, reading: null };
  var activeScene = "opening";
  var visible = false;
  var frame = 0;

  function updateToggle() {
    var isPaused = videos[activeScene].paused;
    toggle.textContent = isPaused ? "Play" : "Pause";
    toggle.setAttribute("aria-label", (isPaused ? "Play" : "Pause") + " app film");
  }

  function syncPlayback() {
    var activeVideo = videos[activeScene];
    var canPlay = visible && document.visibilityState !== "hidden" && !activeVideo.ended &&
      (manualChoice[activeScene] === true ||
        (manualChoice[activeScene] === null && !motionPreference.matches));
    Object.keys(videos).forEach(function (scene) {
      if (scene !== activeScene || !canPlay) videos[scene].pause();
    });
    if (canPlay && activeVideo.paused) activeVideo.play().catch(updateToggle);
    updateToggle();
  }

  function showScene(scene) {
    if (scene === activeScene) return;
    var previous = activeScene;
    activeScene = scene;
    videos[previous].pause();
    videos[scene].currentTime = 0;
    experience.dataset.scene = scene;
    Object.keys(panels).forEach(function (name) {
      var active = name === scene;
      panels[name].classList.toggle("is-active", active);
      panels[name].inert = !active;
      panels[name].setAttribute("aria-hidden", active ? "false" : "true");
      videos[name].classList.toggle("is-active", active);
    });
    number.textContent = scene === "opening" ? "01" : "02";
    caption.textContent = scene === "opening"
      ? "Native opening study · development build · sequence shortened"
      : "Real app capture · development build · continuous recording";
    next.href = scene === "opening" ? "#app-in-motion" : "#duo-story";
    next.firstChild.nodeValue = scene === "opening" ? "SCROLL TO OPEN " : "EXPLORE THE DUO ";
    syncPlayback();
  }

  function updateScroll() {
    frame = 0;
    var bounds = experience.getBoundingClientRect();
    var distance = Math.max(1, bounds.height - innerHeight);
    var progress = Math.max(0, Math.min(1, -bounds.top / distance));
    var nowVisible = bounds.top < innerHeight && bounds.bottom > 0;
    experience.style.setProperty("--experience-progress", Math.round(progress * 100) + "%");
    if (!motionPreference.matches) experience.style.setProperty("--ocean-y", Math.round(-progress * 58) + "px");
    var scene = progress >= .47 ? "reading" : "opening";
    var changed = scene !== activeScene;
    if (changed) showScene(scene);
    if (nowVisible !== visible) {
      visible = nowVisible;
      syncPlayback();
    }
  }

  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }

  toggle.addEventListener("click", function () {
    var video = videos[activeScene];
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      manualChoice[activeScene] = true;
    } else {
      manualChoice[activeScene] = false;
    }
    syncPlayback();
  });
  replay.addEventListener("click", function () {
    videos[activeScene].currentTime = 0;
    manualChoice[activeScene] = true;
    syncPlayback();
  });
  Object.keys(videos).forEach(function (scene) {
    videos[scene].addEventListener("play", updateToggle);
    videos[scene].addEventListener("pause", updateToggle);
    videos[scene].addEventListener("ended", updateToggle);
  });
  addEventListener("scroll", scheduleScroll, { passive: true });
  addEventListener("resize", scheduleScroll);
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", function () {
    scheduleScroll();
    syncPlayback();
  });
  updateScroll();
})();
