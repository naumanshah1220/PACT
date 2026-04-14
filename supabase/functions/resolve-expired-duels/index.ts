// Supabase Edge Function: resolves all duels past their deadline
// Schedule: every 5 minutes via pg_cron

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

type Outcome = 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent'

async function resolveOutcome(duelId: string) {
  const { data: duel } = await supabase
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

  const { data: hoard } = await supabase.from('hoard').select('*').single()
  const hoardBal = hoard?.balance ?? 0

  let p1Delta = 0, p2Delta = 0, hoardDelta = 0

  switch (outcome) {
    case 'both_pledge': {
      const bonus = Math.floor(stake * 0.25)
      const canBonus = hoardBal >= stake * 0.5
      p1Delta = canBonus ? bonus : 0
      p2Delta = canBonus ? bonus : 0
      hoardDelta = canBonus ? -(bonus * 2) : 0
      break
    }
    case 'both_betray': p1Delta = -stake; p2Delta = -stake; hoardDelta = stake * 2; break
    case 'p1_betray': p1Delta = stake; p2Delta = -stake; break
    case 'p2_betray': p1Delta = -stake; p2Delta = stake; break
    case 'p1_silent': p1Delta = -stake; p2Delta = stake; break
    case 'p2_silent': p1Delta = stake; p2Delta = -stake; break
    case 'both_silent': p1Delta = -stake; p2Delta = -stake; hoardDelta = stake * 2; break
  }

  const [{ data: p1u }, { data: p2u }] = await Promise.all([
    supabase.from('users').select('gold_balance').eq('id', p1).single(),
    supabase.from('users').select('gold_balance').eq('id', p2).single(),
  ])

  await Promise.all([
    supabase.from('users').update({ gold_balance: (p1u?.gold_balance ?? 0) + p1Delta }).eq('id', p1),
    supabase.from('users').update({ gold_balance: (p2u?.gold_balance ?? 0) + p2Delta }).eq('id', p2),
  ])

  if (hoardDelta !== 0 && hoard) {
    let nb = hoardBal + hoardDelta
    if (nb < 100) nb += 200
    await supabase.from('hoard').update({ balance: nb }).eq('id', hoard.id)
  }

  if (outcome === 'p1_silent') {
    const until = new Date(Date.now() + 86400000).toISOString()
    await supabase.from('users').update({ is_banned: true, banned_until: until }).eq('id', p1)
  }
  if (outcome === 'p2_silent') {
    const until = new Date(Date.now() + 86400000).toISOString()
    await supabase.from('users').update({ is_banned: true, banned_until: until }).eq('id', p2)
  }

  await supabase.from('duels').update({ status: 'completed', outcome }).eq('id', duelId)
  await supabase.from('wagers').update({ status: 'completed' }).eq('id', duel.wager_id)
}

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: expired } = await supabase
    .from('duels')
    .select('id')
    .eq('status', 'active')
    .lt('deadline', new Date().toISOString())

  let resolved = 0
  for (const d of (expired ?? [])) {
    await resolveOutcome(d.id)
    resolved++
  }

  return new Response(JSON.stringify({ resolved }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
