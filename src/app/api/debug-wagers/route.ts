import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('wagers')
    .select('id, poster_id, status, practice, gold_amount, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ data, error })
}
