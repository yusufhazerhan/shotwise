import type { Locale, StoreScreenshotScene } from "@shotwise/types";
import type { Project, Screenshot } from "@shotwise/db";

export const STORE_PRESETS = {
  iphone69: { width: 1290, height: 2796, label: 'iPhone 6.9" · 1290×2796', kind: "iphone" },
  iphone67: { width: 1284, height: 2778, label: 'iPhone 6.7" · 1284×2778', kind: "iphone" },
  iphone65: { width: 1242, height: 2688, label: 'iPhone 6.5" · 1242×2688', kind: "iphone" },
  iphone61: { width: 1179, height: 2556, label: 'iPhone 6.1" · 1179×2556', kind: "iphone" },
  iphone55: { width: 1242, height: 2208, label: 'iPhone 5.5" · 1242×2208', kind: "iphone" },
  ipad13: { width: 2064, height: 2752, label: 'iPad 13" · 2064×2752', kind: "ipad" },
  ipadPro129: { width: 2048, height: 2732, label: 'iPad 12.9" · 2048×2732', kind: "ipad" },
  ipad11: { width: 1668, height: 2420, label: 'iPad 11" · 1668×2420', kind: "ipad" },
  android: { width: 1080, height: 2400, label: "Android Pixel · 1080×2400", kind: "android" },
  pixel9: { width: 1080, height: 2424, label: "Pixel 9 Pro · 1080×2424", kind: "android" },
  pixelFold: { width: 2208, height: 1840, label: "Pixel Fold · 2208×1840", kind: "android" },
  galaxy: { width: 1440, height: 3088, label: "Samsung Galaxy · 1440×3088", kind: "android" },
  galaxyS24: { width: 1440, height: 3120, label: "Galaxy S24 Ultra · 1440×3120", kind: "android" },
  oneplus: { width: 1440, height: 3216, label: "OnePlus Tall · 1440×3216", kind: "android" },
  playPhone: { width: 1080, height: 1920, label: "Google Play Phone · 1080×1920", kind: "android" },
  playTablet: { width: 1600, height: 2560, label: "Google Play Tablet · 1600×2560", kind: "android" },
} as const;

export type StorePresetId = keyof typeof STORE_PRESETS;

export const FONT_OPTIONS = [
  "Fraunces, Georgia, serif",
  "Sora, system-ui, sans-serif",
  "Outfit, system-ui, sans-serif",
  "Plus Jakarta Sans, system-ui, sans-serif",
  "Playfair Display, Georgia, serif",
  "DM Serif Display, Georgia, serif",
  "Crimson Pro, Georgia, serif",
  "Space Grotesk, system-ui, sans-serif",
] as const;

const THEME_BACKGROUNDS = {
  cream: { type: "solid", color: "#F4EFE5" },
  dark: { type: "linear", from: "#0B0F0D", to: "#203B31", angle: 145, midpoint: 100 },
  premium: { type: "linear", from: "#F8F1E7", to: "#DDB28F", angle: 140, midpoint: 100 },
  blue: { type: "linear", from: "#E9F2FF", to: "#8DB7F4", angle: 140, midpoint: 100 },
  graphite: { type: "solid", color: "#161716" },
} as const;

export type EditorProjectConfig = {
  editor?: {
    canvasPresetId?: StorePresetId;
    languages?: Locale[];
    themeId?: keyof typeof THEME_BACKGROUNDS;
    layoutPreset?: StoreScreenshotScene["layoutPreset"];
    defaultFont?: string;
    selectedDevicePresetIds?: StorePresetId[];
    includeFeatureGraphic?: boolean;
    stylePresetId?: string;
    templateId?: string;
  };
  themeId?: string;
  canvasPresetId?: string;
  languages?: Locale[];
  defaultPosition?: "top" | "bottom";
};

export function getEditorConfig(project: Project): Required<NonNullable<EditorProjectConfig["editor"]>> {
  const config = (project.config ?? {}) as EditorProjectConfig;
  const legacyPreset = normalizePreset(config.canvasPresetId);
  return {
    canvasPresetId: normalizePreset(config.editor?.canvasPresetId ?? legacyPreset),
    languages: config.editor?.languages ?? config.languages ?? ["en"],
    themeId: (config.editor?.themeId ?? config.themeId ?? "cream") as keyof typeof THEME_BACKGROUNDS,
    layoutPreset: config.editor?.layoutPreset ?? "single",
    defaultFont: config.editor?.defaultFont ?? FONT_OPTIONS[0],
    selectedDevicePresetIds: (config.editor?.selectedDevicePresetIds?.length ? config.editor.selectedDevicePresetIds : [normalizePreset(config.editor?.canvasPresetId ?? legacyPreset)]) as StorePresetId[],
    includeFeatureGraphic: config.editor?.includeFeatureGraphic ?? false,
    stylePresetId: config.editor?.stylePresetId ?? "cream-calm",
    templateId: config.editor?.templateId ?? "classic-app-store",
  };
}

