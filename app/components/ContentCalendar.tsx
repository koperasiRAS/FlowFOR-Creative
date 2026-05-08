"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import type { ContentCalendarEntry } from "./GeneratorDashboard";

interface ContentCalendarProps {
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

// Build a real calendar grid for the current month
function buildGrid(entries: ContentCalendarEntry[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // First day of the month (0 = Sunday, 1 = Monday...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust to start Monday (0 = Monday, 6 = Sunday)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const map = new Map(entries.map((e) => [e.day, e]));

  // Create a 42-cell grid (6 weeks) to cover any month
  const grid: (ContentCalendarEntry | null)[] = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum >= 1 && dayNum <= daysInMonth) {
      return map.get(dayNum) ?? null;
    }
    return null; // Empty cell for padding
  });
  
  return { grid, offset, daysInMonth, monthName: now.toLocaleString('id-ID', { month: 'long' }), year };
}

export default function ContentCalendar({
  productName = "Campaign",
  calendarData = [],
}: ContentCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-5 lg:col-span-2 min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const { grid, monthName, year, offset } = buildGrid(calendarData);

  const selectedEntry =
    expandedDay !== null
      ? calendarData.find((e) => e.day === expandedDay) ?? null
      : null;

  return (
    <div className="glass-card p-5 relative group transition-all duration-200 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Calendar
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>📅</span> Strategy Calendar — {monthName} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400 hidden sm:block">
            {calendarData.length} posting days · 30-day plan
          </p>
        </div>
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
                  className="text-center text-[10px] font-bold text-purple-600/70 dark:text-purple-400/70 py-1.5 uppercase tracking-widest bg-purple-50/50 dark:bg-purple-900/10 rounded-md mb-1"
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
                      isActive ? setExpandedDay(isSelected ? null : entry!.day) : null
                    }
                    className={[
                      "min-h-[64px] rounded-lg p-1.5 border text-left transition-all text-xs",
                      isActive
                        ? isSelected
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-400 shadow-sm"
                          : "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50 hover:border-purple-400 cursor-pointer"
                        : "bg-gray-50/50 dark:bg-gray-900/20 border-transparent opacity-30 cursor-default",
                    ].join(" ")}
                  >
                    <p className="font-bold text-gray-500 dark:text-gray-400 text-[10px]">
                      {i - offset + 1 >= 1 && i - offset + 1 <= 31 ? i - offset + 1 : ""}
                    </p>
                    {entry && (
                      <div className="mt-1 flex flex-col gap-1">
                        <div
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white text-center ${
                            PLATFORM_META[entry.platform]?.color ?? "bg-gray-400"
                          }`}
                        >
                          {PLATFORM_META[entry.platform]?.short ?? entry.platform}
                        </div>
                        <div className="text-[9px] text-purple-700 dark:text-purple-300 font-medium truncate">
                          {entry.type}
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
