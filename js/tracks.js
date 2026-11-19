/* Web Car Racing Game - harita (pist) tanımları ve üretimi
 *
 * İki tür harita vardır:
 *  - 'circuit': kapalı tur pisti (tur yarışı), başlangıç ve bitiş aynı çizgidedir.
 *  - 'sprint' : açık yol (kısa yarış), başlangıç ve bitiş noktaları ayrıdır.
 */
'use strict';

/* Göz yormayan, doygunluğu düşük renkler (saf beyaz / saf siyah ve neon renk yok) */
const THEMES = {
  cayir: {
    ground: '#5f8150', patch: '#597a4b', road: '#62656b', line: '#d9d8cf',
    curbA: '#a65a50', curbB: '#d3cfc3', barrier: '#3d4239', barrier2: '#8e9186', grip: 1,
    scenery: [['tree', 5], ['bush', 3], ['rock', 1], ['flower', 2]]
  },
  col: {
    ground: '#c4ab78', patch: '#bba16e', road: '#776c60', line: '#e3d8bf',
    curbA: '#a5654f', curbB: '#ddd1b7', barrier: '#6b5539', barrier2: '#b39b76', grip: 0.94,
    scenery: [['cactus', 4], ['rock', 4], ['drybush', 3]]
  },
  kar: {
    ground: '#cdd6dd', patch: '#c3cdd5', road: '#646c76', line: '#e6eaee',
    curbA: '#617ea3', curbB: '#dde3e8', barrier: '#4a5563', barrier2: '#98a4b0', grip: 0.82,
    scenery: [['pine', 6], ['snowrock', 2], ['snowman', 0.3]]
  },
  sonbahar: {
    ground: '#8d7a4f', patch: '#857249', road: '#5d5954', line: '#e1dbcf',
    curbA: '#a3663f', curbB: '#d8cfbd', barrier: '#4a3e31', barrier2: '#a58f6e', grip: 0.95,
    scenery: [['tree_or', 4], ['tree_red', 3], ['bush', 2], ['hay', 1]]
  },
  gece: {
    ground: '#202a27', patch: '#24302c', road: '#3b3f46', line: '#a8955c',
    curbA: '#66597c', curbB: '#557a80', barrier: '#171b1e', barrier2: '#6f6648', grip: 1, night: true,
    scenery: [['building', 4], ['lamp', 4], ['tree_dark', 2]]
  }
};

/* Tur pistleri - ad (Türkçe; çeviriler i18n.js 'track.<i>'), tema, tohum, yarıçap,
   kontrol noktası, değişkenlik, x esneme, y esneme, yol genişliği */
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

/* Kısa yarış yolları - ad (çeviriler i18n.js 'sprint.<i>'), tema, tohum, yol uzunluğu,
   kesit uzunluğu, kesit başına azami dönüş (radyan), ana yönden azami sapma (π katı), yol genişliği */
const SPRINT_DEFS = [
  ['Köy Yolu', 'cayir', 301, 7600, 950, 0.45, 0.40, 160],
  ['Değirmen Geçidi', 'cayir', 313, 8200, 850, 0.60, 0.50, 150],
  ['Dere Kenarı', 'cayir', 327, 8800, 800, 0.75, 0.55, 150],
  ['Yayla Yolu', 'cayir', 331, 9400, 750, 0.90, 0.62, 140],
  ['Bayır Aşağı', 'cayir', 347, 10000, 700, 1.05, 0.70, 135],
  ['Kervan Yolu', 'col', 353, 7800, 1000, 0.45, 0.40, 160],
  ['Kızgın Kum', 'col', 367, 8400, 900, 0.60, 0.50, 150],
  ['Kum Tepeleri', 'col', 373, 9000, 800, 0.78, 0.56, 145],
  ['Kuru Vadi', 'col', 389, 9600, 750, 0.92, 0.63, 140],
  ['Sıcak Rüzgâr', 'col', 397, 10200, 700, 1.05, 0.70, 135],
  ['Buzul Geçidi', 'kar', 401, 7600, 950, 0.45, 0.40, 160],
  ['Kızak Yolu', 'kar', 419, 8200, 850, 0.62, 0.50, 150],
  ['Tipi', 'kar', 421, 8800, 800, 0.76, 0.56, 145],
  ['Kar Vadisi', 'kar', 433, 9400, 750, 0.90, 0.62, 140],
  ['Zirve Yolu', 'kar', 439, 10000, 700, 1.05, 0.70, 135],
  ['Yaprak Dökümü', 'sonbahar', 443, 7800, 950, 0.45, 0.40, 160],
  ['Bağ Yolu', 'sonbahar', 457, 8400, 850, 0.60, 0.50, 150],
  ['Sis Vadisi', 'sonbahar', 461, 9000, 800, 0.78, 0.56, 145],
  ['Elma Bahçesi', 'sonbahar', 479, 9600, 750, 0.92, 0.63, 140],
  ['Rüzgârlı Tepe', 'sonbahar', 487, 10200, 700, 1.05, 0.70, 135],
  ['Şehir Işıkları', 'gece', 491, 7600, 1000, 0.45, 0.40, 160],
  ['Sahil Yolu', 'gece', 503, 8200, 900, 0.60, 0.50, 150],
  ['Gece Ekspresi', 'gece', 509, 8800, 800, 0.76, 0.56, 145],
  ['Yıldız Yolu', 'gece', 521, 9400, 750, 0.90, 0.62, 140],
  ['Şafak Öncesi', 'gece', 523, 10000, 700, 1.05, 0.70, 135]
];

