import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { resolveOutcome } from '@/lib/game/resolveOutcome'

// This route is called by the Supabase cron/edge function for expired duels
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find all active duels past deadline
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
