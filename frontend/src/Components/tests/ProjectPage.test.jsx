import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import api from "../../services/api";
import ProjectPage from "../ProjectPage";

vi.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));


const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <EmployeeList />
    </MemoryRouter>
  );
}

describe("ProjectPage", () => {
  beforeEach(() => {
    api.get.mockResolvedValueOnce({ data: { name: "Test Project", description: "Test Description" } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders project details", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });


  it("navigates back to calendar page on button click", async () => {
    renderPage();

    const backButton = screen.getByRole("button", { name: /back to calendar page/i });
    userEvent.click(backButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/calendar");
    });
    });
});