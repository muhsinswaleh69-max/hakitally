"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PublicBoard() {
  const [results, setResults] = useState<any[]>([]);

  const fetchResults = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*").order("created_at", {ascending: false});
    setResults(data || []);
  };

  useEffect(() => {
    fetchResults();
    // LIVE INSTANT UPDATE - Main Server listens to A,B,C
    const channel = supabase.channel("hakitally-live-board")
     .on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => {
        fetchResults();
      })
     .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const barasa = results.reduce((s,r)=>s+(r.barasa_votes||0),0);
  const malala = results.reduce((s,r)=>s+(r.malala_votes||0),0);
  const total = barasa + malala;
  const barasaPct = total? ((barasa/total)*100).toFixed(1) : "0";
  const malalaPct = total? ((malala/total)*100).toFixed(1) : "0";
  const locked = results.length;
  const totalStations = 45;

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-2 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[20px] shadow-sm border p-5 md:p-8">
        <h1 className="text-2xl md:text-3xl font-black text-center">HakiTally - Mumias East Live</h1>
        <p className="text-center text-gray-500 text-sm mt-1">Live Tally | Locked {locked} | Updates automatically • <span className="text-green-600 font-bold animate-pulse">● LIVE</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 text-center">
            <p className="text-blue-700 font-bold text-sm">Barasa</p>
            <p className="text-4xl font-black mt-1">{barasa.toLocaleString()}</p>
            <p className="text-blue-700 font-bold mt-1">{barasaPct}%</p>
            <div className="w-full bg-blue-200 h-2 rounded-full mt-3"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${barasaPct}%`}}></div></div>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-bold text-sm">Malala</p>
            <p className="text-4xl font-black mt-1">{malala.toLocaleString()}</p>
            <p className="text-amber-700 font-bold mt-1">{malalaPct}%</p>
            <div className="w-full bg-amber-200 h-2 rounded-full mt-3"><div className="bg-amber-500 h-2 rounded-full" style={{width: `${malalaPct}%`}}></div></div>
          </div>
        </div>

        <div className="mt-8">
          <div className="w-full bg-gray-100 rounded-full h-3"><div className="bg-black h-3 rounded-full transition-all duration-1000" style={{width: `${(locked/totalStations)*100}%`}}></div></div>
          <p className="text-center font-bold mt-3">{locked}/{totalStations} Stations Tallied</p>
          <p className="text-center text-[11px] text-gray-400">● LIVE - Auto-updates from all computers A, B, C without refresh</p>
        </div>

        <div className="mt-8">
          <h3 className="font-black text-sm mb-3">Tallied Stations</h3>
          <div className="divide-y">
            {results.map((r:any)=>(
              <div key={r.id} className="flex justify-between py-3 text-[13px]">
                <span className="font-medium">{r.station_name} <span className="text-gray-400">({r.ward})</span></span>
                <span className="font-mono">{r.barasa_votes} - {r.malala_votes}</span>
              </div>
            ))}
            {locked===0 && <p className="text-center text-gray-400 py-6">No stations yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
