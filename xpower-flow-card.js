// xPower Flow Card — Modern power flow card for solar hybrid inverters
// Copyright (C) 2025 BTNBx — MIT License
const V='1.3.16';

/* ═══════════════════════════════════════
   CHANGELOG
   ═══════════════════════════════════════
v1.4.0
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
v1.3.23
    Visual:
        - Battery pill height reduced 20 -> 17, number 15 -> 13.5
        - iOS dual-color number: part covered by the fill is dark, uncovered part inverts to the fill color
          (two clipped text layers synced to the level width)
v1.3.22
    Visual:
        - Battery number enlarged 13 -> 15
v1.3.21
    Visual:
        - iOS charging state: white number + white bolt inside the green pill (number shifts left to fit bolt)
v1.3.20
    Fixes:
        - Battery number enlarged (10.5 -> 13) and truly centered — dominant-baseline dropped (Safari/iOS
          renders it inconsistently), replaced with fixed baseline offset
v1.3.19
    Fixes:
        - Battery nub moved flush against the pill (was 2px gap)
v1.3.18
    Visual:
        - Battery icon now true iOS style: solid pill, level fill clipped by rounded shape, plain number (no %)
        - Theme-aware: white fill/dark number on dark theme, inverted on light; state colors green/orange/red kept
v1.3.17
    Visual:
        - EV icon replaced with Tesla-style fastback silhouette (single smooth body curve, flush wheels)
v1.3.16
    Animation:
        - Relay-synced flows: all lines share one duration and phase — pulses arrive at the inverter,
          and only then does the pulse depart toward Home (Home -> EV chained the same way)
        - Inlet 0.75x speed factor removed (equal duration required for phase sync)
        - All flow animations restart in the same frame on any direction/speed change (phase lock)
v1.3.15
    Fixes:
        - Battery node: removed vertical gap between power value and daily charge/discharge row (leftover from removed SOC row)
v1.3.14
    Visual:
        - Battery SOC color states: fill + inner % text turn orange at shutdown_soc+15, red at shutdown_soc
        - Charging keeps green fill with white text
v1.3.13
    Visual:
        - Battery icon redesigned iPhone-style: SOC percentage rendered inside the icon over the fill level
        - Icon enlarged (scale 1.70 -> 2.05); standalone SOC text row removed; daily/runtime rows moved up
v1.3.12
    Features:
        - EV charging node (bottom-right, below Home): car icon, charge power, optional SOC + daily energy
        - New optional entities: ev_power, ev_soc, daily_ev (editor + YAML); node hidden when not configured
        - Animated Home -> EV flow (green), blinking bolt while charging; click opens more-info
v1.3.11
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
v1.3.10
    Fixes:
        - Dual-MPPT crash: removed dead branch referencing dS before declaration (ReferenceError blanked the card)
        - Autarky badge label now translated (was hard-coded PT)
        - Build: outputs to dist/ (no longer overwrites source); release workflow uses npm install + uploads dist/ artifact
    Changed:
        - inverter_name HTML-escaped before SVG injection
        - hass-more-info dispatched as CustomEvent
            ──────────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════
    v1.3.7
   Fixes:
   - Solis polarity: bat_polarity changed to 'negative' (modbus reports charging as positive,
     same convention as Deye/Sunsynk — no inversion needed)
   - LCD inverter display: now shows load power (home consumption) instead of sum of all flows
   Features:
   v1.3.9:
   - Fix: PV daily/voltage text spacing from sun icon
   - Dual MPPT layout: PV1 left of sun (▸ arrow), PV2 right (◂ arrow),
     each with own voltage below; symmetrical layout
   v1.3.8:
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
    v1.3.5
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
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   xPower Flow Card — i18n
   ═══════════════════════════════════════ */
const LANG={
  pt:{solar:'SOLAR',grid:'REDE',load:'CASA',battery:'BATERIA',ev:'CARRO',inverter:'Inversor',
      autarky:'Autossufici\u00EAncia',runtime_to:'at\u00E9',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'CASA (24h)',grid24:'REDE (24h)',bat24:'BATERIA (24h)',
      unavailable:'--',autodetect:'Auto-detetar',invalid:'entidade n\u00E3o existe',
      editor_title:'xPower Flow Card',editor_lang:'Idioma',editor_entities:'Entidades',
      editor_options:'Op\u00E7\u00F5es',editor_soc:'SOC M\u00EDnimo (%)',
      editor_capacity:'Capacidade Bateria (Wh)',editor_inverter_name:'Nome Inversor',
      editor_preset:'Marca / Preset',editor_polarity:'Polaridade',
      editor_bat_pol:'Bateria: negativo =',editor_grid_pol:'Rede: positivo =',
      charging:'carga',discharging:'descarga',importing:'importar',exporting:'exportar'},
  en:{solar:'SOLAR',grid:'GRID',load:'HOME',battery:'BATTERY',ev:'EV',inverter:'Inverter',
      autarky:'Self-sufficiency',runtime_to:'to',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HOME (24h)',grid24:'GRID (24h)',bat24:'BATTERY (24h)',
      unavailable:'--',autodetect:'Auto-detect',invalid:'entity not found',
      editor_title:'xPower Flow Card',editor_lang:'Language',editor_entities:'Entities',
      editor_options:'Options',editor_soc:'Shutdown SOC (%)',
      editor_capacity:'Battery Capacity (Wh)',editor_inverter_name:'Inverter Name',
      editor_preset:'Brand / Preset',editor_polarity:'Polarity',
      editor_bat_pol:'Battery: negative =',editor_grid_pol:'Grid: positive =',
      charging:'charging',discharging:'discharging',importing:'import',exporting:'export'},
  de:{solar:'SOLAR',grid:'NETZ',load:'HAUS',battery:'BATTERIE',ev:'E-AUTO',inverter:'Wechselrichter',
      autarky:'Autarkie',runtime_to:'bis',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HAUS (24h)',grid24:'NETZ (24h)',bat24:'BATTERIE (24h)',
      unavailable:'--',autodetect:'Auto-Erkennung',invalid:'Entit\u00E4t existiert nicht',
      editor_title:'xPower Flow Card',editor_lang:'Sprache',editor_entities:'Entit\u00E4ten',
      editor_options:'Optionen',editor_soc:'Abschalt-SOC (%)',
      editor_capacity:'Batteriekapazit\u00E4t (Wh)',editor_inverter_name:'Wechselrichter Name',
      editor_preset:'Marke / Vorlage',editor_polarity:'Polarit\u00E4t',
      editor_bat_pol:'Batterie: negativ =',editor_grid_pol:'Netz: positiv =',
      charging:'Laden',discharging:'Entladen',importing:'Bezug',exporting:'Einspeisung'},
  fr:{solar:'SOLAIRE',grid:'R\u00C9SEAU',load:'MAISON',battery:'BATTERIE',ev:'VOITURE',inverter:'Onduleur',
      autarky:'Autosuffisance',runtime_to:'jusqu\u0027\u00E0',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAIRE (24h)',load24:'MAISON (24h)',grid24:'R\u00C9SEAU (24h)',bat24:'BATTERIE (24h)',
      unavailable:'--',autodetect:'D\u00E9tection auto',invalid:'entit\u00E9 introuvable',
      editor_title:'xPower Flow Card',editor_lang:'Langue',editor_entities:'Entit\u00E9s',
      editor_options:'Options',editor_soc:'SOC Minimum (%)',
      editor_capacity:'Capacit\u00E9 Batterie (Wh)',editor_inverter_name:'Nom Onduleur',
      editor_preset:'Marque / Pr\u00E9r\u00E9glage',editor_polarity:'Polarit\u00E9',
      editor_bat_pol:'Batterie: n\u00E9gatif =',editor_grid_pol:'R\u00E9seau: positif =',
      charging:'charge',discharging:'d\u00E9charge',importing:'importation',exporting:'exportation'},
  es:{solar:'SOLAR',grid:'RED',load:'HOGAR',battery:'BATER\u00CDAS',ev:'COCHE',inverter:'Inversor',
      autarky:'Autosuficiencia',runtime_to:'hasta',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HOGAR (24h)',grid24:'RED (24h)',bat24:'BATERÍA (24h)',
      unavailable:'--',autodetect:'Autodetectar',invalid:'entidad no existe',
      editor_title:'xPower Flow Card',editor_lang:'Idioma',editor_entities:'Entidades',
      editor_options:'Opciones',editor_soc:'SOC M\u00EDnimo (%)',
      editor_capacity:'Capacidad Bater\u00EDa (Wh)',editor_inverter_name:'Nombre Inversor',
      editor_preset:'Marca / Preset',editor_polarity:'Polaridad',
      editor_bat_pol:'Bater\u00EDa: negativo =',editor_grid_pol:'Red: positivo =',
      charging:'carga',discharging:'descarga',importing:'importaci\u00F3n',exporting:'exportaci\u00F3n'},
  it:{solar:'SOLARE',grid:'RETE',load:'CASA',battery:'BATTERIA',ev:'AUTO',inverter:'Inverter',
      autarky:'Autosufficienza',runtime_to:'fino a',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLARE (24h)',load24:'CASA (24h)',grid24:'RETE (24h)',bat24:'BATTERIA (24h)',
      unavailable:'--',autodetect:'Rilevamento auto',invalid:'entit\u00E0 inesistente',
      editor_title:'xPower Flow Card',editor_lang:'Lingua',editor_entities:'Entit\u00E0',
      editor_options:'Opzioni',editor_soc:'SOC Minimo (%)',
      editor_capacity:'Capacit\u00E0 Batteria (Wh)',editor_inverter_name:'Nome Inverter',
      editor_preset:'Marca / Preset',editor_polarity:'Polarit\u00E0',
      editor_bat_pol:'Batteria: negativo =',editor_grid_pol:'Rete: positivo =',
      charging:'carica',discharging:'scarica',importing:'importazione',exporting:'esportazione'},
  nl:{solar:'ZONNE',grid:'NET',load:'HUIS',battery:'BATTERIJ',ev:'EV',inverter:'Omvormer',
      autarky:'Zelfvoorziening',runtime_to:'tot',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'ZONNE (24h)',load24:'HUIS (24h)',grid24:'NET (24h)',bat24:'BATTERIJ (24h)',
      unavailable:'--',autodetect:'Auto-detectie',invalid:'entiteit bestaat niet',
      editor_title:'xPower Flow Card',editor_lang:'Taal',editor_entities:'Entiteiten',
      editor_options:'Opties',editor_soc:'Uitschakel-SOC (%)',
      editor_capacity:'Batterijcapaciteit (Wh)',editor_inverter_name:'Omvormer Naam',
      editor_preset:'Merk / Preset',editor_polarity:'Polariteit',
      editor_bat_pol:'Batterij: negatief =',editor_grid_pol:'Net: positief =',
      charging:'laden',discharging:'ontladen',importing:'import',exporting:'export'},
  pl:{solar:'SOLAR',grid:'SIE\u0106',load:'DOM',battery:'BATERIA',ev:'EV',inverter:'Falownik',
      autarky:'Samowystarczalno\u015B\u0107',runtime_to:'do',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'DOM (24h)',grid24:'SIE\u0106 (24h)',bat24:'BATERIA (24h)',
      unavailable:'--',autodetect:'Autowykrywanie',invalid:'encja nie istnieje',
      editor_title:'xPower Flow Card',editor_lang:'J\u0119zyk',editor_entities:'Encje',
      editor_options:'Opcje',editor_soc:'Min. SOC (%)',
      editor_capacity:'Pojemno\u015B\u0107 baterii (Wh)',editor_inverter_name:'Nazwa falownika',
      editor_preset:'Marka / Preset',editor_polarity:'Polaryzacja',
      editor_bat_pol:'Bateria: ujemny =',editor_grid_pol:'Sie\u0107: dodatni =',
      charging:'\u0142adowanie',discharging:'roz\u0142adowanie',importing:'pobieranie',exporting:'oddawanie'}
};

