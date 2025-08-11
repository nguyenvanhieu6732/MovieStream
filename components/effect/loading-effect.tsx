export function LoadingEffect( props: { message?: string } ) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white px-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6" />
            <p className="text-lg font-semibold animate-pulse">{props.message || "Đang tải phim, xin vui lòng chờ..."}</p>
        </div>
    )
}