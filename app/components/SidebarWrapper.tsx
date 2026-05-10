"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar, { type ActivePanel } from "./Sidebar";
import GeneratorDashboard from "./GeneratorDashboard";
import HistoryPanel from "./HistoryPanel";
import SettingsPanel from "./SettingsPanel";
import GuidePanel from "./GuidePanel";
import type { HistoryItem, GenerateResult } from "./GeneratorDashboard";


// ==============================================
// useHistory — localStorage hook
// ==============================================
function useHistory() {
  const MAX_HISTORY = 30;
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("flowfor_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[useHistory] Gagal memuat history:", err);
      }
    }
  }, []);

  const addHistoryItem = useCallback(
    (item: Omit<HistoryItem, "id" | "createdAt">) => {
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
        try {
          localStorage.setItem("flowfor_history", JSON.stringify(updated));
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("[useHistory] Gagal simpan history:", err);
          }
        }
        return updated;
      });
    },
    []
  );

  const updateHistoryItem = useCallback((id: string, result: GenerateResult) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, result } : item
      );
      try {
        localStorage.setItem("flowfor_history", JSON.stringify(updated));
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[useHistory] Gagal update history:", err);
        }
      }
      return updated;
    });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("flowfor_history", JSON.stringify(updated));
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[useHistory] Gagal hapus history:", err);
        }
      }
      return updated;
    });
  }, []);

  return { history, addHistoryItem, updateHistoryItem, deleteHistoryItem };
}

// ==============================================
// SIDEBAR WRAPPER
// ==============================================
export default function SidebarWrapper({ searchQuery = "" }: { searchQuery?: string }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("dashboard");
  const [selectedCampaign, setSelectedCampaign] = useState<GenerateResult | null>(null);
  // Track the history item ID that matches the currently selected campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const { history, addHistoryItem, updateHistoryItem, deleteHistoryItem } = useHistory();

  // When user clicks "Muat Ulang" from history → load result + switch to dashboard
  const handleLoadCampaign = useCallback((item: HistoryItem) => {
    setSelectedCampaign(item.result);
    setSelectedCampaignId(item.id);
    setActivePanel("dashboard");
  }, []);

  // When New Campaign is clicked → clear result + switch to dashboard
  const handleNewCampaign = useCallback(() => {
    setSelectedCampaign(null);
    setSelectedCampaignId(null);
    setActivePanel("dashboard");
  }, []);

  // Auto-switch to history panel when user types in search bar
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setActivePanel("history");
    }
  }, [searchQuery]);

  // Filtered history based on search query
  const filteredHistory = searchQuery.trim()
    ? history.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.targetAudience?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  // When GeneratorDashboard completes a generate → save to history
  const handleGenerateSuccess = useCallback(
    (data: GenerateResult, productName: string, targetAudience: string, contentType: string) => {
      // Remove old entry with same ID if exists (to avoid duplicates)
      if (selectedCampaignId) {
        deleteHistoryItem(selectedCampaignId);
      }
      addHistoryItem({
        productName,
        targetAudience,
        contentType,
        result: data,
      });
    },
    [history, selectedCampaignId, addHistoryItem, deleteHistoryItem]
  );

  // When CampaignAdvisor updates result (e.g. new vibe score) → update local state + history
  const handleResultUpdate = useCallback(
    (data: GenerateResult) => {
      // Update the in-memory selected campaign so UI stays in sync
      setSelectedCampaign(data);
      // Persist the updated result to history so it survives navigation
      if (selectedCampaignId) {
        updateHistoryItem(selectedCampaignId, data);
      }
    },
    [selectedCampaignId, updateHistoryItem]
  );

  const renderPanel = () => {
    switch (activePanel) {
      case "history":
        return (
          <HistoryPanel
            history={filteredHistory}
            searchQuery={searchQuery}
            onLoadCampaign={handleLoadCampaign}
            onDeleteCampaign={deleteHistoryItem}
            onBack={() => setActivePanel("dashboard")}
          />
        );
      case "settings":
        return (
          <SettingsPanel
            onBack={() => setActivePanel("dashboard")}
          />
        );
      case "guide":
        return <GuidePanel onBack={() => setActivePanel("dashboard")} />;
      case "dashboard":
      default:
        return (
          <GeneratorDashboard
            initialResult={selectedCampaign}
            onGenerateSuccess={handleGenerateSuccess}
            onResultUpdate={handleResultUpdate}
          />
        );
    }
  };

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} onNewCampaign={handleNewCampaign} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{renderPanel()}</main>
    </div>
  );
}
