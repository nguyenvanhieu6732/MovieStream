# Đề tài: PHÁT TRIỂN ỨNG DỤNG WEB XEM PHIM MOVIESTREAM ĐA NỀN TẢNG TỐI ƯU HÓA HIỆU NĂNG VỚI KIẾN TRÚC NEXTJS VÀ PWA
**Sinh viên thực hiện:** Nguyễn Văn Hiếu - MSSV: 21810310602

## 🛠 Công nghệ sử dụng
- Backend & Frontend (Fullstack): Next.js 14 (App Router), TypeScript
- Database: MongoDB (thông qua Prisma ORM )
- Styling: Tailwind CSS , Shadcn UI (Radix UI + Lucide Icons)
- Authentication: NextAuth.js v4
- State Management & Data Fetching: SWR, React Hook Form, Zod
- Payment Integration: VNPay (tích hợp custom)

## 🚀 Hướng dẫn cài đặt
1. Clone repo: `git clone https://github.com/nguyenvanhieu6732/MovieStream.git`
thêm file .env.local và .env cùng cấp với app
2. chạy câu lệnh: npm i
3. chạy câu lệnh: npx prisma generate 
4. chạy câu lệnh: npx prisma db push   
5. chạy câu lệnh: npx prisma db seed    
6. chạy câu lệnh: npm run dev

## file .env:


DATABASE_URL="mongodb+srv://nguyenhieu6732:blhb7UTmuciDzwIO@auth.uptrr8r.mongodb.net/moviestream?retryWrites=true&w=majority&appName=auth" 

## file .env.local:

NEXT_PUBLIC_OPHIM_API=https://ophim1.com/v1/api
DATABASE_URL="mongodb+srv://nguyenhieu6732:blhb7UTmuciDzwIO@auth.uptrr8r.mongodb.net/moviestream?retryWrites=true&w=majority&appName=auth"
GOOGLE_CLIENT_ID=37251004847-2rcv9m61446rdprjlocr2om6kpmvi90t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FACEBOOK_CLIENT_ID=1364528518649396
FACEBOOK_CLIENT_SECRET=804ce880a889c6290d7cf13b568ce584
NEXTAUTH_SECRET=anh-Hieu-dep-trai-khoai-to-so-1-the-gioi
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnzsb2jiv
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=moviestream_unsigned_profile
VNPAY_TMN_CODE=M1NOXEH2
VNPAY_HASH_SECRET=UDF5B1BRL1B00CHRJCGCESAG63TWNJCP
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/premium/vnpay-return


## 📸 Hình ảnh Demo

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)