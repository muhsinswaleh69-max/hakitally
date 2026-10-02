"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const SUBCOUNTIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];
const WARDS:any = {
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu": ["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Lugari": ["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lawandeti"],
  "Likuyani": ["Likuyani","Sango","Kongoni","Nzoia","Lumakanda"],
  "Malava": ["Manda-Shivanga","Matsakha","Lutaso","Ndalu","Matioli","Butali-Chegulo","Shivali"],
  "Lurambi": ["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],
  "Navakholo": ["Ingostse-Matiha","Shinoyi-Shikomari","Bunyala West","Bunyala East","Bunyala Central"],
  "Butere": ["Marama West","Marama Central","Marama North","Marama South","Marenyo-Shianda"],
  "Khwisero": ["Kisa North","Kisa East","Kisa West","Kisa Central"],
  "Shinyalu": ["Isukha North","Murhanda","Isukha Central","Isukha South","Isukha East","Isukha West"],
  "Ikolomani": ["Idakho South","Idakho East","Idakho North","Idakho Central"],
};
// EXPERIMENTAL - REAL NAMES - SAME ORDER IN BOTH FILES
const EXPERIMENTAL_MCA = ["Sophia Manyasa (UDA)","Timothy Wanzetse (ODM)","Stanislaus Wanzetse (DCP)"];

const MCA_CANDIDATES:any = {
  "East Wanga": EXPERIMENTAL_MCA,
  "Lusheya/Lubinu": EXPERIMENTAL_MCA,
  "Malaha/Isongo/Makunga": EXPERIMENTAL_MCA,
  "default": EXPERIMENTAL_MCA
};

export default function Page(){
  const [race,setRace]=useState("MCA");
  const [results,setResults]=useState<any[]>([]);
  const [selectedSubcounty,setSelectedSubcounty]=useState<string|null>("Mumias East");
  const [selectedWard,setSelectedWard]=useState("All");
  useEffect(()=>{ const f=async()=>{const {data}=await supabase.from("hakitally_results_34a").select("*"); setResults(data||[]);}; f(); const ch=supabase.channel("exp-3").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>f()).subscribe(); return()=>{supabase.removeChannel(ch);};},[]);
  const displaySubcounties = selectedSubcounty?[selectedSubcounty]:SUBCOUNTIES;
  return(
    <div className="min-h-screen bg-[#f1f3f5]">
      <div className="bg-[#0a2e1f] text-white p-5"><div className="max-w-[1700px] mx-auto"><h1 className="font-black text-2xl">HakiTally - KAKAMEGA COUNTY</h1><p className="text-sm opacity-80">MCA Experimental - {EXPERIMENTAL_MCA.join(" | ")} | {results.length} stations LIVE</p></div></div>
      <div className="max-w-[1700px] mx-auto p-4">
        <div className="bg-white p-4 rounded-xl mb-4"><div className="flex gap-2 flex-wrap">{SUBCOUNTIES.map(sc=><button key={sc} onClick={()=>setSelectedSubcounty(sc)} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSubcounty===sc?"bg-[#0a2e1f] text-white":"bg-gray-200"}`}>{sc}</button>)}</div><div className="flex gap-2 mt-3 flex-wrap border-t pt-3"><button onClick={()=>setSelectedWard("All")} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedWard==="All"?"bg-black text-white":"bg-yellow-100"}`}>All Wards in {selectedSubcounty}</button>{(WARDS[selectedSubcounty||"Mumias East"]||[]).map((w:string)=><button key={w} onClick={()=>setSelectedWard(w)} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedWard===w?"bg-black text-white":"bg-gray-100"}`}>{w}</button>)}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displaySubcounties.map(sub=>{ const wardsList = selectedWard==="All"?(WARDS[sub]||[]):[selectedWard]; return wardsList.map((ward:string)=>{ const wardResults=results.filter((r:any)=>r.ward===ward); const cands = MCA_CANDIDATES[ward]||MCA_CANDIDATES.default; const votesArr=cands.map((_:any,idx:number)=>wardResults.reduce((s:any,r:any)=> s + parseInt((r.extra_votes?Object.values(r.extra_votes)[idx]:0) as any||0),0)); const total=votesArr.reduce((a:number,b:number)=>a+b,0)||1; const max=Math.max(...votesArr); const has=wardResults.length>0; return(<div key={sub+ward} className="bg-white rounded-xl p-5 border-l-[6px] border-l-[#0a2e1f]"><p className="font-black text-[13px]">{ward} Ward - {sub} - MCA Race - {wardResults.length} stns</p><div className="mt-4 space-y-3">{cands.map((cand:string,idx:number)=>{ const v=votesArr[idx]; const pct=has?(v/total*100):0; const isWinner=has&&v===max&&v>0; return(<div key={cand} className={`p-3 rounded-xl border ${isWinner?"bg-green-50 border-green-600 border-2":"bg-gray-50"}`}><div className="flex justify-between items-center"><span className="font-bold text-[12px]">{cand}</span>{isWinner&&<span className="bg-green-600 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">✓ ELECTED - WON - CONGRATULATIONS</span>}</div><div className="flex justify-between mt-2"><span className="text-xs font-black">{v.toLocaleString()} votes</span><span className="text-xs font-black">{pct.toFixed(1)}%</span></div><div className="w-full bg-gray-200 h-2.5 rounded-full mt-2 overflow-hidden"><div className={`h-2.5 rounded-full ${isWinner?"bg-green-600":"bg-[#0a2e1f]"}`} style={{width:`${pct}%`}}></div></div></div>);})}</div><p className="text-[10px] text-gray-400 mt-3">{has?`Stations: ${wardResults.map((r:any)=>r.station_name).join(", ")}`:"No Form 35A yet - Enter via /admin"}</p></div>);});})}
        </div>
      </div>
    </div>
  );
}
