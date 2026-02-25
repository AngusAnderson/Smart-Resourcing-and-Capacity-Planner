import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { getDeadlinesWithinTwoWeeks } from "../utils/deadlineUtils";

describe("getDeadlinesWithinTwoWeeks", () => {
  beforeEach(() => {
    vi.spyOn(Temporal.Now, "plainDateISO").mockReturnValue(
      Temporal.PlainDate.from("2026-02-01")
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns empty array for empty input", () => {
    expect(getDeadlinesWithinTwoWeeks([])).toEqual([]);
  });

  test("excludes events without end date", () => {
    const events = [
      { id: 1, title: "No end" },
      { id: 2, title: "Valid", end: "2026-02-05" },
    ];

    const result = getDeadlinesWithinTwoWeeks(events);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test("includes events ending today and exactly in 14 days", () => {
    const events = [
      { id: 1, end: "2026-02-01" }, // today
      { id: 2, end: "2026-02-15" }, // exactly 14 days later
    ];

    const result = getDeadlinesWithinTwoWeeks(events);

    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });

  test("excludes past events and events beyond 14 days", () => {
    const events = [
      { id: 1, end: "2026-01-31" }, // past
      { id: 2, end: "2026-02-16" }, // beyond 14 days
      { id: 3, end: "2026-02-10" }, // valid
    ];

    const result = getDeadlinesWithinTwoWeeks(events);

    expect(result.map((e) => e.id)).toEqual([3]);
  });

  test("sorts returned events by nearest deadline first", () => {
    const events = [
      { id: 1, end: "2026-02-10" },
      { id: 2, end: "2026-02-03" },
      { id: 3, end: "2026-02-07" },
    ];

    const result = getDeadlinesWithinTwoWeeks(events);

    expect(result.map((e) => e.id)).toEqual([2, 3, 1]);
  });
});
