'use client'
import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, InputNumber, DatePicker, Row, Col, Spin } from 'antd'
import dayjs from 'dayjs'
import type { CouponDto, CreateCouponRequest } from '@/services/coupon.service'
import { couponApi } from '@/services/coupon.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type Props = { open: boolean; mode: 'create' | 'edit'; item: CouponDto | null; onClose: () => void; onSuccess: () => void }

export default function CouponCreateOrUpdate({ open, mode, item, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [discountType, setDiscountType] = useState(0)

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      form.resetFields(); setDiscountType(0)
      form.setFieldsValue({ discountType: 0, isActive: true })
      return
    }
    if (!item) return
    setDiscountType(item.discountType)
    form.setFieldsValue({
      code: item.code, description: item.description ?? '', discountType: item.discountType,
      discountValue: item.discountValue, minOrderAmount: item.minOrderAmount, maxDiscountAmount: item.maxDiscountAmount,
      usageLimit: item.usageLimit, perUserLimit: item.perUserLimit, isActive: item.isActive,
      startAt: item.startAt ? dayjs(item.startAt) : null,
      expiredAt: item.expiredAt ? dayjs(item.expiredAt) : null,
    })
  }, [open, mode, item, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const body: CreateCouponRequest = {
        code: v.code.trim().toUpperCase(), description: v.description?.trim() || null,
        discountType: v.discountType, discountValue: v.discountValue,
        minOrderAmount: v.minOrderAmount ?? null, maxDiscountAmount: v.maxDiscountAmount ?? null,
        usageLimit: v.usageLimit ?? null, perUserLimit: v.perUserLimit ?? null, isActive: v.isActive ?? true,
        startAt: v.startAt ? v.startAt.toISOString() : null,
        expiredAt: v.expiredAt ? v.expiredAt.toISOString() : null,
      }
      if (mode === 'create') await couponApi.create(body)
      else if (item) await couponApi.update(item.id, body)
      onSuccess(); onClose()
    } catch { } finally { setSubmitting(false) }
  }

  return (
    <Modal title={<span className="font-extrabold text-slate-800">{mode === 'create' ? 'Tạo mã giảm giá' : 'Cập nhật mã giảm giá'}</span>}
      open={open} onCancel={onClose} onOk={handleOk} confirmLoading={submitting}
      width={700} okText="Lưu" cancelText="Hủy" okButtonProps={{ className: primaryBtn }} destroyOnHidden>
      <Form form={form} layout="vertical" className="mt-2">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="code" label="Mã coupon" rules={[{ required: true, message: 'Nhập mã' }, { pattern: /^[A-Z0-9_-]{3,50}$/, message: '3-50 ký tự: chữ hoa, số, _ hoặc -' }]}>
              <Input className="rounded-sm font-mono uppercase" placeholder="SAVE20" onChange={e => form.setFieldValue('code', e.target.value.toUpperCase())} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]}>
              <Select options={[{ value: 0, label: 'Giảm theo %' }, { value: 1, label: 'Giảm số tiền cố định' }, { value: 2, label: 'Miễn phí vận chuyển' }]}
                onChange={v => setDiscountType(v)} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="discountValue" label={discountType === 0 ? 'Phần trăm giảm (%)' : 'Số tiền giảm (₫)'}
              rules={[{ required: true, message: 'Nhập giá trị' }]}>
              <InputNumber className="w-full rounded-sm" min={0} max={discountType === 0 ? 100 : undefined}
                formatter={v => discountType === 0 ? `${v}%` : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="minOrderAmount" label="Giá trị đơn hàng tối thiểu (₫)">
              <InputNumber className="w-full rounded-sm" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          {discountType === 0 && (
            <Col xs={24} md={12}>
              <Form.Item name="maxDiscountAmount" label="Giảm tối đa (₫)">
                <InputNumber className="w-full rounded-sm" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={12}>
            <Form.Item name="usageLimit" label="Tổng số lần dùng (để trống = không giới hạn)">
              <InputNumber className="w-full rounded-sm" min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="perUserLimit" label="Số lần dùng/người">
              <InputNumber className="w-full rounded-sm" min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="startAt" label="Ngày bắt đầu">
              <DatePicker className="w-full rounded-sm" showTime format="DD/MM/YYYY HH:mm" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="expiredAt" label="Ngày hết hạn">
              <DatePicker className="w-full rounded-sm" showTime format="DD/MM/YYYY HH:mm" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={2} className="rounded-sm" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
