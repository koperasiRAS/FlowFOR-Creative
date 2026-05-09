"use client";

import { useState, useCallback } from "react";
import { Target, TrendingUp, AlertTriangle, Zap, CheckCircle2, Loader2, ChevronDown, ChevronUp, ExternalLink, Globe } from "lucide-react";
import { useSettings } from "./SettingsContext";

interface NicheBriefData {
  nicheOverview: {
    name: string;
    size: string;
    competition: string;
    monetization: string;
    opportunity: string;
  };
  competitors: {
    platform: string;
    username: string;
    displayName: string;
    followerCount: string;
    contentTheme: string;
    whyFollow: string;
    contentStrength: string;
  }[];
  contentPatterns: {
    pattern: string;
    description: string;
    example: string;
    virality: string;
    frequency: string;
  }[];
  strategicInsight: {
    differentiation: string;
    quickWin: string;
    commonMistake: string;
    secretWeapon: string;
  };
  actionPlan: string[];
  overallScore: number;
  entryDifficulty: string;
}

const PLATFORM_COLOR: Record<string, { bg: string; text: string }> = {
  Instagram: { bg: "bg-pink-100 text-pink-700", text: "text-pink-500" },
  TikTok: { bg: "bg-black text-white", text: "text-black" },
  YouTube: { bg: "bg-red-100 text-red-700", text: "text-red-500" },
  WhatsApp: { bg: "bg-green-100 text-green-700", text: "text-green-500" },
};

const VIRALITY_COLOR: Record<string, string> = {
  Tinggi: "bg-green-100 text-green-700",
  Sedang: "bg-yellow-100 text-yellow-700",
  Rendah: "bg-gray-100 text-gray-600",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

function ScoreCircle({ score }: { score: number }) {
  const label = score >= 80 ? "Premium" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-100 dark:text-gray-800"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black" style={{ color }}>{score}</span>
        <span className="text-[8px] text-gray-400">{label}</span>
      </div>
    </div>
  );
}

interface NicheBriefAnalyzerProps {
  productName?: string;
  description?: string;
  contentType?: string;
}

