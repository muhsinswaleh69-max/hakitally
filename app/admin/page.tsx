"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// OFFICIAL IEBC FIXED
const STATIONS_IEBC: any = {
  "Lusheya/Lubinu": [
    "EMAKHWALE PRIMARY SCHOOL",
    "LUBINU PRIMARY SCHOOL",
    "SHIBINGA WEST PRIMARY SCHOOL",
    "BUMWENDE PRIMARY SCHOOL",
    "SHITOTO PRIMARY SCHOOL",
    "INDANGALASIA PRIMARY SCHOOL",
    "EMACHINA PRIMARY SCHOOL",
    "EKERO MARKET CENTRE",
    "KAMASHIA PRIMARY SCHOOL",
    "EBWALIRO PRIMARY SCHOOL",
    "EBUBOLE PRIMARY",
    "MWICHINA PRIMARY SCHOOL",
    "SHIANDEREMA PRIMARY SCHOOL",
    "ESHIKUFU PRIMARY SCHOOL",
    "LUSHEYA HEALTH CENTRE",
    "EKERO PAG NURSERY SCHOOL",
    "ELWASAMBI PRIMARY SCHOOL"
  ],
  "East Wanga": [
    "KHAUNGA PRIMARY SCHOOL",
    "MAHOLA PRIMARY SCHOOL",
    "KHABONDI PRIMARY SCHOOL",
    "EBUBERE PRIMARY SCHOOL",
    "MUNG'ANG'A PRIMARY SCHOOL",
    "MUNGABIRA PRIMARY SCHOOL",
    "BUMINI PRIMARY",
    "MUKAMBI PRIMARY SCHOOL",
    "KHABAKAYA PRIMARY SCHOOL",
    "ELUCHE PRIMARY SCHOOL",
    "MWITOTI PRIMARY SCHOOL",
    "RISE AND SHINE PRY SCHOOL FOR DISABLED",
    "BUMINI SECONDARY",
    "MUNG'ANG'A HEALTH CENTRE",
    "MALAHA MARKET",
    "BOOKER ACADEMY PRIMARY"
  ],
  "Malaha/Isongo/Makunga": [
    "ISANGO PRIMARY SCHOOL",
    "MUTONO PRIMARY SCHOOL",
    "EMUTETEMO PRIMARY SCHOOL",
    "MALAHA PRIMARY SCHOOL",
    "EMUKHALARI PRIMARY SCHOOL",
    "SHISENYE PRIMARY SCHOOL",
    "MALAHA YOUTH POLYTECHNIC",
    "MAKUNGA HEALTH CENTRE",
    "MARABA SECONDARY SCHOOL",
    "MARABA PRIMARY SCHOOL",
    "MUSANGO PRIMARY SCHOOL",
    "MAKUNGA PRIMARY SCHOOL",
    "MURONI PRIMARY SCHOOL",
    "EPANJA PRIMARY SCHOOL",
    "MABANGA PRIMARY SCHOOL",
    "KHAIMBA PRIMARY SCHOOL"
  ]
};

const REAL = ["Sophia Manyasa (UDA)","Timothy Wanzetse (ODM)","Stanislaus Wanzetse (DCP)"];

