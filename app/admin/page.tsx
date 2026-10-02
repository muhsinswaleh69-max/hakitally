"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const RACES: any = {
  Governor: ["Fernandes Barasa (ODM)","Cleophas Malala (DCP)","Boni Khalwale (IND)"],
  Senator: ["Edwin Sifuna (ODM)","Boni Khalwale (UDA)","George Khaniri (DCP)"],
  "Woman Rep": ["Elsie Muhanda (ODM)","Beatrice Adagala (UDA)","Rachael Otundo (DCP)"],
  MP: ["Peter Nabulindo (ODM)","Benjamin Washiali (UDA)","David Were (DCP)"],
  MCA: ["Sophia Manyasa (UDA)","Timothy Wanzetse (ODM)","Stanislaus Wanzetse (DCP)"],
};
const STATIONS:any={"Lusheya/Lubinu":["EMAKHWALE PRIMARY SCHOOL","LUBINU PRIMARY SCHOOL","SHIBINGA WEST PRIMARY SCHOOL","BUMWENDE PRIMARY SCHOOL","SHITOTO PRIMARY SCHOOL","INDANGALASIA PRIMARY SCHOOL","EMACHINA PRIMARY SCHOOL","EKERO MARKET CENTRE","KAMASHIA PRIMARY SCHOOL","EBWALIRO PRIMARY SCHOOL","EBUBOLE PRIMARY","MWICHINA PRIMARY SCHOOL","SHIANDEREMA PRIMARY SCHOOL","ESHIKUFU PRIMARY SCHOOL","LUSHEYA HEALTH CENTRE","EKERO PAG NURSERY SCHOOL","ELWASAMBI PRIMARY SCHOOL"],"East Wanga":["KHAUNGA PRIMARY SCHOOL","MAHOLA PRIMARY SCHOOL","KHABONDI PRIMARY SCHOOL","EBUBERE PRIMARY SCHOOL","MUNG'ANG'A PRIMARY SCHOOL","MUNGABIRA PRIMARY SCHOOL","BUMINI PRIMARY","MUKAMBI PRIMARY SCHOOL","KHABAKAYA PRIMARY SCHOOL","ELUCHE PRIMARY SCHOOL","MWITOTI PRIMARY SCHOOL","RISE AND SHINE PRY SCHOOL FOR DISABLED","BUMINI SECONDARY","MUNG'ANG'A HEALTH CENTRE","MALAHA MARKET","BOOKER ACADEMY PRIMARY"],"Malaha/Isongo/Makunga":["ISANGO PRIMARY SCHOOL","MUTONO PRIMARY SCHOOL","EMUTETEMO PRIMARY SCHOOL","MALAHA PRIMARY SCHOOL","EMUKHALARI PRIMARY SCHOOL","SHISENYE PRIMARY SCHOOL","MALAHA YOUTH POLYTECHNIC","MAKUNGA HEALTH CENTRE","MARABA SECONDARY SCHOOL","MARABA PRIMARY SCHOOL","MUSANGO PRIMARY SCHOOL","MAKUNGA PRIMARY SCHOOL","MURONI PRIMARY SCHOOL","EPANJA PRIMARY SCHOOL","MABANGA PRIMARY SCHOOL","KHAIMBA PRIMARY SCHOOL"]};

export default function Admin(){
  const [race,setRace]=useState("MCA");
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState(STATIONS["Lusheya/Lubinu"][0]);
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [v3,setV3]=useState(""); const [msg,setMsg]=useState("Ready - Select Race to Test");
  const submit=async()=>{
    setMsg("Saving..."); const extra:any={}; extra[RACES[race][0]]=parseInt(v1||"0"); extra[RACES[race][1]]=parseInt(v2||"0"); extra[RACES[race][2]]=parseInt(v3||"0");
    const {error}=await supabase.from("hakitally_results_34a").upsert([{constituency:"Mumias East", ward, station_name: station+"_"+race, race, extra_votes:extra, mca_votes: parseInt(v1||"0")+parseInt(v2||"0")+parseInt(v3||"0")}],{onConflict:"station_name"});
    if(error) setMsg("❌ "+error.message); else { setMsg(`✅ SAVED ${race} - ${station} - ${ward} -> ${RACES[race][0].split(" ")[0]}:${v1} ${RACES[race][1].split(" ")[0]}:${v2} ${RACES[race][2].split(" ")[0]}:${v3}`); setV1(""); setV2(""); setV3(""); }
  };
  return(
    <div className="min-h-screen bg-[#f2f2f2] p-4"><div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow p-5">
      <p className="text-[11px] font-bold">FULL TEST ADMIN - All 5 Races - 3 Candidates Each</p>
      <label className="font-black mt-3 block text-sm">Select Race (Governor to MCA)</label>
      <select value={race} onChange={e=>setRace(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold mt-1">{Object.keys(RACES).map(r=><option key={r}>{r}</option>)}</select>
      <label className="font-bold mt-4 block text-sm">Ward</label>
      <select value={ward} onChange={e=>{setWard(e.target.value); setStation(STATIONS[e.target.value][0]);}} className="w-full p-3 border-2 rounded-xl font-bold mt-1">{Object.keys(STATIONS).map(w=><option key={w}>{w}</option>)}</select>
      <label className="font-bold mt-3 block text-sm">Station - {ward}</label>
      <select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl mt-1">{STATIONS[ward].map((s:string)=><option key={s}>{s}</option>)}</select>
      <div className="grid grid-cols-1 gap-3 mt-5">
        {[0,1,2].map(i=>(
          <div key={i}><label className="font-black text-[11px]">{RACES[race][i]}</label>
          <input type="number" value={i===0? v1: i===1? v2: v3} onChange={e=> i===0? setV1(e.target.value): i===1? setV2(e.target.value): setV3(e.target.value)} placeholder={`Votes for ${RACES[race][i].split(" ")[0]}`} className="w-full p-4 border-2 rounded-xl font-black mt-1 text-lg bg-gray-50"/></div>
        ))}
      </div>
      <button onClick={submit} className="w-full bg-[#1a6fb5] text-white font-black p-4 rounded-full mt-6">Submit {race} to Main Server ✓</button>
      <div className="bg-green-50 border p-3 rounded-xl mt-4 text-sm font-bold">{msg}</div>
      <p className="text-[10px] text-gray-400 mt-3">Test: Submit Governor 100 stations, Senator 100, Woman Rep 100, MP 49, MCA 49 - each race will show CONGRATULATIONS when complete</p>
    </div></div>
  );
}
