"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const WARDS_PER_SUBCOUNTY:any = {
  "Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Mumias West":["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu":["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Shinyalu":["Murhanda","Isukha North","Isukha East","Isukha South","Isukha Central","Isukha West"],
  "Lugari":["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lwandeti"],
  "Likuyani":["Likuyani","Sango","Kongoni","Nzoia","Sinoko"],
  "Malava":["West Kabras","Chemuche","East Kabras","Butali-Chegulo","Manda-Shivanga","Matsakha","Shamakhokho"],
  "Lurambi":["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],
  "Navakholo":["Ingotse-Mathia","Shinoyi-Shikomari-Esumeyia","Bunyala West","Bunyala East","Bunyala Central"],
  "Butere":["Marama West","Marama Central","Marama North","Marama South","Marenyo-Shianda"],
  "Khwisero":["Kisa North","Kisa East","Kisa West","Kisa Central"],
  "Ikolomani":["Idakho South","Idakho East","Idakho North","Idakho Central"],
};

const CANDIDATES:any = {
  Governor: ["Fernandes Barasa (ODM)","Cleophas Malala (DCP)","Boni Khalwale (IND)"],
  Senator: ["Edwin Sifuna (ODM)","Boni Khalwale (UDA)","George Khaniri (DCP)"],
  "Woman Rep": ["Elsie Muhanda (ODM)","Beatrice Adagala (UDA)","Rachael Otundo (DCP)"],
  MP: {
    "Mumias East":["Peter Nabulindo (ODM)","Benjamin Washiali (UDA)","David Were (DCP)"],
    "Shinyalu":["Fred Ikana (ODM)","Justus Kizito (UDA)","Omboko Milemba (DCP)"],
    "Mumias West":["Johnson Naicca (ODM)","Rashid Echesa (UDA)","Tim Wanyonyi (DCP)"],
    "Lugari":["Ayub Savula (ODM)","Nabii Nabwera (UDA)","Isaac Andabwa (DCP)"],
    "Likuyani":["Innocent Mugabe (ODM)","Enock Kibunguchy (UDA)","Oscar Nabulindo (DCP)"],
    "Malava":["Moses Malulu (ODM)","Seth Panyako (DCP)","Moses Malulu Injendi (UDA)"],
    "Lurambi":["Titus Khamala (ODM)","Bishop Owino (UDA)","Alfred Agoi (DCP)"],
    "Navakholo":["Emmanuel Wangwe (ODM)","Elvis Chiche (UDA)","Wilberforce Lutta (DCP)"],
    "Butere":["Tindi Mwale (ODM)","Hillary Otsiula (UDA)","Andrew Toboso (DCP)"],
    "Khwisero":["Christopher Aseka (ODM)","Julius Arunga (UDA)","Evans Lutta (DCP)"],
    "Matungu":["Peter Oscar Nabulindo (ODM)","Justus Murunga (UDA)","Oscar Nabulindo (DCP)"],
    "Ikolomani":["Bernard Shinali (ODM)","Bonface Mukhwana (UDA)","Vincent Malenya (DCP)"]
  }
};

const getMCACandidates = (ward:string) => {
  const short = ward.split("/")[0].substring(0,6);
  return [`MCA ${short} A (ODM)`,`MCA ${short} B (UDA)`,`MCA ${short} C (DCP)`];
};

const SUBCOUNTIES = Object.keys(WARDS_PER_SUBCOUNTY);

export default function Portal(){
  const [tab,setTab]=useState("MCA");
  const [subcounty,setSubcounty]=useState("Mumias East");
  const [wardFilter,setWardFilter]=useState("All Wards in Mumias East");
  const [results,setResults]=useState<any[]>([]);

  const fetchAll=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); if(data) setResults(data); };
  useEffect(()=>{ fetchAll(); const ch=supabase.channel("uniform-cards").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},fetchAll).subscribe(); setInterval(fetchAll,2500); return()=>{supabase.removeChannel(ch);} },[]);

  const getTally=(race:string, sc?:string, wd?:string)=>{
    let rows=results.filter(r=>r.race===race);
    if(sc) rows=rows.filter(r=>r.constituency===sc);
    if(wd) rows=rows.filter(r=>r.ward===wd);
    const tally:Record<string,number>={}; rows.forEach(r=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+(v as number); }); });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const stns=new Set(rows.map(r=>r.station_name)).size;
    return {tally,total,stns,rows};
  };

  // Component for candidate card - EXACTLY like your screenshot
  const CandidateCard = ({name, votes, total}:{name:string, votes:number, total:number}) => {
    const pct = total? ((votes/total)*100).toFixed(1) : "0.0";
    const isWinner = parseFloat(pct) > 50;
    return(
      <div className="bg-[#f8f9fa] rounded-xl p-3 mb-2 border border-gray-100">
        <p className="font-medium text-[14px] text-black">{name}</p>
        <div className="flex justify-between mt-1">
          <p className="font-bold text-[14px]">{votes.toLocaleString()} votes</p>
          <p className="font-bold text-[14px] text-[#0a3d1f]">{pct}%</p>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-[#0a3d1f] rounded-full transition-all duration-700" style={{width:`${pct}%`}}></div>
        </div>
        {isWinner && <p className="text-[10px] font-black text-green-700 mt-1">🎉 LEADING</p>}
      </div>
    );
  };

  const renderUniformRace = (race:string, title:string, candidates:string[], tally:any, total:number, stns:number, need:number) => {
    const sorted = Object.entries(tally).sort((a:any,b:any)=>b[1]-a[1]);
    const isComplete = stns>=need;
    const winner = sorted[0] as any;
    return(
      <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-l-[#0a3d1f] mb-4">
        <p className="font-bold text-[15px]">{title} - {stns} stns reported {isComplete && winner && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">WINNER: {winner[0].split(" ")[0].toUpperCase()}</span>}</p>
        {isComplete && winner && (
          <div className="bg-green-600 text-white rounded-xl p-3 mt-3 text-center">
            <p className="font-black text-[16px]">🎉 CONGRATULATIONS {race.toUpperCase()} {winner[0].split(" ")[0].toUpperCase()}! 🎉</p>
            <p className="text-[12px]">{winner[0]} - {winner[1].toLocaleString()} votes ({total? ((winner[1]/total)*100).toFixed(1):0}%)</p>
          </div>
        )}
        <div className="mt-3">
          {candidates.map(c=>{
            const key = Object.keys(tally).find(k=>k===c || k.includes(c.split(" ")[0]) || k.includes(c.split("(")[0].trim())) || c;
            const v = tally[key]||tally[c]||0;
            return <CandidateCard key={c} name={c} votes={v} total={total} />;
          })}
        </div>
        {total===0 && <p className="text-[12px] text-gray-400 mt-2">No Form 35A/36A yet - Enter via /admin</p>}
      </div>
    );
  };

  return(
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="bg-black text-white p-4">
        <h1 className="text-[20px] font-black">HakiTally - KAKAMEGA COUNTY</h1>
        <div className="flex gap-2 mt-3 flex-wrap">{["Governor","Senator","Woman Rep","MP","MCA"].map(t=><button key={t} onClick={()=>{setTab(t); setWardFilter(t==="MCA"? `All Wards in ${subcounty}`:t);}} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${tab===t? "bg-white text-black":"bg-white/10 text-white/60"}`}>{t}</button>)}</div>
      </div>

      <div className="p-3 max-w-[700px] mx-auto">
        {/* Subcounty selector */}
        <div className="flex gap-2 flex-wrap mb-3">{SUBCOUNTIES.map(sc=><button key={sc} onClick={()=>{setSubcounty(sc); setWardFilter(`All Wards in ${sc}`);}} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${subcounty===sc? "bg-black text-white":"bg-white text-gray-700"}`}>{sc}</button>)}</div>

        {/* Ward filter for MCA */}
        {tab==="MCA" && (
          <div className="flex gap-2 flex-wrap mb-4 bg-white p-2 rounded-xl">
            <button onClick={()=>setWardFilter(`All Wards in ${subcounty}`)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${wardFilter===`All Wards in ${subcounty}`? "bg-black text-white":"bg-gray-100"}`}>All Wards in {subcounty}</button>
            {(WARDS_PER_SUBCOUNTY[subcounty]||[]).map((w:string)=><button key={w} onClick={()=>setWardFilter(w)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${wardFilter===w? "bg-black text-white":"bg-gray-100"}`}>{w}</button>)}
          </div>
        )}

        {/* GOVERNOR */}
        {tab==="Governor" && (()=>{ const {tally,total,stns}=getTally("Governor"); return renderUniformRace("Governor",`Governor - Kakamega County`, CANDIDATES.Governor, tally, total, stns, 1200); })()}

        {/* SENATOR */}
        {tab==="Senator" && (()=>{ const {tally,total,stns}=getTally("Senator"); return renderUniformRace("Senator",`Senator - Kakamega County`, CANDIDATES.Senator, tally, total, stns, 1200); })()}

        {/* WOMAN REP */}
        {tab==="Woman Rep" && (()=>{ const {tally,total,stns}=getTally("Woman Rep"); return renderUniformRace("Woman Rep",`Woman Rep - Kakamega County`, CANDIDATES["Woman Rep"], tally, total, stns, 1200); })()}

        {/* MP - per subcounty */}
        {tab==="MP" && (()=>{ const {tally,total,stns}=getTally("MP",subcounty); const cands=CANDIDATES.MP[subcounty]||CANDIDATES.MP["Mumias East"]; return renderUniformRace("MP",`${subcounty} - MP Race`, cands, tally, total, stns, 100); })()}

        {/* MCA - per ward - EXACTLY like your screenshot */}
        {tab==="MCA" && (
          <div>
            {(wardFilter.startsWith("All Wards")? (WARDS_PER_SUBCOUNTY[subcounty]||[]) : [wardFilter]).map((w:string)=>{
              const {tally,total,stns}=getTally("MCA",subcounty,w);
              const cands=getMCACandidates(w);
              return renderUniformRace("MCA",`${w} Ward - ${subcounty} - MCA Race`, cands, tally, total, stns, w==="Lusheya/Lubinu"?17:16);
            })}
          </div>
        )}
      </div>
    </div>
  );
}
