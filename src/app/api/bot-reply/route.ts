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
  const { duelId, botId } = await req.json()
  if (!isBotId(botId)) return NextResponse.json({ ok: false })

  const admin = createAdminClient()

  const { data: sentMsgs } = await admin
    .from('messages')
    .select('content')
    .eq('duel_id', duelId)
    .eq('sender_id', botId)

  if ((sentMsgs?.length ?? 0) >= 5) return NextResponse.json({ ok: false, reason: 'already replied' })

  const replies = BOT_REPLIES[botId] ?? []
  if (!replies.length) return NextResponse.json({ ok: false })

  const usedContents = new Set((sentMsgs ?? []).map(m => m.content))
  const available = replies.filter(r => !usedContents.has(r))
  const pool = available.length > 0 ? available : replies

  const reply = pool[Math.floor(Math.random() * pool.length)]
  await admin.from('messages').insert({ duel_id: duelId, sender_id: botId, content: reply })

  return NextResponse.json({ ok: true })
}
