import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, Float32BufferAttribute,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, DirectionalLight, HemisphereLight,
  Vector3, Color, DoubleSide, SRGBColorSpace, ACESFilmicToneMapping, ShadowMaterial, PCFShadowMap,
} from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import fontData from './assets/fonts/newsreader-scene.json';

const font = new FontLoader().parse(fontData);
const smooth = x => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const point = new Vector3();
const paper = new Color(0xf5f0db), ink = new Color(0x123323);
const paperEdge = new Color(0x858f79), inkEdge = new Color(0x091e14);
const yieldToBrowser = () => globalThis.scheduler?.yield
  ? scheduler.yield() : new Promise(resolve => setTimeout(resolve, 0));

// The approved film supplies the pixels. These colorless solids supply its
// exact depth, so real extruded letters can pass both behind and in front.
export async function createSpatialType(section, kind) {
  await yieldToBrowser();
  const renderer = new WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.className = 'scene-type-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const camera = new PerspectiveCamera();
  camera.matrixAutoUpdate = false;
  const occlusion = new MeshBasicMaterial({colorWrite:false, depthWrite:true, side:DoubleSide});
  const contactShadow = new ShadowMaterial({color:0x102219, opacity:.11, depthWrite:false});
  const face = new MeshStandardMaterial({color:0xf5f0db, roughness:.42, metalness:.08, transparent:true});
  const edge = new MeshStandardMaterial({color:0x858f79, roughness:.38, metalness:.22, transparent:true});
  scene.add(new HemisphereLight(0xf9fff0, 0x182d22, 2));
  const key = new DirectionalLight(0xe9fff3, 3.2);
  key.position.set(-7,-6,12);
  key.target.position.set(0,0,3.3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera, {left:-16,right:16,top:16,bottom:-16,near:.5,far:65});
  key.shadow.normalBias = .02;
  key.shadow.bias = -.00015;
  key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new DirectionalLight(0xffecd2, 2.2);
  rim.position.set(7,3,10); scene.add(rim);

  const specs = kind === 'studio' ? [
    {beat:'library', text:'Librox', slot:'brand'},
    {beat:'reading', text:'One more', slot:'upper'},
    {beat:'reading', text:'page.', slot:'lower'},
    {beat:'listening', text:'Listen.', slot:'brand'},
  ] : [
    {beat:'reading', text:'Get', slot:'upper'},
    {beat:'reading', text:'lost.', slot:'lower'},
    {beat:'listening', text:'Drift', slot:'upper'},
    {beat:'listening', text:'away.', slot:'lower'},
    {beat:'mac', text:'Stay', slot:'upper'},
    {beat:'mac', text:'a while.', slot:'lower'},
  ];
  const words = [];
  for (const spec of specs) {
    // Triangulate one word per task so controls and the film remain responsive
    // while the decorative enhancement is prepared on slower phones.
    await yieldToBrowser();
    const geometry = new TextGeometry(spec.text, {font, size:1, depth:.045,
      curveSegments:8, bevelEnabled:true, bevelThickness:.008, bevelSize:.004,
      bevelSegments:2, steps:1});
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const wordWidth = bounds.max.x - bounds.min.x;
    const wordHeight = bounds.max.y - bounds.min.y;
    geometry.translate(-(bounds.min.x + bounds.max.x)/2, -(bounds.min.y + bounds.max.y)/2, -.0225);
    const materials = [face.clone(), edge.clone()];
    const mesh = new Mesh(geometry, materials);
    mesh.renderOrder = 1;
    mesh.castShadow = true;
    scene.add(mesh);
    words.push({...spec, mesh, width:wordWidth, height:wordHeight});
  }
  let data;
  let solids = [];
  let receivers = [];
  let size = {width:1, height:1, mediaX:0, mediaY:0, mediaWidth:1, mediaHeight:1};
  let lost = false;
  let prepared = false;
  let warming = null;
  let latestFrame = null;
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; section.classList.remove('has-spatial-type');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    lost = false; prepared = false; warming = null;
    if (latestFrame) render(...latestFrame);
  });
  section.append(renderer.domElement);

  function setGeometry(next) {
    if (data === next) return;
    data = next;
    for (const mesh of solids) { scene.remove(mesh); mesh.geometry.dispose(); }
    receivers.forEach(mesh => scene.remove(mesh));
    receivers = [];
    solids = data.spatial.meshes.map(source => {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(source.positions, 3));
      geometry.setIndex(source.indices);
      geometry.computeVertexNormals();
      const mesh = new Mesh(geometry, occlusion);
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = -1;
      scene.add(mesh);
      const receiver = new Mesh(geometry, contactShadow);
      receiver.matrixAutoUpdate = false;
      receiver.receiveShadow = true;
      receiver.renderOrder = 2;
      scene.add(receiver);
      receivers.push(receiver);
      return mesh;
    });
  }
  function resize(next) {
    size = next;
    renderer.setSize(size.width, size.height, false);
  }
  function render(frame, time, weights, reduced) {
    if (!data || lost) return;
    latestFrame = [frame, time, weights, reduced];
    if (warming && !prepared) return;
    const pose = data.spatial.poses[frame];
    camera.matrix.fromArray(pose.camera);
    camera.matrixWorld.copy(camera.matrix);
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
    camera.projectionMatrix.fromArray(pose.projection);
    const p = camera.projectionMatrix.elements;
    const sx = size.mediaWidth / size.width, sy = size.mediaHeight / size.height;
    const ox = (size.mediaX + size.mediaWidth/2) / size.width * 2 - 1;
    const oy = 1 - (size.mediaY + size.mediaHeight/2) / size.height * 2;
    p[0] *= sx; p[5] *= sy; p[8] = p[8]*sx - ox; p[9] = p[9]*sy - oy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    solids.forEach((mesh, i) => {
      mesh.matrix.fromArray(pose.groups[i]); receivers[i].matrix.copy(mesh.matrix);
    });
    contactShadow.opacity = Math.max(...Object.values(weights)) * .11;
    const mobile = size.width <= 760;
    const portrait = size.width / size.height < 1.1;
    const phase = time * Math.PI * 2 / (kind === 'studio' ? 22 : 24);
    const macro = kind === 'studio' ? smooth((time-7)/2)*(1-smooth((time-11)/2)) : 0;
    for (const word of words) {
      const weight = weights[word.beat] || 0;
      word.mesh.visible = weight > .005;
      if (!word.mesh.visible) continue;
      const lower = word.slot === 'lower';
      const brand = word.slot === 'brand';
      let x, y, width, depth, angle;
      if (kind === 'studio') {
        const compact = mobile || portrait;
        x = lower ? (compact ? .57 : .54 + .12*macro) : .5;
        y = lower ? (compact ? .63 : .73) : brand ? .31 : .24;
        if (word.beat === 'library' && time < 4) y -= .06*smooth(time/4);
        if (word.beat === 'listening') y = mobile ? .31 : .26;
        width = lower ? (compact ? .54 : .38 + .09*macro) : compact ? .84 : (brand ? .88 : .91);
        // The top line crosses the body depth. During the reading close-up it
        // advances with the camera, keeping the full phrase recoverable.
        const brandDepth = word.beat === 'listening' ? 1 + .012*Math.sin((time-12.3)*Math.PI/6.5)
          : time < 4 ? .94 + .055*smooth(time/4) : .94;
        depth = pose.depth * (lower ? .72 : brand ? brandDepth : 1.005 - .225*macro);
        angle = lower ? -.16 : -.24;
      } else {
        x = lower ? (word.beat === 'mac' ? .64 : .70) : .29;
        y = lower ? (mobile ? .64 : .73) : (mobile ? .25 : .19);
        width = lower ? (word.beat === 'mac' ? .57 : .43) : .43;
        depth = pose.depth * (lower ? .75 : .965);
        angle = lower ? -.19 : -.22;
      }
      // Preserve the tall letters on wide, short screens without clipping the
      // header or controls. Narrow screens are constrained by the word width.
      const heightLimit = lower ? .26 : brand ? .28 : .22;
      width = Math.min(width, size.height/size.width * heightLimit * word.width/word.height);
      const drift = reduced ? 0 : Math.sin(phase + (lower ? .7 : 0));
      x += drift * (lower ? -.012 : .012);
      y += (1-weight) * (lower ? .025 : -.025);
      point.set(((x*2-1)+p[8])*depth/p[0], ((1-y*2)+p[9])*depth/p[5], -depth);
      word.mesh.position.copy(point.applyMatrix4(camera.matrixWorld));
      word.mesh.quaternion.copy(camera.quaternion);
      word.mesh.rotateY(angle + drift*.065);
      word.mesh.rotateX(lower ? -.06 : .035);
      word.mesh.rotateZ((lower ? .025 : -.018) + drift*.008);
      const scale = (width * 2 * depth / p[0]) / word.width;
      word.mesh.scale.setScalar(scale);
      word.mesh.material.forEach(material => { material.opacity = weight; });
      // On the white paper close-up the type takes the book's deep green ink,
      // preserving the same light direction and enough contrast to read it.
      const inkMix = kind === 'studio' && lower
        ? smooth((time-4.2)/.7) * (1-smooth((time-11.5)/.8)) : macro;
      word.mesh.material[0].color.copy(paper).lerp(ink, inkMix);
      word.mesh.material[1].color.copy(paperEdge).lerp(inkEdge, inkMix);
    }
    if (!prepared) {
      // Compile in parallel when the GPU supports it. Rendering immediately
      // after construction used to synchronously stall the entire page.
      warming = renderer.compileAsync(scene, camera).then(() => {
        prepared = true;
        if (latestFrame) render(...latestFrame);
      }).catch(() => { section.classList.remove('has-spatial-type'); });
      return;
    }
    renderer.render(scene, camera);
    section.classList.add('has-spatial-type');
  }
  return {setGeometry, resize, render};
}
