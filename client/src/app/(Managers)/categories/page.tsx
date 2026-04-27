'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Badge } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import { TagOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import CategorySearch, { type CategorySearchState } from './search'
import CategoryCreateOrUpdate from './createOrUpdate'
import type { CategoryDto } from '@/services/category.service'
import { categoryApi } from '@/services/category.service'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

export default function CategoryManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  /** Dữ liệu bảng (một trang) từ server */
  const [rows, setRows] = useState<CategoryDto[]>([])
  const [total, setTotal] = useState(0)
  /** Toàn bộ cho dropdown chọn danh mục cha trong modal */
  const [allForSelect, setAllForSelect] = useState<CategoryDto[]>([])
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
      const isActiveParam =
        applied.isActive === 'true' ? true : applied.isActive === 'false' ? false : undefined
      const { items, totalCount } = await categoryApi.pagedList({
        pageIndex: page,
        pageSize,
        query: applied.keyword.trim() || undefined,
        isActive: isActiveParam,
      })
      setRows(Array.isArray(items) ? items : [])
      setTotal(typeof totalCount === 'number' ? totalCount : 0)
    } catch {
      toast({ variant: 'destructive', title: 'Không tải được danh sách danh mục' })
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, applied])

  useEffect(() => { void load() }, [load])

  const loadForSelect = useCallback(async () => {
    try {
      const list = await categoryApi.listForAdminForm()
      setAllForSelect(Array.isArray(list) ? list : [])
    } catch {
      setAllForSelect([])
    }
  }, [])

  useEffect(() => { void loadForSelect() }, [loadForSelect])

  useEffect(() => { setPage(1) }, [applied, pageSize])

  const handleDelete = async (row: CategoryDto) => {
    try {
      await categoryApi.remove(row.id)
      toast({ variant: 'success', title: 'Đã xóa danh mục' })
      void load()
    } catch {
      toast({ variant: 'destructive', title: 'Không xóa được' })
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
      <AdminBreadcrumb
        items={[{ label: 'Quản lý', onClick: () => router.push('/dashboard') }]}
        currentPage="Danh mục"
      />

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
          rowKey="id" loading={loading} columns={columns} dataSource={rows}
          scroll={{ x: 900 }}
          pagination={{
            current: page, pageSize, total,
            showSizeChanger: true, pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} danh mục`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps ?? 10) },
          }}
        />
      </Card>

      <CategoryCreateOrUpdate open={modalOpen} mode={modalMode} item={selected}
        categories={allForSelect}
        onClose={() => { setModalOpen(false); setSelected(null) }}
        onSuccess={() => { toast({ variant: 'success', title: modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật' }); void load() }} />
    </div>
  )
}
