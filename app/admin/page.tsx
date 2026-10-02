'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const COUNTY_DATA: any = {
  "Lugari": { "Mautuma": ["Mautuma Primary 1","Mautuma Primary 2","Mukuyu Primary","Seregeya Primary","Mbagara Primary","PanPaper Primary","Mautuma Chief Office","Mautuma Township","Lumama Primary","St Peters Mautuma"], "Lugari": ["Lugari Primary","Lugari Station Primary","Hema Primary","Kivaywa Primary","Mufutu Primary","Lugari Sec","St Peters Lugari","Lugari Township","Maturu Primary","Lugari DEB"], "Lumakanda": ["Lumakanda Primary","Lumakanda DEB","St Pauls Lumakanda","Shirere Lumakanda","Mukongolo Primary","Manyonyi Primary","Lumakanda Sec","Friends Church Lumakanda","Lumakanda Township","Lumakanda Market"], "Chekalini": ["Chekalini Primary","Chekalini Sec","Musembe Primary","Mugunga Primary","Kivaywa Sec","Makutano Primary","Chekalini Market","Chekalini Township","Mukuyu Chekalini","Sango Chekalini"], "Chevaywa": ["Chevaywa Primary","Chevaywa Sec","Ivona Primary","Lunyu Primary","Chevaywa Market","Chevaywa Chief Office","Emalindi Chevaywa","Mukavakava Primary","Chevaywa Dispensary","Chevaywa DEB"], "Lwandeti": ["Lwandeti Primary","Lwandeti DEB","Lwandeti Sec","Mugusa Primary","Soy Sambu Primary","Lwandeti Market","Lwandeti Chief Camp","Emalindi Lwandeti","Lwandeti Township","Lwandeti Central"] },
  "Likuyani": { "Likuyani": ["Likuyani Primary","Likuyani Sec","Moi Primary Likuyani","St Teresa Likuyani","Likuyani Market","Likuyani Township","Kwa Sammy Primary","Likuyani Chief Office","Likuyani DEB","Sango Likuyani"], "Sango": ["Sango Primary","Sango Sec","Soy Sambu Sango","Sango Market","Sango Chief Office","Baraka Primary","Sango Township","Sango DEB","Sango Dispensary","Nzoia Sango"], "Kongoni": ["Kongoni Primary","Kongoni Sec","Kongoni Market","Kongoni Township","St Joseph Kongoni","Kongoni DEB","Kongoni Polytechnic","Kongoni Chief Office","Kongoni Central","Nzoia Kongoni"], "Nzoia": ["Nzoia Primary","Nzoia Sec","Nzoia Market","Nzoia Sugar Primary","Nzoia Township","Nzoia Chief Office","Nzoia DEB","St Anne Nzoia","Nzoia Polytechnic","Nzoia Central"], "Sinoko": ["Sinoko Primary","Sinoko Sec","Sinoko Market","Sinoko Chief Office","Sinoko DEB","Sinoko Township","Baraka Sinoko","St Peter Sinoko","Sinoko Central","Sinoko Dispensary"] },
  "Malava": { "West Kabras": ["Malava Primary","Malava Boys","Shamberere Primary","Mukhonje Primary","Kimangeti Primary","Chegulo Primary","Lukume Primary","Shembela Primary","Tombo Primary","Chepkumia Primary"], "Chemuche": ["Chemuche Primary","Chemuche Sec","Mukhonje Chemuche","St Monica Chemuche","Chemuche Market","Lukala Primary","Chemuche Township","Chemuche DEB","Chemuche Chief Office","Kabras Chemuche"], "East Kabras": ["East Kabras Primary","Matsakha Primary","Matsakha Sec","Kimangeti East","Lukume East","Shamberere East","Malava East","Mukhonje East","East Kabras Market","East Kabras Sec"], "Butali/Chegulo": ["Butali Primary","Butali Sec","Chegulo Primary","Chegulo Sec","Butali Market","Butali Chief Office","Butali Township","Butali DEB","Chegulo Market","Butali Polytechnic"], "Manda-Shivanga": ["Manda Primary","Shivanga Primary","Manda Sec","Shivanga Sec","Manda Market","Shivanga Market","Manda-Shivanga Township","St Joseph Shivanga","Manda-Shivanga DEB","Manda Chief Office"], "Shirugu-Mugai": ["Shirugu Primary","Mugai Primary","Shirugu Sec","Mugai Sec","Shirugu Market","Mugai Market","Shirugu Township","Mugai Township","Shirugu Chief Office","Mugai DEB"], "South Kabras": ["South Kabras Primary","South Kabras Sec","Samitsi Primary","Chimuche Primary","Lukala South","Mukhonje South","South Kabras Market","South Kabras Township","South Kabras DEB","South Kabras Chief Office"] },
  "Lurambi": { "Butsotso East": ["Shikoti Primary","Emasabwa Primary","Shikoti Sec","Emasabwa Sec","Shikoti Market","Shikoti Township","Butsotso East Chief Office","St Catherine Shikoti","Butsotso East DEB","Emasabwa Market"], "Butsotso South": ["Shishebu Primary","Emusala Primary","Shishebu Sec","Emusala Sec","Shishebu Market","Butsotso South Chief Office","Emusala Township","St Paul Shishebu","Butsotso South DEB","Shishebu Polytechnic"], "Butsotso Central": ["Bukura Primary","Shikangania Primary","Bukura Sec","Shikangania Sec","Bukura Market","Bukura Polytechnic","Bukura Township","Bukura TTC","Butsotso Central Chief Office","Butsotso Central DEB"], "Sheywe": ["Sheywe Primary","Sheywe Sec","Sheywe Market","Amalemba Primary","Shirere Sheywe","Sheywe Township","Sheywe Chief Office","Sheywe DEB","St Ann Sheywe","Sheywe Polytechnic"], "Mahiakalo": ["Mahiakalo Primary","Mahiakalo Sec","Mahiakalo Market","Mahiakalo Chief Office","Mahiakalo Township","Mahiakalo DEB","St Peters Mahiakalo","Mahiakalo Polytechnic","Mahiakalo Dispensary","Mahiakalo Central"], "Shirere": ["Shirere Primary","Shirere Sec","Shirere Market","Shirere Township","Shirere Chief Office","Shirere DEB","St Joseph Shirere","Shirere Polytechnic","Shirere Dispensary","Shirere Central"] },
  "Navakholo": { "Ingostse-Mathia": ["Ingotse Primary","Mathia Primary","Ingotse Sec","Mathia Sec","Ingotse Market","Mathia Market","Ingotse Chief Office","Ingotse Township","Ingotse DEB","Mathia DEB"], "Shinoyi-Shikomari-Esumeyia": ["Shinoyi Primary","Shikomari Primary","Esumeyia Primary","Shinoyi Sec","Shikomari Sec","Shinoyi Market","Shikomari Market","Esumeyia Market","Shinoyi Chief Office","Esumeyia Township"], "Bunyala West": ["Bunyala West Primary","Nambacha Primary","Sisokhe Primary","Bunyala West Sec","Nambacha Sec","Bunyala West Market","Bunyala West Chief Office","Bunyala West Township","Bunyala West DEB","Nambacha Market"], "Bunyala East": ["Bunyala East Primary","Bunyala East Sec","Bunyala East Market","Bunyala East Chief Office","Bunyala East Township","Bunyala East DEB","St Joseph Bunyala East","Bunyala East Polytechnic","Bunyala East Dispensary","Bunyala East Central"], "Bunyala Central": ["Bunyala Central Primary","Chebuyusi Primary","Chebuyusi Boys","Bunyala Central Sec","Chebuyusi Market","Bunyala Central Chief Office","Bunyala Central Township","Bunyala Central DEB","Bunyala Central Polytechnic","Navakholo Central"] },
  "Mumias West": { "Mumias Central": ["Mumias Township Primary","Mumias Complex Primary","Bomia Primary","Mumias DEB Primary","Mumias Muslim Primary","Mumias Sugar Primary","Mumias Central Sec","St Marys Mumias","Mumias Township Sec","BOMANI ACK Hall"], "Mumias North": ["Shianda Primary","Ekero Primary","Ekero Sec","Ekero Muslim Primary","Eshiakhulo Primary","Shianda Sec","Shitoto Primary","Matawa Primary North","Shibale North","Elwakana Primary"], "Etenje": ["Etenje Primary","Etenje Sec","Emuchimi Primary","Emakhwale Primary","Etenje Market","Etenje Chief Office","Etenje Township","Etenje DEB","Etenje Polytechnic","Etenje Dispensary"], "Musanda": ["Musanda Primary","Musanda Sec","Musanda Market","Musanda Chief Office","Musanda Township","Musanda DEB","St Joseph Musanda","Musanda Polytechnic","Musanda Dispensary","Musanda Central"] },
  "Mumias East": { "Lusheya/Lubinu": ["Shibale Primary","Lubinu Primary","Matawa Primary","Lubinu Sec","Lusheya Primary","Shibale Sec","Elwakana Primary","Makunga Primary Lubinu","Indangalasia Primary","Emakhwale Lubinu","St Joseph Shibale","Malaha Lubinu","Light Junior","Clever Bee","Shillo Pri."], "Malaha/Isongo/Makunga": ["Malaha Primary","Isongo Primary","Makunga Primary","Malaha Sec","Isongo Sec","Makunga Sec","Emasatsi Primary","Emakale Primary","Eshiakhulo Makunga","Mwitoti Primary","Khaimba Primary","Malaha Polytechnic"], "East Wanga": ["Mwitoti Primary","Musango Primary","Nyapora Primary","Khaimba Primary East","Mwitoti Sec","Elureko Primary","Namabhu Primary","Mumias Sugar East","Emukaya Primary","Eshikoye Primary","Eshirumba Primary","Ekero Muslim East"] },
  "Matungu": { "Koyonzo": ["Koyonzo Primary","Koyonzo Sec","Namamali Primary","Bulimbo Girls","Koyonzo Market","Koyonzo Chief Office","Koyonzo Township","Koyonzo DEB","St Joseph Koyonzo","Koyonzo Polytechnic"], "Kholera": ["Kholera Primary","Kholera Sec","Munami Primary","Kholera Market","Kholera Chief Office","Kholera Township","Kholera DEB","Kholera Dispensary","Kholera Central","St Paul Kholera"], "Khalaba": ["Khalaba Primary","Khalaba Sec","Khalaba Market","Khalaba Chief Office","Khalaba Township","Khalaba DEB","Khalaba Polytechnic","Khalaba Dispensary","Khalaba Central","St Joseph Khalaba"], "Mayoni": ["Mayoni Primary","Mayoni Sec","Mirere Primary","Mayoni Market","Mayoni Chief Office","Mayoni Township","Mayoni DEB","Mayoni Polytechnic","Mayoni Dispensary","Mayoni Central"], "Namamali": ["Namamali Primary","Namamali Sec","Bulimbo Primary","Namamali Market","Namamali Chief Office","Namamali Township","Namamali DEB","Namamali Polytechnic","Namamali Dispensary","St Mary Namamali"] },
  "Butere": { "Marama West": ["Butere Primary","Butere Boys","Butere Girls","Muyundi Primary","Marama West Primary","Shikunga Primary","Shikunga Sec","Butere Market","Butere Township","Marama West DEB"], "Marama Central": ["Shibembe Primary","Muyundi Sec","Shibembe Sec","Marama Central Primary","Butere Central Market","Marama Central Chief Office","Marama Central Township","Marama Central DEB","Marama Central Polytechnic","Shibembe Township"], "Marenyo-Shianda": ["Shinutsa Primary","Shianda Primary","Marenyo Primary","Marenyo Sec","Shianda Sec","Marenyo Market","Shianda Market","Marenyo Chief Office","Shianda Township","Marenyo DEB"], "Marama North": ["Marama North Primary","Marama North Sec","Marama North Market","Marama North Chief Office","Marama North Township","Marama North DEB","Marama North Polytechnic","Marama North Dispensary","Marama North Central","St Joseph Marama North"], "Marama South": ["Marama South Primary","Marama South Sec","Marama South Market","Marama South Chief Office","Marama South Township","Marama South DEB","Marama South Polytechnic","Marama South Dispensary","Marama South Central","St Paul Marama South"] },
  "Khwisero": { "Kisa North": ["Khwisero Primary","Emalindi Primary","Khwisero Sec","Emalindi Sec","Kisa North Primary","Khwisero Market","Kisa North Market","Khwisero Township","Kisa North DEB","Kisa North Chief Office"], "Kisa East": ["Eshibinga Primary","Dudi Primary","Eshibinga Sec","Dudi Sec","Kisa East Primary","Eshibinga Market","Kisa East Market","Eshibinga Township","Kisa East DEB","Kisa East Chief Office"], "Kisa West": ["Mwihila Primary","Ematsuli Primary","Mwihila Sec","Ematsuli Sec","Kisa West Primary","Mwihila Market","Kisa West Market","Mwihila Township","Kisa West DEB","Kisa West Chief Office"], "Kisa Central": ["Kisa Central Primary","Kisa Central Sec","Ebukwala Primary","Ebukwala Sec","Kisa Central Market","Kisa Central Chief Office","Kisa Central Township","Kisa Central DEB","Kisa Central Polytechnic","Ebukwala Township"] },
  "Shinyalu": { "Isukha North": ["Shivanga Primary","Mukhonje Primary","Shivanga Sec","Mukhonje Sec","Isukha North Primary","Shivanga Market","Isukha North Market","Shivanga Township","Isukha North DEB","Shivanga Chief Office"], "Murhanda": ["Murhanda Primary","Murhanda Sec","Shirere Murhanda","Murhanda Market","Murhanda Chief Office","Murhanda Township","Murhanda DEB","Murhanda Polytechnic","Murhanda Dispensary","Murhanda Central"], "Isukha Central": ["Shinyalu Primary","Isukha Primary","Shinyalu Sec","Isukha Central Primary","Shinyalu Market","Shinyalu Township","Isukha Central Chief Office","Shinyalu DEB","Shinyalu Polytechnic","Shinyalu Central"], "Isukha South": ["Isukha South Primary","Isukha South Sec","Isukha South Market","Isukha South Chief Office","Isukha South Township","Isukha South DEB","Isukha South Polytechnic","Isukha South Dispensary","Isukha South Central","St Joseph Isukha South"], "Isukha East": ["Isukha East Primary","Isukha East Sec","Isukha East Market","Isukha East Chief Office","Isukha East Township","Isukha East DEB","Isukha East Polytechnic","Isukha East Dispensary","Isukha East Central","St Paul Isukha East"], "Isukha West": ["Isukha West Primary","Isukha West Sec","Isukha West Market","Isukha West Chief Office","Isukha West Township","Isukha West DEB","Isukha West Polytechnic","Isukha West Dispensary","Isukha West Central","Kakamega Forest Primary"] },
  "Ikolomani": { "Idakho South": ["Ikolomani Primary","Shikulu Primary","Ikolomani Sec","Shikulu Sec","Idakho South Primary","Shikulu Market","Idakho South Market","Ikolomani Township","Idakho South DEB","Idakho South Chief Office"], "Idakho East": ["Lirhanda Primary","Malinya Primary","Malinya Sec","Lirhanda Sec","Idakho East Primary","Malinya Market","Idakho East Market","Lirhanda Township","Idakho East DEB","Idakho East Chief Office"], "Idakho North": ["Shikumu Primary","Musingu Primary","Musingu High","Shikumu Sec","Idakho North Primary","Shikumu Market","Idakho North Market","Musingu Township","Idakho North DEB","Idakho North Chief Office"], "Idakho Central": ["Idakho Central Primary","Makhokho Primary","Makhokho Sec","Idakho Central Sec","Makhokho Township","Idakho Central Market","Idakho Central Chief Office","Idakho Central Township","Idakho Central DEB","Makhokho Market"] }
}

