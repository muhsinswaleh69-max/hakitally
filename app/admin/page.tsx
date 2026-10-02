"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// YOUR 3 REAL CANDIDATES
const REAL = [
  "Sophia Manyasa (UDA)",
  "Timothy Wanzetse (ODM)",
  "Stanislaus Wanzetse (DCP)"
];

export default function AdminFixed() {
  const [ward, setWard] = useState("Lusheya/Lubinu");
  const [station, setStation] = useState("Emakwale Lubinu");
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [v3, setV3] = useState("");
  const [log, setLog] = useState("Ready...");
  const [loading, setLoading] = useState(false);

  const stations = ward === "Lusheya/Lubinu"
   ? ["Emakwale Lubinu", "Lubinu Primary S1", "Lubinu Primary S2", "Eluche Primary", "Khaimba Primary", "Shibale Primary S1", "Shibale Primary S2"]
    : ward === "East Wanga"
   ? ["East Wanga DEB S1", "Khaunga Primary", "Shianda Primary", "Mwitoti Primary", "Mumias Sugar Sec"]
    : ["Malaha Primary S1", "Malaha Primary S2", "Isongo Primary", "Makunga Primary"];

  const handleSubmit = async () => {
    setLoading(true);
    setLog("Submitting...");
    try {
      if (!station) throw new Error("Pick station");
      if (!v1 &&!v2 &&!v3) throw new Error("Enter at least 1 vote");

      // Build votes object - order MUST match REAL array
      const extra: any = {};
      extra[REAL[0]] = parseInt(v1 || "0");
      extra[REAL[1]] = parseInt(v2 || "0");
      extra[REAL[2]] = parseInt(v3 || "0");

      console.log("INSERTING:", { ward, station, extra });

      // Insert with ALL possible columns to avoid schema error
      const { data, error } = await supabase
       .from("hakitally_results_34a")
       .insert([
          {
            constituency: "Mumias East",
            ward: ward,
            station_name: station,
            extra_votes: extra,
            // add all vote cols as 0 to satisfy old schema
            governor_votes: 0,
            senator_votes: 0,
            womanrep_votes: 0,
            mp_votes: 0,
            mca_votes: parseInt(v1 || "0") + parseInt(v2 || "0") + parseInt(v3 || "0"),
          },
        ])
       .select();

      if (error) {
        console.error(error);
        setLog("❌ ERROR: " + error.message + " | Hint: Go to Supabase -> Table hakitally_results_34a -> RLS -> Disable RLS or Add Policy: Allow INSERT for anon");
        alert("ERROR: " + error.message + "\n\nGo to Supabase Dashboard > Authentication > Policies > hakitally_results_34a > Enable INSERT for anon");
      } else {
        setLog(`✅ SUCCESS! ${station} saved: Sophia=${v1}, Timothy=${v2}, Stanislaus=${v3}. Now check MAIN board - it will update LIVE in 1 sec!`);
        alert(`✅ SAVED! ${ward} - ${station}\n\nSophia Manyasa (UDA): ${v1}\nTimothy Wanzetse (ODM): ${v2}\nStanislaus Wanzetse (DCP): ${v3}\n\nGo to main link NOW - you will see % + ELECTED badge`);
        setV1(""); setV2(""); setV3("");
      }
    } catch (e: any) {
      setLog("❌ CATCH: " + e.message);
      alert("Catch error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-[500px] mx-auto">
        <p className="text-[10px] text-gray-500">Server: Kakamega High School - Auto sync 0.2KB</p>
        <h1 className="font-black text-lg mt-2">HakiTally ADMIN - REAL NAMES FIX</h1>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold">Ward</label>
            <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold">
              <option>East Wanga</option>
              <option>Lusheya/Lubinu</option>
              <option>Malaha/Isongo/Makunga</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold">Station - {ward}</label>
            <select value={station} onChange={(e) => setStation(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold">
              {stations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <p className="text-xs">Selected: <b>{station}</b> | Ward: <b>{ward}</b> | Race: <b>MCA</b></p>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3 border-2">
            <div>
              <label className="font-black text-sm text-green-700">{REAL[0]} - Sophia Manyasa (UDA)</label>
              <input type="number" inputMode="numeric" value={v1} onChange={(e) => setV1(e.target.value)} placeholder="Enter votes" className="w-full p-4 border-2 rounded-xl text-lg font-bold mt-1" />
            </div>
            <div>
              <label className="font-black text-sm text-orange-700">{REAL[1]} - Timothy Wanzetse (ODM)</label>
              <input type="number" inputMode="numeric" value={v2} onChange={(e) => setV2(e.target.value)} placeholder="Enter votes" className="w-full p-4 border-2 rounded-xl text-lg font-bold mt-1" />
            </div>
            <div>
              <label className="font-black text-sm text-purple-700">{REAL[2]} - Stanislaus Wanzetse (DCP)</label>
              <input type="number" inputMode="numeric" value={v3} onChange={(e) => setV3(e.target.value)} placeholder="Enter votes" className="w-full p-4 border-2 rounded-xl text-lg font-bold mt-1" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} type="button" className="w-full bg-[#0a2e1f] text-white font-black p-5 rounded-full text-lg active:scale-95 transition">
            {loading? "Submitting..." : "Submit MCA to Main Server ✓"}
          </button>

          <div className="bg-black text-green-400 p-3 rounded-xl text-xs font-mono min-h-[60px]">{log}</div>

          <div className="text-[11px] text-gray-500">
            <b>IF STILL NOT WORKING:</b><br/>
            1. Supabase Dashboard → Table Editor → hakitally_results_34a → RLS → DISABLE RLS<br/>
            2. Or create Policy: Allow ALL for anon<br/>
            3. Then come back and click again - you will see alert SUCCESS
          </div>
        </div>
      </div>
    </div>
  );
}
