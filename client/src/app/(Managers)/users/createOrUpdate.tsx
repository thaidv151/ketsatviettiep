'use client'

import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Spin,
  Row,
  Col,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import type {
  AppUserDto,
  AppUserDetailDto,
  CreateAppUserRequest,
  UpdateAppUserRequest,
} from '@/services/appUser.service'
import { appUserApi } from '@/services/appUser.service'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type UserCreateOrUpdateProps = {
  open: boolean
  mode: 'create' | 'edit'
  /** Bản ghi list khi sửa — dùng để lấy id và tải chi tiết */
  user: AppUserDto | null
  onClose: () => void
  onSuccess: () => void
}

export default function UserCreateOrUpdate({
  open,
  mode,
  user,
  onClose,
  onSuccess,
}: UserCreateOrUpdateProps) {
  const [form] = Form.useForm()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({
        email: '',
        username: '',
        fullName: '',
        gender: null,
      })
      return
    }
    if (!user?.id) return
    let cancelled = false
    setLoadingDetail(true)
    void appUserApi
      .getDetail(user.id)
      .then((d: AppUserDetailDto) => {
        if (cancelled) return
        form.setFieldsValue({
          email: d.email,
          username: d.username ?? '',
          fullName: d.fullName ?? '',
          phoneNumber: d.phoneNumber ?? '',
          ngaySinh: d.ngaySinh ? dayjs(d.ngaySinh) : null,
          gender: d.gender,
          avatar: d.avatar ?? '',
          province: d.province ?? '',
          district: d.district ?? '',
          ward: d.ward ?? '',
          addressDetail: d.addressDetail ?? '',
          emailConfirmed: d.emailConfirmed,
          isLocked: d.isLocked,
          isFirstLogin: d.isFirstLogin,
        })
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, mode, user?.id, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      if (mode === 'create') {
        const body: CreateAppUserRequest = {
          email: v.email.trim(),
          username: v.username.trim(),
          fullName: v.fullName?.trim() || null,
          phoneNumber: v.phoneNumber?.trim() || null,
          ngaySinh: v.ngaySinh ? v.ngaySinh.format('YYYY-MM-DD') : null,
          gender: v.gender ?? null,
          avatar: v.avatar?.trim() || null,
          province: v.province?.trim() || null,
          district: v.district?.trim() || null,
          ward: v.ward?.trim() || null,
          addressDetail: v.addressDetail?.trim() || null,
          password: v.password,
        }
        await appUserApi.create(body)
      } else if (user) {
        const ngay: Dayjs | undefined = v.ngaySinh
        const body: UpdateAppUserRequest = {
          email: v.email.trim(),
          username: v.username.trim(),
          fullName: v.fullName?.trim() || null,
          phoneNumber: v.phoneNumber?.trim() || null,
          ngaySinh: ngay ? ngay.format('YYYY-MM-DD') : null,
          gender: v.gender ?? null,
          avatar: v.avatar?.trim() || null,
          province: v.province?.trim() || null,
          district: v.district?.trim() || null,
          ward: v.ward?.trim() || null,
          addressDetail: v.addressDetail?.trim() || null,
          newPassword: v.newPassword?.trim() || null,
          emailConfirmed: v.emailConfirmed ?? false,
          isLocked: v.isLocked ?? false,
          isFirstLogin: v.isFirstLogin ?? true,
        }
        await appUserApi.update(user.id, body)
      }
      onSuccess()
      onClose()
    } catch {
      /* validation / api */
    } finally {
      setSubmitting(false)
    }
  }

  const title =
    mode === 'create' ? 'Thêm người dùng' : 'Cập nhật người dùng'

  return (
    <Modal
      title={<span className="font-extrabold text-slate-800">{title}</span>}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      width={820}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: primaryBtn }}
      destroyOnHidden
    >
      {mode === 'edit' && loadingDetail ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" className="mt-2">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Thông tin cơ bản
          </div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="email@domain.com" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Họ tên">
                <Input placeholder="Nhập họ tên" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Nhập tên đăng nhập' },
                  {
                    pattern: /^[a-zA-Z0-9._-]{3,100}$/,
                    message: '3–100 ký tự: chữ, số, . _ -',
                  },
                ]}
              >
                <Input placeholder="vd: nguyen_van_a" className="rounded-sm" autoComplete="username" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              {mode === 'create' ? (
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Nhập mật khẩu' },
                    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                  ]}
                >
                  <Input.Password className="rounded-sm" />
                </Form.Item>
              ) : (
                <Form.Item name="newPassword" label="Mật khẩu mới">
                  <Input.Password placeholder="Để trống nếu không đổi" className="rounded-sm" />
                </Form.Item>
              )}
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="avatar" label="Avatar (URL)">
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ngaySinh" label="Ngày sinh">
                <DatePicker className="w-full rounded-sm" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select
                  allowClear
                  options={[
                    { value: 0, label: 'Không xác định' },
                    { value: 1, label: 'Nam' },
                    { value: 2, label: 'Nữ' },
                    { value: 3, label: 'Khác' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Địa chỉ liên hệ
          </div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="province" label="Tỉnh/Thành phố">
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="district" label="Quận/Huyện">
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ward" label="Phường/Xã">
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="addressDetail" label="Địa chỉ chi tiết">
                <Input.TextArea rows={2} className="rounded-sm" />
              </Form.Item>
            </Col>
          </Row>

          {mode === 'edit' ? (
            <>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Trạng thái tài khoản
              </div>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="emailConfirmed"
                    label="Email đã xác thực"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="isLocked" label="Khóa tài khoản" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="isFirstLogin"
                    label="Lần đăng nhập đầu tiên"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : null}
        </Form>
      )}
    </Modal>
  )
}
