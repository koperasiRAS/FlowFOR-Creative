"use client";

import { useState } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import type { ContentCalendarEntry } from "./GeneratorDashboard";

interface ContentCalendarProps {
  onBack: () => void;
  productName?: string;
  calendarData?: ContentCalendarEntry[];
}

const PLATFORM_META: Record<
  string,
  { color: string; label: string; short: string }
> = {
  Instagram: { color: "bg-pink-500", label: "Instagram", short: "IG" },
  TikTok: { color: "bg-black", label: "TikTok", short: "TT" },
  WhatsApp: { color: "bg-green-500", label: "WhatsApp", short: "WA" },
  YouTube: { color: "bg-red-500", label: "YouTube", short: "YT" },
};

const TYPE_META: Record<string, string> = {
  Reels: "bg-purple-100 text-purple-700",
  Story: "bg-blue-100 text-blue-700",
  Post: "bg-gray-100 text-gray-700",
  Thread: "bg-sky-100 text-sky-700",
  Broadcast: "bg-green-100 text-green-700",
  Shorts: "bg-red-100 text-red-700",
};

// Build a 5-week grid (35 cells), starting Monday
function buildGrid(entries: ContentCalendarEntry[]) {
  const map = new Map(entries.map((e) => [e.day, e]));
  // Day 1 starts on Monday — offset 0
  const grid: (ContentCalendarEntry | null)[] = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i + 1;
    return map.get(dayNum) ?? null;
  });
  return grid;
}

export default function ContentCalendar({
  onBack,
  productName = "Campaign",
  calendarData = [],
}: ContentCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const grid = buildGrid(calendarData);

  const selectedEntry =
    expandedDay !== null
      ? calendarData.find((e) => e.day === expandedDay) ?? null
      : null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <button
        onClick={onBack}
        className="mb-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
      >
        <ArrowLeft size={14} /> Kembali ke Generator
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Content Calendar — {productName}
          </h2>
          <p className="text-xs text-gray-400">
            {calendarData.length} posting days · 30-day plan
          </p>
        </div>
        <button className="text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center gap-1.5">
          📄 Export Calendar as PDF
        </button>
      </div>

      {calendarData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Content Calendar belum tersedia</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate campaign untuk melihat calendar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Calendar Grid */}
          <div className="glass-card p-3 md:p-4 overflow-x-auto">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1 min-w-[500px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-semibold text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 min-w-[500px]">
              {grid.map((entry, i) => {
                const isSelected = entry?.day === expandedDay;
                const isActive = entry !== null;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setExpandedDay(
                        isActive ? (isSelected ? null : entry!.day) : null
                      )
                    }
                    className={[
                      "min-h-[56px] rounded-lg p-1.5 border text-left transition-all text-xs",
                      isActive
                        ? isSelected
                          ? "bg-purple-100 border-purple-400 shadow-sm"
                          : "bg-purple-50 border-purple-200 hover:border-purple-400 cursor-pointer"
                        : "bg-gray-50 border-transparent opacity-30 cursor-default",
                    ].join(" ")}
                  >
                    <p className="font-medium text-gray-500 text-[11px]">{i + 1}</p>
                    {entry && (
                      <div className="mt-0.5 flex items-center gap-0.5 flex-wrap">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            PLATFORM_META[entry.platform]?.color ?? "bg-gray-400"
                          }`}
                          title={entry.platform}
                        >
                          <span className="text-white text-[7px] font-bold leading-none">
                            {PLATFORM_META[entry.platform]?.short ?? "?"}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded Day Card */}
          {selectedEntry && (
            <div className="glass-card p-4 border border-purple-200 animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">
                    {selectedEntry.date}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${
                        PLATFORM_META[selectedEntry.platform]?.color ?? "bg-gray-400"
                      }`}
                    >
                      {PLATFORM_META[selectedEntry.platform]?.label ??
                        selectedEntry.platform}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        TYPE_META[selectedEntry.type] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedEntry.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedDay(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Topic
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedEntry.topic}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Caption Hint
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    {selectedEntry.caption_hint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}