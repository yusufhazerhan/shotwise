import type { SceneScreenshotSlot, StoreScreenshotScene } from "@shotwise/types";

export type TemplatePlatform = "ios" | "android" | "play" | "universal";
export type TemplateMood = "classic" | "bold" | "premium" | "minimal" | "playful" | "proof" | "fresh" | "glass" | "warm" | "editorial";
export type TemplateCategory = "aso" | "onboarding" | "paywall" | "comparison" | "feature" | "social";

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  platform: TemplatePlatform;
  mood: TemplateMood;
  categories: TemplateCategory[];
  slots: 1 | 2;
  exportDefaults: {
    devicePresetIds: string[];
    includeFeatureGraphic: boolean;
  };
  scene: {
    background: StoreScreenshotScene["background"];
    layoutPreset: StoreScreenshotScene["layoutPreset"];
    device: Partial<StoreScreenshotScene["device"]>;
    screenshotSlots: SceneScreenshotSlot[];
    textBlocks: Partial<StoreScreenshotScene["textBlocks"][number]>[];
    advanced?: StoreScreenshotScene["advanced"];
  };
};

export type StyleThemeDefinition = {
  id: string;
  name: string;
  swatches: string[];
  background: StoreScreenshotScene["background"];
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  frameStyle?: StoreScreenshotScene["device"]["frameStyle"];
};

export const STYLE_THEMES: StyleThemeDefinition[] = [
  { id: "cream-calm", name: "Cream Calm", swatches: ["#F4EFE5", "#193D31", "#DF7958"], background: { type: "solid", color: "#F4EFE5" }, titleColor: "#193D31", subtitleColor: "#587167", accentColor: "#DF7958", frameStyle: "bezel" },
  { id: "dark-premium", name: "Dark Premium", swatches: ["#0B0F0D", "#203B31", "#EAA07F"], background: { type: "linear", from: "#0B0F0D", to: "#203B31", angle: 145, midpoint: 100 }, titleColor: "#F7EFE7", subtitleColor: "#D7E0D9", accentColor: "#EAA07F", frameStyle: "glass" },
  { id: "fresh-mint", name: "Fresh Mint", swatches: ["#EAF6F0", "#2F6B54", "#7CC9A5"], background: { type: "linear", from: "#F6FFF9", to: "#BFE8D3", angle: 145, midpoint: 100 }, titleColor: "#173D31", subtitleColor: "#4F7164", accentColor: "#2F9D73", frameStyle: "minimal" },
  { id: "sky-glass", name: "Sky Glass", swatches: ["#EAF4FF", "#28588A", "#7FB4FF"], background: { type: "linear", from: "#F8FBFF", to: "#A9CEF8", angle: 138, midpoint: 100 }, titleColor: "#153450", subtitleColor: "#4E6E86", accentColor: "#2E79D1", frameStyle: "glass" },
  { id: "coral-pop", name: "Coral Pop", swatches: ["#FFF0E7", "#813923", "#F07B52"], background: { type: "linear", from: "#FFF6EE", to: "#F3A17D", angle: 142, midpoint: 100 }, titleColor: "#3F241C", subtitleColor: "#7D584B", accentColor: "#E45F38", frameStyle: "bezel" },
  { id: "mono-utility", name: "Mono Utility", swatches: ["#F8F7F3", "#111716", "#8E9893"], background: { type: "solid", color: "#F8F7F3" }, titleColor: "#151918", subtitleColor: "#68736F", accentColor: "#4B5B55", frameStyle: "minimal" },
  { id: "violet-creator", name: "Violet Creator", swatches: ["#F4ECFF", "#3F2C62", "#A37BFF"], background: { type: "linear", from: "#FBF7FF", to: "#CDBBFF", angle: 145, midpoint: 100 }, titleColor: "#2F214C", subtitleColor: "#675783", accentColor: "#7D55DE", frameStyle: "glass" },
  { id: "sunny-play", name: "Sunny Play", swatches: ["#FFF7D7", "#2D4B3C", "#F5B940"], background: { type: "linear", from: "#FFF8DD", to: "#F7CE68", angle: 140, midpoint: 100 }, titleColor: "#243E33", subtitleColor: "#617366", accentColor: "#D88916", frameStyle: "bezel" },
];

