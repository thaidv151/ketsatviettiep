'use client'

import type { MeResponse } from '@/services/auth/authApi'
import { clearAccessToken, getAccessToken } from '@/services/auth/tokenStorage'
import { useSyncExternalStore } from 'react'

/** Thông tin user (`AppUserDto`) — từ login hoặc `/api/auth/me`. Truy cập: `auth.UserInfo`. */
export type UserInfo = MeResponse

type AuthState = { userInfo: UserInfo | null }

export type AuthAction =
  | { type: 'SET_USER_INFO'; payload: UserInfo }
  | { type: 'CLEAR_USER_INFO' }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER_INFO':
      return { userInfo: action.payload }
    case 'CLEAR_USER_INFO':
      return { userInfo: null }
    default:
      return state
  }
}

const INITIAL_STATE: AuthState = { userInfo: null }
let memoryState: AuthState = INITIAL_STATE
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

/** Dispatch action cập nhật store — dùng được ở bất kỳ đâu (không cần hook). */
export function dispatch(action: AuthAction) {
  memoryState = reducer(memoryState, action)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): AuthState {
  return memoryState
}

function getServerSnapshot(): AuthState {
  return INITIAL_STATE
}

async function fetchUserInfo() {
  const token = getAccessToken()
  if (!token) {
    dispatch({ type: 'CLEAR_USER_INFO' })
    return
  }
  const { meRequest } = await import('@/services/auth/authApi')
  try {
    const me = await meRequest()
    dispatch({
      type: 'SET_USER_INFO',
      payload: me,
    })
  } catch {
    dispatch({ type: 'CLEAR_USER_INFO' })
  }
}

function logout() {
  clearAccessToken()
  dispatch({ type: 'CLEAR_USER_INFO' })
}

/**
 * Snapshot toàn cục + dispatch. Ví dụ: `auth.UserInfo`, `auth.dispatch({ type: 'CLEAR_USER_INFO' })`.
 */
export const auth = {
  get UserInfo() {
    return memoryState.userInfo
  },
  dispatch,
  fetchUserInfo,
  logout,
}

/**
 * Hook đăng ký lắng nghe store; component re-render khi `UserInfo` thay đổi.
 * Truy cập ngoài React: `auth.UserInfo` hoặc `auth.dispatch(...)`.
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    UserInfo: state.userInfo,
    dispatch,
    fetchUserInfo: auth.fetchUserInfo,
    logout: auth.logout,
  }
}
