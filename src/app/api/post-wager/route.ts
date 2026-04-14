import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goldAmount, timerMinutes } = await req.json()

  // Fetch user
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Newbie cap
  const maxWager = profile.newbie_day <= 3 ? 5 : profile.newbie_day <= 7 ? 10 : profile.gold_balance
  if (goldAmount > maxWager) return NextResponse.json({ error: `Max wager is ${maxWager}` }, { status: 400 })
  if (goldAmount > profile.gold_balance) return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })
  if (goldAmount < 1) return NextResponse.json({ error: 'Minimum wager is 1' }, { status: 400 })

  const { data: wager, error } = await supabase.from('wagers').insert({
    poster_id: user.id,
    gold_amount: goldAmount,
    timer_minutes: timerMinutes,
    status: 'open',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ wager })
}
