'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import ProductCreateOrUpdate from '../createOrUpdate'

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  return (
    <ProductCreateOrUpdate
      mode="create"
      item={null}
      onCancel={() => router.push('/products')}
      onSuccess={() => {
        toast({ variant: 'success', title: 'Đã thêm sản phẩm' })
        router.push('/products')
      }}
    />
  )
}
