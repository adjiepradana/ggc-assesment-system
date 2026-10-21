import midtransClient from "midtrans-client";
import crypto from "crypto";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

/**
 * Reusable Midtrans Snap Client instance
 */
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

export const midtransConfig = {
  isProduction,
  serverKey,
  clientKey,
  snapScriptUrl: isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js",
};

/**
 * Validates Midtrans webhook notification signature.
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  if (!serverKey || !signatureKey) return false;

  const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(rawString).digest("hex");

  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}
