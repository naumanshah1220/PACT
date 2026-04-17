'use client'

import Link from 'next/link'
import type { DuelWithUsers } from '@/types/database'

type Outcome = NonNullable<DuelWithUsers['outcome']>

const OUTCOME_CONFIG: Record<Outcome, {
  emoji: string
  title: string
  subtitleFn: (isP1: boolean, stake: number) => string
}> = {
  both_pledge: {
    emoji: '🤝',
    title: 'You both pledged.',
    subtitleFn: (_, stake) => `Both players kept their honour. Each received +${Math.floor(stake * 0.25)} bonus Gold.`,
  },
  both_betray: {
    emoji: '💀',
    title: 'You both betrayed.',
    subtitleFn: (_, stake) => `Mutual treachery. Both players lost ${stake} Gold to the Hoard.`,
  },
  p1_betray: {
    emoji: '😮',
    title: 'Betrayal.',
    subtitleFn: (isP1, stake) => isP1
      ? `You betrayed your opponent. You gained ${stake} Gold.`
      : `Your opponent betrayed you. You lost ${stake} Gold.`,
  },
  p2_betray: {
    emoji: '😮',
    title: 'Betrayal.',
    subtitleFn: (isP1, stake) => isP1
      ? `Your opponent betrayed you. You lost ${stake} Gold.`
      : `You betrayed your opponent. You gained ${stake} Gold.`,
  },
  p1_silent: {
    emoji: '🔇',
    title: 'Silence.',
    subtitleFn: (isP1, stake) => isP1
      ? `You said nothing. You lost ${stake} Gold and are banished for 24 hours.`
      : `Your opponent was silent. You gained ${stake} Gold.`,
  },
  p2_silent: {
    emoji: '🔇',
    title: 'Silence.',
    subtitleFn: (isP1, stake) => isP1
      ? `Your opponent was silent. You gained ${stake} Gold.`
      : `You said nothing. You lost ${stake} Gold and are banished for 24 hours.`,
  },
  both_silent: {
    emoji: '🤫',
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

function CoinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#c9973a" />
      <circle cx="12" cy="12" r="7.5" fill="#b07d2a" />
      <circle cx="12" cy="12" r="5" fill="#c9973a" />
      <ellipse cx="9.5" cy="9.5" rx="2" ry="1" fill="#f5e070" opacity="0.45" transform="rotate(-30 9.5 9.5)" />
    </svg>
  )
}

export default function ResultClient({ duel, currentUserId }: { duel: DuelWithUsers; currentUserId: string }) {
  const isP1 = currentUserId === duel.player1_id
  const outcome = duel.outcome as Outcome | null

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

  const shareText = `I played PACT and ${outcome === 'both_pledge' ? 'we both pledged 🤝' : outcome.includes('betray') ? 'there was betrayal 😮' : 'silence fell 🔇'} — ${stake} Gold at stake. Play at pact.game`

  function shareOnX() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center gap-6 mb-10 animate-slide-in-left">
        <div className="w-px h-20 bg-[#d8d4cc] shrink-0" />
        <span className="text-6xl leading-none">{config.emoji}</span>
      </div>

      <h1 className="font-fell text-[28px] mb-5">{config.title}</h1>

      <div className="flex items-center gap-2.5 mb-3">
        <CoinIcon />
        <span className="font-fell text-3xl text-[#1a1208]">
          {goldDelta > 0 ? `+${goldDelta}` : `${goldDelta}`}
        </span>
      </div>

      <p className="font-mono text-sm text-[#555] mb-10">{subtitle}</p>

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-block border border-[#1a1208] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors"
        >
          Back to Tavern
        </Link>
        <button
          onClick={shareOnX}
          className="border border-[#1a1208] rounded-xl px-6 py-3 font-mono text-sm text-center hover:bg-[#f0ede6] transition-colors"
        >
          Share on ⧯
        </button>
      </div>
    </main>
  )
}
