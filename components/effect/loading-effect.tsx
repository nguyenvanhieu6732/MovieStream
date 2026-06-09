export function LoadingEffect( props: { message?: string } ) {
    return (
        <div className="flex min-h-[56dvh] flex-col items-center justify-center px-4 text-white">
            <div className="glass-panel mb-6 grid h-24 w-24 place-items-center rounded-[2rem]">
                <div className="h-12 w-12 animate-pulse rounded-2xl border border-white/20 bg-white/10 shadow-[0_18px_48px_rgba(244,63,94,0.18)]" />
            </div>
            <p className="text-center text-base font-semibold text-white/72">{props.message || "Đang tải phim, xin vui lòng chờ..."}</p>
        </div>
    )
}
