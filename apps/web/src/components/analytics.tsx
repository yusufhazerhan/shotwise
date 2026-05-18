"use client";
import * as React from "react";
import posthog from "posthog-js";

let initialized = false;

export function AnalyticsProvider({ children, userId }: { children: React.ReactNode; userId?: string | null }) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (!initialized) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage+cookie",
      });
      initialized = true;
    }
    if (userId) posthog.identify(userId);
  }, [userId]);
  return <>{children}</>;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* noop */
  }
}
