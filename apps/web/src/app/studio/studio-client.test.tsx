import * as React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { LocalStudio } from "./studio-client";
import { createLocalProject } from "@/lib/local-studio-store";

const store = vi.hoisted(() => ({
  projects: [] as ReturnType<typeof createLocalProject>[],
  listLocalProjects: vi.fn(),
  saveLocalProject: vi.fn(),
  deleteLocalProject: vi.fn(),
}));

vi.mock("@/lib/local-studio-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/local-studio-store")>();
  return {
    ...actual,
    listLocalProjects: store.listLocalProjects,
    saveLocalProject: store.saveLocalProject,
    deleteLocalProject: store.deleteLocalProject,
  };
});

describe("LocalStudio", () => {
  it("starts without auth and creates a local project from a template", async () => {
    store.projects = [];
    store.listLocalProjects.mockResolvedValueOnce([]);
    store.saveLocalProject.mockImplementation(async (project) => {
      store.projects = [project];
      return project;
    });
    store.listLocalProjects.mockResolvedValueOnce(store.projects);

    renderWithProviders(<LocalStudio />);

    await screen.findByText(/Create a local project/i);
    fireEvent.click(screen.getByRole("button", { name: /start from template/i }));

    await waitFor(() => expect(store.saveLocalProject).toHaveBeenCalledTimes(1));
    expect(store.saveLocalProject.mock.calls[0]?.[0].templateId).toBe("two-screens-one-story");
  });

  it("lets users tune headline spacing from the inspector", async () => {
    const project = createLocalProject("Petwises", "two-screens-one-story");
    store.projects = [project];
    store.listLocalProjects.mockResolvedValueOnce(store.projects);
    store.saveLocalProject.mockImplementation(async (nextProject) => {
      store.projects = [nextProject];
      return nextProject;
    });

    renderWithProviders(<LocalStudio />);

    const letterSlider = (await screen.findAllByLabelText(/letter spacing/i))[0]!;
    fireEvent.change(letterSlider, { target: { value: "0.09" } });
    const wordSlider = (await screen.findAllByLabelText(/word spacing/i))[0]!;
    fireEvent.change(wordSlider, { target: { value: "0.62" } });

    await waitFor(() => expect(store.saveLocalProject).toHaveBeenCalled());
    const savedProject = store.saveLocalProject.mock.calls.at(-1)?.[0];
    const savedTitle = savedProject?.scene.textBlocks.find((block: (typeof project.scene.textBlocks)[number]) => block.role === "title");
    expect(savedTitle?.letterSpacing).toBe(0.09);
    expect(savedTitle?.wordSpacing).toBe(0.62);
  });
});
