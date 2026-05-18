"use client";
import * as React from "react";
import { Button, DropZone } from "@shotwise/ui-primitives";
import type { Project, Screenshot } from "@shotwise/db";
import { uploadScreenshot } from "@/lib/upload-screenshot";

export function Step2Upload({
  project,
  screenshots,
  onUpload,
  onContinue,
  onBack,
}: {
  project: Project;
  screenshots: Screenshot[];
  onUpload: () => Promise<void>;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const remaining = 10 - screenshots.length;

  async function handle(files: File[]) {
    setBusy(true);
    try {
      const subset = files.slice(0, remaining);
      for (let i = 0; i < subset.length; i++) {
        await uploadScreenshot({
          projectId: project.id,
          file: subset[i]!,
          order: screenshots.length + i,
        });
      }
      await onUpload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-slot="wizard-step-2">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Upload screenshots</h1>
      <p style={{ color: "var(--muted-fg)" }}>1 to 10 screens · PNG / JPG / WebP, up to 20 MB each.</p>

      <DropZone
        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
        maxSize={20 * 1024 * 1024}
        multiple
        onDrop={(f) => handle(f as File[])}
        disabled={busy || remaining === 0}
      >
        <p style={{ margin: 0 }}>
          {remaining === 0
            ? "Maximum 10 screenshots reached"
            : busy
            ? "Uploading…"
            : "Drag & drop or click to add screens"}
        </p>
      </DropZone>

      {screenshots.length > 0 && (
        <ul data-slot="wizard-upload-list" style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
          {screenshots.map((s, i) => (
            <li key={s.id} className="sw-card sw-card-body" style={{ padding: "0.6rem", fontSize: "0.85rem" }}>
              #{i + 1} · {s.status}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button variant="primary" disabled={screenshots.length === 0} onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
