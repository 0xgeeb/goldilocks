import type { Metadata } from 'next'
import { Acme } from 'next/font/google'
import { LayoutProps } from '../utils/interfaces'
import './globals.css'

const acme = Acme({
  subsets: ['latin'],
  preload: false,
  display: 'swap',
  weight: '400',
  variable: '--font-acme',
})

export const metadata: Metadata = {
  title: 'Goldilocks Alpha',
  description: 'bera themed defi protocol'
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${acme.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}