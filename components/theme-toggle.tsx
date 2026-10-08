"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  try {
    const saved = window.localStorage.getItem("theme");
    if (saved === "light") return "light";
  } catch {
    // Storage may be disabled by privacy settings; the site falls back to its dark default.
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // Applying the theme should not depend on storage being available.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "dark" ? "切换到深色模式" : "切换到浅色模式";

  const toggleTheme = () => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  };

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={label}>
      <span className="theme-toggle__glyph" data-shown={theme === "light"} aria-hidden="true">昼</span>
      <span className="theme-toggle__glyph" data-shown={theme === "dark"} aria-hidden="true">夜</span>
    </button>
  );
}
