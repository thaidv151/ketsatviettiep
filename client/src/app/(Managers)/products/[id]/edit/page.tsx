'use client'

import { useRouter, useParams } from 'next/navigation'
import { Empty, Button } from 'antd'
import { useToast } from '@/hooks/use-toast'
import ProductCreateOrUpdate from '../../createOrUpdate'
import type { ProductListDto } from '@/services/product.service'

function stubListRow(id: string): ProductListDto {
  return {
    id,
    name: '',
    slug: '',
    categoryName: null,
    brandName: null,
    thumbnailUrl: null,
    basePrice: null,
    salePrice: null,
    totalStock: 0,
    status: 0,
    statusLabel: '',
    isFeatured: false,
    createdAt: new Date(0).toISOString(),
  }
}

export default function EditProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  if (!id) {
    return (
      <div className="p-8">
        <Empty description="Không có mã sản phẩm" />
        <Button type="link" onClick={() => router.push('/products')}>
          Về danh sách
        </Button>
      </div>
    )
  }

  return (
    <ProductCreateOrUpdate
      mode="edit"
      item={stubListRow(id)}
      onCancel={() => router.push('/products')}
      onSuccess={() => {
        toast({ variant: 'success', title: 'Đã cập nhật sản phẩm' })
        router.push(`/products/${id}`)
      }}
    />
  )
}
