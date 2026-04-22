'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import { isBotId } from '@/lib/bots'
import type { DuelWithUsers, MessageWithUser } from '@/types/database'

interface Props {
  duel: DuelWithUsers
  initialMessages: MessageWithUser[]
  currentUserId: string
}

function TimerBar({ deadline, timerMinutes }: { deadline: string; timerMinutes: number }) {
  const [pct, setPct] = useState(100)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const totalMs = timerMinutes * 60 * 1000
    function tick() {
      const remaining = Math.max(0, new Date(deadline).getTime() - Date.now())
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setLabel(h > 0 ? `${h}h ${m}m left` : m > 0 ? `${m}m ${s}s left` : `${s}s left`)
      setPct(Math.max(0, (remaining / totalMs) * 100))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline, timerMinutes])

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
        <div className="h-full bg-[#111] transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function DuelRoom({ duel, initialMessages, currentUserId }: Props) {
  const supabase = useRef(createClient()).current
  const router = useRouter()
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [decision, setDecision] = useState<'pledge' | 'betray' | null>(null)
  const [liveDuel, setLiveDuel] = useState(duel)
  const [sealLoading, setSealLoading] = useState(false)
  const [showRaven, setShowRaven] = useState(false)
  const [hasSentMessage, setHasSentMessage] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isP1 = currentUserId === duel.player1_id
  const opponent = isP1 ? duel.player2 : duel.player1
  const opponentId = isP1 ? duel.player2_id : duel.player1_id
  const opponentIsBot = isBotId(opponentId) || !!(opponent as any).is_bot

  const savedDecision = isP1 ? duel.player1_decision : duel.player2_decision
  const [decisionConfirmed, setDecisionConfirmed] = useState(!!savedDecision)

  useEffect(() => {
    if (savedDecision) setDecision(savedDecision as 'pledge' | 'betray')
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel(`duel-messages-${duel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          if (payload.new.duel_id !== duel.id) return
          const { data } = await supabase.from('messages').select('*, users(*)').eq('id', payload.new.id).single()
          if (data) setMessages(prev => {
            if (prev.some(m => m.id === (data as MessageWithUser).id)) return prev
            const optIdx = prev.findIndex(m =>
              m.id.startsWith('opt-') &&
              m.sender_id === (data as MessageWithUser).sender_id &&
              m.content === (data as MessageWithUser).content
            )
            if (optIdx !== -1) {
              const next = [...prev]
              next[optIdx] = data as MessageWithUser
              return next
            }
            return [...prev, data as MessageWithUser]
          })
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [duel.id])

  useEffect(() => {
    const channel = supabase
      .channel(`duel-state-${duel.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'duels' },
        (payload) => {
          if (payload.new.id !== duel.id) return
          setLiveDuel(prev => ({ ...prev, ...payload.new }))
          if (payload.new.status === 'completed') router.push(`/result/${duel.id}`)
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [duel.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const deadline = new Date(duel.deadline).getTime()
    const created = new Date(duel.created_at).getTime()
    const elapsed25 = created + (deadline - created) * 0.25
    const delay = Math.max(0, elapsed25 - Date.now())
    const opponentMessaged = isP1 ? liveDuel.player2_messaged : liveDuel.player1_messaged
    if (!opponentMessaged && !opponentIsBot) {
      const t = setTimeout(() => setShowRaven(true), delay)
      return () => clearTimeout(t)
    }
  }, [liveDuel.player1_messaged, liveDuel.player2_messaged])

  useEffect(() => {
    const delay = new Date(duel.deadline).getTime() - Date.now()
    if (delay <= 0) { fetch('/api/resolve-duel', { method: 'POST' }); return }
    const t = setTimeout(() => fetch('/api/resolve-duel', { method: 'POST' }), delay)
    return () => clearTimeout(t)
  }, [])

  const myMessaged = hasSentMessage
    || messages.some(m => m.sender_id === currentUserId)
    || (isP1 ? liveDuel.player1_messaged : liveDuel.player2_messaged)

  const opponentHasMessaged = messages.some(m => m.sender_id === opponentId)
    || (isP1 ? liveDuel.player2_messaged : liveDuel.player1_messaged)

  const bothMessaged = opponentIsBot ? myMessaged : (myMessaged && opponentHasMessaged)

  const myDecision = (isP1 ? liveDuel.player1_decision : liveDuel.player2_decision) ?? decision
  const opponentDecided = opponentIsBot || (isP1 ? !!liveDuel.player2_decision : !!liveDuel.player1_decision)
  const canSeal = !!myDecision && decisionConfirmed && opponentDecided
  const iHaveSealed = liveDuel.seal_requested_by === currentUserId
  const theyHaveSealed = !!liveDuel.seal_requested_by && liveDuel.seal_requested_by !== currentUserId
  const ravenAlreadySent = messages.some(m => m.content === '— a raven was sent —')

  async function sendMessage() {
    if (!input.trim() || sending) return
    setHasSentMessage(true)
    setSending(true)
    const content = input.trim()
    setInput('')

    const myProfile = isP1 ? duel.player1 : duel.player2
    setMessages(prev => [...prev, {
      id: `opt-${Date.now()}`,
      duel_id: duel.id,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      users: myProfile,
    } as MessageWithUser])

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId: duel.id, content }),
      })
      const data = await res.json()
      if (data.messages) setMessages(data.messages as MessageWithUser[])
    } catch {
      // optimistic message stays visible
    } finally {
      setSending(false)
    }
  }

  async function makeDecision(d: 'pledge' | 'betray') {
    if (!bothMessaged || decision) return
    setDecision(d)
    try {
      const res = await fetch('/api/make-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId: duel.id, decision: d }),
      })
      if (res.ok) {
        const field = isP1 ? 'player1_decision' : 'player2_decision'
        setLiveDuel(prev => ({ ...prev, [field]: d }))
        setDecisionConfirmed(true)
      } else {
        setDecision(null)
      }
    } catch {
      setDecision(null)
    }
  }

  async function sendRaven() {
    await supabase.from('messages').insert({
      duel_id: duel.id,
      sender_id: currentUserId,
      content: '— a raven was sent —',
    })
  }

  async function requestSeal() {
    setSealLoading(true)
    const res = await fetch('/api/seal-duel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duelId: duel.id }),
    })
    const data = await res.json()
    if (data.resolved) {
      window.location.href = `/result/${duel.id}`
      return
    }
    setLiveDuel(prev => ({ ...prev, seal_requested_by: currentUserId }))
    setSealLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="px-4 py-3 border-b border-[#d8d4cc] flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-[#888] hover:text-[#111]">&larr; Back</Link>
        <span className="font-serif text-lg">The Duel</span>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <img src="/icons/coin.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
          <span>{duel.wagers.gold_amount} gold at stake</span>
        </div>
      </div>

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

      <TimerBar deadline={duel.deadline} timerMinutes={duel.wagers.timer_minutes} />

      {showRaven && !ravenAlreadySent && (
        <div className="mx-4 mt-2">
          <button
            onClick={sendRaven}
            className="w-full border border-[#d8d4cc] rounded-lg py-2 font-mono text-[11px] text-[#888] hover:border-[#aaa] hover:text-[#111] transition-colors flex items-center justify-center gap-2"
          >
            <img src="/icons/raven.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
            Send Raven
          </button>
        </div>
      )}

      {opponentIsBot && (
        <div className="mx-4 mt-3 border border-[#d8d4cc] rounded-lg px-3 py-2">
          <p className="font-mono text-[11px] text-[#888] text-center">Practice duel — no gold earned or lost</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center font-mono text-xs text-[#bbb] py-8">The silence is deafening. Say something.</p>
        )}
        {messages.map((msg) => {
          if (msg.content === '— a raven was sent —') {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="font-mono text-[10px] text-[#bbb] italic">{msg.content}</span>
              </div>
            )
          }
          const isMine = msg.sender_id === currentUserId
          const sender = msg.sender_id === duel.player1_id ? duel.player1 : duel.player2
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar initials={sender.display_initials} size="sm" />
              <div className={`max-w-[70%] ${isMine ? 'bubble-in-right' : 'bubble-in-left'}`}>
                <p className={`font-mono text-[10px] mb-1 ${isMine ? 'text-right' : ''} text-[#888]`}>{sender.username}</p>
                <div className={`px-3 py-2 rounded-2xl font-sans text-sm ${
                  isMine ? 'bg-[#111] text-white rounded-br-sm' : 'bg-[#f0ede6] text-[#111] rounded-bl-sm'
                }`}>{msg.content}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-[#d8d4cc] flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Say something…"
          className="flex-1 border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa]"
        />
        <button onClick={sendMessage} disabled={sending || !input.trim()}
          className="bg-[#111] text-white font-sans text-sm px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-[#333] transition-colors">
          Send
        </button>
      </div>

      <div className="px-4 pt-4 pb-2 border-t border-[#d8d4cc] bg-white isolate">
        {!bothMessaged && (
          <p className="font-mono text-[10px] text-[#888] text-center mb-3 uppercase tracking-widest">
            {opponentIsBot ? 'Send a message to unlock your decision' : 'Both must speak before deciding'}
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={() => makeDecision('pledge')} disabled={!bothMessaged || !!decision}
            className={`flex-1 py-3 rounded-xl border-2 font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              !bothMessaged ? 'opacity-30 cursor-not-allowed border-[#d8d4cc] text-[#888]'
              : decision === 'pledge' ? 'border-[#3B6D11] bg-[#3B6D11]/10 text-[#3B6D11]'
              : decision ? 'opacity-40 border-[#d8d4cc] text-[#888]'
              : 'border-[#d8d4cc] hover:border-[#3B6D11] hover:text-[#3B6D11]'
            }`}>
            <img src="/icons/pledge.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
            Pledge
          </button>
          <button onClick={() => makeDecision('betray')} disabled={!bothMessaged || !!decision}
            className={`flex-1 py-3 rounded-xl border-2 font-sans text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              !bothMessaged ? 'opacity-30 cursor-not-allowed border-[#d8d4cc] text-[#888]'
              : decision === 'betray' ? 'border-[#993C1D] bg-[#993C1D]/10 text-[#993C1D]'
              : decision ? 'opacity-40 border-[#d8d4cc] text-[#888]'
              : 'border-[#d8d4cc] hover:border-[#993C1D] hover:text-[#993C1D]'
            }`}>
            <img src="/icons/betray.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
            Betray
          </button>
        </div>

        {decision && !decisionConfirmed && (
          <p className="font-mono text-[10px] text-[#aaa] text-center mt-3">Saving decision…</p>
        )}

        {canSeal && (
          <div className="flex justify-center mt-4">
            {iHaveSealed ? (
              <div className="flex flex-col items-center gap-2 opacity-40">
                <img src="/icons/seal.png" alt="" className="w-16 h-16 object-contain" style={{ mixBlendMode: 'multiply' }} />
                <span className="font-mono text-[8px] tracking-wider uppercase text-[#aaa]">Seal placed</span>
              </div>
            ) : theyHaveSealed ? (
              <div className="text-center">
                <p className="font-mono text-[11px] text-[#3B6D11] mb-3">Opponent sealed. Confirm below.</p>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={requestSeal}
                    disabled={sealLoading}
                    className="hover:scale-110 active:scale-95 transition-transform duration-150 disabled:opacity-40"
                  >
                    {sealLoading
                      ? <span className="font-mono text-sm text-[#3B6D11]">…</span>
                      : <img src="/icons/seal.png" alt="" className="w-16 h-16 object-contain" style={{ mixBlendMode: 'multiply' }} />
                    }
                  </button>
                  <span className="font-mono text-[8px] tracking-wider uppercase text-[#3B6D11]">Confirm Seal</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={requestSeal}
                  disabled={sealLoading}
                  className="hover:scale-110 active:scale-95 transition-transform duration-150 disabled:opacity-40"
                >
                  {sealLoading
                    ? <span className="font-mono text-sm">…</span>
                    : <img src="/icons/seal.png" alt="" className="w-16 h-16 object-contain" style={{ mixBlendMode: 'multiply' }} />
                  }
                </button>
                <span className="font-mono text-[8px] tracking-wider uppercase text-[#888]">Invoke the Seal</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#f0ede6] grid grid-cols-3 divide-x divide-[#f0ede6] text-center">
          <p className="font-mono text-[9px] text-[#bbb] px-1 leading-tight">both pledge → +25% each</p>
          <p className="font-mono text-[9px] text-[#bbb] px-1 leading-tight">one betrays → winner takes all</p>
          <p className="font-mono text-[9px] text-[#bbb] px-1 leading-tight">both betray → house keeps it</p>
        </div>
      </div>
    </div>
  )
}
