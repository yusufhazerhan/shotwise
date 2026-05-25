# Shotwise Vibe Coding Skill

Use this skill when a coding agent is helping a user create App Store or Play Store screenshot assets with this repository.

## Goal

Turn raw app screenshots into upload-ready store assets using the local Shotwise Studio and renderer.

The preferred open-source workflow is:

1. Use the user's local screenshots.
2. Pick or apply a Shotwise template.
3. Write localized title, subtitle, and accent copy.
4. Set device presets and export locales.
5. Export a ZIP grouped by locale and device.

Start with the local Studio and scene/template model. They are the source of truth.

## Important Files

- `apps/web/src/app/studio/studio-client.tsx` - local Studio UI
- `apps/web/src/lib/templates.ts` - template registry
- `apps/web/src/lib/local-studio-store.ts` - IndexedDB project model
- `apps/web/src/lib/local-export.ts` - browser PNG/ZIP export
- `apps/web/src/lib/editor-scene.ts` - store size presets
- `packages/core/src/scene.ts` - server/Sharp scene renderer
- `packages/core/src/presets.ts` - core canvas presets
- `packages/core/src/types.ts` - shared scene model

## Local Run

```bash
pnpm install
pnpm --filter @shotwise/web dev
```

Open:

```text
http://localhost:3000/studio
```

If the port is busy:

```bash
pnpm --filter @shotwise/web exec next dev -p 3001
```

## User Prompt Pattern

Users may say things like:

```text
My screenshots are in ./screenshots.
Prepare App Store screenshots for English, Turkish, German, and French.
Use a premium template, make the copy friendly, and export upload-ready ZIP files.
```

When that happens:

1. Inspect the screenshot folder.
2. Prefer real screenshots over generated placeholders.
3. Use `/studio` for local preview when visual QA is needed.
4. Use `TEMPLATE_REGISTRY` for available templates.
5. Use `STYLE_THEMES` when the user wants a different color direction.
6. Fill `project.localized[locale]` for every requested locale.
7. Set `project.exportConfig.locales`.
8. Set `project.exportConfig.devicePresetIds`.
9. Tune `project.exportConfig.deviceConfigs[presetId]` when a device needs a different frame, status bar, slot scale, or text scale.
10. Set `project.screenName` to the requested output base name.
11. Export ZIP with locale/device folders.

## Scene Model

A Shotwise scene supports multiple screenshot slots:

```ts
scene.screenshots = [
  {
    id: "step-one",
    sourceId: "home",
    x: 0.39,
    y: 0.59,
    width: 0.36,
    scale: 1,
    rotation: -4,
    fit: "contain",
  },
  {
    id: "step-two",
    sourceId: "care",
    x: 0.62,
    y: 0.54,
    width: 0.36,
    scale: 1,
    rotation: 4,
    fit: "contain",
  },
];
```

Use two-slot templates when the user wants two screenshots to read as one story.

Good defaults:

- `two-screens-one-story` for workflow or side-by-side feature explanation
- `before-after` for transformation/comparison
- `bold-split` for one strong hero screen
- `paywall-pricing` for subscription screens
- `onboarding-flow` for first-run flows
- `android-showcase` for Play Store phone assets
- `tablet-command` for iPad and Android tablet assets
- `glass-duo` for modern two-screen consumer screenshots
- `comparison-ribbon` when two screenshots should feel like one continuous split panel

Color themes live in `STYLE_THEMES`. Set:

```ts
project.exportConfig.styleThemeId = "fresh-mint";
project.scene = applyStyleTheme(project.scene, "fresh-mint");
```

Per-device tuning lives in `deviceConfigs`:

```ts
project.exportConfig.deviceConfigs = {
  iphone69: { frameStyle: "glass", hideStatusBar: false, slotScale: 1, textScale: 1 },
  ipad13: { frameStyle: "minimal", slotScale: 1.08, textScale: 0.92 },
  pixel9: { frameStyle: "bezel", slotScale: 0.96, textScale: 1 },
};
```

Typography tuning lives directly on scene text blocks. Increase word spacing when
large App Store headlines feel cramped, and increase letter spacing when heavy
letters visually merge inside a word:

