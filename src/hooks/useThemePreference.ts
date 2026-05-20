import { useEffect, useState } from "react";

export type ThemeName = "pine" | "pine-dark";

const THEME_STORAGE_KEY = "camping-checklist-theme";

function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") {
    return "pine";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "pine" || storedTheme === "pine-dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "pine-dark" : "pine";
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "pine-dark");
  document.documentElement.classList.toggle("light", theme === "pine");
}

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    isDark: theme === "pine-dark",
    toggleTheme: () => {
      setTheme((currentTheme) => (currentTheme === "pine" ? "pine-dark" : "pine"));
    },
  };
}
