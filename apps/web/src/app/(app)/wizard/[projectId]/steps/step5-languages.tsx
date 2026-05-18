"use client";
import * as React from "react";
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
      if (!next.has("en")) next.add("en");
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
      <span className="step-eyebrow">// Step 5 — Pick your style</span>
      <h1 className="step-h">Choose languages.</h1>
      <p className="step-sub">EN is always included. Translations cost no extra credits — they&apos;re included in your export.</p>

      <div className="lang-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "0.5rem" }}>
        {LOCALES.map((l) => {
          const on = langs.has(l);
          return (
            <label
              key={l}
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                background: "white", border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                borderRadius: 10, padding: "10px 12px",
                transition: "all .15s ease",
              }}
              onClick={() => toggle(l)}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(l)}
                style={{ accentColor: "var(--ink)", width: 15, height: 15 }}
              />
              <span style={{ fontSize: 14, fontWeight: on ? 600 : 400, color: on ? "var(--ink)" : "var(--ink-soft)" }}>
                {LOCALE_LABELS[l]}
              </span>
            </label>
          );
        })}
      </div>

      <p style={{ marginTop: 12, fontSize: 13, color: "var(--ink-mute)", fontFamily: "var(--font-mono)" }}>
        {langs.size} language{langs.size === 1 ? "" : "s"} selected
      </p>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          disabled={submitting}
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
          {submitting ? "Translating…" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
