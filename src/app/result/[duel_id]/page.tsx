import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ResultClient from './ResultClient'
import PactHeader from '@/components/PactHeader'

export default async function ResultPage({ params }: { params: { duel_id: string } }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: duel } = await supabase
    .from('duels')
    .select('*, wagers(*), player1:users!duels_player1_id_fkey(*), player2:users!duels_player2_id_fkey(*)')
    .eq('id', params.duel_id)
    .single()

  if (!duel) notFound()
  if (duel.player1_id !== authUser.id && duel.player2_id !== authUser.id) notFound()

  return (
    <>
      <PactHeader />
      <ResultClient duel={duel as any} currentUserId={authUser.id} />
    </>
  )
}
