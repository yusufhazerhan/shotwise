import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shotwise/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@shotwise/core/themes": path.resolve(__dirname, "../../packages/core/src/themes/index.ts"),
    },
  },
  test: {
    environmentMatchGlobs: [
      ["src/**/*.test.tsx", "jsdom"],
    ],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
