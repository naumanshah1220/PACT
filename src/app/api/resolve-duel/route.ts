import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { resolveOutcome } from '@/lib/game/resolveOutcome'

export async function POST(req: Request) {
  const admin = createAdminClient()

  // Accept CRON_SECRET (from cron job) OR a valid user session (from client timer)
  const authHeader = req.headers.get('authorization')
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!isCron) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: expiredDuels } = await admin
    .from('duels')
    .select('id')
    .eq('status', 'active')
    .lt('deadline', new Date().toISOString())

  if (!expiredDuels || expiredDuels.length === 0) {
    return NextResponse.json({ resolved: 0 })
  }

  for (const d of expiredDuels) {
    await resolveOutcome(d.id, admin)
  }

  return NextResponse.json({ resolved: expiredDuels.length })
}
