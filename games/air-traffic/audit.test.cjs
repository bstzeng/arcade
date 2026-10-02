'use strict';
// Independent audit: all production maps, geometric boundary cases and spawn fairness.
// Run with: node games/air-traffic/audit.test.cjs
const assert = require('node:assert/strict');
const E = require('./engine.js');
const { maps } = require('./maps.js');
let families = 0, cases = 0;
function test(name, fn) { fn(); families++; console.log('PASS ' + name); }
function state(map = maps[0], mode = 'free', seed = 1) {
  const s = E.createState({ map, mode, seed });
  s.pending = []; s.aircraft = []; s._spawnTimer = 1e9; return s;
}
function flight(s, fields = {}) {
  const a = Object.assign({ id: 'AUDIT' + s.aircraft.length, x: 100, y: 100,
    airportId: s.map.airports[0].id, color: s.map.airports[0].color,
    heading: 0, speed: 24, turnRate: 1.35, type: 'plane', kind: 'arrival',
    route: [], age: 0 }, fields);
  s.aircraft.push(a); return a;
}
function advance(s, seconds, dt = 1 / 60) {
  for (let t = 0; t < seconds - 1e-9 && s.status === 'running'; t += dt)
    E.step(s, Math.min(dt, seconds - t));
}
function point(airport, along, across = 0) {
  const c = Math.cos(airport.heading), d = Math.sin(airport.heading);
  return { x: airport.x + c * along - d * across, y: airport.y + d * along + c * across };
}
function close(a, b, epsilon = 1e-6) { assert.ok(Math.abs(a - b) <= epsilon, `${a} != ${b}`); }

test('all production maps have accessible, unique matching destinations and increasing targets', () => {
  assert.equal(maps.length, 8);
  let lastTarget = 0;
  for (const map of maps) {
    assert.ok(map.targetLandings > lastTarget); lastTarget = map.targetLandings;
    assert.equal(new Set(map.airports.map(a => a.id)).size, map.airports.length);
    assert.equal(new Set(map.airports.map(a => a.color)).size, map.airports.length);
    for (const a of map.airports) {
      for (const p of [point(a, -a.length / 2 - 110), point(a, a.length / 2), a.helipad]) {
        assert.ok(p.x > 20 && p.x < E.WIDTH - 20 && p.y > 20 && p.y < E.HEIGHT - 20, `${map.id}/${a.id} approach outside play area`);
      }
      cases++;
    }
  }
});

test('every runway accepts plane and jet only from its assigned threshold and forward heading', () => {
  for (const map of maps) for (const airport of map.airports) for (const type of ['plane', 'jet']) {
    const s = state(map), speed = E.AIRCRAFT_TYPES[type].speed;
    flight(s, { ...point(airport, -airport.length / 2 - 30), heading: airport.heading,
      speed, type, airportId: airport.id });
    advance(s, (airport.length * 0.62 + 31) / speed);
    assert.equal(s.landings, 1, `${map.id}/${airport.id}/${type}`); assert.equal(s.misses, 0); cases++;
  }
});

test('all runway headings reject reverse, off-center, mid-runway and wrong-destination approaches', () => {
  for (const map of maps) for (const airport of map.airports) {
    const scenarios = [
      { ...point(airport, airport.length / 2 + 30), heading: airport.heading + Math.PI },
      { ...point(airport, -airport.length / 2 - 30, 21), heading: airport.heading },
      { ...point(airport, -airport.length / 2 + 1), heading: airport.heading },
      { ...point(airport, -airport.length / 2 - 30), heading: airport.heading,
        airportId: map.airports.find(a => a.id !== airport.id).id }
    ];
    for (const fields of scenarios) {
      const s = state(map); flight(s, { airportId: airport.id, ...fields }); advance(s, 5);
      assert.equal(s.landings, 0, `${map.id}/${airport.id}: ${JSON.stringify(fields)}`); cases++;
    }
  }
});

