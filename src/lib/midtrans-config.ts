import { env } from "@/lib/env";

export interface MidtransEnvironmentConfig {
  midtransEnv: "sandbox" | "production";
  isProduction: boolean;
  serverKey: string;
  clientKey: string;
  coreApiBaseUrl: string;
  snapBaseUrl: string;
  snapScriptUrl: string;
}

/**
 * Resolves and validates Midtrans environment configuration (Specification A - DISC-01).
 *
 * Rules:
 * 1. Never infer payment environment from NODE_ENV (staging/preview builds run with NODE_ENV=production).
 * 2. Strictly select environment from MIDTRANS_ENV ("sandbox" | "production").
 * 3. Fail-closed if a sandbox key ("SB-Mid-server-...") is paired with MIDTRANS_ENV="production",
 *    or if a live key ("Mid-server-...") is paired with MIDTRANS_ENV="sandbox" in a production deployment.
 */
export function resolveMidtransConfig(overrides?: {
  MIDTRANS_ENV?: "sandbox" | "production";
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_CLIENT_KEY?: string;
  NODE_ENV?: string;
}): MidtransEnvironmentConfig {
  const midtransEnv =
    overrides?.MIDTRANS_ENV ??
    ((process.env.MIDTRANS_ENV as "sandbox" | "production" | undefined) ||
      env.MIDTRANS_ENV ||
      "sandbox");

  const isProduction = midtransEnv === "production";
  const serverKey =
    overrides?.MIDTRANS_SERVER_KEY ??
    process.env.MIDTRANS_SERVER_KEY ??
    env.MIDTRANS_SERVER_KEY ??
    "";
  const clientKey =
    overrides?.MIDTRANS_CLIENT_KEY ??
    process.env.MIDTRANS_CLIENT_KEY ??
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
    env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
    "";
  const nodeEnv = overrides?.NODE_ENV ?? process.env.NODE_ENV;

  const isSandboxKey = serverKey.startsWith("SB-Mid-server-");
  const isProductionKey = serverKey.startsWith("Mid-server-");

  if (isProduction && isSandboxKey) {
    throw new Error(
      "FATAL: Sandbox Midtrans key configured with MIDTRANS_ENV=production."
    );
  }

  if (!isProduction && isProductionKey && nodeEnv === "production") {
    throw new Error(
      "FATAL: Production Midtrans key configured with MIDTRANS_ENV=sandbox in production deployment."
    );
  }

  const coreApiBaseUrl = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  const snapBaseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1";

  const snapScriptUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return {
    midtransEnv,
    isProduction,
    serverKey,
    clientKey,
    coreApiBaseUrl,
    snapBaseUrl,
    snapScriptUrl,
  };
}

const activeConfig = resolveMidtransConfig();

export const MIDTRANS_IS_PRODUCTION = activeConfig.isProduction;
export const MIDTRANS_CORE_API_BASE_URL = activeConfig.coreApiBaseUrl;
export const MIDTRANS_SNAP_BASE_URL = activeConfig.snapBaseUrl;
export const MIDTRANS_SNAP_SCRIPT_URL = activeConfig.snapScriptUrl;
export const MIDTRANS_SERVER_KEY = activeConfig.serverKey;
export const MIDTRANS_CLIENT_KEY = activeConfig.clientKey;
