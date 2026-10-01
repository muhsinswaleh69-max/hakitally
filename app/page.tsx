'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home(){
  const [results,setResults]=useState<any[]>([])
  useEffect(()=>{ supabase.from('results').select('*').then(({data})=>{ if(data) setResults(data) }) },[])
  const total = 50
  const reported = results.length
  const percent = total > 0 ? Math.round((reported/total)*100) : 0
  return (
    <div style={{maxWidth:'800px',margin:'20px auto',padding:'20px',background:'white',borderRadius:'10px'}}>
      <h1 style={{fontSize:'28px',fontWeight:'bold'}}>HakiTally - Mumias East</h1>
      <p>Live 34A Tally | {reported}/{total} Stations ({percent}%)</p>
      <div style={{background:'#ddd',height:'20px',borderRadius:'10px',margin:'15px 0'}}>
        <div style={{width:`${percent}%`,background:'#0a4a2a',height:'100%',borderRadius:'10px'}}></div>
      </div>
      <h3>Results:</h3>
      {results.map((r:any,i:number)=><div key={i} style={{border:'1px solid #eee',padding:'10px',margin:'5px 0'}}><b>{r.station_name}</b> - Total: {r.total_votes}</div>)}
      <br/><a href="/admin" style={{background:'black',color:'white',padding:'12px',borderRadius:'8px',textDecoration:'none'}}>Go to Admin / Presiding Officer</a>
    </div>
  )
}
