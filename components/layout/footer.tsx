"use client"


import { Facebook, Instagram, Youtube } from "lucide-react"
import ScrollToTopButton from "../scrollEffect/ScrollToTopButton"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="relative px-4 pb-8 pt-16 text-gray-300">
            <div className="glass-panel spatial-container rounded-[2rem] px-6 py-10 md:px-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <Image src="/logo.png" alt="MovieStream Logo" width={54} height={54} className="rounded-2xl" />
                        <span className="text-xl font-semibold tracking-tight text-white">MovieStream</span>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-white/62">
                        Xem phim online miễn phí chất lượng cao, cập nhật liên tục. Giao diện đẹp, không quảng cáo, dễ dùng trên mọi thiết bị.
                    </p>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-white/90">Thể loại</h3>
                    <ul className="space-y-2 text-sm text-white/58">
                        <li><a href="/movies?movieSlug=hanh-dong" className="hover:text-white transition">Hành động</a></li>
                        <li><a href="/movies?movieSlug=tinh-cam" className="hover:text-white transition">Tình cảm</a></li>
                        <li><a href="/movies?movieSlug=kinh-di" className="hover:text-white transition">Kinh dị</a></li>
                        <li><a href="/movies?movieSlug=hoat-hinh" className="hover:text-white transition">Hoạt hình</a></li>
                        <li><a href="/movies?movieSlug=vien-tuong" className="hover:text-white transition">Viễn tưởng</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-white/90">Thông tin</h3>
                    <ul className="space-y-2 text-sm text-white/58">
                        <li><a href="/search" className="hover:text-white transition">Tìm kiếm</a></li>
                        <li><a href="/watchlist" className="hover:text-white transition">Xem sau</a></li>
                        <li><a href="/profile" className="hover:text-white transition">Tài khoản</a></li>
                        <li><a href="/movies?movieSlug=phim-chieu-rap" className="hover:text-white transition">Phim chiếu rạp</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-white/90">Kết nối</h3>
                    <div className="mt-2 flex gap-3">
                        <a href="https://www.facebook.com/nguyenhieu.241967" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/62 hover:bg-white/10 hover:text-white" aria-label="Facebook"><Facebook size={19} /></a>
                        <a href="https://www.instagram.com/im.hieu037/" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/62 hover:bg-white/10 hover:text-white" aria-label="Instagram"><Instagram size={19} /></a>
                        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/62 hover:bg-white/10 hover:text-white" aria-label="YouTube"><Youtube size={19} /></a>
                    </div>
                </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-5 text-center text-sm text-white/42">
                © {new Date().getFullYear()} MovieStream. Tất cả bản quyền thuộc về chúng tôi.
            </div>
            </div>

            <ScrollToTopButton />
        </footer>
    )
}
