export default function Home(){
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-100 border-b border-amber-300 p-3 text-center text-sm">
        ⚠️ DEMO / PORTFOLIO PROJECT - Not affiliated with IEBC. Built to demonstrate transparent tally system.
      </div>
      <header className="p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-black">HakiTally</h1>
        <p className="text-slate-600">Open, Verifiable, Real-time Election Tally Demo • 46,229 Stations Concept</p>
      </header>
      {/* Add your Recharts bar chart here pulling from public_tally */}
      {/* Add county filter, station list */}
    </div>
  )
}
