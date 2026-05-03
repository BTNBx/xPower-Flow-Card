const V='2.0.2';

/* ═══════════════════════════════════════
   DEYE FLOW CARD — i18n
   ═══════════════════════════════════════ */
const LANG={
  pt:{solar:'SOLAR',grid:'EDA',load:'CASA',battery:'BATERIA',inverter:'DEYE 6K',
      autarky:'Autossufici\u00EAncia',runtime_to:'at\u00E9',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'CASA (24h)',grid24:'EDA (24h)',
      editor_title:'xPower Flow Card',editor_lang:'Idioma',editor_entities:'Entidades',
      editor_options:'Op\u00E7\u00F5es',editor_soc:'SOC M\u00EDnimo (%)',
      editor_capacity:'Capacidade Bateria (Wh)',editor_inverter_name:'Nome Inversor'},
  en:{solar:'SOLAR',grid:'GRID',load:'HOME',battery:'BATTERY',inverter:'DEYE 6K',
      autarky:'Self-sufficiency',runtime_to:'to',
      charge:'\u25BE',discharge:'\u25B4',import_:'\u25BE',export_:'\u25B4',
      daily:'\u25B8',solar24:'SOLAR (24h)',load24:'HOME (24h)',grid24:'GRID (24h)',
      editor_title:'xPower Flow Card',editor_lang:'Language',editor_entities:'Entities',
      editor_options:'Options',editor_soc:'Shutdown SOC (%)',
      editor_capacity:'Battery Capacity (Wh)',editor_inverter_name:'Inverter Name'}
};

/* ═══════════════════════════════════════
   ENTITY DEFAULTS
   ═══════════════════════════════════════ */
const DEFAULTS={
  solar:'sensor.deye_pv1_power',battery:'sensor.deye_battery_power',
  soc:'sensor.deye_battery',grid:'sensor.deye_external_ct1_power',
  load:'sensor.deye_load_l1_power',grid_voltage:'sensor.deye_grid_l1_voltage',
  battery_voltage:'sensor.deye_battery_voltage',pv_voltage:'sensor.deye_pv1_voltage',
  temperature:'sensor.deye_temperature',frequency:'sensor.deye_output_frequency',
  grid_status:'binary_sensor.deye_grid',
  daily_solar:'sensor.deye_today_production',daily_import:'sensor.deye_today_energy_import',
  daily_export:'sensor.deye_today_energy_export',daily_load:'sensor.deye_today_load_consumption',
  daily_charge:'sensor.deye_today_battery_charge',daily_discharge:'sensor.deye_today_battery_discharge',
  battery_temperature:'sensor.deye_battery_temperature',
  shutdown_soc:20,battery_capacity:5120,language:'pt',inverter_name:'DEYE 6K'
};

/* Entity field definitions for editor */
const ENTITY_FIELDS=[
  {key:'solar',label:'Solar Power',icon:'mdi:solar-power'},
  {key:'battery',label:'Battery Power',icon:'mdi:battery'},
  {key:'soc',label:'Battery SOC',icon:'mdi:battery-heart-variant'},
  {key:'grid',label:'Grid Power',icon:'mdi:transmission-tower'},
  {key:'load',label:'Load Power',icon:'mdi:home-lightning-bolt'},
  {key:'grid_voltage',label:'Grid Voltage',icon:'mdi:flash'},
  {key:'battery_voltage',label:'Battery Voltage',icon:'mdi:flash-outline'},
  {key:'pv_voltage',label:'PV Voltage',icon:'mdi:solar-panel'},
  {key:'temperature',label:'Inverter Temperature',icon:'mdi:thermometer'},
  {key:'battery_temperature',label:'Battery Temperature',icon:'mdi:thermometer-low'},
  {key:'frequency',label:'Grid Frequency',icon:'mdi:sine-wave'},
  {key:'grid_status',label:'Grid Status',icon:'mdi:transmission-tower-export'},
  {key:'daily_solar',label:'Daily Solar',icon:'mdi:white-balance-sunny'},
  {key:'daily_import',label:'Daily Import',icon:'mdi:arrow-down'},
  {key:'daily_export',label:'Daily Export',icon:'mdi:arrow-up'},
  {key:'daily_load',label:'Daily Load',icon:'mdi:home'},
  {key:'daily_charge',label:'Daily Charge',icon:'mdi:battery-plus'},
  {key:'daily_discharge',label:'Daily Discharge',icon:'mdi:battery-minus'}
];

