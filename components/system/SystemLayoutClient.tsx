"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar"
import Image from "next/image"

import Link from "next/link"

export default function SystemLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full text-neutral-100">

                {/* Sidebar */}
                <Sidebar className="border-white/10 bg-transparent">
                    <SidebarHeader className="h-20 px-4 flex items-center">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="MovieStream Logo"
                                width={32}
                                height={32}
                                className="rounded-2xl"
                            />
                            <span className="text-lg font-semibold tracking-tight">
                                MovieStream
                            </span>
                        </Link>
                    </SidebarHeader>


                    <SidebarContent className="px-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/system/">Hệ Thống</Link>
                                </SidebarMenuButton>
                                <SidebarMenuButton asChild>
                                    <Link href="/system/users">Người Dùng</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/system/movies">Quản Lý Phim</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>

                {/* MAIN – PHẢI DÙNG SidebarInset */}
                <SidebarInset className="bg-transparent">
                    <header className="glass-panel mx-3 mt-4 flex h-16 items-center gap-3 rounded-[1.75rem] px-4">
                        <SidebarTrigger />
                        <span className="font-semibold">Hệ thống</span>
                    </header>

                    <main className="flex-1 p-4 pt-6 lg:p-6">
                        {children}
                    </main>
                </SidebarInset>

            </div>
        </SidebarProvider>
    )
}
