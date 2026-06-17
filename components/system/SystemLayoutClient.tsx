"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Film,
  Home,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navItems = [
  {
    href: "/system",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/system/users",
    label: "Người dùng",
    icon: UsersRound,
  },
  {
    href: "/system/movies",
    label: "Phim Premium",
    icon: Film,
  },
]

export default function SystemLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-neutral-100">
        <Sidebar className="border-r border-white/10 bg-[#060914]/78 backdrop-blur-2xl">
          <SidebarHeader className="h-24 px-4">
            <div className="flex h-full items-center">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-white/14 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <Image
                    src="/logo.png"
                    alt="MovieStream Logo"
                    width={28}
                    height={28}
                    className="rounded-xl transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold tracking-tight">
                    MovieStream
                  </span>
                  <span className="block truncate text-xs text-white/42">
                    System console
                  </span>
                </span>
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 pb-4">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/system"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-11 rounded-[1.15rem] px-3 text-white/68 data-[active=true]:border data-[active=true]:border-white/14 data-[active=true]:bg-white/[0.11] data-[active=true]:text-white hover:bg-white/[0.075] hover:text-white"
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>

            <div className="mt-auto rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Admin access
              </div>
              <p className="mt-2 text-xs leading-5 text-white/44">
                Khu vực quản trị dữ liệu, người dùng và nội dung Premium.
              </p>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <header className="glass-panel sticky top-3 z-40 mx-3 mt-3 flex h-16 items-center justify-between gap-3 rounded-[1.55rem] px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10 rounded-[1.1rem]" />
              <div>
                <p className="text-sm font-semibold">Hệ thống</p>
                <p className="text-xs text-white/42">Quản trị MovieStream</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-[1.1rem] border border-white/12 bg-white/[0.055] px-3 text-sm font-semibold text-white/68 hover:bg-white/[0.1] hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Về trang phim</span>
            </Link>
          </header>

          <main className="flex-1 p-4 pt-6 lg:p-6">
            <div className="page-transition">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
