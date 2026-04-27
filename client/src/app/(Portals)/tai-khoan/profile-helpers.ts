/** Hiển thị ngày (API trả ISO). */
export function formatDateVi(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN')
}

export function genderLabel(g: number | null | undefined): string {
  if (g == null || g === 0) return 'Chưa chọn'
  if (g === 1) return 'Nam'
  if (g === 2) return 'Nữ'
  if (g === 3) return 'Khác'
  return '—'
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const s = String(iso)
  if (s.length >= 10) return s.slice(0, 10)
  return ''
}
