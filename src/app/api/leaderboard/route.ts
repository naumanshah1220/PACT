import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0'))
  const limit = 20

  const admin = createAdminClient()

  if (type === 'nobles') {
    const { data } = await admin
      .from('users')
      .select('id, username, gold_balance, player_number')
      .order('gold_balance', { ascending: false })
      .range(offset, offset + limit - 1)
    return NextResponse.json({ rows: data ?? [] })
  }

  if (type === 'honors') {
    const { data } = await admin
      .from('users')
      .select('id, username, honor_score, display_initials')
      .order('honor_score', { ascending: false })
      .range(offset, offset + limit - 1)
    return NextResponse.json({ rows: data ?? [] })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
