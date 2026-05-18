/**
 * @shotwise/types — shared domain types across all packages and the web app.
 *
 * Pure types only — no runtime code. Re-exports `@shotwise/core` types so
 * consumers can import everything from one place.
 */

export type {
  RenderOptions,
  BatchRenderOptions,
  CanvasOptions,
  TitleOptions,
  ScreenshotOptions,
  Theme,
  ScreenSpec,
  TitlePosition,
  ShadowIntensity,
  BatchRenderResult,
  ThemeId,
  CanvasPresetId,
} from "@shotwise/core";

/** Supported locale codes for multi-language exports. */
export const LOCALES = ["en", "tr", "es", "fr", "de", "pt", "it", "ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
};

export interface AppMetadata {
  appName: string;
  category:
    | "productivity"
    | "health"
    | "lifestyle"
    | "education"
    | "pet"
    | "finance"
    | "social"
    | "utilities"
    | "other";
  tagline?: string;
  description?: string;
  targetAudience?: string;
  keyFeatures?: string[];
}

export interface ProjectConfig {
  themeId: string;
  canvasPresetId: string;
  languages: Locale[];
  defaultPosition: "top" | "bottom";
}

export interface AiAnalysis {
  description: string;
  uiElements: string[];
  suggestedCategory: string;
  suggestedTitles: string[];
  suggestedAccent: string;
  generatedAt: string; // ISO
}

export interface LocalizedText {
  /** Per-locale localized values. Source locale acts as canonical. */
  [locale: string]: { title: string; accent?: string } | undefined;
}

export type ExportJobStatus = "pending" | "running" | "succeeded" | "failed" | "refunded";

export interface ExportJobProgress {
  total: number;
  done: number;
  /** Currently rendering screen index (0-based). */
  currentIndex?: number;
  currentLocale?: Locale;
  message?: string;
}

export type CreditReason =
  | "signup_trial"
  | "purchase_starter"
  | "purchase_topup"
  | "monthly_refill"
  | "render_debit"
  | "export_refund"
  | "manual_grant";

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  amount: number; // positive = credit, negative = debit
  reason: CreditReason;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/** Wizard mode in-memory state (mirrored to Zustand store). */
export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  appMetadata: Partial<AppMetadata>;
  screenshotIds: string[];
  analysisStatus: "idle" | "running" | "done" | "error";
  selectedThemeId: string;
  selectedLanguages: Locale[];
  exportJobId?: string;
}

/** Render config sent from the editor to the preview/export pipeline. */
export interface ScreenRenderConfig {
  title: string;
  accent?: string;
  themeId: string;
  position?: "top" | "bottom";
  /** Per-screen overrides on top of theme defaults. */
  overrides?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    color?: string;
    accentColor?: string;
    background?: string;
    cornerRadius?: number;
    shadowIntensity?: "none" | "subtle" | "strong";
  };
}

export type PaddleProductKind = "starter_pack" | "topup_50";

export interface PaddleProduct {
  kind: PaddleProductKind;
  priceEnvVar: "PADDLE_PRICE_STARTER" | "PADDLE_PRICE_TOPUP";
  /** USD price (display only — Paddle is source of truth). */
  displayUsd: number;
  creditsGranted: number;
  /** Activates monthly refill grant for the user. */
  activatesMonthlyRefill: boolean;
  label: string;
}
