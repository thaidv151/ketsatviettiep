'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Tag } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import { ShoppingCartOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import OrderSearch, { type OrderSearchState } from './search'
import OrderDetail from './detail'
import type { OrderListDto } from '@/services/order.service'
import { orderApi } from '@/services/order.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

const STATUS_COLORS: Record<number, string> = {
  0: 'gold', 1: 'blue', 2: 'cyan', 3: 'geekblue',
  4: 'green', 5: 'red', 6: 'orange', 7: 'purple', 8: 'default',
}

const PAYMENT_COLORS: Record<number, string> = {
  0: 'default', 1: 'green', 2: 'orange', 3: 'purple', 4: 'red',
}

export default function OrderManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [raw, setRaw] = useState<OrderListDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<OrderSearchState>({ keyword: '', status: '', paymentStatus: '' })
  const [draft, setDraft] = useState<OrderSearchState>({ keyword: '', status: '', paymentStatus: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setRaw(await orderApi.list()) }
    catch { toast({ variant: 'destructive', title: 'Không tải được đơn hàng' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter(r => {
      if (kw && !r.orderCode.toLowerCase().includes(kw) &&
        !r.recipientName.toLowerCase().includes(kw) &&
        !r.recipientPhone.includes(kw)) return false
      if (applied.status !== '' && r.status !== Number(applied.status)) return false
      if (applied.paymentStatus !== '' && r.paymentStatus !== Number(applied.paymentStatus)) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: OrderListDto) => {
    try { await orderApi.remove(row.id); toast({ variant: 'success', title: 'Đã xóa' }); void load() }
    catch { toast({ variant: 'destructive', title: 'Không xóa được' }) }
  }

  const columns: ColumnsType<OrderListDto> = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Mã đơn', dataIndex: 'orderCode', key: 'orderCode', width: 180,
      render: (v: string) => <span className="font-mono font-semibold text-[#1677ff] text-xs">{v}</span>
    },
    {
      title: 'Khách hàng', key: 'customer',
      render: (_, row) => <div><div className="font-semibold text-slate-800">{row.recipientName}</div><div className="text-xs text-slate-400">{row.recipientPhone}</div></div>
    },
    {
      title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', width: 130, align: 'right',
      render: (v: number) => <span className="font-bold text-slate-800">{v.toLocaleString('vi-VN')}₫</span>
    },
    { title: 'SP', dataIndex: 'itemCount', key: 'itemCount', width: 60, align: 'center' },
    {
      title: 'Trạng thái', dataIndex: 'statusLabel', key: 'status', width: 140,
      render: (label: string, row) => <Tag color={STATUS_COLORS[row.status] ?? 'default'} className="text-xs font-semibold">{label}</Tag>
    },
    {
      title: 'Thanh toán', dataIndex: 'paymentStatusLabel', key: 'paymentStatus', width: 150,
      render: (label: string, row) => <Tag color={PAYMENT_COLORS[row.paymentStatus] ?? 'default'} className="text-xs">{label}</Tag>
    },
    {
      title: 'Phương thức', dataIndex: 'paymentMethodLabel', key: 'paymentMethod', width: 130,
      render: (v) => <span className="text-xs text-slate-500">{v}</span>
    },
    { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (s) => new Date(s).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', key: 'actions', width: 100, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />}
            onClick={() => { setSelectedId(row.id); setDetailOpen(true) }} />
          <Popconfirm title="Xóa đơn hàng?" okText="Xóa" cancelText="Hủy" okButtonProps={{ className: 'bg-red-600' }} onConfirm={() => handleDelete(row)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <AdminBreadcrumb
        items={[{ label: 'Quản lý', onClick: () => router.push('/dashboard') }]}
        currentPage="Đơn hàng"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><ShoppingCartOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Đơn hàng</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý đơn hàng — xem chi tiết, cập nhật trạng thái</p>
          </div>
        </div>
      </div>
      <OrderSearch expanded={searchExpanded} onToggle={() => setSearchExpanded(v => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e = { keyword: '', status: '', paymentStatus: '' }; setDraft(e); setApplied(e) }} />
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<OrderListDto> rowKey="id" loading={loading} columns={columns} dataSource={paged} scroll={{ x: 1200 }}
          pagination={{ current: page, pageSize, total: filtered.length, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (t) => `${t} đơn hàng`, onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) } }} />
      </Card>
      <OrderDetail open={detailOpen} orderId={selectedId}
        onClose={() => { setDetailOpen(false); setSelectedId(null) }}
        onStatusChanged={() => void load()} />
    </div>
  )
}
