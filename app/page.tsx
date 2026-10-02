"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GovernorBoard() {
  const [results, setResults] = useState<any[]>([]);
  const fetchResults = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*").order("created_at", {ascending:false});
    setResults(data||[]);
  };
  useEffect(() => {
    fetchResults();
    const ch = supabase.channel("gov-live").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>fetchResults()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const barasa = results.reduce((s,r)=>s+(r.barasa_votes||0),0);
  const malala = results.reduce((s,r)=>s+(r.malala_votes||0),0);
  const total = barasa+malala;
  const barasaPct = total?((barasa/total)*100).toFixed(1):"0";
  const malalaPct = total?((malala/total)*100).toFixed(1):"0";
  const locked = results.length;

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-3">
      <div className="max-w-5xl mx-auto bg-white rounded-[24px] border shadow-sm p-6">
        <h1 className="text-center text-[22px] font-black">HakiTally - Kakamega Governor Live</h1>
        <p className="text-center text-xs text-gray-500">Mumias East Constituency | Locked {locked}/45 | <span className="text-green-600 font-bold animate-pulse">● LIVE Governor Tally</span></p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border bg-blue-50 p-5 text-center">
            <p className="text-xs font-bold text-blue-700 uppercase">Governor - Barasa</p>
            <p className="text-3xl font-black mt-2">{barasa.toLocaleString()}</p>
            <p className="text-sm font-bold text-blue-700 mt-1">{barasaPct}%</p>
            <div className="h-2 bg-blue-200 rounded-full mt-3"><div className="h-2 bg-blue-600 rounded-full" style={{width:`${barasaPct}%`}}></div></div>
          </div>
          <div className="rounded-2xl border bg-amber-50 p-5 text-center">
            <p className="text-xs font-bold text-amber-700 uppercase">Governor - Malala</p>
            <p className="text-3xl font-black mt-2">{malala.toLocaleString()}</p>
            <p className="text-sm font-bold text-amber-700 mt-1">{malalaPct}%</p>
            <div className="h-2 bg-amber-200 rounded-full mt-3"><div className="h-2 bg-amber-600 rounded-full" style={{width:`${malalaPct}%`}}></div></div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-3 bg-gray-100 rounded-full"><div className="h-3 bg-black rounded-full transition-all duration-1000" style={{width:`${(locked/45)*100}%`}}></div></div>
          <p className="text-center text-sm font-bold mt-2">{locked}/45 Stations Tallied - Mumias East</p>
        </div>

        <div className="mt-6">
          <h3 className="font-black text-sm">Tallied Stations - Governor Results</h3>
          <div className="mt-2 divide-y text-[13px]">
            {results.map((r:any)=>(
              <div key={r.id} className="flex justify-between py-2.5">
                <span>{r.station_name} <span className="text-gray-400">({r.ward})</span></span>
                <span className="font-mono font-bold">{r.barasa_votes} - {r.malala_votes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
