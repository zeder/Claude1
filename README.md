# Little Garden

Little Garden is a gentle browser game for children aged 3 to 4. There is no reading, no timer and no way to lose. Children play with their fingers, and every tap or drag gets a cheerful response.

## How to play

There are three activities, and they repeat endlessly:

- **Feed the animals.** Drag a piece of fruit onto the animal of the matching colour.
- **Fit the shapes.** Drag a shape into the hole that matches it.
- **Catch the stars.** Slide Bolt, the little robot, left and right to catch falling stars.

Every three rounds, the child earns a sticker for the garden. Every ten rounds there is a parade. Tapping Bolt makes the robot wiggle and sparkle.

## Running it

- **Quick start:** open `index.html` directly in a browser.
- **Local server:** run `python3 -m http.server` in the project folder, then visit http://localhost:8000.
- **Phones and tablets:** the game works in a mobile browser. To keep it like an app, use "Add to Home Screen" (the page includes a web app manifest).

## Hosting

Little Garden is plain static files, so it runs on any static host, for example GitHub Pages. Upload the whole folder and open `index.html`.

## Notes for parents

- The game has no text, no ads and no links to other sites.
- No data leaves the device. Nothing is sent to a server.
- Progress (stickers and rounds) is stored in the browser's localStorage on this device only.
- The mute button is in the top-right corner.

## Files

- `index.html`: the page
- `manifest.webmanifest`, `icon.svg`: home-screen install details
- `css/`: styles for the stage, shapes and stars
- `js/`: `util.js`, `drag.js`, `audio.js`, `art.js`, `stickers.js`, `celebrate.js`, `robot.js`, `main.js`
- `js/games/`: `feed.js`, `shapes.js`, `stars.js`
- `tests/smoke.js`: a quick automated check

## Running the tests

```
node tests/smoke.js
```
