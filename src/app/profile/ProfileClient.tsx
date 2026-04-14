'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { UserRow, DuelWithUsers } from '@/types/database'

function DuelRow({ duel, userId }: { duel: any; userId: string }) {
  const isP1 = duel.player1_id === userId
  const me = isP1 ? duel.player1 : duel.player2
  const opp = isP1 ? duel.player2 : duel.player1
  const stake = duel.wagers.gold_amount
  const outcome = duel.outcome

  const won = (
    (outcome === 'both_pledge') ||
    (outcome === 'p1_betray' && isP1) ||
    (outcome === 'p2_betray' && !isP1) ||
    (outcome === 'p1_silent' && !isP1) ||
    (outcome === 'p2_silent' && isP1)
  )
  const lost = (
    (outcome === 'both_betray') ||
    (outcome === 'p1_betray' && !isP1) ||
    (outcome === 'p2_betray' && isP1) ||
    (outcome === 'p1_silent' && isP1) ||
    (outcome === 'p2_silent' && !isP1) ||
    (outcome === 'both_silent')
  )

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0ede6]">
      <div className="flex items-center gap-2">
        <Avatar initials={opp.display_initials} size="sm" />
        <div>
          <p className="font-sans text-sm font-medium">{opp.username}</p>
          <p className="font-mono text-[10px] text-[#888]">{outcome?.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-serif text-base font-bold ${
          won ? 'text-[#3B6D11]' : lost ? 'text-[#993C1D]' : 'text-[#888]'
        }`}>
          {won ? '+' : lost ? '-' : ''}{stake}
        </span>
        <span className="font-mono text-[10px] text-[#888] block">gold</span>
      </div>
    </div>
  )
}

export default function ProfileClient({ profile, duels }: { profile: UserRow; duels: any[] }) {
  const [tab, setTab] = useState<'duels' | 'share'>('duels')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const shareText = `I have ${profile.gold_balance} Gold and an honour score of ${profile.honor_score} on PACT. Come challenge me.`

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white border border-[#d8d4cc] rounded-[12px] p-6 mb-6 animate-fade-up">
        <div className="flex items-center gap-4">
          <Avatar initials={profile.display_initials} size="lg" />
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold">{profile.username}</h1>
            <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest mt-0.5">
              Day {profile.newbie_day} adventurer
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="font-mono text-[11px] text-[#888] hover:text-[#111] border border-[#d8d4cc] rounded-full px-3 py-1"
          >
            Sign out
          </button>
        </div>

        <div className="mt-5 flex gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#888] mb-1">Gold</p>
            <p className="font-serif text-3xl font-bold">
              <span className="text-amber-600 mr-1">⬡</span>{profile.gold_balance}
            </p>
          </div>
          <div className="w-px bg-[#d8d4cc]" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#888] mb-1">Honour</p>
            <p className="font-serif text-3xl font-bold">{profile.honor_score}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-4">
        {(['duels', 'share'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full border transition-colors ${
              tab === t ? 'bg-[#111] text-white border-[#111]' : 'text-[#888] border-[#d8d4cc] hover:bg-white'
            }`}
          >
            {t === 'duels' ? 'My Duels' : 'Share'}
          </button>
        ))}
      </div>

      {tab === 'duels' ? (
        <div className="bg-white border border-[#d8d4cc] rounded-[12px] px-4">
          {duels.length === 0 ? (
            <p className="font-mono text-xs text-[#888] text-center py-8">No completed duels yet.</p>
          ) : (
            duels.map(d => <DuelRow key={d.id} duel={d} userId={profile.id} />)
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#d8d4cc] rounded-[12px] p-6">
          <p className="font-sans text-sm text-[#444] mb-4">{shareText}</p>
          <button
            onClick={() => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
            className="border border-[#d8d4cc] rounded-xl px-5 py-2.5 font-sans text-sm hover:bg-[#f0ede6] transition-colors"
          >
            Share on ⨯
          </button>
        </div>
      )}
    </main>
  )
}
