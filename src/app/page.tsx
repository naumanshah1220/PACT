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
  let activeDuels: Array<{
    id: string
    deadline: string
    opponent: { username: string; display_initials: string }
  }> = []

  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    currentUser = profile

    const { data: duelsRaw } = await supabase
      .from('duels')
      .select('id, deadline, player1_id, player2_id, player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials)')
      .eq('status', 'active')
      .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)

    if (duelsRaw) {
      activeDuels = (duelsRaw as any[]).map(d => {
        const isP1 = d.player1_id === authUser.id
        const opponent = isP1 ? d.player2 : d.player1
        return { id: d.id, deadline: d.deadline, opponent }
      })
    }
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
