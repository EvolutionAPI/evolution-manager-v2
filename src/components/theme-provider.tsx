/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light";

        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
      };

      applySystemTheme();
      mediaQuery.addEventListener("change", applySystemTheme);

      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    }

    root.classList.add(theme);
    setResolvedTheme(theme);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