const Tracks = (() => {
  const SP = 10;            // örnek noktaları arası mesafe
  const MARGIN = 85;        // yol kenarı ile bariyer arası çim payı
  const SPRINT_START = 45;  // açık yolda başlangıç çizgisi (örnek indeksi); gerisi başlangıç ızgarası
  const SPRINT_RUNOFF = 80; // bitiş çizgisinden sonra yavaşlama alanı (örnek sayısı)
  const cache = { circuit: {}, sprint: {} };
  const DEFS = { circuit: TRACK_DEFS, sprint: SPRINT_DEFS };

  /* closed: kapalı eğri mi; açık eğride uçlar tekrarlanır */
  function catmullRom(ctrl, segs, closed) {
    const out = [], K = ctrl.length;
    const P = i => closed ? ctrl[(i + K) % K] : ctrl[Math.max(0, Math.min(K - 1, i))];
    const last = closed ? K : K - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let s = 0; s < segs; s++) {
        const t = s / segs, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    if (!closed) out.push({ x: ctrl[K - 1].x, y: ctrl[K - 1].y });
    return out;
  }

  /* Çizgiyi eşit aralıklı noktalara böl */
  function resample(pts, step, closed) {
    const out = [{ x: pts[0].x, y: pts[0].y }];
    let carry = 0;
    const N = pts.length, segCount = closed ? N : N - 1;
    for (let i = 0; i < segCount; i++) {
      const a = pts[i], b = pts[(i + 1) % N];
      const dx = b.x - a.x, dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      if (segLen < 1e-6) continue;
      let d = step - carry;
      while (d <= segLen) {
        out.push({ x: a.x + dx * d / segLen, y: a.y + dy * d / segLen });
        d += step;
      }
      carry = segLen - (d - step);
    }
    if (closed) {
      const l = out[out.length - 1];
      if (Math.hypot(l.x - out[0].x, l.y - out[0].y) < step * 0.5) out.pop();
    }
    return out;
  }

  function idxFn(n, closed) {
    return closed ? (i => ((i % n) + n) % n) : (i => (i < 0 ? 0 : (i >= n ? n - 1 : i)));
  }

  function headings(pts, closed) {
    const n = pts.length, h = new Float32Array(n), I = idxFn(n, closed);
    for (let i = 0; i < n; i++) {
      const a = pts[I(i - 1)], b = pts[I(i + 1)];
      h[i] = Math.atan2(b.y - a.y, b.x - a.x);
    }
    return h;
  }

  function curvatures(h, closed) {
    const n = h.length, k = new Float32Array(n), I = idxFn(n, closed);
    for (let i = 0; i < n; i++) {
      const a = I(i - 3), b = I(i + 3);
      k[i] = b === a ? 0 : U.wrapAngle(h[b] - h[a]) / ((b - a + (b < a ? n : 0)) * SP);
    }
    return k;
  }

  function validate(pts, width, closed) {
    const n = pts.length;
    const k = curvatures(headings(pts, closed), closed);
    for (let i = 0; i < n; i++) if (Math.abs(k[i]) > 1 / 120) return false;
    // birbirinden uzak pist parçaları yakınlaşmamalı (ızgara ile hızlı kontrol)
    const minSep = 2 * (width / 2 + MARGIN) + 40;
    const cell = minSep, grid = new Map();
    const key = (cx, cy) => cx * 73856093 ^ cy * 19349663;
    for (let i = 0; i < n; i++) {
      const kk = key(Math.floor(pts[i].x / cell), Math.floor(pts[i].y / cell));
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
          let di = Math.abs(i - j);
          if (closed) di = Math.min(di, n - di);
          if (di < arcSkip) continue;
          if (Math.hypot(pts[j].x - p.x, pts[j].y - p.y) < minSep) return false;
        }
      }
    }
    return true;
  }

  /* --- kapalı tur pisti --- */
  function generateCircuit(def) {
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
      const pts = resample(catmullRom(ctrl, 24, true), SP, true);
      if (validate(pts, width, true)) return rotateToStart(pts);
    }
    const pts = [];
    for (let i = 0; i < 200; i++) {
      const a = i / 200 * U.TAU;
      pts.push({ x: Math.cos(a) * R * 1.3 * sx, y: Math.sin(a) * R * 1.3 * sy });
    }
    return resample(pts, SP, true);
  }

  /* Pistin en düz bölümünü başlangıç/bitiş çizgisi yap */
  function rotateToStart(pts) {
    const n = pts.length, k = curvatures(headings(pts, true), true);
    let best = 0, bestV = Infinity;
    for (let i = 0; i < n; i += 2) {
      let m = 0;
      for (let j = -55; j <= 15; j++) m = Math.max(m, Math.abs(k[(i + j + n) % n]));
      if (m < bestV) { bestV = m; best = i; }
    }
    return pts.slice(best).concat(pts.slice(0, best));
  }

  /* --- açık sprint yolu: genel olarak bir yöne ilerleyen, kıvrımlı yol --- */
  function generateSprint(def) {
    const [, , seed, L, segLen, maxTurn, spread, width] = def;
    for (let attempt = 0; attempt < 80; attempt++) {
      const r = U.rng(seed * 7919 + attempt * 104729);
      const mt = maxTurn * Math.max(0.4, 1 - attempt / 60);
      const lim = spread * Math.PI;
      // başlangıç düzlüğü (ızgara için)
      const ctrl = [{ x: -450, y: 0 }, { x: 0, y: 0 }, { x: 550, y: 0 }];
      let x = 550, y = 0, h = 0, len = 1000;
      while (len < L - 1000) {
        let nh = h + (r() * 2 - 1) * mt;
        if (Math.abs(nh) > lim) nh = Math.sign(nh) * lim - (r() * 0.3) * Math.sign(nh);
        h = nh;
        const sl = segLen * (0.7 + r() * 0.6);
        x += Math.cos(h) * sl; y += Math.sin(h) * sl;
        ctrl.push({ x, y });
        len += sl;
      }
      // bitiş düzlüğü ve yavaşlama alanı
      for (let s = 0; s < 3; s++) { x += Math.cos(h) * 450; y += Math.sin(h) * 450; ctrl.push({ x, y }); }
      let pts = resample(catmullRom(ctrl, 24, false), SP, false);
      if (!validate(pts, width, false)) continue;
      const rot = r() * U.TAU, c = Math.cos(rot), s = Math.sin(rot);
      pts = pts.map(p => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
      return pts;
    }
    const pts = [];
    for (let i = 0; i < L / SP; i++) pts.push({ x: i * SP, y: Math.sin(i / 60) * 300 });
    return pts;
  }

  /* Sadece önizleme için gerekenler (hafif) */
  function getBasic(kind, i) {
    if (cache[kind][i]) return cache[kind][i];
    const def = DEFS[kind][i];
    const closed = kind === 'circuit';
    const pts = closed ? generateCircuit(def) : generateSprint(def);
    const n = pts.length;
    const xs = new Float32Array(n), ys = new Float32Array(n);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let j = 0; j < n; j++) {
      xs[j] = pts[j].x; ys[j] = pts[j].y;
      minX = Math.min(minX, xs[j]); maxX = Math.max(maxX, xs[j]);
      minY = Math.min(minY, ys[j]); maxY = Math.max(maxY, ys[j]);
    }
    const level = closed ? def[5] : def[5] / 2;
    const startIdx = closed ? 0 : SPRINT_START;
    const finishIdx = closed ? 0 : n - SPRINT_RUNOFF;
    const t = {
      kind, index: i, closed, seed: def[2], themeId: def[1], theme: THEMES[def[1]],
      width: def[closed ? 8 : 7], n, xs, ys, spacing: SP,
      startIdx, finishIdx,
      // yarış mesafesi (sprintte başlangıçtan bitişe, turda bir tur)
      length: closed ? n * SP : (finishIdx - startIdx) * SP,
      bounds: { minX, minY, maxX, maxY },
      difficulty: level < 0.3 ? 'easy' : (level < 0.45 ? 'medium' : 'hard'),   // i18n: 'level.<x>'
      full: false
    };
    t.half = t.width / 2;
    t.barrier = t.half + MARGIN;
    t.wrap = idxFn(n, closed);
    cache[kind][i] = t;
    return t;
  }

  /* Yarış için tüm verileri hazırla */
  function get(kind, i) {
    const t = getBasic(kind, i);
    if (t.full) return t;
    const n = t.n, pts = [];
    for (let j = 0; j < n; j++) pts.push({ x: t.xs[j], y: t.ys[j] });
    t.heading = headings(pts, t.closed);
    t.curv = curvatures(t.heading, t.closed);
    t.nx = new Float32Array(n); t.ny = new Float32Array(n);
    for (let j = 0; j < n; j++) { t.nx[j] = -Math.sin(t.heading[j]); t.ny[j] = Math.cos(t.heading[j]); }
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
        const k = t.wrap(i + j);
        if (Math.hypot(t.xs[k] - x, t.ys[k] - y) < lim) { ok = false; break; }
      }
      // açık yolun uçları her zaman korunur (kapanış bariyeri buraya bağlanır)
      if (ok || (!t.closed && (i === 0 || i === n - 1))) out.push(x, y);
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
    const r = U.rng(t.seed * 31 + 7);
    const list = t.theme.scenery;
    const total = list.reduce((s, e) => s + e[1], 0);
    const items = [];
    const count = Math.floor(t.n * SP / 45);
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

  return {
    get, getBasic, SP,
    count: kind => DEFS[kind].length,
    def: (kind, i) => DEFS[kind][i]
  };
})();

if (typeof module !== 'undefined') module.exports = { Tracks, THEMES, TRACK_DEFS, SPRINT_DEFS };
