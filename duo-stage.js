// The Apple-provided bezel stays still. Only Librox screen content changes.
const host = document.querySelector("[data-duo-stage]");
const story = host?.closest(".story");
const product = host?.querySelector(".duo-product");
const screens = [...(host?.querySelectorAll("[data-screen]") ?? [])];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (host && story && product && screens.length === 3) {
  const modes = ["library", "reading", "listening"];
  let tourTimers = [];
  let currentMode = null;

  function cancelTour() {
    tourTimers.forEach(clearTimeout);
    tourTimers = [];
  }

  function showMode(mode) {
    if (!modes.includes(mode) || mode === currentMode) return;
    host.dataset.mode = mode;
    story.dataset.mode = mode;
    product.setAttribute(
      "aria-label",
      `Librox 2.0 ${mode} design preview displayed within Apple's official open iPhone Duo bezel`,
    );
    screens.forEach((screen) => {
      screen.classList.toggle("is-previous", screen.dataset.screen === currentMode);
      screen.classList.toggle("is-active", screen.dataset.screen === mode);
    });
    story.querySelectorAll("[data-chapter]").forEach((chapter) => {
      const active = chapter.dataset.chapter === mode;
      chapter.classList.toggle("is-current", active);
      chapter.inert = !active;
      chapter.setAttribute("aria-hidden", active ? "false" : "true");
    });
    currentMode = mode;
    if (reduceMotion.matches) {
      screens.forEach((screen) => screen.classList.remove("is-previous"));
    }
    host.querySelectorAll("[data-scene-mode]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.sceneMode === mode ? "true" : "false",
      );
    });
  }

  function setMode(mode) {
    cancelTour();
    showMode(mode);
  }

  function playTour() {
    cancelTour();
    showMode("library");
    if (reduceMotion.matches) return;
    tourTimers = [
      setTimeout(() => showMode("reading"), 1000),
      setTimeout(() => showMode("listening"), 2600),
      setTimeout(() => showMode("library"), 4200),
    ];
  }

  document.querySelectorAll("[data-scene-mode]").forEach((control) => {
    control.addEventListener("click", () => {
      setMode(control.dataset.sceneMode);
    });
  });
  screens.forEach((screen) => {
    screen.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "clip-path" || screen.dataset.screen !== currentMode) return;
      screens.forEach((image) => image.classList.remove("is-previous"));
    });
  });
  document.querySelectorAll("[data-stage-tour]").forEach((control) => {
    control.addEventListener("click", playTour);
  });

  showMode(location.hash === "#the-page" ? "reading" : location.hash === "#listening" ? "listening" : "library");
  requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("stage-ready")));
  window.libroxStage = { setMode };
  window.dispatchEvent(new Event("librox-stage-ready"));
}
