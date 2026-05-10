"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, Zap, Target, Eye, MessageSquare } from "lucide-react";
import { useSettings } from "./SettingsContext";

interface ScoreBreakdownProps {
  overallScore: number;
  label: string;
  caption?: string;
  landingPage?: string;
  broadcast?: string;
  todoList?: string[];
  // Optional: component scores from AI (server-side calculation)
  // If not provided, component computes locally
  hookPower?: number;
  emotionalTrigger?: number;
  ctaUrgency?: number;
  copyClarity?: number;
  engagementPotential?: number;
}

interface ComponentScore {
  name: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  description: string;
  suggestion: string;
}

function analyzeHookPower(caption: string): number {
  if (!caption) return 0;
  const upper = caption.trim().toUpperCase();
  const hookIndicators = [
    /^[\d!?!🔥💰]/,          // starts with number, exclamation, fire/money emoji
    /\b(gak bisa|satu-satunya|eksklusif|terbatas|GRATIS|SEKARANG|HANYA|HARI INI)\b/i,
    /\b(tahu|tau|coba bayangin|imagine)\b/i,
    /\b(rahasia|trik|tips|strategi)\b/i,
    /\?\s*\S+/,              // starts with question
    /^[A-Z]{3,}\s/,          // starts with CAPS word
  ];
  let score = 20;
  hookIndicators.forEach((rx) => {
    if (rx.test(upper)) score += 16;
  });
  // Length check — good hook is 1-3 words typically
  const firstLine = caption.split("\n")[0] || caption;
  const firstFew = firstLine.trim().split(" ").slice(0, 5).join(" ");
  if (firstFew.length <= 60) score += 5;
  if (firstFew.length <= 30) score += 5;
  return Math.min(100, score);
}

function analyzeEmotionalTrigger(text: string): number {
  if (!text) return 0;
  const emotionalWords = [
    // Desire/excitement
    "gila", "luar biasa", "WOW", "keren", "mantap", "super", "epic",
    "bangga", "senang", "gembira", "bahagia", "semangat", "passion",
    // Urgency/FOMO
    "bentar", "cepat", "sebelum", "habis", "terbatas", " السريع",
    // Pain point / empathy
    "susah", "ribet", "pusing", "masalah", "gagal", "buntu",
    "capek", "bosen", "kecewa", "frustrasi", "stress",
    // Social proof
    "ribuan", "ratusan", "bukti", "testimoni", "success", "hasil",
    // Money/results
    "raih", "uang", "dapat", "hasilkan", "menghasilkan", "million",
  ];
  const lower = text.toLowerCase();
  let matches = 0;
  emotionalWords.forEach((w) => {
    const rx = new RegExp(`\\b${w}\\b`, "i");
    if (rx.test(lower)) matches++;
  });
  const uniqueRatio = matches / Math.max(emotionalWords.length, 1);
  // Base score from density, cap at 100
  return Math.min(100, Math.round(30 + uniqueRatio * 500));
}

function analyzeCTAUrgency(caption: string, landingPage: string, broadcast: string): number {
  const allText = [caption, landingPage, broadcast].filter(Boolean).join(" ");
  if (!allText) return 0;

  const ctaIndicators = [
    { pattern: /\b(download|download sekarang|download gratis)\b/i, weight: 15 },
    { pattern: /\b(klik|link bio|buka|cek|grab)\b/i, weight: 10 },
    { pattern: /\b(GRATIS|free|no cost|tanpa bayar)\b/i, weight: 12 },
    { pattern: /\b(SEKARANG|HARI INI|hari ini|last call|expired|berakhir)\b/i, weight: 15 },
    { pattern: /\b(limited|jumlah terbatas|kuota|slot|terbatas)\b/i, weight: 12 },
    { pattern: /\b(tunggu apa lagi|gas|ayo|mulai|bergabung|join)\b/i, weight: 8 },
    { pattern: /\b(buy now|order|pesan|beli|beli sekarang)\b/i, weight: 15 },
    { pattern: /\b(subscribe|follow|share|comment)\b/i, weight: 6 },
    { pattern: /\b(discount|promo|harga spesial|kode|kupon)\b/i, weight: 10 },
    { pattern: /\b(DAPATKAN|Raih|Bangun|Kuasai)\b/i, weight: 12 },
  ];

  let score = 10;
  ctaIndicators.forEach(({ pattern, weight }) => {
    if (pattern.test(allText)) score += weight;
  });

  // Check for emoji in CTA (engagement boost)
  if (/[🔥💰⭐🎯💎]/.test(allText)) score += 5;

  return Math.min(100, score);
}

