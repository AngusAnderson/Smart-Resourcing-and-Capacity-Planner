import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Sidebar from "../Components/Sidebar/Sidebar";

vi.mock("../Components/Sidebar/Mini_Calendar", () => ({
  default: ({ setSelectedDate }) => (
    <button
      data-testid="mini-calendar-mock"
      onClick={() => setSelectedDate?.("2026-02-01")}
    >
      Mini Calendar Mock
    </button>
  ),
}));

vi.mock("../Components/Sidebar/Filter_Box", () => ({
  default: ({ searchTerm, onSearchChange, events, feedItems }) => (
    <div data-testid="filter-box-mock">
      <div data-testid="filter-props">
        {JSON.stringify({
          searchTerm,
          eventsCount: events?.length ?? 0,
          feedCount: feedItems?.length ?? 0,
        })}
      </div>
      <button onClick={() => onSearchChange?.("new search")}>Change Search</button>
    </div>
  ),
}));

describe("Sidebar", () => {

  test("forwards props to Filter_Box", () => {
    render(
      <Sidebar
        searchTerm="abc"
        onSearchChange={vi.fn()}
        setSelectedDate={vi.fn()}
        events={[{ id: 1 }, { id: 2 }]}
        feedItems={[{ id: "f1" }]}
      />
    );

    expect(screen.getByTestId("filter-props")).toHaveTextContent('"searchTerm":"abc"');
    expect(screen.getByTestId("filter-props")).toHaveTextContent('"eventsCount":2');
    expect(screen.getByTestId("filter-props")).toHaveTextContent('"feedCount":1');
  });

  test("forwards onSearchChange to Filter_Box", () => {
    const onSearchChange = vi.fn();

    render(
      <Sidebar
        searchTerm=""
        onSearchChange={onSearchChange}
        setSelectedDate={vi.fn()}
        events={[]}
        feedItems={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /change search/i }));
    expect(onSearchChange).toHaveBeenCalledWith("new search");
  });
});
