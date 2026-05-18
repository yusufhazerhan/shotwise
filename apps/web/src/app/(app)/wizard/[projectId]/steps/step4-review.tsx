"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";

export function Step4ReviewTitles({
  project,
  screenshots,
  onPatch,
  onContinue,
  onBack,
}: {
  project: Project;
  screenshots: Screenshot[];
  onPatch: () => Promise<void>;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div data-slot="wizard-step-4">
      <span className="step-eyebrow">// Step 4 — Review AI suggestions</span>
      <h1 className="step-h">Pick a title for each screen.</h1>
      <p className="step-sub">3 AI suggestions per screen. Choose one or write your own.</p>

      <div className="review-list">
        {screenshots.map((s, i) => (
          <ReviewCard key={s.id} index={i} project={project} screenshot={s} onPatch={onPatch} />
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onContinue}>Continue →</button>
      </div>
    </div>
  );
}

function ReviewCard({
  index,
  project,
  screenshot,
  onPatch,
}: {
  index: number;
  project: Project;
  screenshot: Screenshot;
  onPatch: () => Promise<void>;
}) {
  const analysis = (screenshot.aiAnalysis ?? {}) as {
    description?: string;
    suggestedTitles?: string[];
    suggestedAccent?: string;
  };
  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string }>;
  const en = localized.en ?? { title: analysis.suggestedTitles?.[0] ?? "", accent: analysis.suggestedAccent ?? "" };

  const [title, setTitle] = React.useState(en.title ?? "");
  const [accent, setAccent] = React.useState(en.accent ?? "");
  const [regen, setRegen] = React.useState(false);
  const [titles, setTitles] = React.useState(analysis.suggestedTitles ?? []);

  async function pickTitle(t: string) {
    setTitle(t);
    await save(t, accent);
  }

  async function save(t: string, a: string) {
    await fetch(`/api/projects/${project.id}/screenshots/${screenshot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ localized: { ...localized, en: { title: t, accent: a || undefined } } }),
    });
    await onPatch();
  }

  async function regenerate() {
    setRegen(true);
    try {
      const r = await fetch("/api/ai/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotId: screenshot.id, avoid: titles }),
      });
      if (r.ok) {
        const data = (await r.json()) as { titles: string[]; accent: string };
        setTitles(data.titles);
        setAccent(data.accent);
      }
    } finally {
      setRegen(false);
    }
  }

  return (
    <div data-slot="wizard-review-card" className="review-card">
      <div className="review-head">
        <div className="review-thumb" />
        <div className="review-nm">Screen #{index + 1}</div>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={regenerate} disabled={regen}>
          {regen ? "…" : "Regenerate"}
        </button>
      </div>
      <div className="review-body">
        {analysis.description && (
          <p style={{ color: "var(--ink-mute)", fontSize: 13, margin: "0 0 12px" }}>{analysis.description}</p>
        )}

        <div className="title-opts">
          {titles.map((t, i) => (
            <div
              key={i}
              className={`title-opt ${t === title ? "chosen" : ""}`}
              onClick={() => pickTitle(t)}
            >
              <div className="check" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="label" htmlFor={`title-${screenshot.id}`} style={{ display: "block", marginBottom: 6 }}>
            Or write your own
          </label>
          <textarea
            id={`title-${screenshot.id}`}
            className="textarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save(title, accent)}
            rows={2}
          />
          <label className="label" htmlFor={`accent-${screenshot.id}`} style={{ display: "block", margin: "10px 0 6px" }}>
            Accent phrase
          </label>
          <input
            id={`accent-${screenshot.id}`}
            className="input"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            onBlur={() => save(title, accent)}
          />
        </div>
      </div>
    </div>
  );
}
