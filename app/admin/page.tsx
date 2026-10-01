'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin(){
  const [stations, setStations] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [stationId, setStationId] = useState('')
  const [votes, setVotes] = useState<{[key:string]:number}>({})

  useEffect(()=>{
    supabase.from('hakitally_stations').select('*').then(({data})=>setStations(data||[]))
    supabase.from('hakitally_candidates').select('*').then(({data})=>setCandidates(data||[]))
  },[])

  const submit = async ()=>{
    for(const cand of candidates){
      await supabase.from('hakitally_results_34a').insert({
        station_id: stationId,
        candidate_id: cand.id,
        votes: votes[cand.id]||0
      })
    }
    alert('34A Saved! Check home page')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Enter Form 34A</h1>
      <select className="w-full border p-3 rounded-xl mb-4" onChange={e=>setStationId(e.target.value)}>
        <option>Select Polling Station</option>
        {stations.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name} ({s.county})</option>)}
      </select>

      {candidates.map(c=>(
        <div key={c.id} className="flex justify-between items-center mb-3 bg-white p-3 rounded-xl">
          <span>{c.name}</span>
          <input type="number" className="border p-2 w-24 rounded-lg"
            onChange={e=>setVotes({...votes, [c.id]: parseInt(e.target.value)})} placeholder="Votes" />
        </div>
      ))}

      <button onClick={submit} className="w-full bg-black text-white p-3 rounded-xl mt-4">Submit Tally</button>

      <div className="mt-8 p-4 bg-slate-100 rounded-xl">
        <p className="text-xs">To add stations quickly, run in Supabase SQL:</p>
        <code className="text-xs">insert into hakitally_stations (code, name, county, constituency, registered_voters) values ('001/001', 'Mumias Primary', 'Kakamega', 'Mumias West', 500);</code>
      </div>
    </div>
  )
}
