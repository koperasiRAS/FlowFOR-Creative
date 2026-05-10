"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import type { HistoryItem } from "./GeneratorDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

  // Group by day
  const groupedByDay: Record<string, number> = {};
  [...history].forEach((item) => {
    const date = new Date(item.createdAt);
    const key = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    groupedByDay[key] = (groupedByDay[key] || 0) + 1;
  });

  const labels = Object.keys(groupedByDay);
  const counts = Object.values(groupedByDay);

  const isEmpty = history.length === 0;

  const textColor = isDark ? "#94a3b8" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const barBg = isDark ? "rgba(124, 58, 237, 0.5)" : "rgba(124, 58, 237, 0.4)";
  const barBorder = "#7c3aed";

  const data = {
    labels,
    datasets: [
      {
        label: "Campaigns",
        data: counts,
        backgroundColor: barBg,
        borderColor: barBorder,
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          title: (ctx: { label: string }[]) => ctx[0]?.label ?? "",
          label: (ctx: { raw: unknown }) => `${ctx.raw} campaign`,
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
        max: Math.max(...counts, 3) + 1,
        ticks: {
          color: textColor,
          stepSize: 1,
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
            <span>📊</span> Campaign Activity
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-28 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Generate campaign untuk melihat aktivitas kamu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Chart
          </span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
            <span>📊</span> Campaign Activity
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {history.length} campaign
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
          <p className="text-base font-bold text-purple-600 dark:text-purple-400">{history.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Hari Aktif</p>
          <p className="text-base font-bold text-green-600 dark:text-green-400">{labels.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Rata-rata</p>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {labels.length > 0 ? (history.length / labels.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-36">
        <Bar data={data} options={options} />
      </div>

      <div className="mt-2 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Tren campaign berdasarkan tanggal pembuatan
        </p>
      </div>
    </div>
  );
}
