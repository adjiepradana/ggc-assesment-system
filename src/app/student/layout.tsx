import React from "react";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Phase 2.5: Guard against stale JWT tokens in server rendering
  if (!session || !session.user || (session as any).error === "UserDeactivatedOrDeleted") {
    redirect("/auth/login?error=SessionRevoked");
  }

  return (
    <div className="min-h-screen flex flex-col bg-ggc-tint dark:bg-[#031810] text-gray-900 dark:text-[#E8F1EC] transition-colors overflow-x-hidden">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
      <footer className="py-6 bg-white dark:bg-[#02140D] border-t border-ggc-subtle dark:border-[#0E4230] text-center text-xs text-gray-500 dark:text-gray-400 transition-colors">
        © {new Date().getFullYear()} Go Great Career (GGC) • Student Study Fit Assessment™ Portal
      </footer>
    </div>
  );
}
