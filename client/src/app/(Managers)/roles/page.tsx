'use client'

import { PlusCircleOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home, ChevronRight, Shield, Pencil, Trash2 } from 'lucide-react'
import { Table, Button, Card, Popconfirm, message, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RoleDto } from '@/services/rbacAdmin.service'
import { rbacAdminApi } from '@/services/rbacAdmin.service'
import RoleSearchPanel, { type RoleSearchState } from './search'
import RoleCreateOrUpdate, { type RoleModalMode } from './createOrUpdate'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

function matchesFilter(row: RoleDto, q: RoleSearchState): boolean {
  const kw = q.keyword.trim().toLowerCase()
  if (kw) {
    const ok =
      row.name.toLowerCase().includes(kw) ||
      row.code.toLowerCase().includes(kw) ||
      (row.type?.toLowerCase().includes(kw) ?? false)
    if (!ok) return false
  }
  if (q.status === 'true' && row.isActive !== true) return false
  if (q.status === 'false' && row.isActive !== false) return false
  return true
}

export default function RoleManagementPage() {
  const [raw, setRaw] = useState<RoleDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<RoleSearchState>({
    keyword: '',
    status: '',
  })
  const [draft, setDraft] = useState<RoleSearchState>({
    keyword: '',
    status: '',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<RoleModalMode>('create')
  const [selected, setSelected] = useState<RoleDto | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = await rbacAdminApi.roles.list()
      setRaw(list)
    } catch {
      message.error('Không tải được danh sách role')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => raw.filter((r) => matchesFilter(r, applied)),
    [raw, applied],
  )

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [applied, pageSize])

  const handleSearch = () => {
    setApplied({ ...draft })
  }

  const handleReset = () => {
    const empty: RoleSearchState = { keyword: '', status: '' }
    setDraft(empty)
    setApplied(empty)
  }

  const openCreate = () => {
    setSelected(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = (row: RoleDto) => {
    setSelected(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (row: RoleDto) => {
    try {
      await rbacAdminApi.roles.remove(row.id)
      message.success('Đã xóa')
      void load()
    } catch {
      message.error('Không xóa được')
    }
  }

  const columns: ColumnsType<RoleDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 64,
      align: 'center',
      render: (_, __, i) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Tên role',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 180,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (v) => v ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <span className="text-blue-600 font-semibold text-xs">Hoạt động</span>
        ) : (
          <span className="text-red-600 font-semibold text-xs">Ngưng</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => openEdit(row)}
          />
          <Popconfirm
            title="Xóa role?"
            description="Thao tác không hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ className: 'bg-red-600' }}
            onConfirm={() => handleDelete(row)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 className="h-4 w-4" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
        <Home size={14} className="hover:text-[#1677ff] cursor-pointer" />
        <ChevronRight size={14} />
        <span className="hover:text-[#1677ff] cursor-pointer">Quản lý</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#0958d9]">Role</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">
              Role
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">
              Quản lý vai trò và trạng thái kích hoạt
            </p>
          </div>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusCircleOutlined />}
          className={primaryBtn}
          onClick={openCreate}
        >
          Thêm role
        </Button>
      </div>

      <RoleSearchPanel
        expanded={searchExpanded}
        onToggle={() => setSearchExpanded((v) => !v)}
        form={draft}
        onFormChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <Card
        className="rounded-sm border border-slate-200 shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Table<RoleDto>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={paged}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} role`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps ?? 10)
            },
          }}
        />
      </Card>

      <RoleCreateOrUpdate
        open={modalOpen}
        mode={modalMode}
        role={selected}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSuccess={() => {
          message.success(modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật')
          void load()
        }}
      />
    </div>
  )
}
