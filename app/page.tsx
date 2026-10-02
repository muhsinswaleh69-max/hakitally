// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const GOV_CANDIDATES = [
  { name:"Fernandes Barasa (ODM)", short:"BARASA" },
  { name:"Cleophas Malala (ANC)", short:"MALALA" },
  { name:"Boni Khalwale (UDA)", short:"KHALWALE" },
  { name:"Suleiman Sumba (KANU)", short:"SUMBA" },
];

const MP_2022:any = {
  "Mumias East":["Peter Nabulindo (ODM)","Benjamin Washiali (UDA)","David Were (DCP)"],
  "Mumias West":["Johnson Naicca (ODM)","Rashid Echesa (UDA)","Emmanuel Wangwe (ANC)"],
  "Matungu":["Peter Oscar Nabulindo (ODM)","Justus Murunga (UDA)","Oscar Nabulindo (ANC)"],
  "Butere":["Tindi Mwale (ODM)","Hillary Otsiula (UDA)","Andrew Toboso (ANC)"],
  "Khwisero":["Christopher Aseka (ODM)","Julius Arunga (UDA)","Evans Lutta (ANC)"],
  "Shinyalu":["Fred Ikana (ODM)","Justus Kizito (UDA)","Omboko Milemba (ANC)"],
  "Ikolomani":["Bernard Shinali (ODM)","Bonface Mukhwana (UDA)","Vincent Malenya (ANC)"],
  "Lurambi":["Titus Khamala (ODM)","Bishop Owino (UDA)","Alfred Agoi (ANC)"],
  "Navakholo":["Emmanuel Wangwe (ODM)","Elvis Chiche (UDA)","Wilberforce Lutta (ANC)"],
  "Malava":["Moses Malulu Injendi (ANC)","Seth Panyako (UDM)","Moses Malulu (ODM)"],
  "Lugari":["Nabii Nabwera (ODM)","Ayub Savula (ANC)","Isaac Andabwa (UDA)"],
  "Likuyani":["Innocent Mugabe (ODM)","Enock Kibunguchy (ANC)","Mugabe Were (UDA)"],
};

const WARDS:any = {
  "Mumias East":["East Wanga","Lusheya/Lubinu","Malaha/Isongo/Makunga"],
  "Shinyalu":["Murhanda","Isukha North","Isukha East","Isukha South","Isukha Central","Isukha West"],
  "Lugari":["Mautuma","Lugari","Lumakanda","Chekalini","Chevaywa","Lwandeti"],
  "Mumias West":["Mumias Central","Mumias North","Etenje","Musanda"],
  "Matungu":["Koyonzo","Kholera","Khalaba","Mayoni","Namamali"],
  "Butere":["Marama West","Marama Central","Marama North","Marama South","Marenyo-Shianda"],
  "Khwisero":["Kisa North","Kisa East","Kisa West","Kisa Central"],
  "Ikolomani":["Idakho South","Idakho East","Idakho North","Idakho Central"],
  "Lurambi":["Butsotso East","Butsotso South","Butsotso Central","Sheywe","Mahiakalo","Shirere"],
  "Navakholo":["Ingotse-Mathia","Shinoyi-Shikomari-Esumeyia","Bunyala West","Bunyala East","Bunyala Central"],
  "Malava":["West Kabras","Chemuche","East Kabras","Butali-Chegulo","Manda-Shivanga","Matsakha","Shamakhokho"],
  "Likuyani":["Likuyani","Sango","Kongoni","Nzoia","Sinoko"]
};

