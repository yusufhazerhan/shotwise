"use client";
import { create } from "zustand";
import type { Locale, AppMetadata } from "@shotwise/types";

interface WizardSlice {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  projectId: string | null;
  appMetadata: Partial<AppMetadata>;
  screenshotIds: string[];
  analysisStatus: "idle" | "running" | "done" | "error";
  selectedThemeId: string;
  selectedLanguages: Locale[];
  exportJobId: string | null;

  setStep: (step: WizardSlice["step"]) => void;
  setProjectId: (id: string) => void;
  setAppMetadata: (m: Partial<AppMetadata>) => void;
  setScreenshotIds: (ids: string[]) => void;
  setAnalysisStatus: (s: WizardSlice["analysisStatus"]) => void;
  setSelectedThemeId: (id: string) => void;
  setSelectedLanguages: (l: Locale[]) => void;
  setExportJobId: (id: string | null) => void;
  reset: () => void;
}

const INITIAL: Omit<WizardSlice, "setStep" | "setProjectId" | "setAppMetadata" | "setScreenshotIds" | "setAnalysisStatus" | "setSelectedThemeId" | "setSelectedLanguages" | "setExportJobId" | "reset"> = {
  step: 1,
  projectId: null,
  appMetadata: {},
  screenshotIds: [],
  analysisStatus: "idle",
  selectedThemeId: "cream",
  selectedLanguages: ["en"],
  exportJobId: null,
};

export const useWizardStore = create<WizardSlice>((set) => ({
  ...INITIAL,
  setStep: (step) => set({ step }),
  setProjectId: (projectId) => set({ projectId }),
  setAppMetadata: (m) => set((s) => ({ appMetadata: { ...s.appMetadata, ...m } })),
  setScreenshotIds: (screenshotIds) => set({ screenshotIds }),
  setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),
  setSelectedThemeId: (selectedThemeId) => set({ selectedThemeId }),
  setSelectedLanguages: (selectedLanguages) => set({ selectedLanguages }),
  setExportJobId: (exportJobId) => set({ exportJobId }),
  reset: () => set(INITIAL),
}));
