"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";
import { ScreenshotList } from "./parts/screenshot-list";
import { ScenePreview } from "@/components/scene-preview";
import { SettingsPanel } from "./parts/settings-panel";
import { ExportButton } from "./parts/export-button";
import { uploadScreenshot } from "@/lib/upload-screenshot";
import { getEditorConfig, getPreset, getScene, localizedPatch, scenePatch } from "@/lib/editor-scene";
import type { Locale, StoreScreenshotScene } from "@shotwise/types";
import "./editor.css";

export function EditorShell({
  project,
  initialScreenshots,
}: {
  project: Project;
  initialScreenshots: Screenshot[];
}) {
  const [screenshots, setScreenshots] = React.useState<Screenshot[]>(initialScreenshots);
  const [projectState, setProjectState] = React.useState<Project>(project);
  const [activeId, setActiveId] = React.useState<string | null>(initialScreenshots[0]?.id ?? null);
  const [activeLayer, setActiveLayer] = React.useState<"screenshot" | `text:${string}` | `callout:${string}`>("screenshot");
  const [previewLocale, setPreviewLocale] = React.useState<Locale>("en");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const active = screenshots.find((s) => s.id === activeId) ?? null;
  const editorConfig = getEditorConfig(projectState);
  const scene = React.useMemo(() => getScene(active, projectState), [active, projectState]);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refreshScreenshots() {
    const r = await fetch(`/api/projects/${projectState.id}/screenshots`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as { screenshots: Screenshot[] };
      setScreenshots(data.screenshots);
      if (!activeId && data.screenshots.length) setActiveId(data.screenshots[0]!.id);
    }
  }

  async function refreshProject() {
    const r = await fetch(`/api/projects/${projectState.id}`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as { project: Project };
      setProjectState(data.project);
    }
  }

  async function handleDrop(files: File[]) {
    for (let i = 0; i < files.length; i++) {
      await uploadScreenshot({
        projectId: projectState.id,
        file: files[i]!,
        order: screenshots.length + i,
      });
    }
    await refreshScreenshots();
  }

  async function handleScreenshotPatch(id: string, patch: Partial<Screenshot>) {
    const r = await fetch(`/api/projects/${projectState.id}/screenshots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      const data = (await r.json()) as { screenshot: Screenshot };
      setScreenshots((prev) => prev.map((s) => (s.id === id ? data.screenshot : s)));
    }
  }

  function handleSceneChange(nextScene: StoreScreenshotScene) {
    if (!active) return;
    setSaveStatus("saving");
    setScreenshots((prev) =>
      prev.map((item) =>
        item.id === active.id
          ? { ...item, renderOverrides: { ...((item.renderOverrides ?? {}) as Record<string, unknown>), scene: nextScene } }
          : item
      )
    );
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await handleScreenshotPatch(active.id, scenePatch(nextScene) as Partial<Screenshot>);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 420);
  }

  async function handleTextChange(locale: Locale, next: { title?: string; accent?: string; subtitle?: string }) {
    if (!active) return;
    const patch = localizedPatch(active, locale, next.title ?? "", next.accent, next.subtitle);
    setScreenshots((prev) => prev.map((item) => item.id === active.id ? { ...item, localized: patch.localized } : item));
    await handleScreenshotPatch(active.id, patch as Partial<Screenshot>);
    setSaveStatus("saved");
  }

  async function patchProjectConfig(patch: Record<string, unknown>) {
    setSaveStatus("saving");
    const r = await fetch(`/api/projects/${projectState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      const data = (await r.json()) as { project: Project };
      setProjectState(data.project);
      setSaveStatus("saved");
    } else {
      setSaveStatus("error");
    }
  }

  async function reorderScreenshots(order: Screenshot[]) {
    setScreenshots(order);
    await fetch(`/api/projects/${projectState.id}/screenshots/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: order.map((s, i) => ({ id: s.id, order: i })) }),
    });
    await refreshScreenshots();
  }

  const preset = getPreset(scene.canvasPresetId ?? editorConfig.canvasPresetId);
  const langCount = editorConfig.languages.length;
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
            onReorder={reorderScreenshots}
            projectId={projectState.id}
          />
          <div className="pane-foot">
            <ExportButton project={projectState} screenshotCount={screenshots.length} compact />
          </div>
        </aside>

        <section className="pane-center" data-slot="editor-canvas">
          <div className="canvas-meta">
            <span className="pill">{preset.label}</span>
            <span className="pill">{scene.layoutPreset}</span>
            <span className="pill">{saveStatus === "saving" ? "Saving..." : "Native preview"}</span>
          </div>
          {active ? (
            <ScenePreview
              screenshot={active}
              project={projectState}
              scene={scene}
              activeLayer={activeLayer}
              previewLocale={previewLocale}
              availableLocales={editorConfig.languages}
              onPreviewLocale={setPreviewLocale}
              onActiveLayer={setActiveLayer}
              onSceneChange={handleSceneChange}
            />
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
              project={projectState}
              screenshot={active}
              scene={scene}
              activeLayer={activeLayer}
              previewLocale={previewLocale}
              availableLocales={editorConfig.languages}
              onPreviewLocale={setPreviewLocale}
              saveStatus={saveStatus}
              onSceneChange={handleSceneChange}
              onTextChange={handleTextChange}
              onProjectConfig={async (patch) => {
                await patchProjectConfig(patch);
                await refreshProject();
              }}
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
          Project <b>{projectState.name}</b>
        </div>
        <div className="info">
          Renders: <b>{screenshots.length} screens × {langCount} locales</b> = <b>{renderCount} images</b>
        </div>
        <div className="spacer" />
        <ExportButton project={projectState} screenshotCount={screenshots.length} />
      </div>
    </>
  );
}
