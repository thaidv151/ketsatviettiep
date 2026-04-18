'use client'
import { useEffect, useState } from 'react'
import { Modal, Form, Input, Switch, Row, Col, Spin } from 'antd'
import type { BrandDto, CreateBrandRequest } from '@/services/brandApi'
import { brandApi } from '@/services/brandApi'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type Props = { open: boolean; mode: 'create' | 'edit'; item: BrandDto | null; onClose: () => void; onSuccess: () => void }

export default function BrandCreateOrUpdate({ open, mode, item, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') { form.resetFields(); form.setFieldsValue({ isActive: true }); return }
    if (!item?.id) return
    let cancelled = false
    setLoadingDetail(true)
    brandApi.getById(item.id).then((d) => {
      if (cancelled) return
      form.setFieldsValue({ name: d.name, slug: d.slug ?? '', description: d.description ?? '', logoUrl: d.logoUrl ?? '', websiteUrl: d.websiteUrl ?? '', isActive: d.isActive })
    }).finally(() => { if (!cancelled) setLoadingDetail(false) })
    return () => { cancelled = true }
  }, [open, mode, item?.id, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body: CreateBrandRequest = { name: v.name.trim(), slug: v.slug?.trim() || null, description: v.description?.trim() || null, logoUrl: v.logoUrl?.trim() || null, websiteUrl: v.websiteUrl?.trim() || null, isActive: v.isActive ?? true }
      if (mode === 'create') await brandApi.create(body)
      else if (item) await brandApi.update(item.id, body)
      onSuccess(); onClose()
    } catch { } finally { setSubmitting(false) }
  }

  return (
    <Modal title={<span className="font-extrabold text-slate-800">{mode === 'create' ? 'Thêm thương hiệu' : 'Cập nhật thương hiệu'}</span>}
      open={open} onCancel={onClose} onOk={handleOk} confirmLoading={submitting}
      width={620} okText="Lưu" cancelText="Hủy" okButtonProps={{ className: primaryBtn }} destroyOnHidden>
      {mode === 'edit' && loadingDetail ? <div className="flex justify-center py-12"><Spin /></div> : (
        <Form form={form} layout="vertical" className="mt-2">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="slug" label="Slug">
                <Input placeholder="viet-tiep" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="logoUrl" label="Logo (URL)">
                <Input className="rounded-sm" placeholder="https://…" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="websiteUrl" label="Website">
                <Input className="rounded-sm" placeholder="https://…" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}
