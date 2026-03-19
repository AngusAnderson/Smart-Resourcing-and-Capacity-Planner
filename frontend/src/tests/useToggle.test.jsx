import { renderHook, act } from "@testing-library/react";
import useToggle from "../functions/useToggle";
import { describe, test, expect } from "vitest";


describe("useToggle", () => {
  test("toggles from false to true and back", () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
  });

  test("respects initial true state", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });
});
//npm install -D @testing-library/jest-dom
