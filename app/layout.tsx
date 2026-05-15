import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { StarsBackground } from '@/components/layout/stars-background'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Eurovision Prode 2026',
  description: 'Predict the Eurovision 2026 winner and compete with friends!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col bg-purple-950 text-white">
        <StarsBackground />
        <div className="relative z-10 flex flex-col min-h-dvh">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center text-xs text-purple-500 border-t border-purple-900/40">
            Eurovision Prode 2026 — Made with ✨ for Eurovision fans
          </footer>
        </div>
      </body>
    </html>
  )
}
