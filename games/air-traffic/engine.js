/* Deterministic, dependency-free air traffic simulation. Coordinates are world units;
   headings are radians clockwise from east, and dt is measured in seconds. */
(function (root) {
  'use strict';
  const WIDTH = 1000, HEIGHT = 700, TAU = Math.PI * 2;
  const COLLISION_DISTANCE = 14, WARNING_DISTANCE = 60;
  const PREVIEW_SECONDS = 4, MAX_DT = 1, FIXED_DT = 1 / 120;
  const AIRCRAFT_TYPES = Object.freeze({
    plane: Object.freeze({ speed: 24, turnRate: 1.35 }),
    jet: Object.freeze({ speed: 34, turnRate: 1.05 }),
    helicopter: Object.freeze({ speed: 15, turnRate: 2.1 })
  });
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const finite = (n, fallback) => Number.isFinite(n) ? n : fallback;
  const angleDifference = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const normalizeAngle = n => ((n % TAU) + TAU) % TAU;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function seedNumber(seed) {
    if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
    const text = String(seed === undefined ? 1 : seed);
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
    return value >>> 0;
  }
  function random(state) {
    state._rng = (state._rng + 0x6D2B79F5) >>> 0;
    let t = state._rng;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function airportFor(state, id) { return state.map.airports.find(a => a.id === id); }
  function runwayCoordinates(airport, point) {
    const dx = point.x - airport.x, dy = point.y - airport.y;
    const c = Math.cos(airport.heading), s = Math.sin(airport.heading);
    return { along: dx * c + dy * s, across: -dx * s + dy * c };
  }
  function helipadFor(airport) {
    return airport.helipad || { x: airport.x, y: airport.y, radius: 20 };
  }
  function createState(options) {
    options = options || {};
    if (!options.map || !Array.isArray(options.map.airports) || !options.map.airports.length) {
      throw new Error('A map with at least one airport is required.');
    }
    const map = Object.assign({}, options.map, {
      airports: options.map.airports.map(a => Object.assign({}, a, {
        x: finite(a.x, WIDTH / 2), y: finite(a.y, HEIGHT / 2),
        heading: finite(a.heading, 0), length: Math.max(40, finite(a.length, 90)),
        helipad: a.helipad ? Object.assign({}, a.helipad) : undefined
      }))
    });
    const state = {
      map, mode: options.mode === 'free' ? 'free' : 'challenge', seed: options.seed === undefined ? 1 : options.seed,
      status: 'running', time: 0, aircraft: [], pending: [], landings: 0,
      departures: 0, misses: 0, nearMisses: 0, events: [], failure: null, warnings: [],
      _rng: seedNumber(options.seed), _nextId: 1, _spawnTimer: Math.max(5, finite(map.spawnInterval, 15)), _accumulator: 0,
      _nearPairs: Object.create(null)
    };
    // The first flight gets the same four-second visible warning as every later one.
    scheduleRandomFlight(state, 'arrival');
    state.events = [];
    return state;
  }
  function trafficCap(state) { return clamp(Math.floor(finite(state.map.maxTraffic, 7)), 1, 20); }
  function makeFlight(state, input) {
    const airport = airportFor(state, input.airportId) || state.map.airports[0];
    const type = AIRCRAFT_TYPES[input.type] ? input.type : 'plane';
    const properties = AIRCRAFT_TYPES[type];
    let id = input.id;
    if (id === undefined || id === null) {
      do { id = 'F' + String(state._nextId++).padStart(3, '0'); }
      while (state.aircraft.concat(state.pending).some(a => a.id === id));
    }
    return {
      id, x: finite(input.x, airport.x), y: finite(input.y, airport.y),
      heading: normalizeAngle(finite(input.heading, airport.heading)),
      speed: clamp(finite(input.speed, properties.speed), 1, 60),
      turnRate: clamp(finite(input.turnRate, properties.turnRate), 0.1, 4),
      type, kind: input.kind === 'departure' ? 'departure' : 'arrival',
      airportId: airport.id, color: input.color || airport.color || '#38bdf8',
      exitSide: ['N', 'E', 'S', 'W'].includes(input.exitSide) ? input.exitSide : undefined,
      route: [], age: 0, countdown: Math.max(0, finite(input.countdown, PREVIEW_SECONDS)), waiting: false
    };
  }
  // Explicit flights are useful for tutorials and tests. They still respect the cap,
  // preview countdown and safe-release rules. Returns the pending flight, or null.
  function queueFlight(state, input) {
    if (state.status !== 'running' || state.aircraft.length + state.pending.length >= trafficCap(state)) return null;
    input = input || {};
    if (input.id !== undefined && state.aircraft.concat(state.pending).some(a => a.id === input.id)) return null;
    const flight = makeFlight(state, input);
    state.pending.push(flight);
    return flight;
  }
  function randomCandidate(state, forceKind) {
    const airport = state.map.airports[Math.floor(random(state) * state.map.airports.length)];
    const roll = random(state), difficulty = finite(state.map.difficulty, 1);
    const type = roll < 0.2 ? 'helicopter' : roll > (difficulty > 1 ? 0.78 : 0.9) ? 'jet' : 'plane';
    const kind = forceKind || (random(state) < clamp(finite(state.map.departureRate, 0.2), 0, 1) ? 'departure' : 'arrival');
    const exitSide = ['N', 'E', 'S', 'W'][Math.floor(random(state) * 4)];
    let x, y, heading;
    if (kind === 'departure') {
      const pad = helipadFor(airport);
      x = type === 'helicopter' ? pad.x : airport.x - Math.cos(airport.heading) * airport.length * 0.4;
      y = type === 'helicopter' ? pad.y : airport.y - Math.sin(airport.heading) * airport.length * 0.4;
      heading = type === 'helicopter' ? { N: -Math.PI / 2, E: 0, S: Math.PI / 2, W: Math.PI }[exitSide] : airport.heading;
    } else {
      const edge = Math.floor(random(state) * 4), position = 0.15 + random(state) * 0.7;
      x = edge === 1 ? WIDTH - 16 : edge === 3 ? 16 : WIDTH * position;
      y = edge === 0 ? 16 : edge === 2 ? HEIGHT - 16 : HEIGHT * position;
      // Slightly different interior aim points avoid repeatedly funneling all flights
      // down one unavoidable collision course.
      const target = { x: WIDTH * (0.25 + random(state) * 0.5), y: HEIGHT * (0.25 + random(state) * 0.5) };
      heading = Math.atan2(target.y - y, target.x - x);
    }
    return { x, y, heading, kind, type, airportId: airport.id, color: airport.color,
      exitSide: kind === 'departure' ? exitSide : undefined,
      speed: AIRCRAFT_TYPES[type].speed + (random(state) * 2 - 1) * (type === 'helicopter' ? 1 : 2) };
  }
  function cloneMotion(a) {
    const route = (a.route || []).map(p => ({ x: p.x, y: p.y }));
    const targetIndex = a._routeProgress ? (a.route || []).indexOf(a._routeProgress.target) : -1;
    const progress = targetIndex >= 0 ? Object.assign({}, a._routeProgress, { target: route[targetIndex] }) : null;
    return Object.assign({}, a, { route, _routeProgress: progress });
  }
  function safeToRelease(state, flight, delay) {
    if (state.aircraft.length >= trafficCap(state)) return false;
    const candidate = cloneMotion(flight);
    const others = state.aircraft.map(cloneMotion);
    // Forecast the routes already displayed to the player, including their finite
    // turning radius. Use simulation-sized steps: a coarse forecast can select a
    // different short waypoint and incorrectly approve an unsafe release.
    // A delayed unsafe preview waits in place rather than teleporting.
    for (let t = 0; t < delay - 1e-9; t += FIXED_DT) others.forEach(a => moveAircraft(a, Math.min(FIXED_DT, delay - t)));
    for (let t = 0; t <= 5 + 1e-9; t += FIXED_DT) {
      if (others.some(a => distance(candidate, a) < (t < 1 ? 72 : 48))) return false;
      const before = { x: candidate.x, y: candidate.y };
      moveAircraft(candidate, FIXED_DT);
      for (const other of others) {
        const old = { x: other.x, y: other.y };
        moveAircraft(other, FIXED_DT);
        if (sweptDistance(before, candidate, old, other) < (t < 1 ? 72 : 48)) return false;
      }
    }
    return true;
  }
  function scheduleRandomFlight(state, forceKind) {
    if (state.aircraft.length + state.pending.length >= trafficCap(state)) return null;
    for (let attempt = 0; attempt < 16; attempt++) {
      const candidate = randomCandidate(state, forceKind);
      const prototype = Object.assign({ route: [], turnRate: AIRCRAFT_TYPES[candidate.type].turnRate }, candidate);
      if (!safeToRelease(state, prototype, PREVIEW_SECONDS)) continue;
      if (state.pending.some(p => distance(p, prototype) < 100)) continue;
      return queueFlight(state, candidate);
    }
    return null;
  }
  function setRoute(state, id, points) {
    if (state.status !== 'running' || !Array.isArray(points)) return false;
    const aircraft = state.aircraft.find(a => a.id === id);
    if (!aircraft) return false;
    const route = [];
    for (const point of points) {
      if (!point) continue;
      const x = Array.isArray(point) ? point[0] : point.x, y = Array.isArray(point) ? point[1] : point.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const next = { x: clamp(x, -60, WIDTH + 60), y: clamp(y, -60, HEIGHT + 60) };
      if (!route.length || distance(route[route.length - 1], next) >= 5) route.push(next);
      if (route.length >= 400) break;
    }
    aircraft.route = route;
    aircraft._routeProgress = null;
    return true;
  }
  function clearRoute(state, id) { return setRoute(state, id, []); }
  function moveAircraft(aircraft, dt) {
    if (!aircraft.route) aircraft.route = [];
    const radius = Math.max(7, aircraft.speed * 0.28);
    while (aircraft.route.length) {
      const point = aircraft.route[0];
      if (distance(aircraft, point) <= radius) { aircraft.route.shift(); continue; }
      if (aircraft.route.length > 1) {
        const next = aircraft.route[1], dx = next.x - point.x, dy = next.y - point.y;
        const length = Math.hypot(dx, dy);
        const passed = ((aircraft.x - point.x) * dx + (aircraft.y - point.y) * dy) / (length || 1);
        const lateral = Math.abs((aircraft.x - point.x) * dy - (aircraft.y - point.y) * dx) / (length || 1);
        if (passed > 0 && lateral < radius * 1.8 && distance(aircraft, point) < 35) { aircraft.route.shift(); continue; }
      }
      break;
    }
    let turn = 0;
    const turnRate = finite(aircraft.turnRate, AIRCRAFT_TYPES[aircraft.type] ? AIRCRAFT_TYPES[aircraft.type].turnRate : 1.35);
    if (aircraft.route.length) {
      const target = aircraft.route[0], desired = Math.atan2(target.y - aircraft.y, target.x - aircraft.x);
      if (!aircraft._routeProgress || aircraft._routeProgress.target !== target) {
        aircraft._routeProgress = { target, bestDistance: distance(aircraft, target), stalledTurn: 0 };
      }
      const limit = turnRate * dt;
      turn = clamp(angleDifference(desired, aircraft.heading), -limit, limit);
    }
    const middleHeading = aircraft.heading + turn / 2;
    const arcFactor = Math.abs(turn) > 1e-8 ? Math.sin(turn / 2) / (turn / 2) : 1;
    aircraft.x += Math.cos(middleHeading) * aircraft.speed * dt * arcFactor;
    aircraft.y += Math.sin(middleHeading) * aircraft.speed * dt * arcFactor;
    aircraft.heading = normalizeAngle(aircraft.heading + turn);
    aircraft.age = finite(aircraft.age, 0) + dt;
    // A point inside the aircraft's turning circle can be physically unreachable.
    // After a half-turn with no progress, finish that waypoint smoothly rather than
    // locking the aircraft into an endless orbit around a very short pointer stroke.
    if (aircraft.route.length && aircraft._routeProgress) {
      const progress = aircraft._routeProgress, separation = distance(aircraft, progress.target);
      if (separation < progress.bestDistance - 0.5) {
        progress.bestDistance = separation;
        progress.stalledTurn = 0;
      } else progress.stalledTurn += Math.abs(turn);
      if (progress.stalledTurn >= Math.PI && separation < Math.max(radius * 2, aircraft.speed / turnRate * 1.65)) {
        aircraft.route.shift();
        aircraft._routeProgress = null;
      }
    }
  }
  function sweptDistance(a0, a1, b0, b1) {
    const rx = a0.x - b0.x, ry = a0.y - b0.y;
    const vx = a1.x - a0.x - (b1.x - b0.x), vy = a1.y - a0.y - (b1.y - b0.y);
    const vv = vx * vx + vy * vy;
    const t = vv > 0 ? clamp(-(rx * vx + ry * vy) / vv, 0, 1) : 0;
    return Math.hypot(rx + vx * t, ry + vy * t);
  }
  function detectsLanding(state, aircraft, before) {
    if (aircraft.kind !== 'arrival') return false;
    const airport = airportFor(state, aircraft.airportId);
    if (!airport) return false;
    if (aircraft.type === 'helicopter') {
      const pad = helipadFor(airport), radius = clamp(finite(pad.radius, 20), 10, 35);
      return sweptDistance(before, aircraft, pad, pad) <= radius;
    }
    const old = runwayCoordinates(airport, before), current = runwayCoordinates(airport, aircraft);
    const error = Math.abs(angleDifference(aircraft.heading, airport.heading));
    const threshold = -airport.length / 2;
    if (!aircraft._landing && old.along <= threshold && current.along >= threshold && current.along > old.along) {
      const fraction = (threshold - old.along) / (current.along - old.along);
      const crossingAcross = old.across + (current.across - old.across) * fraction;
      if (Math.abs(crossingAcross) <= 15 && error <= 25 * Math.PI / 180) aircraft._landing = airport.id;
    }
    if (aircraft._landing) {
      if (Math.abs(current.across) > 20 || error > 32 * Math.PI / 180 || current.along < threshold - 4) {
        aircraft._landing = null;
      } else if (current.along >= airport.length * 0.12) return true;
    }
    return false;
  }
  function exitEdge(before, after) {
    const crossings = [];
    if (after.x < 0) crossings.push({ side: 'W', t: (0 - before.x) / (after.x - before.x) });
    if (after.x > WIDTH) crossings.push({ side: 'E', t: (WIDTH - before.x) / (after.x - before.x) });
    if (after.y < 0) crossings.push({ side: 'N', t: (0 - before.y) / (after.y - before.y) });
    if (after.y > HEIGHT) crossings.push({ side: 'S', t: (HEIGHT - before.y) / (after.y - before.y) });
    crossings.sort((a, b) => a.t - b.t);
    return crossings.length ? crossings[0].side : null;
  }
  function forecastPair(a, b) {
    const rx = a.x - b.x, ry = a.y - b.y;
    const vx = Math.cos(a.heading) * a.speed - Math.cos(b.heading) * b.speed;
    const vy = Math.sin(a.heading) * a.speed - Math.sin(b.heading) * b.speed;
    const vv = vx * vx + vy * vy;
    const time = vv > 0 ? clamp(-(rx * vx + ry * vy) / vv, 0, 3) : 0;
    return { time, distance: Math.hypot(rx + vx * time, ry + vy * time) };
  }
  function updateWarnings(state) {
    const warnings = [], pairs = Object.create(null);
    for (let i = 0; i < state.aircraft.length; i++) for (let j = i + 1; j < state.aircraft.length; j++) {
      const a = state.aircraft[i], b = state.aircraft[j], separation = distance(a, b), forecast = forecastPair(a, b);
      const imminent = forecast.time > 0 && forecast.distance < COLLISION_DISTANCE * 1.7;
      if (separation < WARNING_DISTANCE || imminent) warnings.push({
        ids: [a.id, b.id], distance: separation, level: imminent || separation < 30 ? 'danger' : 'near',
        timeToClosest: forecast.time, predictedDistance: forecast.distance
      });
      if (separation < WARNING_DISTANCE) {
        const key = [String(a.id), String(b.id)].sort().join('|');
        pairs[key] = true;
        if (!state._nearPairs[key]) {
          state.nearMisses++;
          state.events.push({ type: 'nearMiss', ids: [a.id, b.id] });
        }
      }
    }
    state.warnings = warnings;
    state._nearPairs = pairs;
  }
  function tick(state, dt) {
    state.time += dt;
    // Existing aircraft move before release checks. Newly spawned aircraft first move
    // on the following tick, so no unannounced motion happens inside the preview.
    const before = state.aircraft.map(a => ({ x: a.x, y: a.y }));
    state.aircraft.forEach(a => moveAircraft(a, dt));
    for (let i = 0; i < state.aircraft.length; i++) for (let j = i + 1; j < state.aircraft.length; j++) {
      if (sweptDistance(before[i], state.aircraft[i], before[j], state.aircraft[j]) <= COLLISION_DISTANCE) {
        const ids = [state.aircraft[i].id, state.aircraft[j].id];
        state.status = 'failed';
        state.failure = { type: 'collision', ids, message: '航機相撞，空域已關閉。' };
        state.aircraft[i].collided = state.aircraft[j].collided = true;
        state.events.push({ type: 'collision', ids });
        updateWarnings(state);
        return;
      }
    }
    const remaining = [];
    state.aircraft.forEach((aircraft, index) => {
      if (detectsLanding(state, aircraft, before[index])) {
        state.landings++;
        state.events.push({ type: 'landed', id: aircraft.id, airportId: aircraft.airportId, x: aircraft.x, y: aircraft.y });
        return;
      }
      const side = exitEdge(before[index], aircraft);
      if (side) {
        if (aircraft.kind === 'departure' && side === aircraft.exitSide) {
          state.departures++;
          state.events.push({ type: 'departed', id: aircraft.id, airportId: aircraft.airportId, side });
        } else {
          state.misses++;
          state.events.push({ type: 'miss', id: aircraft.id, airportId: aircraft.airportId, side,
            reason: aircraft.kind === 'departure' ? 'wrongExit' : 'leftAirspace' });
        }
        return;
      }
      remaining.push(aircraft);
    });
    state.aircraft = remaining;
    updateWarnings(state);
    if (state.mode === 'challenge' && state.misses >= 3) {
      state.status = 'failed';
      state.failure = { type: 'misses', message: '已有三架航機錯過目的地。' };
      return;
    }
    if (state.mode === 'challenge' && state.landings >= Math.max(1, finite(state.map.targetLandings, 12))) {
      state.status = 'won';
      state.events.push({ type: 'won' });
      return;
    }
    for (let i = state.pending.length - 1; i >= 0; i--) {
      const flight = state.pending[i];
      flight.countdown = Math.max(0, flight.countdown - dt);
      if (flight.countdown > 1e-8) continue;
      // Held previews need not repeat a 600-tick forecast 120 times per second.
      // Rechecking only delays release; every actual release is still checked now.
      flight._releaseCheckIn = Math.max(0, finite(flight._releaseCheckIn, 0) - dt);
      if (flight._releaseCheckIn > 1e-8) continue;
      if (safeToRelease(state, flight, 0)) {
        state.pending.splice(i, 1);
        delete flight.countdown;
        delete flight.waiting;
        delete flight._releaseCheckIn;
        state.aircraft.push(flight);
        state.events.push({ type: 'spawn', id: flight.id, airportId: flight.airportId });
      } else {
        flight.countdown = 0;
        flight.waiting = true;
        flight._releaseCheckIn = 0.15;
      }
    }
    state._spawnTimer -= dt;
    if (state._spawnTimer <= 0) {
      scheduleRandomFlight(state);
      const progress = state.mode === 'challenge' ? Math.min(1, state.landings / Math.max(1, finite(state.map.targetLandings, 12))) : Math.min(1, state.time / 600);
      state._spawnTimer = Math.max(8, finite(state.map.spawnInterval, 15) * (1 - progress * 0.22));
    }
  }
  function step(state, dt) {
    state.events = [];
    if (state.status !== 'running' || !Number.isFinite(dt) || dt <= 0) return state;
    // Fixed ticks make waypoint decisions identical in prediction and live motion,
    // regardless of rendering frequency. A partial tick remains for the next frame;
    // state.time is simulation time, never more than 1/120s behind elapsed input.
    state._accumulator += Math.min(MAX_DT, dt);
    while (state._accumulator >= FIXED_DT - 1e-10 && state.status === 'running') {
      state._accumulator = Math.max(0, state._accumulator - FIXED_DT);
      tick(state, FIXED_DT);
    }
    return state;
  }
  const api = { createState, step, setRoute, clearRoute, queueFlight,
    WIDTH, HEIGHT, COLLISION_DISTANCE, WARNING_DISTANCE, PREVIEW_SECONDS, MAX_DT, FIXED_DT,
    AIRCRAFT_TYPES, angleDifference, runwayCoordinates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AirTrafficEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
