/* Web Car Racing Game - harita (pist) tanımları ve üretimi */
'use strict';

const THEMES = {
  cayir: {
    ground: '#4b8b3b', patch: '#427d33', road: '#5b5e64', line: '#f2f2f2',
    curbA: '#d63a2f', curbB: '#f4f4f4', barrier: '#2b2b2b', barrier2: '#f4f4f4', grip: 1,
    scenery: [['tree', 5], ['bush', 3], ['rock', 1], ['flower', 2]], mini: '#2f6b27'
  },
  col: {
    ground: '#d9b56b', patch: '#cfa75c', road: '#77695a', line: '#fff3d6',
    curbA: '#c2462d', curbB: '#f6e9cf', barrier: '#8b5a2b', barrier2: '#e8d2a6', grip: 0.94,
    scenery: [['cactus', 4], ['rock', 4], ['drybush', 3]], mini: '#a8843f'
  },
  kar: {
    ground: '#e8eef3', patch: '#d8e2ea', road: '#5f6874', line: '#ffffff',
    curbA: '#2d6fd6', curbB: '#f4f8fb', barrier: '#344050', barrier2: '#dfe7ee', grip: 0.82,
    scenery: [['pine', 6], ['snowrock', 2], ['snowman', 0.3]], mini: '#9aa9b7'
  },
  sonbahar: {
    ground: '#9a7b3d', patch: '#8b6c33', road: '#57534e', line: '#f6efe2',
    curbA: '#d4612a', curbB: '#f6efe2', barrier: '#3a2d22', barrier2: '#e9c99a', grip: 0.95,
    scenery: [['tree_or', 4], ['tree_red', 3], ['bush', 2], ['hay', 1]], mini: '#6e5426'
  },
  gece: {
    ground: '#18231e', patch: '#1d2b24', road: '#30343b', line: '#f7d046',
    curbA: '#e0218a', curbB: '#2ad1e6', barrier: '#111', barrier2: '#ffd23a', grip: 1, night: true,
    scenery: [['building', 4], ['lamp', 4], ['tree_dark', 2]], mini: '#0d1411'
  }
};

/* ad (Türkçe; çeviriler i18n.js 'track.<i>'), tema, tohum, yarıçap, kontrol noktası, değişkenlik, x esneme, y esneme, yol genişliği */
const TRACK_DEFS = [
  ['Yeşil Vadi', 'cayir', 11, 1500, 6, 0.20, 1.35, 0.80, 160],
  ['Çınar Pisti', 'cayir', 23, 1600, 8, 0.30, 1.10, 0.95, 150],
  ['Bahar Halkası', 'cayir', 37, 1700, 9, 0.38, 1.00, 1.00, 150],
  ['Kır Çiçeği', 'cayir', 41, 1800, 11, 0.45, 1.20, 0.90, 140],
  ['Orman Yolu', 'cayir', 59, 1900, 13, 0.50, 1.00, 1.05, 135],
  ['Serap', 'col', 61, 1600, 6, 0.22, 1.40, 0.75, 160],
  ['Kum Fırtınası', 'col', 73, 1750, 8, 0.35, 1.15, 0.90, 150],
  ['Vaha Turu', 'col', 89, 1800, 10, 0.40, 1.00, 1.00, 145],
  ['Kaktüs Kanyonu', 'col', 97, 1900, 12, 0.48, 1.10, 0.95, 140],
  ['Güneş Yolu', 'col', 101, 2100, 14, 0.52, 1.25, 0.85, 135],
  ['Kartepe', 'kar', 113, 1550, 7, 0.25, 1.20, 0.90, 160],
  ['Buz Kraliçesi', 'kar', 127, 1700, 9, 0.35, 1.00, 1.00, 150],
  ['Çam Ormanı', 'kar', 131, 1850, 10, 0.42, 1.15, 0.90, 145],
  ['Kuzey Rüzgârı', 'kar', 149, 2000, 12, 0.50, 1.30, 0.80, 140],
  ['Beyaz Zirve', 'kar', 157, 2100, 15, 0.55, 1.00, 1.00, 135],
  ['Hazan', 'sonbahar', 163, 1600, 7, 0.28, 1.30, 0.85, 155],
  ['Kızıl Yaprak', 'sonbahar', 179, 1750, 9, 0.36, 1.05, 1.00, 150],
  ['Bağ Bozumu', 'sonbahar', 181, 1850, 11, 0.44, 1.20, 0.90, 145],
  ['Kestane Yolu', 'sonbahar', 193, 2000, 12, 0.50, 1.00, 1.10, 140],
  ['Ekim Rallisi', 'sonbahar', 199, 2200, 16, 0.55, 1.15, 0.95, 135],
  ['Ay Işığı', 'gece', 211, 1600, 6, 0.25, 1.40, 0.80, 160],
  ['Neon Bulvarı', 'gece', 223, 1750, 8, 0.35, 1.20, 0.90, 150],
  ['Liman Turu', 'gece', 227, 1900, 10, 0.42, 1.00, 1.00, 145],
  ['Köprü Altı', 'gece', 239, 2000, 12, 0.50, 1.25, 0.85, 140],
  ['Gece Yarısı', 'gece', 241, 2200, 15, 0.56, 1.05, 1.00, 135]
];

