"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Zap,
  Loader2,
  Copy,
  Check,
  Smartphone,
  AlertCircle,
  Sparkles,
  Star,
  X,
  Share2,
  Download,
} from "lucide-react";

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

interface GenerateResult {
  landingPage: string;
  caption: string;
  broadcast: string;
  todoList: string[];
  storyboard: StoryboardItem[];
  vibeScore: VibeScoreData;
}

interface FormData {
  productName: string;
  description: string;
  contentType: string;
}

// ==============================================
// TAG INPUT COMPONENT
// ==============================================
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
      className={`min-h-[48px] w-full px-3 py-2.5 rounded-xl border bg-white/70 transition-all duration-200
        flex flex-wrap gap-2 items-center cursor-text
        focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && document.getElementById("tag-input-field")?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-medium animate-in fade-in slide-in-from-left-1"
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
}: {
  shots: StoryboardItem[];
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
}) {
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
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-8 w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-purple-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-600 rounded-tl-lg">Shot</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Visual</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 rounded-tr-lg">Audio</th>
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
// ERROR TOAST
// ==============================================
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-3 max-w-md">
      <AlertCircle size={16} />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-white/70 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  );
}

// ==============================================
// CONTENT TYPE OPTIONS
// ==============================================
const CONTENT_TYPES = [
  { label: "💻  Produk Digital", value: "Produk Digital" },
  { label: "🎯  Jasa/Service", value: "Jasa/Service" },
  { label: "📅  Event/Webinar", value: "Event/Webinar" },
  { label: "🔗  Affiliate/Review", value: "Affiliate/Review" },
];

// ==============================================
// MAIN PAGE
// ==============================================
export default function HomePage() {
  // ---- State ----
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    description: "",
    contentType: "Produk Digital",
  });
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref for bento grid (PDF export target)
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
      "I just generated my launch kit with FlowFOR Creative — AI-powered Smart Launch Command Center! 🚀 Try it: https://flow-for-creative.vercel.app #JuaraVibeCoding #FlowFORCreative #GeminiAI"
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fflow-for-creative.vercel.app&summary=${text}`, "_blank");
    showToast("Opening LinkedIn...");
  };

  const handleCopy = (cardKey: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedCard(cardKey);
    showToast("Copied!");
    setTimeout(() => setCopiedCard(null), 2000);
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
          ...formData,
          targetAudience: targetAudienceValue || formData.productName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data: GenerateResult = await res.json();
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- PDF Export ----
  const handleExportPDF = async () => {
    if (!bentoGridRef.current) return;
    setIsExporting(true);

    try {
      const [html2canvasModule, jspdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jspdfModule;

      const element = bentoGridRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      const filename = `FlowFOR-Campaign-${(formData.productName || "Launch").replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(filename);
      showToast("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      setErrorMessage("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // ---- Derived content strings for copy ----
  const landingPageText = result?.landingPage ?? "";
  const captionText = result?.caption ?? "";
  const broadcastText = result?.broadcast ?? "";
  const todoListText = result?.todoList.map((t, i) => `${i + 1}. ${t}`).join("\n") ?? "";
  const storyboardText =
    result?.storyboard.map((s) => `${s.shot}\nVisual: ${s.visual}\nAudio: ${s.audio}`).join("\n\n") ?? "";
  const vibeScoreText = result
    ? `Vibe Score: ${result.vibeScore.score}/100\nLabel: ${result.vibeScore.label}\n\nReasons:\n${result.vibeScore.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  // ---- Render ----
  return (
    <>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-4rem] left-[-4rem] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[-2rem] right-[-2rem] w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg toast-in">
          {toast}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      <div className="min-h-screen bg-slate-50 pt-6 pb-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 items-start">

          {/* ===== LEFT COLUMN — INPUT FORM ===== */}
          <div className="glass-card p-6 lg:sticky lg:top-20 space-y-5 animate-slide-up">

            {/* Creator Hub Section */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white text-sm font-semibold">R</span>
              </div>
              {/* Info */}
              <div className="flex-1 leading-none">
                <p className="text-sm font-bold text-gray-800">Creator Hub</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    Pro Plan
                  </span>
                </div>
              </div>
              {/* Gemini badge */}
              <div className="text-[10px] font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                Gemini AI
              </div>
            </div>

            {/* App Title (replaces old header) */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
                  <Zap className="text-white" size={16} />
                </div>
                <h1 className="text-xl font-bold gradient-text">FlowFOR Creative</h1>
              </div>
              <p className="text-xs text-gray-400">Smart Launch Command Center</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Product Name */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Nama Produk / Campaign
                  <span className="text-purple-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bundle Template Canva Pro"
                  className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/70 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                             transition-all duration-200 placeholder:text-gray-400 text-gray-800
                             disabled:opacity-60"
                  value={formData.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Target Audience — Tag Input */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Target Audiens
                  <span className="text-purple-500 ml-1">*</span>
                </label>
                <TagInput
                  tags={targetTags}
                  onChange={setTargetTags}
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Deskripsi Singkat Produk
                  <span className="text-purple-500 ml-1">*</span>
                </label>
                <textarea
                  placeholder="Jelaskan produk atau campaign yang ingin kamu launch..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/70 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                             transition-all duration-200 placeholder:text-gray-400 text-gray-800
                             resize-none disabled:opacity-60"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Jenis Konten
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/70 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                             transition-all duration-200 cursor-pointer text-gray-800
                             disabled:opacity-60 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!formData.productName || !formData.description)}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                           bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600
                           text-white shadow-lg shadow-purple-200
                           hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700
                           hover:shadow-xl hover:shadow-purple-300 hover:scale-[1.02]
                           active:scale-[0.98]
                           transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Launch Kit...
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
                  {/* Row 1: Sales Page */}
                  <BentoCard
                    title="Sales Page Copy"
                    icon="📝"
                    colSpan="lg:col-span-2"
                    pillBg="bg-purple-100"
                    pillText="text-purple-700"
                    pillLabel="Copy"
                    isLoading={isLoading}
                    copied={copiedCard === "landingPage"}
                    onCopy={() => handleCopy("landingPage", landingPageText)}
                    className="animate-enter-1"
                    content={
                      isLoading ? null : (
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-gray-600">
                          {result?.landingPage}
                        </pre>
                      )
                    }
                  />

                  {/* Row 2: Caption + Broadcast */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BentoCard
                      title="Social Caption"
                      icon="📱"
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
                      icon="💬"
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
                    />
                  </div>

                  {/* Row 5: Vibe Score */}
                  <div className="animate-enter-5">
                    <VibeScoreCard
                      score={result?.vibeScore ?? { score: 0, label: "", reasons: [] }}
                      isLoading={isLoading}
                      copied={copiedCard === "vibeScore"}
                      onCopy={() => handleCopy("vibeScore", vibeScoreText)}
                    />
                  </div>

                  {/* Action Bar */}
                  {result && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-enter-6">
                      {/* Left: Branding */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                          <Zap className="text-white" size={13} />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-gray-700">FlowFOR Creative</p>
                          <p className="text-[11px] text-gray-400">© 2026 · Smart Launch Command Center</p>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={handleExportPDF}
                          disabled={isExporting}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-purple-300
                                     text-purple-600 font-semibold text-sm hover:bg-purple-50
                                     active:scale-95 transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isExporting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Download size={15} />
                          )}
                          {isExporting ? "Exporting..." : "Export PDF"}
                        </button>

                        <button
                          onClick={() => setShowMobilePreview(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-indigo-300
                                     text-indigo-600 font-semibold text-sm hover:bg-indigo-50
                                     active:scale-95 transition-all duration-200"
                        >
                          <Smartphone size={15} />
                          Preview Mobile
                        </button>

                        <button
                          onClick={handleLinkedInShare}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm
                                     hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          <Share2 size={15} />
                          Share to LinkedIn
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
