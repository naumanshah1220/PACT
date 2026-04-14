import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Free tier limits
const LIMITS = {
  db_size_mb: 500,
  realtime_connections: 200, // ~50 concurrent duels × 4 connections each
}

const WARN_AT = 0.80 // alert at 80%

export interface HealthStats {
  db_size_mb: number
  message_count: number
  active_duels: number
  user_count: number
  open_wagers: number
  warnings: string[]
  checked_at: string
}

export async function GET() {
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_db_stats')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const stats = data as Omit<HealthStats, 'warnings' | 'checked_at'>
  const warnings: string[] = []

  // Check DB size
  const dbPct = stats.db_size_mb / LIMITS.db_size_mb
  if (dbPct >= WARN_AT) {
    warnings.push(
      `Database is at ${Math.round(dbPct * 100)}% capacity (${stats.db_size_mb}MB / ${LIMITS.db_size_mb}MB free tier limit).`
    )
  }

  // Estimate realtime load: each active duel = ~4 connections
  const estimatedConnections = stats.active_duels * 4
  const rtPct = estimatedConnections / LIMITS.realtime_connections
  if (rtPct >= WARN_AT) {
    warnings.push(
      `High concurrent load: ${stats.active_duels} active duels (~${estimatedConnections} realtime connections, limit 200).`
    )
  }

  // Message volume warning (approaching storage pressure)
  if (stats.message_count > 500_000) {
    warnings.push(
      `Message count is high (${stats.message_count.toLocaleString()}). Consider running message cleanup.`
    )
  }

  return NextResponse.json({
    ...stats,
    warnings,
    checked_at: new Date().toISOString(),
    limits: {
      db_size_mb: LIMITS.db_size_mb,
      db_used_pct: Math.round(dbPct * 100),
    },
  } satisfies HealthStats & { limits: object })
}
