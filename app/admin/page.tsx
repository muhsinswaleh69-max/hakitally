"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATIONS_LIST = [
  { name: "Bumwende Primary", ward: "Lusheya/Lubinu" },
  { name: "Emakale Primary", ward: "Lusheya/Lubinu" },
  { name: "Indangalasia Primary", ward: "Lusheya/Lubinu" },
  { name: "Lubinu Primary School", ward: "Lusheya/Lubinu" },
  { name: "Lusheya Primary", ward: "Lusheya/Lubinu" },
  { name: "Lubinu Sec School", ward: "Lusheya/Lubinu" },
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
    const channel = supabase
    .channel("admin-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => {
        fetchResults();
      })
    .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const lockedStations = results.map((r:any) => r.station_name);
  const filteredStations = STATIONS_LIST.filter(s => s.ward === ward);
  // FIXED LINE - now always boolean
  const isLocked: boolean = station? lockedStations.includes(station) : false;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formFile) { alert("Form 34A photo is REQUIRED!"); return; }
    if (isLocked) { alert("This station already locked!"); return; }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${station.replace(/\s/g,"_")}.jpg`;
      const { error: upErr } = await supabase.storage.from("form34a").upload(fileName, formFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("form34a").getPublicUrl(fileName);

      const { error } = await supabase.from("hakitally_results_34a").insert({
        station_name: station,
        ward: ward,
        constituency: "Mumias East",
        barasa_votes: parseInt(barasa),
        malala_votes: parseInt(malala),
        form_34a_url: urlData.publicUrl,
      });
      if (error) throw error;

      alert("Saved! Main server will update instantly.");
      setStation(""); setBarasa(""); setMalala(""); setFormFile(null);
      fetchResults();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-5">
        <h1 className="font-bold text-lg">HakiTally Admin - Mumias East</h1>
        <p className="text-sm">Live Tally | Locked: {results.length} <span className="text-green-600">● LIVE</span></p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full border p-2 rounded">
            <option>Lusheya/Lubinu</option>
            <option>East Wanga</option>
          </select>

          <select value={station} onChange={e=>setStation(e.target.value)} className="w-full border p-2 rounded" required>
            <option value="">Select Station</option>
            {filteredStations.map(s => (
              <option key={s.name} value={s.name} disabled={lockedStations.includes(s.name)}>
                {s.name} {lockedStations.includes(s.name)? "🔒 Locked" : ""}
              </option>
            ))}
          </select>

          <input type="number" placeholder="Barasa Votes" value={barasa} onChange={e=>setBarasa(e.target.value)} className="w-full border p-2 rounded" required />
          <input type="number" placeholder="Malala Votes" value={malala} onChange={e=>setMalala(e.target.value)} className="w-full border p-2 rounded" required />

          <div>
            <label className="text-sm font-bold">Form 34A Photo (REQUIRED) *</label>
            <input type="file" accept="image/*" onChange={e=>setFormFile(e.target.files?.[0]||null)} className="w-full border p-2 rounded" required />
          </div>

          <button disabled={uploading || isLocked} className="w-full bg-black text-white p-3 rounded font-bold disabled:bg-gray-400">
            {uploading? "Uploading..." : "Lock & Upload to Live Server"}
          </button>
        </form>
      </div>
    </div>
  );
}
