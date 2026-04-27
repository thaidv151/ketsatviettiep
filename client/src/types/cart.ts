/** Dòng giỏ hàng lưu localStorage; `slug` dùng cho URL /san-pham/{slug} */
export type CartLine = {
  id: string
  slug: string
  name: string
  price: number
  quantity: number
  image: string | null
  category: string | null
  /** Có khi mua 1 `ProductVariant` (mã hàng / phân loại). */
  variantId?: string | null
  /** Nhãn hiển thị: màu · size, hoặc tên mã, hoặc SKU. */
  variantLabel?: string | null
  /** Mã SKU trên hệ thống — giúp phân biệt rõ với tên. */
  variantSku?: string | null
}

export function cartLineKey(c: CartLine) {
  return `${c.id}::${c.variantId ?? ''}`
}
