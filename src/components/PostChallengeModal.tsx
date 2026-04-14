'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRow } from '@/types/database'

const TIMER_OPTIONS = [
  { label: '5m', value: 5 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
  { label: '8h', value: 480 },
  { label: '12h', value: 720 },
  { label: '24h', value: 1440 },
]

interface Props {
  currentUser: UserRow
  onClose: () => void
}

export default function PostChallengeModal({ currentUser, onClose }: Props) {
  const maxWager = currentUser.newbie_day <= 3 ? 5
    : currentUser.newbie_day <= 7 ? 10
    : currentUser.gold_balance

  const [gold, setGold] = useState(Math.min(5, maxWager))
  const [timerIdx, setTimerIdx] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handlePost() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/post-wager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goldAmount: gold, timerMinutes: TIMER_OPTIONS[timerIdx].value }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white border border-[#d8d4cc] rounded-[12px] w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl">Post a Challenge</h2>
          <button onClick={onClose} className="font-mono text-lg text-[#888] hover:text-[#111]">×</button>
        </div>

        {/* Gold input */}
        <div className="mb-5">
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-2">
            Wager Amount
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1} max={maxWager} value={gold}
              onChange={e => setGold(Number(e.target.value))}
              className="flex-1 accent-[#111]"
            />
            <span className="font-serif text-2xl font-bold w-12 text-right">{gold}</span>
          </div>
          <p className="font-mono text-[10px] text-[#888] mt-1">
            Balance: {currentUser.gold_balance} &middot; Max: {maxWager}
          </p>
        </div>

        {/* Timer picker */}
        <div className="mb-6">
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-2">
            Chat Timer
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {TIMER_OPTIONS.map((t, i) => (
              <button
                key={t.value}
                onClick={() => setTimerIdx(i)}
                className={`font-mono text-xs py-1.5 rounded-lg border transition-colors ${
                  timerIdx === i
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-[#444] border-[#d8d4cc] hover:bg-[#f0ede6]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="font-mono text-xs text-[#993C1D] mb-3">{error}</p>}

        <button
          onClick={handlePost} disabled={loading}
          className="w-full bg-[#111] text-white font-sans text-sm font-medium py-2.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting…' : `Post — ${gold} Gold at stake`}
        </button>
      </div>
    </div>
  )
}
