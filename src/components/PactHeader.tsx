'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRow } from '@/types/database'

export default function PactHeader() {
  const [user, setUser] = useState<UserRow | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (data) setUser(data)
    })
  }, [])

  return (
    <header className="border-b border-[#d8d4cc] bg-[#eae8e1] sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-4xl font-bold leading-none tracking-tight">PACT</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-[1.5px] w-6 bg-black" />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">A Game of Trust</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 bg-white border border-[#d8d4cc] rounded-full px-3 py-1.5 font-mono text-xs"
                >
                  <div style={{ isolation: 'isolate', backgroundColor: 'white' }}>
                    <img src="/icons/coin.png" alt="" width={24} height={24} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
                  </div>
                  <span className="font-medium">{user.gold_balance}</span>
                  <span className="text-[#888]">Gold</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-[#f0ede6] border border-[#d8d4cc] flex items-center justify-center font-mono text-xs font-medium"
                >
                  {user.display_initials}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="font-mono text-xs border border-[#d8d4cc] rounded-full px-3 py-1.5 hover:bg-white transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
