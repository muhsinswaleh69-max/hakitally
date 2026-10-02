'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

//... KEEP YOUR SAME COUNTY_DATA HERE... (same as you pasted)

export default function Admin(){
  const [constituency,setConstituency]=useState('Mumias East')
  const [ward,setWard]=useState('Lusheya/Lubinu')
  const [station,setStation]=useState('')
  const [votes,setVotes]=useState({barasa:0,malala:0,khalwale:0,muhanda:0})
  const [lockedStations,setLockedStations]=useState<Set<string>>(new Set())
  const [loading,setLoading]=useState(false)
  const [photo,setPhoto]=useState<File|null>(null)
  const [tally,setTally]=useState<any>({barasa:0,malala:0,stations:0})
  const [logs,setLogs]=useState<any[]>([])

  const refreshAll = async ()=>{
    const {data:res}=await supabase.from('hakitally_results_34a').select('constituency,ward,station_name,barasa_votes,malala_votes')
    if(res){
      setLockedStations(new Set(res.map((r:any)=> `${r.constituency}|${r.ward}|${r.station_name}`)) as any)
      const filt = res.filter((r:any)=> r.constituency==='Mumias East')
      setTally({ barasa: filt.reduce((a:any,b:any)=>a+(b.barasa_votes||0),0), malala: filt.reduce((a:any,b:any)=>a+(b.malala_votes||0),0), stations: filt.length })
    }
    const {data:logsData}=await supabase.from('audit_logs').select('*').order('submitted_at',{ascending:false}).limit(10)
    if(logsData) setLogs(logsData)
  }

  useEffect(()=>{
    refreshAll()
    const poll = setInterval(refreshAll, 5000)
    const channel = supabase.channel('all-watcher').on('postgres_changes',{event:'*',schema:'public',table:'hakitally_results_34a'},()=>refreshAll()).subscribe()
    return ()=>{ clearInterval(poll); supabase.removeChannel(channel) }
  },[])

  const submit = async (e:any)=>{
    e.preventDefault()
    if(!photo){ alert('📸 Please take/upload Form 34A photo - REQUIRED for verification!'); return }
    const key = `${constituency}|${ward}|${station}`
    if(lockedStations.has(key)){ alert(`🔒 ${station} already locked on main server`); return }
    setLoading(true)
    try{
      const fileName = `${constituency}_${ward}_${station}_${Date.now()}.jpg`
      const {error:upErr}=await supabase.storage.from('forms').upload(fileName, photo)
      if(upErr) throw upErr
      const {data:{publicUrl}}=supabase.storage.from('forms').getPublicUrl(fileName)

      const payload = { constituency, ward, station_name: station, barasa_votes: votes.barasa, malala_votes: votes.malala, khalwale_votes: votes.khalwale, muhanda_votes: votes.muhanda, total_votes: votes.barasa+votes.malala+votes.khalwale+votes.muhanda, form_url: publicUrl }
      const {error}:any=await supabase.from('hakitally_results_34a').insert([payload])
      if(error) throw error

      await supabase.from('audit_logs').insert([{ constituency, ward, station_name: station, barasa_votes: votes.barasa, malala_votes: votes.malala, device_info: navigator.userAgent.slice(0,100), form_photo_url: publicUrl }])

      alert(`✅ Verified & Locked! ${station} with Form 34A photo.`)
      refreshAll()
    }catch(err:any){
      if(err.code==='23505') alert(`🔒 Blocked: ${station} already exists on main server!`)
      else alert(`Error: ${err.message}`)
    }
    setLoading(false); setStation(''); setPhoto(null); setVotes({barasa:0,malala:0,khalwale:0,muhanda:0})
  }

  const wards = constituency? Object.keys(COUNTY_DATA[constituency]||{}) : []
  const stations = constituency && ward? (COUNTY_DATA[constituency][ward]||[]) : []
  const isLocked =!!station && lockedStations.has(`${constituency}|${ward}|${station}`)

  return (
    <div style={{maxWidth:'600px',margin:'10px auto',padding:'16px',background:'white',borderRadius:'14px',fontFamily:'sans-serif'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'12px'}}>
        <div style={{background:'#f0fdf4',padding:'10px',borderRadius:'8px',textAlign:'center',border:'1px solid #16a34a'}}><div style={{fontSize:'11px'}}>Stations</div><div style={{fontWeight:'bold',fontSize:'20px'}}>{tally.stations}/45</div><div style={{fontSize:'10px'}}>Mumias East</div></div>
        <div style={{background:'#fef2f2',padding:'10px',borderRadius:'8px',textAlign:'center',border:'1px solid #dc2626'}}><div style={{fontSize:'11px'}}>Barasa ODM</div><div style={{fontWeight:'bold',fontSize:'20px',color:'#dc2626'}}>{tally.barasa}</div></div>
        <div style={{background:'#eff6ff',padding:'10px',borderRadius:'8px',textAlign:'center',border:'1px solid #2563eb'}}><div style={{fontSize:'11px'}}>Malala DCP</div><div style={{fontWeight:'bold',fontSize:'20px',color:'#2563eb'}}>{tally.malala}</div></div>
      </div>
      <div style={{padding:'8px',background:'#dcfce7',borderRadius:'8px',fontSize:'11px',textAlign:'center',marginBottom:'12px'}}>🟢 Live Tally + Photo Verification + Audit | Locked: {lockedStations.size}</div>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        <select required value={constituency} onChange={e=>{setConstituency(e.target.value); setWard(''); setStation('')}} style={{padding:'14px',border:'2px solid #0a4a2a',borderRadius:'8px'}}>{Object.keys(COUNTY_DATA).map(c=><option key={c} value={c}>{c}</option>)}</select>
        <select required value={ward} onChange={e=>{setWard(e.target.value); setStation('')}} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">-- Select Ward --</option>{wards.map((w:any)=><option key={w} value={w}>{w}</option>)}</select>
        <select required value={station} onChange={e=>setStation(e.target.value)} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">-- Select Station --</option>{stations.map((s:any)=>{ const locked = lockedStations.has(`${constituency}|${ward}|${s}`); return <option key={s} value={s} disabled={locked}>{locked? `🔒 ${s} - LOCKED` : `📍 ${s}`}</option>})}</select>
        <div style={{border:'2px dashed #0a4a2a',padding:'12px',borderRadius:'8px',background:'#f9fafb'}}>
          <label style={{fontWeight:'bold',fontSize:'13px'}}>📸 VERIFICATION - Form 34A Photo (REQUIRED)</label>
          <input required type="file" accept="image/*" capture="environment" onChange={e=>setPhoto(e.target.files?.[0]||null)} style={{width:'100%',marginTop:'8px'}}/>
          {photo && <div style={{fontSize:'11px',color:'green',marginTop:'4px'}}>✅ {photo.name} ready</div>}
        </div>
        {isLocked && <div style={{background:'#fee2e2',padding:'10px',borderRadius:'8px',color:'#dc2626',fontWeight:'bold',textAlign:'center'}}>🔒 BLOCKED - Already submitted</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <input required type="number" min="0" placeholder="Barasa ODM" value={votes.barasa||''} onChange={e=>setVotes({...votes,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input required type="number" min="0" placeholder="Malala DCP" value={votes.malala||''} onChange={e=>setVotes({...votes,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Khalwale" value={votes.khalwale||''} onChange={e=>setVotes({...votes,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Muhanda" value={votes.muhanda||''} onChange={e=>setVotes({...votes,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        </div>
        <button disabled={loading || isLocked ||!photo} style={{padding:'16px',background: isLocked ||!photo? '#9ca3af' : '#0a4a2a',color:'white',borderRadius:'10px',fontWeight:'bold',fontSize:'16px'}}>{isLocked? '🔒 LOCKED' :!photo? '📸 ADD FORM 34A PHOTO FIRST' : loading? 'Uploading...' : '✅ Submit with Photo Proof & Lock'}</button>
      </form>
      <div style={{marginTop:'16px',borderTop:'1px solid #eee',paddingTop:'10px'}}>
        <h3 style={{fontSize:'13px',fontWeight:'bold',margin:'0 0 8px 0'}}>📋 Audit Log - Last 10 Submissions</h3>
        <div style={{maxHeight:'200px',overflowY:'auto',fontSize:'11px'}}>
          {logs.length===0? <div style={{color:'#999'}}>No submissions yet</div> : logs.map((l:any)=><div key={l.id} style={{padding:'6px',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between'}}><span>{new Date(l.submitted_at).toLocaleTimeString()} - {l.station_name} - B:{l.barasa_votes} M:{l.malala_votes}</span><a href={l.form_photo_url} target="_blank" style={{color:'blue'}}>📸 View Form</a></div>)}
        </div>
      </div>
      <div style={{marginTop:'10px',fontSize:'10px',color:'#999',textAlign:'center'}}>Build: v18-fixed-table-name - Connected to hakitally_results_34a</div>
    </div>
  )
}
