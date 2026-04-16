'use client'

import { useState } from 'react'

interface Player {
  id: string
  username: string
  honor_score: number
  display_initials: string
}

interface Props {
  initialPlayers: Player[]
  initialOffset: number
}

export default function HonorsClient({ initialPlayers, initialOffset }: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [offset, setOffset] = useState(initialOffset)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPlayers.length === 20)

  async function loadMore() {
    setLoading(true)
    const res = await fetch(`/api/leaderboard?type=honors&offset=${offset}`)
    const data = await res.json()
    setPlayers(prev => [...prev, ...data.rows])
    setOffset(prev => prev + data.rows.length)
    if (data.rows.length < 20) setHasMore(false)
    setLoading(false)
  }

  return (
    <div>
      <div className="space-y-0">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between py-3 border-b border-[#f0ede6] ${
              i < 3 ? 'border-l-2 border-l-[#3B6D11] pl-3' : 'pl-0'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-[#bbb] w-6">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-sans text-sm font-medium">{p.username}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base font-bold">{p.honor_score}</span>
              <span className="font-mono text-[10px] text-[#888]">honour</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 w-full font-mono text-[11px] text-[#888] hover:text-[#111] border border-[#d8d4cc] rounded-lg py-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
