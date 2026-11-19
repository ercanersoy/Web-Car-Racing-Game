# Web Car Racing Game — English (US)

A single-player, top-down car racing game that runs entirely in the browser.
Written in HTML, CSS and plain JavaScript; **no additional libraries or frameworks are used** and no server is required.

## Running

Just open `index.html` in a browser (double-click / `file://` works).
You can also serve it with any static file server, e.g. `python3 -m http.server`.

## Features

- **Menu:** New Game, Settings, About
- **New game options:** race type, number of laps (1–10), number of cars (1–8, including you), opponent difficulty, car, color, map
- **5 cars:** Model 1 (balanced), Model 2 (top speed), Model 3 (handling), Model 4 (durable / off-road), Model 5 (acceleration)
- **Computer opponents:** Player 1, Player 2, … (Oyuncu 1, Oyuncu 2, … in Turkish)
- **Languages:** Turkish, American English (en-US) and British English (en-GB); picked from the browser language on first launch and changeable from the main menu or settings
- **8 color** options
- **25 maps** in 5 themes: meadow, desert, snow (low grip), fall, night (headlights)
- **Race types:** lap race and sprint (~70% of a lap)
- **Software-generated music:** tracks composed in real time with the Web Audio API, unique to each map; menu music; engine, skid, collision and countdown sounds
- **HUD:** analog/digital speedometer with gear, rear-view mirror, minimap, live standings, lap times, wrong-way warning
- **Scoreboard:** position, time, gap, best lap and points at the end of the race; local records (localStorage)
- **Settings:** music/effects/engine sound, graphics quality, frame rate limit, camera (rotating/fixed), speed unit (km/h, mph), show/hide mirror/minimap/standings, touch controls, FPS counter, player name, language
- **Controls:** keyboard, gamepad and touch screen

## Controls

| Action | Key |
|---|---|
| Gas | ↑ / W |
| Brake / reverse | ↓ / S |
| Steering | ← → / A D |
| Handbrake | Space |
| Back to track | R |
| Change camera | C |
| Music on/off | M |
| Pause | Esc / P |

## Low resource usage

- The game loop stops completely in menus and while paused.
- Car and scenery graphics are drawn once and cached.
- HUD text is updated about 10 times per second; off-screen objects are not drawn.
- "Low" graphics quality lowers the resolution and turns off effects; the frame rate can be capped at 30 FPS.
- The game pauses and sound stops when the tab goes to the background.

## File structure

```
index.html        Page and menus
css/style.css     UI styles
js/util.js        Helper functions
js/settings.js    Settings
js/i18n.js        Translations (tr, en-US, en-GB)
js/cars.js        Car models, colors, sprites
js/tracks.js      Definition and generation of the 25 maps
js/race.js        Race logic, physics, AI
js/audio.js       Procedural music and sound effects
js/input.js       Keyboard / gamepad / touch
js/render.js      Canvas 2D rendering
js/hud.js         HUD
js/ui.js          Menus and scoreboard
js/main.js        Game loop
```

## Copyright

Copyright © 2026 Ercan Ersoy (repository owner). Licensed under the MIT License — see [LICENSE](LICENSE).
