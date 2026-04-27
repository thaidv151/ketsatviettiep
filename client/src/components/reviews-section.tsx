import { Card } from '@/components/ui/card'

const REVIEWS = [
  {
    id: 1,
    author: 'John Mitchell',
    role: 'Chủ nhà',
    content: 'Chất lượng hoàn thiện và thiết kế tuyệt vời. Dòng Executive Safe Pro đã vượt xa mong đợi của tôi. Rất an toàn và được lắp đặt chuyên nghiệp.',
    rating: 5,
    image: '👤',
  },
  {
    id: 2,
    author: 'Sarah Anderson',
    role: 'Chủ doanh nghiệp',
    content: 'Két sắt việt tiệp đã cung cấp giải pháp hoàn hảo cho văn phòng của chúng tôi. Két sắt Elite chống cháy đã được giao đúng hẹn và đội ngũ của họ lắp đặt rất chuẩn xác.',
    rating: 5,
    image: '👩',
  },
  {
    id: 3,
    author: 'Robert Davis',
    role: 'Đại lý bảo hiểm',
    content: 'Tôi luôn giới thiệu Két sắt việt tiệp cho tất cả khách hàng của mình. Két sắt của họ đáp ứng mọi yêu cầu bảo hiểm và đạt tiêu chuẩn an ninh cao nhất.',
    rating: 5,
    image: '👨',
  },
  {
    id: 4,
    author: 'Lisa Chen',
    role: 'Đại lý bất động sản',
    content: 'Chất lượng và dịch vụ khách hàng từ Két sắt việt tiệp thật tuyệt vời. Mọi chi tiết đều được cân nhắc kỹ lưỡng để đảm bảo an ninh tối đa.',
    rating: 5,
    image: '👩‍🦱',
  },
]

export default function ReviewsSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Được hàng ngàn khách hàng tin tưởng
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lắng nghe những gì khách hàng hài lòng chia sẻ về Két sắt việt tiệp.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review) => (
            <Card
              key={review.id}
              className="p-6 bg-background border-border space-y-4 flex flex-col h-full"
            >
              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-accent text-lg">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                "{review.content}"
              </p>

              {/* Author */}
              <div className="border-t border-border pt-4 flex items-center gap-3">
                <div className="text-2xl">{review.image}</div>
                <div>
                  <p className="font-semibold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
