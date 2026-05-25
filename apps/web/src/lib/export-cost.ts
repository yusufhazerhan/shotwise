export interface ExportPlanInput {
  screenCount: number;
  languages: readonly string[];
  devicePresetIds?: readonly string[];
  includeFeatureGraphic?: boolean;
}

export interface ExportPlan {
  screenCount: number;
  languageCount: number;
  deviceCount: number;
  finalImageCount: number;
  featureGraphicCount: number;
  credits: number;
}

export function getExportPlan(input: ExportPlanInput): ExportPlan {
  const screenCount = Math.max(0, Math.floor(input.screenCount));
  const languageCount = Math.max(1, input.languages.length);
  const deviceCount = Math.max(1, input.devicePresetIds?.length ?? 1);
  const featureGraphicCount = input.includeFeatureGraphic ? languageCount : 0;
  const finalImageCount = screenCount * languageCount * deviceCount + featureGraphicCount;

  return {
    screenCount,
    languageCount,
    deviceCount,
    finalImageCount,
    featureGraphicCount,
    credits: finalImageCount,
  };
}
