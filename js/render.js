/* Web Car Racing Game - Canvas 2D çizim
 *
 * Tüm görseller kuşbakışıdır (tam yukarıdan). Gölgeler dünyaya göre sabit bir ışık
 * yönüyle (sol üstten) düşer; nesne ya da araç dönse de gölge yönü değişmez.
 */
'use strict';

const Render = (() => {
  const SHADOW_X = 6, SHADOW_Y = 8;             // dünya birimi, ışık sol üstten
  const NO_SHADOW = { flower: 1, lamp: 1 };
  const bodyCache = {}, shadowCache = {};

  /* ---------- çevre nesneleri (kuşbakışı) ---------- */
  function drawScenery(x, type) {
    const circle = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, U.TAU); x.fill(); };
    const poly = (pts, col) => {
      x.fillStyle = col; x.beginPath(); x.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]);
      x.closePath(); x.fill();
    };
    const star = (n, ro, ri, col, rot) => {
      const p = [];
      for (let i = 0; i < n * 2; i++) {
        const a = (rot || 0) + i / (n * 2) * U.TAU, r = i % 2 ? ri : ro;
        p.push(Math.cos(a) * r, Math.sin(a) * r);
      }
      poly(p, col);
    };
    const canopy = (c1, c2, c3) => { circle(0, 0, 30, c1); circle(-6, -6, 21, c2); circle(-10, -10, 10, c3); };
    switch (type) {
      case 'tree': canopy('#3f6a37', '#4b7a41', '#5c8a50'); break;
      case 'tree_or': canopy('#9c5c37', '#b47344', '#c68d5c'); break;
      case 'tree_red': canopy('#7f3f33', '#97503e', '#ac6952'); break;
      case 'tree_dark': circle(0, 0, 26, '#1c3326'); circle(-5, -5, 17, '#243e2e'); break;
      case 'bush': circle(-8, 2, 13, '#4a7340'); circle(8, 0, 14, '#53804a'); circle(0, -6, 12, '#5f8c55'); break;
      case 'drybush':
        x.strokeStyle = '#86683f'; x.lineWidth = 3; x.lineCap = 'round';
        for (let i = 0; i < 9; i++) { const a = i / 9 * U.TAU; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); x.stroke(); }
        break;
      case 'flower':
        for (let i = 0; i < 6; i++) { const a = i / 6 * U.TAU; circle(Math.cos(a) * 9, Math.sin(a) * 9, 3.5, ['#d2bd6e', '#bf6d60', '#dcd7cb'][i % 3]); }
        break;
      case 'rock':
        poly([-20, 4, -12, -13, 6, -17, 21, -3, 14, 13, -9, 15], '#7f7b74');
        poly([-12, -13, 6, -17, 3, -3, -13, 0], '#958f87');
        break;
      case 'snowrock':
        poly([-20, 4, -12, -13, 6, -17, 21, -3, 14, 13, -9, 15], '#6b7480');
        poly([-15, -6, -11, -13, 6, -17, 15, -8, 4, -4, -8, 0], '#dfe4e8');   // tepedeki kar
        break;
      case 'cactus':
        // yukarıdan saguaro: gövde ve iki kol, ince sırt çizgileri
        circle(0, 0, 11, '#4f7d45'); circle(-13, 4, 6, '#4f7d45'); circle(12, -5, 6, '#4f7d45');
        x.strokeStyle = '#3f6837'; x.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) { const a = i / 8 * U.TAU; x.beginPath(); x.moveTo(Math.cos(a) * 3, Math.sin(a) * 3); x.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); x.stroke(); }
        circle(-2, -2, 3, '#6a9560');
        break;
      case 'pine':
        // yukarıdan çam: yıldız biçimli dal katmanları, dal uçlarında kar
        star(9, 30, 19, '#2c5640', 0.1);
        star(9, 21, 13, '#36664a', 0.45);
        star(7, 12, 7, '#417556', 0.2);
        for (let i = 0; i < 9; i += 2) {
          const a = 0.1 + i / 9 * U.TAU;
          circle(Math.cos(a) * 24, Math.sin(a) * 24, 3.2, '#dfe5e9');
        }
        break;
      case 'snowman':
        // yukarıdan kardan adam: gövde, baş, havuç burun ve şapka
        circle(0, 0, 16, '#e3e7eb'); circle(-3, -3, 10, '#eceff2');
        x.fillStyle = '#c47a3d'; x.beginPath(); x.moveTo(-3, -9); x.lineTo(-1, -17); x.lineTo(1, -9); x.closePath(); x.fill();
        circle(-3, -3, 5, '#3a3d42');
        break;
      case 'hay':
        circle(0, 0, 18, '#c9a755'); x.strokeStyle = '#a98a3d'; x.lineWidth = 2;
        for (let r = 5; r < 18; r += 5) { x.beginPath(); x.arc(0, 0, r, 0, U.TAU); x.stroke(); }
        break;
      case 'building':
        // yukarıdan bina çatısı: korkuluk, çatı kaplaması, klima, havalandırma, çatı kapağı
        x.fillStyle = '#3d434e'; x.fillRect(-36, -36, 72, 72);          // korkuluk
        x.fillStyle = '#4f5663'; x.fillRect(-31, -31, 62, 62);          // çatı
        x.strokeStyle = 'rgba(0,0,0,0.12)'; x.lineWidth = 1;
        for (let i = -24; i <= 24; i += 12) { x.beginPath(); x.moveTo(-31, i); x.lineTo(31, i); x.stroke(); }
        x.fillStyle = '#7a808a'; x.fillRect(-24, -24, 18, 14);          // klima ünitesi
        circle(-15, -17, 5, '#5c626c'); circle(-15, -17, 1.5, '#7a808a');
        x.fillStyle = '#7a808a'; x.fillRect(4, -24, 18, 14);
        circle(13, -17, 5, '#5c626c'); circle(13, -17, 1.5, '#7a808a');
        circle(14, 14, 9, '#626976'); circle(14, 14, 6, '#6c7380');      // su deposu
        x.fillStyle = '#353a44'; x.fillRect(-24, 8, 14, 14);           // çatı kapağı
        x.fillStyle = '#454b56'; x.fillRect(-22, 10, 10, 10);
        circle(28, -28, 2, '#a0524a');                                   // uyarı ışığı (loş)
        break;
      case 'lamp': {
        const g = x.createRadialGradient(0, 0, 2, 0, 0, 46);
        g.addColorStop(0, 'rgba(230,205,140,0.28)'); g.addColorStop(1, 'rgba(230,205,140,0)');
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, 46, 0, U.TAU); x.fill();
        circle(0, 0, 4, '#d8cfa4');
        break;
      }
    }
  }

  function scenerySprites(type) {
    if (bodyCache[type]) return [bodyCache[type], shadowCache[type]];
    const S = 96;
    const body = U.makeCanvas(S, S), x = body.getContext('2d');
    x.translate(S / 2, S / 2);
    drawScenery(x, type);
    let shadow = null;
    if (!NO_SHADOW[type]) {
      shadow = U.makeCanvas(S, S);
      const sx = shadow.getContext('2d');
      sx.drawImage(body, 0, 0);
      sx.globalCompositeOperation = 'source-in';
      sx.fillStyle = 'rgba(0,0,0,0.24)';
      sx.fillRect(0, 0, S, S);
    }
    bodyCache[type] = body; shadowCache[type] = shadow;
    return [body, shadow];
  }

  /* ---------- pist ---------- */
  function paths(t) {
    if (t.paths) return t.paths;
    const line = (xs, ys, n, closed) => {
      const p = new Path2D();
      p.moveTo(xs[0], ys[0]);
      for (let i = 1; i < n; i++) p.lineTo(xs[i], ys[i]);
      if (closed) p.closePath();
      return p;
    };
    const flat = (arr, closed) => {
      const p = new Path2D();
      p.moveTo(arr[0], arr[1]);
      for (let i = 2; i < arr.length; i += 2) p.lineTo(arr[i], arr[i + 1]);
      if (closed) p.closePath();
      return p;
    };
    const P = {
      center: line(t.xs, t.ys, t.n, t.closed),
      left: flat(t.barrierL, t.closed),
      right: flat(t.barrierR, t.closed)
    };
    if (!t.closed) {
      // yolun iki ucunu kapatan bariyerler
      const L = t.barrierL, R = t.barrierR;
      const caps = new Path2D();
      caps.moveTo(L[0], L[1]); caps.lineTo(R[0], R[1]);
      caps.moveTo(L[L.length - 2], L[L.length - 1]); caps.lineTo(R[R.length - 2], R[R.length - 1]);
      P.caps = caps;
    }
    t.paths = P;
    return P;
  }

  /* Dama desenli çizgi (bitiş) ya da düz çizgi (sprint başlangıcı) */
  function drawLine(ctx, t, i, checkered) {
    const h = t.heading[i], x = t.xs[i], y = t.ys[i];
    ctx.save();
    ctx.translate(x, y); ctx.rotate(h);
    if (checkered) {
      const sq = 10, cols = Math.ceil(t.width / sq);
      for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#2c2f34' : '#d6d5cc';
        ctx.fillRect(-sq + r * sq, -t.half + c * sq, sq, Math.min(sq, t.width - c * sq));
      }
    } else {
      ctx.fillStyle = '#d6d5cc';
      ctx.fillRect(-3, -t.half, 6, t.width);
    }
    ctx.restore();
  }

  /* Başlangıç ızgarası kutucukları */
  function drawGrid(ctx, race) {
    const t = race.track;
    ctx.strokeStyle = 'rgba(214,213,204,0.45)'; ctx.lineWidth = 2;
    for (let k = 0; k < race.cars.length; k++) {
      const row = Math.floor(k / 2), col = k % 2;
      const i = t.wrap(t.startIdx - (6 + row * 8 + col * 4));
      const lat = (col === 0 ? -1 : 1) * t.half * 0.42;
      ctx.save();
      ctx.translate(t.xs[i] + t.nx[i] * lat, t.ys[i] + t.ny[i] * lat);
      ctx.rotate(t.heading[i]);
      ctx.beginPath();
      ctx.moveTo(-6, -16); ctx.lineTo(30, -16); ctx.moveTo(30, -16); ctx.lineTo(30, 16); ctx.lineTo(-6, 16);
      ctx.stroke();
      ctx.restore();
    }
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

    // çevre nesneleri: pistten ÖNCE çizilir; böylece bina, ağaç, gölge ya da lamba ışığı
    // hiçbir zaman pistin, bariyerin veya araçların önüne geçmez (önce gölgeler, sonra gövdeler)
    if (!(opts.mirror && q === 'low')) {
      const items = [];
      for (const s of t.scenery) {
        const dx = s.x - cam.x, dy = s.y - cam.y;
        if (dx * dx + dy * dy <= vr2) items.push(s);
      }
      for (let pass = 0; pass < 2; pass++) {
        for (const s of items) {
          const spr = scenerySprites(s.type)[pass === 0 ? 1 : 0];
          if (!spr) continue;
          const size = 48 * s.s;
          const ox = pass === 0 ? SHADOW_X * s.s : 0, oy = pass === 0 ? SHADOW_Y * s.s : 0;
          ctx.save();
          ctx.translate(s.x + ox, s.y + oy); ctx.rotate(s.rot);
          ctx.drawImage(spr, -size, -size, size * 2, size * 2);
          ctx.restore();
        }
      }
    }
    ctx.lineJoin = 'round';
    // bariyerler (kesik çizgi yok: hızla kayan sık desen göz yorar)
    ctx.lineCap = 'round';
    ctx.strokeStyle = th.barrier; ctx.lineWidth = 11;
    ctx.stroke(P.left); ctx.stroke(P.right);
    if (P.caps) ctx.stroke(P.caps);
    ctx.strokeStyle = th.barrier2; ctx.lineWidth = 3;
    ctx.stroke(P.left); ctx.stroke(P.right);
    if (P.caps) ctx.stroke(P.caps);
    // bordürler (uzun, yumuşak renkli şeritler)
    const cap = t.closed ? 'round' : 'butt';
    ctx.lineCap = cap;
    ctx.lineWidth = t.width + 14;
    ctx.strokeStyle = th.curbA;
    ctx.stroke(P.center);
    ctx.strokeStyle = th.curbB; ctx.setLineDash([50, 50]); ctx.lineCap = 'butt';
    ctx.stroke(P.center);
    // yol
    ctx.setLineDash([]); ctx.lineCap = cap;
    ctx.lineWidth = t.width; ctx.strokeStyle = th.road;
    ctx.stroke(P.center);
    // orta şerit
    ctx.lineWidth = 3; ctx.strokeStyle = th.line; ctx.globalAlpha = 0.35;
    ctx.setLineDash([50, 90]); ctx.lineCap = 'butt';
    ctx.stroke(P.center);
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // başlangıç / bitiş
    if (t.closed) drawLine(ctx, t, 0, true);
    else { drawLine(ctx, t, t.startIdx, false); drawLine(ctx, t, t.finishIdx, true); }
    if (!opts.mirror) drawGrid(ctx, race);

    // fren izleri
    if (race.skidCount && !opts.mirror) {
      ctx.strokeStyle = 'rgba(20,20,20,0.22)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
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
        ctx.globalAlpha = (p.life / p.max) * 0.45;
        ctx.fillStyle = p.color;
        const r = p.size * (1.6 - p.life / p.max);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, U.TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // araçlar: önce tüm gölgeler, sonra gövdeler
    const visible = [];
    for (const car of race.cars) {
      if (car === opts.skip) continue;
      const dx = car.x - cam.x, dy = car.y - cam.y;
      if (dx * dx + dy * dy <= vr2) visible.push(car);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    for (const car of visible) {
      ctx.save();
      ctx.translate(car.x + 3, car.y + 4); ctx.rotate(car.angle);
      U.roundRect(ctx, -car.model.len / 2, -car.model.wid / 2, car.model.len, car.model.wid, 6);
      ctx.fill();
      ctx.restore();
    }
    for (const car of visible) {
      const sp = Cars.sprite(car.modelIdx, car.color);
      ctx.save();
      ctx.translate(car.x, car.y); ctx.rotate(car.angle);
      if (th.night && q !== 'low') {
        const L = car.model.len / 2;
        const g = ctx.createLinearGradient(L, 0, L + 160, 0);
        g.addColorStop(0, 'rgba(240,230,190,0.18)'); g.addColorStop(1, 'rgba(240,230,190,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(L, -6); ctx.lineTo(L + 160, -50);
        ctx.lineTo(L + 160, 50); ctx.lineTo(L, 6); ctx.fill();
      }
      ctx.drawImage(sp.canvas, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
      if (car.brake > 0 && car.vf > 0) {
        ctx.fillStyle = 'rgba(220,60,55,0.85)';
        const hl = car.model.len / 2, hw = car.model.wid / 2;
        ctx.fillRect(-hl - 2, -hw + 2, 3, 4); ctx.fillRect(-hl - 2, hw - 6, 3, 4);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  /* ---------- harita önizlemeleri ---------- */
  function fitTransform(t, W, H, pad) {
    const b = t.bounds;
    const s = Math.min((W - pad * 2) / Math.max(1, b.maxX - b.minX), (H - pad * 2) / Math.max(1, b.maxY - b.minY));
    return {
      s,
      ox: (W - (b.maxX - b.minX) * s) / 2 - b.minX * s,
      oy: (H - (b.maxY - b.minY) * s) / 2 - b.minY * s
    };
  }

  function tracePath(x, t, f, step) {
    x.beginPath();
    for (let i = 0; i < t.n; i += step) {
      const px = t.xs[i] * f.s + f.ox, py = t.ys[i] * f.s + f.oy;
      i ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    if (t.closed) x.closePath();
    else x.lineTo(t.xs[t.n - 1] * f.s + f.ox, t.ys[t.n - 1] * f.s + f.oy);
  }

  function markers(x, t, f, r) {
    const dot = (i, fill, stroke) => {
      x.fillStyle = fill; x.strokeStyle = stroke; x.lineWidth = 1.5;
      x.beginPath(); x.arc(t.xs[i] * f.s + f.ox, t.ys[i] * f.s + f.oy, r, 0, U.TAU); x.fill(); x.stroke();
    };
    if (t.closed) dot(0, '#d6d5cc', '#2c2f34');
    else { dot(t.startIdx, '#8fbf7a', '#2c2f34'); dot(t.finishIdx, '#d6d5cc', '#2c2f34'); }
  }

  /* Mini harita arka planı (bir kez çizilir) */
  function minimapBase(t, size, outer, inner) {
    const c = U.makeCanvas(size, size), x = c.getContext('2d');
    const f = fitTransform(t, size, size, 12 * size / 150);
    x.lineJoin = 'round'; x.lineCap = 'round';
    tracePath(x, t, f, 3);
    x.strokeStyle = outer || 'rgba(0,0,0,0.5)'; x.lineWidth = 7 * size / 150; x.stroke();
    x.strokeStyle = inner || '#cfd2d4'; x.lineWidth = 3 * size / 150; x.stroke();
    markers(x, t, f, 3.5 * size / 150);
    return { canvas: c, s: f.s, ox: f.ox, oy: f.oy };
  }

  /* Menüdeki harita küçük resmi */
  function thumbnail(canvas, t) {
    const x = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    x.fillStyle = t.theme.ground; x.fillRect(0, 0, W, H);
    const f = fitTransform(t, W, H, 12);
    x.lineJoin = 'round'; x.lineCap = t.closed ? 'round' : 'butt';
    tracePath(x, t, f, 4);
    x.strokeStyle = t.theme.curbA; x.lineWidth = Math.max(4, t.width * f.s + 3); x.stroke();
    x.strokeStyle = t.theme.road; x.lineWidth = Math.max(3, t.width * f.s); x.stroke();
    markers(x, t, f, 3.5);
  }

  return { world, minimapBase, thumbnail };
})();
