import { describe, it, expect } from "vitest";

// Ensure required environment variables exist before importing modules that validate env
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/ggc_test";
process.env.NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "test_nextauth_secret_at_least_32_characters_long_123";
process.env.NEXTAUTH_URL =
  process.env.NEXTAUTH_URL || "http://localhost:3000";
process.env.MIDTRANS_SERVER_KEY =
  process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-test-key";
process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-test-key";

describe("Midtrans Environment Separation & Payment Boundary (Change Set C)", () => {
  it("T-ENV-01: Resolves Sandbox URLs when NODE_ENV=production and MIDTRANS_ENV=sandbox", async () => {
    const { resolveMidtransConfig } = await import("@/lib/midtrans-config");

    const config = resolveMidtransConfig({
      NODE_ENV: "production",
      MIDTRANS_ENV: "sandbox",
      MIDTRANS_SERVER_KEY: "SB-Mid-server-staging-123",
      MIDTRANS_CLIENT_KEY: "SB-Mid-client-staging-123",
    });

    expect(config.isProduction).toBe(false);
    expect(config.coreApiBaseUrl).toBe("https://api.sandbox.midtrans.com");
    expect(config.snapBaseUrl).toBe("https://app.sandbox.midtrans.com/snap/v1");
    expect(config.snapScriptUrl).toBe(
      "https://app.sandbox.midtrans.com/snap/snap.js"
    );
  });

  it("T-ENV-02: Throws fatal error when a sandbox key (SB-Mid-server-...) is paired with MIDTRANS_ENV=production", async () => {
    const { resolveMidtransConfig } = await import("@/lib/midtrans-config");

    expect(() =>
      resolveMidtransConfig({
        NODE_ENV: "production",
        MIDTRANS_ENV: "production",
        MIDTRANS_SERVER_KEY: "SB-Mid-server-accidental-sandbox-key",
        MIDTRANS_CLIENT_KEY: "SB-Mid-client-accidental-sandbox-key",
      })
    ).toThrow(
      /FATAL: Sandbox Midtrans key configured with MIDTRANS_ENV=production/
    );
  });

  it("T-OUT-01: Generates a stable idempotency key (email-verify-${orderId}-${userId}) across retries", async () => {
    const { buildEmailVerifyIdempotencyKey } = await import(
      "@/lib/fulfillment"
    );

    const orderId = "GGC-1730000000000-4321";
    const userId = "user-uuid-999";

    const attempt1Key = buildEmailVerifyIdempotencyKey(orderId, userId);
    const attempt2Key = buildEmailVerifyIdempotencyKey(orderId, userId);
    const attempt3Key = buildEmailVerifyIdempotencyKey(orderId, userId);

    expect(attempt1Key).toBe(`email-verify-${orderId}-${userId}`);
    expect(attempt2Key).toBe(attempt1Key);
    expect(attempt3Key).toBe(attempt1Key);
  });

  it("T-PAY-01: fulfillPaidOrder rejects calls missing VerifiedPaymentEvidence", async () => {
    const { fulfillPaidOrder } = await import("@/lib/fulfillment");

    // 1. Missing evidence completely
    await expect(
      fulfillPaidOrder({
        id: "ord_1",
        order_id: "GGC-123",
        customer_name: "Attacker",
        customer_email: "attacker@example.com",
      } as any)
    ).rejects.toThrow(/PaymentAuthorizationError/);

    // 2. Untrusted source or non-settled status
    await expect(
      fulfillPaidOrder(
        {
          id: "ord_1",
          order_id: "GGC-123",
          customer_name: "Attacker",
          customer_email: "attacker@example.com",
        },
        {
          orderId: "GGC-123",
          transactionStatus: "pending",
          grossAmount: 49000,
          source: "MIDTRANS_CORE_API_VERIFY",
        }
      )
    ).rejects.toThrow(/PaymentAuthorizationError/);
  });
});
