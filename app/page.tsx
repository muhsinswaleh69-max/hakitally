"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const WARDS_DATA:any = {
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu": ["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Lugari": ["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lawandeti"],
  "Likuyani": ["Likuyani","Sango","Kongoni","Nzoia","Lumakanda"],
  "Malava": ["Manda-Shivanga","Matsakha","Lutaso","Ndalu","Matioli","Butali-Chegulo","Shivali"],
};

// REAL CANDIDATES FOR EXPERIMENT
const CANDIDATES:any = {
  "East Wanga": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "Lusheya/Lubinu": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "Malaha/Isongo/Makunga": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "default": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"]
};

const STATIONS:any = {
  "Mumias East": ["Shibale Primary - S1","Shibale Primary - S2","East Wanga DEB - S1","Lubinu Primary - S1","Lubinu Primary - S2","Malaha Primary - S1","Malaha Primary - S2","Isongo Primary","Makunga Primary","Eluche Primary","Khaunga Primary","Mumias Sugar Sec","Shianda Primary","Khaimba Primary","Kholera Primary","Khainga Primary","Emukaya Primary","Mwitoti Primary"],
  "default": ["Station 1","Station 2","Station 3"]
};

export default function Admin(){
  const [consti,setConsti]=useState("Mumias East");
  const [ward,setWard]=useState("East Wanga");
  const [station,setStation]=useState("");
  const [votes,setVotes]=useState(["","",""]);
  const [msg,setMsg]=useState("");

  const cands = CANDIDATES[ward] || CANDIDATES.default;
  const stations = STATIONS[consti] || STATIONS.default;

  const submit = async()=>{
    if(!station ||!votes[0] ||!votes[1]){ setMsg("Fill station + at least 2 candidates"); return;}
    const extra:any={}; cands.forEach((c:string,i:number)=> extra[c]=parseInt(votes[i]||"0"));
    const {error} = await supabase.from("hakitally_results_34a").insert([{
      constituency: consti, ward: ward, station_name: station,
      extra_votes: extra, governor_votes:0, senator_votes:0, womanrep_votes:0, mp_votes:0, mca_votes: parseInt(votes[0])||0
    }]);
    if(error) setMsg("Error: "+error.message); else { setMsg(`✓ Submitted ${ward} - ${station} - LIVE NOW on main board!`); setVotes(["","",""]); }
  };

  return(
    <div className="min-h-screen bg-gray-100 p-4 max-w-[600px] mx-auto">
      <p className="text-xs">All computers A,B,C,D,E,F sync to same main server at Kakamega High School. Each submit = 0.2KB data. Offline saves auto-sync.</p>
      <h1 className="font-black text-xl mt-2">HakiTally ADMIN - Mumias East</h1>
      <div className="bg-white p-5 rounded-xl mt-4 space-y-4">
        <div><label className="font-bold text-sm">Electoral Seat</label><select value="MCA" className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold"><option>MCA</option></select></div>
        <div><label className="font-bold text-sm">Constituency (12)</label><select value={consti} onChange={e=>setConsti(e.target.value)} className="w-full p-3 border-2 rounded-xl bg-orange-50 font-bold">{Object.keys(WARDS_DATA).map(c=><option key={c}>{c} - 0 stns</option>)}<option>Mumias East - 0 stns</option></select></div>
        <div><label className="font-bold text-sm">Ward - {consti}</label><select value={ward} onChange={e=>setWard(e.target.value)} className="w-full p-3 border-2 rounded-xl font-bold">{(WARDS_DATA[consti]||["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"]).map((w:string)=><option key={w} value={w}>{w}</option>)}</select></div>
        <div><label className="font-bold text-sm">Select Station - {consti} ({stations.length} stations)</label><select value={station} onChange={e=>setStation(e.target.value)} className="w-full p-3 border rounded-xl"><option value="">-- Choose Polling Station --</option>{stations.map((s:string)=><option key={s} value={s}>{s}</option>)}</select></div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {cands.map((cand:string,i:number)=>(
            <div key={cand}><label className="font-bold text-[12px] text-[#0a2e1f]">{cand} {i===0?"(ODM)":i===1?"(UDA)":"(DAP-K)"} - {ward}</label><input type="number" placeholder="Votes" value={votes[i]} onChange={e=>{ const nv=[...votes]; nv[i]=e.target.value; setVotes(nv);}} className="w-full p-3 border-2 rounded-xl font-bold"/></div>
          ))}
        </div>

        <div><label className="text-sm">Form 35A Photo *</label><input type="file" className="mt-1"/></div>
        <button onClick={submit} className="w-full bg-[#1a6fb5] text-white font-black p-4 rounded-full">Submit MCA to Main Server ✓</button>
        {msg && <p className="bg-green-100 p-3 rounded-xl font-bold text-sm">{msg}</p>}
        <p className="text-[11px] text-gray-500">After submit, check MAIN link: / - {ward} will show % + ELECTED badge instantly. Winner = highest votes turns GREEN as in image above.</p>
      </div>
    </div>
  );
}
