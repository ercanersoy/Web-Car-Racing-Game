/* Web Car Racing Game - açık / koyu arayüz modu */
'use strict';

const Theme = (() => {
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  const listeners = [];
  const META = { dark: '#1b1f24', light: '#e3e6ea' };

  /* Ayar 'auto' ise işletim sistemi/tarayıcı tercihine uyulur */
  function resolved() {
    const s = Settings.get('uiTheme');
    if (s === 'light' || s === 'dark') return s;
    return mq && mq.matches ? 'light' : 'dark';
  }

  function apply() {
    const r = resolved();
    if (document.documentElement.dataset.theme !== r) {
      document.documentElement.dataset.theme = r;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', META[r]);
      listeners.forEach(fn => fn(r));
    }
    return r;
  }

  function onChange(fn) { listeners.push(fn); }

  if (mq) {
    const handler = () => { if (Settings.get('uiTheme') === 'auto') apply(); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
  // sayfa çizilmeden önce uygula (yanıp sönme olmasın)
  apply();

  return { apply, resolved, onChange };
})();
