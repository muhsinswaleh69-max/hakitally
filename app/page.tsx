"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// COUNTY-WIDE (same everywhere)
const COUNTY_RACES:any = {
  Governor: [{name:"Fernandes Barasa (ODM)",short:"BARASA"}, {name:"Cleophas Malala (DCP)",short:"MALALA"}, {name:"Boni Khalwale (IND)",short:"KHALWALE"}],
  Senator: [{name:"Edwin Sifuna (ODM)",short:"SIFUNA"}, {name:"Boni Khalwale (UDA)",short:"KHALWALE"}, {name:"George Khaniri (DCP)",short:"KHANIRI"}],
  "Woman Rep": [{name:"Elsie Muhanda (ODM)",short:"ELSIE"}, {name:"Beatrice Adagala (UDA)",short:"ADAGALA"}, {name:"Rachael Otundo (DCP)",short:"OTUNDO"}],
};

// MP - DIFFERENT PER SUB-COUNTY (Constituency)
const MP_CANDIDATES:any = {
  "Mumias East": [{name:"Peter Nabulindo (ODM)",short:"NABULINDO"}, {name:"Benjamin Washiali (UDA)",short:"WASHIALI"}, {name:"David Were (DCP)",short:"WERE"}],
  "Mumias West": [{name:"Johnson Naicca (ODM)",short:"NAICCA"}, {name:"Rashid Echesa (UDA)",short:"ECHESA"}, {name:"Tim Wanyonyi (DCP)",short:"WANYONYI"}],
  "Matungu": [{name:"Peter Nabulindo (ODM)",short:"NABULINDO"}, {name:"Justus Murunga (UDA)",short:"MURUNGA"}, {name:"Oscar Nabulindo (DCP)",short:"OSCAR"}],
  "Lugari": [{name:"Ayub Savula (ODM)",short:"SAVULA"}, {name:"Nabii Nabwera (UDA)",short:"NABWERA"}, {name:"Isaac Andabwa (DCP)",short:"ANDABWA"}],
  "Likuyani": [{name:"Innocent Mugabe (ODM)",short:"MUGABE"}, {name:"Enock Kibunguchy (UDA)",short:"KIBUNGUCHY"}, {name:"Oscar Nabulindo (DCP)",short:"OSCAR"}],
  "Malava": [{name:"Moses Malulu Injendi (ODM)",short:"MALULU"}, {name:"Moses Malulu (UDA)",short:"MALULU"}, {name:"Seth Panyako (DCP)",short:"PANYAKO"}],
  "Lurambi": [{name:"Titus Khamala (ODM)",short:"KHAMALA"}, {name:"Bishop Owino (UDA)",short:"OWINO"}, {name:"Alfred Agoi (DCP)",short:"AGOI"}],
  "Navakholo": [{name:"Emmanuel Wangwe (ODM)",short:"WANGWE"}, {name:"Elvis Chiche (UDA)",short:"CHICHE"}, {name:"Wilberforce Lutta (DCP)",short:"LUTTA"}],
  "Butere": [{name:"Tindi Mwale (ODM)",short:"MWALE"}, {name:"Hillary Otsiula (UDA)",short:"OTSIULA"}, {name:"Andrew Toboso (DCP)",short:"TOBOSO"}],
  "Khwisero": [{name:"Christopher Aseka (ODM)",short:"ASEKA"}, {name:"Julius Arunga (UDA)",short:"ARUNGA"}, {name:"Evans Lutta (DCP)",short:"LUTTA"}],
  "Shinyalu": [{name:"Fred Ikana (ODM)",short:"IKANA"}, {name:"Justus Kizito (UDA)",short:"KIZITO"}, {name:"Omboko Milemba (DCP)",short:"MILEMBA"}],
  "Ikolomani": [{name:"Bernard Shinali (ODM)",short:"SHINALI"}, {name:"Bonface Mukhwana (UDA)",short:"MUKHWANA"}, {name:"Vincent Malenya (DCP)",short:"MALENYA"}],
};

