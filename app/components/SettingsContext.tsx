"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AppSettings {
  language: string;       // "id" | "en"
  copyLength: string;     // "short" | "medium" | "long"
  platforms: string[];     // e.g. ["Instagram", "TikTok"]
}

const DEFAULT_SETTINGS: AppSettings = {
  language: "id",
  copyLength: "short",
  platforms: ["Instagram", "TikTok"],
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (next: AppSettings) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  isDark: false,
  toggleTheme: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("flowfor_settings");
      if (raw) setSettings(JSON.parse(raw));
      
      const savedTheme = localStorage.getItem("flowfor_theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("flowfor_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("flowfor_theme", "light");
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    try {
      localStorage.setItem("flowfor_settings", JSON.stringify(next));
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isDark, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}