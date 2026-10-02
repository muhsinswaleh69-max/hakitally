"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Admin(){
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("Emakwale Lubinu");
  const [v1,setV1]=useState("1000");
  const [v2,setV2]=useState("122");
  const [v3,setV3]=useState("12");
  const [msg,setMsg]=useState("");

  const submit=async()=>{
    setMsg("Saving Emakwale Lubinu...");
    const extra:any={
      "Sophia Manyasa (UDA)": parseInt(v1||"0"),
      "Timothy Wanzetse (ODM)": parseInt(v2||"0"),
      "Stanislaus Wanzetse (DCP)": parseInt(v3||"0")
    };
    // FIXED: Only 4 columns - no mca_votes
    const {error}=await supabase.from("hakitally_results_34a").insert([{
      constituency:"Mumias East",
      ward,
      station_name:station,
      extra_votes:extra
    }]);
    if(error){ setMsg("❌ "+error.message); }
    else{ setMsg(`✅ SAVED! ${ward} - ${station} - Sophia ${v1}, Timothy ${v2}, Stanislaus ${v3} LIVE NOW`); }
  };

  return(
    <div className="max-w-[600px] mx-auto p-4 bg-white min-h-screen">
      <p className="text-[11px]">Selected: {station} | Ward: {ward} | Race: MCA</p>
      <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl mt-3 font-bold">
        <option>East Wanga</option><option>Lusheya/Lubinu</option><option>Malaha/Isongo/Makunga</option>
      </select>
      <select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl mt-3 font-bold">
        <option>Emakwale Lubinu</option><option>Lubinu Primary S1</option><option>Shibale Primary S1</option>
        <option>East Wanga DEB S1</option><option>Malaha Primary S1</option>
      </select>

      <div className="mt-4">
        <label className="font-black text-[12px]">Sophia Manyasa (UDA)</label>
        <input value={v1} onChange={e=>setV1(e.target.value)} type="number" className="w-full p-3 border-2 rounded-xl bg-green-50 font-bold mt-1"/>
      </div>
      <div className="mt-3">
        <label className="font-black text-[12px]">Timothy Wanzetse (ODM)</label>
        <input value={v2} onChange={e=>setV2(e.target.value)} type="number" className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1"/>
      </div>
      <div className="mt-3">
        <label className="font-black text-[12px]">Stanislaus Wanzetse (DCP)</label>
        <input value={v3} onChange={e=>setV3(e.target.value)} type="number" className="w-full p-3 border-2 rounded-xl bg-purple-50 font-bold mt-1"/>
      </div>

      <button onClick={submit} className="w-full bg-blue-500 text-white font-black p-4 rounded-full mt-6">Submit MCA to Main Server ✓</button>
      <div className="mt-4 p-3 bg-green-100 rounded-xl font-bold text-sm">{msg}</div>
    </div>
  );
}
