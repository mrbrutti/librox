"""Natural background and recorded paper foley; see sources/README.md.

No oscillators, synthetic noise, pitch shifting, or fake hardware sounds.
The 144-second nature arrangement runs independently of the films.
"""
from pathlib import Path
import json
import subprocess
import numpy as np
from scipy.signal import butter, sosfiltfilt
import soundfile as sf

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parents[1]
SR = 48000
REVIEW = SITE / '.local/audio/natural'
REVIEW.mkdir(parents=True, exist_ok=True)


def read(name, low, high):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i',
        str(ROOT / 'sources' / (name + '.mp3')), '-f', 'f32le',
        '-ar', str(SR), '-ac', '2', '-'])
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    return sosfiltfilt(butter(2, [low, high], fs=SR,
        btype='bandpass', output='sos'), x, axis=0)


def edges(x, seconds):
    """Soften cuts outside the naturally recorded gesture."""
    n = min(round(seconds * SR), len(x) // 2)
    fade = np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    x[:n] *= fade[:, None]
    x[-n:] *= fade[::-1, None]
    return x


def report(name, x):
    return dict(scene=name, seconds=len(x) / SR, sampleRate=SR,
        peakDBFS=float(20 * np.log10(np.max(abs(x)) + 1e-12)),
        rmsDBFS=float(20 * np.log10(np.sqrt(np.mean(x*x)) + 1e-12)),
        loopEdgeDelta=float(np.max(abs(x[0] - x[-1]))))


# Complete calls at original pitch/speed, spaced like a bird outside a room.
# The quiet interval across the boundary has the same range as interior gaps.
bird = read('blackbird', 950, 5800)
bird *= 10**(-33/20) / np.max(abs(bird))
phrases = [
    (2.0, 4.25, 8.75, .85), (20.3, 13.65, 17.75, .66),
    (39.7, 27.00, 29.50, .75), (60.6, 32.75, 36.25, .62),
    (82.2, 40.25, 44.25, .80), (103.5, 44.75, 49.25, .63),
    (125.8, 55.25, 57.75, .70),
]
nature = np.zeros((144 * SR, 2))
for start, source_in, source_out, gain in phrases:
    phrase = edges(bird[round(source_in*SR):round(source_out*SR)].copy(), .22)
    begin = round(start * SR)
    nature[begin:begin+len(phrase)] += phrase * gain
assert np.max(abs(nature[0])) == np.max(abs(nature[-1])) == 0
sf.write(REVIEW / 'nature-master.wav', nature, SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(REVIEW / 'nature-master.wav'),
    '-ar', '32000', '-c:a', 'libmp3lame', '-q:a', '4',
    str(SITE / 'assets/librox-nature.mp3')], check=True)

# Preserve each recording's lift, flex and settle. Align the loudest 10 ms
# of paper friction with the visible turn's crest, instead of the clip start.
papers = []
for name, cut_out in [('page-1', .51), ('page-2', 1.28)]:
    paper = edges(read(name, 160, 7500)[:round(cut_out*SR)].copy(), .018)
    ceiling = np.quantile(np.abs(paper), .9995) * 1.8
    paper = ceiling * np.tanh(paper / ceiling)
    paper *= 10**(-32/20) / np.max(abs(paper))
    window = 480
    energy = np.mean(paper[:len(paper)//window*window].reshape(-1, window, 2)**2, axis=(1,2))
    crest = (int(np.argmax(energy)) + .5) * window / SR
    papers.append((paper, crest))

scenes = {
    'studio': (22, [(5.175, 1, .55), (6.725, 0, .45), (8.83, 1, .72), (11.0, 0, .64)]),
    'family': (24, [(.83, 1, .72), (2.97, 0, .62), (4.83, 1, .64), (15.07, 0, .54)]),
}
reports = [dict(**report('nature', nature), phrases=phrases,
    source='Blackbird (isolated), richwise, Freesound 811988, CC0')]
for name, (duration, events) in scenes.items():
    out = np.zeros((duration * SR, 2))
    for crest_time, variant, gain in events:
        paper, crest = papers[variant]
        begin = round((crest_time - crest) * SR)
        assert begin >= 0 and begin + len(paper) < len(out)
        out[begin:begin+len(paper)] += paper * gain
    sf.write(ROOT / f'{name}-soundscape.wav', out, SR, subtype='PCM_24')
    reports.append(dict(**report(name, out), events=events,
        source='Page Turn (1) and (2), OwlStorm / Ashe Kirk, CC0'))

# Review the actual nature join without adding an artificial preview fade.
join = np.concatenate((nature[-20*SR:], nature[:20*SR]))
sf.write(REVIEW / 'loop-join.wav', join, SR, subtype='PCM_16')
sf.write(REVIEW / 'nature-preview.wav', nature[:30*SR], SR, subtype='PCM_16')
(ROOT / 'soundscape-manifest.json').write_text(json.dumps(reports, indent=2)+'\n')
print(json.dumps(reports, indent=2))
