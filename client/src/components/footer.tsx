import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-foreground rounded-sm flex items-center justify-center">
                <span className="text-primary font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-lg">SafeVault</span>
            </div>
            <p className="text-sm opacity-80">
              Két sắt bảo mật cao cấp cho gia đình và doanh nghiệp.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Két sắt gia đình
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Két sắt văn phòng
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Két sắt chống cháy
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Két sắt điện tử
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Đổi trả
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm opacity-80">
            &copy; 2024 SafeVault. Mọi quyền được bảo lưu.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              Twitter
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              Facebook
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              Instagram
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
