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
    <header className="border-b border-[#cec4ae] bg-[#e6dfd0] sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-fell text-[2.2rem] leading-none tracking-tight" style={{fontStyle:'normal'}}>PACT</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-6 bg-[#1a1208] opacity-40" />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#888]">A Game of Trust</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 bg-[#f0ead8] border border-[#cec4ae] rounded-full px-3 py-1.5 font-mono text-xs"
                >
                  <span className="text-amber-700">⬡</span>
                  <span className="font-medium">{user.gold_balance}</span>
                  <span className="text-[#888]">Gold</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-[#e0d8c8] border border-[#cec4ae] flex items-center justify-center font-mono text-xs font-medium"
                >
                  {user.display_initials}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="font-mono text-xs border border-[#cec4ae] rounded-full px-3 py-1.5 hover:bg-[#f0ead8] transition-colors"
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
