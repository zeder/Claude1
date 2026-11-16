/* Extra garden stickers. Each entry: { zone: 'ground' | 'sky', svg(color) -> SVG string }. */
(function (LG) {
  'use strict';
  const A = LG.art;
  const svg = A.svg, S = A.STROKE, INK = A.INK, COLORS = A.COLORS, face = A.face, shine = A.shine;

  A.stickers.tulip = {
    zone: 'ground',
    svg: function (color) {
      const c = COLORS[color || 'pink'];
      return svg('<path d="M50 58 V96" fill="none" stroke="#1fb564" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M50 80 q-22 -10 -26 6 q16 8 26 -6Z M50 70 q20 -12 26 4 q-14 8 -26 -4Z" fill="#3ddc84" ' + S + ' stroke-width="3"/>' +
        '<path d="M50 62 C32 62 26 46 30 26 C31 20 37 18 41 24 L44 30 C45 22 47 16 50 14 C53 16 55 22 56 30 L59 24 C63 18 69 20 70 26 C74 46 68 62 50 62Z" fill="' + c.b + '" ' + S + '/>' +
        shine(37, 40, 3, 7, 15) + face(50, 46, 0.5));
    },
  };

  A.stickers.ladybug = {
    zone: 'ground',
    svg: function (color) {
      const c = COLORS[color || 'red'];
      const spots = [[34, 56], [66, 56], [30, 78], [70, 78]]
        .map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.5" fill="' + INK + '"/>'; }).join('');
      return svg('<ellipse cx="50" cy="64" rx="36" ry="30" fill="' + c.b + '" ' + S + '/>' +
        '<path d="M50 36 V94" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
        spots + shine(30, 50, 4, 8, 20) +
        '<path d="M44 22 Q40 12 34 10 M56 22 Q60 12 66 10" fill="none" ' + S + ' stroke-width="3"/>' +
        '<circle cx="34" cy="10" r="2.5" fill="' + INK + '"/><circle cx="66" cy="10" r="2.5" fill="' + INK + '"/>' +
        '<ellipse cx="50" cy="32" rx="16" ry="13" fill="' + INK + '"/>' +
        '<ellipse cx="50" cy="33" rx="10" ry="8" fill="#fff4e0"/>' +
        face(50, 33, 0.45));
    },
  };

  A.stickers.snail = {
    zone: 'ground',
    svg: function (color) {
      const c = COLORS[color || 'orange'];
      let spiral = 'M58 56';
      for (let i = 1; i <= 60; i++) {
        const t = (i / 60) * 4.5 * Math.PI, r = 1 + (18 * i) / 60;
        spiral += ' L' + (58 + Math.cos(t) * r).toFixed(1) + ' ' + (56 + Math.sin(t) * r).toFixed(1);
      }
      return svg('<path d="M24 60 V44 M36 60 V46" fill="none" ' + S + ' stroke-width="3.5"/>' +
        '<circle cx="24" cy="42" r="5" fill="#fff4e0" ' + S + ' stroke-width="3"/><circle cx="36" cy="44" r="5" fill="#fff4e0" ' + S + ' stroke-width="3"/>' +
        '<path d="M12 78 C12 62 22 56 30 56 C40 56 44 66 44 76 H80 C90 76 94 84 90 90 C88 94 84 94 80 94 H26 C16 94 12 88 12 78Z" fill="#fff4e0" ' + S + '/>' +
        face(29, 72, 0.6) +
        '<circle cx="58" cy="56" r="24" fill="' + c.b + '" ' + S + '/>' +
        '<path d="' + spiral + '" fill="none" stroke="' + c.d + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="24" cy="42" r="2" fill="' + INK + '"/><circle cx="36" cy="44" r="2" fill="' + INK + '"/>');
    },
  };

  A.stickers.bee = {
    zone: 'sky',
    svg: function () {
      const y = COLORS.yellow.b, w = COLORS.blue.l;
      return svg('<path d="M44 40 Q40 22 32 14 M56 40 Q60 22 68 14" fill="none" ' + S + ' stroke-width="3"/>' +
        '<circle cx="32" cy="14" r="3.5" fill="' + INK + '"/><circle cx="68" cy="14" r="3.5" fill="' + INK + '"/>' +
        '<ellipse cx="34" cy="26" rx="13" ry="9" transform="rotate(-25 34 26)" fill="' + w + '" ' + S + ' stroke-width="3.5"/>' +
        '<ellipse cx="66" cy="26" rx="13" ry="9" transform="rotate(25 66 26)" fill="' + w + '" ' + S + ' stroke-width="3.5"/>' +
        '<ellipse cx="50" cy="56" rx="30" ry="24" fill="' + y + '" ' + S + '/>' +
        '<path d="M30 42 Q34 56 30 70 M70 42 Q66 56 70 70" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>' +
        shine(38, 40, 4, 7, 30) + face(50, 52, 0.75));
    },
  };

  A.stickers.bird = {
    zone: 'sky',
    svg: function (color) {
      const c = COLORS[color || 'blue'];
      return svg('<path d="M20 50 L8 42 L16 62Z" fill="' + c.b + '" ' + S + ' stroke-width="3.5"/>' +
        '<circle cx="50" cy="54" r="32" fill="' + c.b + '" ' + S + '/>' +
        '<ellipse cx="50" cy="66" rx="20" ry="15" fill="' + c.l + '"/>' +
        '<ellipse cx="34" cy="62" rx="11" ry="15" transform="rotate(-20 34 62)" fill="' + c.d + '" ' + S + ' stroke-width="3"/>' +
        '<path d="M79 44 L92 50 L79 56Z" fill="#ff9f1c" ' + S + ' stroke-width="3.5"/>' +
        shine(34, 30, 4, 8, -30) + face(46, 40, 0.8));
    },
  };

  A.stickers.balloon = {
    zone: 'sky',
    svg: function (color) {
      const c = COLORS[color || 'red'];
      return svg('<path d="M50 69 C43 76 57 82 50 88 S43 94 50 95" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="34" rx="28" ry="30" fill="' + c.b + '" ' + S + '/>' +
        '<path d="M46 62 L54 62 L50 69Z" fill="' + c.d + '" ' + S + ' stroke-width="3"/>' +
        shine(36, 22, 4.5, 9, 25) + face(50, 34, 0.6));
    },
  };
})(window.LG);
