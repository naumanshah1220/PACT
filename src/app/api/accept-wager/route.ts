import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to challenge' }, { status: 401 })

  const { wagerId } = await req.json()

  // Lock: fetch and validate wager
  const { data: wager } = await supabase
    .from('wagers').select('*').eq('id', wagerId).single()
  if (!wager) return NextResponse.json({ error: 'Wager not found' }, { status: 404 })
  if (wager.status !== 'open') return NextResponse.json({ error: 'Wager already taken' }, { status: 409 })
  if (wager.poster_id === user.id) return NextResponse.json({ error: 'Cannot challenge yourself' }, { status: 400 })

  // Check challenger balance
  const { data: challenger } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!challenger) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (challenger.gold_balance < wager.gold_amount)
    return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })

  // Mark wager active
  await supabase.from('wagers').update({ status: 'active' }).eq('id', wagerId)

  // Create duel
  const deadline = new Date(Date.now() + wager.timer_minutes * 60 * 1000).toISOString()
  const { data: duel, error } = await supabase.from('duels').insert({
    wager_id: wagerId,
    player1_id: wager.poster_id,
    player2_id: user.id,
    deadline,
    status: 'active',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ duelId: duel.id })
}