test('all helipads accept their helicopter from eight directions and reject another airport', () => {
  for (const map of maps) for (const airport of map.airports) for (let direction = 0; direction < 8; direction++) {
    const heading = direction * Math.PI / 4, pad = airport.helipad;
    const fields = { x: pad.x - Math.cos(heading) * 35, y: pad.y - Math.sin(heading) * 35,
      heading, speed: 15, turnRate: 2.1, type: 'helicopter', airportId: airport.id };
    const right = state(map); flight(right, fields); advance(right, 1.2);
    assert.equal(right.landings, 1, `${map.id}/${airport.id}/${direction}`);
    const wrong = state(map); flight(wrong, { ...fields, airportId: map.airports.find(a => a.id !== airport.id).id });
    advance(wrong, 1.2); assert.equal(wrong.landings, 0); cases += 2;
  }
});

test('landing remains invalid after an armed approach exceeds corridor and turns back inside', () => {
  const s = state(), airport = s.map.airports[0];
  const a = flight(s, { ...point(airport, -airport.length / 2 - 1), heading: airport.heading });
  advance(s, 0.1); assert.equal(a._landing, airport.id);
  Object.assign(a, point(airport, -20, 21)); E.step(s, 1 / 60); assert.equal(a._landing, null);
  Object.assign(a, point(airport, -10)); advance(s, 2); assert.equal(s.landings, 0); cases++;
});

test('departures cannot accidentally land on matching runway or helipad', () => {
  for (const map of maps) for (const airport of map.airports) for (const type of ['plane', 'jet', 'helicopter']) {
    const s = state(map), a = flight(s, { airportId: airport.id, type, kind: 'departure', exitSide: 'E',
      ...point(airport, -airport.length / 2 - 1), heading: airport.heading });
    if (type === 'helicopter') Object.assign(a, airport.helipad);
    advance(s, 5); assert.equal(s.landings, 0); cases++;
  }
});

test('all four exit sides score anywhere on correct boundary and never at another side', () => {
  const geometry = { N: (t) => ({ x: t * E.WIDTH, y: 0.1, heading: -Math.PI / 2 }),
    E: (t) => ({ x: E.WIDTH - 0.1, y: t * E.HEIGHT, heading: 0 }),
    S: (t) => ({ x: t * E.WIDTH, y: E.HEIGHT - 0.1, heading: Math.PI / 2 }),
    W: (t) => ({ x: 0.1, y: t * E.HEIGHT, heading: Math.PI }) };
  for (const edge of Object.keys(geometry)) for (const exitSide of Object.keys(geometry)) for (const t of [0.05, 0.5, 0.95]) {
    const s = state(); flight(s, { kind: 'departure', exitSide, ...geometry[edge](t) }); E.step(s, 0.02);
    assert.equal(s.departures, +(exitSide === edge)); assert.equal(s.misses, +(exitSide !== edge)); cases++;
  }
  // The aircraft crosses east before south despite both coordinates ending outside.
  const s = state(); flight(s, { x: 999.8, y: 699.6, speed: 60, heading: Math.PI / 4, kind: 'departure', exitSide: 'E' });
  E.step(s, 1 / 30); assert.equal(s.departures, 1); cases++;
});

test('a short forward route exhausts and continues on exactly its final heading', () => {
  for (const type of Object.keys(E.AIRCRAFT_TYPES)) {
    const s = state(), properties = E.AIRCRAFT_TYPES[type];
    const a = flight(s, { ...properties, type, kind: 'departure', exitSide: 'E', heading: 0.3 });
    const start = { x: a.x, y: a.y };
    E.setRoute(s, a.id, [{ x: a.x + Math.cos(a.heading) * 20, y: a.y + Math.sin(a.heading) * 20 }]);
    advance(s, 5); assert.equal(a.route.length, 0); close(a.heading, 0.3);
    close(a.x, start.x + Math.cos(0.3) * properties.speed * 5);
    close(a.y, start.y + Math.sin(0.3) * properties.speed * 5); cases++;
  }
});

