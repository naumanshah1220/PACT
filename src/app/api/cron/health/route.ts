import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  // Verify this is called by Vercel cron (or manually with the secret)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch health stats from our own API
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/health-check`, {
    headers: { 'x-internal': '1' },
  })
  const stats = await res.json()

  // Only send an email if there are warnings
  if (!stats.warnings || stats.warnings.length === 0) {
    return NextResponse.json({ ok: true, message: 'All clear, no email sent.' })
  }

  const resendKey = process.env.RESEND_API_KEY
  const alertEmail = process.env.ALERT_EMAIL

  if (!resendKey || !alertEmail) {
    // Log warnings but don't fail if email isn't configured
    console.warn('PACT health warnings (email not configured):', stats.warnings)
    return NextResponse.json({ ok: true, warnings: stats.warnings, emailed: false })
  }

  const resend = new Resend(resendKey)

  await resend.emails.send({
    from: 'PACT <onboarding@resend.dev>',
    to: alertEmail,
    subject: `⚠️ PACT: ${stats.warnings.length} health warning${stats.warnings.length > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: monospace; max-width: 520px; margin: 0 auto; padding: 32px; background: #eae8e1;">
        <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0 0 4px;">PACT</h1>
        <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin: 0 0 24px;">Health Monitor</p>

        <div style="background: #fff; border: 1px solid #d8d4cc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #993C1D; font-weight: bold; margin: 0 0 12px;">&#9888; ${stats.warnings.length} warning${stats.warnings.length > 1 ? 's' : ''} detected</p>
          ${stats.warnings.map((w: string) => `<p style="font-size: 13px; margin: 0 0 8px; color: #333;">&#8227; ${w}</p>`).join('')}
        </div>

        <div style="background: #fff; border: 1px solid #d8d4cc; border-radius: 12px; padding: 20px;">
          <p style="font-size: 11px; color: #888; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.1em;">Current stats</p>
          <table style="font-size: 12px; width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 3px 0; color: #888;">Database</td><td style="text-align:right; font-weight:bold;">${stats.db_size_mb} MB / 500 MB (${stats.limits?.db_used_pct}%)</td></tr>
            <tr><td style="padding: 3px 0; color: #888;">Users</td><td style="text-align:right; font-weight:bold;">${stats.user_count}</td></tr>
            <tr><td style="padding: 3px 0; color: #888;">Active duels</td><td style="text-align:right; font-weight:bold;">${stats.active_duels}</td></tr>
            <tr><td style="padding: 3px 0; color: #888;">Messages</td><td style="text-align:right; font-weight:bold;">${stats.message_count?.toLocaleString()}</td></tr>
          </table>
        </div>

        <p style="font-size: 11px; color: #aaa; margin-top: 20px; text-align: center;">Checked at ${new Date(stats.checked_at).toLocaleString()}</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true, warnings: stats.warnings, emailed: true })
}
