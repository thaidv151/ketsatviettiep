'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, Button, Card, Popconfirm, Tag, Badge, Empty, Dropdown, type MenuProps } from 'antd'
import { useToast } from '@/hooks/use-toast'
import type { ColumnsType } from 'antd/es/table'
import {
  InboxOutlined, EditOutlined, EyeOutlined, DeleteOutlined, PlusCircleOutlined, MoreOutlined,
  AppstoreOutlined, StarOutlined, StockOutlined, ShopOutlined,
} from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import ProductSearch, { type ProductSearchState } from './search'
import type { ProductListDto, UpdateProductRequest } from '@/services/product.service'
import { productApi } from '@/services/product.service'
import { getFullImagePath } from '@/lib/path-utils'

const primaryBtn =
  'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff] font-bold uppercase tracking-widest h-10 px-5'

const STATUS_COLORS: Record<number, string> = { 0: 'default', 1: 'green', 2: 'orange', 3: 'red' }
const PRODUCT_STATUS_OPTIONS = [
  { value: 0, label: 'Nháp' },
  { value: 1, label: 'Đang bán' },
  { value: 2, label: 'Hết hàng' },
  { value: 3, label: 'Ngừng bán' },
] as const

export default function ProductManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [raw, setRaw] = useState<ProductListDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [applied, setApplied] = useState<ProductSearchState>({ keyword: '', status: '' })
  const [draft, setDraft] = useState<ProductSearchState>({ keyword: '', status: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setRaw(await productApi.list())
    } catch {
      toast({ variant: 'destructive', title: 'Không tải được sản phẩm' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase()
    return raw.filter((r) => {
      if (
        kw &&
        !r.name.toLowerCase().includes(kw) &&
        !r.slug.toLowerCase().includes(kw) &&
        !(r.categoryName ?? '').toLowerCase().includes(kw)
      ) {
        return false
      }
      if (applied.status !== '' && r.status !== Number(applied.status)) return false
      return true
    })
  }, [raw, applied])

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  )

  const stats = useMemo(() => {
    const totalStock = filtered.reduce((s, r) => s + (r.totalStock ?? 0), 0)
    const featured = filtered.filter((r) => r.isFeatured).length
    const onSale = filtered.filter((r) => r.status === 1).length
    return { totalStock, featured, onSale }
  }, [filtered])

  useEffect(() => {
    setPage(1)
  }, [applied, pageSize])

  const handleDelete = async (row: ProductListDto) => {
    try {
      await productApi.remove(row.id)
      toast({ variant: 'success', title: 'Đã xóa' })
      void load()
    } catch {
      toast({ variant: 'destructive', title: 'Không xóa được' })
    }
  }

  const handleQuickStatusChange = async (row: ProductListDto, nextStatus: number) => {
    if (row.status === nextStatus) return
    try {
      const detail = await productApi.getDetail(row.id)
      const body: UpdateProductRequest = {
        categoryId: detail.categoryId,
        brandId: detail.brandId,
        name: detail.name,
        slug: detail.slug,
        sku: detail.sku,
        shortDescription: detail.shortDescription,
        description: detail.description,
        basePrice: detail.basePrice,
        salePrice: detail.salePrice,
        thumbnailUrl: detail.thumbnailUrl,
        status: nextStatus,
        isFeatured: detail.isFeatured,
        metaTitle: detail.metaTitle,
        metaDescription: detail.metaDescription,
        metaKeywords: detail.metaKeywords,
        specifications: detail.specifications,
        attributes: detail.attributes.map((a) => ({
          name: a.name,
          isVariantOption: a.isVariantOption,
          sortOrder: a.sortOrder,
          values: a.values.map((v) => ({
            value: v.value,
            colorHex: v.colorHex,
            sortOrder: v.sortOrder,
          })),
        })),
        variants: detail.variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold,
          weightGram: v.weightGram,
          imageUrl: v.imageUrl,
          galleryImageUrls: v.galleryImageUrls,
          isActive: v.isActive,
          attributeValueIds: v.attributeValueIds,
        })),
        imageUrls: detail.images.map((img) => img.imageUrl),
      }
      await productApi.update(row.id, body)
      toast({
        variant: 'success',
        title: `Đã chuyển trạng thái: ${
          PRODUCT_STATUS_OPTIONS.find((s) => s.value === nextStatus)?.label ?? 'Cập nhật'
        }`,
      })
      void load()
    } catch {
      toast({ variant: 'destructive', title: 'Không cập nhật được trạng thái sản phẩm' })
    }
  }

  const columns: ColumnsType<ProductListDto> = [
    { title: 'STT', key: 'stt', width: 58, align: 'center', render: (_, __, i) => (page - 1) * pageSize + i + 1 },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-0.5">
          {row.thumbnailUrl ? (
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-sm ring-1 ring-black/[0.03]">
              <img
                src={getFullImagePath(row.thumbnailUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
              <InboxOutlined style={{ fontSize: 20 }} />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 leading-snug line-clamp-2">{row.name}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {row.categoryName}
              {row.brandName ? <span className="text-slate-400"> · {row.brandName}</span> : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      width: 128,
      align: 'right',
      render: (_, row) => (
        <div className="text-right">
          <div className="font-bold tabular-nums text-slate-800">
            {(row.salePrice ?? row.basePrice ?? 0).toLocaleString('vi-VN')}
            <span className="text-xs font-semibold text-slate-500">₫</span>
          </div>
          {row.salePrice && row.basePrice && row.salePrice < row.basePrice && (
            <div className="text-xs text-slate-400 line-through tabular-nums">
              {row.basePrice.toLocaleString('vi-VN')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 96,
      align: 'center',
      render: (v: number) => (
        <Badge
          count={v}
          showZero
          overflowCount={1_000_000_000}
          color={v > 10 ? '#52c41a' : v > 0 ? '#faad14' : '#ff4d4f'}
          className="[&_.ant-badge-count]:min-w-7 [&_.ant-badge-count]:tabular-nums [&_.ant-badge-count]:px-1.5"
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusLabel',
      key: 'status',
      width: 124,
      render: (label: string, row) => (
        <Tag color={STATUS_COLORS[row.status] ?? 'default'} className="m-0 text-xs font-semibold">
          {label}
        </Tag>
      ),
    },
    {
      title: 'Nổi bật',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 100,
      align: 'center',
      render: (v: boolean) =>
        v ? (
          <Tag color="gold" className="m-0 text-xs">
            <StarOutlined className="mr-0.5" />
            Có
          </Tag>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 158,
      render: (s) => <span className="whitespace-nowrap text-slate-600 text-[13px] tabular-nums">{new Date(s).toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 88,
      align: 'center',
      fixed: 'right',
      render: (_, row) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => router.push(`/products/${row.id}`),
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => router.push(`/products/${row.id}/edit`),
          },
          { type: 'divider' },
          {
            key: 'status',
            label: 'Chuyển trạng thái nhanh',
            children: PRODUCT_STATUS_OPTIONS.map((s) => ({
              key: `status-${s.value}`,
              label: s.label,
              disabled: row.status === s.value,
              onClick: () => handleQuickStatusChange(row, s.value),
            })),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Xóa sản phẩm?"
                description="Hành động này không thể hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ className: 'bg-red-600' }}
                onConfirm={() => handleDelete(row)}
              >
                <span className="text-red-600">Xóa</span>
              </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: '#dc2626' }} />,
            danger: true,
          },
        ]
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/80 pb-12 -m-4 p-4 sm:p-5 lg:-m-8 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <AdminBreadcrumb
          items={[{ label: 'Quản lý', onClick: () => router.push('/dashboard') }]}
          currentPage="Sản phẩm"
        />

        <div className="flex flex-col gap-4 rounded-sm border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-2xl text-[#1677ff] ring-1 ring-blue-100/80">
              <InboxOutlined />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                Sản phẩm
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Danh mục, biến thể, tồn kho — thêm mới tại trang riêng
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            className={primaryBtn}
            onClick={() => router.push('/products/new')}
          >
            Thêm sản phẩm
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              k: 'count',
              label: 'Kết quả lọc',
              value: filtered.length,
              sub: raw.length > 0 ? `toàn hệ thống ${raw.length} mặt hàng` : 'Chưa có dữ liệu',
              icon: <AppstoreOutlined />,
              accent: 'from-slate-50 to-slate-100/80 text-slate-600',
            },
            {
              k: 'stock',
              label: 'Tổng tồn (lọc)',
              value: stats.totalStock.toLocaleString('vi-VN'),
              sub: 'đơn vị',
              icon: <StockOutlined />,
              accent: 'from-emerald-50/90 to-teal-50/50 text-emerald-700',
            },
            {
              k: 'sale',
              label: 'Đang bán',
              value: stats.onSale,
              sub: 'mặt hàng',
              icon: <ShopOutlined />,
              accent: 'from-blue-50 to-sky-50/80 text-[#1677ff]',
            },
            {
              k: 'feat',
              label: 'Nổi bật',
              value: stats.featured,
              sub: 'mặt hàng',
              icon: <StarOutlined />,
              accent: 'from-amber-50 to-orange-50/60 text-amber-700',
            },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br text-base ${s.accent}`}
                >
                  {s.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-800">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <ProductSearch
          expanded={searchExpanded}
          onToggle={() => setSearchExpanded((v) => !v)}
          form={draft}
          onFormChange={setDraft}
          onSearch={() => setApplied({ ...draft })}
          onReset={() => {
            const e: ProductSearchState = { keyword: '', status: '' }
            setDraft(e)
            setApplied(e)
          }}
        />

        <Card className="overflow-hidden rounded-sm border-slate-200/90 shadow-sm" styles={{ body: { padding: 0 } }}>
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">Danh sách</h2>
              <span className="text-xs text-slate-500">
                {filtered.length === 0 ? 'Không có bản ghi' : `Hiển thị ${paged.length} / ${filtered.length}`}
              </span>
            </div>
          </div>
          <Table<ProductListDto>
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={paged}
            size="middle"
            scroll={{ x: 1100 }}
            className="[&_.ant-table]:text-[13px] [&_thead_.ant-table-cell]:bg-slate-50/80 [&_thead_.ant-table-cell]:text-xs [&_thead_.ant-table-cell]:font-bold [&_thead_.ant-table-cell]:uppercase [&_thead_.ant-table-cell]:tracking-wide [&_tbody_.ant-table-row]:transition-colors"
            rowClassName={() => 'hover:bg-slate-50/90'}
            locale={{
              emptyText: <Empty className="py-10" image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có sản phẩm" />,
            }}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: (t) => <span className="text-slate-500 tabular-nums">{t} sản phẩm</span>,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps ?? 10)
              },
            }}
          />
        </Card>
      </div>
    </div>
  )
}
