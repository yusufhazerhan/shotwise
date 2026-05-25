"use client";
import * as React from "react";
import type { Locale, StoreScreenshotScene } from "@shotwise/types";
import type { Project, Screenshot } from "@shotwise/db";
import { getPreset } from "@/lib/editor-scene";

type ActiveLayer = "screenshot" | `text:${string}` | `callout:${string}`;

export function ScenePreview({
  screenshot,
  project,
  scene,
  activeLayer,
  previewLocale,
  availableLocales,
  onPreviewLocale,
  onActiveLayer,
  onSceneChange,
}: {
  screenshot: Screenshot;
  project: Project;
  scene: StoreScreenshotScene;
  activeLayer: ActiveLayer;
  previewLocale: Locale;
  availableLocales: Locale[];
  onPreviewLocale: (locale: Locale) => void;
  onActiveLayer: (layer: ActiveLayer) => void;
  onSceneChange: (scene: StoreScreenshotScene) => void;
}) {
  const [imageHref, setImageHref] = React.useState<string | null>(null);
  const [imageRatio, setImageRatio] = React.useState(9 / 19.5);
  const preset = getPreset(scene.canvasPresetId);
  const localized = (screenshot.localized ?? {}) as Record<string, { title?: string; accent?: string; subtitle?: string }>;
  const previewText = localized[previewLocale] ?? localized.en ?? {};
  const boardRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ layer: ActiveLayer; sx: number; sy: number; ox: number; oy: number } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!screenshot.rawKey) {
        setImageHref(null);
        return;
      }
      const response = await fetch(`/api/preview-asset?screenshotId=${screenshot.id}`);
      if (!response.ok) {
        setImageHref(null);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setImageRatio(img.naturalWidth / img.naturalHeight);
        setImageHref(url);
      };
      img.src = url;
      setImageHref(url);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [screenshot.id, screenshot.rawKey]);

  const shotWidth = scene.screenshot.width * scene.screenshot.scale;
  const shotHeight = shotWidth / imageRatio * (preset.width / preset.height);
  const shotLeft = scene.screenshot.x - shotWidth / 2;
  const shotTop = scene.screenshot.y - shotHeight / 2;

  function beginDrag(layer: ActiveLayer, event: React.PointerEvent, ox: number, oy: number) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { layer, sx: event.clientX, sy: event.clientY, ox, oy };
    onActiveLayer(layer);
  }

  function moveDrag(event: React.PointerEvent) {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const rect = board.getBoundingClientRect();
    const dx = (event.clientX - drag.sx) / rect.width;
    const dy = (event.clientY - drag.sy) / rect.height;
    if (drag.layer === "screenshot") {
      onSceneChange({
        ...scene,
        screenshot: {
          ...scene.screenshot,
          x: clamp(drag.ox + dx, 0.05, 0.95),
          y: clamp(drag.oy + dy, 0.05, 0.95),
        },
      });
    } else if (drag.layer.startsWith("text:")) {
      const id = drag.layer.slice(5);
      onSceneChange({
        ...scene,
        textBlocks: scene.textBlocks.map((block) =>
          block.id === id ? { ...block, x: clamp(drag.ox + dx, 0, 0.98), y: clamp(drag.oy + dy, 0, 0.95) } : block
        ),
      });
    } else if (drag.layer.startsWith("callout:")) {
      const id = drag.layer.slice(8);
      onSceneChange({
        ...scene,
        callouts: scene.callouts.map((callout) =>
          callout.id === id ? { ...callout, x: clamp(drag.ox + dx, 0, 0.95), y: clamp(drag.oy + dy, 0, 0.95) } : callout
        ),
      });
    }
  }

  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div className="scene-shell">
      <div className="scene-toolbar">
        <span>{preset.label}</span>
        <span>{Math.round(scene.screenshot.width * 100)}% device width</span>
      </div>
      <div className="scene-viewport">
        <div
          ref={boardRef}
          className="scene-board"
          style={{ aspectRatio: `${preset.width}/${preset.height}`, background: backgroundCss(scene.background) }}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="scene-dots" />
          <div className="locale-switcher">
            {availableLocales.slice(0, 4).map((locale) => (
              <button type="button" key={locale} className={previewLocale === locale ? "on" : ""} onClick={() => onPreviewLocale(locale)}>
                {locale.toUpperCase()}
              </button>
            ))}
            {availableLocales.length > 4 && <button type="button">{`+${availableLocales.length - 4}`}</button>}
          </div>
          {scene.textBlocks.map((block) => {
            const selected = activeLayer === `text:${block.id}`;
            const displayText =
              block.role === "title"
                ? previewText.title ?? block.text
                : block.role === "subtitle"
                  ? previewText.subtitle ?? block.text
                  : block.text;
            const displayAccent = block.role === "title" ? previewText.accent ?? block.accent : block.accent;
            return (
              <button
                key={block.id}
                type="button"
                className={`scene-text ${selected ? "selected" : ""}`}
                style={{
                  left: `${block.x * 100}%`,
                  top: `${block.y * 100}%`,
                  width: `${block.width * 100}%`,
                  textAlign: block.align,
                  fontFamily: block.fontFamily,
                  fontSize: `${block.fontSize * 100}cqh`,
                  fontWeight: block.fontWeight,
                  lineHeight: block.lineHeight,
                  color: block.color,
                }}
                onPointerDown={(event) => beginDrag(`text:${block.id}`, event, block.x, block.y)}
              >
                {renderText(displayText || (block.role === "title" ? "Your title here" : ""), displayAccent, block.accentColor)}
              </button>
            );
          })}
          <button
            type="button"
            className={`scene-device ${activeLayer === "screenshot" ? "selected" : ""}`}
            style={{
              left: `${shotLeft * 100}%`,
              top: `${shotTop * 100}%`,
              width: `${shotWidth * 100}%`,
              height: `${shotHeight * 100}%`,
              transform: `rotate(${scene.screenshot.rotation + scene.device.tilt}deg)`,
              padding: scene.device.enabled ? `${scene.device.padding / 16}%` : 0,
              borderRadius: `${scene.device.enabled ? scene.device.radius / 18 : scene.device.radius / 30}%`,
            }}
            onPointerDown={(event) => beginDrag("screenshot", event, scene.screenshot.x, scene.screenshot.y)}
          >
            <span className="scene-device-frame" data-frame={scene.device.frameStyle} data-enabled={scene.device.enabled ? "true" : "false"} />
            {imageHref ? <img src={imageHref} alt="" /> : <span className="scene-empty">Upload image</span>}
            {scene.device.hideStatusBar && <span className="status-cover" />}
          </button>
          {scene.callouts.map((callout) => (
            <button
              key={callout.id}
              type="button"
              className={`scene-callout ${activeLayer === `callout:${callout.id}` ? "selected" : ""}`}
              style={{
                left: `${callout.x * 100}%`,
                top: `${callout.y * 100}%`,
                width: `${callout.width * 100}%`,
                height: `${callout.height * 100}%`,
                borderColor: callout.color,
                color: callout.color,
              }}
              onPointerDown={(event) => beginDrag(`callout:${callout.id}`, event, callout.x, callout.y)}
            >
              {callout.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderText(text: string, accent: string | undefined, color: string) {
  if (!accent) return text;
  const index = text.toLowerCase().indexOf(accent.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark style={{ color }}>{text.slice(index, index + accent.length)}</mark>
      {text.slice(index + accent.length)}
    </>
  );
}

function backgroundCss(bg: StoreScreenshotScene["background"]) {
  if (bg.type === "linear") return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  return bg.color;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
