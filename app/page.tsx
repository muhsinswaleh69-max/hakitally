"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function KakamegaGovernorBoard(){
  const [results,setResults]=useState<any[]>([]);

  const fetchResults = async()=>{
    const {data}=await supabase.from("hakitally_results_34a").select("*");
    setResults(data||[]);
  };

  useEffect(()=>{
    fetchResults();
    // NEW: INSTANT LIVE - No refresh needed, replaces auto-refresh every 5s
    const ch=supabase.channel("county-governor-live").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>fetchResults()).subscribe();
    return()=>{supabase.removeChannel(ch)};
  },[]);

  const barasa = results.reduce((s,r)=>s+(r.barasa_votes||0),0);
  const malala = results.reduce((s,r)=>s+(r.malala_votes||0),0);
  const khalwale = results.reduce((s,r)=>s+(r.khalwale_votes||0),0);
  const muhanda = results.reduce((s,r)=>s+(r.muhanda_votes||0),0);
  const total = barasa+malala+khalwale+muhanda || 1;

  const leading = Math.max(barasa,malala,khalwale,muhanda);
  const leadingName = leading===barasa?"BARASA":leading===malala?"MALALA":leading===khalwale?"KHALWALE":"MUHANDA";

  return(
    <div className="min-h-screen bg-[#f2f3f5] p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER - Exact like screenshot */}
        <div className="bg-[#0f3d2e] rounded-[16px] p-6 text-white text-center shadow">
          <h1 className="text-xl md:text-2xl font-black tracking-wide">HakiTally - KAKAMEGA COUNTY</h1>
          <p className="text-sm opacity-90 mt-1">Governor 2027 Live Tally | Form 34A Parallel Count</p>
          <p className="mt-3 font-bold text-sm">{results.length} / 1200 Stations Reported ({Math.round((results.length/1200)*100)}%)</p>
          <div className="w-full bg-white/20 h-2 rounded-full mt-3"><div className="bg-[#6ec1a0] h-2 rounded-full transition-all duration-1000" style={{width:`${(results.length/1200)*100}%`}}></div></div>
          <p className="text-[11px] mt-3 opacity-80">Auto-updates instantly | Leading: {leadingName} <span className="animate-pulse">● LIVE</span></p>
        </div>

        {/* 4 CANDIDATES - Exact like screenshot */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-xl border-l-4 border-l-[#0f3d2e] border shadow-sm p-4">
            <p className="text-[13px] font-semibold">Fernandes Barasa (ODM)</p>
            <p className="text-xl font-black">{barasa.toLocaleString()} <span className="text-xs font-normal text-gray-500">{((barasa/total)*100).toFixed(0)}%</span> {leadingName==="BARASA" && <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded ml-1">● LEADING</span>}</p>
          </div>
          <div className="bg-white rounded-xl border-l-4 border-l-gray-200 border shadow-sm p-4">
            <p className="text-[13px] font-semibold">Cleophas Malala (DCP)</p>
            <p className="text-xl font-black">{malala.toLocaleString()} <span className="text-xs font-normal text-red-400">{((malala/total)*100).toFixed(0)}%</span></p>
          </div>
          <div className="bg-white rounded-xl border-l-4 border-l-yellow-300 border shadow-sm p-4">
            <p className="text-[13px] font-semibold">Boni Khalwale (IND)</p>
            <p className="text-xl font-black">{khalwale.toLocaleString()} <span className="text-xs font-normal text-gray-500">{((khalwale/total)*100).toFixed(0)}%</span></p>
          </div>
          <div className="bg-white rounded-xl border-l-4 border-l-purple-300 border shadow-sm p-4">
            <p className="text-[13px] font-semibold">Elsie Muhanda</p>
            <p className="text-xl font-black">{muhanda.toLocaleString()} <span className="text-xs font-normal text-gray-500">{((muhanda/total)*100).toFixed(0)}%</span></p>
          </div>
        </div>

        {/* By Constituency Live */}
        <div className="bg-white rounded-xl shadow-sm p-5 mt-5">
          <p className="text-xs text-gray-500 mb-3">By Constituency - Live</p>
          {["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"].map(c=>{
            const cResults = results.filter((r:any)=>r.constituency===c);
            const cBarasa = cResults.reduce((s:number,r:any)=>s+(r.barasa_votes||0),0);
            const cMalala = cResults.reduce((s:number,r:any)=>s+(r.malala_votes||0),0);
            const cLead = cBarasa>cMalala?"Barasa":cMalala>cBarasa?"Malala":"-";
            return(
              <div key={c} className="flex justify-between py-2.5 border-b last:border-0 text-sm">
                <span><b>{c}</b> - {cResults.length>0?`${cLead} leading`:"- leading"}</span>
                <span className="text-xs text-gray-400">{cResults.length} stns | {cBarasa+cMalala} votes</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
