export const BOT_IDS = {
  MERCIFUL_FRIAR: '00000000-0000-0000-0001-000000000000',
  CUTPURSE:       '00000000-0000-0000-0002-000000000000',
  MERCHANT:       '00000000-0000-0000-0003-000000000000',
  ORACLE:         '00000000-0000-0000-0004-000000000000',
} as const

type BotId = typeof BOT_IDS[keyof typeof BOT_IDS]
type Strategy = 'pledge' | 'betray' | 'random'

export const BOT_CONFIG: Record<BotId, {
  name: string
  strategy: Strategy
  greeting: string
  goldAmount: number
  timerMinutes: number
  disclaimer: string
}> = {
  [BOT_IDS.MERCIFUL_FRIAR]: {
    name: 'TheMercifulFriar',
    strategy: 'pledge',
    greeting: 'Peace be upon thee, traveller. I have pledged in good faith, as is the Lord’s will. Do as thy conscience bids.',
    goldAmount: 10,
    timerMinutes: 60,
    disclaimer: 'The Merciful Friar always pledges. Will you honour the pact?',
  },
  [BOT_IDS.CUTPURSE]: {
    name: 'TheCutpurse',
    strategy: 'betray',
    greeting: 'Heh. No need for pleasantries, friend. Let us see how trusting you are.',
    goldAmount: 15,
    timerMinutes: 60,
    disclaimer: 'The Cutpurse always betrays. Can you still profit?',
  },
  [BOT_IDS.MERCHANT]: {
    name: 'TheMerchant',
    strategy: 'pledge',
    greeting: 'I deal fairly with those who deal fairly with me. Tread wisely — my ledger has a long memory.',
    goldAmount: 20,
    timerMinutes: 120,
    disclaimer: 'The Merchant pledges on first meeting. Mirror his trust.',
  },
  [BOT_IDS.ORACLE]: {
    name: 'TheOracle',
    strategy: 'random',
    greeting: 'Even the stars do not reveal what I shall do. The fates alone decide.',
    goldAmount: 25,
    timerMinutes: 60,
    disclaimer: "The Oracle's decision is unknowable. Even to himself.",
  },
}

export function getBotDecision(strategy: Strategy): 'pledge' | 'betray' {
  if (strategy === 'random') return Math.random() < 0.5 ? 'pledge' : 'betray'
  return strategy
}

export function isBotId(id: string): id is BotId {
  return Object.values(BOT_IDS).includes(id as BotId)
}