const PRESETS={
  deye:{
    label:'Deye (Solarman)',inverter_name:'DEYE',
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'sensor.deye_pv1_power',battery:'sensor.deye_battery_power',soc:'sensor.deye_battery',
       grid:'sensor.deye_external_ct1_power',load:'sensor.deye_load_l1_power',
       grid_voltage:'sensor.deye_grid_l1_voltage',battery_voltage:'sensor.deye_battery_voltage',
       pv_voltage:'sensor.deye_pv1_voltage',temperature:'sensor.deye_temperature',
       frequency:'sensor.deye_output_frequency',grid_status:'binary_sensor.deye_grid',
       daily_solar:'sensor.deye_today_production',daily_import:'sensor.deye_today_energy_import',
       daily_export:'sensor.deye_today_energy_export',daily_load:'sensor.deye_today_load_consumption',
       daily_charge:'sensor.deye_today_battery_charge',daily_discharge:'sensor.deye_today_battery_discharge',
       battery_temperature:'sensor.deye_battery_temperature'}
  },
  sunsynk:{
    label:'Sunsynk',inverter_name:'SUNSYNK',
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'sensor.sunsynk_pv1_power',battery:'sensor.sunsynk_battery_power',soc:'sensor.sunsynk_battery_soc',
       grid:'sensor.sunsynk_grid_power',load:'sensor.sunsynk_essential_power',
       grid_voltage:'sensor.sunsynk_grid_voltage',battery_voltage:'sensor.sunsynk_battery_voltage',
       pv_voltage:'sensor.sunsynk_pv1_voltage',temperature:'sensor.sunsynk_inverter_temperature',
       frequency:'sensor.sunsynk_grid_frequency',grid_status:'binary_sensor.sunsynk_grid_connected',
       daily_solar:'sensor.sunsynk_day_pv_energy',daily_import:'sensor.sunsynk_day_grid_import',
       daily_export:'sensor.sunsynk_day_grid_export',daily_load:'sensor.sunsynk_day_load_energy',
       daily_charge:'sensor.sunsynk_day_battery_charge',daily_discharge:'sensor.sunsynk_day_battery_discharge',
       battery_temperature:'sensor.sunsynk_battery_temperature'}
  },
  huawei:{
    label:'Huawei (FusionSolar)',inverter_name:'HUAWEI',
    bat_polarity:'positive',grid_polarity:'positive',
    e:{solar:'sensor.inverter_input_power',battery:'sensor.battery_charge_discharge_power',
       soc:'sensor.battery_state_of_capacity',grid:'sensor.power_meter_active_power',
       load:'sensor.house_consumption_power',grid_voltage:'sensor.grid_voltage',
       battery_voltage:'sensor.battery_voltage',pv_voltage:'sensor.pv_voltage',
       temperature:'sensor.inverter_internal_temperature',frequency:'sensor.grid_frequency',
       grid_status:'',daily_solar:'sensor.daily_yield',daily_import:'sensor.daily_grid_import',
       daily_export:'sensor.daily_grid_export',daily_load:'sensor.daily_house_consumption',
       daily_charge:'sensor.daily_battery_charge',daily_discharge:'sensor.daily_battery_discharge',
       battery_temperature:'sensor.battery_temperature'}
  },
  fronius:{
    label:'Fronius (Gen24)',inverter_name:'FRONIUS',
    bat_polarity:'positive',grid_polarity:'positive',
    e:{solar:'sensor.fronius_power_photovoltaics',battery:'sensor.fronius_power_battery',
       soc:'sensor.fronius_battery_soc',grid:'sensor.fronius_power_grid',
       load:'sensor.fronius_power_load',grid_voltage:'sensor.fronius_voltage_ac',
       battery_voltage:'sensor.fronius_voltage_battery',pv_voltage:'sensor.fronius_voltage_dc',
       temperature:'sensor.fronius_temperature',frequency:'sensor.fronius_frequency',
       grid_status:'',daily_solar:'sensor.fronius_energy_day',daily_import:'',
       daily_export:'',daily_load:'',daily_charge:'',daily_discharge:'',
       battery_temperature:''}
  },
  growatt:{
    label:'Growatt',inverter_name:'GROWATT',
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'sensor.growatt_pv_power',battery:'sensor.growatt_battery_power',
       soc:'sensor.growatt_battery_soc',grid:'sensor.growatt_grid_power',
       load:'sensor.growatt_load_power',grid_voltage:'sensor.growatt_grid_voltage',
       battery_voltage:'sensor.growatt_battery_voltage',pv_voltage:'sensor.growatt_pv_voltage',
       temperature:'sensor.growatt_inverter_temperature',frequency:'sensor.growatt_grid_frequency',
       grid_status:'',daily_solar:'sensor.growatt_today_generation',daily_import:'sensor.growatt_today_import',
       daily_export:'sensor.growatt_today_export',daily_load:'sensor.growatt_today_load',
       daily_charge:'sensor.growatt_today_charge',daily_discharge:'sensor.growatt_today_discharge',
       battery_temperature:''}
  },
  victron:{
    label:'Victron (Venus OS)',inverter_name:'VICTRON',
    bat_polarity:'positive',grid_polarity:'positive',
    e:{solar:'sensor.pv_power',solar2:'',battery:'sensor.battery_power',soc:'sensor.battery_soc',
       grid:'sensor.grid_power',load:'sensor.ac_consumption',grid_voltage:'sensor.grid_voltage',
       battery_voltage:'sensor.battery_voltage',pv_voltage:'sensor.pv_voltage',pv_voltage2:'',
       temperature:'sensor.inverter_temperature',frequency:'sensor.grid_frequency',
       grid_status:'',daily_solar:'sensor.daily_solar_yield',daily_import:'sensor.daily_grid_import',
       daily_export:'sensor.daily_grid_export',daily_load:'sensor.daily_consumption',
       daily_charge:'sensor.daily_battery_charge',daily_discharge:'sensor.daily_battery_discharge',
       battery_temperature:'sensor.battery_temperature'}
  },
  solaredge:{
    label:'SolarEdge (Modbus)',inverter_name:'SOLAREDGE',
    bat_polarity:'positive',grid_polarity:'negative',
    e:{solar:'sensor.solaredge_dc_power',battery:'sensor.solaredge_storage_power',
       soc:'sensor.solaredge_storage_level',grid:'sensor.solaredge_m1_ac_power',
       load:'sensor.solaredge_ac_power',grid_voltage:'sensor.solaredge_m1_ac_voltage',
       battery_voltage:'sensor.solaredge_storage_voltage',pv_voltage:'sensor.solaredge_dc_voltage',
       temperature:'sensor.solaredge_temperature',frequency:'sensor.solaredge_m1_ac_frequency',
       grid_status:'',daily_solar:'sensor.solaredge_energy_today',daily_import:'',
       daily_export:'',daily_load:'',daily_charge:'',daily_discharge:'',
       battery_temperature:''}
  },
  solis:{
    label:'Solis (SolisCloud)',inverter_name:'SOLIS',
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'sensor.solis_pv_power',battery:'sensor.solis_battery_power',soc:'sensor.solis_battery_soc',
       grid:'sensor.solis_grid_power',load:'sensor.solis_house_load',grid_voltage:'sensor.solis_grid_voltage',
       battery_voltage:'sensor.solis_battery_voltage',pv_voltage:'sensor.solis_pv_voltage',
       temperature:'sensor.solis_inverter_temperature',frequency:'sensor.solis_grid_frequency',
       grid_status:'',daily_solar:'sensor.solis_today_energy_generation',daily_import:'sensor.solis_today_grid_import',
       daily_export:'sensor.solis_today_grid_export',daily_load:'sensor.solis_today_load_consumption',
       daily_charge:'sensor.solis_today_battery_charge',daily_discharge:'sensor.solis_today_battery_discharge',
       battery_temperature:'sensor.solis_battery_temperature'}
  },
  custom:{
    label:'Custom',inverter_name:'Inverter',
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'',battery:'',soc:'',grid:'',load:'',grid_voltage:'',battery_voltage:'',
       pv_voltage:'',temperature:'',frequency:'',grid_status:'',daily_solar:'',daily_import:'',
       daily_export:'',daily_load:'',daily_charge:'',daily_discharge:'',battery_temperature:''}
  }
};

const DEFAULTS={
  preset:'deye',
  ...PRESETS.deye.e,
  solar2:'',pv_voltage2:'',
  battery_charge:'',battery_discharge:'',
  grid_voltage_l2:'',grid_voltage_l3:'',
  bat_polarity:'negative',grid_polarity:'positive',
  shutdown_soc:20,battery_capacity:5120,language:'pt',
  inverter_name:'DEYE',
  weather_temp:'',weather_humidity:'',
  ev_power:'',ev_soc:'',daily_ev:'',
  import_cost:'',export_cost:'',
  compact:false,
  theme:'auto'
};

