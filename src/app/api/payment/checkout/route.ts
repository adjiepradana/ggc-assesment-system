import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

// Standard assessment access price (IDR)
const DEFAULT_ASSESSMENT_PRICE = 49000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    // 1. Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nama dan email wajib diisi untuk memesan asesmen." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi akun minimal 6 karakter." },
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

    // Hash password to securely store and pass through Midtrans metadata
    const hashedPassword = await bcrypt.hash(password, 10);

    // SECURITY ENFORCEMENT:
    // Strictly enforce the price to server-side constant (Rp 49.000).
    // Client-supplied amount values are completely ignored to prevent price tampering attacks.
    const price = DEFAULT_ASSESSMENT_PRICE;
    const orderId = `GGC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Ensure student user account exists in DB so client auto-login succeeds smoothly upon payment completion
    let studentUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: trimmedEmail,
          password_hash: hashedPassword,
          role: "STUDENT",
          is_active: true,
          email_verified: false,
          profile: {
            create: {
              full_name: name.trim(),
              phone_number: phone ? phone.trim() : null,
            },
          },
        },
      });
    } else {
      studentUser = await prisma.user.update({
        where: { id: studentUser.id },
        data: {
          password_hash: hashedPassword,
          is_active: true,
        },
      });
    }

    // 2. Prepare Midtrans Snap parameters with hashed password in custom_field1
    const parameter: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        first_name: name.trim(),
        email: trimmedEmail,
        phone: phone ? phone.trim() : undefined,
      },
      custom_field1: hashedPassword,
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
        finish: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/student/dashboard`,
      },
    };

    // 3. Request Snap transaction token from Midtrans
    let transactionToken = "";
    let redirectUrl = "";

    try {
      const snapResponse = await snap.createTransaction(parameter);
      transactionToken = snapResponse.token;
      redirectUrl = snapResponse.redirect_url;
    } catch (midtransErr: any) {
      console.error("❌ Midtrans createTransaction error:", midtransErr);

      // Fallback for mock/local sandbox testing if server key is not yet configured with live Midtrans
      if (
        !process.env.MIDTRANS_SERVER_KEY ||
        process.env.MIDTRANS_SERVER_KEY.includes("your_server_key_here")
      ) {
        transactionToken = `mock-snap-token-${orderId}`;
        redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${transactionToken}`;
      } else {
        return NextResponse.json(
          {
            error: "Gagal menghubungkan ke gateway pembayaran Midtrans. Mohon periksa konfigurasi server key.",
            details: midtransErr?.message || String(midtransErr),
          },
          { status: 500 }
        );
      }
    }

    // 4. Save order to database
    try {
      await prisma.order.create({
        data: {
          order_id: orderId,
          user_id: studentUser.id,
          customer_name: name.trim(),
          customer_email: trimmedEmail,
          customer_phone: phone ? phone.trim() : null,
          amount: price,
          status: "PENDING",
          snap_token: transactionToken,
          snap_redirect_url: redirectUrl,
          payment_details: {
            hashedPassword,
          },
        },
      });
    } catch (dbErr) {
      console.warn("⚠️ Could not persist order record to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      snap_token: transactionToken,
      token: transactionToken,
      redirect_url: redirectUrl,
      client_key: process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });
  } catch (error: any) {
    console.error("Error in /api/payment/checkout:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat membuat transaksi." },
      { status: 500 }
    );
  }
}
