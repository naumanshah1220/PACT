'use client'
import { useEffect } from 'react'

export default function GoldScrollInit() {
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const pct = (scrolled / max) * 180
      document.documentElement.style.setProperty('--gold-pos', `${pct}% center`)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])
  return null
}
