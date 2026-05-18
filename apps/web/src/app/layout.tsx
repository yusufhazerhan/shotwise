import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "@shotwise/ui-primitives";
import { AnalyticsProvider } from "@/components/analytics";

export const metadata: Metadata = {
  title: { default: "Shotwise", template: "%s · Shotwise" },
  description: "AI-powered App Store screenshot generator. 5-minute marketing studio for solo founders.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="auto">
      <body>
        <AnalyticsProvider>
          <ToastProvider>{children}</ToastProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