/* ═══════════════════════════════════════
   VISUAL EDITOR
   ═══════════════════════════════════════ */
class XPowerFlowCardEditor extends HTMLElement{
  constructor(){super();this._config={};this._hass=null;}
  setConfig(config){this._config={...DEFAULTS,...config};this._render();}
  set hass(hass){this._hass=hass;}

  _render(){
    const L=LANG[this._config.language||'pt']||LANG.pt;
    this.innerHTML=`
    <style>
      .editor{font-family:-apple-system,sans-serif;padding:16px}
      .editor h3{margin:0 0 12px;font-size:14px;font-weight:600;color:var(--primary-text-color);border-bottom:1px solid var(--divider-color);padding-bottom:8px}
      .editor h4{margin:16px 0 8px;font-size:12px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;letter-spacing:0.05em}
      .field{margin-bottom:8px}
      .field label{display:block;font-size:12px;color:var(--secondary-text-color);margin-bottom:4px}
      .field ha-entity-picker,.field ha-select,.field input{width:100%}
      .field input{padding:8px;border:1px solid var(--divider-color);border-radius:4px;background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;box-sizing:border-box}
      .row{display:flex;gap:12px}
      .row .field{flex:1}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    </style>
    <div class="editor">
      <h3>${L.editor_title}</h3>

      <div class="row">
        <div class="field">
          <label>${L.editor_lang}</label>
          <select id="ed-lang" style="padding:8px;border:1px solid var(--divider-color);border-radius:4px;background:var(--card-background-color);color:var(--primary-text-color);width:100%">
            <option value="pt" ${this._config.language==='pt'?'selected':''}>Portugu\u00EAs</option>
            <option value="en" ${this._config.language==='en'?'selected':''}>English</option>
          </select>
        </div>
        <div class="field">
          <label>${L.editor_inverter_name}</label>
          <input type="text" id="ed-inv" value="${this._config.inverter_name||'DEYE 6K'}">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>${L.editor_soc}</label>
          <input type="number" id="ed-soc" min="0" max="100" value="${this._config.shutdown_soc||20}">
        </div>
        <div class="field">
          <label>${L.editor_capacity}</label>
          <input type="number" id="ed-cap" min="0" value="${this._config.battery_capacity||5120}">
        </div>
      </div>

      <h4>${L.editor_entities}</h4>
      <div class="grid">
        ${ENTITY_FIELDS.map(f=>`
          <div class="field">
            <label>${f.label}</label>
            <input type="text" id="ed-${f.key}" value="${this._config[f.key]||DEFAULTS[f.key]||''}" placeholder="${DEFAULTS[f.key]||''}">
          </div>
        `).join('')}
      </div>
    </div>`;

    // Bind events
    const fire=()=>{
      const cfg={...this._config};
      cfg.language=this.querySelector('#ed-lang').value;
      cfg.inverter_name=this.querySelector('#ed-inv').value;
      cfg.shutdown_soc=parseInt(this.querySelector('#ed-soc').value)||20;
      cfg.battery_capacity=parseInt(this.querySelector('#ed-cap').value)||5120;
      ENTITY_FIELDS.forEach(f=>{
        const v=this.querySelector('#ed-'+f.key).value;
        if(v)cfg[f.key]=v;
      });
      this._config=cfg;
      const ev=new CustomEvent('config-changed',{detail:{config:cfg},bubbles:true,composed:true});
      this.dispatchEvent(ev);
    };
    this.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',fire));
  }
}
customElements.define('xpower-flow-card-editor',XPowerFlowCardEditor);

