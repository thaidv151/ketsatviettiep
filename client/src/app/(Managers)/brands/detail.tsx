'use client'
import { Drawer, Descriptions, Tag, Button, Avatar } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { BrandDto } from '@/services/brandApi'

type Props = { open: boolean; item: BrandDto | null; onClose: () => void; onEdit: () => void }

export default function BrandDetail({ open, item, onClose, onEdit }: Props) {
  return (
    <Drawer title={<span className="font-extrabold text-slate-800">Chi tiết thương hiệu</span>}
      open={open} onClose={onClose} width={440}
      extra={<Button type="primary" icon={<EditOutlined />} size="small" className="bg-[#1677ff]" onClick={onEdit}>Chỉnh sửa</Button>}>
      {item && (
        <>
          {item.logoUrl && <div className="flex justify-center mb-6"><Avatar src={item.logoUrl} size={80} className="border border-slate-200 rounded-lg" /></div>}
          <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: 130 }}>
            <Descriptions.Item label="Tên">{item.name}</Descriptions.Item>
            <Descriptions.Item label="Slug"><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{item.slug ?? '—'}</code></Descriptions.Item>
            {item.websiteUrl && <Descriptions.Item label="Website"><a href={item.websiteUrl} target="_blank" rel="noreferrer" className="text-[#1677ff] text-sm">{item.websiteUrl}</a></Descriptions.Item>}
            <Descriptions.Item label="Trạng thái"><Tag color={item.isActive ? 'green' : 'default'}>{item.isActive ? 'Hoạt động' : 'Ẩn'}</Tag></Descriptions.Item>
            {item.description && <Descriptions.Item label="Mô tả">{item.description}</Descriptions.Item>}
            <Descriptions.Item label="Ngày tạo">{new Date(item.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  )
}
