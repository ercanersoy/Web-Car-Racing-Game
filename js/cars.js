/* Web Car Racing Game - araç modelleri, renkler ve sprite üretimi */
'use strict';

const CAR_MODELS = [
  {
    id: 'ruzgar', name: 'Model 1',
    maxSpeed: 545, accel: 300, turn: 2.6, grip: 7.5, brake: 650, mass: 1.0, offroad: 0.55,
    len: 44, wid: 22, body: 'coupe'
  },
  {
    id: 'simsek', name: 'Model 2',
    maxSpeed: 615, accel: 275, turn: 2.3, grip: 6.4, brake: 610, mass: 0.95, offroad: 0.5,
    len: 48, wid: 22, body: 'super'
  },
  {
    id: 'kartal', name: 'Model 3',
    maxSpeed: 525, accel: 315, turn: 3.0, grip: 9.5, brake: 700, mass: 0.95, offroad: 0.55,
    len: 42, wid: 21, body: 'roadster'
  },
  {
    id: 'tank', name: 'Model 4',
    maxSpeed: 530, accel: 255, turn: 2.4, grip: 8.0, brake: 620, mass: 1.6, offroad: 0.8,
    len: 48, wid: 25, body: 'suv'
  },
  {
    id: 'cita', name: 'Model 5',
    maxSpeed: 495, accel: 410, turn: 3.2, grip: 8.6, brake: 720, mass: 0.75, offroad: 0.6,
    len: 36, wid: 20, body: 'mini'
  }
];

/* Renk adları i18n.js içinde: 'color.<id>' */
const CAR_COLORS = [
  { id: 'kirmizi', hex: '#c4474f' },
  { id: 'mavi', hex: '#3f74b8' },
  { id: 'sari', hex: '#d8b442' },
  { id: 'yesil', hex: '#4f9a68' },
  { id: 'turuncu', hex: '#d47f3c' },
  { id: 'mor', hex: '#7f5aa8' },
  { id: 'beyaz', hex: '#d9dcdf' },
  { id: 'siyah', hex: '#3a3e44' }
];

