import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type DBClient = SupabaseClient<Database>

type Outcome = 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent'

const HOARD_ANNOUNCEMENTS = [
  'A merchant caravan paid tribute at the city gates. The Hoard is replenished.',
  'The autumn harvest tithe has arrived from the southern villages. The coffers fill.',
  'A shipment of silver from the northern mines has reached the treasury.',
  'The bishop\'s annual tithe has been delivered. Gold flows into the Hoard.',
  'Spoils from a distant campaign have been divided and the Hoard made whole.',
  'A noble house has settled its debt to the crown. The Hoard swells.',
  'The sea trade winds have been kind. Merchant dues replenish the treasury.',
  'A generous benefactor has donated to the common purse. The Hoard is refilled.',
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

  let outcome: Outcome
  if (!m1 && !m2) outcome = 'both_silent'
  else if (!m1) outcome = 'p1_silent'
  else if (!m2) outcome = 'p2_silent'
  else if (d1 === 'pledge' && d2 === 'pledge') outcome = 'both_pledge'
  else if (d1 === 'betray' && d2 === 'betray') outcome = 'both_betray'
  else if (d1 === 'betray') outcome = 'p1_betray'
  else if (d2 === 'betray') outcome = 'p2_betray'
  else if (d1 && !d2) outcome = 'p1_betray'
  else if (d2 && !d1) outcome = 'p2_betray'
  else outcome = 'both_betray'

  if (duel.wagers.practice) {
    await admin.from('duels').update({ status: 'completed', outcome }).eq('id', duelId)
    await admin.from('wagers').update({ status: 'completed' }).eq('id', duel.wager_id)
    return
  }

  const { data: hoard } = await admin.from('hoard').select('*').single()
  const hoardBalance = hoard?.balance ?? 0

  let p1Delta = 0
  let p2Delta = 0
  let hoardDelta = 0

  switch (outcome) {
    case 'both_pledge': {
      // 50% bonus each — total drain from hoard = stake
      const bonus = Math.floor(stake * 0.5)
      const canBonus = hoardBalance >= stake
      p1Delta = canBonus ? bonus : 0
      p2Delta = canBonus ? bonus : 0
      hoardDelta = canBonus ? -(bonus * 2) : 0
      break
    }
    case 'both_betray':
      p1Delta = -stake; p2Delta = -stake; hoardDelta = stake * 2; break
    case 'p1_betray':
      p1Delta = stake; p2Delta = -stake; break
    case 'p2_betray':
      p1Delta = -stake; p2Delta = stake; break
    case 'p1_silent':
      p1Delta = -stake; p2Delta = stake; break
    case 'p2_silent':
      p1Delta = stake; p2Delta = -stake; break
    case 'both_silent':
      p1Delta = -stake; p2Delta = -stake; hoardDelta = stake * 2; break
  }

  const { data: p1User } = await admin.from('users').select('gold_balance, is_bot').eq('id', p1).single()
  const { data: p2User } = await admin.from('users').select('gold_balance, is_bot').eq('id', p2).single()

  if (!p1User?.is_bot)
    await admin.from('users').update({ gold_balance: (p1User?.gold_balance ?? 0) + p1Delta }).eq('id', p1)
  if (!p2User?.is_bot)
    await admin.from('users').update({ gold_balance: (p2User?.gold_balance ?? 0) + p2Delta }).eq('id', p2)

  if (hoardDelta !== 0 && hoard) {
    let newBalance = hoardBalance + hoardDelta
    const wasLow = newBalance < 1000
    if (wasLow) newBalance += 2000
    await admin.from('hoard').update({ balance: newBalance }).eq('id', hoard.id)
    if (wasLow) {
      const msg = HOARD_ANNOUNCEMENTS[Math.floor(Math.random() * HOARD_ANNOUNCEMENTS.length)]
      await admin.from('hoard_announcements').insert({ message: msg, gold_added: 2000 })
    }
  }

  if (outcome === 'p1_silent' && !p1User?.is_bot) {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await admin.from('users').update({ is_banned: true, banned_until: until }).eq('id', p1)
  }
  if (outcome === 'p2_silent' && !p2User?.is_bot) {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await admin.from('users').update({ is_banned: true, banned_until: until }).eq('id', p2)
  }

  await admin.from('duels').update({ status: 'completed', outcome }).eq('id', duelId)
  await admin.from('wagers').update({ status: 'completed' }).eq('id', duel.wager_id)
}
