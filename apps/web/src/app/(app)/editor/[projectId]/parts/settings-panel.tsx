"use client";
import * as React from "react";
import { Input, Label, Textarea, Tabs, TabsList, TabsTrigger, TabsContent, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, RadioGroup, RadioItem, Checkbox } from "@shotwise/ui-primitives";
import { LOCALES, type Locale } from "@shotwise/types";
import type { Project, Screenshot } from "@shotwise/db";

export function SettingsPanel({
  project,
  screenshot,
  onScreenshotPatch,
}: {
  project: Project;
  screenshot: Screenshot;
  onScreenshotPatch: (patch: Partial<Screenshot>) => Promise<void> | void;
}) {
  const config = (project.config ?? {}) as {
    themeId?: string;
    canvasPresetId?: string;
    languages?: Locale[];
    defaultPosition?: "top" | "bottom";
  };
  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string }>;
  const en = localized.en ?? { title: "", accent: "" };

  const [title, setTitle] = React.useState(en.title ?? "");
  const [accent, setAccent] = React.useState(en.accent ?? "");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function patchDebounced(next: Partial<Screenshot>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void onScreenshotPatch(next);
    }, 350);
  }

  React.useEffect(() => {
    patchDebounced({
      localized: {
        ...localized,
        en: { title, accent: accent || undefined },
      },
    });
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, accent]);

  // Project-level changes saved via dedicated endpoint
  async function patchProject(patch: Record<string, unknown>) {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  return (
    <div data-slot="settings-panel">
      <Tabs defaultValue="screen">
        <TabsList>
          <TabsTrigger value="screen">Screen</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>

        <TabsContent value="screen">
          <Label htmlFor="title">Title</Label>
          <Textarea id="title" value={title} onChange={(e) => setTitle(e.target.value)} rows={3} />

          <Label htmlFor="accent" style={{ marginTop: "0.5rem" }}>Accent word</Label>
          <Input id="accent" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </TabsContent>

        <TabsContent value="canvas">
          <Label>Theme</Label>
          <Select
            defaultValue={config.themeId ?? "cream"}
            onValueChange={(v) => void patchProject({ config: { ...config, themeId: v } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cream">Cream</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>

          <Label style={{ marginTop: "0.5rem" }}>Canvas preset</Label>
          <Select
            defaultValue={config.canvasPresetId ?? "iphone67"}
            onValueChange={(v) => void patchProject({ config: { ...config, canvasPresetId: v } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iphone67">iPhone 6.7&quot;</SelectItem>
              <SelectItem value="iphone65">iPhone 6.5&quot;</SelectItem>
              <SelectItem value="ipad129">iPad 12.9&quot;</SelectItem>
              <SelectItem value="android">Android phone</SelectItem>
            </SelectContent>
          </Select>

          <Label style={{ marginTop: "0.5rem" }}>Title position</Label>
          <RadioGroup
            defaultValue={config.defaultPosition ?? "top"}
            onValueChange={(v) => void patchProject({ config: { ...config, defaultPosition: v } })}
            style={{ display: "flex", gap: "1rem" }}
          >
            <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <RadioItem value="top" /> Top
            </label>
            <label style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <RadioItem value="bottom" /> Bottom
            </label>
          </RadioGroup>

          <Label style={{ marginTop: "0.5rem" }}>Languages</Label>
          <div data-slot="lang-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            {LOCALES.map((l) => {
              const enabled = (config.languages ?? ["en"]).includes(l);
              return (
                <label key={l} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(checked) => {
                      const langs = new Set<Locale>(config.languages ?? ["en"]);
                      if (checked) langs.add(l);
                      else langs.delete(l);
                      void patchProject({ config: { ...config, languages: Array.from(langs) } });
                    }}
                  />
                  {l.toUpperCase()}
                </label>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
