'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  UserCircle,
  LogOut,
  LogIn,
  User,
  IdCard,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function UserMenuBar() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { UserInfo, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loginUrl = `/dang-nhap?redirect=${encodeURIComponent(pathname)}`
  const user = UserInfo?.user
  const displayName = (user?.fullName?.trim() || user?.username?.trim() || user?.email || 'Tài khoản') as string
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    router.push('/')
    router.refresh()
  }

  if (!mounted) {
    return <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted/60" aria-hidden />
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-md p-2 text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tài khoản — chưa đăng nhập"
          >
            <UserCircle className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={loginUrl} className="cursor-pointer">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dang-ky" className="cursor-pointer">
              <User className="h-4 w-4" />
              Đăng ký
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex max-w-full items-center gap-1.5 rounded-md p-1.5 text-left text-sm transition hover:bg-muted',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2 sm:pr-2',
          )}
          aria-label={`Đã đăng nhập: ${displayName}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary sm:h-8 sm:w-8 sm:text-sm">
            {initial}
          </span>
          <span className="hidden min-w-0 max-w-[9rem] truncate font-medium text-foreground sm:inline md:max-w-[12rem]">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold leading-tight text-foreground">{displayName}</p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground" title={user.email}>
                {user.email}
              </p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/tai-khoan" className="cursor-pointer">
            <IdCard className="h-4 w-4" />
            Thông tin cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/don-hang" className="cursor-pointer">
            Đơn hàng của tôi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            handleLogout()
          }}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname() || '/'
  const loginUrl = `/dang-nhap?redirect=${encodeURIComponent(pathname)}`
  const { UserInfo, logout } = useAuth()
  const router = useRouter()
  const user = UserInfo?.user

  const updateCartCount = () => {
    const saved = localStorage.getItem('ketsat_cart')
    if (saved) {
      try {
        const cart = JSON.parse(saved)
        const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(total)
      } catch (e) {
        setCartCount(0)
      }
    } else {
      setCartCount(0)
    }
  }

  useEffect(() => {
    updateCartCount()
    window.addEventListener('cart-updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="hidden text-lg font-semibold text-foreground sm:inline">Két sắt việt tiệp</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/san-pham" className="text-foreground transition hover:text-accent">
              Sản phẩm
            </Link>
            <Link href="/don-hang" className="text-foreground transition hover:text-accent">
              Đơn hàng
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <button
              type="button"
              className="rounded-md p-2 transition hover:bg-muted"
              aria-label="Tìm kiếm (sắp có)"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
            <Link
              href="/san-pham-yeu-thich"
              className="relative rounded-md p-2 transition hover:bg-muted"
            >
              <Heart className="h-5 w-5 text-foreground" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
            </Link>
            <Link href="/gio-hang" className="relative rounded-md p-2 transition hover:bg-muted">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <UserMenuBar />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 transition hover:bg-muted md:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-0 space-y-1 border-t border-border pb-4 pt-3 md:hidden">
            <Link
              href="/san-pham"
              className="block rounded-md py-2 text-foreground transition hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link
              href="/don-hang"
              className="block rounded-md py-2 text-foreground transition hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Đơn hàng
            </Link>
            {!user ? (
              <>
                <Link
                  href={loginUrl}
                  className="block rounded-md py-2 text-foreground transition hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className="block rounded-md py-2 text-foreground transition hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/tai-khoan"
                  className="block rounded-md py-2 text-foreground transition hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <button
                  type="button"
                  className="w-full py-2 text-left text-destructive"
                  onClick={() => {
                    logout()
                    router.push('/')
                    setIsMenuOpen(false)
                  }}
                >
                  Đăng xuất
                </button>
              </>
            )}
            <Link
              href="/"
              className="block rounded-md py-2 text-foreground transition hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Giới thiệu
            </Link>
            <Link
              href="/"
              className="block rounded-md py-2 text-foreground transition hover:text-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Liên hệ
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
