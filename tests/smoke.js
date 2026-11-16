/* Smoke test: node tests/smoke.js
   Plays three rounds with a mouse, checks the celebration ladder and
   persistence, then repeats a round with real touch events on a phone. */
const { chromium, devices } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?fast';

let failed = 0;
function check(name, ok, extra) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (ok || extra == null ? '' : '  -> ' + extra));
  if (!ok) failed++;
}
async function centre(page, sel) {
  const b = await (await page.waitForSelector(sel)).boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(600);
}
function waitGame(page, name) {
  return page.waitForFunction(
    (n) => document.body.dataset.game === n && document.querySelectorAll('#play .item').length > 0,
    name, { timeout: 15000 });
}
const rounds = (page) => page.evaluate(() => Number(document.body.dataset.rounds));

async function playFeed(page) {
  const colors = await page.$$eval('.fruit', (els) => els.map((e) => e.dataset.color));
  for (const c of colors) {
    await drag(page, await centre(page, '.fruit[data-color=' + c + ']'), await centre(page, '.animal[data-color=' + c + ']'));
  }
}
async function playShapes(page) {
  const kinds = await page.$$eval('.piece', (els) => els.map((e) => e.dataset.kind));
  for (const k of kinds) {
    await drag(page, await centre(page, '.piece[data-kind=' + k + ']'), await centre(page, '.hole[data-kind=' + k + ']'));
  }
}
async function playStars(page, target) {
  const end = Date.now() + 90000;
  while ((await rounds(page)) < target && Date.now() < end) {
    const x = await page.evaluate(() => {
      const s = Array.from(document.querySelectorAll('#play .star'))
        .map((e) => e.getBoundingClientRect()).sort((a, b) => b.top - a.top)[0];
      return s ? s.left + s.width / 2 : null;
    });
    if (x != null) await page.mouse.move(x, 300);
    await page.waitForTimeout(80);
  }
}

(async () => {
  const browser = await chromium.launch();

  console.log('Desktop, mouse');
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await waitGame(page, 'feed');
  await page.waitForTimeout(900);
  check('Bolt the robot is on stage', await page.isVisible('#bolt'));

  // A wrong drop is not a failure: the fruit just glides home.
  const colors = await page.$$eval('.fruit', (els) => els.map((e) => e.dataset.color));
  const home = await centre(page, '.fruit[data-color=' + colors[0] + ']');
  await drag(page, home, await centre(page, '.animal[data-color=' + colors[1] + ']'));
  await page.waitForTimeout(400);
  const back = await centre(page, '.fruit[data-color=' + colors[0] + ']');
  check('wrong drop glides home', Math.hypot(back.x - home.x, back.y - home.y) < 12, JSON.stringify(back));
  check('wrong drop feeds nobody', (await page.$$('.animal.fed')).length === 0);

  await playFeed(page);
  check('feed round completes', (await rounds(page)) === 1);
  await waitGame(page, 'shapes');
  await page.waitForTimeout(900);
  await playShapes(page);
  check('shapes round completes', (await rounds(page)) === 2);
  await waitGame(page, 'stars');
  check('Bolt holds the basket', await page.evaluate(() => document.getElementById('bolt').classList.contains('mode-basket')));
  await playStars(page, 3);
  check('stars round completes', (await rounds(page)) === 3);
  await page.waitForSelector('.sticker', { timeout: 8000 });
  check('sticker earned after 3 rounds', (await page.$$('.sticker')).length === 1);
  await waitGame(page, 'feed');
  check('game loops back to the first activity', true);
  check('Bolt put the basket away', await page.evaluate(() => !document.getElementById('bolt').classList.contains('mode-basket')));

  await page.reload();
  await waitGame(page, 'feed');
  check('sticker survives a reload', (await page.$$('.sticker')).length === 1);
  check('round count survives a reload', (await rounds(page)) === 3);

  // The parade: jump to round 9 and finish one more.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('little-garden-v1'));
    s.rounds = 9;
    localStorage.setItem('little-garden-v1', JSON.stringify(s));
  });
  await page.reload();
  await waitGame(page, 'feed');
  await page.waitForTimeout(900);
  await playFeed(page);
  await page.waitForSelector('.parade-rainbow', { timeout: 8000 });
  check('parade at round 10', true);
  await page.waitForFunction(() => document.getElementById('stage').classList.contains('tod-1'), null, { timeout: 8000 });
  check('time of day changes after the parade', true);
  check('no page errors', errors.length === 0, errors.join(' | '));
  await page.close();

  const phones = [['Phone portrait, touch', devices['iPhone 13']], ['Phone landscape, touch', devices['iPhone 13 landscape']]];
  for (const [label, device] of phones) {
    console.log(label);
    const ctx = await browser.newContext({ ...device });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(URL);
    await waitGame(p, 'feed');
    await p.waitForTimeout(900);
    const cdp = await ctx.newCDPSession(p);
    const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }];
    const cols = await p.$$eval('.fruit', (els) => els.map((e) => e.dataset.color));
    const fits = await p.evaluate(() => Array.from(document.querySelectorAll('#play .item, #bolt')).every((e) => {
      const r = e.getBoundingClientRect();
      return r.left >= -2 && r.top >= -2 && r.right <= innerWidth + 2 && r.bottom <= innerHeight + 2;
    }));
    const big = await p.evaluate(() => Array.from(document.querySelectorAll('#play .item')).every((e) => e.getBoundingClientRect().width >= 90));
    for (const c of cols) {
      const a = await centre(p, '.fruit[data-color=' + c + ']');
      const b = await centre(p, '.animal[data-color=' + c + ']');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(a.x, a.y) });
      for (let i = 1; i <= 8; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8) });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await p.waitForTimeout(600);
    }
    check('touch drags complete a round', (await rounds(p)) === 1);
    check('page did not scroll or zoom', await p.evaluate(() => window.scrollX === 0 && window.scrollY === 0 && (!window.visualViewport || window.visualViewport.scale === 1)));
    check('everything fits on screen', fits);
    check('touch targets are at least 90px', big);
    check('no page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log(failed ? '\n' + failed + ' check(s) failed' : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
