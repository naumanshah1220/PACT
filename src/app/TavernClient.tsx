'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import PostChallengeModal from '@/components/PostChallengeModal'
import TutorialModal from '@/components/TutorialModal'
import { WagerCard, AFootCard } from '@/components/WagerCard'
import { BotCard } from '@/components/BotCard'
import type { BotOption } from '@/components/BotCard'
import type { WagerWithUser, UserRow, SpectatableDuel } from '@/types/database'

type FilterType = 'all' | 'under10' | '10to50' | '50plus' | 'quick' | 'long'
type ViewMode = 'list' | 'map'

const PRACTICE_DISPLAY_COUNT = 8
const CARD_W = 260
const GRID_COLS = 4
const MAP_HEIGHT = 600

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
  botOptions: BotOption[]
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
    <Link href={`/duel/${info.id}`} className="block border border-[#1a1208] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Your active duel</span>
        <span className="font-mono text-[10px] text-[#888]">{timeLeft(info.deadline)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Avatar initials={info.opponent.display_initials} size="sm" />
        <span className="font-fell text-sm">vs {info.opponent.username}</span>
      </div>
      <p className="font-mono text-[10px] text-[#888] mt-2 text-right">Enter duel room &rarr;</p>
    </Link>
  )
}

export default function TavernClient({ initialWagers, currentUser, hoardBalance, activeDuels, spectatableDuels, botOptions }: Props) {
  const supabase = createClient()
  const [wagers, setWagers] = useState<WagerWithUser[]>(initialWagers)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [displayedBotIndices, setDisplayedBotIndices] = useState<number[]>(
    () => Array.from({ length: Math.min(PRACTICE_DISPLAY_COUNT, botOptions.length) }, (_, i) => i)
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [gridPos, setGridPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0, moved: false })

  function clampPos(x: number, y: number) {
    const c = containerRef.current, n = innerRef.current
    if (!c || !n) return { x, y }
    return {
      x: Math.min(0, Math.max(c.offsetWidth - n.scrollWidth, x)),
      y: Math.min(0, Math.max(c.offsetHeight - n.scrollHeight, y)),
    }
  }

  function onGrabDown(e: React.PointerEvent) {
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, ox: gridPos.x, oy: gridPos.y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onGrabMove(e: React.PointerEvent) {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (!dragRef.current.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragRef.current.moved = true
      if (innerRef.current) innerRef.current.style.pointerEvents = 'none'
    }
    if (dragRef.current.moved) setGridPos(clampPos(dragRef.current.ox + dx, dragRef.current.oy + dy))
  }

  function onGrabUp() {
    dragRef.current.active = false
    setTimeout(() => {
      if (innerRef.current) innerRef.current.style.pointerEvents = ''
      dragRef.current.moved = false
    }, 50)
  }

  useEffect(() => { setGridPos({ x: 0, y: 0 }) }, [filter, search, viewMode])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pact-bot-slots')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every((n: unknown) => typeof n === 'number' && n < botOptions.length)) {
          setDisplayedBotIndices(parsed.slice(0, PRACTICE_DISPLAY_COUNT))
        }
      }
    } catch {}
    try {
      const v = localStorage.getItem('pact-view-mode')
      if (v === 'list' || v === 'map') setViewMode(v as ViewMode)
    } catch {}
  }, [])

  function setView(v: ViewMode) {
    setViewMode(v)
    try { localStorage.setItem('pact-view-mode', v) } catch {}
  }

  function rotateBotOut(personalityIndex: number) {
    setDisplayedBotIndices(prev => {
      const available = botOptions.map(b => b.personalityIndex).filter(i => !prev.includes(i))
      if (!available.length) return prev
      const replacement = available[Math.floor(Math.random() * available.length)]
      const next = prev.map(i => i === personalityIndex ? replacement : i)
      try { localStorage.setItem('pact-bot-slots', JSON.stringify(next)) } catch {}
      return next
    })
  }

  useEffect(() => {
    const channel = supabase
      .channel('tavern-wagers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wagers' }, async (payload) => {
        const { data } = await supabase.from('wagers').select('*, users(*)').eq('id', payload.new.id).single()
        if (data && !(data as any).users?.is_bot) setWagers(prev => [data as WagerWithUser, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wagers' }, (payload) => {
        if (payload.new.status !== 'open') setWagers(prev => prev.filter(w => w.id !== payload.new.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredWagers = useMemo(() => {
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
      default: return w
    }
  }, [wagers, filter, search])

  const displayedBots = displayedBotIndices.map(i => botOptions[i]).filter(Boolean)

  const filteredBots = useMemo(() => {
    let b = displayedBots
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      b = b.filter(x => x.name.toLowerCase().includes(q))
    }
    switch (filter) {
      case 'under10': return b.filter(x => x.goldAmount < 10)
      case '10to50': return b.filter(x => x.goldAmount >= 10 && x.goldAmount <= 50)
      case '50plus': return b.filter(x => x.goldAmount > 50)
      case 'quick': return b.filter(x => x.timerMinutes < 60)
      case 'long': return b.filter(x => x.timerMinutes >= 720)
      default: return b
    }
  }, [displayedBots, filter, search])

  const filteredSpectatable = useMemo(() => {
    if (!search.trim()) return spectatableDuels
    const q = search.trim().toLowerCase()
    return spectatableDuels.filter(d =>
      d.poster.username.toLowerCase().includes(q) ||
      d.p1.username.toLowerCase().includes(q) ||
      d.p2.username.toLowerCase().includes(q)
    )
  }, [spectatableDuels, search])

  const newestId = filteredWagers[0]?.id ?? null
  const isLoggedIn = !!currentUser

  const listCards = [
    ...filteredSpectatable.map(d => ({ type: 'afoot' as const, data: d })),
    ...filteredWagers.map(w => ({ type: 'wager' as const, data: w })),
  ]

  const mapCards = [
    ...filteredSpectatable.map(d => ({ type: 'afoot' as const, data: d })),
    ...filteredWagers.map(w => ({ type: 'wager' as const, data: w })),
    ...filteredBots.map(b => ({ type: 'bot' as const, data: b })),
  ]

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
      <TutorialModal />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 border border-[#d8d4cc] rounded-full px-3 py-1.5">
          <span className="text-amber-600">⬡</span>
          <span className="font-fell text-sm">{currentUser?.gold_balance ?? '—'}</span>
          <span className="font-mono text-[10px] text-[#888]">Gold</span>
        </div>
        {currentUser ? (
          <button onClick={() => setShowModal(true)} className="bg-[#1a1208] text-[#EEEDE4] font-mono text-[11px] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity">+ Post challenge</button>
        ) : (
          <Link href="/login" className="bg-[#1a1208] text-[#EEEDE4] font-mono text-[11px] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity">Sign in to play</Link>
        )}
      </div>

      {activeDuels.length > 0 && (
        <div className="mb-5 space-y-2">
          {activeDuels.map(info => <ActiveDuelCard key={info.id} info={info} />)}
        </div>
      )}

      <div className="sticky top-[57px] z-40 bg-[#EEEDE4] pb-3 pt-1">
        <input type="text" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#f5f3ea] font-mono text-[11px] mb-2 focus:outline-none focus:border-[#aaa]" />
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`whitespace-nowrap font-mono text-[11px] px-3 py-1 rounded-full border transition-colors ${filter === f.key ? 'bg-[#1a1208] text-[#EEEDE4] border-[#1a1208]' : 'text-[#888] border-[#d8d4cc] hover:bg-[#f0ede6]'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[11px] tracking-widest uppercase text-[#888]">
          {viewMode === 'map' ? 'Tavern map' : 'Challenges'}<span className="cursor-blink ml-0.5">_</span>
        </p>
        <div className="flex gap-1">
          <button onClick={() => setView('list')} className={`px-2.5 py-1 font-mono text-[10px] rounded border transition-colors ${viewMode === 'list' ? 'bg-[#1a1208] text-[#EEEDE4] border-[#1a1208]' : 'text-[#888] border-[#d8d4cc] hover:bg-[#f0ede6]'}`}>List</button>
          <button onClick={() => setView('map')} className={`px-2.5 py-1 font-mono text-[10px] rounded border transition-colors ${viewMode === 'map' ? 'bg-[#1a1208] text-[#EEEDE4] border-[#1a1208]' : 'text-[#888] border-[#d8d4cc] hover:bg-[#f0ede6]'}`}>Map</button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {listCards.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-sm text-[#888]">No open challenges.</p>
            </div>
          ) : listCards.map(card =>
            card.type === 'afoot' ? (
              <AFootCard key={card.data.duelId} duel={card.data} />
            ) : (
              <WagerCard
                key={(card.data as WagerWithUser).id}
                wager={card.data as WagerWithUser}
                isNewest={(card.data as WagerWithUser).id === newestId}
                currentUserId={currentUser?.id ?? null}
                isLoggedIn={isLoggedIn}
              />
            )
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-[12px] border border-[#d8d4cc] select-none touch-none ${mapCards.length === 0 ? '' : 'cursor-grab active:cursor-grabbing'}`}
          style={{
            height: mapCards.length === 0 ? 'auto' : MAP_HEIGHT,
            backgroundColor: '#eae6da',
            backgroundImage: 'radial-gradient(circle, #d8d4cc 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          onPointerDown={mapCards.length > 0 ? onGrabDown : undefined}
          onPointerMove={mapCards.length > 0 ? onGrabMove : undefined}
          onPointerUp={mapCards.length > 0 ? onGrabUp : undefined}
          onPointerCancel={mapCards.length > 0 ? onGrabUp : undefined}
        >
          {mapCards.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-sm text-[#888]">Nothing matches your filters.</p>
            </div>
          ) : (
            <>
              <div
                ref={innerRef}
                className="absolute p-4 grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, ${CARD_W}px)`,
                  transform: `translate(${gridPos.x}px, ${gridPos.y}px)`,
                  willChange: 'transform',
                }}
              >
                {mapCards.map(card =>
                  card.type === 'afoot' ? (
                    <AFootCard key={card.data.duelId} duel={card.data} />
                  ) : card.type === 'bot' ? (
                    <BotCard key={`bot-${card.data.personalityIndex}`} bot={card.data} isLoggedIn={isLoggedIn} onRotate={rotateBotOut} />
                  ) : (
                    <WagerCard
                      key={(card.data as WagerWithUser).id}
                      wager={card.data as WagerWithUser}
                      isNewest={(card.data as WagerWithUser).id === newestId}
                      currentUserId={currentUser?.id ?? null}
                      isLoggedIn={isLoggedIn}
                    />
                  )
                )}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#EEEDE4] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#EEEDE4] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#EEEDE4] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#EEEDE4] to-transparent" />
              <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
                <span className="font-mono text-[9px] text-[#888] uppercase tracking-widest bg-[#EEEDE4]/80 px-2 py-0.5 rounded">drag to explore</span>
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="mt-10">
          <p className="font-mono text-[11px] tracking-widest uppercase text-[#888] mb-4">Practice<span className="cursor-blink ml-0.5">_</span></p>
          <div className="grid grid-cols-2 gap-3">
            {displayedBots.map(bot => (
              <BotCard key={bot.personalityIndex} bot={bot} isLoggedIn={isLoggedIn} onRotate={rotateBotOut} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-4 justify-center">
        {[{ href: '/nobles', label: 'Nobles' }, { href: '/honors', label: 'Honors' }, { href: '/alms', label: 'Alms' }].map(l => (
          <Link key={l.href} href={l.href} className="font-mono text-[11px] tracking-widest uppercase text-[#888] hover:text-[#111] transition-colors">{l.label}</Link>
        ))}
      </div>

      {showModal && currentUser && <PostChallengeModal currentUser={currentUser} onClose={() => setShowModal(false)} />}
    </main>
  )
}