/* ═══════════════════════════════════════
   MAIN CARD
   ═══════════════════════════════════════ */
class XPowerFlowCard extends HTMLElement{
constructor(){super();this.attachShadow({mode:'open'});this._c={};this._h=null;this._prev={solar:0,bat:0,grid:0,load:0};this._hist={solar:[],load:[],grid:[]};this._fs={};this._HL=48;this._histLoaded=false;}

static getConfigElement(){return document.createElement('xpower-flow-card-editor');}
static getStubConfig(){return{...DEFAULTS};}

setConfig(c){
  this._c={};
  Object.keys(DEFAULTS).forEach(k=>{this._c[k]=c[k]||DEFAULTS[k];});
  this._lang=LANG[this._c.language]||LANG.pt;
  this._render();
}

set hass(h){this._h=h;if(!this._histLoaded){this._histLoaded=true;this._loadHistory();}this._update();}
_gv(e){if(!this._h||!this._h.states[e])return 0;const v=parseFloat(this._h.states[e].state);return isNaN(v)?0:v;}
_gs(e){return this._h&&this._h.states[e]?this._h.states[e].state:'';}
_fmt(v){const a=Math.abs(v);return a>=1000?(a/1000).toFixed(1)+' kW':a.toFixed(0)+' W';}
_fmtE(v){return v.toFixed(1)+' kWh';}
_arrow(c,p){const d=Math.abs(c)-Math.abs(p);return d>5?'\u25B4 ':d<-5?'\u25BE ':'\u25B8 ';}

async _loadHistory(){try{const now=new Date();const start=new Date(now.getTime()-24*60*60*1000);const iso=start.toISOString();const entities=this._c.solar+','+this._c.load+','+this._c.grid;const url='history/period/'+iso+'?filter_entity_id='+entities+'&minimal_response&no_attributes&significant_changes_only';const res=await this._h.callApi('GET',url);if(!res||!res.length)return;const downsample=(arr,n)=>{if(!arr||!arr.length)return[];const step=Math.max(1,Math.floor(arr.length/n));const out=[];for(let i=0;i<n;i++){const s=Math.floor(i*arr.length/n);const e=Math.floor((i+1)*arr.length/n);let sum=0,cnt=0;for(let j=s;j<e;j++){const v=parseFloat(arr[j].state);if(!isNaN(v)){sum+=Math.abs(v);cnt++;}}if(cnt>0)out.push(sum/cnt);else out.push(0);}const sm=[];for(let i=0;i<out.length;i++){const p=i>0?out[i-1]:out[i];const nx=i<out.length-1?out[i+1]:out[i];sm.push((p+out[i]*2+nx)/4);}return sm;};for(const series of res){if(!series.length)continue;const eid=series[0].entity_id;const pts=downsample(series,this._HL);if(eid===this._c.solar)this._hist.solar=pts;else if(eid===this._c.load)this._hist.load=pts;else if(eid===this._c.grid)this._hist.grid=pts;}this._drawSparks();}catch(e){console.warn('xPower history:',e);}}

_render(){const L=this._lang;const INV=this._c.inverter_name||L.inverter;const s=this.shadowRoot;s.innerHTML=`<style>
:host{--solar:#FFB300;--battery:#7C4DFF;--grid:#42A5F5;--load:#26C6DA;--green:#66BB6A;--red:#EF5350;--orange:#FFA726;--t1:rgba(255,255,255,0.92);--t3:rgba(255,255,255,0.45)}
ha-card{background:rgba(12,14,24,0.92)!important;border:1px solid rgba(255,255,255,0.06)!important;border-radius:20px!important;box-shadow:0 2px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)!important;padding:6px 8px 14px;position:relative;overflow:hidden;font-family:-apple-system,sans-serif}
ha-card::before{content:'';position:absolute;top:-1px;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,77,255,0.25),transparent)}
svg{width:100%;height:auto;display:block}
.fl{fill:none;stroke:rgba(255,255,255,0.035);stroke-width:1.5;stroke-linecap:round}
.fa{fill:none;stroke-width:4;stroke-linecap:round;stroke-dasharray:0.5 20}
.fd{animation:fD var(--spd,2s) linear infinite}.fu{animation:fU var(--spd,2s) linear infinite}.fr{animation:fR var(--spd,2s) linear infinite}.fL{animation:fL var(--spd,2s) linear infinite}
@keyframes fR{from{stroke-dashoffset:20.5}to{stroke-dashoffset:0}}@keyframes fL{from{stroke-dashoffset:0}to{stroke-dashoffset:20.5}}@keyframes fD{from{stroke-dashoffset:20.5}to{stroke-dashoffset:0}}@keyframes fU{from{stroke-dashoffset:0}to{stroke-dashoffset:20.5}}
.vm{fill:var(--t1);font-size:20px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.vl{fill:var(--t3);font-size:8.2px;font-weight:600;letter-spacing:0.14em;text-anchor:middle;dominant-baseline:middle}
.vs{fill:var(--battery);font-size:19px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
.vd{fill:var(--t3);font-size:10px;font-weight:500;text-anchor:middle;dominant-baseline:middle}
.vc{fill:var(--t3);font-size:7.7px;font-weight:600;text-anchor:middle;dominant-baseline:middle}
.ib{fill:rgba(255,255,255,0.02);stroke:rgba(255,255,255,0.06);stroke-width:1}
.il{fill:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:0.05em;text-anchor:middle;dominant-baseline:middle}
.au{fill:white;font-size:7px;font-weight:600;letter-spacing:0.04em;text-anchor:middle;dominant-baseline:middle}
.au-pill{rx:8;ry:8;transition:fill 0.5s ease}
.sr{display:flex;gap:6px;margin-top:16px}
.sb{flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:12px;padding:10px 10px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden}
.sb-header{display:flex;justify-content:space-between;align-items:baseline}
.sl{font-size:7px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.3}
.sv{font-size:11px;font-weight:600;opacity:0.8}
.ss .sv{color:var(--solar)}.sc .sv{color:var(--load)}.sg .sv{color:var(--grid)}
.sb svg{width:100%;height:40px;display:block;margin-top:4px}
.sb path{stroke-linecap:round;stroke-linejoin:round}

.ss #hs{fill:none;stroke:rgba(255,179,0,0.7);stroke-width:1.2}.sc #hl{fill:none;stroke:rgba(38,198,218,0.7);stroke-width:1.2}.sg #hg{fill:none;stroke:rgba(66,165,245,0.7);stroke-width:1.2}
.ss #hsa{fill:rgba(255,179,0,0.12);stroke:none}.sc #hla{fill:rgba(38,198,218,0.12);stroke:none}.sg #hga{fill:rgba(66,165,245,0.12);stroke:none}
</style>
<ha-card><svg viewBox="0 0 526 460"><g transform="translate(25.5,10) scale(0.95)">
<path class="fl" d="M250,82 L250,162"/><path class="fl" d="M250,242 L250,320"/><path class="fl" d="M90,202 L181,202"/><path class="fl" d="M319,202 L410,202"/>
<path id="fs" class="fa" d="M250,82 L250,162" opacity="0"/><path id="fb" class="fa" d="M250,242 L250,320" opacity="0"/><path id="fg" class="fa" d="M90,202 L181,202" opacity="0"/><path id="fh" class="fa" d="M319,202 L410,202" opacity="0"/>
<g><g transform="translate(250,38) scale(1.30) translate(-250,-38)"><circle cx="250" cy="38" r="9" fill="var(--solar)" opacity="0.85"/><line x1="250" y1="25" x2="250" y2="21" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="250" y1="51" x2="250" y2="55" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="237" y1="38" x2="233" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="263" y1="38" x2="267" y2="38" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><line x1="240.8" y1="28.8" x2="238" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="47.2" x2="262" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="259.2" y1="28.8" x2="262" y2="26" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/><line x1="240.8" y1="47.2" x2="238" y2="50" stroke="var(--solar)" stroke-width="2" stroke-linecap="round" opacity="0.5"/></g><text x="250" y="74" class="vm" id="vs"></text><text x="250" y="10" class="vl">${L.solar}</text><text x="300" y="34" class="vd" id="ds" text-anchor="start"></text><text x="300" y="46" class="vc" id="pv" text-anchor="start"></text></g>
<g><rect x="186" y="167" width="128" height="70" rx="14" class="ib"/><path d="M244,182 L239,197 L247,197 L242,212 L258,192 L250,192 L255,182 Z" fill="rgba(255,255,255,0.08)"/><text x="250" y="229" class="il">${INV}</text><text x="295" y="247" class="vc" id="tp" text-anchor="start"></text></g>
<g><g transform="translate(66,196) scale(1.30) translate(-66,-196)"><rect x="64" y="181" width="4" height="30" rx="1" fill="var(--grid)" opacity="0.8"/><rect x="54" y="183" width="24" height="3" rx="1" fill="var(--grid)" opacity="0.7"/><rect x="57" y="192" width="18" height="2.5" rx="1" fill="var(--grid)" opacity="0.6"/><path d="M60,211 L64,199 L68,199 L72,211" fill="var(--grid)" opacity="0.5"/><circle cx="56" cy="184" r="1.5" fill="var(--grid)" opacity="0.9"/><circle cx="76" cy="184" r="1.5" fill="var(--grid)" opacity="0.9"/><circle cx="58" cy="193" r="1.2" fill="var(--grid)" opacity="0.8"/><circle cx="74" cy="193" r="1.2" fill="var(--grid)" opacity="0.8"/><line x1="54" y1="184" x2="46" y2="181" stroke="var(--grid)" stroke-width="0.8" opacity="0.4"/><line x1="78" y1="184" x2="86" y2="181" stroke="var(--grid)" stroke-width="0.8" opacity="0.4"/></g><circle cx="88" cy="167" r="4" fill="var(--green)" id="gd"/><text x="66" y="230" class="vm" id="vg"></text><text x="66" y="166" class="vl">${L.grid}</text><text x="66" y="248" class="vc" id="gv"></text><text x="66" y="262" class="vd" id="dg"></text></g>
<g><g transform="translate(434,187) scale(1.30) translate(-434,-187)"><path d="M416,188 L434,174 L452,188 Z" fill="var(--load)" opacity="0.8"/><rect x="420" y="187" width="28" height="18" rx="1" fill="var(--load)" opacity="0.6"/><rect x="430" y="195" width="8" height="10" rx="1" fill="rgba(0,0,0,0.3)"/><rect x="422" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="440" y="190" width="6" height="5" rx="0.5" fill="rgba(255,255,255,0.15)"/><rect x="441" y="176" width="5" height="8" rx="1" fill="var(--load)" opacity="0.5"/></g><text x="434" y="224" class="vm" id="vl"></text><text x="434" y="166" class="vl">${L.load}</text><text x="434" y="240" class="vd" id="dl"></text></g>
<g><g transform="translate(250,350) scale(1.365) translate(-250,-350)"><rect x="232" y="341" width="32" height="20" rx="3" fill="var(--battery)" opacity="0.75"/><rect x="264" y="345.5" width="6" height="11" rx="2" fill="var(--battery)" opacity="0.9"/><rect id="bl" x="235" y="344" width="26" height="14" rx="1.5" fill="rgba(0,0,0,0.35)"/></g><text x="250" y="382" class="vm" id="vb"></text><text x="250" y="404" class="vs" id="vc"></text><text x="250" y="328" class="vl">${L.battery}</text><text x="300" y="344" class="vc" id="bv" text-anchor="start"></text><text x="300" y="356" class="vc" id="bt" text-anchor="start"></text><text x="250" y="425" class="vd" id="db"></text><text x="250" y="440" class="vc" id="br" style="fill:var(--battery)"></text></g>
<rect id="ap" x="205" y="454" width="90" height="15" class="au-pill" fill="var(--green)"/><text x="250" y="462.5" class="au" id="va"></text>
</g></svg>
<div class="sr">
<div class="sb sg"><div class="sb-header"><span class="sl">${L.grid24}</span><span class="sv" id="hz"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hga"/><path id="hg"/></svg></div>
<div class="sb ss"><div class="sb-header"><span class="sl">${L.solar24}</span><span class="sv" id="hv"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hsa"/><path id="hs"/></svg></div>
<div class="sb sc"><div class="sb-header"><span class="sl">${L.load24}</span><span class="sv" id="hx"></span></div><svg viewBox="0 0 200 40" preserveAspectRatio="none"><path id="hla"/><path id="hl"/></svg></div>
</div></ha-card>`;}

_$(id){return this.shadowRoot.getElementById(id);}
_spd(p){const a=Math.abs(p);if(a<10)return 0;return Math.max(0.3,1.5-(a/6000)*1.2);}
_sf(el,id,p,d,c,o){if(Math.abs(p)<10){el.style.display='none';this._fs[id]=null;return;}el.style.display='';el.setAttribute('stroke',c);el.setAttribute('opacity',o);el.style.setProperty('--spd',this._spd(p).toFixed(1)+'s');if(this._fs[id]!==d){this._fs[id]=d;el.className.baseVal='fa '+d;}}
_spark(id,aid,data,mx){const el=this._$(id);const af=this._$(aid);if(!el||!data.length)return;const w=200,h=40,py=2,max=Math.max(mx*0.05,...data)||1;const pts=data.map((v,i)=>[(i/(data.length-1))*w,py+(1-v/max)*(h-py*2)]);if(pts.length<2)return;const tension=0.3;const cp=(p0,p1,p2,t)=>[p1[0]+(p2[0]-p0[0])*t,p1[1]+(p2[1]-p0[1])*t];let d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)];const p1=pts[i];const p2=pts[i+1];const p3=pts[Math.min(pts.length-1,i+2)];const c1=cp(p0,p1,p2,tension);const c2=[p2[0]-(p3[0]-p1[0])*tension,p2[1]-(p3[1]-p1[1])*tension];d+=' C'+c1[0].toFixed(1)+','+c1[1].toFixed(1)+' '+c2[0].toFixed(1)+','+c2[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);}el.setAttribute('d',d);if(af){af.setAttribute('d',d+'L'+w+','+h+'L0,'+h+'Z');}}
_drawSparks(){this._spark('hs','hsa',this._hist.solar,6000);this._spark('hl','hla',this._hist.load,6000);this._spark('hg','hga',this._hist.grid,4000);}

