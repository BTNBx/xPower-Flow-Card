// Card-level tests: config handling and rendering with missing/odd sensor data. Run: npm test
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const src = readFileSync(new URL('../xpower-flow-card.js', import.meta.url), 'utf8');

// Legacy option names still accepted from YAML and mapped to current ones in setConfig
const ALIASES = new Set([
  'autarky_frame',
  'appliance_power', 'appliance_name', 'heatpump_power', 'heatpump_name', 'garage_power', 'garage_name',
]);

// Every window opened by a test is closed afterwards, even when an assertion fails (an open window keeps node alive)
const OPEN = [];
afterEach(() => { while (OPEN.length) { try { OPEN.pop().close(); } catch {} } });

// Boot a fresh window with the card loaded. rAF is queued and flushed by hand so tests are deterministic.
function boot() {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' });
  const w = dom.window;
  OPEN.push(w);
  const E = w.SVGElement.prototype;
  E.getComputedTextLength = function () { return (this.textContent || '').length * 6; };
  E.getBBox = () => ({ x: 0, y: 0, width: 10, height: 10 });
  E.getTotalLength = () => 100;
  E.getPointAtLength = () => ({ x: 0, y: 0 });
  let q = [];
  w.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  w.cancelAnimationFrame = () => {};
  w.console.info = () => {};
  const errors = [];
  w.console.error = (...a) => errors.push(a.join(' '));
  w.eval(src + '\n;window.__x={DEFAULTS,ENTITY_FIELDS};');
  const flush = () => {
    for (let i = 0; i < 50 && q.length; i++) {
      const cur = q; q = [];
      const t = w.performance.now() + 60000;
      cur.forEach(cb => cb(t));
    }
  };
  return { w, flush, errors, ...w.__x };
}

const st = (v, u = 'W') => ({ state: String(v), attributes: { unit_of_measurement: u } });

function mount(config, states, { now } = {}) {
  const B = boot();
  const { w } = B;
  if (now !== undefined) w.Date.now = () => now.t;
  const el = w.document.createElement('xpower-flow-card');
  el.setConfig(config);
  w.document.body.appendChild(el);
  const hass = s => ({ states: s, themes: { darkMode: true }, language: 'en', locale: { language: 'en' }, callWS: async () => ({}), callApi: async () => ({}) });
  const set = s => { el.hass = hass(s); el._update(); B.flush(); };
  set(states);
  const $ = id => { const n = el.shadowRoot.getElementById(id); return n ? n.textContent : null; };
  const text = () => el.shadowRoot.textContent;
  const close = () => { el.remove(); w.close(); };
  return { el, set, $, text, close, errors: B.errors };
}

