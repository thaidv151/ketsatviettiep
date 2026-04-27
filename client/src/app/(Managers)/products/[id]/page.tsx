'use client'

import { useCallback, useEffect, useState, type ReactNode, type ComponentType } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Table, Spin, Image, Empty, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeft,
  Pencil,
  Package,
  ImageOff,
  Store,
  Building2,
  Hash,
  Calendar,
  Banknote,
  Tag as TagIcon,
  Sparkles,
  Eye,
  Boxes,
  Layers,
  FileText,
  Ruler,
  GalleryHorizontal,
  ListTree,
  Search,
} from 'lucide-react'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import { cn } from '@/lib/utils'

function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
import type { ProductDetailDto, ProductVariantDto } from '@/services/product.service'
import { productApi } from '@/services/product.service'
import { getFullImagePath } from '@/lib/path-utils'

const primaryBtn = 'h-9 rounded-lg bg-[#1677ff] px-4 font-bold uppercase tracking-widest shadow-sm hover:!bg-[#0958d9]'

type SectionBlockProps = {
  title: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  children: ReactNode
  className?: string
  extra?: ReactNode
}

function SectionBlock({ title, icon: Icon, children, className, extra }: SectionBlockProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-[#1677ff] ring-1 ring-slate-200/60"
            aria-hidden
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
          </div>
        </div>
        {extra}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  )
}

