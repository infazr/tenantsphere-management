import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'ocean' | 'emerald' | 'sunset' | 'rose' | 'slate';

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = 'ems-theme-mode';
const THEME_COLOR_KEY = 'ems-theme-color';

export const themeColors: Record<ThemeColor, { name: string; preview: string }> = {
  ocean: { name: 'Ocean Blue', preview: 'hsl(210, 100%, 50%)' },
  emerald: { name: 'Emerald', preview: 'hsl(160, 84%, 39%)' },
  sunset: { name: 'Sunset', preview: 'hsl(25, 95%, 53%)' },
  rose: { name: 'Rose', preview: 'hsl(350, 89%, 60%)' },
  slate: { name: 'Slate', preview: 'hsl(215, 20%, 45%)' },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_MODE_KEY);
    return (stored as ThemeMode) || 'light';
  });

  const [color, setColorState] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem(THEME_COLOR_KEY);
    return (stored as ThemeColor) || 'ocean';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply mode
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all color classes
    root.classList.remove('theme-ocean', 'theme-emerald', 'theme-sunset', 'theme-rose', 'theme-slate');
    
    // Apply new color
    root.classList.add(`theme-${color}`);
    localStorage.setItem(THEME_COLOR_KEY, color);
  }, [color]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const setColor = useCallback((newColor: ThemeColor) => {
    setColorState(newColor);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, color, setMode, setColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
