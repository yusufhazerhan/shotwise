"use client";
import * as React from "react";
import type { Project } from "@shotwise/db";
import type { Locale } from "@shotwise/types";
import { useRouter } from "next/navigation";
import { getEditorConfig } from "@/lib/editor-scene";
import { getExportPlan } from "@/lib/export-cost";

export function ExportButton({
  project,
  screenshotCount,
  compact,
}: {
  project: Project;
  screenshotCount: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const editor = getEditorConfig(project);
  const languages = (((project.config ?? {}) as { languages?: Locale[] }).languages ?? editor.languages);
  const plan = getExportPlan({
    screenCount: screenshotCount,
    languages,
    devicePresetIds: editor.selectedDevicePresetIds,
    includeFeatureGraphic: editor.includeFeatureGraphic,
  });

  return (
    <button
      className={compact ? "btn btn-primary btn-sm" : "btn btn-primary"}
      disabled={screenshotCount === 0}
      onClick={() => router.push(`/projects/${project.id}/export`)}
    >
      {compact ? "Export matrix" : `Review export (${plan.finalImageCount})`}
    </button>
  );
}
