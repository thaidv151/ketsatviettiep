'use client'
import React from 'react'
import { Form, Input, InputNumber, Modal } from 'antd'
import type { NhomDanhMucDto, NhomDanhMucCreateVM, NhomDanhMucEditVM } from '@/types/danhMuc'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  item: NhomDanhMucDto | null
  onClose: () => void
  onSuccess: () => void
  loading?: boolean
}

export const NhomDanhMucForm: React.FC<Props> = ({ open, mode, item, onClose, onSuccess, loading }) => {
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        form.setFieldsValue(item)
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, item, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      // Logic call API will be in page.tsx or passed as prop
      onSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? 'Thêm nhóm danh mục' : 'Cập nhật nhóm danh mục'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={mode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
      cancelText="Hủy"
      width={600}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="maNhomDanhMuc"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Mã nhóm</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã nhóm' }]}
          >
            <Input placeholder="VD: CATEGORY_TYPE" disabled={mode === 'edit'} />
          </Form.Item>
          <Form.Item
            name="tenNhomDanhMuc"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Tên nhóm</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input placeholder="VD: Nhóm sản phẩm" />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="iconUrl"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Icon URL</span>}
          >
            <Input placeholder="URL hình ảnh hoặc icon class" />
          </Form.Item>
          <Form.Item
            name="thuTuHienThi"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Thứ tự hiển thị</span>}
          >
            <InputNumber className="w-full" placeholder="0" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
