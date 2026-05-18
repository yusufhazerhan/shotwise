import { redirect } from "next/navigation";
import { WizardShell } from "./wizard-shell";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";

export default async function WizardPage(props: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await props.params;
  const user = await requireUser();
  const db = getDb();

  if (projectId === "new") {
    const project = await queries.createProject(db, {
      userId: user.id,
      name: "Wizard project",
      mode: "wizard",
      appMetadata: {},
      config: {
        themeId: "cream",
        canvasPresetId: "iphone67",
        languages: ["en"],
        defaultPosition: "top",
      },
    });
    redirect(`/wizard/${project.id}`);
  }

  const project = await queries.getProjectById(db, projectId, user.id);
  if (!project) redirect("/dashboard");
  const screenshots = await queries.listScreenshots(db, project.id);

  return <WizardShell project={project} initialScreenshots={screenshots} />;
}
