import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { celestialTransition, isCelestialRunning } from "../lib/celestialTransition";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const META_COLOR: Record<Theme, string> = { light: "#e8e0d3", dark: "#1a1612" };

interface ThemeContextValue {
  theme: Theme;
  /** Flip the theme with a sunrise (→ light) or moonrise (→ dark). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStored = (): Theme | null => {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

/** The inline script in index.html already set data-theme; start from it. */
const initialTheme = (): Theme => {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return readStored() ?? systemTheme();
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", META_COLOR[theme]);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => applyTheme(theme), [theme]);

  // Follow the OS setting until the visitor makes an explicit choice.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!readStored()) setTheme(mql.matches ? "light" : "dark");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback<ThemeContextValue["toggleTheme"]>(
    () => {
      if (isCelestialRunning()) return; // one sunrise at a time
      const next: Theme = theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage blocked — the choice just won't persist */
      }

      const commit = () => {
        flushSync(() => setTheme(next));
        applyTheme(next);
      };

      celestialTransition(next === "light" ? "sun" : "moon", commit);
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};

/** Hex colours for canvas/WebGL code, which can't read CSS variables. */
export const PALETTE = {
  dark: {
    canvas: "#1a1612",
    surface: "#241e19",
    raised: "#2f2822",
    ink: "#f4ede3",
    accent: "#dcb077",
    accentSoft: "#ecdcc0",
    particles: "#f4ede3",
  },
  light: {
    canvas: "#e8e0d3",
    surface: "#f0eadf",
    raised: "#ddd3c3",
    ink: "#2b2219",
    accent: "#c08a45",
    accentSoft: "#8a5a1c",
    particles: "#8a5a1c",
  },
} as const;

export const usePalette = () => PALETTE[useTheme().theme];
