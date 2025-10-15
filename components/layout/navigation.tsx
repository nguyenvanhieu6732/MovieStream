"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search, Menu, X, Film, LogOut, User, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"

import { useDebounce } from "@/hooks/useDebounce"
import { OPhimMovie } from "@/lib/interface"
import { SearchDropdown } from "../home/SearchDropdown"
import { useSession, signOut } from "next-auth/react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OPhimMovie[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const router = useRouter()
  const debouncedQuery = useDebounce(searchQuery, 400)

  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${debouncedQuery}`)
        const json = await res.json()
        setSearchResults(json.data?.items?.slice(0, 5) || [])
        setShowDropdown(true)
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err)
        setSearchResults([])
        setShowDropdown(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowDropdown(false)
  }, [searchQuery, router])

  let blurTimeout: NodeJS.Timeout
  const handleBlur = () => {
    blurTimeout = setTimeout(() => setShowDropdown(false), 150)
  }
  const handleFocus = () => {
    clearTimeout(blurTimeout)
    if (searchResults.length > 0) setShowDropdown(true)
  }

  const navLinks = [
    { href: "/movies?movieSlug=tv-show", label: "tv-show" },
    { href: "/movies?movieSlug=phim-le", label: "Phim Lẻ" },
    { href: "/movies?movieSlug=phim-bo", label: "Phim Bộ" },
    { href: "/movies?movieSlug=hoat-hinh", label: "Hoạt Hình" },
    { href: "/movies?movieSlug=phim-chieu-rap", label: "Chiếu Rạp" },
    { href: "/search", label: "Tìm kiếm" }
  ]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[1000] transition-colors duration-500 min-h-[64px]
        ${scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-gray-800"
          : "bg-transparent"
        }`}
    >
      <div className="nav-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold">MovieStream</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative mx-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="pl-10 bg-gray-800 rounded-xl bg-gray-800/60 border border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {showDropdown && searchResults.length > 0 && (
              <SearchDropdown results={searchResults} onClose={() => setShowDropdown(false)} />
            )}
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center nav-actions">
            {session?.user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="dropdown-menu-trigger">
                  <Avatar className="h-10 w-10 mx-4 cursor-pointer avatar flex items-center justify-center">
                    <AvatarImage src={session?.user?.image ?? "/placeholder.svg"} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} alignOffset={-4} className="dropdown-menu-content">
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist"><Heart className="mr-2 h-4 w-4" /> Watchlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2 mr-4">
                <Link href="/login"><Button variant="ghost">Đăng Nhập</Button></Link>
                <Link href="/register"><Button>Đăng Ký</Button></Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden mobile-menu-toggle" onClick={() => setIsMenuOpen(prev => !prev)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 py-2">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} className="px-2">
                {label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link href="/profile"><Button variant="ghost" className="w-full">Profile</Button></Link>
                <Link href="/watchlist"><Button variant="ghost" className="w-full">Watchlist</Button></Link>
                <Button onClick={() => signOut()} className="w-full" variant="destructive">Đăng Xuất</Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin"><Button variant="ghost" className="w-full">Đăng Nhập</Button></Link>
                <Link href="/register"><Button className="w-full">Đăng Ký</Button></Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}