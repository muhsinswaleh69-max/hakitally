'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const COUNTY_DATA: any = { "Lugari": {"Mautuma": ["Mautuma Primary 1","Mautuma Primary 2","Mukuyu Primary","Seregeya Primary","Mbagara Primary","Makina Primary","Mautuma Chief Office","PanPaper Primary","Lumama Primary","Lumakanda Primary"],"Lugari": ["Lugari Primary","Lugari Station Primary","Chekalini Primary","Hema Primary","Kivaywa Primary","Mufutu Primary","Lugari Sec","St Peters Lugari","Lugari Township Primary","Maturu Primary"]},"Mumias East": {"Lusheya/Lubinu": ["Shibale Primary","Lubinu Primary","Matawa Primary","Lubinu Sec","Lusheya Primary","Shibale Sec","Elwakana Primary","Makunga Primary Lubinu","Indangalasia Primary","Emakhwale Lubinu"],"Malaha/Isongo/Makunga": ["Malaha Primary","Isongo Primary","Makunga Primary","Malaha Sec","Isongo Sec","Makunga Sec","Emasatsi Primary","Emakale Primary","Eshiakhulo Makunga","Mwitoti Primary"],"East Wanga": ["Mwitoti Primary","Musango Primary","Nyapora Primary","Khaimba Primary East","Mwitoti Sec","Elureko Primary","Namabhu Primary","Mumias Sugar East","Emukaya Primary","Eshikoye Primary"]} }

export default function Admin(){
  const [constituency,setConstituency]=useState('Mumias East'); const [ward,setWard]=useState(''); const [station,setStation]=useState('')
  const [votes,setVotes]=useState({barasa:0,malala:0,khalwale:0,muhanda:0})
  const [status,setStatus]=useState('🟢 Online - Connected to Main Server')
  const [queue,setQueue]=useState<any[]>([])

  useEffect(()=>{
    const q = JSON.parse(localStorage.getItem('hakitally_queue')||'[]'); setQueue(q)
    const updateStatus=()=>{ setStatus(navigator.onLine? `🟢 Online - ${q.length} pending sync` : `🔴 Offline - Saved locally, ${q.length} pending`) }
    window.addEventListener('online',updateStatus); window.addEventListener('offline',updateStatus); updateStatus()
    const interval = setInterval(async ()=>{
      const pending = JSON.parse(localStorage.getItem('hakitally_queue')||'[]')
      if(pending.length && navigator.onLine){
        for(const item of pending){
          const {error}=await supabase.from('results').insert([item])
          if(!error){ const newQ=pending.filter((x:any)=>x!==item); localStorage.setItem('hakitally_queue',JSON.stringify(newQ)); setQueue(newQ) }
        }
      }
    },3000)
    return ()=>clearInterval(interval)
  },[])

  const submit = async (e:any)=>{
    e.preventDefault()
    const payload = { constituency, ward, station_name: station, barasa_votes: votes.barasa, malala_votes: votes.malala, khalwale_votes: votes.khalwale, muhanda_votes: votes.muhanda, total_votes: votes.barasa+votes.malala+votes.khalwale+votes.muhanda }
    try{
      if(!navigator.onLine) throw new Error('offline')
      const {error}=await supabase.from('results').insert([payload]); if(error) throw error
      alert(`✅ Sent to Main Server instantly from ${constituency}!`)
    }catch{
      const newQ=[...queue,payload]; localStorage.setItem('hakitally_queue',JSON.stringify(newQ)); setQueue(newQ); alert(`📴 No network! Saved offline on this computer (${newQ.length} pending). Will auto-sync when network returns.`)
    }
    setStation(''); setVotes({barasa:0,malala:0,khalwale:0,muhanda:0})
  }

  const wards = Object.keys(COUNTY_DATA[constituency]||{})
  const stations = ward? COUNTY_DATA[constituency][ward]||[] : []

  return (
    <div style={{maxWidth:'520px',margin:'15px auto',padding:'16px',background:'white',borderRadius:'12px'}}>
      <div style={{padding:'10px',background: status.includes('Online')?'#dcfce7':'#fee2e2',borderRadius:'8px',fontSize:'12px',textAlign:'center',marginBottom:'10px'}}>{status} | Queue: {queue.length}</div>
      <h1 style={{fontWeight:'bold',fontSize:'16px'}}>CLERK ENTRY - Computer {String.fromCharCode(65+Math.floor(Math.random()*6))} - {constituency}</h1>
      <p style={{fontSize:'11px',color:'#666'}}>All computers A,B,C,D,E,F sync to same main server at Kakamega High School</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'10px'}}>
        <select value={constituency} onChange={e=>{setConstituency(e.target.value); setWard(''); setStation('')}} style={{padding:'14px',border:'2px solid #0a4a2a',borderRadius:'8px'}}>{Object.keys(COUNTY_DATA).map(c=><option key={c}>{c}</option>)}</select>
        <select required value={ward} onChange={e=>{setWard(e.target.value); setStation('')}} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">Select Ward</option>{wards.map((w:any)=><option key={w}>{w}</option>)}</select>
        <select required value={station} onChange={e=>setStation(e.target.value)} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">Select Station</option>{stations.map((s:any)=><option key={s}>{s}</option>)}</select>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <input type="number" placeholder="Barasa" value={votes.barasa||''} onChange={e=>setVotes({...votes,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" placeholder="Malala" value={votes.malala||''} onChange={e=>setVotes({...votes,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" placeholder="Khalwale" value={votes.khalwale||''} onChange={e=>setVotes({...votes,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" placeholder="Muhanda" value={votes.muhanda||''} onChange={e=>setVotes({...votes,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        </div>
        <button style={{padding:'16px',background:'#0a4a2a',color:'white',borderRadius:'10px',fontWeight:'bold'}}>Submit to Main Server ✓</button>
      </form>
      <div style={{marginTop:'12px',background:'#f3f4f6',padding:'10px',borderRadius:'8px',fontSize:'11px'}}>How multi-clerk works:<br/>• Computer A in Lugari, B in Mumias East, C in Matungu — all open same /admin link<br/>• Each submit = 0.2KB (very minimal data)<br/>• Offline? Saves in browser, auto-syncs when back online<br/>• Main tally screen updates instantly for all</div>
    </div>
  )
}