// MCA - DIFFERENT PER WARD
const MCA_CANDIDATES:any = {
  "East Wanga": [{name:"Sophia Manyasa (UDA)",short:"SOPHIA"}, {name:"Timothy Wanzetse (ODM)",short:"TIMOTHY"}, {name:"Stanislaus Wanzetse (DCP)",short:"WANZETSE"}],
  "Lusheya/Lubinu": [{name:"John Wafula (ODM)",short:"WAFULA"}, {name:"Sophia Manyasa (UDA)",short:"SOPHIA"}, {name:"Patrick Kweyu (DCP)",short:"KWEYU"}],
  "Malaha/Isongo/Makunga": [{name:"Moses Musango (ODM)",short:"MUSANGO"}, {name:"David Shikuku (UDA)",short:"SHIKUKU"}, {name:"Esther Okumu (DCP)",short:"OKUMU"}],
  "Mautuma": [{name:"Mautuma MCA A (ODM)",short:"MAUTUMA A"}, {name:"Mautuma MCA B (UDA)",short:"MAUTUMA B"}, {name:"Mautuma MCA C (DCP)",short:"MAUTUMA C"}],
  "Lugari": [{name:"Lugari MCA A (ODM)",short:"LUGARI A"}, {name:"Lugari MCA B (UDA)",short:"LUGARI B"}, {name:"Lugari MCA C (DCP)",short:"LUGARI C"}],
  "default": [{name:"Candidate A (ODM)",short:"CAND A"}, {name:"Candidate B (UDA)",short:"CAND B"}, {name:"Candidate C (DCP)",short:"CAND C"}],
};