const Cars = (() => {
  /* Menüde gösterilecek 0-10 arası özellik puanları */
  function stats(m) {
    const s = (v, a, b) => Math.round(U.clamp((v - a) / (b - a), 0, 1) * 8 + 2);
    return [
      [I18N.t('stat.speed'), s(m.maxSpeed, 470, 625)],
      [I18N.t('stat.accel'), s(m.accel, 240, 420)],
      [I18N.t('stat.handling'), s(m.turn * m.grip, 13, 30)],
      [I18N.t('stat.durability'), s(m.mass, 0.7, 1.65)],
      [I18N.t('stat.offroad'), s(m.offroad, 0.45, 0.82)]
    ];
  }

  /* Araç, +x yönüne bakacak şekilde çizilir (merkez 0,0). */
  function drawCar(ctx, m, hex) {
    const L = m.len, W = m.wid, hl = L / 2, hw = W / 2;
    const dark = U.shade(hex, -0.35), light = U.shade(hex, 0.35);

    // Not: gölge burada çizilmez; Render, dünyaya göre sabit ışık yönüyle ayrıca çizer.

    // tekerlekler
    ctx.fillStyle = '#111';
    const tw = m.body === 'suv' ? 11 : 9, th = 4;
    const tx = hl * 0.58;
    [[tx, -hw - 1], [tx, hw - th + 1], [-tx, -hw - 1], [-tx, hw - th + 1]].forEach(p => {
      ctx.fillRect(p[0] - tw / 2, p[1], tw, th);
    });

    // gövde
    const r = m.body === 'mini' ? 8 : (m.body === 'suv' ? 5 : 7);
    ctx.fillStyle = hex;
    U.roundRect(ctx, -hl, -hw, L, W, r); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.stroke();

    // kaput ışıltısı
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.35;
    U.roundRect(ctx, hl * 0.25, -hw * 0.6, hl * 0.6, hw * 1.2, 4); ctx.fill();
    ctx.globalAlpha = 1;

    const glass = '#22303f';
    if (m.body === 'roadster') {
      // açık kokpit
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.moveTo(hl * 0.18, -hw * 0.75); ctx.lineTo(hl * 0.28, -hw * 0.75);
      ctx.lineTo(hl * 0.28, hw * 0.75); ctx.lineTo(hl * 0.18, hw * 0.75); ctx.fill();
      ctx.fillStyle = '#3a2a22';
      U.roundRect(ctx, -hl * 0.35, -hw * 0.68, hl * 0.48, hw * 0.6, 3); ctx.fill();
      U.roundRect(ctx, -hl * 0.35, hw * 0.08, hl * 0.48, hw * 0.6, 3); ctx.fill();
    } else {
      // ön cam
      ctx.fillStyle = glass;
      const fw = m.body === 'super' ? 0.05 : 0.15;
      ctx.beginPath();
      ctx.moveTo(hl * (fw + 0.25), -hw * 0.72); ctx.lineTo(hl * (fw + 0.25), hw * 0.72);
      ctx.lineTo(hl * fw - 2, hw * 0.62); ctx.lineTo(hl * fw - 2, -hw * 0.62); ctx.closePath(); ctx.fill();
      // tavan
      const roofBack = m.body === 'suv' ? -hl * 0.78 : (m.body === 'super' ? -hl * 0.3 : -hl * 0.45);
      ctx.fillStyle = U.shade(hex, -0.12);
      U.roundRect(ctx, roofBack, -hw * 0.62, hl * fw - 2 - roofBack, hw * 1.24, 3); ctx.fill();
      // arka cam
      ctx.fillStyle = glass;
      ctx.fillRect(roofBack - 4, -hw * 0.58, 4, hw * 1.16);
      if (m.body === 'suv') {
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const x = roofBack + 4 + i * (hl * 0.18);
          ctx.beginPath(); ctx.moveTo(x, -hw * 0.5); ctx.lineTo(x, hw * 0.5); ctx.stroke();
        }
      }
    }

    // yarış şeridi
    if (m.body === 'coupe' || m.body === 'mini') {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(hl * 0.3, -2, hl * 0.62, 1.6);
      ctx.fillRect(hl * 0.3, 0.6, hl * 0.62, 1.6);
    }
    // spoiler
    if (m.body === 'super' || m.body === 'coupe') {
      ctx.fillStyle = dark;
      ctx.fillRect(-hl + 1, -hw - (m.body === 'super' ? 2 : 0), 4, W + (m.body === 'super' ? 4 : 0));
    }

    // farlar ve stoplar
    ctx.fillStyle = '#ece6c4';
    ctx.fillRect(hl - 3, -hw + 2, 3, 4); ctx.fillRect(hl - 3, hw - 6, 3, 4);
    ctx.fillStyle = '#8a0f14';
    ctx.fillRect(-hl, -hw + 2, 2, 4); ctx.fillRect(-hl, hw - 6, 2, 4);
  }

  const spriteCache = {};
  const SPRITE_SCALE = 2;
  /* Her model/renk için önceden çizilmiş sprite (her karede yeniden çizmemek için) */
  function sprite(modelIdx, colorHex) {
    const key = modelIdx + colorHex;
    if (spriteCache[key]) return spriteCache[key];
    const m = CAR_MODELS[modelIdx];
    const pad = 6;
    const c = U.makeCanvas((m.len + pad * 2) * SPRITE_SCALE, (m.wid + pad * 2) * SPRITE_SCALE);
    const ctx = c.getContext('2d');
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
    ctx.translate(m.len / 2 + pad, m.wid / 2 + pad);
    drawCar(ctx, m, colorHex);
    const sp = { canvas: c, w: m.len + pad * 2, h: m.wid + pad * 2 };
    spriteCache[key] = sp;
    return sp;
  }

  return { stats, sprite, drawCar };
})();
