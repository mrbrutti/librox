import * as THREE from "three";

const canvas = document.querySelector("[data-book-canvas]");
const hero = document.querySelector(".film-hero");
const replay = document.querySelector("[data-book-replay]");
const motionToggle = document.querySelector("[data-motion-toggle]");
if (canvas && hero && replay && motionToggle) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#d8d0bf");
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0.5, 0.2, 10.8);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  let grainSeed = 1973;
  const grainRandom = () => {
    grainSeed = (grainSeed * 1664525 + 1013904223) >>> 0;
    return grainSeed / 4294967296;
  };
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0xfff8e9, 0x545b50, 1.8));
  const key = new THREE.DirectionalLight(0xfff2dc, 3.1);
  key.position.set(-4, 7, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 8;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd5e5d8, 1.9);
  rim.position.set(5, -3, 4);
  scene.add(rim);

  // The object is a clothbound book, not a modeled Apple device. Its motion
  // celebrates the app's book-opening interaction without simulating hardware.
  const book = new THREE.Group();
  book.rotation.set(-0.13, -0.17, -0.075);
  book.position.set(0.25, -0.1, 0);
  scene.add(book);
  const width = 3.1;
  const height = 4.45;
  const matte = (color, roughness = 0.88) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
  const cloth = matte("#143e37", 0.94);
  const clothEdge = matte("#0a2c28", 0.96);
  const pageEdge = matte("#e2d6bd", 0.98);
  const endpaper = matte("#b8ae97", 0.98);

  function box(w, h, d, materials, x, y, z, parent = book) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  box(width + 0.17, height + 0.17, 0.075, cloth, width / 2, 0, -0.18);
  const rightBlock = box(width - 0.13, height - 0.2, 0.29, [pageEdge, pageEdge, pageEdge, pageEdge, pageEdge, pageEdge], width / 2, 0, 0.015);
  // Fine rules on the fore edge catch the side light like stacked leaves.
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = 128;
  edgeCanvas.height = 512;
  const edgeContext = edgeCanvas.getContext("2d");
  edgeContext.fillStyle = "#ded2b7";
  edgeContext.fillRect(0, 0, 128, 512);
  for (let y = 0; y < 512; y += 4) {
    edgeContext.fillStyle = y % 12 === 0 ? "rgba(75,65,48,.22)" : "rgba(255,252,241,.43)";
    edgeContext.fillRect(0, y, 128, 1);
  }
  const edgeTexture = new THREE.CanvasTexture(edgeCanvas);
  edgeTexture.colorSpace = THREE.SRGBColorSpace;
  rightBlock.material[0] = new THREE.MeshStandardMaterial({ map: edgeTexture, roughness: 1 });

  const leftBlock = box(width - 0.13, height - 0.2, 0.12, pageEdge, -width / 2, 0, 0.095);
  const leftEndpaper = box(width - 0.1, height - 0.14, 0.016, endpaper, -width / 2, 0, 0.168);

  const spine = box(0.15, height + 0.1, 0.38, clothEdge, -0.045, 0, 0.02);
  spine.rotation.y = -0.06;
  for (const offset of [-1.6, 1.6]) {
    box(0.16, 0.08, 0.4, matte("#ba9560", 0.55), -0.047, offset, 0.025);
  }

  function pageTexture(kind) {
    const surface = document.createElement("canvas");
    surface.width = 768;
    surface.height = 1100;
    const ctx = surface.getContext("2d");
    ctx.fillStyle = "#f2ebdc";
    ctx.fillRect(0, 0, 768, 1100);
    const grain = ctx.createImageData(768, 1100);
    for (let i = 0; i < grain.data.length; i += 4) {
      const n = 234 + grainRandom() * 7;
      grain.data[i] = n;
      grain.data[i + 1] = n - 5;
      grain.data[i + 2] = n - 17;
      grain.data[i + 3] = 255;
    }
    ctx.putImageData(grain, 0, 0);
    const gutter = ctx.createLinearGradient(kind === "title" ? 768 : 0, 0, kind === "title" ? 610 : 158, 0);
    gutter.addColorStop(0, "rgba(52,42,30,.27)");
    gutter.addColorStop(1, "rgba(52,42,30,0)");
    ctx.fillStyle = gutter;
    ctx.fillRect(0, 0, 768, 1100);
    ctx.fillStyle = "#383c33";
    ctx.textAlign = "center";
    if (kind === "title") {
      ctx.font = "small-caps 31px Georgia";
      ctx.fillText("HERMAN MELVILLE", 384, 284);
      ctx.fillRect(313, 337, 142, 1);
      ctx.font = "72px Georgia";
      ctx.fillText("MOBY-DICK", 384, 495);
      ctx.font = "italic 29px Georgia";
      ctx.fillText("or, The Whale", 384, 552);
      ctx.font = "small-caps 23px Georgia";
      ctx.fillText("A STORY OF THE SEA", 384, 711);
      ctx.fillText("1851", 384, 847);
    } else {
      ctx.font = "small-caps 23px Georgia";
      ctx.fillText(kind === "second" ? "LOOMINGS · CONTINUED" : "CHAPTER I · LOOMINGS", 384, 124);
      ctx.fillRect(313, 147, 142, 1);
      ctx.textAlign = "left";
      ctx.font = "33px Georgia";
      const paragraph = kind === "second"
        ? "There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me. There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land."
        : "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; then, I account it high time to get to sea as soon as I can.";
      const words = paragraph.split(" ");
      let line = "";
      let y = 240;
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > 602 && line) {
          ctx.fillText(line, 80, y);
          y += 49;
          if (y > 940) break;
          line = word;
        } else {
          line = next;
        }
      }
      if (line && y <= 940) ctx.fillText(line, 80, y);
      ctx.textAlign = "center";
      ctx.font = "24px Georgia";
      ctx.fillText(kind === "second" ? "2" : "1", 384, 1035);
    }
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  const leftPage = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.12, height - 0.17),
    new THREE.MeshStandardMaterial({ map: pageTexture("title"), side: THREE.DoubleSide, roughness: 1 }),
  );
  leftPage.position.set(-width / 2, 0, 0.355);
  leftPage.receiveShadow = true;
  book.add(leftPage);
  const rightPage = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.12, height - 0.17),
    new THREE.MeshStandardMaterial({ map: pageTexture("second"), side: THREE.DoubleSide, roughness: 1 }),
  );
  rightPage.position.set(width / 2, 0, 0.178);
  rightPage.receiveShadow = true;
  book.add(rightPage);

  const coverCanvas = document.createElement("canvas");
  coverCanvas.width = 900;
  coverCanvas.height = 1300;
  const coverContext = coverCanvas.getContext("2d");
  function drawCover(art) {
    const c = coverContext;
    c.fillStyle = "#0b3932";
    c.fillRect(0, 0, 900, 1300);
    const light = c.createLinearGradient(0, 0, 900, 1300);
    light.addColorStop(0, "rgba(226,211,165,.1)");
    light.addColorStop(0.6, "rgba(0,0,0,0)");
    light.addColorStop(1, "rgba(0,0,0,.28)");
    c.fillStyle = light;
    c.fillRect(0, 0, 900, 1300);
    for (let i = 0; i < 12000; i++) {
      c.fillStyle = i % 3 ? "rgba(238,223,181,.04)" : "rgba(0,0,0,.07)";
      c.fillRect(grainRandom() * 900, grainRandom() * 1300, 1, 3 + grainRandom() * 13);
    }
    if (art) c.drawImage(art, 0, 250, 900, 1050);
    c.fillStyle = "#e9dcb9";
    c.textAlign = "center";
    c.font = "bold 80px Georgia";
    c.fillText("MOBY-DICK", 450, 166);
    c.font = "39px Georgia";
    c.fillText("HERMAN MELVILLE", 450, 223);
    c.strokeStyle = "rgba(229,208,159,.47)";
    c.lineWidth = 3;
    c.strokeRect(30, 30, 840, 1240);
  }
  drawCover(null);
  const coverTexture = new THREE.CanvasTexture(coverCanvas);
  coverTexture.colorSpace = THREE.SRGBColorSpace;
  coverTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const art = new Image();
  art.onload = () => { drawCover(art); coverTexture.needsUpdate = true; };
  art.src = "assets/cover-ocean.webp";

  const coverPivot = new THREE.Group();
  coverPivot.position.set(0, 0, 0.255);
  book.add(coverPivot);
  box(width + 0.2, height + 0.2, 0.082,
    [clothEdge, clothEdge, cloth, cloth, new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.84 }), endpaper],
    (width + 0.2) / 2, 0, 0, coverPivot);
  box(0.09, height + 0.17, 0.098, clothEdge, 0.062, 0, 0.01, coverPivot);

  const paperMaterial = new THREE.MeshStandardMaterial({ map: pageTexture("first"), side: THREE.DoubleSide, roughness: 1 });
  const turnGeometry = new THREE.PlaneGeometry(width - 0.1, height - 0.14, 28, 1);
  turnGeometry.translate((width - 0.1) / 2, 0, 0);
  const turnPage = new THREE.Mesh(turnGeometry, paperMaterial);
  turnPage.position.set(0, 0, 0.205);
  turnPage.castShadow = true;
  turnPage.receiveShadow = true;
  book.add(turnPage);
  const basePositions = turnGeometry.attributes.position.array.slice();

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), matte("#d8d0bf", 1));
  floor.position.z = -0.64;
  floor.receiveShadow = true;
  scene.add(floor);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  const shadowContext = shadowCanvas.getContext("2d");
  const shadowFade = shadowContext.createRadialGradient(128, 128, 12, 128, 128, 128);
  shadowFade.addColorStop(0, "rgba(18,23,18,.4)");
  shadowFade.addColorStop(1, "rgba(18,23,18,0)");
  shadowContext.fillStyle = shadowFade;
  shadowContext.fillRect(0, 0, 256, 256);
  const softShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 7),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  softShadow.position.set(0.45, -0.55, -0.615);
  scene.add(softShadow);

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smooth = (v) => { const x = clamp(v); return x * x * (3 - 2 * x); };
  let start = performance.now();
  let playing = !reducedMotion.matches;
  let visible = true;
  let pointerX = 0;
  let pointerY = 0;
  let currentProgress = reducedMotion.matches ? 1 : 0;
  let renderedProgress = -1;
  let renderedPointerX = 0;
  let renderedPointerY = 0;
  motionToggle.textContent = playing ? "Pause motion" : "Play motion";

  function setBook(progress) {
    const open = smooth((progress - 0.06) / 0.6);
    const turn = smooth((progress - 0.64) / 0.28);
    coverPivot.rotation.y = -Math.PI * open;
    leftBlock.visible = leftEndpaper.visible = leftPage.visible = open > 0.52;
    turnPage.visible = open > 0.88 && turn < 0.995;
    turnPage.rotation.y = -Math.PI * turn;
    const pos = turnGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = basePositions[i * 3];
      const u = x / (width - 0.1);
      pos.setXYZ(i, x, basePositions[i * 3 + 1], Math.sin(u * Math.PI) * Math.sin(turn * Math.PI) * 0.32);
    }
    pos.needsUpdate = true;
    turnGeometry.computeVertexNormals();
    book.rotation.y = -0.17 + open * 0.12 + pointerX * 0.065;
    book.rotation.x = -0.13 + pointerY * 0.04;
    book.position.x = innerWidth <= 700 ? -0.15 + open * 0.3 : 0.65 + open * 0.45;
    book.position.y = innerWidth <= 700 ? 0.35 : -0.1;
    camera.position.z = innerWidth <= 700 ? 9.8 + open * 3.6 : 10.8 + open * 3.7;
    camera.lookAt(open > 0.65 ? 0.03 : 0.7, 0, 0);
    hero.dataset.bookState = open > 0.75 ? "open" : "closed";
  }

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = innerWidth <= 700 ? 43 : 55;
    camera.updateProjectionMatrix();
    setBook(currentProgress);
    render();
    hero.classList.add("has-book-canvas");
  }
  function render() { renderer.render(scene, camera); }
  function tick(now) {
    if (visible) {
      if (playing) {
        currentProgress = clamp((now - start) / 7700);
        if (currentProgress === 1) {
          playing = false;
          motionToggle.textContent = "Replay motion";
        }
      }
      if (currentProgress !== renderedProgress || pointerX !== renderedPointerX || pointerY !== renderedPointerY) {
        setBook(currentProgress);
        render();
        renderedProgress = currentProgress;
        renderedPointerX = pointerX;
        renderedPointerY = pointerY;
      }
    }
    requestAnimationFrame(tick);
  }
  replay.addEventListener("click", () => {
    start = performance.now();
    currentProgress = 0;
    playing = !reducedMotion.matches;
    motionToggle.textContent = playing ? "Pause motion" : "Play motion";
    if (reducedMotion.matches) { currentProgress = 1; setBook(1); render(); }
  });
  motionToggle.addEventListener("click", () => {
    if (currentProgress === 1 && !playing) currentProgress = 0;
    playing = !playing;
    if (playing) start = performance.now() - currentProgress * 7700;
    motionToggle.textContent = playing ? "Pause motion" : "Play motion";
  });
  hero.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") return;
    pointerX = (event.clientX / innerWidth - 0.5) * 2;
    pointerY = (event.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { pointerX = pointerY = 0; });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.02 }).observe(hero);
  new ResizeObserver(resize).observe(canvas);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) { playing = false; currentProgress = 1; motionToggle.textContent = "Play motion"; setBook(1); render(); }
  });
  setBook(currentProgress);
  resize();
  requestAnimationFrame(tick);
}
