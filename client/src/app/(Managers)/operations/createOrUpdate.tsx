'use client'

import { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd'
import {
  rbacAdminApi,
  type ModuleDto,
  type OperationDto,
} from '@/services/rbacAdminApi'

export type OperationModalMode = 'create' | 'edit'

type OperationCreateOrUpdateProps = {
  open: boolean
  mode: OperationModalMode
  operation: OperationDto | null
  modules: ModuleDto[]
  defaultModuleId?: string
  onClose: () => void
  onSuccess: (mode: OperationModalMode) => void
}

export default function OperationCreateOrUpdate({
  open,
  mode,
  operation,
  modules,
  defaultModuleId,
  onClose,
  onSuccess,
}: OperationCreateOrUpdateProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({
        moduleId: defaultModuleId || modules[0]?.id || undefined,
        sortOrder: 0,
        isShow: true,
      })
      return
    }
    if (!operation) return
    form.setFieldsValue({
      moduleId: operation.moduleId,
      name: operation.name,
      url: operation.url,
      code: operation.code,
      sortOrder: operation.sortOrder,
      isShow: operation.isShow,
    })
  }, [open, mode, operation, modules, defaultModuleId, form])

  const submit = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body = {
        moduleId: v.moduleId,
        name: v.name.trim(),
        url: v.url.trim(),
        code: v.code.trim(),
        sortOrder: v.sortOrder ?? 0,
        isShow: v.isShow ?? true,
      }
      if (mode === 'create') {
        await rbacAdminApi.operations.create(body)
      } else if (operation) {
        await rbacAdminApi.operations.update(operation.id, body)
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
          {mode === 'create' ? 'Thêm operation' : 'Cập nhật operation'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={submit}
      confirmLoading={submitting}
      width={620}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="moduleId"
          label="Module"
          rules={[{ required: true, message: 'Chọn module' }]}
        >
          <Select
            options={modules.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Chọn module"
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="Tên operation"
          rules={[{ required: true, message: 'Nhập tên operation' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item
          name="url"
          label="URL"
          rules={[{ required: true, message: 'Nhập URL' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã operation"
          rules={[{ required: true, message: 'Nhập mã operation' }]}
        >
          <Input className="rounded-sm" />
        </Form.Item>
        <Form.Item name="sortOrder" label="Thứ tự">
          <InputNumber className="w-full rounded-sm" />
        </Form.Item>
        <Form.Item name="isShow" label="Hiển thị" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}