export default function Page(){
  const [tab,setTab]=useState("Governor");
  const [sub,setSub]=useState("Mumias East");
  const [wardFilter,setWardFilter]=useState("All Wards in Mumias East");
  const [results,setResults]=useState<any[]>([]);
  const load=async()=>{ const {data}=await supabase.from("hakitally_results_34a").select("*"); if(data) setResults(data); };
  useEffect(()=>{ load(); const ch=supabase.channel("final").on("postgres_changes",{event:"*",schema:"public",table:"hakitally_results_34a"},load).subscribe(); return()=>{supabase.removeChannel(ch);} },[]);

  const getTally=(race:string, sc?:string, wd?:string)=>{
    let rows=results.filter((r:any)=>r.race===race);
    if(sc) rows=rows.filter((r:any)=>r.constituency===sc);
    if(wd) rows=rows.filter((r:any)=>r.ward===wd);
    const tally:any={}; rows.forEach((r:any)=>{ Object.entries(r.extra_votes||{}).forEach(([k,v]:any)=>{ tally[k]=(tally[k]||0)+v; }); });
    const total=Object.values(tally).reduce((a:any,b:any)=>a+b,0) as number;
    const sorted=Object.entries(tally).sort((a:any,b:any)=>(b[1] as number)-(a[1] as number));
    const stns=new Set(rows.map((r:any)=>r.station_name)).size;
    return {tally,total,sorted,stns};
  };

  const g=getTally("Governor");
  const lead=g.sorted[0] as any;

  return(
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-[#0a3d1f] text-white rounded-[20px] m-3 p-6 text-center">
        <h1 className="text-[22px] font-black">HakiTally - KAKAMEGA COUNTY</h1>
        <p className="text-[13px] mt-1">{tab} 2027 Live Tally | Form 34A Parallel Count</p>
        <p className="text-[18px] font-bold mt-2">{g.stns} / 1200 Stations Reported ({Math.round(g.stns/1200*100)}%)</p>
        <div className="w-full h-2 bg-white/20 rounded-full mt-3"><div className="h-full bg-white rounded-full" style={{width:`${(g.stns/1200)*100}%`}}></div></div>
        <p className="text-[11px] mt-2 opacity-70">Auto-updates | Leading: {lead? lead[0].split(" ")[0]:"-"} ● LIVE</p>
        <div className="flex gap-2 justify-center mt-4 flex-wrap">{["Governor","Senator","Woman Rep","MP","MCA"].map((t:any)=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1 rounded-full text-[12px] font-bold ${tab===t? "bg-white text-[#0a3d1f]":"bg-white/10"}`}>{t}</button>)}</div>
      </div>

      <div className="p-3 max-w-[800px] mx-auto">
        {(tab==="MP"||tab==="MCA") && (
          <div className="bg-white rounded-xl p-3 mb-3">
            <div className="flex gap-2 flex-wrap">{Object.keys(WARDS).map((sc:any)=><button key={sc} onClick={()=>{setSub(sc); setWardFilter(`All Wards in ${sc}`);}} className={`px-3 py-1 rounded-full text-[11px] font-bold ${sub===sc? "bg-black text-white":"bg-gray-100"}`}>{sc}</button>)}</div>
            {tab==="MCA" && <div className="flex gap-2 flex-wrap mt-2 border-t pt-2"><button onClick={()=>setWardFilter(`All Wards in ${sub}`)} className={`px-3 py-1 rounded-full text-[11px] font-bold ${wardFilter.includes("All Wards")? "bg-black text-white":"bg-gray-100"}`}>All Wards in {sub}</button>{(WARDS[sub]||[]).map((w:any)=><button key={w} onClick={()=>setWardFilter(w)} className={`px-3 py-1 rounded-full text-[11px] font-bold ${wardFilter===w? "bg-black text-white":"bg-gray-100"}`}>{w}</button>)}</div>}
          </div>
        )}

        {tab==="Governor" && (
          <div className="grid grid-cols-2 gap-3">
            {GOV_CANDIDATES.map((c:any)=>{
              const v = g.tally[c.name]||0; const pct=g.total? Math.round((v/g.total)*100):0; const isLead=lead && lead[0]===c.name;
              return(<div key={c.name} className="bg-white rounded-xl p-4 border-l-4 border-l-[#0a3d1f]"><p className="text-[12px]">{c.name}</p><p className="font-black text-[20px]">{v.toLocaleString()} <span className="text-[12px]">{pct}%</span></p>{isLead && <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded font-bold">LEADING</span>}</div>);
            })}
          </div>
        )}

        {tab==="MP" && (
          <div className="space-y-3">{(MP_2022[sub]||[]).map((name:string)=>{
            const mpT=getTally("MP",sub); const v=mpT.tally[name]||0; const pct=mpT.total? ((v/mpT.total)*100).toFixed(1):"0.0";
            return(<div key={name} className="bg-white rounded-xl p-3"><p className="text-[12px] font-medium">{name}</p><div className="flex justify-between"><span className="font-bold text-[13px]">{v.toLocaleString()} votes</span><span className="font-bold text-[13px] text-[#0a3d1f]">{pct}%</span></div><div className="w-full h-2 bg-gray-200 rounded-full mt-2"><div className="h-full bg-[#0a3d1f] rounded-full" style={{width:`${pct}%`}}></div></div></div>);
          })}<p className="text-[11px] text-gray-400">{getTally("MP",sub).stns} stns reported • {sub} - MP Race</p></div>
        )}

        {tab==="MCA" && (
          <div>{(wardFilter.includes("All Wards")? WARDS[sub] : [wardFilter]).map((w:string)=>{
            const m=getTally("MCA",sub,w); const short=w.split("/")[0].substring(0,6); const cands=[`MCA ${short} A (ODM)`,`MCA ${short} B (UDA)`,`MCA ${short} C (DCP)`];
            return(<div key={w} className="bg-white rounded-2xl p-4 border-l-4 border-l-[#0a3d1f] mb-3"><p className="font-bold text-[13px]">{w} Ward - {sub} - MCA Race - {m.stns} stns reported</p><div className="mt-3">{cands.map((c:any)=>{ const v=m.tally[c]||0; const pct=m.total? ((v/m.total)*100).toFixed(1):"0.0"; return(<div key={c} className="bg-[#f8f9fa] rounded-xl p-3 mb-2"><p className="text-[13px]">{c}</p><div className="flex justify-between"><span className="font-bold text-[13px]">{v} votes</span><span className="font-bold text-[13px] text-[#0a3d1f]">{pct}%</span></div><div className="w-full h-2 bg-gray-200 rounded-full mt-2"><div className="h-full bg-[#0a3d1f] rounded-full" style={{width:`${pct}%`}}></div></div></div>); })}<p className="text-[11px] text-gray-400 mt-2">No Form 35A/36A yet - Enter via /admin</p></div>);
          })}</div>
        )}

        {(tab==="Senator"||tab==="Woman Rep") && (()=>{ const t=getTally(tab); return(<div className="bg-white rounded-xl p-4"><p className="font-bold text-[13px]">{tab} - {t.stns} stns</p><div className="mt-3">{Object.entries(t.tally).map(([k,v]:any)=><div key={k} className="bg-[#f8f9fa] rounded-xl p-3 mb-2"><p className="text-[13px]">{k}</p><p className="font-bold">{v.toLocaleString()} votes - {t.total? ((v/t.total)*100).toFixed(1):0}%</p></div>)}{t.total===0 && <p className="text-[11px] text-gray-400">No data - submit via /admin</p>}</div></div>); })()}
      </div>
    </div>
  );
}
