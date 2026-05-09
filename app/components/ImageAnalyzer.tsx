"use client";

import { useState, useCallback, useRef } from "react";
import { ImageIcon, Upload, Loader2, Copy, Check, X, Sparkles } from "lucide-react";
import Image from "next/image";
import { useSettings } from "./SettingsContext";

interface ImageAnalysisResult {
  visualTheme: string;
  contentCategory: string;
  suggestedNiche: string;
  hookIdeas: string[];
  captionSuggestion: string;
  hashtagSuggestions: string[];
  platformRecommendation: string;
  colorPalette: string[];
  visualStrength: string;
  visualImprovement: string;
  campaignAngle: string;
}

const PLATFORM_ICON: Record<string, string> = {
  "Instagram Reels": "IG",
  TikTok: "TT",
  "YouTube Shorts": "YT",
  "WhatsApp Status": "WA",
};

const PLATFORM_STYLE: Record<string, { bg: string; text: string }> = {
  "Instagram Reels": { bg: "bg-pink-100", text: "text-pink-700" },
  TikTok: { bg: "bg-black", text: "text-white" },
  "YouTube Shorts": { bg: "bg-red-100", text: "text-red-700" },
  "WhatsApp Status": { bg: "bg-green-100", text: "text-green-700" },
};

export default function ImageAnalyzer({
  productName = "",
  contentType = "Produk Digital",
}: {
  productName?: string;
  contentType?: string;
}) {
  const { isDark } = useSettings();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hooks" | "caption" | "strategy">("hooks");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Hanya format JPEG, PNG, atau WebP yang didukung.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageData(dataUrl);
      setPreview(dataUrl);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!imageData) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          productContext: productName,
          contentType,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      const data: ImageAnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menganalisa gambar");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedItem(label);
    showToast(`${label} disalin!`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="glass-card p-5 lg:col-span-2 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Vision AI
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <ImageIcon size={14} className="text-indigo-500" />
            AI Image Analyzer
          </h3>
        </div>
        {preview && (
          <button
            onClick={clearImage}
            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={10} /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Upload Zone */}
        <div>
          {!preview ? (
            <label
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                ${isDark ? "border-white/20 hover:border-indigo-400/50 bg-slate-800/30" : "border-gray-200 hover:border-indigo-400/50 bg-gray-50/50"}`}
            >
              <Upload size={28} className={`mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                Drag & drop gambar produkmu di sini, atau klik untuk pilih file
              </p>
              <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP · Maks 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={preview!}
                alt="Preview"
                fill
                className="object-cover rounded-2xl"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Analyze Button */}
          {preview && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !imageData}
              className="w-full mt-3 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={12} className="animate-spin" /> Menganalisa visual...</>
              ) : (
                <><Sparkles size={12} /> Analisa dengan AI</>
              )}
            </button>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          {!result && !isLoading && !error && (
            <div className={`h-52 flex flex-col items-center justify-center rounded-2xl ${isDark ? "bg-slate-800/30" : "bg-gray-50/50"}`}>
              <ImageIcon size={32} className={`mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
              <p className="text-xs text-gray-400 text-center">
                Upload gambar dan klik &quot;Analisa dengan AI&quot;<br />untuk mendapatkan insights campaign
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-52 flex flex-col items-center justify-center rounded-2xl bg-gray-50/50 dark:bg-slate-800/30">
              <Loader2 size={28} className="animate-spin text-indigo-500 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">AI sedang analisa visual...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-3 animate-slide-up">
              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5">
                {result.colorPalette.slice(0, 3).map((c) => (
                  <span key={c} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                    {c}
                  </span>
                ))}
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_STYLE[result.platformRecommendation]?.bg ?? "bg-gray-100"} ${PLATFORM_STYLE[result.platformRecommendation]?.text ?? "text-gray-600"}`}>
                  {PLATFORM_ICON[result.platformRecommendation] ?? result.platformRecommendation}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {result.contentCategory}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-1">
                {(["hooks", "caption", "strategy"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab === "hooks" ? "🎣 Hooks" : tab === "caption" ? "✍️ Caption" : "🎯 Strategy"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "hooks" && (
                <div className="space-y-2">
                  {result.hookIdeas?.map((hook, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl p-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[9px] font-black text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed flex-1">{hook}</p>
                      <button
                        onClick={() => copyToClipboard(hook, `Hook ${i + 1}`)}
                        className="text-[9px] text-indigo-400 hover:text-indigo-600 flex-shrink-0"
                      >
                        {copiedItem === `Hook ${i + 1}` ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "caption" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50/50 dark:bg-slate-800/50 rounded-xl p-3">
                    {result.captionSuggestion}
                  </p>
                  <button
                    onClick={() => copyToClipboard(result.captionSuggestion, "Caption")}
                    className="w-full h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedItem === "Caption" ? <><Check size={10} /> Disalin!</> : <><Copy size={10} /> Copy Caption</>}
                  </button>
                </div>
              )}

              {activeTab === "strategy" && (
                <div className="space-y-2">
                  {[
                    { label: "💡 Tema Visual", text: result.visualTheme },
                    { label: "🏷️ Suggested Niche", text: result.suggestedNiche },
                    { label: "📐 Campaign Angle", text: result.campaignAngle },
                    { label: "⚡ Strength", text: result.visualStrength },
                    { label: "🔧 Improvement", text: result.visualImprovement },
                  ].map(({ label, text }) => (
                    <div key={label} className="flex items-start gap-2 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl p-2.5">
                      <p className="text-[9px] font-bold text-gray-400 flex-shrink-0 mt-0.5 w-24">{label}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed flex-1">{text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              <div className="pt-1">
                <p className="text-[9px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                  <span>#️⃣</span> Hashtag Suggestions
                  <button
                    onClick={() => copyToClipboard(result.hashtagSuggestions.join(" "), "Hashtags")}
                    className="ml-auto text-[9px] text-indigo-400 hover:text-indigo-600"
                  >
                    {copiedItem === "Hashtags" ? <Check size={10} /> : <Copy size={10} />}
                  </button>
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.hashtagSuggestions?.map((tag) => (
                    <span key={tag} className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}
