"use client"


import { Facebook, Instagram, Youtube, ArrowUp, Film } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-[#0B0C10] text-gray-300 pt-12 pb-6 mt-4 relative border-t border-gray-700">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Logo + Slogan */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <Film className="h-8 w-8 text-red-600" />
                        <h2 className="text-2xl font-bold text-white">MovieStream</h2>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Xem phim online miễn phí chất lượng cao, cập nhật liên tục. Giao diện đẹp, không quảng cáo, dễ dùng trên mọi thiết bị.
                    </p>
                </div>

                {/* Thể loại phổ biến */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Thể loại</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition">Hành động</a></li>
                        <li><a href="#" className="hover:text-white transition">Tình cảm</a></li>
                        <li><a href="#" className="hover:text-white transition">Kinh dị</a></li>
                        <li><a href="#" className="hover:text-white transition">Hoạt hình</a></li>
                        <li><a href="#" className="hover:text-white transition">Viễn tưởng</a></li>
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
                        <a href="#" className="hover:text-white"><Facebook size={20} /></a>
                        <a href="#" className="hover:text-white"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-white"><Youtube size={20} /></a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} MovieStream. Tất cả bản quyền thuộc về chúng tôi.
            </div>

            {/* Scroll to top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md"
                aria-label="Scroll to top"
            >
                <ArrowUp size={18} />
            </button>
        </footer>
    )
}