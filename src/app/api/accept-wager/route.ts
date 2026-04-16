import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to challenge' }, { status: 401 })

  const { wagerId } = await req.json()

  const { data: wager } = await supabase.from('wagers').select('*').eq('id', wagerId).single()
  if (!wager) return NextResponse.json({ error: 'Wager not found' }, { status: 404 })
  if (wager.status !== 'open') return NextResponse.json({ error: 'Wager already taken' }, { status: 409 })
  if (wager.poster_id === user.id) return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 })

  const { data: activeDuels } = await supabase
    .from('duels').select('id').eq('status', 'active')
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).limit(1)
  if (activeDuels && activeDuels.length > 0)
    return NextResponse.json({ error: 'Finish your current duel before starting another' }, { status: 400 })

  const { data: challenger } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!challenger) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (challenger.gold_balance < wager.gold_amount)
    return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })

  await supabase.from('wagers').update({ status: 'active' }).eq('id', wagerId)

  const deadline = new Date(Date.now() + wager.timer_minutes * 60 * 1000).toISOString()
  const { data: duel, error } = await supabase.from('duels').insert({
    wager_id: wagerId, player1_id: wager.poster_id, player2_id: user.id, deadline, status: 'active',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ duelId: duel.id })
}
