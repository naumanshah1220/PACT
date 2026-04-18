import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'nobles'
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const supabase = await createClient()

  if (type === 'nobles') {
    const { data } = await supabase
      .from('users')
      .select('id, username, gold_balance, honorific')
      .eq('is_bot', false)
      .order('gold_balance', { ascending: false })
      .range(offset, offset + 19)
    return NextResponse.json({ rows: data ?? [] })
  }

  if (type === 'honors') {
    const { data } = await supabase
      .from('users')
      .select('id, username, honor_score')
      .eq('is_bot', false)
      .order('honor_score', { ascending: false })
      .range(offset, offset + 19)
    return NextResponse.json({ rows: data ?? [] })
  }

  return NextResponse.json({ rows: [] })
}
