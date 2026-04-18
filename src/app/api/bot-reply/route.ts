import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { isBotId } from '@/lib/bots'

const BOT_REPLIES: Record<string, string[]> = {
  '00000000-0000-0000-0001-000000000000': [
    'The Lord watches over us both. Choose wisely, friend.',
    'I have placed my hand in good faith. The choice is yours now.',
    'May your conscience guide you true.',
  ],
  '00000000-0000-0000-0002-000000000000': [
    'Heh. Words change nothing.',
    'Say what you like. My mind is set.',
    "I've heard sweeter talk from marks at the gallows.",
  ],
  '00000000-0000-0000-0003-000000000000': [
    'My ledger is patient. Yours should be too.',
    'I hear you. The deal stands as it stands.',
    'Mutual trust is good for business. Usually.',
  ],
  '00000000-0000-0000-0004-000000000000': [
    'The stars offer no comfort tonight.',
    'What will be, will be.',
    'Even I cannot see beyond the veil of this moment.',
  ],
}

export async function POST(req: Request) {
  const { duelId, botId } = await req.json()
  if (!isBotId(botId)) return NextResponse.json({ ok: false })

  const admin = createAdminClient()

  // Only reply once (after the initial greeting)
  const { count } = await admin
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('duel_id', duelId)
    .eq('sender_id', botId)

  if ((count ?? 0) >= 2) return NextResponse.json({ ok: false, reason: 'already replied' })

  const replies = BOT_REPLIES[botId] ?? []
  if (!replies.length) return NextResponse.json({ ok: false })

  const reply = replies[Math.floor(Math.random() * replies.length)]
  await admin.from('messages').insert({ duel_id: duelId, sender_id: botId, content: reply })

  return NextResponse.json({ ok: true })
}
