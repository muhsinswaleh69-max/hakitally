"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const SUBCOUNTIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

// MCA Wards per Subcounty - with real candidates for Mumias East only
const WARDS_DATA: any = {
  "Lugari": ["Mautuma","Lugari","Lumakanda"],
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central","Mumias North","Etenje","Musanda"],
};

const MUMIAS_EAST_CANDIDATES = [
  { name: "Sophia Manyasa", party: "UDA", color: "bg-green-600" },
  { name: "Timothy Wanzetse", party: "ODM", color: "bg-orange-500" },
  { name: "Stanislaus Wanzetse", party: "DCP", color: "bg-purple-600" },
];

export default function MCAPortal(){
  const [activeTab,setActiveTab]=useState("MCA");
  const [filter,setFilter]=useState<string|null>(null);
  const [results,setResults]=useState<any[]>([]);
  const [stats,setStats]=useState({reported:0,total:1200});

  const fetchAll=async()=>{
    const {data}=await supabase.from("hakitally_results_34a").select("*");
    if(data){
      setResults(data);
      setStats({reported: new Set(data.map((d:any)=>d.station_name)).size, total:1200});
    }
  };

  useEffect(()=>{
    fetchAll();
    const ch=supabase.channel("mca-live").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe();
    const iv=setInterval(fetchAll,3000);
    return()=>{supabase.removeChannel(ch); clearInterval(iv);}
  },[]);

  const getWardTally=(wardName:string)=>{
    const rows=results.filter(r=>r.ward===wardName);
    const stns=rows.length;
    const tally:Record<string,number>={};
    rows.forEach(r=>{
      const ev=r.extra_votes||{};
      Object.entries(ev).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+(v||0); });
    });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    return {stns, tally, total};
  };

  const allWards = filter? (WARDS_DATA[filter] || [filter]) : Object.entries(WARDS_DATA).flatMap(([sc,wards]:any)=>wards.map((w:string)=>({sc,w})));

  return(
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header - EXACT as your screenshot */}
      <div className="bg-black text-white p-5">
        <h1 className="text-[28px] font-black tracking-wide">HakiTally - KAKAMEGA COUNTY</h1>
        <p className="text-[14px] opacity-70 mt-1">MCA 2027 Live Portal | All Subcounties and Wards | {stats.reported} / {stats.total} Stations - FRESH DATA MODE</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {["Governor","Senator","Woman Rep","MP","MCA"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${activeTab===t? "bg-white text-black":"bg-white/10 text-white/60"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-[1200px] mx-auto">
        <p className="font-bold text-[13px] text-gray-600">MCA PORTAL - All 12 Subcounties - Click Any Subcounty to Filter</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={()=>setFilter(null)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${!filter? "bg-black text-white":"bg-white"}`}>All</button>
          {SUBCOUNTIES.map(sc=>(
            <button key={sc} onClick={()=>setFilter(sc)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${filter===sc? "bg-black text-white":"bg-white text-gray-600"}`}>{sc}</button>
          ))}
        </div>

        {/* Wards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {(filter? WARDS_DATA[filter]?.map((w:string)=>({sc:filter,w})) || [] : Object.entries(WARDS_DATA).flatMap(([sc,wards]:any)=>wards.map((w:string)=>({sc,w})))).map(({sc,w}:any)=>{
            const {stns,tally,total}=getWardTally(w);
            const isMumiasEast = ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"].includes(w);

            return(
              <div key={w} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-l-gray-300">
                <p className="font-bold text-[13px]">{w} Ward - {sc} - MCA Race - {stns} stns reported {stns>0 && `• ${total} votes`}</p>

                <div className="mt-4 space-y-3">
                  {isMumiasEast? MUMIAS_EAST_CANDIDATES.map(c=>{
                    const key=Object.keys(tally).find(k=>k.includes(c.name.split(" ")[0]));
                    const votes=key? tally[key]:0;
                    const pct=total? Math.round(votes/total*100):0;
                    return(
                      <div key={c.name} className="flex justify-between items-center">
                        <div>
                          <p className="text-[13px] font-semibold">{c.name} ({c.party})</p>
                          <div className="w-[140px] h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full ${c.color} transition-all`} style={{width:`${pct}%`}}></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[14px]">{votes.toLocaleString()} votes</p>
                          <p className="text-[11px] text-gray-500">{pct}% {votes>0 && total>0 && votes===Math.max(...Object.values(tally) as number[]) && <span className="bg-green-100 text-green-700 px-1 rounded font-bold">LEADING</span>}</p>
                        </div>
                      </div>
                    );
                  }) : ["MCA Candidate A (ODM)","MCA Candidate B (UDA)","MCA Candidate C (IND)"].map(name=>(
                    <div key={name} className="flex justify-between">
                      <p className="text-[13px] text-gray-600">{name}</p>
                      <p className="text-[13px] font-bold">0 votes</p>
                    </div>
                  ))}
                </div>

                {isMumiasEast && stns>0 && <p className="text-[10px] text-green-600 font-bold mt-3">● LIVE - {stns} stations from {w}</p>}
                {!isMumiasEast && <p className="text-[10px] text-gray-400 mt-3">Vote Flow<br/>No Form 35A yet - Enter via admin</p>}
              </div>
            );
          })}
        </div>

        {/* Show other subcounties as empty if filter null */}
        {!filter && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Lugari","Likuyani","Malava","Lurambi"].map(sc=> WARDS_DATA[sc]?.slice(0,1).map((w:string)=>{
              const {stns}=getWardTally(w);
              return(
                <div key={sc+"-"+w} className="bg-white rounded-xl p-4 shadow-sm border-l-4">
                  <p className="font-bold text-[13px]">{w} Ward - {sc} - MCA Race - {stns} stns reported</p>
                  <div className="mt-3 space-y-2 text-[13px] text-gray-500">
                    <div className="flex justify-between"><span>MCA Candidate A (ODM)</span><span className="font-bold">0 votes</span></div>
                    <div className="flex justify-between"><span>MCA Candidate B (UDA)</span><span className="font-bold">0 votes</span></div>
                    <div className="flex justify-between"><span>MCA Candidate C (IND)</span><span className="font-bold">0 votes</span></div>
                  </div>
                </div>
              );
            }))}
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400 mt-8">Auto-refresh 3s • {stats.reported} stations live • Click Mumias East to see Sophia Manyasa live tally</p>
      </div>
    </div>
  );
}
