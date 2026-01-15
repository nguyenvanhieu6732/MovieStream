import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SystemLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        redirect("/")
    }

    return (
        <div className="dark">
            <div className="flex min-h-screen pt-16 bg-neutral-950 text-neutral-100">

                {/* Sidebar */}
                <aside className="w-64 bg-neutral-900 p-4 border-r border-neutral-800">
                    <Link href="/system">
                        <h2 className="text-lg font-bold mb-6 cursor-pointer">
                            Hệ Thống 
                        </h2>
                    </Link>


                    <nav className="space-y-2">

                        <Link
                            href="/system/users"
                            className="block rounded px-2 py-1 hover:bg-neutral-800"
                        >
                            Người Dùng
                        </Link>

                        <Link
                            href="/system/movies"
                            className="block rounded px-2 py-1 hover:bg-neutral-800"
                        >
                            Quản Lý Phim
                        </Link>
                    </nav>
                </aside>

                <main className="flex-1 bg-neutral-950 p-6">
                    {children}
                </main>
            </div>
        </div>
    )

}
