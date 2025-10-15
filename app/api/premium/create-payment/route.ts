import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import qs from "qs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

const tmnCode = process.env.VNPAY_TMN_CODE;
const returnUrl = process.env.VNPAY_RETURN_URL;
const vnpUrl = process.env.VNPAY_URL;
const secretKey = process.env.VNPAY_HASH_SECRET;

if (!tmnCode || !returnUrl || !vnpUrl || !secretKey) {
  console.warn("⚠️ Missing VNPAY environment variables!", {
    tmnCode,
    returnUrl,
    vnpUrl,
    secret: !!secretKey,
  });
}

// Format date: YYYYMMDDHHmmss
function formatVnpCreateDate(d = new Date()) {
  const YYYY = d.getFullYear().toString();
  const MM = (d.getMonth() + 1).toString().padStart(2, "0");
  const DD = d.getDate().toString().padStart(2, "0");
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

// sort + encode giống code bạn từng chạy được ✅
function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const body = await req.json();
    const planKey = body.planKey;
    if (!planKey) return NextResponse.json({ message: "Missing planKey" }, { status: 400 });

    const plan = await prisma.premiumPlan.findUnique({ where: { key: planKey } });
    if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });

    const txnRef = `vnp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amount = plan.price * 100; // VNPay expects amount x100
    const ipAddr = "127.0.0.1"; // or extract from headers if needed
    const createDate = formatVnpCreateDate();

    let vnp_Params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode!,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toán gói ${plan.name}`,
      vnp_OrderType: "other",
      vnp_Amount: amount.toString(),
      vnp_ReturnUrl: returnUrl!,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac("sha512", secretKey!);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = vnp_SecureHash;

    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;


    // 10. Create pending record trong DB
    await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: plan.currency,
        method: "vnpay",
        status: "pending",
        transactionId: txnRef,
        metadata: { planKey: plan.key, planName: plan.name },
      },
    });

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error("create-payment error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
