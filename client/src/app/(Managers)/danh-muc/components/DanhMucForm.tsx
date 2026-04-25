'use client'
import React, { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd'
import type { DanhMucDto, DanhMucCreateVM, NhomDanhMucDto } from '@/types/danhMuc'
import { nhomDanhMucApi } from '@/services/danhMuc.service'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  item: DanhMucDto | null
  defaultGroup?: string
  onClose: () => void
  onSuccess: () => void
  loading?: boolean
}

export const DanhMucForm: React.FC<Props> = ({ open, mode, item, defaultGroup, onClose, onSuccess, loading }) => {
  const [form] = Form.useForm()
  const [nhomDanhMucs, setNhomDanhMucs] = useState<NhomDanhMucDto[]>([])

  useEffect(() => {
    const loadGroups = async () => {
      const res = await nhomDanhMucApi.getData({ pageIndex: 1, pageSize: 1000 })
      if (res.status) {
        setNhomDanhMucs(res.data.items)
      }
    }
    if (open) {
      loadGroups()
      if (mode === 'edit' && item) {
        form.setFieldsValue(item)
      } else {
        form.resetFields()
        form.setFieldValue('isActive', true)
        if (defaultGroup) {
          form.setFieldValue('maNhomDanhMuc', defaultGroup)
        }
      }
    }
  }, [open, mode, item, defaultGroup, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      // API call in page.tsx
      onSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? 'Thêm dữ liệu danh mục' : 'Cập nhật dữ liệu danh mục'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={mode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
      cancelText="Hủy"
      width={700}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="maNhomDanhMuc"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Nhóm danh mục</span>}
            rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
          >
            <Select placeholder="Chọn nhóm danh mục">
              {nhomDanhMucs.map(g => (
                <Select.Option key={g.maNhomDanhMuc} value={g.maNhomDanhMuc}>
                  {g.tenNhomDanhMuc} ({g.maNhomDanhMuc})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-2">
            <Form.Item
              name="maDanhMuc"
              label={<span className="text-[11px] font-bold uppercase tracking-widest">Mã danh mục</span>}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Input placeholder="Mã" disabled={mode === 'edit'} />
            </Form.Item>
            <Form.Item
              name="tenDanhMuc"
              label={<span className="text-[11px] font-bold uppercase tracking-widest">Tên danh mục</span>}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Input placeholder="Tên" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="moTa"
          label={<span className="text-[11px] font-bold uppercase tracking-widest">Mô tả</span>}
        >
          <Input.TextArea placeholder="Nhập mô tả ngắn..." rows={2} />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
          <Form.Item
            name="iconUrl"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Icon URL</span>}
          >
            <Input placeholder="Icon" />
          </Form.Item>
          <Form.Item
            name="loaiNgonNgu"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Ngôn ngữ</span>}
          >
            <Select placeholder="Chọn">
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">Tiếng Anh</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="thuTuHienThi"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Thứ tự</span>}
          >
            <InputNumber className="w-full" placeholder="0" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            name="urlLink"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Đường dẫn liên kết</span>}
          >
            <Input placeholder="http://..." />
          </Form.Item>
          <Form.Item
            name="isActive"
            label={<span className="text-[11px] font-bold uppercase tracking-widest">Trạng thái</span>}
            valuePropName="checked"
          >
            <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
