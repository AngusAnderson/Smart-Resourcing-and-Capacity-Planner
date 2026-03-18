import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProjectList from "../Components/ProjectList";
import api from "../services/api";

vi.mock("../Components/CreateProjectModal", () => ({
  default: () => <div data-testid="create-project-modal">CreateProjectModal</div>,
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const apiGetMock = vi.fn();
const apiDeleteMock = vi.fn();

vi.mock("../services/api", () => ({
  default: {
    get: (...args) => apiGetMock(...args),
    delete: (...args) => apiDeleteMock(...args),
  },
}));

describe("ProjectList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <ProjectList />
      </MemoryRouter>
    );
  }

  it("renders header and fetches projects", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 5,
          code: "comwrap-22-22",
          description: "comwrap stuff",
          customerName: "Comwrap",
          businessUnit: "it",
        },
      ],
    });

    renderPage();

    expect(screen.getByText("Projects")).toBeInTheDocument();

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalledWith("/jobcodes/");
    });

    expect(screen.getByText("comwrap-22-22")).toBeInTheDocument();
    expect(screen.getByText("comwrap stuff")).toBeInTheDocument();
    expect(screen.getByText(/Customer:/)).toBeInTheDocument();
    expect(screen.getByText(/Business Unit:/)).toBeInTheDocument();
  });

  it("filters projects using search", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          code: "alpha-1",
          description: "Alpha project",
          customerName: "AlphaCo",
          businessUnit: "ops",
        },
        {
          id: 2,
          code: "beta-2",
          description: "Beta project",
          customerName: "BetaCo",
          businessUnit: "it",
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByText("alpha-1")).toBeInTheDocument());

    const input = screen.getByPlaceholderText("Search projects...");
    await userEvent.type(input, "beta");

    expect(screen.queryByText("alpha-1")).not.toBeInTheDocument();
    expect(screen.getByText("beta-2")).toBeInTheDocument();
  });

  it("navigates when clicking a project card", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 5,
          code: "comwrap-22-22",
          description: "comwrap stuff",
          customerName: "Comwrap",
          businessUnit: "it",
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByText("comwrap-22-22")).toBeInTheDocument());

    await userEvent.click(screen.getByText("comwrap-22-22"));

    expect(navigateMock).toHaveBeenCalledWith("/projects/comwrap-22-22");
  });

  it("navigates when clicking View", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 5,
          code: "comwrap-22-22",
          description: "comwrap stuff",
          customerName: "Comwrap",
          businessUnit: "it",
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByText("comwrap-22-22")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "View" }));

    expect(navigateMock).toHaveBeenCalledWith("/projects/comwrap-22-22");
  });

  it("deletes project optimistically and calls api delete", async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 5,
          code: "comwrap-22-22",
          description: "comwrap stuff",
          customerName: "Comwrap",
          businessUnit: "it",
        },
        {
          id: 6,
          code: "other-1",
          description: "other project",
          customerName: "Other",
          businessUnit: "ops",
        },
      ],
    });

    apiDeleteMock.mockResolvedValueOnce({ status: 204 });

    renderPage();

    await waitFor(() => expect(screen.getByText("comwrap-22-22")).toBeInTheDocument());

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(screen.queryByText("comwrap-22-22")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(apiDeleteMock).toHaveBeenCalledWith("/jobcodes/comwrap-22-22/");
    });

    expect(screen.getByText("other-1")).toBeInTheDocument();
  });

  it("opens CreateProjectModal when clicking Add Project", async () => {
    apiGetMock.mockResolvedValueOnce({ data: [] });

    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Add Project" }));

    expect(screen.getByTestId("create-project-modal")).toBeInTheDocument();
  });
});