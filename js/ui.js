/* Web Car Racing Game - menus and screens */
'use strict';

const UI = (() => {
  const SEL_KEY = 'wcrg.newgame.v1';
  const REC_KEY = 'wcrg.records.v1';
  const VERSION = '1.3.0';
  const screens = ['main', 'new', 'settings', 'about', 'pause', 'results'];
  let current = 'main';
  let settingsBack = 'main';
  const mapCards = { circuit: null, sprint: null };   // map cards are created once per map kind
  let lastResults = null;

  /* Force saved selections to valid values even if they are corrupt or outdated */
  function sanitize(o) {
    const d = { mode: 'laps', laps: 3, cars: 6, difficulty: 'medium', model: 0, color: 0, track: 0, sprintTrack: 0 };
    const int = (v, a, b, def) => (Number.isInteger(v) && v >= a && v <= b) ? v : def;
    return {
      mode: o.mode === 'sprint' ? 'sprint' : 'laps',
      laps: int(o.laps, 1, 10, d.laps),
      cars: int(o.cars, 1, 8, d.cars),
      difficulty: DIFFICULTIES[o.difficulty] ? o.difficulty : d.difficulty,
      model: int(o.model, 0, CAR_MODELS.length - 1, d.model),
      color: int(o.color, 0, CAR_COLORS.length - 1, d.color),
      track: int(o.track, 0, TRACK_DEFS.length - 1, d.track),
      sprintTrack: int(o.sprintTrack, 0, SPRINT_DEFS.length - 1, d.sprintTrack)
    };
  }

  const sel = sanitize(U.load(SEL_KEY, {}));

  const t = (k, p) => I18N.t(k, p);
  const kindOfMode = mode => (mode === 'sprint' ? 'sprint' : 'circuit');
  const trackName = (kind, i) => t((kind === 'sprint' ? 'sprint.' : 'track.') + i);
  const curKind = () => kindOfMode(sel.mode);
  const curTrack = () => (sel.mode === 'sprint' ? sel.sprintTrack : sel.track);

  function show(name) {
    screens.forEach(s => U.$('scr-' + s).classList.toggle('hidden', s !== name));
    current = name;
    if (name === 'new') buildNewGame();
    if (name === 'settings') fillSettings();
    // No auto-focus on the results screen: a Space key held at the finish must not click a button
    if (name !== 'settings' && name !== 'results') {
      const scr = U.$('scr-' + name);
      const first = scr.querySelector('.btn.primary') || scr.querySelector('.btn');
      if (first) first.focus({ preventScroll: true });
    }
  }
  function hideAll() {
    screens.forEach(s => U.$('scr-' + s).classList.add('hidden'));
    current = null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  /* ---------- language ---------- */
  function fillLangSelects() {
    document.querySelectorAll('.lang-select').forEach(selEl => {
      if (!selEl.options.length) {
        I18N.codes.forEach(code => {
          const o = document.createElement('option');
          o.value = code; o.textContent = I18N.NAMES[code];
          selEl.appendChild(o);
        });
        selEl.addEventListener('change', () => Settings.set('lang', selEl.value));
      }
      selEl.value = I18N.lang();
    });
  }

  /* Theme selectors in the main menu and in settings */
  function fillThemeSelects() {
    document.querySelectorAll('.theme-select').forEach(el => {
      if (!el.dataset.bound) {
        el.dataset.bound = '1';
        // the settings selector is bound via SET_KEYS; bind the main menu one here
        if (el.id !== 's-uiTheme') el.addEventListener('change', () => Settings.set('uiTheme', el.value));
      }
      el.value = Settings.get('uiTheme');
    });
  }

  /* On language change, refresh static texts and the dynamic content of the open screen */
  function relocalize() {
    I18N.apply();
    fillLangSelects();
    fillThemeSelects();
    U.$('about-version').textContent = t('about.version', { v: VERSION });
    for (const kind in mapCards) {
      if (mapCards[kind]) mapCards[kind].forEach((card, i) => localizeMapCard(card, kind, i));
    }
    if (current === 'new') buildNewGame();
    if (current === 'settings') fillSettings();
    if (current === 'results' && lastResults) showResults(lastResults.results, lastResults.opts, lastResults.rec);
  }

  /* ---------- records ---------- */
  function records() { return U.load(REC_KEY, {}); }
  /* lap race: map + lap count; sprint: sprint map */
  function recKey(o) { return o.mode === 'sprint' ? 's' + o.trackIndex : 'c' + o.trackIndex + ':' + o.laps; }
  function saveRecord(o, result) {
    const recs = records();
    const out = { newTime: false, newLap: false };
    if (result.time != null && !result.est) {
      const k = recKey(o);
      if (!recs[k] || result.time < recs[k]) { recs[k] = Math.floor(result.time); out.newTime = true; }
    }
    if (result.bestLap != null && o.mode === 'laps') {
      const k = 'lap:' + o.trackIndex;
      if (!recs[k] || result.bestLap < recs[k]) { recs[k] = Math.floor(result.bestLap); out.newLap = true; }
    }
    U.save(REC_KEY, recs);
    out.time = recs[recKey(o)]; out.lap = o.mode === 'laps' ? recs['lap:' + o.trackIndex] : null;
    return out;
  }

  /* ---------- new game ---------- */
  function seg(id, value, onPick) {
    const el = U.$(id);
    el.querySelectorAll('button').forEach(b => {
      b.classList.toggle('on', b.dataset.v === value);
      b.onclick = () => { Sound.click(); onPick(b.dataset.v); seg(id, b.dataset.v, onPick); };
    });
  }

  function saveSel() { U.save(SEL_KEY, sel); summary(); }

  function summary() {
    const mode = sel.mode === 'laps' ? (sel.laps === 1 ? t('sum.lap1') : t('sum.laps', { n: sel.laps })) : t('mode.sprint');
    const cars = sel.cars === 1 ? t('sum.solo') : t('sum.cars', { n: sel.cars });
    const name = trackName(curKind(), curTrack());
    U.$('sel-summary').textContent = name + ' · ' + mode + ' · ' + cars + ' · ' + CAR_MODELS[sel.model].name;
    U.$('map-sel-name').textContent = '— ' + name;
  }

  function buildNewGame() {
    seg('opt-mode', sel.mode, v => { sel.mode = v; updateMode(); saveSel(); buildMaps(); });
    seg('opt-diff', sel.difficulty, v => { sel.difficulty = v; saveSel(); });
    const laps = U.$('opt-laps'), cars = U.$('opt-cars');
    laps.value = sel.laps; U.$('opt-laps-val').textContent = sel.laps;
    cars.value = sel.cars;
    laps.oninput = () => { sel.laps = +laps.value; U.$('opt-laps-val').textContent = sel.laps; saveSel(); refreshRecords(); };
    cars.oninput = () => {
      sel.cars = +cars.value;
      U.$('opt-cars-val').textContent = sel.cars + (sel.cars === 1 ? ' ' + t('new.timeTrial') : '');
      saveSel();
    };
    cars.oninput();
    updateMode();
    buildCars();
    buildColors();
    buildMaps();
    summary();
  }

  function updateMode() {
    U.$('opt-laps-wrap').style.visibility = sel.mode === 'laps' ? 'visible' : 'hidden';
    U.$('mode-desc').textContent = t(sel.mode === 'laps' ? 'mode.laps.desc' : 'mode.sprint.desc');
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
      info.innerHTML = '<div class="name">' + m.name + '</div><div class="tag">' + t('car.' + i + '.tag') + '</div>' +
        '<div class="desc">' + t('car.' + i + '.desc') + '</div>' +
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
      const name = t('color.' + c.id);
      b.title = name; b.setAttribute('aria-label', name);
      b.onclick = () => { Sound.click(); sel.color = i; saveSel(); buildColors(); buildCars(); };
      list.appendChild(b);
    });
  }

  function localizeMapCard(card, kind, i) {
    const def = Tracks.def(kind, i);
    card.querySelector('.name').textContent = (i + 1) + '. ' + trackName(kind, i);
    card.querySelector('.theme').textContent = t('theme.' + def[1]);
    if (card.dataset.ready) {
      const tr = Tracks.getBasic(kind, i);
      card.querySelector('.diff').textContent = t('level.' + tr.difficulty) + ' · ' + (tr.length * 0.42 / 3600).toFixed(1) + ' km';
    }
  }

  function createMapCards(kind) {
    const cards = [];
    for (let i = 0; i < Tracks.count(kind); i++) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'map-card';
      b.appendChild(U.makeCanvas(160, 110));
      b.insertAdjacentHTML('beforeend', '<div class="name"></div>' +
        '<div class="meta"><span class="theme"></span><span class="diff"></span></div><div class="rec"></div>');
      b.onclick = () => {
        Sound.click();
        if (kind === 'sprint') sel.sprintTrack = i; else sel.track = i;
        saveSel(); markMap();
      };
      localizeMapCard(b, kind, i);
      cards.push(b);
    }
    // render thumbnails in small time slices so the UI does not freeze
    let i = 0;
    const step = () => {
      const t0 = performance.now();
      while (i < cards.length && performance.now() - t0 < 12) {
        Render.thumbnail(cards[i].querySelector('canvas'), Tracks.getBasic(kind, i));
        cards[i].dataset.ready = '1';
        localizeMapCard(cards[i], kind, i);
        i++;
      }
      if (i < cards.length) setTimeout(step, 0);
    };
    step();
    return cards;
  }

  function buildMaps() {
    const kind = curKind(), list = U.$('map-list');
    if (!mapCards[kind]) mapCards[kind] = createMapCards(kind);
    if (list.dataset.kind !== kind) {
      list.replaceChildren(...mapCards[kind]);
      list.dataset.kind = kind;
    }
    markMap();
    refreshRecords();
  }

  function markMap() {
    const cur = curTrack();
    Array.from(U.$('map-list').children).forEach((c, j) => c.classList.toggle('on', j === cur));
    summary();
  }

  function refreshRecords() {
    const recs = records();
    Array.from(U.$('map-list').children).forEach((c, i) => {
      const k = recKey({ trackIndex: i, mode: sel.mode, laps: sel.laps });
      let txt = '';
      if (recs[k]) txt = t('map.record', { t: U.fmtTime(recs[k]) });
      else if (sel.mode === 'laps' && recs['lap:' + i]) txt = t('map.bestLap', { t: U.fmtTime(recs['lap:' + i]) });
      c.querySelector('.rec').textContent = txt;
    });
  }

  function startOptions() {
    return {
      trackIndex: curTrack(), mode: sel.mode, laps: sel.laps, modelIdx: sel.model, colorIdx: sel.color,
      carCount: sel.cars, difficulty: sel.difficulty, playerName: Settings.get('playerName') || ''
    };
  }

  /* ---------- settings ---------- */
  const SET_KEYS = ['playerName', 'uiTheme', 'music', 'musicVolume', 'sfx', 'sfxVolume', 'engineSound', 'quality', 'fpsLimit', 'showFps',
    'camera', 'units', 'speedo', 'mirror', 'minimap', 'standings', 'touch'];

  function fillSettings() {
    SET_KEYS.forEach(k => {
      const el = U.$('s-' + k);
      if (!el) return;
      const v = Settings.get(k);
      if (el.type === 'checkbox') el.checked = !!v;
      else if (el !== document.activeElement) el.value = String(v);
    });
    fillLangSelects();
    fillThemeSelects();
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
        else if (k === 'playerName') v = el.value.trim().slice(0, 14);
        else v = el.value;
        Settings.set(k, v);
      });
    });
    U.$('settings-back').onclick = () => { Sound.click(); show(settingsBack); };
    U.$('btn-reset-settings').onclick = () => { Settings.reset(); fillSettings(); };
    U.$('btn-reset-records').onclick = () => {
      if (confirm(t('set.confirmRecords'))) { U.save(REC_KEY, {}); refreshRecords(); }
    };
  }

  function openSettings(from) { settingsBack = from; show('settings'); }

  /* ---------- results ---------- */
  function showResults(results, opts, rec) {
    lastResults = { results, opts, rec };
    const me = results.find(r => r.isPlayer);
    const mode = opts.mode === 'laps' ? (opts.laps === 1 ? t('sum.lap1') : t('sum.laps', { n: opts.laps })) : t('mode.sprint');
    U.$('res-info').innerHTML = '<b>' + Hud.escapeHtml(trackName(kindOfMode(opts.mode), opts.trackIndex)) + '</b> · ' + mode + ' · ' +
      (results.length > 1 ? t('res.yourPos', { p: me.rank, n: results.length }) : t('res.timeTrial'));
    document.querySelector('table.results').classList.toggle('sprint', opts.mode === 'sprint');
    U.$('res-body').innerHTML = results.map(r =>
      '<tr class="' + (r.isPlayer ? 'me' : '') + '">' +
      '<td class="' + (r.rank === 1 ? 'r1' : '') + '">' + r.rank + '</td>' +
      '<td><span class="dot" style="background:' + r.color + '"></span>' + Hud.escapeHtml(Race.nameOf(r.car)) + '</td>' +
      '<td>' + r.model + '</td>' +
      '<td>' + (r.time == null ? t('res.dnf') : (r.est ? '~' : '') + U.fmtTime(r.time)) + '</td>' +
      '<td>' + (r.gap == null ? (r.rank === 1 ? '—' : '') : '+' + U.fmtTime(r.gap)) + '</td>' +
      '<td>' + (opts.mode === 'sprint' ? '—' : U.fmtTime(r.bestLap)) + '</td>' +
      '<td>' + r.points + '</td></tr>').join('');
    const parts = [];
    if (rec.time) parts.push(t('res.trackRecord', { t: U.fmtTime(rec.time) }) + (rec.newTime ? ' <span class="new">' + t('res.newRecord') + '</span>' : ''));
    if (rec.lap) parts.push(t('res.trackLap', { t: U.fmtTime(rec.lap) }) + (rec.newLap ? ' <span class="new">' + t('res.new') + '</span>' : ''));
    if (results.some(r => r.est)) parts.push('<small>' + t('res.estNote') + '</small>');
    U.$('res-records').innerHTML = parts.join('<br>');
    if (current !== 'results') show('results');
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
    relocalize();
    show('main');
  }

  return {
    init, show, hideAll, openSettings, startOptions, showResults, saveRecord, relocalize, fillThemeSelects,
    get current() { return current; }
  };
})();
