/* Web Car Racing Game - ayarlar (localStorage'da saklanır) */
'use strict';

const Settings = (() => {
  const KEY = 'wcrg.settings.v1';
  const defaults = {
    lang: '',               // '' = ilk açılışta tarayıcı dilinden belirlenir (tr | en-US | en-GB)
    playerName: '',         // '' = dile göre varsayılan ad ("Sen" / "You")
    uiTheme: 'auto',        // auto (sistem) | light | dark
    music: true,
    musicVolume: 0.5,
    sfx: true,
    sfxVolume: 0.7,
    engineSound: true,
    quality: 'medium',      // low | medium | high
    fpsLimit: 60,           // 30 | 60 | 0 (sınırsız)
    camera: 'rotate',       // rotate | fixed
    units: 'kmh',           // kmh | mph
    mirror: true,
    minimap: true,
    standings: true,
    speedo: 'analog',       // analog | digital
    touch: 'auto',          // auto | on | off
    showFps: false
  };
  const stored = U.load(KEY, null);
  const firstRun = !stored;
  let data = Object.assign({}, defaults, stored || {});
  const listeners = [];

  function get(k) { return data[k]; }
  function set(k, v) {
    if (data[k] === v) return;
    data[k] = v;
    U.save(KEY, data);
    listeners.forEach(fn => fn(k, v));
  }
  /* Varsayılana dön; dil korunur */
  function reset() {
    data = Object.assign({}, defaults, { lang: data.lang });
    U.save(KEY, data);
    listeners.forEach(fn => fn(null, null));
  }
  function onChange(fn) { listeners.push(fn); }

  return { get, set, reset, onChange, defaults, firstRun };
})();
