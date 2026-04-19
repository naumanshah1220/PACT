'use client'

import { useEffect, useRef, useState } from 'react'

function TavernSVG() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none">
      <path d="M16 76 L16 36 Q16 8 48 8 Q80 8 80 36 L80 76" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="36" y="46" width="24" height="30" rx="12" fill="#1a1208" opacity="0.85"/>
      <circle cx="22" cy="34" r="4" fill="none" stroke="#c9a227" strokeWidth="1.5"/>
      <line x1="22" y1="28" x2="22" y2="30" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="74" cy="34" r="4" fill="none" stroke="#c9a227" strokeWidth="1.5"/>
      <line x1="74" y1="28" x2="74" y2="30" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="76" x2="60" y2="76" stroke="#1a1208" strokeWidth="1.5"/>
    </svg>
  )
}

function WagerSVG() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none">
      <rect x="20" y="46" width="56" height="6" rx="3" fill="#d8d4cc"/>
      <line x1="30" y1="52" x2="30" y2="68" stroke="#d8d4cc" strokeWidth="2"/>
      <line x1="66" y1="52" x2="66" y2="68" stroke="#d8d4cc" strokeWidth="2"/>
      <circle cx="48" cy="40" r="10" fill="#fdf6d8" stroke="#c9a227" strokeWidth="1.5"/>
      <path d="M44 40 L48 36 L52 40 L48 44 Z" fill="#c9a227" stroke="none"/>
      <path d="M4 60 Q16 50 30 42" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M92 60 Q80 50 66 42" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SpeakSVG() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none">
      <path d="M8 12 Q8 4 16 4 L44 4 Q52 4 52 12 L52 26 Q52 34 44 34 L22 34 L10 46 L14 34 Q8 34 8 26 Z" stroke="#1a1208" strokeWidth="1.5" fill="#f5f3ea"/>
      <line x1="18" y1="15" x2="38" y2="15" stroke="#1a1208" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <line x1="18" y1="22" x2="30" y2="22" stroke="#1a1208" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <path d="M88 34 Q88 26 80 26 L52 26 Q44 26 44 34 L44 48 Q44 56 52 56 L74 56 L86 68 L82 56 Q88 56 88 48 Z" stroke="#1a1208" strokeWidth="1.5" fill="#f5f3ea"/>
      <line x1="56" y1="37" x2="76" y2="37" stroke="#1a1208" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <line x1="56" y1="44" x2="66" y2="44" stroke="#1a1208" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

function ForkSVG() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none">
      <line x1="48" y1="76" x2="48" y2="48" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48 48 Q36 36 16 14" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round"/>
      <path d="M48 48 Q60 36 80 14" stroke="#993C1D" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3"/>
      <circle cx="16" cy="11" r="7" fill="#3B6D11"/>
      <circle cx="80" cy="11" r="7" fill="#993C1D"/>
      <path d="M13 11 L19 11 M16 8 L16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M77 11 L83 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SealSVG() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none">
      <rect x="40" y="2" width="16" height="18" rx="5" fill="#1a1208"/>
      <rect x="42" y="18" width="12" height="6" fill="#1a1208"/>
      <circle cx="48" cy="54" r="24" stroke="#1a1208" strokeWidth="1.5"/>
      <circle cx="48" cy="54" r="16" stroke="#1a1208" strokeWidth="1"/>
      <line x1="48" y1="42" x2="48" y2="66" stroke="#1a1208" strokeWidth="1" opacity="0.4"/>
      <line x1="36" y1="54" x2="60" y2="54" stroke="#1a1208" strokeWidth="1" opacity="0.4"/>
      <path d="M48 30 L48 34 M48 74 L48 78 M24 54 L28 54 M68 54 L72 54" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

const SLIDES = [
  {
    title: 'Welcome to PACT',
    body: 'A game of trust and gold, played between strangers. Every wager is a test of character — and nerve.',
    Illustration: TavernSVG,
  },
  {
    title: 'Post or Accept a Wager',
    body: 'Put gold at stake and wait for a challenger, or step up and accept someone else\'s. You risk it. So do they.',
    Illustration: WagerSVG,
  },
  {
    title: 'You Must Both Speak',
    body: 'Before any decision is made, both players must send at least one message. Talk. Persuade. Or deceive.',
    Illustration: SpeakSVG,
  },
  {
    title: 'Pledge or Betray',
    body: 'Both pledge → each gains 25%. One betrays → they take everything. Both betray → the house keeps it all.',
    Illustration: ForkSVG,
  },
  {
    title: 'Invoke the Seal',
    body: 'When ready, call for the Seal. Both seals placed — decisions revealed. Gold changes hands. No going back.',
    Illustration: SealSVG,
  },
]

export default function TutorialModal() {
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tutorial') === '1' || !localStorage.getItem('pact-tutorial-seen')) {
      setOpen(true)
    }
    function onOpen() { setSlide(0); setOpen(true) }
    window.addEventListener('open-tutorial', onOpen)
    return () => window.removeEventListener('open-tutorial', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slide])

  function close() {
    localStorage.setItem('pact-tutorial-seen', '1')
    setOpen(false)
  }

  function goNext() {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else close()
  }

  function goPrev() {
    if (slide > 0) setSlide(s => s - 1)
  }

  if (!open) return null

  const { title, body, Illustration } = SLIDES[slide]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-6 sm:pb-0"
      onClick={close}
    >
      <div
        className="bg-[#f5f3ea] border border-[#d8d4cc] rounded-[20px] w-full max-w-sm p-6 relative shadow-xl"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (dx < -50) goNext()
          else if (dx > 50) goPrev()
          touchStartX.current = null
        }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-5 font-mono text-xl text-[#bbb] hover:text-[#444] transition-colors leading-none"
        >×</button>

        <div className="flex justify-center mb-5 mt-1">
          <Illustration />
        </div>

        <h2 className="font-fell text-2xl text-center mb-2 text-[#1a1208]">{title}</h2>
        <p className="font-mono text-[11px] text-[#777] text-center leading-relaxed mb-6">{body}</p>

        <div className="flex justify-center gap-2 mb-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === slide ? 'bg-[#1a1208] w-5' : 'bg-[#d8d4cc] w-1.5'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className={`py-2.5 font-mono text-[11px] border border-[#d8d4cc] rounded-xl transition-colors hover:bg-[#f0ede6] flex-1 ${
              slide === 0 ? 'invisible pointer-events-none' : ''
            }`}
          >← Back</button>
          <button
            onClick={goNext}
            className="flex-1 bg-[#1a1208] text-[#EEEDE4] py-2.5 font-mono text-[11px] rounded-xl hover:opacity-90 transition-opacity"
          >
            {slide === SLIDES.length - 1 ? 'Enter the Tavern' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
