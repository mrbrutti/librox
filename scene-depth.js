/* The film is the clock for both projected studio edges and real 3D type. */
let spatialModule;
function loadSpatialModule() {
  const url = __SPATIAL_TYPE_URL__;
  return spatialModule ||= import(url);
}
export function bindSceneDepth(section, video, media, kind) {
  const layer = section.querySelector('[data-scene-type]');
  const mask = section.querySelector('[data-device-mask]');
  const solid = section.querySelector('[data-solid-device]');
  const blend = section.querySelector('[data-blend-field]');
  const beats = Array.from(layer.querySelectorAll('[data-type-beat]'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  let geometry = null;
  let source = '';
  let lastFrame = -1;
  let callback = 0;
  let width = 0;
  let height = 0;
  let spatial = null;
  let loadingSpatial = false;
  let spatialSize = null;
  let presentedTime = 0;

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  function envelope(t, start, end, duration) {
    // Wrap the opening beat across the film loop without blinking.
    const d = (t - start + duration) % duration;
    const length = (end - start + duration) % duration;
    return smooth(d / .8) * (1 - smooth((d - length + .8) / .8));
  }
  function paint(t = video.currentTime) {
    if (!geometry) return;
    const isPoster = !video.classList.contains('is-ready');
    if (isPoster) t = 0;
    const frame = Math.min(geometry.frames.length - 1, Math.floor(t * geometry.fps + .001));
    if (frame !== lastFrame) {
      mask.setAttribute('d', geometry.frames[frame]);
      if (solid) solid.setAttribute('d', geometry.frames[frame]);
      lastFrame = frame;
    }
    const duration = kind === 'studio' ? 22 : 24;
    // Complete the outgoing phrase before the incoming phrase occupies its
    // space. Overlapping giant words were illegible during the old crossfade.
    const weights = kind === 'studio'
      ? {library: envelope(t, 18.8, 4, duration), reading: envelope(t, 4, 12.3, duration), listening: envelope(t, 12.3, 18.8, duration)}
      : {reading: envelope(t, 23, 6, duration), listening: Math.max(envelope(t, 6, 11.2, duration), envelope(t, 18.1, 23, duration)), mac: envelope(t, 11.2, 18.1, duration)};
    beats.forEach(beat => {
      const weight = weights[beat.dataset.typeBeat] || 0;
      beat.style.opacity = weight.toFixed(3);
      // Match the spatial renderer's steady baseline in the CSS fallback.
      const lift = reduced.matches ? 0 : (1 - weight) * height * .012;
      beat.style.transform = `translate3d(0,${lift.toFixed(2)}px,0)`;
    });
    spatial?.render(frame, t, weights, reduced.matches);
    layer.classList.add('has-depth');
    section.classList.add('has-depth');
  }
  function fit() {
    width = section.clientWidth;
    height = section.clientHeight;
    if (!geometry) return;
    // Matches object-fit: cover, including portrait cropping and browser resize.
    const box = media.getBoundingClientRect();
    const scene = layer.getBoundingClientRect();
    const scale = Math.max(box.width / geometry.width, box.height / geometry.height);
    const w = geometry.width * scale;
    const h = geometry.height * scale;
    spatialSize = {width, height, mediaX:box.left-scene.left+(box.width-w)/2,
      mediaY:box.top-scene.top+(box.height-h)/2, mediaWidth:w, mediaHeight:h};
    spatial?.resize(spatialSize);
    mask.setAttribute('transform', `translate(${box.left - scene.left + (box.width - w) / 2} ${box.top - scene.top + (box.height - h) / 2}) scale(${w / 10000} ${h / 10000})`);
    if (solid) {
      solid.setAttribute('transform', `translate(${(box.width - w) / 2} ${(box.height - h) / 2}) scale(${w / 10000} ${h / 10000})`);
      blend.setAttribute('width', box.width);
      blend.setAttribute('height', box.height);
    }
    lastFrame = -1;
    paint();
  }
  function selectSource() {
    const portrait = kind === 'studio' ? media.clientWidth / media.clientHeight < 1.45 : matchMedia('(max-width:700px)').matches;
    const next = portrait ? video.dataset.portraitMask : video.dataset.wideMask;
    if (next === source) { fit(); return; }
    source = next;
    geometry = null;
    layer.classList.remove('has-depth');
    section.classList.remove('has-depth');
    section.classList.remove('has-spatial-type');
    if (!cache.has(next)) cache.set(next, fetch(next).then(response => {
      if (!response.ok) throw new Error('Scene geometry unavailable');
      return response.json();
    }));
    cache.get(next).then(data => {
      if (source !== next) return;
      geometry = data;
      spatial?.setGeometry(data);
      fit();
      if (!spatial && !loadingSpatial && data.spatial) {
        loadingSpatial = true;
        loadSpatialModule().then(async ({createSpatialType}) => {
          spatial = await createSpatialType(section, kind);
          if (geometry) spatial.setGeometry(geometry);
          if (spatialSize) spatial.resize(spatialSize);
          paint();
        }).catch(() => {
          // Readable HTML remains available if WebGL or the module is blocked.
          section.classList.remove('has-spatial-type');
        });
      }
    }).catch(() => {
      // The real heading, poster, controls and app footage remain usable.
      cache.delete(next);
      layer.classList.remove('has-depth');
    });
  }
  function stop() {
    if ('cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(callback);
    else cancelAnimationFrame(callback);
  }
  function schedule() {
    stop();
    if (video.paused || document.hidden) return;
    if ('requestVideoFrameCallback' in video) {
      callback = video.requestVideoFrameCallback((_, metadata) => {
        presentedTime = metadata.mediaTime; paint(presentedTime); schedule();
      });
    } else {
      callback = requestAnimationFrame(() => {
        presentedTime = video.currentTime; paint(presentedTime); schedule();
      });
    }
  }
  video.addEventListener('playing', () => { selectSource(); paint(); schedule(); });
  video.addEventListener('pause', () => { stop(); paint(presentedTime); });
  video.addEventListener('seeked', () => { presentedTime = video.currentTime; paint(); schedule(); });
  video.addEventListener('error', () => { stop(); paint(0); });
  video.addEventListener('loadstart', selectSource);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => paint());
  const resize = new ResizeObserver(() => {
    if (kind === 'studio' || geometry || video.getAttribute('src')) selectSource();
  });
  resize.observe(media);
  resize.observe(section);
  if (kind === 'studio') selectSource();
}
