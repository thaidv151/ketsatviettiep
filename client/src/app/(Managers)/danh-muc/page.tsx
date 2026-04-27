'use client'
import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Space, Input, Select, Tag } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import {
  AppstoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined,
  SearchOutlined, DownOutlined
} from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import { danhMucApi, nhomDanhMucApi } from '@/services/danhMuc.service'
import type { DanhMucDto, DanhMucSearch, NhomDanhMucDto } from '@/types/danhMuc'
import { DanhMucForm } from './components/DanhMucForm'

const primaryBtn = 'bg-[#007f32] hover:bg-[#006b2c] border-[#007f32] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,127,50,0.25)]'

function DanhMucPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParamsUrl = useSearchParams()
  const groupParam = searchParamsUrl.get('group')

  const [data, setData] = useState<DanhMucDto[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchExpanded, setSearchExpanded] = useState(true)
  const [nhomDanhMucs, setNhomDanhMucs] = useState<NhomDanhMucDto[]>([])
  
  const [searchParams, setSearchParams] = useState<DanhMucSearch>({
    pageIndex: 1,
    pageSize: 10,
    query: '',
    maNhomDanhMuc: groupParam || undefined
  })

  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; item: DanhMucDto | null }>({
    open: false,
    mode: 'create',
    item: null
  })

  // Đồng bộ URL param nếu nó thay đổi (ví dụ khi user quay lại trang bằng nút back)
  useEffect(() => {
    if (groupParam) {
      setSearchParams(prev => ({ ...prev, maNhomDanhMuc: groupParam, pageIndex: 1 }))
    }
  }, [groupParam])

  const loadGroups = useCallback(async () => {
    const res = await nhomDanhMucApi.getData({ pageIndex: 1, pageSize: 1000 })
    if (res.status) {
      setNhomDanhMucs(res.data.items)
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await danhMucApi.getData(searchParams)
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
    loadGroups()
  }, [loadGroups])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      const res = await danhMucApi.remove(id)
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

  const columns: ColumnsType<DanhMucDto> = [
    { 
      title: 'STT', 
      key: 'stt', 
      width: 60, 
      align: 'center', 
      render: (_, __, i) => (searchParams.pageIndex - 1) * searchParams.pageSize + i + 1 
    },
    { 
      title: 'Mã', 
      dataIndex: 'maDanhMuc', 
      key: 'maDanhMuc',
      width: 120,
      render: (v) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-green-700 font-bold">{v}</code>
    },
    { 
      title: 'Tên danh mục', 
      dataIndex: 'tenDanhMuc', 
      key: 'tenDanhMuc',
      render: (v, row) => (
        <div>
          <div className="font-semibold text-slate-800">{v}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Nhóm: {row.maNhomDanhMuc}</div>
        </div>
      )
    },
    { 
      title: 'Thứ tự', 
      dataIndex: 'thuTuHienThi', 
      key: 'thuTuHienThi', 
      width: 80, 
      align: 'center' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      width: 100, 
      align: 'center',
      render: (v) => v 
        ? <Tag color="success">Hiển thị</Tag> 
        : <Tag color="default">Ẩn</Tag>
    },
    {
      title: 'Thao tác', 
      key: 'actions', 
      width: 120, 
      align: 'center', 
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => setModal({ open: true, mode: 'edit', item: row })} 
          />
          <Popconfirm 
            title="Xóa danh mục?" 
            description="Thao tác này không thể hoàn tác." 
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
        currentPage="Dữ liệu danh mục"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 text-[#007f32] rounded-sm text-2xl">
            <AppstoreOutlined />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">Dữ liệu danh mục</h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">Quản lý chi tiết dữ liệu cho các nhóm danh mục</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<PlusCircleOutlined />} 
          className={primaryBtn}
          onClick={() => setModal({ open: true, mode: 'create', item: null })}
        >
          Thêm dữ liệu
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Nhóm danh mục</label>
              <Select 
                className="w-full"
                placeholder="Tất cả nhóm"
                allowClear
                value={searchParams.maNhomDanhMuc}
                onChange={v => setSearchParams(prev => ({ ...prev, maNhomDanhMuc: v, pageIndex: 1 }))}
              >
                {nhomDanhMucs.map(g => (
                  <Select.Option key={g.maNhomDanhMuc} value={g.maNhomDanhMuc}>{g.tenNhomDanhMuc}</Select.Option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Từ khóa</label>
              <Input 
                placeholder="Nhập mã hoặc tên danh mục..." 
                value={searchParams.query}
                onChange={e => setSearchParams(prev => ({ ...prev, query: e.target.value, pageIndex: 1 }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="primary" className="bg-[#007f32]" onClick={loadData}>Tìm kiếm</Button>
              <Button onClick={() => setSearchParams({ pageIndex: 1, pageSize: 10, query: '', maNhomDanhMuc: undefined })}>Làm mới</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-sm border border-slate-200 shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table<DanhMucDto>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1000 }}
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
      <DanhMucForm 
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        defaultGroup={searchParams.maNhomDanhMuc}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        onSuccess={() => {
          setModal(prev => ({ ...prev, open: false }))
          toast({ variant: 'success', title: modal.mode === 'create' ? 'Đã thêm thành công' : 'Đã cập nhật thay đổi' })
          loadData()
        }}
      />
    </div>
  )
}

export default function DanhMucPage() {
  return (
    <Suspense fallback={<Card loading />}>
      <DanhMucPageContent />
    </Suspense>
  )
}
