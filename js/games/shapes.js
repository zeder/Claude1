/* Shape homes: drag each shape into the hole of the same shape. */
(function (LG) {
  'use strict';
  const U = LG.util, A = LG.art, D = LG.drag;
  const PAIRS = [['red', 'pink'], ['orange', 'yellow'], ['green', 'teal'], ['blue', 'purple']];
  let ctx, board = null, holes = [], pieces = [];

  function start(c) {
    ctx = c;
    const n = ctx.count();
    const kinds = U.shuffle(A.SHAPE_KINDS).slice(0, n);
    /* one colour from each look-alike pair, so no two pieces in a round are close in hue */
    const colors = U.shuffle(PAIRS).slice(0, n).map((p) => U.pick(p));

    board = U.el('div', 'shape-board');
    ctx.layer.appendChild(board);

    holes = kinds.map(function (kind, i) {
      const el = U.item(A.shape(kind, colors[i], { hole: true }), 'hole');
      el.dataset.kind = kind;
      el.firstChild.style.animationDelay = i * 90 + 'ms';
      ctx.layer.appendChild(el);
      return { el: el, kind: kind, color: colors[i], filled: false };
    });

    /* Shuffle the pieces, but never into the same order as the holes. */
    let order = kinds.map((_, i) => i), tries = 0;
    do { order = U.shuffle(order); tries++; }
    while (tries < 20 && n > 1 && order.every((v, i) => v === i));
    if (n > 1 && order.every((v, i) => v === i)) order = order.slice(1).concat(order[0]);

    pieces = order.map(function (idx, i) {
      const kind = kinds[idx], color = colors[idx];
      const el = U.item(A.shape(kind, color), 'piece draggable');
      el.dataset.kind = kind;
      el.firstChild.style.animationDelay = 300 + i * 90 + 'ms';
      ctx.layer.appendChild(el);
      const p = { el: el, kind: kind, color: color, placed: false, hole: holes[idx] };
      p.handle = D.make(el, {
        onStart: function () { LG.audio.grab(); },
        onMove: function (pt) { setReady(nearest(pt)); },
        onDrop: function (pt) {
          const h = nearest(pt);
          setReady(null);
          if (h && h.kind === kind) {
            h.filled = true; p.placed = true;
            return { snapTo: h.el, scale: 1, done: function () { placed(p, h); } };
          }
          if (pt) ctx.oops(el);
          return null;
        },
      });
      return p;
    });
    layout();
  }

  function nearest(pt) {
    const el = D.nearest(pt, holes.filter((h) => !h.filled).map((h) => h.el), 1.5);
    return el ? holes.find((h) => h.el === el) : null;
  }
  function setReady(target) {
    holes.forEach(function (h) { if (!h.filled) h.el.classList.toggle('ready', h === target); });
  }
  function placed(p, h) {
    p.el.classList.add('placed');
    h.el.classList.remove('ready');
    h.el.classList.add('filled');
    U.react(p.el.firstChild, 'bounce', 600);
    ctx.success(h.el, h.color);
    if (pieces.every((x) => x.placed)) ctx.complete();
  }

  function layout() {
    const z = ctx.zone(), h = z.y1 - z.y0;
    const xs = U.spread(holes.length, z.x0, z.x1);
    const holeY = z.y0 + h * 0.27, pieceY = z.y0 + h * 0.83;
    if (board) {
      board.style.left = (z.x0 + z.x1) / 2 + '%';
      board.style.width = Math.min(96, z.x1 - z.x0 + 4) + '%';
      board.style.top = holeY + '%';
    }
    holes.forEach((hl, i) => U.place(hl.el, xs[i], holeY));
    pieces.forEach(function (p, i) {
      if (p.placed) {
        const i2 = holes.indexOf(p.hole);
        U.place(p.el, xs[i2], holeY);
        p.handle.goHome();
        p.handle.disable();
      } else {
        U.place(p.el, xs[i], pieceY);
      }
    });
  }
  function hint() {
    const p = pieces.find((x) => !x.placed && !x.handle.dragging);
    return p ? { from: p.el, to: p.hole.el } : null;
  }
  function cheer() { pieces.forEach((p) => p.el.firstChild.classList.add('dance')); }
  function stop() { pieces.forEach((p) => p.handle.destroy()); holes = []; pieces = []; board = null; }

  LG.games.shapes = { start: start, stop: stop, layout: layout, hint: hint, cheer: cheer };
})(window.LG);
