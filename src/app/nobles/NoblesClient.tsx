'use client'

import { useState } from 'react'

interface Noble {
  id: string
  username: string
  gold_balance: number
  honorific: 'Sir' | 'Lady' | null
}

export default function NoblesClient({
  initialNobles,
  currentUserId,
}: {
  initialNobles: Noble[]
  currentUserId: string | null
}) {
  const [nobles, setNobles] = useState(initialNobles)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialNobles.length === 20)

  async function loadMore() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=nobles&offset=${nobles.length}`)
      const data = await res.json()
      setNobles(prev => [...prev, ...data.rows])
      setHasMore(data.rows.length === 20)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        {nobles.map((n, i) => {
          const displayName = i < 10 && n.honorific ? `${n.honorific} ${n.username}` : n.username
          const isYou = n.id === currentUserId
          return (
            <div
              key={n.id}
              className="flex items-center justify-between py-3 border-b border-[#f0ede6]"
              style={isYou ? { backgroundColor: 'rgba(176,125,42,0.08)' } : {}}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-[#bbb] w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {i < 3 ? (
                  <span className="gold-scroll text-sm font-medium">{displayName}</span>
                ) : (
                  <span
                    className="text-sm font-medium"
                    style={isYou ? { color: '#1a1208', fontStyle: 'italic' } : {}}
                  >
                    {displayName}
                    {isYou && (
                      <span className="font-mono text-[10px] text-[#aaa] ml-2 not-italic">(you)</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-600 text-xs">⬡</span>
                <span className="font-fell text-base">{n.gold_balance}</span>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 w-full font-mono text-[11px] text-[#888] hover:text-[#111] border border-[#d8d4cc] rounded-xl py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load more nobles'}
        </button>
      )}
    </>
  )
}
