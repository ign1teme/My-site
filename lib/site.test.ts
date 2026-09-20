import { describe, expect, it } from "vitest";
import { absoluteUrl, parseContentDate, siteConfig } from "./site";

describe("site configuration", () => {
  it("uses the canonical hanam7.win origin", () => {
    expect(siteConfig.url).toBe("https://hanam7.win");
    expect(siteConfig.name).toBe("枝海");
  });

  it("builds canonical URLs without duplicate slashes", () => {
    expect(absoluteUrl("/novel/sodoma")).toBe("https://hanam7.win/novel/sodoma");
    expect(absoluteUrl("blog/example")).toBe("https://hanam7.win/blog/example");
  });

  it("only accepts real ISO calendar dates for metadata", () => {
    expect(parseContentDate("2026-04-02")?.toISOString()).toBe("2026-04-02T00:00:00.000Z");
    expect(parseContentDate("")).toBeUndefined();
    expect(parseContentDate("not-a-date")).toBeUndefined();
    expect(parseContentDate("2026-02-30")).toBeUndefined();
  });
});
