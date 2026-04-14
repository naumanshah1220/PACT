import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipientId, goldAmount } = await req.json()
  if (!recipientId || !goldAmount || goldAmount < 1)
    return NextResponse.json({ error: 'Invalid donation' }, { status: 400 })

  const admin = createAdminClient()

  const { data: donor } = await admin.from('users').select('*').eq('id', user.id).single()
  if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (donor.gold_balance < goldAmount)
    return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })

  const { data: recipient } = await admin.from('users').select('*').eq('id', recipientId).single()
  if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  // Deduct from donor, add to recipient
  await admin.from('users').update({ gold_balance: donor.gold_balance - goldAmount }).eq('id', user.id)
  await admin.from('users').update({ gold_balance: recipient.gold_balance + goldAmount }).eq('id', recipientId)

  // Honor: 10% of donated amount
  const honorGain = Math.max(1, Math.floor(goldAmount * 0.1))
  await admin.from('users').update({ honor_score: donor.honor_score + honorGain }).eq('id', user.id)

  // Record donation
  await admin.from('alms_donations').insert({
    donor_id: user.id,
    recipient_id: recipientId,
    gold_amount: goldAmount,
  })

  return NextResponse.json({ success: true, honorGain })
}
