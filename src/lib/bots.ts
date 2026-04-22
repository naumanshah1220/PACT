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
    greeting: 'I have already placed my mark. You need not fear me — I swore an oath long before you arrived, and I break oaths for no one. The question is whether you can say the same.',
    goldAmount: 10,
    timerMinutes: 60,
    disclaimer: 'The Merciful Friar always pledges. Will you honour the pact?',
  },
  [BOT_IDS.CUTPURSE]: {
    name: 'TheCutpurse',
    strategy: 'betray',
    greeting: "Ah. You're here. I've already decided, and I suspect you already know what I chose. The only question is whether you'll cling to hope anyway. Most do. It's rather endearing.",
    goldAmount: 15,
    timerMinutes: 60,
    disclaimer: 'The Cutpurse always betrays. Can you still profit?',
  },
  [BOT_IDS.MERCHANT]: {
    name: 'TheMerchant',
    strategy: 'pledge',
    greeting: "I have done a thousand deals and never once cheated. You won't be the exception. But I've noticed that people who need reassurance the most are the ones who betray first. So I won't reassure you. My ledger speaks for itself.",
    goldAmount: 20,
    timerMinutes: 120,
    disclaimer: 'The Merchant pledges on first meeting. Mirror his trust.',
  },
  [BOT_IDS.ORACLE]: {
    name: 'TheOracle',
    strategy: 'random',
    greeting: 'I consulted the stars, the cards, and the bones. They told me something. I will not tell you what. But I will say this — they have never been wrong.',
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
}

