import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search, Moon, Sun, History as HistoryIcon, HelpCircle, Trash2, Calculator as CalculatorIcon, Coins, Ruler, Scale, Thermometer, Square, Gauge, Database, Clock3, ChevronRight, Keyboard, ArrowLeftRight, Delete, Sparkles, X} from 'lucide-react';
import './styles.css';

const tools = [
  ['Calculator','Standard & scientific',CalculatorIcon],
  ['Currency','Live exchange rates',Coins],
  ['Length','Distance and dimensions',Ruler],
  ['Weight','Mass and weight',Scale],
  ['Temperature','Celsius, Fahrenheit, Kelvin',Thermometer],
  ['Area','Space and surfaces',Square],
  ['Speed','Travel and velocity',Gauge],
  ['Data','Digital storage',Database],
  ['Time','Small moments to years',Clock3]
];

const unitSets = {
  Length:{units:[['Meter','m',1],['Kilometer','km',1000],['Centimeter','cm',.01],['Millimeter','mm',.001],['Mile','mi',1609.344],['Yard','yd',.9144],['Foot','ft',.3048],['Inch','in',.0254]], blurb:'Distance and dimensions.'},
  Weight:{units:[['Kilogram','kg',1],['Gram','g',.001],['Milligram','mg',.000001],['Pound','lb',.45359237],['Ounce','oz',.028349523125],['Stone','st',6.35029318]],blurb:'Mass and weight.'},
  Area:{units:[['Square meter','m²',1],['Square kilometer','km²',1e6],['Square centimeter','cm²',.0001],['Square foot','ft²',.09290304],['Square yard','yd²',.83612736],['Acre','ac',4046.8564224],['Hectare','ha',10000]],blurb:'Space and surfaces.'},
  Speed:{units:[['Meter / second','m/s',1],['Kilometer / hour','km/h',.2777777778],['Mile / hour','mph',.44704],['Knot','kn',.5144444444],['Foot / second','ft/s',.3048]],blurb:'Travel and velocity.'},
  Data:{units:[['Byte','B',1],['Kilobyte','KB',1024],['Megabyte','MB',1024**2],['Gigabyte','GB',1024**3],['Terabyte','TB',1024**4]],blurb:'Digital storage.'},
  Time:{units:[['Second','s',1],['Minute','min',60],['Hour','h',3600],['Day','d',86400],['Week','wk',604800],['Month','mo',2629800],['Year','yr',31557600]],blurb:'Small moments to years.'}
};
const currencies=['USD','EUR','GBP','INR','JPY','AUD','CAD','SGD','AED','CHF'];
const tempUnits=[['Celsius','°C'],['Fahrenheit','°F'],['Kelvin','K']];

const fmt=n=>Number.isFinite(Number(n))?new Intl.NumberFormat(undefined,{maximumFractionDigits:8}).format(Number(n)):'—';
function Ad({className=''}){return <div className={'ad '+className}><span>ADVERTISEMENT</span></div>}
function ToolNav({active,setActive}){return <div className="tool-nav-wrap"><div className="tool-nav">{tools.map(([name,sub,Icon])=><button key={name} className={active===name?'tool-chip active':'tool-chip'} onClick={()=>setActive(name)}><Icon size={15}/><span>{name}</span></button>)}</div></div>}

function Header({dark,setDark,onOpenSearch,onOpenAbout}){
  return (
    <header className="header">
      <div className="logo">Calculy<span>•</span></div>
      <div className="header-actions">
        <button className="search" onClick={onOpenSearch}>
          <Search size={15}/><span>Find a tool</span><kbd>⌘ K</kbd>
        </button>
        <button aria-label="Search" className="hicon" onClick={onOpenSearch}><Search size={18}/></button>
        <button aria-label="Theme" className="hicon" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        <button aria-label="About" className="hicon" onClick={onOpenAbout}><HelpCircle size={18}/></button>
      </div>
    </header>
  );
}

