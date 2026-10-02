"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const MP_CANDIDATES:any = {
  "Mumias East":["Peter Nabulindo (ODM)","Benjamin Washiali (UDA)","David Were (DCP)"],
  "Mumias West":["Johnson Naicca (ODM)","Rashid Echesa (UDA)","Tim Wanyonyi (DCP)"],
  "Shinyalu":["Fred Ikana (ODM)","Justus Kizito (UDA)","Omboko Milemba (DCP)"],
  "Lugari":["Ayub Savula (ODM)","Nabii Nabwera (UDA)","Isaac Andabwa (DCP)"],
  "Likuyani":["Innocent Mugabe (ODM)","Enock Kibunguchy (UDA)","Oscar Nabulindo (DCP)"],
  "Malava":["Moses Malulu (ODM)","Seth Panyako (DCP)","Moses Malulu (UDA)"],
  "Lurambi":["Titus Khamala (ODM)","Bishop Owino (UDA)","Alfred Agoi (DCP)"],
  "Navakholo":["Emmanuel Wangwe (ODM)","Elvis Chiche (UDA)","Wilberforce Lutta (DCP)"],
  "Butere":["Tindi Mwale (ODM)","Hillary Otsiula (UDA)","Andrew Toboso (DCP)"],
  "Khwisero":["Christopher Aseka (ODM)","Julius Arunga (UDA)","Evans Lutta (DCP)"],
  "Matungu":["Peter Nabulindo (ODM)","Justus Murunga (UDA)","Oscar Nabulindo (DCP)"],
  "Ikolomani":["Bernard Shinali (ODM)","Bonface Mukhwana (UDA)","Vincent Malenya (DCP)"]
};

const MCA_CANDIDATES:any = {
  "East Wanga":["Sophia Manyasa (UDA)","Timothy Wanzetse (ODM)","Stanislaus Wanzetse (DCP)"],
  "Lusheya/Lubinu":["John Wafula (ODM)","Sophia Manyasa (UDA)","Patrick Kweyu (DCP)"],
  "Malaha/Isongo/Makunga":["Moses Musango (ODM)","David Shikuku (UDA)","Esther Okumu (DCP)"],
  "Mautuma":["Mautuma MCA A (ODM)","Mautuma MCA B (UDA)","Mautuma MCA C (DCP)"],
  "Murhanda":["Fred Ikana MCA (ODM)","Justus Kizito MCA (UDA)","Omboko Milemba MCA (DCP)"]
};

const COUNTY:any = {
  Governor:["Fernandes Barasa (ODM)","Cleophas Malala (DCP)","Boni Khalwale (IND)"],
  Senator:["Edwin Sifuna (ODM)","Boni Khalwale (UDA)","George Khaniri (DCP)"],
  "Woman Rep":["Elsie Muhanda (ODM)","Beatrice Adagala (UDA)","Rachael Otundo (DCP)"]
};

export default function Admin(){
  const [race,setRace]=useState("MCA");
  const [subcounty,setSubcounty]=useState("Shinyalu");
  const [ward,setWard]=useState("East Wanga");
  const [v1,setV1]=useState("600"); const [v2,setV2]=useState("100"); const [v3,setV3]=useState("54");
  const [msg,setMsg]=useState("Ready - Fixed for missing subcounty column");

  const candList = race==="MP"? (MP_CANDIDATES[subcounty]||MP_CANDIDATES["Mumias East"])
  : race==="MCA"? (MCA_CANDIDATES[ward]||MCA_CANDIDATES["East Wanga"])
  : COUNTY[race];

  const submit=async()=>{
    const extra:any={};
    extra[candList[0]]=parseInt(v1||"0");
    extra[candList[1]]=parseInt(v2||"0");
    extra[candList[2]]=parseInt(v3||"0");
    const valid=parseInt(v1||"0")+parseInt(v2||"0")+parseInt(v3||"0");
    const stationName=`${subcounty}_${ward}_${Date.now()}`.substring(0,50);

    // Use ONLY columns that exist in your original table
    const payload:any = {
      constituency: subcounty, // use constituency instead of subcounty - this column exists
      ward: race==="MCA"? ward : subcounty,
      station_name: stationName,
      extra_votes: extra,
      mca_votes: valid,
    };
    // Try with race column, if fails try without
    try{
      const {error} = await supabase.from("hakitally_results_34a").insert([{...payload, race}]);
      if(error && error.message.includes("race")){
        const {error:err2}=await supabase.from("hakitally_results_34a").insert([payload]);
        if(err2) throw err2;
      } else if(error) throw error;
      setMsg(`✅ SAVED ${race} - ${subcounty} - ${ward} - ${candList[0].split(" ")[0]}:${v1} - Go check ${race} tab in main board`);
      setV1(""); setV2(""); setV3("");
    }catch(e:any){
      setMsg("❌ "+e.message+" - Run SQL ALTER TABLE first");
    }
  };

  return(
    <div className="min-h-screen bg-[#f2f2f2] p-4"><div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow p-5">
      <p className="text-[11px] font-bold bg-green-100 text-green-700 p-2 rounded">FIXED - No subcounty column error - Uses constituency column</p>
      <label className="font-black mt-3 block text-sm">Race</label>
      <select value={race} onChange={e=>setRace(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1">{["MCA","MP","Governor","Senator","Woman Rep"].map(r=><option key={r}>{r}</option>)}</select>

      <label className="font-bold mt-3 block text-sm">Sub-county (Constituency) - MP names change here</label>
      <select value={subcounty} onChange={e=>setSubcounty(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-gray-50">{Object.keys(MP_CANDIDATES).map(s=><option key={s}>{s}</option>)}</select>

      <label className="font-bold mt-3 block text-sm">Ward - MCA names change here</label>
      <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-1 bg-gray-50">{["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga","Mautuma","Murhanda"].map(w=><option key={w}>{w}</option>)}</select>

      <div className="mt-5 space-y-3">
        {[0,1,2].map(i=><div key={i}><label className="font-black text-[12px]">{candList[i]}</label><input type="number" value={i===0? v1:i===1? v2:v3} onChange={e=> i===0? setV1(e.target.value):i===1? setV2(e.target.value):setV3(e.target.value)} className="w-full p-4 border-2 rounded-xl font-black mt-1 text-lg"/></div>)}
      </div>

      <button onClick={submit} className="w-full bg-black text-white font-black p-4 rounded-full mt-6">Submit {race} - {subcounty} ✓</button>
      <div className="bg-green-50 border p-3 rounded-xl mt-4 text-sm font-bold whitespace-pre-wrap">{msg}</div>
      <p className="text-[10px] text-gray-400 mt-3">Fix: After running SQL, submit again. Shinyalu MP = Fred Ikana / Kizito / Milemba. Lugari MP = Savula / Nabwera / Andabwa. Different per subcounty as you requested.</p>
    </div></div>
  );
}
