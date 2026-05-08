"use client";

import { Calendar } from "lucide-react";
import type { HistoryItem } from "./GeneratorDashboard";

interface HistoryPanelProps {
  onBack: () => void;
  history?: HistoryItem[];
  onLoadCampaign?: (item: HistoryItem) => void;
  onDeleteCampaign?: (id: string) => void;
}

export default function HistoryPanel({
  onBack,
  history = [],
  onLoadCampaign,
  onDeleteCampaign,
}: HistoryPanelProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Baru saja";
    if (hours < 24) return `${hours} jam lalu`;
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
      >
        ← Kembali ke Generator
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Riwayat Campaign</h2>
          <p className="text-sm text-gray-400">{history.length} campaign tersimpan</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada campaign tersimpan</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate campaign untuk memulai menyimpan histori
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {item.contentType}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => onLoadCampaign?.(item)}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-200 transition-colors whitespace-nowrap"
              >
                Muat Ulang
              </button>
              <button
                onClick={() => onDeleteCampaign?.(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Hapus"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}