function StatPill({
  label,
  value,
  icon: Icon,
  accent = 'default',
  compact = false,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  accent?: 'default' | 'blue' | 'violet' | 'emerald'
  /** `true` — dùng trong hero: gọn, ít tốn chiều dọc */
  compact?: boolean
}) {
  const acc =
    accent === 'blue'
      ? 'text-blue-600 bg-blue-50/90 ring-blue-100/80'
      : accent === 'violet'
        ? 'text-violet-600 bg-violet-50/90 ring-violet-100/80'
        : accent === 'emerald'
          ? 'text-emerald-700 bg-emerald-50/90 ring-emerald-100/80'
          : 'text-slate-600 bg-slate-100/80 ring-slate-200/60'
  return (
    <div
      className={cn(
        'flex min-w-0 items-center ring-1',
        compact ? 'gap-2 rounded-lg px-2 py-1.5' : 'gap-3 rounded-xl px-3.5 py-2.5',
        acc,
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm',
          compact ? 'h-7 w-7' : 'h-9 w-9',
        )}
      >
        <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'font-bold uppercase tracking-widest text-slate-500/90',
            compact ? 'text-[9px] leading-tight' : 'text-[10px]',
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'truncate font-bold tabular-nums text-slate-900',
            compact ? 'text-xs' : 'text-sm sm:text-base',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const [data, setData] = useState<ProductDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setError('Thiếu mã sản phẩm')
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const d = await productApi.getDetail(id)
      setData(d)
    } catch {
      setError('Không tải được chi tiết sản phẩm')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const goEdit = () => {
    if (id) router.push(`/products/${id}/edit`)
  }

  const variantColumns: ColumnsType<ProductVariantDto> = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120, render: (v) => <code className="text-xs text-slate-700">{v}</code> },
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => (v as string | null) ?? '—' },
    {
      title: 'Ảnh ĐB',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 58,
      align: 'center',
      render: (url: string | null) =>
        url ? (
          <Image width={40} height={40} className="rounded-md object-cover ring-1 ring-slate-200/80" src={getFullImagePath(url)} alt="" />
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      title: 'Album',
      key: 'g',
      width: 120,
      render: (_: unknown, r) =>
        (r.galleryImageUrls?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1">
            {r.galleryImageUrls.slice(0, 3).map((u, i) => (
              <Image key={i} width={28} height={28} className="rounded object-cover ring-1 ring-slate-100" src={getFullImagePath(u)} alt="" />
            ))}
            {r.galleryImageUrls.length > 3 && <span className="self-center text-[10px] text-slate-400">+{r.galleryImageUrls.length - 3}</span>}
          </div>
        ) : (
          '—'
        ),
    },
    { title: 'Giá', dataIndex: 'price', key: 'price', width: 110, align: 'right', render: (v) => <span className="font-semibold tabular-nums text-slate-800">{v.toLocaleString('vi-VN')}₫</span> },
    { title: 'Giá gốc', dataIndex: 'originalPrice', key: 'op', width: 110, align: 'right', render: (v: number | null) => (v != null ? <span className="text-slate-400 line-through text-xs tabular-nums">{v.toLocaleString('vi-VN')}₫</span> : '—') },
    {
      title: 'Tồn',
      dataIndex: 'stockQuantity',
      key: 'st',
      width: 80,
      align: 'center',
      render: (v: number) => <Badge count={v} showZero overflowCount={1_000_000_000} color={v > 10 ? '#16a34a' : v > 0 ? '#d97706' : '#ef4444'} />,
    },
    { title: 'Ngưỡng tồn thấp', dataIndex: 'lowStockThreshold', key: 'low', width: 100, align: 'center' },
    { title: 'Gr', dataIndex: 'weightGram', key: 'w', width: 70, align: 'right', render: (v: number | null) => (v != null ? v : '—') },
    { title: 'Thuộc tính (id)', dataIndex: 'attributeValueIds', key: 'attr', width: 120, render: (ids) => (ids?.length ? <code className="text-[10px] text-slate-500">{ids.slice(0, 2).join('·')}{ids.length > 2 ? '…' : ''}</code> : '—') },
    { title: 'Hoạt động', dataIndex: 'isActive', key: 'a', width: 80, align: 'center', render: (v: boolean) => <span className={v ? 'text-emerald-600 font-medium' : 'text-slate-400'}>{v ? 'Có' : 'Tắt'}</span> },
  ]

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Package className="h-7 w-7" />
        </div>
        <p className="mt-4 text-slate-600">Không có mã sản phẩm.</p>
        <Button type="link" className="mt-2 font-semibold" onClick={() => router.push('/products')}>
          Về danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/95 to-slate-100/90 pb-16 -m-4 px-4 pt-1 sm:px-5 md:-m-6 md:px-6 lg:-m-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <AdminBreadcrumb
          items={[
            { label: 'Quản lý', onClick: () => router.push('/dashboard') },
            { label: 'Sản phẩm', onClick: () => router.push('/products') },
          ]}
          currentPage="Chi tiết"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="text"
              className="inline-flex h-9 items-center gap-2 rounded-lg text-slate-600 hover:!bg-slate-100 hover:!text-slate-900"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/products')}
            >
              Quay lại
            </Button>
          </div>
          {data && !loading && !error && (
            <Button type="primary" className={primaryBtn} icon={<Pencil className="h-3.5 w-3.5" />} onClick={goEdit}>
              Chỉnh sửa
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 py-20 shadow-sm">
            <Spin size="large" />
            <p className="text-sm text-slate-500">Đang tải sản phẩm…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button type="primary" className="rounded-lg" onClick={() => void load()}>
                Thử lại
              </Button>
            </Empty>
          </div>
        ) : !data ? null : (
          <>
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="mx-auto h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200/80 sm:mx-0 sm:h-24 sm:w-24">
                  {data.thumbnailUrl ? (
                    <img
                      src={getFullImagePath(data.thumbnailUrl)}
                      alt={data.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/80 text-slate-300">
                      <ImageOff className="h-9 w-9" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h1 className="text-balance text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-xl">
                        {data.name}
                      </h1>
                      <p className="mt-0.5 break-all font-mono text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                        {data.slug}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                          data.status === 1 && 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
                          data.status === 0 && 'bg-slate-100 text-slate-700 ring-slate-200/80',
                          data.status === 2 && 'bg-amber-50 text-amber-800 ring-amber-200/80',
                          data.status === 3 && 'bg-rose-50 text-rose-800 ring-rose-200/80',
                        )}
                      >
                        {data.statusLabel}
                      </span>
                      {data.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-amber-200/60 sm:text-[11px]">
                          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Nổi bật
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-1.5 sm:mt-2.5 min-[480px]:grid-cols-3">
                    <StatPill
                      compact
                      label="Lượt xem"
                      value={data.viewCount.toLocaleString('vi-VN')}
                      icon={Eye}
                      accent="blue"
                    />
                    <StatPill
                      compact
                      label="Tồn tổng"
                      value={data.variants.reduce((s, v) => s + v.stockQuantity, 0).toLocaleString('vi-VN')}
                      icon={Boxes}
                      accent="emerald"
                    />
                    <StatPill compact label="Biến thể" value={data.variants.length} icon={Layers} accent="violet" />
                  </div>
                </div>
              </div>
            </div>

            <SectionBlock title="Thông tin cơ bản" icon={TagIcon}>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { k: 'Danh mục', v: data.categoryName ?? '—', Ico: Store },
                    { k: 'Thương hiệu', v: data.brandName ?? '—', Ico: Building2 },
                    { k: 'SKU', v: data.sku ?? '—', Ico: Hash },
                    { k: 'Ngày tạo', v: new Date(data.createdAt).toLocaleString('vi-VN'), Ico: Calendar },
                    { k: 'Giá gốc', v: data.basePrice != null ? `${data.basePrice.toLocaleString('vi-VN')}₫` : '—', Ico: Banknote },
                    {
                      k: 'Giá bán',
                      v: data.salePrice != null ? `${data.salePrice.toLocaleString('vi-VN')}₫` : '—',
                      Ico: Banknote,
                      highlight: !!data.salePrice,
                    },
                  ] as const
                ).map((row) => {
                  const { k, v, Ico } = row
                  return (
                    <div
                      key={k}
                      className="flex gap-3 rounded-xl border border-slate-100/90 bg-slate-50/50 px-4 py-3.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100/80">
                        <Ico className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{k}</p>
                        <p
                          className={cn(
                            'mt-0.5 break-words text-slate-900',
                            'highlight' in row && row.highlight && 'text-lg font-bold text-[#1677ff]',
                          )}
                        >
                          {v}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionBlock>

            {(data.shortDescription || data.description) && (
              <SectionBlock title="Mô tả" icon={FileText}>
                {data.shortDescription && (
                  <div className="mb-4">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả ngắn</p>
                    <p className="whitespace-pre-wrap rounded-xl border border-slate-200/60 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-800">
                      {stripHtmlToText(data.shortDescription)}
                    </p>
                  </div>
                )}
                {data.description && (
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả đầy đủ</p>
                    <div
                      className="prose prose-sm max-w-none rounded-xl border border-slate-200/50 bg-white p-4 text-slate-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: data.description }}
                    />
                  </div>
                )}
              </SectionBlock>
            )}

            {data.specifications && (
              <SectionBlock title="Thông số kỹ thuật" icon={Ruler}>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800">{data.specifications}</pre>
              </SectionBlock>
            )}

            <SectionBlock
              title="Biến thể"
              icon={Layers}
              extra={
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {data.variants.length} mục
                </span>
              }
            >
              {data.variants.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200/80">
                  <Table<ProductVariantDto>
                    rowKey="id"
                    dataSource={data.variants}
                    columns={variantColumns}
                    pagination={data.variants.length > 10 ? { pageSize: 10, showSizeChanger: true, size: 'small' } : false}
                    size="small"
                    scroll={{ x: 1200 }}
                    className="[&_.ant-table]:text-[13px] [&_thead_.ant-table-cell]:bg-slate-50/90 [&_thead_.ant-table-cell]:text-xs [&_thead_.ant-table-cell]:font-bold [&_tbody_.ant-table-row]:hover:bg-slate-50/80"
                  />
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có biến thể" />
                </div>
              )}
            </SectionBlock>

            {data.attributes.length > 0 && (
              <SectionBlock title="Thuộc tính" icon={ListTree}>
                <ul className="space-y-4">
                  {data.attributes.map((a) => (
                    <li key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">{a.name}</span>
                        {a.isVariantOption && (
                          <span className="rounded-md bg-violet-100/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-800">
                            Biến thể
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {a.values.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-medium ring-1 ring-slate-200/80"
                            style={
                              v.colorHex
                                ? { backgroundColor: v.colorHex, color: '#fff', border: 'none', boxShadow: '0 1px 0 rgba(0,0,0,.1)' }
                                : { background: '#f8fafc' }
                            }
                          >
                            {v.value}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            )}

            <SectionBlock title="Thư viện ảnh (sản phẩm)" icon={GalleryHorizontal}>
              {data.images.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {data.images.map((img) => (
                    <div key={img.id} className="text-center">
                      <div
                        className={cn(
                          'overflow-hidden rounded-xl ring-1',
                          img.isPrimary ? 'ring-2 ring-[#1677ff] ring-offset-2' : 'ring-slate-200/80',
                        )}
                      >
                        <Image
                          width={128}
                          height={128}
                          className="object-cover"
                          style={{ objectFit: 'cover' }}
                          src={getFullImagePath(img.imageUrl)}
                          alt={img.altText ?? ''}
                        />
                      </div>
                      {img.isPrimary && <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1677ff]">Bìa</p>}
                      {img.altText && <p className="mt-0.5 max-w-[128px] truncate text-xs text-slate-500">{img.altText}</p>}
                    </div>
                  ))}
                </div>
              ) : data.thumbnailUrl ? (
                <div className="space-y-3 text-sm text-slate-600">
                  <p>Chưa có ảnh thư viện — hiển thị ảnh đại diện.</p>
                  <div className="inline-block text-center">
                    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/80">
                      <Image
                        width={120}
                        height={120}
                        className="object-cover"
                        src={getFullImagePath(data.thumbnailUrl)}
                        alt=""
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Ảnh đại diện</p>
                  </div>
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có album / ảnh đại diện" />
              )}
            </SectionBlock>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200/70">
                  <Search className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">SEO &amp; meta</span>
              </div>
              <div className="space-y-2.5 p-3 sm:p-4">
                {(
                  [
                    { key: 'title', field: 'Meta title', value: data.metaTitle },
                    { key: 'desc', field: 'Meta description', value: data.metaDescription },
                    { key: 'kw', field: 'Meta keywords', value: data.metaKeywords },
                  ] as const
                ).map(({ key, field, value }) => {
                  const text = value && String(value).trim() ? String(value) : null
                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-lg border border-slate-200/60 bg-slate-50/30"
                    >
                      <p className="border-b border-slate-200/50 bg-slate-200/30 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                        {field}
                      </p>
                      <p className="px-2.5 py-2 text-sm leading-relaxed text-slate-800">
                        {text ? (
                          <span className="whitespace-pre-wrap break-words">{text}</span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhập</span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="h-2" />
      </div>
    </div>
  )
}
