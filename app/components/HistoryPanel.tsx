"use client";

import { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import type { HistoryItem } from "./GeneratorDashboard";

interface HistoryPanelProps {
  onBack: () => void;
  history?: HistoryItem[];
  searchQuery?: string;
  onLoadCampaign?: (item: HistoryItem) => void;
  onDeleteCampaign?: (id: string) => void;
}

export default function HistoryPanel({
  onBack,
  history = [],
  searchQuery = "",
  onLoadCampaign,
  onDeleteCampaign,
}: HistoryPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!mounted) return "";
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

  // Highlight matching text
  const highlight = (text: string) => {
    if (!searchQuery.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const isEmpty = history.length === 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
      >
        ← Kembali ke Generator
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            📁 Project Campaign
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {isSearching
              ? `${history.length} hasil untuk "${searchQuery}"`
              : `${history.length} campaign tersimpan`}
          </p>
        </div>

        {isSearching && (
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full">
            <Search size={12} />
            Menyaring hasil...
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            {isSearching
              ? <Search size={28} className="text-gray-300 dark:text-gray-600" />
              : <Calendar size={28} className="text-gray-300 dark:text-gray-600" />
            }
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {isSearching ? `Tidak ada campaign yang cocok dengan "${searchQuery}"` : "Belum ada campaign tersimpan"}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {isSearching ? "Coba kata kunci yang berbeda" : "Generate campaign untuk memulai menyimpan histori"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {item.contentType === "Produk Digital" ? "💻" :
                   item.contentType === "Jasa/Service" ? "🎯" :
                   item.contentType === "Event/Webinar" ? "📅" :
                   item.contentType === "Affiliate/Review" ? "🔗" :
                   item.contentType === "Konten Edukasi" ? "🎬" :
                   item.contentType === "Konten Monetisasi" ? "💰" :
                   item.contentType === "Podcast/Audio" ? "🎙️" : "✨"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {highlight(item.productName)}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                    {highlight(item.contentType)}
                  </span>
                  {item.targetAudience && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                      {highlight(item.targetAudience)}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs text-gray-400 dark:text-gray-500 hidden md:block whitespace-nowrap">
                {formatDate(item.createdAt)}
              </span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onLoadCampaign?.(item)}
                  className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-700 active:scale-95 transition-all whitespace-nowrap shadow-sm"
                >
                  Muat
                </button>
                <button
                  onClick={() => onDeleteCampaign?.(item.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Hapus campaign"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