function Sidebar({active,setActive}){return <aside className="sidebar"><div className="side-label">YOUR TOOLKIT</div><div className="tool-list">{tools.map(([name,sub,Icon])=><button key={name} onClick={()=>setActive(name)} className={active===name?'side-tool active':'side-tool'}><span className="side-icon"><Icon size={16}/></span><span className="side-copy"><strong>{name}</strong><small>{sub}</small></span></button>)}</div><div className="shortcut"><Keyboard size={16}/><strong>A little faster</strong><p>Use ⌘ K to jump between tools, or type directly into the calculator.</p></div></aside>}
function HistoryPanel({history,setHistory}){return <aside className="history-panel"><div className="side-label">YOUR WORKSPACE</div><div className="history-title"><h2>History</h2><button onClick={()=>setHistory([])} aria-label="Clear history"><Trash2 size={17}/></button></div><div className="history-box">{history.length?<div className="history-list">{history.map((h,i)=><div className="history-row" key={i}>{h}</div>)}</div>:<><HistoryIcon size={21}/><strong>Nothing here yet</strong><p>Your calculations and saved conversions<br/>will appear here.</p></>}</div></aside>}

function Calculator({addHistory}){
  const [display,setDisplay]=useState('0'); const [mode,setMode]=useState('');
  const [memory,setMemory]=useState(0);
  const press=k=>{
    if(k==='C'){setDisplay('0');return}
    if(k==='⌫'){setDisplay(v=>v.length>1?v.slice(0,-1):'0');return}
    if(k==='='){try{const s=display.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replaceAll('√','Math.sqrt').replaceAll('sin','Math.sin').replaceAll('cos','Math.cos').replaceAll('tan','Math.tan').replaceAll('log','Math.log10');if(!/^[0-9+*/().%\-\sA-Za-z.]+$/.test(s))throw Error();const r=Function('"use strict";return '+s)();if(!Number.isFinite(r))throw Error();addHistory(display+' = '+fmt(r));setDisplay(String(r))}catch{setDisplay('Error')}return}
    if(['sin','cos','tan','sqrt','log'].includes(k)){setDisplay(v=>v==='0'?k+'(':v+k+'(');return}
    if(k==='MR'){setDisplay(String(memory));return} if(k==='MC'){setMemory(0);return} if(k==='MS'){setMemory(Number(display)||0);return} if(k==='M+'){setMemory(v=>v+(Number(display)||0));return}
    if('0123456789.'.includes(k)){setDisplay(v=>(v==='0'?k:v+k));return} setDisplay(v=>(v==='0'&&k!=='−'?k:v+k));
  };
  useEffect(()=>{const fn=e=>{const map={Enter:'=',Backspace:'⌫',Escape:'C','*':'×','/':'÷'};const k=map[e.key]||e.key;if('0123456789.+-×÷%='.includes(k)||['⌫','C'].includes(k)){e.preventDefault();press(k)}};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[display,memory]);
  const rows=[['C','(',')','⌫'],['7','8','9','÷'],['4','5','6','×'],['1','2','3','−'],['0','.','','+']];
  return <div className="calculator-card"><div className="calc-top"><div><div className="calc-kicker">Standard calculator</div></div><span>BASIC + SCIENTIFIC</span></div><div className="display"><div className="display-number">{display}</div><div className="display-hint">Type an expression or use the keypad</div></div><div className="keypad-area"><div className="science-row">{['sin','cos','tan','sqrt','log'].map(k=><button key={k} onClick={()=>press(k)}>{k}</button>)}</div><div className="keys">{rows.flat().map((k,i)=>k?<button key={i} onClick={()=>press(k)} className={['C','(',')','⌫','÷','×','−','+'].includes(k)?'op':''}>{k}</button>:<span key={i}/>)}</div><button className="equals" onClick={()=>press('=')}>=</button><div className="memory"><span>Memory empty</span><div><button onClick={()=>press('MC')}>MC</button><button onClick={()=>press('MR')}>MR</button><button onClick={()=>press('MS')}>MS</button><button onClick={()=>press('M+')}>M+</button></div></div></div></div>}

function Temperature(){const [value,setValue]=useState('0'),[from,setFrom]=useState(0),[to,setTo]=useState(1);const n=Number(value);const c=from===0?n:from===1?(n-32)*5/9:n-273.15;const result=to===0?c:to===1?c*9/5+32:c+273.15;return <ConverterCard title="Temperature" kicker="TEMPERATURE" blurb="Celsius, Fahrenheit, Kelvin." value={value} setValue={setValue} units={tempUnits.map(x=>[x[0],x[1]])} from={from} setFrom={setFrom} to={to} setTo={setTo} result={result}/>}
function ConverterCard({title,kicker,blurb,value,setValue,units,from,setFrom,to,setTo,result}){return <div className="converter-card"><div className="conv-head"><div><div className="calc-kicker">{title}</div><p>{blurb}</p></div><span>CONVERSION</span></div><div className="conversion-body"><div className="field"><label>From</label><div className="field-box"><input value={value} onChange={e=>setValue(e.target.value)}/><select value={from} onChange={e=>setFrom(+e.target.value)}>{units.map((u,i)=><option key={i} value={i}>{u[0]} ({u[1]})</option>)}</select></div></div><div className="arrow"><ArrowLeftRight size={18}/></div><div className="field"><label>To</label><div className="field-box output"><strong>{fmt(result)}</strong><select value={to} onChange={e=>setTo(+e.target.value)}>{units.map((u,i)=><option key={i} value={i}>{u[0]} ({u[1]})</option>)}</select></div></div></div><div className="conversion-note">Enter a value above to convert instantly.</div></div>}
function UnitConverter({type,addHistory}){const set=unitSets[type];const [value,setValue]=useState('1'),[from,setFrom]=useState(0),[to,setTo]=useState(1);const result=Number(value)*set.units[from][2]/set.units[to][2];useEffect(()=>{if(value!=='')addHistory(type+': '+value+' '+set.units[from][1]+' = '+fmt(result)+' '+set.units[to][1])},[from,to]);return <ConverterCard title={type} kicker={type.toUpperCase()} blurb={set.blurb} value={value} setValue={setValue} units={set.units.map(x=>[x[0],x[1]])} from={from} setFrom={setFrom} to={to} setTo={setTo} result={result}/>}

function Currency(){
  const [value,setValue]=useState('1');
  const [from,setFrom]=useState('USD');
  const [to,setTo]=useState('INR');
  const [rate,setRate]=useState(null);

  useEffect(()=>{
    let dead=false;
    const cacheKey=`calculy_fx_${from}`;
    const cachedData=localStorage.getItem(cacheKey);
    const cacheTime=localStorage.getItem(`${cacheKey}_time`);
    const now=new Date().getTime();

    if(cachedData&&cacheTime&&(now-cacheTime<12*60*60*1000)){
      const rates=JSON.parse(cachedData);
      if(!dead)setRate(rates[to]??null);
      return;
    }

    fetch(`https://api.frankfurter.dev/v1/latest?base=${from}`)
      .then(r=>r.json())
      .then(d=>{
        if(dead)return;
        const rates=d.rates||{};
        rates[from]=1;
        
        localStorage.setItem(cacheKey,JSON.stringify(rates));
        localStorage.setItem(`${cacheKey}_time`,now);

        setRate(rates[to]??null);
      })
      .catch(()=>{
        if(cachedData){
          const rates=JSON.parse(cachedData);
          if(!dead)setRate(rates[to]??null);
        }else{
          if(!dead)setRate(null);
        }
      });

    return()=>{dead=true};
  },[from,to]);

  return (
    <div className="converter-card">
      <div className="conv-head">
        <div>
          <div className="calc-kicker">Currency</div>
          <p>Daily updated exchange rates.</p>
        </div>
        <span>LIVE AUTO-SYNC</span>
      </div>
      <div className="conversion-body">
        <div className="field">
          <label>From</label>
          <div className="field-box">
            <input value={value} onChange={e=>setValue(e.target.value)}/>
            <select value={from} onChange={e=>setFrom(e.target.value)}>
              {currencies.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="arrow"><ArrowLeftRight size={18}/></div>
        <div className="field">
          <label>To</label>
          <div className="field-box output">
            <strong>{rate==null?'—':fmt(Number(value)*rate)}</strong>
            <select value={to} onChange={e=>setTo(e.target.value)}>
              {currencies.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="conversion-note">Rates update automatically every day in the background.</div>
    </div>
  );
}

// Modal Components for Search & About
function SearchModal({isOpen,onClose,onSelectTool}){
  const [query,setQuery]=useState('');
  const filtered=tools.filter(([name,sub])=>name.toLowerCase().includes(query.toLowerCase())||sub.toLowerCase().includes(query.toLowerCase()));
  
  if(!isOpen)return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:'10vh',zIndex:1000}} onClick={onClose}>
      <div style={{background:'var(--card-bg, #fff)',width:'90%',maxWidth:'500px',borderRadius:'12px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',overflow:'hidden',border:'1px solid rgba(0,0,0,0.1)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItem:'center',padding:'16px',borderBottom:'1px solid rgba(0,0,0,0.08)',gap:'10px'}}>
          <Search size={18} style={{opacity:0.5}}/>
          <input autoFocus placeholder="Type a tool name (e.g., Currency, Weight)..." value={query} onChange={e=>setQuery(e.target.value)} style={{border:'none',outline:'none',background:'transparent',width:'100%',fontSize:'16px'}}/>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{maxHeight:'300px',overflowY:'auto',padding:'8px'}}>
          {filtered.length===0?<div style={{padding:'16px',textAlign:'center',opacity:0.6}}>No tools found</div>:filtered.map(([name,sub,Icon])=>(
            <div key={name} onClick={()=>{onSelectTool(name);onClose();}} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'8px',cursor:'pointer',transition:'background 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Icon size={18}/>
              <div>
                <div style={{fontWeight:600}}>{name}</div>
                <div style={{fontSize:'12px',opacity:0.6}}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutModal({isOpen,onClose}){
  if(!isOpen)return null;
  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:'var(--card-bg, #fff)',width:'90%',maxWidth:'450px',borderRadius:'12px',padding:'24px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',position:'relative'}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:'absolute',top:'16px',right:'16px',background:'transparent',border:'none',cursor:'pointer'}}><X size={18}/></button>
        <h2 style={{marginBottom:'12px',fontSize:'20px',fontWeight:700}}>About Calculy</h2>
        <p style={{lineHeight:'1.6',opacity:0.8,marginBottom:'16px'}}>
          Calculy is a clean, lightning-fast utility suite designed for everyday calculations and conversions.
        </p>
        
        {/* Medium Link with Official SVG Symbol */}
        <div style={{marginBottom:'16px'}}>
          <a 
            href="https://medium.com/@ajayjaknale1" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.73-1.51 6.75-3.38 6.75-1.87 0-3.38-3.02-3.38-6.75s1.51-6.75 3.38-6.75c1.87 0 3.38 3.02 3.38 6.75zM24 12c0 3.39-.58 6.13-1.3 6.13-.72 0-1.3-2.74-1.3-6.13s.58-6.13 1.3-6.13c.72 0 1.3 2.74 1.3 6.13z"/>
            </svg>
            Read my articles on Medium →
          </a>
        </div>

        <div style={{fontSize:'13px',opacity:0.5,borderTop:'1px solid rgba(0,0,0,0.08)',paddingTop:'12px'}}>
          Version 1.0.0 • Evergreen & Maintenance-Free
        </div>
      </div>
    </div>
  );
}

function App(){
  const [active,setActive]=useState('Calculator');
  const [dark,setDark]=useState(false);
  const [history,setHistory]=useState([]);
  const [isSearchOpen,setIsSearchOpen]=useState(false);
  const [isAboutOpen,setIsAboutOpen]=useState(false);

  const addHistory=x=>setHistory(h=>[x,...h].slice(0,8));
  
  useEffect(()=>{
    const fn=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==='k'){
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if(e.key==='Escape'){
        setIsSearchOpen(false);
        setIsAboutOpen(false);
      }
    };
    window.addEventListener('keydown',fn);
    return()=>window.removeEventListener('keydown',fn);
  },[]);

  const selected=tools.find(t=>t[0]===active);
  const content=active==='Calculator'?<Calculator addHistory={addHistory}/>:active==='Currency'?<Currency/>:active==='Temperature'?<Temperature/>:<UnitConverter type={active} addHistory={addHistory}/>;

  return (
    <div className={dark?'app dark':'app'}>
      <Header dark={dark} setDark={setDark} onOpenSearch={()=>setIsSearchOpen(true)} onOpenAbout={()=>setIsAboutOpen(true)}/>
      <div className="layout">
        <Sidebar active={active} setActive={setActive}/>
        <main className="main">
          <div className="mobile-tools"><ToolNav active={active} setActive={setActive}/></div>
          <div className="breadcrumb">EVERYDAY <span>/</span> {active.toUpperCase()}</div>
          <div className="page-head">
            <div>
              <h1>{active}</h1>
              <p>{selected?.[1]}. A precise, quiet space for everyday conversions.</p>
            </div>
            <span className="ready">READY TO USE</span>
          </div>
          <Ad className="top-ad"/>
          <div className="desktop-grid">
            <div className="center">{content}</div>
            <HistoryPanel history={history} setHistory={setHistory}/>
          </div>
          <div className="mobile-content">
            {content}
            <Ad className="bottom-inline-ad"/>
          </div>
        </main>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={()=>setIsSearchOpen(false)} onSelectTool={setActive}/>
      <AboutModal isOpen={isAboutOpen} onClose={()=>setIsAboutOpen(false)}/>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);