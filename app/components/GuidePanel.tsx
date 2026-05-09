"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown } from "lucide-react";
import { useSettings } from "./SettingsContext";

interface GuidePanelProps {
  onBack: () => void;
}

interface GuideTextItem {
  type: "text";
  value: string;
}

interface GuideListItem {
  type: "list";
  value: { label: string; desc: string }[];
}

interface GuideHighlightItem {
  type: "highlight";
  value: string;
  label: string;
}

interface GuideTipItem {
  type: "tip";
  value: string;
}

type GuideContentItem = GuideTextItem | GuideListItem | GuideHighlightItem | GuideTipItem;

interface GuideSection {
  id: string;
  icon: string;
  title: string;
  color: string;
  borderColor: string;
  content: GuideContentItem[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "overview",
    icon: "📌",
    title: "Apa itu FlowFOR Creative?",
    color: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    content: [
      { type: "text", value: "FlowFOR Creative adalah AI-powered Smart Launch Command Center untuk kreator konten dan UMKM Indonesia. Tool ini dibuat khusus untuk membantu kamu launching produk digital lebih cepat dan lebih strategis." },
      { type: "highlight", value: "Dari ide sampai launch kit lengkap — dalam hitungan detik.", label: "Fokus Utama" },
      { type: "text", value: "Powered oleh Google Gemini 2.5 Flash AI. Semua fitur dirancang agar mudah dipakai, bahkan untuk pemula. Tidak perlu skill coding — cukup isi form dan biarkan AI yang bekerja." },
    ],
  },
  {
    id: "form",
    icon: "📝",
    title: "Step 1 — Isi Form Campaign",
    color: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    content: [
      { type: "text", value: "Mulai dengan mengisi form di sisi kiri halaman Dashboard. Semua field wajib diisi kecuali yang ditandai opsional." },
      {
        type: "list",
        value: [
          { label: "Nama Produk / Campaign", desc: "Judul campaign kamu, contoh: Bundle Template Canva Pro" },
          { label: "Target Audiens", desc: "Siapa yang mau dituju? Bisa pakai tag (tekan Enter untuk tambah)" },
          { label: "Bahasa Output", desc: "Pilih Bahasa Indonesia atau English" },
          { label: "Sales Page", desc: "Panjang pendek sales page: Short / Medium / Long" },
          { label: "Caption", desc: "Panjang caption sosmed: Pendek / Sedang / Panjang" },
          { label: "Platform", desc: "Pilih platform yang dituju: Instagram, TikTok, YouTube, WhatsApp" },
          { label: "Deskripsi Produk", desc: "Jelaskan produk atau campaign kamu secara singkat" },
          { label: "Jenis Konten", desc: "Pilih tipe konten: Produk Digital, Jasa/Service, Edukasi, dll" },
        ],
      },
    ],
  },
  {
    id: "image",
    icon: "📸",
    title: "Step 2 — Upload Gambar (Opsional)",
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-300 dark:border-indigo-700",
    content: [
      { type: "text", value: "Tambahkan gambar cover atau poster produk kamu. Ini akan membantu AI memberikan insights visual yang lebih akurat." },
      { type: "tip", value: "Upload gambar tidak wajib — campaign tetap bisa di-generate tanpa gambar. Tapi kalau ada gambar, hasilnya bisa lebih sesuai dengan tema visual produk kamu." },
      {
        type: "list",
        value: [
          { label: "Format", desc: "JPEG, PNG, WebP" },
          { label: "Ukuran maks", desc: "5MB" },
          { label: "Cara upload", desc: "Drag & drop atau klik area upload" },
        ],
      },
    ],
  },
  {
    id: "generate",
    icon: "✨",
    title: "Step 3 — Generate Launch Kit",
    color: "bg-violet-100 dark:bg-violet-900/30",
    borderColor: "border-violet-300 dark:border-violet-700",
    content: [
      { type: "text", value: "Klik tombol 'Generate Launch Kit' dan tunggu sekitar 10-30 detik. AI akan membuatkan:" },
      {
        type: "list",
        value: [
          { label: "📝 Sales Page Copy", desc: "Hook + 5 bullet points + CTA" },
          { label: "📱 Social Caption", desc: "Hook + body + CTA + hashtag untuk Reels/TikTok" },
          { label: "💬 Broadcast Message", desc: "Soft-selling WA/Telegram message" },
          { label: "✅ Launch To-Do List", desc: "8+ actionable items dari pre-launch ke post-launch" },
          { label: "🎬 Visual Storyboard", desc: "8-shot video plan dengan visual & audio cues" },
          { label: "📄 Shoot Script", desc: "Scene-by-scene production guide" },
          { label: "📅 Content Calendar", desc: "Monthly strategy grid dengan platform/day/type" },
          { label: "🗺️ Campaign Roadmap", desc: "Visual 3-phase timeline" },
          { label: "🔥 Vibe Score", desc: "0-100 viral potential rating" },
          { label: "🧠 AI Score Breakdown", desc: "5-component analysis" },
        ],
      },
    ],
  },
  {
    id: "ai-analysis",
    icon: "🔮",
    title: "Fitur AI Analysis",
    color: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    content: [
      { type: "text", value: "Kalau kamu upload gambar, AI akan analisa visual produk dan memberikan:" },
      {
        type: "list",
        value: [
          { label: "🎨 Tema Visual", desc: "Warna dominan, gaya desain, mood" },
          { label: "📐 Campaign Angle", desc: "Sudut pandang paling efektif" },
          { label: "⚡ Visual Strength", desc: "Kekuatan visual yang sudah bagus" },
          { label: "🔧 Improvement", desc: "1 hal yang bisa langsung dibenerin" },
          { label: "🗺️ Platform Recommendation", desc: "Platform paling cocok untuk visual ini" },
          { label: "🎨 Color Palette", desc: "Warna dominan yang bisa dipakai" },
        ],
      },
      { type: "tip", value: "Insights dari AI Visual Analysis langsung di-inject ke prompt utama, jadi hasil copywriting akan lebih sesuai dengan visual produk kamu." },
    ],
  },
  {
    id: "advisor",
    icon: "🤖",
    title: "AI Campaign Advisor",
    color: "bg-sky-100 dark:bg-sky-900/30",
    borderColor: "border-sky-300 dark:border-sky-700",
    content: [
      { type: "text", value: "Punya pertanyaan soal campaign? Tanya langsung ke AI Advisor tanpa perlu keluar aplikasi." },
      {
        type: "list",
        value: [
          { label: "Contoh tanya", desc: '"Kok vibe score gua rendah? Apa yang perlu dibenerin?"' },
          { label: "Contoh tanya", desc: '"Rekomendasiin cara naikkan hook power"' },
          { label: "Contoh tanya", desc: '"Gimana sih bikin CTA yang lebih urgent?"' },
        ],
      },
      { type: "text", value: "AI akan jawab dan kalau ada improvement suggestion, kamu bisa langsung klik 'Apply' untuk update campaign dengan versi yang lebih baik." },
    ],
  },
  {
    id: "niche-brief",
    icon: "🎯",
    title: "Niche Competitor Brief",
    color: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-300 dark:border-rose-700",
    content: [
      { type: "text", value: "Dapat insights strategis tentang niche kamu — siapa kompetitornya, pattern konten apa yang work, dan action plan untuk menang." },
      {
        type: "list",
        value: [
          { label: "📋 Niche Overview", desc: "Ukuran niche, tingkat kompetisi, cara monetize" },
          { label: "👥 Competitors", desc: "3 akun yang harus di-follow dengan alasan" },
          { label: "📊 Content Patterns", desc: "5 pattern yang work di niche ini" },
          { label: "🎯 Strategic Insights", desc: "Differentiation, Quick Win, Common Mistake, Secret Weapon" },
          { label: "✅ Action Plan", desc: "3 langkah yang harus dilakukan sekarang" },
        ],
      },
      { type: "text", value: "Niche akan otomatis pre-fill dari nama produk/deskripsi campaign yang sedang aktif. Kamu juga bisa ketik manual niche yang berbeda." },
    ],
  },
  {
    id: "export",
    icon: "📤",
    title: "Export & Share",
    color: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-300 dark:border-green-700",
    content: [
      { type: "text", value: "Setelah semua selesai, kamu bisa export hasil dalam berbagai format:" },
      {
        type: "list",
        value: [
          { label: "📄 PDF Report", desc: "Branded 7-page professional report" },
          { label: "🗜️ ZIP File", desc: "Semua file teks + storyboard dalam ZIP" },
          { label: "📅 Google Calendar", desc: "Export content calendar ke Google Calendar" },
          { label: "📱 ICS File", desc: "Download .ics untuk Apple Calendar, Outlook" },
          { label: "🔗 Share LinkedIn", desc: "Share hasil ke LinkedIn dalam 1 klik" },
        ],
      },
    ],
  },
];

