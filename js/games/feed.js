/* Feed the friends: drag each fruit to the animal of the same colour.
   Reference implementation of the game interface used by main.js:
     start(ctx)  build the round inside ctx.layer
     stop()      remove listeners (main.js empties the layer itself)
     layout()    (re)position everything; called on start and on resize
     hint()      -> { from: element, to: element } for the idle hint, or null
     cheer()     optional: make the cast dance when the round is complete */
(function (LG) {
  'use strict';
  const U = LG.util, A = LG.art, D = LG.drag;
  const KINDS = ['bear', 'bunny', 'cat', 'frog'];
  let ctx, animals = [], fruits = [];

  function start(c) {
    ctx = c;
    const n = ctx.count();
    const colors = U.shuffle(Object.keys(A.FRUIT_FOR)).slice(0, n);
    const kinds = U.shuffle(KINDS);

    animals = colors.map(function (color, i) {
      const el = U.item(A.animal(kinds[i % kinds.length], color), 'animal');
      el.dataset.color = color;
      el.firstChild.style.animationDelay = i * 90 + 'ms';
      ctx.layer.appendChild(el);
      return { el: el, color: color, fed: false };
    });

    fruits = U.shuffle(colors).map(function (color, i) {
      const el = U.item(A.fruit(A.FRUIT_FOR[color]), 'fruit draggable');
      el.dataset.color = color;
      el.firstChild.style.animationDelay = 300 + i * 90 + 'ms';
      ctx.layer.appendChild(el);
      const f = { el: el, color: color, done: false };
      f.handle = D.make(el, {
        onStart: function () { LG.audio.grab(); },
        onMove: function (p) { setHungry(nearest(p)); },
        onDrop: function (p) {
          const a = nearest(p);
          setHungry(null);
          if (a && a.color === color) {
            a.fed = true; f.done = true;
            a.el.classList.add('hungry');
            return { snapTo: a.el.querySelector('.mouth-open'), scale: 0.2, done: function () { fed(a, f); } };
          }
          if (p) ctx.oops(el);
          return null;
        },
      });
      return f;
    });
    layout();
  }

  function nearest(p) {
    const el = D.nearest(p, animals.filter((a) => !a.fed).map((a) => a.el), 1.5);
    return el ? animals.find((a) => a.el === el) : null;
  }
  function setHungry(target) {
    animals.forEach(function (a) { if (!a.fed) a.el.classList.toggle('hungry', a === target); });
  }
  function fed(a, f) {
    f.el.remove();
    a.el.classList.remove('hungry');
    a.el.classList.add('fed');
    U.react(a.el, 'munch', 800);
    LG.audio.munch();
    ctx.success(a.el, a.color);
    if (animals.every((x) => x.fed)) ctx.complete();
  }

  function layout() {
    const z = ctx.zone(), h = z.y1 - z.y0;
    const xs = U.spread(animals.length, z.x0, z.x1);
    animals.forEach((a, i) => U.place(a.el, xs[i], z.y0 + h * (i % 2 ? 0.3 : 0.24)));
    fruits.forEach((f, i) => U.place(f.el, xs[i], z.y0 + h * 0.84));
  }
  function hint() {
    const f = fruits.find((x) => !x.done && !x.handle.dragging);
    if (!f) return null;
    return { from: f.el, to: animals.find((a) => a.color === f.color).el };
  }
  function cheer() { animals.forEach((a) => a.el.firstChild.classList.add('dance')); }
  function stop() { fruits.forEach((f) => f.handle.destroy()); animals = []; fruits = []; }

  LG.games.feed = { start: start, stop: stop, layout: layout, hint: hint, cheer: cheer };
})(window.LG);
