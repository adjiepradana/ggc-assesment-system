import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export interface FulfillOrderResult {
  success: boolean;
  status: "SUCCESS" | "ALREADY_PROCESSED" | "FAILED";
  userId?: string;
  userEmail?: string;
  orderId: string;
  emailSent: boolean;
  error?: string;
}

/**
 * Fulfills a paid Midtrans order idempotently (Phase 2.2):
 * 1. ATOMIC GUARD: Checks current order status in DB. If already SUCCESS, returns ALREADY_PROCESSED immediately.
 * 2. PROVISIONING (Sequential):
 *    - Upserts/reactivates User record
 *    - Updates Order status to SUCCESS and links user_id
 *    - Creates 24h VerificationToken
 * 3. Dispatches verification email via Nodemailer after all DB writes succeed.
 */
export async function fulfillPaidOrder(
  order: {
    id: string;
    order_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string | null;
    payment_type?: string | null;
    payment_details?: any;
    user_id?: string | null;
  },
  midtransPayload?: any,
  paymentType?: string | null
): Promise<FulfillOrderResult> {
  try {
    const customerEmail = order.customer_email?.toLowerCase().trim();
    if (!customerEmail) {
      throw new Error(`Order ${order.order_id} is missing a customer email.`);
    }

    const customerName = order.customer_name?.trim() || "Siswa Baru GGC";
    const customerPhone = order.customer_phone?.trim() || null;

    // 1. ATOMIC GUARD: Check current status
    const currentOrder = await prisma.order.findUnique({
      where: { order_id: order.order_id },
    });

    if (!currentOrder || currentOrder.status === "SUCCESS") {
      console.log(`ℹ️ [Fulfillment] Order ${order.order_id} is already processed as SUCCESS or not found.`);
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        orderId: order.order_id,
        userId: currentOrder?.user_id || undefined,
        userEmail: customerEmail,
        emailSent: false,
      };
    }

    // Retrieve hashedPassword stored securely in order.payment_details (from checkout pre-creation)
    const savedHashedPassword =
      (order.payment_details as any)?.hashedPassword || null;

    const fallbackPassword = savedHashedPassword
      ? null
      : `Ggc!${crypto.randomBytes(6).toString("hex")}`;
    const fallbackHashedPassword = fallbackPassword
      ? await bcrypt.hash(fallbackPassword, 10)
      : null;
    const finalHashedPassword = savedHashedPassword || fallbackHashedPassword;

    // 2. PROVISIONING (Sequential)

    // A. Upsert User
    let studentUser = await prisma.user.findUnique({
      where: { email: customerEmail },
      include: { profile: true },
    });

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: customerEmail,
          password_hash: finalHashedPassword!,
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
      studentUser = await prisma.user.update({
        where: { id: studentUser.id },
        data: {
          is_active: true,
          ...(savedHashedPassword ? { password_hash: savedHashedPassword } : {}),
        },
        include: { profile: true },
      });
      console.log(`👤 [Fulfillment] Re-activated existing student user: ${customerEmail}`);
    }

    // B. Update Order record to SUCCESS and link user_id
    const existingDetails = (currentOrder.payment_details as any) || {};
    await prisma.order.update({
      where: { id: currentOrder.id },
      data: {
        status: "SUCCESS",
        user_id: studentUser.id,
        payment_type: paymentType || currentOrder.payment_type || order.payment_type,
        payment_details: {
          ...existingDetails,
          ...(midtransPayload ? { midtrans_sync: midtransPayload, midtrans_notification: midtransPayload } : {}),
        },
      },
    });

    // C. Create VerificationToken (24-hour expiry)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.deleteMany({
      where: { user_id: studentUser.id },
    });

    await prisma.verificationToken.create({
      data: {
        token: rawToken,
        user_id: studentUser.id,
        expires_at: expiresAt,
      },
    });

    console.log(`🔑 [Fulfillment] Verification token created for ${customerEmail}`);

    // 3. Dispatch verification email
    const studentDisplayName =
      studentUser.profile?.full_name || customerName || customerEmail.split("@")[0];

    const emailResult = await sendVerificationEmail(
      customerEmail,
      studentDisplayName,
      rawToken
    );

    console.log(`📧 [Fulfillment] Verification email dispatched for ${customerEmail}:`, {
      success: emailResult.success,
      messageId: emailResult.messageId,
    });

    return {
      success: true,
      status: "SUCCESS",
      userId: studentUser.id,
      userEmail: customerEmail,
      orderId: order.order_id,
      emailSent: emailResult.success,
    };
  } catch (error: any) {
    console.error(`❌ [Fulfillment Error] Order ${order.order_id}:`, error);
    return {
      success: false,
      status: "FAILED",
      orderId: order.order_id,
      emailSent: false,
      error: error?.message || String(error),
    };
  }
}
