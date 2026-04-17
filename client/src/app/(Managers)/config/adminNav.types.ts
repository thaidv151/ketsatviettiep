/**
 * Một mục menu quản trị — có thể là link đơn hoặc nhóm có `children`.
 * Truyền vào layout qua mảng `items` hoặc object `adminNavConfig`.
 */
export type AdminNavItem = {
  id: string
  name: string
  /** Đường dẫn trong app (ví dụ `/dashboard`, `/rbac`). Bỏ qua nếu chỉ là nhóm cha. */
  href?: string
  /** Tên icon trong `VerticalMenuIcon` (lucide), ví dụ: LayoutDashboard, Shield */
  icon?: string
  children?: AdminNavItem[]
}
