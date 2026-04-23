import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function dailyGrant(newbieDay: number): number {
  if (newbieDay <= 3) return 500
  if (newbieDay <= 7) return 250
  return 50
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find all real (non-bot) users who haven't received a grant today
  const todayUTC = new Date()
  todayUTC.setUTCHours(0, 0, 0, 0)

  const { data: users, error } = await admin
    .from('users')
    .select('id, gold_balance, newbie_day, last_daily_grant')
    .eq('is_bot', false)
    .or(`last_daily_grant.is.null,last_daily_grant.lt.${todayUTC.toISOString()}`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!users?.length) return NextResponse.json({ granted: 0 })

  let granted = 0
  for (const user of users) {
    const amount = dailyGrant(user.newbie_day ?? 0)
    await admin
      .from('users')
      .update({
        gold_balance: (user.gold_balance ?? 0) + amount,
        newbie_day: (user.newbie_day ?? 0) + 1,
        last_daily_grant: new Date().toISOString(),
      })
      .eq('id', user.id)
    granted++
  }

  return NextResponse.json({ granted, timestamp: new Date().toISOString() })
}
