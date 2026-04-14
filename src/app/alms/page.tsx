import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'
import AlmsClient from './AlmsClient'

export default async function AlmsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()

  const { data: donations } = await supabase
    .from('alms_donations')
    .select('*, donor:users!alms_donations_donor_id_fkey(username, display_initials), recipient:users!alms_donations_recipient_id_fkey(username, display_initials)')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: players } = await supabase
    .from('users')
    .select('id, username, display_initials, gold_balance')
    .neq('id', authUser.id)
    .order('username')

  return (
    <>
      <BanBanner />
      <PactHeader />
      <AlmsClient
        currentUser={profile!}
        donations={donations ?? []}
        players={players ?? []}
      />
    </>
  )
}
