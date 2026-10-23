"""Original, seeded ambient sound design. No speech, melody or sampled music.

Soft, slowly moving harmonic air with paper gestures timed to the native films.
NumPy/SciPy/SoundFile only. Every oscillator/noise bed is periodic at the loop
boundary. Paper transients use smooth envelopes and stay well below full scale.
"""
from pathlib import Path
import json
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

ROOT = Path(__file__).resolve().parent
SR = 48000
SEED = 20261022

def filtered_noise(rng, count, low, high):
    raw = rng.normal(size=count)
    return sosfilt(butter(2, [low, high], fs=SR, btype='bandpass', output='sos'), raw)

def ambient(duration):
    rng = np.random.default_rng(SEED)
    n = round(SR * duration)
    t = np.arange(n) / SR
    stereo = np.zeros((n, 2))
    # A quiet open C/add9 color: sustained, with no attacks or tune to follow.
    for midi, weight in [(48,.40),(55,.23),(60,.16),(62,.065),(67,.06)]:
        hz = round((440 * 2**((midi-69)/12)) * duration) / duration
        phase = rng.uniform(0, 2*np.pi)
        breathing = .76 + .15*np.sin(2*np.pi*t/duration + rng.uniform(0,6))
        breathing += .045*np.sin(4*np.pi*t/duration + rng.uniform(0,6))
        for ch in range(2):
            # Small phase separation gives width without detuned beating.
            angle = 2*np.pi*hz*t + phase + ch*.12
            wave = np.sin(angle) + .10*np.sin(2*angle+.4) + .018*np.sin(3*angle)
            stereo[:,ch] += weight * wave * breathing
    # Colored, periodic air. No hiss above 2.8 kHz, no rumble below 110 Hz.
    freqs = np.fft.rfftfreq(n, 1/SR)
    shape = 1/np.sqrt(np.maximum(freqs,110))
    shape *= (1-np.exp(-(freqs/140)**4)) * np.exp(-(freqs/2300)**4)
    for ch in range(2):
        spectrum = (rng.normal(size=len(freqs)) + 1j*rng.normal(size=len(freqs))) * shape
        air = np.fft.irfft(spectrum, n=n)
        air /= np.std(air)
        stereo[:,ch] += air * .055 * (.85+.15*np.sin(2*np.pi*t/duration+ch*.3))
    stereo *= .034
    return stereo

def gesture(rng, kind, duration):
    n = round(duration*SR); t = np.arange(n)/SR; u = t/duration
    if kind == 'page':
        body = filtered_noise(rng,n,420,3200)
        body += .25*filtered_noise(rng,n,140,650)
        envelope = np.sin(np.pi*u)**1.9
        envelope *= 1 + .14*np.sin(2*np.pi*19*t) * np.sin(np.pi*u)
        peak = .020  # paper is a small foreground detail, not a cinematic whoosh
    else:
        body = filtered_noise(rng,n,130,950)
        envelope = np.sin(np.pi*u)**2.4
        peak = .007 if kind == 'fold' else .0045
    mono = body*envelope
    mono *= peak/max(np.max(np.abs(mono)),1e-9)
    pan = np.linspace(.25,-.25,n)
    return np.column_stack((mono*np.sqrt((1-pan)/2),mono*np.sqrt((1+pan)/2)))

# Starts align the crest of each paper gesture with the visible turn.
SCENES = {
    'studio': dict(seconds=22,events=[
        ('fold',.7,2.5),('page',4.65,1.05),('page',6.30,.85),
        ('page',8.405,.85),('page',10.575,.85),
        ('transition',11.85,.7),('fold',15.25,2.1)]),
    'family': dict(seconds=24,events=[
        ('page',.405,.85),('page',2.545,.85),('page',4.405,.85),
        ('transition',5.55,.7),('fold',10.2,1.5),
        ('page',14.745,.65),('transition',17.55,.7),('fold',22.15,1.5)])
}

reports=[]
for name,scene in SCENES.items():
    duration=scene['seconds']; out=ambient(duration)
    rng=np.random.default_rng(SEED+len(name))
    for kind,start,length in scene['events']:
        g=gesture(rng,kind,length); idx=round(start*SR)
        out[idx:idx+len(g)] += g
        # A tiny diffuse room tail: low-pass, below the paper's direct sound.
        tail=sosfilt(butter(1,1800,fs=SR,output='sos'),g,axis=0)
        for delay,gain in [(.047,.10),(.089,.055),(.151,.025)]:
            begin=idx+round(delay*SR); end=min(len(out),begin+len(tail))
            out[begin:end] += tail[:end-begin]*gain
    out *= 2.0
    assert np.isfinite(out).all() and np.max(abs(out))<.10
    filename=ROOT/f'{name}-soundscape.wav'
    sf.write(filename,out,SR,subtype='PCM_24')
    reports.append(dict(scene=name,seed=SEED,sampleRate=SR,seconds=duration,
        peakDBFS=20*np.log10(np.max(abs(out))),rmsDBFS=20*np.log10(np.sqrt(np.mean(out*out))),
        loopEdgeDelta=float(np.max(abs(out[0]-out[-1]))),events=scene['events']))
(ROOT/'soundscape-manifest.json').write_text(json.dumps(reports,indent=2)+'\n')
print(json.dumps(reports,indent=2))
