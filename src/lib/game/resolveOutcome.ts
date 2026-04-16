import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type DBClient = SupabaseClient<Database>

type Outcome = 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent'

const HOARD_ANNOUNCEMENTS = [
  'A merchant caravan paid tribute at the city gates. The Hoard is replenished.',
  'The autumn harvest tithe has arrived from the southern villages. The coffers fill.',
  'A wayward knight settled his gambling debts to the crown. The realm is enriched.',
  'The monastery sent its winter donation. The Commons gives thanks.',
  'Taxes levied upon the wool traders have reached the treasury. Spend wisely.',
  'A noble house paid its toll upon the King\u2019s Road. Gold flows into the Hoard.',
  'The guild masters convened and offered tribute. The Hoard is renewed.',
  'Spoils from a southern expedition have been delivered to the vault.',
  'The river merchants surrendered their river tax. The Hoard grows fat.',
  'A bounty of seized contraband was sold at auction. The treasury prospers.',
]

export async function resolveOutcome(duelId: string, admin: DBClient) {
  const { data: duel } = await admin
    .from('duels')
    .select('*, wagers(*)')
    .eq('id', duelId)
    .single()

  if (!duel || duel.status === 'completed') return

  const stake = duel.wagers.gold_amount
  const p1 = duel.player1_id
  const p2 = duel.player2_id
  const d1 = duel.player1_decision
  const d2 = duel.player2_decision
  const m1 = duel.player1_messaged
  const m2 = duel.player2_messaged

  // Determine outcome
  let outcome: Outcome
  const p1Silent = !m1
  const p2Silent = !m2

  if (p1Silent && p2Silent) {
    outcome = 'both_silent'
  } else if (p1Silent) {
    outcome = 'p1_silent'
  } else if (p2Silent) {
    outcome = 'p2_silent'
  } else if (d1 === 'pledge' && d2 === 'pledge') {
    outcome = 'both_pledge'
  } else if (d1 === 'betray' && d2 === 'betray') {
    outcome = 'both_betray'
  } else if (d1 === 'betray') {
    outcome = 'p1_betray'
  } else if (d2 === 'betray') {
    outcome = 'p2_betray'
  } else {
    if (d1 && !d2) outcome = 'p1_betray'
    else if (d2 && !d1) outcome = 'p2_betray'
    else outcome = 'both_betray'
  }

  // Fetch hoard
  const { data: hoard } = await admin.from('hoard').select('*').single()
  const hoardBalance = hoard?.balance ?? 0

  // Calculate gold deltas
  let p1Delta = 0
  let p2Delta = 0
  let hoardDelta = 0

  switch (outcome) {
    case 'both_pledge': {
      const bonus = Math.floor(stake * 0.25)
      const canBonus = hoardBalance >= stake * 0.5
      p1Delta = canBonus ? bonus : 0
      p2Delta = canBonus ? bonus : 0
      hoardDelta = canBonus ? -(bonus * 2) : 0
      break
    }
    case 'both_betray': {
      p1Delta = -stake
      p2Delta = -stake
      hoardDelta = stake * 2
      break
    }
    case 'p1_betray': {
      p1Delta = stake
      p2Delta = -stake
      break
    }
    case 'p2_betray': {
      p1Delta = -stake
      p2Delta = stake
      break
    }
    case 'p1_silent': {
      p1Delta = -stake
      p2Delta = stake
      break
    }
    case 'p2_silent': {
      p1Delta = stake
      p2Delta = -stake
      break
    }
    case 'both_silent': {
      p1Delta = -stake
      p2Delta = -stake
      hoardDelta = stake * 2
      break
    }
  }

  // Apply gold changes
  const { data: p1User } = await admin.from('users').select('gold_balance').eq('id', p1).single()
  const { data: p2User } = await admin.from('users').select('gold_balance').eq('id', p2).single()

  await admin.from('users').update({ gold_balance: (p1User?.gold_balance ?? 0) + p1Delta }).eq('id', p1)
  await admin.from('users').update({ gold_balance: (p2User?.gold_balance ?? 0) + p2Delta }).eq('id', p2)

  // Update hoard — insert announcement if refilled
  if (hoardDelta !== 0 && hoard) {
    let newBalance = hoardBalance + hoardDelta
    const wasRefilled = newBalance < 100
    if (wasRefilled) newBalance += 200
    await admin.from('hoard').update({ balance: newBalance }).eq('id', hoard.id)
    if (wasRefilled) {
      const message = HOARD_ANNOUNCEMENTS[Math.floor(Math.random() * HOARD_ANNOUNCEMENTS.length)]
      await admin.from('hoard_announcements').insert({ message, gold_added: 200 })
    }
  }

  // Apply bans for silent players
  if (outcome === 'p1_silent') {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await admin.from('users').update({ is_banned: true, banned_until: until }).eq('id', p1)
  }
  if (outcome === 'p2_silent') {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await admin.from('users').update({ is_banned: true, banned_until: until }).eq('id', p2)
  }

  // Mark duel complete
  await admin.from('duels').update({ status: 'completed', outcome }).eq('id', duelId)
  await admin.from('wagers').update({ status: 'completed' }).eq('id', duel.wager_id)
}