test('finite-speed motion and progress are stable across common render frame rates', () => {
  const positions = [];
  for (const dt of [1 / 15, 1 / 30, 1 / 60, 1 / 120]) {
    const s = state(); const a = flight(s, { kind: 'departure', exitSide: 'E', speed: 34, turnRate: 1.05, type: 'jet' });
    E.setRoute(s, a.id, [{ x: 170, y: 120 }, { x: 250, y: 210 }, { x: 400, y: 250 }, { x: 750, y: 180 }]);
    advance(s, 12, dt); positions.push({ x: a.x, y: a.y }); cases++;
  }
  for (const p of positions) assert.ok(Math.hypot(p.x - positions[0].x, p.y - positions[0].y) < 3);
});

test('fixed simulation produces identical curves under varied render frame timing', () => {
  const outcomes = [];
  for (const intervals of [[1 / 30], [1 / 60], [1 / 120], [0.005, 0.017, 0.029, 0.011, 0.04]]) {
    const s = state(), a = flight(s, { kind: 'departure', exitSide: 'E',
      x: 500, y: 350, speed: 34, turnRate: 1.05, type: 'jet', heading: 3.108927622468704 });
    E.setRoute(s, a.id, [{ x: 471.3330100895837, y: 391.1115994118154 }, { x: 507.5031871488318, y: 335.0811443384737 }]);
    let elapsed = 0, frame = 0;
    while (elapsed < 4 - 1e-9) {
      const dt = Math.min(intervals[frame++ % intervals.length], 4 - elapsed);
      E.step(s, dt); elapsed += dt;
    }
    outcomes.push({ x: a.x, y: a.y, heading: a.heading, route: a.route, time: s.time }); cases++;
  }
  for (const o of outcomes) {
    close(o.x, outcomes[0].x, 1e-8); close(o.y, outcomes[0].y, 1e-8);
    close(o.heading, outcomes[0].heading, 1e-8); close(o.time, 4, 1e-8);
    assert.deepEqual(o.route, outcomes[0].route);
  }
});

test('swept collisions detect mid-step crossings but ignore separated crossing times', () => {
  for (const offset of [0, 5, 13.9, 14.1, 40]) {
    const s = state(); flight(s, { x: 200, y: 100, speed: 1800, kind: 'departure' });
    flight(s, { x: 260, y: 100 + offset, speed: 1800, heading: Math.PI, kind: 'departure' });
    E.step(s, 1 / 30); assert.equal(s.status === 'failed', offset <= 14); cases++;
  }
  const s = state(); flight(s, { x: 200, y: 100, speed: 1800, kind: 'departure' });
  flight(s, { x: 220, y: 70, speed: 1800, heading: Math.PI / 2, kind: 'departure' });
  E.step(s, 1 / 30); assert.equal(s.status, 'failed'); cases++;
  const separated = state(); flight(separated, { x: 200, y: 100, speed: 1800, kind: 'departure' });
  flight(separated, { x: 250, y: 99, speed: 1800, heading: Math.PI / 2, kind: 'departure' });
  E.step(separated, 1 / 30); assert.equal(separated.status, 'running'); cases++;
});

test('each challenge wins exactly on its landing goal while free play continues beyond it', () => {
  for (const map of maps) for (const mode of ['challenge', 'free']) {
    const s = state(map, mode), airport = s.map.airports[0]; s.landings = map.targetLandings - 1;
    flight(s, { type: 'helicopter', speed: 15, x: airport.helipad.x, y: airport.helipad.y });
    E.step(s, 1 / 60); assert.equal(s.landings, map.targetLandings);
    assert.equal(s.status, mode === 'challenge' ? 'won' : 'running'); cases++;
  }
});

