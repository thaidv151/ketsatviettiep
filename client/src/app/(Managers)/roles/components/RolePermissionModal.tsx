'use client'
import React, { useEffect, useState } from 'react'
import { Modal, Checkbox, Form, message, Spin, Collapse, Divider } from 'antd'
import { rbacAdminApi, type ModuleDto, type OperationDto } from '@/services/rbacAdmin.service'

interface Props {
  open: boolean
  roleId: string | null
  roleName: string | null
  onClose: () => void
  onSuccess: () => void
}

export const RolePermissionModal: React.FC<Props> = ({ open, roleId, roleName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState<ModuleDto[]>([])
  const [operations, setOperations] = useState<Record<string, OperationDto[]>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (open && roleId) {
      void loadData()
    }
  }, [open, roleId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allModules, roleOps] = await Promise.all([
        rbacAdminApi.modules.list(),
        rbacAdminApi.roleOperations.listByRoleId(roleId!)
      ])

      const opsMap: Record<string, OperationDto[]> = {}
      await Promise.all(allModules.map(async (m) => {
        const ops = await rbacAdminApi.operations.list(m.id)
        opsMap[m.id] = ops
      }))

      setModules(allModules)
      setOperations(opsMap)
      setSelectedIds(roleOps.map(ro => ro.operationId))
    } catch (err) {
      message.error('Không thể tải dữ liệu phân quyền')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!roleId) return
    try {
      setLoading(true)
      await rbacAdminApi.roleOperations.setRolePermissions(roleId, selectedIds)
      message.success('Phân quyền thành công')
      onSuccess()
    } catch (err) {
      message.error('Lỗi khi lưu phân quyền')
    } finally {
      setLoading(false)
    }
  }

  const toggleOperation = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleModule = (moduleId: string, checked: boolean) => {
    const moduleOps = operations[moduleId]?.map(o => o.id) || []
    if (checked) {
      setSelectedIds(prev => Array.from(new Set([...prev, ...moduleOps])))
    } else {
      setSelectedIds(prev => prev.filter(id => !moduleOps.includes(id)))
    }
  }

  return (
    <Modal
      title={`Phân quyền vai trò - ${roleName}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Lưu phân quyền"
      cancelText="Hủy"
      width={800}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Spin spinning={loading}>
        <div className="space-y-4 py-4">
          {modules.map(module => (
            <div key={module.id} className="border border-slate-100 rounded-sm p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  {module.name}
                </div>
                <Checkbox 
                  checked={operations[module.id]?.every(o => selectedIds.includes(o.id))}
                  indeterminate={
                    operations[module.id]?.some(o => selectedIds.includes(o.id)) && 
                    !operations[module.id]?.every(o => selectedIds.includes(o.id))
                  }
                  onChange={e => toggleModule(module.id, e.target.checked)}
                >
                  Chọn tất cả
                </Checkbox>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {operations[module.id]?.map(op => (
                  <div 
                    key={op.id} 
                    className={`p-2 border rounded-sm cursor-pointer transition-all ${
                      selectedIds.includes(op.id) 
                        ? 'border-blue-200 bg-blue-50/50' 
                        : 'border-transparent bg-white hover:border-slate-200'
                    }`}
                    onClick={() => toggleOperation(op.id)}
                  >
                    <Checkbox checked={selectedIds.includes(op.id)} />
                    <span className="ml-2 text-sm text-slate-700">{op.name}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5 ml-6">{op.code}</div>
                  </div>
                ))}
                {(!operations[module.id] || operations[module.id].length === 0) && (
                  <div className="col-span-full text-slate-400 text-xs italic">Không có chức năng nào</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Spin>
    </Modal>
  )
}
