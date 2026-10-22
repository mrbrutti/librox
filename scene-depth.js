/* Typography shares the rendered cameras. Silhouettes come from the same
   Blender geometry and frame poses as the approved films, not screen guesses. */
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
    const weights = kind === 'studio'
      ? {library: envelope(t, 18, 4.5, duration), reading: envelope(t, 3.7, 12.6, duration), listening: envelope(t, 11.8, 18.8, duration)}
      : {reading: envelope(t, 23, 6.3, duration), listening: Math.max(envelope(t, 5.5, 11.6, duration), envelope(t, 17.5, 23.8, duration)), mac: envelope(t, 10.8, 18.3, duration)};
    beats.forEach((beat, index) => {
      const weight = weights[beat.dataset.typeBeat] || 0;
      beat.style.opacity = weight.toFixed(3);
      // The slow counter-movement follows the camera; there is no idle timer.
      const travel = reduced.matches ? 0 : Math.sin(t / duration * Math.PI * 2 + index * .6) * width * .015;
      const lift = reduced.matches ? 0 : (1 - weight) * height * .035;
      beat.style.transform = `translate3d(${travel.toFixed(2)}px,${lift.toFixed(2)}px,0)`;
    });
    layer.classList.add('has-depth');
    section.classList.add('has-depth');
  }
  function fit() {
    width = section.clientWidth;
    height = section.clientHeight;
    if (!geometry) return;
    // Matches object-fit: cover, including portrait cropping and browser resize.
    const box = media.getBoundingClientRect();
    const scene = section.getBoundingClientRect();
    const scale = Math.max(box.width / geometry.width, box.height / geometry.height);
    const w = geometry.width * scale;
    const h = geometry.height * scale;
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
    if (!cache.has(next)) cache.set(next, fetch(next).then(response => {
      if (!response.ok) throw new Error('Scene geometry unavailable');
      return response.json();
    }));
    cache.get(next).then(data => {
      if (source !== next) return;
      geometry = data;
      fit();
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
      callback = video.requestVideoFrameCallback((_, metadata) => { paint(metadata.mediaTime); schedule(); });
    } else {
      callback = requestAnimationFrame(() => { paint(); schedule(); });
    }
  }
  video.addEventListener('playing', () => { selectSource(); paint(); schedule(); });
  video.addEventListener('pause', () => { stop(); paint(); });
  video.addEventListener('seeked', () => { paint(); schedule(); });
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
