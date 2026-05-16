// xPower Flow Card — Modern power flow card for solar hybrid inverters
// Copyright (C) 2025 BTNBx
// Licensed under GPL-3.0 — see LICENSE file
const V='1.1.7';

/* ═══════════════════════════════════════
   xPower Flow Card — i18n
   ═══════════════════════════════════════ */
const LANG={
  pt:{solar:'SOLAR',grid:'REDE',load:'CASA',battery:'BATERIA',inverter:'Inversor',
      autarky:'Autossufici\u00EAncia',runtime_to:'at\u00E9',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'CASA (24h)',grid24:'REDE (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Idioma',editor_entities:'Entidades',
      editor_options:'Op\u00E7\u00F5es',editor_soc:'SOC M\u00EDnimo (%)',
      editor_capacity:'Capacidade Bateria (Wh)',editor_inverter_name:'Nome Inversor',
      editor_preset:'Marca / Preset',editor_polarity:'Polaridade',
      editor_bat_pol:'Bateria: negativo =',editor_grid_pol:'Rede: positivo =',
      charging:'carga',discharging:'descarga',importing:'importar',exporting:'exportar'},
  en:{solar:'SOLAR',grid:'GRID',load:'HOME',battery:'BATTERY',inverter:'Inverter',
      autarky:'Self-sufficiency',runtime_to:'to',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HOME (24h)',grid24:'GRID (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Language',editor_entities:'Entities',
      editor_options:'Options',editor_soc:'Shutdown SOC (%)',
      editor_capacity:'Battery Capacity (Wh)',editor_inverter_name:'Inverter Name',
      editor_preset:'Brand / Preset',editor_polarity:'Polarity',
      editor_bat_pol:'Battery: negative =',editor_grid_pol:'Grid: positive =',
      charging:'charging',discharging:'discharging',importing:'import',exporting:'export'},
  de:{solar:'SOLAR',grid:'NETZ',load:'HAUS',battery:'BATTERIE',inverter:'Wechselrichter',
      autarky:'Autarkie',runtime_to:'bis',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HAUS (24h)',grid24:'NETZ (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Sprache',editor_entities:'Entit\u00E4ten',
      editor_options:'Optionen',editor_soc:'Abschalt-SOC (%)',
      editor_capacity:'Batteriekapazit\u00E4t (Wh)',editor_inverter_name:'Wechselrichter Name',
      editor_preset:'Marke / Vorlage',editor_polarity:'Polarit\u00E4t',
      editor_bat_pol:'Batterie: negativ =',editor_grid_pol:'Netz: positiv =',
      charging:'Laden',discharging:'Entladen',importing:'Bezug',exporting:'Einspeisung'},
  fr:{solar:'SOLAIRE',grid:'R\u00C9SEAU',load:'MAISON',battery:'BATTERIE',inverter:'Onduleur',
      autarky:'Autosuffisance',runtime_to:'jusqu\u0027\u00E0',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAIRE (24h)',load24:'MAISON (24h)',grid24:'R\u00C9SEAU (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Langue',editor_entities:'Entit\u00E9s',
      editor_options:'Options',editor_soc:'SOC Minimum (%)',
      editor_capacity:'Capacit\u00E9 Batterie (Wh)',editor_inverter_name:'Nom Onduleur',
      editor_preset:'Marque / Pr\u00E9r\u00E9glage',editor_polarity:'Polarit\u00E9',
      editor_bat_pol:'Batterie: n\u00E9gatif =',editor_grid_pol:'R\u00E9seau: positif =',
      charging:'charge',discharging:'d\u00E9charge',importing:'importation',exporting:'exportation'},
  es:{solar:'SOLAR',grid:'RED',load:'HOGAR',battery:'BATER\u00CDAS',inverter:'Inversor',
      autarky:'Autosuficiencia',runtime_to:'hasta',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HOGAR (24h)',grid24:'RED (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Idioma',editor_entities:'Entidades',
      editor_options:'Opciones',editor_soc:'SOC M\u00EDnimo (%)',
      editor_capacity:'Capacidad Bater\u00EDa (Wh)',editor_inverter_name:'Nombre Inversor',
      editor_preset:'Marca / Preset',editor_polarity:'Polaridad',
      editor_bat_pol:'Bater\u00EDa: negativo =',editor_grid_pol:'Red: positivo =',
      charging:'carga',discharging:'descarga',importing:'importaci\u00F3n',exporting:'exportaci\u00F3n'},
  it:{solar:'SOLARE',grid:'RETE',load:'CASA',battery:'BATTERIA',inverter:'Inverter',
      autarky:'Autosufficienza',runtime_to:'fino a',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLARE (24h)',load24:'CASA (24h)',grid24:'RETE (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Lingua',editor_entities:'Entit\u00E0',
      editor_options:'Opzioni',editor_soc:'SOC Minimo (%)',
      editor_capacity:'Capacit\u00E0 Batteria (Wh)',editor_inverter_name:'Nome Inverter',
      editor_preset:'Marca / Preset',editor_polarity:'Polarit\u00E0',
      editor_bat_pol:'Batteria: negativo =',editor_grid_pol:'Rete: positivo =',
      charging:'carica',discharging:'scarica',importing:'importazione',exporting:'esportazione'},
  nl:{solar:'ZONNE',grid:'NET',load:'HUIS',battery:'BATTERIJ',inverter:'Omvormer',
      autarky:'Zelfvoorziening',runtime_to:'tot',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'ZONNE (24h)',load24:'HUIS (24h)',grid24:'NET (24h)',
      unavailable:'--',
      editor_title:'xPower Flow Card',editor_lang:'Taal',editor_entities:'Entiteiten',
      editor_options:'Opties',editor_soc:'Uitschakel-SOC (%)',
      editor_capacity:'Batterijcapaciteit (Wh)',editor_inverter_name:'Omvormer Naam',
      editor_preset:'Merk / Preset',editor_polarity:'Polariteit',
      editor_bat_pol:'Batterij: negatief =',editor_grid_pol:'Net: positief =',
      charging:'laden',discharging:'ontladen',importing:'import',exporting:'export'},
  pl:{solar:'SOLAR',grid:'SIE\u0106',load:'DOM',battery:'BATERIA',inverter:'Falownik',
      autarky:'Samowystarczalno\u015B\u0107',runtime_to:'do',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'DOM (24h)',grid24:'SIE\u0106 (24h)',
      unavailable:'--',
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
    bat_polarity:'negative',grid_polarity:'positive',
    e:{solar:'sensor.pv_power',battery:'sensor.battery_power',soc:'sensor.battery_soc',
       grid:'sensor.grid_power',load:'sensor.ac_consumption',grid_voltage:'sensor.grid_voltage',
       battery_voltage:'sensor.battery_voltage',pv_voltage:'sensor.pv_voltage',
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
  bat_polarity:'negative',grid_polarity:'positive',
  shutdown_soc:20,battery_capacity:5120,language:'pt',
  inverter_name:'DEYE',
  weather_temp:'',weather_humidity:'',
  theme:'auto'
};

const ENTITY_FIELDS=[
  {key:'solar',label:'Solar Power'},{key:'battery',label:'Battery Power'},
  {key:'soc',label:'Battery SOC'},{key:'grid',label:'Grid Power'},
  {key:'load',label:'Load Power'},{key:'grid_voltage',label:'Grid Voltage'},
  {key:'battery_voltage',label:'Battery Voltage'},{key:'pv_voltage',label:'PV Voltage'},
  {key:'temperature',label:'Inverter Temp.'},{key:'battery_temperature',label:'Battery Temp.'},
  {key:'frequency',label:'Grid Frequency'},{key:'grid_status',label:'Grid Status'},
  {key:'daily_solar',label:'Daily Solar'},{key:'daily_import',label:'Daily Import'},
  {key:'daily_export',label:'Daily Export'},{key:'daily_load',label:'Daily Load'},
  {key:'daily_charge',label:'Daily Charge'},{key:'daily_discharge',label:'Daily Discharge'},
  {key:'weather_temp',label:'Weather Temp.'},{key:'weather_humidity',label:'Weather Humidity'}
];

const HIST_POINTS=48;
const HIST_INTERVAL=5*60*1000;
const RUNTIME_MIN_W=50;
const ANIM_MAX_W=6000;
const ANIM_MIN_SPD=1.5;
const ANIM_MAX_SPD=3.5;

class XPowerFlowCardEditor extends HTMLElement{
  constructor(){super();this._config={};this._hass=null;this._onchange=this._fire.bind(this);}
  _esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  setConfig(config){this._config={...DEFAULTS,...config};this._render();}
  set hass(hass){this._hass=hass;}
  disconnectedCallback(){const el=this.querySelector('.editor');if(el)el.removeEventListener('change',this._onchange);}

  _fire(e){
    if(!e.target.matches('input,select'))return;
    const cfg={...this._config};
    cfg.language=this.querySelector('#ed-lang').value;
    cfg.inverter_name=this.querySelector('#ed-inv').value;
    cfg.theme=this.querySelector('#ed-theme').value;
    cfg.bat_polarity=this.querySelector('#ed-bpol').value;
    cfg.grid_polarity=this.querySelector('#ed-gpol').value;
    const socVal=parseInt(this.querySelector('#ed-ssoc').value);
    cfg.shutdown_soc=isNaN(socVal)?20:socVal;
    const capVal=parseInt(this.querySelector('#ed-cap').value);
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
    ENTITY_FIELDS.forEach(f=>{const v=this.querySelector('#ed-'+f.key);if(v)cfg[f.key]=v.value;});
    this._config=cfg;
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:cfg},bubbles:true,composed:true}));
  }

  _render(){
    const el=this.querySelector('.editor');if(el)el.removeEventListener('change',this._onchange);
    const L=LANG[this._config.language||'pt']||LANG.pt;
    const c=this._config;
    const selStyle='padding:8px;border:1px solid var(--divider-color);border-radius:4px;background:var(--card-background-color);color:var(--primary-text-color);width:100%;font-size:14px';
    this.innerHTML=`
    <style>
      .editor{font-family:-apple-system,sans-serif;padding:16px}
      .editor h3{margin:0 0 12px;font-size:14px;font-weight:600;color:var(--primary-text-color);border-bottom:1px solid var(--divider-color);padding-bottom:8px}
      .editor h4{margin:16px 0 8px;font-size:12px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;letter-spacing:0.05em}
      .field{margin-bottom:8px}
      .field label{display:block;font-size:12px;color:var(--secondary-text-color);margin-bottom:4px}
      .field input,.field select{width:100%;padding:8px;border:1px solid var(--divider-color);border-radius:4px;background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;box-sizing:border-box}
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
      </div>

      <h4>${L.editor_polarity}</h4>
      <div class="row">
        <div class="field">
          <label>${L.editor_bat_pol}</label>
          <select id="ed-bpol" style="${selStyle}">
            <option value="negative" ${c.bat_polarity==='negative'?'selected':''}>${L.charging} (Deye, Sunsynk, Victron)</option>
            <option value="positive" ${c.bat_polarity==='positive'?'selected':''}>${L.charging} (Huawei, Fronius, SolarEdge)</option>
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

      <h4>${L.editor_entities}</h4>
      <div class="grid">
        ${ENTITY_FIELDS.map(f=>`
          <div class="field">
            <label>${f.label}</label>
            <input type="text" id="ed-${f.key}" value="${this._esc(c[f.key])}" placeholder="${this._esc(PRESETS[c.preset||'deye']?.e[f.key])}">
          </div>
        `).join('')}
      </div>
    </div>`;
    this.querySelector('.editor').addEventListener('change',this._onchange);
  }
}
customElements.define('xpower-flow-card-editor',XPowerFlowCardEditor);

class XPowerFlowCard extends HTMLElement{
constructor(){super();this.attachShadow({mode:'open'});this._c={};this._h=null;this._prev={solar:0,bat:0,grid:0,load:0};this._hist={solar:[],load:[],grid:[]};this._fs={};this._spds={};this._histTimer=null;this._histLastLoad=0;this._histLoading=false;}

static getConfigElement(){return document.createElement('xpower-flow-card-editor');}
static getStubConfig(){return{...DEFAULTS};}

setConfig(c){
  this._c={};
  Object.keys(DEFAULTS).forEach(k=>{this._c[k]=c[k]!==undefined?c[k]:DEFAULTS[k];});
  this._lang=LANG[this._c.language]||LANG.pt;
  this._render();
}

connectedCallback(){
  this._histTimer=setInterval(()=>{if(this._h)this._loadHistory();},HIST_INTERVAL);
}

disconnectedCallback(){
  if(this._histTimer){clearInterval(this._histTimer);this._histTimer=null;}
}

set hass(h){
  this._h=h;
  const t=this._c.theme||'auto';
  if(t==='auto'){const dark=h.themes?.darkMode!==false;this.classList.toggle('light',!dark);}
  else{this.classList.toggle('light',t==='light');}
  const now=Date.now();
  if(now-this._histLastLoad>HIST_INTERVAL){this._histLastLoad=now;this._loadHistory();}
  this._update();
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
_arrow(c,p){if(c===null)return '';const d=Math.abs(c)-Math.abs(p);return d>5?'\u25B4 ':d<-5?'\u25BE ':'\u25B8 ';}

_norm(raw,type){
  if(raw===null)return null;
  if(type==='bat'&&this._c.bat_polarity==='positive')return raw*-1;
  if(type==='grid'&&this._c.grid_polarity==='negative')return raw*-1;
  return raw;
}

async _loadHistory(){if(this._histLoading)return;this._histLoading=true;try{const now=new Date();const start=new Date(now.getTime()-24*60*60*1000);const iso=encodeURIComponent(start.toISOString());const entities=encodeURIComponent([this._c.solar,this._c.load,this._c.grid].filter(Boolean).join(','));if(!entities)return;const url='history/period/'+iso+'?filter_entity_id='+entities+'&minimal_response&no_attributes&significant_changes_only';const res=await this._h.callApi('GET',url);if(!res||!res.length)return;const downsample=(arr,n)=>{if(!arr||!arr.length)return[];let src=arr;if(src.length>10000){const step=Math.ceil(src.length/5000);src=src.filter((_,i)=>i%step===0);}const out=[];for(let i=0;i<n;i++){const s=Math.floor(i*src.length/n);const e=Math.floor((i+1)*src.length/n);let sum=0,cnt=0;for(let j=s;j<e;j++){const v=parseFloat(src[j].state);if(!isNaN(v)){sum+=Math.abs(v);cnt++;}}if(cnt>0)out.push(sum/cnt);else out.push(0);}const sm=[];for(let i=0;i<out.length;i++){const p=i>0?out[i-1]:out[i];const nx=i<out.length-1?out[i+1]:out[i];sm.push((p+out[i]*2+nx)/4);}return sm;};for(const series of res){if(!series.length)continue;const eid=series[0].entity_id;const pts=downsample(series,HIST_POINTS);if(eid===this._c.solar)this._hist.solar=pts;else if(eid===this._c.load)this._hist.load=pts;else if(eid===this._c.grid)this._hist.grid=pts;}this._drawSparks();}catch(e){console.warn('xPower history:',e);}finally{this._histLoading=false;}}

_render(){const L=this._lang;const INV=this._c.inverter_name||'';const s=this.shadowRoot;s.innerHTML=`<style>
:host{--solar:#FFB300;--battery:#7C4DFF;--grid:#42A5F5;--load:#26C6DA;--green:#66BB6A;--red:#EF5350;--orange:#FFA726;--t1:rgba(255,255,255,0.92);--t3:rgba(255,255,255,0.45)}
:host(.light){--t1:rgba(0,0,0,0.85);--t3:rgba(0,0,0,0.45)}
:host(.light) ha-card{background:rgba(255,255,255,0.92);border-color:rgba(0,0,0,0.08);box-shadow:0 2px 20px rgba(0,0,0,0.08)}
:host(.light) ha-card::before{background:linear-gradient(90deg,transparent,rgba(124,77,255,0.12),transparent)}
:host(.light) .fl{stroke:rgba(0,0,0,0.06)}
:host(.light) .ib{fill:rgba(0,0,0,0.03);stroke:rgba(0,0,0,0.08)}
:host(.light) .sb{background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.06)}
:host(.light) .sl{opacity:0.4}
ha-card{background:rgba(12,14,24,0.92);border:1px solid rgba(255,255,255,0.06);border-radius:20px;box-shadow:0 2px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04);padding:6px 8px 14px;position:relative;overflow:hidden;font-family:-apple-system,sans-serif;--ha-card-background:transparent;--ha-card-border-width:0;--ha-card-border-radius:20px;--ha-card-box-shadow:none}
ha-card::before{content:'';position:absolute;top:-1px;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,77,255,0.25),transparent)}
svg{width:100%;height:auto;display:block}
.fl{fill:none;stroke:rgba(255,255,255,0.04);stroke-width:2;stroke-linecap:round}
.fa{fill:none;stroke-width:3;stroke-linecap:round;stroke-dasharray:100 100}
.fd{animation:fD var(--spd,3s) linear infinite}.fu{animation:fU var(--spd,3s) linear infinite}.fr{animation:fR var(--spd,3s) linear infinite}.fL{animation:fL var(--spd,3s) linear infinite}
@keyframes ledBlink{0%,100%{opacity:1}50%{opacity:0.2}}
.led-on{animation:ledBlink 1.5s ease-in-out infinite}
@keyframes fR{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}@keyframes fL{from{stroke-dashoffset:0}to{stroke-dashoffset:200}}@keyframes fD{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}@keyframes fU{from{stroke-dashoffset:0}to{stroke-dashoffset:200}}
.vm{fill:var(--t1);font-size:24px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.vl{fill:var(--t3);font-size:10px;font-weight:600;letter-spacing:0.14em;text-anchor:middle;dominant-baseline:middle}
.vs{fill:var(--t1);font-size:22px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
.vd{fill:var(--t3);font-size:12px;font-weight:500;text-anchor:middle;dominant-baseline:middle}
.vc{fill:var(--t3);font-size:9.5px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.ib{fill:rgba(255,255,255,0.02);stroke:rgba(255,255,255,0.06);stroke-width:1}
.il{fill:rgba(255,255,255,0.35);font-size:12px;font-weight:600;letter-spacing:0.05em;text-anchor:middle;dominant-baseline:middle}
.au{fill:white;font-size:9px;font-weight:600;letter-spacing:0.04em;text-anchor:middle;dominant-baseline:middle}
.au-pill{rx:8;ry:8;transition:fill 0.5s ease}
.wt{fill:var(--t3);font-size:11px;font-weight:500;text-anchor:start;dominant-baseline:middle;font-family:-apple-system,sans-serif}
.wb{fill:none;stroke:var(--t3);stroke-width:0.5;rx:4;ry:4;opacity:0.4}
.sr{display:flex;gap:6px;margin-top:16px}
.sb{flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:10px 10px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden}
.sb-header{display:flex;justify-content:space-between;align-items:baseline}
.sl{font-size:7px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.3}
.sv{font-size:11px;font-weight:600;opacity:0.8}
.ss .sv{color:var(--green)}.sc .sv{color:var(--load)}.sg .sv{color:var(--grid)}
.sb svg{width:100%;height:40px;display:block;margin-top:4px}
.sb path{stroke-linecap:round;stroke-linejoin:round}
.sb{position:relative;cursor:crosshair}
.sb-tip{position:absolute;top:2px;right:4px;font-size:10px;font-weight:600;opacity:0;transition:opacity 0.15s;pointer-events:none;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.7)}
.sb-tip.show{opacity:1}
.sb line.cursor{stroke:rgba(255,255,255,0.3);stroke-width:1;stroke-dasharray:2 2;display:none}
.sb circle.cursor-dot{fill:rgba(255,255,255,0.8);display:none}
.ss #hs{fill:none;stroke:rgba(102,187,106,0.7);stroke-width:1.2}.sc #hl{fill:none;stroke:rgba(38,198,218,0.7);stroke-width:1.2}.sg #hg{fill:none;stroke:rgba(66,165,245,0.7);stroke-width:1.2}
.ss #hsa{fill:rgba(102,187,106,0.12);stroke:none}.sc #hla{fill:rgba(38,198,218,0.12);stroke:none}.sg #hga{fill:rgba(66,165,245,0.12);stroke:none}
</style>
<ha-card><svg viewBox="0 0 526 520"><defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g transform="translate(25.5,10) scale(0.95)">
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
<g><g transform="translate(250,38) scale(1.65) translate(-250,-38)"><circle cx="250" cy="38" r="9" fill="var(--solar)" opacity="0.85"/><line x1="250" y1="25" x2="250" y2="21" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="250" y1="51" x2="250" y2="55" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="237" y1="38" x2="233" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="263" y1="38" x2="267" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="240.8" y1="28.8" x2="238" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="47.2" x2="262" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="28.8" x2="262" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="240.8" y1="47.2" x2="238" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/></g><text x="250" y="82" class="vm" style="fill:var(--green)" id="vs"></text><text x="250" y="-2" class="vl">${L.solar}</text><text x="310" y="30" class="vc" id="ds" text-anchor="start"></text><text x="320" y="44" class="vc" id="pv" text-anchor="start"></text></g>
<g><g transform="translate(250,225) scale(1.65)"><rect x="-18" y="-24" width="36" height="48" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/><rect x="-18" y="-24" width="36" height="5" rx="2" fill="rgba(255,255,255,0.12)"/><rect x="-12" y="-15" width="24" height="12" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="0.7"/><rect x="-8" y="-12" width="16" height="6" rx="1" fill="rgba(102,187,106,0.4)"/><circle id="led1" cx="-6" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led2" cx="-2" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led3" cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><circle id="led4" cx="6" cy="2" r="1.2" fill="rgba(255,255,255,0.12)"/><path id="bolt" d="M-6,9 L-8,15 L-4,15 L-6,21" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/><rect x="2" y="12" width="10" height="3" rx="0.5" fill="rgba(255,255,255,0.1)"/><rect x="2" y="17" width="10" height="3" rx="0.5" fill="rgba(255,255,255,0.1)"/></g>${INV?'<text x="250" y="272" class="il">'+INV+'</text>':''}<text x="296" y="264" class="vc" id="tp" text-anchor="start"></text></g>
<g><g transform="translate(66,225) scale(1.65) translate(-66,-196)"><rect x="64" y="181" width="4" height="30" rx="1" fill="var(--red)" opacity="0.7"/><rect x="54" y="183" width="24" height="3" rx="1" fill="var(--red)" opacity="0.6"/><rect x="57" y="192" width="18" height="2.5" rx="1" fill="var(--red)" opacity="0.5"/><path d="M60,211 L64,199 L68,199 L72,211" fill="var(--red)" opacity="0.4"/><circle cx="56" cy="184" r="1.5" fill="var(--red)" opacity="0.8"/><circle cx="76" cy="184" r="1.5" fill="var(--red)" opacity="0.8"/><circle cx="58" cy="193" r="1.2" fill="var(--red)" opacity="0.7"/><circle cx="74" cy="193" r="1.2" fill="var(--red)" opacity="0.7"/><line x1="54" y1="184" x2="46" y2="181" stroke="var(--red)" stroke-width="0.8" opacity="0.3"/><line x1="78" y1="184" x2="86" y2="181" stroke="var(--red)" stroke-width="0.8" opacity="0.3"/></g><text x="66" y="268" class="vm" style="fill:var(--red)" id="vg"></text><text x="66" y="190" class="vl">${L.grid}</text><text x="66" y="286" class="vc" id="gv"></text><text x="66" y="300" class="vd" id="dg"></text></g>
<g><g transform="translate(434,225) scale(1.65) translate(-434,-188)"><path d="M416,188 L434,174 L452,188 Z" fill="var(--load)" opacity="0.8"/><rect x="420" y="187" width="28" height="18" rx="1" fill="var(--load)" opacity="0.6"/><rect x="430" y="195" width="8" height="10" rx="1" fill="rgba(0,0,0,0.3)"/><rect x="422" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="440" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="441" y="176" width="5" height="8" rx="1" fill="var(--load)" opacity="0.5"/></g><text x="434" y="268" class="vm" style="fill:var(--load)" id="vl"></text><text x="434" y="190" class="vl">${L.load}</text><text x="434" y="288" class="vd" id="dl"></text></g>
<g><g transform="translate(250,400) scale(1.70) translate(-250,-351)"><rect x="232" y="341" width="32" height="20" rx="3" fill="var(--battery)" opacity="0.75"/><rect x="264" y="345.5" width="6" height="11" rx="2" fill="var(--battery)" opacity="0.9"/><rect x="235" y="344" width="26" height="14" rx="1.5" fill="rgba(0,0,0,0.35)"/><rect id="bl" x="235" y="344" width="26" height="14" rx="1.5" fill="var(--battery)" opacity="0.45"/></g><text x="250" y="440" class="vm" style="fill:var(--solar)" id="vb"></text><text x="250" y="462" class="vs" id="vc"></text><text x="250" y="372" class="vl">${L.battery}</text><text x="310" y="394" class="vc" id="bv" text-anchor="start"></text><text x="310" y="406" class="vc" id="bt" text-anchor="start"></text><text x="250" y="483" class="vd" id="db"></text><text x="250" y="498" class="vc" id="br" style="fill:var(--t1)"></text></g>
<rect id="ap" x="185" y="512" width="130" height="16" class="au-pill" fill="var(--green)"/><text x="250" y="521" class="au" id="va"></text>
</g></svg>
<div class="sr">
<div class="sb sg"><div class="sb-header"><span class="sl">${L.grid24}</span><span class="sv" id="hz"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hga"/><path id="hg"/><line class="cursor" id="cg" x1="0" y1="0" x2="0" y2="40"/><circle class="cursor-dot" id="dg2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="tg"></span></div>
<div class="sb ss"><div class="sb-header"><span class="sl">${L.solar24}</span><span class="sv" id="hv"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hsa"/><path id="hs"/><line class="cursor" id="cs" x1="0" y1="0" x2="0" y2="40"/><circle class="cursor-dot" id="ds2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="ts"></span></div>
<div class="sb sc"><div class="sb-header"><span class="sl">${L.load24}</span><span class="sv" id="hx"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hla"/><path id="hl"/><line class="cursor" id="cl" x1="0" y1="0" x2="0" y2="40"/><circle class="cursor-dot" id="dl2" cx="0" cy="0" r="3"/></svg><span class="sb-tip" id="tl"></span></div>
</div></ha-card>`;this._setupTooltips();}

_$(id){return this.shadowRoot.getElementById(id);}
_setupTooltips(){
  const self=this;
  const setup=(svgParent,cursorId,dotId,tipId,dataKey,color)=>{
    const svg=self.shadowRoot.querySelector('#'+cursorId)?.closest('svg');
    if(!svg)return;
    const cursor=self._$(cursorId);const dot=self._$(dotId);const tip=self._$(tipId);
    if(!cursor||!dot||!tip)return;
    svg.addEventListener('mousemove',(e)=>{
      const data=self._hist[dataKey];if(!data||!data.length)return;
      const rect=svg.getBoundingClientRect();
      const x=(e.clientX-rect.left)/rect.width;
      const idx=Math.min(Math.max(Math.round(x*(data.length-1)),0),data.length-1);
      const val=data[idx];const svgX=x*200;
      const max=Math.max(...data)||1;const svgY=2+(1-val/max)*36;
      cursor.setAttribute('x1',svgX);cursor.setAttribute('x2',svgX);cursor.style.display='';
      dot.setAttribute('cx',svgX);dot.setAttribute('cy',svgY);dot.style.display='';dot.setAttribute('fill',color);
      const minsAgo=Math.round((1-idx/(data.length-1))*24*60);
      const when=new Date(Date.now()-minsAgo*60000);
      const hh=String(when.getHours()).padStart(2,'0');const mm=String(when.getMinutes()).padStart(2,'0');
      tip.textContent=(val>=1000?(val/1000).toFixed(1)+' kW':val.toFixed(0)+' W')+' · '+hh+':'+mm;
      tip.style.color=color;tip.classList.add('show');
    });
    svg.addEventListener('mouseleave',()=>{
      cursor.style.display='none';dot.style.display='none';tip.classList.remove('show');
    });
  };
  setup(null,'cg','dg2','tg','grid','#42A5F5');
  setup(null,'cs','ds2','ts','solar','#66BB6A');
  setup(null,'cl','dl2','tl','load','#26C6DA');
}
_spd(p){const a=Math.abs(p);if(a<10)return 0;let s=Math.max(ANIM_MIN_SPD,ANIM_MAX_SPD-(a/ANIM_MAX_W)*(ANIM_MAX_SPD-ANIM_MIN_SPD));if(a>=3000)s*=0.4;else if(a>=2000)s*=0.6;else if(a>=1000)s*=0.8;return s;}
_sf(el,id,p,d,c,o){if(Math.abs(p)<10){el.style.display='none';this._fs[id]=null;return;}el.style.display='';el.setAttribute('stroke',c);el.setAttribute('opacity',o);const newSpd=this._spd(p).toFixed(1);const oldSpd=this._spds[id];if(!oldSpd||Math.abs(parseFloat(newSpd)-parseFloat(oldSpd))/parseFloat(oldSpd)>0.1){this._spds[id]=newSpd;el.style.setProperty('--spd',newSpd+'s');}if(this._fs[id]!==d){this._fs[id]=d;el.setAttribute('class','fa '+d);}}
_spark(id,aid,data){const el=this._$(id);const af=this._$(aid);if(!el||!data.length)return;const w=200,h=40,py=2,max=Math.max(...data)||1;const pts=data.map((v,i)=>[(i/(data.length-1))*w,py+(1-v/max)*(h-py*2)]);if(pts.length<2)return;const tension=0.3;const cp=(p0,p1,p2,t)=>[p1[0]+(p2[0]-p0[0])*t,p1[1]+(p2[1]-p0[1])*t];let d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)];const p1=pts[i];const p2=pts[i+1];const p3=pts[Math.min(pts.length-1,i+2)];const c1=cp(p0,p1,p2,tension);const c2=[p2[0]-(p3[0]-p1[0])*tension,p2[1]-(p3[1]-p1[1])*tension];d+=' C'+c1[0].toFixed(1)+','+c1[1].toFixed(1)+' '+c2[0].toFixed(1)+','+c2[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);}el.setAttribute('d',d);if(af){af.setAttribute('d',d+'L'+w+','+h+'L0,'+h+'Z');}}
_drawSparks(){this._spark('hs','hsa',this._hist.solar);this._spark('hl','hla',this._hist.load);this._spark('hg','hga',this._hist.grid);}

_update(){if(!this._h||!this.shadowRoot.getElementById('vs'))return;
const c=this._c,L=this._lang;

const sol=this._gv(c.solar);
const bat=this._norm(this._gv(c.battery),'bat');
const soc=this._gv(c.soc);
const grid=this._norm(this._gv(c.grid),'grid');
const load=this._gv(c.load);
const temp=this._gv(c.temperature);
const gv=this._gv(c.grid_voltage);
const bv=this._gv(c.battery_voltage);
const pvv=this._gv(c.pv_voltage);
const freq=this._gv(c.frequency);

const p=this._prev;
this._$('vs').textContent=this._arrow(sol,p.solar)+this._fmt(sol);
this._$('vb').textContent=this._arrow(bat,p.bat)+this._fmt(bat!==null?Math.abs(bat):null);
this._$('vg').textContent=this._arrow(grid,p.grid)+this._fmt(grid!==null?Math.abs(grid):null);
this._$('vl').textContent=this._arrow(load,p.load)+this._fmt(load);
this._prev={solar:sol??0,bat:bat??0,grid:grid??0,load:load??0};

const socVal=soc??0;
this._$('vc').textContent=soc!==null?Math.round(soc)+'% | '+c.shutdown_soc+'%':L.unavailable;
this._$('bl').setAttribute('width',(26*(socVal/100)).toFixed(1));

if(temp!==null)this._$('tp').textContent=temp.toFixed(0)+'\u00B0C';else this._$('tp').textContent='';
if(pvv!==null)this._$('pv').textContent=pvv.toFixed(0)+'V';else this._$('pv').textContent='';
if(gv!==null&&freq!==null)this._$('gv').textContent=gv.toFixed(0)+'V \u00B7 '+freq.toFixed(1)+'Hz';else this._$('gv').textContent='';
if(bv!==null)this._$('bv').textContent=bv.toFixed(1)+'V';else this._$('bv').textContent='';
const bt=this._gv(c.battery_temperature);if(bt!==null)this._$('bt').textContent=bt.toFixed(0)+'\u00B0C';else this._$('bt').textContent='';

const dS=this._gv(c.daily_solar)??0,dI=this._gv(c.daily_import)??0,dE=this._gv(c.daily_export)??0,dL=this._gv(c.daily_load)??0,dC=this._gv(c.daily_charge)??0,dD=this._gv(c.daily_discharge)??0;
this._$('ds').textContent=L.daily+' '+this._fmtE(dS);
this._$('dg').textContent=L.import_+' '+this._fmtE(dI)+' '+L.export_+' '+this._fmtE(dE);
this._$('dl').textContent=L.daily+' '+this._fmtE(dL);
this._$('db').textContent=L.charge+' '+this._fmtE(dC)+' '+L.discharge+' '+this._fmtE(dD);

const solF=sol??0,batF=bat??0,gridF=grid??0,loadF=load??0;
this._sf(this._$('fs'),'s',solF,'fd','var(--green)','0.8');
if(Math.abs(gridF)>10)this._sf(this._$('fg'),'g',gridF,gridF>0?'fr':'fL',gridF>0?'var(--red)':'var(--green)','0.7');else this._$('fg').style.display='none';
const inSpds=[];if(solF>10)inSpds.push(this._spd(solF));if(gridF>10)inSpds.push(this._spd(Math.abs(gridF)));if(batF>10)inSpds.push(this._spd(batF));
const syncDelay=inSpds.length>0?Math.min(...inSpds)/2:0;
if(Math.abs(batF)>10){this._sf(this._$('fb'),'b',batF,batF<0?'fd':'fu',batF<0?'var(--green)':'var(--solar)','0.75');this._$('fb').style.animationDelay=batF<0?syncDelay.toFixed(2)+'s':'0s';}else{this._$('fb').style.display='none';}
const solContrib=solF>0?solF:0;const batContrib=batF>0?batF:0;const gridContrib=gridF>0?gridF:0;
let homeColor='var(--green)';
if(loadF>10){if(gridContrib>=solContrib&&gridContrib>=batContrib&&gridContrib>0)homeColor='var(--red)';else if(batContrib>=solContrib&&batContrib>0)homeColor='var(--battery)';else homeColor='var(--green)';}
this._sf(this._$('fh'),'h',loadF,'fr',homeColor,'0.75');
this._$('fh').style.animationDelay=syncDelay>0?syncDelay.toFixed(2)+'s':'0s';
this._$('fs').style.animationDelay='0s';
this._$('fg').style.animationDelay='0s';

const batCap=c.battery_capacity??5120;const shuSoc=c.shutdown_soc??20;
if(batF>RUNTIME_MIN_W&&socVal>shuSoc){
  const remWh=(socVal-shuSoc)/100*batCap;const hrs=remWh/batF;
  const totalMin=Math.round(hrs*60);const h=Math.floor(totalMin/60);const m=totalMin%60;
  const eta=new Date(Date.now()+totalMin*60000);const pad=v=>String(v).padStart(2,'0');
  this._$('br').textContent=h+'h '+pad(m)+'m \u25B8 '+shuSoc+'% @'+pad(eta.getHours())+':'+pad(eta.getMinutes());
}else{this._$('br').textContent='';}

const gridImp=gridF>0?gridF:0;
const au=loadF>0?Math.max(0,Math.min(100,((loadF-gridImp)/loadF)*100)):0;
this._$('va').textContent=L.autarky+': '+au.toFixed(0)+'%';
const ap=this._$('ap');if(ap){let pc;if(au>=80)pc='#66BB6A';else if(au>=50)pc='#FFA726';else if(au>=25)pc='#FF7043';else pc='#EF5350';ap.setAttribute('fill',pc);}

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

const bolt=this._$('bolt');if(bolt){if(solF>10){bolt.setAttribute('fill','var(--solar)');bolt.setAttribute('stroke','var(--solar)');bolt.setAttribute('stroke-width','0.8');bolt.setAttribute('opacity','0.9');bolt.setAttribute('filter','url(#glow)');}else{bolt.setAttribute('fill','rgba(255,255,255,0.15)');bolt.setAttribute('stroke','rgba(255,255,255,0.3)');bolt.setAttribute('stroke-width','0.5');bolt.setAttribute('opacity','1');bolt.removeAttribute('filter');}}

this._$('hv').textContent=this._fmt(sol)+' / '+this._fmtE(dS);
this._$('hx').textContent=this._fmt(load)+' / '+this._fmtE(dL);
this._$('hz').textContent=this._fmt(grid!==null?Math.abs(grid):null)+' / '+this._fmtE(dI+dE);
}

getCardSize(){return 6;}
}

customElements.define('xpower-flow-card',XPowerFlowCard);
window.customCards=window.customCards||[];
window.customCards.push({type:'xpower-flow-card',name:'xPower Flow Card',description:'Universal power flow card for solar hybrid inverters — Deye, Sunsynk, Huawei, Fronius, Growatt, Victron, SolarEdge',preview:true,documentationURL:'https://github.com/BTNBx/xPower-Flow-Card'});
console.info('%c XPOWER-FLOW %c v'+V+' ','background:#7C4DFF;color:white;font-weight:bold;border-radius:4px 0 0 4px;padding:2px 6px','background:#333;color:white;border-radius:0 4px 4px 0;padding:2px 6px');
