import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

/**
 * Development & Testing Only:
 * Allows testers and developers to simulate a successful payment callback
 * without requiring live inbound webhook tunnels (ngrok) on localhost.
 * Strictly disabled in production.
 */
export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Forbidden. Simulasi pembayaran tidak diizinkan di lingkungan produksi." },
        { status: 403 }
      );
    }

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

    // Fulfill the order using simulated dev evidence (strictly gated by NODE_ENV !== "production" above)
    const fulfillmentResult = await fulfillPaidOrder(
      order,
      {
        orderId: order.order_id,
        transactionStatus: "settlement",
        grossAmount: order.amount,
        source: "MIDTRANS_CORE_API_VERIFY",
        paymentType: "simulator_bank_transfer",
        rawPayload: {
          simulated: true,
          simulation_note:
            "Payment successfully simulated in development test mode.",
          simulated_at: new Date().toISOString(),
        },
      },
      "simulator_bank_transfer"
    );

    // Ensure email is verified in development testing so user is not blocked
    if (order.user_id) {
      await prisma.user.update({
        where: { id: order.user_id },
        data: { email_verified: true },
      });
    } else if (fulfillmentResult.userId) {
      await prisma.user.update({
        where: { id: fulfillmentResult.userId },
        data: { email_verified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran berhasil! Tiket asesmen Anda telah aktif.",
      order_id,
      fulfillmentResult,
    });
  } catch (error: any) {
    console.error("Error in /api/payment/simulate-success:", error);
    return NextResponse.json(
      { error: "Gagal memproses simulasi pembayaran." },
      { status: 500 }
    );
  }
}
