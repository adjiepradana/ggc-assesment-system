/**
 * Returns the validated server-side application base URL from NEXTAUTH_URL.
 * SECURITY (Fix F-02): Never derives security URLs from untrusted request headers
 * (Origin, Referer, X-Forwarded-Host, Host) to prevent Host/Origin link poisoning.
 */
export function getRequestOrigin(_req?: Request): string {
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (nextAuthUrl && nextAuthUrl.startsWith("http")) {
    return nextAuthUrl.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}