export const BOT_PERSONALITIES: BotPersonality[] = [
  // Pledge bots
  { name: 'Lady Elara', displayInitials: 'LE', strategy: 'pledge', goldAmount: 8, timerMinutes: 60, greeting: "I've been called naive for trusting strangers. Perhaps. But I would rather be wrong about one person than right about the world." },
  { name: 'Brother Aldric', displayInitials: 'BA', strategy: 'pledge', goldAmount: 10, timerMinutes: 90, greeting: 'My vow is already made. It was made long before you arrived. You have nothing left to decide but your own soul.' },
  { name: 'Sir Godwin', displayInitials: 'SG', strategy: 'pledge', goldAmount: 12, timerMinutes: 60, greeting: "I don't need your assurance. You don't need mine. I have given my word, and my word has never once failed its owner." },
  { name: 'The Abbess', displayInitials: 'TA', strategy: 'pledge', goldAmount: 15, timerMinutes: 120, greeting: 'I have counselled men at the edge of death. They never regret the kindness they showed. Only the kindness they withheld.' },
  { name: 'Dame Rowena', displayInitials: 'DR', strategy: 'pledge', goldAmount: 20, timerMinutes: 60, greeting: 'I will tell you what I have told every opponent: I pledge. Now you know everything relevant, and everything is in your hands.' },
  { name: 'Prior Cuthbert', displayInitials: 'PC', strategy: 'pledge', goldAmount: 10, timerMinutes: 240, greeting: 'Some find it foolish to trust so openly. I find it clarifying. Whatever you choose, the record will show who I am.' },
  { name: 'The Cartographer', displayInitials: 'TC', strategy: 'pledge', goldAmount: 18, timerMinutes: 60, greeting: 'I make no secret of my bearing. True north is true north. I have already drawn my course.' },
  { name: 'Ser Osbert', displayInitials: 'SO', strategy: 'pledge', goldAmount: 25, timerMinutes: 60, greeting: 'I built thirty years of reputation on a simple rule: keep the deal. I am not about to trade it away for a pile of gold.' },
  { name: 'Warden Hadwin', displayInitials: 'WH', strategy: 'pledge', goldAmount: 30, timerMinutes: 480, greeting: 'I guard what I swore to protect. That includes my word. Take your time. My answer will not change.' },
  { name: 'Lady Vivienne', displayInitials: 'LV', strategy: 'pledge', goldAmount: 12, timerMinutes: 60, greeting: 'I know what you are wondering. The answer is yes. I pledged. Now — what kind of person do you intend to be?' },
  // Betray bots
  { name: 'Lord Malachai', displayInitials: 'LM', strategy: 'betray', goldAmount: 15, timerMinutes: 60, greeting: "Ah. Good. You're wondering whether I'm the kind of person who says one thing and does another. I am. The difference is I don't bother saying the other thing first." },
  { name: 'The Shadowmender', displayInitials: 'SM', strategy: 'betray', goldAmount: 20, timerMinutes: 60, greeting: 'I have a reputation. It is not the one I would have chosen. But it is accurate. I thought you deserved to know before we begin.' },
  { name: 'Guildmaster Radko', displayInitials: 'GR', strategy: 'betray', goldAmount: 25, timerMinutes: 120, greeting: 'Trust is not something I purchase cheaply. In this transaction, I am not purchasing it at all. I trust you understand.' },
  { name: 'Baron Ulfric', displayInitials: 'BU', strategy: 'betray', goldAmount: 30, timerMinutes: 60, greeting: 'Pacts are made between equals. We are not equals. This one will end the same way all the others did.' },
  { name: 'The Debt Collector', displayInitials: 'DC', strategy: 'betray', goldAmount: 10, timerMinutes: 60, greeting: 'I have collected from bishops, lords, and sainted men. None of them were exceptions. Neither are you.' },
  { name: 'Ser Corvus', displayInitials: 'SC', strategy: 'betray', goldAmount: 18, timerMinutes: 60, greeting: 'The last three people who trusted me are richer in experience, if not in gold. I consider it a fair trade.' },
  { name: 'The Tax Assessor', displayInitials: 'TX', strategy: 'betray', goldAmount: 22, timerMinutes: 240, greeting: 'I find that transparency saves time. Consider this your assessment notice.' },
  { name: 'Captain Drace', displayInitials: 'CD', strategy: 'betray', goldAmount: 12, timerMinutes: 60, greeting: 'I have sailed with honest men. I have arrived alone. Draw your own conclusions.' },
  { name: 'Lord Harkon', displayInitials: 'LH', strategy: 'betray', goldAmount: 35, timerMinutes: 60, greeting: "You are deciding whether to trust me. Let me help: you shouldn't. But I find that people trust me anyway. It's why I do this." },
  { name: 'The Pawnbroker', displayInitials: 'PB', strategy: 'betray', goldAmount: 8, timerMinutes: 60, greeting: 'Everything has a price. Trust most of all. Yours is about to be appraised.' },
  // Random bots
  { name: 'The Fool', displayInitials: 'TF', strategy: 'random', goldAmount: 5, timerMinutes: 60, greeting: "Ha! The last five duels I decided by sneezing. Today I tried something different. I'll tell you later whether it worked." },
  { name: 'Seer Thessaly', displayInitials: 'ST', strategy: 'random', goldAmount: 15, timerMinutes: 60, greeting: "I saw this moment in a dream. I saw your face. I saw the result. I won't say which face it was wearing when the seal broke." },
  { name: 'The Court Astrologer', displayInitials: 'CA', strategy: 'random', goldAmount: 20, timerMinutes: 120, greeting: "Mercury is in retrograde. Jupiter crowds Mars. What does it mean? I've been asking for forty years. I'll let you know when I figure it out." },
  { name: 'The Hermit', displayInitials: 'TH', strategy: 'random', goldAmount: 10, timerMinutes: 480, greeting: 'I spent seven years in silence deciding what kind of man I am. I am still not entirely sure. Today may not resolve the question.' },
  { name: 'The Storm Prophet', displayInitials: 'SP', strategy: 'random', goldAmount: 18, timerMinutes: 60, greeting: 'The storm does not know which way it bends the tree until the moment of bending. I am the storm. You are the tree.' },
  { name: 'Madam Zeph', displayInitials: 'MZ', strategy: 'random', goldAmount: 12, timerMinutes: 60, greeting: 'I turned three cards before you arrived. Two pointed one way. One pointed the other. I am sorry. That is the most honest thing I can tell you.' },
  { name: 'The Wandering Knight', displayInitials: 'WK', strategy: 'random', goldAmount: 22, timerMinutes: 60, greeting: 'I have made every choice at least once. I have been every kind of person at least once. Which one arrives today — even I must wait to see.' },
  { name: 'The Last Alchemist', displayInitials: 'LA', strategy: 'random', goldAmount: 28, timerMinutes: 120, greeting: 'I calculated the exact rational decision. Then I added a variable I refuse to name. The result is anyone\'s guess, including mine.' },
  { name: 'The Blind Archivist', displayInitials: 'BL', strategy: 'random', goldAmount: 16, timerMinutes: 240, greeting: 'I have read every treatise on trust ever written. Every one of them concludes differently. I find that oddly comforting.' },
  { name: 'The Unnamed Pilgrim', displayInitials: 'UP', strategy: 'random', goldAmount: 10, timerMinutes: 60, greeting: "I left my name at the last crossing. I left my habits at the one before. What remains is just a choice, unencumbered. I haven't made it yet." },
]

// Returns a deterministic UUID for each personality (index 0–29 → 0010–0039)
export function getBotPersonalityId(index: number): string {
  const n = String(index + 10).padStart(4, '0')
  return `00000000-0000-0000-${n}-000000000000`
}

export function getBotDecision(strategy: Strategy): 'pledge' | 'betray' {
  if (strategy === 'random') return Math.random() < 0.5 ? 'pledge' : 'betray'
  return strategy
}

export function isBotId(id: string): boolean {
  if (Object.values(BOT_IDS).includes(id as BotId)) return true
  // personality-specific bot IDs all start with 00000000-0000-0000-00 and end with -000000000000
  return id.startsWith('00000000-0000-0000-00') && id.endsWith('-000000000000')
}
