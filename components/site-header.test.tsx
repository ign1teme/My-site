import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("keeps the established navigation labels and destinations", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "枝海" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "博客" })).toHaveAttribute("href", "/#blog");
    expect(screen.getByRole("link", { name: "小说" })).toHaveAttribute("href", "/#novel");
    expect(screen.getByRole("link", { name: "关于" })).toHaveAttribute("href", "/#about");
    expect(screen.getByRole("button", { name: "切换到深色模式" })).toBeInTheDocument();
  });
});
