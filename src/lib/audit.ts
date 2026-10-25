import { prisma } from "@/lib/prisma";

export type AdminAuditAction =
  | "RESET_SESSION"
  | "TOGGLE_USER_ACTIVE"
  | "REVOKE_ACCESS"
  | "RESTORE_ACCESS"
  | "FORCE_UNLOCK_USER"
  | "EXPORT_DATA"
  | string;

export interface LogAdminActionParams {
  adminId: string;
  action: AdminAuditAction;
  targetId?: string | null;
  details?: Record<string, any> | null;
}

/**
 * Persists an administrative action to the admin audit log.
 * Safe and non-throwing: won't break the calling administrative operation if logging fails.
 */
export async function logAdminAction(
  adminId: string,
  action: AdminAuditAction,
  targetId?: string | null,
  details?: Record<string, any> | null
) {
  try {
    const log = await prisma.adminAuditLog.create({
      data: {
        admin_id: adminId,
        action,
        target_id: targetId || null,
        details: details || undefined,
      },
    });
    return log;
  } catch (error) {
    console.error("⚠️ [AdminAudit] Failed to record audit log:", {
      adminId,
      action,
      targetId,
      error,
    });
    return null;
  }
}
