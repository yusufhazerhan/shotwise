"use client";
import * as React from "react";
import { Button, Checkbox } from "@shotwise/ui-primitives";
import { LOCALES, LOCALE_LABELS, type Locale } from "@shotwise/types";
import type { Project } from "@shotwise/db";

export function Step5Languages({
  project,
  onSave,
  onContinue,
  onBack,
}: {
  project: Project;
  onSave: () => Promise<void> | void;
  onContinue: () => Promise<void> | void;
  onBack: () => void;
}) {
  const config = (project.config ?? {}) as { languages?: Locale[] };
  const [langs, setLangs] = React.useState<Set<Locale>>(new Set(config.languages ?? ["en"]));
  const [submitting, setSubmitting] = React.useState(false);

  function toggle(l: Locale) {
    setLangs((prev) => {
      const next = new Set(prev);
      if (next.has(l)) next.delete(l);
      else next.add(l);
      if (!next.has("en")) next.add("en"); // always include source
      return next;
    });
  }

  async function persist() {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: { ...config, languages: Array.from(langs) } }),
    });
    await onSave();
  }

  return (
    <div data-slot="wizard-step-5">
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Pick languages</h1>
      <p style={{ color: "var(--muted-fg)" }}>EN is always included. Translations cost no extra credits.</p>

      <div data-slot="lang-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
        {LOCALES.map((l) => (
          <label key={l} data-locale={l} className="sw-card sw-card-body" style={{ display: "flex", gap: "0.5rem", alignItems: "center", cursor: "pointer" }}>
            <Checkbox checked={langs.has(l)} onCheckedChange={() => toggle(l)} />
            <span>{LOCALE_LABELS[l]}</span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button
          variant="primary"
          loading={submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await persist();
              await onContinue();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
