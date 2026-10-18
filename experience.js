/* The recorded app scenes switch in place. Apple's bezel remains static. */
(function () {
  "use strict";

  var experience = document.querySelector("[data-experience]");
  if (!experience) return;

  var videos = {
    opening: experience.querySelector('[data-experience-video="opening"]'),
    reading: experience.querySelector('[data-experience-video="reading"]'),
  };
  var panels = {
    book: experience.querySelector('[data-experience-panel="book"]'),
    opening: experience.querySelector('[data-experience-panel="opening"]'),
    reading: experience.querySelector('[data-experience-panel="reading"]'),
  };
  var fallbacks = Array.prototype.slice.call(experience.querySelectorAll("[data-experience-fallback]"));
  var toggle = experience.querySelector("[data-experience-toggle]");
  var replay = experience.querySelector("[data-experience-replay]");
  var caption = experience.querySelector("[data-experience-caption]");
  var number = experience.querySelector("[data-experience-number]");
  var next = experience.querySelector("[data-experience-next]");
  var motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  var manualChoice = { opening: null, reading: null };
  var activeScene = "book";
  var visible = false;

  function showFallback() {
    if (activeScene === "book") return;
    var fallbackName = activeScene === "opening" && videos.opening.ended
      ? "opening-end"
      : activeScene;
    fallbacks.forEach(function (image) {
      image.classList.toggle("is-active", image.dataset.experienceFallback === fallbackName);
    });
  }

  function updateToggle() {
    if (activeScene === "book") return;
    var video = videos[activeScene];
    var paused = video.paused || video.ended;
    toggle.textContent = paused ? "Play" : "Pause";
    toggle.setAttribute("aria-label", (paused ? "Play" : "Pause") + " app film");
  }

  function syncPlayback() {
    var activeVideo = videos[activeScene];
    Object.keys(videos).forEach(function (scene) {
      if (scene !== activeScene) videos[scene].pause();
    });
    if (!activeVideo) return;
    var canPlay = visible && document.visibilityState !== "hidden" && !activeVideo.ended &&
      (manualChoice[activeScene] === true ||
        (manualChoice[activeScene] === null && !motionPreference.matches));
    if (canPlay) {
      if (activeVideo.paused) activeVideo.play().catch(updateToggle);
    } else {
      activeVideo.pause();
    }
    updateToggle();
  }

  function showScene(scene) {
    if (!panels[scene]) return;
    if (scene !== activeScene) {
      if (videos[activeScene]) videos[activeScene].pause();
      activeScene = scene;
      if (videos[scene]) {
        videos[scene].currentTime = 0;
        videos[scene].classList.remove("has-frame");
      }
    }
    experience.dataset.scene = scene;
    experience.classList.remove("is-book-opening");
    Object.keys(panels).forEach(function (name) {
      var active = name === scene;
      panels[name].classList.toggle("is-active", active);
      panels[name].inert = !active;
      panels[name].setAttribute("aria-hidden", active ? "false" : "true");
      if (videos[name]) {
        videos[name].classList.toggle("is-active", active);
        videos[name].setAttribute("aria-hidden", active ? "false" : "true");
      }
    });
    number.textContent = { book: "01", opening: "02", reading: "03" }[scene];
    caption.textContent = {
      book: "Interactive render of Librox design-lab artwork",
      opening: "Native opening study · development build · sequence shortened",
      reading: "Real app capture · development build · continuous recording"
    }[scene];
    next.firstChild.nodeValue = {
      book: "SEE THE APP ",
      opening: "SEE THE READER ",
      reading: "RETURN TO THE BOOK "
    }[scene];
    if (scene === "book" && window.libroxBookScene) window.libroxBookScene.reset();
    showFallback();
    syncPlayback();
  }

  function replayScene() {
    if (activeScene === "book") return;
    var video = videos[activeScene];
    video.currentTime = 0;
    video.classList.remove("has-frame");
    manualChoice[activeScene] = true;
    showFallback();
    syncPlayback();
  }

  experience.querySelectorAll("[data-experience-go]").forEach(function (button) {
    button.addEventListener("click", function () {
      showScene(button.dataset.experienceGo);
    });
  });
  experience.querySelector("[data-book-open]").addEventListener("click", function () {
    var button = this;
    button.disabled = true;
    experience.classList.add("is-book-opening");
    var animation = window.libroxBookScene
      ? window.libroxBookScene.open()
      : Promise.resolve();
    animation.then(function (completed) {
      if (completed !== false && activeScene === "book") showScene("opening");
      button.disabled = false;
    });
  });
  next.addEventListener("click", function () {
    showScene(activeScene === "book" ? "opening" : activeScene === "opening" ? "reading" : "book");
  });
  toggle.addEventListener("click", function () {
    var video = videos[activeScene];
    if (video.ended) {
      replayScene();
    } else {
      manualChoice[activeScene] = video.paused;
      syncPlayback();
    }
  });
  replay.addEventListener("click", replayScene);

  Object.keys(videos).forEach(function (scene) {
    var video = videos[scene];
    video.addEventListener("playing", function () {
      video.classList.add("has-frame");
      updateToggle();
    });
    video.addEventListener("pause", updateToggle);
    video.addEventListener("ended", function () {
      video.classList.remove("has-frame");
      showFallback();
      updateToggle();
    });
    video.addEventListener("error", function () {
      video.classList.remove("has-frame");
      showFallback();
      updateToggle();
    });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: .12 }).observe(experience);
  } else {
    visible = true;
  }
  document.querySelectorAll('a[href="#app-in-motion"],a[href="#experience"]').forEach(function (link) {
    link.addEventListener("click", function () {
      showScene(link.getAttribute("href") === "#app-in-motion" ? "opening" : "book");
    });
  });
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", syncPlayback);
  showScene(location.hash === "#app-in-motion" ? "opening" : "book");
})();
