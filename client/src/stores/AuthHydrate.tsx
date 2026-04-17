'use client'

import { getAccessToken } from '@/services/auth/tokenStorage'
import { auth } from '@/stores/authStore'
import { useEffect } from 'react'

/** Sau khi F5: nếu còn token thì gọi `/api/auth/me` và đổ vào `auth.UserInfo`. */
export function AuthHydrate() {
  useEffect(() => {
    if (getAccessToken()) {
      void auth.fetchUserInfo()
    }
  }, [])
  return null
}
