"use client";

import * as React from "react";
import Link from "next/link";
import type { Project, Screenshot } from "@shotwise/db";
import { LOCALE_LABELS, type Locale } from "@shotwise/types";
import { useCredits } from "@/components/credit-balance";
import { getEditorConfig, STORE_PRESETS, type StorePresetId } from "@/lib/editor-scene";
import { createExportMatrix, setAllForDevice, summarizeExportMatrix, toggleExportCell, type ExportMatrixSelection } from "@/lib/export-matrix";
import { useRouter } from "next/navigation";
import { getExportPlan } from "@/lib/export-cost";

const FEATURE_GRAPHIC_WIDTH = 1024;
const FEATURE_GRAPHIC_HEIGHT = 500;

export function ExportMatrixView({
  project,
  screenshots,
}: {
  project: Project;
  screenshots: Screenshot[];
}) {
  const router = useRouter();
  const { balance, refresh } = useCredits();
  const editor = getEditorConfig(project);
  const uploaded = React.useMemo(() => screenshots.filter((s) => s.status === "uploaded"), [screenshots]);
  const languages = editor.languages;
  const defaultDevices = editor.selectedDevicePresetIds;
  const [devicePresetIds, setDevicePresetIds] = React.useState<StorePresetId[]>(defaultDevices);
  const [includeFeatureGraphic, setIncludeFeatureGraphic] = React.useState(editor.includeFeatureGraphic);
  const [selectionMatrix, setSelectionMatrix] = React.useState<ExportMatrixSelection>(() =>
    createExportMatrix({
      devicePresetIds: defaultDevices,
      screenIds: uploaded.map((shot) => shot.id),
      languages,
    })
  );
  const [folderMode, setFolderMode] = React.useState<"flat" | "locale" | "device">("locale");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setSelectionMatrix(
      createExportMatrix({
        devicePresetIds,
        screenIds: uploaded.map((shot) => shot.id),
        languages,
      })
    );
  }, [devicePresetIds, uploaded, languages]);

  const summary = summarizeExportMatrix(selectionMatrix);
  const plan = getExportPlan({
    screenCount: uploaded.length,
    languages,
    devicePresetIds,
    includeFeatureGraphic,
  });
  const totalImages = summary.total + (includeFeatureGraphic ? languages.length : 0);
  const enough = balance >= totalImages;

  async function startExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languages,
          devicePresetIds,
          includeFeatureGraphic,
          selectionMatrix,
        }),
      });
      if (res.status === 402) {
        router.push("/credits");
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { jobId: string };
      await refresh();
      router.push(`/projects/${project.id}?job=${data.jobId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-slot="export-matrix" className="export-matrix-page">
      <header className="export-matrix-header">
        <div>
          <p className="eyebrow">Export matrix</p>
          <h1>Choose exactly what gets rendered.</h1>
          <p>Manual editing stays unlimited. Credits are only used for the final PNGs you turn on here.</p>
        </div>
        <div className="header-actions">
          <Link href={`/editor/${project.id}`} className="btn btn-ghost">Back to editor</Link>
          <button className="btn btn-primary" disabled={!enough || loading || totalImages === 0} onClick={startExport}>
            {loading ? "Starting…" : `Export ${totalImages} PNG${totalImages === 1 ? "" : "s"}`}
          </button>
        </div>
      </header>

      <section className="matrix-summary">
        <SummaryCard dark title="Total renders" value={String(totalImages)} meta={`${summary.total} matrix cells${includeFeatureGraphic ? ` + ${languages.length} feature graphics` : ""}`} />
        <SummaryCard title="Locales" value={String(languages.length)} meta={languages.map((locale) => locale.toUpperCase()).join(" · ")} />
        <SummaryCard title="Devices" value={String(devicePresetIds.length)} meta={devicePresetIds.map((id) => STORE_PRESETS[id].label).join(" · ")} />
        <SummaryCard title="Credits" value={String(totalImages)} meta={enough ? `${balance - totalImages} left after export` : `${balance} available`} />
      </section>

      <section className="device-picker">
        <div className="section-title">Devices</div>
        <div className="device-grid">
          {(Object.keys(STORE_PRESETS) as StorePresetId[]).map((deviceId) => {
            const enabled = devicePresetIds.includes(deviceId);
            return (
              <button
                key={deviceId}
                className={`device-card ${enabled ? "on" : ""}`}
                onClick={() => {
                  const next = enabled ? devicePresetIds.filter((id) => id !== deviceId) : [...devicePresetIds, deviceId];
                  setDevicePresetIds(next.length ? next : [editor.canvasPresetId]);
                }}
              >
                <strong>{STORE_PRESETS[deviceId].label}</strong>
                <span>{STORE_PRESETS[deviceId].kind}</span>
              </button>
            );
          })}
          <label className={`device-card fg-card ${includeFeatureGraphic ? "on" : ""}`}>
            <input
              type="checkbox"
              checked={includeFeatureGraphic}
              onChange={(event) => setIncludeFeatureGraphic(event.target.checked)}
            />
            <strong>Google Play Feature Graphic</strong>
            <span>{FEATURE_GRAPHIC_WIDTH}×{FEATURE_GRAPHIC_HEIGHT}</span>
          </label>
        </div>
      </section>

      <div className="matrix-layout">
        <div className="matrix-main">
          {devicePresetIds.map((deviceId) => (
            <section key={deviceId} className="device-matrix-card">
              <div className="device-matrix-head">
                <div>
                  <h2>{STORE_PRESETS[deviceId].label}</h2>
                  <p>{summary.perDevice[deviceId] ?? 0} outputs selected</p>
                </div>
                <div className="matrix-head-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectionMatrix((prev) => setAllForDevice(prev, { deviceId, value: "on" }))}>Select all</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectionMatrix((prev) => setAllForDevice(prev, { deviceId, value: "off" }))}>Clear</button>
                </div>
              </div>
              <div className="matrix-table">
                <div className="matrix-row matrix-header-row">
                  <div className="matrix-screen-head">Screen</div>
                  {languages.map((locale) => (
                    <div key={locale} className="matrix-locale-head">{locale.toUpperCase()}</div>
                  ))}
                  <div className="matrix-total-head">Total</div>
                </div>
                {uploaded.map((shot, index) => {
                  const localized = (shot.localized ?? {}) as Record<string, { title?: string }>;
                  const rowTotal = languages.filter((locale) => {
                    const state = selectionMatrix[deviceId]?.[shot.id]?.[locale];
                    return state === "on" || state === "locked";
                  }).length;
                  return (
                    <div key={shot.id} className="matrix-row">
                      <div className="matrix-screen">
                        <div className="matrix-thumb" />
                        <div>
                          <strong>Screen {index + 1}</strong>
                          <span>{localized.en?.title || "Untitled screen"}</span>
                        </div>
                      </div>
                      {languages.map((locale) => {
                        const state = selectionMatrix[deviceId]?.[shot.id]?.[locale] ?? "off";
                        return (
                          <button
                            key={locale}
                            className={`matrix-cell ${state}`}
                            disabled={state === "locked"}
                            onClick={() =>
                              setSelectionMatrix((prev) =>
                                toggleExportCell(prev, { deviceId, screenId: shot.id, locale })
                              )
                            }
                          >
                            {state}
                          </button>
                        );
                      })}
                      <div className="matrix-total">{rowTotal}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {includeFeatureGraphic && (
            <section className="feature-graphic-card">
              <div className="device-matrix-head">
                <div>
                  <h2>Google Play Feature Graphic</h2>
                  <p>One export per locale</p>
                </div>
              </div>
              <div className="feature-graphic-grid">
                {languages.map((locale) => (
                  <div key={locale} className="feature-graphic-preview">
                    <span>{locale.toUpperCase()}</span>
                    <div className="feature-graphic-canvas">
                      <div className="feature-graphic-copy">
                        {(((uploaded[0]?.localized ?? {}) as Record<string, { title?: string }>)[locale]?.title ??
                          ((uploaded[0]?.localized ?? {}) as Record<string, { title?: string }>).en?.title ??
                          "Feature graphic")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="matrix-sidebar">
          <section className="sidebar-card">
            <div className="section-title">ZIP & folders</div>
            <div className="folder-options">
              {(["flat", "locale", "device"] as const).map((mode) => (
                <label key={mode} className={`folder-pill ${folderMode === mode ? "on" : ""}`}>
                  <input type="radio" checked={folderMode === mode} onChange={() => setFolderMode(mode)} />
                  {mode}
                </label>
              ))}
            </div>
            <pre className="tree-preview">
{folderMode === "flat" && `shotwise-export/\n  01.png\n  02.png\n  ...`}
{folderMode === "locale" && `shotwise-export/\n  en/\n  tr/\n  de/`}
{folderMode === "device" && `shotwise-export/\n  iphone69/\n  android/\n  feature-graphic/`}
            </pre>
          </section>

          <section className="sidebar-card sidebar-card-dark">
            <div className="section-title">Render credits</div>
            <div className="credit-number">{totalImages}</div>
            <p>{enough ? `${balance} available · ${Math.max(balance - totalImages, 0)} left after export` : `Need ${totalImages}, have ${balance}`}</p>
          </section>

          <section className="sidebar-card">
            <div className="section-title">Heads-up</div>
            <ul className="warning-list">
              <li>English stays locked on as the base locale.</li>
              <li>Each final PNG uses 1 export credit.</li>
              <li>Feature graphic renders once per selected locale.</li>
            </ul>
          </section>
        </aside>
      </div>

      <div className="matrix-footer">
        <span>Ready to render <strong>{totalImages}</strong> images</span>
        <div className="spacer" />
        <Link href={`/editor/${project.id}`} className="btn btn-ghost">Back</Link>
        <button className="btn btn-primary" disabled={!enough || loading || totalImages === 0} onClick={startExport}>
          {loading ? "Starting…" : "Export ZIP"}
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  dark,
  title,
  value,
  meta,
}: {
  dark?: boolean;
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div className={`summary-card ${dark ? "dark" : ""}`}>
      <div className="section-title">{title}</div>
      <div className="summary-value">{value}</div>
      <p>{meta}</p>
    </div>
  );
}
