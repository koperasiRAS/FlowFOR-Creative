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
}: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    localStorage.removeItem("flowfor_history");
    localStorage.removeItem("flowfor_settings");
    setShowClearConfirm(false);
    // Reload page to clear all states simply
    window.location.reload();
  };

  const handleBackup = () => {
    const historyData = localStorage.getItem("flowfor_history") || "[]";
    const blob = new Blob([historyData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FlowFOR_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 dark:text-purple-400 dark:hover:text-purple-300"
      >
        ← Kembali ke Generator
      </button>

      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Settings & Data Management</h2>

      <div className="space-y-6">
        {/* Backup Data */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/10">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Backup Data</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Download riwayat campaign kamu ke dalam file JSON agar tidak hilang.</p>
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 text-sm text-purple-600 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            📥 Download Backup (JSON)
          </button>
        </div>

        {/* Clear All History */}
        <div className="pt-4 border-t border-gray-100 dark:border-white/10">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Hapus Data</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Tindakan ini akan menghapus semua riwayat campaign dari browser kamu.</p>
          {showClearConfirm ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-400 flex-1">Yakin hapus semua histori?</p>
              <button
                onClick={handleClearAll}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                Ya
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