const titleTop = {
  id: "title",
  role: "title" as const,
  x: 0.1,
  y: 0.075,
  width: 0.8,
  align: "center" as const,
  fontFamily: "Fraunces, Georgia, serif",
  fontSize: 0.044,
  fontWeight: 800,
  lineHeight: 1.08,
  letterSpacing: 0.04,
  wordSpacing: 0.42,
  color: "#193D31",
  accentColor: "#DF7958",
};

const subtitleTop = {
  id: "subtitle",
  role: "subtitle" as const,
  x: 0.18,
  y: 0.165,
  width: 0.64,
  align: "center" as const,
  fontFamily: "Sora, system-ui, sans-serif",
  fontSize: 0.018,
  fontWeight: 500,
  lineHeight: 1.24,
  letterSpacing: 0.006,
  wordSpacing: 0.28,
  color: "#587167",
  accentColor: "#DF7958",
};

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "classic-app-store",
    name: "Classic App Store",
    description: "A clean headline, centered device, and generous App Store spacing.",
    platform: "ios",
    mood: "classic",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#F4EFE5" },
      layoutPreset: "single",
      device: { frameStyle: "bezel", tilt: 0, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.55, width: 0.53, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [titleTop, subtitleTop],
      advanced: { customJson: { templateArt: "soft-platform" } },
    },
  },
  {
    id: "bold-split",
    name: "Bold Split",
    description: "Large left-side copy with a confident angled device.",
    platform: "universal",
    mood: "bold",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#14261F", to: "#F3B290", angle: 118, midpoint: 100 },
      layoutPreset: "sideBySide",
      device: { frameStyle: "glass", tilt: -5, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.67, y: 0.56, width: 0.43, scale: 1, rotation: -4, fit: "contain" }],
      textBlocks: [
        { ...titleTop, x: 0.07, y: 0.135, width: 0.48, align: "left", color: "#FFF8EF", accentColor: "#FFD0B7", fontFamily: "Plus Jakarta Sans, system-ui, sans-serif", fontSize: 0.032, lineHeight: 1.06 },
        { ...subtitleTop, x: 0.073, y: 0.315, width: 0.4, align: "left", color: "#F0E2D6" },
      ],
      advanced: { customJson: { templateArt: "bold-ribbon" } },
    },
  },
  {
    id: "before-after",
    name: "Before / After",
    description: "Two labeled devices for transformations, cleanup, tracking, and comparison stories.",
    platform: "universal",
    mood: "proof",
    categories: ["comparison", "social"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#F7F3EC" },
      layoutPreset: "beforeAfter",
      device: { frameStyle: "minimal", tilt: 0, shadow: "subtle" },
      screenshotSlots: [
        { id: "before", x: 0.34, y: 0.58, width: 0.35, scale: 1, rotation: -1, fit: "contain", label: "Before" },
        { id: "after", x: 0.66, y: 0.58, width: 0.35, scale: 1, rotation: 1, fit: "contain", label: "After" },
      ],
      textBlocks: [{ ...titleTop, y: 0.08 }, { ...subtitleTop, y: 0.18 }],
      advanced: { customJson: { templateArt: "comparison-split" } },
    },
  },
  {
    id: "two-screens-one-story",
    name: "Two Screens One Story",
    description: "Two screenshots in one poster so a workflow reads at a glance.",
    platform: "universal",
    mood: "classic",
    categories: ["aso", "onboarding", "feature"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: true },
    scene: {
      background: { type: "linear", from: "#F8F1E7", to: "#DDE9DD", angle: 145, midpoint: 100 },
      layoutPreset: "sideBySide",
      device: { frameStyle: "bezel", tilt: 0, shadow: "strong" },
      screenshotSlots: [
        { id: "step-one", x: 0.39, y: 0.59, width: 0.36, scale: 1, rotation: -4, fit: "contain" },
        { id: "step-two", x: 0.62, y: 0.54, width: 0.36, scale: 1, rotation: 4, fit: "contain" },
      ],
      textBlocks: [{ ...titleTop, y: 0.07 }, { ...subtitleTop, y: 0.158 }],
      advanced: { customJson: { templateArt: "connected-diptych" } },
    },
  },
  {
    id: "feature-zoom",
    name: "Feature Zoom",
    description: "A single device with a highlighted UI area and tighter feature copy.",
    platform: "universal",
    mood: "bold",
    categories: ["feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#FFF6EE", to: "#F0B99E", angle: 150, midpoint: 100 },
      layoutPreset: "callout",
      device: { frameStyle: "glass", tilt: 3, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.53, width: 0.5, scale: 1, rotation: 2, fit: "contain" }],
      textBlocks: [titleTop, subtitleTop],
      advanced: { customJson: { templateArt: "feature-burst" } },
    },
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "A trust-first layout for metrics, reviews, streaks, and outcomes.",
    platform: "ios",
    mood: "proof",
    categories: ["social", "aso"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#EAF3EF" },
      layoutPreset: "card",
      device: { frameStyle: "minimal", tilt: 0, shadow: "subtle" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.55, width: 0.51, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [{ ...titleTop, fontFamily: "Sora, system-ui, sans-serif" }, subtitleTop],
      advanced: { customJson: { templateArt: "proof-cards" } },
    },
  },
  {
    id: "paywall-pricing",
    name: "Paywall / Pricing",
    description: "A focused screen for subscription value, plan comparison, and checkout clarity.",
    platform: "ios",
    mood: "premium",
    categories: ["paywall"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#0B0F0D", to: "#293B34", angle: 145, midpoint: 100 },
      layoutPreset: "card",
      device: { frameStyle: "glass", tilt: 0, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.54, width: 0.48, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [
        { ...titleTop, color: "#F7EFE7", accentColor: "#EAA07F" },
        { ...subtitleTop, color: "#D7E0D9" },
      ],
      advanced: { customJson: { templateArt: "premium-orbit" } },
    },
  },
  {
    id: "onboarding-flow",
    name: "Onboarding Flow",
    description: "Two screens that explain a first-run flow without making a carousel feel crowded.",
    platform: "universal",
    mood: "playful",
    categories: ["onboarding"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#FFF2DF", to: "#B9DDE2", angle: 135, midpoint: 100 },
      layoutPreset: "stacked",
      device: { frameStyle: "minimal", tilt: 0, shadow: "strong" },
      screenshotSlots: [
        { id: "first", x: 0.39, y: 0.6, width: 0.34, scale: 1, rotation: -4, fit: "contain" },
        { id: "second", x: 0.62, y: 0.53, width: 0.34, scale: 1, rotation: 4, fit: "contain" },
      ],
      textBlocks: [{ ...titleTop, fontFamily: "Outfit, system-ui, sans-serif" }, subtitleTop],
      advanced: { customJson: { templateArt: "playful-flow" } },
    },
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    description: "High contrast framing for finance and pro utility launches.",
    platform: "universal",
    mood: "premium",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "galaxy"], includeFeatureGraphic: true },
    scene: {
      background: { type: "linear", from: "#0B0F0D", to: "#203B31", angle: 145, midpoint: 100 },
      layoutPreset: "single",
      device: { frameStyle: "glass", tilt: -2, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.53, width: 0.5, scale: 1, rotation: -2, fit: "contain" }],
      textBlocks: [
        { ...titleTop, color: "#F6F0E7", accentColor: "#DF7958", fontFamily: "Space Grotesk, system-ui, sans-serif" },
        { ...subtitleTop, color: "#D8E1DA" },
      ],
      advanced: { customJson: { templateArt: "premium-orbit" } },
    },
  },
  {
    id: "minimal-utility",
    name: "Minimal Utility",
    description: "Quiet, crisp, and practical for productivity tools.",
    platform: "universal",
    mood: "minimal",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#F8F7F3" },
      layoutPreset: "single",
      device: { frameStyle: "minimal", tilt: 0, shadow: "subtle" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.53, width: 0.49, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [
        { ...titleTop, fontFamily: "Sora, system-ui, sans-serif", color: "#162D24", accentColor: "#2D5D4B" },
        { ...subtitleTop, color: "#6A7A73" },
      ],
      advanced: { customJson: { templateArt: "minimal-grid" } },
    },
  },
  {
    id: "glass-duo",
    name: "Glass Duo",
    description: "Two floating glass devices with soft gradients for modern consumer apps.",
    platform: "universal",
    mood: "glass",
    categories: ["aso", "feature", "onboarding"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69", "pixel9"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#F8FBFF", to: "#B8D8F4", angle: 145, midpoint: 100 },
      layoutPreset: "sideBySide",
      device: { frameStyle: "glass", tilt: 0, shadow: "strong" },
      screenshotSlots: [
        { id: "left-glass", x: 0.38, y: 0.58, width: 0.34, scale: 1, rotation: -7, fit: "contain" },
        { id: "right-glass", x: 0.63, y: 0.52, width: 0.34, scale: 1, rotation: 7, fit: "contain" },
      ],
      textBlocks: [{ ...titleTop, color: "#173450", accentColor: "#2E79D1" }, { ...subtitleTop, color: "#536D82" }],
      advanced: { customJson: { templateArt: "connected-diptych" } },
    },
  },
  {
    id: "editorial-feature",
    name: "Editorial Feature",
    description: "Magazine-like headline and oversized screen crop for premium launches.",
    platform: "ios",
    mood: "editorial",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "ipad13"], includeFeatureGraphic: true },
    scene: {
      background: { type: "solid", color: "#F6F1EA" },
      layoutPreset: "single",
      device: { frameStyle: "bezel", tilt: -3, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.55, y: 0.59, width: 0.58, scale: 1, rotation: -3, fit: "contain" }],
      textBlocks: [
        { ...titleTop, x: 0.08, y: 0.07, width: 0.66, align: "left", fontSize: 0.041, color: "#1C2D27", accentColor: "#AA563C" },
        { ...subtitleTop, x: 0.08, y: 0.18, width: 0.52, align: "left", color: "#66776F" },
      ],
      advanced: { customJson: { templateArt: "soft-platform" } },
    },
  },
  {
    id: "android-showcase",
    name: "Android Showcase",
    description: "Tall Android-forward composition with strong Play Store readability.",
    platform: "android",
    mood: "fresh",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["android", "pixel9", "galaxyS24"], includeFeatureGraphic: true },
    scene: {
      background: { type: "linear", from: "#EAF6F0", to: "#88C8A7", angle: 140, midpoint: 100 },
      layoutPreset: "single",
      device: { frameStyle: "bezel", tilt: 2, shadow: "strong", radius: 46 },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.55, width: 0.52, scale: 1, rotation: 2, fit: "contain" }],
      textBlocks: [{ ...titleTop, color: "#173D31", accentColor: "#2F9D73" }, { ...subtitleTop, color: "#4F7164" }],
      advanced: { customJson: { templateArt: "feature-burst" } },
    },
  },
  {
    id: "tablet-command",
    name: "Tablet Command",
    description: "Wide, confident tablet layout for iPad and Android tablet screens.",
    platform: "universal",
    mood: "minimal",
    categories: ["feature", "aso"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["ipad13", "ipad11", "playTablet"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#F8F7F3" },
      layoutPreset: "single",
      device: { frameStyle: "minimal", tilt: 0, shadow: "subtle" },
      screenshotSlots: [{ id: "tablet", x: 0.5, y: 0.56, width: 0.76, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [
        { ...titleTop, y: 0.08, fontFamily: "Sora, system-ui, sans-serif", color: "#162D24", accentColor: "#2D5D4B" },
        { ...subtitleTop, y: 0.17, color: "#66736F" },
      ],
      advanced: { customJson: { templateArt: "minimal-grid" } },
    },
  },
  {
    id: "paywall-glow",
    name: "Paywall Glow",
    description: "Premium subscription layout with a focused phone and warm glow.",
    platform: "universal",
    mood: "premium",
    categories: ["paywall", "aso"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "galaxyS24"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#100D0B", to: "#5A3328", angle: 145, midpoint: 100 },
      layoutPreset: "card",
      device: { frameStyle: "glass", tilt: 0, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.55, width: 0.5, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [
        { ...titleTop, color: "#FFF2E8", accentColor: "#F3A17D" },
        { ...subtitleTop, color: "#E9D5C9" },
      ],
      advanced: { customJson: { templateArt: "premium-orbit" } },
    },
  },
  {
    id: "social-stats",
    name: "Social Stats",
    description: "Outcome-driven template for reviews, streaks, ratings, and proof points.",
    platform: "universal",
    mood: "proof",
    categories: ["social", "aso"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#F2FBF6", to: "#D2E9DC", angle: 145, midpoint: 100 },
      layoutPreset: "card",
      device: { frameStyle: "minimal", tilt: -2, shadow: "subtle" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.57, width: 0.49, scale: 1, rotation: -2, fit: "contain" }],
      textBlocks: [{ ...titleTop, fontFamily: "Sora, system-ui, sans-serif", color: "#193D31", accentColor: "#2F9D73" }, { ...subtitleTop }],
      advanced: { customJson: { templateArt: "proof-cards" } },
    },
  },
  {
    id: "playful-cards",
    name: "Playful Cards",
    description: "Bright card-based layout for education, wellness, pets, and lifestyle apps.",
    platform: "universal",
    mood: "playful",
    categories: ["onboarding", "feature"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69", "pixel9"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#FFF8DD", to: "#F6BF64", angle: 142, midpoint: 100 },
      layoutPreset: "stacked",
      device: { frameStyle: "bezel", tilt: 0, shadow: "strong" },
      screenshotSlots: [
        { id: "first", x: 0.37, y: 0.6, width: 0.33, scale: 1, rotation: -5, fit: "contain" },
        { id: "second", x: 0.64, y: 0.55, width: 0.33, scale: 1, rotation: 5, fit: "contain" },
      ],
      textBlocks: [{ ...titleTop, color: "#263F34", accentColor: "#D88916" }, { ...subtitleTop, color: "#5E6B61" }],
      advanced: { customJson: { templateArt: "playful-flow" } },
    },
  },
  {
    id: "comparison-ribbon",
    name: "Comparison Ribbon",
    description: "A more dramatic before/after layout connected by a center ribbon.",
    platform: "universal",
    mood: "proof",
    categories: ["comparison", "feature"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: false },
    scene: {
      background: { type: "solid", color: "#F5EFE6" },
      layoutPreset: "beforeAfter",
      device: { frameStyle: "glass", tilt: 0, shadow: "strong" },
      screenshotSlots: [
        { id: "before", x: 0.33, y: 0.58, width: 0.34, scale: 1, rotation: -3, fit: "contain", label: "Before" },
        { id: "after", x: 0.67, y: 0.58, width: 0.34, scale: 1, rotation: 3, fit: "contain", label: "After" },
      ],
      textBlocks: [{ ...titleTop, color: "#193D31", accentColor: "#DF7958" }, { ...subtitleTop }],
      advanced: { customJson: { templateArt: "comparison-split" } },
    },
  },
  {
    id: "fintech-sharp",
    name: "Fintech Sharp",
    description: "Structured, high-trust layout for money, analytics, and pro dashboards.",
    platform: "universal",
    mood: "minimal",
    categories: ["aso", "feature"],
    slots: 1,
    exportDefaults: { devicePresetIds: ["iphone69", "pixel9", "ipad13"], includeFeatureGraphic: true },
    scene: {
      background: { type: "linear", from: "#EEF3F0", to: "#CADBD3", angle: 140, midpoint: 100 },
      layoutPreset: "single",
      device: { frameStyle: "bezel", tilt: 0, shadow: "strong" },
      screenshotSlots: [{ id: "primary", x: 0.5, y: 0.55, width: 0.5, scale: 1, rotation: 0, fit: "contain" }],
      textBlocks: [{ ...titleTop, fontFamily: "Space Grotesk, system-ui, sans-serif", color: "#0F241D", accentColor: "#376C55" }, { ...subtitleTop, color: "#52665C" }],
      advanced: { customJson: { templateArt: "minimal-grid" } },
    },
  },
  {
    id: "wellness-warm",
    name: "Wellness Warm",
    description: "Soft warm tones for health, habit, coaching, and lifestyle flows.",
    platform: "universal",
    mood: "warm",
    categories: ["onboarding", "aso", "feature"],
    slots: 2,
    exportDefaults: { devicePresetIds: ["iphone69", "android"], includeFeatureGraphic: false },
    scene: {
      background: { type: "linear", from: "#FFF4EC", to: "#EAC8B7", angle: 142, midpoint: 100 },
      layoutPreset: "sideBySide",
      device: { frameStyle: "minimal", tilt: 0, shadow: "subtle" },
      screenshotSlots: [
        { id: "habit", x: 0.4, y: 0.6, width: 0.34, scale: 1, rotation: -4, fit: "contain" },
        { id: "coach", x: 0.62, y: 0.54, width: 0.34, scale: 1, rotation: 4, fit: "contain" },
      ],
      textBlocks: [{ ...titleTop, color: "#3F241C", accentColor: "#C95E3F" }, { ...subtitleTop, color: "#795E53" }],
      advanced: { customJson: { templateArt: "connected-diptych" } },
    },
  },
];

export function getTemplate(id: string | undefined): TemplateDefinition {
  return TEMPLATE_REGISTRY.find((template) => template.id === id) ?? TEMPLATE_REGISTRY[0]!;
}

export function getStyleTheme(id: string | undefined): StyleThemeDefinition {
  return STYLE_THEMES.find((theme) => theme.id === id) ?? STYLE_THEMES[0]!;
}

export function applyTemplate(scene: StoreScreenshotScene, templateId: string): StoreScreenshotScene {
  const template = getTemplate(templateId);
  const existingByIndex = scene.screenshots?.length ? scene.screenshots : [{ id: "primary", ...scene.screenshot }];
  const screenshots = template.scene.screenshotSlots.map((slot, index) => ({
    ...slot,
    sourceId: existingByIndex[index]?.sourceId ?? existingByIndex[index]?.id ?? existingByIndex[0]?.sourceId,
  }));
  const textBlocks = template.scene.textBlocks.map((block) => ({
    ...scene.textBlocks.find((existing) => existing.id === block.id),
    ...block,
  })) as StoreScreenshotScene["textBlocks"];

  return {
    ...scene,
    background: template.scene.background,
    layoutPreset: template.scene.layoutPreset,
    device: { ...scene.device, ...template.scene.device },
    screenshot: screenshots[0] ?? scene.screenshot,
    screenshots,
    textBlocks,
    advanced: { ...(scene.advanced ?? {}), ...(template.scene.advanced ?? {}) },
  };
}

export function applyStyleTheme(scene: StoreScreenshotScene, themeId: string): StoreScreenshotScene {
  const theme = getStyleTheme(themeId);
  return {
    ...scene,
    background: theme.background,
    device: {
      ...scene.device,
      frameStyle: theme.frameStyle ?? scene.device.frameStyle,
    },
    textBlocks: scene.textBlocks.map((block) => {
      if (block.role === "title") {
        return { ...block, color: theme.titleColor, accentColor: theme.accentColor };
      }
      if (block.role === "subtitle") {
        return { ...block, color: theme.subtitleColor, accentColor: theme.accentColor };
      }
      return { ...block, accentColor: theme.accentColor };
    }),
  };
}

export function filterTemplates(filters: {
  platform?: TemplatePlatform | "all";
  mood?: TemplateMood | "all";
  category?: TemplateCategory | "all";
  slots?: 1 | 2 | "all";
}) {
  return TEMPLATE_REGISTRY.filter((template) => {
    if (filters.platform && filters.platform !== "all" && template.platform !== filters.platform && template.platform !== "universal") return false;
    if (filters.mood && filters.mood !== "all" && template.mood !== filters.mood) return false;
    if (filters.category && filters.category !== "all" && !template.categories.includes(filters.category)) return false;
    if (filters.slots && filters.slots !== "all" && template.slots !== filters.slots) return false;
    return true;
  });
}
