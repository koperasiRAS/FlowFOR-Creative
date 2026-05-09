"use client";

import { useState, useEffect, useCallback } from "react";
import { Hash, Copy, Check, Loader2, Zap, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import type { ContentCalendarEntry } from "./GeneratorDashboard";

interface HashtagResult {
  platforms: {
    [platform: string]: {
      hashtags: string[];
      count: number;
      strategy: string;
    };
  };
  allTags: string[];
  totalCount: number;
  viralityScore: number;
  tips: string[];
}

interface HashtagGeneratorProps {
  productName: string;
  description: string;
  contentType: string;
  targetAudience?: string;
  platforms?: string[];
}

const PLATFORM_META: Record<string, { color: string; bg: string; short: string }> = {
  Instagram: { color: "text-pink-600", bg: "bg-pink-100", short: "IG" },
  TikTok: { color: "text-black", bg: "bg-black", short: "TT" },
  YouTube: { color: "text-red-600", bg: "bg-red-100", short: "YT" },
  WhatsApp: { color: "text-green-600", bg: "bg-green-100", short: "WA" },
};

function ViralityBadge({ score }: { score: number }) {
  const label = score >= 80 ? "🔥 Super Viral" : score >= 60 ? "⚡ Viral" : score >= 40 ? "💡 Moderate" : "📊 Basic";
  const colorClass = score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
      <TrendingUp size={10} />
      {label} · {score}/100
    </span>
  );
}

function PlatformTab({
  platform,
  isActive,
  onClick,
  count,
}: {
  platform: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) {
  const meta = PLATFORM_META[platform] ?? { color: "text-gray-600", bg: "bg-gray-100", short: platform };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive
          ? `${meta.bg} ${meta.color} shadow-sm`
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
      }`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${meta.bg}`}>
        {meta.short}
      </span>
      {platform}
      <span className="text-[10px] opacity-70">{count}</span>
    </button>
  );
}

export default function HashtagGenerator({
  productName,
  description,
  contentType,
  targetAudience,
  platforms,
}: HashtagGeneratorProps) {
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<string>("Instagram");
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, description, contentType, targetAudience, platforms }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      const data = await res.json();
      setResult(data);
      const firstPlatform = Object.keys(data.platforms ?? {})[0];
      if (firstPlatform) setActivePlatform(firstPlatform);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate hashtag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    showToast("Hashtag disalin!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const all = result.allTags.join(" ");
    navigator.clipboard.writeText(all).catch(() => {});
    setCopied("all");
    showToast("Semua hashtag disalin!");
    setTimeout(() => setCopied(null), 2000);
  };

  const platformEntries = result ? Object.entries(result.platforms) : [];
  const activeData = result?.platforms[activePlatform];
  const allPlatformCount = platformEntries.length;

  return (
    <div className="glass-card p-5 lg:col-span-2 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Tools
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <Hash size={14} className="text-orange-500" />
            Hashtag Generator
          </h3>
          {result && (
            <span className="text-[10px] text-gray-400">
              {result.totalCount} hashtags · {allPlatformCount} platform
            </span>
          )}
        </div>
        {result?.viralityScore !== undefined && (
          <ViralityBadge score={result.viralityScore} />
        )}
      </div>

      {/* Generate Button */}
      {!result && !isLoading && !error && (
        <div className="text-center py-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
            <Hash size={28} className="text-orange-300" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Generate hashtag yang di-optimize untuk viral
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
          >
            <Zap size={14} />
            Generate Hashtags
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-10 space-y-3">
          <Loader2 size={32} className="animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mencari hashtag yang paling relevant dan viral...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          {/* Platform Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {platformEntries.map(([platform]) => (
              <PlatformTab
                key={platform}
                platform={platform}
                isActive={activePlatform === platform}
                onClick={() => setActivePlatform(platform)}
                count={result.platforms[platform]?.count ?? 0}
              />
            ))}
          </div>

          {/* Active platform hashtags */}
          {activeData && (
            <div className="space-y-3">
              {/* Strategy note */}
              <div className="bg-orange-50/50 dark:bg-orange-900/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  📌 Strategy
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {activeData.strategy}
                </p>
              </div>

              {/* Hashtag grid */}
              <div className="flex flex-wrap gap-2">
                {activeData.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Copy this platform */}
              <button
                onClick={() => handleCopy(activeData.hashtags.join(" "), `platform-${activePlatform}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
              >
                {copied === `platform-${activePlatform}` ? (
                  <><Check size={12} /> Disalin!</>
                ) : (
                  <><Copy size={12} /> Copy semua #{activePlatform}</>
                )}
              </button>
            </div>
          )}

          {/* All Tags Section */}
          <div className="border-t border-gray-100 dark:border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                All Hashtags ({result.allTags.length})
              </p>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all"
              >
                {copied === "all" ? <Check size={10} /> : <Copy size={10} />}
                Copy All
              </button>
            </div>
            <div className="p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed break-words">
                {result.allTags.join(" ")}
              </p>
            </div>
          </div>

          {/* Tips Section */}
          {result.tips && result.tips.length > 0 && (
            <div className="border-t border-gray-100 dark:border-white/10 pt-3">
              <button
                onClick={() => setExpandedTip(!expandedTip)}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-full justify-between"
              >
                <span>💡 Tips Penggunaan Hashtag</span>
                {expandedTip ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expandedTip && (
                <ul className="mt-2 space-y-1.5 animate-slide-up">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Regenerate */}
          <div className="text-center pt-2">
            <button
              onClick={handleGenerate}
              className="text-[11px] text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium transition-colors"
            >
              🔄 Generate ulang dengan variasi berbeda
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white px-5 py-2 rounded-full text-xs font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}