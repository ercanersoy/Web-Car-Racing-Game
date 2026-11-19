/* Web Car Racing Game - map (track) definitions and generation
 *
 * There are two kinds of maps:
 *  - 'circuit': closed lap circuit (lap race); start and finish are on the same line.
 *  - 'sprint' : open road (sprint); start and finish points are separate.
 */
'use strict';

/* Easy-on-the-eyes, low-saturation colours (no pure white / pure black and no neon) */
const THEMES = {
  meadow: {
    ground: '#5f8150', patch: '#597a4b', road: '#62656b', line: '#d9d8cf',
    curbA: '#a65a50', curbB: '#d3cfc3', barrier: '#3d4239', barrier2: '#8e9186', grip: 1,
    scenery: [['tree', 5], ['bush', 3], ['rock', 1], ['flower', 2]]
  },
  desert: {
    ground: '#c4ab78', patch: '#bba16e', road: '#776c60', line: '#e3d8bf',
    curbA: '#a5654f', curbB: '#ddd1b7', barrier: '#6b5539', barrier2: '#b39b76', grip: 0.94,
    scenery: [['cactus', 4], ['rock', 4], ['drybush', 3]]
  },
  snow: {
    ground: '#cdd6dd', patch: '#c3cdd5', road: '#646c76', line: '#e6eaee',
    curbA: '#617ea3', curbB: '#dde3e8', barrier: '#4a5563', barrier2: '#98a4b0', grip: 0.82,
    scenery: [['pine', 6], ['snowrock', 2], ['snowman', 0.3]]
  },
  autumn: {
    ground: '#8d7a4f', patch: '#857249', road: '#5d5954', line: '#e1dbcf',
    curbA: '#a3663f', curbB: '#d8cfbd', barrier: '#4a3e31', barrier2: '#a58f6e', grip: 0.95,
    scenery: [['tree_orange', 4], ['tree_red', 3], ['bush', 2], ['hay', 1]]
  },
  night: {
    ground: '#202a27', patch: '#24302c', road: '#3b3f46', line: '#a8955c',
    curbA: '#66597c', curbB: '#557a80', barrier: '#171b1e', barrier2: '#6f6648', grip: 1, night: true,
    scenery: [['building', 4], ['lamp', 4], ['tree_dark', 2]]
  }
};

/* Lap circuits - internal name (display names: i18n.js 'track.<i>'), theme, seed, radius,
   control points, variance, x stretch, y stretch, road width */
const TRACK_DEFS = [
  ['Green Valley', 'meadow', 11, 1500, 6, 0.20, 1.35, 0.80, 160],
  ['Plane Tree Circuit', 'meadow', 23, 1600, 8, 0.30, 1.10, 0.95, 150],
  ['Spring Ring', 'meadow', 37, 1700, 9, 0.38, 1.00, 1.00, 150],
  ['Wildflower', 'meadow', 41, 1800, 11, 0.45, 1.20, 0.90, 140],
  ['Forest Road', 'meadow', 59, 1900, 13, 0.50, 1.00, 1.05, 135],
  ['Mirage', 'desert', 61, 1600, 6, 0.22, 1.40, 0.75, 160],
  ['Sandstorm', 'desert', 73, 1750, 8, 0.35, 1.15, 0.90, 150],
  ['Oasis Loop', 'desert', 89, 1800, 10, 0.40, 1.00, 1.00, 145],
  ['Cactus Canyon', 'desert', 97, 1900, 12, 0.48, 1.10, 0.95, 140],
  ['Sun Road', 'desert', 101, 2100, 14, 0.52, 1.25, 0.85, 135],
  ['Kartepe', 'snow', 113, 1550, 7, 0.25, 1.20, 0.90, 160],
  ['Ice Queen', 'snow', 127, 1700, 9, 0.35, 1.00, 1.00, 150],
  ['Pine Forest', 'snow', 131, 1850, 10, 0.42, 1.15, 0.90, 145],
  ['North Wind', 'snow', 149, 2000, 12, 0.50, 1.30, 0.80, 140],
  ['White Summit', 'snow', 157, 2100, 15, 0.55, 1.00, 1.00, 135],
  ['Falling Leaves', 'autumn', 163, 1600, 7, 0.28, 1.30, 0.85, 155],
  ['Crimson Leaf', 'autumn', 179, 1750, 9, 0.36, 1.05, 1.00, 150],
  ['Grape Harvest', 'autumn', 181, 1850, 11, 0.44, 1.20, 0.90, 145],
  ['Chestnut Lane', 'autumn', 193, 2000, 12, 0.50, 1.00, 1.10, 140],
  ['October Rally', 'autumn', 199, 2200, 16, 0.55, 1.15, 0.95, 135],
  ['Moonlight', 'night', 211, 1600, 6, 0.25, 1.40, 0.80, 160],
  ['Neon Boulevard', 'night', 223, 1750, 8, 0.35, 1.20, 0.90, 150],
  ['Harbor Loop', 'night', 227, 1900, 10, 0.42, 1.00, 1.00, 145],
  ['Under the Bridge', 'night', 239, 2000, 12, 0.50, 1.25, 0.85, 140],
  ['Midnight', 'night', 241, 2200, 15, 0.56, 1.05, 1.00, 135]
];

