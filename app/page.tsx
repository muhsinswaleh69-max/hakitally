export const dynamic = 'force-dynamic'
'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('Mumias East')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('cases').insert([
        { 
          reporter_name: name, 
          phone: phone, 
          location: location, 
          description: description,
          status: 'pending'
        }
      ])
      if (error) throw error
      setSuccess(true)
      setName('')
      setPhone('')
      setDescription('')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      alert('Error: ' + err.message + ' - Check Supabase table "cases" exists')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#0a4a2a' }}>HakiTally - Mumias</h1>
      <p style={{ textAlign: 'center' }}>Report Justice Issue / Ripoti Tatizo la Haki</p>

      {success && <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', margin: '15px 0', color: '#155724' }}>✅ Asante! Ripoti yako imepokelewa.</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Jina Lako / Your Name" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Simu / Phone (07...)" required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <select value={location} onChange={e => setLocation(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}>
          <option>Mumias East</option>
          <option>Mumias West</option>
          <option>Matungu</option>
          <option>Khwisero</option>
          <option>Butere</option>
        </select>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Eleza tatizo... / Describe issue..." rows={5} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button disabled={loading} type="submit" style={{ background: '#0a4a2a', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
          {loading ? 'Tuma...' : 'TUMA RIPOTI / SUBMIT REPORT'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}><a href="/admin">Admin Login →</a></p>
    </div>
  )
}