export default function Admin(){
  const [constituency,setConstituency]=useState('Mumias East')
  const [ward,setWard]=useState('')
  const [station,setStation]=useState('')
  const [votes,setVotes]=useState({barasa:0,malala:0,khalwale:0,muhanda:0})
  const [lockedStations,setLockedStations]=useState<Set<string>>(new Set())
  const [loading,setLoading]=useState(false)
  const [lastSync,setLastSync]=useState('')

  const refreshLocks = async ()=>{
    const {data}=await supabase.from('results').select('constituency,ward,station_name')
    if(data){
      const set = new Set(data.map((r:any)=> `${r.constituency}|${r.ward}|${r.station_name}`))
      setLockedStations(set as any)
      setLastSync(new Date().toLocaleTimeString())
    }
  }

  useEffect(()=>{
    refreshLocks()
    const poll = setInterval(refreshLocks, 3000)
    const channel = supabase.channel('lock-watcher-v2').on('postgres_changes',{event:'INSERT',schema:'public',table:'results'},(payload:any)=>{
      const r:any = payload.new
      const key = `${r.constituency}|${r.ward}|${r.station_name}`
      setLockedStations(prev=>{
        const next = new Set(prev)
        next.add(key)
        return next as any
      })
    }).subscribe()
    return ()=>{ clearInterval(poll); supabase.removeChannel(channel) }
  },[])

  useEffect(()=>{ if(ward) refreshLocks() }, [ward])

  const submit = async (e:any)=>{
    e.preventDefault()
    const key = `${constituency}|${ward}|${station}`
    if(lockedStations.has(key)){ alert(`🔒 LOCKED: ${station} already sent from main server!`); return }
    setLoading(true)
    const payload = { constituency, ward, station_name: station, barasa_votes: votes.barasa, malala_votes: votes.malala, khalwale_votes: votes.khalwale, muhanda_votes: votes.muhanda, total_votes: votes.barasa+votes.malala+votes.khalwale+votes.muhanda }
    try{
      const {error}:any=await supabase.from('results').insert([payload])
      if(error) throw error
      setLockedStations(prev=>{
        const next = new Set(prev)
        next.add(key)
        return next as any
      })
      alert(`✅ Locked! ${station} sent and locked on ALL devices.`)
    }catch(err:any){
      if(err.code==='23505'){
        alert(`🔒 Blocked by main server: ${station} already submitted!`)
        setLockedStations(prev=>{ const next=new Set(prev); next.add(key); return next as any })
      } else alert(`Error: ${err.message}`)
    }
    setLoading(false); setStation(''); setVotes({barasa:0,malala:0,khalwale:0,muhanda:0})
  }

  const wards = constituency? Object.keys(COUNTY_DATA[constituency]||{}) : []
  const stations = constituency && ward? (COUNTY_DATA[constituency][ward]||[]) : []
  const isStationLocked =!!station && lockedStations.has(`${constituency}|${ward}|${station}`)

  return (
    <div style={{maxWidth:'560px',margin:'10px auto',padding:'16px',background:'white',borderRadius:'14px',fontFamily:'sans-serif'}}>
      <div style={{padding:'10px',background:'#dcfce7',borderRadius:'8px',fontSize:'11px',textAlign:'center',marginBottom:'12px',fontWeight:'bold'}}>
        🟢 Synced | Locked: {lockedStations.size} | Last check: {lastSync || 'now'}<br/>
        <span style={{fontSize:'10px',fontWeight:'normal'}}>Auto-refresh 3s - Light Junior + Clever Bee + Shillo Added</span>
      </div>
      <h1 style={{fontWeight:'bold',margin:'0'}}>CLERK ENTRY - {constituency}</h1>
      <p style={{fontSize:'11px',color:'#666',margin:'4px 0 8px 0'}}>Once sent, station locks across ALL computers instantly</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'12px'}}>
        <select required value={constituency} onChange={e=>{setConstituency(e.target.value); setWard(''); setStation('')}} style={{padding:'14px',border:'2px solid #0a4a2a',borderRadius:'8px',fontSize:'15px'}}>{Object.keys(COUNTY_DATA).map(c=><option key={c} value={c}>{c}</option>)}</select>
        <select required value={ward} onChange={e=>{setWard(e.target.value); setStation(''); refreshLocks()}} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px',fontSize:'15px'}}><option value="">-- Select Ward --</option>{wards.map((w:any)=><option key={w} value={w}>{w}</option>)}</select>
        <select required value={station} onChange={e=>setStation(e.target.value)} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px',fontSize:'15px'}}><option value="">-- Select Station --</option>{stations.map((s:any)=>{ const locked = lockedStations.has(`${constituency}|${ward}|${s}`); return <option key={s} value={s} disabled={locked}>{locked? `🔒 ${s} - ALREADY SENT` : `📍 ${s}`}</option>})}</select>
        {isStationLocked && <div style={{background:'#fee2e2',padding:'10px',borderRadius:'8px',color:'#dc2626',fontWeight:'bold',fontSize:'13px',textAlign:'center'}}>🔒 BLOCKED BY MAIN SERVER<br/>{station} already submitted.</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <input required type="number" min="0" placeholder="Barasa (ODM)" value={votes.barasa||''} onChange={e=>setVotes({...votes,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input required type="number" min="0" placeholder="Malala (DCP)" value={votes.malala||''} onChange={e=>setVotes({...votes,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Khalwale" value={votes.khalwale||''} onChange={e=>setVotes({...votes,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Muhanda" value={votes.muhanda||''} onChange={e=>setVotes({...votes,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        </div>
        <button disabled={loading || isStationLocked} style={{padding:'16px',background: isStationLocked? '#9ca3af' : '#0a4a2a',color:'white',borderRadius:'10px',fontWeight:'bold',fontSize:'16px'}}>{isStationLocked? '🔒 LOCKED ON ALL DEVICES' : loading? 'Submitting...' : 'Submit & Lock on ALL Devices ✓'}</button>
      </form>
      <div style={{marginTop:'12px',display:'flex',gap:'6px'}}>
        <button onClick={refreshLocks} style={{flex:1,padding:'10px',background:'#e5e7eb',borderRadius:'8px',fontSize:'12px',fontWeight:'bold'}}>🔄 Force Sync with Main Server</button>
      </div>
      <div style={{marginTop:'10px',fontSize:'10px',color:'#999',textAlign:'center'}}>Build: v15-fixed-disabled-type + 3 new stations</div>
    </div>
  )
}
