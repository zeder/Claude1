/* Little Garden — shared helpers. Everything hangs off the global LG namespace
   (classic scripts, so the game also runs straight from the file system). */
window.LG = window.LG || {};
(function (LG) {
  'use strict';
  const U = (LG.util = {});
  LG.games = LG.games || {};
  LG.config = { fast: /[?&]fast\b/.test(location.search) };

  U.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* Scales a delay; tests run with ?fast to shorten the pauses between rounds. */
  U.ms = (ms) => (LG.config.fast ? ms * 0.25 : ms);
  U.wait = (ms) => new Promise((r) => setTimeout(r, U.ms(ms)));
  U.reducedMotion = () =>
    !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Centre of an element in viewport pixels, plus a rough radius. */
  U.center = function (el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.min(r.width, r.height) / 2 };
  };
  /* Position an element by its centre, in percent of the stage. */
  U.place = function (el, xPct, yPct) {
    el.style.left = xPct + '%';
    el.style.top = yPct + '%';
  };
  /* n evenly spaced values between a and b (centres of n equal cells). */
  U.spread = function (n, a, b) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(a + ((b - a) * (i + 0.5)) / n);
    return out;
  };
  /* A game object: .item (moved by the drag engine) > .item-in (one-shot
     reactions) > svg (idle loops). Keeping the three transforms on separate
     elements stops animations fighting the drag. */
  U.item = function (svg, cls) {
    const e = U.el('div', 'item ' + (cls || ''));
    e.appendChild(U.el('div', 'item-in', svg));
    return e;
  };
  /* Restartable one-shot CSS animation class. */
  U.react = function (el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el['_t_' + cls]);
    el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), ms || 900);
  };
})(window.LG);
