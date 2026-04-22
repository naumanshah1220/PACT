'use client'

import { useState } from 'react'
import type { DuelWithUsers } from '@/types/database'

type Outcome = NonNullable<DuelWithUsers['outcome']>

const OUTCOME_CONFIG: Record<Outcome, {
  icon: string
  title: string
  subtitleFn: (isP1: boolean, stake: number) => string
}> = {
  both_pledge: {
    icon: '/icons/pledge.png',
    title: 'You both pledged.',
    subtitleFn: (_, stake) => `Both players kept their honour. Each received +${Math.floor(stake * 0.25)} bonus Gold.`,
  },
  both_betray: {
    icon: '/icons/betray.png',
    title: 'You both betrayed.',
    subtitleFn: (_, stake) => `Mutual treachery. Both players lost ${stake} Gold to the Hoard.`,
  },
  p1_betray: {
    icon: '/icons/betray.png',
    title: 'Betrayal.',
    subtitleFn: (isP1, stake) => isP1 ? `You betrayed your opponent. You gained ${stake} Gold.` : `Your opponent betrayed you. You lost ${stake} Gold.`,
  },
  p2_betray: {
    icon: '/icons/betray.png',
    title: 'Betrayal.',
    subtitleFn: (isP1, stake) => isP1 ? `Your opponent betrayed you. You lost ${stake} Gold.` : `You betrayed your opponent. You gained ${stake} Gold.`,
  },
  p1_silent: {
    icon: '/icons/raven.png',
    title: 'Silence.',
    subtitleFn: (isP1, stake) => isP1 ? `You said nothing. You lost ${stake} Gold and are banished for 24 hours.` : `Your opponent was silent. You gained ${stake} Gold.`,
  },
  p2_silent: {
    icon: '/icons/raven.png',
    title: 'Silence.',
    subtitleFn: (isP1, stake) => isP1 ? `Your opponent was silent. You gained ${stake} Gold.` : `You said nothing. You lost ${stake} Gold and are banished for 24 hours.`,
  },
  both_silent: {
    icon: '/icons/raven.png',
    title: 'Both silent.',
    subtitleFn: (_, stake) => `No one spoke. Both players lost ${stake} Gold to the Hoard.`,
  },
}

function getGoldDelta(outcome: Outcome, isP1: boolean, stake: number): number {
  switch (outcome) {
    case 'both_pledge': return Math.floor(stake * 0.25)
    case 'both_betray': return -stake
    case 'both_silent': return -stake
    case 'p1_betray': return isP1 ? stake : -stake
    case 'p2_betray': return isP1 ? -stake : stake
    case 'p1_silent': return isP1 ? -stake : stake
    case 'p2_silent': return isP1 ? stake : -stake
  }
}

export default function ResultClient({ duel, currentUserId }: { duel: DuelWithUsers; currentUserId: string }) {
  const isP1 = currentUserId === duel.player1_id
  const outcome = duel.outcome as Outcome | null
  const [copied, setCopied] = useState(false)

  if (!outcome) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="font-mono text-sm text-[#888]">Awaiting resolution…</p>
      </div>
    )
  }

  const config = OUTCOME_CONFIG[outcome]
  const stake = duel.wagers.gold_amount
  const goldDelta = getGoldDelta(outcome, isP1, stake)
  const subtitle = config.subtitleFn(isP1, stake)

  // Mystery share — no outcome revealed, Wordle-style intrigue
  const wagerMsg = duel.wagers.wager_message
  const shareText = wagerMsg
    ? `⚔️ PACT — ${stake} Gold\n"${wagerMsg}"\n\nThe seal is broken. Did I honour the pact? 👀\npact.game`
    : `⚔️ PACT — ${stake} Gold\n\nI just played. The seal is broken.\nDid I honour the pact? 👀\npact.game`

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  function handleTwitter() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center gap-6 mb-10 animate-slide-in-left">
        <div className="w-px h-20 bg-[#d8d4cc] shrink-0" />
        <div style={{ isolation: 'isolate', backgroundColor: '#EEEDE4' }}>
          <img src={config.icon} alt="" width={288} height={288} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </div>

      <h1 className="font-fell text-[28px] mb-5">{config.title}</h1>

      <div className="flex items-center gap-2.5 mb-3">
        <img src="/icons/coin.png" alt="" className="w-6 h-6 object-contain" style={{ mixBlendMode: 'multiply' }} />
        <span className="font-fell text-3xl text-[#1a1208]">{goldDelta > 0 ? `+${goldDelta}` : `${goldDelta}`}</span>
      </div>

      <p className="font-mono text-sm text-[#555] mb-10">{subtitle}</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => { window.location.href = '/' }}
          className="border border-[#1a1208] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors w-full"
        >
          Back to Tavern
        </button>
        <button
          onClick={handleWhatsApp}
          className="bg-[#25D366] text-white rounded-xl px-6 py-3 font-mono text-sm text-center hover:opacity-90 transition-opacity"
        >
          Share on WhatsApp
        </button>
        <button
          onClick={handleTwitter}
          className="border border-[#1a1208] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors"
        >
          Share on ⋯
        </button>
        <button
          onClick={handleCopy}
          className="border border-[#d8d4cc] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors text-[#888]"
        >
          {copied ? 'Copied ✓' : 'Copy message'}
        </button>
      </div>
    </main>
  )
}
