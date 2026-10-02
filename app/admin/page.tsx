"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, key);

export default function Admin(){
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("Emakwale Lubinu");
  const [v1,setV1]=useState("2870");
  const [v2,setV2]=useState("123");
  const [v3,setV3]=useState("12");
  const [log,setLog]=useState("");

  const submit=async()=>{
    setLog(`Trying to save...\nURL: ${url?.slice(0,30)}...\nWard: ${ward} Station: ${station}`);
    try{
      const extra:any={
        "Sophia Manyasa (UDA)": parseInt(v1||"0"),
        "Timothy Wanzetse (ODM)": parseInt(v2||"0"),
        "Stanislaus Wanzetse (DCP)": parseInt(v3||"0")
      };
      console.log("extra",extra);
      const { data, error } = await supabase.from("hakitally_results_34a").insert([{
        constituency:"Mumias East", ward, station_name:station, extra_votes:extra, mca_votes: parseInt(v1||"0")+parseInt(v2||"0")+parseInt(v3||"0")
      }]).select();
      if(error){ setLog("SUPABASE ERROR: "+error.message); }
      else{ setLog(`✅ SAVED! Data: ${JSON.stringify(data)} - GO TO MAIN BOARD NOW - Sophia will show ${(parseInt(v1||"0")/(parseInt(v1||"0")+parseInt(v2||"0")+parseInt(v3||"0"))*100).toFixed(1)}% ELECTED`); }
    }catch(e:any){
      setLog("FAILED TO FETCH means: 1) Internet off at Kakamega High School 2) Supabase paused 3) RLS still on.\nDetails: "+e.message+"\nURL exists? "+!!url+"\nKey exists? "+!!key);
    }
  };

  return(
    <div className="max-w-[600px] mx-auto p-4">
      <p className="text-[11px]">Selected: {station} | Ward: {ward} | Race: MCA</p>
      <p className="text-[10px] text-gray-400">URL: {url? "OK" : "MISSING - Add in Vercel"} | Key: {key? "OK" : "MISSING"}</p>
      <input value={v1} onChange={e=>setV1(e.target.value)} type="number" className="w-full p-3 border-2 mt-3 bg-green-50 font-bold rounded-xl" placeholder="Sophia"/>
      <input value={v2} onChange={e=>setV2(e.target.value)} type="number" className="w-full p-3 border-2 mt-2 bg-orange-50 font-bold rounded-xl" placeholder="Timothy"/>
      <input value={v3} onChange={e=>setV3(e.target.value)} type="number" className="w-full p-3 border-2 mt-2 bg-purple-50 font-bold rounded-xl" placeholder="Stanislaus"/>
      <button onClick={submit} className="w-full bg-blue-500 text-white font-black p-4 rounded-full mt-4">Submit MCA to Main Server ✓</button>
      <pre className="bg-black text-green-400 p-3 mt-4 text-xs whitespace-pre-wrap rounded-xl">{log}</pre>
    </div>
  );
}