const Tracks = (() => {
  const SP = 10;            // örnek noktaları arası mesafe
  const MARGIN = 85;        // yol kenarı ile bariyer arası çim payı
  const cache = {};

  function catmullRom(ctrl, segs) {
    const out = [], K = ctrl.length;
    for (let i = 0; i < K; i++) {
      const p0 = ctrl[(i - 1 + K) % K], p1 = ctrl[i], p2 = ctrl[(i + 1) % K], p3 = ctrl[(i + 2) % K];
      for (let s = 0; s < segs; s++) {
        const t = s / segs, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    return out;
  }

  /* Kapalı çizgiyi eşit aralıklı noktalara böl */
  function resample(pts, step) {
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let carry = 0;
    const N = pts.length;
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[(i + 1) % N];
      const dx = b.x - a.x, dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      let d = step - carry;
      while (d <= segLen) {
        out.push({ x: a.x + dx * d / segLen, y: a.y + dy * d / segLen });
        d += step;
      }
      carry = segLen - (d - step);
    }
    // son nokta başlangıca çok yakınsa at
    const l = out[out.length - 1];
    if (Math.hypot(l.x - out[0].x, l.y - out[0].y) < step * 0.5) out.pop();
    return out;
  }

  function headings(pts) {
    const n = pts.length, h = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      h[i] = Math.atan2(b.y - a.y, b.x - a.x);
    }
    return h;
  }

  function curvatures(h) {
    const n = h.length, k = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      k[i] = U.wrapAngle(h[(i + 3) % n] - h[(i - 3 + n) % n]) / (6 * SP);
    }
    return k;
  }

  function validate(pts, width) {
    const n = pts.length;
    const h = headings(pts), k = curvatures(h);
    for (let i = 0; i < n; i++) if (Math.abs(k[i]) > 1 / 120) return false;
    // birbirinden uzak pist parçaları yakınlaşmamalı (ızgara ile hızlı kontrol)
    const minSep = 2 * (width / 2 + MARGIN) + 40;
    const cell = minSep, grid = new Map();
    const key = (cx, cy) => cx * 73856093 ^ cy * 19349663;
    for (let i = 0; i < n; i++) {
      const cx = Math.floor(pts[i].x / cell), cy = Math.floor(pts[i].y / cell);
      const kk = key(cx, cy);
      if (!grid.has(kk)) grid.set(kk, []);
      grid.get(kk).push(i);
    }
    const arcSkip = Math.ceil(700 / SP);
    for (let i = 0; i < n; i += 2) {
      const p = pts[i];
      const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const list = grid.get(key(cx + ox, cy + oy));
        if (!list) continue;
        for (const j of list) {
          let di = Math.abs(i - j); di = Math.min(di, n - di);
          if (di < arcSkip) continue;
          if (Math.hypot(pts[j].x - p.x, pts[j].y - p.y) < minSep) return false;
        }
      }
    }
    return true;
  }

  function generatePoints(def) {
    const [, , seed, R, K, vari, sx, sy, width] = def;
    for (let attempt = 0; attempt < 80; attempt++) {
      const r = U.rng(seed * 7919 + attempt * 104729);
      const v = vari * Math.max(0.3, 1 - attempt / 60);
      const rot = r() * U.TAU;
      const ctrl = [];
      for (let i = 0; i < K; i++) {
        const th = (i + (r() - 0.5) * 0.45) / K * U.TAU;
        const rad = R * 1.3 * (1 - v * r());
        const x = Math.cos(th) * rad * sx, y = Math.sin(th) * rad * sy;
        ctrl.push({ x: x * Math.cos(rot) - y * Math.sin(rot), y: x * Math.sin(rot) + y * Math.cos(rot) });
      }
      if (r() < 0.5) ctrl.reverse();
      const pts = resample(catmullRom(ctrl, 24), SP);
      if (validate(pts, width)) return pts;
    }
    // yedek: elips
    const pts = [];
    for (let i = 0; i < 200; i++) {
      const a = i / 200 * U.TAU;
      pts.push({ x: Math.cos(a) * R * 1.3 * sx, y: Math.sin(a) * R * 1.3 * sy });
    }
    return resample(pts, SP);
  }

  /* Pistin en düz bölümünü başlangıç çizgisi yap */
  function rotateToStart(pts) {
    const n = pts.length, k = curvatures(headings(pts));
    let best = 0, bestV = Infinity;
    for (let i = 0; i < n; i += 2) {
      let m = 0;
      for (let j = -55; j <= 15; j++) m = Math.max(m, Math.abs(k[(i + j + n) % n]));
      if (m < bestV) { bestV = m; best = i; }
    }
    return pts.slice(best).concat(pts.slice(0, best));
  }

  /* Sadece önizleme için gerekenler (hafif) */
  function getBasic(i) {
    if (cache[i]) return cache[i];
    const def = TRACK_DEFS[i];
    const pts = rotateToStart(generatePoints(def));
    const n = pts.length;
    const xs = new Float32Array(n), ys = new Float32Array(n);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let j = 0; j < n; j++) {
      xs[j] = pts[j].x; ys[j] = pts[j].y;
      minX = Math.min(minX, xs[j]); maxX = Math.max(maxX, xs[j]);
      minY = Math.min(minY, ys[j]); maxY = Math.max(maxY, ys[j]);
    }
    const vari = def[5];
    const t = {
      index: i, name: def[0], themeId: def[1], theme: THEMES[def[1]],
      width: def[8], half: def[8] / 2, barrier: def[8] / 2 + MARGIN,
      n, xs, ys, spacing: SP, length: n * SP,
      bounds: { minX, minY, maxX, maxY },
      difficulty: vari < 0.3 ? 'easy' : (vari < 0.45 ? 'medium' : 'hard'),   // i18n: 'level.<x>'
      full: false
    };
    cache[i] = t;
    return t;
  }

  /* Yarış için tüm verileri hazırla */
  function get(i) {
    const t = getBasic(i);
    if (t.full) return t;
    const n = t.n, pts = [];
    for (let j = 0; j < n; j++) pts.push({ x: t.xs[j], y: t.ys[j] });
    t.heading = headings(pts);
    t.curv = curvatures(t.heading);
    t.nx = new Float32Array(n); t.ny = new Float32Array(n);
    for (let j = 0; j < n; j++) { t.nx[j] = -Math.sin(t.heading[j]); t.ny[j] = Math.cos(t.heading[j]); }
    t.sprintIdx = Math.floor(n * 0.7);
    t.barrierL = cleanOffset(t, -t.barrier);
    t.barrierR = cleanOffset(t, t.barrier);
    t.scenery = makeScenery(t);
    t.full = true;
    return t;
  }

  /* Bariyer çizgisi: iç virajlarda kendini kesen noktaları ayıkla */
  function cleanOffset(t, off) {
    const out = [];
    const n = t.n, W = 40, lim = Math.abs(off) - 3;
    for (let i = 0; i < n; i++) {
      const x = t.xs[i] + t.nx[i] * off, y = t.ys[i] + t.ny[i] * off;
      let ok = true;
      for (let j = -W; j <= W; j += 2) {
        const k = (i + j + n) % n;
        if (Math.hypot(t.xs[k] - x, t.ys[k] - y) < lim) { ok = false; break; }
      }
      if (ok) out.push(x, y);
    }
    return out;
  }

  function nearestDist(t, x, y, grid) {
    let best = Infinity;
    const cx = Math.floor(x / 200), cy = Math.floor(y / 200);
    for (let ox = -3; ox <= 3; ox++) for (let oy = -3; oy <= 3; oy++) {
      const list = grid.get((cx + ox) + ',' + (cy + oy));
      if (!list) continue;
      for (const j of list) {
        const d = Math.hypot(t.xs[j] - x, t.ys[j] - y);
        if (d < best) best = d;
      }
    }
    return best;
  }

  function makeScenery(t) {
    const grid = new Map();
    for (let j = 0; j < t.n; j++) {
      const k = Math.floor(t.xs[j] / 200) + ',' + Math.floor(t.ys[j] / 200);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(j);
    }
    const r = U.rng(TRACK_DEFS[t.index][2] * 31 + 7);
    const list = t.theme.scenery;
    const total = list.reduce((s, e) => s + e[1], 0);
    const items = [];
    const count = Math.floor(t.length / 45);
    for (let c = 0; c < count; c++) {
      const i = Math.floor(r() * t.n);
      const side = r() < 0.5 ? -1 : 1;
      const dist = t.barrier + 35 + Math.pow(r(), 1.6) * 520;
      const x = t.xs[i] + t.nx[i] * side * dist, y = t.ys[i] + t.ny[i] * side * dist;
      if (nearestDist(t, x, y, grid) < t.barrier + 25) continue;
      let w = r() * total, type = list[0][0];
      for (const e of list) { w -= e[1]; if (w <= 0) { type = e[0]; break; } }
      items.push({ x, y, type, s: 0.75 + r() * 0.6, rot: r() * U.TAU });
    }
    // zemin lekeleri
    const patches = [];
    for (let c = 0; c < count * 0.5; c++) {
      const i = Math.floor(r() * t.n);
      const side = r() < 0.5 ? -1 : 1;
      const dist = t.barrier + r() * 900;
      patches.push({ x: t.xs[i] + t.nx[i] * side * dist, y: t.ys[i] + t.ny[i] * side * dist, r: 40 + r() * 140 });
    }
    t.patches = patches;
    return items;
  }

  /* En yakın pist noktası (tam tarama) */
  function nearestIndex(t, x, y) {
    let best = 0, bd = Infinity;
    for (let j = 0; j < t.n; j++) {
      const d = (t.xs[j] - x) ** 2 + (t.ys[j] - y) ** 2;
      if (d < bd) { bd = d; best = j; }
    }
    return best;
  }

  return { get, getBasic, nearestIndex, count: TRACK_DEFS.length, SP };
})();

if (typeof module !== 'undefined') module.exports = { Tracks, THEMES, TRACK_DEFS };
