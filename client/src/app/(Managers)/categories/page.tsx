'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Card, Popconfirm, message, Space, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  TagOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined,
  HomeOutlined, RightOutlined,
} from '@ant-design/icons'
import CategorySearch, { type CategorySearchState } from './search'
import CategoryCreateOrUpdate from './createOrUpdate'
import type { CategoryDto } from '@/services/category.service'
import { categoryApi } from '@/services/category.service'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

function matchesFilter(row: CategoryDto, q: CategorySearchState): boolean {
  const kw = q.keyword.trim().toLowerCase()
  if (kw) {
    const ok =
      row.name.toLowerCase().includes(kw) ||
      row.slug.toLowerCase().includes(kw)
    if (!ok) return false
  }
  if (q.isActive === 'true' && !row.isActive) return false
  if (q.isActive === 'false' && row.isActive) return false
  return true
}

export default function CategoryManagementPage() {
  const [raw, setRaw] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<CategorySearchState>({ keyword: '', isActive: '' })
  const [draft, setDraft] = useState<CategorySearchState>({ keyword: '', isActive: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<CategoryDto | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = await categoryApi.list()
      setRaw(list)
    } catch {
      message.error('Không tải được danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => raw.filter((r) => matchesFilter(r, applied)), [raw, applied])
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])

  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: CategoryDto) => {
    try {
      await categoryApi.remove(row.id)
      message.success('Đã xóa danh mục')
      void load()
    } catch {
      message.error('Không xóa được')
    }
  }

  const columns: ColumnsType<CategoryDto> = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Tên danh mục', dataIndex: 'name', key: 'name',
      render: (v: string, row) => (
        <div>
          <div className="font-semibold text-slate-800">{v}</div>
          {row.parentName && <div className="text-xs text-slate-400 mt-0.5">↳ {row.parentName}</div>}
        </div>
      )
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', ellipsis: true, render: (v) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{v}</code> },
    { title: 'Cấp con', dataIndex: 'childCount', key: 'childCount', width: 90, align: 'center', render: (v: number) => v > 0 ? <Badge count={v} color="#1677ff" /> : '—' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder', width: 90, align: 'center' },
    {
      title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 110, align: 'center',
      render: (v: boolean) => v
        ? <span className="text-green-600 font-semibold text-xs">Hoạt động</span>
        : <span className="text-red-500 font-semibold text-xs">Ẩn</span>
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (s) => new Date(s).toLocaleString('vi-VN') },
    {
      title: 'Thao tác', key: 'actions', width: 120, align: 'center', fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(row); setModalMode('edit'); setModalOpen(true) }} />
          <Popconfirm title="Xóa danh mục?" description="Thao tác không hoàn tác." okText="Xóa" cancelText="Hủy"
            okButtonProps={{ className: 'bg-red-600' }} onConfirm={() => handleDelete(row)}>
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
        <span className="font-semibold text-[#0958d9]">Danh mục</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm text-2xl"><TagOutlined /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Danh mục</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý danh mục sản phẩm — phân cấp cha-con</p>
          </div>
        </div>
        <Button type="primary" size="small" icon={<PlusCircleOutlined />} className={primaryBtn}
          onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true) }}>
          Thêm danh mục
        </Button>
      </div>

      <CategorySearch expanded={searchExpanded} onToggle={() => setSearchExpanded(v => !v)}
        form={draft} onFormChange={setDraft}
        onSearch={() => setApplied({ ...draft })}
        onReset={() => { const e: CategorySearchState = { keyword: '', isActive: '' }; setDraft(e); setApplied(e) }} />

      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<CategoryDto>
          rowKey="id" loading={loading} columns={columns} dataSource={paged}
          scroll={{ x: 900 }}
          pagination={{
            current: page, pageSize, total: filtered.length,
            showSizeChanger: true, pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} danh mục`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) },
          }}
        />
      </Card>

      <CategoryCreateOrUpdate open={modalOpen} mode={modalMode} item={selected}
        categories={raw}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => { message.success(modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật'); void load() }} />
    </div>
  )
}
