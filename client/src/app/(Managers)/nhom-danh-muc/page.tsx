'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Input, Badge, Tooltip } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import {
  FolderOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined,
  SearchOutlined, DownOutlined, AppstoreOutlined
} from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import { nhomDanhMucApi } from '@/services/danhMuc.service'
import type { NhomDanhMucDto, NhomDanhMucSearch } from '@/types/danhMuc'
import { NhomDanhMucForm } from './components/NhomDanhMucForm'

const primaryBtn = 'bg-[#007f32] hover:bg-[#006b2c] border-[#007f32] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,127,50,0.25)]'

export default function NhomDanhMucPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<NhomDanhMucDto[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchExpanded, setSearchExpanded] = useState(true)

  const [searchParams, setSearchParams] = useState<NhomDanhMucSearch>({
    pageIndex: 1,
    pageSize: 10,
    query: ''
  })

  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item: NhomDanhMucDto | null }>({
    open: false,
    mode: 'create',
    item: null
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await nhomDanhMucApi.getData(searchParams)
      if (res.status) {
        setData(res.data.items)
        setTotal(res.data.totalCount)
      } else {
        toast({ variant: 'destructive', title: res.message || 'Lỗi khi tải dữ liệu' })
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Lỗi kết nối máy chủ' })
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      const res = await nhomDanhMucApi.remove(id)
      if (res.status) {
        toast({ variant: 'success', title: 'Xóa thành công' })
        loadData()
      } else {
        toast({ variant: 'destructive', title: res.message || 'Không thể xóa' })
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Lỗi kết nối' })
    }
  }

  const columns: ColumnsType<NhomDanhMucDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, i) => (searchParams.pageIndex - 1) * searchParams.pageSize + i + 1
    },
    {
      title: 'Mã nhóm',
      dataIndex: 'maNhomDanhMuc',
      key: 'maNhomDanhMuc',
      render: (v) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-bold">{v}</code>
    },
    {
      title: 'Tên nhóm danh mục',
      dataIndex: 'tenNhomDanhMuc',
      key: 'tenNhomDanhMuc',
      render: (v) => <span className="font-semibold text-slate-800">{v}</span>
    },
    {
      title: 'Thứ tự',
      dataIndex: 'thuTuHienThi',
      key: 'thuTuHienThi',
      width: 100,
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Tooltip title="Quản lý dữ liệu">
            <Button
              type="text"
              size="small"
              icon={<AppstoreOutlined className="text-green-600" />}
              onClick={() => router.push(`/danh-muc?group=${row.maNhomDanhMuc}`)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => setModal({ open: true, mode: 'edit', item: row })}
          />
          <Popconfirm
            title="Xóa nhóm danh mục?"
            description="Tất cả danh mục thuộc nhóm này sẽ bị ảnh hưởng."
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(row.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <AdminBreadcrumb
        accent="green"
        items={[{ label: 'Quản lý', onClick: () => router.push('/dashboard') }]}
        currentPage="Nhóm danh mục"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 text-[#007f32] rounded-sm text-2xl">
            <FolderOutlined />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Nhóm danh mục</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý các loại nhóm danh mục dùng chung cho toàn hệ thống</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          className={primaryBtn}
          onClick={() => setModal({ open: true, mode: 'create', item: null })}
        >
          Thêm nhóm mới
        </Button>
      </div>

      {/* Search */}
      <Card className="rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between cursor-pointer p-4 select-none"
          onClick={() => setSearchExpanded(!searchExpanded)}
        >
          <div className="flex items-center gap-2 font-bold text-slate-700 uppercase text-xs tracking-wider">
            <SearchOutlined />
            <span>Tìm kiếm & Lọc dữ liệu</span>
          </div>
          <DownOutlined className={`transition-transform ${searchExpanded ? 'rotate-180' : ''}`} />
        </div>

        <div className={`transition-all duration-300 ${searchExpanded ? 'max-h-[500px] border-t border-slate-100 p-4' : 'max-h-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Từ khóa</label>
              <Input
                placeholder="Nhập mã hoặc tên nhóm..."
                value={searchParams.query}
                onChange={e => setSearchParams(prev => ({ ...prev, query: e.target.value, pageIndex: 1 }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="primary" className="bg-[#007f32]" onClick={loadData}>Tìm kiếm</Button>
              <Button onClick={() => setSearchParams({ pageIndex: 1, pageSize: 10, query: '' })}>Làm mới</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<NhomDanhMucDto>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 800 }}
          pagination={{
            current: searchParams.pageIndex,
            pageSize: searchParams.pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (t) => `Tổng cộng ${t} bản ghi`,
            onChange: (p, ps) => setSearchParams(prev => ({ ...prev, pageIndex: p, pageSize: ps ?? 10 }))
          }}
        />
      </Card>

      {/* Modal Form */}
      <NhomDanhMucForm
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        onSuccess={() => {
          setModal(prev => ({ ...prev, open: false }))
          toast({ variant: 'success', title: modal.mode === 'create' ? 'Đã thêm nhóm mới' : 'Đã cập nhật thay đổi' })
          loadData()
        }}
      />
    </div>
  )
}
