import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder, VerifiedPaymentEvidence } from "@/lib/fulfillment";
import {
  MIDTRANS_CORE_API_BASE_URL,
  MIDTRANS_SERVER_KEY,
} from "@/lib/midtrans-config";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Verifies and reconciles order payment status directly with Midtrans Core Status API.
 *
 * SECURITY (DISC-04, F-19):
 * - Completely abolishes any non-production unauthenticated fallback bypass.
 * - Always queries Midtrans Core API (MIDTRANS_CORE_API_BASE_URL), verifies
 *   Math.round(Number(midtransData.gross_amount)) === order.amount, and only invokes
 *   fulfillPaidOrder with valid VerifiedPaymentEvidence.
 */
export async function POST(req: Request) {
  try {
    // Rate Limit (F-09): max 10 status verification requests per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = await consumeRateLimit(
      `verify-status:ip:${clientIp}`,
      10,
      60_000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message:
            "Terlalu banyak permintaan verifikasi pembayaran. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }
    const body = await req.json();
    const { order_id } = body;

    if (!order_id || typeof order_id !== "string") {
      return NextResponse.json(
        { error: "Parameter order_id wajib disertakan." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { order_id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan." },
        { status: 404 }
      );
    }

    if (order.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        message: "Order sudah berstatus sukses.",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey.includes("your_server_key_here")) {
      return NextResponse.json(
        {
          error:
            "Konfigurasi Midtrans Server Key belum tersedia untuk verifikasi langsung.",
        },
        { status: 503 }
      );
    }

    const basicAuth = Buffer.from(`${serverKey}:`).toString("base64");
    const midtransRes = await fetch(
      `${MIDTRANS_CORE_API_BASE_URL}/v2/${encodeURIComponent(order_id)}/status`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        cache: "no-store",
      }
    );

    if (!midtransRes.ok) {
      return NextResponse.json(
        {
          success: false,
          status: order.status,
          error: "Status pembayaran belum dapat diverifikasi dari Midtrans.",
        },
        { status: 400 }
      );
    }

    const midtransData = await midtransRes.json();
    const txnStatus = midtransData.transaction_status;
    const fraudStatus = midtransData.fraud_status;
    const grossAmountNumeric = Math.round(Number(midtransData.gross_amount));

    if (
      !Number.isFinite(grossAmountNumeric) ||
      grossAmountNumeric !== order.amount
    ) {
      console.error(
        `🚨 [Verify Status] Gross amount mismatch for order ${order_id}: expected ${order.amount}, got ${midtransData.gross_amount}`
      );
      return NextResponse.json(
        {
          error: "Nominal transaksi tidak sesuai dengan pesanan.",
        },
        { status: 400 }
      );
    }

    const isSettled =
      txnStatus === "settlement" ||
      (txnStatus === "capture" && (!fraudStatus || fraudStatus === "accept"));

    if (isSettled) {
      const evidence: VerifiedPaymentEvidence = {
        orderId: order.order_id,
        transactionId: midtransData.transaction_id,
        transactionStatus: txnStatus,
        fraudStatus: fraudStatus,
        grossAmount: midtransData.gross_amount,
        statusCode: midtransData.status_code,
        signatureHash: midtransData.signature_key,
        paymentType: midtransData.payment_type || "midtrans",
        settlementTime: midtransData.settlement_time,
        source: "MIDTRANS_CORE_API_VERIFY",
        rawPayload: midtransData,
      };

      const fulfillResult = await fulfillPaidOrder(
        order,
        evidence,
        midtransData.payment_type || "midtrans"
      );

      if (!fulfillResult.success) {
        return NextResponse.json(
          {
            error:
              fulfillResult.error ||
              "Gagal memproses pemenuhan pesanan setelah verifikasi.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        message: "Pembayaran telah terverifikasi sukses melalui Midtrans.",
      });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      transaction_status: txnStatus,
      message: "Status order saat ini: " + order.status,
    });
  } catch (error: any) {
    console.error("Error in /api/payment/verify-status:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi status pembayaran." },
      { status: 500 }
    );
  }
}
