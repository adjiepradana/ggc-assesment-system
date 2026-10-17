import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-ggc-tint text-ggc-dark">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
