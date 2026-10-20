import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import ThemeToggle from "@/components/ThemeToggle";

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
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved ? saved === 'dark' : prefersDark;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  const meta = document.querySelector('meta[name="color-scheme"]');
                  if (meta) meta.setAttribute('content', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  const meta = document.querySelector('meta[name="color-scheme"]');
                  if (meta) meta.setAttribute('content', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-ggc-tint dark:bg-[#031810] text-ggc-dark dark:text-[#F3F8F5] transition-colors duration-200">
        <SessionProvider>
          {children}
          <ThemeToggle />
        </SessionProvider>
      </body>
    </html>
  );
}
