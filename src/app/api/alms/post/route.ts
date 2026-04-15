import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goldAmount, message } = await req.json()
  if (!goldAmount || goldAmount < 1 || goldAmount > 100)
    return NextResponse.json({ error: 'Amount must be between 1 and 100' }, { status: 400 })

  const admin = createAdminClient()

  // Only one open request per player at a time
  const { data: existing } = await admin
    .from('alms_requests')
    .select('id')
    .eq('requester_id', user.id)
    .eq('status', 'open')
    .limit(1)
  if (existing && existing.length > 0)
    return NextResponse.json({ error: 'You already have an open request' }, { status: 400 })

  const { error } = await admin.from('alms_requests').insert({
    requester_id: user.id,
    gold_amount: goldAmount,
    message: message ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
