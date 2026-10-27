import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

// In-memory fallback map when database is temporarily unreachable
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts a normalized client IP from incoming request headers or NextAuth req object.
 */
export function getClientIp(
  reqOrHeaders?:
    | Request
    | { headers?: Record<string, string | string[] | undefined> | Headers }
    | null
): string {
  if (!reqOrHeaders) return "unknown";

  try {
    const headersObj =
      "headers" in reqOrHeaders && reqOrHeaders.headers
        ? reqOrHeaders.headers
        : (reqOrHeaders as any);

    const readHeader = (name: string): string | null => {
      if (typeof headersObj?.get === "function") {
        return headersObj.get(name);
      }
      if (headersObj && typeof headersObj === "object") {
        const val = headersObj[name] || headersObj[name.toLowerCase()];
        if (Array.isArray(val)) return val[0] || null;
        if (typeof val === "string") return val;
      }
      return null;
    };

    const xForwardedFor = readHeader("x-forwarded-for");
    if (xForwardedFor) {
      const firstIp = xForwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }

    const xRealIp = readHeader("x-real-ip");
    if (xRealIp?.trim()) {
      return xRealIp.trim();
    }
  } catch {
    // Ignore header extraction errors
  }

  return "unknown";
}

function consumeMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: new Date(resetAt),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  );

  return {
    allowed,
    remaining,
    resetAt: new Date(existing.resetAt),
    retryAfterSeconds,
  };
}

/**
 * Shared fixed-window rate limiter backed by PostgreSQL ("rate_limit_buckets")
 * with automatic in-memory fallback if the database is unreachable (F-04, F-09).
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const nextResetAt = new Date(now.getTime() + windowMs);

  try {
    const rows = await prisma.$queryRaw<
      Array<{ count: number; reset_at: Date }>
    >`
      INSERT INTO "rate_limit_buckets" ("key", "count", "reset_at", "updated_at")
      VALUES (${key}, 1, ${nextResetAt}, ${now})
      ON CONFLICT ("key") DO UPDATE
      SET
        "count" = CASE
          WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN 1
          ELSE "rate_limit_buckets"."count" + 1
        END,
        "reset_at" = CASE
          WHEN "rate_limit_buckets"."reset_at" <= ${now} THEN ${nextResetAt}
          ELSE "rate_limit_buckets"."reset_at"
        END,
        "updated_at" = ${now}
      RETURNING "count", "reset_at";
    `;

    const row = rows[0];
    if (!row) {
      return consumeMemoryRateLimit(key, limit, windowMs);
    }

    const currentCount = Number(row.count);
    const resetAt = new Date(row.reset_at);
    const allowed = currentCount <= limit;
    const remaining = Math.max(0, limit - currentCount);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetAt.getTime() - now.getTime()) / 1000)
    );

    return {
      allowed,
      remaining,
      resetAt,
      retryAfterSeconds,
    };
  } catch {
    return consumeMemoryRateLimit(key, limit, windowMs);
  }
}
