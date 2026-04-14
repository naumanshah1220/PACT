import { createClient } from '@/lib/supabase/server'
import TavernClient from './TavernClient'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'

export const revalidate = 0

export default async function TavernPage() {
  const supabase = await createClient()

  const { data: wagers } = await supabase
    .from('wagers')
    .select('*, users(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(60)

  const { data: { user: authUser } } = await supabase.auth.getUser()
  let currentUser = null
  let activeDuels: any[] = []

  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    currentUser = data

    // Fetch active duels so the poster can access their own duel room
    const { data: duels } = await supabase
      .from('duels')
      .select('id, wager_id, player1_id, player2_id, deadline, wagers(gold_amount), player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials)')
      .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    activeDuels = duels ?? []
  }

  const { data: hoard } = await supabase.from('hoard').select('balance').single()

  return (
    <>
      <BanBanner />
      <PactHeader />
      <TavernClient
        initialWagers={wagers ?? []}
        currentUser={currentUser}
        hoardBalance={hoard?.balance ?? 0}
        activeDuels={activeDuels}
      />
    </>
  )
}
