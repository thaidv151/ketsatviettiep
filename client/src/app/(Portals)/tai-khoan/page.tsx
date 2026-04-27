'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { getProfileRequest } from '@/services/auth/authApi'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Pencil, User } from 'lucide-react'
import type { AppUserDetailDto } from '@/services/appUser.service'
import { formatDateVi, genderLabel } from './profile-helpers'

const LOGIN = '/dang-nhap?redirect=' + encodeURIComponent('/tai-khoan')

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="text-base text-foreground">{value || '—'}</dd>
    </div>
  )
}

export default function TaiKhoanViewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AppUserDetailDto | null>(null)

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
      setData(await getProfileRequest())
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
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Về trang chủ
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-16 sm:w-16">
              <User className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Thông tin cá nhân
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Xem thông tin tài khoản. Bấm &quot;Chỉnh sửa&quot; để cập nhật.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
            <Link href="/tai-khoan/chinh-sua" className="gap-2">
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>

        {loading && !data ? (
          <Card className="p-6 sm:p-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Card>
        ) : data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 sm:p-8">
              <h2 className="border-b border-border pb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Tài khoản
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Tên đăng nhập" value={data.username ?? ''} />
                <Field label="Email" value={data.email} />
              </dl>
            </Card>

            <Card className="p-6 sm:p-8">
              <h2 className="border-b border-border pb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Cá nhân
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Họ và tên" value={data.fullName ?? ''} />
                <Field label="Số điện thoại" value={data.phoneNumber ?? ''} />
                <Field label="Ngày sinh" value={formatDateVi(data.ngaySinh)} />
                <Field label="Giới tính" value={genderLabel(data.gender ?? undefined)} />
              </dl>
            </Card>

            <Card className="p-6 sm:p-8 lg:col-span-2">
              <h2 className="border-b border-border pb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Địa chỉ
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Tỉnh / Thành phố" value={data.province ?? ''} />
                <Field label="Phường / Xã" value={data.ward ?? ''} />
                <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Địa chỉ chi tiết
                  </dt>
                  <dd className="whitespace-pre-wrap text-base text-foreground">{data.addressDetail || '—'}</dd>
                </div>
              </dl>
            </Card>

            <div className="lg:col-span-2">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/don-hang">Đơn hàng của tôi</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
