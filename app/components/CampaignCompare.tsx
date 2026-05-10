"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { HistoryItem } from "./GeneratorDashboard";

interface CampaignCompareProps {
  history: HistoryItem[];
  onLoadCampaign?: (item: HistoryItem) => void;
}

interface ComparisonItem {
  item: HistoryItem;
  selected: boolean;
}

export default function CampaignCompare({ history, onLoadCampaign }: CampaignCompareProps) {
  // Build selectable list (max last 30 items)
  const selectableItems = history.slice(0, 30);
  const [selections, setSelections] = useState<ComparisonItem[]>(
    selectableItems.slice(0, Math.min(2, selectableItems.length)).map((item) => ({
      item,
      selected: true,
    }))
  );

  const selectedItems = selections.filter((s) => s.selected);
  const canCompare = selectedItems.length === 2;
  const [itemA, itemB] = selectedItems;

  const toggleSelect = (item: HistoryItem) => {
    const alreadySelected = selections.find(
      (s) => s.item.id === item.id && s.selected
    );

    if (alreadySelected) {
      // Deselect
      setSelections((prev) =>
        prev.map((s) => (s.item.id === item.id ? { ...s, selected: false } : s))
      );
    } else if (selectedItems.length < 2) {
      // Select (max 2)
      setSelections((prev) => [
        ...prev.map((s) => (s.item.id === item.id ? { ...s, selected: true } : s)),
      ]);
    } else {
      // Replace the oldest selection
      setSelections((prev) => {
        const updated = prev.map((s, i) =>
          i === 0 ? { ...s, selected: false } : s
        );
        return updated.map((s) =>
          s.item.id === item.id ? { ...s, selected: true } : s
        );
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Compare vibe scores
  const compareScore = (a: number, b: number) => {
    if (a > b) return "A";
    if (b > a) return "B";
    return "tie";
  };

  // Compare text length (as proxy for content depth)
  const compareLength = (a: string, b: string) => {
    if (a.length > b.length) return "A";
    if (b.length > a.length) return "B";
    return "tie";
  };

  const WinnerBadge = ({ winner }: { winner: string }) => {
    if (winner === "tie") return null;
    const label = winner === "A" ? "Kiri" : "Kanan";
    return (
      <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        🏆 {label} lebih baik
      </span>
    );
  };

  const ComparisonRow = ({
    label,
    valueA,
    valueB,
    winner,
    winnerBy,
  }: {
    label: string;
    valueA: string | number;
    valueB: string | number;
    winner: string;
    winnerBy?: string;
  }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className={`relative p-3 rounded-xl ${winner === "A" ? "ring-2 ring-green-400/50 bg-green-50/50 dark:bg-green-900/20" : "glass-card"}`}>
        {winner === "A" && (
          <span className="absolute -top-2 -right-2 text-lg">🏆</span>
        )}
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
          {valueA}
        </p>
        {winnerBy && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            {winnerBy}
          </p>
        )}
      </div>
      <div className={`relative p-3 rounded-xl ${winner === "B" ? "ring-2 ring-green-400/50 bg-green-50/50 dark:bg-green-900/20" : "glass-card"}`}>
        {winner === "B" && (
          <span className="absolute -top-2 -right-2 text-lg">🏆</span>
        )}
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
          {valueB}
        </p>
        {winnerBy && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            {winnerBy}
          </p>
        )}
      </div>
    </div>
  );

  // Score comparison mini bar
  const ScoreMiniBar = ({ scoreA, scoreB, winner }: { scoreA: number; scoreB: number; winner: string }) => {
    const max = Math.max(scoreA, scoreB, 100);
    const wA = Math.round((scoreA / max) * 100);
    const wB = Math.round((scoreB / max) * 100);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {scoreA}
          </span>
          <span className={`text-[10px] font-bold ${winner === "A" ? "text-green-500" : winner === "B" ? "text-green-500" : "text-gray-400"}`}>
            {winner === "tie" ? "Sama" : `🏆 Winner`}
          </span>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {scoreB}
          </span>
        </div>
        <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
              winner === "A" ? "bg-purple-500" : winner === "tie" ? "bg-purple-400" : "bg-purple-300"
            }`}
            style={{ width: `${wA}%` }}
          />
          <div
            className={`absolute right-0 top-0 h-full rounded-full transition-all ${
              winner === "B" ? "bg-indigo-500" : winner === "tie" ? "bg-indigo-400" : "bg-indigo-300"
            }`}
            style={{ width: `${wB}%` }}
          />
        </div>
      </div>
    );
  };

  if (history.length < 2) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Minimum 2 campaign diperlukan untuk perbandingan
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Generate lebih banyak campaign terlebih dahulu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Area */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
          Pilih 2 Campaign untuk Dibandingkan
        </h3>

        {/* Quick picks */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {selectableItems.slice(0, 10).map((item) => {
            const isSel = selections.find(
              (s) => s.item.id === item.id && s.selected
            );
            return (
              <button
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSel
                    ? "border-purple-500 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-purple-300"
                }`}
              >
                {isSel && <Check size={10} className="inline mr-1" />}
                {item.productName.length > 15
                  ? item.productName.slice(0, 15) + "..."
                  : item.productName}
              </button>
            );
          })}
        </div>

        {/* Selected slots */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((slot) => {
            const selected = selectedItems[slot];
            return (
              <div
                key={slot}
                className={`p-3 rounded-xl border-2 border-dashed ${
                  selected
                    ? "border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/10"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                }`}
              >
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Slot {slot + 1}
                </p>
                {selected ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {selected.item.productName}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatDate(selected.item.createdAt)}
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                      Vibe Score: {selected.item.result?.vibeScore?.vibeScore ?? "?"}/100
                    </p>
                    <button
                      onClick={() => toggleSelect(selected.item)}
                      className="mt-2 text-[10px] text-red-500 hover:text-red-600"
                    >
                      ✕ Ganti
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Klik campaign di atas untuk memilih
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Panel */}
      {canCompare && itemA && itemB && (
        <div className="glass-card p-5 space-y-5 animate-slide-up">
          {/* Header: Campaign names + scores */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
                {itemA.item.productName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatDate(itemA.item.createdAt)}
              </p>
            </div>
            <div className="px-4 text-center">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">VS</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {itemB.item.productName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatDate(itemB.item.createdAt)}
              </p>
            </div>
          </div>

          {/* Vibe Score comparison */}
          <div className="glass-card p-4 bg-purple-50/50 dark:bg-purple-900/10">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">
              🔥 Vibe Score Comparison
            </p>
            <ScoreMiniBar
              scoreA={itemA.item.result?.vibeScore?.vibeScore ?? 0}
              scoreB={itemB.item.result?.vibeScore?.vibeScore ?? 0}
              winner={compareScore(
                itemA.item.result?.vibeScore?.vibeScore ?? 0,
                itemB.item.result?.vibeScore?.vibeScore ?? 0
              )}
            />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="text-center p-2 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                <p className={`text-lg font-black ${
                  compareScore(itemA.item.result?.vibeScore?.vibeScore ?? 0, itemB.item.result?.vibeScore?.vibeScore ?? 0) === "A"
                    ? "text-green-500"
                    : "text-gray-500"
                }`}>
                  {itemA.item.result?.vibeScore?.vibeScore ?? 0}
                </p>
                <p className="text-[10px] text-gray-400">{itemA.item.result?.vibeScore?.label ?? ""}</p>
              </div>
              <div className="text-center p-2 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                <p className={`text-lg font-black ${
                  compareScore(itemA.item.result?.vibeScore?.vibeScore ?? 0, itemB.item.result?.vibeScore?.vibeScore ?? 0) === "B"
                    ? "text-green-500"
                    : "text-gray-500"
                }`}>
                  {itemB.item.result?.vibeScore?.vibeScore ?? 0}
                </p>
                <p className="text-[10px] text-gray-400">{itemB.item.result?.vibeScore?.label ?? ""}</p>
              </div>
            </div>
          </div>

          {/* Vibe Reasons Comparison */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              📊 AI Analysis Reasons
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-2">Reason Breakdown</p>
                {itemA.item.result?.vibeScore?.reasons?.map((r, i) => (
                  <p key={i} className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    • {r}
                  </p>
                ))}
              </div>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl">
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Reason Breakdown</p>
                {itemB.item.result?.vibeScore?.reasons?.map((r, i) => (
                  <p key={i} className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    • {r}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Caption comparison */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              📱 Caption Comparison
              <WinnerBadge winner={compareLength(itemA.item.result?.caption ?? "", itemB.item.result?.caption ?? "")} />
            </p>
            <ComparisonRow
              label="Caption"
              valueA={(itemA.item.result?.caption ?? "").split("\n")[0] || "-"}
              valueB={(itemB.item.result?.caption ?? "").split("\n")[0] || "-"}
              winner={compareLength(itemA.item.result?.caption ?? "", itemB.item.result?.caption ?? "")}
              winnerBy={`${(itemA.item.result?.caption ?? "").length} vs ${(itemB.item.result?.caption ?? "").length} chars`}
            />
          </div>

          {/* Landing Page comparison */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              📝 Sales Page Comparison
            </p>
            <ComparisonRow
              label="Sales Page"
              valueA={(itemA.item.result?.landingPage ?? "").replace(/<[^>]*>/g, "").split("\n")[0] || "-"}
              valueB={(itemB.item.result?.landingPage ?? "").replace(/<[^>]*>/g, "").split("\n")[0] || "-"}
              winner={compareLength(itemA.item.result?.landingPage ?? "", itemB.item.result?.landingPage ?? "")}
              winnerBy={`${(itemA.item.result?.landingPage ?? "").length} vs ${(itemB.item.result?.landingPage ?? "").length} chars`}
            />
          </div>

          {/* Todo list comparison */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              ✅ Todo List Comparison
            </p>
            <ComparisonRow
              label="Jumlah Todo"
              valueA={`${itemA.item.result?.todoList?.length ?? 0} items`}
              valueB={`${itemB.item.result?.todoList?.length ?? 0} items`}
              winner={
                (itemA.item.result?.todoList?.length ?? 0) > (itemB.item.result?.todoList?.length ?? 0) ? "A" : "B"
              }
            />
          </div>

          {/* Storyboard comparison */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              🎬 Storyboard Comparison
            </p>
            <ComparisonRow
              label="Jumlah Shot"
              valueA={`${itemA.item.result?.storyboard?.length ?? 0} shots`}
              valueB={`${itemB.item.result?.storyboard?.length ?? 0} shots`}
              winner={
                (itemA.item.result?.storyboard?.length ?? 0) > (itemB.item.result?.storyboard?.length ?? 0) ? "A" : "B"
              }
              winnerBy={
                itemA.item.result?.storyboard?.[0]?.shot
                  ? `A: ${itemA.item.result.storyboard[0].shot}`
                  : undefined
              }
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => onLoadCampaign?.(itemA.item)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-all"
            >
              📂 Load `{itemA.item.productName.length > 12 ? itemA.item.productName.slice(0, 12) + "..." : itemA.item.productName}`
            </button>
            <button
              onClick={() => onLoadCampaign?.(itemB.item)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
            >
              📂 Load `{itemB.item.productName.length > 12 ? itemB.item.productName.slice(0, 12) + "..." : itemB.item.productName}`
            </button>
          </div>
        </div>
      )}
    </div>
  );
}