/* Web Car Racing Game - Canvas 2D çizim */
'use strict';

const Render = (() => {
  const sceneryCache = {};

  /* Çevre nesneleri için önceden çizilmiş küçük sprite'lar */
  function scenerySprite(type) {
    if (sceneryCache[type]) return sceneryCache[type];
    const S = 96, c = U.makeCanvas(S, S), x = c.getContext('2d');
    x.translate(S / 2, S / 2);
    const circle = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, U.TAU); x.fill(); };
    const shadow = (r) => circle(6, 7, r, 'rgba(0,0,0,0.22)');
    switch (type) {
      case 'tree': shadow(30); circle(0, 0, 30, '#2f6e2a'); circle(-7, -7, 20, '#3d8a35'); circle(-11, -11, 9, '#58a64a'); break;
      case 'tree_or': shadow(30); circle(0, 0, 30, '#b8561c'); circle(-7, -7, 20, '#d9792a'); circle(-11, -11, 9, '#f0a04a'); break;
      case 'tree_red': shadow(28); circle(0, 0, 28, '#8e2a1d'); circle(-6, -6, 19, '#b33c26'); circle(-10, -10, 8, '#d9603e'); break;
      case 'tree_dark': shadow(26); circle(0, 0, 26, '#0f2a1a'); circle(-6, -6, 17, '#173a25'); break;
      case 'bush': shadow(16); circle(-8, 2, 13, '#3a7a2f'); circle(8, 0, 14, '#468c39'); circle(0, -6, 12, '#55a046'); break;
      case 'drybush': shadow(14); x.strokeStyle = '#7a5a2a'; x.lineWidth = 3;
        for (let i = 0; i < 9; i++) { const a = i / 9 * U.TAU; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); x.stroke(); } break;
      case 'flower': for (let i = 0; i < 6; i++) { const a = i / 6 * U.TAU; circle(Math.cos(a) * 9, Math.sin(a) * 9, 4, ['#f4d03f', '#e74c3c', '#ffffff'][i % 3]); } break;
      case 'rock': x.fillStyle = 'rgba(0,0,0,0.22)'; x.beginPath(); x.ellipse(5, 6, 22, 16, 0, 0, U.TAU); x.fill();
        x.fillStyle = '#7d7a75'; x.beginPath(); x.moveTo(-20, 4); x.lineTo(-10, -14); x.lineTo(10, -16); x.lineTo(22, 0); x.lineTo(12, 14); x.lineTo(-12, 14); x.closePath(); x.fill();
        x.fillStyle = '#99958e'; x.beginPath(); x.moveTo(-10, -14); x.lineTo(10, -16); x.lineTo(4, -2); x.lineTo(-12, 0); x.closePath(); x.fill(); break;
      case 'snowrock': x.fillStyle = '#6c7682'; x.beginPath(); x.moveTo(-20, 4); x.lineTo(-10, -14); x.lineTo(10, -16); x.lineTo(22, 0); x.lineTo(12, 14); x.lineTo(-12, 14); x.closePath(); x.fill();
        circle(-2, -6, 11, '#f5f8fb'); break;
      case 'cactus': shadow(10); x.fillStyle = '#2f7d3a'; U.roundRect(x, -6, -24, 12, 48, 6); x.fill();
        U.roundRect(x, -20, -6, 14, 8, 4); x.fill(); U.roundRect(x, 6, -14, 14, 8, 4); x.fill();
        x.fillStyle = '#4aa055'; x.fillRect(-2, -20, 3, 40); break;
      case 'pine': shadow(30);
        circle(0, 0, 30, '#1f4d34'); circle(0, 0, 22, '#2a6343'); circle(0, 0, 13, '#3a7a55'); circle(-3, -3, 8, '#e9f1f5'); break;
      case 'snowman': circle(4, 5, 16, 'rgba(0,0,0,0.15)'); circle(0, 0, 16, '#fff'); circle(0, 0, 10, '#f2f6f9'); circle(0, 0, 3, '#f07a1a'); break;
      case 'hay': shadow(18); circle(0, 0, 18, '#d8b04a'); x.strokeStyle = '#b48b2c'; x.lineWidth = 2;
        for (let r = 5; r < 18; r += 5) { x.beginPath(); x.arc(0, 0, r, 0, U.TAU); x.stroke(); } break;
      case 'building': x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(-30, -30, 70, 70);
        x.fillStyle = '#2b3240'; x.fillRect(-36, -36, 66, 66); x.fillStyle = '#3a4456'; x.fillRect(-30, -30, 54, 54);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { x.fillStyle = (i * 3 + j) % 4 === 0 ? '#ffd76a' : '#1c2230'; x.fillRect(-26 + i * 17, -26 + j * 17, 10, 10); } break;
      case 'lamp': { const g = x.createRadialGradient(0, 0, 2, 0, 0, 46); g.addColorStop(0, 'rgba(255,220,120,0.55)'); g.addColorStop(1, 'rgba(255,220,120,0)');
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, 46, 0, U.TAU); x.fill(); circle(0, 0, 5, '#fff3c4'); break; }
    }
    sceneryCache[type] = c;
    return c;
  }

  /* Pist yolları (Path2D) bir kez oluşturulur */
  function paths(t) {
    if (t.paths) return t.paths;
    const center = new Path2D();
    center.moveTo(t.xs[0], t.ys[0]);
    for (let i = 1; i < t.n; i++) center.lineTo(t.xs[i], t.ys[i]);
    center.closePath();
    const poly = (arr) => {
      const p = new Path2D();
      p.moveTo(arr[0], arr[1]);
      for (let i = 2; i < arr.length; i += 2) p.lineTo(arr[i], arr[i + 1]);
      p.closePath();
      return p;
    };
    t.paths = { center, left: poly(t.barrierL), right: poly(t.barrierR) };
    return t.paths;
  }

  function drawLine(ctx, t, i, color2) {
    // başlangıç / bitiş çizgisi (dama deseni)
    const h = t.heading[i], x = t.xs[i], y = t.ys[i];
    ctx.save();
    ctx.translate(x, y); ctx.rotate(h);
    const sq = 10, cols = Math.ceil(t.width / sq);
    for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#111' : (color2 || '#fff');
      ctx.fillRect(-sq + r * sq, -t.half + c * sq, sq, Math.min(sq, t.width - c * sq));
    }
    ctx.restore();
  }

  /*
   * Dünyayı çizer.
   * cam: { x, y, rot, zoom }  opts: { skip: car, mirror: bool, quality }
   */
  function world(ctx, race, cam, W, H, opts) {
    const t = race.track, th = t.theme, P = paths(t);
    const q = opts.quality;
    ctx.fillStyle = th.ground;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    if (opts.mirror) ctx.scale(-1, 1);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.rotate(cam.rot);
    ctx.translate(-cam.x, -cam.y);

    const viewR = Math.hypot(W, H) / 2 / cam.zoom + 60;
    const vr2 = (viewR + 150) * (viewR + 150);

    // zemin lekeleri
    if (q !== 'low' && !opts.mirror) {
      ctx.fillStyle = th.patch;
      ctx.beginPath();
      for (const p of t.patches) {
        const dx = p.x - cam.x, dy = p.y - cam.y;
        if (dx * dx + dy * dy > vr2) continue;
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, U.TAU);
      }
      ctx.fill();
    }

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // bariyerler
    ctx.strokeStyle = th.barrier; ctx.lineWidth = 12;
    ctx.stroke(P.left); ctx.stroke(P.right);
    ctx.strokeStyle = th.barrier2; ctx.lineWidth = 6;
    ctx.setLineDash([22, 22]);
    ctx.stroke(P.left); ctx.stroke(P.right);
    // bordürler
    ctx.lineWidth = t.width + 18;
    ctx.strokeStyle = th.curbA; ctx.setLineDash([]);
    ctx.stroke(P.center);
    ctx.strokeStyle = th.curbB; ctx.setLineDash([28, 28]); ctx.lineCap = 'butt';
    ctx.stroke(P.center);
    // yol
    ctx.setLineDash([]); ctx.lineCap = 'round';
    ctx.lineWidth = t.width; ctx.strokeStyle = th.road;
    ctx.stroke(P.center);
    // orta şerit
    ctx.lineWidth = 3; ctx.strokeStyle = th.line; ctx.globalAlpha = 0.55;
    ctx.setLineDash([40, 50]); ctx.lineCap = 'butt';
    ctx.stroke(P.center);
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // çizgiler
    drawLine(ctx, t, 0);
    if (race.mode === 'sprint') drawLine(ctx, t, t.sprintIdx, '#ffd23a');

    // fren izleri
    if (race.skidCount && !opts.mirror) {
      ctx.strokeStyle = 'rgba(20,20,20,0.28)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      const s = race.skids;
      for (let i = 0; i < race.skidCount; i++) {
        const k = i * 4;
        const dx = s[k] - cam.x, dy = s[k + 1] - cam.y;
        if (dx * dx + dy * dy > vr2) continue;
        ctx.moveTo(s[k], s[k + 1]); ctx.lineTo(s[k + 2], s[k + 3]);
      }
      ctx.stroke();
    }

    // parçacıklar
    if (race.particles.length && !opts.mirror) {
      for (const p of race.particles) {
        ctx.globalAlpha = (p.life / p.max) * 0.8;
        ctx.fillStyle = p.color;
        const r = p.size * (1.6 - p.life / p.max);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, U.TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // araçlar
    for (const car of race.cars) {
      if (car === opts.skip) continue;
      const dx = car.x - cam.x, dy = car.y - cam.y;
      if (dx * dx + dy * dy > vr2) continue;
      const sp = Cars.sprite(car.modelIdx, car.color);
      ctx.save();
      ctx.translate(car.x, car.y); ctx.rotate(car.angle);
      if (th.night && q !== 'low') {
        const g = ctx.createLinearGradient(car.model.len / 2, 0, car.model.len / 2 + 170, 0);
        g.addColorStop(0, 'rgba(255,245,200,0.35)'); g.addColorStop(1, 'rgba(255,245,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(car.model.len / 2, -6); ctx.lineTo(car.model.len / 2 + 170, -55);
        ctx.lineTo(car.model.len / 2 + 170, 55); ctx.lineTo(car.model.len / 2, 6); ctx.fill();
      }
      ctx.drawImage(sp.canvas, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
      if (car.brake > 0 && car.vf > 0) {
        ctx.fillStyle = 'rgba(255,40,40,0.9)';
        const hl = car.model.len / 2, hw = car.model.wid / 2;
        ctx.fillRect(-hl - 2, -hw + 2, 3, 4); ctx.fillRect(-hl - 2, hw - 6, 3, 4);
      }
      ctx.restore();
    }

    // çevre nesneleri
    if (!(opts.mirror && q === 'low')) {
      for (const s of t.scenery) {
        const dx = s.x - cam.x, dy = s.y - cam.y;
        if (dx * dx + dy * dy > vr2) continue;
        const img = scenerySprite(s.type);
        const size = 48 * s.s;
        if (s.type === 'building' || s.type === 'rock' || s.type === 'snowrock') {
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
          ctx.drawImage(img, -size, -size, size * 2, size * 2);
          ctx.restore();
        } else {
          ctx.drawImage(img, s.x - size, s.y - size, size * 2, size * 2);
        }
      }
    }
    ctx.restore();
  }

  /* Mini harita arka planı (bir kez çizilir) */
  function minimapBase(t, size) {
    const c = U.makeCanvas(size, size), x = c.getContext('2d');
    const b = t.bounds, pad = 12;
    const s = Math.min((size - pad * 2) / (b.maxX - b.minX), (size - pad * 2) / (b.maxY - b.minY));
    const ox = (size - (b.maxX - b.minX) * s) / 2 - b.minX * s;
    const oy = (size - (b.maxY - b.minY) * s) / 2 - b.minY * s;
    x.lineJoin = 'round';
    x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 7;
    x.beginPath();
    for (let i = 0; i < t.n; i += 3) { const px = t.xs[i] * s + ox, py = t.ys[i] * s + oy; i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.closePath(); x.stroke();
    x.strokeStyle = '#e8e8e8'; x.lineWidth = 3; x.stroke();
    const sx = t.xs[0] * s + ox, sy = t.ys[0] * s + oy;
    x.fillStyle = '#fff'; x.fillRect(sx - 3, sy - 3, 6, 6);
    return { canvas: c, s, ox, oy };
  }

  /* Menüdeki harita küçük resmi */
  function thumbnail(canvas, t) {
    const x = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    x.fillStyle = t.theme.ground; x.fillRect(0, 0, W, H);
    const b = t.bounds, pad = 10;
    const s = Math.min((W - pad * 2) / (b.maxX - b.minX), (H - pad * 2) / (b.maxY - b.minY));
    const ox = (W - (b.maxX - b.minX) * s) / 2 - b.minX * s;
    const oy = (H - (b.maxY - b.minY) * s) / 2 - b.minY * s;
    x.lineJoin = 'round';
    x.beginPath();
    for (let i = 0; i < t.n; i += 4) { const px = t.xs[i] * s + ox, py = t.ys[i] * s + oy; i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.closePath();
    x.strokeStyle = t.theme.curbA; x.lineWidth = Math.max(4, t.width * s + 3); x.stroke();
    x.strokeStyle = t.theme.road; x.lineWidth = Math.max(3, t.width * s); x.stroke();
    x.fillStyle = '#fff';
    x.beginPath(); x.arc(t.xs[0] * s + ox, t.ys[0] * s + oy, 3, 0, U.TAU); x.fill();
  }

  return { world, minimapBase, thumbnail };
})();
