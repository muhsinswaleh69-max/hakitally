// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const WARDS:any = {"Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],"Shinyalu":["Murhanda","Isukha North","Isukha East","Isukha South","Isukha Central","Isukha West"],"Lugari":["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lwandeti"],"Mumias West":["Mumias Central","Mumias North","Etenje","Musanda"],"Matungu":["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],"Butere":["Marama West","Marama Central","Marama North","Marama South","Marenyo-Shianda"],"Khwisero":["Kisa North","Kisa East","Kisa West","Kisa Central"],"Ikolomani":["Idakho South","Idakho East","Idakho North","Idakho Central"],"Lurambi":["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],"Navakholo":["Ingotse-Mathia","Shinoyi-Shikomari-Esumeyia","Bunyala West","Bunyala East","Bunyala Central"],"Malava":["West Kabras","Chemuche","East Kabras","Butali-Chegulo","Manda-Shivanga","Matsakha","Shamakhokho"],"Likuyani":["Likuyani","Sango","Kongoni","Nzoia","Sinoko"]};

const MP_2022:any = {"Mumias East":["Peter Nabulindo (ODM)","Benjamin Washiali (UDA)","David Were (DCP)"],"Shinyalu":["Fred Ikana (ODM)","Justus Kizito (UDA)","Omboko Milemba (ANC)"],"Lugari":["Nabii Nabwera (ODM)","Ayub Savula (ANC)","Isaac Andabwa (UDA)"],"Mumias West":["Johnson Naicca (ODM)","Rashid Echesa (UDA)","Tim Wanyonyi (DCP)"],"Butere":["Tindi Mwale (ODM)","Hillary Otsiula (UDA)","Andrew Toboso (ANC)"],"Khwisero":["Christopher Aseka (ODM)","Julius Arunga (UDA)","Evans Lutta (ANC)"],"Ikolomani":["Bernard Shinali (ODM)","Bonface Mukhwana (UDA)","Vincent Malenya (ANC)"],"Lurambi":["Titus Khamala (ODM)","Bishop Owino (UDA)","Alfred Agoi (ANC)"],"Navakholo":["Emmanuel Wangwe (ODM)","Elvis Chiche (UDA)","Wilberforce Lutta (ANC)"],"Malava":["Moses Malulu Injendi (ANC)","Seth Panyako (UDM)","Moses Malulu (ODM)"],"Likuyani":["Innocent Mugabe (ODM)","Enock Kibunguchy (ANC)","Mugabe Were (UDA)"],"Matungu":["Peter Oscar Nabulindo (ODM)","Justus Murunga (UDA)","Oscar Nabulindo (ANC)"]};

export default function Admin(){
  const [race,setRace]=useState("Governor"); const [sub,setSub]=useState("Mumias East"); const [ward,setWard]=useState("East Wanga");
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [v3,setV3]=useState(""); const [msg,setMsg]=useState("2022 Fixed - Ready to build");
  useEffect(()=>{ setWard(WARDS[sub][0]); },[sub]);
  const cands = race==="Governor"? ["Fernandes Barasa (ODM)","Cleophas Malala (ANC)","Boni Khalwale (UDA)"] : race==="MP"? MP_2022[sub] : race==="MCA"? [`MCA ${ward.split("/")[0].substring(0,6)} A (ODM)`,`MCA ${ward.split("/")[0].substring(0,6)} B (UDA)`,`MCA ${ward.split("/")[0].substring(0,6)} C (DCP)`] : race==="Senator"? ["Boni Khalwale (UDA)","Brian Lishenga (ODM)","Imanuel Sasia (ANC)"] : ["Elsie Muhanda (ODM)","Beatrice Adagala (ANC)","Naomi Shiyonga (UDA)"];
  const submit=async()=>{
    const extra:any={}; extra[cands[0]]=parseInt(v1||"0"); extra[cands[1]]=parseInt(v2||"0"); extra[cands[2]]=parseInt(v3||"0");
    const {error}=await supabase.from("hakitally_results_34a").insert([{constituency:sub, ward, station_name:`${sub}_${ward}_${Date.now()}`, race, extra_votes:extra, mca_votes:parseInt(v1||"0")+parseInt(v2||"0")+parseInt(v3||"0")}]);
    if(error) setMsg("❌ "+error.message); else setMsg(`✅ SAVED ${race} ${sub} ${ward}`);
  };
  return(
    <div className="min-h-screen bg-[#f2f2f2] p-4"><div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow p-5 border-t-4 border-t-[#0a3d1f]">
      <p className="font-black text-[#0a3d1f] text-[12px]">ADMIN - 2022 - BUILD ERROR FIXED - {race}</p>
      <select value={race} onChange={e=>setRace(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-yellow-50 font-bold mt-3">{["Governor","Senator","Woman Rep","MP","MCA"].map((r:any)=><option key={r}>{r}</option>)}</select>
      <select value={sub} onChange={e=>setSub(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-2">{Object.keys(WARDS).map((s:any)=><option key={s}>{s}</option>)}</select>
      <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold mt-2 bg-green-50">{WARDS[sub].map((w:string)=><option key={w}>{w}</option>)}</select>
      <div className="mt-4 space-y-2">{cands.map((c:string,i:number)=><div key={i}><label className="font-bold text-[11px]">{c}</label><input type="number" value={i===0? v1:i===1? v2:v3} onChange={e=> i===0? setV1(e.target.value):i===1? setV2(e.target.value):setV3(e.target.value)} className="w-full p-3 border-2 rounded-xl font-black"/></div>)}</div>
      <button onClick={submit} className="w-full bg-[#0a3d1f] text-white font-black p-4 rounded-full mt-4">Submit {race}</button>
      <div className="bg-green-50 border p-2 rounded-xl mt-3 text-[12px] font-bold">{msg}</div>
    </div></div>
  );
}
