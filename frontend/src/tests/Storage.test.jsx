import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { saveFeedItems, loadFeedItems } from "../utils/Storage";

describe("Storage utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns empty array when nothing is stored", () => {
    expect(loadFeedItems()).toEqual([]);
  });

  test("saveFeedItems stores value and expiry", () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    const items = [{ id: 1, text: "hello" }];
    saveFeedItems(items);

    const raw = localStorage.getItem("feedItems");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw);
    expect(parsed.value).toEqual(items);
    expect(parsed.expiry).toBe(1000 + 24 * 60 * 60 * 1000);
  });

  test("loadFeedItems returns saved items before expiry", () => {
    vi.spyOn(Date, "now").mockReturnValue(5000);

    const items = [{ id: 1 }, { id: 2 }];
    saveFeedItems(items);

    expect(loadFeedItems()).toEqual(items);
  });

  test("loadFeedItems returns empty array and removes expired cache", () => {
    localStorage.setItem(
      "feedItems",
      JSON.stringify({
        value: [{ id: 1 }],
        expiry: 1000,
      })
    );

    vi.spyOn(Date, "now").mockReturnValue(2000);

    expect(loadFeedItems()).toEqual([]);
    expect(localStorage.getItem("feedItems")).toBeNull();
  });

  test("loadFeedItems returns empty array for invalid JSON", () => {
    localStorage.setItem("feedItems", "{not-valid-json");

    expect(loadFeedItems()).toEqual([]);
  });

  test("loadFeedItems returns empty array when stored value is not an array", () => {
    localStorage.setItem(
      "feedItems",
      JSON.stringify({
        value: { id: 1 },
        expiry: Date.now() + 10000,
      })
    );

    expect(loadFeedItems()).toEqual([]);
  });
});
