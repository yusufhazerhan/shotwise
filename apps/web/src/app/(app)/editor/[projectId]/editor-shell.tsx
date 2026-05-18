"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";
import { ScreenshotList } from "./parts/screenshot-list";
import { LivePreview } from "@/components/live-preview";
import { SettingsPanel } from "./parts/settings-panel";
import { ExportButton } from "./parts/export-button";
import { uploadScreenshot } from "@/lib/upload-screenshot";
import "./editor.css";

const PRESET_LABEL: Record<string, string> = {
  iphone67: '6.7" iPhone · 1284×2778',
  iphone65: '6.5" iPhone · 1242×2688',
  ipad129: 'iPad Pro · 2048×2732',
  android: 'Android · 1080×1920',
};

export function EditorShell({
  project,
  initialScreenshots,
}: {
  project: Project;
  initialScreenshots: Screenshot[];
}) {
  const [screenshots, setScreenshots] = React.useState<Screenshot[]>(initialScreenshots);
  const [activeId, setActiveId] = React.useState<string | null>(initialScreenshots[0]?.id ?? null);
  const active = screenshots.find((s) => s.id === activeId) ?? null;
  const config = (project.config ?? {}) as { canvasPresetId?: string; languages?: string[] };

  async function refreshScreenshots() {
    const r = await fetch(`/api/projects/${project.id}/screenshots`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as { screenshots: Screenshot[] };
      setScreenshots(data.screenshots);
      if (!activeId && data.screenshots.length) setActiveId(data.screenshots[0]!.id);
    }
  }

  async function handleDrop(files: File[]) {
    for (let i = 0; i < files.length; i++) {
      await uploadScreenshot({
        projectId: project.id,
        file: files[i]!,
        order: screenshots.length + i,
      });
    }
    await refreshScreenshots();
  }

  async function handleScreenshotPatch(id: string, patch: Partial<Screenshot>) {
    const r = await fetch(`/api/projects/${project.id}/screenshots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      const data = (await r.json()) as { screenshot: Screenshot };
      setScreenshots((prev) => prev.map((s) => (s.id === id ? data.screenshot : s)));
    }
  }

  const presetLabel = PRESET_LABEL[config.canvasPresetId ?? "iphone67"];
  const langCount = (config.languages ?? ["en"]).length;
  const renderCount = screenshots.length * langCount;

  return (
    <>
      <div className="editor-shell" data-slot="editor-shell">
        <aside className="pane-left" data-slot="editor-list">
          <div className="pane-head">
            <h5>Screens</h5>
            <span className="count">{screenshots.length} / 10</span>
          </div>
          <ScreenshotList
            screenshots={screenshots}
            activeId={activeId}
            onSelect={setActiveId}
            onDrop={handleDrop}
            onRefresh={refreshScreenshots}
            projectId={project.id}
          />
          <div className="pane-foot">
            <ExportButton project={project} screenshotCount={screenshots.length} compact />
          </div>
        </aside>

        <section className="pane-center" data-slot="editor-canvas">
          <div className="canvas-meta">
            <span className="pill">{presetLabel}</span>
            {active && <span className="pill">Live preview</span>}
          </div>
          {active ? (
            <LivePreview screenshot={active} project={project} />
          ) : (
            <div style={{ textAlign: "center", color: "var(--ink-soft)" }}>
              <p style={{ marginBottom: 12 }}>Drop screenshots on the left to begin.</p>
              <span className="pill">Manual mode</span>
            </div>
          )}
        </section>

        <aside className="pane-right" data-slot="editor-settings">
          {active ? (
            <SettingsPanel
              project={project}
              screenshot={active}
              onScreenshotPatch={(patch) => handleScreenshotPatch(active.id, patch)}
            />
          ) : (
            <div style={{ padding: 20, color: "var(--ink-mute)" }}>
              <p>Select a screenshot to edit its title, accent, and styling.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="export-footer" data-slot="editor-export-footer">
        <div className="info">
          Project <b>{project.name}</b>
        </div>
        <div className="info">
          Renders: <b>{screenshots.length} screens × {langCount} locales</b> = <b>{renderCount} images</b>
        </div>
        <div className="spacer" />
        <ExportButton project={project} screenshotCount={screenshots.length} />
      </div>
    </>
  );
}
