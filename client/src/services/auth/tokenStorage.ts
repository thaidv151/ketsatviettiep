import appConfig from '@/configs/app.config'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(appConfig.accessTokenStorageKey)
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(appConfig.accessTokenStorageKey, token)
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(appConfig.accessTokenStorageKey)
}
