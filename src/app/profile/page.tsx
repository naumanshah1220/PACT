import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('*').eq('id', authUser.id).single()
  if (!profile) redirect('/login')

  // Get duel history
  const { data: duels } = await supabase
    .from('duels')
    .select('*, wagers(*), player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials)')
    .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <BanBanner />
      <PactHeader />
      <ProfileClient profile={profile} duels={duels ?? []} />
    </>
  )
}
