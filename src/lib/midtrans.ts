import midtransClient from "midtrans-client";
import crypto from "crypto";
import {
  MIDTRANS_IS_PRODUCTION,
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_CORE_API_BASE_URL,
  MIDTRANS_SNAP_BASE_URL,
  MIDTRANS_SNAP_SCRIPT_URL,
} from "@/lib/midtrans-config";

/**
 * Reusable Midtrans Snap Client instance
 */
export const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

export const midtransConfig = {
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
  coreApiBaseUrl: MIDTRANS_CORE_API_BASE_URL,
  snapBaseUrl: MIDTRANS_SNAP_BASE_URL,
  snapScriptUrl: MIDTRANS_SNAP_SCRIPT_URL,
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
  const activeServerKey = process.env.MIDTRANS_SERVER_KEY || MIDTRANS_SERVER_KEY;
  if (!activeServerKey || !signatureKey) return false;

  const rawString = `${orderId}${statusCode}${grossAmount}${activeServerKey}`;
  const computedHash = crypto
    .createHash("sha512")
    .update(rawString)
    .digest("hex");

  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}
