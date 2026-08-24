import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'slate' | 'warm' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'slate',
  setTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('civic_theme_mode');
    return (saved as ThemeMode) || 'slate';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('civic_theme_mode', mode);
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-slate', 'theme-warm', 'dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'warm') {
      root.classList.add('theme-warm');
    } else {
      root.classList.add('theme-slate');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
