import { SectionHeaderProps } from "@/lib/interface";
import Link from "next/link";



export default function SectionHeader({
  country = "mới",
  link = "#",
  gradient = "from-purple-400 via-purple-500 to-white",
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col justify-center items-start gap-2">
      <h2
        className={`text-2xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-snug`}
      >
        Phim mới {country}
      </h2>
      <Link
        href={link}
        className="text-sm text-white/90 hover:underline inline-flex items-center gap-1"
      >
        Xem toàn bộ <span>&rarr;</span>
      </Link>
    </div>
  );
}