const SUBCOUNTIES = Object.keys(MP_CANDIDATES);
const WARDS_MAP:any = {"Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],"Lugari":["Mautuma","Lugari","Lumakanda"],"Likuyani":["Likuyani","Kongoni","Sango"],"Shinyalu":["Murhanda","Isukha North","Isukha South","Isukha Central","Isukha East","Isukha West"]};

export default function Portal(){
  const [tab,setTab]=useState("MP");
  const [filter,setFilter]=useState("Shinyalu");
  const [results,setResults]=useState<any[]>([]);
  const fetchAll=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); if(data) setResults(data); };
  useEffect(()=>{ fetchAll(); const ch=supabase.channel("diff-names").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe(); setInterval(fetchAll,2000); return()=>{supabase.removeChannel(ch);} },[]);

  const getTally=(race:string, subcounty?:string, ward?:string)=>{
    let rows=results.filter(r=>r.race===race);
    if(subcounty) rows=rows.filter(r=>r.constituency===subcounty || r.subcounty===subcounty || r.ward && WARDS_MAP[subcounty]?.includes(r.ward) || r.ward===subcounty);
    if(ward) rows=rows.filter(r=>r.ward===ward);
    if(race==="MP" && subcounty) rows=results.filter(r=>r.race==="MP" && (r.subcounty===subcounty || r.constituency===subcounty));
    const tally:Record<string,number>={}; rows.forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+v; }); });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const sorted=Object.entries(tally).sort((a:any,b:any)=>b[1]-a[1]);
    const stns=new Set(rows.map(r=>r.station_name)).size;
    return {tally,total,sorted,stns};
  };

  const renderCountyRace=(race:string)=>{
    const {tally,total,sorted,stns}=getTally(race);
    const need=1200; const isComplete=stns>=need; const win=sorted[0] as any;
    return(
      <div>
        {isComplete && win && <div className="bg-green-600 text-white rounded-2xl p-5 text-center mb-5"><h2 className="text-[26px] font-black">🎉 CONGRATULATIONS {race.toUpperCase()} {win[0].split(" ")[0].toUpperCase()}! 🎉</h2><p>{win[0]} - {win[1].toLocaleString()} votes</p></div>}
        <div className="grid md:grid-cols-3 gap-3">{COUNTY_RACES[race].map((c:any)=>{ const key=Object.keys(tally).find(k=>k.includes(c.short))||c.name; const v=tally[key]||0; const pct=total?Math.round(v/total*100):0; return(<div key={c.name} className={`bg-white rounded-xl p-4 shadow-sm ${win&&win[0]===key? "border-2 border-green-600":""}`}><p className="font-bold text-[13px]">{c.name}</p><p className="font-black text-[20px] mt-1">{v.toLocaleString()} <span className="text-[12px] text-gray-500">{pct}%</span></p><div className="w-full h-2 bg-gray-100 rounded-full mt-2"><div className="h-full bg-black" style={{width:`${pct}%`}}></div></div></div>); })}</div>
        <p className="text-center text-[11px] text-gray-400 mt-2">{stns}/{need} stations • {total.toLocaleString()} votes</p>
      </div>
    );
  };

  const renderMP=()=>{
    const candidates=MP_CANDIDATES[filter]||MP_CANDIDATES["Mumias East"];
    const {tally,total,sorted,stns}=getTally("MP",filter);
    const need=100; const isComplete=stns>=need; const win=sorted[0] as any;
    return(
      <div>
        <p className="font-bold text-[13px] mb-3">{filter} Constituency - MP Race - Different Candidates per Sub-county</p>
        {isComplete && win && <div className="bg-green-600 text-white rounded-2xl p-5 text-center mb-5"><h2 className="text-[24px] font-black">🎉 CONGRATULATIONS MP {win[0].split(" ")[0].toUpperCase()} - {filter.toUpperCase()}! 🎉</h2><p>{win[0]} - {win[1].toLocaleString()} votes - ELECTED MP {filter}</p></div>}
        <div className="grid md:grid-cols-3 gap-3">{candidates.map((c:any)=>{ const key=Object.keys(tally).find(k=>k.includes(c.short))||c.name; const v=tally[key]||0; const pct=total?Math.round(v/total*100):0; const isWin=win&&win[0]===key; return(<div key={c.name} className={`bg-white rounded-xl p-4 shadow-sm ${isWin && isComplete? "bg-green-50 border-2 border-green-600":""}`}><p className="font-bold text-[13px]">{c.name} {isWin && <span className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-full">{isComplete? "WINNER":"LEADING"}</span>}</p><p className="font-black text-[20px] mt-1">{v.toLocaleString()} <span className="text-[12px]">{pct}%</span></p></div>); })}</div>
        <p className="text-center text-[11px] text-gray-400 mt-3">{stns}/{need} stations • {total.toLocaleString()} votes • Candidates unique to {filter}</p>
      </div>
    );
  };

  const renderMCA=()=>{
    const wards=WARDS_MAP[filter]||["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"];
    return(
      <div className="grid md:grid-cols-3 gap-4">{wards.map((w:string)=>{ const candidates=MCA_CANDIDATES[w]||MCA_CANDIDATES.default; const {tally,total,sorted,stns}=getTally("MCA",undefined,w); const need=w==="Lusheya/Lubinu"?17:16; const isComplete=stns>=need; const win=sorted[0] as any; return(<div key={w} className={`rounded-xl p-4 shadow-sm ${isComplete? "bg-green-50 border-2 border-green-600":"bg-white"}`}><p className="font-bold text-[11px]">{w} Ward - {filter} - {stns}/{need} stns • Unique MCA candidates</p>{isComplete && win? <div className="bg-green-600 text-white rounded-xl p-3 mt-3 text-center"><p className="text-[10px] font-bold">WINNER DECLARED - {w.toUpperCase()}</p><p className="font-black">🎉 CONGRATULATIONS MCA {win[0].split(" ")[0].toUpperCase()} 🎉</p><p className="text-[12px]">{win[0]} - {win[1].toLocaleString()} votes</p></div>:<div className="mt-3 space-y-2">{candidates.map((c:any)=>{ const key=Object.keys(tally).find(k=>k.includes(c.short))||c.name; const v=tally[key]||0; const pct=total?Math.round(v/total*100):0; return(<div key={c.name} className="flex justify-between text-[12px]"><span>{c.name}</span><span className="font-black">{v} ({pct}%)</span></div>); })}</div>}</div>); })}</div>
    );
  };

  return(
    <div className="min-h-screen bg-[#f5f5f5]"><div className="bg-black text-white p-5"><h1 className="text-[26px] font-black">HakiTally - KAKAMEGA COUNTY</h1><p className="text-[11px] opacity-70">Full Test Mode - Different Names per Sub-county | {new Set(results.map(r=>r.station_name)).size} / 1200 Stations</p><div className="flex gap-2 mt-3 flex-wrap">{["Governor","Senator","Woman Rep","MP","MCA"].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1 rounded-full text-[12px] font-bold ${tab===t? "bg-white text-black":"bg-white/10"}`}>{t}</button>)}</div></div><div className="p-4 max-w-[1200px] mx-auto"><div className="flex gap-2 flex-wrap mb-4">{SUBCOUNTIES.map(sc=><button key={sc} onClick={()=>setFilter(sc)} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${filter===sc? "bg-black text-white":"bg-white"}`}>{sc}</button>)}</div>{tab==="MP"? renderMP(): tab==="MCA"? renderMCA() : renderCountyRace(tab)}</div></div>
  );
}
