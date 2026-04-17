'use client'

import { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Switch } from 'antd'
import { rbacAdminApi, type ModuleDto } from '@/services/rbacAdminApi'

export type ModuleModalMode = 'create' | 'edit'

type ModuleCreateOrUpdateProps = {
  open: boolean
  mode: ModuleModalMode
  module: ModuleDto | null
  onClose: () => void
  onSuccess: (mode: ModuleModalMode) => void
}

export default function ModuleCreateOrUpdate({
  open,
  mode,
  module,
  onClose,
  onSuccess,
}: ModuleCreateOrUpdateProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ sortOrder: 0, isShow: true })
      return
    }
    if (!module) return
    form.setFieldsValue({
      code: module.code ?? '',
      name: module.name,
      sortOrder: module.sortOrder,
      isShow: module.isShow,
      link: module.link ?? '',
      icon: module.icon ?? '',
    })
  }, [open, mode, module, form])

  const submit = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body = {
        code: v.code?.trim() || null,
        name: v.name.trim(),
        sortOrder: v.sortOrder ?? 0,
        isShow: v.isShow ?? true,
        link: v.link?.trim() || null,
        icon: v.icon?.trim() || null,
      }
      if (mode === 'create') {
        await rbacAdminApi.modules.create(body)
      } else if (module) {
        await rbacAdminApi.modules.update(module.id, body)
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
          {mode === 'create' ? 'Thêm module' : 'Cập nhật module'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={submit}
      confirmLoading={submitting}
      width={560}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="code" label="Mã module">
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Tên module"
          rules={[{ required: true, message: 'Nhập tên module' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="sortOrder" label="Thứ tự">
          <InputNumber className="w-full rounded-sm" />
        </Form.Item>
        <Form.Item name="link" label="Link">
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="icon" label="Icon">
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="isShow" label="Hiển thị" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
