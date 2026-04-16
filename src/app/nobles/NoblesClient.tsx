'use client'

import { useState } from 'react'

interface Noble {
  id: string
  username: string
  gold_balance: number
  player_number: number | null
}

interface Props {
  initialNobles: Noble[]
  currentUserId: string | null
  initialOffset: number
}

export default function NoblesClient({ initialNobles, currentUserId, initialOffset }: Props) {
  const [nobles, setNobles] = useState<Noble[]>(initialNobles)
  const [offset, setOffset] = useState(initialOffset)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialNobles.length === 20)

  async function loadMore() {
    setLoading(true)
    const res = await fetch(`/api/leaderboard?type=nobles&offset=${offset}`)
    const data = await res.json()
    setNobles(prev => [...prev, ...data.rows])
    setOffset(prev => prev + data.rows.length)
    if (data.rows.length < 20) setHasMore(false)
    setLoading(false)
  }

  return (
    <div>
      <div className="space-y-0">
        {nobles.map((n, i) => (
          <div
            key={n.id}
            className={`flex items-center justify-between py-3 border-b border-[#f0ede6] px-1 ${
              n.id === currentUserId ? 'bg-[#f5f3ee]' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-[#bbb] w-6">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-sans text-sm font-medium">{n.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-600 text-xs">⬡</span>
              <span className="font-serif text-base font-bold">{n.gold_balance}</span>
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
