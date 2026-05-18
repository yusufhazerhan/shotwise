"use client";
import * as React from "react";
import { DropZone } from "@shotwise/ui-primitives";
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
    <>
      <DropZone
        className="drop-zone"
        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
        maxSize={20 * 1024 * 1024}
        multiple
        onDrop={(files) => handleFiles(files as File[])}
      >
        <span className="plus">+</span>{busy ? " Uploading…" : " Add screenshot"}
      </DropZone>

      <div className="shot-list" data-slot="screenshot-list">
        {screenshots.map((s, i) => (
          <div
            key={s.id}
            data-slot="screenshot-list-item"
            data-selected={activeId === s.id ? "" : undefined}
            className="shot-item"
            onClick={() => onSelect(s.id)}
          >
            <div className="shot-thumb" />
            <div className="shot-info">
              <div className="nm">Screen {i + 1}</div>
              <div className="sz">{s.status}</div>
            </div>
            <button
              className="shot-remove"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete(s.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
