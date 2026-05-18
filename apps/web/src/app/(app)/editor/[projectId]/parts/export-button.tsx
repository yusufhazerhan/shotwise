"use client";
import * as React from "react";
import { Button, useToast, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@shotwise/ui-primitives";
import { useCredits } from "@/components/credit-balance";
import type { Project } from "@shotwise/db";
import type { Locale } from "@shotwise/types";
import { useRouter } from "next/navigation";

export function ExportButton({ project, screenshotCount }: { project: Project; screenshotCount: number }) {
  const { balance, refresh } = useCredits();
  const toast = useToast();
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
        toast.push({ title: "Out of credits", description: `${data.error?.balance ?? 0} / ${cost} required`, variant: "error" });
        router.push("/credits");
        return;
      }
      if (!r.ok) {
        toast.push({ title: "Export failed", description: `Status ${r.status}`, variant: "error" });
        return;
      }
      const data = (await r.json()) as { jobId: string };
      toast.push({ title: "Export started", description: "Tracking progress…", variant: "success" });
      router.push(`/projects/${project.id}?job=${data.jobId}`);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" disabled={screenshotCount === 0 || loading} style={{ width: "100%" }}>
          Export ({cost} {cost === 1 ? "credit" : "credits"})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm export</DialogTitle>
        <DialogDescription>
          You will use <strong>{cost}</strong> credit{cost === 1 ? "" : "s"} to render{" "}
          <strong>{screenshotCount}</strong> screen{screenshotCount === 1 ? "" : "s"} across{" "}
          <strong>{languages.length}</strong> language{languages.length === 1 ? "" : "s"}.
        </DialogDescription>
        <p style={{ marginTop: "0.5rem", color: "var(--muted-fg)" }}>
          Balance: {balance} → {balance - cost} after.
        </p>
        {!enough && (
          <p style={{ color: "#dc2626", marginTop: "0.5rem" }}>
            Not enough credits. <a href="/credits">Buy a pack</a>.
          </p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="primary" loading={loading} disabled={!enough} onClick={doExport}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
