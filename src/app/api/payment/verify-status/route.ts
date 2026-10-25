import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

/**
 * Verifies and reconciles order payment status directly with Midtrans Status API.
 * Called immediately upon Snap popup completion (onSuccess callback) to guarantee
 * zero-delay fulfillment even when webhooks are delayed or running on localhost.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
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

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const midtransBaseUrl = isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    // 1. If Midtrans Server Key is configured, query Midtrans Status API directly
    if (serverKey && !serverKey.includes("your_server_key_here")) {
      const basicAuth = Buffer.from(`${serverKey}:`).toString("base64");
      try {
        const midtransRes = await fetch(
          `${midtransBaseUrl}/v2/${encodeURIComponent(order_id)}/status`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Basic ${basicAuth}`,
            },
            cache: "no-store",
          }
        );

        if (midtransRes.ok) {
          const midtransData = await midtransRes.json();
          const txnStatus = midtransData.transaction_status;
          const fraudStatus = midtransData.fraud_status;

          const isSettled =
            txnStatus === "settlement" ||
            (txnStatus === "capture" && fraudStatus === "accept");

          if (isSettled) {
            await fulfillPaidOrder(
              order,
              midtransData,
              midtransData.payment_type || "midtrans"
            );

            return NextResponse.json({
              success: true,
              status: "SUCCESS",
              message: "Pembayaran telah terverifikasi sukses melalui Midtrans.",
            });
          }
        }
      } catch (fetchErr) {
        console.warn("Could not reach Midtrans Status API:", fetchErr);
      }
    }

    // 2. Development mode fallback: If in dev and called from onSuccess, fulfill directly
    if (process.env.NODE_ENV !== "production") {
      await fulfillPaidOrder(
        order,
        { direct_verify: true, verified_at: new Date().toISOString() },
        "dev_verified"
      );

      if (order.user_id) {
        await prisma.user.update({
          where: { id: order.user_id },
          data: { email_verified: true },
        });
      }

      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        message: "Order diverifikasi sukses (Mode Dev/Test).",
      });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
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
