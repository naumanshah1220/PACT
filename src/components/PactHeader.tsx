'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type HeaderUser = { gold_balance: number; display_initials: string; newbie_day: number }

type NotifRow = {
  id: string
  type: string
  title: string
  link: string | null
  read: boolean
  created_at: string
}

function getNextMidnightMs(): number {
  const now = new Date()
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ))
  return next.getTime() - now.getTime()
}

function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getDailyGrant(day: number): number {
  if (day <= 3) return 50
  if (day <= 7) return 25
  return 5
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

export default function PactHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState('')
  const [notifications, setNotifications] = useState<NotifRow[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null)
  const supabase = useRef(createClient()).current
  const notifRef = useRef<HTMLDivElement>(null)

  async function fetchUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { setAuthUserId(null); setUser(null); return }
    setAuthUserId(authUser.id)
    const { data } = await supabase
      .from('users')
      .select('gold_balance, display_initials, newbie_day')
      .eq('id', authUser.id)
      .single()
    if (data) setUser(data as HeaderUser)
  }

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data as NotifRow[])
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  async function registerAndSubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      })
      setPushPermission('granted')
    } catch {
      // SW or push not supported — silently ignore
    }
  }

  async function requestPushPermission() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setPushPermission(perm)
    if (perm === 'granted') await registerAndSubscribe()
  }

  function handleBellClick() {
    const willOpen = !showNotifs
    setShowNotifs(willOpen)
    if (willOpen) markAllRead()
  }

  useEffect(() => {
    fetchUser()
    window.addEventListener('focus', fetchUser)
    return () => window.removeEventListener('focus', fetchUser)
  }, [])

  useEffect(() => {
    if (!authUserId) return
    fetchNotifications()
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${authUserId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as NotifRow, ...prev])
      })
      .subscribe()

    if ('Notification' in window) {
      setPushPermission(Notification.permission)
      if (Notification.permission === 'granted') registerAndSubscribe()
    }

    return () => { supabase.removeChannel(channel) }
  }, [authUserId])

  useEffect(() => {
    function tick() { setCountdown(formatCountdown(getNextMidnightMs())) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="border-b border-[#d8d4cc] bg-[#eae8e1] sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-fell text-4xl leading-none tracking-tight">PACT</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-[1.5px] w-6 bg-black" />
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">A Game of Trust</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/profile" className="flex flex-col bg-white border border-[#d8d4cc] rounded-xl px-3 py-1.5 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <img src="/icons/coin.png" alt="" className="w-[18px] h-[18px] object-contain" style={{ mixBlendMode: 'multiply' }} />
                    <span className="font-medium">{user.gold_balance}</span>
                    <span className="text-[#888]">Gold</span>
                  </div>
                  {countdown && (
                    <span className="text-[9px] text-[#bbb] leading-tight mt-0.5">
                      +{getDailyGrant(user.newbie_day)} in {countdown}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleBellClick}
                    className="relative w-8 h-8 flex items-center justify-center hover:bg-[#f0ede6] rounded-full transition-colors"
                    aria-label="Notifications"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#555]">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#993C1D] text-white text-[8px] font-mono rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 top-10 w-72 bg-white border border-[#d8d4cc] rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-[#f0ede6] flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[#888]">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="font-mono text-[10px] text-[#888] hover:text-[#111] transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="font-mono text-xs text-[#bbb]">Nothing yet.</p>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto divide-y divide-[#f0ede6]">
                          {notifications.map(n => (
                            <a
                              key={n.id}
                              href={n.link ?? '/'}
                              onClick={() => setShowNotifs(false)}
                              className={`flex items-start gap-3 px-4 py-3 hover:bg-[#faf9f7] transition-colors ${
                                !n.read ? 'bg-[#fdf8f2]' : ''
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-sans text-xs text-[#111] leading-snug">{n.title}</p>
                                <p className="font-mono text-[9px] text-[#bbb] mt-0.5">{timeAgo(n.created_at)}</p>
                              </div>
                              {!n.read && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#993C1D] mt-1.5 flex-shrink-0" />
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      {pushPermission === 'default' && (
                        <div className="px-4 py-3 border-t border-[#f0ede6]">
                          <button
                            onClick={requestPushPermission}
                            className="w-full font-mono text-[10px] text-[#888] hover:text-[#111] transition-colors text-center"
                          >
                            🔔 Enable push notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/profile" className="w-8 h-8 rounded-full bg-[#f0ede6] border border-[#d8d4cc] flex items-center justify-center font-mono text-xs font-medium">
                  {user.display_initials}
                </Link>
              </>
            ) : (
              <Link href="/login" className="font-mono text-xs border border-[#d8d4cc] rounded-full px-3 py-1.5 hover:bg-white transition-colors">Sign in</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
