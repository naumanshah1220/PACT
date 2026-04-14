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
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    currentUser = data
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
      />
    </>
  )
}
