'use client'

import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  {
    title: 'Welcome to PACT',
    body: 'A game of trust and gold, played between strangers. Every wager is a test of character — and nerve.',
    icons: ['/icons/pledge.png'],
  },
  {
    title: 'Post or Accept a Wager',
    body: 'Put gold at stake and wait for a challenger — or step up and accept someone else\'s. You risk it. So do they.',
    icons: ['/icons/coin.png'],
  },
  {
    title: 'You Must Both Speak',
    body: 'Before any decision is made, both players must send at least one message. Talk. Persuade. Or deceive.',
    icons: ['/icons/scrolls.png'],
  },
  {
    title: 'Pledge or Betray',
    body: 'Both pledge → each gains 25%. One betrays → they take everything. Both betray → the house keeps it all.',
    icons: ['/icons/betray.png'],
  },
  {
    title: 'Invoke the Seal',
    body: 'When ready, call for the Seal. Both seals placed — decisions revealed. Gold changes hands. No going back.',
    icons: ['/icons/seal.png'],
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
    setTimeout(() => { setSlide(next); setAnimating(false) }, 260)
  }

  if (!open) return null

  const { title, body, icons } = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={close}>
      <div
        className="relative w-full max-w-md bg-[#f5f3ea] border-2 border-[#1a1208] rounded-[12px] p-10 select-none"
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
        <button onClick={close} className="absolute top-4 right-4 font-mono text-xl leading-none text-[#888] hover:text-[#1a1208] transition-colors">&times;</button>

        <div
          className="transition-all duration-[260ms] ease-in-out"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${dir < 0 ? '24px' : '-24px'})` : 'translateX(0)',
          }}
        >
          <div className="flex justify-center items-end gap-4 mb-8">
            {icons.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="object-contain mix-blend-multiply"
                style={{ width: 160, height: 160 }}
              />
            ))}
          </div>
          <h2 className="font-fell text-[2rem] text-[#1a1208] text-center mb-4 leading-tight">{title}</h2>
          <p className="font-mono text-[12px] text-[#555] text-center leading-relaxed mb-10">{body}</p>
        </div>

        <div className="flex justify-center gap-2.5 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (i !== slide) navigate(i > slide ? 1 : -1) }}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{ width: i === slide ? 20 : 6, backgroundColor: i === slide ? '#1a1208' : '#d8d4cc' }}
            />
          ))}
        </div>

        {isLast ? (
          <button onClick={close} className="w-full border border-[#1a1208] rounded-lg py-3 font-mono text-[11px] hover:bg-[#1a1208] hover:text-[#EEEDE4] transition-colors active:scale-[0.97] tracking-widest uppercase">
            Enter the Tavern
          </button>
        ) : (
          <p className="text-center font-mono text-[10px] tracking-widest uppercase text-[#bbb]">swipe to continue</p>
        )}
      </div>
    </div>
  )
}
