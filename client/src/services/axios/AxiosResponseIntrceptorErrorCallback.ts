import appConfig from '@/configs/app.config'
import { clearAccessToken } from '@/services/auth/tokenStorage'
import { dispatch as authDispatch } from '@/stores/authStore'
import { loading } from '@/stores/uiStore'
import type { AxiosError } from 'axios'

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
  const status = error.response?.status ?? error.status
  if (status === 401) {
    if (typeof window !== 'undefined') {
      clearAccessToken()
      authDispatch({ type: 'CLEAR_USER_INFO' })
      loading.dispatch({ type: 'SET_LOADING', payload: false })
      const path = appConfig.unAuthenticatedEntryPath
      if (!window.location.pathname.startsWith(path)) {
        window.location.href = path
      }
    }
  }
  // if (process.env.NODE_ENV === 'development') {
  //   console.error('Axios', error.response?.data ?? error.message)
  // }
}

export default AxiosResponseIntrceptorErrorCallback
