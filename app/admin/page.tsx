export const dynamic = 'force-dynamic'
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadCases = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false })
    if (!error && data) setCases(data)
    if (error) console.log(error)
    setLoading(false)
  }

  useEffect(() => {
    loadCases()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await supabase.from('cases').update({ status }).eq('id', id)
    loadCases()
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#0a4a2a' }}>HakiTally - Admin Panel</h1>
      <button onClick={loadCases} style={{ padding: '8px 15px', marginBottom: '15px' }}>Refresh</button>
      <a href="/" style={{ marginLeft: '20px' }}>← Back to Home</a>

      {loading ? <p>Loading cases...</p> : null}

      {cases.length === 0 && !loading && <p>No cases yet. Create 'cases' table in Supabase.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cases.map((c) => (
          <div key={c.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: 'white' }}>
            <b>{c.reporter_name}</b> - {c.phone} - <i>{c.location}</i><br />
            <p>{c.description}</p>
            <small>{c.created_at ? new Date(c.created_at).toLocaleString() : ''} | Status: <b>{c.status}</b></small>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button onClick={() => updateStatus(c.id, 'in_progress')} style={{ background: '#ffc107', border: 'none', padding: '6px 10px', borderRadius: '5px' }}>In Progress</button>
              <button onClick={() => updateStatus(c.id, 'resolved')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px' }}>Resolved</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
