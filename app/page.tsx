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
  "Malava": ["Manda-Shivanga","Matsakha","Lutaso","Ndalu","Matioli","Butali-Chegulo","Shivali"],
  "Lurambi": ["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],
  "Navakholo": ["Ingostse-Matiha","Shinoyi-Shikomari","Bunyala West","Bunyala East","Bunyala Central"],
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

// UPDATED FOR EXPERIMENT - YOUR 3 CANDIDATES
const MCA_CANDIDATES: any = {
  "East Wanga": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "Lusheya/Lubinu": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "Malaha/Isongo/Makunga": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"],
  "Mautuma": ["Mautuma A (ODM)","Mautuma B (UDA)","Mautuma C (IND)"],
  "default": ["Timothy Wanzetse (ODM)","Sophia Manyasa (UDA)","Stanislaus Wanzetse (DAP-K)"]
};

const OTHER: any = {
  Governor: ["Fernandes Barasa (ODM)","Cleophas Malala (DCP)","Boni Khalwale (IND)"],
  Senator: ["Kevin Mahelo (UDA)","Seth Panyako (UDA)","Naomi Shiyonga (DAP-K)"],
  "Woman Rep": ["Margaret Ndege (IND)","Hadija Nganyi (UDA)","Naomi Shiyonga (DAP-K)"],
};

export default function FinalPortal() {
  const [race, setRace] = useState("MCA");
  const [results, setResults] = useState<any[]>([]);
  const [selectedSubcounty, setSelectedSubcounty] = useState<string | null>("Mumias East");
  const [selectedWard, setSelectedWard] = useState("All");

  useEffect(() => {
    const f = async () => { const { data } = await supabase.from("hakitally_results_34a").select("*"); setResults(data || []); };
    f(); const ch = supabase.channel("final-v2").on("postgres_changes", { event: "*", schema: "public", table: "hakitally_results_34a" }, () => f()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const displaySubcounties = selectedSubcounty? [selectedSubcounty] : SUBCOUNTIES;

  return (
    <div className="min-h-screen w-screen bg-[#f1f3f5]">
      <div className="w-full bg-[#0a2e1f] text-white p-6">
        <div className="max-w-[1700px] mx-auto">
          <h1 className="font-black text-3xl">HakiTally - KAKAMEGA COUNTY</h1>
          <p className="opacity-80 mt-1">{race} 2027 Live | % + ELECTED | {results.length} / 1200 Stations</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {["Governor","Senator","Woman Rep","MP","MCA"].map((r) => (
              <button key={r} onClick={() => { setRace(r); setSelectedSubcounty(r==="MCA"?"Mumias East":null); }} className={`px-6 py-2 rounded-full font-bold text-sm ${race===r? "bg-white text-black" : "bg-white/20"}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-[1700px] mx-auto p-4">
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between"><p className="font-black text-sm">{selectedSubcounty} - Detailed</p><button onClick={() => setSelectedSubcounty(null)} className="px-4 py-1 bg-black text-white rounded-full text-xs font-bold">← Show All 12</button></div>
          <div className="flex gap-2 mt-3 flex-wrap">{SUBCOUNTIES.map(sc => <button key={sc} onClick={() => setSelectedSubcounty(sc)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedSubcounty===sc? "bg-[#0a2e1f] text-white" : "bg-gray-200"}`}>{sc}</button>)}</div>
          {race==="MCA" && selectedSubcounty && (
            <div className="flex gap-2 mt-3 flex-wrap border-t pt-3">
              <button onClick={() => setSelectedWard("All")} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedWard==="All"? "bg-black text-white" : "bg-yellow-100"}`}>All Wards in {selectedSubcounty}</button>
              {(WARDS[selectedSubcounty]||[]).map((w:string)=><button key={w} onClick={()=>setSelectedWard(w)} className={`px-3 py-1 rounded-full text-xs font-bold ${selectedWard===w? "bg-black text-white" : "bg-gray-100"}`}>{w}</button>)}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displaySubcounties.map((sub) => {
            const wardsList = race==="MCA"? (selectedWard==="All"? (WARDS[sub]||[]) : [selectedWard]) : [sub];
            return wardsList.map((ward:string) => {
              const wardResults = race==="MCA"? results.filter((r:any)=>r.ward===ward) : results.filter((r:any)=>r.constituency===sub);
              const cands = race==="MP"? (MP_CANDIDATES[sub]||MP_CANDIDATES.default) : race==="MCA"? (MCA_CANDIDATES[ward]||MCA_CANDIDATES.default) : OTHER[race];
              const votesArr = cands.map((_:any, idx:number) => wardResults.reduce((s:any,r:any)=> s + parseInt((r.extra_votes? Object.values(r.extra_votes)[idx] : 0) as any || 0),0));
              const totalVotes = votesArr.reduce((a:number,b:number)=>a+b,0) || 1;
              const maxVotes = Math.max(...votesArr);
              const hasData = wardResults.length>0;
              return (
                <div key={sub+ward} className="bg-white rounded-xl p-5 border-l-[6px] border-l-[#0a2e1f] shadow-sm">
                  <p className="font-black text-[13px]">{ward} Ward - {sub} - MCA Race - {wardResults.length} stns reported</p>
                  <div className="mt-4 space-y-3">
                    {cands.map((cand:string, idx:number) => {
                      const v = votesArr[idx]; const pct = hasData? (v/totalVotes*100) : 0; const isWinner = hasData && v===maxVotes && v>0;
                      return (
                        <div key={cand} className={`p-3 rounded-xl border ${isWinner? "bg-green-50 border-green-500 border-2" : "bg-gray-50 border-gray-100"}`}>
                          <div className="flex justify-between items-center gap-2"><span className="font-bold text-[12px]">{cand}</span>{isWinner && <span className="bg-green-600 text-white text-[9px] font-black px-2 py-1 rounded-full">✓ ELECTED - WON</span>}</div>
                          <div className="flex justify-between items-center mt-2"><span className="text-xs font-black">{v.toLocaleString()} votes</span><span className="text-xs font-black text-[#0a2e1f]">{pct.toFixed(1)}%</span></div>
                          <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2 overflow-hidden"><div className={`h-2.5 rounded-full ${isWinner? "bg-green-600" : "bg-[#0a2e1f]"}`} style={{width: `${pct}%`}}></div></div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3">{hasData? `Stations: ${wardResults.map((r:any)=>r.station_name).join(", ")}` : "No Form 35A/36A yet - Enter via /admin"}</p>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
