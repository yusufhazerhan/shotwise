"use client";
import * as React from "react";
import { Button, ProgressBar, Spinner } from "@shotwise/ui-primitives";
import type { Project, Screenshot } from "@shotwise/db";

export function Step3Analyzing({
  project,
  screenshots,
  onDone,
  onBack,
}: {
  project: Project;
  screenshots: Screenshot[];
  onDone: () => void;
  onBack: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (running) return;
    setRunning(true);
    (async () => {
      try {
        for (let i = 0; i < screenshots.length; i++) {
          const ss = screenshots[i]!;
          if (ss.aiAnalysis) {
            setIndex(i + 1);
            continue;
          }
          const r = await fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ screenshotId: ss.id }),
          });
          if (!r.ok) {
            const j = await r.json().catch(() => ({}));
            setError(j?.error?.message ?? `HTTP ${r.status}`);
            return;
          }
          setIndex(i + 1);
        }
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI analysis failed");
      } finally {
        setRunning(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-slot="wizard-step-3" style={{ textAlign: "center" }}>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>AI is analyzing your screens</h1>
      <p style={{ color: "var(--muted-fg)" }}>Reading each screenshot and generating titles…</p>
      <div style={{ margin: "1.5rem 0" }}>
        <Spinner />
      </div>
      <ProgressBar value={(index / Math.max(screenshots.length, 1)) * 100} />
      <p style={{ marginTop: "0.6rem", color: "var(--muted-fg)" }}>{index} / {screenshots.length} analyzed</p>
      {error && (
        <div data-slot="wizard-step-3-error" style={{ color: "#dc2626", marginTop: "1rem" }}>
          <p>{error}</p>
          <Button variant="secondary" onClick={onBack}>← Back</Button>
        </div>
      )}
    </div>
  );
}
