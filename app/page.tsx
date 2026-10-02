"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SUBCOUNTIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

const WARDS_BY_SUBCOUNTY: any = {
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu": ["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Lugari": ["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lawandeti"],
};

const CANDIDATES: any = {
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
    { name:"Hadija Nganyi", party:"UDA" },
    { name:"Naomi Shiyonga", party:"DAP-K" },
  ],
  MP: {
    "Mumias East": ["Peter Salasya (DAP-K)","Benjamin Washiali (UDA)","Elon Wameyo (IND)"],
    "default": ["Candidate A (ODM)","Candidate B (UDA)","Candidate C (DCP)"]
  },
  MCA: {
    "East Wanga": ["MCA East Wanga A (ODM)","MCA East Wanga B (UDA)"],
    "Lusheya/Lubinu": ["MCA Lubinu A (ODM)","MCA Lubinu B (UDA)"],
    "Malaha/Isongo/Makunga": ["MCA Malaha A (ODM)","MCA Malaha B (UDA)"],
    "default": ["MCA Candidate A (ODM)","MCA Candidate B (UDA)"]
  }
};

export default function Portal() {
  const [race, setRace] = useState("MP");
  const [results, setResults] = useState<any[]>([]);
  const [selectedSubcounty, setSelectedSubcounty] = useState("Mumias East");
  const [selectedWard, setSelectedWard] = useState("All");

  useEffect(() => {
    const fetchR = async () => {
      const { data } = await supabase.from("hakitally_results_34a").select("*");
      setResults(data || []);
    };
    fetchR();
    const ch = supabase.channel("portal-fixed").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => {
      fetchR();
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#f1f3f5]">
      <div className="w-full bg-[#0a2e1f] text-white p-6">
        <div className="max-w-[1700px] mx-auto">
          <h1 className="font-black text-3xl">HakiTally - KAKAMEGA COUNTY</h1>
          <p className="text-lg opacity-80">{race} 2027 Live Portal | All Subcounties and Wards</p>
          <p className="font-bold mt-2">{results.length} / 1200 Stations - FRESH DATA MODE</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {["Governor","Senator","Woman Rep","MP","MCA"].map((r) => (
              <button key={r} onClick={() => { setRace(r); setSelectedWard("All"); }} className={`px-6 py-2 rounded-full font-bold ${race===r? "bg-white text-black" : "bg-white/20"}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-4">
        {race === "MP" && (
          <div>
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="font-black">MP PORTAL - All 12 Subcounties</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {SUBCOUNTIES.map((sc) => (
                  <button key={sc} onClick={() => setSelectedSubcounty(sc)} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSubcounty===sc? "bg-[#0a2e1f] text-white" : "bg-gray-200"}`}>{sc}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBCOUNTIES.map((sub) => {
                const cands = (CANDIDATES.MP as any)[sub] || CANDIDATES.MP.default;
                const subResults = results.filter((r:any) => r.constituency === sub);
                return (
                  <div key={sub} className={`bg-white rounded-xl p-4 border-2 ${selectedSubcounty===sub? "border-[#0a2e1f]" : "border-gray-100"}`}>
                    <p className="font-black text-sm">{sub} - {subResults.length} stns reported</p>
                    <div className="mt-3 space-y-2">
                      {cands.map((cand:string, idx:number) => {
                        const v = subResults.reduce((s:any, r:any) => s + parseInt((r.extra_votes? Object.values(r.extra_votes)[idx] : 0) as any || 0), 0);
                        return <div key={cand} className="flex justify-between text-xs bg-gray-50 p-2 rounded"><span>{cand}</span><span className="font-bold">{v} votes</span></div>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {race === "MCA" && (
          <div>
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="font-black">MCA PORTAL - {selectedSubcounty} - All Wards Vote Flow</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {SUBCOUNTIES.map((sc) => (
                  <button key={sc} onClick={() => { setSelectedSubcounty(sc); setSelectedWard("All"); }} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedSubcounty===sc? "bg-[#0a2e1f] text-white" : "bg-gray-200"}`}>{sc}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={() => setSelectedWard("All")} className={`px-3 py-1 rounded-full text-xs ${selectedWard==="All"? "bg-black text-white" : "bg-yellow-100"}`}>All Wards in {selectedSubcounty}</button>
                {(WARDS_BY_SUBCOUNTY[selectedSubcounty] || ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"]).map((w:string) => (
                  <button key={w} onClick={() => setSelectedWard(w)} className={`px-3 py-1 rounded-full text-xs ${selectedWard===w? "bg-black text-white" : "bg-gray-100"}`}>{w}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedWard==="All"? (WARDS_BY_SUBCOUNTY[selectedSubcounty] || ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"]) : [selectedWard]).map((ward:string) => {
                const cands = (CANDIDATES.MCA as any)[ward] || CANDIDATES.MCA.default;
                const wardResults = results.filter((r:any) => r.ward === ward);
                return (
                  <div key={ward} className="bg-white rounded-xl p-4 border-l-8 border-l-[#0a2e1f]">
                    <p className="font-black text-sm">{ward} Ward - {wardResults.length} stns</p>
                    <div className="mt-3 space-y-2">
                      {cands.map((cand:string, idx:number) => {
                        const v = wardResults.reduce((s:any, r:any) => s + parseInt((r.extra_votes? Object.values(r.extra_votes)[idx] : 0) as any || 0), 0);
                        return <div key={cand} className="flex justify-between text-xs bg-gray-50 p-2 rounded"><span>{cand}</span><span className="font-bold">{v} votes</span></div>;
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">{wardResults.length===0? "No data - enter via /admin" : wardResults.map((r:any)=>r.station_name).join(", ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(race==="Governor"||race==="Senator"||race==="Woman Rep") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CANDIDATES[race].map((c:any) => (
              <div key={c.name} className="bg-white rounded-xl p-6"><p className="font-bold">{c.name} ({c.party})</p><p className="text-2xl font-black mt-2">{results.filter((r:any)=>r.race===race).length===0? 0 : results.filter((r:any)=>r.race===race).reduce((s:any,r:any)=>s+(r.barasa_votes||0),0)} votes - {results.filter((r:any)=>r.race===race).length} stns</p></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
