/**
 * Chuyển tên sản phẩm thành slug (tiếng Việt) cho URL: chữ thường, dấu gạch, không dấu.
 */
export function productNameToSlug(name: string): string {
  const t = name
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')

  return t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
