/* Web Car Racing Game - settings (stored in localStorage) */
'use strict';

const Settings = (() => {
  const KEY = 'wcrg.settings.v1';
  const defaults = {
    lang: '',               // '' = chosen from the browser language on first run (tr | en-US | en-GB)
    playerName: '',         // '' = language-dependent default name ("Sen" / "You")
    uiTheme: 'auto',        // auto (system) | light | dark
    music: true,
    musicVolume: 0.5,
    sfx: true,
    sfxVolume: 0.7,
    engineSound: true,
    quality: 'medium',      // low | medium | high
    fpsLimit: 60,           // 30 | 60 | 0 (unlimited)
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
  /* Restore defaults; the language is kept */
  function reset() {
    data = Object.assign({}, defaults, { lang: data.lang });
    U.save(KEY, data);
    listeners.forEach(fn => fn(null, null));
  }
  function onChange(fn) { listeners.push(fn); }

  return { get, set, reset, onChange, defaults, firstRun };
})();
