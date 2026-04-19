'use client'

import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              Products
            </Link>
            <Link href="/san-pham" className="text-foreground hover:text-accent transition">
              Categories
            </Link>
            <Link href="/" className="text-foreground hover:text-accent transition">
              About
            </Link>
            <Link href="/" className="text-foreground hover:text-accent transition">
              Contact
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
              <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">0</span>
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
              Products
            </Link>
            <Link href="/san-pham" className="block text-foreground hover:text-accent transition py-2">
              Categories
            </Link>
            <Link href="/" className="block text-foreground hover:text-accent transition py-2">
              About
            </Link>
            <Link href="/" className="block text-foreground hover:text-accent transition py-2">
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
