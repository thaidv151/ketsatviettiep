'use client'

import { Button, Card, Space, Typography } from 'antd'
import Link from 'next/link'

const { Title, Paragraph } = Typography

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <Card className="mx-auto max-w-xl shadow-sm">
        <Title level={3}>Khu vực quản trị</Title>
        <Paragraph type="secondary">
          Trang mẫu dùng Ant Design. Thêm layout sidebar/header và các module quản trị tại đây.
        </Paragraph>
        <Space>
          <Link href="/admin/rbac">
            <Button type="primary">Phân quyền (Module / Role)</Button>
          </Link>
          <Link href="/">
            <Button type="default">Về trang công khai</Button>
          </Link>
        </Space>
      </Card>
    </div>
  )
}
