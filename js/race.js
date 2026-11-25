/* Web Car Racing Game - race logic, physics and AI */
'use strict';

const DIFFICULTIES = {
  easy: { skill: 0.84, corner: 0.86, band: 0.02 },
  medium: { skill: 0.93, corner: 0.95, band: 0.04 },
  hard: { skill: 1.0, corner: 1.04, band: 0.05 }
};
const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];

class Race {
  /*
   * opts: { trackIndex, mode: 'laps'|'sprint', laps, modelIdx, colorIdx, carCount, difficulty, playerName, effects }
   * hooks: { onCountdown(n), onHit(strength), onLap(car), onFinish(results), onPlayerFinish(car) }
   */
  constructor(opts, hooks) {
    this.opts = opts;
    this.hooks = hooks || {};
    this.mode = opts.mode === 'sprint' ? 'sprint' : 'laps';
    this.track = Tracks.get(this.mode === 'sprint' ? 'sprint' : 'circuit', opts.trackIndex);
    this.laps = this.mode === 'sprint' ? 1 : opts.laps;
    // target progress: laps × sample count for lap races, the finish-line index for sprints
    this.target = this.mode === 'sprint' ? this.track.finishIdx : this.laps * this.track.n;
    this.diff = DIFFICULTIES[opts.difficulty] || DIFFICULTIES.medium;
    this.state = 'countdown';   // countdown | racing | finishing | done
    this.countdown = 3.5;
    this.lastCount = 4;
    this.time = 0;
    this.finishT = 0;
    this.cars = [];
    this.finishOrder = [];
    this.safeTables = {};
    this.rng = U.rng((Date.now() & 0xffff) + opts.trackIndex * 977);

    // effects (0: none, 1: skid marks, 2: skid marks + particles)
    this.skids = new Float32Array(3000 * 4);
    this.particles = [];
    this.setEffects(opts.effects == null ? 1 : opts.effects);

    this.createCars();
  }

  /* Update effects if the graphics quality changes during a race */
  setEffects(level) {
    if (this.effects === level) return;
    this.effects = level;
    this.maxSkids = level === 0 ? 0 : (level === 1 ? 1500 : 3000);
    this.skidHead = 0; this.skidCount = 0;
    if (level < 2) this.particles.length = 0;
  }

  /* Display name: computed each time so it stays correct after a language change */
  static nameOf(car) {
    if (car.isPlayer) return car.playerName || I18N.t('player.you');
    return I18N.t('player.ai', { n: car.num });
  }

  createCars() {
    const o = this.opts, t = this.track, n = t.n;
    const count = U.clamp(o.carCount | 0, 1, 8);
    const colors = CAR_COLORS.map((c, i) => i).filter(i => i !== o.colorIdx);
    // shuffle
    for (let i = colors.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [colors[i], colors[j]] = [colors[j], colors[i]]; }

    for (let k = 0; k < count; k++) {
      const isPlayer = k === count - 1;   // the player starts at the back
      const modelIdx = isPlayer ? o.modelIdx : Math.floor(this.rng() * CAR_MODELS.length);
      const colorIdx = isPlayer ? o.colorIdx : colors[k % colors.length];
      const row = Math.floor(k / 2), col = k % 2;
      const back = 6 + row * 8 + col * 4;
      const i = t.wrap(t.startIdx - back);
      const lat = (col === 0 ? -1 : 1) * t.half * 0.42;
      const h = t.heading[i];
      const car = {
        id: k, isPlayer, num: k + 1, playerName: isPlayer ? (o.playerName || '') : '',
        modelIdx, model: CAR_MODELS[modelIdx], colorIdx, color: CAR_COLORS[colorIdx].hex,
        x: t.xs[i] + t.nx[i] * lat, y: t.ys[i] + t.ny[i] * lat, angle: h,
        vx: 0, vy: 0, vf: 0, vr: 0, angVel: 0,
        steer: 0, throttle: 0, brake: 0, hand: false,
        idx: i, lap: t.closed ? -1 : 0, lapsDone: 0, progress: t.closed ? -back : i, startProgress: t.closed ? -back : i, lat,
        lapStart: 0, lapTimes: [], bestLap: null, lastLap: null,
        finished: false, finishTime: null, rank: k + 1,
        offroad: false, skid: 0, wrongT: 0, auto: !isPlayer,
        speedMul: 1, gear: 1, rpm: 0,
        wheels: null,
        ai: {
          lane: lat, laneTarget: lat, laneT: 0, stuckT: 0, reverseT: 0,
          react: 0.1 + this.rng() * 0.35,
          skill: this.diff.skill * (0.97 + this.rng() * 0.05)
        }
      };
      this.cars.push(car);
    }
    this.player = this.cars[this.cars.length - 1];
    this.rank();   // live standings are visible during the countdown too
  }

