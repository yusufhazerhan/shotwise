"use client";
import * as React from "react";
import { DropZone, Button } from "@shotwise/ui-primitives";
import type { Screenshot } from "@shotwise/db";

export function ScreenshotList({
  screenshots,
  activeId,
  onSelect,
  onDrop,
  onRefresh,
  projectId,
}: {
  screenshots: Screenshot[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDrop: (files: File[]) => Promise<void>;
  onRefresh: () => Promise<void>;
  projectId: string;
}) {
  const [busy, setBusy] = React.useState(false);

  async function handleFiles(files: File[]) {
    setBusy(true);
    try {
      await onDrop(files);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this screenshot?")) return;
    await fetch(`/api/projects/${projectId}/screenshots/${id}`, { method: "DELETE" });
    await onRefresh();
  }

  return (
    <div data-slot="screenshot-list">
      <h3 style={{ margin: 0, fontSize: "0.95rem" }}>Screenshots</h3>
      <DropZone
        compact
        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
        maxSize={20 * 1024 * 1024}
        multiple
        onDrop={(files) => handleFiles(files as File[])}
      >
        <p style={{ margin: 0, fontSize: "0.85rem" }}>{busy ? "Uploading…" : "+ Add screenshots"}</p>
      </DropZone>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem", display: "grid", gap: "0.4rem" }}>
        {screenshots.map((s, i) => (
          <li
            key={s.id}
            data-slot="screenshot-list-item"
            data-active={activeId === s.id ? "" : undefined}
            className="sw-card sw-card-body"
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderColor: activeId === s.id ? "var(--accent)" : undefined,
            }}
            onClick={() => onSelect(s.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>#{i + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(s.id);
                }}
              >
                ×
              </Button>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted-fg)" }}>{s.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
