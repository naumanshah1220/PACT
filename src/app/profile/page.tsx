import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const admin = createAdminClient()

  let { data: profile } = await supabase
    .from('users').select('*').eq('id', authUser.id).single()
  if (!profile) redirect('/login')

  // Daily gold grant for new players (days 1-7)
  if (profile.newbie_day <= 7) {
    const today = new Date().toISOString().split('T')[0]
    const lastGold = (profile as any).last_daily_gold_at as string | null
    if (!lastGold || lastGold < today) {
      const { data: updated } = await admin
        .from('users')
        .update({
          gold_balance: profile.gold_balance + 50,
          last_daily_gold_at: today,
        } as any)
        .eq('id', authUser.id)
        .or(`last_daily_gold_at.is.null,last_daily_gold_at.lt.${today}`)
        .select('*')
        .single()
      if (updated) profile = updated
    }
  }

  // Fetch duel history (completed)
  const { data: duels } = await supabase
    .from('duels')
    .select('*, wagers(*), player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials)')
    .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  // Total duel count (all statuses)
  const { count: totalDuels } = await supabase
    .from('duels')
    .select('*', { count: 'exact', head: true })
    .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)

  return (
    <>
      <BanBanner />
      <PactHeader />
      <ProfileClient
        profile={profile}
        duels={duels ?? []}
        totalDuels={totalDuels ?? 0}
        completedDuels={duels?.length ?? 0}
      />
    </>
  )
}
