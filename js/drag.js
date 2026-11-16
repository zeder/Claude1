/* Shared pointer-drag engine: one code path for touch, mouse and pen.
   Elements must be absolutely positioned by their centre (see .item in CSS). */
(function (LG) {
  'use strict';
  const U = LG.util;
  const D = (LG.drag = {});
  const SPRING = 'transform .45s cubic-bezier(.3,1.45,.5,1)';

  /* opts: onStart(), onMove({x,y}), onDrop({x,y}) -> null | {snapTo, scale, done} */
  D.make = function (el, opts) {
    opts = opts || {};
    let pointer = null, enabled = true, dx = 0, dy = 0, grab = { x: 0, y: 0 }, home = { x: 0, y: 0 };

    function apply(scale, animate) {
      el.style.transition = animate ? SPRING : 'none';
      el.style.transform = 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
    }
    function findHome() {
      const p = (el.offsetParent || document.body).getBoundingClientRect();
      home = { x: p.left + el.offsetLeft, y: p.top + el.offsetTop };
    }
    function pos() { return { x: home.x + dx, y: home.y + dy }; }

    function down(e) {
      if (!enabled || pointer !== null || e.button > 0) return;
      e.preventDefault();
      pointer = e.pointerId;
      try { el.setPointerCapture(pointer); } catch (err) { /* synthetic events */ }
      findHome();
      const c = U.center(el);           // may be mid-glide: pick it up where it is
      dx = c.x - home.x; dy = c.y - home.y;
      grab = { x: e.clientX - c.x, y: e.clientY - c.y };
      el.classList.add('dragging');
      apply(1.15, false);
      if (opts.onStart) opts.onStart();
    }
    function move(e) {
      if (e.pointerId !== pointer) return;
      const m = 24;
      const x = U.clamp(e.clientX - grab.x, m, window.innerWidth - m);
      const y = U.clamp(e.clientY - grab.y, m, window.innerHeight - m);
      dx = x - home.x; dy = y - home.y;
      apply(1.15, false);
      if (opts.onMove) opts.onMove({ x: x, y: y });
    }
    function release() {
      try { el.releasePointerCapture(pointer); } catch (err) { /* already gone */ }
      pointer = null;
      el.classList.remove('dragging');
    }
    function up(e) {
      if (e.pointerId !== pointer) return;
      release();
      const res = opts.onDrop ? opts.onDrop(pos()) : null;
      if (res && res.snapTo) api.snapTo(res.snapTo, res.scale, res.done);
      else api.goHome();
    }
    function cancel(e) {
      if (e.pointerId !== pointer) return;
      release();
      if (opts.onDrop) opts.onDrop(null);
      api.goHome();
    }

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('lostpointercapture', cancel);

    const api = {
      el: el,
      get dragging() { return pointer !== null; },
      enable() { enabled = true; el.classList.remove('locked'); },
      disable() { enabled = false; el.classList.add('locked'); },
      goHome() { dx = 0; dy = 0; apply(1, true); },
      snapTo(target, scale, done) {
        enabled = false;
        el.classList.add('locked');
        findHome();
        const c = U.center(target);
        dx = c.x - home.x; dy = c.y - home.y;
        apply(scale == null ? 1 : scale, true);
        if (done) setTimeout(done, 320);
      },
      destroy() {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', cancel);
        el.removeEventListener('lostpointercapture', cancel);
      },
    };
    return api;
  };

  /* Closest element to a point, if the point is within a generous radius of it. */
  D.nearest = function (point, els, factor) {
    if (!point) return null;
    let best = null, bestD = Infinity;
    els.forEach(function (t) {
      const c = U.center(t);
      const d = Math.hypot(c.x - point.x, c.y - point.y);
      if (d < Math.max(c.r * (factor || 1.5), 70) && d < bestD) { best = t; bestD = d; }
    });
    return best;
  };
})(window.LG);
