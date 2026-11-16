/* Synthesised sounds (WebAudio) — no audio files. Unlocked on first touch. */
(function (LG) {
  'use strict';
  const A = (LG.audio = {});
  const KEY = 'little-garden-muted';
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  let ctx = null, master = null, muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* private mode */ }

  A.unlock = function () {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  A.isMuted = () => muted;
  A.setMuted = function (m) {
    muted = !!m;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (master) master.gain.value = muted ? 0 : 0.5;
  };

  function tone(freq, at, dur, type, vol, slideTo) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + (at || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function bell(freq, at, dur, vol) {
    tone(freq, at, dur, 'sine', vol || 0.3);
    tone(freq * 2, at, dur * 0.6, 'triangle', (vol || 0.3) * 0.35);
  }

  A.grab = () => tone(440, 0, 0.09, 'sine', 0.18, 700);
  A.back = () => tone(520, 0, 0.2, 'sine', 0.1, 360);
  A.success = (i) => bell(SCALE[(i || 0) % SCALE.length], 0, 0.45, 0.32);
  A.munch = function () { tone(180, 0, 0.07, 'triangle', 0.2, 120); tone(200, 0.12, 0.07, 'triangle', 0.2, 130); };
  A.beep = function () { tone(880, 0, 0.08, 'square', 0.06); tone(1320, 0.1, 0.1, 'square', 0.06); };
  A.pop = () => tone(300, 0, 0.1, 'sine', 0.2, 900);
  A.yay = function () {
    [0, 2, 3, 5].forEach((n, i) => bell(SCALE[n], i * 0.11, 0.4, 0.28));
    [0, 2, 3].forEach((n) => bell(SCALE[n], 0.5, 0.9, 0.18));
  };
  A.sticker = function () { tone(400, 0, 0.35, 'sine', 0.16, 1300); bell(SCALE[5], 0.38, 0.6, 0.28); };
  A.fanfare = function () {
    const seq = [0, 0, 2, 3, 2, 3, 5, 3, 5, 7];
    seq.forEach((n, i) => bell(SCALE[n], i * 0.16, 0.5, 0.26));
    [0, 2, 3, 5].forEach((n) => bell(SCALE[n], seq.length * 0.16, 1.4, 0.16));
  };
})(window.LG);
