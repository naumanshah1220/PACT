'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#eae8e1] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl font-bold">PACT</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-[1.5px] w-8 bg-black" />
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase">A Game of Trust</span>
            <div className="h-[1.5px] w-8 bg-black" />
          </div>
        </div>

        <div className="bg-white border border-[#d8d4cc] rounded-[12px] p-6">
          <h2 className="font-serif text-xl mb-5">Enter the Tavern</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa]"
                required
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-[#888] block mb-1">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-[#d8d4cc] rounded-lg px-3 py-2 bg-[#faf9f7] font-sans text-sm focus:outline-none focus:border-[#aaa]"
                required
              />
            </div>
            {error && <p className="font-mono text-xs text-[#993C1D]">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#111] text-white font-sans text-sm font-medium py-2.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? 'Entering…' : 'Enter'}
            </button>
          </form>
          <p className="text-center font-mono text-xs text-[#888] mt-4">
            No account?{' '}
            <Link href="/signup" className="text-[#111] underline">Join the game</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
