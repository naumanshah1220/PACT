'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import type { WagerWithUser } from '@/types/database'

function formatTimer(mins: number) {
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return `${mins / 60}h`
  return `${mins / 1440}d`
}

export default function WagerAcceptClient({
  wager,
  currentUserId,
}: {
  wager: WagerWithUser
  currentUserId: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isOwn = currentUserId === wager.poster_id
  const isClosed = wager.status !== 'open'
  const redirectPath = `/wager/${wager.id}`

  async function handleAccept() {
    if (loading || !currentUserId) return
    setLoading(true)
    try {
      const res = await fetch('/api/accept-wager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wagerId: wager.id }),
      })
      const data = await res.json()
      if (data.duelId) router.push(`/duel/${data.duelId}`)
      else alert(data.error || 'Could not accept wager')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-[#f5f3ea] border-2 border-[#1a1208] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Avatar initials={wager.users.display_initials} size="sm" />
            <span className="font-fell text-xl">{wager.users.username}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <img src="/icons/coin.png" alt="" className="w-[18px] h-[18px] object-contain" style={{ mixBlendMode: 'multiply' }} />
            <span className="font-fell text-3xl leading-none">{wager.gold_amount}</span>
            <span className="font-mono text-[10px] text-[#888]"> gold</span>
          </div>
        </div>

        {wager.wager_message && (
          <p className="font-mono text-sm text-[#555] italic mb-4 leading-relaxed border-l-2 border-[#d8d4cc] pl-3">
            &ldquo;{wager.wager_message}&rdquo;
          </p>
        )}

        <p className="font-mono text-[10px] text-[#888]">⏱ {formatTimer(wager.timer_minutes)} to decide</p>
      </div>

      <p className="font-fell text-3xl mb-2 leading-tight">Will you honour the pact?</p>
      <p className="font-mono text-xs text-[#888] mb-8 leading-relaxed">
        Both players wager {wager.gold_amount} Gold. You negotiate, then simultaneously choose:{' '}
        <strong>Pledge</strong> or <strong>Betray</strong>. No take-backs. The seal decides all.
      </p>

      {isClosed ? (
        <div className="border border-[#d8d4cc] rounded-xl px-6 py-4 font-mono text-sm text-center text-[#bbb] mb-6">
          This challenge has already been accepted.
        </div>
      ) : isOwn ? (
        <div className="border border-[#d8d4cc] rounded-xl px-6 py-4 font-mono text-sm text-center text-[#bbb] mb-6">
          This is your own challenge. Awaiting a challenger.
        </div>
      ) : currentUserId ? (
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-[#1a1208] text-[#EEEDE4] rounded-xl px-6 py-3.5 font-mono text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mb-4"
        >
          {loading ? 'Starting duel…' : 'Accept Challenge →'}
        </button>
      ) : (
        <div className="space-y-3 mb-6">
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
            className="block w-full bg-[#1a1208] text-[#EEEDE4] rounded-xl px-6 py-3.5 font-mono text-sm text-center hover:opacity-90 transition-opacity"
          >
            Sign up to accept →
          </Link>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="block w-full border border-[#1a1208] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      )}

      <Link href="/" className="block text-center font-mono text-[11px] text-[#888] hover:text-[#111] mt-2">
        Browse all open challenges →
      </Link>
    </main>
  )
}
