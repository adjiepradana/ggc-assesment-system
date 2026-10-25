import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiter: max 5 requests per minute per IP address (Phase 3.2)
const trackRateLimitMap = new Map<string, RateLimitRecord>();

if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    trackRateLimitMap.forEach((record, ip) => {
      if (now > record.resetTime) {
        trackRateLimitMap.delete(ip);
      }
    });
  }, 5 * 60 * 1000);
  cleanupTimer.unref?.();
}

export async function POST(req: Request) {
  try {
    // 0. IP-based Rate Limiter (Phase 3.2: Anti-enumeration protection, max 5 req/min)
    const forwardedHeader = req.headers.get("x-forwarded-for");
    const clientIp = forwardedHeader
      ? forwardedHeader.split(",")[0].trim()
      : (req.headers.get("x-real-ip")?.trim() ?? "unknown");

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5;

    const rateRecord = trackRateLimitMap.get(clientIp);

    if (rateRecord && now < rateRecord.resetTime) {
      if (rateRecord.count >= maxRequests) {
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            message: "Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.",
          },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      trackRateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    const body = await req.json();
    const { email, order_id } = body;

    // 1. Validation
    if (!email || !order_id) {
      return NextResponse.json(
        { error: "Alamat email dan Order ID wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOrderId = order_id.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    // 2. Query Prisma Order model
    const order = await prisma.order.findFirst({
      where: {
        order_id: normalizedOrderId,
        OR: [
          { customer_email: normalizedEmail },
          { user: { email: normalizedEmail } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            email_verified: true,
            role: true,
            profile: {
              select: {
                full_name: true,
                phone_number: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Pesanan tidak ditemukan. Periksa kembali Email dan Order ID Anda, atau pastikan huruf kapital sesuai.",
        },
        { status: 404 }
      );
    }

    // 3. Format response based on status
    const isSuccess = order.status === "SUCCESS";
    const isPending = order.status === "PENDING";
    const isFailedOrExpired =
      order.status === "FAILED" || order.status === "EXPIRED";

    let message = "";
    if (isSuccess) {
      message =
        "Pembayaran Anda telah diverifikasi dan berhasil terkonfirmasi! Tiket asesmen Anda telah aktif.";
    } else if (isPending) {
      message =
        "Pesanan Anda berstatus Menunggu Pembayaran. Silakan selesaikan pembayaran melalui metode yang telah dipilih.";
    } else if (isFailedOrExpired) {
      message =
        "Pesanan ini telah kedaluwarsa atau gagal diproses oleh gateway pembayaran. Silakan buat pesanan tiket baru.";
    }

    const redirectUrl = `/auth/login?email=${encodeURIComponent(
      order.customer_email
    )}&order=${encodeURIComponent(order.order_id)}`;

    return NextResponse.json({
      success: true,
      order: {
        order_id: order.order_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        amount: order.amount,
        status: order.status,
        payment_type: order.payment_type,
        snap_token: order.snap_token,
        snap_redirect_url: order.snap_redirect_url,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      user: order.user
        ? {
            email: order.user.email,
            email_verified: order.user.email_verified,
            name: order.user.profile?.full_name || order.customer_name,
          }
        : null,
      message,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Error in /api/order/track:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan internal saat memeriksa status pesanan. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
