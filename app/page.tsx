"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POLLING CENTRES - const only, NO export in a page file
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

const WARDS: Record<string, string[]> = {
  "Mumias East": ["East Wanga", "Lusheya/Lubinu", "Malaha/Isongo/Makunga"],
};
const RACES = ["Governor", "Senator", "Woman Rep", "MP", "MCA"];
const TOTAL_STREAMS = 95;

function normalize(s: any) {
  return String(s || "").toLowerCase().replace(/[^a-z]/g, "").trim();
}

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [tab, setTab] = useState("MP");
  const [sub, setSub] = useState("Mumias East");
  const [wardFilter, setWardFilter] = useState("All Wards");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("hakitally_results_34a").select("*").order("created_at", { ascending: false });
      setResults(data || []);
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  function getTally(race: string, sc?: string, wd?: string) {
    let rows = results.filter((r: any) => normalize(r.race) === normalize(race));
    if (sc) rows = rows.filter((r: any) => normalize(r.constituency) === normalize(sc));
    if (wd && wd !== "All Wards") {
      rows = rows.filter((r: any) => {
        const saved = normalize(r.ward);
        const wanted = normalize(wd);
        return saved === wanted || saved.includes(wanted) || wanted.includes(saved);
      });
    }
    const tally: any = {};
    rows.forEach((r: any) => {
      Object.entries(r.extra_votes || {}).forEach(([k, v]: any) => {
        tally[k] = (tally[k] || 0) + (Number(v) || 0);
      });
    });
    const total = (Object.values(tally).reduce((a: any, b: any) => a + b, 0) as number) || 0;
    const sorted = Object.entries(tally).sort((a: any, b: any) => (b[1] as number) - (a[1] as number));
    const stns = new Set(rows.map((r: any) => r.station_name)).size;
    return { tally, total, sorted, stns };
  }

  const headerData = getTally(tab, tab === "Governor" || tab === "Senator" || tab === "Woman Rep" ? undefined : sub, tab === "MCA" ? (wardFilter === "All Wards" ? undefined : wardFilter) : undefined);
  const leading: any = headerData.sorted[0];

  const wardsToShow = wardFilter === "All Wards" ? WARDS[sub] : [wardFilter];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>HAKITALY — Mumias East Live Tally</h1>
      <div style={{ textAlign: "center", background: "#111", color: "#fff", padding: 16, borderRadius: 12 }}>
        <div style={{ fontSize: 32, fontWeight: 800 }}>{headerData.stns} / {TOTAL_STREAMS} stations reported</div>
        <div>{leading ? `Leading: ${leading[0]} — ${leading[1]} votes` : "No results yet for this race"}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", margin: "16px 0" }}>
        {RACES.map((r) => (
          <button key={r} onClick={() => setTab(r)} style={{ padding: "8px 14px", borderRadius: 20, background: tab === r ? "#16a34a" : "#eee", color: tab === r ? "#fff" : "#000", border: "none", fontWeight: 700 }}>{r}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <select value={sub} onChange={(e) => { setSub(e.target.value); setWardFilter("All Wards"); }} style={{ padding: 10, borderRadius: 8 }}>
          <option>Mumias East</option>
        </select>
        <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} style={{ padding: 10, borderRadius: 8 }}>
          <option>All Wards</option>
          {WARDS[sub].map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>

      {wardsToShow.map((w) => {
        const d = getTally(tab, tab === "Governor" || tab === "Senator" || tab === "Woman Rep" ? undefined : sub, tab === "MCA" ? w : undefined);
        // For MP/Governor etc, ward breakdown is not used, show once
        if (tab !== "MCA" && w !== wardsToShow[0]) return null;
        return (
          <div key={w} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 16 }}>
            <h3>{tab === "MCA" ? `${w} Ward` : `${sub}`} — {tab} Race — {d.stns} stns reported</h3>
            {d.sorted.length === 0 && <p>No results yet.</p>}
            {d.sorted.map(([name, votes]: any) => {
              const pct = d.total ? ((votes / d.total) * 100).toFixed(1) : "0.0";
              return (
                <div key={name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><b>{name}</b><span>{votes} votes — {pct}%</span></div>
                  <div style={{ background: "#eee", height: 12, borderRadius: 6 }}><div style={{ width: `${pct}%`, background: "#16a34a", height: 12, borderRadius: 6 }} /></div>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: "#666" }}>Total counted: {d.total} votes • Centres in this ward: {tab === "MCA" ? POLLING_CENTRES[w]?.length : "—"}</div>
          </div>
        );
      })}
      <p style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 20 }}>Source: Form 34A • IEBC Polling Centres Mumias East: 52 centres, 95 streams</p>
    </div>
  );
}
