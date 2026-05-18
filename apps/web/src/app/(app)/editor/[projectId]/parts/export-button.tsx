"use client";
import * as React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@shotwise/ui-primitives";
import { useCredits } from "@/components/credit-balance";
import type { Project } from "@shotwise/db";
import type { Locale } from "@shotwise/types";
import { useRouter } from "next/navigation";

export function ExportButton({
  project,
  screenshotCount,
  compact,
}: {
  project: Project;
  screenshotCount: number;
  compact?: boolean;
}) {
  const { balance, refresh } = useCredits();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const config = (project.config ?? {}) as { languages?: Locale[] };
  const languages = config.languages ?? ["en"];
  const cost = screenshotCount;
  const enough = balance >= cost;

  async function doExport() {
    setLoading(true);
    try {
      const r = await fetch(`/api/projects/${project.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languages }),
      });
      if (r.status === 402) {
        const data = await r.json();
        const avail = (data.error as { balance?: number } | null)?.balance ?? 0;
        alert(`Not enough credits: ${avail} / ${cost} required. Buy more on the Credits page.`);
        router.push("/credits");
        return;
      }
      if (!r.ok) {
        alert(`Export failed (status ${r.status})`);
        return;
      }
      const data = (await r.json()) as { jobId: string };
      router.push(`/projects/${project.id}?job=${data.jobId}`);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={compact ? "btn btn-primary btn-sm" : "btn btn-primary"}
          disabled={screenshotCount === 0 || loading}
        >
          Export ({cost} {cost === 1 ? "credit" : "credits"})
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm export</DialogTitle>
        <DialogDescription>
          You will use <strong>{cost}</strong> credit{cost === 1 ? "" : "s"} to render{" "}
          <strong>{screenshotCount}</strong> screen{screenshotCount === 1 ? "" : "s"} across{" "}
          <strong>{languages.length}</strong> language{languages.length === 1 ? "" : "s"}.
        </DialogDescription>
        <p style={{ marginTop: "0.5rem", color: "var(--ink-mute)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          Balance: {balance} → {balance - cost} after
        </p>
        {!enough && (
          <p style={{ color: "#B91C1C", marginTop: "0.5rem", fontSize: 14 }}>
            Not enough credits. <a href="/credits" style={{ textDecoration: "underline" }}>Buy a pack</a>.
          </p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
          <DialogClose asChild>
            <button className="btn btn-ghost">Cancel</button>
          </DialogClose>
          <button className="btn btn-primary" disabled={!enough || loading} onClick={doExport}>
            {loading ? "Exporting…" : "Confirm export"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
