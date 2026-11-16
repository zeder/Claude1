/* Bolt — the little gardener robot who keeps the child company. */
(function (LG) {
  'use strict';
  const U = LG.util, A = LG.art;
  const R = (LG.robot = {});
  let el, eyes, basket, homeX = 13;

  function art() {
    const S = A.STROKE, INK = A.INK;
    return A.svg(
      '<g class="antenna"><path d="M60 30 V14" fill="none" ' + S + '/><circle class="bulb" cx="60" cy="11" r="7.5" fill="#ffd23f" ' + S + ' stroke-width="3.5"/></g>' +
      /* arms sit behind the body */
      '<g class="arm arm-l"><rect x="12" y="94" width="18" height="32" rx="9" fill="#f7faff" ' + S + '/><circle cx="21" cy="124" r="8.5" fill="#ff9f1c" ' + S + '/></g>' +
      '<g class="arm arm-r"><rect x="90" y="94" width="18" height="32" rx="9" fill="#f7faff" ' + S + '/><circle cx="99" cy="124" r="8.5" fill="#ff9f1c" ' + S + '/></g>' +
      '<rect x="38" y="130" width="18" height="16" rx="7" fill="#5b5fa8" ' + S + '/><rect x="64" y="130" width="18" height="16" rx="7" fill="#5b5fa8" ' + S + '/>' +
      '<rect x="30" y="88" width="60" height="48" rx="20" fill="#1fd1c1" ' + S + '/>' +
      '<circle cx="60" cy="112" r="11" fill="#f7faff" ' + S + ' stroke-width="3"/>' +
      '<path d="M60 118 C52 112 53 106 57 106 C59 106 60 108 60 109 C60 108 61 106 63 106 C67 106 68 112 60 118Z" fill="#ff7eb6"/>' +
      '<rect x="6" y="48" width="14" height="22" rx="6" fill="#ff9f1c" ' + S + '/><rect x="100" y="48" width="14" height="22" rx="6" fill="#ff9f1c" ' + S + '/>' +
      '<rect x="14" y="26" width="92" height="68" rx="30" fill="#f7faff" ' + S + '/>' +
      '<ellipse cx="34" cy="40" rx="6" ry="9" fill="#fff" transform="rotate(35 34 40)"/>' +
      '<rect x="25" y="37" width="70" height="46" rx="21" fill="' + INK + '"/>' +
      '<g class="look"><g class="eyes"><ellipse cx="45" cy="57" rx="7.5" ry="9.5" fill="#7df6ff"/><ellipse cx="75" cy="57" rx="7.5" ry="9.5" fill="#7df6ff"/>' +
      '<circle cx="42.5" cy="53.5" r="2.5" fill="#fff"/><circle cx="72.5" cy="53.5" r="2.5" fill="#fff"/></g>' +
      '<g class="eyes-happy" fill="none" stroke="#7df6ff" stroke-width="4.5" stroke-linecap="round"><path d="M38 60 Q45 49 52 60"/><path d="M68 60 Q75 49 82 60"/></g>' +
      '<path d="M52 71 Q60 79 68 71" fill="none" stroke="#7df6ff" stroke-width="3.5" stroke-linecap="round"/></g>' +
      '<circle cx="33" cy="71" r="4" fill="#ff7eb6" opacity=".85"/><circle cx="87" cy="71" r="4" fill="#ff7eb6" opacity=".85"/>',
      '0 0 120 150');
  }
  function basketArt() {
    const S = A.STROKE;
    return A.svg('<path d="M12 16 H108 L96 56 Q60 66 24 56Z" fill="#f0b566" ' + S + '/>' +
      '<path d="M30 20 L36 56 M48 20 L50 60 M72 20 L70 60 M90 20 L84 56 M17 34 H103 M21 46 H99" fill="none" stroke="#c9843a" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="6" y="8" width="108" height="14" rx="7" fill="#e09a45" ' + S + '/>', '0 0 120 64');
  }

  R.init = function (stage) {
    el = U.el('div', '', '<div class="bolt-in">' + art() + '</div><div class="basket">' + basketArt() + '</div>');
    el.id = 'bolt';
    stage.appendChild(el);
    eyes = el.querySelector('.look');
    basket = el.querySelector('.basket');
    el.addEventListener('pointerdown', function (e) {
      if (el.classList.contains('mode-basket')) return;   // the stars game moves Bolt itself
      e.stopPropagation();
      LG.audio.unlock(); LG.audio.beep();
      R.react('wiggle', 600); R.react('happy', 900);
      const c = U.center(el);
      LG.celebrate.sparkle(c.x, c.y - c.r * 0.6, '#7df6ff');
    });
    R.layout();
  };
  R.el = () => el;
  R.basketEl = () => basket;
  /* Bolt lives bottom-left; a touch further in on wide screens. */
  R.layout = function () {
    homeX = window.innerWidth > window.innerHeight ? 11 : 16;
    if (!el.classList.contains('mode-basket')) el.style.left = homeX + '%';
  };
  /* Eyes follow a point on screen. */
  R.lookAt = function (x, y) {
    const c = U.center(el), dx = x - c.x, dy = y - c.y, d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 200);
    eyes.setAttribute('transform', 'translate(' + ((dx / d) * 5 * k).toFixed(1) + ' ' + ((dy / d) * 4 * k).toFixed(1) + ')');
  };
  /* type: clap | spin | dance | wiggle | point | happy */
  R.react = function (type, ms) { U.react(el, type, ms || 1000); };
  R.setMode = function (mode) {
    el.classList.toggle('mode-basket', mode === 'basket');
    if (mode !== 'basket') R.home();
  };
  /* Slide Bolt horizontally to a viewport x (pixels); used by Catch the stars. */
  R.moveTo = function (x) {
    const half = el.offsetWidth / 2;
    el.classList.remove('slow');
    el.style.left = U.clamp(x, half, window.innerWidth - half) + 'px';
  };
  R.home = function () { el.classList.add('slow'); el.style.left = homeX + '%'; };
  R.center = () => U.center(el);
  /* Mouth of the basket in viewport pixels: { x, y, w }. */
  R.basketMouth = function () {
    const r = basket.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.25, w: r.width };
  };
  R.catchBounce = function () { U.react(basket, 'catch', 300); };
})(window.LG);
