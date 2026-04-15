import type { InternalAxiosRequestConfig } from 'axios'
import appConfig from '@/configs/app.config'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { getResolvedUrl, isPublicApiPath } from '@/services/auth/apiUrl'

const AxiosRequestIntrceptorConfigCallback = async (
  config: InternalAxiosRequestConfig,
) => {
  if (typeof window !== 'undefined') {
    const resolved = getResolvedUrl(config.baseURL, config.url)
    const isPublic = isPublicApiPath(resolved, appConfig.publicApiPathPrefixes)

    if (
      appConfig.requireAccessTokenForProtectedApis &&
      !isPublic &&
      !getAccessToken()
    ) {
      return Promise.reject(
        new Error(
          'Thiếu access token: đăng nhập hoặc gọi API public (xem publicApiPathPrefixes).',
        ),
      )
    }

    const token = getAccessToken()
    if (token && !config.headers?.Authorization) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return config
}

export default AxiosRequestIntrceptorConfigCallback
