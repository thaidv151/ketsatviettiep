'use client'
import { useEffect, useState } from 'react'
import { Modal, Form, Input, Switch, Row, Col, Spin, InputNumber } from 'antd'
import ImageUpload from '@/components/common/ImageUpload'
import type { BannerDto, CreateBannerRequest } from '@/services/banner.service'
import { bannerApi } from '@/services/banner.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  item: BannerDto | null
  onClose: () => void
  onSuccess: () => void
}

export default function BannerCreateOrUpdate({ open, mode, item, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ isActive: true, sortOrder: 0 })
      return
    }
    if (!item?.id) return
    let cancelled = false
    setLoadingDetail(true)
    bannerApi.getById(item.id).then((d) => {
      if (cancelled) return
      form.setFieldsValue({
        title:       d.title,
        imageUrl:    d.imageUrl,
        linkUrl:     d.linkUrl ?? '',
        description: d.description ?? '',
        sortOrder:   d.sortOrder,
        isActive:    d.isActive,
        startDate:   d.startDate ?? '',
        endDate:     d.endDate ?? '',
      })
    }).finally(() => { if (!cancelled) setLoadingDetail(false) })
    return () => { cancelled = true }
  }, [open, mode, item?.id, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body: CreateBannerRequest = {
        title:       v.title.trim(),
        imageUrl:    v.imageUrl,
        linkUrl:     v.linkUrl?.trim() || null,
        description: v.description?.trim() || null,
        sortOrder:   v.sortOrder ?? 0,
        isActive:    v.isActive ?? true,
        startDate:   v.startDate || null,
        endDate:     v.endDate || null,
      }
      if (mode === 'create') await bannerApi.create(body)
      else if (item) await bannerApi.update(item.id, body)
      onSuccess()
      onClose()
    } catch { } finally { setSubmitting(false) }
  }

  return (
    <Modal
      title={<span className="font-extrabold text-slate-800">{mode === 'create' ? 'Thêm banner' : 'Cập nhật banner'}</span>}
      open={open} onCancel={onClose} onOk={handleOk} confirmLoading={submitting}
      width={680} okText="Lưu" cancelText="Hủy" okButtonProps={{ className: primaryBtn }} destroyOnHidden
    >
      {mode === 'edit' && loadingDetail ? (
        <div className="flex justify-center py-12"><Spin /></div>
      ) : (
        <Form form={form} layout="vertical" className="mt-2">
          <Row gutter={16}>
            {/* Tiêu đề */}
            <Col xs={24}>
              <Form.Item name="title" label="Tiêu đề banner" rules={[{ required: true, message: 'Nhập tiêu đề banner' }]}>
                <Input className="rounded-sm" placeholder="Khuyến mãi mùa hè 2025" />
              </Form.Item>
            </Col>

            {/* Ảnh banner */}
            <Col xs={24}>
              <Form.Item
                name="imageUrl"
                label="Ảnh banner"
                rules={[{ required: true, message: 'Vui lòng tải ảnh banner lên' }]}
              >
                <ImageUpload placeholder="Tải ảnh banner lên" maxSize={5} />
              </Form.Item>
            </Col>

            {/* Link URL */}
            <Col xs={24}>
              <Form.Item name="linkUrl" label="Đường dẫn khi click (URL)">
                <Input className="rounded-sm" placeholder="https://ketsatviettiep.com/san-pham" />
              </Form.Item>
            </Col>

            {/* Mô tả */}
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả ngắn">
                <Input.TextArea rows={3} className="rounded-sm" placeholder="Nội dung phụ hoặc chú thích banner" />
              </Form.Item>
            </Col>

            {/* Thứ tự & trạng thái */}
            <Col xs={24} md={8}>
              <Form.Item name="sortOrder" label="Thứ tự hiển thị">
                <InputNumber className="w-full rounded-sm" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>

            {/* Khoảng thời gian */}
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <Input type="datetime-local" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <Input type="datetime-local" className="rounded-sm" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}
