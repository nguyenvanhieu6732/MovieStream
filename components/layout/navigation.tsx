"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
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
import { SearchDropdown } from "../home/SearchDropdown"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OPhimMovie[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const router = useRouter()
  const debouncedQuery = useDebounce(searchQuery, 400)

  // Prefetch và setup theme, login
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const currentTheme = savedTheme || (prefersDark ? "dark" : "light")
    document.documentElement.classList.toggle("dark", currentTheme === "dark")
    setIsDarkMode(currentTheme === "dark")
    localStorage.setItem("theme", currentTheme)

    setIsLoggedIn(!!localStorage.getItem("user"))
    router.prefetch("/search")
  }, [router])

  // Theo dõi scroll để đổi màu navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Gợi ý tìm kiếm
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

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark"
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
    { href: "/search", label: "Tv-Shows" },
    { href: "/search", label: "Quốc Gia" },
    { href: "/search", label: "Bộ Lọc" }
  ]

  // ===== RENDER =====

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 
        ${scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-gray-800"
          : "bg-transparent"
        }`}
    >
      <div className="px-4">
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
              className=" pl-10 bg-gray-800 rounded-xl bg-gray-800/60 border border-gray-700"
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
          <div className="flex items-center space-x-2">
            {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button> */}

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
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(prev => !prev)}>
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
            {isLoggedIn ? (
              <>
                <Link href="/profile"><Button variant="ghost" className="w-full">Profile</Button></Link>
                <Link href="/watchlist"><Button variant="ghost" className="w-full">Watchlist</Button></Link>
                <Button onClick={handleLogout} className="w-full" variant="destructive">Đăng Xuất</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" className="w-full">Đăng Nhập</Button></Link>
                <Link href="/register"><Button className="w-full">Đăng Ký</Button></Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
