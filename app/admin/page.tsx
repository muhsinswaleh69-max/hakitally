"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const POLLING_CENTRES: Record<string, string[]> = {
  "East Wanga": [
    "MUKAMBI PRIMARY SCHOOL","MUNG'ANG'A PRIMARY SCHOOL","BUMINI PRIMARY",
    "MWITOTI PRIMARY SCHOOL","RISE AND SHINE PRY SCHOOL FOR DISABLED",
    "KHAUNGA PRIMARY SCHOOL","MAHOLA PRIMARY SCHOOL","KHABAKAYA PRIMARY SCHOOL",
    "ELUCHE PRIMARY SCHOOL","KHABONDI PRIMARY SCHOOL","EBUBERE PRIMARY SCHOOL",
    "MUNGABIRA PRIMARY SCHOOL","MALAHA MARKET","BUMINI SECONDARY",
    "MUNG'ANG'A HEALTH CENTRE","BOOKER ACADEMY PRIMARY",
  ],
  "Lusheya/Lubinu": [
    "LUBINU PRIMARY SCHOOL","LUSHEYA PRIMARY SCHOOL","INDANGALASIA PRIMARY SCHOOL",
    "KAMASHIA PRIMARY SCHOOL","EKERO PRIMARY SCHOOL","SHIANDA PRIMARY SCHOOL",
    "SHIANDA POLYTECHNIC","KHAIMBA PRIMARY SCHOOL","MUMIAS MUSLIM PRIMARY SCHOOL",
    "EMUSOMA PRIMARY SCHOOL","BUKOYWA PRIMARY SCHOOL","LUBINU SECONDARY SCHOOL",
    "SHIANDA SECONDARY SCHOOL","EKERO SECONDARY SCHOOL","LUSHEYA SECONDARY SCHOOL",
    "BUKOLE PRIMARY SCHOOL","MABOLE PRIMARY SCHOOL",
  ],
  "Malaha/Isongo/Makunga": [
    "MALAHA PRIMARY SCHOOL","ISONGO PRIMARY SCHOOL","MAKUNGA PRIMARY SCHOOL",
    "SHISENYE PRIMARY SCHOOL","MURONI PRIMARY SCHOOL","EMUTETEMO PRIMARY SCHOOL",
    "MARABA SECONDARY SCHOOL","MARABA PRIMARY SCHOOL","EPANJA PRIMARY SCHOOL",
    "PETROS PRIMARY SCHOOL","ISANGO PRIMARY SCHOOL","BUMWENDE PRIMARY SCHOOL",
    "EMABANGA PRIMARY SCHOOL","ESHISENYE PRIMARY SCHOOL","KHUNGOYOKOSI MUSLIM PRIMARY SCHOOL",
    "MALAHA SECONDARY SCHOOL","MAKUNGA SECONDARY SCHOOL","ISONGO SECONDARY SCHOOL",
    "MALAHA YOUTH POLYTECHNIC",
  ],
};

const WARDS = ["East Wanga", "Lusheya/Lubinu", "Malaha/Isongo/Makunga"];

function candidatesFor(race: string, ward: string) {
  const short = ward.split("/")[0].substring(0, 6);
  if (race === "MCA") return [`MCA ${short} A (ODM)`, `MCA ${short} B (UDA)`, `MCA ${short} C (DCP)`];
  if (race === "MP") return ["Peter Nabulindo", "Benjamin Washiali", "David Were"];
  if (race === "Governor") return ["Governor A (ODM)", "Governor B (UDA)", "Governor C (DCP)"];
  if (race === "Senator") return ["Senator A (ODM)", "Senator B (UDA)", "Senator C (DCP)"];
  if (race === "Woman Rep") return ["Woman Rep A (ODM)", "Woman Rep B (UDA)", "Woman Rep C (DCP)"];
  return [];
}

export default function Admin() {
  const [race, setRace] = useState("MCA");
  const [ward, setWard] = useState("Lusheya/Lubinu");
  const [centre, setCentre] = useState("");
  const [stream, setStream] = useState("1");
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const cands = candidatesFor(race, ward);

  const save = async () => {
    if (!centre) { setMsg("Select Polling Centre first"); return; }
    const extra: any = {};
    cands.forEach((c) => { extra[c] = Number(votes[c] || 0); });
    const station_name = `${centre} - Stream ${stream}`;
    const { error } = await supabase.from("hakitally_results_34a").insert([{
      race, constituency: "Mumias East", ward,
      station_name, extra_votes: extra,
    }]);
    if (error) setMsg("Error: " + error.message);
    else { setMsg("Saved! " + station_name); setVotes({}); setCentre(""); }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Admin — Enter 34A</h1>
      <label>Race</label>
      <select value={race} onChange={(e) => { setRace(e.target.value); setVotes({}); }} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10 }}>
        {["Governor","Senator","Woman Rep","MP","MCA"].map((r) => <option key={r}>{r}</option>)}
      </select>
      <label>Ward</label>
      <select value={ward} onChange={(e) => { setWard(e.target.value); setCentre(""); setVotes({}); }} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10 }}>
        {WARDS.map((w) => <option key={w}>{w}</option>)}
      </select>
      <label>Polling Centre (IEBC) — {POLLING_CENTRES[ward].length} centres in this ward</label>
      <select value={centre} onChange={(e) => setCentre(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 10 }}>
        <option value="">-- Select Polling Centre --</option>
        {POLLING_CENTRES[ward].map((c) => <option key={c}>{c}</option>)}
      </select>
      <label>Stream</label>
      <select value={stream} onChange={(e) => setStream(e.target.value)} style={{ display: "block", width: "100%", padding: 10, marginBottom: 16 }}>
        <option>1</option><option>2</option><option>3</option><option>4</option>
      </select>
      {cands.map((c) => (
        <div key={c} style={{ marginBottom: 10 }}>
          <label>{c}</label>
          <input type="number" value={votes[c] || ""} onChange={(e) => setVotes({ ...votes, [c]: e.target.value })} style={{ display: "block", width: "100%", padding: 10 }} placeholder="Votes" />
        </div>
      ))}
      <button onClick={save} style={{ width: "100%", padding: 14, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800 }}>SAVE 34A</button>
      <p>{msg}</p>
      <p style={{ fontSize: 12, color: "#666" }}>Station will be saved as: {centre ? `${centre} - Stream ${stream}` : "—"}</p>
    </div>
  );
}
