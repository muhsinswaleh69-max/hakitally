"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// TOTAL STATIONS CONFIG
const TOTALS = { GOVERNOR: 1200, SENATOR: 1200, WOMAN_REP: 1200, MP: 100, MCA_WARD: { "East Wanga":16, "Lusheya/Lubinu":17, "Malaha/Isongo/Makunga":16 } };

// CANDIDATES
const CANDIDATES: any = {
  Governor: [
    { name:"Fernandes Barasa", party:"ODM", short:"BARASA" },
    { name:"Cleophas Malala", party:"DCP", short:"MALALA" },
    { name:"Boni Khalwale", party:"IND", short:"KHALWALE" },
    { name:"Elsie Muhanda", party:"", short:"ELSIE" },
  ],
  Senator: [
    { name:"Boni Khalwale", party:"UDA", short:"KHALWALE" },
    { name:"Edwin Sifuna", party:"ODM", short:"SIFUNA" },
    { name:"Senator Candidate C", party:"DCP", short:"CANDIDATE C" },
  ],
  "Woman Rep": [
    { name:"Elsie Muhanda", party:"ODM", short:"ELSIE" },
    { name:"Beatrice Adagala", party:"UDA", short:"ADAGALA" },
  ],
  MP: [
    { name:"MP Candidate A", party:"ODM", short:"CANDIDATE A" },
    { name:"MP Candidate B", party:"UDA", short:"CANDIDATE B" },
  ],
  MCA: [
    { name:"Sophia Manyasa (UDA)", party:"UDA", short:"SOPHIA" },
    { name:"Timothy Wanzetse (ODM)", party:"ODM", short:"TIMOTHY" },
    { name:"Stanislaus Wanzetse (DCP)", party:"DCP", short:"WANZETSE" },
  ]
};

const SUBCOUNTIES = ["Mumias East","Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];
const WARDS = { "Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"] };

