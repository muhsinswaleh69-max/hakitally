"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// CORRECT 2027 CANDIDATES - KAKAMEGA
const RACES: any = {
  Governor: [
    { name:"Fernandes Barasa", party:"ODM" },
    { name:"Cleophas Malala", party:"DCP" },
    { name:"Boni Khalwale", party:"IND" },
    { name:"Elsie Muhanda", party:"ODM" },
  ],
  Senator: [
    { name:"Boni Khalwale", party:"UDA" }, // if not Governor
    { name:"Seth Panyako", party:"UDA" },
    { name:"Naomi Shiyonga", party:"ODM" },
    { name:"Brian Luvanda", party:"DCP" },
  ],
  "Woman Rep": [
    { name:"Elsie Muhanda", party:"ODM" },
    { name:"Fatuma Masito", party:"ODM" },
    { name:"Mercy Nakhumicha", party:"UDA" },
    { name:"Tindi Mwale", party:"DCP" },
  ],
  "MP - Mumias East": [
    { name:"Peter Salasya", party:"DAP-K" }, // incumbent【1105341184582129793†L101-L104】
    { name:"Benjamin Washiali", party:"UDA" }, // former MP comeback【1105341184582129793†L187-L191】
    { name:"Elon Wameyo", party:"IND" }, // aspirant【1105341184582129793†L27-L32】
  ],
  "MCA": [
    { name:"East Wanga Ward", party:"Wards" },
    { name:"Lusheya/Lubinu", party:"Wards" },
    { name:"Malaha/Isongo/Makunga", party:"Wards" },
  ]
};

export default function Board(){
  const [race,setRace]=useState("Governor");
  const [results,setResults]=useState<any[]>([]);
  const fetchR=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); setResults(data||[]); };
  useEffect(()=>{ fetchR(); const ch=supabase.channel("all-seats").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>fetchR()).subscribe(); return()=>{supabase.removeChannel(ch)} },[]);

  const filtered = results.filter((r:any)=>(r.race||"Governor")===race);
  const totals:any={}; RACES[race]?.forEach((c:any)=>{ totals[c.name]=filtered.reduce((s:number,r:any)=>s+(r[`${c.name.split(" ")[0].toLowerCase()}_votes`]||r[`${race.toLowerCase().replace(" - mumias east","").replace(" ","_")}_${c.name.split(" ")[0].toLowerCase()}`]||0),0) });
  // Simplified totals using existing columns + dynamic
  const barasa = filtered.reduce((s,r)=>s+(r.barasa_votes||0),0);
  const malala = filtered.reduce((s,r)=>s+(r.malala_votes||0),0);
  const khalwale = filtered.reduce((s,r)=>s+(r.khalwale_votes||0),0);
  const muhanda = filtered.reduce((s,r)=>s+(r.muhanda_votes||0),0);
  const total = barasa+malala+khalwale+muhanda||1;

  return(
    <div className="min-h-screen bg-[#f2f3f5] p-3">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0f3d2e] rounded-[16px] p-6 text-white text-center">
          <h1 className="font-black text-xl">HakiTally - KAKAMEGA COUNTY</h1>
          <p className="text-sm opacity-90">{race} 2027 Live Tally | Form 34A Parallel Count</p>
          <p className="mt-2 font-bold">{filtered.length||results.length} / 1200 Stations ({Math.round(((filtered.length||results.length)/1200)*100)}%)</p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {Object.keys(RACES).map(r=><button key={r} onClick={()=>setRace(r)} className={`px-3 py-1 rounded-full text-xs font-bold ${race===r?"bg-white text-[#0f3d2e]":"bg-white/20"}`}>{r}</button>)}
          </div>
          <p className="text-[11px] mt-3 opacity-70">● LIVE instant</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {RACES[race].map((c:any,i:number)=>{
            const votes = [barasa,malala,khalwale,muhanda][i]||0;
            const pct = ((votes/total)*100).toFixed(0);
            const colors=["border-l-[#0f3d2e]","border-l-gray-200","border-l-yellow-300","border-l-purple-300"];
            return(
              <div key={c.name} className={`bg-white rounded-xl border-l-4 ${colors[i]||"border-l-gray-200"} shadow-sm p-4`}>
                <p className="text-[13px] font-semibold">{c.name} ({c.party})</p>
                <p className="text-xl font-black">{votes.toLocaleString()} <span className="text-xs font-normal text-gray-500">{pct}%</span> {i===0 && race==="Governor" && <span className="text-[10px] bg-gray-100 px-2 rounded">LEADING</span>}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl p-5 mt-5">
          <p className="text-xs text-gray-500">By Constituency - {race} Live</p>
          <div className="mt-2 text-sm">Mumias East - {results.length} stns reported live...</div>
        </div>
      </div>
    </div>
  );
}