const ENTITY_FIELDS=[
  {key:'solar',label:'Solar Power (MPPT1)'},{key:'solar2',label:'Solar Power (MPPT2)'},
  {key:'battery',label:'Battery Power'},
  {key:'battery_charge',label:'Battery Charge Power (split, optional)'},
  {key:'battery_discharge',label:'Battery Discharge Power (split, optional)'},
  {key:'soc',label:'Battery SOC'},{key:'grid',label:'Grid Power'},
  {key:'load',label:'Load Power'},{key:'grid_voltage',label:'Grid Voltage (L1)'},
  {key:'grid_voltage_l2',label:'Grid Voltage L2 (optional)'},{key:'grid_voltage_l3',label:'Grid Voltage L3 (optional)'},
  {key:'battery_voltage',label:'Battery Voltage'},
  {key:'temperature',label:'Inverter Temp.'},{key:'battery_temperature',label:'Battery Temp.'},
  {key:'frequency',label:'Grid Frequency'},{key:'grid_status',label:'Grid Status'},
  {key:'pv_voltage',label:'PV Voltage (MPPT1)'},{key:'pv_voltage2',label:'PV Voltage (MPPT2)'},
  {key:'daily_solar',label:'Daily Solar'},{key:'daily_import',label:'Daily Import'},
  {key:'daily_export',label:'Daily Export'},{key:'daily_load',label:'Daily Load'},
  {key:'daily_charge',label:'Daily Charge'},{key:'daily_discharge',label:'Daily Discharge'},
  {key:'weather_temp',label:'Weather Temp.'},{key:'weather_humidity',label:'Weather Humidity'},
  {key:'ev_power',label:'EV Charger Power (optional)'},{key:'ev_soc',label:'EV SOC (optional)'},{key:'daily_ev',label:'Daily EV Energy (optional)'},
  {key:'import_cost',label:'Daily Import Cost'},{key:'export_cost',label:'Daily Export Earnings'}
];
const ENT_KEYS=ENTITY_FIELDS.map(f=>f.key);
const FLBL={solar:t=>t.ps+' (MPPT1)',solar2:t=>t.ps+' (MPPT2)',battery:t=>t.pb,battery_charge:t=>t.pbc+' '+t.sp,battery_discharge:t=>t.pbd+' '+t.sp,soc:t=>t.sc,grid:t=>t.pg,load:t=>t.pl,grid_voltage:t=>t.vg+' (L1)',grid_voltage_l2:t=>t.vg+' L2 '+t.op,grid_voltage_l3:t=>t.vg+' L3 '+t.op,battery_voltage:t=>t.vb,temperature:t=>t.ti,battery_temperature:t=>t.tb,frequency:t=>t.fq,grid_status:t=>t.gs,pv_voltage:t=>t.vp+' (MPPT1)',pv_voltage2:t=>t.vp+' (MPPT2)',daily_solar:t=>t.dso,daily_import:t=>t.dim,daily_export:t=>t.dex,daily_load:t=>t.dlo,daily_charge:t=>t.dch,daily_discharge:t=>t.ddi,weather_temp:t=>t.wt,weather_humidity:t=>t.wh,ev_power:t=>t.evp+' '+t.op,ev_soc:t=>t.evs+' '+t.op,daily_ev:t=>t.evd+' '+t.op,import_cost:t=>t.cim,export_cost:t=>t.cex};
const EDL={"pt":{"ps":"Pot\u00eancia Solar","pb":"Pot\u00eancia Bateria","pbc":"Pot\u00eancia Carga Bat.","pbd":"Pot\u00eancia Descarga Bat.","sc":"SOC Bateria","pg":"Pot\u00eancia Rede","pl":"Pot\u00eancia Consumo","vg":"Tens\u00e3o Rede","vb":"Tens\u00e3o Bateria","vp":"Tens\u00e3o PV","ti":"Temp. Inversor","tb":"Temp. Bateria","fq":"Frequ\u00eancia Rede","gs":"Estado Rede","dso":"Solar Di\u00e1rio","dim":"Importa\u00e7\u00e3o Di\u00e1ria","dex":"Exporta\u00e7\u00e3o Di\u00e1ria","dlo":"Consumo Di\u00e1rio","dch":"Carga Di\u00e1ria","ddi":"Descarga Di\u00e1ria","wt":"Temp. Exterior","wh":"Humidade","evp":"Pot\u00eancia Carregador EV","evs":"SOC EV","evd":"Energia EV Di\u00e1ria","cim":"Custo Importa\u00e7\u00e3o Di\u00e1rio","cex":"Ganhos Exporta\u00e7\u00e3o Di\u00e1rios","op":"(opcional)","sp":"(separado, opcional)"},"de":{"ps":"Solarleistung","pb":"Batterieleistung","pbc":"Ladeleistung Bat.","pbd":"Entladeleistung Bat.","sc":"Batterie-SOC","pg":"Netzleistung","pl":"Verbrauchsleistung","vg":"Netzspannung","vb":"Batteriespannung","vp":"PV-Spannung","ti":"WR-Temp.","tb":"Bat.-Temp.","fq":"Netzfrequenz","gs":"Netzstatus","dso":"Tagesertrag Solar","dim":"Tagesimport","dex":"Tagesexport","dlo":"Tagesverbrauch","dch":"Tagesladung","ddi":"Tagesentladung","wt":"Au\u00dfentemp.","wh":"Luftfeuchte","evp":"EV-Ladeleistung","evs":"EV-SOC","evd":"EV-Tagesenergie","cim":"T\u00e4gl. Importkosten","cex":"T\u00e4gl. Exporterl\u00f6s","op":"(optional)","sp":"(getrennt, optional)"},"fr":{"ps":"Puissance solaire","pb":"Puissance batterie","pbc":"Puissance charge bat.","pbd":"Puissance d\u00e9charge bat.","sc":"SOC batterie","pg":"Puissance r\u00e9seau","pl":"Puissance conso.","vg":"Tension r\u00e9seau","vb":"Tension batterie","vp":"Tension PV","ti":"Temp. onduleur","tb":"Temp. batterie","fq":"Fr\u00e9quence r\u00e9seau","gs":"\u00c9tat r\u00e9seau","dso":"Solaire journalier","dim":"Import journalier","dex":"Export journalier","dlo":"Conso. journali\u00e8re","dch":"Charge journali\u00e8re","ddi":"D\u00e9charge journali\u00e8re","wt":"Temp. ext.","wh":"Humidit\u00e9","evp":"Puissance chargeur VE","evs":"SOC VE","evd":"\u00c9nergie VE journali\u00e8re","cim":"Co\u00fbt import journalier","cex":"Gains export journaliers","op":"(optionnel)","sp":"(s\u00e9par\u00e9, optionnel)"},"es":{"ps":"Potencia solar","pb":"Potencia bater\u00eda","pbc":"Potencia carga bat.","pbd":"Potencia descarga bat.","sc":"SOC bater\u00eda","pg":"Potencia red","pl":"Potencia consumo","vg":"Tensi\u00f3n red","vb":"Tensi\u00f3n bater\u00eda","vp":"Tensi\u00f3n PV","ti":"Temp. inversor","tb":"Temp. bater\u00eda","fq":"Frecuencia red","gs":"Estado red","dso":"Solar diario","dim":"Importaci\u00f3n diaria","dex":"Exportaci\u00f3n diaria","dlo":"Consumo diario","dch":"Carga diaria","ddi":"Descarga diaria","wt":"Temp. exterior","wh":"Humedad","evp":"Potencia cargador VE","evs":"SOC VE","evd":"Energ\u00eda VE diaria","cim":"Coste importaci\u00f3n diario","cex":"Ganancias exportaci\u00f3n diarias","op":"(opcional)","sp":"(separado, opcional)"},"it":{"ps":"Potenza solare","pb":"Potenza batteria","pbc":"Potenza carica bat.","pbd":"Potenza scarica bat.","sc":"SOC batteria","pg":"Potenza rete","pl":"Potenza consumo","vg":"Tensione rete","vb":"Tensione batteria","vp":"Tensione PV","ti":"Temp. inverter","tb":"Temp. batteria","fq":"Frequenza rete","gs":"Stato rete","dso":"Solare giornaliero","dim":"Import giornaliero","dex":"Export giornaliero","dlo":"Consumo giornaliero","dch":"Carica giornaliera","ddi":"Scarica giornaliera","wt":"Temp. esterna","wh":"Umidit\u00e0","evp":"Potenza caricatore EV","evs":"SOC EV","evd":"Energia EV giornaliera","cim":"Costo import giornaliero","cex":"Guadagni export giornalieri","op":"(opzionale)","sp":"(separato, opzionale)"},"nl":{"ps":"Zonnevermogen","pb":"Batterijvermogen","pbc":"Laadvermogen bat.","pbd":"Ontlaadvermogen bat.","sc":"Batterij-SOC","pg":"Netvermogen","pl":"Verbruiksvermogen","vg":"Netspanning","vb":"Batterijspanning","vp":"PV-spanning","ti":"Omvormer temp.","tb":"Batterij temp.","fq":"Netfrequentie","gs":"Netstatus","dso":"Dagelijks zonne","dim":"Dagelijkse import","dex":"Dagelijkse export","dlo":"Dagelijks verbruik","dch":"Dagelijkse lading","ddi":"Dagelijkse ontlading","wt":"Buitentemp.","wh":"Vochtigheid","evp":"EV-laadvermogen","evs":"EV-SOC","evd":"Dagelijkse EV-energie","cim":"Dagelijkse importkosten","cex":"Dagelijkse exportopbrengst","op":"(optioneel)","sp":"(gescheiden, optioneel)"},"pl":{"ps":"Moc PV","pb":"Moc baterii","pbc":"Moc \u0142adowania bat.","pbd":"Moc roz\u0142adowania bat.","sc":"SOC baterii","pg":"Moc sieci","pl":"Moc obci\u0105\u017cenia","vg":"Napi\u0119cie sieci","vb":"Napi\u0119cie baterii","vp":"Napi\u0119cie PV","ti":"Temp. falownika","tb":"Temp. baterii","fq":"Cz\u0119stotliwo\u015b\u0107 sieci","gs":"Stan sieci","dso":"Dzienny solar","dim":"Dzienny import","dex":"Dzienny eksport","dlo":"Dzienne zu\u017cycie","dch":"Dzienne \u0142adowanie","ddi":"Dzienne roz\u0142adowanie","wt":"Temp. zewn.","wh":"Wilgotno\u015b\u0107","evp":"Moc \u0142adowarki EV","evs":"SOC EV","evd":"Dzienna energia EV","cim":"Dzienny koszt importu","cex":"Dzienny zysk z eksportu","op":"(opcjonalnie)","sp":"(osobno, opcjonalnie)"}};

const HIST_POINTS=48;
const HIST_INTERVAL=5*60*1000;
const RUNTIME_MIN_W=50;
const ANIM_MAX_W=6000;
const ANIM_MIN_SPD=1.5;
const ANIM_MAX_SPD=3.5;

class XPowerFlowCardEditor extends HTMLElement{
  constructor(){super();this._config={};this._hass=null;this._onchange=this._fire.bind(this);}
  _esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  setConfig(config){const merged={...DEFAULTS,...config};if(this._ready&&JSON.stringify(merged)===JSON.stringify(this._config))return;this._config=merged;this._render();this._ready=true;}
  set hass(hass){this._hass=hass;}
  disconnectedCallback(){const el=this.querySelector('.editor');if(el)el.removeEventListener('change',this._onchange);}

