import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản trị | SafeVault',
  description: 'Khu vực quản trị',
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  )
}
