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
    .select('id, username, gold_balance, honorific')
    .order('gold_balance', { ascending: false })
    .limit(20)

  return (
    <>
      <PactHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div style={{ isolation: 'isolate', backgroundColor: '#EEEDE4' }} className="mb-4">
            <img src="/icons/nobles.png" alt="" width={160} height={160} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <h1 className="font-fell text-3xl">House of Nobles</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">
            Ranked by Gold
          </p>
        </div>

        <NoblesClient initialNobles={nobles ?? []} currentUserId={user?.id ?? null} />

        <div className="mt-8">
          <Link href="/" className="font-mono text-[11px] text-[#888] hover:text-[#111]">
            ← Tavern
          </Link>
        </div>
      </main>
    </>
  )
}
