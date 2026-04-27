'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Avatar } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import { ShoppingOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import BrandSearch, { type BrandSearchState } from './search'
import BrandCreateOrUpdate from './createOrUpdate'
import type { BrandDto } from '@/services/brand.service'
import { brandApi } from '@/services/brand.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

export default function BrandManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [raw, setRaw] = useState<BrandDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<BrandSearchState>({ keyword: '', isActive: '' })
  const [draft, setDraft] = useState<BrandSearchState>({ keyword: '', isActive: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<BrandDto | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setRaw(await brandApi.list()) }
    catch { toast({ variant: 'destructive', title: 'Không tải được thương hiệu' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter(r => {
      if (kw && !r.name.toLowerCase().includes(kw) && !(r.slug ?? '').toLowerCase().includes(kw)) return false
      if (applied.isActive === 'true' && !r.isActive) return false
      if (applied.isActive === 'false' && r.isActive) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: BrandDto) => {
    try { await brandApi.remove(row.id); toast({ variant: 'success', title: 'Đã xóa' }); void load() }
    catch { toast({ variant: 'destructive', title: 'Không xóa được' }) }
  }

  const columns: ColumnsType<BrandDto> = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Thương hiệu', key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl
            ? <Avatar src={row.logoUrl} size={36} className="border border-slate-200 rounded" />
            : <Avatar size={36} className="bg-blue-50 text-[#1677ff] font-bold">{row.name[0]}</Avatar>}
          <div>
            <div className="font-semibold text-slate-800">{row.name}</div>
            {row.slug && <code className="text-xs text-slate-400">{row.slug}</code>}
          </div>
        </div>
      )
    },
    { title: 'Website', dataIndex: 'websiteUrl', key: 'websiteUrl', ellipsis: true, render: (v) => v ? <a href={v} target="_blank" rel="noreferrer" className="text-[#1677ff] text-xs">{v}</a> : '—' },
    {
      title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 110, align: 'center',
      render: (v: boolean) => v ? <span className="text-green-600 font-semibold text-xs">Hoạt động</span> : <span className="text-red-500 font-semibold text-xs">Ẩn</span>
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (s) => new Date(s).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', key: 'actions', width: 110, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
          <Popconfirm title="Xóa thương hiệu?" okText="Xóa" cancelText="Hủy" okButtonProps={{ className: 'bg-red-600' }} onConfirm={() => handleDelete(row)}>
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
        currentPage="Thương hiệu"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><ShoppingOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Thương hiệu</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý thương hiệu / nhà sản xuất sản phẩm</p>
          </div>
        </div>
        <Button type="primary" size="small" icon={<PlusCircleOutlined />} className={primaryBtn}
          onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true) }}>
          Thêm thương hiệu
        </Button>
      </div>
      <BrandSearch expanded={searchExpanded} onToggle={() => setSearchExpanded(v => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e: BrandSearchState = { keyword: '', isActive: '' }; setDraft(e); setApplied(e) }} />
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<BrandDto> rowKey="id" loading={loading} columns={columns} dataSource={paged} scroll={{ x: 800 }}
          pagination={{ current: page, pageSize, total: filtered.length, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: (t) => `${t} thương hiệu`, onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) } }} />
      </Card>
      <BrandCreateOrUpdate open={modalOpen} mode={modalMode} item={selected}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => { toast({ variant: 'success', title: modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật' }); void load() }} />
    </div>
  )
}
