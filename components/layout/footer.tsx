"use client"


import { Facebook, Instagram, Youtube, ArrowUp, Film } from "lucide-react"
import ScrollToTopButton from "../scrollEffect/ScrollToTopButton"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="bg-black text-gray-300 pt-12 pb-6 relative border-t border-black-700">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Logo + Slogan */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <Image src="/logo.png" alt="MovieStream Logo" width={64} height={64} />
                        <span className="text-xl font-bold">MovieStream</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Xem phim online miễn phí chất lượng cao, cập nhật liên tục. Giao diện đẹp, không quảng cáo, dễ dùng trên mọi thiết bị.
                    </p>
                </div>

                {/* Thể loại phổ biến */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Thể loại</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/movies?movieSlug=hanh-dong" className="hover:text-white transition">Hành động</a></li>
                        <li><a href="/movies?movieSlug=tinh-cam" className="hover:text-white transition">Tình cảm</a></li>
                        <li><a href="/movies?movieSlug=kinh-di" className="hover:text-white transition">Kinh dị</a></li>
                        <li><a href="/movies?movieSlug=hoat-hinh" className="hover:text-white transition">Hoạt hình</a></li>
                        <li><a href="/movies?movieSlug=vien-tuong" className="hover:text-white transition">Viễn tưởng</a></li>
                    </ul>
                </div>

                {/* Thông tin */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Thông tin</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition">Về chúng tôi</a></li>
                        <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                        <li><a href="#" className="hover:text-white transition">Chính sách</a></li>
                        <li><a href="#" className="hover:text-white transition">Báo lỗi phim</a></li>
                    </ul>
                </div>

                {/* Mạng xã hội */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Kết nối</h3>
                    <div className="flex gap-4 mt-2">
                        <a href="https://www.facebook.com/nguyenhieu.241967" className="hover:text-white"><Facebook size={20} /></a>
                        <a href="https://www.instagram.com/im.hieu037/" className="hover:text-white"><Instagram size={20} /></a>
                        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="hover:text-white"><Youtube size={20} /></a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} MovieStream. Tất cả bản quyền thuộc về chúng tôi.
            </div>

            {/* Scroll to top */}
            <ScrollToTopButton />
        </footer>
    )
}