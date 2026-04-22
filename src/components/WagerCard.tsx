'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import type { WagerWithUser, SpectatableDuel } from '@/types/database'

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function formatTimer(mins: number) {
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return `${mins / 60}h`
  return `${mins / 1440}d`
}

function CoinIcon() {
  return (
    <img
      src="/icons/coin.png"
      alt=""
      className="w-[18px] h-[18px] object-contain flex-shrink-0"
      style={{ mixBlendMode: 'multiply' }}
    />
  )
}

export function AFootCard({ duel }: { duel: SpectatableDuel }) {
  const router = useRouter()
  return (
    <div className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all h-full">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <Avatar initials={duel.poster.display_initials} size="sm" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-amber-700 border border-amber-200 rounded px-1 whitespace-nowrap">Afoot</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <CoinIcon />
          <div className="text-right">
            <span className="font-fell text-2xl leading-none">{duel.goldAmount}</span>
            <span className="font-mono text-[10px] text-[#888] block">gold</span>
          </div>
        </div>
      </div>
      <p className="font-fell text-sm mb-1">{duel.poster.username}</p>
      <p className="font-mono text-[10px] text-[#888] mb-3">{duel.p1.username} vs {duel.p2.username}</p>
      <button onClick={() => router.push(`/spectate/${duel.duelId}`)} className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#888] hover:bg-[#f0ede6] transition-colors">Spectate &rarr;</button>
    </div>
  )
}

export function WagerCard({ wager, isNewest, currentUserId, isLoggedIn }: {
  wager: WagerWithUser; isNewest: boolean; currentUserId: string | null; isLoggedIn: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const challengingRef = useRef(false)
  const isOwn = currentUserId === wager.users.id

  async function handleChallenge(e: React.MouseEvent) {
    e.stopPropagation()
    if (challengingRef.current) return
    challengingRef.current = true
    if (!isLoggedIn) { router.push('/login'); challengingRef.current = false; return }
    setLoading(true)
    try {
      const res = await fetch('/api/accept-wager', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wagerId: wager.id }) })
      const data = await res.json()
      if (data.duelId) router.push(`/duel/${data.duelId}`)
      else alert(data.error || 'Could not accept wager')
    } finally { setLoading(false); challengingRef.current = false }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation()
    const url = `${window.location.origin}/wager/${wager.id}`
    const text = wager.wager_message
      ? `⚔️ PACT — ${wager.gold_amount} Gold\n"${wager.wager_message}"\nDo you dare accept?`
      : `⚔️ PACT — ${wager.gold_amount} Gold\nI've posted a challenge. Do you dare accept?`
    if (navigator.share) {
      try { await navigator.share({ title: 'PACT Challenge', text, url }); return } catch {}
    }
    await navigator.clipboard.writeText(`${text}\n${url}`)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  return (
    <div className={`bg-[#f5f3ea] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all h-full flex flex-col ${isNewest ? 'border-2 border-[#1a1208]' : 'border border-[#d8d4cc]'}`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <Avatar initials={wager.users.display_initials} size="sm" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888] border border-[#d8d4cc] rounded px-1 whitespace-nowrap">Open</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isOwn && (
            <button
              onClick={handleShare}
              title="Share this challenge"
              className="font-mono text-[11px] text-[#bbb] hover:text-[#555] transition-colors leading-none"
            >
              {shareCopied ? '✓' : '↑'}
            </button>
          )}
          <div className="flex items-center gap-1">
            <CoinIcon />
            <div className="text-right">
              <span className="font-fell text-2xl leading-none">{wager.gold_amount}</span>
              <span className="font-mono text-[10px] text-[#888] block">gold</span>
            </div>
          </div>
        </div>
      </div>
      <p className="font-fell text-sm mb-1">{wager.users.username}</p>
      {wager.wager_message ? (
        <p className="font-mono text-[10px] text-[#555] mb-3 italic leading-relaxed flex-1">&ldquo;{wager.wager_message}&rdquo;</p>
      ) : (
        <p className="font-mono text-[10px] text-[#888] mb-3 flex-1">posted {timeAgo(wager.created_at)} &middot; {formatTimer(wager.timer_minutes)}</p>
      )}
      {isOwn ? (
        <div className="space-y-2">
          <div className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#bbb] text-center uppercase tracking-widest">Awaiting challenger</div>
          <button
            onClick={handleShare}
            className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#888] hover:bg-[#f0ede6] transition-colors"
          >
            {shareCopied ? 'Link copied ✓' : 'Share challenge ↑'}
          </button>
        </div>
      ) : !isLoggedIn ? (
        <Link href="/login" className="block w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#888] text-center hover:bg-[#f0ede6] transition-colors">Sign in to challenge &rarr;</Link>
      ) : (
        <button onClick={handleChallenge} disabled={loading} className="w-full border border-[#1a1208] rounded-lg py-2 font-mono text-[11px] hover:bg-[#1a1208] hover:text-[#EEEDE4] transition-colors active:scale-[0.97] disabled:opacity-50">
          {loading ? 'Starting…' : 'Challenge →'}
        </button>
      )}
    </div>
  )
}
