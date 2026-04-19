import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { React19Polyfill } from "@/components/React19Polyfill";
import { TopBar } from "@/components/layout/TopBar";
import { Providers } from "@/components/providers";
import { TourProvider } from "@/components/providers/TourProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { InstallBanner } from "@/components/InstallBanner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xeloflow.com"),
  title: "Xelo Flow | AI Email Automation & Intelligent Inbox",
  description: "Xelo Flow uses advanced AI to automate your Gmail, prioritize urgent emails, and draft responses. Reclaim hours of your life every week.",
  keywords: ["AI Email", "Email Automation", "Gmail AI", "Inbox Productivity", "Xelo Flow"],
  authors: [{ name: "Xelo Flow Team" }],
  openGraph: {
    title: "Xelo Flow | Your AI Inbox Companion",
    description: "Automate your Gmail with AI. Prioritize what matters and let Xelo Flow handle the rest.",
    url: "https://xeloflow.com",
    siteName: "Xelo Flow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xelo Flow Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xelo Flow | AI Email Assistant",
    description: "Reclaim your time with AI-powered email automation.",
    images: ["/og-image.png"],
    creator: "@xeloflow",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xelo Flow",
  },
};

export const viewport = {
  themeColor: "#0a192f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          jakarta.variable
        )}
      >
        <React19Polyfill />
        <PWAProvider>
          <Providers>
            <TourProvider>
              <TopBar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <InstallBanner />
            </TourProvider>
          </Providers>
        </PWAProvider>
      </body>
    </html>
  );
}
