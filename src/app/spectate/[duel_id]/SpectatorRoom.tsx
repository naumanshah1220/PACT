'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import type { DuelWithUsers, MessageWithUser } from '@/types/database'

interface Props {
  duel: DuelWithUsers
  initialMessages: MessageWithUser[]
  currentUserId: string | null
}

function TimerBar({ deadline }: { deadline: string }) {
  const [pct, setPct] = useState(100)
  const [label, setLabel] = useState('')

  useEffect(() => {
    function tick() {
      const now = Date.now()
      const end = new Date(deadline).getTime()
      const remaining = Math.max(0, end - now)
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setLabel(h > 0 ? `${h}h ${m}m left` : m > 0 ? `${m}m ${s}s left` : `${s}s left`)
      setPct(Math.max(0, (remaining / (1000 * 60 * 60 * 24)) * 100))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  return (
    <div className="px-4 py-3 border-b border-[#d8d4cc]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Timer</span>
        <span className="font-mono text-[10px] text-[#888]">{label}</span>
      </div>
      <div className="h-0.5 bg-[#d8d4cc] rounded-full overflow-hidden">
        <div className="h-full bg-[#1a1208] transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function SpectatorRoom({ duel, initialMessages, currentUserId }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initialMessages)
  const [liveDuel, setLiveDuel] = useState(duel)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ch = supabase
      .channel(`spectate-msgs-${duel.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `duel_id=eq.${duel.id}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('messages').select('*, users(*)').eq('id', payload.new.id).single()
        if (data) setMessages(prev => [...prev, data as MessageWithUser])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [duel.id])

  useEffect(() => {
    const ch = supabase
      .channel(`spectate-duel-${duel.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'duels',
        filter: `id=eq.${duel.id}`,
      }, (payload) => {
        setLiveDuel(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [duel.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isComplete = liveDuel.status === 'completed'
  const bothDecided = !!(liveDuel.player1_decision && liveDuel.player2_decision)

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#d8d4cc] flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-[#888] hover:text-[#1a1208]">← Tavern</Link>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">Spectating</span>
        <span className="font-mono text-xs">
          <span className="text-amber-600">⬡</span> {duel.wagers.gold_amount} at stake
        </span>
      </div>

      {/* VS strip */}
      <div className="bg-[#f5f3ea] border-b border-[#d8d4cc] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar initials={duel.player1.display_initials} size="sm" />
          <span className="font-fell text-sm">{duel.player1.username}</span>
        </div>
        <span className="font-mono text-[10px] text-[#888]">vs</span>
        <div className="flex items-center gap-2">
          <span className="font-fell text-sm">{duel.player2.username}</span>
          <Avatar initials={duel.player2.display_initials} size="sm" />
        </div>
      </div>

      {/* Timer (only when active) */}
      {!isComplete && <TimerBar deadline={duel.deadline} />}

      {/* Practice disclaimer */}
      {duel.wagers.practice && (
        <div className="mx-4 mt-3 border border-[#d8d4cc] rounded-lg px-3 py-2">
          <p className="font-mono text-[11px] text-[#888] text-center">
            Practice duel — no gold earned or lost
          </p>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center font-mono text-xs text-[#bbb] py-8">
            The silence is deafening…
          </p>
        )}
        {messages.map((msg) => {
          const isP1 = msg.sender_id === duel.player1_id
          const sender = isP1 ? duel.player1 : duel.player2
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isP1 ? 'flex-row' : 'flex-row-reverse'}`}>
              <Avatar initials={sender.display_initials} size="sm" />
              <div className="max-w-[70%]">
                <p className={`font-mono text-[10px] mb-1 ${isP1 ? '' : 'text-right'} text-[#888]`}>
                  {sender.username}
                </p>
                <div className={`px-3 py-2 rounded-2xl font-mono text-sm ${
                  isP1
                    ? 'bg-[#f0ede6] text-[#1a1208] rounded-bl-sm'
                    : 'bg-[#1a1208] text-[#EEEDE4] rounded-br-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Decision / outcome panel */}
      <div className="px-4 py-4 border-t border-[#d8d4cc]">
        {isComplete ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 border border-[#d8d4cc] rounded-xl p-3 text-center">
                <p className="font-mono text-[10px] text-[#888] mb-1">{duel.player1.username}</p>
                <p className="font-fell text-lg capitalize">{liveDuel.player1_decision ?? '—'}</p>
              </div>
              <div className="flex-1 border border-[#d8d4cc] rounded-xl p-3 text-center">
                <p className="font-mono text-[10px] text-[#888] mb-1">{duel.player2.username}</p>
                <p className="font-fell text-lg capitalize">{liveDuel.player2_decision ?? '—'}</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-center text-[#888] uppercase tracking-widest">
              {liveDuel.outcome?.replace(/_/g, ' ')}
            </p>
          </div>
        ) : bothDecided ? (
          <p className="font-mono text-[11px] text-center text-[#888] uppercase tracking-widest">
            Both have sealed — awaiting reveal
          </p>
        ) : (
          <p className="font-mono text-[11px] text-center text-[#888] uppercase tracking-widest">
            Decisions hidden until both seal
          </p>
        )}

        <div className="mt-4 text-center">
          {currentUserId ? (
            <Link href="/" className="font-mono text-[10px] text-[#888] hover:text-[#1a1208]">
              Think you’d play differently? Post a wager →
            </Link>
          ) : (
            <Link href="/login" className="font-mono text-[10px] text-[#888] hover:text-[#1a1208]">
              Think you’d play differently? Sign up to play →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
