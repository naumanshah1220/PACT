import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PACT — A Game of Trust',
  description: 'A social prisoner\'s dilemma game. Pledge or betray.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#eae8e1]">{children}</body>
    </html>
  )
}
