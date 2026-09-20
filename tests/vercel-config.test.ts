import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Vercel response headers", () => {
  it("protects all paths without blocking Next.js inline bootstrap scripts", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8"));
    const rule = config.headers.find((entry: { source: string }) => entry.source === "/(.*)");
    const headers = Object.fromEntries(
      rule.headers.map((entry: { key: string; value: string }) => [entry.key, entry.value]),
    );

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("base-uri 'self'");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).not.toContain("script-src");
  });
});
