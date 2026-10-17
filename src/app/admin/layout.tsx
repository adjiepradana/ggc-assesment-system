import React from "react";
import Navbar from "@/components/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 bg-white border-t border-gray-200 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Go Great Career (GGC) • Admin Console & Question Bank Manager
      </footer>
    </div>
  );
}
