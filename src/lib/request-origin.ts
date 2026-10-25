/**
 * Extracts the client-facing base URL from an incoming Next.js Request.
 * Prioritizes Origin, Referer, and X-Forwarded-Host headers.
 */
export function getRequestOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin && origin.startsWith("http")) {
    return origin.replace(/\/$/, "");
  }

  const referer = req.headers.get("referer");
  if (referer && referer.startsWith("http")) {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {}
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return "";
}
