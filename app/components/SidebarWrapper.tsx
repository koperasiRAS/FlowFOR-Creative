"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar, { type ActivePanel } from "./Sidebar";
import GeneratorDashboard from "./GeneratorDashboard";
import HistoryPanel from "./HistoryPanel";
import SettingsPanel from "./SettingsPanel";
import type { HistoryItem, GenerateResult } from "./GeneratorDashboard";


// ==============================================
// useHistory — localStorage hook
// ==============================================
function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("flowfor_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const addHistoryItem = useCallback(
    (item: Omit<HistoryItem, "id" | "createdAt">) => {
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 30);
        try {
          localStorage.setItem("flowfor_history", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("flowfor_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return { history, addHistoryItem, deleteHistoryItem };
}

// ==============================================
// SIDEBAR WRAPPER
// ==============================================
export default function SidebarWrapper({ searchQuery = "" }: { searchQuery?: string }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("dashboard");
  const [selectedCampaign, setSelectedCampaign] = useState<GenerateResult | null>(null);
  const { history, addHistoryItem, deleteHistoryItem } = useHistory();

  // When user clicks "Muat Ulang" from history → load result + switch to dashboard
  const handleLoadCampaign = useCallback((item: HistoryItem) => {
    setSelectedCampaign(item.result);
    setActivePanel("dashboard");
  }, []);

  // When New Campaign is clicked → clear result + switch to dashboard
  const handleNewCampaign = useCallback(() => {
    setSelectedCampaign(null);
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
      addHistoryItem({
        productName,
        targetAudience,
        contentType,
        result: data,
      });
    },
    [addHistoryItem]
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
      case "dashboard":
      default:
        return (
          <GeneratorDashboard
            initialResult={selectedCampaign}
            onGenerateSuccess={handleGenerateSuccess}
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
