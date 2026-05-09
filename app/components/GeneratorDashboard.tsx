"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Loader2,
  Copy,
  Check,
  Smartphone,
  AlertCircle,
  Sparkles,
  X,
  Share2,
  Download,
  Package,
} from "lucide-react";
import Image from "next/image";

import ContentCalendar from "./ContentCalendar";
import { useSettings } from "./SettingsContext";
import { exportCampaignToZip, type ExportData } from "@/lib/zipExporter";
import { generateCampaignPDF, type PDFData } from "@/lib/pdfExporter";
import ScoreBreakdown from "./ScoreBreakdown";

// ==============================================
// TYPES
// ==============================================
interface StoryboardItem {
  shot: string;
  visual: string;
  audio: string;
}

interface VibeScoreData {
  score: number;
  label: string;
  reasons: string[];
}

export interface GenerateResult {
  landingPage: string;
  caption: string;
  broadcast: string;
  todoList: string[];
  storyboard: StoryboardItem[];
  vibeScore: VibeScoreData;
  contentCalendar?: ContentCalendarEntry[];
  shootScript?: ShootScriptData;
  nicheRecommendation?: string;
}

export interface ContentCalendarEntry {
  day: number;
  date: string;
  platform: string;
  type: string;
  topic: string;
  caption_hint: string;
}

export interface ShootScriptData {
  format: string;
  duration: string;
  scenes: {
    scene: string;
    action: string;
    dialogue: string;
    camera: string;
  }[];
  tips: string[];
}

export interface HistoryItem {
  id: string;
  productName: string;
  targetAudience: string;
  contentType: string;
  result: GenerateResult;
  createdAt: string;
}

interface FormData {
  productName: string;
  description: string;
  contentType: string;
  interestHint?: string;
}

