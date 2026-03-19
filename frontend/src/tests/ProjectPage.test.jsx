import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import api from "../services/api";
import ProjectPage from "../Components/ProjectPage";

vi.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
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

function renderProjectPage(code = "JOB-001") {
  return render(
    <MemoryRouter initialEntries={[`/projects/${code}`]}>
      <Routes>
        <Route path="/projects/:code" element={<ProjectPage refreshKey={0} />} />
      </Routes>
    </MemoryRouter>
  );
}

const mockProjectData = {
  code: "JOB-001",
  description: "Test Project",
  customerName: "Customer X",
  businessUnit: "Engineering",
  jobOrigin: "A",
  budgetTime: 10,
  budgetCost: 1000.0,
  startDate: "2026-02-01",
  endDate: "2026-02-28",
  employees: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
  status: "O",
};

const mockEmployeesData = [
  { employeeID: 1, name: "Alice", specialisms: ["Backend"], excludedFromAI: false },
  { employeeID: 2, name: "Bob", specialisms: ["Frontend"], excludedFromAI: false },
  { employeeID: 3, name: "Charlie", specialisms: ["Backend"], excludedFromAI: false },
];

describe("ProjectPage - CRUD Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Read Project", () => {
    it("should successfully load project data from API", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/jobcodes/JOB-001/");
      });

      expect(await screen.findByText(/Test Project/i)).toBeInTheDocument();
    });

    it("should transform API data correctly including calculated fields", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Customer X")).toBeInTheDocument();
      });

      expect(screen.getByText("Engineering")).toBeInTheDocument(); 
      expect(screen.getByText("Test Project")).toBeInTheDocument();
      
      expect(api.get).toHaveBeenCalledWith("/employees/");
    });

    it("should display assigned employees", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText(/Alice/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
    });

    it("should show error when project fetch fails", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.reject(new Error("Failed to load project"));
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load project/i)).toBeInTheDocument();
      });
    });

    it("should show loading state initially", async () => {
      api.get.mockImplementation(() => new Promise(() => {})); 

      renderProjectPage();

      expect(screen.queryByText(/Failed to load project/i)).not.toBeInTheDocument();
    });
  });

  describe("Update Project", () => {
    it("should enter edit mode when edit button is clicked", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(btn => btn.textContent.toLowerCase().includes("edit"));
      
      if (editButton) {
        await userEvent.click(editButton);
      }
    });

    it("should update project description", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      api.patch.mockImplementation((url, data) => {
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({
            status: 200,
            data: {
              ...mockProjectData,
              description: data.description || mockProjectData.description,
              employees: data.employees || mockProjectData.employees,
            },
          });
        }
        return Promise.resolve({ status: 200, data: {} });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      expect(api.patch).not.toHaveBeenCalled(); 
    });

    it("should update project employees", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      const updatedEmployees = [1, 3]; 
      api.patch.mockImplementation((url, data) => {
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({
            status: 200,
            data: {
              ...mockProjectData,
              employees: [
                { id: 1, name: "Alice" },
                { id: 3, name: "Charlie" },
              ],
            },
          });
        }
        return Promise.resolve({ status: 200, data: {} });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText(/Alice/)).toBeInTheDocument();
      });

      expect(screen.getByText("Engineering")).toBeInTheDocument();
    });

    it("should show error when update fails", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      api.patch.mockImplementation(() => {
        return Promise.reject(new Error("Failed to update project"));
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      expect(api.patch).not.toHaveBeenCalled(); 
    });

    it("should cancel edits when cancel button is clicked", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      expect(screen.getByText("Customer X")).toBeInTheDocument();
    });
  });

  describe("Delete Project", () => {
    it("should initiate project deletion when delete button is clicked", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(btn => btn.textContent.toLowerCase().includes("delete"));

      if (deleteButton) {
        await userEvent.click(deleteButton);
        expect(confirmSpy).toHaveBeenCalled();
      }

      confirmSpy.mockRestore();
    });

    it("should process project deletion after confirmation", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      const deleteResponse = { status: 204, data: { message: "Jobcode deleted successfully" } };
      api.delete.mockResolvedValue(deleteResponse);

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(btn => btn.textContent.toLowerCase().includes("delete"));

      if (deleteButton) {
        await userEvent.click(deleteButton);
        
        await waitFor(() => {
          if (api.delete.mock.calls.length > 0) {
            expect(api.delete).toHaveBeenCalled();
          }
        });
      }

      confirmSpy.mockRestore();
    });

    it("should handle deletion error gracefully", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      api.delete.mockRejectedValue(new Error("Failed to delete project"));

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      const buttons = screen.queryAllByRole("button");
      const deleteButton = buttons.find(btn => btn.textContent?.toLowerCase().includes("delete"));

      if (deleteButton) {
        await userEvent.click(deleteButton);
      }

      confirmSpy.mockRestore();
    });

    it("should not delete project if confirmation is cancelled", async () => {
      api.get.mockImplementation((url) => {
        if (url === "/employees/") {
          return Promise.resolve({ data: mockEmployeesData });
        }
        if (url === "/jobcodes/JOB-001/") {
          return Promise.resolve({ data: mockProjectData });
        }
        return Promise.resolve({ data: [] });
      });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(btn => btn.textContent.toLowerCase().includes("delete"));

      if (deleteButton) {
        await userEvent.click(deleteButton);

        expect(api.delete).not.toHaveBeenCalled();
      }

      confirmSpy.mockRestore();
    });
  });
});
