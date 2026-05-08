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
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("flowfor_settings");
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    try {
      localStorage.setItem("flowfor_settings", JSON.stringify(next));
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}