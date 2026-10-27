import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { MIDTRANS_CLIENT_KEY } from "@/lib/midtrans-config";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Standard assessment access price (IDR)
const DEFAULT_ASSESSMENT_PRICE = 49000;

export async function POST(req: Request) {
  try {
    // Rate Limit (F-09): max 10 checkout requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await consumeRateLimit(`checkout:ip:${clientIp}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Terlalu banyak permintaan transaksi. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!(session?.user?.id || session?.user?.email);

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, password } = body;

    let customerEmail: string;
    let customerName: string;
    let customerPhone: string | null = phone?.trim() || null;
    let hashedPassword: string | null = null;
    let sessionUserId: string | null = null;

    if (isAuthenticated && session?.user) {
      // ==========================================
      // 1. AUTHENTICATED USER CHECKOUT FLOW
      // ==========================================
      const currentUserId = session.user.id;
      const sessionEmail = session.user.email?.toLowerCase().trim();

      const studentUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(currentUserId ? [{ id: currentUserId }] : []),
            ...(sessionEmail ? [{ email: sessionEmail }] : []),
          ],
        },
        include: {
          profile: true,
        },
      });

      if (!studentUser) {
        return NextResponse.json(
          { error: "Sesi login tidak valid. Pengguna tidak ditemukan." },
          { status: 401 }
        );
      }

      sessionUserId = studentUser.id;
      customerEmail = studentUser.email;
      customerName =
        name?.trim() ||
        studentUser.profile?.full_name ||
        session.user.name ||
        "Siswa GGC";

      if (!customerPhone && studentUser.profile?.phone_number) {
        customerPhone = studentUser.profile.phone_number;
      }

      // If user provided a phone number and profile doesn't have it, update profile
      if (phone?.trim() && !studentUser.profile?.phone_number && studentUser.profile?.id) {
        try {
          await prisma.studentProfile.update({
            where: { id: studentUser.profile.id },
            data: { phone_number: phone.trim() },
          });
        } catch (updateErr) {
          console.warn("Could not auto-save phone number to profile:", updateErr);
        }
      }
    } else {
      // ==========================================
      // 2. GUEST (UNAUTHENTICATED) CHECKOUT FLOW
      // ==========================================
      if (!name || !email) {
        return NextResponse.json(
          { error: "Nama dan email wajib diisi untuk memesan asesmen." },
          { status: 400 }
        );
      }

      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      const trimmedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: "Format email tidak valid." },
          { status: 400 }
        );
      }

      customerEmail = trimmedEmail;
      customerName = name.trim();

      // Check if a verified user or user with a paid order / session already exists with that email (F-15)
      // Do NOT create or mutate User records before payment succeeds.
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail },
        include: {
          orders: { where: { status: "SUCCESS" }, select: { id: true }, take: 1 },
          sessions: { select: { id: true }, take: 1 },
        },
      });

      if (existingUser) {
        const hasVerifiedOrPaidAccount =
          existingUser.role !== "STUDENT" ||
          existingUser.email_verified === true ||
          existingUser.orders.length > 0 ||
          existingUser.sessions.length > 0;

        if (hasVerifiedOrPaidAccount) {
          return NextResponse.json(
            {
              error:
                "Email ini sudah terdaftar. Silakan masuk (login) menggunakan akun Anda terlebih dahulu.",
              code: "EMAIL_ALREADY_REGISTERED",
            },
            { status: 409 }
          );
        }
      }

      // Hash password once to store in PendingRegistration (never in Order.payment_details)
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // ==========================================
    // 3. PRE-CREATE ORDER & PENDING REGISTRATION
    // ==========================================
    // Server-side constant price enforcement (Rp 49.000) prevents price tampering
    const price = DEFAULT_ASSESSMENT_PRICE;
    const orderId = `GGC-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
    const pendingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const preCreatedOrder = await prisma.order.create({
      data: {
        order_id: orderId,
        user_id: sessionUserId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        amount: price,
        status: "PENDING",
        payment_details: {
          is_authenticated_purchase: Boolean(sessionUserId),
          ...(sessionUserId ? { user_id: sessionUserId } : {}),
        },
      },
    });

    if (!sessionUserId && hashedPassword) {
      await prisma.pendingRegistration.upsert({
        where: { order_id: orderId },
        create: {
          order_id: orderId,
          email: customerEmail,
          full_name: customerName,
          phone: customerPhone,
          password_hash: hashedPassword,
          expires_at: pendingExpiresAt,
        },
        update: {
          email: customerEmail,
          full_name: customerName,
          phone: customerPhone,
          password_hash: hashedPassword,
          expires_at: pendingExpiresAt,
        },
      });
    }

    // ==========================================
    // 4. PREPARE MIDTRANS SNAP PARAMETERS
    // ==========================================
    const parameter: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
        phone: customerPhone || undefined,
      },
      item_details: [
        {
          id: "GGC-STUDY-FIT-FULL",
          price: price,
          quantity: 1,
          name: "GGC Study Fit Assessment™ - Akses Lengkap",
          brand: "Go Great Career",
          category: "Education Assessment",
        },
      ],
      callbacks: {
        finish: `${(process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "")}/student/dashboard`,
      },
    };

    // ==========================================
    // 5. REQUEST SNAP TRANSACTION TOKEN
    // ==========================================
    let transactionToken = "";
    let redirectUrl = "";

    try {
      const snapResponse = await snap.createTransaction(parameter);
      transactionToken = snapResponse.token;
      redirectUrl = snapResponse.redirect_url;
    } catch (midtransErr: any) {
      console.error("❌ Midtrans createTransaction error:", midtransErr);

      // Fallback mock token is ONLY permitted outside production when server key is missing or unauthorized
      const isDevOrTest = process.env.NODE_ENV !== "production";
      const isServerKeyMissing =
        !process.env.MIDTRANS_SERVER_KEY ||
        process.env.MIDTRANS_SERVER_KEY.includes("your_server_key_here");
      const isAuthError =
        midtransErr?.httpStatusCode === 401 ||
        midtransErr?.ApiResponse?.error === "Unauthorized";

      if (isDevOrTest && (isServerKeyMissing || isAuthError)) {
        console.warn(
          "⚠️ [Dev Mode] Falling back to mock Snap token due to unconfigured/unauthorized Midtrans server key."
        );
        transactionToken = `mock-snap-token-${orderId}`;
        redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${transactionToken}`;
      } else {
        return NextResponse.json(
          {
            error:
              "Gateway pembayaran sedang tidak dapat dihubungi. Silakan coba beberapa saat lagi.",
          },
          { status: 502 }
        );
      }
    }

    // ==========================================
    // 6. UPDATE ORDER RECORD WITH SNAP TOKEN
    // ==========================================
    await prisma.order.update({
      where: { id: preCreatedOrder.id },
      data: {
        snap_token: transactionToken,
        snap_redirect_url: redirectUrl,
      },
    });

    const isMock = transactionToken.startsWith("mock-snap-token-");

    return NextResponse.json({
      success: true,
      order_id: orderId,
      snap_token: transactionToken,
      token: transactionToken,
      redirect_url: redirectUrl,
      is_mock: isMock,
      client_key: MIDTRANS_CLIENT_KEY,
    });
  } catch (error: any) {
    console.error("Error in /api/payment/checkout:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat membuat transaksi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
