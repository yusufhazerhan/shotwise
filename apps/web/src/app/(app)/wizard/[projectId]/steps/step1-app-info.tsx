"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Project } from "@shotwise/db";

const Schema = z.object({
  appName: z.string().min(1, "Required").max(60),
  category: z.enum(["productivity", "health", "lifestyle", "education", "pet", "finance", "social", "utilities", "other"]),
  tagline: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  targetAudience: z.string().max(80).optional(),
});

type FormValues = z.infer<typeof Schema>;

const CATEGORIES = ["productivity", "health", "lifestyle", "education", "pet", "finance", "social", "utilities", "other"] as const;

export function Step1AppInfo({ project, onContinue }: { project: Project; onContinue: () => Promise<void> | void }) {
  const meta = (project.appMetadata ?? {}) as Partial<FormValues>;
  const { register, handleSubmit, formState, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      appName: meta.appName ?? project.name,
      category: meta.category ?? "other",
      tagline: meta.tagline ?? "",
      description: meta.description ?? "",
      targetAudience: meta.targetAudience ?? "",
    },
  });
  const category = watch("category");

  async function onSubmit(values: FormValues) {
    const parsed = Schema.safeParse(values);
    if (!parsed.success) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: parsed.data.appName, appMetadata: parsed.data }),
    });
    await onContinue();
  }

  return (
    <form data-slot="wizard-step-1" onSubmit={handleSubmit(onSubmit)}>
      <span className="step-eyebrow">// Step 1 — About your app</span>
      <h1 className="step-h">Tell us about your app.</h1>
      <p className="step-sub">Three short fields plus a few features. The AI uses them to write titles that match your tone.</p>

      <div className="step-body">
        <div className="field">
          <label className="label" htmlFor="s1-name">App name <span style={{ color: "#B91C1C" }}>*</span></label>
          <input id="s1-name" className="input" {...register("appName", { required: true })} />
        </div>

        <div className="field">
          <label className="label" htmlFor="s1-cat">Category</label>
          <select
            id="s1-cat"
            className="select"
            value={category}
            onChange={(e) => setValue("category", e.target.value as FormValues["category"])}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="s1-tag">Tagline</label>
          <input id="s1-tag" className="input" maxLength={100} {...register("tagline")} />
        </div>

        <div className="field">
          <label className="label" htmlFor="s1-desc">Short description</label>
          <textarea id="s1-desc" className="textarea" maxLength={500} rows={3} {...register("description")} />
        </div>

        <div className="field">
          <label className="label" htmlFor="s1-aud">Target audience</label>
          <input id="s1-aud" className="input" maxLength={80} placeholder="e.g. solo founders, pet parents" {...register("targetAudience")} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving…" : "Continue →"}
        </button>
      </div>
    </form>
  );
}
