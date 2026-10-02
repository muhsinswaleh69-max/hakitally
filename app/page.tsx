"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const SEATS: any = {
  Governor: [
    { name:"Fernandes Barasa (ODM)", short:"BARASA", color:"bg-green-600" },
    { name:"Cleophas Malala (DCP)", short:"MALALA", color:"bg-orange-500" },
    { name:"Boni Khalwale (IND)", short:"KHALWALE", color:"bg-purple-600" },
  ],
  Senator: [
    { name:"Edwin Sifuna (ODM)", short:"SIFUNA", color:"bg-orange-500" },
    { name:"Boni Khalwale (UDA)", short:"KHALWALE", color:"bg-green-600" },
    { name:"George Khaniri (DCP)", short:"KHANIRI", color:"bg-purple-600" },
  ],
  "Woman Rep": [
    { name:"Elsie Muhanda (ODM)", short:"ELSIE", color:"bg-orange-500" },
    { name:"Beatrice Adagala (UDA)", short:"ADAGALA", color:"bg-green-600" },
    { name:"Rachael Otundo (DCP)", short:"OTUNDO", color:"bg-purple-600" },
  ],
  MP: [
    { name:"Peter Nabulindo (ODM)", short:"NABULINDO", color:"bg-orange-500" },
    { name:"Benjamin Washiali (UDA)", short:"WASHIALI", color:"bg-green-600" },
    { name:"David Were (DCP)", short:"WERE", color:"bg-purple-600" },
  ],
  MCA: [
    { name:"Sophia Manyasa (UDA)", short:"SOPHIA", color:"bg-green-600" },
    { name:"Timothy Wanzetse (ODM)", short:"TIMOTHY", color:"bg-orange-500" },
    { name:"Stanislaus Wanzetse (DCP)", short:"WANZETSE", color:"bg-purple-600" },
  ],
};