/* Sprint roads - internal name (display names: i18n.js 'sprint.<i>'), theme, seed, road length,
   segment length, max turn per segment (radians), max deviation from the main direction (× π), road width */
const SPRINT_DEFS = [
  ['Village Road', 'meadow', 301, 7600, 950, 0.45, 0.40, 160],
  ['Mill Pass', 'meadow', 313, 8200, 850, 0.60, 0.50, 150],
  ['Creekside', 'meadow', 327, 8800, 800, 0.75, 0.55, 150],
  ['Highland Road', 'meadow', 331, 9400, 750, 0.90, 0.62, 140],
  ['Downhill Run', 'meadow', 347, 10000, 700, 1.05, 0.70, 135],
  ['Caravan Route', 'desert', 353, 7800, 1000, 0.45, 0.40, 160],
  ['Scorching Sands', 'desert', 367, 8400, 900, 0.60, 0.50, 150],
  ['Dunes', 'desert', 373, 9000, 800, 0.78, 0.56, 145],
  ['Dry Valley', 'desert', 389, 9600, 750, 0.92, 0.63, 140],
  ['Hot Wind', 'desert', 397, 10200, 700, 1.05, 0.70, 135],
  ['Glacier Pass', 'snow', 401, 7600, 950, 0.45, 0.40, 160],
  ['Sled Run', 'snow', 419, 8200, 850, 0.62, 0.50, 150],
  ['Blizzard', 'snow', 421, 8800, 800, 0.76, 0.56, 145],
  ['Snow Valley', 'snow', 433, 9400, 750, 0.90, 0.62, 140],
  ['Summit Road', 'snow', 439, 10000, 700, 1.05, 0.70, 135],
  ['Leaf Fall', 'autumn', 443, 7800, 950, 0.45, 0.40, 160],
  ['Vineyard Road', 'autumn', 457, 8400, 850, 0.60, 0.50, 150],
  ['Misty Valley', 'autumn', 461, 9000, 800, 0.78, 0.56, 145],
  ['Apple Orchard', 'autumn', 479, 9600, 750, 0.92, 0.63, 140],
  ['Windy Hill', 'autumn', 487, 10200, 700, 1.05, 0.70, 135],
  ['City Lights', 'night', 491, 7600, 1000, 0.45, 0.40, 160],
  ['Coast Road', 'night', 503, 8200, 900, 0.60, 0.50, 150],
  ['Night Express', 'night', 509, 8800, 800, 0.76, 0.56, 145],
  ['Starlight Road', 'night', 521, 9400, 750, 0.90, 0.62, 140],
  ['Before Dawn', 'night', 523, 10000, 700, 1.05, 0.70, 135]
];

