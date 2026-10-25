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
vm.runInContext(src + '\n;globalThis.__x={xpfFlows};', ctx);
const { xpfFlows } = ctx.__x;

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
