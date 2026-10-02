"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Admin() {
  const [ward,setWard]=useState("Lusheya/Lubinu");
  const [station,setStation]=useState("Emakwale Lubinu");
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [v3,setV3]=useState("");

  const click = async () => {
    alert(`CLICK WORKS! You clicked: ${station} - ${ward}\nSophia=${v1} Timothy=${v2} Stanislaus=${v3}\n\nNow saving to server...`);
    
    try {
      const extra = {
        "Sophia Manyasa (UDA)": parseInt(v1||"0"),
        "Timothy Wanzetse (ODM)": parseInt(v2||"0"),
        "Stanislaus Wanzetse (DCP)": parseInt(v3||"0")
      };
      const { error } = await supabase.from("hakitally_results_34a").insert([{
        constituency: "Mumias East", ward, station_name: station, extra_votes: extra, mca_votes: 0
      }]);
      if(error){ alert("SUPABASE ERROR: "+error.message+"\n\nFIX: Supabase > Table hakitally_results_34a > Disable RLS"); }
      else { alert("✅ SAVED TO MAIN SERVER! Go check main board now - it is LIVE"); setV1(""); setV2(""); setV3(""); }
    } catch(e:any){ alert("Error: "+e.message); }
  };

  return (
    <div style={{padding:20, maxWidth:500, margin:"auto", fontFamily:"sans-serif"}}>
      <h2>ADMIN TEST - CLICK MUST WORK</h2>
      <p style={{fontSize:11}}>Selected: {station} | Ward: {ward} | Race: MCA</p>
      
      <label><b>Ward</b></label><br/>
      <select value={ward} onChange={e=>setWard(e.target.value)} style={{width:"100%", padding:12, marginBottom:10}}>
        <option>East Wanga</option><option>Lusheya/Lubinu</option><option>Malaha/Isongo/Makunga</option>
      </select><br/>

      <label><b>Station</b></label><br/>
      <select value={station} onChange={e=>setStation(e.target.value)} style={{width:"100%", padding:12, marginBottom:10}}>
        <option>Emakwale Lubinu</option><option>Lubinu Primary S1</option><option>Shibale Primary S1</option><option>East Wanga DEB S1</option>
      </select><br/>

      <label style={{fontWeight:"900", color:"green"}}>Sophia Manyasa (UDA)</label><br/>
      <input type="number" value={v1} onChange={e=>setV1(e.target.value)} placeholder="Votes for Sophia" style={{width:"100%", padding:15, border:"2px solid green", borderRadius:10, marginBottom:10}}/><br/>

      <label style={{fontWeight:"900", color:"orange"}}>Timothy Wanzetse (ODM)</label><br/>
      <input type="number" value={v2} onChange={e=>setV2(e.target.value)} placeholder="Votes for Timothy" style={{width:"100%", padding:15, border:"2px solid orange", borderRadius:10, marginBottom:10}}/><br/>

      <label style={{fontWeight:"900", color:"purple"}}>Stanislaus Wanzetse (DCP)</label><br/>
      <input type="number" value={v3} onChange={e=>setV3(e.target.value)} placeholder="Votes for Stanislaus" style={{width:"100%", padding:15, border:"2px solid purple", borderRadius:10, marginBottom:10}}/><br/>

      <button onClick={click} style={{width:"100%", background:"#0a2e1f", color:"white", padding:20, borderRadius:30, fontWeight:"900", fontSize:18, marginTop:20}}>
        Submit MCA to Main Server ✓ - CLICK ME
      </button>
    </div>
  );
}
