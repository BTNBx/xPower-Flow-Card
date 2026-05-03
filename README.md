# ⚡ xPower Flow Card

A modern, futuristic power flow card for **solar hybrid inverters** in Home Assistant.

Built from scratch with solid SVG icons, animated dot-flow lines, smooth 24h sparkline charts, battery runtime estimation, and a dark glassmorphism aesthetic.

![xPower Flow Card](screenshots/card.png)

## Features

- **Flat modern icons** — solid sun, transmission tower, house, battery with pole
- **Animated dot flow** — speed proportional to power (more watts = faster dots)
- **Color-coded flows** — green for charging/exporting, red for importing, purple for discharging
- **Battery runtime** — estimated time to shutdown SOC with ETA
- **Battery temperature & voltage** — displayed alongside the battery icon
- **24h sparkline charts** — smooth Catmull-Rom spline area charts for Grid, Solar, and Home
- **Autarky pill** — color changes based on self-sufficiency level (green/orange/red)
- **Daily totals** — import/export arrows with kWh values
- **Trend arrows** — ▴ rising, ▾ falling, ▸ stable
- **Grid status dot** — green online, red offline
- **Visual editor** — configure all entities through the UI
- **Multi-language** — Portuguese (pt) and English (en)

## Installation

### HACS (Recommended)

1. Open HACS → Frontend → **⋮** → Custom repositories
2. Add `https://github.com/BTNBx/xpower-flow-card` as **Dashboard**
3. Search for "xPower Flow Card" and install
4. Refresh your browser (Ctrl+Shift+R)

### Manual

1. Download `xpower-flow-card.js` from the [latest release](https://github.com/BTNBx/xpower-flow-card/releases)
2. Copy to `/config/www/xpower-flow-card.js`
3. Add resource in **Settings → Dashboards → ⋮ → Resources**:
   - URL: `/local/xpower-flow-card.js`
   - Type: JavaScript Module
4. Refresh your browser

## Configuration

### Visual Editor

Add the card via the UI and use the built-in visual editor to configure all entities, language, and options.

![Editor](screenshots/editor.png)

### YAML

```yaml
type: custom:xpower-flow-card
language: pt
inverter_name: DEYE 6K
shutdown_soc: 20
battery_capacity: 5120
solar: sensor.deye_pv1_power
battery: sensor.deye_battery_power
soc: sensor.deye_battery
grid: sensor.deye_external_ct1_power
load: sensor.deye_load_l1_power
grid_voltage: sensor.deye_grid_l1_voltage
battery_voltage: sensor.deye_battery_voltage
pv_voltage: sensor.deye_pv1_voltage
temperature: sensor.deye_temperature
battery_temperature: sensor.deye_battery_temperature
frequency: sensor.deye_output_frequency
grid_status: binary_sensor.deye_grid
daily_solar: sensor.deye_today_production
daily_import: sensor.deye_today_energy_import
daily_export: sensor.deye_today_energy_export
daily_load: sensor.deye_today_load_consumption
daily_charge: sensor.deye_today_battery_charge
daily_discharge: sensor.deye_today_battery_discharge
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `language` | `pt` | Card language (`pt` or `en`) |
| `inverter_name` | `DEYE 6K` | Display name for the inverter |
| `shutdown_soc` | `20` | Battery shutdown SOC percentage |
| `battery_capacity` | `5120` | Battery capacity in Wh |

### Entity Defaults

All entities default to `sensor.deye_*` naming convention. Change them in the visual editor or YAML to match your setup.

## Battery Runtime

When the battery is discharging, the card shows estimated runtime:

![Runtime](screenshots/runtime.png)

- Time remaining until shutdown SOC
- ETA (clock time when battery reaches minimum)
- Based on current discharge rate

## Battery Conventions

This card follows the **Deye inverter convention**:

- `battery_power` **negative** = charging, **positive** = discharging
- `grid_power` **positive** = importing, **negative** = exporting

## Compatibility

- Home Assistant 2024.1+
- **Deye** hybrid inverters (SUN-5K, SUN-6K, SUN-8K, SUN-10K, SUN-12K)
- **Sunsynk** hybrid inverters
- **Sol-Ark** inverters
- Any other inverter — just map the correct sensor entities
- Tested with `solarman`, `deye_inverter`, and `sunsynk` integrations

## Credits

Designed and built by [@BTNBx](https://github.com/BTNBx).

Inspired by [sunsynk-power-flow-card](https://github.com/slipx06/sunsynk-power-flow-card).

## License

MIT
