import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function luminance(oklch: string) {
  const match = oklch.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
  if (!match) throw new Error(`Invalid OKLCH color: ${oklch}`);
  const [, lightness, chroma, hue] = match.map(Number);
  const a = chroma * Math.cos(hue * Math.PI / 180);
  const b = chroma * Math.sin(hue * Math.PI / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const red = Math.max(0, Math.min(1, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s));
  const green = Math.max(0, Math.min(1, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s));
  const blue = Math.max(0, Math.min(1, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("editorial palette", () => {
  it("keeps small text readable on canvas and both surface levels", () => {
    const css = readFileSync("app/globals.css", "utf8");
    for (const selector of [":root", ':root[data-theme="dark"]']) {
      const block = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]+)\\}`))?.[1];
      expect(block).toBeDefined();
      const token = (name: string) => block?.match(new RegExp(`--${name}: (oklch\\([^)]+\\))`))?.[1] ?? "";
      for (const background of ["canvas", "surface", "surface-raised"]) {
        for (const foreground of ["ink", "ink-soft", "ink-faint", "accent"]) {
          expect(contrast(token(foreground), token(background)), `${selector} ${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
