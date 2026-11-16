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
  function ring(x, y, r0, r1, color, w) {
    add({ x: x, y: y, vx: 0, vy: 0, g: 0, drag: 1, rot: 0, vr: 0, size: w, color: color, shape: 'ring', r0: r0, r1: r1, life: 0, max: 0.55 });
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
      if (p.shape === 'ring') {
        g.globalAlpha = fade * 0.9; g.strokeStyle = p.color; g.lineWidth = p.size * (1 - p.life / p.max) + 1;
        g.beginPath(); g.arc(0, 0, p.r0 + (p.r1 - p.r0) * Math.sqrt(p.life / p.max), 0, 7); g.stroke();
      } else if (p.shape === 'heart') {
        const s = p.size * Math.min(1, p.life * 6);
        g.beginPath(); g.moveTo(0, s * 0.9);
        g.bezierCurveTo(-s * 1.6, -s * 0.2, -s * 0.7, -s * 1.3, 0, -s * 0.45);
        g.bezierCurveTo(s * 0.7, -s * 1.3, s * 1.6, -s * 0.2, 0, s * 0.9);
        g.fill(); g.lineWidth = Math.max(2, s * 0.18); g.strokeStyle = '#2b2d5b'; g.lineJoin = 'round'; g.stroke();
      } else if (p.shape === 'star') { star(p.size); if (p.line) { g.lineWidth = 2.5; g.strokeStyle = '#2b2d5b'; g.lineJoin = 'round'; g.stroke(); } }
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
        size: U.rand(opt.s0, opt.s1), color: opt.colors ? U.pick(opt.colors) : opt.color || U.pick(COLORS), line: opt.line,
        shape: opt.shape || U.pick(['rect', 'rect', 'dot', 'star']), life: 0, max: U.rand(opt.t0, opt.t1),
      });
    }
  }

  /* Small star burst where something good just happened. */
  C.sparkle = function (x, y, color, radius) {
    const s = Math.max(1, Math.min(W, H) / 520), r = radius || 60 * s;
    ring(x, y, r * 0.5, r * 1.7, '#ffffff', 10 * s);
    /* outlined yellow and white stars thrown well clear of the target, so its face stays visible */
    burst(x, y, amount(16), { min: 380 * s, max: 760 * s, lift: 120, g: 900, drag: 0.94, s0: 9 * s, s1: 16 * s, t0: 0.7, t1: 1.1, shape: 'star', colors: ['#ffd23f', '#ffffff', '#ffd23f', color || '#ffd23f'], line: true });
    burst(x, y, amount(10), { min: 250 * s, max: 600 * s, lift: 80, g: 700, drag: 0.94, s0: 4 * s, s1: 8 * s, t0: 0.5, t1: 0.9, shape: 'dot', color: '#ffffff' });
  };
  /* A little heart floating up (a fed animal says thank you). */
  C.heart = function (x, y) {
    const s = Math.max(1, Math.min(W, H) / 520);
    add({ x: x, y: y, vx: U.rand(-20, 20), vy: -150 * s, g: -40, drag: 0.99, rot: 0, vr: 0, size: 15 * s, color: '#ff7eb6', shape: 'heart', life: 0, max: 1.3 });
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
    const s = Math.max(1, Math.min(W, H) / 500), a = Math.floor(U.rand(0, COLORS.length));
    const trio = [COLORS[a], COLORS[(a + 3) % COLORS.length], '#ffd23f', '#ffffff'];
    ring(x, y, 10, 110 * s, '#ffffff', 5 * s);
    burst(x, y, amount(46), { min: 150 * s, max: 520 * s, g: 320, drag: 0.97, s0: 6 * s, s1: 12 * s, t0: 0.9, t1: 1.6, shape: 'star', colors: trio });
    burst(x, y, amount(24), { min: 60 * s, max: 300 * s, g: 260, drag: 0.97, s0: 4 * s, s1: 8 * s, t0: 0.8, t1: 1.3, shape: 'dot' });
  };
  /* Several fireworks over a few seconds. */
  C.fireworks = function (count) {
    for (let i = 0; i < count; i++) {
      setTimeout(function () { C.firework(U.rand(W * 0.28, W * 0.9), U.rand(H * 0.1, H * 0.42)); if (LG.audio) LG.audio.pop(); }, i * 420);
    }
  };
})(window.LG);
