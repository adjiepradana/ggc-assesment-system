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

const siteUrl = process.env.NEXTAUTH_URL || "https://gogreatcareer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GGC Study Fit Assessment™ - Tes Minat Bakat & Jurusan Kuliah",
    template: "%s | GGC Assessment",
  },
  description:
    "Asesmen tes minat bakat online akurat dengan 84 soal holistik. Temukan potensi, kecocokan jurusan kuliah, dan laporan karier untuk siswa SMA/sederajat.",
  keywords: [
    "tes minat bakat",
    "tes penjurusan SMA",
    "rekomendasi jurusan kuliah",
    "GGC",
    "psikotes online",
    "asesmen karier",
    "study fit assessment",
    "Go Great Career",
    "tes minat bakat kuliah",
    "jurusan kuliah terbaik",
  ],
  authors: [{ name: "Go Great Career", url: siteUrl }],
  creator: "Go Great Career",
  publisher: "Go Great Career",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Go Great Career (GGC)",
    title: "GGC Study Fit Assessment™ - Tes Minat Bakat & Jurusan Kuliah",
    description:
      "Asesmen tes minat bakat online akurat dengan 84 soal holistik. Temukan potensi, kecocokan jurusan kuliah, dan laporan karier untuk siswa SMA/sederajat.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GGC Study Fit Assessment™ - Tes Minat Bakat & Jurusan Kuliah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GGC Study Fit Assessment™ - Tes Minat Bakat & Jurusan Kuliah",
    description:
      "Asesmen tes minat bakat online akurat dengan 84 soal holistik. Temukan potensi, kecocokan jurusan kuliah, dan laporan karier untuk siswa SMA/sederajat.",
    images: ["/logo.png"],
    creator: "@gogreatcareer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
