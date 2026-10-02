"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Governor candidates from your screenshot
const GOV_CANDIDATES = [
  { name: "Fernandes Barasa", party: "ODM", color: "border-l-[#0a2e1f] bg-white", textColor: "text-black" },
  { name: "Cleophas Malala", party: "DCP", color: "border-l-gray-200 bg-white", textColor: "text-black" },
  { name: "Boni Khalwale", party: "IND", color: "border-l-yellow-400 bg-white", textColor: "text-black" },
  { name: "Elsie Muhanda", party: "", color: "border-l-purple-300 bg-white", textColor: "text-black" },
  // Hidden MCA aggregation (Sophia etc will auto appear if you insert with ward data)
];

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStations: 1200, reported: 0, totalVotes: 0, leading: "BARASA" });
  const [tally, setTally] = useState<Record<string, number>>({});

  const fetchResults = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*");
    if (!data) return;
    setResults(data);

    // Aggregate votes from extra_votes field
    const agg: Record<string, number> = {};
    data.forEach((row: any) => {
      const ev = row.extra_votes || {};
      Object.keys(ev).forEach((k) => {
        agg[k] = (agg[k] || 0) + (parseInt(ev[k]) || 0);
      });
      // Also support direct columns if exist
      if (row.candidate_name) agg[row.candidate_name] = (agg[row.candidate_name] || 0) + (row.votes || 0);
    });
    setTally(agg);

    const totalVotes = Object.values(agg).reduce((a: number, b: number) => a + b, 0) as number;
    const reported = new Set(data.map((d: any) => d.station_name)).size;

    // Find leading
    let leadingName = "BARASA";
    let max = 0;
    Object.entries(agg).forEach(([k, v]) => {
      if (v > max) { max = v; leadingName = k.split(" ")[0].toUpperCase(); }
    });

    setStats({ totalStations: 1200, reported, totalVotes, leading: leadingName });
  };

  useEffect(() => {
    fetchResults();
    const channel = supabase.channel("hakitally").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => fetchResults()).subscribe();
    const interval = setInterval(fetchResults, 3000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, []);

  const total = stats.totalVotes || 1;
  const getVotes = (search: string) => {
    // match Fernandes Barasa
    const key = Object.keys(tally).find(k => k.toLowerCase().includes(search.toLowerCase()));
    return key? tally[key] : 0;
  };

  const barasa = getVotes("Barasa") || 50672;
  const malala = getVotes("Malala") || 25731;
  const khalwale = getVotes("Khalwale") || 10661;
  const elsie = getVotes("Muhanda") || getVotes("Elsie") || 7123;

  // If live data is empty, show demo from screenshot, else show live
  const isLive = Object.keys(tally).length > 0;
  const display = {
    barasa: isLive? getVotes("Barasa") : 50672,
    malala: isLive? getVotes("Malala") : 25731,
    khalwale: isLive? getVotes("Khalwale") : 10661,
    elsie: isLive? getVotes("Elsie") : 7123,
  };
  const sumDisplay = display.barasa + display.malala + display.khalwale + display.elsie || 1;

  const constituencies = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

  const getConstStats = (constName: string) => {
    const rows = results.filter((r: any) => r.constituency?.toLowerCase() === constName.toLowerCase() || r.ward?.toLowerCase().includes(constName.toLowerCase()));
    const stns = rows.length;
    const votes = rows.reduce((s: number, r: any) => s + (r.mca_votes || Object.values(r.extra_votes||{}).reduce((a:any,b:any)=>a+b,0)), 0);
    return { stns, votes };
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] p-3">
      <div className="max-w-[600px] mx-auto">
        {/* Header - matches screenshot dark green */}
        <div className="bg-[#0f3d26] rounded-[20px] p-6 text-white text-center shadow-lg">
          <h1 className="text-[26px] font-black leading-tight tracking-wide">HakiTally - KAKAMEGA<br/>COUNTY</h1>
          <p className="text-[15px] mt-2 opacity-90">Governor 2027 Live Tally | Form 34A Parallel Count</p>
          <p className="text-[18px] font-bold mt-4">{stats.reported || 7} / {stats.totalStations} Stations Reported ({Math.round((stats.reported||7)/stats.totalStations*100)}%)</p>
          <div className="w-full h-[10px] bg-white/20 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#4ade80] rounded-full transition-all duration-1000" style={{ width: `${Math.max(1, ((stats.reported||7)/stats.totalStations)*100)}%` }}></div>
          </div>
          <p className="text-[13px] mt-3 opacity-80">Auto-updates instantly | Leading: {stats.leading} ● LIVE</p>
        </div>

        {/* Candidate Cards - 2x2 grid as screenshot */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-[5px] border-l-[#0a2e1f] relative">
            <p className="text-[15px] font-semibold">Fernandes Barasa<br/>(ODM)</p>
            <p className="text-[26px] font-black mt-1">{display.barasa.toLocaleString()} <span className="text-[16px] font-semibold text-gray-500">{Math.round(display.barasa/sumDisplay*100)}%</span></p>
            {display.barasa >= display.malala && display.barasa >= display.khalwale && <span className="inline-block mt-2 bg-gray-100 text-[12px] font-black px-2.5 py-1 rounded-md">LEADING</span>}
            <div className="absolute top-4 right-3 w-7 h-7 bg-gray-100 rounded flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full"></div></div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-[5px] border-l-gray-100">
            <p className="text-[15px] font-semibold">Cleophas Malala<br/>(DCP)</p>
            <p className="text-[26px] font-black mt-1">{display.malala.toLocaleString()} <span className="text-[16px] font-semibold text-red-400">{Math.round(display.malala/sumDisplay*100)}%</span></p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-[5px] border-l-yellow-400">
            <p className="text-[15px] font-semibold">Boni Khalwale (IND)</p>
            <p className="text-[26px] font-black mt-1">{display.khalwale.toLocaleString()} <span className="text-[16px] font-semibold text-gray-500">{Math.round(display.khalwale/sumDisplay*100)}%</span></p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border-l-[5px] border-l-purple-300">
            <p className="text-[15px] font-semibold">Elsie Muhanda</p>
            <p className="text-[26px] font-black mt-1">{display.elsie.toLocaleString()} <span className="text-[16px] font-semibold text-gray-500">{Math.round(display.elsie/sumDisplay*100)}%</span></p>
          </div>
        </div>

        {/* By Constituency - Live */}
        <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm">
          <p className="text-gray-500 text-[14px] mb-3">By Constituency - Live</p>
          {constituencies.map((c) => {
            const s = getConstStats(c);
            return (
              <div key={c} className="flex justify-between py-3 border-b last:border-0">
                <p className="font-bold text-[16px]">{c} - <span className="font-normal">- leading</span></p>
                <p className="text-gray-400 text-[14px]">{s.stns} stns | {s.votes} votes</p>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-gray-400 mt-4">HakiTally • Updates every 3 sec • Supabase Realtime • {isLive? "LIVE DATA" : "DEMO (waiting for Admin submissions)"}</div>
      </div>
    </div>
  );
}
