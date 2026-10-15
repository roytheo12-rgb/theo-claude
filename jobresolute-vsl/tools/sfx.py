#!/usr/bin/env python3
"""Effets sonores synthétisés (aucune banque de sons, donc aucun droit à gérer).

Chaque séquence HTML déclare ses sons : window.SFX = [[temps, 'type', gain], ...]
build.py les place sur la timeline de l'acte, ajoute un son par transition, et mixe le tout en WAV 48 kHz stéréo.

Types : whoosh, swish_l, swish_r, impact, tap, click, tick, pop, chime, notif, riser, type, land, dive, shimmer
"""
import math, wave
import numpy as np

SR = 48000
RNG = np.random.default_rng(7)


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(n, a, r):
    """Attaque linéaire a (s), puis déclin exponentiel de constante r (s)."""
    t = np.arange(n) / SR
    e = np.exp(-np.maximum(t - a, 0) / r)
    if a > 0:
        e *= np.clip(t / a, 0, 1)
    return e


def _lowpass(x, cutoff):
    """Passe-bas à un pôle ; cutoff peut varier dans le temps (tableau)."""
    cut = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * math.pi * cut / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s)
        y[i] = s
    return y


def _sine_glide(d, f0, f1):
    t = _t(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * math.pi * np.cumsum(f) / SR)


def _st(mono, pan=0.0):
    """Mono → stéréo, pan de -1 (gauche) à 1 (droite), constant ou tableau."""
    p = np.broadcast_to(np.asarray(pan, dtype=float), mono.shape)
    l = np.cos((p + 1) * math.pi / 4)
    r = np.sin((p + 1) * math.pi / 4)
    return np.stack([mono * l, mono * r], 1)


def whoosh(d=0.6, f_lo=250, f_hi=3800, pan0=-0.3, pan1=0.3):
    n = int(d * SR)
    x = RNG.standard_normal(n)
    u = np.linspace(0, 1, n)
    shape = np.sin(np.pi * np.clip(u / 0.62, 0, 1) * 0.5) ** 2 * np.where(u < 0.62, 1, np.exp(-(u - 0.62) / 0.12))
    y = _lowpass(x, f_lo + (f_hi - f_lo) * shape)
    y = _lowpass(y, f_lo + (f_hi - f_lo) * shape)
    return _st(y * shape * 0.9, np.linspace(pan0, pan1, n))


def impact():
    d = 1.2
    t = _t(d)
    body = _sine_glide(d, 78, 42) * _env(len(t), 0.003, 0.32)
    hit = _lowpass(RNG.standard_normal(len(t)), 900) * _env(len(t), 0.001, 0.02) * 2.5
    return _st((body * 0.9 + hit) * 0.9)


def tap():
    d = 0.12
    n = int(d * SR)
    s = _sine_glide(d, 1500, 850) * _env(n, 0.001, 0.025)
    c = np.diff(RNG.standard_normal(n + 1)) * _env(n, 0, 0.003) * 0.25
    return _st((s + c) * 0.8)


def click():
    n = int(0.03 * SR)
    c = np.diff(RNG.standard_normal(n + 1)) * _env(n, 0, 0.004)
    return _st(c * 0.35)


def tick():
    d = 0.06
    return _st(np.sin(2 * math.pi * 2700 * _t(d)) * _env(int(d * SR), 0.001, 0.012) * 0.45)


def pop():
    d = 0.1
    return _st(_sine_glide(d, 480, 1150) * _env(int(d * SR), 0.002, 0.03) * 0.6)


def land():
    d = 0.25
    n = int(d * SR)
    s = _sine_glide(d, 150, 90) * _env(n, 0.002, 0.06)
    c = _lowpass(RNG.standard_normal(n), 2500) * _env(n, 0, 0.008)
    return _st((s + c * 0.6) * 0.7)


def chime(freqs=(1046.5, 1568.0, 2093.0), d=1.6):
    t = _t(d)
    y = sum(np.sin(2 * math.pi * f * t) * (0.5 ** k) for k, f in enumerate(freqs))
    return _st(y * _env(len(t), 0.004, 0.45) * 0.35)


def notif():
    a = chime((1318.5, 2637.0), 0.6)
    b = chime((1760.0, 3520.0), 0.7)
    out = np.zeros((int(0.8 * SR), 2))
    out[:len(a)] += a
    o = int(0.09 * SR)
    out[o:o + len(b)] += b[:len(out) - o]
    return out


def riser(d=1.0):
    n = int(d * SR)
    u = np.linspace(0, 1, n)
    y = _lowpass(RNG.standard_normal(n), 200 + 6000 * u ** 2) * u ** 2
    tone = np.sin(2 * math.pi * np.cumsum(300 + 600 * u) / SR) * u ** 3 * 0.25
    return _st((y + tone) * 0.6)


def typing(d=0.8, rate=14):
    out = np.zeros((int(d * SR), 2))
    k = 0.0
    while k < d - 0.03:
        c = click() * (0.6 + 0.4 * RNG.random())
        i = int(k * SR)
        out[i:i + len(c)] += c[:len(out) - i]
        k += (1 / rate) * (0.6 + 0.8 * RNG.random())
    return out


def dive():
    w = whoosh(1.1, 150, 2500, -0.1, 0.1)
    t = _t(1.1)
    rumble = _st(np.sin(2 * math.pi * 55 * t) * np.sin(np.pi * np.linspace(0, 1, len(t))) * 0.4)
    return w + rumble


def shimmer():
    c = chime((1567.98, 2349.3, 3135.96), 2.0) * 0.8
    air = _st(_lowpass(np.diff(RNG.standard_normal(len(c) + 1)), 9000) * _env(len(c), 0.3, 0.6) * 0.025)
    return c + air


SOUNDS = {
    'whoosh': lambda: whoosh(),
    'swish_l': lambda: whoosh(0.45, 600, 5200, 0.7, -0.7),
    'swish_r': lambda: whoosh(0.45, 600, 5200, -0.7, 0.7),
    'impact': impact, 'tap': tap, 'click': click, 'tick': tick, 'pop': pop, 'land': land,
    'chime': chime, 'notif': notif, 'riser': riser, 'type': typing, 'dive': dive, 'shimmer': shimmer,
}
_CACHE = {}


def render(cues, duration, out_path, master=0.5):
    """cues : liste de (temps_s, type, gain). Écrit un WAV 48 kHz stéréo 16 bits."""
    mix = np.zeros((int(duration * SR) + SR, 2))
    for t0, kind, gain in cues:
        if kind not in _CACHE:
            _CACHE[kind] = SOUNDS[kind]()
        s = _CACHE[kind] * gain
        i = max(0, int(t0 * SR))
        j = min(len(mix), i + len(s))
        mix[i:j] += s[:j - i]
    mix = mix[:int(duration * SR)]
    peak = np.abs(mix).max() or 1
    mix = mix / peak * master
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return out_path