const Tracks = (() => {
  const SP = 10;            // distance between sample points
  const MARGIN = 85;        // grass margin between the road edge and the barrier
  const SPRINT_START = 45;  // start line on an open road (sample index); the grid is behind it
  const SPRINT_RUNOFF = 80; // run-off area after the finish line (sample count)
  const cache = { circuit: {}, sprint: {} };
  const DEFS = { circuit: TRACK_DEFS, sprint: SPRINT_DEFS };

  /* closed: whether the curve is closed; on an open curve the end points are repeated */
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

  /* Resample the polyline into evenly spaced points */
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
    // distant parts of the track must not come close (fast grid-based check)
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

  /* --- closed lap circuit --- */
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

  /* Use the straightest section of the circuit for the start/finish line */
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

  /* --- open sprint road: a winding road that generally heads in one direction --- */
  function generateSprint(def) {
    const [, , seed, L, segLen, maxTurn, spread, width] = def;
    for (let attempt = 0; attempt < 80; attempt++) {
      const r = U.rng(seed * 7919 + attempt * 104729);
      const mt = maxTurn * Math.max(0.4, 1 - attempt / 60);
      const lim = spread * Math.PI;
      // starting straight (for the grid)
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
      // finishing straight and run-off area
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

  /* Only what is needed for previews (lightweight) */
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
      // race distance (start to finish for sprints, one lap for circuits)
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

  /* Prepare all data needed for a race */
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

  /* Barrier line: drop points that self-intersect on the inside of corners */
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
      // the ends of an open road are always kept (the end barriers attach here)
      if (ok || (!t.closed && (i === 0 || i === n - 1))) out.push(x, y);
    }
    return out;
  }

  /* Nearest track point: { d: distance, j: index } */
  function nearestPoint(t, x, y, grid) {
    let best = Infinity, bj = -1;
    const cx = Math.floor(x / 200), cy = Math.floor(y / 200);
    for (let ox = -3; ox <= 3; ox++) for (let oy = -3; oy <= 3; oy++) {
      const list = grid.get((cx + ox) + ',' + (cy + oy));
      if (!list) continue;
      for (const j of list) {
        const d = Math.hypot(t.xs[j] - x, t.ys[j] - y);
        if (d < best) { best = d; bj = j; }
      }
    }
    return { d: best, j: bj };
  }

  /* Radius of the area an object covers when seen from above (sprite units; × scale in the world).
     Buildings are square, so half of the diagonal is used. */
  const FOOTPRINT = {
    tree: 30, tree_orange: 30, tree_red: 28, tree_dark: 26, bush: 22, drybush: 16, flower: 13,
    rock: 21, snowrock: 21, cactus: 19, pine: 30, snowman: 16, hay: 18, building: 51, lamp: 6
  };

  /* A corridor (road width + margin) extending beyond the start and finish ends of an open road */
  function blocksRoadEnd(t, x, y, rad) {
    const ends = [[0, t.heading[0] + Math.PI], [t.n - 1, t.heading[t.n - 1]]];
    for (const [i, h] of ends) {
      const dx = x - t.xs[i], dy = y - t.ys[i];
      const fwd = dx * Math.cos(h) + dy * Math.sin(h);
      const side = Math.abs(-dx * Math.sin(h) + dy * Math.cos(h));
      if (fwd > -rad && fwd < 700 + rad && side < t.barrier + 40 + rad) return true;
    }
    return false;
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
    // grid of placed objects for fast overlap checks
    const CELL = 140, placed = new Map();
    const cellKey = (cx, cy) => cx + ',' + cy;
    const overlaps = (x, y, rad) => {
      const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const cell = placed.get(cellKey(cx + ox, cy + oy));
        if (!cell) continue;
        for (const o of cell) {
          if (Math.hypot(o.x - x, o.y - y) < o.rad + rad + 4) return true;
        }
      }
      return false;
    };
    const count = Math.floor(t.n * SP / 45);
    for (let attempt = 0; attempt < count * 3 && items.length < count; attempt++) {
      let w = r() * total, type = list[0][0];
      for (const e of list) { w -= e[1]; if (w <= 0) { type = e[0]; break; } }
      const i = Math.floor(r() * t.n);
      const side = r() < 0.5 ? -1 : 1;
      const sc = type === 'building' ? 0.8 + r() * 0.45 : 0.75 + r() * 0.6;
      const rad = FOOTPRINT[type] * sc;
      // street lamps line the roadside; other objects are spread at various distances
      const dist = type === 'lamp'
        ? t.barrier + 28 + r() * 12
        : t.barrier + 20 + rad + Math.pow(r(), 1.6) * 520;
      const x = t.xs[i] + t.nx[i] * side * dist, y = t.ys[i] + t.ny[i] * side * dist;
      // the object's edge must not reach the barrier or another part of the track
      const np = nearestPoint(t, x, y, grid);
      if (np.d < t.barrier + 18 + rad) continue;
      if (overlaps(x, y, rad)) continue;
      // keep the area beyond the ends of an open road clear (the road must not run into an object)
      if (!t.closed && blocksRoadEnd(t, x, y, rad)) continue;
      // buildings are parallel to the nearest road; for round objects the angle only adds variety
      let rot = r() * U.TAU;
      if (type === 'building') {
        let j = np.j;
        if (j < 0) {   // distant building outside the grid range: scan the whole track
          let bd = Infinity;
          for (let q = 0; q < t.n; q++) {
            const d = (t.xs[q] - x) ** 2 + (t.ys[q] - y) ** 2;
            if (d < bd) { bd = d; j = q; }
          }
        }
        rot = t.heading[j];
      }
      const item = { x, y, type, s: sc, rot, rad };
      items.push(item);
      const k = cellKey(Math.floor(x / CELL), Math.floor(y / CELL));
      if (!placed.has(k)) placed.set(k, []);
      placed.get(k).push(item);
    }
    // ground patches
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
