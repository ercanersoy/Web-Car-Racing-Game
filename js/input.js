/* Web Car Racing Game - klavye, oyun kolu ve dokunmatik giriş */
'use strict';

const Input = (() => {
  const keys = {};
  const touch = { left: false, right: false, gas: false, brake: false };
  const state = { steer: 0, throttle: 0, brake: 0, hand: false, reset: false };
  let resetLatch = false;
  const handlers = {};   // tek seferlik tuş olayları: pause, camera, music

  const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

  function init() {
    window.addEventListener('keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      keys[e.code] = true;
      if (GAME_KEYS.includes(e.code) && handlers.active && handlers.active()) e.preventDefault();
      if (e.repeat) return;
      if ((e.code === 'Escape' || e.code === 'KeyP') && handlers.pause) handlers.pause(e.code);
      if (e.code === 'KeyC' && handlers.camera) handlers.camera();
      if (e.code === 'KeyM' && handlers.music) handlers.music();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

    document.querySelectorAll('#touch [data-t]').forEach(el => {
      const k = el.getAttribute('data-t');
      const on = e => { e.preventDefault(); touch[k] = true; el.classList.add('on'); };
      const off = e => { e.preventDefault(); touch[k] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off);
      el.addEventListener('pointerleave', off);
    });
  }

  function on(name, fn) { handlers[name] = fn; }

  let padPauseLatch = false;
  function poll(dt) {
    const left = keys.ArrowLeft || keys.KeyA || touch.left;
    const right = keys.ArrowRight || keys.KeyD || touch.right;
    let target = (right ? 1 : 0) - (left ? 1 : 0);
    let throttle = (keys.ArrowUp || keys.KeyW || touch.gas) ? 1 : 0;
    let brake = (keys.ArrowDown || keys.KeyS || touch.brake) ? 1 : 0;
    let hand = !!keys.Space;
    let reset = !!keys.KeyR;
    let analog = false;

    // oyun kolu (varsa)
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p) continue;
      const ax = p.axes[0] || 0;
      if (Math.abs(ax) > 0.15) { target = ax; analog = true; }
      const rt = p.buttons[7] ? p.buttons[7].value : 0;
      const lt = p.buttons[6] ? p.buttons[6].value : 0;
      const aBtn = p.buttons[0] && p.buttons[0].pressed, bBtn = p.buttons[1] && p.buttons[1].pressed;
      throttle = Math.max(throttle, rt > 0.05 ? rt : 0, aBtn ? 1 : 0);
      brake = Math.max(brake, lt > 0.05 ? lt : 0, bBtn ? 1 : 0);
      if (p.buttons[2] && p.buttons[2].pressed) hand = true;
      if (p.buttons[3] && p.buttons[3].pressed) reset = true;
      const start = p.buttons[9] && p.buttons[9].pressed;
      if (start && !padPauseLatch && handlers.pause) handlers.pause('Start');
      padPauseLatch = start;
      break;
    }

    // klavyede direksiyonu yumuşat
    if (analog) state.steer = target;
    else {
      const rate = target === 0 ? 8 : (Math.sign(target) !== Math.sign(state.steer) ? 10 : 5);
      const d = target - state.steer;
      state.steer += U.clamp(d, -rate * dt, rate * dt);
    }
    state.throttle = throttle;
    state.brake = brake;
    state.hand = hand;
    state.reset = reset && !resetLatch;
    resetLatch = reset;
    return state;
  }

  function clear() {
    for (const k in keys) keys[k] = false;
    for (const k in touch) touch[k] = false;
    state.steer = 0;
  }

  return { init, on, poll, clear, state };
})();
