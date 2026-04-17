'use client'

import { useLoading } from '@/stores/uiStore'

/**
 * Thanh loading cố định phía trên viewport + lớp mờ nhẹ khi `loading.isLoading === true`.
 */
export function GlobalLoadingBar() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] cursor-wait bg-slate-900/10 transition-opacity"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden bg-[#1677ff]/20"
        role="progressbar"
        aria-busy="true"
        aria-label="Đang tải"
      >
        <div className="global-loading-bar-indeterminate h-full w-1/3 bg-[#1677ff]" />
      </div>
    </>
  )
}
