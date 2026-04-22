import { createClient } from '@/lib/supabase/server'
import PactHeader from '@/components/PactHeader'
import WagerAcceptClient from './WagerAcceptClient'
import type { Metadata } from 'next'

type Props = { params: { id: string } }

export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: wager } = await supabase
    .from('wagers')
    .select('*, users(*)')
    .eq('id', params.id)
    .single()

  if (!wager) return { title: 'PACT' }

  const title = `${wager.users.username} challenges you — ${wager.gold_amount} Gold`
  const description = wager.wager_message
    ? `"${wager.wager_message}" — Will you honour the pact?`
    : `${wager.gold_amount} Gold on the line. Pledge or Betray.`

  return {
    title,
    description,
    openGraph: { title, description, siteName: 'PACT' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function WagerPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const { data: wager } = await supabase
    .from('wagers')
    .select('*, users(*)')
    .eq('id', params.id)
    .single()

  if (!wager) {
    return (
      <>
        <PactHeader />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="font-fell text-2xl mb-3">Challenge not found.</p>
          <p className="font-mono text-xs text-[#888]">This wager may have already been accepted or cancelled.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <PactHeader />
      <WagerAcceptClient wager={wager as any} currentUserId={authUser?.id ?? null} />
    </>
  )
}
