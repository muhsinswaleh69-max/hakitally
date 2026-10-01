'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home(){
  const [tally, setTally] = useState<any[]>([])

  useEffect(()=>{
    const fetch = async ()=>{
      const { data } = await supabase.from('hakitally_results_34a').select('votes, hakitally_candidates(name, color)')
      // simple sum
      const sums: any = {}
      data?.forEach((r:any)=>{
        const name = r.hakitally_candidates.name
        sums[name] = (sums[name]||0)+r.votes
      })
      setTally(Object.entries(sums).map(([name, votes])=>({name, votes})))
    }
    fetch()
  },[])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-100 p-2 text-center text-xs">⚠️ DEMO - Not IEBC - Portfolio Project by Muhsin from Mumias</div>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-black">HakiTally 🇰🇪</h1>
        <p className="text-slate-500 mb-6">Live Tally - Transparent & Verifiable</p>

        <div className="grid grid-cols-2 gap-4">
          {tally.map((t:any)=>(
            <div key={t.name} className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-bold">{t.name}</h2>
              <p className="text-3xl font-black">{t.votes?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        {tally.length===0 && <p className="mt-10 text-slate-400">No results yet. Go to /admin to add Form 34A</p>}
      </div>
    </div>
  )
}
