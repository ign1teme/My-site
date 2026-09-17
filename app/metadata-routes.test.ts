import { describe, expect, it } from "vitest";
import robots, { dynamic as robotsDynamic } from "./robots";
import sitemap, { dynamic as sitemapDynamic } from "./sitemap";

describe("static metadata routes", () => {
  it("marks robots and sitemap as static-export compatible", () => {
    expect(robotsDynamic).toBe("force-static");
    expect(sitemapDynamic).toBe("force-static");
  });

  it("publishes the canonical host and all content routes", () => {
    expect(robots().host).toBe("https://hanam7.win");
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://hanam7.win/");
    expect(urls).toContain("https://hanam7.win/blog/2026-04-02-launch");
    expect(urls).toContain("https://hanam7.win/novel/sodoma/001");
    expect(sitemap().find((entry) => entry.url.endsWith("2026-04-02-launch"))?.lastModified).toBeInstanceOf(Date);
  });
});
