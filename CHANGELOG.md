v1.3.28
   - Auto power-unit detection. Power sensors reporting kW/MW are now
     converted to W automatically (`power_unit: auto|W|kW`, default `auto`).
     Fixes dull/inactive-looking nodes and frozen flow animations on
     inverters that report power in kilowatts (e.g. Sigenergy).
   - Performance: cached element lookups.** Shadow-DOM element references
     are now cached instead of re-queried on every update (~100
     `getElementById` calls removed per tick). Most noticeable on always-on
     panels and dashboards running several cards at once.
v1.3.27
   - Autarky ring: slices now glide when the mix changes and the centre %
     counts up/down like the power values (both honour reduced motion).
   - Home flow bands use a fixed order (solar, battery, grid).
v1.3.26
   - Extra consumption nodes: appliances, garage, heat pump, and a spare
     "extra" node — each with its own power entity, icon, label, and flow
     to the home.
   - Energy price display with per-source price icons.
   - Click a node to open its Home Assistant more-info dialog.
   - Swedish (sv) translation added.
   - Thanks to @Cm0n89 for this contribution.
v1.3.25
   - Autarky mini-ring now split by source feeding the home: green = solar,
     amber = battery, red = grid. Ring always fills to 100%; centre % stays
     self-sufficiency (solar + battery share).
   - Inverter->home flow line now split into the same source bands, ordered
     smallest share (at inverter) to largest (at home); same pulse animation.
v1.3.23
   - Fix: grid-export flow phase — resync compared 'fl' but the class is 'fL',
     so the -T/2 outlet delay never applied while exporting. Corrected to 'fL'.
   - Solar node (single MPPT): daily kWh and PV voltage enlarged to match the
     grid node (13px / 11px) and nudged right (x 314 -> 330) to clear the sun.
v1.3.22
   - Autarky badge redesigned as a circular mini-ring (replaces the corner
     pill): green→lime progress arc, centered %, leaf glyph below, and the
     "Autossuficiência" label hidden — revealed on hover (desktop) or tap
     (mobile, 3s). Level colors kept (amber ≥50, orange ≥25, red <25); ≥90 glow.
v1.3.21
   - Fix: 24h sparklines floated above the panel bottom when header text
     wrapped (narrow layouts equalize panel heights); .sb svg margin-top
     4px -> auto pins each chart to the bottom of its panel.
v1.3.20
   - Solar day ring: 270° arc (r=36) around the sun icon, sunrise→sunset
     progress with amber gradient + position dot (opacity pulse only).
     Sunrise/sunset times at the arc ends. Uses sun.sun (config: sun_entity),
     hidden below horizon. Editor field added (8 languages).
   - PV1/PV2 side info: centered columns (title / power / voltage) with
     amber inward arrows outside the values. Single-MPPT keeps daily kWh right.
   - SOLAR label y -2 → -10; viewBox top 0 → -8 (dot clearance at solar noon).
v1.3.19
    Visual:
        - Main SVG viewBox height 487 -> 470: kills the dead band under the battery node (content ends ~463).
          Scales with width, so the phone gap shrinks proportionally. Compact mode unaffected — nothing sits
          below y=470. Also v1.4.7 gap fix used mm by mistake (4mm ~ 15px); now 4px.
v1.3.18
    Animation:
        - -T/2 outlet delay now applied to ALL flows leaving the inverter, not just Home:
          battery while charging (fd) and grid while exporting (fl). Discharge/import stay inlet-phased.
v1.3.17
    Animation:
        - True pass-through relay: Home outlet delayed -T/2 so its pulse departs the inverter the instant
          the inlet pulse front arrives (was: departed only after inlet fully drained). Home -> EV keeps
          zero delay, which now chains exactly off the pulse arriving at Home.
v1.3.16
    Fixes:
        - Dual-color SOC numbers invisible on iOS (WebKit ignores clip-path on SVG <text>, layers cancel out).
          Replaced text clip-paths with nested <svg> viewport cropping — battery + EV pill. Desktop unchanged.
v1.3.15
    Visual:
        - Gap between battery node and sparklines reduced 16px -> 8px
v1.3.14
    Visual:
        - Power values normalized to ~15px from each icon's visual edge (solar 82->81, grid 268->265)
v1.3.13
    Features:
        - New option `grid_threshold` (W, default 0): grid readings below it count as 0 —
          value dims, flow stops, icon goes inactive, autarky unaffected by standby draw
v1.3.12
    Visual:
        - Removed green pulse on the battery fill while charging (dimming made the number hard to read);
          solid green fill + bolt remain
v1.3.11
    Fixes:
        - Battery no longer shows green charging state at 100% SOC (residual standby draw kept it green)
v1.3.10
    Fixes:
        - Battery node alignment: icon group now centers on the pill body (values below no longer look shifted right)
        - Battery power/daily/runtime rows moved up 8px — gap to icon now matches the Home node
v1.3.9
    Fixes:
        - Flows/LEDs frozen when the OS has "reduce motion" enabled — v1.4.0 honored it unconditionally.
          Now gated by new config `animations`: 'auto' (default, follow OS) or 'always' (ignore OS).
          Applied via :host(.rm) class instead of a hard @media rule; tween respects the same setting.
v1.3.8
    Features:
        - Editor: one-click entity auto-detection (HA Energy Dashboard prefs + power-sensor heuristics)
        - Editor: live entity validation — unknown entity ids get red border + warning
        - Editor: field labels translated in all 8 languages
        - EV SOC displayed as a mini iOS pill (matches battery, green while charging)
    Visual:
        - Smooth count-up tween on all main power values (600ms, cubic ease-out)
        - Sparkline areas now use vertical gradient fills
    Accessibility:
        - prefers-reduced-motion honored: all animations off, values update instantly
        - prefers-color-scheme fallback for theme auto-detection when HA theme info is absent
