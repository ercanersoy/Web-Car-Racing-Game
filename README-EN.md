# Web Car Racing Game — English (UK)

A single-player, top-down car racing game that runs entirely in the browser.
Written in HTML, CSS and plain JavaScript; **no additional libraries or frameworks are used** and no server is required.

## Running

Just open `index.html` in a browser (double-click / `file://` works).
You can also serve it with any static file server, e.g. `python3 -m http.server`.

## Features

- **Menu:** New Game, Settings, About
- **New game options:** race type, number of laps (1–10), number of cars (1–8, including you), opponent difficulty, car, colour, map
- **5 cars:** Model 1 (balanced), Model 2 (top speed), Model 3 (handling), Model 4 (durable / off-road), Model 5 (acceleration)
- **Computer opponents:** Player 1, Player 2, … (Oyuncu 1, Oyuncu 2, … in Turkish)
- **Languages:** Turkish, American English (en-US) and British English (en-GB); picked from the browser language on first launch and changeable from the main menu or settings
- **8 colour** options
- **25 circuits** in 5 themes: meadow, desert, snow (low grip), autumn, night (headlights)
- **25 sprint roads:** one-way roads with separate start and finish points (same 5 themes)
- **Race types:** lap race and sprint
- **Easy-on-the-eyes design:** muted colours, no pure white/black or neon, no fast-scrolling fine patterns, smooth camera rotation; all graphics are top-down with shadows cast from a fixed light direction; buildings line up with the road and no object is ever drawn over the track
- **Light and dark interface modes:** Auto (system theme), Light or Dark; chosen from the main menu or settings
- **Software-generated music:** tracks composed in real time with the Web Audio API, unique to each map; menu music; engine, skid, collision and countdown sounds
- **HUD:** analogue/digital speedometer with gear, rear-view mirror, minimap, live standings, lap times, wrong-way warning
- **Results table:** position, time, gap, best lap and points at the end of the race; local records (localStorage)
- **Settings:** music/effects/engine sound, graphics quality, frame rate limit, camera (rotating/fixed), speed unit (km/h, mph), show/hide mirror/minimap/standings, interface theme (auto/light/dark), touch controls, FPS counter, player name, language
- **Controls:** keyboard, game controller and touch screen

## Controls

| Action | Key |
|---|---|
| Accelerator | ↑ / W |
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
js/theme.js       Light / dark interface mode
js/cars.js        Car models, colours, sprites
js/tracks.js      Definition and generation of the 25 circuits and 25 sprint roads
js/race.js        Race logic, physics, AI
js/audio.js       Procedural music and sound effects
js/input.js       Keyboard / game controller / touch
js/render.js      Canvas 2D rendering
js/hud.js         HUD
js/ui.js          Menus and results table
js/main.js        Game loop
```

## Copyright

Copyright © 2026 Ercan Ersoy (repository owner). Licensed under the MIT License — see [LICENSE](LICENSE).
