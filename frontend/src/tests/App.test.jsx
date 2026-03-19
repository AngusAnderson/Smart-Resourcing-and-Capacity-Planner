import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { fetchJobcodesAsEvents } from "../services/Job_Codes_API";
import { loadFeedItems, saveFeedItems } from "../utils/Storage";

vi.mock("../Components/Header", () => ({
  default: ({ isVisible, toggleVisibility }) => (
    <button
      data-testid="mock-header"
      data-visible={String(isVisible)}
      onClick={toggleVisibility}
    >
      Mock Header
    </button>
  ),
}));

vi.mock("../Components/Sidebar/Sidebar", () => ({
  default: ({ searchTerm, events, feedItems }) => (
    <div
      data-testid="mock-sidebar"
      data-search={searchTerm}
      data-events={String(events?.length ?? 0)}
      data-feed={String(feedItems?.length ?? 0)}
    >
      Mock Sidebar
    </div>
  ),
}));

vi.mock("../Components/Calendar", () => ({
  default: ({ searchTerm, events }) => (
    <div
      data-testid="mock-calendar"
      data-search={searchTerm}
      data-events={String(events?.length ?? 0)}
    >
      Mock Calendar
    </div>
  ),
}));

vi.mock("../Components/EmployeePage", () => ({
  default: () => <div data-testid="employee-page">Employee Page</div>,
}));

vi.mock("../Components/ProjectPage", () => ({
  default: () => <div data-testid="project-page">Project Page</div>,
}));

vi.mock("../services/Job_Codes_API", () => ({
  fetchJobcodesAsEvents: vi.fn(),
}));

vi.mock("../utils/Storage", () => ({
  loadFeedItems: vi.fn(),
  saveFeedItems: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.localStorage.setItem("isLoggedIn", "true");
    window.localStorage.setItem(
      "user",
      JSON.stringify({ firstName: "Test", lastName: "User" })
    );

    window.history.pushState({}, "", "/");
    loadFeedItems.mockReturnValue([]);
    fetchJobcodesAsEvents.mockResolvedValue([]);
  });

  test("renders root layout components", async () => {
    render(<App />);

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchJobcodesAsEvents).toHaveBeenCalledTimes(1);
    });
  });

  test("toggles header visible state when header button is clicked", () => {
    render(<App />);

    const headerBtn = screen.getByTestId("mock-header");
    expect(headerBtn.dataset.visible).toBe("false");

    fireEvent.click(headerBtn);

    expect(screen.getByTestId("mock-header").dataset.visible).toBe("true");
  });

  test("loads cached feed items and passes them to Sidebar", () => {
    loadFeedItems.mockReturnValue([{ id: "f1", message: "cached" }]);

    render(<App />);

    expect(screen.getByTestId("mock-sidebar").dataset.feed).toBe("1");
  });

  test("renders employee route component", () => {
    window.localStorage.setItem("isLoggedIn", "true");
    window.history.pushState({}, "", "/employees/123");

    render(<App />);

    expect(screen.getByTestId("employee-page")).toBeInTheDocument();
  });

  test("saves feed items effect runs on mount", () => {
    render(<App />);
    expect(saveFeedItems).toHaveBeenCalled();
  });
});
