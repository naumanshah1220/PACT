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
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      if (data) setUser(data)
    })
  }, [])

  function openTutorial() {
    if (window.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('open-tutorial'))
    } else {
      window.location.href = '/?tutorial=1'
    }
  }

  return (
    <header className="border-b border-[#D4CCBA] sticky top-0 z-50" style={{ backgroundColor: '#EEEDE4' }}>
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-fell text-[2.2rem] leading-none text-[#1a1208]" style={{ fontStyle: 'normal' }}>
              PACT
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-6 bg-[#1a1208] opacity-30" />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#999]">A Game of Trust</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <button
              onClick={openTutorial}
              className="w-7 h-7 rounded-full border border-[#D4CCBA] flex items-center justify-center font-mono text-xs text-[#aaa] hover:text-[#555] hover:border-[#aaa] transition-colors"
              title="How to play"
            >?</button>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 border border-[#D4CCBA] rounded-full px-3 py-1.5 font-mono text-xs"
                  style={{ backgroundColor: '#F5F3EA' }}
                >
                  <span className="text-amber-700">⬡</span>
                  <span className="font-medium">{user.gold_balance}</span>
                  <span className="text-[#999]">Gold</span>
                </Link>
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full border border-[#D4CCBA] flex items-center justify-center font-mono text-xs font-medium"
                  style={{ backgroundColor: '#E6E3D8' }}
                >
                  {user.display_initials}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="font-mono text-xs border border-[#D4CCBA] rounded-full px-3 py-1.5 transition-colors hover:bg-[#F5F3EA]"
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
