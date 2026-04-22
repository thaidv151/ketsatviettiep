'use client'

import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

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
    // Also listen to storage events (for multiple tabs)
    window.addEventListener('storage', updateCartCount)
    
    return () => {
      window.removeEventListener('cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:inline">SafeVault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/san-pham" className="text-foreground hover:text-accent transition">
              Sản phẩm
            </Link>
            <Link href="/san-pham" className="text-foreground hover:text-accent transition">
              Danh mục
            </Link>
            <Link href="/" className="text-foreground hover:text-accent transition">
              Giới thiệu
            </Link>
            <Link href="/" className="text-foreground hover:text-accent transition">
              Liên hệ
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-md transition">
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/san-pham-yeu-thich" className="p-2 hover:bg-muted rounded-md transition relative">
              <Heart className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </Link>
            <Link href="/gio-hang" className="p-2 hover:bg-muted rounded-md transition relative">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md transition"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3">
            <Link href="/san-pham" className="block text-foreground hover:text-accent transition py-2">
              Sản phẩm
            </Link>
            <Link href="/san-pham" className="block text-foreground hover:text-accent transition py-2">
              Danh mục
            </Link>
            <Link href="/" className="block text-foreground hover:text-accent transition py-2">
              Giới thiệu
            </Link>
            <Link href="/" className="block text-foreground hover:text-accent transition py-2">
              Liên hệ
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
