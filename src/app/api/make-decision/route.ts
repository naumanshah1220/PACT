import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duelId, decision } = await req.json()
  if (decision !== 'pledge' && decision !== 'betray')
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })

  const admin = createAdminClient()

  const { data: duel } = await admin
    .from('duels')
    .select('player1_id, player2_id')
    .eq('id', duelId)
    .single()
  if (!duel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (duel.player1_id !== user.id && duel.player2_id !== user.id)
    return NextResponse.json({ error: 'Not your duel' }, { status: 403 })

  const field = duel.player1_id === user.id ? 'player1_decision' : 'player2_decision'
  await admin.from('duels').update({ [field]: decision }).eq('id', duelId)

  return NextResponse.json({ ok: true })
}
