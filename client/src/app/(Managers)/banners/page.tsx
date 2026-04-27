'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Tag, Avatar } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import { PictureOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import { getFullImagePath } from '@/lib/path-utils'
import BannerSearch, { type BannerSearchState } from './search'
import BannerCreateOrUpdate from './createOrUpdate'
import type { BannerDto } from '@/services/banner.service'
import { bannerApi } from '@/services/banner.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

export default function BannerManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [raw, setRaw] = useState<BannerDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<BannerSearchState>({ keyword: '', isActive: '' })
  const [draft, setDraft] = useState<BannerSearchState>({ keyword: '', isActive: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<BannerDto | null>(null)

  const load = useCallback(async () => {
    try { setLoading(true); setRaw(await bannerApi.list()) }
    catch { toast({ variant: 'destructive', title: 'Không tải được danh sách banner' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter((r) => {
      if (kw && !r.title.toLowerCase().includes(kw)) return false
      if (applied.isActive === 'true' && !r.isActive) return false
      if (applied.isActive === 'false' && r.isActive) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: BannerDto) => {
    try { await bannerApi.remove(row.id); toast({ variant: 'success', title: 'Đã xóa banner' }); void load() }
    catch { toast({ variant: 'destructive', title: 'Không xóa được banner' }) }
  }

  const columns: ColumnsType<BannerDto> = [
    {
      title: 'STT', key: 'stt', width: 60, align: 'center',
      render: (_, __, i) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Ảnh', key: 'imageUrl', width: 100, align: 'center',
      render: (_, row) => (
        row.imageUrl
          ? <Avatar src={getFullImagePath(row.imageUrl)} shape="square" size={56} className="border border-slate-200 rounded object-cover" />
          : <Avatar shape="square" size={56} icon={<PictureOutlined />} className="bg-slate-100 text-slate-400" />
      ),
    },
    {
      title: 'Tiêu đề', key: 'title',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.title}</div>
          {row.description && <div className="text-xs text-slate-400 truncate max-w-xs">{row.description}</div>}
          {row.linkUrl && (
            <a href={row.linkUrl} target="_blank" rel="noreferrer" className="text-[#1677ff] text-xs truncate block max-w-xs">{row.linkUrl}</a>
          )}
        </div>
      ),
    },
    {
      title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 90, align: 'center',
      render: (v: number) => <span className="font-mono text-slate-600">{v}</span>,
    },
    {
      title: 'Thời gian', key: 'dates', width: 190,
      render: (_, row) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          {row.startDate && <div>Từ: {new Date(row.startDate).toLocaleDateString('vi-VN')}</div>}
          {row.endDate && <div>Đến: {new Date(row.endDate).toLocaleDateString('vi-VN')}</div>}
          {!row.startDate && !row.endDate && <span className="text-slate-300">—</span>}
        </div>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 120, align: 'center',
      render: (v: boolean) => v
        ? <Tag color="success" className="font-semibold text-xs rounded-sm">Hiển thị</Tag>
        : <Tag color="default" className="font-semibold text-xs rounded-sm">Đã ẩn</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 155,
      render: (s: string) => new Date(s).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác', key: 'actions', width: 110, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
          <Popconfirm
            title="Xóa banner?" description="Bạn có chắc muốn xóa banner này không?"
            okText="Xóa" cancelText="Hủy" okButtonProps={{ className: 'bg-red-600' }}
            onConfirm={() => handleDelete(row)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <AdminBreadcrumb
        items={[{ label: 'Quản lý', onClick: () => router.push('/dashboard') }]}
        currentPage="Banner"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><PictureOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Banner</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý banner hiển thị trên trang chủ</p>
          </div>
        </div>
        <Button
          type="primary" size="small" icon={<PlusCircleOutlined />} className={primaryBtn}
          onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true) }}
        >
          Thêm banner
        </Button>
      </div>

      {/* Search */}
      <BannerSearch
        expanded={searchExpanded} onToggle={() => setSearchExpanded((v) => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e: BannerSearchState = { keyword: '', isActive: '' }; setDraft(e); setApplied(e) }}
      />

      {/* Table */}
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<BannerDto>
          rowKey="id" loading={loading} columns={columns} dataSource={paged} scroll={{ x: 900 }}
          pagination={{
            current: page, pageSize, total: filtered.length,
            showSizeChanger: true, pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} banner`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) },
          }}
        />
      </Card>

      {/* Modal */}
      <BannerCreateOrUpdate
        open={modalOpen} mode={modalMode} item={selected}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => {
          toast({ variant: 'success', title: modalMode === 'create' ? 'Đã thêm banner mới' : 'Đã cập nhật banner' })
          void load()
        }}
      />
    </div>
  )
}
