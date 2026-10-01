'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const COUNTY_DATA: any = {
  "Mumias East": { wards: { "Lubinu": ["Shibale Primary","Lubinu Primary","Matawa Primary"], "Isunga": ["Emakale Primary","Emasatsi Primary","Ekero Primary"], "East Wanga": ["Mwitoti Primary","Musango Primary","Khaimba Primary"] } },
  "Mumias West": { wards: { "Mumias Central": ["Mumias Township Primary","Mumias Complex","Bomia Primary"], "Mumias North": ["Ekero Sec","Shianda Primary","Eshiakhulo Primary"], "Etenje": ["Emuchimi Primary","Emakhwale Primary","Lukoye Primary"] } },
  "Matungu": { wards: { "Koyonzo": ["Koyonzo Primary","Namamali Primary"], "Kholera": ["Kholera Primary","Munami Primary"], "Mayoni": ["Mayoni Primary","Mirere Primary"] } },
  "Lurambi": { wards: { "Butsotso East": ["Shikoti Primary","Emasabwa Primary"], "Butsotso South": ["Shishebu Primary","Emusala Primary"], "Butsotso Central": ["Bukura Primary","Shikangania Primary"] } },
  "Shinyalu": { wards: { "Murhanda": ["Murhanda Primary","Shirere Primary"], "Isukha North": ["Shivanga Primary","Mukhonje Primary"], "Isukha Central": ["Shinyalu Primary","Isukha Primary"] } },
  "Ikolomani": { wards: { "Idakho South": ["Ikolomani Primary","Shikulu Primary"], "Idakho East": ["Lirhanda Primary","Malinya Primary"], "Idakho North": ["Shikumu Primary","Musingu Primary"] } },
  "Lugari": { wards: { "Mautuma": ["Mautuma Primary","Lumakanda Primary"], "Lugari": ["Lugari Primary","Chekalini Primary"], "Lumakanda": ["Manyonyi Primary","Mukuyu Primary"] } },
  "Likuyani": { wards: { "Likuyani": ["Likuyani Primary","Kongoni Primary"], "Sango": ["Sango Primary","Soy Sambu Primary"], "Kongoni": ["Kongoni Sec","Moi Primary"] } },
  "Malava": { wards: { "Manda-Shivanga": ["Malava Primary","Shivanga Primary"], "Shirugu-Mugai": ["Shirugu Primary","Mugai Primary"], "South Kabras": ["Samitsi Primary","Chimuche Primary"] } },
  "Navakholo": { wards: { "Ingotse-Matiha": ["Navakholo Primary","Ingotse Primary"], "Shinoyi-Shikomari": ["Shinoyi Primary","Sivilie Primary"], "Bunyala West": ["Nambacha Primary","Sisokhe Primary"] } },
  "Butere": { wards: { "Marama West": ["Butere Primary","Muyundi Primary"], "Marama Central": ["Shibembe Primary","Muyundi Sec"], "Marenyo-Shianda": ["Shinutsa Primary","Shianda Primary"] } },
  "Khwisero": { wards: { "Kisa North": ["Khwisero Primary","Emalindi Primary"], "Kisa East": ["Eshibinga Primary","Dudi Primary"], "Kisa West": ["Mwihila Primary","Ematsuli Primary"] } }
}

const CONSTITUENCIES = Object.keys(COUNTY_DATA)

export default function Admin(){
  const [c,setC]=useState(''); const [w,setW]=useState(''); const [s,setS]=useState('')
  const [votes,setVotes]=useState({barasa:0,malala:0,khalwale:0,muhanda:0})
  const [loading,setLoading]=useState(false)

  const wards = c? Object.keys(COUNTY_DATA[c].wards) : []
  const stations = c && w? COUNTY_DATA[c].wards[w] : []

  const submit = async (e:any)=>{
    e.preventDefault(); setLoading(true)
    const total = votes.barasa+votes.malala+votes.khalwale+votes.muhanda
    const {error} = await supabase.from('results').insert([{
      constituency:c, ward:w, station_name:s,
      barasa_votes:votes.barasa, malala_votes:votes.malala, khalwale_votes:votes.khalwale, muhanda_votes:votes.muhanda,
      total_votes:total
    }])
    if(error) alert(error.message)
    else { alert(`Saved! ${s} - ${c}`); setS(''); setVotes({barasa:0,malala:0,khalwale:0,muhanda:0}) }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:'520px',margin:'20px auto',padding:'20px',background:'white',borderRadius:'12px',fontFamily:'sans-serif'}}>
      <h1 style={{fontWeight:'bold'}}>KAKAMEGA GOVERNOR - Admin</h1>
      <p style={{fontSize:'13px',color:'#666'}}>Select, no typing needed</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'15px'}}>
        <select required value={c} onChange={e=>{setC(e.target.value); setW(''); setS('')}} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}>
          <option value="">1. Select Constituency</option>{CONSTITUENCIES.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <select required value={w} onChange={e=>{setW(e.target.value); setS('')}} disabled={!c} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}>
          <option value="">2. Select Ward</option>{wards.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <select required value={s} onChange={e=>setS(e.target.value)} disabled={!w} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}>
          <option value="">3. Select Polling Station</option>{stations.map((x:any)=><option key={x} value={x}>{x}</option>)}
        </select>
        <hr/>
        <input type="number" placeholder="Barasa (ODM)" value={votes.barasa||''} onChange={e=>setVotes({...votes,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <input type="number" placeholder="Malala (DCP)" value={votes.malala||''} onChange={e=>setVotes({...votes,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <input type="number" placeholder="Khalwale (IND)" value={votes.khalwale||''} onChange={e=>setVotes({...votes,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <input type="number" placeholder="Muhanda" value={votes.muhanda||''} onChange={e=>setVotes({...votes,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        <button disabled={loading} style={{padding:'14px',background:'#0a4a2a',color:'white',borderRadius:'8px',fontWeight:'bold'}}>{loading?'Saving...':'Submit Result'}</button>
      </form>
      <br/><a href="/">← Back to County Tally</a>
    </div>
  )
}
