/* Actual Librox recordings play inside Apple's unmodified, static bezels. */
(function () {
  "use strict";

  var experience = document.querySelector("[data-experience]");
  if (!experience) return;

  var devices = {
    duo: experience.querySelector('[data-experience-device="duo"]'),
    iphone: experience.querySelector('[data-experience-device="iphone"]'),
  };
  var videos = {
    duo: experience.querySelector('[data-experience-video="duo"]'),
    iphone: experience.querySelector('[data-experience-video="iphone"]'),
  };
  var tabs = Array.prototype.slice.call(experience.querySelectorAll("[data-experience-select]"));
  var replay = experience.querySelector("[data-experience-replay]");
  var toggle = experience.querySelector("[data-experience-toggle]");
  var caption = experience.querySelector("[data-experience-caption]");
  var motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  var manualChoice = { duo: null, iphone: null };
  var activeDevice = "duo";
  var visible = false;

  function updateToggle() {
    var video = videos[activeDevice];
    var paused = video.paused || video.ended;
    toggle.textContent = paused ? "Play" : "Pause";
    toggle.setAttribute("aria-label", (paused ? "Play" : "Pause") + " app video");
  }

  function syncPlayback() {
    var activeVideo = videos[activeDevice];
    Object.keys(videos).forEach(function (name) {
      if (name !== activeDevice) videos[name].pause();
    });
    var canPlay = visible && document.visibilityState !== "hidden" && !activeVideo.ended &&
      (manualChoice[activeDevice] === true ||
        (manualChoice[activeDevice] === null && !motionPreference.matches));
    if (canPlay) {
      if (activeVideo.paused) activeVideo.play().catch(updateToggle);
    } else {
      activeVideo.pause();
    }
    updateToggle();
  }

  function showDevice(name) {
    if (!devices[name]) return;
    if (name !== activeDevice) {
      videos[activeDevice].pause();
      activeDevice = name;
    }
    experience.dataset.scene = name;
    Object.keys(devices).forEach(function (deviceName) {
      var active = deviceName === name;
      devices[deviceName].classList.toggle("is-active", active);
      devices[deviceName].setAttribute("aria-hidden", String(!active));
    });
    tabs.forEach(function (tab) {
      tab.setAttribute("aria-pressed", String(tab.dataset.experienceSelect === name));
    });
    caption.textContent = name === "duo"
      ? "Native Duo opening study · development build · sequence shortened"
      : "Real iPhone app capture · development build · continuous recording";
    syncPlayback();
  }

  function replayVideo() {
    var video = videos[activeDevice];
    video.currentTime = 0;
    manualChoice[activeDevice] = true;
    syncPlayback();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var name = tab.dataset.experienceSelect;
      if (name === activeDevice) replayVideo();
      else showDevice(name);
    });
  });
  replay.addEventListener("click", replayVideo);
  toggle.addEventListener("click", function () {
    var video = videos[activeDevice];
    if (video.ended) {
      replayVideo();
    } else {
      manualChoice[activeDevice] = video.paused;
      syncPlayback();
    }
  });

  Object.keys(videos).forEach(function (name) {
    var video = videos[name];
    video.addEventListener("playing", function () {
      video.classList.add("has-frame");
      updateToggle();
    });
    video.addEventListener("pause", updateToggle);
    video.addEventListener("ended", updateToggle);
    video.addEventListener("error", function () {
      video.classList.remove("has-frame");
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
      showDevice(link.getAttribute("href") === "#app-in-motion" ? "iphone" : "duo");
    });
  });
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", syncPlayback);
  showDevice(location.hash === "#app-in-motion" ? "iphone" : "duo");
})();
