import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DuelRoom from './DuelRoom'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'

export default async function DuelPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: duel } = await supabase
    .from('duels')
    .select('*, wagers(*), player1:users!duels_player1_id_fkey(*), player2:users!duels_player2_id_fkey(*)')
    .eq('id', params.id)
    .single()

  if (!duel) notFound()
  if (duel.player1_id !== authUser.id && duel.player2_id !== authUser.id) notFound()

  if (duel.status === 'completed') {
    redirect(`/result/${duel.id}`)
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*, users(*)')
    .eq('duel_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <>
      <BanBanner />
      <PactHeader />
      <DuelRoom
        duel={duel as any}
        initialMessages={messages ?? []}
        currentUserId={authUser.id}
      />
    </>
  )
}
