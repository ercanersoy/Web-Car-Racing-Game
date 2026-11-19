/* Web Car Racing Game - HUD: speedometer, rear-view mirror, minimap, standings */
'use strict';

const Hud = (() => {
  let els = null, race = null;
  let mini = null, miniCtx = null, miniBase = null;
  let speedo = null, sctx = null, dial = null, dialKey = '';
  let mirror = null, mctx = null;
  let lastDom = 0, lastStand = 0, msgTimer = 0;
  let mirrorFrame = 0;
  const cache = {};

  /* Speedometer and minimap colours for the light / dark theme */
  const PALETTE = {
    dark: {
      dialBg: 'rgba(27,31,36,0.72)', ring: '#3a414d', tick: '#c5cbd2', red: '#c4685a', num: '#98a2b0',
      arc: 'rgba(214,180,90,0.75)', needle: '#d0705f', hub: '#d9dde2',
      miniOuter: 'rgba(0,0,0,0.5)', miniInner: '#cfd2d4', dotMe: '#e4e5e0', dotOther: '#22262b'
    },
    light: {
      dialBg: 'rgba(240,242,244,0.86)', ring: '#c5ccd4', tick: '#4a525d', red: '#b0574a', num: '#5c6571',
      arc: 'rgba(181,142,52,0.8)', needle: '#b85a4a', hub: '#3a414c',
      miniOuter: 'rgba(40,50,60,0.22)', miniInner: '#5a636e', dotMe: '#2b3038', dotOther: '#f0f2f4'
    }
  };
  const pal = () => PALETTE[Theme.resolved()];

  function init() {
    els = {
      hud: U.$('hud'), pos: U.$('hud-pos'), lap: U.$('hud-lap'), lapLbl: U.$('hud-lap-lbl'),
      time: U.$('hud-time'), last: U.$('hud-last'), best: U.$('hud-best'),
      msg: U.$('hud-msg'), wrong: U.$('hud-wrong'), fps: U.$('hud-fps'),
      stand: U.$('standings'), spdVal: U.$('spd-val'), spdUnit: U.$('spd-unit'), gear: U.$('spd-gear'),
      speedoWrap: U.$('speedo-wrap'), touch: U.$('touch')
    };
    mini = U.$('minimap'); miniCtx = mini.getContext('2d');
    speedo = U.$('speedo'); sctx = speedo.getContext('2d');
    mirror = U.$('mirror'); mctx = mirror.getContext('2d');
  }

  function set(el, key, v) {
    if (cache[key] !== v) { cache[key] = v; el.textContent = v; }
  }

  function dpr() {
    const q = Settings.get('quality');
    return q === 'high' ? Math.min(2, window.devicePixelRatio || 1) : (q === 'low' ? 1 : Math.min(1.5, window.devicePixelRatio || 1));
  }

  function fit(canvas) {
    const r = dpr();
    const w = Math.round(canvas.clientWidth * r), h = Math.round(canvas.clientHeight * r);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
    return false;
  }

  function start(r) {
    race = r;
    for (const k in cache) delete cache[k];
    miniBase = null; dialKey = '';
    els.hud.classList.remove('hidden');
    els.msg.textContent = ''; msgTimer = 0;
    applySettings();
  }

  function stop() {
    els.hud.classList.add('hidden');
    race = null;
  }

  function applySettings() {
    mirror.classList.toggle('hidden', !Settings.get('mirror'));
    mini.classList.toggle('hidden', !Settings.get('minimap'));
    els.stand.classList.toggle('hidden', !Settings.get('standings'));
    els.speedoWrap.classList.toggle('digital', Settings.get('speedo') === 'digital');
    els.fps.classList.toggle('hidden', !Settings.get('showFps'));
    const t = Settings.get('touch');
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    els.touch.classList.toggle('hidden', !(t === 'on' || (t === 'auto' && isTouch)));
    els.spdUnit.textContent = I18N.t(Settings.get('units') === 'mph' ? 'unit.mph' : 'unit.kmh');
    if (race) els.lapLbl.textContent = I18N.t(race.mode === 'sprint' ? 'hud.dist' : 'hud.lap');
    els.hud.classList.toggle('sprint', !!race && race.mode === 'sprint');
    for (const k in cache) delete cache[k];   // rewrite texts after a language/unit change
    dialKey = ''; miniBase = null;
  }

  function message(text, dur, small) {
    els.msg.textContent = text;
    els.msg.classList.toggle('small', !!small);
    msgTimer = dur || 0;
  }

  /* speed unit conversion: world units/s -> km/h (or mph) */
  function speedValue(v) {
    const kmh = Math.abs(v) * 0.42;
    return Settings.get('units') === 'mph' ? kmh * 0.6214 : kmh;
  }

  function drawDial(W, H, maxV) {
    const c = U.makeCanvas(W, H), x = c.getContext('2d');
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 4 * (W / 170);
    const k = W / 170, P = pal();
    x.fillStyle = P.dialBg;
    x.beginPath(); x.arc(cx, cy, R, 0, U.TAU); x.fill();
    x.strokeStyle = P.ring; x.lineWidth = 2 * k; x.stroke();
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
    const step = maxV > 200 ? 20 : 10;
    x.font = 'bold ' + Math.round(10 * k) + 'px system-ui, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let v = 0; v <= maxV; v += step / 2) {
      const a = a0 + (a1 - a0) * v / maxV, major = v % step === 0;
      const r1 = R - (major ? 12 : 7) * k, r2 = R - 3 * k;
      x.strokeStyle = v > maxV * 0.8 ? P.red : P.tick;
      x.lineWidth = (major ? 2 : 1) * k;
      x.beginPath(); x.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      x.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); x.stroke();
      if (major && (v / step) % 2 === 0) {
        x.fillStyle = P.num;
        x.fillText(String(v), cx + Math.cos(a) * (R - 24 * k), cy + Math.sin(a) * (R - 24 * k));
      }
    }
    return c;
  }

  function drawSpeedo(car) {
    if (Settings.get('speedo') !== 'analog') return;
    fit(speedo);
    const W = speedo.width, H = speedo.height;
    const mph = Settings.get('units') === 'mph';
    const maxV = mph ? 180 : 280;
    const key = W + 'x' + H + mph + Theme.resolved();
    if (dialKey !== key) { dial = drawDial(W, H, maxV); dialKey = key; }
    sctx.clearRect(0, 0, W, H);
    sctx.drawImage(dial, 0, 0);
    const k = W / 170, cx = W / 2, cy = H / 2, P = pal();
    const v = Math.min(maxV, speedValue(car.vf));
    const a = Math.PI * 0.75 + Math.PI * 1.5 * v / maxV;
    // rpm arc
    sctx.strokeStyle = P.arc; sctx.lineWidth = 4 * k;
    sctx.beginPath(); sctx.arc(cx, cy, W / 2 - 18 * k, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * car.rpm * 0.999); sctx.stroke();
    sctx.strokeStyle = P.needle; sctx.lineWidth = 3 * k; sctx.lineCap = 'round';
    sctx.beginPath(); sctx.moveTo(cx - Math.cos(a) * 10 * k, cy - Math.sin(a) * 10 * k);
    sctx.lineTo(cx + Math.cos(a) * (W / 2 - 16 * k), cy + Math.sin(a) * (W / 2 - 16 * k)); sctx.stroke();
    sctx.fillStyle = P.hub; sctx.beginPath(); sctx.arc(cx, cy, 5 * k, 0, U.TAU); sctx.fill();
  }

  function drawMinimap() {
    if (!Settings.get('minimap')) return;
    const resized = fit(mini);
    const P = pal();
    if (!miniBase || resized) miniBase = Render.minimapBase(race.track, mini.width, P.miniOuter, P.miniInner);
    miniCtx.clearRect(0, 0, mini.width, mini.height);
    miniCtx.drawImage(miniBase.canvas, 0, 0);
    const k = mini.width / 150;
    for (const c of race.cars) {
      const x = c.x * miniBase.s + miniBase.ox, y = c.y * miniBase.s + miniBase.oy;
      miniCtx.fillStyle = c.color;
      miniCtx.strokeStyle = c.isPlayer ? P.dotMe : P.dotOther;
      miniCtx.lineWidth = (c.isPlayer ? 2 : 1) * k;
      miniCtx.beginPath(); miniCtx.arc(x, y, (c.isPlayer ? 5 : 3.5) * k, 0, U.TAU);
      miniCtx.fill(); miniCtx.stroke();
    }
  }

  function drawMirror(car) {
    if (!Settings.get('mirror')) return;
    const q = Settings.get('quality');
    mirrorFrame++;
    if (q === 'low' && mirrorFrame % 2) return;  // update at half rate on low quality
    fit(mirror);
    const W = mirror.width, H = mirror.height;
    const zoom = H / 300;
    const back = car.angle + Math.PI;
    const dist = H / 2 / zoom + 10;
    const cam = {
      x: car.x + Math.cos(back) * dist, y: car.y + Math.sin(back) * dist,
      rot: -Math.PI / 2 - back, zoom
    };
    Render.world(mctx, race, cam, W, H, { skip: car, mirror: true, quality: q });
  }

  function update(dt, fps) {
    if (!race) return;
    const p = race.player;
    drawSpeedo(p);
    drawMinimap();
    drawMirror(p);

    if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) els.msg.textContent = ''; }

    const now = performance.now();
    if (now - lastDom > 100) {
      lastDom = now;
      set(els.spdVal, 'spd', String(Math.round(speedValue(p.vf))));
      set(els.gear, 'gear', String(p.gear));
      set(els.pos, 'pos', p.rank + '/' + race.cars.length);
      if (race.mode === 'sprint') {
        const st = race.track.startIdx;
        const pct = U.clamp(Math.floor((p.progress - st) / (race.target - st) * 100), 0, 100);
        set(els.lap, 'lap', I18N.pct(pct));
      } else {
        set(els.lap, 'lap', U.clamp(p.lap + 1, 1, race.laps) + '/' + race.laps);
      }
      set(els.time, 'time', U.fmtTime((p.finished ? p.finishTime : race.time) * 1000, true));
      set(els.last, 'last', U.fmtTime(p.lastLap == null ? null : p.lastLap * 1000));
      set(els.best, 'best', U.fmtTime(p.bestLap == null ? null : p.bestLap * 1000));
      const wrong = p.wrongT > 1 && !p.finished;
      if (cache.wrong !== wrong) { cache.wrong = wrong; els.wrong.classList.toggle('hidden', !wrong); }
      if (Settings.get('showFps')) set(els.fps, 'fps', fps + ' FPS');
    }
    if (Settings.get('standings') && now - lastStand > 300 && race.order) {
      lastStand = now;
      const html = race.order.map(c =>
        '<li class="' + (c.isPlayer ? 'me' : '') + '"><b>' + c.rank + '</b><i style="background:' + c.color + '"></i>' +
        escapeHtml(Race.nameOf(c)) + (c.finished ? ' &#127937;' : '') + '</li>').join('');
      if (cache.stand !== html) { cache.stand = html; els.stand.innerHTML = html; }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  return { init, start, stop, update, message, applySettings, escapeHtml, dpr };
})();
