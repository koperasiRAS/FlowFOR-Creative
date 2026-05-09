"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles, Target, Zap, TrendingUp, Calendar, Award } from "lucide-react";

const STORAGE_KEY = "flowfor_welcome_shown";

const STEPS = [
  {
    icon: "🚀",
    title: "Isi Form Campaign",
    desc: "Mulai dengan mengisi nama produk, target audiens, deskripsi, dan pilih platform yang ingin dituju.",
  },
  {
    icon: "📸",
    title: "Upload Gambar (Opsional)",
    desc: "Tambahkan gambar cover produk untuk membantu AI memberikan insights visual yang lebih akurat dan sesuai.",
  },
  {
    icon: "✨",
    title: "Generate Launch Kit",
    desc: "Klik Generate dan biarkan AI Gemini membuatkan sales page, caption sosmed, broadcast message, storyboard, dan kalender konten secara otomatis.",
  },
  {
    icon: "🔮",
    title: "AI Visual Analysis",
    desc: "Kalau kamu upload gambar, AI akan menganalisa tema visual, campaign angle, warna dominan, dan memberikan rekomendasi untuk improve copywriting.",
  },
  {
    icon: "🎯",
    title: "AI Score Breakdown",
    desc: "Lihat detailed analysis dari Vibe Score — hook power, emotional trigger, CTA urgency, copy clarity, dan engagement potential.",
  },
  {
    icon: "🤖",
    title: "AI Campaign Advisor",
    desc: "Punya pertanyaan soal campaign? Tanya langsung ke AI Advisor di dashboard tanpa perlu keluar aplikasi. Hasil bisa langsung di-apply ke campaign.",
  },
  {
    icon: "🗂️",
    title: "Niche Competitor Brief",
    desc: "Dapatkan analisis kompetitor, content patterns yang work, dan strategic action plan untuk niche kamu — langsung dari hasil generate campaign.",
  },
  {
    icon: "📤",
    title: "Export & Share",
    desc: "Download semua hasil dalam format ZIP atau PDF report profesional, lalu share ke LinkedIn atau tim kamu.",
  },
];

export default function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setOpen(true), 300);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  if (!open) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <h2 className="font-bold text-base">Selamat Datang di FlowFOR Creative!</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm font-bold transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 text-xs mt-1">
            Panduan singkat menggunakan Smart Launch Command Center
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-purple-100 dark:bg-purple-900/30">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-4xl">{current.icon}</span>
            <div>
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                Step {step + 1} dari {STEPS.length}
              </p>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{current.title}</h3>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-6">
            {current.desc}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { icon: Target, label: "Vibe Score", color: "text-amber-500" },
              { icon: Zap, label: "AI Analysis", color: "text-purple-500" },
              { icon: TrendingUp, label: "Campaign Planner", color: "text-green-500" },
              { icon: Award, label: "Export Report", color: "text-blue-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                <Icon size={14} className={color} />
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-5 bg-purple-500"
                    : i < step
                    ? "w-1.5 bg-purple-300"
                    : "w-1.5 bg-gray-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Lewati
            </button>
            <button
              onClick={handleNext}
              className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {step < STEPS.length - 1 ? (
                <>
                  <span>{current.icon} Lanjut</span>
                  <ChevronRight size={14} />
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Mulai Sekarang!
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}