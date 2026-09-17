import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  currentTheme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  currentAudioTrack: string;
  setAudioTrack: (track: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('dear_us_theme');
    return (saved as Theme) || 'dark';
  });

  const [currentAudioTrack, setAudioTrack] = useState<string>(() => {
    return localStorage.getItem('dear_us_audio_track') || 'romantic-ambient';
  });

  useEffect(() => {
    localStorage.setItem('dear_us_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dear_us_audio_track', currentAudioTrack);
  }, [currentAudioTrack]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme: theme,
        toggleTheme,
        setTheme,
        currentAudioTrack,
        setAudioTrack,
      }}
    >
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
