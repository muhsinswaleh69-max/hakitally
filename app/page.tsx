'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CONSTITUENCIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"]

export default function Home(){
  const [results,setResults]=useState<any[]>([])
  const [loading,setLoading]=useState(true)

  const load = async ()=>{
    const {data} = await supabase.from('results').select('*').order('created_at',{ascending:false})
    if(data) setResults(data)
    setLoading(false)
  }
  useEffect(()=>{ load(); const i=setInterval(load,5000); return ()=>clearInterval(i)},[])

  const totals = {
    barasa: results.reduce((s,r)=>s+(r.barasa_votes||0),0),
    malala: results.reduce((s,r)=>s+(r.malala_votes||0),0),
    khalwale: results.reduce((s,r)=>s+(r.khalwale_votes||0),0),
    muhanda: results.reduce((s,r)=>s+(r.muhanda_votes||0),0),
  }
  const totalVotes = totals.barasa + totals.malala + totals.khalwale + totals.muhanda
  const reported = results.length
  const getPerc = (v:number)=> totalVotes? Math.round((v/totalVotes)*100) : 0
  const leader = Object.entries(totals).sort((a,b)=>b[1]-a[1])[0]?.[0]

  if(loading) return <div style={{padding:'40px',textAlign:'center'}}>Loading Kakamega Tally...</div>

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'15px',fontFamily:'sans-serif',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{background:'#0a4a2a',color:'white',padding:'20px',borderRadius:'16px',textAlign:'center'}}>
        <h1 style={{fontSize:'28px',fontWeight:'bold',margin:0}}>HakiTally - KAKAMEGA COUNTY</h1>
        <p>Governor 2027 Live Tally | Form 34A Parallel Count</p>
        <h2 style={{margin:'15px 0 5px'}}>{reported} / 1200 Stations Reported ({Math.round(reported/1200*100)}%)</h2>
        <div style={{background:'rgba(255,255,255,0.3)',height:'14px',borderRadius:'10px'}}>
          <div style={{width:`${(reported/1200)*100}%`,background:'#22c55e',height:'100%',borderRadius:'10px',transition:'all 0.5s'}}></div>
        </div>
        <p style={{fontSize:'12px',marginTop:'8px',opacity:0.8}}>Auto-refreshes every 5 seconds | Leading: {leader?.toUpperCase()}</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'18px'}}>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:`6px solid ${leader==='barasa'?'#0a4a2a':'#ccc'}`,boxShadow: leader==='barasa'?'0 0 0 2px #0a4a2a':''}}>
          <b>Fernandes Barasa (ODM)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.barasa.toLocaleString()}</span> <span style={{color:'#0a4a2a',fontWeight:'bold'}}>{getPerc(totals.barasa)}%</span> {leader==='barasa' && '👑 LEADING'}
        </div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:`6px solid ${leader==='malala'?'#dc2626':'#ccc'}`,boxShadow: leader==='malala'?'0 0 0 2px #dc2626':''}}>
          <b>Cleophas Malala (DCP)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.malala.toLocaleString()}</span> <span style={{color:'#dc2626',fontWeight:'bold'}}>{getPerc(totals.malala)}%</span> {leader==='malala' && '👑 LEADING'}
        </div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #eab308'}}>
          <b>Boni Khalwale (IND)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.khalwale.toLocaleString()}</span> {getPerc(totals.khalwale)}%
        </div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #9333ea'}}>
          <b>Elsie Muhanda</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.muhanda.toLocaleString()}</span> {getPerc(totals.muhanda)}%
        </div>
      </div>

      <div style={{background:'white',padding:'15px',borderRadius:'12px',marginTop:'18px'}}>
        <h3 style={{margin:'0 0 10px'}}>By Constituency - Live</h3>
        {CONSTITUENCIES.map(c=>{
          const cData = results.filter(r=>r.constituency===c)
          const cTotal = cData.reduce((s,r)=>s+(r.total_votes||0),0)
          const cLeader = cData.length? Object.entries({
            Barasa: cData.reduce((s,r)=>s+r.barasa_votes,0),
            Malala: cData.reduce((s,r)=>s+r.malala_votes,0)
          }).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0] : '-'
          return <div key={c} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
            <span><b>{c}</b> - {cLeader} leading</span><span style={{color:'#666',fontSize:'13px'}}>{cData.length} stns | {cTotal.toLocaleString()} votes</span>
          </div>
        })}
      </div>

      <div style={{background:'white',padding:'15px',borderRadius:'12px',marginTop:'18px'}}>
        <h3>Latest 5 Stations</h3>
        {results.slice(0,5).map((r:any)=><div key={r.id} style={{padding:'8px 0',borderBottom:'1px solid #eee',fontSize:'13px'}}>{r.station_name} ({r.constituency}) - B:{r.barasa_votes} M:{r.malala_votes} K:{r.khalwale_votes}</div>)}
      </div>

      <a href="/admin" style={{display:'block',textAlign:'center',background:'black',color:'white',padding:'16px',borderRadius:'12px',marginTop:'20px',textDecoration:'none',fontWeight:'bold'}}>Go to Presiding Officer Entry →</a>
      <p style={{textAlign:'center',fontSize:'11px',color:'#999',marginTop:'15px'}}>Built in Mumias | Parallel Tally for Transparency</p>
    </div>
  )
}
