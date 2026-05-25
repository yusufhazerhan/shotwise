"use client";
import * as React from "react";
import Link from "next/link";
import { LOCALES, type Locale, type StoreScreenshotScene } from "@shotwise/types";
import type { Project, Screenshot } from "@shotwise/db";
import { FONT_OPTIONS, getEditorConfig, getPreset, STORE_PRESETS } from "@/lib/editor-scene";
import { applyStylePreset, STYLE_PRESETS, type StylePresetId } from "@/lib/style-presets";
import { applyTemplate, TEMPLATE_REGISTRY } from "@/lib/templates";

type Tab = "screen" | "text" | "device" | "background" | "callouts" | "layout" | "export" | "advanced";

export function SettingsPanel({
  project,
  screenshot,
  scene,
  activeLayer,
  previewLocale,
  availableLocales,
  onPreviewLocale,
  saveStatus,
  onSceneChange,
  onTextChange,
  onProjectConfig,
}: {
  project: Project;
  screenshot: Screenshot;
  scene: StoreScreenshotScene;
  activeLayer: string;
  previewLocale: Locale;
  availableLocales: Locale[];
  onPreviewLocale: (locale: Locale) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSceneChange: (scene: StoreScreenshotScene) => void;
  onTextChange: (locale: Locale, next: { title?: string; accent?: string; subtitle?: string }) => void;
  onProjectConfig: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [tab, setTab] = React.useState<Tab>("screen");
  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string; subtitle?: string }>;
  const text = localized[previewLocale] ?? localized.en ?? {};
  const titleBlock = scene.textBlocks.find((block) => block.id === "title") ?? scene.textBlocks[0]!;
  const subtitleBlock = scene.textBlocks.find((block) => block.id === "subtitle");
  const editor = getEditorConfig(project);
  const selectedCallout = activeLayer.startsWith("callout:")
    ? scene.callouts.find((callout) => callout.id === activeLayer.slice(8))
    : scene.callouts[0];

  function updateScene(patch: Partial<StoreScreenshotScene>) {
    onSceneChange({ ...scene, ...patch });
  }

  function updateTitleBlock(patch: Partial<typeof titleBlock>) {
    onSceneChange({
      ...scene,
      textBlocks: scene.textBlocks.map((block) => (block.id === titleBlock.id ? { ...block, ...patch } : block)),
    });
  }

  function updateSubtitleBlock(patch: Partial<NonNullable<typeof subtitleBlock>>) {
    if (!subtitleBlock) return;
    onSceneChange({
      ...scene,
      textBlocks: scene.textBlocks.map((block) => (block.id === subtitleBlock.id ? { ...block, ...patch } : block)),
    });
  }

  function updateEditorConfig(patch: Record<string, unknown>) {
    const config = (project.config ?? {}) as Record<string, unknown>;
    void onProjectConfig({ config: { ...config, editor: { ...editor, ...patch } } });
  }

  function updateLinearBackground(patch: Partial<Extract<StoreScreenshotScene["background"], { type: "linear" }>>) {
    const current =
      scene.background.type === "linear"
        ? scene.background
        : { type: "linear" as const, from: "#F4EFE5", to: "#DF7958", angle: 135 };
    updateScene({ background: { ...current, ...patch } });
  }

  return (
    <div data-slot="settings-panel" className="tool-panel">
      <div className="tool-tabs">
        {(["screen", "text", "device", "background", "callouts", "layout", "export", "advanced"] as Tab[]).map((item) => (
          <button key={item} className={tab === item ? "on" : ""} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="save-state" data-state={saveStatus}>
        {saveStatus === "saving" ? "Saving changes..." : saveStatus === "error" ? "Save failed" : "Saved locally"}
      </div>

      {tab === "screen" && (
        <Panel title="Screen">
          <Field label="Preview locale">
            <div className="lang-grid">
              {availableLocales.map((locale) => (
                <button key={locale} className={`lang-item ${previewLocale === locale ? "on" : ""}`} type="button" onClick={() => onPreviewLocale(locale)}>
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Output preset">
            <select
              className="select"
              value={scene.canvasPresetId}
              onChange={(event) => {
                const preset = event.target.value;
                updateScene({ canvasPresetId: preset, device: { ...scene.device, kind: getPreset(preset).kind as StoreScreenshotScene["device"]["kind"] } });
                updateEditorConfig({ canvasPresetId: preset });
              }}
            >
              {Object.entries(STORE_PRESETS).map(([id, preset]) => (
                <option key={id} value={id}>{preset.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Screenshot width">
            <Range value={scene.screenshot.width} min={0.22} max={0.9} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(width) => updateScene({ screenshot: { ...scene.screenshot, width } })} />
          </Field>
          <Field label="Zoom">
            <Range value={scene.screenshot.scale} min={0.55} max={1.8} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(scale) => updateScene({ screenshot: { ...scene.screenshot, scale } })} />
          </Field>
          <Field label="Position">
            <div className="xy-grid">
              <input className="input" type="number" value={Math.round(scene.screenshot.x * 100)} onChange={(e) => updateScene({ screenshot: { ...scene.screenshot, x: Number(e.target.value) / 100 } })} />
              <input className="input" type="number" value={Math.round(scene.screenshot.y * 100)} onChange={(e) => updateScene({ screenshot: { ...scene.screenshot, y: Number(e.target.value) / 100 } })} />
            </div>
          </Field>
          <Field label="Rotation">
            <Range value={scene.screenshot.rotation} min={-20} max={20} step={1} format={(v) => `${v}deg`} onChange={(rotation) => updateScene({ screenshot: { ...scene.screenshot, rotation } })} />
          </Field>
        </Panel>
      )}

      {tab === "text" && (
        <Panel title="Text">
          <Field label="Caption">
            <textarea className="textarea" rows={3} value={text.title ?? titleBlock.text} onChange={(e) => onTextChange(previewLocale, { title: e.target.value, accent: text.accent, subtitle: text.subtitle })} />
          </Field>
          <Field label="Accent phrase">
            <input className="input" value={text.accent ?? titleBlock.accent ?? ""} onChange={(e) => onTextChange(previewLocale, { title: text.title ?? titleBlock.text, accent: e.target.value, subtitle: text.subtitle })} />
          </Field>
          <Field label="Subtitle">
            <input className="input" value={text.subtitle ?? subtitleBlock?.text ?? ""} onChange={(e) => onTextChange(previewLocale, { title: text.title ?? titleBlock.text, accent: text.accent, subtitle: e.target.value })} />
          </Field>
          <Field label="Font">
            <select className="select" value={titleBlock.fontFamily} onChange={(e) => updateTitleBlock({ fontFamily: e.target.value })}>
              {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font.split(",")[0]}</option>)}
            </select>
          </Field>
          <Field label="Size">
            <Range value={titleBlock.fontSize} min={0.024} max={0.075} step={0.001} format={(v) => `${Math.round(v * 1000)}`} onChange={(fontSize) => updateTitleBlock({ fontSize })} />
          </Field>
          <Field label="Weight">
            <Range value={titleBlock.fontWeight} min={400} max={900} step={100} format={(v) => String(v)} onChange={(fontWeight) => updateTitleBlock({ fontWeight })} />
          </Field>
          <ColorPair
            aLabel="Text"
            bLabel="Accent"
            a={titleBlock.color}
            b={titleBlock.accentColor}
            onA={(color) => updateTitleBlock({ color })}
            onB={(accentColor) => updateTitleBlock({ accentColor })}
          />
          <Field label="Subtitle style">
            <Range value={subtitleBlock?.fontSize ?? 0.018} min={0.012} max={0.04} step={0.001} format={(v) => `${Math.round(v * 1000)}`} onChange={(fontSize) => updateSubtitleBlock({ fontSize })} />
          </Field>
        </Panel>
      )}

      {tab === "device" && (
        <Panel title="Device">
          <Toggle label="Show device frame" checked={scene.device.enabled} onChange={(enabled) => updateScene({ device: { ...scene.device, enabled } })} />
          <Field label="Device kind">
            <select className="select" value={scene.device.kind} onChange={(e) => updateScene({ device: { ...scene.device, kind: e.target.value as StoreScreenshotScene["device"]["kind"] } })}>
              <option value="iphone">iPhone</option>
              <option value="ipad">iPad</option>
              <option value="android">Android</option>
            </select>
          </Field>
          <Field label="Frame style">
            <select className="select" value={scene.device.frameStyle} onChange={(e) => updateScene({ device: { ...scene.device, frameStyle: e.target.value as StoreScreenshotScene["device"]["frameStyle"] } })}>
              <option value="bezel">Bezel</option>
              <option value="minimal">Minimal</option>
              <option value="glass">Glass</option>
              <option value="none">None</option>
            </select>
          </Field>
          <Field label="Padding">
            <Range value={scene.device.padding} min={0} max={80} step={2} format={(v) => `${v}px`} onChange={(padding) => updateScene({ device: { ...scene.device, padding } })} />
          </Field>
          <Field label="Corner radius">
            <Range value={scene.device.radius} min={0} max={110} step={2} format={(v) => `${v}px`} onChange={(radius) => updateScene({ device: { ...scene.device, radius } })} />
          </Field>
          <Field label="Perspective tilt">
            <Range value={scene.device.tilt} min={-18} max={18} step={1} format={(v) => `${v}deg`} onChange={(tilt) => updateScene({ device: { ...scene.device, tilt } })} />
          </Field>
          <Toggle label="Hide status bar" checked={scene.device.hideStatusBar} onChange={(hideStatusBar) => updateScene({ device: { ...scene.device, hideStatusBar } })} />
        </Panel>
      )}

      {tab === "background" && (
        <Panel title="Background">
          <div style={{ marginBottom: 10 }}>
            <Link className="tool-action" href={`/styles/${project.id}`}>
              Open full style gallery
            </Link>
          </div>
          <Field label="Style preset">
            <div className="style-list">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`style-card ${editor.stylePresetId === preset.id ? "on" : ""}`}
                  type="button"
                  onClick={() => {
                    onSceneChange(applyStylePreset(scene, preset.id));
                    updateEditorConfig({ stylePresetId: preset.id, themeId: preset.id === "dark-premium" ? "dark" : editor.themeId });
                  }}
                >
                  <strong>{preset.name}</strong>
                  <span>{preset.description}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Style">
            <select
              className="select"
              value={scene.background.type}
              onChange={(e) => updateScene({ background: e.target.value === "solid" ? { type: "solid", color: "#F4EFE5" } : { type: "linear", from: "#F4EFE5", to: "#DF7958", angle: 135 } })}
            >
              <option value="solid">Solid</option>
              <option value="linear">Gradient</option>
            </select>
          </Field>
          {scene.background.type === "solid" ? (
            <Field label="Color">
              <input className="input" type="color" value={scene.background.color} onChange={(e) => updateScene({ background: { type: "solid", color: e.target.value } })} />
            </Field>
          ) : (
            <>
              <ColorPair
                aLabel="Color 1"
                bLabel="Color 2"
                a={scene.background.from}
                b={scene.background.to}
                onA={(from) => updateLinearBackground({ from })}
                onB={(to) => updateLinearBackground({ to })}
              />
              <Field label="Angle">
                <Range value={scene.background.angle} min={0} max={360} step={5} format={(v) => `${v}deg`} onChange={(angle) => updateLinearBackground({ angle })} />
              </Field>
            </>
          )}
        </Panel>
      )}

      {tab === "callouts" && (
        <Panel title="Callouts">
          <button
            className="tool-action"
            onClick={() => updateScene({ callouts: [...scene.callouts, { id: `callout-${Date.now()}`, x: 0.18, y: 0.42, width: 0.32, height: 0.12, label: "Callout", color: "#DF7958" }] })}
          >
            Add callout
          </button>
          {selectedCallout ? (
            <>
              <Field label="Label">
                <input className="input" value={selectedCallout.label} onChange={(e) => updateScene({ callouts: scene.callouts.map((c) => c.id === selectedCallout.id ? { ...c, label: e.target.value } : c) })} />
              </Field>
              <Field label="Color">
                <input className="input" type="color" value={selectedCallout.color} onChange={(e) => updateScene({ callouts: scene.callouts.map((c) => c.id === selectedCallout.id ? { ...c, color: e.target.value } : c) })} />
              </Field>
              <button className="tool-action danger" onClick={() => updateScene({ callouts: scene.callouts.filter((c) => c.id !== selectedCallout.id) })}>Remove selected</button>
            </>
          ) : <p className="tool-help">Add a callout, then drag it on the canvas.</p>}
        </Panel>
      )}

      {tab === "layout" && (
        <Panel title="Layout">
          <Field label="Template">
            <select
              className="select"
              value={editor.templateId}
              onChange={(event) => {
                const templateId = event.target.value;
                onSceneChange(applyTemplate(scene, templateId));
                updateEditorConfig({ templateId });
              }}
            >
              {TEMPLATE_REGISTRY.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Preset">
            <select className="select" value={scene.layoutPreset} onChange={(e) => updateScene({ layoutPreset: e.target.value as StoreScreenshotScene["layoutPreset"] })}>
              <option value="single">Single device</option>
              <option value="card">Card focus</option>
              <option value="sideBySide">Side by side</option>
              <option value="stacked">Stacked</option>
              <option value="beforeAfter">Before / after</option>
              <option value="callout">Callout zoom</option>
            </select>
          </Field>
          <button className="tool-action" onClick={() => updateScene(applyLayout(scene, "single"))}>Apply single</button>
          <button className="tool-action" onClick={() => updateScene(applyLayout(scene, "card"))}>Apply card</button>
          <button className="tool-action" onClick={() => updateScene(applyLayout(scene, "callout"))}>Apply callout</button>
        </Panel>
      )}

      {tab === "export" && (
        <Panel title="Export">
          <Field label="Languages">
            <div className="lang-grid">
              {LOCALES.map((locale) => {
                const enabled = editor.languages.includes(locale);
                return (
                  <label key={locale} className={`lang-item ${enabled ? "on" : ""}`}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        const next = new Set(editor.languages);
                        if (e.target.checked) next.add(locale); else next.delete(locale);
                        if (next.size === 0) next.add("en");
                        updateEditorConfig({ languages: Array.from(next) });
                      }}
                    />
                    {locale.toUpperCase()}
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Device outputs">
            <div className="device-list">
              {(Object.keys(STORE_PRESETS) as Array<keyof typeof STORE_PRESETS>).map((presetId) => {
                const enabled = editor.selectedDevicePresetIds.includes(presetId);
                return (
                  <label key={presetId} className={`device-preset ${enabled ? "on" : ""}`}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        const next = new Set(editor.selectedDevicePresetIds);
                        if (e.target.checked) next.add(presetId);
                        else next.delete(presetId);
                        if (next.size === 0) next.add(scene.canvasPresetId as keyof typeof STORE_PRESETS);
                        updateEditorConfig({ selectedDevicePresetIds: Array.from(next) });
                      }}
                    />
                    <span>{STORE_PRESETS[presetId].label}</span>
                  </label>
                );
              })}
            </div>
          </Field>
          <Toggle
            label="Include Google Play feature graphic"
            checked={editor.includeFeatureGraphic}
            onChange={(includeFeatureGraphic) => updateEditorConfig({ includeFeatureGraphic })}
          />
          <p className="tool-help">Export creates one PNG per screen and selected language. Each final PNG uses 1 export credit.</p>
        </Panel>
      )}

      {tab === "advanced" && (
        <Panel title="Advanced">
          <Field label="Scene JSON">
            <textarea
              className="textarea code"
              rows={12}
              value={JSON.stringify(scene, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value) as StoreScreenshotScene;
                  if (parsed.version === 1) onSceneChange(parsed);
                } catch {
                  // Keep editing until valid JSON.
                }
              }}
            />
          </Field>
          <Field label="Safe CSS notes">
            <textarea
              className="textarea code"
              rows={5}
              placeholder="Optional design notes or CSS tokens for this screen"
              value={scene.advanced?.customCss ?? ""}
              onChange={(e) => updateScene({ advanced: { ...(scene.advanced ?? {}), customCss: e.target.value } })}
            />
          </Field>
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="settings"><div className="group"><h6>{title}</h6>{children}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><label className="label">{label}</label>{children}</div>;
}

function Range({ value, min, max, step, format, onChange }: { value: number; min: number; max: number; step: number; format: (value: number) => string; onChange: (value: number) => void }) {
  return <div className="slider"><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /><span className="val">{format(value)}</span></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>;
}

function ColorPair({ aLabel, bLabel, a, b, onA, onB }: { aLabel: string; bLabel: string; a: string; b: string; onA: (value: string) => void; onB: (value: string) => void }) {
  return <div className="color-pair"><Field label={aLabel}><input className="input" type="color" value={a} onChange={(e) => onA(e.target.value)} /></Field><Field label={bLabel}><input className="input" type="color" value={b} onChange={(e) => onB(e.target.value)} /></Field></div>;
}

function applyLayout(scene: StoreScreenshotScene, layout: StoreScreenshotScene["layoutPreset"]): StoreScreenshotScene {
  if (layout === "card") {
    return { ...scene, layoutPreset: layout, screenshot: { ...scene.screenshot, x: 0.5, y: 0.51, width: 0.5 }, device: { ...scene.device, shadow: "strong" } };
  }
  if (layout === "callout") {
    return {
      ...scene,
      layoutPreset: layout,
      screenshot: { ...scene.screenshot, x: 0.5, y: 0.5, width: 0.48 },
      callouts: scene.callouts.length ? scene.callouts : [{ id: `callout-${Date.now()}`, x: 0.58, y: 0.42, width: 0.24, height: 0.12, label: "Focus here", color: "#DF7958" }],
    };
  }
  return { ...scene, layoutPreset: layout, screenshot: { ...scene.screenshot, x: 0.5, y: 0.46, width: 0.54 }, callouts: layout === "single" ? [] : scene.callouts };
}
