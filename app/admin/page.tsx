"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// IEBC OFFICIAL 2022 - MUMIAS EAST - 49 STATIONS FIXED
const STATIONS_IEBC: Record<string, string[]> = {
  "Lusheya/Lubinu": [
    "EMAKHWALE PRIMARY SCHOOL",
    "LUBINU PRIMARY SCHOOL",
    "SHIBINGA WEST PRIMARY SCHOOL",
    "BUMWENDE PRIMARY SCHOOL",
    "SHITOTO PRIMARY SCHOOL",
    "INDANGALASIA PRIMARY SCHOOL",
    "EMACHINA PRIMARY SCHOOL",
    "EKERO MARKET CENTRE",
    "KAMASHIA PRIMARY SCHOOL",
    "EBWALIRO PRIMARY SCHOOL",
    "EBUBOLE PRIMARY",
    "MWICHINA PRIMARY SCHOOL",
    "SHIANDEREMA PRIMARY SCHOOL",
    "ESHIKUFU PRIMARY SCHOOL",
    "LUSHEYA HEALTH CENTRE",
    "EKERO PAG NURSERY SCHOOL",
    "ELWASAMBI PRIMARY SCHOOL",
  ],
  "East Wanga": [
    "KHAUNGA PRIMARY SCHOOL",
    "MAHOLA PRIMARY SCHOOL",
    "KHABONDI PRIMARY SCHOOL",
    "EBUBERE PRIMARY SCHOOL",
    "MUNG'ANG'A PRIMARY SCHOOL",
    "MUNGABIRA PRIMARY SCHOOL",
    "BUMINI PRIMARY",
    "MUKAMBI PRIMARY SCHOOL",
    "KHABAKAYA PRIMARY SCHOOL",
    "ELUCHE PRIMARY SCHOOL",
    "MWITOTI PRIMARY SCHOOL",
    "RISE AND SHINE PRY SCHOOL FOR DISABLED",
    "BUMINI SECONDARY",
    "MUNG'ANG'A HEALTH CENTRE",
    "MALAHA MARKET",
    "BOOKER ACADEMY PRIMARY",
  ],
  "Malaha/Isongo/Makunga": [
    "ISANGO PRIMARY SCHOOL",
    "MUTONO PRIMARY SCHOOL",
    "EMUTETEMO PRIMARY SCHOOL",
    "MALAHA PRIMARY SCHOOL",
    "EMUKHALARI PRIMARY SCHOOL",
    "SHISENYE PRIMARY SCHOOL",
    "MALAHA YOUTH POLYTECHNIC",
    "MAKUNGA HEALTH CENTRE",
    "MARABA SECONDARY SCHOOL",
    "MARABA PRIMARY SCHOOL",
    "MUSANGO PRIMARY SCHOOL",
    "MAKUNGA PRIMARY SCHOOL",
    "MURONI PRIMARY SCHOOL",
    "EPANJA PRIMARY SCHOOL",
    "MABANGA PRIMARY SCHOOL",
    "KHAIMBA PRIMARY SCHOOL",
  ],
};

const CANDIDATES = [
  "Sophia Manyasa (UDA)",
  "Timothy Wanzetse (ODM)",
  "Stanislaus Wanzetse (DCP)",
];