export default function GuidePanel({ onBack }: GuidePanelProps) {
  const { isDark } = useSettings();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
            <h1 className="font-black text-gray-800 dark:text-gray-100 text-base">Panduan FlowFOR Creative</h1>
          </div>
        </div>

        {/* Intro banner */}
        <div className="relative mb-6 p-5 rounded-3xl bg-gradient-to-r from-yellow-200 via-orange-100 to-pink-100 dark:from-yellow-900/30 dark:via-orange-900/20 dark:to-pink-900/30 border-2 border-dashed border-orange-300 dark:border-orange-700 shadow-sm">
          <div className="absolute -top-3 left-8 w-12 h-6 bg-yellow-300/60 dark:bg-yellow-700/40 rounded-sm rotate-3" />
          <div className="absolute -top-3 right-12 w-10 h-5 bg-pink-200/60 dark:bg-pink-800/40 rounded-sm -rotate-2" />
          <div className="flex items-start gap-3">
            <span className="text-3xl">👋</span>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">Selamat datang, Kreator!</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Panduan ini akan membantu kamu memahami cara menggunakan FlowFOR Creative step by step.
                Yuk mulai dengan expand setiap section di bawah ini!
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, sectionIndex) => {
            const isOpen = openSections.has(section.id);
            return (
              <div
                key={section.id}
                className={`rounded-2xl border-2 ${section.borderColor} ${section.color} overflow-hidden shadow-sm`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className="text-2xl">{section.icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-gray-800 dark:text-gray-100 text-sm">{section.title}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-slide-up">
                    <div className="border-l-2 border-red-300 dark:border-red-700 pl-4 space-y-3">
                      {section.content.map((item, i) => {
                        if (item.type === "text") {
                          return (
                            <p key={i} className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                              {item.value}
                            </p>
                          );
                        }
                        if (item.type === "list") {
                          return (
                            <div key={i} className="space-y-2">
                              {item.value.map((li, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 flex-shrink-0 mt-1.5" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{li.label}</span>
                                    <span className="text-[11px] text-gray-600 dark:text-gray-300"> — {li.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        if (item.type === "highlight") {
                          return (
                            <div key={i} className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-3 border border-yellow-200 dark:border-yellow-700">
                              <span className="text-sm">💡</span>
                              <div>
                                <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">{item.value}</p>
                              </div>
                            </div>
                          );
                        }
                        if (item.type === "tip") {
                          return (
                            <div key={i} className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
                              <span className="text-sm">🔖</span>
                              <p className="text-[11px] text-blue-700 dark:text-blue-200 leading-relaxed">{item.value}</p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Stats */}
          <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-indigo-900/30 border-2 border-dashed border-purple-300 dark:border-purple-700 shadow-sm">
            <p className="font-black text-gray-800 dark:text-gray-100 text-sm mb-3 text-center">Fitur Unggulan FlowFOR Creative</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { icon: "⚡", label: "Generate < 30 detik" },
                { icon: "🔮", label: "AI Visual Analysis" },
                { icon: "🤖", label: "AI Campaign Advisor" },
                { icon: "📄", label: "Export PDF + ZIP" },
                { icon: "📅", label: "Google Calendar" },
                { icon: "🎯", label: "Niche Competitor" },
                { icon: "🔥", label: "Vibe Score 0-100" },
                { icon: "🌐", label: "Bahasa Indonesia" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 rounded-xl px-3 py-2">
                  <span>{icon}</span>
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Built with for #JuaraVibeCoding by Google</p>
          </div>
        </div>
      </div>
    </div>
  );
}