v1.3.7
    Visual:
        - Battery pill height reduced 20 -> 17, number 15 -> 13.5
        - iOS dual-color number: part covered by the fill is dark, uncovered part inverts to the fill color
          (two clipped text layers synced to the level width)
v1.3.6
    Visual:
        - Battery number enlarged 13 -> 15
v1.3.5
    Visual:
        - iOS charging state: white number + white bolt inside the green pill (number shifts left to fit bolt)
v1.3.4
    Fixes:
        - Battery number enlarged (10.5 -> 13) and truly centered — dominant-baseline dropped (Safari/iOS
          renders it inconsistently), replaced with fixed baseline offset
v1.3.3
    Fixes:
        - Battery nub moved flush against the pill (was 2px gap)
v1.3.2
    Visual:
        - Battery icon now true iOS style: solid pill, level fill clipped by rounded shape, plain number (no %)
        - Theme-aware: white fill/dark number on dark theme, inverted on light; state colors green/orange/red kept
v1.3.1
    Visual:
        - EV icon replaced with Tesla-style fastback silhouette (single smooth body curve, flush wheels)
v1.3.0
    Animation:
        - Relay-synced flows: all lines share one duration and phase — pulses arrive at the inverter,
          and only then does the pulse depart toward Home (Home -> EV chained the same way)
        - Inlet 0.75x speed factor removed (equal duration required for phase sync)
        - All flow animations restart in the same frame on any direction/speed change (phase lock)
v1.2.9
    Fixes:
        - Battery node: removed vertical gap between power value and daily charge/discharge row (leftover from removed SOC row)
v1.2.8
    Visual:
        - Battery SOC color states: fill + inner % text turn orange at shutdown_soc+15, red at shutdown_soc
        - Charging keeps green fill with white text
v1.2.7
    Visual:
        - Battery icon redesigned iPhone-style: SOC percentage rendered inside the icon over the fill level
        - Icon enlarged (scale 1.70 -> 2.05); standalone SOC text row removed; daily/runtime rows moved up
v1.2.6
    Features:
        - EV charging node (bottom-right, below Home): car icon, charge power, optional SOC + daily energy
        - New optional entities: ev_power, ev_soc, daily_ev (editor + YAML); node hidden when not configured
        - Animated Home -> EV flow (green), blinking bolt while charging; click opens more-info
v1.2.5
    Performance:
        - hass setter now diffs configured entity states — DOM update skipped when nothing relevant changed
        - Updates + history polling paused while tab hidden; instant refresh on return (visibilitychange)
    Fixes:
        - Sparklines: history bucketed by timestamp into 48 uniform 30-min slots — fixes time-axis distortion
          and wrong tooltip times caused by significant_changes_only irregular sampling
        - Editor: identical config echo from HA no longer re-renders (input focus preserved)
        - Autarky >=90% glow implemented via SVG filter (previous CSS box-shadow was dead code on SVG)
    Features:
        - Battery runtime: charging now shows time-to-100% ETA (mirrors discharge estimate)
        - getGridOptions() for HA sections view sizing
v1.2.4
    Fixes:
        - Dual-MPPT crash: removed dead branch referencing dS before declaration (ReferenceError blanked the card)
        - Autarky badge label now translated (was hard-coded PT)
        - Build: outputs to dist/ (no longer overwrites source); release workflow uses npm install + uploads dist/ artifact
    Changed:
        - inverter_name HTML-escaped before SVG injection
        - hass-more-info dispatched as CustomEvent
            ──────────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════
    v1.2.3
   Fixes:
   - Solis polarity: bat_polarity changed to 'negative' (modbus reports charging as positive,
     same convention as Deye/Sunsynk — no inversion needed)
   - LCD inverter display: now shows load power (home consumption) instead of sum of all flows
   Features:
   v1.2.2:
   - Fix: PV daily/voltage text spacing from sun icon
   - Dual MPPT layout: PV1 left of sun (▸ arrow), PV2 right (◂ arrow),
     each with own voltage below; symmetrical layout
   v1.2.1:
   - Fix: PV1/PV2 + voltage text overlapped sun icon (CSS .vd text-anchor:middle
     overrides SVG presentation attribute; now inline style)
   - Solis/modbus: optional split battery_charge + battery_discharge sensors
     (both positive); card computes discharge-charge, bypasses polarity flag
   - Three-phase grid voltage: optional grid_voltage_l2/l3, shown as L1/L2/L3 V
   - Victron dual MPPT: added pv1_power + pv2_power entity fields in preset;
     Solar node shows per-MPPT power breakdown when both sensors configured
   Visual:
   - Sub-labels font sizes increased: .vc 9.5px→11px, .vd 12px→13px, .vc battery 9.5px→11px
   ════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
    v1.2.0
   Visual:
   - Autarky badge moved to top-right corner
   - Badge size reduced 15% (55x40 -> 47x34)
   - Badge green softened — border/fill use low-alpha rgba instead of solid #66BB6A;
     status threshold colors (>=80/50/25%) also toned down
   - Added 8mm spacing between battery data and sparklines row
   Animation:
   - Inlet flows (solar/grid/battery -> inverter) run at 75% of base speed — faster
   - Outlet flow (inverter -> home) runs at base speed — slower
   - Visual effect of energy accumulating at the inverter before flowing out to home
   CSS Custom Properties:
   - --xpf-flow-width  flow line stroke width (default: 3)
   - --xpf-dash-size   dash segment size (default: 100; low value e.g. 8 = dot effect)
