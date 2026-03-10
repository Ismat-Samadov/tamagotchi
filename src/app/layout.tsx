import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeonPet - Virtual Pet Game',
  description: 'A neon-themed virtual pet game. Raise your digital companion!',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a1a] text-[#e0e0ff] min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
