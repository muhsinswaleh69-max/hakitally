"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const ALL_RACES: any = {
  Governor: [
    { name:"Fernandes Barasa", party:"ODM" },
    { name:"Cleophas Malala", party:"DCP" },
    { name:"Boni Khalwale", party:"IND" },
    { name:"Elsie Muhanda", party:"ODM" },
  ],
  Senator: [
    { name:"Kevin Mahelo", party:"UDA" },
    { name:"Seth Panyako", party:"UDA" },
    { name:"Naomi Shiyonga", party:"DAP-K" },
  ],
  "Woman Rep": [
    { name:"Margaret Ndege", party:"IND" },
    { name:"Naomi Shiyonga", party:"DAP-K" },
    { name:"Hadija Nganyi", party:"UDA" },
  ],
  "MP - Mumias East": [
    { name:"Peter Salasya", party:"DAP-K" },
    { name:"Benjamin Washiali", party:"UDA" },
    { name:"Elon Wameyo", party:"IND" },
  ],
  "MCA - East Wanga": [
    { name:"East Wanga - Candidate A", party:"ODM" },
    { name:"East Wanga - Candidate B", party:"UDA" },
    { name:"East Wanga - Candidate C", party:"DCP" },
  ],
  "MCA - Lusheya/Lubinu": [
    { name:"Lusheya/Lubinu - Candidate A", party:"ODM" },
    { name:"Lusheya/Lubinu - Candidate B", party:"UDA" },
    { name:"Lusheya/Lubinu - Candidate C", party:"DAP-K" },
  ],
  "MCA - Malaha/Isongo/Makunga": [
    { name:"Malaha - Candidate A", party:"ODM" },
    { name:"Malaha - Candidate B", party:"UDA" },
    { name:"Malaha - Candidate C", party:"IND" },
  ],
};

export default function FreshBoard(){
  const [race,setRace]=useState("Governor");
  const [results,setResults]=useState<any[]>([]);
  const fetchR=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); setResults(data||[]); };
  useEffect(()=>{ fetchR(); const ch=supabase.channel("fresh").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},()=>fetchR()).subscribe(); return()=>{supabase.removeChannel(ch)} },[]);

  const filtered = results.filter((r:any)=>(r.race||"Governor")===race);
  const isMCA = race.startsWith("MCA");
  const wardGroups = isMCA? {} : null;

  // Build real totals - NO FAKE RANDOM
  const getTotals = ()=>{
    if(race==="Governor"){
      return {
        "Fernandes Barasa": filtered.reduce((s,r)=>s+(r.barasa_votes||0),0),
        "Cleophas Malala": filtered.reduce((s,r)=>s+(r.malala_votes||0),0),
        "Boni Khalwale": filtered.reduce((s,r)=>s+(r.khalwale_votes||0),0),
        "Elsie Muhanda": filtered.reduce((s,r)=>s+(r.muhanda_votes||0),0),
      };
    }
    // For other races, use extra_votes JSON
    const totals: any = {};
    ALL_RACES[race].forEach((c:any)=>{
      totals[c.name] = filtered.reduce((s,r)=>s+ (parseInt(r.extra_votes?.[c.name]||0)),0);
    });
    return totals;
  };

  const totals = getTotals();
  const totalVotes = Object.values(totals).reduce((a:any,b:any)=>a+b,0) as number || 1;
  const showZero = filtered.length===0;

  return(
    <div className="min-h-screen w-screen bg-[#eef1f3]">
      <div className="w-full bg-[#0a2e1f] text-white p-6">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="font-black text-3xl">HakiTally - KAKAMEGA COUNTY - FRESH DATA MODE</h1>
          <p className="text-lg mt-1">{race} 2027 Live | Mumias East Center - All Wards Visible</p>
          <p className="text-xl font-bold mt-3">{filtered.length} / 1200 Stations ({((filtered.length/1200)*100).toFixed(1)}%) {showZero && "- NO DATA YET - Enter via /admin"}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {Object.keys(ALL_RACES).map(r=><button key={r} onClick={()=>setRace(r)} className={`px-4 py-2 rounded-full text-sm font-bold ${race===r?"bg-white text-black":"bg-white/20"}`}>{r}</button>)}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        {/* MCA SPECIAL VIEW - All wards + vote flow */}
        {isMCA && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
            <p className="font-black text-sm">MCA PORTAL - {race} - Ward Level Live Flow</p>
            <p className="text-xs mt-1">Showing all stations in this ward only. Other wards: East Wanga (5 stns), Lusheya/Lubinu (8 stns), Malaha/Isongo/Makunga (5 stns). Total Mumias East: 18 stations.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ALL_RACES[race].map((c:any)=>{
            const v = (totals as any)[c.name] || 0;
            const pct = showZero? 0 : (v/totalVotes)*100;
            return(
              <div key={c.name} className="bg-white rounded-xl p-6 border-l-8 border-l-[#0f3d2e]">
                <p className="font-bold text-[14px]">{c.name} ({c.party})</p>
                <p className="text-3xl font-black mt-1">{showZero? 0 : v.toLocaleString()} <span className="text-sm font-normal">{pct.toFixed(1)}%</span></p>
                <div className="w-full bg-gray-200 h-3 rounded-full mt-3"><div className="bg-[#0f3d2e] h-3 rounded-full" style={{width:`${pct}%`}}></div></div>
                {isMCA && <p className="text-[11px] mt-2 text-gray-500">Ward: {race.replace("MCA - ","")} | Stations: {filtered.length}</p>}
              </div>
            );
          })}
        </div>

        {/* Station breakdown table for MCA */}
        <div className="bg-white rounded-xl p-4 mt-6">
          <p className="font-bold text-sm">Live Station Breakdown - {race}</p>
          <div className="mt-3 divide-y text-xs">
            {filtered.length===0? <p className="py-4 text-center text-gray-400">No data yet - Go to /admin and submit {race} votes for a station</p> :
              filtered.map((r:any)=><div key={r.id} className="py-2 flex justify-between"><span>{r.station_name} - {r.ward}</span><span>{r.form_34a_url? "✓ Form 34A" : ""}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
