"use client";

import React, { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

/**
 * Phase 2.5 Security Watcher:
 * Listens for server-side session revocations (e.g. account deactivated by admin).
 * If the session has an invalidation error or becomes unauthenticated on protected routes,
 * it immediately triggers NextAuth signOut to purge client state and cookies.
 */
function SessionSecurityWatcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // 1. If server explicitly invalidated token/session due to deactivation or deletion
    if (session && (session as any).error === "UserDeactivatedOrDeleted") {
      console.warn("🔒 [NextAuth Phase 2.5] Session revoked by server. Forcing sign out...");
      signOut({ callbackUrl: "/auth/login?error=SessionRevoked" });
      return;
    }

    // 2. If session became unauthenticated while user is actively on a protected page
    if (
      status === "unauthenticated" &&
      (pathname?.startsWith("/student") || pathname?.startsWith("/admin"))
    ) {
      console.warn("🔒 [NextAuth Phase 2.5] Unauthenticated on protected route. Redirecting to login...");
      signOut({ callbackUrl: "/auth/login" });
    }
  }, [session, status, pathname]);

  return <>{children}</>;
}

export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Re-evaluate user session every 5 minutes (Fase 2.5)
      refetchOnWindowFocus={true} // Re-evaluate user status whenever tab gains focus
    >
      <SessionSecurityWatcher>{children}</SessionSecurityWatcher>
    </NextAuthSessionProvider>
  );
}
