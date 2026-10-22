/* Keep geometry creation, GPU setup and rendering off the page's main thread. */
export function createSpatialType(section, kind) {
  return new Promise((resolve, reject) => {
    if (!HTMLCanvasElement.prototype.transferControlToOffscreen) {
      reject(new Error('Offscreen rendering unavailable'));
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.className = 'scene-type-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.append(canvas);
    let worker;
    try { worker = new Worker(__SPATIAL_WORKER_URL__, {type:'module'}); }
    catch (error) { canvas.remove(); reject(error); return; }
    let pending = false;
    let latest = null;
    let failed = false;
    function sendFrame() {
      if (failed || pending || !latest) return;
      pending = true;
      const frame = latest;
      latest = null;
      worker.postMessage({type:'frame', frame});
    }
    function fail() {
      failed = true;
      section.classList.remove('has-spatial-type');
      canvas.remove();
      worker.terminate();
      reject(new Error('Spatial rendering unavailable'));
    }
    worker.addEventListener('error', fail);
    worker.addEventListener('message', ({data}) => {
      if (data.type === 'initialized') resolve({
        setGeometry: geometry => worker.postMessage({type:'geometry', data:{spatial:geometry.spatial}}),
        resize: size => worker.postMessage({type:'size', size}),
        render: (...frame) => { latest = frame; sendFrame(); },
      });
      if (data.type === 'ready') section.classList.add('has-spatial-type');
      if (data.type === 'lost') section.classList.remove('has-spatial-type');
      if (data.type === 'done') { pending = false; sendFrame(); }
      if (data.type === 'error') fail();
    });
    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({type:'init', canvas:offscreen, kind, pixelRatio:devicePixelRatio}, [offscreen]);
    } catch { fail(); }
  });
}
