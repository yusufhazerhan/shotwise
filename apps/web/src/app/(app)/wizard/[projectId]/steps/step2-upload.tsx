"use client";
import * as React from "react";
import { DropZone } from "@shotwise/ui-primitives";
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
        await uploadScreenshot({ projectId: project.id, file: subset[i]!, order: screenshots.length + i });
      }
      await onUpload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-slot="wizard-step-2">
      <span className="step-eyebrow">// Step 2 — Upload screenshots</span>
      <h1 className="step-h">Drop your screenshots.</h1>
      <p className="step-sub">PNG / JPG / WebP · up to 10 files · max 20 MB each. Drag to reorder.</p>

      <DropZone
        className="uploader"
        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] }}
        maxSize={20 * 1024 * 1024}
        multiple
        onDrop={(f) => handle(f as File[])}
        disabled={busy || remaining === 0}
      >
        <div className="icon">⇣</div>
        <h4>
          {remaining === 0
            ? "Maximum 10 screenshots reached"
            : busy
            ? "Uploading…"
            : "Drop screenshots here, or click to browse"}
        </h4>
        <p>PNG or JPG · up to 10 files · max 20 MB each</p>
      </DropZone>

      {screenshots.length > 0 && (
        <div className="upload-grid" data-slot="wizard-upload-list">
          {screenshots.map((s, i) => (
            <div key={s.id} className="upload-card">
              <div className="thumb" />
              <div className="nm">Screen {i + 1}</div>
            </div>
          ))}
        </div>
      )}

      {screenshots.length > 0 && (
        <p style={{ marginTop: 14, fontSize: "12.5px", color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
          {screenshots.length} of 10 uploaded
        </p>
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" disabled={screenshots.length === 0} onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}
