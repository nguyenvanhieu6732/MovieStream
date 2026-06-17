"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Heart, LogOut, Menu, Search, Settings, User, X } from "lucide-react"
import { motion } from "framer-motion"
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
  { label: "Yêu thích", popup: true },
  { href: "/movies?movieSlug=tv-show", label: "TV Show" },
  { href: "/movies?movieSlug=phim-le", label: "Phim Lẻ" },
  { href: "/movies?movieSlug=phim-bo", label: "Phim Bộ" },
  { href: "/movies?movieSlug=hoat-hinh", label: "Hoạt Hình" },
  { href: "/movies?movieSlug=phim-chieu-rap", label: "Chiếu Rạp" },
  { href: "/search", label: "Tìm kiếm" },
]

const accountMenuItemClass =
  "rounded-[0.9rem] px-3 py-2.5 text-[0.95rem] font-semibold text-white outline-none transition-colors hover:bg-white/10 focus:bg-white/10 data-[highlighted]:bg-white/10 data-[highlighted]:text-white"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<OPhimMovie[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const router = useRouter()
  const debouncedQuery = useDebounce(searchQuery, 400)
  const searchFormRef = useRef<HTMLFormElement | null>(null)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ left: number; top: number; width: number } | null>(null)
  const { data: session } = useSession()

  const closeMenu = () => setIsMenuOpen(false)
  const updateDropdownPosition = useCallback(() => {
    const rect = searchFormRef.current?.getBoundingClientRect()
    if (!rect) return
    setDropdownPosition({
      left: rect.left,
      top: rect.bottom + 12,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!showDropdown) return

    updateDropdownPosition()
    window.addEventListener("scroll", updateDropdownPosition, { passive: true })
    window.addEventListener("resize", updateDropdownPosition)

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition)
      window.removeEventListener("resize", updateDropdownPosition)
    }
  }, [showDropdown, updateDropdownPosition])

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
    updateDropdownPosition()
    if (searchResults.length > 0) setShowDropdown(true)
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 130, damping: 24 }}
        className="fixed left-0 right-0 top-4 z-[1000] px-3 text-white md:px-6"
      >
        <div
          className={`spatial-container rounded-[1.75rem] px-3 md:px-5 ${
            scrolled || isMenuOpen ? "glass-panel" : "border border-white/8 bg-black/10 backdrop-blur-xl"
          }`}
        >
          <div className="flex h-[68px] items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-3" onClick={closeMenu}>
              <Image src="/logo.png" alt="MovieStream Logo" width={46} height={46} className="rounded-2xl shadow-[0_14px_34px_rgba(0,0,0,0.32)] transition-transform duration-300 group-hover:scale-105" />
              <span className="text-lg font-semibold tracking-tight md:text-xl">MovieStream</span>
            </Link>

            <form ref={searchFormRef} onSubmit={handleSearch} className="relative z-[1300] mx-2 hidden max-w-[26rem] flex-1 isolate md:flex">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/54" />

              <Input
                type="search"
                placeholder="Tìm kiếm phim..."
                className="relative z-10 h-11 rounded-[1.4rem] pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />

              {showDropdown && searchResults.length > 0 && dropdownPosition && (
                <SearchDropdown
                  results={searchResults}
                  onClose={() => setShowDropdown(false)}
                  position={dropdownPosition}
                />
              )}
            </form>

            <div className="hidden items-center gap-1 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-1 md:flex">
              {navLinks.map((item, i) =>
                item.popup ? (
                  <button
                    key={i}
                    onClick={() => setShowPopup(true)}
                    className="inline-flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm text-white/76 hover:bg-white/10 hover:text-white"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </button>
                ) : (
                  <Link key={i} href={item.href!} className="rounded-[1.1rem] px-3 py-2 text-sm font-medium text-white/76 hover:bg-white/10 hover:text-white">
                    {item.label}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center nav-actions">
              {session?.user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild className="dropdown-menu-trigger">
                    <Avatar className="avatar mx-2 flex h-11 w-11 cursor-pointer items-center justify-center border border-white/16 bg-white/10 shadow-[0_16px_38px_rgba(0,0,0,0.28)]">
                      <AvatarImage src={session?.user?.image ?? "/placeholder.svg"} />
                      <AvatarFallback>{session?.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    alignOffset={-6}
                    className="min-w-[9.5rem] rounded-[1.35rem] border border-white/10 bg-[#020817]/95 p-2 text-white shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl"
                  >
                    {session.user.role === "admin" && (
                      <DropdownMenuItem asChild className={accountMenuItemClass}>
                        <Link href="/system">
                          <Settings className="mr-2 h-4 w-4 text-white" />
                          Hệ Thống
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild className={accountMenuItemClass}>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4 text-white" />
                        Hồ Sơ
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className={accountMenuItemClass}>
                      <Link href="/watchlist">
                        <Heart className="mr-2 h-4 w-4 text-white" />
                        Xem Sau
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={accountMenuItemClass}
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4 text-white" />
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="mr-1 hidden items-center gap-2 md:flex">
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
                className="mobile-menu-toggle md:hidden"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="glass-panel fixed left-4 right-4 top-[96px] z-[1200] flex max-h-[calc(100dvh-120px)] flex-col gap-2 overflow-y-auto rounded-[1.75rem] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.5)] md:hidden"
        >
          {navLinks.map((item, i) =>
            item.popup ? (
              <button
                key={i}
                onClick={() => {
                  setShowPopup(true)
                  setIsMenuOpen(false)
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/82 hover:bg-white/10"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={i}
                href={item.href!}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white/82 hover:bg-white/10"
              >
                {item.label}
              </Link>
            )
          )}

          {!session?.user && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">Đăng Nhập</Button>
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Đăng Ký</Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {showPopup && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
          onClick={() => setShowPopup(false)}
        >
          <div className="glass-panel relative rounded-[2rem] p-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white hover:bg-white/12" onClick={() => setShowPopup(false)} aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>

            <ImageWithLoader src="/bac.jpg" alt="Danh sách phim yêu thích" width={400} height={400} className="rounded-[1.5rem]" />
          </div>
        </div>
      )}
    </>
  )
}
