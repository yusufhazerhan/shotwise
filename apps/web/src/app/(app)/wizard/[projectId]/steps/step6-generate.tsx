"use client";
import * as React from "react";
import Link from "next/link";
import { Button, ProgressBar } from "@shotwise/ui-primitives";
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
  const insufficient = balance < cost;

  async function start() {
    setStatus("starting");
    setError(null);
    const r = await fetch(`/api/projects/${project.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languages }),
    });
    if (r.status === 402) {
      setError("Not enough credits");
      setStatus("failed");
      return;
    }
    if (!r.ok) {
      setError(`Export request failed: ${r.status}`);
      setStatus("failed");
      return;
    }
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
            const data = (await r.json()) as {
              status: typeof status;
              progress: { total: number; done: number };
              errorMessage?: string | null;
            };
            setProgress(data.progress);
            if (data.status === "succeeded") {
              setStatus("succeeded");
              return;
            }
            if (data.status === "failed") {
              setError(data.errorMessage ?? "Export failed");
              setStatus("failed");
              return;
            }
          }
        } catch {
          /* keep polling */
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    void poll();
    return () => {
      alive = false;
    };
  }, [jobId, status]);

  return (
    <div data-slot="wizard-step-6">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Generate & download</h1>
      <p style={{ color: "var(--muted-fg)" }}>
        We&apos;ll render <strong>{screenshots.length}</strong> screens × <strong>{languages.length}</strong> languages
        and bundle a ZIP. Cost: <strong>{cost}</strong> credit{cost === 1 ? "" : "s"}. Balance: <strong>{balance}</strong>.
      </p>

      {insufficient && status === "idle" && (
        <div data-slot="wizard-insufficient" className="sw-card sw-card-body" style={{ borderColor: "#dc2626" }}>
          <p>Not enough credits for this export.</p>
          <Link href="/credits" className="sw-btn sw-btn--primary">Buy a credit pack</Link>
        </div>
      )}

      {status === "idle" && !insufficient && (
        <Button variant="primary" onClick={start} style={{ width: "100%", marginTop: "1rem" }}>
          Generate ({cost} credit{cost === 1 ? "" : "s"})
        </Button>
      )}

      {(status === "starting" || status === "running") && (
        <div data-slot="wizard-export-progress" style={{ marginTop: "1rem" }}>
          <ProgressBar value={progress.total ? (progress.done / progress.total) * 100 : 0} />
          <p style={{ color: "var(--muted-fg)", marginTop: "0.4rem" }}>
            {progress.done} / {progress.total} renders complete
          </p>
        </div>
      )}

      {status === "succeeded" && jobId && (
        <div data-slot="wizard-export-success" className="sw-card sw-card-body" style={{ marginTop: "1rem", borderColor: "#16a34a" }}>
          <p>Done. Your ZIP is ready (available 24h).</p>
          <a href={`/api/exports/${jobId}/download`} className="sw-btn sw-btn--primary" style={{ width: "100%" }}>
            Download ZIP
          </a>
          <p style={{ marginTop: "0.6rem", color: "var(--muted-fg)" }}>
            Your raw uploads have been deleted. Project metadata stays so you can re-export later.
          </p>
        </div>
      )}

      {status === "failed" && (
        <div style={{ marginTop: "1rem", color: "#dc2626" }}>
          <p>{error ?? "Export failed"}</p>
          <Button variant="secondary" onClick={onBack}>← Back</Button>
        </div>
      )}
    </div>
  );
}
