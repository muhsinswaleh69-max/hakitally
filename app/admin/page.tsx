"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REAL = [
  "Sophia Manyasa (UDA)",
  "Timothy Wanzetse (ODM)",
  "Stanislaus Wanzetse (DCP)"
];

const STATIONS: any = {
  "Lusheya/Lubinu": ["Emakwale Lubinu","Lubinu Primary S1","Lubinu Primary S2","Eluche Primary","Khaimba Primary","Shibale Primary S1","Shibale Primary S2","Emukaya Primary"],
  "East Wanga": ["East Wanga DEB S1","Khaunga Primary","Shianda Primary","Mwitoti Primary","Mumias Sugar Sec","Shibale Primary S1"],
  "Malaha/Isongo/Makunga": ["Malaha Primary S1","Malaha Primary S2","Isongo Primary","Makunga Primary","Kholera Primary"]
};

export default function Admin() {
  const [ward, setWard] = useState("Lusheya/Lubinu");
  const [station, setStation] = useState("Emakwale Lubinu");
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [v3, setV3] = useState("");
  const [msg, setMsg] = useState("Ready to submit - Example: 1000, 100, 30");

  const handleSubmit = async () => {
    setMsg("Submitting...");
    try {
      const extra: any = {};
      extra[REAL[0]] = parseInt(v1 || "0");
      extra[REAL[1]] = parseInt(v2 || "0");
      extra[REAL[2]] = parseInt(v3 || "0");

      // FIX: Insert ONLY 4 columns that exist in your table - no mca_votes
      const { data, error } = await supabase
       .from("hakitally_results_34a")
       .insert([{
          constituency: "Mumias East",
          ward: ward,
          station_name: station,
          extra_votes: extra
        }])
       .select();

      if (error) {
        setMsg("❌ Error: " + error.message);
        alert("SUPABASE ERROR: " + error.message + "\n\nRun this SQL in Supabase SQL Editor:\nALTER TABLE hakitally_results_34a DISABLE ROW LEVEL SECURITY;");
      } else {
        setMsg(`✅ SAVED! ${ward} - ${station} -> Sophia=${v1}, Timothy=${v2}, Stanislaus=${v3} - Check main board NOW LIVE`);
        alert(`✅ SUCCESS!\n${ward} - ${station}\nSophia Manyasa (UDA): ${v1}\nTimothy Wanzetse (ODM): ${v2}\nStanislaus Wanzetse (DCP): ${v3}\n\nMain board will show % and GREEN ELECTED badge`);
        setV1(""); setV2(""); setV3("");
      }
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow p-5">
        <p className="text-[11px] text-gray-500">All computers sync to same main server at Kakamega High School</p>

        <label className="font-black mt-4 block text-sm">Electoral Seat</label>
        <select className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1"><option>MCA</option></select>

        <label className="font-bold mt-4 block text-sm">Ward - Mumias East</label>
        <select value={ward} onChange={e=>{setWard(e.target.value); setStation(STATIONS[e.target.value][0]);}} className="w-full p-3 border-2 rounded-xl font-bold mt-1">
          <option>East Wanga</option><option>Lusheya/Lubinu</option><option>Malaha/Isongo/Makunga</option>
        </select>

        <label className="font-bold mt-4 block text-sm">Select Station - {ward}</label>
        <select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl mt-1">
          {(STATIONS[ward]||[]).map((s:string)=><option key={s} value={s}>{s} - {ward}</option>)}
        </select>

        <p className="text-[11px] mt-2">Selected: <b>{station}</b> | Ward: <b>{ward}</b> | Race: <b>MCA</b></p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <label className="font-black text-[12px] text-green-700">Sophia Manyasa (UDA)</label>
            <input type="number" value={v1} onChange={e=>setV1(e.target.value)} placeholder="1000" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-green-50 text-lg"/>
          </div>
          <div>
            <label className="font-black text-[12px] text-orange-700">Timothy Wanzetse (ODM)</label>
            <input type="number" value={v2} onChange={e=>setV2(e.target.value)} placeholder="100" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-orange-50 text-lg"/>
          </div>
          <div className="col-span-2">
            <label className="font-black text-[12px] text-purple-700">Stanislaus Wanzetse (DCP)</label>
            <input type="number" value={v3} onChange={e=>setV3(e.target.value)} placeholder="30" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-purple-50 text-lg"/>
          </div>
        </div>

        <label className="text-sm mt-4 block">Form 35A Photo *</label>
        <input type="file" className="mt-1"/>

        <button onClick={handleSubmit} className="w-full bg-[#1a6fb5] text-white font-black p-4 rounded-full mt-6 text-lg">Submit MCA to Main Server ✓</button>

        <div className="bg-green-50 border p-3 rounded-xl mt-4 text-sm font-bold">{msg}</div>

        <div className="mt-4 bg-gray-50 p-3 rounded-xl text-[11px]">
          Live Main Stream: Main link / - When you submit {station}, the bar for {ward} will update instantly. Highest votes gets GREEN badge ✓ ELECTED - WON
        </div>
      </div>
    </div>
  );
}
