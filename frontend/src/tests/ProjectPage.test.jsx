import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProjectPage from "../ProjectPage";
import api from "../../services/api";


vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
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
    <MemoryRouter initialEntries={["/project/TEST001"]}>
      <Routes>
        <Route path="/project/:id" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectPage", () => {
  let confirmSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
        });
      }

      if (url === "/jobcodes/TEST001/") {
        return Promise.resolve({
          data: {
            code: "Test Project",
            customerName: "Test Customer",
            businessUnit: "Test Unit",
            description: "Test Description",
            startDate: "2025-01-01",
            endDate: "2025-01-10",
            budgetTime: 12,
            budgetCost: 5000,
            employees: [{ id: 1, name: "Alice" }],
          },
        });
      }

      if (url === "/forecasts/") {
        return Promise.resolve({
          data: [
            {
              forecastID: 10,
              jobCode: "TEST001",
              date: "2025-01-05",
              description: "Week 1",
              allocations: [
                { employeeID: 1, employeeName: "Alice", daysAllocated: 2 },
                { employeeID: 2, employeeName: "Bob", daysAllocated: 1 },
              ],
            },
            {
              forecastID: 11,
              jobCode: "OTHER",
              date: "2025-01-06",
              description: "Other project",
              allocations: [],
            },
          ],
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    api.patch.mockResolvedValue({
      status: 200,
      data: {
        employees: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
      },
    });

    api.delete.mockResolvedValue({ status: 204 });
  });

  afterEach(() => {
    confirmSpy?.mockRestore();
  });

  it("renders project details and project forecasts", async () => {
    renderPage();

    expect(await screen.findByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
    expect(screen.getByText("Test Unit")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Forecast ID:")).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
    expect(screen.getByText("Total Days Allocated:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("Other project")).not.toBeInTheDocument();
  });

  it("navigates back to calendar page on button click", async () => {
    renderPage();

    const backButton = await screen.findByRole("button", {
      name: /Back to Calendar Page/i,
    });

    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows loading state while project is being fetched", () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/jobcodes/TEST001/") {
        return new Promise(() => {});
      }
      if (url === "/forecasts/") {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderPage();

    expect(screen.getByText("Loading project...")).toBeInTheDocument();
  });

  it("shows an error when project fetch fails", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/jobcodes/TEST001/") {
        return Promise.reject(new Error("Network error"));
      }
      if (url === "/forecasts/") {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    renderPage();

    expect(await screen.findByText("Error: Network error")).toBeInTheDocument();
  });

  it("deletes project after confirmation and navigates home", async () => {
    renderPage();

    await screen.findByText("Test Project");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/jobcodes/TEST001/");
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    confirmSpy.mockReturnValue(false);

    renderPage();

    await screen.findByText("Test Project");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(api.delete).not.toHaveBeenCalled();
  });

  it("edits details and saves employee assignments", async () => {
    renderPage();

    await screen.findByText("Test Project");
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    const descriptionInput = screen.getByRole("textbox");
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, "Updated description");

    const employeeSelect = screen.getByRole("listbox");
    await userEvent.selectOptions(employeeSelect, ["1", "2"]);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/jobcodes/TEST001/", {
        employees: [1, 2],
        description: "Updated description",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
      });
    });
  });

  it("edits sidebar values and saves time/finance updates", async () => {
    renderPage();

    await screen.findByText("Test Project");
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);

    const dateInputs = document.querySelectorAll('input[type="date"]');
    const numberInputs = document.querySelectorAll('input[type="number"]');

    fireEvent.change(dateInputs[0], { target: { value: "2025-01-02" } });
    fireEvent.change(dateInputs[1], { target: { value: "2025-01-12" } });
    fireEvent.change(numberInputs[0], { target: { value: "20" } });
    fireEvent.change(numberInputs[1], { target: { value: "6000" } });

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/jobcodes/TEST001/", {
        startDate: "2025-01-02",
        endDate: "2025-01-12",
        budgetTime: 20,
        budgetCost: 6000,
      });
    });
  });

  it("cancels sidebar editing without saving", async () => {
    renderPage();

    await screen.findByText("Test Project");
    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    });
    expect(api.patch).not.toHaveBeenCalledWith(
      "/jobcodes/TEST001/",
      expect.objectContaining({
        budgetTime: expect.any(Number),
        budgetCost: expect.any(Number),
      })
    );
  });
});
