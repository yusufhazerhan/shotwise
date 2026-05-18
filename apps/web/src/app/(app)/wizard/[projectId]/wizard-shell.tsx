"use client";
import * as React from "react";
import type { Project, Screenshot } from "@shotwise/db";
import { Button, ProgressBar } from "@shotwise/ui-primitives";
import { Step1AppInfo } from "./steps/step1-app-info";
import { Step2Upload } from "./steps/step2-upload";
import { Step3Analyzing } from "./steps/step3-analyzing";
import { Step4ReviewTitles } from "./steps/step4-review";
import { Step5Languages } from "./steps/step5-languages";
import { Step6Generate } from "./steps/step6-generate";

export function WizardShell({ project, initialScreenshots }: { project: Project; initialScreenshots: Screenshot[] }) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [screenshots, setScreenshots] = React.useState<Screenshot[]>(initialScreenshots);
  const [projectState, setProjectState] = React.useState<Project>(project);

  async function refreshScreenshots() {
    const r = await fetch(`/api/projects/${project.id}/screenshots`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as { screenshots: Screenshot[] };
      setScreenshots(data.screenshots);
    }
  }

  async function refreshProject() {
    const r = await fetch(`/api/projects/${project.id}`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as { project: Project };
      setProjectState(data.project);
    }
  }

  return (
    <div data-slot="wizard-shell" style={{ maxWidth: 640, margin: "0 auto" }}>
      <header data-slot="wizard-progress" style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--muted-fg)", margin: 0 }}>Step {step} of 6</p>
        <ProgressBar value={(step / 6) * 100} style={{ marginTop: "0.4rem" }} />
      </header>

      {step === 1 && (
        <Step1AppInfo
          project={projectState}
          onContinue={async () => {
            await refreshProject();
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2Upload
          project={projectState}
          screenshots={screenshots}
          onUpload={refreshScreenshots}
          onContinue={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Analyzing
          project={projectState}
          screenshots={screenshots}
          onDone={async () => {
            await refreshScreenshots();
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4ReviewTitles
          project={projectState}
          screenshots={screenshots}
          onPatch={async () => {
            await refreshScreenshots();
          }}
          onContinue={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <Step5Languages
          project={projectState}
          onSave={async () => {
            await refreshProject();
          }}
          onContinue={async () => {
            // Translate to all selected non-source languages
            const config = (projectState.config ?? {}) as { languages?: string[] };
            const langs = config.languages ?? ["en"];
            const targets = langs.filter((l) => l !== "en");
            if (targets.length > 0) {
              await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: project.id, sourceLocale: "en", targets }),
              });
              await refreshScreenshots();
            }
            setStep(6);
          }}
          onBack={() => setStep(4)}
        />
      )}
      {step === 6 && (
        <Step6Generate
          project={projectState}
          screenshots={screenshots}
          onBack={() => setStep(5)}
        />
      )}

      <footer data-slot="wizard-footer" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>Shotwise Wizard · saved automatically</span>
        {step > 1 && step < 6 && (
          <Button variant="ghost" size="sm" onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4 | 5)}>
            ← Back
          </Button>
        )}
      </footer>
    </div>
  );
}
