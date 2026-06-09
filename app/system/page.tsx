import { prisma } from "@/lib/prisma"

export default async function SystemPage() {
    const userCount = await prisma.user.count()
    const movieCount = await fetch(`${process.env.NEXT_PUBLIC_OPHIM_API}/home`)
    const movieCountJson = await movieCount.json()
    const totalMovies = movieCountJson?.data?.params?.pagination?.totalItems ?? 0
    return (
        <div className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-6">
                <p className="mb-2 text-sm text-white/46">Bảng điều khiển</p>
                <h1 className="text-3xl font-semibold tracking-tight">Chi tiết hệ thống</h1>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="glass-card glass-hover rounded-[1.75rem] p-6">
                    <h3 className="text-sm font-medium text-white/54">Người dùng</h3>
                    <p className="mt-3 text-4xl font-semibold tabular-nums">{userCount}</p>
                </div>

                <div className="glass-card glass-hover rounded-[1.75rem] p-6">
                    <h3 className="text-sm font-medium text-white/54">Phim</h3>
                    <p className="mt-3 text-4xl font-semibold tabular-nums">{totalMovies}</p>
                </div>
            </div>
        </div>
    )
}
