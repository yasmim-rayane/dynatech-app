import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void };

const ThemeCtx = createContext<Ctx>({ theme: "light", toggle: () => {} });

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("dynatech_theme") as Theme | null;
    if (saved === "dark" || saved === "light") return saved;
    
    // Verifica o tema nativo do sistema do usuário
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Salva no localStorage sempre que o tema mudar
  useEffect(() => {
    localStorage.setItem("dynatech_theme", theme);
  }, [theme]);

  // Escuta as mudanças de tema do sistema operacional em tempo real
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    // Suporte para navegadores e webviews mais recentes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  
  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
