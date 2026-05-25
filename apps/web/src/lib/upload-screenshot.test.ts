import { describe, expect, it, vi } from "vitest";
import { uploadScreenshot } from "./upload-screenshot";
import { installFetchMock } from "@/test/setup";

describe("uploadScreenshot", () => {
  it("posts multipart form data to the upload route", async () => {
    const file = new File(["hello"], "shot.png", { type: "image/png" });
    const fetchMock = installFetchMock(async (input, init) => {
      expect(String(input)).toBe("/api/projects/project-1/screenshots/upload-file");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBeInstanceOf(FormData);
      const form = init?.body as FormData;
      expect(form.get("order")).toBe("3");
      expect(form.get("file")).toBe(file);
      return Response.json({ screenshotId: "shot-9" });
    });

    await expect(uploadScreenshot({ projectId: "project-1", file, order: 3 })).resolves.toEqual({ screenshotId: "shot-9" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws on upload failure", async () => {
    installFetchMock(() => new Response(null, { status: 500 }));
    const file = new File(["hello"], "shot.png", { type: "image/png" });
    await expect(uploadScreenshot({ projectId: "project-1", file, order: 0 })).rejects.toThrow("Screenshot upload failed: 500");
  });
});
