'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin(){
  const [station,setStation]=useState('')
  const [votes,setVotes]=useState('')
  const [loading,setLoading]=useState(false)
  const submit = async (e:any)=>{
    e.preventDefault()
    setLoading(true)
    const {error} = await supabase.from('results').insert([{station_name:station,total_votes:parseInt(votes)}])
    if(error) alert(error.message)
    else { alert('Saved!'); setStation(''); setVotes('') }
    setLoading(false)
  }
  return (
    <div style={{maxWidth:'500px',margin:'20px auto',padding:'20px',background:'white',borderRadius:'10px'}}>
      <h1>Admin - Presiding Officer</h1>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        <input value={station} onChange={e=>setStation(e.target.value)} placeholder="Polling Station Name" required style={{padding:'12px',border:'1px solid #ccc',borderRadius:'6px'}}/>
        <input value={votes} onChange={e=>setVotes(e.target.value)} type="number" placeholder="Total Votes" required style={{padding:'12px',border:'1px solid #ccc',borderRadius:'6px'}}/>
        <button disabled={loading} style={{padding:'12px',background:'#0a4a2a',color:'white',borderRadius:'6px'}}>{loading?'Saving...':'Submit Result'}</button>
      </form>
      <br/><a href="/">← Back to Tally</a>
    </div>
  )
}
