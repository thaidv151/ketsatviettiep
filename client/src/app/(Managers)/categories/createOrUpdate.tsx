'use client'
import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Row, Col, Spin } from 'antd'
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/category.service'
import { categoryApi } from '@/services/category.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  item: CategoryDto | null
  categories: CategoryDto[]
  onClose: () => void
  onSuccess: () => void
}

export default function CategoryCreateOrUpdate({ open, mode, item, categories, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') { form.resetFields(); form.setFieldsValue({ isActive: true, sortOrder: 0 }); return }
    if (!item?.id) return
    let cancelled = false
    setLoadingDetail(true)
    categoryApi.getById(item.id)
      .then((d) => {
        if (cancelled) return
        form.setFieldsValue({ parentId: d.parentId ?? undefined, name: d.name, slug: d.slug, description: d.description ?? '', imageUrl: d.imageUrl ?? '', sortOrder: d.sortOrder, isActive: d.isActive })
      })
      .finally(() => { if (!cancelled) setLoadingDetail(false) })
    return () => { cancelled = true }
  }, [open, mode, item?.id, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body: CreateCategoryRequest | UpdateCategoryRequest = {
        parentId: v.parentId ?? null,
        name: v.name.trim(),
        slug: v.slug.trim(),
        description: v.description?.trim() || null,
        imageUrl: v.imageUrl?.trim() || null,
        sortOrder: v.sortOrder ?? 0,
        isActive: v.isActive ?? true,
      }
      if (mode === 'create') await categoryApi.create(body as CreateCategoryRequest)
      else if (item) await categoryApi.update(item.id, body)
      onSuccess()
      onClose()
    } catch { /* validation */ } finally { setSubmitting(false) }
  }

  // Tạo options danh mục cha — loại trừ chính nó
  const parentOptions = categories
    .filter(c => c.id !== item?.id)
    .map(c => ({ value: c.id, label: c.name + (c.parentName ? ` (↳ ${c.parentName})` : '') }))

  return (
    <Modal title={<span className="font-extrabold text-slate-800">{mode === 'create' ? 'Thêm danh mục' : 'Cập nhật danh mục'}</span>}
      open={open} onCancel={onClose} onOk={handleOk} confirmLoading={submitting}
      width={700} okText="Lưu" cancelText="Hủy" okButtonProps={{ className: primaryBtn }} destroyOnHidden>
      {mode === 'edit' && loadingDetail ? (
        <div className="flex justify-center py-12"><Spin /></div>
      ) : (
        <Form form={form} layout="vertical" className="mt-2">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin danh mục</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input placeholder="Khóa cửa, Két sắt…" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true, message: 'Nhập slug' }, { pattern: /^[a-z0-9-]+$/, message: 'Chỉ chứa chữ thường, số và dấu -' }]}>
                <Input placeholder="khoa-cua-van-tay" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="parentId" label="Danh mục cha">
                <Select allowClear placeholder="Là danh mục gốc" options={parentOptions} showSearch
                  filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
                <Input type="number" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="imageUrl" label="Ảnh thumbnail (URL)">
                <Input className="rounded-sm" placeholder="https://…" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} className="rounded-sm" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}
