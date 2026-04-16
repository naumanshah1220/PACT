import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { resolveOutcome } from '@/lib/game/resolveOutcome'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duelId } = await req.json()
  const admin = createAdminClient()

  const { data: duel } = await admin.from('duels').select('*, wagers(*)').eq('id', duelId).single()
  if (!duel) return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
  if (duel.player1_id !== user.id && duel.player2_id !== user.id)
    return NextResponse.json({ error: 'Not your duel' }, { status: 403 })
  if (duel.status !== 'active')
    return NextResponse.json({ error: 'Duel not active' }, { status: 400 })

  const myDecision = duel.player1_id === user.id ? duel.player1_decision : duel.player2_decision
  if (!myDecision)
    return NextResponse.json({ error: 'Choose pledge or betray first' }, { status: 400 })

  if (!duel.seal_requested_by) {
    await admin.from('duels').update({ seal_requested_by: user.id }).eq('id', duelId)
    return NextResponse.json({ sealRequested: true })
  }

  if (duel.seal_requested_by === user.id)
    return NextResponse.json({ waiting: true })

  await resolveOutcome(duelId, admin)
  return NextResponse.json({ resolved: true })
}
