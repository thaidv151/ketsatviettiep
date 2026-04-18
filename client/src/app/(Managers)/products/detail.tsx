'use client'
import { useEffect, useState } from 'react'
import { Drawer, Descriptions, Tag, Button, Table, Spin, Divider, Badge } from 'antd'
import { EditOutlined, InboxOutlined } from '@ant-design/icons'
import type { ProductDetailDto, ProductVariantDto, ProductListDto } from '@/services/productApi'
import { productApi } from '@/services/productApi'

const STATUS_COLORS: Record<number, string> = { 0: 'default', 1: 'green', 2: 'orange', 3: 'red' }

type Props = { open: boolean; productId: string | null; onClose: () => void; onEdit: (row: ProductListDto) => void }

export default function ProductDetailDrawer({ open, productId, onClose, onEdit }: Props) {
  const [data, setData] = useState<ProductDetailDto | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !productId) return
    let cancelled = false
    setLoading(true)
    productApi.getDetail(productId).then(d => { if (!cancelled) setData(d) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, productId])

  const variantColumns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <code className="text-xs">{v}</code> },
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v: string | null) => v ?? '—' },
    { title: 'Giá', dataIndex: 'price', key: 'price', align: 'right' as const, render: (v: number) => <span className="font-semibold">{v.toLocaleString('vi-VN')}₫</span> },
    { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stock', align: 'center' as const, render: (v: number) => <Badge count={v} showZero color={v > 10 ? '#52c41a' : v > 0 ? '#faad14' : '#ff4d4f'} /> },
    { title: 'Hoạt động', dataIndex: 'isActive', key: 'isActive', align: 'center' as const, render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có' : 'Tắt'}</Tag> },
  ]

  return (
    <Drawer title={<span className="font-extrabold text-slate-800">Chi tiết sản phẩm</span>}
      open={open} onClose={onClose} width={760}
      extra={data && <Button type="primary" icon={<EditOutlined />} size="small" className="bg-[#1677ff]"
        onClick={() => onEdit({ id: data.id, name: data.name, slug: data.slug, categoryName: data.categoryName, brandName: data.brandName, thumbnailUrl: data.thumbnailUrl, basePrice: data.basePrice, salePrice: data.salePrice, totalStock: data.variants.reduce((s, v) => s + v.stockQuantity, 0), status: data.status, statusLabel: data.statusLabel, isFeatured: data.isFeatured, createdAt: data.createdAt })}>
        Chỉnh sửa
      </Button>}>
      {loading ? <div className="flex justify-center py-16"><Spin size="large" /></div> : data ? (
        <div className="space-y-6">
          {/* Ảnh + tên */}
          <div className="flex items-start gap-4">
            {data.thumbnailUrl
              ? <img src={data.thumbnailUrl} alt={data.name} className="h-24 w-24 rounded-sm object-cover border border-slate-200 flex-shrink-0" />
              : <div className="h-24 w-24 rounded-sm bg-slate-100 flex items-center justify-center flex-shrink-0"><InboxOutlined style={{ fontSize: 32 }} className="text-slate-400" /></div>}
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{data.name}</h2>
              <code className="text-xs text-slate-400">{data.slug}</code>
              <div className="flex items-center gap-2 mt-2">
                <Tag color={STATUS_COLORS[data.status] ?? 'default'} className="font-semibold">{data.statusLabel}</Tag>
                {data.isFeatured && <Tag color="gold">★ Nổi bật</Tag>}
              </div>
            </div>
          </div>

          <Descriptions column={2} bordered size="small" labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Danh mục">{data.categoryName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">{data.brandName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="SKU">{data.sku ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Lượt xem">{data.viewCount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Giá gốc">{data.basePrice ? data.basePrice.toLocaleString('vi-VN') + '₫' : '—'}</Descriptions.Item>
            <Descriptions.Item label="Giá bán">{data.salePrice ? <span className="font-bold text-[#1677ff]">{data.salePrice.toLocaleString('vi-VN')}₫</span> : '—'}</Descriptions.Item>
          </Descriptions>

          {data.shortDescription && <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-200">{data.shortDescription}</div>}

          {/* Biến thể */}
          {data.variants.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Biến thể ({data.variants.length})</div>
              <Table<ProductVariantDto> rowKey="id" dataSource={data.variants} columns={variantColumns} pagination={false} size="small" />
            </div>
          )}

          {/* Thuộc tính */}
          {data.attributes.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Thuộc tính</div>
              {data.attributes.map(a => (
                <div key={a.id} className="mb-2">
                  <span className="text-sm font-semibold text-slate-700">{a.name}: </span>
                  {a.values.map(v => (
                    <Tag key={v.id} color={v.colorHex ? undefined : 'blue'} style={v.colorHex ? { backgroundColor: v.colorHex, color: '#fff', border: 'none' } : undefined} className="text-xs mr-1">{v.value}</Tag>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Ảnh gallery */}
          {data.images.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Thư viện ảnh</div>
              <div className="flex flex-wrap gap-2">
                {data.images.map(img => <img key={img.id} src={img.imageUrl} alt={img.altText ?? ''} className={`h-16 w-16 rounded object-cover border-2 ${img.isPrimary ? 'border-[#1677ff]' : 'border-slate-200'}`} />)}
              </div>
            </div>
          )}

          <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Ngày tạo">{new Date(data.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
    </Drawer>
  )
}
