import { SectionHeaderProps } from "@/lib/interface";
import Link from "next/link";
import { useDeviceType } from "@/hooks/use-mobile";



export default function SectionHeader({
  link = "#",
  title = "Phim",
}: SectionHeaderProps) {
  const device = useDeviceType();

  if (device === "mobile") {
    return (
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-2xl font-semibold leading-tight tracking-tight text-white" title={`${title} mới`}>
          {title} mới
        </h2>
      </div>
    )
  }

  return (
    <div className="glass-panel flex h-full min-h-[132px] flex-col justify-between rounded-[1.75rem] p-5">
      <span className="text-xs font-medium text-white/46"></span>
      <h2 className="line-clamp-3 text-2xl font-semibold leading-tight tracking-tight text-white" title={`${title} mới`}>
        {title} mới
      </h2>
      {device !== "mobile" && (
        <Link
          href={link}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/62 hover:text-white"
        >
          Xem toàn bộ <span aria-hidden="true">&rarr;</span>
        </Link>
      )}

    </div>
  );
}
