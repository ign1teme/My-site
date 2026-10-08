import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

const setSystemTheme = (dark: boolean) => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: dark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    setSystemTheme(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("uses a saved dark theme and exposes the next action", () => {
    window.localStorage.setItem("theme", "dark");

    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("button", { name: "切换到浅色模式" })).toBeInTheDocument();
  });

  it("defaults to dark even when the system prefers light", () => {
    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("uses a saved light theme", () => {
    window.localStorage.setItem("theme", "light");

    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(screen.getByRole("button", { name: "切换到深色模式" })).toBeInTheDocument();
  });

  it("switches theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "切换到浅色模式" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("keeps working when browser storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    const user = userEvent.setup();

    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "切换到浅色模式" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
