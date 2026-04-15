'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Typography,
} from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import {
  rbacAdminApi,
  type ModuleDto,
  type OperationDto,
  type RoleDto,
  type RoleOperationDto,
  type UserRoleDto,
} from '@/services/rbacAdminApi'

const { Title } = Typography

export default function AdminRbacPage() {
  const [tab, setTab] = useState('modules')

  const [modules, setModules] = useState<ModuleDto[]>([])
  const [operations, setOperations] = useState<OperationDto[]>([])
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [roleOps, setRoleOps] = useState<RoleOperationDto[]>([])
  const [userRoles, setUserRoles] = useState<UserRoleDto[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'modules') {
        setModules(await rbacAdminApi.modules.list())
      }
      if (tab === 'operations') {
        const [ops, mods] = await Promise.all([
          rbacAdminApi.operations.list(),
          rbacAdminApi.modules.list(),
        ])
        setOperations(ops)
        setModules(mods)
      }
      if (tab === 'roles') {
        setRoles(await rbacAdminApi.roles.list())
      }
      if (tab === 'roleOps') {
        const [ro, rls, ops, mods] = await Promise.all([
          rbacAdminApi.roleOperations.list(),
          rbacAdminApi.roles.list(),
          rbacAdminApi.operations.list(),
          rbacAdminApi.modules.list(),
        ])
        setRoleOps(ro)
        setRoles(rls)
        setOperations(ops)
        setModules(mods)
      }
      if (tab === 'userRoles') {
        const [ur, rls] = await Promise.all([
          rbacAdminApi.userRoles.list(),
          rbacAdminApi.roles.list(),
        ])
        setUserRoles(ur)
        setRoles(rls)
      }
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : 'Không tải được dữ liệu (cần đăng nhập JWT).',
      )
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    void load()
  }, [load])

  const moduleColumns: ColumnsType<ModuleDto> = [
    { title: 'Mã', dataIndex: 'code', width: 120 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', width: 90 },
    {
      title: 'Hiện',
      dataIndex: 'isShow',
      width: 80,
      render: (v: boolean) => (v ? 'Có' : 'Không'),
    },
    {
      title: '',
      key: 'act',
      width: 160,
      render: (_, row) => (
        <Space>
          <ModuleEditBtn row={row} onDone={load} />
          <Button danger size="small" onClick={() => void deleteModule(row.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  async function deleteModule(id: string) {
    Modal.confirm({
      title: 'Xóa module?',
      onOk: async () => {
        await rbacAdminApi.modules.remove(id)
        message.success('Đã xóa')
        void load()
      },
    })
  }

  const operationColumns: ColumnsType<OperationDto> = [
    { title: 'Module', dataIndex: 'moduleName', width: 160 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'URL', dataIndex: 'url' },
    { title: 'Mã', dataIndex: 'code', width: 120 },
    {
      title: '',
      key: 'act',
      width: 160,
      render: (_, row) => (
        <Space>
          <OperationEditBtn row={row} modules={modules} onDone={load} />
          <Button danger size="small" onClick={() => void deleteOperation(row.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  async function deleteOperation(id: string) {
    Modal.confirm({
      title: 'Xóa thao tác?',
      onOk: async () => {
        await rbacAdminApi.operations.remove(id)
        message.success('Đã xóa')
        void load()
      },
    })
  }

  const roleColumns: ColumnsType<RoleDto> = [
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Mã', dataIndex: 'code', width: 140 },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 90,
      render: (v: boolean) => (v ? 'Có' : 'Không'),
    },
    {
      title: '',
      key: 'act',
      width: 160,
      render: (_, row) => (
        <Space>
          <RoleEditBtn row={row} onDone={load} />
          <Button danger size="small" onClick={() => void deleteRole(row.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  async function deleteRole(id: string) {
    Modal.confirm({
      title: 'Xóa vai trò?',
      onOk: async () => {
        await rbacAdminApi.roles.remove(id)
        message.success('Đã xóa')
        void load()
      },
    })
  }

  const roleOpColumns: ColumnsType<RoleOperationDto> = [
    { title: 'Vai trò', dataIndex: 'roleName', width: 160 },
    { title: 'Thao tác', dataIndex: 'operationName' },
    { title: 'Quyền', dataIndex: 'isAccess', width: 80 },
    {
      title: '',
      key: 'act',
      width: 160,
      render: (_, row) => (
        <Space>
          <RoleOpEditBtn row={row} onDone={load} />
          <Button danger size="small" onClick={() => void deleteRoleOp(row.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  async function deleteRoleOp(id: string) {
    Modal.confirm({
      title: 'Xóa gán quyền?',
      onOk: async () => {
        await rbacAdminApi.roleOperations.remove(id)
        message.success('Đã xóa')
        void load()
      },
    })
  }

  const userRoleColumns: ColumnsType<UserRoleDto> = [
    { title: 'Email user', dataIndex: 'userEmail', width: 220 },
    { title: 'Vai trò', dataIndex: 'roleName', width: 200 },
    {
      title: '',
      key: 'act',
      width: 100,
      render: (_, row) => (
        <Button danger size="small" onClick={() => void deleteUserRole(row.id)}>
          Xóa
        </Button>
      ),
    },
  ]

  async function deleteUserRole(id: string) {
    Modal.confirm({
      title: 'Gỡ user khỏi role?',
      onOk: async () => {
        await rbacAdminApi.userRoles.remove(id)
        message.success('Đã xóa')
        void load()
      },
    })
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Title level={4} className="mb-0">
          Phân quyền (Module / Operation / Role)
        </Title>
        <Link href="/admin">
          <Button type="link">← Về quản trị</Button>
        </Link>
      </div>

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k)}
        items={[
          {
            key: 'modules',
            label: 'Modules',
            children: (
              <Space direction="vertical" className="w-full" size="middle">
                <ModuleCreateBtn onDone={load} />
                <Table<ModuleDto>
                  rowKey="id"
                  loading={loading}
                  columns={moduleColumns}
                  dataSource={modules}
                  pagination={{ pageSize: 8 }}
                />
              </Space>
            ),
          },
          {
            key: 'operations',
            label: 'Operations',
            children: (
              <Space direction="vertical" className="w-full" size="middle">
                <OperationCreateBtn modules={modules} onDone={load} />
                <Table<OperationDto>
                  rowKey="id"
                  loading={loading}
                  columns={operationColumns}
                  dataSource={operations}
                  pagination={{ pageSize: 8 }}
                />
              </Space>
            ),
          },
          {
            key: 'roles',
            label: 'Roles',
            children: (
              <Space direction="vertical" className="w-full" size="middle">
                <RoleCreateBtn onDone={load} />
                <Table<RoleDto>
                  rowKey="id"
                  loading={loading}
                  columns={roleColumns}
                  dataSource={roles}
                  pagination={{ pageSize: 8 }}
                />
              </Space>
            ),
          },
          {
            key: 'roleOps',
            label: 'Role ↔ Operation',
            children: (
              <Space direction="vertical" className="w-full" size="middle">
                <RoleOpCreateBtn roles={roles} operations={operations} onDone={load} />
                <Table<RoleOperationDto>
                  rowKey="id"
                  loading={loading}
                  columns={roleOpColumns}
                  dataSource={roleOps}
                  pagination={{ pageSize: 8 }}
                />
              </Space>
            ),
          },
          {
            key: 'userRoles',
            label: 'User ↔ Role',
            children: (
              <Space direction="vertical" className="w-full" size="middle">
                <UserRoleCreateBtn roles={roles} onDone={load} />
                <Table<UserRoleDto>
                  rowKey="id"
                  loading={loading}
                  columns={userRoleColumns}
                  dataSource={userRoles}
                  pagination={{ pageSize: 8 }}
                />
              </Space>
            ),
          },
        ]}
      />
    </div>
  )
}

function ModuleCreateBtn({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Thêm module
      </Button>
      <Modal
        open={open}
        title="Module mới"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.modules.create({
            code: v.code ?? null,
            name: v.name,
            sortOrder: v.sortOrder ?? 0,
            isShow: v.isShow ?? true,
            icon: v.icon ?? null,
            classCss: v.classCss ?? null,
            styleCss: v.styleCss ?? null,
            link: v.link ?? null,
            allowFilterScope: v.allowFilterScope ?? null,
            isMobile: v.isMobile ?? null,
          })
          message.success('Đã tạo')
          form.resetFields()
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ isShow: true, sortOrder: 0 }}>
          <Form.Item name="code" label="Mã">
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự">
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="isShow" label="Hiển thị" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="link" label="Link">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function ModuleEditBtn({ row, onDone }: { row: ModuleDto; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
        isShow: row.isShow,
        link: row.link,
        icon: row.icon,
        classCss: row.classCss,
        styleCss: row.styleCss,
        allowFilterScope: row.allowFilterScope,
        isMobile: row.isMobile,
      })
    }
  }, [open, form, row])
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        Sửa
      </Button>
      <Modal
        open={open}
        title="Sửa module"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.modules.update(row.id, {
            code: v.code ?? null,
            name: v.name,
            sortOrder: v.sortOrder ?? 0,
            isShow: v.isShow ?? true,
            icon: v.icon ?? null,
            classCss: v.classCss ?? null,
            styleCss: v.styleCss ?? null,
            link: v.link ?? null,
            allowFilterScope: v.allowFilterScope ?? null,
            isMobile: v.isMobile ?? null,
          })
          message.success('Đã lưu')
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã">
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự">
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="isShow" label="Hiển thị" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="link" label="Link">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function OperationCreateBtn({
  modules,
  onDone,
}: {
  modules: ModuleDto[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Thêm operation
      </Button>
      <Modal
        open={open}
        title="Operation mới"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.operations.create({
            moduleId: v.moduleId,
            name: v.name,
            url: v.url,
            code: v.code,
            css: v.css ?? null,
            isShow: v.isShow ?? true,
            sortOrder: v.sortOrder ?? 0,
            icon: v.icon ?? null,
          })
          message.success('Đã tạo')
          form.resetFields()
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ isShow: true, sortOrder: 0 }}>
          <Form.Item name="moduleId" label="Module" rules={[{ required: true }]}>
            <Select
              options={modules.map((m) => ({ value: m.id, label: m.name }))}
              placeholder="Chọn module"
            />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function OperationEditBtn({
  row,
  modules,
  onDone,
}: {
  row: OperationDto
  modules: ModuleDto[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        moduleId: row.moduleId,
        name: row.name,
        url: row.url,
        code: row.code,
        css: row.css,
        isShow: row.isShow,
        sortOrder: row.sortOrder,
        icon: row.icon,
      })
    }
  }, [open, form, row])
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        Sửa
      </Button>
      <Modal
        open={open}
        title="Sửa operation"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.operations.update(row.id, {
            moduleId: v.moduleId,
            name: v.name,
            url: v.url,
            code: v.code,
            css: v.css ?? null,
            isShow: v.isShow ?? true,
            sortOrder: v.sortOrder ?? 0,
            icon: v.icon ?? null,
          })
          message.success('Đã lưu')
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="moduleId" label="Module" rules={[{ required: true }]}>
            <Select options={modules.map((m) => ({ value: m.id, label: m.name }))} />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function RoleCreateBtn({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Thêm role
      </Button>
      <Modal
        open={open}
        title="Role mới"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.roles.create({
            name: v.name,
            code: v.code,
            type: v.type ?? null,
            isActive: v.isActive ?? true,
          })
          message.success('Đã tạo')
          form.resetFields()
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function RoleEditBtn({ row, onDone }: { row: RoleDto; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: row.name,
        code: row.code,
        type: row.type,
        isActive: row.isActive,
      })
    }
  }, [open, form, row])
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        Sửa
      </Button>
      <Modal
        open={open}
        title="Sửa role"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.roles.update(row.id, {
            name: v.name,
            code: v.code,
            type: v.type ?? null,
            isActive: v.isActive ?? true,
          })
          message.success('Đã lưu')
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function RoleOpCreateBtn({
  roles,
  operations,
  onDone,
}: {
  roles: RoleDto[]
  operations: OperationDto[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Gán quyền
      </Button>
      <Modal
        open={open}
        title="Role — Operation"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.roleOperations.create({
            roleId: v.roleId,
            operationId: v.operationId,
            isAccess: v.isAccess ?? 1,
          })
          message.success('Đã tạo')
          form.resetFields()
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ isAccess: 1 }}>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))} />
          </Form.Item>
          <Form.Item name="operationId" label="Operation" rules={[{ required: true }]}>
            <Select
              options={operations.map((o) => ({
                value: o.id,
                label: `${o.name} — ${o.code}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="isAccess" label="Quyền (1=có)">
            <InputNumber className="w-full" min={0} max={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function RoleOpEditBtn({ row, onDone }: { row: RoleOperationDto; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) form.setFieldsValue({ isAccess: row.isAccess })
  }, [open, form, row])
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)}>
        Sửa
      </Button>
      <Modal
        open={open}
        title="Sửa quyền"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.roleOperations.update(row.id, { isAccess: v.isAccess ?? 0 })
          message.success('Đã lưu')
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="isAccess" label="Quyền (1=có)">
            <InputNumber className="w-full" min={0} max={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

function UserRoleCreateBtn({
  roles,
  onDone,
}: {
  roles: RoleDto[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Gán user → role
      </Button>
      <Modal
        open={open}
        title="User — Role"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields()
          await rbacAdminApi.userRoles.create({
            userId: v.userId,
            roleId: v.roleId,
          })
          message.success('Đã gán')
          form.resetFields()
          setOpen(false)
          onDone()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userId"
            label="User Id (Guid)"
            rules={[{ required: true, message: 'Dán Guid user từ bảng AppUsers' }]}
          >
            <Input placeholder="00000000-0000-0000-0000-000000000000" />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
