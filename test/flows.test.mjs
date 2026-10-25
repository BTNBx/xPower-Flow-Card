// Unit tests for the energy decomposition (xpfFlows). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Load the card in a sandbox with just enough browser stubs to evaluate the top level
const src = readFileSync(new URL('../xpower-flow-card.js', import.meta.url), 'utf8');
const ctx = {
  HTMLElement: class {},
  customElements: { define() {}, get() {} },
  window: {},
  console: { info() {}, warn() {} },
};
vm.createContext(ctx);
vm.runInContext(src + '\n;globalThis.__x={xpfFlows,xpfTier,xpfShow};', ctx);
const { xpfFlows, xpfTier, xpfShow } = ctx.__x;

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('solar covers the home, surplus charges the battery', () => {
  const f = xpfFlows(3000, -1000, 0, 2000);
  near(f.sToH, 2000); near(f.bDis, 0); near(f.gImp, 0);
  near(f.sB, 1000); near(f.gB, 0); near(f.autarky, 100);
});

test('night: battery feeds the home', () => {
  const f = xpfFlows(0, 800, 0, 800);
  near(f.sToH, 0); near(f.bDis, 800); near(f.gImp, 0); near(f.autarky, 100);
});

test('solar first, then battery, then grid', () => {
  const f = xpfFlows(500, 300, 400, 1200);
  near(f.sToH, 500); near(f.bDis, 300); near(f.gImp, 400); near(f.autarky, 800 / 1200 * 100);
});

test('grid charging the battery is not counted as home import', () => {
  const f = xpfFlows(0, -1500, 2000, 500);
  near(f.gImp, 500); near(f.gB, 1500); near(f.sB, 0); near(f.autarky, 0);
});

test('battery charge split between grid and solar', () => {
  const f = xpfFlows(1000, -1500, 1000, 500);
  near(f.sToH, 500); near(f.gImp, 0); near(f.gB, 1000); near(f.sB, 500);
});

test('battery discharging more than the home needs is capped at the home share', () => {
  const f = xpfFlows(800, 3000, -2800, 1000);
  near(f.sToH, 800); near(f.bDis, 200); near(f.gImp, 0); near(f.autarky, 100);
});

test('export does not count as import', () => {
  const f = xpfFlows(4000, 0, -2500, 1500);
  near(f.gImp, 0); near(f.sToH, 1500); near(f.autarky, 100);
});

test('zero / negative load', () => {
  for (const ld of [0, -50]) {
    const f = xpfFlows(1000, 0, 0, ld);
    near(f.feed, 0); near(f.autarky, 0);
  }
});

test('invariants over a grid of inputs', () => {
  const P = [-3000, -400, 0, 7, 400, 3000];
  for (const s of [0, 300, 2500]) for (const b of P) for (const g of P) for (const l of [0, 150, 1200, 4000]) {
    const f = xpfFlows(s, b, g, l);
    for (const k of ['sToH', 'bDis', 'gImp', 'gB', 'sB']) assert.ok(f[k] >= 0, `${k}<0 for ${[s, b, g, l]}`);
    near(f.feed, Math.max(0, l));
    near(f.sToH + f.bDis + f.gImp, f.feed);
    assert.ok(f.bDis <= Math.max(0, b) + 1e-9);
    assert.ok(f.gImp <= Math.max(0, g) + 1e-9);
    near(f.gB + f.sB, Math.max(0, -b));
    assert.ok(f.autarky >= 0 && f.autarky <= 100);
  }
});

test('pulse tier by power', () => {
  assert.equal(xpfTier(50), 0);
  assert.equal(xpfTier(300), 1);
  assert.equal(xpfTier(-1000), 2);
  assert.equal(xpfTier(4000), 3);
});

test('pulse tier hysteresis near a boundary', () => {
  assert.equal(xpfTier(95, 1), 1);    // just under 100 W keeps tier 1
  assert.equal(xpfTier(85, 1), 0);    // clearly under drops
  assert.equal(xpfTier(1540, 2), 2);  // just over 1500 W keeps tier 2
  assert.equal(xpfTier(1700, 2), 3);
  assert.equal(xpfTier(3000, 0), 3);  // big jumps are immediate
});

test('pulses evenly spread, at least one', () => {
  const count = (n, f) => { const s = xpfShow(n, f); let k = 0; for (let i = 0; i < n; i++) if (s(i)) k++; return k; };
  assert.equal(count(10, 1), 10);
  assert.equal(count(10, 0.5), 5);
  assert.equal(count(7, 0.25), 2);
  assert.equal(count(2, 0.25), 1);
  const s = xpfShow(12, 0.25), idx = [...Array(12).keys()].filter(s);
  assert.deepEqual(idx, [3, 7, 11]);
});

test('chart helpers: smooth path, runs, kWh', () => {
  const ctx2 = { HTMLElement: class {}, customElements: { define() {}, get() {} }, window: {}, console: { info() {}, warn() {} } };
  vm.createContext(ctx2);
  vm.runInContext(src + '\n;globalThis.__y={xpfSmooth,xpfRuns,xpfKWh};', ctx2);
  const { xpfSmooth, xpfRuns, xpfKWh } = ctx2.__y;
  assert.equal(xpfSmooth([]), '');
  assert.match(xpfSmooth([[0, 0], [10, 5], [20, 0]]), /^M0\.0 0\.0C/);
  // monotone: a flat segment stays flat (no overshoot)
  assert.ok(xpfSmooth([[0, 5], [10, 5], [20, 5]]).split(/[ MC]/).filter(Boolean).every(v => v === '5.0' || /^\d+\.\d$/.test(v)));
  const r = xpfRuns([1, 2, null, 3, undefined, 4, 5], k => k, v => v);
  assert.equal(r.length, 3); assert.equal(JSON.stringify(r[2]), "[[5,4],[6,5]]");
  assert.equal(xpfKWh(new Array(96).fill(1000)), 24);
  assert.equal(xpfKWh([null, -50, 4000]), 1);
});
