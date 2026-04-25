'use client'
import { PlusCircleOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Pencil, Eye, Trash2, MoreHorizontal, Shield, Home, ChevronRight } from 'lucide-react'
import { Table, Button, Card, Popconfirm, message, Space, Dropdown, type MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import UserSearchPanel, { type UserSearchFormState } from './search'
import UserCreateOrUpdate from './createOrUpdate'
import UserDetailDrawer from './detail'
import { UserRoleModal } from './components/UserRoleModal'
import type { AppUserDto } from '@/services/appUser.service'
import { appUserApi } from '@/services/appUser.service'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

function matchesFilter(row: AppUserDto, q: UserSearchFormState): boolean {
// ... existing matchesFilter code ...
  const kw = q.keyword.trim().toLowerCase()
  if (kw) {
    const ok =
      row.email.toLowerCase().includes(kw) ||
      (row.username?.toLowerCase().includes(kw) ?? false) ||
      (row.fullName?.toLowerCase().includes(kw) ?? false) ||
      (row.phoneNumber?.toLowerCase().includes(kw) ?? false)
    if (!ok) return false
  }
  if (q.isLocked === 'true' && row.isLocked !== true) return false
  if (q.isLocked === 'false' && row.isLocked !== false) return false
  if (q.emailConfirmed === 'true' && row.emailConfirmed !== true) return false
  if (q.emailConfirmed === 'false' && row.emailConfirmed !== false) return false
  return true
}

export default function UserManagementPage() {
  const [raw, setRaw] = useState<AppUserDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<UserSearchFormState>({
    keyword: '',
    isLocked: '',
    emailConfirmed: '',
  })
  const [draft, setDraft] = useState<UserSearchFormState>({
    keyword: '',
    isLocked: '',
    emailConfirmed: '',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<AppUserDto | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [roleTarget, setRoleTarget] = useState<AppUserDto | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = await appUserApi.list()
      setRaw(list)
    } catch {
      message.error('Không tải được danh sách người dùng')
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
    const empty: UserSearchFormState = {
      keyword: '',
      isLocked: '',
      emailConfirmed: '',
    }
    setDraft(empty)
    setApplied(empty)
  }

  const openCreate = () => {
    setSelected(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = (row: AppUserDto) => {
    setSelected(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const openDetail = (row: AppUserDto) => {
    setDetailUserId(row.id)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setDetailUserId(null)
  }

  const handleDelete = async (row: AppUserDto) => {
    try {
      await appUserApi.remove(row.id)
      message.success('Đã xóa')
      void load()
    } catch {
      message.error('Không xóa được')
    }
  }

  const columns: ColumnsType<AppUserDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 64,
      align: 'center',
      render: (_, __, i) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (v) => v ?? '—',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (v) => v ?? '—',
    },
    {
      title: 'Xác thực',
      dataIndex: 'emailConfirmed',
      key: 'emailConfirmed',
      width: 120,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <span className="text-green-600 font-semibold text-xs">Đã xác thực</span>
        ) : (
          <span className="text-orange-600 font-semibold text-xs">Chưa xác thực</span>
        ),
    },
    {
      title: 'Khóa',
      dataIndex: 'isLocked',
      key: 'isLocked',
      width: 100,
      align: 'center',
      render: (v: boolean) =>
        v === true ? (
          <span className="text-red-600 font-semibold text-xs">Khóa</span>
        ) : (
          <span className="text-blue-600 font-semibold text-xs">Mở</span>
        ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 170,
      render: (s: string | null) =>
        s ? new Date(s).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (s: string) =>
        s ? new Date(s).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, row) => {
        const items: MenuProps['items'] = [
          {
            key: 'detail',
            label: 'Chi tiết',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => openDetail(row),
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => openEdit(row),
          },
          {
            key: 'roles',
            label: 'Thiết lập vai trò',
            icon: <Shield className="h-4 w-4" />,
            onClick: () => {
              setRoleTarget(row)
              setRoleModalOpen(true)
            },
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Xóa người dùng?"
                description="Thao tác không hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ className: 'bg-red-600' }}
                onConfirm={() => handleDelete(row)}
              >
                <span className="text-red-600">Xóa</span>
              </Popconfirm>
            ),
            danger: true,
            icon: <Trash2 className="h-4 w-4 text-red-600" />,
          },
        ]

        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreHorizontal size={16} />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 pb-12 bg-slate-50/50 min-h-screen -m-4 p-4 lg:-m-8 lg:p-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
        <Home size={14} className="hover:text-[#1677ff] cursor-pointer" />
        <ChevronRight size={14} />
        <span className="hover:text-[#1677ff] cursor-pointer">Quản lý</span>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#0958d9]">Người dùng</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">
              Người dùng
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">
              Quản lý tài khoản ứng dụng — tìm kiếm, xem chi tiết, chỉnh sửa
            </p>
          </div>
        </div>
        <Button
          type="primary"
          size='small'
          icon={<PlusCircleOutlined />}
          className={primaryBtn}
          onClick={openCreate}
        >
          Thêm người dùng
        </Button>
      </div>

      <UserSearchPanel
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
        <Table<AppUserDto>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={paged}
          scroll={{ x: 1280 }}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} người dùng`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps ?? 10)
            },
          }}
        />
      </Card>

      <UserCreateOrUpdate
        open={modalOpen}
        mode={modalMode}
        user={selected}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSuccess={() => {
          message.success(modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật')
          void load()
        }}
      />

      <UserDetailDrawer
        open={detailOpen}
        userId={detailUserId}
        onClose={closeDetail}
        onEdit={() => {
          if (!detailUserId) return
          const row = raw.find((u) => u.id === detailUserId)
          if (row) {
            closeDetail()
            setSelected(row)
            setModalMode('edit')
            setModalOpen(true)
          }
        }}
      />

      <UserRoleModal
        open={roleModalOpen}
        userId={roleTarget?.id ?? null}
        userEmail={roleTarget?.email ?? null}
        onClose={() => {
          setRoleModalOpen(false)
          setRoleTarget(null)
        }}
        onSuccess={() => {
          setRoleModalOpen(false)
          setRoleTarget(null)
          void load()
        }}
      />
    </div>
  )
}
