'use client'
import React, { useEffect, useState } from 'react'
import { Modal, Select, Form, message } from 'antd'
import { rbacAdminApi, type RoleDto } from '@/services/rbacAdmin.service'

interface Props {
  open: boolean
  userId: string | null
  userEmail: string | null
  onClose: () => void
  onSuccess: () => void
}

export const UserRoleModal: React.FC<Props> = ({ open, userId, userEmail, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<RoleDto[]>([])

  useEffect(() => {
    if (open && userId) {
      void loadData()
    }
  }, [open, userId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allRoles, userRoles] = await Promise.all([
        rbacAdminApi.roles.list(),
        rbacAdminApi.userRoles.listByUserId(userId!)
      ])
      setRoles(allRoles)
      form.setFieldsValue({
        roleIds: userRoles.map(ur => ur.roleId)
      })
    } catch (err) {
      message.error('Không thể tải dữ liệu vai trò')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const values = await form.validateFields()
      await rbacAdminApi.userRoles.setUserRoles(userId, values.roleIds)
      message.success('Thiết lập vai trò thành công')
      onSuccess()
    } catch (err) {
      message.error('Lỗi khi thiết lập vai trò')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Thiết lập vai trò - ${userEmail}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      width={500}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="roleIds"
          label="Chọn vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn các vai trò..."
            style={{ width: '100%' }}
            loading={loading}
            options={roles.map(r => ({ label: r.name, value: r.id }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
