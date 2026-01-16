import { prisma } from "@/lib/prisma"

export default async function SystemPage() {
    const userCount = await prisma.user.count()
    const movieCount = await fetch(`${process.env.NEXT_PUBLIC_OPHIM_API}/home`)
    const movieCountJson = await movieCount.json()
    const totalMovies = movieCountJson?.data?.params?.pagination?.totalItems ?? 0
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Chi Tiết</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded shadow">
                    <h3 className="font-semibold">Người Dùng</h3>
                    <p className="text-2xl">{userCount}</p>
                </div>

                <div className="p-4 rounded shadow">
                    <h3 className="font-semibold">Phim</h3>
                    <p className="text-2xl">{totalMovies}</p>
                </div>
            </div>
        </div>
    )
}
