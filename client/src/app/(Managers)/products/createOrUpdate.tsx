'use client'
import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Tabs, InputNumber, Row, Col, Spin, Button, Space, Divider, message } from 'antd'
import ImageUpload from '@/components/common/ImageUpload'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ProductListDto, CreateProductRequest, UpdateProductRequest, CreateProductAttributeRequest, CreateProductVariantRequest } from '@/services/product.service'
import { productApi } from '@/services/product.service'
import { categoryApi, type CategoryDto } from '@/services/category.service'
import { brandApi, type BrandDto } from '@/services/brand.service'

const primaryBtn = 'bg-[#1677ff] hover:bg-[#0958d9] border-[#1677ff]'

type Props = { open: boolean; mode: 'create' | 'edit'; item: ProductListDto | null; onClose: () => void; onSuccess: () => void }

type AttributeFormItem = { name: string; isVariantOption: boolean; values: { value: string; colorHex?: string }[] }
type VariantFormItem = { sku: string; name?: string; price: number; originalPrice?: number; stockQuantity: number; imageUrl?: string; isActive: boolean }

export default function ProductCreateOrUpdate({ open, mode, item, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [attributes, setAttributes] = useState<AttributeFormItem[]>([])
  const [variants, setVariants] = useState<VariantFormItem[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  useEffect(() => {
    void categoryApi.list().then(setCategories).catch(() => { })
    void brandApi.list().then(setBrands).catch(() => { })
  }, [])

  useEffect(() => {
    if (!open) return
    setAttributes([])
    setVariants([])
    setImageUrls([''])
    if (mode === 'create') { form.resetFields(); form.setFieldsValue({ status: 0, isFeatured: false }); return }
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
      setAttributes(d.attributes.map(a => ({ name: a.name, isVariantOption: a.isVariantOption, values: a.values.map(v => ({ value: v.value, colorHex: v.colorHex ?? undefined })) })))
      setVariants(d.variants.map(v => ({ sku: v.sku, name: v.name ?? undefined, price: v.price, originalPrice: v.originalPrice ?? undefined, stockQuantity: v.stockQuantity, imageUrl: v.imageUrl ?? undefined, isActive: v.isActive })))
      setImageUrls(d.images.map(i => i.imageUrl).concat(['']))
    }).finally(() => { if (!cancelled) setLoadingDetail(false) })
    return () => { cancelled = true }
  }, [open, mode, item?.id, form])

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      setSubmitting(true)
      const cleanAttrs: CreateProductAttributeRequest[] = attributes.filter(a => a.name.trim()).map(a => ({
        name: a.name.trim(), isVariantOption: a.isVariantOption, sortOrder: 0,
        values: a.values.filter(vv => vv.value.trim()).map((vv, i) => ({ value: vv.value.trim(), colorHex: vv.colorHex || null, sortOrder: i })),
      }))
      const cleanVariants: CreateProductVariantRequest[] = variants.filter(vv => vv.sku.trim()).map(vv => ({
        sku: vv.sku.trim(), name: vv.name || null, price: vv.price, originalPrice: vv.originalPrice ?? null,
        stockQuantity: vv.stockQuantity, isActive: vv.isActive,
        imageUrl: vv.imageUrl || null, attributeValueIds: [],
      }))
      const cleanImages = imageUrls.filter(u => u.trim())

      if (mode === 'create') {
        const body: CreateProductRequest = {
          categoryId: v.categoryId, brandId: v.brandId ?? null, name: v.name.trim(), slug: v.slug.trim(),
          sku: v.sku?.trim() || null, shortDescription: v.shortDescription?.trim() || null,
          description: v.description?.trim() || null, basePrice: v.basePrice ?? null, salePrice: v.salePrice ?? null,
          thumbnailUrl: v.thumbnailUrl?.trim() || null, status: v.status ?? 0, isFeatured: v.isFeatured ?? false,
          metaTitle: v.metaTitle?.trim() || null, metaDescription: v.metaDescription?.trim() || null,
          metaKeywords: v.metaKeywords?.trim() || null, attributes: cleanAttrs, variants: cleanVariants, imageUrls: cleanImages,
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
        }
        await productApi.update(item.id, body)
      }
      onSuccess(); onClose()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return // validation error, ignore
      message.error('Có lỗi xảy ra')
    } finally { setSubmitting(false) }
  }

  const addAttribute = () => setAttributes(prev => [...prev, { name: '', isVariantOption: true, values: [{ value: '' }] }])
  const removeAttribute = (i: number) => setAttributes(prev => prev.filter((_, idx) => idx !== i))
  const updateAttr = (i: number, key: keyof AttributeFormItem, val: unknown) => setAttributes(prev => prev.map((a, idx) => idx === i ? { ...a, [key]: val } : a))
  const addAttrValue = (i: number) => setAttributes(prev => prev.map((a, idx) => idx === i ? { ...a, values: [...a.values, { value: '' }] } : a))
  const removeAttrValue = (ai: number, vi: number) => setAttributes(prev => prev.map((a, idx) => idx === ai ? { ...a, values: a.values.filter((_, vidx) => vidx !== vi) } : a))
  const updateAttrValue = (ai: number, vi: number, key: string, val: string) => setAttributes(prev => prev.map((a, idx) => idx === ai ? { ...a, values: a.values.map((v, vidx) => vidx === vi ? { ...v, [key]: val } : v) } : a))

  const addVariant = () => setVariants(prev => [...prev, { sku: '', price: 0, stockQuantity: 0, isActive: true }])
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, key: keyof VariantFormItem, val: unknown) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [key]: val } : v))

  const tabItems = [
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
              <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Nhập slug' }]}>
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
            <Col xs={24} md={8}>
              <Form.Item name="sku" label="SKU tổng quát"><Input className="rounded-sm" /></Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="basePrice" label="Giá gốc">
                <InputNumber className="w-full rounded-sm" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="salePrice" label="Giá bán">
                <InputNumber className="w-full rounded-sm" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="thumbnailUrl" label="Ảnh đại diện (Thumbnail)">
                <ImageUpload placeholder="Tải ảnh Thumbnail" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="shortDescription" label="Mô tả ngắn">
                <Input.TextArea rows={2} className="rounded-sm" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả chi tiết">
                <Input.TextArea rows={4} className="rounded-sm" />
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
              <div key={ai} className="border border-slate-200 rounded-sm p-4 mb-3 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Input value={attr.name} onChange={e => updateAttr(ai, 'name', e.target.value)} placeholder="Tên thuộc tính (VD: Màu sắc)" className="rounded-sm flex-1" />
                  <Switch checkedChildren="Tạo biến thể" unCheckedChildren="Thông số" checked={attr.isVariantOption} onChange={v => updateAttr(ai, 'isVariantOption', v)} />
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeAttribute(ai)} />
                </div>
                <div className="space-y-2">
                  {attr.values.map((val, vi) => (
                    <div key={vi} className="flex items-center gap-2">
                      <Input value={val.value} onChange={e => updateAttrValue(ai, vi, 'value', e.target.value)} placeholder="Giá trị (VD: Đỏ)" className="rounded-sm flex-1" size="small" />
                      <Input value={val.colorHex ?? ''} onChange={e => updateAttrValue(ai, vi, 'colorHex', e.target.value)} placeholder="#hex" className="rounded-sm w-24" size="small" />
                      {vi > 0 && <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeAttrValue(ai, vi)} />}
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
              <div key={vi} className="border border-slate-200 rounded-sm p-4 mb-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Biến thể #{vi + 1}</span>
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeVariant(vi)} />
                </div>
                <Row gutter={[8, 0]}>
                  <Col xs={12} md={8}><Input value={v.sku} onChange={e => updateVariant(vi, 'sku', e.target.value)} placeholder="SKU *" className="rounded-sm" size="small" /></Col>
                  <Col xs={12} md={8}><Input value={v.name ?? ''} onChange={e => updateVariant(vi, 'name', e.target.value)} placeholder="Tên biến thể" className="rounded-sm" size="small" /></Col>
                  <Col xs={12} md={4}><InputNumber value={v.price} onChange={val => updateVariant(vi, 'price', val ?? 0)} placeholder="Giá *" className="w-full rounded-sm" size="small" min={0} /></Col>
                  <Col xs={12} md={4}><InputNumber value={v.stockQuantity} onChange={val => updateVariant(vi, 'stockQuantity', val ?? 0)} placeholder="Tồn kho" className="w-full rounded-sm" size="small" min={0} /></Col>
                </Row>
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
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Thư viện ảnh</div>
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
    }
  ]

  return (
    <Modal title={<span className="font-extrabold text-slate-800">{mode === 'create' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'}</span>}
      open={open} onCancel={onClose} onOk={handleOk} confirmLoading={submitting}
      width={900} okText="Lưu" cancelText="Hủy" okButtonProps={{ className: primaryBtn }} destroyOnHidden>
      {mode === 'edit' && loadingDetail ? <div className="flex justify-center py-16"><Spin /></div> : (
        <Form form={form} layout="vertical">
          <Tabs items={tabItems} />
        </Form>
      )}
    </Modal>
  )
}
