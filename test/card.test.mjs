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
// Read by the code but not card options: the dashboard's own `type` key (the editor keeps it first in the YAML)
const NOT_OPTIONS = new Set(['type']);

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
  w.eval(src + '\n;window.__x={DEFAULTS,ENTITY_FIELDS,PRESETS,LANG,EDL,FLBL};');
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
  const missing = [...read].filter(k => !(k in DEFAULTS) && !ALIASES.has(k) && !NOT_OPTIONS.has(k)).sort();
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

// ── Loading and config safety ────────────────────────

test('loading the file twice does not throw or register the card twice', () => {
  const { w, errors } = boot();
  assert.doesNotThrow(() => w.eval(src));
  assert.equal(w.customCards.filter(c => c.type === 'xpower-flow-card').length, 1);
  assert.deepEqual(errors, []);
});

test('font_size is used as a number only (no markup from YAML)', () => {
  const { w } = boot();
  const css = cfg => { const el = w.document.createElement('xpower-flow-card'); el.setConfig({ preset: 'deye', ...cfg }); return el.shadowRoot; };
  const bad = css({ font_size: '24px)}</style><b id="pwn">x</b><style>a{b:c(' });
  assert.equal(bad.getElementById('pwn'), null, 'markup from font_size reached the card');
  assert.match(bad.querySelector('style').textContent, /--xpf-font-size,24px\)/);
  assert.match(css({ font_size: 30 }).querySelector('style').textContent, /--xpf-font-size,30px\)/);
  assert.match(css({ font_size: 'abc' }).querySelector('style').textContent, /--xpf-font-size,24px\)/);
});

test('new cards start from a minimal config', () => {
  const { w } = boot();
  const stub = { ...w.customElements.get('xpower-flow-card').getStubConfig() };
  assert.deepEqual(stub, { preset: 'deye' });
  const c = mount(stub, ok());
  noJunk(c.text(), 'stub config');
  assert.deepEqual(c.errors, []);
  c.close();
});

// ── Visual editor ────────────────────────────────────

const TYPE = 'custom:xpower-flow-card';

// Open the editor on a config. Every config-changed is fed back with setConfig, as the dashboard editor does.
function editor(config) {
  const B = boot();
  const { w } = B;
  const ed = w.document.createElement('xpower-flow-card-editor');
  w.document.body.appendChild(ed);
  ed.hass = { states: {}, language: 'en', locale: { language: 'en' }, callWS: async () => ({}) };
  let out = null;
  ed.addEventListener('config-changed', e => { out = e.detail.config; ed.setConfig(out); });
  ed.setConfig(config);
  const field = id => ed.querySelector('#ed-' + id);
  // Change one field; returns the config written back to YAML (plain copy)
  const change = (id, v) => { const el = field(id); el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); return { ...out }; };
  // What the card ends up using for a given YAML config
  const used = cfg => { const el = w.document.createElement('xpower-flow-card'); el.setConfig(cfg); return { ...el._c }; };
  return { ed, field, change, used, full: () => ({ ...ed._config }), PRESETS: B.PRESETS, DEFAULTS: B.DEFAULTS };
}

test('editor writes only what differs from the preset', () => {
  const e = editor({ type: TYPE, preset: 'huawei' });
  assert.deepEqual(e.change('cap', '10000'), { type: TYPE, preset: 'huawei', battery_capacity: 10000 });
  assert.deepEqual(e.change('solar', 'sensor.my_pv'), { type: TYPE, preset: 'huawei', solar: 'sensor.my_pv', battery_capacity: 10000 });
});

test('the short config gives exactly the same card as the full one', () => {
  for (const preset of ['deye', 'sunsynk', 'huawei', 'fronius', 'growatt', 'victron', 'solaredge', 'solis', 'custom']) {
    const e = editor({ type: TYPE, preset });
    const out = e.change('cap', '7000');
    assert.deepEqual(e.used(out), e.used(e.full()), `preset ${preset}`);
  }
});

test('a config saved by an older editor (every option written) is trimmed without changing the card', () => {
  const e0 = editor({ type: TYPE, preset: 'sunsynk' });
  const old = { type: TYPE, ...e0.used({ preset: 'sunsynk' }), battery_capacity: 10240, grid_status: '' };
  const e = editor(old);
  const out = e.change('ssoc', '15');
  assert.deepEqual(out, { type: TYPE, preset: 'sunsynk', grid_status: '', shutdown_soc: 15, battery_capacity: 10240 });
  assert.deepEqual(e.used(out), e.used({ ...old, shutdown_soc: 15 }));
});

test('an entity cleared in the editor stays cleared', () => {
  const e = editor({ type: TYPE, preset: 'deye' });
  const out = e.change('grid_status', '');
  assert.equal(out.grid_status, '');
  assert.equal(e.used(out).grid_status, '');
});

test('switching brand writes the new preset, not a copy of its entities', () => {
  const e = editor({ type: TYPE, preset: 'deye' });
  const out = e.change('preset', 'huawei');
  assert.deepEqual(out, { type: TYPE, preset: 'huawei' });
  assert.equal(e.used(out).solar, e.PRESETS.huawei.e.solar);
  assert.equal(e.used(out).bat_polarity, 'positive');
  assert.equal(e.field('solar').value, e.PRESETS.huawei.e.solar, 'form shows the new brand');
});

