'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const E = require('./engine.js');
let passed = 0;
function test(name, fn) {
  try { fn(); console.log('✓ ' + name); passed++; }
  catch (error) { console.error('✗ ' + name); throw error; }
}
const baseMap = {
  id: 'test', difficulty: 1, targetLandings: 10, spawnInterval: 15, departureRate: 0.3, maxTraffic: 7,
  airports: [
    { id: 'A', name: '青空機場', color: '#22d3ee', x: 500, y: 350, heading: 0, length: 100, helipad: { x: 530, y: 440, radius: 20 } },
    { id: 'B', name: '夕陽機場', color: '#fb923c', x: 750, y: 160, heading: Math.PI / 2, length: 90, helipad: { x: 820, y: 160, radius: 20 } }
  ]
};
function state(overrides = {}) {
  const s = E.createState({ map: { ...baseMap, ...overrides }, mode: 'free', seed: 'engine-tests' });
  s.pending = []; s.aircraft = []; s._spawnTimer = 100000;
  return s;
}
function add(s, fields = {}) {
  const a = { id: 'TEST' + s.aircraft.length, x: 200, y: 250, heading: 0, speed: 24,
    type: 'plane', kind: 'arrival', airportId: 'A', color: '#22d3ee', route: [], age: 0, ...fields };
  s.aircraft.push(a); return a;
}
function advance(s, seconds, interval = 0.02) {
  let left = seconds;
  while (left > 1e-8 && s.status === 'running') { const dt = Math.min(interval, left); E.step(s, dt); left -= dt; }
}
function close(a, b, epsilon = 1e-5) { assert.ok(Math.abs(a - b) < epsilon, `${a} should be close to ${b}`); }

