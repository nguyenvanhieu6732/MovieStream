// app/api/premium/vnpay-return/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import qs from "qs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secretKey = process.env.VNPAY_HASH_SECRET!;

function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });
  return sorted;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Lấy toàn bộ param
    let vnp_Params: Record<string, string> = Object.fromEntries(
      searchParams.entries()
    );

    // Lấy secureHash rồi xóa khỏi params
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sắp xếp giống đoạn code cũ (CHUẨN VNPAY)
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi ký
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Nếu chữ ký sai → redirect fail
    if (signed !== secureHash) {
      console.warn("Invalid VNPay signature", { signed, secureHash });
      return NextResponse.redirect(
        new URL(`/profile?payment=invalid`, req.url)
      );
    }

    // Lấy các dữ liệu từ VNPAY
    const vnpResponseCode = vnp_Params["vnp_ResponseCode"];
    const txnRef = vnp_Params["vnp_TxnRef"];

    const payment = await prisma.payment.findFirst({
      where: { transactionId: txnRef },
    });

    if (!payment) {
      console.warn("Payment not found", txnRef);
      return NextResponse.redirect(
        new URL(`/profile?payment=notfound`, req.url)
      );
    }

    // Nếu thanh toán thành công
    if (vnpResponseCode === "00") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "success",
          metadata: { ...(payment.metadata as any), vnp: vnp_Params },
        },
      });

      const planKey = (payment.metadata as any)?.planKey;
      const plan = await prisma.premiumPlan.findUnique({
        where: { key: planKey },
      });
      if (!plan)
        return NextResponse.redirect(
          new URL(`/profile?payment=plan_missing`, req.url)
        );

      const startDate = new Date();
      const endDate = new Date(startDate);
      if (plan.duration === "1 tháng") endDate.setMonth(endDate.getMonth() + 1);
      if (plan.duration === "3 tháng") endDate.setMonth(endDate.getMonth() + 3);
      if (plan.duration === "12 tháng") endDate.setFullYear(endDate.getFullYear() + 1);

      const userId = payment.userId;
      if (!userId)
        return NextResponse.redirect(
          new URL(`/profile?payment=user_missing`, req.url)
        );

      await prisma.subscription.create({
        data: {
          ownerId: userId,
          planId: plan.id,
          startDate,
          endDate,
          status: "active",
          paymentId: payment.id,
        },
      });

      return NextResponse.redirect(
        new URL(`/profile?payment=success`, req.url)
      );
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          metadata: { ...(payment.metadata as any), vnp: vnp_Params },
        },
      });
      return NextResponse.redirect(
        new URL(`/profile?payment=failed`, req.url)
      );
    }
  } catch (err) {
    console.error("VNPay return error", err);
    return NextResponse.redirect(new URL(`/profile?payment=error`, req.url));
  }
}
