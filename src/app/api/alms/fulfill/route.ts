import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { requestId } = await req.json()
  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })

  const admin = createAdminClient()

  const { data: request } = await admin
    .from('alms_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'open') return NextResponse.json({ error: 'Request already fulfilled' }, { status: 409 })
  if (request.requester_id === user.id)
    return NextResponse.json({ error: 'Cannot fulfill your own request' }, { status: 400 })

  const [{ data: donor }, { data: recipient }] = await Promise.all([
    admin.from('users').select('gold_balance, honor_score').eq('id', user.id).single(),
    admin.from('users').select('gold_balance').eq('id', request.requester_id).single(),
  ])

  if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
  if (!recipient) return NextResponse.json({ error: 'Requester not found' }, { status: 404 })
  if (donor.gold_balance < request.gold_amount)
    return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })

  const honorGain = Math.max(1, Math.floor(request.gold_amount * 0.1))

  // Mark request fulfilled, transfer gold, add honor
  await Promise.all([
    admin.from('alms_requests').update({ status: 'fulfilled', fulfilled_by: user.id }).eq('id', requestId),
    admin.from('users').update({ gold_balance: donor.gold_balance - request.gold_amount }).eq('id', user.id),
    admin.from('users').update({ gold_balance: recipient.gold_balance + request.gold_amount }).eq('id', request.requester_id),
    admin.from('users').update({ honor_score: donor.honor_score + honorGain }).eq('id', user.id),
    admin.from('alms_donations').insert({
      donor_id: user.id,
      recipient_id: request.requester_id,
      gold_amount: request.gold_amount,
    }),
  ])

  return NextResponse.json({ success: true, honorGain })
}
