import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { fulfillPaidOrder } from "@/lib/fulfillment";

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

    // 1. Strict Signature Key Requirement (Security Patch)
    if (!signature_key) {
      console.warn("🚨 [Midtrans Webhook Security] Missing signature_key in payload for order:", order_id);
      return NextResponse.json(
        { error: "Unauthorized: signature_key wajib disertakan." },
        { status: 401 }
      );
    }

    // SHA-512 Signature Verification using Midtrans Server Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (serverKey && !serverKey.includes("your_server_key_here")) {
      const isValid = verifyMidtransSignature(
        order_id,
        status_code,
        gross_amount,
        signature_key
      );
      if (!isValid) {
        console.warn("⚠️ [Midtrans Webhook Security] Invalid signature detected for order:", order_id);
        return NextResponse.json(
          { error: "Forbidden: Signature tidak valid." },
          { status: 403 }
        );
      }
    } else {
      console.warn("⚠️ [Midtrans Webhook] Live server key is not configured; skipping SHA-512 signature hash check for dev/mock.");
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

    // 3. Find order record in DB & extract stored credentials
    const existingOrder = await prisma.order.findUnique({
      where: { order_id },
    });

    // SECURITY (Fix 1.6): Retrieve hashedPassword strictly from internal database record mapped by order_id,
    // NEVER trusting or reading credentials from the external Midtrans payload.
    const savedHashedPassword = (existingOrder?.payment_details as any)?.hashedPassword;

    // IDEMPOTENCY GUARD:
    // If order was already processed as SUCCESS in a previous webhook trigger,
    // immediately return 200 OK to prevent duplicate user provisioning and duplicate email dispatches.
    if (existingOrder && existingOrder.status === "SUCCESS") {
      console.log(`ℹ️ [Midtrans Webhook Idempotency] Order ${order_id} has already been processed as SUCCESS.`);
      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} has already been processed successfully (idempotent response).`,
      });
    }

    // If payment is not successful, record non-success status and acknowledge notification
    if (existingOrder && !isSuccess) {
      const newStatus = isFailed ? "FAILED" : "PENDING";
      const existingDetails = (existingOrder.payment_details as any) || {};
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: newStatus,
          payment_type: payment_type || existingOrder.payment_type,
          payment_details: {
            ...existingDetails,
            midtrans_notification: notificationJson,
          },
        },
      });

      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} recorded with status: ${transaction_status}`,
      });
    }

    if (!isSuccess) {
      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} recorded with status: ${transaction_status}`,
      });
    }

    // 4. Payment is SUCCESSFUL -> Provision Student Account & Dispatch Magic Link (Atomically Idempotent)
    if (!existingOrder) {
      console.warn("⚠️ Order not found in database for fulfillment:", order_id);
      return NextResponse.json(
        { error: `Order ${order_id} tidak ditemukan di database.` },
        { status: 404 }
      );
    }

    const fulfillResult = await fulfillPaidOrder(
      existingOrder,
      notificationJson,
      payment_type
    );

    if (!fulfillResult.success) {
      return NextResponse.json(
        { error: fulfillResult.error || "Gagal memproses pemenuhan pesanan." },
        { status: 500 }
      );
    }

    if (fulfillResult.status === "ALREADY_PROCESSED") {
      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} has already been processed successfully (idempotent response).`,
        order_id,
        user_id: fulfillResult.userId,
      });
    }

    return NextResponse.json({
      status: "OK",
      message: "Payment processed, student account provisioned, and verification email sent.",
      order_id,
      user_id: fulfillResult.userId,
    });
  } catch (error: any) {
    console.error("❌ Error handling Midtrans notification:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error handling notification" },
      { status: 500 }
    );
  }
}