function analyzeCopyClarity(text: string): number {
  if (!text) return 0;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLen = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    : 0;

  let score = 25;
  // Ideal: 10-20 words per sentence for social media
  if (avgSentenceLen >= 5 && avgSentenceLen <= 20) score += 30;
  else if (avgSentenceLen > 20 && avgSentenceLen <= 35) score += 20;
  else if (avgSentenceLen > 35) score += 5;

  // Emoji usage: good signal of clear, scannable content
  const emojiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
  const wordCount = text.split(/\s+/).length;
  const emojiRatio = wordCount > 0 ? emojiCount / wordCount : 0;
  if (emojiRatio >= 0.05 && emojiRatio <= 0.2) score += 25;
  else if (emojiRatio > 0.2 && emojiRatio <= 0.4) score += 15;
  else if (emojiRatio === 0) score -= 5;

  // Bullet/line break usage
  const lineBreaks = (text.match(/\n/g) || []).length;
  const hasBullets = /\n[-•*]\s/.test(text);
  if (hasBullets || lineBreaks >= 3) score += 15;

  return Math.min(100, score);
}

function analyzeEngagementPotential(caption: string): number {
  if (!caption) return 0;
  const lower = caption.toLowerCase();
  let score = 20;

  // Hashtag count (ideal: 3-8)
  const hashtagCount = (caption.match(/#[a-z0-9]+/gi) || []).length;
  if (hashtagCount >= 3 && hashtagCount <= 5) score += 25;
  else if (hashtagCount > 5 && hashtagCount <= 8) score += 20;
  else if (hashtagCount > 8) score += 10;
  else if (hashtagCount === 0) score -= 5;

  // Question (engagement driver)
  if (/\?/.test(caption)) score += 15;

  // Call to save/bookmark
  if (/\b(save|bookmark|screenshot|screenhost|simpan|repost)\b/i.test(lower)) score += 12;

  // Share invitation
  if (/\b(tag|mention|share|kirim|Forward)\b/i.test(lower)) score += 10;

  // Platform-specific keywords
  if (/\b(reels|tiktok|link bio|bio)\b/i.test(lower)) score += 8;

  // Emojis
  const emojiCount = (caption.match(/[^\x00-\x7F]/g) || []).length;
  if (emojiCount >= 2 && emojiCount <= 8) score += 10;

  return Math.min(100, score);
}

function ScoreBar({ score, maxScore, colorClass }: { score: number; maxScore: number; colorClass: string }) {
  const pct = Math.round((score / maxScore) * 100);
  const bgColor = pct >= 70 ? "bg-green-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bgColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${colorClass}`}>
        {score}
      </span>
    </div>
  );
}

export default function ScoreBreakdown({
  overallScore,
  label,
  caption = "",
  landingPage = "",
  broadcast = "",
  todoList = [],
  hookPower: aiHookPower,
  emotionalTrigger: aiEmotionalTrigger,
  ctaUrgency: aiCtaUrgency,
  copyClarity: aiCopyClarity,
  engagementPotential: aiEngagement,
}: ScoreBreakdownProps) {
  const { isDark } = useSettings();
  const [expanded, setExpanded] = useState(false);

  // Use AI-provided component scores if available (server-calculated, more accurate)
  // If not provided (old campaign data from localStorage), compute locally.
  // If component score is provided as 0, still use it (real analysis, not missing).
  const hookPower = aiHookPower != null ? aiHookPower : analyzeHookPower(caption);
  const emotionalTrigger = aiEmotionalTrigger != null ? aiEmotionalTrigger : analyzeEmotionalTrigger([caption, landingPage, broadcast].join(" "));
  const ctaUrgency = aiCtaUrgency != null ? aiCtaUrgency : analyzeCTAUrgency(caption, landingPage, broadcast);
  const copyClarity = aiCopyClarity != null ? aiCopyClarity : analyzeCopyClarity([caption, landingPage, broadcast].join(" "));
  const engagementPotential = aiEngagement != null ? aiEngagement : analyzeEngagementPotential(caption);

  const components: ComponentScore[] = [
    {
      name: "Hook Power",
      icon: <Zap size={13} className="text-amber-500" />,
      score: hookPower,
      maxScore: 100,
      description: "Kekuatan hook di awal caption dan sales page",
      suggestion: hookPower < 50
        ? "Gunakan angka, emoji, atau pertanyaan di awal untuk grab attention dalam 3 detik pertama"
        : hookPower < 75
        ? "Hook sudah cukup kuat, tapi coba bikin lebih personal dan spesifik"
        : "Hook sangat powerful! Konsisten dengan energi di seluruh copy",
    },
    {
      name: "Emotional Trigger",
      icon: <TrendingUp size={13} className="text-purple-500" />,
      score: emotionalTrigger,
      maxScore: 100,
      description: "Penggunaan emotional words dan pain point yang relevan",
      suggestion: emotionalTrigger < 50
        ? "Tambahkan emotional words seperti 'capek', 'gila', 'gak mau' untuk bangun koneksi"
        : emotionalTrigger < 75
        ? "Emotional trigger sudah oke, tambahkan pain point audience di awal paragraph"
        : "Emotional trigger sangat strong! Audience akan merasa 'disentuh' dengan copy ini",
    },
    {
      name: "CTA Urgency",
      icon: <Target size={13} className="text-red-500" />,
      score: ctaUrgency,
      maxScore: 100,
      description: "Seberapa urgent dan actionable call-to-action-nya",
      suggestion: ctaUrgency < 50
        ? "Tambahkan urgency words: 'SEKARANG', 'TERBATAS', 'GRATIS' dan jelaskan benefit di CTA"
        : ctaUrgency < 75
        ? "CTA sudah terlihat, tapi pastikan ada benefit yang jelas sebelum ajakan bertindak"
        : "CTA sangat urgent dan compelling! Ini akan mendorong konversi tinggi",
    },
    {
      name: "Copy Clarity",
      icon: <Eye size={13} className="text-blue-500" />,
      score: copyClarity,
      maxScore: 100,
      description: "Tingkat kejelasan dan kemudahan dibaca pesan kamu",
      suggestion: copyClarity < 50
        ? "Gunakan kalimat pendek (maks 20 kata), bullet points, dan emoji untuk scanability"
        : copyClarity < 75
        ? "Clarity sudah bagus, tambahin line breaks lebih sering agar lebih easy to read"
        : "Copy sangat clear dan scannable! Perfect untuk social media consumption",
    },
    {
      name: "Engagement Potential",
      icon: <MessageSquare size={13} className="text-green-500" />,
      score: engagementPotential,
      maxScore: 100,
      description: "Kemampuan konten untuk mendorong interaction dan sharing",
      suggestion: engagementPotential < 50
        ? "Tambahkan minimal 3-5 hashtag yang relevant, satu pertanyaan, dan ajakan share"
        : engagementPotential < 75
        ? "Engagement sudah baik, tapi tambahkan hashtag yang lebih specific dan niche"
        : "Engagement potential sangat tinggi! Konten ini kemungkinan besar akan viral",
    },
  ];

  // Weighted overall score from components
  const calculatedScore = Math.round(
    (hookPower * 0.25 + emotionalTrigger * 0.20 + ctaUrgency * 0.20 +
      copyClarity * 0.20 + engagementPotential * 0.15)
  );

  return (
    <div className="glass-card p-5 transition-all duration-200 lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            AI Analysis
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>🧠</span> AI Content Score Breakdown
          </h3>
        </div>

        {/* Score badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              overallScore >= 70
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : overallScore >= 50
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {overallScore}/100 · {label}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-gray-400 dark:text-gray-500 ${expanded ? "rotate-180" : ""}`}
            aria-label={expanded ? "Sembunyikan breakdown" : "Lihat breakdown"}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Skor Keseluruhan</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {overallScore}/100
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              overallScore >= 70
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : overallScore >= 50
                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                : "bg-gradient-to-r from-red-400 to-rose-500"
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          Skor dihitung dari 5 komponen: Hook Power (25%), Emotional Trigger (20%), CTA Urgency (20%), Copy Clarity (20%), Engagement (15%)
        </p>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/10 animate-slide-up">
          {components.map((comp) => (
            <div key={comp.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0">{comp.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {comp.name}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {comp.description}
                  </span>
                </div>
                <span className={`text-xs font-bold ${
                  comp.score >= 70 ? "text-green-500" : comp.score >= 50 ? "text-yellow-500" : "text-red-500"
                }`}>
                  {comp.score}/100
                </span>
              </div>
              <ScoreBar
                score={comp.score}
                maxScore={comp.maxScore}
                colorClass={
                  comp.score >= 70 ? "text-green-500" : comp.score >= 50 ? "text-yellow-500" : "text-red-500"
                }
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-5 leading-relaxed">
                💡 {comp.suggestion}
              </p>
            </div>
          ))}

          {/* Tips summary */}
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-2">
              ✨ Rekomendasi Cepat
            </p>
            <ul className="space-y-1">
              {components
                .filter((c) => c.score < 70)
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((c) => (
                  <li key={c.name} className="text-[10px] text-purple-600 dark:text-purple-400 flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span><strong>{c.name}</strong>: {c.suggestion.split(".")[0]}.</span>
                  </li>
                ))}
              {components.filter((c) => c.score < 70).length === 0 && (
                <li className="text-[10px] text-green-600 dark:text-green-400 flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">✅</span>
                  Semua komponen sudah di atas 70! Konten kamu sangat kuat.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Toggle hint */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
        >
          Lihat detail breakdown →
        </button>
      )}
    </div>
  );
}