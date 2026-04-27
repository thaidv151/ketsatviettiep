'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form, Input, Select, Switch, Tabs, InputNumber, Row, Col, Spin, Button, Space, Divider } from 'antd'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/common/ImageUpload'
import { Editor } from '@/components/ui/Editor'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import AdminBreadcrumb from '@/components/common/AdminBreadcrumb'
import type { ProductListDto, CreateProductRequest, UpdateProductRequest, CreateProductAttributeRequest, CreateProductVariantRequest } from '@/services/product.service'
import { productApi } from '@/services/product.service'
import { categoryApi, type CategoryDto } from '@/services/category.service'
import { brandApi, type BrandDto } from '@/services/brand.service'
import { productNameToSlug } from '@/lib/productNameToSlug'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

const inputNumberStyle = { width: '100%' } as const

function newLocalId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

type Props = { mode: 'create' | 'edit'; item: ProductListDto | null; onCancel: () => void; onSuccess: () => void }

type AttributeValueItem = { id: string; value: string; colorHex?: string }
type AttributeFormItem = { id: string; name: string; isVariantOption: boolean; values: AttributeValueItem[] }
type VariantFormItem = {
  id: string
  sku: string
  name?: string
  price: number
  originalPrice?: number
  stockQuantity: number
  lowStockThreshold: number
  weightGram?: number
  /** Ảnh đại diện của biến thể này */
  imageUrl?: string
  /** Ảnh mô tả thêm (theo biến thể); phần tử cuối thường là slot trống để thêm */
  detailImageUrls: string[]
  isActive: boolean
}

