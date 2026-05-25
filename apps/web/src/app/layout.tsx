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
  title: { default: "Shotwise — App Store and Play Store Screenshot Builder", template: "%s · Shotwise" },
  description:
    "Open-source local-first App Store and Google Play screenshot builder with templates, iPhone and Android mockups, localization, and PNG/ZIP exports.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  keywords: [
    "App Store screenshot generator",
    "Google Play screenshot generator",
    "iPhone screenshot mockup",
    "Android screenshot mockup",
    "iPad screenshots",
    "ASO screenshot design",
    "mobile app marketing screenshots",
    "localized app screenshots",
    "open-source screenshot editor",
    "local-first screenshot builder",
  ],
  openGraph: {
    title: "Shotwise — App Store and Play Store Screenshot Builder",
    description:
      "Create store-ready iPhone, iPad, Android, and Google Play screenshots locally with templates, device previews, localization, and PNG/ZIP export.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Shotwise Studio app screenshot builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shotwise — App Store and Play Store Screenshot Builder",
    description: "Open-source local screenshot builder for App Store and Google Play assets.",
    images: ["/og.png"],
  },
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
