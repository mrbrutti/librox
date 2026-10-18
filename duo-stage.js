import * as THREE from "three";

const canvas = document.querySelector("[data-duo-canvas]");
const host = document.querySelector("[data-duo-stage]");

if (canvas && host) {
  startStage().catch((error) => {
    host.classList.add("stage-unavailable");
    console.warn("Librox Duo preview could not start", error);
  });
}

async function startStage() {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  const device = new THREE.Group();
  scene.add(device);
  scene.add(new THREE.AmbientLight(0xffffff, 2.1));

  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-2.6, 3.4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb5c9bb, 1.7);
  rim.position.set(2.5, -1.5, -2);
  scene.add(rim);

  const loader = new THREE.TextureLoader();
  const [outerTexture, libraryTexture, readingTexture, listeningTexture] =
    await Promise.all(
      [
        "assets/duo-closed.webp",
        "assets/duo-library.webp",
        "assets/duo-reading.webp",
        "assets/duo-listening.webp",
      ].map(async (url) => {
        const texture = await loader.loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        return texture;
      }),
    );

  const panelWidth = 0.72;
  const panelHeight = 1.04;
  const screenWidth = 0.68;
  const screenHeight = 0.992;
  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x202a26,
    metalness: 0.73,
    roughness: 0.31,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: 0x778079,
    metalness: 0.86,
    roughness: 0.27,
  });
  const glass = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const left = new THREE.Group();
  const right = new THREE.Group();
  device.add(left, right);
  const screenLayers = { library: [], reading: [], listening: [] };

  function addPanel(group, side) {
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(
        roundedRect(panelWidth, panelHeight, 0.046),
        {
          depth: 0.035,
          bevelEnabled: true,
          bevelThickness: 0.007,
          bevelSize: 0.006,
          bevelSegments: 3,
          curveSegments: 10,
        },
      ),
      graphite,
    );
    body.position.x = side === "left" ? -panelWidth / 2 : panelWidth / 2;
    group.add(body);

    const screenX = side === "left" ? -panelWidth / 2 : panelWidth / 2;
    for (const [index, [name, texture]] of [
      ["library", libraryTexture],
      ["reading", readingTexture],
      ["listening", listeningTexture],
    ].entries()) {
      const geometry = screenGeometry(
        screenWidth,
        screenHeight,
        side === "left" ? 0 : 0.5,
        side === "left" ? 0.485 : 0.5,
      );
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: name === "library" ? 1 : 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const screen = new THREE.Mesh(geometry, material);
      screen.position.set(screenX, 0, 0.046 + index * 0.001);
      screen.renderOrder = index + 1;
      group.add(screen);
      screenLayers[name].push(material);
    }

    const sheen = new THREE.Mesh(
      screenGeometry(screenWidth, screenHeight, 0, 1),
      glass,
    );
    sheen.position.set(screenX, 0, 0.053);
    sheen.renderOrder = 5;
    group.add(sheen);
  }

  addPanel(left, "left");
  addPanel(right, "right");

  const outer = new THREE.Mesh(
    screenGeometry(screenWidth, screenHeight, 0, 1),
    new THREE.MeshBasicMaterial({
      map: outerTexture,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  outer.rotation.y = Math.PI;
  outer.position.set(-panelWidth / 2, 0, -0.01);
  left.add(outer);

  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.017, panelHeight - 0.012, 20),
    edge,
  );
  hinge.position.z = 0.017;
  device.add(hinge);
  for (const y of [-panelHeight / 2 + 0.035, panelHeight / 2 - 0.035]) {
    const knuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.021, 0.021, 0.07, 20),
      graphite,
    );
    knuckle.position.set(0, y, 0.017);
    device.add(knuckle);
  }
  for (const y of [0.12, 0.31]) {
    const button = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.105, 0.026),
      edge,
    );
    button.position.set(panelWidth + 0.008, y, 0.02);
    right.add(button);
  }

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 1.8),
    new THREE.MeshBasicMaterial({
      map: makeShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.35,
    }),
  );
  shadow.position.set(0.1, -0.12, -0.32);
  scene.add(shadow);

  let progress = reduceMotion.matches ? 1 : 0;
  let tween = null;
  let mode = "library";
  let modeTween = null;
  let raf = 0;
  let visible = true;
  let hoverX = 0;
  let hoverY = 0;
  let cameraX = 0;
  let cameraY = 0;
  let poseYaw = 0;
  let posePitch = 0;
  let poseRoll = 0;
  const foldControl = document.querySelector("[data-fold-control]");

  function applyScene() {
    const folded = 1 - progress;
    left.rotation.y = Math.PI * folded;
    left.position.z = folded * 0.073;
    device.position.x = -0.36 * folded;
    device.rotation.set(
      -0.10 + cameraY + posePitch,
      -0.05 + folded * -0.16 + cameraX + poseYaw,
      -0.015 * folded + poseRoll,
    );
    shadow.scale.x = 0.65 + progress * 0.4;
    shadow.material.opacity = 0.24 + progress * 0.17;
  }

  function render() {
    if (!visible) return;
    applyScene();
    renderer.render(scene, camera);
  }

  function tick(now) {
    raf = 0;
    let active = false;
    if (tween) {
      const fraction = Math.min(1, (now - tween.start) / tween.duration);
      progress = tween.from + (tween.to - tween.from) * easeInOut(fraction);
      active = fraction < 1;
      if (!active) {
        progress = tween.to;
        tween = null;
      }
      if (foldControl) foldControl.value = String(Math.round(progress * 100));
    }
    if (modeTween) {
      const fraction = Math.min(1, (now - modeTween.start) / 600);
      const eased = easeInOut(fraction);
      for (const name of Object.keys(screenLayers)) {
        const from = modeTween.fromValues[name];
        const to = name === modeTween.to ? 1 : 0;
        for (const material of screenLayers[name]) {
          material.opacity = from + (to - from) * eased;
        }
      }
      active = active || fraction < 1;
      if (fraction >= 1) {
        modeTween = null;
      }
    }
    const nextCameraX = hoverX * 0.07;
    const nextCameraY = hoverY * 0.045;
    if (Math.abs(nextCameraX - cameraX) > 0.0005 ||
        Math.abs(nextCameraY - cameraY) > 0.0005) {
      cameraX += (nextCameraX - cameraX) * 0.12;
      cameraY += (nextCameraY - cameraY) * 0.12;
      active = true;
    }
    const pose = {
      library: [0, 0, 0],
      reading: [0.075, -0.018, 0.012],
      listening: [-0.08, 0.025, -0.01],
    }[mode];
    if (Math.abs(pose[0] - poseYaw) > 0.0005 ||
        Math.abs(pose[1] - posePitch) > 0.0005 ||
        Math.abs(pose[2] - poseRoll) > 0.0005) {
      poseYaw += (pose[0] - poseYaw) * 0.08;
      posePitch += (pose[1] - posePitch) * 0.08;
      poseRoll += (pose[2] - poseRoll) * 0.08;
      active = true;
    }
    render();
    if (active) requestFrame();
  }

  function requestFrame() {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  }

  function animateFold(to, duration = 1650) {
    if (reduceMotion.matches) {
      progress = to;
      tween = null;
      if (foldControl) foldControl.value = String(Math.round(progress * 100));
      render();
      return;
    }
    tween = { from: progress, to, start: performance.now(), duration };
    requestFrame();
  }

  function setMode(nextMode) {
    if (!screenLayers[nextMode] || nextMode === mode) return;
    host.dataset.mode = nextMode;
    const story = host.closest(".story");
    if (story) story.dataset.mode = nextMode;
    document.querySelectorAll("[data-scene-mode]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        button.dataset.sceneMode === nextMode ? "true" : "false",
      );
    });
    const fromValues = Object.fromEntries(
      Object.entries(screenLayers).map(([name, materials]) => [
        name,
        materials[0].opacity,
      ]),
    );
    mode = nextMode;
    if (reduceMotion.matches) {
      for (const name of Object.keys(screenLayers)) {
        for (const material of screenLayers[name])
          material.opacity = name === nextMode ? 1 : 0;
      }
      render();
      return;
    }
    modeTween = { fromValues, to: nextMode, start: performance.now() };
    requestFrame();
  }

  function setProgress(value) {
    tween = null;
    progress = Math.max(0, Math.min(1, value));
    if (foldControl) foldControl.value = String(Math.round(progress * 100));
    render();
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    renderer.setSize(
      Math.round(width * pixelRatio),
      Math.round(height * pixelRatio),
      false,
    );
    camera.aspect = width / height;
    const halfAngle = Math.tan((camera.fov * Math.PI) / 360);
    const portraitTablet = width >= 700 && width <= 900 && height < 700;
    camera.position.set(
      0,
      0.025,
      Math.max(2.14, 1.69 / (2 * halfAngle * camera.aspect), 1.3 / (2 * halfAngle)) *
        (portraitTablet ? 1.18 : 1),
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches) {
    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      hoverX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      hoverY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      requestFrame();
    });
    canvas.addEventListener("pointerleave", () => {
      hoverX = 0;
      hoverY = 0;
      requestFrame();
    });
  }
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        resize();
        requestFrame();
      }
    },
    { threshold: 0.01 },
  ).observe(host);

  if (foldControl) {
    foldControl.addEventListener("input", () => {
      setProgress(Number(foldControl.value) / 100);
    });
    foldControl.addEventListener("change", () => {
      animateFold(Number(foldControl.value) >= 50 ? 1 : 0, 700);
    });
  }
  document.querySelectorAll("[data-scene-mode]").forEach((control) => {
    control.addEventListener("click", () => {
      setMode(control.dataset.sceneMode);
      if (progress < 0.9) animateFold(1);
    });
  });
  document.querySelectorAll("[data-stage-replay]").forEach((replay) => {
    replay.addEventListener("click", () => {
      if (replay.hasAttribute("data-replay-library")) setMode("library");
      setProgress(0);
      if (foldControl) foldControl.value = "0";
      animateFold(1);
    });
  });

  host.classList.add("stage-ready");
  window.libroxStage = { animateFold, setMode, setProgress, resize };
  window.dispatchEvent(new Event("librox-stage-ready"));
  if (!reduceMotion.matches) {
    setTimeout(() => animateFold(1), 350);
  } else {
    render();
  }
}

function roundedRect(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function screenGeometry(width, height, offsetX, scaleX) {
  const geometry = new THREE.ShapeGeometry(
    roundedRect(width, height, 0.026),
    12,
  );
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      offsetX + ((positions.getX(i) + width / 2) / width) * scaleX,
      (positions.getY(i) + height / 2) / height,
    );
  }
  uv.needsUpdate = true;
  return geometry;
}

function makeShadowTexture() {
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const context = shadowCanvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, "rgba(13, 25, 17, 0.6)");
  gradient.addColorStop(1, "rgba(13, 25, 17, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(shadowCanvas);
}

// cubic-bezier(0.77, 0, 0.175, 1) — the on-screen motion curve from animate.
function easeInOut(progress) {
  let lower = 0;
  let upper = 1;
  let t = progress;
  for (let i = 0; i < 8; i++) {
    t = (lower + upper) / 2;
    const x =
      3 * 0.77 * t * (1 - t) * (1 - t) +
      3 * 0.175 * t * t * (1 - t) +
      t * t * t;
    if (x < progress) lower = t;
    else upper = t;
  }
  return 3 * t * t * (1 - t) + t * t * t;
}