_update(){if(!this._h||!this.shadowRoot.getElementById('vs'))return;
const c=this._c,L=this._lang,sol=this._gv(c.solar),bat=this._gv(c.battery),soc=this._gv(c.soc),grid=this._gv(c.grid),load=this._gv(c.load),temp=this._gv(c.temperature),gv=this._gv(c.grid_voltage),bv=this._gv(c.battery_voltage),pvv=this._gv(c.pv_voltage),freq=this._gv(c.frequency),gon=this._gs(c.grid_status)==='on';
const p=this._prev;
this._$('vs').textContent=this._arrow(sol,p.solar)+this._fmt(sol);
this._$('vb').textContent=this._arrow(bat,p.bat)+this._fmt(Math.abs(bat));
this._$('vg').textContent=this._arrow(grid,p.grid)+this._fmt(Math.abs(grid));
this._$('vl').textContent=this._arrow(load,p.load)+this._fmt(load);
this._prev={solar:sol,bat:bat,grid:grid,load:load};
this._$('vc').textContent=Math.round(soc)+'% | '+c.shutdown_soc+'%';
this._$('bl').setAttribute('width',(26*(1-soc/100)).toFixed(1));
if(temp>0)this._$('tp').textContent=temp.toFixed(0)+'\u00B0C';
if(pvv>0)this._$('pv').textContent=pvv.toFixed(0)+'V';
if(gv>0)this._$('gv').textContent=gv.toFixed(0)+'V \u00B7 '+freq.toFixed(1)+'Hz';
if(bv>0)this._$('bv').textContent=bv.toFixed(1)+'V';
const bt=this._gv(c.battery_temperature);if(bt>0)this._$('bt').textContent=bt.toFixed(0)+'\u00B0C';
const gd=this._$('gd');if(gd)gd.setAttribute('fill',gon?'var(--green)':'var(--red)');
const dS=this._gv(c.daily_solar),dI=this._gv(c.daily_import),dE=this._gv(c.daily_export),dL=this._gv(c.daily_load),dC=this._gv(c.daily_charge),dD=this._gv(c.daily_discharge);
this._$('ds').textContent=L.daily+' '+this._fmtE(dS);
this._$('dg').textContent=L.import_+' '+this._fmtE(dI)+' '+L.export_+' '+this._fmtE(dE);
this._$('dl').textContent=L.daily+' '+this._fmtE(dL);
this._$('db').textContent=L.charge+' '+this._fmtE(dC)+' '+L.discharge+' '+this._fmtE(dD);
// Flow animations
this._sf(this._$('fs'),'s',sol,'fd','var(--solar)','0.8');
if(Math.abs(bat)>10)this._sf(this._$('fb'),'b',bat,bat<0?'fd':'fu',bat<0?'var(--green)':'var(--battery)','0.75');else this._$('fb').style.display='none';
if(Math.abs(grid)>10)this._sf(this._$('fg'),'g',grid,grid>0?'fr':'fL',grid>0?'var(--red)':'var(--green)','0.7');else this._$('fg').style.display='none';
this._sf(this._$('fh'),'h',load,'fr','var(--load)','0.75');
// Battery runtime
const batCap=this._c.battery_capacity||5120;const shuSoc=this._c.shutdown_soc||20;
if(bat>0&&soc>shuSoc){const remWh=(soc-shuSoc)/100*batCap;const hrs=remWh/bat;const totalMin=Math.round(hrs*60);const h=Math.floor(totalMin/60);const m=totalMin%60;const eta=new Date(Date.now()+totalMin*60000);const pad=v=>String(v).padStart(2,'0');this._$('br').textContent=h+'h '+pad(m)+'m \u25B8 '+shuSoc+'% @'+pad(eta.getHours())+':'+pad(eta.getMinutes());}else{this._$('br').textContent='';}
// Autarky
const gridImp=grid>0?grid:0;const au=load>0?Math.max(0,Math.min(100,((load-gridImp)/load)*100)):0;
this._$('va').textContent=L.autarky+': '+au.toFixed(0)+'%';
const ap=this._$('ap');if(ap){let pc;if(au>=80)pc='#66BB6A';else if(au>=50)pc='#FFA726';else if(au>=25)pc='#FF7043';else pc='#EF5350';ap.setAttribute('fill',pc);}
// Sparkline values
this._$('hv').textContent=this._fmt(sol)+' / '+this._fmtE(dS);
this._$('hx').textContent=this._fmt(load)+' / '+this._fmtE(dL);
this._$('hz').textContent=this._fmt(Math.abs(grid))+' / '+this._fmtE(dI+dE);}

getCardSize(){return 6;}
}

customElements.define('xpower-flow-card',XPowerFlowCard);
window.customCards=window.customCards||[];
window.customCards.push({type:'xpower-flow-card',name:'xPower Flow Card',description:'Modern futuristic power flow card for solar hybrid inverters',preview:true,documentationURL:'https://github.com/BTNBx/xpower-flow-card'});
console.info('%c XPOWER-FLOW %c v'+V+' ','background:#7C4DFF;color:white;font-weight:bold;border-radius:4px 0 0 4px;padding:2px 6px','background:#333;color:white;border-radius:0 4px 4px 0;padding:2px 6px');
