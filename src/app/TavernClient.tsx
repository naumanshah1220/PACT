'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import PostChallengeModal from '@/components/PostChallengeModal'
import type { WagerWithUser, UserRow } from '@/types/database'

type FilterType = 'all' | 'under10' | '10to50' | '50plus' | 'quick' | 'long'

interface ActiveDuel {
  id: string
  player1_id: string
  player2_id: string
  deadline: string
  wagers: { gold_amount: number }
  player1: { username: string; display_initials: string }
  player2: { username: string; display_initials: string }
}

interface Props {
  initialWagers: WagerWithUser[]
  currentUser: UserRow | null
  hoardBalance: number
  activeDuels: ActiveDuel[]
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

function ActiveDuelCard({ duel, currentUserId }: { duel: ActiveDuel; currentUserId: string }) {
  const isP1 = duel.player1_id === currentUserId
  const opponent = isP1 ? duel.player2 : duel.player1
  const remaining = Math.max(0, new Date(duel.deadline).getTime() - Date.now())
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const timeLeft = h > 0 ? `${h}h ${m}m left` : `${m}m left`

  return (
    <Link
      href={`/duel/${duel.id}`}
      className="bg-white border-2 border-[#3B6D11] rounded-[12px] p-4 flex items-center justify-between hover:shadow-sm transition-shadow animate-fade-up"
    >
      <div className="flex items-center gap-3">
        <Avatar initials={opponent.display_initials} size="sm" />
        <div>
          <p className="font-sans text-sm font-medium">vs {opponent.username}</p>
          <p className="font-mono text-[10px] text-[#888]">{timeLeft} · {duel.wagers.gold_amount} gold</p>
        </div>
      </div>
      <span className="font-mono text-xs text-[#3B6D11]">Enter →</span>
    </Link>
  )
}

function WagerCard({ wager, currentUserId, index }: { wager: WagerWithUser; currentUserId: string | null; index: number }) {
  const router = useRouter()
  const isOwn = currentUserId === wager.poster_id

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
      className="bg-white border border-[#d8d4cc] rounded-[12px] p-4 hover:shadow-sm transition-shadow animate-fade-up"
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
        posted {timeAgo(wager.created_at)} · timer: {formatTimer(wager.timer_minutes)}
      </p>

      {isOwn ? (
        <div className="w-full border border-[#d8d4cc] rounded-lg py-2 text-center font-mono text-[11px] text-[#bbb]">
          Your challenge — awaiting opponent
        </div>
      ) : (
        <button
          onClick={handleChallenge}
          className="w-full border border-[#d8d4cc] rounded-lg py-2 font-sans text-sm font-medium hover:bg-[#f0ede6] transition-colors"
        >
          Challenge →
        </button>
      )}
    </div>
  )
}

export default function TavernClient({ initialWagers, currentUser, hoardBalance, activeDuels }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = useMemo(() => {
    let w = initialWagers
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
  }, [initialWagers, filter, search])

  const isFiltered = filter !== 'all' || search.trim() !== ''

  // Only use the scroll animation with enough cards to make a seamless loop
  const useScroll = !isFiltered && filtered.length >= 4

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

      {/* Active duels — shown to logged in users */}
      {activeDuels.length > 0 && (
        <div className="mb-6">
          <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-2">Your Active Duels</p>
          <div className="space-y-2">
            {activeDuels.map(d => (
              <ActiveDuelCard key={d.id} duel={d} currentUserId={currentUser!.id} />
            ))}
          </div>
        </div>
      )}

      {/* Hoard announcement */}
      {hoardBalance < 100 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <p className="font-mono text-[11px] text-amber-700">
            ⬡ The Hoard has been refilled with 200 Gold.
          </p>
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
        <div className="flex gap-1.5 overflow-x-auto pb-1">
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

      {/* Section label */}
      <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-4">
        Open Challenges
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-[#888]">No challenges found.</p>
        </div>
      ) : useScroll ? (
        <div className="tavern-scroll-container h-[560px]">
          <div className="tavern-scroll-track grid grid-cols-2 gap-3">
            {[...filtered, ...filtered].map((w, i) => (
              <WagerCard key={`${w.id}-${i}`} wager={w} currentUserId={currentUser?.id ?? null} index={i % filtered.length} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((w, i) => (
            <WagerCard key={w.id} wager={w} currentUserId={currentUser?.id ?? null} index={i} />
          ))}
        </div>
      )}

      {/* Links */}
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

      {showModal && currentUser && (
        <PostChallengeModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}
