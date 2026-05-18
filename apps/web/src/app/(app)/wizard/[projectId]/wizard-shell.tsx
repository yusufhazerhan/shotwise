"use client";
import * as React from "react";
import Link from "next/link";
import type { Project, Screenshot } from "@shotwise/db";
import { Step1AppInfo } from "./steps/step1-app-info";
import { Step2Upload } from "./steps/step2-upload";
import { Step3Analyzing } from "./steps/step3-analyzing";
import { Step4ReviewTitles } from "./steps/step4-review";
import { Step5Languages } from "./steps/step5-languages";
import { Step6Generate } from "./steps/step6-generate";
import "./wizard.css";

const STEP_LABELS = ["App", "Upload", "Analyze", "Titles", "Style", "Generate"];
const STEP_NAMES = [
  "Tell us about your app",
  "Upload screenshots",
  "AI is analyzing",
  "Review AI suggestions",
  "Pick your style",
  "Generate & download",
];

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

  const fillPct = Math.round((step / 6) * 100);

  return (
    <div data-slot="wizard-shell">
      {/* Stepper progress */}
      <div className="stepper">
        <div className="stepper-inner">
          <div className="stepper-meta">
            <span>STEP <b>{step}</b> / 6</span>
            <span>{STEP_NAMES[step - 1]}</span>
          </div>
          <div className="stepper-bar">
            <div style={{ width: `${fillPct}%` }} />
          </div>
          <div className="stepper-dots">
            {STEP_LABELS.map((label, i) => {
              const idx = i + 1;
              const cls = idx === step ? "d cur" : idx < step ? "d done" : "d";
              return <div key={label} className={cls}>{label}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Stage — step content */}
      <main className="stage">
        <div className="stage-inner step-enter" key={step}>
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
        </div>
      </main>

      {/* Fixed bottom footer */}
      <div className="wiz-foot">
        <div className="container wiz-foot-inner">
          {step > 1 && step < 6 ? (
            <button
              className="btn btn-ghost"
              onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4 | 5)}
            >
              ← Back
            </button>
          ) : (
            <Link href="/dashboard" className="btn btn-ghost">Exit</Link>
          )}
          <div style={{ flex: 1 }} />
          <span className="pg">{step} of 6</span>
        </div>
      </div>
    </div>
  );
}
