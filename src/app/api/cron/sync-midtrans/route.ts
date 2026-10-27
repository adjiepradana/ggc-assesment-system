import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder, VerifiedPaymentEvidence } from "@/lib/fulfillment";
import {
  MIDTRANS_CORE_API_BASE_URL,
  MIDTRANS_SERVER_KEY,
} from "@/lib/midtrans-config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Security Authorization Gate
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        authHeader === cronSecret ||
        req.headers.get("x-cron-secret") === cronSecret;

      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Unauthorized. Invalid or missing CRON_SECRET." },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, require CRON_SECRET to be configured to prevent unauthorized runs
      return NextResponse.json(
        { error: "CRON_SECRET must be configured in environment variables." },
        { status: 500 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey.includes("your_server_key_here")) {
      return NextResponse.json(
        {
          error:
            "MIDTRANS_SERVER_KEY is not configured. Cannot query Midtrans Status API.",
        },
        { status: 500 }
      );
    }

    // 2. Query PENDING orders created between 15 minutes ago and 24 hours ago
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        created_at: {
          lte: fifteenMinutesAgo,
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: { created_at: "asc" },
      take: 50, // Batch limit to prevent function timeout
    });

    console.log(
      `🕒 [Cron Sync Midtrans] Found ${pendingOrders.length} pending order(s) eligible for status sync.`
    );

    if (pendingOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending orders older than 15 minutes found.",
        checkedCount: 0,
        settledCount: 0,
        failedCount: 0,
        stillPendingCount: 0,
      });
    }

    // 3. Prepare Midtrans API endpoint and Basic Auth
    const midtransBaseUrl = MIDTRANS_CORE_API_BASE_URL;
    const basicAuth = Buffer.from(`${serverKey}:`).toString("base64");

    const settledOrders: string[] = [];
    const failedOrders: string[] = [];
    const stillPendingOrders: string[] = [];
    const errorDetails: Array<{ order_id: string; error: string }> = [];

    // 4. Iterate and reconcile each pending order
    for (const order of pendingOrders) {
      try {
        console.log(`🔍 [Cron Sync] Querying Midtrans status for order: ${order.order_id}`);

        const response = await fetch(
          `${midtransBaseUrl}/v2/${encodeURIComponent(order.order_id)}/status`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Basic ${basicAuth}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          // If 404, order was not completed at all on Midtrans
          if (response.status === 404) {
            console.log(
              `ℹ️ [Cron Sync] Order ${order.order_id} not found in Midtrans (unattempted).`
            );
            stillPendingOrders.push(order.order_id);
            continue;
          }

          const errText = await response.text();
          throw new Error(`Midtrans API responded with ${response.status}: ${errText}`);
        }

        const midtransData = await response.json();
        const transactionStatus = midtransData.transaction_status;
        const fraudStatus = midtransData.fraud_status;

        console.log(
          `📊 [Cron Sync] Order ${order.order_id} returned status: ${transactionStatus}`
        );

        // A. SUCCESS (Settlement or Capture with Accept)
        const isSettled =
          transactionStatus === "settlement" ||
          (transactionStatus === "capture" && fraudStatus === "accept");

        if (isSettled) {
          const numericGrossAmount = Math.round(
            Number(midtransData.gross_amount)
          );
          if (
            !Number.isFinite(numericGrossAmount) ||
            numericGrossAmount !== order.amount
          ) {
            errorDetails.push({
              order_id: order.order_id,
              error: `Gross amount mismatch (expected ${order.amount}, got ${midtransData.gross_amount})`,
            });
            continue;
          }

          console.log(`🎉 [Cron Sync Rescuer] Fulfilling order ${order.order_id}...`);
          const evidence: VerifiedPaymentEvidence = {
            orderId: order.order_id,
            transactionId: midtransData.transaction_id,
            transactionStatus: transactionStatus,
            fraudStatus: fraudStatus,
            grossAmount: midtransData.gross_amount,
            statusCode: midtransData.status_code,
            signatureHash: midtransData.signature_key,
            paymentType: midtransData.payment_type,
            settlementTime: midtransData.settlement_time,
            source: "MIDTRANS_CORE_API_VERIFY",
            rawPayload: midtransData,
          };

          const fulfillResult = await fulfillPaidOrder(
            order,
            evidence,
            midtransData.payment_type
          );

          if (fulfillResult.success) {
            settledOrders.push(order.order_id);
          } else {
            errorDetails.push({
              order_id: order.order_id,
              error: fulfillResult.error || "Fulfillment failed",
            });
          }
          continue;
        }

        // B. EXPIRED / FAILED / CANCELLED / DENIED
        const isFailedOrExpired =
          transactionStatus === "expire" ||
          transactionStatus === "cancel" ||
          transactionStatus === "deny" ||
          transactionStatus === "failure";

        if (isFailedOrExpired) {
          const newStatus = transactionStatus === "expire" ? "EXPIRED" : "FAILED";
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              payment_type: midtransData.payment_type || order.payment_type,
              payment_details: {
                ...((order.payment_details as any) || {}),
                midtrans_cron_sync: midtransData,
              },
            },
          });
          failedOrders.push(order.order_id);
          continue;
        }

        // C. STILL PENDING on Midtrans
        stillPendingOrders.push(order.order_id);
      } catch (orderError: any) {
        console.error(
          `❌ [Cron Sync] Error processing order ${order.order_id}:`,
          orderError
        );
        errorDetails.push({
          order_id: order.order_id,
          error: orderError?.message || String(orderError),
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedCount: pendingOrders.length,
      settledCount: settledOrders.length,
      settledOrders,
      failedCount: failedOrders.length,
      failedOrders,
      stillPendingCount: stillPendingOrders.length,
      stillPendingOrders,
      errors: errorDetails,
    });
  } catch (error: any) {
    console.error("❌ Fatal error in /api/cron/sync-midtrans:", error);
    return NextResponse.json(
      {
        error: "Internal server error running Midtrans sync cron.",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
