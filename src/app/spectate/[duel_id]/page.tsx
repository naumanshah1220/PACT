import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PactHeader from '@/components/PactHeader'
import SpectatorRoom from './SpectatorRoom'

export const revalidate = 0

export default async function SpectatePage({ params }: { params: { duel_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: duel } = await supabase
    .from('duels')
    .select('*, wagers(*), player1:users!duels_player1_id_fkey(*), player2:users!duels_player2_id_fkey(*)')
    .eq('id', params.duel_id)
    .single()

  if (!duel) notFound()

  if (user?.id === duel.player1_id || user?.id === duel.player2_id) {
    redirect(`/duel/${duel.id}`)
  }

  if (!duel.wagers.spectators_allowed && duel.status !== 'completed') {
    notFound()
  }

  const visibleDuel = duel.status === 'completed'
    ? duel
    : { ...duel, player1_decision: null, player2_decision: null }

  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(*)')
    .eq('duel_id', duel.id)
    .order('created_at', { ascending: true })

  return (
    <>
      <PactHeader />
      <SpectatorRoom
        duel={visibleDuel as any}
        initialMessages={messages ?? []}
        currentUserId={user?.id ?? null}
      />
    </>
  )
}
