import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#eae8e1] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#888] mb-4">404</p>
        <h1 className="font-serif text-4xl font-bold mb-4">Lost in the Tavern</h1>
        <Link
          href="/"
          className="font-mono text-sm border border-[#d8d4cc] rounded-full px-4 py-2 hover:bg-white transition-colors"
        >
          Back to Tavern
        </Link>
      </div>
    </div>
  )
}
