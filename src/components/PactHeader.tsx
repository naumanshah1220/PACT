'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type HeaderUser = { gold_balance: number; display_initials: string; newbie_day: number }

function getNextMidnightMs(): number {
  const now = new Date()
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ))
  return next.getTime() - now.getTime()
}

function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getDailyGrant(day: number): number {
  if (day <= 3) return 50
  if (day <= 7) return 25
  return 5
}

export default function PactHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [countdown, setCountdown] = useState('')
  const supabase = useRef(createClient()).current

  async function fetchUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { data } = await supabase
      .from('users')
      .select('gold_balance, display_initials, newbie_day')
      .eq('id', authUser.id)
      .single()
    if (data) setUser(data as HeaderUser)
  }

  useEffect(() => {
    fetchUser()
    window.addEventListener('focus', fetchUser)
    return () => window.removeEventListener('focus', fetchUser)
  }, [])

  useEffect(() => {
    function tick() { setCountdown(formatCountdown(getNextMidnightMs())) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="border-b border-[#d8d4cc] bg-[#eae8e1] sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-fell text-4xl leading-none tracking-tight">PACT</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-[1.5px] w-6 bg-black" />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">A Game of Trust</span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" className="flex flex-col bg-white border border-[#d8d4cc] rounded-xl px-3 py-1.5 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/coin.png" alt="" className="w-[18px] h-[18px] object-contain" style={{ mixBlendMode: 'multiply' }} />
                    <span className="font-medium">{user.gold_balance}</span>
                    <span className="text-[#888]">Gold</span>
                  </div>
                  {countdown && (
                    <span className="text-[9px] text-[#bbb] leading-tight mt-0.5">
                      +{getDailyGrant(user.newbie_day)} in {countdown}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="w-8 h-8 rounded-full bg-[#f0ede6] border border-[#d8d4cc] flex items-center justify-center font-mono text-xs font-medium">
                  {user.display_initials}
                </Link>
              </>
            ) : (
              <Link href="/login" className="font-mono text-xs border border-[#d8d4cc] rounded-full px-3 py-1.5 hover:bg-white transition-colors">Sign in</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
