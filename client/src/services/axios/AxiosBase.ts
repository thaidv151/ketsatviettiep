import axios from 'axios'
import type { AxiosError } from 'axios'
import appConfig from '@/configs/app.config'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'

const AxiosBase = axios.create({
  timeout: 30_000,
  baseURL: appConfig.apiPrefix,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

AxiosBase.interceptors.request.use(
  async (config) => {
    if (typeof document !== 'undefined') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
      }
      const locale = getCookie('locale') ?? appConfig.locale
      config.headers.set('Language', locale)
    }
    return AxiosRequestIntrceptorConfigCallback(config)
  },
  (error) => Promise.reject(error),
)

AxiosBase.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    AxiosResponseIntrceptorErrorCallback(error)
    return Promise.reject(error)
  },
)

export default AxiosBase
