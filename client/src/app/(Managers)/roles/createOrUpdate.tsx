'use client'

import { useEffect, useState } from 'react'
import { Modal, Form, Input, Switch } from 'antd'
import { rbacAdminApi, type RoleDto } from '@/services/rbacAdminApi'

export type RoleModalMode = 'create' | 'edit'

type RoleCreateOrUpdateProps = {
  open: boolean
  mode: RoleModalMode
  role: RoleDto | null
  onClose: () => void
  onSuccess: (mode: RoleModalMode) => void
}

export default function RoleCreateOrUpdate({
  open,
  mode,
  role,
  onClose,
  onSuccess,
}: RoleCreateOrUpdateProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
      return
    }
    if (!role) return
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      type: role.type ?? '',
      isActive: role.isActive,
    })
  }, [open, mode, role, form])

  const submit = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body = {
        name: v.name.trim(),
        code: v.code.trim(),
        type: v.type?.trim() || null,
        isActive: v.isActive ?? true,
      }
      if (mode === 'create') {
        await rbacAdminApi.roles.create(body)
      } else if (role) {
        await rbacAdminApi.roles.update(role.id, body)
      }
      onSuccess(mode)
      onClose()
    } catch {
      /* validation/api */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={
        <span className="font-extrabold text-slate-800">
          {mode === 'create' ? 'Thêm role' : 'Cập nhật role'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={submit}
      confirmLoading={submitting}
      width={520}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="name"
          label="Tên role"
          rules={[{ required: true, message: 'Nhập tên role' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã role"
          rules={[{ required: true, message: 'Nhập mã role' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="type" label="Loại">
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
