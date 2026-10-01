'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CONSTITUENCIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"]

export default function Home(){
  const [results,setResults]=useState<any[]>([])
  useEffect(()=>{
    supabase.from('results').select('*').then(({data})=>{ if(data) setResults(data) })
  },[])
  
  const totals = {
    barasa: results.reduce((s,r)=>s+(r.barasa_votes||0),0),
    malala: results.reduce((s,r)=>s+(r.malala_votes||0),0),
    khalwale: results.reduce((s,r)=>s+(r.khalwale_votes||0),0),
    muhanda: results.reduce((s,r)=>s+(r.muhanda_votes||0),0),
  }
  const totalVotes = totals.barasa + totals.malala + totals.khalwale + totals.muhanda
  const reported = results.length
  const percent = Math.round((reported/1200)*100)

  const getPerc = (v:number)=> totalVotes ? Math.round((v/totalVotes)*100) : 0

  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'20px',fontFamily:'sans-serif',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{background:'#0a4a2a',color:'white',padding:'20px',borderRadius:'12px',textAlign:'center'}}>
        <h1 style={{fontSize:'32px',fontWeight:'bold',margin:0}}>HakiTally - KAKAMEGA COUNTY</h1>
        <p style={{margin:'5px 0',opacity:0.9}}>Governor 2027 Live Tally | Form 34A Parallel Count</p>
        <p style={{fontSize:'14px',marginTop:'10px'}}>{reported} / 1200 Stations Reported ({percent}%)</p>
        <div style={{background:'rgba(255,255,255,0.3)',height:'12px',borderRadius:'10px',marginTop:'10px'}}>
          <div style={{width:`${percent}%`,background:'white',height:'100%',borderRadius:'10px'}}></div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginTop:'20px'}}>
        <div style={{background:'white',padding:'15px',borderRadius:'10px',borderLeft:'5px solid #0a4a2a'}}>
          <b>Fernandes Barasa (ODM)</b><br/>
          <span style={{fontSize:'24px',fontWeight:'bold'}}>{totals.barasa.toLocaleString()}</span> - {getPerc(totals.barasa)}%
        </div>
        <div style={{background:'white',padding:'15px',borderRadius:'10px',borderLeft:'5px solid #dc2626'}}>
          <b>Cleophas Malala (DCP)</b><br/>
          <span style={{fontSize:'24px',fontWeight:'bold'}}>{totals.malala.toLocaleString()}</span> - {getPerc(totals.malala)}%
        </div>
        <div style={{background:'white',padding:'15px',borderRadius:'10px',borderLeft:'5px solid #eab308'}}>
          <b>Boni Khalwale (IND)</b><br/>
          <span style={{fontSize:'24px',fontWeight:'bold'}}>{totals.khalwale.toLocaleString()}</span> - {getPerc(totals.khalwale)}%
        </div>
        <div style={{background:'white',padding:'15px',borderRadius:'10px',borderLeft:'5px solid #9333ea'}}>
          <b>Elsie Muhanda (ODM)</b><br/>
          <span style={{fontSize:'24px',fontWeight:'bold'}}>{totals.muhanda.toLocaleString()}</span> - {getPerc(totals.muhanda)}%
        </div>
      </div>

      <div style={{background:'white',padding:'15px',borderRadius:'10px',marginTop:'20px'}}>
        <h3>By Constituency</h3>
        {CONSTITUENCIES.map(c=>{
          const cData = results.filter(r=>r.constituency===c)
          return <div key={c} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eee'}}>
            <span>{c}</span><span style={{color:'#666'}}>{cData.length} stations | Total: {cData.reduce((s,r)=>s+r.total_votes,0)}</span>
          </div>
        })}
      </div>

      <a href="/admin" style={{display:'block',textAlign:'center',background:'black',color:'white',padding:'15px',borderRadius:'10px',marginTop:'20px',textDecoration:'none'}}>Go to Presiding Officer Admin →</a>
    </div>
  )
}
