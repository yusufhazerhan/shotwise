import { z } from "zod";
import { defineRoute } from "@/lib/api-handler";
import { getDb, queries } from "@shotwise/db";

export const runtime = "nodejs";

export const GET = defineRoute({ auth: true }, async ({ user }) => {
  const list = await queries.listProjects(getDb(), user.id);
  return { projects: list };
});

const CreateBody = z.object({
  name: z.string().min(1).max(120).optional(),
  mode: z.enum(["manual", "wizard"]).default("manual"),
  appMetadata: z.record(z.unknown()).optional(),
});

export const POST = defineRoute({ auth: true, body: CreateBody }, async ({ user, body }) => {
  const project = await queries.createProject(getDb(), {
    userId: user.id,
    name: body.name ?? "Untitled project",
    mode: body.mode,
    appMetadata: body.appMetadata ?? {},
    config: {
      themeId: "cream",
      canvasPresetId: "iphone67",
      languages: ["en"],
      defaultPosition: "top",
    },
  });
  return { project };
});
