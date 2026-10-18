import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go Great Career (GGC) - Study Fit Assessment™",
  description:
    "Platform evaluasi komprehensif kecocokan studi dan eksplorasi karier berbasis 7 dimensi dan 84 indikator terintegrasi.",
  keywords: [
    "GGC",
    "Study Fit Assessment",
    "Karier Siswa",
    "Kecocokan Jurusan",
    "Asesmen Bakat Minat",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-ggc-tint text-ggc-dark">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
