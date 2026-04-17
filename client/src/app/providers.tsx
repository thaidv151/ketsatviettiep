'use client'

import '@ant-design/v5-patch-for-react-19'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AuthHydrate, GlobalLoadingBar } from '@/stores'
import { ConfigProvider } from 'antd'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            fontFamily:
              'var(--font-roboto-sans), Roboto, ui-sans-serif, system-ui, sans-serif',
            colorPrimary: '#1677ff',
            colorLink: '#1677ff',
            colorInfo: '#1677ff',
            colorSuccess: '#1677ff',
            borderRadius: 6,
          },
          components: {
            Button: {
              colorPrimary: '#1677ff',
              colorPrimaryHover: '#4096ff',
              colorPrimaryActive: '#0958d9',
            },
          },
        }}
      >
        <AuthHydrate />
        <GlobalLoadingBar />
        {children}
      </ConfigProvider>
    </AntdRegistry>
  )
}
