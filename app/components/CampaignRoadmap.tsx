"use client";

import { useEffect, useState } from "react";
import type { ContentCalendarEntry } from "./GeneratorDashboard";
import { useSettings } from "./SettingsContext";

interface CampaignRoadmapProps {
  calendarData?: ContentCalendarEntry[];
  productName?: string;
}

interface TimelinePhase {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  entries: ContentCalendarEntry[];
  dateRange: string;
  description: string;
}

function classifyPhases(entries: ContentCalendarEntry[]): TimelinePhase[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.day - b.day);
  const firstDay = sorted[0].day;
  const lastDay = sorted[sorted.length - 1].day;
  const totalDays = lastDay - firstDay + 1;
  const midpoint = firstDay + Math.floor(totalDays / 2);

  // Split into 3 phases
  const preLaunch = sorted.filter((e) => e.day < midpoint - 2);
  const launchDay = sorted.filter(
    (e) => e.day >= midpoint - 2 && e.day <= midpoint + 2
  );
  const postLaunch = sorted.filter((e) => e.day > midpoint + 2);

  const today = new Date();
  const getDate = (day: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), day);
    return d.toLocaleString("id-ID", { day: "numeric", month: "short" });
  };

  const phases: TimelinePhase[] = [];

  if (preLaunch.length > 0) {
    phases.push({
      label: "Pre-Launch",
      icon: "🚀",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      entries: preLaunch,
      dateRange: `${getDate(preLaunch[0].day)} – ${getDate(preLaunch[preLaunch.length - 1].day)}`,
      description: "Build anticipation & audience foundation",
    });
  }

  phases.push({
    label: "Launch Day",
    icon: "🎯",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    borderColor: "border-purple-400 dark:border-purple-600 shadow-purple-200/50 dark:shadow-purple-900/50",
    entries: launchDay,
    dateRange: `${getDate(launchDay[0]?.day ?? midpoint)} – ${getDate(launchDay[launchDay.length - 1]?.day ?? midpoint)}`,
    description: "Maximum visibility & conversion push",
  });

  if (postLaunch.length > 0) {
    phases.push({
      label: "Post-Launch",
      icon: "📈",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      entries: postLaunch,
      dateRange: `${getDate(postLaunch[0].day)} – ${getDate(postLaunch[postLaunch.length - 1].day)}`,
      description: "Engagement & retargeting loop",
    });
  }

  return phases;
}

const PLATFORM_SHORT: Record<string, string> = {
  Instagram: "IG",
  TikTok: "TT",
  WhatsApp: "WA",
  YouTube: "YT",
};

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: "bg-pink-500",
  TikTok: "bg-black",
  WhatsApp: "bg-green-500",
  YouTube: "bg-red-500",
};

export default function CampaignRoadmap({
  calendarData = [],
  productName = "Campaign",
}: CampaignRoadmapProps) {
  const { isDark } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<string | null>("Launch Day");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-5 lg:col-span-2 min-h-[200px]">
        <div className="animate-pulse h-full">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const phases = classifyPhases(calendarData);

  if (phases.length === 0) {
    return null;
  }

  const totalEntries = calendarData.length;

  return (
    <div className="glass-card p-5 lg:col-span-2 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Roadmap
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>🗺️</span> Campaign Roadmap
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {totalEntries} posts · 30-day plan
          </span>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-14 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-300 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 rounded-full mx-4" />

        {/* Phase cards */}
        <div className="grid grid-cols-3 gap-3 relative">
          {phases.map((phase) => {
            const isActive = expandedPhase === phase.label;
            const isLaunch = phase.label === "Launch Day";
            const cardCount = phase.entries.length;

            return (
              <button
                key={phase.label}
                onClick={() => setExpandedPhase(isActive ? null : phase.label)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group ${
                  isActive
                    ? `${phase.borderColor} ${phase.bgColor} shadow-lg`
                    : "border-gray-100 dark:border-white/10 bg-white/50 dark:bg-slate-800/30 hover:border-gray-200 dark:hover:border-white/20"
                } ${isLaunch ? "ring-2 ring-purple-400/30" : ""}`}
              >
                {/* Icon badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${
                  isLaunch ? "bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-300" : "bg-white dark:bg-slate-700 shadow-sm"
                }`}>
                  {phase.icon}
                </div>

                {/* Phase info */}
                <div className="mb-2">
                  <p className={`text-xs font-bold ${phase.color} uppercase tracking-wider mb-0.5`}>
                    {phase.label}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {phase.dateRange}
                  </p>
                </div>

                {/* Post count badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-black ${isLaunch ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}>
                    {cardCount}
                  </span>
                  <span className="text-[10px] text-gray-400">posts</span>
                </div>

                {/* Mini platform chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {["Instagram", "TikTok", "WhatsApp", "YouTube"]
                    .filter((p) => phase.entries.some((e) => e.platform === p))
                    .slice(0, 4)
                    .map((p) => (
                      <span
                        key={p}
                        className={`${PLATFORM_COLOR[p]} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full`}
                      >
                        {PLATFORM_SHORT[p]}
                      </span>
                    ))}
                </div>

                {/* Description */}
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {phase.description}
                </p>

                {/* Expand indicator */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isActive ? `${phase.bgColor} border-2 ${phase.borderColor}` : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/20"
                }`}>
                  <span className={`text-[10px] ${isActive ? "" : "text-gray-300 dark:text-gray-500"}`}>
                    {isActive ? "×" : "↓"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded Phase Details */}
        {expandedPhase && (
          <div className="mt-8 animate-slide-up">
            {(() => {
              const phase = phases.find((p) => p.label === expandedPhase);
              if (!phase) return null;
              return (
                <div className={`p-4 rounded-2xl border-2 ${phase.borderColor} ${phase.bgColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{phase.icon}</span>
                      <p className={`font-bold ${phase.color}`}>{phase.label}</p>
                      <span className="text-[10px] text-gray-400">· {phase.entries.length} posting</span>
                    </div>
                    <button
                      onClick={() => setExpandedPhase(null)}
                      className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {/* Entry list */}
                  <div className="space-y-2">
                    {phase.entries
                      .sort((a, b) => a.day - b.day)
                      .map((entry, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3"
                        >
                          <div className="text-center min-w-[40px]">
                            <p className="text-[10px] font-bold text-gray-400">
                              {entry.date.split(",")[0]}
                            </p>
                            <p className="text-lg font-black text-gray-700 dark:text-gray-200">
                              {entry.day}
                            </p>
                          </div>
                          <div className={`w-1 h-10 rounded-full ${PLATFORM_COLOR[entry.platform] ?? "bg-gray-400"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`${PLATFORM_COLOR[entry.platform] ?? "bg-gray-400"} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                                {entry.platform}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">{entry.type}</span>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                              {entry.topic}
                            </p>
                          </div>
                          <p className="text-[9px] text-gray-400 italic max-w-[140px]">
                            {entry.caption_hint}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-[10px] text-gray-400 font-medium">Platform:</p>
          {Object.entries(PLATFORM_SHORT).map(([platform, short]) => (
            <div key={platform} className="flex items-center gap-1">
              <span className={`w-4 h-4 rounded ${PLATFORM_COLOR[platform]} flex items-center justify-center`}>
                <span className="text-white text-[6px] font-black">{short}</span>
              </span>
              <span className="text-[10px] text-gray-500">{platform}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-4 h-0.5 rounded bg-gradient-to-r from-blue-200 to-green-200" />
            <span className="text-[10px] text-gray-400">Campaign Timeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}