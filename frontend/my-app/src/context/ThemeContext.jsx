import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  themeOptions,
  useSettings,
} from "./SettingsContext";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const {
    settings,
    updateSettings,
    setSettings,
    tone,
  } = useSettings();

  const setTheme = useCallback((theme) => {
    setSettings((current) => ({
      ...current,
      theme,
    }));

    updateSettings(
      {
        theme,
      },
      {
        localOnly: true,
        silentSound: true,
      }
    );
  }, [setSettings, updateSettings]);

  const setDarkMode = useCallback((darkMode) => {
    setSettings((current) => ({
      ...current,
      darkMode,
    }));

    updateSettings(
      {
        darkMode,
      },
      {
        localOnly: true,
        silentSound: true,
      }
    );
  }, [setSettings, updateSettings]);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      setTheme,
      darkMode: settings.darkMode,
      setDarkMode,
      themes: themeOptions,
      tone,
    }),
    [setDarkMode, setTheme, settings.darkMode, settings.theme, tone]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
