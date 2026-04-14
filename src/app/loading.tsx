export default function Loading() {
  return (
    <div className="min-h-screen bg-[#eae8e1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="font-serif text-4xl font-bold text-[#d8d4cc] animate-pulse">PACT</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#bbb]">Loading…</span>
      </div>
    </div>
  )
}
