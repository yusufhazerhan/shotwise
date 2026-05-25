import type { Locale, StoreScreenshotScene } from "@shotwise/types";
import { applyTemplate, getTemplate } from "./templates";
import { normalizeScene, type StorePresetId } from "./editor-scene";

export type LocalScreenshot = {
  id: string;
  name: string;
  mimeType: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: string;
};

export type LocalProject = {
  id: string;
  name: string;
  screenName: string;
  templateId: string;
  scene: StoreScreenshotScene;
  screenshots: LocalScreenshot[];
  localized: Record<string, { title?: string; subtitle?: string; accent?: string }>;
  exportConfig: {
    devicePresetIds: string[];
    locales: Locale[];
    includeFeatureGraphic: boolean;
    styleThemeId: string;
    deviceConfigs: Record<string, LocalDeviceConfig>;
  };
  updatedAt: string;
  createdAt: string;
};

export type LocalDeviceConfig = {
  frameStyle?: StoreScreenshotScene["device"]["frameStyle"];
  hideStatusBar?: boolean;
  slotScale?: number;
  textScale?: number;
};

const DB_NAME = "shotwise-local-studio";
const DB_VERSION = 1;
const PROJECTS_STORE = "projects";

export function createLocalProject(name = "Local Screenshot Set", templateId = "classic-app-store"): LocalProject {
  const template = getTemplate(templateId);
  const cfg = {
    canvasPresetId: "iphone69" as const,
    languages: ["en" as const],
    themeId: "cream" as const,
    layoutPreset: "single" as const,
    defaultFont: "Fraunces, Georgia, serif",
    selectedDevicePresetIds: template.exportDefaults.devicePresetIds as StorePresetId[],
    includeFeatureGraphic: template.exportDefaults.includeFeatureGraphic,
    stylePresetId: "cream-calm",
    templateId,
  };
  const base = normalizeScene(undefined, cfg, {
    title: "Tell your app story",
    subtitle: "Drop screenshots, choose a template, export locally.",
    accent: "story",
  });
  const scene = applyTemplate(base, templateId);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name,
    screenName: "screen-01",
    templateId,
    scene,
    screenshots: [],
    localized: {
      en: {
        title: "Tell your app story",
        subtitle: "Drop screenshots, choose a template, export locally.",
        accent: "story",
      },
    },
    exportConfig: {
      devicePresetIds: template.exportDefaults.devicePresetIds,
      locales: ["en"],
      includeFeatureGraphic: template.exportDefaults.includeFeatureGraphic,
      styleThemeId: "cream-calm",
      deviceConfigs: {},
    },
    createdAt: now,
    updatedAt: now,
  };
}

export async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image dimensions"));
      image.src = url;
    });
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function filesToLocalScreenshots(files: File[]): Promise<LocalScreenshot[]> {
  const out: LocalScreenshot[] = [];
  for (const file of files) {
    const dimensions = await getImageDimensions(file);
    out.push({
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || "image/png",
      blob: file,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: new Date().toISOString(),
    });
  }
  return out;
}

export async function openLocalStudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
      }
    };
    request.onerror = () => reject(request.error ?? new Error("Could not open local studio database"));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function listLocalProjects(): Promise<LocalProject[]> {
  const db = await openLocalStudioDb();
  return transact<LocalProject[]>(db, "readonly", (store) => store.getAll()).then((projects) =>
    projects.map(normalizeLocalProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  );
}

export async function getLocalProject(id: string): Promise<LocalProject | null> {
  const db = await openLocalStudioDb();
  return transact<LocalProject | undefined>(db, "readonly", (store) => store.get(id)).then((project) => project ? normalizeLocalProject(project) : null);
}

export async function saveLocalProject(project: LocalProject): Promise<LocalProject> {
  const next = normalizeLocalProject({ ...project, updatedAt: new Date().toISOString() });
  const db = await openLocalStudioDb();
  await transact<IDBValidKey>(db, "readwrite", (store) => store.put(next));
  return next;
}

function normalizeLocalProject(project: LocalProject): LocalProject {
  return {
    ...project,
    screenName: project.screenName || "screen-01",
    exportConfig: {
      ...project.exportConfig,
      locales: project.exportConfig.locales?.length ? project.exportConfig.locales : ["en"],
      styleThemeId: project.exportConfig.styleThemeId || "cream-calm",
      deviceConfigs: project.exportConfig.deviceConfigs ?? {},
    },
  };
}

export async function deleteLocalProject(id: string): Promise<void> {
  const db = await openLocalStudioDb();
  await transact<undefined>(db, "readwrite", (store) => store.delete(id));
}

export function serializeLocalProject(project: LocalProject) {
  return JSON.stringify(
    {
      ...project,
      screenshots: project.screenshots.map((shot) => ({
        id: shot.id,
        name: shot.name,
        mimeType: shot.mimeType,
        width: shot.width,
        height: shot.height,
        createdAt: shot.createdAt,
      })),
    },
    null,
    2
  );
}

function transact<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE, mode);
    const request = run(tx.objectStore(PROJECTS_STORE));
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    request.onsuccess = () => resolve(request.result);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    };
  });
}
