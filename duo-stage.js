// Librox content changes inside Apple's stationary Duo bezel.
const host = document.querySelector("[data-duo-stage]");
const story = host?.closest(".story");
const product = host?.querySelector(".duo-product");
const screens = [...(host?.querySelectorAll("[data-screen]") ?? [])];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (host && story && product && screens.length === 3) {
  const modes = ["library", "reading", "listening"];
  const dwell = { library: 4800, reading: 5200, listening: 5600 };
  const toggle = host.querySelector("[data-stage-toggle]");
  const toggleLabel = toggle?.querySelector("[data-stage-toggle-label]");
  const toggleIcon = toggle?.querySelector("[data-stage-toggle-icon]");
  let currentMode = null;
  let tourTimer = null;
  let inView = false;
  let userPaused = false;
  let explicitPlay = false;

  function canTour() {
    return inView && document.visibilityState === "visible" && !userPaused &&
      (!reduceMotion.matches || explicitPlay);
  }

  function updateControls() {
    const playing = canTour();
    host.dataset.touring = String(playing);
    story.style.setProperty("--scene-duration", `${dwell[currentMode]}ms`);
    if (toggle) toggle.setAttribute("aria-pressed", String(playing));
    if (toggleLabel) toggleLabel.textContent = playing ? "Pause story" : "Play story";
    if (toggleIcon) toggleIcon.textContent = playing ? "Ⅱ" : "▶";
  }

  function clearTour() {
    if (tourTimer !== null) clearTimeout(tourTimer);
    tourTimer = null;
  }

  function showMode(mode) {
    if (!modes.includes(mode) || mode === currentMode) return;
    const previous = currentMode;
    host.dataset.mode = mode;
    story.dataset.mode = mode;
    product.setAttribute(
      "aria-label",
      `Librox 2.0 ${mode} design preview displayed within Apple's official open iPhone Duo bezel`,
    );
    screens.forEach((screen) => {
      screen.classList.toggle("is-previous", screen.dataset.screen === previous);
      screen.classList.toggle("is-active", screen.dataset.screen === mode);
    });
    story.querySelectorAll("[data-chapter]").forEach((chapter) => {
      const active = chapter.dataset.chapter === mode;
      chapter.classList.toggle("is-current", active);
      chapter.inert = !active;
      chapter.setAttribute("aria-hidden", active ? "false" : "true");
    });
    host.querySelectorAll("[data-scene-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.sceneMode === mode));
    });
    currentMode = mode;
    if (reduceMotion.matches) screens.forEach((screen) => screen.classList.remove("is-previous"));
    updateControls();
  }

  function scheduleNext() {
    clearTour();
    updateControls();
    if (!canTour()) return;
    tourTimer = setTimeout(() => {
      const next = modes[(modes.indexOf(currentMode) + 1) % modes.length];
      showMode(next);
      scheduleNext();
    }, dwell[currentMode]);
  }

  function setMode(mode) {
    userPaused = true;
    clearTour();
    showMode(mode);
    updateControls();
  }

  function playTour() {
    userPaused = false;
    explicitPlay = true;
    showMode("library");
    scheduleNext();
  }

  host.querySelectorAll("[data-scene-mode]").forEach((control) => {
    control.addEventListener("click", () => setMode(control.dataset.sceneMode));
  });
  screens.forEach((screen) => {
    screen.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "opacity" || screen.dataset.screen !== currentMode) return;
      screens.forEach((image) => image.classList.remove("is-previous"));
    });
  });
  document.querySelectorAll("[data-stage-tour]").forEach((control) => {
    control.addEventListener("click", playTour);
  });
  toggle?.addEventListener("click", () => {
    if (canTour()) {
      userPaused = true;
      clearTour();
      updateControls();
    } else {
      userPaused = false;
      explicitPlay = true;
      scheduleNext();
    }
  });
  document.addEventListener("visibilitychange", scheduleNext);
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) explicitPlay = false;
    scheduleNext();
  });

  showMode(location.hash === "#the-page" ? "reading" : location.hash === "#listening" ? "listening" : "library");
  requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("stage-ready")));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      const visible = entries[0].intersectionRatio >= .4;
      if (visible === inView) return;
      inView = visible;
      scheduleNext();
    }, { threshold: [0, .4, .6] }).observe(story);
  } else {
    inView = true;
    scheduleNext();
  }
  window.libroxStage = { setMode, playTour };
  window.dispatchEvent(new Event("librox-stage-ready"));
}
