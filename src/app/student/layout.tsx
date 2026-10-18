import React from "react";
import Navbar from "@/components/Navbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-ggc-tint overflow-x-hidden">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
      <footer className="py-6 bg-white border-t border-ggc-subtle text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Go Great Career (GGC) • Student Study Fit Assessment™ Portal
      </footer>
    </div>
  );
}
