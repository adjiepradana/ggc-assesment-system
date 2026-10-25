import { prisma } from "@/lib/prisma";

/**
 * Checks whether a user has authorized paid access to take the GGC Study Fit Assessment™.
 *
 * Requirements for active access:
 * 1. Admin role always has access.
 * 2. User has at least one Order with status "SUCCESS".
 * 3. User already completed a session previously.
 * No email-based demo bypass exists: access strictly requires authentic paid orders.
 */
export async function checkUserPaidAccess(
  userId: string,
  userEmail?: string | null,
  userRole?: string | null
): Promise<boolean> {
  // 1. Administrators have unrestricted access
  if (userRole === "ADMIN") {
    return true;
  }

  try {
    const normalizedEmail = userEmail?.toLowerCase().trim();

    // 2. Check for a successful paid order
    const paidOrder = await prisma.order.findFirst({
      where: {
        status: "SUCCESS",
        OR: [
          { user_id: userId },
          ...(normalizedEmail ? [{ customer_email: normalizedEmail }] : []),
        ],
      },
    });

    if (paidOrder) {
      return true;
    }

    // 3. Check if student has an existing completed session
    const existingSession = await prisma.assessmentSession.findFirst({
      where: { user_id: userId },
    });

    if (existingSession && existingSession.status === "COMPLETED") {
      return true;
    }

    return false;
  } catch (error) {
    console.warn("⚠️ Error checking user paid access:", error);
    // In case of transient DB read error, default to false to protect paywall
    return false;
  }
}
