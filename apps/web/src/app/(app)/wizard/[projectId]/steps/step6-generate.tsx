"use client";
import * as React from "react";
import Link from "next/link";
import type { Project, Screenshot } from "@shotwise/db";
import { useCredits } from "@/components/credit-balance";

export function Step6Generate({
  project,
  screenshots,
  onBack,
}: {
  project: Project;
  screenshots: Screenshot[];
  onBack: () => void;
}) {
  const { balance, refresh } = useCredits();
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "starting" | "running" | "succeeded" | "failed">("idle");
  const [progress, setProgress] = React.useState<{ total: number; done: number }>({ total: 0, done: 0 });
  const [error, setError] = React.useState<string | null>(null);

  const config = (project.config ?? {}) as { languages?: string[] };
  const languages = config.languages ?? ["en"];
  const cost = screenshots.length;
  const total = screenshots.length * languages.length;
  const insufficient = balance < cost;

  async function startExport() {
    setStatus("starting");
    setError(null);
    const r = await fetch(`/api/projects/${project.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languages }),
    });
    if (r.status === 402) { setError("Not enough credits. Buy a pack on the Credits page."); setStatus("failed"); return; }
    if (!r.ok) { setError(`Export failed: ${r.status}`); setStatus("failed"); return; }
    const data = (await r.json()) as { jobId: string };
    setJobId(data.jobId);
    setStatus("running");
    await refresh();
  }

  React.useEffect(() => {
    if (status !== "running" || !jobId) return;
    let alive = true;
    async function poll() {
      while (alive) {
        try {
          const r = await fetch(`/api/exports/${jobId}/status`, { cache: "no-store" });
          if (r.ok) {
            const data = (await r.json()) as { status: string; progress: { total: number; done: number }; errorMessage?: string | null };
            setProgress(data.progress);
            if (data.status === "succeeded") { setStatus("succeeded"); return; }
            if (data.status === "failed") { setError(data.errorMessage ?? "Export failed"); setStatus("failed"); return; }
          }
        } catch { /* keep polling */ }
        await new Promise((res) => setTimeout(res, 1500));
      }
    }
    void poll();
    return () => { alive = false; };
  }, [jobId, status]);

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div data-slot="wizard-step-6">
      <span className="step-eyebrow">// Step 6 — Generate</span>
      <h1 className="step-h">You&apos;re ready to generate.</h1>
      <p className="step-sub">Review the summary, then hit generate.</p>

      {status === "succeeded" ? (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div className="success-tick">✓</div>
          <h3 style={{ fontSize: 22, margin: "0 0 8px" }}>Done! {total} screenshots ready.</h3>
          <p style={{ color: "var(--ink-mute)", marginBottom: 22 }}>
            Your ZIP is available for 24 hours. Raw uploads have been deleted.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <a href={`/api/exports/${jobId}/download`} className="btn btn-primary btn-lg">⇣ Download ZIP</a>
            <Link href="/dashboard" className="btn btn-ghost btn-lg">Back to projects</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="summary-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="pill pill-coral">Ready to generate</span>
            </div>
            <p style={{ marginTop: 12, color: "var(--ink)", fontSize: 16, fontWeight: 500 }}>
              You&apos;re about to generate <strong>{screenshots.length}</strong> screenshots in <strong>{languages.length}</strong> language{languages.length === 1 ? "" : "s"} — <strong>{total}</strong> final images.
            </p>
            <div className="summary-stats">
              <div className="s"><div className="num">{screenshots.length}</div><div className="lab">Screens</div></div>
              <div className="s"><div className="num">{languages.length}</div><div className="lab">Languages</div></div>
              <div className="s"><div className="num">{total}</div><div className="lab">Images</div></div>
              <div className="s"><div className="num">{cost}</div><div className="lab">Credits</div></div>
            </div>

            {(status === "running" || status === "starting") && (
              <div className="gen-progress">
                <div className="bar"><div style={{ width: `${pct}%` }} /></div>
                <div className="meta">
                  <span>{status === "starting" ? "Starting…" : `Rendering · ${progress.done} of ${progress.total}`}</span>
                  <span>{pct}%</span>
                </div>
              </div>
            )}
          </div>

          {insufficient && status === "idle" && (
            <div style={{ background: "white", border: "1px solid #FCA5A5", borderRadius: 12, padding: "16px 20px", marginTop: 16 }}>
              <p style={{ color: "#B91C1C", margin: "0 0 10px" }}>Not enough credits. You need {cost} but have {balance}.</p>
              <Link href="/credits" className="btn btn-primary">Buy a credit pack</Link>
            </div>
          )}

          {status === "failed" && (
            <div style={{ color: "#B91C1C", marginTop: 16 }}>
              <p>{error ?? "Export failed"}</p>
              <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            </div>
          )}

          {status === "idle" && !insufficient && (
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-lg" onClick={startExport} style={{ flex: 1 }}>
                ⚡ Generate {cost} credit{cost === 1 ? "" : "s"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
