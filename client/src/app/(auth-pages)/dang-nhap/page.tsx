'use client'

import appConfig from '@/configs/app.config'
import { loginRequest } from '@/services/auth/authApi'
import { setAccessToken } from '@/services/auth/tokenStorage'
import { dispatch } from '@/stores/authStore'
import { loading, useLoading } from '@/stores/uiStore'
import axios from 'axios'
import { Lock, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { Button, Form, Input, message } from 'antd'

type LoginFormValues = {
  login: string
  password: string
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm<LoginFormValues>()
  const { isLoading } = useLoading()

  const redirectUrl = useMemo(
    () =>
      searchParams.get('redirect')?.trim() || appConfig.authenticatedEntryPath,
    [searchParams],
  )

  const onFinish = async (values: LoginFormValues) => {
    const login = values.login.trim()
    loading.dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const payload = login.includes('@')
        ? { email: login, password: values.password }
        : { username: login, password: values.password }

      const res = await loginRequest(payload)
      setAccessToken(res.accessToken)
      dispatch({
        type: 'SET_USER_INFO',
        payload: res.user,
      })

      message.success('Đăng nhập thành công')
      router.push(redirectUrl)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined
        message.error(data?.message ?? 'Đăng nhập thất bại')
      } else {
        message.error('Đăng nhập thất bại')
      }
    } finally {
      loading.dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 xl:px-0">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#1677ff]">
            Trang chủ
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-800">Đăng nhập</span>
        </nav>

        <div className="mt-5 grid min-h-0 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:min-h-[680px] xl:grid-cols-[1.05fr_1fr]">
          <aside className="hidden min-h-0 overflow-hidden xl:block">
            <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 xl:min-h-full">
              <p className="max-w-[240px] text-center text-sm text-slate-500">
                Khu vực banner — bạn có thể thay bằng ảnh (ví dụ{' '}
                <code className="rounded bg-white/60 px-1 text-xs">&lt;img /&gt;</code>) sau.
              </p>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col justify-center gap-y-4 p-6 sm:p-8 lg:p-10 xl:h-full">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900">
                Đăng nhập tài khoản
              </h1>
              <p className="mt-2 text-slate-600">
                Đăng nhập để tiếp tục sử dụng dịch vụ.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="mt-6"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="login"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UserRound className="h-4 w-4 text-slate-600" />
                    Email hoặc tên đăng nhập
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập' },
                ]}
              >
                <Input
                  size="large"
                  autoComplete="username"
                  placeholder="Email hoặc tên đăng nhập"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Lock className="h-4 w-4 text-slate-600" />
                    Mật khẩu
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password
                  size="large"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  block
                  className="font-bold uppercase tracking-wide"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <Link
                href="/dang-ky"
                className="font-bold text-[#1677ff] hover:text-[#0958d9]"
              >
                Đăng ký ngay
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function DangNhapPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
