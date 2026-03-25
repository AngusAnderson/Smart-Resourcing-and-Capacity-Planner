import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import api from "../services/api";
import EmployeeList from "../Components/EmployeeList";

vi.mock("../services/api", () => ({
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

function getNameInput() {
  const textboxes = screen.getAllByRole("textbox");
  return textboxes[1];
}

describe("EmployeeList", () => {
  let confirmSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy?.mockRestore();
    vi.clearAllMocks();
  });

  it("shows loading state", async () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    renderPage();
    expect(screen.getByText(/Loading employees/i)).toBeInTheDocument();
  });

  it("renders employees after successful fetch", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [
            { employeeID: 1, name: "Alice", specialisms: ["Backend"], excludedFromAI: false },
            { employeeID: 2, name: "Bob", specialisms: ["Frontend"], excludedFromAI: true },
          ],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Excluded from AI: No")).toBeInTheDocument();
    expect(screen.getByText("Excluded from AI: Yes")).toBeInTheDocument();
  });

  it("shows error page when employee fetch fails", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.reject(new Error("Network error"));
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    expect(await screen.findByText("Failed to fetch employees.")).toBeInTheDocument();
  });

  it("renders empty state when no employees", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    expect(await screen.findByText("No employees found")).toBeInTheDocument();
  });

  it("filters employees using search bar (name search)", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [
            { employeeID: 1, name: "Alice Khan", specialisms: ["Backend"], excludedFromAI: false },
            { employeeID: 2, name: "Bilal Ahmed", specialisms: ["Frontend"], excludedFromAI: false },
          ],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    await screen.findByText("Alice Khan");

    const search = screen.getByPlaceholderText("Search employees...");
    await userEvent.type(search, "bil");

    expect(screen.queryByText("Alice Khan")).not.toBeInTheDocument();
    expect(screen.getByText("Bilal Ahmed")).toBeInTheDocument();
  });

  it("filters employees using search bar (specialisms search)", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [
            { employeeID: 1, name: "Ayesha", specialisms: ["Edge Delivery Services"], excludedFromAI: false },
            { employeeID: 2, name: "Zara", specialisms: ["Frontend"], excludedFromAI: false },
          ],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    await screen.findByText("Ayesha");

    const search = screen.getByPlaceholderText("Search employees...");
    await userEvent.type(search, "edge");

    expect(screen.getByText("Ayesha")).toBeInTheDocument();
    expect(screen.queryByText("Zara")).not.toBeInTheDocument();
  });

  it("View button navigates to /employees/:slug", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [{ employeeID: 1, name: "Employee B", specialisms: [], excludedFromAI: false }],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();

    await screen.findByText("Employee B");

    await userEvent.click(screen.getByRole("button", { name: "View" }));
    expect(mockNavigate).toHaveBeenCalledWith("/employees/employee-b");
  });

  it("Delete calls api.delete with slug and refreshes", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [{ employeeID: 1, name: "Delete Me", specialisms: [], excludedFromAI: false }],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    api.delete.mockResolvedValue({ data: {} });

    renderPage();
    await screen.findByText("Delete Me");

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/employees/delete-me/");
    });
  });

  it("does not delete if confirm is false", async () => {
    confirmSpy.mockReturnValue(false);

    api.get.mockImplementation((url) => {
      if (url === "/employees/") {
        return Promise.resolve({
          data: [{ employeeID: 1, name: "Keep Me", specialisms: [], excludedFromAI: false }],
        });
      }
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    api.delete.mockResolvedValue({ data: {} });

    renderPage();
    await screen.findByText("Keep Me");

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(api.delete).not.toHaveBeenCalled();
  });

  it("Add Employee toggles the create form", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();
    await screen.findByRole("heading", { name: "Employees" });

    expect(screen.queryByRole("button", { name: "Create Employee" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add new" }));
    expect(screen.getByRole("button", { name: "Create Employee" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("button", { name: "Create Employee" })).not.toBeInTheDocument();
  });

  it("Create Employee button is disabled until name has text", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderPage();
    await screen.findByRole("heading", { name: "Employees" });

    await userEvent.click(screen.getByRole("button", { name: "Add New" }));

    const createBtn = screen.getByRole("button", { name: "Create Employee" });
    expect(createBtn).toBeDisabled();

    const nameInput = getNameInput();
    await userEvent.type(nameInput, "John Doe");
    expect(createBtn).not.toBeDisabled();
  });

  it("submits create form and posts correct payload", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    api.post.mockResolvedValue({ data: {} });

    renderPage();
    await screen.findByRole("heading", { name: "Employees" });

    await userEvent.click(screen.getByRole("button", { name: "Add New" }));

    const nameInput = getNameInput();
    await userEvent.type(nameInput, "Test User");

    await userEvent.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/employees/", {
        name: "Test User",
        specialisms: [],
        excludedFromAI: false,
      });
    });
  });

  it("shows create error when api.post fails", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    api.post.mockRejectedValue(new Error("Server error"));

    renderPage();
    await screen.findByRole("heading", { name: "Employees" });

    await userEvent.click(screen.getByRole("button", { name: "Add New" }));

    const nameInput = getNameInput();
    await userEvent.type(nameInput, "Test");

    await userEvent.click(screen.getByRole("button", { name: "Create Employee" }));

    expect(await screen.findByText("Failed to create employee.")).toBeInTheDocument();
  });

  it("creates employee with specialisms selected", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/employees/") return Promise.resolve({ data: [] });
      if (url === "/specialisms/") {
        return Promise.resolve({
          data: [
            { id: 1, name: "Backend" },
            { id: 2, name: "Frontend" },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    api.post.mockResolvedValue({ data: {} });

    renderPage();
    await screen.findByRole("heading", { name: "Employees" });

    await userEvent.click(screen.getByRole("button", { name: "Add New" }));

    const nameInput = getNameInput();
    await userEvent.type(nameInput, "Jane Developer");

    const select = screen.getByRole("listbox"); 
    await userEvent.selectOptions(select, ["Backend"]);

    await userEvent.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/employees/", {
        name: "Jane Developer",
        specialisms: ["Backend"],
        excludedFromAI: false, 
      });
    });
  });
});