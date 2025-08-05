import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type Contrast = "normal" | "high";

type ThemeContextType = {
  theme: Theme;
  contrast: Contrast;
  toggleTheme: () => void;
  toggleContrast: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [contrast, setContrast] = useState<Contrast>("normal");

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedContrast = localStorage.getItem("contrast") as Contrast;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedContrast) setContrast(savedContrast);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("high-contrast", contrast === "high");
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("contrast", contrast);
  }, [theme, contrast]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleContrast = () => {
    setContrast(prev => prev === "normal" ? "high" : "normal");
  };

  return (
    <ThemeContext.Provider value={{ theme, contrast, toggleTheme, toggleContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
