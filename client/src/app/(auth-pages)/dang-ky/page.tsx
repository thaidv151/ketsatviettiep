'use client'

import { registerRequest } from '@/services/auth/authApi'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { Lock, Mail, User, UserRoundPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loading, useLoading } from '@/stores/uiStore'
import { Button, Form, Input } from 'antd'

type RegisterFormValues = {
  userName: string
  password: string
  confirmPassword: string
  name: string
  email: string
  phoneNumber: string
}

const usernameRegex = /^[a-zA-Z0-9._-]{3,100}$/
const passwordMin = 6
const phoneRegex = /^(0|\+84)\d{9,10}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DangKyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form] = Form.useForm<RegisterFormValues>()
  const { isLoading } = useLoading()

  const onFinish = async (values: RegisterFormValues) => {
    loading.dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await registerRequest({
        email: values.email.trim(),
        username: values.userName.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        fullName: values.name.trim(),
        phoneNumber: values.phoneNumber.trim().replace(/\s/g, ''),
      })
      toast({ variant: 'success', title: 'Đăng ký thành công. Vui lòng đăng nhập.' })
      form.resetFields()
      router.push('/dang-nhap')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined
        toast({ variant: 'destructive', title: data?.message ?? 'Đăng ký thất bại' })
      } else {
        toast({ variant: 'destructive', title: 'Đăng ký thất bại' })
      }
    } finally {
      loading.dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-primary">
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span className="font-medium text-foreground">Đăng ký tài khoản</span>
        </nav>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl shadow-primary/10 ring-1 ring-border/50 backdrop-blur-sm">
          <div
            className="h-1.5 bg-gradient-to-r from-primary via-rose-500/80 to-amber-500/90"
            aria-hidden
          />
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Đăng ký tài khoản
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Tạo tài khoản để mua hàng, xem đơn và lưu sản phẩm yêu thích.
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
              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
                <Form.Item
                  className="sm:col-span-1"
                  name="userName"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserRoundPlus className="h-4 w-4 text-primary" />
                      Tên đăng nhập
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                    {
                      pattern: usernameRegex,
                      message: 'Tên đăng nhập chỉ gồm chữ, số, . _ - (3–100 ký tự)',
                    },
                  ]}
                  extra="Chữ, số và ký tự . _ - (3–100 ký tự)."
                >
                  <Input
                    size="large"
                    autoComplete="username"
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  className="sm:col-span-1"
                  name="name"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      Họ và tên
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input
                    size="large"
                    autoComplete="name"
                    placeholder="Họ và tên đầy đủ"
                  />
                </Form.Item>
              </div>

              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
                <Form.Item
                  name="password"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Lock className="h-4 w-4 text-primary" />
                      Mật khẩu
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: passwordMin, message: `Mật khẩu tối thiểu ${passwordMin} ký tự` },
                  ]}
                  extra={`Tối thiểu ${passwordMin} ký tự.`}
                >
                  <Input.Password
                    size="large"
                    autoComplete="new-password"
                    placeholder="Mật khẩu"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Lock className="h-4 w-4 text-primary" />
                      Nhắc lại mật khẩu
                    </span>
                  }
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhắc lại mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error('Mật khẩu và nhắc lại mật khẩu không khớp'),
                        )
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                  />
                </Form.Item>
              </div>

              <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
                <Form.Item
                  name="email"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { pattern: emailRegex, message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input
                    size="large"
                    type="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label={
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      Số điện thoại
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    {
                      validator: (_, value) => {
                        const v = String(value ?? '').trim().replace(/\s/g, '')
                        if (!v) return Promise.resolve()
                        if (!phoneRegex.test(v)) {
                          return Promise.reject(
                            new Error('Số điện thoại không hợp lệ (VD: 09xxxxxxxx)'),
                          )
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type="tel"
                    autoComplete="tel"
                    placeholder="VD: 0912345678"
                  />
                </Form.Item>
              </div>

              <Form.Item className="mb-0 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  block
                  className="!h-11 !font-bold !uppercase !tracking-wide"
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="font-bold text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
