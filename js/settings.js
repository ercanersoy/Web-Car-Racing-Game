/* Turbo Pist - ayarlar (localStorage'da saklanır) */
'use strict';

const Settings = (() => {
  const KEY = 'turbopist.settings.v1';
  const defaults = {
    playerName: 'Oyuncu',
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
  let data = Object.assign({}, defaults, U.load(KEY, {}));
  const listeners = [];

  function get(k) { return data[k]; }
  function set(k, v) {
    data[k] = v;
    U.save(KEY, data);
    listeners.forEach(fn => fn(k, v));
  }
  function reset() {
    data = Object.assign({}, defaults);
    U.save(KEY, data);
    listeners.forEach(fn => fn(null, null));
  }
  function onChange(fn) { listeners.push(fn); }

  return { get, set, reset, onChange, defaults };
})();
