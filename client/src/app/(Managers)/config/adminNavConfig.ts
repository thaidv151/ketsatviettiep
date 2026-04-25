import type { AdminNavItem } from './adminNav.types'

/** Menu mặc định — có thể import và chỉnh hoặc truyền `items` tùy chỉnh vào ManagersShell. */
export const adminNavItems: AdminNavItem[] = [
  {
    id: 'admin-home',
    name: 'Tổng quan',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'rbac',
    name: 'Phân quyền',
    icon: 'Shield',
    children: [
      {
        id: 'rbac-modules',
        name: 'Module',
        href: '/modules',
        icon: 'Layers',
      },
      {
        id: 'rbac-operations',
        name: 'Operation',
        href: '/operations',
        icon: 'ListChecks',
      },
      {
        id: 'rbac-roles',
        name: 'Role',
        href: '/roles',
        icon: 'ShieldCheck',
      },
    ],
  },
  {
    id: 'users',
    name: 'Người dùng',
    href: '/users',
    icon: 'Users',
  },
  {
    id: 'system-categories',
    name: 'Danh mục hệ thống',
    icon: 'FolderTree',
    children: [
      {
        id: 'nhom-danh-muc',
        name: 'Nhóm danh mục',
        href: '/nhom-danh-muc',
        icon: 'FolderKanban',
      },
      {
        id: 'danh-muc',
        name: 'Dữ liệu danh mục',
        href: '/danh-muc',
        icon: 'Library',
      },
    ],
  },
]

/** Object gom cấu hình (tiện mở rộng: title, sectionLabel, items). */
export const adminNavConfig = {
  sidebarTitle: 'Quản trị',
  sectionLabel: 'Chức năng',
  items: adminNavItems,
} as const
