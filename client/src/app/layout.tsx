import type { Metadata } from 'next'
import { Roboto, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AppProviders } from './providers'
import './globals.css'

const robotoSans = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto-sans',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Két sắt việt tiệp - Két sắt gia dụng & công nghiệp chính hãng',
  description: 'Két sắt gia dụng & công nghiệp chính hãng - Cửa hàng trực tuyến Két sắt việt tiệp',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${robotoSans.variable} ${robotoMono.variable}`}>
      <body
        className={`${robotoSans.className} antialiased bg-background text-foreground`}
      >
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
