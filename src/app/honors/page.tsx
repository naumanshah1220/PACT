import { createClient } from '@/lib/supabase/server'
import PactHeader from '@/components/PactHeader'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

export const revalidate = 60

export default async function HonorsPage() {
  const supabase = await createClient()
  const { data: players } = await supabase
    .from('users')
    .select('id, username, display_initials, honor_score, gold_balance')
    .order('honor_score', { ascending: false })
    .limit(50)

  return (
    <>
      <PactHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div style={{ isolation: 'isolate', backgroundColor: '#EEEDE4' }} className="mb-4">
            <img src="/icons/honors.png" alt="" width={160} height={160} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <h1 className="font-serif text-3xl font-bold">Book of Honours</h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mt-1">
            Those who gave freely
          </p>
        </div>

        <div className="space-y-2">
          {(players ?? []).map((p, i) => (
            <div
              key={p.id}
              className="bg-white border border-[#d8d4cc] rounded-[12px] px-4 py-3 flex items-center gap-3 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="font-mono text-[10px] text-[#bbb] w-5">{String(i + 1).padStart(2, '0')}</span>
              <Avatar initials={p.display_initials} size="sm" />
              <div className="flex-1">
                <span className="font-sans text-sm font-medium">{p.username}</span>
              </div>
              <div className="text-right">
                <span className="font-serif text-lg font-bold">{p.honor_score}</span>
                <span className="font-mono text-[10px] text-[#888] block">honour</span>
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
