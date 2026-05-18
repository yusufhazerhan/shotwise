import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@shotwise/ui-primitives";
import { AnalyticsProvider } from "@/components/analytics";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: { default: "Shotwise — App Store screenshots in 5 minutes", template: "%s · Shotwise" },
  description:
    "AI-powered App Store screenshot generator. Drop screenshots, describe your app, get a 9-locale ZIP. No Figma required.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <AnalyticsProvider>
          <ToastProvider>{children}</ToastProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
