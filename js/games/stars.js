/* Catch the stars: slide Bolt (with his basket) under slowly falling stars.
   Five catches fill the star meter and finish the round. Missing is silent:
   the star lands softly on the grass and another one comes. */
(function (LG) {
  'use strict';
  const U = LG.util, A = LG.art, INK = A.INK;
  const GOAL = 5, MAX_ON_SCREEN = 2, SPAWN_EVERY = 2200;
  const COLOR_CYCLE = ['yellow', 'pink', 'orange', 'teal', 'purple'];
  let ctx, stage, stars, meter, slots, caught, spawned, lastX, nextSpawn, raf, last, timers, down, finishing, running;

  function meterStar(fill, stroke, sw) {
    return A.svg('<path d="' + A.starPath(50, 53, 44, 24) + '" fill="' + fill + '" stroke="' + stroke +
      '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"/>');
  }
  function buildMeter() {
    meter = U.el('div', 'star-meter');
    slots = [];
    for (let i = 0; i < GOAL; i++) {
      const s = U.el('div', 'slot',
        '<div class="s-empty">' + meterStar('rgba(43,45,91,.14)', INK, 6) + '</div>' +
        '<div class="s-full">' + meterStar(A.COLORS.yellow.b, INK, 6) + '</div>');
      meter.appendChild(s);
      slots.push(s);
    }
    ctx.layer.appendChild(meter);
  }

  function later(fn, ms) {
    const t = setTimeout(function () { timers = timers.filter((x) => x !== t); fn(); }, ms);
    timers.push(t);
  }

  /* ---------- steering Bolt ---------- */
  function onDown(e) {
    if (e.target.closest && e.target.closest('#mute')) return;
    if (e.pointerType !== 'mouse') down = true;
    ctx.robot.moveTo(e.clientX);
  }
  function onMove(e) {
    if (e.target.closest && e.target.closest('#mute')) return;
    if (e.pointerType === 'mouse' || down) ctx.robot.moveTo(e.clientX);
  }
  function onUp() { down = false; }

  /* ---------- stars ---------- */
  function spawn() {
    const W = window.innerWidth, m = ctx.robot.basketMouth();
    let x, tries = 0;
    do { x = U.rand(0.12, 0.88) * W; tries++; }
    while (lastX != null && Math.abs(x - lastX) < W * 0.18 && tries < 20);
    lastX = x;
    const color = COLOR_CYCLE[spawned++ % COLOR_CYCLE.length];
    const el = U.item(A.star(color), 'star');
    el.dataset.color = color;
    const size = 0.7 * Math.min(190, Math.max(96, 0.22 * Math.min(W, window.innerHeight)));
    const y0 = -size * 0.6;
    const dur = U.rand(4.5, 5.5);
    const s = { el: el, color: color, x: x, y: y0, speed: (m.y - y0) / dur, y0: y0, state: 'fall', passed: false };
    el.style.left = x + 'px';
    el.style.top = y0 + 'px';
    el.firstChild.style.setProperty('--sway-delay', '-' + U.rand(0, 3).toFixed(2) + 's');
    ctx.layer.appendChild(el);
    stars.push(s);
  }

  function remove(s) {
    s.el.remove();
    stars = stars.filter((x) => x !== s);
  }

  function land(s) {
    s.state = 'landed';
    s.el.classList.add('landed');
    later(function () { remove(s); }, 1400);
  }

  function catchStar(s, m) {
    s.state = 'caught';
    s.el.classList.add('caught');
    s.el.style.left = m.x + 'px';
    s.el.style.top = (m.y + 6) + 'px';
    later(function () { remove(s); }, 450);
    ctx.robot.catchBounce();
    ctx.success(ctx.robot.basketEl(), s.color);
    const slot = slots[caught];
    caught++;
    if (slot) { slot.classList.add('full'); }
    if (caught >= GOAL) finish();
  }

  function finish() {
    finishing = true;
    stars.forEach(function (s) {
      if (s.state === 'fall') { s.state = 'fading'; s.el.classList.add('fade'); later(function () { remove(s); }, 600); }
    });
    later(function () {
      ctx.robot.setMode('normal');
      later(function () { if (running) ctx.complete(); }, 500);
    }, 700);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const W = window.innerWidth, H = window.innerHeight, m = ctx.robot.basketMouth();

    if (!finishing) {
      nextSpawn -= dt * 1000;
      if (nextSpawn <= 0 && stars.length < MAX_ON_SCREEN) { spawn(); nextSpawn = SPAWN_EVERY; }
      else if (nextSpawn < 0) nextSpawn = 0;
    }

    stars.slice().forEach(function (s) {
      if (s.state !== 'fall') return;
      const span = m.y - s.y0, prog = (s.y - s.y0) / span;
      /* magnet: in the lower part of the fall, drift toward a basket that is nearly there */
      if (!s.passed && prog > 0.55 && Math.abs(m.x - s.x) < W * 0.22) {
        s.x += (m.x - s.x) * Math.min(1, dt * 1.6);
      }
      s.y += s.speed * dt;
      if (!s.passed && s.y >= m.y) {
        s.passed = true;
        if (!finishing && Math.abs(s.x - m.x) <= m.w * 0.6) { catchStar(s, m); return; }
      }
      s.el.style.left = s.x.toFixed(1) + 'px';
      s.el.style.top = s.y.toFixed(1) + 'px';
      if (s.y >= H * 0.92) { s.y = H * 0.92; s.el.style.top = s.y + 'px'; land(s); }
    });
  }

  function start(c) {
    ctx = c;
    stage = document.getElementById('stage');
    stars = []; caught = 0; spawned = 0; lastX = null; timers = []; down = false; finishing = false; running = true;
    nextSpawn = 700;
    buildMeter();
    ctx.robot.setMode('basket');
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    layout();
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function layout() {
    if (!meter) return;
    const z = ctx.zone();
    meter.style.left = (z.x0 + z.x1) / 2 + '%';
    meter.style.top = z.y0 + 7 + '%';
  }

  function hint() {
    let low = null;
    (stars || []).forEach(function (s) { if (s.state === 'fall' && s.y > 0 && (!low || s.y > low.y)) low = s; });
    return low ? { from: ctx.robot.el(), to: low.el } : null;
  }
  function cheer() {
    slots.forEach(function (s, i) { s.style.animationDelay = i * 90 + 'ms'; s.classList.add('dance'); });
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    (timers || []).forEach(clearTimeout);
    timers = [];
    if (stage) {
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
    }
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    ctx.robot.setMode('normal');
    stars = []; slots = []; meter = null;
  }

  LG.games.stars = { start: start, stop: stop, layout: layout, hint: hint, cheer: cheer };
})(window.LG);
