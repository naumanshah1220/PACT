import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('id, gold_balance, login_streak, last_daily_grant, newbie_day')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000)

  // Already claimed today
  if (profile.last_daily_grant && new Date(profile.last_daily_grant) >= todayUTC) {
    return NextResponse.json({
      already_claimed: true,
      streak: profile.login_streak ?? 0,
      grant: 0,
    })
  }

  // Streak continues only if last grant was yesterday
  const lastGrant = profile.last_daily_grant ? new Date(profile.last_daily_grant) : null
  const continuesStreak = lastGrant !== null && lastGrant >= yesterdayUTC
  const newStreak = continuesStreak ? (profile.login_streak ?? 0) + 1 : 1
  const grant = 200 + (newStreak - 1) * 100

  await admin.from('users').update({
    gold_balance: (profile.gold_balance ?? 0) + grant,
    login_streak: newStreak,
    last_daily_grant: now.toISOString(),
    newbie_day: (profile.newbie_day ?? 0) + 1,
  }).eq('id', user.id)

  return NextResponse.json({ already_claimed: false, grant, streak: newStreak })
}
