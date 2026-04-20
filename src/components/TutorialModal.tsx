'use client'

import { useEffect, useRef, useState } from 'react'

function TavernSVG() {
  return (
    <svg width="160" height="120" viewBox="0 0 130 100" fill="none">
      <path d="M20 96 L20 44 Q20 10 65 10 Q110 10 110 44 L110 96" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <rect x="48" y="58" width="34" height="38" rx="17" fill="#1a1208" opacity="0.85"/>
      <circle cx="30" cy="42" r="6" fill="none" stroke="#c9a227" strokeWidth="1.5"/>
      <line x1="30" y1="34" x2="30" y2="36" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="100" cy="42" r="6" fill="none" stroke="#c9a227" strokeWidth="1.5"/>
      <line x1="100" y1="34" x2="100" y2="36" stroke="#c9a227" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 58 Q65 52 92 58" stroke="#1a1208" strokeWidth="1" opacity="0.3"/>
      <path d="M48 96 L82 96" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 96 L20 96" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <path d="M100 96 L110 96" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function WagerSVG() {
  return (
    <svg width="160" height="120" viewBox="0 0 130 100" fill="none">
      <rect x="25" y="58" width="80" height="8" rx="4" fill="#d8d4cc"/>
      <rect x="35" y="66" width="10" height="22" rx="2" fill="#d8d4cc"/>
      <rect x="85" y="66" width="10" height="22" rx="2" fill="#d8d4cc"/>
      <circle cx="65" cy="50" r="16" fill="#fdf6d8" stroke="#c9a227" strokeWidth="2"/>
      <path d="M58 50 L65 42 L72 50 L65 58 Z" fill="#c9a227"/>
      <path d="M4 74 Q18 62 36 52" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <path d="M126 74 Q112 62 94 52" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 82 L18 76" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M124 82 L112 76" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function SpeakSVG() {
  return (
    <svg width="160" height="120" viewBox="0 0 130 100" fill="none">
      <path d="M8 14 Q8 4 18 4 L60 4 Q70 4 70 14 L70 34 Q70 44 60 44 L28 44 L12 60 L18 44 Q8 44 8 34 Z" stroke="#1a1208" strokeWidth="1.5" fill="#e8e4d8"/>
      <line x1="20" y1="18" x2="54" y2="18" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      <line x1="20" y1="26" x2="42" y2="26" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      <line x1="20" y1="34" x2="50" y2="34" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      <path d="M122 46 Q122 36 112 36 L70 36 Q60 36 60 46 L60 66 Q60 76 70 76 L100 76 L118 92 L114 76 Q122 76 122 66 Z" stroke="#1a1208" strokeWidth="1.5" fill="#e8e4d8"/>
      <line x1="74" y1="50" x2="108" y2="50" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      <line x1="74" y1="58" x2="96" y2="58" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
      <line x1="74" y1="66" x2="104" y2="66" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
    </svg>
  )
}

function ForkSVG() {
  return (
    <svg width="160" height="120" viewBox="0 0 130 100" fill="none">
      <line x1="65" y1="96" x2="65" y2="58" stroke="#1a1208" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M65 58 Q50 44 22 16" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M65 58 Q80 44 108 16" stroke="#993C1D" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4"/>
      <circle cx="22" cy="13" r="10" fill="#3B6D11"/>
      <circle cx="108" cy="13" r="10" fill="#993C1D"/>
      <path d="M18 13 L26 13 M22 9 L22 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M104 13 L112 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <text x="34" y="38" fill="#3B6D11" fontSize="8" fontFamily="monospace" opacity="0.8">PLEDGE</text>
      <text x="78" y="38" fill="#993C1D" fontSize="8" fontFamily="monospace" opacity="0.8">BETRAY</text>
    </svg>
  )
}

function SealSVG() {
  return (
    <svg width="160" height="130" viewBox="0 0 130 110" fill="none">
      <rect x="52" y="2" width="26" height="24" rx="7" fill="#1a1208"/>
      <rect x="56" y="24" width="18" height="8" fill="#1a1208"/>
      <circle cx="65" cy="72" r="34" stroke="#1a1208" strokeWidth="2"/>
      <circle cx="65" cy="72" r="24" stroke="#1a1208" strokeWidth="1"/>
      <line x1="65" y1="52" x2="65" y2="92" stroke="#1a1208" strokeWidth="1" opacity="0.35"/>
      <line x1="45" y1="72" x2="85" y2="72" stroke="#1a1208" strokeWidth="1" opacity="0.35"/>
      <path d="M65 38 L65 44 M65 100 L65 106 M31 72 L37 72 M93 72 L99 72" stroke="#1a1208" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M43 50 L47 54 M83 90 L87 94 M43 94 L47 90 M83 50 L87 54" stroke="#1a1208" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
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
    body: 'Put gold at stake and wait for a challenger — or step up and accept someone else\'s. You risk it. So do they.',
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
  const [dir, setDir] = useState(0)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const pointerStartX = useRef<number | null>(null)

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
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, slide, animating])

  function close() {
    localStorage.setItem('pact-tutorial-seen', '1')
    setOpen(false)
  }

  function navigate(direction: number) {
    if (animating) return
    const next = slide + direction
    if (next < 0 || next >= SLIDES.length) return
    setDir(direction)
    setAnimating(true)
    setTimeout(() => {
      setSlide(next)
      setAnimating(false)
    }, 260)
  }

  if (!open) return null

  const { title, body, Illustration } = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm bg-[#f5f3ea] border-2 border-[#1a1208] rounded-[12px] p-8 select-none"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1)
          touchStartX.current = null
        }}
        onPointerDown={e => { pointerStartX.current = e.clientX }}
        onPointerUp={e => {
          if (pointerStartX.current === null) return
          const dx = e.clientX - pointerStartX.current
          if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1)
          pointerStartX.current = null
        }}
      >
        {/* Dismiss */}
        <button
          onClick={close}
          className="absolute top-4 right-4 font-mono text-xl leading-none text-[#888] hover:text-[#1a1208] transition-colors"
        >
          ×
        </button>

        {/* Slide content */}
        <div
          className="transition-all duration-[260ms] ease-in-out"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${dir < 0 ? '24px' : '-24px'})`
              : 'translateX(0)',
          }}
        >
          <div className="flex justify-center mb-6">
            <Illustration />
          </div>

          <h2 className="font-fell text-[1.75rem] text-[#1a1208] text-center mb-3 leading-tight">
            {title}
          </h2>
          <p className="font-mono text-[11px] text-[#555] text-center leading-relaxed mb-8">
            {body}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mb-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (i !== slide) navigate(i > slide ? 1 : -1) }}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{
                width: i === slide ? 20 : 6,
                backgroundColor: i === slide ? '#1a1208' : '#d8d4cc',
              }}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={close}
            className="w-full border border-[#1a1208] rounded-lg py-2.5 font-mono text-[11px] hover:bg-[#1a1208] hover:text-[#EEEDE4] transition-colors active:scale-[0.97] tracking-widest uppercase"
          >
            Enter the Tavern
          </button>
        ) : (
          <p className="text-center font-mono text-[10px] tracking-widest uppercase text-[#bbb]">
            swipe to continue
          </p>
        )}
      </div>
    </div>
  )
}
