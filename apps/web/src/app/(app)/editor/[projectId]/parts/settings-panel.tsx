"use client";
import * as React from "react";
import { LOCALES, type Locale } from "@shotwise/types";
import type { Project, Screenshot } from "@shotwise/db";

const FONTS = ["Inter", "Fraunces", "Space Grotesk", "JetBrains Mono"];
const PRESETS = [
  { value: "iphone67", label: '6.7" iPhone · 1284×2778' },
  { value: "iphone65", label: '6.5" iPhone · 1242×2688' },
  { value: "ipad129",  label: "iPad Pro · 2048×2732" },
  { value: "android",  label: "Android · 1080×1920" },
];
const THEMES = [
  { value: "cream",   label: "Cream" },
  { value: "dark",    label: "Dark" },
  { value: "premium", label: "Premium" },
];

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

  const [activeTab, setActiveTab] = React.useState<"screen" | "canvas">("screen");
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
      localized: { ...localized, en: { title, accent: accent || undefined } },
    });
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, accent]);

  async function patchProject(patch: Record<string, unknown>) {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  const languages = config.languages ?? ["en"];
  const position = config.defaultPosition ?? "top";

  function toggleLang(l: Locale, enabled: boolean) {
    const next = new Set<Locale>(languages as Locale[]);
    if (enabled) next.add(l); else next.delete(l);
    if (next.size === 0) next.add("en");
    void patchProject({ config: { ...config, languages: Array.from(next) } });
  }

  return (
    <div data-slot="settings-panel" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="tab-row">
        <button className={`tab ${activeTab === "screen" ? "on" : ""}`} onClick={() => setActiveTab("screen")}>Screen</button>
        <button className={`tab ${activeTab === "canvas" ? "on" : ""}`} onClick={() => setActiveTab("canvas")}>Canvas</button>
      </div>

      {activeTab === "screen" && (
        <div className="settings">
          <div className="group">
            <h6>Copy</h6>
            <div className="field">
              <label className="label" htmlFor="s-title">Title</label>
              <textarea
                id="s-title"
                className="textarea"
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="s-accent">Accent phrase</label>
              <input
                id="s-accent"
                className="input"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              />
              <div className="help">This phrase will be highlighted in the title.</div>
            </div>
            <div className="field">
              <label className="label">Position</label>
              <div className="radio-group">
                <button className={position === "top" ? "on" : ""} onClick={() => void patchProject({ config: { ...config, defaultPosition: "top" } })}>Top</button>
                <button className={position === "bottom" ? "on" : ""} onClick={() => void patchProject({ config: { ...config, defaultPosition: "bottom" } })}>Bottom</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "canvas" && (
        <div className="settings">
          <div className="group">
            <h6>Output</h6>
            <div className="field">
              <label className="label" htmlFor="c-preset">Size preset</label>
              <select
                id="c-preset"
                className="select"
                value={config.canvasPresetId ?? "iphone67"}
                onChange={(e) => void patchProject({ config: { ...config, canvasPresetId: e.target.value } })}
              >
                {PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="group">
            <h6>Theme</h6>
            <div className="field">
              <label className="label" htmlFor="c-theme">Style</label>
              <select
                id="c-theme"
                className="select"
                value={config.themeId ?? "cream"}
                onChange={(e) => void patchProject({ config: { ...config, themeId: e.target.value } })}
              >
                {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="group">
            <h6>Languages</h6>
            <div className="field">
              <div className="lang-grid">
                {LOCALES.map((l) => {
                  const enabled = (languages as Locale[]).includes(l);
                  return (
                    <label key={l} className={`lang-item ${enabled ? "on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => toggleLang(l, e.target.checked)}
                      />
                      {l.toUpperCase()}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
