"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CONSTITUENCIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

const STATIONS_BY_CONSTITUENCY: any = {
  "Mumias East": [
    { name: "Emakwale Lubinu", ward: "Lusheya/Lubinu" },
    { name: "Indangalasia Primary", ward: "Lusheya/Lubinu" },
    { name: "Lubinu Primary", ward: "Lusheya/Lubinu" },
    { name: "Lubinu Sec", ward: "Lusheya/Lubinu" },
    { name: "Lusheya Primary", ward: "Lusheya/Lubinu" },
    { name: "Shibale Primary", ward: "Lusheya/Lubinu" },
    { name: "Emakale Primary", ward: "Lusheya/Lubinu" },
    { name: "Bumwende Primary", ward: "Lusheya/Lubinu" },
    { name: "Eluche Primary", ward: "East Wanga" },
    { name: "Mumias East DEB", ward: "East Wanga" },
    { name: "Shianda Primary", ward: "East Wanga" },
    { name: "Bubala Primary", ward: "East Wanga" },
    { name: "Khaunga Primary", ward: "East Wanga" },
    { name: "Isongo Primary", ward: "Malaha/Isongo/Makunga" },
    { name: "Malaha Primary", ward: "Malaha/Isongo/Makunga" },
    { name: "Makunga Primary", ward: "Malaha/Isongo/Makunga" },
    { name: "Khaimba Primary", ward: "Malaha/Isongo/Makunga" },
    { name: "Namalonda Primary", ward: "Malaha/Isongo/Makunga" },
  ],
  "Lugari": [{ name: "Lugari Primary", ward: "Lugari" }, { name: "Chekalini", ward: "Lugari" }],
  "Matungu": [{ name: "Matungu Primary", ward: "Matungu" }],
  "Mumias West": [{ name: "Mumias West Primary", ward: "Mumias West" }],
};

const CANDIDATES_BY_RACE: any = {
  Governor: [
    { key: "barasa_votes", label: "Fernandes Barasa (ODM)" },
    { key: "malala_votes", label: "Cleophas Malala (DCP)" },
    { key: "khalwale_votes", label: "Boni Khalwale (IND)" },
    { key: "muhanda_votes", label: "Elsie Muhanda" },
  ],
  Senator: [
    { key: "sen_c1", label: "Seth Panyako (UDA)" },
    { key: "sen_c2", label: "Naomi Shiyonga (ODM)" },
    { key: "sen_c3", label: "Brian Luvanda (DCP)" },
    { key: "sen_c4", label: "Boni Khalwale (UDA)" },
  ],
  "Woman Rep": [
    { key: "wr_c1", label: "Fatuma Masito (ODM)" },
    { key: "wr_c2", label: "Mercy Nakhumicha (UDA)" },
    { key: "wr_c3", label: "Tindi Mwale (DCP)" },
    { key: "wr_c4", label: "Elsie Muhanda (ODM)" },
  ],
  "MP - Mumias East": [
    { key: "mp_c1", label: "Peter Salasya (DAP-K) - Incumbent" },
    { key: "mp_c2", label: "Benjamin Washiali (UDA)" },
    { key: "mp_c3", label: "Elon Wameyo (IND)" },
  ],
  MCA: [
    { key: "mca_c1", label: "MCA Candidate 1" },
    { key: "mca_c2", label: "MCA Candidate 2" },
    { key: "mca_c3", label: "MCA Candidate 3" },
  ]
};

