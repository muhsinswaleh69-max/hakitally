"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POLLING CENTRES - Mumias East only, const only, NO export in page file
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

// ALL 12 KAKAMEGA SUB-COUNTIES + WARDS
const WARDS: Record<string, string[]> = {
  "Mumias East": ["East Wanga", "Lusheya/Lubinu", "Malaha/Isongo/Makunga"],
  "Mumias West": ["Mumias Central", "Mumias North", "Etenje", "Musanda"],
  "Matungu": ["Koyonzo", "Kholera", "Khalaba", "Mayoni", "Namamali"],
  "Butere": ["Marama West", "Marama Central", "Marama South", "Marama North", "Marama East"],
  "Khwisero": ["Kisa West", "Kisa East", "Kisa Central", "Kisa North"],
  "Shinyalu": ["Murhanda", "Isukha West", "Isukha East", "Isukha South", "Isukha Central", "Isukha North"],
  "Ikolomani": ["Idakho South", "Idakho East", "Idakho North", "Idakho Central"],
  "Lurambi": ["Butsotso East", "Butsotso South", "Butsotso Central", "Shieywe", "Mahiakalo", "Shirere"],
  "Navakholo": ["Bunyala West", "Bunyala East", "Bunyala Central", "Shinoyi-Shikomari-Esumeyia", "Ingotse-Matioli"],
  "Lugari": ["Mautuma", "Lugari", "Lumakanda", "Chekalini", "Chevaywa", "Lwandeti"],
  "Likuyani": ["Likuyani", "Sango", "Kongoni", "Nzoia", "Sinoko"],
  "Malava": ["West Kabras", "Chemuche", "East Kabras", "Butali/Chegulo", "Manda-Shivanga", "Shirugu-Mugai", "South Kabras"],
};
const SUBCOUNTIES = Object.keys(WARDS);
const RACES = ["Governor", "Senator", "Woman Rep", "MP", "MCA"];

// Total streams per sub-county - IEBC 2022 register
const TOTAL_STREAMS_BY_SUB: Record<string, number> = {
  "Mumias East": 95,
  "Mumias West": 118, "Matungu": 140, "Butere": 121, "Khwisero": 115,
  "Shinyalu": 148, "Ikolomani": 110, "Lurambi": 152, "Navakholo": 132,
  "Lugari": 176, "Likuyani": 112, "Malava": 198,
};