test('exports a browser global and CommonJS API without dependencies', () => {
  const context = {}; vm.createContext(context); vm.runInContext(fs.readFileSync(__dirname + '/engine.js', 'utf8'), context);
  assert.equal(typeof context.AirTrafficEngine.createState, 'function');
  assert.equal(E.WIDTH, 1000); assert.equal(E.HEIGHT, 700);
});
test('map is required and normalized without mutating the input', () => {
  assert.throws(() => E.createState({}), /map/);
  const source = { airports: [{ id: 'A', x: 30, y: 50 }] };
  const s = E.createState({ map: source });
  assert.equal(s.map.airports[0].heading, 0); assert.equal(s.map.airports[0].length, 90);
  assert.equal(source.airports[0].heading, undefined);
});
test('first flight is visible for four seconds before entering the airspace', () => {
  const s = E.createState({ map: baseMap, seed: 8 });
  assert.equal(s.aircraft.length, 0); assert.equal(s.pending.length, 1); assert.equal(s.pending[0].countdown, 4);
  advance(s, 3.98); assert.equal(s.aircraft.length, 0); assert.equal(s.pending.length, 1);
  advance(s, 0.04); assert.equal(s.aircraft.length, 1); assert.equal(s.pending.length, 0);
  assert.ok(s.aircraft[0].age < 0.05);
});
test('aircraft continue moving with no route and after the route ends', () => {
  const s = state(), a = add(s);
  advance(s, 1); close(a.x, 224); close(a.y, 250);
  assert.ok(E.setRoute(s, a.id, [{ x: 250, y: 250 }]));
  advance(s, 3); close(a.x, 296); close(a.y, 250); assert.equal(a.route.length, 0);
});
test('route replacement changes heading smoothly with a finite turn rate', () => {
  const s = state(), a = add(s);
  E.setRoute(s, a.id, [{ x: 200, y: 600 }]);
  assert.equal(a.heading, 0);
  E.step(s, 0.1);
  assert.ok(a.heading > 0 && a.heading <= E.AIRCRAFT_TYPES.plane.turnRate * 0.1 + 1e-9);
  assert.ok(a.x > 200 && a.y > 250);
  const heading = a.heading;
  E.clearRoute(s, a.id); E.step(s, 0.1); close(a.heading, heading);
});
test('route API sanitizes input, preserves copied points, and handles unknown IDs', () => {
  const s = state(), a = add(s), points = [{ x: 250, y: 300 }, { x: NaN, y: 8 }, [300, 310], { x: 9000, y: -9000 }];
  assert.equal(E.setRoute(s, 'unknown', points), false);
  assert.equal(E.setRoute(s, a.id, points), true); points[0].x = 99;
  assert.equal(a.route[0].x, 250); assert.equal(a.route.length, 3);
  assert.deepEqual(a.route[2], { x: 1060, y: -60 });
  assert.equal(E.setRoute(s, a.id, null), false);
});
test('a waypoint inside the turn radius cannot trap a jet in an endless orbit', () => {
  const s = state(), a = add(s, { x: 100, y: 100, type: 'jet', speed: 34, turnRate: 1.05 });
  E.setRoute(s, a.id, [{ x: 100, y: 100 + 34 / 1.05 }]);
  advance(s, 4); assert.equal(a.route.length, 0);
  const heading = a.heading, old = { x: a.x, y: a.y };
  advance(s, 0.5); close(a.heading, heading); close(Math.hypot(a.x - old.x, a.y - old.y), 17);
});
test('normal aircraft land only after crossing the assigned runway in its direction', () => {
  const s = state(), a = add(s, { x: 420, y: 350, heading: 0 });
  advance(s, 1.5); assert.equal(s.landings, 0); assert.equal(a._landing, 'A');
  advance(s, 2.5); assert.equal(s.landings, 1); assert.equal(s.aircraft.length, 0);
});
test('reverse direction, wrong angle and parallel runway misses do not land', () => {
  for (const fields of [
    { x: 580, y: 350, heading: Math.PI },
    { x: 430, y: 338, heading: Math.PI / 6 },
    { x: 420, y: 371, heading: 0 }
  ]) {
    const s = state(); add(s, fields); advance(s, 8); assert.equal(s.landings, 0);
  }
});
test('starting inside a runway cannot skip the approach threshold', () => {
  const s = state(); add(s, { x: 490, y: 350 }); advance(s, 3); assert.equal(s.landings, 0);
});
test('crossing a different airport does not count as landing', () => {
  const s = state(); add(s, { x: 420, y: 350, airportId: 'B' }); advance(s, 5); assert.equal(s.landings, 0);
});
test('turning out of the runway cancels an armed approach', () => {
  const s = state(), a = add(s, { x: 430, y: 350 }); advance(s, 1);
  assert.equal(a._landing, 'A'); E.setRoute(s, a.id, [{ x: 454, y: 50 }]); advance(s, 2);
  assert.equal(s.landings, 0); assert.equal(a._landing, null);
});
test('vertical runways use the same directional landing rule', () => {
  const s = state(); add(s, { x: 750, y: 90, heading: Math.PI / 2, airportId: 'B' });
  advance(s, 4); assert.equal(s.landings, 1);
});
test('helicopters may enter their assigned helipad from any heading', () => {
  for (const heading of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const s = state(); add(s, { type: 'helicopter', speed: 15,
      x: 530 - Math.cos(heading) * 35, y: 440 - Math.sin(heading) * 35, heading });
    advance(s, 1.1); assert.equal(s.landings, 1);
  }
});
test('helicopters cannot land at the wrong pad or regular runway', () => {
  const s = state(); add(s, { type: 'helicopter', speed: 15, x: 805, y: 160, airportId: 'A' }); advance(s, 2);
  assert.equal(s.landings, 0);
  const runway = state(); add(runway, { type: 'helicopter', speed: 15, x: 420, y: 350 }); advance(runway, 8);
  assert.equal(runway.landings, 0);
});
test('departures succeed at all four assigned exit edges', () => {
  for (const [side, x, y, heading] of [['W', 5, 250, Math.PI], ['E', 995, 250, 0], ['N', 250, 5, -Math.PI / 2], ['S', 250, 695, Math.PI / 2]]) {
    const s = state(); add(s, { kind: 'departure', exitSide: side, x, y, heading }); advance(s, 0.3);
    assert.equal(s.departures, 1); assert.equal(s.misses, 0); assert.equal(s.landings, 0);
  }
});
test('wrong departure exit and arrivals leaving airspace each count a miss', () => {
  const s = state(); add(s, { kind: 'departure', exitSide: 'N', x: 995 }); advance(s, 0.3);
  assert.equal(s.misses, 1); assert.equal(s.departures, 0);
  add(s, { x: 995 }); advance(s, 0.3); assert.equal(s.misses, 2);
});
test('three misses fail a challenge, but free play permits missed flights', () => {
  for (const mode of ['challenge', 'free']) {
    const s = state(); s.mode = mode;
    for (let i = 0; i < 3; i++) { add(s, { x: 995, y: 100 + i * 100 }); advance(s, 0.3); }
    assert.equal(s.misses, 3); assert.equal(s.status, mode === 'challenge' ? 'failed' : 'running');
    if (mode === 'challenge') assert.equal(s.failure.type, 'misses');
  }
});
test('landing target wins challenge while departure completions do not', () => {
  const s = state({ targetLandings: 1 }); s.mode = 'challenge';
  add(s, { kind: 'departure', exitSide: 'E', x: 995 }); advance(s, 0.3); assert.equal(s.status, 'running');
  add(s, { x: 420, y: 350 }); advance(s, 4); assert.equal(s.status, 'won'); assert.equal(s.landings, 1);
  assert.ok(s.events.some(e => e.type === 'won'));
});
test('collision stops both modes and identifies the aircraft pair', () => {
  for (const mode of ['challenge', 'free']) {
    const s = state(); s.mode = mode;
    add(s, { id: 'ONE', x: 300, y: 300, heading: 0 }); add(s, { id: 'TWO', x: 330, y: 300, heading: Math.PI });
    advance(s, 1); assert.equal(s.status, 'failed'); assert.equal(s.failure.type, 'collision');
    assert.deepEqual(s.failure.ids, ['ONE', 'TWO']); assert.ok(s.aircraft.every(a => a.collided));
    assert.ok(s.events.some(e => e.type === 'collision'));
  }
});
test('swept collision detection catches fast crossing between frames', () => {
  const s = state(); add(s, { x: 200, y: 300, speed: 1800 }); add(s, { x: 240, y: 300, heading: Math.PI, speed: 1800 });
  E.step(s, 0.033); assert.equal(s.status, 'failed'); assert.equal(s.failure.type, 'collision');
});
test('warnings forecast converging aircraft before the near-distance threshold', () => {
  const s = state(); add(s, { id: 'ONE', x: 300, y: 300 }); add(s, { id: 'TWO', x: 420, y: 300, heading: Math.PI });
  E.step(s, 0.02); assert.equal(s.warnings.length, 1); assert.equal(s.warnings[0].level, 'danger');
  assert.ok(s.warnings[0].distance > E.WARNING_DISTANCE); assert.equal(s.nearMisses, 0);
});
test('near-miss episodes count once until aircraft separate', () => {
  const s = state(), a = add(s, { x: 300, y: 300 }), b = add(s, { x: 300, y: 340 });
  advance(s, 1); assert.equal(s.nearMisses, 1); assert.equal(s.warnings.length, 1);
  b.y = 500; E.step(s, 0.02); assert.equal(s.warnings.length, 0);
  b.y = 340; E.step(s, 0.02); assert.equal(s.nearMisses, 2); assert.ok(a.x > 300);
});
test('unsafe spawn previews wait and resume only after a safe opening', () => {
  const s = state(), blocker = add(s, { id: 'BLOCKER', x: 210, y: 250, speed: 1 });
  const flight = E.queueFlight(s, { id: 'WAIT', x: 200, y: 250, heading: 0, countdown: 0 });
  E.step(s, 0.1); assert.equal(s.pending.length, 1); assert.equal(flight.waiting, true); assert.equal(s.aircraft.length, 1);
  blocker.x = 800; E.step(s, 0.1); assert.equal(s.pending.length, 0); assert.equal(s.aircraft.length, 2);
  assert.equal(s.status, 'running'); assert.ok(s.events.some(e => e.type === 'spawn' && e.id === 'WAIT'));
});
test('spawn safety considers approaching trajectories rather than position alone', () => {
  const s = state(); add(s, { x: 380, y: 250, heading: Math.PI, speed: 34 });
  const flight = E.queueFlight(s, { x: 200, y: 250, heading: 0, speed: 34, countdown: 0 });
  E.step(s, 0.02); assert.ok(s.pending.includes(flight)); assert.equal(flight.waiting, true);
});
test('spawn forecasts preserve tight curved routes at 30, 60 and 120 frames per second', () => {
  for (const dt of [1 / 30, 1 / 60, 1 / 120]) {
    const s = state(), a = add(s, { id: 'CURVE', x: 500, y: 350, heading: 0.8347261050070711,
      speed: 34, turnRate: 1.05, type: 'jet', kind: 'departure', exitSide: 'E' });
    E.setRoute(s, a.id, [
      { x: 533.877401156351, y: 313.65201021078974 },
      { x: 544.78834990412, y: 400.6163904024288 },
      { x: 549.726837920025, y: 397.3810647102073 },
      { x: 509.2289928905666, y: 361.88340546097606 }
    ]);
    E.queueFlight(s, { id: 'INCOMING', x: 639.3757312141008, y: 215.09737187456594,
      heading: 1.8918255817239924, speed: 34, turnRate: 1.05,
      type: 'jet', kind: 'departure', exitSide: 'E', countdown: 0 });
    advance(s, 5, dt); assert.equal(s.status, 'running');
  }
});
test('fixed simulation ticks prevent high-frame-rate waypoint release divergence', () => {
  for (const dt of [1 / 30, 1 / 60, 1 / 120, 1 / 144]) {
    const s = state(), a = add(s, { id: 'CURVE', x: 500, y: 350, heading: 3.108927622468704,
      speed: 34, turnRate: 1.05, type: 'jet', kind: 'departure', exitSide: 'E' });
    E.setRoute(s, a.id, [{ x: 471.3330100895837, y: 391.1115994118154 },
      { x: 507.5031871488318, y: 335.0811443384737 }]);
    E.queueFlight(s, { id: 'INCOMING', x: 443.2517031677123, y: 205.60753388034493,
      heading: 1.6054603556164162, speed: 34, turnRate: 1.05,
      type: 'jet', kind: 'departure', exitSide: 'E', countdown: 0 });
    advance(s, 5, dt); assert.equal(s.status, 'running');
  }
});
test('fixed ticks make motion identical across constant and variable frame intervals', () => {
  const states = [];
  for (const frames of [[1 / 30], [1 / 60], [1 / 120], [1 / 144], [0.012, 0.021, 0.014, 0.026, 0.009, 0.018]]) {
    const s = state(), a = add(s, { type: 'jet', speed: 34, kind: 'departure', exitSide: 'E' });
    E.setRoute(s, a.id, [{ x: 270, y: 280 }, { x: 350, y: 410 }, { x: 550, y: 350 }, { x: 800, y: 180 }]);
    let elapsed = 0, frame = 0;
    while (elapsed < 10 - 1e-9) {
      const dt = Math.min(frames[frame++ % frames.length], 10 - elapsed);
      E.step(s, dt); elapsed += dt;
    }
    states.push(s);
  }
  for (const s of states) {
    assert.equal(s.time, states[0].time);
    assert.deepEqual(s.aircraft, states[0].aircraft);
    assert.ok(s._accumulator < E.FIXED_DT);
  }
});
test('simultaneous nearby preview releases cannot collide immediately', () => {
  const s = state(); E.queueFlight(s, { id: 'ONE', x: 200, y: 200, countdown: 0 });
  E.queueFlight(s, { id: 'TWO', x: 202, y: 200, countdown: 0 });
  E.step(s, 0.05); assert.equal(s.aircraft.length, 1); assert.equal(s.pending.length, 1); assert.equal(s.status, 'running');
});
test('combined active aircraft and previews respect traffic cap', () => {
  const s = E.createState({ map: { ...baseMap, maxTraffic: 1, spawnInterval: 5 }, mode: 'free', seed: 7 });
  assert.equal(E.queueFlight(s, { x: 400, y: 400 }), null);
  for (let i = 0; i < 2000; i++) { E.step(s, 0.2); assert.ok(s.aircraft.length + s.pending.length <= 1); }
  assert.equal(s.status, 'running');
});
test('queued IDs are unique and automatic IDs avoid explicit collisions', () => {
  const s = state(); assert.ok(E.queueFlight(s, { id: 'F002' }));
  assert.equal(E.queueFlight(s, { id: 'F002' }), null);
  const generated = E.queueFlight(s, {}); assert.notEqual(generated.id, 'F002');
});
test('same seed and inputs produce exactly the same simulation', () => {
  const options = { map: baseMap, seed: 'repeatable', mode: 'free' };
  const a = E.createState(options), b = E.createState(options);
  for (let i = 0; i < 1800; i++) { E.step(a, 0.1); E.step(b, 0.1); }
  assert.deepEqual(a, b);
  const c = E.createState({ ...options, seed: 'different' });
  assert.notDeepEqual(E.createState(options).pending, c.pending);
});
test('invalid dt is ignored and enormous dt is bounded safely', () => {
  const s = state(), a = add(s);
  for (const dt of [NaN, Infinity, -Infinity, -1, 0, undefined, '1']) E.step(s, dt);
  assert.equal(s.time, 0); assert.equal(a.x, 200);
  E.step(s, 1e100); close(s.time, E.MAX_DT); close(a.x, 224);
  assert.ok(Number.isFinite(a.x) && Number.isFinite(a.heading));
});
test('zero dt leaves position, preview countdown and simulation time unchanged', () => {
  const s = E.createState({ map: baseMap, seed: 2 });
  const snapshot = JSON.stringify(s); E.step(s, 0); assert.equal(JSON.stringify(s), snapshot);
});
test('finished states freeze simulation and reject route edits', () => {
  for (const status of ['failed', 'won']) {
    const s = state(), a = add(s); E.setRoute(s, a.id, [{ x: 400, y: 300 }]); s.status = status;
    assert.equal(E.setRoute(s, a.id, [{ x: 800, y: 650 }]), false); assert.equal(E.clearRoute(s, a.id), false);
    E.step(s, 1); assert.equal(s.time, 0); assert.equal(a.x, 200); assert.equal(a.route[0].x, 400);
    assert.equal(E.queueFlight(s, {}), null);
  }
});
test('many seeds release their first flight safely and produce finite motion', () => {
  for (let seed = 0; seed < 100; seed++) {
    const s = E.createState({ map: baseMap, seed, mode: 'free' }); advance(s, 8, 0.1);
    assert.equal(s.status, 'running'); assert.equal(s.aircraft.length, 1);
    const a = s.aircraft[0]; assert.ok(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.heading));
    assert.ok(a.x >= 0 && a.x <= E.WIDTH && a.y >= 0 && a.y <= E.HEIGHT);
  }
});
console.log(`\n${passed} air traffic engine tests passed.`);
