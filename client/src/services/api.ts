/**
 * Client HTTP dùng chung.
 *
 * - `api` / default export: instance axios đầy đủ (`AxiosResponse`, interceptors…).
 * - `http`: cùng instance, helper trả thẳng `response.data`.
 * - `appConfig`: `@/configs/app.config` — `apiPrefix` = `NEXT_PUBLIC_API_BASE_URL` (xem `.env.development` / `.env.production`).
 */
export { default as api } from './axios/AxiosBase'
export { default } from './axios/AxiosBase'
export { http } from './http'
export { default as appConfig } from '@/configs/app.config'
export type { AppConfig } from '@/configs/app.config'