export default function ProductCreateOrUpdate({ mode, item, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm()
  const { toast } = useToast()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [attributes, setAttributes] = useState<AttributeFormItem[]>([])
  const [variants, setVariants] = useState<VariantFormItem[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  /** Tên ở lần sinh slug trước — dùng để biết slug hiện tại còn “gắn” với tên cũ thì tự cập nhật khi đổi tên. */
  const nameRefForAutoSlug = useRef('')

  useEffect(() => {
    void categoryApi
      .listForAdminForm()
      .then(setCategories)
      .catch(() => {
        toast({ variant: 'destructive', title: 'Không tải danh sách danh mục' })
        setCategories([])
      })
    void brandApi.list().then(setBrands).catch(() => { toast({ variant: 'destructive', title: 'Không tải thương hiệu' }); setBrands([]) })
  }, [toast])

  useEffect(() => {
    setAttributes([])
    setVariants([])
    setImageUrls([''])
    if (mode === 'create') {
      nameRefForAutoSlug.current = ''
      form.resetFields()
      form.setFieldsValue({ status: 0, isFeatured: false })
      return
    }
    if (!item?.id) return
    let cancelled = false
    setLoadingDetail(true)
    productApi.getDetail(item.id).then(d => {
      if (cancelled) return
      form.setFieldsValue({
        categoryId: d.categoryId, brandId: d.brandId ?? undefined, name: d.name, slug: d.slug,
        sku: d.sku ?? '', shortDescription: d.shortDescription ?? '', description: d.description ?? '',
        basePrice: d.basePrice, salePrice: d.salePrice, thumbnailUrl: d.thumbnailUrl ?? '',
        status: d.status, isFeatured: d.isFeatured,
        metaTitle: d.metaTitle ?? '', metaDescription: d.metaDescription ?? '', metaKeywords: d.metaKeywords ?? '',
      })
      setAttributes(
        d.attributes.map((a) => {
          const raw = a.values ?? []
          // Luôn có ≥1 dòng “giá trị”; nếu server trả `values: []` thì map không render Input,
          // user không nhập được → payload toàn `values: []`.
          const values: AttributeValueItem[] =
            raw.length > 0
              ? raw.map((v) => ({
                  id: v.id,
                  value: v.value,
                  colorHex: v.colorHex ?? undefined,
                }))
              : [{ id: newLocalId(), value: '' }]
          return {
            id: a.id,
            name: a.name,
            isVariantOption: a.isVariantOption,
            values,
          }
        }),
      )
      setVariants(
        d.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name ?? undefined,
          price: v.price,
          originalPrice: v.originalPrice ?? undefined,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold,
          weightGram: v.weightGram ?? undefined,
          imageUrl: v.imageUrl ?? undefined,
          detailImageUrls:
            (v.galleryImageUrls?.length ?? 0) > 0 ? [...(v.galleryImageUrls ?? []), ''] : [''],
          isActive: v.isActive,
        })),
      )
      setImageUrls(d.images.map(i => i.imageUrl).concat(['']))
    }).finally(() => { if (!cancelled) setLoadingDetail(false) })
    return () => { cancelled = true }
  }, [mode, item?.id])

  /** Có nội dung gửi API: tên hiển thị hoặc ít nhất mã màu (#hex) — tránh lọc mất dòng chỉ chọn màu. */
  const attributeValueRowHasContent = (vv: AttributeValueItem) => {
    if (String(vv.value ?? '').trim() !== '') return true
    const h = String(vv.colorHex ?? '')
      .trim()
      .replace(/#/g, '')
    return h.length > 0
  }

  const toCleanAttributeValue = (vv: AttributeValueItem, index: number): CreateProductAttributeRequest['values'][0] => {
    const t = String(vv.value ?? '').trim()
    const rawHex = String(vv.colorHex ?? '').trim()
    const colorHex = rawHex
      ? rawHex.startsWith('#')
        ? rawHex
        : `#${rawHex.replace(/#/g, '')}`
      : null
    // API bắt `value` (text); nếu user chỉ nhập mã màu thì dùng mã/màu làm nhãn lưu DB
    const value = t || (colorHex ?? '')
    return { value, colorHex, sortOrder: index }
  }

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const cleanAttrs: CreateProductAttributeRequest[] = attributes.filter(a => a.name.trim()).map(a => ({
        name: a.name.trim(), isVariantOption: a.isVariantOption, sortOrder: 0,
        values: a.values
          .filter(attributeValueRowHasContent)
          .map((vv, i) => toCleanAttributeValue(vv, i)),
      }))
      const slugBase = String(v.slug ?? 'sp')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'sp'
      const cleanVariants: CreateProductVariantRequest[] = variants.map((vv, index) => {
        const rawSku = vv.sku.trim()
        const autoSku = `${slugBase}-v${index + 1}`.slice(0, 100)
        return {
          sku: (rawSku || autoSku).slice(0, 100),
          name: vv.name?.trim() || null,
          price: Number(vv.price) || 0,
          originalPrice: vv.originalPrice != null && !Number.isNaN(Number(vv.originalPrice)) ? Number(vv.originalPrice) : null,
          stockQuantity: Math.max(0, Math.floor(Number(vv.stockQuantity) || 0)),
          lowStockThreshold:
            Number(vv.lowStockThreshold) > 0 ? Math.floor(Number(vv.lowStockThreshold)) : 5,
          weightGram:
            vv.weightGram != null && !Number.isNaN(Number(vv.weightGram))
              ? Math.floor(Number(vv.weightGram))
              : null,
          isActive: vv.isActive,
          imageUrl: vv.imageUrl?.trim() || null,
          galleryImageUrls: (vv.detailImageUrls ?? []).filter((u) => u.trim()),
          attributeValueIds: [],
        }
      })
      const cleanImages = imageUrls.filter((u) => u.trim())
      if (mode === 'create') {
        const body: CreateProductRequest = {
          categoryId: v.categoryId,
          brandId: v.brandId ?? null,
          name: v.name.trim(),
          slug: v.slug.trim(),
          sku: v.sku?.trim() || null,
          shortDescription: v.shortDescription?.trim() || null,
          description: v.description?.trim() || null,
          basePrice: v.basePrice ?? null,
          salePrice: v.salePrice ?? null,
          thumbnailUrl: v.thumbnailUrl?.trim() || null,
          status: v.status ?? 0,
          isFeatured: v.isFeatured ?? false,
          metaTitle: v.metaTitle?.trim() || null,
          metaDescription: v.metaDescription?.trim() || null,
          metaKeywords: v.metaKeywords?.trim() || null,
          specifications: null,
          attributes: cleanAttrs,
          variants: cleanVariants,
          imageUrls: cleanImages,
        }
        await productApi.create(body)
      } else if (item) {
        const body: UpdateProductRequest = {
          categoryId: v.categoryId, brandId: v.brandId ?? null, name: v.name.trim(), slug: v.slug.trim(),
          sku: v.sku?.trim() || null, shortDescription: v.shortDescription?.trim() || null,
          description: v.description?.trim() || null, basePrice: v.basePrice ?? null, salePrice: v.salePrice ?? null,
          thumbnailUrl: v.thumbnailUrl?.trim() || null, status: v.status ?? 0, isFeatured: v.isFeatured ?? false,
          metaTitle: v.metaTitle?.trim() || null, metaDescription: v.metaDescription?.trim() || null,
          metaKeywords: v.metaKeywords?.trim() || null,
          specifications: null,
          attributes: cleanAttrs, variants: cleanVariants, imageUrls: cleanImages,
        }
        await productApi.update(item.id, body)
      }
      onSuccess()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return // validation error, ignore
      const ax = err as { response?: { data?: { message?: string } } }
      const apiMsg = ax?.response?.data?.message
      toast({ variant: 'destructive', title: typeof apiMsg === 'string' && apiMsg ? apiMsg : 'Có lỗi xảy ra khi lưu sản phẩm' })
    } finally { setSubmitting(false) }
  }

  const addAttribute = useCallback(() => setAttributes((prev) => [...prev, {
    id: newLocalId(),
    name: '',
    isVariantOption: true,
    values: [{ id: newLocalId(), value: '' }],
  }]), [])
  const removeAttribute = useCallback((i: number) => setAttributes((prev) => prev.filter((_, idx) => idx !== i)), [])
  const updateAttr = useCallback((i: number, key: keyof AttributeFormItem, val: unknown) => setAttributes((prev) => prev.map((a, idx) => idx === i ? { ...a, [key]: val } : a)), [])
  const addAttrValue = useCallback((i: number) => setAttributes((prev) => prev.map((a, idx) => idx === i ? { ...a, values: [...a.values, { id: newLocalId(), value: '' }] } : a)), [])
  const removeAttrValue = useCallback((ai: number, vi: number) => setAttributes((prev) => prev.map((a, idx) => idx === ai ? { ...a, values: a.values.filter((_, vidx) => vidx !== vi) } : a)), [])
  const updateAttrValue = useCallback((ai: number, vi: number, key: string, val: string) => setAttributes((prev) => prev.map((a, idx) => idx === ai ? { ...a, values: a.values.map((v, vidx) => vidx === vi ? { ...v, [key]: val } : v) } : a)), [])

  const addVariant = useCallback(() => setVariants((prev) => [...prev, {
    id: newLocalId(),
    sku: '',
    price: 0,
    stockQuantity: 0,
    lowStockThreshold: 5,
    isActive: true,
    detailImageUrls: [''],
  }]), [])

  const updateVariantDetailImage = useCallback((vi: number, di: number, newUrl: string) => {
    setVariants((prev) => prev.map((r, i) => {
      if (i !== vi) return r
      const row = [...(r.detailImageUrls ?? [''])]
      row[di] = newUrl
      return { ...r, detailImageUrls: row }
    }))
  }, [])

  const addVariantDetailImage = useCallback((vi: number) => {
    setVariants((prev) => prev.map((r, i) => (i === vi
      ? { ...r, detailImageUrls: [...(r.detailImageUrls ?? []), ''] }
      : r)))
  }, [])

  const removeVariantDetailImage = useCallback((vi: number, di: number) => {
    setVariants((prev) => prev.map((r, i) => {
      if (i !== vi) return r
      const row = (r.detailImageUrls ?? ['']).filter((_, idx) => idx !== di)
      return { ...r, detailImageUrls: row.length > 0 ? row : [''] }
    }))
  }, [])
  const removeVariant = useCallback((i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i)), [])
  const updateVariant = useCallback((i: number, key: keyof VariantFormItem, val: unknown) => setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v)), [])

  const onFormValuesChange = (changed: Record<string, unknown>) => {
    if (mode !== 'create' || !('name' in changed)) return
    const name = String(changed.name ?? '')
    const currentSlug = (form.getFieldValue('slug') as string | undefined) ?? ''
    const autoFromPrev = productNameToSlug(nameRefForAutoSlug.current)
    if (currentSlug !== '' && currentSlug !== autoFromPrev) {
      nameRefForAutoSlug.current = name
      return
    }
    const nextSlug = productNameToSlug(name)
    nameRefForAutoSlug.current = name
    if (nextSlug === currentSlug) return
    // Tránh cập nhật slug đồng bộ trong onValuesChange — gây re-entrance / cảnh báo vòng tham chiếu (AntD Form)
    queueMicrotask(() => {
      form.setFieldValue('slug', nextSlug)
    })
  }

  const tabItems = useMemo(
    () => [
    {
      key: 'info', label: 'Thông tin chung',
      children: (
        <div className="mt-2">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin cơ bản</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="slug"
                label="Slug"
                help={mode === 'create' ? 'Tạo tự động từ tên; có thể sửa tay' : undefined}
                rules={[{ required: true, message: 'Nhập slug' }]}
              >
                <Input placeholder="ket-sat-mau-d-vt45" className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                <Select showSearch placeholder="Chọn danh mục"
                  options={categories.map(c => ({ value: c.id, label: c.name + (c.parentName ? ` (${c.parentName})` : '') }))}
                  filterOption={(inp, opt) => (opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="brandId" label="Thương hiệu">
                <Select allowClear showSearch placeholder="Chọn thương hiệu"
                  options={brands.map(b => ({ value: b.id, label: b.name }))}
                  filterOption={(inp, opt) => (opt?.label ?? '').toLowerCase().includes(inp.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item name="sku" label="SKU tổng quát"><Input className="rounded-sm" /></Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="basePrice" label="Giá gốc">
                <InputNumber style={inputNumberStyle} className="rounded-sm" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="salePrice" label="Giá bán">
                <InputNumber style={inputNumberStyle} className="rounded-sm" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="thumbnailUrl"
                label="Ảnh đại diện sản phẩm"
                help="Hiển thị chính trên danh sách / trang sản phẩm."
              >
                <ImageUpload placeholder="Tải ảnh đại diện" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="shortDescription" label="Mô tả ngắn">
                <Input.TextArea rows={2} className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả chi tiết">
                <Editor isUploadFile />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select options={[{ value: 0, label: 'Nháp' }, { value: 1, label: 'Đang bán' }, { value: 2, label: 'Hết hàng' }, { value: 3, label: 'Ngừng bán' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="isFeatured" label="Sản phẩm nổi bật" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'variants', label: `Biến thể & Thuộc tính`,
      children: (
        <div className="mt-2 space-y-6">
          {/* Thuộc tính */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Thuộc tính</span>
              <Button size="small" icon={<PlusOutlined />} onClick={addAttribute}>Thêm thuộc tính</Button>
            </div>
            {attributes.map((attr, ai) => (
              <div key={attr.id} className="border border-slate-200 rounded-sm p-4 mb-3 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Input
                    value={attr.name}
                    onChange={e => updateAttr(ai, 'name', e.target.value)}
                    placeholder="Tên thuộc tính (VD: Màu sắc)"
                    className="rounded-sm flex-1"
                    autoComplete="off"
                  />
                  <Switch checkedChildren="Tạo biến thể" unCheckedChildren="Thông số" checked={attr.isVariantOption} onChange={v => updateAttr(ai, 'isVariantOption', v)} />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeAttribute(ai)} />
                </div>
                <div className="space-y-2">
                  {attr.values.map((val, vi) => (
                    <div key={val.id} className="flex items-center gap-2">
                      <Input value={val.value} onChange={e => updateAttrValue(ai, vi, 'value', e.target.value)} placeholder="Giá trị (VD: Đỏ)" className="rounded-sm flex-1" size="small" autoComplete="off" />
                      <Input value={val.colorHex ?? ''} onChange={e => updateAttrValue(ai, vi, 'colorHex', e.target.value)} placeholder="#hex" className="rounded-sm w-24" size="small" autoComplete="off" />
                      {attr.values.length > 1 && (
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeAttrValue(ai, vi)} />
                      )}
                    </div>
                  ))}
                  <Button size="small" type="dashed" icon={<PlusOutlined />} className="w-full" onClick={() => addAttrValue(ai)}>Thêm giá trị</Button>
                </div>
              </div>
            ))}
          </div>

          <Divider />

          {/* Biến thể */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Biến thể</span>
              <Button size="small" icon={<PlusOutlined />} onClick={addVariant}>Thêm biến thể</Button>
            </div>
            {variants.map((v, vi) => (
              <div key={v.id} className="border border-slate-200 rounded-sm p-4 mb-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Biến thể #{vi + 1}</span>
                  <Space>
                    <span className="text-xs text-slate-500">Bán</span>
                    <Switch size="small" checked={v.isActive} onChange={a => updateVariant(vi, 'isActive', a)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeVariant(vi)} />
                  </Space>
                </div>
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={10}>
                    <div className="text-[10px] text-slate-500 mb-0.5">SKU *</div>
                    <Input value={v.sku} onChange={e => updateVariant(vi, 'sku', e.target.value)} placeholder="Mã biến thể" className="rounded-sm" size="small" autoComplete="off" />
                  </Col>
                  <Col xs={24} sm={14}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Tên gợi nhớ (tuỳ chọn)</div>
                    <Input value={v.name ?? ''} onChange={e => updateVariant(vi, 'name', e.target.value)} className="rounded-sm" size="small" autoComplete="off" />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Giá bán *</div>
                    <InputNumber
                      style={inputNumberStyle}
                      value={v.price}
                      onChange={val => updateVariant(vi, 'price', val == null ? 0 : val)}
                      className="rounded-sm"
                      size="small"
                      min={0}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Tồn kho</div>
                    <InputNumber
                      style={inputNumberStyle}
                      value={v.stockQuantity}
                      onChange={val => updateVariant(vi, 'stockQuantity', val == null ? 0 : val)}
                      className="rounded-sm"
                      size="small"
                      min={0}
                      step={1}
                    />
                  </Col>
                </Row>
                <Row gutter={[8, 8]} className="mt-2">
                  <Col xs={24} sm={8}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Giá gốc (gạch so sánh)</div>
                    <InputNumber
                      style={inputNumberStyle}
                      value={v.originalPrice ?? null}
                      onChange={val => updateVariant(vi, 'originalPrice', val == null ? undefined : val)}
                      className="rounded-sm"
                      size="small"
                      min={0}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Cảnh báo tồn thấp (dưới ngưỡng)</div>
                    <InputNumber
                      style={inputNumberStyle}
                      value={v.lowStockThreshold}
                      onChange={val => updateVariant(vi, 'lowStockThreshold', val == null ? 5 : val)}
                      className="rounded-sm"
                      size="small"
                      min={0}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-[10px] text-slate-500 mb-0.5">Cân nặng (g)</div>
                    <InputNumber
                      style={inputNumberStyle}
                      value={v.weightGram ?? null}
                      onChange={val => updateVariant(vi, 'weightGram', val == null ? undefined : val)}
                      className="rounded-sm"
                      size="small"
                      min={0}
                    />
                  </Col>
                </Row>

                <Divider className="!my-3" />
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ảnh biến thể</div>
                <div className="mb-3">
                  <div className="text-[10px] text-slate-500 mb-1">Ảnh đại diện biến thể</div>
                  <ImageUpload
                    value={v.imageUrl ?? ''}
                    onChange={(url) => updateVariant(vi, 'imageUrl', url || undefined)}
                    placeholder="Ảnh đại diện cho biến thể này"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1.5">Ảnh mô tả thêm (theo biến thể này)</div>
                  <div className="space-y-2">
                    {(v.detailImageUrls ?? ['']).map((url, di) => (
                      <div key={`${v.id}-img-${di}`} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <ImageUpload
                            value={url}
                            onChange={(newUrl) => updateVariantDetailImage(vi, di, newUrl)}
                          />
                        </div>
                        {di < (v.detailImageUrls?.length ?? 0) - 1 && (
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeVariantDetailImage(vi, di)}
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      className="w-full"
                      size="small"
                      onClick={() => addVariantDetailImage(vi)}
                    >
                      Thêm ảnh mô tả
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'seo', label: 'SEO & Ảnh',
      children: (
        <div className="mt-2 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">SEO</div>
          <Form.Item name="metaTitle" label="Meta Title"><Input className="rounded-sm" /></Form.Item>
          <Form.Item name="metaDescription" label="Meta Description"><Input.TextArea rows={2} className="rounded-sm" /></Form.Item>
          <Form.Item name="metaKeywords" label="Meta Keywords"><Input className="rounded-sm" placeholder="Từ khóa, cách nhau bởi dấu phẩy" /></Form.Item>
          <Divider />
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Thư viện ảnh mô tả (chung toàn sản phẩm)</div>
          <p className="text-xs text-slate-500 mb-2">Không gồm ảnh từng biến thể — ảnh theo biến thể nhập ở tab Biến thể &amp; Thuộc tính.</p>
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <ImageUpload 
                  value={url} 
                  onChange={newUrl => setImageUrls(prev => prev.map((u, idx) => idx === i ? newUrl : u))} 
                />
                {i < imageUrls.length - 1 && (
                  <Button 
                    size="small" 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} 
                  />
                )}
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} className="w-full" size="small"
              onClick={() => setImageUrls(prev => [...prev, ''])}>Thêm ảnh</Button>
          </div>
        </div>
      )
    },
    ],
    [
      mode,
      categories,
      brands,
      attributes,
      variants,
      imageUrls,
      addAttribute,
      addAttrValue,
      addVariant,
      removeAttribute,
      updateAttr,
      removeAttrValue,
      updateAttrValue,
      removeVariant,
      updateVariant,
      updateVariantDetailImage,
      addVariantDetailImage,
      removeVariantDetailImage,
    ],
  )

  const title = mode === 'create' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'
  const pageLabel = mode === 'create' ? 'Thêm mới' : 'Cập nhật'

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 pb-12 bg-slate-50/50 min-h-screen -mx-4 px-4 sm:px-5 md:-mx-6 md:px-6">
      <AdminBreadcrumb
        items={[{ label: 'Sản phẩm', onClick: onCancel }]}
        currentPage={pageLabel}
      />

      <div className="sticky top-0 z-20 w-full min-w-0 -mx-1 px-1 py-2 sm:py-0 sm:mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 bg-slate-50/95 pb-3 mb-1 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
        <div className="flex min-w-0 items-center gap-2">
          <Button type="text" className="shrink-0" icon={<ArrowLeftOutlined />} onClick={onCancel}>
            Quay lại
          </Button>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight truncate">{title}</span>
        </div>
        <Space className="shrink-0" wrap>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" loading={submitting} onClick={handleOk} className={primaryBtn}>
            Lưu
          </Button>
        </Space>
      </div>

      <div className="w-full min-w-0 max-w-full bg-white border border-slate-200 shadow-sm rounded-sm p-4 sm:p-5 md:p-6 lg:p-8">
        {mode === 'edit' && loadingDetail ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <Form form={form} layout="vertical" onValuesChange={onFormValuesChange}>
            <Tabs items={tabItems} className="product-form-tabs" tabBarGutter={24} size="small" />
            <Divider className="my-6" />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button onClick={onCancel} className="w-full sm:w-auto">Hủy</Button>
              <Button type="primary" loading={submitting} onClick={handleOk} className={`${primaryBtn} w-full sm:w-auto`}>
                Lưu
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
