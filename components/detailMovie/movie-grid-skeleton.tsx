export function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="glass-card animate-pulse rounded-[1.6rem] p-3">
          <div className="mb-3 aspect-[2/3] rounded-[1.35rem] bg-white/10"></div>
          <div className="mb-2 h-4 rounded-full bg-white/10"></div>
          <div className="h-3 w-2/3 rounded-full bg-white/10"></div>
        </div>
      ))}
    </div>
  )
}
