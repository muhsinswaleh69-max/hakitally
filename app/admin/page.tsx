export default function Admin(){
  const [constituency,setConstituency]=useState('Mumias East')
  const [ward,setWard]=useState('')
  const [station,setStation]=useState('')
  const [votes,setVotes]=useState({barasa:0,malala:0,khalwale:0,muhanda:0})
  const [status,setStatus]=useState('🟢 Online - 0 pending')
  const [queue,setQueue]=useState<any[]>([])
  const [lockedStations,setLockedStations]=useState<Set<string>>(new Set())
  const [loading,setLoading]=useState(false)

  // Load already reported stations from main server
  const refreshLocks = async ()=>{
    const {data}=await supabase.from('results').select('constituency,ward,station_name')
    if(data){
      const set = new Set(data.map((r:any)=> `${r.constituency}|${r.ward}|${r.station_name}`))
      setLockedStations(set)
    }
  }

  useEffect(()=>{
    const q = JSON.parse(localStorage.getItem('hakitally_queue')||'[]'); setQueue(q)
    refreshLocks()
    const channel = supabase.channel('lock-watcher').on('postgres_changes',{event:'INSERT',schema:'public',table:'results'},(payload)=>{
      const r:any = payload.new
      const key = `${r.constituency}|${r.ward}|${r.station_name}`
      setLockedStations(prev=> new Set([...prev, key]))
    }).subscribe()
    const interval = setInterval(async ()=>{
      const pending = JSON.parse(localStorage.getItem('hakitally_queue')||'[]')
      if(pending.length>0 && navigator.onLine){
        for(const item of [...pending]){
          const {error}=await supabase.from('results').insert([item])
          if(!error){
            const newQ = JSON.parse(localStorage.getItem('hakitally_queue')||'[]').filter((x:any)=> JSON.stringify(x)!==JSON.stringify(item))
            localStorage.setItem('hakitally_queue',JSON.stringify(newQ)); setQueue(newQ)
          }
        }
        refreshLocks()
      }
    },3000)
    return ()=>{ supabase.removeChannel(channel); clearInterval(interval) }
  },[])

  const submit = async (e:any)=>{
    e.preventDefault()
    const key = `${constituency}|${ward}|${station}`
    if(lockedStations.has(key)){ alert(`🔒 LOCKED: ${station} already sent from another computer! Cannot resend.`); return }
    setLoading(true)
    const payload = { constituency, ward, station_name: station, barasa_votes: votes.barasa, malala_votes: votes.malala, khalwale_votes: votes.khalwale, muhanda_votes: votes.muhanda, total_votes: votes.barasa+votes.malala+votes.khalwale+votes.muhanda }
    try{
      if(!navigator.onLine) throw new Error('offline')
      const {error}=await supabase.from('results').insert([payload]); if(error) throw error
      setLockedStations(prev=> new Set([...prev, key])); alert(`✅ Locked! ${station} sent and now locked.`)
    }catch(err:any){
      if(err.message?.includes('duplicate') || err.code==='23505'){ alert(`🔒 Already locked by another clerk!`); setLockedStations(prev=> new Set([...prev, key])) }
      else { const newQ=[...queue,payload]; localStorage.setItem('hakitally_queue',JSON.stringify(newQ)); setQueue(newQ); alert(`📴 Saved offline, will lock when online`) }
    }
    setLoading(false); setStation(''); setVotes({barasa:0,malala:0,khalwale:0,muhanda:0})
  }

  const wards = constituency? Object.keys(COUNTY_DATA[constituency]||{}) : []
  const stations = constituency && ward? COUNTY_DATA[constituency][ward]||[] : []
  const getStationStatus = (s:string)=> lockedStations.has(`${constituency}|${ward}|${s}`)

  return (
    <div style={{maxWidth:'560px',margin:'10px auto',padding:'16px',background:'white',borderRadius:'14px',fontFamily:'sans-serif'}}>
      <div style={{padding:'10px',background: status.includes('Online')?'#dcfce7':'#fee2e2',borderRadius:'8px',fontSize:'12px',textAlign:'center',marginBottom:'12px',fontWeight:'bold'}}>🟢 All Computers Synced | Locked: {lockedStations.size} stations</div>
      <h1 style={{fontWeight:'bold'}}>CLERK ENTRY - {constituency}</h1>
      <p style={{fontSize:'11px',color:'#666'}}>Once sent, station locks across ALL computers A,B,C,D,E,F</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'12px'}}>
        <select required value={constituency} onChange={e=>{setConstituency(e.target.value); setWard(''); setStation('')}} style={{padding:'14px',border:'2px solid #0a4a2a',borderRadius:'8px'}}>{Object.keys(COUNTY_DATA).map(c=><option key={c} value={c}>{c} - {Object.keys(COUNTY_DATA[c]).length} Wards {Array.from(lockedStations).filter(k=>k.startsWith(c+'|')).length} locked</option>)}</select>
        <select required value={ward} onChange={e=>{setWard(e.target.value); setStation('')}} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">-- Select Ward --</option>{wards.map((w:any)=><option key={w} value={w}>{w} {Array.from(lockedStations).filter(k=>k.includes(`|${w}|`)).length} locked</option>)}</select>
        <select required value={station} onChange={e=>setStation(e.target.value)} style={{padding:'14px',border:'1px solid #ccc',borderRadius:'8px'}}><option value="">-- Select Station --</option>{stations.map((s:any)=>{ const locked = getStationStatus(s); return <option key={s} value={s} disabled={locked} style={{color: locked?'red': 'black'}}>{locked? `🔒 ${s} - ALREADY SENT` : `📍 ${s}`}</option>})}</select>
        {station && getStationStatus(station) && <div style={{background:'#fee2e2',padding:'10px',borderRadius:'8px',color:'#dc2626',fontWeight:'bold',fontSize:'13px'}}>🔒 This station already submitted from another computer. Choose another.</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          <input required type="number" min="0" placeholder="Barasa (ODM)" value={votes.barasa||''} onChange={e=>setVotes({...votes,barasa:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input required type="number" min="0" placeholder="Malala (DCP)" value={votes.malala||''} onChange={e=>setVotes({...votes,malala:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Khalwale" value={votes.khalwale||''} onChange={e=>setVotes({...votes,khalwale:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
          <input type="number" min="0" placeholder="Muhanda" value={votes.muhanda||''} onChange={e=>setVotes({...votes,muhanda:Number(e.target.value)})} style={{padding:'12px',border:'1px solid #ccc',borderRadius:'8px'}}/>
        </div>
        <button disabled={loading || (station && getStationStatus(station))} style={{padding:'16px',background:(station && getStationStatus(station))?'#9ca3af':'#0a4a2a',color:'white',borderRadius:'10px',fontWeight:'bold'}}>{station && getStationStatus(station)? '🔒 LOCKED - Already Sent' : loading? 'Submitting...': 'Submit & Lock Station ✓'}</button>
      </form>
    </div>
  )
}
