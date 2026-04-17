import type { ReactNode } from 'react'
import ManagersShell from './ManagersShell'

export default function ManagersLayout({ children }: { children: ReactNode }) {
  return <ManagersShell>{children}</ManagersShell>
}
