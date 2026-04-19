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
              Premium security safes for homes and businesses.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Home Safes
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Office Safes
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Fireproof Safes
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:opacity-100 transition">
                  Digital Safes
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm opacity-80">
            &copy; 2024 SafeVault. All rights reserved.
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
