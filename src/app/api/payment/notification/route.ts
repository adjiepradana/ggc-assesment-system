import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { MIDTRANS_SERVER_KEY } from "@/lib/midtrans-config";
import { fulfillPaidOrder, VerifiedPaymentEvidence } from "@/lib/fulfillment";

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

    // 1. Fail-closed Server Key & Signature Verification (F-07)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey.includes("your_server_key_here")) {
      console.error(
        "🚨 [Midtrans Webhook Security] MIDTRANS_SERVER_KEY is missing or a placeholder. Failing closed."
      );
      return NextResponse.json(
        { error: "Server configuration error: Midtrans server key is not configured." },
        { status: 503 }
      );
    }

    if (!signature_key) {
      console.warn(
        "🚨 [Midtrans Webhook Security] Missing signature_key in payload for order:",
        order_id
      );
      return NextResponse.json(
        { error: "Unauthorized: signature_key wajib disertakan." },
        { status: 401 }
      );
    }

    const isValidSignature = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );
    if (!isValidSignature) {
      console.warn(
        "⚠️ [Midtrans Webhook Security] Invalid signature detected for order:",
        order_id
      );
      return NextResponse.json(
        { error: "Forbidden: Signature tidak valid." },
        { status: 403 }
      );
    }

    // 2. Find existing order record in DB
    const existingOrder = await prisma.order.findUnique({
      where: { order_id },
    });

    if (!existingOrder) {
      console.warn("⚠️ Order not found in database for webhook:", order_id);
      return NextResponse.json(
        { error: `Order ${order_id} tidak ditemukan di database.` },
        { status: 404 }
      );
    }

    // 3. Verify gross_amount matches persisted order amount (F-07)
    const numericGrossAmount = Math.round(Number(gross_amount));
    if (
      !Number.isFinite(numericGrossAmount) ||
      numericGrossAmount !== existingOrder.amount
    ) {
      console.error(
        `🚨 [Midtrans Webhook Security] Gross amount mismatch for order ${order_id}: expected ${existingOrder.amount}, got ${gross_amount}`
      );
      return NextResponse.json(
        { error: "Bad Request: gross_amount tidak sesuai dengan nilai pesanan." },
        { status: 400 }
      );
    }

    // 4. Classify Midtrans Transaction Status & Enforce State Transitions (D-7, F-07)
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" &&
        (!fraud_status || fraud_status === "accept"));

    const isRefundOrChargeback =
      transaction_status === "refund" ||
      transaction_status === "partial_refund" ||
      transaction_status === "chargeback";

    const isExpired = transaction_status === "expire";
    const isFailed =
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "failure";
    const isPending = transaction_status === "pending";

    // A. Handle Refund / Chargeback transitions (even from SUCCESS)
    if (isRefundOrChargeback) {
      const targetRevocationStatus: OrderStatus =
        transaction_status === "chargeback"
          ? OrderStatus.CHARGEBACK
          : OrderStatus.REFUNDED;

      const existingDetails = (existingOrder.payment_details as any) || {};
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: targetRevocationStatus,
          payment_type: payment_type || existingOrder.payment_type,
          payment_details: {
            ...existingDetails,
            midtrans_notification: notificationJson,
          },
        },
      });

      // Revoke any active verification tokens for this user
      if (existingOrder.user_id) {
        await prisma.verificationToken.deleteMany({
          where: { user_id: existingOrder.user_id },
        });
      }

      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} transitioned to ${targetRevocationStatus}.`,
      });
    }

    // B. Never allow a late 'pending', 'expire', or 'failed' webhook to overwrite terminal states
    const terminalNonOverwritableByPending: OrderStatus[] = [
      OrderStatus.SUCCESS,
      OrderStatus.FAILED,
      OrderStatus.EXPIRED,
      OrderStatus.REFUNDED,
      OrderStatus.CHARGEBACK,
    ];

    if (
      isPending &&
      terminalNonOverwritableByPending.includes(existingOrder.status)
    ) {
      console.log(
        `ℹ️ [Midtrans Webhook] Ignoring late 'pending' notification for order ${order_id} in state ${existingOrder.status}.`
      );
      return NextResponse.json({
        status: "OK",
        message: `Ignored late pending notification for order in state ${existingOrder.status}.`,
      });
    }

    // C. Idempotency Guard for already-settled or revoked orders
    if (
      existingOrder.status === OrderStatus.SUCCESS ||
      existingOrder.status === OrderStatus.REFUNDED ||
      existingOrder.status === OrderStatus.CHARGEBACK
    ) {
      console.log(
        `ℹ️ [Midtrans Webhook Idempotency] Order ${order_id} is already in terminal state ${existingOrder.status}.`
      );
      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} has already been processed (${existingOrder.status}).`,
      });
    }

    // D. Record non-success state transitions (PENDING, EXPIRED, FAILED)
    if (!isSuccess) {
      let nextStatus: OrderStatus = existingOrder.status;
      if (isExpired) {
        nextStatus = OrderStatus.EXPIRED;
      } else if (isFailed) {
        nextStatus = OrderStatus.FAILED;
      } else if (isPending && existingOrder.status === OrderStatus.PENDING) {
        nextStatus = OrderStatus.PENDING;
      }

      const existingDetails = (existingOrder.payment_details as any) || {};
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: nextStatus,
          payment_type: payment_type || existingOrder.payment_type,
          payment_details: {
            ...existingDetails,
            midtrans_notification: notificationJson,
          },
        },
      });

      return NextResponse.json({
        status: "OK",
        message: `Order ${order_id} recorded with status: ${nextStatus}`,
      });
    }

    // 5. Payment is SUCCESSFUL -> Fulfill with VerifiedPaymentEvidence
    const evidence: VerifiedPaymentEvidence = {
      orderId: existingOrder.order_id,
      transactionId: notificationJson.transaction_id,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status,
      grossAmount: gross_amount,
      statusCode: status_code,
      signatureHash: signature_key,
      paymentType: payment_type,
      settlementTime: notificationJson.settlement_time,
      source: "MIDTRANS_WEBHOOK",
      rawPayload: notificationJson,
    };

    const fulfillResult = await fulfillPaidOrder(
      existingOrder,
      evidence,
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
      message:
        "Payment processed, student account provisioned, and verification email sent.",
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
