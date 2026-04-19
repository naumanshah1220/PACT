import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { BOT_CONFIG, getBotDecision, isBotId } from '@/lib/bots'

export async function POST(req: Request) {
  const supabase = await createClient()

  let { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const { data } = await supabase.auth.getUser(authHeader.slice(7))
      user = data.user
    }
  }
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { botId } = await req.json()
  if (!isBotId(botId)) return NextResponse.json({ error: 'Invalid bot' }, { status: 400 })

  const admin = createAdminClient()
  const cfg = BOT_CONFIG[botId]

  // Ensure profile exists for anonymous users
  const { data: existing } = await admin.from('users').select('id').eq('id', user.id).single()
  if (!existing) {
    const guestNum = Math.floor(Math.random() * 9000) + 1000
    await admin.from('users').insert({
      id: user.id,
      username: `Guest${guestNum}`,
      display_initials: 'GS',
      gold_balance: 0,
      honor_score: 0,
      newbie_day: 1,
    })
  }

  const decision = getBotDecision(cfg.strategy)
  const deadline = new Date(Date.now() + cfg.timerMinutes * 60 * 1000).toISOString()

  // Create wager directly as active — never enters the public open pool
  const { data: wager, error: wagerErr } = await admin.from('wagers').insert({
    poster_id: botId,
    gold_amount: cfg.goldAmount,
    timer_minutes: cfg.timerMinutes,
    status: 'active',
    practice: true,
    spectators_allowed: false,
  }).select('id').single()
  if (wagerErr || !wager) return NextResponse.json({ error: 'Could not create wager' }, { status: 500 })

  const { data: duel, error: duelErr } = await admin.from('duels').insert({
    wager_id: wager.id,
    player1_id: botId,
    player2_id: user.id,
    deadline,
    status: 'active',
    player1_decision: decision,
    player1_messaged: true,
  }).select('id').single()
  if (duelErr || !duel) return NextResponse.json({ error: 'Could not create duel' }, { status: 500 })

  await admin.from('messages').insert({
    duel_id: duel.id,
    sender_id: botId,
    content: cfg.greeting,
  })

  return NextResponse.json({ duelId: duel.id })
}
