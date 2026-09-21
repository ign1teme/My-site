import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("homepage", () => {
  it("introduces the journal with one clear page heading", () => {
    render(<Home />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("文字是枝，思想是海。");
    expect(screen.getByRole("heading", { name: "最近写下" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "小说与长篇" })).toBeInTheDocument();
  });

  it("uses the generated editorial artwork as meaningful imagery", () => {
    render(<Home />);

    expect(screen.getByAltText("冰面将融的北方湖泊，一枝树影伸向水面")).toBeInTheDocument();
    expect(screen.getByAltText("《无神之明》封面：天神之明")).toBeInTheDocument();
    expect(screen.getByAltText("春日融雪汇入河流的插画")).toBeInTheDocument();
  });
});
