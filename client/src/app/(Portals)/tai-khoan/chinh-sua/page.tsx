'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { dispatch } from '@/stores/authStore'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { getProfileRequest, updateProfileRequest, meRequest, type MeResponse } from '@/services/auth/authApi'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Loader2, User, Save } from 'lucide-react'
import axios from 'axios'
import type { AppUserDetailDto } from '@/services/appUser.service'
import { toDateInputValue } from '../profile-helpers'

const LOGIN = '/dang-nhap?redirect=' + encodeURIComponent('/tai-khoan/chinh-sua')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormState = {
  email: string
  fullName: string
  phoneNumber: string
  ngaySinh: string
  gender: string
  province: string
  ward: string
  addressDetail: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const emptyForm: FormState = {
  email: '',
  fullName: '',
  phoneNumber: '',
  ngaySinh: '',
  gender: '',
  province: '',
  district: '',
  ward: '',
  addressDetail: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

function mapDetailToForm(d: AppUserDetailDto): FormState {
  return {
    email: d.email ?? '',
    fullName: d.fullName ?? '',
    phoneNumber: d.phoneNumber ?? '',
    ngaySinh: toDateInputValue(d.ngaySinh),
    gender: d.gender == null || d.gender === 0 ? '' : String(d.gender),
    province: d.province ?? '',
    ward: d.ward ?? '',
    addressDetail: d.addressDetail ?? '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  }
}

export default function TaiKhoanChinhSuaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [displayUsername, setDisplayUsername] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!getAccessToken()) {
      router.replace(LOGIN)
      return
    }
    setReady(true)
  }, [router])

  const load = useCallback(async () => {
    if (!getAccessToken()) return
    setLoading(true)
    try {
      const d = await getProfileRequest()
      setForm({ ...mapDetailToForm(d), currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setDisplayUsername(d.username?.trim() || '—')
      setHasLoaded(true)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Không tải được hồ sơ',
        description: 'Vui lòng thử lại sau.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!ready) return
    void load()
  }, [ready, load])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailRegex.test(form.email)) {
      toast({ variant: 'destructive', title: 'Email không hợp lệ' })
      return
    }
    if (form.newPassword || form.confirmNewPassword) {
      if (form.newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Mật khẩu mới tối thiểu 6 ký tự' })
        return
      }
      if (form.newPassword !== form.confirmNewPassword) {
        toast({ variant: 'destructive', title: 'Mật khẩu xác nhận không khớp' })
        return
      }
      if (!form.currentPassword.trim()) {
        toast({
          variant: 'destructive',
          title: 'Mật khẩu hiện tại',
          description: 'Bắt buộc nhập mật khẩu hiện tại khi đổi mật khẩu mới.',
        })
        return
      }
    }
    if (form.currentPassword && !form.newPassword) {
      toast({
        variant: 'destructive',
        title: 'Mật khẩu mới',
        description: 'Nhập mật khẩu mới hoặc xóa mật khẩu hiện tại nếu không đổi.',
      })
      return
    }

    setSaving(true)
    try {
      await updateProfileRequest({
        email: form.email,
        fullName: form.fullName || null,
        phoneNumber: form.phoneNumber || null,
        ngaySinh: form.ngaySinh || null,
        gender: form.gender === '' ? null : Number(form.gender),
        province: form.province || null,
        district: form.district || null,
        ward: form.ward || null,
        addressDetail: form.addressDetail || null,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
        confirmNewPassword: form.confirmNewPassword || null,
      })
      const me: MeResponse = await meRequest()
      dispatch({ type: 'SET_USER_INFO', payload: me })
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmNewPassword: '' }))
      toast({
        variant: 'success',
        title: 'Đã lưu',
        description: 'Thông tin đã được cập nhật.',
      })
      router.push('/tai-khoan')
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined
      toast({
        variant: 'destructive',
        title: 'Không lưu được',
        description: msg ?? 'Vui lòng thử lại.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-64" />
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] border-b border-border bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <Link
          href="/tai-khoan"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Thông tin cá nhân
        </Link>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-16 sm:w-16">
              <User className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Chỉnh sửa hồ sơ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">Cập nhật thông tin và mật khẩu.</p>
            </div>
          </div>
        </div>

        {loading && !hasLoaded ? (
          <Card className="p-6 sm:p-8">
            <div className="space-y-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-24" />
            </div>
          </Card>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <Card className="p-5 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tài khoản</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tên đăng nhập:{' '}
                <span className="font-semibold text-foreground">{displayUsername}</span>
                <span className="ml-1 text-xs">(không thể sửa)</span>
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={form.currentPassword}
                    onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Bắt buộc nếu đổi mật khẩu mới"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Để trống nếu không đổi"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmNewPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmNewPassword: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cá nhân</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngaySinh">Ngày sinh</Label>
                  <Input
                    id="ngaySinh"
                    type="date"
                    value={form.ngaySinh}
                    onChange={(e) => setForm((f) => ({ ...f, ngaySinh: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={form.gender || '_unknown'}
                    onValueChange={(v) => setForm((f) => ({ ...f, gender: v === '_unknown' ? '' : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chưa chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_unknown">Chưa chọn</SelectItem>
                      <SelectItem value="1">Nam</SelectItem>
                      <SelectItem value="2">Nữ</SelectItem>
                      <SelectItem value="3">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="province">Tỉnh / Thành phố</Label>
                  <Input
                    id="province"
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ward">Phường / Xã</Label>
                  <Input
                    id="ward"
                    value={form.ward}
                    onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressDetail">Địa chỉ chi tiết</Label>
                  <Textarea
                    id="addressDetail"
                    rows={2}
                    value={form.addressDetail}
                    onChange={(e) => setForm((f) => ({ ...f, addressDetail: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            <Separator />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/tai-khoan">Hủy</Link>
              </Button>
              <Button type="submit" disabled={saving} className="min-w-40 w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
