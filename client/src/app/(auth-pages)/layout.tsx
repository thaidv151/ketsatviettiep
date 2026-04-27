import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Tài khoản',
}

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-muted/90 via-background to-primary/[0.06]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,oklch(0.62_0.18_258_/_0.14),transparent)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,oklch(0.74_0.18_258_/_0.12),transparent)]"
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
