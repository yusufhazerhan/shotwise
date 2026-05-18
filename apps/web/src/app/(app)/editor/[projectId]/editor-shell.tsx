"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";
import { ScreenshotList } from "./parts/screenshot-list";
import { LivePreview } from "@/components/live-preview";
import { SettingsPanel } from "./parts/settings-panel";
import { ExportButton } from "./parts/export-button";
import { uploadScreenshot } from "@/lib/upload-screenshot";

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
      const file = files[i]!;
      await uploadScreenshot({
        projectId: project.id,
        file,
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

  return (
    <div data-slot="editor-shell" style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", gap: "1rem", minHeight: "calc(100vh - 8rem)" }}>
      <aside data-slot="editor-list" className="sw-card sw-card-body" style={{ overflowY: "auto" }}>
        <ScreenshotList
          screenshots={screenshots}
          activeId={activeId}
          onSelect={setActiveId}
          onDrop={handleDrop}
          onRefresh={refreshScreenshots}
          projectId={project.id}
        />
      </aside>
      <section data-slot="editor-canvas" className="sw-card sw-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {active ? (
          <LivePreview screenshot={active} project={project} />
        ) : (
          <p style={{ color: "var(--muted-fg)" }}>Drop screenshots on the left to begin.</p>
        )}
      </section>
      <aside data-slot="editor-settings" className="sw-card sw-card-body" style={{ overflowY: "auto" }}>
        {active ? (
          <SettingsPanel
            project={project}
            screenshot={active}
            onScreenshotPatch={(patch) => handleScreenshotPatch(active.id, patch)}
          />
        ) : (
          <p style={{ color: "var(--muted-fg)" }}>Select a screenshot to edit.</p>
        )}
        <div style={{ marginTop: "1.25rem" }}>
          <ExportButton project={project} screenshotCount={screenshots.length} />
        </div>
      </aside>
    </div>
  );
}