interface GeneratorDashboardProps {
  initialResult?: GenerateResult | null;
  onGenerateSuccess?: (
    data: GenerateResult,
    productName: string,
    targetAudience: string,
    contentType: string
  ) => void;
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

const CONTENT_TYPES = [
  { value: "Produk Digital", label: "Produk Digital" },
  { value: "Jasa/Service", label: "Jasa/Service" },
  { value: "Event/Webinar", label: "Event/Webinar" },
  { value: "Affiliate/Review", label: "Affiliate/Review" },
  { value: "Konten Edukasi", label: "Konten Edukasi" },
  { value: "Konten Monetisasi", label: "Konten Monetisasi" },
  { value: "Podcast/Audio", label: "Podcast/Audio" },
  { value: "Niche Finder", label: "Niche Finder" },
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "WhatsApp"];

function TagInput({
  tags,
  onChange,
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,$/, "");
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        onChange([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    if (disabled) return;
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`form-input !h-auto flex flex-wrap gap-2 items-center cursor-text
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && document.getElementById("tag-input-field")?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-3 py-1 text-xs font-medium animate-in fade-in slide-in-from-left-1"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </span>
      ))}
      {tags.length < 5 && (
        <input
          id="tag-input-field"
          type="text"
          placeholder={tags.length === 0 ? "Contoh: UMKM, Content Creator, Freelancer..." : "Tambah tag..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 min-w-24 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
        />
      )}
      {tags.length > 0 && (
        <span className="ml-auto text-[10px] text-gray-400">{tags.length}/5 tags</span>
      )}
    </div>
  );
}

// ==============================================
// EMPTY STATE
// ==============================================
function EmptyState() {
  return (
    <div className="col-span-2 glass-card p-10 flex flex-col items-center justify-center text-center min-h-56">
      <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-5">
        <Sparkles size={40} className="text-purple-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-2">
        Generate your first campaign
      </h3>
      <p className="text-[13px] text-gray-400 max-w-xs">
        Fill in the form and click Generate to see your AI-powered launch kit
      </p>
    </div>
  );
}

// ==============================================
// MOBILE PREVIEW MODAL
// ==============================================
function MobilePreviewModal({
  open,
  onClose,
  caption,
}: {
  open: boolean;
  onClose: () => void;
  caption: string;
}) {
  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-preview-title"
    >
      <div className="relative max-w-sm mx-auto">
        <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl">
          <div className="bg-white rounded-[32px] overflow-hidden w-72 h-[580px] flex flex-col">
            <div className="bg-gray-900 h-10 flex items-center justify-between px-6 text-white text-xs">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 rounded-sm bg-white/30" />
                <div className="w-4 h-2 rounded-sm bg-white/30" />
                <div className="w-4 h-2 rounded-sm bg-white/30" />
              </div>
            </div>
            <div className="bg-gray-900 h-6 flex justify-center items-center">
              <div className="bg-gray-900 w-24 h-5 rounded-b-2xl border border-gray-700" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400" />
                <div>
                  <div className="h-3 w-20 bg-gray-300 rounded" />
                  <div className="h-2 w-14 bg-gray-200 rounded mt-1" />
                </div>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {caption}
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <div className="h-5 w-16 bg-purple-100 rounded-full" />
                <div className="h-5 w-14 bg-purple-100 rounded-full" />
                <div className="h-5 w-20 bg-purple-100 rounded-full" />
              </div>
              <div className="mt-4 flex gap-3">
                <div className="h-20 w-20 bg-gray-200 rounded-xl" />
                <div className="h-20 w-20 bg-gray-200 rounded-xl" />
              </div>
            </div>
            <div className="bg-gray-900 h-8 flex items-center justify-center">
              <div className="w-28 h-1.5 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white bg-red-500 px-4 py-1.5 rounded-full text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ==============================================
// BENTO CARD
// ==============================================
function BentoCard({
  title,
  icon,
  content,
  colSpan = "",
  className = "",
  onCopy,
  copied,
  isLoading,
  pillBg = "bg-purple-100",
  pillText = "text-purple-700",
  pillLabel = "Card",
}: {
  title: string;
  icon: string;
  content: React.ReactNode;
  colSpan?: string;
  className?: string;
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
  pillBg?: string;
  pillText?: string;
  pillLabel?: string;
}) {
  return (
    <div className={`glass-card p-5 relative group transition-all duration-200 ${className} ${colSpan}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block ${pillBg} ${pillText} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
            {pillLabel}
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>{icon}</span> {title}
          </h3>
        </div>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600"
            title="Copy"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/6" />
        </div>
      ) : (
        <div className="text-sm text-gray-600 leading-relaxed">{content}</div>
      )}
    </div>
  );
}

