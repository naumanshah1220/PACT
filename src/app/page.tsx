import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import TavernClient from './TavernClient'
import PactHeader from '@/components/PactHeader'
import BanBanner from '@/components/BanBanner'
import type { SpectatableDuel } from '@/types/database'
import { BOT_PERSONALITIES } from '@/lib/bots'

export const revalidate = 0

export default async function TavernPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  // Round 1: all independent queries in parallel
  const [wagersResult, spectatableResult, authResult, hoardResult] = await Promise.all([
    admin
      .from('wagers')
      .select('*, users(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('duels')
      .select('id, wager_id, player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials), wagers!inner(id, gold_amount, spectators_allowed, practice, users(username, display_initials))')
      .eq('status', 'active')
      .eq('wagers.spectators_allowed', true)
      .limit(10),
    supabase.auth.getUser(),
    supabase.from('hoard').select('balance').single(),
  ])

  const wagers = (wagersResult.data ?? []).filter((w: any) => !w.users?.is_bot)

  const spectatableDuels: SpectatableDuel[] = (spectatableResult.data ?? []).map((d: any) => ({
    duelId: d.id,
    wagerId: d.wager_id,
    goldAmount: d.wagers.gold_amount,
    spectators_allowed: d.wagers.spectators_allowed,
    practice: d.wagers.practice,
    poster: d.wagers.users,
    p1: d.player1,
    p2: d.player2,
  }))

  const botOptions = BOT_PERSONALITIES.map((p, i) => ({
    personalityIndex: i,
    name: p.name,
    goldAmount: p.goldAmount,
    timerMinutes: p.timerMinutes,
    displayInitials: p.displayInitials,
    preview: p.greeting.length > 90 ? p.greeting.slice(0, 90) + '…' : p.greeting,
  }))

  const authUser = authResult.data.user
  let currentUser = null
  let activeDuels: Array<{
    id: string
    deadline: string
    opponent: { username: string; display_initials: string }
  }> = []

  if (authUser) {
    // Round 2: user-specific queries in parallel
    const [profileResult, duelsResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', authUser.id).single(),
      supabase
        .from('duels')
        .select('id, deadline, player1_id, player2_id, player1:users!duels_player1_id_fkey(username, display_initials), player2:users!duels_player2_id_fkey(username, display_initials)')
        .eq('status', 'active')
        .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`),
    ])

    currentUser = profileResult.data

    if (duelsResult.data) {
      activeDuels = (duelsResult.data as any[]).map(d => {
        const isP1 = d.player1_id === authUser.id
        return { id: d.id, deadline: d.deadline, opponent: isP1 ? d.player2 : d.player1 }
      })
    }
  }

  return (
    <>
      <BanBanner />
      <PactHeader />
      <TavernClient
        initialWagers={wagers ?? []}
        currentUser={currentUser}
        hoardBalance={hoardResult.data?.balance ?? 0}
        activeDuels={activeDuels}
        spectatableDuels={spectatableDuels}
        botOptions={botOptions}
      />
    </>
  )
}
