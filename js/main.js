/* Web Car Racing Game - game loop and flow control */
'use strict';

const Game = (() => {
  const STEP = 1 / 120;
  let canvas, ctx;
  let race = null, opts = null;
  let running = false, paused = false, rafId = 0;
  let lastT = 0, lastRender = 0, acc = 0;
  let fpsCount = 0, fpsTime = 0, fps = 0;
  const cam = { x: 0, y: 0, rot: 0, zoom: 1 };
  let menuMusicOn = false;
  let padTimer = 0;   // polls the gamepad Start button while paused

  function watchPad(on) {
    if (padTimer) { clearInterval(padTimer); padTimer = 0; }
    if (on && Input.hasGamepad()) padTimer = setInterval(Input.pollStart, 100);
  }

  function init() {
    // language: pick from the browser language on first run; default unit is mph for US English
    if (!I18N.NAMES[Settings.get('lang')]) {
      Settings.set('lang', I18N.detect());
      if (Settings.firstRun && Settings.get('lang') === 'en-US') Settings.set('units', 'mph');
    }
    canvas = U.$('game');
    // redraw the HUD when the theme changes (including system theme changes)
    Theme.onChange(() => { Hud.applySettings(); if (race && !running) draw(0); });
    ctx = canvas.getContext('2d', { alpha: false });
    Input.init();
    Hud.init();
    UI.init();
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (race && running && !paused && race.state !== 'done') pause();
        Sound.suspend();
      } else if (!paused) Sound.resume();
    });

    Input.on('active', () => running && !paused);
    Input.on('pause', code => {
      // in menus, Esc returns to the previous screen
      const cur = UI.current;
      if (code !== 'Escape' && (cur === 'settings' || cur === 'new' || cur === 'about')) return;
      if (cur === 'settings') { U.$('settings-back').click(); return; }
      if (cur === 'new' || cur === 'about') { Sound.click(); UI.show('main'); return; }
      if (!race) return;
      if (paused) resume(); else if (running && race.state !== 'done') pause();
    });
    Input.on('camera', () => {
      if (!running || paused) return;
      Settings.set('camera', Settings.get('camera') === 'rotate' ? 'fixed' : 'rotate');
      Hud.message(I18N.t(Settings.get('camera') === 'rotate' ? 'hud.camRotate' : 'hud.camFixed'), 1, true);
    });
    Input.on('music', () => {
      Settings.set('music', !Settings.get('music'));
      if (running) Hud.message(I18N.t(Settings.get('music') ? 'hud.musicOn' : 'hud.musicOff'), 1, true);
    });

    Settings.onChange(k => {
      Sound.apply();
      if (k === 'uiTheme' || k === null) { Theme.apply(); UI.fillThemeSelects(); }
      if (k === 'lang' || k === null) UI.relocalize();
      Hud.applySettings();
      if (k === 'quality' || k === null) {
        resize();
        if (race) race.setEffects(effectsLevel());
      }
    });

    // menu music starts on the first user interaction (browser autoplay rule)
    const firstGesture = () => {
      if (!menuMusicOn && !race) { Sound.ensure(); Sound.playMusic(7, 'menu'); menuMusicOn = true; }
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('keydown', firstGesture);
    };
    window.addEventListener('pointerdown', firstGesture);
    window.addEventListener('keydown', firstGesture);

    U.$('btn-start').onclick = () => { Sound.ensure(); Sound.click(); start(UI.startOptions()); };
    U.$('btn-resume').onclick = () => { Sound.click(); resume(); };
    U.$('btn-restart').onclick = () => { Sound.click(); start(opts); };
    U.$('btn-pause-settings').onclick = () => { Sound.click(); UI.openSettings('pause'); };
    U.$('btn-quit').onclick = () => { Sound.click(); quit(); };
    U.$('btn-res-again').onclick = () => { Sound.click(); start(opts); };
    U.$('btn-res-menu').onclick = () => { Sound.click(); quit(); };
    U.$('btn-pause').onclick = e => {
      e.currentTarget.blur();
      if (running && !paused && race && race.state !== 'done') pause();
    };
  }

  function resize() {
    const r = Hud.dpr() * (Settings.get('quality') === 'low' ? 0.75 : 1);
    canvas.width = Math.round(window.innerWidth * r);
    canvas.height = Math.round(window.innerHeight * r);
    if (race) draw(0);
  }

  function effectsLevel() {
    const q = Settings.get('quality');
    return q === 'low' ? 0 : (q === 'medium' ? 1 : 2);
  }

  function start(o) {
    opts = Object.assign({}, o, { effects: effectsLevel(), playerName: Settings.get('playerName') || '' });
    watchPad(false);
    stopLoop();
    Sound.stopMusic();
    Sound.engineStop();
    menuMusicOn = false;
    Input.clear();
    const T = I18N.t;
    const thisRace = race = new Race(opts, {
      onCountdown: n => {
        if (n > 0) { Hud.message(String(n), 1.2); Sound.beep(440, 0.25, 'square', 0.22); }
        else { Hud.message(T('hud.go'), 1); Sound.beep(880, 0.5, 'square', 0.25); }
      },
      onHit: s => Sound.hit(s),
      onLap: car => {
        if (!car.isPlayer || race.mode !== 'laps') return;
        const isBest = car.lapTimes.length > 1 && car.lastLap === car.bestLap;
        if (car.lapsDone === race.laps - 1) Hud.message(T('hud.finalLap'), 1.6, true);
        else if (car.lapsDone < race.laps) Hud.message(T('hud.lapN', { n: car.lapsDone + 1 }) + (isBest ? T('hud.bestLapTag') : ''), 1.4, true);
      },
      onPlayerFinish: car => {
        const pos = race.finishOrder.indexOf(car) + 1;   // also correct when cars cross the line in the same step
        Hud.message(race.cars.length > 1 ? T('hud.finishedPos', { p: I18N.ordinal(pos) }) : T('hud.finish'), 3.5, true);
        Sound.beep(660, 0.15, 'square', 0.2);
        setTimeout(() => Sound.beep(990, 0.4, 'square', 0.2), 160);
      },
      onFinish: results => {
        const me = results.find(r => r.isPlayer);
        const rec = UI.saveRecord(opts, me);
        Sound.engineStop();
        setTimeout(() => {
          if (race !== thisRace) return;   // a new race was started / we returned to the menu meanwhile
          running = false;
          stopLoop();
          Hud.stop();
          UI.showResults(results, opts, rec);
          Sound.playMusic(11, 'menu');
          menuMusicOn = true;
        }, 300);
      }
    });
    const p = race.player;
    cam.x = p.x; cam.y = p.y; cam.rot = -Math.PI / 2 - p.angle;
    cam.zoom = baseZoom();
    UI.hideAll();
    Hud.start(race);
    paused = false;
    running = true;
    acc = 0;
    Sound.ensure();
    Sound.resume();
    Sound.engineStart();
    Sound.playMusic(race.track.seed * 13 + 5, 'race');
    lastT = performance.now(); lastRender = 0;
    rafId = requestAnimationFrame(frame);
  }

  function pause() {
    paused = true;
    stopLoop();            // no frames are drawn while paused (saves resources)
    watchPad(true);
    Input.clear();
    Sound.suspend();
    UI.show('pause');
  }
  function resume() {
    paused = false;
    watchPad(false);
    UI.hideAll();
    Sound.resume();
    lastT = performance.now();
    lastRender = 0;
    acc = 0;
    if (!rafId) rafId = requestAnimationFrame(frame);
  }
  function quit() {
    running = false; paused = false;
    watchPad(false);
    stopLoop();
    Sound.engineStop();
    Sound.resume();
    Hud.stop();
    race = null;
    ctx.fillStyle = '#1b1f24'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    Sound.playMusic(7, 'menu'); menuMusicOn = true;
    UI.show('main');
  }
  function stopLoop() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

  function baseZoom() { return Math.min(canvas.width, canvas.height) / 760; }

  function updateCamera(dt) {
    const p = race.player;
    const sr = U.clamp(Math.abs(p.vf) / p.model.maxSpeed, 0, 1);
    const zt = baseZoom() * (1.08 - 0.22 * sr);
    cam.zoom += (zt - cam.zoom) * Math.min(1, dt * 2);
    if (Settings.get('camera') === 'rotate') {
      const target = -Math.PI / 2 - p.angle;
      cam.rot += U.wrapAngle(target - cam.rot) * Math.min(1, dt * 5);   // smooth rotation reduces motion sickness
      const h = -Math.PI / 2 - cam.rot;
      const ahead = canvas.height * 0.2 / cam.zoom;
      cam.x = p.x + Math.cos(h) * ahead;
      cam.y = p.y + Math.sin(h) * ahead;
    } else {
      cam.rot += U.wrapAngle(0 - cam.rot) * Math.min(1, dt * 5);
      const tx = p.x + p.vx * 0.3, ty = p.y + p.vy * 0.3;
      cam.x += (tx - cam.x) * Math.min(1, dt * 6);
      cam.y += (ty - cam.y) * Math.min(1, dt * 6);
    }
  }

  function draw(dt) {
    Render.world(ctx, race, cam, canvas.width, canvas.height, { quality: Settings.get('quality') });
    Hud.update(dt, fps);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const limit = Settings.get('fpsLimit');
    if (limit && lastRender && now - lastRender < 1000 / limit - 2) return;
    lastRender = now;
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;

    fpsCount++; fpsTime += dt;
    if (fpsTime >= 0.5) { fps = Math.round(fpsCount / fpsTime); fpsCount = 0; fpsTime = 0; }

    if (paused || !race) return;
    acc += dt;
    while (acc >= STEP) {
      const inp = Input.poll(STEP);
      if (paused) break;                     // paused from inside poll() (gamepad Start)
      race.update(STEP, inp);
      acc -= STEP;
      if (race.state === 'done') break;
    }
    if (paused) return;
    if (race.state === 'done') { acc = 0; }
    updateCamera(dt);
    draw(dt);
    const p = race.player;
    Sound.engineUpdate(race.state === 'countdown' ? (p.throttle ? 0.75 : 0.15) : p.rpm, p.gear, p.throttle, p.skid);
  }

  return { init, start, get race() { return race; } };
})();

window.addEventListener('DOMContentLoaded', Game.init);
