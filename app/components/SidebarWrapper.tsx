"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar, { type ActivePanel } from "./Sidebar";
import GeneratorDashboard from "./GeneratorDashboard";
import HistoryPanel from "./HistoryPanel";
import SettingsPanel from "./SettingsPanel";
import type { HistoryItem, GenerateResult } from "./GeneratorDashboard";
import { useSettings } from "./SettingsContext";

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
        const updated = [newItem, ...prev].slice(0, 10);
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
export default function SidebarWrapper() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("dashboard");
  const [selectedCampaign, setSelectedCampaign] = useState<GenerateResult | null>(null);
  const { history, addHistoryItem, deleteHistoryItem } = useHistory();
  const { settings, updateSettings } = useSettings();

  // When user clicks "Muat Ulang" from history → load result + switch to dashboard
  const handleLoadCampaign = useCallback((item: HistoryItem) => {
    setSelectedCampaign(item.result);
    setActivePanel("dashboard");
  }, []);

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
            history={history}
            onLoadCampaign={handleLoadCampaign}
            onDeleteCampaign={deleteHistoryItem}
            onBack={() => setActivePanel("dashboard")}
          />
        );
      case "settings":
        return (
          <SettingsPanel
            onBack={() => setActivePanel("dashboard")}
            onSettingsChange={updateSettings}
          />
        );
      case "dashboard":
      default:
        return (
          <GeneratorDashboard
            initialResult={selectedCampaign}
            onGenerateSuccess={handleGenerateSuccess}
            settings={settings}
          />
        );
    }
  };

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{renderPanel()}</main>
    </div>
  );
}