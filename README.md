A power flow visualization card for solar hybrid inverters in Home Assistant. Single file, no dependencies.

![xPower Flow Card](demo.gif)

## Supported Inverters

| Brand | Integration | Status |
|-------|-------------|--------|
| **Deye** | Solarman / deye_inverter | Tested |
| **Sunsynk** | Sunsynk / Modbus | Preset |
| **Huawei** | FusionSolar | Preset |
| **Fronius** | Gen24 / Modbus | Preset |
| **Growatt** | Growatt / Modbus | Preset |
| **Victron** | Venus OS / GX | Tested |
| **SolarEdge** | Modbus / SunSpec | Preset |
| **Solis** | SolisCloud / Modbus  | Preset / Tested |
| **Any other** | Custom | Custom preset |

Select your brand in the visual editor. Entities and polarity are configured automatically.

## Features
* 9 inverter presets with auto-configured entities and polarity
* 9 languages: Portuguese, English, German, French, Spanish, Italian, Dutch, Polish, Swedish
* Configurable battery and grid polarity sign conventions
* Dual MPPT support, configure two solar strings independently
* Optional EV charging node with animated flow, blinking bolt, SOC and daily energy
* Extra consumption nodes, appliances, garage, heat pump, and custom loads, each with its own power sensor, icon, and label
* Animated pulse flow lines with speed proportional to power output
* Inverter → home flow coloured by the mix feeding the home (solar green / battery amber / grid red)
* Color-coded values: solar (green), grid (red), home (cyan), battery (yellow)
* Inverter icon with 4 status LEDs indicating active energy flows
* Battery runtime estimation with shutdown SOC and ETA
* Optional weather display (temperature and humidity)
* 24-hour sparkline charts with Catmull-Rom interpolation, updated every 5 minutes
* Sparkline tooltips showing power and timestamp on hover
* Auto-scaling Y-axis on all sparklines
* Circular self-sufficiency ring, split by the source feeding the home (solar / battery / grid), centered %, leaf glyph, sliding slice transitions, and hover/tap label
* Daily totals for import, export, and production in kWh
* Trend arrows for rising, falling, or stable values
* Graceful handling of unavailable sensors (`--`)
* Dynamic card border color reflecting the dominant energy source
* Visual editor for all configuration options
* Adjustable main-value font size from the visual editor
* Light and dark theme support with automatic detection
* Compact mode (flow diagram only, no sparklines)
* Three-phase grid voltage display (L1/L2/L3)
* Split battery charge/discharge sensors for Solis/Modbus setups
* Daily energy cost overlay (import cost / export earnings)
* Optional energy price display driven by a tariff sensor (with price icons)
* Grid status indicator dot (on-grid / off-grid)
* Click any node to open its more-info dialog — dual-MPPT opens each string (PV1/PV2) separately
* Full theming via CSS custom properties (`--xpf-*`)
* Performance-optimized: entity diffing, paused updates in hidden tabs
* Animated value transitions, smooth count-up on power and self-sufficiency changes
* Gradient-filled sparkline areas
* Respects `prefers-reduced-motion` (all animations disabled)
* Fully translated visual editor (all 9 languages)
* One-click entity auto-detection (HA Energy Dashboard + power sensor heuristics)
* Live entity validation in the editor — missing entities flagged in red
* `prefers-color-scheme` theme fallback when HA theme info is absent

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=BTNBx&repository=xPower-Flow-Card&category=dashboard)

1. Open **HACS** in Home Assistant
2. Search for **"xPower Flow Card"** and install
3. Refresh your browser (Ctrl+Shift+R)

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
| `language` | `pt` | Card language (`pt`, `en`, `de`, `fr`, `es`, `it`, `nl`, `pl`, `sv`) |
| `inverter_name` | `DEYE` | Display name (leave empty to hide) |
| `bat_polarity` | `negative` | `negative` = charging (Deye) or `positive` = charging (Huawei) |
| `grid_polarity` | `positive` | `positive` = import (Deye) or `negative` = import (SolarEdge) |
| `shutdown_soc` | `20` | Battery shutdown SOC percentage |
| `battery_capacity` | `5120` | Battery capacity in Wh |
| `solar2` | | Second MPPT solar power sensor (optional) |
| `pv_voltage2` | | Second MPPT PV voltage sensor (optional) |
| `weather_temp` | | Temperature sensor for weather display |
| `weather_humidity` | | Humidity sensor for weather display |
| `price_sensor` | | Electricity price sensor — shows current price with the sensor's own unit (optional) |
| `extra{1,2,3}_power` | | Power sensor for each extra-consumer node (optional; node hidden when empty) |
| `extra{1,2,3}_name` | | Custom label for each extra-consumer node (falls back to the icon's name) |
| `extra{1,2,3}_icon` | `appliance` / `heatpump` / `garage` | Icon per node: `appliance`, `heatpump`, `garage`, `generic` |

## Extra consumption nodes & energy price

Set in YAML (not exposed in the visual editor yet).

### Extra consumption nodes
Up to three extra loads branch off the home node. Each appears only when its `*_power` entity is set.

| Option | Description |
| --- | --- |
| `extra1_power`, `extra2_power`, `extra3_power` | Power sensor for the extra load (required to show the node) |
| `extra1_name`, `extra2_name`, `extra3_name` | Optional label (falls back to the icon's default name) |
| `extra1_icon`, `extra2_icon`, `extra3_icon` | Icon type — `appliance`, `heatpump`, or `garage` (defaults: 1 = appliance, 2 = heatpump, 3 = garage) |

Shorthand aliases also work and map to the three slots: `appliance_power` → extra1, `heatpump_power` → extra2, `garage_power` → extra3 (each with a matching `*_name`).

### Energy price
| Option | Description |
| --- | --- |
| `price_sensor` | Sensor holding the current energy price; shown with a price icon |
| `import_cost`, `export_cost` | Import cost / export earnings rates for the daily cost overlay |

### Polarity Guide

**Battery power:**
- `negative` = charging: Deye, Sunsynk, Growatt
- `positive` = charging: Huawei, Fronius, SolarEdge, Victron, Solis

**Grid power:**
- `positive` = importing: Deye, Sunsynk, Huawei, Fronius, Growatt, Victron, Solis
- `negative` = importing: SolarEdge

### Inverter LEDs

The 3 LEDs on the inverter icon reflect active power flows:

| LED | Color | Condition |
|-----|-------|-----------|
| 1st | Green | Solar producing (>10 W) |
| 2nd | Orange | Battery discharging (>10 W) |
| 3rd | Red | Grid importing (>10 W) |

LEDs blink when active and remain dim when inactive.

Full history: [CHANGELOG.md](CHANGELOG.md)

## Credits

Designed and built by [@BTNBx](https://github.com/BTNBx).

## License

Licensed under MIT. See [LICENSE](LICENSE) for details.
