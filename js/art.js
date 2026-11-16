/* All artwork, as inline SVG strings. Characters use a 100x100 viewBox,
   a soft navy outline (INK) and one colour from the shared palette. */
(function (LG) {
  'use strict';
  const A = (LG.art = {});
  const INK = (A.INK = '#2b2d5b');
  /* b = base, l = light, d = dark */
  const COLORS = (A.COLORS = {
    red: { b: '#ff5a5f', l: '#ffa3a6', d: '#d93a40' },
    orange: { b: '#ff9f1c', l: '#ffcb80', d: '#e07f00' },
    yellow: { b: '#ffd23f', l: '#ffeb9c', d: '#e8b106' },
    green: { b: '#3ddc84', l: '#a0f2c3', d: '#1fb564' },
    blue: { b: '#3fa9f5', l: '#a3d7fc', d: '#1c82cf' },
    purple: { b: '#9b6bff', l: '#cdb6ff', d: '#7445e0' },
    pink: { b: '#ff7eb6', l: '#ffc0dc', d: '#e0528f' },
    teal: { b: '#1fd1c1', l: '#9aeee6', d: '#0fa497' },
  });
  const S = 'stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  const svg = (body, vb) => '<svg viewBox="' + (vb || '0 0 100 100') + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  A.svg = svg; A.STROKE = S;
  const shine = (x, y, rx, ry, rot) =>
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".45" transform="rotate(' + (rot || 0) + ' ' + x + ' ' + y + ')"/>';
  /* Small friendly face: two eyes with highlights and a smile. */
  const face = (cx, cy, s) => {
    s = s || 1;
    const e = (x) => '<circle cx="' + x + '" cy="' + cy + '" r="' + 4 * s + '" fill="' + INK + '"/><circle cx="' + (x - 1.3 * s) + '" cy="' + (cy - 1.4 * s) + '" r="' + 1.4 * s + '" fill="#fff"/>';
    return e(cx - 10 * s) + e(cx + 10 * s) +
      '<path d="M' + (cx - 7 * s) + ' ' + (cy + 8 * s) + ' Q' + cx + ' ' + (cy + 15 * s) + ' ' + (cx + 7 * s) + ' ' + (cy + 8 * s) + '" fill="none" ' + S + ' stroke-width="3"/>' +
      '<circle cx="' + (cx - 17 * s) + '" cy="' + (cy + 7 * s) + '" r="' + 3.5 * s + '" fill="#ff7eb6" opacity=".55"/>' +
      '<circle cx="' + (cx + 17 * s) + '" cy="' + (cy + 7 * s) + '" r="' + 3.5 * s + '" fill="#ff7eb6" opacity=".55"/>';
  };
  A.face = face; A.shine = shine;

  /* ---------- animals: bear, bunny, cat, frog ---------- */
  A.animal = function (kind, color) {
    const c = COLORS[color];
    let ears = '', eyeY = 52, eyeX = 15, eyeR = 6.5;
    if (kind === 'bear') {
      ears = [24, 76].map((x) => '<circle cx="' + x + '" cy="28" r="14" fill="' + c.b + '" ' + S + '/><circle cx="' + x + '" cy="28" r="6.5" fill="' + c.l + '"/>').join('');
    } else if (kind === 'bunny') {
      ears = [[34, -8], [66, 8]].map((p) => '<g transform="rotate(' + p[1] + ' ' + p[0] + ' 40)"><ellipse cx="' + p[0] + '" cy="18" rx="10" ry="22" fill="' + c.b + '" ' + S + '/><ellipse cx="' + p[0] + '" cy="20" rx="4.5" ry="14" fill="#ffc0dc"/></g>').join('');
    } else if (kind === 'cat') {
      ears = '<path d="M16 46 L20 10 L46 26 Z" fill="' + c.b + '" ' + S + '/><path d="M84 46 L80 10 L54 26 Z" fill="' + c.b + '" ' + S + '/>' +
        '<path d="M24 34 L25 20 L36 27 Z" fill="#ffc0dc"/><path d="M76 34 L75 20 L64 27 Z" fill="#ffc0dc"/>';
    } else { /* frog: eyes sit in bumps on top of the head */
      ears = [29, 71].map((x) => '<circle cx="' + x + '" cy="28" r="18" fill="' + c.b + '" ' + S + '/><circle cx="' + x + '" cy="28" r="12" fill="#fff"/>').join('');
      eyeY = 29; eyeX = 21; eyeR = 6.5;
    }
    const eye = (x) => '<circle cx="' + x + '" cy="' + eyeY + '" r="' + eyeR + '" fill="' + INK + '"/><circle cx="' + (x - 2) + '" cy="' + (eyeY - 2.2) + '" r="2.2" fill="#fff"/>';
    const happy = (x) => '<path d="M' + (x - 6) + ' ' + (eyeY + 2) + ' Q' + x + ' ' + (eyeY - 7) + ' ' + (x + 6) + ' ' + (eyeY + 2) + '" fill="none" ' + S + '/>';
    const whiskers = kind === 'cat'
      ? '<path d="M14 62 H26 M15 70 L26 68 M86 62 H74 M85 70 L74 68" fill="none" ' + S + ' stroke-width="2.5"/>' : '';
    const frog = kind === 'frog';
    const nose = frog ? '<circle cx="45" cy="57" r="1.8" fill="' + INK + '"/><circle cx="55" cy="57" r="1.8" fill="' + INK + '"/>'
      : '<ellipse cx="50" cy="63" rx="4.5" ry="3.2" fill="' + INK + '"/>';
    const smile = frog ? 'M29 66 Q50 86 71 66' : 'M41 71 Q50 80 59 71';
    return svg(
      ears +
      '<ellipse cx="50" cy="58" rx="40" ry="36" fill="' + c.b + '" ' + S + '/>' +
      '<ellipse cx="50" cy="72" rx="23" ry="17" fill="' + c.l + '"/>' +
      shine(26, 40, 5, 9, 30) +
      '<g class="eyes-open">' + eye(50 - eyeX) + eye(50 + eyeX) + '</g>' +
      '<g class="eyes-happy">' + happy(50 - eyeX) + happy(50 + eyeX) + '</g>' +
      '<circle cx="23" cy="66" r="6.5" fill="#ff7eb6" opacity=".6"/><circle cx="77" cy="66" r="6.5" fill="#ff7eb6" opacity=".6"/>' +
      whiskers + nose +
      '<path class="mouth-closed" d="' + smile + '" fill="none" ' + S + ' stroke-width="3.5"/>' +
      '<g class="mouth-open"><ellipse cx="50" cy="76" rx="11" ry="10" fill="#7a2b4f" ' + S + ' stroke-width="3"/><ellipse cx="50" cy="81" rx="6" ry="4" fill="#ff7e9e"/></g>'
    );
  };

  /* ---------- fruit, one per colour ---------- */
  const leaf = (x, y, rot) => '<path transform="rotate(' + (rot || 0) + ' ' + x + ' ' + y + ')" d="M' + x + ' ' + y + ' q12 -14 26 -4 q-12 14 -26 4Z" fill="#3ddc84" ' + S + ' stroke-width="3.5"/>';
  const stem = (x, y) => '<path d="M' + x + ' ' + y + ' q0 -10 5 -15" fill="none" stroke="#8a5a3c" stroke-width="5" stroke-linecap="round"/>';
  const FRUIT = {
    apple: () => stem(50, 30) + leaf(55, 20, -10) +
      '<path d="M50 30 C38 20 13 26 13 53 C13 77 32 93 50 87 C68 93 87 77 87 53 C87 26 62 20 50 30Z" fill="#ff5a5f" ' + S + '/>' + shine(30, 48, 6, 11, 20) + face(50, 56),
    banana: () => '<path d="M13 32 C15 74 54 98 90 76 C94 72 91 63 85 63 C66 66 49 52 40 27 C36 16 12 19 13 32Z" fill="#ffd23f" ' + S + '/>' +
      '<path d="M16 28 C15 21 34 19 38 25" fill="none" stroke="#8a5a3c" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M22 40 C24 50 28 58 34 65" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
      '<g transform="rotate(30 52 68)">' + face(52, 66, 0.6) + '</g>',
    grapes: () => stem(50, 24) + leaf(54, 16, -5) +
      [[30, 38], [50, 35], [70, 38], [36, 56], [64, 56], [50, 76]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13.5" fill="#9b6bff" ' + S + '/><circle cx="' + (p[0] - 4) + '" cy="' + (p[1] - 4) + '" r="3" fill="#fff" opacity=".5"/>').join('') +
      '<circle cx="50" cy="54" r="17" fill="#9b6bff" ' + S + '/><circle cx="43" cy="46" r="3.5" fill="#fff" opacity=".5"/>' + face(50, 53, 0.6),
    orange: () => '<circle cx="50" cy="55" r="36" fill="#ff9f1c" ' + S + '/>' + leaf(50, 20, -15) + shine(31, 42, 6, 11, 30) + face(50, 56) +
      '<circle cx="66" cy="34" r="1.5" fill="#e07f00"/><circle cx="74" cy="46" r="1.5" fill="#e07f00"/><circle cx="30" cy="76" r="1.5" fill="#e07f00"/>',
    pear: () => stem(50, 16) + leaf(55, 8, 5) +
      '<path d="M50 14 C39 14 37 26 37 36 C37 47 20 52 20 71 C20 85 35 93 50 93 C65 93 80 85 80 71 C80 52 63 47 63 36 C63 26 61 14 50 14Z" fill="#3ddc84" ' + S + '/>' + shine(33, 66, 5, 10, 15) + face(50, 64),
    blueberry: () => '<circle cx="50" cy="55" r="36" fill="#3fa9f5" ' + S + '/>' +
      '<path d="M40 24 L45 30 L50 22 L55 30 L60 24 L58 34 H42Z" fill="#1c82cf" ' + S + ' stroke-width="3"/>' + shine(30, 44, 6, 11, 30) + face(50, 58),
  };
  A.FRUIT_FOR = { red: 'apple', yellow: 'banana', purple: 'grapes', orange: 'orange', green: 'pear', blue: 'blueberry' };
  A.fruit = (name) => svg(FRUIT[name]());

  /* ---------- shapes (pieces with faces, and matching holes) ---------- */
  function starPath(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + 'Z';
  }
  const SHAPES = {
    circle: { d: 'M50 12 a38 38 0 1 0 0.01 0Z', fy: 50 },
    square: { d: 'M26 14 H74 Q86 14 86 26 V74 Q86 86 74 86 H26 Q14 86 14 74 V26 Q14 14 26 14Z', fy: 50 },
    triangle: { d: 'M50 14 L89 82 H11Z', fy: 60 },
    star: { d: starPath(50, 53, 44, 23), fy: 53 },
    heart: { d: 'M50 87 C18 64 8 45 13 31 C18 16 39 13 50 30 C61 13 82 16 87 31 C92 45 82 64 50 87Z', fy: 46 },
  };
  A.SHAPE_KINDS = Object.keys(SHAPES);
  A.starPath = starPath;
  /* opts.hole = true draws the empty slot the piece belongs in. */
  A.shape = function (kind, color, opts) {
    const s = SHAPES[kind], c = COLORS[color];
    if (opts && opts.hole) {
      return svg('<path d="' + s.d + '" fill="' + INK + '" opacity=".24" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<path d="' + s.d + '" fill="none" stroke="' + c.b + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 10"/>');
    }
    return svg('<path d="' + s.d + '" fill="' + c.b + '" ' + S + ' stroke-width="5"/>' +
      '<path d="' + s.d + '" fill="none" stroke="' + c.l + '" stroke-width="3" stroke-linejoin="round" opacity=".7" transform="translate(50 50) scale(.78) translate(-50 -50)"/>' +
      face(50, s.fy, 0.9));
  };
  /* A falling star with a face (Catch the stars). */
  A.star = function (color) {
    const c = COLORS[color || 'yellow'];
    return svg('<path d="' + starPath(50, 53, 44, 24) + '" fill="' + c.b + '" ' + S + ' stroke-width="5"/>' + shine(36, 36, 4, 8, 35) + face(50, 54, 0.9));
  };

  /* ---------- stickers. zone: 'ground' (grows on the grass) or 'sky' ---------- */
  A.stickers = {
    flower: {
      zone: 'ground',
      svg: function (color) {
        const c = COLORS[color || 'pink'];
        let petals = '';
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          petals += '<circle cx="' + (50 + Math.cos(a) * 17).toFixed(1) + '" cy="' + (34 + Math.sin(a) * 17).toFixed(1) + '" r="12" fill="' + c.b + '" ' + S + ' stroke-width="3.5"/>';
        }
        return svg('<path d="M50 50 V96" fill="none" stroke="#1fb564" stroke-width="6" stroke-linecap="round"/>' +
          '<path d="M50 78 q-18 -12 -24 4 q14 8 24 -4Z M50 70 q16 -14 24 0 q-12 10 -24 0Z" fill="#3ddc84" ' + S + ' stroke-width="3"/>' +
          petals + '<circle cx="50" cy="34" r="12" fill="#ffd23f" ' + S + ' stroke-width="3.5"/>' + face(50, 32, 0.5));
      },
    },
    mushroom: {
      zone: 'ground',
      svg: function (color) {
        const c = COLORS[color || 'red'];
        return svg('<path d="M36 56 Q32 92 40 94 H60 Q68 92 64 56Z" fill="#fff4e0" ' + S + '/>' +
          '<path d="M10 58 C10 26 30 12 50 12 C70 12 90 26 90 58 Q50 68 10 58Z" fill="' + c.b + '" ' + S + '/>' +
          '<circle cx="32" cy="36" r="7" fill="#fff"/><circle cx="58" cy="28" r="8" fill="#fff"/><circle cx="74" cy="46" r="5.5" fill="#fff"/><circle cx="44" cy="50" r="4" fill="#fff"/>' +
          face(50, 74, 0.6));
      },
    },
    butterfly: {
      zone: 'sky',
      svg: function (color) {
        const c = COLORS[color || 'purple'];
        return svg('<path d="M50 50 C30 10 4 20 12 44 C16 56 34 56 50 50Z M50 50 C70 10 96 20 88 44 C84 56 66 56 50 50Z" fill="' + c.b + '" ' + S + '/>' +
          '<path d="M50 52 C34 54 18 62 26 78 C34 90 46 76 50 52Z M50 52 C66 54 82 62 74 78 C66 90 54 76 50 52Z" fill="' + c.l + '" ' + S + '/>' +
          '<circle cx="28" cy="36" r="6" fill="#ffd23f"/><circle cx="72" cy="36" r="6" fill="#ffd23f"/>' +
          '<path d="M46 26 Q42 14 36 14 M54 26 Q58 14 64 14" fill="none" ' + S + ' stroke-width="3"/>' +
          '<ellipse cx="50" cy="50" rx="6.5" ry="24" fill="' + INK + '"/>');
      },
    },
    rainbow: {
      zone: 'sky',
      svg: function () {
        const arcs = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#3ddc84', '#3fa9f5', '#9b6bff'].map(function (col, i) {
          const r = 40 - i * 5.5;
          return '<path d="M' + (50 - r) + ' 70 A' + r + ' ' + r + ' 0 0 1 ' + (50 + r) + ' 70" fill="none" stroke="' + col + '" stroke-width="6"/>';
        }).join('');
        const cloud = (x) => '<g fill="#fff" ' + S + ' stroke-width="3"><path d="M' + (x - 14) + ' 80 a8 8 0 0 1 4 -15 a10 10 0 0 1 19 0 a8 8 0 0 1 4 15Z"/></g>';
        return svg(arcs + cloud(18) + cloud(80));
      },
    },
  };

  /* ---------- background pieces (no outlines, so the foreground pops) ---------- */
  A.sun = function () {
    let rays = '';
    for (let i = 0; i < 10; i++) rays += '<rect x="46" y="2" width="8" height="18" rx="4" fill="#ffc21a" transform="rotate(' + i * 36 + ' 50 50)"/>';
    return svg('<g class="rays">' + rays + '</g><circle cx="50" cy="50" r="27" fill="#ffd94a"/><circle cx="50" cy="50" r="27" fill="none" stroke="#ffc21a" stroke-width="3"/>' +
      '<circle cx="41" cy="46" r="3" fill="#c97a00"/><circle cx="59" cy="46" r="3" fill="#c97a00"/>' +
      '<path d="M41 55 Q50 63 59 55" fill="none" stroke="#c97a00" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="34" cy="54" r="4" fill="#ff9f6b" opacity=".6"/><circle cx="66" cy="54" r="4" fill="#ff9f6b" opacity=".6"/>');
  };
  A.moon = function () {
    return svg('<circle cx="50" cy="50" r="30" fill="#fff3b0"/><circle cx="62" cy="40" r="5" fill="#f2df8a"/><circle cx="40" cy="64" r="4" fill="#f2df8a"/><circle cx="66" cy="62" r="3" fill="#f2df8a"/>' +
      '<path d="M36 46 q4 4 8 0 M52 46 q4 4 8 0" fill="none" stroke="#b79a3a" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M43 55 Q48 59 53 55" fill="none" stroke="#b79a3a" stroke-width="2.5" stroke-linecap="round"/>');
  };
  A.cloud = function () {
    return svg('<g fill="#fff"><circle cx="50" cy="64" r="26"/><circle cx="88" cy="46" r="34"/><circle cx="130" cy="56" r="30"/><circle cx="160" cy="70" r="20"/><rect x="40" y="62" width="130" height="28" rx="14"/></g>', '0 0 200 100');
  };
  A.hills = function () {
    return '<svg viewBox="0 0 1000 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0 150 C150 50 300 60 450 150 C600 240 760 30 1000 120 V400 H0Z" fill="#b9f0b0"/>' +
      '<path d="M0 235 C200 135 380 265 560 215 C740 165 860 205 1000 172 V400 H0Z" fill="#8be595"/>' +
      '<path d="M0 305 C180 252 380 304 520 292 C700 277 850 250 1000 288 V400 H0Z" fill="#61d67c"/>' +
      '<path d="M0 352 C220 322 420 362 620 340 C780 324 900 330 1000 344 V400 H0Z" fill="#4fc86e"/></svg>';
  };

  /* ---------- UI bits ---------- */
  A.hand = function () {
    return svg('<path d="M22 34 V12 a8 8 0 0 1 16 0 V30 l12 3 a9 9 0 0 1 7 10 l-3 16 a14 14 0 0 1 -14 11 H30 a14 14 0 0 1 -12 -7 L7 46 a6.5 6.5 0 0 1 11 -7Z" fill="#fff" ' + S + '/>', '0 0 60 72');
  };
  A.speaker = function () {
    return svg('<path d="M14 40 H30 L50 22 V78 L30 60 H14Z" fill="' + INK + '" ' + S + '/>' +
      '<g class="waves" fill="none" ' + S + ' stroke-width="6"><path d="M62 38 Q72 50 62 62"/><path d="M72 28 Q90 50 72 72"/></g>' +
      '<path class="cross" d="M62 38 L86 62 M86 38 L62 62" fill="none" ' + S + ' stroke-width="7"/>');
  };
  A.bigRainbow = function () {
    const arcs = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#3ddc84', '#3fa9f5', '#9b6bff'].map(function (col, i) {
      const r = 95 - i * 9;
      return '<path d="M' + (100 - r) + ' 100 A' + r + ' ' + r + ' 0 0 1 ' + (100 + r) + ' 100" fill="none" stroke="' + col + '" stroke-width="9.5"/>';
    }).join('');
    return svg(arcs, '0 0 200 100');
  };
})(window.LG);
