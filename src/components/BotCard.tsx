'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'

export interface BotOption {
  personalityIndex: number
  name: string
  goldAmount: number
  timerMinutes: number
  displayInitials: string
  preview: string
}

export function BotCard({ bot, isLoggedIn, onRotate }: { bot: BotOption; isLoggedIn: boolean; onRotate: (idx: number) => void }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handlePractice() {
    if (loading) return
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (!isLoggedIn) {
        const { data: anonData, error } = await supabase.auth.signInAnonymously()
        if (error || !anonData.session) { alert(`Could not start practice: ${error?.message ?? 'no session'}`); return }
        headers['Authorization'] = `Bearer ${anonData.session.access_token}`
      }
      const res = await fetch('/api/start-practice', { method: 'POST', headers, body: JSON.stringify({ personalityIndex: bot.personalityIndex }) })
      const data = await res.json()
      if (data.duelId) { onRotate(bot.personalityIndex); window.location.href = `/duel/${data.duelId}` }
      else alert(data.error || 'Could not start practice')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[12px] p-4 hover:-translate-y-0.5 hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <Avatar initials={bot.displayInitials} size="sm" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888] border border-[#d8d4cc] rounded px-1 whitespace-nowrap">Practice</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <img src="/icons/coin.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
          <div className="text-right">
            <span className="font-fell text-2xl leading-none">{bot.goldAmount}</span>
            <span className="font-mono text-[10px] text-[#888] block">gold</span>
          </div>
        </div>
      </div>
      <p className="font-fell text-sm mb-2">{bot.name}</p>
      <p className="font-mono text-[10px] text-[#666] mb-3 flex-1 italic leading-relaxed">&ldquo;{bot.preview}&rdquo;</p>
      <button onClick={handlePractice} disabled={loading} className="w-full border border-[#1a1208] rounded-lg py-2 font-mono text-[11px] hover:bg-[#1a1208] hover:text-[#EEEDE4] transition-colors active:scale-[0.97] disabled:opacity-50">
        {loading ? 'Starting…' : 'Practice →'}
      </button>
    </div>
  )
}