export default function NicheBriefAnalyzer({ productName = "", description = "", contentType = "Produk Digital" }: NicheBriefAnalyzerProps) {
  const { isDark } = useSettings();
  const [niche, setNiche] = useState(() => {
    if (productName) return productName;
    if (description) return description.split(" ").slice(0, 5).join(" ");
    return "";
  });
  const [selectedContentType, setSelectedContentType] = useState(contentType);
  const [result, setResult] = useState<NicheBriefData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "competitors" | "patterns" | "strategy">("overview");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleAnalyze = async () => {
    if (!niche.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/niche-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), contentType: selectedContentType }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      const data: NicheBriefData = await res.json();
      setResult(data);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menganalisa niche");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    showToast(`${label} disalin!`);
  };

  return (
    <div className="glass-card p-5 lg:col-span-2 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-violet-100 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Strategy
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <Target size={14} className="text-violet-500" />
            Niche Competitor Brief
          </h3>
          {result && (
            <span className="text-[10px] text-gray-400">
              {result.nicheOverview?.name || niche}
            </span>
          )}
        </div>
        {result && (
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[result.entryDifficulty] ?? "bg-gray-100 text-gray-600"}`}>
              Entry: {result.entryDifficulty}
            </span>
            <button
              onClick={() => { setResult(null); setNiche(""); }}
              className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
            >
              ✕ Reset
            </button>
          </div>
        )}
      </div>

      {/* Input Row */}
      {!expanded && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ketik niche kamu di sini... (cth: Canva Templates, Digital Marketing)"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-xs font-medium placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:border-violet-500 dark:focus:ring-violet-900/30 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={isLoading}
            />
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="form-input appearance-none dark:bg-slate-800 dark:border-white/10 dark:text-gray-100 text-xs cursor-pointer w-36"
              disabled={isLoading}
            >
              <option value="Produk Digital">Produk Digital</option>
              <option value="Jasa/Service">Jasa/Service</option>
              <option value="Konten Edukasi">Konten Edukasi</option>
              <option value="Konten Monetisasi">Konten Monetisasi</option>
              <option value="Niche Finder">Niche Finder</option>
            </select>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !niche.trim()}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 size={12} className="animate-spin" /> Menganalisa niche...</>
            ) : (
              <><Zap size={12} /> Analyse Niche</>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score + Overview Row */}
          <div className="flex items-start gap-4">
            <ScoreCircle score={result.overallScore} />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Niche", value: result.nicheOverview?.size ?? "—" },
                { label: "Competition", value: result.nicheOverview?.competition ?? "—" },
                { label: "Monetize", value: result.nicheOverview?.monetization ?? "—" },
                { label: "Opportunity", value: result.nicheOverview?.opportunity ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-violet-50/50 dark:bg-violet-900/20 rounded-xl p-2.5">
                  <p className="text-[9px] font-bold text-violet-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-[11px] text-gray-700 dark:text-gray-200 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-1 overflow-x-auto">
            {(["overview", "competitors", "patterns", "strategy"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab === "overview" ? "📋 Overview"
                  : tab === "competitors" ? "👥 Competitors"
                    : tab === "patterns" ? "📊 Patterns"
                      : "🎯 Strategy"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && result.nicheOverview && (
            <div className="animate-slide-up space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {result.nicheOverview.opportunity}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: "💰 Monetize", text: result.nicheOverview.monetization },
                  { label: "📈 Competition", text: result.nicheOverview.competition },
                ].map(({ label, text }) => (
                  <div key={label} className="p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">{label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "competitors" && (
            <div className="animate-slide-up space-y-2">
              {result.competitors?.map((c, i) => {
                const meta = PLATFORM_COLOR[c.platform] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${meta.bg}`}>{c.platform}</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">@{c.username}</span>
                        <span className="text-[10px] text-gray-400">{c.displayName}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {c.followerCount} · <span className="text-violet-600 dark:text-violet-400">{c.contentTheme}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 italic">
                        {`"${c.whyFollow}"`}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(c.username, "Username")}
                      className="text-[9px] text-violet-500 hover:text-violet-700 font-medium flex-shrink-0"
                    >
                      Copy
                    </button>
                    <a
                      href={`https://${c.platform.toLowerCase()}.com/${c.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5 flex-shrink-0"
                      title={`Buka @${c.username} di ${c.platform}`}
                    >
                      <Globe size={9} /> Profil
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "patterns" && (
            <div className="animate-slide-up space-y-2">
              {result.contentPatterns?.map((p, i) => (
                <div key={i} className="p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">{p.pattern}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${VIRALITY_COLOR[p.virality] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.virality}
                    </span>
                    <span className="text-[9px] text-gray-400">{p.frequency}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">{p.description}</p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-slate-900/40 rounded-lg px-2 py-1.5 italic">
                    💡 {p.example}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "strategy" && (
            <div className="animate-slide-up space-y-3">
              {/* Strategic Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { icon: "⚡", label: "Quick Win", text: result.strategicInsight?.quickWin, color: "bg-green-50 dark:bg-green-900/20" },
                  { icon: "🎯", label: "Differentiation", text: result.strategicInsight?.differentiation, color: "bg-purple-50 dark:bg-purple-900/20" },
                  { icon: "⚠️", label: "Common Mistake", text: result.strategicInsight?.commonMistake, color: "bg-amber-50 dark:bg-amber-900/20" },
                  { icon: "🔮", label: "Secret Weapon", text: result.strategicInsight?.secretWeapon, color: "bg-violet-50 dark:bg-violet-900/20" },
                ].map(({ icon, label, text, color }) => (
                  <div key={label} className={`p-3 rounded-xl ${color}`}>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      {icon} {label}
                    </p>
                    <p className="text-[11px] text-gray-700 dark:text-gray-200 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* Action Plan */}
              <div className="p-3 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-violet-500" /> Action Plan — Lakukan SEKARANG
                </p>
                <div className="space-y-1.5">
                  {result.actionPlan?.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-[9px] font-black text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expand/Collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 font-medium transition-colors w-full justify-center pt-1"
          >
            {expanded ? <><ChevronUp size={12} /> Sembunyikan</> : <><ChevronDown size={12} /> Lihat Detail</>}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-violet-600 text-white px-5 py-2 rounded-full text-xs font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}