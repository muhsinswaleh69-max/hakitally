'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [stations, setStations] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: st } = await supabase.from('hakitally_stations').select('*')
      const { data: res } = await supabase.from('hakitally_results_34a').select('*')
      const { data: cand } = await supabase.from('hakitally_candidates').select('*')
      if(st) setStations(st)
      if(res) setResults(res)
      if(cand) setCandidates(cand)
    }
    load()
  }, [])

  const totalStations = stations.length
  const reported = new Set(results.map(r=>r.station_id)).size
  const progress = totalStations ? Math.round((reported/totalStations)*100) : 0

  const tally:any = {}
  results.forEach(r => {
    tally[r.candidate_id] = (tally[r.candidate_id]||0) + r.votes
  })

  return (
    <div style={{padding:20, maxWidth:800, margin:'0 auto'}}>
      <h1 style={{fontSize:28, fontWeight:'bold'}}>HakiTally - Mumias East</h1>
      <p>Live 34A Tally | {reported}/{totalStations} Stations ({progress}%)</p>
      <div style={{background:'#eee', height:20, borderRadius:10, margin:'15px 0'}}>
        <div style={{width:`${progress}%`, background:'green', height:20, borderRadius:10}}></div>
      </div>
      <h2 style={{marginTop:20, fontWeight:'bold'}}>Results:</h2>
      {candidates.map(c => (
        <div key={c.id} style={{border:'1px solid #ccc', padding:10, margin:'10px 0', borderRadius:8}}>
          <b>{c.name}</b> ({c.party}) - <b>{tally[c.id] || 0} votes</b>
        </div>
      ))}
      <a href="/admin" style={{display:'inline-block', marginTop:20, background:'black', color:'white', padding:'10px 20px', borderRadius:8}}>Go to Admin / Presiding Officer</a>
    </div>
  )
}
