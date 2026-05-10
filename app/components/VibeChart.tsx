"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import type { HistoryItem } from "./GeneratorDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VibeChartProps {
  history: HistoryItem[];
}

export default function VibeChart({ history }: VibeChartProps) {
  const { isDark } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare chart data — reverse so oldest → newest left to right
  const sortedHistory = [...history].reverse();
  const labels = sortedHistory.map((item) => {
    const date = new Date(item.createdAt);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  });
  const scores = sortedHistory.map((item) => item.result?.vibeScore?.vibeScore ?? 0);

  const isEmpty = history.length === 0;

  const textColor = isDark ? "#94a3b8" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const pointBg = isDark ? "#1e293b" : "#ffffff";

  // Chart data config
  const data = {
    labels,
    datasets: [
      {
        label: "Vibe Score",
        data: scores,
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: pointBg,
        pointBorderColor: "#7c3aed",
        pointBorderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f1f5f9" : "#1f2937",
        bodyColor: isDark ? "#cbd5e1" : "#4b5563",
        borderColor: isDark ? "rgba(139,92,246,0.3)" : "rgba(124,58,237,0.2)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          title: (ctx: { label: string; dataIndex: number }[]) => {
            const idx = ctx[0].dataIndex;
            const item = sortedHistory[idx];
            return item?.productName ?? ctx[0].label;
          },
          label: (ctx: { raw: unknown; dataIndex: number }) => {
            const score = ctx.raw as number;
            const label = sortedHistory[ctx.dataIndex]?.result?.vibeScore?.label ?? "";
            return `Vibe Score: ${score}/100 — ${label}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: textColor,
          stepSize: 20,
          font: { size: 11 },
          callback: (v: string | number) => `${v}`,
        },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  };

  if (!mounted) {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="animate-pulse w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Chart
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>🔥</span> Vibe Score Trend
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-28 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Generate lebih dari 1 campaign untuk melihat trend
          </p>
        </div>
      </div>
    );
  }

  const avgScore =
    history.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const maxScore = Math.max(...scores, 0);
  const minScore = Math.min(...scores, 0);
  const latestScore = scores[scores.length - 1] ?? 0;

  // Score color helpers
  const scoreColor = (s: number) =>
    s >= 70 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444";
  const scoreLabel = (s: number) =>
    s >= 70 ? "🟢 Tinggi" : s >= 50 ? "🟡 Sedang" : "🔴 Perlu Perbaiki";

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Chart
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>🔥</span> Vibe Score Trend
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {history.length} campaign
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Rata-rata</p>
          <p className="text-base font-bold" style={{ color: scoreColor(avgScore) }}>
            {avgScore}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">/100</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Terbaik</p>
          <p className="text-base font-bold" style={{ color: scoreColor(maxScore) }}>
            {maxScore}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">/100</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Terendah</p>
          <p className="text-base font-bold" style={{ color: scoreColor(minScore) }}>
            {minScore}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">/100</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Terbaru</p>
          <p className="text-base font-bold" style={{ color: scoreColor(latestScore) }}>
            {latestScore}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">/100</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <Line data={data} options={options} />
      </div>

      {/* Legend */}
      <div className="mt-2 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {scoreLabel(latestScore)} · Tren berdasarkan tanggal pembuatan campaign
        </p>
      </div>
    </div>
  );
}