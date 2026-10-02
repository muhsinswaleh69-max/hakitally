"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// YOUR REAL NAMES FOR EXPERIMENT - ORDER FIXED
const REAL = [
  "Sophia Manyasa (UDA)",
  "Timothy Wanzetse (ODM)",
  "Stanislaus Wanzetse (DCP)"
];

const WARDS = ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"];
const STATIONS_BY_WARD:any = {
  "Lusheya/Lubinu": ["Emakwale Lubinu","Lubinu Primary S1","Lubinu Primary S2","Eluche Primary","Khaimba Primary","Shibale Primary S1","Shibale Primary S2","Emukaya Primary"],
  "East Wanga": ["East Wanga DEB S1","Khaunga Primary","Shianda Primary","Mwitoti Primary","Mumias Sugar Sec"],
  "Malaha/Isongo/Makunga": ["Malaha Primary S1","Malaha Primary S2","Isongo Primary","Makunga Primary","Kholera Primary","Khainga Primary"]
};

export default function Admin(){
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("Emakwale Lubinu");
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [v3,setV3]=useState("");
  const [msg,setMsg]=useState("");

  const submit=async()=>{
    if(!station){ setMsg("Select Station"); return; }
    const extra:any={}; extra[REAL[0]]=parseInt(v1||"0"); extra[REAL[1]]=parseInt(v2||"0"); extra[REAL[2]]=parseInt(v3||"0");
    const {error}=await supabase.from("hakitally_results_34a").insert([{
      constituency:"Mumias East", ward, station_name: station, extra_votes: extra, mca_votes: parseInt(v1||"0")
    }]);
    if(error) setMsg("Error: "+error.message);
    else { setMsg(`✓ LIVE! ${ward} - ${station} -> ${REAL[0]}=${v1}, ${REAL[1]}=${v2}, ${REAL[2]}=${v3} - Check MAIN BOARD NOW`); setV1(""); setV2(""); setV3(""); }
  };

  return(
    <div className="min-h-screen bg-[#f2f2f2] p-4">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow p-5">
        <p className="text-[11px] text-gray-500">All computers A,B,C,D,E,F sync to same main server at Kakamega High School. 0.2KB per submit.</p>

        <label className="font-black mt-4 block text-sm">Electoral Seat</label>
        <select className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1"><option>MCA</option></select>

        <label className="font-bold mt-4 block text-sm">Constituency (12)</label>
        <select className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1"><option>Mumias East - 0 stns</option></select>

        <label className="font-bold mt-4 block text-sm">Ward - Mumias East</label>
        <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-1">
          {WARDS.map(w=><option key={w} value={w}>{w}</option>)}
        </select>

        <label className="font-bold mt-4 block text-sm">Select Station - {ward}</label>
        <select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl mt-1">
          {(STATIONS_BY_WARD[ward]||[]).map((s:string)=><option key={s} value={s}>{s} - {ward}</option>)}
        </select>

        <p className="text-[12px] mt-3 text-gray-600">Selected: <b>{station}</b> | Ward: <b>{ward}</b> | Race: <b>MCA</b></p>

        {/* REAL NAMES HERE - THIS IS THE FIX */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <label className="font-black text-[12px] text-[#0a2e1f]">{REAL[0]}</label>
            <input type="number" value={v1} onChange={e=>setV1(e.target.value)} placeholder="Votes for Sophia" className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-green-50"/>
          </div>
          <div>
            <label className="font-black text-[12px] text-[#0a2e1f]">{REAL[1]}</label>
            <input type="number" value={v2} onChange={e=>setV2(e.target.value)} placeholder="Votes for Timothy" className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-orange-50"/>
          </div>
          <div className="col-span-2">
            <label className="font-black text-[12px] text-[#0a2e1f]">{REAL[2]}</label>
            <input type="number" value={v3} onChange={e=>setV3(e.target.value)} placeholder="Votes for Stanislaus" className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-purple-50"/>
          </div>
        </div>

        <label className="text-sm mt-4 block">Form 35A Photo *</label><input type="file" className="mt-2"/>

        <button onClick={submit} className="w-full bg-[#1a6fb5] text-white font-black p-4 rounded-full mt-6">Submit MCA to Main Server ✓</button>

        {msg && <p className="bg-green-100 p-3 rounded-xl font-bold text-sm mt-3">{msg}</p>}

        <div className="mt-4 bg-gray-50 p-3 rounded-xl">
          <p className="text-[11px] font-bold">Live Main Stream:</p>
          <p className="text-[11px]">Main link: / - When you submit Emakwale Lubinu, the bar for {ward} will update instantly. Highest votes gets GREEN badge <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-[10px]">✓ ELECTED - WON</span></p>
        </div>
      </div>
    </div>
  );
}
