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
} from "lucide-react";
import Image from "next/image";

import ContentCalendar from "./ContentCalendar";
import { useSettings } from "./SettingsContext";

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
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
              {script.scenes.map((s, i) => (
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
  const ringBg = `conic-gradient(${ringColorClass} 0deg ${fillDeg}deg, #e5e7eb ${fillDeg}deg 360deg)`;

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
