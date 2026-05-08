"use client";

import { useState, useRef, useCallback } from "react";
import { Zap, Loader2, Copy, Check, FileText, Smartphone, AlertCircle } from "lucide-react";

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
  targetAudience: string;
  description: string;
  contentType: string;
}

// ==============================================
// EMPTY STATE
// ==============================================
function EmptyState() {
  return (
    <div className="col-span-2 glass-card p-8 flex flex-col items-center justify-center text-center min-h-48">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
        <Zap className="text-indigo-500" size={32} />
      </div>
      <h3 className="font-semibold text-gray-700 mb-2">Generate your first campaign</h3>
      <p className="text-gray-400 text-sm">Fill in the form and click Generate to see your AI-powered launch kit</p>
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
            {/* Status bar */}
            <div className="bg-gray-900 h-10 flex items-center justify-between px-6 text-white text-xs">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 rounded-sm bg-white/30" />
                <div className="w-4 h-2 rounded-sm bg-white/30" />
                <div className="w-4 h-2 rounded-sm bg-white/30" />
              </div>
            </div>
            {/* Notch */}
            <div className="bg-gray-900 h-6 flex justify-center items-center">
              <div className="bg-gray-900 w-24 h-5 rounded-b-2xl border border-gray-700" />
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                <div>
                  <div className="h-3 w-20 bg-gray-300 rounded" />
                  <div className="h-2 w-14 bg-gray-200 rounded mt-1" />
                </div>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {caption}
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <div className="h-5 w-16 bg-indigo-100 rounded-full" />
                <div className="h-5 w-14 bg-indigo-100 rounded-full" />
                <div className="h-5 w-20 bg-indigo-100 rounded-full" />
              </div>
              <div className="mt-4 flex gap-3">
                <div className="h-20 w-20 bg-gray-200 rounded-xl" />
                <div className="h-20 w-20 bg-gray-200 rounded-xl" />
              </div>
            </div>
            {/* Home bar */}
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
  onCopy,
  copied,
  isLoading,
}: {
  title: string;
  icon: string;
  content: React.ReactNode;
  colSpan?: string;
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className={`glass-card p-5 relative group ${colSpan}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
            title="Copy"
          >
            {copied ? (
              <Check size={14} className="text-green-600" />
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
// TO-DO LIST (with interactive checkboxes)
// ==============================================
function ToDoListCard({
  items,
  onCopy,
  copied,
  isLoading,
}: {
  items: string[];
  onCopy?: () => void;
  copied?: boolean;
  isLoading?: boolean;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => new Array(items.length).fill(false));

  return (
    <div className="glass-card p-5 relative group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <span>✅</span> Launch To-Do List
        </h3>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
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
              className="flex items-start gap-3 text-sm cursor-pointer hover:bg-indigo-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400 cursor-pointer accent-indigo-500"
                checked={checked[i]}
                onChange={() => {
                  const next = [...checked];
                  next[i] = !next[i];
                  setChecked(next);
                }}
              />
              <span className={checked[i] ? "line-through text-gray-400" : "text-gray-600"}>{item}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================
// STORYBOARD TABLE
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
    <div className="glass-card p-5 relative group lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <span>🎬</span> Visual Storyboard
        </h3>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
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
              <tr className="bg-indigo-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-600 rounded-tl-lg">Shot</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Visual</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 rounded-tr-lg">Audio</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-indigo-600 whitespace-nowrap">{s.shot}</td>
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
// VIBE SCORE CARD
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
  const color = score.score <= 40 ? "text-red-500" : score.score <= 70 ? "text-yellow-500" : "text-green-500";
  const bg = score.score <= 40 ? "bg-red-50" : score.score <= 70 ? "bg-yellow-50" : "bg-green-50";

  return (
    <div className="glass-card p-5 relative group lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
          <span>🔥</span> Vibe Score
        </h3>
        {!isLoading && onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="skeleton h-12 w-20" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`text-5xl font-black ${color} leading-none`}>{score.score}</div>
          <div className="flex-1">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${bg} ${color}`}>
              {score.label}
            </div>
            <ul className="space-y-1">
              {score.reasons.map((r, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
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
// ERROR TOAST COMPONENT
// ==============================================
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-3 max-w-md">
      <AlertCircle size={16} />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-white/70 hover:text-white text-lg leading-none">×</button>
    </div>
  );
}

// ==============================================
// MAIN PAGE
// ==============================================
export default function HomePage() {
  // ---- State ----
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    targetAudience: "",
    description: "",
    contentType: "Produk Digital",
  });
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

  const handleCopy = (cardKey: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedCard(cardKey);
    showToast("Copied!");
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  // ---- PDF Export (html2canvas + jspdf) ----
  const handleExportPDF = async () => {
    if (!bentoGridRef.current) return;
    setIsExporting(true);

    try {
      // Dynamic import so SSR doesn't try to load these
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 items-start">

          {/* ===== LEFT COLUMN — INPUT FORM ===== */}
          <div className="glass-card p-6 lg:sticky lg:top-8 space-y-5">
            {/* App Header */}
            <div className="text-center pb-4 border-b border-white/40">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Zap className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold gradient-text">FlowFOR Creative</h1>
              </div>
              <p className="text-sm text-gray-500">Smart Launch Command Center</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nama Produk / Campaign <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bundle Template Canva Pro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-300"
                  value={formData.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Target Audiens <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: UMKM Indonesia, Content Creator muda"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-300"
                  value={formData.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Deskripsi Singkat Produk <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Jelaskan produk atau campaign yang ingin kamu launch..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-300 resize-none"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis Konten</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer"
                  value={formData.contentType}
                  onChange={(e) => handleChange("contentType", e.target.value)}
                  disabled={isLoading}
                >
                  <option>Produk Digital</option>
                  <option>Jasa/Service</option>
                  <option>Event/Webinar</option>
                  <option>Affiliate/Review</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gradient w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Generate Launch Kit
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400">Powered by Google Gemini AI</p>
          </div>

          {/* ===== RIGHT COLUMN — BENTO OUTPUT GRID ===== */}
          {/* This div is the PDF export target */}
          <div ref={bentoGridRef}>
            <div className="space-y-4">
              {!result && !isLoading ? (
                <EmptyState />
              ) : (
                <>
                  {/* Row 1: Sales Page (full width) */}
                  <BentoCard
                    title="Sales Page Copy"
                    icon="📝"
                    colSpan="lg:col-span-2"
                    isLoading={isLoading}
                    copied={copiedCard === "landingPage"}
                    onCopy={() => handleCopy("landingPage", landingPageText)}
                    content={
                      isLoading ? null : (
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans text-gray-600">
                          {result?.landingPage}
                        </pre>
                      )
                    }
                  />

                  {/* Row 2: Social Caption + Broadcast */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BentoCard
                      title="Social Caption"
                      icon="📱"
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
                  />

                  {/* Row 4: Storyboard (full width) */}
                  <StoryboardCard
                    shots={result?.storyboard ?? []}
                    isLoading={isLoading}
                    copied={copiedCard === "storyboard"}
                    onCopy={() => handleCopy("storyboard", storyboardText)}
                  />

                  {/* Row 5: Vibe Score (full width) */}
                  <VibeScoreCard
                    score={result?.vibeScore ?? { score: 0, label: "", reasons: [] }}
                    isLoading={isLoading}
                    copied={copiedCard === "vibeScore"}
                    onCopy={() => handleCopy("vibeScore", vibeScoreText)}
                  />

                  {/* Action Buttons */}
                  {result && (
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all disabled:opacity-60"
                      >
                        {isExporting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <FileText size={16} />
                        )}
                        {isExporting ? "Exporting..." : "Export as PDF"}
                      </button>
                      <button
                        onClick={() => setShowMobilePreview(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-purple-400 text-purple-600 font-semibold text-sm hover:bg-purple-50 transition-all"
                      >
                        <Smartphone size={16} />
                        Preview Mobile Mockup
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          {/* End bento grid */}

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