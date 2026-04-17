import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { BOT_IDS, BOT_CONFIG } from '@/lib/bots'

// Called by Vercel Cron (or manually via POST with secret)
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.BOT_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return run()
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== process.env.BOT_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return run()
}

async function run() {
  const admin = createAdminClient()
  const results: { bot: string; action: string }[] = []

  for (const [botId, cfg] of Object.entries(BOT_CONFIG) as [string, typeof BOT_CONFIG[keyof typeof BOT_CONFIG]][]) {
    // Skip if bot already has an open wager
    const { data: existing } = await admin
      .from('wagers').select('id').eq('poster_id', botId).eq('status', 'open').limit(1)
    if (existing && existing.length > 0) {
      results.push({ bot: cfg.name, action: 'skipped (has open wager)' })
      continue
    }

    const { error } = await admin.from('wagers').insert({
      poster_id: botId,
      gold_amount: cfg.goldAmount,
      timer_minutes: cfg.timerMinutes,
      status: 'open',
      practice: true,
      spectators_allowed: true,
    })

    results.push({ bot: cfg.name, action: error ? `error: ${error.message}` : 'posted' })
  }

  return NextResponse.json({ results })
}
