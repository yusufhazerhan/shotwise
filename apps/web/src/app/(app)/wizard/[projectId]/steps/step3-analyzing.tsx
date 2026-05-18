"use client";
import * as React from "react";
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
          if (!ss.aiAnalysis) {
            const r = await fetch("/api/ai/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenshotId: ss.id }),
            });
            if (!r.ok) {
              const j = await r.json().catch(() => ({})) as { error?: { message?: string } };
              setError(j?.error?.message ?? `HTTP ${r.status}`);
              return;
            }
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

  const pct = Math.round((index / Math.max(screenshots.length, 1)) * 100);

  return (
    <div data-slot="wizard-step-3">
      <span className="step-eyebrow">// Step 3 — Analyzing</span>
      <h1 className="step-h">Reading your screenshots…</h1>
      <p className="step-sub">The AI is identifying UI elements and generating title suggestions.</p>

      <div className="analyze-list">
        {screenshots.map((s, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <div key={s.id} className="analyze-card">
              <div className="analyze-thumb" />
              <div className="analyze-info">
                <div className="nm">Screen {i + 1}</div>
                <div className="st">
                  {done ? "✓ Done" : active ? "Analyzing…" : "Waiting"}
                </div>
                {active && (
                  <div className="analyze-progress">
                    <div style={{ width: "60%" }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ color: "#B91C1C" }}>{error}</p>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        </div>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: 13, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
        {index} / {screenshots.length} analyzed · {pct}%
      </p>
    </div>
  );
}
