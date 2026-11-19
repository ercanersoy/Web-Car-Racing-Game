/* Turbo Pist - menüler ve ekranlar */
'use strict';

const UI = (() => {
  const SEL_KEY = 'turbopist.newgame.v1';
  const REC_KEY = 'turbopist.records.v1';
  const screens = ['main', 'new', 'settings', 'about', 'pause', 'results'];
  let current = 'main';
  let settingsBack = 'main';
  let sel = Object.assign({ mode: 'laps', laps: 3, cars: 6, difficulty: 'orta', model: 0, color: 0, track: 0 }, U.load(SEL_KEY, {}));
  let mapsBuilt = false;

  function show(name) {
    screens.forEach(s => U.$('scr-' + s).classList.toggle('hidden', s !== name));
    current = name;
    if (name === 'new') buildNewGame();
    if (name === 'settings') fillSettings();
    const first = U.$('scr-' + name) && U.$('scr-' + name).querySelector('.btn.primary, .btn');
    if (first && name !== 'settings') first.focus({ preventScroll: true });
  }
  function hideAll() { screens.forEach(s => U.$('scr-' + s).classList.add('hidden')); current = null; }

  /* ---------- rekorlar ---------- */
  function records() { return U.load(REC_KEY, {}); }
  function recKey(o) { return o.trackIndex + ':' + o.mode + (o.mode === 'laps' ? ':' + o.laps : ''); }
  function saveRecord(o, result) {
    const recs = records();
    const out = { newTime: false, newLap: false };
    if (result.time != null && !result.est) {
      const k = recKey(o);
      if (!recs[k] || result.time < recs[k]) { recs[k] = Math.floor(result.time); out.newTime = true; }
    }
    if (result.bestLap != null) {
      const k = 'lap:' + o.trackIndex;
      if (!recs[k] || result.bestLap < recs[k]) { recs[k] = Math.floor(result.bestLap); out.newLap = true; }
    }
    U.save(REC_KEY, recs);
    out.time = recs[recKey(o)]; out.lap = recs['lap:' + o.trackIndex];
    return out;
  }

  /* ---------- yeni oyun ---------- */
  function seg(id, value, onPick) {
    const el = U.$(id);
    el.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.v === value);
      b.onclick = () => { Sound.click(); onPick(b.dataset.v); seg(id, b.dataset.v, onPick); };
    });
  }

  function saveSel() { U.save(SEL_KEY, sel); summary(); }

  function summary() {
    const t = Tracks.getBasic(sel.track);
    const mode = sel.mode === 'laps' ? sel.laps + ' tur' : 'Kısa yarış';
    const cars = sel.cars === 1 ? 'tek başına' : sel.cars + ' araç';
    U.$('sel-summary').textContent = t.name + ' · ' + mode + ' · ' + cars + ' · ' + CAR_MODELS[sel.model].name;
    U.$('map-sel-name').textContent = '— ' + t.name;
  }

  function buildNewGame() {
    seg('opt-mode', sel.mode, v => { sel.mode = v; updateMode(); saveSel(); refreshRecords(); });
    seg('opt-diff', sel.difficulty, v => { sel.difficulty = v; saveSel(); });
    const laps = U.$('opt-laps'), cars = U.$('opt-cars');
    laps.value = sel.laps; U.$('opt-laps-val').textContent = sel.laps;
    cars.value = sel.cars; U.$('opt-cars-val').textContent = sel.cars;
    laps.oninput = () => { sel.laps = +laps.value; U.$('opt-laps-val').textContent = sel.laps; saveSel(); refreshRecords(); };
    cars.oninput = () => { sel.cars = +cars.value; U.$('opt-cars-val').textContent = sel.cars + (sel.cars === 1 ? ' (zamana karşı)' : ''); saveSel(); };
    cars.oninput();
    updateMode();
    buildCars();
    buildColors();
    buildMaps();
    summary();
  }

  function updateMode() {
    U.$('opt-laps-wrap').style.visibility = sel.mode === 'laps' ? 'visible' : 'hidden';
    U.$('mode-desc').textContent = sel.mode === 'laps'
      ? 'Seçilen tur sayısını ilk tamamlayan kazanır.'
      : 'Başlangıçtan sarı-dama bitiş çizgisine (turun ~%70\'i) tek seferlik hızlı bir sprint.';
  }

  function buildCars() {
    const list = U.$('car-list');
    list.innerHTML = '';
    CAR_MODELS.forEach((m, i) => {
      const b = document.createElement('button');
      b.className = 'car-card' + (i === sel.model ? ' on' : '');
      b.type = 'button';
      const cv = U.makeCanvas(240, 120);
      const x = cv.getContext('2d');
      x.translate(120, 60); x.scale(2.6, 2.6); x.rotate(-0.25);
      Cars.drawCar(x, m, CAR_COLORS[sel.color].hex);
      b.appendChild(cv);
      const info = document.createElement('div');
      info.innerHTML = '<div class="name">' + m.name + '</div><div class="tag">' + m.tag + '</div><div class="desc">' + m.desc + '</div>' +
        Cars.stats(m).map(s => '<div class="stat"><span>' + s[0] + '</span><span class="bar"><i style="width:' + s[1] * 10 + '%"></i></span></div>').join('');
      b.appendChild(info);
      b.onclick = () => { Sound.click(); sel.model = i; saveSel(); list.querySelectorAll('.car-card').forEach((c, j) => c.classList.toggle('on', j === i)); };
      list.appendChild(b);
    });
  }

  function buildColors() {
    const list = U.$('color-list');
    list.innerHTML = '';
    CAR_COLORS.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (i === sel.color ? ' on' : '');
      b.style.background = c.hex;
      b.title = c.name; b.setAttribute('aria-label', c.name);
      b.onclick = () => { Sound.click(); sel.color = i; saveSel(); buildColors(); buildCars(); };
      list.appendChild(b);
    });
  }

  function buildMaps() {
    const list = U.$('map-list');
    if (!mapsBuilt) {
      mapsBuilt = true;
      list.innerHTML = '';
      for (let i = 0; i < Tracks.count; i++) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'map-card'; b.dataset.i = i;
        const cv = U.makeCanvas(160, 110);
        b.appendChild(cv);
        b.insertAdjacentHTML('beforeend', '<div class="name">' + (i + 1) + '. ' + TRACK_DEFS[i][0] + '</div>' +
          '<div class="meta"><span>' + THEMES[TRACK_DEFS[i][1]].name + '</span><span class="diff"></span></div><div class="rec"></div>');
        b.onclick = () => { Sound.click(); sel.track = i; saveSel(); markMap(); };
        list.appendChild(b);
      }
      // küçük resimleri parça parça üret (arayüz donmasın)
      let i = 0;
      const step = () => {
        const end = Math.min(Tracks.count, i + 3);
        for (; i < end; i++) {
          const t = Tracks.getBasic(i), card = list.children[i];
          Render.thumbnail(card.querySelector('canvas'), t);
          card.querySelector('.diff').textContent = t.difficulty + ' · ' + (t.length * 0.42 / 3600).toFixed(1) + ' km';
        }
        if (i < Tracks.count) setTimeout(step, 0);
      };
      step();
    }
    markMap();
    refreshRecords();
  }

  function markMap() {
    const list = U.$('map-list');
    Array.from(list.children).forEach((c, j) => c.classList.toggle('on', j === sel.track));
    summary();
  }

  function refreshRecords() {
    const recs = records();
    const list = U.$('map-list');
    Array.from(list.children).forEach((c, i) => {
      const k = recKey({ trackIndex: i, mode: sel.mode, laps: sel.laps });
      const parts = [];
      if (recs[k]) parts.push('Rekor ' + U.fmtTime(recs[k]));
      else if (recs['lap:' + i]) parts.push('En iyi tur ' + U.fmtTime(recs['lap:' + i]));
      c.querySelector('.rec').textContent = parts.join('');
    });
  }

  function startOptions() {
    return {
      trackIndex: sel.track, mode: sel.mode, laps: sel.laps, modelIdx: sel.model, colorIdx: sel.color,
      carCount: sel.cars, difficulty: sel.difficulty, playerName: Settings.get('playerName') || 'Oyuncu'
    };
  }

  /* ---------- ayarlar ---------- */
  const SET_KEYS = ['playerName', 'music', 'musicVolume', 'sfx', 'sfxVolume', 'engineSound', 'quality', 'fpsLimit', 'showFps',
    'camera', 'units', 'speedo', 'mirror', 'minimap', 'standings', 'touch'];

  function fillSettings() {
    SET_KEYS.forEach(k => {
      const el = U.$('s-' + k);
      if (!el) return;
      const v = Settings.get(k);
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = String(v);
    });
  }

  function bindSettings() {
    SET_KEYS.forEach(k => {
      const el = U.$('s-' + k);
      if (!el) return;
      const ev = (el.type === 'range' || el.type === 'text') ? 'input' : 'change';
      el.addEventListener(ev, () => {
        let v;
        if (el.type === 'checkbox') v = el.checked;
        else if (el.type === 'range') v = parseFloat(el.value);
        else if (k === 'fpsLimit') v = parseInt(el.value, 10);
        else if (k === 'playerName') v = el.value.trim().slice(0, 14) || 'Oyuncu';
        else v = el.value;
        Settings.set(k, v);
      });
    });
    U.$('settings-back').onclick = () => { Sound.click(); show(settingsBack); };
    U.$('btn-reset-settings').onclick = () => { Settings.reset(); fillSettings(); };
    U.$('btn-reset-records').onclick = () => {
      if (confirm('Tüm yerel rekorlar silinsin mi?')) { U.save(REC_KEY, {}); refreshRecords(); }
    };
  }

  function openSettings(from) { settingsBack = from; show('settings'); }

  /* ---------- sonuçlar ---------- */
  function showResults(results, opts, rec) {
    const t = Tracks.getBasic(opts.trackIndex);
    const me = results.find(r => r.isPlayer);
    const mode = opts.mode === 'laps' ? opts.laps + ' tur' : 'Kısa yarış';
    U.$('res-info').innerHTML = '<b>' + Hud.escapeHtml(t.name) + '</b> · ' + mode + ' · ' +
      (results.length > 1 ? 'Sıralamanız: <b>' + me.rank + '. / ' + results.length + '</b>' : 'Zamana karşı');
    U.$('res-body').innerHTML = results.map(r =>
      '<tr class="' + (r.isPlayer ? 'me' : '') + '">' +
      '<td class="' + (r.rank === 1 ? 'r1' : '') + '">' + r.rank + '</td>' +
      '<td><span class="dot" style="background:' + r.color + '"></span>' + Hud.escapeHtml(r.name) + '</td>' +
      '<td>' + r.model + '</td>' +
      '<td>' + (r.time == null ? 'Bitiremedi' : (r.est ? '~' : '') + U.fmtTime(r.time)) + '</td>' +
      '<td>' + (r.gap == null ? (r.rank === 1 ? '—' : '') : '+' + U.fmtTime(r.gap)) + '</td>' +
      '<td>' + (opts.mode === 'sprint' ? '—' : U.fmtTime(r.bestLap)) + '</td>' +
      '<td>' + r.points + '</td></tr>').join('');
    const parts = [];
    if (rec.time) parts.push('Bu harita/mod rekoru: <b>' + U.fmtTime(rec.time) + '</b>' + (rec.newTime ? ' <span class="new">YENİ REKOR!</span>' : ''));
    if (rec.lap) parts.push('Harita en iyi tur: <b>' + U.fmtTime(rec.lap) + '</b>' + (rec.newLap ? ' <span class="new">YENİ!</span>' : ''));
    parts.push('<small>~ işaretli süreler tahminidir (yarışı bitirmeden önce hesaplandı).</small>');
    U.$('res-records').innerHTML = parts.join('<br>');
    show('results');
  }

  function init() {
    document.querySelectorAll('[data-go]').forEach(b => {
      b.addEventListener('click', () => {
        Sound.ensure(); Sound.click();
        const go = b.dataset.go;
        if (go === 'settings') openSettings('main'); else show(go);
      });
    });
    bindSettings();
    show('main');
  }

  return {
    init, show, hideAll, openSettings, startOptions, showResults, saveRecord,
    get current() { return current; }
  };
})();
