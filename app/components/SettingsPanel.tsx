"use client";

import { useState, useRef } from "react";
import { Trash2, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface SettingsPanelProps {
  onBack: () => void;
}

export default function SettingsPanel({ onBack }: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "success" | "error">("idle");
  const [restoreMessage, setRestoreMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Backup ----
  const handleBackup = () => {
    const historyData = localStorage.getItem("flowfor_history") || "[]";
    const settingsData = localStorage.getItem("flowfor_settings") || "{}";
    const payload = JSON.stringify(
      {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        history: JSON.parse(historyData),
        settings: JSON.parse(settingsData),
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FlowFOR_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- Restore ----
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        if (parsed.history && Array.isArray(parsed.history)) {
          localStorage.setItem("flowfor_history", JSON.stringify(parsed.history));
        }
        if (parsed.settings && typeof parsed.settings === "object") {
          localStorage.setItem("flowfor_settings", JSON.stringify(parsed.settings));
        }

        setRestoreStatus("success");
        setRestoreMessage(`✅ Berhasil restore ${parsed.history?.length ?? 0} campaign. Halaman akan dimuat ulang…`);
        setTimeout(() => window.location.reload(), 2000);
      } catch {
        setRestoreStatus("error");
        setRestoreMessage("❌ File tidak valid. Pastikan kamu menggunakan file backup dari FlowFOR Creative.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Clear All ----
  const handleClearAll = () => {
    localStorage.removeItem("flowfor_history");
    localStorage.removeItem("flowfor_settings");
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 dark:text-purple-400 dark:hover:text-purple-300"
      >
        ← Kembali ke Generator
      </button>

      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">⚙️ Settings & Data Management</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Kelola riwayat campaign dan pengaturan akun kamu di sini.
      </p>

      <div className="space-y-5">

        {/* Backup Data */}
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Download size={17} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Backup Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
                Download semua riwayat campaign + pengaturan ke file JSON. Gunakan ini sebelum clear data atau berpindah perangkat.
              </p>
              <button
                onClick={handleBackup}
                className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors active:scale-95"
              >
                <Download size={14} />
                Download Backup (.json)
              </button>
            </div>
          </div>
        </div>

        {/* Restore Data */}
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Upload size={17} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Restore Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
                Pulihkan riwayat campaign dari file backup (.json) yang pernah kamu download sebelumnya.
              </p>

              {restoreStatus !== "idle" && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3 ${
                  restoreStatus === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {restoreStatus === "success"
                    ? <CheckCircle size={13} />
                    : <AlertCircle size={13} />
                  }
                  {restoreMessage}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="cursor-pointer flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors active:scale-95 w-fit"
              >
                <Upload size={14} />
                Pilih File Backup
              </label>
            </div>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={17} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Hapus Semua Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
                Hapus seluruh riwayat campaign dari browser. Tindakan ini <strong>tidak bisa dibatalkan</strong>. Buat backup dulu sebelum melanjutkan.
              </p>

              {showClearConfirm ? (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-xs text-red-700 dark:text-red-400 flex-1">⚠️ Yakin hapus semua data?</p>
                  <button
                    onClick={handleClearAll}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-all"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95"
                >
                  <Trash2 size={14} />
                  Clear All Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 tracking-wide">
            Powered by FlowFOR #JuaraVibeCoding
          </p>
        </div>
      </div>
    </div>
  );
}
