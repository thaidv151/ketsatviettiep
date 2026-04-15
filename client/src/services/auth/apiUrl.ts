/**
 * Ghép URL đầy đủ từ axios config để so khớp public/protected.
 */
export function getResolvedUrl(
  baseURL: string | undefined,
  url: string | undefined,
): string {
  const b = (baseURL ?? '').replace(/\/+$/, '')
  const u = url ?? ''
  if (!u) return b
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  const path = u.startsWith('/') ? u : `/${u}`
  return `${b}${path}`
}

export function isPublicApiPath(
  resolvedUrl: string,
  publicPrefixes: readonly string[],
): boolean {
  const lower = resolvedUrl.toLowerCase()
  return publicPrefixes.some((p) => lower.includes(p.toLowerCase()))
}
