"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Input, Label, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@shotwise/ui-primitives";
import type { Project } from "@shotwise/db";

const Schema = z.object({
  appName: z.string().min(1, "Required").max(60),
  category: z.enum(["productivity", "health", "lifestyle", "education", "pet", "finance", "social", "utilities", "other"]),
  tagline: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  targetAudience: z.string().max(80).optional(),
});

type FormValues = z.infer<typeof Schema>;

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
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Tell us about your app</h1>
      <p style={{ color: "var(--muted-fg)" }}>We pass this to the AI when generating titles.</p>

      <Label htmlFor="appName" style={{ marginTop: "1rem" }}>App name *</Label>
      <Input id="appName" {...register("appName", { required: true })} />

      <Label htmlFor="category" style={{ marginTop: "0.75rem" }}>Category</Label>
      <Select value={category} onValueChange={(v) => setValue("category", v as FormValues["category"])}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {(["productivity", "health", "lifestyle", "education", "pet", "finance", "social", "utilities", "other"] as const).map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="tagline" style={{ marginTop: "0.75rem" }}>Tagline</Label>
      <Input id="tagline" maxLength={100} {...register("tagline")} />

      <Label htmlFor="description" style={{ marginTop: "0.75rem" }}>Short description</Label>
      <Textarea id="description" maxLength={500} rows={3} {...register("description")} />

      <Label htmlFor="targetAudience" style={{ marginTop: "0.75rem" }}>Target audience</Label>
      <Input id="targetAudience" maxLength={80} placeholder="e.g. solo founders, pet parents" {...register("targetAudience")} />

      <Button type="submit" variant="primary" loading={formState.isSubmitting} style={{ width: "100%", marginTop: "1.25rem" }}>
        Continue →
      </Button>
    </form>
  );
}
