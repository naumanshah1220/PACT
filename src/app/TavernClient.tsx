'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import PostChallengeModal from '@/components/PostChallengeModal'
import type { WagerWithUser, UserRow, SpectatableDuel } from '@/types/database'

type FilterType = 'all' | 'under10' | '10to50' | '50plus' | 'quick' | 'long' | 'practice'

interface ActiveDuelInfo {
  id: string
  deadline: string
  opponent: { username: string; display_initials: string }
}

interface Props {
  initialWagers: WagerWithUser[]
  currentUser: UserRow | null
  hoardBalance: number
  activeDuels: ActiveDuelInfo[]
  spectatableDuels: SpectatableDuel[]
}

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

function timeLeft(deadline: string) {
  const remaining = Math.max(0, new Date(deadline).getTime() - Date.now())
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

function ActiveDuelCard({ info }: { info: ActiveDuelInfo }) {
  return (
    <Link
      href={`/duel/${info.id}`}
      className="block border border-[#1a1208] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Your active duel</span>
        <span className="font-mono text-[10px] text-[#888]">{timeLeft(info.deadline)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Avatar initials={info.opponent.display_initials} size="sm" />
        <span className="font-fell text-sm">vs {info.opponent.username}</span>
      </div>
      <p className="font-mono text-[10px] text-[#888] mt-2 text-right">Enter duel room →</p>
    </Link>
  )
}

function SpectatableCard({ duel }: { duel: SpectatableDuel }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/spectate/${duel.duelId}`)}
      className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-700">● Afoot</span>
        <span className="font-mono text-[10px] text-[#888]">
          <span className="text-amber-600">⬡</span> {duel.goldAmount}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Avatar initials={duel.p1.display_initials} size="sm" />
        <span className="font-mono text-[10px] text-[#888]">vs</span>
        <Avatar initials={duel.p2.display_initials} size="sm" />
        <span className="font-fell text-sm ml-1">{duel.p1.username} vs {duel.p2.username}</span>
      </div>
      <p className="font-mono text-[10px] text-[#888] mt-2 text-right">Observe →</p>
    </div>
  )
}

function WagerCard({
  wager, index, isNewest, currentUserId, isLoggedIn,
}: {
  wager: WagerWithUser
  index: number
  isNewest: boolean
  currentUserId: string | null
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const isOwn = currentUserId === wager.users.id
  const isPractice = wager.practice

  async function handleChallenge() {
    // Real wagers: redirect to login if not signed in
    if (!isLoggedIn && !isPractice) { router.push('/login'); return }

    setLoading(true)
    try {
      // Practice wagers: silently sign in anonymously if needed
      if (!isLoggedIn && isPractice) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) { alert('Could not start practice session'); return }
      }

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
    <div
      className={`bg-[#f5f3ea] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all ${
        isNewest ? 'border-2 border-[#1a1208]' : 'border border-[#d8d4cc]'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar initials={wager.users.display_initials} size="sm" />
          {isPractice && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888] border border-[#d8d4cc] rounded px-1">Practice</span>
          )}
        </div>
        <div className="text-right">
          <span className="font-fell text-2xl leading-none">{wager.gold_amount}</span>
          <span className="font-mono text-[10px] text-[#888] block">gold</span>
        </div>
      </div>

      <p className="font-fell text-sm mb-1">{wager.users.username}</p>
      <p className="font-mono text-[10px] text-[#888] mb-3">
        posted {timeAgo(wager.created_at)} &middot; timer: {formatTimer(wager.timer_minutes)}
      </p>

      {isOwn ? (
        <div className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#bbb] text-center uppercase tracking-widest">
          Awaiting challenger
        </div>
      ) : !isLoggedIn && !isPractice ? (
        <Link
          href="/login"
          className="block w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#888] text-center hover:bg-[#f0ede6] transition-colors"
        >
          Sign in to challenge →
        </Link>
      ) : (
        <button
          onClick={handleChallenge}
          disabled={loading}
          className="w-full border border-[#1a1208] rounded-lg py-2 font-mono text-[11px] hover:bg-[#1a1208] hover:text-[#EEEDE4] transition-colors active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? 'Starting…' : isPractice ? 'Practice →' : 'Challenge →'}
        </button>
      )}
    </div>
  )
}

export default function TavernClient({ initialWagers, currentUser, hoardBalance, activeDuels, spectatableDuels }: Props) {
  const supabase = createClient()
  const [wagers, setWagers] = useState<WagerWithUser[]>(initialWagers)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('tavern-wagers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wagers' }, async (payload) => {
        const { data } = await supabase.from('wagers').select('*, users(*)').eq('id', payload.new.id).single()
        if (data) setWagers(prev => [data as WagerWithUser, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wagers' }, (payload) => {
        if (payload.new.status !== 'open') setWagers(prev => prev.filter(w => w.id !== payload.new.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = useMemo(() => {
    let w = wagers
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      w = w.filter(x => x.users.username.toLowerCase().includes(q))
    }
    switch (filter) {
      case 'under10': return w.filter(x => x.gold_amount < 10)
      case '10to50': return w.filter(x => x.gold_amount >= 10 && x.gold_amount <= 50)
      case '50plus': return w.filter(x => x.gold_amount > 50)
      case 'quick': return w.filter(x => x.timer_minutes < 60)
      case 'long': return w.filter(x => x.timer_minutes >= 720)
      case 'practice': return w.filter(x => x.practice)
      default: return w
    }
  }, [wagers, filter, search])

  const isFiltered = filter !== 'all' || search.trim() !== ''
  const newestId = filtered[0]?.id ?? null
  const isLoggedIn = !!currentUser

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'under10', label: 'Under 10' },
    { key: '10to50', label: '10–50' },
    { key: '50plus', label: '50+' },
    { key: 'quick', label: 'Quick (<1h)' },
    { key: 'long', label: 'Long (12h+)' },
    { key: 'practice', label: 'Practice' },
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 border border-[#d8d4cc] rounded-full px-3 py-1.5">
          <span className="text-amber-600">⬡</span>
          <span className="font-fell text-sm">{currentUser?.gold_balance ?? '—'}</span>
          <span className="font-mono text-[10px] text-[#888]">Gold</span>
        </div>
        {currentUser ? (
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1a1208] text-[#EEEDE4] font-mono text-[11px] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity"
          >
            + Post challenge
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-[#1a1208] text-[#EEEDE4] font-mono text-[11px] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity"
          >
            Sign in to play
          </Link>
        )}
      </div>

      {activeDuels.length > 0 && (
        <div className="mb-5 space-y-2">
          {activeDuels.map(info => <ActiveDuelCard key={info.id} info={info} />)}
        </div>
      )}

      {spectatableDuels.length > 0 && (
        <div className="mb-5">
          <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-3">Duels in Progress</p>
          <div className="grid grid-cols-2 gap-3">
            {spectatableDuels.map(d => <SpectatableCard key={d.duelId} duel={d} />)}
          </div>
        </div>
      )}

      <div className="sticky top-[57px] z-40 bg-[#EEEDE4] pb-3 pt-1">
        <input
          type="text"
          placeholder="Search by player name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#f5f3ea] font-mono text-[11px] mb-2 focus:outline-none focus:border-[#aaa]"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map(f => (
            <button
              key={f.key} onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap font-mono text-[11px] px-3 py-1 rounded-full border transition-colors ${
                filter === f.key ? 'bg-[#1a1208] text-[#EEEDE4] border-[#1a1208]' : 'text-[#888] border-[#d8d4cc] hover:bg-[#f0ede6]'
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-4">
        Open Challenges<span className="cursor-blink ml-0.5">_</span>
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-[#888]">No challenges found.</p>
        </div>
      ) : isFiltered || filtered.length < 4 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((w, i) => (
            <WagerCard key={w.id} wager={w} index={i} isNewest={w.id === newestId} currentUserId={currentUser?.id ?? null} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      ) : (
        <div className="tavern-scroll-container h-[560px]">
          <div className="tavern-scroll-track grid grid-cols-2 gap-3">
            {[...filtered, ...filtered, ...filtered].map((w, i) => (
              <WagerCard key={`${w.id}-${i}`} wager={w} index={i % filtered.length} isNewest={w.id === newestId} currentUserId={currentUser?.id ?? null} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-4 justify-center">
        {[{ href: '/nobles', label: 'Nobles' }, { href: '/honors', label: 'Honors' }, { href: '/alms', label: 'Alms' }].map(l => (
          <Link key={l.href} href={l.href} className="font-mono text-[11px] tracking-widest uppercase text-[#888] hover:text-[#111] transition-colors">{l.label}</Link>
        ))}
      </div>

      {showModal && currentUser && (
        <PostChallengeModal currentUser={currentUser} onClose={() => setShowModal(false)} />
      )}
    </main>
  )
}
