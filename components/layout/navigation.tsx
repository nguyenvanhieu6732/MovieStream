"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Heart, LogOut, Menu, Search, Settings, User, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { OPhimMovie } from "@/lib/interface"
import { SearchDropdown } from "../home/SearchDropdown"
import { ImageWithLoader } from "@/components/ui/image-with-loader"

const navLinks = [
  { label: "❤", popup: true },
  { href: "/movies?movieSlug=tv-show", label: "tv-show" },
  { href: "/movies?movieSlug=phim-le", label: "Phim Lẻ" },
  { href: "/movies?movieSlug=phim-bo", label: "Phim Bộ" },
  { href: "/movies?movieSlug=hoat-hinh", label: "Hoạt Hình" },
  { href: "/movies?movieSlug=phim-chieu-rap", label: "Chiếu Rạp" },
  { href: "/search", label: "Tìm kiếm" },
]

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OPhimMovie[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const router = useRouter()
  const debouncedQuery = useDebounce(searchQuery, 400)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: session } = useSession()

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const controller = new AbortController()
    const fetchResults = async () => {
      try {
        const res = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${debouncedQuery}`, {
          signal: controller.signal,
        })
        const json = await res.json()
        setSearchResults(json.data?.items?.slice(0, 5) || [])
        setShowDropdown(true)
      } catch (err) {
        if (controller.signal.aborted) return
        console.error("Lỗi tìm kiếm:", err)
        setSearchResults([])
        setShowDropdown(false)
      }
    }

    fetchResults()
    return () => controller.abort()
  }, [debouncedQuery])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const query = searchQuery.trim()
      if (!query) return
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowDropdown(false)
    },
    [searchQuery, router]
  )

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setShowDropdown(false), 150)
  }

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
    if (searchResults.length > 0) setShowDropdown(true)
  }

  return (
    <>
      <nav
        className={`
        fixed top-0 left-0 w-full z-[1000]
        transition-colors duration-300
        min-h-[64px]
        text-white
        ${scrolled || isMenuOpen ? "glass-panel border-b border-white/10" : "bg-transparent"}
        `}
      >
        <div className="nav-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <Image src="/logo.png" alt="MovieStream Logo" width={64} height={64} />
              <span className="text-xl font-bold">MovieStream</span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative mx-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                type="search"
                placeholder="Tìm kiếm phim..."
                className="pl-10 rounded-xl border-white/15 bg-slate-950/45"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />

              {showDropdown && searchResults.length > 0 && (
                <SearchDropdown results={searchResults} onClose={() => setShowDropdown(false)} />
              )}
            </form>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((item, i) =>
                item.popup ? (
                  <button key={i} onClick={() => setShowPopup(true)} className="hover:text-gray-300">
                    {item.label}
                  </button>
                ) : (
                  <Link key={i} href={item.href!}>
                    {item.label}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center nav-actions">
              {session?.user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild className="dropdown-menu-trigger">
                    <Avatar className="h-10 w-10 mx-4 cursor-pointer avatar flex items-center justify-center">
                      <AvatarImage src={session?.user?.image ?? "/placeholder.svg"} />
                      <AvatarFallback>{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" sideOffset={8} alignOffset={-4}>
                    {session.user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/system">
                          <Settings className="mr-2 h-4 w-4" />
                          Hệ Thống
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Hồ Sơ
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/watchlist">
                        <Heart className="mr-2 h-4 w-4" />
                        Xem Sau
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2 mr-4">
                  <Link href="/login">
                    <Button variant="ghost">Đăng Nhập</Button>
                  </Link>

                  <Link href="/register">
                    <Button>Đăng Ký</Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mobile-menu-toggle"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="glass-panel md:hidden fixed top-16 left-0 w-full flex flex-col space-y-2 py-4 px-4 border-t border-white/10">
              {navLinks.map((item, i) =>
                item.popup ? (
                  <button
                    key={i}
                    onClick={() => {
                      setShowPopup(true)
                      setIsMenuOpen(false)
                    }}
                    className="text-left px-2"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link key={i} href={item.href!} onClick={() => setIsMenuOpen(false)} className="px-2">
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </nav>

      {showPopup && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]"
          onClick={() => setShowPopup(false)}
        >
          <div className="glass-panel relative rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-white text-xl" onClick={() => setShowPopup(false)}>
              ✕
            </button>

            <ImageWithLoader src="/bac.jpg" alt="❤" width={400} height={400} className="rounded-lg" />
          </div>
        </div>
      )}
    </>
  )
}
