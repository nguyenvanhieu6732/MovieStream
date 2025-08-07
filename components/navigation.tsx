"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search, Menu, X, Sun, Moon, Film, LogOut, User, Heart
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
import { getImageUrl } from "@/lib/getImageUrl"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OPhimMovie[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const router = useRouter()
  const debouncedQuery = useDebounce(searchQuery, 400)

  useEffect(() => {
    // Auto theme theo hệ điều hành nếu chưa lưu
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      setIsDarkMode(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
      localStorage.setItem("theme", prefersDark ? "dark" : "light")
    }

    // Kiểm tra đăng nhập
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)

    router.prefetch("/search")
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowDropdown(false)
  }

  let blurTimeout: NodeJS.Timeout
  const handleBlur = () => {
    blurTimeout = setTimeout(() => setShowDropdown(false), 150)
  }
  const handleFocus = () => {
    clearTimeout(blurTimeout)
    if (searchResults.length > 0) setShowDropdown(true)
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light"
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
    setIsDarkMode(newTheme === "dark")
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    router.push("/")
  }

  const navLinks = [
    { href: "/genre/drama", label: "Thể Loại" },
    { href: "/genre/drama", label: "Phim Lẻ" },
    { href: "/genre/drama", label: "Phim Bộ" },
    { href: "/search", label: "Quốc Gia" }
  ]

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="mx-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold">MovieStream</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative mx-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="pl-10"
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {showDropdown && searchResults.length > 0 && (
              <SearchDropdown results={searchResults} onClose={() => setShowDropdown(false)} />
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist"><Heart className="mr-2 h-4 w-4" /> Watchlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login"><Button variant="ghost">Đăng Nhập</Button></Link>
                <Link href="/register"><Button>Đăng Ký</Button></Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 py-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="px-2">
                {link.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <>
                <Link href="/login"><Button variant="ghost" className="w-full">Đăng Nhập</Button></Link>
                <Link href="/register"><Button className="w-full">Đăng Ký</Button></Link>
              </>
            ) : (
              <>
                <Link href="/profile"><Button variant="ghost" className="w-full">Profile</Button></Link>
                <Link href="/watchlist"><Button variant="ghost" className="w-full">Watchlist</Button></Link>
                <Button onClick={handleLogout} className="w-full" variant="destructive">Đăng Xuất</Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function SearchDropdown({
  results,
  onClose
}: {
  results: OPhimMovie[]
  onClose: () => void
}) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border z-50 rounded shadow-lg max-h-96 overflow-auto">
      {results.map((movie) => (
        <Link
          key={movie._id}
          href={`/movie/${movie.slug}`}
          onClick={onClose}
          className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-3"
        >
          <Image
            src={getImageUrl(movie.thumb_url)}
            alt={movie.name}
            width={48}
            height={64}
            className="object-cover rounded"
            loading="lazy"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{movie.name}</span>
            <span className="text-xs text-muted-foreground">{movie.year}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
