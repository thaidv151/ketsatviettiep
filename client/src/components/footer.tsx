import Link from 'next/link'

const iconClass = 'h-5 w-5 flex-shrink-0'

function XIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.804v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.914-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.68-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.645.07-4.85.07-3.204 0-3.586-.016-4.86-.07-1.17-.055-1.805-.25-2.224-.414-.56-.22-.97-.48-1.38-.9-.42-.42-.69-.826-.9-1.38-.165-.42-.36-1.065-.42-2.235-.06-1.28-.07-1.65-.07-4.85 0-3.204.013-3.585.07-4.85.05-1.17.25-1.81.42-2.24.22-.57.48-.96.9-1.38.42-.42.82-.69 1.38-.9.42-.16 1.05-.35 2.22-.42 1.275-.05 1.65-.07 4.86-.07zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.44 1.44-1.44.793-.001 1.44.646 1.44 1.44z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

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
              <span className="font-semibold text-lg">Két sắt việt tiệp</span>
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
          <p className="text-sm opacity-80">
            &copy; 2026 Két sắt việt tiệp. Mọi quyền được bảo lưu.
          </p>
          <ul className="flex list-none items-center gap-1 p-0" role="list" aria-label="Mạng xã hội">
            <li>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground/85 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <XIcon />
              </a>
            </li>
            <li>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground/85 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <FacebookIcon />
              </a>
            </li>
            <li>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground/85 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <InstagramIcon />
              </a>
            </li>
            <li>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground/85 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <LinkedinIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
