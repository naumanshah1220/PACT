'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import type { UserRow } from '@/types/database'

interface Donation {
  id: string
  donor: { username: string; display_initials: string }
  recipient: { username: string; display_initials: string }
  gold_amount: number
  created_at: string
}

interface Player {
  id: string
  username: string
  display_initials: string
  gold_balance: number
}

interface Props {
  currentUser: UserRow
  donations: Donation[]
  players: Player[]
}

export default function AlmsClient({ currentUser, donations, players }: Props) {
  const [showDonate, setShowDonate] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDonate() {
    if (!recipientId) { setError('Select a recipient'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, goldAmount: amount }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setShowDonate(false)
    router.refresh()
  }

  function timeAgo(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">The Alms</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">
            Give gold, earn honour
          </p>
        </div>
        <button
          onClick={() => setShowDonate(true)}
          className="bg-[#111] text-white font-sans text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#333] transition-colors"
        >
          Donate Gold
        </button>
      </div>

      {/* Donation feed */}
      <div className="space-y-0">
        {donations.length === 0 && (
          <p className="font-mono text-xs text-[#888] text-center py-12">No donations yet. Be the first.</p>
        )}
        {donations.map(d => (
          <div key={d.id} className="flex items-center gap-3 py-3 border-b border-[#f0ede6]">
            <Avatar initials={d.donor.display_initials} size="sm" />
            <div className="flex-1">
              <p className="font-sans text-sm">
                <span className="font-medium">{d.donor.username}</span>
                <span className="text-[#888]"> gave </span>
                <span className="font-serif font-bold">{d.gold_amount}</span>
                <span className="text-[#888]"> to </span>
                <span className="font-medium">{d.recipient.username}</span>
              </p>
            </div>
            <span className="font-mono text-[10px] text-[#bbb]">{timeAgo(d.created_at)}</span>
          </div>
        ))}
      </div>

      {/* Donate modal */}
      {showDonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white border border-[#d8d4cc] rounded-[12px] w-full max-w-sm p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl">Donate Gold</h2>
              <button onClick={() => setShowDonate(false)} className="font-mono text-lg text-[#888]">×</button>
            </div>

            <div className="mb-4">
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-2">Recipient</label>
              <select
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none"
              >
                <option value="">Select player…</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.username} ({p.gold_balance} gold)</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-2">
                Amount (max {currentUser.gold_balance})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={currentUser.gold_balance} value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="flex-1 accent-[#111]"
                />
                <span className="font-serif text-2xl font-bold w-10 text-right">{amount}</span>
              </div>
            </div>

            <p className="font-mono text-[10px] text-[#3B6D11] mb-4">
              You earn +{Math.floor(amount * 0.1)} honour for this donation.
            </p>

            {error && <p className="font-mono text-xs text-[#993C1D] mb-3">{error}</p>}

            <button
              onClick={handleDonate} disabled={loading}
              className="w-full bg-[#111] text-white font-sans text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Donating…' : `Give ${amount} Gold`}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
