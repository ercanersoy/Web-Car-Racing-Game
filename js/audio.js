/* Web Car Racing Game - Web Audio API ile yazılımsal müzik ve ses efektleri */
'use strict';

const Sound = (() => {
  let ac = null, master, musicBus, sfxBus, noiseBuf;
  let engine = null, skid = null;
  let lastHit = 0;

  function ensure() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain(); master.connect(ac.destination);
    // yumuşak sınırlayıcı
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -12; comp.ratio.value = 4;
    comp.connect(master);
    musicBus = ac.createGain(); musicBus.connect(comp);
    sfxBus = ac.createGain(); sfxBus.connect(comp);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    apply();
    return ac;
  }

  function apply() {
    if (!ac) return;
    musicBus.gain.value = Settings.get('music') ? Settings.get('musicVolume') * 0.55 : 0;
    sfxBus.gain.value = Settings.get('sfx') ? Settings.get('sfxVolume') : 0;
  }

  function suspend() { if (ac && ac.state === 'running') ac.suspend(); }
  function resume() { if (ac && ac.state === 'suspended') ac.resume(); }

  const midi = m => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- ses efektleri ---------- */
  function beep(freq, dur, type, vol) {
    if (!ensure()) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function click() { beep(880, 0.06, 'triangle', 0.15); }

  function hit(strength) {
    if (!ac) return;
    const now = performance.now();
    if (now - lastHit < 150) return;
    lastHit = now;
    const t = ac.currentTime;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500 + strength * 700;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.2 + strength * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t, Math.random() * 0.5); src.stop(t + 0.3);
  }

  function engineStart() {
    if (!ensure() || engine) return;
    const o1 = ac.createOscillator(), o2 = ac.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'square';
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 2;
    const g = ac.createGain(); g.gain.value = 0;
    const g2 = ac.createGain(); g2.gain.value = 0.35;
    o1.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(sfxBus);
    o1.start(); o2.start();
    engine = { o1, o2, f, g };

    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const sf = ac.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1400; sf.Q.value = 1.5;
    const sg = ac.createGain(); sg.gain.value = 0;
    s.connect(sf); sf.connect(sg); sg.connect(sfxBus); s.start();
    skid = { s, sg };
  }

  /* rpm: 0..1, gear: 1..6, throttle: 0..1, skidAmt: 0..1 */
  function engineUpdate(rpm, gear, throttle, skidAmt) {
    if (!engine) return;
    const t = ac.currentTime;
    const on = Settings.get('engineSound');
    const g = typeof gear === 'number' ? gear : 1;
    const freq = 42 + rpm * 95 + g * 7;
    engine.o1.frequency.setTargetAtTime(freq, t, 0.05);
    engine.o2.frequency.setTargetAtTime(freq * 0.5, t, 0.05);
    engine.f.frequency.setTargetAtTime(350 + rpm * 900 + throttle * 500, t, 0.05);
    engine.g.gain.setTargetAtTime(on ? 0.07 + throttle * 0.07 : 0, t, 0.08);
    skid.sg.gain.setTargetAtTime(skidAmt * 0.12, t, 0.05);
  }

  function engineStop() {
    if (!engine) return;
    const t = ac.currentTime;
    engine.g.gain.setTargetAtTime(0, t, 0.05);
    skid.sg.gain.setTargetAtTime(0, t, 0.05);
    const e = engine, s = skid;
    setTimeout(() => { try { e.o1.stop(); e.o2.stop(); s.s.stop(); } catch (er) { /* */ } }, 300);
    engine = null; skid = null;
  }

  /* ---------- prosedürel müzik ---------- */
  const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], major: [0, 2, 4, 5, 7, 9, 11],
    mixo: [0, 2, 4, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10]
  };
  const PROGS = [[0, 5, 3, 4], [0, 3, 4, 4], [0, 6, 5, 4], [0, 4, 5, 3], [0, 2, 5, 4], [0, 5, 6, 4], [0, 0, 3, 4], [5, 3, 0, 4]];
  const KICKS = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0]
  ];

  let song = null, timer = null, nextTime = 0, step = 0;

  function compose(seed, mood) {
    const r = U.rng(seed * 2654435761 >>> 0);
    const pick = a => a[Math.floor(r() * a.length)];
    const menu = mood === 'menu';
    const scale = SCALES[menu ? pick(['major', 'dorian', 'mixo']) : pick(['minor', 'dorian', 'minor', 'mixo', 'phrygian', 'major'])];
    const root = 36 + Math.floor(r() * 8);
    const bpm = menu ? 92 + Math.floor(r() * 14) : 124 + Math.floor(r() * 26);
    const prog = pick(PROGS);
    const kick = pick(KICKS);
    const hat16 = r() < 0.5;
    const bass = [];
    for (let i = 0; i < 16; i++) {
      if (i === 0) bass.push({ o: 0 });
      else if (r() < (i % 2 === 0 ? 0.55 : 0.2)) bass.push({ o: r() < 0.25 ? 12 : (r() < 0.2 ? 7 : 0) });
      else bass.push(null);
    }
    const motif = () => {
      const m = []; let deg = 7 + Math.floor(r() * 4);
      for (let i = 0; i < 32; i++) {
        const p = i % 4 === 0 ? 0.6 : (i % 2 === 0 ? 0.4 : 0.15);
        if (r() < p) {
          deg = U.clamp(deg + Math.floor(r() * 5) - 2, 4, 14);
          m.push({ d: deg, len: 1 + Math.floor(r() * 3) });
        } else m.push(null);
      }
      return m;
    };
    const leadA = motif(), leadB = motif();
    const leadWave = pick(['square', 'triangle', 'sawtooth']);
    const arp = r() < 0.6;
    // bölümler (8'er ölçü): giriş, A, B, A, ara, B
    const sections = menu ? ['pad', 'padlead', 'padlead2', 'pad'] : ['intro', 'A', 'B', 'A', 'break', 'B'];
    return { scale, root, bpm, prog, kick, hat16, bass, leadA, leadB, leadWave, arp, sections, menu };
  }

  function degNote(s, deg) {
    const oct = Math.floor(deg / 7), d = ((deg % 7) + 7) % 7;
    return s.root + s.scale[d] + 12 * oct;
  }

  function voice(type, freq, t, dur, vol, cutoff, attack) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    let node = o;
    if (cutoff) {
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
      o.connect(f); node = f;
    }
    const a = attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.02, dur));
    node.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function drum(kind, t) {
    if (kind === 'kick') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.3);
    } else {
      const src = ac.createBufferSource(); src.buffer = noiseBuf;
      const f = ac.createBiquadFilter(); f.type = 'highpass';
      f.frequency.value = kind === 'hat' ? 7000 : 1200;
      const g = ac.createGain();
      const dur = kind === 'hat' ? 0.04 : 0.16;
      g.gain.setValueAtTime(kind === 'hat' ? 0.12 : 0.38, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(musicBus);
      src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.02);
    }
  }

  function scheduleStep(st, t) {
    const s = song, sd = 60 / s.bpm / 4;
    const bar = Math.floor(st / 16), i = st % 16;
    let secIdx = Math.floor(bar / 8);
    // giriş bir kez çalar, sonra döngü
    if (secIdx >= s.sections.length) secIdx = 1 + ((secIdx - 1) % (s.sections.length - 1));
    const sec = s.sections[secIdx];
    const chordDeg = s.prog[bar % 4];

    if (s.menu) {
      if (i === 0) {
        [0, 2, 4].forEach(k => voice('triangle', midi(degNote(s, chordDeg + k) + 12), t, sd * 16, 0.06, 1800, 0.4));
        voice('sine', midi(degNote(s, chordDeg)), t, sd * 14, 0.18, 0, 0.05);
      }
      if (i % 4 === 0 && sec !== 'pad') drum('hat', t);
      if (i === 8) voice('sine', midi(degNote(s, chordDeg) + 7), t, sd * 6, 0.1);
      if (sec !== 'pad') {
        const lead = sec === 'padlead2' ? s.leadB : s.leadA;
        const n = lead[(bar % 2) * 16 + i];
        if (n && i % 2 === 0) voice('triangle', midi(degNote(s, n.d + chordDeg % 2) + 12), t, sd * n.len * 2, 0.08, 2500, 0.02);
      }
      return;
    }

    const drums = sec !== 'break';
    if (drums) {
      if (s.kick[i]) drum('kick', t);
      if (i === 4 || i === 12) drum('snare', t);
      if (s.hat16 ? true : i % 2 === 0) drum('hat', t);
    } else if (i === 0) drum('kick', t);

    const b = s.bass[i];
    if (b && sec !== 'break') voice('sawtooth', midi(degNote(s, chordDeg) + b.o), t, sd * 1.6, 0.22, 700);
    if (sec === 'break' && i === 0) voice('triangle', midi(degNote(s, chordDeg)), t, sd * 15, 0.2, 900, 0.1);

    if (sec === 'A' || sec === 'B' || sec === 'break') {
      const lead = sec === 'B' ? s.leadB : s.leadA;
      const n = lead[(bar % 2) * 16 + i];
      if (n) voice(s.leadWave, midi(degNote(s, n.d + (chordDeg === 4 ? 1 : 0)) + 12), t, sd * n.len, 0.07, 3200);
    }
    if (s.arp && (sec === 'B' || sec === 'intro')) {
      const k = [0, 2, 4, 7][i % 4];
      voice('square', midi(degNote(s, chordDeg + k) + 24), t, sd * 0.8, 0.025, 2000);
    }
  }

  function tick() {
    if (!ac || !song || ac.state !== 'running') return;
    const sd = 60 / song.bpm / 4;
    if (nextTime < ac.currentTime - 0.05) nextTime = ac.currentTime + 0.05;
    while (nextTime < ac.currentTime + 0.15) {
      if (Settings.get('music') && Settings.get('musicVolume') > 0) scheduleStep(step, nextTime);
      nextTime += sd; step++;
    }
  }

  function playMusic(seed, mood) {
    stopMusic();
    if (!ensure()) return;
    song = compose(seed, mood);
    step = 0;
    nextTime = ac.currentTime + 0.1;
    timer = setInterval(tick, 40);
  }

  function stopMusic() {
    if (timer) clearInterval(timer);
    timer = null; song = null;
  }

  return { ensure, apply, suspend, resume, beep, click, hit, engineStart, engineUpdate, engineStop, playMusic, stopMusic, get ready() { return !!ac; } };
})();
