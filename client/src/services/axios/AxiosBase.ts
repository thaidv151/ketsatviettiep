import axios from 'axios'
import type { AxiosError } from 'axios'
import appConfig from '@/configs/app.config'
import AxiosRequestIntrceptorConfigCallback from './AxiosRequestIntrceptorConfigCallback'
import AxiosResponseIntrceptorErrorCallback from './AxiosResponseIntrceptorErrorCallback'

const AxiosBase = axios.create({
  timeout: 90_000,
  baseURL: appConfig.apiPrefix,
  headers: {
    'Content-Type': 'application/json',
  },
})

AxiosBase.interceptors.request.use(
  async (config) => {
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
