'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import PostChallengeModal from '@/components/PostChallengeModal'
import type { WagerWithUser, UserRow } from '@/types/database'

type FilterType = 'all' | 'under10' | '10to50' | '50plus' | 'quick' | 'long'

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
      className="block border-2 border-[#3B6D11] rounded-[12px] p-4 bg-[#3B6D11]/5 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-up"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-[#3B6D11] uppercase tracking-widest">Active duel</span>
        <span className="font-mono text-[10px] text-[#3B6D11]">{timeLeft(info.deadline)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Avatar initials={info.opponent.display_initials} size="sm" />
        <span className="font-sans text-sm font-medium">vs {info.opponent.username}</span>
      </div>
      <p className="font-mono text-[11px] text-[#3B6D11] mt-2 text-right">Enter duel room →</p>
    </Link>
  )
}

function WagerCard({
  wager,
  index,
  isNewest,
  currentUserId,
}: {
  wager: WagerWithUser
  index: number
  isNewest: boolean
  currentUserId: string | null
}) {
  const router = useRouter()
  const isOwn = currentUserId === wager.users.id

  async function handleChallenge() {
    const res = await fetch('/api/accept-wager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wagerId: wager.id }),
    })
    const data = await res.json()
    if (data.duelId) router.push(`/duel/${data.duelId}`)
    else alert(data.error || 'Could not accept wager')
  }

  return (
    <div
      className={`bg-white rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-up ${
        isNewest ? 'border-2 border-[#111]' : 'border border-[#d8d4cc]'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar initials={wager.users.display_initials} size="sm" />
          <span className="font-mono text-[10px] text-[#888]">0{(index % 9) + 1}</span>
        </div>
        <div className="text-right">
          <span className="font-serif text-2xl font-bold leading-none">{wager.gold_amount}</span>
          <span className="font-mono text-[10px] text-[#888] block">gold</span>
        </div>
      </div>

      <p className="font-sans text-sm font-medium mb-1">{wager.users.username}</p>
      <p className="font-mono text-[10px] text-[#888] mb-3">
        posted {timeAgo(wager.created_at)} &middot; timer: {formatTimer(wager.timer_minutes)}
      </p>

      {isOwn ? (
        <div className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#bbb] text-center uppercase tracking-widest">
          Awaiting challenger
        </div>
      ) : (
        <button
          onClick={handleChallenge}
          className="w-full border border-[#d8d4cc] rounded-lg py-2 font-sans text-sm font-medium hover:bg-[#f0ede6] transition-colors active:scale-[0.97]"
        >
          Challenge →
        </button>
      )}
    </div>
  )
}

export default function TavernClient({ initialWagers, currentUser, hoardBalance, activeDuels }: Props) {
  const supabase = createClient()
  const [wagers, setWagers] = useState<WagerWithUser[]>(initialWagers)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Realtime: new wagers appear live, accepted/cancelled wagers disappear
  useEffect(() => {
    const channel = supabase
      .channel('tavern-wagers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'wagers',
      }, async (payload) => {
        const { data } = await supabase
          .from('wagers')
          .select('*, users(*)')
          .eq('id', payload.new.id)
          .single()
        if (data) setWagers(prev => [data as WagerWithUser, ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'wagers',
      }, (payload) => {
        if (payload.new.status !== 'open') {
          setWagers(prev => prev.filter(w => w.id !== payload.new.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = useMemo(() => {
    let w = wagers
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      w = w.filter(x =>
        x.users.username.toLowerCase().includes(q) ||
        x.users.id.toLowerCase().includes(q)
      )
    }
    switch (filter) {
      case 'under10': return w.filter(x => x.gold_amount < 10)
      case '10to50': return w.filter(x => x.gold_amount >= 10 && x.gold_amount <= 50)
      case '50plus': return w.filter(x => x.gold_amount > 50)
      case 'quick': return w.filter(x => x.timer_minutes < 60)
      case 'long': return w.filter(x => x.timer_minutes >= 720)
      default: return w
    }
  }, [wagers, filter, search])

  const isFiltered = filter !== 'all' || search.trim() !== ''
  const newestId = filtered[0]?.id ?? null

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'under10', label: 'Under 10' },
    { key: '10to50', label: '10–50' },
    { key: '50plus', label: '50+' },
    { key: 'quick', label: 'Quick (<1h)' },
    { key: 'long', label: 'Long (12h+)' },
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {/* Nav row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 bg-white border border-[#d8d4cc] rounded-full px-3 py-1.5">
          <span className="text-amber-600">⬡</span>
          <span className="font-serif text-sm font-bold">{currentUser?.gold_balance ?? '—'}</span>
          <span className="font-mono text-[10px] text-[#888]">Gold</span>
        </div>

        {currentUser ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#111] text-white font-sans text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#333] transition-colors"
          >
            <span>+</span> Post challenge
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-[#111] text-white font-sans text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#333] transition-colors"
          >
            Sign in to play
          </Link>
        )}
      </div>

      {/* Hoard announcement */}
      {hoardBalance < 100 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <p className="font-mono text-[11px] text-amber-700">
            ⬡ The Hoard has been refilled with 200 Gold.
          </p>
        </div>
      )}

      {/* Active duels shortcut */}
      {activeDuels.length > 0 && (
        <div className="mb-5 space-y-2">
          {activeDuels.map(info => (
            <ActiveDuelCard key={info.id} info={info} />
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="sticky top-[57px] z-40 bg-[#eae8e1] pb-3 pt-1">
        <input
          type="text"
          placeholder="Search by player name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-white font-sans text-sm mb-2 focus:outline-none focus:border-[#aaa]"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap font-mono text-[11px] px-3 py-1 rounded-full border transition-colors ${
                filter === f.key
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#444] border-[#d8d4cc] hover:bg-[#f0ede6]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section label with blinking cursor */}
      <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-4">
        Open Challenges<span className="cursor-blink ml-0.5">_</span>
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-[#888]">No challenges found.</p>
        </div>
      ) : isFiltered || filtered.length < 4 ? (
        // Static grid when filtered or too few cards
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((w, i) => (
            <WagerCard
              key={w.id}
              wager={w}
              index={i}
              isNewest={w.id === newestId}
              currentUserId={currentUser?.id ?? null}
            />
          ))}
        </div>
      ) : (
        // Auto-scrolling 3x loop when unfiltered and enough cards
        <div className="tavern-scroll-container h-[560px]">
          <div className="tavern-scroll-track grid grid-cols-2 gap-3">
            {[...filtered, ...filtered, ...filtered].map((w, i) => (
              <WagerCard
                key={`${w.id}-${i}`}
                wager={w}
                index={i % filtered.length}
                isNewest={w.id === newestId}
                currentUserId={currentUser?.id ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Links to other pages */}
      <div className="mt-10 flex gap-4 justify-center">
        {[
          { href: '/nobles', label: 'Nobles' },
          { href: '/honors', label: 'Honors' },
          { href: '/alms', label: 'Alms' },
        ].map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="font-mono text-[11px] tracking-widest uppercase text-[#888] hover:text-[#111] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Modal */}
      {showModal && currentUser && (
        <PostChallengeModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}
