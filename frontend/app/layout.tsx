import type { Metadata } from 'next'
import { Acme } from 'next/font/google'
import './globals.css'

const acme = Acme({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-acme',
})

export const metadata: Metadata = {
  title: 'Goldilocks v0.3',
  description: 'bera themed defi protocol'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${acme.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}