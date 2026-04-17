import {
  Circle,
  LayoutDashboard,
  LayoutGrid,
  Shield,
  ShieldCheck,
  Layers,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

const iconByName: Record<string, LucideIcon> = {
  LayoutDashboard,
  LayoutGrid,
  Shield,
  ShieldCheck,
  Layers,
  ListChecks,
  Settings,
  Users,
  groupMenu: LayoutGrid,
  Circle,
}

type VerticalMenuIconProps = {
  name?: string
  className?: string
}

export default function VerticalMenuIcon({ name, className }: VerticalMenuIconProps) {
  const Icon = (name && iconByName[name]) || LayoutGrid
  return <Icon className={className ?? 'size-4 shrink-0'} aria-hidden />
}
