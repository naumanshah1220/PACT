export const BOT_IDS = {
  MERCIFUL_FRIAR: '00000000-0000-0000-0001-000000000000',
  CUTPURSE:       '00000000-0000-0000-0002-000000000000',
  MERCHANT:       '00000000-0000-0000-0003-000000000000',
  ORACLE:         '00000000-0000-0000-0004-000000000000',
} as const

type BotId = typeof BOT_IDS[keyof typeof BOT_IDS]
export type Strategy = 'pledge' | 'betray' | 'random'

export const STRATEGY_BOT_IDS: Record<Strategy, BotId> = {
  pledge: BOT_IDS.MERCIFUL_FRIAR,
  betray: BOT_IDS.CUTPURSE,
  random: BOT_IDS.ORACLE,
}

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
    greeting: 'Peace be upon thee, traveller. I have pledged in good faith, as is the Lord\'s will. Do as thy conscience bids.',
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

export interface BotPersonality {
  name: string
  displayInitials: string
  strategy: Strategy
  goldAmount: number
  timerMinutes: number
  greeting: string
  disclaimer: string
}

export const BOT_PERSONALITIES: BotPersonality[] = [
  // Pledge bots
  { name: 'Lady Elara', displayInitials: 'LE', strategy: 'pledge', goldAmount: 8, timerMinutes: 60, greeting: 'I come to you in good faith, stranger. May our pact hold firm.', disclaimer: 'Lady Elara always honours her word.' },
  { name: 'Brother Aldric', displayInitials: 'BA', strategy: 'pledge', goldAmount: 10, timerMinutes: 90, greeting: 'The monastery taught me one thing above all: keep your oaths.', disclaimer: 'Brother Aldric pledges without fail.' },
  { name: 'Sir Godwin', displayInitials: 'SG', strategy: 'pledge', goldAmount: 12, timerMinutes: 60, greeting: "A knight's word is his bond. I have given mine already.", disclaimer: 'Sir Godwin pledges on his honour.' },
  { name: 'The Abbess', displayInitials: 'TA', strategy: 'pledge', goldAmount: 15, timerMinutes: 120, greeting: 'I have prayed on this and found my answer. The pact is sealed in my heart.', disclaimer: 'The Abbess pledges out of principle.' },
  { name: 'Dame Rowena', displayInitials: 'DR', strategy: 'pledge', goldAmount: 20, timerMinutes: 60, greeting: 'I have never broken a deal and do not intend to start now, friend.', disclaimer: 'Dame Rowena always pledges.' },
  { name: 'Prior Cuthbert', displayInitials: 'PC', strategy: 'pledge', goldAmount: 10, timerMinutes: 240, greeting: 'The good Prior takes no pleasure in treachery. His hand is extended.', disclaimer: 'Prior Cuthbert pledges every time.' },
  { name: 'The Cartographer', displayInitials: 'TC', strategy: 'pledge', goldAmount: 18, timerMinutes: 60, greeting: 'I chart honest courses. My decision is already mapped.', disclaimer: 'The Cartographer pledges — always north.' },
  { name: 'Ser Osbert', displayInitials: 'SO', strategy: 'pledge', goldAmount: 25, timerMinutes: 60, greeting: 'My reputation was built on trust. I shall not ruin it here.', disclaimer: 'Ser Osbert pledges every duel.' },
  { name: 'Warden Hadwin', displayInitials: 'WH', strategy: 'pledge', goldAmount: 30, timerMinutes: 480, greeting: 'I protect these lands with my honour intact. My decision is made.', disclaimer: 'Warden Hadwin always pledges.' },
  { name: 'Lady Vivienne', displayInitials: 'LV', strategy: 'pledge', goldAmount: 12, timerMinutes: 60, greeting: 'They say the court is full of liars. I shall be the exception.', disclaimer: 'Lady Vivienne pledges without exception.' },
  // Betray bots
  { name: 'Lord Malachai', displayInitials: 'LM', strategy: 'betray', goldAmount: 15, timerMinutes: 60, greeting: 'How delightful. A fresh face for my collection.', disclaimer: 'Lord Malachai always betrays. Tread carefully.' },
  { name: 'The Shadowmender', displayInitials: 'SM', strategy: 'betray', goldAmount: 20, timerMinutes: 60, greeting: 'I mend things… and break others. You shall see which this is.', disclaimer: 'The Shadowmender betrays every pact.' },
  { name: 'Guildmaster Radko', displayInitials: 'GR', strategy: 'betray', goldAmount: 25, timerMinutes: 120, greeting: 'The guild did not survive on trust alone. Neither shall I.', disclaimer: 'Guildmaster Radko always betrays.' },
  { name: 'Baron Ulfric', displayInitials: 'BU', strategy: 'betray', goldAmount: 30, timerMinutes: 60, greeting: 'The weak make pacts. The strong take what they want.', disclaimer: 'Baron Ulfric betrays. Without remorse.' },
  { name: 'The Debt Collector', displayInitials: 'DC', strategy: 'betray', goldAmount: 10, timerMinutes: 60, greeting: 'Everyone owes something. I simply collect.', disclaimer: 'The Debt Collector always betrays.' },
  { name: 'Ser Corvus', displayInitials: 'SC', strategy: 'betray', goldAmount: 18, timerMinutes: 60, greeting: 'I was knighted for cunning, not virtue. Remember that.', disclaimer: 'Ser Corvus betrays every time.' },
  { name: 'The Tax Assessor', displayInitials: 'TX', strategy: 'betray', goldAmount: 22, timerMinutes: 240, greeting: 'By royal decree I am entitled to everything. Sign here.', disclaimer: 'The Tax Assessor always betrays.' },
  { name: 'Captain Drace', displayInitials: 'CD', strategy: 'betray', goldAmount: 12, timerMinutes: 60, greeting: 'At sea, loyalty is a luxury. On land, it is a weakness.', disclaimer: 'Captain Drace betrays without hesitation.' },
  { name: 'Lord Harkon', displayInitials: 'LH', strategy: 'betray', goldAmount: 35, timerMinutes: 60, greeting: 'Honour is the currency of fools. I prefer gold.', disclaimer: 'Lord Harkon always betrays.' },
  { name: 'The Pawnbroker', displayInitials: 'PB', strategy: 'betray', goldAmount: 8, timerMinutes: 60, greeting: 'Everything has a price, friend. Especially your trust.', disclaimer: 'The Pawnbroker betrays every deal.' },
  // Random bots
  { name: 'The Fool', displayInitials: 'TF', strategy: 'random', goldAmount: 5, timerMinutes: 60, greeting: 'Ha! The fool flips a coin and the world trembles!', disclaimer: "The Fool's decision is pure chance." },
  { name: 'Seer Thessaly', displayInitials: 'ST', strategy: 'random', goldAmount: 15, timerMinutes: 60, greeting: 'I have seen your future. I will not say what I choose.', disclaimer: 'Seer Thessaly decides by fate alone.' },
  { name: 'The Court Astrologer', displayInitials: 'CA', strategy: 'random', goldAmount: 20, timerMinutes: 120, greeting: 'The stars are ambiguous tonight. As am I.', disclaimer: "The Astrologer's decision depends on the stars." },
  { name: 'The Hermit', displayInitials: 'TH', strategy: 'random', goldAmount: 10, timerMinutes: 480, greeting: 'I have spent years alone with my thoughts. They are still undecided.', disclaimer: 'The Hermit decides unpredictably.' },
  { name: 'The Storm Prophet', displayInitials: 'SP', strategy: 'random', goldAmount: 18, timerMinutes: 60, greeting: 'The storm decides for me. It always does.', disclaimer: 'The Storm Prophet follows only chaos.' },
  { name: 'Madam Zeph', displayInitials: 'MZ', strategy: 'random', goldAmount: 12, timerMinutes: 60, greeting: 'My cards were shuffled this morning. They remain unclear.', disclaimer: 'Madam Zeph reads fortune, not reason.' },
  { name: 'The Wandering Knight', displayInitials: 'WK', strategy: 'random', goldAmount: 22, timerMinutes: 60, greeting: 'I have wandered long enough to know: certainty is a lie.', disclaimer: "The Wandering Knight's path is unpredictable." },
  { name: 'The Last Alchemist', displayInitials: 'LA', strategy: 'random', goldAmount: 28, timerMinutes: 120, greeting: 'My latest experiment yielded surprising results. So may this.', disclaimer: 'The Alchemist mixes outcomes unpredictably.' },
  { name: 'The Blind Archivist', displayInitials: 'BL', strategy: 'random', goldAmount: 16, timerMinutes: 240, greeting: 'I have read every book ever written. None told me what to choose.', disclaimer: 'The Blind Archivist decides by instinct alone.' },
  { name: 'The Unnamed Pilgrim', displayInitials: 'UP', strategy: 'random', goldAmount: 10, timerMinutes: 60, greeting: 'I carry no name. My choice carries no guarantee.', disclaimer: 'The Unnamed Pilgrim is truly unpredictable.' },
]

export function getBotDecision(strategy: Strategy): 'pledge' | 'betray' {
  if (strategy === 'random') return Math.random() < 0.5 ? 'pledge' : 'betray'
  return strategy
}

export function isBotId(id: string): id is BotId {
  return Object.values(BOT_IDS).includes(id as BotId)
}
