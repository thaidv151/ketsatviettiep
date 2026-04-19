'use client'

import { PlusCircleOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home, ChevronRight, ListChecks, Pencil, Trash2 } from 'lucide-react'
import { Table, Button, Card, Popconfirm, message, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ModuleDto, OperationDto } from '@/services/rbacAdmin.service'
import { rbacAdminApi } from '@/services/rbacAdmin.service'
import OperationSearchPanel, { type OperationSearchState } from './search'
import OperationCreateOrUpdate, { type OperationModalMode } from './createOrUpdate'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest'

function matchesFilter(row: OperationDto, q: OperationSearchState): boolean {
  const kw = q.keyword.trim().toLowerCase()
  if (kw) {
    const ok =
      row.name.toLowerCase().includes(kw) ||
      row.code.toLowerCase().includes(kw) ||
      row.url.toLowerCase().includes(kw)
    if (!ok) return false
  }
  if (q.status === 'true' && row.isShow !== true) return false
  if (q.status === 'false' && row.isShow !== false) return false
  return true
}

export default function OperationManagementPage() {
  const [modules, setModules] = useState<ModuleDto[]>([])
  const [raw, setRaw] = useState<OperationDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<OperationSearchState>({
    keyword: '',
    status: '',
    moduleId: '',
  })
  const [draft, setDraft] = useState<OperationSearchState>({
    keyword: '',
    status: '',
    moduleId: '',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<OperationModalMode>('create')
  const [selected, setSelected] = useState<OperationDto | null>(null)

  const loadModules = useCallback(async () => {
    const list = await rbacAdminApi.modules.list()
    setModules(list)
    return list
  }, [])

  const loadOperations = useCallback(async (moduleId: string) => {
    if (!moduleId) {
      setRaw([])
      return
    }
    const list = await rbacAdminApi.operations.list(moduleId)
    setRaw(list)
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadModules()
      .then((mods) => {
        if (cancelled) return
        const selectedModuleId = mods[0]?.id ?? ''
        setDraft((prev) => ({ ...prev, moduleId: prev.moduleId || selectedModuleId }))
        setApplied((prev) => ({ ...prev, moduleId: prev.moduleId || selectedModuleId }))
      })
      .catch(() => {
        if (!cancelled) message.error('Không tải được danh sách module')
      })
    return () => {
      cancelled = true
    }
  }, [loadModules])

  useEffect(() => {
    if (!applied.moduleId) return
    let cancelled = false
    setLoading(true)
    void loadOperations(applied.moduleId)
      .catch(() => {
        if (!cancelled) message.error('Không tải được danh sách operation')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applied.moduleId, loadOperations])

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
    if (!draft.moduleId) {
      message.warning('Vui lòng chọn module')
      return
    }
    setApplied({ ...draft })
  }

  const handleReset = () => {
    const keepModuleId = draft.moduleId || modules[0]?.id || ''
    const empty: OperationSearchState = {
      keyword: '',
      status: '',
      moduleId: keepModuleId,
    }
    setDraft(empty)
    setApplied(empty)
  }

  const openCreate = () => {
    if (!draft.moduleId) {
      message.warning('Vui lòng chọn module trước khi thêm operation')
      return
    }
    setSelected(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = (row: OperationDto) => {
    setSelected(row)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDelete = async (row: OperationDto) => {
    try {
      await rbacAdminApi.operations.remove(row.id)
      message.success('Đã xóa')
      void loadOperations(applied.moduleId)
    } catch {
      message.error('Không xóa được')
    }
  }

  const columns: ColumnsType<OperationDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 64,
      align: 'center',
      render: (_, __, i) => (page - 1) * pageSize + i + 1,
    },
    {
      title: 'Tên operation',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 180,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isShow',
      key: 'isShow',
      width: 100,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <span className="text-blue-600 font-semibold text-xs">Có</span>
        ) : (
          <span className="text-slate-500 font-semibold text-xs">Không</span>
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
            title="Xóa operation?"
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
        <span className="font-semibold text-[#0958d9]">Operation</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1677ff] rounded-sm">
            <ListChecks size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">
              Operation
            </h2>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">
              Quản lý operation theo từng module
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
          Thêm operation
        </Button>
      </div>

      <OperationSearchPanel
        expanded={searchExpanded}
        onToggle={() => setSearchExpanded((v) => !v)}
        form={draft}
        modules={modules}
        onFormChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <Card
        className="rounded-sm border border-slate-200 shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Table<OperationDto>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={paged}
          scroll={{ x: 920 }}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `${t} operation`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps ?? 10)
            },
          }}
        />
      </Card>

      <OperationCreateOrUpdate
        open={modalOpen}
        mode={modalMode}
        operation={selected}
        modules={modules}
        defaultModuleId={draft.moduleId || applied.moduleId}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSuccess={() => {
          message.success(modalMode === 'create' ? 'Đã thêm' : 'Đã cập nhật')
          void loadOperations(applied.moduleId)
        }}
      />
    </div>
  )
}
