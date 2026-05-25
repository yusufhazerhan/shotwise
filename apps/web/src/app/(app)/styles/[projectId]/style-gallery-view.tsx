"use client";

import * as React from "react";
import Link from "next/link";
import type { Project, Screenshot } from "@shotwise/db";
import { getEditorConfig, getScene, scenePatch } from "@/lib/editor-scene";
import { applyStylePreset, filterStylePresets, STYLE_PRESETS, type StylePreset } from "@/lib/style-presets";
import { ScenePreview } from "@/components/scene-preview";
import type { Locale } from "@shotwise/types";
import "./styles.css";

export function StyleGalleryView({
  project,
  screenshots,
}: {
  project: Project;
  screenshots: Screenshot[];
}) {
  const editor = getEditorConfig(project);
  const first = screenshots[0] ?? null;
  const [selectedPresetId, setSelectedPresetId] = React.useState<StylePreset["id"]>(editor.stylePresetId as StylePreset["id"]);
  const [mood, setMood] = React.useState<StylePreset["mood"] | "all">("all");
  const [category, setCategory] = React.useState<StylePreset["categories"][number] | "all">("all");
  const [tier, setTier] = React.useState<StylePreset["tier"] | "all">("all");
  const [scope, setScope] = React.useState<"all" | "current">("all");
  const [previewLocale, setPreviewLocale] = React.useState<Locale>("en");
  const visiblePresets = filterStylePresets({ mood, category, tier });

  async function applySelectedPreset() {
    const config = (project.config ?? {}) as Record<string, unknown>;
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          ...config,
          editor: {
            ...editor,
            stylePresetId: selectedPresetId,
          },
        },
      }),
    });

    const targets = scope === "current" && first ? [first] : screenshots;
    await Promise.all(
      targets.map((shot) => {
        const nextScene = applyStylePreset(getScene(shot, project), selectedPresetId);
        return fetch(`/api/projects/${project.id}/screenshots/${shot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scenePatch(nextScene)),
        });
      })
    );
  }

  return (
    <div className="style-gallery-page" data-slot="style-gallery">
      <header className="style-gallery-header">
        <div>
          <p className="eyebrow">Style gallery</p>
          <h1>Pick a screenshot style that fits the launch.</h1>
          <p>These presets keep the existing design language intact and push the same scene model used by the manual editor.</p>
        </div>
        <div className="header-actions">
          <Link href={`/editor/${project.id}`} className="btn btn-ghost">Back to editor</Link>
          <button className="btn btn-primary" onClick={applySelectedPreset}>Apply style</button>
        </div>
      </header>

      <div className="style-gallery-layout">
        <aside className="gallery-sidebar">
          <FilterGroup
            title="Mood"
            value={mood}
            options={["all", "calm", "bold", "premium", "playful", "utility"]}
            onChange={(value) => setMood(value as typeof mood)}
          />
          <FilterGroup
            title="Category"
            value={category}
            options={["all", "productivity", "wellness", "fintech", "consumer", "devtool"]}
            onChange={(value) => setCategory(value as typeof category)}
          />
          <FilterGroup
            title="Tier"
            value={tier}
            options={["all", "free", "pro"]}
            onChange={(value) => setTier(value as typeof tier)}
          />

          <div className="apply-scope">
            <div className="section-title">Apply scope</div>
            <div className="folder-options">
              <label className={`folder-pill ${scope === "all" ? "on" : ""}`}>
                <input type="radio" checked={scope === "all"} onChange={() => setScope("all")} />
                All screens
              </label>
              <label className={`folder-pill ${scope === "current" ? "on" : ""}`}>
                <input type="radio" checked={scope === "current"} onChange={() => setScope("current")} />
                Current only
              </label>
            </div>
          </div>
        </aside>

        <main className="style-gallery-grid">
          {visiblePresets.map((preset) => (
            <article
              key={preset.id}
              className={`gallery-card ${selectedPresetId === preset.id ? "on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPresetId(preset.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedPresetId(preset.id);
                }
              }}
            >
              <div className="gallery-preview">
                {first ? (
                  <ScenePreview
                    screenshot={{
                      ...first,
                      renderOverrides: scenePatch(applyStylePreset(getScene(first, project), preset.id)).renderOverrides,
                    }}
                    project={project}
                    scene={applyStylePreset(getScene(first, project), preset.id)}
                    activeLayer="screenshot"
                    previewLocale={previewLocale}
                    availableLocales={editor.languages}
                    onPreviewLocale={setPreviewLocale}
                    onActiveLayer={() => {}}
                    onSceneChange={() => {}}
                  />
                ) : (
                  <div className="gallery-empty">Upload a screenshot to preview styles.</div>
                )}
              </div>
              <div className="gallery-meta">
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <section className="sidebar-card">
      <div className="section-title">{title}</div>
      <div className="filter-list">
        {options.map((option) => (
          <label key={option} className={`folder-pill ${value === option ? "on" : ""}`}>
            <input type="radio" checked={value === option} onChange={() => onChange(option)} />
            {option}
          </label>
        ))}
      </div>
    </section>
  );
}