  _fire(e){
    if(!e.target.matches('input,select'))return;
    const cfg={...this._config};
    cfg.language=this.querySelector('#ed-lang').value;
    cfg.inverter_name=this.querySelector('#ed-inv').value;
    cfg.theme=this.querySelector('#ed-theme').value;
    cfg.compact=this.querySelector('#ed-compact').value==='true';
    cfg.bat_polarity=this.querySelector('#ed-bpol').value;
    cfg.grid_polarity=this.querySelector('#ed-gpol').value;
    const socVal=parseInt(this.querySelector('#ed-ssoc').value,10);
    cfg.shutdown_soc=isNaN(socVal)?20:socVal;
    const capVal=parseInt(this.querySelector('#ed-cap').value,10);
    cfg.battery_capacity=isNaN(capVal)?5120:capVal;
    const newPreset=this.querySelector('#ed-preset').value;
    if(newPreset!==cfg.preset&&PRESETS[newPreset]){
      const p=PRESETS[newPreset];
      Object.keys(p.e).forEach(k=>{cfg[k]=p.e[k];});
      cfg.bat_polarity=p.bat_polarity;
      cfg.grid_polarity=p.grid_polarity;
      cfg.inverter_name=p.inverter_name;
      cfg.preset=newPreset;
      this._config=cfg;
      this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:cfg},bubbles:true,composed:true}));
      this._render();
      return;
    }
    cfg.preset=newPreset;
    ENTITY_FIELDS.forEach(f=>{const v=this.querySelector('#ed-'+f.key);if(v){cfg[f.key]=v.value;const bad=v.value&&this._hass&&!this._hass.states[v.value];v.style.borderColor=bad?'#EF5350':'';}});
    this._config=cfg;
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:cfg},bubbles:true,composed:true}));
  }

  async _autoDetect(){
    if(!this._hass)return;
    const cfg={...this._config};const st=this._hass.states;
    try{
      const prefs=await this._hass.callWS({type:'energy/get_prefs'});
      for(const s of (prefs.energy_sources||[])){
        if(s.type==='solar'&&s.stat_energy_from&&st[s.stat_energy_from]&&!cfg.daily_solar)cfg.daily_solar=s.stat_energy_from;
        if(s.type==='grid'){
          const f=(s.flow_from||[])[0],t=(s.flow_to||[])[0];
          if(f&&f.stat_energy_from&&st[f.stat_energy_from]&&!cfg.daily_import)cfg.daily_import=f.stat_energy_from;
          if(t&&t.stat_energy_to&&st[t.stat_energy_to]&&!cfg.daily_export)cfg.daily_export=t.stat_energy_to;
        }
        if(s.type==='battery'){
          if(s.stat_energy_to&&st[s.stat_energy_to]&&!cfg.daily_charge)cfg.daily_charge=s.stat_energy_to;
          if(s.stat_energy_from&&st[s.stat_energy_from]&&!cfg.daily_discharge)cfg.daily_discharge=s.stat_energy_from;
        }
      }
    }catch(e){}
    const pow=Object.keys(st).filter(id=>id.startsWith('sensor.')&&st[id].attributes?.device_class==='power');
    const pick=re=>pow.find(id=>re.test(id))||'';
    if(!cfg.solar)cfg.solar=pick(/pv1?_power|solar_power|photovolta/);
    if(!cfg.battery&&!cfg.battery_charge)cfg.battery=pick(/battery_power|storage_power/);
    if(!cfg.grid)cfg.grid=pick(/grid_power|ct1?_power|meter_active_power/);
    if(!cfg.load)cfg.load=pick(/load_power|house_consumption|essential_power|ac_consumption/);
    if(!cfg.soc){const socs=Object.keys(st).filter(id=>id.startsWith('sensor.')&&st[id].attributes?.device_class==='battery');cfg.soc=socs.find(id=>/battery|soc/.test(id))||'';}
    this._config=cfg;
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:cfg},bubbles:true,composed:true}));
    this._render();
  }

  _render(){
    const el=this.querySelector('.editor');if(el)el.removeEventListener('change',this._onchange);
    const L=LANG[this._config.language||'pt']||LANG.pt;
    const c=this._config;
    const T=EDL[c.language];const lbl=f=>T&&FLBL[f.key]?FLBL[f.key](T):f.label;
    const selStyle='padding:8px;border:1px solid var(--divider-color);border-radius:4px;background:var(--card-background-color);color:var(--primary-text-color);width:100%;font-size:14px';
    this.innerHTML=`
    <style>
      .editor{font-family:-apple-system,sans-serif;padding:16px}
      .editor h3{margin:0 0 12px;font-size:14px;font-weight:600;color:var(--primary-text-color);border-bottom:1px solid var(--divider-color);padding-bottom:8px}
      .editor h4{margin:16px 0 8px;font-size:12px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;letter-spacing:0.05em}
      .field{margin-bottom:8px}
      .field label{display:block;font-size:12px;color:var(--secondary-text-color);margin-bottom:4px}
      .field input,.field select{width:100%;padding:8px;border:1px solid var(--divider-color,rgba(255,255,255,0.15));border-radius:4px;background:var(--card-background-color,#1c1e21);color:var(--primary-text-color);font-size:14px;box-sizing:border-box;min-height:38px}
      .row{display:flex;gap:12px}
      .row .field{flex:1}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .hint{font-size:10px;color:var(--secondary-text-color);opacity:0.6;margin-top:2px}
    </style>
    <div class="editor">
      <h3>${L.editor_title} <span style="font-size:10px;opacity:0.4">v${V}</span></h3>

      <div class="row">
        <div class="field">
          <label>${L.editor_preset}</label>
          <select id="ed-preset" style="${selStyle}">
            ${Object.keys(PRESETS).map(k=>`<option value="${k}" ${c.preset===k?'selected':''}>${PRESETS[k].label}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>${L.editor_lang}</label>
          <select id="ed-lang" style="${selStyle}">
            <option value="pt" ${c.language==='pt'?'selected':''}>Portugu\u00EAs</option>
            <option value="en" ${c.language==='en'?'selected':''}>English</option>
            <option value="de" ${c.language==='de'?'selected':''}>Deutsch</option>
            <option value="fr" ${c.language==='fr'?'selected':''}>Fran\u00E7ais</option>
            <option value="es" ${c.language==='es'?'selected':''}>Espa\u00F1ol</option>
            <option value="it" ${c.language==='it'?'selected':''}>Italiano</option>
            <option value="nl" ${c.language==='nl'?'selected':''}>Nederlands</option>
            <option value="pl" ${c.language==='pl'?'selected':''}>Polski</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>${L.editor_inverter_name}</label>
          <input type="text" id="ed-inv" value="${this._esc(c.inverter_name)}">
        </div>
        <div class="field">
          <label>Theme</label>
          <select id="ed-theme" style="${selStyle}">
            <option value="auto" ${c.theme==='auto'?'selected':''}>Auto</option>
            <option value="dark" ${c.theme==='dark'?'selected':''}>Dark</option>
            <option value="light" ${c.theme==='light'?'selected':''}>Light</option>
          </select>
        </div>
        <div class="field">
          <label>Layout</label>
          <select id="ed-compact" style="${selStyle}">
            <option value="false" ${!c.compact?'selected':''}>Full</option>
            <option value="true" ${c.compact?'selected':''}>Compact</option>
          </select>
        </div>
      </div>

      <h4>${L.editor_polarity}</h4>
      <div class="row">
        <div class="field">
          <label>${L.editor_bat_pol}</label>
          <select id="ed-bpol" style="${selStyle}">
            <option value="negative" ${c.bat_polarity==='negative'?'selected':''}>${L.charging} (Deye, Sunsynk, Growatt)</option>
            <option value="positive" ${c.bat_polarity==='positive'?'selected':''}>${L.charging} (Huawei, Fronius, SolarEdge, Victron, Solis)</option>
          </select>
        </div>
        <div class="field">
          <label>${L.editor_grid_pol}</label>
          <select id="ed-gpol" style="${selStyle}">
            <option value="positive" ${c.grid_polarity==='positive'?'selected':''}>${L.importing} (Deye, Huawei, Growatt)</option>
            <option value="negative" ${c.grid_polarity==='negative'?'selected':''}>${L.exporting} (SolarEdge)</option>
          </select>
        </div>
      </div>

      <h4>${L.editor_options}</h4>
      <div class="row">
        <div class="field">
          <label>${L.editor_soc}</label>
          <input type="number" id="ed-ssoc" min="0" max="100" value="${c.shutdown_soc??20}">
        </div>
        <div class="field">
          <label>${L.editor_capacity}</label>
          <input type="number" id="ed-cap" min="0" value="${c.battery_capacity??5120}">
        </div>
      </div>

      <h4>${L.editor_entities} <button id="ed-auto" type="button" style="float:right;margin-top:-4px;padding:4px 10px;font-size:11px;border:1px solid var(--divider-color,rgba(255,255,255,0.15));border-radius:4px;background:var(--card-background-color,#1c1e21);color:var(--primary-text-color);cursor:pointer">\u26A1 ${L.autodetect}</button></h4>
      <div class="grid">
        ${ENTITY_FIELDS.map(f=>{const v=c[f.key];const bad=v&&this._hass&&!this._hass.states[v];return `
          <div class="field">
            <label>${lbl(f)}</label>
            <input type="text" id="ed-${f.key}" value="${this._esc(v)}" placeholder="${this._esc(PRESETS[c.preset||'deye']?.e[f.key])}"${bad?' style="border-color:#EF5350"':''}>
            ${bad?'<div class="hint" style="color:#EF5350;opacity:1">\u26A0 '+L.invalid+'</div>':''}
          </div>
        `;}).join('')}
      </div>
    </div>`;
    this.querySelector('.editor').addEventListener('change',this._onchange);
    const ab=this.querySelector('#ed-auto');if(ab)ab.addEventListener('click',()=>this._autoDetect());
  }
}
customElements.define('xpower-flow-card-editor',XPowerFlowCardEditor);

class XPowerFlowCard extends HTMLElement{
constructor(){super();this.attachShadow({mode:'open'});this._c={};this._h=null;this._prev={solar:0,bat:0,grid:0,load:0};this._hist={solar:[],load:[],grid:[],battery:[]};this._histMax={solar:1,load:1,grid:1,battery:1};this._fs={};this._histTimer=null;this._histLastLoad=0;this._histLoading=false;this._syncSpd=0;this._resync=false;this._rafId=null;this._twv={};this._twr={};this._rm=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);this._onVis=()=>{if(!document.hidden&&this._h){this._histLastLoad=0;this._schedule();}};}

static getConfigElement(){return document.createElement('xpower-flow-card-editor');}
static getStubConfig(){return{...DEFAULTS};}

setConfig(c){
  this._c={};
  Object.keys(DEFAULTS).forEach(k=>{this._c[k]=c[k]!==undefined?c[k]:DEFAULTS[k];});
  this._lang=LANG[this._c.language]||LANG.pt;
  this._render();
  if(this._h)this._schedule();
}

connectedCallback(){
  document.addEventListener('visibilitychange',this._onVis);
  if(!this._c.compact&&!this._histTimer)this._histTimer=setInterval(()=>{if(this._h&&!document.hidden)this._loadHistory();},HIST_INTERVAL);
}

disconnectedCallback(){
  document.removeEventListener('visibilitychange',this._onVis);
  if(this._histTimer){clearInterval(this._histTimer);this._histTimer=null;}
  if(this._rafId){cancelAnimationFrame(this._rafId);this._rafId=null;}Object.values(this._twr).forEach(r=>{if(r)cancelAnimationFrame(r);});this._twr={};
}

set hass(h){
  const prev=this._h;
  this._h=h;
  const t=this._c.theme||'auto';
  if(t==='auto'){const dm=h.themes?.darkMode;const dark=dm!==undefined?dm!==false:!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches);this.classList.toggle('light',!dark);}
  else{this.classList.toggle('light',t==='light');}
  this.classList.toggle('compact',!!this._c.compact);
  if(document.hidden)return;
  const now=Date.now();
  if(!this._c.compact&&now-this._histLastLoad>HIST_INTERVAL){this._histLastLoad=now;this._loadHistory();}
  if(this._dirty(prev,h))this._schedule();
}

_schedule(){if(!this._rafId)this._rafId=requestAnimationFrame(()=>{this._rafId=null;this._update();});}

_dirty(o,n){
  if(!o)return true;
  if(o===n)return false;
  for(const k of ENT_KEYS){const e=this._c[k];if(e&&o.states[e]!==n.states[e])return true;}
  return false;
}

_gv(e){
  if(!e||!this._h||!this._h.states[e])return null;
  const s=this._h.states[e].state;
  if(s==='unavailable'||s==='unknown')return null;
  const v=parseFloat(s);
  return isNaN(v)?null:v;
}
_gs(e){return e&&this._h&&this._h.states[e]?this._h.states[e].state:'';}
_fmt(v){if(v===null)return this._lang.unavailable;const a=Math.abs(v);return a>=1000?(a/1000).toFixed(1)+' kW':a.toFixed(0)+' W';}
_fmtE(v){if(v===null)return this._lang.unavailable;return v.toFixed(1)+' kWh';}
_fmtC(e){if(!e||!this._h||!this._h.states[e])return '';const s=this._h.states[e];const v=parseFloat(s.state);if(isNaN(v))return '';const u=s.attributes?.unit_of_measurement||'€';return u+v.toFixed(2);}
_arrow(c,p){if(c===null)return '';const d=Math.abs(c)-Math.abs(p);return d>5?'\u25B4 ':d<-5?'\u25BE ':'\u25B8 ';}
_eta(totalMin,label){const pad=v=>String(v).padStart(2,'0');const h=Math.floor(totalMin/60),m=totalMin%60;const t=new Date(Date.now()+totalMin*60000);return h+'h '+pad(m)+'m \u25B8 '+label+' @'+pad(t.getHours())+':'+pad(t.getMinutes());}

_norm(raw,type){
  if(raw===null)return null;
  if(type==='bat'&&this._c.bat_polarity==='positive')return raw*-1;
  if(type==='grid'&&this._c.grid_polarity==='negative')return raw*-1;
  return raw;
}

_bucket(arr,t0,t1,n){
  if(!arr||!arr.length)return[];
  const sum=new Array(n).fill(0),cnt=new Array(n).fill(0);
  const span=(t1-t0)||1;
  for(const p of arr){
    const v=parseFloat(p.state);if(isNaN(v))continue;
    const ts=new Date(p.last_changed||p.last_updated||t0).getTime();
    let i=Math.floor((ts-t0)/span*n);if(i<0)i=0;else if(i>=n)i=n-1;
    sum[i]+=Math.abs(v);cnt[i]++;
  }
  const out=new Array(n);let prev=0;
  for(let i=0;i<n;i++){out[i]=cnt[i]?sum[i]/cnt[i]:prev;prev=out[i];}
  const sm=[];
  for(let i=0;i<n;i++){const a=i>0?out[i-1]:out[i];const b=i<n-1?out[i+1]:out[i];sm.push((a+out[i]*2+b)/4);}
  return sm;
}

async _loadHistory(){if(this._histLoading||!this._h)return;this._histLoading=true;try{const now=new Date();const start=new Date(now.getTime()-24*60*60*1000);const iso=encodeURIComponent(start.toISOString());const entities=encodeURIComponent([this._c.solar,this._c.load,this._c.grid,this._c.battery].filter(Boolean).join(','));if(!entities)return;const url='history/period/'+iso+'?filter_entity_id='+entities+'&minimal_response&no_attributes&significant_changes_only';const res=await this._h.callApi('GET',url);if(!res||!res.length)return;for(const series of res){if(!series.length)continue;const eid=series[0].entity_id;const pts=this._bucket(series,start.getTime(),now.getTime(),HIST_POINTS);const mx=pts.length?Math.max(...pts)||1:1;if(eid===this._c.solar){this._hist.solar=pts;this._histMax.solar=mx;}else if(eid===this._c.load){this._hist.load=pts;this._histMax.load=mx;}else if(eid===this._c.grid){this._hist.grid=pts;this._histMax.grid=mx;}else if(eid===this._c.battery){this._hist.battery=pts;this._histMax.battery=mx;}}this._drawSparks();}catch(e){console.warn('xPower history:',e);}finally{this._histLoading=false;}}

_render(){const L=this._lang;const INV=String(this._c.inverter_name||'').replace(/[<>&]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]));const s=this.shadowRoot;s.innerHTML=`<style>
:host{--solar:var(--xpf-solar,#FFB300);--battery:var(--xpf-battery,#7C4DFF);--grid:var(--xpf-grid,#42A5F5);--load:var(--xpf-load,#26C6DA);--green:var(--xpf-green,#66BB6A);--red:var(--xpf-red,#EF5350);--orange:var(--xpf-orange,#FFA726);--t1:var(--xpf-text,rgba(255,255,255,0.92));--t3:var(--xpf-text-secondary,rgba(255,255,255,0.45));--xpf-r:var(--xpf-radius,20px);--xpf-vm-size:var(--xpf-font-size,24px);--flow-w:var(--xpf-flow-width,3);--flow-dash:var(--xpf-dash-size,100);--batf:#fff;--batn:#111;--batt:rgba(255,255,255,0.22)}
:host(.light){--t1:var(--xpf-text,rgba(0,0,0,0.85));--t3:var(--xpf-text-secondary,rgba(0,0,0,0.45));--batf:rgba(0,0,0,0.85);--batn:#fff;--batt:rgba(0,0,0,0.12)}
:host(.light) ha-card{background:var(--xpf-bg,rgba(255,255,255,0.92));border-color:rgba(0,0,0,0.08)}
:host(.light) ha-card::before{background:linear-gradient(90deg,transparent,rgba(124,77,255,0.12),transparent)}
:host(.light) .fl{stroke:rgba(0,0,0,0.06)}
:host(.light) .ib{fill:rgba(0,0,0,0.03);stroke:rgba(0,0,0,0.08)}
:host(.light) .sb{background:var(--xpf-sparkline-bg,rgba(0,0,0,0.02));border-color:rgba(0,0,0,0.06)}
:host(.light) .sl{opacity:0.4}
ha-card{background:var(--xpf-bg,rgba(12,14,24,0.92));border:1px solid rgba(255,255,255,0.06);border-radius:var(--xpf-r);box-shadow:var(--xpf-shadow,0 2px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04));padding:var(--xpf-padding,6px 8px 6px);position:relative;overflow:hidden;font-family:-apple-system,sans-serif;--ha-card-background:transparent;--ha-card-border-width:0;--ha-card-border-radius:var(--xpf-r);--ha-card-box-shadow:none;transition:border-color 1.5s ease}
ha-card::before{content:'';position:absolute;top:-1px;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,77,255,0.25),transparent)}
svg{width:100%;height:auto;display:block}
.fl{fill:none;stroke:rgba(255,255,255,0.04);stroke-width:2;stroke-linecap:round}
.fa{fill:none;stroke-width:var(--flow-w);stroke-linecap:round;stroke-dasharray:var(--flow-dash) var(--flow-dash);transition:stroke 0.8s ease,opacity 0.8s ease}
.fd{animation:fD var(--spd,3s) linear infinite}.fu{animation:fU var(--spd,3s) linear infinite}.fr{animation:fR var(--spd,3s) linear infinite}.fL{animation:fL var(--spd,3s) linear infinite}
@keyframes ledBlink{0%,100%{opacity:1}50%{opacity:0.2}}
.led-on{animation:ledBlink 1.5s ease-in-out infinite}
@keyframes batPulse{0%,100%{opacity:0.5}50%{opacity:0.85}}
.bat-charge{animation:batPulse 1.5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.fa,.led-on,.bat-charge,.sun-spin{animation:none !important}}
@keyframes sunSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
#sunG{transform-origin:250px 38px;transition:opacity 0.8s ease}
#gridIcon,#loadIcon,#batIcon,#evIcon{transition:opacity 0.8s ease}
#vs,#vg,#vl,#vb,#ve{transition:opacity 0.8s ease}
.sun-spin{animation:sunSpin 60s linear infinite}
@keyframes fR{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}@keyframes fL{from{stroke-dashoffset:0}to{stroke-dashoffset:200}}@keyframes fD{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}@keyframes fU{from{stroke-dashoffset:0}to{stroke-dashoffset:200}}
.vm{fill:var(--t1);font-size:var(--xpf-vm-size);font-weight:600;text-anchor:middle;dominant-baseline:middle}
.vl{fill:var(--t3);font-size:10px;font-weight:600;letter-spacing:0.14em;text-anchor:middle;dominant-baseline:middle}
.vs{fill:var(--t1);font-size:22px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
.vd{fill:var(--t3);font-size:13px;font-weight:500;text-anchor:middle;dominant-baseline:middle}
.vc{fill:var(--t3);font-size:11px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.ib{fill:rgba(255,255,255,0.02);stroke:rgba(255,255,255,0.06);stroke-width:1}
.il{fill:rgba(255,255,255,0.35);font-size:12px;font-weight:600;letter-spacing:0.05em;text-anchor:middle;dominant-baseline:middle}
.au{fill:white;font-size:9px;font-weight:600;letter-spacing:0.04em;text-anchor:middle;dominant-baseline:middle}
.au-pill{rx:8;ry:8;transition:fill 0.5s ease}
.ct{cursor:pointer}.ct:hover{filter:brightness(1.2)}
.lcd{fill:rgba(255,255,255,0.95);font-size:6.5px;font-weight:700;font-family:'Courier New',monospace;text-anchor:middle;dominant-baseline:middle;letter-spacing:0.04em}

.wt{fill:var(--t3);font-size:11px;font-weight:500;text-anchor:start;dominant-baseline:middle;font-family:-apple-system,sans-serif}
.wb{fill:none;stroke:var(--t3);stroke-width:0.5;rx:4;ry:4;opacity:0.4}
.sr{display:flex;gap:6px;margin-top:8mm}
:host(.compact) .sr{display:none}
:host(.compact) ha-card{padding:6px 8px 6px}
.sb{flex:1;background:var(--xpf-sparkline-bg,rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.04);border-radius:var(--xpf-sparkline-radius,12px);padding:10px 10px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden}
.sb-header{display:flex;justify-content:space-between;align-items:baseline}
.sl{font-size:7px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.3}
.sv{font-size:11px;font-weight:600;opacity:0.8}
.ss .sv{color:var(--green)}.sc .sv{color:var(--load)}.sg .sv{color:var(--grid)}.sbt .sv{color:var(--battery)}
.sb svg{width:100%;height:55px;display:block;margin-top:4px}
.sb path{stroke-linecap:round;stroke-linejoin:round}
.sb{position:relative;cursor:crosshair}
.sb-tip{position:absolute;top:2px;right:4px;font-size:10px;font-weight:600;opacity:0;transition:opacity 0.15s;pointer-events:none;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.7)}
.sb-tip.show{opacity:1}
.sb line.cursor{stroke:rgba(255,255,255,0.3);stroke-width:1;stroke-dasharray:2 2;display:none}
.sb circle.cursor-dot{fill:rgba(255,255,255,0.8);display:none}
.ss #hs{fill:none;stroke:rgba(102,187,106,0.7);stroke-width:1.2}.sc #hl{fill:none;stroke:rgba(38,198,218,0.7);stroke-width:1.2}.sg #hg{fill:none;stroke:rgba(66,165,245,0.7);stroke-width:1.2}.sbt #hb2{fill:none;stroke:rgba(124,77,255,0.7);stroke-width:1.2}
.ss #hsa{fill:url(#sgd-s);stroke:none}.sc #hla{fill:url(#sgd-l);stroke:none}.sg #hga{fill:url(#sgd-g);stroke:none}.sbt #hb2a{fill:url(#sgd-b);stroke:none}
</style>
<ha-card><svg viewBox="0 0 526 487"><defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="bat-clip"><rect x="232" y="342.5" width="32" height="17" rx="5.5"/></clipPath><clipPath id="bat-clip-on"><rect id="bclipA" x="232" y="342.5" width="32" height="17"/></clipPath><clipPath id="bat-clip-off"><rect id="bclipB" x="232" y="342.5" width="0" height="17"/></clipPath><clipPath id="ev-clip"><rect x="420.5" y="450.5" width="24" height="12" rx="4"/></clipPath><clipPath id="ev-clip-on"><rect id="eclipA" x="420.5" y="450.5" width="24" height="12"/></clipPath><clipPath id="ev-clip-off"><rect id="eclipB" x="420.5" y="450.5" width="0" height="12"/></clipPath></defs><g transform="translate(25.5,10) scale(0.95)">
<g id="wicons" style="display:none" transform="translate(-20,0)">
<rect class="wb" x="-2" y="-4" width="86" height="20"/>
<g transform="translate(0,1)"><rect x="6" y="0" width="2.5" height="7" rx="1.2" fill="none" stroke="var(--t3)" stroke-width="0.7"/><circle cx="7.2" cy="9" r="2.5" fill="none" stroke="var(--t3)" stroke-width="0.7"/><line x1="7.2" y1="3" x2="7.2" y2="7" stroke="var(--red)" stroke-width="1" stroke-linecap="round"/><circle cx="7.2" cy="9" r="1.2" fill="var(--red)"/></g>
<text x="14" y="8" class="wt" id="wt"></text>
<line id="wdiv" x1="44" y1="2" x2="44" y2="12" stroke="var(--t3)" stroke-width="0.5" opacity="0.4" style="display:none"/>
<g id="wdrop" transform="translate(2,1)"><path d="M46,9 Q46,4 49,0 Q52,4 52,9 Q52,12 49,12 Q46,12 46,9Z" fill="none" stroke="var(--t3)" stroke-width="0.7"/><path d="M47.2,8.5 Q47.2,5.5 49,2 Q50.8,5.5 50.8,8.5 Q50.8,10.5 49,10.5 Q47.2,10.5 47.2,8.5Z" fill="var(--grid)" opacity="0.5"/></g>
<text x="58" y="8" class="wt" id="wh"></text>
</g>
<path class="fl" d="M250,96 L250,178"/><path class="fl" d="M250,272 L250,364"/><path class="fl" d="M90,225 L215,225"/><path class="fl" d="M285,225 L395,225"/>
<path id="fs" class="fa" d="M250,96 L250,178" pathLength="100" opacity="0"/><path id="fb" class="fa" d="M250,272 L250,364" pathLength="100" opacity="0"/><path id="fg" class="fa" d="M90,225 L215,225" pathLength="100" opacity="0"/><path id="fh" class="fa" d="M285,225 L395,225" pathLength="100" opacity="0"/>
<g id="nSolar" class="ct"><g id="sunG"><g transform="translate(250,38) scale(1.65) translate(-250,-38)"><circle cx="250" cy="38" r="9" fill="var(--solar)" opacity="0.85"/><line x1="250" y1="25" x2="250" y2="21" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="250" y1="51" x2="250" y2="55" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="237" y1="38" x2="233" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="263" y1="38" x2="267" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="240.8" y1="28.8" x2="238" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="47.2" x2="262" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="28.8" x2="262" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="240.8" y1="47.2" x2="238" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/></g></g><text x="250" y="82" class="vm" style="fill:var(--green)" id="vs"></text><text x="250" y="-2" class="vl">${L.solar}</text><text x="205" y="30" class="vd" id="ds1" style="text-anchor:end"></text><text x="205" y="44" class="vc" id="pv1" style="text-anchor:end"></text><text x="295" y="30" class="vd" id="ds" style="text-anchor:start"></text><text x="295" y="44" class="vc" id="pv" style="text-anchor:start"></text></g>
<g><g transform="translate(250,225) scale(1.65)"><rect x="-18" y="-24" width="36" height="48" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/><rect x="-18" y="-24" width="36" height="5" rx="2" fill="rgba(255,255,255,0.12)"/><rect x="-12" y="-15" width="24" height="12" rx="1.5" fill="rgba(102,187,106,0.15)" stroke="rgba(102,187,106,0.4)" stroke-width="0.7"/><circle id="led1" cx="-6" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led2" cx="-2" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led3" cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led4" cx="6" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><path id="bolt" d="M-6,9 L-8,15 L-4,15 L-6,21" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/><rect x="2" y="12" width="10" height="3" rx="0.5" fill="rgba(255,255,255,0.1)"/><rect x="2" y="17" width="10" height="3" rx="0.5" fill="rgba(255,255,255,0.1)"/><text id="lcd" x="0" y="-9" class="lcd">0W</text></g>${INV?'<text x="250" y="272" class="il">'+INV+'</text>':''}<text x="296" y="264" class="vc" id="tp" text-anchor="start"></text></g>
<g id="nGrid" class="ct"><g id="gridIcon" transform="translate(66,225) scale(1.65) translate(-66,-196)"><rect x="64" y="181" width="4" height="30" rx="1" fill="var(--red)" opacity="0.7"/><rect x="54" y="183" width="24" height="3" rx="1" fill="var(--red)" opacity="0.6"/><rect x="57" y="192" width="18" height="2.5" rx="1" fill="var(--red)" opacity="0.5"/><path d="M60,211 L64,199 L68,199 L72,211" fill="var(--red)" opacity="0.4"/><circle cx="56" cy="184" r="1.5" fill="var(--red)" opacity="0.8"/><circle cx="76" cy="184" r="1.5" fill="var(--red)" opacity="0.8"/><circle cx="58" cy="193" r="1.2" fill="var(--red)" opacity="0.7"/><circle cx="74" cy="193" r="1.2" fill="var(--red)" opacity="0.7"/><line x1="54" y1="184" x2="46" y2="181" stroke="var(--red)" stroke-width="0.8" opacity="0.3"/><line x1="78" y1="184" x2="86" y2="181" stroke="var(--red)" stroke-width="0.8" opacity="0.3"/></g><text x="66" y="268" class="vm" style="fill:var(--red)" id="vg"></text><text x="66" y="190" class="vl">${L.grid}</text><text x="66" y="286" class="vc" id="gv"></text><circle id="gsd" cx="92" cy="189" r="4" fill="rgba(255,255,255,0.12)"/><text x="66" y="300" class="vd" id="dg"></text></g>
<g id="nLoad" class="ct"><g id="loadIcon" transform="translate(434,225) scale(1.65) translate(-434,-188)"><path d="M416,188 L434,174 L452,188 Z" fill="var(--load)" opacity="0.8"/><rect x="420" y="187" width="28" height="18" rx="1" fill="var(--load)" opacity="0.6"/><rect x="430" y="195" width="8" height="10" rx="1" fill="rgba(0,0,0,0.3)"/><rect x="422" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="440" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="441" y="176" width="5" height="8" rx="1" fill="var(--load)" opacity="0.5"/></g><text x="434" y="268" class="vm" style="fill:var(--load)" id="vl"></text><text x="434" y="190" class="vl">${L.load}</text><text x="434" y="288" class="vd" id="dl"></text></g>
<g id="nBat" class="ct"><g id="batIcon" transform="translate(250,400) scale(2.05) translate(-250,-351)"><rect x="232" y="342.5" width="32" height="17" rx="5.5" fill="var(--batt)"/><rect id="bl" x="232" y="342.5" width="32" height="17" fill="var(--batf)" clip-path="url(#bat-clip)"/><rect x="264.5" y="346.5" width="4" height="9" rx="2" fill="var(--batt)"/><text id="bp" x="248" y="355.7" font-family="-apple-system,sans-serif" font-size="13.5" font-weight="800" fill="var(--batn)" text-anchor="middle" clip-path="url(#bat-clip-on)">--</text><text id="bp2" x="248" y="355.7" font-family="-apple-system,sans-serif" font-size="13.5" font-weight="800" fill="var(--batf)" text-anchor="middle" clip-path="url(#bat-clip-off)">--</text><path id="bbolt" d="M260.1,345.8 L255.7,352 L258.9,352 L257.1,356.8 L262.5,349.9 L259.3,349.9 Z" fill="#fff" style="display:none"/></g><text x="250" y="440" class="vm" style="fill:var(--solar)" id="vb"></text><text x="250" y="372" class="vl">${L.battery}</text><text x="316" y="394" class="vc" id="bv" text-anchor="start"></text><text x="316" y="406" class="vc" id="bt" text-anchor="start"></text><text x="250" y="460" class="vd" id="db"></text><text x="250" y="476" class="vc" id="br" style="fill:var(--t1)"></text></g>
<g id="nEV" class="ct" style="display:none"><path class="fl" d="M434,302 L434,362"/><path id="fe" class="fa" d="M434,302 L434,362" pathLength="100" opacity="0"/><text x="434" y="372" class="vl">${L.ev}</text><g id="evIcon" transform="translate(434,398) scale(1.65) translate(-434,-398)"><path d="M419.5,402.5 Q419.3,398.2 424,397.1 Q426.5,391.6 432,390.9 L437,390.9 Q442.3,391.3 445.3,395.2 Q449.1,396.1 449.4,399.6 Q449.6,402.5 446.6,402.5 L422.4,402.5 Q419.6,402.5 419.5,402.5 Z" fill="var(--load)" opacity="0.8"/><path d="M427.6,395.9 Q429.1,392.6 432.6,392.3 L433.6,392.3 L433.6,395.9 Z" fill="rgba(0,0,0,0.35)"/><path d="M435.1,392.3 L436.9,392.3 Q440.4,392.7 442.4,395.9 L435.1,395.9 Z" fill="rgba(0,0,0,0.35)"/><circle cx="426" cy="402.4" r="3.1" fill="rgba(0,0,0,0.55)"/><circle cx="426" cy="402.4" r="1.4" fill="rgba(255,255,255,0.35)"/><circle cx="442.3" cy="402.4" r="3.1" fill="rgba(0,0,0,0.55)"/><circle cx="442.3" cy="402.4" r="1.4" fill="rgba(255,255,255,0.35)"/><path id="evbolt" d="M452.5,391 L450.5,396 L453.5,396 L451.5,401" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/></g><text x="434" y="440" class="vm" style="fill:var(--green)" id="ve"></text><g id="evPill" style="display:none"><rect x="420.5" y="450.5" width="24" height="12" rx="4" fill="var(--batt)"/><rect id="evl" x="420.5" y="450.5" width="0" height="12" fill="var(--batf)" clip-path="url(#ev-clip)"/><rect x="444.9" y="453.3" width="3" height="6.4" rx="1.5" fill="var(--batt)"/><text id="evsoc" x="432.5" y="459.8" font-family="-apple-system,sans-serif" font-size="9.5" font-weight="800" fill="var(--batn)" text-anchor="middle" clip-path="url(#ev-clip-on)"></text><text id="evsoc2" x="432.5" y="459.8" font-family="-apple-system,sans-serif" font-size="9.5" font-weight="800" fill="var(--batf)" text-anchor="middle" clip-path="url(#ev-clip-off)"></text></g><text x="434" y="476" class="vd" id="de"></text></g>
<defs><clipPath id="au-clip"><rect x="476" y="-4" width="47" height="34" rx="6"/></clipPath></defs><rect x="476" y="-4" width="47" height="34" rx="6" fill="none"/><rect x="476" y="-4" width="47" height="34" rx="6" fill="none" id="au-border" stroke="#1a4a36" stroke-width="1.5"/><text x="499" y="9" id="va" font-family="-apple-system,sans-serif" font-size="13.6" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="middle"></text><g clip-path="url(#au-clip)"><rect x="476" y="19" width="47" height="11" id="au-bar" fill="#1a4a36"/><text x="499" y="25" font-family="-apple-system,sans-serif" font-size="4.1" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${L.autarky.toUpperCase()}</text></g>
</g></svg>
<div class="sr">
<div class="sb sg"><div class="sb-header"><span class="sl">${L.grid24}</span><span class="sv" id="hz"></span></div><svg viewBox="0 0 200 55" preserveAspectRatio="none"><defs><linearGradient id="sgd-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(66,165,245,0.30)"/><stop offset="1" stop-color="rgba(66,165,245,0)"/></linearGradient></defs><path id="hga"/><path id="hg"/><line class="cursor" id="cg" x1="0" y1="0" x2="0" y2="55"/><circle class="cursor-dot" id="dg2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="tg"></span></div>
<div class="sb ss"><div class="sb-header"><span class="sl">${L.solar24}</span><span class="sv" id="hv"></span></div><svg viewBox="0 0 200 55" preserveAspectRatio="none"><defs><linearGradient id="sgd-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(102,187,106,0.30)"/><stop offset="1" stop-color="rgba(102,187,106,0)"/></linearGradient></defs><path id="hsa"/><path id="hs"/><line class="cursor" id="cs" x1="0" y1="0" x2="0" y2="55"/><circle class="cursor-dot" id="ds2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="ts"></span></div>
<div class="sb sc"><div class="sb-header"><span class="sl">${L.load24}</span><span class="sv" id="hx"></span></div><svg viewBox="0 0 200 55" preserveAspectRatio="none"><defs><linearGradient id="sgd-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(38,198,218,0.30)"/><stop offset="1" stop-color="rgba(38,198,218,0)"/></linearGradient></defs><path id="hla"/><path id="hl"/><line class="cursor" id="cl" x1="0" y1="0" x2="0" y2="55"/><circle class="cursor-dot" id="dl2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="tl"></span></div>
<div class="sb sbt"><div class="sb-header"><span class="sl">${L.bat24}</span><span class="sv" id="hy"></span></div><svg viewBox="0 0 200 55" preserveAspectRatio="none"><defs><linearGradient id="sgd-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(124,77,255,0.30)"/><stop offset="1" stop-color="rgba(124,77,255,0)"/></linearGradient></defs><path id="hb2a"/><path id="hb2"/><line class="cursor" id="cb" x1="0" y1="0" x2="0" y2="55"/><circle class="cursor-dot" id="db2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="tb"></span></div>
</div></ha-card>`;this._setupTooltips();this._setupClicks();}

_$(id){return this.shadowRoot.getElementById(id);}
_moreInfo(entityId){if(!entityId)return;this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId},bubbles:true,composed:true}));}
_setupClicks(){const c=this._c;const bind=(id,entity)=>{const el=this._$(id);if(el&&entity)el.addEventListener('click',()=>this._moreInfo(entity));};bind('nSolar',c.solar);bind('nGrid',c.grid);bind('nLoad',c.load);bind('nBat',c.battery||c.soc);bind('nEV',c.ev_power||c.ev_soc);}
_setupTooltips(){
  const self=this;
  const setup=(svgParent,cursorId,dotId,tipId,dataKey,color)=>{
    const svg=self.shadowRoot.querySelector('#'+cursorId)?.closest('svg');
    if(!svg)return;
    const cursor=self._$(cursorId);const dot=self._$(dotId);const tip=self._$(tipId);
    if(!cursor||!dot||!tip)return;
    const show=(cx)=>{
      const data=self._hist[dataKey];if(!data||!data.length)return;
      const rect=svg.getBoundingClientRect();
      const x=(cx-rect.left)/rect.width;
      const idx=Math.min(Math.max(Math.round(x*(data.length-1)),0),data.length-1);
      const val=data[idx];const svgX=x*200;
      const max=self._histMax[dataKey]||1;const svgY=2+(1-val/max)*51;
      cursor.setAttribute('x1',svgX);cursor.setAttribute('x2',svgX);cursor.style.display='';
      dot.setAttribute('cx',svgX);dot.setAttribute('cy',svgY);dot.style.display='';dot.setAttribute('fill',color);
      const hoursAgo=(1-idx/(data.length-1))*24;
      const when=new Date(Date.now()-hoursAgo*3600000);
      const hh=String(when.getHours()).padStart(2,'0');const mm=String(when.getMinutes()).padStart(2,'0');
      tip.textContent=(val>=1000?(val/1000).toFixed(1)+' kW':val.toFixed(0)+' W')+' · '+hh+':'+mm;
      tip.style.color=color;tip.classList.add('show');
    };
    const hide=()=>{cursor.style.display='none';dot.style.display='none';tip.classList.remove('show');};
    svg.addEventListener('mousemove',(e)=>show(e.clientX));
    svg.addEventListener('mouseleave',hide);
    svg.addEventListener('touchmove',(e)=>{e.preventDefault();show(e.touches[0].clientX);},{passive:false});
    svg.addEventListener('touchend',hide);
  };
  setup(null,'cg','dg2','tg','grid','#42A5F5');
  setup(null,'cs','ds2','ts','solar','#66BB6A');
  setup(null,'cl','dl2','tl','load','#26C6DA');
  setup(null,'cb','db2','tb','battery','#7C4DFF');
}
_spd(p){const a=Math.abs(p);if(a<10)return 0;let s=Math.max(ANIM_MIN_SPD,ANIM_MAX_SPD-(a/ANIM_MAX_W)*(ANIM_MAX_SPD-ANIM_MIN_SPD));if(a>=3000)s*=0.4;else if(a>=2000)s*=0.6;else if(a>=1000)s*=0.8;return s;}
_sf(el,id,p,d,c,o){if(!el)return;if(Math.abs(p)<10){el.setAttribute('opacity','0');return;}el.setAttribute('stroke',c);el.setAttribute('opacity',o);if(this._fs[id]!==d){this._fs[id]=d;el.setAttribute('class','fa '+d);this._resync=true;}}
_tween(id,target,fmt){const el=this._$(id);if(!el)return;if(target===null||this._rm){el.textContent=fmt(target);this._twv[id]=target;return;}const from=this._twv[id];if(from===undefined||from===null||Math.abs(target-from)<1){el.textContent=fmt(target);this._twv[id]=target;return;}if(this._twr[id])cancelAnimationFrame(this._twr[id]);const t0=performance.now(),dur=600;const step=t=>{let k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,3);const v=from+(target-from)*k;el.textContent=fmt(v);if(k<1)this._twr[id]=requestAnimationFrame(step);else{this._twr[id]=null;this._twv[id]=target;}};this._twr[id]=requestAnimationFrame(step);}
_spark(id,aid,data){const el=this._$(id);const af=this._$(aid);if(!el||!data.length)return;const w=200,h=55,py=2,max=Math.max(...data)||1;const pts=data.map((v,i)=>[(i/(data.length-1))*w,py+(1-v/max)*(h-py*2)]);if(pts.length<2)return;const tension=0.3;const cp=(p0,p1,p2,t)=>[p1[0]+(p2[0]-p0[0])*t,p1[1]+(p2[1]-p0[1])*t];let d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)];const p1=pts[i];const p2=pts[i+1];const p3=pts[Math.min(pts.length-1,i+2)];const c1=cp(p0,p1,p2,tension);const c2=[p2[0]-(p3[0]-p1[0])*tension,p2[1]-(p3[1]-p1[1])*tension];d+=' C'+c1[0].toFixed(1)+','+c1[1].toFixed(1)+' '+c2[0].toFixed(1)+','+c2[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);}el.setAttribute('d',d);if(af){af.setAttribute('d',d+'L'+w+','+h+'L0,'+h+'Z');}}
_drawSparks(){this._spark('hs','hsa',this._hist.solar);this._spark('hl','hla',this._hist.load);this._spark('hg','hga',this._hist.grid);this._spark('hb2','hb2a',this._hist.battery);}

_update(){if(!this._h||!this.shadowRoot.getElementById('vs'))return;
const c=this._c,L=this._lang;

const sol1=this._gv(c.solar);
const sol2=this._gv(c.solar2);
const sol=sol1!==null&&sol2!==null?sol1+sol2:sol1!==null?sol1:sol2;
const batCh=this._gv(c.battery_charge);
const batDis=this._gv(c.battery_discharge);
const bat=(batCh!==null||batDis!==null)?(batDis??0)-(batCh??0):this._norm(this._gv(c.battery),'bat');
const soc=this._gv(c.soc);
const grid=this._norm(this._gv(c.grid),'grid');
const load=this._gv(c.load);
const temp=this._gv(c.temperature);
const gv=this._gv(c.grid_voltage);
const gv2=this._gv(c.grid_voltage_l2);
const gv3=this._gv(c.grid_voltage_l3);
const bv=this._gv(c.battery_voltage);
const pvv=this._gv(c.pv_voltage);
const pvv2=this._gv(c.pv_voltage2);
const freq=this._gv(c.frequency);

const p=this._prev;
this._tween('vs',sol,v=>this._arrow(sol,p.solar)+this._fmt(v));
this._tween('vb',bat!==null?Math.abs(bat):null,v=>this._arrow(bat,p.bat)+this._fmt(v));
this._tween('vg',grid!==null?Math.abs(grid):null,v=>this._arrow(grid,p.grid)+this._fmt(v));
this._tween('vl',load,v=>this._arrow(load,p.load)+this._fmt(v));
this._prev={solar:sol??0,bat:bat??0,grid:grid??0,load:load??0};

const socVal=soc??0;
const bpEl=this._$('bp'),bp2El=this._$('bp2');const bpTxt=soc!==null?String(Math.round(soc)):L.unavailable;if(bpEl)bpEl.textContent=bpTxt;if(bp2El)bp2El.textContent=bpTxt;
const shu=c.shutdown_soc??20;let batC='var(--batf)',bpC='var(--batn)';if(soc!==null&&socVal<=shu){batC='#EF5350';bpC='#fff';}else if(soc!==null&&socVal<=shu+15){batC='#FFA726';bpC='#111';}const ch=bat!==null&&bat<-10;if(ch){batC='#4CD964';bpC='#fff';}const bw=32*(socVal/100);const blEl=this._$('bl');if(blEl){blEl.setAttribute('width',bw.toFixed(1));blEl.setAttribute('fill',batC);if(ch)blEl.setAttribute('class','bat-charge');else blEl.removeAttribute('class');}const bcA=this._$('bclipA'),bcB=this._$('bclipB');if(bcA)bcA.setAttribute('width',bw.toFixed(1));if(bcB){bcB.setAttribute('x',(232+bw).toFixed(1));bcB.setAttribute('width',(32-bw).toFixed(1));}const bx=ch?'245':'248';if(bpEl){bpEl.setAttribute('fill',bpC);bpEl.setAttribute('x',bx);}if(bp2El){bp2El.setAttribute('fill',batC);bp2El.setAttribute('x',bx);}const bboltEl=this._$('bbolt');if(bboltEl)bboltEl.style.display=ch?'':'none';

if(temp!==null)this._$('tp').textContent=temp.toFixed(0)+'\u00B0C';else this._$('tp').textContent='';
if(pvv!==null&&pvv2!==null){this._$('pv1').textContent=pvv.toFixed(0)+'V';this._$('pv').textContent=pvv2.toFixed(0)+'V';}else if(pvv!==null){this._$('pv1').textContent='';this._$('pv').textContent=pvv.toFixed(0)+'V';}else if(pvv2!==null){this._$('pv1').textContent='';this._$('pv').textContent=pvv2.toFixed(0)+'V';}else{this._$('pv1').textContent='';this._$('pv').textContent='';}
const gvTxt=gv!==null?(gv2!==null&&gv3!==null?gv.toFixed(0)+'/'+gv2.toFixed(0)+'/'+gv3.toFixed(0)+'V':gv.toFixed(0)+'V'):null;
if(gvTxt!==null&&freq!==null)this._$('gv').textContent=gvTxt+' \u00B7 '+freq.toFixed(1)+'Hz';else if(gvTxt!==null)this._$('gv').textContent=gvTxt;else if(freq!==null)this._$('gv').textContent=freq.toFixed(1)+'Hz';else this._$('gv').textContent='';
if(bv!==null)this._$('bv').textContent=bv.toFixed(1)+'V';else this._$('bv').textContent='';
const bt=this._gv(c.battery_temperature);if(bt!==null)this._$('bt').textContent=bt.toFixed(0)+'\u00B0C';else this._$('bt').textContent='';

const dS=this._gv(c.daily_solar)??0,dI=this._gv(c.daily_import)??0,dE=this._gv(c.daily_export)??0,dL=this._gv(c.daily_load)??0,dC=this._gv(c.daily_charge)??0,dD=this._gv(c.daily_discharge)??0;
// Solar node: if dual MPPT, show per-MPPT power above daily kWh
if(c.solar2&&sol1!==null&&sol2!==null){
  this._$('ds1').textContent='\u25B8 PV1: '+this._fmt(sol1);
  this._$('ds').textContent='PV2: '+this._fmt(sol2)+' \u25C2';
}else{
  this._$('ds1').textContent='';
  this._$('ds').textContent=L.daily+' '+this._fmtE(dS);
}
this._$('dg').textContent=L.import_+' '+this._fmtE(dI)+(this._fmtC(c.import_cost)?' · '+this._fmtC(c.import_cost):'')+' '+L.export_+' '+this._fmtE(dE)+(this._fmtC(c.export_cost)?' · '+this._fmtC(c.export_cost):'');
this._$('dl').textContent=L.daily+' '+this._fmtE(dL);
this._$('db').textContent=L.charge+' '+this._fmtE(dC)+' '+L.discharge+' '+this._fmtE(dD);

const solF=sol??0,batF=bat??0,gridF=grid??0,loadF=load??0;
const maxP=Math.max(solF,Math.abs(batF),Math.abs(gridF),loadF);
const syncSpd=maxP>10?this._spd(maxP):3;
if(this._syncSpd<=0||Math.abs(syncSpd-this._syncSpd)/this._syncSpd>0.1){this._syncSpd=syncSpd;const spd=syncSpd.toFixed(1)+'s';['fs','fg','fb','fh','fe'].forEach(id=>{const el=this._$(id);if(el)el.style.setProperty('--spd',spd);});this._resync=true;}
this._sf(this._$('fs'),'s',solF,'fd','var(--green)','0.8');
this._sf(this._$('fg'),'g',gridF,gridF>0?'fr':'fL',gridF>0?'var(--red)':'var(--green)','0.7');
this._sf(this._$('fb'),'b',batF,batF<0?'fd':'fu',batF<0?'var(--green)':'var(--solar)','0.75');
const solContrib=solF>0?solF:0;const batContrib=batF>0?batF:0;const gridContrib=gridF>0?gridF:0;
let homeColor='var(--green)';
if(loadF>10){if(gridContrib>=solContrib&&gridContrib>=batContrib&&gridContrib>0)homeColor='var(--red)';else if(batContrib>=solContrib&&batContrib>0)homeColor='var(--solar)';else homeColor='var(--green)';}
this._sf(this._$('fh'),'h',loadF,'fr',homeColor,'0.75');

// EV node — visible only when ev_power/ev_soc configured
const nEV=this._$('nEV');
if(nEV){
  if(c.ev_power||c.ev_soc){
    nEV.style.display='';
    const evV=this._gv(c.ev_power);
    const evAbs=evV!==null?Math.abs(evV):0;
    this._tween('ve',evV!==null?evAbs:null,v=>this._fmt(v));
    const evSoc=this._gv(c.ev_soc);
    const evPill=this._$('evPill');
    if(evPill){
      if(evSoc!==null){
        evPill.style.display='';
        const et=String(Math.round(evSoc));
        const e1=this._$('evsoc'),e2=this._$('evsoc2');
        if(e1)e1.textContent=et;if(e2)e2.textContent=et;
        const ew=24*Math.max(0,Math.min(100,evSoc))/100;
        const evl=this._$('evl');const eA=this._$('eclipA'),eB=this._$('eclipB');
        if(evl)evl.setAttribute('width',ew.toFixed(1));
        if(eA)eA.setAttribute('width',ew.toFixed(1));
        if(eB){eB.setAttribute('x',(420.5+ew).toFixed(1));eB.setAttribute('width',(24-ew).toFixed(1));}
        const evCh=evAbs>10;const efC=evCh?'#4CD964':'var(--batf)';
        if(evl)evl.setAttribute('fill',efC);
        if(e1)e1.setAttribute('fill',evCh?'#fff':'var(--batn)');
        if(e2)e2.setAttribute('fill',efC);
      }else evPill.style.display='none';
    }
    const dEV=this._gv(c.daily_ev);
    this._$('de').textContent=dEV!==null?L.daily+' '+this._fmtE(dEV):'';
    this._sf(this._$('fe'),'e',evAbs,'fd','var(--green)','0.75');
    const evIcon=this._$('evIcon');if(evIcon)evIcon.style.opacity=evAbs>10?'1':'0.25';
    this._$('ve').style.opacity=evAbs>10?'1':'0.25';
    const evbolt=this._$('evbolt');if(evbolt){if(evAbs>10){evbolt.setAttribute('fill','var(--green)');evbolt.setAttribute('stroke','var(--green)');evbolt.setAttribute('class','led-on');}else{evbolt.setAttribute('fill','rgba(255,255,255,0.15)');evbolt.setAttribute('stroke','rgba(255,255,255,0.3)');evbolt.removeAttribute('class');}}
  }else{nEV.style.display='none';}
}

// Phase lock — restart all flow animations in the same frame so pulses relay through the inverter
if(this._resync){this._resync=false;const els=['fs','fg','fb','fh','fe'].map(id=>this._$(id)).filter(Boolean);els.forEach(el=>{el.style.animation='none';});void this.offsetWidth;els.forEach(el=>{el.style.animation='';});}

const batCap=c.battery_capacity??5120;const shuSoc=c.shutdown_soc??20;
const brEl=this._$('br');
if(batF>RUNTIME_MIN_W&&socVal>shuSoc){
  const remWh=(socVal-shuSoc)/100*batCap;
  brEl.textContent=this._eta(Math.round(remWh/batF*60),shuSoc+'%');
}else if(batF<-RUNTIME_MIN_W&&socVal>0&&socVal<100){
  const remWh=(100-socVal)/100*batCap;
  brEl.textContent=this._eta(Math.round(remWh/-batF*60),'100%');
}else{brEl.textContent='';}

const gridImp=gridF>0?gridF:0;
const au=loadF>0?Math.max(0,Math.min(100,((loadF-gridImp)/loadF)*100)):0;
this._$('va').textContent=au.toFixed(0)+'%';
let auC;if(au>=80)auC='#1a4a36';else if(au>=50)auC='rgba(180,140,60,0.55)';else if(au>=25)auC='rgba(180,100,60,0.55)';else auC='rgba(180,70,70,0.55)';const auBar=this._$('au-bar');if(auBar)auBar.setAttribute('fill',auC);const auBorder=this._$('au-border');if(auBorder){auBorder.setAttribute('stroke',auC);auBorder.style.filter=au>=90?'url(#glow)':'';}

const wtv=this._gv(c.weather_temp);const whv=this._gv(c.weather_humidity);
const wicons=this._$('wicons');const wdrop=this._$('wdrop');const wdiv=this._$('wdiv');
const wtEl=this._$('wt');const whEl=this._$('wh');
if(wtv!==null||whv!==null){
  if(wicons)wicons.style.display='';
  if(wtEl)wtEl.textContent=wtv!==null?wtv.toFixed(0)+'\u00B0C':'';
  if(whEl)whEl.textContent=whv!==null?whv.toFixed(0)+'%':'';
  if(wdrop)wdrop.style.display=whv!==null?'':'none';
  if(wdiv)wdiv.style.display=(wtv!==null&&whv!==null)?'':'none';
}else{
  if(wicons)wicons.style.display='none';
}

const _led=(id,on,color)=>{const el=this._$(id);if(!el)return;el.setAttribute('fill',on?color:'rgba(255,255,255,0.12)');if(on)el.setAttribute('class','led-on');else el.removeAttribute('class');};
_led('led1',solF>10,'#66BB6A');
_led('led2',batF>10,'#FFA726');
_led('led3',gridF>10,'#EF5350');
_led('led4',loadF>10,'#26C6DA');

// Grid status dot
const gsd=this._$('gsd');if(gsd){const gsE=this._gs(c.grid_status);const online=gsE==='on'||gsE==='1'||gsE==='true';if(c.grid_status&&gsE){gsd.setAttribute('fill',online?'#66BB6A':'#EF5350');gsd.style.display='';}else{gsd.style.display='none';}}

// Sun spin when generating
const sunG=this._$('sunG');if(sunG){if(solF>10){sunG.classList.add('sun-spin');sunG.style.opacity='1';}else{sunG.classList.remove('sun-spin');sunG.style.opacity='0.25';}}
const gridIcon=this._$('gridIcon');if(gridIcon){gridIcon.style.opacity=Math.abs(gridF)>10?'1':'0.25';}
const loadIcon=this._$('loadIcon');if(loadIcon){loadIcon.style.opacity=loadF>10?'1':'0.25';}
const batIcon=this._$('batIcon');if(batIcon){batIcon.style.opacity=Math.abs(batF)>10?'1':'0.25';}
this._$('vs').style.opacity=solF>10?'1':'0.25';
this._$('vg').style.opacity=Math.abs(gridF)>10?'1':'0.25';
this._$('vl').style.opacity=loadF>10?'1':'0.25';
this._$('vb').style.opacity=Math.abs(batF)>10?'1':'0.25';

this._$('hv').textContent=this._fmt(sol)+' / '+this._fmtE(dS);
this._$('hx').textContent=this._fmt(load)+' / '+this._fmtE(dL);
this._$('hz').textContent=this._fmt(grid!==null?Math.abs(grid):null)+' / '+this._fmtE(dI+dE);
this._$('hy').textContent=this._fmt(bat!==null?Math.abs(bat):null)+' / '+this._fmtE(dC+dD);

// #1 Dynamic Border — thin border color based on dominant source
const card=this.shadowRoot.querySelector('ha-card');
if(card){const sC=solF>0?solF:0;const bC=batF>0?batF:0;const gC=gridF>0?gridF:0;
let borderColor='rgba(255,255,255,0.06)';
if(sC>=bC&&sC>=gC&&sC>10)borderColor='rgba(102,187,106,0.55)';
else if(bC>=sC&&bC>=gC&&bC>10)borderColor='rgba(255,179,0,0.55)';
else if(gC>10)borderColor='rgba(239,83,80,0.45)';
card.style.borderColor=borderColor;}

// #2 LCD — home consumption on inverter display
const lcd=this._$('lcd');if(lcd){const a=Math.abs(loadF??0);lcd.textContent=a>=1000?(a/1000).toFixed(1)+'kW':a.toFixed(0)+'W';}
}

getGridOptions(){return this._c.compact?{columns:12,rows:8,min_columns:6,min_rows:4}:{columns:12,rows:10,min_columns:6,min_rows:6};}
getCardSize(){return this._c.compact?4:6;}
}

customElements.define('xpower-flow-card',XPowerFlowCard);
window.customCards=window.customCards||[];
window.customCards.push({type:'xpower-flow-card',name:'xPower Flow Card',description:'Universal power flow card for solar hybrid inverters — Deye, Sunsynk, Huawei, Fronius, Growatt, Victron, SolarEdge',preview:true,documentationURL:'https://github.com/BTNBx/xPower-Flow-Card'});
console.info('%c XPOWER-FLOW %c v'+V+' ','background:#7C4DFF;color:white;font-weight:bold;border-radius:4px 0 0 4px;padding:2px 6px','background:#333;color:white;border-radius:0 4px 4px 0;padding:2px 6px');
