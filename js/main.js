/* Boot, endless round rotation, celebrations, stickers, persistence. */
(function (LG) {
  'use strict';
  const U = LG.util, A = LG.art;
  const SAVE_KEY = 'little-garden-v1';
  const ORDER = ['feed', 'shapes', 'stars'];
  /* Sticker slots in percent of the stage: ground = base of the sticker. */
  const SLOTS = {
    ground: [[36, 96], [48, 97.5], [60, 95.5], [72, 97.5], [84, 96], [94, 97.5]],
    sky: [[33, 11], [48, 9], [62, 12], [76, 9.5]],
  };
  const stage = document.getElementById('stage');
  const play = document.getElementById('play');
  const stickerLayer = document.getElementById('stickers');
  const hand = document.getElementById('hand');
  const muteBtn = document.getElementById('mute');

  let state = { rounds: 0, tod: 0, stickers: [] };
  let game = null, gameIndex = 0, progress = 0, busy = false, lastAction = Date.now(), hinting = false;
  LG.state = state;

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && Array.isArray(s.stickers)) { state = s; LG.state = state; }
    } catch (e) { /* no storage: the garden simply starts fresh */ }
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  const portrait = () => window.innerHeight > window.innerWidth;

  /* ---------- background ---------- */
  function buildBackground() {
    const bg = document.getElementById('bg');
    let stars = '';
    for (let i = 0; i < 26; i++) {
      stars += '<i style="left:' + U.rand(2, 98).toFixed(1) + '%;top:' + U.rand(2, 96).toFixed(1) + '%;animation-delay:-' + U.rand(0, 3).toFixed(1) + 's"></i>';
    }
    bg.innerHTML =
      '<div class="sky-layer sky-0"></div><div class="sky-layer sky-1"></div><div class="sky-layer sky-2"></div><div class="sky-layer sky-3"></div>' +
      '<div class="night-stars">' + stars + '</div>' +
      '<div class="cloud c1">' + A.cloud() + '</div><div class="cloud c2">' + A.cloud() + '</div><div class="cloud c3">' + A.cloud() + '</div>' +
      '<div class="sun">' + A.sun() + '</div><div class="moon">' + A.moon() + '</div>' +
      '<div class="hills">' + A.hills() + '</div>';
  }
  function setTod(n) {
    state.tod = n % 4;
    stage.className = stage.className.replace(/tod-\d/, 'tod-' + state.tod);
  }

  /* ---------- stickers ---------- */
  function stickerEl(s) {
    const def = A.stickers[s.type] || A.stickers.flower;
    const el = U.el('div', 'sticker ' + s.zone, def.svg(s.color));
    const slot = SLOTS[s.zone][s.slot];
    U.place(el, slot[0], slot[1]);
    el.dataset.type = s.type;
    return el;
  }
  function renderStickers() {
    stickerLayer.innerHTML = '';
    state.stickers.forEach((s) => stickerLayer.appendChild(stickerEl(s)));
  }
  async function awardSticker() {
    const count = (z) => state.stickers.filter((s) => s.zone === z).length;
    /* Fill the emptier zone first; when a zone is full its oldest sticker is replaced. */
    const zone = count('ground') / SLOTS.ground.length <= count('sky') / SLOTS.sky.length ? 'ground' : 'sky';
    const types = Object.keys(A.stickers).filter((t) => A.stickers[t].zone === zone);
    const recent = state.stickers.slice(-3).map((s) => s.type);
    const fresh = types.filter((t) => recent.indexOf(t) < 0);
    const s = { type: U.pick(fresh.length ? fresh : types), color: U.pick(Object.keys(A.COLORS)), zone: zone, slot: 0 };
    const used = state.stickers.filter((x) => x.zone === zone).map((x) => x.slot);
    const free = SLOTS[zone].map((_, i) => i).filter((i) => used.indexOf(i) < 0);
    /* spread out: fill alternate slots first */
    const spreadOrder = SLOTS[zone].map((_, i) => i).sort((a, b) => (a % 2) - (b % 2) || a - b);
    if (free.length) s.slot = spreadOrder.find((i) => free.indexOf(i) >= 0);
    else {
      const oldest = state.stickers.findIndex((x) => x.zone === zone);
      s.slot = state.stickers[oldest].slot;
      state.stickers.splice(oldest, 1);
      renderStickers();
    }
    state.stickers.push(s);
    save();

    /* Bolt holds it up, then it flies to its place in the garden. */
    /* The prize is shown big in the middle on a sunburst, then flies to its place in the garden. */
    const el = stickerEl(s), slot = SLOTS[zone][s.slot];
    const burst = U.el('div', 'sunburst');
    play.classList.add('leaving');
    U.place(el, 50, 42);
    el.classList.add('award');
    stage.appendChild(burst); stage.appendChild(el);
    LG.robot.react('point', U.ms(2000)); LG.robot.react('happy', U.ms(2000));
    LG.audio.sticker();
    LG.celebrate.sparkle(window.innerWidth / 2, window.innerHeight * 0.42, '#ffd23f', Math.min(window.innerWidth, window.innerHeight) * 0.24);
    LG.celebrate.confetti();
    LG.robot.react('clap', 900);
    /* twinkles around the prize while it is held up */
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.42, rr = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    for (let i = 1; i <= 5; i++) setTimeout(function () { const a = Math.random() * 6.28; LG.celebrate.sparkle(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, '#ffd23f', rr * 0.2); }, U.ms(i * 330));
    await U.wait(2200);
    burst.classList.add('out');
    U.place(el, slot[0], slot[1]);
    el.classList.add('go');
    await U.wait(1000);
    const r = el.getBoundingClientRect();
    LG.celebrate.sparkle(r.left + r.width / 2, r.top + r.height / 2, '#ffd23f');
    LG.audio.pop();
    burst.remove(); el.remove();
    renderStickers();
    await U.wait(500);
  }

  /* ---------- the big one, every 10 rounds ---------- */
  async function parade() {
    const rainbow = U.el('div', 'parade-rainbow', A.bigRainbow());
    stage.insertBefore(rainbow, stickerLayer);
    play.classList.add('leaving');
    /* the animal friends march across in front of the rainbow, Bolt leads from the middle */
    const walkers = U.shuffle(Object.keys(A.FRUIT_FOR)).slice(0, 5).map(function (color, i) {
      const w = U.el('div', 'parade-walker animal fed', '<div>' + A.animal(['bear', 'bunny', 'cat', 'frog'][i % 4], color) + '</div>');
      w.style.animationDelay = 500 + i * 620 + 'ms';
      w.firstChild.style.animationDelay = -i * 130 + 'ms';
      stage.insertBefore(w, stickerLayer);
      return w;
    });
    LG.robot.el().classList.add('parade');
    stickerLayer.classList.add('party');
    Array.from(stickerLayer.children).forEach((e) => e.classList.add('party'));
    LG.audio.fanfare();
    LG.celebrate.fireworks(9);
    LG.celebrate.confetti();
    LG.robot.react('spin', 900);
    setTimeout(() => LG.robot.react('dance', 5600), 950);
    LG.robot.react('happy', 6600);
    if (game && game.cheer) game.cheer();
    await U.wait(2400);
    setTod(state.tod + 1); save();
    await U.wait(4400);
    rainbow.remove();
    walkers.forEach((w) => w.remove());
    LG.robot.el().classList.remove('parade');
    Array.from(stickerLayer.children).forEach((e) => e.classList.remove('party'));
  }

  /* ---------- rounds ---------- */
  const ctx = {
    layer: play,
    robot: LG.robot,
    portrait: portrait,
    /* How many things fit comfortably in one row. */
    count: () => (portrait() ? 3 : 4),
    /* Play area in percent of the stage, clear of Bolt, the sun and the mute button. */
    zone: () => (portrait() ? { x0: 5, x1: 95, y0: 15, y1: 78 } : { x0: 22, x1: 94, y0: 16, y1: 84 }),
    /* One correct move: note, sparkle, Bolt cheers. */
    success: function (el, color) {
      const c = U.center(el);
      if (el.classList.contains('basket')) c.y -= c.r * 1.3;   // keep the burst off Bolt's face
      LG.audio.success(progress++);
      LG.celebrate.sparkle(c.x, c.y, (A.COLORS[color] || A.COLORS.yellow).b);
      LG.robot.react('clap', 900); LG.robot.react('happy', 900);
      lastAction = Date.now();
    },
    /* A miss is never a failure: just a soft sound while the piece glides home. */
    oops: function () { LG.audio.back(); },
    complete: function () { roundDone(); },
  };

  function startNext() {
    for (let i = 0; i < ORDER.length; i++) {
      const name = ORDER[gameIndex++ % ORDER.length];
      if (LG.games[name]) {
        game = LG.games[name];
        progress = 0;
        document.body.dataset.game = name;
        game.start(ctx);
        /* brand-new players get the hand demo almost straight away */
        lastAction = Date.now() - (state.rounds < 3 ? 3800 : 0);
        return;
      }
    }
  }
  async function roundDone() {
    if (busy) return;
    busy = true;
    state.rounds++; save();
    document.body.dataset.rounds = state.rounds;
    LG.audio.yay();
    LG.celebrate.confetti();
    LG.robot.react('dance', U.ms(2200)); LG.robot.react('happy', U.ms(2200));
    if (game.cheer) game.cheer();
    await U.wait(2200);
    if (state.rounds % 3 === 0) await awardSticker();
    if (state.rounds % 10 === 0) await parade();
    play.classList.add('leaving');
    await U.wait(450);
    game.stop();
    play.innerHTML = '';
    play.classList.remove('leaving');
    busy = false;
    startNext();
  }

  /* ---------- idle hint: Bolt waves and a hand shows the move ---------- */
  function showHint() {
    const h = game && game.hint ? game.hint() : null;
    if (!h || !h.from) return;
    hinting = true;
    const a = U.center(h.from), b = h.to ? U.center(h.to) : { x: a.x, y: a.y - 30 };
    const w = hand.offsetWidth, t = (p) => 'translate(' + (p.x - w * 0.5) + 'px,' + (p.y - 4) + 'px)';
    const inner = h.from.querySelector('.item-in');
    if (inner) U.react(inner, 'wiggle', 1500);
    const tin = h.to && h.to.querySelector('.item-in');
    if (tin) setTimeout(() => U.react(tin, 'bounce', 600), 1300);
    LG.robot.react('point', 1600);
    LG.audio.beep();
    const anim = hand.animate([
      { transform: t(a), opacity: 0 },
      { transform: t(a) + ' scale(.9)', opacity: 1, offset: 0.2 },
      { transform: t(b), opacity: 1, offset: 0.8 },
      { transform: t(b), opacity: 0 },
    ], { duration: 1900, iterations: 2, easing: 'ease-in-out' });
    anim.onfinish = anim.oncancel = function () { hinting = false; };
    LG._hintAnim = anim;
  }
  function touchActivity() {
    lastAction = Date.now();
    if (hinting && LG._hintAnim) LG._hintAnim.cancel();
  }

  /* ---------- boot ---------- */
  function boot() {
    load();
    buildBackground();
    setTod(state.tod || 0);
    renderStickers();
    hand.innerHTML = A.hand();
    LG.celebrate.init(document.getElementById('fx'));
    LG.robot.init(stage);
    document.body.dataset.rounds = state.rounds;

    muteBtn.innerHTML = A.speaker();
    muteBtn.classList.toggle('off', LG.audio.isMuted());
    muteBtn.addEventListener('click', function () {
      LG.audio.unlock();
      LG.audio.setMuted(!LG.audio.isMuted());
      muteBtn.classList.toggle('off', LG.audio.isMuted());
    });

    window.addEventListener('pointerdown', function () { LG.audio.unlock(); touchActivity(); }, true);
    window.addEventListener('pointermove', function (e) { LG.robot.lookAt(e.clientX, e.clientY); }, { passive: true });
    /* Keep the browser from scrolling, zooming or opening menus under little hands. */
    ['contextmenu', 'gesturestart', 'dblclick', 'selectstart', 'dragstart'].forEach((ev) =>
      document.addEventListener(ev, (e) => e.preventDefault()));
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    let rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { LG.robot.layout(); if (game && game.layout) game.layout(); }, 120);
    });
    setInterval(function () {
      if (!busy && !hinting && Date.now() - lastAction > 6000) { showHint(); lastAction = Date.now() + 3000; }
    }, 1000);

    startNext();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.LG);
