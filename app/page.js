'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function loadPlayers() {
    setErr('')
    const { data, error } = await supabase
      .from('players')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
    if (error) setErr(error.message)
    else setPlayers(data || [])
  }

  useEffect(() => { loadPlayers() }, [])

  async function addPlayer() {
    if (!name.trim()) return
    setLoading(true); setErr('')
    const { error } = await supabase.from('players').insert([{ name: name.trim() }])
    setLoading(false)
    if (error) { setErr(error.message); return }
    setName('')
    await loadPlayers()
  }

  async function removePlayer(id) {
    setLoading(true); setErr('')
    const { error } = await supabase.from('players').delete().eq('id', id)
    setLoading(false)
    if (error) setErr(error.message)
    else setPlayers(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Players</h1>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Player name"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
        />
        <button
          onClick={addPlayer}
          disabled={loading || !name.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Add'}
        </button>
      </div>

      {err ? <p className="text-red-400 mb-3 text-sm">Error: {err}</p> : null}

      {players.length === 0 ? (
        <p className="text-gray-400">No players yet.</p>
      ) : (
        <ul className="divide-y divide-gray-800 rounded-lg border border-gray-800">
          {players.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-3 py-2">
              <span>{p.name}</span>
              <button
                onClick={() => removePlayer(p.id)}
                className="text-sm px-3 py-1 rounded bg-red-600/80 hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
