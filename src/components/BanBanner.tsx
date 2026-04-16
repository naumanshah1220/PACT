'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BanBanner() {
  const [bannedUntil, setBannedUntil] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('is_banned, banned_until')
        .eq('id', user.id)
        .single()
      if (data?.is_banned && data.banned_until) {
        const until = new Date(data.banned_until)
        if (until > new Date()) setBannedUntil(data.banned_until)
      }
    })
  }, [])

  if (!bannedUntil) return null

  const d = new Date(bannedUntil)
  return (
    <div className="bg-[#faece7] border-b border-[#993C1D] text-[#993C1D] text-center py-2 px-4">
      <span className="font-mono text-xs tracking-wide">
        You are banished until {d.toLocaleString()}. Honour demands patience.
      </span>
    </div>
  )
}
