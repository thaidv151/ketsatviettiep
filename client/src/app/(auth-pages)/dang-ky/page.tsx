'use client'

import { registerRequest } from '@/services/auth/authApi'
import axios from 'axios'
import { Lock, Mail, User, UserRoundPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loading, useLoading } from '@/stores/uiStore'
import { Button, Form, Input, message } from 'antd'

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
      message.success('Đăng ký thành công. Vui lòng đăng nhập.')
      form.resetFields()
      router.push('/dang-nhap')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined
        message.error(data?.message ?? 'Đăng ký thất bại')
      } else {
        message.error('Đăng ký thất bại')
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
          <span className="font-medium text-slate-800">Đăng ký tài khoản</span>
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

          <section className="flex min-h-0 flex-col gap-y-4 p-6 sm:p-8 lg:p-10 xl:h-full xl:overflow-y-auto">
            <div className="text-center lg:mt-8">
              <h1 className="text-3xl font-extrabold text-slate-900">
                Đăng ký tài khoản
              </h1>
              <p className="mt-2 text-slate-600">
                Tạo tài khoản để sử dụng đầy đủ các tính năng.
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
                name="userName"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UserRoundPlus className="h-4 w-4 text-slate-600" />
                    Tên đăng nhập
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  {
                    pattern: usernameRegex,
                    message:
                      'Tên đăng nhập chỉ gồm chữ, số, . _ - (3–100 ký tự)',
                  },
                ]}
                extra="Chữ, số và ký tự . _ - (3–100 ký tự), trùng với quy tắc backend."
              >
                <Input
                  size="large"
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
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
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: passwordMin, message: `Mật khẩu tối thiểu ${passwordMin} ký tự` },
                ]}
                extra={`Tối thiểu ${passwordMin} ký tự (theo cấu hình API).`}
              >
                <Input.Password
                  size="large"
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Lock className="h-4 w-4 text-slate-600" />
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

              <Form.Item
                name="name"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <User className="h-4 w-4 text-slate-600" />
                    Họ và tên
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input
                  size="large"
                  autoComplete="name"
                  placeholder="Nhập họ và tên đầy đủ"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Mail className="h-4 w-4 text-slate-600" />
                    Địa chỉ email
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ email' },
                  {
                    pattern: emailRegex,
                    message: 'Địa chỉ email không hợp lệ',
                  },
                ]}
              >
                <Input
                  size="large"
                  type="email"
                  autoComplete="email"
                  placeholder="Nhập địa chỉ email"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <User className="h-4 w-4 text-slate-600" />
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

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  block
                  className="font-bold uppercase tracking-wide"
                >
                  Đăng ký tài khoản
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
              Đã có tài khoản?{' '}
              <Link
                href="/dang-nhap"
                className="font-bold text-[#1677ff] hover:text-[#0958d9]"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
