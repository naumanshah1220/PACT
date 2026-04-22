import { createClient } from '@/lib/supabase/server'
import PactHeader from '@/components/PactHeader'
import Link from 'next/link'
import HonorsClient from './HonorsClient'

export const revalidate = 60

export default async function HonorsPage() {
  const supabase = await createClient()

  const { data: players } = await supabase
    .from('users')
    .select('id, username, honor_score, display_initials')
    .eq('is_bot', false)
    .order('honor_score', { ascending: false })
    .range(0, 19)

  return (
    <>
      <PactHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <img src="/icons/honors.png" alt="" className="w-20 h-20 object-contain mix-blend-multiply mb-4" />
          <h1 className="font-fell text-3xl">Book of Honours</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">Earned through generosity. Cannot be purchased.</p>
        </div>
        <HonorsClient initialPlayers={players ?? []} initialOffset={players?.length ?? 0} />
        <div className="mt-8">
          <Link href="/" className="font-mono text-[11px] text-[#888] hover:text-[#111]">&larr; Tavern</Link>
        </div>
      </main>
    </>
  )
}
