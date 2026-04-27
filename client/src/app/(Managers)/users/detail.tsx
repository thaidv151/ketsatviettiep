'use client'

import { useEffect, useState } from 'react'
import { Drawer, Descriptions, Spin, Button, Tag, Space } from 'antd'
import type { AppUserDetailDto } from '@/services/appUser.service'
import { appUserApi } from '@/services/appUser.service'

const primaryOutline =
  'border-[#1677ff] text-[#1677ff] hover:text-[#0958d9] hover:border-[#0958d9]'

type UserDetailDrawerProps = {
  open: boolean
  userId: string | null
  onClose: () => void
  onEdit: () => void
}

function formatDt(s: string | null | undefined) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('vi-VN')
  } catch {
    return s
  }
}

function genderLabel(g: number | null) {
  if (g === null || g === undefined) return '—'
  if (g === 1) return 'Nam'
  if (g === 2) return 'Nữ'
  if (g === 3) return 'Khác'
  return 'Không xác định'
}

export default function UserDetailDrawer({
  open,
  userId,
  onClose,
  onEdit,
}: UserDetailDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AppUserDetailDto | null>(null)

  useEffect(() => {
    if (!open || !userId) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    void appUserApi
      .getDetail(userId)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, userId])

  return (
    <Drawer
      title={
        <span className="font-extrabold text-slate-800 tracking-tight">
          Chi tiết người dùng
        </span>
      }
      placement="right"
      width="50vw"
      styles={{ body: { paddingBottom: 80 } }}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button className={primaryOutline} onClick={onEdit} disabled={!data}>
            Chỉnh sửa
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color={data.isLocked ? 'red' : 'green'}>
              {data.isLocked ? 'Đang khóa' : 'Hoạt động'}
            </Tag>
            {data.emailConfirmed ? (
              <Tag color="blue">Email đã xác thực</Tag>
            ) : (
              <Tag color="orange">Email chưa xác thực</Tag>
            )}
            {data.isFirstLogin ? <Tag>Lần đầu đăng nhập</Tag> : null}
          </div>
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ width: 160, fontWeight: 600 }}
          >
            <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {data.username ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {data.fullName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {genderLabel(data.gender)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {data.ngaySinh
                ? new Date(data.ngaySinh).toLocaleDateString('vi-VN')
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {data.phoneNumber ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {[data.addressDetail, data.ward, data.province]
                .filter(Boolean)
                .join(', ') || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Avatar (URL)">
              {data.avatar ? (
                <a
                  href={data.avatar}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1677ff] break-all"
                >
                  {data.avatar}
                </a>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số lần đăng nhập lỗi">
              {data.accessFailedCount}
            </Descriptions.Item>
            <Descriptions.Item label="Lockout đến">
              {formatDt(data.lockoutEnd)}
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập cuối">
              {formatDt(data.lastLogin)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDt(data.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {formatDt(data.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <p className="text-slate-500">Không có dữ liệu.</p>
      )}
    </Drawer>
  )
}
