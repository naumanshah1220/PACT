import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'
import AlmsClient from './AlmsClient'

export default async function AlmsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const admin = createAdminClient()

  const [{ data: profile }, { data: requests }] = await Promise.all([
    admin.from('users').select('*').eq('id', authUser.id).single(),
    admin
      .from('alms_requests')
      .select('*, requester:users!alms_requests_requester_id_fkey(id, username, display_initials, player_number)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <>
      <BanBanner />
      <PactHeader />
      <AlmsClient
        currentUser={profile!}
        requests={requests ?? []}
      />
    </>
  )
}
