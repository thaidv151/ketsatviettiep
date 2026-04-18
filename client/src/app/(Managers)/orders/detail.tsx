'use client'
import { useEffect, useState } from 'react'
import { Drawer, Descriptions, Tag, Button, Table, Spin, Select, Input, Divider, Timeline, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, InboxOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { OrderDetailDto, OrderItemDto, UpdateOrderStatusRequest } from '@/services/orderApi'
import { orderApi } from '@/services/orderApi'

const STATUS_COLORS: Record<number, string> = {
  0: 'gold', 1: 'blue', 2: 'cyan', 3: 'geekblue', 4: 'green', 5: 'red', 6: 'orange', 7: 'purple', 8: 'default',
}

const STATUS_OPTIONS = [
  { value: 0, label: 'Chờ xác nhận' }, { value: 1, label: 'Đã xác nhận' },
  { value: 2, label: 'Đang xử lý' }, { value: 3, label: 'Đang giao' },
  { value: 4, label: 'Đã giao' }, { value: 5, label: 'Đã hủy' },
  { value: 6, label: 'Yêu cầu hoàn' }, { value: 7, label: 'Đã hoàn hàng' }, { value: 8, label: 'Đã hoàn tiền' },
]

type Props = { open: boolean; orderId: string | null; onClose: () => void; onStatusChanged: () => void }

export default function OrderDetail({ open, orderId, onClose, onStatusChanged }: Props) {
  const [data, setData] = useState<OrderDetailDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [newStatus, setNewStatus] = useState<number | undefined>()
  const [statusNote, setStatusNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!open || !orderId) return
    let cancelled = false
    setLoading(true)
    orderApi.getDetail(orderId).then(d => { if (!cancelled) setData(d) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, orderId])

  const handleUpdateStatus = async () => {
    if (!orderId || newStatus === undefined) return
    try {
      setUpdating(true)
      const req: UpdateOrderStatusRequest = { newStatus, note: statusNote || null }
      const updated = await orderApi.updateStatus(orderId, req)
      setData(updated)
      setNewStatus(undefined)
      setStatusNote('')
      onStatusChanged()
      message.success('Đã cập nhật trạng thái')
    } catch { message.error('Không cập nhật được') } finally { setUpdating(false) }
  }

  const itemColumns: ColumnsType<OrderItemDto> = [
    { title: 'Sản phẩm', key: 'name', render: (_, r) => <div><div className="font-semibold text-sm">{r.productName}</div>{r.variantName && <div className="text-xs text-slate-400">{r.variantName}</div>}{r.sku && <code className="text-xs text-slate-400">{r.sku}</code>}</div> },
    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 110, align: 'right', render: (v: number) => v.toLocaleString('vi-VN') + '₫' },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' },
    { title: 'Thành tiền', dataIndex: 'subTotal', key: 'subTotal', width: 120, align: 'right', render: (v: number) => <span className="font-bold">{v.toLocaleString('vi-VN')}₫</span> },
  ]

  return (
    <Drawer title={<span className="font-extrabold text-slate-800">Chi tiết đơn hàng</span>}
      open={open} onClose={onClose} width={720} bodyStyle={{ padding: '16px 24px' }}>
      {loading ? (
        <div className="flex justify-center py-16"><Spin size="large" /></div>
      ) : data ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-lg text-[#1677ff]">{data.orderCode}</span>
              <div className="text-xs text-slate-400 mt-0.5">{new Date(data.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            <Tag color={STATUS_COLORS[data.status] ?? 'default'} className="text-sm font-bold px-3 py-1">{data.statusLabel}</Tag>
          </div>

          {/* Thông tin giao hàng */}
          <Descriptions title={<span className="text-xs font-black uppercase tracking-wider text-slate-500">Thông tin giao hàng</span>}
            column={2} bordered size="small" labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Người nhận" span={2}>{data.recipientName}</Descriptions.Item>
            <Descriptions.Item label="Điện thoại">{data.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>{[data.addressDetail, data.ward, data.district, data.province].filter(Boolean).join(', ')}</Descriptions.Item>
            {data.shippingProvider && <Descriptions.Item label="Vận chuyển">{data.shippingProvider}</Descriptions.Item>}
            {data.trackingNumber && <Descriptions.Item label="Mã vận đơn"><code className="text-xs">{data.trackingNumber}</code></Descriptions.Item>}
          </Descriptions>

          {/* Sản phẩm */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <InboxOutlined className="text-[#1677ff]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Sản phẩm ({data.items.length})</span>
            </div>
            <Table<OrderItemDto> rowKey="id" dataSource={data.items} columns={itemColumns} pagination={false} size="small" className="rounded-sm" />
          </div>

          {/* Tổng tiền */}
          <div className="bg-slate-50 rounded-sm p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Tiền hàng</span><span>{data.subTotal.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Phí vận chuyển</span><span>{data.shippingFee.toLocaleString('vi-VN')}₫</span></div>
            {data.discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Giảm giá {data.couponCode && <code className="text-xs ml-1">{data.couponCode}</code>}</span><span className="text-green-600">-{data.discountAmount.toLocaleString('vi-VN')}₫</span></div>}
            <Divider className="my-2" />
            <div className="flex justify-between font-bold text-base"><span>Tổng thanh toán</span><span className="text-[#1677ff]">{data.totalAmount.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>Phương thức: {data.paymentMethodLabel}</span>
              <Tag color={{ 0: 'default', 1: 'green', 2: 'orange', 3: 'purple', 4: 'red' }[data.paymentStatus] ?? 'default'} className="text-xs">{data.paymentStatusLabel}</Tag>
            </div>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="bg-blue-50/50 rounded-sm p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <EditOutlined className="text-[#1677ff]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Cập nhật trạng thái</span>
            </div>
            <div className="flex gap-3">
              <Select className="flex-1" placeholder="Chọn trạng thái mới" value={newStatus}
                options={STATUS_OPTIONS} onChange={setNewStatus} />
              <Button type="primary" className="bg-[#1677ff] hover:bg-[#0958d9]" loading={updating}
                disabled={newStatus === undefined} onClick={handleUpdateStatus}>Cập nhật</Button>
            </div>
            <Input.TextArea className="mt-3 rounded-sm" rows={2} placeholder="Ghi chú thay đổi trạng thái (tùy chọn)…"
              value={statusNote} onChange={e => setStatusNote(e.target.value)} />
          </div>

          {/* Lịch sử trạng thái */}
          {data.statusHistories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClockCircleOutlined className="text-[#1677ff]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Lịch sử trạng thái</span>
              </div>
              <Timeline items={data.statusHistories.map(h => ({
                color: STATUS_COLORS[h.toStatus] ?? 'gray',
                children: <div>
                  <Tag color={STATUS_COLORS[h.toStatus] ?? 'default'} className="text-xs font-semibold">{h.toStatusLabel}</Tag>
                  <span className="text-xs text-slate-400 ml-2">{new Date(h.createdAt).toLocaleString('vi-VN')}</span>
                  {h.note && <div className="text-xs text-slate-500 mt-1 italic">{h.note}</div>}
                </div>
              }))} />
            </div>
          )}

          {/* Ghi chú */}
          {(data.customerNote || data.internalNote) && (
            <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600 }}>
              {data.customerNote && <Descriptions.Item label="Ghi chú KH">{data.customerNote}</Descriptions.Item>}
              {data.internalNote && <Descriptions.Item label="Ghi chú nội bộ">{data.internalNote}</Descriptions.Item>}
            </Descriptions>
          )}
        </div>
      ) : null}
    </Drawer>
  )
}
