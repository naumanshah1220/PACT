'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { UserRow } from '@/types/database'

function DuelRow({ duel, userId }: { duel: any; userId: string }) {
  const isP1 = duel.player1_id === userId
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
          <p className="font-fell text-sm">{opp.username}</p>
          <p className="font-mono text-[10px] text-[#888]">{outcome?.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="font-fell text-base text-[#1a1208]">
          {won ? '+' : lost ? '-' : ''}{stake}
        </span>
        <span className="font-mono text-[10px] text-[#888] block">gold</span>
      </div>
    </div>
  )
}

export default function ProfileClient({ profile, duels }: { profile: UserRow; duels: any[] }) {
  const [tab, setTab] = useState<'duels' | 'share'>('duels')
  const [honorific, setHonorific] = useState<'Sir' | 'Lady' | null>(profile.honorific ?? null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleHonorificChange(value: string) {
    const next = value === '' ? null : (value as 'Sir' | 'Lady')
    setHonorific(next)
    await supabase.from('users').update({ honorific: next }).eq('id', profile.id)
  }

  const shareText = `I have ${profile.gold_balance} Gold and an honour score of ${profile.honor_score} on PACT. Come challenge me.`

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar initials={profile.display_initials} size="lg" />
          <div className="flex-1">
            <h1 className="font-fell text-2xl">{profile.username}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {profile.player_number !== null && profile.player_number !== undefined && (
                <span className="font-mono text-[11px] text-[#bbb]">#{profile.player_number}</span>
              )}
              <select
                value={honorific ?? ''}
                onChange={e => handleHonorificChange(e.target.value)}
                className="font-mono text-[10px] text-[#888] bg-transparent border border-[#d8d4cc] rounded px-1.5 py-0.5 outline-none cursor-pointer hover:border-[#1a1208] transition-colors"
              >
                <option value="">No title</option>
                <option value="Sir">Sir</option>
                <option value="Lady">Lady</option>
              </select>
            </div>
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
            <p className="font-fell text-3xl">
              <span className="text-amber-600 mr-1">⬡</span>{profile.gold_balance}
            </p>
          </div>
          <div className="w-px bg-[#d8d4cc]" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#888] mb-1">Honour</p>
            <p className="font-fell text-3xl">{profile.honor_score}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['duels', 'share'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full border transition-colors ${
              tab === t ? 'bg-[#1a1208] text-[#EEEDE4] border-[#1a1208]' : 'text-[#888] border-[#d8d4cc] hover:bg-[#f0ede6]'
            }`}
          >
            {t === 'duels' ? 'My Duels' : 'Share'}
          </button>
        ))}
      </div>

      {tab === 'duels' ? (
        <div className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] px-4">
          {duels.length === 0 ? (
            <p className="font-mono text-xs text-[#888] text-center py-8">No completed duels yet.</p>
          ) : (
            duels.map(d => <DuelRow key={d.id} duel={d} userId={profile.id} />)
          )}
        </div>
      ) : (
        <div className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] p-6">
          <p className="font-mono text-sm text-[#888] mb-4">{shareText}</p>
          <button
            onClick={() => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
            className="border border-[#1a1208] rounded-xl px-5 py-2.5 font-mono text-sm hover:bg-[#f0ede6] transition-colors"
          >
            Share on ⧯
          </button>
        </div>
      )}
    </main>
  )
}
