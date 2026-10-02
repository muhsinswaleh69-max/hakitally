"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const SUBCOUNTIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

// OFFICIAL IEBC TOTAL STATIONS PER WARD
const WARD_TOTALS: Record<string, number> = {
  "East Wanga": 16,
  "Lusheya/Lubinu": 17,
  "Malaha/Isongo/Makunga": 16,
};

const WARDS_DATA: any = {
  "Lugari": ["Mautuma","Lugari","Lumakanda"],
  "Likuyani": ["Likuyani","Kongoni","Sango"],
  "Malava": ["Manda-Shivanga","Matsakha","Chegulo"],
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
};

const MUMIAS_EAST_CANDIDATES = [
  { name: "Sophia Manyasa", party: "UDA", color: "bg-green-600", short: "Sophia" },
  { name: "Timothy Wanzetse", party: "ODM", color: "bg-orange-500", short: "Timothy" },
  { name: "Stanislaus Wanzetse", party: "DCP", color: "bg-purple-600", short: "Wanzetse" },
];

export default function MCAPortal(){
  const [filter,setFilter]=useState<string>("Mumias East");
  const [results,setResults]=useState<any[]>([]);
  const [stats,setStats]=useState({reported:0});

  const fetchAll=async()=>{
    const {data}=await supabase.from("hakitally_results_34a").select("*");
    if(data){ setResults(data); setStats({reported: new Set(data.map((d:any)=>d.station_name)).size}); }
  };
  useEffect(()=>{
    fetchAll();
    const ch=supabase.channel("mca-live-final").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe();
    const iv=setInterval(fetchAll,2000);
    return()=>{supabase.removeChannel(ch); clearInterval(iv);}
  },[]);

  const getWardTally=(wardName:string)=>{
    const rows=results.filter(r=>r.ward===wardName);
    const stns=rows.length;
    const totalNeeded=WARD_TOTALS[wardName]||17;
    const isComplete=stns>=totalNeeded;
    const tally:Record<string,number>={};
    rows.forEach(r=>{
      const ev=r.extra_votes||{};
      Object.entries(ev).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+(v||0); });
    });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
    const winnerName=sorted[0]?.[0]||"";
    const winnerVotes=sorted[0]?.[1]||0;
    return {stns, totalNeeded, isComplete, tally, total, winnerName, winnerVotes};
  };

  const displayWards = filter? WARDS_DATA[filter] || [filter] : ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"];

  // Overall Mumias East winner when all 49 stations done
  const totalMumiasEastReported = ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"].reduce((s,w)=>s+results.filter(r=>r.ward===w).length,0);
  const isAllComplete = totalMumiasEastReported >= 49;
  const overallTally:Record<string,number>={};
  results.filter(r=>["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"].includes(r.ward)).forEach(r=>{
    const ev=r.extra_votes||{}; Object.entries(ev).forEach(([k,v]:any)=>{ overallTally[k]=(overallTally[k]||0)+(v||0); });
  });
  const overallWinner=Object.entries(overallTally).sort((a,b)=>b[1]-a[1])[0];

  return(
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="bg-black text-white p-5">
        <h1 className="text-[28px] font-black">HakiTally - KAKAMEGA COUNTY</h1>
        <p className="text-[13px] opacity-70 mt-1">MCA 2027 Live Portal | All Subcounties and Wards | {stats.reported} / 1200 Stations - FRESH DATA MODE {isAllComplete && "• FINAL RESULTS"}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {["Governor","Senator","Woman Rep","MP","MCA"].map(t=>(
            <button key={t} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${t==="MCA"? "bg-white text-black":"bg-white/10 text-white/60"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* OVERALL WINNER BANNER - Shows when all 49 Mumias East stations submitted */}
      {isAllComplete && overallWinner && (
        <div className="max-w-[1200px] mx-auto p-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 text-center shadow-xl animate-pulse">
            <p className="text-[14px] font-bold opacity-90">FINAL RESULT - MUMIAS EAST - ALL 49 STATIONS REPORTED</p>
            <h2 className="text-[32px] font-black mt-2">🎉 CONGRATULATIONS MCA {overallWinner[0].split(" ")[0].toUpperCase()}! 🎉</h2>
            <p className="text-[18px] mt-1 font-bold">{overallWinner[0]} - {overallWinner[1].toLocaleString()} votes - ELECTED MCA MUMIAS EAST</p>
            <p className="text-[12px] mt-2 opacity-80">Official Winner • HakiTally Verified</p>
          </div>
        </div>
      )}

      <div className="p-4 max-w-[1200px] mx-auto">
        <p className="font-bold text-[13px] text-gray-600">MCA PORTAL - All 12 Subcounties - Click Any Subcounty to Filter</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={()=>setFilter("Mumias East")} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${filter==="Mumias East"? "bg-black text-white":"bg-white"}`}>Mumias East</button>
          {SUBCOUNTIES.map(sc=>(
            <button key={sc} onClick={()=>setFilter(sc)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${filter===sc? "bg-black text-white":"bg-white text-gray-600"}`}>{sc}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {displayWards.map((w:string)=>{
            const {stns,totalNeeded,isComplete,tally,total,winnerName,winnerVotes}=getWardTally(w);
            const winnerShort = MUMIAS_EAST_CANDIDATES.find(c=>winnerName.includes(c.name.split(" ")[0]))?.short || winnerName.split(" ")[0];
            const pctLead = total? Math.round(winnerVotes/total*100):0;

            return(
              <div key={w} className={`rounded-xl p-4 shadow-sm border-l-4 transition-all ${isComplete? "bg-green-50 border-l-green-600 border-2 shadow-lg" : "bg-white border-l-gray-300"}`}>
                <div className="flex justify-between">
                  <p className="font-bold text-[13px]">{w} Ward - {filter} - MCA Race - {stns}/{totalNeeded} stns reported {stns>0 && `• ${total.toLocaleString()} votes`}</p>
                  {isComplete && <span className="bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">COMPLETE</span>}
                </div>

                {/* WINNER CONGRATULATIONS BOX - INSIDE SMALL BOX */}
                {isComplete? (
                  <div className="bg-green-600 text-white rounded-xl p-3 mt-3 text-center">
                    <p className="text-[11px] font-bold opacity-90">WINNER DECLARED - {w.toUpperCase()}</p>
                    <p className="text-[18px] font-black mt-1">🎉 CONGRATULATIONS MCA {winnerShort.toUpperCase()} 🎉</p>
                    <p className="text-[13px] font-bold mt-1">{winnerName} - {winnerVotes.toLocaleString()} votes ({pctLead}%)</p>
                    <p className="text-[10px] mt-1 opacity-80">ELECTED MCA - {w}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {MUMIAS_EAST_CANDIDATES.map(c=>{
                      const key=Object.keys(tally).find(k=>k.includes(c.name.split(" ")[0]));
                      const votes=key? tally[key]:0;
                      const pct=total? Math.round(votes/total*100):0;
                      const isLeading = key===winnerName && total>0;
                      return(
                        <div key={c.name} className="flex justify-between items-center">
                          <div>
                            <p className="text-[13px] font-semibold">{c.name} ({c.party}) {isLeading && <span className="bg-gray-100 text-[9px] px-1 rounded">LEADING</span>}</p>
                            <div className="w-[140px] h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className={`h-full ${c.color}`} style={{width:`${pct}%`}}></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-[14px]">{votes.toLocaleString()} votes</p>
                            <p className="text-[11px] text-gray-500">{pct}%</p>
                          </div>
                        </div>
                      );
                    })}
                    {stns===0 && <p className="text-[12px] text-gray-400">No data yet - submit via Admin</p>}
                  </div>
                )}

                {stns>0 &&!isComplete && <p className="text-[10px] text-green-600 font-bold mt-3">● LIVE - {stns}/{totalNeeded} stations from {w}</p>}
                {isComplete && <p className="text-[10px] text-green-700 font-bold mt-2">✓ FINAL - All {totalNeeded} stations counted</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