test('detail level: preset applies, the form shows it, later edits keep it, own choices win', () => {
  const e = editor({ type: TYPE, preset: 'deye' });
  assert.deepEqual(e.change('detail', 'essential'), { type: TYPE, preset: 'deye', detail: 'essential' });
  assert.equal(e.field('ech').value, 'off', 'chart select follows the detail level');
  let out = e.change('cap', '10000');
  assert.equal(out.energy_chart, undefined);
  assert.equal(e.used(out).energy_chart, 'off', 'another edit must not undo the detail level');
  assert.equal(e.used(out).energy_frame, false);
  out = e.change('ech', 'bottom');
  assert.equal(out.energy_chart, 'bottom');
  assert.equal(e.used(out).energy_chart, 'bottom');
  out = e.change('detail', '');
  assert.equal(out.detail, undefined);
  assert.deepEqual(e.used(out), e.used(e.full()));
});

test('options the card does not own are kept', () => {
  const e = editor({ type: TYPE, preset: 'deye', view_layout: { column: 2 }, appliance_power: 'sensor.washer', autarky_frame: false });
  const out = e.change('cap', '10000');
  assert.equal(out.type, TYPE);
  assert.deepEqual({ ...out.view_layout }, { column: 2 });
  assert.equal(out.appliance_power, 'sensor.washer');
  assert.equal(e.used(out).extra1_power, 'sensor.washer');
  assert.equal(out.energy_frame, false, 'legacy autarky_frame carried over as energy_frame');
  assert.equal(out.autarky_frame, undefined);
});

test('an edit does not rebuild the form (keeps focus)', () => {
  const e = editor({ type: TYPE, preset: 'deye' });
  const cap = e.field('cap'), inv = e.field('inv');
  e.change('cap', '9000');
  e.change('inv', 'My inverter');
  assert.equal(e.field('cap'), cap);
  assert.equal(e.field('inv'), inv);
});

test('polarity hints in the editor match the presets', () => {
  const e = editor({ type: TYPE, preset: 'deye' });
  const hint = { negative: e.ed.querySelector('#ed-bpol option[value="negative"]').textContent, positive: e.ed.querySelector('#ed-bpol option[value="positive"]').textContent };
  for (const k of Object.keys(e.PRESETS)) {
    const brand = e.PRESETS[k].label.split(' ')[0], pol = e.PRESETS[k].bat_polarity, other = pol === 'negative' ? 'positive' : 'negative';
    assert.ok(!hint[other].includes(brand), `${brand} is listed under "${other}" but its preset is "${pol}"`);
  }
});

test('editor: option values from YAML cannot inject markup', () => {
  for (const k of ['shutdown_soc', 'battery_capacity', 'grid_threshold', 'font_size', 'mppt_scale', 'flow_size', 'inverter_name', 'extra1_name', 'solar']) {
    const e = editor({ type: TYPE, preset: 'deye', [k]: '1"><b id="pwn">x</b><i a="' });
    assert.equal(e.ed.querySelector('#pwn'), null, `markup from ${k} reached the editor`);
  }
});

// ── Energy units ─────────────────────────────────────

test('daily energy sensors in Wh / MWh are shown in kWh', () => {
  const c = mount({ ...FULL, energy_chart: 'bottom', battery_chart: 'bottom' }, ok({
    'sensor.d_sol': st(10500, 'Wh'), 'sensor.d_load': st(0.0081, 'MWh'), 'sensor.d_imp': st(1.2, 'kWh'), 'sensor.d_exp': st(3400, 'Wh'),
    'sensor.d_chg': st(4000, 'Wh'), 'sensor.d_dis': { state: '2', attributes: {} },
  }));
  assert.match(c.$('ds'), /10\.5 kWh/);
  assert.match(c.$('dl'), /8\.1 kWh/);
  assert.match(c.$('dg'), /1\.2 kWh.*3\.4 kWh/);
  assert.match(c.$('db'), /4\.0 kWh.*2\.0 kWh/);
  assert.match(c.$('cvE'), /10\.5 kWh.*8\.1 kWh.*1\.2 kWh/, 'energy chart header');
  assert.match(c.$('ckB'), /\+4\.0.*2\.0 kWh/, 'battery chart header');
  noJunk(c.text(), 'energy units');
  c.close();
});

// ── Translations ─────────────────────────────────────

test('every language has the same card texts', () => {
  const { LANG } = boot();
  const en = Object.keys(LANG.en).sort();
  for (const l of Object.keys(LANG)) assert.deepEqual(Object.keys(LANG[l]).sort(), en, `LANG.${l}`);
});

test('every entity field of the editor has a label in every language', () => {
  const { LANG, EDL, FLBL, ENTITY_FIELDS } = boot();
  const keys = Array.from(ENTITY_FIELDS, f => f.key);
  assert.deepEqual(keys.filter(k => !FLBL[k]), [], 'fields without a translatable label');
  for (const l of Object.keys(LANG)) {
    if (l === 'en') continue; // English labels are the field defaults
    assert.ok(EDL[l], `no editor labels for "${l}"`);
    const e = editor({ type: TYPE, preset: 'deye', language: l });
    for (const k of keys) {
      const txt = e.field(k).parentElement.querySelector('label').textContent;
      assert.doesNotMatch(txt, /undefined|NaN|^\s*$/, `${l}: label of ${k}`);
      assert.equal(txt, FLBL[k](EDL[l]), `${l}: label of ${k} is not the translated one`);
    }
  }
});
