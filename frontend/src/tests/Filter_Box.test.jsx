import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Filter_Box from "../Components/Sidebar/Filter_Box";
import { getDeadlinesWithinTwoWeeks } from "../utils/deadlineUtils";

vi.mock("../functions/Filter_Box_Functions/Overall_Project_Progress", () => ({
  default: () => <div data-testid="overall-progress-mock">Overall Progress Mock</div>,
}));

vi.mock("../Components/Sidebar/Dashboard_Tabs", () => ({
  default: ({ deadlines, feedItems }) => (
    <div data-testid="dashboard-tabs-mock">
      {JSON.stringify({
        deadlinesCount: deadlines?.length ?? 0,
        feedCount: feedItems?.length ?? 0,
      })}
    </div>
  ),
}));

vi.mock("../utils/deadlineUtils", () => ({
  getDeadlinesWithinTwoWeeks: vi.fn(),
}));

describe("Filter_Box", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDeadlinesWithinTwoWeeks.mockReturnValue([]);
  });

  test("renders search input with current value", () => {
    render(
      <Filter_Box
        searchTerm="search text"
        onSearchChange={vi.fn()}
        events={[]}
        feedItems={[]}
      />
    );

    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("search text");
  });

  test("calls onSearchChange when user types", () => {
    const onSearchChange = vi.fn();

    render(
      <Filter_Box
        searchTerm=""
        onSearchChange={onSearchChange}
        events={[]}
        feedItems={[]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "abc" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("abc");
  });

  test("calls deadline util with events", () => {
    const events = [{ id: 1, end: "2026-02-10" }];

    render(
      <Filter_Box
        searchTerm=""
        onSearchChange={vi.fn()}
        events={events}
        feedItems={[]}
      />
    );

    expect(getDeadlinesWithinTwoWeeks).toHaveBeenCalledWith(events);
  });

  test("passes deadlines and feedItems to Dashboard_Tabs", () => {
    getDeadlinesWithinTwoWeeks.mockReturnValue([{ id: "d1" }, { id: "d2" }]);

    render(
      <Filter_Box
        searchTerm=""
        onSearchChange={vi.fn()}
        events={[{ id: 1 }]}
        feedItems={[{ id: "f1" }]}
      />
    );

    expect(screen.getByTestId("dashboard-tabs-mock")).toHaveTextContent(
      '"deadlinesCount":2'
    );
    expect(screen.getByTestId("dashboard-tabs-mock")).toHaveTextContent(
      '"feedCount":1'
    );
  });

  test("renders overall project progress section", () => {
    render(
      <Filter_Box
        searchTerm=""
        onSearchChange={vi.fn()}
        events={[]}
        feedItems={[]}
      />
    );

    expect(screen.getByTestId("overall-progress-mock")).toBeInTheDocument();
    expect(screen.getAllByText(/filter/i).length).toBeGreaterThan(0);
  });
});
