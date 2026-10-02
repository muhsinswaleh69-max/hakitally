"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SUBCOUNTIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"];

const WARDS: any = {
  "Mumias East": ["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu": ["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Lugari": ["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lawandeti"],
  "Likuyani": ["Likuyani","Sango","Kongoni","Nzoia","Lumakanda"],
  "Malava": ["Manda-Shivanga","Matsakha","Lutaso","Ndalu","Matioli","Butali-Chegulo","Manda-Shivanga"],
  "Lurambi": ["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],
  "Navakholo": ["Ingostse-Matiha","Shinoyi-Shikomari-Esumeyia","Bunyala West","Bunyala East","Bunyala Central"],
  "Butere": ["Marama West","Marama Central","Marama North","Marama South","Marenyo-Shianda"],
  "Khwisero": ["Kisa North","Kisa East","Kisa West","Kisa Central"],
  "Shinyalu": ["Isukha North","Murhanda","Isukha Central","Isukha South","Isukha East","Isukha West"],
  "Ikolomani": ["Idakho South","Idakho East","Idakho North","Idakho Central"],
};

const MP_CANDIDATES: any = {
  "Mumias East": ["Peter Salasya (DAP-K)","Benjamin Washiali (UDA)","Elon Wameyo (IND)"],
  "Mumias West": ["Johnson Naicca (ODM)","Rashid Echesa (UDA)"],
  "Matungu": ["Peter Nabulindo (ODM)","Oscar Nabulindo (UDA)"],
  "default": ["Candidate A (ODM)","Candidate B (UDA)","Candidate C (DCP)"]
};

const MCA_CANDIDATES: any = {
  "East Wanga": ["MCA East Wanga A (ODM)","MCA East Wanga B (UDA)","MCA East Wanga C (DCP)"],
  "Lusheya/Lubinu": ["MCA Lubinu A (ODM)","MCA Lubinu B (UDA)","MCA Lubinu C (DAP-K)"],
  "Malaha/Isongo/Makunga": ["MCA Malaha A (ODM)","MCA Malaha B (UDA)","MCA Malaha C (IND)"],
  "default": ["MCA Candidate A (ODM)","MCA Candidate B (UDA)","MCA Candidate C (IND)"]
};

const OTHER_CANDIDATES: any = {
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
};

export default function HakiTallyPortal() {
  const [race, setRace] = useState("MP");
  const [results, setResults] = useState<any[]>([]);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("hakitally_results_34a").select("*");
      setResults(data || []);
    };
    fetchData();
    const channel = supabase.channel("hakitally-final").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const displaySubcounties = selectedSubcounty? [selectedSubcounty] : SUBCOUNTIES;

  const getVotes = (wardResults: any[], idx: number) => {
    return wardResults.reduce((s, r) => {
      const vals = r.extra_votes? Object.values(r.extra_votes) : [];
      return s + parseInt((vals[idx] as any) || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f1f3f5]">
      <div className="w-full bg-[#0a2e1f] text-white p-6">
        <div className="max-w-[1700px] mx-auto">
          <h1 className="font-black text-3xl tracking-wide">HakiTally - KAKAMEGA COUNTY</h1>
          <p className="text-lg opacity-80 mt-1">{race} 2027 Live Portal | All Subcounties and Wards | {results.length} / 1200 Stations - FRESH DATA MODE</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {["Governor","Senator","Woman Rep","MP","MCA"].map((r) => (
              <button key={r} onClick={() => { setRace(r); setSelectedSubcounty(null); setSelectedWard("All"); }} className={`px-6 py-2.5 rounded-full font-bold text-sm transition ${race===r? "bg-white text-black scale-105" : "bg-white/20 hover:bg-white/30"}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-4">
        <div className="bg-white rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="font-black text-sm">{race} PORTAL - {selectedSubcounty? `${selectedSubcounty} - DETAILED VIEW` : "All 12 Subcounties - Click Any Subcounty to Filter"}</p>
            {selectedSubcounty && <button onClick={() => setSelectedSubcounty(null)} className="px-5 py-1.5 bg-black text-white rounded-full text-xs font-black">← Show All 12 Subcounties</button>}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {SUBCOUNTIES.map((sc) => (
              <button key={sc} onClick={() => { setSelectedSubcounty(sc); setSelectedWard("All"); }} className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${selectedSubcounty===sc? "bg-[#0a2e1f] text-white scale-110 shadow-lg" : "bg-gray-200 hover:bg-gray-300"}`}>{sc}</button>
            ))}
          </div>
          {race==="MCA" && selectedSubcounty && (
            <div className="flex gap-2 mt-4 flex-wrap border-t pt-4">
              <button onClick={() => setSelectedWard("All")} className={`px-4 py-1.5 rounded-full text-xs font-bold ${selectedWard==="All"? "bg-black text-white" : "bg-yellow-100"}`}>All Wards in {selectedSubcounty}</button>
              {(WARDS[selectedSubcounty] || WARDS.default).map((w:string) => (
                <button key={w} onClick={() => setSelectedWard(w)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${selectedWard===w? "bg-black text-white" : "bg-gray-100"}`}>{w}</button>
              ))}
            </div>
          )}
        </div>

        {/* Governor / Senator / Woman Rep View */}
        {(race==="Governor"||race==="Senator"||race==="Woman Rep") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OTHER_CANDIDATES[race].map((c:any) => {
              const filtered = results.filter((r:any)=>r.race===race);
              return <div key={c.name} className="bg-white rounded-xl p-6 border-l-8 border-l-[#0a2e1f]"><p className="font-bold text-sm">{c.name} ({c.party})</p><p className="text-2xl font-black mt-2">{filtered.length===0?0:filtered.reduce((s:any,r:any)=>s+(r.barasa_votes||0),0)} votes</p><p className="text-[11px] text-gray-400 mt-1">{filtered.length} stations</p></div>;
            })}
          </div>
        )}

        {/* MP and MCA View - Now Filters Correctly */}
        {(race==="MP"||race==="MCA") && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displaySubcounties.map((sub) => {
              const wardsList = race==="MCA"? (selectedWard==="All"? (WARDS[sub] || WARDS.default) : [selectedWard]) : [sub];
              return wardsList.map((ward:string) => {
                const wardResults = race==="MCA"? results.filter((r:any)=>r.ward===ward) : results.filter((r:any)=>r.constituency===sub);
                const cands = race==="MP"? (MP_CANDIDATES[sub] || MP_CANDIDATES.default) : (MCA_CANDIDATES[ward] || MCA_CANDIDATES.default);
                const title = race==="MP"? `${sub} - MP Race` : `${ward} Ward - ${sub} - MCA Race`;
                return (
                  <div key={sub+"-"+ward} className="bg-white rounded-xl p-5 border-l-8 border-l-[#0a2e1f] shadow-sm hover:shadow-md transition">
                    <p className="font-black text-[13px]">{title} - {wardResults.length} stns reported</p>
                    <div className="mt-4 space-y-2.5">
                      {cands.map((cand:string, idx:number) => {
                        const v = getVotes(wardResults, idx);
                        return <div key={cand} className="flex justify-between items-center text-xs bg-[#f8faf9] p-3 rounded-lg border"><span className="font-medium">{cand}</span><span className="font-black text-sm">{v} votes</span></div>;
                      })}
                    </div>
                    <div className="mt-4 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
                      <p className="font-bold">Vote Flow:</p>
                      <p>{wardResults.length===0? "No Form 35A/36A yet - Enter via /admin" : `Stations: ${wardResults.map((r:any)=>r.station_name).join(", ")}`}</p>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>
    </div>
  );
}
