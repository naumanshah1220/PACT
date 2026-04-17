import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { BOT_CONFIG, getBotDecision, isBotId } from '@/lib/bots'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to challenge' }, { status: 401 })

  const { wagerId } = await req.json()

  const { data: wager } = await supabase
    .from('wagers').select('*').eq('id', wagerId).single()
  if (!wager) return NextResponse.json({ error: 'Wager not found' }, { status: 404 })
  if (wager.status !== 'open') return NextResponse.json({ error: 'Wager already taken' }, { status: 409 })
  if (wager.poster_id === user.id) return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 })

  const admin = createAdminClient()

  let { data: challenger } = await admin.from('users').select('*').eq('id', user.id).single()

  if (!challenger) {
    if (!wager.practice) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    const guestNum = Math.floor(Math.random() * 9000) + 1000
    const { data: newProfile } = await admin.from('users').insert({
      id: user.id,
      username: `Guest${guestNum}`,
      display_initials: 'GS',
      gold_balance: 0,
      honor_score: 0,
      newbie_day: 1,
    }).select().single()
    challenger = newProfile
    if (!challenger) return NextResponse.json({ error: 'Could not create guest profile' }, { status: 500 })
  }

  const { data: activeDuels } = await admin
    .from('duels').select('id').eq('status', 'active')
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).limit(1)
  if (activeDuels && activeDuels.length > 0)
    return NextResponse.json({ error: 'Finish your current duel before starting another' }, { status: 400 })

  if (!wager.practice && challenger.gold_balance < wager.gold_amount)
    return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })

  await admin.from('wagers').update({ status: 'active' }).eq('id', wagerId)

  const deadline = new Date(Date.now() + wager.timer_minutes * 60 * 1000).toISOString()
  const { data: duel, error } = await admin.from('duels').insert({
    wager_id: wagerId,
    player1_id: wager.poster_id,
    player2_id: user.id,
    deadline,
    status: 'active',
  }).select().single()

  if (error || !duel) return NextResponse.json({ error: error?.message ?? 'Failed to create duel' }, { status: 500 })

  if (isBotId(wager.poster_id)) {
    const cfg = BOT_CONFIG[wager.poster_id]
    const decision = getBotDecision(cfg.strategy)
    await admin.from('messages').insert({
      duel_id: duel.id,
      sender_id: wager.poster_id,
      content: cfg.greeting,
    })
    await admin.from('duels').update({
      player1_messaged: true,
      player1_decision: decision,
    }).eq('id', duel.id)
  }

  return NextResponse.json({ duelId: duel.id })
}