const PARTY_COLORS: Record<string, string> = {
  "ODM": "#f97316", "UDA": "#16a34a", "DCP": "#2563eb",
  "ANC": "#dc2626", "FORD": "#9333ea", "WIPER": "#0891b2",
};
function partyColor(name: string) {
  for (const p of Object.keys(PARTY_COLORS)) if (name.includes(p)) return PARTY_COLORS[p];
  return "#16a34a";
}
function normalize(s: any) {
  return String(s || "").toLowerCase().replace(/[^a-z]/g, "").trim();
}

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [tab, setTab] = useState("MCA");
  const [sub, setSub] = useState("Mumias East");
  const [wardFilter, setWardFilter] = useState("All Wards");

  const TOTAL_STREAMS = TOTAL_STREAMS_BY_SUB[sub] || 95;

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

  const isCountyRace = tab === "Governor" || tab === "Senator" || tab === "Woman Rep";
  const headerData = getTally(tab, isCountyRace ? undefined : sub, tab === "MCA" ? (wardFilter === "All Wards" ? undefined : wardFilter) : undefined);
  const leading: any = headerData.sorted[0];
  const pctReported = TOTAL_STREAMS ? ((headerData.stns / TOTAL_STREAMS) * 100).toFixed(1) : "0.0";
  const wardsToShow = tab === "MCA" ? (wardFilter === "All Wards" ? WARDS[sub] : [wardFilter]) : [WARDS[sub][0]];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#f0fdf4 0%,#ffffff 40%,#f8fafc 100%)", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", paddingBottom: 40 }}>
      {/* TOP BAR */}
      <div style={{ background: "#0f172a", color: "#fff", padding: "14px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "#16a34a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🗳️</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>HAKITALY</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Kakamega County • Live Tally • Form 34A</div>
            </div>
          </div>
          <div style={{ background: "#dc2626", padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%", display: "inline-block" }} /> LIVE
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* HERO CARD */}
        <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#14532d 60%,#16a34a 100%)", color: "#fff", borderRadius: 20, padding: 24, marginTop: 20, boxShadow: "0 12px 30px rgba(0,0,0,0.18)", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.8, fontWeight: 700 }}>{tab.toUpperCase()} • {sub.toUpperCase()}</div>
          <div style={{ fontSize: 42, fontWeight: 900, margin: "8px 0 4px", lineHeight: 1 }}>{headerData.stns} <span style={{ fontSize: 20, opacity: 0.7 }}>/ {TOTAL_STREAMS}</span></div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>stations reported • {pctReported}% counted</div>
          <div style={{ background: "rgba(255,255,255,0.2)", height: 10, borderRadius: 10, marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: `${pctReported}%`, background: "#facc15", height: 10, borderRadius: 10, transition: "width 0.5s" }} />
          </div>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.12)", padding: "10px 14px", borderRadius: 12, fontSize: 14 }}>
            {leading ? <>🏆 Leading: <b>{leading[0]}</b> — <b>{leading[1].toLocaleString()} votes</b></> : "No results yet for this race — waiting for first 34A"}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ background: "#fff", color: "#111", padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sub === "Mumias East" ? "52 Polling Centres" : `${WARDS[sub].length} Wards`}</span>
            <span style={{ background: "#fff", color: "#111", padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{TOTAL_STREAMS} Streams</span>
            <span style={{ background: "#facc15", color: "#111", padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{headerData.total.toLocaleString()} Votes Counted</span>
          </div>
        </div>

        {/* RACE TABS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", margin: "20px 0 12px" }}>
          {RACES.map((r) => (
            <button key={r} onClick={() => setTab(r)} style={{ padding: "10px 18px", borderRadius: 30, background: tab === r ? "#16a34a" : "#fff", color: tab === r ? "#fff" : "#334155", border: tab === r ? "none" : "1px solid #e2e8f0", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: tab === r ? "0 6px 16px rgba(22,163,74,0.35)" : "0 2px 6px rgba(0,0,0,0.05)" }}>{r}</button>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <select value={sub} onChange={(e) => { setSub(e.target.value); setWardFilter("All Wards"); }} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700 }}>
            {SUBCOUNTIES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700 }}>
            <option>All Wards</option>
            {WARDS[sub].map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>

        {/* RESULT CARDS */}
        {wardsToShow.map((w) => {
          const d = getTally(tab, isCountyRace ? undefined : sub, tab === "MCA" ? w : undefined);
          const wardLeader: any = d.sorted[0];
          const centresCount = POLLING_CENTRES[w]?.length || 0;
          return (
            <div key={w} style={{ background: "#fff", borderRadius: 20, padding: 20, marginTop: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 800, letterSpacing: 1 }}>{tab.toUpperCase()} RACE</div>
                  <h3 style={{ margin: "4px 0 2px", fontSize: 20 }}>{tab === "MCA" ? `${w} Ward` : sub}</h3>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{tab === "MCA" ? (centresCount ? `${centresCount} IEBC centres in this ward` : "IEBC centres coming soon") : "Kakamega County"}</div>
                </div>
                <div style={{ background: "#f0fdf4", color: "#15803d", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>{d.stns} stns • {d.total.toLocaleString()} votes</div>
              </div>

              {d.sorted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                  <div style={{ fontSize: 32 }}>📭</div>
                  <div style={{ marginTop: 8 }}>No results yet — waiting for first 34A from this ward</div>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {d.sorted.map(([name, votes]: any, idx: number) => {
                    const pct = d.total ? ((votes / d.total) * 100).toFixed(1) : "0.0";
                    const color = partyColor(String(name));
                    return (
                      <div key={name} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 28, height: 28, borderRadius: "50%", background: idx === 0 ? "#facc15" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>{idx + 1}</span>
                            <b style={{ fontSize: 15 }}>{name}</b>
                            {idx === 0 && <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 800 }}>LEADING</span>}
                          </div>
                          <div style={{ textAlign: "right" }}><b>{Number(votes).toLocaleString()}</b> <span style={{ color: "#64748b", fontSize: 13 }}>• {pct}%</span></div>
                        </div>
                        <div style={{ background: "#f1f5f9", height: 12, borderRadius: 10, marginTop: 8, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, background: color, height: 12, borderRadius: 10 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                <span>Total counted: {d.total.toLocaleString()} votes</span>
                {wardLeader && <span>Leader: {wardLeader[0]}</span>}
              </div>
            </div>
          );
        })}

        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 24 }}>HAKITALY • Source: IEBC Form 34A • Kakamega County: 12 Sub-Counties • Updates every 15s</p>
      </div>
    </div>
  );
}
