'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const CONSTITUENCIES = ["Lugari","Likuyani","Malava","Lurambi","Navakholo","Mumias West","Mumias East","Matungu","Butere","Khwisero","Shinyalu","Ikolomani"]

export default function Admin(){
  const [form,setForm]=useState({constituency:'',ward:'',station:'',barasa:0,malala:0,khalwale:0,muhanda:0})
  const [loading,setLoading]=useState(false)

  const submit = async (e:any)=>{
    e.preventDefault()
    setLoading(true)
    const total = Number(form.barasa)+Number(form.malala)+Number(form.khalwale)+Number(form.muhanda)
    const {error} = await supabase.from('results').insert([{
      constituency:form.constituency, ward:form.ward, station_name:form.station,
      barasa_votes:form.barasa, malala_votes:form.malala, khalwale_votes:form.khalwale, muhanda_votes:form.muhanda,
      total_votes:total
    }])
    if(error) alert(error.message)
    else { alert('Saved for Kakamega County!'); setForm({constituency:'',ward:'',station:'',barasa:0,malala:0,khalwale:0,muhanda:0}) }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:'500px',margin:'20px auto',padding:'20px',background:'white',borderRadius:'12px'}}>
      <h1 style={{fontWeight:'bold'}}>KAKAMEGA GOVERNOR - Admin</h1>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'15px'}}>
        <select required value={form.constituency} onChange={e=>setForm({...form,constituency:e.target.value})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}>
          <option value="">Select Constituency</option>{CONSTITUENCIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input required placeholder="Ward (e.g., Mumias Central)" value={form.ward} onChange={e=>setForm({...form,ward:e.target.value})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <input required placeholder="Polling Station Name" value={form.station} onChange={e=>setForm({...form,station:e.target.value})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <hr/>
        <label>Barasa (ODM) Votes</label><input type="number" value={form.barasa} onChange={e=>setForm({...form,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <label>Malala (DCP) Votes</label><input type="number" value={form.malala} onChange={e=>setForm({...form,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <label>Khalwale Votes</label><input type="number" value={form.khalwale} onChange={e=>setForm({...form,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <label>Muhanda Votes</label><input type="number" value={form.muhanda} onChange={e=>setForm({...form,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <button disabled={loading} style={{padding:'14px',background:'#0a4a2a',color:'white',borderRadius:'8px',fontWeight:'bold'}}>{loading?'Saving...':'Submit Governor Results'}</button>
      </form>
      <br/><a href="/">← Back to County Tally</a>
    </div>
  )
}
