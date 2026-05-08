"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { AppSettings } from "./SettingsContext";

interface SettingsPanelProps {
  onBack: () => void;
  settings?: AppSettings;
  onSettingsChange?: (settings: AppSettings) => void;
}

const LANGUAGES = [
  { label: "Bahasa Indonesia", value: "id" },
  { label: "English", value: "en" },
];

const COPY_LENGTHS = [
  { label: "Short (150 kata)", value: "short" },
  { label: "Medium (250 kata)", value: "medium" },
  { label: "Long (400 kata)", value: "long" },
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "WhatsApp"];

export default function SettingsPanel({
  onBack,
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const [language, setLanguage] = useState(settings?.language ?? "id");
  const [copyLength, setCopyLength] = useState(settings?.copyLength ?? "short");
  const [platforms, setPlatforms] = useState<string[]>(
    settings?.platforms ?? ["Instagram", "TikTok"]
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync when settings prop changes from outside
  useEffect(() => {
    if (settings) {
      setLanguage(settings.language ?? "id");
      setCopyLength(settings.copyLength ?? "short");
      setPlatforms(settings.platforms ?? ["Instagram", "TikTok"]);
    }
  }, [settings]);

  const persist = (patch: Partial<AppSettings>) => {
    const next: AppSettings = {
      language,
      copyLength,
      platforms,
      ...patch,
    };
    onSettingsChange?.(next);
  };

  const togglePlatform = (p: string) => {
    const next = platforms.includes(p)
      ? platforms.filter((x) => x !== p)
      : [...platforms, p];
    setPlatforms(next);
    persist({ platforms: next });
  };

  const handleClearAll = () => {
    localStorage.removeItem("flowfor_history");
    localStorage.removeItem("flowfor_settings");
    setShowClearConfirm(false);
    // Reset to defaults
    setLanguage("id");
    setCopyLength("short");
    setPlatforms(["Instagram", "TikTok"]);
    onSettingsChange?.({ language: "id", copyLength: "short", platforms: ["Instagram", "TikTok"] });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
      >
        ← Kembali ke Generator
      </button>

      <h2 className="text-lg font-bold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Output Language */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Output Language</h3>
          <div className="flex gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => {
                  setLanguage(l.value);
                  persist({ language: l.value });
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  language === l.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sales Copy Length */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sales Copy Length</h3>
          <div className="flex gap-2 flex-wrap">
            {COPY_LENGTHS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setCopyLength(c.value);
                  persist({ copyLength: c.value });
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  copyLength === c.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default Platforms */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Platform</h3>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  platforms.includes(p)
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Clear All History */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Data</h3>
          {showClearConfirm ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-700 flex-1">Yakin hapus semua histori?</p>
              <button
                onClick={handleClearAll}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                Ya
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-600 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Clear All History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
