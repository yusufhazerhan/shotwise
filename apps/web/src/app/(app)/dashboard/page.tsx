import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await queries.listProjects(getDb(), user.id);

  return (
    <div data-slot="dashboard">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h1 style={{ margin: 0 }}>Your projects</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/wizard/new" className="sw-btn sw-btn--primary">New (Wizard)</Link>
          <Link href="/editor/new" className="sw-btn sw-btn--secondary">New (Manual)</Link>
        </div>
      </header>

      {projects.length === 0 ? (
        <div data-slot="empty-state" className="sw-card sw-card-body" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p>No projects yet.</p>
          <Link href="/wizard/new" className="sw-btn sw-btn--primary" style={{ marginTop: "1rem" }}>
            Start with AI Wizard
          </Link>
        </div>
      ) : (
        <ul data-slot="project-list" style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.6rem" }}>
          {projects.map((p) => (
            <li key={p.id} className="sw-card sw-card-body" style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>
                  {p.mode} · updated {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <Link href={`/${p.mode === "wizard" ? "wizard" : "editor"}/${p.id}`} className="sw-btn sw-btn--secondary sw-btn--sm">
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
