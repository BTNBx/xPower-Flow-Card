A power flow visualization card for solar hybrid inverters in Home Assistant. Single file, no dependencies.

![xPower Flow Card](demo.gif)

## Supported Inverters

| Brand | Integration | Status |
|-------|-------------|--------|
| **Deye** | Solarman / deye_inverter | Tested |
| **Sunsynk** | Sunsynk / modbus | Preset |
| **Huawei** | FusionSolar | Preset |
| **Fronius** | Gen24 / Modbus | Preset |
| **Growatt** | Growatt / modbus | Preset |
| **Victron** | Venus OS / GX | Preset |
| **SolarEdge** | Modbus / SunSpec | Preset |
| **Solis** | SolisCloud | Preset |
| **Any other** | Custom | Custom preset |

Select your brand in the visual editor. Entities and polarity are configured automatically.

## Features

- 9 inverter presets with auto-configured entities and polarity
- 8 languages: Portuguese, English, German, French, Spanish, Italian, Dutch, Polish
- Configurable battery and grid polarity sign conventions
- Dual MPPT support — configure two solar strings independently
- Animated pulse flow lines with speed proportional to power output
- Color-coded values: solar (green), grid (red), home (cyan), battery (yellow)
- Inverter icon with 4 status LEDs indicating active energy flows
- LCD display showing total power throughput
- Battery runtime estimation with shutdown SOC and ETA
- Battery gauge with SOC level indicator
- Optional weather display (temperature and humidity)
- 24-hour sparkline charts with Catmull-Rom interpolation, updated every 5 minutes
- Sparkline tooltips showing power and timestamp on hover
- Auto-scaling Y-axis on all sparklines
- Autarky badge with color-coded self-sufficiency percentage
- Daily totals for import, export, and production in kWh
- Trend arrows for rising, falling, or stable values
- Graceful handling of unavailable sensors (`--`)
- Dynamic card border color reflecting the dominant energy source
- Visual editor for all configuration options
- Light and dark theme support with automatic detection

## Installation

### HACS (Recommended)

1. Open HACS, go to Frontend, click the menu, then Custom repositories
2. Add `https://github.com/BTNBx/xPower-Flow-Card` as **Dashboard**
3. Search for "xPower Flow Card" and install
4. Refresh your browser (Ctrl+Shift+R)

### Manual