const FULL = {
  preset: 'deye', language: 'en',
  solar: 'sensor.solar', battery: 'sensor.bat', grid: 'sensor.grid', load: 'sensor.load', soc: 'sensor.soc',
  daily_solar: 'sensor.d_sol', daily_import: 'sensor.d_imp', daily_export: 'sensor.d_exp',
  daily_load: 'sensor.d_load', daily_charge: 'sensor.d_chg', daily_discharge: 'sensor.d_dis',
};
const ok = (over = {}) => ({
  'sensor.solar': st(2000), 'sensor.bat': st(-500), 'sensor.grid': st(0), 'sensor.load': st(1500), 'sensor.soc': st(60, '%'),
  'sensor.d_sol': st(10.5, 'kWh'), 'sensor.d_imp': st(1.2, 'kWh'), 'sensor.d_exp': st(3.4, 'kWh'),
  'sensor.d_load': st(8.1, 'kWh'), 'sensor.d_chg': st(4, 'kWh'), 'sensor.d_dis': st(2, 'kWh'),
  ...over,
});
const allAs = state => Object.fromEntries(Object.keys(ok()).map(k => [k, { state, attributes: {} }]));
const noJunk = (t, why) => assert.doesNotMatch(t, /NaN|undefined|Infinity|null|\[object/, `junk in card text (${why})`);

// ── Config ───────────────────────────────────────────

test('every option the card reads is in DEFAULTS (otherwise setConfig drops it, #29)', () => {
  const { DEFAULTS, w } = boot();
  const read = new Set();
  for (const m of src.matchAll(/\b(?:c|this\._c|this\._config|cfg)\.([a-z][a-z0-9_]*)/g)) read.add(m[1]);
  const missing = [...read].filter(k => !(k in DEFAULTS) && !ALIASES.has(k)).sort();
  assert.deepEqual(missing, [], 'add these to DEFAULTS (or to ALIASES in this test if they are legacy names)');
  w.close();
});

test('every editor entity field is in DEFAULTS', () => {
  const { DEFAULTS, ENTITY_FIELDS, w } = boot();
  const missing = Array.from(ENTITY_FIELDS, f => f.key).filter(k => !(k in DEFAULTS));
  assert.deepEqual(missing, []);
  w.close();
});

test('every DEFAULTS key set in YAML survives setConfig', () => {
  const { DEFAULTS, w } = boot();
  const el = w.document.createElement('xpower-flow-card');
  const cfg = { preset: 'deye' };
  for (const k of Object.keys(DEFAULTS)) if (k !== 'preset') cfg[k] = typeof DEFAULTS[k] === 'number' ? 7 : typeof DEFAULTS[k] === 'boolean' ? !DEFAULTS[k] : 'x_' + k;
  el.setConfig(cfg);
  for (const k of Object.keys(cfg)) assert.deepEqual(el._c[k], cfg[k], `option ${k} was lost`);
  w.close();
});

// ── Rendering with bad / missing data ────────────────

test('renders with all sensors available', () => {
  const c = mount(FULL, ok());
  assert.match(c.$('ds'), /10\.5 kWh/);
  assert.match(c.$('dg'), /1\.2 kWh.*3\.4 kWh/);
  noJunk(c.text(), 'all available');
  assert.deepEqual(c.errors, []);
  c.close();
});

for (const state of ['unavailable', 'unknown', '', 'abc']) {
  test(`renders with every sensor "${state}" (#32)`, () => {
    const c = mount(FULL, allAs(state));
    for (const id of ['ds', 'dl']) assert.doesNotMatch(c.$(id), /kWh/, `${id} should show --`);
    assert.doesNotMatch(c.$('dg'), /kWh/);
    assert.doesNotMatch(c.$('db'), /kWh/);
    noJunk(c.text(), state);
    assert.deepEqual(c.errors, []);
    c.close();
  });
}

test('renders with entities that do not exist in HA', () => {
  const c = mount(FULL, {});
  noJunk(c.text(), 'missing entities');
  assert.deepEqual(c.errors, []);
  c.close();
});

test('renders with only solar and load configured', () => {
  const c = mount({ preset: 'deye', language: 'en', solar: 'sensor.solar', load: 'sensor.load', battery: '', grid: '', soc: '' },
    { 'sensor.solar': st(800), 'sensor.load': st(600) });
  noJunk(c.text(), 'minimal config');
  assert.deepEqual(c.errors, []);
  c.close();
});

test('one daily sensor of a pair missing: total uses the other one', () => {
  const c = mount(FULL, ok({ 'sensor.d_exp': st('unavailable') }));
  assert.match(c.$('dg'), /1\.2 kWh/);
  noJunk(c.text(), 'half pair');
  c.close();
});

test('unbalanced readings never show phantom solar (#30)', () => {
  const c = mount(FULL, ok({ 'sensor.solar': st(0), 'sensor.bat': st(0), 'sensor.grid': st(0), 'sensor.load': st(500) }));
  assert.doesNotMatch(c.$('va') || '', /100/, 'no 100% self-sufficiency with 0 W solar and battery');
  noJunk(c.text(), 'unbalanced');
  c.close();
});

test('kW sensors and odd values do not break the card', () => {
  const c = mount(FULL, ok({ 'sensor.solar': st(2.5, 'kW'), 'sensor.load': st(-30), 'sensor.soc': st(150, '%'), 'sensor.bat': st(1e9) }));
  noJunk(c.text(), 'odd values');
  assert.deepEqual(c.errors, []);
  c.close();
});

// ── Time-based behaviour ─────────────────────────────

test('battery runtime ignores readings from before a long gap (#31)', () => {
  const now = { t: Date.parse('2026-01-15T22:00:00Z') };
  const night = { 'sensor.solar': st(0), 'sensor.grid': st(0), 'sensor.soc': st(60, '%') };
  const a = mount(FULL, ok({ ...night, 'sensor.bat': st(3000), 'sensor.load': st(3000) }), { now });
  now.t += 3600000; // card idle for 1 h
  a.set(ok({ ...night, 'sensor.bat': st(300), 'sensor.load': st(300) }));
  const fresh = mount(FULL, ok({ ...night, 'sensor.bat': st(300), 'sensor.load': st(300) }), { now });
  assert.equal(a.$('br'), fresh.$('br'), 'runtime after the gap must match a card that only saw the current power');
  a.close(); fresh.close();
});

test('battery runtime still averages within the 15 min window', () => {
  const now = { t: Date.parse('2026-01-15T22:00:00Z') };
  const night = { 'sensor.solar': st(0), 'sensor.grid': st(0), 'sensor.soc': st(60, '%') };
  const a = mount(FULL, ok({ ...night, 'sensor.bat': st(3000), 'sensor.load': st(3000) }), { now });
  now.t += 5 * 60000;
  a.set(ok({ ...night, 'sensor.bat': st(300), 'sensor.load': st(300) }));
  const fresh = mount(FULL, ok({ ...night, 'sensor.bat': st(300), 'sensor.load': st(300) }), { now });
  assert.notEqual(a.$('br'), fresh.$('br'), 'recent readings should still be averaged in');
  a.close(); fresh.close();
});

// ── Chart legend ─────────────────────────────────────

test('clicking a chart legend item hides and shows its line', () => {
  const c = mount({ ...FULL, energy_chart: 'bottom', solar_forecast: false }, ok());
  const N = 96, ser = v => Array.from({ length: N }, (_, k) => (k < 60 ? v : null));
  c.el._hist = { solar: ser(2000), load: ser(800), grid: ser(100), bat: null, soc: null };
  c.el._drawSparks();
  const svg = () => c.el.shadowRoot.getElementById('cgE').innerHTML;
  const item = id => c.el.shadowRoot.querySelector('#cvE [data-s="' + id + '"]');
  assert.match(svg(), /stroke="var\(--load\)"/);
  item('l').click();
  assert.doesNotMatch(svg(), /stroke="var\(--load\)"/, 'house line hidden');
  assert.match(svg(), /stroke="var\(--green\)"/, 'solar line still there');
  assert.ok(item('l').classList.contains('off'));
  assert.equal(item('l').getAttribute('aria-pressed'), 'false');
  item('l').click();
  assert.match(svg(), /stroke="var\(--load\)"/, 'house line back');
  assert.ok(!item('l').classList.contains('off'));
  c.close();
});
