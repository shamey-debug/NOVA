import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'archespeak | Advanced Crypto Trading',
  description: 'Institutional-grade crypto trading platform. Lightning-fast execution, real-time analytics, 200+ markets.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}