```ts
project.scene.textBlocks = project.scene.textBlocks.map((block) => {
  if (block.role === "title") return { ...block, letterSpacing: 0.08, wordSpacing: 0.58 };
  if (block.role === "subtitle") return { ...block, letterSpacing: 0.012, wordSpacing: 0.34 };
  return block;
});
```

Use `0.42` as the normal title default, `0.55` to `0.7` for heavy all-caps or
long Turkish/English headlines, and `0.28` to `0.4` for subtitles. Use `0.04`
as the normal title letter-spacing default and raise it toward `0.08` to `0.12`
when words like "Turn" visually collapse. In Studio, the same settings are
exposed as `Title letter spacing`, `Title word spacing`, `Subtitle letter
spacing`, and `Subtitle word spacing` in the Inspector.

## Localization

Store localized copy per locale:

```ts
project.localized = {
  en: {
    title: "Care smarter for every pet",
    subtitle: "Track routines, walks, lessons, and care notes in one calm place.",
    accent: "smarter",
  },
  tr: {
    title: "Her evcil dost için daha akıllı bakım",
    subtitle: "Rutinleri, yürüyüşleri, dersleri ve bakım notlarını tek yerde takip et.",
    accent: "akıllı",
  },
};
```

Always keep `en` enabled as the base locale unless the user explicitly asks otherwise.

## Export Naming

Local exports use stable paths:

```text
<project>/<template>/<locale>/<device>/<screen-name>.png
```

Example:

```text
petwises/two-screens-one-story/tr/iphone69/home.png
```

Use user-provided screen names when available. If the user provides multiple screenshots and names, preserve those names in the scene/export plan.

## Device Presets

Use these presets for current App Store and Play Store work:

- `iphone69` - iPhone 6.9", 1290 x 2796
- `iphone67` - iPhone 6.7", 1284 x 2778
- `iphone65` - iPhone 6.5", 1242 x 2688
- `iphone61` - iPhone 6.1", 1179 x 2556
- `iphone55` - iPhone 5.5", 1242 x 2208
- `ipad13` - iPad 13", 2064 x 2752
- `ipadPro129` - iPad 12.9", 2048 x 2732
- `ipad11` - iPad 11", 1668 x 2420
- `android` - Android Pixel, 1080 x 2400
- `pixel9` - Pixel 9 Pro, 1344 x 2992
- `galaxy` - Samsung Galaxy, 1440 x 3088
- `galaxyS24` - Samsung Galaxy S24 Ultra, 1440 x 3120
- `oneplus` - OnePlus tall, 1240 x 2772
- `playPhone` - Google Play phone, 1080 x 1920
- `pixelFold` - Pixel Fold, 1840 x 2208
- `playTablet` - Google Play tablet, 1600 x 2560

When unsure, export `iphone69`, `iphone67`, `ipad13`, `android`, `pixel9`, and `playTablet`.

## Visual Quality Checklist

Before calling a screenshot set finished:

- The phone frame looks like a real device, not a plain rounded rectangle.
- Dynamic Island, tablet camera, or Android punch-hole is visible when appropriate.
- Device previews in Studio work in both Grid and Tabs mode.
- Selected devices include at least one iPhone and one Android preset when the user asks for both stores.
- Text is readable at App Store thumbnail size.
- Large title letters do not merge; tune `letterSpacing` before reducing font size.
- Large title words have enough spacing; tune `wordSpacing` after letter spacing looks right.
- The title does not collide with the device.
- Two-screen compositions feel connected, not like two unrelated phones.
- The screenshot subject is visible and not over-cropped.
- Exported files are grouped by locale and device.
- Filenames match the user's screen names.

## Verification

Run focused checks after changes:

```bash
pnpm --filter @shotwise/web typecheck
pnpm --filter @shotwise/core typecheck
pnpm --filter @shotwise/web test -- src/lib/templates.test.ts src/lib/local-export.test.ts src/app/studio/studio-client.test.tsx
```

For renderer/device-frame changes, render at least one one-slot and one two-slot template with real screenshots and inspect the output visually.