export default function AdminPage() {
  const [ward, setWard] = useState<string>("Lusheya/Lubinu");
  const [station, setStation] = useState<string>("EMAKHWALE PRIMARY SCHOOL");
  const [sophia, setSophia] = useState<string>("");
  const [timothy, setTimothy] = useState<string>("");
  const [stanislaus, setStanislaus] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string>("Ready to submit - Enter votes for MCA");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStations, setTotalStations] = useState<number>(0);
  const [recent, setRecent] = useState<any[]>([]);

  const loadStats = async () => {
    const { data } = await supabase.from("hakitally_results_34a").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) {
      setTotalStations(data.length);
      setRecent(data);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    setStation(STATIONS_IEBC[ward][0]);
  }, [ward]);

  const handleSubmit = async () => {
    if (!sophia &&!timothy &&!stanislaus) {
      setMsg("❌ Enter at least one vote");
      return;
    }
    setLoading(true);
    setMsg(`Saving ${station}...`);

    try {
      const extraVotes: Record<string, number> = {};
      extraVotes[CANDIDATES[0]] = parseInt(sophia || "0");
      extraVotes[CANDIDATES[1]] = parseInt(timothy || "0");
      extraVotes[CANDIDATES[2]] = parseInt(stanislaus || "0");

      const total = extraVotes[CANDIDATES[0]] + extraVotes[CANDIDATES[1]] + extraVotes[CANDIDATES[2]];

      const { error } = await supabase
       .from("hakitally_results_34a")
       .upsert(
          [
            {
              constituency: "Mumias East",
              ward: ward,
              station_name: station,
              extra_votes: extraVotes,
              mca_votes: total,
            },
          ],
          { onConflict: "station_name" }
        );

      if (error) {
        setMsg("❌ Error: " + error.message);
      } else {
        setMsg(`✅ SAVED! ${station} (${ward}) -> Sophia: ${sophia || 0}, Timothy: ${timothy || 0}, Stanislaus: ${stanislaus || 0} - Total stations now ${totalStations + 1} - MAIN BOARD LIVE!`);
        setSophia("");
        setTimothy("");
        setStanislaus("");
        setFile(null);
        loadStats();
      }
    } catch (e: any) {
      setMsg("❌ Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] p-3 md:p-6">
      <div className="max-w-[650px] mx-auto bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-5 md:p-7 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] text-gray-500 font-semibold tracking-wide">HakiTally Admin • Mumias East</p>
            <p className="text-[11px] text-gray-400 mt-1">All computers sync to same main server at Kakamega High School</p>
          </div>
          <div className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full border border-green-200">
            {totalStations} STATIONS LIVE
          </div>
        </div>

        <p className="text-[11px] mt-3 bg-gray-50 p-2 rounded-lg border">
          Selected: <b className="text-black">{station}</b> | Ward: <b className="text-black">{ward}</b> | Race: <b>MCA</b>
        </p>

        {/* Electoral Seat */}
        <label className="font-black mt-5 block text-[13px]">Electoral Seat</label>
        <select className="w-full p-3.5 border-2 rounded-xl bg-orange-50 font-bold mt-1.5 text-sm outline-none">
          <option>MCA - Member of County Assembly</option>
        </select>

        {/* Ward */}
        <label className="font-bold mt-5 block text-[13px]">Ward - Mumias East (IEBC Official)</label>
        <select
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          className="w-full p-3.5 border-2 rounded-xl font-bold mt-1.5 bg-white text-sm outline-none focus:border-black"
        >
          <option>East Wanga</option>
          <option>Lusheya/Lubinu</option>
          <option>Malaha/Isongo/Makunga</option>
        </select>

        {/* Station */}
        <label className="font-bold mt-5 block text-[13px]">Select Station - {ward} ({STATIONS_IEBC[ward].length} polling stations)</label>
        <select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          className="w-full p-3.5 border rounded-xl mt-1.5 bg-gray-50 font-semibold text-sm outline-none focus:border-black"
        >
          {STATIONS_IEBC[ward].map((s) => (
            <option key={s} value={s}>{s} - {ward}</option>
          ))}
        </select>

        {/* Votes */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="col-span-1">
            <label className="font-black text-[11px] text-green-700 tracking-wide">Sophia Manyasa (UDA)</label>
            <input
              type="number"
              inputMode="numeric"
              value={sophia}
              onChange={(e) => setSophia(e.target.value)}
              placeholder="0"
              className="w-full p-4 border-2 rounded-xl font-black mt-1.5 bg-green-50 text-[18px] outline-none focus:border-green-600 focus:bg-white transition"
            />
          </div>
          <div className="col-span-1">
            <label className="font-black text-[11px] text-orange-700 tracking-wide">Timothy Wanzetse (ODM)</label>
            <input
              type="number"
              inputMode="numeric"
              value={timothy}
              onChange={(e) => setTimothy(e.target.value)}
              placeholder="0"
              className="w-full p-4 border-2 rounded-xl font-black mt-1.5 bg-orange-50 text-[18px] outline-none focus:border-orange-600 focus:bg-white transition"
            />
          </div>
          <div className="col-span-2">
            <label className="font-black text-[11px] text-purple-700 tracking-wide">Stanislaus Wanzetse (DCP)</label>
            <input
              type="number"
              inputMode="numeric"
              value={stanislaus}
              onChange={(e) => setStanislaus(e.target.value)}
              placeholder="0"
              className="w-full p-4 border-2 rounded-xl font-black mt-1.5 bg-purple-50 text-[18px] outline-none focus:border-purple-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Form 35A */}
        <label className="text-[13px] mt-5 block font-bold">Form 35A Photo * (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1.5 text-sm w-full border rounded-xl p-2 bg-white"
        />
        {file && <p className="text-[11px] text-green-600 mt-1 font-bold">Selected: {file.name}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1a6fb5] hover:bg-[#155a93] disabled:bg-gray-400 text-white font-black p-4 rounded-full mt-7 text-[16px] shadow-lg transition"
        >
          {loading? "Saving to Main Server..." : "Submit MCA to Main Server ✓"}
        </button>

        {/* Message */}
        <div className={`border p-3.5 rounded-xl mt-4 text-[13px] font-bold leading-5 ${msg.includes("✅")? "bg-green-50 border-green-200 text-green-800" : msg.includes("❌")? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
          {msg}
        </div>

        {/* Live Stream */}
        <div className="mt-5 bg-[#fafafa] p-3.5 rounded-xl border text-[11px]">
          <p className="font-black text-[12px]">Live Main Stream:</p>
          <p className="mt-1 text-gray-600">Main link <b>/</b> - When you submit <b>{station}</b>, the bar for <b>{ward}</b> will update instantly. Highest votes gets GREEN badge ✓ ELECTED - WON</p>

          {recent.length > 0 && (
            <div className="mt-3">
              <p className="font-black text-[11px]">Last {recent.length} Submitted (Live):</p>
              <div className="mt-2 space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {recent.map((r: any) => (
                  <div key={r.station_name + r.created_at} className="flex justify-between bg-white p-2 rounded-lg border text-[10px]">
                    <span className="font-bold">{r.ward} - {r.station_name}</span>
                    <span>S:{r.extra_votes?.["Sophia Manyasa (UDA)"]?? 0} T:{r.extra_votes?.["Timothy Wanzetse (ODM)"]?? 0} St:{r.extra_votes?.["Stanislaus Wanzetse (DCP)"]?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-[10px] text-center text-gray-400 mt-5">HakiTally • Kakamega County • MCA Mumias East • IEBC Verified Stations</p>
      </div>
    </div>
  );
}
