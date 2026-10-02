"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ALL WARDS FOR MUMIAS EAST - 45 STATIONS
const ALL_STATIONS = [
  // Lusheya/Lubinu - 15 stations
  { name: "Emakwale Lubinu", ward: "Lusheya/Lubinu" },
  { name: "Indangalasia Primary", ward: "Lusheya/Lubinu" },
  { name: "Lubinu Primary", ward: "Lusheya/Lubinu" },
  { name: "Lubinu Sec", ward: "Lusheya/Lubinu" },
  { name: "Lusheya Primary", ward: "Lusheya/Lubinu" },
  { name: "Shibale Primary", ward: "Lusheya/Lubinu" },
  { name: "Emakale Primary", ward: "Lusheya/Lubinu" },
  { name: "Bumwende Primary", ward: "Lusheya/Lubinu" },
  // East Wanga - 15 stations
  { name: "Eluche Primary", ward: "East Wanga" },
  { name: "Emakhola Primary", ward: "East Wanga" },
  { name: "Mumias East DEB", ward: "East Wanga" },
  { name: "Shianda Primary", ward: "East Wanga" },
  // Malaha/Isongo/Makunga - 15 stations
  { name: "Isongo Primary", ward: "Malaha/Isongo/Makunga" },
  { name: "Malaha Primary", ward: "Malaha/Isongo/Makunga" },
  { name: "Makunga Primary", ward: "Malaha/Isongo/Makunga" },
  { name: "Khaunga Primary", ward: "Malaha/Isongo/Makunga" },
];

export default function AdminPage() {
  const [results, setResults] = useState<any[]>([]);
  const [ward, setWard] = useState("Lusheya/Lubinu");
  const [station, setStation] = useState("");
  const [barasa, setBarasa] = useState("");
  const [malala, setMalala] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchResults = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*");
    setResults(data || []);
  };

  useEffect(() => {
    fetchResults();
    const channel = supabase.channel("admin-live-all").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, ()=>fetchResults()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const lockedStations = results.map((r:any)=>r.station_name);
  const filtered = ALL_STATIONS.filter(s=>s.ward===ward);
  const isLocked: boolean = station? lockedStations.includes(station) : false;
  const wardCount = results.filter((r:any)=>r.ward===ward).length;

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!formFile) { alert("Form 34A is REQUIRED"); return; }
    if (isLocked) { alert("Already locked"); return; }
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${station}.jpg`;
      await supabase.storage.from("form34a").upload(fileName, formFile);
      const { data: url } = supabase.storage.from("form34a").getPublicUrl(fileName);
      const { error } = await supabase.from("hakitally_results_34a").insert({
        station_name: station, ward, constituency: "Mumias East",
        barasa_votes: parseInt(barasa), malala_votes: parseInt(malala),
        form_34a_url: url.publicUrl
      });
      if (error) throw error;
      alert(`Saved ${station}! Main board updated LIVE`);
      setStation(""); setBarasa(""); setMalala(""); setFormFile(null);
    } catch(err:any){ alert(err.message); }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="font-black">HakiTally Admin - Mumias East</h1>
        <p className="text-xs text-gray-500">Live Tally | Locked: {results.length}/45 | Ward: {ward} ({wardCount}/{filtered.length}) <span className="text-green-600">● LIVE</span></p>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full border p-3 rounded-xl">
            <option>Lusheya/Lubinu</option>
            <option>East Wanga</option>
            <option>Malaha/Isongo/Makunga</option>
          </select>
          <select value={station} onChange={e=>setStation(e.target.value)} className="w-full border p-3 rounded-xl" required>
            <option value="">Select Station</option>
            {filtered.map(s=><option key={s.name} value={s.name} disabled={lockedStations.includes(s.name)}>{s.name} {lockedStations.includes(s.name)? "🔒":""}</option>)}
          </select>
          <input type="number" placeholder="Barasa Votes" value={barasa} onChange={e=>setBarasa(e.target.value)} className="w-full border p-3 rounded-xl" required />
          <input type="number" placeholder="Malala Votes" value={malala} onChange={e=>setMalala(e.target.value)} className="w-full border p-3 rounded-xl" required />
          <input type="file" accept="image/*" onChange={e=>setFormFile(e.target.files?.[0]||null)} className="w-full border p-3 rounded-xl" required />
          <button disabled={uploading || isLocked} className="w-full bg-black text-white p-3 rounded-xl font-bold disabled:bg-gray-300">
            {uploading? "Uploading...": isLocked? "Station Locked":"Lock & Push LIVE"}
          </button>
        </form>
      </div>
    </div>
  );
}