export default function HakiTally(){
  const [tab,setTab]=useState("MCA");
  const [filter,setFilter]=useState("Mumias East");
  const [results,setResults]=useState<any[]>([]);

  const fetchAll=async()=>{
    const {data}=await supabase.from("hakitally_results_34a").select("*");
    if(data) setResults(data);
  };
  useEffect(()=>{
    fetchAll();
    const ch=supabase.channel("all-live").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe();
    setInterval(fetchAll,3000);
    return()=>{supabase.removeChannel(ch);}
  },[]);

  const getAgg=(race:string, ward?:string)=>{
    let rows=results;
    if(ward) rows=rows.filter(r=>r.ward===ward);
    // For Governor/Senator we use all rows
    const tally:Record<string,number>={};
    rows.forEach(r=>{
      const ev=r.extra_votes||{};
      Object.entries(ev).forEach(([k,v]:any)=>{
        // Map extra_votes keys to current race candidates
        if(race==="MCA" && (k.includes("Sophia")||k.includes("Timothy")||k.includes("Stanislaus"))) tally[k]=(tally[k]||0)+v;
        if(race!=="MCA" &&!k.includes("Sophia")) tally[k]=(tally[k]||0)+v; // Governor etc use same field for demo
      });
    });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
    const stns=ward? rows.length : new Set(results.map(r=>r.station_name)).size;
    return {tally,total,sorted,stns};
  };

  const renderRace=(raceName:string)=>{
    const cfg=CANDIDATES[raceName];
    const {tally,total,sorted,stns}=getAgg(raceName);
    const totalNeeded = raceName==="Governor"||raceName==="Senator"||raceName==="Woman Rep"? TOTALS.GOVERNOR : TOTALS.MP;
    const isComplete = stns>=totalNeeded;
    const winner=sorted[0];

    return(
      <div>
        {isComplete && winner && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 text-center mb-6 shadow-xl">
            <p className="text-[12px] font-bold opacity-80">FINAL RESULT - {raceName.toUpperCase()} - ALL {totalNeeded} STATIONS REPORTED</p>
            <h2 className="text-[30px] font-black mt-2">🎉 CONGRATULATIONS {raceName.toUpperCase()} {winner[0].split(" ")[0].toUpperCase()}! 🎉</h2>
            <p className="text-[16px] font-bold mt-1">{winner[0]} - {winner[1].toLocaleString()} votes - ELECTED {raceName.toUpperCase()}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cfg.map((c:any)=>{
            const key=Object.keys(tally).find(k=>k.toLowerCase().includes(c.short.toLowerCase()) || k.includes(c.name.split(" ")[0])) || c.name;
            const votes=tally[key]||tally[c.name]||0;
            const pct=total? Math.round(votes/total*100):0;
            const isLeading = winner && winner[0]===key;
            return(
              <div key={c.name} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${isComplete && isLeading? "border-l-green-600 bg-green-50 border-2":"border-l-gray-200"}`}>
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-[14px]">{c.name} {c.party && `(${c.party})`}</p>
                    {isLeading &&!isComplete && <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">LEADING</span>}
                    {isComplete && isLeading && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">WINNER</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[20px]">{votes.toLocaleString()}</p>
                    <p className="text-[12px] text-gray-500">{pct}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-black transition-all duration-700" style={{width:`${pct}%`}}></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-4">{stns} / {totalNeeded} stations reported - {total.toLocaleString()} votes total</p>
      </div>
    );
  };

  const renderMCA=()=>{
    const wardList = WARDS[filter as keyof typeof WARDS] || ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"];
    const totalReportedAll = wardList.reduce((s,w)=>s+results.filter(r=>r.ward===w).length,0);
    const allComplete = totalReportedAll >= 49;
    const overall:any={}; results.filter(r=>wardList.includes(r.ward)).forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ overall[k]=(overall[k]||0)+v; }); });
    const overallWinner=Object.entries(overall).sort((a:any,b:any)=>b[1]-a[1])[0] as any;

    return(
      <div>
        {allComplete && overallWinner && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 text-center mb-6 shadow-xl animate-pulse">
            <p className="text-[12px] font-bold">FINAL RESULT - MUMIAS EAST - ALL 49 STATIONS REPORTED</p>
            <h2 className="text-[30px] font-black mt-2">🎉 CONGRATULATIONS MCA {overallWinner[0].split(" ")[0].toUpperCase()}! 🎉</h2>
            <p className="font-bold">{overallWinner[0]} - {overallWinner[1].toLocaleString()} votes</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wardList.map((w:string)=>{
            const rows=results.filter(r=>r.ward===w);
            const stns=rows.length; const need=(TOTALS.MCA_WARD as any)[w]||16;
            const isComplete=stns>=need;
            const tally:any={}; rows.forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+v; }); });
            const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
            const sorted=Object.entries(tally).sort((a:any,b:any)=>b[1]-a[1]) as any;
            const winner=sorted[0]; const winnerShort=winner? winner[0].split(" ")[0] : "";
            return(
              <div key={w} className={`rounded-xl p-4 shadow-sm ${isComplete? "bg-green-50 border-2 border-green-600":"bg-white border-l-4"}`}>
                <p className="font-bold text-[12px]">{w} Ward - {filter} - MCA Race - {stns}/{need} stns reported {total? `• ${total.toLocaleString()} votes`:""}</p>
                {isComplete && winner? (
                  <div className="bg-green-600 text-white rounded-xl p-3 mt-3 text-center">
                    <p className="text-[10px] font-bold">WINNER DECLARED - {w.toUpperCase()}</p>
                    <p className="text-[18px] font-black mt-1">🎉 CONGRATULATIONS MCA {winnerShort.toUpperCase()} 🎉</p>
                    <p className="text-[12px] font-bold">{winner[0]} - {winner[1].toLocaleString()} votes ({total? Math.round(winner[1]/total*100):0}%)</p>
                    <p className="text-[10px] mt-1 opacity-80">ELECTED MCA - {w}</p>
                  </div>
                ):(
                  <div className="mt-3 space-y-2">
                    {CANDIDATES.MCA.map((c:any)=>{
                      const key=Object.keys(tally).find(k=>k.includes(c.short)) || c.name;
                      const v=tally[key]||0; const pct=total? Math.round(v/total*100):0;
                      return(<div key={c.name} className="flex justify-between text-[13px]"><span>{c.name}</span><span className="font-black">{v.toLocaleString()} votes {pct}%</span></div>);
                    })}
                    {stns===0 && <p className="text-[11px] text-gray-400">No data yet - submit via Admin</p>}
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
        <p className="text-[12px] opacity-70">MCA 2027 Live Portal | All Subcounties and Wards | {new Set(results.map(r=>r.station_name)).size} / 1200 Stations - FRESH DATA MODE</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Governor","Senator","Woman Rep","MP","MCA"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1 rounded-full text-[13px] font-bold ${tab===t? "bg-white text-black":"bg-white/10 text-white/60"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="p-4 max-w-[1200px] mx-auto">
        <div className="flex gap-2 flex-wrap mb-4">
          {SUBCOUNTIES.map(sc=>(
            <button key={sc} onClick={()=>setFilter(sc)} className={`px-3 py-1 rounded-full text-[11px] font-bold border ${filter===sc? "bg-black text-white":"bg-white"}`}>{sc}</button>
          ))}
        </div>
        {tab==="MCA"? renderMCA() : renderRace(tab)}
      </div>
    </div>
  );
}
