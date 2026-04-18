'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Card, Popconfirm, message, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  TagOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined,
  HomeOutlined, RightOutlined,
} from '@ant-design/icons'
import CouponSearch, { type CouponSearchState } from './search'
import CouponCreateOrUpdate from './createOrUpdate'
import type { CouponDto } from '@/services/couponApi'
import { couponApi } from '@/services/couponApi'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

export default function CouponManagementPage() {
  const [raw, setRaw] = useState<CouponDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<CouponSearchState>({ keyword: '', isActive: '', discountType: '' })
  const [draft, setDraft] = useState<CouponSearchState>({ keyword: '', isActive: '', discountType: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<CouponDto | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setRaw(await couponApi.list()) }
    catch { message.error('Không tải được mã giảm giá') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter(r => {
      if (kw && !r.code.toLowerCase().includes(kw) && !(r.description ?? '').toLowerCase().includes(kw)) return false
      if (applied.isActive === 'true' && !r.isActive) return false
      if (applied.isActive === 'false' && r.isActive) return false
      if (applied.discountType !== '' && r.discountType !== Number(applied.discountType)) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: CouponDto) => {
    try { await couponApi.remove(row.id); message.success('Đã xóa'); void load() }
    catch { message.error('Không xóa được') }
  }

  const isExpired = (r: CouponDto) => r.expiredAt ? new Date(r.expiredAt) < new Date() : false

  const columns: ColumnsType<CouponDto> = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Mã coupon', dataIndex: 'code', key: 'code', width: 160,
      render: (v: string) => <code className="font-mono font-bold text-[#1677ff] bg-blue-50 px-2 py-0.5 rounded text-sm">{v}</code>
    },
    { title: 'Loại giảm', dataIndex: 'discountTypeLabel', key: 'discountType', width: 130, render: (v) => <Tag color="blue" className="text-xs">{v}</Tag> },
    {
      title: 'Giá trị', key: 'value', width: 120, align: 'right',
      render: (_, row) => <span className="font-bold text-slate-800">{row.discountType === 0 ? `${row.discountValue}%` : row.discountType === 1 ? row.discountValue.toLocaleString('vi-VN') + '₫' : 'Free ship'}</span>
    },
    { title: 'Đã dùng', key: 'usage', width: 110, align: 'center', render: (_, row) => <span className="text-xs">{row.usedCount}{row.usageLimit ? `/${row.usageLimit}` : ''}</span> },
    {
      title: 'Hết hạn', dataIndex: 'expiredAt', key: 'expiredAt', width: 160,
      render: (v: string | null, row) => v ? <span className={isExpired(row) ? 'text-red-500 font-semibold text-xs' : 'text-xs'}>{new Date(v).toLocaleDateString('vi-VN')}{isExpired(row) ? ' (Hết hạn)' : ''}</span> : <span className="text-slate-400 text-xs">Không giới hạn</span>
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 110, align: 'center',
      render: (v: boolean, row) => {
        if (isExpired(row)) return <Tag color="red" className="text-xs">Hết hạn</Tag>
        return v ? <Tag color="green" className="text-xs font-semibold">Hoạt động</Tag> : <Tag color="default" className="text-xs">Tắt</Tag>
      }
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (s) => new Date(s).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', key: 'actions', width: 110, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
          <Popconfirm title="Xóa mã giảm giá?" okText="Xóa" cancelText="Hủy" okButtonProps={{ className: 'bg-red-600' }} onConfirm={() => handleDelete(row)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
        <HomeOutlined className="hover:text-[#1677ff] cursor-pointer" />
        <RightOutlined />
        <span className="hover:text-[#1677ff] cursor-pointer">Quản lý</span>
        <RightOutlined />
        <span className="font-semibold text-[#0958d9]">Mã giảm giá</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><TagOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Mã giảm giá</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý coupon — theo %, số tiền hoặc miễn phí vận chuyển</p>
          </div>
        </div>
        <Button type="primary" size="small" icon={<PlusCircleOutlined />} className={primaryBtn}
          onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true) }}>
          Tạo mã giảm giá
        </Button>
      </div>
      <CouponSearch expanded={searchExpanded} onToggle={() => setSearchExpanded(v => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e: CouponSearchState = { keyword: '', isActive: '', discountType: '' }; setDraft(e); setApplied(e) }} />
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<CouponDto> rowKey="id" loading={loading} columns={columns} dataSource={paged} scroll={{ x: 1000 }}
          pagination={{ current: page, pageSize, total: filtered.length, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (t) => `${t} mã giảm giá`, onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) } }} />
      </Card>
      <CouponCreateOrUpdate open={modalOpen} mode={modalMode} item={selected}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => { message.success(modalMode === 'create' ? 'Đã tạo mã' : 'Đã cập nhật'); void load() }} />
    </div>
  )
}
