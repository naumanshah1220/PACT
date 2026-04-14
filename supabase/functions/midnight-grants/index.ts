// Supabase Edge Function: runs at midnight via pg_cron
// Grants daily gold to all users based on newbie_day
// Deploy: supabase functions deploy midnight-grants

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  // Verify cron secret
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Fetch all users
  const { data: users, error } = await supabase.from('users').select('*')
  if (error) return new Response(error.message, { status: 500 })

  let updated = 0
  for (const user of (users ?? [])) {
    const day = user.newbie_day
    let grant = 5
    if (day <= 3) grant = 50
    else if (day <= 7) grant = 25

    await supabase.from('users').update({
      gold_balance: user.gold_balance + grant,
      newbie_day: day + 1,
    }).eq('id', user.id)
    updated++
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
