import type { Locale } from "@shotwise/types";

export type ExportMatrixSelection = Record<string, Record<string, Record<string, "on" | "off" | "locked">>>;

export function createExportMatrix(input: {
  devicePresetIds: readonly string[];
  screenIds: readonly string[];
  languages: readonly Locale[];
}) {
  const matrix: ExportMatrixSelection = {};

  for (const deviceId of input.devicePresetIds) {
    matrix[deviceId] = {};
    for (const screenId of input.screenIds) {
      matrix[deviceId]![screenId] = {};
      for (const locale of input.languages) {
        matrix[deviceId]![screenId]![locale] = locale === "en" ? "locked" : "on";
      }
    }
  }

  return matrix;
}

export function toggleExportCell(
  matrix: ExportMatrixSelection,
  args: { deviceId: string; screenId: string; locale: string }
) {
  const current = matrix[args.deviceId]?.[args.screenId]?.[args.locale];
  if (!current || current === "locked") return matrix;

  return {
    ...matrix,
    [args.deviceId]: {
      ...matrix[args.deviceId],
      [args.screenId]: {
        ...matrix[args.deviceId]![args.screenId],
        [args.locale]: (current === "on" ? "off" : "on") as "on" | "off",
      },
    },
  } as ExportMatrixSelection;
}

export function setAllForDevice(
  matrix: ExportMatrixSelection,
  args: { deviceId: string; value: "on" | "off" }
) {
  const device = matrix[args.deviceId];
  if (!device) return matrix;
  const nextDevice: Record<string, Record<string, "on" | "off" | "locked">> = {};
  for (const [screenId, locales] of Object.entries(device)) {
    const nextLocales: Record<string, "on" | "off" | "locked"> = {};
    for (const [locale, state] of Object.entries(locales)) {
      nextLocales[locale] = state === "locked" ? "locked" : args.value;
    }
    nextDevice[screenId] = nextLocales;
  }

  return {
    ...matrix,
    [args.deviceId]: nextDevice,
  };
}

export function summarizeExportMatrix(matrix: ExportMatrixSelection) {
  let total = 0;
  const perDevice: Record<string, number> = {};

  for (const [deviceId, screens] of Object.entries(matrix)) {
    let deviceTotal = 0;
    for (const locales of Object.values(screens)) {
      for (const state of Object.values(locales)) {
        if (state === "on" || state === "locked") {
          total += 1;
          deviceTotal += 1;
        }
      }
    }
    perDevice[deviceId] = deviceTotal;
  }

  return {
    total,
    perDevice,
  };
}
