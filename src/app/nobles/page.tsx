import { createClient } from '@/lib/supabase/server'
import PactHeader from '@/components/PactHeader'
import Link from 'next/link'
import NoblesClient from './NoblesClient'

export const revalidate = 60

export default async function NoblesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: nobles } = await supabase
    .from('users')
    .select('id, username, gold_balance, player_number')
    .order('gold_balance', { ascending: false })
    .range(0, 19)

  return (
    <>
      <PactHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold">House of Nobles</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">
            Ranked by Gold
          </p>
        </div>

        <NoblesClient
          initialNobles={nobles ?? []}
          currentUserId={user?.id ?? null}
          initialOffset={nobles?.length ?? 0}
        />

        <div className="mt-8">
          <Link href="/" className="font-mono text-[11px] text-[#888] hover:text-[#111]">← Tavern</Link>
        </div>
      </main>
    </>
  )
}