const TOTALS = { GOV:1200, MP:100, MCA:{"East Wanga":16,"Lusheya/Lubinu":17,"Malaha/Isongo/Makunga":16} };
const SUBCOUNTIES = ["Mumias East","Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];
const WARDS_MAP:any = {"Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],"Lugari":["Mautuma","Lugari","Lumakanda"]};

export default function Portal(){
  const [tab,setTab]=useState("MCA");
  const [filter,setFilter]=useState("Mumias East");
  const [results,setResults]=useState<any[]>([]);
  const fetchAll=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); if(data) setResults(data); };
  useEffect(()=>{ fetchAll(); const ch=supabase.channel("full-test").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe(); setInterval(fetchAll,2000); return()=>{supabase.removeChannel(ch);} },[]);

  const agg=(race:string, ward?:string)=>{
    let rows=ward? results.filter(r=>r.ward===ward && r.race===race) : results.filter(r=>r.race===race);
    if(race==="Governor" && results.length && rows.length===0) rows=results.filter(r=>!r.race || r.race==="Governor"); // backward compat
    const tally:Record<string,number>={}; rows.forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ if(SEATS[race].some((c:any)=>k.includes(c.short) || k===c.name)) tally[k]=(tally[k]||0)+v; }); });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const sorted=Object.entries(tally).sort((a:any,b:any)=>b[1]-a[1]);
    const stns=ward? rows.length : new Set(rows.map(r=>r.station_name)).size;
    return {tally,total,sorted,stns,rows};
  };

  const renderRace=(race:string)=>{
    const {tally,total,sorted,stns}=agg(race);
    const need = race==="MP"? 100 : 1200;
    const isComplete = stns>=need;
    const winner=sorted[0] as any;
    return(
      <div>
        {isComplete && winner && (
          <div className="bg-green-600 text-white rounded-2xl p-5 text-center mb-5 shadow-xl">
            <p className="text-[11px] font-bold">FINAL - {race.toUpperCase()} - {stns}/{need} STATIONS</p>
            <h2 className="text-[28px] font-black mt-1">🎉 CONGRATULATIONS {race.toUpperCase()} {winner[0].split(" ")[0].toUpperCase()}! 🎉</h2>
            <p className="font-bold">{winner[0]} - {winner[1].toLocaleString()} votes - ELECTED {race.toUpperCase()}</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-3">
          {SEATS[race].map((c:any)=>{
            const key=Object.keys(tally).find(k=>k.includes(c.short))||c.name;
            const v=tally[key]||0; const pct=total?Math.round(v/total*100):0;
            const isWin=isComplete && winner && winner[0]===key;
            return(
              <div key={c.name} className={`bg-white rounded-xl p-4 shadow-sm ${isWin? "border-2 border-green-600 bg-green-50":"border-l-4"}`}>
                <p className="font-bold text-[13px]">{c.name} {isWin && <span className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded-full">WINNER</span>}{!isComplete && winner && winner[0]===key && <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full ml-1">LEADING</span>}</p>
                <p className="font-black text-[22px] mt-2">{v.toLocaleString()} <span className="text-[13px] text-gray-500">{pct}%</span></p>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2"><div className={`h-full ${c.color}`} style={{width:`${pct}%`}}></div></div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3">{stns}/{need} stations • {total.toLocaleString()} votes</p>
      </div>
    );
  };

  const renderMCA=()=>{
    const wards=WARDS_MAP[filter]||["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"];
    const totalAll=wards.reduce((s:number,w:string)=>s+results.filter(r=>r.ward===w && r.race==="MCA").length,0);
    const isAllComplete=filter==="Mumias East" && totalAll>=49;
    const overall:any={}; results.filter(r=>r.race==="MCA" && wards.includes(r.ward)).forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ overall[k]=(overall[k]||0)+v; }); });
    const overallWin=Object.entries(overall).sort((a:any,b:any)=>b[1]-a[1])[0] as any;
    return(
      <div>
        {isAllComplete && overallWin && (
          <div className="bg-green-600 text-white rounded-2xl p-5 text-center mb-5">
            <h2 className="text-[28px] font-black">🎉 CONGRATULATIONS MCA {overallWin[0].split(" ")[0].toUpperCase()}! 🎉</h2>
            <p>{overallWin[0]} - {overallWin[1].toLocaleString()} votes - ELECTED MCA {filter}</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-3">
          {wards.map((w:string)=>{
            const {tally,total,sorted,stns}=agg("MCA",w); const need=(TOTALS.MCA as any)[w]||16; const isComplete=stns>=need; const win=sorted[0] as any;
            return(
              <div key={w} className={`rounded-xl p-4 shadow-sm ${isComplete? "bg-green-50 border-2 border-green-600":"bg-white border-l-4"}`}>
                <p className="font-bold text-[11px]">{w} - {filter} - {stns}/{need} stns • {total.toLocaleString()} votes {isComplete && <span className="bg-green-600 text-white text-[8px] px-2 py-0.5 rounded-full ml-1">COMPLETE</span>}</p>
                {isComplete && win? (
                  <div className="bg-green-600 text-white rounded-xl p-3 mt-3 text-center">
                    <p className="text-[9px] font-bold">WINNER DECLARED - {w.toUpperCase()}</p>
                    <p className="text-[16px] font-black">🎉 CONGRATULATIONS MCA {win[0].split(" ")[0].toUpperCase()} 🎉</p>
                    <p className="text-[12px] font-bold">{win[0]} - {win[1].toLocaleString()} votes ({total?Math.round(win[1]/total*100):0}%)</p>
                    <p className="text-[9px] opacity-80">ELECTED MCA - {w}</p>
                  </div>
                ):(
                  <div className="mt-3 space-y-2">
                    {SEATS.MCA.map((c:any)=>{ const key=Object.keys(tally).find(k=>k.includes(c.short))||c.name; const v=tally[key]||0; const pct=total?Math.round(v/total*100):0; return(<div key={c.name} className="flex justify-between text-[12px]"><span>{c.name} {win && win[0]===key && <span className="text-[8px] bg-black text-white px-1 rounded">LEADING</span>}</span><span className="font-black">{v} ({pct}%)</span></div>); })}
                    {stns===0 && <p className="text-[11px] text-gray-400">No data - submit via admin</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return(
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-black text-white p-5">
        <h1 className="text-[26px] font-black">HakiTally - KAKAMEGA COUNTY</h1>
        <p className="text-[11px] opacity-70">Full Test Mode - 3 Candidates per Race | {new Set(results.map(r=>r.station_name)).size} / 1200 Stations</p>
        <div className="flex gap-2 mt-3 flex-wrap">{Object.keys(SEATS).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1 rounded-full text-[12px] font-bold ${tab===t? "bg-white text-black":"bg-white/10"}`}>{t}</button>)}</div>
      </div>
      <div className="p-4 max-w-[1200px] mx-auto">
        <div className="flex gap-2 flex-wrap mb-4">{SUBCOUNTIES.map(sc=><button key={sc} onClick={()=>setFilter(sc)} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${filter===sc? "bg-black text-white":"bg-white"}`}>{sc}</button>)}</div>
        {tab==="MCA"? renderMCA() : renderRace(tab)}
      </div>
    </div>
  );
}