export function getPreset(id: string | undefined) {
  return STORE_PRESETS[normalizePreset(id)];
}

export function normalizePreset(id: string | undefined): StorePresetId {
  if (id === "ipad129") return "ipadPro129";
  if (id === "playPhone") return "android";
  if (id && id in STORE_PRESETS) return id as StorePresetId;
  return "iphone69";
}

export function getScene(screenshot: Screenshot | null, project: Project): StoreScreenshotScene {
  const cfg = getEditorConfig(project);
  const localized = (screenshot?.localized ?? {}) as Record<string, { title?: string; accent?: string; subtitle?: string }>;
  const text = localized.en ?? { title: "Your title here" };
  const overrides = (screenshot?.renderOverrides ?? {}) as { scene?: Partial<StoreScreenshotScene> };
  return normalizeScene(overrides.scene, cfg, text);
}

export function normalizeScene(
  partial: Partial<StoreScreenshotScene> | undefined,
  cfg: ReturnType<typeof getEditorConfig>,
  text: { title?: string; subtitle?: string; accent?: string } = {}
): StoreScreenshotScene {
  const preset = getPreset(partial?.canvasPresetId ?? cfg.canvasPresetId);
  const deviceKind = preset.kind as "iphone" | "ipad" | "android";
  const bg = THEME_BACKGROUNDS[cfg.themeId] ?? THEME_BACKGROUNDS.cream;
  const base: StoreScreenshotScene = {
    version: 1,
    canvasPresetId: cfg.canvasPresetId,
    background: bg,
    layoutPreset: cfg.layoutPreset,
    device: {
      enabled: true,
      kind: deviceKind,
      frameStyle: "bezel",
      padding: deviceKind === "ipad" ? 34 : 26,
      radius: deviceKind === "android" ? 42 : 64,
      shadow: "strong",
      tilt: 0,
      hideStatusBar: false,
    },
    screenshot: {
      x: 0.5,
      y: 0.46,
      width: deviceKind === "ipad" ? 0.68 : 0.54,
      scale: 1,
      rotation: 0,
      fit: "contain",
    },
    screenshots: [
      {
        id: "primary",
        x: 0.5,
        y: 0.46,
        width: deviceKind === "ipad" ? 0.68 : 0.54,
        scale: 1,
        rotation: 0,
        fit: "contain",
      },
    ],
    textBlocks: [
      {
        id: "title",
        role: "title",
        text: text.title ?? "Your title here",
        accent: text.accent,
        x: 0.1,
        y: 0.075,
        width: 0.8,
        align: "center",
        fontFamily: cfg.defaultFont,
        fontSize: 0.044,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: 0.04,
        wordSpacing: 0.42,
        color: cfg.themeId === "dark" || cfg.themeId === "graphite" ? "#F6F0E7" : "#193D31",
        accentColor: "#DF7958",
      },
      {
        id: "subtitle",
        role: "subtitle",
        text: text.subtitle ?? "",
        x: 0.18,
        y: 0.165,
        width: 0.64,
        align: "center",
        fontFamily: "Sora, system-ui, sans-serif",
        fontSize: 0.018,
        fontWeight: 500,
        lineHeight: 1.24,
        letterSpacing: 0.006,
        wordSpacing: 0.28,
        color: cfg.themeId === "dark" || cfg.themeId === "graphite" ? "#D8E1DA" : "#587167",
        accentColor: "#DF7958",
      },
    ],
    callouts: [],
    advanced: {},
  };

  const primary = partial?.screenshots?.[0] ?? partial?.screenshot ?? base.screenshot;

  return {
    ...base,
    ...partial,
    background: partial?.background ?? base.background,
    device: { ...base.device, ...(partial?.device ?? {}) },
    screenshot: { ...base.screenshot, ...primary },
    screenshots: partial?.screenshots?.length
      ? partial.screenshots.map((slot, index) => ({
          ...slot,
          id: slot.id || `slot-${index + 1}`,
        }))
      : [{ id: "primary", ...base.screenshot, ...(partial?.screenshot ?? {}) }],
    textBlocks: partial?.textBlocks?.length ? partial.textBlocks.map((block) => ({ ...base.textBlocks.find((b) => b.id === block.id), ...block })) as StoreScreenshotScene["textBlocks"] : base.textBlocks,
    callouts: partial?.callouts ?? base.callouts,
    advanced: partial?.advanced ?? base.advanced,
  };
}

export function scenePatch(scene: StoreScreenshotScene) {
  return { renderOverrides: { scene } };
}

export function localizedPatch(screenshot: Screenshot, locale: Locale, title: string, accent?: string, subtitle?: string) {
  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string; subtitle?: string }>;
  return {
    localized: {
      ...localized,
      [locale]: {
        ...(localized[locale] ?? {}),
        title,
        accent: accent || undefined,
        subtitle: subtitle || undefined,
      },
    },
  };
}
