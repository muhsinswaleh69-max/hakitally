'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [stations, setStations] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [stationId, setStationId] = useState('')
  const [votes, setVotes] = useState<any>({})

  useEffect(() => {
    supabase.from('hakitally_stations').select('*').then(({data})=> data && setStations(data))
    supabase.from('hakitally_candidates').select('*').then(({data})=> data && setCandidates(data))
  }, [])

  const submit = async () => {
    for (const cand of candidates) {
      const v = parseInt(votes[cand.id] || '0')
      await supabase.from('hakitally_results_34a').upsert({
        station_id: stationId,
        candidate_id: cand.id,
        votes: v
      }, { onConflict: 'station_id,candidate_id' })
    }
    alert('Results saved! Go to homepage to see tally.')
  }

  return (
    <div style={{padding:20, maxWidth:600, margin:'0 auto'}}>
      <h1>Presiding Officer - Enter 34A</h1>
      <select value={stationId} onChange={e=>setStationId(e.target.value)} style={{width:'100%', padding:10, margin:'10px 0'}}>
        <option value="">Select Station</option>
        {stations.map(s=><option key={s.id} value={s.id}>{s.code} - {s.name} - Reg: {s.registered_voters}</option>)}
      </select>
      {candidates.map(c=>(
        <div key={c.id} style={{margin:'10px 0'}}>
          <label>{c.name} votes:</label>
          <input type="number" style={{width:'100%', padding:10, border:'1px solid #ccc'}} 
          value={votes[c.id]||''} onChange={e=>setVotes({...votes, [c.id]: e.target.value})} />
        </div>
      ))}
      <button onClick={submit} style={{width:'100%', padding:12, background:'green', color:'white', borderRadius:8, marginTop:10}}>Submit 34A Results</button>
      <a href="/" style={{display:'block', marginTop:15}}>← Back to Public Tally</a>
    </div>
  )
}