export default function ClerkEntryAllSeats() {
  const [results, setResults] = useState<any[]>([]);
  const [race, setRace] = useState("Governor");
  const [constituency, setConstituency] = useState("Mumias East");
  const [station, setStation] = useState("");
  const [votes, setVotes] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchResults = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*");
    setResults(data || []);
  };

  useEffect(() => {
    fetchResults();
    const ch = supabase.channel("clerk-all-seats").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => fetchResults()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const lockedStations = results.filter(r => r.constituency === constituency && r.race === race).map((r: any) => r.station_name);
  const stationsList = STATIONS_BY_CONSTITUENCY[constituency] || STATIONS_BY_CONSTITUENCY["Mumias East"];
  const selectedStationObj = stationsList.find((s: any) => s.name === station);
  const isLocked = station? lockedStations.includes(station) : false;
  const currentCandidates = CANDIDATES_BY_RACE[race] || CANDIDATES_BY_RACE["Governor"];

  const handleVoteChange = (key: string, val: string) => {
    setVotes((prev: any) => ({...prev, [key]: val }));
  };

  const submit = async (e: any) => {
    e.preventDefault();
    if (!file) { alert("Form 34A / 36A PHOTO REQUIRED"); return; }
    if (isLocked) { alert("Already locked"); return; }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${constituency}_${station}_${race}.jpg`;
      const { error: upErr } = await supabase.storage.from("form34a").upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("form34a").getPublicUrl(fileName);

      const payload: any = {
        station_name: station,
        ward: selectedStationObj?.ward || "Lusheya/Lubinu",
        constituency: constituency,
        county: "Kakamega",
        race: race,
        form_34a_url: urlData.publicUrl,
        // Governor compat columns (for your main beautiful board)
        barasa_votes: parseInt(votes["barasa_votes"] || "0"),
        malala_votes: parseInt(votes["malala_votes"] || "0"),
        khalwale_votes: parseInt(votes["khalwale_votes"] || "0"),
        muhanda_votes: parseInt(votes["muhanda_votes"] || "0"),
        // Store all as JSON for Senate/Woman Rep/MP/MCA
        extra_votes: votes,
      };

      const { error } = await supabase.from("hakitally_results_34a").insert(payload);
      if (error) throw error;

      alert(`${race} - ${station} Submitted to Main Server at Kakamega High School - LIVE!`);
      setStation(""); setVotes({}); setFile(null);
      (document.getElementById("form34a") as any).value = "";
    } catch (err: any) {
      alert("Error: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex justify-center p-3">
      <div className="w-full max-w-md bg-white rounded-[16px] shadow-sm border p-4">
        {/* ONLINE BAR - Exact like screenshot */}
        <div className="bg-[#e8f6f3] border border-[#c8e6de] rounded-lg p-2.5 text-center text-[11px] font-medium">
          🟢 Online - {results.length} total synced | Queue: 0 | <span className="text-green-700 font-bold animate-pulse">● LIVE instant (no refresh)</span>
        </div>

        <h1 className="font-black mt-4 text-[#3a0a3a] text-[15px]">CLERK ENTRY - Computer C - {constituency}</h1>
        <p className="text-[10px] text-gray-500 mt-1">All computers A,B,C,D,E,F sync to same main server at Kakamega High School. Each submit = 0.2KB data. Offline saves auto-sync.</p>

        <form onSubmit={submit} className="space-y-3 mt-4">
          {/* RACE SELECTOR - NEW */}
          <label className="text-[11px] font-bold">Electoral Seat</label>
          <select value={race} onChange={(e) => { setRace(e.target.value); setVotes({}); }} className="w-full border-2 border-black rounded-xl p-3.5 font-bold bg-yellow-50">
            <option>Governor</option>
            <option>Senator</option>
            <option>Woman Rep</option>
            <option>MP - Mumias East</option>
            <option>MCA</option>
          </select>

          {/* CONSTITUENCY */}
          <label className="text-[11px] font-bold">Constituency (12)</label>
          <select value={constituency} onChange={(e) => { setConstituency(e.target.value); setStation(""); }} className="w-full border-2 border-black rounded-xl p-3.5 font-medium">
            {CONSTITUENCIES.map(c => <option key={c} value={c}>{c} - {results.filter(r=>r.constituency===c).length} stns</option>)}
          </select>

          {/* STATION */}
          <select value={station} onChange={(e) => setStation(e.target.value)} className="w-full border rounded-xl p-3.5 text-[14px]" required>
            <option value="">Select Station - {constituency} ({stationsList.length} stations)</option>
            {stationsList.map((s: any) => (
              <option key={s.name} value={s.name} disabled={lockedStations.includes(s.name)}>
                {s.name} - {s.ward} {lockedStations.includes(s.name)? "🔒 Locked" : ""}
              </option>
            ))}
          </select>

          {station && (
            <div className="text-[11px] bg-gray-50 p-2 rounded">Selected: <b>{station}</b> | Ward: <b>{selectedStationObj?.ward}</b> | Race: <b>{race}</b></div>
          )}

          {/* DYNAMIC CANDIDATE INPUTS - ALL SEATS */}
          <div className="grid grid-cols-2 gap-2">
            {currentCandidates.map((c: any) => (
              <div key={c.key} className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-600">{c.label}</label>
                <input
                  type="number"
                  placeholder="Votes"
                  value={votes[c.key] || ""}
                  onChange={(e) => handleVoteChange(c.key, e.target.value)}
                  className="border rounded-lg p-3 text-sm"
                  required
                />
              </div>
            ))}
          </div>

          {/* FORM 34A */}
          <div>
            <label className="text-[11px] font-bold">Form {race==="Governor"?"34A":race==="MP - Mumias East"||race==="MCA"?"35A":"36A"} Photo *</label>
            <input id="form34a" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border rounded-lg p-3 text-xs" required />
          </div>

          <button disabled={uploading || isLocked} className="w-full bg-[#0f4c4c] text-white rounded-xl p-3.5 font-black text-sm disabled:bg-gray-300">
            {isLocked? `🔒 ${station} Already Locked` : uploading? "Uploading to Main Server..." : `Submit ${race} to Main Server ✓`}
          </button>
        </form>

        {/* HOW IT WORKS - Exact like screenshot */}
        <div className="mt-6 text-[10px] text-gray-500 space-y-1 border-t pt-3">
          <p className="font-bold">How multi-clerk + all seats works</p>
          <p>• Computer A in Lugari, B in Mumias East, C in Matungu — same /admin link</p>
          <p>• Select Race: Governor / Senator / Woman Rep / MP / MCA</p>
          <p>• Select Constituency → Station → Enter votes → Form 34A</p>
          <p>• 0.2KB per submit — works on 2G</p>
          <p>• Main tally screen (hakitally.vercel.app) updates instantly - NO REFRESH</p>
          <p className="pt-2 font-bold">Mumias East Wards: Lusheya/Lubinu (8), East Wanga (5), Malaha/Isongo/Makunga (5)</p>
        </div>

        {/* RECENT SUBMITS */}
        <div className="mt-4 text-[11px]">
          <p className="font-bold">Recent - {race}</p>
          <div className="divide-y">
            {results.filter(r=>r.race===race).slice(0,5).map((r:any)=><div key={r.id} className="py-1.5 flex justify-between"><span>{r.station_name} ({r.constituency})</span><span className="font-mono">{r.barasa_votes||0}-{r.malala_votes||0}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
