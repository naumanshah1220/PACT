import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { username } = body

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  const trimmed = username.trim()
  if (trimmed.length < 2 || trimmed.length > 20) {
    return NextResponse.json({ error: 'Username must be 2–20 characters' }, { status: 400 })
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return NextResponse.json(
      { error: 'Username may only contain letters, numbers, and underscores' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('username', trimmed)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
  }

  const words = trimmed.split(/[\s_]+/).filter(Boolean)
  const display_initials =
    words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : trimmed.slice(0, 2).toUpperCase()

  const { error } = await admin
    .from('users')
    .update({ username: trimmed, display_initials })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to update username' }, { status: 500 })

  return NextResponse.json({ success: true, display_initials })
}
