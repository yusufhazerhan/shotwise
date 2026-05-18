"use client";
import * as React from "react";
import { Button, Input, Textarea, Label } from "@shotwise/ui-primitives";
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
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Pick a title for each screen</h1>
      <p style={{ color: "var(--muted-fg)" }}>3 AI suggestions per screen. Edit freely.</p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1.25rem", display: "grid", gap: "1rem" }}>
        {screenshots.map((s, i) => (
          <ReviewCard key={s.id} index={i} project={project} screenshot={s} onPatch={onPatch} />
        ))}
      </ul>

      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button variant="primary" onClick={onContinue}>Continue →</Button>
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
      body: JSON.stringify({
        localized: { ...localized, en: { title: t, accent: a || undefined } },
      }),
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
    <li data-slot="wizard-review-card" className="sw-card sw-card-body">
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Screen #{index + 1}</strong>
        <Button variant="ghost" size="sm" onClick={regenerate} loading={regen}>Regenerate</Button>
      </header>
      {analysis.description && (
        <p style={{ color: "var(--muted-fg)", fontSize: "0.85rem", margin: "0.4rem 0" }}>{analysis.description}</p>
      )}

      <div data-slot="title-suggestions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginTop: "0.5rem" }}>
        {titles.map((t, i) => (
          <button
            type="button"
            key={i}
            data-slot="title-suggestion"
            data-active={t === title ? "" : undefined}
            onClick={() => pickTitle(t)}
            className="sw-card sw-card-body"
            style={{ cursor: "pointer", textAlign: "left", padding: "0.6rem", borderColor: t === title ? "var(--accent)" : undefined }}
          >
            <small style={{ color: "var(--muted-fg)" }}>Option {i + 1}</small>
            <div style={{ whiteSpace: "pre-line" }}>{t}</div>
          </button>
        ))}
      </div>

      <Label htmlFor={`title-${screenshot.id}`} style={{ marginTop: "0.6rem" }}>Or write your own</Label>
      <Textarea
        id={`title-${screenshot.id}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => save(title, accent)}
        rows={2}
      />

      <Label htmlFor={`accent-${screenshot.id}`} style={{ marginTop: "0.5rem" }}>Accent word</Label>
      <Input
        id={`accent-${screenshot.id}`}
        value={accent}
        onChange={(e) => setAccent(e.target.value)}
        onBlur={() => save(title, accent)}
      />
    </li>
  );
}
