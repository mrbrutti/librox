// A book is the hero object. Its printed face uses the original design-lab
// Moby-Dick artwork; only the case, paper, lighting, and motion are synthesized.
import * as THREE from "three";

const stage = document.querySelector("[data-book-stage]");
const mount = document.querySelector("[data-book-canvas]");
if (stage && mount) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (context) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.55;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
      camera.position.set(0.15, 0.55, 7.6);
      camera.lookAt(-0.45, -0.08, 0);
      scene.add(new THREE.HemisphereLight(0xf8e8c8, 0x16231d, 2.25));
      const key = new THREE.DirectionalLight(0xffe7bd, 4.1);
      key.position.set(-3.4, 5.5, 5.2);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.left = -5;
      key.shadow.camera.right = 5;
      key.shadow.camera.top = 5;
      key.shadow.camera.bottom = -5;
      key.shadow.bias = -0.0003;
      key.shadow.radius = 4;
      scene.add(key);
      const rim = new THREE.PointLight(0xbacbb6, 23, 12);
      rim.position.set(3.7, 2.1, -3.5);
      scene.add(rim);
      const bounce = new THREE.PointLight(0xffdbad, 9, 9);
      bounce.position.set(0, -2, 3);
      scene.add(bounce);

      function textureFromCanvas(draw, width = 512, height = 512) {
        const source = document.createElement("canvas");
        source.width = width;
        source.height = height;
        draw(source.getContext("2d"), width, height);
        const texture = new THREE.CanvasTexture(source);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        return texture;
      }

      // Seeded grain keeps the material stable from frame to frame.
      let seed = 37;
      function random() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      const cloth = textureFromCanvas((g, w, h) => {
        g.fillStyle = "#073a30";
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 26000; i++) {
          const x = random() * w;
          const y = random() * h;
          g.fillStyle = random() > 0.55 ? "rgba(205,194,148,.055)" : "rgba(1,11,9,.15)";
          g.fillRect(x, y, random() * 2.5 + 0.5, random() * 0.8 + 0.2);
        }
      });
      const edge = textureFromCanvas((g, w, h) => {
        g.fillStyle = "#d5c8a7";
        g.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2.2) {
          g.fillStyle = random() > 0.35 ? "rgba(81,59,35,.21)" : "rgba(255,246,220,.6)";
          g.fillRect(0, y, w, random() * 0.65 + 0.15);
        }
        for (let i = 0; i < 3500; i++) {
          g.fillStyle = "rgba(94,74,46,.06)";
          g.fillRect(random() * w, random() * h, random() * 9, 0.35);
        }
      });
      const paperTexture = (chapter, page) => textureFromCanvas((g, w, h) => {
        g.fillStyle = "#e9dcc0";
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 11000; i++) {
          const v = Math.floor(210 + random() * 42);
          g.fillStyle = `rgba(${v - 54},${v - 66},${v - 88},.035)`;
          g.fillRect(random() * w, random() * h, 1.4, 1.4);
        }
        const shade = g.createLinearGradient(0, 0, w, 0);
        shade.addColorStop(0, "rgba(71,50,31,.23)");
        shade.addColorStop(.12, "rgba(71,50,31,.02)");
        shade.addColorStop(.87, "rgba(71,50,31,0)");
        shade.addColorStop(1, "rgba(71,50,31,.16)");
        g.fillStyle = shade;
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#393324";
        g.textAlign = "center";
        g.font = "25px Georgia, serif";
        g.fillText(chapter, w / 2, 104);
        g.font = "12px Georgia, serif";
        g.fillText("MOBY-DICK  ·  HERMAN MELVILLE", w / 2, 132);
        g.textAlign = "left";
        g.font = "21px Georgia, serif";
        const rows = [
          "Call me Ishmael. Some years ago—",
          "never mind how long precisely—having",
          "little or no money in my purse, and",
          "nothing particular to interest me on",
          "shore, I thought I would sail about a",
          "little and see the watery part of the",
          "world. It is a way I have of driving off",
          "the spleen and regulating the circulation.",
          "",
          "Whenever I find myself growing grim",
          "about the mouth; whenever it is a damp,",
          "drizzly November in my soul; whenever",
          "I find myself involuntarily pausing",
          "before coffin warehouses, and bringing",
          "up the rear of every funeral I meet;",
          "then I account it high time to get to sea",
          "as soon as I can."
        ];
        rows.forEach((line, i) => g.fillText(line, 44, 181 + i * 28, w - 88));
        g.textAlign = "center";
        g.font = "13px Georgia, serif";
        g.fillText(String(page), w / 2, h - 43);
      }, 512, 768);
      const pageMap = paperTexture("LOOMINGS", 1);
      const secondMap = paperTexture("THE CARPET-BAG", 3);
      const endpaperMap = textureFromCanvas((g, w, h) => {
        g.fillStyle = "#cabd9a"; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 100; i++) {
          g.strokeStyle = "rgba(70,90,64,.09)";
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(-30, i * 12);
          g.bezierCurveTo(w * .25, i * 12 - 70, w * .65, i * 12 + 70, w + 30, i * 12);
          g.stroke();
        }
      });

      const clothMaterial = new THREE.MeshPhysicalMaterial({
        map: cloth, color: 0xb6baa7, roughness: .94, metalness: 0,
        clearcoat: .035, clearcoatRoughness: .7
      });
      const paperMaterial = new THREE.MeshStandardMaterial({
        color: 0xe3d5b5, roughness: 1
      });
      const pageEdgeMaterial = new THREE.MeshStandardMaterial({
        map: edge, color: 0xe7dec7, roughness: 1
      });
      const book = new THREE.Group();
      scene.add(book);
      const width = 2.18;
      const height = 3.24;
      function board(w, h, d, materials) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      }
      const back = board(width, height, .07, clothMaterial);
      back.position.set(0, 0, -.15);
      book.add(back);
      const block = board(2.07, 3.12, .23, [
        pageEdgeMaterial, pageEdgeMaterial, pageEdgeMaterial,
        pageEdgeMaterial, new THREE.MeshStandardMaterial({ map: pageMap, roughness: 1 }),
        paperMaterial
      ]);
      block.position.set(.02, 0, -.01);
      book.add(block);
      const spine = board(.18, height, .32, clothMaterial);
      spine.position.set(-width / 2 + .04, 0, -.02);
      book.add(spine);
      const hinge = new THREE.Group();
      hinge.position.set(-width / 2, 0, .13);
      book.add(hinge);
      const coverTexture = new THREE.TextureLoader().load("assets/moby-cover.webp", () => {
        stage.classList.add("book-ready");
      });
      coverTexture.colorSpace = THREE.SRGBColorSpace;
      coverTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const printedFace = new THREE.MeshPhysicalMaterial({
        map: coverTexture, roughness: .79, metalness: 0,
        clearcoat: .055, clearcoatRoughness: .72
      });
      const cover = board(width, height, .075, [
        clothMaterial, clothMaterial, clothMaterial,
        clothMaterial, printedFace, clothMaterial
      ]);
      cover.position.set(width / 2, 0, .02);
      hinge.add(cover);
      const endpaper = new THREE.Mesh(new THREE.PlaneGeometry(width - .09, height - .09), new THREE.MeshStandardMaterial({
        map: endpaperMap, roughness: 1, side: THREE.DoubleSide
      }));
      endpaper.rotation.y = Math.PI;
      endpaper.position.set(width / 2, 0, -.021);
      hinge.add(endpaper);

      const leaves = [0, 1].map((index) => {
        const pivot = new THREE.Group();
        pivot.position.set(-1.035, 0, .127 + index * .004);
        book.add(pivot);
        const geometry = new THREE.PlaneGeometry(2.06, 3.10, 28, 12);
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          positions.setZ(i, Math.sin((x + 1.03) / 2.06 * Math.PI) * .022);
        }
        geometry.computeVertexNormals();
        const sheet = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
          map: index ? secondMap : pageMap, roughness: 1, side: THREE.DoubleSide
        }));
        sheet.position.x = 1.03;
        sheet.castShadow = true;
        sheet.receiveShadow = true;
        pivot.add(sheet);
        pivot.visible = false;
        return pivot;
      });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.ShadowMaterial({
        opacity: .3, color: 0x000000
      }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -height / 2 - .045, .15);
      floor.receiveShadow = true;
      scene.add(floor);

      let widthPx = 0;
      let heightPx = 0;
      let visible = true;
      let opened = false;
      let openingAt = 0;
      let resolveOpen = null;
      let pointerX = 0;
      let pointerY = 0;
      const clock = new THREE.Clock();
      const ease = (v) => {
        const x = Math.max(0, Math.min(1, v));
        return x * x * (3 - 2 * x);
      };
      function resize() {
        const rect = mount.getBoundingClientRect();
        const nextWidth = Math.max(1, Math.round(rect.width));
        const nextHeight = Math.max(1, Math.round(rect.height));
        if (nextWidth === widthPx && nextHeight === heightPx) return;
        widthPx = nextWidth;
        heightPx = nextHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.setSize(widthPx, heightPx, false);
        camera.aspect = widthPx / heightPx;
        camera.updateProjectionMatrix();
      }
      function render() {
        requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        resize();
        const now = clock.getElapsedTime();
        const intro = ease(now / 1.6);
        const elapsed = opened ? now - openingAt : 0;
        const open = opened ? ease(elapsed / 1.35) : (reduceMotion.matches ? .02 : 0);
        const turnOne = opened ? ease((elapsed - 1.05) / .95) : 0;
        const turnTwo = opened ? ease((elapsed - 1.72) / .96) : 0;
        hinge.rotation.y = -Math.PI * .95 * open;
        leaves[0].visible = opened && elapsed > .95;
        leaves[1].visible = opened && elapsed > 1.62;
        leaves[0].rotation.y = -Math.PI * turnOne;
        leaves[1].rotation.y = -Math.PI * turnTwo;
        const breathing = reduceMotion.matches ? 0 : Math.sin(now * .58) * .012;
        book.position.y = -.11 * (1 - intro) + breathing;
        book.rotation.set(-.09 + pointerY * .045, .32 + pointerX * .12, -.035 + pointerX * .025);
        camera.position.z = (camera.aspect < .8 ? 7.55 : 7.2) + open * (camera.aspect < .8 ? 3.35 : 2.85);
        renderer.render(scene, camera);
        if (resolveOpen && elapsed >= 3.02) {
          resolveOpen(true);
          resolveOpen = null;
        }
      }
      render();
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { threshold: .01 }).observe(stage);
      stage.addEventListener("pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
        pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      });
      stage.addEventListener("pointerleave", () => { pointerX = 0; pointerY = 0; });
      window.libroxBookScene = {
        open() {
          if (opened) return Promise.resolve();
          opened = true;
          openingAt = clock.getElapsedTime();
          stage.classList.add("is-opening");
          if (reduceMotion.matches) return Promise.resolve();
          return new Promise((resolve) => { resolveOpen = resolve; });
        },
        reset() {
          opened = false;
          stage.classList.remove("is-opening");
          if (resolveOpen) {
            resolveOpen(false);
            resolveOpen = null;
          }
          leaves.forEach((leaf) => { leaf.visible = false; });
          hinge.rotation.y = 0;
        }
      };
    } catch (error) {
      console.warn("Book render unavailable; showing the cover artwork.", error);
      canvas.remove();
    }
  }
}
