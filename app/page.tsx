'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CONSTITUENCIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"]

export default function Home(){
  const [results,setResults]=useState<any[]>([])
  useEffect(()=>{
    const load = async ()=>{ const {data}=await supabase.from('results').select('*'); if(data) setResults(data) }
    load()
    // REALTIME: Listen for all computers A,B,C,D...
    const channel = supabase.channel('results-changes').on('postgres_changes',{event:'*',schema:'public',table:'results'},(payload)=>{
      if(payload.eventType==='INSERT') setResults(prev=>[payload.new,...prev])
    }).subscribe()
    return ()=>{ supabase.removeChannel(channel) }
  },[])

  const totals = {
    barasa: results.reduce((s,r)=>s+(r.barasa_votes||0),0),
    malala: results.reduce((s,r)=>s+(r.malala_votes||0),0),
    khalwale: results.reduce((s,r)=>s+(r.khalwale_votes||0),0),
    muhanda: results.reduce((s,r)=>s+(r.muhanda_votes||0),0),
  }
  const totalVotes = totals.barasa+totals.malala+totals.khalwale+totals.muhanda
  const reported = results.length
  const getPerc = (v:number)=> totalVotes? Math.round((v/totalVotes)*100) : 0
  const leader = Object.entries(totals).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0]

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'15px',fontFamily:'sans-serif',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{background:'#0a4a2a',color:'white',padding:'20px',borderRadius:'16px',textAlign:'center'}}>
        <h1 style={{fontSize:'28px',fontWeight:'bold',margin:0}}>HakiTally - KAKAMEGA COUNTY</h1>
        <p>Governor 2027 Live | Connected Clerks: LIVE</p>
        <h2>{reported} / 1200 Stations Reported ({Math.round(reported/1200*100)}%)</h2>
        <div style={{background:'rgba(255,255,255,0.3)',height:'14px',borderRadius:'10px'}}><div style={{width:`${(reported/1200)*100}%`,background:'#22c55e',height:'100%',borderRadius:'10px'}}></div></div>
        <p style={{fontSize:'12px',marginTop:'8px'}}>⚡ REALTIME — Auto-updates from Computers A,B,C,D,E,F | Leading: {leader?.toUpperCase()}</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'18px'}}>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #0a4a2a'}}><b>Fernandes Barasa (ODM)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.barasa.toLocaleString()}</span> {getPerc(totals.barasa)}% {leader==='barasa'?'👑':''}</div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #dc2626'}}><b>Cleophas Malala (DCP)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.malala.toLocaleString()}</span> {getPerc(totals.malala)}% {leader==='malala'?'👑':''}</div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #eab308'}}><b>Boni Khalwale (IND)</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.khalwale.toLocaleString()}</span> {getPerc(totals.khalwale)}%</div>
        <div style={{background:'white',padding:'14px',borderRadius:'12px',borderLeft:'6px solid #9333ea'}}><b>Elsie Muhanda</b><br/><span style={{fontSize:'26px',fontWeight:'bold'}}>{totals.muhanda.toLocaleString()}</span> {getPerc(totals.muhanda)}%</div>
      </div>
      <div style={{background:'white',padding:'15px',borderRadius:'12px',marginTop:'18px'}}>
        <h3>By Constituency - Live from All Clerks</h3>
        {CONSTITUENCIES.map(c=>{
          const cData = results.filter(r=>r.constituency===c)
          return <div key={c} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}><span><b>{c}</b></span><span style={{fontSize:'13px'}}>{cData.length} stns | {cData.reduce((s,r)=>s+(r.total_votes||0),0).toLocaleString()} votes</span></div>
        })}
      </div>
      <a href="/admin" style={{display:'block',textAlign:'center',background:'black',color:'white',padding:'16px',borderRadius:'12px',marginTop:'20px',textDecoration:'none'}}>Go to Clerk Entry (A,B,C,D) →</a>
    </div>
  )
}