1. Download `xpower-flow-card.js` from the [latest release](https://github.com/BTNBx/xPower-Flow-Card/releases)
2. Copy to `/config/www/xpower-flow-card.js`
3. Add resource in **Settings > Dashboards > Resources**:
   - URL: `/local/xpower-flow-card.js`
   - Type: JavaScript Module
4. Refresh your browser

## Configuration

### Visual Editor

Add the card through the UI and use the built-in visual editor. Select your inverter brand from the **Preset** dropdown to auto-fill all entity and polarity fields.

### YAML (Deye example)

```yaml
type: custom:xpower-flow-card
preset: deye
language: pt
inverter_name: DEYE 6K
shutdown_soc: 20
battery_capacity: 5120
weather_temp: sensor.outdoor_temperature
weather_humidity: sensor.outdoor_humidity
```

### YAML (Dual MPPT example)

```yaml
type: custom:xpower-flow-card
preset: deye
solar: sensor.deye_pv1_power
solar2: sensor.deye_pv2_power
pv_voltage: sensor.deye_pv1_voltage
pv_voltage2: sensor.deye_pv2_voltage
```

### YAML (Huawei example)

```yaml
type: custom:xpower-flow-card
preset: huawei
language: de
inverter_name: Huawei SUN2000
shutdown_soc: 10
battery_capacity: 10000
```

### YAML (Custom / any inverter)

```yaml
type: custom:xpower-flow-card
preset: custom
language: en
inverter_name: My Inverter
bat_polarity: negative
grid_polarity: positive
shutdown_soc: 15
battery_capacity: 10240
solar: sensor.my_pv_power
solar2: sensor.my_pv2_power
battery: sensor.my_battery_power
soc: sensor.my_battery_soc
grid: sensor.my_grid_power
load: sensor.my_load_power
grid_voltage: sensor.my_grid_voltage
battery_voltage: sensor.my_battery_voltage
pv_voltage: sensor.my_pv_voltage
pv_voltage2: sensor.my_pv2_voltage
temperature: sensor.my_inverter_temp
frequency: sensor.my_grid_frequency
grid_status: binary_sensor.my_grid_connected
daily_solar: sensor.my_daily_production
daily_import: sensor.my_daily_import
daily_export: sensor.my_daily_export
daily_load: sensor.my_daily_consumption
daily_charge: sensor.my_daily_charge
daily_discharge: sensor.my_daily_discharge
battery_temperature: sensor.my_battery_temp
weather_temp: sensor.my_outdoor_temp
weather_humidity: sensor.my_outdoor_humidity
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `preset` | `deye` | Inverter brand preset |
| `language` | `pt` | Card language (`pt`, `en`, `de`, `fr`, `es`, `it`, `nl`, `pl`) |
| `inverter_name` | `DEYE` | Display name (leave empty to hide) |
| `bat_polarity` | `negative` | `negative` = charging (Deye) or `positive` = charging (Huawei) |
| `grid_polarity` | `positive` | `positive` = import (Deye) or `negative` = import (SolarEdge) |
| `shutdown_soc` | `20` | Battery shutdown SOC percentage |
| `battery_capacity` | `5120` | Battery capacity in Wh |
| `solar2` | | Second MPPT solar power sensor (optional) |
| `pv_voltage2` | | Second MPPT PV voltage sensor (optional) |
| `weather_temp` | | Temperature sensor for weather display |
| `weather_humidity` | | Humidity sensor for weather display |

### Polarity Guide

**Battery power:**
- `negative` = charging: Deye, Sunsynk, Growatt
- `positive` = charging: Huawei, Fronius, SolarEdge, Victron, Solis

**Grid power:**
- `positive` = importing: Deye, Sunsynk, Huawei, Fronius, Growatt, Victron, Solis
- `negative` = importing: SolarEdge

### Inverter LEDs

The 4 LEDs on the inverter icon reflect active power flows:

| LED | Color | Condition |
|-----|-------|-----------|
| 1st | Green | Solar producing (>10 W) |
| 2nd | Orange | Battery discharging (>10 W) |
| 3rd | Red | Grid importing (>10 W) |
| 4th | Cyan | Home consuming (>10 W) |

LEDs blink when active and remain dim when inactive.

## Changelog

### v1.3.5
**Visual**

- Autarky badge moved to top-right corner
- Badge size reduced 15% (55×40 → 47×34)
- Badge green softened — border/fill use low-alpha rgba instead of solid #66BB6A; status threshold colors (≥80/50/25%) also toned down
- Added 8mm spacing between battery data and sparklines row

**Animation**

- Inlet flows (solar/grid/battery → inverter) run at 75% of base speed — faster
- Outlet flow (inverter → home) runs at base speed — slower
- Visual effect of energy accumulating at the inverter before flowing out to home

**CSS Custom Properties**

- --xpf-flow-width — flow line stroke width (default: 3)
- --xpf-dash-size — dash segment size (default: 100; low value e.g. 8 = dot effect)

### v1.3.4
- **Autarky badge** - vertically aligned with battery runtime text

### v1.3.3
- **Layout** - removed empty space between main card and sparkline charts

### v1.3.2
- **Autarky badge** - removed glow effect at 100% autarky
- **Layout** - reduced spacing between card and sparkline charts

### v1.3.1
- **2nd Bug fixing**

### v1.3.0
- **Bug fixing**

### v1.2.9
- **Autarky badge** - more compact dimensions (44×56), smaller font to keep number inside bounds, right-aligned to match weather widget margin

## v1.2.8
- **Bug fixing**

## v1.2.7

- **Bug fixing**

### v1.2.6

**Fixed**
- **Grid Voltage** now displays independently of Grid Frequency — each field renders on its own when only one is configured
- **Victron polarity** preset corrected to `positive` (Venus OS / SmartShunt reports discharge as positive, charge as negative); update your card if you were using the Huawei preset as a workaround
- **Solis** battery polarity no longer reverses regardless of selection — dedicated Solis preset added with correct polarity (`positive`)

**Added**
- **Dual MPPT support** — new `Solar Power (MPPT2)` and `PV Voltage (MPPT2)` entity fields; when both are set, total solar power is the sum of both strings and voltages display as e.g. `48V / 52V`
- **Solis preset** — dedicated preset for Solis (SolisCloud) inverters with correct default entities and polarity
- **Autarky badge** — replaced the flat pill with a bold badge showing the percentage in large type and a colour-coded band; positioned bottom-right of the card

### v1.2.5

**New Features**

- Entity click to open more-info dialog on all power nodes (solar, grid, load, battery)
- Battery sparkline with 24-hour history, tooltip, and charge/discharge daily summary
- Touch support for sparkline tooltips on mobile and tablet devices
- Energy cost overlay with configurable import cost and export earnings sensors
- Compact mode to hide sparklines for sidebar and popup use
- 15 CSS custom properties (--xpf-*) for theme and style customization

**Performance**

- requestAnimationFrame throttle on hass updates to reduce unnecessary redraws
- History loading and timer disabled in compact mode to eliminate redundant API calls

**Build**

- Added esbuild build pipeline with minification
- Added GitHub Actions workflow for automated releases on tag push
- Updated hacs.json with minimum Home Assistant version requirement
- Added package.json with build and watch scripts

**CSS Custom Properties**

- --xpf-bg, --xpf-radius, --xpf-shadow, --xpf-padding
- --xpf-solar, --xpf-battery, --xpf-grid, --xpf-load
- --xpf-green, --xpf-red, --xpf-orange
- --xpf-text, --xpf-text-secondary, --xpf-font-size
- --xpf-sparkline-bg, --xpf-sparkline-radius

**Configuration**

- New options: compact, import_cost, export_cost
- Layout selector in visual editor (Full / Compact)
- Import Cost and Export Earnings entity fields in visual editor

### v1.2.4

**Bug fixes**
- Grid status dot restored — green (online) / red (offline) indicator next to the grid label, reads from `grid_status` entity.
- Fixed copyright header to match MIT license.
- Tooltip time calculation corrected (was rounding to minutes, now uses fractional hours for accurate timestamps).
- History loading guard: `_loadHistory` now checks `this._h` exists before proceeding.

**Visual improvements**
- Smooth icon fade transitions (0.8 s) when power goes on/off — icons and values no longer snap instantly to dim/bright.
- Flow snake lines fade in/out smoothly instead of appearing/disappearing instantly.
- All flow animations synchronized — single shared speed based on the highest active power, all lines pulse in phase.
- Removed animation delay staggering for cleaner coordinated flow.

**Performance**
- Sparkline max values cached on history load — tooltips no longer recalculate `Math.max(...data)` on every mousemove.
- `downsample` extracted to class method — no longer recreated as a closure on every history refresh.

### v1.2.3

- Inverter LCD font size reduced to 6.5 px with tighter letter-spacing to fit within display bounds.

### v1.2.2

- Card border color now reflects the dominant energy source: green (solar), amber (battery), red (grid). Transitions over 1.5 s.
- LCD display redesigned: white text, unified green fill, no lightning icon or blink animation.
- Aurora effect removed; autarky pill golden glow at 90%+ retained.

### v1.2.1

- Ambient glow on card border based on dominant energy source.
- Inverter LCD display added showing total power throughput.
- Aurora gradient background above 90% autarky.
- Flow line color and opacity cross-fade over 800 ms.

### v1.2.0

- Bug fixes.

### v1.1.9

- Sun icon rotates while solar power exceeds 10 W; dims to 25% opacity when inactive.
- Solar, grid, home, and battery icons dim to 25% opacity when power is below 10 W.
- Battery fill turns green with pulse animation while charging above 10 W.

### v1.1.8

- Inverter bolt breathing glow animation.
- Battery charging animation.
- Sun rotation speed set to 20 s.
- Inverter-to-home flow uses yellow when battery is dominant source.
- Sparkline height increased to 55 px.

### v1.1.7

- Weather widget border and divider repositioned.
- Battery discharge flow color changed to yellow.

### v1.1.6

- Flow animations sequenced: incoming completes before outgoing starts.
- Weather widget border widened.

### v1.1.5

- Solar-to-inverter flow changed to green.
- Inverter-to-home flow color dynamic based on dominant source.
- Flow speed increases at 1000 W, 2000 W, 3000 W thresholds.

### v1.1.4

- Minor bug fixes.

### v1.1.3

- Grid tower icon changed to dark red.
- Light theme support with automatic detection.
- Adaptive history sampling for datasets exceeding 10,000 points.

### v1.1.2

- Flow animation stutter fix: speed updates only on changes exceeding 10%.

### v1.1.1

- Minor update.

### v1.1.0

- Zero-value sensors display correctly.
- XSS protection in editor via input sanitization.
- History request deduplication.
- Flow animation refined.
- Weather display added.
- 8 languages added.
- MIT license.

### v1.0.9

- Flow animation changed from dots to pulse/snake style.
- Inverter icon redesigned with 4 dynamic LEDs.
- Color-coded power values introduced.

### v1.0.2

- Initial public release.

## Credits

Designed and built by [@BTNBx](https://github.com/BTNBx).

## License

Licensed under MIT. See [LICENSE](LICENSE) for details.
