import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeId } from '../types/theme';
import { THEMES } from '../constants/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (id: ThemeId) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('neon-mindspace');

  useEffect(() => {
    const saved = localStorage.getItem('aminos_theme');
    if (saved && THEMES.find(t => t.id === saved)) {
      setCurrentThemeId(saved as ThemeId);
    }
  }, []);

  const setTheme = (id: ThemeId) => {
    setCurrentThemeId(id);
    localStorage.setItem('aminos_theme', id);
  };

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
