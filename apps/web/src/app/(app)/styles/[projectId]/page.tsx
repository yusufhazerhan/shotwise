import * as React from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { StyleGalleryView } from "./style-gallery-view";
import "./styles.css";

export default async function StyleGalleryPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const user = await requireUser();
  const db = getDb();
  const project = await queries.getProjectById(db, projectId, user.id);
  if (!project) redirect("/dashboard");
  const screenshots = await queries.listScreenshots(db, project.id);

  return <StyleGalleryView project={project} screenshots={screenshots} />;
}