test('unsafe pending previews stay still and their safety forecast does not mutate active routes', () => {
  const s = state(), a = flight(s, { x: 300, y: 200, speed: 34, turnRate: 1.05, type: 'jet' });
  E.setRoute(s, a.id, [{ x: 500, y: 200 }, { x: 500, y: 500 }]);
  const pending = E.queueFlight(s, { x: 305, y: 202, countdown: 0 });
  const points = structuredClone(a.route); E.step(s, 0.01);
  assert.equal(pending.waiting, true); assert.equal(pending.x, 305); assert.equal(pending.y, 202);
  assert.deepEqual(a.route, points); close(a.x, 300 + 34 * s.time); close(a.y, 200); cases++;
});

test('spawn forecast follows curved short routes at actual simulation precision', () => {
  for (const dt of [1 / 30, 1 / 60, 1 / 120]) {
    const s = state();
    const a = flight(s, { id: 'A', x: 500, y: 350, heading: 0.8347261050070711,
      speed: 34, turnRate: 1.05, type: 'jet', kind: 'departure', exitSide: 'E' });
    E.setRoute(s, a.id, [
      { x: 533.877401156351, y: 313.65201021078974 },
      { x: 544.78834990412, y: 400.6163904024288 },
      { x: 549.726837920025, y: 397.3810647102073 },
      { x: 509.2289928905666, y: 361.88340546097606 }
    ]);
    E.queueFlight(s, { id: 'B', x: 639.3757312141008, y: 215.09737187456594,
      heading: 1.8918255817239924, speed: 34, turnRate: 1.05,
      type: 'jet', kind: 'departure', exitSide: 'E', countdown: 0 });
    advance(s, 5, dt);
    assert.equal(s.status, 'running', `Unsafe forecast release at frame interval ${dt}`); cases++;
  }
});

test('high-refresh turns cannot invalidate a safe-release forecast', () => {
  for (const dt of [1 / 30, 1 / 60, 1 / 120]) {
    const s = state();
    const a = flight(s, { id: 'A', x: 500, y: 350, heading: 3.108927622468704,
      speed: 34, turnRate: 1.05, type: 'jet', kind: 'departure', exitSide: 'E' });
    E.setRoute(s, a.id, [
      { x: 471.3330100895837, y: 391.1115994118154 },
      { x: 507.5031871488318, y: 335.0811443384737 }
    ]);
    E.queueFlight(s, { id: 'B', x: 443.2517031677123, y: 205.60753388034493,
      heading: 1.6054603556164162, speed: 34, turnRate: 1.05,
      type: 'jet', kind: 'departure', exitSide: 'E', countdown: 0 });
    advance(s, 5, dt);
    assert.equal(s.status, 'running', `High-refresh unsafe release at frame interval ${dt}`); cases++;
  }
});

test('seeded real-map spawns preserve preview, caps, finite state and a five-second reaction window', () => {
  let checkedSpawns = 0;
  for (const map of maps) for (let seed = 0; seed < 24; seed++) {
    const s = E.createState({ map, mode: 'free', seed });
    const births = new Map();
    for (let frame = 0; frame < 3600 && s.status === 'running'; frame++) {
      E.step(s, 1 / 30);
      assert.ok(s.aircraft.length + s.pending.length <= map.maxTraffic);
      for (const a of s.aircraft) assert.ok(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.heading));
      for (const event of s.events) if (event.type === 'spawn') {
        const a = s.aircraft.find(a => a.id === event.id); births.set(a.id, s.time);
        assert.ok(s.time >= 4 - 1e-7);
        for (const b of s.aircraft) if (a !== b) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 72 - 1e-7);
        checkedSpawns++;
      }
      if (s.failure && s.failure.type === 'collision') for (const id of s.failure.ids) {
        assert.ok(s.time - births.get(id) >= 5 - 1 / 30, `${map.id} seed${seed}: ${id} collided only ${s.time - births.get(id)}s after spawn`);
      }
    }
    cases++;
  }
  assert.ok(checkedSpawns > 1000, `only ${checkedSpawns} spawns audited`);
  console.log('  Audited ' + checkedSpawns + ' actual random releases across 192 seeded map runs.');
});

console.log(`\nIndependent audit passed: ${families} test families, ${cases} deterministic cases.`);