export default function Admin() {
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("EMAKHWALE PRIMARY SCHOOL");
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [v3,setV3]=useState("");
  const [msg,setMsg]=useState("Ready to submit - Example: Sophia 1000, Timothy 100, Stanislaus 30");
  const [all,setAll]=useState<any[]>([]);

  const load=async()=>{
    const {data}=await supabase.from("hakitally_results_34a").select("*").order("created_at",{ascending:false});
    setAll(data||[]);
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{ setStation(STATIONS_IEBC[ward][0]); },[ward]);

  const handleSubmit=async()=>{
    setMsg("Submitting "+station+"...");
    const extra:any={};
    extra[REAL[0]]=parseInt(v1||"0");
    extra[REAL[1]]=parseInt(v2||"0");
    extra[REAL[2]]=parseInt(v3||"0");
    const {error}=await supabase.from("hakitally_results_34a").upsert(
      [{constituency:"Mumias East", ward, station_name:station, extra_votes:extra, mca_votes: extra[REAL[0]]+extra[REAL[1]]+extra[REAL[2]]}],
      {onConflict:"station_name"}
    );
    if(error) setMsg("❌ "+error.message);
    else { setMsg(`✅ SAVED! ${ward} - ${station} -> Sophia ${v1}, Timothy ${v2}, Stanislaus ${v3} - MAIN BOARD IS LIVE NOW! Total stations: ${all.length+1}`); load(); setV1(""); setV2(""); setV3(""); }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-4">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow-xl p-5 border">
        <p className="text-[11px] text-gray-500 font-semibold">All computers sync to same main server at Kakamega High School</p>
        <p className="text-[11px] mt-1">Selected: <b>{station}</b> | Ward: <b>{ward}</b> | Race: <b>MCA</b> | Saved: <b>{all.length}</b></p>

        <label className="font-black mt-4 block text-sm">Electoral Seat</label>
        <select className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1">
          <option>MCA</option>
        </select>

        <label className="font-bold mt-4 block text-sm">Ward - Mumias East (IEBC Official)</label>
        <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-white">
          <option>East Wanga</option>
          <option>Lusheya/Lubinu</option>
          <option>Malaha/Isongo/Makunga</option>
        </select>

        <label className="font-bold mt-4 block text-sm">Select Station - {ward} ({STATIONS_IEBC[ward].length} stations)</label>
        <select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl mt-1 bg-gray-50 font-semibold">
          {STATIONS_IEBC[ward].map((s:string)=><option key={s} value={s}>{s} - {ward}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <label className="font-black text-[12px] text-green-700">Sophia Manyasa (UDA)</label>
            <input type="number" value={v1} onChange={e=>setV1(e.target.value)} placeholder="Votes for Sophia" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-green-50 text-lg focus:border-green-600 outline-none"/>
          </div>
          <div>
            <label className="font-black text-[12px] text-orange-700">Timothy Wanzetse (ODM)</label>
            <input type="number" value={v2} onChange={e=>setV2(e.target.value)} placeholder="Votes for Timothy" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-orange-50 text-lg focus:border-orange-600 outline-none"/>
          </div>
          <div className="col-span-2">
            <label className="font-black text-[12px] text-purple-700">Stanislaus Wanzetse (DCP)</label>
            <input type="number" value={v3} onChange={e=>setV3(e.target.value)} placeholder="Votes for Stanislaus" className="w-full p-4 border-2 rounded-xl font-bold mt-1 bg-purple-50 text-lg focus:border-purple-600 outline-none"/>
          </div>
        </div>

        <label className="text-sm mt-4 block font-semibold">Form 35A Photo *</label>
        <input type="file" className="mt-1 text-sm"/>

        <button onClick={handleSubmit} className="w-full bg-[#1a6fb5] hover:bg-blue-700 text-white font-black p-4 rounded-full mt-6 text-lg shadow-lg transition">
          Submit MCA to Main Server ✓
        </button>

        <div className="bg-green-50 border border-green-200 p-3 rounded-xl mt-4 text-sm font-bold text-green-800">{msg}</div>

        <div className="mt-4 bg-gray-50 p-3 rounded-xl text-[11px]">
          <p className="font-black">Live Main Stream: Main link / - When you submit {station}, the bar for {ward} will update instantly. Highest votes gets GREEN badge ✓ ELECTED - WON</p>
          <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
            {all.map((r:any)=><div key={r.station_name} className="flex justify-between bg-white p-1.5 rounded border"><span className="font-bold">{r.station_name}</span><span>S:{r.extra_votes?.["Sophia Manyasa (UDA)"]||0} T:{r.extra_votes?.["Timothy Wanzetse (ODM)"]||0} S:{r.extra_votes?.["Stanislaus Wanzetse (DCP)"]||0}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
