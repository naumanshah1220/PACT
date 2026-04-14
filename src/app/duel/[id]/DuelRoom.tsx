'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import type { DuelWithUsers, MessageWithUser } from '@/types/database'

interface Props {
  duel: DuelWithUsers
  initialMessages: MessageWithUser[]
  currentUserId: string
}

function TimerBar({ deadline }: { deadline: string }) {
  const [pct, setPct] = useState(100)
  const [label, setLabel] = useState('')

  useEffect(() => {
    function tick() {
      const now = Date.now()
      const end = new Date(deadline).getTime()
      // We need start: approximate as end - timer duration (from duel created_at ideally)
      // Use remaining / total where total derived from context
      const remaining = Math.max(0, end - now)
      const totalMs = end - (end - 24 * 60 * 60 * 1000) // fallback
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setLabel(h > 0 ? `${h}h ${m}m left` : m > 0 ? `${m}m ${s}s left` : `${s}s left`)
      setPct(Math.max(0, (remaining / (1000 * 60 * 60 * 24)) * 100))
      if (remaining <= 0) setPct(0)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  return (
    <div className="px-4 py-3 border-b border-[#d8d4cc]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">Timer</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#888]">{label}</span>
          <span className="font-mono text-[10px] text-[#3B6D11] uppercase tracking-widest">decide</span>
        </div>
      </div>
      <div className="h-0.5 bg-[#d8d4cc] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#111] transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function DuelRoom({ duel, initialMessages, currentUserId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [decision, setDecision] = useState<'pledge' | 'betray' | null>(null)
  const [liveDuel, setLiveDuel] = useState(duel)
  const [sealLoading, setSealLoading] = useState(false)
  const [showRaven, setShowRaven] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isP1 = currentUserId === duel.player1_id
  const me = isP1 ? duel.player1 : duel.player2
  const opponent = isP1 ? duel.player2 : duel.player1

  // Restore decision from duel
  useEffect(() => {
    const saved = isP1 ? duel.player1_decision : duel.player2_decision
    if (saved) setDecision(saved as 'pledge' | 'betray')
  }, [])

  // Realtime: messages
  useEffect(() => {
    const channel = supabase
      .channel(`duel-messages-${duel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `duel_id=eq.${duel.id}`,
      }, async (payload) => {
        // Fetch sender info
        const { data } = await supabase
          .from('messages')
          .select('*, users(*)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as MessageWithUser])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [duel.id])

  // Realtime: duel state
  useEffect(() => {
    const channel = supabase
      .channel(`duel-state-${duel.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'duels',
        filter: `id=eq.${duel.id}`,
      }, (payload) => {
        setLiveDuel(prev => ({ ...prev, ...payload.new }))
        if (payload.new.status === 'completed') {
          router.push(`/result/${duel.id}`)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [duel.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Raven nudge: 25% of timer elapsed, no opponent message
  useEffect(() => {
    const deadline = new Date(duel.deadline).getTime()
    const created = new Date(duel.created_at).getTime()
    const total = deadline - created
    const elapsed25 = created + total * 0.25
    const now = Date.now()
    const delay = Math.max(0, elapsed25 - now)
    const opponentMessaged = isP1 ? liveDuel.player2_messaged : liveDuel.player1_messaged

    if (!opponentMessaged) {
      const t = setTimeout(() => setShowRaven(true), delay)
      return () => clearTimeout(t)
    }
  }, [liveDuel.player1_messaged, liveDuel.player2_messaged])

  const bothMessaged = liveDuel.player1_messaged && liveDuel.player2_messaged
  const myDecision = isP1 ? liveDuel.player1_decision : liveDuel.player2_decision
  const opponentDecided = isP1 ? !!liveDuel.player2_decision : !!liveDuel.player1_decision
  const canSeal = !!myDecision && opponentDecided
  const sealRequested = !!liveDuel.seal_requested_by && liveDuel.seal_requested_by !== currentUserId

  async function sendMessage() {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    await supabase.from('messages').insert({
      duel_id: duel.id,
      sender_id: currentUserId,
      content,
    })
    // Mark messaged
    const field = isP1 ? 'player1_messaged' : 'player2_messaged'
    await supabase.from('duels').update({ [field]: true }).eq('id', duel.id)
    setSending(false)
  }

  async function makeDecision(d: 'pledge' | 'betray') {
    if (!bothMessaged) return
    setDecision(d)
    const field = isP1 ? 'player1_decision' : 'player2_decision'
    await supabase.from('duels').update({ [field]: d }).eq('id', duel.id)
  }

  async function requestSeal() {
    setSealLoading(true)
    const res = await fetch('/api/seal-duel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duelId: duel.id }),
    })
    const data = await res.json()
    if (data.resolved) router.push(`/result/${duel.id}`)
    setSealLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-[#d8d4cc] flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-[#888] hover:text-[#111]">← Back</Link>
        <span className="font-serif text-lg">The Duel</span>
        <span className="font-mono text-xs">
          <span className="text-amber-600">⬡</span> {duel.wagers.gold_amount} gold at stake
        </span>
      </div>

      {/* VS strip */}
      <div className="bg-[#f2f0eb] border-b border-[#d8d4cc] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar initials={duel.player1.display_initials} size="sm" />
          <span className="font-sans text-sm font-medium">{duel.player1.username}</span>
        </div>
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-widest">vs</span>
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-medium">{duel.player2.username}</span>
          <Avatar initials={duel.player2.display_initials} size="sm" />
        </div>
      </div>

      {/* Timer */}
      <TimerBar deadline={duel.deadline} />

      {/* Raven nudge */}
      {showRaven && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="font-mono text-[11px] text-amber-700">
            🐦‍⬛ A raven circles overhead. Your opponent has not yet spoken.
          </p>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center font-mono text-xs text-[#bbb] py-8">
            The silence is deafening. Say something.
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          const sender = msg.sender_id === duel.player1_id ? duel.player1 : duel.player2
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar initials={sender.display_initials} size="sm" />
              <div className={`max-w-[70%] ${isMine ? 'bubble-in-right' : 'bubble-in-left'}`}>
                <p className={`font-mono text-[10px] mb-1 ${isMine ? 'text-right' : ''} text-[#888]`}>
                  {sender.username}
                </p>
                <div
                  className={`px-3 py-2 rounded-2xl font-sans text-sm ${
                    isMine
                      ? 'bg-[#111] text-white rounded-br-sm'
                      : 'bg-[#f0ede6] text-[#111] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <div className="px-4 py-3 border-t border-[#d8d4cc] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Say something…"
          className="flex-1 border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa]"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="bg-[#111] text-white font-sans text-sm px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-[#333] transition-colors"
        >
          Send
        </button>
      </div>

      {/* Decision area */}
      <div className="px-4 py-4 border-t border-[#d8d4cc] bg-white">
        {!bothMessaged && (
          <p className="font-mono text-[10px] text-[#888] text-center mb-3 uppercase tracking-widest">
            Both must speak before deciding
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => makeDecision('pledge')}
            disabled={!bothMessaged}
            className={`flex-1 py-3 rounded-xl border-2 font-sans text-sm font-medium transition-all ${
              !bothMessaged ? 'opacity-30 cursor-not-allowed border-[#d8d4cc] text-[#888]'
              : decision === 'pledge'
                ? 'border-[#3B6D11] bg-[#3B6D11]/10 text-[#3B6D11]'
                : 'border-[#d8d4cc] hover:border-[#3B6D11] hover:text-[#3B6D11]'
            }`}
          >
            Pledge
          </button>
          <button
            onClick={() => makeDecision('betray')}
            disabled={!bothMessaged}
            className={`flex-1 py-3 rounded-xl border-2 font-sans text-sm font-medium transition-all ${
              !bothMessaged ? 'opacity-30 cursor-not-allowed border-[#d8d4cc] text-[#888]'
              : decision === 'betray'
                ? 'border-[#993C1D] bg-[#993C1D]/10 text-[#993C1D]'
                : 'border-[#d8d4cc] hover:border-[#993C1D] hover:text-[#993C1D]'
            }`}
          >
            Betray
          </button>
        </div>

        {canSeal && (
          <div className="mt-3">
            {sealRequested ? (
              <div className="text-center font-mono text-[11px] text-[#3B6D11] mb-2">
                Your opponent requests The Seal. Confirm below.
              </div>
            ) : null}
            <button
              onClick={requestSeal}
              disabled={sealLoading}
              className="w-full border border-[#111] rounded-xl py-2.5 font-mono text-xs tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors"
            >
              {sealLoading ? 'Sealing…' : 'The Seal — Reveal Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
