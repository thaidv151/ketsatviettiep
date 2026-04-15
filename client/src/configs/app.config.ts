export type AppConfig = {
  /** Base URL API (axios `baseURL`), từ `NEXT_PUBLIC_API_BASE_URL`. */
  apiPrefix: string
  /** Khóa lưu JWT trong localStorage. */
  accessTokenStorageKey: string
  /**
   * Các đoạn path (không phân biệt hoa thường) coi là API công khai — không bắt buộc token.
   * Ví dụ `/api/auth`, `/api/appinfo`.
   */
  publicApiPathPrefixes: readonly string[]
  /**
   * true: chặn phía client khi gọi API không public mà chưa có token.
   * Mặc định: bật ở production hoặc khi `NEXT_PUBLIC_REQUIRE_ACCESS_TOKEN=true`.
   */
  requireAccessTokenForProtectedApis: boolean
  authenticatedEntryPath: string
  unAuthenticatedEntryPath: string
  locale: string
  activeNavTranslation: boolean
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'

const requireToken =
  process.env.NODE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_REQUIRE_ACCESS_TOKEN === 'true'

const appConfig: AppConfig = {
  apiPrefix: baseURL,
  accessTokenStorageKey: 'accessToken',
  publicApiPathPrefixes: ['/api/auth', '/api/appinfo'],
  requireAccessTokenForProtectedApis: requireToken,
  authenticatedEntryPath: '/home',
  unAuthenticatedEntryPath: '/sign-in',
  locale: 'vi',
  activeNavTranslation: false,
}

export default appConfig