  /* --- safe cornering speed table for the AI --- */
  static omega(m, v) {
    const a = Math.abs(v);
    return m.turn * Math.min(1, a / 120) * (1 - 0.4 * Math.min(1, a / m.maxSpeed));
  }
  safeTable(modelIdx) {
    if (this.safeTables[modelIdx]) return this.safeTables[modelIdx];
    const t = this.track, n = t.n, m = CAR_MODELS[modelIdx];
    const c = 0.8 * Math.sqrt(t.theme.grip);
    const tab = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let k = 0;
      for (let j = -3; j <= 3; j++) k = Math.max(k, Math.abs(t.curv[t.wrap(i + j)]));
      if (k < 1e-5) { tab[i] = m.maxSpeed * 1.2; continue; }
      let lo = 30, hi = m.maxSpeed * 1.2;
      for (let it = 0; it < 20; it++) {
        const mid = (lo + hi) / 2;
        if (mid * k <= c * Race.omega(m, mid)) lo = mid; else hi = mid;
      }
      tab[i] = lo;
    }
    this.safeTables[modelIdx] = tab;
    return tab;
  }

  /* --- main update --- */
  update(dt, input) {
    if (this.state === 'done') return;
    if (this.state === 'countdown') {
      this.countdown -= dt;
      const c = Math.ceil(this.countdown);
      // only 3-2-1; "GO" is reported once below
      if (c >= 1 && c !== this.lastCount && c <= 3) {
        this.lastCount = c;
        if (this.hooks.onCountdown) this.hooks.onCountdown(c);
      }
      if (this.countdown <= 0) {
        this.state = 'racing';
        if (this.hooks.onCountdown) this.hooks.onCountdown(0);
      }
      // throttle for engine sound only (cars do not move)
      this.player.throttle = input ? input.throttle : 0;
      this.updateParticles(dt);
      return;
    }

    this.time += dt;
    for (const car of this.cars) {
      if (car.auto) this.aiControl(car, dt);
      else this.playerControl(car, input, dt);
      this.stepCar(car, dt);
    }
    this.collide();
    this.rank();
    this.updateParticles(dt);

    if (this.state === 'finishing') {
      this.finishT -= dt;
      if (this.finishT <= 0 || this.cars.every(c => c.finished)) this.end();
    } else if (this.cars.every(c => c.finished)) {
      this.end();
    }
  }

  playerControl(car, input, dt) {
    if (!input) { car.throttle = 0; car.brake = 0; car.steer = 0; car.hand = false; return; }
    car.throttle = input.throttle;
    car.brake = input.brake;
    car.steer = input.steer;
    car.hand = input.hand;
    if (input.reset && !car.finished) this.respawn(car);
  }

  aiControl(car, dt) {
    const t = this.track, n = t.n, ai = car.ai, m = car.model;
    if (this.time < ai.react && !car.finished) { car.throttle = 0; return; }
    const ca = Math.cos(car.angle), sa = Math.sin(car.angle);
    const vf = car.vf;

    // lane choice
    ai.laneT -= dt;
    if (ai.laneT <= 0) {
      ai.laneTarget = (this.rng() - 0.5) * t.half * 1.0;
      ai.laneT = 2 + this.rng() * 3;
    }
    // avoid cars ahead
    let blocked = false;
    for (const o of this.cars) {
      if (o === car) continue;
      const dx = o.x - car.x, dy = o.y - car.y;
      const fwd = dx * ca + dy * sa;
      if (fwd <= 0 || fwd > 110) continue;
      const side = -dx * sa + dy * ca;
      if (Math.abs(side) < 30 && vf > o.vf - 10) {
        ai.laneTarget = U.clamp(ai.laneTarget + (side > 0 ? -1 : 1) * 160 * dt * 3, -t.half * 0.8, t.half * 0.8);
        if (fwd < 55 && vf > o.vf + 30) blocked = true;
      }
    }
    ai.lane += (ai.laneTarget - ai.lane) * Math.min(1, dt * 1.5);

    const look = 4 + Math.floor(Math.max(0, vf) / 45);
    const j = t.wrap(car.idx + look);
    const kAhead = t.curv[t.wrap(car.idx + look * 2)];
    const apex = U.clamp(kAhead * 400, -1, 1) * t.half * 0.5;
    const lat = U.clamp(ai.lane * 0.6 + apex, -t.half * 0.75, t.half * 0.75);
    const tx = t.xs[j] + t.nx[j] * lat, ty = t.ys[j] + t.ny[j] * lat;
    const diff = U.wrapAngle(Math.atan2(ty - car.y, tx - car.x) - car.angle);
    car.steer = U.clamp(diff * 2.4, -1, 1);
    car.hand = false;

    // speed control
    const safe = this.safeTable(car.modelIdx);
    const dec = m.brake * 0.7;
    const corner = this.diff.corner * (car.finished ? 0.9 : 1);
    let target = m.maxSpeed * car.speedMul;
    const K = Math.min(90, 12 + Math.floor(vf * vf / (2 * dec) / t.spacing));
    for (let k = 1; k <= K; k += 2) {
      const s = safe[t.wrap(car.idx + k)] * corner;
      const allowed = Math.sqrt(s * s + 2 * dec * k * t.spacing);
      if (allowed < target) target = allowed;
    }
    if (car.offroad) target = Math.min(target, m.maxSpeed * m.offroad);
    // on an open road, slow down and stop after the finish
    // (braking at standstill would engage reverse, so release the brake once nearly stopped)
    if (car.finished && !t.closed) {
      car.throttle = 0;
      car.brake = vf > 5 ? 1 : 0;
      return;
    }

    if (ai.reverseT > 0) {
      ai.reverseT -= dt;
      car.throttle = 0; car.brake = 1; car.steer = -car.steer;
      return;
    }
    if (blocked || vf > target + 12) {
      car.throttle = 0;
      car.brake = vf > target + 35 || blocked ? 1 : 0;
    } else {
      car.throttle = 1; car.brake = 0;
    }

    // stuck detection
    if (vf < 20 && !car.finished && (this.state === 'racing' || this.state === 'finishing')) {
      ai.stuckT += dt;
      if (ai.stuckT > 1.5 && ai.stuckT < 1.6) ai.reverseT = 1.0;
      if (ai.stuckT > 4) { this.respawn(car); ai.stuckT = 0; }
    } else ai.stuckT = 0;
  }

  respawn(car) {
    const t = this.track, i = car.idx;
    car.x = t.xs[i]; car.y = t.ys[i]; car.angle = t.heading[i];
    car.vx = car.vy = car.vf = car.vr = 0; car.lat = 0;
    car.wheels = null;
  }

  stepCar(car, dt) {
    const m = car.model, t = this.track;
    const gripTheme = t.theme.grip;
    let maxS = m.maxSpeed * car.speedMul * (car.offroad ? m.offroad : 1);

    // steering
    let ca = Math.cos(car.angle), sa = Math.sin(car.angle);
    let vf = car.vx * ca + car.vy * sa;
    const steerAmt = car.steer * Race.omega(m, vf) * Math.sign(vf) * (car.hand ? 1.35 : 1);
    car.angVel = steerAmt;
    car.angle += steerAmt * dt;
    if (car.angle > Math.PI) car.angle -= U.TAU; else if (car.angle < -Math.PI) car.angle += U.TAU;

    // velocity components in the new heading
    ca = Math.cos(car.angle); sa = Math.sin(car.angle);
    vf = car.vx * ca + car.vy * sa;
    let vr = -car.vx * sa + car.vy * ca;

    // engine / brakes
    if (car.throttle > 0 && vf < maxS) {
      vf += m.accel * car.throttle * (1 - 0.7 * Math.max(0, vf) / maxS) * dt;
    }
    if (car.brake > 0) {
      if (vf > 5) vf -= m.brake * car.brake * dt;
      else vf = Math.max(vf - m.accel * 0.55 * car.brake * dt, -m.maxSpeed * 0.28);
    }
    if (car.throttle === 0 && car.brake === 0) vf -= vf * 0.45 * dt;      // engine braking
    if (car.hand) vf -= vf * 1.1 * dt;
    if (car.offroad) vf -= vf * (1.4 * (1 - m.offroad) + 0.2) * dt;       // grass drag
    if (vf > maxS) vf -= (vf - maxS) * 2.5 * dt;
    if (Math.abs(vf) < 1 && car.throttle === 0 && car.brake === 0) vf = 0;

    // lateral grip (sliding)
    const g = m.grip * gripTheme * (car.hand ? 0.22 : 1) * (car.offroad ? 0.75 : 1);
    vr *= Math.exp(-g * dt);

    car.vx = ca * vf - sa * vr;
    car.vy = sa * vf + ca * vr;
    car.vf = vf; car.vr = vr;
    car.x += car.vx * dt;
    car.y += car.vy * dt;

    this.trackProgress(car, dt);

    // gear / rpm (for the HUD and sound)
    const r = U.clamp(Math.abs(vf) / m.maxSpeed, 0, 1.1);
    const shifts = [0, 0.14, 0.3, 0.48, 0.66, 0.84, 1.2];
    let gear = 1;
    while (gear < 6 && r > shifts[gear]) gear++;
    car.gear = vf < -5 ? 'R' : gear;
    const lo = shifts[gear - 1], hi = shifts[gear];
    car.rpm = vf < -5 ? 0.4 : U.clamp(0.25 + 0.75 * (r - lo) / (hi - lo), 0, 1);

    // sliding and skid marks
    const skidding = Math.abs(vr) > 85 || (car.hand && Math.abs(vf) > 90) || (car.brake > 0 && vf > 220);
    car.skid = skidding ? U.clamp(Math.max(Math.abs(vr) / 250, car.hand ? 0.6 : 0.4), 0, 1) : 0;
    if (this.maxSkids) this.marks(car, skidding);
    if (this.effects === 2) {
      const spd = Math.hypot(car.vx, car.vy);
      if (car.offroad && spd > 80 && this.rng() < 0.5) this.spawn(car, t.theme.patch, 0.7);
      else if (skidding && this.rng() < 0.35) this.spawn(car, 'rgba(220,220,220,0.5)', 0.5);
    }
  }

  trackProgress(car, dt) {
    const t = this.track, n = t.n;
    let best = car.idx, bd = Infinity;
    for (let k = -22; k <= 22; k++) {
      const j = t.wrap(car.idx + k);
      const dx = t.xs[j] - car.x, dy = t.ys[j] - car.y;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = j; }
    }
    const old = car.idx;
    car.idx = best;
    if (t.closed) {
      const dIdx = best - old;
      if (dIdx < -n / 2) car.lap++;
      else if (dIdx > n / 2) car.lap--;
    }

    let dx = car.x - t.xs[best], dy = car.y - t.ys[best];
    const h = t.heading[best], ch = Math.cos(h), sh = Math.sin(h);
    let along = dx * ch + dy * sh;
    // end barriers at both ends of an open road
    if (!t.closed && ((best === 0 && along < 0) || (best === n - 1 && along > 0))) {
      car.x -= ch * along; car.y -= sh * along;
      const va = car.vx * ch + car.vy * sh;
      if (va * along > 0) {
        car.vx -= ch * va * 1.35; car.vy -= sh * va * 1.35;
        if (car.isPlayer && Math.abs(va) > 40 && this.hooks.onHit) this.hooks.onHit(Math.min(1, Math.abs(va) / 300));
      }
      along = 0;
      dx = car.x - t.xs[best]; dy = car.y - t.ys[best];
    }
    car.lat = dx * t.nx[best] + dy * t.ny[best];
    car.progress = (t.closed ? car.lap * n : 0) + best + along / t.spacing;
    car.offroad = Math.abs(car.lat) > t.half + 4;

    // side barriers
    const lim = t.barrier - car.model.wid * 0.6;
    if (Math.abs(car.lat) > lim) {
      const s = Math.sign(car.lat);
      const push = Math.abs(car.lat) - lim;
      car.x -= t.nx[best] * s * push;
      car.y -= t.ny[best] * s * push;
      const vn = car.vx * t.nx[best] + car.vy * t.ny[best];
      if (vn * s > 0) {
        car.vx -= t.nx[best] * vn * 1.35;
        car.vy -= t.ny[best] * vn * 1.35;
        car.vx *= 0.82; car.vy *= 0.82;
        if (car.isPlayer && Math.abs(vn) > 40 && this.hooks.onHit) this.hooks.onHit(Math.min(1, Math.abs(vn) / 300));
      }
      car.lat = s * lim;
    }

    // wrong way
    const facing = Math.cos(car.angle - h);
    if (facing < -0.3 && car.vf > 40) car.wrongT += dt; else car.wrongT = 0;

    // laps / finish
    if (!car.finished) {
      if (car.lap > car.lapsDone && car.lap >= 1) {
        car.lapsDone = car.lap;
        const lt = this.time - car.lapStart;
        car.lapStart = this.time;
        car.lastLap = lt;
        car.lapTimes.push(lt);
        if (car.bestLap == null || lt < car.bestLap) car.bestLap = lt;
        if (this.hooks.onLap) this.hooks.onLap(car);
      }
      // in a lap race the finish is the moment the last lap is counted (lap time = finish time)
      const done = this.mode === 'sprint' ? car.progress >= this.target : car.lap >= this.laps;
      if (done) this.finishCar(car);
    }
  }

  finishCar(car) {
    car.finished = true;
    car.finishTime = this.time;
    this.finishOrder.push(car);
    if (car.isPlayer) {
      car.auto = true;            // after the finish the car is driven automatically
      this.state = 'finishing';
      this.finishT = 4;
      if (this.hooks.onPlayerFinish) this.hooks.onPlayerFinish(car);
    }
  }

  collide() {
    const cs = this.cars, N = cs.length;
    for (let a = 0; a < N; a++) {
      const A = cs[a];
      for (let b = a + 1; b < N; b++) {
        const B = cs[b];
        const dx0 = B.x - A.x, dy0 = B.y - A.y;
        if (dx0 * dx0 + dy0 * dy0 > 3600) continue;
        const ra = A.model.wid * 0.55, rb = B.model.wid * 0.55;
        const oa = A.model.len * 0.26, ob = B.model.len * 0.26;
        const cA = Math.cos(A.angle), sA = Math.sin(A.angle), cB = Math.cos(B.angle), sB = Math.sin(B.angle);
        let done = false;
        for (let i = -1; i <= 1 && !done; i += 2) {
          for (let j = -1; j <= 1 && !done; j += 2) {
            const ax = A.x + cA * oa * i, ay = A.y + sA * oa * i;
            const bx = B.x + cB * ob * j, by = B.y + sB * ob * j;
            const dx = bx - ax, dy = by - ay;
            const d = Math.hypot(dx, dy), min = ra + rb;
            if (d >= min || d < 1e-4) continue;
            done = true;
            const nx = dx / d, ny = dy / d, ov = min - d;
            const ia = 1 / A.model.mass, ib = 1 / B.model.mass, sum = ia + ib;
            A.x -= nx * ov * ia / sum; A.y -= ny * ov * ia / sum;
            B.x += nx * ov * ib / sum; B.y += ny * ov * ib / sum;
            const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
            if (rv < 0) {
              const jimp = -(1.3) * rv / sum;
              A.vx -= jimp * ia * nx; A.vy -= jimp * ia * ny;
              B.vx += jimp * ib * nx; B.vy += jimp * ib * ny;
              if ((A.isPlayer || B.isPlayer) && -rv > 40 && this.hooks.onHit) this.hooks.onHit(Math.min(1, -rv / 300));
            }
          }
        }
      }
    }
  }

  rank() {
    const order = this.cars.slice().sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });
    order.forEach((c, i) => { c.rank = i + 1; });
    this.order = order;

    // mild rubber-banding (keeps the AI from drifting too far from the player)
    const p = this.player, band = this.diff.band, n = this.track.n;
    for (const c of this.cars) {
      if (c.isPlayer) continue;
      if (c.finished) { c.speedMul = 0.9; continue; }
      const gap = c.progress - p.progress;
      let mul = c.ai.skill;
      if (!p.finished) {
        if (gap < -n * 0.04) mul += band;
        else if (gap > n * 0.08) mul -= band * 0.8;
      }
      c.speedMul = mul;
    }
  }

  marks(car, skidding) {
    const ca = Math.cos(car.angle), sa = Math.sin(car.angle);
    const bx = car.x - ca * car.model.len * 0.32, by = car.y - sa * car.model.len * 0.32;
    const hw = car.model.wid * 0.38;
    const lx = bx - sa * hw, ly = by + ca * hw, rx = bx + sa * hw, ry = by - ca * hw;
    const w = car.wheels;
    if (!skidding) { car.wheels = null; return; }
    if (!w) { car.wheels = [lx, ly, rx, ry]; return; }
    if ((lx - w[0]) ** 2 + (ly - w[1]) ** 2 < 49) return;
    this.pushSkid(w[0], w[1], lx, ly);
    this.pushSkid(w[2], w[3], rx, ry);
    car.wheels = [lx, ly, rx, ry];
  }

  pushSkid(x1, y1, x2, y2) {
    const i = this.skidHead * 4;
    this.skids[i] = x1; this.skids[i + 1] = y1; this.skids[i + 2] = x2; this.skids[i + 3] = y2;
    this.skidHead = (this.skidHead + 1) % this.maxSkids;
    if (this.skidCount < this.maxSkids) this.skidCount++;
  }

  spawn(car, color, life) {
    if (this.particles.length > 160) return;
    const ca = Math.cos(car.angle), sa = Math.sin(car.angle);
    this.particles.push({
      x: car.x - ca * car.model.len * 0.45 + (this.rng() - 0.5) * 14,
      y: car.y - sa * car.model.len * 0.45 + (this.rng() - 0.5) * 14,
      vx: car.vx * 0.2 + (this.rng() - 0.5) * 40, vy: car.vy * 0.2 + (this.rng() - 0.5) * 40,
      life, max: life, size: 6 + this.rng() * 8, color
    });
  }

  updateParticles(dt) {
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.96; p.vy *= 0.96;
    }
  }

  end() {
    if (this.state === 'done') return;
    this.state = 'done';
    const time = this.time;
    const list = this.cars.map(c => {
      let t = c.finishTime, est = false;
      if (!c.finished) {
        const rate = (c.progress - c.startProgress) / Math.max(0.001, time);
        if (rate > 0.5) { t = time + (this.target - c.progress) / rate; est = true; }
        else t = null;
      }
      return { car: c, time: t, est };
    });
    list.sort((a, b) => {
      if (a.time == null) return 1;
      if (b.time == null) return -1;
      return a.time - b.time;
    });
    const winner = list[0].time;
    const results = list.map((r, i) => ({
      rank: i + 1,
      car: r.car,
      name: Race.nameOf(r.car),
      isPlayer: r.car.isPlayer,
      model: r.car.model.name,
      color: r.car.color,
      time: r.time == null ? null : r.time * 1000,
      est: r.est,
      gap: (r.time == null || i === 0) ? null : (r.time - winner) * 1000,
      bestLap: r.car.bestLap == null ? null : r.car.bestLap * 1000,
      points: r.time == null ? 0 : (POINTS[i] || 0)
    }));
    this.results = results;
    if (this.hooks.onFinish) this.hooks.onFinish(results);
  }
}
