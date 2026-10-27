import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export type PaymentVerificationSource =
  | "MIDTRANS_WEBHOOK"
  | "MIDTRANS_CORE_API_VERIFY";

export interface VerifiedPaymentEvidence {
  orderId: string;
  transactionStatus: "settlement" | "capture" | string;
  fraudStatus?: "accept" | string;
  grossAmount: string | number;
  source: PaymentVerificationSource;
  transactionId?: string;
  statusCode?: string;
  signatureHash?: string;
  paymentType?: string | null;
  settlementTime?: Date | string;
  rawPayload?: any;
}

export interface FulfillOrderResult {
  success: boolean;
  status: "SUCCESS" | "ALREADY_PROCESSED" | "FAILED";
  userId?: string;
  userEmail?: string;
  orderId: string;
  idempotencyKey?: string;
  emailSent: boolean;
  error?: string;
}

/**
 * Generates a deterministic, stable idempotency key for an order's verification email (DISC-03).
 * Never derives a new key when an attempt counter increases.
 */
export function buildEmailVerifyIdempotencyKey(
  orderId: string,
  userId: string
): string {
  return `email-verify-${orderId}-${userId}`;
}

/**
 * Validates that the caller supplied authoritative VerifiedPaymentEvidence (DISC-04, T-PAY-01).
 * Throws PaymentAuthorizationError if evidence is missing, forged, or non-settled.
 */
export function assertVerifiedPaymentEvidence(
  evidence: VerifiedPaymentEvidence | null | undefined,
  expectedOrderId?: string,
  expectedAmount?: number
): void {
  if (!evidence || typeof evidence !== "object") {
    throw new Error(
      "PaymentAuthorizationError: VerifiedPaymentEvidence is required to fulfill an order."
    );
  }

  if (!evidence.orderId || typeof evidence.orderId !== "string") {
    throw new Error(
      "PaymentAuthorizationError: VerifiedPaymentEvidence.orderId is missing."
    );
  }

  if (expectedOrderId && evidence.orderId !== expectedOrderId) {
    throw new Error(
      `PaymentAuthorizationError: Evidence orderId (${evidence.orderId}) does not match order (${expectedOrderId}).`
    );
  }

  if (
    evidence.source !== "MIDTRANS_WEBHOOK" &&
    evidence.source !== "MIDTRANS_CORE_API_VERIFY"
  ) {
    throw new Error(
      `PaymentAuthorizationError: Untrusted payment verification source "${String(
        (evidence as any).source
      )}".`
    );
  }

  const isSettled =
    evidence.transactionStatus === "settlement" ||
    (evidence.transactionStatus === "capture" &&
      (!evidence.fraudStatus || evidence.fraudStatus === "accept"));

  if (!isSettled) {
    throw new Error(
      `PaymentAuthorizationError: Transaction status "${evidence.transactionStatus}" is not settled.`
    );
  }

  const parsedAmount = Math.round(Number(evidence.grossAmount));
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error(
      "PaymentAuthorizationError: Invalid grossAmount in VerifiedPaymentEvidence."
    );
  }

  if (expectedAmount !== undefined && parsedAmount !== expectedAmount) {
    throw new Error(
      `PaymentAuthorizationError: Gross amount mismatch (expected ${expectedAmount}, got ${parsedAmount}).`
    );
  }
}

/**
 * Fulfills a paid Midtrans order idempotently inside the authoritative service boundary:
 * 1. Validates VerifiedPaymentEvidence (rejects any unverified caller).
 * 2. Performs atomic order claim via updateMany({ where: { order_id, status: { in: ["PENDING", "FAILED", "EXPIRED"] } }, data: { status: "SUCCESS" } }).
 * 3. If claim.count === 1:
 *    - Provisions or links User using PendingRegistration (or existing user) without overwriting is_active: false.
 *    - Deletes PendingRegistration and scrubs any legacy hashedPassword from Order.payment_details (F-14).
 *    - Creates VerificationToken (expires_at = NOW() + 24h).
 *    - Upserts EmailOutbox with stable idempotency_key ("email-verify-" + order.order_id + "-" + studentUser.id) and expires_at bound to token.expires_at (DISC-03, DISC-08).
 * 4. Dispatches verification email with the stable idempotencyKey and updates EmailOutbox status/attempts.
 */
