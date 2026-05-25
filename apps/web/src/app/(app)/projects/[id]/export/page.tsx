import * as React from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { ExportMatrixView } from "./export-matrix-view";
import "../../../dashboard/dashboard.css";
import "./export.css";

export default async function ProjectExportMatrixPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await requireUser();
  const db = getDb();
  const project = await queries.getProjectById(db, id, user.id);
  if (!project) redirect("/dashboard");
  const screenshots = await queries.listScreenshots(db, project.id);

  return <ExportMatrixView project={project} screenshots={screenshots} />;
}
