'use client'

import { useEffect, useState } from 'react'

interface Props {
  announcement: { id: string; message: string } | null
}

export default function HoardAnnouncement({ announcement }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!announcement) return
    const key = `hoard_ann_${announcement.id}`
    if (!localStorage.getItem(key)) {
      setVisible(true)
      const t = setTimeout(() => dismiss(), 8000)
      return () => clearTimeout(t)
    }
  }, [announcement])

  function dismiss() {
    if (announcement) localStorage.setItem(`hoard_ann_${announcement.id}`, '1')
    setVisible(false)
  }

  if (!visible || !announcement) return null

  return (
    <div className="mb-4 relative text-center px-6 py-1">
      <p className="font-mono text-[11px] italic text-[#888]">{announcement.message}</p>
      <button
        onClick={dismiss}
        className="absolute right-0 top-1 font-mono text-[10px] text-[#bbb] hover:text-[#888] leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
