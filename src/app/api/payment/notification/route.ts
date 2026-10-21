import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { verifyMidtransSignature } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();
    console.log("🔔 [Midtrans Notification Received]:", {
      order_id: notificationJson.order_id,
      transaction_status: notificationJson.transaction_status,
      payment_type: notificationJson.payment_type,
      gross_amount: notificationJson.gross_amount,
    });

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = notificationJson;

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID tidak ditemukan dalam payload notifikasi." },
        { status: 400 }
      );
    }

    // 1. Signature Verification (if live keys are present)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (serverKey && !serverKey.includes("your_server_key_here") && signature_key) {
      const isValid = verifyMidtransSignature(
        order_id,
        status_code,
        gross_amount,
        signature_key
      );
      if (!isValid) {
        console.warn("⚠️ Invalid Midtrans signature for order:", order_id);
        return NextResponse.json(
          { error: "Invalid Midtrans notification signature." },
          { status: 403 }
        );
      }
    }

    // 2. Determine Payment Success State
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isPending = transaction_status === "pending";
    const isFailed =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire" ||
      transaction_status === "failure";

    // 3. Find order record in DB
    const existingOrder = await prisma.order.findUnique({
      where: { order_id },
    });

    if (existingOrder) {
      const newStatus = isSuccess ? "SUCCESS" : isFailed ? "FAILED" : "PENDING";
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: newStatus,
          payment_type: payment_type || existingOrder.payment_type,
          payment_details: notificationJson,
        },
      });
    }

    // If payment is not successful, acknowledge notification and exit
    if (!isSuccess) {
      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} recorded with status: ${transaction_status}`,
      });
    }

    // 4. Payment is SUCCESSFUL -> Provision Student Account & Dispatch Magic Link
    const customerEmail =
      existingOrder?.customer_email ||
      notificationJson.customer_details?.email;
    const customerName =
      existingOrder?.customer_name ||
      notificationJson.customer_details?.first_name ||
      "Siswa Baru GGC";
    const customerPhone =
      existingOrder?.customer_phone ||
      notificationJson.customer_details?.phone ||
      null;

    if (!customerEmail) {
      console.warn("⚠️ No customer email associated with order:", order_id);
      return NextResponse.json({
        status: "OK",
        warning: "Order marked SUCCESS, but customer email is missing.",
      });
    }

    const normalizedEmail = customerEmail.toLowerCase().trim();

    // Check if user already exists
    let studentUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    // Create user if not registered yet
    if (!studentUser) {
      // Generate a secure temporary password (e.g. 12 alphanumeric characters)
      const rawTempPassword = `Ggc!${crypto.randomBytes(6).toString("hex")}`;
      const hashedPassword = await bcrypt.hash(rawTempPassword, 10);

      studentUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password_hash: hashedPassword,
          role: "STUDENT",
          is_active: true,
          email_verified: false,
          profile: {
            create: {
              full_name: customerName,
              phone_number: customerPhone,
            },
          },
        },
        include: { profile: true },
      });

      console.log(`👤 [Midtrans] Created new student user: ${normalizedEmail}`);
    } else {
      // Reactivate user if previously soft-deleted
      if (!studentUser.is_active) {
        studentUser = await prisma.user.update({
          where: { id: studentUser.id },
          data: { is_active: true },
          include: { profile: true },
        });
      }
    }

    // Link user to order if order exists
    if (existingOrder && !existingOrder.user_id) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { user_id: studentUser.id },
      });
    }

    // 5. Generate secure verification token (24-hour expiry)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Invalidate any previous unused tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { user_id: studentUser.id },
    });

    await prisma.verificationToken.create({
      data: {
        token: rawToken,
        user_id: studentUser.id,
        expires_at: expiresAt,
      },
    });

    console.log(`🔑 [Midtrans] Verification token created for ${normalizedEmail}`);

    // 6. Trigger Nodemailer email dispatcher
    const studentDisplayName =
      studentUser.profile?.full_name || customerName || normalizedEmail.split("@")[0];

    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      studentDisplayName,
      rawToken
    );

    console.log(`📧 [Midtrans] Verification email dispatched:`, {
      email: normalizedEmail,
      success: emailResult.success,
      messageId: emailResult.messageId,
    });

    return NextResponse.json({
      status: "OK",
      message: "Payment processed, student account provisioned, and verification email sent.",
      order_id,
      user_id: studentUser.id,
    });
  } catch (error: any) {
    console.error("❌ Error handling Midtrans notification:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error handling notification" },
      { status: 500 }
    );
  }
}
