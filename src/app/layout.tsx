import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { React19Polyfill } from "@/components/React19Polyfill";
import { TopBar } from "@/components/layout/TopBar";
import { Providers } from "@/components/providers";
import { TourProvider } from "@/components/providers/TourProvider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zelo Assist",
  description: "AI Email Assistant - Reclaim your time.",
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
        <Providers>
          <TourProvider>
            <TopBar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </TourProvider>
        </Providers>
      </body>
    </html>
  );
}
