'use client'

import appConfig from '@/configs/app.config'
import { loginRequest } from '@/services/auth/authApi'
import { setAccessToken } from '@/services/auth/tokenStorage'
import { dispatch } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import { loading, useLoading } from '@/stores/uiStore'
import axios from 'axios'
import { Lock, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { Button, Form, Input } from 'antd'

type LoginFormValues = {
  login: string
  password: string
}

/** Vai trò khách hàng — sau đăng nhập về trang chủ cửa hàng, không vào quản trị. */
const ROLE_CODE_CUSTOMER = 'NGUOIDUNG'

/** `?redirect=` có ưu tiên; không thì: chỉ NGUOIDUNG (hoặc không có vai trò) → `/`, còn lại → dashboard. */
function resolveAfterLoginPath(
  roleCodes: string[] | undefined,
  queryRedirect: string | null,
): string {
  const explicit = queryRedirect?.trim()
  if (explicit) return explicit
  const codes = roleCodes ?? []
  const hasNonCustomerRole = codes.some((c) => c !== ROLE_CODE_CUSTOMER)
  if (hasNonCustomerRole) return appConfig.authenticatedEntryPath
  return '/'
}

function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [form] = Form.useForm<LoginFormValues>()
  const { isLoading } = useLoading()

  const queryRedirect = useMemo(() => searchParams.get('redirect'), [searchParams])

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
        payload: {
          user: res.user,
          menuItems: res.menuItems,
          roleCodes: res.roleCodes ?? [],
        },
      })

      toast({ variant: 'success', title: 'Đăng nhập thành công' })
      router.push(resolveAfterLoginPath(res.roleCodes, queryRedirect))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined
        toast({ variant: 'destructive', title: data?.message ?? 'Đăng nhập thất bại' })
      } else {
        toast({ variant: 'destructive', title: 'Đăng nhập thất bại' })
      }
    } finally {
      loading.dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[420px]">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-primary">
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span className="font-medium text-foreground">Đăng nhập</span>
        </nav>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl shadow-primary/10 ring-1 ring-border/50 backdrop-blur-sm">
          <div
            className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-amber-500/90"
            aria-hidden
          />
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Đăng nhập
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Nhập tài khoản để tiếp tục mua sắm và theo dõi đơn hàng.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="mt-8"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="login"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserRound className="h-4 w-4 text-primary" />
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
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="h-4 w-4 text-primary" />
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
                  className="!h-11 !font-bold !uppercase !tracking-wide"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/dang-ky" className="font-bold text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>
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
