"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";
import { buildPreviewSvg } from "@/lib/preview/svg-builder";
import { Button, Spinner } from "@shotwise/ui-primitives";

const THEME_DEFAULTS: Record<string, {
  bg: string;
  fg: string;
  accent: string;
  fontSize: number;
  fontWeight: number;
  position: "top" | "bottom";
  padding: number;
  ssTop: number;
  ssMaxWidth: number;
  ssMaxHeight: number;
  cornerRadius: number;
  shadow: "none" | "subtle" | "strong";
}> = {
  cream: { bg: "#F5EFE6", fg: "#1E3A2E", accent: "#C8866B", fontSize: 110, fontWeight: 800, position: "top", padding: 140, ssTop: 460, ssMaxWidth: 1000, ssMaxHeight: 1900, cornerRadius: 60, shadow: "subtle" },
  dark: { bg: "#0B0B0C", fg: "#F7F7F7", accent: "#FFB454", fontSize: 110, fontWeight: 800, position: "top", padding: 140, ssTop: 460, ssMaxWidth: 1000, ssMaxHeight: 1900, cornerRadius: 60, shadow: "strong" },
  premium: { bg: "linear-gradient(180deg, #F8F4EC 0%, #E6D9C3 100%)", fg: "#2B2520", accent: "#B8865E", fontSize: 110, fontWeight: 800, position: "top", padding: 140, ssTop: 460, ssMaxWidth: 1000, ssMaxHeight: 1900, cornerRadius: 60, shadow: "subtle" },
};

const CANVAS: Record<string, { width: number; height: number }> = {
  iphone67: { width: 1284, height: 2778 },
  iphone65: { width: 1242, height: 2688 },
  ipad129: { width: 2048, height: 2732 },
  android: { width: 1080, height: 1920 },
};

export function LivePreview({ screenshot, project }: { screenshot: Screenshot; project: Project }) {
  const [imageHref, setImageHref] = React.useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const config = (project.config ?? {}) as { themeId?: string; canvasPresetId?: string };
  const theme = THEME_DEFAULTS[config.themeId ?? "cream"] ?? THEME_DEFAULTS.cream!;
  const canvas = CANVAS[config.canvasPresetId ?? "iphone67"] ?? CANVAS.iphone67!;

  // Fetch the raw screenshot via a one-shot signed URL we get from /api/render/preview
  // — but for the live SVG, we just need an image URL. We can use the /api/render/preview
  // endpoint as a fast PNG, but for browser preview we use a presigned GET URL.
  // For simplicity, pull from a "preview-asset" route that streams the raw image.
  React.useEffect(() => {
    let cancelled = false;
    async function loadImage() {
      if (!screenshot.rawKey) {
        setImageHref(null);
        return;
      }
      // For now, embed via /api/preview-asset (we'll mount that lightweight route)
      const url = `/api/preview-asset?screenshotId=${screenshot.id}`;
      // Use a HEAD to ensure it's there; otherwise fall back to placeholder
      try {
        const r = await fetch(url);
        if (!r.ok) {
          setImageHref(null);
          return;
        }
        const blob = await r.blob();
        const reader = new FileReader();
        reader.onload = () => {
          if (!cancelled) setImageHref(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        if (!cancelled) setImageHref(null);
      }
    }
    void loadImage();
    return () => {
      cancelled = true;
    };
  }, [screenshot.id, screenshot.rawKey]);

  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string }>;
  const text = localized.en ?? { title: "Your title here", accent: undefined };

  const svg = imageHref
    ? buildPreviewSvg({
        canvas: { width: canvas.width, height: canvas.height, background: theme.bg },
        title: {
          text: text.title ?? "Your title here",
          accent: text.accent,
          color: theme.fg,
          accentColor: theme.accent,
          fontSize: theme.fontSize,
          fontWeight: theme.fontWeight,
          position: theme.position,
          padding: theme.padding,
          maxCharsPerLine: 22,
        },
        screenshot: {
          maxWidth: theme.ssMaxWidth,
          maxHeight: theme.ssMaxHeight,
          cornerRadius: theme.cornerRadius,
          shadow: theme.shadow,
          top: theme.ssTop,
        },
        imageHref,
      })
    : null;

  async function loadPixelPerfect() {
    setLoadingPreview(true);
    try {
      const r = await fetch("/api/render/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenshotId: screenshot.id,
          themeId: config.themeId ?? "cream",
          canvasPresetId: config.canvasPresetId ?? "iphone67",
          locale: "en",
        }),
      });
      if (!r.ok) return;
      const blob = await r.blob();
      const reader = new FileReader();
      reader.onload = () => {
        // Replace the inline preview with the server PNG
        setImageHref(null);
        const img = document.querySelector<HTMLImageElement>("[data-slot='pixel-preview']");
        if (img) img.src = reader.result as string;
      };
      reader.readAsDataURL(blob);
    } finally {
      setLoadingPreview(false);
    }
  }

  return (
    <div data-slot="live-preview" style={{ width: "100%", maxWidth: 280, position: "relative" }}>
      <div style={{ aspectRatio: `${canvas.width}/${canvas.height}`, background: "var(--muted)", borderRadius: "0.5rem", overflow: "hidden" }}>
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted-fg)" }}>
            {imageHref === null && !screenshot.rawKey ? "Waiting for upload…" : <Spinner />}
          </div>
        )}
      </div>
      <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
        <Button variant="ghost" size="sm" onClick={loadPixelPerfect} loading={loadingPreview}>
          Pixel-perfect preview
        </Button>
      </div>
      <img data-slot="pixel-preview" alt="" style={{ display: "none" }} />
    </div>
  );
}
