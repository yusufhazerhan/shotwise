import * as React from "react";
import { redirect } from "next/navigation";
import { EditorShell } from "./editor-shell";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";

export default async function EditorPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const user = await requireUser();
  const db = getDb();

  let effectiveId = projectId;
  if (projectId === "new") {
    const project = await queries.createProject(db, {
      userId: user.id,
      name: "Untitled project",
      mode: "manual",
      appMetadata: {},
      config: {
        themeId: "cream",
        canvasPresetId: "iphone69",
        languages: ["en"],
        defaultPosition: "top",
        editor: {
          canvasPresetId: "iphone69",
          languages: ["en"],
          themeId: "cream",
          layoutPreset: "single",
          defaultFont: "Fraunces, Georgia, serif",
        },
      },
    });
    redirect(`/editor/${project.id}`);
  }

  const project = await queries.getProjectById(db, effectiveId, user.id);
  if (!project) redirect("/dashboard");

  const screenshots = await queries.listScreenshots(db, project.id);

  return <EditorShell project={project} initialScreenshots={screenshots} />;
}
