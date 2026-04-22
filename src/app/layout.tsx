import type { Metadata } from 'next'
import './globals.css'
import GoldScrollInit from '@/components/GoldScrollInit'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'PACT — A Game of Trust',
  description: "A social prisoner's dilemma game. Pledge or betray.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#EEEDE4' }}>
        <GoldScrollInit />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
