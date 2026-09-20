import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingProgress } from "./reading-progress";

describe("ReadingProgress", () => {
  it("tracks the proportion of the page that has been read", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 500 });

    render(<ReadingProgress />);
    act(() => window.dispatchEvent(new Event("scroll")));

    expect(screen.getByTestId("reading-progress")).toHaveStyle({ transform: "scaleX(0.5)" });
  });
});
