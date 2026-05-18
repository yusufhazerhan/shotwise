import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await requireUser();
  const db = getDb();
  const project = await queries.getProjectById(db, id, user.id);
  if (!project) notFound();

  const [screenshots] = await Promise.all([queries.listScreenshots(db, project.id)]);

  return (
    <div data-slot="project-detail">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
          <p style={{ color: "var(--muted-fg)", margin: 0 }}>{project.mode} mode</p>
        </div>
        <Link
          href={`/${project.mode === "wizard" ? "wizard" : "editor"}/${project.id}`}
          className="sw-btn sw-btn--primary"
        >
          Open editor
        </Link>
      </header>

      <section data-slot="project-screenshots" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Screenshots ({screenshots.length})</h2>
        {screenshots.length === 0 ? (
          <p style={{ color: "var(--muted-fg)" }}>No screenshots uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.4rem" }}>
            {screenshots.map((s) => (
              <li key={s.id} className="sw-card sw-card-body" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>#{s.order + 1} · {s.status}</span>
                <span style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>
                  {Object.keys((s.localized ?? {}) as Record<string, unknown>).length} locale(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
