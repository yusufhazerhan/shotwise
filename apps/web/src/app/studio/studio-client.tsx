"use client";

import * as React from "react";
import { STORE_PRESETS, type StorePresetId } from "@/lib/editor-scene";
import { buildLocalSceneSvg, createLocalExportZip, getLocalExportName, renderLocalSceneToBlob } from "@/lib/local-export";
import {
  createLocalProject,
  deleteLocalProject,
  filesToLocalScreenshots,
  listLocalProjects,
  saveLocalProject,
  serializeLocalProject,
  type LocalDeviceConfig,
  type LocalProject,
} from "@/lib/local-studio-store";
import {
  applyStyleTheme,
  applyTemplate,
  filterTemplates,
  getTemplate,
  STYLE_THEMES,
  type TemplateCategory,
  type TemplateMood,
  type TemplatePlatform,
} from "@/lib/templates";
import { LOCALE_LABELS, LOCALES, type Locale, type SceneScreenshotSlot, type StoreScreenshotScene } from "@shotwise/types";

type SlotLayer = `slot:${string}`;
type PreviewMode = "grid" | "tabs";

export function LocalStudio() {
  const [projects, setProjects] = React.useState<LocalProject[]>([]);
  const [project, setProject] = React.useState<LocalProject | null>(null);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("primary");
  const [templateFilters, setTemplateFilters] = React.useState<{
    platform: TemplatePlatform | "all";
    mood: TemplateMood | "all";
    category: TemplateCategory | "all";
    slots: 1 | 2 | "all";
  }>({ platform: "all", mood: "all", category: "all", slots: "all" });
  const [previewLocale, setPreviewLocale] = React.useState<Locale>("en");
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>("grid");
  const [activePresetId, setActivePresetId] = React.useState<StorePresetId>("iphone69");
  const [status, setStatus] = React.useState("Ready");

  React.useEffect(() => {
    void refresh();
  }, []);

  async function refresh(nextProjectId?: string) {
    const items = await listLocalProjects();
    setProjects(items);
    if (nextProjectId) {
      setProject(items.find((item) => item.id === nextProjectId) ?? null);
    } else if (!project && items[0]) {
      setProject(items[0]);
    }
  }

  async function createProject(templateId = "classic-app-store") {
    const next = await saveLocalProject(createLocalProject("Local Screenshot Set", templateId));
    await refresh(next.id);
    setSelectedSlotId(next.scene.screenshots?.[0]?.id ?? "primary");
    setStatus("Created local project");
  }

  async function persist(next: LocalProject, message = "Saved locally") {
    const saved = await saveLocalProject(next);
    setProject(saved);
    const selectedDevices = saved.exportConfig.devicePresetIds.map(normalizePreset);
    if (!selectedDevices.includes(activePresetId)) setActivePresetId(selectedDevices[0] ?? "iphone69");
    setProjects((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setStatus(message);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const base = project ?? createLocalProject("Local Screenshot Set", "two-screens-one-story");
    const screenshots = await filesToLocalScreenshots(Array.from(files).slice(0, 10));
    const allScreenshots = [...base.screenshots, ...screenshots];
    const slots = ensureSlotSources(base.scene, allScreenshots.map((shot) => shot.id));
    await persist({ ...base, screenshots: allScreenshots, scene: { ...base.scene, screenshots: slots, screenshot: slots[0] ?? base.scene.screenshot } }, "Screenshots added");
  }

  async function applyTemplateToProject(templateId: string) {
    const base = project ?? createLocalProject("Local Screenshot Set", templateId);
    const template = getTemplate(templateId);
    const scene = applyTemplate(base.scene, templateId);
    const slots = ensureSlotSources(scene, base.screenshots.map((shot) => shot.id));
    await persist(
      {
        ...base,
        templateId,
        scene: { ...scene, screenshots: slots, screenshot: slots[0] ?? scene.screenshot },
        exportConfig: {
          ...template.exportDefaults,
          locales: base.exportConfig.locales ?? ["en"],
          styleThemeId: base.exportConfig.styleThemeId ?? "cream-calm",
          deviceConfigs: base.exportConfig.deviceConfigs ?? {},
        },
      },
      `Applied ${template.name}`
    );
    setSelectedSlotId(slots[0]?.id ?? "primary");
    setActivePresetId(normalizePreset(template.exportDefaults.devicePresetIds[0]));
  }

  async function updateScene(scene: StoreScreenshotScene, message = "Scene updated") {
    if (!project) return;
    await persist({ ...project, scene }, message);
  }

  async function updateText(locale: Locale, patch: Partial<{ title: string; subtitle: string; accent: string }>) {
    if (!project) return;
    await persist({ ...project, localized: { ...project.localized, [locale]: { ...(project.localized[locale] ?? project.localized.en ?? {}), ...patch } } }, "Text saved");
  }

  async function exportJson() {
    if (!project) return;
    downloadBlob(new Blob([serializeLocalProject(project)], { type: "application/json" }), `${slug(project.name)}.shotwise.json`);
    setStatus("Project JSON exported");
  }

  async function exportPng() {
    if (!project) return;
    setStatus("Rendering PNG...");
    const presetId = project.exportConfig.devicePresetIds.map(normalizePreset).includes(activePresetId) ? activePresetId : normalizePreset(project.exportConfig.devicePresetIds[0]);
    const blob = await renderLocalSceneToBlob({ project, scene: buildDeviceScene(project, presetId), presetId, locale: previewLocale });
    downloadBlob(blob, getLocalExportName(project, { screenIndex: 0, locale: previewLocale, deviceId: presetId, folderMode: "flat" }).split("/").pop()!);
    setStatus("PNG exported");
  }

  async function exportZip() {
    if (!project) return;
    setStatus("Rendering ZIP...");
    const files = [];
    for (const locale of getExportLocales(project)) {
      for (const deviceId of project.exportConfig.devicePresetIds) {
        const presetId = normalizePreset(deviceId);
        files.push({
          name: getLocalExportName(project, { screenIndex: 0, locale, deviceId: presetId }),
          blob: await renderLocalSceneToBlob({ project, scene: buildDeviceScene(project, presetId), presetId, locale }),
        });
      }
    }
    const zip = await createLocalExportZip(files);
    downloadBlob(zip, `${slug(project.name)}-${project.templateId}.zip`);
    setStatus("ZIP exported");
  }

  const templates = filterTemplates(templateFilters);
  const selectedTemplate = getTemplate(project?.templateId);

  return (
    <div className="studio-page" data-slot="local-studio">
      <header className="studio-topbar">
        <a href="/" className="studio-brand">
          <span className="studio-mark">S</span>
          <span>Shotwise Studio</span>
        </a>
        <nav className="studio-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => void exportJson()} disabled={!project}>
            Export JSON
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => void exportPng()} disabled={!project}>
            PNG
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => void exportZip()} disabled={!project}>
            ZIP
          </button>
        </nav>
      </header>

      <main className="studio-shell">
        <aside className="studio-sidebar">
          <section className="studio-panel">
            <div className="studio-panel-head">
              <h2>Local projects</h2>
              <button className="mini-button" onClick={() => void createProject("two-screens-one-story")}>
                New
              </button>
            </div>
            {projects.length ? (
              <div className="project-list">
                {projects.map((item) => (
                  <button
                    key={item.id}
                    className={`project-row ${project?.id === item.id ? "on" : ""}`}
                    onClick={() => {
                      setProject(item);
                      setSelectedSlotId(item.scene.screenshots?.[0]?.id ?? "primary");
                    }}
                  >
                    <strong>{item.name}</strong>
                    <span>{getTemplate(item.templateId).name} · {item.screenshots.length} files</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-copy">
                <p>Create a local project. No sign-in, no server upload, no seeded account.</p>
                <button className="btn btn-primary btn-sm" onClick={() => void createProject("two-screens-one-story")}>
                  Start from template
                </button>
              </div>
            )}
            {project && (
              <button
                className="danger-link"
                onClick={async () => {
                  await deleteLocalProject(project.id);
                  setProject(null);
                  await refresh();
                }}
              >
                Delete local project
              </button>
            )}
          </section>

          <section className="studio-panel">
            <div className="studio-panel-head">
              <h2>Templates</h2>
              <span>{templates.length}</span>
            </div>
            <TemplateFilters value={templateFilters} onChange={setTemplateFilters} />
            <div className="template-list">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`template-row ${project?.templateId === template.id ? "on" : ""}`}
                  onClick={() => void applyTemplateToProject(template.id)}
                >
                  <span className="template-thumb" data-slots={template.slots} data-art={template.scene.advanced?.customJson?.templateArt} />
                  <strong>{template.name}</strong>
                  <small>{template.description}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="studio-canvas-area">
          <div className="canvas-header">
            <div>
              <p className="eyebrow">Local-first editor</p>
              <h1>{project?.name ?? "Start with a template"}</h1>
            </div>
            <div className="canvas-meta">
              <span className="pill">{selectedTemplate.name}</span>
              <span className="pill">{status}</span>
            </div>
          </div>

          {project ? (
            <>
              <LocalCanvas
                project={project}
                previewLocale={previewLocale}
                previewMode={previewMode}
                activePresetId={activePresetId}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
                onPreviewMode={setPreviewMode}
                onActivePreset={setActivePresetId}
                onSceneChange={(scene) => void updateScene(scene)}
              />
              <div className="upload-strip">
                <label className="upload-card">
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => void handleFiles(event.target.files)} />
                  <strong>Drop or choose screenshots</strong>
                  <span>{project.screenshots.length ? `${project.screenshots.length} local files loaded` : "Images stay in this browser"}</span>
                </label>
                <div className="skill-card">
                  <strong>Vibe coding ready</strong>
                  <span>Use SKILL.md with your coding agent to prepare copy, locales, and export plans.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="studio-start">
              <h2>Choose a template to begin.</h2>
              <p>Shotwise can now run as a local screenshot design tool before you configure any server services.</p>
              <button className="btn btn-primary" onClick={() => void createProject("two-screens-one-story")}>
                Start local project
              </button>
            </div>
          )}
        </section>

        <aside className="studio-inspector">
          {project && (
            <Inspector
              project={project}
              previewLocale={previewLocale}
              activePresetId={activePresetId}
              onPreviewLocale={setPreviewLocale}
              onActivePreset={setActivePresetId}
              selectedSlotId={selectedSlotId}
              onText={updateText}
              onScene={updateScene}
              onPersist={(next) => void persist(next)}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

function LocalCanvas({
  project,
  previewLocale,
  previewMode,
  activePresetId,
  selectedSlotId,
  onSelectSlot,
  onPreviewMode,
  onActivePreset,
  onSceneChange,
}: {
  project: LocalProject;
  previewLocale: Locale;
  previewMode: PreviewMode;
  activePresetId: StorePresetId;
  selectedSlotId: string;
  onSelectSlot: (id: string) => void;
  onPreviewMode: (mode: PreviewMode) => void;
  onActivePreset: (presetId: StorePresetId) => void;
  onSceneChange: (scene: StoreScreenshotScene) => void;
}) {
  const devices = getSelectedDevices(project);
  const active = devices.includes(activePresetId) ? activePresetId : devices[0] ?? "iphone69";

  return (
    <div className="preview-stack">
      <div className="preview-toolbar">
        <div className="segmented">
          <button className={previewMode === "grid" ? "on" : ""} onClick={() => onPreviewMode("grid")}>Grid</button>
          <button className={previewMode === "tabs" ? "on" : ""} onClick={() => onPreviewMode("tabs")}>Tabs</button>
        </div>
        <span>{devices.length} device preview{devices.length === 1 ? "" : "s"}</span>
      </div>
      {previewMode === "tabs" ? (
        <>
          <div className="device-tabs">
            {devices.map((presetId) => (
              <button key={presetId} className={presetId === active ? "on" : ""} onClick={() => onActivePreset(presetId)}>
                {shortPresetLabel(presetId)}
              </button>
            ))}
          </div>
          <LocalCanvasBoard
            project={project}
            previewLocale={previewLocale}
            presetId={active}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            onSceneChange={onSceneChange}
          />
        </>
      ) : (
        <div className={`preview-grid count-${Math.min(devices.length, 4)}`}>
          {devices.map((presetId) => (
            <div key={presetId} className={`preview-tile ${presetId === active ? "on" : ""}`} onClick={() => onActivePreset(presetId)}>
              <div className="preview-tile-head">
                <strong>{shortPresetLabel(presetId)}</strong>
                <span>{STORE_PRESETS[presetId].width}×{STORE_PRESETS[presetId].height}</span>
              </div>
              <LocalCanvasBoard
                project={project}
                previewLocale={previewLocale}
                presetId={presetId}
                selectedSlotId={selectedSlotId}
                onSelectSlot={onSelectSlot}
                onSceneChange={onSceneChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocalCanvasBoard({
  project,
  previewLocale,
  presetId,
  selectedSlotId,
  onSelectSlot,
  onSceneChange,
}: {
  project: LocalProject;
  previewLocale: Locale;
  presetId: StorePresetId;
  selectedSlotId: string;
  onSelectSlot: (id: string) => void;
  onSceneChange: (scene: StoreScreenshotScene) => void;
}) {
  const [svg, setSvg] = React.useState<string>("");
  const [urls, setUrls] = React.useState<Record<string, string>>({});
  const boardRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ layer: SlotLayer; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const scene = React.useMemo(() => buildDeviceScene(project, presetId), [project, presetId]);
  const preset = STORE_PRESETS[presetId];
  const slots = scene.screenshots?.length ? scene.screenshots : [{ id: "primary", ...scene.screenshot }];

  React.useEffect(() => {
    const next: Record<string, string> = {};
    for (const shot of project.screenshots) next[shot.id] = URL.createObjectURL(shot.blob);
    setUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [project.screenshots]);

  React.useEffect(() => {
    void buildLocalSceneSvg({
      project,
      scene,
      canvas: { width: preset.width, height: preset.height },
      locale: previewLocale,
    }).then(setSvg);
  }, [previewLocale, project, preset.height, preset.width, presetId, scene]);

  function begin(slot: SceneScreenshotSlot, event: React.PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { layer: `slot:${slot.id}`, sx: event.clientX, sy: event.clientY, ox: slot.x, oy: slot.y };
    onSelectSlot(slot.id);
  }

  function move(event: React.PointerEvent) {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const rect = board.getBoundingClientRect();
    const dx = (event.clientX - drag.sx) / rect.width;
    const dy = (event.clientY - drag.sy) / rect.height;
    const slotId = drag.layer.slice(5);
    const nextSlots = slots.map((slot) =>
      slot.id === slotId ? { ...slot, x: clamp(drag.ox + dx, 0.12, 0.88), y: clamp(drag.oy + dy, 0.15, 0.9) } : slot
    );
    onSceneChange({ ...project.scene, screenshots: nextSlots, screenshot: nextSlots[0] ?? project.scene.screenshot });
  }

  return (
    <div className="local-canvas-wrap">
      <div
        ref={boardRef}
        className="local-canvas"
        style={{ aspectRatio: `${preset.width}/${preset.height}` }}
        onPointerMove={move}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        {svg && <div className="local-svg" dangerouslySetInnerHTML={{ __html: svg }} />}
        {slots.map((slot, index) => {
          const shot = project.screenshots.find((item) => item.id === slot.sourceId) ?? project.screenshots[index] ?? project.screenshots[0];
          const ratio = shot ? shot.width / shot.height : 9 / 19.5;
          const width = slot.width * slot.scale;
          const height = width / ratio * (preset.width / preset.height);
          return (
            <button
              key={slot.id}
              type="button"
              className={`slot-hit ${selectedSlotId === slot.id ? "on" : ""} ${shot ? "" : "empty"}`}
              style={{
                left: `${(slot.x - width / 2) * 100}%`,
                top: `${(slot.y - height / 2) * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
                transform: `rotate(${slot.rotation + scene.device.tilt}deg)`,
              }}
              onPointerDown={(event) => begin(slot, event)}
            >
              {shot && urls[shot.id] ? <img src={urls[shot.id]} alt="" /> : <span>Slot {index + 1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Inspector({
  project,
  previewLocale,
  activePresetId,
  onPreviewLocale,
  onActivePreset,
  selectedSlotId,
  onText,
  onScene,
  onPersist,
}: {
  project: LocalProject;
  previewLocale: Locale;
  activePresetId: StorePresetId;
  onPreviewLocale: (locale: Locale) => void;
  onActivePreset: (presetId: StorePresetId) => void;
  selectedSlotId: string;
  onText: (locale: Locale, patch: Partial<{ title: string; subtitle: string; accent: string }>) => Promise<void>;
  onScene: (scene: StoreScreenshotScene, message?: string) => Promise<void>;
  onPersist: (project: LocalProject) => void;
}) {
  const scene = project.scene;
  const slots = scene.screenshots?.length ? scene.screenshots : [{ id: "primary", ...scene.screenshot }];
  const slot = slots.find((item) => item.id === selectedSlotId) ?? slots[0];
  const exportLocales = getExportLocales(project);
  const localized = project.localized[previewLocale] ?? project.localized.en ?? {};
  const selectedDevices = getSelectedDevices(project);
  const activeDeviceConfig = project.exportConfig.deviceConfigs[activePresetId] ?? {};
  const activeDeviceScene = buildDeviceScene(project, activePresetId);
  const titleBlock = scene.textBlocks.find((block) => block.role === "title");
  const subtitleBlock = scene.textBlocks.find((block) => block.role === "subtitle");

  function updateSlot(patch: Partial<SceneScreenshotSlot>) {
    if (!slot) return;
    const nextSlots = slots.map((item) => (item.id === slot.id ? { ...item, ...patch } : item));
    void onScene({ ...scene, screenshots: nextSlots, screenshot: nextSlots[0] ?? scene.screenshot }, "Slot updated");
  }

  function updateTextBlock(role: StoreScreenshotScene["textBlocks"][number]["role"], patch: Partial<StoreScreenshotScene["textBlocks"][number]>) {
    void onScene({
      ...scene,
      textBlocks: scene.textBlocks.map((block) => (block.role === role ? { ...block, ...patch } : block)),
    }, "Typography updated");
  }

  function updateDeviceConfig(patch: LocalDeviceConfig) {
    onPersist({
      ...project,
      exportConfig: {
        ...project.exportConfig,
        deviceConfigs: {
          ...project.exportConfig.deviceConfigs,
          [activePresetId]: {
            ...(project.exportConfig.deviceConfigs[activePresetId] ?? {}),
            ...patch,
          },
        },
      },
    });
  }

  function toggleDevice(presetId: StorePresetId) {
    const current = new Set(selectedDevices);
    if (current.has(presetId)) current.delete(presetId);
    else current.add(presetId);
    const nextDevices = Array.from(current);
    const devicePresetIds = nextDevices.length ? nextDevices : [activePresetId];
    onPersist({ ...project, exportConfig: { ...project.exportConfig, devicePresetIds } });
    if (!devicePresetIds.includes(activePresetId)) onActivePreset(normalizePreset(devicePresetIds[0]));
    else onActivePreset(presetId);
  }

  function applyTheme(themeId: string) {
    onPersist({
      ...project,
      scene: applyStyleTheme(project.scene, themeId),
      exportConfig: {
        ...project.exportConfig,
        styleThemeId: themeId,
      },
    });
  }

  function swapSlots() {
    if (slots.length < 2) return;
    const [first, second, ...rest] = slots;
    if (!first || !second) return;
    const nextSlots = [
      { ...first, sourceId: second?.sourceId },
      { ...second, sourceId: first?.sourceId },
      ...rest,
    ] satisfies SceneScreenshotSlot[];
    void onScene({ ...scene, screenshots: nextSlots, screenshot: nextSlots[0] ?? scene.screenshot }, "Slots swapped");
  }

  function assignNextSource() {
    if (!slot || project.screenshots.length < 2) return;
    const currentIndex = Math.max(0, project.screenshots.findIndex((shot) => shot.id === slot.sourceId));
    const nextShot = project.screenshots[(currentIndex + 1) % project.screenshots.length];
    if (nextShot) updateSlot({ sourceId: nextShot.id });
  }

  return (
    <div className="inspector-panel">
      <h2>Inspector</h2>
      <label className="field-line">
        Project name
        <input className="input" value={project.name} onChange={(event) => onPersist({ ...project, name: event.target.value })} />
      </label>
      <label className="field-line">
        Export file name
        <input className="input" value={project.screenName ?? ""} onChange={(event) => onPersist({ ...project, screenName: event.target.value })} placeholder="home" />
      </label>
      <label className="field-line">
        Editing locale
        <select className="select" value={previewLocale} onChange={(event) => onPreviewLocale(event.target.value as Locale)}>
          {exportLocales.map((locale) => (
            <option key={locale} value={locale}>{locale.toUpperCase()} · {LOCALE_LABELS[locale]}</option>
          ))}
        </select>
      </label>
      <label className="field-line">
        Title
        <textarea className="textarea" rows={3} value={localized.title ?? ""} onChange={(event) => void onText(previewLocale, { title: event.target.value })} />
      </label>
      <label className="field-line">
        Subtitle
        <input className="input" value={localized.subtitle ?? ""} onChange={(event) => void onText(previewLocale, { subtitle: event.target.value })} />
      </label>
      <label className="field-line">
        Accent
        <input className="input" value={localized.accent ?? ""} onChange={(event) => void onText(previewLocale, { accent: event.target.value })} />
      </label>
      <div className="inspector-section">Typography</div>
      {titleBlock && (
        <>
          <Range
            label="Title letter spacing"
            value={titleBlock.letterSpacing ?? 0.04}
            min={0}
            max={0.16}
            step={0.002}
            format={(value) => `${Math.round(value * 1000) / 10}%`}
            onChange={(letterSpacing) => updateTextBlock("title", { letterSpacing })}
          />
          <Range
            label="Title word spacing"
            value={titleBlock.wordSpacing ?? 0.42}
            min={0.2}
            max={0.9}
            step={0.01}
            format={(value) => `${Math.round(value * 100)}%`}
            onChange={(wordSpacing) => updateTextBlock("title", { wordSpacing })}
          />
        </>
      )}
      {subtitleBlock && (
        <>
          <Range
            label="Subtitle letter spacing"
            value={subtitleBlock.letterSpacing ?? 0.006}
            min={0}
            max={0.08}
            step={0.001}
            format={(value) => `${Math.round(value * 1000) / 10}%`}
            onChange={(letterSpacing) => updateTextBlock("subtitle", { letterSpacing })}
          />
          <Range
            label="Subtitle word spacing"
            value={subtitleBlock.wordSpacing ?? 0.28}
            min={0.14}
            max={0.7}
            step={0.01}
            format={(value) => `${Math.round(value * 100)}%`}
            onChange={(wordSpacing) => updateTextBlock("subtitle", { wordSpacing })}
          />
        </>
      )}
      <div className="inspector-section">Color theme</div>
      <div className="theme-swatches">
        {STYLE_THEMES.map((theme) => (
          <button key={theme.id} className={project.exportConfig.styleThemeId === theme.id ? "on" : ""} onClick={() => applyTheme(theme.id)} title={theme.name}>
            <span>
              {theme.swatches.map((color) => <i key={color} style={{ background: color }} />)}
            </span>
            <b>{theme.name}</b>
          </button>
        ))}
      </div>
      {slot && (
        <>
          <div className="inspector-section">Selected slot: {slot.label ?? slot.id}</div>
          <label className="field-line">
            Screenshot source
            <select className="select" value={slot.sourceId ?? ""} onChange={(event) => updateSlot({ sourceId: event.target.value })}>
              <option value="">Auto</option>
              {project.screenshots.map((shot) => (
                <option key={shot.id} value={shot.id}>{shot.name}</option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <button className="mini-button" onClick={assignNextSource} disabled={project.screenshots.length < 2}>
              Next source
            </button>
            <button className="mini-button" onClick={swapSlots} disabled={slots.length < 2}>
              Swap pair
            </button>
          </div>
          <label className="field-line">
            Fit
            <select className="select" value={slot.fit} onChange={(event) => updateSlot({ fit: event.target.value as SceneScreenshotSlot["fit"] })}>
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
            </select>
          </label>
          <Range label="Width" value={slot.width} min={0.2} max={0.8} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onChange={(width) => updateSlot({ width })} />
          <Range label="Zoom" value={slot.scale} min={0.6} max={1.8} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onChange={(scale) => updateSlot({ scale })} />
          <Range label="Rotation" value={slot.rotation} min={-18} max={18} step={1} format={(value) => `${value}deg`} onChange={(rotation) => updateSlot({ rotation })} />
          <label className="field-line">
            Label
            <input className="input" value={slot.label ?? ""} onChange={(event) => updateSlot({ label: event.target.value })} />
          </label>
        </>
      )}
      <div className="inspector-section">Export devices</div>
      <div className="device-picker">
        {DEVICE_GROUPS.map((group) => (
          <div key={group.label} className="device-group">
            <h3>{group.label}</h3>
            <div className="device-card-grid">
              {group.presets.map((presetId) => {
                const enabled = selectedDevices.includes(presetId);
                const active = activePresetId === presetId;
                const preset = STORE_PRESETS[presetId];
                return (
                  <button key={presetId} className={`${enabled ? "on" : ""} ${active ? "active" : ""}`} onClick={() => toggleDevice(presetId)}>
                    <span className={`device-mini ${preset.kind}`} />
                    <strong>{shortPresetLabel(presetId)}</strong>
                    <small>{preset.width}×{preset.height}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="inspector-section">Active device tuning: {shortPresetLabel(activePresetId)}</div>
      <label className="field-line">
        Frame style
        <select className="select" value={activeDeviceScene.device.frameStyle} onChange={(event) => updateDeviceConfig({ frameStyle: event.target.value as StoreScreenshotScene["device"]["frameStyle"] })}>
          <option value="bezel">Bezel</option>
          <option value="glass">Glass</option>
          <option value="minimal">Minimal</option>
          <option value="none">None</option>
        </select>
      </label>
      <label className="check-line">
        <input type="checkbox" checked={activeDeviceScene.device.hideStatusBar} onChange={(event) => updateDeviceConfig({ hideStatusBar: event.target.checked })} />
        Hide status bar for this device
      </label>
      <Range label="Device slot scale" value={activeDeviceConfig.slotScale ?? 1} min={0.72} max={1.24} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onChange={(slotScale) => updateDeviceConfig({ slotScale })} />
      <Range label="Text scale" value={activeDeviceConfig.textScale ?? 1} min={0.82} max={1.18} step={0.01} format={(value) => `${Math.round(value * 100)}%`} onChange={(textScale) => updateDeviceConfig({ textScale })} />
      <div className="inspector-section">Export locales</div>
      <div className="locale-checks">
        {LOCALES.map((locale) => {
          const enabled = exportLocales.includes(locale);
          return (
            <label key={locale} className={enabled ? "on" : ""}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => {
                  const next = new Set(exportLocales);
                  if (event.target.checked) next.add(locale);
                  else if (locale !== "en") next.delete(locale);
                  const locales = Array.from(next) as Locale[];
                  onPersist({ ...project, exportConfig: { ...project.exportConfig, locales: locales.length ? locales : ["en"] } });
                  if (!locales.includes(previewLocale)) onPreviewLocale("en");
                }}
                disabled={locale === "en"}
              />
              <span>{locale.toUpperCase()}</span>
              <small>{LOCALE_LABELS[locale]}</small>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TemplateFilters({
  value,
  onChange,
}: {
  value: { platform: TemplatePlatform | "all"; mood: TemplateMood | "all"; category: TemplateCategory | "all"; slots: 1 | 2 | "all" };
  onChange: (value: { platform: TemplatePlatform | "all"; mood: TemplateMood | "all"; category: TemplateCategory | "all"; slots: 1 | 2 | "all" }) => void;
}) {
  return (
    <div className="template-filters">
      <select className="select" value={value.platform} onChange={(event) => onChange({ ...value, platform: event.target.value as TemplatePlatform | "all" })}>
        {["all", "ios", "android", "ipad", "universal"].map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select className="select" value={value.mood} onChange={(event) => onChange({ ...value, mood: event.target.value as TemplateMood | "all" })}>
        {["all", "minimal", "bold", "premium", "playful", "dark", "fresh", "glass", "warm", "editorial"].map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select className="select" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value as TemplateCategory | "all" })}>
        {["all", "aso", "onboarding", "paywall", "comparison", "feature", "social"].map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select className="select" value={value.slots} onChange={(event) => onChange({ ...value, slots: event.target.value === "all" ? "all" : Number(event.target.value) as 1 | 2 })}>
        <option value="all">all slots</option>
        <option value="1">1 slot</option>
        <option value="2">2 slots</option>
      </select>
    </div>
  );
}

const DEVICE_GROUPS: Array<{ label: string; presets: StorePresetId[] }> = [
  { label: "iPhone", presets: ["iphone69", "iphone67", "iphone65", "iphone61", "iphone55"] },
  { label: "iPad", presets: ["ipad13", "ipadPro129", "ipad11"] },
  { label: "Android phones", presets: ["android", "pixel9", "galaxy", "galaxyS24", "oneplus", "playPhone"] },
  { label: "Android tablets", presets: ["pixelFold", "playTablet"] },
];

function getSelectedDevices(project: LocalProject): StorePresetId[] {
  const valid = project.exportConfig.devicePresetIds.map(normalizePreset);
  return valid.length ? Array.from(new Set(valid)) : ["iphone69"];
}

function buildDeviceScene(project: LocalProject, presetId: StorePresetId): StoreScreenshotScene {
  const preset = STORE_PRESETS[presetId];
  const config = project.exportConfig.deviceConfigs[presetId] ?? {};
  const themed = applyStyleTheme(project.scene, project.exportConfig.styleThemeId || "cream-calm");
  const kind = preset.kind as StoreScreenshotScene["device"]["kind"];
  const slotScale = config.slotScale ?? (kind === "ipad" ? 1.08 : 1);
  const textScale = config.textScale ?? (kind === "ipad" ? 0.92 : 1);

  return {
    ...themed,
    canvasPresetId: presetId,
    device: {
      ...themed.device,
      kind,
      padding: kind === "ipad" ? 34 : 26,
      radius: kind === "android" ? 42 : kind === "ipad" ? 54 : 64,
      frameStyle: config.frameStyle ?? themed.device.frameStyle,
      hideStatusBar: config.hideStatusBar ?? themed.device.hideStatusBar,
    },
    screenshot: {
      ...themed.screenshot,
      width: clamp(themed.screenshot.width * slotScale, 0.16, 0.86),
    },
    screenshots: (themed.screenshots?.length ? themed.screenshots : [{ id: "primary", ...themed.screenshot }]).map((slot) => ({
      ...slot,
      width: clamp(slot.width * slotScale, 0.16, 0.86),
    })),
    textBlocks: themed.textBlocks.map((block) => ({
      ...block,
      fontSize: typeof block.fontSize === "number" ? block.fontSize * textScale : block.fontSize,
    })),
  };
}

function shortPresetLabel(presetId: StorePresetId) {
  const label = STORE_PRESETS[presetId].label.split(" · ")[0] ?? presetId;
  return label.replace("Samsung ", "").replace("Google Play ", "Play ");
}

function Range({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format: (value: number) => string; onChange: (value: number) => void }) {
  return (
    <label className="range-line">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <b>{format(value)}</b>
    </label>
  );
}

function ensureSlotSources(scene: StoreScreenshotScene, sourceIds: string[]): SceneScreenshotSlot[] {
  const slots = scene.screenshots?.length ? scene.screenshots : [{ id: "primary", ...scene.screenshot }];
  return slots.map((slot, index) => ({
    ...slot,
    sourceId: slot.sourceId ?? sourceIds[index] ?? sourceIds[0],
  }));
}

function normalizePreset(id: string | undefined): StorePresetId {
  return id && id in STORE_PRESETS ? (id as StorePresetId) : "iphone69";
}

function getExportLocales(project: LocalProject): Locale[] {
  const configured = project.exportConfig.locales?.length ? project.exportConfig.locales : ["en"];
  const valid = configured.filter((locale): locale is Locale => (LOCALES as readonly string[]).includes(locale));
  return valid.includes("en") ? valid : ["en", ...valid];
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shotwise";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
