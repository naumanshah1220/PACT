import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isBotId } from '@/lib/bots'

const BOT_REPLIES: Record<string, string[]> = {
  '00000000-0000-0000-0001-000000000000': [
    'The Lord watches over us both. Choose wisely, friend.',
    'I have placed my hand in good faith. The choice is yours now.',
    'A soul at peace has nothing to fear from an honest pact.',
    'I have known men who betrayed for gold. They grew old alone.',
    'Whatever you decide, I will pray for your peace tonight.',
    'Trust given freely is worth more than gold taken by force.',
    'May your conscience guide you true.',
  ],
  '00000000-0000-0000-0002-000000000000': [
    'Heh. Words change nothing.',
    'Say what you like. My mind is set.',
    "I've heard sweeter talk from marks at the gallows.",
    'Keep talking. It only makes this easier for me.',
    'Honour is for those who cannot afford otherwise.',
    'You really think persuasion works on me? Charming.',
    'Save the speeches. The decision is already made.',
  ],
  '00000000-0000-0000-0003-000000000000': [
    'My ledger is patient. Yours should be too.',
    'I hear you. The deal stands as it stands.',
    'Mutual trust is good for business. Usually.',
    'In my experience, the honest path pays better over time.',
    'I have built an empire on handshakes. Weigh this one carefully.',
    'Risk and reward, friend. The numbers speak for themselves.',
    'I do not deal in empty promises. Only results.',
  ],
  '00000000-0000-0000-0004-000000000000': [
    'The stars offer no comfort tonight.',
    'What will be, will be.',
    'Even I cannot see beyond the veil of this moment.',
    'The threads of fate are tangled here. I cannot read them.',
    'Some choices write themselves. Others require a steady hand.',
    'I have seen both endings. Neither surprised me.',
    'The answer you seek is already within you.',
  ],
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { duelId, content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const admin = createAdminClient()

  const { data: duel } = await admin
    .from('duels')
    .select('player1_id, player2_id')
    .eq('id', duelId)
    .single()
  if (!duel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (duel.player1_id !== user.id && duel.player2_id !== user.id)
    return NextResponse.json({ error: 'Not your duel' }, { status: 403 })

  const isP1 = duel.player1_id === user.id
  const opponentId = isP1 ? duel.player2_id : duel.player1_id
  const playerField = isP1 ? 'player1_messaged' : 'player2_messaged'

  await Promise.all([
    admin.from('messages').insert({ duel_id: duelId, sender_id: user.id, content: content.trim() }),
    admin.from('duels').update({ [playerField]: true }).eq('id', duelId),
  ])

  // Notify the human opponent — but only if they don't already have an unread message notification for this duel
  if (!isBotId(opponentId)) {
    const [{ data: senderProfile }, { count }] = await Promise.all([
      admin.from('users').select('username').eq('id', user.id).single(),
      admin.from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', opponentId)
        .eq('type', 'new_message')
        .eq('link', `/duel/${duelId}`)
        .eq('read', false),
    ])
    if (!count) {
      await admin.from('notifications').insert({
        user_id: opponentId,
        type: 'new_message',
        title: `💬 ${senderProfile?.username ?? 'Someone'} sent you a message`,
        link: `/duel/${duelId}`,
      })
    }
  }

  if (isBotId(opponentId)) {
    const { data: sentMsgs } = await admin
      .from('messages')
      .select('content')
      .eq('duel_id', duelId)
      .eq('sender_id', opponentId)

    if ((sentMsgs?.length ?? 0) < 5) {
      const replies = BOT_REPLIES[opponentId] ?? []
      const usedContents = new Set((sentMsgs ?? []).map((m: any) => m.content as string))
      const available = replies.filter(r => !usedContents.has(r))
      const pool = available.length > 0 ? available : replies
      if (pool.length > 0) {
        const reply = pool[Math.floor(Math.random() * pool.length)]
        await admin.from('messages').insert({ duel_id: duelId, sender_id: opponentId, content: reply })
      }
    }
  }

  const { data: messages } = await admin
    .from('messages')
    .select('*, users(*)')
    .eq('duel_id', duelId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: messages ?? [] })
}
