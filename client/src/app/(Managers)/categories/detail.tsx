'use client'
import { Drawer, Descriptions, Tag, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { CategoryDto } from '@/services/categoryApi'

type Props = {
  open: boolean
  item: CategoryDto | null
  onClose: () => void
  onEdit: () => void
}

export default function CategoryDetail({ open, item, onClose, onEdit }: Props) {
  return (
    <Drawer title={<span className="font-extrabold text-slate-800">Chi tiết danh mục</span>}
      open={open} onClose={onClose} width={480}
      extra={<Button type="primary" icon={<EditOutlined />} size="small"
        className="bg-[#1677ff] hover:bg-[#0958d9]" onClick={onEdit}>Chỉnh sửa</Button>}>
      {item && (
        <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: 140 }}>
          <Descriptions.Item label="Tên">{item.name}</Descriptions.Item>
          <Descriptions.Item label="Slug"><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{item.slug}</code></Descriptions.Item>
          <Descriptions.Item label="Danh mục cha">{item.parentName ?? '— (Gốc)'}</Descriptions.Item>
          <Descriptions.Item label="Thứ tự">{item.sortOrder}</Descriptions.Item>
          <Descriptions.Item label="Danh mục con">{item.childCount}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={item.isActive ? 'green' : 'default'}>{item.isActive ? 'Hoạt động' : 'Ẩn'}</Tag>
          </Descriptions.Item>
          {item.imageUrl && <Descriptions.Item label="Ảnh">
            <img src={item.imageUrl} alt={item.name} className="h-20 w-auto rounded object-cover" />
          </Descriptions.Item>}
          {item.description && <Descriptions.Item label="Mô tả">{item.description}</Descriptions.Item>}
          <Descriptions.Item label="Ngày tạo">{new Date(item.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  )
}
