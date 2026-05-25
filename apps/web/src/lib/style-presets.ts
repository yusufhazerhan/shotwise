import type { StoreScreenshotScene } from "@shotwise/types";

export type StylePresetId =
  | "cream-calm"
  | "dark-premium"
  | "playful-consumer"
  | "utility-minimal"
  | "fintech-sharp"
  | "wellness-warm";

export type StylePreset = {
  id: StylePresetId;
  name: string;
  description: string;
  mood: "calm" | "bold" | "premium" | "playful" | "utility";
  categories: Array<"productivity" | "wellness" | "fintech" | "consumer" | "devtool">;
  tier: "free" | "pro";
  scene: {
    background: StoreScreenshotScene["background"];
    layoutPreset: StoreScreenshotScene["layoutPreset"];
    titleFont: string;
    titleColor: string;
    accentColor: string;
    subtitleColor: string;
    frameStyle: StoreScreenshotScene["device"]["frameStyle"];
    tilt: number;
  };
};

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "cream-calm",
    name: "Cream Calm",
    description: "Warm editorial launch look with gentle contrast.",
    mood: "calm",
    categories: ["consumer", "wellness"],
    tier: "free",
    scene: {
      background: { type: "solid", color: "#F4EFE5" },
      layoutPreset: "single",
      titleFont: "Fraunces, Georgia, serif",
      titleColor: "#193D31",
      accentColor: "#DF7958",
      subtitleColor: "#587167",
      frameStyle: "bezel",
      tilt: 0,
    },
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    description: "High-contrast launch treatment for polished products.",
    mood: "premium",
    categories: ["fintech", "devtool"],
    tier: "free",
    scene: {
      background: { type: "linear", from: "#0B0F0D", to: "#203B31", angle: 145, midpoint: 100 },
      layoutPreset: "card",
      titleFont: "Space Grotesk, system-ui, sans-serif",
      titleColor: "#F6F0E7",
      accentColor: "#DF7958",
      subtitleColor: "#D8E1DA",
      frameStyle: "glass",
      tilt: -2,
    },
  },
  {
    id: "playful-consumer",
    name: "Playful Consumer",
    description: "Lighter gradients and bolder accents for upbeat apps.",
    mood: "playful",
    categories: ["consumer"],
    tier: "free",
    scene: {
      background: { type: "linear", from: "#FFF1E2", to: "#FFB6A0", angle: 150, midpoint: 100 },
      layoutPreset: "stacked",
      titleFont: "Outfit, system-ui, sans-serif",
      titleColor: "#18362C",
      accentColor: "#D97757",
      subtitleColor: "#5F7068",
      frameStyle: "minimal",
      tilt: 2,
    },
  },
  {
    id: "utility-minimal",
    name: "Utility Minimal",
    description: "Quiet system look for practical, clarity-first apps.",
    mood: "utility",
    categories: ["productivity", "devtool"],
    tier: "free",
    scene: {
      background: { type: "solid", color: "#F5F2EC" },
      layoutPreset: "single",
      titleFont: "Sora, system-ui, sans-serif",
      titleColor: "#162D24",
      accentColor: "#2D5D4B",
      subtitleColor: "#6A7A73",
      frameStyle: "minimal",
      tilt: 0,
    },
  },
  {
    id: "fintech-sharp",
    name: "Fintech Sharp",
    description: "Confident contrast and tighter hierarchy for finance.",
    mood: "bold",
    categories: ["fintech", "productivity"],
    tier: "pro",
    scene: {
      background: { type: "linear", from: "#F8F1E7", to: "#DDB28F", angle: 140, midpoint: 100 },
      layoutPreset: "sideBySide",
      titleFont: "Plus Jakarta Sans, system-ui, sans-serif",
      titleColor: "#132920",
      accentColor: "#B76749",
      subtitleColor: "#4F655C",
      frameStyle: "bezel",
      tilt: -4,
    },
  },
  {
    id: "wellness-warm",
    name: "Wellness Warm",
    description: "Soft contrast and welcoming tone for care-focused apps.",
    mood: "calm",
    categories: ["wellness", "consumer"],
    tier: "pro",
    scene: {
      background: { type: "linear", from: "#FFF7EF", to: "#E7C7B1", angle: 135, midpoint: 100 },
      layoutPreset: "callout",
      titleFont: "Crimson Pro, Georgia, serif",
      titleColor: "#1C3A2F",
      accentColor: "#D97757",
      subtitleColor: "#60756C",
      frameStyle: "glass",
      tilt: 3,
    },
  },
];

export function getStylePreset(id: string | undefined): StylePreset {
  return STYLE_PRESETS.find((preset) => preset.id === id) ?? STYLE_PRESETS[0]!;
}

export function applyStylePreset(scene: StoreScreenshotScene, presetId: StylePresetId): StoreScreenshotScene {
  const preset = getStylePreset(presetId);

  return {
    ...scene,
    background: preset.scene.background,
    layoutPreset: preset.scene.layoutPreset,
    device: {
      ...scene.device,
      frameStyle: preset.scene.frameStyle,
      tilt: preset.scene.tilt,
    },
    textBlocks: scene.textBlocks.map((block) => {
      if (block.role === "title") {
        return {
          ...block,
          fontFamily: preset.scene.titleFont,
          color: preset.scene.titleColor,
          accentColor: preset.scene.accentColor,
        };
      }

      if (block.role === "subtitle") {
        return {
          ...block,
          color: preset.scene.subtitleColor,
          accentColor: preset.scene.accentColor,
        };
      }

      return block;
    }),
  };
}

export function filterStylePresets(filters: {
  mood?: StylePreset["mood"] | "all";
  category?: StylePreset["categories"][number] | "all";
  tier?: StylePreset["tier"] | "all";
}) {
  return STYLE_PRESETS.filter((preset) => {
    if (filters.mood && filters.mood !== "all" && preset.mood !== filters.mood) return false;
    if (filters.tier && filters.tier !== "all" && preset.tier !== filters.tier) return false;
    if (filters.category && filters.category !== "all" && !preset.categories.includes(filters.category)) return false;
    return true;
  });
}
