/* Particle effects on the #fx canvas: sparkles, confetti, fireworks. */
(function (LG) {
  'use strict';
  const U = LG.util;
  const C = (LG.celebrate = {});
  const COLORS = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#3ddc84', '#3fa9f5', '#9b6bff', '#ff7eb6', '#1fd1c1'];
  let canvas, g, W = 0, H = 0, dpr = 1, parts = [], running = false, last = 0;

  C.init = function (el) {
    canvas = el; g = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
  }
  function amount(n) { return Math.round(U.reducedMotion() ? n * 0.3 : n); }
  function add(p) {
    if (parts.length > 700) return;
    parts.push(p);
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }
  function star(r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  }
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    parts = parts.filter(function (p) {
      p.life += dt;
      if (p.life > p.max || p.y > H + 40) return false;
      p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const fade = Math.min(1, (p.max - p.life) / 0.35);
      g.save();
      g.globalAlpha = fade;
      g.translate(p.x, p.y); g.rotate(p.rot);
      g.fillStyle = p.color;
      if (p.shape === 'star') star(p.size);
      else if (p.shape === 'dot') { g.beginPath(); g.arc(0, 0, p.size * 0.6, 0, 7); g.fill(); }
      else { g.scale(1, Math.cos(p.life * p.flip)); g.fillRect(-p.size * 0.7, -p.size * 0.4, p.size * 1.4, p.size * 0.8); }
      g.restore();
      return true;
    });
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; g.clearRect(0, 0, W, H); }
  }
  function burst(x, y, n, opt) {
    for (let i = 0; i < n; i++) {
      const a = U.rand(0, Math.PI * 2), sp = U.rand(opt.min, opt.max);
      add({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.lift || 0),
        g: opt.g, drag: opt.drag || 0.985, rot: U.rand(0, 6), vr: U.rand(-8, 8), flip: U.rand(6, 14),
        size: U.rand(opt.s0, opt.s1), color: opt.color || U.pick(COLORS),
        shape: opt.shape || U.pick(['rect', 'rect', 'dot', 'star']), life: 0, max: U.rand(opt.t0, opt.t1),
      });
    }
  }

  /* Small star burst where something good just happened. */
  C.sparkle = function (x, y, color) {
    burst(x, y, amount(14), { min: 120, max: 420, lift: 80, g: 500, s0: 6, s1: 13, t0: 0.5, t1: 0.9, shape: 'star', color: color });
    burst(x, y, amount(8), { min: 80, max: 300, lift: 60, g: 400, s0: 4, s1: 8, t0: 0.4, t1: 0.8, shape: 'dot', color: '#ffffff' });
  };
  /* Round finished: two cannons from the bottom corners plus a shower. */
  C.confetti = function () {
    const s = Math.max(1, Math.min(W, H) / 500);
    [[0, 1], [W, -1]].forEach(function (c) {
      for (let i = 0; i < amount(60); i++) {
        add({
          x: c[0], y: H * 0.85, vx: c[1] * U.rand(200, 900) * s, vy: -U.rand(600, 1300) * s,
          g: 1300, drag: 0.985, rot: U.rand(0, 6), vr: U.rand(-10, 10), flip: U.rand(6, 14),
          size: U.rand(8, 15) * s, color: U.pick(COLORS), shape: U.pick(['rect', 'rect', 'dot', 'star']),
          life: 0, max: U.rand(1.8, 3),
        });
      }
    });
    for (let i = 0; i < amount(50); i++) {
      add({
        x: U.rand(0, W), y: U.rand(-H * 0.4, -10), vx: U.rand(-60, 60), vy: U.rand(150, 380),
        g: 250, drag: 0.995, rot: U.rand(0, 6), vr: U.rand(-8, 8), flip: U.rand(6, 14),
        size: U.rand(8, 14) * s, color: U.pick(COLORS), shape: 'rect', life: 0, max: U.rand(2.5, 4),
      });
    }
  };
  C.firework = function (x, y) {
    const s = Math.max(1, Math.min(W, H) / 500), color = U.pick(COLORS);
    burst(x, y, amount(46), { min: 150 * s, max: 520 * s, g: 320, drag: 0.97, s0: 6 * s, s1: 12 * s, t0: 0.9, t1: 1.6, shape: 'star', color: color });
    burst(x, y, amount(24), { min: 60 * s, max: 300 * s, g: 260, drag: 0.97, s0: 4 * s, s1: 8 * s, t0: 0.8, t1: 1.3, shape: 'dot' });
  };
  /* Several fireworks over a few seconds. */
  C.fireworks = function (count) {
    for (let i = 0; i < count; i++) {
      setTimeout(function () { C.firework(U.rand(W * 0.12, W * 0.88), U.rand(H * 0.12, H * 0.5)); if (LG.audio) LG.audio.pop(); }, i * 420);
    }
  };
})(window.LG);