export async function fulfillPaidOrder(
  orderOrEvidence:
    | {
        id: string;
        order_id: string;
        customer_name: string;
        customer_email: string;
        customer_phone?: string | null;
        amount?: number;
        payment_type?: string | null;
        payment_details?: any;
        user_id?: string | null;
      }
    | VerifiedPaymentEvidence,
  evidenceArg?: VerifiedPaymentEvidence,
  paymentTypeOverride?: string | null
): Promise<FulfillOrderResult> {
  // Support both fulfillPaidOrder(order, evidence, paymentType?) and fulfillPaidOrder(evidence)
  const isFirstArgEvidence =
    orderOrEvidence &&
    typeof orderOrEvidence === "object" &&
    "source" in orderOrEvidence &&
    "transactionStatus" in orderOrEvidence &&
    !("customer_email" in orderOrEvidence);

  const evidence: VerifiedPaymentEvidence | undefined = isFirstArgEvidence
    ? (orderOrEvidence as VerifiedPaymentEvidence)
    : evidenceArg;

  const targetOrderId = isFirstArgEvidence
    ? (orderOrEvidence as VerifiedPaymentEvidence).orderId
    : (orderOrEvidence as any)?.order_id;

  // Enforce authoritative payment evidence BEFORE catching general runtime errors
  assertVerifiedPaymentEvidence(evidence, targetOrderId);

  try {
    const currentOrder = await prisma.order.findUnique({
      where: { order_id: evidence!.orderId },
    });

    if (!currentOrder) {
      throw new Error(`Order ${evidence!.orderId} not found in database.`);
    }

    // Validate grossAmount against persisted order amount
    assertVerifiedPaymentEvidence(
      evidence,
      currentOrder.order_id,
      currentOrder.amount
    );

    const customerEmail = currentOrder.customer_email?.toLowerCase().trim();
    if (!customerEmail) {
      throw new Error(
        `Order ${currentOrder.order_id} is missing a customer email.`
      );
    }

    // 1. ATOMIC CLAIM: Transition order from PENDING / FAILED / EXPIRED -> SUCCESS
    const claim = await prisma.order.updateMany({
      where: {
        order_id: currentOrder.order_id,
        status: {
          in: ["PENDING", "FAILED", "EXPIRED"],
        },
      },
      data: {
        status: "SUCCESS",
      },
    });

    if (claim.count === 0) {
      console.log(
        `ℹ️ [Fulfillment] Order ${currentOrder.order_id} already claimed or in terminal state (${currentOrder.status}).`
      );
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        orderId: currentOrder.order_id,
        userId: currentOrder.user_id || undefined,
        userEmail: customerEmail,
        emailSent: false,
      };
    }

    // 2. PROVISIONING (claim.count === 1)
    const pendingReg = await prisma.pendingRegistration.findUnique({
      where: { order_id: currentOrder.order_id },
    });

    const customerName =
      pendingReg?.full_name?.trim() ||
      currentOrder.customer_name?.trim() ||
      "Siswa Baru GGC";
    const customerPhone =
      pendingReg?.phone?.trim() ||
      currentOrder.customer_phone?.trim() ||
      null;

    // Fallback to legacy payment_details.hashedPassword only if pre-existing order had it
    const legacyHashedPassword =
      (currentOrder.payment_details as any)?.hashedPassword || null;
    const registrationPasswordHash =
      pendingReg?.password_hash || legacyHashedPassword;

    const fallbackPassword = registrationPasswordHash
      ? null
      : `Ggc!${crypto.randomBytes(6).toString("hex")}`;
    const fallbackHashedPassword = fallbackPassword
      ? await bcrypt.hash(fallbackPassword, 10)
      : null;
    const finalHashedPassword =
      registrationPasswordHash || fallbackHashedPassword!;

    // A. Find or Create Student User (never overwrite is_active: false)
    let studentUser = currentOrder.user_id
      ? await prisma.user.findUnique({
          where: { id: currentOrder.user_id },
          include: { profile: true },
        })
      : null;

    if (!studentUser) {
      studentUser = await prisma.user.findUnique({
        where: { email: customerEmail },
        include: { profile: true },
      });
    }

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: customerEmail,
          password_hash: finalHashedPassword,
          role: "STUDENT",
          is_active: true,
          email_verified: false,
          profile: {
            create: {
              full_name: customerName,
              phone_number: customerPhone,
            },
          },
        },
        include: { profile: true },
      });
      console.log(`👤 [Fulfillment] Created new student user: ${customerEmail}`);
    } else {
      // Only update password_hash if user is active, unverified, and a registration password was supplied
      if (
        registrationPasswordHash &&
        studentUser.is_active !== false &&
        studentUser.email_verified === false
      ) {
        studentUser = await prisma.user.update({
          where: { id: studentUser.id },
          data: {
            password_hash: registrationPasswordHash,
          },
          include: { profile: true },
        });
      }
      console.log(
        `👤 [Fulfillment] Linked existing student user: ${customerEmail}`
      );
    }

    // B. Delete PendingRegistration & scrub any legacy hashedPassword from Order.payment_details (F-14)
    if (pendingReg) {
      await prisma.pendingRegistration
        .delete({
          where: { order_id: currentOrder.order_id },
        })
        .catch(() => {});
    }

    const existingDetails = {
      ...(((currentOrder.payment_details as any) &&
      typeof currentOrder.payment_details === "object"
        ? currentOrder.payment_details
        : {}) as Record<string, unknown>),
    };
    delete existingDetails.hashedPassword;

    const resolvedPaymentType =
      paymentTypeOverride ||
      evidence!.paymentType ||
      currentOrder.payment_type ||
      "midtrans";

    await prisma.order.update({
      where: { id: currentOrder.id },
      data: {
        status: "SUCCESS",
        user_id: studentUser.id,
        payment_type: resolvedPaymentType,
        payment_details: {
          ...existingDetails,
          verified_source: evidence!.source,
          ...(evidence!.rawPayload
            ? {
                midtrans_sync: evidence!.rawPayload,
                midtrans_notification: evidence!.rawPayload,
              }
            : {}),
        },
      },
    });

    // C. Create 24-hour VerificationToken
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.deleteMany({
      where: { user_id: studentUser.id },
    });

    const createdToken = await prisma.verificationToken.create({
      data: {
        token: rawToken,
        user_id: studentUser.id,
        expires_at: tokenExpiresAt,
      },
    });

    // D. Upsert EmailOutbox with stable idempotency_key and expires_at bound to token.expires_at (DISC-03, DISC-08)
    const idempotencyKey = buildEmailVerifyIdempotencyKey(
      currentOrder.order_id,
      studentUser.id
    );

    const outboxRecord = await prisma.emailOutbox.upsert({
      where: { idempotency_key: idempotencyKey },
      create: {
        order_id: currentOrder.order_id,
        user_id: studentUser.id,
        recipient_email: customerEmail,
        idempotency_key: idempotencyKey,
        status: "PROCESSING",
        attempts: 1,
        expires_at: createdToken.expires_at,
        locked_until: new Date(Date.now() + 60 * 1000),
      },
      update: {
        recipient_email: customerEmail,
        status: "PROCESSING",
        attempts: { increment: 1 },
        expires_at: createdToken.expires_at,
        locked_until: new Date(Date.now() + 60 * 1000),
      },
    });

    // 3. Dispatch verification email passing the stable idempotencyKey
    const studentDisplayName =
      studentUser.profile?.full_name ||
      customerName ||
      customerEmail.split("@")[0];

    const emailResult = await sendVerificationEmail(
      customerEmail,
      studentDisplayName,
      rawToken,
      { idempotencyKey }
    );

    if (emailResult.success) {
      await prisma.emailOutbox.update({
        where: { id: outboxRecord.id },
        data: {
          status: "SENT",
          sent_at: new Date(),
          locked_until: null,
          last_error: null,
        },
      });
    } else {
      await prisma.emailOutbox.update({
        where: { id: outboxRecord.id },
        data: {
          status: "PENDING",
          locked_until: null,
          last_error:
            emailResult.error || "Failed to dispatch verification email.",
        },
      });
    }

    return {
      success: true,
      status: "SUCCESS",
      userId: studentUser.id,
      userEmail: customerEmail,
      orderId: currentOrder.order_id,
      idempotencyKey,
      emailSent: emailResult.success,
    };
  } catch (error: any) {
    console.error(`❌ [Fulfillment Error] Order ${targetOrderId}:`, error);
    return {
      success: false,
      status: "FAILED",
      orderId: targetOrderId || "UNKNOWN",
      emailSent: false,
      error: error?.message || String(error),
    };
  }
}
