'use client'

import '@ant-design/v5-patch-for-react-19'
import { AuthHydrate, GlobalLoadingBar } from '@/stores'
import { ConfigProvider } from 'antd'
import { Toaster } from '@/components/ui/toaster'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily:
            'var(--font-roboto-sans), Roboto, ui-sans-serif, system-ui, sans-serif',
          colorPrimary: '#1677ff',
          colorLink: '#1677ff',
          colorInfo: '#1677ff',
          colorSuccess: '#1677ff',
          borderRadius: 8,
          // Tăng kích thước mặc định cho toàn bộ component
          controlHeight: 38,          // height của Button / Input / Select (default: 32)
          controlHeightSM: 32,        // height khi size="small" (default: 24)
          controlHeightLG: 44,        // height khi size="large" (default: 40)
          fontSize: 14,               // font size base
          fontSizeSM: 13,
          fontSizeLG: 15,
          paddingContentHorizontal: 12, // padding ngang bên trong input/select
        },
        components: {
          Button: {
            colorPrimary: '#1677ff',
            colorPrimaryHover: '#4096ff',
            colorPrimaryActive: '#0958d9',
            paddingInline: 18,         // padding ngang của button
            paddingInlineSM: 12,
            paddingInlineLG: 22,
            contentFontSize: 14,
            contentFontSizeSM: 13,
            contentFontSizeLG: 15,
          },
        },
      }}
    >
      <AuthHydrate />
      <GlobalLoadingBar />
      <Toaster />
      {children}
    </ConfigProvider>
  )
}
