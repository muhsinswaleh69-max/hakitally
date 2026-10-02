"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// MUMIAS EAST - ALL WARDS
const ALL_STATIONS = [
  {name:"Emakwale Lubinu",ward:"Lusheya/Lubinu"}, {name:"Indangalasia Primary",ward:"Lusheya/Lubinu"},
  {name:"Lubinu Primary",ward:"Lusheya/Lubinu"}, {name:"Lubinu Sec",ward:"Lusheya/Lubinu"},
  {name:"Lusheya Primary",ward:"Lusheya/Lubinu"}, {name:"Shibale Primary",ward:"Lusheya/Lubinu"},
  {name:"Emakale Primary",ward:"Lusheya/Lubinu"}, {name:"Bumwende Primary",ward:"Lusheya/Lubinu"},
  {name:"Eluche Primary",ward:"East Wanga"}, {name:"Mumias East DEB",ward:"East Wanga"},
  {name:"Shianda Primary",ward:"East Wanga"}, {name:"Isongo Primary",ward:"Malaha/Isongo/Makunga"},
  {name:"Malaha Primary",ward:"Malaha/Isongo/Makunga"}, {name:"Makunga Primary",ward:"Malaha/Isongo/Makunga"},
];

export default function AdminGov(){
  const [results,setResults]=useState<any[]>([]);
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("");
  const [barasa,setBarasa]=useState("");
  const [malala,setMalala]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [uploading,setUploading]=useState(false);

  const fetchR = async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); setResults(data||[]); };
  useEffect(()=>{ fetchR(); const ch=supabase.channel("admin-gov").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>fetchR()).subscribe(); return()=>{supabase.removeChannel(ch)} },[]);

  const locked=results.map((r:any)=>r.station_name);
  const filtered=ALL_STATIONS.filter(s=>s.ward===ward);
  const isLocked:boolean = station? locked.includes(station) : false;

  const submit = async(e:any)=>{
    e.preventDefault(); if(!file){alert("Form 34A REQUIRED");return;}
    setUploading(true);
    try{
      const fn=`${Date.now()}_${station}.jpg`; await supabase.storage.from("form34a").upload(fn,file);
      const {data:url}=supabase.storage.from("form34a").getPublicUrl(fn);
      await supabase.from("hakitally_results_34a").insert({station_name:station,ward,constituency:"Mumias East",county:"Kakamega",race:"Governor",barasa_votes:parseInt(barasa),malala_votes:parseInt(malala),form_34a_url:url.publicUrl});
      alert("Governor result pushed LIVE!"); setStation(""); setBarasa(""); setMalala(""); setFile(null);
    }catch(err:any){alert(err.message);} setUploading(false);
  };

  return(
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="font-black">HakiTally Admin - Kakamega Governor</h1>
        <p className="text-xs text-gray-500">All Wards | Locked {results.length}/45 | {ward} ({results.filter((r:any)=>r.ward===ward).length}/{filtered.length}) <span className="text-green-600">● LIVE</span></p>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <select value={ward} onChange={e=>setWard(e.target.value)} className="w-full border p-3 rounded-xl">
            <option>Lusheya/Lubinu</option><option>East Wanga</option><option>Malaha/Isongo/Makunga</option>
          </select>
          <select value={station} onChange={e=>setStation(e.target.value)} className="w-full border p-3 rounded-xl" required>
            <option value="">Select Polling Station</option>
            {filtered.map(s=><option key={s.name} value={s.name} disabled={locked.includes(s.name)}>{s.name} {locked.includes(s.name)?"🔒":""}</option>)}
          </select>
          <input type="number" placeholder="Barasa (Governor) Votes" value={barasa} onChange={e=>setBarasa(e.target.value)} className="w-full border p-3 rounded-xl" required/>
          <input type="number" placeholder="Malala (Governor) Votes" value={malala} onChange={e=>setMalala(e.target.value)} className="w-full border p-3 rounded-xl" required/>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full border p-3 rounded-xl" required/>
          <button disabled={uploading || isLocked} className="w-full bg-black text-white p-3 rounded-xl font-bold disabled:bg-gray-300">{isLocked?"Locked":uploading?"Uploading...":"Lock & Push Governor LIVE"}</button>
        </form>
      </div>
    </div>
  );
}
