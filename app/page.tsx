"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PublicBoard() {
  const [results, setResults] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: resData } = await supabase.from("hakitally_results_34a").select("*");
    const { data: stationData } = await supabase.from("hakitally_stations").select("*").eq("constituency", "Mumias East");
    setResults(resData || []);
    setStations(stationData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // REAL-TIME LIVE - No refresh needed
    const channel = supabase
     .channel("public-live-board")
     .on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => {
        fetchData(); // auto refresh when A, B, C uploads
      })
     .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const barasaTotal = results.reduce((s, r) => s + (r.barasa_votes || 0), 0);
  const malalaTotal = results.reduce((s, r) => s + (r.malala_votes || 0), 0);
  const totalStations = stations.length || 45;
  const locked = results.length;

  if (loading) return <div className="p-10 text-center">Loading HakiTally Live...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-center">HakiTally - Mumias East Live</h1>
        <p className="text-center text-sm text-gray-500">Live Tally | Locked: {locked} | Updates automatically</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-xl text-center border-2 border-blue-200">
            <h2 className="font-bold text-blue-800">Barasa</h2>
            <p className="text-3xl font-black">{barasaTotal.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
            <h2 className="font-bold text-green-800">Malala</h2>
            <p className="text-3xl font-black">{malalaTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-black h-4 rounded-full" style={{ width: `${(locked/totalStations)*100}%` }}></div>
          </div>
          <p className="mt-2 font-bold">{locked}/{totalStations} Stations Tallied</p>
          <p className="text-xs text-green-600 animate-pulse">● LIVE - Auto-updates from all computers</p>
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-2">Tallied Stations</h3>
          {results.map((r) => (
            <div key={r.id} className="flex justify-between border-b py-2 text-sm">
              <span>{r.station_name} ({r.ward})</span>
              <span>{r.barasa_votes} - {r.malala_votes}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
