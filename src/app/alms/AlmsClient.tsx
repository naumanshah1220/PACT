'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import type { UserRow } from '@/types/database'

interface AlmsRequest {
  id: string
  gold_amount: number
  message: string | null
  created_at: string
  requester: {
    id: string
    username: string
    display_initials: string
    player_number: number | null
  }
}

interface Props {
  currentUser: UserRow
  requests: AlmsRequest[]
}

export default function AlmsClient({ currentUser, requests }: Props) {
  const [search, setSearch] = useState('')
  const [showPost, setShowPost] = useState(false)
  const [amount, setAmount] = useState(10)
  const [message, setMessage] = useState('')
  const [postLoading, setPostLoading] = useState(false)
  const [fulfilling, setFulfilling] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const filtered = requests.filter(r =>
    r.requester.username.toLowerCase().includes(search.toLowerCase())
  )

  function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  async function postRequest() {
    setPostLoading(true)
    setError('')
    const res = await fetch('/api/alms/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goldAmount: amount, message: message.trim() || null }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setPostLoading(false)
      return
    }
    setShowPost(false)
    setMessage('')
    setAmount(10)
    router.refresh()
    setPostLoading(false)
  }

  async function fulfill(requestId: string, requestAmount: number) {
    setError('')
    setFulfilling(requestId)
    const res = await fetch('/api/alms/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
    } else {
      router.refresh()
    }
    setFulfilling(null)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div style={{ isolation: 'isolate', backgroundColor: '#EEEDE4' }} className="mb-3">
            <img src="/icons/alms.png" alt="" width={160} height={160} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <h1 className="font-serif text-3xl font-bold">The Alms</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">
            Give gold, earn honour
          </p>
        </div>
        <button
          onClick={() => { setShowPost(true); setError('') }}
          className="bg-[#111] text-white font-sans text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#333] transition-colors mt-1"
        >
          Request Alms
        </button>
      </div>

      <p className="font-mono text-[11px] text-[#888] mb-4">
        Your balance: <span className="text-[#111] font-medium">{currentUser.gold_balance} gold</span>
      </p>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by player name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa]"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-[#993C1D] mb-4">{error}</p>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="font-mono text-xs text-[#888] text-center py-12">
            {search ? 'No requests from that player.' : 'No open requests. Be the first to ask.'}
          </p>
        )}
        {filtered.map(req => {
          const isOwn = req.requester.id === currentUser.id
          const canAfford = currentUser.gold_balance >= req.gold_amount
          return (
            <div
              key={req.id}
              className="border border-[#d8d4cc] rounded-xl p-4 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={req.requester.display_initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-sans text-sm font-medium">{req.requester.username}</span>
                    {req.requester.player_number !== null && (
                      <span className="font-mono text-[10px] text-[#bbb]">#{req.requester.player_number}</span>
                    )}
                    <span className="font-mono text-[10px] text-[#ccc] ml-auto">{timeAgo(req.created_at)}</span>
                  </div>
                  {req.message && (
                    <p className="font-sans text-sm text-[#666] mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0ede6]">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold">{req.gold_amount}</span>
                  <span className="font-mono text-[11px] text-[#888] uppercase tracking-widest">gold</span>
                </div>
                {isOwn ? (
                  <span className="font-mono text-[11px] text-[#bbb] uppercase tracking-widest">Your request</span>
                ) : (
                  <button
                    onClick={() => fulfill(req.id, req.gold_amount)}
                    disabled={!canAfford || fulfilling === req.id}
                    className={`font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-all active:scale-[0.97] ${
                      canAfford
                        ? 'bg-[#3B6D11] text-white hover:bg-[#2d5309]'
                        : 'bg-[#f0ede6] text-[#bbb] cursor-not-allowed'
                    }`}
                  >
                    {fulfilling === req.id
                      ? 'Giving…'
                      : canAfford
                        ? `Give ${req.gold_amount}`
                        : 'Not enough gold'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white border border-[#d8d4cc] rounded-[12px] w-full max-w-sm p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl">Request Alms</h2>
              <button onClick={() => setShowPost(false)} className="font-mono text-lg text-[#888] hover:text-[#111]">×</button>
            </div>

            <div className="mb-4">
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-2">
                Amount (1–100 gold)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={100} value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="flex-1 accent-[#111]"
                />
                <span className="font-serif text-2xl font-bold w-12 text-right">{amount}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-1">
                Message{' '}
                <span className="normal-case tracking-normal font-sans text-[#ccc]">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 200))}
                placeholder="Why do you seek alms?"
                rows={3}
                className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa] resize-none"
              />
              <p className="font-mono text-[10px] text-[#ccc] text-right mt-0.5">{message.length}/200</p>
            </div>

            {error && <p className="font-mono text-xs text-[#993C1D] mb-3">{error}</p>}

            <button
              onClick={postRequest}
              disabled={postLoading}
              className="w-full bg-[#111] text-white font-sans text-sm font-medium py-2.5 rounded-lg disabled:opacity-50 hover:bg-[#333] transition-colors"
            >
              {postLoading ? 'Posting…' : 'Post Request'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
