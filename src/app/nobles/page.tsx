import { createClient } from '@/lib/supabase/server'
import PactHeader from '@/components/PactHeader'
import Link from 'next/link'

export const revalidate = 60

export default async function NoblesPage() {
  const supabase = await createClient()
  const { data: nobles } = await supabase
    .from('users')
    .select('id, username, gold_balance')
    .order('gold_balance', { ascending: false })
    .limit(50)

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

        <div className="space-y-0">
          {(nobles ?? []).map((n, i) => (
            <div key={n.id} className="flex items-center justify-between py-3 border-b border-[#f0ede6]">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-[#bbb] w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-sans text-sm font-medium">{n.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-600 text-xs">⬡</span>
                <span className="font-serif text-base font-bold">{n.gold_balance}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="font-mono text-[11px] text-[#888] hover:text-[#111]">← Tavern</Link>
        </div>
      </main>
    </>
  )
}