// ==============================================
// TO-DO LIST CARD
// ==============================================
function ToDoListCard({
  items,
  onCopy,
  copied,
  isLoading,
  className = "",
}: {
  items: string[];
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
  className?: string;
}) {
  const [checked, setChecked] = useState<boolean[]>(() =>
    new Array(items.length).fill(false)
  );

  // Reset checked when items change
  useEffect(() => {
    setChecked(new Array(items.length).fill(false));
  }, [items]);

  return (
    <div className={`glass-card p-5 relative group transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            To-Do
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>✅</span> Launch To-Do List
          </h3>
        </div>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Belum ada todo item</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <label
              key={i}
              className="flex items-start gap-3 text-sm cursor-pointer hover:bg-purple-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-400 cursor-pointer accent-purple-500"
                checked={checked[i]}
                onChange={() => {
                  const next = [...checked];
                  next[i] = !next[i];
                  setChecked(next);
                }}
              />
              <span className={checked[i] ? "line-through text-gray-400" : "text-gray-600"}>
                {item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================
// STORYBOARD CARD
// ==============================================
function StoryboardCard({
  shots,
  onCopy,
  copied,
  isLoading,
  productName,
}: {
  shots: StoryboardItem[];
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
  productName?: string;
}) {
  const handleDownloadDoc = () => {
    if (!shots.length) return;
    const content = shots
      .map((s, i) => `SHOT ${i + 1}: ${s.shot}\nVisual: ${s.visual}\nAudio: ${s.audio}`)
      .join("\n\n");
    const text = `VISUAL STORYBOARD — ${productName || ""}\n${'='.repeat(60)}\n\n${content}`;
    const blob = new Blob([text], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Storyboard-${(productName || "Campaign").replace(/[^a-zA-Z0-9]/g, "-")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-5 relative group lg:col-span-2 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Video
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>🎬</span> Visual Storyboard
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {!isLoading && (
            <button
              onClick={handleDownloadDoc}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-2.5 py-1.5 rounded-lg
                         border border-green-300 text-green-600 hover:bg-green-50 text-xs font-medium flex items-center gap-1"
              title="Download Storyboard .doc"
            >
              <Download size={12} className="text-green-600" />
              <span>Download .doc</span>
            </button>
          )}
          {!isLoading && onCopy && (
            <button
              onClick={onCopy}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-8 w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-red-50/80 dark:bg-red-950/20">
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-red-700/80 dark:text-red-400 uppercase tracking-widest rounded-tl-xl border-b border-red-100 dark:border-red-900/30">Shot</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-red-700/80 dark:text-red-400 uppercase tracking-widest border-b border-red-100 dark:border-red-900/30">Visual</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-red-700/80 dark:text-red-400 uppercase tracking-widest rounded-tr-xl border-b border-red-100 dark:border-red-900/30">Audio</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-purple-600 whitespace-nowrap">{s.shot}</td>
                  <td className="px-3 py-2 text-gray-600">{s.visual}</td>
                  <td className="px-3 py-2 text-gray-500 italic">{s.audio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Need FileText import for storyboard button
// ==============================================
// SHOOT SCRIPT CARD
// ==============================================
function ShootScriptCard({
  script,
  isLoading,
}: {
  script?: ShootScriptData;
  isLoading: boolean;
}) {
  const handleDownloadDoc = () => {
    if (!script) return;
    const header = `SHOOT SCRIPT\nFormat: ${script.format} | Duration: ${script.duration}\n${'='.repeat(60)}\n\n`;
    const scenes = script.scenes
      .map((s, i) => `SCENE ${i + 1}: ${s.scene}\nAction: ${s.action}\nDialogue: ${s.dialogue}\nCamera: ${s.camera}`)
      .join("\n\n");
    const tips = script.tips && script.tips.length > 0
      ? `\n\n${'='.repeat(60)}\nPRODUCTION TIPS\n${script.tips.map(t => `• ${t}`).join("\n")}`
      : "";
    const blob = new Blob([header + scenes + tips], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Shoot-Script.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-5 transition-all duration-200 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-cyan-100 text-cyan-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Script
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>🎬</span> Shoot Script
          </h3>
        </div>
        {!isLoading && script && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {script.format}
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {script.duration}
            </span>
            <button
              onClick={handleDownloadDoc}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-300 text-cyan-600 hover:bg-cyan-50 text-xs font-medium flex items-center gap-1 transition-all"
              title="Download Shoot Script .doc"
            >
              <Download size={12} />
              <span>Download .doc</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-6 w-full" />
          ))}
        </div>
      ) : script ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-cyan-50/80 dark:bg-cyan-950/20">
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-cyan-700/80 dark:text-cyan-400 uppercase tracking-widest rounded-tl-xl border-b border-cyan-100 dark:border-cyan-900/30">Scene</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-cyan-700/80 dark:text-cyan-400 uppercase tracking-widest border-b border-cyan-100 dark:border-cyan-900/30">Action</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-cyan-700/80 dark:text-cyan-400 uppercase tracking-widest border-b border-cyan-100 dark:border-cyan-900/30">Dialogue</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-cyan-700/80 dark:text-cyan-400 uppercase tracking-widest rounded-tr-xl border-b border-cyan-100 dark:border-cyan-900/30">Camera</th>
              </tr>
            </thead>
            <tbody>
              {script.scenes?.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-cyan-600 whitespace-nowrap">{s.scene}</td>
                  <td className="px-3 py-2 text-gray-600">{s.action}</td>
                  <td className="px-3 py-2 text-gray-600 italic">{s.dialogue}</td>
                  <td className="px-3 py-2 text-gray-500">{s.camera}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {script.tips && script.tips.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                💡 Tips Produksi
              </p>
              <ul className="space-y-1">
                {script.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                    <span>•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Shoot script tidak tersedia.</p>
      )}
    </div>
  );
}

// ==============================================
// VIBE SCORE CARD (with circular ring + count-up)
// ==============================================
function VibeScoreCard({
  score,
  onCopy,
  copied,
  isLoading,
}: {
  score: VibeScoreData;
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
}) {
  const { isDark } = useSettings();
  const [displayScore, setDisplayScore] = useState(0);
  const colorClass = score.score <= 40 ? "text-red-500" : score.score <= 70 ? "text-yellow-500" : "text-green-500";
  const ringColorClass = score.score <= 40 ? "#ef4444" : score.score <= 70 ? "#eab308" : "#22c55e";
  const bgClass = score.score <= 40 ? "bg-red-50" : score.score <= 70 ? "bg-yellow-50" : "bg-green-50";

  // Count-up animation
  useEffect(() => {
    if (isLoading || score.score === 0) return;
    setDisplayScore(0);
    const duration = 1500;
    const startTime = Date.now();
    const target = score.score;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [score.score, isLoading]);

  // Conic gradient for ring: percentage filled with color, rest gray
  const fillDeg = (score.score / 100) * 360;
  const ringBg = `conic-gradient(${ringColorClass} 0deg ${fillDeg}deg, ${isDark ? "#334155" : "#e5e7eb"} ${fillDeg}deg 360deg)`;

  return (
    <div className="glass-card p-5 relative group lg:col-span-2 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Score
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>🔥</span> Vibe Score
          </h3>
        </div>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-24 w-24 rounded-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Circular progress ring with score */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: ringBg }}
            >
              <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center">
                <span className={`text-3xl font-black ${colorClass} leading-none`}>
                  {displayScore}
                </span>
              </div>
            </div>
            {/* "out of 100" label below */}
            <p className="text-[10px] text-center text-gray-400 mt-1">out of 100</p>
          </div>

          {/* Label + Reasons */}
          <div className="flex-1">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${bgClass} ${colorClass}`}>
              {score.label}
            </div>
            <ul className="space-y-1">
              {score.reasons.map((r, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================
// SALES PAGE CARD (with Read More toggle)
// ==============================================
function SalesPageCard({
  landingPage,
  onCopy,
  copied,
  isLoading,
}: {
  landingPage: string;
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // Strip HTML tags so AI output never leaks raw HTML like </li><li>
  const cleanText = landingPage.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, (m) => {
    const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
    return entities[m] ?? m;
  });

  const lines = cleanText.split("\n").filter((l) => l.trim());
  const firstThree = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <div className="glass-card p-5 relative group transition-all duration-200 lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Copy
          </span>
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <span>📝</span> Sales Page Copy
          </h3>
        </div>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      ) : (
        <div>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-gray-600">
            {(expanded || !hasMore) ? cleanText : firstThree.join("\n")}
          </pre>
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              {expanded ? "▲ Sembunyikan" : "▼ Lihat selengkapnya"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================
// ERROR TOAST
// ==============================================
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-3 max-w-md"
    >
      <AlertCircle size={16} />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-white/70 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  );
}

// ==============================================
// MAIN PAGE
// ==============================================
export default function GeneratorDashboard({
  initialResult,
  onGenerateSuccess,
}: GeneratorDashboardProps = {}) {
  const { settings, updateSettings, isDark } = useSettings();
  
  // ---- State ----
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    description: "",
    contentType: "Produk Digital",
  });
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(initialResult ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // ---- Watch initialResult from parent ----
  // prevRef lets us skip the initial render (undefined) and only react
  // to genuine changes: null = New Campaign, data = Load from History.
  const prevInitialResult = useRef<GenerateResult | null | undefined>(initialResult);
  useEffect(() => {
    if (prevInitialResult.current === initialResult) return; // no change
    prevInitialResult.current = initialResult;

    if (initialResult === null) {
      // New Campaign — reset all fields
      setResult(null);
      setFormData({ productName: "", description: "", contentType: "Produk Digital" });
      setTargetTags([]);
      setErrorMessage(null);
      setCopiedCard(null);
    } else if (initialResult) {
      // Load from history
      setResult(initialResult);
    }
  }, [initialResult]);


  // Dynamic Loading Text
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    "Menganalisis audiens...",
    "Meracik copywriting...",
    "Menyusun storyboard...",
    "Menghitung Vibe Score...",
    "Menyiapkan kalender konten..."
  ];

  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading, loadingTexts.length]);

  // Ref for bento grid
  const bentoGridRef = useRef<HTMLDivElement>(null);

  // ---- Handlers ----
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(
      "I just generated my launch kit with FlowFOR Creative — AI-powered Smart Launch Command Center! Try it: https://flow-for-creative.vercel.app #JuaraVibeCoding #FlowFORCreative #GeminiAI"
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fflow-for-creative.vercel.app&summary=${text}`,
      "_blank"
    );
    showToast("Opening LinkedIn...");
  };

  const handleCopy = (cardKey: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedCard(cardKey);
    showToast(
      cardKey === "storyboard"
        ? "Storyboard disalin! Paste (Ctrl+V) ke Google Docs."
        : "Copied!"
    );
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const handleExportZip = async () => {
    if (!result) return;
    showToast("Memulai export...");
    try {
      const exportData: ExportData = {
        productName: formData.productName || "Campaign",
        contentType: formData.contentType,
        landingPage: result.landingPage,
        caption: result.caption,
        broadcast: result.broadcast,
        todoList: result.todoList,
        storyboard: result.storyboard,
        vibeScore: result.vibeScore,
        contentCalendar: result.contentCalendar,
        shootScript: result.shootScript,
        nicheRecommendation: result.nicheRecommendation,
      };
      await exportCampaignToZip(exportData);
      showToast("ZIP downloaded!");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Export] Gagal export ZIP:", err);
      }
      showToast("Export gagal. Coba lagi.");
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    showToast("Membuat PDF Report...");
    try {
      const pdfData: PDFData = {
        productName: formData.productName || "Campaign",
        contentType: formData.contentType,
        targetAudience: targetAudienceValue || formData.productName,
        landingPage: result.landingPage,
        caption: result.caption,
        broadcast: result.broadcast,
        todoList: result.todoList,
        storyboard: result.storyboard,
        vibeScore: result.vibeScore,
        contentCalendar: result.contentCalendar,
        shootScript: result.shootScript,
        nicheRecommendation: result.nicheRecommendation,
        generatedAt: new Date().toISOString(),
      };
      const blob = await generateCampaignPDF(pdfData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FlowFOR-${(formData.productName || "Campaign").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("PDF Report downloaded!");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Export] Gagal export PDF:", err);
      }
      showToast("PDF export gagal. Coba lagi.");
    }
  };

  // Convert tags to comma-separated string for API
  const targetAudienceValue = targetTags.join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          description: formData.description,
          contentType: formData.contentType,
          targetAudience: targetAudienceValue || formData.productName,
          interestHint: formData.interestHint || "",
          language: settings?.language ?? "id",
          copyLength: settings?.copyLength ?? "short",
          platforms: settings?.platforms ?? ["Instagram", "TikTok"],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data: GenerateResult = await res.json();
      setResult(data);

      // Notify parent to save to history
      onGenerateSuccess?.(data, formData.productName, targetAudienceValue, formData.contentType);
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : "";
      // Map common errors to friendly Indonesian messages
      let friendlyMsg = "Terjadi kesalahan. Silakan coba lagi.";
      if (rawMsg.includes("429") || rawMsg.toLowerCase().includes("quota")) {
        friendlyMsg = "⚠️ Batas penggunaan AI tercapai. Tunggu sebentar lalu coba lagi.";
      } else if (rawMsg.includes("500") || rawMsg.includes("503")) {
        friendlyMsg = "⚠️ Server sedang sibuk. Silakan coba dalam beberapa detik.";
      } else if (rawMsg.toLowerCase().includes("network") || rawMsg.toLowerCase().includes("fetch")) {
        friendlyMsg = "🌐 Koneksi internet bermasalah. Periksa jaringan kamu dan coba lagi.";
      } else if (rawMsg.includes("timeout") || rawMsg.includes("DEADLINE")) {
        friendlyMsg = "⏱️ AI terlalu lama merespons. Coba sederhanakan deskripsi produk kamu.";
      } else if (rawMsg.length > 0) {
        friendlyMsg = `⚠️ ${rawMsg}`;
      }
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };


  // ---- Derived content strings for copy ----
  const landingPageText = result?.landingPage ?? "";
  const captionText = result?.caption ?? "";
  const broadcastText = result?.broadcast ?? "";
  const todoListText = result?.todoList?.map((t, i) => `${i + 1}. ${t}`).join("\n") ?? "";
  const storyboardText =
    result?.storyboard.map((s) => `${s.shot}\nVisual: ${s.visual}\nAudio: ${s.audio}`).join("\n\n") ?? "";
  const vibeScoreText = result
    ? `Vibe Score: ${result.vibeScore.score}/100\nLabel: ${result.vibeScore.label}\n\nReasons:\n${result.vibeScore.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  const showNicheFinder = formData.contentType === "Niche Finder";

  // ---- Render ----
  return (
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-4rem] left-[-4rem] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[-2rem] right-[-2rem] w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      {/* Progress Bar — shown during loading */}
      {isLoading && (
        <div className="fixed top-14 left-0 right-0 z-50">
          <div className="progress-bar-track" style={{ borderRadius: 0 }}>
            <div className="progress-bar-fill" />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg toast-in flex items-center gap-2"
        >
          <span className="pulse-dot" />
          {toast}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      <div className="min-h-screen bg-transparent pt-3 md:pt-6 pb-8 px-3 md:px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[38%_62%] gap-4 md:gap-6 items-start">

          {/* ===== LEFT COLUMN — INPUT FORM ===== */}
          <div className="glass-card p-4 md:p-6 lg:sticky lg:top-20 space-y-4 md:space-y-5 animate-slide-up">

            {/* Welcome Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  👋 Selamat datang di FlowFOR Creative!
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Isi form di bawah dan biarkan AI Gemini membuatkan launch kit lengkap untukmu.
                </p>
              </div>
              <div className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1">
                ✨ Gemini AI
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Produk / Campaign
                  <span className="text-purple-500 ml-1">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Contoh: Bundle Template Canva Pro"
                  className="form-input dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60"
                  value={formData.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Target Audience — Tag Input */}
              <div>
                <span className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Target Audiens
                  <span className="text-purple-500 ml-1">*</span>
                </span>
                <TagInput
                  tags={targetTags}
                  onChange={setTargetTags}
                  disabled={isLoading}
                />
              </div>

              {/* Settings overrides in form */}
              <div className="grid grid-cols-2 gap-4">
                {/* Language */}
                <div>
                  <label htmlFor="bahasaOutput" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bahasa Output
                  </label>
                  <select
                    id="bahasaOutput"
                    className="form-input appearance-none dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60 cursor-pointer"
                    value={settings.language}
                    onChange={(e) => updateSettings({ ...settings, language: e.target.value })}
                    disabled={isLoading}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                {/* Copy Length */}
                <div>
                  <label htmlFor="panjangCopywriting" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Panjang Copywriting
                  </label>
                  <select
                    id="panjangCopywriting"
                    className="form-input appearance-none dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60 cursor-pointer"
                    value={settings.copyLength}
                    onChange={(e) => updateSettings({ ...settings, copyLength: e.target.value })}
                    disabled={isLoading}
                  >
                    {COPY_LENGTHS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Platforms Grid */}
              <div>
                <span className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Platform Utama
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const isSelected = settings.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const next = isSelected ? settings.platforms.filter((x: string) => x !== p) : [...settings.platforms, p];
                          updateSettings({ ...settings, platforms: next });
                        }}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Deskripsi Singkat Produk
                  <span className="text-purple-500 ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Jelaskan produk atau campaign yang ingin kamu launch..."
                  rows={4}
                  className="form-input resize-none dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Content Type */}
              <div>
                <label htmlFor="contentType" className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Jenis Konten
                </label>
                <select
                  id="contentType"
                  className="form-input appearance-none cursor-pointer dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a855f7' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px 16px",
                    paddingRight: "36px",
                  }}
                  value={formData.contentType}
                  onChange={(e) => handleChange("contentType", e.target.value)}
                  disabled={isLoading}
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Niche Finder: Interest Hint */}
              {showNicheFinder && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <label htmlFor="interestHint" className="block text-[13px] font-medium text-purple-700">
                    Ceritakan minat/keahlian kamu
                    <span className="text-purple-500 ml-1">*</span>
                  </label>
                  <textarea
                    id="interestHint"
                    placeholder="Contoh: Saya suka desain,fotografi, dan sudah 3 tahun belajar marketing digital..."
                    rows={3}
                    className="form-input resize-none dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 disabled:opacity-60"
                    value={formData.interestHint || ""}
                    onChange={(e) => handleChange("interestHint", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!formData.productName || !formData.description)}
                className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                           bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600
                           text-white shadow-lg shadow-purple-200
                           hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700
                           hover:shadow-xl hover:shadow-purple-300 hover:scale-[1.02]
                           active:scale-[0.98]
                           transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           ${!isLoading && formData.productName && formData.description ? 'btn-generate-glow' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {loadingTexts[loadingTextIndex]}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Launch Kit
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-400">
              AI-powered by Google Gemini 2.5 Flash
            </p>
          </div>

          {/* ===== RIGHT COLUMN — BENTO OUTPUT GRID ===== */}
          <div ref={bentoGridRef}>
            <div className="space-y-4">
              {!result && !isLoading ? (
                <EmptyState />
              ) : (
                <>
                  {/* Niche Recommendation Banner */}
                  {result?.nicheRecommendation && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-xl animate-enter-1">
                      <p className="text-xs font-semibold text-purple-700">
                        ✨ Niche yang direkomendasikan: <span className="font-bold">{result.nicheRecommendation}</span>
                      </p>
                    </div>
                  )}

                  {/* Row 1: Sales Page */}
                  <div className="animate-enter-1">
                    <SalesPageCard
                      landingPage={result?.landingPage ?? ""}
                      isLoading={isLoading}
                      copied={copiedCard === "landingPage"}
                      onCopy={() => handleCopy("landingPage", landingPageText)}
                    />
                  </div>

                  {/* Row 2: Caption + Broadcast */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BentoCard
                      title="Social Caption"
                      icon=""
                      pillBg="bg-blue-100"
                      pillText="text-blue-700"
                      pillLabel="Caption"
                      className="animate-enter-2"
                      isLoading={isLoading}
                      copied={copiedCard === "caption"}
                      onCopy={() => handleCopy("caption", captionText)}
                      content={
                        isLoading ? null : (
                          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-gray-600">
                            {result?.caption}
                          </pre>
                        )
                      }
                    />
                    <BentoCard
                      title="Broadcast Message"
                      icon=""
                      pillBg="bg-green-100"
                      pillText="text-green-700"
                      pillLabel="WA/TG"
                      className="animate-enter-2"
                      isLoading={isLoading}
                      copied={copiedCard === "broadcast"}
                      onCopy={() => handleCopy("broadcast", broadcastText)}
                      content={
                        isLoading ? null : (
                          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-gray-600">
                            {result?.broadcast}
                          </pre>
                        )
                      }
                    />
                  </div>

                  {/* Row 3: To-Do List */}
                  <ToDoListCard
                    items={result?.todoList ?? []}
                    isLoading={isLoading}
                    copied={copiedCard === "todoList"}
                    onCopy={() => handleCopy("todoList", todoListText)}
                    className="animate-enter-3"
                  />

                  {/* Row 4: Storyboard */}
                  <div className="animate-enter-4">
                    <StoryboardCard
                      shots={result?.storyboard ?? []}
                      isLoading={isLoading}
                      copied={copiedCard === "storyboard"}
                      onCopy={() => handleCopy("storyboard", storyboardText)}
                      productName={formData.productName}
                    />
                  </div>

                  {/* Row 5: Shoot Script */}
                  <div className="animate-enter-4">
                    <ShootScriptCard
                      script={result?.shootScript}
                      isLoading={isLoading}
                    />
                  </div>

                  {/* Row 6: Vibe Score */}
                  <div className="animate-enter-5">
                    <VibeScoreCard
                      score={result?.vibeScore ?? { score: 0, label: "", reasons: [] }}
                      isLoading={isLoading}
                      copied={copiedCard === "vibeScore"}
                      onCopy={() => handleCopy("vibeScore", vibeScoreText)}
                    />
                  </div>

                  {/* Row 6b: AI Score Breakdown */}
                  {result && (
                    <div className="animate-enter-5 mt-4">
                      <ScoreBreakdown
                        overallScore={result.vibeScore?.score ?? 0}
                        label={result.vibeScore?.label ?? ""}
                        caption={result.caption}
                        landingPage={result.landingPage}
                        broadcast={result.broadcast}
                        todoList={result.todoList}
                      />
                    </div>
                  )}

                  {/* Row 7: Content Calendar */}
                  {result?.contentCalendar && (
                    <div className="animate-enter-6 mt-4">
                      <ContentCalendar
                        productName={formData.productName}
                        calendarData={result.contentCalendar}
                      />
                    </div>
                  )}

                  {/* Action Bar */}
                  {result && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-enter-7">
                      {/* Left: Branding */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <Image 
                            src={isDark ? "/logo_white.png" : "/logo_new.png"} 
                            alt="Logo" 
                            width={44} 
                            height={44} 
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 leading-none">FlowFOR Creative</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Powered by FlowFOR #JuaraVibeCoding</p>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex gap-2.5 flex-wrap">

                        <button
                          onClick={() => setShowMobilePreview(true)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-indigo-300
                                     text-indigo-600 font-semibold text-xs hover:bg-indigo-50
                                     active:scale-95 transition-all duration-200"
                        >
                          <Smartphone size={14} />
                          Preview
                        </button>

                        <button
                          onClick={handleExportZip}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-green-300
                                     text-green-600 font-semibold text-xs hover:bg-green-50
                                     active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          <Package size={14} />
                          Download ZIP
                        </button>

                        <button
                          onClick={handleExportPDF}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-amber-300
                                     text-amber-600 font-semibold text-xs hover:bg-amber-50
                                     active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          <Download size={14} />
                          PDF Report
                        </button>

                        <button
                          onClick={handleLinkedInShare}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs
                                     hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          <Share2 size={14} />
                          Share
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Preview Modal */}
      <MobilePreviewModal
        open={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
        caption={result?.caption ?? ""}
      />
    </>
  );
}
