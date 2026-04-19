'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Card, Popconfirm, message, Space, Tag, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  InboxOutlined, EditOutlined, EyeOutlined, DeleteOutlined, PlusCircleOutlined,
  HomeOutlined, RightOutlined,
} from '@ant-design/icons'
import ProductSearch, { type ProductSearchState } from './search'
import ProductCreateOrUpdate from './createOrUpdate'
import ProductDetailDrawer from './detail'
import type { ProductListDto } from '@/services/product.service'
import { productApi } from '@/services/product.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

const STATUS_COLORS: Record<number, string> = { 0: 'default', 1: 'green', 2: 'orange', 3: 'red' }

export default function ProductManagementPage() {
  const [raw, setRaw] = useState<ProductListDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<ProductSearchState>({ keyword: '', status: '' })
  const [draft, setDraft] = useState<ProductSearchState>({ keyword: '', status: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<ProductListDto | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setRaw(await productApi.list()) }
    catch { message.error('Không tải được sản phẩm') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter(r => {
      if (kw && !r.name.toLowerCase().includes(kw) && !r.slug.toLowerCase().includes(kw) &&
        !(r.categoryName ?? '').toLowerCase().includes(kw)) return false
      if (applied.status !== '' && r.status !== Number(applied.status)) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: ProductListDto) => {
    try { await productApi.remove(row.id); message.success('Đã xóa'); void load() }
    catch { message.error('Không xóa được') }
  }

  const columns: ColumnsType<ProductListDto> = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Sản phẩm', key: 'product',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl
            ? <img src={row.thumbnailUrl} alt={row.name} className="h-10 w-10 rounded object-cover border border-slate-200 flex-shrink-0" />
            : <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0"><InboxOutlined style={{ fontSize: 18 }} className="text-slate-400" /></div>}
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate">{row.name}</div>
            <div className="text-xs text-slate-400 truncate">{row.categoryName}{row.brandName ? ` · ${row.brandName}` : ''}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Giá', key: 'price', width: 140, align: 'right',
      render: (_, row) => (
        <div className="text-right">
          <div className="font-bold text-slate-800">{(row.salePrice ?? row.basePrice ?? 0).toLocaleString('vi-VN')}₫</div>
          {row.salePrice && row.basePrice && row.salePrice < row.basePrice &&
            <div className="text-xs text-slate-400 line-through">{row.basePrice.toLocaleString('vi-VN')}₫</div>}
        </div>
      )
    },
    {
      title: 'Tồn kho', dataIndex: 'totalStock', key: 'totalStock', width: 90, align: 'center',
      render: (v: number) => <Badge count={v} showZero color={v > 10 ? '#52c41a' : v > 0 ? '#faad14' : '#ff4d4f'} />
    },
    {
      title: 'Trạng thái', dataIndex: 'statusLabel', key: 'status', width: 140,
      render: (label: string, row) => <Tag color={STATUS_COLORS[row.status] ?? 'default'} className="text-xs font-semibold">{label}</Tag>
    },
    {
      title: 'Nổi bật', dataIndex: 'isFeatured', key: 'isFeatured', width: 80, align: 'center',
      render: (v: boolean) => v ? <Tag color="gold" className="text-xs">★ Nổi bật</Tag> : '—'
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (s) => new Date(s).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', key: 'actions', width: 120, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />}
            onClick={() => { setDetailId(row.id); setDetailOpen(true) }} />
          <Button type="text" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
          <Popconfirm title="Xóa sản phẩm?" okText="Xóa" cancelText="Hủy" okButtonProps={{ className: 'bg-red-600' }} onConfirm={() => handleDelete(row)}>
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
        <span className="font-semibold text-[#0958d9]">Sản phẩm</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><InboxOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Sản phẩm</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý sản phẩm — thông tin, biến thể, tồn kho</p>
          </div>
        </div>
        <Button type="primary" size="small" icon={<PlusCircleOutlined />} className={primaryBtn}
          onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true) }}>
          Thêm sản phẩm
        </Button>
      </div>
      <ProductSearch expanded={searchExpanded} onToggle={() => setSearchExpanded(v => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e: ProductSearchState = { keyword: '', status: '' }; setDraft(e); setApplied(e) }} />
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<ProductListDto> rowKey="id" loading={loading} columns={columns} dataSource={paged} scroll={{ x: 1100 }}
          pagination={{ current: page, pageSize, total: filtered.length, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (t) => `${t} sản phẩm`, onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) } }} />
      </Card>
      <ProductCreateOrUpdate open={modalOpen} mode={modalMode} item={selected}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => { message.success(modalMode === 'create' ? 'Đã thêm sản phẩm' : 'Đã cập nhật'); void load() }} />
      <ProductDetailDrawer open={detailOpen} productId={detailId}
        onClose={() => { setDetailOpen(false); setDetailId(null) }}
        onEdit={(row) => { setDetailOpen(false); setDetailId(null); setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
    </div>
  )
}
