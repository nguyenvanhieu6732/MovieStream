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
            <div className="flex min-h-screen w-full bg-neutral-950 text-neutral-100">

                {/* Sidebar */}
                <Sidebar>
                    <SidebarHeader className="h-16 px-4 flex items-center">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="MovieStream Logo"
                                width={32}
                                height={32}
                                className="rounded-md"
                            />
                            <span className="text-lg font-semibold tracking-tight">
                                MovieStream
                            </span>
                        </Link>
                    </SidebarHeader>


                    <SidebarContent>
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
                <SidebarInset>
                    <header className="h-16 flex items-center gap-2 border-b border-neutral-800 px-4">
                        <SidebarTrigger />
                        <span className="font-semibold">Hệ Thống</span>
                    </header>

                    <main className="flex-1 p-4 lg:p-6">
                        {children}
                    </main>
                </SidebarInset>

            </div>
        </SidebarProvider>
    )
}
