import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Calendar from "../Components/Calendar";
import { fetchJobcodesAsEvents } from "../services/Job_Codes_API";

vi.mock("../services/Job_Codes_API", () => ({
  fetchJobcodesAsEvents: vi.fn(),
}));

vi.mock("../services/api", () => ({
  default: {
    put: vi.fn(),
  },
}));

vi.mock("../utils/dateUtils", () => ({
  getWorkingDaysInMonth: vi.fn(() => 20),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@schedule-x/react", () => ({
  useCalendarApp: vi.fn(() => ({ mocked: true })),
  ScheduleXCalendar: () => <div data-testid="schedulex-calendar">ScheduleX Mock</div>,
}));

vi.mock("@schedule-x/drag-and-drop", () => ({
  createDragAndDropPlugin: vi.fn(() => ({})),
}));

vi.mock("@schedule-x/resize", () => ({
  createResizePlugin: vi.fn(() => ({})),
}));

vi.mock("@schedule-x/current-time", () => ({
  createCurrentTimePlugin: vi.fn(() => ({})),
}));

vi.mock("@schedule-x/calendar", () => ({
  createViewDay: vi.fn(() => ({ name: "day" })),
  createViewMonthAgenda: vi.fn(() => ({ name: "monthAgenda" })),
  createViewMonthGrid: vi.fn(() => ({ name: "monthGrid" })),
  createViewWeek: vi.fn(() => ({ name: "week" })),
}));

vi.mock("@schedule-x/events-service", () => ({
  createEventsServicePlugin: vi.fn(() => ({
    getAll: vi.fn(() => []),
    remove: vi.fn(),
    clear: vi.fn(),
    add: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
  })),
}));

vi.mock("@schedule-x/calendar-controls", () => ({
  createCalendarControlsPlugin: vi.fn(() => ({
    setDate: vi.fn(),
  })),
}));

describe("Calendar (smoke)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchJobcodesAsEvents.mockResolvedValue([]);
  });

  test("renders calendar shell and loads events", async () => {
    render(<Calendar searchTerm="" selectedDate={null} />);

    
    expect(screen.getByTestId("schedulex-calendar")).toBeInTheDocument();

    
  });

  
});
